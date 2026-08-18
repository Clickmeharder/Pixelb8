'use strict';
const $=selector=>document.querySelector(selector);
const MODES={
    freeplay:{name:'Free Play',rules:'Host-controlled real-deck sandbox. Cards may be dealt, flipped and arranged however your table agrees.'},
    holdem:{name:'Texas Hold’em',rules:'1,000 chips each · 10/20 blinds · No-limit betting · Simplified all-in pots.'},
    blackjack:{name:'Multiplayer Blackjack',rules:'25-chip hands · Dealer stands on 17 · Blackjack pays 3:2.'},
    fivecard:{name:'Five-Card Draw',rules:'25-chip ante · Select up to three cards to replace · Best five-card poker hand wins.'},
    war:{name:'War',rules:'Each round deals one card per player. Highest rank wins the point.'}
};
const SUITS=['♠','♥','♦','♣'],VALUES=['2','3','4','5','6','7','8','9','10','J','Q','K','A'];
const MP=window.ArcadeMultiplayer;
let currentRooms=[],roomCode='',myId='',isHost=false,myRole='player',selectedDiscards=new Set(),selectedFreeCard=-1,state=null;
let displayName=localStorage.getItem('pixelb8CardName')||`PLAYER_${Math.floor(Math.random()*9000+1000)}`;
$('#player-name').value=displayName;

function makeDeck(decks=1){
    const cards=[];for(let n=0;n<decks;n++)for(const suit of SUITS)for(const val of VALUES)cards.push({suit,val,id:`${n}${suit}${val}${Math.random().toString(36).slice(2,7)}`});
    for(let i=cards.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[cards[i],cards[j]]=[cards[j],cards[i]]}return cards;
}
const valueOf=card=>VALUES.indexOf(card.val)+2;
function totalBlackjack(hand){let total=hand.reduce((n,c)=>n+Math.min(10,valueOf(c)),0),aces=hand.filter(c=>c.val==='A').length;while(aces--&&total+10<=21)total+=10;return total}
function combinations(items,k){const out=[];(function walk(start,pick){if(pick.length===k){out.push(pick);return}for(let i=start;i<=items.length-(k-pick.length);i++)walk(i+1,pick.concat(items[i]))})(0,[]);return out}
function fiveScore(cards){
    const ranks=cards.map(valueOf).sort((a,b)=>b-a),counts={};ranks.forEach(v=>counts[v]=(counts[v]||0)+1);
    const groups=Object.entries(counts).map(([v,n])=>({v:+v,n})).sort((a,b)=>b.n-a.n||b.v-a.v);
    const flush=cards.every(c=>c.suit===cards[0].suit),unique=[...new Set(ranks)],wheel=unique.includes(14)&&[5,4,3,2].every(v=>unique.includes(v));
    let straightHigh=wheel?5:0;for(let i=0;i<=unique.length-5;i++)if(unique[i]-unique[i+4]===4)straightHigh=Math.max(straightHigh,unique[i]);
    if(flush&&straightHigh)return[8,straightHigh];
    if(groups[0].n===4)return[7,groups[0].v,groups[1].v];
    if(groups[0].n===3&&groups[1]?.n===2)return[6,groups[0].v,groups[1].v];
    if(flush)return[5,...ranks];
    if(straightHigh)return[4,straightHigh];
    if(groups[0].n===3)return[3,groups[0].v,...groups.filter(g=>g.n===1).map(g=>g.v)];
    const pairs=groups.filter(g=>g.n===2).map(g=>g.v).sort((a,b)=>b-a);
    if(pairs.length>=2)return[2,pairs[0],pairs[1],groups.find(g=>g.n===1).v];
    if(pairs.length===1)return[1,pairs[0],...groups.filter(g=>g.n===1).map(g=>g.v).sort((a,b)=>b-a)];
    return[0,...ranks];
}
function bestScore(cards){return combinations(cards,5).map(fiveScore).sort(compareScore).at(-1)}
function compareScore(a,b){for(let i=0;i<Math.max(a.length,b.length);i++){const d=(a[i]||0)-(b[i]||0);if(d)return d}return 0}
const handName=score=>['High Card','Pair','Two Pair','Three of a Kind','Straight','Flush','Full House','Four of a Kind','Straight Flush'][score[0]];

MP.init({
    gameId:'cardhouse',playerName:displayName,
    onRooms:rooms=>{currentRooms=rooms;renderRooms()},
    onRoster:roster=>{renderRoster(roster);if(isHost&&state)syncRoster(roster)},
    onConnected:info=>{roomCode=info.code;myId=info.clientId;isHost=info.isHost;myRole=info.role;enterTable()},
    onMessage:handleNetwork,
    onError:error=>{$('#connection').textContent=`Connection error: ${error.message}`}
});
setTimeout(()=>{$('#connection').classList.add('online');$('#connection').textContent='Public room directory online'},1000);

$('#create-room').onclick=()=>{
    rememberName();const mode=$('#create-mode').value,code=$('#custom-code').value.trim().toUpperCase();
    MP.hostRoom({code,mode,maxPlayers:+$('#max-players').value,name:`${displayName}'s ${MODES[mode].name}`});
};
$('#join-code-btn').onclick=()=>joinRoom($('#join-code').value);
$('#join-code').onkeydown=e=>{if(e.key==='Enter')joinRoom(e.target.value)};
$('#room-filter').onchange=renderRooms;
$('#leave-room').onclick=()=>{MP.disconnect();location.reload()};
$('#copy-code').onclick=async()=>{await navigator.clipboard?.writeText(roomCode);$('#copy-code').textContent='COPIED!';setTimeout(()=>$('#copy-code').textContent='COPY ROOM CODE',1200)};

function rememberName(){displayName=$('#player-name').value.trim().slice(0,18)||displayName;localStorage.setItem('pixelb8CardName',displayName);MP.setPlayerName(displayName)}
function joinRoom(code,role='player'){rememberName();code=String(code||'').trim().toUpperCase();if(!code)return;MP.joinRoom(code,role)}
function renderRooms(){
    const filter=$('#room-filter').value,rooms=currentRooms.filter(r=>filter==='all'||r.mode===filter);
    $('#room-summary').textContent=`${rooms.length} visible table${rooms.length===1?'':'s'} · updates automatically`;
    $('#room-list').innerHTML='';
    if(!rooms.length){$('#room-list').innerHTML='<div class="empty">No matching rooms are open. Create one and become the dealer.</div>';return}
    rooms.forEach(room=>{
        const full=room.playerCount>=room.maxPlayers,card=document.createElement('article');card.className='room-card';
        card.innerHTML=`<div class="room-top"><div><div class="room-name">${escapeHtml(room.name||'Card Table')}</div><div class="room-code">ROOM ${room.code}</div></div><span class="badge ${room.status}">${room.status}</span></div>
        <div class="room-meta"><span>${MODES[room.mode]?.name||room.mode}</span><span>♟ ${room.playerCount}/${room.maxPlayers}</span>${room.spectators?`<span>◉ ${room.spectators}</span>`:''}</div>
        <div class="room-players">${(room.players||[]).map((p,i)=>`<span class="person-chip">${i===0?'♛ ':''}${escapeHtml(p.name)} · ${escapeHtml(p.status||room.status)}</span>`).join('')||'<span class="hint">Host is setting up…</span>'}</div>
        <div class="room-actions"><button class="primary join" ${full||room.status==='playing'?'disabled':''}>${full?'FULL':room.status==='playing'?'IN PROGRESS':'TAKE SEAT'}</button><button class="watch">SPECTATE</button></div>`;
        card.querySelector('.join').onclick=()=>joinRoom(room.code);card.querySelector('.watch').onclick=()=>joinRoom(room.code,'spectator');$('#room-list').appendChild(card);
    });
}
function enterTable(){
    $('#lobby-view').classList.add('hidden');$('#game-view').classList.remove('hidden');$('#room-details').textContent=`Room ${roomCode} · ${isHost?'Host':'Guest'}${myRole==='spectator'?' · Spectating':''}`;
    
    // Initialize Universal Cyber Chat
    if (window.CyberChat) {
        window.CyberChat.init('cyber-chat', (senderId) => {
            if (!state || !state.players) return 'var(--muted)';
            const pIndex = state.players.findIndex(p => p.id === senderId);
            const colors = ['var(--red)', 'var(--blue)', 'var(--green)', 'var(--gold)', '#e056fd', '#ff9b9b', '#19f5c6', '#ffffff'];
            return pIndex >= 0 ? colors[pIndex % colors.length] : 'var(--muted)';
        });
    }

    if(isHost){const mode=$('#create-mode').value;state=newState(mode,+$('#max-players').value);state.players.push(newPlayer(myId,displayName));MP.updateRoom({mode,maxPlayers:state.maxPlayers,status:'waiting'});broadcast()}
    else MP.publish('REQUEST_STATE');
}
function newPlayer(id,name){return{id,name,chips:1000,bet:0,folded:false,acted:false,allIn:false,status:'waiting',score:0}}
function newState(mode,maxPlayers){return{mode,maxPlayers,status:'waiting',phase:'waiting',deck:makeDeck(),discard:[],community:[],hands:{},players:[],dealerHand:[],dealerIndex:-1,turnIndex:0,pot:0,currentBet:0,minimumRaise:20,round:0,message:'Waiting for players. The host can start when everyone is seated.'}}

function handleNetwork(msg){
    if(!msg || !msg.type) return;

    // Route universal chat messages immediately
    if (msg.type === 'CHAT') {
        if (window.CyberChat) window.CyberChat.handleMessage(msg);
        return;
    }

    if(msg.type==='WELCOME'&&!isHost)MP.publish('REQUEST_STATE');
    if(msg.type==='REQUEST_STATE'&&isHost)broadcast();
    if(msg.type==='STATE'&&msg.state){state=msg.state;renderGame()}
    if(msg.type==='ACTION'&&isHost)handleAction(msg.senderId,msg.action,msg.payload||{});
    if(msg.type==='JOIN'&&isHost&&state)setTimeout(()=>{syncRoster(MP.getRoster());broadcast()},50);
}

function syncRoster(roster){
    if(!isHost||!state)return;const seated=roster.filter(r=>r.role!=='spectator').slice(0,state.maxPlayers),ids=new Set(seated.map(r=>r.id));
    state.players=state.players.filter(p=>ids.has(p.id));seated.forEach(r=>{if(!state.players.some(p=>p.id===r.id))state.players.push(newPlayer(r.id,r.name))});
    broadcast(false);
}
function broadcast(render=true){if(!isHost||!state)return;MP.publish('STATE',{state});MP.updateRoom({mode:state.mode,maxPlayers:state.maxPlayers,status:state.status,playerStates:Object.fromEntries(state.players.map(p=>[p.id,p.status]))});if(render)renderGame()}
function sendAction(action,payload={}){if(isHost)handleAction(myId,action,payload);else MP.publish('ACTION',{action,payload})}

function handleAction(sender,action,payload){
    if(!state)return;const player=state.players.find(p=>p.id===sender);
    if(action==='START'&&sender===MP.getHostId())startRound();
    else if(action==='NEXT'&&sender===MP.getHostId())startRound();
    else if(state.mode==='holdem')holdemAction(player,action,payload);
    else if(state.mode==='blackjack')blackjackAction(player,action);
    else if(state.mode==='fivecard')drawAction(player,action,payload);
    else if(state.mode==='war'&&action==='WAR_NEXT'&&sender===MP.getHostId())startWarRound();
    else if(state.mode==='freeplay')freeplayAction(sender,action,payload);
}
function resetPlayers(){state.players.forEach(p=>Object.assign(p,{bet:0,folded:false,acted:false,allIn:false,status:'playing'}));state.hands={};state.community=[];state.dealerHand=[];state.pot=0;state.currentBet=0;state.deck=makeDeck();state.discard=[];state.round++}
function take(player,amount){const paid=Math.min(player.chips,amount);player.chips-=paid;if(!player.chips)player.allIn=true;return paid}
function deal(playerId,n){state.hands[playerId]??=[];while(n--&&state.deck.length)state.hands[playerId].push(state.deck.pop())}
function startRound(){
    if(!isHost||state.players.length<1)return;
    if(['holdem','fivecard','war'].includes(state.mode)&&state.players.length<2){state.message=`${MODES[state.mode].name} needs at least two seated players.`;broadcast();return}
    resetPlayers();state.status='playing';
    if(state.mode==='holdem')startHoldem();
    if(state.mode==='blackjack')startBlackjack();
    if(state.mode==='fivecard')startFiveCard();
    if(state.mode==='war')startWarRound();
    if(state.mode==='freeplay'){state.phase='active';state.message='The deck is live. The host is the dealer.';broadcast()}
}
function activePlayers(){return state.players.filter(p=>!p.folded)}
function currentPlayer(){return state.players[state.turnIndex]}
function nextActiveIndex(from=state.turnIndex){
    for(let step=1;step<=state.players.length;step++){const i=(from+step)%state.players.length,p=state.players[i];if(!p.folded&&!p.allIn)return i}return from
}

function startHoldem(){
    const n=state.players.length,dealer=(state.dealerIndex+1+n)%n;state.dealerIndex=dealer;
    state.players.forEach(p=>{deal(p.id,2);p.acted=false});
    const sb=state.players[(dealer+1)%n],bb=state.players[(dealer+2)%n];sb.bet=take(sb,10);bb.bet=take(bb,20);state.pot=sb.bet+bb.bet;state.currentBet=20;state.minimumRaise=20;
    state.turnIndex=(dealer+3)%n;state.phase='preflop';state.message=`Blinds 10/20. ${currentPlayer().name} acts first.`;broadcast();
}
function holdemAction(p,action,payload){
    if(!p||state.phase==='showdown'||p.id!==currentPlayer()?.id||p.folded)return;
    const owed=Math.max(0,state.currentBet-p.bet);
    if(action==='FOLD'){p.folded=true;p.acted=true}
    else if(action==='CHECK'){if(owed)return;p.acted=true}
    else if(action==='CALL'){const paid=take(p,owed);p.bet+=paid;state.pot+=paid;p.acted=true}
    else if(action==='RAISE'){
        const desired=Math.max(state.currentBet+state.minimumRaise,Math.min(p.bet+p.chips,+payload.total||0));const paid=take(p,desired-p.bet);p.bet+=paid;state.pot+=paid;
        if(p.bet>state.currentBet){state.minimumRaise=Math.max(state.minimumRaise,p.bet-state.currentBet);state.currentBet=p.bet;state.players.forEach(x=>{if(!x.folded&&x.id!==p.id)x.acted=false})}p.acted=true;
    }else if(action==='ALLIN'){const paid=take(p,p.chips);p.bet+=paid;state.pot+=paid;if(p.bet>state.currentBet){state.minimumRaise=Math.max(state.minimumRaise,p.bet-state.currentBet);state.currentBet=p.bet;state.players.forEach(x=>{if(!x.folded&&x.id!==p.id)x.acted=false})}p.acted=true}
    else return;
    if(activePlayers().length===1){award([activePlayers()[0]],`${activePlayers()[0].name} wins uncontested.`);return}
    const settled=activePlayers().every(x=>x.allIn||(x.acted&&x.bet===state.currentBet));
    if(settled)advanceHoldemStreet();else{state.turnIndex=nextActiveIndex();state.message=`${currentPlayer().name} to act · ${Math.max(0,state.currentBet-currentPlayer().bet)} to call.`;broadcast()}
}
function advanceHoldemStreet(){
    state.players.forEach(p=>{p.bet=0;p.acted=p.allIn});state.currentBet=0;state.minimumRaise=20;
    if(state.phase==='preflop'){state.deck.pop();state.community.push(state.deck.pop(),state.deck.pop(),state.deck.pop());state.phase='flop'}
    else if(state.phase==='flop'){state.deck.pop();state.community.push(state.deck.pop());state.phase='turn'}
    else if(state.phase==='turn'){state.deck.pop();state.community.push(state.deck.pop());state.phase='river'}
    else{return holdemShowdown()}
    state.turnIndex=nextActiveIndex(state.dealerIndex);state.message=`${state.phase.toUpperCase()} · ${currentPlayer().name} to act.`;broadcast()
}
function holdemShowdown(){
    state.phase='showdown';const contenders=activePlayers().map(p=>({p,score:bestScore([...state.hands[p.id],...state.community])}));contenders.sort((a,b)=>compareScore(b.score,a.score));
    const winners=contenders.filter(x=>compareScore(x.score,contenders[0].score)===0).map(x=>x.p);award(winners,`${winners.map(p=>p.name).join(' & ')} win with ${handName(contenders[0].score)}.`)
}
function award(winners,message){const share=Math.floor(state.pot/winners.length);winners.forEach(p=>p.chips+=share);state.pot=0;state.phase='showdown';state.status='waiting';state.message=message;state.players.forEach(p=>p.status='waiting');broadcast()}

function startBlackjack(){
    state.deck=makeDeck(Math.max(1,Math.ceil(state.players.length/4)));state.phase='playing';state.turnIndex=0;state.dealerHand=[state.deck.pop(),state.deck.pop()];
    state.players.forEach(p=>{p.bet=take(p,25);state.pot+=p.bet;deal(p.id,2);p.status=totalBlackjack(state.hands[p.id])===21?'standing':'playing'});
    advanceBlackjackTurn(-1);broadcast()
}
function advanceBlackjackTurn(from){
    let found=-1;for(let step=1;step<=state.players.length;step++){const i=(from+step)%state.players.length;if(state.players[i].status==='playing'){found=i;break}}
    if(found<0)return settleBlackjack();state.turnIndex=found;state.message=`${state.players[found].name}: hit or stand.`;
}
function blackjackAction(p,action){
    if(!p||state.phase!=='playing'||p.id!==currentPlayer()?.id)return;
    if(action==='HIT'){deal(p.id,1);const total=totalBlackjack(state.hands[p.id]);if(total>=21)p.status=total>21?'bust':'standing'}
    else if(action==='STAND')p.status='standing';else return;
    if(p.status==='playing')state.message=`${p.name} has ${totalBlackjack(state.hands[p.id])}.`;else advanceBlackjackTurn(state.turnIndex);broadcast()
}
function settleBlackjack(){
    while(totalBlackjack(state.dealerHand)<17)state.dealerHand.push(state.deck.pop());const dealer=totalBlackjack(state.dealerHand);
    state.players.forEach(p=>{const total=totalBlackjack(state.hands[p.id]),natural=total===21&&state.hands[p.id].length===2;if(total>21)return;if(natural){p.chips+=Math.floor(p.bet*2.5)}else if(dealer>21||total>dealer)p.chips+=p.bet*2;else if(total===dealer)p.chips+=p.bet});
    state.phase='showdown';state.status='waiting';state.pot=0;state.message=`Dealer ${dealer>21?'busts with ': 'shows '}${dealer}. Hand complete.`;broadcast()
}

function startFiveCard(){state.phase='draw';state.players.forEach(p=>{p.bet=take(p,25);state.pot+=p.bet;p.status='drawing';deal(p.id,5)});state.message='Select up to three cards, then draw replacements.';broadcast()}
function drawAction(p,action,payload){
    if(!p||state.phase!=='draw'||action!=='DRAW'||p.status!=='drawing')return;const indexes=[...new Set(payload.indexes||[])].filter(i=>i>=0&&i<5).slice(0,3).sort((a,b)=>b-a);
    indexes.forEach(i=>state.discard.push(state.hands[p.id].splice(i,1)[0]));deal(p.id,indexes.length);p.status='ready';
    if(state.players.every(x=>x.status==='ready')){const ranked=state.players.map(x=>({p:x,score:fiveScore(state.hands[x.id])})).sort((a,b)=>compareScore(b.score,a.score));const winners=ranked.filter(x=>compareScore(x.score,ranked[0].score)===0).map(x=>x.p);award(winners,`${winners.map(x=>x.name).join(' & ')} win with ${handName(ranked[0].score)}.`)}
    else{state.message=`Waiting for ${state.players.filter(x=>x.status==='drawing').map(x=>x.name).join(', ')} to draw.`;broadcast()}
}
function startWarRound(){if(!state||state.mode!=='war')return;state.status='playing';state.phase='showdown';state.community=[];state.hands={};if(state.deck.length<state.players.length)state.deck=makeDeck();state.players.forEach(p=>deal(p.id,1));const high=Math.max(...state.players.map(p=>valueOf(state.hands[p.id][0]))),winners=state.players.filter(p=>valueOf(state.hands[p.id][0])===high);winners.forEach(p=>p.score++);state.message=`${winners.map(p=>p.name).join(' & ')} take${winners.length===1?'s':''} the round.`;broadcast()}

function freeplayAction(sender,action,payload){
    const hostOnly=['SHUFFLE','TABLE_UP','TABLE_DOWN','PLAYER_UP','PLAYER_DOWN','CLEAR','COLLECT'];
    if(hostOnly.includes(action)&&sender!==MP.getHostId())return;
    if(action==='SHUFFLE'){state.deck=makeDeck();state.community=[];state.hands={};state.message='Fresh shuffled deck.'}
    if(action==='TABLE_UP'||action==='TABLE_DOWN'){const c=state.deck.pop();if(c){c.faceUp=action==='TABLE_UP';state.community.push(c)}}
    if(action==='PLAYER_UP'||action==='PLAYER_DOWN'){const target=payload.target,c=state.deck.pop();if(target&&c){c.faceUp=action==='PLAYER_UP';state.hands[target]??=[];state.hands[target].push(c)}}
    if(action==='CLEAR'){state.community=[];state.message='Table center cleared.'}
    if(action==='COLLECT'){state.deck=makeDeck();state.community=[];state.hands={};state.message='All cards collected and shuffled.'}
    if(action==='FLIP_HAND'&&sender===payload.target&&state.hands[sender]?.[payload.index])state.hands[sender][payload.index].faceUp=!state.hands[sender][payload.index].faceUp;
    if(action==='PLAY_HAND'&&state.hands[sender]?.[payload.index]){
        const card=state.hands[sender].splice(payload.index,1)[0];card.faceUp=payload.faceUp!==false;state.community.push(card);state.message=`${state.players.find(p=>p.id===sender)?.name||'A player'} plays a card ${card.faceUp?'face-up':'face-down'}.`;
    }
    if(action==='RETURN_HAND'&&state.hands[sender]?.[payload.index]){
        const card=state.hands[sender].splice(payload.index,1)[0];state.deck.unshift(card);state.message='A card returns to the bottom of the deck.';
    }
    if(action==='FLIP_TABLE'&&sender===MP.getHostId()&&state.community[payload.index])state.community[payload.index].faceUp=!state.community[payload.index].faceUp;
    broadcast()
}

function renderRoster(roster){
    $('#roster').innerHTML=roster.map(p=>`<div class="roster-item ${p.id===myId?'me':''}"><b>${p.id===MP.getHostId()?'♛ ':''}${escapeHtml(p.name)}</b><small>${p.role}${p.status?` · ${p.status}`:''}${p.id===myId?' · you':''}</small></div>`).join('')
}
function renderGame(){
    if(!state)return;const me=state.players.find(p=>p.id===myId),mode=MODES[state.mode]||MODES.freeplay;
    $('#room-title').textContent=`${mode.name} Table`;$('#game-title').textContent=mode.name.toUpperCase();$('#game-status').textContent=state.status;$('#game-status').className=`badge ${state.status}`;
    $('#deck-stat').textContent=`DECK ${state.deck.length}`;$('#pot-stat').textContent=state.mode==='war'?`SCORE ${me?.score||0}`:`POT ${state.pot}`;$('#table-message').textContent=state.message;$('#mode-rules').textContent=mode.rules;
    renderOpponents();renderCommunity();renderMyHand();renderActions();renderFreeplayTools();
}
function renderOpponents(){
    const players=state.players.filter(p=>p.id!==myId);$('#opponents').innerHTML=players.map(p=>{
        const cards=state.hands[p.id]||[],reveal=state.phase==='showdown'&&state.mode!=='blackjack'||state.mode==='war';
        return`<div class="seat ${currentPlayer()?.id===p.id&&state.status==='playing'?'turn':''} ${p.folded?'folded':''}"><div class="seat-name">${escapeHtml(p.name)}</div><div class="mini-hand">${cards.map(c=>reveal?miniFace(c):'<span class="mini-card"></span>').join('')}</div><div class="seat-info">${state.mode==='war'?`${p.score} wins`:`${p.chips} chips${p.bet?` · bet ${p.bet}`:''}${p.status?` · ${p.status}`:''}`}</div></div>`}).join('')
}
function miniFace(c){return`<span class="mini-card" style="background:#f7f4e8;color:${['♥','♦'].includes(c.suit)?'#c22':'#111'};font:bold 11px Georgia;display:grid;place-items:center">${c.val}${c.suit}</span>`}
function renderCommunity(){
    $('#community-cards').innerHTML='';
    if(state.mode==='blackjack'){
        state.dealerHand.forEach((c,i)=>$('#community-cards').appendChild(cardElement(c,state.phase==='playing'&&i===1)));
        return
    }
    state.community.forEach((c,i)=>$('#community-cards').appendChild(cardElement(c,state.mode==='freeplay'&&c.faceUp===false,()=>{if(state.mode==='freeplay'&&isHost)sendAction('FLIP_TABLE',{index:i})})))
}
function renderMyHand(){
    const me=state.players.find(p=>p.id===myId),cards=state.hands[myId]||[];$('#my-hand').innerHTML='';
    cards.forEach((c,i)=>{const selectable=state.mode==='fivecard'&&state.phase==='draw'&&me?.status==='drawing',freeSelectable=state.mode==='freeplay';const el=cardElement(c,false,()=>{
        if(selectable){if(selectedDiscards.has(i))selectedDiscards.delete(i);else if(selectedDiscards.size<3)selectedDiscards.add(i);renderMyHand()}
        else if(freeSelectable){selectedFreeCard=selectedFreeCard===i?-1:i;renderMyHand();renderActions()}
        else if(state.mode==='freeplay')sendAction('FLIP_HAND',{target:myId,index:i})
    });if(selectable||freeSelectable){el.classList.add('clickable');if(selectedDiscards.has(i)||selectedFreeCard===i)el.classList.add('selected')}$('#my-hand').appendChild(el)});
    $('#my-seat-name').textContent=myRole==='spectator'?'SPECTATING':`${displayName} — YOUR HAND`;
    $('#my-seat-info').textContent=me?`${me.chips} chips${me.bet?` · bet ${me.bet}`:''}${currentPlayer()?.id===myId&&state.status==='playing'?' · YOUR TURN':''}`:'No player seat';
}
function cardElement(card,hidden=false,onClick=null){
    const el=document.createElement('div');el.className=`card ${hidden?'back':(['♥','♦'].includes(card.suit)?'red':'')}`;
    if(!hidden)el.innerHTML=`<span class="corner">${card.val}<br>${card.suit}</span><span class="big-suit">${card.suit}</span>`;
    if(onClick){el.classList.add('clickable');el.onclick=onClick}return el
}
function renderActions(){
    const bar=$('#action-bar');bar.innerHTML='';const me=state.players.find(p=>p.id===myId);
    if(myRole==='spectator')return;
    if(state.status==='waiting'&&isHost)addButton(bar,state.round?'NEXT HAND':'START GAME','primary',()=>sendAction(state.round?'NEXT':'START'));
    if(state.mode==='holdem'&&state.status==='playing'&&currentPlayer()?.id===myId){
        const owed=Math.max(0,state.currentBet-me.bet);if(!owed)addButton(bar,'CHECK','',()=>sendAction('CHECK'));else addButton(bar,`CALL ${Math.min(owed,me.chips)}`,'primary',()=>sendAction('CALL'));
        addButton(bar,'FOLD','danger',()=>sendAction('FOLD'));
        [25,50,100].forEach(add=>addButton(bar,`RAISE +${add}`,'',()=>sendAction('RAISE',{total:state.currentBet+add}),me.chips<=owed+add));
        addButton(bar,`ALL-IN ${me.chips}`,'',()=>sendAction('ALLIN'),!me.chips)
    }
    if(state.mode==='blackjack'&&state.phase==='playing'&&currentPlayer()?.id===myId){addButton(bar,'HIT','primary',()=>sendAction('HIT'));addButton(bar,'STAND','',()=>sendAction('STAND'))}
    if(state.mode==='fivecard'&&state.phase==='draw'&&me?.status==='drawing')addButton(bar,`DRAW ${selectedDiscards.size||0}`,'primary',()=>{sendAction('DRAW',{indexes:[...selectedDiscards]});selectedDiscards.clear()});
    if(state.mode==='war'&&isHost)addButton(bar,'DEAL NEXT WAR ROUND','primary',()=>sendAction('WAR_NEXT'));
    if(state.mode==='freeplay'&&selectedFreeCard>=0){
        addButton(bar,'PLAY FACE-UP','primary',()=>{const index=selectedFreeCard;selectedFreeCard=-1;sendAction('PLAY_HAND',{index,faceUp:true})});
        addButton(bar,'PLAY FACE-DOWN','',()=>{const index=selectedFreeCard;selectedFreeCard=-1;sendAction('PLAY_HAND',{index,faceUp:false})});
        addButton(bar,'RETURN TO DECK','',()=>{const index=selectedFreeCard;selectedFreeCard=-1;sendAction('RETURN_HAND',{index})});
    }
}
function addButton(parent,text,cls,fn,disabled=false){const b=document.createElement('button');b.textContent=text;b.className=cls;b.onclick=fn;b.disabled=disabled;parent.appendChild(b)}
function renderFreeplayTools(){
    const tools=$('#freeplay-tools');tools.classList.toggle('hidden',state.mode!=='freeplay'||!isHost);if(state.mode!=='freeplay'||!isHost)return;
    $('#deal-target').innerHTML=state.players.map(p=>`<option value="${p.id}">${escapeHtml(p.name)}</option>`).join('')
}
$('#freeplay-tools').onclick=e=>{
    const tool=e.target.dataset.tool;if(!tool)return;const map={shuffle:'SHUFFLE',tableUp:'TABLE_UP',tableDown:'TABLE_DOWN',playerUp:'PLAYER_UP',playerDown:'PLAYER_DOWN',clear:'CLEAR',collect:'COLLECT'};
    sendAction(map[tool],{target:$('#deal-target').value})
};
function escapeHtml(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
