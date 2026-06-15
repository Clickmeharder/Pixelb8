import { BaseWidgetModule } from './BaseWidgetModule.js';

export class StreamJukeboxModule extends BaseWidgetModule {
    constructor() {
        // Initializes state under local storage namespace allocations
        super("stream_jukebox");
    }

    // ========================================================================
    // ⚙️ INITIALIZATION & RECONCILIATION LAYERS
    // ========================================================================
    loadData() {
        super.loadData();

        // Core runtime engine queues and state variables
        this.queue = [];
        this.fallbackPlaylist = JSON.parse(localStorage.getItem("jukeboxFallbackPlaylist")) || [];
        this.ytPlayer = null;
        this.ytPlayerReady = false;
        this.currentTrackData = null;
        this.currentTrackVotes = new Set();
        this.currentTrackSkipVotes = new Set();
        this.progressInterval = null; 
        this.captureTimer = null;     
        this.trackVolumeLevel = 0;    
        
        this.visualSignature = {
            baseHue: 270,
            waveFreq1: 0.15,
            waveFreq2: 0.05,
            speedScale: 0.08
        };
        
        this.VOTE_REQUIREMENT = parseInt(localStorage.getItem("jbVoteReq")) || 2;
        this.isPlayingSong = false;
        this.streamerName = "jaedraze";
        this.acceptRequests = localStorage.getItem("jbAcceptRequests") !== "false"; 
        
        this.isAudioOnly = this.state.isAudioOnly ?? false;
        this.showVisualizer = this.state.showVisualizer ?? false;

        this.initYouTubeAPI();
    }

    // ========================================================================
    // 🪟 DECLARATIVE TEMPLATE ENGINE (Exact Original HTML Layout Restoration)
    // ========================================================================
    static get controlsTemplate() {
        return `
            <div class="collapsible-header" onclick="this.parentElement.classList.toggle('collapsed')">
                <span>🎵 Song Request Jukebox</span>
                <span class="collapse-icon">▼</span>
            </div>
            <div class="collapsible-content">

                <details style="margin-bottom: 15px; border: 2px solid #27272a; border-radius: 6px; background: #18181b;">
                    <summary style="padding: 10px; cursor: pointer; font-weight: bold; font-size: 13px; color: #fff; outline: none;">
                        ⚙️ Jukebox Configuration
                    </summary>
                    <div style="padding: 10px; border-top: 1px solid #27272a;">
                        

                        <div class="settings-toggle-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <span class="settings-toggle-label" style="font-size: 12px;">Accept Requests</span>
                            <div class="settings-toggle-controls">
                                <span id="req-status-badge" class="toggle-status-badge">ON</span>
                                <input type="checkbox" id="stg-toggle-requests-checkbox" checked>
                            </div>
                        </div>

                        <div class="settings-toggle-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <span class="settings-toggle-label" style="font-size: 12px;">Audio Only</span>
                            <div class="settings-toggle-controls">
                                <span id="audio-status-badge" class="toggle-status-badge">OFF</span>
                                <input type="checkbox" id="stg-toggle-audio-only-checkbox">
                            </div>
                        </div>

                        <div class="settings-toggle-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
                            <span class="settings-toggle-label" style="font-size: 12px;">Fake Visualizer</span>
                            <div class="settings-toggle-controls">
                                <span id="av-status-badge" class="toggle-status-badge">OFF</span>
                                <input type="checkbox" id="stg-toggle-visualizer-checkbox">
                            </div>
                        </div>

                        <div style="background: #141414; padding: 10px; border-radius: 4px; border: 1px solid #27272a;">
                            <label style="display: block; font-size: 10px; color: #a1a1aa; text-transform: uppercase; margin-bottom: 4px;">Vote Requirements</label>
                            <input type="number" id="jb-vote-req-input" class="p8-input" value="2" style="width: 100%; background: #000; border: 1px solid #3f3f46; color: #fff; padding: 4px; box-sizing: border-box;">
                        </div>

                    </div>
                </details>

                <div style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 10px;">
                    <input type="text" id="jb-search-input" class="p8-input" placeholder="Search or YouTube URL..." style="width: 100%; box-sizing: border-box;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
                        <button id="jb-add-queue-btn" class="p8-btn">Queue</button>
                        <button id="jb-add-fallback-btn" class="p8-btn alt-btn">Playlist</button>
                    </div>
                </div>

                <div id="jb-controls-nowplaying-section" style="background: #18181b; padding: 10px; border-radius: 6px; margin: 10px 0; border: 1px solid #3f3f46;">
                    <div style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; margin-bottom: 5px;">Playing Now</div>
                    <div id="jb-current-title" class="jb-current-title" style="font-size: 13px; font-weight: bold; margin-bottom: 8px; color: #fff; word-break: break-all;">No Track Loaded</div>
                    
                    <div style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; margin-bottom: 2px; border-top: 1px solid #27272a; padding-top: 5px;">Up Next</div>
                    <div id="jb-next-title" class="jb-next-title" style="font-size: 11px; color: #71717a; font-style: italic;">Nothing queued</div>
                    
                    <div style="display: flex; gap: 5px; margin-top: 8px; align-items: center;">
                        <div class="jb-volume-control" style="display: flex; align-items: center; gap: 8px; flex: 1;">
                            <span style="font-size: 12px; color: #a1a1aa;">VOL</span>
                            <input type="range" id="jb-volume-slider" min="0" max="100" value="50" style="flex: 1; cursor: pointer; accent-color: var(--accent, #a855f7);">
                        </div>
                        <button id="jb-skip-btn" class="p8-btn p8-btn-warning" style="padding: 6px;">⏭</button>
                        <button id="jb-current-heart" class="p8-btn" style="padding: 6px 12px; background: #e11d48; border: none; color: white; cursor: pointer; border-radius: 4px;">❤</button>
                    </div>
                </div>

                <div style="font-size: 11px; color: #71717a; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px; margin-top: 10px;">📋 Active Queue</div>
                <div id="jb-queue-list" style="display: flex; flex-direction: column; gap: 4px; max-height: 150px; overflow-y: auto; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; border: 2px inset #3f3f46; margin-bottom: 10px;"></div>
                
                <div style="display: grid; grid-template-columns: 1fr; gap: 8px; margin-top: 10px;">
                    <button id="jb-clear-btn" class="p8-btn" style="margin: auto; padding: 6px; background: #991b1b; border: none; color: white; border-radius: 4px; cursor: pointer; width: 100%;">CLEAR QUEUE</button>
                </div>
                <br>
                <div style="font-size: 11px; color: #71717a; text-transform: uppercase; margin-bottom: 5px; letter-spacing: 0.5px;">📋 Fallback Playlist</div>
                <div id="jb-fallback-list" style="display: flex; flex-direction: column; gap: 4px; height: 64px; max-height: 150px; overflow-y: auto; resize: vertical; background: rgba(0,0,0,0.2); padding: 6px; border-radius: 4px; border: 2px inset #3f3f46;"></div>
            </div>
        `;
    }

    // ========================================================================
    // 🪟 VIEWPORT INJECTION LAYER OVERRIDES
    // ========================================================================
    injectUI() {
        // 1. Mount Overlay Viewport Container
        const overlayWrapper = document.getElementById("overlay-wrapper");
        if (overlayWrapper && !document.getElementById(this.overlayId)) {
            const overlayEl = document.createElement("div");
            overlayEl.id = this.overlayId;
            overlayEl.className = "p8-widget"; 
            overlayEl.style.cssText = `position: absolute; width: 300px; background: rgba(15,15,15,0.95); border: 1px solid var(--accent, #a855f7); border-radius: 4px; padding: 10px; color: #fff; font-family: monospace; z-index: 100;`;
            
            const savedLayout = localStorage.getItem(`p8_pos_${this.overlayId}`);
            if (savedLayout) {
                try {
                    const coords = JSON.parse(savedLayout);
                    overlayEl.style.left = coords.left;
                    overlayEl.style.top = coords.top;
                } catch (err) { console.error(err); }
            } else {
                overlayEl.style.left = "400px";
                overlayEl.style.top = "150px";
            }
            
            overlayEl.innerHTML = `
                <div id="jukebox-video-wrapper" style="width: 100%; height: 168px; background: #000; border-radius: 2px; overflow: hidden; position: relative;">
                    <div id="player" style="width: 100%; height: 100%;"></div>
                </div>
                <div id="jb-status-container" style="margin-top: 8px; font-size: 12px; background: rgba(0,0,0,0.4); padding: 6px; border-radius: 2px;">
                    <div class="jb-current-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: bold; color: var(--accent, #a855f7);">No Track Loaded</div>
                    <div id="jb-status-text" style="font-size: 10px; color: #a1a1aa; margin-top: 2px;">Status: Standby</div>
                </div>
            `;
            
            overlayWrapper.appendChild(overlayEl);
        }

        // 2. Mount Control Panel Section Menu Matrix
        const controlWrapper = document.getElementById("widget-control-wrapper") || document.getElementById("widgets-manager");
        if (controlWrapper && !document.getElementById(this.controlId)) {
            const panelSection = document.createElement("div");
            panelSection.id = this.controlId;
            panelSection.className = "collapsible-section collapsed";
            panelSection.innerHTML = this.constructor.controlsTemplate;
            controlWrapper.appendChild(panelSection);
        }
    }

    // ========================================================================
    // 🔌 YOUTUBE IFRAME API MANAGEMENT
    // ========================================================================
    initYouTubeAPI() {
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
                        const savedHeight = localStorage.getItem("jb_wrapper_height");
                        const wrapper = document.getElementById('jukebox-video-wrapper');
                        if (wrapper && savedHeight && !this.isAudioOnly) {
                            wrapper.style.height = savedHeight;
                        }
                        
                        this.bindResizePersistence(); 
                        const savedVol = localStorage.getItem("jbVolume") || 50;
                        this.ytPlayer.setVolume(parseInt(savedVol));
                        
                        this.syncUIPanelElements();
                        this.renderFallbackList();
                        this.renderQueueList();
                        this.playNextSong(() => {}); 
                    },
                    'onStateChange': (e) => {
                        const statusText = document.getElementById('jb-status-text');
                        if (e.data === YT.PlayerState.ENDED) {
                            if (statusText) statusText.textContent = "Status: Track Ended";
                            this.playNextSong(() => {});
                        }
                        if (e.data === YT.PlayerState.PLAYING) {
                            if (statusText) statusText.textContent = "Status: Live Playback";
                            const videoData = this.ytPlayer.getVideoData();
                            if (videoData?.title) {
                                this.currentTrackData = { 
                                    id: videoData.video_id || this.currentTrackData?.id, 
                                    title: videoData.title 
                                };
                            }
                            this.generateTrackVisualSignature();
                            this.updatePlayerDisplay();
                            this.startAudioProgressTracking();
                        } else if (e.data === YT.PlayerState.PAUSED) {
                            if (statusText) statusText.textContent = "Status: Paused";
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

    // ========================================================================
    // 🎛️ EVENT HANDLERS & INPUT BINDINGS
    // ========================================================================
    bindEventListeners() {
        const panel = document.getElementById(this.controlId);
        if (!panel) return;

        // Configuration Toggles & Status Badging Routing Pass
        panel.addEventListener("change", (e) => {
            if (e.target.id === "stg-toggle-requests-checkbox") {
                this.acceptRequests = e.target.checked;
                localStorage.setItem("jbAcceptRequests", e.target.checked);
                const badge = panel.querySelector('#req-status-badge');
                if (badge) badge.textContent = e.target.checked ? "ON" : "OFF";
            }
            if (e.target.id === "stg-toggle-audio-only-checkbox") {
                this.state.isAudioOnly = e.target.checked;
                this.toggleAudioOnly(e.target.checked);
                this.saveData();
            }
            if (e.target.id === "stg-toggle-visualizer-checkbox") {
                this.state.showVisualizer = e.target.checked;
                this.toggleVisualizer(e.target.checked);
                this.saveData();
            }
        });

        // Click Controls Dispatch Mapping
        panel.addEventListener("click", (e) => {
            if (e.target.id === "jb-skip-btn") {
                this.skipCurrentSong(() => {});
            }
            if (e.target.id === "jb-current-heart") {
                this.handleLikeSong('DashboardUI', () => {});
            }
            if (e.target.id === "jb-clear-btn") {
                this.queue = [];
                this.renderQueueList();
                this.updatePlayerDisplay();
            }
            if (e.target.id === "jb-add-queue-btn" || e.target.id === "jb-add-fallback-btn") {
                const input = panel.querySelector('#jb-search-input');
                if (!input || !input.value.trim()) return;
                
                if (e.target.id === "jb-add-queue-btn") {
                    this.handleSongRequest('StreamDashboard', input.value.trim(), () => {});
                } else {
                    const id = this.extractYouTubeId(input.value.trim());
                    this.saveFallbackItem({ id: id || "Custom", title: input.value.trim() }, 'Streamer');
                }
                input.value = '';
            }
        });

        // Vote Requirement Value Input Observer
        const voteInput = panel.querySelector('#jb-vote-req-input');
        if (voteInput) {
            voteInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10) || 2;
                this.VOTE_REQUIREMENT = val;
                localStorage.setItem("jbVoteReq", val);
            });
        }

        // Slider Value Audio Handlers
        const volSlider = panel.querySelector('#jb-volume-slider');
        if (volSlider) {
            volSlider.oninput = (e) => {
                const vol = parseInt(e.target.value, 10);
                if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
                    this.ytPlayer.setVolume(vol);
                    localStorage.setItem("jbVolume", vol);
                }
            };
        }
    }

    syncUIPanelElements() {
        const panel = document.getElementById(this.controlId);
        if (!panel) return;

        const reqToggle = panel.querySelector('#stg-toggle-requests-checkbox');
        if (reqToggle) {
            reqToggle.checked = this.acceptRequests;
            const badge = panel.querySelector('#req-status-badge');
            if (badge) badge.textContent = this.acceptRequests ? "ON" : "OFF";
        }

        const audioToggle = panel.querySelector('#stg-toggle-audio-only-checkbox');
        if (audioToggle) audioToggle.checked = this.isAudioOnly;

        const avToggle = panel.querySelector('#stg-toggle-visualizer-checkbox');
        if (avToggle) avToggle.checked = this.showVisualizer;

        const volSlider = panel.querySelector('#jb-volume-slider');
        if (volSlider && this.ytPlayer && typeof this.ytPlayer.getVolume === 'function') {
            volSlider.value = this.ytPlayer.getVolume();
        }

        this.toggleAudioOnly(this.isAudioOnly);
        this.toggleVisualizer(this.showVisualizer);
    }

    // ========================================================================
    // 🎨 DRIVEN CANVAS REDRAW VISUALIZER WAVES
    // ========================================================================
    drawEnvironment(tick) {
        if (!this.showVisualizer || !this.ctx || !this.canvas) return;
        
        const ctx = this.ctx;
        const canvas = this.canvas;
        
        let isMoving = false;
        let currentPlaytime = 0;
        
        if (this.ytPlayer && typeof this.ytPlayer.getPlayerState === 'function') {
            isMoving = (this.ytPlayer.getPlayerState() === 1);
            currentPlaytime = this.ytPlayer.getCurrentTime() || 0;
        }
        
        const synchronizedTimeTicker = currentPlaytime * (this.visualSignature.speedScale * 40);
        const barWidth = 6;
        const barGap = 4;
        const totalBars = Math.ceil(canvas.width / (barWidth + barGap));
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        for (let i = 0; i < totalBars; i++) {
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
            
            const hue = (this.visualSignature.baseHue + (i * 0.4)) % 360; 
            ctx.fillStyle = `hsla(${hue}, 85%, 65%, ${isMoving ? '0.75' : '0.35'})`;
            ctx.fillRect(xPos, yPos, barWidth, barHeight);
        }
    }

    // ========================================================================
    // 🎮 CHAT COMMAND ROUTER
    // ========================================================================
    getCommands(sendNotice) {
        const jukeboxExecution = (user, message, flags) => {
            const parts = message.trim().toLowerCase().split(/\s+/);
            const subCommand = parts[0];
            const isAdmin = flags.broadcaster || flags.mod;

            if (!subCommand) {
                sendNotice(`🎵 [Jukebox]: Available: !jb [sr | skip | like | status | help | queue]`);
                return;
            }

            switch (subCommand) {
                case 'help':
                    sendNotice(`🎵 [Jukebox]: !sr [link/query] | !jb like | !jb skip | !jb status | !jb queue`);
                    break;
                case 'sr':
                case 'request':
                    this.handleSongRequest(user, parts.slice(1).join(' '), sendNotice);
                    break;
                case 'queue':
                    sendNotice(`🎵 [Jukebox]: Queue size: ${this.queue.length}.`);
                    break;
                case 'skip':
                    if (isAdmin) this.skipCurrentSong(sendNotice);
                    else this.handleVoteSkip(user, sendNotice);
                    break;
                case 'like':
                case 'love':
                    this.handleLikeSong(user, sendNotice);
                    break;
                case 'clear':
                    if (isAdmin) { 
                        this.queue = []; 
                        this.renderQueueList();
                        this.skipCurrentSong(sendNotice); 
                        sendNotice(`🧹 Queue cleared.`);
                    }
                    break;
                case 'status':
                    sendNotice(`🎵 Playing: ${this.currentTrackData?.title || 'Nothing'}`);
                    break;
            }
        };

        return [
            { name: 'jb', adminOnly: false, execute: jukeboxExecution },
            { name: 'jukebox', adminOnly: false, execute: jukeboxExecution },
            { name: 'skip', adminOnly: false, execute: (user, message, flags) => jukeboxExecution(user, 'skip', flags) },
            { name: 'sr', adminOnly: false, execute: (user, message, flags) => this.handleSongRequest(user, message, sendNotice) },
            { name: 'request', adminOnly: false, execute: (user, message, flags) => this.handleSongRequest(user, message, sendNotice) }
        ];
    }

    // ========================================================================
    // 🧱 MEDIA TRACK MANAGEMENT CORE LOGIC
    // ========================================================================
    updatePlayerDisplay(customTitle = null) {
        const titleElements = document.querySelectorAll('.jb-current-title');
        const displayTitle = customTitle || (this.currentTrackData ? this.currentTrackData.title : "No Track Loaded");
        
        titleElements.forEach(el => { el.textContent = displayTitle; });

        let upNextString = this.queue.length > 0 ? this.queue[0].title : (this.fallbackPlaylist.length > 0 ? "Random Playlist Selection" : "Nothing queued");
        
        const nextTitleEl = document.getElementById('jb-next-title');
        if (nextTitleEl) nextTitleEl.textContent = upNextString;

        const audioNextEl = document.getElementById('jb-audio-next-title');
        if (audioNextEl) audioNextEl.textContent = upNextString;
    }

    generateTrackVisualSignature() {
        const trackId = this.currentTrackData?.id || "default";
        let hash = 0;
        for (let i = 0; i < trackId.length; i++) {
            hash = trackId.charCodeAt(i) + ((hash << 5) - hash);
        }
        hash = Math.abs(hash);

        this.visualSignature = {
            baseHue: hash % 360,                               
            waveFreq1: 0.08 + ((hash % 100) / 1000),           
            waveFreq2: 0.03 + (((hash >> 4) % 100) / 1000),    
            speedScale: 0.05 + (((hash >> 8) % 100) / 1500)    
        };
    }

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
                bar.style.width = `${(elapsed / total) * 100}%`;
            }

            if (stamp) {
                const formatTime = (s) => `${Math.floor(s / 60)}:${Math.floor(s % 60).toString().padStart(2, '0')}`;
                stamp.textContent = `${formatTime(elapsed)} / ${formatTime(total)}`;
            }
        }, 250);
    }

    stopAudioProgressTracking() {
        if (this.progressInterval) { clearInterval(this.progressInterval); this.progressInterval = null; }
        this.stopAudioFrequencyCaptureLoop();
    }

    startAudioFrequencyCaptureLoop() {
        if (this.captureTimer) clearInterval(this.captureTimer);
        this.captureTimer = setInterval(() => {
            if (this.ytPlayer && typeof this.ytPlayer.getPlayerState === 'function') {
                this.trackVolumeLevel = this.ytPlayer.getPlayerState() === 1 ? Math.random() * 45 + 25 : 0;
            }
        }, 40);
    }

    stopAudioFrequencyCaptureLoop() {
        if (this.captureTimer) { clearInterval(this.captureTimer); this.captureTimer = null; }
        this.trackVolumeLevel = 0;
    }

    toggleAudioOnly(state) {
        this.isAudioOnly = state;
        const playerContainer = document.getElementById('player');
        const wrapper = document.getElementById('jukebox-video-wrapper');
        const statusContainer = document.getElementById('jb-status-container');
        const panel = document.getElementById(this.controlId);
        
        if (panel) {
            const badge = panel.querySelector('#audio-status-badge');
            if (badge) {
                badge.textContent = state ? "ON" : "OFF";
                badge.style.background = state ? "#22c55e" : "#ef4444";
            }
        }
        
        if (!playerContainer || !wrapper) return;

        if (state) {
            playerContainer.style.width = "0px"; playerContainer.style.height = "0px"; playerContainer.style.visibility = "hidden";
            if (statusContainer) statusContainer.style.display = "none";
            wrapper.style.height = "72px";
            
            let overlayTrackPanel = document.getElementById('jb-audio-overlay-panel');
            if (!overlayTrackPanel) {
                overlayTrackPanel = document.createElement('div');
                overlayTrackPanel.id = 'jb-audio-overlay-panel';
                overlayTrackPanel.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #18181b 0%, #27272a 100%); color: #ffffff; display: flex; align-items: center; padding: 0 20px; box-sizing: border-box; font-family: monospace; z-index: 10; border-radius: 2px; border: 1px solid rgba(255,255,255,0.05);`;
                overlayTrackPanel.innerHTML = `
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0; overflow: hidden;">
                        <div class="jb-current-title" style="font-size: 13px; font-weight: bold; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">No Track Loaded</div>
                        <div style="width: 100%; background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; overflow: hidden; margin: 4px 0;">
                            <div id="jb-audio-progress-bar" style="width: 0%; background: #a855f7; height: 100%;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 9px; color: #a1a1aa;">
                            <div id="jb-audio-time-stamp">0:00 / 0:00</div>
                            <div style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 60%;">NEXT: <span id="jb-audio-next-title" style="color: #a855f7;">Nothing queued</span></div>
                        </div>
                    </div>`;
                wrapper.appendChild(overlayTrackPanel);
            } else { overlayTrackPanel.style.display = 'flex'; }
            this.updatePlayerDisplay();
            this.startAudioProgressTracking();
        } else {
            playerContainer.style.width = "100%"; playerContainer.style.height = "100%"; playerContainer.style.visibility = "visible";
            if (statusContainer) statusContainer.style.display = "block";
            wrapper.style.height = localStorage.getItem("jb_wrapper_height") || "168px";
            this.stopAudioProgressTracking();
            const overlayTrackPanel = document.getElementById('jb-audio-overlay-panel');
            if (overlayTrackPanel) overlayTrackPanel.style.display = 'none';
        }
    }

    bindResizePersistence() {
        const wrapper = document.getElementById('jukebox-video-wrapper');
        if (!wrapper) return;
        const observer = new ResizeObserver(entries => {
            for (let entry of entries) {
                const newHeight = entry.contentRect.height;
                if (newHeight > 50 && !this.isAudioOnly) {
                    localStorage.setItem("jb_wrapper_height", `${newHeight}px`);
                }
            }
        });
        observer.observe(wrapper);
    }

    toggleVisualizer(state) {
        this.showVisualizer = state;
        const panel = document.getElementById(this.controlId);
        if (panel) {
            const badge = panel.querySelector('#av-status-badge');
            if (badge) {
                badge.textContent = state ? "ON" : "OFF";
                badge.style.background = state ? "#22c55e" : "#ef4444";
            }
        }

        let avWidget = document.getElementById(`${this.baseId}-canvas`);
        const wrapper = document.getElementById('jukebox-video-wrapper');
        if (!wrapper) return;

        if (state) {
            if (!avWidget) {
                avWidget = document.createElement('canvas');
                avWidget.id = `${this.baseId}-canvas`;
                avWidget.style.cssText = "position: absolute; bottom: 0; left: 0; width: 100%; height: 40px; pointer-events: none; z-index: 9; display: block;";
                wrapper.appendChild(avWidget);
                
                this.canvas = avWidget;
                this.ctx = avWidget.getContext('2d');
                
                const resizeCanvas = () => {
                    avWidget.width = wrapper.clientWidth || 300;
                    avWidget.height = 40;
                };
                window.addEventListener('resize', resizeCanvas);
                resizeCanvas();
            }
        } else {
            if (avWidget) avWidget.remove();
            this.canvas = null;
            this.ctx = null;
        }
    }

    async handleSongRequest(user, message, botSay) {
        if (!message) return;
        if (!this.acceptRequests) { botSay(`🚫 Song requests are disabled.`); return; }

        const id = this.extractYouTubeId(message);
        this.queue.push({ user, title: id ? "YouTube Video Link" : message, id: id || message, isSearch: !id });
        this.renderQueueList();
        this.updatePlayerDisplay();
        
        if (!this.isPlayingSong) this.playNextSong(botSay);
    }

    async playNextSong(botSay) {
        if (!this.ytPlayerReady) return;
        this.currentTrackVotes.clear();
        this.currentTrackSkipVotes.clear();
        this.stopAudioProgressTracking();

        if (this.queue.length > 0) {
            this.isPlayingSong = true;
            const next = this.queue.shift();
            this.renderQueueList();
            
            let fetchedTrack = next.isSearch ? await this.fetchTrack(next.id) : { id: next.id, title: next.title };
            if (fetchedTrack) {
                this.currentTrackData = fetchedTrack;
                this.updatePlayerDisplay();
                this.ytPlayer.loadVideoById(this.currentTrackData.id);
            } else { this.playNextSong(botSay); }
        } else if (this.fallbackPlaylist.length > 0) {
            this.isPlayingSong = true;
            this.currentTrackData = this.fallbackPlaylist[Math.floor(Math.random() * this.fallbackPlaylist.length)];
            this.updatePlayerDisplay();
            this.ytPlayer.loadVideoById(this.currentTrackData.id);
        } else {
            this.isPlayingSong = false;
            this.updatePlayerDisplay("No Track Loaded");
        }
    }

    async handleLikeSong(user, botSay) {
        if (!this.currentTrackData) return;
        const voter = user.toLowerCase();
        if (this.currentTrackVotes.has(voter)) return;
        
        this.currentTrackVotes.add(voter);
        if (this.currentTrackVotes.size >= this.VOTE_REQUIREMENT) {
            this.saveFallbackItem(this.currentTrackData, "Community");
        }
    }

    async handleVoteSkip(user, botSay) {
        if (!this.currentTrackData) return;
        const voter = user.toLowerCase();
        if (this.currentTrackSkipVotes.has(voter)) return;

        this.currentTrackSkipVotes.add(voter);
        if (this.currentTrackSkipVotes.size >= this.VOTE_REQUIREMENT) {
            this.skipCurrentSong(botSay);
        }
    }

    skipCurrentSong(botSay) {
        if (this.ytPlayer) { this.ytPlayer.stopVideo(); this.playNextSong(botSay); }
    }

    saveFallbackItem(item, username = 'System') {
        if (!this.fallbackPlaylist.some(e => e.id === item.id)) {
            this.fallbackPlaylist.push({ ...item, user: username });
            localStorage.setItem("jukeboxFallbackPlaylist", JSON.stringify(this.fallbackPlaylist));
            this.renderFallbackList();
        }
    }

    renderQueueList() {
        const list = document.getElementById('jb-queue-list');
        if (!list) return; list.innerHTML = '';
        this.queue.forEach((item, idx) => {
            const el = document.createElement('div');
            el.style.cssText = "font-size:10px; color:#a1a1aa; border-bottom:1px solid #222; padding:4px; display:flex; justify-content:space-between; align-items:center;";
            el.innerHTML = `<span>${idx+1}. ${item.title.substring(0,25)}</span><span style="color:#991b1b; cursor:pointer; font-weight:bold; padding:0 4px;" class="remove-queue-item">✕</span>`;
            el.querySelector('.remove-queue-item').onclick = () => {
                this.queue.splice(idx, 1);
                this.renderQueueList();
                this.updatePlayerDisplay();
            };
            list.appendChild(el);
        });
    }

    renderFallbackList() {
        const list = document.getElementById('jb-fallback-list');
        if (!list) return; list.innerHTML = '';
        this.fallbackPlaylist.forEach((item, idx) => {
            const el = document.createElement('div');
            el.style.cssText = "font-size:10px; color:#e4e4e7; padding:4px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #222;";
            el.innerHTML = `<span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; max-width:85%;">• ${item.title}</span><span style="color:#991b1b; cursor:pointer; font-weight:bold;" class="remove-fallback-item">✕</span>`;
            el.querySelector('.remove-fallback-item').onclick = () => {
                this.fallbackPlaylist.splice(idx, 1);
                localStorage.setItem("jukeboxFallbackPlaylist", JSON.stringify(this.fallbackPlaylist));
                this.renderFallbackList();
            };
            list.appendChild(el);
        });
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

    destroy() {
        this.stopAudioProgressTracking();
        super.destroy();
    }
}