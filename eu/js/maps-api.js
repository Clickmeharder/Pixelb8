'use strict';

window.PixelB8MapsAPI=(function(){
  const BASE='https://api.entropianexus.com/';
  const TP_CACHE='entropia_map_teleporters_cache_v2';
  const LOC_CACHE='entropia_map_locations_cache_v1';
  const CACHE_MAX_AGE=24*60*60*1000;

  let teleporters=[];
  let locations=[];
  let tpLoaded=false;
  let locLoaded=false;
  let tpByPlanet=new Map();
  let locByPlanet=new Map();

  function clean(s){return String(s||'').trim();}
  function normalizePlanetName(name){
    const raw=clean(name),key=raw.toLowerCase();
    return ({
      'planet calypso':'Calypso','planet arkadia':'Arkadia','planet arkadia underground':'Arkadia Underground',
      'planet cyrene':'Cyrene','planet toulan':'Toulan','asteroid f.o.m.a.':'FOMA','f.o.m.a.':'FOMA',
      'rocktropia':'ROCKtropia','hunt the thing':'Arctic','hell':'HELL','the hub':'The Hub',
      'next island':'Next Island','crystal palace':'Crystal Palace','calypso gateway':'Calypso Gateway',
      'secret island':'Secret Island','arkadia moon':'Arkadia Moon','ancient greece':'Ancient Greece'
    })[key]||raw;
  }

  function readCache(key){
    try{
      const data=JSON.parse(localStorage.getItem(key)||'null');
      if(data&&Array.isArray(data.items))return data;
    }catch{}
    return null;
  }
  function writeCache(key,items){
    try{localStorage.setItem(key,JSON.stringify({savedAt:Date.now(),items}));}catch{}
  }
  function rebuildIndexes(){
    tpByPlanet=new Map();
    for(const tp of teleporters){
      const k=normalizePlanetName(tp.planet).toLowerCase();
      if(!tpByPlanet.has(k))tpByPlanet.set(k,[]);
      tpByPlanet.get(k).push(tp);
    }
    locByPlanet=new Map();
    for(const item of locations){
      const k=normalizePlanetName(item.planet).toLowerCase();
      if(!locByPlanet.has(k))locByPlanet.set(k,[]);
      locByPlanet.get(k).push(item);
    }
  }

  function normalizeTeleporter(tp){
    const props=tp.Properties||tp.properties||{};
    const coords=props.Coordinates||props.coordinates||{};
    return {
      id:tp.Id||tp.id||tp.Name||tp.name||Math.random().toString(36).slice(2),
      name:tp.Name||tp.name||'Unknown Teleporter',
      planet:normalizePlanetName(tp.Planet?.Name||tp.PlanetName||tp.Planet||tp.planet||''),
      x:Number(coords.Longitude ?? coords.longitude ?? tp.Longitude ?? tp.longitude ?? tp.long ?? 0),
      y:Number(coords.Latitude ?? coords.latitude ?? tp.Latitude ?? tp.latitude ?? tp.lat ?? 0),
      z:Number(coords.Altitude ?? coords.altitude ?? tp.Altitude ?? tp.altitude ?? 0)
    };
  }

  function normalizeLocation(item){
    const props=item.Properties||item.properties||{};
    const coords=props.Coordinates||props.coordinates||{};
    const data=props.Data||props.data||item.Data||item.data||{};

    const rawType=
      item.type||
      item.Type?.Name||item.Type||
      item.LocationType?.Name||item.LocationType||
      props.Type?.Name||props.Type||props.type||
      item.Category?.Name||item.Category||'';

    const rawAreaType=
      item.AreaType?.Name||item.AreaType||
      props.AreaType?.Name||props.AreaType||props.areaType||
      data.AreaType||data.areaType||'';

    const type=clean(rawType).toLowerCase();
    const areaType=clean(rawAreaType);
    const shape=clean(props.Shape||props.shape||item.Shape||item.shape||data.Shape||data.shape);

    return {
      id:item.Id||item.id||`${item.Name||item.name||'location'}_${coords.Longitude||coords.longitude||0}_${coords.Latitude||coords.latitude||0}`,
      name:item.Name||item.name||props.Name||props.name||'Unknown Location',
      planet:normalizePlanetName(item.Planet?.Name||item.PlanetName||item.Planet||item.planet||''),
      type,areaType,shape,data,
      properties:props,
      maturities:Array.isArray(item.Maturities)?item.Maturities:[],
      facilities:Array.isArray(item.Facilities)?item.Facilities:[],
      waves:Array.isArray(item.Waves)?item.Waves:[],
      owner:item.Owner||null,
      parentLocation:item.ParentLocation||null,
      x:Number(item.long ?? item.Longitude ?? item.longitude ?? coords.Longitude ?? coords.longitude ?? 0),
      y:Number(item.lat ?? item.Latitude ?? item.latitude ?? coords.Latitude ?? coords.latitude ?? 0),
      z:Number(item.alt ?? item.Altitude ?? item.altitude ?? coords.Altitude ?? coords.altitude ?? 0),
      raw:item
    };
  }

  async function fetchJson(endpoint){
    const res=await fetch(BASE+endpoint,{cache:'force-cache'});
    if(!res.ok)throw new Error(`HTTP ${res.status}`);
    const raw=await res.json();
    return Array.isArray(raw)?raw:(Array.isArray(raw?.items)?raw.items:[]);
  }

  async function loadTeleporters(force=false){
    if(tpLoaded&&!force)return teleporters;
    const cached=readCache(TP_CACHE);
    if(cached){
      teleporters=cached.items;
      rebuildIndexes();
      if(!force && Date.now()-(cached.savedAt||0)<CACHE_MAX_AGE){
        tpLoaded=true;
        queueMicrotask(()=>window.PixelB8Maps?.refreshTeleporters?.());
        return teleporters;
      }
    }
    tpLoaded=true;
    try{
      const raw=await fetchJson('teleporters');
      const list=raw.map(normalizeTeleporter).filter(x=>x.planet&&Number.isFinite(x.x)&&Number.isFinite(x.y)&&x.x&&x.y);
      if(list.length){teleporters=list;writeCache(TP_CACHE,list);rebuildIndexes();}
    }catch(err){console.warn('[Maps API] Teleporters unavailable; using cache.',err);}
    window.PixelB8Maps?.refreshTeleporters?.();
    return teleporters;
  }

  async function loadLocations(force=false){
    if(locLoaded&&!force)return locations;
    const cached=readCache(LOC_CACHE);
    if(cached){
      locations=cached.items;
      rebuildIndexes();
      if(!force && Date.now()-(cached.savedAt||0)<CACHE_MAX_AGE){
        locLoaded=true;
        queueMicrotask(()=>{
          window.PixelB8MapAreas?.refresh?.();
          window.PixelB8Maps?.refreshNexusLocations?.();
        });
        return locations;
      }
    }
    locLoaded=true;
    try{
      const raw=await fetchJson('locations');
      const list=raw.map(normalizeLocation).filter(x=>x.planet&&Number.isFinite(x.x)&&Number.isFinite(x.y));
      if(list.length){locations=list;writeCache(LOC_CACHE,list);rebuildIndexes();}
    }catch(err){console.warn('[Maps API] Locations unavailable; using cache.',err);}
    window.PixelB8MapAreas?.refresh?.();
    window.PixelB8Maps?.refreshNexusLocations?.();
    return locations;
  }

  function getTeleporters(planet=''){
    if(!planet)return teleporters.slice();
    return (tpByPlanet.get(normalizePlanetName(planet).toLowerCase())||[]).slice();
  }
  function getTeleporter(id){return teleporters.find(x=>String(x.id)===String(id))||null;}
  function getLocations(planet=''){
    if(!planet)return locations.slice();
    return (locByPlanet.get(normalizePlanetName(planet).toLowerCase())||[]).slice();
  }
  function getMobAreas(planet=''){
    return getLocations(planet).filter(x=>x.type==='area'&&clean(x.areaType).toLowerCase()==='mobarea');
  }

  // Prime from localStorage immediately; network refresh is lazy.
  const tpCached=readCache(TP_CACHE); if(tpCached)teleporters=tpCached.items;
  const locCached=readCache(LOC_CACHE); if(locCached)locations=locCached.items;
  rebuildIndexes();


  function getPointLocations(planet=''){
    return getLocations(planet).filter(x=>{
      const t=clean(x.type).toLowerCase(),a=clean(x.areaType).toLowerCase();
      return t!=='area'&&t!=='teleporter'&&a!=='mobarea'&&Number.isFinite(x.x)&&Number.isFinite(x.y)&&x.x&&x.y;
    });
  }
  function getAreaLocations(planet=''){return getLocations(planet).filter(x=>clean(x.type).toLowerCase()==='area');}
  function getLocationById(id){return locations.find(x=>String(x.id)===String(id))||null;}
  function locationTypeLabel(item){
    const raw=clean(item.areaType||item.type||'Location');
    return raw?raw.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/[_-]+/g,' ').replace(/\b\w/g,m=>m.toUpperCase()):'Location';
  }


  function prettifyType(raw){
    const value=clean(raw||'Location')
      .replace(/([a-z])([A-Z])/g,'$1 $2')
      .replace(/[_-]+/g,' ')
      .replace(/\s+/g,' ')
      .trim();
    return (value||'Location').replace(/\b\w/g,m=>m.toUpperCase());
  }

  function locationCategoryKey(item){
    const type=clean(item?.type).toLowerCase();
    const area=clean(item?.areaType).toLowerCase();
    if(type==='area'||area)return `area:${area||'area'}`;
    return `point:${type||'location'}`;
  }

  function locationCategoryLabel(item){
    const key=locationCategoryKey(item);
    const raw=key.startsWith('area:')?clean(item?.areaType||'Area'):clean(item?.type||'Location');
    const normalized=prettifyType(raw);

    const aliases={
      'Mobarea':'Mob Areas','Mob Area':'Mob Areas',
      'Landarea':'Land Areas','Land Area':'Land Areas',
      'Zonearea':'Zone Areas','Zone Area':'Zone Areas',
      'Pvparea':'PvP Areas','Pvp Area':'PvP Areas',
      'Pvplootarea':'PvP Loot Areas','Pvp Loot Area':'PvP Loot Areas',
      'Waveeventarea':'Wave Event Areas','Wave Event Area':'Wave Event Areas',
      'Revivalpoint':'Revival Points','Revival Point':'Revival Points',
      'Instanceentrance':'Instance Entrances','Instance Entrance':'Instance Entrances',
      'Magicalflower':'Magical Flowers','Magical Flower':'Magical Flowers',
      'Npc':'NPCs','NPC':'NPCs','Vendor':'Vendors','Tree':'Trees','City':'Cities',
      'Camp':'Camps','Outpost':'Outposts','Interactable':'Interactables'
    };
    if(aliases[normalized])return aliases[normalized];
    if(normalized.endsWith(' Area'))return `${normalized}s`;
    if(!/s$/i.test(normalized))return `${normalized}s`;
    return normalized;
  }

  function getLocationCategories(planet=''){
    const groups=new Map();
    for(const item of getLocations(planet)){
      const key=locationCategoryKey(item);
      if(!groups.has(key))groups.set(key,{key,label:locationCategoryLabel(item),items:[]});
      groups.get(key).items.push(item);
    }
    return [...groups.values()].sort((a,b)=>a.label.localeCompare(b.label));
  }

  return {
    loadTeleporters,loadLocations,getTeleporters,getTeleporter,getLocations,getMobAreas,getPointLocations,getAreaLocations,getLocationById,
    locationTypeLabel,locationCategoryKey,locationCategoryLabel,getLocationCategories,normalizePlanetName
  };
})();
