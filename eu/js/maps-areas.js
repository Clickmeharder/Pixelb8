'use strict';

window.PixelB8MapAreas=(function(){
  let enabled=true;
  let hoveredId=null;
  let raf=0;
  let lastAreas=[];

  function clean(s){return String(s||'').trim();}
  function requestDraw(){
    if(raf)return;
    raf=requestAnimationFrame(()=>{raf=0;draw();});
  }
  function dataValue(data,...keys){
    for(const k of keys)if(data&&data[k]!=null)return data[k];
    return null;
  }
  function colorFor(areaType){
    const k=clean(areaType).toLowerCase();
    if(k==='pvparea')return 'rgba(235,55,55,.62)';
    if(k==='pvplootarea')return 'rgba(155,18,28,.72)';
    if(k==='treearea'||k.includes('tree'))return 'rgba(18,92,45,.68)';
    if(k==='mobarea')return 'rgba(235,235,235,.40)';
    if(k==='landarea')return 'rgba(56,196,88,.42)';
    if(k==='zonearea')return 'rgba(45,170,220,.42)';
    if(k==='waveeventarea')return 'rgba(142,68,220,.44)';
    return 'rgba(90,160,255,.34)';
  }
  function pointInPolygon(x,y,verts){
    let inside=false;
    for(let i=0,j=verts.length-1;i<verts.length;j=i++){
      const xi=verts[i][0],yi=verts[i][1],xj=verts[j][0],yj=verts[j][1];
      const hit=((yi>y)!=(yj>y))&&(x<(xj-xi)*(y-yi)/((yj-yi)||1e-9)+xi);
      if(hit)inside=!inside;
    }
    return inside;
  }
  function gameVertices(item){
    const raw=dataValue(item.data||{},'vertices','Vertices');
    if(!Array.isArray(raw))return [];
    const out=[];
    for(let i=0;i+1<raw.length;i+=2){
      const x=Number(raw[i]),y=Number(raw[i+1]);
      if(Number.isFinite(x)&&Number.isFinite(y))out.push([x,y]);
    }
    return out;
  }
  function categoryEnabled(item){
    const key=window.PixelB8MapsAPI?.locationCategoryKey?.(item);
    return window.PixelB8Maps?.isLocationCategoryEnabled?.(key)??true;
  }
  function hitTest(gameX,gameY){
    if(!enabled)return null;
    const areas=(lastAreas.length?lastAreas:(window.PixelB8MapsAPI?.getAreaLocations?.(window.PixelB8Maps?.getViewingPlanet?.())||[]))
      .filter(categoryEnabled);
    for(let i=areas.length-1;i>=0;i--){
      const item=areas[i],shape=clean(item.shape).toLowerCase(),data=item.data||{};
      if(shape==='polygon'){
        const verts=gameVertices(item);
        if(verts.length>=3&&pointInPolygon(gameX,gameY,verts))return item;
      }else if(shape==='circle'){
        const r=Number(dataValue(data,'radius','Radius')||0);
        if(r&&Math.hypot(gameX-item.x,gameY-item.y)<=r)return item;
      }else if(shape==='rectangle'){
        const w=Number(dataValue(data,'width','Width')||0),h=Number(dataValue(data,'height','Height')||0);
        if(w&&h&&Math.abs(gameX-item.x)<=w/2&&Math.abs(gameY-item.y)<=h/2)return item;
      }else if(Math.hypot(gameX-item.x,gameY-item.y)<=120){
        return item;
      }
    }
    return null;
  }
  function drawArea(ctx,item,isHover=false){
    const api=window.PixelB8Maps;
    if(!api)return;
    const center=api.gameToScreen(item.x,item.y);
    if(!center)return;

    const shape=clean(item.shape).toLowerCase();
    const data=item.data||{};
    const color=colorFor(item.areaType);

    ctx.save();
    ctx.globalAlpha=isHover?.86:.30;
    ctx.fillStyle=color;
    ctx.strokeStyle=isHover?'rgba(255,255,255,.98)':color;
    ctx.lineWidth=isHover?2.5:1.25;
    ctx.beginPath();

    if(shape==='polygon'){
      const verts=gameVertices(item);
      if(verts.length<3){ctx.restore();return;}
      let moved=false;
      for(const [x,y] of verts){
        const p=api.gameToScreen(x,y);
        if(!p)continue;
        if(!moved){ctx.moveTo(p.x,p.y);moved=true;}
        else ctx.lineTo(p.x,p.y);
      }
      if(!moved){ctx.restore();return;}
      ctx.closePath();
    }else if(shape==='circle'){
      const radius=Number(dataValue(data,'radius','Radius')||0);
      const ppm=api.pixelsPerMeter();
      if(!radius||!ppm){ctx.restore();return;}
      ctx.arc(center.x,center.y,radius*ppm,0,Math.PI*2);
    }else if(shape==='rectangle'){
      const width=Number(dataValue(data,'width','Width')||0);
      const height=Number(dataValue(data,'height','Height')||0);
      const ppm=api.pixelsPerMeter();
      if(!width||!height||!ppm){ctx.restore();return;}
      ctx.rect(center.x-width*ppm/2,center.y-height*ppm/2,width*ppm,height*ppm);
    }else{
      ctx.arc(center.x,center.y,isHover?7:4,0,Math.PI*2);
    }

    ctx.fill();
    ctx.globalAlpha=isHover?.98:.72;
    ctx.stroke();
    ctx.restore();
  }
  function draw(){
    const canvas=document.getElementById('mapCanvas');
    const map=document.getElementById('theMap');
    const planet=window.PixelB8Maps?.getViewingPlanet?.();
    if(!canvas||!map)return;

    const rect=map.getBoundingClientRect();
    const dpr=Math.max(1,Math.min(2,window.devicePixelRatio||1));
    const w=Math.round(rect.width*dpr),h=Math.round(rect.height*dpr);
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}
    canvas.style.width=`${rect.width}px`;
    canvas.style.height=`${rect.height}px`;

    const ctx=canvas.getContext('2d');
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.clearRect(0,0,rect.width,rect.height);

    if(!enabled||!planet){lastAreas=[];return;}

    lastAreas=(window.PixelB8MapsAPI?.getAreaLocations?.(planet)||[]).filter(categoryEnabled);
    for(const item of lastAreas)drawArea(ctx,item,String(item.id)===String(hoveredId));
  }
  function setEnabled(value){enabled=!!value;requestDraw();}
  function setHovered(id){hoveredId=id||null;requestDraw();}
  function refresh(){requestDraw();}
  return {refresh,setEnabled,setHovered,hitTest};
})();
