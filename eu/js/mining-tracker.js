'use strict';

window.EntropiaMiningTracker=(function(){
  const KEY='entropia_mining_tracker_v1';
  const RESOURCE_CACHE_KEY='entropia_mining_resource_catalog_v1';
  const RESOURCE_CACHE_UPDATED_KEY='entropia_mining_resource_catalog_updated_v1';
  const ENABLED_KEY='entropia_mining_tracking_enabled_v1';
  const CACHE_MS=24*60*60*1000;
  const claimRx=/You have claimed a resource!\s*\((.*)\)/i;
  const depletedRx=/This resource is depleted/i;
  const receivedRx=/You received\s+(.+?)\s+x\s+\((\d+)\)\s+Value:\s*([\d,.]+)\s*PED/i;
  const receivedLooseRx=/You received\s+(.+?)\s+Value:\s*([\d,.]+)\s*PED/i;

  let state=load();
  let resourceTypes=loadResourceTypes();

  function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function fresh(){return {claims:[],activeClaims:[],returns:[],returnValue:0,depleted:0,manualDrops:{enmatter:0,ore:0,both:0,treasure:0,all:0}}}
  function load(){
    try{
      const raw=JSON.parse(localStorage.getItem(KEY)||'null')||{};
      const base=fresh();
      return {...base,...raw,manualDrops:{...base.manualDrops,...(raw.manualDrops||{})}};
    }catch{return fresh()}
  }
  function save(){localStorage.setItem(KEY,JSON.stringify(state))}
  function isEnabled(){
    // Explicit opt-in. Missing key means disabled.
    return localStorage.getItem(ENABLED_KEY)==='1';
  }
  function setEnabled(enabled){
    localStorage.setItem(ENABLED_KEY,enabled?'1':'0');
    syncEnabledUi();
    render();
    window.showAppToast?.(`Mining Tracking ${enabled?'enabled':'disabled'}.`,enabled?'success':'info',1800);
  }
  function syncEnabledUi(){
    const input=document.getElementById('miningTrackingEnabled');
    if(input)input.checked=isEnabled();
    const stateEl=document.getElementById('miningTrackingState');
    if(stateEl){
      stateEl.textContent=isEnabled()?'Enabled':'Disabled';
      stateEl.classList.toggle('active',isEnabled());
    }
  }
  function loadResourceTypes(){
    const map=new Map([
      ['iron stone','ore'],
      ['lysterium stone','ore'],
      ['force nexus','enmatter'],
      ['crude oil','enmatter']
    ]);
    try{
      const rows=JSON.parse(localStorage.getItem(RESOURCE_CACHE_KEY)||'[]');
      if(Array.isArray(rows))for(const row of rows)if(row?.name&&row?.type)map.set(String(row.name).toLowerCase(),String(row.type).toLowerCase());
    }catch{}
    return map;
  }
  function classifyTypeText(type){
    const t=String(type||'').toLowerCase();
    if(t.includes('enmatter'))return 'enmatter';
    if(t.includes('ore')||t.includes('mineral')||t.includes('stone'))return 'ore';
    if(t.includes('treasure'))return 'treasure';
    return 'unknown';
  }
  async function refreshResourceCatalog(force=false){
    const updated=n(localStorage.getItem(RESOURCE_CACHE_UPDATED_KEY));
    if(!force&&resourceTypes.size>4&&Date.now()-updated<CACHE_MS){render();return}
    try{
      const r=await window.EntropiaNexus?.fetchCategory?.('materials',{refresh:force});
      const rows=[];
      for(const item of r?.items||[]){
        const name=String(item?.Name||item?.name||'').trim();
        const props=item?.Properties||item?.properties||{};
        const type=String(props.Type||props.type||item?.Type||item?.type||'').trim();
        const cls=classifyTypeText(type);
        if(name&&cls!=='unknown')rows.push({name,type:cls});
      }
      if(rows.length){
        localStorage.setItem(RESOURCE_CACHE_KEY,JSON.stringify(rows));
        localStorage.setItem(RESOURCE_CACHE_UPDATED_KEY,String(Date.now()));
        resourceTypes=loadResourceTypes();
      }
    }catch(err){
      console.warn('Mining resource catalog refresh unavailable; using cached resource types.',err);
    }
    render();
  }
  function classifyResource(name){
    const lower=String(name||'').trim().toLowerCase();
    if(resourceTypes.has(lower))return resourceTypes.get(lower);
    if(/\b(ore|stone|rock)\b/i.test(lower))return 'ore';
    return 'unknown';
  }
  function envelope(line){
    const m=String(line||'').match(/^\s*(\d{4}-\d\d-\d\d)\s+(\d\d:\d\d:\d\d)\s+\[([^\]]+)\]\s*(?:\[([^\]]*)\]\s*)?(.*)$/);
    return m?{channel:String(m[3]||'').trim(),message:String(m[5]||'').trim()}:null;
  }
  function claimCost(type){
    const e=window.EntropiaMiningGear?.getEquippedEconomy?.();
    if(!e?.valid)return 0;
    return type==='enmatter'?n(e.enmatter):type==='ore'?n(e.ore):type==='both'?n(e.both):type==='treasure'?n(e.treasure):type==='all'?n(e.all):0;
  }
  function manualDropCount(){
    return Object.values(state.manualDrops||{}).reduce((sum,v)=>sum+n(v),0);
  }
  function manualDropCost(){
    return Object.entries(state.manualDrops||{}).reduce((sum,[type,count])=>sum+(n(count)*claimCost(type)),0);
  }
  function observedClaimMinimumCost(){
    return (state.claims||[]).reduce((sum,row)=>sum+claimCost(row.type),0);
  }
  function searchMinimumCost(){
    // If the user has entered actual drop counts, those provide the better cost
    // basis because failed drops are invisible to chat.log. Otherwise fall back
    // to successful observed claims as the minimum possible search cost.
    return manualDropCount()>0?manualDropCost():observedClaimMinimumCost();
  }
  function observedExtractorUses(){
    return (state.returns||[]).length;
  }
  function observedExtractorCost(){
    return (state.returns||[]).reduce((sum,row)=>sum+Math.max(0,n(row?.extractorCost)),0);
  }
  function minimumCost(){
    return searchMinimumCost()+observedExtractorCost();
  }
  function countType(type){return (state.claims||[]).filter(x=>x.type===type).length}

  function parseReceived(msg,clean,at){
    let m=msg.match(receivedRx),name,qty,value;
    if(m){name=m[1].trim();qty=parseInt(m[2],10)||1;value=n(String(m[3]).replace(/,/g,''))}
    else{
      m=msg.match(receivedLooseRx);if(!m)return false;
      name=m[1].trim();qty=1;value=n(String(m[2]).replace(/,/g,''));
    }
    const idx=(state.activeClaims||[]).findIndex(c=>{
      const a=String(c.name||'').toLowerCase(),b=name.toLowerCase();
      return a===b||a.includes(b)||b.includes(a);
    });
    if(idx<0)return false;
    const claim=state.activeClaims[idx];
    const equippedEconomy=window.EntropiaMiningGear?.getEquippedEconomy?.();
    const extractorCost=equippedEconomy?.valid?Math.max(0,n(equippedEconomy.extractorDecay)):0;
    state.returns.push({
      name,quantity:qty,value,at,claimId:claim.id,
      extractorCost,
      extractorSetupId:equippedEconomy?.id||null,
      extractorSetupName:equippedEconomy?.name||''
    });
    state.returnValue=n(state.returnValue)+value;
    save();render();
    window.dispatchEvent(new CustomEvent('mining-return-recorded',{detail:{
      name,quantity:qty,value,at,type:claim.type,claimId:claim.id,
      extractorCost
    }}));
    return true;
  }

  function processLine(line,date=new Date()){
    if(!isEnabled())return false;
    if(!line||!String(line).trim())return false;
    const clean=String(line).trim(),env=envelope(clean);
    if(!env||env.channel.toLowerCase()!=='system')return false;
    const msg=env.message;
    const at=date instanceof Date&&!Number.isNaN(date.getTime())?date.getTime():Date.now();
    let m=msg.match(claimRx);
    if(m){
      const name=String(m[1]||'').trim();
      const type=classifyResource(name);
      const row={id:`claim_${at}_${state.claims.length+1}`,name,type,at};
      state.claims.push(row);state.activeClaims.push(row);save();render();
      window.dispatchEvent(new CustomEvent('mining-claim-recorded',{detail:{...row,minimumCost:claimCost(type)}}));
      return true;
    }
    if(depletedRx.test(msg)){state.depleted=n(state.depleted)+1;save();render();return true}
    if(parseReceived(msg,clean,at))return true;
    return false;
  }

  function render(){
    syncEnabledUi();
    const put=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};
    const searchCost=searchMinimumCost();
    const extractorUses=observedExtractorUses();
    const extractorCost=observedExtractorCost();
    const minCost=searchCost+extractorCost,ret=n(state.returnValue),net=ret-minCost;
    put('miningManualDropCount',String(manualDropCount()));
    put('miningClaimCount',String(state.claims.length));
    put('miningEnmatterClaims',String(countType('enmatter')));
    put('miningOreClaims',String(countType('ore')));
    put('miningUnknownClaims',String(countType('unknown')));
    put('miningReturnValue',`${ret.toFixed(5)} PED`);
    put('miningSearchMinimumCost',`${searchCost.toFixed(5)} PED`);
    put('miningExtractorUses',String(extractorUses));
    put('miningExtractorCost',`${extractorCost.toFixed(5)} PED`);
    put('miningMinimumCost',`${minCost.toFixed(5)} PED`);
    put('miningMinimumNet',`${net>=0?'+':''}${net.toFixed(5)} PED`);
    put('miningCatalogCount',`${resourceTypes.size} names`);
    const netEl=document.getElementById('miningMinimumNet');
    if(netEl){netEl.classList.toggle('success',net>=0);netEl.classList.toggle('danger-text',net<0)}
    window.EntropiaMiningGear?.render?.();
    const host=document.getElementById('miningClaimList');
    if(host){
      const manualRows=Object.entries(state.manualDrops||{}).filter(([,count])=>n(count)>0).map(([type,count])=>{
        const label=type==='ore'?'Minerals / Ore':type==='both'?'Both (EnMatter + Ore)':type==='all'?'All Three (EnMatter + Ore + Treasure)':type[0].toUpperCase()+type.slice(1);
        return `<div class="mining-claim-row manual"><div><strong>${esc(label)} Drops</strong><span>Manual attempt count</span></div><div><span>${n(count)} drops</span><b>${(n(count)*claimCost(type)).toFixed(5)} PED estimated</b></div></div>`;
      });
      const claimRows=[...state.claims].reverse().map(claim=>{
        const claimReturns=(state.returns||[]).filter(r=>r.claimId===claim.id);
        const value=claimReturns.reduce((sum,r)=>sum+n(r.value),0);
        const extractionCost=claimReturns.reduce((sum,r)=>sum+Math.max(0,n(r.extractorCost)),0);
        return `<div class="mining-claim-row"><div><strong>${esc(claim.name)}</strong><span>${esc(claim.type)} · ${new Date(claim.at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span></div><div><span>search min ${claimCost(claim.type).toFixed(5)} · extraction ${extractionCost.toFixed(5)} PED</span><b>${value.toFixed(5)} PED return · ${claimReturns.length} extraction${claimReturns.length===1?'':'s'}</b></div></div>`;
      });
      host.innerHTML=[...manualRows,...claimRows].join('')||'<div class="empty">No mining drops or claims recorded yet.</div>';
    }
  }

  function toggleManualDrops(){
    document.getElementById('miningManualDropsPanel')?.classList.toggle('hidden');
  }

  function manualInput(){
    const amount=Math.max(0,Math.floor(n(document.getElementById('miningManualDropAmount')?.value)));
    const type=document.getElementById('miningManualDropType')?.value||'enmatter';
    return {amount,type:['enmatter','ore','both','treasure','all'].includes(type)?type:'enmatter'};
  }

  function addManualDrops(){
    const {amount,type}=manualInput();
    if(amount<1){window.showAppToast?.('Enter at least 1 mining drop.','warning');return false}
    state.manualDrops=state.manualDrops||{enmatter:0,ore:0,both:0,treasure:0,all:0};
    state.manualDrops[type]=n(state.manualDrops[type])+amount;
    save();render();
    window.showAppToast?.(`Added ${amount} ${type==='ore'?'mineral / ore':type==='all'?'all-three':type} mining drop${amount===1?'':'s'}.`,'success',1800);
    return true;
  }

  function setManualDropTotal(){
    const {amount,type}=manualInput();
    state.manualDrops=state.manualDrops||{enmatter:0,ore:0,both:0,treasure:0,all:0};
    state.manualDrops[type]=amount;
    save();render();
    window.showAppToast?.(`Set ${type==='ore'?'mineral / ore':type==='all'?'all-three':type} drops to ${amount}.`,'info',1800);
    return true;
  }

  async function clearManualDrops(){
    if(manualDropCount()>0){
      const ok=window.appConfirm?await window.appConfirm(
        'Clear all manually entered mining drops? Observed claims and returns will stay.',
        {title:'Clear Manual Drops',confirmText:'Clear'}
      ):confirm('Clear manually entered mining drops?');
      if(!ok)return;
    }
    state.manualDrops={enmatter:0,ore:0,both:0,treasure:0,all:0};
    save();render();
  }

  async function reset(){
    if(state.claims.length||state.returns.length){
      const ok=window.appConfirm?await window.appConfirm('Reset the current mining activity?',{title:'Reset Mining',confirmText:'Reset'}):confirm('Reset mining activity?');
      if(!ok)return;
    }
    state=fresh();save();render();
  }

  function isMiningReceivedItem(name){
    if(!isEnabled())return false;
    const lower=String(name||'').trim().toLowerCase();
    return (state.activeClaims||[]).some(c=>{
      const a=String(c.name||'').toLowerCase();
      return a===lower||a.includes(lower)||lower.includes(a);
    });
  }

  function bind(){syncEnabledUi();render();refreshResourceCatalog(false)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();

  return {processLine,render,reset,setEnabled,isEnabled,toggleManualDrops,addManualDrops,setManualDropTotal,clearManualDrops,refreshResourceCatalog,classifyResource,isMiningReceivedItem,getMinimumCost:minimumCost,getSearchMinimumCost:searchMinimumCost,getObservedExtractorUses:observedExtractorUses,getObservedExtractorCost:observedExtractorCost,getManualDropCount:manualDropCount,getState:()=>JSON.parse(JSON.stringify(state))};
})();
