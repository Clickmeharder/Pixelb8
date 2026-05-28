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
        // If another component already declared the ready hook, append our build call
        const originalCallback = window.onYouTubeIframeAPIReady;
        window.onYouTubeIframeAPIReady = () => {
            if (typeof originalCallback === 'function') originalCallback();
            this.buildPlayer();
        };

        // If window.YT and YT.Player are already fully loaded, call buildPlayer immediately
        if (window.YT && window.YT.Player) {
            this.buildPlayer();
        }
    }

    buildPlayer() {
        // 🟢 Defensive Retry Engine: If script exists but namespace isn't ready yet, retry in 200ms
        if (typeof YT === 'undefined' || !YT.Player) {
            setTimeout(() => this.buildPlayer(), 200);
            return;
        }
        
        // Prevent duplicate player generation if it's already bound to the element
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
                    this.skipTrack(); // Advance automatically if block/copyright hits
                }
            }
        });
    }

    onPlayerStateChange(event) {
        // Only react to state transitions if the widget is actively enabled
        if (!this.isEnabled) return;

        // YT.PlayerState.ENDED === 0
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

    // Main interaction router linked directly inside your ComfyJS core commands loop
    handleIncomingCommand(user, command, message, flags) {
        // Do not process requests if the widget setup panel checkbox is turned off
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
            // Kickstart player build if the script loaded while the widget was disabled
            this.buildPlayer();
        }
    }
}