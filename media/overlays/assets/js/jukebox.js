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
        
        // Load persistent settings
        this.VOTE_REQUIREMENT = parseInt(localStorage.getItem("jbVoteReq")) || 2;
        this.isPlayingSong = false;
        this.streamerName = "jaedraze";
        this.isEnabled = true; 
        this.acceptRequests = true; 
        this.isAudioOnly = false;

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
                    this.playRandomYTSong(sendNotice, keyword);
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
            { name: 'sr', adminOnly: false, execute: handleRequest },
            { name: 'request', adminOnly: false, execute: handleRequest }
        ];
    }

    // --- UI DISPLAY ---
    updatePlayerDisplay(customTitle = null) {
        const titleEl = document.getElementById('jb-current-title');
        const nextEl = document.getElementById('jb-next-title');

        if (titleEl) {
            const displayTitle = customTitle || (this.currentTrackData ? this.currentTrackData.title : "No Track Loaded");
            titleEl.textContent = displayTitle; 
        }

        if (nextEl) {
            nextEl.textContent = (this.queue.length > 0) ? this.queue[0].title : "Nothing queued";
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

	init() {
        // Ensure global initialization array or handler exists cleanly
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        }

        // Bind the handler explicitly to this specific instance context
        const setupPlayer = () => {
            this.ytPlayer = new YT.Player('player', {
                height: '100%', 
                width: '100%',
                playerVars: { 'autoplay': 1, 'controls': 1, 'enablejsapi': 1, 'fs': 0 },
                events: {
                    'onReady': () => { 
                        this.ytPlayerReady = true; 
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
                        
                        // Capture the absolute source of truth directly from the active iframe frame
                        if (e.data === YT.PlayerState.PLAYING) {
                            const videoData = this.ytPlayer.getVideoData();
                            if (videoData && videoData.title) {
                                this.currentTrackData = { 
                                    id: videoData.video_id, 
                                    title: videoData.title 
                                };
                                // Force it straight to the DOM with a clean reference
                                this.updatePlayerDisplay();
                            }
                        }
                    }
                }
            });
        };

        // If API is already initialized by window elsewhere, run setup immediately
        if (window.YT && window.YT.Player) {
            setupPlayer();
        } else {
            // Otherwise capture the global assignment cleanly without dropping class instance context
            window.onYouTubeIframeAPIReady = setupPlayer;
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
    }

    toggleAudioOnly(state) {
        this.isAudioOnly = state;
        const playerContainer = document.getElementById('player');
        const wrapper = document.getElementById('jukebox-video-wrapper');
        
        if (playerContainer && wrapper) {
            playerContainer.style.width = state ? "1px" : "100%";
            playerContainer.style.height = state ? "1px" : "100%";
            wrapper.style.height = state ? "0px" : "168px";
            wrapper.style.opacity = state ? "0" : "1";
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
        
        // Update layout lists explicitly
        this.renderQueueList();
        this.updatePlayerDisplay();
        
        botSay(`✅ Queued: "${message.substring(0, 30)}..."`);
        if (!this.isPlayingSong) this.playNextSong(botSay);
    }

    async manualAddSong(query, botSay) {
        const track = await this.fetchTrack(query);
        if (track) {
            this.queue.push({ user: 'System', title: track.title, id: track.id, isSearch: false });
            
            // Sync layout updates
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
        this.triggerVoteToast(user, this.currentTrackVotes.size, this.VOTE_REQUIREMENT);
        
        if (this.VOTE_REQUIREMENT <= 1 || this.currentTrackVotes.size >= this.VOTE_REQUIREMENT) {
            this.saveFallbackItem(this.currentTrackData, "Community");
            if (botSay) botSay(`🔥 "${this.currentTrackData.title}" added to fallback!`);
            this.triggerMilestoneOverlay(this.currentTrackData.title);
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
        
        this.updatePlayerDisplay("Searching...");
        this.currentTrackVotes.clear();
        this.currentTrackData = null;

        if (this.queue.length > 0) {
            this.isPlayingSong = true;
            const next = this.queue.shift();
            
            // Render the updated queue layout and the up next text instantly
            this.renderQueueList(); 
            this.updatePlayerDisplay("Searching...");
            
            let fetchedTrack = null;
            if (next.isSearch) {
                fetchedTrack = await this.fetchTrack(next.id);
            } else {
                fetchedTrack = { id: next.id, title: next.title };
            }
            
            if (fetchedTrack) {
                this.currentTrackData = fetchedTrack;
                this.ytPlayer.loadVideoById(this.currentTrackData.id);
                this.updatePlayerDisplay(); // <--- ADDED LINE
            } else {
                this.playNextSong(botSay);
            }
        } else if (this.fallbackPlaylist.length > 0) {
            this.isPlayingSong = true;
            this.currentTrackData = this.fallbackPlaylist[Math.floor(Math.random() * this.fallbackPlaylist.length)];
            // Make sure the up-next updates even when falling back
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