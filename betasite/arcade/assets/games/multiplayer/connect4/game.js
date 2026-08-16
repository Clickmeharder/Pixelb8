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
                playDrop: () => { playTone(500, 'sine', 0.1, 0.1, 200); setTimeout(()=>playTone(200, 'triangle', 0.1, 0.15), 100); },
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
        
        let displayName = localStorage.getItem('pixelb8ConnectName') || `Player_${Math.floor(Math.random() * 9000)}`;
        $('#player-name').value = displayName;

        // Board Constants
        const ROWS = 6;
        const COLS = 7;

        // Game State
        let boardState = []; // Array of columns (each column is an array of row values) for easier drop logic
        let winningCells = []; // Stores {r, c} to highlight
        let currentTurn = 1; // 1 = Red, 2 = Black
        let gameStatus = 'waiting'; // waiting, starting, playing, finished
        let lastMoveData = null; // { c, r }

        // Timer State
        const TURN_TIME_LIMIT = 55; // 45s normal + 10s grace
        let hostTimerInterval = null;
        let turnTimeLeft = TURN_TIME_LIMIT;

        let myPlayerNum = 0; 
        let p1Id = null, p2Id = null;

        // --- INIT NETWORK ---
        MP.init({
            gameId: 'connect4',
            playerName: displayName,
            onRooms: rooms => { currentRooms = rooms; renderRooms(); },
            onRoster: roster => { 
                // Play sound when someone new joins during the waiting phase
                if (roster.length > lastPlayerCount && lastPlayerCount > 0 && gameStatus === 'waiting') {
                    SoundFX.playJoin();
                }
                lastPlayerCount = roster.length;
                
                if (isHost) assignPlayers(roster);
                renderRoster(roster); 
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
            MP.hostRoom({ code, mode: 'connect4', maxPlayers: 2, name: `${displayName}'s Table` });
        };
        $('#join-code-btn').onclick = () => joinRoom($('#join-code').value);
        $('#leave-room').onclick = () => { MP.disconnect(); location.reload(); };
        $('#copy-code').onclick = async () => { await navigator.clipboard?.writeText(roomCode); $('#copy-code').textContent = 'COPIED!'; setTimeout(() => $('#copy-code').textContent = 'COPY CODE', 1200); };
        $('#rematch-btn').onclick = () => { if (isHost) hostInitiateCountdown(10); }; // Faster rematch countdown

        function safePublish(type, payload = {}) {
            MP.publish(type, payload);
            if (isHost) handleNetworkMessage({ type, senderId: myId, ...payload });
        }
        function rememberName() { displayName = $('#player-name').value.trim().slice(0, 18) || displayName; localStorage.setItem('pixelb8ConnectName', displayName); MP.setPlayerName(displayName); }
        function joinRoom(code) { rememberName(); code = String(code || '').trim().toUpperCase(); if (code) MP.joinRoom(code, 'player'); }

        function renderRooms() {
            const rl = $('#room-list');
            if (!currentRooms.length) { rl.innerHTML = '<div class="empty">No tables open. Host one!</div>'; return; }
            rl.innerHTML = currentRooms.map(r => {
                const full = r.playerCount >= 2;
                return `
                <div class="room-card">
                    <div class="room-top"><b>${escapeHtml(r.name)}</b> <span class="badge ${r.status}">${r.status}</span></div>
                    <div class="room-meta"><span>[${r.code}]</span> <span>♟ ${r.playerCount}/2</span></div>
                    <button class="primary" onclick="$('#join-code').value='${r.code}'; joinRoom('${r.code}');" ${full && r.status === 'playing' ? 'disabled' : ''}>
                        ${full && r.status === 'playing' ? 'SPECTATE' : 'JOIN MATCH'}
                    </button>
                </div>`;
            }).join('');
        }

        function enterTable() {
            $('#lobby-view').classList.add('hidden'); 
            $('#game-view').classList.remove('hidden');
            $('#room-details').textContent = `Room ${roomCode}`;
            initEmptyBoard();

            // Initialize Universal Cyber Chat
            if (window.CyberChat) {
                window.CyberChat.init('cyber-chat', (senderId) => {
                    if (senderId === p1Id) return 'var(--p1-color)';
                    if (senderId === p2Id) return 'var(--p2-color)';
                    return 'var(--muted)';
                });
            }
        }

        function assignPlayers(roster) {
            if (!isHost) return;
            p1Id = myId; p2Id = null;
            const guest = roster.find(r => r.id !== myId);
            if (guest) p2Id = guest.id;
            
            safePublish('SYNC_PLAYERS', { p1Id, p2Id });

            // Refresh host-local UI immediately; host ignores its own echoed SYNC_* packets.
            renderRoster(roster);
            updateStatusBanner();

            // Trigger countdown when exactly 2 players are present
            if (p1Id && p2Id && gameStatus === 'waiting') {
                hostInitiateCountdown(30); 
            }

            // Cancel countdown if someone leaves
            if (!p2Id && gameStatus === 'starting') {
                gameStatus = 'waiting';
                if (hostTimerInterval) clearInterval(hostTimerInterval);
                safePublish('SYNC_BOARD', { boardState, currentTurn, gameStatus, winningCells, lastMoveData });
            }
        }

        function renderRoster(roster) {
            $('#roster').innerHTML = roster.map(p => {
                let roleColor = ''; let roleTag = 'Spectator';
                if (p.id === p1Id) { roleColor = 'var(--p1-color)'; roleTag = 'Player 1 (Red)'; }
                if (p.id === p2Id) { roleColor = '#e0e6ed'; roleTag = 'Player 2 (Black)'; }
                return `<div class="roster-item ${p.id === myId ? 'me' : ''}"><b style="color:${roleColor || '#fff'}">${escapeHtml(p.name)}</b><small>${roleTag}</small></div>`;
            }).join('');
        }

        // --- HOST LOGIC ---

        function initEmptyBoard() {
            boardState = Array(COLS).fill(null).map(() => []);
            winningCells = [];
            lastMoveData = null;
            $('#winner-screen').classList.add('hidden');
            drawBoard();
        }

        function hostInitiateCountdown(duration = 30) {
            if (!p1Id || !p2Id) return;
            gameStatus = 'starting';
            turnTimeLeft = duration;
            boardState = Array(COLS).fill(null).map(() => []);
            winningCells = [];
            lastMoveData = null;
            
            MP.updateRoom({ status: 'playing' });
            
            if (hostTimerInterval) clearInterval(hostTimerInterval);
            hostTimerInterval = setInterval(hostTimeTick, 1000);

            safePublish('SYNC_BOARD', { boardState, currentTurn: 0, gameStatus, winningCells, lastMoveData });
            safePublish('SYNC_TIME', { turnTimeLeft, currentTurn: 0 });

            updateStatusBanner();
            drawBoard();
            updateTimerDisplay(turnTimeLeft, 0);
        }

        function hostStartGame() {
            currentTurn = 1;
            gameStatus = 'playing';
            turnTimeLeft = TURN_TIME_LIMIT;
            
            safePublish('SYNC_BOARD', { boardState, currentTurn, gameStatus, winningCells, lastMoveData });
            safePublish('SYNC_TIME', { turnTimeLeft, currentTurn });

            updateStatusBanner();
            drawBoard();
            updateTimerDisplay(turnTimeLeft, currentTurn);
        }

        function hostTimeTick() {
            turnTimeLeft--;
            
            if (gameStatus === 'starting') {
                if (turnTimeLeft <= 0) {
                    hostStartGame();
                } else {
                    safePublish('SYNC_TIME', { turnTimeLeft, currentTurn: 0 });
                    updateTimerDisplay(turnTimeLeft, 0);
                }
                return;
            }

            if (gameStatus === 'playing') {
                if (turnTimeLeft <= 0) {
                    hostEndGame(currentTurn === 1 ? 2 : 1, 'timeout');
                    return;
                }
                safePublish('SYNC_TIME', { turnTimeLeft, currentTurn });
                updateTimerDisplay(turnTimeLeft, currentTurn);
            }
        }

        function checkWinCondition(c, r, pNum) {
            const dirs = [[1, 0], [0, 1], [1, 1], [1, -1]]; 
            
            for (let [dc, dr] of dirs) {
                let count = 1;
                let cells = [{c, r}];
                
                for (let i = 1; i <= 3; i++) {
                    let nc = c + dc * i, nr = r + dr * i;
                    if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && boardState[nc][nr] === pNum) {
                        count++; cells.push({c: nc, r: nr});
                    } else break;
                }
                for (let i = 1; i <= 3; i++) {
                    let nc = c - dc * i, nr = r - dr * i;
                    if (nc >= 0 && nc < COLS && nr >= 0 && nr < ROWS && boardState[nc][nr] === pNum) {
                        count++; cells.push({c: nc, r: nr});
                    } else break;
                }
                
                if (count >= 4) return cells;
            }
            return null;
        }

        function hostProcessMove(senderId, col) {
            if (gameStatus !== 'playing') return;
            const expectedId = (currentTurn === 1) ? p1Id : p2Id;
            if (senderId !== expectedId) return;

            if (col < 0 || col >= COLS || boardState[col].length >= ROWS) return;

            const pNum = currentTurn;
            boardState[col].push(pNum);
            const row = boardState[col].length - 1;

            lastMoveData = { c: col, r: row };
            safePublish('PLAY_SOUND', { sound: 'drop' });

            const winCells = checkWinCondition(col, row, pNum);

            if (winCells) {
                winningCells = winCells;
                hostEndGame(pNum, 'connect');
                return;
            }

            let isDraw = true;
            for(let i=0; i<COLS; i++) { if (boardState[i].length < ROWS) isDraw = false; }
            if (isDraw) {
                hostEndGame(0, 'draw');
                return;
            }

            currentTurn = currentTurn === 1 ? 2 : 1;
            turnTimeLeft = TURN_TIME_LIMIT;
            
            safePublish('SYNC_BOARD', { boardState, currentTurn, gameStatus, winningCells, lastMoveData });
            safePublish('SYNC_TIME', { turnTimeLeft, currentTurn });
        }

        function hostEndGame(winnerNum, reason) {
            gameStatus = 'finished';
            currentTurn = winnerNum; // 0 for draw
            if (hostTimerInterval) clearInterval(hostTimerInterval);
            MP.updateRoom({ status: 'finished' });
            safePublish('SYNC_BOARD', { boardState, currentTurn, gameStatus, winningCells, lastMoveData, winReason: reason });
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
            if (isHost && msg.senderId === myId && msg.type !== 'MOVE') return; 

            if (msg.type === 'SYNC_PLAYERS') {
                p1Id = msg.p1Id; p2Id = msg.p2Id;
                if (myId === p1Id) myPlayerNum = 1; else if (myId === p2Id) myPlayerNum = 2; else myPlayerNum = 0;
                renderRoster(Array.from(MP.getRoster()));
            }

            if (msg.type === 'PLAY_SOUND') {
                if (msg.sound === 'drop') SoundFX.playDrop();
            }

            if (msg.type === 'SYNC_TIME') {
                updateTimerDisplay(msg.turnTimeLeft, msg.currentTurn);
            }

            if (msg.type === 'SYNC_BOARD') {
                boardState = msg.boardState;
                currentTurn = msg.currentTurn;
                gameStatus = msg.gameStatus;
                winningCells = msg.winningCells || [];
                lastMoveData = msg.lastMoveData;
                
                updateStatusBanner();
                drawBoard();

                if (gameStatus === 'finished') showWinnerScreen(msg.winReason);
                else $('#winner-screen').classList.add('hidden');
            }

            if (msg.type === 'MOVE' && isHost) {
                hostProcessMove(msg.senderId, msg.col);
            }
        }

        function updateTimerDisplay(timeLeft, activeTurn) {
            const tDisp = $('#timer-display');
            if (gameStatus === 'waiting' || gameStatus === 'finished') { 
                tDisp.classList.add('hidden'); 
                return; 
            }
            
            tDisp.classList.remove('hidden');

            if (gameStatus === 'starting') {
                tDisp.textContent = `MATCH STARTS IN: ${timeLeft}s`;
                tDisp.classList.remove('danger');
                $('#status-banner').classList.remove('warning');
                if (timeLeft <= 5 && timeLeft > 0) SoundFX.playTick();
                return;
            }

            // Normal playing state
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
            
            if (gameStatus === 'waiting') {
                ind.textContent = isHost ? (p2Id ? "Ready to start match!" : "Waiting for opponent...") : "Waiting for host to start...";
            } else if (gameStatus === 'starting') {
                ind.textContent = "PREPARING ARENA...";
                banner.classList.add('black'); 
            } else if (gameStatus === 'playing') {
                const isMyTurn = (currentTurn === myPlayerNum);
                ind.textContent = isMyTurn ? "YOUR TURN" : (currentTurn === 1 ? "RED'S TURN" : "BLACK'S TURN");
                banner.classList.add(currentTurn === 1 ? 'red' : 'black');
            } else if (gameStatus === 'finished') {
                if (currentTurn === 0) {
                    ind.textContent = "DRAW!";
                } else {
                    ind.textContent = currentTurn === 1 ? "RED WINS!" : "BLACK WINS!";
                    banner.classList.add(currentTurn === 1 ? 'red' : 'black');
                }
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
            
            if (currentTurn === 0) {
                title.textContent = "DRAW!";
                title.style.color = "var(--text)";
                sub.textContent = "The board is full.";
                loserText.textContent = "Good game, both of you.";
            } else {
                const iWon = (currentTurn === myPlayerNum);
                if (iWon) SoundFX.playWin(); else SoundFX.playLose();

                const winnerId = (currentTurn === 1) ? p1Id : p2Id;
                const loserId = (currentTurn === 1) ? p2Id : p1Id;
                
                const winnerName = getPlayerName(winnerId, currentTurn === 1 ? "RED" : "BLACK");
                const loserName = getPlayerName(loserId, "Opponent");

                title.textContent = `${winnerName} WINS!`.toUpperCase();
                title.style.color = currentTurn === 1 ? "var(--p1-color)" : "var(--accent)";
                
                sub.textContent = currentTurn === 1 ? "RED TEAM" : "BLACK TEAM";
                if (reason === 'timeout') sub.textContent += " (Opponent Forfeit)";

                loserText.innerHTML = `Better luck next time, <b>${loserName}</b>.`;
            }

            screen.classList.remove('hidden');

            if (isHost) {
                $('#rematch-btn').classList.remove('hidden');
                $('#rematch-btn').onclick = () => {
                    $('#winner-screen').classList.add('hidden');
                    hostInitiateCountdown(10); // 10 second countdown for rematches
                };
            }
        }

        function drawBoard() {
            const boardEl = $('#board');
            boardEl.innerHTML = '';
            
            const isMyTurn = (currentTurn === myPlayerNum && gameStatus === 'playing');

            // Render columns
            for (let c = 0; c < COLS; c++) {
                const colGroup = document.createElement('div');
                colGroup.className = 'column-group';
                
                // Allow clicking anywhere in the column
                if (isMyTurn && boardState[c].length < ROWS) {
                    colGroup.classList.add('col-active');
                    colGroup.onclick = () => sendMove(c);
                }

                // Render rows top to bottom (visually)
                for (let visR = 0; visR < ROWS; visR++) {
                    const logicalR = (ROWS - 1) - visR; 
                    
                    const slot = document.createElement('div');
                    slot.className = 'slot';

                    // Check if there's a piece here
                    if (logicalR < boardState[c].length) {
                        const val = boardState[c][logicalR];
                        const piece = document.createElement('div');
                        piece.className = `chip ${val === 1 ? 'p1' : 'p2'}`;
                        
                        // Drop animation if it's the last move
                        if (lastMoveData && lastMoveData.c === c && lastMoveData.r === logicalR) {
                            piece.classList.add('dropping');
                            piece.style.setProperty('--drop-dist', `-${(visR + 1) * 110}%`); 
                        }

                        // Win highlight
                        const isWinCell = winningCells.find(w => w.c === c && w.r === logicalR);
                        if (isWinCell) piece.classList.add('winning');

                        slot.appendChild(piece);
                    } else if (isMyTurn && logicalR === boardState[c].length) {
                        // Render translucent ghost chip in the exact slot it will land
                        const ghost = document.createElement('div');
                        ghost.className = `chip ghost ${myPlayerNum === 1 ? 'p1' : 'p2'}`;
                        slot.appendChild(ghost);
                    }

                    colGroup.appendChild(slot);
                }
                
                boardEl.appendChild(colGroup);
            }
        }

        function sendMove(c) {
            MP.publish('MOVE', { col: c });
        }

        function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
