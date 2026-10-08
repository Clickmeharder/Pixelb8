'use strict';

// OUT DRIVE 2 multiplayer integration. The original campaign and arcade
// systems above remain local; this layer adds synchronized online races.
const multiplayerPanel = document.getElementById('multiplayer-panel');
const multiplayerQuery = new URLSearchParams(window.location.search);
const multiplayerTransport = window.ArcadeMultiplayer;
const multiplayerRemoteCars = new Map();
const multiplayerFinishers = new Map();

let multiplayerRooms = [];
let multiplayerRoster = [];
let multiplayerRoomCode = '';
let multiplayerRole = 'player';
let multiplayerHost = false;
let multiplayerConnected = false;
let multiplayerRaceActive = false;
let multiplayerRaceFinalized = false;
let multiplayerRaceId = '';
let multiplayerStartAt = 0;
let multiplayerTrack = 1;
let multiplayerStatus = 'Connecting to the multiplayer directory…';
let multiplayerReportedFinish = false;
let multiplayerSharedStandings = [];
let multiplayerFinalizeTimer = 0;
let multiplayerStandingsTimer = 0;
let multiplayerPlayerName = localStorage.getItem('outdrive2_player_name') || `RACER_${Math.floor(Math.random() * 9000 + 1000)}`;

function multiplayerEscape(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[character]);
}

function multiplayerSafeName(value) {
    return String(value || '').replace(/[^\w \-]/g, '').trim().slice(0, 18) || `RACER_${Math.floor(Math.random() * 9000 + 1000)}`;
}

function multiplayerColor(id) {
    const colors = ['#00e5ff', '#ff4fd8', '#ffe13b', '#65ff72', '#ff7147', '#9f78ff'];
    let hashValue = 0;
    for (const character of String(id || multiplayerPlayerName)) hashValue = (hashValue * 31 + character.charCodeAt(0)) >>> 0;
    return colors[hashValue % colors.length];
}

function multiplayerPlayerCount() {
    return multiplayerRoster.filter(person => person.role !== 'spectator').length;
}

function multiplayerSetName() {
    const input = document.getElementById('mpPlayerName');
    multiplayerPlayerName = multiplayerSafeName(input?.value || multiplayerPlayerName);
    localStorage.setItem('outdrive2_player_name', multiplayerPlayerName);
    multiplayerTransport?.setPlayerName(multiplayerPlayerName);
}

function multiplayerRoomCards() {
    if (!multiplayerRooms.length) return '<div class="mp-empty">No online races are open. Host the first one.</div>';
    return multiplayerRooms.map(room => {
        const archived = room.archived || room.status === 'closed' || room.status === 'finished';
        const full = Number(room.playerCount || 0) >= Number(room.maxPlayers || 6);
        const canJoin = !archived && !full && room.status === 'waiting';
        const canWatch = !archived && room.status === 'playing';
        return `
            <article class="mp-room">
                <div class="mp-room-head">
                    <span>${multiplayerEscape(room.name || 'Out Drive Race')}</span>
                    <span>${multiplayerEscape(room.code)}</span>
                </div>
                <div class="mp-room-meta">
                    ${multiplayerEscape(String(room.status || 'waiting').toUpperCase())}
                    · ${Number(room.playerCount || 0)}/${Number(room.maxPlayers || 6)} racers
                    · Track ${Number(room.track || 1)}
                </div>
                ${archived && room.result ? `<div class="mp-result">${multiplayerEscape(room.result)}</div>` : ''}
                <div class="mp-row">
                    <button class="mp-btn" data-mp-join="${multiplayerEscape(room.code)}" ${canJoin ? '' : 'disabled'}>JOIN RACE</button>
                    <button class="mp-btn secondary" data-mp-watch="${multiplayerEscape(room.code)}" ${canWatch ? '' : 'disabled'}>WATCH</button>
                </div>
            </article>`;
    }).join('');
}

function multiplayerRosterChips() {
    if (!multiplayerRoster.length) return '<div class="mp-empty">Waiting for racers…</div>';
    return multiplayerRoster.map(person => `
        <span class="mp-chip">
            ${person.id === multiplayerTransport?.getHostId() ? '♛ ' : ''}
            ${multiplayerEscape(person.name)}
            ${person.role === 'spectator' ? ' · WATCHING' : ''}
        </span>`).join('');
}

function multiplayerTrackOptions() {
    return LEVELS.slice(1).map((level, index) => `
        <option value="${index + 1}" ${index + 1 === multiplayerTrack ? 'selected' : ''}>
            ${index + 1}. ${multiplayerEscape(level.name)}
        </option>`).join('');
}

function renderMultiplayerLobby() {
    if (!multiplayerPanel.classList.contains('open')) return;
    const inRoom = Boolean(multiplayerRoomCode);
    const racers = multiplayerPlayerCount();
    multiplayerPanel.innerHTML = `
        <h2>OUT DRIVE 2 ONLINE</h2>
        <div class="mp-status">${multiplayerEscape(multiplayerStatus)}</div>
        ${inRoom ? `
            <div class="mp-room">
                <div class="mp-room-head">
                    <span>ROOM ${multiplayerEscape(multiplayerRoomCode)}</span>
                    <span>${multiplayerHost ? 'HOST' : multiplayerRole === 'spectator' ? 'SPECTATOR' : 'RACER'}</span>
                </div>
                <div class="mp-room-meta">${racers}/6 racers · ${multiplayerRoster.filter(person => person.role === 'spectator').length} watching</div>
            </div>
            <h3>RACERS</h3>
            <div class="mp-roster">${multiplayerRosterChips()}</div>
            ${multiplayerHost ? `
                <h3>HOST RACE CONTROL</h3>
                <select class="mp-select" id="mpTrackSelect">${multiplayerTrackOptions()}</select>
                <button class="mp-btn" id="mpStartRace" ${racers >= 2 ? '' : 'disabled'}>
                    ${racers >= 2 ? 'START SYNCHRONIZED RACE' : 'WAITING FOR 2 RACERS'}
                </button>
            ` : '<p class="mp-help">The host chooses the course and starts the synchronized countdown.</p>'}
            <div class="mp-row">
                <button class="mp-btn danger" id="mpLeaveRoom">LEAVE ROOM</button>
            </div>
        ` : `
            <div class="mp-grid">
                <div>
                    <h3>YOUR RACER</h3>
                    <input class="mp-input" id="mpPlayerName" maxlength="18" value="${multiplayerEscape(multiplayerPlayerName)}" aria-label="Racer name">
                    <button class="mp-btn" id="mpHostRoom">HOST NEW RACE</button>
                </div>
                <div>
                    <h3>JOIN BY CODE</h3>
                    <input class="mp-input" id="mpRoomCode" maxlength="6" placeholder="ROOM CODE" aria-label="Room code">
                    <div class="mp-row">
                        <button class="mp-btn" id="mpJoinCode">JOIN</button>
                        <button class="mp-btn secondary" id="mpWatchCode">WATCH</button>
                    </div>
                </div>
            </div>
            <h3>LIVE ROOMS</h3>
            <div class="mp-room-list">${multiplayerRoomCards()}</div>
            <div class="mp-row"><button class="mp-btn secondary" id="mpCloseLobby">BACK TO GAME</button></div>
        `}
        <p class="mp-help">Casual public-broker multiplayer · Up to 6 racers · Opponent positions and live standings update throughout the race.</p>`;
}

function openOutDriveMultiplayer() {
    startPanel.classList.add('hidden');
    gameoverPanel.classList.add('hidden');
    multiplayerPanel.classList.add('open');
    gameState = 'MULTIPLAYER_LOBBY';
    paused = false;
    stopEngine();
    resetControls();
    renderMultiplayerLobby();
}

function closeOutDriveMultiplayer() {
    if (multiplayerRoomCode || multiplayerRaceActive) return;
    multiplayerPanel.classList.remove('open');
    gameState = 'MAIN_MENU';
}

function multiplayerHostRoom() {
    if (!multiplayerTransport) return;
    multiplayerSetName();
    multiplayerRole = 'player';
    multiplayerStatus = 'Creating race room…';
    multiplayerRoomCode = multiplayerTransport.hostRoom({
        mode: 'race',
        maxPlayers: 6,
        name: `${multiplayerPlayerName}'s Out Drive Race`
    });
    renderMultiplayerLobby();
}

function multiplayerJoinRoom(code, role = 'player') {
    if (!multiplayerTransport) return;
    const cleaned = String(code || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (!cleaned) {
        multiplayerStatus = 'Enter a valid room code.';
        renderMultiplayerLobby();
        return;
    }
    multiplayerSetName();
    multiplayerRole = role === 'spectator' ? 'spectator' : 'player';
    multiplayerRoomCode = cleaned;
    multiplayerStatus = `${multiplayerRole === 'spectator' ? 'Watching' : 'Joining'} room ${cleaned}…`;
    multiplayerTransport.joinRoom(cleaned, multiplayerRole);
    renderMultiplayerLobby();
}

async function multiplayerLeaveRoom() {
    multiplayerStatus = 'Leaving room…';
    renderMultiplayerLobby();
    try { await multiplayerTransport?.disconnect(); } catch (_) {}
    const cleanUrl = `${window.location.pathname}`;
    window.location.replace(cleanUrl);
}

function multiplayerVehicleType() {
    if (currentLevel().vehicle === 'ship') return 'SHIP';
    if (currentLevel().vehicle === 'bumper') return 'BUMPER';
    return 'RACER';
}

function multiplayerLocalState() {
    return {
        id: multiplayerTransport?.getClientId(),
        name: multiplayerPlayerName,
        raceId: multiplayerRaceId,
        level: selectedLevel,
        z: pos,
        x: playerX,
        speed,
        gear: currentGear,
        state: gameState,
        finished: multiplayerReportedFinish,
        color: multiplayerColor(multiplayerTransport?.getClientId()),
        vehicleType: multiplayerVehicleType(),
        receivedAt: Date.now()
    };
}

function multiplayerStandings() {
    const states = new Map(multiplayerRemoteCars);
    if (multiplayerRaceActive && multiplayerRole !== 'spectator') {
        const localState = multiplayerLocalState();
        states.set(localState.id, localState);
    }
    return Array.from(states.values())
        .filter(state => state.raceId === multiplayerRaceId && state.level === selectedLevel)
        .sort((a, b) => Number(b.finished) - Number(a.finished) || Number(b.z || 0) - Number(a.z || 0))
        .map((state, index) => ({ ...state, place: index + 1 }));
}

function getMultiplayerRenderCars() {
    if (!multiplayerRaceActive) return [];
    const now = Date.now();
    return Array.from(multiplayerRemoteCars.values())
        .filter(car =>
            car.raceId === multiplayerRaceId &&
            car.level === selectedLevel &&
            car.id !== multiplayerTransport?.getClientId()
        )
        .map((car, index) => {
            const predictionTime = Math.min(0.35, Math.max(0, (now - Number(car.receivedAt || now)) / 1000));
            return {
                ...car,
                z: Number(car.z || 0) + Number(car.speed || 0) * MPH_TO_MPS * predictionTime,
                x: Number(car.x || 0),
                speed: Number(car.speed || 0),
                racerId: car.place || index + 1,
                kind: 'multiplayer'
            };
        });
}

function isMultiplayerSpectator() {
    return multiplayerRaceActive && multiplayerRole === 'spectator';
}

function multiplayerPrepareRace(message) {
    if (!message?.raceId || (multiplayerRaceActive && multiplayerRaceId === message.raceId)) return;
    multiplayerRaceId = message.raceId;
    multiplayerTrack = clamp(Number(message.level) || 1, 1, MAX_LEVEL);
    multiplayerStartAt = Number(message.startAt) || Date.now() + 3500;
    multiplayerRaceActive = true;
    multiplayerRaceFinalized = false;
    multiplayerReportedFinish = false;
    multiplayerFinishers.clear();
    multiplayerRemoteCars.clear();
    multiplayerSharedStandings = [];
    mode = 'MULTIPLAYER';
    selectedLevel = multiplayerTrack;
    startPanel.classList.add('hidden');
    gameoverPanel.classList.add('hidden');
    multiplayerPanel.classList.remove('open');
    initAudio();
    startRaceSequence();
    countdownTimer = Math.max(0.15, (multiplayerStartAt - Date.now()) / 1000);
    countdownValue = Math.max(1, Math.ceil(countdownTimer));
    multiplayerTransport?.updatePresence({ status: multiplayerRole === 'spectator' ? 'watching' : 'racing' });
    multiplayerStatus = `Race underway on ${currentLevel().name}.`;
}

function multiplayerStartRace() {
    if (!multiplayerHost || multiplayerRaceActive || multiplayerPlayerCount() < 2) return;
    const select = document.getElementById('mpTrackSelect');
    multiplayerTrack = clamp(Number(select?.value) || 1, 1, MAX_LEVEL);
    multiplayerRaceId = `${multiplayerRoomCode}-${Date.now().toString(36)}`;
    multiplayerStartAt = Date.now() + 4500;
    const message = {
        raceId: multiplayerRaceId,
        level: multiplayerTrack,
        startAt: multiplayerStartAt
    };
    multiplayerTransport.updateRoom({
        status: 'playing',
        archived: false,
        expiresAt: null,
        track: multiplayerTrack,
        trackName: LEVELS[multiplayerTrack].name,
        lastResult: ''
    });
    multiplayerTransport.publish('RACE_START', message);
    multiplayerPrepareRace(message);
}

function multiplayerReportFinish(won, reason = '') {
    if (!multiplayerRaceActive || multiplayerRole === 'spectator' || multiplayerReportedFinish) return;
    multiplayerReportedFinish = true;
    stopEngine();
    resetControls();
    gameState = 'MULTIPLAYER_RESULTS';
    const record = {
        raceId: multiplayerRaceId,
        level: selectedLevel,
        finished: Boolean(won && pos >= currentLevel().length),
        finishAt: Date.now(),
        distance: Math.floor(pos),
        score: Math.floor(score),
        reason: reason || (won ? 'FINISHED' : 'DID NOT FINISH')
    };
    multiplayerTransport.publish('RACE_FINISH', record);
    multiplayerTransport.updatePresence({ status: record.finished ? 'finished' : 'dnf' });
    resultTitle.textContent = record.finished ? 'FINISH RECORDED!' : 'RACE OVER';
    resultTitle.style.color = record.finished ? '#00ffcc' : '#ff5555';
    finalScoreText.innerHTML = `${multiplayerEscape(currentLevel().name)}<br>DISTANCE: ${record.distance}m / ${currentLevel().length}m<br>SCORE: ${record.score}<br>Waiting for final standings…`;
    resultNextHint.textContent = 'Results will appear when the remaining racers finish';
    gameoverPanel.classList.remove('hidden');
}

function multiplayerFinalStandings() {
    return Array.from(multiplayerFinishers.values()).sort((a, b) => {
        if (Boolean(a.finished) !== Boolean(b.finished)) return Number(b.finished) - Number(a.finished);
        if (a.finished && b.finished) return Number(a.finishAt) - Number(b.finishAt);
        return Number(b.distance || 0) - Number(a.distance || 0);
    });
}

function multiplayerMaybeFinalize(force = false) {
    if (!multiplayerHost || multiplayerRaceFinalized || !multiplayerRaceActive) return;
    const activePlayers = multiplayerRoster.filter(person => person.role !== 'spectator');
    const allReported = activePlayers.length > 0 && activePlayers.every(person => multiplayerFinishers.has(person.id));
    if (!allReported && !force) return;

    multiplayerRaceFinalized = true;
    if (multiplayerFinalizeTimer) window.clearTimeout(multiplayerFinalizeTimer);
    const standings = multiplayerFinalStandings().map((entry, index) => ({
        ...entry,
        place: index + 1
    }));
    const winner = standings.find(entry => entry.finished) || standings[0];
    const result = winner
        ? `${winner.name} won ${LEVELS[multiplayerTrack].name}.`
        : `Race completed on ${LEVELS[multiplayerTrack].name}.`;
    const resultMessage = { raceId: multiplayerRaceId, level: multiplayerTrack, standings, result };
    multiplayerTransport.publish('RACE_RESULT', resultMessage);
    multiplayerTransport.updateRoom({
        status: 'finished',
        archived: true,
        lastResult: result,
        result,
        playerSnapshot: standings.map(entry => ({
            id: entry.id,
            name: entry.name,
            status: entry.finished ? `P${entry.place}` : 'DNF'
        })),
        playerStates: Object.fromEntries(standings.map(entry => [entry.id, entry.finished ? `P${entry.place}` : 'DNF'])),
        expiresAt: Date.now() + 180000
    });
    multiplayerHandleResult(resultMessage);
}

function multiplayerHandleResult(message) {
    if (message.raceId !== multiplayerRaceId) return;
    multiplayerRaceActive = false;
    multiplayerRaceFinalized = true;
    multiplayerSharedStandings = message.standings || [];
    stopEngine();
    resetControls();
    gameoverPanel.classList.add('hidden');
    multiplayerPanel.classList.add('open');
    gameState = 'MULTIPLAYER_RESULTS';
    multiplayerStatus = message.result || 'Race complete.';
    multiplayerPanel.innerHTML = `
        <h2>FINAL STANDINGS</h2>
        <div class="mp-result">${multiplayerEscape(multiplayerStatus)}</div>
        <div class="mp-room-list" style="margin-top:7px">
            ${(message.standings || []).map(entry => `
                <div class="mp-room">
                    <div class="mp-room-head">
                        <span>${entry.place}. ${multiplayerEscape(entry.name)}</span>
                        <span>${entry.finished ? 'FINISHED' : 'DNF'}</span>
                    </div>
                    <div class="mp-room-meta">${Math.floor(entry.distance || 0)}m · ${Math.floor(entry.score || 0)} points</div>
                </div>`).join('') || '<div class="mp-empty">No finishing data received.</div>'}
        </div>
        <p class="mp-help">This result remains visible in the Arcade room browser for three minutes.</p>
        <button class="mp-btn danger" id="mpLeaveRoom">LEAVE RESULTS</button>`;
}

function multiplayerHandleMessage(message) {
    if (!message?.type) return;
    if (message.type === 'JOIN' && multiplayerHost && multiplayerRaceActive) {
        multiplayerTransport.publish('RACE_START', {
            targetId: message.senderId,
            raceId: multiplayerRaceId,
            level: multiplayerTrack,
            startAt: multiplayerStartAt
        });
        return;
    }
    if (message.targetId && message.targetId !== multiplayerTransport?.getClientId()) return;
    if (message.type === 'RACE_START') {
        multiplayerPrepareRace(message);
    } else if (message.type === 'RACE_STATE' && message.raceId === multiplayerRaceId) {
        multiplayerRemoteCars.set(message.senderId, {
            id: message.senderId,
            name: message.name,
            raceId: message.raceId,
            level: Number(message.level),
            z: Number(message.z || 0),
            x: Number(message.x || 0),
            speed: Number(message.speed || 0),
            gear: Number(message.gear || 1),
            state: message.state,
            finished: Boolean(message.finished),
            color: message.color || multiplayerColor(message.senderId),
            vehicleType: message.vehicleType || 'RACER',
            receivedAt: Date.now()
        });
    } else if (message.type === 'RACE_STANDINGS' && message.raceId === multiplayerRaceId) {
        multiplayerSharedStandings = message.standings || [];
    } else if (message.type === 'RACE_FINISH' && multiplayerHost && message.raceId === multiplayerRaceId) {
        multiplayerFinishers.set(message.senderId, {
            id: message.senderId,
            name: message.name,
            finished: Boolean(message.finished),
            finishAt: Number(message.finishAt || Date.now()),
            distance: Number(message.distance || 0),
            score: Number(message.score || 0),
            reason: message.reason || ''
        });
        if (!multiplayerFinalizeTimer) {
            multiplayerFinalizeTimer = window.setTimeout(() => multiplayerMaybeFinalize(true), 15000);
        }
        multiplayerMaybeFinalize(false);
    } else if (message.type === 'RACE_RESULT') {
        multiplayerHandleResult(message);
    }
}

function multiplayerDrawStandings() {
    if (!multiplayerRaceActive) return;
    const standings = multiplayerSharedStandings.length ? multiplayerSharedStandings : multiplayerStandings();
    if (!standings.length) return;
    ctx.save();
    ctx.fillStyle = 'rgba(3,8,12,.72)';
    ctx.fillRect(WIDTH - 119, 48, 111, Math.min(6, standings.length) * 12 + 17);
    ctx.strokeStyle = 'rgba(0,255,204,.65)';
    ctx.strokeRect(WIDTH - 118.5, 48.5, 110, Math.min(6, standings.length) * 12 + 16);
    ctx.font = 'bold 7px "Courier New", monospace';
    ctx.fillStyle = '#00ffcc';
    ctx.textAlign = 'left';
    ctx.fillText(multiplayerRole === 'spectator' ? 'LIVE RACE · WATCHING' : 'LIVE RACE', WIDTH - 113, 58);
    standings.slice(0, 6).forEach((entry, index) => {
        ctx.fillStyle = entry.id === multiplayerTransport?.getClientId() ? '#ffe13b' : '#fff';
        ctx.fillText(`${index + 1}. ${String(entry.name || 'RACER').slice(0, 10)}`, WIDTH - 113, 70 + index * 12);
    });
    ctx.restore();
}

function multiplayerUpdateSpectator(dt) {
    if (!multiplayerRaceActive || multiplayerRole !== 'spectator') return;
    if (gameState === 'STARTING') {
        countdownTimer = Math.max(0, (multiplayerStartAt - Date.now()) / 1000);
        countdownValue = Math.max(1, Math.ceil(countdownTimer));
        if (countdownTimer <= 0) {
            gameState = 'RACING';
            goFlashTimer = 1.1;
        }
    }
    const leaders = multiplayerStandings();
    const leader = leaders[0];
    if (leader) {
        pos += ((Number(leader.z || 0) - 150) - pos) * Math.min(1, dt * 5);
        playerX += (Number(leader.x || 0) - playerX) * Math.min(1, dt * 5);
        speed += (Number(leader.speed || 0) - speed) * Math.min(1, dt * 5);
        currentGear = Number(leader.gear || 1);
    }
    goFlashTimer = Math.max(0, goFlashTimer - dt);
}

multiplayerPanel.addEventListener('click', event => {
    const join = event.target.closest('[data-mp-join]');
    const watch = event.target.closest('[data-mp-watch]');
    if (join) return multiplayerJoinRoom(join.dataset.mpJoin, 'player');
    if (watch) return multiplayerJoinRoom(watch.dataset.mpWatch, 'spectator');
    if (event.target.closest('#mpHostRoom')) return multiplayerHostRoom();
    if (event.target.closest('#mpJoinCode')) return multiplayerJoinRoom(document.getElementById('mpRoomCode')?.value, 'player');
    if (event.target.closest('#mpWatchCode')) return multiplayerJoinRoom(document.getElementById('mpRoomCode')?.value, 'spectator');
    if (event.target.closest('#mpStartRace')) return multiplayerStartRace();
    if (event.target.closest('#mpLeaveRoom')) return multiplayerLeaveRoom();
    if (event.target.closest('#mpCloseLobby')) return closeOutDriveMultiplayer();
});

multiplayerPanel.addEventListener('change', event => {
    if (event.target.id === 'mpTrackSelect') {
        multiplayerTrack = clamp(Number(event.target.value) || 1, 1, MAX_LEVEL);
        multiplayerTransport?.updateRoom({
            track: multiplayerTrack,
            trackName: LEVELS[multiplayerTrack].name
        });
    }
});

window.addEventListener('keydown', event => {
    if (event.key === 'Escape' && multiplayerPanel.classList.contains('open') && !multiplayerRoomCode) {
        event.preventDefault();
        closeOutDriveMultiplayer();
    }
});

const singlePlayerShowResult = showResult;
showResult = function multiplayerAwareShowResult(won, reason = '') {
    if (multiplayerRaceActive && multiplayerRole !== 'spectator') {
        multiplayerReportFinish(won, reason);
        return;
    }
    singlePlayerShowResult(won, reason);
};

const singlePlayerUpdate = update;
update = function multiplayerAwareUpdate(dt) {
    if (multiplayerRaceActive && multiplayerRole === 'spectator') {
        multiplayerUpdateSpectator(dt);
        return;
    }
    singlePlayerUpdate(dt);
};

const singlePlayerDrawHud = drawHUD;
drawHUD = function multiplayerAwareDrawHud() {
    singlePlayerDrawHud();
    multiplayerDrawStandings();
};

window.setInterval(() => {
    if (!multiplayerRaceActive || multiplayerRole === 'spectator' || !multiplayerRaceId) return;
    if (!['STARTING', 'RACING', 'FINISHING', 'CRASHING', 'BUSTED'].includes(gameState)) return;
    multiplayerTransport?.publish('RACE_STATE', multiplayerLocalState());
}, 100);

multiplayerStandingsTimer = window.setInterval(() => {
    if (!multiplayerHost || !multiplayerRaceActive) return;
    const standings = multiplayerStandings();
    multiplayerSharedStandings = standings;
    multiplayerTransport?.publish('RACE_STANDINGS', {
        raceId: multiplayerRaceId,
        standings: standings.map(entry => ({
            id: entry.id,
            name: entry.name,
            place: entry.place,
            z: Math.floor(entry.z || 0),
            finished: Boolean(entry.finished)
        }))
    });
    multiplayerTransport?.updateRoom({
        status: 'playing',
        track: multiplayerTrack,
        playerStates: Object.fromEntries(standings.map(entry => [entry.id, `P${entry.place}`]))
    });
}, 1000);

if (!multiplayerTransport) {
    multiplayerStatus = 'multiplayer.js could not be loaded.';
} else {
    multiplayerTransport.init({
        gameId: 'outdrive2',
        playerName: multiplayerPlayerName,
        onRooms(rooms) {
            multiplayerRooms = rooms;
            renderMultiplayerLobby();
        },
        onRoster(roster) {
            multiplayerRoster = roster;
            if (multiplayerHost && multiplayerRaceActive) multiplayerMaybeFinalize(false);
            renderMultiplayerLobby();
        },
        onMessage: multiplayerHandleMessage,
        onConnected(info) {
            multiplayerConnected = true;
            multiplayerRoomCode = info.code;
            multiplayerHost = Boolean(info.isHost);
            multiplayerRole = info.role || multiplayerRole;
            multiplayerStatus = multiplayerHost
                ? `Room ${info.code} created. Share the code or wait for racers.`
                : `${multiplayerRole === 'spectator' ? 'Watching' : 'Joined'} room ${info.code}.`;
            if (multiplayerHost) {
                multiplayerTransport.updateRoom({
                    mode: 'race',
                    maxPlayers: 6,
                    track: multiplayerTrack,
                    trackName: LEVELS[multiplayerTrack].name,
                    status: 'waiting'
                });
            }
            renderMultiplayerLobby();
        },
        onError(error) {
            multiplayerStatus = `Multiplayer error: ${error.message}`;
            renderMultiplayerLobby();
        }
    });
}

const directRoom = multiplayerQuery.get('room');
const directRole = multiplayerQuery.get('role') === 'spectator' ? 'spectator' : 'player';
if (directRoom) {
    openOutDriveMultiplayer();
    multiplayerJoinRoom(directRoom, directRole);
}

window.OutDriveMultiplayer = {
    open: openOutDriveMultiplayer,
    getRoom: () => multiplayerRoomCode,
    isRacing: () => multiplayerRaceActive
};