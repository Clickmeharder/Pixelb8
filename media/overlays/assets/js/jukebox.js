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

        this.init();
        console.log("🎵 [Module Init]: StreamJukebox core instantiated.");
    }

    // --- UI Notifications (Targets existing overlay elements) ---
    triggerVoteToast(username, currentCount, targetCount) {
        const container = document.getElementById("overlay-wrapper");
        if (!container) return;
        const toast = document.createElement("div");
        toast.className = "p8-toast";
        toast.style.cssText = "position: absolute; bottom: 20px; right: 20px; background: rgba(0,0,0,0.9); color: #fff; padding: 12px; border-radius: 8px; border-left: 4px solid var(--accent); z-index: 1000; font-family: monospace; pointer-events: none;";
        toast.innerHTML = `👍 <strong>${username}</strong> liked this! <br> Progress: ${currentCount} / ${targetCount}`;
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
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        }

        window.onYouTubeIframeAPIReady = () => {
            this.ytPlayer = new YT.Player('player', {
                height: '100%', width: '100%',
                playerVars: { 'autoplay': 1, 'controls': 1, 'enablejsapi': 1, 'fs': 0 },
                events: {
                    'onReady': () => { 
                        this.ytPlayerReady = true; 
                        this.applyButtonStyles();
                        this.bindControls(); 
                        this.renderFallbackList();
                        this.playNextSong(); 
                    },
                    'onStateChange': (e) => { if (e.data === YT.PlayerState.ENDED) this.playNextSong(); }
                }
            });
        };
    }

    applyButtonStyles() {
        const buttons = {
            'jb-skip-btn': 'p8-btn',
            'jb-clear-btn': 'p8-btn danger-btn',
            'jb-add-queue-btn': 'p8-btn',
            'jb-add-fallback-btn': 'p8-btn alt-btn',
            'stg-toggle-jukebox-btn': 'p8-btn'
        };
        Object.keys(buttons).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.className = buttons[id];
        });
    }

    bindControls() {
        const skipBtn = document.getElementById('jb-skip-btn');
        if(skipBtn) skipBtn.onclick = () => this.skipCurrentSong();

        const clearBtn = document.getElementById('jb-clear-btn');
        if(clearBtn) clearBtn.onclick = () => { this.queue = []; this.skipCurrentSong(); };
        
        const voteInput = document.getElementById('jb-vote-req-input');
        if (voteInput) {
            voteInput.value = this.VOTE_REQUIREMENT;
            voteInput.onchange = (e) => { this.VOTE_REQUIREMENT = parseInt(e.target.value); localStorage.setItem("jbVoteReq", this.VOTE_REQUIREMENT); };
        }

        const addQueueBtn = document.getElementById('jb-add-queue-btn');
        if(addQueueBtn) addQueueBtn.onclick = () => {
            const val = document.getElementById('jb-search-input').value;
            if (val) { this.manualAddSong(val); document.getElementById('jb-search-input').value = ''; }
        };

        const addFallbackBtn = document.getElementById('jb-add-fallback-btn');
        if(addFallbackBtn) addFallbackBtn.onclick = () => {
            const val = document.getElementById('jb-search-input').value;
            if (val) { this.handleAddFallback('System', val, (msg) => console.log(msg)); document.getElementById('jb-search-input').value = ''; }
        };

        const toggleBtn = document.getElementById('stg-toggle-jukebox-btn');
        if(toggleBtn) toggleBtn.onclick = () => {
            this.setWidgetActiveState(!this.isEnabled);
        };
    }

    renderFallbackList() {
        const list = document.getElementById('jb-fallback-list');
        if (!list) return;
        list.innerHTML = '';

        this.fallbackPlaylist.forEach((item, index) => {
            const div = document.createElement('div');
            div.style.cssText = "display: flex; align-items: center; justify-content: space-between; padding: 6px 8px; border-bottom: 1px solid #3f3f46; font-size: 11px;";
            
            // Track Info (Title + Requestor)
            const info = document.createElement('div');
            info.style.cursor = 'pointer';
            info.innerHTML = `<strong>${item.title}</strong><br><span style="color: #a1a1aa;">Req: ${item.user || 'System'}</span>`;
            info.onclick = () => { 
                this.currentTrackData = item; 
                this.ytPlayer.loadVideoById(item.id); 
            };

            // Delete Button
            const delBtn = document.createElement('button');
            delBtn.innerText = '✕';
            delBtn.className = 'p8-btn';
            delBtn.style.cssText = "background: #991b1b; padding: 2px 4px;width:32px; font-size: 10px; border-radius: 4px; border: none; cursor: pointer;";
            delBtn.onclick = (e) => {
                e.stopPropagation(); // Prevents triggering play on click
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
        if (!state && this.ytPlayer) { this.ytPlayer.stopVideo(); this.isPlayingSong = false; }
    }

    async handleSongRequest(user, message, botSay) {
        if (!this.isEnabled || !message) return;
        if (this.VOTE_REQUIREMENT === 0 && user.toLowerCase() !== this.streamerName.toLowerCase()) {
            botSay("🚫 Only the streamer can add songs.");
            return;
        }
        const id = this.extractYouTubeId(message);
        this.queue.push({ user, title: id ? "Link" : message, id: id || message, isSearch: !id });
        botSay(`✅ Queued: "${message.substring(0, 30)}..."`);
        if (!this.isPlayingSong) this.playNextSong();
    }

    async manualAddSong(query) {
        const track = await this.fetchTrack(query);
        if (track) {
            this.queue.push({ user: 'System', title: track.title, id: track.id, isSearch: false });
            if (!this.isPlayingSong) this.playNextSong();
        }
    }

    async handleLikeSong(user, botSay) {
        if (this.VOTE_REQUIREMENT <= 0 || !this.currentTrackData || this.currentTrackVotes.has(user.toLowerCase())) return;
        this.currentTrackVotes.add(user.toLowerCase());
        
        this.triggerVoteToast(user, this.currentTrackVotes.size, this.VOTE_REQUIREMENT);
        
        if (this.currentTrackVotes.size >= this.VOTE_REQUIREMENT) {
            this.saveFallbackItem(this.currentTrackData, user);
            botSay(`🔥 "${this.currentTrackData.title}" added to fallback!`);
            this.triggerMilestoneOverlay(this.currentTrackData.title);
            this.renderFallbackList();
        }
    }

    async handleAddFallback(user, message, botSay) {
        const lookup = await this.fetchTrack(message);
        if (lookup) {
            this.saveFallbackItem(lookup, user);
            botSay(`💾 Added "${lookup.title}" to fallback.`);
            this.renderFallbackList();
        }
    }

    skipCurrentSong() {
        if (this.ytPlayer && this.isEnabled) { this.ytPlayer.stopVideo(); this.playNextSong(); }
    }

    async playNextSong() {
        if (!this.isEnabled || !this.ytPlayerReady) return;
        this.currentTrackVotes.clear();
        this.currentTrackData = null;

        if (this.queue.length > 0) {
            this.isPlayingSong = true;
            const next = this.queue.shift();
            this.currentTrackData = next.isSearch ? await this.fetchTrack(next.id) : { id: next.id, title: next.title };
            this.ytPlayer.loadVideoById(this.currentTrackData.id);
            const titleEl = document.getElementById('jb-current-title');
            if(titleEl) titleEl.innerText = this.currentTrackData.title;
        } else if (this.fallbackPlaylist.length > 0) {
            this.isPlayingSong = true;
            this.currentTrackData = this.fallbackPlaylist[Math.floor(Math.random() * this.fallbackPlaylist.length)];
            this.ytPlayer.loadVideoById(this.currentTrackData.id);
            const titleEl = document.getElementById('jb-current-title');
            if(titleEl) titleEl.innerText = this.currentTrackData.title;
        } else {
            this.isPlayingSong = false;
            const titleEl = document.getElementById('jb-current-title');
            if(titleEl) titleEl.innerText = "No Track Loaded";
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