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
                
                // New Chip Percussion Sounds
                playMove: () => { 
                    playTone(800, 'square', 0.04, 0.15, 100); 
                },
                playCapture: () => { 
                    playTone(1000, 'square', 0.03, 0.15, 150); 
                    setTimeout(() => playTone(1200, 'triangle', 0.04, 0.15, 100), 50); 
                },

                playKing: () => { playTone(400, 'triangle', 0.1, 0.1); setTimeout(()=>playTone(500, 'triangle', 0.1, 0.1), 100); setTimeout(()=>playTone(600, 'triangle', 0.3, 0.15), 200); },
                playTick: () => playTone(800, 'square', 0.05, 0.05),
                playWin: () => { [300, 400, 500, 600, 800].forEach((f, i) => setTimeout(() => playTone(f, 'sine', 0.3, 0.15), i*100)); },
                playLose: () => { [400, 350, 300, 250, 200].forEach((f, i) => setTimeout(() => playTone(f, 'sawtooth', 0.4, 0.1), i*200)); }
            };
        })();

        // Interaction unlocks Audio
        document.body.addEventListener('click', SoundFX.init, { once: true });

        let currentRooms = [];
        let roomCode = '';
        let myId = '';
        let isHost = false;
        let lastPlayerCount = 0;
        
        let displayName = localStorage.getItem('pixelb8CheckersName') || `Player_${Math.floor(Math.random() * 9000)}`;
        $('#player-name').value = displayName;

        // Game State variables
        let boardState = [];
        let currentTurn = 1; // 1 = P1 (Red), 2 = P2 (Black)
        let gameStatus = 'waiting'; // waiting, starting, playing, finished
        let jumpRule = 'chain'; // 'chain' or 'single'
        let multiJumpingPiece = null; 

        // Timer State
        const TURN_TIME_LIMIT = 55; // 45s normal + 10s grace
        let hostTimerInterval = null;
        let turnTimeLeft = TURN_TIME_LIMIT;

        let myPlayerNum = 0; 
        let p1Id = null, p2Id = null;
        
        let selectedRow = -1, selectedCol = -1;
        let validMoves = []; 

        // --- INIT NETWORK ---
        MP.init({
            gameId: 'checkers',
            playerName: displayName,
            onRooms: rooms => { currentRooms = rooms; renderRooms(); },
            onRoster: roster => { 
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
            jumpRule = $('#jump-rule').value;
            MP.hostRoom({ code, mode: 'checkers', maxPlayers: 2, name: `${displayName}'s Table` });
        };
        $('#join-code-btn').onclick = () => joinRoom($('#join-code').value);
        $('#leave-room').onclick = () => { MP.disconnect(); location.reload(); };
        $('#copy-code').onclick = async () => { await navigator.clipboard?.writeText(roomCode); $('#copy-code').textContent = 'COPIED!'; setTimeout(() => $('#copy-code').textContent = 'COPY CODE', 1200); };
        
        $('#rematch-btn').onclick = () => { if (isHost) hostInitiateCountdown(10); };

        function safePublish(type, payload = {}) {
            MP.publish(type, payload);
            if (isHost) handleNetworkMessage({ type, senderId: myId, ...payload });
        }
        function rememberName() { displayName = $('#player-name').value.trim().slice(0, 18) || displayName; localStorage.setItem('pixelb8CheckersName', displayName); MP.setPlayerName(displayName); }
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
                    if (senderId === p2Id) return '#e0e6ed';
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

            if (p1Id && p2Id && gameStatus === 'waiting') {
                hostInitiateCountdown(30);
            }

            if (!p2Id && gameStatus === 'starting') {
                gameStatus = 'waiting';
                if (hostTimerInterval) clearInterval(hostTimerInterval);
                safePublish('SYNC_BOARD', { boardState, currentTurn, gameStatus, jumpRule, multiJumpingPiece });
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
            boardState = Array(8).fill(null).map(() => Array(8).fill(0));
            $('#winner-screen').classList.add('hidden');
            drawBoard();
        }

        function hostInitiateCountdown(duration = 30) {
            if (!p1Id || !p2Id) return;
            gameStatus = 'starting';
            turnTimeLeft = duration;
            boardState = Array(8).fill(null).map(() => Array(8).fill(0));

            for(let r=0; r<3; r++) { for(let c=0; c<8; c++) { if((r+c)%2 !== 0) boardState[r][c] = 2; } }
            for(let r=5; r<8; r++) { for(let c=0; c<8; c++) { if((r+c)%2 !== 0) boardState[r][c] = 1; } }
            
            multiJumpingPiece = null;
            MP.updateRoom({ status: 'playing' });
            
            if (hostTimerInterval) clearInterval(hostTimerInterval);
            hostTimerInterval = setInterval(hostTimeTick, 1000);

            safePublish('SYNC_BOARD', { boardState, currentTurn: 0, gameStatus, jumpRule, multiJumpingPiece });
            safePublish('SYNC_TIME', { turnTimeLeft, currentTurn: 0 });

            updateStatusBanner();
            drawBoard();
            updateTimerDisplay(turnTimeLeft, 0);
        }

        function hostStartGame() {
            currentTurn = 1;
            gameStatus = 'playing';
            turnTimeLeft = TURN_TIME_LIMIT;
            
            safePublish('SYNC_BOARD', { boardState, currentTurn, gameStatus, jumpRule, multiJumpingPiece });
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

        function hostEndGame(winnerNum, reason) {
            gameStatus = 'finished';
            currentTurn = winnerNum; 
            if (hostTimerInterval) clearInterval(hostTimerInterval);
            MP.updateRoom({ status: 'finished' });
            safePublish('SYNC_BOARD', { boardState, currentTurn, gameStatus, jumpRule, multiJumpingPiece, winReason: reason });
        }

        function hostProcessMove(senderId, fromR, fromC, toR, toC) {
            if (gameStatus !== 'playing') return;
            const expectedId = (currentTurn === 1) ? p1Id : p2Id;
            if (senderId !== expectedId) return;

            if (multiJumpingPiece) { if (fromR !== multiJumpingPiece.r || fromC !== multiJumpingPiece.c) return; }

            const pNum = currentTurn;
            const val = boardState[fromR][fromC];
            if (val === 0 || !isEnemy(val, pNum === 1 ? 2 : 1)) return; 
            
            calculateValidMoves(fromR, fromC, val, pNum);
            if (multiJumpingPiece) validMoves = validMoves.filter(m => m.isJump);

            const move = validMoves.find(m => m.r === toR && m.c === toC);
            if (!move) return;

            boardState[toR][toC] = val;
            boardState[fromR][fromC] = 0;
            let pieceCrowned = false;
            
            let sound = 'move';
            if (move.isJump) { boardState[move.jumpedR][move.jumpedC] = 0; sound = 'capture'; }

            if (pNum === 1 && toR === 0 && val === 1) { boardState[toR][toC] = 3; pieceCrowned = true; sound = 'king'; }
            if (pNum === 2 && toR === 7 && val === 2) { boardState[toR][toC] = 4; pieceCrowned = true; sound = 'king'; }

            safePublish('PLAY_SOUND', { sound });

            let oppHasPieces = false;
            for(let r=0; r<8; r++) { for(let c=0; c<8; c++) { if (isEnemy(boardState[r][c], pNum)) oppHasPieces = true; } }

            if (!oppHasPieces) {
                hostEndGame(pNum, 'elimination');
                return;
            } else {
                let canMultiJump = false;
                if (jumpRule === 'chain' && move.isJump && !pieceCrowned) {
                    calculateValidMoves(toR, toC, boardState[toR][toC], pNum);
                    if (validMoves.some(m => m.isJump)) canMultiJump = true;
                }

                if (canMultiJump) {
                    multiJumpingPiece = { r: toR, c: toC };
                    turnTimeLeft = TURN_TIME_LIMIT; 
                } else {
                    currentTurn = currentTurn === 1 ? 2 : 1;
                    multiJumpingPiece = null;
                    turnTimeLeft = TURN_TIME_LIMIT; 

                    // Check for trapped opponent (no available moves)
                    let hasMoves = false;
                    for (let rr=0; rr<8 && !hasMoves; rr++) {
                        for (let cc=0; cc<8 && !hasMoves; cc++) {
                            const valCheck = boardState[rr][cc];
                            if (valCheck !== 0 && !isEnemy(valCheck, currentTurn)) {
                                calculateValidMoves(rr, cc, valCheck, currentTurn);
                                if (validMoves.length > 0) hasMoves = true;
                            }
                        }
                    }

                    if (!hasMoves) {
                        hostEndGame(pNum, 'no_moves');
                        return;
                    }
                }
            }

            validMoves = [];
            safePublish('SYNC_BOARD', { boardState, currentTurn, gameStatus, jumpRule, multiJumpingPiece });
            safePublish('SYNC_TIME', { turnTimeLeft, currentTurn });
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
                if (msg.sound === 'move') SoundFX.playMove();
                if (msg.sound === 'capture') SoundFX.playCapture();
                if (msg.sound === 'king') SoundFX.playKing();
            }

            if (msg.type === 'SYNC_TIME') {
                updateTimerDisplay(msg.turnTimeLeft, msg.currentTurn);
            }

            if (msg.type === 'SYNC_BOARD') {
                boardState = msg.boardState;
                currentTurn = msg.currentTurn;
                gameStatus = msg.gameStatus;
                jumpRule = msg.jumpRule;
                multiJumpingPiece = msg.multiJumpingPiece;
                
                selectedRow = -1; selectedCol = -1; validMoves = [];
                
                if (multiJumpingPiece && currentTurn === myPlayerNum) {
                    selectedRow = multiJumpingPiece.r; selectedCol = multiJumpingPiece.c;
                    calculateValidMoves(selectedRow, selectedCol, boardState[selectedRow][selectedCol], myPlayerNum);
                    validMoves = validMoves.filter(m => m.isJump);
                }
                
                updateStatusBanner();
                drawBoard();

                if (gameStatus === 'finished') {
                    showWinnerScreen(msg.winReason);
                } else {
                    $('#winner-screen').classList.add('hidden');
                }
            }

            if (msg.type === 'MOVE' && isHost) {
                hostProcessMove(msg.senderId, msg.fromR, msg.fromC, msg.toR, msg.toC);
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

            if (timeLeft > 10) {
                tDisp.textContent = `${timeLeft - 10}s`;
                tDisp.classList.remove('danger');
                $('#status-banner').classList.remove('warning');
            } else {
                tDisp.textContent = `AUTO-FORFEIT IN: ${timeLeft}s`;
                tDisp.classList.add('danger');
                $('#status-banner').classList.add('warning');
                
                if (activeTurn === myPlayerNum && timeLeft > 0) {
                    SoundFX.playTick();
                }
            }
        }

        function updateStatusBanner() {
            const banner = $('#status-banner');
            banner.className = 'status-banner';
            const ind = $('#turn-indicator');
            
            if (gameStatus === 'waiting') {
                ind.textContent = isHost ? (p2Id ? "Ready to start match!" : "Waiting for opponent...") : "Waiting for host to start...";
                $('#timer-display').classList.add('hidden');
            } else if (gameStatus === 'starting') {
                ind.textContent = "PREPARING BOARD...";
                banner.classList.add('black'); 
            } else if (gameStatus === 'playing') {
                const isMyTurn = (currentTurn === myPlayerNum);
                if (multiJumpingPiece) {
                    ind.textContent = isMyTurn ? "CHAIN JUMP AVAILABLE!" : (currentTurn === 1 ? "RED IS MULTI-JUMPING..." : "BLACK IS MULTI-JUMPING...");
                } else {
                    ind.textContent = isMyTurn ? "YOUR TURN" : (currentTurn === 1 ? "RED'S TURN" : "BLACK'S TURN");
                }
                banner.classList.add(currentTurn === 1 ? 'red' : 'black');
            } else if (gameStatus === 'finished') {
                $('#timer-display').classList.add('hidden');
                ind.textContent = currentTurn === 1 ? "RED WINS!" : "BLACK WINS!";
                banner.classList.add(currentTurn === 1 ? 'red' : 'black');
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
            
            const winnerName = getPlayerName(winnerId, currentTurn === 1 ? "RED" : "BLACK");
            const loserName = getPlayerName(loserId, "Opponent");

            title.textContent = `${winnerName} WINS!`.toUpperCase();
            title.style.color = currentTurn === 1 ? "var(--p1-color)" : "var(--accent)";
            
            sub.textContent = currentTurn === 1 ? "RED TEAM" : "BLACK TEAM";
            
            if (reason === 'timeout') sub.textContent += " (Opponent Forfeit)";
            else if (reason === 'no_moves') sub.textContent += " (Opponent Trapped)";
            else sub.textContent += " (Elimination)";

            loserText.innerHTML = `Better luck next time, <b>${loserName}</b>.`;

            screen.classList.remove('hidden');

            if (isHost) {
                $('#rematch-btn').classList.remove('hidden');
                $('#rematch-btn').onclick = () => {
                    $('#winner-screen').classList.add('hidden');
                    hostInitiateCountdown(10);
                };
            }
        }

        function drawBoard() {
            const boardEl = $('#board');
            boardEl.innerHTML = '';
            const isMyTurn = (currentTurn === myPlayerNum && gameStatus === 'playing');

            for (let r=0; r<8; r++) {
                for (let c=0; c<8; c++) {
                    const isDark = (r+c)%2 !== 0;
                    const sq = document.createElement('div');
                    sq.className = `square ${isDark ? 'dark' : ''}`;
                    sq.dataset.r = r; sq.dataset.c = c;

                    const moveMatch = validMoves.find(m => m.r === r && m.c === c);
                    if (moveMatch && isMyTurn) {
                        sq.classList.add('highlight');
                        sq.onclick = () => MP.publish('MOVE', { fromR: selectedRow, fromC: selectedCol, toR: r, toC: c });
                    }

                    const val = boardState[r][c];
                    if (val > 0) {
                        const piece = document.createElement('div');
                        let pClass = (val === 1 || val === 3) ? 'p1' : 'p2';
                        piece.className = `piece ${pClass} ${val > 2 ? 'king' : ''}`;
                        
                        const belongsToMe = (myPlayerNum === 1 && (val === 1 || val === 3)) || (myPlayerNum === 2 && (val === 2 || val === 4));
                        let isSelectable = belongsToMe && isMyTurn;
                        if (multiJumpingPiece && isMyTurn) isSelectable = (r === multiJumpingPiece.r && c === multiJumpingPiece.c);

                        if (isSelectable) {
                            piece.classList.add('selectable');
                            piece.onclick = (e) => { e.stopPropagation(); selectPiece(r, c, val); };
                        }

                        if (r === selectedRow && c === selectedCol) piece.classList.add('selected');
                        sq.appendChild(piece);
                    }
                    boardEl.appendChild(sq);
                }
            }
        }

        function selectPiece(r, c, val) {
            if (currentTurn !== myPlayerNum) return;
            if (multiJumpingPiece && (r !== multiJumpingPiece.r || c !== multiJumpingPiece.c)) return;

            selectedRow = r; selectedCol = c;
            calculateValidMoves(r, c, val, myPlayerNum);
            if (multiJumpingPiece) validMoves = validMoves.filter(m => m.isJump);
            drawBoard();
        }

        function calculateValidMoves(r, c, val, pNum) {
            validMoves = [];
            const isKing = (val > 2);
            const dirs = [];
            if (pNum === 1 || isKing) dirs.push(-1);
            if (pNum === 2 || isKing) dirs.push(1);

            dirs.forEach(dr => {
                [-1, 1].forEach(dc => {
                    let nr = r + dr, nc = c + dc;
                    if (isOnBoard(nr, nc) && boardState[nr][nc] === 0) validMoves.push({ r: nr, c: nc, isJump: false });
                    let jr = r + (dr*2), jc = c + (dc*2);
                    if (isOnBoard(jr, jc) && boardState[jr][jc] === 0) {
                        const midVal = boardState[nr][nc];
                        if (midVal !== 0 && isEnemy(midVal, pNum)) validMoves.push({ r: jr, c: jc, isJump: true, jumpedR: nr, jumpedC: nc });
                    }
                });
            });
        }

        function isOnBoard(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }
        function isEnemy(val, myNum) {
            if (val === 0) return false;
            const isP1Piece = (val === 1 || val === 3);
            return myNum === 1 ? !isP1Piece : isP1Piece;
        }

        function escapeHtml(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
