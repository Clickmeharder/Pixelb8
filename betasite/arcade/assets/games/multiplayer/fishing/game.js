        const PUBLIC_BROKER = 'wss://broker.hivemq.com:8884/mqtt';
        let client = null;
        let roomTopic = '';
        let myId = 'FISHER_' + Math.floor(Math.random() * 9000 + 1000);
        
        let opponentPresent = false;
        let myScore = 0;
        let rivalScore = 0;
        let isFishing = false;
        let hasBite = false;
        let biteTimer = null;
        let escapeTimer = null;

        // UI Elements
        const lobbyUI = document.getElementById('lobby-ui');
        const gameUI = document.getElementById('game-ui');
        const roomInput = document.getElementById('room-code');
        const btnJoin = document.getElementById('btn-join');
        const lobbyMsg = document.getElementById('lobby-msg');
        
        const myScoreEl = document.getElementById('my-score');
        const rivalScoreEl = document.getElementById('rival-score');
        const bobber = document.getElementById('bobber');
        const btnAction = document.getElementById('btn-action');
        const statusMsg = document.getElementById('status-msg');

        // Connect to MQTT and join room
        btnJoin.addEventListener('click', () => {
            const code = roomInput.value.toUpperCase();
            if (code.length < 2) return;
            
            lobbyMsg.textContent = "Connecting to broker...";
            roomTopic = `pixelb8/fishingclash/${code}`;
            
            client = mqtt.connect(PUBLIC_BROKER);
            
            client.on('connect', () => {
                client.subscribe(roomTopic);
                lobbyUI.classList.add('hidden');
                gameUI.classList.remove('hidden');
                
                btnAction.disabled = true;
                statusMsg.textContent = `Waiting for an opponent in room ${code}...`;
                
                // Announce presence to anyone already in the room
                client.publish(roomTopic, JSON.stringify({ type: 'JOIN', id: myId, score: myScore }));
            });

            client.on('message', (topic, message) => {
                try {
                    const data = JSON.parse(message.toString());
                    
                    // Ignore our own broadcast loops
                    if (data.id === myId) return; 

                    // If we receive a message from someone else, we have an opponent!
                    if (!opponentPresent && (data.type === 'JOIN' || data.type === 'SYNC')) {
                        opponentPresent = true;
                        btnAction.disabled = false;
                        statusMsg.textContent = "A rival appeared! Cast your line!";
                    }

                    if (data.type === 'JOIN') {
                        // Tell the new arrival that we are already here
                        client.publish(roomTopic, JSON.stringify({ type: 'SYNC', id: myId, score: myScore }));
                    }

                    if (data.type === 'SYNC' || data.type === 'SCORE') {
                        rivalScore = data.score;
                        rivalScoreEl.textContent = rivalScore;
                        
                        if (data.type === 'SCORE') {
                            statusMsg.textContent = "Rival caught a fish!";
                            checkWin();
                        }
                    }
                } catch (err) {
                    console.error("MQTT Parse error", err);
                }
            });
        });

        // Game Logic
        btnAction.addEventListener('click', () => {
            if (!opponentPresent) return; // Hard lock just in case

            if (!isFishing && !hasBite) {
                // Cast Line
                isFishing = true;
                btnAction.textContent = "REEL IN";
                bobber.className = 'fishing';
                statusMsg.textContent = "Waiting for a bite...";
                
                // Random time until fish bites (2 to 6 seconds)
                const waitTime = Math.random() * 4000 + 2000;
                biteTimer = setTimeout(triggerBite, waitTime);
                
            } else if (isFishing && !hasBite) {
                // Reeled in too early
                resetRod("You pulled too early! The fish ran away.", 'miss');
            } else if (hasBite) {
                // Caught it!
                myScore++;
                myScoreEl.textContent = myScore;
                client.publish(roomTopic, JSON.stringify({ type: 'SCORE', id: myId, score: myScore }));
                resetRod("Got one! Nice catch.", 'idle');
                checkWin();
            }
        });

        function triggerBite() {
            hasBite = true;
            bobber.className = 'bite';
            statusMsg.textContent = "BITE! REEL IT IN!";
            
            // Player has 800ms to react
            escapeTimer = setTimeout(() => {
                if (hasBite) {
                    resetRod("It got away!", 'miss');
                }
            }, 800);
        }

        function resetRod(msg, bobberClass) {
            clearTimeout(biteTimer);
            clearTimeout(escapeTimer);
            isFishing = false;
            hasBite = false;
            btnAction.textContent = "CAST LINE";
            bobber.className = bobberClass;
            statusMsg.textContent = msg;
            
            if (bobberClass === 'miss') {
                setTimeout(() => bobber.className = '', 1000);
            }
        }

        function checkWin() {
            if (myScore >= 5) {
                statusMsg.textContent = "YOU WIN! The waters are yours.";
                btnAction.disabled = true;
            } else if (rivalScore >= 5) {
                statusMsg.textContent = "RIVAL WINS! Better luck next time.";
                btnAction.disabled = true;
            }
        }