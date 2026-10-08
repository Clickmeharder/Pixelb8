'use strict';

window.EntropiaFishingGear=(function(){
  const LIB_KEY='entropia_fishing_gear_library_v1';
  const EQUIPPED_KEY='entropia_fishing_gear_equipped_v1';
  const SPOOL_CELL_TT_PED=0.0001;
  const slots=['rod','reel','blank','line','lure'];
  const categories={
    rod:'fishingrods',
    reel:'fishingreels',
    blank:'fishingblanks',
    line:'fishinglines',
    lure:'fishinglures'
  };
  const selectIds={
    rod:'fishingRodSelect',
    reel:'fishingReelSelect',
    blank:'fishingBlankSelect',
    line:'fishingLineSelect',
    lure:'fishingLureSelect'
  };

  let data={rod:[],reel:[],blank:[],line:[],lure:[]};
  let selected={rod:null,reel:null,blank:null,line:null,lure:null};
  let selectedLibraryId='';

  function n(v){const x=Number(v);return Number.isFinite(x)?x:0}
  function clone(v){return JSON.parse(JSON.stringify(v))}
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

  function library(){
    try{const p=JSON.parse(localStorage.getItem(LIB_KEY)||'[]');return Array.isArray(p)?p:[]}
    catch{return []}
  }
  function saveLibrary(rows){localStorage.setItem(LIB_KEY,JSON.stringify(rows))}
  function equippedId(){return localStorage.getItem(EQUIPPED_KEY)||''}
  function getEquipped(){return library().find(x=>x.id===equippedId())||null}

  function props(item){return item?.Properties||item?.properties||{}}
  function econ(item){const p=props(item);return p.Economy||p.economy||item?.Economy||{}}
  function itemName(item){return String(item?.Name||item?.name||'').trim()}
  function itemId(item){return String(item?._nexusId||item?.Id||item?.id||itemName(item))}
  function decayPEC(item){return n(econ(item).Decay??econ(item).decay??econ(item).DecayPerUse)}
  function ammoBurn(item){return n(econ(item).AmmoBurn??econ(item).ammoBurn)}
  function rodType(item){const p=props(item);return String(p.RodType??p['Rod Type']??p.rodType??'').trim()}
  function fitsRod(item){const p=props(item);return String(p.FitsRod??p['Fits Rod']??p.fitsRod??'').trim()}

  function baitRod(){
    return {
      Name:'Baitfishing Rod',
      _nexusId:'pixelb8-baitfishing-rod',
      _endpoint:'builtin',
      Properties:{
        RodType:'Baitfishing',
        Economy:{Decay:0,AmmoBurn:0}
      },
      _pixelb8BaitRod:true
    };
  }
  function isBaitRod(item){return !!item&&(item._pixelb8BaitRod||itemName(item).toLowerCase()==='baitfishing rod')}

  function attachmentCompatible(rod,item){
    if(!rod||!item||isBaitRod(rod))return true;
    const fit=fitsRod(item).toLowerCase();
    if(!fit)return true;
    const type=rodType(rod).toLowerCase();
    // Nexus currently exposes broad attachment fit classes such as Regular.
    // If the API gives a fit value, apply it conservatively.
    if(fit==='regular'){
      return !/deep|ocean|fly/.test(type);
    }
    return type.includes(fit)||fit.includes(type);
  }

  function costOfSetup(setup){
    if(!setup?.rod)return {valid:false,reason:'Choose a rod.',totalPED:0,spoolBurn:0,spoolPED:0,rodDecayPED:0,attachmentDecayPED:0};
    if(isBaitRod(setup.rod)){
      return {valid:true,bait:true,reason:'Baitfishing Rod uses no ammo and has no decay.',totalPED:0,spoolBurn:0,spoolPED:0,rodDecayPED:0,attachmentDecayPED:0};
    }
    const missing=['reel','blank','line','lure'].filter(k=>!setup[k]);
    if(missing.length){
      return {valid:false,reason:`Normal fishing rods require all four attachment slots. Missing: ${missing.join(', ')}.`,totalPED:0,spoolBurn:ammoBurn(setup.rod),spoolPED:ammoBurn(setup.rod)*SPOOL_CELL_TT_PED,rodDecayPED:decayPEC(setup.rod)/100,attachmentDecayPED:0};
    }
    const incompatible=['reel','blank','line','lure'].filter(k=>!attachmentCompatible(setup.rod,setup[k]));
    if(incompatible.length){
      return {valid:false,reason:`One or more attachments do not match this rod type: ${incompatible.join(', ')}.`,totalPED:0,spoolBurn:ammoBurn(setup.rod),spoolPED:ammoBurn(setup.rod)*SPOOL_CELL_TT_PED,rodDecayPED:decayPEC(setup.rod)/100,attachmentDecayPED:0};
    }
    const spoolBurn=ammoBurn(setup.rod);
    const spoolPED=spoolBurn*SPOOL_CELL_TT_PED;
    const rodDecayPED=decayPEC(setup.rod)/100;
    const attachmentDecayPED=['reel','blank','line','lure'].reduce((sum,k)=>sum+(decayPEC(setup[k])/100),0);
    return {valid:true,bait:false,reason:'Complete fishing setup.',spoolBurn,spoolPED,rodDecayPED,attachmentDecayPED,totalPED:spoolPED+rodDecayPED+attachmentDecayPED};
  }

  function currentSetup(){return {...selected}}
  function selectedById(slot,id){
    if(slot==='rod'&&id==='pixelb8-baitfishing-rod')return baitRod();
    return data[slot].find(x=>itemId(x)===String(id))||null;
  }

  function renderSelect(slot){
    const el=document.getElementById(selectIds[slot]);if(!el)return;
    const current=selected[slot]?itemId(selected[slot]):'';
    let items=[...data[slot]];
    if(slot==='rod')items=[baitRod(),...items.filter(x=>itemName(x).toLowerCase()!=='baitfishing rod')];
    if(slot!=='rod'&&selected.rod&&!isBaitRod(selected.rod)){
      items=items.filter(x=>attachmentCompatible(selected.rod,x));
    }
    el.disabled=slot!=='rod'&&isBaitRod(selected.rod);
    el.innerHTML=`<option value="">${slot==='rod'?'Choose rod…':`Choose ${slot}…`}</option>`+
      items.map(x=>`<option value="${esc(itemId(x))}"${itemId(x)===current?' selected':''}>${esc(itemName(x)||'Unnamed')}</option>`).join('');
    if(current&&!items.some(x=>itemId(x)===current)){
      selected[slot]=null;
      el.value='';
    }
  }

  function renderMeta(){
    const rod=selected.rod;
    const rodMeta=document.getElementById('fishingRodMeta');
    if(rodMeta){
      rodMeta.textContent=rod
        ?`${rodType(rod)||'Fishing'} · decay ${decayPEC(rod).toFixed(4)} PEC · ammo burn ${ammoBurn(rod)} Spool Cells`
        :'Choose a fishing rod.';
    }
    for(const slot of ['reel','blank','line','lure']){
      const el=document.getElementById(`fishing${slot[0].toUpperCase()+slot.slice(1)}Meta`);
      if(!el)continue;
      const item=selected[slot];
      el.textContent=item?`Decay ${decayPEC(item).toFixed(4)} PEC / click${fitsRod(item)?` · Fits ${fitsRod(item)}`:''}`:(isBaitRod(rod)?'Not used by Baitfishing Rod.':'Required for normal rods.');
    }
  }

  function renderEconomy(){
    const cost=costOfSetup(currentSetup());
    const put=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};
    put('fishingSpoolCellValue',`${SPOOL_CELL_TT_PED.toFixed(5)} PED`);
    put('fishingSpoolBurn',String(cost.spoolBurn||0));
    put('fishingSpoolCost',`${n(cost.spoolPED).toFixed(5)} PED`);
    put('fishingRodDecayCost',`${n(cost.rodDecayPED).toFixed(5)} PED`);
    put('fishingAttachmentDecayCost',`${n(cost.attachmentDecayPED).toFixed(5)} PED`);
    put('fishingTotalClickCost',`${n(cost.totalPED).toFixed(5)} PED`);
    const validity=document.getElementById('fishingGearValidity');
    if(validity){
      validity.textContent=cost.reason;
      validity.classList.toggle('valid',!!cost.valid);
      validity.classList.toggle('invalid',!cost.valid);
    }
  }

  function renderLibrary(){
    const rows=library(),select=document.getElementById('fishingSetupSelect');
    if(select){
      const equip=equippedId();
      select.innerHTML='<option value="">Select a saved fishing setup…</option>'+rows.map(row=>`<option value="${esc(row.id)}"${row.id===selectedLibraryId?' selected':''}>${esc(row.name)}${row.id===equip?' · Equipped':''}</option>`).join('');
    }
    const equipped=getEquipped();
    const label=document.getElementById('fishingEquippedSetupLabel');
    const costLabel=document.getElementById('fishingEquippedSetupCost');
    if(label)label.textContent=equipped?.name||'None';
    const cost=equipped?costOfSetup(equipped.setup):null;
    if(costLabel)costLabel.textContent=`${n(cost?.totalPED).toFixed(5)} PED / click`;
    syncLiveLabel();
  }

  function syncLiveLabel(){
    const el=document.getElementById('fishingEquippedLiveLabel');
    if(!el)return;
    const equipped=getEquipped();
    if(!equipped){el.textContent='No fishing setup equipped';return}
    const cost=costOfSetup(equipped.setup);
    el.textContent=`${equipped.name} · ${cost.totalPED.toFixed(5)} PED/click`;
  }

  function render(){
    for(const slot of slots)renderSelect(slot);
    renderMeta();renderEconomy();renderLibrary();
  }

  async function refreshData(force=false){
    const status=document.getElementById('fishingGearApiState');
    if(status)status.textContent='Loading Nexus…';
    const settled=await Promise.allSettled(Object.entries(categories).map(async([slot,category])=>{
      const result=await window.EntropiaNexus?.fetchCategory?.(category,{refresh:force});
      return [slot,result?.items||[]];
    }));
    settled.forEach(result=>{
      if(result.status==='fulfilled')data[result.value[0]]=result.value[1];
    });
    if(status)status.textContent=settled.some(x=>x.status==='rejected')?'Nexus partial / cached':'Nexus API ready';
    render();
  }

  function changeSlot(slot,id){
    if(!slots.includes(slot))return;
    selected[slot]=selectedById(slot,id);
    if(slot==='rod'){
      for(const key of ['reel','blank','line','lure']){
        if(selected[key]&&!attachmentCompatible(selected.rod,selected[key]))selected[key]=null;
      }
      if(isBaitRod(selected.rod)){
        selected.reel=selected.blank=selected.line=selected.lure=null;
      }
    }
    render();
  }

  function newSetup(){
    selectedLibraryId='';
    selected={rod:null,reel:null,blank:null,line:null,lure:null};
    const name=document.getElementById('fishingSetupName');if(name)name.value='Fishing Setup';
    render();
  }

  function selectSetup(id){
    selectedLibraryId=String(id||'');
    const row=library().find(x=>x.id===selectedLibraryId);
    if(!row)return;
    selected=clone(row.setup);
    const name=document.getElementById('fishingSetupName');if(name)name.value=row.name;
    render();
  }

  function saveSetup(){
    const setup=currentSetup(),cost=costOfSetup(setup);
    if(!cost.valid){
      window.showAppToast?.(cost.reason,'warning',3200);return false;
    }
    const name=(document.getElementById('fishingSetupName')?.value||'Fishing Setup').trim()||'Fishing Setup';
    const rows=library();
    if(selectedLibraryId){
      const idx=rows.findIndex(x=>x.id===selectedLibraryId);
      if(idx>=0)rows[idx]={...rows[idx],name,setup:clone(setup),updatedAt:Date.now()};
    }else{
      selectedLibraryId=`fishing_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
      rows.push({id:selectedLibraryId,name,setup:clone(setup),createdAt:Date.now(),updatedAt:Date.now()});
    }
    saveLibrary(rows);renderLibrary();
    window.showAppToast?.(`Saved fishing setup: ${name}`,'success',1800);
    return true;
  }

  function equip(id){
    const row=library().find(x=>x.id===String(id||''));if(!row)return false;
    const cost=costOfSetup(row.setup);
    if(!cost.valid){window.showAppToast?.(cost.reason,'warning',3200);return false}
    localStorage.setItem(EQUIPPED_KEY,row.id);
    renderLibrary();
    window.dispatchEvent(new CustomEvent('fishing-gear-equipped-changed',{detail:{setup:getEquipped(),economy:cost}}));
    window.showAppToast?.(`Fishing setup equipped: ${row.name}`,'success',1800);
    return true;
  }
  function equipSelected(){return equip(selectedLibraryId)}
  async function deleteSelected(){
    if(!selectedLibraryId)return;
    const row=library().find(x=>x.id===selectedLibraryId);if(!row)return;
    const ok=window.appConfirm?await window.appConfirm(`Delete "${row.name}"?`,{title:'Delete Fishing Setup',confirmText:'Delete'}):confirm(`Delete "${row.name}"?`);
    if(!ok)return;
    saveLibrary(library().filter(x=>x.id!==selectedLibraryId));
    if(equippedId()===selectedLibraryId)localStorage.removeItem(EQUIPPED_KEY);
    newSetup();renderLibrary();
  }

  function getEquippedEconomy(){
    const row=getEquipped();
    if(!row)return {valid:false,totalPED:0,reason:'No fishing setup equipped.'};
    return {...costOfSetup(row.setup),id:row.id,name:row.name};
  }

  function bind(){
    newSetup();
    refreshData(false);
    renderLibrary();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
  else bind();

  return {
    refreshData,render,changeSlot,newSetup,selectSetup,saveSetup,equipSelected,deleteSelected,equip,
    getEquippedSetup:getEquipped,getEquippedEconomy,costOfSetup,
    spoolCellTTPED:SPOOL_CELL_TT_PED
  };
})();
