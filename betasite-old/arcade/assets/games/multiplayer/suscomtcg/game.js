'use strict';
const $=s=>document.querySelector(s),MP=window.ArcadeMultiplayer;
const CARD_POOL=[
    {key:'exaro',name:'Exarosaur Young',type:'mob',cost:1,attack:1,health:3,art:'🦎',text:'Steady Calypso creature.'},
    {key:'bery',name:'Berycled Provider',type:'mob',cost:2,attack:3,health:2,art:'🐦',text:'Fast attacker.'},
    {key:'atrox',name:'Atrox Mature',type:'mob',cost:5,attack:6,health:5,art:'🦖',text:'Heavy Calypso predator.'},
    {key:'longu',name:'Longu Alpha',type:'mob',cost:6,attack:7,health:7,art:'🐲',text:'Expensive battlefield terror.'},
    {key:'feffoid',name:'Feffoid Guard',type:'mob',cost:3,attack:3,health:5,art:'👹',text:'Tough tribal defender.'},
    {key:'drone',name:'Drone Generation 01',type:'mob',cost:2,attack:2,health:3,art:'🤖',text:'Efficient robot unit.'},
    {key:'trooper',name:'Warrior Generation 05',type:'mob',cost:4,attack:5,health:4,art:'🦾',text:'Aggressive robot combatant.'},
    {key:'opalo',name:'Sollomate Opalo',type:'weapon',cost:1,ammo:3,damage:3,art:'🔫',text:'Deal 3 damage to rival avatar.'},
    {key:'rifle',name:'A-3 Justifier Mk.II',type:'weapon',cost:3,ammo:6,damage:6,art:'🎯',text:'Deal 6 damage to rival avatar.'},
    {key:'rocket',name:'DetPil V-Rex 2000',type:'weapon',cost:4,ammo:10,damage:4,all:true,art:'🚀',text:'Deal 4 damage to every rival creature.'},
    {key:'fap',name:'Vivo T1',type:'tool',cost:2,heal:5,art:'➕',text:'Restore 5 avatar HP.'},
    {key:'chip',name:'Regeneration Chip I',type:'tool',cost:4,heal:9,art:'💠',text:'Restore 9 avatar HP.'},
    {key:'ammo',name:'Universal Ammo Cache',type:'tool',cost:1,ammoGain:12,art:'📦',text:'Gain 12 ammo.'},
    {key:'essence',name:'Mind Essence Surge',type:'tool',cost:0,meGain:2,art:'✨',text:'Recover 2 Mind Essence.'}
];
const STARTER_KEYS=['exaro','exaro','bery','bery','feffoid','feffoid','drone','drone','atrox','longu','trooper','opalo','opalo','opalo','rifle','rifle','rocket','fap','fap','chip','ammo','ammo','essence','essence'];
let rooms=[],state=null,myId='',roomCode='',isHost=false,myRole='player',selectedAttacker='',battleLog=[];
let avatarName=localStorage.getItem('entropiaTcgName')||`Avatar_${Math.floor(Math.random()*900+100)}`;$('#avatar-name').value=avatarName;

MP.init({
    gameId:'entropiachronicles',playerName:avatarName,
    onRooms:list=>{rooms=list;renderRooms()},
    onRoster:list=>{renderRoster(list);if(isHost&&state)syncRoster(list)},
    onConnected:info=>{myId=info.clientId;roomCode=info.code;isHost=info.isHost;myRole=info.role;enterArena()},
    onMessage:handleNetwork,
    onError:error=>{$('#connection').textContent=`Connection error: ${error.message}`}
});
setTimeout(()=>{$('#connection').classList.add('online');$('#connection').textContent='Arena room directory online'},900);

$('#host-room').onclick=()=>{rememberName();MP.hostRoom({code:$('#host-code').value,mode:'tcg',maxPlayers:2,name:`${avatarName}'s Entropia Battle`})};
$('#join-room').onclick=()=>join($('#join-code').value);$('#join-code').onkeydown=e=>{if(e.key==='Enter')join(e.target.value)};
$('#leave').onclick=()=>{MP.disconnect();location.reload()};$('#copy-code').onclick=async()=>{await navigator.clipboard?.writeText(roomCode);$('#copy-code').textContent='COPIED';setTimeout(()=>$('#copy-code').textContent='COPY ROOM CODE',1000)};
$('#attack-avatar').onclick=()=>{if(selectedAttacker)sendAction('ATTACK',{attackerId:selectedAttacker,target:'hero'})};
$('#concede').onclick=()=>sendAction('CONCEDE');

function rememberName(){avatarName=$('#avatar-name').value.trim().slice(0,18)||avatarName;localStorage.setItem('entropiaTcgName',avatarName);MP.setPlayerName(avatarName)}
function join(code,role='player'){rememberName();code=String(code||'').trim().toUpperCase();if(code)MP.joinRoom(code,role)}
function renderRooms(){
    $('#room-summary').textContent=`${rooms.length} visible battle${rooms.length===1?'':'s'}`;$('#room-list').innerHTML='';
    if(!rooms.length){$('#room-list').innerHTML='<div class="empty">No active battles. Host the first table on Calypso.</div>';return}
    rooms.forEach(room=>{
        const full=room.playerCount>=2,el=document.createElement('article');el.className='room';
        el.innerHTML=`<div class="room-top"><div><div class="room-name">${esc(room.name||'Entropia Battle')}</div><div class="code">ROOM ${room.code}</div></div><span class="badge ${room.status}">${room.status}</span></div>
        <div class="room-meta">${room.playerCount}/2 avatars · ${room.spectators||0} spectators</div>
        <div class="chips">${(room.players||[]).map((p,i)=>`<span class="chip">${i===0?'♛ ':''}${esc(p.name)} · ${esc(p.status||room.status)}</span>`).join('')}</div>
        <div class="room-actions"><button class="primary seat" ${full||room.status==='playing'?'disabled':''}>${full?'FULL':room.status==='playing'?'IN BATTLE':'JOIN BATTLE'}</button><button class="watch">SPECTATE</button></div>`;
        el.querySelector('.seat').onclick=()=>join(room.code);el.querySelector('.watch').onclick=()=>join(room.code,'spectator');$('#room-list').appendChild(el)
    })
}
function enterArena(){
    $('#lobby').classList.add('hidden');$('#arena').classList.remove('hidden');$('#side-room').textContent=`Room ${roomCode}`;$('#side-details').textContent=`${isHost?'Host':'Guest'}${myRole==='spectator'?' · Spectator':''}`;
    if (window.CyberChat) {
        window.CyberChat.init('cyber-chat', (senderId) => {
            if (senderId === myId) return 'var(--cyan)';
            if (state && state.players.some(p => p.id === senderId)) return 'var(--red)';
            return 'var(--muted)';
        });
    }
    if(isHost){state={status:'waiting',players:[],turnId:'',turn:0,winnerId:'',message:'Waiting for a rival avatar to take the second seat.'};state.players.push(makePlayer(myId,avatarName));broadcast()}
    else MP.publish('REQUEST_STATE')
}
function makePlayer(id,name){return{id,name,hp:30,maxMe:3,me:3,ammo:20,deck:[],hand:[],board:[],discard:[],status:'waiting'}}
function buildDeck(){return shuffle(STARTER_KEYS.map((key,i)=>({...CARD_POOL.find(c=>c.key===key),uid:`${key}_${i}_${Math.random().toString(36).slice(2,8)}`})))}
function shuffle(items){for(let i=items.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[items[i],items[j]]=[items[j],items[i]]}return items}
function handleNetwork(msg){
    if(!msg || !msg.type) return;
    if (msg.type === 'CHAT') { if (window.CyberChat) window.CyberChat.handleMessage(msg); return; }
    if(msg.type==='WELCOME'&&!isHost)MP.publish('REQUEST_STATE');
    if(msg.type==='REQUEST_STATE'&&isHost)broadcast();
    if(msg.type==='STATE'&&msg.state){state=msg.state;render()}
    if(msg.type==='ACTION'&&isHost)validateAction(msg.senderId,msg.action,msg.payload||{});
    if(msg.type==='JOIN'&&isHost)setTimeout(()=>{syncRoster(MP.getRoster());broadcast()},40)
}
function syncRoster(roster){
    const seated=roster.filter(p=>p.role!=='spectator').slice(0,2),ids=new Set(seated.map(p=>p.id)),wasPlaying=state.status==='playing';
    const departed=state.players.filter(p=>!ids.has(p.id));state.players=state.players.filter(p=>ids.has(p.id));
    seated.forEach(person=>{if(!state.players.some(p=>p.id===person.id)&&!wasPlaying)state.players.push(makePlayer(person.id,person.name))});
    if(wasPlaying&&departed.length&&state.players.length===1)finish(state.players[0].id,`${departed[0].name} disconnected. ${state.players[0].name} wins by departure.`);
    else if(!wasPlaying){state.message=state.players.length===2?'Both avatars are seated. Host may start the match.':'Waiting for a rival avatar.';broadcast(false)}
}
function renderRoster(list){$('#roster').innerHTML=list.map(p=>`<div class="person ${p.id===myId?'me':''}"><b>${p.id===MP.getHostId()?'♛ ':''}${esc(p.name)}</b><small>${p.role}${p.id===myId?' · you':''}</small></div>`).join('')}
function broadcast(renderNow=true){
    if(!isHost||!state)return;MP.publish('STATE',{state});MP.updateRoom({mode:'tcg',maxPlayers:2,status:state.status,playerStates:Object.fromEntries(state.players.map(p=>[p.id,p.status]))});if(renderNow)render()
}
function sendAction(action,payload={}){if(action==='ATTACK')selectedAttacker='';if(isHost)validateAction(myId,action,payload);else MP.publish('ACTION',{action,payload})}
function addLog(text){battleLog.unshift(text);battleLog=battleLog.slice(0,12)}
function player(id){return state.players.find(p=>p.id===id)}function opponent(id){return state.players.find(p=>p.id!==id)}
function draw(p,count=1){while(count--){if(!p.deck.length){if(!p.discard.length)return;p.deck=shuffle(p.discard.splice(0))}const card=p.deck.pop();if(p.hand.length<9)p.hand.push(card);else p.discard.push(card)}}

function validateAction(sender,action,payload){
    if(!state)return;const p=player(sender);
    if(action==='START'&&sender===MP.getHostId())return startMatch();
    if(action==='REMATCH'&&sender===MP.getHostId())return startMatch();
    if(action==='CONCEDE'&&p&&state.status==='playing')return finish(opponent(sender)?.id,`${p.name} conceded the battle.`);
    if(!p||state.status!=='playing'||state.turnId!==sender)return;
    if(action==='PLAY')playCard(p,payload.uid);
    if(action==='ATTACK')attack(p,payload.attackerId,payload.target,payload.targetId);
    if(action==='END_TURN')endTurn(p);
}
function startMatch(){
    if(state.players.length!==2){state.message='Two seated avatars are required.';broadcast();return}
    state.status='playing';state.winnerId='';state.turn++;state.players.forEach(p=>Object.assign(p,{hp:30,maxMe:3,me:3,ammo:20,deck:buildDeck(),hand:[],board:[],discard:[],status:'playing'}));
    state.players.forEach(p=>draw(p,4));state.turnId=state.players[(state.turn-1)%2].id;state.message=`${player(state.turnId).name} has initiative. Play a card or end the turn.`;battleLog=[];addLog(`Match ${state.turn} begins.`);selectedAttacker='';broadcast()
}
function playCard(p,uid){
    const index=p.hand.findIndex(c=>c.uid===uid);if(index<0)return;const card=p.hand[index],rival=opponent(p.id);
    if(card.cost>p.me){state.message=`${p.name} needs ${card.cost} Mind Essence.`;broadcast();return}
    if(card.type==='weapon'&&card.ammo>p.ammo){state.message=`${p.name} needs ${card.ammo} ammo.`;broadcast();return}
    if(card.type==='mob'&&p.board.length>=5){state.message='Battlefield limit is five creatures.';broadcast();return}
    p.me-=card.cost;p.hand.splice(index,1);p.discard.push(card);
    if(card.type==='mob'){p.discard.pop();p.board.push({...card,currentHp:card.health,exhausted:true});state.message=`${p.name} deploys ${card.name}.`;addLog(state.message)}
    if(card.type==='weapon'){
        p.ammo-=card.ammo;if(card.all){rival.board.forEach(m=>m.currentHp-=card.damage);removeDead(rival);state.message=`${p.name} fires ${card.name} across the rival board.`}
        else{rival.hp=Math.max(0,rival.hp-card.damage);state.message=`${p.name} fires ${card.name} for ${card.damage} avatar damage.`}addLog(state.message)
    }
    if(card.type==='tool'){
        if(card.heal)p.hp=Math.min(30,p.hp+card.heal);if(card.ammoGain)p.ammo+=card.ammoGain;if(card.meGain)p.me=Math.min(p.maxMe,p.me+card.meGain);
        state.message=`${p.name} activates ${card.name}.`;addLog(state.message)
    }
    if(rival.hp<=0)return finish(p.id,`${p.name} wins the Entropia battle!`);broadcast()
}
function attack(p,attackerId,target,targetId){
    const attacker=p.board.find(c=>c.uid===attackerId),rival=opponent(p.id);if(!attacker||attacker.exhausted||!rival)return;
    if(target==='hero'){rival.hp=Math.max(0,rival.hp-attacker.attack);attacker.exhausted=true;state.message=`${attacker.name} strikes ${rival.name} for ${attacker.attack}.`;addLog(state.message)}
    else{
        const defender=rival.board.find(c=>c.uid===targetId);if(!defender)return;defender.currentHp-=attacker.attack;attacker.currentHp-=defender.attack;attacker.exhausted=true;
        state.message=`${attacker.name} clashes with ${defender.name}.`;addLog(state.message);removeDead(p);removeDead(rival)
    }
    selectedAttacker='';if(rival.hp<=0)return finish(p.id,`${p.name} wins the Entropia battle!`);broadcast()
}
function removeDead(p){p.board=p.board.filter(card=>{if(card.currentHp>0)return true;p.discard.push(card);addLog(`${card.name} is destroyed.`);return false})}
function endTurn(p){
    const next=opponent(p.id);if(!next)return;state.turnId=next.id;next.maxMe=Math.min(10,next.maxMe+1);next.me=next.maxMe;next.ammo+=5;next.board.forEach(c=>c.exhausted=false);draw(next,1);
    state.message=`${next.name}'s turn · ${next.me} ME · drew one card.`;addLog(`${p.name} ends their turn.`);selectedAttacker='';broadcast()
}
function finish(winnerId,message){state.status='finished';state.winnerId=winnerId||'';state.turnId='';state.players.forEach(p=>p.status=p.id===winnerId?'winner':'defeated');state.message=message;addLog(message);broadcast()}

function render(){
    if(!state)return;const me=player(myId),rival=state.players.find(p=>p.id!==myId);renderHero(me,rival);renderBoards(me,rival);renderHand(me);renderControls(me);
    $('#message').textContent=state.message;$('#battle-log').innerHTML=battleLog.map(line=>`<div>› ${esc(line)}</div>`).join('')||'<div>Battle log ready.</div>';
    const mine=state.status==='playing'&&state.turnId===myId;$('#turn-badge').textContent=state.status==='finished'?'MATCH OVER':mine?'YOUR TURN':state.status==='playing'?`${player(state.turnId)?.name||'RIVAL'}'S TURN`:'WAITING';$('#turn-badge').classList.toggle('mine',mine)
}
function renderHero(me,rival){
    $('#my-name').textContent=me?.name||`${avatarName} — spectating`;$('#my-hp').textContent=`♥ ${me?.hp??'--'}`;$('#my-me').textContent=`ME ${me?`${me.me}/${me.maxMe}`:'--'}`;$('#my-ammo').textContent=`AMMO ${me?.ammo??'--'}`;
    $('#enemy-name').textContent=rival?.name||'Waiting for rival…';$('#enemy-hp').textContent=`♥ ${rival?.hp??'--'}`;$('#enemy-me').textContent=`ME ${rival?`${rival.me}/${rival.maxMe}`:'--'}`;$('#enemy-ammo').textContent=`AMMO ${rival?.ammo??'--'}`;
    $('#attack-avatar').disabled=!(selectedAttacker&&state.turnId===myId&&state.status==='playing');$('#concede').disabled=!me||state.status!=='playing'
}
function renderBoards(me,rival){
    const mine=$('#my-board'),enemy=$('#enemy-board');mine.innerHTML='';enemy.innerHTML='';
    (me?.board||[]).forEach(card=>mine.appendChild(cardEl(card,{clickable:state.turnId===myId&&!card.exhausted,onClick:()=>{selectedAttacker=selectedAttacker===card.uid?'':card.uid;render()}})));
    (rival?.board||[]).forEach(card=>enemy.appendChild(cardEl(card,{clickable:!!selectedAttacker&&state.turnId===myId,onClick:()=>sendAction('ATTACK',{attackerId:selectedAttacker,target:'mob',targetId:card.uid})})));
    if(!me?.board.length)mine.innerHTML='<span class="rule-note">Deploy creatures from your hand.</span>';if(!rival?.board.length)enemy.innerHTML='<span class="rule-note">Rival battlefield empty.</span>';
    $('#my-counts').textContent=me?`Deck ${me.deck.length} · Discard ${me.discard.length}`:'';$('#enemy-counts').textContent=rival?`Deck ${rival.deck.length} · Hand ${rival.hand.length}`:''
}
function renderHand(me){
    const zone=$('#my-hand');zone.innerHTML='';if(!me){zone.innerHTML='<span class="rule-note">Spectators cannot see either private hand.</span>';return}
    me.hand.forEach(card=>zone.appendChild(cardEl(card,{clickable:state.turnId===myId&&state.status==='playing',onClick:()=>sendAction('PLAY',{uid:card.uid})})));if(!me.hand.length)zone.innerHTML='<span class="rule-note">Your hand is empty.</span>'
}
function renderControls(me){
    const controls=$('#controls');controls.innerHTML='';
    if(isHost&&(state.status==='waiting'||state.status==='finished'))addButton(controls,state.status==='finished'?'START REMATCH':'START MATCH','primary',()=>sendAction(state.status==='finished'?'REMATCH':'START'));
    if(me&&state.status==='playing'&&state.turnId===myId)addButton(controls,'END TURN','primary',()=>sendAction('END_TURN'));
}
function addButton(parent,text,cls,fn){const b=document.createElement('button');b.textContent=text;b.className=cls;b.onclick=fn;parent.appendChild(b)}
function cardEl(card,{clickable=false,onClick=null}={}){
    const el=document.createElement('div');el.className=`card ${card.type}${card.exhausted?' exhausted':''}${selectedAttacker===card.uid?' selected':''}${clickable?' clickable':''}`;
    const stats=card.type==='mob'?`<span class="attack">⚔ ${card.attack}</span><span class="defense">♥ ${card.currentHp??card.health}/${card.health}</span>`:card.type==='weapon'?`<span class="attack">DMG ${card.damage}${card.all?' ALL':''}</span><span class="defense">AMMO ${card.ammo}</span>`:`<span class="attack">UTILITY</span><span class="defense">ONE USE</span>`;
    el.innerHTML=`<span class="cost">${card.cost}</span><span class="card-type">${card.type.toUpperCase()}</span><div class="card-title">${esc(card.name)}</div><div class="card-art">${card.art}</div><div class="card-text">${esc(card.text)}</div><div class="stats">${stats}</div>`;if(clickable)el.onclick=onClick;return el
}
function esc(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
