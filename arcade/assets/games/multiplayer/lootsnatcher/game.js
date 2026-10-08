'use strict';
const $ = selector => document.querySelector(selector);
const MP = window.ArcadeMultiplayer;

let currentRooms = [];
let roomCode = '';
let myId = '';
let isHost = false;
let myRole = 'player';
let gameStatus = 'lobby'; 

let displayName = localStorage.getItem('pixelb8LootName') || `Merc_${Math.floor(Math.random() * 9000 + 1000)}`;
$('#player-name').value = displayName;

// Internal scores are tracked in PECs (integer math). Display converts to PED (score / 100).
const scores = new Map();
const rosterData = new Map();
const activeHostTargets = new Map();

let hostSpawnInterval;
let hostTimerInterval;
let timeRemaining = 60;

function formatPED(pecs) {
    return (pecs / 100).toFixed(2);
}

MP.init({
    gameId: 'lootsnatcher',
    playerName: displayName,
    onRooms: rooms => { currentRooms = rooms; renderRooms(); },
    onRoster: roster => { renderRoster(roster); if (isHost && gameStatus === 'playing') syncRosterScores(roster); },
    onConnected: info => { roomCode = info.code; myId = info.clientId; isHost = info.isHost; myRole = info.role; enterTable(); },
    onMessage: handleNetworkMessage,
    onError: err => { $('#connection').textContent = `Connection error: ${err.message}`; }
});
setTimeout(() => { $('#connection').classList.add('online'); $('#connection').textContent = 'Public room directory online'; }, 1000);

$('#create-room').onclick = () => {
    rememberName();
    const mode = $('#create-mode').value;
    const code = $('#custom-code').value.trim().toUpperCase();
    MP.hostRoom({ code, mode, maxPlayers: +$('#max-players').value, name: `${displayName}'s Squad` });
};

$('#join-code-btn').onclick = () => joinRoom($('#join-code').value);
$('#join-code').onkeydown = e => { if (e.key === 'Enter') joinRoom(e.target.value); };
$('#leave-room').onclick = () => { MP.disconnect(); location.reload(); };
$('#copy-code').onclick = async () => { 
    await navigator.clipboard?.writeText(roomCode); 
    $('#copy-code').textContent = 'COPIED!'; 
    setTimeout(() => $('#copy-code').textContent = 'COPY ZONE FREQUENCY', 1200); 
};

$('#start-game-btn').onclick = () => {
    if (!isHost) return;
    scores.clear();
    rosterData.forEach(p => scores.set(p.id, 0));
    MP.updateRoom({ status: 'playing' });
    
    safePublish('SEQUENCE_START', {});
    setTimeout(hostStartGameLoop, 6500);
};

$('#return-lobby-btn').onclick = () => {
    if (!isHost) return;
    MP.updateRoom({ status: 'waiting' });
    safePublish('LOBBY_RESET', {});
};

function safePublish(type, payload = {}) {
    MP.publish(type, payload);
    if (isHost) {
        handleNetworkMessage({ type, senderId: myId, ...payload });
    }
}

function rememberName() {
    displayName = $('#player-name').value.trim().slice(0, 18) || displayName;
    localStorage.setItem('pixelb8LootName', displayName);
    MP.setPlayerName(displayName);
}

function joinRoom(code, role = 'player') {
    rememberName();
    code = String(code || '').trim().toUpperCase();
    if (!code) return;
    MP.joinRoom(code, role);
}

function renderRooms() {
    const rooms = currentRooms;
    $('#room-summary').textContent = `${rooms.length} active zone${rooms.length === 1 ? '' : 's'} · updates automatically`;
    $('#room-list').innerHTML = '';
    if (!rooms.length) {
        $('#room-list').innerHTML = '<div class="empty">No active zones found. Deploy a squad to host an operation.</div>';
        return;
    }
    rooms.forEach(room => {
        const full = room.playerCount >= room.maxPlayers;
        const card = document.createElement('article');
        card.className = 'room-card';
        card.innerHTML = `
            <div class="room-top">
                <div><div class="room-name">${escapeHtml(room.name || 'Operation Zone')}</div><div class="room-code">ROOM ${room.code}</div></div>
                <span class="badge ${room.status}">${room.status}</span>
            </div>
            <div class="room-meta"><span>Loot Snatcher</span><span>♟ ${room.playerCount}/${room.maxPlayers}</span>${room.spectators ? `<span>◉ ${room.spectators}</span>` : ''}</div>
            <div class="room-players">${(room.players || []).map((p, i) => `<span class="person-chip">${i === 0 ? '♛ ' : ''}${escapeHtml(p.name)} · ${escapeHtml(p.status || room.status)}</span>`).join('') || '<span class="hint">Awaiting deployment…</span>'}</div>
            <div class="room-actions">
                <button class="primary join" ${full || room.status === 'playing' ? 'disabled' : ''}>${full ? 'SQUAD FULL' : room.status === 'playing' ? 'IN PROGRESS' : 'DEPLOY SQUAD'}</button>
                <button class="watch">SPECTATE</button>
            </div>`;
        card.querySelector('.join').onclick = () => joinRoom(room.code);
        card.querySelector('.watch').onclick = () => joinRoom(room.code, 'spectator');
        $('#room-list').appendChild(card);
    });
}

function enterTable() {
    $('#lobby-view').classList.add('hidden');
    $('#game-view').classList.remove('hidden');
    $('#room-details').textContent = `Zone ${roomCode} · ${isHost ? 'Squad Leader' : 'Operator'}${myRole === 'spectator' ? ' · Spectating' : ''}`;
    
    // Initialize Universal Cyber Chat
    if (window.CyberChat) {
        // Use an array of neon colors for up to 8 players
        const colors = ['var(--accent)', 'var(--danger)', 'var(--gold)', '#53b7ff', '#5ee08a', '#e056fd', '#ff9b9b', '#ffffff'];
        window.CyberChat.init('cyber-chat', (senderId) => {
            const players = Array.from(rosterData.values());
            const pIndex = players.findIndex(p => p.id === senderId);
            return pIndex >= 0 ? colors[pIndex % colors.length] : 'var(--muted)';
        });
    }

    if (isHost) {
        $('#start-game-btn').disabled = false;
        $('#host-hint').textContent = 'You are the Squad Leader. Initiate drop sequence when ready.';
    } else {
        $('#start-game-btn').disabled = true;
        $('#host-hint').textContent = 'Awaiting Squad Leader Initialization.';
    }
}

function renderRoster(roster) {
    roster.forEach(p => rosterData.set(p.id, p));
    $('#roster').innerHTML = roster.map(p => `
        <div class="roster-item ${p.id === myId ? 'me' : ''}">
            <b>${p.id === MP.getHostId() ? '♛ ' : ''}${escapeHtml(p.name)}</b>
            <small>${p.role}${p.status ? ` · ${p.status}` : ''}${p.id === myId ? ' · you' : ''}</small>
        </div>`).join('');
    
    const me = roster.find(p => p.id === myId);
    if (me && scores.has(myId)) {
        $('#score-stat').textContent = `MY PED: ${formatPED(scores.get(myId))}`;
    }
}

function syncRosterScores(roster) {
    roster.forEach(p => {
        if (!scores.has(p.id)) scores.set(p.id, 0);
    });
}

function handleNetworkMessage(msg) {
    if (!msg || !msg.type) return;

    // Route universal chat messages immediately
    if (msg.type === 'CHAT') {
        if (window.CyberChat) window.CyberChat.handleMessage(msg);
        return;
    }

    switch(msg.type) {
        case 'SEQUENCE_START':
            if (gameStatus !== 'cinematic' && gameStatus !== 'playing') {
                playCinematicSequence();
            }
            break;
        case 'SPAWN_TARGET':
            spawnTargetClient(msg);
            break;
        case 'DESPAWN_TARGET':
            despawnTargetClient(msg.targetId);
            break;
        case 'CLAIM_REQUEST':
            if (isHost) resolveClaimHost(msg);
            break;
        case 'CLAIM_RESOLVED':
            resolveClaimClient(msg);
            break;
        case 'SYNC_STATE':
            syncStateClient(msg);
            break;
        case 'GAME_OVER':
            if (gameStatus !== 'finished') showGameOver(msg);
            break;
        case 'LOBBY_RESET':
            resetToLobbyClient();
            break;
    }
}

// --- HOST LOGIC ---
function hostStartGameLoop() {
    if (!isHost) return;
    timeRemaining = 60;
    activeHostTargets.clear();
    
    hostSpawnInterval = setInterval(hostSpawnLogic, 700);
    hostTimerInterval = setInterval(() => {
        timeRemaining--;
        safePublish('SYNC_STATE', { 
            timeRemaining, 
            scores: Array.from(scores.entries()) 
        });
        
        if (timeRemaining <= 0) hostEndGame();
    }, 1000);
}

function hostSpawnLogic() {
    const id = Math.random().toString(36).substr(2, 9);
    const rand = Math.random();
    
    let targetType = 'pec';
    let value = Math.floor(Math.random() * 5) + 1; // 1-5 PEC
    
    if (rand > 0.95) { 
        targetType = 'fish';
        value = Math.floor(Math.random() * 400) + 100; // 1 to 5 PED
    } else if (rand > 0.80) { 
        targetType = 'mob';
        value = -(Math.floor(Math.random() * 300) + 200); // Lose 2 to 5 PED
    } else if (rand > 0.60) {
        targetType = 'ped';
        value = Math.floor(Math.random() * 40) + 10; // 10-50 PEC
    }

    const x = 10 + Math.random() * 80; 
    const y = 10 + Math.random() * 80;
    const lifetime = targetType === 'fish' ? 1500 : 2000 + Math.random() * 1500;

    activeHostTargets.set(id, { targetType, value, timer: null });
    safePublish('SPAWN_TARGET', { targetId: id, targetType, x, y });

    const dTimer = setTimeout(() => {
        if (activeHostTargets.has(id)) {
            activeHostTargets.delete(id);
            safePublish('DESPAWN_TARGET', { targetId: id });
        }
    }, lifetime);
    activeHostTargets.get(id).timer = dTimer;
}

function resolveClaimHost(msg) {
    const id = msg.targetId;
    if (activeHostTargets.has(id)) {
        const targetData = activeHostTargets.get(id);
        clearTimeout(targetData.timer);
        activeHostTargets.delete(id);

        const currentScore = scores.get(msg.senderId) || 0;
        scores.set(msg.senderId, currentScore + targetData.value);

        safePublish('CLAIM_RESOLVED', {
            targetId: id,
            winnerId: msg.senderId,
            value: targetData.value,
            targetType: targetData.targetType
        });
    }
}

function hostEndGame() {
    clearInterval(hostSpawnInterval);
    clearInterval(hostTimerInterval);
    
    let topScore = -999999;
    let winnerId = null;
    scores.forEach((val, id) => {
        if (val > topScore) { topScore = val; winnerId = id; }
    });

    MP.updateRoom({ status: 'finished' });
    safePublish('GAME_OVER', { winnerId, finalScores: Array.from(scores.entries()) });
}

// --- CLIENT SEQUENCE & RENDERING ---
function playCinematicSequence() {
    gameStatus = 'cinematic';
    const cineScreen = $('#cinematic-screen');
    const cineContainer = $('#cinematic-container');
    const instructions = $('#game-instructions');
    
    $('#target-layer').innerHTML = ''; 
    cineScreen.classList.remove('hidden');
    instructions.classList.remove('hidden'); 
    cineContainer.innerHTML = '';
    
    const lines = [
        "NO SWEAT HARVESTING REQUIRED.",
        "NO ARMOR TO BREAK.",
        "JUST CAST YOUR LINE.",
        "AND SNATCH THE LOOT."
    ];

    let delay = 0;
    lines.forEach(text => {
        setTimeout(() => {
            cineContainer.innerHTML = `<div class="cinematic-text">${text}</div>`;
        }, delay);
        delay += 1500; 
    });

    setTimeout(() => {
        if (gameStatus !== 'finished') {
            gameStatus = 'playing';
            cineScreen.classList.add('hidden');
            $('#game-status').textContent = 'PLAYING';
            $('#game-status').className = 'badge playing';
        }
    }, delay + 500);
}

function spawnTargetClient(msg) {
    if (gameStatus === 'lobby' || gameStatus === 'finished') return;
    
    const layer = $('#target-layer');
    if (layer.querySelector(`.target[data-id="${msg.targetId}"]`)) return;

    const el = document.createElement('div');
    el.className = `target ${msg.targetType}`;
    el.dataset.id = msg.targetId;
    el.style.left = `${msg.x}%`;
    el.style.top = `${msg.y}%`;

    el.addEventListener('pointerdown', (e) => {
        if (myRole === 'spectator') return;
        e.preventDefault();
        el.style.opacity = '0.3';
        el.style.transform = 'scale(0.8)';
        el.style.pointerEvents = 'none';
        MP.publish('CLAIM_REQUEST', { targetId: msg.targetId });
    });

    layer.appendChild(el);
}

function despawnTargetClient(id) {
    const el = document.querySelector(`.target[data-id="${id}"]`);
    if (el) el.remove();
}

function resolveClaimClient(msg) {
    const el = document.querySelector(`.target[data-id="${msg.targetId}"]`);
    if (el) {
        const layer = $('#target-layer');
        const rect = el.getBoundingClientRect();
        const parentRect = layer.getBoundingClientRect();
        const x = rect.left - parentRect.left + (rect.width / 2);
        const y = rect.top - parentRect.top;
        
        const isMe = msg.winnerId === myId;
        const floatEl = document.createElement('div');
        floatEl.className = `floating-text ${msg.value > 0 ? 'positive' : 'negative'}`;
        floatEl.style.left = `${x}px`;
        floatEl.style.top = `${y}px`;
        
        // Format decimal PED string for floating combat text
        const formattedVal = formatPED(msg.value);
        floatEl.textContent = (msg.value > 0 ? '+' : '') + formattedVal + (isMe ? ' PED' : '');
        
        if (!isMe) {
            floatEl.style.opacity = '0.4';
            floatEl.style.fontSize = '0.8rem';
        }

        layer.appendChild(floatEl);
        setTimeout(() => floatEl.remove(), 1000);
        el.remove();
    }
}

function syncStateClient(msg) {
    if (gameStatus === 'lobby') {
        gameStatus = 'playing';
        $('#cinematic-screen').classList.add('hidden');
        $('#game-instructions').classList.remove('hidden');
        $('#game-status').textContent = 'PLAYING';
        $('#game-status').className = 'badge playing';
    }

    timeRemaining = msg.timeRemaining;
    $('#timer-stat').textContent = `TIME ${timeRemaining}s`;
    scores.clear();
    msg.scores.forEach(([id, val]) => {
        scores.set(id, val);
        if (id === myId) $('#score-stat').textContent = `MY PED: ${formatPED(val)}`;
    });
}

function showGameOver(msg) {
    gameStatus = 'finished';
    $('#game-status').textContent = 'FINISHED';
    $('#game-status').className = 'badge closed';
    $('#target-layer').innerHTML = ''; 
    $('#game-instructions').classList.add('hidden'); 

    const winnerData = rosterData.get(msg.winnerId);
    const winnerName = winnerData ? winnerData.name : 'UNKNOWN OPERATOR';
    
    $('#winner-display').textContent = `MISSION ACCOMPLISHED // WINNER: ${winnerName}`;
    
    let finalHtml = '';
    msg.finalScores.sort((a, b) => b[1] - a[1]).forEach(([id, score], index) => {
        const p = rosterData.get(id);
        const name = p ? p.name : id;
        finalHtml += `<div>#${index+1} <b style="color:var(--accent);">${escapeHtml(name)}</b> — ${formatPED(score)} PED</div>`;
    });
    $('#final-scores-display').innerHTML = finalHtml;

    $('#game-over-screen').classList.remove('hidden');
    if (isHost) {
        $('#return-lobby-btn').classList.remove('hidden');
    }
}

function resetToLobbyClient() {
    gameStatus = 'lobby';
    scores.clear();
    $('#target-layer').innerHTML = '';
    $('#game-over-screen').classList.add('hidden');
    $('#game-instructions').classList.add('hidden');
    $('#game-status').textContent = 'WAITING';
    $('#game-status').className = 'badge waiting';
    $('#timer-stat').textContent = 'TIME 60s';
    $('#score-stat').textContent = 'MY PED: 0.00';
}

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}