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

            return {
                init,
                playJoin: () => { playTone(500, 'sine', 0.1, 0.1); setTimeout(()=>playTone(700, 'sine', 0.2, 0.1), 100); },
                playMarch: () => { playTone(300, 'square', 0.15, 0.15, 500); },
                playCombat: () => { playTone(150, 'sawtooth', 0.25, 0.2, 80); },
                playTick: () => playTone(800, 'square', 0.02, 0.05),
                playWin: () => { [300, 400, 500, 600, 800].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.3, 0.15), i*100)); },
                playLose: () => { [400, 350, 300, 250, 200].forEach((f, i) => setTimeout(() => playTone(f, 'sawtooth', 0.4, 0.1), i*200)); }
            };
        })();

        document.body.addEventListener('click', SoundFX.init, { once: true });

        const PLAYER_COLORS = { 1: 'var(--p1-color)', 2: 'var(--p2-color)', 3: 'var(--p3-color)', 4: 'var(--p4-color)' };
        const DISTRICT_NAMES = { "tech": "Tech Core", "docks": "Ind. Docks", "slums": "The Slums", "downtown": "Downtown" };
        const DISTRICT_ICONS = { "tech": "⚡", "docks": "⚓", "slums": "🏚️", "downtown": "🏢" };
        const DISTRICT_DESCS = {
            "tech": "Central chokepoint. Generates +4 units every 2 rounds.",
            "docks": "Outer perimeter. Generates +2 units/round.",
            "slums": "Buffer zone. Generates +1 unit/round.",
            "downtown": "Urban center. Generates +1 unit/round."
        };

        // State Variables
        let currentRooms = [];
        let roomCode = '';
        let myId = '';
        let isHost = false;
        let lastPlayerCount = 0;
        
        let displayName = localStorage.getItem('pixelb8RunnerName') || `Runner_${Math.floor(Math.random() * 9000)}`;
        $('#player-name').value = displayName;

        let gameMode = 'pvp'; 
        let aiConfig = {}; 

        let gridSize = 4;
        let maxPlayers = 2;
        let isZoomedIn = true; 
        let showIcons = true; // Toggle state

        let boardState = []; 
        let lastMove = null; 
        let currentRound = 1;
        let playerStats = { 1: { nodes: 0, troops: 0, id: null }, 2: { nodes: 0, troops: 0, id: null }, 3: { nodes: 0, troops: 0, id: null }, 4: { nodes: 0, troops: 0, id: null } };
        let currentTurn = 1; 
        let gameStatus = 'waiting'; 
        let selectedIndex = -1;

        const TURN_TIME_LIMIT = 45; 
        let hostTimerInterval = null;
        let cinematicWaitTimeout = null;
        let turnTimeLeft = TURN_TIME_LIMIT;
        let countdownLeft = 30; 
        let myPlayerNum = 0; 
        let playerSlots = { 1: null, 2: null, 3: null, 4: null };

        let cineInterval = null;
        let cineAnimFrame = null;

        // --- INIT NETWORK ---
        MP.init({
            gameId: 'gridrunner',
            playerName: displayName,
            onRooms: rooms => { currentRooms = rooms; renderRooms(); },
            onRoster: roster => { 
                if (roster.length > lastPlayerCount && lastPlayerCount > 0 && gameStatus === 'waiting') SoundFX.playJoin();
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
            gridSize = parseInt($('#grid-size-select').value, 10) || 4;
            maxPlayers = parseInt($('#max-players-select').value, 10) || 2;
            gameMode = $('#game-mode-select').value;
            isZoomedIn = gridSize > 4; 
            
            const netMaxPlayers = gameMode.startsWith('pve') ? 1 : maxPlayers;
            MP.hostRoom({ code, mode: 'gridrunner', maxPlayers: netMaxPlayers, name: `${displayName}'s Sprawl (${gridSize}x${gridSize})` });
        };
        $('#join-code-btn').onclick = () => joinRoom($('#join-code').value);
        $('#leave-room').onclick = () => { MP.disconnect(); location.reload(); };
        $('#copy-code').onclick = async () => { await navigator.clipboard?.writeText(roomCode); $('#copy-code').textContent = 'COPIED!'; setTimeout(() => $('#copy-code').textContent = 'COPY CODE', 1200); };
        
        $('#btn-zoom').onclick = () => {
            isZoomedIn = !isZoomedIn;
            $('#btn-zoom').textContent = isZoomedIn ? "🔍 ZOOM OUT" : "🔍 ZOOM IN";
            drawBoard();
        };

        $('#btn-toggle-icons').onclick = () => {
            showIcons = !showIcons;
            $('#btn-toggle-icons').textContent = showIcons ? "👀 HIDE ICONS" : "👀 SHOW ICONS";
            drawBoard();
        };

        function safePublish(type, payload = {}) {
            MP.publish(type, payload);
            if (isHost) handleNetworkMessage({ type, senderId: myId, ...payload });
        }

        function rememberName() { displayName = $('#player-name').value.trim().slice(0, 18) || displayName; localStorage.setItem('pixelb8RunnerName', displayName); MP.setPlayerName(displayName); }
        function joinRoom(code) { rememberName(); code = String(code || '').trim().toUpperCase(); if (code) MP.joinRoom(code, 'player'); }

        function renderRooms() {
            const rl = $('#room-list');
            if (!currentRooms.length) { rl.innerHTML = '<div class="empty">No urban sectors open. Host one!</div>'; return; }
            rl.innerHTML = currentRooms.map(r => {
                const full = r.playerCount >= (r.maxPlayers || 2);
                return `
                <div class="room-card">
                    <div class="room-top"><b>${escapeHtml(r.name)}</b> <span class="badge ${r.status}">${r.status}</span></div>
                    <div class="room-meta"><span>[${r.code}]</span> <span>⚡ ${r.playerCount}/${r.maxPlayers || 2} Players</span></div>
                    <button class="primary" onclick="$('#join-code').value='${r.code}'; joinRoom('${r.code}');" ${full ? 'disabled' : ''}>
                        ${full ? 'SECTOR FULL' : 'JOIN SECTOR'}
                    </button>
                </div>`;
            }).join('');
        }

        function enterTable() {
            $('#lobby-view').classList.add('hidden'); 
            $('#game-view').classList.remove('hidden');
            $('#room-details').textContent = `Sector ${roomCode}`;
            initEmptyBoard();
            
            // Initialize Universal Cyber Chat
            if (window.CyberChat) {
                window.CyberChat.init('cyber-chat', (senderId) => {
                    let pNum = Object.keys(playerSlots).find(k => playerSlots[k] === senderId);
                    return pNum ? PLAYER_COLORS[pNum] : 'var(--muted)';
                });
            }

            // Trigger local cinematic drop immediately for this client/host
            triggerCinematicAnimation();
        }

        function assignPlayers(roster) {
            if (!isHost) return;
            const currentRosterIds = roster.map(r => r.id);

            if (gameStatus === 'waiting') {
                playerSlots = { 1: myId, 2: null, 3: null, 4: null };
                
                if (gameMode.startsWith('pve')) {
                    const diff = gameMode.split('-')[1];
                    for(let i=2; i<=maxPlayers; i++) {
                        playerSlots[i] = `AI_BOT_${i}`;
                        aiConfig[i] = diff;
                    }
                    MP.updateRoom({ status: 'playing' }); 
                    safePublish('SYNC_PLAYERS', { playerSlots, gridSize, maxPlayers, gameMode });
                    handleNetworkMessage({ type: 'SYNC_PLAYERS', playerSlots, gridSize, maxPlayers, gameMode });
                    
                    gameStatus = 'starting_wait';
                    cinematicWaitTimeout = setTimeout(() => { hostStartCountdown(); }, 9000);
                    return;
                }

                let slotIndex = 2;
                roster.forEach(p => {
                    if (p.id !== myId && slotIndex <= maxPlayers) {
                        playerSlots[slotIndex] = p.id;
                        slotIndex++;
                    }
                });

                safePublish('SYNC_PLAYERS', { playerSlots, gridSize, maxPlayers, gameMode });
                handleNetworkMessage({ type: 'SYNC_PLAYERS', playerSlots, gridSize, maxPlayers, gameMode }); 

                const activeCount = Object.values(playerSlots).filter(Boolean).length;
                if (activeCount >= maxPlayers) {
                    MP.updateRoom({ status: 'playing' }); 
                    
                    // Delay host countdown to allow last joining player to watch cinematic locally
                    gameStatus = 'starting_wait'; 
                    cinematicWaitTimeout = setTimeout(() => { hostStartCountdown(); }, 10000);
                }

            } else if (gameStatus === 'starting_wait' || gameStatus === 'starting') {
                if (gameMode.startsWith('pve')) return;
                let someoneLeft = false;
                let droppedNames = [];
                for (let p = 1; p <= maxPlayers; p++) {
                    if (playerSlots[p] && !currentRosterIds.includes(playerSlots[p])) {
                        someoneLeft = true;
                        droppedNames.push(`P${p}`);
                    }
                }
                if (someoneLeft) {
                    if (cinematicWaitTimeout) clearTimeout(cinematicWaitTimeout);
                    if (hostTimerInterval) clearInterval(hostTimerInterval);
                    
                    gameStatus = 'waiting';
                    MP.updateRoom({ status: 'waiting' }); 
                    
                    safePublish('ANNOUNCE', { text: `DEPLOYMENT ABORTED: ${droppedNames.join(', ')} DISCONNECTED.`, alertType: 'danger' });
                    handleNetworkMessage({ type: 'ANNOUNCE', text: `DEPLOYMENT ABORTED: ${droppedNames.join(', ')} DISCONNECTED.`, alertType: 'danger' });
                    
                    safePublish('SYNC_BOARD', { boardState, playerStats, currentTurn, currentRound, gameStatus: 'waiting', gridSize, maxPlayers, countdownLeft, lastMove });
                    handleNetworkMessage({ type: 'SYNC_BOARD', boardState, playerStats, currentTurn, currentRound, gameStatus: 'waiting', gridSize, maxPlayers, countdownLeft, lastMove });
                    assignPlayers(roster); 
                }
            } else if (gameStatus === 'playing') {
                let dropped = false;
                let droppedNames = [];
                for (let p = 1; p <= maxPlayers; p++) {
                    if (playerSlots[p] && !playerSlots[p].startsWith('AI_BOT') && !currentRosterIds.includes(playerSlots[p])) {
                        droppedNames.push(`P${p}`);
                        playerSlots[p] = null;
                        dropped = true;
                        boardState.forEach(n => { if (n.owner === p) n.owner = 0; }); // Turn to rogue nodes
                    }
                }

                if (dropped) {
                    safePublish('ANNOUNCE', { text: `ALERT: ${droppedNames.join(', ')} SYNDICATE ABANDONED THE SECTOR!`, alertType: 'danger' });
                    handleNetworkMessage({ type: 'ANNOUNCE', text: `ALERT: ${droppedNames.join(', ')} SYNDICATE ABANDONED THE SECTOR!`, alertType: 'danger' });

                    calculateStats();
                    safePublish('SYNC_PLAYERS', { playerSlots, gridSize, maxPlayers, gameMode });
                    handleNetworkMessage({ type: 'SYNC_PLAYERS', playerSlots, gridSize, maxPlayers, gameMode });

                    const activeAlive = Object.keys(playerStats).filter(p => p <= maxPlayers && playerSlots[p] && playerStats[p].nodes > 0);
                    if (activeAlive.length <= 1) {
                        hostEndGame(parseInt(activeAlive[0] || 1, 10), 'forfeit');
                    } else {
                        if (!playerSlots[currentTurn]) hostAdvanceTurn();
                        else {
                            safePublish('SYNC_BOARD', { boardState, playerStats, currentTurn, currentRound, gameStatus, gridSize, maxPlayers, countdownLeft, lastMove });
                            handleNetworkMessage({ type: 'SYNC_BOARD', boardState, playerStats, currentTurn, currentRound, gameStatus, gridSize, maxPlayers, countdownLeft, lastMove });
                        }
                    }
                }
            }
        }

        function renderRoster(roster) {
            $('#roster').innerHTML = Object.keys(playerSlots).map(pNum => {
                if (pNum > maxPlayers || !playerSlots[pNum]) return '';
                const pId = playerSlots[pNum];
                const roleColor = PLAYER_COLORS[pNum];
                
                let name = `Syndicate P${pNum}`;
                let tag = pId === myId ? 'You' : 'Rival';
                
                if (pId.startsWith('AI_BOT')) {
                    name = `AI Protocol (${aiConfig[pNum] || '?'})`;
                    tag = 'Automated';
                } else {
                    const rp = Array.from(MP.getRoster()).find(r => r.id === pId);
                    if (rp) name = rp.name;
                }
                
                return `<div class="roster-item ${pId === myId ? 'me' : ''}"><b style="color:${roleColor}">${escapeHtml(name)}</b><small>${tag}</small></div>`;
            }).join('');
        }

        // --- HOST & PROCEDURAL MAP GENERATION LOGIC ---

        function generateSymmetricalMap(size) {
            const map = [];
            const mid = (size - 1) / 2;
            const maxRadialDist = Math.sqrt(2 * Math.pow(mid, 2)) || 1;

            for (let r = 0; r < size; r++) {
                for (let c = 0; c < size; c++) {
                    const distToEdge = Math.min(r, c, size - 1 - r, size - 1 - c);
                    let type = "slums";
                    
                    if (distToEdge === 0) {
                        const edgeDist = (r === 0 || r === size - 1) ? Math.min(c, size - 1 - c) : Math.min(r, size - 1 - r);
                        if (edgeDist === 0) type = "slums"; 
                        else if (edgeDist % 3 === 1) type = "docks"; 
                        else type = "slums";
                    } else if (size === 4 && distToEdge === 1) {
                        type = "tech"; 
                    } else {
                        const distFromCenter = Math.sqrt(Math.pow(r - mid, 2) + Math.pow(c - mid, 2));
                        const ratio = distFromCenter / maxRadialDist;

                        if (ratio <= 0.30) type = "tech";    
                        else if (ratio <= 0.65) type = "downtown"; 
                        else type = "slums";  
                    }

                    map.push({ owner: 0, garrison: 0, district: DISTRICT_NAMES[type], type: type });
                }
            }
            return map;
        }

        function initEmptyBoard() {
            boardState = generateSymmetricalMap(gridSize);
            for (let i = 1; i <= 4; i++) playerStats[i] = { nodes: 0, troops: 0, id: playerSlots[i] };
            selectedIndex = -1;
            lastMove = null;
            currentRound = 1;
            $('#winner-screen').classList.add('hidden');
            $('#cinematic-screen').classList.add('hidden');
            
            isZoomedIn = gridSize > 4;
            $('#btn-zoom').textContent = isZoomedIn ? "🔍 ZOOM OUT" : "🔍 ZOOM IN";
            drawBoard();
        }

        function calculateStats() {
            for (let p = 1; p <= 4; p++) {
                playerStats[p] = {
                    nodes: boardState.filter(n => n.owner === p).length,
                    troops: boardState.filter(n => n.owner === p).reduce((acc, n) => acc + n.garrison, 0),
                    id: playerSlots[p]
                };
            }
        }

        function hostStartCountdown() {
            gameStatus = 'starting';
            countdownLeft = 30;
            if (hostTimerInterval) clearInterval(hostTimerInterval);
            hostTimerInterval = setInterval(hostCountdownTick, 1000);

            // Give players initial core spawns right as countdown begins
            const N = gridSize;
            const corners = { 1: 0, 2: N * N - 1, 3: N - 1, 4: N * (N - 1) };
            for (let p = 1; p <= maxPlayers; p++) {
                if (playerSlots[p]) boardState[corners[p]] = { owner: p, garrison: 5, district: `Base Core`, type: "slums" };
            }
            calculateStats();

            safePublish('SYNC_BOARD', { boardState, playerStats, currentTurn, currentRound, gameStatus: 'starting', gridSize, maxPlayers, countdownLeft, lastMove });
            handleNetworkMessage({ type: 'SYNC_BOARD', boardState, playerStats, currentTurn, currentRound, gameStatus: 'starting', gridSize, maxPlayers, countdownLeft, lastMove });
        }

        function hostCountdownTick() {
            countdownLeft--;
            if (countdownLeft <= 0) hostStartGame();
            else {
                safePublish('SYNC_TIME', { turnTimeLeft, currentTurn, countdownLeft });
                handleNetworkMessage({ type: 'SYNC_TIME', turnTimeLeft, currentTurn, countdownLeft });
            }
        }

        function hostStartGame() {
            turnTimeLeft = TURN_TIME_LIMIT;
            currentRound = 1;
            if (hostTimerInterval) clearInterval(hostTimerInterval);
            hostTimerInterval = setInterval(hostTimeTick, 1000);
            hostReinforceTurn();
            calculateStats();

            safePublish('SYNC_BOARD', { boardState, playerStats, currentTurn, currentRound, gameStatus: 'playing', gridSize, maxPlayers, countdownLeft, lastMove });
            handleNetworkMessage({ type: 'SYNC_BOARD', boardState, playerStats, currentTurn, currentRound, gameStatus: 'playing', gridSize, maxPlayers, countdownLeft, lastMove });
            
            safePublish('SYNC_TIME', { turnTimeLeft, currentTurn, countdownLeft });
            handleNetworkMessage({ type: 'SYNC_TIME', turnTimeLeft, currentTurn, countdownLeft });
            
            checkTriggerAI();
        }

        function hostReinforceTurn() {
            boardState.forEach(node => {
                if (node.owner > 0) {
                    if (node.type === 'docks') node.garrison += 2;
                    else if (node.type === 'tech') { if (currentRound % 2 === 0) node.garrison += 4; }
                    else node.garrison += 1;
                }
            });
        }

        function hostTimeTick() {
            const cStatus = $('#timer-display').textContent.includes('DROPPING') ? 'starting' : ($('#timer-display').classList.contains('hidden') ? 'waiting' : 'playing');
            if (cStatus !== 'playing') return;
            
            turnTimeLeft--;
            if (turnTimeLeft <= 0) { lastMove = null; hostAdvanceTurn(); return; }
            safePublish('SYNC_TIME', { turnTimeLeft, currentTurn, countdownLeft });
            handleNetworkMessage({ type: 'SYNC_TIME', turnTimeLeft, currentTurn, countdownLeft });
        }

        function hostEndGame(winnerNum, reason) {
            currentTurn = winnerNum; 
            if (hostTimerInterval) clearInterval(hostTimerInterval);
            MP.updateRoom({ status: 'finished' });
            calculateStats();
            
            safePublish('SYNC_BOARD', { boardState, playerStats, currentTurn, currentRound, gameStatus: 'finished', gridSize, maxPlayers, countdownLeft, lastMove, winReason: reason });
            handleNetworkMessage({ type: 'SYNC_BOARD', boardState, playerStats, currentTurn, currentRound, gameStatus: 'finished', gridSize, maxPlayers, countdownLeft, lastMove, winReason: reason });
        }

        function checkTriggerAI() {
            const cStatus = $('#timer-display').textContent.includes('DROPPING') ? 'starting' : ($('#timer-display').classList.contains('hidden') ? 'waiting' : 'playing');
            if (cStatus !== 'playing') return;
            
            const pId = playerSlots[currentTurn];
            if (pId && pId.startsWith('AI_BOT')) {
                setTimeout(() => playAITurn(currentTurn, aiConfig[currentTurn]), 1200);
            }
        }

        function playAITurn(pNum, diff) {
            const cStatus = $('#timer-display').textContent.includes('DROPPING') ? 'starting' : ($('#timer-display').classList.contains('hidden') ? 'waiting' : 'playing');
            if (cStatus !== 'playing' || currentTurn !== pNum) return;
            
            let possibleMoves = [];
            boardState.forEach((origin, fromIdx) => {
                if (origin.owner === pNum && origin.garrison > 1) {
                    const r1 = Math.floor(fromIdx / gridSize), c1 = fromIdx % gridSize;
                    const neighbors = [{r:r1-1, c:c1}, {r:r1+1, c:c1}, {r:r1, c:c1-1}, {r:r1, c:c1+1}];
                    neighbors.forEach(n => {
                        if (n.r >= 0 && n.r < gridSize && n.c >= 0 && n.c < gridSize) {
                            possibleMoves.push({ fromIdx, toIdx: n.r * gridSize + n.c });
                        }
                    });
                }
            });
            
            if (possibleMoves.length === 0) { turnTimeLeft = 1; return; }
            
            possibleMoves.forEach(m => {
                const target = boardState[m.toIdx];
                const origin = boardState[m.fromIdx];
                const movingUnits = Math.floor(origin.garrison / 2);
                m.score = 0;
                
                if (diff === 'easy') {
                    m.score = Math.random();
                } else if (diff === 'medium') {
                    if (target.owner === 0) m.score = 5 + Math.random();
                    else if (target.owner !== pNum && target.garrison < movingUnits) m.score = 4 + Math.random();
                    else if (target.owner === pNum) m.score = 1 + Math.random();
                    else m.score = -10;
                } else if (diff === 'hard') {
                    if (target.owner !== pNum) {
                        if (target.type === 'tech') m.score = 20;
                        else if (target.type === 'docks') m.score = 15;
                        else if (target.owner === 0) m.score = 10;
                        else m.score = 8;
                        
                        if (movingUnits <= target.garrison) m.score -= 50; 
                        else m.score += (movingUnits - target.garrison); 
                    } else {
                        if (target.type === 'tech' || target.type === 'docks') m.score = 5;
                        else m.score = 2;
                    }
                    m.score += Math.random(); 
                }
            });
            
            possibleMoves.sort((a, b) => b.score - a.score);
            const bestMove = possibleMoves[0];
            
            if (bestMove.score > -20) {
                hostProcessMarch(`AI_BOT_${pNum}`, bestMove.fromIdx, bestMove.toIdx);
            } else {
                turnTimeLeft = 1; 
            }
        }

        function hostAdvanceTurn() {
            let nextTurn = currentTurn;
            let attempts = 0;
            let roundWrapped = false;

            do {
                if (nextTurn === maxPlayers) roundWrapped = true;
                nextTurn = (nextTurn % maxPlayers) + 1;
                attempts++;
            } while ((!playerSlots[nextTurn] || playerStats[nextTurn].nodes === 0) && attempts <= maxPlayers);

            currentTurn = nextTurn;
            turnTimeLeft = TURN_TIME_LIMIT;

            if (roundWrapped) { currentRound++; hostReinforceTurn(); }
            calculateStats();

            const activeAlive = Object.keys(playerStats).filter(p => p <= maxPlayers && playerSlots[p] && playerStats[p].nodes > 0);
            if (activeAlive.length <= 1 && attempts < maxPlayers) {
                hostEndGame(parseInt(activeAlive[0] || 1, 10), 'domination');
                return;
            }

            safePublish('SYNC_BOARD', { boardState, playerStats, currentTurn, currentRound, gameStatus: 'playing', gridSize, maxPlayers, countdownLeft, lastMove });
            handleNetworkMessage({ type: 'SYNC_BOARD', boardState, playerStats, currentTurn, currentRound, gameStatus: 'playing', gridSize, maxPlayers, countdownLeft, lastMove });
            
            safePublish('SYNC_TIME', { turnTimeLeft, currentTurn, countdownLeft });
            handleNetworkMessage({ type: 'SYNC_TIME', turnTimeLeft, currentTurn, countdownLeft });
            
            checkTriggerAI();
        }

        function hostProcessMarch(senderId, fromIdx, toIdx) {
            const cStatus = $('#timer-display').textContent.includes('DROPPING') ? 'starting' : ($('#timer-display').classList.contains('hidden') ? 'waiting' : 'playing');
            if (cStatus !== 'playing') return;
            const expectedId = playerSlots[currentTurn];
            if (senderId !== expectedId && senderId !== `AI_BOT_${currentTurn}`) return;

            const totalNodes = gridSize * gridSize;
            if (fromIdx < 0 || fromIdx >= totalNodes || toIdx < 0 || toIdx >= totalNodes) return;
            const origin = boardState[fromIdx];
            const target = boardState[toIdx];
            const pNum = currentTurn;

            if (origin.owner !== pNum || origin.garrison <= 1) return; 

            const r1 = Math.floor(fromIdx / gridSize), c1 = fromIdx % gridSize;
            const r2 = Math.floor(toIdx / gridSize), c2 = toIdx % gridSize;
            if ((Math.abs(r1 - r2) + Math.abs(c1 - c2)) !== 1) return;

            const movingUnits = Math.floor(origin.garrison / 2);
            let sound = 'march';

            if (target.owner === pNum) {
                origin.garrison -= movingUnits;
                target.garrison += movingUnits;
            } else if (target.owner === 0) {
                origin.garrison -= movingUnits;
                target.owner = pNum;
                target.garrison += movingUnits;
            } else {
                origin.garrison -= movingUnits;
                sound = 'combat';
                target.garrison -= movingUnits;
                if (target.garrison <= 0) {
                    target.owner = pNum;
                    target.garrison = Math.abs(target.garrison);
                }
            }

            safePublish('PLAY_SOUND', { sound });
            handleNetworkMessage({ type: 'PLAY_SOUND', sound });

            lastMove = { fromIdx, toIdx, player: pNum };
            calculateStats();
            hostAdvanceTurn();
        }

        // --- CLIENT LOGIC ---

        function handleNetworkMessage(msg) {
            if (!msg || !msg.type) return;

            // Route universal chat messages immediately
            if (msg.type === 'CHAT') {
                if (window.CyberChat) window.CyberChat.handleMessage(msg);
                return;
            }

            // Block echoed network messages from host to prevent double execution
            if (isHost && msg.senderId === myId && msg.type !== 'MARCH') return; 

            if (msg.type === 'SYNC_PLAYERS') {
                playerSlots = msg.playerSlots;
                gridSize = msg.gridSize || gridSize;
                maxPlayers = msg.maxPlayers || maxPlayers;
                gameMode = msg.gameMode || gameMode;
                if (gameMode.startsWith('pve')) {
                    aiConfig = {}; const diff = gameMode.split('-')[1];
                    for(let i=2; i<=maxPlayers; i++) aiConfig[i] = diff;
                }
                myPlayerNum = 0;
                for (let k in playerSlots) { if (playerSlots[k] === myId) myPlayerNum = parseInt(k, 10); }
                renderRoster(Array.from(MP.getRoster()));
            }

            if (msg.type === 'ANNOUNCE') {
                const banner = $('#status-banner');
                const ind = $('#turn-indicator');
                
                ind.textContent = msg.text;
                banner.style.borderColor = msg.alertType === 'danger' ? 'var(--danger)' : 'var(--accent)';
                ind.style.color = msg.alertType === 'danger' ? 'var(--danger)' : 'var(--accent)';
                
                setTimeout(() => {
                    banner.style.borderColor = '';
                    ind.style.color = '';
                    updateStatusBanner();
                }, 4000);
            }

            if (msg.type === 'PLAY_SOUND') {
                if (msg.sound === 'march') SoundFX.playMarch();
                if (msg.sound === 'combat') SoundFX.playCombat();
            }

            if (msg.type === 'SYNC_TIME') {
                turnTimeLeft = msg.turnTimeLeft;
                countdownLeft = msg.countdownLeft;
                updateTimerDisplay();
            }

            if (msg.type === 'SYNC_BOARD') {
                const oldStatus = gameStatus;
                
                boardState = msg.boardState;
                playerStats = msg.playerStats;
                currentTurn = msg.currentTurn;
                currentRound = msg.currentRound || 1;
                gameStatus = msg.gameStatus;
                lastMove = msg.lastMove !== undefined ? msg.lastMove : null;
                countdownLeft = msg.countdownLeft !== undefined ? msg.countdownLeft : countdownLeft;
                
                if (msg.gridSize !== gridSize) {
                    gridSize = msg.gridSize;
                    isZoomedIn = gridSize > 4; 
                    $('#btn-zoom').textContent = isZoomedIn ? "🔍 ZOOM OUT" : "🔍 ZOOM IN";
                }
                maxPlayers = msg.maxPlayers || maxPlayers;
                selectedIndex = -1; 
                
                updateStatusBanner();
                drawBoard();

                if (gameStatus === 'cinematic' && oldStatus !== 'cinematic') {
                    triggerCinematicAnimation();
                } else if (gameStatus !== 'cinematic') {
                    const cineEl = $('#cinematic-screen');
                    cineEl.classList.add('fade-out');
                    setTimeout(() => cineEl.classList.add('hidden'), 800);
                    if (cineAnimFrame) { cancelAnimationFrame(cineAnimFrame); cineAnimFrame = null; }
                    if (cineInterval) { clearInterval(cineInterval); cineInterval = null; }
                }

                if (gameStatus === 'finished') showWinnerScreen(msg.winReason);
                else $('#winner-screen').classList.add('hidden');
            }

            if (msg.type === 'MARCH' && isHost) {
                hostProcessMarch(msg.senderId, msg.fromIdx, msg.toIdx);
            }
        }

        // Procedural Cyber City Canvas Animation - Runs locally upon entry
        function triggerCinematicAnimation() {
            const cineEl = $('#cinematic-screen');
            cineEl.classList.remove('hidden');
            cineEl.classList.remove('fade-out');

            const canvas = $('#cine-canvas');
            const ctx = canvas.getContext('2d');
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            let buildings = [];
            for(let i=0; i<35; i++) {
                buildings.push({
                    x: i * (canvas.width / 30),
                    w: canvas.width / 32,
                    h: Math.random() * (canvas.height * 0.65) + 120,
                    color: Math.random() > 0.5 ? '#060e14' : '#0a131a'
                });
            }

            let cars = [];
            for(let i=0; i<12; i++) {
                cars.push({ x: Math.random() * canvas.width, y: Math.random() * canvas.height * 0.7 + 100, speed: Math.random() * 3 + 1.5, color: Math.random() > 0.5 ? '#19f5c6' : '#f2c14e' });
            }

            if (cineAnimFrame) cancelAnimationFrame(cineAnimFrame);
            
            function renderCine() {
                ctx.fillStyle = '#040608';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                buildings.forEach(b => {
                    ctx.fillStyle = b.color;
                    ctx.fillRect(b.x, canvas.height - b.h, b.w, b.h);
                    ctx.strokeStyle = '#15222b';
                    ctx.strokeRect(b.x, canvas.height - b.h, b.w, b.h);
                });

                cars.forEach(car => {
                    ctx.fillStyle = car.color;
                    ctx.fillRect(car.x, car.y, 14, 3);
                    car.x += car.speed;
                    if (car.x > canvas.width) car.x = -25;
                });

                ctx.strokeStyle = 'rgba(25, 245, 198, 0.05)';
                ctx.lineWidth = 1;
                for(let x=0; x<canvas.width; x+=50) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
                for(let y=0; y<canvas.height; y+=50) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke(); }

                cineAnimFrame = requestAnimationFrame(renderCine);
            }
            renderCine();

            const script = [
                "YEAR 2142...",
                "THE URBAN SPRAWL HAS FALLEN.",
                "CORPORATE SYNDICATES BATTLE FOR DOMINION.",
                "CLAIM THE PERIMETER DOCKS [+2 UNITS].",
                "SEIZE THE CENTRAL TECH CORES [+4 BURST].",
                "ANNIHILATE ALL RIVALS.",
                "PREPARE FOR DEPLOYMENT..."
            ];

            const textEl = $('#cine-text');
            textEl.innerHTML = '';
            let lineIdx = 0;

            if (cineInterval) clearInterval(cineInterval);

            function playLine() {
                if (lineIdx >= script.length) return;
                
                let currentLine = script[lineIdx];
                let charIdx = 0;
                textEl.innerHTML = '';

                cineInterval = setInterval(() => {
                    textEl.innerHTML += currentLine.charAt(charIdx);
                    if (currentLine.charAt(charIdx) !== ' ') SoundFX.playTick();
                    charIdx++;
                    
                    if (charIdx >= currentLine.length) {
                        clearInterval(cineInterval);
                        lineIdx++;
                        setTimeout(playLine, 600); // Tighter 600ms pause to ensure it fits in 9s window
                    }
                }, 30); // Faster 30ms typing
            }
            playLine();

            // Self-destroy overlay after 9.5 seconds automatically
            setTimeout(() => {
                cineEl.classList.add('fade-out');
                setTimeout(() => {
                    cineEl.classList.add('hidden');
                    if (cineAnimFrame) { cancelAnimationFrame(cineAnimFrame); cineAnimFrame = null; }
                    if (cineInterval) { clearInterval(cineInterval); cineInterval = null; }
                }, 800);
            }, 9500);
        }

        function updateTimerDisplay() {
            const tDisp = $('#timer-display');
            if (gameStatus === 'waiting' || gameStatus === 'finished') { 
                tDisp.classList.add('hidden'); return; 
            }
            
            tDisp.classList.remove('hidden');

            if (gameStatus === 'starting' || gameStatus === 'starting_wait') {
                tDisp.textContent = `DROPPING IN: ${countdownLeft}s`;
                tDisp.classList.remove('danger');
                if (!$('#turn-indicator').style.color) $('#status-banner').classList.remove('warning');
                if (countdownLeft <= 5 && countdownLeft > 0 && gameStatus === 'starting') SoundFX.playTick();
            } else if (gameStatus === 'playing') {
                if (turnTimeLeft > 10) {
                    tDisp.textContent = `${turnTimeLeft - 10}s`;
                    tDisp.classList.remove('danger');
                    if (!$('#turn-indicator').style.color) $('#status-banner').classList.remove('warning');
                } else {
                    tDisp.textContent = `FORFEIT IN: ${turnTimeLeft}s`;
                    tDisp.classList.add('danger');
                    if (!$('#turn-indicator').style.color) $('#status-banner').classList.add('warning');
                    if (currentTurn === myPlayerNum && turnTimeLeft > 0) SoundFX.playTick();
                }
            }
        }

        function updateStatusBanner() {
            const banner = $('#status-banner');
            banner.className = 'status-banner';
            const ind = $('#turn-indicator');
            const hud = $('#resource-hud');
            
            // Only update text if there isn't an active Announce Alert overriding it
            if (!ind.style.color) {
                if (gameStatus === 'waiting' || gameStatus === 'starting_wait') {
                    ind.textContent = isHost ? "Waiting for rival syndicates to uplink..." : "Waiting for deployment signal...";
                } else if (gameStatus === 'starting') {
                    ind.textContent = "SECTOR LOCKED. PREPARE FOR DEPLOYMENT.";
                } else if (gameStatus === 'playing') {
                    const isMyTurn = (currentTurn === myPlayerNum);
                    let turnText = `P${currentTurn} SYNDICATE MARCHING...`;
                    if (playerSlots[currentTurn] && playerSlots[currentTurn].startsWith('AI_BOT')) turnText = `AI PROTOCOL (${aiConfig[currentTurn]}) CALCULATING...`;
                    
                    ind.textContent = isMyTurn ? (selectedIndex === -1 ? "YOUR TURN - SELECT GARRISON (>1 UNIT)" : "SELECT TARGET / REINFORCE") : turnText;
                    banner.classList.add(`p${currentTurn}`);
                } else if (gameStatus === 'finished') {
                    ind.textContent = `P${currentTurn} SYNDICATE DOMINATES!`;
                    banner.classList.add(`p${currentTurn}`);
                }
            }

            hud.innerHTML = '';
            let totalPowerSum = 0;
            if (gameStatus === 'playing' || gameStatus === 'starting' || gameStatus === 'starting_wait') {
                const roundCard = document.createElement('div');
                roundCard.className = 'res-card';
                const isPayout = (currentRound % 2 === 0);
                roundCard.style.borderColor = isPayout ? 'var(--accent)' : 'var(--line)';
                roundCard.innerHTML = `Round <b>${currentRound}</b> | ` + (isPayout ? '<b style="color:var(--accent);">⚡ TECH BURST ⚡</b>' : '<span style="color:var(--muted)">⚡ Charging...</span>');
                hud.appendChild(roundCard);
            }

            for (let p = 1; p <= maxPlayers; p++) {
                const st = playerStats[p] || { nodes: 0, troops: 0 };
                const power = st.nodes * 3 + st.troops;
                totalPowerSum += power;

                const card = document.createElement('div');
                card.className = 'res-card';
                card.style.borderColor = PLAYER_COLORS[p];
                
                const isDropped = (gameStatus === 'playing' || gameStatus === 'finished') && !playerSlots[p];
                const dropTag = isDropped ? '<span style="color:var(--danger)">[DROPPED]</span>' : '';
                card.innerHTML = `<span style="color:${PLAYER_COLORS[p]}">P${p}</span> ${dropTag} Nodes: <b>${st.nodes}</b> | Troops: <b>${st.troops}</b>`;
                hud.appendChild(card);
            }

            totalPowerSum = Math.max(1, totalPowerSum);
            for (let p = 1; p <= 4; p++) {
                const barSeg = $(`#bar-p${p}`);
                if (barSeg) {
                    if (p <= maxPlayers) {
                        const st = playerStats[p] || { nodes: 0, troops: 0 };
                        const power = st.nodes * 3 + st.troops;
                        const pct = Math.round((power / totalPowerSum) * 100);
                        if (window.innerWidth <= 800) { barSeg.style.width = `${pct}%`; barSeg.style.height = `100%`; } 
                        else { barSeg.style.height = `${pct}%`; barSeg.style.width = `100%`; }
                        barSeg.style.display = 'block';
                    } else {
                        barSeg.style.display = 'none'; 
                    }
                }
            }
            
            updateTimerDisplay();
        }

        window.addEventListener('resize', updateStatusBanner);

        function showWinnerScreen(reason) {
            const screen = $('#winner-screen');
            const title = $('#winner-title');
            const sub = $('#winner-subtitle');
            const loserText = $('#winner-loser-text');
            
            const iWon = (currentTurn === myPlayerNum);
            if (iWon) SoundFX.playWin(); else SoundFX.playLose();

            const winnerId = playerSlots[currentTurn];
            const winnerName = getPlayerName(winnerId, `Syndicate P${currentTurn}`);

            title.textContent = `${winnerName} WINS!`.toUpperCase();
            title.style.color = PLAYER_COLORS[currentTurn] || 'var(--accent)';
            
            if (reason === 'timeout') sub.textContent = "Rivals Forfeited (Timeout)";
            else if (reason === 'forfeit') sub.textContent = "Rivals Fled the Sector";
            else sub.textContent = "Total Sprawl Annihilation";

            loserText.innerHTML = `Better luck next brawl, fixers.`;
            screen.classList.remove('hidden');

            if (isHost) $('#rematch-btn').classList.remove('hidden');
        }

        const tooltip = $('#cyber-tooltip');
        function showTooltip(e, node) {
            const ownerName = node.owner > 0 ? `Syndicate P${node.owner}` : "Neutral Sector";
            const ownerColor = node.owner > 0 ? PLAYER_COLORS[node.owner] : "#888";
            const distIcon = DISTRICT_ICONS[node.type] || "📍";
            const distDesc = DISTRICT_DESCS[node.type] || "+1 Troop/Round";
            
            tooltip.innerHTML = `
                <b>${distIcon} ${node.district}</b>
                <span>Owner: <i style="color:${ownerColor}; font-weight:bold;">${ownerName}</i></span>
                <span style="border-bottom: 1px solid #233544; padding-bottom: 6px; margin-bottom: 2px;">Type: <i style="color:var(--gold)">${DISTRICT_NAMES[node.type] || node.type}</i></span>
                <span style="font-size: 0.65rem; color: #a1b0bd; justify-content: flex-end; margin-bottom: 6px;"><i>${distDesc}</i></span>
                <span>Garrison: <i style="font-family:monospace; font-size: 0.95rem;">${node.garrison} Units</i></span>
            `;
            tooltip.classList.add('visible');
            moveTooltip(e);
        }

        function moveTooltip(e) {
            let topPos = e.clientY + 15; let leftPos = e.clientX + 15;
            if (leftPos + 200 > window.innerWidth) leftPos = e.clientX - 210;
            if (topPos + 100 > window.innerHeight) topPos = e.clientY - 100;
            tooltip.style.left = leftPos + 'px'; tooltip.style.top = topPos + 'px';
        }

        function hideTooltip() { tooltip.classList.remove('visible'); }

        function drawBoard() {
            const boardEl = $('#board');
            const scrollArea = $('.board-scroll-area');
            boardEl.innerHTML = '';
            
            if (isZoomedIn) {
                scrollArea.style.overflow = 'auto';
                boardEl.className = 'turf-grid zoomed-in';
                boardEl.style.gridTemplateColumns = `repeat(${gridSize}, 90px)`;
                boardEl.style.gridAutoRows = `90px`;
                boardEl.style.gridTemplateRows = '';
            } else {
                scrollArea.style.overflow = 'hidden';
                boardEl.className = 'turf-grid zoomed-out';
                boardEl.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
                boardEl.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;
                boardEl.style.gridAutoRows = '';
            }

            const isMyTurn = (currentTurn === myPlayerNum && gameStatus === 'playing');

            for (let i = 0; i < gridSize * gridSize; i++) {
                const node = boardState[i] || { owner: 0, garrison: 0, district: 'Slums', type: 'slums' };
                const nodeEl = document.createElement('div');
                nodeEl.className = 'sector-node';
                
                nodeEl.onmouseenter = (e) => showTooltip(e, node);
                nodeEl.onmousemove = moveTooltip;
                nodeEl.onmouseleave = hideTooltip;

                if (node.owner > 0) nodeEl.classList.add(`p${node.owner}-owned`);
                if (i === selectedIndex) nodeEl.classList.add('selected');
                
                if (lastMove) {
                    if (i === lastMove.fromIdx) nodeEl.classList.add('last-move-source');
                    if (i === lastMove.toIdx) nodeEl.classList.add('last-move-target');
                }

                let isSelectable = false, isTargetable = false, isSupportable = false;

                if (isMyTurn) {
                    if (node.owner === myPlayerNum && node.garrison > 1) isSelectable = true;
                    if (selectedIndex !== -1 && selectedIndex !== i) {
                        const r1 = Math.floor(selectedIndex / gridSize), c1 = selectedIndex % gridSize;
                        const r2 = Math.floor(i / gridSize), c2 = i % gridSize;
                        if ((Math.abs(r1 - r2) + Math.abs(c1 - c2)) === 1) {
                            if (node.owner !== myPlayerNum) { isTargetable = true; isSelectable = false; } 
                            else { isSupportable = true; isSelectable = false; }
                        }
                    }
                }

                if (isSelectable) {
                    nodeEl.classList.add('selectable');
                    nodeEl.onclick = () => { selectedIndex = (selectedIndex === i) ? -1 : i; drawBoard(); updateStatusBanner(); };
                } else if (isTargetable) {
                    nodeEl.classList.add('targetable');
                    nodeEl.onclick = () => { MP.publish('MARCH', { fromIdx: selectedIndex, toIdx: i }); };
                } else if (isSupportable) {
                    nodeEl.classList.add('supportable');
                    nodeEl.onclick = () => { MP.publish('MARCH', { fromIdx: selectedIndex, toIdx: i }); };
                }

                const ownerTag = node.owner === 0 ? 'Neutral' : `P${node.owner}`;
                const garrisonText = node.garrison > 0 ? node.garrison : '○';
                const distIcon = showIcons ? (DISTRICT_ICONS[node.type] || "📍") : "";

                if (isZoomedIn) {
                    nodeEl.innerHTML = `
                        <div class="node-district">${distIcon} ${node.district}</div>
                        <div class="node-title">${ownerTag}</div>
                        <div class="node-garrison" style="color:${PLAYER_COLORS[node.owner] || 'var(--muted)'}">
                            ${node.garrison > 0 ? `🛡 ${garrisonText}` : garrisonText}
                        </div>
                    `;
                } else {
                    nodeEl.innerHTML = `
                        <div style="display:flex; flex-direction:row; align-items:center; justify-content:center; gap:6px; height:100%;">
                            <span style="font-size: 0.85rem; color:var(--muted); opacity: 0.8;">${distIcon}</span>
                            <span style="font-size: 0.85rem; font-weight: bold; font-family: monospace; color:${PLAYER_COLORS[node.owner] || 'var(--muted)'};">
                                ${garrisonText}
                            </span>
                        </div>
                    `;
                }
                boardEl.appendChild(nodeEl);
            }
        }
        function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
 