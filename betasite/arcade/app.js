const ROOM_ROOT='pixelb8/arcade/v3';
const ROOM_BROKER='wss://broker.hivemq.com:8884/mqtt';

const GAMES=[
  // Single-player modular games from the legacy arcade.
  {id:'outdrive',title:'Out Drive',type:'single',path:'assets/games/singleplayer/outdrive/index.html',mark:'OD',accent:'rgba(79,195,247,.30)',description:'Classic PixelB8 driving cabinet.'},
  {id:'decman',title:'DECman',type:'single',path:'assets/games/singleplayer/decman/index.html',mark:'DEC',accent:'rgba(244,189,97,.28)',description:'Retro maze-action cabinet with level tooling.'},
  {id:'entropydrifter',title:'Entropy Drifter',type:'single',path:'assets/games/singleplayer/entropydrifter/index.html',mark:'ED',accent:'rgba(153,116,255,.28)',description:'Legacy arcade drifter experiment.'},
  {id:'cyrenerangers',title:'Cyrene Rangers',type:'single',path:'assets/games/singleplayer/cyrenerangers/index.html',mark:'CR',accent:'rgba(57,217,138,.25)',description:'PixelB8 single-player ranger cabinet.'},
  {id:'spacepirates',title:'Space Pirates',type:'single',path:'assets/games/singleplayer/spacepirates/index.html',mark:'SP',accent:'rgba(79,195,247,.24)',description:'Old-school space piracy arcade game.'},
  {id:'leisuresuitlooter',title:'Leisure Suit Looter',type:'single',path:'assets/games/singleplayer/liesuresuitlooter/index.html',mark:'LSL',accent:'rgba(255,105,120,.23)',description:'One of the original oddball PixelB8 cabinets.'},

  // Multiplayer games. directoryId matches ArcadeMultiplayer.init(gameId).
  {id:'checkers',directoryId:'checkers',title:'Checkers',type:'multi',path:'assets/games/multiplayer/checkers/index.html',mark:'CHK',accent:'rgba(244,189,97,.24)',description:'Online checkers using the shared PixelB8 room transport.'},
  {id:'connect4',directoryId:'connect4',title:'Connect 4',type:'multi',path:'assets/games/multiplayer/connect4/index.html',mark:'C4',accent:'rgba(255,105,120,.25)',description:'Quick online Connect 4 tables.'},
  {id:'deckofcards',directoryId:'cardhouse',title:'Deck of Cards',type:'multi',path:'assets/games/multiplayer/deckofcards/index.html',mark:'CARDS',accent:'rgba(153,116,255,.25)',description:'Multiplayer card-house sandbox.'},
  {id:'gridrunner',directoryId:'gridrunner',title:'Grid Runner',type:'multi',path:'assets/games/multiplayer/gridrunner/index.html',mark:'GRID',accent:'rgba(57,217,138,.24)',description:'PixelB8 multiplayer grid-running original.'},
  {id:'neonfleet',directoryId:'neonfleet',title:'Neon Fleet',type:'multi',path:'assets/games/multiplayer/neonfleet/index.html',mark:'NF',accent:'rgba(79,195,247,.31)',description:'Neon multiplayer fleet battles.'},
  {id:'lootsnatcher',directoryId:'lootsnatcher',title:'Loot Snatcher',type:'multi',path:'assets/games/multiplayer/lootsnatcher/index.html',mark:'LS',accent:'rgba(244,189,97,.28)',description:'Compete for loot in this multiplayer PixelB8 original.'},
  {id:'suscomtcg',directoryId:'suscomtcg',title:'SUSCOM: TCG',type:'multi',path:'assets/games/multiplayer/suscomtcg/index.html',mark:'TCG',accent:'rgba(153,116,255,.28)',description:'Entropia-inspired multiplayer trading-card battle.'},
  {id:'outdrive2',directoryId:'outdrive2',title:'Out Drive 2',type:'multi',path:'assets/games/multiplayer/outdrive2/index.html',mark:'OD2',accent:'rgba(79,195,247,.28)',description:'The multiplayer evolution of Out Drive.'},
  {id:'riftcommand',directoryId:'riftcommand',title:'Rift Command',type:'multi',path:'assets/games/multiplayer/riftcommand/index.html',mark:'RC',accent:'rgba(57,217,138,.28)',description:'Turn-based multiplayer tactical operations.'},
  {id:'fishing',directoryId:'fishing',title:'Fishing',type:'multi',path:'assets/games/multiplayer/fishing/index.html',mark:'FISH',accent:'rgba(79,195,247,.22)',description:'Relaxed multiplayer fishing table.'},
  {id:'lootgauntlet',directoryId:'lootgauntlet',title:'Loot Gauntlet',type:'multi',path:'assets/games/multiplayer/lootgauntlet/index.html',mark:'LG',accent:'rgba(244,189,97,.27)',description:'Multiplayer loot challenge.'},
  {id:'comppetclash',directoryId:'comppetclash',title:'Competitive Pet Clash',type:'multi',path:'assets/games/multiplayer/comppetclash/index.html',mark:'PET',accent:'rgba(255,105,120,.23)',description:'Legacy competitive pet battle table.'}
];

const FAVORITES_KEY='pixelb8_arcade_favorites_v2';
const RECENT_KEY='pixelb8_arcade_recent_v2';
const SIDEBAR_KEY='pixelb8_arcade_sidebar_v2';

let currentView='home';
let activeGame=null;
let rooms=new Map();
let roomClient=null;
let directoryOnline=false;
let pruneTimer=null;

const byId=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function safeArray(key){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return[]}}
function setArray(key,value){localStorage.setItem(key,JSON.stringify(value))}
function favorites(){return safeArray(FAVORITES_KEY)}
function recent(){return safeArray(RECENT_KEY)}

function toggleSidebar(){
  const shell=byId('appShell');
  const collapsed=shell.classList.toggle('sidebar-collapsed');
  byId('sidebarToggleBtn').textContent=collapsed?'›':'‹';
  localStorage.setItem(SIDEBAR_KEY,collapsed?'1':'0');
}
function toggleMore(){
  PixelB8Shell.toggleMore('#pixelb8More');
}
function switchView(view){
  currentView=view;
  document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id===`${view}View`));
  document.querySelectorAll('.sidebar-nav-btn[data-view]').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===view));
  const title={home:'Arcade',single:'Single Player',multi:'Multiplayer',rooms:'Live Rooms',favorites:'Favorites',recent:'Recently Played',cabinet:activeGame?.title||'Cabinet'}[view]||'Arcade';
  byId('pageTitle').textContent=title;
  if(view!=='cabinet')renderLibraryViews();
}
function searchTerm(){return (byId('sidebarSearch')?.value||'').trim().toLowerCase()}
function filtered(type=null){
  const q=searchTerm();
  return GAMES.filter(g=>(!type||g.type===type)&&(!q||`${g.title} ${g.description} ${g.id}`.toLowerCase().includes(q)));
}
function roomCount(game){
  return [...rooms.values()].filter(r=>r.arcadeGameId===game.id&&!isArchived(r)).length;
}
function gameCard(game){
  const fav=favorites().includes(game.id);
  const count=game.type==='multi'?roomCount(game):0;
  return `<article class="game-card">
    <div class="game-art" style="--card-accent:${game.accent}">
      <span class="game-mark">${esc(game.mark)}</span>
      <span class="game-type">${game.type==='multi'?'Multiplayer':'Single Player'}</span>
      <button class="favorite-btn ${fav?'active':''}" onclick="event.stopPropagation();toggleFavorite('${game.id}')" title="Favorite">${fav?'★':'☆'}</button>
    </div>
    <div class="game-body">
      <h4>${esc(game.title)}</h4>
      <p>${esc(game.description)}</p>
      <div class="game-meta">
        <span>${game.type==='multi'?'Online table':'Arcade cabinet'}</span>
        ${game.type==='multi'?`<span class="room-badge ${count?'visible':''}">${count} room${count===1?'':'s'}</span>`:''}
      </div>
      <div class="game-actions">
        <button class="btn primary" onclick="launchGame('${game.id}')">${game.type==='multi'?'Open Table':'Play'}</button>
        ${game.type==='multi'?`<button class="btn" onclick="switchView('rooms')">Rooms</button>`:''}
      </div>
    </div>
  </article>`;
}
function renderLibraryViews(){
  const singles=filtered('single');
  const multis=filtered('multi');
  byId('singleGrid').innerHTML=singles.length?singles.map(gameCard).join(''):'<div class="empty-state">No matching cabinets.</div>';
  byId('multiGrid').innerHTML=multis.length?multis.map(gameCard).join(''):'<div class="empty-state">No matching multiplayer games.</div>';
  byId('singleCount').textContent=`${singles.length} cabinet${singles.length===1?'':'s'}`;
  byId('multiCount').textContent=`${multis.length} table${multis.length===1?'':'s'}`;

  byId('homeSingleGrid').innerHTML=GAMES.filter(g=>g.type==='single').slice(0,4).map(gameCard).join('');
  byId('homeMultiGrid').innerHTML=GAMES.filter(g=>g.type==='multi').slice(0,4).map(gameCard).join('');

  const favIds=favorites();
  const favGames=GAMES.filter(g=>favIds.includes(g.id));
  byId('favoritesGrid').innerHTML=favGames.length?favGames.map(gameCard).join(''):'<div class="empty-state">No favorites yet.</div>';

  const recGames=recent().map(id=>GAMES.find(g=>g.id===id)).filter(Boolean);
  byId('recentGrid').innerHTML=recGames.length?recGames.map(gameCard).join(''):'<div class="empty-state">No games played yet.</div>';
  byId('homeRecentList').innerHTML=recGames.length?recGames.slice(0,6).map(g=>`<div class="simple-row"><b>${esc(g.title)}</b><span>${g.type==='multi'?'Multiplayer':'Single Player'}</span></div>`).join(''):'<div class="muted" style="padding:8px">No games played yet.</div>';
}
function toggleFavorite(id){
  const ids=favorites();
  const i=ids.indexOf(id);
  if(i>=0)ids.splice(i,1); else ids.unshift(id);
  setArray(FAVORITES_KEY,ids);
  renderLibraryViews();
}
function rememberRecent(id){
  const ids=recent().filter(x=>x!==id);
  ids.unshift(id);
  setArray(RECENT_KEY,ids.slice(0,12));
}
function launchGame(id,launch={}){
  const game=GAMES.find(g=>g.id===id);
  if(!game)return;
  activeGame=game;
  rememberRecent(id);
  byId('cabinetTitle').textContent=game.title;
  const params=new URLSearchParams();
  if(launch.room)params.set('room',launch.room);
  if(launch.role)params.set('role',launch.role);
  byId('cabinetFrame').src=`${game.path}${params.size?`?${params}`:''}`;
  switchView('cabinet');
}
function closeCabinet(){
  byId('cabinetFrame').src='about:blank';
  activeGame=null;
  switchView('home');
}
function openCabinetNewTab(){
  if(!activeGame)return;
  const src=byId('cabinetFrame').src;
  window.open(src,'_blank','noopener');
}

function notify(message){
  const el=document.createElement('div');
  el.className='toast';el.textContent=message;
  byId('toastHost').appendChild(el);
  setTimeout(()=>el.remove(),2800);
}

function gameForDirectory(directoryId){
  return GAMES.find(g=>g.type==='multi'&&(g.directoryId||g.id)===directoryId);
}
function isArchived(room){return room.archived||room.status==='closed'||room.status==='finished'}
function refreshDirectory(){
  if(!roomClient){initDirectory();return}
  try{roomClient.subscribe(`${ROOM_ROOT}/+/rooms/+`)}catch{}
  notify('Refreshing multiplayer rooms…');
  renderRooms();
}
function initDirectory(){
  if(typeof mqtt==='undefined'){
    setDirectoryState(false,'MQTT library unavailable');
    return;
  }
  if(roomClient)return;
  roomClient=mqtt.connect(ROOM_BROKER,{
    clientId:`P8_ARCADE_HOME_${Math.random().toString(36).slice(2,12)}`,
    clean:true,reconnectPeriod:3000,connectTimeout:10000
  });
  roomClient.on('connect',()=>{
    directoryOnline=true;
    roomClient.subscribe(`${ROOM_ROOT}/+/rooms/+`);
    setDirectoryState(true,'Live room directory connected');
  });
  roomClient.on('reconnect',()=>setDirectoryState(false,'Reconnecting to arcade rooms…'));
  roomClient.on('offline',()=>setDirectoryState(false,'Room directory offline'));
  roomClient.on('close',()=>setDirectoryState(false,'Room directory disconnected'));
  roomClient.on('error',err=>setDirectoryState(false,`Directory error: ${err.message}`));
  roomClient.on('message',handleRoomMessage);
  pruneTimer=setInterval(pruneRooms,5000);
}
function handleRoomMessage(topic,payload){
  const parts=topic.split('/');
  if(parts.length<6||parts[0]!=='pixelb8'||parts[1]!=='arcade'||parts[2]!=='v3'||parts[4]!=='rooms')return;
  const directoryId=parts[3];
  const code=parts[5];
  const game=gameForDirectory(directoryId);
  if(!game)return;
  const key=`${directoryId}:${code}`;
  const text=payload.toString();
  if(!text){rooms.delete(key);renderRooms();return}
  try{
    const room=JSON.parse(text);
    const visible=room.expiresAt?room.expiresAt>Date.now():(room.updatedAt||0)>Date.now()-35000;
    if(visible)rooms.set(key,{...room,arcadeGameId:game.id,arcadeTitle:game.title});
    else rooms.delete(key);
    renderRooms();
  }catch{}
}
function pruneRooms(){
  let changed=false;
  const now=Date.now();
  for(const [key,room] of rooms){
    const expired=room.expiresAt?now>=room.expiresAt:(room.updatedAt||0)<now-35000;
    if(expired){rooms.delete(key);changed=true}
  }
  if(changed)renderRooms();
}
function setDirectoryState(online,text){
  directoryOnline=online;
  ['directoryDot','homeDirectoryDot'].forEach(id=>byId(id)?.classList.toggle('online',online));
  byId('directoryText').textContent=text;
  byId('homeDirectoryText').textContent=text;
}
function renderRooms(){
  const list=[...rooms.values()].sort((a,b)=>{
    const order={waiting:0,playing:1,finished:2,closed:3};
    return (order[a.status]??9)-(order[b.status]??9)||(b.updatedAt||0)-(a.updatedAt||0);
  });
  const live=list.filter(r=>!isArchived(r));
  byId('headerRoomCount').textContent=live.length;
  const rail=byId('railRoomCount');
  rail.textContent=live.length;
  rail.classList.toggle('visible',live.length>0);

  byId('homeRoomSummary').textContent=live.length
    ?`${live.length} live room${live.length===1?'':'s'} · ${[...new Set(live.map(r=>r.arcadeTitle))].slice(0,4).join(' · ')}`
    :'No rooms are open right now. Open a multiplayer table to host one.';

  const host=byId('roomGrid');
  if(!list.length){
    host.innerHTML='<div class="empty-state">No multiplayer rooms are open right now. Launch a multiplayer game to host one.</div>';
  }else{
    host.innerHTML=list.map(room=>{
      const archived=isArchived(room);
      const full=(room.playerCount||0)>=(room.maxPlayers||99);
      const canJoin=!archived&&!full&&room.status!=='playing';
      return `<article class="room-card">
        <div class="room-head">
          <div class="room-title"><b>${esc(room.arcadeTitle)}</b><span>${esc(room.name||'Open Table')} · ${esc(room.code)}</span></div>
          <span class="room-status ${archived?'closed':esc(room.status||'waiting')}">${archived?'MATCH OVER':esc(room.status||'waiting')}</span>
        </div>
        <div class="room-meta"><span>${room.playerCount||0}/${room.maxPlayers||'?'} players</span><span>${room.spectators||0} watching</span><span>${room.hostName?`Host: ${esc(room.hostName)}`:''}</span></div>
        <div class="room-players">${(room.players||[]).map((p,i)=>`<span class="player-chip">${i===0?'♛ ':''}${esc(p.name)}${p.status?` · ${esc(p.status)}`:''}</span>`).join('')}</div>
        ${archived&&room.result?`<div class="muted">${esc(room.result)}</div>`:''}
        <div class="room-actions">
          <button class="btn primary" ${canJoin?'':'disabled'} onclick="joinRoom('${esc(room.arcadeGameId)}','${esc(room.code)}','player')">${archived?'Closed':full?'Full':room.status==='playing'?'In Progress':'Join Room'}</button>
          ${archived?'':`<button class="btn" onclick="joinRoom('${esc(room.arcadeGameId)}','${esc(room.code)}','spectator')">Watch</button>`}
        </div>
      </article>`;
    }).join('');
  }
  renderLibraryViews();
}
function joinRoom(gameId,code,role){
  launchGame(gameId,{room:code,role});
  notify(role==='spectator'?`Opening ${code} as spectator.`:`Opening room ${code}.`);
}

document.addEventListener('DOMContentLoaded',()=>{
  if(localStorage.getItem(SIDEBAR_KEY)==='1'){
    byId('appShell').classList.add('sidebar-collapsed');
    byId('sidebarToggleBtn').textContent='›';
  }
  renderLibraryViews();
  initDirectory();
});



document.addEventListener('DOMContentLoaded',()=>{
  PixelB8Shell.initRightRail();
  PixelB8Shell.bindVerticalResizer({
    element:'[data-pixelb8-right-resizer]',
    cssVariable:'--pixelb8-right-expanded',
    storageKey:'pixelb8_shared_right_width_v1',
    defaultWidth:248,
    minWidth:210,
    maxWidth:460,
    invert:true,
    enabled:()=>document.querySelector('[data-pixelb8-shell]')?.classList.contains('social-expanded')
  });
});
