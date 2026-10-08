'use strict';

window.EntropiaMiningGear=(function(){
  const LIB_KEY='entropia_mining_gear_library_v1';
  const EQUIPPED_KEY='entropia_mining_gear_equipped_v1';
  const PROBE_TT_PED=0.05;
  const selectIds={finder:'miningFinderSelect',amp:'miningAmpSelect',extractor:'miningExtractorSelect'};
  let data={finder:[],amp:[],extractor:[]};
  let selected={finder:null,amp:null,extractor:null};
  let selectedId='';

  function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
  function clone(v){return JSON.parse(JSON.stringify(v))}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function props(i){return i?.Properties||i?.properties||{}}
  function econ(i){const p=props(i);return p.Economy||p.economy||i?.Economy||{}}
  function name(i){return String(i?.Name||i?.name||'').trim()}
  function id(i){return String(i?._nexusId||i?.Id||i?.id||name(i))}
  function decayPED(i){return n(econ(i).Decay??econ(i).decay)/100}
  function ammoBurn(i){return n(econ(i).AmmoBurn??econ(i).ammoBurn)}

  function library(){try{const p=JSON.parse(localStorage.getItem(LIB_KEY)||'[]');return Array.isArray(p)?p:[]}catch{return []}}
  function saveLibrary(rows){localStorage.setItem(LIB_KEY,JSON.stringify(rows))}
  function equippedId(){return localStorage.getItem(EQUIPPED_KEY)||''}
  function getEquipped(){return library().find(x=>x.id===equippedId())||null}

  function economy(setup){
    if(!setup?.finder)return {valid:false,reason:'Choose a finder.',probeBurn:0,finderDecay:0,ampDecay:0,enmatter:0,ore:0,treasure:0,extractorDecay:0};
    const probeBurn=ammoBurn(setup.finder);
    const finderDecay=decayPED(setup.finder);
    const ampDecay=decayPED(setup.amp);
    const baseDecay=finderDecay+ampDecay;
    return {
      valid:true,
      reason:'Mining setup ready.',
      probeBurn,
      finderDecay,
      ampDecay,
      extractorDecay:decayPED(setup.extractor),
      enmatter:baseDecay+(probeBurn*1*PROBE_TT_PED),
      ore:baseDecay+(probeBurn*2*PROBE_TT_PED),
      both:baseDecay+(probeBurn*3*PROBE_TT_PED),
      treasure:baseDecay+(probeBurn*3*PROBE_TT_PED),
      all:baseDecay+(probeBurn*6*PROBE_TT_PED)
    };
  }

  function renderSelect(slot){
    const el=document.getElementById(selectIds[slot]);if(!el)return;
    const current=selected[slot]?id(selected[slot]):'';
    el.innerHTML=`<option value="">${slot==='finder'?'Choose finder…':slot==='amp'?'No amplifier':'No extractor'}</option>`+
      data[slot].map(x=>`<option value="${esc(id(x))}"${id(x)===current?' selected':''}>${esc(name(x)||'Unnamed')}</option>`).join('');
  }

  function render(){
    for(const slot of ['finder','amp','extractor'])renderSelect(slot);
    const e=economy(selected);
    const put=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};
    put('miningFinderDecay',`${e.finderDecay.toFixed(5)} PED`);
    put('miningAmpDecay',`${e.ampDecay.toFixed(5)} PED`);
    put('miningEnmatterCost',`${e.enmatter.toFixed(5)} PED`);
    put('miningOreCost',`${e.ore.toFixed(5)} PED`);
    put('miningTreasureCost',`${e.treasure.toFixed(5)} PED`);
    const f=document.getElementById('miningFinderMeta');
    if(f)f.textContent=selected.finder?`${name(selected.finder)} · ammo burn ${e.probeBurn} probes · decay ${e.finderDecay.toFixed(5)} PED`:'Choose a finder.';
    const amp=document.getElementById('miningAmpMeta');
    if(amp)amp.textContent=selected.amp?`${name(selected.amp)} · decay ${e.ampDecay.toFixed(5)} PED / drop`:'Optional.';
    const ext=document.getElementById('miningExtractorMeta');
    if(ext)ext.textContent=selected.extractor?`${name(selected.extractor)} · decay ${e.extractorDecay.toFixed(5)} PED / use · not included in minimum search cost`:'Stored for reference; extraction cost is not inferred.';
    const val=document.getElementById('miningGearValidity');
    if(val){val.textContent=e.reason;val.classList.toggle('valid',e.valid);val.classList.toggle('invalid',!e.valid)}
    renderLibrary();
  }

  function renderLibrary(){
    const rows=library(),sel=document.getElementById('miningSetupSelect');
    if(sel)sel.innerHTML='<option value="">Select a saved mining setup…</option>'+rows.map(row=>`<option value="${esc(row.id)}"${row.id===selectedId?' selected':''}>${esc(row.name)}${row.id===equippedId()?' · Equipped':''}</option>`).join('');
    const eq=getEquipped(),label=document.getElementById('miningEquippedSetupLabel'),cost=document.getElementById('miningEquippedSetupCost');
    if(label)label.textContent=eq?.name||'None';
    if(cost){
      const e=eq?economy(eq.setup):null;
      cost.textContent=e?.valid?`EnMatter ${e.enmatter.toFixed(5)} · Ore ${e.ore.toFixed(5)} PED`:'No finder equipped';
    }
    const live=document.getElementById('miningEquippedLiveLabel');
    if(live){
      const e=eq?economy(eq.setup):null;
      live.textContent=e?.valid?`${eq.name} · E ${e.enmatter.toFixed(5)} / O ${e.ore.toFixed(5)} PED`:'No mining setup equipped';
    }
  }

  async function refreshData(force=false){
    const status=document.getElementById('miningGearApiState');if(status)status.textContent='Loading Nexus…';
    const requests=[
      ['finder','finders'],
      ['amp','finderamplifiers'],
      ['extractor','excavators']
    ];
    const settled=await Promise.allSettled(requests.map(async([slot,cat])=>{
      const r=await window.EntropiaNexus?.fetchCategory?.(cat,{refresh:force});
      return [slot,r?.items||[]];
    }));
    for(const r of settled)if(r.status==='fulfilled')data[r.value[0]]=r.value[1];
    if(status)status.textContent=settled.some(r=>r.status==='rejected')?'Nexus partial / cached':'Nexus API ready';
    render();
  }

  function changeSlot(slot,value){
    if(!Object.prototype.hasOwnProperty.call(selected,slot))return;
    selected[slot]=data[slot].find(x=>id(x)===String(value))||null;
    render();
  }
  function newSetup(){
    selectedId='';selected={finder:null,amp:null,extractor:null};
    const input=document.getElementById('miningSetupName');if(input)input.value='Mining Setup';
    render();
  }
  function selectSetup(idv){
    selectedId=String(idv||'');
    const row=library().find(x=>x.id===selectedId);if(!row)return;
    selected=clone(row.setup);
    const input=document.getElementById('miningSetupName');if(input)input.value=row.name;
    render();
  }
  function saveSetup(){
    const e=economy(selected);if(!e.valid){window.showAppToast?.(e.reason,'warning');return false}
    const namev=(document.getElementById('miningSetupName')?.value||'Mining Setup').trim()||'Mining Setup';
    const rows=library();
    if(selectedId){
      const idx=rows.findIndex(x=>x.id===selectedId);
      if(idx>=0)rows[idx]={...rows[idx],name:namev,setup:clone(selected),updatedAt:Date.now()};
    }else{
      selectedId=`mining_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      rows.push({id:selectedId,name:namev,setup:clone(selected),createdAt:Date.now(),updatedAt:Date.now()});
    }
    saveLibrary(rows);renderLibrary();window.showAppToast?.(`Saved mining setup: ${namev}`,'success');return true;
  }
  function equip(idv){
    const row=library().find(x=>x.id===String(idv||''));if(!row)return false;
    const e=economy(row.setup);if(!e.valid){window.showAppToast?.(e.reason,'warning');return false}
    localStorage.setItem(EQUIPPED_KEY,row.id);renderLibrary();
    window.dispatchEvent(new CustomEvent('mining-gear-equipped-changed',{detail:{setup:row,economy:e}}));
    window.showAppToast?.(`Mining setup equipped: ${row.name}`,'success');return true;
  }
  function equipSelected(){return equip(selectedId)}
  async function deleteSelected(){
    if(!selectedId)return;
    const row=library().find(x=>x.id===selectedId);if(!row)return;
    const ok=window.appConfirm?await window.appConfirm(`Delete "${row.name}"?`,{title:'Delete Mining Setup',confirmText:'Delete'}):confirm(`Delete "${row.name}"?`);
    if(!ok)return;
    saveLibrary(library().filter(x=>x.id!==selectedId));
    if(equippedId()===selectedId)localStorage.removeItem(EQUIPPED_KEY);
    newSetup();
  }
  function getEquippedEconomy(){
    const row=getEquipped();if(!row)return {valid:false,reason:'No mining setup equipped.',enmatter:0,ore:0,treasure:0};
    return {...economy(row.setup),id:row.id,name:row.name};
  }

  function bind(){newSetup();refreshData(false)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();

  return {refreshData,render,changeSlot,newSetup,selectSetup,saveSetup,equipSelected,deleteSelected,equip,getEquippedSetup:getEquipped,getEquippedEconomy,economy,probeTTPED:PROBE_TT_PED};
})();
