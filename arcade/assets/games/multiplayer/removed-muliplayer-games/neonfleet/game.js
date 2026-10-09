'use strict';
const $ = selector => document.querySelector(selector);
const MP = window.ArcadeMultiplayer;

// --- AUDIO ENGINE ---
const SoundFX = (() => {
    let actx = null;
    function init() { if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume(); }
    
    function playTone(freq, type, duration, vol=0.1, slideFreq=null) {
        if (!actx) return;
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        osc.type = type;
        osc.frequency.setValueAtTime(freq, actx.currentTime);
        if (slideFreq) osc.frequency.exponentialRampToValueAtTime(slideFreq, actx.currentTime + duration);
        gain.gain.setValueAtTime(vol, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + duration);
        osc.connect(gain); gain.connect(actx.destination);
        osc.start(); osc.stop(actx.currentTime + duration);
    }

    function playNoise(duration, type) {
        if (!actx) return;
        const bufferSize = actx.sampleRate * duration;
        const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
        const noise = actx.createBufferSource();
        noise.buffer = buffer;
        const filter = actx.createBiquadFilter();
        filter.type = type === 'hit' ? 'lowpass' : 'highpass';
        filter.frequency.value = type === 'hit' ? 1000 : 4000;
        if (type === 'hit') filter.frequency.exponentialRampToValueAtTime(100, actx.currentTime + duration);
        const gain = actx.createGain();
        gain.gain.setValueAtTime(type === 'hit' ? 0.6 : 0.2, actx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + duration);
        noise.connect(filter); filter.connect(gain); gain.connect(actx.destination);
        noise.start(); noise.stop(actx.currentTime + duration);
    }

    return {
        init,
        playJoin: () => { playTone(500, 'sine', 0.1, 0.1); setTimeout(()=>playTone(700, 'sine', 0.2, 0.1), 100); },
        playPing: () => { playTone(1200, 'sine', 0.1, 0.05); setTimeout(()=>playTone(1200, 'sine', 0.3, 0.02), 150); }, // Sonar
        playMiss: () => { playNoise(0.3, 'miss'); }, // Splash
        playHit: () => { playNoise(0.6, 'hit'); playTone(100, 'sawtooth', 0.5, 0.3, 50); }, // Explosion
        playTick: () => playTone(800, 'square', 0.05, 0.05),
        playWin: () => { [300, 400, 500, 600, 800].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.3, 0.15), i*100)); },
        playLose: () => { [400, 350, 300, 250, 200].forEach((f, i) => setTimeout(() => playTone(f, 'sawtooth', 0.4, 0.1), i*200)); }
    };
})();

document.body.addEventListener('click', SoundFX.init, { once: true });

// State Variables
let currentRooms = [];
let roomCode = '';
let myId = '';
let isHost = false;
let lastPlayerCount = 0;

let displayName = localStorage.getItem('pixelb8FleetName') || `Cmdr_${Math.floor(Math.random() * 9000)}`;
$('#player-name').value = displayName;

// Battleship Constants
const BOARD_SIZE = 10;
const FLEET = [5, 4, 3, 3, 2]; // Ship lengths
const TOTAL_HITS_TO_WIN = 17;

// Game State
// 0: empty, 1: ship
let localMyGrid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
let myFleetLocked = false;

let myPlayerNum = 0; 
let p1Id = null, p2Id = null;

// Networked Sync State
let currentTurn = 1; // 1 = P1, 2 = P2
let gameStatus = 'waiting'; // waiting, placement, playing, finished

// Host master state (only populated if isHost)
let hostState = {
    p1Ready: false, p1Grid: null, p1Hits: [], p1Misses: [], p1Hp: TOTAL_HITS_TO_WIN,
    p2Ready: false, p2Grid: null, p2Hits: [], p2Misses: [], p2Hp: TOTAL_HITS_TO_WIN
};

// Client Sync State (from host)
let syncData = { p1Ready: false, p2Ready: false, p1Hits: [], p1Misses: [], p2Hits: [], p2Misses: [] };

// Timer State
const TURN_TIME_LIMIT = 45; 
let hostTimerInterval = null;
let turnTimeLeft = TURN_TIME_LIMIT;

// --- INIT NETWORK ---
MP.init({
    gameId: 'battleship',
    playerName: displayName,
    onRooms: rooms => { currentRooms = rooms; renderRooms(); },
    onRoster: roster => { 
        if (roster.length > lastPlayerCount && lastPlayerCount > 0 && gameStatus === 'waiting') {
            SoundFX.playJoin();
        }
        lastPlayerCount = roster.length;
        renderRoster(roster); 
        if (isHost) assignPlayers(roster); 
    },
    onConnected: info => { roomCode = info.code; myId = info.clientId; isHost = info.isHost; enterTable(); },
    onMessage: handleNetworkMessage,
    onError: err => { $('#connection').textContent = `Connection error: ${err.message}`; }
});
setTimeout(() => { $('#connection').classList.add('online'); $('#connection').textContent = 'Directory Connected'; }, 1000);

// --- UI BINDINGS ---
$('#create-room').onclick = () => {
    rememberName();
    const code = $('#custom-code').value.trim().toUpperCase();
    MP.hostRoom({ code, mode: 'battleship', maxPlayers: 2, name: `${displayName}'s Sector` });
};
$('#join-code-btn').onclick = () => joinRoom($('#join-code').value);
$('#leave-room').onclick = () => { MP.disconnect(); location.reload(); };
$('#copy-code').onclick = async () => { await navigator.clipboard?.writeText(roomCode); $('#copy-code').textContent = 'COPIED!'; setTimeout(() => $('#copy-code').textContent = 'COPY CODE', 1200); };

$('#rematch-btn').onclick = () => { if (isHost) hostInitiatePlacement(); };

function safePublish(type, payload = {}) {
    MP.publish(type, payload);
    if (isHost) handleNetworkMessage({ type, senderId: myId, ...payload });
}
function rememberName() { displayName = $('#player-name').value.trim().slice(0, 18) || displayName; localStorage.setItem('pixelb8FleetName', displayName); MP.setPlayerName(displayName); }
function joinRoom(code) { rememberName(); code = String(code || '').trim().toUpperCase(); if (code) MP.joinRoom(code, 'player'); }

function renderRooms() {
    const rl = $('#room-list');
    if (!currentRooms.length) { rl.innerHTML = '<div class="empty">No frequencies active. Host one!</div>'; return; }
    rl.innerHTML = currentRooms.map(r => {
        const full = r.playerCount >= 2;
        return `
        <div class="room-card">
            <div class="room-top"><b>${escapeHtml(r.name)}</b> <span class="badge ${r.status}">${r.status}</span></div>
            <div class="room-meta"><span>[${r.code}]</span> <span>📡 ${r.playerCount}/2</span></div>
            <button class="primary" onclick="$('#join-code').value='${r.code}'; joinRoom('${r.code}');" ${full && r.status === 'playing' ? 'disabled' : ''}>
                ${full && r.status === 'playing' ? 'SPECTATE' : 'JOIN MATCH'}
            </button>
        </div>`;
    }).join('');
}

function enterTable() {
    $('#lobby-view').classList.add('hidden'); 
    $('#game-view').classList.remove('hidden');
    $('#room-details').textContent = `Code ${roomCode}`;
    
    // Initialize Universal Cyber Chat
    if (window.CyberChat) {
        window.CyberChat.init('cyber-chat', (senderId) => {
            if (senderId === p1Id) return 'var(--p1-color)';
            if (senderId === p2Id) return '#ffffff'; // P2 is white/silver based on styles
            return 'var(--muted)';
        });
    }

    // Generate a random local board just so it doesn't look empty
    randomizeFleet();
    renderClientBoards();
}

function assignPlayers(roster) {
    if (!isHost) return;
    p1Id = myId; p2Id = null;
    const guest = roster.find(r => r.id !== myId);
    if (guest) p2Id = guest.id;
    
    safePublish('SYNC_PLAYERS', { p1Id, p2Id });

    if (p1Id && p2Id && gameStatus === 'waiting') {
        hostInitiatePlacement();
    }

    if (!p2Id && (gameStatus === 'placement' || gameStatus === 'starting')) {
        gameStatus = 'waiting';
        if (hostTimerInterval) clearInterval(hostTimerInterval);
        safePublish('SYNC_GAME_STATE', { gameStatus });
    }
}

function renderRoster(roster) {
    $('#roster').innerHTML = roster.map(p => {
        let roleColor = ''; let roleTag = 'Spectator';
        if (p.id === p1Id) { roleColor = 'var(--accent)'; roleTag = 'Commander 1'; }
        if (p.id === p2Id) { roleColor = '#fff'; roleTag = 'Commander 2'; }
        return `<div class="roster-item ${p.id === myId ? 'me' : ''}"><b style="color:${roleColor || '#fff'}">${escapeHtml(p.name)}</b><small>${roleTag}</small></div>`;
    }).join('');
}

// --- FLEET PLACEMENT LOGIC (CLIENT SIDE) ---
window.randomizeFleet = function() {
    if (myFleetLocked || gameStatus !== 'placement') return;
    SoundFX.playTick();
    localMyGrid = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0));
    
    FLEET.forEach(len => {
        let placed = false;
        while (!placed) {
            let isHoriz = Math.random() > 0.5;
            let r = Math.floor(Math.random() * BOARD_SIZE);
            let c = Math.floor(Math.random() * BOARD_SIZE);
            
            if (isHoriz && c + len <= BOARD_SIZE) {
                let collision = false;
                for (let i = 0; i < len; i++) if (localMyGrid[r][c+i] !== 0) collision = true;
                if (!collision) {
                    for (let i = 0; i < len; i++) localMyGrid[r][c+i] = 1;
                    placed = true;
                }
            } else if (!isHoriz && r + len <= BOARD_SIZE) {
                let collision = false;
                for (let i = 0; i < len; i++) if (localMyGrid[r+i][c] !== 0) collision = true;
                if (!collision) {
                    for (let i = 0; i < len; i++) localMyGrid[r+i][c] = 1;
                    placed = true;
                }
            }
        }
    });
    renderClientBoards();
}

window.lockFleet = function() {
    if (myFleetLocked || gameStatus !== 'placement') return;
    myFleetLocked = true;
    $('#lock-btn').textContent = "LOCKED IN";
    $('#lock-btn').disabled = true;
    SoundFX.playPing();
    safePublish('SUBMIT_FLEET', { grid: localMyGrid });
}


// --- HOST LOGIC ---

function hostInitiatePlacement() {
    if (!p1Id || !p2Id) return;
    gameStatus = 'placement';
    
    hostState = {
        p1Ready: false, p1Grid: null, p1Hits: [], p1Misses: [], p1Hp: TOTAL_HITS_TO_WIN,
        p2Ready: false, p2Grid: null, p2Hits: [], p2Misses: [], p2Hp: TOTAL_HITS_TO_WIN
    };

    MP.updateRoom({ status: 'playing' });
    if (hostTimerInterval) clearInterval(hostTimerInterval);
    
    safePublish('SYNC_GAME_STATE', { 
        gameStatus, currentTurn: 0, 
        syncData: { p1Ready: false, p2Ready: false, p1Hits: [], p1Misses: [], p2Hits: [], p2Misses: [] }
    });
}

function hostProcessFleet(senderId, grid) {
    if (gameStatus !== 'placement') return;
    if (senderId === p1Id) { hostState.p1Grid = grid; hostState.p1Ready = true; }
    if (senderId === p2Id) { hostState.p2Grid = grid; hostState.p2Ready = true; }

    // Broadcast readiness status
    safePublish('SYNC_GAME_STATE', { 
        gameStatus, currentTurn: 0, 
        syncData: { p1Ready: hostState.p1Ready, p2Ready: hostState.p2Ready, p1Hits: [], p1Misses: [], p2Hits: [], p2Misses: [] }
    });

    // If both ready, start battle
    if (hostState.p1Ready && hostState.p2Ready) {
        setTimeout(() => {
            gameStatus = 'playing';
            currentTurn = 1; // P1 starts
            turnTimeLeft = TURN_TIME_LIMIT;
            hostTimerInterval = setInterval(hostTimeTick, 1000);
            safePublish('SYNC_GAME_STATE', { 
                gameStatus, currentTurn, 
                syncData: { p1Ready: true, p2Ready: true, p1Hits: [], p1Misses: [], p2Hits: [], p2Misses: [] }
            });
            safePublish('SYNC_TIME', { turnTimeLeft, currentTurn });
        }, 1500); // Short dramatic pause
    }
}

function hostTimeTick() {
    if (gameStatus !== 'playing') return;
    turnTimeLeft--;
    if (turnTimeLeft <= 0) {
        hostEndGame(currentTurn === 1 ? 2 : 1, 'timeout');
        return;
    }
    safePublish('SYNC_TIME', { turnTimeLeft, currentTurn });
}

function hostEndGame(winnerNum, reason) {
    gameStatus = 'finished';
    currentTurn = winnerNum; 
    if (hostTimerInterval) clearInterval(hostTimerInterval);
    MP.updateRoom({ status: 'finished' });
    safePublish('SYNC_GAME_STATE', { gameStatus, currentTurn, syncData: getSyncData(), winReason: reason });
}

function getSyncData() {
    return {
        p1Ready: hostState.p1Ready, p2Ready: hostState.p2Ready,
        p1Hits: hostState.p1Hits, p1Misses: hostState.p1Misses,
        p2Hits: hostState.p2Hits, p2Misses: hostState.p2Misses
    };
}

function hostProcessFire(senderId, r, c) {
    if (gameStatus !== 'playing') return;
    const expectedId = (currentTurn === 1) ? p1Id : p2Id;
    if (senderId !== expectedId) return;

    // Which board are we checking?
    const targetGrid = currentTurn === 1 ? hostState.p2Grid : hostState.p1Grid;
    const attackerHits = currentTurn === 1 ? hostState.p1Hits : hostState.p2Hits;
    const attackerMisses = currentTurn === 1 ? hostState.p1Misses : hostState.p2Misses;

    // Prevent firing at same spot
    const alreadyHit = attackerHits.find(h => h.r === r && h.c === c);
    const alreadyMiss = attackerMisses.find(m => m.r === r && m.c === c);
    if (alreadyHit || alreadyMiss) return;

    // Evaluate
    const val = targetGrid[r][c];
    let isHit = false;

    if (val === 1) {
        isHit = true;
        attackerHits.push({r, c});
        if (currentTurn === 1) hostState.p2Hp--; else hostState.p1Hp--;
    } else {
        attackerMisses.push({r, c});
    }

    safePublish('PLAY_SOUND', { sound: isHit ? 'hit' : 'miss' });

    // Check Win
    if (hostState.p1Hp <= 0) { hostEndGame(2, 'elimination'); return; }
    if (hostState.p2Hp <= 0) { hostEndGame(1, 'elimination'); return; }

    // Next Turn
    currentTurn = currentTurn === 1 ? 2 : 1;
    turnTimeLeft = TURN_TIME_LIMIT;

    safePublish('SYNC_GAME_STATE', { gameStatus, currentTurn, syncData: getSyncData() });
    safePublish('SYNC_TIME', { turnTimeLeft, currentTurn });
}


// --- CLIENT RECEIVE LOGIC ---

function handleNetworkMessage(msg) {
    if (!msg || !msg.type) return;

    // Route universal chat messages immediately
    if (msg.type === 'CHAT') {
        if (window.CyberChat) window.CyberChat.handleMessage(msg);
        return;
    }

    if (msg.type === 'SYNC_PLAYERS') {
        p1Id = msg.p1Id; p2Id = msg.p2Id;
        if (myId === p1Id) myPlayerNum = 1; else if (myId === p2Id) myPlayerNum = 2; else myPlayerNum = 0;
        renderRoster(Array.from(MP.getRoster()));
    }

    if (msg.type === 'PLAY_SOUND') {
        if (msg.sound === 'hit') SoundFX.playHit();
        if (msg.sound === 'miss') SoundFX.playMiss();
    }

    if (msg.type === 'SYNC_TIME') {
        updateTimerDisplay(msg.turnTimeLeft, msg.currentTurn);
    }

    if (msg.type === 'SYNC_GAME_STATE') {
        const prevStatus = gameStatus;
        gameStatus = msg.gameStatus;
        currentTurn = msg.currentTurn;
        if (msg.syncData) syncData = msg.syncData;

        if (gameStatus === 'placement' && prevStatus !== 'placement') {
            // Only randomize the board once when transitioning into the placement phase
            myFleetLocked = false;
            $('#lock-btn').textContent = "DEPLOY";
            $('#lock-btn').disabled = false;
            $('#winner-screen').classList.add('hidden');
            randomizeFleet();
        }

        updateStatusBanner();
        renderClientBoards();

        if (gameStatus === 'finished') showWinnerScreen(msg.winReason);
        else $('#winner-screen').classList.add('hidden');
    }

    // Route commands to Host
    if (isHost) {
        if (msg.type === 'SUBMIT_FLEET') hostProcessFleet(msg.senderId, msg.grid);
        if (msg.type === 'FIRE') hostProcessFire(msg.senderId, msg.r, msg.c);
    }
}

function updateTimerDisplay(timeLeft, activeTurn) {
    const tDisp = $('#timer-display');
    if (gameStatus === 'waiting' || gameStatus === 'placement' || gameStatus === 'finished') { 
        tDisp.classList.add('hidden'); 
        return; 
    }
    
    tDisp.classList.remove('hidden');

    if (timeLeft > 10) {
        tDisp.textContent = `${timeLeft - 10}s`;
        tDisp.classList.remove('danger');
        $('#status-banner').classList.remove('warning');
    } else {
        tDisp.textContent = `AUTO-FORFEIT IN: ${timeLeft}s`;
        tDisp.classList.add('danger');
        $('#status-banner').classList.add('warning');
        
        if (activeTurn === myPlayerNum && timeLeft > 0) SoundFX.playTick();
    }
}

function updateStatusBanner() {
    const banner = $('#status-banner');
    banner.className = 'status-banner';
    const ind = $('#turn-indicator');
    
    $('#placement-controls').classList.add('hidden');
    $('#enemy-wrapper').classList.add('hidden');

    if (gameStatus === 'waiting') {
        ind.textContent = isHost ? (p2Id ? "Ready to start match!" : "Waiting for opponent...") : "Waiting for host to start...";
        $('#timer-display').classList.add('hidden');
    } else if (gameStatus === 'placement') {
        const amIReady = myPlayerNum === 1 ? syncData.p1Ready : syncData.p2Ready;
        const isOppReady = myPlayerNum === 1 ? syncData.p2Ready : syncData.p1Ready;
        
        $('#placement-controls').classList.remove('hidden');
        
        if (!amIReady) {
            ind.textContent = "DEPLOY YOUR FLEET";
            banner.classList.add('cyan');
        } else if (!isOppReady) {
            ind.textContent = "WAITING FOR OPPONENT TO DEPLOY...";
        } else {
            ind.textContent = "ALL FLEETS DEPLOYED. INITIALIZING...";
        }
    } else if (gameStatus === 'playing') {
        $('#enemy-wrapper').classList.remove('hidden');
        
        const isMyTurn = (currentTurn === myPlayerNum);
        ind.textContent = isMyTurn ? "YOUR TURN - SELECT TARGET" : "ENEMY IS AIMING...";
        if (isMyTurn) banner.classList.add('cyan');
    } else if (gameStatus === 'finished') {
        $('#enemy-wrapper').classList.remove('hidden');
        $('#timer-display').classList.add('hidden');
        ind.textContent = "BATTLE CONCLUDED";
    }
}

function getPlayerName(id, fallback) {
    const roster = Array.from(MP.getRoster());
    const p = roster.find(r => r.id === id);
    return p ? escapeHtml(p.name) : fallback;
}

function showWinnerScreen(reason) {
    const screen = $('#winner-screen');
    const title = $('#winner-title');
    const sub = $('#winner-subtitle');
    const loserText = $('#winner-loser-text');
    
    const iWon = (currentTurn === myPlayerNum);
    
    if (iWon) SoundFX.playWin();
    else SoundFX.playLose();

    const winnerId = (currentTurn === 1) ? p1Id : p2Id;
    const loserId = (currentTurn === 1) ? p2Id : p1Id;
    
    const winnerName = getPlayerName(winnerId, `Commander ${currentTurn}`);
    const loserName = getPlayerName(loserId, "Opponent");

    title.textContent = `${winnerName} WINS!`.toUpperCase();
    
    if (reason === 'timeout') sub.textContent = "Opponent Forfeit";
    else sub.textContent = "ENEMY FLEET DESTROYED";

    loserText.innerHTML = `Better luck next time, <b>${loserName}</b>.`;

    screen.classList.remove('hidden');

    if (isHost) {
        $('#rematch-btn').classList.remove('hidden');
    }
}

// --- RENDERING ---
function renderClientBoards() {
    const myBoardEl = $('#my-board');
    const enemyBoardEl = $('#enemy-board');
    myBoardEl.innerHTML = '';
    enemyBoardEl.innerHTML = '';

    const isMyTurn = (currentTurn === myPlayerNum && gameStatus === 'playing');
    
    // Re-derive view based on who I am
    let myEnemyHits = [], myEnemyMisses = []; // Things fired AT ME
    let myGuessesHits = [], myGuessesMisses = []; // Things I fired at ENEMY

    if (myPlayerNum === 1) {
        myEnemyHits = syncData.p2Hits; myEnemyMisses = syncData.p2Misses;
        myGuessesHits = syncData.p1Hits; myGuessesMisses = syncData.p1Misses;
    } else if (myPlayerNum === 2) {
        myEnemyHits = syncData.p1Hits; myEnemyMisses = syncData.p1Misses;
        myGuessesHits = syncData.p2Hits; myGuessesMisses = syncData.p2Misses;
    } else {
        // Spectator views P1 as "My" and P2 as "Enemy"
        myEnemyHits = syncData.p2Hits; myEnemyMisses = syncData.p2Misses;
        myGuessesHits = syncData.p1Hits; myGuessesMisses = syncData.p1Misses;
    }

    // Draw My Board (Left)
    for (let r=0; r<BOARD_SIZE; r++) {
        for (let c=0; c<BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            const hasShip = localMyGrid[r][c] === 1;
            const shipWasHit = myEnemyHits.some(h => h.r === r && h.c === c);
            
            // Render ship
            if (hasShip) {
                cell.classList.add('ship-cell');
                const ship = document.createElement('div');
                ship.className = 'ship-block';
                cell.appendChild(ship);
            }

            // Render Enemy Guesses on my board
            if (shipWasHit && hasShip) {
                // Keep the full ship tile visible and let CSS layer
                // scorch damage and cracks over the original hull.
                cell.classList.add('ship-hit');
            } else if (shipWasHit) {
                const peg = document.createElement('div');
                peg.className = 'peg hit';
                cell.appendChild(peg);
            } else if (myEnemyMisses.some(m => m.r === r && m.c === c)) {
                const peg = document.createElement('div');
                peg.className = 'peg miss';
                cell.appendChild(peg);
            }

            myBoardEl.appendChild(cell);
        }
    }

    // Draw Enemy Board (Right) - Only used for firing/tracking
    for (let r=0; r<BOARD_SIZE; r++) {
        for (let c=0; c<BOARD_SIZE; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            
            const isHit = myGuessesHits.find(h => h.r === r && h.c === c);
            const isMiss = myGuessesMisses.find(m => m.r === r && m.c === c);

            if (isHit) {
                const peg = document.createElement('div');
                peg.className = 'peg hit';
                cell.appendChild(peg);
            } else if (isMiss) {
                const peg = document.createElement('div');
                peg.className = 'peg miss';
                cell.appendChild(peg);
            } else if (isMyTurn) {
                // Empty cell during my turn
                cell.onclick = () => {
                    SoundFX.playPing();
                    MP.publish('FIRE', { r, c });
                };
            }

            enemyBoardEl.appendChild(cell);
        }
    }
}

function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }