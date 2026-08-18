(() => {
  'use strict';
  const GAME_ID = 'entropiarift';
  const MAX_PLAYERS = 4;
  const COLORS = ['#56f3d2','#ffd160','#ff7395','#8ea6ff'];
  const transport = window.ArcadeMultiplayer;
  const query = new URLSearchParams(location.search);
  const app = document.getElementById('app');
  const canvas = document.getElementById('stars');
  const ctx = canvas.getContext('2d');
  let screen = 'title', rooms = [], roster = [], roomCode = '', isHost = false, role = 'player';
  let playerName = localStorage.getItem('rift_command_name') || `COLONIST_${Math.floor(1000 + Math.random() * 9000)}`;
  let statusText = 'Connecting to the Calypso command relay…';
  let game = null, selectedId = '', modal = '', fxText = '', toastTimer = 0, fxTimer = 0;
  let actionCounter = 0, rejectionTarget = '';
  const processed = new Set();
  const stars = Array.from({length:170},(_,i)=>({x:Math.random(),y:Math.random(),r:.4+Math.random()*1.7,p:i*.7}));

  function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function safeName(value){return String(value||'').replace(/[^\w \-]/g,'').trim().slice(0,18)||`COLONIST_${Math.floor(1000+Math.random()*9000)}`;}
  function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
  function clientId(){return transport?.getClientId()||'LOCAL';}
  function playersInRoom(){return roster.filter(p=>p.role!=='spectator').slice(0,MAX_PLAYERS);}
  function activePlayer(){return game?.players.find(p=>p.id===game.activeId)||null;}
  function me(){return game?.players.find(p=>p.id===clientId())||null;}
  function canAct(){return game&&!game.complete&&role!=='spectator'&&game.activeId===clientId();}
  function target(){return game?.enemies.find(e=>e.id===selectedId)||game?.players.find(p=>p.id===selectedId)||null;}
  function rand(min,max){return min+Math.random()*(max-min);}
  function int(min,max){return Math.floor(rand(min,max+1));}
  function toast(text){const el=document.querySelector('.toast');if(!el)return;el.textContent=text;el.classList.add('show');toastTimer=2.2;}
  function showFx(text){fxText=text;fxTimer=.75;renderFx();}
  function renderFx(){let el=document.querySelector('.fx');if(!fxText){el?.remove();return;}if(!el){el=document.createElement('div');el.className='fx';document.querySelector('.shell')?.appendChild(el);}el.textContent=fxText;}

  function drawSpace(time=0){
    const dpr=Math.min(devicePixelRatio||1,2),w=innerWidth,h=innerHeight;
    if(canvas.width!==w*dpr||canvas.height!==h*dpr){canvas.width=w*dpr;canvas.height=h*dpr;canvas.style.width=w+'px';canvas.style.height=h+'px';}
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#020507';ctx.fillRect(0,0,w,h);
    const g=ctx.createRadialGradient(w*.5,h*.55,0,w*.5,h*.55,Math.max(w,h)*.7);g.addColorStop(0,'#09252a');g.addColorStop(.45,'#041116');g.addColorStop(1,'#010305');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
    for(const s of stars){const a=.35+.5*Math.sin(time*.001+s.p);ctx.globalAlpha=a;ctx.fillStyle='#cafff5';ctx.beginPath();ctx.arc(s.x*w,s.y*h,s.r,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
  }

  function titleMarkup(){
    return `<div class="shell"><div class="screen center"><div class="planet"></div><div class="hero">
      <div class="eyebrow">PixelB8 Arcade presents</div><h1>Rift<br>Command</h1><div class="subtitle">An Entropia tactical operation</div>
      <p class="copy">A 2–4 colonist turn-based hunt built for tactical choices—not twitch reflexes. Manage ammunition, armor and Mindforce, hunt Calypso creatures for Rift Cells, awaken the Titan and extract with the PED.</p>
      <div class="btnrow"><button class="btn primary" data-action="lobby">Enter Command</button><button class="btn" data-action="rules">How to Play</button></div>
      <p class="meta" style="margin-top:20px">${escapeHtml(statusText)}</p></div></div><div class="toast"></div></div>`;
  }
  function rulesMarkup(){
    return `<div class="modal"><div class="card"><div class="eyebrow">Field Manual // Calypso</div><h2>How to Play</h2>
      <div class="brief"><b>THE OPERATION</b><p>Each colonist receives 3 AP on their turn. Hunt creatures to earn simulated PED and Rift Cells. Move to the central lane and spend four Cells to charge the Rift. Defeat the Titan, return to the middle lane and extract before round 12 ends.</p></div>
      <div class="brief"><b>TACTICAL ORDERS</b><p>Laser Shot is reliable. Aimed Shot hits hard. Mindforce attacks every enemy in your lane. FAP heals, Guard absorbs damage, Reload restores ammo, and Mining can uncover PED—or another creature. Select a downed teammate and use Revive.</p></div>
      <div class="brief"><b>CREATURE PHASE</b><p>After every colonist has acted, surviving creatures retaliate. Armor absorbs damage first. If everyone is downed or the Rift collapses after round 12, the operation fails.</p></div>
      <div class="btnrow" style="margin-top:18px"><button class="btn primary" data-action="close-modal">Understood</button></div></div></div>`;
  }
  function roomListMarkup(){
    const open=rooms.filter(r=>r.status==='waiting'||r.status==='playing'||r.status==='finished');
    if(!open.length)return `<div class="empty">NO ACTIVE RIFT OPERATIONS<br>Host one and become squad commander.</div>`;
    return `<div class="roomlist">${open.map(r=>`<div class="room"><div><b>${escapeHtml(r.name||`Operation ${r.code}`)}</b><div class="meta">${r.code} · ${r.playerCount||0}/${r.maxPlayers||4} colonists · ${escapeHtml(r.status||'waiting')}</div>${r.result?`<div class="meta" style="color:#d5b65c">${escapeHtml(r.result)}</div>`:''}</div><div class="btnrow">${r.status==='waiting'?`<button class="btn primary" data-join="${r.code}">Join</button>`:''}<button class="btn" data-watch="${r.code}">Watch</button></div></div>`).join('')}</div>`;
  }
  function rosterMarkup(){
    if(!roster.length)return `<div class="empty">Waiting for colonists…</div>`;
    return `<div class="roster">${roster.map(p=>`<div class="person"><div><b>${p.id===transport?.getHostId()?'♛ ':''}${escapeHtml(p.name)}</b><div class="meta">${p.role==='spectator'?'SPECTATOR':escapeHtml(p.status||'READY')}</div></div><span style="color:${p.role==='spectator'?'#78959b':'#62ee86'}">●</span></div>`).join('')}</div>`;
  }
  function lobbyMarkup(){
    const inRoom=Boolean(roomCode), count=playersInRoom().length;
    return `<div class="shell"><div class="screen"><div class="topbar"><div class="brand">RIFT COMMAND<small>CALYPSO TACTICAL NETWORK</small></div><button class="btn" data-action="title">Title</button><div class="roomtag"><i class="online"></i>${inRoom?`OPERATION ${roomCode}`:'RELAY ONLINE'}</div></div>
      <div class="lobbybody"><section class="pane"><h2>${inRoom?'SQUAD ASSEMBLY':'OPEN OPERATIONS'}</h2><div class="status">${escapeHtml(statusText)}</div>
      ${inRoom?`<div class="label">Connected personnel</div>${rosterMarkup()}<div class="brief"><b>OBJECTIVE</b><p>Secure four Rift Cells, charge the central anomaly, defeat the Rift Titan and extract before round 12.</p></div>
        <div class="btnrow" style="margin-top:14px">${isHost?`<button class="btn gold" data-action="start" ${count<2?'disabled':''}>${count<2?'Waiting for 2 players':'Launch Operation'}</button>`:''}<button class="btn danger" data-action="leave">Leave</button></div>`:
        `<div class="label">Colonist callsign</div><input class="input" id="name" maxlength="18" value="${escapeHtml(playerName)}">
         <div class="btnrow" style="justify-content:flex-start;margin:10px 0 18px"><button class="btn gold" data-action="host">Host Operation</button></div>
         <div class="label">Join by room code</div><div class="btnrow" style="justify-content:flex-start"><input class="input" id="code" maxlength="6" placeholder="ROOM CODE" style="max-width:190px"><button class="btn primary" data-action="join-code">Join</button><button class="btn" data-action="watch-code">Watch</button></div>
         <div class="label">Arcade room directory</div>${roomListMarkup()}`}</section>
      <aside class="pane"><h2>FIELD BRIEFING</h2><div class="brief"><b>TURN-BASED CO-OP</b><p>MQTT only carries decisions and compact match states. Network delay cannot make aiming or movement stutter.</p></div><div class="brief"><b>COMPETE WHILE COOPERATING</b><p>The squad shares the objective, but PED, kills, revives and score determine the final ranking.</p></div><div class="brief"><b>2–4 PLAYERS + SPECTATORS</b><p>Late arrivals can observe an operation already underway.</p></div><button class="btn" data-action="rules">Review Rules</button></aside></div></div>${modal==='rules'?rulesMarkup():''}<div class="toast"></div></div>`;
  }

  function createPlayer(person,index){
    return {id:person.id,name:person.name,color:COLORS[index],lane:index%3,hp:100,maxHp:100,armor:35,maxArmor:50,ammo:6,energy:3,probes:3,cells:0,ped:0,score:0,kills:0,revives:0,damage:0,guard:0,downed:false,extracted:false,connected:true};
  }
  function createEnemy(type='atrox',lane=int(0,2)){
    const boss=type==='titan', drone=type==='drone', id=`E${game.nextId++}`;
    return {id,type,lane,name:boss?'RIFT TITAN':drone?'GENERATION 01 DRONE':'ATROX YOUNG',hp:boss?260+game.players.length*65:drone?62:82,maxHp:boss?260+game.players.length*65:drone?62:82,damage:boss?22:drone?13:16,armor:boss?5:drone?3:0,boss};
  }
  function addLog(text){game.log.unshift(text);game.log=game.log.slice(0,12);}
  function startGame(){
    if(!isHost||playersInRoom().length<2)return;
    game={id:`${roomCode}-${Date.now().toString(36)}`,phase:'hunt',round:1,maxRounds:12,activeId:'',ap:3,rifts:0,complete:false,success:false,nextId:1,players:playersInRoom().map(createPlayer),enemies:[],log:[],acted:[],turnDeadline:0,lastAction:'',lastActionAt:0};
    for(let i=0;i<4+game.players.length;i++)game.enemies.push(createEnemy(i%3===2?'drone':'atrox',i%3));
    game.activeId=game.players[0].id;game.turnDeadline=Date.now()+60000;addLog(`${game.players[0].name} has first command.`);
    screen='game';modal='briefing';selectedId=game.enemies[0]?.id||'';
    transport.publish('GAME_START',{matchId:game.id});publishState();
    transport.updateRoom({status:'playing',mode:'turn-based-tactics',phase:'hunt',archived:false,expiresAt:null});
    transport.updatePresence({status:'deployed'});render();
  }
  function stateCopy(){return JSON.parse(JSON.stringify(game));}
  function publishState(targetId=''){if(!isHost||!game)return;transport.publish('STATE',{targetId:targetId||undefined,matchId:game.id,state:stateCopy()});}
  function requestState(){if(transport&&roomCode)transport.publish('STATE_REQUEST',{matchId:game?.id||''});}
  function actionError(text){
    if(isHost&&rejectionTarget&&rejectionTarget!==clientId())transport.publish('ACTION_REJECT_LOCAL',{targetId:rejectionTarget,reason:text});
    else toast(text);
  }
  function spend(player,cost){if(game.ap<cost){actionError(`Need ${cost} AP.`);return false;}game.ap-=cost;return true;}
  function selectedEnemy(player,range=0){
    const enemy=game.enemies.find(e=>e.id===selectedId);
    if(!enemy){actionError('Select a creature first.');return null;}
    if(Math.abs(enemy.lane-player.lane)>range){actionError(range?'Target is out of range.':'Move into the target lane.');return null;}
    return enemy;
  }
  function hitEnemy(player,enemy,amount,label){
    const dealt=Math.max(1,Math.round(amount-enemy.armor));enemy.hp=Math.max(0,enemy.hp-dealt);player.damage+=dealt;player.score+=dealt*3;
    game.lastAction=`${label} −${dealt}`;game.lastActionAt=Date.now();addLog(`${player.name} used ${label} on ${enemy.name} for ${dealt}.`);
    if(enemy.hp<=0)killEnemy(player,enemy);
  }
  function killEnemy(player,enemy){
    const loot=enemy.boss?rand(8,16):rand(.25,1.65);player.ped+=loot;player.kills++;player.score+=enemy.boss?2500:300;
    if(!enemy.boss){player.cells++;addLog(`${enemy.name} eliminated: ${loot.toFixed(2)} PED + 1 Rift Cell.`);}
    else{addLog(`THE RIFT TITAN HAS FALLEN! ${loot.toFixed(2)} PED recovered.`);game.phase='extract';}
    game.enemies=game.enemies.filter(e=>e.id!==enemy.id);selectedId=game.enemies[0]?.id||'';
  }
  function damagePlayer(player,amount,source){
    let damage=Math.max(1,Math.round(amount));
    if(player.guard>0){const blocked=Math.min(player.guard,damage);player.guard-=blocked;damage-=blocked;}
    if(player.armor>0&&damage>0){const absorbed=Math.min(player.armor,damage);player.armor-=absorbed;damage-=absorbed;}
    if(damage>0)player.hp=Math.max(0,player.hp-damage);
    addLog(`${source} hit ${player.name}${damage?` for ${damage} HP`:' but armor held'}.`);
    if(player.hp<=0&&!player.downed){player.downed=true;player.score=Math.max(0,player.score-250);addLog(`${player.name} is DOWN. A teammate must revive them.`);}
  }
  function enemyPhase(){
    addLog(`Creature phase begins.`);
    const viable=()=>game.players.filter(p=>!p.downed&&!p.extracted);
    for(const enemy of game.enemies){
      const targets=viable();if(!targets.length)break;
      let choices=targets.filter(p=>p.lane===enemy.lane);if(!choices.length)choices=targets;
      if(enemy.boss){
        for(const victim of targets)damagePlayer(victim,rand(10,17),enemy.name);
      }else{
        const victim=choices[int(0,choices.length-1)];damagePlayer(victim,rand(enemy.damage*.65,enemy.damage*1.15),enemy.name);
      }
    }
    for(const player of game.players)player.guard=0;
    if(!viable().length){finishGame(false,'The entire squad was overwhelmed.');return;}
    if(game.round%2===0&&game.phase==='hunt'&&game.enemies.length<8){game.enemies.push(createEnemy(Math.random()<.38?'drone':'atrox'));addLog(`A new creature signature entered the combat zone.`);}
  }
  function finishTurn(){
    if(game.complete)return;
    const current=activePlayer();if(current&&!game.acted.includes(current.id))game.acted.push(current.id);
    let eligible=game.players.filter(p=>!p.downed&&!p.extracted&&p.connected!==false&&!game.acted.includes(p.id));
    if(!eligible.length){
      enemyPhase();if(game.complete)return;
      game.round++;game.acted=[];
      if(game.round>game.maxRounds){finishGame(false,'The Rift collapsed before extraction.');return;}
      eligible=game.players.filter(p=>!p.downed&&!p.extracted&&p.connected!==false);
    }
    if(!eligible.length){finishGame(game.players.every(p=>p.extracted),'No colonists remain in the combat zone.');return;}
    game.activeId=eligible[0].id;game.ap=3;game.turnDeadline=Date.now()+60000;addLog(`${eligible[0].name}, awaiting orders.`);
  }
  function finishGame(success,reason){
    if(game.complete)return;game.complete=true;game.success=success;game.phase='results';game.activeId='';game.reason=reason;
    const standings=[...game.players].sort((a,b)=>Number(b.extracted)-Number(a.extracted)||b.score-a.score||b.ped-a.ped).map((p,i)=>({place:i+1,id:p.id,name:p.name,extracted:p.extracted,ped:+p.ped.toFixed(2),score:Math.floor(p.score),kills:p.kills,revives:p.revives,damage:p.damage}));
    game.standings=standings;const result=success?`${standings[0]?.name||'The squad'} led a successful Rift Command extraction.`:reason;
    transport.publish('GAME_RESULT',{matchId:game.id,success,reason,standings,result});transport.updateRoom({status:'finished',archived:true,result,lastResult:result,phase:'results',playerSnapshot:standings.map(s=>({id:s.id,name:s.name,status:s.extracted?`P${s.place}`:'MIA'})),playerStates:Object.fromEntries(standings.map(s=>[s.id,s.extracted?`P${s.place}`:'MIA'])),expiresAt:Date.now()+180000});
    modal='results';render();
  }
  function performAction(senderId,data){
    if(!isHost||!game||game.complete)return;
    rejectionTarget=senderId;
    if(data.requestId&&processed.has(data.requestId)){publishState(senderId);return;}
    if(data.requestId){processed.add(data.requestId);if(processed.size>120)processed.delete(processed.values().next().value);}
    const player=game.players.find(p=>p.id===senderId);
    if(!player||game.activeId!==senderId||player.downed||player.extracted){publishState(senderId);return;}
    selectedId=data.selectedTargetId||selectedId;const action=data.action;let enemy,ally,lane,success=false;
    if(action==='shoot'&&(enemy=selectedEnemy(player,0))&&player.ammo>=1&&spend(player,1)){player.ammo--;hitEnemy(player,enemy,int(17,23),'Laser Shot');success=true;}
    else if(action==='aimed'&&(enemy=selectedEnemy(player,1))&&player.ammo>=2&&spend(player,2)){player.ammo-=2;hitEnemy(player,enemy,int(34,45),'Aimed Shot');success=true;}
    else if(action==='mindforce'&&player.energy>=2&&spend(player,2)){const victims=game.enemies.filter(e=>e.lane===player.lane);if(!victims.length){game.ap+=2;actionError('No creatures in this lane.');}else{player.energy-=2;for(const victim of [...victims])hitEnemy(player,victim,int(18,27),'Mindforce Nova');success=true;}}
    else if(action==='fap'&&player.energy>=1&&player.hp<player.maxHp&&spend(player,1)){player.energy--;const heal=int(24,34);player.hp=Math.min(player.maxHp,player.hp+heal);player.score+=heal;addLog(`${player.name} restored ${heal} HP with a Vivo FAP.`);game.lastAction=`FAP +${heal}`;success=true;}
    else if(action==='guard'&&spend(player,1)){player.guard+=18;addLog(`${player.name} braced behind an armor field.`);game.lastAction='GUARD +18';success=true;}
    else if(action==='reload'&&spend(player,1)){player.ammo=Math.min(10,player.ammo+4);addLog(`${player.name} installed a fresh weapon cell.`);game.lastAction='AMMO +4';success=true;}
    else if(action==='probe'&&player.probes>0&&spend(player,1)){player.probes--;if(Math.random()<.27){game.enemies.push(createEnemy(Math.random()<.4?'drone':'atrox',player.lane));addLog(`${player.name}'s probe disturbed a hostile signature!`);game.lastAction='AMBUSH!';}else{const loot=rand(.4,3.5);player.ped+=loot;player.score+=Math.round(loot*100);addLog(`${player.name} found a ${loot.toFixed(2)} PED mining claim.`);game.lastAction=`CLAIM ${loot.toFixed(2)} PED`;}success=true;}
    else if(action==='charge'&&player.lane===1&&player.cells>0&&game.phase==='hunt'&&spend(player,1)){player.cells--;game.rifts=Math.min(100,game.rifts+25);player.score+=400;addLog(`${player.name} fed a Rift Cell into the anomaly: ${game.rifts}%.`);game.lastAction=`RIFT ${game.rifts}%`;success=true;if(game.rifts>=100){game.phase='boss';game.enemies.push(createEnemy('titan',1));addLog(`WARNING: THE RIFT TITAN HAS MATERIALIZED.`);selectedId=game.enemies.at(-1).id;}}
    else if(action==='revive'&&(ally=game.players.find(p=>p.id===selectedId&&p.downed&&p.lane===player.lane))&&spend(player,2)){ally.downed=false;ally.hp=42;ally.armor=15;player.revives++;player.score+=600;addLog(`${player.name} revived ${ally.name}.`);game.lastAction='COLONIST REVIVED';success=true;}
    else if(action==='extract'&&game.phase==='extract'&&player.lane===1&&spend(player,1)){player.extracted=true;player.score+=1000;addLog(`${player.name} extracted with ${player.ped.toFixed(2)} PED.`);game.lastAction='EXTRACTED';success=true;}
    else if(action==='move'&&(lane=Number(data.lane))>=0&&lane<=2&&Math.abs(lane-player.lane)===1&&spend(player,1)){player.lane=lane;addLog(`${player.name} moved to ${['WESTERN','CENTRAL','EASTERN'][lane]} approach.`);game.lastAction='REPOSITION';success=true;}
    else if(action==='end'){success=true;game.ap=0;addLog(`${player.name} ended their turn.`);}
    else if(!success){actionError(action==='charge'?'Move to the central lane and carry a Rift Cell.':action==='extract'?'The Titan must be defeated; extract from the central lane.':action==='revive'?'Select a downed teammate in your lane.':'That order cannot be executed.');}
    if(success){game.lastActionAt=Date.now();if(game.players.every(p=>p.extracted)){finishGame(true,'Every colonist extracted safely.');return;}if(game.ap<=0||player.extracted)finishTurn();publishState();render();showFx(game.lastAction);}
  }
  function sendAction(action,extra={}){
    if(!canAct())return;const payload={requestId:`${clientId()}-${Date.now()}-${++actionCounter}`,action,selectedTargetId:selectedId,...extra};
    if(isHost)performAction(clientId(),payload);else{transport.publish('ACTION_REQUEST',{matchId:game.id,...payload});toast('Order transmitted…');}
  }

  function unitMarkup(unit,isEnemy=false){
    const selected=selectedId===unit.id,active=game.activeId===unit.id;
    return `<div class="unit ${isEnemy?'enemy':''} ${selected?'selected':''} ${active?'active':''} ${unit.downed?'down':''} ${unit.extracted?'extracted':''}" data-target="${unit.id}">
      ${isEnemy?`<div class="creature" style="color:${unit.boss?'#ff4675':unit.type==='drone'?'#ff9363':'#8ecf5c'}"></div>`:`<div class="avatar" style="color:${unit.color}"><i class="head"></i><i class="body"></i><i class="gun"></i></div>`}
      <div class="unitname">${escapeHtml(unit.name)}</div><div class="stats">${isEnemy?`${unit.boss?'BOSS · ':''}${unit.armor} ARMOR`:`${unit.ammo} AMMO · ${unit.energy} MF`}</div>
      <div class="hp"><i style="width:${clamp(unit.hp/unit.maxHp*100,0,100)}%"></i></div></div>`;
  }
  function laneMarkup(lane){
    const names=['WESTERN APPROACH','CENTRAL RIFT','EASTERN APPROACH'];
    return `<div class="lane" data-lane="${names[lane]}"><div class="units">${game.players.filter(p=>p.lane===lane&&!p.extracted).map(p=>unitMarkup(p)).join('')}</div><div class="units enemies">${game.enemies.filter(e=>e.lane===lane).map(e=>unitMarkup(e,true)).join('')}</div></div>`;
  }
  function actionsMarkup(){
    const p=me(),allowed=canAct();if(!p)return `<div class="turnwait">SPECTATING THE OPERATION</div>`;
    if(!allowed)return `<div class="turnwait">${p.downed?'YOU ARE DOWN — A TEAMMATE MUST REVIVE YOU':p.extracted?'EXTRACTION COMPLETE — OBSERVING SQUAD':`WAITING FOR ${escapeHtml(activePlayer()?.name||'COMMAND')}…`}</div>`;
    const button=(id,name,cost,desc,disabled=false)=>`<button class="action" data-order="${id}" ${disabled?'disabled':''}><b>${name}<em>${cost} AP</em></b><span>${desc}</span></button>`;
    return `${button('shoot','Laser Shot',1,'1 ammo · same lane',p.ammo<1)}${button('aimed','Aimed Shot',2,'2 ammo · adjacent lane',p.ammo<2)}${button('mindforce','Mindforce Nova',2,'2 MF · all in lane',p.energy<2)}${button('fap','Vivo FAP',1,'1 MF · heal yourself',p.energy<1||p.hp>=p.maxHp)}${button('guard','Armor Guard',1,'Block 18 next phase')}${button('reload','Reload Cell',1,'Restore 4 ammunition',p.ammo>=10)}${button('probe','Drop Probe',1,'Find PED or an ambush',p.probes<1)}${button('charge','Charge Rift',1,'Central lane · spend Cell',p.lane!==1||p.cells<1||game.phase!=='hunt')}${button('revive','Revive',2,'Select downed ally in lane',!game.players.some(x=>x.downed&&x.lane===p.lane))}${button('extract','Extract',1,'Central lane after Titan',game.phase!=='extract'||p.lane!==1)}${button('end','End Turn',0,'Begin next command turn')}<button class="action" data-action="move-menu"><b>Reposition<em>1 AP</em></b><span>Move one tactical lane</span></button>`;
  }
  function resultsMarkup(){
    const standings=game.standings||[];return `<div class="modal"><div class="card"><div class="eyebrow">After-action report // Round ${game.round}</div><h2>${game.success?'Rift Secured':'Operation Lost'}</h2><div class="status">${escapeHtml(game.reason||'Operation complete.')}</div><div class="results">${standings.map(s=>`<div class="result"><span class="rank">${s.place}</span><div><b>${escapeHtml(s.name)}</b><div class="meta">${s.kills} kills · ${s.revives} revives · ${s.damage} damage · ${s.score} score</div></div><div style="text-align:right;color:${s.extracted?'#62ee86':'#ff5c72'};font:800 10px Consolas">${s.extracted?'EXTRACTED':'MIA'}<br><span style="color:#ffd269">${s.ped.toFixed(2)} PED</span></div></div>`).join('')}</div><p class="meta">This result remains visible in the Arcade room directory for three minutes.</p><div class="btnrow"><button class="btn gold" data-action="credits">Credits</button><button class="btn danger" data-action="leave">Leave Operation</button></div></div></div>`;
  }
  function briefingMarkup(){return `<div class="modal"><div class="card"><div class="eyebrow">Drop sequence complete</div><h2>Operation Live</h2><div class="brief"><b>PRIMARY OBJECTIVE</b><p>Hunt creatures for four Rift Cells. Charge the anomaly from the central lane. Eliminate the Titan and extract before the end of round 12.</p></div><div class="btnrow"><button class="btn gold" data-action="close-modal">Assume Command</button></div></div></div>`;}
  function creditsMarkup(){return `<div class="modal"><div class="card" style="text-align:center"><div class="eyebrow">PixelB8 Arcade Original</div><h2>Rift Command</h2><p class="copy">Designed for Jimmy JimbobbityBoo Bo-Bobbity and the Entropia community.</p><div class="brief"><b>TACTICAL SYSTEMS</b><p>Host-authoritative turn resolution · MQTT room relay · Idempotent action requests · Spectator synchronization</p></div><div class="brief"><b>CREATURE CAST</b><p>Atrox Young · Generation 01 Drone · The Rift Titan</p></div><p class="subtitle" style="font-size:20px">No real PED was wagered</p><button class="btn primary" data-action="close-credits">Return to Report</button></div></div>`;}
  function gameMarkup(){
    if(!game)return lobbyMarkup();const active=activePlayer(),totalPed=game.players.reduce((n,p)=>n+p.ped,0),turnLeft=Math.max(0,Math.ceil((game.turnDeadline-Date.now())/1000));
    return `<div class="shell"><div class="game"><header class="hud"><div class="hudbox turn"><span>ACTIVE COLONIST</span><b>${escapeHtml(active?.name||'OPERATION COMPLETE')}</b><div class="bar"><i style="width:${game.ap/3*100}%"></i></div></div><div class="hudbox"><span>ROUND</span><b>${game.round} / ${game.maxRounds}</b></div><div class="hudbox"><span>ACTION POINTS</span><b>${game.ap} AP</b></div><div class="hudbox"><span>RIFT CHARGE</span><b>${game.rifts}%</b></div><div class="hudbox"><span>SQUAD LOOT</span><b>${totalPed.toFixed(2)} PED</b></div></header>
      <main class="battle"><section class="field"><div class="lanes">${[0,1,2].map(laneMarkup).join('')}</div></section><aside class="sidebar"><h3>OPERATION LOG</h3><div class="log">${game.log.map(x=>`<div class="logline">${escapeHtml(x)}</div>`).join('')}</div></aside></main>
      <footer class="orders"><div class="commander"><h3>${canAct()?'YOUR COMMAND TURN':'COMMAND CHANNEL'}</h3><div class="big">${canAct()?`${game.ap} AP`:`${turnLeft}s`}</div><p>${canAct()?'Select a unit, then issue an order.':'State updates only when an order resolves.'}</p><button class="btn" data-action="rules">Rules</button></div><div class="actions">${actionsMarkup()}</div></footer></div>
      ${modal==='briefing'?briefingMarkup():modal==='results'?resultsMarkup():modal==='credits'?creditsMarkup():modal==='rules'?rulesMarkup():modal==='move'?moveMarkup():''}<div class="toast"></div></div>`;
  }
  function moveMarkup(){const p=me();return `<div class="modal"><div class="card"><div class="eyebrow">Tactical reposition</div><h2>Choose Lane</h2><div class="btnrow">${['Western','Central','Eastern'].map((name,lane)=>`<button class="btn ${lane===1?'gold':''}" data-move="${lane}" ${!p||Math.abs(lane-p.lane)!==1?'disabled':''}>${name}</button>`).join('')}</div><div class="btnrow" style="margin-top:14px"><button class="btn" data-action="close-modal">Cancel</button></div></div></div>`;}

  function render(){
    app.innerHTML=screen==='title'?titleMarkup():screen==='lobby'?lobbyMarkup():gameMarkup();
    renderFx();
  }
  function setName(){const input=document.getElementById('name');if(input){playerName=safeName(input.value);localStorage.setItem('rift_command_name',playerName);transport?.setPlayerName(playerName);}}
  function hostRoom(){setName();roomCode=transport.hostRoom({mode:'turn-based-tactics',maxPlayers:MAX_PLAYERS,name:`${playerName}'s Rift Command`});statusText=`Establishing operation ${roomCode}…`;render();}
  function joinRoom(code,nextRole='player'){setName();const cleaned=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);if(!cleaned){toast('Enter a room code.');return;}role=nextRole;roomCode=cleaned;transport.joinRoom(cleaned,nextRole);statusText=`Linking to operation ${cleaned}…`;render();}
  function leaveRoom(){transport?.disconnect();roomCode='';game=null;roster=[];screen='title';statusText='Disconnected from operation.';render();}

  function handleMessage(message){
    if(!message?.type)return;if(message.targetId&&message.targetId!==clientId())return;
    if(message.type==='JOIN'&&isHost&&game){transport.publish('GAME_START',{targetId:message.senderId,matchId:game.id});publishState(message.senderId);}
    else if(message.type==='GAME_START'&&!isHost){screen='game';modal='briefing';requestState();render();}
    else if(message.type==='STATE_REQUEST'&&isHost&&game)publishState(message.senderId);
    else if(message.type==='STATE'&&!isHost&&message.state){const previous=game?.lastActionAt||0;game=message.state;screen='game';if(!modal||modal==='briefing')modal=modal||'briefing';if(game.complete)modal='results';render();if(game.lastActionAt>previous)showFx(game.lastAction);}
    else if(message.type==='ACTION_REQUEST'&&isHost&&message.matchId===game?.id)performAction(message.senderId,message);
    else if(message.type==='ACTION_REJECT_LOCAL'&&message.reason)toast(message.reason);
    else if(message.type==='GAME_RESULT'&&message.matchId===game?.id){if(game){game.complete=true;game.success=message.success;game.reason=message.reason;game.standings=message.standings;}modal='results';render();}
  }

  app.addEventListener('click',event=>{
    const action=event.target.closest('[data-action]')?.dataset.action;
    const order=event.target.closest('[data-order]')?.dataset.order;
    const targetId=event.target.closest('[data-target]')?.dataset.target;
    const join=event.target.closest('[data-join]')?.dataset.join;
    const watch=event.target.closest('[data-watch]')?.dataset.watch;
    const move=event.target.closest('[data-move]')?.dataset.move;
    if(targetId){selectedId=targetId;render();return;}if(order){sendAction(order);return;}if(join){joinRoom(join);return;}if(watch){joinRoom(watch,'spectator');return;}if(move!==undefined){modal='';sendAction('move',{lane:Number(move)});return;}
    if(action==='lobby'){screen='lobby';render();}else if(action==='title'){screen='title';render();}else if(action==='rules'){modal='rules';render();}else if(action==='close-modal'){modal='';render();}else if(action==='host')hostRoom();else if(action==='join-code')joinRoom(document.getElementById('code')?.value);else if(action==='watch-code')joinRoom(document.getElementById('code')?.value,'spectator');else if(action==='start')startGame();else if(action==='leave')leaveRoom();else if(action==='move-menu'){modal='move';render();}else if(action==='credits'){modal='credits';render();}else if(action==='close-credits'){modal='results';render();}
  });

  if(!transport){statusText='multiplayer.js is missing. Place it beside this game file.';render();}
  else transport.init({gameId:GAME_ID,playerName,
    onRooms(next){rooms=next;if(screen==='lobby'&&!roomCode)render();},
    onRoster(next){roster=next;if(isHost&&game&&!game.complete){const ids=new Set(roster.map(p=>p.id));for(const p of game.players)p.connected=ids.has(p.id);if(activePlayer()?.connected===false){finishTurn();publishState();}}if(screen==='lobby')render();},
    onMessage:handleMessage,
    onConnected(info){roomCode=info.code;isHost=Boolean(info.isHost);role=info.role||role;screen='lobby';statusText=isHost?`Operation ${roomCode} established. Awaiting colonists.`:`${role==='spectator'?'Observing':'Joined'} operation ${roomCode}.`;if(isHost)transport.updateRoom({mode:'turn-based-tactics',maxPlayers:MAX_PLAYERS,status:'waiting',phase:'briefing'});render();},
    onError(error){statusText=`Relay error: ${error.message}`;render();}
  });

  const directRoom=query.get('room');if(directRoom){screen='lobby';joinRoom(directRoom,query.get('role')==='spectator'?'spectator':'player');}
  render();
  let last=performance.now();
  function loop(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;drawSpace(now);
    toastTimer-=dt;if(toastTimer<=0)document.querySelector('.toast')?.classList.remove('show');
    fxTimer-=dt;if(fxTimer<=0&&fxText){fxText='';renderFx();}
    const timer=document.querySelector('.commander .big');if(timer&&game&&!canAct()&&!game.complete)timer.textContent=`${Math.max(0,Math.ceil((game.turnDeadline-Date.now())/1000))}s`;
    if(isHost&&game&&!game.complete&&Date.now()>game.turnDeadline){addLog(`${activePlayer()?.name||'Colonist'} timed out.`);game.ap=0;finishTurn();publishState();render();}
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();