const spatialRuntime=window.PIXELB8_SKIP_XR_BOOTSTRAP
  ?null
  :(window.PixelB8Spatial?.createRuntime?.(window.PixelB8WorldManifest||{})?.start?.()||null);
if(spatialRuntime)window.PixelB8SpatialRuntime=spatialRuntime;
window.PixelB8SpatialInventory=
  window.PixelB8Spatial?.InventoryModel
    ?new window.PixelB8Spatial.InventoryModel()
    :null;


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
  {id:'connect4',title:'Connect 4',kind:'connect4',x:5.5,z:-3.7,color:'#ff5d70'},
  {id:'checkers',title:'Checkers',kind:'checkers',x:9.0,z:-3.7,color:'#e2b457'},
  {id:'deckofcards',title:'Deck of Cards',kind:'cards',x:13.0,z:-3.7,color:'#34a568'}
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
    crouchAmount:0,
    leaning:false,
    sitting:false,
    seatEl:null,
    baseEyeHeight:1.65,
    onGround:true,
    velocityY:0,
    floorY:0,
    keys:new Set(),
    vrMoving:false,
    inventoryOpen:false,
    selectedSlot:1,
    lastHealthChange:Date.now(),
    lastStaminaChange:Date.now()
  },
  collision:{
    radius:.28,
    lastSafe:null
  },
  pool:{
    active:false,
    balls:[],
    aim:Math.PI,
    power:.62,
    cuePull:0,
    maxCuePull:0,
    forwardPeak:0,
    lastMouseStamp:0,
    gripping:false,
    fineYaw:0,
    cueElevation:0,
    cueReach:0,
    reaching:false,
    tool:'cue',
    bridgePlaced:false,
    trajectory:false,
    shotInProgress:false,
    cueNeedsRespawn:false,
    physicsAccumulator:0,
    lastAim:null,
    aimVisuals:null,
    placementPreview:{x:0,z:0,valid:false,visible:false},
    manualRack:{
      active:false,
      selectedBall:null,
      slots:Array(15).fill(null)
    },
    rules:{
      currentPlayer:1,
      groups:{1:null,2:null},
      tableOpen:true,
      breakShot:true,
      calledGroup:null,
      shotPocketed:[],
      foul:false,
      foulReason:'',
      ballInHand:false,
      rackOver:false,
      freePlay:false,
      winner:null,
      eightOffOnBreak:false
    },
    turn:1
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

function makeOutDriveCabinet(game,x,z){
  return `
  <a-entity class="cabinet-root collision-box" data-collision-halfx=".92" data-collision-halfz=".72"
    data-interact="cabinet" data-id="${game.id}" position="${x} 0 ${z}">
    <a-box position="0 1.2 0" width="1.58" height="2.4" depth=".92" color="#a60c0c" roughness=".48" metalness=".12"></a-box>
    <a-box position="0 2.28 .01" width="1.58" height=".38" depth=".95" color="#080909"></a-box>
    <a-text value="OUT DRIVE" position="0 2.29 .49" align="center" color="#00ffcc" width="3.0"></a-text>
    <a-text value="ROAD TO ENTROPIA" position="0 2.13 .493" align="center" color="#ff6262" width="1.7"></a-text>

    <a-box position="0 1.58 .43" width="1.36" height=".90" depth=".16" color="#08090b"></a-box>
    <a-plane id="screen-${game.id}" position="0 1.59 .525" width="1.16" height=".87" color="#020305" material="shader:flat;side:double"></a-plane>

    <a-box position="0 .91 .55" width="1.58" height=".18" depth=".48" color="#17191b"></a-box>
    <a-entity id="xr-outdrive-wheel" position="-.12 1.02 .73" rotation="90 0 0">
      <a-torus radius=".22" radius-tubular=".035" color="#141414"></a-torus>
      <a-box width=".36" height=".045" depth=".045" color="#bd1717"></a-box>
      <a-box width=".045" height=".23" depth=".045" position="0 -.08 0" color="#bd1717"></a-box>
      <a-cylinder radius=".07" height=".05" color="#7f0505" rotation="90 0 0"></a-cylinder>
      <a-text value="HORN" position="0 0 .035" rotation="-90 0 0" align="center" color="#fff" width=".54"></a-text>
    </a-entity>

    <a-entity id="xr-outdrive-shifter" position=".53 .95 .73">
      <a-box width=".24" height=".08" depth=".30" color="#0c0d0e"></a-box>
      <a-cylinder radius=".025" height=".27" position="0 .15 0" color="#777"></a-cylinder>
      <a-sphere id="xr-outdrive-shifter-knob" radius=".07" position="0 .29 0" color="#c81616"></a-sphere>
      <a-text id="xr-outdrive-gear" value="1" position="0 .295 .075" align="center" color="#fff" width=".5"></a-text>
    </a-entity>

    <a-box position="0 .55 .47" width="1.58" height=".18" depth=".04" color="#fff"></a-box>
    <a-box position="-.60 .55 .495" width=".20" height=".18" depth=".02" color="#080808"></a-box>
    <a-box position="-.20 .55 .495" width=".20" height=".18" depth=".02" color="#080808"></a-box>
    <a-box position=".20 .55 .495" width=".20" height=".18" depth=".02" color="#080808"></a-box>
    <a-box position=".60 .55 .495" width=".20" height=".18" depth=".02" color="#080808"></a-box>

    <a-box position="0 .25 0" width="1.40" height=".48" depth=".82" color="#781010"></a-box>
    <a-box position="0 .25 .43" width=".42" height=".30" depth=".04" color="#141414"></a-box>
    <a-box position="-.09 .28 .46" width=".055" height=".14" depth=".02" color="#ff3434" emissive="#ff3434" emissiveIntensity=".5"></a-box>
    <a-box position=".09 .28 .46" width=".055" height=".14" depth=".02" color="#421111"></a-box>

    <a-box class="xr-interactable" data-interact="cabinet" data-id="${game.id}" position="0 1.3 .62"
      width="1.75" height="2.55" depth=".36" material="opacity:0;transparent:true"></a-box>
  </a-entity>`;
}

function makeCyreneCabinet(game,x,z){
  const buttons=[
    [-.28,1.01,'#e44242'],[-.08,1.01,'#3ba7ff'],[.12,1.01,'#52d77d'],
    [-.18,.88,'#b765f1'],[.02,.88,'#f2cf44'],[.22,.88,'#f28a42']
  ];
  return `
  <a-entity class="cabinet-root collision-box" data-collision-halfx=".96" data-collision-halfz=".74"
    data-interact="cabinet" data-id="${game.id}" position="${x} 0 ${z}">
    <a-box position="0 1.2 0" width="1.66" height="2.4" depth=".94" color="#8a1496" roughness=".5" metalness=".10"></a-box>
    <a-box position="0 2.28 .01" width="1.66" height=".39" depth=".97" color="#09080b"></a-box>
    <a-text value="CYRENE RANGERS" position="0 2.28 .50" align="center" color="#00ffcc" width="2.85"></a-text>

    <a-box position="0 1.58 .43" width="1.42" height=".86" depth=".16" color="#09090b"></a-box>
    <a-plane id="screen-${game.id}" position="0 1.59 .525" width="1.24" height=".70" color="#020305" material="shader:flat;side:double"></a-plane>

    <a-box position="0 .93 .56" width="1.66" height=".17" depth=".50" color="#17191b"></a-box>
    <a-entity id="xr-cyrene-stick" position="-.48 1.0 .73">
      <a-cylinder radius=".10" height=".045" color="#090909"></a-cylinder>
      <a-cylinder radius=".027" height=".20" position="0 .11 0" color="#6b6b6b"></a-cylinder>
      <a-sphere id="xr-cyrene-stick-ball" radius=".075" position="0 .22 0" color="#c8172a"></a-sphere>
    </a-entity>
    ${buttons.map((b,i)=>`<a-cylinder id="xr-cyrene-btn-${i}" position="${b[0]} ${b[1]} .73" rotation="90 0 0" radius=".055" height=".035" color="${b[2]}"></a-cylinder>`).join('')}

    <a-box position="0 .55 .47" width="1.66" height=".18" depth=".04" color="#fff"></a-box>
    <a-box position="-.62 .55 .495" width=".21" height=".18" depth=".02" color="#080808"></a-box>
    <a-box position="-.20 .55 .495" width=".21" height=".18" depth=".02" color="#080808"></a-box>
    <a-box position=".20 .55 .495" width=".21" height=".18" depth=".02" color="#080808"></a-box>
    <a-box position=".62 .55 .495" width=".21" height=".18" depth=".02" color="#080808"></a-box>

    <a-box position="0 .25 0" width="1.46" height=".48" depth=".84" color="#65116d"></a-box>
    <a-box position="0 .25 .44" width=".31" height=".30" depth=".04" color="#141414"></a-box>
    <a-box position="0 .29 .47" width=".055" height=".14" depth=".02" color="#ff3434" emissive="#ff3434" emissiveIntensity=".45"></a-box>

    <a-box class="xr-interactable" data-interact="cabinet" data-id="${game.id}" position="0 1.3 .63"
      width="1.82" height="2.55" depth=".36" material="opacity:0;transparent:true"></a-box>
  </a-entity>`;
}

function makeCabinet(game,x,z){
  if(game.id==='outdrive')return makeOutDriveCabinet(game,x,z);
  if(game.id==='cyrenerangers')return makeCyreneCabinet(game,x,z);
  return '';
}

function chairMarkup(x,z,rot,color='#303843'){
  const facing=(Number(rot)||0)+180;
  return `
    <a-entity class="chair-seat" data-seat="true" data-occupied="false" position="${x} 0 ${z}" rotation="0 ${facing} 0">
      <a-entity class="seat-anchor" position="0 .51 0"></a-entity>
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
    <a-entity class="table-root collision-box" data-collision-halfx="1.28" data-collision-halfz="1.28" data-interact="table" data-id="${item.id}" position="${item.x} 0 ${item.z}">
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
  <a-entity class="table-root collision-box" data-collision-halfx="1.28" data-collision-halfz="1.28" data-interact="table" data-id="${item.id}" position="${item.x} 0 ${item.z}">
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
  <a-entity class="door-root collision-box" data-collision-halfx=".86" data-collision-halfz=".25" data-interact="${id}" data-id="${id}" position="${x} 0 ${z}" rotation="0 ${rot} 0">
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
  buildPoolTable();

  const doors=[
    makeDoor('girls','GIRLS',-12.2,-6.85,0,'#42243c','Washroom'),
    makeDoor('boys','BOYS',-9.9,-6.85,0,'#203448','Washroom'),
    makeDoor('dungeon','BASEMENT',0,-6.85,0,'#21100e','Enter the dungeon'),
    makeDoor('exit','EXIT',12.0,-6.85,0,'#263428','Return to 2D Arcade')
  ];
  document.getElementById('doorHost').innerHTML=doors.join('');
}


const POOL={
  centerX:8.7,
  centerZ:3.25,
  innerHalfX:1.62,
  innerHalfZ:.80,
  ballRadius:.055,
  feltY:.905,
  gravity:9.81,
  verticalRestitution:.42,
  jumpThreshold:.58,
  pocketRadius:.155,
  stopSpeed:.010,
  rollingDecel:.34,
  ballRestitution:.965,
  cushionRestitution:.91,
  fixedStep:1/240,
  maxFrameTime:.05,
  sidePocketHalfWidth:.18,
  cornerPocketMouthX:1.44,
  cornerPocketMouthZ:.64,
  pockets:[
    [-1.66,-.84],[0,-.88],[1.66,-.84],
    [-1.66,.84],[0,.88],[1.66,.84]
  ]
};

function poolBallColor(n){
  const colors={
    1:'#f5d442',2:'#315ee8',3:'#df3f3f',4:'#7141ad',5:'#ef8b2c',6:'#2a9c62',7:'#8a2727',
    8:'#111111',9:'#f5d442',10:'#315ee8',11:'#df3f3f',12:'#7141ad',13:'#ef8b2c',14:'#2a9c62',15:'#8a2727'
  };
  return colors[n]||'#fff';
}

function buildPoolTable(){
  const host=document.getElementById('poolHost');
  if(!host)return;
  host.innerHTML=`
  <a-entity id="poolTable" class="collision-box" data-collision-halfx="2.02" data-collision-halfz="1.10"
    data-interact="pool" data-id="pool" position="${POOL.centerX} 0 ${POOL.centerZ}">
    <!-- legs / body -->
    <a-box position="0 .58 0" width="3.86" height=".42" depth="2.18" color="#3b2819"></a-box>
    <a-box position="0 .86 0" width="3.62" height=".09" depth="1.94" color="#145b31"></a-box>
    <a-cylinder position="-1.55 .30 -.76" radius=".10" height=".60" color="#302014"></a-cylinder>
    <a-cylinder position="1.55 .30 -.76" radius=".10" height=".60" color="#302014"></a-cylinder>
    <a-cylinder position="-1.55 .30 .76" radius=".10" height=".60" color="#302014"></a-cylinder>
    <a-cylinder position="1.55 .30 .76" radius=".10" height=".60" color="#302014"></a-cylinder>

    <!-- raised cushions / rails -->
    <a-box position="0 .935 -.96" width="3.92" height=".14" depth=".18" color="#4b301c"></a-box>
    <a-box position="0 .935 .96" width="3.92" height=".14" depth=".18" color="#4b301c"></a-box>
    <a-box position="-1.91 .935 0" width=".18" height=".14" depth="1.75" color="#4b301c"></a-box>
    <a-box position="1.91 .935 0" width=".18" height=".14" depth="1.75" color="#4b301c"></a-box>

    <!-- pockets: corners + sides -->
    ${POOL.pockets.map(([x,z])=>`<a-cylinder position="${x} .908 ${z}" rotation="0 0 0" radius=".125" height=".018" color="#020303"></a-cylinder>`).join('')}

    <!-- wooden triangle rack stored beneath the foot rail -->
    <a-entity position="0 .60 .99">
      <a-box position="0 .14 0" width=".78" height=".035" depth=".035" color="#b77b3b"></a-box>
      <a-box position="-.34 -.08 0" width=".72" height=".035" depth=".035" rotation="0 0 60" color="#b77b3b"></a-box>
      <a-box position=".34 -.08 0" width=".72" height=".035" depth=".035" rotation="0 0 -60" color="#b77b3b"></a-box>
    </a-entity>

    <!-- Used only while manually arranging a rack. -->
    <a-entity id="poolTriangleRack" visible="false" position=".80 ${POOL.feltY+.045} 0" rotation="0 0 -90">
      <a-box position="0 .23 0" width=".82" height=".026" depth=".028" color="#c18a4a"></a-box>
      <a-box position="-.36 -.08 0" width=".76" height=".026" depth=".028" rotation="0 0 60" color="#c18a4a"></a-box>
      <a-box position=".36 -.08 0" width=".76" height=".026" depth=".028" rotation="0 0 -60" color="#c18a4a"></a-box>
    </a-entity>

    <a-entity id="poolBalls"></a-entity>
    <a-entity id="poolAimGuide"></a-entity>

    <!-- Ball-in-hand preview shown after a scratch. -->
    <a-entity id="poolBallInHandPreview" visible="false">
      <a-sphere id="poolBallInHandGhost"
        position="0 ${POOL.feltY+POOL.ballRadius} 0"
        radius="${POOL.ballRadius}"
        color="#ffffff"
        material="shader:flat;transparent:true;opacity:.74;depthTest:false">
      </a-sphere>
      <a-ring id="poolBallInHandRing"
        position="0 ${POOL.feltY+.010} 0"
        rotation="-90 0 0"
        radius-inner=".072"
        radius-outer=".095"
        color="#ff3038"
        material="shader:flat;transparent:true;opacity:.90;depthTest:false"
        animation__pulse="property:scale;from:.82 .82 .82;to:1.18 1.18 1.18;dir:alternate;loop:true;dur:520;easing:easeInOutSine"
        animation__fade="property:material.opacity;from:.92;to:.38;dir:alternate;loop:true;dur:520;easing:easeInOutSine">
      </a-ring>
    </a-entity>

    <a-box class="xr-interactable" data-interact="pool" data-id="pool"
      position="0 1.20 0" width="4.55" height=".90" depth="2.75" material="opacity:0;transparent:true"></a-box>
  </a-entity>

`;
  resetPoolBalls();
}

function poolBallGroup(n){
  if(n>=1&&n<=7)return'solids';
  if(n>=9&&n<=15)return'stripes';
  return null;
}

function oppositePoolGroup(group){
  return group==='solids'?'stripes':group==='stripes'?'solids':null;
}

function resetPoolRules(){
  const r=state.pool.rules;
  r.currentPlayer=1;
  r.groups={1:null,2:null};
  r.tableOpen=true;
  r.breakShot=true;
  r.calledGroup=null;
  r.shotPocketed=[];
  r.foul=false;
  r.foulReason='';
  r.ballInHand=false;
  r.rackOver=false;
  r.freePlay=false;
  r.winner=null;
  r.eightOffOnBreak=false;
  state.pool.turn=1;
  updatePoolRulesHud();
}

function callPoolGroup(group){
  const r=state.pool.rules;
  if(!state.pool.active||r.rackOver||!r.tableOpen||r.breakShot)return;
  r.calledGroup=group;
  updatePoolRulesHud();
  toast(`Called ${group}. Pocket one legally to claim the group.`,1200);
}

function setPoolFoul(reason){
  const r=state.pool.rules;
  r.foul=true;
  r.foulReason=reason||'Foul';
}

function poolGroupRemaining(group){
  return state.pool.balls.some(b=>!b.pocketed&&poolBallGroup(b.n)===group);
}

function updatePoolRulesHud(){
  const r=state.pool.rules;
  const turn=document.getElementById('poolTurnLabel');
  const open=document.getElementById('poolOpenLabel');
  const you=document.getElementById('poolYourGroup');
  const opp=document.getElementById('poolOppGroup');
  const notice=document.getElementById('poolRuleNotice');
  const callRow=document.getElementById('poolCallRow');
  const solids=document.getElementById('poolCallSolids');
  const stripes=document.getElementById('poolCallStripes');

  if(turn)turn.textContent=r.rackOver
    ?(r.winner===1?'YOU WIN':'OPPONENT WINS')
    :(r.currentPlayer===1?'YOUR TURN':'OPPONENT TURN');

  if(open)open.textContent=r.rackOver?'RACK OVER':(r.tableOpen?'OPEN TABLE':'GROUPS SET');
  if(you)you.textContent=(r.groups[1]||'open').toUpperCase();
  if(opp)opp.textContent=(r.groups[2]||'open').toUpperCase();

  const canCall=state.pool.active&&r.tableOpen&&!r.breakShot&&!r.rackOver;
  callRow?.classList.toggle('hidden',!canCall);
  if(solids){
    solids.disabled=!canCall;
    solids.classList.toggle('active',r.calledGroup==='solids');
  }
  if(stripes){
    stripes.disabled=!canCall;
    stripes.classList.toggle('active',r.calledGroup==='stripes');
  }

  if(notice){
    if(r.rackOver){
      notice.textContent=(r.winner===1?'Rack won':'Rack lost')+' · FREE PLAY until you re-rack';
    }else if(r.ballInHand){
      notice.textContent='BALL IN HAND · click the felt to place the cue ball';
    }else if(r.foul){
      notice.textContent=`FOUL · ${r.foulReason}`;
    }else if(r.breakShot){
      notice.textContent='BREAK SHOT · groups stay open after the break';
    }else if(r.tableOpen){
      notice.textContent=r.calledGroup
        ?`Called ${r.calledGroup.toUpperCase()}`
        :'OPEN TABLE · call SOLIDS or STRIPES before shooting';
    }else{
      const g=r.groups[r.currentPlayer];
      notice.textContent=`${g?.toUpperCase()||'OPEN'} · ${poolGroupRemaining(g)?'clear your group':'on the 8-ball'}`;
    }
  }
}

function poolAutoRack(){
  exitManualRackMode(false);
  resetPoolBalls();
  resetPoolRules();
  toast('8-ball auto-racked.',900);
}

function poolRerack(){ poolAutoRack(); }

const MANUAL_RACK_POSITIONS=(()=>{
  const out=[];
  const startX=.58;
  const spacing=POOL.ballRadius*2.12;
  for(let row=0;row<5;row++){
    const x=startX+row*(spacing*.90);
    const z0=-(row*spacing)/2;
    for(let j=0;j<=row;j++)out.push({x,z:z0+j*spacing,row,col:j});
  }
  return out;
})();

function rackBallCss(n){
  return poolBallColor(n);
}

function renderManualRackPanel(){
  const stateRack=state.pool.manualRack;
  const tray=document.getElementById('poolRackBallTray');
  const slots=document.getElementById('poolRackSlots');
  if(!tray||!slots)return;

  const used=new Set(stateRack.slots.filter(Boolean));
  tray.innerHTML=Array.from({length:15},(_,i)=>i+1).map(n=>{
    const selected=stateRack.selectedBall===n?' selected':'';
    const isUsed=used.has(n)?' used':'';
    return `<button type="button" class="pool-rack-ball${selected}${isUsed}" data-rack-ball="${n}"
      style="background:${rackBallCss(n)}">${n}</button>`;
  }).join('');

  const grid=[];
  let index=0;
  for(let row=0;row<5;row++){
    const left=5-row;
    for(let pad=0;pad<left;pad++)grid.push('<span></span>');
    for(let col=0;col<=row;col++){
      const n=stateRack.slots[index];
      grid.push(`<button type="button" class="pool-rack-slot${n?' filled':''}" data-rack-slot="${index}"
        style="${n?`background:${rackBallCss(n)}`:''}">${n||'·'}</button>`);
      index++;
      if(col<row)grid.push('<span></span>');
    }
    for(let pad=0;pad<left;pad++)grid.push('<span></span>');
  }
  slots.innerHTML=grid.join('');

  tray.querySelectorAll('[data-rack-ball]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const n=Number(btn.dataset.rackBall);
      if(used.has(n)){
        const old=stateRack.slots.indexOf(n);
        if(old>=0)stateRack.slots[old]=null;
      }
      stateRack.selectedBall=n;
      renderManualRackPanel();
    });
  });

  slots.querySelectorAll('[data-rack-slot]').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const slot=Number(btn.dataset.rackSlot);
      const selected=stateRack.selectedBall;
      if(selected){
        const old=stateRack.slots.indexOf(selected);
        if(old>=0)stateRack.slots[old]=null;
        stateRack.slots[slot]=selected;
        stateRack.selectedBall=null;
      }else if(stateRack.slots[slot]){
        stateRack.selectedBall=stateRack.slots[slot];
        stateRack.slots[slot]=null;
      }
      renderManualRackPanel();
      renderManualRackPreview();
    });
  });
}

function renderManualRackPreview(){
  if(!state.pool.manualRack.active)return;
  const byNumber=new Map(state.pool.balls.map(b=>[b.n,b]));
  for(let i=0;i<15;i++){
    const n=state.pool.manualRack.slots[i];
    if(!n)continue;
    const ball=byNumber.get(n);
    const pos=MANUAL_RACK_POSITIONS[i];
    if(ball&&pos){
      ball.pocketed=false;
      ball.x=pos.x;ball.z=pos.z;ball.y=POOL.feltY+POOL.ballRadius;
      ball.vx=ball.vy=ball.vz=0;
    }
  }
  renderPoolBalls(false);
}

function setTriangleRackVisible(visible){
  const rack=document.getElementById('poolTriangleRack');
  rack?.setAttribute('visible',visible);
}

function enterManualRackMode(){
  if(state.pool.shotInProgress){
    toast('Wait for the balls to stop first.',900);
    return;
  }
  const r=state.pool.manualRack;
  r.active=true;
  r.selectedBall=null;
  r.slots=Array(15).fill(null);

  // Pull all numbered balls into a staging state; cue ball remains playable.
  for(const ball of state.pool.balls){
    if(ball.n===0)continue;
    ball.pocketed=true;
    ball.vx=ball.vy=ball.vz=0;
  }

  document.getElementById('poolManualRackPanel')?.classList.remove('hidden');
  setTriangleRackVisible(true);
  renderManualRackPanel();
  renderPoolBalls(false);
  toast('Manual rack: select a ball, then a triangle slot.',1400);
}

function exitManualRackMode(cancel=true){
  const r=state.pool.manualRack;
  if(!r.active)return;
  r.active=false;
  r.selectedBall=null;
  document.getElementById('poolManualRackPanel')?.classList.add('hidden');
  setTriangleRackVisible(false);
  if(cancel)poolAutoRack();
}

function finishManualRack(){
  const r=state.pool.manualRack;
  if(r.slots.some(v=>!v)){
    toast('Fill all 15 rack positions first.',1000);
    return;
  }

  const byNumber=new Map(state.pool.balls.map(b=>[b.n,b]));
  for(let i=0;i<15;i++){
    const n=r.slots[i];
    const ball=byNumber.get(n);
    const pos=MANUAL_RACK_POSITIONS[i];
    if(!ball||!pos)continue;
    ball.pocketed=false;
    ball.returned=false;
    ball.x=pos.x;ball.z=pos.z;ball.y=POOL.feltY+POOL.ballRadius;
    ball.vx=ball.vy=ball.vz=0;
    ball.sideSpin=ball.spinX=ball.spinZ=0;
  }

  const cue=byNumber.get(0);
  if(cue){
    cue.pocketed=false;cue.x=-1.05;cue.z=0;cue.y=POOL.feltY+POOL.ballRadius;
    cue.vx=cue.vy=cue.vz=0;
  }

  r.active=false;
  r.selectedBall=null;
  document.getElementById('poolManualRackPanel')?.classList.add('hidden');
  setTriangleRackVisible(false);
  resetPoolRules();
  renderPoolBalls(false);
  toast('Manual rack ready.',900);
}

function completePoolShot(){
  const r=state.pool.rules;
  if(r.rackOver){
    r.freePlay=true;
    updatePoolRulesHud();
    return;
  }

  const shooter=r.currentPlayer;
  const other=shooter===1?2:1;
  const pocketed=[...r.shotPocketed];
  const objectBalls=pocketed.filter(n=>n!==0);
  const eightPocketed=objectBalls.includes(8);
  const normalBalls=objectBalls.filter(n=>n!==8);
  const shooterGroup=r.groups[shooter];

  if(eightPocketed){
    if(r.breakShot){
      // WPA: 8 on break is spotted/re-break option. For this arcade table we
      // spot it automatically to keep play flowing.
      const eight=state.pool.balls.find(b=>b.n===8);
      if(eight){
        eight.pocketed=false;
        eight.x=.72;eight.z=0;
        eight.y=POOL.feltY+POOL.ballRadius;
        eight.vx=eight.vy=eight.vz=0;
      }
      toast('8-ball on break: spotted.',1200);
    }else{
      const cleared=shooterGroup&&!poolGroupRemaining(shooterGroup);
      if(r.foul||!cleared){
        r.rackOver=true;
        r.freePlay=true;
        r.winner=other;
      }else{
        r.rackOver=true;
        r.freePlay=true;
        r.winner=shooter;
      }
    }
  }

  // Open table remains open after break, even if balls dropped.
  if(!r.rackOver&&!r.breakShot&&r.tableOpen){
    if(r.calledGroup){
      const madeCalled=normalBalls.some(n=>poolBallGroup(n)===r.calledGroup);
      if(madeCalled&&!r.foul){
        r.groups[shooter]=r.calledGroup;
        r.groups[other]=oppositePoolGroup(r.calledGroup);
        r.tableOpen=false;
        toast(`${shooter===1?'You are':'Opponent is'} ${r.calledGroup}.`,1200);
      }
    }
  }

  let continues=false;
  if(!r.rackOver&&!r.foul){
    if(r.breakShot){
      continues=normalBalls.length>0;
    }else if(r.tableOpen){
      continues=Boolean(r.calledGroup&&normalBalls.some(n=>poolBallGroup(n)===r.calledGroup));
    }else{
      continues=normalBalls.some(n=>poolBallGroup(n)===r.groups[shooter]);
    }
  }

  if(!r.rackOver){
    if(r.foul){
      r.currentPlayer=other;
      r.ballInHand=true;
      r.cueNeedsRespawn=true;
    }else if(!continues){
      r.currentPlayer=other;
    }
  }

  r.breakShot=false;
  r.calledGroup=null;
  r.shotPocketed=[];
  r.foul=false;
  r.foulReason='';
  state.pool.turn=r.currentPlayer;
  updatePoolRulesHud();
}

function drivePoolBallOffTable(ball){
  if(ball.pocketed)return;
  const r=state.pool.rules;

  if(ball.n===0){
    pocketPoolBall(ball);
    setPoolFoul('Cue ball off the table');
    return;
  }

  if(ball.n===8){
    if(r.breakShot){
      ball.pocketed=true;
  ball.returned=false;
      ball.vx=ball.vy=ball.vz=0;
      r.eightOffOnBreak=true;
      setPoolFoul('8-ball driven off on break');
    }else{
      ball.pocketed=true;
      ball.vx=ball.vy=ball.vz=0;
      r.rackOver=true;
      r.freePlay=true;
      r.winner=r.currentPlayer===1?2:1;
      toast('8-ball off the table — rack lost.',1600);
    }
    return;
  }

  // Standard object balls stay off the table and are treated as out of play.
  ball.pocketed=true;
  ball.vx=ball.vy=ball.vz=0;
  r.shotPocketed.push(ball.n);
  setPoolFoul(`Ball ${ball.n} driven off the table`);
  toast(`Ball ${ball.n} off table — foul.`,1200);
}

function getCueBallPlacementCandidate(){
  const ray=poolViewRay();
  if(!ray||Math.abs(ray.dir.y)<1e-5)return null;

  const targetY=POOL.feltY+POOL.ballRadius;
  const t=(targetY-ray.origin.y)/ray.dir.y;
  if(t<=0)return null;

  const hit=ray.origin.clone().addScaledVector(ray.dir,t);
  const x=hit.x-POOL.centerX;
  const z=hit.z-POOL.centerZ;
  const margin=POOL.ballRadius+.04;

  const inside=
    Math.abs(x)<=POOL.innerHalfX-margin &&
    Math.abs(z)<=POOL.innerHalfZ-margin;

  const blocked=inside&&state.pool.balls.some(
    b=>b.n!==0&&!b.pocketed&&Math.hypot(b.x-x,b.z-z)<POOL.ballRadius*2.15
  );

  return {x,z,y:targetY,inside,blocked,valid:inside&&!blocked};
}

function updateCueBallPlacementPreview(){
  const preview=document.getElementById('poolBallInHandPreview');
  const ghost=document.getElementById('poolBallInHandGhost');
  const ring=document.getElementById('poolBallInHandRing');

  if(!preview||!state.pool.active||!state.pool.rules?.ballInHand||state.pool.shotInProgress){
    preview?.setAttribute('visible',false);
    state.pool.placementPreview.visible=false;
    return;
  }

  const candidate=getCueBallPlacementCandidate();
  if(!candidate){
    preview.setAttribute('visible',false);
    state.pool.placementPreview.visible=false;
    return;
  }

  preview.setAttribute('visible',true);
  preview.object3D.position.set(candidate.x,0,candidate.z);

  state.pool.placementPreview={
    x:candidate.x,z:candidate.z,valid:candidate.valid,visible:true
  };

  ring?.setAttribute('color',candidate.valid?'#ff3038':'#ff9d2e');
  ghost?.setAttribute('color',candidate.valid?'#ffffff':'#ffb18c');
}

function hideCueBallPlacementPreview(){
  document.getElementById('poolBallInHandPreview')?.setAttribute('visible',false);
  state.pool.placementPreview.visible=false;
}

function placeCueBallFromView(){
  const r=state.pool.rules;
  if(!state.pool.active||!r.ballInHand||state.pool.shotInProgress)return false;

  const candidate=getCueBallPlacementCandidate();
  if(!candidate){
    toast('Aim at the pool felt.',800);
    return false;
  }
  if(!candidate.inside){
    toast('Place the cue ball on the felt.',900);
    return false;
  }
  if(candidate.blocked){
    toast('That spot is occupied.',800);
    return false;
  }

  const cue=state.pool.balls.find(b=>b.n===0);
  if(!cue)return false;

  cue.pocketed=false;
  cue.returned=false;
  cue.x=candidate.x;cue.z=candidate.z;cue.y=candidate.y;
  cue.vx=cue.vy=cue.vz=0;
  cue.sideSpin=cue.spinX=cue.spinZ=0;

  r.ballInHand=false;
  state.pool.cueNeedsRespawn=false;
  hideCueBallPlacementPreview();

  renderPoolBalls(false);
  updatePoolRulesHud();
  updateHeldPoolTool();
  updatePoolAimGuide();
  toast('Cue ball placed.',700);
  return true;
}


function resetPoolBalls(){
  const balls=[];
  balls.push({n:0,x:-1.05,y:POOL.feltY+POOL.ballRadius,z:0,vx:0,vy:0,vz:0,pocketed:false,returned:false,sideSpin:0,spinX:0,spinZ:0});

  // WPA-style 8-ball triangle: apex at foot spot, 8 in center,
  // opposite groups on the two rear corners.
  const rack=[
    [1],
    [10,2],
    [3,8,11],
    [12,4,13,5],
    [6,14,7,15,9]
  ];
  const startX=.58;
  const spacing=POOL.ballRadius*2.12;

  for(let row=0;row<rack.length;row++){
    const x=startX+row*(spacing*.90);
    const z0=-(row*spacing)/2;
    rack[row].forEach((n,j)=>{
      balls.push({n,x,y:POOL.feltY+POOL.ballRadius,z:z0+j*spacing,vx:0,vy:0,vz:0,pocketed:false,returned:false,sideSpin:0,spinX:0,spinZ:0});
    });
  }

  state.pool.balls=balls;
  state.pool.shotInProgress=false;
  state.pool.cueNeedsRespawn=false;
  state.pool.cuePull=0;
  state.pool.maxCuePull=0;
  state.pool.forwardPeak=0;
  state.pool.physicsAccumulator=0;
  renderPoolBalls(true);
}
function poolPocketedBalls(){
  return state.pool.balls.filter(ball=>ball.n!==0&&ball.returned);
}

function updatePoolPocketedHud(){
  const host=document.getElementById('poolPocketedBalls');
  const empty=document.getElementById('poolPocketedEmpty');
  if(!host)return;

  const balls=poolPocketedBalls();
  if(empty)empty.classList.toggle('hidden',balls.length>0);

  host.innerHTML=balls.map(ball=>{
    const stripe=ball.n>=9;
    return `<span class="pool-pocket-chip${stripe?' stripe':''}"
      title="Ball ${ball.n}"
      style="--ball:${poolBallColor(ball.n)}">${ball.n}</span>`;
  }).join('');
}

function renderPoolBalls(rebuild=false){
  const host=document.getElementById('poolBalls');
  if(!host)return;
  if(rebuild){
    host.innerHTML=state.pool.balls.map(ball=>{
      const stripe=ball.n>=9;
      const color=ball.n===0?'#f7f7ef':poolBallColor(ball.n);
      return `<a-entity id="pool-ball-${ball.n}" position="${ball.x} ${ball.y} ${ball.z}">
        <a-sphere radius="${POOL.ballRadius}" color="${color}" roughness=".25" metalness=".05"></a-sphere>
        ${stripe?`<a-torus radius="${POOL.ballRadius*.73}" radius-tubular="${POOL.ballRadius*.17}" rotation="90 0 0" color="#f2f2e9"></a-torus>`:''}
        ${ball.n?`<a-text value="${ball.n}" position="0 ${POOL.ballRadius+.006} 0" rotation="-90 0 0" align="center" color="${ball.n===8?'#fff':'#111'}" width=".18"></a-text>`:''}
      </a-entity>`;
    }).join('');
  }else{
    for(const ball of state.pool.balls){
      const el=document.getElementById(`pool-ball-${ball.n}`);
      if(!el)continue;
      el.setAttribute('visible',!ball.pocketed);
      if(!ball.pocketed)el.object3D.position.set(ball.x,ball.y,ball.z);
    }
  }
  updatePoolPocketedHud();
  updatePoolAimGuide();
}

function poolViewRay(){
  const cam=camera();
  if(!cam)return null;
  const origin=new THREE.Vector3();
  const quat=new THREE.Quaternion();
  cam.object3D.getWorldPosition(origin);
  cam.object3D.getWorldQuaternion(quat);
  const dir=new THREE.Vector3(0,0,-1).applyQuaternion(quat).normalize();
  return {origin,dir};
}

function poolAimRay(){
  const held=state.pool.tool==='bridge'
    ?document.getElementById('heldPoolBridge')
    :document.getElementById('heldPoolCue');
  const tip=state.pool.tool==='bridge'
    ?document.getElementById('heldPoolBridgeTip')
    :document.getElementById('heldPoolCueTip');

  if(!held||!tip)return null;

  const origin=new THREE.Vector3();
  const center=new THREE.Vector3();
  tip.object3D.getWorldPosition(origin);
  held.object3D.getWorldPosition(center);

  // The visible cue itself defines the physics line. Local -Y is the forward tip.
  const dir=origin.clone().sub(center).normalize();

  if(state.pool.fineYaw){
    dir.applyAxisAngle(new THREE.Vector3(0,1,0),state.pool.fineYaw).normalize();
  }

  return {origin,dir};
}
function poolCueBallCenter(){
  const cue=state.pool.balls.find(b=>b.n===0&&!b.pocketed);
  if(!cue)return null;
  return {
    cue,
    center:new THREE.Vector3(POOL.centerX+cue.x,cue.y,POOL.centerZ+cue.z)
  };
}

function poolLaunchDirection(aim){
  const side=THREE.MathUtils.clamp(aim?.side||0,-1,1);
  const reached=poolAimWithReach(aim);
  const base=reached?.shotDir||new THREE.Vector3(1,0,0);
  const right=reached?.right||new THREE.Vector3(0,0,1);

  // Contact geometry: the farther the tip is from center, the more of the
  // impulse resolves laterally. Keep a practical cap to avoid edge-miscue
  // singularities while still making extreme side hits visibly matter.
  const edge=Math.min(.965,Math.abs(side));
  const contactAngle=Math.asin(edge);
  const maxDeflect=THREE.MathUtils.degToRad(32);

  // Nonlinear rise: gentle around center, strong near the rim.
  const normalized=contactAngle/(Math.PI/2);
  const deflect=maxDeflect*Math.pow(normalized,1.35);
  const signed=side*deflect;

  const c=Math.cos(signed);
  const s=Math.sin(signed);

  return new THREE.Vector3(
    base.x*c-right.x*s,
    0,
    base.z*c-right.z*s
  ).normalize();
}

function calculatePoolAim(){
  const ray=poolViewRay();
  const data=poolCueBallCenter();
  if(!ray||!data)return null;

  const {origin,dir}=ray;
  const {cue,center}=data;
  const radius=POOL.ballRadius;

  // Aim is based on where the player's view passes the cue ball, not whether
  // the rendered cue physically reaches it. Reach is assumed once pool mode is active.
  const toCenter=center.clone().sub(origin);
  const t=toCenter.dot(dir);
  const closest=origin.clone().addScaledVector(dir,t);

  const shotDir=new THREE.Vector3(dir.x,0,dir.z);
  if(shotDir.lengthSq()<1e-6)shotDir.set(1,0,0);
  shotDir.normalize();

  const right=new THREE.Vector3(-shotDir.z,0,shotDir.x);
  const up=new THREE.Vector3(0,1,0);

  const delta=closest.clone().sub(center);
  const sideRaw=delta.dot(right);
  const topRaw=delta.dot(up);
  const radial=Math.hypot(sideRaw,topRaw);

  // Small halo outside the ball lets the player intentionally miss/foul.
  const missRadius=radius*1.28;
  const hit=radial<=radius;
  const nearMiss=!hit&&radial<=missRadius;

  const scale=radial>radius&&radial>0?radius/radial:1;
  const sideContact=sideRaw*scale;
  const topContact=topRaw*scale;
  const frontDepth=Math.sqrt(Math.max(0,radius*radius-sideContact*sideContact-topContact*topContact));

  const contact=center.clone()
    .addScaledVector(right,sideContact)
    .addScaledVector(up,topContact)
    .addScaledVector(shotDir,-frontDepth);

  return {
    cue,origin,dir,shotDir,right,
    hit,nearMiss,contact,
    side:THREE.MathUtils.clamp(sideRaw/radius,-1,1),
    top:THREE.MathUtils.clamp(topRaw/radius,-1,1),
    radial,missRadius
  };
}
function poolCueReachAngle(){
  const reach=THREE.MathUtils.clamp(state.pool.cueReach||0,-1,1);
  // About +/- 13 degrees is enough to feel like extending the handle hand
  // without allowing impossible sideways strokes.
  return reach*THREE.MathUtils.degToRad(13);
}

function poolCueAxisWithReach(aim){
  const base=aim?.shotDir?.clone?.()||new THREE.Vector3(1,0,0);
  base.y=0;
  if(base.lengthSq()<1e-6)base.set(1,0,0);
  base.normalize();

  const a=poolCueReachAngle();
  const c=Math.cos(a),s=Math.sin(a);

  return new THREE.Vector3(
    base.x*c-base.z*s,
    0,
    base.x*s+base.z*c
  ).normalize();
}

function poolAimWithReach(aim){
  if(!aim)return aim;

  const shotDir=poolCueAxisWithReach(aim);
  const right=new THREE.Vector3(-shotDir.z,0,shotDir.x);

  return {
    ...aim,
    shotDir,
    right
  };
}

function poolCueBackPointWithRailClearance(aim,contact,length){
  const dir=aim.shotDir.clone().normalize();
  const crouch=THREE.MathUtils.clamp(state.player.crouchAmount||0,0,1);

  // Player-controlled handle elevation is additive to natural stance.
  // Shift+wheel remains crouch; plain wheel controls this value.
  const manualLift=THREE.MathUtils.clamp(state.pool.cueElevation||0,-.04,.48);
  const baseHandleLift=THREE.MathUtils.lerp(.115,.030,crouch)+manualLift;

  const back=contact.clone().addScaledVector(dir,-length);
  back.y+=baseHandleLift;

  const cx=contact.x-POOL.centerX;
  const cz=contact.z-POOL.centerZ;
  const bx=back.x-POOL.centerX;
  const bz=back.z-POOL.centerZ;

  const dx=bx-cx;
  const dz=bz-cz;

  // Physical cue radius + a tiny visual safety margin.
  const cueRadius=.018;
  const railTop=1.005;
  const railSafeY=railTop+cueRadius+.008;

  // Table footprint. The felt is the open region; everything between the
  // felt boundary and outer footprint is solid cushion/rail/body.
  const innerX=POOL.innerHalfX-.015;
  const innerZ=POOL.innerHalfZ-.015;
  const outerX=2.02;
  const outerZ=1.10;

  let requiredBackY=back.y;

  // Sample the shaft rather than checking one rail crossing. This prevents
  // diagonal/near-corner cases from slipping through the table geometry.
  const samples=36;
  for(let i=1;i<=samples;i++){
    const t=i/samples;
    const x=cx+dx*t;
    const z=cz+dz*t;

    const insideOuter=Math.abs(x)<=outerX&&Math.abs(z)<=outerZ;
    const insideFelt=Math.abs(x)<innerX&&Math.abs(z)<innerZ;
    const intersectsTable=insideOuter&&!insideFelt;
    if(!intersectsTable)continue;

    const currentY=contact.y+(back.y-contact.y)*t;
    if(currentY>=railSafeY)continue;

    // Solve y(t) >= railSafeY for back.y.
    const needed=contact.y+(railSafeY-contact.y)/Math.max(.035,t);
    requiredBackY=Math.max(requiredBackY,needed);
  }

  // Keep physically valid clearance. The cap is intentionally generous now:
  // if a real rail is in the way, collision wins over a prettier pose.
  const absoluteMax=contact.y+.76;
  back.y=Math.min(Math.max(back.y,requiredBackY),absoluteMax);
  back.y=Math.max(back.y,POOL.feltY+.018);

  return back;
}

function isPlayerNearPoolTable(){
  const cam=camera();
  if(!cam)return false;

  const p=new THREE.Vector3();
  cam.object3D.getWorldPosition(p);

  // Measure distance from the outside footprint of the table rather than
  // from its center, so all four sides behave consistently.
  const outerHalfX=2.05;
  const outerHalfZ=1.14;
  const dx=Math.max(Math.abs(p.x-POOL.centerX)-outerHalfX,0);
  const dz=Math.max(Math.abs(p.z-POOL.centerZ)-outerHalfZ,0);

  return Math.hypot(dx,dz)<=.82;
}

function setCueCarryPose(held){
  const crouch=THREE.MathUtils.clamp(state.player.crouchAmount||0,0,1);

  // Carry the cue low at the player's right side. Most of the shaft/handle
  // sits below the viewport; only the front quarter and tip rise into view.
  held.object3D.position.set(
    .53,
    THREE.MathUtils.lerp(-1.02,-1.08,crouch),
    -.72
  );
  held.object3D.rotation.set(
    THREE.MathUtils.degToRad(11),
    THREE.MathUtils.degToRad(-7),
    THREE.MathUtils.degToRad(-10)
  );
}

function updateHeldPoolCue(){
  updatePoolReachHud();
  const held=document.getElementById('heldPoolCue');
  if(!held)return;

  const ballInHand=Boolean(state.pool.rules?.ballInHand);
  const active=
    state.pool.active &&
    !state.pool.shotInProgress &&
    !state.pool.manualRack.active &&
    !ballInHand &&
    state.pool.tool==='cue';

  held.setAttribute('visible',active);
  if(!active)return;

  // Near the table, keep the cue presented on the cue ball even when not
  // actively stroking. Only switch to carry pose after stepping away.
  if(!state.pool.gripping&&!isPlayerNearPoolTable()){
    setCueCarryPose(held);
    return;
  }

  const aim=calculatePoolAim();
  const cam=camera();
  if(!aim||!cam)return;

  const contact=aim.contact.clone();
  const reachedAim=poolAimWithReach(aim);
  const cueLength=1.22+state.pool.cuePull*.78;
  const back=poolCueBackPointWithRailClearance(reachedAim,contact,cueLength);

  const contactLocal=cam.object3D.worldToLocal(contact.clone());
  const backLocal=cam.object3D.worldToLocal(back.clone());
  const mid=contactLocal.clone().add(backLocal).multiplyScalar(.5);
  held.object3D.position.copy(mid);

  const axis=contactLocal.clone().sub(backLocal).normalize();
  held.object3D.quaternion.copy(
    new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0,1,0),axis)
  );
}
function updatePoolReachHud(){
  const el=document.getElementById('poolReachValue');
  if(!el)return;

  const reach=THREE.MathUtils.clamp(state.pool.cueReach||0,-1,1);
  if(Math.abs(reach)<.08){
    el.textContent='CENTER';
  }else{
    const pct=Math.round(Math.abs(reach)*100);
    el.textContent=`${reach>0?'RIGHT':'LEFT'} ${pct}%`;
  }
}

function updatePoolPowerMeter(){
  const fill=document.getElementById('poolPowerFill');
  const value=document.getElementById('poolPowerValue');
  if(!fill||!value)return;

  const pullNorm=THREE.MathUtils.clamp(state.pool.maxCuePull/.58,0,1);
  const strokeNorm=THREE.MathUtils.clamp(state.pool.forwardPeak/1.8,0,1);
  const pct=Math.round(Math.max(pullNorm*.72,strokeNorm)*100);

  fill.style.width=`${pct}%`;
  value.textContent=`${pct}%`;
}

function poolFirstObjectHit(aim,maxDist=3.0){
  const cue=aim?.cue;
  if(!cue)return null;

  const launch=poolLaunchDirection(aim);
  const ox=cue.x,oz=cue.z;
  const dx=launch.x,dz=launch.z;
  const combined=POOL.ballRadius*2;

  let best=null;

  for(const ball of state.pool.balls){
    if(ball.n===0||ball.pocketed)continue;

    const rx=ball.x-ox;
    const rz=ball.z-oz;
    const along=rx*dx+rz*dz;
    if(along<=0||along>maxDist)continue;

    const perpSq=rx*rx+rz*rz-along*along;
    const r2=combined*combined;
    if(perpSq>r2)continue;

    const backoff=Math.sqrt(Math.max(0,r2-perpSq));
    const travel=along-backoff;
    if(travel<0||travel>maxDist)continue;

    if(best&&travel>=best.travel)continue;

    const cueImpactX=ox+dx*travel;
    const cueImpactZ=oz+dz*travel;

    let nx=ball.x-cueImpactX;
    let nz=ball.z-cueImpactZ;
    const nLen=Math.hypot(nx,nz)||1;
    nx/=nLen;nz/=nLen;

    const tx=-nz,tz=nx;

    // Equal-mass elastic collision: incoming velocity decomposes into
    // normal (transferred to object ball) and tangent (retained by cue ball).
    const vn=dx*nx+dz*nz;
    const vt=dx*tx+dz*tz;

    let objectDir={x:nx,z:nz};
    let cueExit={x:tx*Math.sign(vt||1),z:tz*Math.sign(vt||1)};

    // If the hit is almost full, cue tangent motion is tiny.
    const cueExitStrength=Math.abs(vt);
    const objectStrength=Math.max(0,vn);

    best={
      ball,
      travel,
      cueImpactX,
      cueImpactZ,
      normal:{x:nx,z:nz},
      tangent:{x:tx,z:tz},
      objectDir,
      cueExit,
      cueExitStrength,
      objectStrength
    };
  }

  return best;
}

function poolLineMarkup(x1,z1,x2,z2,y,color,opacity=.78){
  const dx=x2-x1,dz=z2-z1;
  const len=Math.hypot(dx,dz);
  if(len<.01)return'';
  const mx=(x1+x2)/2,mz=(z1+z2)/2;
  const yaw=-THREE.MathUtils.radToDeg(Math.atan2(dz,dx));

  // Box width follows local X; yaw rotates it in the X/Z plane.
  return `<a-box position="${mx} ${y} ${mz}"
    width="${len}" height=".010" depth=".016"
    rotation="0 ${yaw} 0"
    color="${color}"
    material="shader:flat;opacity:${opacity};transparent:true;depthTest:false"></a-box>`;
}

function trajectoryMarkup(aim){
  if(!state.pool.trajectory||!aim?.hit)return'';

  const y=POOL.feltY+POOL.ballRadius+.022;
  const cueStartX=aim.cue.x;
  const cueStartZ=aim.cue.z;
  const hit=poolFirstObjectHit(aim,3.0);

  let cueEndX,cueEndZ;
  let out='';

  if(hit){
    cueEndX=hit.ball.x;
    cueEndZ=hit.ball.z;
  }else{
    cueEndX=cueStartX+aim.shotDir.x*1.6;
    cueEndZ=cueStartZ+aim.shotDir.z*1.6;
  }

  out+=poolLineMarkup(
    cueStartX,cueStartZ,
    cueEndX,cueEndZ,
    y,'#ff3f46',.88
  );

  if(hit){
    // Predict the object-ball path from collision normal.
    let nx=hit.ball.x-hit.closest.x;
    let nz=hit.ball.z-hit.closest.y;
    const mag=Math.hypot(nx,nz);
    if(mag<1e-6){
      nx=aim.shotDir.x;
      nz=aim.shotDir.z;
    }else{
      nx/=mag;
      nz/=mag;
    }

    const objEndX=hit.ball.x+nx*.90;
    const objEndZ=hit.ball.z+nz*.90;

    out+=poolLineMarkup(
      hit.ball.x,hit.ball.z,
      objEndX,objEndZ,
      y+.004,'#ffd54a',.82
    );

    // Add a short post-impact cue-ball tangent line.
    let tx=-nz,tz=nx;
    const incomingDot=tx*aim.shotDir.x+tz*aim.shotDir.z;
    if(incomingDot<0){tx=-tx;tz=-tz;}
    out+=poolLineMarkup(
      hit.ball.x,hit.ball.z,
      hit.ball.x+tx*.48,hit.ball.z+tz*.48,
      y+.006,'#ff7a80',.58
    );
  }

  return out;
}
function ensurePoolAimVisuals(){
  if(state.pool.aimVisuals)return state.pool.aimVisuals;
  const host=document.getElementById('poolAimGuide');
  if(!host||!window.THREE)return null;

  const dot=new THREE.Mesh(
    new THREE.SphereGeometry(.026,14,10),
    new THREE.MeshBasicMaterial({color:0xff2028,depthTest:false,depthWrite:false})
  );
  dot.renderOrder=999;
  dot.visible=false;
  host.object3D.add(dot);

  function makeLine(color){
    const geometry=new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(),new THREE.Vector3()
    ]);
    const material=new THREE.LineBasicMaterial({
      color,transparent:true,opacity:.95,depthTest:false,depthWrite:false
    });
    const line=new THREE.Line(geometry,material);
    line.renderOrder=998;
    line.visible=false;
    host.object3D.add(line);
    return line;
  }

  const cueLine=makeLine(0xff3f46);
  const objectLine=makeLine(0xffd54a);
  const tangentLine=makeLine(0xff7a80);
  const jumpLine=makeLine(0x79d7ff);

  state.pool.aimVisuals={host,dot,cueLine,objectLine,tangentLine,jumpLine};
  return state.pool.aimVisuals;
}

function setThreeLine(line,a,b,visible=true){
  if(!line)return;
  line.visible=visible;
  if(!visible)return;
  line.geometry.setFromPoints([a,b]);
  line.geometry.attributes.position.needsUpdate=true;
  line.geometry.computeBoundingSphere();
}

function hidePoolAimVisuals(){
  const v=state.pool.aimVisuals;
  if(!v)return;
  v.dot.visible=false;
  v.cueLine.visible=false;
  v.objectLine.visible=false;
  v.tangentLine.visible=false;
  if(v.jumpLine)v.jumpLine.visible=false;
}

function poolPredictedJump(aim){
  if(!aim?.hit)return null;

  const top=THREE.MathUtils.clamp(aim.top,-1,1);
  const lowHit=Math.max(0,-top);

  // Estimate handle elevation from manual wheel raise + rail-forced elevation.
  const manual=Math.max(0,state.pool.cueElevation||0);
  const crouch=THREE.MathUtils.clamp(state.player.crouchAmount||0,0,1);
  const stanceBase=THREE.MathUtils.lerp(.115,.030,crouch);
  const elevation=Math.max(0,stanceBase+manual);

  // Need both a low contact and a meaningfully elevated butt.
  const jumpFactor=THREE.MathUtils.clamp(
    (lowHit-.30)/.70 * (elevation-.08)/.32,
    0,1
  );

  if(jumpFactor<=.02)return null;

  // Preview velocity is relative, not exact power: use current pull meter so
  // the arc grows as the player prepares a stronger stroke.
  const pull=Math.max(.18,Math.min(1,state.pool.maxCuePull/.58));
  const speed=2.4+pull*4.0;
  const vy=.75+jumpFactor*2.6;

  return {jumpFactor,speed,vy};
}

function setThreePolyline(line,points,visible=true){
  if(!line)return;
  line.visible=visible;
  if(!visible)return;
  line.geometry.setFromPoints(points);
  line.geometry.attributes.position.needsUpdate=true;
  line.geometry.computeBoundingSphere();
}

function updatePoolAimVisuals(aim){
  const v=ensurePoolAimVisuals();
  if(!v||!aim||state.pool.shotInProgress){
    hidePoolAimVisuals();
    return;
  }

  v.dot.visible=true;
  v.dot.position.set(
    aim.contact.x-POOL.centerX,
    aim.contact.y+.018,
    aim.contact.z-POOL.centerZ
  );
  v.dot.material.color.setHex(aim.hit?0xff2028:0xffc928);

  if(!state.pool.trajectory){
    v.cueLine.visible=false;
    v.objectLine.visible=false;
    v.tangentLine.visible=false;
    if(v.jumpLine)v.jumpLine.visible=false;
    return;
  }

  const y=POOL.feltY+POOL.ballRadius+.025;
  const launch=poolLaunchDirection(aim);
  const cueStart=new THREE.Vector3(aim.cue.x,y,aim.cue.z);
  const hit=poolFirstObjectHit(aim,3.2);

  // Jump preview supersedes flat cue-path preview when a jump is predicted.
  const jump=poolPredictedJump(aim);
  if(jump&&v.jumpLine){
    const points=[];
    const totalT=.72;
    const steps=24;
    for(let i=0;i<=steps;i++){
      const t=totalT*(i/steps);
      const px=aim.cue.x+launch.x*jump.speed*t;
      const pz=aim.cue.z+launch.z*jump.speed*t;
      const py=y+jump.vy*t-.5*POOL.gravity*t*t;
      if(py<y&&i>1)break;
      points.push(new THREE.Vector3(px,Math.max(y,py),pz));
    }
    setThreePolyline(v.jumpLine,points,points.length>1);
  }else if(v.jumpLine){
    v.jumpLine.visible=false;
  }

  if(!hit){
    const cueEnd=new THREE.Vector3(
      aim.cue.x+launch.x*1.70,
      y,
      aim.cue.z+launch.z*1.70
    );
    setThreeLine(v.cueLine,cueStart,cueEnd,true);
    v.objectLine.visible=false;
    v.tangentLine.visible=false;
    return;
  }

  const impact=new THREE.Vector3(hit.cueImpactX,y,hit.cueImpactZ);
  setThreeLine(v.cueLine,cueStart,impact,true);

  // Object-ball path is the collision normal from the true impact geometry.
  const objLen=.95*Math.max(.28,hit.objectStrength);
  setThreeLine(
    v.objectLine,
    new THREE.Vector3(hit.ball.x,y+.003,hit.ball.z),
    new THREE.Vector3(
      hit.ball.x+hit.objectDir.x*objLen,
      y+.003,
      hit.ball.z+hit.objectDir.z*objLen
    ),
    true
  );

  // Cue ball retains only the tangent component after an ideal equal-mass hit.
  if(hit.cueExitStrength>.055){
    const cueExitLen=.78*hit.cueExitStrength;
    setThreeLine(
      v.tangentLine,
      impact,
      new THREE.Vector3(
        impact.x+hit.cueExit.x*cueExitLen,
        y+.006,
        impact.z+hit.cueExit.z*cueExitLen
      ),
      true
    );
  }else{
    v.tangentLine.visible=false;
  }
}
function updatePoolAimGuide(){
  const host=document.getElementById('poolAimGuide');
  if(!host)return;

  updateHeldPoolCue();
  updateHeldPoolTool();

  if(state.pool.active&&state.pool.rules?.ballInHand){
    host.innerHTML='';
    state.pool.lastAim=null;
    hidePoolAimVisuals();
    updateCueBallPlacementPreview();
    updatePoolPowerMeter();
    return;
  }else{
    hideCueBallPlacementPreview();
  }

  if(!state.pool.active||state.pool.shotInProgress||state.pool.manualRack.active){
    host.innerHTML='';
    state.pool.lastAim=null;
    hidePoolAimVisuals();
    return;
  }

  const aim=calculatePoolAim();
  state.pool.lastAim=aim;
  if(!aim){
    host.innerHTML='';
    hidePoolAimVisuals();
    return;
  }

  updatePoolAimVisuals(aim);

  const pullPct=Math.round((state.pool.cuePull/.70)*100);
  const sideLabel=Math.abs(aim.side)<.14?'CENTER':(aim.side>0?'RIGHT':'LEFT');
  const spinLabel=Math.abs(aim.top)<.14?'CENTER':(aim.top>0?'TOP':'BACK');

  // Keep textual labels sparse; actual contact marker/trajectory are persistent THREE objects.
  let label='';
  if(aim.hit)label=`${sideLabel} / ${spinLabel}`;
  else if(aim.nearMiss)label='MISS / FOUL';

  host.innerHTML=label?`
    <a-text value="${label}" position="${aim.cue.x} ${POOL.feltY+POOL.ballRadius+.19} ${aim.cue.z}"
      rotation="-90 0 0" align="center" color="${aim.hit?'#ffb1b4':'#ffd24a'}" width=".54"></a-text>`:'';

  updatePoolPowerMeter();
}
function enterPoolMode(){
  if(state.engaged||state.player.inventoryOpen)return;

  const hasCue=state.inventory.some(item=>item?.typeId==='pixelb8.pool-cue');
  if(!hasCue){
    toast('You need a pool cue. Take one from the cue rack.',1800);
    return;
  }
  state.pool.active=true;
  state.pool.aim=Math.PI;
  state.pool.power=.62;
  state.pool.cuePull=0;
  state.pool.maxCuePull=0;
  state.pool.forwardPeak=0;
  state.pool.gripping=false;
  state.pool.fineYaw=0;
  state.pool.lastMouseStamp=performance.now();
  document.getElementById('poolHud')?.classList.remove('hidden');
  document.getElementById('poolPowerDock')?.classList.remove('hidden');
  updatePoolRulesHud();
  applyPoolHotbar(true);
  updateHeldPoolTool();

  // Pool is part of the world, not a frozen minigame. Keep normal walking,
  // collisions and mouse-look active so the player can circle the table.
  setMovementEnabled(true);
  camera()?.setAttribute('look-controls','enabled',true);

  document.getElementById('hudMode').textContent='POOL · walk/look normally · L lean · 4 cue / 5 bridge · wheel cue height · RMB+mouse Reach · Shift+wheel crouch · hold LMB to stroke · Backspace leave';
  setPrompt(null);
  updatePoolAimGuide();

  const canvas=document.querySelector('#xrScene canvas');
  if(document.pointerLockElement!==canvas&&window.PIXELB8_ALLOW_POINTER_LOCK!==false){try{canvas?.requestPointerLock?.();}catch{}}

  toast('Pool: walk around and aim the red dot. Hold left mouse, pull DOWN, then stroke UP. Backspace leaves pool.',4200);
}

function exitPoolMode(){
  if(!state.pool.active)return;
  state.pool.active=false;
  state.pool.gripping=false;
  state.pool.reaching=false;
  state.pool.cuePull=0;
  state.pool.maxCuePull=0;
  state.pool.forwardPeak=0;
  state.pool.fineYaw=0;
  setMovementEnabled(true);
  camera()?.setAttribute('look-controls','enabled',true);
  document.getElementById('heldPoolCue')?.setAttribute('visible',false);
  document.getElementById('heldPoolBridge')?.setAttribute('visible',false);
  document.getElementById('poolHud')?.classList.add('hidden');
  document.getElementById('poolPowerDock')?.classList.add('hidden');
  document.getElementById('poolManualRackPanel')?.classList.add('hidden');
  state.pool.manualRack.active=false;
  setTriangleRackVisible(false);
  hideCueBallPlacementPreview();
  applyPoolHotbar(false);
  document.getElementById('hudMode').textContent='WASD move · Enter interact · R run/walk · Shift+wheel crouch · L lean · X sit · Space jump';
  updatePoolAimGuide();
}

function shootPool(strokeSpeed=null){
  if(!state.pool.active||state.pool.shotInProgress)return;

  const aim=calculatePoolAim();
  if(!aim||!aim.cue)return;

  const cue=aim.cue;
  const rules=state.pool.rules;
  const freePlay=Boolean(rules.rackOver||rules.freePlay);

  if(!freePlay&&rules.ballInHand){
    toast('Place the cue ball first.',900);
    return;
  }

  if(freePlay&&cue.pocketed){
    respawnCueBallFreePlay();
    return;
  }

  rules.shotPocketed=[];
  rules.foul=false;
  rules.foulReason='';

  const pullFactor=.25+Math.min(1,state.pool.maxCuePull/.58)*.75;
  const raw=strokeSpeed==null?2.0:strokeSpeed;
  const speed=Math.max(.08,Math.min(7.2,raw*pullFactor));

  state.pool.cuePull=0;
  state.pool.maxCuePull=0;
  state.pool.forwardPeak=0;

  if(!aim.hit){
    state.pool.gripping=false;
    state.pool.gripViewQuaternion=null;
    state.pool.gripViewRotation=null;
    state.pool.fineYaw=0;
    camera()?.setAttribute('look-controls','enabled',true);
    if(aim.nearMiss){
      if(!freePlay){
        setPoolFoul('Missed cue ball');
        completePoolShot();
      }
      toast(freePlay?'Missed the cue ball.':'Missed the cue ball — foul.',1300);
    }else{
      toast('Aim closer to the cue ball.',1000);
    }
    updatePoolAimGuide();
    return;
  }

  const reachedAim=poolAimWithReach(aim);
  const dx=reachedAim.shotDir.x,dz=reachedAim.shotDir.z;
  const rightX=reachedAim.right.x,rightZ=reachedAim.right.z;

  const side=THREE.MathUtils.clamp(aim.side,-1,1);

  // Reach changes the actual cue axis. Contact-offset deflection then acts
  // relative to that reached axis, so visuals, trajectory and physics agree.
  const launch=poolLaunchDirection(aim);
  const launchX=launch.x;
  const launchZ=launch.z;

  cue.vx=launchX*speed;
  cue.vz=launchZ*speed;

  cue.sideSpin=side*speed*.82;

  const top=THREE.MathUtils.clamp(aim.top,-1,1);
  cue.spinX=launchX*top*speed*.48;
  cue.spinZ=launchZ*top*speed*.48;

  // Hard low hits can pop the cue ball into the air.
  // Aim.top is negative when striking below center.
  const lowHit=Math.max(0,-top);
  if(lowHit>POOL.jumpThreshold&&speed>3.1){
    const jumpStrength=(lowHit-POOL.jumpThreshold)/(1-POOL.jumpThreshold);
    cue.vy=Math.min(3.7,.9+jumpStrength*2.4+(speed-3.1)*.18);
  }

  state.pool.shotInProgress=true;
  state.pool.gripping=false;
    state.pool.gripViewQuaternion=null;
    state.pool.gripViewRotation=null;
  state.pool.fineYaw=0;
  camera()?.setAttribute('look-controls','enabled',true);
  const canvas=document.querySelector('#xrScene canvas');
  if(document.pointerLockElement!==canvas&&window.PIXELB8_ALLOW_POINTER_LOCK!==false){try{canvas?.requestPointerLock?.();}catch{}}

  if(state.pool.tool==='bridge'){
    const bridge=document.getElementById('poolBridgeOnTable');
    if(bridge){
      bridge.setAttribute('animation__fade','property:scale;to:0.01 0.01 0.01;dur:350;easing:easeInQuad');
      setTimeout(()=>removePoolBridgeFromTable(),380);
    }
    state.pool.tool='cue';
    selectHotbarSlot(4,false);
    updateHeldPoolTool();
  }

  updatePoolAimGuide();
}
function pocketPoolBall(ball){
  if(ball.pocketed)return;
  ball.pocketed=true;
  ball.returned=ball.n!==0;
  ball.vx*=.45;
  ball.vz*=.45;
  ball.vy=Math.min(ball.vy||0,-.35);

  const r=state.pool.rules;
  if(!r.shotPocketed.includes(ball.n))r.shotPocketed.push(ball.n);

  if(ball.n===0){
    state.pool.cueNeedsRespawn=true;
    if(state.pool.rules.rackOver||state.pool.rules.freePlay){
      toast('Scratch — cue ball will return.',1000);
    }else{
      setPoolFoul('Scratch');
      toast('Scratch — foul.',1000);
    }
  }else{
    toast(`Ball ${ball.n} pocketed.`,900);
  }
  updatePoolPocketedHud();
}

function respawnCueBallFreePlay(){
  const cue=state.pool.balls.find(b=>b.n===0);
  if(!cue)return;
  const spots=[[-1.05,0],[-1.25,0],[-.95,.22],[-.95,-.22]];
  let spot=spots[0];
  for(const candidate of spots){
    if(!state.pool.balls.some(b=>b.n!==0&&!b.pocketed&&Math.hypot(b.x-candidate[0],b.z-candidate[1])<POOL.ballRadius*2.25)){
      spot=candidate;break;
    }
  }
  cue.pocketed=false;
  cue.returned=false;
  cue.x=spot[0];cue.z=spot[1];cue.y=POOL.feltY+POOL.ballRadius;
  cue.vx=cue.vy=cue.vz=0;
  cue.sideSpin=cue.spinX=cue.spinZ=0;
  state.pool.cueNeedsRespawn=false;
  state.pool.rules.ballInHand=false;
  renderPoolBalls(false);
  updatePoolAimGuide();
}

function respawnCueBall(){
  const cue=state.pool.balls.find(b=>b.n===0);
  if(!cue)return;

  if(state.pool.rules.ballInHand){
    cue.pocketed=true;
    cue.vx=cue.vy=cue.vz=0;
    state.pool.cueNeedsRespawn=false;
    hidePoolAimVisuals();
    updateHeldPoolTool();
    updateCueBallPlacementPreview();
    updatePoolRulesHud();
    return;
  }

  cue.pocketed=false;
  cue.vx=cue.vz=0;
  cue.vy=0;
  cue.y=POOL.feltY+POOL.ballRadius;
  cue.sideSpin=0;cue.spinX=0;cue.spinZ=0;

  // Start near the head spot and move slightly if another ball occupies it.
  let x=-1.05,z=0;
  for(let tries=0;tries<12;tries++){
    const blocked=state.pool.balls.some(b=>b.n!==0&&!b.pocketed&&Math.hypot(b.x-x,b.z-z)<POOL.ballRadius*2.2);
    if(!blocked)break;
    z+=.13;
    if(z>.55){z=-.55;x-=.12;}
  }
  cue.x=x;cue.z=z;
  state.pool.cueNeedsRespawn=false;
  renderPoolBalls(false);
}

function poolPocketOpeningForX(x){
  return Math.abs(x)<POOL.sidePocketHalfWidth || Math.abs(x)>POOL.cornerPocketMouthX;
}

function poolPocketOpeningForZ(z){
  return Math.abs(z)>POOL.cornerPocketMouthZ;
}

function stepPoolPhysics(dt){
  const r=POOL.ballRadius;
  const rx=POOL.innerHalfX-r;
  const rz=POOL.innerHalfZ-r;
  const feltBallY=POOL.feltY+r;

  // First integrate all balls, including pocketed balls so they visibly fall.
  for(const ball of state.pool.balls){
    // Gravity for everything in pool space.
    ball.vy=(ball.vy||0)-POOL.gravity*dt;
    ball.y=(ball.y??feltBallY)+ball.vy*dt;

    if(ball.pocketed){
      ball.x+=ball.vx*dt;
      ball.z+=ball.vz*dt;
      ball.vx*=Math.exp(-2.6*dt);
      ball.vz*=Math.exp(-2.6*dt);
      // Once far below table, stop spending work on it.
      if(ball.y<POOL.feltY-1.25){
        ball.vx=ball.vz=ball.vy=0;
      }
      continue;
    }

    // Felt supports balls unless airborne.
    if(ball.y<=feltBallY){
      ball.y=feltBallY;
      if(ball.vy<0){
        if(Math.abs(ball.vy)>.65)ball.vy=-ball.vy*POOL.verticalRestitution;
        else ball.vy=0;
      }
    }

    // Cue-ball spin transfer while on/near felt.
    if(ball.n===0&&ball.y<=feltBallY+.01){
      ball.vx+=(ball.spinX||0)*dt*.95;
      ball.vz+=(ball.spinZ||0)*dt*.95;

      // Small swerve from side English while rolling.
      const planarSpeed=Math.hypot(ball.vx,ball.vz);
      if(planarSpeed>.08&&Math.abs(ball.sideSpin||0)>.02){
        const ux=ball.vx/planarSpeed;
        const uz=ball.vz/planarSpeed;
        const rx=-uz;
        const rz=ux;
        const swerve=(ball.sideSpin||0)*dt*.055;
        ball.vx+=rx*swerve;
        ball.vz+=rz*swerve;
      }

      const spinDecay=Math.exp(-2.25*dt);
      ball.spinX=(ball.spinX||0)*spinDecay;
      ball.spinZ=(ball.spinZ||0)*spinDecay;
      ball.sideSpin=(ball.sideSpin||0)*Math.exp(-1.55*dt);
    }

    ball.x+=ball.vx*dt;
    ball.z+=ball.vz*dt;

    let speed=Math.hypot(ball.vx,ball.vz);
    if(ball.y<=feltBallY+.01&&speed>0){
      const next=Math.max(0,speed-POOL.rollingDecel*dt);
      if(next<=POOL.stopSpeed){
        ball.vx=0;ball.vz=0;
      }else{
        const scale=next/speed;
        ball.vx*=scale;ball.vz*=scale;
      }
    }

    // Pocket capture uses a throat radius and only captures balls near table height.
    // Airborne jump shots can pass over a pocket mouth.
    let sunk=false;
    if(ball.y<=feltBallY+.10){
      for(const [px,pz] of POOL.pockets){
        const d=Math.hypot(ball.x-px,ball.z-pz);
        if(d<=POOL.pocketRadius){
          pocketPoolBall(ball);
          sunk=true;
          break;
        }
      }
    }
    if(sunk)continue;

    // Rails only collide with balls that are not high enough to clear them.
    const railTop=POOL.feltY+.16;
    if(ball.y-r<railTop){
      if(ball.z<-rz&&!poolPocketOpeningForX(ball.x)){
        ball.z=-rz;
        ball.vz=Math.abs(ball.vz)*POOL.cushionRestitution;
        if(ball.n===0)ball.vx+=(ball.sideSpin||0)*.22;
      }else if(ball.z>rz&&!poolPocketOpeningForX(ball.x)){
        ball.z=rz;
        ball.vz=-Math.abs(ball.vz)*POOL.cushionRestitution;
        if(ball.n===0)ball.vx-=(ball.sideSpin||0)*.22;
      }

      if(ball.x<-rx&&!poolPocketOpeningForZ(ball.z)){
        ball.x=-rx;
        ball.vx=Math.abs(ball.vx)*POOL.cushionRestitution;
        if(ball.n===0)ball.vz-=(ball.sideSpin||0)*.22;
      }else if(ball.x>rx&&!poolPocketOpeningForZ(ball.z)){
        ball.x=rx;
        ball.vx=-Math.abs(ball.vx)*POOL.cushionRestitution;
        if(ball.n===0)ball.vz+=(ball.sideSpin||0)*.22;
      }
    }

    // Ball driven off the table: foul under 8-ball rules.
    const outerX=POOL.innerHalfX+.22;
    const outerZ=POOL.innerHalfZ+.20;
    if(Math.abs(ball.x)>outerX||Math.abs(ball.z)>outerZ){
      let nearest=Infinity;
      for(const [px,pz] of POOL.pockets)nearest=Math.min(nearest,Math.hypot(ball.x-px,ball.z-pz));
      if(nearest<POOL.pocketRadius*1.65){
        pocketPoolBall(ball);
      }else{
        drivePoolBallOffTable(ball);
      }
      continue;
    }
  }

  // 3D ball-ball collisions. Airborne balls only collide if their spheres overlap vertically.
  const balls=state.pool.balls.filter(b=>!b.pocketed);
  const minDist=r*2;

  for(let i=0;i<balls.length;i++){
    for(let j=i+1;j<balls.length;j++){
      const a=balls[i],b=balls[j];
      const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;
      let dist=Math.hypot(dx,dy,dz);
      if(dist>=minDist)continue;

      let nx,nz,ny;
      if(dist<1e-6){
        nx=1;ny=0;nz=0;dist=minDist;
      }else{
        nx=dx/dist;ny=dy/dist;nz=dz/dist;
      }

      const penetration=minDist-dist;
      const correction=penetration*.505;
      a.x-=nx*correction;a.y-=ny*correction;a.z-=nz*correction;
      b.x+=nx*correction;b.y+=ny*correction;b.z+=nz*correction;

      const rvx=b.vx-a.vx,rvy=(b.vy||0)-(a.vy||0),rvz=b.vz-a.vz;
      const relNormal=rvx*nx+rvy*ny+rvz*nz;
      if(relNormal<0){
        const impulse=-(1+POOL.ballRestitution)*relNormal/2;
        a.vx-=impulse*nx;a.vy=(a.vy||0)-impulse*ny;a.vz-=impulse*nz;
        b.vx+=impulse*nx;b.vy=(b.vy||0)+impulse*ny;b.vz+=impulse*nz;
      }
    }
  }
}
function updatePoolPhysics(delta){
  if(!state.pool.balls.length)return;
  state.pool.physicsAccumulator+=Math.min(POOL.maxFrameTime,Math.max(0,(delta||0)/1000));

  let steps=0;
  while(state.pool.physicsAccumulator>=POOL.fixedStep && steps<16){
    stepPoolPhysics(POOL.fixedStep);
    state.pool.physicsAccumulator-=POOL.fixedStep;
    steps++;
  }

  const anyMoving=state.pool.balls.some(
    b=>!b.pocketed&&(
      Math.hypot(b.vx,b.vz)>POOL.stopSpeed||
      Math.abs(b.vy||0)>.05||
      Math.abs((b.y??(POOL.feltY+POOL.ballRadius))-(POOL.feltY+POOL.ballRadius))>.01
    )
  );

  if(state.pool.shotInProgress&&!anyMoving){
    state.pool.shotInProgress=false;

    // Resolve rack rules, or simply keep the physical table playable after game-over.
    completePoolShot();

    if(state.pool.cueNeedsRespawn){
      if(state.pool.rules.rackOver||state.pool.rules.freePlay)respawnCueBallFreePlay();
      else respawnCueBall();
    }
    camera()?.setAttribute('look-controls','enabled',true);
    const canvas=document.querySelector('#xrScene canvas');
    if(state.pool.active&&document.pointerLockElement!==canvas&&window.PIXELB8_ALLOW_POINTER_LOCK!==false){try{canvas?.requestPointerLock?.();}catch{}}
    updateHeldPoolTool();
    updatePoolRulesHud();
    updatePoolAimGuide();
  }

  renderPoolBalls(false);
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
    // Dispatch once. The iframe's own window receives the event and normal
    // capture/bubble handling inside the game takes it from there.
    // Dispatching a second copy at document level made double-tap games such
    // as Cyrene Rangers interpret one A/D press as two presses.
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

function ensureArcadeCueRackAsset(){
  const runtime=window.PixelB8SpatialRuntime;
  if(!runtime?.assets)return null;
  const existing=runtime.assets.get('pool-cue-rack-main');
  if(existing)return existing;
  if(!runtime.registry?.getAsset?.('pixelb8.pool-cue-rack'))return null;

  return runtime.assets.spawn('pixelb8.pool-cue-rack',{
    id:'pool-cue-rack-main',
    hostId:'assetHost',
    position:[16.80,0,3.25],
    rotation:[0,-90,0]
  });
}

function arcadeCueRack(){
  return window.PixelB8SpatialRuntime?.assets?.get?.('pool-cue-rack-main')||null;
}

function syncCueTakenToLegacyInventory(item){
  if(!item)return;
  if(!state.inventory.some(existing=>existing?.uid===item.uid)){
    state.inventory.push(item);
    renderInventory();
  }
}

function syncCueReturnedFromLegacyInventory(item){
  if(!item)return;
  const index=state.inventory.findIndex(existing=>existing?.uid===item.uid);
  if(index>=0){
    state.inventory.splice(index,1);
    renderInventory();
  }
}

function updateArcadeCueRackFocus(){
  const rack=arcadeCueRack();
  if(!rack)return null;
  if(state.engaged||state.pool.active||state.player.inventoryOpen){
    rack.clearFocus?.();
    return null;
  }
  return rack.updateFocus?.(camera(),window.PixelB8SpatialInventory)||null;
}

function interactArcadeCueRack(){
  const rack=arcadeCueRack();
  if(!rack||rack.focusedSlot<0)return false;

  const result=rack.interactFocused(window.PixelB8SpatialInventory);
  if(!result)return false;

  if(result.action==='take'){
    syncCueTakenToLegacyInventory(result.item);
    toast('Pool cue added to inventory.',1100);
  }else{
    syncCueReturnedFromLegacyInventory(result.item);
    toast('Pool cue returned to rack.',1100);
  }
  return true;
}

function findNearestInteraction(){
  if(state.engaged||state.pool.active)return null;
  const cam=camera();
  if(!cam)return null;
  const p=worldPos(cam);
  let best=null;
  let bestDist=2.45;

  document.querySelectorAll('[data-interact].door-root,.cabinet-root,.table-root,#poolTable,#dungeonEntrance [data-interact]').forEach(el=>{
    const hit=el.matches('.cabinet-root,.table-root,.door-root')?el:el.closest('[data-interact]');
    if(!hit)return;
    const hp=worldPos(hit);
    const d=Math.hypot(p.x-hp.x,p.z-hp.z);
    const type=hit.dataset.interact;
    const allowed=type==='pool'?3.05:2.45;
    if(d<allowed && (!best || d<bestDist)){
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
  if(type==='pool')return{type,id,title:'Pool',copy:'Press Enter to play · requires a pool cue'};
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
    case 'pool': enterPoolMode(); break;
    case 'exit': location.href='../index.html'; break;
    case 'dungeon': enterDungeon(); break;
    case 'dungeon-exit': leaveDungeon(); break;
    case 'girls':
    case 'boys': toast(`${item.title} isn't explorable yet.`); break;
  }
}



function playerWorldXZ(){
  const cam=camera();
  if(!cam)return null;
  const p=new THREE.Vector3();
  cam.object3D.getWorldPosition(p);
  return p;
}

function setPlayerWorldXZ(x,z){
  const cam=camera(),r=rig();
  if(!cam||!r)return;

  const current=new THREE.Vector3();
  cam.object3D.getWorldPosition(current);

  // Correct the player's WORLD position by translating the rig.
  // Never rewrite camera-local X/Z: WASD movement lives there.
  r.object3D.position.x+=x-current.x;
  r.object3D.position.z+=z-current.z;
}

function resolveStaticCollisions(){
  if(state.engaged||state.player.inventoryOpen)return;
  const p=playerWorldXZ();
  if(!p)return;
  const radius=state.collision.radius;

  // Outer arcade bounds. Dungeon uses its own corridor bounds below.
  if(!state.dungeon){
    let x=Math.max(-16.55,Math.min(16.55,p.x));
    let z=Math.max(-6.50,Math.min(14.4,p.z));

    document.querySelectorAll('.collision-box').forEach(el=>{
      const pos=worldPos(el);
      if(!pos)return;
      const hx=Number(el.dataset.collisionHalfx)||0;
      const hz=Number(el.dataset.collisionHalfz)||0;
      if(!hx||!hz)return;

      const dx=x-pos.x,dz=z-pos.z;
      const px=hx+radius-Math.abs(dx);
      const pz=hz+radius-Math.abs(dz);
      if(px>0&&pz>0){
        // Push out along the shallower penetration axis.
        if(px<pz)x=pos.x+(dx<0?-(hx+radius):(hx+radius));
        else z=pos.z+(dz<0?-(hz+radius):(hz+radius));
      }
    });
    setPlayerWorldXZ(x,z);
  }else{
    // Dungeon corridor: stop walking through the side walls.
    const x=Math.max(-2.36,Math.min(2.36,p.x));
    setPlayerWorldXZ(x,p.z);
  }
}

function syncCabinetHardware(){
  // Mirror the actual 2D cabinet controls into the 3D cabinet.
  const out=state.gameTextures.get('outdrive');
  if(out?.frame?.contentDocument){
    const doc=out.frame.contentDocument;
    const srcWheel=doc.getElementById('steeringWheel');
    const wheel=document.getElementById('xr-outdrive-wheel');
    if(srcWheel&&wheel){
      const m=String(srcWheel.style.transform||'');
      const deg=Number((m.match(/rotate\((-?[\d.]+)deg\)/)||[])[1]||0);
      wheel.setAttribute('rotation',`90 0 ${deg}`);
    }
    const srcGear=doc.getElementById('shifterKnob');
    const gearText=document.getElementById('xr-outdrive-gear');
    const knob=document.getElementById('xr-outdrive-shifter-knob');
    if(srcGear&&gearText&&knob){
      const gear=Number(srcGear.textContent)||1;
      gearText.setAttribute('value',String(gear));
      knob.object3D.position.y=.22+(gear-1)*.045;
    }
  }

  const cy=state.gameTextures.get('cyrenerangers');
  if(cy?.frame?.contentDocument){
    const doc=cy.frame.contentDocument;
    const src=doc.getElementById('joystickBall');
    const ball=document.getElementById('xr-cyrene-stick-ball');
    if(src&&ball){
      const tr=String(src.style.transform||'');
      let x=0,z=0;
      const m=tr.match(/translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/);
      if(m){x=Number(m[1])*.0025;z=Number(m[2])*.0025;}
      ball.object3D.position.set(x,.22,z);
    }
    const ids=['btnAttack','btnJump','btnBomb','btnSpecial','btnTransform','btnGrab'];
    ids.forEach((id,i)=>{
      const source=doc.getElementById(id);
      const target=document.getElementById(`xr-cyrene-btn-${i}`);
      if(source&&target){
        const pressed=source.classList.contains('active-press');
        target.object3D.scale.y=pressed?0.72:1;
      }
    });
  }
}

function isEditableTarget(target){
  if(!target)return false;
  if(target instanceof HTMLTextAreaElement)return true;
  if(target instanceof HTMLSelectElement)return true;
  if(target.isContentEditable)return true;

  if(target instanceof HTMLInputElement){
    const type=(target.type||'text').toLowerCase();
    return [
      'text','search','email','url','tel','password','number',
      'date','datetime-local','month','time','week'
    ].includes(type);
  }

  return false;
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

function applyPoolHotbar(active){
  if(active){
    window.PixelB8XRPlayer?.setHotbarSlot?.(4,{id:'pool-cue',label:'Pool Cue',icon:'🎱',kind:'pool'});
    window.PixelB8XRPlayer?.setHotbarSlot?.(5,{id:'pool-bridge',label:'Bridge Rest',icon:'╫',kind:'pool'});
    state.pool.tool='cue';
    selectHotbarSlot(4,false);
  }else{
    window.PixelB8XRPlayer?.setHotbarSlot?.(4,null);
    window.PixelB8XRPlayer?.setHotbarSlot?.(5,null);
    if(state.player.selectedSlot===4||state.player.selectedSlot===5)selectHotbarSlot(1,false);
    state.pool.tool='cue';
    removePoolBridgeFromTable();
  }
  updateHeldPoolTool();
}

function updateHeldPoolTool(){
  const cue=document.getElementById('heldPoolCue');
  const bridge=document.getElementById('heldPoolBridge');
  const active=state.pool.active;
  const ballInHand=Boolean(state.pool.rules?.ballInHand);
  const usable=active&&!state.pool.shotInProgress&&!state.pool.manualRack.active&&!ballInHand;

  if(cue)cue.setAttribute('visible',usable&&state.pool.tool==='cue');

  if(bridge){
    bridge.setAttribute('visible',usable&&state.pool.tool==='bridge');
    const pull=state.pool.cuePull;
    bridge.object3D.position.set(.18,-.16,-1.30+pull*.78);
  }
}
function removePoolBridgeFromTable(){
  const host=document.getElementById('poolBridgeHost');
  if(host)host.innerHTML='';
  state.pool.bridgePlaced=false;
}

function placePoolBridgeOnTable(){
  const host=document.getElementById('poolBridgeHost');
  const ray=poolViewRay();
  if(!host||!ray||Math.abs(ray.dir.y)<1e-5)return false;

  const t=((POOL.feltY+.012)-ray.origin.y)/ray.dir.y;
  if(t<=0)return false;

  const hit=ray.origin.clone().addScaledVector(ray.dir,t);
  const lx=hit.x-POOL.centerX;
  const lz=hit.z-POOL.centerZ;

  if(Math.abs(lx)>POOL.innerHalfX-.12||Math.abs(lz)>POOL.innerHalfZ-.12){
    toast('Aim at the pool felt to place the bridge.',1200);
    return false;
  }

  removePoolBridgeFromTable();

  const flat=new THREE.Vector3(ray.dir.x,0,ray.dir.z);
  if(flat.lengthSq()<1e-6)flat.set(1,0,0);
  flat.normalize();
  const yaw=-THREE.MathUtils.radToDeg(Math.atan2(flat.z,flat.x));

  host.innerHTML=`
    <a-entity id="poolBridgeOnTable" position="${hit.x} 0 ${hit.z}">
      <a-entity position="0 ${POOL.feltY+.04} 0">
        <a-box width=".30" height=".022" depth=".028" rotation="0 ${yaw} 0" color="#c7ccd0"></a-box>
        <a-box width=".026" height=".14" depth=".026" position="0 .060 0" color="#c7ccd0"></a-box>
        <a-cylinder position="${-flat.x*.58} .12 ${-flat.z*.58}" rotation="90 0 ${yaw}"
          radius=".011" height="1.16" color="#c99b5d"></a-cylinder>
      </a-entity>
    </a-entity>`;
  state.pool.bridgePlaced=true;
  return true;
}
function useHotbarItem(item,slot){
  const el=document.querySelector(`[data-hotbar-slot="${slot}"]`);
  el?.classList.remove('pulse');
  void el?.offsetWidth;
  el?.classList.add('pulse');

  if(state.pool.active&&(item.id==='pool-cue'||item.id==='pool-bridge')){
    state.pool.tool=item.id==='pool-bridge'?'bridge':'cue';
    if(state.pool.tool==='bridge'){
      const placed=placePoolBridgeOnTable();
      toast(placed?'Bridge rest placed':'Bridge selected — aim at felt and press 5 again',1100);
    }else{
      removePoolBridgeFromTable();
      toast('Pool cue selected',900);
    }
    updateHeldPoolTool();
    return;
  }

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
  if(state.player.crouchAmount>.08)return 13;
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

function postureRig(){
  return document.getElementById('postureRig');
}

function applyEyePosture(){
  const p=state.player;
  const pr=postureRig();
  if(!pr)return;

  const crouchDrop=.62*p.crouchAmount;
  const leanDrop=p.leaning?0.12:0;
  const leanForward=p.leaning?0.30:0;

  // Camera already sits 1.65 m above the rig. postureRig only adds
  // body/posture offsets, so changing posture can never alter world position.
  if(p.sitting){
    // Standing camera = 1.65m. -0.43 gives ~1.22m seated eye height.
    pr.object3D.position.set(0,-.43,0);
  }else{
    pr.object3D.position.set(0,-crouchDrop-leanDrop,-leanForward);
  }

  p.crouched=p.crouchAmount>.08;
  document.getElementById('crouchState')?.classList.toggle('hidden',!p.crouched);
}
function setCrouchAmount(amount){
  const p=state.player;
  if(p.sitting)return;
  p.crouchAmount=THREE.MathUtils.clamp(Number(amount)||0,0,1);
  if(p.crouchAmount>.1)p.running=false;
  refreshMovementControls();
  applyEyePosture();
  if(state.pool.active){
    updateHeldPoolCue();
    updatePoolAimGuide();
  }
}

function standStraight(){
  const p=state.player;
  if(p.sitting)toggleSit(false);
  p.crouchAmount=0;
  p.leaning=false;
  refreshMovementControls();
  applyEyePosture();
  if(state.pool.active){
    updateHeldPoolCue();
    updatePoolAimGuide();
  }
  toast('Standing straight',700);
}

function toggleLean(){
  if(state.player.sitting)return;
  state.player.leaning=!state.player.leaning;
  applyEyePosture();
  if(state.pool.active)updatePoolAimGuide();
  toast(state.player.leaning?'Leaning forward':'Lean off',800);
}

function nearestAvailableChair(maxDist=1.55){
  const p=playerWorldXZ();
  if(!p)return null;
  let best=null,bestDist=maxDist;
  document.querySelectorAll('.chair-seat[data-seat="true"]').forEach(chair=>{
    if(chair.dataset.occupied==='true'&&chair!==state.player.seatEl)return;
    const cp=worldPos(chair);
    const d=Math.hypot(p.x-cp.x,p.z-cp.z);
    if(d<bestDist){best=chair;bestDist=d;}
  });
  return best;
}

function toggleSit(force=null){
  const p=state.player;
  const sit=force==null?!p.sitting:Boolean(force);

  if(!sit){
    if(p.seatEl)p.seatEl.dataset.occupied='false';
    p.seatEl=null;
    p.sitting=false;
    setMovementEnabled(!state.engaged&&!p.inventoryOpen);
    applyEyePosture();
    toast('Stood up',700);
    return;
  }

  const chair=nearestAvailableChair();
  p.sitting=true;
  p.running=false;
  p.crouchAmount=0;
  p.leaning=false;

  if(chair){
    chair.dataset.occupied='true';
    p.seatEl=chair;

    const seat=chair.querySelector('.seat-anchor')||chair;
    const seatWorld=new THREE.Vector3();
    const chairQuat=new THREE.Quaternion();
    seat.object3D.getWorldPosition(seatWorld);
    chair.object3D.getWorldQuaternion(chairQuat);

    const r=rig();
    const cam=camera();
    if(r&&cam){
      // Move body to the chair, but stay on the current floor level.
      r.object3D.position.x=seatWorld.x;
      r.object3D.position.z=seatWorld.z;
      r.object3D.position.y=p.floorY;

      // Clear accumulated camera-local walking offset now that body snapped to seat.
      cam.object3D.position.x=0;
      cam.object3D.position.z=0;

      const facing=new THREE.Euler().setFromQuaternion(chairQuat,'YXZ');
      r.object3D.rotation.y=facing.y;
    }

    setMovementEnabled(false);
    toast('Sat in chair',700);
  }else{
    p.seatEl=null;
    setMovementEnabled(false);
    toast('Sat down',700);
  }

  applyEyePosture();
}
function jump(){
  const p=state.player;
  if(!p.onGround||p.sitting||p.crouchAmount>.65||p.stamina<10||state.engaged||p.inventoryOpen)return;
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
  const moving=(keyboardMoving||p.vrMoving)&&!p.sitting&&!state.engaged&&!p.inventoryOpen;

  if(moving){
    const drain=p.running?5.4:(p.crouchAmount>.08?0.9:1.7);
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
  window.PixelB8PoolAssets={
  get inventory(){return window.PixelB8SpatialInventory;},
  get rack(){return window.PixelB8SpatialRuntime?.assets?.get?.('pool-cue-rack-main')||null;},
  takeCue(slot=0){const rack=this.rack;if(!rack||!this.inventory)return null;return rack.take(slot,this.inventory);},
  returnCue(uid,slot=null){const rack=this.rack,inventory=this.inventory;if(!rack||!inventory)return false;const item=inventory.get(uid);return item?rack.returnItem(item,inventory,slot):false;}
};

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

function beginPoolReach(e){
  if(
    !state.pool.active ||
    state.pool.shotInProgress ||
    state.player.inventoryOpen ||
    state.pool.rules?.ballInHand ||
    state.pool.tool!=='cue' ||
    e.button!==2 ||
    isEditableTarget(e.target)
  )return false;

  e.preventDefault();
  state.pool.reaching=true;
  camera()?.setAttribute('look-controls','enabled',false);
  updateHeldPoolCue();
  return true;
}

function endPoolReach(e){
  if(e.button!==2||!state.pool.reaching)return;
  e.preventDefault();
  state.pool.reaching=false;

  // If LMB stroke isn't also active, return normal view controls.
  if(!state.pool.gripping){
    camera()?.setAttribute('look-controls','enabled',true);
  }

  updateHeldPoolCue();
  updatePoolAimGuide();
}

function beginPoolGrip(e){
  if(!state.pool.active||state.pool.shotInProgress||state.player.inventoryOpen)return;
  if(e.button!==0||isEditableTarget(e.target))return;

  if(state.pool.rules.ballInHand){
    e.preventDefault();
    placeCueBallFromView();
    return;
  }

  state.pool.gripping=true;
  const gripCam=camera();
  state.pool.gripViewQuaternion=gripCam?.object3D.quaternion.clone()||null;
  state.pool.gripViewRotation=gripCam?.object3D.rotation.clone()||null;
  state.pool.cuePull=0;
  state.pool.maxCuePull=0;
  state.pool.forwardPeak=0;
  state.pool.fineYaw=0;
  state.pool.lastMouseStamp=performance.now();
  updatePoolPowerMeter();

  // Freeze view only during the actual cue stroke. Walking stays available.
  camera()?.setAttribute('look-controls','enabled',false);
  updatePoolAimGuide();
}

function endPoolGrip(e){
  if(!state.pool.active||e.button!==0)return;
  if(state.pool.gripping&&!state.pool.shotInProgress){
    state.pool.gripping=false;
    state.pool.cuePull=0;
    state.pool.maxCuePull=0;
    state.pool.forwardPeak=0;
    state.pool.fineYaw=0;
    state.pool.gripViewQuaternion=null;
    state.pool.gripViewRotation=null;
    camera()?.setAttribute('look-controls','enabled',true);
    const canvas=document.querySelector('#xrScene canvas');
    if(state.pool.active&&document.pointerLockElement!==canvas&&window.PIXELB8_ALLOW_POINTER_LOCK!==false){try{canvas?.requestPointerLock?.();}catch{}}
    updatePoolPowerMeter();
    updatePoolAimGuide();
  }
}

function handlePoolMouseMove(e){
  if(!state.pool.active||state.pool.shotInProgress||state.player.inventoryOpen)return;
  if(isEditableTarget(e.target))return;

  // RMB Reach moves the handle hand laterally while keeping the cue tip
  // anchored to the current cue-ball contact point.
  if(state.pool.reaching){
    const mx=Number(e.movementX)||0;
    if(mx){
      state.pool.cueReach=THREE.MathUtils.clamp(
        (state.pool.cueReach||0)+mx*.0065,
        -1,1
      );
      updateHeldPoolCue();
      updatePoolAimGuide();
    }
    return;
  }

  // When LMB is not held, do not touch mouse movement at all.
  // A-Frame owns it completely for normal first-person looking/walking.
  if(!state.pool.gripping)return;

  // Lock the view for the whole stroke. Some browsers/A-Frame builds can still
  // receive pointer deltas after look-controls is disabled, so restore the
  // exact grip-start camera orientation on every stroke movement.
  const gripCam=camera();
  if(gripCam&&state.pool.gripViewQuaternion){
    gripCam.object3D.quaternion.copy(state.pool.gripViewQuaternion);
  }

  const now=performance.now();
  const dt=Math.max(4,Math.min(60,now-(state.pool.lastMouseStamp||now)));
  state.pool.lastMouseStamp=now;

  // Fine left/right cue adjustment while the view is locked.
  if(e.movementX){
    state.pool.fineYaw=THREE.MathUtils.clamp(
      state.pool.fineYaw+e.movementX*.0013,
      -.24,.24
    );
  }

  const dy=Number(e.movementY)||0;

  if(dy>0){
    // Pull mouse toward yourself -> cue comes visibly backward.
    state.pool.cuePull=Math.min(.70,state.pool.cuePull+dy*.0022);
    state.pool.maxCuePull=Math.max(state.pool.maxCuePull,state.pool.cuePull);
    state.pool.forwardPeak=0;
  }else if(dy<0&&state.pool.cuePull>0){
    // Push forward. Very small movements now produce correspondingly soft hits.
    const before=state.pool.cuePull;
    state.pool.cuePull=Math.max(0,state.pool.cuePull+dy*.0036);

    const pixelsPerMs=(-dy)/dt;
    state.pool.forwardPeak=Math.max(state.pool.forwardPeak,pixelsPerMs);

    if(before>.010&&state.pool.cuePull<=.003&&state.pool.maxCuePull>=.035){
      // Far less aggressive than the old mapping: both backswing distance
      // and forward stroke speed matter.
      const physicalSpeed=Math.max(.10,Math.min(7.2,state.pool.forwardPeak*1.72));
      shootPool(physicalSpeed);
      return;
    }
  }

  updatePoolPowerMeter();
  updatePoolAimGuide();
}


window.PixelB8LegacyPoolController={
  mount({
    hostId='poolHost',
    centerX=0,
    centerZ=0,
    initializeUI=true
  }={}){
    const host=document.getElementById(hostId);
    if(!host)throw new Error(`Missing pool host: ${hostId}`);

    POOL.centerX=Number(centerX)||0;
    POOL.centerZ=Number(centerZ)||0;

    buildPoolTable();
    resetPoolRules();
    resetPoolBalls();

    if(initializeUI&&!window.__pixelb8LegacyPoolUIReady){
      initPlayerUI();
      window.__pixelb8LegacyPoolUIReady=true;
    }

    updatePoolRulesHud();
    updatePoolPocketedHud();
    updateHeldPoolTool();

    return this;
  },

  enter(){enterPoolMode();},
  exit(){exitPoolMode();},
  reset(){poolAutoRack();},
  tick(delta){updatePoolPhysics(delta);},
  tickPlayer(time,delta){
    updatePlayer(time,delta);
    resolveStaticCollisions();
    updateHeldPoolTool();
  },

  beginGrip(e){return beginPoolGrip(e);},
  endGrip(e){return endPoolGrip(e);},
  mouseMove(e){return handlePoolMouseMove(e);},
  beginReach(e){return beginPoolReach(e);},
  endReach(e){return endPoolReach(e);},

  setInventoryOpen(open){setInventoryOpen(open);},
  toggleInventory(){setInventoryOpen(!state.player.inventoryOpen);},
  selectHotbar(slot,use=true){selectHotbarSlot(slot,use);},

  isActive(){return state.pool.active;},
  isInventoryOpen(){return state.player.inventoryOpen;},
  isNearTable(){return isPlayerNearPoolTable();},

  addLegacyInventoryItem(item){
    if(!item)return false;
    if(state.inventory.some(existing=>existing?.uid&&existing.uid===item.uid))return false;
    if(state.inventory.length>=24)return false;
    state.inventory.push(item);
    renderInventory();
    return true;
  },

  removeLegacyInventoryItem(uid){
    const index=state.inventory.findIndex(item=>item?.uid===uid);
    if(index<0)return null;
    const [item]=state.inventory.splice(index,1);
    renderInventory();
    return item;
  },

  getLegacyInventory(){return [...state.inventory];},
  getState(){return state;},
  getPoolConstants(){return POOL;}
};

AFRAME.registerComponent('arcade-world',{
  init(){
    buildArcade();
    buildDungeonEntrance();
    setupEmbeddedGames();
    initPlayerUI();
    initGlobalChat();
    setTimeout(()=>ensureArcadeCueRackAsset(),0);

    window.addEventListener('mousemove',handlePoolMouseMove,{passive:true});
    window.addEventListener('mousedown',e=>{
      if(e.button===1){
        e.preventDefault();
        standStraight();
        return;
      }
      if(e.button===2&&beginPoolReach(e))return;
      beginPoolGrip(e);
    },true);

    window.addEventListener('mouseup',e=>{
      if(e.button===2){
        endPoolReach(e);
        return;
      }
      endPoolGrip(e);
    },true);

    window.addEventListener('contextmenu',e=>{
      if(state.pool.active&&state.pool.tool==='cue'){
        e.preventDefault();
      }
    },true);

    window.addEventListener('wheel',e=>{
      if(isEditableTarget(e.target))return;

      if(e.shiftKey){
        e.preventDefault();
        if(state.player.sitting)return;
        // Shift+wheel keeps its existing posture control.
        const step=Math.sign(e.deltaY)*.10;
        setCrouchAmount(state.player.crouchAmount+step);
        return;
      }

      // While playing pool, plain wheel manually raises/lowers the cue butt.
      // Wheel up raises; wheel down lowers. Physical table collision remains
      // the minimum height, so lowering can never force the cue through a rail.
      if(
        state.pool.active &&
        !state.pool.shotInProgress &&
        !state.pool.rules?.ballInHand &&
        state.pool.tool==='cue' &&
        isPlayerNearPoolTable()
      ){
        e.preventDefault();
        const delta=e.deltaY<0?.025:-.025;
        state.pool.cueElevation=THREE.MathUtils.clamp(
          (state.pool.cueElevation||0)+delta,
          -.04,.48
        );
        updateHeldPoolCue();
        updatePoolAimGuide();
      }
    },{passive:false,capture:true});

    window.addEventListener('keydown',e=>{
      // Inputs own their keys. This is especially important for MQTT chat:
      // Enter sends the message instead of entering a cabinet or reaching the game.
      if(isEditableTarget(e.target))return;

      if(state.pool.active&&e.key==='Backspace'){
        e.preventDefault();
        exitPoolMode();
        return;
      }

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

      if(!state.player.sitting)state.player.keys.add(e.code);

      if(e.key==='Enter'&&interactArcadeCueRack()){
        e.preventDefault();
        return;
      }

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

      if(e.key.toLowerCase()==='l'){
        e.preventDefault();
        toggleLean();
        return;
      }

      if(e.key.toLowerCase()==='x'){
        e.preventDefault();
        toggleSit();
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
        else if(type==='pool')interact({type,id:ident,title:'Pool Table'});
        else if(type)interact({type,id:ident,title:type});
      });
    });
  },
  tick(time,delta){
    updatePlayer(time,delta);
    updatePoolPhysics(delta);
    resolveStaticCollisions();
    syncCabinetHardware();

    if(state.pool.active&&!state.pool.gripping){
      // Aim marker follows normal free-look without intercepting mouse input.
      updatePoolAimGuide();
    }
    updateHeldPoolTool();

    for(const rec of state.gameTextures.values()){
      rec.texture.needsUpdate=true;
    }

    updateArcadeCueRackFocus();

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

function returnFocusToWorld({lockPointer=true}={}){
  const active=document.activeElement;
  if(active&&typeof active.blur==='function')active.blur();

  const canvas=document.querySelector('#xrScene canvas');
  if(
    lockPointer &&
    state.pool.active &&
    !state.player.inventoryOpen &&
    document.pointerLockElement!==canvas &&
    window.PIXELB8_ALLOW_POINTER_LOCK!==false
  ){
    try{canvas?.requestPointerLock?.();}catch{}
  }
}

document.getElementById('poolTrajectoryToggle')?.addEventListener('change',e=>{
  state.pool.trajectory=Boolean(e.target.checked);
  if(state.pool.active){
    updatePoolAimGuide();
    if(state.pool.lastAim)updatePoolAimVisuals(state.pool.lastAim);
  }
  returnFocusToWorld();
});

document.getElementById('poolAutoRackBtn')?.addEventListener('click',e=>{
  e.preventDefault();
  poolAutoRack();
});

document.getElementById('poolManualRackBtn')?.addEventListener('click',e=>{
  e.preventDefault();
  enterManualRackMode();
});

document.getElementById('poolManualRackClose')?.addEventListener('click',e=>{
  e.preventDefault();
  exitManualRackMode(true);
});

document.getElementById('poolRackClearBtn')?.addEventListener('click',e=>{
  e.preventDefault();
  state.pool.manualRack.slots=Array(15).fill(null);
  state.pool.manualRack.selectedBall=null;
  for(const ball of state.pool.balls)if(ball.n!==0)ball.pocketed=true;
  renderManualRackPanel();
  renderPoolBalls(false);
});

document.getElementById('poolRackFinishBtn')?.addEventListener('click',e=>{
  e.preventDefault();
  finishManualRack();
});

document.getElementById('poolCallSolids')?.addEventListener('click',e=>{
  e.preventDefault();
  callPoolGroup('solids');
});

document.getElementById('poolCallStripes')?.addEventListener('click',e=>{
  e.preventDefault();
  callPoolGroup('stripes');
});

document.getElementById('poolHud')?.addEventListener('click',e=>{
  const control=e.target?.closest?.('button,input[type="checkbox"],input[type="radio"]');
  if(!control)return;
  setTimeout(()=>returnFocusToWorld(),0);
});

document.getElementById('poolManualRackPanel')?.addEventListener('click',e=>{
  const control=e.target?.closest?.('button,input[type="checkbox"],input[type="radio"]');
  if(!control)return;
  setTimeout(()=>returnFocusToWorld({lockPointer:false}),0);
});

document.getElementById('arcade2dBtn')?.addEventListener('click',()=>location.href='../index.html');
document.getElementById('controlsBtn')?.addEventListener('click',()=>document.getElementById('controlsPanel').classList.remove('hidden'));
document.getElementById('controlsClose')?.addEventListener('click',()=>document.getElementById('controlsPanel').classList.add('hidden'));
document.getElementById('controlsPanel')?.addEventListener('click',e=>{
  if(e.target.id==='controlsPanel')e.currentTarget.classList.add('hidden');
});
