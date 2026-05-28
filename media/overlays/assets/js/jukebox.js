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

    init() {
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        }

        window.onYouTubeIframeAPIReady = () => {
            this.ytPlayer = new YT.Player('player', {
                height: '100%',
                width: '100%',
                playerVars: { 'autoplay': 1, 'controls': 1, 'enablejsapi': 1, 'fs': 0 },
                events: {
                    'onReady': () => { 
                        this.ytPlayerReady = true; 
                        this.bindControls(); 
                        this.renderFallbackList();
                        this.playNextSong(); 
                    },
                    'onStateChange': (e) => { 
                        if (e.data === YT.PlayerState.ENDED) this.playNextSong(); 
                    }
                }
            });
        };
    }

    bindControls() {
        // Skip & Clear
        document.querySelectorAll('#jb-skip-btn').forEach(btn => btn.onclick = () => this.skipCurrentSong());
        document.querySelectorAll('#jb-clear-btn').forEach(btn => btn.onclick = () => {
            this.queue = [];
            this.skipCurrentSong();
        });

        // Vote Requirement Input
        const voteInput = document.getElementById('jb-vote-req-input');
        if (voteInput) {
            voteInput.value = this.VOTE_REQUIREMENT;
            voteInput.onchange = (e) => {
                this.VOTE_REQUIREMENT = parseInt(e.target.value);
                localStorage.setItem("jbVoteReq", this.VOTE_REQUIREMENT);
            };
        }

        // Manual Search/Add
        const searchBtn = document.getElementById('jb-search-add-btn');
        const searchInput = document.getElementById('jb-search-input');
        if (searchBtn && searchInput) {
            searchBtn.onclick = () => {
                if (searchInput.value) {
                    this.manualAddSong(searchInput.value);
                    searchInput.value = '';
                }
            };
        }
    }

    renderFallbackList() {
        const list = document.getElementById('jb-fallback-list');
        if (!list) return;
        list.innerHTML = '';
        this.fallbackPlaylist.forEach((item) => {
            const div = document.createElement('div');
            div.style.cssText = "padding: 5px; border-bottom: 1px solid #3f3f46; cursor: pointer; font-size: 12px;";
            div.innerText = item.title;
            div.onclick = () => {
                this.currentTrackData = item;
                this.ytPlayer.loadVideoById(item.id);
            };
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
        }
    }

    async handleSongRequest(user, message, botSay) {
        if (!this.isEnabled || !message) return;
        
        // If VOTE_REQUIREMENT is 0, restrict to streamer/admin
        if (this.VOTE_REQUIREMENT === 0 && user.toLowerCase() !== this.streamerName.toLowerCase()) {
            botSay("🚫 Only the streamer can add songs right now.");
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
        if (this.VOTE_REQUIREMENT === 0 || !this.currentTrackData || this.currentTrackVotes.has(user.toLowerCase())) return;
        
        this.currentTrackVotes.add(user.toLowerCase());
        if (this.currentTrackVotes.size >= this.VOTE_REQUIREMENT) {
            this.saveFallbackItem(this.currentTrackData);
            botSay(`🔥 "${this.currentTrackData.title}" added to fallback rotation!`);
            this.renderFallbackList();
        }
    }

    async handleAddFallback(user, message, botSay) {
        const lookup = await this.fetchTrack(message);
        if (lookup) {
            this.saveFallbackItem(lookup);
            botSay(`💾 Added "${lookup.title}" to fallback rotation.`);
            this.renderFallbackList();
        }
    }

    skipCurrentSong() {
        if (this.ytPlayer && this.isEnabled) {
            this.ytPlayer.stopVideo();
            this.playNextSong();
        }
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
        } else if (this.fallbackPlaylist.length > 0) {
            this.isPlayingSong = true;
            this.currentTrackData = this.fallbackPlaylist[Math.floor(Math.random() * this.fallbackPlaylist.length)];
            this.ytPlayer.loadVideoById(this.currentTrackData.id);
        } else {
            this.isPlayingSong = false;
        }
    }

    saveFallbackItem(item) {
        if (!this.fallbackPlaylist.some(e => e.id === item.id)) {
            this.fallbackPlaylist.push(item);
            localStorage.setItem("jukeboxFallbackPlaylist", JSON.stringify(this.fallbackPlaylist));
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