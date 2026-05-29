// =========================================================================
// STREAM JUKEBOX MODULE
// =========================================================================

export class StreamJukebox {
    constructor() {
        this.queue = [];
        this.fallbackPlaylist = JSON.parse(localStorage.getItem("jukeboxFallbackPlaylist")) || [];

        this.ytPlayer = null;
        this.ytPlayerReady = false;

        this.currentTrackData = null;
        this.currentTrackVotes = new Set();

        this.VOTE_REQUIREMENT = parseInt(localStorage.getItem("jbVoteReq")) || 2;

        this.isPlayingSong = false;
        this.streamerName = "jaedraze";

        this.isEnabled = true;
        this.acceptRequests = true;
        this.isAudioOnly = false;

        this.init();

        console.log("🎵 StreamJukebox initialized");
    }

    // =========================================================================
    // COMMANDS
    // =========================================================================

    getCommands(sendNotice) {
        const handleRequest = (user, message) => {
            this.handleSongRequest(user, message, sendNotice);
        };

        const jukeboxExecution = (user, message, flags) => {
            const parts = message.trim().split(/\s+/);
            const subCommand = (parts[0] || "").toLowerCase();
            const isAdmin = flags?.broadcaster || flags?.mod;

            switch (subCommand) {
                case "":
                    sendNotice("🎵 !jb [sr | skip | like | status | random | queue]");
                    break;

                case "help":
                case "h":
                    sendNotice("🎵 !sr [song/link] | !jb like | !jb queue | !jb random");

                    if (isAdmin) {
                        sendNotice("🛠️ Admin: !jb [skip | clear | toggle requests | setreq]");
                    }

                    break;

                case "sr":
                case "request":
                    this.handleSongRequest(user, parts.slice(1).join(" "), sendNotice);
                    break;

                case "random":
                case "tilt":
                    this.playRandomYTSong(sendNotice, parts.slice(1).join(" "));
                    break;

                case "queue":
                    sendNotice(`🎵 Queue length: ${this.queue.length}`);
                    break;

                case "skip":
                    if (isAdmin) this.skipCurrentSong(sendNotice);
                    break;

                case "like":
                    this.handleLikeSong(user, sendNotice);
                    break;

                case "clear":
                    if (!isAdmin) return;

                    this.queue = [];
                    this.renderQueueList();

                    sendNotice("🧹 Queue cleared");
                    break;

                case "status":
                    sendNotice(
                        `🎵 Playing: ${this.currentTrackData?.title || "Nothing"} | Queue: ${this.queue.length}`
                    );
                    break;

                case "toggle":
                    if (!isAdmin) return;

                    if (parts[1] === "requests") {
                        this.acceptRequests = !this.acceptRequests;

                        sendNotice(
                            `📢 Requests ${this.acceptRequests ? "enabled" : "disabled"}`
                        );
                    }

                    break;

                case "setreq":
                    if (!isAdmin || !parts[1]) return;

                    this.VOTE_REQUIREMENT = parseInt(parts[1]) || 2;

                    localStorage.setItem(
                        "jbVoteReq",
                        this.VOTE_REQUIREMENT
                    );

                    sendNotice(
                        `🗳️ Vote requirement set to ${this.VOTE_REQUIREMENT}`
                    );

                    break;

                default:
                    sendNotice(`❌ Unknown command: ${subCommand}`);
            }
        };

        return [
            { name: "jb", adminOnly: false, execute: jukeboxExecution },
            { name: "jukebox", adminOnly: false, execute: jukeboxExecution },
            { name: "sr", adminOnly: false, execute: handleRequest },
            { name: "request", adminOnly: false, execute: handleRequest }
        ];
    }

    // =========================================================================
    // INIT
    // =========================================================================

    init() {
        if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
            const tag = document.createElement("script");

            tag.src = "https://www.youtube.com/iframe_api";

            document.head.appendChild(tag);
        }

        window.onYouTubeIframeAPIReady = () => {
            this.initializePlayer();
        };
    }

    initializePlayer() {
        this.ytPlayer = new YT.Player("player", {
            height: "100%",
            width: "100%",

            playerVars: {
                autoplay: 1,
                controls: 1,
                enablejsapi: 1,
                fs: 0
            },

            events: {
                onReady: () => {
                    this.ytPlayerReady = true;

                    this.applyButtonStyles();
                    this.bindControls();

                    this.renderFallbackList();
                    this.renderQueueList();

                    this.playNextSong(console.log);
                },

                onStateChange: (e) => {
                    if (e.data === YT.PlayerState.ENDED) {
                        this.playNextSong(console.log);
                    }
                }
            }
        });
    }

    // =========================================================================
    // UI
    // =========================================================================

    applyButtonStyles() {
        const buttons = {
            "jb-skip-btn": "p8-btn p8-btn-warning",
            "jb-clear-btn": "p8-btn danger-btn",
            "jb-add-queue-btn": "p8-btn p8-btn-success",
            "jb-add-fallback-btn": "p8-btn p8-btn-success"
        };

        Object.entries(buttons).forEach(([id, className]) => {
            const el = document.getElementById(id);

            if (el) el.className = className;
        });
    }

    bindControls() {
        const bind = (id, fn) => {
            const el = document.getElementById(id);

            if (el) el.onclick = fn;
        };

        bind("jb-current-skip", () => this.skipCurrentSong(console.log));

        bind("jb-current-heart", () =>
            this.handleLikeSong("SystemUI", console.log)
        );

        bind("jb-skip-btn", () => this.skipCurrentSong(console.log));

        bind("jb-clear-btn", () => {
            this.queue = [];
            this.renderQueueList();
        });

        bind("jb-add-queue-btn", () => {
            const input = document.getElementById("jb-search-input");

            if (!input?.value) return;

            this.manualAddSong(input.value, console.log);

            input.value = "";
        });

        bind("jb-add-fallback-btn", () => {
            const input = document.getElementById("jb-search-input");

            if (!input?.value) return;

            this.handleAddFallback("System", input.value, console.log);

            input.value = "";
        });

        this.setupToggle(
            "stg-toggle-jukebox-checkbox",
            "jb-status-badge",
            this.isEnabled,
            (state) => this.setWidgetActiveState(state)
        );

        this.setupToggle(
            "stg-toggle-requests-checkbox",
            "req-status-badge",
            this.acceptRequests,
            (state) => {
                this.acceptRequests = state;
            }
        );

        this.setupToggle(
            "stg-toggle-audio-only-checkbox",
            "audio-status-badge",
            this.isAudioOnly,
            (state) => this.toggleAudioOnly(state)
        );
    }

    setupToggle(checkboxId, badgeId, initialState, callback) {
        const checkbox = document.getElementById(checkboxId);

        if (!checkbox) return;

        checkbox.checked = initialState;

        this.updateBadge(badgeId, initialState);

        checkbox.onchange = (e) => {
            callback(e.target.checked);

            this.updateBadge(badgeId, e.target.checked);
        };
    }

    updateBadge(id, state) {
        const badge = document.getElementById(id);

        if (!badge) return;

        badge.className =
            `toggle-status-badge ${state ? "status-enabled" : "status-disabled"}`;

        badge.innerText = state ? "ON" : "OFF";
    }

    updateNowPlayingUI(title) {
        const titleEl = document.getElementById("jb-current-title");

        if (!titleEl) {
            console.warn("jb-current-title not found");
            return;
        }

        titleEl.innerText = title || "No Track Loaded";
    }

    toggleAudioOnly(state) {
        this.isAudioOnly = state;

        const player = document.getElementById("player");
        const wrapper = document.getElementById("jukebox-video-wrapper");

        if (!player || !wrapper) return;

        player.style.width = state ? "1px" : "100%";
        player.style.height = state ? "1px" : "100%";

        wrapper.style.height = state ? "0px" : "168px";
        wrapper.style.opacity = state ? "0" : "1";
    }

    setWidgetActiveState(state) {
        this.isEnabled = state;

        const widget = document.getElementById("jukebox-widget");

        if (widget) {
            widget.style.display = state ? "block" : "none";
        }

        if (!state && this.ytPlayer) {
            this.ytPlayer.stopVideo();

            this.isPlayingSong = false;

            this.updateNowPlayingUI("No Track Loaded");
        }
    }

    // =========================================================================
    // SONG REQUESTS
    // =========================================================================

    async handleSongRequest(user, message, botSay) {
        if (!this.isEnabled || !message) return;

        if (!this.acceptRequests) {
            botSay(`🚫 Sorry @${user}, requests are disabled.`);
            return;
        }

        const ytId = this.extractYouTubeId(message);

        this.queue.push({
            user,
            title: ytId ? "Loading Track..." : message,
            id: ytId || message,
            isSearch: true
        });

        this.renderQueueList();

        botSay(`✅ Queued: "${message.substring(0, 30)}..."`);

        if (!this.isPlayingSong) {
            this.playNextSong(botSay);
        }
    }

    async manualAddSong(query, botSay) {
        const track = await this.fetchTrack(query);

        if (!track) {
            botSay?.(`❌ Could not find "${query}"`);
            return;
        }

        this.queue.push({
            user: "System",
            title: track.title,
            id: track.id,
            isSearch: false
        });

        this.renderQueueList();

        botSay?.(`✅ Added "${track.title}"`);

        if (!this.isPlayingSong) {
            this.playNextSong(botSay);
        }
    }

    async playRandomYTSong(botSay, keyword = null) {
        const defaults = [
            "lofi hip hop",
            "synthwave",
            "chill beats",
            "rock hits",
            "jazz piano"
        ];

        const query =
            keyword ||
            defaults[Math.floor(Math.random() * defaults.length)];

        botSay(`🎲 Searching for "${query}"...`);

        const track = await this.fetchTrack(query);

        if (!track) {
            botSay(`❌ Could not find music`);
            return;
        }

        this.queue.push({
            user: "System",
            title: track.title,
            id: track.id,
            isSearch: false
        });

        this.renderQueueList();

        if (!this.isPlayingSong) {
            this.playNextSong(botSay);
        }
    }

    async playNextSong(botSay) {
        if (!this.isEnabled || !this.ytPlayerReady) return;

        this.currentTrackVotes.clear();

        this.currentTrackData = null;

        if (this.queue.length > 0) {
            this.isPlayingSong = true;

            const next = this.queue.shift();

            this.renderQueueList();

            this.updateNowPlayingUI("Loading Track...");

            let track = null;

            if (next.isSearch) {
                track = await this.fetchTrack(next.id);
            } else {
                track = {
                    id: next.id,
                    title: next.title
                };
            }

            if (!track) {
                console.warn("Failed to load track");

                this.playNextSong(botSay);

                return;
            }

            this.currentTrackData = track;

            this.updateNowPlayingUI(track.title);

            this.ytPlayer.loadVideoById(track.id);

            return;
        }

        if (this.fallbackPlaylist.length > 0) {
            this.isPlayingSong = true;

            const random =
                this.fallbackPlaylist[
                    Math.floor(Math.random() * this.fallbackPlaylist.length)
                ];

            this.currentTrackData = random;

            this.updateNowPlayingUI(random.title);

            this.ytPlayer.loadVideoById(random.id);

            return;
        }

        this.isPlayingSong = false;

        this.updateNowPlayingUI("No Track Loaded");

        botSay?.("📭 Queue empty");
    }

    skipCurrentSong(botSay) {
        if (!this.ytPlayer || !this.isEnabled) return;

        this.ytPlayer.stopVideo();

        botSay?.("⏭️ Skipping...");

        this.playNextSong(botSay);
    }

    // =========================================================================
    // LIKES
    // =========================================================================
    async handleLikeSong(user, botSay) {
        if (!this.currentTrackData) return;
        const voter = user.toLowerCase();
        if (this.currentTrackVotes.has(voter)) return;
        this.currentTrackVotes.add(voter);
        this.triggerVoteToast(
            user,
            this.currentTrackVotes.size,
            this.VOTE_REQUIREMENT
        );

        if (
            this.VOTE_REQUIREMENT <= 1 ||
            this.currentTrackVotes.size >= this.VOTE_REQUIREMENT
        ) {
            this.saveFallbackItem(this.currentTrackData, "Community");
            botSay?.(`🔥 "${this.currentTrackData.title}" saved`);
            this.triggerMilestoneOverlay(this.currentTrackData.title);
        }
    }

    async handleAddFallback(user, message, botSay) {
        const track = await this.fetchTrack(message);
        if (!track) {
            botSay(`❌ Could not find fallback track`);
            return;
        }
        this.saveFallbackItem(track, user);
        botSay(`💾 Added "${track.title}"`);
    }
	
    saveFallbackItem(item, username = "System") {
        if (this.fallbackPlaylist.some(e => e.id === item.id)) return;
        this.fallbackPlaylist.push({
            ...item,
            user: username
        });
        localStorage.setItem(
            "jukeboxFallbackPlaylist",
            JSON.stringify(this.fallbackPlaylist)
        );
        this.renderFallbackList();
    }

    // =========================================================================
    // RENDER
    // =========================================================================
    renderQueueList() {
        const list = document.getElementById("jb-queue-list");
        if (!list) return;
        list.innerHTML = "";
        this.queue.forEach((item, index) => {
            const div = document.createElement("div");
            div.style.cssText =
                "display:flex;align-items:center;justify-content:space-between;padding:4px 8px;border-bottom:1px solid #27272a;font-size:10px;";
            const info = document.createElement("span");
            info.innerText =
                `${index + 1}. ${(item.title || "Unknown").substring(0, 20)} (@${item.user})`;
            div.appendChild(info);
            list.appendChild(div);
        });
    }
    renderFallbackList() {
        const list = document.getElementById("jb-fallback-list");
        if (!list) return;
        list.innerHTML = "";
        this.fallbackPlaylist.forEach((item, index) => {
            const div = document.createElement("div");
            div.style.cssText =
                "display:flex;align-items:center;justify-content:space-between;padding:6px 8px;border-bottom:1px solid #3f3f46;font-size:11px;";
            const info = document.createElement("div");
            info.style.cursor = "pointer";
            info.innerHTML =
                `<strong>${item.title}</strong><br><span style="color:#a1a1aa;">Req: ${item.user || "System"}</span>`;
            info.onclick = () => {
                this.isPlayingSong = true;
                this.currentTrackVotes.clear();
                this.currentTrackData = item;
                this.updateNowPlayingUI(item.title);
                this.ytPlayer.loadVideoById(item.id);
            };
            const delBtn = document.createElement("button");
            delBtn.innerText = "✕";
            delBtn.className = "p8-btn";
            delBtn.style.cssText =
                "margin:4px;background:#991b1b;padding:2px 4px;min-width:24px;font-size:10px;border-radius:4px;border:none;cursor:pointer;";
            delBtn.onclick = (e) => {
                e.stopPropagation();
                this.fallbackPlaylist.splice(index, 1);
                localStorage.setItem(
                    "jukeboxFallbackPlaylist",
                    JSON.stringify(this.fallbackPlaylist)
                );
                this.renderFallbackList();
            };
            div.appendChild(info);
            div.appendChild(delBtn);
            list.appendChild(div);
        });
    }
    // =========================================================================
    // EFFECTS
    // =========================================================================
    triggerVoteToast(username, currentCount, targetCount) {
        const container = document.getElementById("overlay-wrapper");
        if (!container) return;
        const toast = document.createElement("div");
        toast.className = "p8-toast";
        toast.style.cssText =
            "position:absolute;bottom:20px;right:20px;background:rgba(0,0,0,0.9);color:#fff;padding:12px;border-radius:8px;border-left:4px solid var(--accent);z-index:1000;font-family:monospace;pointer-events:none;";
        const displayCount =
            this.VOTE_REQUIREMENT === 0 ? "∞" : targetCount;
        toast.innerHTML =
            `👍 <strong>${username}</strong> liked this!<br>Progress: ${currentCount}/${displayCount}`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    triggerMilestoneOverlay(songTitle) {
        const widget = document.getElementById("alert-widget");
        const text = document.getElementById("alert-text");
        if (!widget || !text) return;
        const oldHtml = text.innerHTML;
        widget.style.display = "block";
        text.innerHTML =
            `<div style="color:#eab308;">🔥 Community Choice!</div><div style="margin-top:5px;">"${songTitle}" added to fallback!</div>`;
        setTimeout(() => {
            widget.style.display = "none";
            text.innerHTML = oldHtml;
        }, 6500);
    }

    // =========================================================================
    // FETCHING
    // =========================================================================
    async fetchTrack(query) {
        const instances = [
            "https://invidious.flokinet.to",
            "https://yewtu.be"
        ];
        for (const host of instances) {
            try {
                const res = await fetch(
                    `${host}/api/v1/search?q=${encodeURIComponent(query)}&type=video`
                );
                const data = await res.json();
                if (data?.[0]?.videoId) {
                    return {
                        id: data[0].videoId,
                        title: data[0].title
                    };
                }
            } catch (err) {
                console.warn("Invidious failed:", host);
            }
        }
        return null;
    }
    extractYouTubeId(url) {
        const match = url.match(
            /^.*(youtu.be\/|v\/|watch\?v=)([^#&?]*).*/
        );
        return match && match[2].length === 11
            ? match[2]
            : null;
    }
}