'use strict';

window.EntropiaFaps=(function(){
  const STORAGE_KEY='entropia_fap_settings_v1';
  const slots=['mainFap','secondaryFap'];
  const defaultState=()=>({
    enabled:false,
    mainFap:{key:'',name:'None',isHoT:false,hotPct:100},
    secondaryFap:{key:'',name:'None',isHoT:false,hotPct:100}
  });
  let state=loadState();
  let catalog=[];
  let loaded=false;
  const usage={mainFap:{lastUsed:0,cooldownMS:0},secondaryFap:{lastUsed:0,cooldownMS:0}};

  function n(v,d=0){const x=Number(v);return Number.isFinite(x)?x:d}
  function clamp(v,min,max){return Math.min(max,Math.max(min,n(v,min)))}
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function loadState(){
    try{
      const raw=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      const base=defaultState();
      if(!raw)return base;
      return {...base,...raw,mainFap:{...base.mainFap,...(raw.mainFap||{})},secondaryFap:{...base.secondaryFap,...(raw.secondaryFap||{})}};
    }catch{return defaultState()}
  }
  function saveState(){localStorage.setItem(STORAGE_KEY,JSON.stringify(state));}
  function itemKey(item){return item?`${item._endpoint||''}:${item.Id??item.id??item.Name??item.name??''}`:''}
  function itemName(item){return item?.Name||item?.name||'Unnamed FAP'}
  function findItem(slot){
    const sel=state[slot]||{};
    return catalog.find(x=>itemKey(x)===sel.key)||catalog.find(x=>itemName(x)===sel.name)||null;
  }
  function fapStats(slot){
    const selected=findItem(slot);
    const cfg=state[slot]||{};
    if(!selected)return {slot,name:'None',endpoint:'',isHoT:!!cfg.isHoT,hotPct:clamp(cfg.hotPct,0,100),decayPEC:0,ammoPEC:0,costPED:0,usesPerMin:0,baseMinHeal:0,baseMaxHeal:0,instantMinHeal:0,instantMaxHeal:0,hotMinHeal:0,hotMaxHeal:0,raw:null};
    const s=window.EntropiaNexus?.stats?.(selected)||{};
    const hotPct=clamp(cfg.hotPct,0,100);
    const hotMultiplier=cfg.isHoT?hotPct/100:0;
    const instantMultiplier=cfg.isHoT?1-hotMultiplier:1;
    const baseMin=n(s.minHeal),baseMax=n(s.maxHeal);
    const instantMin=baseMin*instantMultiplier,instantMax=baseMax*instantMultiplier;
    const hotMin=baseMin*hotMultiplier,hotMax=baseMax*hotMultiplier;
    const decay=n(s.decayPEC),ammo=n(s.ammoPEC);
    return {slot,name:itemName(selected),endpoint:selected._endpoint||'',isHoT:!!cfg.isHoT,hotPct,decayPEC:decay,ammoPEC:ammo,costPED:(decay+ammo)/100,usesPerMin:n(s.usesPerMinute),baseMinHeal:baseMin,baseMaxHeal:baseMax,instantMinHeal:instantMin,instantMaxHeal:instantMax,hotMinHeal:hotMin,hotMaxHeal:hotMax,raw:selected};
  }

  async function refreshCatalog(refresh=false){
    const status=document.getElementById('fapApiStatus');
    if(status)status.textContent='Loading Nexus…';
    try{
      const result=await window.EntropiaNexus.fetchCategory('faps',{refresh});
      catalog=(result.items||[]).filter(x=>itemName(x)).sort((a,b)=>itemName(a).localeCompare(itemName(b)));
      loaded=true;
      if(status){status.textContent=result.errors?.length?`Nexus · ${catalog.length} FAPs · partial`:`Nexus · ${catalog.length} FAPs`;status.classList.toggle('warning',!!result.errors?.length);}
      render();
      return catalog;
    }catch(err){
      console.warn('FAP catalog load failed',err);
      loaded=true;
      if(status){status.textContent='Nexus FAP load failed';status.classList.add('warning');}
      render();
      return [];
    }
  }

  function populateSelect(slot){
    const el=document.getElementById(`${slot}Select`);if(!el)return;
    const selected=state[slot]?.key||'';
    const groups={medicaltools:[],medicalchips:[],other:[]};
    for(const item of catalog){const ep=item._endpoint||'other';(groups[ep]||groups.other).push(item)}
    const options=['<option value="">None</option>'];
    const addGroup=(label,items)=>{if(!items.length)return;options.push(`<optgroup label="${label}">`);for(const item of items){const key=itemKey(item);options.push(`<option value="${escapeHtml(key)}"${key===selected?' selected':''}>${escapeHtml(itemName(item))}</option>`)}options.push('</optgroup>')};
    addGroup('Medical Tools',groups.medicaltools);addGroup('Medical Chips',groups.medicalchips);addGroup('Other',groups.other);
    el.innerHTML=options.join('');
    if(!selected&&state[slot]?.name&&state[slot].name!=='None'){
      const byName=catalog.find(x=>itemName(x)===state[slot].name);if(byName){state[slot].key=itemKey(byName);el.value=state[slot].key;saveState()}
    }
  }

  function renderCard(slot){
    const cfg=state[slot];
    const hot=document.getElementById(`${slot}IsHot`);if(hot)hot.checked=!!cfg.isHoT;
    const pct=document.getElementById(`${slot}HotPct`);if(pct)pct.value=String(clamp(cfg.hotPct,0,100));
    const wrap=document.getElementById(`${slot}HotPctWrap`);if(wrap)wrap.classList.toggle('hidden',!cfg.isHoT);
    const host=document.getElementById(`${slot}Stats`);if(!host)return;
    const f=fapStats(slot);
    if(f.name==='None'){host.innerHTML='<div class="empty fap-empty">No FAP selected.</div>';return}
    const minText=f.isHoT?`${f.baseMinHeal.toFixed(1)} <small>I ${f.instantMinHeal.toFixed(1)} · HoT ${f.hotMinHeal.toFixed(1)}</small>`:f.baseMinHeal.toFixed(1);
    const maxText=f.isHoT?`${f.baseMaxHeal.toFixed(1)} <small>I ${f.instantMaxHeal.toFixed(1)} · HoT ${f.hotMaxHeal.toFixed(1)}</small>`:f.baseMaxHeal.toFixed(1);
    host.innerHTML=`
      <div class="fap-stat wide"><span>FAP Name</span><b>${escapeHtml(f.name)}</b></div>
      <div class="fap-stat"><span>Decay</span><b>${(f.decayPEC/100).toFixed(5)} PED</b></div>
      <div class="fap-stat"><span>Cost / Use</span><b>${f.costPED.toFixed(5)} PED</b></div>
      <div class="fap-stat"><span>Min Heal</span><b>${minText}</b></div>
      <div class="fap-stat"><span>Max Heal</span><b>${maxText}</b></div>
      <div class="fap-stat"><span>Uses / Min</span><b>${f.usesPerMin.toFixed(1)}</b></div>
      <div class="fap-stat"><span>Source</span><b>${escapeHtml(f.endpoint==='medicalchips'?'Medical Chip':'Medical Tool')}</b></div>`;
  }

  function render(){
    const enabled=document.getElementById('fapTrackingEnabled');if(enabled)enabled.checked=!!state.enabled;
    slots.forEach(slot=>{populateSelect(slot);renderCard(slot)});
    renderLiveStats();
  }
  function setEnabled(value){state.enabled=!!value;saveState();resetUsage();render();window.showAppToast?.(`FAP heal tracking ${state.enabled?'enabled':'disabled'}.`,'info',1800)}
  function selectFap(slot,key){if(!slots.includes(slot))return;const item=catalog.find(x=>itemKey(x)===key)||null;state[slot].key=item?itemKey(item):'';state[slot].name=item?itemName(item):'None';saveState();resetUsage(slot);renderCard(slot)}
  function setHot(slot,value){if(!slots.includes(slot))return;state[slot].isHoT=!!value;saveState();resetUsage(slot);renderCard(slot)}
  function setHotPercent(slot,value){if(!slots.includes(slot))return;state[slot].hotPct=clamp(value,0,100);saveState();resetUsage(slot);renderCard(slot)}
  function resetUsage(slot=null){const targets=slot?[slot]:slots;for(const key of targets){usage[key].lastUsed=0;usage[key].cooldownMS=0}}

  // Faithful port of the old tracker matcher: match the incoming heal against
  // each selected FAP's instant-heal range, enforce Uses/Min cooldown, prefer
  // the slower eligible FAP if both can match, and do not charge another use
  // while a matching FAP is still inside its cooldown window.
  function classifyHeal(healAmount,atMs=Date.now()){
    const amount=n(healAmount);
    if(!state.enabled)return {enabled:false,matched:false,amount,costPED:0};
    const candidates=[];
    for(const slot of slots){
      const f=fapStats(slot);if(f.name==='None')continue;
      if(amount>=f.instantMinHeal&&amount<=f.instantMaxHeal){
        const tracker=usage[slot];
        const cooldownMS=(60/(f.usesPerMin||1))*1000;
        candidates.push({slot,fap:f,tracker,cooldownMS,cooldownExpired:(atMs-tracker.lastUsed)>=cooldownMS});
      }
    }
    if(!candidates.length)return {enabled:true,matched:false,amount,costPED:0};
    const newUses=candidates.filter(x=>x.cooldownExpired);
    if(newUses.length){
      newUses.sort((a,b)=>(b.cooldownMS||0)-(a.cooldownMS||0));
      const best=newUses[0];best.tracker.lastUsed=atMs;best.tracker.cooldownMS=best.cooldownMS;
      return {enabled:true,matched:true,newUse:true,cooldownActive:false,slot:best.slot,fap:best.fap,amount,costPED:best.fap.costPED,cooldownMS:best.cooldownMS};
    }
    candidates.sort((a,b)=>(b.fap.costPED||0)-(a.fap.costPED||0));
    const best=candidates[0];
    return {enabled:true,matched:true,newUse:false,cooldownActive:true,slot:best.slot,fap:best.fap,amount,costPED:0,cooldownMS:best.cooldownMS};
  }

  function renderLiveStats(session=window.EntropiaHuntTracker?.getSession?.()){
    const host=document.getElementById('fapLiveSummary');if(!host)return;
    const stats=session?.fapStats;
    if(!stats){host.innerHTML='<div class="empty">No FAP uses tracked in the current hunt.</div>';return}
    const rows=slots.map(slot=>({slot,...(stats[slot]||{})})).filter(x=>(x.uses||x.healEvents||x.healing||x.cost));
    if(!rows.length){host.innerHTML=`<div class="empty">${state.enabled?'Waiting for a heal that matches the selected FAP ranges.':'FAP tracking is disabled.'}</div>`;return}
    host.innerHTML=rows.map(row=>`<div class="fap-live-row"><div><b>${row.slot==='mainFap'?'Primary':'Secondary'} · ${escapeHtml(row.name||state[row.slot]?.name||'FAP')}</b><span>${row.healEvents||0} matched heal line${row.healEvents===1?'':'s'}</span></div><div><strong>${row.uses||0}</strong><span>uses</span></div><div><strong>${n(row.healing).toFixed(1)}</strong><span>HP</span></div><div><strong>${n(row.cost).toFixed(4)}</strong><span>PED</span></div></div>`).join('');
  }

  function getState(){return JSON.parse(JSON.stringify(state))}
  function getFap(slot){return fapStats(slot)}
  function init(){render();if(!loaded)refreshCatalog(false)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  return {refreshCatalog,render,setEnabled,selectFap,setHot,setHotPercent,resetUsage,classifyHeal,getState,getFap,renderLiveStats};
})();
