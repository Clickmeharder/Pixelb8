const CABINET_GAMES=[
  {
    id:'outdrive',
    title:'Out Drive',
    mark:'OD',
    frameId:'gameFrame-outdrive',
    color:'#4fc3f7',
    screenRatio:400/300
  },
  {
    id:'cyrenerangers',
    title:'Cyrene Rangers',
    mark:'CR',
    frameId:'gameFrame-cyrenerangers',
    color:'#39d98a',
    screenRatio:480/270
  }
];

const BOARD_TABLES=[
  {id:'connect4',title:'Connect 4',kind:'connect4',x:5.7,z:-3.8,color:'#ff5d70'},
  {id:'checkers',title:'Checkers',kind:'checkers',x:9.1,z:-3.8,color:'#e2b457'},
  {id:'deckofcards',title:'Deck of Cards',kind:'cards',x:12.5,z:-3.8,color:'#34a568'}
];

const state={
  nearby:null,
  engaged:null,
  gameTextures:new Map(),
  dungeon:false,
  dungeonMaxChunk:-1,
  dungeonChunks:new Map(),
  toastTimer:null
};

const prompt=document.getElementById('interactionPrompt');
const promptTitle=document.getElementById('promptTitle');
const promptCopy=document.getElementById('promptCopy');
const mode=document.getElementById('cabinetMode');
const modeTitle=document.getElementById('cabinetModeTitle');
const dungeonHud=document.getElementById('dungeonHud');
const dungeonDepth=document.getElementById('dungeonDepth');
const rig=()=>document.getElementById('playerRig');
const camera=()=>document.getElementById('playerCamera');

function toast(text,ms=2200){
  const el=document.getElementById('toast');
  el.textContent=text;
  el.classList.remove('hidden');
  clearTimeout(state.toastTimer);
  state.toastTimer=setTimeout(()=>el.classList.add('hidden'),ms);
}

function setPrompt(item){
  state.nearby=item||null;
  if(!item){
    prompt.classList.add('hidden');
    return;
  }
  promptTitle.textContent=item.title;
  promptCopy.textContent=item.copy||'Press E';
  prompt.classList.remove('hidden');
}

function worldPos(el){
  const v=new THREE.Vector3();
  el?.object3D?.getWorldPosition(v);
  return v;
}

function makeCabinet(game,x,z){
  return `
  <a-entity class="cabinet-root" data-interact="cabinet" data-id="${game.id}" position="${x} 0 ${z}">
    <a-box position="0 1.22 0" width="1.45" height="2.44" depth=".92" color="#151b23" roughness=".56" metalness=".18"></a-box>
    <a-box position="0 2.27 .02" width="1.34" height=".28" depth=".94" color="${game.color}" emissive="${game.color}" emissiveIntensity=".35"></a-box>
    <a-text value="${game.mark}" position="0 2.27 .495" align="center" color="#041015" width="2.8"></a-text>
    <a-plane id="screen-${game.id}" position="0 1.55 .475" width="1.17" height=".73" color="#020305"
      material="shader:flat;side:double"></a-plane>
    <a-box position="0 .94 .55" width="1.28" height=".13" depth=".38" color="#232c36"></a-box>
    <a-cylinder position="-.24 1.06 .67" radius=".035" height=".13" color="#606a76"></a-cylinder>
    <a-sphere position="-.24 1.13 .67" radius=".06" color="${game.color}" emissive="${game.color}" emissiveIntensity=".3"></a-sphere>
    <a-cylinder position=".24 1.00 .69" rotation="90 0 0" radius=".06" height=".028" color="#ff516d"></a-cylinder>
    <a-box position="0 .25 0" width="1.26" height=".48" depth=".83" color="#10151c"></a-box>
    <a-text value="E TO PLAY" position="0 .54 .47" align="center" color="#aeb9c4" width="1.55"></a-text>
    <a-box class="xr-interactable" data-interact="cabinet" data-id="${game.id}" position="0 1.3 .57"
      width="1.52" height="2.5" depth=".28" material="opacity:0;transparent:true"></a-box>
  </a-entity>`;
}

function chairMarkup(x,z,rot,color='#303843'){
  return `
    <a-entity position="${x} 0 ${z}" rotation="0 ${rot} 0">
      <a-box position="0 .47 0" width=".62" height=".10" depth=".62" color="${color}"></a-box>
      <a-box position="0 .86 .27" width=".62" height=".72" depth=".09" color="${color}"></a-box>
      <a-cylinder position="-.24 .23 -.22" radius=".035" height=".46" color="#222a31"></a-cylinder>
      <a-cylinder position=".24 .23 -.22" radius=".035" height=".46" color="#222a31"></a-cylinder>
      <a-cylinder position="-.24 .23 .22" radius=".035" height=".46" color="#222a31"></a-cylinder>
      <a-cylinder position=".24 .23 .22" radius=".035" height=".46" color="#222a31"></a-cylinder>
    </a-entity>`;
}

function tableMarkup(item){
  if(item.kind==='cards'){
    return `
    <a-entity class="table-root" data-interact="table" data-id="${item.id}" position="${item.x} 0 ${item.z}">
      <a-cylinder position="0 .76 0" radius="1.05" height=".15" color="#3a2417"></a-cylinder>
      <a-cylinder position="0 .85 0" radius=".94" height=".08" color="#14582e"></a-cylinder>
      <a-cylinder position="0 .38 0" radius=".18" height=".76" color="#2a1c14"></a-cylinder>
      <a-text value="DECK OF CARDS" position="0 1.02 0" rotation="-90 0 0" align="center" color="#d9ffe6" width="2.7"></a-text>
      <a-box class="xr-interactable" data-interact="table" data-id="${item.id}" position="0 1.05 0" width="2.4" height=".65" depth="2.4" material="opacity:0;transparent:true"></a-box>
      ${chairMarkup(0,1.55,180)}
      ${chairMarkup(0,-1.55,0)}
      ${chairMarkup(1.55,0,-90)}
      ${chairMarkup(-1.55,0,90)}
    </a-entity>`;
  }

  const isConnect=item.kind==='connect4';
  return `
  <a-entity class="table-root" data-interact="table" data-id="${item.id}" position="${item.x} 0 ${item.z}">
    <a-box position="0 .74 0" width="2.0" height=".16" depth="1.35" color="#4a3322"></a-box>
    <a-box position="0 .83 0" width="1.82" height=".06" depth="1.16" color="${isConnect?'#262f37':'#dad0b5'}"></a-box>
    <a-cylinder position="-.72 .36 -.45" radius=".055" height=".72" color="#30231a"></a-cylinder>
    <a-cylinder position=".72 .36 -.45" radius=".055" height=".72" color="#30231a"></a-cylinder>
    <a-cylinder position="-.72 .36 .45" radius=".055" height=".72" color="#30231a"></a-cylinder>
    <a-cylinder position=".72 .36 .45" radius=".055" height=".72" color="#30231a"></a-cylinder>
    ${isConnect
      ? `<a-box position="0 1.27 0" width="1.35" height=".85" depth=".12" color="#245ad4"></a-box>
         <a-text value="CONNECT 4" position="0 1.28 .07" align="center" color="#fff" width="2.0"></a-text>`
      : `<a-text value="CHECKERS" position="0 .88 0" rotation="-90 0 0" align="center" color="#3b281b" width="2.1"></a-text>`}
    <a-box class="xr-interactable" data-interact="table" data-id="${item.id}" position="0 1.15 0" width="2.3" height=".9" depth="1.65" material="opacity:0;transparent:true"></a-box>
    ${chairMarkup(0,1.25,180)}
    ${chairMarkup(0,-1.25,0)}
  </a-entity>`;
}

function makeDoor(id,title,x,z,rot,color,copy){
  return `
  <a-entity class="door-root" data-interact="${id}" data-id="${id}" position="${x} 0 ${z}" rotation="0 ${rot} 0">
    <a-box position="0 1.25 0" width="1.5" height="2.5" depth=".16" color="${color}" roughness=".72"></a-box>
    <a-box position="0 2.57 0" width="1.72" height=".15" depth=".23" color="#20262d"></a-box>
    <a-box position="-.82 1.3 0" width=".12" height="2.65" depth=".23" color="#20262d"></a-box>
    <a-box position=".82 1.3 0" width=".12" height="2.65" depth=".23" color="#20262d"></a-box>
    <a-sphere position=".54 1.22 .11" radius=".045" color="#d3af62" metalness=".75"></a-sphere>
    <a-text value="${title}" position="0 2.0 .11" align="center" color="#e6edf4" width="2.1"></a-text>
    <a-box class="xr-interactable" data-interact="${id}" data-id="${id}" position="0 1.3 .2"
      width="1.7" height="2.65" depth=".5" material="opacity:0;transparent:true"></a-box>
  </a-entity>`;
}

function buildArcade(){
  const cabinetHost=document.getElementById('cabinetHost');
  cabinetHost.innerHTML=
    makeCabinet(CABINET_GAMES[0],-7.3,-4.1)+
    makeCabinet(CABINET_GAMES[1],-5.4,-4.1);

  document.getElementById('tableGameHost').innerHTML=BOARD_TABLES.map(tableMarkup).join('');

  const doors=[
    makeDoor('girls','GIRLS',-12.2,-6.85,0,'#42243c','Washroom'),
    makeDoor('boys','BOYS',-9.9,-6.85,0,'#203448','Washroom'),
    makeDoor('dungeon','BASEMENT',0,-6.85,0,'#21100e','Enter the dungeon'),
    makeDoor('exit','EXIT',12.0,-6.85,0,'#263428','Return to 2D Arcade')
  ];
  document.getElementById('doorHost').innerHTML=doors.join('');
}

function setupEmbeddedGames(){
  CABINET_GAMES.forEach(game=>{
    const frame=document.getElementById(game.frameId);
    if(!frame)return;

    let attempts=0;
    let attached=false;
    let lastAccessError='';

    const tryAttach=()=>{
      if(attached||state.gameTextures.has(game.id))return true;
      attempts++;

      try{
        const doc=frame.contentDocument;
        if(!doc){
          lastAccessError='Embedded game document is not accessible yet.';
          return false;
        }

        const canvas=doc.getElementById('gameCanvas');
        if(!canvas){
          lastAccessError='Waiting for gameCanvas.';
          return false;
        }

        const screen=document.getElementById(`screen-${game.id}`);
        const mesh=screen?.getObject3D('mesh');
        if(!screen||!mesh?.material){
          lastAccessError='Waiting for the 3D cabinet screen mesh.';
          return false;
        }

        const texture=new THREE.CanvasTexture(canvas);
        texture.minFilter=THREE.LinearFilter;
        texture.magFilter=THREE.LinearFilter;
        texture.generateMipmaps=false;
        if('colorSpace' in texture&&THREE.SRGBColorSpace)texture.colorSpace=THREE.SRGBColorSpace;

        mesh.material.map=texture;
        mesh.material.color.set('#ffffff');
        mesh.material.needsUpdate=true;

        state.gameTextures.set(game.id,{texture,canvas,frame});
        attached=true;

        if(!doc.getElementById('pixelb8-xr-source-style')){
          const style=doc.createElement('style');
          style.id='pixelb8-xr-source-style';
          style.textContent='.ui-panel{display:none!important}';
          doc.head?.appendChild(style);
        }

        console.info(`[PixelB8 XR] ${game.title} cabinet connected after ${attempts} attempt(s).`);
        return true;
      }catch(err){
        lastAccessError=String(err?.message||err||'Unknown embedded-game access error');
        console.warn(`[PixelB8 XR] ${game.title} attach attempt ${attempts} failed`,err);
        return false;
      }
    };

    // Catch both timing orders: frame may already be complete before this code runs,
    // or it may finish later. A-Frame may also create the screen mesh after either.
    frame.addEventListener('load',()=>{
      tryAttach();
    });
    tryAttach();

    const retry=setInterval(()=>{
      if(tryAttach()){
        clearInterval(retry);
        return;
      }

      if(attempts>=120){
        clearInterval(retry);
        const fileHint=location.protocol==='file:'
          ? ' This browser may be blocking iframe access from file://. Try the same arcade through your local/site HTTP server.'
          : '';
        console.error(`[PixelB8 XR] ${game.title} cabinet failed to connect: ${lastAccessError}${fileHint}`);
        toast(`${game.title} cabinet could not connect.${fileHint}`,5000);
      }
    },250);
  });
}
function setMovementEnabled(enabled){
  const cam=camera();
  cam?.setAttribute('wasd-controls','enabled',enabled);
  document.getElementById('leftHand')?.setAttribute('raycaster','enabled',enabled);
  document.getElementById('rightHand')?.setAttribute('raycaster','enabled',enabled);
}

function dispatchGameKey(type,e){
  const game=state.engaged;
  if(!game)return;
  const rec=state.gameTextures.get(game.id);
  const win=rec?.frame?.contentWindow;
  if(!win)return;
  try{
    const evt=new win.KeyboardEvent(type,{
      key:e.key,
      code:e.code,
      keyCode:e.keyCode,
      which:e.which,
      shiftKey:e.shiftKey,
      ctrlKey:e.ctrlKey,
      altKey:e.altKey,
      metaKey:e.metaKey,
      bubbles:true,
      cancelable:true,
      repeat:e.repeat
    });
    win.dispatchEvent(evt);
    rec.frame.contentDocument?.dispatchEvent(evt);
  }catch(err){
    console.warn('Game key forwarding failed',err);
  }
}

function engageCabinet(id){
  const game=CABINET_GAMES.find(g=>g.id===id);
  if(!game)return;
  const rec=state.gameTextures.get(id);
  if(!rec){
    toast(`${game.title} is still loading...`);
    return;
  }
  state.engaged=game;
  setMovementEnabled(false);
  modeTitle.textContent=game.title;
  mode.classList.remove('hidden');
  document.getElementById('hudMode').textContent=`Playing ${game.title} · ESC to step away`;
  setPrompt(null);

  // Give the existing game the same "insert coin" start signal.
  setTimeout(()=>{
    try{
      const win=rec.frame.contentWindow;
      win.dispatchEvent(new win.KeyboardEvent('keydown',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
      win.dispatchEvent(new win.KeyboardEvent('keyup',{key:'Enter',code:'Enter',keyCode:13,which:13,bubbles:true}));
    }catch{}
  },80);
}

function disengageCabinet(){
  if(!state.engaged)return;
  state.engaged=null;
  setMovementEnabled(true);
  mode.classList.add('hidden');
  document.getElementById('hudMode').textContent='WASD move · mouse look · E interact';
}

function enterDungeon(){
  disengageCabinet();
  state.dungeon=true;
  const r=rig();
  r.object3D.position.set(0,-12,-52);
  camera()?.object3D.rotation.set(0,0,0);
  dungeonHud.classList.remove('hidden');
  ensureDungeonChunks(0);
  toast('The door slams shut behind you.',2600);
}

function leaveDungeon(){
  state.dungeon=false;
  const r=rig();
  r.object3D.position.set(0,0,9.5);
  dungeonHud.classList.add('hidden');
  dungeonDepth.textContent='0';
  toast('Back in the arcade.');
}

function dungeonChunkMarkup(index){
  const z=-60-(index*9);
  const even=index%2===0;
  const rune=even?'ᛝ':'ᚱ';
  const prop=index%4;
  let extra='';
  if(prop===1){
    extra=`<a-box position="-1.45 -11.45 ${z}" width=".7" height=".7" depth=".7" color="#302116"></a-box>`;
  }else if(prop===2){
    extra=`<a-cylinder position="1.42 -11.34 ${z}" radius=".28" height=".9" color="#25201a"></a-cylinder>`;
  }else if(prop===3){
    extra=`<a-text value="${rune}" position="0 -10.1 ${z-.1}" rotation="0 0 0" align="center" color="#a2352a" width="2.4"></a-text>`;
  }
  return `
  <a-entity class="dungeon-chunk" data-chunk="${index}">
    <a-box position="0 -12.05 ${z}" width="5.5" height=".15" depth="9" color="#171411"></a-box>
    <a-box position="-2.72 -9.65 ${z}" width=".22" height="4.7" depth="9" color="#211b17"></a-box>
    <a-box position="2.72 -9.65 ${z}" width=".22" height="4.7" depth="9" color="#211b17"></a-box>
    <a-box position="0 -7.3 ${z}" width="5.5" height=".18" depth="9" color="#161310"></a-box>

    <a-box position="-2.52 -9.55 ${z-2.6}" width=".08" height=".08" depth=".08" color="#ff6b42" emissive="#ff6b42" emissiveIntensity=".9"></a-box>
    <a-box position="2.52 -9.55 ${z+2.6}" width=".08" height=".08" depth=".08" color="#ff6b42" emissive="#ff6b42" emissiveIntensity=".9"></a-box>
    <a-light type="point" color="#ad3e25" intensity=".44" distance="6" position="-2.35 -9.25 ${z-2.6}"></a-light>
    <a-light type="point" color="#8f2e22" intensity=".38" distance="6" position="2.35 -9.25 ${z+2.6}"></a-light>

    <a-box position="0 -9.7 ${z-4.35}" width="5.05" height="4.1" depth=".18" color="#1d1814"
      material="opacity:${index%5===4?'.15':'0'};transparent:true"></a-box>
    ${extra}
  </a-entity>`;
}

function ensureDungeonChunks(currentIndex){
  const root=document.getElementById('dungeonRoot');
  const start=Math.max(0,currentIndex-2);
  const end=currentIndex+7;

  for(let i=start;i<=end;i++){
    if(state.dungeonChunks.has(i))continue;
    const holder=document.createElement('a-entity');
    holder.innerHTML=dungeonChunkMarkup(i);
    const chunk=holder.firstElementChild;
    root.appendChild(chunk);
    state.dungeonChunks.set(i,chunk);
    state.dungeonMaxChunk=Math.max(state.dungeonMaxChunk,i);
  }

  for(const [i,el] of [...state.dungeonChunks.entries()]){
    if(i<currentIndex-4){
      el.remove();
      state.dungeonChunks.delete(i);
    }
  }
}

function buildDungeonEntrance(){
  const root=document.getElementById('dungeonRoot');
  const entrance=document.createElement('a-entity');
  entrance.innerHTML=`
    <a-entity id="dungeonEntrance">
      <a-box position="0 -12.05 -55" width="5.5" height=".15" depth="10" color="#171411"></a-box>
      <a-box position="-2.72 -9.65 -55" width=".22" height="4.7" depth="10" color="#211b17"></a-box>
      <a-box position="2.72 -9.65 -55" width=".22" height="4.7" depth="10" color="#211b17"></a-box>
      <a-box position="0 -7.3 -55" width="5.5" height=".18" depth="10" color="#161310"></a-box>
      <a-entity data-interact="dungeon-exit" position="0 -12 -50.5">
        <a-box position="0 1.25 0" width="1.5" height="2.5" depth=".16" color="#21100e"></a-box>
        <a-text value="ARCADE" position="0 1.9 .1" align="center" color="#cba095" width="2.0"></a-text>
        <a-box class="xr-interactable" data-interact="dungeon-exit" position="0 1.3 .25"
          width="1.8" height="2.7" depth=".55" material="opacity:0;transparent:true"></a-box>
      </a-entity>
    </a-entity>`;
  root.appendChild(entrance.firstElementChild);
  ensureDungeonChunks(0);
}

function findNearestInteraction(){
  if(state.engaged)return null;
  const cam=camera();
  if(!cam)return null;
  const p=worldPos(cam);
  let best=null;
  let bestDist=2.25;

  document.querySelectorAll('[data-interact].door-root,.cabinet-root,.table-root,#dungeonEntrance [data-interact]').forEach(el=>{
    const hit=el.matches('.cabinet-root,.table-root,.door-root')?el:el.closest('[data-interact]');
    if(!hit)return;
    const d=Math.hypot(p.x-worldPos(hit).x,p.y-worldPos(hit).y,p.z-worldPos(hit).z);
    if(d<bestDist){
      bestDist=d;
      best=hit;
    }
  });

  if(!best)return null;
  const type=best.dataset.interact;
  const id=best.dataset.id||type;

  if(type==='cabinet'){
    const game=CABINET_GAMES.find(g=>g.id===id);
    return game&&{type,id,title:game.title,copy:'Press E to play inside this cabinet'};
  }
  if(type==='table'){
    const table=BOARD_TABLES.find(t=>t.id===id);
    return table&&{type,id,title:table.title,copy:'Press E · XR table integration coming next'};
  }
  if(type==='exit')return{type,id,title:'Exit Arcade',copy:'Press E to return to the 2D Arcade'};
  if(type==='dungeon')return{type,id,title:'Basement Dungeon',copy:'Press E to descend'};
  if(type==='girls')return{type,id,title:'Girls Washroom',copy:'Door is decorative for now'};
  if(type==='boys')return{type,id,title:'Boys Washroom',copy:'Door is decorative for now'};
  if(type==='dungeon-exit')return{type,id,title:'Return to Arcade',copy:'Press E to go back upstairs'};
  return null;
}

function interact(item){
  if(!item)return;
  switch(item.type){
    case 'cabinet': engageCabinet(item.id); break;
    case 'table': toast(`${item.title}: physical table is ready; multiplayer XR gameplay comes next.`); break;
    case 'exit': location.href='../index.html'; break;
    case 'dungeon': enterDungeon(); break;
    case 'dungeon-exit': leaveDungeon(); break;
    case 'girls':
    case 'boys': toast(`${item.title} isn't explorable yet.`); break;
  }
}

AFRAME.registerComponent('arcade-world',{
  init(){
    buildArcade();
    buildDungeonEntrance();
    setupEmbeddedGames();

    window.addEventListener('keydown',e=>{
      if(state.engaged){
        if(e.key==='Escape'){
          e.preventDefault();
          disengageCabinet();
          return;
        }
        dispatchGameKey('keydown',e);
        e.preventDefault();
        return;
      }

      if(e.key.toLowerCase()==='e'&&state.nearby){
        e.preventDefault();
        interact(state.nearby);
      }
    },true);

    window.addEventListener('keyup',e=>{
      if(state.engaged){
        dispatchGameKey('keyup',e);
        e.preventDefault();
      }
    },true);

    ['leftHand','rightHand'].forEach(id=>{
      const hand=document.getElementById(id);
      hand?.addEventListener('triggerdown',()=>{
        const hit=hand.components?.raycaster?.intersections?.[0]?.object?.el;
        if(!hit)return;
        const interactEl=hit.closest?.('[data-interact]')||hit;
        const type=interactEl?.dataset?.interact;
        const ident=interactEl?.dataset?.id||type;
        if(type==='cabinet')interact({type,id:ident});
        else if(type==='table')interact({type,id:ident,title:BOARD_TABLES.find(t=>t.id===ident)?.title||'Table Game'});
        else if(type)interact({type,id:ident,title:type});
      });
    });
  },
  tick(){
    for(const rec of state.gameTextures.values()){
      rec.texture.needsUpdate=true;
    }

    if(!state.engaged){
      setPrompt(findNearestInteraction());
    }

    if(state.dungeon){
      const p=rig().object3D.position;
      const depth=Math.max(0,Math.floor((-p.z-52)/9));
      dungeonDepth.textContent=String(depth);
      ensureDungeonChunks(depth);
    }
  }
});

AFRAME.registerComponent('xr-thumbstick-locomotion',{
  init(){
    this.axis={x:0,y:0};
    this.speed=2.7;
    document.getElementById('leftHand')?.addEventListener('thumbstickmoved',e=>{
      const x=e.detail.x||0,y=e.detail.y||0;
      this.axis.x=Math.abs(x)>.12?x:0;
      this.axis.y=Math.abs(y)>.12?y:0;
    });
  },
  tick(time,delta){
    if(state.engaged||(!this.axis.x&&!this.axis.y))return;
    const cam=camera();
    if(!cam)return;
    const dt=Math.min(.05,delta/1000);
    const yaw=THREE.MathUtils.degToRad(cam.getAttribute('rotation').y||0);
    const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
    const right=new THREE.Vector3(Math.cos(yaw),0,-Math.sin(yaw));
    const move=new THREE.Vector3();
    move.addScaledVector(right,this.axis.x);
    move.addScaledVector(forward,-this.axis.y);
    if(move.lengthSq()>1)move.normalize();
    this.el.object3D.position.addScaledVector(move,this.speed*dt);
  }
});

document.getElementById('arcade2dBtn')?.addEventListener('click',()=>location.href='../index.html');
document.getElementById('controlsBtn')?.addEventListener('click',()=>document.getElementById('controlsPanel').classList.remove('hidden'));
document.getElementById('controlsClose')?.addEventListener('click',()=>document.getElementById('controlsPanel').classList.add('hidden'));
document.getElementById('controlsPanel')?.addEventListener('click',e=>{
  if(e.target.id==='controlsPanel')e.currentTarget.classList.add('hidden');
});
