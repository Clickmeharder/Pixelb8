// =========================================================================
// DECOUPLED STREAM JUKEBOX MODULE (Class-Based)
// =========================================================================

export class StreamJukebox {
    constructor() {
        this.queue = [];
        this.fallbackPlaylist = JSON.parse(localStorage.getItem("jukeboxFallbackPlaylist")) || [];
        this.ytPlayer = null;
        this.ytPlayerReady = false;
        this.currentTrackData = null;
        this.currentTrackVotes = new Set();
        this.currentTrackSkipVotes = new Set(); // Tracks vote-skips for the active song
        this.progressInterval = null; // Polling loop ticker for tracking progress bar
        this.captureTimer = null;     // Background simulated frequency calculation ticker
        this.trackVolumeLevel = 0;    // Real-time simulated audio intensity baseline
        
        // Synchronized track-specific visualization signature seeds (generated per song ID)
        this.visualSignature = {
            baseHue: 270,
            waveFreq1: 0.15,
            waveFreq2: 0.05,
            speedScale: 0.08
        };
        
        // Load persistent settings
        this.VOTE_REQUIREMENT = parseInt(localStorage.getItem("jbVoteReq")) || 2;
        this.isPlayingSong = false;
        this.streamerName = "jaedraze";
        this.isEnabled = true; 
        this.acceptRequests = true; 
        this.isAudioOnly = false;
        this.showVisualizer = false; // State flag for visualizer
        this.avAnimationId = null;   // Tracker loop instance for the canvas

        this.init();
        console.log("🎵 [Module Init]: StreamJukebox core instantiated.");
    }

    // --- COMMAND ROUTER ---
    getCommands(sendNotice) {
        const handleRequest = (user, message, flags) => {
            this.handleSongRequest(user, message, sendNotice);
        };

        const jukeboxExecution = (user, message, flags) => {
            const parts = message.trim().toLowerCase().split(/\s+/);
            const subCommand = parts[0];
            const isAdmin = flags.broadcaster || flags.mod; // Broadcaster and Mods count as Admin/Staff overrides

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
				case 'likesong':
				case 'love':
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

        if (nextEl) {
            nextEl.textContent = upNextString;
        }

        // Keep the Audio-Only track panel explicitly up to date
        const audioNextEl = document.getElementById('jb-audio-next-title');
        if (audioNextEl) {
            audioNextEl.textContent = upNextString;
        }
    }

    // --- Core Logic ---
    async playRandomYTSong(sendNotice, customKeyword = null) {
        const defaultKeywords = ['lofi hip hop', 'synthwave', 'chill beats', 'rock hits', 'jazz piano'];
        const keyword = customKeyword || defaultKeywords[Math.floor(Math.random() * defaultKeywords.length)];
        
        sendNotice(`🎲 [JB]: Searching for: ${keyword}...`);
        const track = await this.fetchTrack(keyword);
        
        if (track) {
            this.handleSongRequest('System', track.id, sendNotice);
            sendNotice(`🎵 [JB]: Random track found: "${track.title}"`);
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
        text.innerHTML = `<div style="color:#eab308;">🔥 Community Choice!</div><div style="margin-top:5px;">"${songTitle}" added to playlist!</div>`;
        
        setTimeout(() => {
            widget.style.display = "none";
            text.innerHTML = oldHtml;
        }, 6500);
    }

    init() {
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        }

        const setupPlayer = () => {
            this.ytPlayer = new YT.Player('player', {
                height: '100%', 
                width: '100%',
                playerVars: { 'autoplay': 1, 'controls': 1, 'enablejsapi': 1, 'fs': 0 },
                events: {
                    'onReady': () => { 
						this.ytPlayerReady = true; 
						
						// 1. Restore saved height from localStorage
						const savedHeight = localStorage.getItem("jb_wrapper_height");
						const wrapper = document.getElementById('jukebox-video-wrapper');
						if (wrapper && savedHeight) {
							wrapper.style.height = savedHeight;
						}
						
						// 2. Start tracking future resizes
						this.bindResizePersistence(); 
						const savedVol = localStorage.getItem("jbVolume") || 50;
						this.ytPlayer.setVolume(parseInt(savedVol));
                        this.applyButtonStyles();
                        this.bindControls(); 
                        this.renderFallbackList();
                        this.renderQueueList();
                        this.playNextSong((msg) => console.log(msg)); 
                    },
                    'onStateChange': (e) => {
                        if (e.data === YT.PlayerState.ENDED) {
                            this.playNextSong((msg) => console.log(msg));
                        }
                        
                        if (e.data === YT.PlayerState.PLAYING) {
                            const videoData = this.ytPlayer.getVideoData();
                            
                            if (videoData && videoData.title) {
                                if (!this.currentTrackData || 
                                    this.currentTrackData.title === "Link" || 
                                    this.currentTrackData.title === "Searching...") {
                                    
                                    this.currentTrackData = { 
                                        id: videoData.video_id || this.currentTrackData?.id, 
                                        title: videoData.title 
                                    };
                                }
                            }
                            
                            // Immediately parse deterministic mathematical signature values mapped to this ID
                            this.generateTrackVisualSignature();
                            
                            this.updatePlayerDisplay();
                            this.startAudioProgressTracking();
                        } else {
                            this.stopAudioProgressTracking();
                        }
                    }
                }
            });
        };

        if (window.YT && window.YT.Player) {
            setupPlayer();
        } else {
            window.onYouTubeIframeAPIReady = setupPlayer;
        }
    }

    // Generates a completely customized mathematical frequency map based on the active Video ID
    generateTrackVisualSignature() {
        const trackId = this.currentTrackData?.id || "default";
        
        // Simple string hashing function
        let hash = 0;
        for (let i = 0; i < trackId.length; i++) {
            hash = trackId.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);

        this.visualSignature = {
            baseHue: hash % 360,                               // Pick a baseline color palette coordinate
            waveFreq1: 0.08 + ((hash % 100) / 1000),           // Wave multiplication frequency step 1
            waveFreq2: 0.03 + (((hash >> 4) % 100) / 1000),    // Wave multiplication frequency step 2
            speedScale: 0.05 + (((hash >> 8) % 100) / 1500)    // Customized structural tempo modifier
        };
    }

    // Interval Management for parsing playback time dynamically
    startAudioProgressTracking() {
        this.stopAudioProgressTracking();
        this.startAudioFrequencyCaptureLoop();

        this.progressInterval = setInterval(() => {
            if (!this.ytPlayer || typeof this.ytPlayer.getCurrentTime !== 'function') return;
            
            const elapsed = this.ytPlayer.getCurrentTime() || 0;
            const total = this.ytPlayer.getDuration() || 0;
            const bar = document.getElementById('jb-audio-progress-bar');
            const stamp = document.getElementById('jb-audio-time-stamp');

            if (bar && total > 0) {
                const percentage = (elapsed / total) * 100;
                bar.style.width = `${percentage}%`;
            }

            if (stamp) {
                const formatTime = (seconds) => {
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
        this.stopAudioFrequencyCaptureLoop();
    }

    startAudioFrequencyCaptureLoop() {
        if (this.captureTimer) clearInterval(this.captureTimer);
        
        this.captureTimer = setInterval(() => {
            if (this.ytPlayer && typeof this.ytPlayer.getPlayerState === 'function') {
                try {
                    const state = this.ytPlayer.getPlayerState();
                    if (state === 1) { // 1 means Playing
                        this.trackVolumeLevel = Math.random() * 45 + 25; 
                    } else {
                        this.trackVolumeLevel = 0;
                    }
                } catch (err) {
                    this.trackVolumeLevel = 0;
                }
            }
        }, 40);
    }

    stopAudioFrequencyCaptureLoop() {
        if (this.captureTimer) {
            clearInterval(this.captureTimer);
            this.captureTimer = null;
        }
        this.trackVolumeLevel = 0;
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
		const volSlider = document.getElementById('jb-volume-slider');
		if (volSlider) {
			// Sync slider to current player volume on init
			if (this.ytPlayer && typeof this.ytPlayer.getVolume === 'function') {
				volSlider.value = this.ytPlayer.getVolume();
			}

			volSlider.oninput = (e) => {
				const vol = parseInt(e.target.value);
				if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
					this.ytPlayer.setVolume(vol);
					
					// Optional: Save volume to localStorage so it persists
					localStorage.setItem("jbVolume", vol);
				}
			};
		}

	}

	toggleAudioOnly(state) {
        this.isAudioOnly = state;
        const playerContainer = document.getElementById('player');
        const wrapper = document.getElementById('jukebox-video-wrapper');
        const statusContainer = document.getElementById('jb-status-container');
        
        if (playerContainer && wrapper) {
            if (state) {
                // 1. Shrink the native player and hide the original UI
                playerContainer.style.width = "0px";
                playerContainer.style.height = "0px";
                playerContainer.style.visibility = "hidden";
                if (statusContainer) statusContainer.style.display = "none";
                
                // 2. Set the wrapper to a clean, slim profile
                wrapper.style.height = "72px";
                wrapper.style.transition = "all 0.3s ease";
                wrapper.style.position = "relative";
                
                let overlayTrackPanel = document.getElementById('jb-audio-overlay-panel');
                if (!overlayTrackPanel) {
                    overlayTrackPanel = document.createElement('div');
                    overlayTrackPanel.id = 'jb-audio-overlay-panel';
                    overlayTrackPanel.style.cssText = `
                        position: absolute; top: 0; left: 0; width: 100%; height: 100%; 
                        background: linear-gradient(135deg, #18181b 0%, #27272a 100%);
                        color: #ffffff; display: flex; align-items: center; 
                        padding: 0 20px; box-sizing: border-box; 
                        font-family: 'Inter', sans-serif; z-index: 10; 
                        border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);
                        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
                    `;
                    
                    overlayTrackPanel.innerHTML = `
                        <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0; overflow: hidden; padding: 4px 0;">
                            <div style="margin-bottom: 6px;">
                                <div class="jb-current-title" style="font-size: 15px; font-weight: 700; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block;">
                                    No Track Loaded
                                </div>
                            </div>
                            
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
                                    <div style="width: 100%; background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; overflow: hidden; margin-bottom: 3px;">
                                        <div id="jb-audio-progress-bar" style="width: 0%; background: #a855f7; height: 100%; transition: width 0.3s linear; border-radius: 2px;"></div>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                                        <div id="jb-audio-time-stamp" style="font-size: 9px; color: #71717a; font-variant-numeric: tabular-nums;">0:00 / 0:00</div>
                                        <div style="font-size: 10px; color: #a1a1aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; text-align: right;">
                                            <span style="opacity: 0.6;">NEXT:</span> 
                                            <span id="jb-audio-next-title" style="color: #a855f7; font-weight: 500;">Nothing queued</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    `;
                    wrapper.appendChild(overlayTrackPanel);
                } else {
                    overlayTrackPanel.style.display = 'flex';
                }
                
                this.updatePlayerDisplay();
                this.startAudioProgressTracking();
		  } else {
				// Restore original player size
				playerContainer.style.width = "100%";
				playerContainer.style.height = "100%";
				playerContainer.style.visibility = "visible";
				if (statusContainer) statusContainer.style.display = "block";
				
				// Restore from localStorage, or default to 168px if nothing saved
				const savedHeight = localStorage.getItem("jb_wrapper_height") || "168px";
				wrapper.style.height = savedHeight; 
				
				this.stopAudioProgressTracking();
				const overlayTrackPanel = document.getElementById('jb-audio-overlay-panel');
				if (overlayTrackPanel) overlayTrackPanel.style.display = 'none';
		  }
        }
    }
	// Add this new method to the StreamJukebox class
	bindResizePersistence() {
		const wrapper = document.getElementById('jukebox-video-wrapper');
		if (!wrapper) return;

		// This detects the manual resize and saves it immediately
		const observer = new ResizeObserver(entries => {
			for (let entry of entries) {
				const newHeight = entry.contentRect.height;
				// Only save if it's a valid, non-collapsed height
				if (newHeight > 50) {
					localStorage.setItem("jb_wrapper_height", `${newHeight}px`);
				}
			}
		});
		observer.observe(wrapper);
	}
    toggleVisualizer(state) {
        this.showVisualizer = state;
        const container = document.getElementById('overlay-wrapper');
        let avWidget = document.getElementById('jukebox-av-widget');

        if (!container) return;

        if (state) {
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
            if (avWidget) {
                avWidget.remove();
            }
        }
    }

    startVisualizerLoop() {
        if (this.avAnimationId) cancelAnimationFrame(this.avAnimationId);
        
        const canvas = document.getElementById('jukebox-av-widget');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        const render = () => {
            if (!this.showVisualizer) return;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            let isMoving = false;
            let currentPlaytime = 0;
            
            if (this.ytPlayer && typeof this.ytPlayer.getPlayerState === 'function') {
                isMoving = (this.ytPlayer.getPlayerState() === 1);
                // Extract real playback timestamps to link wave positions explicitly to video progress
                currentPlaytime = this.ytPlayer.getCurrentTime() || 0;
            }
            
            const motionModifier = this.trackVolumeLevel > 0 ? (this.trackVolumeLevel / 70) : 0;
            
            // Map the timeline parameter directly to the unique visual speed scalar assigned to this track
            const synchronizedTimeTicker = currentPlaytime * (this.visualSignature.speedScale * 40);

            const barWidth = 6;
            const barGap = 4;
            const totalBars = Math.ceil(canvas.width / (barWidth + barGap));
            
            for (let i = 0; i < totalBars; i++) {
                // Synthesize the deterministic song dimensions with the exact playhead position
                const baseWave1 = Math.sin(i * this.visualSignature.waveFreq1 + synchronizedTimeTicker);
                const baseWave2 = Math.cos(i * this.visualSignature.waveFreq2 - synchronizedTimeTicker * 0.7);
                let audioIntensity = Math.abs(baseWave1 * baseWave2);
                
                if (isMoving && this.trackVolumeLevel > 0) {
                    const jitterAmount = (this.trackVolumeLevel / 100); 
                    audioIntensity += (Math.sin(i + synchronizedTimeTicker * 2) * jitterAmount);
                    audioIntensity = Math.max(0.1, Math.min(audioIntensity, 1.2));
                } else {
                    audioIntensity *= 0.15;
                }
                
                const barHeight = audioIntensity * (canvas.height - 10) + 2;
                const xPos = i * (barWidth + barGap);
                const yPos = canvas.height - barHeight;
                
                // Track Hue mapping shifts baseline colors entirely dependent on the video ID signature
                const hue = (this.visualSignature.baseHue + (i * 0.4)) % 360; 
                ctx.fillStyle = `hsla(${hue}, 85%, 65%, ${isMoving ? '0.75' : '0.35'})`;
                
                ctx.fillRect(xPos, yPos, barWidth, barHeight);
            }
            
            this.avAnimationId = requestAnimationFrame(render);
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
                this.ytPlayer.loadVideoById(item.id); 
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
        if (!state && this.ytPlayer) { 
            this.ytPlayer.stopVideo(); 
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
        } else {
            if (botSay) botSay(`⏭️ @${user} voted to skip. Progress: ${this.currentTrackSkipVotes.size}/${this.VOTE_REQUIREMENT}`);
        }
    }

    async handleAddFallback(user, message, botSay) {
        const lookup = await this.fetchTrack(message);
        if (lookup) {
            this.saveFallbackItem(lookup, user);
            botSay(`💾 Added "${lookup.title}" to fallback.`);
            this.renderFallbackList();
        } else {
            botSay(`❌ Could not find fallback song: "${message}"`);
        }
    }

    skipCurrentSong(botSay) {
        if (this.ytPlayer && this.isEnabled) { 
            this.ytPlayer.stopVideo(); 
            if (botSay) botSay("⏭️ Skipping song...");
            this.playNextSong(botSay); 
        }
    }

    async playNextSong(botSay) {
        if (!this.isEnabled || !this.ytPlayerReady) return;
        
        this.currentTrackVotes.clear();
        this.currentTrackSkipVotes.clear(); 
        this.currentTrackData = null;
        this.stopAudioProgressTracking();

        if (this.queue.length > 0) {
            this.isPlayingSong = true;
            const next = this.queue.shift();
            
            this.renderQueueList(); 
            
            let fetchedTrack = null;
            if (next.isSearch) {
                this.updatePlayerDisplay("Searching...");
                fetchedTrack = await this.fetchTrack(next.id);
            } else {
                fetchedTrack = { id: next.id, title: next.title };
            }
            
            if (fetchedTrack) {
                this.currentTrackData = fetchedTrack;
                this.updatePlayerDisplay(); 
                this.ytPlayer.loadVideoById(this.currentTrackData.id);
            } else {
                this.playNextSong(botSay);
            }
        } else if (this.fallbackPlaylist.length > 0) {
            this.isPlayingSong = true;
            this.currentTrackData = this.fallbackPlaylist[Math.floor(Math.random() * this.fallbackPlaylist.length)];
            this.updatePlayerDisplay();
            this.ytPlayer.loadVideoById(this.currentTrackData.id);
        } else {
            this.isPlayingSong = false;
            this.updatePlayerDisplay("No Track Loaded");
            if (botSay) botSay("📭 Jukebox queue empty.");
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
        const instances = ['https://invidious.flokinet.to', 'https://yewtu.be'];
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
        const match = url.match(/^.*(youtu.be\/|v\/|watch\?v=)([^#\&\?]*).*/);
        return (match && match[2].length === 11) ? match[2] : null;
    }
}