'use strict';

window.EntropiaMissions=(function(){
  const CUSTOM_KEY='pixelb8_eu_custom_missions_v1';
  const HIDDEN_KEY='pixelb8_eu_hidden_default_missions_v1';
  const COOLDOWN_KEY='entropia_mission_cooldowns';
  const FILTER_KEY='pixelb8_eu_mission_filters_v1';
  const ALERT_KEY='pixelb8_eu_mission_alerts_v1';
  const TTS_KEY='pixelb8_eu_mission_tts_v1';

  let defaults=[];
  let loaded=false;
  let timerHandle=null;
  const providerRegistry=new Map();
  let nexusMissionCache=[];

  function registerProvider(id,provider){
    if(!id||!provider)throw new TypeError('Mission provider id and provider are required');
    providerRegistry.set(String(id),provider);return provider;
  }
  function getProvider(id){return providerRegistry.get(String(id))||null;}
  registerProvider('local-repeatables',{
    kind:'repeatable',authoritative:true,
    load(){return Array.isArray(window.PixelB8DailyMissions)?window.PixelB8DailyMissions:[];}
  });
  registerProvider('nexus',{
    kind:'external',authoritative:false,
    async load(options={}){
      if(!window.EntropiaNexus?.fetchMissions)throw new Error('Entropia Nexus mission API adapter is unavailable');
      const result=await window.EntropiaNexus.fetchMissions(options);
      nexusMissionCache=Array.isArray(result?.items)?result.items:[];
      return result;
    }
  });

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const clean=v=>String(v??'').trim();

  function readJson(key,fallback){
    try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v;}catch{return fallback;}
  }
  function writeJson(key,value){try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
  function customMissions(){const v=readJson(CUSTOM_KEY,[]);return Array.isArray(v)?v:[];}
  function hiddenDefaults(){const v=readJson(HIDDEN_KEY,[]);return new Set(Array.isArray(v)?v.map(String):[]);}
  function cooldowns(){const v=readJson(COOLDOWN_KEY,{});return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}

  function missionKey(m){return `${m._custom?'custom':'default'}:${m.id}`;}
  function parseCooldown(text){
    const s=clean(text).toLowerCase();
    if(!s||s==='n/a'||s==='none')return 0;
    let ms=0,found=false;
    const patterns=[[/([0-9]+(?:\.[0-9]+)?)\s*d(?:ay)?s?/g,86400000],[/([0-9]+(?:\.[0-9]+)?)\s*h(?:our)?s?/g,3600000],[/([0-9]+(?:\.[0-9]+)?)\s*m(?:in(?:ute)?)?s?/g,60000]];
    for(const [re,mult] of patterns){let match;while((match=re.exec(s))){ms+=Number(match[1])*mult;found=true;}}
    return found?ms:0;
  }
  function formatRemaining(ms){
    if(ms<=0)return 'READY';
    const total=Math.ceil(ms/60000),d=Math.floor(total/1440),h=Math.floor((total%1440)/60),m=total%60;
    const out=[];if(d)out.push(`${d}d`);if(h||d)out.push(`${h}h`);out.push(`${m}m`);return out.join(' ');
  }
  function normalizePlanet(value){
    const raw=clean(value),k=raw.toLowerCase().replace(/[^a-z0-9]/g,'');
    const aliases={
      aris:'aris',planetaris:'aris',calypso:'calypso',planetcalypso:'calypso',foma:'foma',asteroidfoma:'foma',
      rocktropia:'rocktropia',planetrocktropia:'rocktropia',nextisland:'nextisland',toulan:'toulan',planettoulan:'toulan',
      arkadia:'arkadia',planetarkadia:'arkadia',cyrene:'cyrene',planetcyrene:'cyrene',setesh:'setesh',howlingmine:'howlingmine',
      crystalpalace:'crystalpalace',space:'space',monria:'monriadsec',dsec9:'monriadsec',monriadsec:'monriadsec'
    };
    return aliases[k]||k;
  }
  function planetMatch(a,b){return normalizePlanet(a)===normalizePlanet(b);}
  function mapPlanetName(value){
    const k=normalizePlanet(value);
    return ({aris:'ARIS',foma:'FOMA',rocktropia:'ROCKtropia',monriadsec:'Monria'})[k]||clean(value).replace(/^Planet\s+/i,'');
  }
  function parseWaypoint(wp){
    const m=clean(wp).match(/\/wp\s*\[\s*([^,]+),\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)?\s*,?\s*([^\]]*)\]/i);
    if(!m)return null;
    return {planet:clean(m[1]).replace(/^Planet\s+/i,''),x:Number(m[2]),y:Number(m[3]),z:Number(m[4]||0),label:clean(m[5])};
  }
  function currentMapPlanet(){return window.PixelB8Maps?.getViewingPlanet?.()||'';}
  function getAll(){
    const hidden=hiddenDefaults();
    const base=defaults.filter(m=>!hidden.has(String(m.id))).map(m=>({...m,_custom:false,_source:'local-repeatables'}));
    return base.concat(customMissions().map(m=>({...m,_custom:true,_source:'custom-local'})));
  }
  function getNexusMissions(){return nexusMissionCache.slice();}
  async function loadNexusMissions(options={}){return getProvider('nexus').load(options);}
  function missionAlerts(){
    const list=readJson(ALERT_KEY,[]);
    return Array.isArray(list)?list:[];
  }
  function writeMissionAlerts(list){writeJson(ALERT_KEY,(Array.isArray(list)?list:[]).slice(0,60));}
  function activeMissionAlerts(){return missionAlerts().filter(a=>!a.dismissed);}
  function formatAlertTime(ts){
    try{return new Date(Number(ts)||Date.now()).toLocaleString([], {month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});}catch{return '';}
  }
  function addMissionAlert(m){
    const list=missionAlerts();
    list.unshift({
      id:`a${Date.now()}-${String(m.id)}`,
      missionKey:missionKey(m),planet:clean(m.planet)||'Unknown',name:clean(m.name)||'Mission',
      type:'cooldown-ready',createdAt:Date.now(),dismissed:false
    });
    writeMissionAlerts(list);renderAlertHost();renderRecentAlerts();
  }
  function dismissAlert(id){
    const list=missionAlerts();const item=list.find(a=>a.id===String(id));if(item)item.dismissed=true;
    writeMissionAlerts(list);renderAlertHost();renderRecentAlerts();
  }
  function dismissAllAlerts(){
    writeMissionAlerts(missionAlerts().map(a=>({...a,dismissed:true})));renderAlertHost();renderRecentAlerts();
  }
  function clearAlertHistory(){
    writeMissionAlerts([]);renderAlertHost();renderRecentAlerts();
  }
  function renderAlertHost(){
    const host=document.getElementById('missionAlertHost');if(!host)return;
    host.innerHTML=activeMissionAlerts().map(a=>`<button class="mission-persistent-alert" onclick="EntropiaMissions.dismissAlert('${esc(a.id)}')" type="button" title="Click to dismiss">
      <span class="mission-alert-bell" aria-hidden="true">🔔</span>
      <span class="mission-alert-copy"><strong>${esc(a.planet)} — ${esc(a.name)}</strong><span>Cooldown finished · mission is ready</span></span>
      <span class="mission-alert-ok">OK</span>
    </button>`).join('');
  }
  function renderRecentAlerts(){
    const root=document.getElementById('missionRecentAlerts');if(!root)return;
    const list=missionAlerts();const active=list.filter(a=>!a.dismissed).length;
    const count=document.getElementById('missionAlertCount');if(count)count.textContent=String(active);
    const panel=document.getElementById('missionAlertsPanel');if(panel&&active)panel.open=true;
    root.innerHTML=list.length?list.slice(0,20).map(a=>`<div class="mission-alert-history-row${a.dismissed?' dismissed':''}">
      <span class="mission-alert-history-bell">🔔</span>
      <div><strong>${esc(a.planet)} — ${esc(a.name)}</strong><span>Cooldown finished · ${esc(formatAlertTime(a.createdAt))}</span></div>
      ${a.dismissed?'<span class="mission-alert-history-state">Dismissed</span>':`<button class="btn mission-mini" onclick="EntropiaMissions.dismissAlert('${esc(a.id)}')" type="button">Dismiss</button>`}
    </div>`).join(''):'<div class="empty mission-alert-history-empty">No mission alerts yet.</div>';
  }
  function ttsPrefs(){
    const raw=readJson(TTS_KEY,{});return {enabled:!!raw.enabled,ready:raw.ready!==false,started:raw.started!==false,completed:raw.completed!==false};
  }
  function saveTtsPrefs(next){writeJson(TTS_KEY,{...ttsPrefs(),...next});syncTtsSettings();}
  function voiceAnnouncerEnabled(){return localStorage.getItem('entropia_voice_enabled')==='true';}
  function speakMission(kind,m,force=false){
    const p=ttsPrefs();if(!force&&(!p.enabled||!p[kind]||!voiceAnnouncerEnabled()))return;
    if(!('speechSynthesis' in window))return;
    const planet=clean(m?.planet)||'Unknown planet',name=clean(m?.name)||'Mission';
    const text=kind==='ready'?`${planet}. ${name} cooldown finished. Mission is ready.`:
      kind==='started'?`${planet}. ${name} started.`:`${planet}. ${name} completed. Cooldown started.`;
    const u=new SpeechSynthesisUtterance(text);u.rate=1;u.pitch=1;speechSynthesis.speak(u);
  }
  function setMissionTtsEnabled(value){saveTtsPrefs({enabled:!!value});}
  function setMissionTtsEvent(kind,value){if(!['ready','started','completed'].includes(kind))return;saveTtsPrefs({[kind]:!!value});}
  function testMissionTts(kind){
    const samples={ready:{planet:'Calypso',name:'Daily Hunting Challenge'},started:{planet:'Calypso',name:'Daily Hunting Challenge'},completed:{planet:'Calypso',name:'Daily Hunting Challenge'}};
    speakMission(kind,samples[kind]||samples.ready,true);
  }
  function syncTtsSettings(){
    const p=ttsPrefs();
    const master=document.getElementById('missionTtsEnabled');if(master)master.checked=p.enabled;
    for(const kind of ['ready','started','completed']){const el=document.getElementById(`missionTts${kind[0].toUpperCase()+kind.slice(1)}`);if(el)el.checked=!!p[kind];}
    const note=document.getElementById('missionTtsVoiceNote');if(note)note.textContent=voiceAnnouncerEnabled()?'Voice Announcer is enabled.':'Voice Announcer is currently disabled above.';
  }
  function missionState(m,now=Date.now()){
    const store=cooldowns();
    const data=store[missionKey(m)]||store[String(m.id)]||null;
    const readyAt=Number(data?.readyAt||0);
    const inProgress=!!data?.inProgress;
    return {readyAt,remaining:Math.max(0,readyAt-now),cooling:readyAt>now,inProgress,ready:!inProgress&&readyAt<=now};
  }
  function writeMissionState(m,state){
    const store=cooldowns();store[missionKey(m)]={...state};delete store[String(m.id)];writeJson(COOLDOWN_KEY,store);
  }
  function startMission(key){
    const m=getAll().find(x=>missionKey(x)===String(key));if(!m)return;
    const duration=parseCooldown(m.cd),now=Date.now();
    if(String(m.type||'').toUpperCase()==='SOF')writeMissionState(m,{readyAt:0,inProgress:true,startedAt:now,durationMs:duration});
    else writeMissionState(m,{readyAt:now+duration,inProgress:false,startedAt:now,durationMs:duration});
    speakMission('started',m);
    renderAll();
  }
  function finishMission(key){
    const m=getAll().find(x=>missionKey(x)===String(key));if(!m)return;
    const duration=parseCooldown(m.cd),now=Date.now();
    writeMissionState(m,{readyAt:now+duration,inProgress:false,startedAt:now,durationMs:duration});speakMission('completed',m);renderAll();
  }
  function startCooldown(key){startMission(key);}
  function resetCooldown(key){
    const store=cooldowns();delete store[String(key)];
    const m=getAll().find(x=>missionKey(x)===String(key));if(m)delete store[String(m.id)];
    writeJson(COOLDOWN_KEY,store);renderAll();
  }
  function clearAllCooldowns(){writeJson(COOLDOWN_KEY,{});renderAll();window.showAppToast?.('All mission cooldowns cleared.','info');}
  async function deleteMission(key){
    const m=getAll().find(x=>missionKey(x)===String(key));if(!m)return;
    const message=m._custom
      ?`Delete custom mission “${m.name}” from this browser?`
      :`Hide default mission “${m.name}”? You can restore default missions later.`;
    const ok=window.appConfirm?await window.appConfirm(message,{title:'Remove Mission',confirmText:'Remove'}):confirm(message);
    if(!ok)return;
    const store=cooldowns();delete store[String(key)];delete store[String(m.id)];writeJson(COOLDOWN_KEY,store);
    if(m._custom){writeJson(CUSTOM_KEY,customMissions().filter(x=>String(x.id)!==String(m.id)));}
    else{const hidden=hiddenDefaults();hidden.add(String(m.id));writeJson(HIDDEN_KEY,[...hidden]);}
    renderAll();
  }
  function restoreDefaults(){writeJson(HIDDEN_KEY,[]);renderAll();window.showAppToast?.('Default missions restored.','success');}

  async function copyWaypoint(key){
    const m=getAll().find(x=>missionKey(x)===String(key));if(!m||!clean(m.wp))return;
    try{await navigator.clipboard.writeText(m.wp);window.showAppToast?.('Mission waypoint copied.','success');}catch{window.showAppToast?.('Could not copy waypoint.','error');}
  }
  function focusMission(key){
    const m=getAll().find(x=>missionKey(x)===String(key)),wp=m&&parseWaypoint(m.wp);if(!wp)return;
    const target=currentMapPlanet(),mapPlanet=mapPlanetName(wp.planet||m.planet);
    if(!planetMatch(target,mapPlanet))window.PixelB8Maps?.changeMap?.(mapPlanet,false);
    setTimeout(()=>window.PixelB8Maps?.centerCoordinate?.(mapPlanet,wp.x,wp.y),planetMatch(target,mapPlanet)?0:260);
  }

  function statusBadge(m){
    const st=missionState(m);
    if(st.inProgress)return '<span class="mission-status active">ACTIVE</span>';
    if(st.cooling)return `<span class="mission-status cooling" data-mission-countdown="${esc(missionKey(m))}">${esc(formatRemaining(st.remaining))}</span>`;
    return '<span class="mission-status ready">READY</span>';
  }
  function actionButtons(m,compact=false){
    const key=esc(missionKey(m)),st=missionState(m),wp=parseWaypoint(m.wp);
    let primary='';
    if(st.inProgress)primary=`<button class="btn primary mission-mini" onclick="EntropiaMissions.finishMission('${key}')" type="button">Finish</button>`;
    else if(st.cooling)primary=`<button class="btn mission-mini" onclick="EntropiaMissions.resetCooldown('${key}')" type="button">Reset</button>`;
    else primary=`<button class="btn primary mission-mini" onclick="EntropiaMissions.startMission('${key}')" type="button">Start</button>`;
    return `<div class="mission-actions">
      ${primary}
      ${clean(m.wp)?`<button class="btn mission-mini" onclick="EntropiaMissions.copyWaypoint('${key}')" type="button">Copy WP</button>`:''}
      ${wp&&compact?`<button class="btn mission-mini" onclick="EntropiaMissions.focusMission('${key}')" type="button">Map</button>`:''}
      ${compact?'':`<button class="btn danger-btn mission-mini" onclick="EntropiaMissions.deleteMission('${key}')" type="button">Remove</button>`}
    </div>`;
  }
  function missionCard(m,compact=false){
    return `<article class="mission-card${compact?' compact':''}">
      <div class="mission-card-head"><div><strong>${esc(m.name)}</strong><span>${esc(m.category||'Uncategorized')}</span></div>${statusBadge(m)}</div>
      <div class="mission-meta">
        <span>CD <b>${esc(m.cd||'—')}</b></span>${m.difficulty?`<span>Difficulty <b>${esc(m.difficulty)}</b></span>`:''}${m.reward?`<span>Reward <b>${esc(m.reward)}</b></span>`:''}
      </div>
      ${!compact&&m.wp?`<div class="mission-waypoint">${esc(m.wp)}</div>`:''}
      ${actionButtons(m,compact)}
    </article>`;
  }

  function renderMapRail(){
    const root=document.getElementById('mapMissionsRailContent');if(!root)return;
    const planet=currentMapPlanet();
    const q=clean(document.getElementById('mapMissionSearch')?.value).toLowerCase();
    const rows=getAll().filter(m=>planetMatch(m.planet,planet)&&(!q||`${m.name} ${m.category} ${m.reward}`.toLowerCase().includes(q)));
    const groups=new Map();for(const m of rows){const k=clean(m.category)||'Other';if(!groups.has(k))groups.set(k,[]);groups.get(k).push(m);}
    document.getElementById('mapMissionPlanetLabel')?.replaceChildren(document.createTextNode(planet||'Current map'));
    const html=[...groups.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([cat,items])=>`<details class="map-location-section map-mission-group">
      <summary><span class="map-location-summary-main"><span>${esc(cat)}</span></span><span class="map-location-count">${items.length}</span></summary>
      <div class="map-mission-list">${items.sort((a,b)=>a.name.localeCompare(b.name)).map(m=>missionCard(m,true)).join('')}</div>
    </details>`).join('');
    root.innerHTML=html||`<div class="map-location-empty">No repeatable missions listed for ${esc(planet||'this map')}.</div>`;
  }

  function getFilters(){
    const stored=readJson(FILTER_KEY,{});
    return {planet:clean(document.getElementById('missionPlanetFilter')?.value||stored.planet||'all'),status:clean(document.getElementById('missionStatusFilter')?.value||stored.status||'all'),q:clean(document.getElementById('missionSearch')?.value||'')};
  }
  function saveFilters(f){writeJson(FILTER_KEY,{planet:f.planet,status:f.status});}
  function populatePlanetFilter(){
    const sel=document.getElementById('missionPlanetFilter');if(!sel)return;
    const current=sel.value||readJson(FILTER_KEY,{}).planet||'all';
    const planets=[...new Set(getAll().map(m=>clean(m.planet)).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
    sel.innerHTML='<option value="all">All planets</option>'+planets.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');
    sel.value=planets.includes(current)||current==='all'?current:'all';
  }
  function renderMain(){
    const root=document.getElementById('missionPlanetGroups');if(!root)return;
    populatePlanetFilter();
    const f=getFilters();saveFilters(f);
    const now=Date.now();
    let rows=getAll().filter(m=>{
      const st=missionState(m,now);
      if(f.planet!=='all'&&!planetMatch(m.planet,f.planet))return false;
      if(f.status==='ready'&&!st.ready)return false;
      if(f.status==='cooldown'&&!st.cooling)return false;
      if(f.q&&!`${m.name} ${m.planet} ${m.category} ${m.reward} ${m.difficulty}`.toLowerCase().includes(f.q.toLowerCase()))return false;
      return true;
    });
    const total=getAll(),cooling=total.filter(m=>missionState(m,now).cooling).length,inProgress=total.filter(m=>missionState(m,now).inProgress).length;
    document.getElementById('missionTotalCount').textContent=String(total.length);
    document.getElementById('missionReadyCount').textContent=String(total.length-cooling-inProgress);
    document.getElementById('missionCooldownCount').textContent=String(cooling);
    document.getElementById('missionCustomCount').textContent=String(customMissions().length);

    const planets=new Map();
    for(const m of rows){const p=clean(m.planet)||'Other';if(!planets.has(p))planets.set(p,new Map());const cats=planets.get(p),c=clean(m.category)||'Other';if(!cats.has(c))cats.set(c,[]);cats.get(c).push(m);}
    root.innerHTML=[...planets.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([planet,cats])=>`<details class="mission-planet-group" ${f.planet==='all'?'':'open'}>
      <summary><strong>${esc(planet)}</strong><span>${[...cats.values()].reduce((n,a)=>n+a.length,0)}</span></summary>
      <div class="mission-category-groups">${[...cats.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([cat,items])=>`<details class="mission-category-group">
        <summary><span>${esc(cat)}</span><span>${items.length}</span></summary><div class="mission-card-grid">${items.sort((a,b)=>a.name.localeCompare(b.name)).map(m=>missionCard(m,false)).join('')}</div>
      </details>`).join('')}</div>
    </details>`).join('')||'<div class="empty mission-empty">No missions match the current filters.</div>';
  }

  function renderAll(){renderMain();renderMapRail();renderAlertHost();renderRecentAlerts();syncTtsSettings();updateCountdownText();}
  function switchMapRailTab(tab){
    const active=tab==='missions'?'missions':'locations';
    document.getElementById('mapLocationsPane')?.classList.toggle('hidden',active!=='locations');
    document.getElementById('mapMissionsPane')?.classList.toggle('hidden',active!=='missions');
    document.getElementById('mapRailLocationsBtn')?.classList.toggle('active',active==='locations');
    document.getElementById('mapRailMissionsBtn')?.classList.toggle('active',active==='missions');
    if(active==='missions')renderMapRail();
  }
  function updateCountdownText(){
    const now=Date.now(),all=getAll();let changed=false;
    for(const m of all){
      const st=missionState(m,now);
      if(st.readyAt>0&&st.readyAt<=now){
        const store=cooldowns();delete store[missionKey(m)];delete store[String(m.id)];writeJson(COOLDOWN_KEY,store);
        changed=true;
        window.PixelB8Audio?.play?.('mission-done');
        addMissionAlert(m);
        speakMission('ready',m);
      }
    }
    if(changed){renderAll();return;}
    document.querySelectorAll('[data-mission-countdown]').forEach(el=>{
      const m=all.find(x=>missionKey(x)===el.dataset.missionCountdown);if(!m)return;
      const st=missionState(m,now);el.textContent=st.cooling?formatRemaining(st.remaining):'READY';
      el.classList.toggle('cooling',st.cooling);el.classList.toggle('ready',!st.cooling);
    });
  }

  function toggleAddForm(force){
    const panel=document.getElementById('missionAddPanel');if(!panel)return;
    const show=force==null?panel.classList.contains('hidden'):!!force;panel.classList.toggle('hidden',!show);
  }
  function addCustomMission(){
    const name=clean(document.getElementById('missionAddName')?.value),planet=clean(document.getElementById('missionAddPlanet')?.value);
    if(!name||!planet){window.showAppToast?.('Mission name and planet are required.','error');return;}
    const d=Math.max(0,Number(document.getElementById('missionAddDays')?.value||0)),h=Math.max(0,Number(document.getElementById('missionAddHours')?.value||0)),min=Math.max(0,Number(document.getElementById('missionAddMinutes')?.value||0));
    const parts=[];if(d)parts.push(`${d}d`);if(h)parts.push(`${h}h`);if(min)parts.push(`${min}m`);if(!parts.length)parts.push('0h');
    const mission={
      id:`u${Date.now()}`,planet,category:clean(document.getElementById('missionAddCategory')?.value)||'Custom',name,cd:parts.join(', '),
      type:document.getElementById('missionAddType')?.value||'SOR',reward:clean(document.getElementById('missionAddReward')?.value),wp:clean(document.getElementById('missionAddWaypoint')?.value),difficulty:clean(document.getElementById('missionAddDifficulty')?.value)||'Custom'
    };
    const custom=customMissions();custom.push(mission);writeJson(CUSTOM_KEY,custom);
    ['missionAddName','missionAddCategory','missionAddReward','missionAddWaypoint'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
    toggleAddForm(false);renderAll();window.showAppToast?.('Custom repeatable mission added.','success');
  }

  function load(){
    if(loaded)return;
    const provider=getProvider('local-repeatables');
    defaults=provider?.load?.()||[];
    if(!Array.isArray(defaults))defaults=[];
    if(!defaults.length){
      console.warn('Local repeatable mission catalog is empty. Expected data/dailymissions.js to load before missions.js.');
      const main=document.getElementById('missionPlanetGroups');
      if(main)main.innerHTML='<div class="empty mission-empty">Local repeatable mission catalog did not load. Check eu/data/dailymissions.js.</div>';
      const rail=document.getElementById('mapMissionsRailContent');
      if(rail)rail.innerHTML='<div class="map-location-empty">Local mission catalog did not load.</div>';
    }
    loaded=true;renderAll();
    if(!timerHandle)timerHandle=setInterval(()=>{updateCountdownText();},1000);
  }
  function render(){load();renderAll();}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{load();renderAlertHost();renderRecentAlerts();syncTtsSettings();});else{load();renderAlertHost();renderRecentAlerts();syncTtsSettings();}

  return {render,renderAll,renderMain,renderMapRail,switchMapRailTab,startMission,finishMission,startCooldown,resetCooldown,clearAllCooldowns,deleteMission,restoreDefaults,copyWaypoint,focusMission,toggleAddForm,addCustomMission,getAll,getNexusMissions,loadNexusMissions,registerProvider,getProvider,parseCooldown,missionState,dismissAlert,dismissAllAlerts,clearAlertHistory,renderAlertHost,renderRecentAlerts,setMissionTtsEnabled,setMissionTtsEvent,testMissionTts,syncTtsSettings};
})();
