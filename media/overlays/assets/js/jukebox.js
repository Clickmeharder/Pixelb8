// =========================================================================
// DECOUPLED STREAM JUKEBOX / SONG REQUEST ENGINE MODULE
// =========================================================================

export class StreamJukebox {
    constructor() {
        this.queue = [];
        this.player = null;
        this.currentTrack = null;
        this.isEnabled = false;
        
        console.log("🎵 [Module Init]: StreamJukebox core instantiated successfully.");
        this.initDOM();
        this.loadYouTubeAPI();
    }

    // 🟢 EXPOSED API CONTRACT: Used by injectAllWidgetCommands() in ttvoverlayApp.js
    getCommands(botSay) {
        return [
            {
                name: "sr",
                adminOnly: false,
                execute: (user, message, flags) => this.handleIncomingCommand(user, "sr", message, flags)
            },
            {
                name: "songrequest",
                adminOnly: false,
                execute: (user, message, flags) => this.handleIncomingCommand(user, "songrequest", message, flags)
            },
            {
                name: "skip",
                adminOnly: true,
                execute: (user, message, flags) => this.handleIncomingCommand(user, "skip", message, flags)
            }
        ];
    }

    initDOM() {
        // Cache your key visual interaction hooks safely
        this.titleEl = document.getElementById("jb-current-title");
        this.statusEl = document.getElementById("jb-status-text");
        this.widgetEl = document.getElementById("jukebox-widget");

        // Bind quick click UI controls directly to bypass bubbling bugs
        const skipBtn = document.getElementById("jb-skip-btn");
        const clearBtn = document.getElementById("jb-clear-btn");

        if (skipBtn) skipBtn.onclick = () => this.skipTrack();
        if (clearBtn) {
            clearBtn.onclick = () => {
                this.queue = [];
                this.skipTrack();
                this.updateUI("Queue Cleared", "Standby");
            };
        }
    }

    loadYouTubeAPI() {
        // If the API script element isn't in the DOM yet, inject it
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        }

        // 🟢 Robust Global Callback Multi-hook Management
        const originalCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (typeof originalCallback === 'function') originalCallback();
            this.buildPlayer();
        };

        if (window.YT && window.YT.Player) {
            this.buildPlayer();
        }
    }

    buildPlayer() {
        if (typeof YT === 'undefined' || !YT.Player) {
            setTimeout(() => this.buildPlayer(), 200);
            return;
        }
        
        if (this.player) return;

        this.player = new YT.Player('player', {
            height: '100%',
            width: '100%',
            videoId: '',
            playerVars: {
                'autoplay': 1,
                'controls': 1,
                'disablekb': 1,
                'fs': 0,
                'modestbranding': 1,
                'rel': 0
            },
            events: {
                'onStateChange': (e) => this.onPlayerStateChange(e),
                'onError': (e) => {
                    console.error("⚠️ YouTube Player Error:", e.data);
                    this.skipTrack();
                }
            }
        });
    }

    onPlayerStateChange(event) {
        if (!this.isEnabled) return;

        if (event.data === 0) {
            this.skipTrack();
        } else if (event.data === 1) {
            this.updateUI(this.currentTrack ? this.currentTrack.title : "Playing...", "LIVE");
        }
    }

    parseYoutubeId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }

    handleIncomingCommand(user, command, message, flags) {
        if (!this.isEnabled) return;

        if (command === "sr" || command === "songrequest") {
            if (!message) return;
            const videoId = this.parseYoutubeId(message);
            
            if (!videoId) {
                if (typeof window.botSay === "function") window.botSay(`@${user} -> Please submit a valid YouTube link.`);
                return;
            }

            const newTrack = { id: videoId, title: `Track: ${videoId}`, requestedBy: user };
            this.queue.push(newTrack);
            
            if (typeof window.botSay === "function") window.botSay(`🎵 Added track to overlay queue position #${this.queue.length}!`);
            
            if (!this.currentTrack) {
                this.processNextTrack();
            }
        }

        if (command === "skip") {
            if (flags.broadcaster || flags.mod) {
                this.skipTrack();
                if (typeof window.botSay === "function") window.botSay(`⏭️ Track skipped by ${user}.`);
            }
        }
    }

    processNextTrack() {
        if (!this.isEnabled) return;

        if (this.queue.length === 0) {
            this.currentTrack = null;
            if (this.player && typeof this.player.stopVideo === "function") this.player.stopVideo();
            this.updateUI("No Track Loaded", "Standby");
            return;
        }

        this.currentTrack = this.queue.shift();
        this.updateUI(this.currentTrack.title, "Loading...");

        if (this.player && typeof this.player.loadVideoById === "function") {
            this.player.loadVideoById(this.currentTrack.id);
        }
    }

    skipTrack() {
        this.processNextTrack();
    }

    updateUI(title, status) {
        if (this.titleEl) this.titleEl.innerText = title;
        if (this.statusEl) this.statusEl.innerText = `Status: ${status}`;
    }

    setWidgetActiveState(state) {
        this.isEnabled = state;
        if (this.widgetEl) {
            this.widgetEl.style.display = state ? "block" : "none";
        }
        if (!state) {
            if (this.player && typeof this.player.stopVideo === "function") this.player.stopVideo();
            this.currentTrack = null;
            this.queue = [];
            this.updateUI("No Track Loaded", "Standby");
        } else {
            this.buildPlayer();
        }
    }
}