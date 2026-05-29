// =========================================================================
// DECOUPLED STREAM JUKEBOX MODULE (Class-Based - Route B Audio Engine)
// =========================================================================

export class StreamJukebox {
    constructor() {
        this.queue = [];
        this.fallbackPlaylist = JSON.parse(localStorage.getItem("jukeboxFallbackPlaylist")) || [];
        
        // --- ROUTE B MULTIMEDIA PROPERTIES ---
        this.audioEngine = null;      // Native HTML5 Audio Element instance
        this.audioCtx = null;         // Web Audio Context pipeline
        this.analyser = null;         // Audio node tracking frequency data
        this.audioSourceNode = null;  // Node bridge combining HTML5 tag into context
        this.dataArray = null;        // Uint8Array structure storing active slice snapshots
        
        this.currentTrackData = null;
        this.currentTrackVotes = new Set();
        this.currentTrackSkipVotes = new Set();
        this.progressInterval = null; 

        // Load persistent settings
        this.VOTE_REQUIREMENT = parseInt(localStorage.getItem("jbVoteReq")) || 2;
        this.isPlayingSong = false;
        this.streamerName = "jaedraze";
        this.isEnabled = true; 
        this.acceptRequests = true; 
        this.isAudioOnly = true;      // Defaulting to Route B audio stream paradigm
        this.showVisualizer = false;  
        this.avAnimationId = null;   

        this.init();
        console.log("🎵 [Module Init]: StreamJukebox instantiated with true Web Audio reactivity.");
    }

    // --- COMMAND ROUTER ---
    getCommands(sendNotice) {
        const handleRequest = (user, message, flags) => {
            this.handleSongRequest(user, message, sendNotice);
        };

        const jukeboxExecution = (user, message, flags) => {
            const parts = message.trim().toLowerCase().split(/\s+/);
            const subCommand = parts[0];
            const isAdmin = flags.broadcaster || flags.mod;

            if (!subCommand) {
                sendNotice(`🎵 [Jukebox]: Available: !jb [sr | skip | like | status | help | tilt/random | queue]`);
                return;
            }

            switch (subCommand) {
                case 'help':
                case 'h':
                    sendNotice(`🎵 [Jukebox Help]: !sr [link/query] | !jb like | !jb skip | !jb status | !jb tilt [keyword] | !jb queue`);
                    if (isAdmin) sendNotice(`🛠️ [Admin]: !jb [clear | toggle requests | setreq {num}]`);
                    break;

                case 'sr':
                case 'request':
                    const query = parts.slice(1).join(' ');
                    this.handleSongRequest(user, query, sendNotice);
                    break;

                case 'tilt':
                case 'random':
                    const keyword = parts.slice(1).join(' '); 
                    this.playRandomYTSong(sendNotice, keyword);
                    break;

                case 'queue':
                    sendNotice(`🎵 [Jukebox]: Current queue length: ${this.queue.length}.`);
                    break;

                case 'skip':
                    if (isAdmin) {
                        this.skipCurrentSong(sendNotice);
                    } else {
                        this.handleVoteSkip(user, sendNotice);
                    }
                    break;

                case 'like':
                    this.handleLikeSong(user, sendNotice);
                    break;

                case 'clear':
                    if (isAdmin) { 
                        this.queue = []; 
                        this.renderQueueList();
                        this.skipCurrentSong(sendNotice); 
                        sendNotice(`🧹 [Jukebox]: Queue cleared.`);
                    }
                    break;

                case 'status':
                    sendNotice(`🎵 [Status]: Playing: ${this.currentTrackData?.title || 'Nothing'} | Queue: ${this.queue.length} | Requests: ${this.acceptRequests ? 'Open' : 'Closed'}`);
                    break;

                case 'toggle':
                    if (!isAdmin) return;
                    if (parts[1] === 'requests') {
                        this.acceptRequests = !this.acceptRequests;
                        sendNotice(`📢 [Jukebox]: Requests are now ${this.acceptRequests ? 'ENABLED' : 'DISABLED'}.`);
                    }
                    break;

                case 'setreq':
                    if (!isAdmin || !parts[1]) return;
                    this.VOTE_REQUIREMENT = parseInt(parts[1]);
                    localStorage.setItem("jbVoteReq", this.VOTE_REQUIREMENT);
                    sendNotice(`🗳️ [Jukebox]: Vote requirement updated to ${this.VOTE_REQUIREMENT}.`);
                    break;

                default:
                    sendNotice(`❌ Action !jb ${subCommand} unknown.`);
            }
        };

        return [
            { name: 'jb', adminOnly: false, execute: jukeboxExecution },
            { name: 'jukebox', adminOnly: false, execute: jukeboxExecution },
            { name: 'skip', adminOnly: false, execute: (user, message, flags) => jukeboxExecution(user, 'skip', flags) },
            { name: 'sr', adminOnly: false, execute: handleRequest },
            { name: 'request', adminOnly: false, execute: handleRequest }
        ];
    }

    // --- UI DISPLAY ---
    updatePlayerDisplay(customTitle = null) {
        const titleElements = document.querySelectorAll('.jb-current-title');
        const nextEl = document.getElementById('jb-next-title');

        const displayTitle = customTitle || (this.currentTrackData ? this.currentTrackData.title : "No Track Loaded");
        
        titleElements.forEach(el => {
            el.textContent = displayTitle;
        });

        let upNextString = "Nothing queued";
        if (this.queue.length > 0) {
            upNextString = this.queue[0].title;
        } else if (this.fallbackPlaylist.length > 0) {
            upNextString = "Random Fallback Selection";
        }

        if (nextEl) nextEl.textContent = upNextString;

        const audioNextEl = document.getElementById('jb-audio-next-title');
        if (audioNextEl) audioNextEl.textContent = upNextString;
    }

    // --- Core Logic ---
    async playRandomYTSong(sendNotice, customKeyword = null) {
        const defaultKeywords = ['lofi hip hop', 'synthwave', 'chill beats', 'rock hits', 'jazz piano'];
        const keyword = customKeyword || defaultKeywords[Math.floor(Math.random() * defaultKeywords.length)];
        
        sendNotice(`🎲 [JB]: Searching for: ${keyword}...`);
        const track = await this.fetchTrack(keyword);
        
        if (track) {
            this.queue.push({ user: 'System', title: track.title, id: track.id, isSearch: false });
            this.renderQueueList();
            this.updatePlayerDisplay();
            sendNotice(`🎵 [JB]: Random track found: "${track.title}"`);
            if (!this.isPlayingSong) this.playNextSong(sendNotice);
        } else {
            sendNotice(`❌ [JB]: Could not find a song for "${keyword}".`);
        }
    }

    updateBadge(id, isActive) {
        const badge = document.getElementById(id);
        if (!badge) return;
        badge.className = `toggle-status-badge ${isActive ? 'status-enabled' : 'status-disabled'}`;
        badge.innerText = isActive ? 'ON' : 'OFF';
    }

    triggerVoteToast(username, currentCount, targetCount, isSkipVote = false) {
        const container = document.getElementById("overlay-wrapper");
        if (!container) return;
        const toast = document.createElement("div");
        toast.className = "p8-toast";
        toast.style.cssText = "position: absolute; bottom: 20px; right: 20px; background: rgba(0,0,0,0.9); color: #fff; padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent); z-index: 1000; font-family: monospace; pointer-events: none;";
        
        const displayCount = this.VOTE_REQUIREMENT === 0 ? "∞" : targetCount;
        if (isSkipVote) {
            toast.innerHTML = `⏭️ <strong>${username}</strong> voted to skip! <br> Progress: ${currentCount} / ${displayCount}`;
        } else {
            toast.innerHTML = `👍 <strong>${username}</strong> liked this! <br> Progress: ${currentCount} / ${displayCount}`;
        }
        
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    triggerMilestoneOverlay(songTitle) {
        const widget = document.getElementById("alert-widget");
        const text = document.getElementById("alert-text");
        if (!widget || !text) return;
        
        const oldHtml = text.innerHTML;
        widget.style.display = "block";
        text.innerHTML = `<div style="color:#eab308;">🔥 Community Choice!</div><div style="margin-top:5px;">"${songTitle}" added to Fallback!</div>`;
        
        setTimeout(() => {
            widget.style.display = "none";
            text.innerHTML = oldHtml;
        }, 6500);
    }

    // --- CORE INITIALIZATION ---
    init() {
        // Build or bind native HTML5 audio stream context container
        let audioTag = document.getElementById('jukebox-audio-engine');
        if (!audioTag) {
            audioTag = document.createElement('audio');
            audioTag.id = 'jukebox-audio-engine';
            // CRITICAL: Bypasses CORS tracking boundaries across cross-origin streaming points
            audioTag.crossOrigin = "anonymous"; 
            audioTag.style.display = "none";
            document.body.appendChild(audioTag);
        }
        this.audioEngine = audioTag;

        // Hook lifecycle tracking event registers directly into Native Audio engine
        this.audioEngine.onended = () => {
            this.playNextSong((msg) => console.log(msg));
        };

        this.audioEngine.onplaying = () => {
            this.isPlayingSong = true;
            this.updatePlayerDisplay();
            this.startAudioProgressTracking();
            // Fire up true audio tracking nodes if visualizer toggle state matches layout
            if (this.showVisualizer) this.startVisualizerLoop();
        };

        this.audioEngine.onpause = () => {
            this.stopAudioProgressTracking();
        };

        // Inject initial interface wrapper structure rules safely
        const wrapper = document.getElementById('jukebox-video-wrapper');
        if (wrapper) {
            // Remap obsolete native iframe blocks out of layout rendering tree
            const oldPlayer = document.getElementById('player');
            if (oldPlayer) oldPlayer.style.display = "none";
            
            // Forces panel configuration styles
            this.toggleAudioOnly(this.isAudioOnly);
        }

        this.bindControls();
        this.renderFallbackList();
        this.renderQueueList();
        
        // Attempt early playback loop check
        this.playNextSong((msg) => console.log(msg));
    }

    // --- AUDIO PIPELINE HOOK (Lazy Loaded Context initialization) ---
    setupAudioContextPipeline() {
        if (this.audioCtx) return; // Prevent breaking pipeline duplication loops

        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContextClass();
            this.analyser = this.audioCtx.createAnalyser();
            
            // Connect native element to processing workspace node map
            this.audioSourceNode = this.audioCtx.createMediaElementSource(this.audioEngine);
            this.audioSourceNode.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination); // Route stream out to physical speakers

            // Configuration parameters for digital audio parsing loops
            this.analyser.fftSize = 256; // 128 distinct frequency bins
            const bufferLength = this.analyser.frequencyBinCount;
            this.dataArray = new Uint8Array(bufferLength);
        } catch (error) {
            console.error("❌ Failed to instantiate Web Audio Context routing:", error);
        }
    }

    // Interval tracking loop processing time updates
    startAudioProgressTracking() {
        this.stopAudioProgressTracking();
        this.progressInterval = setInterval(() => {
            if (!this.audioEngine) return;
            
            const elapsed = this.audioEngine.currentTime || 0;
            const total = this.audioEngine.duration || 0;
            const bar = document.getElementById('jb-audio-progress-bar');
            const stamp = document.getElementById('jb-audio-time-stamp');

            if (bar && total > 0) {
                const percentage = (elapsed / total) * 100;
                bar.style.width = `${percentage}%`;
            }

            if (stamp) {
                const formatTime = (seconds) => {
                    if (isNaN(seconds)) return "0:00";
                    const mins = Math.floor(seconds / 60);
                    const secs = Math.floor(seconds % 60);
                    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
                };
                stamp.textContent = `${formatTime(elapsed)} / ${formatTime(total)}`;
            }
        }, 250);
    }

    stopAudioProgressTracking() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
            this.progressInterval = null;
        }
    }

    applyButtonStyles() {
        const buttons = {
            'jb-skip-btn': 'p8-btn p8-btn-warning',
            'jb-clear-btn': 'p8-btn danger-btn',
            'jb-add-queue-btn': 'p8-btn p8-btn-success',
            'jb-add-fallback-btn': 'p8-btn p8-btn-success'
        };
        
        Object.keys(buttons).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.className = buttons[id];
        });
    }

    bindControls() {
        this.applyButtonStyles();
        const currentSkipBtn = document.getElementById('jb-current-skip');
        if(currentSkipBtn) currentSkipBtn.onclick = () => this.skipCurrentSong((msg) => console.log(msg));

        const currentHeartBtn = document.getElementById('jb-current-heart');
        if(currentHeartBtn) currentHeartBtn.onclick = () => this.handleLikeSong('SystemUI', (msg) => console.log(msg));

        const skipBtn = document.getElementById('jb-skip-btn');
        if(skipBtn) skipBtn.onclick = () => this.skipCurrentSong((msg) => console.log(msg));

        const clearBtn = document.getElementById('jb-clear-btn');
        if(clearBtn) clearBtn.onclick = () => { this.queue = []; this.renderQueueList(); this.skipCurrentSong((msg) => console.log(msg)); };
        
        const voteInput = document.getElementById('jb-vote-req-input');
        if (voteInput) {
            voteInput.value = this.VOTE_REQUIREMENT;
            voteInput.onchange = (e) => { this.VOTE_REQUIREMENT = parseInt(e.target.value); localStorage.setItem("jbVoteReq", this.VOTE_REQUIREMENT); };
        }

        const addQueueBtn = document.getElementById('jb-add-queue-btn');
        if(addQueueBtn) addQueueBtn.onclick = () => {
            const val = document.getElementById('jb-search-input').value;
            if (val) { this.manualAddSong(val, (msg) => console.log(msg)); document.getElementById('jb-search-input').value = ''; }
        };

        const addFallbackBtn = document.getElementById('jb-add-fallback-btn');
        if(addFallbackBtn) addFallbackBtn.onclick = () => {
            const val = document.getElementById('jb-search-input').value;
            if (val) { this.handleAddFallback('System', val, (msg) => console.log(msg)); document.getElementById('jb-search-input').value = ''; }
        };

        const toggleCheckbox = document.getElementById('stg-toggle-jukebox-checkbox');
        if (toggleCheckbox) {
            toggleCheckbox.checked = this.isEnabled;
            this.updateBadge('jb-status-badge', this.isEnabled);
            toggleCheckbox.onchange = (e) => {
                this.setWidgetActiveState(e.target.checked);
                this.updateBadge('jb-status-badge', e.target.checked);
            };
        }

        const requestToggle = document.getElementById('stg-toggle-requests-checkbox');
        if (requestToggle) {
            requestToggle.checked = this.acceptRequests;
            this.updateBadge('req-status-badge', this.acceptRequests);
            requestToggle.onchange = (e) => {
                this.acceptRequests = e.target.checked;
                this.updateBadge('req-status-badge', e.target.checked);
            };
        }

        const audioToggle = document.getElementById('stg-toggle-audio-only-checkbox');
        if (audioToggle) {
            audioToggle.checked = this.isAudioOnly;
            this.updateBadge('audio-status-badge', this.isAudioOnly);
            audioToggle.onchange = (e) => {
                this.toggleAudioOnly(e.target.checked);
                this.updateBadge('audio-status-badge', e.target.checked);
            };
        }

        const avToggle = document.getElementById('stg-toggle-visualizer-checkbox');
        if (avToggle) {
            avToggle.checked = this.showVisualizer;
            this.updateBadge('av-status-badge', this.showVisualizer);
            avToggle.onchange = (e) => {
                this.toggleVisualizer(e.target.checked);
                this.updateBadge('av-status-badge', e.target.checked);
            };
        }
    }

    toggleAudioOnly(state) {
        this.isAudioOnly = state;
        const wrapper = document.getElementById('jukebox-video-wrapper');
        
        if (wrapper) {
            wrapper.style.height = "64px"; 
            wrapper.style.opacity = "1";
            wrapper.style.position = "relative";
            wrapper.style.overflow = "hidden";
            
            let overlayTrackPanel = document.getElementById('jb-audio-overlay-panel');
            if (!overlayTrackPanel) {
                overlayTrackPanel = document.createElement('div');
                overlayTrackPanel.id = 'jb-audio-overlay-panel';
                overlayTrackPanel.style.cssText = `
                    position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                    background: #18181b; color: #f4f4f5; display: flex; align-items: center; 
                    justify-content: space-between; padding: 0 16px; box-sizing: border-box; 
                    font-family: monospace; z-index: 10; border: 1px solid #27272a; border-radius: 6px;
                `;
                
                overlayTrackPanel.innerHTML = `
                    <div style="flex: 1; min-width: 0; padding-right: 16px; display: flex; flex-direction: column; justify-content: center;">
                        <div class="jb-current-title" style="font-size: 13px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #f4f4f5;">No Track Loaded</div>
                        <div style="font-size: 10px; color: #a1a1aa; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 2px;">
                            <span>⏭️ Next: </span><span id="jb-audio-next-title" style="color: #a855f7; font-weight: bold;">Nothing queued</span>
                        </div>
                    </div>
                    <div style="width: 240px; display: flex; flex-direction: column; align-items: flex-end; justify-content: center; flex-shrink: 0;">
                        <div style="width: 100%; background: #3f3f46; height: 5px; border-radius: 3px; overflow: hidden; position: relative; margin-bottom: 4px;">
                            <div id="jb-audio-progress-bar" style="width: 0%; background: var(--accent, #a855f7); height: 100%; transition: width 0.25s linear;"></div>
                        </div>
                        <div id="jb-audio-time-stamp" style="font-size: 10px; color: #a1a1aa; font-variant-numeric: tabular-nums;">0:00 / 0:00</div>
                    </div>
                `;
                wrapper.appendChild(overlayTrackPanel);
            } else {
                overlayTrackPanel.style.display = 'flex';
            }
            
            this.updatePlayerDisplay();
            this.startAudioProgressTracking();
        }
    }

    toggleVisualizer(state) {
        this.showVisualizer = state;
        const container = document.getElementById('overlay-wrapper');
        let avWidget = document.getElementById('jukebox-av-widget');

        if (!container) return;

        if (state) {
            // Lazy load and configure operational audio contexts on initial activation interaction
            this.setupAudioContextPipeline();
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
            }

            if (!avWidget) {
                avWidget = document.createElement('canvas');
                avWidget.id = 'jukebox-av-widget';
                avWidget.style.cssText = "position: absolute; bottom: 0; left: 0; width: 100%; height: 40px; pointer-events: none; z-index: 999; display: block;";
                container.appendChild(avWidget);
                
                const resizeCanvas = () => {
                    avWidget.width = avWidget.parentElement.clientWidth || window.innerWidth;
                    avWidget.height = 40;
                };
                window.addEventListener('resize', resizeCanvas);
                resizeCanvas();
            }
            this.startVisualizerLoop();
        } else {
            if (this.avAnimationId) {
                cancelAnimationFrame(this.avAnimationId);
                this.avAnimationId = null;
            }
            if (avWidget) avWidget.remove();
        }
    }

    // --- TRUE DATA-DRIVEN AUDIO VISUALIZER LOOP ---
    startVisualizerLoop() {
        if (this.avAnimationId) cancelAnimationFrame(this.avAnimationId);
        
        const canvas = document.getElementById('jukebox-av-widget');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const render = () => {
            if (!this.showVisualizer) return;
            
            this.avAnimationId = requestAnimationFrame(render);
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let isPlaying = this.audioEngine && !this.audioEngine.paused && !this.audioEngine.ended;
            
            if (isPlaying && this.analyser && this.dataArray) {
                // Grab the actual physical raw audio frequency amplitudes!
                this.analyser.getByteFrequencyData(this.dataArray);
            } else {
                // Instantly zero out array values if the media track halts or buffers
                if (this.dataArray) this.dataArray.fill(0);
            }

            const barWidth = 6;
            const barGap = 4;
            const totalBars = Math.ceil(canvas.width / (barWidth + barGap));
            
            // Map true data bytes across rendered spectrum bands
            for (let i = 0; i < totalBars; i++) {
                let audioValue = 0;
                
                if (this.dataArray) {
                    // Pull indices from frequency array sequentially (wrap around if bars exceed buffer size)
                    const dataIndex = i % this.dataArray.length;
                    audioValue = this.dataArray[dataIndex]; 
                }

                // If stream is active, use authentic values. If paused, run a tiny background drift
                let normalizedHeight = 0;
                if (isPlaying && audioValue > 0) {
                    normalizedHeight = audioValue / 255; // 0.0 -> 1.0 range tracking mapping
                } else {
                    // Fall back to a minor ambient floating wave trace line so UI isn't flat static dead
                    normalizedHeight = (Math.sin(i * 0.15 + Date.now() * 0.002) + 1) * 0.5 * 0.04;
                }

                const barHeight = normalizedHeight * (canvas.height - 6) + 2;
                const xPos = i * (barWidth + barGap);
                const yPos = canvas.height - barHeight;
                
                const hue = 270 + (i * 0.3) % 40; 
                ctx.fillStyle = `hsla(${hue}, 85%, 65%, ${isPlaying ? '0.85' : '0.25'})`;
                
                ctx.fillRect(xPos, yPos, barWidth, barHeight);
            }
        };
        
        this.avAnimationId = requestAnimationFrame(render);
    }

    renderQueueList() {
        const list = document.getElementById('jb-queue-list');
        if (!list) return;
        list.innerHTML = '';
        this.queue.forEach((item, index) => {
            const div = document.createElement('div');
            div.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 4px 8px; border-bottom: 1px solid #27272a; font-size: 10px;";
            
            const info = document.createElement('span');
            info.innerText = `${index + 1}. ${item.title.substring(0, 20)} (@${item.user})`;
            
            const btnGroup = document.createElement('div');
            
            const heart = document.createElement('button');
            heart.innerText = '❤';
            heart.style.cssText = "margin-right: 6px; color: #e11d48; background: transparent; border: none; cursor: pointer; font-size: 12px;";
            heart.onclick = async () => { 
                const track = item.isSearch ? await this.fetchTrack(item.id) : item;
                if (track) this.saveFallbackItem(track, item.user);
            };
            
            const del = document.createElement('button');
            del.innerText = '✕';
            del.style.cssText = "color: #991b1b; background: transparent; border: none; cursor: pointer; font-size: 12px; font-weight: bold;";
            del.onclick = () => { this.queue.splice(index, 1); this.renderQueueList(); this.updatePlayerDisplay(); };
            
            btnGroup.appendChild(heart);
            btnGroup.appendChild(del);
            div.appendChild(info);
            div.appendChild(btnGroup);
            list.appendChild(div);
        });
    }

    renderFallbackList() {
        const list = document.getElementById('jb-fallback-list');
        if (!list) return;
        list.innerHTML = '';

        this.fallbackPlaylist.forEach((item, index) => {
            const div = document.createElement('div');
            div.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-bottom: 1px solid #3f3f46; font-size: 11px;";
            
            const info = document.createElement('div');
            info.style.cursor = 'pointer';
            info.innerHTML = `<strong>${item.title}</strong><br><span style="color: #a1a1aa;">Req: ${item.user || 'System'}</span>`;
            info.onclick = () => { 
                this.isPlayingSong = true;
                this.currentTrackVotes.clear();
                this.currentTrackSkipVotes.clear();
                this.currentTrackData = item; 
                this.updatePlayerDisplay();
                this.streamRouteBTrackSource(item.id); 
            };

            const delBtn = document.createElement('button');
            delBtn.innerText = '✕';
            delBtn.className = 'p8-btn';
            delBtn.style.cssText = "margin:4px;background: #991b1b; padding: 2px 4px; min-width: 24px;max-width:23px; font-size: 10px; border-radius: 4px; border: none; cursor: pointer;";
            delBtn.onclick = (e) => {
                e.stopPropagation();
                this.fallbackPlaylist.splice(index, 1);
                localStorage.setItem("jukeboxFallbackPlaylist", JSON.stringify(this.fallbackPlaylist));
                this.renderFallbackList();
            };

            div.appendChild(info);
            div.appendChild(delBtn);
            list.appendChild(div);
        });
    }

    setWidgetActiveState(state) {
        this.isEnabled = state;
        const widget = document.getElementById('jukebox-widget');
        if (widget) widget.style.display = state ? "block" : "none";
        if (!state && this.audioEngine) { 
            this.audioEngine.pause();
            this.audioEngine.src = "";
            this.isPlayingSong = false;
            this.currentTrackData = null;
            this.updatePlayerDisplay();
            this.stopAudioProgressTracking();
            this.toggleVisualizer(false); 
            const avToggle = document.getElementById('stg-toggle-visualizer-checkbox');
            if (avToggle) avToggle.checked = false;
            this.updateBadge('av-status-badge', false);
        }
    }

    async handleSongRequest(user, message, botSay) {
        if (!this.isEnabled || !message) return;
        
        if (!this.acceptRequests) {
            botSay(`🚫 Sorry @${user}, song requests are currently disabled.`);
            return;
        }

        const id = this.extractYouTubeId(message);
        this.queue.push({ user, title: id ? "Link" : message, id: id || message, isSearch: !id });
        
        this.renderQueueList();
        this.updatePlayerDisplay();
        
        botSay(`✅ Queued: "${message.substring(0, 30)}..."`);
        if (!this.isPlayingSong) this.playNextSong(botSay);
    }

    async manualAddSong(query, botSay) {
        const track = await this.fetchTrack(query);
        if (track) {
            this.queue.push({ user: 'System', title: track.title, id: track.id, isSearch: false });
            this.renderQueueList();
            this.updatePlayerDisplay();
            
            if (botSay) botSay(`✅ Added to queue: "${track.title}"`);
            if (!this.isPlayingSong) this.playNextSong(botSay);
        } else {
            if (botSay) botSay(`❌ Could not find: "${query}"`);
        }
    }

    async handleLikeSong(user, botSay) {
        if (!this.currentTrackData) return;
        
        const voter = user.toLowerCase();
        if (this.currentTrackVotes.has(voter)) return;
        
        this.currentTrackVotes.add(voter);
        this.triggerVoteToast(user, this.currentTrackVotes.size, this.VOTE_REQUIREMENT, false);
        
        if (this.VOTE_REQUIREMENT <= 1 || this.currentTrackVotes.size >= this.VOTE_REQUIREMENT) {
            this.saveFallbackItem(this.currentTrackData, "Community");
            if (botSay) botSay(`🔥 "${this.currentTrackData.title}" added to fallback!`);
            this.triggerMilestoneOverlay(this.currentTrackData.title);
        }
    }

    async handleVoteSkip(user, botSay) {
        if (!this.currentTrackData) return;

        const voter = user.toLowerCase();
        if (this.currentTrackSkipVotes.has(voter)) return;

        this.currentTrackSkipVotes.add(voter);
        this.triggerVoteToast(user, this.currentTrackSkipVotes.size, this.VOTE_REQUIREMENT, true);

        if (this.VOTE_REQUIREMENT <= 1 || this.currentTrackSkipVotes.size >= this.VOTE_REQUIREMENT) {
            if (botSay) botSay(`🗳️ Vote skip passed for "${this.currentTrackData.title}"!`);
            this.skipCurrentSong(botSay);
        }
    }

    skipCurrentSong(botSay) {
        this.playNextSong(botSay);
    }

    // --- PLAY NEXT TRACK PARSER ENGINE ---
    async playNextSong(botSay) {
        this.stopAudioProgressTracking();
        this.currentTrackVotes.clear();
        this.currentTrackSkipVotes.clear();

        if (this.queue.length > 0) {
            const nextTrack = this.queue.shift();
            this.renderQueueList();

            if (nextTrack.isSearch) {
                this.updatePlayerDisplay("Searching...");
                const resolved = await this.fetchTrack(nextTrack.id);
                if (resolved) {
                    this.currentTrackData = { id: resolved.id, title: resolved.title, user: nextTrack.user };
                } else {
                    if (botSay) botSay(`❌ Skipping request "${nextTrack.id}" - search resolution failed.`);
                    this.playNextSong(botSay);
                    return;
                }
            } else {
                this.currentTrackData = nextTrack;
            }

            if (this.currentTrackData.title === "Link") {
                this.currentTrackData.title = `Track ID: ${this.currentTrackData.id}`;
            }

            this.isPlayingSong = true;
            this.updatePlayerDisplay();
            if (botSay) botSay(`🎵 Now Playing: "${this.currentTrackData.title}" (@${this.currentTrackData.user})`);
            
            this.streamRouteBTrackSource(this.currentTrackData.id);

        } else if (this.fallbackPlaylist.length > 0) {
            this.isPlayingSong = true;
            this.currentTrackData = this.fallbackPlaylist[Math.floor(Math.random() * this.fallbackPlaylist.length)];
            this.updatePlayerDisplay();
            
            this.streamRouteBTrackSource(this.currentTrackData.id);
        } else {
            this.isPlayingSong = false;
            this.currentTrackData = null;
            this.updatePlayerDisplay("No Track Loaded");
            if (this.audioEngine) this.audioEngine.src = "";
            if (botSay) botSay("📭 Jukebox queue empty.");
        }
    }

    // --- ROUTE B INTERCEPT AND SOURCE RESOLVER ENGINE ---
    async streamRouteBTrackSource(videoId) {
        // Build parsing graph node structure safety fallback catch maps
        this.setupAudioContextPipeline();
        
        // Ensure browser user permission gesture policies are bypassed cleanly
        if (this.audioCtx && this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        const instances = ['https://invidious.flokinet.to', 'https://yewtu.be', 'https://invidious.perennialte.ch'];
        let streamUrl = null;

        // Query the video detail endpoint directly to pull raw media URLs out of host arrays
        for (let host of instances) {
            try {
                const res = await fetch(`${host}/api/v1/videos/${encodeURIComponent(videoId)}`);
                const data = await res.json();
                
                // Track down standard audio streams inside the adaptive audioFormat payload buckets
                if (data?.audioStreams && data.audioStreams.length > 0) {
                    // Sort by bitrate descending to catch high-quality streams
                    data.audioStreams.sort((a, b) => parseInt(b.bitrate || 0) - parseInt(a.bitrate || 0));
                    streamUrl = data.audioStreams[0].url;
                    break;
                }
            } catch (e) {
                continue; 
            }
        }

        if (streamUrl) {
            try {
                this.audioEngine.src = streamUrl;
                this.audioEngine.load();
                this.audioEngine.play();
            } catch (playError) {
                console.error("Playback invocation blocked by pipeline structure mappings:", playError);
                this.playNextSong((msg) => console.log(msg));
            }
        } else {
            console.warn(`❌ Route B stream retrieval failed for Video ID: ${videoId}. Falling forward.`);
            this.playNextSong((msg) => console.log(msg));
        }
    }

    saveFallbackItem(item, username = 'System') {
        if (!this.fallbackPlaylist.some(e => e.id === item.id)) {
            this.fallbackPlaylist.push({ ...item, user: username });
            localStorage.setItem("jukeboxFallbackPlaylist", JSON.stringify(this.fallbackPlaylist));
            this.renderFallbackList();
        }
    }

    async fetchTrack(keywords) {
        const instances = ['https://invidious.flokinet.to', 'https://yewtu.be', 'https://invidious.perennialte.ch'];
        for (let host of instances) {
            try {
                const res = await fetch(`${host}/api/v1/search?q=${encodeURIComponent(keywords)}&type=video`);
                const data = await res.json();
                if (data?.[0]?.videoId) return { id: data[0].videoId, title: data[0].title };
            } catch (e) { continue; }
        }
        return null;
    }

    extractYouTubeId(url) {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
}