import { BaseWidgetModule } from './BaseWidgetModule.js';
// ============================================================================
// 🎨 JUKEBOX VIEW TEMPLATES (Collapsible UI Object Map)
// ============================================================================
//region Jukebox Templates
const JUKEBOX_HTMLTEMPLATES = {
    config: `
		<div style="background: #141414; padding: 8px; border-radius: 4px; border: 1px solid #27272a; margin-bottom: 4px;">
			<div class="settings-toggle-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
				<span class="settings-toggle-label" style="font-size: 14px; color: #fff;">Accept Requests</span>
				<div class="settings-toggle-controls">
					<span id="req-status-badge" class="toggle-status-badge" style="font-size: 11px; font-weight: bold; color: var(--accent, #a855f7); margin-right: 6px;">ON</span>
					<input type="checkbox" id="stg-toggle-requests-checkbox" checked style="cursor: pointer;">
				</div>
			</div>

			<div class="settings-toggle-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
				<span class="settings-toggle-label" style="font-size: 14px; color: #fff;">Audio Only</span>
				<div class="settings-toggle-controls">
					<input type="checkbox" id="stg-toggle-audio-only-checkbox" style="cursor: pointer;">
				</div>
			</div>

			<div class="settings-toggle-row" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
				<span class="settings-toggle-label" style="font-size: 14px; color: #fff;">Visualizer Canvas Overlay</span>
				<div class="settings-toggle-controls">
					<input type="checkbox" id="stg-toggle-visualizer-checkbox" style="cursor: pointer;">
				</div>
			</div>

			<div id="jb-vote-req-wrapper" style="display: flex; justify-content: space-between; align-items: center;">
				<label id="jb-vote-req-label" style="font-size: 12px; color: #a1a1aa;">Skip Vote Requirement</label>
				<input type="number" id="jb-vote-req-input" class="p8-input" value="2" style="width: 50px; text-align: center; background: #18181b; border: 1px solid #27272a; color: #fff; border-radius: 4px; padding: 2px;">
			</div>
		</div>
    `,

    nowPlaying: `
		<div id="jb-controls-nowplaying-section" style="background: #18181b; padding: 10px; border-radius: 6px; margin: 4px 0; border: 1px solid #27272a;">
			<div id="jb-current-Label" style="font-size: 10px; color: #a1a1aa; text-transform: uppercase;">Playing Now</div>
			<div id="jb-current-title" class="jb-current-title" style="font-weight: bold; color: #fff; margin-bottom: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">No Track Loaded</div>
			
			<div id="jb-upnext-Label" style="font-size: 10px; color: #a1a1aa; text-transform: uppercase;">Up Next</div>
			<div id="jb-upnext-title" class="jb-next-title" style="color: #71717a; margin-bottom: 10px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">waiting...</div>
			
			<div id="jb-current-controlbar" style="display: flex; align-items: center; gap: 8px;">
				<div class="jb-volume-control" style="display: flex; align-items: center; gap: 8px; flex: 1;">
					<span style="font-size: 11px; color: #a1a1aa; font-family: monospace;">VOL</span>
					<input type="range" id="jb-volume-slider" min="0" max="100" value="50" style="flex: 1; cursor: pointer; accent-color: var(--accent, #a855f7);">
				</div>
				<button id="jb-skip-btn" class="p8-btn" style="cursor: pointer; background: #27272a; border: 1px solid #3f3f46; color: #fff; border-radius: 4px; padding: 2px 8px;">⏭</button>
				<button id="jb-current-heart" class="p8-btn" style="cursor: pointer; background: #27272a; border: 1px solid #3f3f46; color: #fff; border-radius: 4px; padding: 2px 8px;">❤</button>
			</div>
		</div>
    `,

    lists: `
		<div style="display: flex; flex-direction: column; gap: 5px; margin-top: 4px; margin-bottom: 10px;">
			<input type="text" id="jb-search-input" class="p8-input" placeholder="Search or YouTube URL..." style="width: 100%; box-sizing: border-box; background: #141414; border: 1px solid #27272a; color: #fff; padding: 6px; border-radius: 4px; font-family: monospace; font-size: 12px;">
			<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">
				<button id="jb-add-queue-btn" class="p8-btn" style="cursor: pointer; background: #1e3a8a; border: 1px solid #3b82f6; color: #fff; padding: 4px; border-radius: 4px; font-size: 12px; font-weight: bold;">Queue</button>
				<button id="jb-add-fallback-btn" class="p8-btn alt-btn" style="cursor: pointer; background: #27272a; border: 1px solid #3f3f46; color: #fff; padding: 4px; border-radius: 4px; font-size: 12px;">Playlist</button>
			</div>
		</div>

		<div id="jb-queue-list-label" style="font-size: 11px; font-weight: bold; color: #a1a1aa; text-transform: uppercase; margin-bottom: 4px;">📋 Active Queue</div>
		<div id="jb-queue-list" style="max-height: 120px; overflow-y: auto; background: #141414; border-radius: 4px; padding: 4px; border: 1px solid #27272a;">
			<div id="jb-queue-list-controls">
				<button id="jb-clear-btn" class="p8-btn" style="cursor: pointer; background: #991b1b; border: 1px solid #ef4444; color: #fff; font-size: 10px; padding: 2px 6px; border-radius: 4px; font-weight: bold; width: 100%;">CLEAR QUEUE</button>
			</div>
		</div>
		
		<div id="jb-fallback-list-label" style="font-size: 11px; font-weight: bold; color: #a1a1aa; text-transform: uppercase; margin-top: 10px; margin-bottom: 4px;">📋 Fallback Playlist</div>
		<div id="jb-fallback-list" style="max-height: 120px; overflow-y: auto; background: #141414; border-radius: 4px; padding: 4px; border: 1px solid #27272a;"></div>
    `
};
// #endregion


export class StreamJukeboxModule extends BaseWidgetModule {
    constructor() {
        // Initializes state under local storage namespace allocations
        super("stream_jukebox");
		this.widgetMenuTitle = "🎵 Song Request Jukebox";
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
        
		// Balanced directly to point inside global module engine state schemas safely
        if (this.state.isAudioOnly === undefined) this.state.isAudioOnly = false;
        if (this.state.showVisualizer === undefined) this.state.showVisualizer = false;

        this.initYouTubeAPI();
    }

    // ========================================================================
    // 🪟 DECLARATIVE TEMPLATE ENGINE
    // ========================================================================
	getControlsMarkup() {
        // Return pure templates fragments. Parent wrapper stitches details and command matrices.
        return `
            ${JUKEBOX_HTMLTEMPLATES.config}
            ${JUKEBOX_HTMLTEMPLATES.nowPlaying}
            ${JUKEBOX_HTMLTEMPLATES.lists}
        `;
    }

    // ========================================================================
    // 🪟 VIEWPORT INJECTION LAYER OVERRIDES
    // ========================================================================

// ========================================================================
    // 🪟 VIEWPORT INJECTION LAYER OVERRIDES
    // ========================================================================
    injectViewportOverlay() {
        // Setup local overlay player viewports cleanly on its own thread channel
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
// ========================================================================
    // 🎛️ EVENT HANDLERS & INPUT BINDINGS
    // ========================================================================
bindEventListeners() {
        // Invoke base routing matrix listeners (Chat/CP checkboxes & manual click dispatches)
        if (typeof super.bindEventListeners === 'function') {
            super.bindEventListeners();
        }

        const panel = document.getElementById(this.controlId);
        if (!panel) return;

        // Unified notifications bubble fallback pipeline
        const fallbackNotice = (txt) => {
            if (typeof this.setWidgetBubble === 'function') this.setWidgetBubble(txt);
            if (typeof window.botSay === 'function') window.botSay(txt);
        };

        // Configuration Toggles & Badging Changes
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

        // Click Controls Routing Intersections
        panel.addEventListener("click", (e) => {
            if (e.target.id === "jb-skip-btn") {
                this.skipCurrentSong(fallbackNotice);
            }
            if (e.target.id === "jb-current-heart") {
                this.handleLikeSong('DashboardUI', fallbackNotice);
            }
            if (e.target.id === "jb-clear-btn") {
                this.queue = [];
                if (typeof this.renderQueueList === 'function') this.renderQueueList();
                if (typeof this.updatePlayerDisplay === 'function') this.updatePlayerDisplay();
                fallbackNotice(`🧹 Queue cleared from dashboard control matrix.`);
            }
            if (e.target.id === "jb-add-queue-btn" || e.target.id === "jb-add-fallback-btn") {
                const input = panel.querySelector('#jb-search-input');
                if (!input || !input.value.trim()) return;
                
                const queryStr = input.value.trim();
                if (e.target.id === "jb-add-queue-btn") {
                    this.handleSongRequest('StreamDashboard', queryStr, fallbackNotice);
                } else {
                    const id = typeof this.extractYouTubeId === 'function' ? this.extractYouTubeId(queryStr) : "Custom";
                    this.saveFallbackItem({ id: id || "Custom", title: queryStr }, 'Streamer');
                    fallbackNotice(`💾 Added to Fallback Playlist rotation.`);
                }
                input.value = '';
            }
        });

        // Skip Vote Requirement Modifications
        const voteInput = panel.querySelector('#jb-vote-req-input');
        if (voteInput) {
            voteInput.addEventListener('input', (e) => {
                const val = parseInt(e.target.value, 10) || 2;
                this.VOTE_REQUIREMENT = val;
                localStorage.setItem("jbVoteReq", val);
            });
        }

        // Live Dynamic Volume Sliders Matrix Operations
        const volSlider = panel.querySelector('#jb-volume-slider');
        if (volSlider) {
            volSlider.addEventListener('input', (e) => {
                const vol = parseInt(e.target.value, 10);
                this.trackVolumeLevel = vol;
                localStorage.setItem("jbVolume", vol);
                if (this.ytPlayer && typeof this.ytPlayer.setVolume === 'function') {
                    this.ytPlayer.setVolume(vol);
                }
            });
        }
    }
	syncUIPanelElements() {
        const panel = document.getElementById(this.controlId);
        if (!panel) return;

        // 1. Reconcile Request Acceptance Toggles
        const reqToggle = panel.querySelector('#stg-toggle-requests-checkbox');
        if (reqToggle) {
            reqToggle.checked = this.acceptRequests;
            const badge = panel.querySelector('#req-status-badge');
            if (badge) badge.textContent = this.acceptRequests ? "ON" : "OFF";
        }

        // 2. Align Interface Layout Checkboxes
        const audioToggle = panel.querySelector('#stg-toggle-audio-only-checkbox');
        if (audioToggle) audioToggle.checked = !!this.state.isAudioOnly;

        const avToggle = panel.querySelector('#stg-toggle-visualizer-checkbox');
        if (avToggle) avToggle.checked = !!this.state.showVisualizer;

        // 3. Fallback Volume Initialization Safety Layer
        const volSlider = panel.querySelector('#jb-volume-slider');
        if (volSlider) {
            const savedVol = localStorage.getItem("jbVolume");
            if (this.ytPlayer && typeof this.ytPlayer.getVolume === 'function') {
                volSlider.value = this.ytPlayer.getVolume();
            } else {
                volSlider.value = savedVol !== null ? parseInt(savedVol, 10) : 50;
            }
            this.trackVolumeLevel = parseInt(volSlider.value, 10);
        }

        // 4. Cascade view transforms cleanly down onto UI layout contexts
        if (typeof this.toggleAudioOnly === 'function') this.toggleAudioOnly(!!this.state.isAudioOnly);
        if (typeof this.toggleVisualizer === 'function') this.toggleVisualizer(!!this.state.showVisualizer);
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
// ========================================================================
    // CORE SYSTEM INTERACTION ROUTERS (Matrix Manifest Mapping)
    // ========================================================================
    getModuleCommands() {
        const sendNotice = (txt) => {
            this.setWidgetBubble(txt);
            if (typeof window.botSay === 'function') {
                window.botSay(txt);
            }
        };

        const processMasterJukeboxSubRoute = (user, message, flags) => {
            const parts = message.trim().split(/\s+/);
            const subCommand = parts[0]?.toLowerCase();
            const payloadString = parts.slice(1).join(' ');

            if (!subCommand) {
                sendNotice(`🎵 [Jukebox]: Subroutines: sr | skip | like | status | queue`);
                return;
            }

            switch (subCommand) {
                case 'help':
                    sendNotice(`🎵 [Jukebox]: !sr [query] | !jb like | !jb skip | !jb status | !jb queue`);
                    break;
                case 'sr':
                case 'request':
                    this.handleSongRequestRoute(user, payloadString, flags, sendNotice);
                    break;
                case 'queue':
                    this.handleQueueCheckRoute(user, flags, sendNotice);
                    break;
                case 'skip':
                    this.handleSkipRoute(user, flags, sendNotice);
                    break;
                case 'like':
                case 'love':
                    this.handleLikeRoute(user, flags, sendNotice);
                    break;
                case 'clear':
                    this.handleClearQueueRoute(user, flags, sendNotice);
                    break;
                case 'status':
                    this.handleStatusCheckRoute(user, flags, sendNotice);
                    break;
                default:
                    sendNotice(`❌ Unknown jukebox execution argument: "${subCommand}"`);
                    break;
            }
        };

        return [
            {
                name: 'sr',
                defaultChat: true,
                defaultCp: true,
                execute: (user, message, flags) => this.handleSongRequestRoute(user, message, flags, sendNotice)
            },
            {
                name: 'request',
                defaultChat: true,
                defaultCp: false,
                execute: (user, message, flags) => this.handleSongRequestRoute(user, message, flags, sendNotice)
            },
            {
                name: 'skip',
                defaultChat: true,
                defaultCp: true,
                execute: (user, message, flags) => this.handleSkipRoute(user, flags, sendNotice)
            },
            {
                name: 'like',
                defaultChat: true,
                defaultCp: false,
                execute: (user, message, flags) => this.handleLikeRoute(user, flags, sendNotice)
            },
            {
                name: 'queue',
                defaultChat: true,
                defaultCp: false,
                execute: (user, message, flags) => this.handleQueueCheckRoute(user, flags, sendNotice)
            },
            {
                name: 'jbstatus',
                defaultChat: true,
                defaultCp: false,
                execute: (user, message, flags) => this.handleStatusCheckRoute(user, flags, sendNotice)
            },
            {
                name: 'jbclear',
                defaultChat: false, 
                defaultCp: false,
                execute: (user, message, flags) => this.handleClearQueueRoute(user, flags, sendNotice)
            },
            {
                name: 'jb',
                defaultChat: true,
                defaultCp: false,
                execute: (user, message, flags) => {
                    if (!this.isCommandAllowed('jb', flags)) return;
                    processMasterJukeboxSubRoute(user, message, flags);
                }
            },
            {
                name: 'jukebox',
                defaultChat: true,
                defaultCp: false,
                execute: (user, message, flags) => {
                    if (!this.isCommandAllowed('jukebox', flags)) return;
                    processMasterJukeboxSubRoute(user, message, flags);
                }
            }
        ];
    }

    // ========================================================================
    // 🧱 MEDIA TRACK MANAGEMENT CORE LOGIC
    // ========================================================================
	updatePlayerDisplay(customTitle = null) {
        // 1. Sync all active track title elements
        const titleElements = document.querySelectorAll('.jb-current-title');
        const displayTitle = customTitle || (this.currentTrackData ? this.currentTrackData.title : "No Track Loaded");
        
        titleElements.forEach(el => { 
            el.textContent = displayTitle; 
        });

        // 2. Resolve the string for the immediate next track
        let upNextString = "Nothing queued";
        if (this.queue.length > 0) {
            upNextString = this.queue[0].title;
            console.log("upNextString = " + this.queue[0].title);
        } else if (this.fallbackPlaylist.length > 0) {
            upNextString = "Random Playlist Selection";
        }
        
        // 3. Sync all elements using the .jb-next-title class
        const nextTitleElements = document.querySelectorAll('.jb-next-title');
        nextTitleElements.forEach(el => {
            el.textContent = upNextString;
        });
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
// ========================================================================
    // MODULE COMMAND INTERCEPT ROUTERS
    // ========================================================================
    async handleSongRequestRoute(user, message, flags, sendNotice) {
        // Enforce basic message length checks before running asynchronous queries
        if (!message || !message.trim()) {
            if (typeof sendNotice === 'function') sendNotice("🎵 Please provide a search term or YouTube URL link.");
            return;
        }
        await this.handleSongRequest(user, message.trim(), sendNotice);
    }

    handleSkipRoute(user, flags, sendNotice) {
        // Broadcaster/Mod bypass: Instantly skip without triggering a voting sequence
        if (flags?.broadcaster || flags?.mod || user.toLowerCase() === this.streamerName) {
            if (typeof sendNotice === 'function') sendNotice(`⏭️ Mod Action: Skipping current track...`);
            this.skipCurrentSong(sendNotice);
        } else {
            this.handleVoteSkip(user, sendNotice);
        }
    }

    handleLikeRoute(user, flags, sendNotice) {
        this.handleLikeSong(user, sendNotice);
    }

    handleClearQueueRoute(user, flags, sendNotice) {
        if (flags?.broadcaster || flags?.mod || user.toLowerCase() === this.streamerName) {
            this.queue = [];
            this.renderQueueList();
            this.updatePlayerDisplay();
            if (typeof sendNotice === 'function') sendNotice("🧹 Jukebox active queue cleared by moderator command.");
        }
    }

    handleQueueCheckRoute(user, flags, sendNotice) {
        if (typeof sendNotice !== 'function') return;
        if (this.queue.length === 0) {
            sendNotice("📋 The active request queue is empty.");
            return;
        }
        const manifest = this.queue.slice(0, 3).map((t, idx) => `${idx + 1}. ${t.title}`).join(' | ');
        const totalCount = this.queue.length > 3 ? ` (+${this.queue.length - 3} more)` : '';
        sendNotice(`📋 Next Tracks: ${manifest}${totalCount}`);
    }

    handleStatusCheckRoute(user, flags, sendNotice) {
        if (typeof sendNotice !== 'function') return;
        if (this.currentTrackData) {
            sendNotice(`🎵 Currently Playing: "${this.currentTrackData.title}" | Likes: [${this.currentTrackVotes.size}/${this.VOTE_REQUIREMENT}]`);
        } else {
            sendNotice("💤 Jukebox status: Standby. Send requests using !sr [song name]");
        }
    }

    // ========================================================================
    // CORE RUNTIME JUKEBOX ENGINE
    // ========================================================================
    async handleSongRequest(user, message, sendNotice) {
        if (!message) return;
        if (!this.acceptRequests) { 
            if (typeof sendNotice === 'function') sendNotice(`🚫 Song requests are currently disabled.`); 
            return; 
        }

        // Notify chat/UI that the jukebox is searching to account for API latency
        if (typeof sendNotice === 'function' && !this.extractYouTubeId(message)) {
            sendNotice(`🔍 Searching for "${message}"...`);
        }

        let trackToQueue = null;
        const id = typeof this.extractYouTubeId === 'function' ? this.extractYouTubeId(message) : null;

        if (id) {
            trackToQueue = { 
                id: id, 
                title: "YouTube Video Link", 
                user: user 
            };
        } else if (typeof this.fetchTrack === 'function') {
            const fetched = await this.fetchTrack(message);
            if (fetched) {
                trackToQueue = { 
                    id: fetched.id, 
                    title: fetched.title, 
                    user: user 
                };
            }
        }

        if (!trackToQueue) {
            if (typeof sendNotice === 'function') {
                sendNotice(`❌ Could not find any tracks matching "${message}".`);
            }
            return;
        }

        this.queue.push(trackToQueue);
        
        if (typeof this.renderQueueList === 'function') this.renderQueueList();
        if (typeof this.updatePlayerDisplay === 'function') this.updatePlayerDisplay();

        if (typeof sendNotice === 'function') {
            sendNotice(`🎵 Added to Queue: "${trackToQueue.title}" (Requested by ${user})`);
        }
        
        if (!this.isPlayingSong) {
            this.playNextSong(sendNotice);
        }
    }

    async playNextSong(sendNotice) {
        if (!this.ytPlayerReady || !this.ytPlayer) return;
        
        this.currentTrackVotes.clear();
        this.currentTrackSkipVotes.clear();
        if (typeof this.stopAudioProgressTracking === 'function') {
            this.stopAudioProgressTracking();
        }

        if (this.queue.length > 0) {
            this.isPlayingSong = true;
            const nextTrack = this.queue.shift();
            
            this.currentTrackData = nextTrack;
            if (typeof this.renderQueueList === 'function') this.renderQueueList();
            if (typeof this.updatePlayerDisplay === 'function') this.updatePlayerDisplay();
            
            this.ytPlayer.loadVideoById(this.currentTrackData.id);
            
        } else if (this.fallbackPlaylist.length > 0) {
            this.isPlayingSong = true;
            this.currentTrackData = this.fallbackPlaylist[Math.floor(Math.random() * this.fallbackPlaylist.length)];
            
            if (typeof this.updatePlayerDisplay === 'function') this.updatePlayerDisplay();
            this.ytPlayer.loadVideoById(this.currentTrackData.id);
        } else {
            this.isPlayingSong = false;
            this.currentTrackData = null;
            if (typeof this.updatePlayerDisplay === 'function') this.updatePlayerDisplay("No Track Loaded");
            if (typeof sendNotice === 'function') sendNotice("📭 Jukebox queue empty.");
        }
    }

    async handleLikeSong(user, sendNotice) {
        if (!this.currentTrackData) return;
        const voter = user.toLowerCase();
        if (this.currentTrackVotes.has(voter)) return;
        
        this.currentTrackVotes.add(voter);
        
        if (typeof sendNotice === 'function') {
            const votesNeeded = this.VOTE_REQUIREMENT - this.currentTrackVotes.size;
            if (votesNeeded <= 0) {
                sendNotice(`❤️ "${this.currentTrackData.title}" saved to fallback rotation playlist updates!`);
            } else {
                sendNotice(`❤️ ${user} liked this song. [${this.currentTrackVotes.size}/${this.VOTE_REQUIREMENT}] votes to save.`);
            }
        }

        if (this.currentTrackVotes.size >= this.VOTE_REQUIREMENT) {
            if (typeof this.saveFallbackItem === 'function') {
                this.saveFallbackItem(this.currentTrackData, "Community");
            }
        }
    }

    async handleVoteSkip(user, sendNotice) {
        if (!this.currentTrackData) return;
        const voter = user.toLowerCase();
        if (this.currentTrackSkipVotes.has(voter)) return;

        this.currentTrackSkipVotes.add(voter);
        
        if (typeof sendNotice === 'function' && this.currentTrackSkipVotes.size < this.VOTE_REQUIREMENT) {
            sendNotice(`⏩ Vote to skip registered by ${user}. [${this.currentTrackSkipVotes.size}/${this.VOTE_REQUIREMENT}] votes reached.`);
        }

        if (this.currentTrackSkipVotes.size >= this.VOTE_REQUIREMENT) {
            if (typeof sendNotice === 'function') sendNotice(`⏩ Vote threshold reached! Skipping current video track sequence...`);
            this.skipCurrentSong(sendNotice);
        }
    }

    skipCurrentSong(sendNotice) {
        if (this.ytPlayer && typeof this.ytPlayer.stopVideo === 'function') { 
            this.ytPlayer.stopVideo(); 
            this.playNextSong(sendNotice); 
        }
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
	enqueueFromFallback(item) {
        // Formulates a queue payload matching standard request object format
        this.queue.push({
            user: item.user || 'Fallback',
            title: item.title,
            id: item.id,
            isSearch: false
        });
        
        this.renderQueueList();
        this.updatePlayerDisplay();
        
        // If the player is currently sitting idle on fallback mode or silent, fire it up
        if (!this.isPlayingSong) {
            this.playNextSong(() => {});
        }
    }

    playNextFromFallback(item) {
        // Inserts directly at index 0, sliding the rest of the queue items down one slot
        this.queue.unshift({
            user: item.user || 'Fallback',
            title: item.title,
            id: item.id,
            isSearch: false
        });
        
        this.renderQueueList();
        this.updatePlayerDisplay();
        
        // Bootstraps playback immediately if the jukebox is stalled on standby
        if (!this.isPlayingSong) {
            this.playNextSong(() => {});
        }
    }
	renderFallbackList() {
        const list = document.getElementById('jb-fallback-list');
        if (!list) return; 
        list.innerHTML = '';

        this.fallbackPlaylist.forEach((item, idx) => {
            const el = document.createElement('div');
            el.style.cssText = "font-size:10px; color:#e4e4e7; padding:4px; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #222; gap:4px;";
            
            // Track title container (clipped if too long)
            el.innerHTML = `
                <span style="white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1; min-width:0;" title="${item.title}">
                    • ${item.title}
                </span>
                <div style="display:flex; gap:6px; align-items:center; flex-shrink:0;">
                    <span class="fallback-action-btn fb-enqueue-btn" style="color:#a855f7; cursor:pointer; font-weight:bold; padding:0 2px;" title="Add to Queue">➕</span>
                    <span class="fallback-action-btn fb-playnext-btn" style="color:#22c55e; cursor:pointer; font-size:11px;" title="Play Next">▶</span>
                    <span class="fallback-action-btn fb-remove-btn" style="color:#991b1b; cursor:pointer; font-weight:bold; padding:0 2px;" title="Remove Permanently">✕</span>
                </div>
            `;

            // Action 1: Add to bottom of the queue
            el.querySelector('.fb-enqueue-btn').onclick = () => {
                this.enqueueFromFallback(item);
            };

            // Action 2: Insert at top of the queue (Play Next)
            el.querySelector('.fb-playnext-btn').onclick = () => {
                this.playNextFromFallback(item);
            };

            // Action 3: Remove from the fallback playlist selection entirely
            el.querySelector('.fb-remove-btn').onclick = () => {
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