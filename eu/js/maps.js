'use strict';

window.PixelB8Maps=(function(){
  const MAPS=[
    ['Ancient Greece','maps/mappng/ancientgreece_map.png'],['Arctic','maps/mappng/arctic_map.png'],['ARIS','maps/mappng/aris_map.png'],
    ['Arkadia','maps/mappng/arkadia_map.png'],['Arkadia Moon','maps/mappng/arkadiamoon_map.png'],['Arkadia Underground','maps/mappng/arkadiaunderground_map.png'],
    ['Calypso','maps/mappng/calypso_map.png'],['Calypso Gateway','maps/mappng/calypsogateway_map.png'],['Crystal Palace','maps/mappng/crystalpalace_map.png'],
    ['Cyrene','maps/mappng/cyrene_map.png'],['FOMA','maps/mappng/foma_map.png'],['HELL','maps/mappng/hell_map.png'],
    ['Howling Mine','maps/howlingmine_map.jpg'],['Monria','maps/monria_map.jpg'],['Next Island','maps/nextisland_map.jpg'],
    ['ROCKtropia','maps/rocktropia_map.jpg'],['Secret Island','maps/secretisland_map.jpg'],['Setesh','maps/mappng/setesh_map.png'],
    ['Space','maps/space_map.jpg'],['The Hub','maps/thehub_map.jpg'],['Toulan','maps/toulan_map.jpg']
  ].map(([planet,src])=>({planet,src}));

  const CFG={
    'Ancient Greece':[32768,16384,512,512,16],'Arctic':[32768,16384,1024,1024,8],
    'Arkadia Moon':[8192,8197,516,516,16],'Calypso':[16384,24576,4608,4608,16],
    'Calypso Gateway':[65536,65536,512,512,16],'Crystal Palace':[65536,65536,512,512,16],
    'FOMA':[65536,65536,512,512,16],'HELL':[32768,16384,1024,1024,8],
    'Secret Island':[32768,16399,512,512,16],'Monria':[32768,16384,512,512,16],
    'Next Island':[122880,81920,1024,1024,16],'Arkadia':[8192,8192,1536,1536,16],
    'Arkadia Underground':[8182,16384,512,512,16],'Cyrene':[131072,73732,1024,1024,8],
    'Toulan':[131072,90143,512,512,16],'ROCKtropia':[131072,81920,1024,2048,8],
    'Setesh':[65536,65536,512,512,16],'Space':[49168,49181,3072,2560,16],'The Hub':[1,1,500,500,8]
  };

  const LOCATION_CATEGORY_PREFS_KEY='pixelb8_eu_map_location_categories_v1';

  function loadLocationCategoryPrefs(){
    try{
      const raw=JSON.parse(localStorage.getItem(LOCATION_CATEGORY_PREFS_KEY)||'{}');
      return new Map(Object.entries(raw&&typeof raw==='object'?raw:{}).map(([key,value])=>[key,!!value]));
    }catch{return new Map();}
  }

  function saveLocationCategoryPrefs(){
    try{localStorage.setItem(LOCATION_CATEGORY_PREFS_KEY,JSON.stringify(Object.fromEntries(state.locationCategories)));}catch{}
  }

  const state={
    zoom:1,x:0,y:0,drag:false,startX:0,startY:0,didDrag:false,initialized:false,
    layers:{teleporters:true,waypoints:true,nexuslocations:true},locationCategories:loadLocationCategoryPrefs(),context:null,
    renderToken:0,currentImageSrc:''
  };

  const imageCache=new Map();
  const clean=x=>String(x||'').trim();
  const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=p=>window.PixelB8MapsAPI?.normalizePlanetName?.(p)||clean(p);

  function config(planet,img){
    if(planet==='ARIS'){
      const w=img?.naturalWidth||0,h=img?.naturalHeight||0;
      if(!w||!h)return null;
      const scale=w>=1024?8:16;
      return {left:Math.round(36864-w*scale*.5),bottom:0,width:w,height:h,scale};
    }
    const a=CFG[planet];
    if(a)return {left:a[0],bottom:a[1],width:a[2],height:a[3],scale:a[4]};
    const w=img?.naturalWidth||0,h=img?.naturalHeight||0;
    return w&&h?{left:0,bottom:0,width:w,height:h,scale:16}:null;
  }

  function getViewingPlanet(){return document.getElementById('waypointMapPlanetSelect')?.value||'';}

  function mapPosition(planet,x,y){
    const img=document.getElementById('baseMapImg'),c=config(planet,img);
    if(!c)return null;
    return {leftPct:(Number(x)-c.left)/(c.width*c.scale)*100,topPct:(1-(Number(y)-c.bottom)/(c.height*c.scale))*100};
  }

  function gameToScreen(x,y){
    const img=document.getElementById('baseMapImg'),planet=getViewingPlanet();
    const p=mapPosition(planet,x,y);
    if(!p||!img?.naturalWidth)return null;
    return {
      x:state.x+(p.leftPct/100*img.naturalWidth*state.zoom),
      y:state.y+(p.topPct/100*img.naturalHeight*state.zoom)
    };
  }

  function pixelsPerMeter(){
    const img=document.getElementById('baseMapImg'),c=config(getViewingPlanet(),img);
    if(!img||!c)return 0;
    return (img.naturalWidth/(c.width*c.scale))*state.zoom;
  }

  function gameAt(clientX,clientY){
    const wrapper=document.getElementById('mapWrapper'),img=document.getElementById('baseMapImg'),planet=getViewingPlanet();
    if(!wrapper||!img||!planet)return null;
    const c=config(planet,img),r=wrapper.getBoundingClientRect();
    if(!c||!r.width||!r.height)return null;
    const lx=(clientX-r.left)/r.width,ly=(clientY-r.top)/r.height;
    return {planet,x:Math.round(c.left+lx*c.width*c.scale),y:Math.round(c.bottom+(1-ly)*c.height*c.scale),z:0};
  }

  function updateTransform(){
    const w=document.getElementById('mapWrapper');
    if(!w)return;
    w.style.transform=`translate(${state.x}px,${state.y}px) scale(${state.zoom})`;
    document.querySelectorAll('#waypointMaplayer .waypoint-map-marker,#waypointMaplayer .teleporter-map-marker,#waypointMaplayer .last-known-position-marker')
      .forEach(el=>el.style.setProperty('--marker-inverse-scale',String(1/state.zoom)));
    window.PixelB8MapAreas?.refresh?.();
  }

  function cancelDragState(){
    state.drag=false;state.didDrag=false;
    document.getElementById('theMap')?.classList.remove('dragging');
  }

  function resetMapView(){cancelDragState();state.zoom=1;state.x=0;state.y=0;updateTransform();}

  function fitMapView(){
    cancelDragState();
    const container=document.getElementById('theMap'),img=document.getElementById('baseMapImg');
    if(!container||!img?.naturalWidth||!img?.naturalHeight)return;
    const r=container.getBoundingClientRect();
    if(!r.width||!r.height)return;
    const padding=.96;
    const fit=Math.min((r.width/img.naturalWidth)*padding,(r.height/img.naturalHeight)*padding,1);
    state.zoom=Math.min(Math.max(fit,.1),100);
    state.x=(r.width-img.naturalWidth*state.zoom)/2;
    state.y=(r.height-img.naturalHeight*state.zoom)/2;
    updateTransform();
  }

  function zoomMap(factor,clientX=null,clientY=null){
    cancelDragState();
    const c=document.getElementById('theMap');if(!c)return;
    const r=c.getBoundingClientRect(),mx=clientX==null?r.width/2:clientX-r.left,my=clientY==null?r.height/2:clientY-r.top;
    const old=state.zoom,next=Math.min(Math.max(old*factor,.1),100);
    const wx=(mx-state.x)/old,wy=(my-state.y)/old;
    state.zoom=next;state.x=mx-wx*next;state.y=my-wy*next;updateTransform();
  }

  function populateMapSelect(){
    const sel=document.getElementById('waypointMapPlanetSelect');
    if(!sel||sel.dataset.ready)return;
    sel.innerHTML=MAPS.map(m=>`<option value="${esc(m.planet)}">${esc(m.planet)}</option>`).join('');
    sel.dataset.ready='1';
  }

  async function preloadImage(src){
    if(imageCache.has(src))return imageCache.get(src);
    const promise=new Promise((resolve,reject)=>{
      const im=new Image();
      im.onload=()=>{if(im.decode)im.decode().catch(()=>{}).finally(()=>resolve(im));else resolve(im);};
      im.onerror=reject;
      im.src=src;
    });
    imageCache.set(src,promise);
    return promise;
  }

  async function changeMap(planet,centerAfter=false){
    populateMapSelect();
    const map=MAPS.find(x=>x.planet===planet)||MAPS[0];
    const sel=document.getElementById('waypointMapPlanetSelect'),img=document.getElementById('baseMapImg');
    if(!map||!sel||!img)return;

    sel.value=map.planet;
    cancelDragState();
    const token=++state.renderToken;

    // Don't reload/reset a map that is already displayed.
    if(state.currentImageSrc===map.src && img.naturalWidth){
      refresh();
      refreshNexusLocations();
      window.EntropiaMissions?.renderMapRail?.();
      if(centerAfter)centerOnLastKnown();
      return;
    }

    resetMapView();
    try{await preloadImage(map.src);}catch{}
    if(token!==state.renderToken)return;

    img.onload=()=>{
      if(token!==state.renderToken)return;
      const w=document.getElementById('mapWrapper');
      if(w){w.style.width=`${img.naturalWidth}px`;w.style.height=`${img.naturalHeight}px`;}
      state.currentImageSrc=map.src;
      refresh();
      refreshNexusLocations();
      window.EntropiaMissions?.renderMapRail?.();
      if(centerAfter)centerOnLastKnown();
      else fitMapView();
    };
    img.src=map.src;
    if(img.complete&&img.naturalWidth)img.onload();

    // Warm the adjacent/common large map without touching the DOM.
    const calypso=MAPS.find(x=>x.planet==='Calypso');
    if(calypso&&map.planet!=='Calypso')setTimeout(()=>preloadImage(calypso.src).catch(()=>{}),300);
  }

  function command(p,x,y,z=0,name='Waypoint'){
    return `/wp [${p}, ${Math.round(x)}, ${Math.round(y)}, ${Math.round(z||0)}, ${clean(name)||'Waypoint'}]`;
  }
  function copy(text,msg='Waypoint copied.'){
    navigator.clipboard.writeText(text).then(()=>window.showAppToast?.(msg,'success',1800))
      .catch(()=>window.showAppToast?.('Could not copy waypoint.','warning',2200));
  }

  function drawWaypoints(){
    const layer=document.getElementById('waypoints-tracked'),planet=getViewingPlanet();
    if(!layer||!planet)return;
    layer.classList.toggle('hidden',!state.layers.waypoints);
    if(!state.layers.waypoints){layer.innerHTML='';return;}
    const rows=(window.EntropiaWaypoints?.getWaypoints?.()||[])
      .filter(w=>norm(w.planet).toLowerCase()===norm(planet).toLowerCase()&&w.status==='active');

    layer.innerHTML=rows.map(w=>{
      const p=mapPosition(planet,w.x,w.y);if(!p)return'';
      const cls=w.category==='death'?'death':w.category==='mining'?'mining':'general';
      return `<button class="waypoint-map-marker ${cls}" data-map-waypoint="${esc(w.id)}"
        style="left:${p.leftPct.toFixed(5)}%;top:${p.topPct.toFixed(5)}%;--marker-inverse-scale:${1/state.zoom}"
        title="${esc(w.label||'Waypoint')} · ${w.x}, ${w.y}" type="button"><span></span></button>`;
    }).join('');

    layer.querySelectorAll('[data-map-waypoint]').forEach(btn=>{
      btn.addEventListener('click',e=>{e.stopPropagation();if(!state.didDrag)window.EntropiaWaypoints?.copyWaypoint?.(btn.dataset.mapWaypoint);});
      btn.addEventListener('contextmenu',e=>{
        e.preventDefault();e.stopPropagation();
        const w=window.EntropiaWaypoints?.findWaypointById?.(btn.dataset.mapWaypoint);
        if(w)openMenu(e.clientX,e.clientY,{kind:'waypoint',id:w.id,name:w.label||'Waypoint',planet:w.planet,x:w.x,y:w.y,z:w.z||0});
      });
    });
  }

  function drawTeleporters(){
    const layer=document.getElementById('teleporters-layer'),planet=getViewingPlanet();
    if(!layer||!planet)return;
    layer.classList.toggle('hidden',!state.layers.teleporters);
    if(!state.layers.teleporters){layer.innerHTML='';return;}

    const rows=window.PixelB8MapsAPI?.getTeleporters?.(planet)||[];
    layer.innerHTML=rows.map(tp=>{
      const p=mapPosition(planet,tp.x,tp.y);if(!p)return'';
      return `<button class="teleporter-map-marker" data-teleporter-id="${esc(tp.id)}"
        style="left:${p.leftPct.toFixed(5)}%;top:${p.topPct.toFixed(5)}%;--marker-inverse-scale:${1/state.zoom}"
        title="${esc(tp.name)} · ${tp.x}, ${tp.y}" type="button"><span>TP</span></button>`;
    }).join('');

    layer.querySelectorAll('[data-teleporter-id]').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.stopPropagation();
        const tp=window.PixelB8MapsAPI?.getTeleporter?.(btn.dataset.teleporterId);
        if(tp)copy(command(tp.planet,tp.x,tp.y,tp.z,tp.name),`${tp.name} waypoint copied.`);
      });
      btn.addEventListener('contextmenu',e=>{
        e.preventDefault();e.stopPropagation();
        const tp=window.PixelB8MapsAPI?.getTeleporter?.(btn.dataset.teleporterId);
        if(tp)openMenu(e.clientX,e.clientY,{kind:'teleporter',id:tp.id,name:tp.name,planet:tp.planet,x:tp.x,y:tp.y,z:tp.z||0});
      });
    });
  }


  function locationIcon(type){const t=clean(type).toLowerCase();if(t.includes('revival'))return 'R';if(t.includes('vendor'))return '$';if(t.includes('instance'))return 'I';if(t.includes('city'))return 'C';if(t.includes('outpost'))return 'O';if(t.includes('camp'))return 'C';if(t.includes('npc'))return 'N';if(t.includes('interactable'))return '!';if(t.includes('flower'))return '✦';return '•';}
  function defaultLocationCategoryEnabled(key){
    const value=clean(key).toLowerCase();
    return value==='area:mobarea'||value==='area:landarea'||value.includes('pvp');
  }

  function isLocationCategoryEnabled(key){
    if(!key)return true;
    if(!state.layers.nexuslocations)return false;
    return state.locationCategories.has(key)?state.locationCategories.get(key):defaultLocationCategoryEnabled(key);
  }

  function setLocationCategory(key,enabled){
    state.locationCategories.set(String(key),!!enabled);
    saveLocationCategoryPrefs();
    drawOtherLocations();
    window.PixelB8MapAreas?.refresh?.();
  }

  function drawOtherLocations(){
    const layer=document.getElementById('other-locations-layer'),planet=getViewingPlanet();
    if(!layer||!planet)return;
    layer.classList.toggle('hidden',!state.layers.nexuslocations);
    if(!state.layers.nexuslocations){layer.innerHTML='';return;}

    const rows=(window.PixelB8MapsAPI?.getPointLocations?.(planet)||[])
      .filter(item=>isLocationCategoryEnabled(window.PixelB8MapsAPI?.locationCategoryKey?.(item)));

    layer.innerHTML=rows.map(item=>{
      const p=mapPosition(planet,item.x,item.y);
      if(!p)return'';
      const type=window.PixelB8MapsAPI?.locationCategoryLabel?.(item)
        ||window.PixelB8MapsAPI?.locationTypeLabel?.(item)||'Location';
      return `<button class="generic-location-marker" data-location-id="${esc(item.id)}"
        style="left:${p.leftPct.toFixed(5)}%;top:${p.topPct.toFixed(5)}%;--marker-inverse-scale:${1/state.zoom}"
        title="${esc(item.name)} · ${esc(type)} · ${Math.round(item.x)}, ${Math.round(item.y)}"
        type="button"><span>${esc(locationIcon(type))}</span></button>`;
    }).join('');

    layer.querySelectorAll('[data-location-id]').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.stopPropagation();
        const item=window.PixelB8MapsAPI?.getLocationById?.(btn.dataset.locationId);
        if(item)showLocationDetails(item);
      });
      btn.addEventListener('contextmenu',e=>{
        e.preventDefault();e.stopPropagation();
        const item=window.PixelB8MapsAPI?.getLocationById?.(btn.dataset.locationId);
        if(item)openMenu(e.clientX,e.clientY,{
          kind:'location',id:item.id,name:item.name,planet:item.planet,
          x:item.x,y:item.y,z:item.z||0,item
        });
      });
    });
  }

  function drawLastKnown(){
    const layer=document.getElementById('last-known-position-layer'),planet=getViewingPlanet();
    const pos=window.EntropiaWaypoints?.getLastKnownPosition?.();
    if(!layer||!planet||!pos){if(layer)layer.innerHTML='';return;}
    if(norm(pos.planet).toLowerCase()!==norm(planet).toLowerCase()){layer.innerHTML='';return;}
    const p=mapPosition(planet,pos.x??pos.long,pos.y??pos.lat);if(!p){layer.innerHTML='';return;}
    layer.innerHTML=`<div class="last-known-position-marker"
      style="left:${p.leftPct.toFixed(5)}%;top:${p.topPct.toFixed(5)}%;--marker-inverse-scale:${1/state.zoom}"
      title="Last known position · ${esc(pos.planet)} · ${pos.x??pos.long}, ${pos.y??pos.lat}">
      <span class="last-known-pulse"></span><span class="last-known-dot"></span><span class="last-known-label">You</span>
    </div>`;
  }

  function centerCoordinate(planet,x,y){
    cancelDragState();
    const sel=document.getElementById('waypointMapPlanetSelect'),container=document.getElementById('theMap'),img=document.getElementById('baseMapImg');
    if(!sel||!container||!img)return;
    if(norm(sel.value).toLowerCase()!==norm(planet).toLowerCase()){
      const match=MAPS.find(m=>norm(m.planet).toLowerCase()===norm(planet).toLowerCase());
      if(match){changeMap(match.planet,true);return;}
      return;
    }
    const p=mapPosition(sel.value,x,y);
    if(!p||!img.naturalWidth||!img.naturalHeight)return;

    // Preserve zoom exactly. Centering should only pan the current view.
    const r=container.getBoundingClientRect();
    const px=p.leftPct/100*img.naturalWidth;
    const py=p.topPct/100*img.naturalHeight;
    state.x=r.width/2-px*state.zoom;
    state.y=r.height/2-py*state.zoom;
    updateTransform();
  }

  function centerOnLastKnown(){
    const p=window.EntropiaWaypoints?.getLastKnownPosition?.();
    if(!p){window.showAppToast?.('No last known position yet.','warning',2200);return;}
    centerCoordinate(p.planet,p.x??p.long,p.y??p.lat);
  }

  function fuzzy(h,n){
    h=clean(h).toLowerCase();n=clean(n).toLowerCase();
    if(!n)return 1;if(h.includes(n))return 1000-h.indexOf(n);
    let q=0,score=0,streak=0;
    for(let i=0;i<h.length&&q<n.length;i++){if(h[i]===n[q]){q++;streak++;score+=10+streak*2}else streak=0;}
    return q===n.length?score:0;
  }

  function renderTeleporterRail(){
    const list=document.getElementById('mapTeleportersList'),count=document.getElementById('mapTeleportersCount'),planet=getViewingPlanet();
    if(!list||!planet)return;
    const q=document.getElementById('mapLocationSearch')?.value||'';
    const rows=(window.PixelB8MapsAPI?.getTeleporters?.(planet)||[])
      .map(t=>({...t,_s:fuzzy(`${t.name} ${t.x} ${t.y}`,q)}))
      .filter(t=>t._s>0).sort((a,b)=>b._s-a._s||a.name.localeCompare(b.name));
    if(count)count.textContent=String(rows.length);
    list.innerHTML=rows.length?rows.map(t=>`<button class="map-location-row" data-rail-tp="${esc(t.id)}" type="button">
      <span class="map-location-row-main">${esc(t.name)}</span><span class="map-location-row-coords">${t.x}, ${t.y}</span>
    </button>`).join(''):'<div class="map-location-empty">No matching teleporters.</div>';
    list.querySelectorAll('[data-rail-tp]').forEach(b=>b.addEventListener('click',()=>{
      const t=window.PixelB8MapsAPI?.getTeleporter?.(b.dataset.railTp);if(t)centerCoordinate(t.planet,t.x,t.y);
    }));
  }

  function renderWaypointRail(){
    const list=document.getElementById('mapWaypointsList'),count=document.getElementById('mapWaypointsCount'),planet=getViewingPlanet();
    if(!list||!planet)return;
    const q=document.getElementById('mapLocationSearch')?.value||'';
    const rows=(window.EntropiaWaypoints?.getWaypoints?.()||[])
      .filter(w=>w.status==='active'&&norm(w.planet).toLowerCase()===norm(planet).toLowerCase())
      .map(w=>({...w,_s:fuzzy(`${w.label} ${w.category} ${w.x} ${w.y}`,q)}))
      .filter(w=>w._s>0);
    if(count)count.textContent=String(rows.length);
    if(!rows.length){list.innerHTML='<div class="map-location-empty">No matching waypoints.</div>';return;}

    const order=['death','mining','general'];
    const labels={death:'Death',mining:'Mining',general:'General'};
    const groups={};
    rows.forEach(w=>(groups[w.category||'general']??=[]).push(w));

    list.innerHTML=Object.keys(groups).sort((a,b)=>{
      const ai=order.indexOf(a),bi=order.indexOf(b);
      return (ai<0?99:ai)-(bi<0?99:bi)||a.localeCompare(b);
    }).map(cat=>{
      const items=groups[cat].sort((a,b)=>b._s-a._s||String(a.label).localeCompare(String(b.label)));
      return `<details class="map-waypoint-category" open>
        <summary><span>${esc(labels[cat]||cat)}</span><span>${items.length}</span></summary>
        <div>${items.map(w=>`<button class="map-location-row" data-rail-waypoint="${esc(w.id)}" type="button">
          <span class="map-location-row-main">${esc(w.label||'Waypoint')}</span>
          <span class="map-location-row-coords">${w.x}, ${w.y}</span>
        </button>`).join('')}</div>
      </details>`;
    }).join('');

    list.querySelectorAll('[data-rail-waypoint]').forEach(b=>b.addEventListener('click',()=>{
      const w=window.EntropiaWaypoints?.findWaypointById?.(b.dataset.railWaypoint);
      if(w)centerCoordinate(w.planet,w.x,w.y);
    }));
  }

  function renderNexusLocationSections(){
    const root=document.getElementById('mapNexusLocationSections'),planet=getViewingPlanet();
    if(!root||!planet)return;

    const query=document.getElementById('mapLocationSearch')?.value||'';
    const categories=window.PixelB8MapsAPI?.getLocationCategories?.(planet)||[];
    const classify=group=>{
      const key=clean(group.key).toLowerCase(),label=clean(group.label).toLowerCase();
      if(key==='area:mobarea'||label==='mob areas')return 'mob';
      if(key==='area:landarea'||label==='land areas')return 'land';
      if(key.includes('pvp')||label.includes('pvp'))return 'pvp';
      return 'other';
    };

    const prepared=categories
      .filter(group=>{
        const key=clean(group.key).toLowerCase(),label=clean(group.label).toLowerCase();
        return key!=='point:teleporter'&&label!=='teleporters'&&label!=='teleporter';
      })
      .map(group=>({
      ...group,
      bucket:classify(group),
      rows:group.items
        .map(item=>({...item,_score:fuzzy(`${item.name} ${group.label} ${item.x} ${item.y}`,query)}))
        .filter(item=>item._score>0)
        .sort((a,b)=>b._score-a._score||String(a.name).localeCompare(String(b.name)))
    })).filter(group=>group.rows.length);

    const renderRows=groups=>groups.flatMap(group=>group.rows.map(item=>({item,group})))
      .sort((a,b)=>b.item._score-a.item._score||String(a.item.name).localeCompare(String(b.item.name)))
      .map(({item})=>`<button class="map-location-row" data-nexus-location="${esc(item.id)}" type="button">
        <span class="map-location-row-main">${esc(item.name)}</span>
        <span class="map-location-row-coords">${Math.round(item.x)}, ${Math.round(item.y)}</span>
      </button>`).join('');

    const renderPrimary=(bucket,label,open=false)=>{
      const groups=prepared.filter(group=>group.bucket===bucket);
      if(!groups.length)return '';
      const keys=groups.map(group=>group.key);
      const checked=keys.every(key=>isLocationCategoryEnabled(key))?'checked':'';
      const count=groups.reduce((n,group)=>n+group.rows.length,0);
      return `<details class="map-location-section map-dynamic-location-section" ${open?'open':''}>
        <summary>
          <span class="map-location-summary-main">
            <label class="map-category-mini-toggle" title="Show/hide ${esc(label)} on map" onclick="event.stopPropagation()">
              <input type="checkbox" ${checked} data-location-category-group="${esc(keys.join('|'))}">
              <span></span>
            </label>
            <span>${esc(label)}</span>
          </span>
          <span class="map-location-count">${count}</span>
        </summary>
        <div class="map-location-list">${renderRows(groups)}</div>
      </details>`;
    };

    const other=prepared.filter(group=>group.bucket==='other');
    const otherKeys=other.map(group=>group.key);
    const otherChecked=otherKeys.length&&otherKeys.every(key=>isLocationCategoryEnabled(key))?'checked':'';
    const otherCount=other.reduce((n,group)=>n+group.rows.length,0);
    const otherHtml=other.length?`<details class="map-location-section map-other-location-section">
      <summary>
        <span class="map-location-summary-main">
          <label class="map-category-mini-toggle" title="Show/hide all other locations on map" onclick="event.stopPropagation()">
            <input type="checkbox" ${otherChecked} data-location-category-group="${esc(otherKeys.join('|'))}">
            <span></span>
          </label>
          <span>Other</span>
        </span>
        <span class="map-location-count">${otherCount}</span>
      </summary>
      <div class="map-other-location-types">
        ${other.map(group=>{
          const checked=isLocationCategoryEnabled(group.key)?'checked':'';
          return `<details class="map-waypoint-category map-other-location-type">
            <summary>
              <span class="map-location-summary-main">
                <label class="map-category-mini-toggle" title="Show/hide ${esc(group.label)} on map" onclick="event.stopPropagation()">
                  <input type="checkbox" ${checked} data-location-category-toggle="${esc(group.key)}">
                  <span></span>
                </label>
                <span>${esc(group.label)}</span>
              </span>
              <span class="map-location-count">${group.rows.length}</span>
            </summary>
            <div class="map-location-list">${renderRows([group])}</div>
          </details>`;
        }).join('')}
      </div>
    </details>`:'';

    root.innerHTML=[
      renderPrimary('mob','Mob Areas'),
      renderPrimary('land','Land Areas'),
      renderPrimary('pvp','PvP Areas'),
      otherHtml
    ].join('');

    root.querySelectorAll('[data-location-category-group]').forEach(input=>{
      input.addEventListener('change',e=>{
        e.stopPropagation();
        const keys=String(input.dataset.locationCategoryGroup||'').split('|').filter(Boolean);
        keys.forEach(key=>state.locationCategories.set(key,input.checked));
        saveLocationCategoryPrefs();
        root.querySelectorAll('[data-location-category-toggle]').forEach(child=>{
          if(keys.includes(child.dataset.locationCategoryToggle))child.checked=input.checked;
        });
        drawOtherLocations();
        window.PixelB8MapAreas?.refresh?.();
      });
    });

    root.querySelectorAll('[data-location-category-toggle]').forEach(input=>{
      input.addEventListener('change',e=>{
        e.stopPropagation();
        setLocationCategory(input.dataset.locationCategoryToggle,input.checked);
        root.querySelectorAll('[data-location-category-group]').forEach(groupInput=>{
          const keys=String(groupInput.dataset.locationCategoryGroup||'').split('|').filter(Boolean);
          if(keys.includes(input.dataset.locationCategoryToggle))groupInput.checked=keys.every(key=>isLocationCategoryEnabled(key));
        });
      });
    });

    root.querySelectorAll('[data-nexus-location]').forEach(btn=>{
      btn.addEventListener('click',()=>{
        const item=window.PixelB8MapsAPI?.getLocationById?.(btn.dataset.nexusLocation);
        if(!item)return;
        centerCoordinate(item.planet,item.x,item.y);
        showLocationDetails(item);
      });
      btn.addEventListener('mouseenter',()=>{
        const item=window.PixelB8MapsAPI?.getLocationById?.(btn.dataset.nexusLocation);
        if(item&&clean(item.type).toLowerCase()==='area')window.PixelB8MapAreas?.setHovered?.(item.id);
      });
      btn.addEventListener('mouseleave',()=>window.PixelB8MapAreas?.setHovered?.(null));
    });
  }

  function renderAreaRails(){renderNexusLocationSections();}
  function renderLocationRail(){
    renderTeleporterRail();
    renderWaypointRail();
    renderNexusLocationSections();
  }

  function syncLayerToggles(name){
    const ids={teleporters:['mapTeleportersToggle','mapTeleportersRailToggle'],waypoints:['mapWaypointsToggle','mapWaypointsRailToggle'],nexuslocations:['mapNexusLocationsToggle']};
    (ids[name]||[]).forEach(id=>{const input=document.getElementById(id);if(input)input.checked=!!state.layers[name];});
  }

  function setLayer(name,value){
    if(!(name in state.layers))return;
    state.layers[name]=!!value;
    syncLayerToggles(name);
    if(name==='teleporters')drawTeleporters();
    if(name==='waypoints')drawWaypoints();
    if(name==='nexuslocations'){
      drawOtherLocations();
      window.PixelB8MapAreas?.setEnabled?.(state.layers.nexuslocations);
      window.PixelB8MapAreas?.refresh?.();
      renderNexusLocationSections();
    }
  }

  function toggleLocationsRail(){
    const rail=document.getElementById('mapLocationsRail');if(!rail)return;
    rail.classList.toggle('collapsed');
    const b=document.getElementById('mapLocationsRailToggle');
    if(b)b.textContent=rail.classList.contains('collapsed')?'‹':'›';
  }


  function firstValue(obj,...keys){
    for(const key of keys)if(obj&&obj[key]!=null&&obj[key]!=='')return obj[key];
    return null;
  }
  function friendlyBool(value){return value===true||value===1?'Yes':value===false||value===0?'No':null;}
  function densityLabel(value){
    const n=Number(value),labels={1:'Very Low',2:'Low',3:'Medium',4:'High',5:'Very High'};
    return Number.isFinite(n)?(labels[n]||String(n)):clean(value);
  }
  function maturityMobName(entry){
    return clean(entry?.Maturity?.Mob?.Name||entry?.Maturity?.Mob||entry?.Mob?.Name||entry?.Mob||entry?.mob?.Name||entry?.mob||'');
  }
  function maturityName(entry){
    return clean(entry?.Maturity?.Name||entry?.Name||entry?.maturity?.Name||entry?.maturity||'');
  }
  function maturityLevel(entry){
    const v=entry?.Maturity?.Properties?.Level??entry?.Properties?.Level??entry?.Level??entry?.level;
    return v==null?'':String(v);
  }
  function mobAreaDetailsHtml(item){
    const props=item.properties||item.raw?.Properties||item.raw?.properties||{};
    const maturities=Array.isArray(item.maturities)?item.maturities:(Array.isArray(item.raw?.Maturities)?item.raw.Maturities:[]);
    const density=firstValue(props,'Density','density');
    const rows=new Map();

    for(const entry of maturities){
      const mob=maturityMobName(entry)||'Unknown Mob';
      if(!rows.has(mob))rows.set(mob,[]);
      rows.get(mob).push({
        name:maturityName(entry)||'Unknown',
        level:maturityLevel(entry),
        rare:entry?.IsRare===true||entry?.isRare===true
      });
    }

    let html='<section class="map-detail-section map-detail-lifeforms"><div class="map-detail-section-title">Lifeforms</div>';
    if(density!=null)html+=`<div class="map-detail-row"><span>Density</span><b>${esc(densityLabel(density))}</b></div>`;
    const shared=friendlyBool(firstValue(props,'IsShared','isShared'));
    const event=friendlyBool(firstValue(props,'IsEvent','isEvent'));
    if(shared)html+=`<div class="map-detail-row"><span>Shared Spawn</span><b>${shared}</b></div>`;
    if(event)html+=`<div class="map-detail-row"><span>Event Spawn</span><b>${event}</b></div>`;

    const notes=clean(firstValue(props,'Notes','notes'));
    if(notes)html+=`<div class="map-detail-notes">${esc(notes)}</div>`;

    if(rows.size){
      html+='<div class="map-detail-mob-list">';
      for(const [mob,mats] of [...rows.entries()].sort((a,b)=>a[0].localeCompare(b[0]))){
        mats.sort((a,b)=>{
          const al=Number(a.level),bl=Number(b.level);
          return (Number.isFinite(al)?al:9999)-(Number.isFinite(bl)?bl:9999)||a.name.localeCompare(b.name);
        });
        const labels=mats.map(m=>`${esc(m.name)}${m.level?` <span class="map-detail-mob-level">Lv ${esc(m.level)}</span>`:''}${m.rare?' <span class="map-detail-rare">Rare</span>':''}`);
        html+=`<div class="map-detail-mob"><div class="map-detail-mob-name">${esc(mob)}</div><div class="map-detail-maturities">${labels.join('<span class="map-detail-sep"> • </span>')}</div></div>`;
      }
      html+='</div>';
    }else{
      html+='<div class="map-detail-empty">No maturity data supplied for this mob area.</div>';
    }

    const eventName=clean(firstValue(props,'RecurringEventName','recurringEventName'));
    if(eventName)html+=`<div class="map-detail-row"><span>Recurring Event</span><b>${esc(eventName)}</b></div>`;
    html+='</section>';
    return html;
  }
  function locationDetailsHtml(item){
    const type=window.PixelB8MapsAPI?.locationTypeLabel?.(item)||'Location';
    const props=item.properties||item.raw?.Properties||item.raw?.properties||{};
    const bits=[
      '<section class="map-detail-section">',
      `<div class="map-detail-row"><span>Type</span><b>${esc(type)}</b></div>`,
      `<div class="map-detail-row"><span>Planet</span><b>${esc(item.planet||'Unknown')}</b></div>`,
      `<div class="map-detail-row"><span>Coordinates</span><b>${Math.round(item.x)}, ${Math.round(item.y)}${Number.isFinite(item.z)?`, ${Math.round(item.z)}`:''}</b></div>`
    ];

    const description=clean(firstValue(props,'Description','description',item.data,'Description','description'));
    if(description)bits.push(`<div class="map-detail-description">${esc(description)}</div>`);

    const parent=item.parentLocation||item.raw?.ParentLocation;
    if(parent?.Name)bits.push(`<div class="map-detail-row"><span>Parent</span><b>${esc(parent.Name)}</b></div>`);

    const shape=clean(item.shape);
    if(shape)bits.push(`<div class="map-detail-row"><span>Shape</span><b>${esc(shape)}</b></div>`);

    const owner=item.owner||item.raw?.Owner;
    if(owner?.Name)bits.push(`<div class="map-detail-row"><span>Owner</span><b>${esc(owner.Name)}</b></div>`);

    const area=clean(item.areaType).toLowerCase();
    if(area==='landarea'){
      const taxes=[
        ['Hunting Tax',firstValue(props,'TaxRateHunting','taxRateHunting')],
        ['Mining Tax',firstValue(props,'TaxRateMining','taxRateMining')],
        ['Shop Tax',firstValue(props,'TaxRateShops','taxRateShops')]
      ];
      for(const [label,value] of taxes)if(value!=null)bits.push(`<div class="map-detail-row"><span>${label}</span><b>${esc(value)}%</b></div>`);
    }

    const estateType=clean(firstValue(props,'EstateType','estateType'));
    if(estateType)bits.push(`<div class="map-detail-row"><span>Estate Type</span><b>${esc(estateType)}</b></div>`);
    const maxGuests=firstValue(props,'MaxGuests','maxGuests');
    if(maxGuests!=null)bits.push(`<div class="map-detail-row"><span>Max Guests</span><b>${esc(maxGuests)}</b></div>`);
    const itemTrade=friendlyBool(firstValue(props,'ItemTradeAvailable','itemTradeAvailable'));
    if(itemTrade)bits.push(`<div class="map-detail-row"><span>Item Trade</span><b>${itemTrade}</b></div>`);

    const facilities=Array.isArray(item.facilities)?item.facilities:(Array.isArray(item.raw?.Facilities)?item.raw.Facilities:[]);
    if(facilities.length){
      bits.push(`<div class="map-detail-subtitle">Facilities</div><div class="map-detail-tags">${facilities.map(f=>`<span>${esc(f?.Name||f?.name||f)}</span>`).join('')}</div>`);
    }

    bits.push('</section>');
    if(area==='mobarea')bits.push(mobAreaDetailsHtml(item));

    const waves=Array.isArray(item.waves)?item.waves:(Array.isArray(item.raw?.Waves)?item.raw.Waves:[]);
    if(waves.length){
      bits.push('<section class="map-detail-section"><div class="map-detail-section-title">Wave Event</div>');
      for(const wave of waves){
        const mats=(wave.Maturities||[]).map(m=>`${maturityMobName(m)} ${maturityName(m)}`.trim()).filter(Boolean);
        bits.push(`<div class="map-detail-wave"><b>Wave ${esc((wave.WaveIndex??0)+1)}</b>${wave.TimeToComplete!=null?` <span>${esc(wave.TimeToComplete)}s</span>`:''}${mats.length?`<div>${esc(mats.join(', '))}</div>`:''}</div>`);
      }
      bits.push('</section>');
    }
    return bits.join('');
  }
  function showLocationDetails(item){const card=document.getElementById('mapLocationDetailsCard'),title=document.getElementById('mapLocationDetailsTitle'),body=document.getElementById('mapLocationDetailsBody');if(!card||!title||!body||!item)return;title.textContent=item.name||'Location';body.innerHTML=locationDetailsHtml(item);card.classList.remove('hidden');}
  function closeLocationDetails(){document.getElementById('mapLocationDetailsCard')?.classList.add('hidden');}

  function closeMenu(){document.getElementById('mapContextMenu')?.classList.add('hidden');}
  function openMenu(cx,cy,ctx){
    state.context=ctx;
    const menu=document.getElementById('mapContextMenu'),title=document.getElementById('mapContextTitle'),
      copyLoc=document.getElementById('mapContextCopyLocation'),create=document.getElementById('mapContextCreateWaypoint'),
      copyWp=document.getElementById('mapContextCopyWaypoint'),details=document.getElementById('mapContextViewDetails'),map=document.getElementById('theMap');
    if(!menu||!map)return;
    title.textContent=ctx.kind==='map'?'Map Location':ctx.name;
    copyLoc.classList.toggle('hidden',ctx.kind!=='map');
    create.classList.toggle('hidden',ctx.kind!=='map');
    copyWp.classList.toggle('hidden',ctx.kind==='map');
    if(details)details.classList.toggle('hidden',!['area','location'].includes(ctx.kind));
    copyWp.textContent=ctx.kind==='teleporter'?'Copy teleporter waypoint':(['area','location'].includes(ctx.kind)?'Copy location waypoint':'Copy waypoint');
    const r=map.getBoundingClientRect();
    menu.style.left=`${Math.max(6,Math.min(cx-r.left,r.width-220))}px`;
    menu.style.top=`${Math.max(6,Math.min(cy-r.top,r.height-150))}px`;
    menu.classList.remove('hidden');
  }

  function wireMenu(){
    document.getElementById('mapContextCopyLocation')?.addEventListener('click',()=>{
      const c=state.context;if(c)copy(command(c.planet,c.x,c.y,0,'Waypoint'));closeMenu();
    });
    document.getElementById('mapContextCreateWaypoint')?.addEventListener('click',()=>{
      const c=state.context,name=prompt('Waypoint name:','Waypoint');
      if(c&&name!==null)window.EntropiaWaypoints?.addManualWaypoint?.({planet:c.planet,x:c.x,y:c.y,z:0,label:name});
      closeMenu();
    });
    document.getElementById('mapContextCopyWaypoint')?.addEventListener('click',()=>{
      const c=state.context;if(!c)return;
      if(c.kind==='waypoint')window.EntropiaWaypoints?.copyWaypoint?.(c.id);
      else copy(command(c.planet,c.x,c.y,c.z,c.name),`${c.name} waypoint copied.`);
      closeMenu();
    });
    document.getElementById('mapContextViewDetails')?.addEventListener('click',()=>{const c=state.context;if(c?.item)showLocationDetails(c.item);closeMenu();});
  }

  function init(){
    if(state.initialized)return;
    const c=document.getElementById('theMap');if(!c)return;
    state.initialized=true;wireMenu();

    c.addEventListener('mousedown',e=>{
      if(e.button!==0||e.target.closest('.map-locations-rail,.map-context-menu,.waypoint-map-marker,.teleporter-map-marker'))return;
      state.drag=true;state.didDrag=false;state.startX=e.clientX-state.x;state.startY=e.clientY-state.y;
      c.classList.add('dragging');closeMenu();
    });
    c.addEventListener('mousemove',e=>{
      if(state.drag){
        const nx=e.clientX-state.startX,ny=e.clientY-state.startY;
        if(Math.abs(nx-state.x)>2||Math.abs(ny-state.y)>2)state.didDrag=true;
        state.x=nx;state.y=ny;updateTransform();return;
      }
      if(e.target.closest('.map-locations-rail,.map-context-menu,.map-location-details-card'))return;
      const p=gameAt(e.clientX,e.clientY),d=document.getElementById('static-coords');
      if(p&&d)d.textContent=`${p.planet}: ${p.x}, ${p.y}`;
      const area=p?window.PixelB8MapAreas?.hitTest?.(p.x,p.y):null;
      window.PixelB8MapAreas?.setHovered?.(area?.id||null);
      const label=document.getElementById('mapAreaHoverLabel');
      if(label){if(area){const r=c.getBoundingClientRect();label.textContent=area.name||window.PixelB8MapsAPI?.locationTypeLabel?.(area)||'Area';label.style.left=`${Math.min(e.clientX-r.left+14,r.width-220)}px`;label.style.top=`${Math.min(e.clientY-r.top+14,r.height-60)}px`;label.classList.remove('hidden');}else label.classList.add('hidden');}
    });
    c.addEventListener('click',e=>{if(e.target.closest('.map-locations-rail,.map-context-menu,.map-location-details-card,.waypoint-map-marker,.teleporter-map-marker,.generic-location-marker'))return;if(state.didDrag)return;const p=gameAt(e.clientX,e.clientY),area=p?window.PixelB8MapAreas?.hitTest?.(p.x,p.y):null;if(area)showLocationDetails(area);});
    c.addEventListener('wheel',e=>{
      if(e.target.closest('.map-locations-rail'))return;
      e.preventDefault();zoomMap(e.deltaY>0?.85:1.15,e.clientX,e.clientY);
    },{passive:false});
    c.addEventListener('contextmenu',e=>{
      if(e.target.closest('.waypoint-map-marker,.teleporter-map-marker,.generic-location-marker,.map-locations-rail,.map-location-details-card'))return;
      e.preventDefault();const p=gameAt(e.clientX,e.clientY),area=p?window.PixelB8MapAreas?.hitTest?.(p.x,p.y):null;
      if(area)openMenu(e.clientX,e.clientY,{kind:'area',id:area.id,name:area.name||'Area',planet:area.planet,x:area.x,y:area.y,z:area.z||0,item:area});
      else if(p)openMenu(e.clientX,e.clientY,{kind:'map',...p,name:'Map Location'});
    });
    window.addEventListener('mouseup',()=>{
      if(!state.drag)return;
      state.drag=false;c.classList.remove('dragging');setTimeout(()=>{state.didDrag=false;},0);
    });
    document.addEventListener('click',e=>{if(!e.target.closest('#mapContextMenu'))closeMenu();});
  }


  function refreshNexusLocations(){
    drawOtherLocations();
    renderNexusLocationSections();
    window.PixelB8MapAreas?.refresh?.();
  }

  function refresh(){
    populateMapSelect();
    drawWaypoints();
    drawTeleporters();
    drawOtherLocations();
    drawLastKnown();
    renderLocationRail();
    renderNexusLocationSections();
    updateTransform();
    window.PixelB8MapAreas?.refresh?.();
  }
  function refreshTeleporters(){drawTeleporters();renderTeleporterRail();}
  function refreshWaypoints(){drawWaypoints();renderWaypointRail();}
  function refreshLastKnown(){drawLastKnown();}

  function renderMap(){
    init();populateMapSelect();
    const sel=document.getElementById('waypointMapPlanetSelect');if(!sel)return;
    if(!state.currentImageSrc){
      const current=window.EntropiaWaypoints?.getCurrentPlanet?.()||window.EntropiaWaypoints?.getLastKnownPosition?.()?.planet||'';
      const preferred=MAPS.find(m=>norm(m.planet).toLowerCase()===norm(current).toLowerCase());
      if(preferred)sel.value=preferred.planet;
    }
    if(!sel.value)sel.value=MAPS[0].planet;
    const img=document.getElementById('baseMapImg'),m=MAPS.find(x=>x.planet===sel.value);
    if(m&&state.currentImageSrc!==m.src)changeMap(sel.value);else refresh();
    window.PixelB8MapsAPI?.loadTeleporters?.();
    window.PixelB8MapsAPI?.loadLocations?.().then?.(()=>refreshNexusLocations());
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();

  return {
    renderMap,refresh,refreshTeleporters,refreshWaypoints,refreshLastKnown,refreshNexusLocations,
    changeMap,zoomMap,resetMapView,fitMapView,centerOnLastKnown,centerCoordinate,setLayer,renderLocationRail,renderAreaRails,toggleLocationsRail,
    showLocationDetails,closeLocationDetails,gameToScreen,pixelsPerMeter,getViewingPlanet,
    isLocationCategoryEnabled,setLocationCategory,renderNexusLocationSections
  };
})();
