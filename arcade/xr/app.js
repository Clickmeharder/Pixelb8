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

const CHAT_TOPIC='pixelb8/site/v1/chat/global';
const CHAT_BROKER='wss://broker.hivemq.com:8884/mqtt';
const PROFILE_KEY='pixelb8_profile_v1';

const HOTBAR_ITEMS={
  1:{id:'wave',label:'Wave',icon:'👋',kind:'action'},
  2:{id:'slap',label:'Slap',icon:'🖐',kind:'action'},
  3:{id:'punch',label:'Punch',icon:'✊',kind:'action'}
};

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
  toastTimer:null,
  chatClient:null,
  chatSeen:new Set(),
  inventory:[],
  player:{
    health:100,
    stamina:100,
    running:false,
    crouched:false,
    onGround:true,
    velocityY:0,
    floorY:0,
    keys:new Set(),
    vrMoving:false,
    inventoryOpen:false,
    selectedSlot:1,
    lastHealthChange:Date.now(),
    lastStaminaChange:Date.now()
  }
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
  promptCopy.textContent=item.copy||'Press Enter';
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
    <a-text value="ENTER TO PLAY" position="0 .54 .47" align="center" color="#aeb9c4" width="1.55"></a-text>
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
  document.getElementById('hudMode').textContent=`Playing ${game.title} · Backspace to step away`;
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
  document.getElementById('hudMode').textContent='WASD move · Enter interact · R run/walk · C crouch · Space jump';
}

function enterDungeon(){
  disengageCabinet();
  state.dungeon=true;
  state.player.floorY=-12;
  state.player.onGround=true;
  state.player.velocityY=0;
  const r=rig();
  r.object3D.position.set(0,-12,-52);
  camera()?.object3D.rotation.set(0,0,0);
  dungeonHud.classList.remove('hidden');
  ensureDungeonChunks(0);
  toast('The door slams shut behind you.',2600);
}

function leaveDungeon(){
  state.dungeon=false;
  state.player.floorY=0;
  state.player.onGround=true;
  state.player.velocityY=0;
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
    return game&&{type,id,title:game.title,copy:'Press Enter to play inside this cabinet'};
  }
  if(type==='table'){
    const table=BOARD_TABLES.find(t=>t.id===id);
    return table&&{type,id,title:table.title,copy:'Press Enter · XR table integration coming next'};
  }
  if(type==='exit')return{type,id,title:'Exit Arcade',copy:'Press Enter to return to the 2D Arcade'};
  if(type==='dungeon')return{type,id,title:'Basement Dungeon',copy:'Press Enter to descend'};
  if(type==='girls')return{type,id,title:'Girls Washroom',copy:'Door is decorative for now'};
  if(type==='boys')return{type,id,title:'Boys Washroom',copy:'Door is decorative for now'};
  if(type==='dungeon-exit')return{type,id,title:'Return to Arcade',copy:'Press Enter to go back upstairs'};
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


function isEditableTarget(target){
  if(!target)return false;
  return target instanceof HTMLInputElement
    || target instanceof HTMLTextAreaElement
    || target instanceof HTMLSelectElement
    || target.isContentEditable;
}

function getProfile(){
  try{
    const saved=JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}');
    const name=String(saved.name||'Guest').trim().slice(0,32)||'Guest';
    return {name,initial:String(saved.initial||name[0]||'G').slice(0,2).toUpperCase()};
  }catch{
    return {name:'Guest',initial:'G'};
  }
}

function setChatState(online,label){
  const el=document.getElementById('chatState');
  if(!el)return;
  el.textContent=label;
  el.classList.toggle('online',online);
}

function renderChatSystem(text){
  const host=document.getElementById('chatMessages');
  if(!host)return;
  const row=document.createElement('div');
  row.className='xr-chat-system';
  row.textContent=text;
  host.appendChild(row);
  while(host.children.length>80)host.removeChild(host.firstChild);
  host.scrollTop=host.scrollHeight;
}

function renderChatMessage(msg){
  const host=document.getElementById('chatMessages');
  if(!host)return;
  const profile=getProfile();
  const row=document.createElement('div');
  row.className='xr-chat-row'+(String(msg.name||'')===profile.name?' self':'');
  const meta=document.createElement('div');
  meta.className='xr-chat-meta';
  const author=document.createElement('b');
  author.textContent=String(msg.name||'Guest').slice(0,32);
  const time=document.createElement('span');
  time.textContent=new Date(Number(msg.timestamp)||Date.now()).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
  meta.append(author,time);
  const body=document.createElement('div');
  body.textContent=String(msg.text||'').slice(0,240);
  row.append(meta,body);
  host.appendChild(row);
  while(host.children.length>80)host.removeChild(host.firstChild);
  host.scrollTop=host.scrollHeight;
}

function initGlobalChat(){
  const form=document.getElementById('chatForm');
  const input=document.getElementById('chatInput');
  const panel=document.getElementById('globalChat');
  const collapse=document.getElementById('chatCollapse');

  collapse?.addEventListener('click',()=>{
    const collapsed=panel.classList.toggle('collapsed');
    collapse.textContent=collapsed?'+':'−';
  });

  form?.addEventListener('submit',e=>{
    e.preventDefault();
    e.stopPropagation();
    sendGlobalChat();
  });

  input?.addEventListener('keydown',e=>{
    // Chat owns its keyboard while focused. This prevents Enter, numbers,
    // movement keys, Backspace, etc. leaking into the world/cabinet.
    e.stopPropagation();
    if(e.key==='Enter'){
      e.preventDefault();
      sendGlobalChat();
    }
  });

  if(typeof mqtt==='undefined'){
    setChatState(false,'OFFLINE');
    renderChatSystem('MQTT chat library unavailable.');
    return;
  }

  state.chatClient=mqtt.connect(CHAT_BROKER,{
    clientId:`P8_XR_CHAT_${Math.random().toString(36).slice(2,12)}`,
    clean:true,
    reconnectPeriod:3000,
    connectTimeout:10000
  });
  state.chatClient.on('connect',()=>{
    state.chatClient.subscribe(CHAT_TOPIC);
    setChatState(true,'LIVE');
    renderChatSystem('Connected to PixelB8 global chat.');
  });
  state.chatClient.on('reconnect',()=>setChatState(false,'RECONNECTING'));
  state.chatClient.on('offline',()=>setChatState(false,'OFFLINE'));
  state.chatClient.on('close',()=>setChatState(false,'OFFLINE'));
  state.chatClient.on('error',()=>setChatState(false,'ERROR'));
  state.chatClient.on('message',(topic,payload)=>{
    if(topic!==CHAT_TOPIC)return;
    try{
      const msg=JSON.parse(payload.toString());
      if(!msg?.id||!msg?.text||state.chatSeen.has(msg.id))return;
      state.chatSeen.add(msg.id);
      renderChatMessage(msg);
    }catch{}
  });
}

function sendGlobalChat(){
  const input=document.getElementById('chatInput');
  const text=String(input?.value||'').trim().slice(0,240);
  if(!text)return;
  if(!state.chatClient?.connected){
    renderChatSystem('Chat is offline.');
    return;
  }
  const profile=getProfile();
  state.chatClient.publish(CHAT_TOPIC,JSON.stringify({
    id:`${Date.now()}_${Math.random().toString(36).slice(2,8)}`,
    name:profile.name,
    text,
    timestamp:Date.now()
  }),{qos:0,retain:false});
  input.value='';
}

function renderInventory(){
  const grid=document.getElementById('inventoryGrid');
  const count=document.getElementById('inventoryCount');
  if(!grid)return;
  const slots=24;
  grid.innerHTML=Array.from({length:slots},(_,i)=>{
    const item=state.inventory[i];
    return item
      ? `<div class="inventory-slot has-item" data-inventory-slot="${i}"><span>${item.icon||'■'}</span><b>${item.label||item.id||'Item'}</b></div>`
      : `<div class="inventory-slot" data-inventory-slot="${i}">Empty</div>`;
  }).join('');
  if(count)count.textContent=`${state.inventory.length} / ${slots}`;
}

function setInventoryOpen(open){
  state.player.inventoryOpen=Boolean(open);
  const panel=document.getElementById('inventoryPanel');
  panel?.classList.toggle('hidden',!state.player.inventoryOpen);
  if(state.player.inventoryOpen){
    renderInventory();
    setMovementEnabled(false);
    document.exitPointerLock?.();
  }else if(!state.engaged){
    setMovementEnabled(true);
  }
}

function selectHotbarSlot(slot,use=true){
  const n=Number(slot);
  state.player.selectedSlot=n;
  document.querySelectorAll('[data-hotbar-slot]').forEach(el=>{
    el.classList.toggle('active',Number(el.dataset.hotbarSlot)===n);
  });
  const item=HOTBAR_ITEMS[n];
  if(use&&item)useHotbarItem(item,n);
}

function useHotbarItem(item,slot){
  const el=document.querySelector(`[data-hotbar-slot="${slot}"]`);
  el?.classList.remove('pulse');
  void el?.offsetWidth;
  el?.classList.add('pulse');

  const phrases={
    wave:'You wave.',
    slap:'You throw a slap.',
    punch:'You punch the air.'
  };
  toast(phrases[item.id]||`Used ${item.label}.`,1200);

  // Hook point for future visible hands, multiplayer avatar events, weapons and toys.
  window.dispatchEvent(new CustomEvent('pixelb8-xr-player-action',{
    detail:{action:item.id,slot,timestamp:Date.now()}
  }));
}

function showVitals(kind='stamina'){
  const now=Date.now();
  if(kind==='health')state.player.lastHealthChange=now;
  if(kind==='stamina')state.player.lastStaminaChange=now;
  document.getElementById('playerVitals')?.classList.remove('faded');
}

function updateVitals(){
  const p=state.player;
  const hf=document.getElementById('healthFill');
  const sf=document.getElementById('staminaFill');
  if(hf)hf.style.width=`${Math.max(0,Math.min(100,p.health))}%`;
  if(sf)sf.style.width=`${Math.max(0,Math.min(100,p.stamina))}%`;
  const hv=document.getElementById('healthValue');
  const sv=document.getElementById('staminaValue');
  if(hv)hv.textContent=String(Math.round(p.health));
  if(sv)sv.textContent=String(Math.round(p.stamina));

  const recent=Math.max(p.lastHealthChange,p.lastStaminaChange);
  document.getElementById('playerVitals')?.classList.toggle('faded',Date.now()-recent>10000);
}

function changeStamina(delta){
  const p=state.player;
  const next=Math.max(0,Math.min(100,p.stamina+delta));
  if(Math.abs(next-p.stamina)<.001)return;
  p.stamina=next;
  p.lastStaminaChange=Date.now();
  if(p.running&&p.stamina<=.1)setRunning(false);
  updateVitals();
}

function changeHealth(delta){
  const p=state.player;
  const next=Math.max(0,Math.min(100,p.health+delta));
  if(Math.abs(next-p.health)<.001)return;
  p.health=next;
  p.lastHealthChange=Date.now();
  updateVitals();
}

function movementAcceleration(){
  if(state.player.crouched)return 13;
  if(state.player.running&&state.player.stamina>0)return 48;
  return 25;
}

function refreshMovementControls(){
  camera()?.setAttribute('wasd-controls','acceleration',movementAcceleration());
  const modeEl=document.getElementById('moveMode');
  if(modeEl){
    modeEl.textContent=state.player.running?'RUN':'WALK';
    modeEl.classList.toggle('run',state.player.running);
  }
  document.getElementById('crouchState')?.classList.toggle('hidden',!state.player.crouched);
}

function setRunning(run){
  state.player.running=Boolean(run)&&state.player.stamina>0&&!state.player.crouched;
  refreshMovementControls();
  toast(state.player.running?'Run mode':'Walk mode',900);
}

function toggleCrouch(){
  state.player.crouched=!state.player.crouched;
  if(state.player.crouched)state.player.running=false;
  camera()?.setAttribute('position',`0 ${state.player.crouched?1.08:1.65} 0`);
  refreshMovementControls();
  toast(state.player.crouched?'Crouched':'Standing',900);
}

function jump(){
  const p=state.player;
  if(!p.onGround||p.crouched||p.stamina<10||state.engaged||p.inventoryOpen)return;
  p.onGround=false;
  p.velocityY=4.45;
  changeStamina(-11);
  showVitals('stamina');
}

function updatePlayer(time,delta){
  const p=state.player;
  const dt=Math.min(.05,Math.max(0,(delta||0)/1000));

  if(!p.onGround){
    p.velocityY+=-9.8*dt;
    const r=rig();
    r.object3D.position.y+=p.velocityY*dt;
    if(r.object3D.position.y<=p.floorY){
      r.object3D.position.y=p.floorY;
      p.velocityY=0;
      p.onGround=true;
    }
  }

  const keyboardMoving=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight']
    .some(code=>p.keys.has(code));
  const moving=(keyboardMoving||p.vrMoving)&&!state.engaged&&!p.inventoryOpen;

  if(moving){
    const drain=p.running?5.4:(p.crouched?0.9:1.7);
    changeStamina(-drain*dt);
  }else if(p.onGround&&!state.engaged){
    changeStamina(7.2*dt);
  }

  updateVitals();
}

function initPlayerUI(){
  renderInventory();
  refreshMovementControls();
  updateVitals();

  document.querySelectorAll('[data-hotbar-slot]').forEach(btn=>{
    btn.addEventListener('click',()=>selectHotbarSlot(btn.dataset.hotbarSlot,true));
  });

  document.getElementById('inventoryClose')?.addEventListener('click',()=>setInventoryOpen(false));
  document.getElementById('inventoryPanel')?.addEventListener('click',e=>{
    if(e.target.id==='inventoryPanel')setInventoryOpen(false);
  });

  // Public hooks for future combat/items/NPC systems.
  window.PixelB8XRPlayer={
    damage(amount){changeHealth(-Math.abs(Number(amount)||0));},
    heal(amount){changeHealth(Math.abs(Number(amount)||0));},
    setHealth(value){state.player.health=Math.max(0,Math.min(100,Number(value)||0));showVitals('health');updateVitals();},
    getHealth(){return state.player.health;},
    getStamina(){return state.player.stamina;},
    addInventoryItem(item){
      if(state.inventory.length>=24)return false;
      state.inventory.push(item||{id:'item',label:'Item'});
      renderInventory();
      return true;
    },
    setHotbarSlot(slot,item){
      const n=Number(slot);
      if(n<0||n>9)return false;
      if(item)HOTBAR_ITEMS[n]=item; else delete HOTBAR_ITEMS[n];
      const btn=document.querySelector(`[data-hotbar-slot="${n}"]`);
      if(btn){
        btn.classList.toggle('empty',!item);
        btn.querySelector('span').textContent=item?.icon||'·';
        btn.querySelector('b').textContent=item?.label||'Empty';
      }
      return true;
    },
    useHotbar(slot){selectHotbarSlot(slot,true);}
  };
}

AFRAME.registerComponent('arcade-world',{
  init(){
    buildArcade();
    buildDungeonEntrance();
    setupEmbeddedGames();
    initPlayerUI();
    initGlobalChat();

    window.addEventListener('keydown',e=>{
      // Inputs own their keys. This is especially important for MQTT chat:
      // Enter sends the message instead of entering a cabinet or reaching the game.
      if(isEditableTarget(e.target))return;

      if(state.engaged){
        if(e.key==='Backspace'){
          e.preventDefault();
          e.stopPropagation();
          disengageCabinet();
          return;
        }
        // Escape and every normal game key are deliberately forwarded.
        dispatchGameKey('keydown',e);
        e.preventDefault();
        return;
      }

      if(state.player.inventoryOpen){
        if(e.key.toLowerCase()==='i'||e.key==='Escape'){
          e.preventDefault();
          setInventoryOpen(false);
        }
        return;
      }

      state.player.keys.add(e.code);

      if(e.key==='Enter'&&state.nearby){
        e.preventDefault();
        interact(state.nearby);
        return;
      }

      if(e.key.toLowerCase()==='r'){
        e.preventDefault();
        setRunning(!state.player.running);
        return;
      }

      if(e.key.toLowerCase()==='c'){
        e.preventDefault();
        toggleCrouch();
        return;
      }

      if(e.key.toLowerCase()==='i'){
        e.preventDefault();
        setInventoryOpen(true);
        return;
      }

      if(e.code==='Space'){
        e.preventDefault();
        jump();
        return;
      }

      if(/^[0-9]$/.test(e.key)){
        e.preventDefault();
        selectHotbarSlot(Number(e.key),true);
      }
    },true);

    window.addEventListener('keyup',e=>{
      if(isEditableTarget(e.target))return;

      if(state.engaged){
        if(e.key==='Backspace')return;
        dispatchGameKey('keyup',e);
        e.preventDefault();
        return;
      }

      state.player.keys.delete(e.code);
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
  tick(time,delta){
    updatePlayer(time,delta);

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
    state.player.vrMoving=Boolean(this.axis.x||this.axis.y);
    if(state.engaged||state.player.inventoryOpen||(!this.axis.x&&!this.axis.y))return;
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
    const speed=state.player.crouched?1.25:(state.player.running&&state.player.stamina>0?4.6:this.speed);
    this.el.object3D.position.addScaledVector(move,speed*dt);
  }
});

document.getElementById('arcade2dBtn')?.addEventListener('click',()=>location.href='../index.html');
document.getElementById('controlsBtn')?.addEventListener('click',()=>document.getElementById('controlsPanel').classList.remove('hidden'));
document.getElementById('controlsClose')?.addEventListener('click',()=>document.getElementById('controlsPanel').classList.add('hidden'));
document.getElementById('controlsPanel')?.addEventListener('click',e=>{
  if(e.target.id==='controlsPanel')e.currentTarget.classList.add('hidden');
});
