import { BaseWidgetModule } from './BaseWidgetModule.js';

export class StreamJukeboxModule extends BaseWidgetModule {
    /**
     * Namespace initialization targeting pixelb8 engine architecture
     */
    constructor() {
        // Registers storage parameters under local namespace keys automatically
        super("stream_jukebox");
    }

    // ========================================================================
    // ⚙️ INITIALIZATION & RECONCILIATION LAYERS
    // ========================================================================
    
    /**
     * Overwrites runtime engine storage to parse state blocks specific to the jukebox
     */
    loadData() {
        // Run core structural allocations first
        super.loadData();

        // Bind custom runtime properties that don't belong to global registry definitions
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
        this.acceptRequests = true; 
        
        // Map UI flags directly to properties saved inside this.state
        this.isAudioOnly = this.state.isAudioOnly ?? false;
        this.showVisualizer = this.state.showVisualizer ?? false;

        this.initYouTubeAPI();
    }

    // ========================================================================
    // 🪟 DECLARATIVE TEMPLATE ENGINE (Dashboard Panel HTML Matrix)
    // ========================================================================
    static get controlsTemplate() {
        return `
            <div class="collapsible-header" onclick="this.parentElement.classList.toggle('collapsed')">
                <span>🎵 Stream Jukebox System Matrix</span>
                <span class="collapse-icon">▼</span>
            </div>
            <div class="collapsible-content">
                <div style="display: flex; flex-direction: column; gap: 12px; padding: 10px; background: #111114;">
                    
                    <div style="background: #141414; padding: 8px; border-radius: 4px; border: 1px solid #27272a;">
                        <label style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; font-weight: bold;">Now Playing</label>
                        <div class="jb-current-title" style="font-size: 13px; color: #a855f7; font-weight: bold; margin-top: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">No Track Loaded</div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 6px; background: #141414; padding: 8px; border-radius: 4px; border: 1px solid #27272a;">
                        <label style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; font-weight: bold;">Master Playback Volume</label>
                        <input type="range" id="jb-volume-slider" min="0" max="100" value="50" style="width: 100%; accent-color: #a855f7;">
                        
                        <div style="display: flex; gap: 4px; margin-top: 4px;">
                            <button type="button" id="jb-current-skip" class="p8-btn" style="flex: 1; padding: 4px; font-size: 11px; background: #27272a;">⏭️ Skip</button>
                            <button type="button" id="jb-current-heart" class="p8-btn" style="flex: 1; padding: 4px; font-size: 11px; background: #27272a;">❤ Like</button>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 6px; background: #141414; padding: 8px; border-radius: 4px; border: 1px solid #27272a; font-size: 11px; color: #fff;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Hide Interface Border</span>
                            <input type="checkbox" id="widgetHideBorderToggle">
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Audio-Only Compact Panel</span>
                            <input type="checkbox" id="stg-toggle-audio-only-checkbox">
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span>Enable Canvas Audio Wave Visualizer</span>
                            <input type="checkbox" id="stg-toggle-visualizer-checkbox">
                        </div>
                    </div>

                    <div style="background: #141414; padding: 8px; border-radius: 4px; border: 1px solid #27272a;">
                        <label style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; font-weight: bold;">Incoming Requests Queue</label>
                        <div id="jb-queue-list" style="max-height: 80px; overflow-y: auto; margin-top: 4px; display: flex; flex-direction: column; gap: 2px;"></div>
                    </div>

                    <div style="background: #141414; padding: 8px; border-radius: 4px; border: 1px solid #27272a;">
                        <label style="font-size: 10px; color: #a1a1aa; text-transform: uppercase; font-weight: bold;">Community Playlist Fallbacks</label>
                        <div id="jb-fallback-list" style="max-height: 100px; overflow-y: auto; margin-top: 4px; display: flex; flex-direction: column; gap: 2px;"></div>
                    </div>
                </div>
            </div>
        `;
    }

    // ========================================================================
    // 🪟 VIEWPORT INJECTION LAYER OVERRIDES
    // ========================================================================
    injectUI() {
        // 1. Mount Overlay Viewport Frame
        const overlayWrapper = document.getElementById("overlay-wrapper");
        if (overlayWrapper && !document.getElementById(this.overlayId)) {
            const overlayEl = document.createElement("div");
            overlayEl.id = this.overlayId;
            overlayEl.className = "p8-widget"; 
            overlayEl.style.position = "absolute";
            
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
            
            // Build inner wrapper matching native structural elements
            overlayEl.innerHTML = `
                <div id="jukebox-video-wrapper" style="width: 100%; height: 168px; overflow: hidden; position: relative; border-radius: 8px;">
                    <div id="player" style="width: 100%; height: 100%;"></div>
                    <div id="jb-status-container" style="position: absolute; bottom: 4px; left: 4px; font-size: 9px; background: rgba(0,0,0,0.7); padding: 2px 6px; border-radius: 4px; color: #fff; pointer-events: none; display: block;">
                        Jukebox Engine Active
                    </div>
                </div>
            `;
            
            overlayWrapper.appendChild(overlayEl);
        }

        // 2. Mount Control Panel Module Menu Matrix
        const controlWrapper = document.getElementById("widget-control-wrapper");
        if (controlWrapper && !document.getElementById(this.controlId)) {
            const panelSection = document.createElement("div");
            panelSection.id = this.controlId;
            panelSection.className = "collapsible-section collapsed";
            panelSection.innerHTML = this.constructor.controlsTemplate;
            controlWrapper.appendChild(panelSection);
        }
    }

    // ========================================================================
    // 🔌 YOUTUBE PLAYER CONTROLLERS LIFECYCLE
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
                        
                        // Populate and sync initial layouts
                        this.syncUIPanelElements();
                        this.renderFallbackList();
                        this.renderQueueList();
                        this.playNextSong(() => {}); 
                    },
                    'onStateChange': (e) => {
                        if (e.data === YT.PlayerState.ENDED) {
                            this.playNextSong(() => {});
                        }
                        
                        if (e.data === YT.PlayerState.PLAYING) {
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

    // ========================================================================
    // 🎛️ EVENT BINDING INTERFACES & OVERRIDES
    // ========================================================================
    bindEventListeners() {
        const panel = document.getElementById(this.controlId);
        if (!panel) return;

        // Custom Delegation Interceptor Input Changes
        panel.addEventListener("change", (e) => {
            if (e.target.id === "widgetHideBorderToggle") {
                this.state.hideBorder = e.target.checked;
                this.applyVisibilityStates();
                this.saveData();
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

        // Click Bindings Process Routing 
        panel.addEventListener("click", (e) => {
            if (e.target.id === "jb-current-skip") {
                this.skipCurrentSong(() => {});
            }
            if (e.target.id === "jb-current-heart") {
                this.handleLikeSong('DashboardUI', () => {});
            }
        });

        // Continuous Slider Capturing Track Progress
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

        const borderToggle = panel.querySelector('#widgetHideBorderToggle');
        if (borderToggle) borderToggle.checked = this.state.hideBorder || false;

        const audioToggle = panel.querySelector('#stg-toggle-audio-only-checkbox');
        if (audioToggle) audioToggle.checked = this.isAudioOnly;

        const avToggle = panel.querySelector('#stg-toggle-visualizer-checkbox');
        if (avToggle) avToggle.checked = this.showVisualizer;

        const volSlider = panel.querySelector('#jb-volume-slider');
        if (volSlider && this.ytPlayer && typeof this.ytPlayer.getVolume === 'function') {
            volSlider.value = this.ytPlayer.getVolume();
        }

        this.applyVisibilityStates();
        this.toggleAudioOnly(this.isAudioOnly);
        this.toggleVisualizer(this.showVisualizer);
    }

    // ========================================================================
    // 🎮 CHAT OVERLAY CORE JUKEBOX COMMAND ROUTING ENGINE
    // ========================================================================
    getCommands(sendNotice) {
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
                    break;
                case 'sr':
                case 'request':
                    this.handleSongRequest(user, parts.slice(1).join(' '), sendNotice);
                    break;
                case 'tilt':
                case 'random':
                    this.playRandomYTSong(sendNotice, parts.slice(1).join(' '));
                    break;
                case 'queue':
                    sendNotice(`🎵 [Jukebox]: Current queue length: ${this.queue.length}.`);
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
                        sendNotice(`🧹 [Jukebox]: Queue cleared.`);
                    }
                    break;
                case 'status':
                    sendNotice(`🎵 [Status]: Playing: ${this.currentTrackData?.title || 'Nothing'} | Queue: ${this.queue.length}`);
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
    // 🎨 DRIVEN REDRAW RENDERING GRAPHICS
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
    // 🧱 ORIGINAL JUKEBOX BUSINESS UTILS COMPONENT LOGIC
    // ========================================================================
    updatePlayerDisplay(customTitle = null) {
        const titleElements = document.querySelectorAll('.jb-current-title');
        const displayTitle = customTitle || (this.currentTrackData ? this.currentTrackData.title : "No Track Loaded");
        
        titleElements.forEach(el => { el.textContent = displayTitle; });

        let upNextString = this.queue.length > 0 ? this.queue[0].title : (this.fallbackPlaylist.length > 0 ? "Random Fallback Selection" : "Nothing queued");
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
        
        if (!playerContainer || !wrapper) return;

        if (state) {
            playerContainer.style.width = "0px"; playerContainer.style.height = "0px"; playerContainer.style.visibility = "hidden";
            if (statusContainer) statusContainer.style.display = "none";
            wrapper.style.height = "72px";
            
            let overlayTrackPanel = document.getElementById('jb-audio-overlay-panel');
            if (!overlayTrackPanel) {
                overlayTrackPanel = document.createElement('div');
                overlayTrackPanel.id = 'jb-audio-overlay-panel';
                overlayTrackPanel.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, #18181b 0%, #27272a 100%); color: #ffffff; display: flex; align-items: center; padding: 0 20px; box-sizing: border-box; font-family: monospace; z-index: 10; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);`;
                overlayTrackPanel.innerHTML = `
                    <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; min-width: 0; overflow: hidden;">
                        <div class="jb-current-title" style="font-size: 13px; font-weight: bold; color: #ffffff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">No Track Loaded</div>
                        <div style="width: 100%; background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; overflow: hidden; margin: 4px 0;">
                            <div id="jb-audio-progress-bar" style="width: 0%; background: #a855f7; height: 100%;"></div>
                        </div>
                        <div style="display: flex; justify-content: space-between; font-size: 9px; color: #a1a1aa;">
                            <div id="jb-audio-time-stamp">0:00 / 0:00</div>
                            <div>NEXT: <span id="jb-audio-next-title" style="color: #a855f7;">Nothing queued</span></div>
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
                    avWidget.width = wrapper.clientWidth || 400;
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
        if (!this.acceptRequests) { botSay(`🚫 @${user}, song requests are disabled.`); return; }

        const id = this.extractYouTubeId(message);
        this.queue.push({ user, title: id ? "Link" : message, id: id || message, isSearch: !id });
        this.renderQueueList();
        this.updatePlayerDisplay();
        
        botSay(`✅ Queued: "${message.substring(0, 20)}..."`);
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
            if (botSay) botSay(`🔥 "${this.currentTrackData.title}" added to fallback!`);
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
            el.style.cssText = "font-size:10px; color:#a1a1aa; border-bottom:1px solid #222; padding:2px; display:flex; justify-content:space-between;";
            el.innerHTML = `<span>${idx+1}. ${item.title.substring(0,18)}</span><span style="color:#991b1b; cursor:pointer;" onclick="this.parentElement.remove()">✕</span>`;
            list.appendChild(el);
        });
    }

    renderFallbackList() {
        const list = document.getElementById('jb-fallback-list');
        if (!list) return; list.innerHTML = '';
        this.fallbackPlaylist.forEach((item) => {
            const el = document.createElement('div');
            el.style.cssText = "font-size:10px; color:#e4e4e7; padding:2px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;";
            el.textContent = `• ${item.title}`;
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