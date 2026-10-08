'use strict';

window.EntropiaSessionTracker=(function(){
  const CURRENT_KEY='entropia_activity_session_v1';
  const HISTORY_KEY='entropia_activity_session_history_v1';
  const PASSIVE_KEY='entropia_passive_session_tracking_v1';
  const MAX_HISTORY=40;

  const rx={
    inflicted:/You inflicted\s+([\d.]+)\s+points of damage/i,
    evade:/evaded your attack/i,
    dodge:/dodged your attack/i,
    miss:/You missed/i,
    took:/You took\s+([\d.]+)\s+points of damage/i,
    healed:/You healed(?:\s+\w+)?\s+([\d.]+)/i,
    death:/You were killed by/i,
    received:/You received\s+(.+?)\s+x\s+\((\d+)\)\s+Value:\s*([\d,.]+)\s*PED/i,
    receivedLoose:/You received\s+(.+?)\s+Value:\s*([\d,.]+)\s*PED/i,
    pickup:/Picked up\s+(.+?)\s+\((\d+)\)/i
  };

  let state=loadCurrent();
  let timer=null;

  function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
  function clone(v){return JSON.parse(JSON.stringify(v))}
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function fresh(){
    return {
      id:`session_${Date.now()}`,
      startedAt:null,
      lastActivityAt:null,
      savedAt:null,
      shots:0,
      damage:0,
      damageTaken:0,
      healing:0,
      deaths:0,
      spend:0,
      receivedValue:0,
      gathered:0,
      sweatQuantity:0,
      hunts:[],
      activeHuntId:null,
      fishing:{active:false,startedAt:null,activeMs:0,clicks:0,spend:0,catches:0,quantity:0,value:0},
      mining:{claims:0,returnValue:0},
      events:[]
    };
  }

  function normalize(raw){
    const base=fresh();
    if(!raw||typeof raw!=='object')return base;
    return {
      ...base,
      ...raw,
      hunts:Array.isArray(raw.hunts)?raw.hunts:[],
      events:Array.isArray(raw.events)?raw.events:[],
      fishing:{...base.fishing,...(raw.fishing||{})}
    };
  }

  function loadCurrent(){
    try{return normalize(JSON.parse(localStorage.getItem(CURRENT_KEY)||'null'))}
    catch{return fresh()}
  }

  function save(){
    localStorage.setItem(CURRENT_KEY,JSON.stringify(state));
  }

  function history(){
    try{
      const parsed=JSON.parse(localStorage.getItem(HISTORY_KEY)||'[]');
      return Array.isArray(parsed)?parsed:[];
    }catch{return []}
  }

  function passiveEnabled(){
    return localStorage.getItem(PASSIVE_KEY)==='1';
  }

  function setPassiveEnabled(enabled){
    localStorage.setItem(PASSIVE_KEY,enabled?'1':'0');
    syncSetting();
    render();
    window.showAppToast?.(`Passive Session Tracking ${enabled?'enabled':'disabled'}.`,enabled?'success':'info',1800);
  }

  function syncSetting(){
    const el=document.getElementById('passiveSessionTracking');
    if(el)el.checked=passiveEnabled();
  }

  function ensureStarted(at=Date.now(),reason='Activity'){
    if(!state.startedAt){
      state.startedAt=n(at)||Date.now();
      state.lastActivityAt=state.startedAt;
      state.events.push({type:'session-start',label:reason,at:state.startedAt});
      save();
    }
  }

  function validDateMs(date){
    const ms=date instanceof Date?date.getTime():new Date(date).getTime();
    return Number.isFinite(ms)?ms:Date.now();
  }

  function chatEnvelope(line){
    const match=String(line||'').match(/^\s*(\d{4}-\d\d-\d\d)\s+(\d\d:\d\d:\d\d)\s+\[([^\]]+)\]\s*(?:\[([^\]]*)\]\s*)?(.*)$/);
    return match?{channel:String(match[3]||'').trim(),speaker:String(match[4]||'').trim(),message:String(match[5]||'').trim()}:null;
  }

  function isSystem(env){return !!env&&env.channel.toLowerCase()==='system'}

  function currentShotCost(){
    const huntStatus=window.EntropiaHuntTracker?.getSession?.()?.status;
    if(huntStatus==='active'){
      return Math.max(0,n(window.EntropiaHuntTracker?.getCurrentShotCost?.()));
    }
    return Math.max(0,n(window.activeLoadout?.costPerShot));
  }

  function isHuntActive(){
    return window.EntropiaHuntTracker?.getSession?.()?.status==='active';
  }

  function shouldTrackRecognized(){
    return !!state.startedAt || passiveEnabled() || isHuntActive() || state.fishing.active;
  }

  function touch(at){
    state.lastActivityAt=at;
  }

  function addEvent(type,label,at,value=0){
    state.events.push({type,label,at,value});
    if(state.events.length>120)state.events=state.events.slice(-120);
  }

  function markShot(at,label){
    ensureStarted(at,'Hunting');
    state.shots++;
    state.spend+=currentShotCost();
    touch(at);
    addEvent('hunting',label,at);
  }

  function processLine(line,date=new Date()){
    if(!line||!String(line).trim())return false;
    const clean=String(line).trim();
    const at=validDateMs(date);
    const env=chatEnvelope(clean);
    const systemLine=isSystem(env);
    const msg=systemLine?env.message:clean;
    let m;

    const recognizedCombat=
      rx.inflicted.test(clean)||rx.evade.test(clean)||rx.dodge.test(clean)||rx.miss.test(clean)||
      rx.took.test(clean)||rx.death.test(clean)||(systemLine&&rx.healed.test(msg));
    const recognizedSystem=systemLine&&(rx.received.test(msg)||rx.receivedLoose.test(msg)||rx.pickup.test(msg));

    if(!recognizedCombat&&!recognizedSystem)return false;
    if(!shouldTrackRecognized())return false;

    if((m=clean.match(rx.inflicted))){
      markShot(at,'Hit');
      state.damage+=n(m[1]);
    }else if(rx.evade.test(clean)){
      markShot(at,'Evade');
    }else if(rx.dodge.test(clean)){
      markShot(at,'Dodge');
    }else if(rx.miss.test(clean)){
      markShot(at,'Miss');
    }else if((m=clean.match(rx.took))){
      ensureStarted(at,'Hunting');
      state.damageTaken+=n(m[1]);touch(at);addEvent('hunting','Damage Taken',at,n(m[1]));
    }else if(systemLine&&(m=msg.match(rx.healed))){
      ensureStarted(at,'Hunting');
      state.healing+=n(m[1]);touch(at);addEvent('hunting','Healing',at,n(m[1]));
    }else if(rx.death.test(clean)){
      ensureStarted(at,'Hunting');
      state.deaths++;touch(at);addEvent('hunting','Death',at);
    }else if(systemLine&&(m=msg.match(rx.received))){
      const name=String(m[1]||'').trim();
      const qty=Math.max(1,parseInt(m[2],10)||1);
      const value=n(String(m[3]||'0').replace(/,/g,''));
      const fishing=window.EntropiaFishingTracker?.classifyReceivedItem?.(name);
      if(fishing?.isFishing)return true; // Fishing tracker owns this receipt/value.
      ensureStarted(at,'Activity');
      if(!/^Universal Ammo$/i.test(name))state.receivedValue+=value;
      if(/Vibrant Sweat/i.test(name))state.sweatQuantity+=qty;
      touch(at);addEvent('received',`${name} × ${qty}`,at,value);
    }else if(systemLine&&(m=msg.match(rx.receivedLoose))){
      const name=String(m[1]||'').trim();
      const value=n(String(m[2]||'0').replace(/,/g,''));
      const fishing=window.EntropiaFishingTracker?.classifyReceivedItem?.(name);
      if(fishing?.isFishing)return true;
      ensureStarted(at,'Activity');
      if(!/^Universal Ammo$/i.test(name))state.receivedValue+=value;
      touch(at);addEvent('received',name,at,value);
    }else if(systemLine&&(m=msg.match(rx.pickup))){
      ensureStarted(at,'Gathering');
      state.gathered+=Math.max(1,parseInt(m[2],10)||1);
      touch(at);addEvent('gathered',String(m[1]||'Pickup').trim(),at);
    }

    save();render();
    return true;
  }

  function onHuntStarted(detail){
    const at=n(detail?.startedAt)||Date.now();
    ensureStarted(at,'Hunt');
    const id=detail?.id||`hunt_${at}`;
    state.activeHuntId=id;
    if(!state.hunts.some(h=>h.id===id)){
      state.hunts.push({
        id,
        name:detail?.name||'Hunt',
        target:detail?.target||'',
        startedAt:at,
        stoppedAt:null,
        metrics:null
      });
    }
    addEvent('hunt-start',detail?.name||'Hunt',at);
    save();render();
  }

  function onHuntStopped(detail){
    const id=detail?.id||state.activeHuntId;
    const row=state.hunts.find(h=>h.id===id);
    if(row){
      row.stoppedAt=n(detail?.stoppedAt)||Date.now();
      row.metrics=clone(detail?.metrics||{});
      row.name=detail?.name||row.name;
      row.target=detail?.target||row.target;
    }
    state.activeHuntId=null;
    touch(n(detail?.stoppedAt)||Date.now());
    addEvent('hunt-stop',detail?.name||'Hunt',state.lastActivityAt);
    save();render();
  }

  function fishingStarted(detail){
    const at=n(detail?.startedAt)||Date.now();
    ensureStarted(at,'Fishing');
    state.fishing.active=true;
    state.fishing.startedAt=at;
    touch(at);
    addEvent('fishing-start','Fishing',at);
    save();render();
  }

  function fishingStopped(detail){
    const at=n(detail?.stoppedAt)||Date.now();
    if(state.fishing.active&&state.fishing.startedAt){
      state.fishing.activeMs+=Math.max(0,at-state.fishing.startedAt);
    }
    state.fishing.active=false;
    state.fishing.startedAt=null;
    touch(at);
    addEvent('fishing-stop','Fishing',at);
    save();render();
  }

  function recordMiningClaim(row){
    const at=n(row?.at)||Date.now();
    ensureStarted(at,'Mining');
    state.mining=state.mining||{claims:0,returnValue:0};
    state.mining.claims=n(state.mining.claims)+1;
    touch(at);
    addEvent('mining-claim',`${row?.name||'Mining claim'} · ${row?.type||'unknown'}`,at,n(row?.minimumCost));
    save();render();
  }

  function recordMiningReturn(row){
    const at=n(row?.at)||Date.now();
    ensureStarted(at,'Mining');
    state.mining=state.mining||{claims:0,returnValue:0};
    state.mining.returnValue=n(state.mining.returnValue)+Math.max(0,n(row?.value));
    state.receivedValue=n(state.receivedValue)+Math.max(0,n(row?.value));
    touch(at);
    addEvent('mining-return',`${row?.name||'Mining return'} × ${Math.max(1,n(row?.quantity)||1)}`,at,n(row?.value));
    save();render();
  }

  function recordFishingCatch(catchRow){
    const at=n(catchRow?.at)||Date.now();
    ensureStarted(at,'Fishing');
    state.fishing.catches++;
    state.fishing.quantity+=Math.max(1,n(catchRow?.quantity)||1);
    state.fishing.value+=Math.max(0,n(catchRow?.value));
    state.receivedValue+=Math.max(0,n(catchRow?.value));
    touch(at);
    addEvent('fishing-catch',`${catchRow?.name||'Fish'} × ${Math.max(1,n(catchRow?.quantity)||1)}`,at,n(catchRow?.value));
    save();render();
  }

  function durationMs(){
    if(!state.startedAt)return 0;
    return Math.max(0,(state.lastActivityAt||Date.now())-state.startedAt);
  }

  function fishingDurationMs(){
    return n(state.fishing.activeMs)+(state.fishing.active&&state.fishing.startedAt?Math.max(0,Date.now()-state.fishing.startedAt):0);
  }

  function fmtDuration(ms){
    const sec=Math.max(0,Math.floor(n(ms)/1000));
    const h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
    return [h,m,s].map(v=>String(v).padStart(2,'0')).join(':');
  }

  function metrics(){
    const spend=n(state.spend),received=n(state.receivedValue),profit=received-spend;
    return {
      durationMs:durationMs(),
      spend,received,profit,
      returnPct:spend>0?(received/spend)*100:0,
      damage:n(state.damage),healing:n(state.healing),
      hunts:state.hunts.length,
      shots:n(state.shots),
      gathered:n(state.gathered)+n(state.sweatQuantity),
      fishingDurationMs:fishingDurationMs()
    };
  }

  function setText(id,text){
    const el=document.getElementById(id);if(el)el.textContent=text;
  }

  function renderSegments(){
    const host=document.getElementById('sessionSegmentsList');
    if(!host)return;
    const rows=[];
    for(const hunt of [...state.hunts].reverse()){
      const ended=hunt.stoppedAt?new Date(hunt.stoppedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}):'Active';
      const m=hunt.metrics||{};
      rows.push(`<div class="session-segment-row">
        <div><strong>${escapeHtml(hunt.name||'Hunt')}</strong><span>${escapeHtml(hunt.target||'No target')} · ${ended}</span></div>
        <div class="session-segment-metrics"><span>${n(m.cost).toFixed(2)} PED cost</span><span>${n(m.loot).toFixed(2)} PED loot</span><span>${n(m.profit).toFixed(2)} PED net</span></div>
      </div>`);
    }
    if(state.fishing.active||state.fishing.activeMs>0){
      rows.push(`<div class="session-segment-row">
        <div><strong>Fishing</strong><span>${state.fishing.active?'Active now':'Session activity'}</span></div>
        <div class="session-segment-metrics"><span>${fmtDuration(fishingDurationMs())}</span><span>${n(state.fishing.catches)} catches</span><span>${n(state.fishing.value).toFixed(2)} PED</span></div>
      </div>`);
    }
    host.innerHTML=rows.join('')||'<div class="empty">No session activity yet.</div>';
  }

  function renderHistory(){
    const host=document.getElementById('sessionHistoryList');
    if(!host)return;
    const rows=history().slice(0,6);
    host.innerHTML=rows.map(row=>{
      const spend=n(row.spend),received=n(row.receivedValue),profit=received-spend;
      return `<div class="session-history-row">
        <div><strong>${new Date(row.startedAt||row.savedAt||Date.now()).toLocaleString()}</strong><span>${row.hunts?.length||0} hunts · ${fmtDuration(row.durationMs||0)}</span></div>
        <div class="session-history-result ${profit>=0?'positive':'negative'}">${profit>=0?'+':''}${profit.toFixed(2)} PED</div>
      </div>`;
    }).join('')||'<div class="empty">No saved sessions yet.</div>';
  }

  function render(){
    syncSetting();
    const m=metrics();
    setText('sessionDuration',fmtDuration(m.durationMs));
    setText('sessionSpend',`${m.spend.toFixed(2)} PED`);
    setText('sessionLoot',`${m.received.toFixed(2)} PED`);
    setText('sessionProfit',`${m.profit>=0?'+':''}${m.profit.toFixed(2)} PED`);
    setText('sessionReturn',`${m.returnPct.toFixed(2)}%`);
    setText('sessionDamage',m.damage.toFixed(1));
    setText('sessionHealing',m.healing.toFixed(1));
    setText('sessionHuntCount',String(m.hunts));
    setText('sessionHuntingShots',String(m.shots));
    setText('sessionHuntingLoot',m.received.toFixed(2));
    setText('sessionGatheredCount',String(m.gathered));
    setText('sessionFishingDuration',fmtDuration(m.fishingDurationMs));
    setText('sessionFishingCatches',String(n(state.fishing.catches)));
    const fishingMinCost=n(window.EntropiaFishingTracker?.getEstimatedMinimumCost?.());
    setText('sessionFishingValue',`${n(state.fishing.value).toFixed(2)} PED · ≥${fishingMinCost.toFixed(2)} min cost`);
    setText('sessionHuntingState',state.activeHuntId?'Hunt active':m.shots||m.received?'Activity tracked':'No activity');
    setText('sessionFishingState',state.fishing.active?'Active':'Inactive');
    setText('sessionTrackingState',state.startedAt
      ?`${passiveEnabled()?'Passive enabled':'Explicit activity only'} · started ${new Date(state.startedAt).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`
      :`${passiveEnabled()?'Passive enabled · waiting for recognized activity':'Passive disabled · starting a hunt will begin a session'}`);
    const profit=document.getElementById('sessionProfit');
    if(profit){profit.classList.toggle('success',m.profit>=0);profit.classList.toggle('danger-text',m.profit<0)}
    renderSegments();renderHistory();
  }

  function saveCurrent(){
    if(!state.startedAt){
      window.showAppToast?.('There is no active session to save.','warning');return false;
    }
    const m=metrics();
    const record={...clone(state),durationMs:m.durationMs,savedAt:Date.now()};
    const list=history();
    list.unshift(record);
    localStorage.setItem(HISTORY_KEY,JSON.stringify(list.slice(0,MAX_HISTORY)));
    state.savedAt=Date.now();save();render();
    window.showAppToast?.('Session saved.','success',1800);
    return true;
  }

  async function newSession(){
    if(state.startedAt){
      const ok=window.appConfirm?await window.appConfirm(
        'Start a fresh overall session? The current session will be cleared unless you save it first.',
        {title:'New Session',confirmText:'Start New Session'}
      ):confirm('Start a fresh overall session?');
      if(!ok)return;
    }
    state=fresh();save();render();
    window.showAppToast?.('New session started fresh.','info',1800);
  }

  window.addEventListener('hunt-tracker-started',e=>onHuntStarted(e.detail||{}));
  window.addEventListener('hunt-tracker-stopped',e=>onHuntStopped(e.detail||{}));
  window.addEventListener('fishing-tracker-started',e=>fishingStarted(e.detail||{}));
  window.addEventListener('fishing-tracker-stopped',e=>fishingStopped(e.detail||{}));
  window.addEventListener('mining-claim-recorded',e=>recordMiningClaim(e.detail||{}));
  window.addEventListener('mining-return-recorded',e=>recordMiningReturn(e.detail||{}));
  window.addEventListener('fishing-catch-recorded',e=>recordFishingCatch(e.detail||{}));

  function bind(){
    syncSetting();render();
    if(timer)clearInterval(timer);
    timer=setInterval(render,1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
  else bind();

  return {
    processLine,render,saveCurrent,newSession,setPassiveEnabled,passiveEnabled,
    getSession:()=>clone(state),
    getMetrics:metrics,
    recordFishingCatch
  };
})();
