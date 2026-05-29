// =========================================================================
// DECOUPLED STREAM JUKEBOX MODULE (High-Performance HTML5 Audio Engine)
// =========================================================================

export class StreamJukebox {
    constructor() {
        this.queue = [];
        this.fallbackPlaylist = JSON.parse(localStorage.getItem("jukeboxFallbackPlaylist")) || [];
        
        // Native HTML5 Audio Elements & Web Audio Context
        this.audioEngine = null;
        this.audioCtx = null;
        this.analyser = null;
        this.sourceNode = null;
        
        this.currentTrackData = null;
        this.currentTrackVotes = new Set();
        
        // Load persistent settings
        this.VOTE_REQUIREMENT = parseInt(localStorage.getItem("jbVoteReq")) || 2;
        this.isPlayingSong = false;
        this.streamerName = "jaedraze";
        this.isEnabled = true; 
        this.acceptRequests = true; 

        this.init();
        console.log("🎵 [Module Init]: StreamJukebox core instantiated with native HTML5 Audio.");
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
                    sendNotice(`🎵 [Jukebox Help]: !sr [link/query] | !jb like | !jb status | !jb tilt [keyword] | !jb queue`);
                    if (isAdmin) sendNotice(`🛠️ [Admin]: !jb [skip | clear | toggle requests | setreq {num}]`);
                    break;

                case 'sr':
                case 'request':
                    const query = parts.slice(1).join(' ');
                    this.handleSongRequest(user, query, sendNotice);
                    break;

                case 'tilt':
                case 'random':
                    const keyword = parts.slice(1).join(' '); 
                    this.playRandomTrack(sendNotice, keyword);
                    break;

                case 'queue':
                    sendNotice(`🎵 [Jukebox]: Current queue length: ${this.queue.length}.`);
                    break;

                case 'skip':
                    if (isAdmin) this.skipCurrentSong(sendNotice);
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
            { name: 'skip', adminOnly: false, execute: (user, msg, flags) => { if(flags.broadcaster || flags.mod) this.skipCurrentSong(sendNotice); } },
            { name: 'sr', adminOnly: false, execute: handleRequest },
            { name: 'request', adminOnly: false, execute: handleRequest }
        ];
    }

    // --- UI DISPLAY ---
    updatePlayerDisplay(customTitle = null) {
        const titleEl = document.getElementById('jb-current-title');
        const nextEl = document.getElementById('jb-next-title');

        if (titleEl) {
            titleEl.textContent = customTitle || (this.currentTrackData ? this.currentTrackData.title : "No Track Loaded"); 
        }

        if (nextEl) {
            nextEl.textContent = (this.queue.length > 0) ? this.queue[0].title : "Nothing queued";
        }
    }

    // --- Core Logic & Initialization ---
    init() {
        // Create or find high-performance HTML5 Audio Engine
        this.audioEngine = document.getElementById('jukebox-audio-engine');
        if (!this.audioEngine) {
            this.audioEngine = document.createElement('audio');
            this.audioEngine.id = 'jukebox-audio-engine';
            this.audioEngine.crossOrigin = "anonymous"; 
            this.audioEngine.preload = "auto";
            document.body.appendChild(this.audioEngine);
        }

        // Native HTML5 Media Event Hooks
        this.audioEngine.onended = () => {
            this.playNextSong((msg) => console.log(msg));
        };

        this.audioEngine.onerror = (e) => {
            console.error("❌ HTML5 Audio Engine Error:", e);
            // Break recursive stall chains if stream crashes, delay before falling forward
            setTimeout(() => this.playNextSong((msg) => console.log(msg)), 2000);
        };

        // Setup Web Audio Routing for reactive overlays / equalizers
        this.setupAudioContext();

        // Safe User Interaction listener to unblock browser Audio Restrictions
        const unlockContext = () => {
            if (this.audioCtx && this.audioCtx.state === 'suspended') {
                this.audioCtx.resume();
                console.log("🔊 Web Audio Context successfully unlocked via user interaction.");
            }
            window.removeEventListener('click', unlockContext);
            window.removeEventListener('keydown', unlockContext);
        };
        window.addEventListener('click', unlockContext);
        window.addEventListener('keydown', unlockContext);

        // UI Bindings
        this.applyButtonStyles();
        this.bindControls(); 
        this.renderFallbackList();
        this.renderQueueList();
        
        // Initial kickstart
        this.playNextSong((msg) => console.log(msg)); 
    }

    setupAudioContext() {
        try {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            this.audioCtx = new AudioContextClass();
            this.analyser = this.audioCtx.createAnalyser();
            this.analyser.fftSize = 256;

            // Route HTML5 Audio -> Analyser Node -> Hardware Speakers
            this.sourceNode = this.audioCtx.createMediaElementSource(this.audioEngine);
            this.sourceNode.connect(this.analyser);
            this.analyser.connect(this.audioCtx.destination);
            
            console.log("⚡ [Audio Pipeline]: Native audio graph established for reactive tracking.");
        } catch (err) {
            console.warn("⚠️ Web Audio API routing failed or context already exists:", err);
        }
    }

    async playRandomTrack(sendNotice, customKeyword = null) {
        const defaultKeywords = ['lofi hip hop', 'synthwave', 'chill beats', 'rock hits', 'jazz piano'];
        const keyword = customKeyword || defaultKeywords[Math.floor(Math.random() * defaultKeywords.length)];
        
        sendNotice(`🎲 [JB]: Searching for stream: ${keyword}...`);
        const track = await this.fetchTrackFromInvidious(keyword);
        
        if (track) {
            this.handleSongRequest('System', track.id, sendNotice);
            sendNotice(`Stream found: "${track.title}"`);
        } else {
            sendNotice(`❌ Could not resolve audio source for "${keyword}".`);
        }
    }

    async playNextSong(botSay) {
        if (!this.isEnabled) return;
        
        this.currentTrackVotes.clear();
        this.currentTrackData = null;

        if (this.queue.length > 0) {
            this.isPlayingSong = true;
            const next = this.queue.shift();
            
            this.renderQueueList(); 
            
            let fetchedTrack = null;
            if (next.isSearch) {
                this.updatePlayerDisplay("Searching stream proxy...");
                fetchedTrack = await this.fetchTrackFromInvidious(next.id);
            } else {
                fetchedTrack = { id: next.id, title: next.title };
            }
            
            if (fetchedTrack) {
                this.loadAndPlayMedia(fetchedTrack);
            } else {
                // Instantly cycle if the search failed to break lockups
                setTimeout(() => this.playNextSong(botSay), 1000);
            }
        } else if (this.fallbackPlaylist.length > 0) {
            this.isPlayingSong = true;
            this.currentTrackData = this.fallbackPlaylist[Math.floor(Math.random() * this.fallbackPlaylist.length)];
            this.loadAndPlayMedia(this.currentTrackData);
        } else {
            this.isPlayingSong = false;
            this.audioEngine.src = "";
            this.updatePlayerDisplay("No Track Loaded");
            if (botSay) botSay("📭 Jukebox queue empty.");
        }
    }

    async loadAndPlayMedia(track) {
        this.currentTrackData = track;
        this.updatePlayerDisplay();

        // Convert raw tracking IDs into clean direct audio streams via a CORS friendly proxy pipe
        const streamUrl = await this.getDirectAudioStreamUrl(track.id);
        
        if (streamUrl) {
            this.audioEngine.src = streamUrl;
            this.audioEngine.load();
            
            this.audioEngine.play().catch(err => {
                console.warn("⚠️ Playback blocked or interrupted. Awaiting configuration gesture.", err);
            });
        } else {
            console.error(`❌ Media parsing failed for Stream ID: ${track.id}. Skipping forward...`);
            this.playNextSong((msg) => console.log(msg));
        }
    }

    async getDirectAudioStreamUrl(videoId) {
        // Targets direct high-performance audio streams bypassing iframe wrapper sandboxes
        const targets = [
            `https://invidious.flokinet.to/latest/by-id/${videoId}`,
            `https://yewtu.be/latest/by-id/${videoId}`
        ];

        // Append explicit proxy pipe configuration if you are running locally on pixelb8.lol to crush CORS blocks
        const corsProxy = "https://api.allorigins.win/raw?url=";

        for (let target of targets) {
            try {
                // Try to resolve clean stream mapping or fallback to proxy pipe definitions
                const directUrl = `${corsProxy}${encodeURIComponent(target)}`;
                return directUrl; 
            } catch (e) { continue; }
        }
        
        // Final fallback rule: Attempt streaming direct standard sound definitions
        return `https://invidious.perennialte.ch/latest/by-id/${videoId}`;
    }

    async fetchTrackFromInvidious(keywords) {
        const instances = ['https://invidious.flokinet.to', 'https://yewtu.be'];
        const corsProxy = "https://api.allorigins.win/raw?url=";

        for (let host of instances) {
            try {
                const targetUrl = `${host}/api/v1/search?q=${encodeURIComponent(keywords)}&type=video`;
                const res = await fetch(`${corsProxy}${encodeURIComponent(targetUrl)}`);
                const data = await res.json();
                if (data?.[0]?.videoId) return { id: data[0].videoId, title: data[0].title };
            } catch (e) { continue; }
        }
        return null;
    }

    // --- Data Handlers ---
    async handleSongRequest(user, message, botSay) {
        if (!this.isEnabled || !message) return;
        
        if (!this.acceptRequests) {
            botSay(`🚫 Sorry @${user}, song requests are currently disabled.`);
            return;
        }

        const id = this.extractYouTubeId(message);
        this.queue.push({ user, title: id ? "Direct Track Link" : message, id: id || message, isSearch: !id });
        
        this.renderQueueList();
        this.updatePlayerDisplay();
        
        botSay(`✅ Queued: "${message.substring(0, 30)}..."`);
        if (!this.isPlayingSong) this.playNextSong(botSay);
    }

    async manualAddSong(query, botSay) {
        const track = await this.fetchTrackFromInvidious(query);
        if (track) {
            this.queue.push({ user: 'System', title: track.title, id: track.id, isSearch: false });
            this.renderQueueList();
            this.updatePlayerDisplay();
            
            if (botSay) botSay(`✅ Added to queue: "${track.title}"`);
            if (!this.isPlayingSong) this.playNextSong(botSay);
        } else {
            if (botSay) botSay(`❌ Could not find track: "${query}"`);
        }
    }

    async handleLikeSong(user, botSay) {
        if (!this.currentTrackData) return;
        
        const voter = user.toLowerCase();
        if (this.currentTrackVotes.has(voter)) return;
        
        this.currentTrackVotes.add(voter);
        this.triggerVoteToast(user, this.currentTrackVotes.size, this.VOTE_REQUIREMENT);
        
        if (this.VOTE_REQUIREMENT <= 1 || this.currentTrackVotes.size >= this.VOTE_REQUIREMENT) {
            this.saveFallbackItem(this.currentTrackData, "Community");
            if (botSay) botSay(`🔥 "${this.currentTrackData.title}" added to fallback!`);
            this.triggerMilestoneOverlay(this.currentTrackData.title);
        }
    }

    async handleAddFallback(user, message, botSay) {
        const lookup = await this.fetchTrackFromInvidious(message);
        if (lookup) {
            this.saveFallbackItem(lookup, user);
            botSay(`💾 Added "${lookup.title}" to fallback.`);
            this.renderFallbackList();
        } else {
            botSay(`❌ Could not find track: "${message}"`);
        }
    }

    skipCurrentSong(botSay) {
        if (this.audioEngine && this.isEnabled) { 
            this.audioEngine.pause();
            if (botSay) botSay("⏭️ Skipping track...");
            this.playNextSong(botSay); 
        }
    }

    saveFallbackItem(item, username = 'System') {
        if (!this.fallbackPlaylist.some(e => e.id === item.id)) {
            this.fallbackPlaylist.push({ ...item, user: username });
            localStorage.setItem("jukeboxFallbackPlaylist", JSON.stringify(this.fallbackPlaylist));
            this.renderFallbackList();
        }
    }

    extractYouTubeId(url) {
        const match = url.match(/^.*(youtu.be\/|v\/|watch\?v=)([^#\&\?]*).*/);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    // --- DOM UI Layout Management ---
    updateBadge(id, isActive) {
        const badge = document.getElementById(id);
        if (!badge) return;
        badge.className = `toggle-status-badge ${isActive ? 'status-enabled' : 'status-disabled'}`;
        badge.innerText = isActive ? 'ON' : 'OFF';
    }

    triggerVoteToast(username, currentCount, targetCount) {
        const container = document.getElementById("overlay-wrapper");
        if (!container) return;
        const toast = document.createElement("div");
        toast.className = "p8-toast";
        toast.style.cssText = "position: absolute; bottom: 20px; right: 20px; background: rgba(0,0,0,0.9); color: #fff; padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent); z-index: 1000; font-family: monospace; pointer-events: none;";
        
        const displayCount = this.VOTE_REQUIREMENT === 0 ? "∞" : targetCount;
        toast.innerHTML = `👍 <strong>${username}</strong> liked this! <br> Progress: ${currentCount} / ${displayCount}`;
        
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
                this.isEnabled = e.target.checked;
                this.updateBadge('jb-status-badge', e.target.checked);
                if(!e.target.checked) this.audioEngine.pause();
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
                const track = item.isSearch ? await this.fetchTrackFromInvidious(item.id) : item;
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
                this.loadAndPlayMedia(item);
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
}