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
        this.VOTE_REQUIREMENT = 2;
        this.isPlayingSong = false;
        this.streamerName = "jaedraze";
        this.isEnabled = true; // Default state for settings

        this.init();
        console.log("🎵 [Module Init]: StreamJukebox core instantiated.");
    }

    init() {
        // Inject YouTube API if not already present
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(tag);
        }

        window.onYouTubeIframeAPIReady = () => {
            this.ytPlayer = new YT.Player('player', {
                height: '100%',
                width: '100%',
                playerVars: { 
                    'autoplay': 1, 
                    'controls': 1, 
                    'enablejsapi': 1,
                    'fs': 0 
                },
                events: {
                    'onReady': () => { 
                        this.ytPlayerReady = true; 
                        this.bindControls(); // Bind after player is ready
                        this.playNextSong(); 
                    },
                    'onStateChange': (e) => { 
                        if (e.data === YT.PlayerState.ENDED) this.playNextSong(); 
                    }
                }
            });
        };
    }

    /**
     * Self-contained event binding. 
     * Finds all buttons with matching IDs and wires them to class methods.
     */
    bindControls() {
        const skipBtns = document.querySelectorAll('#jb-skip-btn');
        const clearBtns = document.querySelectorAll('#jb-clear-btn');

        skipBtns.forEach(btn => {
            btn.onclick = () => this.skipCurrentSong();
        });

        clearBtns.forEach(btn => {
            btn.onclick = () => {
                this.queue = [];
                this.skipCurrentSong();
            };
        });

        console.log("🎵 [Module]: Jukebox controls bound to DOM.");
    }

    // --- Widget Control for Settings UI ---
    setWidgetActiveState(state) {
        this.isEnabled = state;
        const widget = document.getElementById('jukebox-widget');
        if (widget) widget.style.display = state ? "block" : "none";
        
        if (!state && this.ytPlayer) {
            this.ytPlayer.stopVideo();
            this.isPlayingSong = false;
        }
    }

    // --- Command Registry API ---
    getCommands(botSay) {
        return [
            {
                name: "sr",
                adminOnly: false,
                execute: (user, message) => this.handleSongRequest(user, message, botSay)
            },
            {
                name: "songrequest",
                adminOnly: false,
                execute: (user, message) => this.handleSongRequest(user, message, botSay)
            },
            {
                name: "likesong",
                adminOnly: false,
                execute: (user, message, botSay) => this.handleLikeSong(user, botSay)
            },
            {
                name: "addfallback",
                adminOnly: true,
                execute: (user, message, botSay) => this.handleAddFallback(user, message, botSay)
            },
            {
                name: "skip",
                adminOnly: true,
                execute: () => this.skipCurrentSong()
            }
        ];
    }

    // --- Logic ---
    async handleSongRequest(user, message, botSay) {
        if (!this.isEnabled || !message) return;
        const id = this.extractYouTubeId(message);
        this.queue.push({ user, title: id ? "Link" : message, id: id || message, isSearch: !id });
        botSay(`✅ Queued: "${message.substring(0, 30)}..."`);
        if (!this.isPlayingSong) this.playNextSong();
    }

    async handleLikeSong(user, botSay) {
        if (!this.currentTrackData || this.currentTrackVotes.has(user.toLowerCase())) return;
        
        this.currentTrackVotes.add(user.toLowerCase());
        if (this.currentTrackVotes.size >= this.VOTE_REQUIREMENT) {
            this.saveFallbackItem(this.currentTrackData);
            botSay(`🔥 "${this.currentTrackData.title}" added to fallback rotation!`);
        }
    }

    async handleAddFallback(user, message, botSay) {
        const lookup = await this.fetchTrack(message);
        if (lookup) {
            this.saveFallbackItem(lookup);
            botSay(`💾 Added "${lookup.title}" to fallback rotation.`);
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