'use strict';

window.EntropiaHuntTracker=(function(){
  const STORAGE_KEY='entropia_live_hunt_session_v1';
  const SAVED_KEY='entropia_saved_hunts_v1';

  const rx={
    inflicted:/inflicted\s+([\d.]+)/i,
    took:/took\s+([\d.]+)/i,
    healed:/You healed(?:\s+\w+)?\s+([\d.]+)/i,
    crit:/critical hit/i,
    evade:/The target Evaded your attack/i,
    dodge:/The target Dodged your attack/i,
    miss:/You missed/i,
    death:/You were killed by/i,
    enhancer:/Your enhancer (.+?) on your (.+?) broke\./i,
    loot:/You received\s+(.+?)\s+x\s+\((\d+)\)\s+Value:\s*([\d,.]+)\s*PED/i,
    lootLoose:/You received\s+(.+?)\s+Value:\s*([\d,.]+)\s*PED/i,
    global:/global|hall of fame|rare item|ATH/i,
    hof:/hall of fame|rare item|ATH/i
  };

  let session=createSession();
  let timer=null;
  let manualCostPerShot=null;
  let lastLootTimestampMs=0;
  const LOOT_BURST_MS=250;

  function createSession(){
    return {
      id:`hunt_${Date.now()}`,
      name:'',
      target:'',
      savedToHistory:false,
      historySavedAt:null,
      status:'idle',
      startedAt:null,
      stoppedAt:null,
      pausedAt:null,
      pausedMs:0,
      combatFirstAt:null,
      combatLastAt:null,
      shots:0,
      hits:0,
      crits:0,
      misses:0,
      evades:0,
      dodges:0,
      damageDealt:0,
      damageTaken:0,
      healing:0,
      deaths:0,
      enhancersBroken:0,
      loot:0,
      lootDrops:0,
      lootItems:0,
      lootRecords:[],
      lootDropRecords:[],
      universalAmmoConversions:[],
      universalAmmoPED:0,
      shrapnelConvertedPED:0,
      globalRecords:[],
      globals:0,
      hofs:0,
      events:[],
      loadoutId:null,
      loadoutName:'',
      weaponName:'',
      costPerShot:0,
      ammoPerShotPED:0,
      decayPerShotPED:0,
      trackedCost:0,
      trackedAmmoCost:0,
      trackedDecayCost:0,
      additionalCost:0,
      additionalCostLabel:'',
      additionalCosts:[],
      loadoutSegments:[]
    };
  }

  function num(v){const n=Number(v);return Number.isFinite(n)?n:0}

  function getLoadoutSnapshot(active=window.activeLoadout){
    if(!active)return null;
    const data=active.data?JSON.parse(JSON.stringify(active.data)):null;
    const attachments=data?.attachments||{};
    const slotCost={};

    const component=(slot,item)=>{
      const decay=num(item?.decayPEC)/100;
      const ammo=num(item?.ammoPEC)/100;
      slotCost[slot]={name:item?.name||'',decay,ammo,total:decay+ammo};
    };

    component('weapon',data?.weapon);
    ['amp','amp2','absorber','scope','sight1','sight2'].forEach(k=>component(k,attachments[k]));

    return {
      id:active.id||null,
      name:active.name||'Equipped Loadout',
      weaponName:active.weaponName||data?.weapon?.name||'',
      costPerShot:num(active.costPerShot),
      ammoPerShotPED:num(active.ammoPEC)/100,
      decayPerShotPED:num(active.decayPEC)/100,
      componentCost:slotCost,
      data,
      capturedAt:Date.now()
    };
  }

  function activeSessionSnapshot(){
    const segments=session.loadoutSegments||[];
    return segments.length?segments[segments.length-1]?.snapshot:null;
  }

  function currentShotCost(){
    if(manualCostPerShot!==null)return Math.max(0,num(manualCostPerShot));
    return Math.max(0,num(activeSessionSnapshot()?.costPerShot||session.costPerShot));
  }

  function recordShotCost(){
    const cost=currentShotCost();
    session.trackedCost=num(session.trackedCost)+cost;

    if(manualCostPerShot===null){
      const snap=activeSessionSnapshot();
      session.trackedAmmoCost=num(session.trackedAmmoCost)+num(snap?.ammoPerShotPED);
      session.trackedDecayCost=num(session.trackedDecayCost)+num(snap?.decayPerShotPED);
    }

    const segments=session.loadoutSegments||[];
    const segment=segments[segments.length-1];
    if(segment){
      segment.shots=(segment.shots||0)+1;
      segment.cost=(segment.cost||0)+cost;
    }
  }

  function beginLoadoutSegment(snapshot,reason='Loadout equipped'){
    if(!snapshot)return;
    session.loadoutSegments=session.loadoutSegments||[];
    const previous=session.loadoutSegments[session.loadoutSegments.length-1];
    if(previous&&!previous.endedAt)previous.endedAt=Date.now();
    session.loadoutSegments.push({
      id:`segment_${Date.now()}_${session.loadoutSegments.length+1}`,
      startedAt:Date.now(),
      endedAt:null,
      reason,
      shots:0,
      cost:0,
      snapshot:JSON.parse(JSON.stringify(snapshot))
    });
    session.loadoutId=snapshot.id;
    session.loadoutName=snapshot.name;
    session.weaponName=snapshot.weaponName;
    session.costPerShot=snapshot.costPerShot;
    session.ammoPerShotPED=snapshot.ammoPerShotPED;
    session.decayPerShotPED=snapshot.decayPerShotPED;
  }

  function activeElapsedMs(now=Date.now()){
    if(!session.startedAt)return 0;
    const end=session.status==='stopped'
      ?(session.stoppedAt||now)
      :(session.status==='paused'?(session.pausedAt||now):now);
    return Math.max(0,end-session.startedAt-session.pausedMs);
  }

  function combatElapsedMs(){
    if(!session.combatFirstAt)return 0;
    const end=session.combatLastAt||session.combatFirstAt;
    return Math.max(1,end-session.combatFirstAt);
  }

  function metrics(){
    const costPerShot=currentShotCost();
    const loadoutCost=num(session.trackedCost);
    const additionalCosts=Array.isArray(session.additionalCosts)?session.additionalCosts:[];
    const additionalCost=additionalCosts.length
      ?additionalCosts.reduce((sum,row)=>sum+Math.max(0,num(row.amount)),0)
      :Math.max(0,num(session.additionalCost));
    const totalCost=loadoutCost+additionalCost;
    const costPEC=totalCost*100;
    const profit=session.loot-totalCost;
    const returnPct=totalCost>0?(session.loot/totalCost)*100:0;
    const dpp=costPEC>0?session.damageDealt/costPEC:0;
    const combatMinutes=combatElapsedMs()/60000;
    const sessionMinutes=activeElapsedMs()/60000;
    const dps=combatElapsedMs()>0?session.damageDealt/(combatElapsedMs()/1000):0;
    const accuracy=session.shots>0?(session.hits/session.shots)*100:0;
    const avgLoot=session.lootDrops>0?session.loot/session.lootDrops:0;

    const ammoCost=num(session.trackedAmmoCost);
    const decayCost=num(session.trackedDecayCost);

    return {
      costPerShot,totalCost,profit,returnPct,dpp,dps,accuracy,avgLoot,
      elapsedMs:activeElapsedMs(),
      combatMs:combatElapsedMs(),
      costPerMinute:sessionMinutes>0?totalCost/sessionMinutes:0,
      lootPerMinute:sessionMinutes>0?session.loot/sessionMinutes:0,
      ammoCost,
      decayCost
    };
  }

  function escapeHtml(s){
    return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function fmtDuration(ms){
    let s=Math.floor(Math.max(0,ms)/1000);
    const h=Math.floor(s/3600);s%=3600;
    const m=Math.floor(s/60);s%=60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  function logEvent(type,value,detail,timestamp){
    const event={
      time:timestamp instanceof Date?timestamp.toISOString():new Date().toISOString(),
      type,value,detail
    };
    session.events.unshift(event);
    if(session.events.length>300)session.events.length=300;
  }

  function markCombatTime(date){
    const ms=(date instanceof Date&&!Number.isNaN(date.getTime()))?date.getTime():Date.now();
    if(!session.combatFirstAt)session.combatFirstAt=ms;
    session.combatLastAt=Math.max(session.combatLastAt||0,ms);
  }

  function validDateMs(date){
    return (date instanceof Date&&!Number.isNaN(date.getTime()))?date.getTime():Date.now();
  }

  function extractExplicitMobFromGlobal(line){
    const text=String(line||'');
    const patterns=[
      /killed\s+(?:a|an)\s+creature\s+\(([^)]+)\)\s+with\s+a\s+value/i,
      /killed\s+(?:a|an)\s+creature\s+(.+?)\s+with\s+a\s+value/i,
      /killed\s+(?:a|an)\s+([A-Za-z][A-Za-z0-9 '\-]+?)\s+with\s+a\s+value/i
    ];
    for(const rx of patterns){
      const m=text.match(rx);
      if(m?.[1]){
        const mob=m[1].trim().replace(/\s+/g,' ');
        if(mob.length>=2&&mob.length<=80)return mob;
      }
    }
    return null;
  }

  function ensureLootCollections(){
    session.lootRecords=Array.isArray(session.lootRecords)?session.lootRecords:[];
    session.lootDropRecords=Array.isArray(session.lootDropRecords)?session.lootDropRecords:[];
    session.universalAmmoConversions=Array.isArray(session.universalAmmoConversions)?session.universalAmmoConversions:[];
    session.universalAmmoPED=Math.max(0,num(session.universalAmmoPED));
    session.shrapnelConvertedPED=Math.max(0,num(session.shrapnelConvertedPED));
    session.globalRecords=Array.isArray(session.globalRecords)?session.globalRecords:[];
  }

  function currentLootDrop(ts){
    ensureLootCollections();
    const drops=session.lootDropRecords;
    const last=drops[drops.length-1];
    if(last&&ts-num(last.lastItemAt)<=LOOT_BURST_MS)return last;
    const drop={
      id:`drop_${ts}_${drops.length+1}`,
      startedAt:ts,
      lastItemAt:ts,
      totalPED:0,
      itemLineIds:[],
      itemCount:0,
      mobExplicit:null,
      mobInferred:null,
      location:null,
      area:null
    };
    drops.push(drop);
    session.lootDrops=drops.length;
    return drop;
  }

  function isUniversalAmmo(name,line=''){
    return /universal\s+ammo/i.test(String(name||'')) || /universal\s+ammo/i.test(String(line||''));
  }

  function recordUniversalAmmoConversion(name,quantity,value,date,sourceLine){
    ensureLootCollections();
    const ts=validDateMs(date);
    const universalAmmoPED=Math.max(0,num(value));
    const shrapnelCostPED=universalAmmoPED/1.01;

    const rec={
      id:`ammo_conversion_${ts}_${session.universalAmmoConversions.length+1}`,
      timestamp:ts,
      name:String(name||'Universal Ammo').trim()||'Universal Ammo',
      quantity:Math.max(1,parseInt(quantity,10)||1),
      universalAmmoPED,
      shrapnelCostPED,
      conversionRate:1.01,
      excludedFromLoot:true,
      sourceLine:String(sourceLine||'')
    };

    session.universalAmmoConversions.push(rec);
    session.universalAmmoPED+=universalAmmoPED;
    session.shrapnelConvertedPED+=shrapnelCostPED;

    // Preserve a raw item record for auditing/history, but explicitly mark
    // it excluded so it never participates in loot totals or loot drops.
    session.lootRecords.push({
      id:`loot_${ts}_${session.lootRecords.length+1}`,
      timestamp:ts,
      name:rec.name,
      quantity:rec.quantity,
      valuePED:universalAmmoPED,
      dropId:null,
      mobExplicit:null,
      mobInferred:null,
      location:null,
      area:null,
      excludedFromLoot:true,
      conversion:true,
      shrapnelCostPED,
      sourceLine:String(sourceLine||'')
    });

    // lootItems is intended to represent actual hunt loot item lines, not
    // conversion messages, so recalculate using included records only.
    session.lootItems=session.lootRecords.filter(row=>!row.excludedFromLoot).length;

    return rec;
  }

  function recordLootLine(name,quantity,value,date,sourceLine){
    ensureLootCollections();
    const ts=validDateMs(date);
    const drop=currentLootDrop(ts);
    const rec={
      id:`loot_${ts}_${session.lootRecords.length+1}`,
      timestamp:ts,
      name:String(name||'Unknown').trim()||'Unknown',
      quantity:Math.max(1,parseInt(quantity,10)||1),
      valuePED:Math.max(0,num(value)),
      dropId:drop.id,
      mobExplicit:null,
      mobInferred:null,
      location:null,
      area:null,
      excludedFromLoot:false,
      conversion:false,
      sourceLine:String(sourceLine||'')
    };
    session.lootRecords.push(rec);
    drop.lastItemAt=ts;
    drop.totalPED+=rec.valuePED;
    drop.itemLineIds.push(rec.id);
    drop.itemCount++;
    session.loot+=rec.valuePED;
    session.lootItems=session.lootRecords.filter(row=>!row.excludedFromLoot).length;
    session.lootDrops=session.lootDropRecords.length;
    return {record:rec,drop};
  }

  function recordPersonalGlobal(line,date,isHof){
    ensureLootCollections();
    const ts=validDateMs(date);
    const mobExplicit=extractExplicitMobFromGlobal(line);
    const valueMatch=String(line||'').match(/with\s+a\s+value\s+of\s+([\d,.]+)\s*PED/i);
    const valuePED=valueMatch?num(valueMatch[1].replace(/,/g,'')):0;
    const rec={
      id:`global_${ts}_${session.globalRecords.length+1}`,
      timestamp:ts,
      type:isHof?'HOF':'Global',
      valuePED,
      mobExplicit,
      mobInferred:null,
      location:null,
      area:null,
      sourceLine:String(line||'')
    };
    session.globalRecords.push(rec);

    // A personal global can explicitly identify the creature. If it lands
    // during the same loot burst, annotate that drop and its raw loot lines.
    // Otherwise the global record alone retains the explicit mob.
    if(mobExplicit){
      const drops=session.lootDropRecords||[];
      const drop=drops[drops.length-1];
      if(drop&&Math.abs(ts-num(drop.lastItemAt))<=2000){
        drop.mobExplicit=mobExplicit;
        for(const id of drop.itemLineIds||[]){
          const item=session.lootRecords.find(x=>x.id===id);
          if(item)item.mobExplicit=mobExplicit;
        }
      }
    }
    return rec;
  }

  function lootSummary(){
    ensureLootCollections();
    const includedRecords=session.lootRecords.filter(rec=>!rec.excludedFromLoot);
    const byName=new Map();
    for(const rec of includedRecords){
      const key=String(rec.name||'Unknown').trim().toLowerCase();
      const existing=byName.get(key)||{name:rec.name||'Unknown',quantity:0,valuePED:0,lines:0};
      existing.quantity+=Math.max(1,num(rec.quantity));
      existing.valuePED+=num(rec.valuePED);
      existing.lines++;
      byName.set(key,existing);
    }
    const items=[...byName.values()].sort((a,b)=>b.valuePED-a.valuePED);
    const drops=[...(session.lootDropRecords||[])].sort((a,b)=>b.totalPED-a.totalPED);
    return {
      items,
      drops,
      uniqueItems:items.length,
      largestDrop:drops[0]||null,
      largestItemLine:[...includedRecords].sort((a,b)=>b.valuePED-a.valuePED)[0]||null,
      universalAmmoPED:num(session.universalAmmoPED),
      shrapnelConvertedPED:num(session.shrapnelConvertedPED),
      universalAmmoConversions:Array.isArray(session.universalAmmoConversions)?session.universalAmmoConversions.length:0
    };
  }

  function processLine(line,date=new Date()){
    if(session.status!=='active')return false;
    if(!line||!line.trim())return false;

    const clean=line.trim();
    let match;

    if((match=clean.match(rx.inflicted))){
      const damage=num(match[1]);
      session.shots++;
      recordShotCost();
      session.hits++;
      session.damageDealt+=damage;
      if(rx.crit.test(clean))session.crits++;
      markCombatTime(date);
      logEvent(rx.crit.test(clean)?'Critical Hit':'Hit',`${damage.toFixed(1)} dmg`,clean,date);
      afterUpdate();
      return true;
    }

    if(rx.evade.test(clean)){
      session.shots++;recordShotCost();session.evades++;
      markCombatTime(date);
      logEvent('Evade','Shot spent',clean,date);
      afterUpdate();return true;
    }

    if(rx.dodge.test(clean)){
      session.shots++;recordShotCost();session.dodges++;
      markCombatTime(date);
      logEvent('Dodge','Shot spent',clean,date);
      afterUpdate();return true;
    }

    if(rx.miss.test(clean)){
      session.shots++;recordShotCost();session.misses++;
      markCombatTime(date);
      logEvent('Miss','Shot spent',clean,date);
      afterUpdate();return true;
    }

    if((match=clean.match(rx.took))){
      const damage=num(match[1]);
      session.damageTaken+=damage;
      markCombatTime(date);
      logEvent('Damage Taken',`${damage.toFixed(1)} dmg`,clean,date);
      afterUpdate();return true;
    }

    if((match=clean.match(rx.healed))){
      const amount=num(match[1]);
      session.healing+=amount;
      logEvent('Heal',`${amount.toFixed(1)} HP`,clean,date);
      afterUpdate();return true;
    }

    if(rx.death.test(clean)){
      session.deaths++;
      logEvent('Death','',clean,date);
      afterUpdate();return true;
    }

    if(rx.enhancer.test(clean)){
      session.enhancersBroken++;
      logEvent('Enhancer Break','1',clean,date);
      afterUpdate();return true;
    }

    // Preserve every raw loot line, while grouping nearby lines into one
    // logical loot drop. Mob attribution remains unknown unless an explicit
    // personal global/HOF line identifies the creature.
    if((match=clean.match(rx.loot))){
      const name=match[1].trim();
      const qty=parseInt(match[2],10)||1;
      const value=num(match[3].replace(/,/g,''));

      if(isUniversalAmmo(name,clean)){
        const conversion=recordUniversalAmmoConversion(name,qty,value,date,clean);
        logEvent(
          'Ammo Conversion',
          `${conversion.universalAmmoPED.toFixed(2)} PED`,
          `Shrapnel converted: ${conversion.shrapnelCostPED.toFixed(2)} PED → Universal Ammo at 101%`,
          date
        );
        afterUpdate();return true;
      }

      recordLootLine(name,qty,value,date,clean);
      lastLootTimestampMs=validDateMs(date);
      logEvent('Loot',`${value.toFixed(2)} PED`,`${name} × ${qty}`,date);
      afterUpdate();return true;
    }

    if((match=clean.match(rx.lootLoose))){
      const name=match[1].trim();
      const value=num(match[2].replace(/,/g,''));

      if(isUniversalAmmo(name,clean)){
        const conversion=recordUniversalAmmoConversion(name,1,value,date,clean);
        logEvent(
          'Ammo Conversion',
          `${conversion.universalAmmoPED.toFixed(2)} PED`,
          `Shrapnel converted: ${conversion.shrapnelCostPED.toFixed(2)} PED → Universal Ammo at 101%`,
          date
        );
        afterUpdate();return true;
      }

      recordLootLine(name,1,value,date,clean);
      lastLootTimestampMs=validDateMs(date);
      logEvent('Loot',`${value.toFixed(2)} PED`,name,date);
      afterUpdate();return true;
    }

    // Personal Globals/HOFs are counted only when the configured avatar name
    // is present so general [Globals] traffic cannot contaminate hunt stats.
    const avatar=String(window.userAvatarName||'').trim().toLowerCase();
    if(avatar && clean.toLowerCase().includes(avatar) && rx.global.test(clean)){
      const isHof=rx.hof.test(clean);
      if(isHof)session.hofs++;
      else session.globals++;
      const globalRec=recordPersonalGlobal(clean,date,isHof);
      logEvent(isHof?'HOF':'Global',globalRec.valuePED?`${globalRec.valuePED.toFixed(2)} PED`:'',globalRec.mobExplicit?`${globalRec.mobExplicit} · ${clean}`:clean,date);
      afterUpdate();return true;
    }

    return false;
  }

  function start(){
    if(session.status==='active')return;

    const snapshot=getLoadoutSnapshot();
    if(!snapshot && manualCostPerShot===null){
      window.showAppToast?.('No loadout or manual cost is set. Combat and loot will still be tracked, but cost-based metrics will stay unavailable.','warning',4200);
    }

    session=createSession();
    session.status='active';
    session.startedAt=Date.now();
    const initialTarget=String(document.getElementById('huntTargetInput')?.value||'').trim();
    const initialName=String(document.getElementById('huntNameInput')?.value||'').trim();
    session.target=initialTarget.slice(0,64);
    session.name=initialName.slice(0,64);
    if(snapshot){
      beginLoadoutSegment(snapshot,'Hunt started');
    }
    lastLootTimestampMs=0;
    logEvent('Session','Started',snapshot?.name||'No loadout',new Date());
    saveState();
    ensureTimer();
    render();
  }

  function togglePause(){
    if(session.status==='active'){
      session.status='paused';
      session.pausedAt=Date.now();
      logEvent('Session','Paused','',new Date());
    }else if(session.status==='paused'){
      session.pausedMs+=Date.now()-(session.pausedAt||Date.now());
      session.pausedAt=null;
      session.status='active';
      logEvent('Session','Resumed','',new Date());
    }
    saveState();render();
  }

  function stop(){
    if(!['active','paused'].includes(session.status))return;
    if(session.status==='paused'){
      session.pausedMs+=Date.now()-(session.pausedAt||Date.now());
      session.pausedAt=null;
    }
    session.status='stopped';
    session.stoppedAt=Date.now();
    const activeSegment=session.loadoutSegments?.[session.loadoutSegments.length-1];
    if(activeSegment&&!activeSegment.endedAt)activeSegment.endedAt=session.stoppedAt;
    logEvent('Session','Stopped','',new Date());
    session.savedToHistory=false;
    session.historySavedAt=null;
    saveState();
    window.showAppToast?.('Hunt stopped. Review the session and save it to Hunt History.','info',3500);
    render();
  }

  async function reset(){
    if(session.status==='active'||session.status==='paused'){
      const proceed=await window.appConfirm?.(
        'Reset the active hunt and discard its current metrics?',
        {title:'Reset Active Hunt',confirmText:'Reset Hunt'}
      );
      if(!proceed)return;
    }
    session=createSession();
    manualCostPerShot=null;
    lastLootTimestampMs=0;
    localStorage.removeItem(STORAGE_KEY);
    const input=document.getElementById('huntManualCostInput');
    if(input)input.value='';
    render();
  }

  function applyManualCost(){
    const input=document.getElementById('huntManualCostInput');
    const value=num(input?.value);
    if(value<0)return;
    manualCostPerShot=value;
    render();
    saveState();
  }

  function clearManualCost(){
    manualCostPerShot=null;
    const input=document.getElementById('huntManualCostInput');
    if(input)input.value='';
    render();saveState();
  }

  function loadHistory(){
    try{
      const parsed=JSON.parse(localStorage.getItem(SAVED_KEY)||'[]');
      return Array.isArray(parsed)?parsed:[];
    }catch{return []}
  }

  function saveHistory(list){
    localStorage.setItem(SAVED_KEY,JSON.stringify(Array.isArray(list)?list:[]));
  }

  function historyRecordFromSession(){
    const m=metrics();
    const summary=lootSummary();
    return {
      ...JSON.parse(JSON.stringify(session)),
      status:'completed',
      metrics:{...m},
      lootSummary:{
        uniqueItems:summary.uniqueItems,
        largestDropPED:num(summary.largestDrop?.totalPED),
        largestItemLinePED:num(summary.largestItemLine?.valuePED),
        universalAmmoPED:num(summary.universalAmmoPED),
        shrapnelConvertedPED:num(summary.shrapnelConvertedPED),
        universalAmmoConversions:num(summary.universalAmmoConversions)
      },
      savedAt:new Date().toISOString()
    };
  }

  function saveCompletedSession(){
    if(session.status!=='stopped'){
      window.showAppToast?.('Stop the hunt before saving it to history.','warning');
      return false;
    }
    if(!session.shots&&!session.loot&&!session.damageDealt){
      window.showAppToast?.('There is no hunt activity to save.','warning');
      return false;
    }

    // Sync any final text edits before snapshotting.
    session.name=String(document.getElementById('huntNameInput')?.value||session.name||'').trim().slice(0,64);
    session.target=String(document.getElementById('huntTargetInput')?.value||session.target||'').trim().slice(0,64);
    if(!session.name){
      const d=new Date(session.startedAt||Date.now());
      session.name=`Hunt · ${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
    }

    const record=historyRecordFromSession();
    let list=loadHistory();
    const existing=list.findIndex(x=>x.id===record.id);
    if(existing>=0)list[existing]=record;
    else list.unshift(record);
    if(list.length>200)list=list.slice(0,200);
    saveHistory(list);

    session.savedToHistory=true;
    session.historySavedAt=record.savedAt;
    saveState();
    renderHistory();
    render();
    window.showAppToast?.('Hunt saved to history.','success');
    window.dispatchEvent(new CustomEvent('hunt-history-updated',{detail:{id:session.id}}));
    return true;
  }

  function deleteHistory(id){
    const list=loadHistory().filter(x=>x.id!==id);
    saveHistory(list);
    renderHistory();
    window.showAppToast?.('Hunt removed from history.','info');
  }

  async function requestDeleteHistory(id){
    const record=loadHistory().find(x=>x.id===id);
    if(!record)return;
    const ok=await window.appConfirm?.(
      `Delete "${record.name||'this hunt'}" from Hunt History?`,
      {title:'Delete Saved Hunt',confirmText:'Delete Hunt'}
    );
    if(ok)deleteHistory(id);
  }

  function fmtDateTime(ms){
    if(!ms)return '—';
    const d=new Date(ms);
    if(Number.isNaN(d.getTime()))return '—';
    return `${d.toLocaleDateString()} ${d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}`;
  }

  function renderHistory(){
    const host=document.getElementById('huntHistoryList');
    const count=document.getElementById('huntHistoryCount');
    if(!host&&!count)return;
    const list=loadHistory();
    if(count)count.textContent=String(list.length);
    if(!host)return;
    if(!list.length){
      host.innerHTML='<div class="empty">No saved hunts yet.</div>';
      return;
    }
    host.innerHTML=list.map(h=>{
      const m=h.metrics||{};
      const profit=num(m.profit);
      const duration=num(m.elapsedMs);
      return `<article class="hunt-history-card" onclick="EntropiaHuntTracker.openHistoryDetails('${escapeHtml(h.id)}')">
        <div class="hunt-history-card-head">
          <b>${escapeHtml(h.name||'Saved Hunt')}</b>
          <span class="${profit>=0?'success':'danger'}">${profit>=0?'+':''}${profit.toFixed(2)} PED</span>
        </div>
        <div class="hunt-history-target">${escapeHtml(h.target||h.weaponName||'Unspecified target')}</div>
        <div class="hunt-history-mini">
          <span>${num(m.totalCost).toFixed(2)} cost</span>
          <span>${num(h.loot).toFixed(2)} loot</span>
          <span>${num(m.returnPct).toFixed(1)}%</span>
        </div>
        <div class="hunt-history-footer">
          <span>${escapeHtml(fmtDateTime(h.startedAt))}</span>
          <button class="btn slot-clear-btn" type="button" onclick="event.stopPropagation();EntropiaHuntTracker.requestDeleteHistory('${escapeHtml(h.id)}')">Delete</button>
        </div>
      </article>`;
    }).join('');
  }

  function openHistoryDetails(id){
    const h=loadHistory().find(x=>x.id===id);
    if(!h)return;
    const m=h.metrics||{};
    const body=document.getElementById('huntHistoryDetailBody');
    const title=document.getElementById('huntHistoryDetailTitle');
    const date=document.getElementById('huntHistoryDetailDate');
    if(title)title.textContent=h.name||'Saved Hunt';
    if(date)date.textContent=fmtDateTime(h.startedAt);
    if(body){
      body.innerHTML=`
        <div class="hunt-history-detail-grid">
          <div><span>Target</span><b>${escapeHtml(h.target||'—')}</b></div>
          <div><span>Loadout</span><b>${escapeHtml(h.loadoutName||'—')}</b></div>
          <div><span>Started</span><b>${escapeHtml(fmtDateTime(h.startedAt))}</b></div>
          <div><span>Ended</span><b>${escapeHtml(fmtDateTime(h.stoppedAt))}</b></div>
          <div><span>Elapsed</span><b>${fmtDuration(num(m.elapsedMs))}</b></div>
          <div><span>Total Cost</span><b>${num(m.totalCost).toFixed(2)} PED</b></div>
          <div><span>Total Loot</span><b>${num(h.loot).toFixed(2)} PED</b></div>
          <div><span>Return</span><b>${num(m.returnPct).toFixed(2)}%</b></div>
          <div><span>Profit / Loss</span><b class="${num(m.profit)>=0?'success':'danger'}">${num(m.profit)>=0?'+':''}${num(m.profit).toFixed(2)} PED</b></div>
          <div><span>DPP</span><b>${num(m.dpp).toFixed(2)}</b></div>
          <div><span>DPS</span><b>${num(m.dps).toFixed(1)}</b></div>
          <div><span>Accuracy</span><b>${num(m.accuracy).toFixed(1)}%</b></div>
          <div><span>Shots</span><b>${num(h.shots)}</b></div>
          <div><span>Hits / Misses</span><b>${num(h.hits)} / ${num(h.misses)}</b></div>
          <div><span>Evades / Dodges</span><b>${num(h.evades)} / ${num(h.dodges)}</b></div>
          <div><span>Globals / HOFs</span><b>${num(h.globals)} / ${num(h.hofs)}</b></div>
          <div><span>Largest Loot</span><b>${num(h.lootSummary?.largestDropPED).toFixed(2)} PED</b></div>
          <div><span>Unique Items</span><b>${num(h.lootSummary?.uniqueItems)}</b></div>
          <div><span>Universal Ammo Converted</span><b>${num(h.lootSummary?.universalAmmoPED).toFixed(2)} PED</b></div>
          <div><span>Shrapnel Used</span><b>${num(h.lootSummary?.shrapnelConvertedPED).toFixed(2)} PED</b></div>
        </div>`;
    }
    document.getElementById('huntHistoryBackdrop')?.classList.remove('hidden');
  }

  function closeHistoryDetails(event){
    if(event&&event.target!==document.getElementById('huntHistoryBackdrop'))return;
    document.getElementById('huntHistoryBackdrop')?.classList.add('hidden');
  }


  function exportSession(){
    const payload={
      schema:'pixelb8-entropia-hunt-session',
      version:1,
      exportedAt:new Date().toISOString(),
      session,
      metrics:metrics(),
      activeLoadout:window.activeLoadout||null
    };
    const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=`entropia-hunt-${new Date().toISOString().replace(/[:.]/g,'-')}.json`;
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  function saveState(){
    localStorage.setItem(STORAGE_KEY,JSON.stringify({session,manualCostPerShot}));
  }

  function restoreState(){
    try{
      const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(!saved?.session)return;
      session={
        ...createSession(),
        ...saved.session,
        events:Array.isArray(saved.session.events)?saved.session.events:[],
        lootRecords:Array.isArray(saved.session.lootRecords)?saved.session.lootRecords:[],
        lootDropRecords:Array.isArray(saved.session.lootDropRecords)?saved.session.lootDropRecords:[],
        universalAmmoConversions:Array.isArray(saved.session.universalAmmoConversions)?saved.session.universalAmmoConversions:[],
        universalAmmoPED:num(saved.session.universalAmmoPED),
        shrapnelConvertedPED:num(saved.session.shrapnelConvertedPED),
        globalRecords:Array.isArray(saved.session.globalRecords)?saved.session.globalRecords:[],
        loadoutSegments:Array.isArray(saved.session.loadoutSegments)?saved.session.loadoutSegments:[]
      };
      manualCostPerShot=saved.manualCostPerShot??null;

      // Migrate older session records that accidentally counted Universal Ammo
      // conversion messages as hunt loot.
      const legacyAmmo=session.lootRecords.filter(rec=>isUniversalAmmo(rec.name,rec.sourceLine)&&!rec.excludedFromLoot);
      if(legacyAmmo.length){
        let removedLoot=0;
        for(const rec of legacyAmmo){
          rec.excludedFromLoot=true;
          rec.conversion=true;
          rec.dropId=null;
          rec.shrapnelCostPED=num(rec.valuePED)/1.01;
          removedLoot+=num(rec.valuePED);
          if(!session.universalAmmoConversions.some(x=>x.sourceLine===rec.sourceLine&&x.timestamp===rec.timestamp)){
            session.universalAmmoConversions.push({
              id:`ammo_conversion_migrated_${rec.id}`,
              timestamp:rec.timestamp,
              name:rec.name,
              quantity:rec.quantity||1,
              universalAmmoPED:num(rec.valuePED),
              shrapnelCostPED:num(rec.valuePED)/1.01,
              conversionRate:1.01,
              excludedFromLoot:true,
              sourceLine:rec.sourceLine||''
            });
          }
        }
        session.universalAmmoPED=session.universalAmmoConversions.reduce((s,x)=>s+num(x.universalAmmoPED),0);
        session.shrapnelConvertedPED=session.universalAmmoConversions.reduce((s,x)=>s+num(x.shrapnelCostPED),0);
        session.loot=Math.max(0,num(session.loot)-removedLoot);

        // Remove conversion line ids/value from legacy drop groups where possible.
        for(const drop of session.lootDropRecords){
          const conversionIds=new Set(legacyAmmo.map(x=>x.id));
          const removed=legacyAmmo.filter(x=>(drop.itemLineIds||[]).includes(x.id)).reduce((s,x)=>s+num(x.valuePED),0);
          drop.itemLineIds=(drop.itemLineIds||[]).filter(id=>!conversionIds.has(id));
          drop.itemCount=drop.itemLineIds.length;
          drop.totalPED=Math.max(0,num(drop.totalPED)-removed);
        }
        session.lootDropRecords=session.lootDropRecords.filter(drop=>(drop.itemLineIds||[]).length>0);
        session.lootDrops=session.lootDropRecords.length;
        session.lootItems=session.lootRecords.filter(row=>!row.excludedFromLoot).length;
      }

      if(!Array.isArray(session.additionalCosts))session.additionalCosts=[];
      if(!session.additionalCosts.length&&num(session.additionalCost)>0){
        session.additionalCosts=[{
          id:`cost_legacy_${Date.now()}`,
          label:session.additionalCostLabel||'Additional Cost',
          amount:num(session.additionalCost),
          addedAt:session.startedAt||Date.now()
        }];
      }

      // A browser reload should not silently continue spending PED.
      if(session.status==='active'){
        session.status='paused';
        session.pausedAt=Date.now();
      }
    }catch{}
  }

  function afterUpdate(){
    saveState();
    render();
    window.dispatchEvent(new CustomEvent('hunt-metrics-updated',{detail:{session:getSession(),metrics:metrics()}}));
  }

  function setText(id,text){
    const el=document.getElementById(id);
    if(el)el.textContent=text;
  }

  function renderFeed(){
    const body=document.getElementById('huntEventFeed');
    if(!body)return;
    setText('huntFeedCount',`${session.events.length} event${session.events.length===1?'':'s'}`);
    if(!session.events.length){
      body.innerHTML='<tr><td colspan="4" class="empty">Start a hunt to begin tracking live combat.</td></tr>';
      return;
    }
    body.innerHTML=session.events.slice(0,150).map(ev=>{
      const d=new Date(ev.time);
      const time=Number.isNaN(d.getTime())?'--:--:--':d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
      return `<tr>
        <td>${escapeHtml(time)}</td>
        <td>${escapeHtml(ev.type)}</td>
        <td>${escapeHtml(ev.value||'—')}</td>
        <td title="${escapeHtml(ev.detail||'')}">${escapeHtml(ev.detail||'')}</td>
      </tr>`;
    }).join('');
  }

  function addAdditionalCost(){
    const amountInput=document.getElementById('huntAdditionalCost');
    const labelInput=document.getElementById('huntAdditionalCostLabel');
    const amount=Math.max(0,num(amountInput?.value));
    const label=String(labelInput?.value||'').trim().slice(0,40);

    if(amount<=0){
      window.showAppToast?.('Enter an additional cost amount greater than 0 PED.','warning');
      return;
    }

    session.additionalCosts=Array.isArray(session.additionalCosts)?session.additionalCosts:[];
    session.additionalCosts.push({
      id:`cost_${Date.now()}_${session.additionalCosts.length+1}`,
      label:label||'Additional Cost',
      amount,
      addedAt:Date.now()
    });

    // Legacy aggregate fields retained so older exports/readers still see a total.
    session.additionalCost=session.additionalCosts.reduce((sum,row)=>sum+Math.max(0,num(row.amount)),0);
    session.additionalCostLabel=session.additionalCosts.length===1?session.additionalCosts[0].label:'Additional Costs';

    if(amountInput)amountInput.value='';
    if(labelInput)labelInput.value='';

    logEvent('Additional Cost',`${amount.toFixed(2)} PED`,label||'Additional Cost',new Date());
    saveState();
    render();
  }

  function removeAdditionalCost(id){
    session.additionalCosts=(Array.isArray(session.additionalCosts)?session.additionalCosts:[]).filter(row=>row.id!==id);
    session.additionalCost=session.additionalCosts.reduce((sum,row)=>sum+Math.max(0,num(row.amount)),0);
    session.additionalCostLabel=session.additionalCosts.length===1?session.additionalCosts[0].label:(session.additionalCosts.length?'Additional Costs':'');
    saveState();
    render();
  }


  function renderLootBreakdown(){
    const summary=lootSummary();
    setText('huntUniqueLootItems',summary.uniqueItems);
    setText('huntLargestLoot',`${num(summary.largestDrop?.totalPED).toFixed(2)} PED`);
    setText('huntLootLineCount',session.lootRecords.filter(row=>!row.excludedFromLoot).length);
    setText('huntLootDropCount',session.lootDropRecords.length);
    setText('huntUniversalAmmo',`${summary.universalAmmoPED.toFixed(2)} PED`);
    setText('huntShrapnelConverted',`${summary.shrapnelConvertedPED.toFixed(2)} PED`);

    const itemBody=document.getElementById('huntLootItemBody');
    if(itemBody){
      if(!summary.items.length){
        itemBody.innerHTML='<tr><td colspan="4" class="empty">No loot recorded yet.</td></tr>';
      }else{
        itemBody.innerHTML=summary.items.slice(0,100).map(item=>`<tr>
          <td>${escapeHtml(item.name)}</td>
          <td>${Math.round(item.quantity)}</td>
          <td>${item.valuePED.toFixed(2)} PED</td>
          <td>${item.lines}</td>
        </tr>`).join('');
      }
    }

    const dropBody=document.getElementById('huntLootDropBody');
    if(dropBody){
      const recent=[...(session.lootDropRecords||[])].reverse().slice(0,60);
      if(!recent.length){
        dropBody.innerHTML='<tr><td colspan="4" class="empty">No loot drops recorded yet.</td></tr>';
      }else{
        dropBody.innerHTML=recent.map(drop=>{
          const d=new Date(drop.startedAt);
          const time=Number.isNaN(d.getTime())?'--:--:--':d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit',second:'2-digit'});
          return `<tr>
            <td>${escapeHtml(time)}</td>
            <td>${drop.totalPED.toFixed(2)} PED</td>
            <td>${drop.itemCount||0}</td>
            <td>${escapeHtml(drop.mobExplicit||'Unknown')}</td>
          </tr>`;
        }).join('');
      }
    }
  }

  function setSessionName(value){
    session.name=String(value||'').slice(0,64);
    saveState();
  }

  function setSessionTarget(value){
    session.target=String(value||'').slice(0,64);
    saveState();
  }

  let activityView='feed';

  function setActivityView(view){
    activityView=view==='loot'?'loot':'feed';
    const feedView=document.getElementById('huntActivityFeedView');
    const lootView=document.getElementById('huntActivityLootView');
    const feedBtn=document.getElementById('huntActivityFeedBtn');
    const lootBtn=document.getElementById('huntActivityLootBtn');
    if(feedView)feedView.classList.toggle('hidden',activityView!=='feed');
    if(lootView)lootView.classList.toggle('hidden',activityView!=='loot');
    if(feedBtn)feedBtn.classList.toggle('active',activityView==='feed');
    if(lootBtn)lootBtn.classList.toggle('active',activityView==='loot');

    const count=document.getElementById('huntFeedCount');
    if(count){
      count.textContent=activityView==='feed'
        ?`${session.events.length} event${session.events.length===1?'':'s'}`
        :`${session.lootDropRecords?.length||0} drop${(session.lootDropRecords?.length||0)===1?'':'s'}`;
    }
  }

  function render(){
    const m=metrics();
    renderLootBreakdown();

    const nameInput=document.getElementById('huntNameInput');
    const targetInput=document.getElementById('huntTargetInput');
    if(nameInput&&document.activeElement!==nameInput)nameInput.value=session.name||'';
    if(targetInput&&document.activeElement!==targetInput)targetInput.value=session.target||'';
    setText('huntSessionLoadout',session.loadoutName||window.activeLoadout?.name||'No loadout');
    setText('huntSessionStarted',fmtDateTime(session.startedAt));
    setText('huntSessionEnded',fmtDateTime(session.stoppedAt));
    setText('huntSessionElapsed',fmtDuration(m.elapsedMs));
    setText('huntSessionSavedState',
      session.savedToHistory?'Saved to history':
      session.status==='stopped'?'Ready to save':
      session.status==='idle'?'Not started':'In progress'
    );
    const saveBtn=document.getElementById('huntSaveBtn');
    if(saveBtn){
      saveBtn.disabled=session.status!=='stopped'||session.savedToHistory;
      saveBtn.textContent=session.savedToHistory?'Saved ✓':'Save Hunt';
    }
    setText('huntMetricCost',`${m.totalCost.toFixed(2)} PED`);
    setText('huntMetricCostSub',`${session.shots} shots · ${m.costPerShot.toFixed(4)} PED/shot`);
    setText('huntMetricLoot',`${session.loot.toFixed(2)} PED`);
    setText('huntMetricLootSub',`${session.lootDrops} loot drop${session.lootDrops===1?'':'s'} · ${session.lootItems} item lines`);
    setText('huntMetricProfit',`${m.profit>=0?'+':''}${m.profit.toFixed(2)} PED`);
    setText('huntMetricReturn',`Return ${m.returnPct.toFixed(2)}%`);
    setText('huntMetricDamage',session.damageDealt.toFixed(1));
    setText('huntMetricAccuracy',`Accuracy ${m.accuracy.toFixed(1)}%`);
    setText('huntMetricDpp',m.dpp.toFixed(2));
    setText('huntMetricDps',m.dps.toFixed(1));
    setText('huntMetricDuration',`${fmtDuration(m.combatMs)} combat`);

    const profitEl=document.getElementById('huntMetricProfit');
    if(profitEl){
      profitEl.classList.toggle('success',m.profit>=0);
      profitEl.classList.toggle('danger',m.profit<0);
    }

    setText('huntShots',session.shots);
    setText('huntHits',session.hits);
    setText('huntCrits',session.crits);
    setText('huntMisses',session.misses);
    setText('huntEvades',session.evades);
    setText('huntDodges',session.dodges);
    setText('huntDamageTaken',session.damageTaken.toFixed(1));
    setText('huntHealing',session.healing.toFixed(1));
    setText('huntDeaths',session.deaths);
    setText('huntEnhancers',session.enhancersBroken);
    setText('huntGlobals',session.globals);
    setText('huntHofs',session.hofs);

    setText('huntCostPerShot',`${m.costPerShot.toFixed(4)} PED`);
    setText('huntAmmoCost',`${m.ammoCost.toFixed(2)} PED`);
    setText('huntDecayCost',`${m.decayCost.toFixed(2)} PED`);
    setText('huntAvgLoot',`${m.avgLoot.toFixed(2)} PED`);
    setText('huntCostPerMinute',`${m.costPerMinute.toFixed(2)} PED`);
    setText('huntLootPerMinute',`${m.lootPerMinute.toFixed(2)} PED`);

    const useLoadoutBtn=document.getElementById('huntUseLoadoutCostBtn');
    const applyManualBtn=document.getElementById('huntApplyManualCostBtn');
    const costSourceHint=document.getElementById('huntCostSourceHint');
    if(useLoadoutBtn)useLoadoutBtn.classList.toggle('active',manualCostPerShot===null);
    if(applyManualBtn)applyManualBtn.classList.toggle('active',manualCostPerShot!==null);
    if(costSourceHint){
      costSourceHint.textContent=manualCostPerShot===null
        ?'Using equipped loadout economics for new shots.'
        :`Using manual override: ${num(manualCostPerShot).toFixed(4)} PED per shot.`;
    }

    const additionalList=document.getElementById('huntAdditionalCostList');
    if(additionalList){
      const rows=Array.isArray(session.additionalCosts)?session.additionalCosts:[];
      if(!rows.length){
        additionalList.innerHTML='<div class="empty">No additional costs added.</div>';
      }else{
        additionalList.innerHTML=rows.map(row=>`<div class="hunt-additional-cost-row">
          <div>
            <b>${escapeHtml(row.label||'Additional Cost')}</b>
            <span>${new Date(row.addedAt||Date.now()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span>
          </div>
          <strong>${num(row.amount).toFixed(2)} PED</strong>
          <button class="btn slot-clear-btn" type="button" onclick="EntropiaHuntTracker.removeAdditionalCost('${escapeHtml(row.id)}')">Remove</button>
        </div>`).join('');
      }
    }

    const breakdown=document.getElementById('huntCostBreakdown');
    if(breakdown){
      const segments=session.loadoutSegments||[];
      if(!segments.length){
        breakdown.innerHTML='<div class="empty">Start a hunt to build a cost breakdown.</div>';
      }else{
        breakdown.innerHTML=segments.map((seg,i)=>{
          const snap=seg.snapshot||{};
          return `<div class="hunt-cost-segment">
            <div class="hunt-cost-segment-head">
              <b>${i+1}. ${escapeHtml(snap.name||'Loadout')}</b>
              <span>${seg.shots||0} shots · ${(seg.cost||0).toFixed(2)} PED</span>
            </div>
            <div class="hunt-cost-segment-sub">${escapeHtml(snap.weaponName||'')} · ${num(snap.costPerShot).toFixed(4)} PED/shot</div>
          </div>`;
                }).join('') + (
          (Array.isArray(session.additionalCosts)&&session.additionalCosts.length)
            ?session.additionalCosts.map(row=>`<div class="hunt-cost-segment additional">
              <div class="hunt-cost-segment-head">
                <b>${escapeHtml(row.label||'Additional Cost')}</b>
                <span>${num(row.amount).toFixed(2)} PED</span>
              </div>
              <div class="hunt-cost-segment-sub">Additional hunt expense</div>
            </div>`).join('')
            :(m.additionalCost>0?`<div class="hunt-cost-segment additional">
              <div class="hunt-cost-segment-head">
                <b>${escapeHtml(m.additionalCostLabel||'Additional Cost')}</b>
                <span>${m.additionalCost.toFixed(2)} PED</span>
              </div>
              <div class="hunt-cost-segment-sub">Additional hunt expense</div>
            </div>`:'')
        );
      }
    }

    const active=window.activeLoadout;
    setText('huntCurrentWeapon',active?.weaponName||session.weaponName||'No weapon');
    setText('huntEconomyMode',manualCostPerShot!==null?'Manual cost override':'Equipped loadout');

    const status=document.getElementById('huntSessionStatus');
    if(status){
      status.textContent=session.status.toUpperCase();
      status.className=`hunt-status ${session.status}`;
    }
    const start=document.getElementById('huntStartBtn');
    const pause=document.getElementById('huntPauseBtn');
    const stop=document.getElementById('huntStopBtn');
    if(start)start.disabled=session.status==='active'||session.status==='paused';
    if(pause){
      pause.disabled=!['active','paused'].includes(session.status);
      pause.textContent=session.status==='paused'?'▶ Resume':'Ⅱ Pause';
    }
    if(stop)stop.disabled=!['active','paused'].includes(session.status);

    const manual=document.getElementById('huntManualCostInput');
    if(manual&&manualCostPerShot!==null&&document.activeElement!==manual)manual.value=manualCostPerShot.toFixed(4);

    renderFeed();
    setActivityView(activityView);
    syncStreamerTelemetry();
  }

  function syncStreamerTelemetry(){
    const m=metrics();
    const values={
      dps:m.dps.toFixed(1),
      damage:session.damageDealt.toFixed(1),
      cost:`${m.totalCost.toFixed(2)} PED`,
      profit:`${m.profit>=0?'+':''}${m.profit.toFixed(2)} PED`,
      efficiency:`${m.returnPct.toFixed(1)}%`
    };
    const panel=document.querySelector('#streamerHud .hud-panel[data-panel-id="combatTelemetry"]');
    if(!panel)return;
    Object.entries(values).forEach(([metric,value])=>{
      const cell=panel.querySelector(`[data-metric="${metric}"] .hud-stat-value`);
      if(cell){
        cell.textContent=value;
        cell.classList.remove('hud-placeholder');
      }
    });
  }

  function ensureTimer(){
    if(timer)return;
    timer=setInterval(()=>{
      if(session.status==='active')render();
    },1000);
  }

  function getSession(){return JSON.parse(JSON.stringify(session))}
  function getMetrics(){return {...metrics()}}

  function bind(){
    restoreState();
    ensureTimer();

    const nameInput=document.getElementById('huntNameInput');
    const targetInput=document.getElementById('huntTargetInput');

    if(nameInput){
      nameInput.value=session.name||'';
      nameInput.addEventListener('input',()=>setSessionName(nameInput.value));
    }
    if(targetInput){
      targetInput.value=session.target||'';
      targetInput.addEventListener('input',()=>setSessionTarget(targetInput.value));
    }

    window.addEventListener('loadout-equipped-changed',e=>{
      const newActive=e.detail?.activeLoadout||window.activeLoadout;
      const snap=getLoadoutSnapshot(newActive);

      if(['active','paused'].includes(session.status)&&snap){
        const current=activeSessionSnapshot();
        const changed=!current||
          current.id!==snap.id||
          Math.abs(num(current.costPerShot)-num(snap.costPerShot))>0.0000001;

        if(changed){
          beginLoadoutSegment(snap,'Loadout switched');
          logEvent('Loadout Change',`${snap.costPerShot.toFixed(4)} PED/shot`,`${snap.name} · ${snap.weaponName}`,new Date());
          saveState();
        }
      }
      render();
    });

    renderHistory();
    render();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);
  else bind();

  return {
    start,stop,togglePause,reset,
    processLine,
    applyManualCost,clearManualCost,
    addAdditionalCost,removeAdditionalCost,
    saveCompletedSession,renderHistory,openHistoryDetails,closeHistoryDetails,requestDeleteHistory,
    setActivityView,
    exportSession,
    render,
    getSession,getMetrics
  };
})();
