
'use strict';

window.EntropiaNexus=(function(){
  const BASE_URL='https://api.entropianexus.com';
  const DB_NAME='PixelB8EntropiaNexusCache';
  const STORE='responses';
  const DB_VERSION=1;
  const TTL=24*60*60*1000;
  const memory=new Map();
  const categoryEndpoints={weapons:['weapons'],attachments:['weaponamplifiers','weaponvisionattachments','absorbers','enhancers'],weaponamplifiers:['weaponamplifiers'],weaponvisionattachments:['weaponvisionattachments'],absorbers:['absorbers'],enhancers:['enhancers'],mobs:['mobs','mobspecies','mobmaturities']};
  let dbPromise=null;

  function openDb(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      const req=indexedDB.open(DB_NAME,DB_VERSION);
      req.onerror=()=>reject(req.error);req.onsuccess=()=>resolve(req.result);
      req.onupgradeneeded=e=>{const db=e.target.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'url'});};
    });
    return dbPromise;
  }
  async function getCached(url){
    if(memory.has(url))return {data:memory.get(url),cached:true,source:'memory'};
    try{const db=await openDb();const row=await new Promise(resolve=>{const req=db.transaction(STORE,'readonly').objectStore(STORE).get(url);req.onsuccess=()=>resolve(req.result||null);req.onerror=()=>resolve(null);});if(row&&Date.now()-row.timestamp<TTL){memory.set(url,row.data);return {data:row.data,cached:true,source:'indexeddb',timestamp:row.timestamp};}}catch(err){console.warn('Nexus cache read failed',err)}
    return null;
  }
  async function putCached(url,data){memory.set(url,data);try{const db=await openDb();await new Promise(resolve=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({url,data,timestamp:Date.now()});tx.oncomplete=resolve;tx.onerror=resolve;});}catch(err){console.warn('Nexus cache write failed',err)}}
  async function request(endpoint,{refresh=false,signal}={}){
    const path=String(endpoint||'').replace(/^\/+/, '');if(!path)throw new TypeError('Nexus endpoint required');const url=`${BASE_URL}/${path}`;
    if(!refresh){const cached=await getCached(url);if(cached)return cached}
    const response=await fetch(url,{headers:{Accept:'application/json'},signal});if(!response.ok)throw new Error(`Entropia Nexus API ${response.status}: ${path}`);const data=await response.json();await putCached(url,data);return {data,cached:false,source:'network',timestamp:Date.now()};
  }
  function unwrap(data){if(Array.isArray(data))return data;if(Array.isArray(data?.items))return data.items;if(Array.isArray(data?.results))return data.results;if(Array.isArray(data?.data))return data.data;return []}
  async function fetchCategory(category,{refresh=false,signal}={}){
    const endpoints=categoryEndpoints[category]||[category];const settled=await Promise.allSettled(endpoints.map(endpoint=>request(endpoint,{refresh,signal}).then(result=>({endpoint,...result}))));const items=[];let cachedCount=0;const errors=[];
    for(const result of settled){if(result.status!=='fulfilled'){errors.push(String(result.reason?.message||result.reason));continue}if(result.value.cached)cachedCount++;for(const raw of unwrap(result.value.data))items.push({...raw,_endpoint:result.value.endpoint,_nexusId:raw.id||raw.Id||raw.Name||raw.name});}
    return {items,cached:cachedCount===settled.length&&settled.length>0,errors};
  }
  function damageTotal(item){const damage=item?.Properties?.Damage||item?.properties?.damage||item?.Damage||{};if(typeof damage==='number')return Number(damage)||0;if(Array.isArray(damage))return damage.reduce((sum,v)=>sum+(Number(v?.Value??v)||0),0);return Object.values(damage||{}).reduce((sum,v)=>sum+(Number(v)||0),0)}
  function stats(item){
    const props=item?.Properties||item?.properties||{};const econ=props.Economy||props.economy||item?.Economy||{};const skill=props.Skill||props.skill||{};const ammoBurn=Number(econ.AmmoBurn??econ.ammoBurn??0)||0;const decay=Number(econ.Decay??econ.decay??0)||0;
    return {name:item?.Name||item?.name||'',endpoint:item?._endpoint||'',type:props.Type||props.type||item?.Type||'',damage:damageTotal(item),decayPEC:decay,ammoBurn,ammoPEC:ammoBurn*.01,efficiency:Number(econ.Efficiency??econ.Eff??econ.efficiency??0)||0,usesPerMinute:Number(props.UsesPerMinute??props.Uses??props.usesPerMinute??60)||60,range:Number(props.Range??props.range??0)||0,socket:Number(props.Socket??props.socket??0)||0,isSIB:!!(skill.IsSiB??skill.isSIB),hitStart:Number(skill.Hit?.LearningIntervalStart??skill.LearningIntervalStart??0)||0,hitEnd:Number(skill.Hit?.LearningIntervalEnd??skill.LearningIntervalEnd??100)||100,dmgStart:Number(skill.Dmg?.LearningIntervalStart??skill.LearningIntervalStart??0)||0,dmgEnd:Number(skill.Dmg?.LearningIntervalEnd??skill.LearningIntervalEnd??100)||100,raw:item};
  }
  function compatibleSlot(item,requestedSlot){const s=stats(item);if(requestedSlot==='weapon')return s.endpoint==='weapons';if(requestedSlot==='amp')return s.endpoint==='weaponamplifiers';if(requestedSlot==='absorber')return s.endpoint==='absorbers';if(requestedSlot==='enhancer')return s.endpoint==='enhancers';if(requestedSlot==='scope'||requestedSlot==='sight1'||requestedSlot==='sight2'){if(s.endpoint!=='weaponvisionattachments')return false;const lower=`${s.type} ${s.name}`.toLowerCase();if(requestedSlot==='scope')return lower.includes('scope');return !lower.includes('scope')}return true}
  async function clearCache(){memory.clear();try{const db=await openDb();await new Promise(resolve=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=resolve;tx.onerror=resolve;});}catch{}}
  return {BASE_URL,categoryEndpoints,request,fetchCategory,stats,damageTotal,compatibleSlot,clearCache};
})();
