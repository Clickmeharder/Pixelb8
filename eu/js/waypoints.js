'use strict';

window.EntropiaWaypoints=(function(){
  const STORAGE_KEY='entropia_waypoints_v2';
  const LEGACY_STORAGE_KEY='entropia_waypoints_v1';
  const LOCATION_KEY='entropia_last_known_pos';
  const MANUAL_PLANET_KEY='entropia_waypoint_manual_planet';
  const MAX_ROWS=1500;

  const DEFAULT_PLANETS=[
    'ARIS','Calypso','Arkadia','Arkadia Moon','Arkadia Underground','Cyrene',
    'Next Island','ROCKtropia','Toulan','Monria','FOMA','Crystal Palace','Space',
    'Ancient Greece','Arctic','Calypso Gateway','HELL','Secret Island','Setesh','The Hub'
  ].sort((a,b)=>a.localeCompare(b));

  function clean(s){return String(s||'').trim();}
  function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function load(){
    try{
      let raw=localStorage.getItem(STORAGE_KEY);
      if(!raw){
        raw=localStorage.getItem(LEGACY_STORAGE_KEY);
        if(raw)localStorage.setItem(STORAGE_KEY,raw);
      }
      const v=JSON.parse(raw||'[]');
      return Array.isArray(v)?v:[];
    }catch{return [];}
  }

  function save(list){
    localStorage.setItem(STORAGE_KEY,JSON.stringify((list||[]).slice(0,MAX_ROWS)));
  }

  function loadLastKnownPosition(){
    try{
      const v=JSON.parse(localStorage.getItem(LOCATION_KEY)||'null');
      return v&&typeof v==='object'?v:null;
    }catch{return null;}
  }

  function setLastKnownPosition(planet,x,y,z,name='Last Known Position',date=new Date()){
    const d=date instanceof Date&&!Number.isNaN(date.getTime())?date:new Date();
    const pos={
      planet:clean(planet),
      x:Math.round(Number(x)||0),y:Math.round(Number(y)||0),z:Math.round(Number(z)||0),
      long:Math.round(Number(x)||0),lat:Math.round(Number(y)||0),alt:Math.round(Number(z)||0),
      waypoint:clean(name)||'Last Known Position',
      timestamp:d.getTime(),active:true
    };
    if(!pos.planet)return null;
    localStorage.setItem(LOCATION_KEY,JSON.stringify(pos));
    window.lastKnownPos=pos;
    renderCurrentLocation();
    window.PixelB8Maps?.refreshLastKnown?.();
    return pos;
  }

  function parseReadableLocationLine(line,date=new Date()){
    const m=String(line||'').match(/\[([A-Za-z][A-Za-z\s.'-]*),\s*(-?[\d.]+),\s*(-?[\d.]+),\s*(-?[\d.]+),\s*([^\]]+)\]/);
    if(!m)return false;
    const planet=clean(m[1]);
    if(/^(system|team|local|globals|trade|society)$/i.test(planet))return false;
    const x=parseFloat(m[2]),y=parseFloat(m[3]),z=parseFloat(m[4]);
    if(!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(z))return false;
    setLastKnownPosition(planet,x,y,z,clean(m[5])||'Last Known Position',date);
    return true;
  }

  function detectedPlanet(){return loadLastKnownPosition()?.planet||'';}
  function currentPlanet(){return clean(localStorage.getItem(MANUAL_PLANET_KEY)||'')||detectedPlanet();}

  function setCurrentPlanet(planet){
    const value=clean(planet);
    if(value)localStorage.setItem(MANUAL_PLANET_KEY,value);
    else localStorage.removeItem(MANUAL_PLANET_KEY);
    renderCurrentLocation();
    window.PixelB8Maps?.refresh?.();
  }

  function useDetectedPlanet(){
    localStorage.removeItem(MANUAL_PLANET_KEY);
    renderCurrentLocation();
    window.PixelB8Maps?.refresh?.();
  }

  function categoryFor(label){
    const x=clean(label).toLowerCase();
    if(x.includes('death location'))return 'death';
    if(/\b(lysterium|belkar|blau|caldorite|cobalt|cumbriz|dianum|durulium|erdo|frakite|ganganite|garcen|ignisium|kanerium|langotz|lanorium|maganite|magerian|narc|niksarium|petonium|pyrite|quantium|redulite|terrudite|tridenite|veganite|zanderium|stone|ore|enmatter)\b/i.test(x))return 'mining';
    return 'general';
  }

  function parsePosition(raw){
    const m=String(raw||'').match(/\[position:(\d+)\$\(([^)]*)\)\$(-?\d+),(-?\d+),(-?\d+)(?:\$([^\]]*))?\]/i);
    if(!m)return null;
    const parts=String(m[2]||'').split('/');
    return {
      positionType:m[1],areaRaw:m[2],worldHint:parts.at(-1)||'',
      x:Number(m[3]),y:Number(m[4]),z:Number(m[5]),
      label:clean(m[6]||''),raw:String(raw)
    };
  }

  function coordinateKey(p){return [Math.round(p.x),Math.round(p.y),Math.round(p.z)].join('|');}

  function parseLine(line,date=new Date()){
    if(!line)return false;
    const locationMatched=parseReadableLocationLine(line,date);
    if(!String(line).includes('[System]'))return locationMatched;

    let action=null,payload=null;
    let m=String(line).match(/Added waypoint to map:\s*(\[position:.*\])\s*$/i);
    if(m){action='added';payload=m[1];}
    if(!m){
      m=String(line).match(/Reached waypoint was removed from map:\s*(\[position:.*\])\s*$/i);
      if(m){action='reached';payload=m[1];}
    }
    if(!m){
      m=String(line).match(/Removed waypoint from map:\s*(\[position:.*\])\s*$/i);
      if(m){action='removed';payload=m[1];}
    }
    if(!action)return locationMatched;

    const pos=parsePosition(payload);
    if(!pos)return locationMatched;

    const list=load(),key=coordinateKey(pos);
    const now=date instanceof Date&&!Number.isNaN(date.getTime())?date.getTime():Date.now();
    const planet=currentPlanet();

    if(action==='added'){
      const existing=list.find(x=>x.coordinateKey===key&&x.status==='active');
      if(existing){
        existing.lastSeenAt=now;
        if(pos.label)existing.label=pos.label;
        if(planet)existing.planet=planet;
        existing.category=categoryFor(existing.label);
        existing.areaRaw=pos.areaRaw;existing.positionType=pos.positionType;existing.worldHint=pos.worldHint;existing.raw=pos.raw;
      }else{
        list.unshift({
          id:`wp_${now}_${Math.random().toString(36).slice(2,7)}`,
          coordinateKey:key,addedAt:now,lastSeenAt:now,removedAt:null,status:'active',removalReason:'',
          category:categoryFor(pos.label),label:pos.label||'Waypoint',planet:planet||'',
          positionType:pos.positionType,areaRaw:pos.areaRaw,worldHint:pos.worldHint,
          x:pos.x,y:pos.y,z:pos.z,raw:pos.raw
        });
      }
    }else{
      const found=list.find(x=>x.coordinateKey===key&&x.status==='active')
        ||list.find(x=>x.coordinateKey===key)
        ||list.find(x=>Math.round(x.x)===Math.round(pos.x)&&Math.round(x.y)===Math.round(pos.y));
      if(found){
        found.status=action;found.removedAt=now;found.removalReason=action==='reached'?'Reached':'Removed';found.lastSeenAt=now;
        if(!found.planet&&planet)found.planet=planet;
      }
    }
    save(list);
    render();
    window.PixelB8Maps?.refreshWaypoints?.();
    return true;
  }

  function remove(id){save(load().filter(x=>x.id!==id));render();window.PixelB8Maps?.refreshWaypoints?.();}
  function clearRemoved(){save(load().filter(x=>x.status==='active'));render();window.PixelB8Maps?.refreshWaypoints?.();}

  function waypointCommand(w){
    const planet=clean(w.planet)||currentPlanet()||'Unknown';
    const label=clean(w.label)||'Waypoint';
    return `/wp [${planet}, ${Math.round(w.x)}, ${Math.round(w.y)}, ${Math.round(w.z||0)}, ${label}]`;
  }

  async function copyWaypoint(id){
    const w=load().find(x=>String(x.id)===String(id));
    if(!w)return;
    try{
      await navigator.clipboard.writeText(waypointCommand(w));
      window.showAppToast?.('Waypoint copied.','success',1800);
    }catch{
      window.showAppToast?.('Could not copy waypoint.','warning',2200);
    }
  }

  function addManualWaypoint({planet,x,y,z=0,label='Waypoint'}){
    const list=load(),now=Date.now(),pos={x:Number(x),y:Number(y),z:Number(z)};
    const entry={
      id:`wp_${now}_${Math.random().toString(36).slice(2,7)}`,
      coordinateKey:coordinateKey(pos),addedAt:now,lastSeenAt:now,removedAt:null,status:'active',removalReason:'',
      category:categoryFor(label),label:clean(label)||'Waypoint',planet:clean(planet)||currentPlanet()||'',
      positionType:'manual',areaRaw:'',worldHint:'',x:Number(x),y:Number(y),z:Number(z),raw:'manual'
    };
    list.unshift(entry);save(list);render();window.PixelB8Maps?.refreshWaypoints?.();return entry;
  }

  function findWaypointById(id){return load().find(x=>String(x.id)===String(id))||null;}

  function renderCurrentLocation(){
    const pos=loadLastKnownPosition(),manual=clean(localStorage.getItem(MANUAL_PLANET_KEY)||''),effective=manual||pos?.planet||'';
    const planet=document.getElementById('waypointCurrentPlanet');
    const coords=document.getElementById('waypointCurrentCoords');
    const age=document.getElementById('waypointCurrentLocationTime');
    const select=document.getElementById('waypointPlanetSelect');
    if(planet)planet.textContent=effective||'Unknown';
    if(coords)coords.textContent=pos?`${pos.x}, ${pos.y}, ${pos.z}`:'—';
    if(age){
      const d=pos?.timestamp?new Date(pos.timestamp):null;
      const detected=pos?.planet?`Detected: ${pos.planet}`:'No detected planet';
      const when=d&&!Number.isNaN(d.getTime())?d.toLocaleString():'No readable location captured yet';
      age.textContent=manual?`${detected} · Manual override: ${manual} · ${when}`:`${detected} · ${when}`;
    }
    if(select){
      const current=effective||'';
      select.innerHTML='<option value="">Unknown</option>'+DEFAULT_PLANETS.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');
      if(current&&!DEFAULT_PLANETS.includes(current))select.insertAdjacentHTML('beforeend',`<option value="${esc(current)}">${esc(current)}</option>`);
      select.value=current;
    }
  }

  function render(){
    renderCurrentLocation();
    const all=load();
    const cat=document.getElementById('waypointCategoryFilter')?.value||'all';
    const state=document.getElementById('waypointStateFilter')?.value||'active';
    const rows=all.filter(w=>{
      if(cat!=='all'&&w.category!==cat)return false;
      if(state==='active'&&w.status!=='active')return false;
      if(state==='removed'&&w.status==='active')return false;
      return true;
    });
    const active=all.filter(x=>x.status==='active');
    const set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=String(v);};
    set('waypointActiveCount',active.length);
    set('waypointDeathCount',active.filter(x=>x.category==='death').length);
    set('waypointMiningCount',active.filter(x=>x.category==='mining').length);
    set('waypointTotalCount',all.length);

    const body=document.getElementById('waypointTableBody');
    if(!body)return;
    if(!rows.length){body.innerHTML='<tr><td colspan="9" class="empty">No matching waypoints.</td></tr>';return;}
    body.innerHTML=rows.map(w=>{
      const d=new Date(w.addedAt||w.lastSeenAt||Date.now());
      const time=Number.isNaN(d.getTime())?'—':d.toLocaleString();
      const status=w.status==='active'?'Active':w.status==='reached'?'Reached':'Removed';
      return `<tr>
        <td>${esc(time)}</td><td>${esc(w.planet||'Unknown')}</td>
        <td><span class="waypoint-category waypoint-${esc(w.category)}">${esc(w.category)}</span></td>
        <td>${esc(w.label||'Waypoint')}</td><td><code>${w.x}, ${w.y}, ${w.z}</code></td>
        <td><code>${esc(w.areaRaw||'')}</code></td><td>${esc(status)}</td>
        <td><button class="btn" type="button" data-waypoint-copy="${esc(w.id)}">Copy</button></td>
        <td class="right"><button class="btn" type="button" data-waypoint-delete="${esc(w.id)}">Delete</button></td>
      </tr>`;
    }).join('');
    body.querySelectorAll('[data-waypoint-copy]').forEach(btn=>btn.addEventListener('click',()=>copyWaypoint(btn.dataset.waypointCopy)));
    body.querySelectorAll('[data-waypoint-delete]').forEach(btn=>btn.addEventListener('click',()=>remove(btn.dataset.waypointDelete)));
  }

  window.lastKnownPos=loadLastKnownPosition();
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',render);else render();

  return {
    parseLine,parseReadableLocationLine,setLastKnownPosition,getLastKnownPosition:loadLastKnownPosition,
    setCurrentPlanet,useDetectedPlanet,getCurrentPlanet:currentPlanet,copyWaypoint,addManualWaypoint,findWaypointById,
    render,remove,clearRemoved,getWaypoints:load
  };
})();
