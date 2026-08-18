'use strict';

window.EntropiaLoadouts=(function(){
  const STORAGE_KEY='entropia_hunt_loadouts_v1';
  const EQUIPPED_KEY='entropia_hunt_equipped_loadout_v1';
  const SCHEMA='pixelb8-entropia-loadouts';
  const VERSION=1;
  const slots=['amp','amp2','absorber','scope','sight1','sight2'];
  let currentId=null;
  let apiSelections={weapon:null,attachments:{amp:null,amp2:null,absorber:null,scope:null,sight1:null,sight2:null},enhancers:Array(10).fill(null)};
  let pickerContext=null;
  let pickerItems=[];
  let pickerSelectedIndex=-1;
  let summaryMode='builder';
  let builderView='cards';

  const formulas={
    hitAbility:(hitLvl,start,end,isSIB)=>{if(start==null||end==null)return 10;if(hitLvl<start)return 0;if(hitLvl>=end)return 10;return isSIB?6+((hitLvl-start)/(end-start))*4:3+0.06*hitLvl;},
    critAbility:(hitLvl,start,end,isSIB)=>{if(hitLvl<start)return 0;if(hitLvl>=end)return 10;const progress=(hitLvl-start)/(end-start);return isSIB?Math.sqrt(progress)*10:Math.sqrt(hitLvl);},
    hitRate:HA=>(HA+80)/99,
    dpp:(effectiveDamage,costPerUsePEC)=>costPerUsePEC>0?effectiveDamage/costPerUsePEC:0,
    apmFromHitLvl:(hitLvl,start,end,maxAPM,minAPM=0)=>{if(end<=start)return maxAPM;if(hitLvl<=start)return minAPM;if(hitLvl>=end)return maxAPM;return minAPM+(maxAPM-minAPM)*((hitLvl-start)/(end-start));},
    critChance:CA=>Math.min(.02,(CA/10)*.02),
    minDamagePercent:(dmgLvl,start,end)=>{const baseMin=.25,maxPercent=.5;if(dmgLvl<start)return baseMin;return baseMin+Math.min(1,(dmgLvl-start)/(end-start))*(maxPercent-baseMin);}
  };

  function n(v,fallback=0){
    const x=Number(v);
    return Number.isFinite(x)?x:fallback;
  }

  function clone(v){return JSON.parse(JSON.stringify(v));}

  function emptyAttachment(){
    return {name:'',damage:0,range:0,decayPEC:0,ammoPEC:0,efficiency:0,mu:100,raw:null};
  }

  function emptyLoadout(){
    return {
      schemaVersion:VERSION,
      name:'Custom Loadout',
      skills:{hit:100,damage:100},
      economy:{useMarketMarkup:false,
      useSecondaryAmp:false,weaponMU:100,ammoMU:100},
      weapon:{
        name:'',
        maxDamage:0,
        usesPerMinute:60,
        decayPEC:0,
        ammoPEC:0,
        efficiency:0,
        range:0,
        skill:{
          isSIB:false,
          hitStart:0,
          hitEnd:100,
          dmgStart:0,
          dmgEnd:100
        },
        raw:null
      },
      attachments:{
        amp:emptyAttachment(),
        amp2:emptyAttachment(),
        absorber:emptyAttachment(),
        scope:emptyAttachment(),
        sight1:emptyAttachment(),
        sight2:emptyAttachment()
      },
      enhancers:Array.from({length:10},()=>({name:''})),
      createdAt:Date.now(),
      updatedAt:Date.now()
    };
  }

  function loadLibrary(){
    try{
      const parsed=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');
      return Array.isArray(parsed)?parsed:[];
    }catch{return []}
  }

  function saveLibrary(list){
    localStorage.setItem(STORAGE_KEY,JSON.stringify(list));
  }

  function getEquippedId(){
    return localStorage.getItem(EQUIPPED_KEY)||'';
  }

  function getEntry(id){
    return loadLibrary().find(x=>x.id===id)||null;
  }

  function getEquippedEntry(){
    return getEntry(getEquippedId());
  }

  function normalizeNexusItem(item){
    if(!item)return null;
    const s=window.EntropiaNexus?.stats?.(item);
    if(s)return {name:s.name,damage:s.damage,range:s.range,decayPEC:s.decayPEC,ammoPEC:s.ammoPEC,efficiency:s.efficiency,mu:100,raw:item};
    const props=item.Properties||{};const econ=props.Economy||{};const damage=Object.values(props.Damage||{}).reduce((a,b)=>a+n(b),0);
    return {name:item.Name||item.name||'',damage,decayPEC:n(econ.Decay),ammoPEC:n(econ.AmmoBurn)*.01,efficiency:n(econ.Efficiency??econ.Eff),mu:100,raw:item};
  }

  function normalizeNexusWeapon(item){
    const s=window.EntropiaNexus?.stats?.(item);if(!s)return null;
    return {name:s.name,maxDamage:s.damage,range:s.range,usesPerMinute:s.usesPerMinute,decayPEC:s.decayPEC,ammoPEC:s.ammoPEC,efficiency:s.efficiency,skill:{isSIB:s.isSIB,hitStart:s.hitStart,hitEnd:s.hitEnd,dmgStart:s.dmgStart,dmgEnd:s.dmgEnd},raw:item};
  }

  function normalizeOldLoadout(raw){
    if(!raw||typeof raw!=='object')return null;

    const source=raw.data&&raw.data.weapon?raw.data:raw;

    if(raw.Gear?.Weapon){
      const w=raw.Gear.Weapon;
      const result=emptyLoadout();
      result.name=raw.Name||'Imported Nexus Loadout';
      result.weapon.name=w.Name||'';
      result.attachments.amp.name=w.Amplifier?.Name||'';
      result.attachments.amp2.name=w.Amplifier2?.Name||w.MayhemAmplifier?.Name||'';
      result.attachments.absorber.name=w.Absorber?.Name||'';
      result.attachments.scope.name=w.Scope?.Name||'';
      result.attachments.sight1.name=w.Sight?.Name||'';
      result.attachments.sight2.name=w.Sight2?.Name||'';
      return result;
    }

    if(raw.weapon&&raw.attachments&&!raw.weapon.Properties){
      const result=emptyLoadout();
      result.name=raw.name||'Imported Loadout';
      result.weapon.name=raw.weapon.name||'';
      const map={amplifier:'amp',amplifier2:'amp2',mayhemAmplifier:'amp2',absorber:'absorber',scope:'scope',vision1:'sight1',vision2:'sight2'};
      Object.entries(map).forEach(([oldKey,newKey])=>{
        const val=raw.attachments?.[oldKey];
        if(val?.name&&val.name!=='None')result.attachments[newKey].name=val.name;
      });
      return result;
    }

    if(source.weapon){
      const result=emptyLoadout();
      result.name=raw.name||source.name||'Imported Loadout';

      if(source.weapon.Properties){
        const w=normalizeNexusItem(source.weapon);
        const props=source.weapon.Properties||{};
        const skills=props.Skill||{};
        result.weapon={
          ...result.weapon,
          name:w.name,
          maxDamage:w.damage,
          decayPEC:w.decayPEC,
          ammoPEC:w.ammoPEC,
          efficiency:w.efficiency,
          usesPerMinute:n(props.UsesPerMinute??props.Uses,60),
          skill:{
            isSIB:!!skills.IsSiB,
            hitStart:n(skills.Hit?.LearningIntervalStart??skills.LearningIntervalStart,0),
            hitEnd:n(skills.Hit?.LearningIntervalEnd??skills.LearningIntervalEnd,100),
            dmgStart:n(skills.Dmg?.LearningIntervalStart??skills.LearningIntervalStart,0),
            dmgEnd:n(skills.Dmg?.LearningIntervalEnd??skills.LearningIntervalEnd,100)
          },
          raw:source.weapon
        };
      }else{
        result.weapon.name=source.weapon.Name||source.weapon.name||'';
      }

      const attMap={amp:'amp',absorber:'absorber',scope:'scope',sight1:'sight1',sight2:'sight2'};
      Object.entries(attMap).forEach(([oldKey,newKey])=>{
        const item=source[oldKey];
        if(!item)return;
        if(item.Properties){
          result.attachments[newKey]={...emptyAttachment(),...normalizeNexusItem(item)};
        }else{
          result.attachments[newKey].name=item.Name||item.name||'';
        }
      });

      if(Array.isArray(source.enhancers)){
        result.enhancers=Array.from({length:10},(_,i)=>({
          name:source.enhancers[i]?.Name||source.enhancers[i]?.name||''
        }));
      }
      return result;
    }

    if(raw.schema===SCHEMA&&raw.loadout)return normalizeCurrentLoadout(raw.loadout);
    return null;
  }

  function normalizeCurrentLoadout(raw){
    const base=emptyLoadout();
    const value=clone(raw||{});
    return {
      ...base,
      ...value,
      skills:{...base.skills,...(value.skills||{})},
      economy:{...base.economy,...(value.economy||{})},
      weapon:{...base.weapon,...(value.weapon||{}),skill:{...base.weapon.skill,...(value.weapon?.skill||{})}},
      attachments:Object.fromEntries(slots.map(k=>[
        k,{...emptyAttachment(),...(value.attachments?.[k]||{})}
      ])),
      enhancers:Array.from({length:10},(_,i)=>({name:value.enhancers?.[i]?.name||'',raw:value.enhancers?.[i]?.raw||null}))
    };
  }

  function calculate(loadout){
    if(!loadout)return null;const l=normalizeCurrentLoadout(loadout);if(!l.weapon?.name)return null;
    const hitLvl=n(l.skills.hit,100),dmgLvl=n(l.skills.damage,100),useMU=!!l.economy.useMarketMarkup;
    const weaponMU=useMU?n(l.economy.weaponMU,100)/100:1,ammoMU=useMU?n(l.economy.ammoMU,100)/100:1;
    const skill=l.weapon.skill||{},isSIB=!!skill.isSIB;
    const hitStart=skill.hitStart??0,hitEnd=skill.hitEnd??100,dmgStart=skill.dmgStart??hitStart,dmgEnd=skill.dmgEnd??hitEnd;
    let baseMaxDamage=n(l.weapon.maxDamage),range=n(l.weapon.range);
    const wDecay=n(l.weapon.decayPEC),wAmmoCost=n(l.weapon.ammoPEC),wCostPEC=wDecay*weaponMU+wAmmoCost*ammoMU,wEff=n(l.weapon.efficiency);
    let totalDecay=wDecay,totalAmmoPEC=wAmmoCost,grandTotalCostPEC=wCostPEC,grandTtCostPEC=wDecay+wAmmoCost,weightedEffSum=wCostPEC*wEff;
    slots.forEach(slot=>{if(slot==='amp2'&&!l.economy.useSecondaryAmp)return;const item=l.attachments[slot];if(!item?.name)return;if(item.damage)baseMaxDamage+=n(item.damage);if(item.range)range=Math.max(range,n(item.range));const mu=useMU?n(item.mu,100)/100:1,aDecay=n(item.decayPEC),aAmmo=n(item.ammoPEC),aCost=aDecay*mu+aAmmo*ammoMU,aEff=n(item.efficiency);totalDecay+=aDecay;totalAmmoPEC+=aAmmo;grandTotalCostPEC+=aCost;grandTtCostPEC+=aDecay+aAmmo;weightedEffSum+=aCost*aEff;});
    const efficiency=grandTotalCostPEC>0?weightedEffSum/grandTotalCostPEC:wEff;
    const minDamage=baseMaxDamage*formulas.minDamagePercent(dmgLvl,dmgStart,dmgEnd);
    const hitAbility=formulas.hitAbility(hitLvl,hitStart,hitEnd,isSIB),critAbility=formulas.critAbility(hitLvl,hitStart,hitEnd,isSIB),hitRate=formulas.hitRate(hitAbility),critChance=formulas.critChance(critAbility),apm=formulas.apmFromHitLvl(hitLvl,hitStart,hitEnd,n(l.weapon.usesPerMinute,60));
    const averageRawDamage=(minDamage+baseMaxDamage)/2,effectiveDamage=averageRawDamage*(1+critChance*2)*hitRate,dps=effectiveDamage*apm/60,dpp=formulas.dpp(effectiveDamage,grandTotalCostPEC);
    return {name:l.name||l.weapon.name,weaponName:l.weapon.name,ammoBurn:totalAmmoPEC*100,decay:totalDecay,decayPEC:totalDecay,ammoPEC:totalAmmoPEC,efficiency,range,maxDamage:baseMaxDamage,minDamage,averageRawDamage,effectiveDamage,hitAbility,critAbility,hitRate,critChance,apm,dps,dpp,ttCostPerShotPEC:grandTtCostPEC,ttCostPerShot:grandTtCostPEC/100,costPerShotPEC:grandTotalCostPEC,costPerShot:grandTotalCostPEC/100,useMarketMarkup:useMU};
  }

  function readAttachmentRow(slot){
    const row=document.querySelector(`tr[data-slot="${slot}"]`);
    if(!row)return emptyAttachment();
    const get=f=>row.querySelector(`[data-field="${f}"]`)?.value??'';
    return {
      name:get('name').trim(),
      damage:n(get('damage')),
      range:window.EntropiaNexus?.stats?.(apiSelections.attachments[slot])?.range||0,
      decayPEC:n(get('decay')),
      ammoPEC:n(get('ammo')),
      efficiency:n(get('efficiency')),
      mu:n(get('mu'),100),
      raw:apiSelections.attachments[slot]||null
    };
  }

  function collectForm(){
    const l=emptyLoadout();
    l.name=document.getElementById('loadoutNameInput')?.value.trim()||'Custom Loadout';
    l.skills.hit=n(document.getElementById('loadoutHitSkill')?.value,100);
    l.skills.damage=n(document.getElementById('loadoutDmgSkill')?.value,100);
    l.economy.useMarketMarkup=!!document.getElementById('useMarketMarkup')?.checked;
    l.economy.useSecondaryAmp=!!document.getElementById('loadoutUseSecondaryAmp')?.checked;
    l.economy.weaponMU=n(document.getElementById('weaponMu')?.value,100);
    l.economy.ammoMU=n(document.getElementById('ammoMu')?.value,100);
    l.weapon.name=document.getElementById('weaponName')?.value.trim()||'';
    l.weapon.maxDamage=n(document.getElementById('weaponMaxDamage')?.value);
    l.weapon.usesPerMinute=n(document.getElementById('weaponApm')?.value,60);
    l.weapon.decayPEC=n(document.getElementById('weaponDecay')?.value);
    l.weapon.ammoPEC=n(document.getElementById('weaponAmmo')?.value);
    l.weapon.efficiency=n(document.getElementById('weaponEfficiency')?.value);
    if(apiSelections.weapon){const w=normalizeNexusWeapon(apiSelections.weapon);if(w){l.weapon.skill=w.skill;l.weapon.raw=apiSelections.weapon;}}
    slots.forEach(slot=>l.attachments[slot]=readAttachmentRow(slot));
    l.enhancers=[...document.querySelectorAll('.loadout-enhancer-input')]
      .map((el,i)=>({name:el.value.trim(),raw:apiSelections.enhancers[i]||null}));
    l.updatedAt=Date.now();
    return l;
  }

  function setVal(id,val){
    const el=document.getElementById(id);
    if(el)el.value=val??'';
  }

  function populateForm(loadout){
    const l=normalizeCurrentLoadout(loadout);
    apiSelections={weapon:l.weapon.raw||null,attachments:Object.fromEntries(slots.map(k=>[k,l.attachments[k]?.raw||null])),enhancers:Array.from({length:10},(_,i)=>l.enhancers[i]?.raw||null)};
    setVal('loadoutNameInput',l.name);
    setVal('loadoutHitSkill',l.skills.hit);
    setVal('loadoutDmgSkill',l.skills.damage);
    setVal('weaponName',l.weapon.name);
    setVal('weaponMaxDamage',l.weapon.maxDamage);
    setVal('weaponApm',l.weapon.usesPerMinute);
    setVal('weaponDecay',l.weapon.decayPEC);
    setVal('weaponAmmo',l.weapon.ammoPEC);
    setVal('weaponEfficiency',l.weapon.efficiency);
    const mt=document.getElementById('useMarketMarkup');if(mt)mt.checked=!!l.economy.useMarketMarkup;
    const secondaryToggle=document.getElementById('loadoutUseSecondaryAmp');if(secondaryToggle)secondaryToggle.checked=!!l.economy.useSecondaryAmp;
    document.querySelector('.secondary-amp-table-row')?.classList.toggle('hidden',!l.economy.useSecondaryAmp);
    document.getElementById('secondaryAmpAddRow')?.classList.toggle('hidden',!!l.economy.useSecondaryAmp);
    setVal('weaponMu',l.economy.weaponMU);setVal('ammoMu',l.economy.ammoMU);applyMarketMarkupUiState();

    slots.forEach(slot=>{
      const row=document.querySelector(`tr[data-slot="${slot}"]`);
      const a=l.attachments[slot];
      if(!row)return;
      const put=(f,v)=>{const el=row.querySelector(`[data-field="${f}"]`);if(el)el.value=v??''};
      put('name',a.name);put('damage',a.damage||'');put('decay',a.decayPEC||'');
      put('ammo',a.ammoPEC||'');put('efficiency',a.efficiency||'');put('mu',a.mu||100);
    });

    const inputs=[...document.querySelectorAll('.loadout-enhancer-input')];
    inputs.forEach((el,i)=>el.value=l.enhancers[i]?.name||'');
    recalc();
    if(builderView==='cards')renderBuilderCardView();
  }

  function renderEnhancers(){
    const host=document.getElementById('loadoutEnhancerGrid');
    if(!host||host.children.length)return;
    host.innerHTML=Array.from({length:10},(_,i)=>`<div class="loadout-enhancer-slot"><input class="loadout-enhancer-input" placeholder="Socket ${i+1}" title="Enhancer socket ${i+1}"><button class="btn nexus-enhancer-btn" type="button" onclick="EntropiaLoadouts.openItemPicker('enhancer',${i})">⌕</button></div>`).join('');
  }

  function applyMarketMarkupUiState(){const enabled=!!document.getElementById('useMarketMarkup')?.checked;['weaponMu','ammoMu'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=!enabled});document.querySelectorAll('.loadout-attachment-table [data-field="mu"]').forEach(el=>el.disabled=!enabled);}
  function toggleMarketMarkup(){applyMarketMarkupUiState();recalc();}
  function buildSummaryHtml(data,stats){
    if(!data?.weapon?.name||!stats)return '<div class="empty">No loadout configured.</div>';
    const pairs=[['AMP 1',data.attachments?.amp?.name],...(data.economy?.useSecondaryAmp?[['MAYHEM AMP',data.attachments?.amp2?.name]]:[]),['ABS',data.attachments?.absorber?.name],['SCOPE',data.attachments?.scope?.name],['SIGHT 1',data.attachments?.sight1?.name],['SIGHT 2',data.attachments?.sight2?.name]];
    const enh=(data.enhancers||[]).map((e,i)=>e?.name?`<span class="build-chip enhancer">${i+1}: ${escapeHtml(e.name)}</span>`:'').join('');
    return `<div class="build-primary"><div><span class="build-label">Weapon</span><b>${escapeHtml(data.weapon.name)}</b></div></div>
      <div class="build-slot-strip">${pairs.map(([k,v])=>`<span class="build-chip ${v?'filled':''}"><small>${k}</small>${escapeHtml(v||'Empty')}</span>`).join('')}</div>
      ${enh?`<div class="build-enhancer-strip">${enh}</div>`:''}`;
  }

  function getSummarySource(){
    if(summaryMode==='equipped'){
      const entry=getEquippedEntry();
      return entry?{data:entry.data,stats:calculate(entry.data),name:entry.name}:null;
    }
    const data=collectForm();
    return {data,stats:calculate(data),name:data.name||'Builder'};
  }

  function renderSummaryStats(stats){
    const put=(id,text)=>{const el=document.getElementById(id);if(el)el.textContent=text};
    if(!stats){
      put('loadoutStatCost','0.0000 PED');put('loadoutStatDpp','0.00');put('loadoutStatDps','0.0');
      put('loadoutStatEfficiency','0.00%');put('loadoutStatMinDamage','0.00');put('loadoutStatMaxDamage','0.00');
      put('loadoutStatApm','0.00');put('loadoutStatAmmo','0.0000 PEC');put('loadoutStatDecay','0.0000 PEC');
      put('loadoutStatRange','0.0 m');put('loadoutStatHitRate','0.00%');return;
    }
    put('loadoutStatCost',`${stats.costPerShot.toFixed(4)} PED`);
    put('loadoutStatDpp',stats.dpp.toFixed(2));put('loadoutStatDps',stats.dps.toFixed(1));
    put('loadoutStatEfficiency',`${stats.efficiency.toFixed(2)}%`);put('loadoutStatMinDamage',stats.minDamage.toFixed(2));
    put('loadoutStatMaxDamage',stats.maxDamage.toFixed(2));put('loadoutStatApm',stats.apm.toFixed(2));
    put('loadoutStatAmmo',`${stats.ammoPEC.toFixed(4)} PEC`);put('loadoutStatDecay',`${stats.decayPEC.toFixed(4)} PEC`);
    put('loadoutStatRange',`${stats.range.toFixed(1)} m`);put('loadoutStatHitRate',`${(stats.hitRate*100).toFixed(2)}%`);
  }

  function renderSharedSummary(){
    const source=getSummarySource();
    const host=document.getElementById('sharedLoadoutSummary');
    document.getElementById('summaryCurrentBtn')?.classList.toggle('active',summaryMode==='equipped');
    document.getElementById('summaryBuilderBtn')?.classList.toggle('active',summaryMode==='builder');
    const label=document.getElementById('summaryModeLabel');if(label)label.textContent=summaryMode==='equipped'?'Equipped':'Builder';
    document.getElementById('summaryEquipBuilderBtn')?.classList.toggle('hidden',summaryMode!=='builder');
    document.getElementById('summaryEditEquippedBtn')?.classList.toggle('hidden',summaryMode!=='equipped');
    if(host)host.innerHTML=source?.stats?buildSummaryHtml(source.data,source.stats):`<div class="empty">${summaryMode==='equipped'?'No loadout equipped.':'Select a weapon to start a build.'}</div>`;
    renderSummaryStats(source?.stats||null);
  }

  function setSummaryMode(mode){summaryMode=mode==='equipped'?'equipped':'builder';renderSharedSummary();}
  function renderBuildPanels(){renderSharedSummary();}
  function loadEquippedIntoBuilder(){const entry=getEquippedEntry();if(!entry)return;currentId=null;populateForm(clone(entry.data));setVal('loadoutNameInput',`${entry.name} Copy`);summaryMode='builder';renderSharedSummary();}
  function equipBuilder(){const data=collectForm();if(!data.weapon.name){window.showAppToast?.("Select a weapon first.",'warning');return}let list=loadLibrary(),id=currentId;if(!id){id=`loadout_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;list.push({id,name:data.name,data,createdAt:Date.now(),updatedAt:Date.now()});saveLibrary(list);currentId=id}else{const idx=list.findIndex(x=>x.id===id);if(idx>=0){list[idx]={...list[idx],name:data.name,data,updatedAt:Date.now()};saveLibrary(list)}}equip(id);summaryMode='equipped';renderSharedSummary();}

  function clearSlot(slot,index=null){
    if(slot==='weapon'){
      apiSelections.weapon=null;
      setVal('loadoutWeaponName','');
      // Keep attachments in place; user may simply be changing weapons.
      // Compatibility is rechecked when selecting a new weapon.
    }else if(slot==='enhancer'&&Number.isInteger(index)){
      apiSelections.enhancers[index]=null;
      const input=document.querySelector(`[data-enhancer-index="${index}"] input`);
      if(input)input.value='';
    }else if(slots.includes(slot)){
      apiSelections[slot]=null;
      const row=document.querySelector(`tr[data-slot="${slot}"]`);
      if(row){
        row.querySelectorAll('input').forEach(input=>{
          if(input.type==='number')input.value='0';
          else input.value='';
        });
      }
    }
    recalc();
    renderEnhancers?.();
    if(builderView==='cards')renderBuilderCardView();
  }

  function setSecondaryAmpEnabled(enabled){
    const cb=document.getElementById('loadoutUseSecondaryAmp');
    if(cb)cb.checked=!!enabled;
    document.querySelector('.secondary-amp-table-row')?.classList.toggle('hidden',!enabled);
    document.getElementById('secondaryAmpAddRow')?.classList.toggle('hidden',!!enabled);
    recalc();
    if(builderView==='cards')renderBuilderCardView();
  }

  function enableSecondaryAmp(){setSecondaryAmpEnabled(true);}
  function removeSecondaryAmp(){setSecondaryAmpEnabled(false);}


  function setBuilderView(mode){
    builderView=mode==='table'?'table':'cards';
    document.getElementById('builderCardView')?.classList.toggle('hidden',builderView!=='cards');
    document.getElementById('builderTableView')?.classList.toggle('hidden',builderView!=='table');
    document.getElementById('builderCardViewBtn')?.classList.toggle('active',builderView==='cards');
    document.getElementById('builderTableViewBtn')?.classList.toggle('active',builderView==='table');
    if(builderView==='cards')renderBuilderCardView();
  }

  function slotStatsHtml(item){
    const v=item||{};
    const val=(n,unit='')=>`${Number(n||0).toFixed(unit==='%'?2:4)}${unit}`;
    return `<div class="builder-slot-stat-grid">
      <div class="builder-slot-stat"><span>Damage</span><b>${Number(v.damage||0).toFixed(2)}</b></div>
      <div class="builder-slot-stat"><span>Decay / Use</span><b>${Number(v.decayPEC||0).toFixed(4)} PEC</b></div>
      <div class="builder-slot-stat"><span>Ammo / Use</span><b>${Number(v.ammoPEC||0).toFixed(4)} PEC</b></div>
      <div class="builder-slot-stat"><span>Efficiency</span><b>${Number(v.efficiency||0).toFixed(2)}%</b></div>
    </div>`;
  }

  function weaponCardHtml(data){
    const w=data.weapon||{};
    const empty=!w.name;
    return `<details class="builder-slot-card weapon-card ${empty?'builder-slot-empty':''}" open>
      <summary class="builder-slot-head">
        <div class="builder-slot-title"><span class="builder-slot-kicker">Weapon</span><span class="builder-slot-name">${escapeHtml(w.name||'No weapon selected')}</span></div>
        <div class="builder-slot-actions">
          <button class="btn nexus-row-btn" type="button" onclick="event.preventDefault();event.stopPropagation();EntropiaLoadouts.openItemPicker('weapon')">${empty?'Select':'Change'}</button>${empty?'':`<button class="btn slot-clear-btn" type="button" onclick="event.preventDefault();event.stopPropagation();EntropiaLoadouts.clearSlot('weapon')">Clear</button>`}
          <span class="builder-slot-caret">›</span>
        </div>
      </summary>
      <div class="builder-slot-body">
        <div class="builder-slot-stat-grid">
          <div class="builder-slot-stat"><span>Max Damage</span><b>${Number(w.maxDamage||0).toFixed(2)}</b></div>
          <div class="builder-slot-stat"><span>Uses / Min</span><b>${Number(w.usesPerMinute||0).toFixed(2)}</b></div>
          <div class="builder-slot-stat"><span>Decay / Use</span><b>${Number(w.decayPEC||0).toFixed(4)} PEC</b></div>
          <div class="builder-slot-stat"><span>Ammo / Use</span><b>${Number(w.ammoPEC||0).toFixed(4)} PEC</b></div>
          <div class="builder-slot-stat"><span>Efficiency</span><b>${Number(w.efficiency||0).toFixed(2)}%</b></div>
          <div class="builder-slot-stat"><span>Range</span><b>${Number(w.range||0).toFixed(1)} m</b></div>
        </div>
        <div class="builder-slot-note">Use Table View for manual stat overrides and markup fields.</div>
      </div>
    </details>`;
  }

  function attachmentCardHtml(slot,label,item,optionalSlot=false){
    const empty=!item?.name;
    return `<details class="builder-slot-card ${empty?'builder-slot-empty':''}">
      <summary class="builder-slot-head">
        <div class="builder-slot-title"><span class="builder-slot-kicker">${escapeHtml(label)}</span><span class="builder-slot-name">${escapeHtml(item?.name||'Empty slot')}</span></div>
        <div class="builder-slot-actions">
          <button class="btn nexus-row-btn" type="button" onclick="event.preventDefault();event.stopPropagation();EntropiaLoadouts.openItemPicker('${slot}')">${empty?'Select':'Change'}</button>${empty?'':`<button class="btn slot-clear-btn" type="button" onclick="event.preventDefault();event.stopPropagation();EntropiaLoadouts.clearSlot('${slot}')">Clear</button>`}${optionalSlot?`<button class="btn slot-remove-btn" type="button" onclick="event.preventDefault();event.stopPropagation();EntropiaLoadouts.removeSecondaryAmp()">Remove Slot</button>`:''}
          <span class="builder-slot-caret">›</span>
        </div>
      </summary>
      <div class="builder-slot-body">${slotStatsHtml(item)}</div>
    </details>`;
  }

  function enhancerCardHtml(data){
    const enh=data.enhancers||[];
    return `<details class="builder-slot-card enhancer-card">
      <summary class="builder-slot-head">
        <div class="builder-slot-title"><span class="builder-slot-kicker">Enhancers</span><span class="builder-slot-name">${enh.filter(e=>e?.name).length} / 10 sockets filled</span></div>
        <div class="builder-slot-actions"><span class="builder-slot-caret">›</span></div>
      </summary>
      <div class="builder-slot-body">
        <div class="builder-enhancer-slots">
          ${Array.from({length:10},(_,i)=>{
            const name=enh[i]?.name||'';
            return `<div class="builder-enhancer-chip ${name?'':'empty'}"><small>${i+1}</small><span title="${escapeHtml(name)}">${escapeHtml(name||'Empty')}</span><span class="enhancer-chip-actions"><button class="btn" type="button" onclick="EntropiaLoadouts.openItemPicker('enhancer',${i})">${name?'↻':'＋'}</button>${name?`<button class="btn slot-clear-btn" type="button" onclick="EntropiaLoadouts.clearSlot('enhancer',${i})">×</button>`:''}</span></div>`;
          }).join('')}
        </div>
      </div>
    </details>`;
  }

  function renderBuilderCardView(){
    const host=document.getElementById('builderCardGrid');
    if(!host)return;
    const data=collectForm();
    host.innerHTML=`
      <div class="builder-card-topline">
        <label class="compact-field"><strong>Loadout Name</strong><input id="cardLoadoutName" type="text" value="${escapeHtml(data.name||'Custom Loadout')}"></label>
        <label class="compact-field"><strong>Hit Profession</strong><input id="cardHitSkill" type="number" min="0" max="200" step=".1" value="${Number(data.skills.hit||0)}"></label>
        <label class="compact-field"><strong>Damage Profession</strong><input id="cardDmgSkill" type="number" min="0" max="200" step=".1" value="${Number(data.skills.damage||0)}"></label>
      </div>
      ${weaponCardHtml(data)}
      ${attachmentCardHtml('amp','Amplifier',data.attachments?.amp)}
      ${data.economy?.useSecondaryAmp
        ?attachmentCardHtml('amp2','Mayhem Amplifier',data.attachments?.amp2,true)
        :`<div class="builder-slot-card secondary-amp-placeholder">
            <button class="secondary-amp-placeholder-btn" type="button" onclick="EntropiaLoadouts.enableSecondaryAmp()">
              <span class="secondary-amp-plus">＋</span>
              <span><b>Secondary Amp</b><small>Optional Mayhem amplifier slot</small></span>
            </button>
          </div>`}
      ${attachmentCardHtml('absorber','Absorber',data.attachments?.absorber)}
      ${attachmentCardHtml('scope','Scope',data.attachments?.scope)}
      ${attachmentCardHtml('sight1','Sight 1',data.attachments?.sight1)}
      ${attachmentCardHtml('sight2','Sight 2',data.attachments?.sight2)}
      ${enhancerCardHtml(data)}
    `;

    const name=document.getElementById('cardLoadoutName');
    const hit=document.getElementById('cardHitSkill');
    const dmg=document.getElementById('cardDmgSkill');
    if(name)name.addEventListener('input',()=>{setVal('loadoutNameInput',name.value);if(summaryMode==='builder')renderSharedSummary()});
    if(hit)hit.addEventListener('input',()=>{setVal('loadoutHitSkill',hit.value);if(summaryMode==='builder')renderSharedSummary()});
    if(dmg)dmg.addEventListener('input',()=>{setVal('loadoutDmgSkill',dmg.value);if(summaryMode==='builder')renderSharedSummary()});
  }

  function recalc(){if(summaryMode==='builder')renderSharedSummary();if(builderView==='cards')renderBuilderCardView();}

  function pickerCategoryForSlot(slot){if(slot==='weapon')return 'weapons';if(slot==='amp'||slot==='amp2')return 'weaponamplifiers';if(slot==='absorber')return 'absorbers';if(slot==='scope'||slot==='sight1'||slot==='sight2')return 'weaponvisionattachments';if(slot==='enhancer')return 'enhancers';return 'attachments';}

  function pickerTitleForSlot(slot,index){const labels={weapon:'Weapon',amp:'Weapon Amplifier',amp2:'Mayhem Amplifier',absorber:'Deterioration Absorber',scope:'Scope',sight1:'Sight',sight2:'Sight',enhancer:`Enhancer${Number.isInteger(index)?` · Socket ${index+1}`:''}`};return `Select ${labels[slot]||'Item'}`;}

  async function openItemPicker(slot,index=null){
    if(!window.EntropiaNexus){window.showAppToast?.("Nexus API service is not available.",'warning');return}
    if(slot!=='weapon'&&!collectForm().weapon.name){window.showAppToast?.("Please select a weapon first.",'warning');return}
    pickerContext={slot,index};pickerSelectedIndex=-1;
    document.getElementById('nexusPickerTitle').textContent=pickerTitleForSlot(slot,index);document.getElementById('nexusPickerSearch').value='';document.getElementById('nexusPickerResults').innerHTML='<div class="empty">Loading Nexus data…</div>';document.getElementById('nexusPickerDetails').innerHTML='<div class="empty">Select an item to preview its stats.</div>';document.getElementById('nexusItemPickerBackdrop')?.classList.remove('hidden');
    await loadPickerData(false);document.getElementById('nexusPickerSearch')?.focus();
  }

  function closeItemPicker(event){if(event&&event.target!==document.getElementById('nexusItemPickerBackdrop'))return;document.getElementById('nexusItemPickerBackdrop')?.classList.add('hidden');pickerContext=null;pickerItems=[];pickerSelectedIndex=-1;}

  function nexusTextBag(item){
    const p=item?.Properties||item?.properties||{};
    return [
      item?.Name,item?.name,p.Type,p.type,p.Class,p.class,p.Category,p.category,
      p.WeaponType,p.weaponType,p.Tool,p.tool,p.DamageType,p.damageType
    ].filter(Boolean).join(' ').toLowerCase();
  }

  function weaponFamilyTokens(item){
    const bag=nexusTextBag(item);
    const groups=[
      ['laser','laser'],
      ['b laser','laser'],
      ['plasma','plasma'],
      ['blp','blp'],
      ['projectile','blp'],
      ['gauss','gauss'],
      ['rocket','rocket'],
      ['grenade','grenade'],
      ['melee','melee'],
      ['sword','melee'],
      ['knife','melee'],
      ['club','melee'],
      ['fist','melee'],
      ['mindforce','mindforce'],
      ['chip','mindforce']
    ];
    const found=new Set();
    for(const [needle,family] of groups)if(bag.includes(needle))found.add(family);
    return [...found];
  }

  function amplifierCompatibleWithSelectedWeapon(item){
    const weapon=apiSelections.weapon;
    if(!weapon)return true;

    const weaponFamilies=weaponFamilyTokens(weapon);
    const ampFamilies=weaponFamilyTokens(item);

    // When both API records tell us a family, require overlap.
    if(weaponFamilies.length&&ampFamilies.length){
      return ampFamilies.some(f=>weaponFamilies.includes(f));
    }

    // Nexus data is not uniform across every item. If either record lacks
    // usable family metadata, keep it selectable rather than inventing a rule.
    return true;
  }

  function pickerItemMatchesOldFilters(item,context){
    if(!context)return false;const slot=context.slot,s=window.EntropiaNexus.stats(item),ep=String(item?._endpoint||s.endpoint||'').toLowerCase(),props=item?.Properties||item?.properties||{},propType=String(props.Type??props.type??s.type??'').toLowerCase(),itemName=String(item?.Name||item?.name||'').toLowerCase();
    if(slot==='weapon')return ep==='weapons';
    if(slot==='amp')return ep==='weaponamplifiers'&&amplifierCompatibleWithSelectedWeapon(item);
    if(slot==='amp2')return ep==='weaponamplifiers'&&itemName.includes('mayhem')&&amplifierCompatibleWithSelectedWeapon(item);
    if(slot==='absorber')return ep==='absorbers';
    if(slot==='scope')return (ep==='weaponvisionattachments'||ep==='scopes')&&(propType==='scope'||itemName.includes('scope'));
    if(slot==='sight1'||slot==='sight2')return (ep==='weaponvisionattachments'||ep==='sights')&&!(propType==='scope'||itemName.includes('scope'));
    if(slot==='enhancer'){if(ep!=='enhancers')return false;const socket=Number(props.Socket??props.socket??s.socket),tool=String(props.Tool??props.tool??'Weapon').toLowerCase();if(tool!=='weapon')return false;if(Number.isInteger(context.index))return socket===context.index+1;return Number.isInteger(socket)&&socket>=1&&socket<=10;}
    return false;
  }

  async function loadPickerData(refresh=false){
    if(!pickerContext)return;const status=document.getElementById('nexusPickerStatus');if(status)status.textContent=refresh?'Refreshing Nexus API…':'Loading Nexus API…';
    try{const category=pickerCategoryForSlot(pickerContext.slot);const result=await window.EntropiaNexus.fetchCategory(category,{refresh});pickerItems=result.items.filter(item=>pickerItemMatchesOldFilters(item,pickerContext));pickerItems.sort((a,b)=>(a.Name||a.name||'').localeCompare(b.Name||b.name||''));if(status)status.textContent=`${pickerItems.length.toLocaleString()} items · ${result.cached?'cached':'network'}`;const apiState=document.getElementById('nexusApiState');if(apiState)apiState.textContent=`Nexus: ${result.cached?'cached':'live'} · ${pickerItems.length.toLocaleString()} ${category}`;renderPickerResults();}
    catch(err){console.error('Nexus API load failed',err);pickerItems=[];document.getElementById('nexusPickerResults').innerHTML=`<div class="empty danger">Could not load Nexus data: ${escapeHtml(err.message||String(err))}</div>`;if(status)status.textContent='API error';}
  }

  async function refreshPickerData(){if(window.EntropiaNexus)await loadPickerData(true);}
  function filteredPickerItems(){const q=(document.getElementById('nexusPickerSearch')?.value||'').trim().toLowerCase();if(!q)return pickerItems;const terms=q.split(/\s+/).filter(Boolean);return pickerItems.filter(item=>{const s=window.EntropiaNexus.stats(item);const hay=`${s.name} ${s.type} ${s.endpoint}`.toLowerCase();return terms.every(term=>hay.includes(term));});}

  function renderPickerResults(){const host=document.getElementById('nexusPickerResults');if(!host)return;const rows=filteredPickerItems().slice(0,300);if(!rows.length){host.innerHTML='<div class="empty">No matching items.</div>';return}host.innerHTML=rows.map(item=>{const s=window.EntropiaNexus.stats(item);const sourceIndex=pickerItems.indexOf(item);const cost=s.decayPEC+s.ammoPEC;return `<div class="nexus-result-row" data-picker-index="${sourceIndex}"><div class="nexus-result-name" title="${escapeHtml(s.name)}">${escapeHtml(s.name)}</div><div class="nexus-result-stat">DMG ${s.damage.toFixed(1)}</div><div class="nexus-result-stat">${cost.toFixed(3)} PEC</div><div class="nexus-result-stat">EFF ${s.efficiency.toFixed(1)}%</div><div class="nexus-result-stat">${escapeHtml(s.endpoint.replace(/weapon/i,''))}</div></div>`;}).join('');}

  function selectPickerIndex(index){const item=pickerItems[index];if(!item)return;pickerSelectedIndex=index;document.querySelectorAll('.nexus-result-row').forEach(el=>el.classList.toggle('selected',Number(el.dataset.pickerIndex)===index));const s=window.EntropiaNexus.stats(item);const cost=s.decayPEC+s.ammoPEC;document.getElementById('nexusPickerDetails').innerHTML=`<div class="nexus-detail-title">${escapeHtml(s.name)}</div><div class="nexus-detail-type"><span class="nexus-api-badge">${escapeHtml(s.endpoint)}</span> ${escapeHtml(s.type||'')}</div><div class="nexus-detail-grid"><div class="nexus-detail-cell"><span>Total Damage</span><b>${s.damage.toFixed(2)}</b></div><div class="nexus-detail-cell"><span>Cost / Use</span><b>${cost.toFixed(4)} PEC</b></div><div class="nexus-detail-cell"><span>Decay / Use</span><b>${s.decayPEC.toFixed(4)} PEC</b></div><div class="nexus-detail-cell"><span>Ammo / Use</span><b>${s.ammoPEC.toFixed(4)} PEC</b></div><div class="nexus-detail-cell"><span>Efficiency</span><b>${s.efficiency.toFixed(2)}%</b></div><div class="nexus-detail-cell"><span>Uses / Min</span><b>${s.usesPerMinute.toFixed(2)}</b></div><div class="nexus-detail-cell"><span>Range</span><b>${s.range.toFixed(1)}</b></div><div class="nexus-detail-cell"><span>Socket</span><b>${s.socket||'—'}</b></div></div><div class="nexus-detail-actions"><button class="btn primary" type="button" onclick="EntropiaLoadouts.useSelectedPickerItem()">Use This Item</button></div>`;}

  function useSelectedPickerItem(){if(!pickerContext||pickerSelectedIndex<0)return;const item=pickerItems[pickerSelectedIndex];if(!item)return;applyNexusItem(pickerContext.slot,item,pickerContext.index);closeItemPicker();}

  function applyNexusItem(slot,item,index=null){const s=window.EntropiaNexus.stats(item);if(slot==='weapon'){apiSelections.weapon=item;setVal('weaponName',s.name);setVal('weaponMaxDamage',s.damage);setVal('weaponApm',s.usesPerMinute);setVal('weaponDecay',s.decayPEC);setVal('weaponAmmo',s.ammoPEC);setVal('weaponEfficiency',s.efficiency);if(!document.getElementById('loadoutNameInput').value.trim()||document.getElementById('loadoutNameInput').value==='Custom Loadout')setVal('loadoutNameInput',s.name);}else if(slots.includes(slot)){apiSelections.attachments[slot]=item;const row=document.querySelector(`tr[data-slot="${slot}"]`);if(row){const put=(field,value)=>{const el=row.querySelector(`[data-field="${field}"]`);if(el)el.value=value??''};put('name',s.name);put('damage',s.damage||'');put('decay',s.decayPEC||'');put('ammo',s.ammoPEC||'');put('efficiency',s.efficiency||'');}}else if(slot==='enhancer'){let target=Number.isInteger(index)?index:(s.socket>=1&&s.socket<=10?s.socket-1:apiSelections.enhancers.findIndex(x=>!x));if(target<0||target>9)target=0;apiSelections.enhancers[target]=item;const inputs=[...document.querySelectorAll('.loadout-enhancer-input')];if(inputs[target])inputs[target].value=s.name;}recalc();const state=document.getElementById('loadoutBuilderState');if(state)state.textContent=`Selected ${s.name} from Nexus`;}

  function renderLibrary(){
    const list=loadLibrary();
    const equipped=getEquippedId();
    const host=document.getElementById('savedLoadoutList');
    const count=document.getElementById('savedLoadoutCount');
    if(count)count.textContent=String(list.length);
    if(!host)return;
    if(!list.length){
      host.innerHTML='<div class="empty">No loadouts saved yet.</div>';
      return;
    }
    host.innerHTML=list.map(entry=>{
      const stats=calculate(entry.data);
      return `<div class="saved-loadout-card ${entry.id===equipped?'equipped':''}" data-loadout-id="${entry.id}">
        <div class="saved-loadout-name">${escapeHtml(entry.name||'Unnamed Loadout')}</div>
        <div class="saved-loadout-weapon">${escapeHtml(entry.data?.weapon?.name||'No weapon')}</div>
        <div class="saved-loadout-mini">
          <span>${stats?stats.costPerShot.toFixed(4):'0.0000'} PED/shot</span>
          <span>DPP ${stats?stats.dpp.toFixed(2):'0.00'}</span>
          <span>DPS ${stats?stats.dps.toFixed(1):'0.0'}</span>
        </div>
        <div class="saved-loadout-actions">
          <button class="btn" data-action="load" data-id="${entry.id}">Edit</button>
          <button class="btn ${entry.id===equipped?'success':''}" data-action="equip" data-id="${entry.id}">${entry.id===equipped?'Equipped':'Equip'}</button>
          <button class="btn" data-action="duplicate" data-id="${entry.id}">Copy</button>
          <button class="btn" data-action="delete" data-id="${entry.id}">Delete</button>
        </div>
      </div>`;
    }).join('');
  }

  function escapeHtml(s){
    return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function syncEquippedLabels(){
    const entry=getEquippedEntry();
    const stats=entry?calculate(entry.data):null;
    const label=entry?`Equipped: ${entry.name}`:'No loadout equipped';
    const badge=document.getElementById('equippedLoadoutBadge');
    const live=document.getElementById('liveHuntEquippedLabel');
    if(badge)badge.textContent=label;
    if(live)live.textContent=label;

    window.activeLoadout=stats?{...stats,id:entry.id,name:entry.name,data:clone(entry.data)}:null;
    window.dispatchEvent(new CustomEvent('loadout-equipped-changed',{detail:{activeLoadout:window.activeLoadout}}));
    renderBuildPanels();
  }

  function loadIntoBuilder(id){
    const entry=getEntry(id);
    summaryMode='builder';
    if(!entry)return;
    currentId=id;
    populateForm(entry.data);
    const state=document.getElementById('loadoutBuilderState');
    if(state)state.textContent=`Editing ${entry.name}`;
  }

  function newLoadout(){
    currentId=null;
    summaryMode='builder';
    populateForm(emptyLoadout());
    const state=document.getElementById('loadoutBuilderState');
    if(state)state.textContent='New build';
  }

  function saveCurrent(){
    const data=collectForm();
    if(!data.weapon.name){
      window.showAppToast?.("Add a weapon name before saving the loadout.",'warning');
      return;
    }
    const list=loadLibrary();
    if(currentId){
      const idx=list.findIndex(x=>x.id===currentId);
      if(idx!==-1){
        list[idx]={...list[idx],name:data.name,data,updatedAt:Date.now()};
      }else currentId=null;
    }
    if(!currentId){
      currentId=`loadout_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
      list.push({id:currentId,name:data.name,data,createdAt:Date.now(),updatedAt:Date.now()});
    }
    saveLibrary(list);
    renderLibrary();
    syncEquippedLabels();
    document.getElementById('loadoutBuilderState').textContent=`Saved ${data.name}`;
    if(typeof showToast==='function')showToast(`Saved loadout: ${data.name}`);
  }

  function equip(id){
    if(!getEntry(id))return;
    localStorage.setItem(EQUIPPED_KEY,id);
    renderLibrary();
    syncEquippedLabels();
    if(typeof showToast==='function')showToast('Loadout equipped.');
  }

  function duplicate(id){
    const source=getEntry(id);
    if(!source)return;
    const list=loadLibrary();
    const copy=clone(source);
    copy.id=`loadout_${Date.now()}_${Math.random().toString(36).slice(2,7)}`;
    copy.name=`${source.name} (Copy)`;
    copy.data.name=copy.name;
    copy.createdAt=Date.now();copy.updatedAt=Date.now();
    list.push(copy);saveLibrary(list);renderLibrary();
  }

  function remove(id){
    const entry=getEntry(id);
    if(!entry)return;
    if(!confirm(`Delete "${entry.name}"?`))return;
    let list=loadLibrary().filter(x=>x.id!==id);
    saveLibrary(list);
    if(getEquippedId()===id)localStorage.removeItem(EQUIPPED_KEY);
    if(currentId===id)newLoadout();
    renderLibrary();syncEquippedLabels();
  }

  function parseImportedPayload(payload){
    let rows=[];
    if(Array.isArray(payload))rows=payload;
    else if(payload?.schema===SCHEMA&&Array.isArray(payload.loadouts))rows=payload.loadouts;
    else if(payload?.loadouts&&Array.isArray(payload.loadouts))rows=payload.loadouts;
    else rows=[payload];

    const normalized=[];
    rows.forEach(row=>{
      let data=null,name='';
      if(row?.data&&row.data.schemaVersion===VERSION){
        data=normalizeCurrentLoadout(row.data);
        name=row.name||data.name;
      }else if(row?.schemaVersion===VERSION&&row.weapon){
        data=normalizeCurrentLoadout(row);
        name=data.name;
      }else{
        data=normalizeOldLoadout(row);
        name=data?.name||row?.name||row?.Name||'Imported Loadout';
      }
      if(data?.weapon?.name){
        data.name=name;
        normalized.push({name,data});
      }
    });
    return normalized;
  }

  function importLoadouts(){
    const input=document.createElement('input');
    input.type='file';input.accept='.json,application/json';
    input.onchange=async()=>{
      const file=input.files?.[0];
      if(!file)return;
      try{
        const payload=JSON.parse(await file.text());
        const imported=parseImportedPayload(payload);
        if(!imported.length){
          window.showAppToast?.("No usable loadouts were found in that JSON file.",'warning');
          return;
        }
        const list=loadLibrary();
        imported.forEach(item=>{
          const id=`loadout_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
          list.push({id,name:item.name,data:item.data,createdAt:Date.now(),updatedAt:Date.now()});
        });
        saveLibrary(list);renderLibrary();syncEquippedLabels();
        alert(`Imported ${imported.length} loadout${imported.length===1?'':'s'}.`);
      }catch(err){
        console.error(err);
        window.showAppToast?.("Could not import that loadout file.",'warning');
      }
    };
    input.click();
  }

  function exportLoadouts(){
    const list=loadLibrary();
    if(!list.length){
      window.showAppToast?.("There are no saved loadouts to export.",'warning');
      return;
    }
    const payload={
      schema:SCHEMA,
      version:VERSION,
      exportedAt:new Date().toISOString(),
      equippedId:getEquippedId(),
      loadouts:list
    };
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=`entropia-loadouts-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function handleLibraryClick(e){
    const btn=e.target.closest('[data-action]');
    if(!btn)return;
    e.stopPropagation();
    const id=btn.dataset.id;
    if(btn.dataset.action==='load')loadIntoBuilder(id);
    if(btn.dataset.action==='equip')equip(id);
    if(btn.dataset.action==='duplicate')duplicate(id);
    if(btn.dataset.action==='delete')remove(id);
  }

  function bind(){
    renderEnhancers();
    document.getElementById('savedLoadoutList')?.addEventListener('click',e=>{
      const card=e.target.closest('.saved-loadout-card');
      if(e.target.closest('[data-action]'))return handleLibraryClick(e);
      if(card)loadIntoBuilder(card.dataset.loadoutId);
    });

    const builder=document.getElementById('huntLoadoutsTab');
    builder?.addEventListener('input',e=>{
      if(e.target.matches('input,select'))recalc();
    });

    document.getElementById('nexusPickerSearch')?.addEventListener('input',renderPickerResults);
    document.getElementById('nexusPickerResults')?.addEventListener('click',e=>{const row=e.target.closest('.nexus-result-row');if(row)selectPickerIndex(Number(row.dataset.pickerIndex));});
    document.getElementById('nexusPickerResults')?.addEventListener('dblclick',e=>{const row=e.target.closest('.nexus-result-row');if(row){selectPickerIndex(Number(row.dataset.pickerIndex));useSelectedPickerItem();}});

    if(!currentId)newLoadout();
    renderLibrary();
    syncEquippedLabels();
    setBuilderView('cards');
  }

  function refresh(){
    renderEnhancers();
    renderLibrary();
    syncEquippedLabels();
    recalc();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
  else bind();

  return {
    calculate,
    getSavedLoadouts:loadLibrary,
    getEquippedLoadout:getEquippedEntry,
    getEquippedLoadoutId:getEquippedId,
    saveCurrent,
    newLoadout,
    equip,
    duplicate,
    delete:remove,
    importLoadouts,
    exportLoadouts,
    refresh,
    syncEquippedLabels,
    loadIntoBuilder,
    normalizeOldLoadout,
    openItemPicker,closeItemPicker,refreshPickerData,useSelectedPickerItem,applyNexusItem,toggleMarketMarkup,loadEquippedIntoBuilder,equipBuilder,setSummaryMode,setBuilderView,clearSlot,enableSecondaryAmp,removeSecondaryAmp
  };
})();
