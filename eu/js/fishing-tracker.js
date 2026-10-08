'use strict';

window.EntropiaFishingTracker=(function(){
  const KEY='entropia_fishing_tracker_v2';
  const FISH_NAMES_KEY='entropia_fishing_fish_names_v1';
  const FISH_CATALOG_UPDATED_KEY='entropia_fishing_fish_names_updated_v1';
  const BAITFISH_UNIT_PED=0.00001;
  const CATALOG_REFRESH_MS=24*60*60*1000;

  // Verified locally so these work immediately even before the API cache loads.
  const VERIFIED_FISH_NAMES=[
    'Juvenile Calypsocod'
  ];

  const receivedRx=/You received\s+(.+?)\s+x\s+\((\d+)\)\s+Value:\s*([\d,.]+)\s*PED/i;
  const receivedLooseRx=/You received\s+(.+?)\s+Value:\s*([\d,.]+)\s*PED/i;

  let state=load();
  let timer=null;
  let fishNames=loadFishNames();

  function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
  function fresh(){
    return {
      active:false,
      startedAt:null,
      activeMs:0,
      clicks:0,
      spend:0,
      receipts:[],
      baitfishQuantity:0,
      baitfishValue:0,
      fishQuantity:0,
      fishValue:0,
      scrapQuantity:0,
      scrapValue:0,
      value:0
    };
  }
  function normalize(raw){
    const base=fresh();
    if(!raw||typeof raw!=='object')return base;
    // Migrate v0.63's earlier catches array if present.
    const oldCatches=Array.isArray(raw.catches)?raw.catches:[];
    return {
      ...base,
      ...raw,
      receipts:Array.isArray(raw.receipts)?raw.receipts:oldCatches,
      baitfishQuantity:n(raw.baitfishQuantity),
      baitfishValue:n(raw.baitfishValue),
      fishQuantity:n(raw.fishQuantity??raw.quantity),
      fishValue:n(raw.fishValue??raw.value),
      scrapQuantity:n(raw.scrapQuantity),
      scrapValue:n(raw.scrapValue),
      value:n(raw.value)
    };
  }
  function load(){
    try{
      const current=JSON.parse(localStorage.getItem(KEY)||'null');
      if(current)return normalize(current);
      const legacy=JSON.parse(localStorage.getItem('entropia_fishing_tracker_v1')||'null');
      return normalize(legacy);
    }catch{return fresh()}
  }
  function save(){localStorage.setItem(KEY,JSON.stringify(state))}
  function loadFishNames(){
    const set=new Set(VERIFIED_FISH_NAMES.map(v=>v.toLowerCase()));
    try{
      const cached=JSON.parse(localStorage.getItem(FISH_NAMES_KEY)||'[]');
      if(Array.isArray(cached))cached.forEach(name=>{if(name)set.add(String(name).trim().toLowerCase())});
    }catch{}
    return set;
  }
  function saveFishNames(names){
    const clean=[...new Set((names||[]).map(v=>String(v||'').trim()).filter(Boolean))];
    localStorage.setItem(FISH_NAMES_KEY,JSON.stringify(clean));
    localStorage.setItem(FISH_CATALOG_UPDATED_KEY,String(Date.now()));
    fishNames=new Set([...VERIFIED_FISH_NAMES,...clean].map(v=>v.toLowerCase()));
  }

  function durationMs(){return n(state.activeMs)+(state.active&&state.startedAt?Math.max(0,Date.now()-state.startedAt):0)}
  function fmt(ms){
    const sec=Math.max(0,Math.floor(n(ms)/1000)),h=Math.floor(sec/3600),m=Math.floor((sec%3600)/60),s=sec%60;
    return [h,m,s].map(v=>String(v).padStart(2,'0')).join(':');
  }
  function setText(id,text){const el=document.getElementById(id);if(el)el.textContent=text}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function unwrapFishName(item){
    return String(item?.Name||item?.name||item?.Fish?.Name||item?.fish?.name||'').trim();
  }

  async function refreshFishCatalog(force=false){
    const updated=n(localStorage.getItem(FISH_CATALOG_UPDATED_KEY));
    if(!force&&fishNames.size>VERIFIED_FISH_NAMES.length&&Date.now()-updated<CATALOG_REFRESH_MS){
      render();return;
    }
    try{
      const result=await window.EntropiaNexus?.fetchCategory?.('fishes',{refresh:force});
      const names=(result?.items||[]).map(unwrapFishName).filter(Boolean);
      if(names.length)saveFishNames(names);
    }catch(err){
      console.warn('Fish catalog refresh unavailable; using cached/verified names.',err);
    }
    render();
  }

  function classifyReceivedItem(name){
    const clean=String(name||'').trim();
    const lower=clean.toLowerCase();
    if(!clean)return {isFishing:false,type:null,name:clean};
    if(lower==='baitfish')return {isFishing:true,type:'baitfish',name:clean};
    if(lower==='fish scrap')return {isFishing:true,type:'scrap',name:clean};
    if(fishNames.has(lower))return {isFishing:true,type:'fish',name:clean};
    return {isFishing:false,type:null,name:clean};
  }

  function chatEnvelope(line){
    const match=String(line||'').match(/^\s*(\d{4}-\d\d-\d\d)\s+(\d\d:\d\d:\d\d)\s+\[([^\]]+)\]\s*(?:\[([^\]]*)\]\s*)?(.*)$/);
    return match?{channel:String(match[3]||'').trim(),message:String(match[5]||'').trim()}:null;
  }

  function recordReceipt({name,quantity=1,loggedValue=0,at=Date.now(),sourceLine=''}) {
    const classification=classifyReceivedItem(name);
    if(!classification.isFishing)return false;

    const qty=Math.max(1,n(quantity)||1);
    let value=Math.max(0,n(loggedValue));
    if(classification.type==='baitfish')value=qty*BAITFISH_UNIT_PED;

    const row={
      id:`fish_${at}_${state.receipts.length+1}`,
      type:classification.type,
      name:String(name||classification.name||'').trim(),
      quantity:qty,
      loggedValue:Math.max(0,n(loggedValue)),
      value,
      at:n(at)||Date.now(),
      sourceLine
    };

    state.receipts.push(row);
    if(state.receipts.length>500)state.receipts=state.receipts.slice(-500);

    if(classification.type==='baitfish'){
      state.baitfishQuantity+=qty;
      state.baitfishValue+=value;
    }else if(classification.type==='scrap'){
      state.scrapQuantity+=qty;
      state.scrapValue+=value;
    }else{
      state.fishQuantity+=qty;
      state.fishValue+=value;
    }
    state.value+=value;
    save();render();

    window.dispatchEvent(new CustomEvent('fishing-catch-recorded',{detail:row}));
    return row;
  }

  function processLine(line,date=new Date()){
    if(!line||!String(line).trim())return false;
    const clean=String(line).trim();
    const env=chatEnvelope(clean);
    if(!env||env.channel.toLowerCase()!=='system')return false;

    const msg=env.message;
    let m=msg.match(receivedRx);
    let name,qty,value;
    if(m){
      name=m[1].trim();
      qty=parseInt(m[2],10)||1;
      value=n(String(m[3]||'0').replace(/,/g,''));
    }else{
      m=msg.match(receivedLooseRx);
      if(!m)return false;
      name=m[1].trim();
      qty=1;
      value=n(String(m[2]||'0').replace(/,/g,''));
    }

    const classification=classifyReceivedItem(name);
    if(!classification.isFishing)return false;

    const at=date instanceof Date&&!Number.isNaN(date.getTime())?date.getTime():Date.now();
    return !!recordReceipt({name,quantity:qty,loggedValue:value,at,sourceLine:clean});
  }

  function receiptCastKey(row){
    // chat.log only has one-second timestamp precision. Fish + Fish Scrap from
    // the same cast arrive with the same timestamp, so treat them as one
    // observed successful cast. This is explicitly a minimum, not actual casts.
    return String(Math.floor(n(row?.at)/1000));
  }

  function observedCastGroups(){
    const groups=new Map();
    for(const row of state.receipts||[]){
      const key=receiptCastKey(row);
      if(key==='0')continue;
      if(!groups.has(key))groups.set(key,[]);
      groups.get(key).push(row);
    }
    return [...groups.values()];
  }

  function observedSuccessfulCasts(){
    return observedCastGroups().length;
  }

  function equippedCostPerClick(){
    const economy=window.EntropiaFishingGear?.getEquippedEconomy?.();
    return economy?.valid?Math.max(0,n(economy.totalPED)):0;
  }

  function castMinimumCost(rows){
    // Baitfish can only come from the Baitfishing Rod, which has no ammo burn
    // and no decay. Never apply an equipped normal fishing setup to baitfishing.
    if((rows||[]).some(row=>row?.type==='baitfish'||String(row?.name||'').toLowerCase()==='baitfish')){
      return 0;
    }
    return equippedCostPerClick();
  }

  function estimatedMinimumCost(){
    return observedCastGroups().reduce((sum,rows)=>sum+castMinimumCost(rows),0);
  }

  function observedPaidCasts(){
    return observedCastGroups().filter(rows=>castMinimumCost(rows)>0).length;
  }

  function observedBaitfishCasts(){
    return observedCastGroups().filter(rows=>(rows||[]).some(row=>row?.type==='baitfish'||String(row?.name||'').toLowerCase()==='baitfish')).length;
  }

  function render(){
    setText('fishingDuration',fmt(durationMs()));
    const costPerClick=equippedCostPerClick();
    const casts=observedSuccessfulCasts();
    const paidCasts=observedPaidCasts();
    const baitCasts=observedBaitfishCasts();
    const minCost=estimatedMinimumCost();
    const minNet=n(state.value)-minCost;
    setText('fishingCostPerClick',`${costPerClick.toFixed(5)} PED`);
    setText('fishingObservedCasts',String(casts));
    setText('fishingMinCost',`${minCost.toFixed(5)} PED`);
    const minCostEl=document.getElementById('fishingMinCost');
    if(minCostEl){
      minCostEl.title=baitCasts
        ?`${baitCasts} baitfishing cast${baitCasts===1?'':'s'} counted at 0 PED; ${paidCasts} normal fishing cast${paidCasts===1?'':'s'} priced from the equipped setup.`
        :`${paidCasts} observed normal fishing cast${paidCasts===1?'':'s'} priced from the equipped setup.`;
    }
    setText('fishingCatchCount',String(state.receipts?.length||0));
    setText('fishingCatchValue',`${n(state.value).toFixed(5)} PED`);
    setText('fishingMinNet',`${minNet>=0?'+':''}${minNet.toFixed(5)} PED`);
    const netEl=document.getElementById('fishingMinNet');
    if(netEl){netEl.classList.toggle('success',minNet>=0);netEl.classList.toggle('danger-text',minNet<0)}
    window.EntropiaFishingGear?.render?.();
    setText('fishingCatalogCount',`${fishNames.size} names`);
    setText('fishingBaitfishQuantity',String(n(state.baitfishQuantity)));
    setText('fishingBaitfishValue',`${n(state.baitfishValue).toFixed(5)} PED`);
    setText('fishingFishQuantity',String(n(state.fishQuantity)));
    setText('fishingFishValue',`${n(state.fishValue).toFixed(5)} PED`);
    setText('fishingScrapQuantity',String(n(state.scrapQuantity)));
    setText('fishingScrapValue',`${n(state.scrapValue).toFixed(5)} PED`);

    const btn=document.getElementById('fishingStartBtn');
    if(btn)btn.textContent=state.active?'■ Stop Fishing':'▶ Start Fishing';

    const host=document.getElementById('fishingCatchList');
    if(host){
      host.innerHTML=(state.receipts||[]).slice().reverse().map(row=>{
        const typeLabel=row.type==='baitfish'?'Baitfishing':row.type==='scrap'?'Fish Scrap':'Fish';
        return `<div class="fishing-catch-row">
          <div><strong>${esc(row.name)}</strong><span>${typeLabel} · ${new Date(row.at||Date.now()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></div>
          <div>${n(row.quantity)} · ${n(row.value).toFixed(5)} PED</div>
        </div>`;
      }).join('')||'<div class="empty">No fishing receipts recorded yet.</div>';
    }
  }

  function start(){
    if(state.active)return;
    state.active=true;state.startedAt=Date.now();save();render();
    window.dispatchEvent(new CustomEvent('fishing-tracker-started',{detail:{startedAt:state.startedAt}}));
  }
  function stop(){
    if(!state.active)return;
    const stoppedAt=Date.now();
    state.activeMs+=Math.max(0,stoppedAt-(state.startedAt||stoppedAt));
    state.active=false;state.startedAt=null;save();render();
    window.dispatchEvent(new CustomEvent('fishing-tracker-stopped',{detail:{stoppedAt}}));
  }
  function toggle(){state.active?stop():start()}
  async function reset(){
    if(state.active||state.activeMs||state.receipts?.length){
      const ok=window.appConfirm?await window.appConfirm('Reset the current fishing activity?',{title:'Reset Fishing',confirmText:'Reset'}):confirm('Reset fishing activity?');
      if(!ok)return;
    }
    state=fresh();save();render();
  }

  function recordCatch(name,quantity=1,value=0,at=Date.now()){
    return recordReceipt({name,quantity,loggedValue:value,at});
  }

  function bind(){
    render();
    refreshFishCatalog(false);
    if(timer)clearInterval(timer);
    timer=setInterval(render,1000);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
  else bind();

  return {
    start,stop,toggle,reset,render,processLine,recordCatch,recordReceipt,
    classifyReceivedItem,refreshFishCatalog,
    getFishNames:()=>[...fishNames],
    getObservedSuccessfulCasts:observedSuccessfulCasts,
    getObservedBaitfishCasts:observedBaitfishCasts,
    getObservedPaidCasts:observedPaidCasts,
    getEstimatedMinimumCost:estimatedMinimumCost,
    getCostPerClick:equippedCostPerClick,
    getState:()=>JSON.parse(JSON.stringify(state))
  };
})();
