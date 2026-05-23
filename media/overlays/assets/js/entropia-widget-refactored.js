import { get, set, del } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

// =========================================================================
// REGISTERED ENTROPIA LOG PARSING ENGINE (Decoupled Namespace)
// =========================================================================
const EntropiaParser = {
    regex: {
        logLine: /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[([^\]]+)\]\s*(.*)$/,
        loot: /You received\s+\[?(.+?)\]?\s+x\s+\((\d+)\)\s+Value:\s*([\d.]+)\s*PED/i,
        lootDetails: /You received\s+(.+?)\s+x\s+\((\d+)\)\s+Value:\s*([\d.]+)\s*PED/i,
        experience: /You have gained\s+([\d.]+)\s+experience in your (.+) skill/i,
        inflicted: /inflicted\s+([\d.]+)/i,
        took: /took\s+([\d.]+)/i,
        healed: /You healed(?:\s+\w+)?\s+([\d.]+)/i,
        criticalHit: /critical hit/i,
        evade: /The target Evaded your attack/i,
        dodge: /The target Dodged your attack/i,
        miss: /You missed/i,
        enhancerBreak: /Your enhancer (.+?) on your (.+?) broke\. You have (\d+) enhancers remaining.*You received ([\d.]+) PED Shrapnel/i,
        qrIncrease: /Your blueprint Quality Rating has improved/i,
        teamTimestamp: /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[Team\] \[\]\s*(.*)$/,
        teamJoined: /joined the team/i,
        teamLeft: /left the team/i,
        teamKilled: /was killed/i,
        teamLoot: /^(.+?) received (?:a |an )?(.+?)(?: \((\d+)\))?$/,
        pedValue: /Value:/,
        pedAmount: /([\d.]+)\s*PED/i,
        lootTimestamp: /^(\d{2}:\d{2}:\d{2})/,
        universalAmmo: /You received.*Universal Ammo/i,
        sweat: /You received.*Vibrant Sweat/,
        pickup: /Picked up (.+?)(?: \((\d+)\))?$/,
        dung: /Common Dung/i,
        oil: /Crude Oil/i,
        keg: /Motorhead Keg/i,
        elysian: /Broken Elysian Technology/i,
        token: /Reward Token \(Lime Green\)/i,
        nawa: /Nawa Fragments/i,
        globalHof: /Hall of Fame|Rare Item|ATH/i,
        globalValue: /with a value of ([\d,.]+) PED/i,
        laharEvent: /Robot forces have launched an attack on Fort Lahar/i,
        missionReceived: /New Mission received \((.+?)\)/i,
        missionCompleted: /Mission completed \((.+?)\)/i,
        missionUpdated: /Mission updated \((.+?)\)/i,
        extract: /You received .* x \((\d+)\) Value: ([\d.]+) PED/,
        claim: /You have claimed a resource! \((.*)\)/,
        depleted: /This resource is depleted/,
        lastKnownLocation: /\[([^,]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([^\]]+)\]/,
        gameMapWaypoint: /(Added|Removed|Reached) waypoint (to|from|was removed from) map: \[position:[^$]+\$[^$]+\$(\d+),(\d+),(\d+)(?:\$([^\]]+))?\]/
    },

    parseDeathExp(message, stats, logEvent) {
        if (message.includes("You were killed by") || message.includes("You died")) {
            stats.deaths += 1;
            logEvent("💀 DEATH REGISTERED");
            return true;
        }

        const xpMatch = message.match(this.regex.experience);
        if (xpMatch) {
            const xpVal = parseFloat(xpMatch[1]);
            const skillName = xpMatch[2].trim();
            stats.skills[skillName] = (stats.skills[skillName] || 0) + xpVal;
            stats.skills.total = (stats.skills.total || 0) + xpVal;
            logEvent(`✨ XP: +${xpVal} ${skillName}`);
            return true;
        }
        return false;
    },

    process(line, stats, lastLootTime, cooldown, selectedAvatar, logEvent, updateUICallback) {
        const logMatch = line.match(this.regex.logLine);
        if (!logMatch) return lastLootTime;

        const [_, timestamp, channel, message] = logMatch;

        if (channel === 'System') {
            if (this.parseDeathExp(message, stats, logEvent)) return lastLootTime;

            const lootMatch = message.match(this.regex.loot);
            if (lootMatch) {
                const itemName = lootMatch[1].trim();
                const amt = parseInt(lootMatch[2]);
                const val = parseFloat(lootMatch[3]);

                const currentTime = performance.now();
                if (currentTime - lastLootTime > cooldown) {
                    stats.lootEvents += 1;
                    logEvent(`🎯 DISTINCT LOOT EVENT REGISTERED (#${stats.lootEvents})`);
                }
                lastLootTime = currentTime;

                if (this.regex.universalAmmo.test(message)) {
                    stats.universalAmmoValue += val;
                    logEvent(`🔋 AMMO INGESTED: +${val.toFixed(4)} PED (Stored Separately)`);
                    updateUICallback();
                    return lastLootTime;
                }

                stats.loot[itemName] = (stats.loot[itemName] || 0) + amt;
                stats.values[itemName] = (stats.values[itemName] || 0) + val;
                
                updateUICallback();
                logEvent(`+ ${amt}x ${itemName} (${val.toFixed(4)} PED)`);
            }
        } else if (channel === 'Globals' && this.regex.globalHof.test(message)) {
            if (!selectedAvatar || message.includes(selectedAvatar)) {
                stats.globals++;
                logEvent(`🏆 GLOBAL: ${message}`);
            }
        }
        return lastLootTime;
    }
};

// =========================================================================
// CORE WIDGET CONTROLLER
// =========================================================================
export class EntropiaWidget {
    constructor() {
        this.FILE_HANDLE_KEY = "entropia_chat_handle";
        this.VISIBILITY_KEY = "entropia_overlay_visible";
        this.AVATARS_KEY = "entropia_filtered_avatars";
        this.SELECTED_AVATAR_KEY = "entropia_selected_avatar";
        
        this.fileHandle = null;
        this.lastSize = 0;
        this.lastProcessedLine = "";
        this.errorCount = 0;
        this.MAX_RETRIES = 5;
        this.isPaused = false;
        this.sessionStartTime = null;
        this.sessionTickerInterval = null;
        this.pollInterval = null;
        
        this.lastLootIncrementTime = 0;
        this.LOOT_COOLDOWN_MS = 20;

        this.stats = {
            loot: {}, values: {}, skills: { total: 0 }, 
            deaths: 0, globals: 0, lootEvents: 0, 
            universalAmmoValue: 0, totalCost: 0, expenses: []
        };

        this.avatars = [];
        this.selectedAvatar = "";
        this.FRUIT_NAMES = ['Papplon', 'Bombardo', 'Haimoros', 'Caroot'];
        this.STONE_NAMES = ['Brukite', 'Sopur', 'Nissit', 'Kaldon', 'Truton'];
        
        // High-speed static binding to skip DOM tree lookup loops
        this.domCache = {}; 

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initDOM());
        } else {
            this.initDOM();
        }
        this.recoverSavedHandle();
    }

    logEvent(message, isWarning = false) {
        console[isWarning ? 'warn' : 'log'](`[Entropia Widget]: ${message}`);
    }

    initDOM() {
        this.logEvent("🔌 Initializing decoupled architecture (Manager Controls -> Dual Display Outputs)...");

        this.browseBtn = document.getElementById('browseBtn');
        this.startBtn = document.getElementById('start-session-btn');
        this.resetBtn = document.getElementById('btnReset');
        this.pathInput = document.getElementById('pathInput');
        this.visibilityToggle = document.getElementById('entropia-visibility-toggle');

        this.avatarSelector = document.getElementById('eu-avatar-selector');
        this.avatarInput = document.getElementById('eu-avatar-input');
        this.avatarAddBtn = document.getElementById('eu-avatar-add-btn');
        this.avatarDelBtn = document.getElementById('eu-avatar-del-btn');

        this.overlayWidgetContainer = document.querySelector('#overlay-wrapper #entropia-widget') || document.getElementById('entropia-widget');

        this.manifestGrids = document.querySelectorAll('#manifest-grid');
        this.timerElements = document.querySelectorAll('#session-timer, #overlay-timer');
        this.grandTotalElements = document.querySelectorAll('#session-grand-total');
        this.returnsElements = document.querySelectorAll('#session-returns');

        if (this.browseBtn) {
            this.browseBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logEvent("Manager Action: LINK LOG Triggered");
                this.handleBrowse();
            });
        } else {
            console.error("❌ [Entropia Widget Error]: Element #browseBtn missing from your manager layout.");
        }

        if (this.startBtn) {
            this.startBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logEvent("Manager Action: START SESSION Triggered");
                this.toggleSession();
            });
        } else {
            console.error("❌ [Entropia Widget Error]: Element #start-session-btn missing from your manager layout.");
        }

        if (this.resetBtn) {
            this.resetBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logEvent("Manager Action: RESET SESSION Triggered");
                this.resetSession();
            });
        }

        if (this.visibilityToggle) {
            this.visibilityToggle.addEventListener('change', (e) => {
                this.handleVisibilityChange(e.target.checked);
            });
        } else {
            this.logEvent("#entropia-visibility-toggle not found in DOM.", true);
        }

        if (this.avatarAddBtn) {
            this.avatarAddBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addAvatarFilter();
            });
        }
        if (this.avatarDelBtn) {
            this.avatarDelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.deleteAvatarFilter();
            });
        }
        if (this.avatarSelector) {
            this.avatarSelector.addEventListener('change', (e) => {
                this.selectedAvatar = e.target.value;
                set(this.SELECTED_AVATAR_KEY, this.selectedAvatar)
                    .then(() => this.logEvent(`🎯 Selected active global avatar filter: "${this.selectedAvatar}"`))
                    .catch(e => console.error("Failed to save selected avatar:", e));
            });
        }
    }

    async clearLogPath() {
        await del(this.FILE_HANDLE_KEY);
        this.fileHandle = null;
        if (this.pathInput) this.pathInput.value = "";
        if (this.startBtn) {
            this.startBtn.style.background = "#555";
            this.startBtn.style.boxShadow = "none";
            this.startBtn.textContent = "START SESSION";
        }
        this.logEvent("🧹 STORAGE_CLEARED: Log path wiped from IndexedDB. Please re-browse.");
    }

    async recoverSavedHandle() {
        try {
            const savedHandle = await get(this.FILE_HANDLE_KEY);
            if (savedHandle) {
                this.fileHandle = savedHandle;
                if (this.pathInput) this.pathInput.value = savedHandle.name;
                this.logEvent(`💾 AUTO_RECOVERY: Restored link pointer to ${savedHandle.name.toUpperCase()}`);
                
                try {
                    const perm = await this.fileHandle.queryPermission({ mode: 'read' });
                    if (this.startBtn) {
                        this.startBtn.textContent = "START SESSION";
                        if (perm === 'granted') {
                            this.startBtn.style.background = "#2e7d32";
                            this.startBtn.style.boxShadow = "0 0 10px #00ff00";
                        } else {
                            this.startBtn.style.background = "#e65100";
                            this.startBtn.style.boxShadow = "0 0 15px #ff9800";
                            if (this.browseBtn) this.browseBtn.style.boxShadow = "0 0 15px #0ec3c3";
                            this.logEvent("🔑 RE-AUTH_REQUIRED: Click Start Session to grant runtime access.");
                        }
                    }
                } catch (err) {
                    this.logEvent("⚠️ HANDLE_STALE: Local token unrecoverable. Resetting path reference...", true);
                    await this.clearLogPath();
                }
            }

            const savedVisibility = await get(this.VISIBILITY_KEY);
            const isVisible = savedVisibility !== false;
            
            if (this.visibilityToggle) {
                this.visibilityToggle.checked = isVisible;
                const slider = this.visibilityToggle.nextElementSibling;
                if (slider) slider.style.backgroundColor = isVisible ? '#0ea5e9' : '#3f3f46';
            }
            this.handleVisibilityChange(isVisible, false);

            const savedAvatars = await get(this.AVATARS_KEY);
            if (Array.isArray(savedAvatars)) this.avatars = savedAvatars;

            const savedSelected = await get(this.SELECTED_AVATAR_KEY);
            if (savedSelected) this.selectedAvatar = savedSelected;

            this.updateAvatarDropdown();
        } catch (e) {
            console.error("Failed to recover persistent initialization configurations:", e);
        }
    }

    handleVisibilityChange(shouldShow, persistState = true) {
        if (this.overlayWidgetContainer) {
            this.overlayWidgetContainer.style.display = shouldShow ? 'block' : 'none';
            this.logEvent(`Visibility configuration applied: ${shouldShow ? 'VISIBLE' : 'HIDDEN'}`);
        }
        if (this.visibilityToggle && this.visibilityToggle.nextElementSibling) {
            this.visibilityToggle.nextElementSibling.style.backgroundColor = shouldShow ? '#0ea5e9' : '#3f3f46';
        }
        if (persistState) {
            set(this.VISIBILITY_KEY, shouldShow).catch(e => console.error("Failed to cache visibility setting:", e));
        }
    }

    async handleBrowse() {
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{ description: 'Entropia Log', accept: { 'text/plain': ['.log'] } }],
                multiple: false
            });
            await set(this.FILE_HANDLE_KEY, handle);
            this.fileHandle = handle;
            if (this.pathInput) this.pathInput.value = handle.name;
            this.logEvent(`📂 LOG_LINKED: SUCCESS`);
            if (this.browseBtn) this.browseBtn.style.boxShadow = "none";
            if (this.startBtn) {
                this.startBtn.style.background = "#2e7d32";
                this.startBtn.style.boxShadow = "0 0 10px #00ff00";
                this.startBtn.textContent = "START SESSION";
            }
        } catch (err) {
            this.logEvent("❌ PICKER_CANCELLED", true);
        }
    }

    toggleSession() {
        if (!this.startBtn) return;
        if (this.pollInterval) this.stopSession(); else this.startSession();
    }

    async verifyPermission() {
        if (!this.fileHandle) return false;
        const opts = { mode: 'read' };
        if ((await this.fileHandle.queryPermission(opts)) === 'granted') return true;
        if ((await this.fileHandle.requestPermission(opts)) === 'granted') return true;
        return false;
    }

    async startSession() {
        if (!this.fileHandle) {
            this.logEvent("❌ ERROR: Link Chat.log first!", true);
            if (this.browseBtn) this.browseBtn.style.boxShadow = "0 0 20px #ff0000";
            alert("Please click 'LINK LOG' first to select your Entropia Chat.log file.");
            return;
        }

        try {
            const hasPermission = await this.verifyPermission();
            if (!hasPermission) {
                this.logEvent("❌ PERMISSION_DENIED: Browser blocked sandbox file-read.", true);
                if (this.startBtn) {
                    this.startBtn.style.background = "#b71c1c";
                    this.startBtn.style.boxShadow = "0 0 15px #ff0000";
                }
                alert("Browser access denied. Please click 'START SESSION' again to grant folder polling permissions.");
                return;
            }

            const file = await this.fileHandle.getFile();
            this.lastSize = file.size;
            this.sessionStartTime = Date.now();
            this.isPaused = false;
            this.errorCount = 0;

            if (this.pollInterval) clearInterval(this.pollInterval);
            if (this.sessionTickerInterval) clearInterval(this.sessionTickerInterval);

            this.stats = { loot: {}, values: {}, skills: { total: 0 }, deaths: 0, globals: 0, lootEvents: 0, universalAmmoValue: 0, totalCost: 0, expenses: [] };
            this.domCache = {};
            this.manifestGrids.forEach(grid => grid.innerHTML = '');

            if (this.startBtn) {
                this.startBtn.textContent = "STOP SESSION";
                this.startBtn.style.background = "#d32f2f";
                this.startBtn.style.boxShadow = "0 0 10px #ff0000";
            }
            if (this.browseBtn) this.browseBtn.style.boxShadow = "none";

            if ('wakeLock' in navigator) {
                try { await navigator.wakeLock.request('screen'); } catch (e) {}
            }

            this.pollInterval = setInterval(() => this.pollWebLog(), 2000);
            this.sessionTickerInterval = setInterval(() => this.runSessionTicker(), 1000);
            
            this.logEvent(`✅ SESSION_STARTED: ${file.name}`);
        } catch (e) {
            console.error("Critical Engine failure starting session: ", e);
            this.logEvent(`❌ AUTH_FAIL: Access error. Re-authentication required via action panel button.`, true);
            if (this.startBtn) {
                this.startBtn.style.background = "#e65100";
                this.startBtn.textContent = "RE-AUTH REQ";
            }
        }
    }

    pauseSession() { this.isPaused = true; this.logEvent("⏸️ TRACKING_PAUSED: Log incoming queues held in suspense pool."); }
    resumeSession() { this.isPaused = false; this.logEvent("▶️ TRACKING_RESUMED: Polling channels re-opened."); }

    stopSession() {
        clearInterval(this.pollInterval);
        clearInterval(this.sessionTickerInterval);
        this.pollInterval = null;
        this.sessionTickerInterval = null;

        if (this.startBtn) {
            this.startBtn.textContent = "START SESSION";
            this.startBtn.style.background = "#2e7d32";
            this.startBtn.style.boxShadow = "0 0 10px #00ff00";
        }
        this.logEvent("🛑 SESSION_STOPPED.");
    }

    resetSession() {
        this.stats = { loot: {}, values: {}, skills: { total: 0 }, deaths: 0, globals: 0, lootEvents: 0, universalAmmoValue: 0, totalCost: 0, expenses: [] };
        this.lastProcessedLine = "";
        this.sessionStartTime = Date.now();
        this.lastLootIncrementTime = 0;
        this.domCache = {};
        
        this.manifestGrids.forEach(grid => grid.innerHTML = '');
        this.grandTotalElements.forEach(el => el.textContent = "0.0000");
        this.timerElements.forEach(el => el.textContent = "00:00:00");
        this.returnsElements.forEach(el => { el.textContent = "100.00"; el.style.color = '#a1a1aa'; });
        
        this.logEvent("🧹 SESSION_STATS_CLEARED.");
        this.updateUI();
    }

    runSessionTicker() {
        if (this.isPaused || !this.sessionStartTime) return;
        const elapsed = Date.now() - this.sessionStartTime;
        const h = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
        const m = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
        this.timerElements.forEach(el => el.textContent = `${h}:${m}:${s}`);
        this.updateUI();
    }

    async pollWebLog() {
        if (!this.fileHandle || this.isPaused) return;

        try {
            const file = await this.fileHandle.getFile();
            if (file.size > this.lastSize) {
                const blob = file.slice(this.lastSize, file.size);
                const text = await blob.text();
                text.split(/\r?\n/).forEach(line => {
                    if (line.trim()) {
                        this.lastLootIncrementTime = EntropiaParser.process(
                            line, this.stats, this.lastLootIncrementTime, 
                            this.LOOT_COOLDOWN_MS, this.selectedAvatar, 
                            this.logEvent.bind(this), this.updateUI.bind(this)
                        );
                    }
                });
                this.lastSize = file.size;
            } else if (file.size < this.lastSize) {
                this.logEvent("⚠️ ROTATION: Log shrink detected.", true);
                this.lastSize = file.size;
            }
            this.errorCount = 0;
        } catch (err) {
            this.logEvent(`⚠️ POLLING_LAG: Fault registered [${this.errorCount + 1}/${this.MAX_RETRIES}]. Retrying background hook...`, true);
            if (++this.errorCount >= this.MAX_RETRIES) {
                this.logEvent("❌ PERMISSION_LOST: Continuous access pipeline broke. Suspending engine run loop.", true);
                this.stopSession();
                if (this.startBtn) {
                    this.startBtn.style.background = "#e65100";
                    this.startBtn.style.boxShadow = "0 0 15px #ff9800";
                    this.startBtn.textContent = "RE-AUTH SESSION";
                }
            }
        }
    }

    parseDeathExpLine(message) {
        if (message.includes("You were killed by") || message.includes("You died")) {
            this.stats.deaths += 1;
            this.logEvent("💀 DEATH REGISTERED");
            return true;
        }

        const xpMatch = message.match(this.regex.experience);
        if (xpMatch) {
            const xpVal = parseFloat(xpMatch[1]);
            const skillName = xpMatch[2].trim();
            
            this.stats.skills[skillName] = (this.stats.skills[skillName] || 0) + xpVal;
            this.stats.skills.total = (this.stats.skills.total || 0) + xpVal;
            
            this.logEvent(`✨ XP: +${xpVal} ${skillName}`);
            return true;
        }

        return false;
    }

    parseLine(line) {
        if (line === this.lastProcessedLine || !line.trim()) return;

        const logMatch = line.match(this.regex.logLine);
        if (!logMatch) return;

        const [_, timestamp, channel, message] = logMatch;
        this.lastProcessedLine = line;

        if (channel === 'System') {
            if (this.parseDeathExpLine(message)) {
                return;
            }

            const lootMatch = message.match(this.regex.loot);
            if (lootMatch) {
                const itemName = lootMatch[1].trim();
                const amt = parseInt(lootMatch[2]);
                const val = parseFloat(lootMatch[3]);

                // High Resolution 20ms Window Grouping Evaluation
                const currentTime = performance.now();
                if (currentTime - this.lastLootIncrementTime > this.LOOT_COOLDOWN_MS) {
                    this.stats.lootEvents += 1;
                    this.logEvent(`🎯 DISTINCT LOOT EVENT REGISTERED (#${this.stats.lootEvents})`);
                }
                this.lastLootIncrementTime = currentTime;

                // Segregated Universal Ammo Verification Path
                if (this.regex.universalAmmo.test(message)) {
                    this.stats.universalAmmoValue += val;
                    this.logEvent(`🔋 AMMO INGESTED: +${val.toFixed(4)} PED (Stored Separately)`);
                    this.updateUI();
                    return; 
                }

                // Standard Loot Item Processing
                this.stats.loot[itemName] = (this.stats.loot[itemName] || 0) + amt;
                this.stats.values[itemName] = (this.stats.values[itemName] || 0) + val;
                
                this.updateUI();
                this.logEvent(`+ ${amt}x ${itemName} (${val.toFixed(4)} PED)`);
                return;
            }
        }

        if (channel === 'Globals' && this.regex.globalHof.test(message)) {
            if (this.selectedAvatar && !message.includes(this.selectedAvatar)) {
                return; 
            }
            this.stats.globals++;
            this.logEvent(`🏆 GLOBAL: ${message}`);
        }
    }

    updateUI() {
        if (!this.sessionStartTime) return;

        let grandTotal = 0;
        const elapsedHours = (Date.now() - this.sessionStartTime) / 3600000;

        Object.keys(this.stats.loot).forEach(key => {
            const count = this.stats.loot[key] || 0;
            const totalValue = this.stats.values[key] || 0;
            grandTotal += totalValue;

            if (!this.domCache[key]) {
                const safeKey = key.replace(/\s+/g, '-');
                this.manifestGrids.forEach(grid => {
                    const row = document.createElement('div');
                    row.className = 'manifest-row';
                    row.innerHTML = `
                        <span class="m-name">${key.toUpperCase()}</span>
                        <span class="m-count session-${safeKey}">0</span>
                        <span class="m-rate rate-${safeKey}">0/hr</span>
                        <span class="m-val val-${safeKey}">(0.0000)</span>
                    `;
                    grid.appendChild(row);
                });
                this.domCache[key] = {
                    countEls: document.querySelectorAll(`.session-${safeKey}`),
                    rateEls: document.querySelectorAll(`.rate-${safeKey}`),
                    valEls: document.querySelectorAll(`.val-${safeKey}`)
                };
            }

            const cache = this.domCache[key];
            cache.countEls.forEach(el => el.textContent = count);
            cache.valEls.forEach(el => el.textContent = `(${totalValue.toFixed(4)})`);
            const perHour = (count / Math.max(0.01, elapsedHours)).toFixed(1);
            cache.rateEls.forEach(el => el.textContent = `${perHour}/hr`);
        });

        this.grandTotalElements.forEach(el => el.textContent = grandTotal.toFixed(4));

        let returnsPct = 100.00;
        if (this.stats.totalCost > 0) {
            returnsPct = (grandTotal / this.stats.totalCost) * 100;
        } else if (grandTotal > 0 && this.stats.totalCost === 0) {
            returnsPct = 100.00;
        } else if (grandTotal === 0 && this.stats.totalCost === 0) {
            returnsPct = 0.00;
        }

        this.returnsElements.forEach(el => {
            el.textContent = returnsPct.toFixed(2);
            if (returnsPct >= 100) el.style.color = '#22c55e';
            else if (returnsPct >= 90) el.style.color = '#eab308';
            else if (returnsPct > 0) el.style.color = '#ef4444';
            else el.style.color = '#a1a1aa';
        });
    }

    addAvatarFilter() {
        if (!this.avatarInput) return;
        const val = this.avatarInput.value.trim();
        if (!val) return;
        if (!this.avatars.includes(val)) {
            this.avatars.push(val);
            this.selectedAvatar = val; 
            this.avatarInput.value = "";
            this.saveAvatarsState();
        }
    }

    deleteAvatarFilter() {
        if (!this.avatarSelector) return;
        const val = this.avatarSelector.value;
        if (!val) return;
        this.avatars = this.avatars.filter(av => av !== val);
        this.selectedAvatar = this.avatars.length > 0 ? this.avatars[0] : "";
        this.saveAvatarsState();
    }

    saveAvatarsState() {
        Promise.all([set(this.AVATARS_KEY, this.avatars), set(this.SELECTED_AVATAR_KEY, this.selectedAvatar)])
            .then(() => { this.updateAvatarDropdown(); this.logEvent(`💾 Avatar routing configurations synchronized to local cache.`); })
            .catch(e => console.error("Failed to commit avatar stack to local profile storage:", e));
    }

    updateAvatarDropdown() {
        if (!this.avatarSelector) return;
        this.avatarSelector.innerHTML = "";
        const baseOpt = document.createElement('option');
        baseOpt.value = ""; baseOpt.textContent = "-- TRACK ALL GLOBALS --";
        this.avatarSelector.appendChild(baseOpt);

        this.avatars.forEach(av => {
            const opt = document.createElement('option'); opt.value = av; opt.textContent = av;
            if (av === this.selectedAvatar) opt.selected = true;
            this.avatarSelector.appendChild(opt);
        });
    }

    getCommands(sendNotice) {
        return [{
            name: 'eu',
            adminOnly: false,
            description: 'Entropia Universe tracking overlay runtime routing module control console.',
            execute: (user, message, flags) => {
                const parts = message.trim().toLowerCase().split(/\s+/);
                const subCommand = parts[0];
                const isAdmin = flags.broadcaster || flags.mod;

                if (!subCommand) return sendNotice(`🤖 [EU Console]: Specify action parameters (!eu loot | ped | ammo | events | addcost | costlist | help)`);

                switch (subCommand) {
                    case 'help':
                    case 'commands':
                    case 'h':
                        if (isAdmin) sendNotice(`🛠️ [EU Admin Help]: !eu [start|pause|reset|stop] or !eu addcost [label] {amount} or Toggle Panels: !eu toggle [grid|timer|total]`);
                        else sendNotice(`📦 [EU Public Help]: Commands: !eu loot | !eu ped | !eu ammo | !eu events | !eu cost | !eu costlist | !eu roi | !eu profit`);
                        break;

                    case 'loot': {
                        const totalValue = Object.values(this.stats.values).reduce((a, b) => a + b, 0);
                        if (Object.keys(this.stats.loot).length === 0) return sendNotice(`@${user}, no loot tracked in this session yet.`);
                        const topLoot = Object.entries(this.stats.values).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([n, v]) => `${this.stats.loot[n]}x ${n}`).join(', ');
                        sendNotice(`📦 Session Loot: ${topLoot} | Total Value: ${totalValue.toFixed(2)} PED`);
                        break;
                    }
                    case 'ped':
                    case 'returns':
                    case 'balance': {
                        const cumulativePed = Object.values(this.stats.values).reduce((a, b) => a + b, 0);
                        const netPed = cumulativePed - this.stats.totalCost;
                        sendNotice(`${netPed >= 0 ? '🟢' : '🔴'} [Session Balance]: Loot: ${cumulativePed.toFixed(4)} PED | Cost: ${this.stats.totalCost.toFixed(4)} PED | Net: ${netPed > 0 ? '+' : ''}${netPed.toFixed(4)} PED`);
                        break;
                    }
                    case 'roi': {
                        const cumulativePed = Object.values(this.stats.values).reduce((a, b) => a + b, 0);
                        const roiPct = this.stats.totalCost > 0 ? (cumulativePed / this.stats.totalCost) * 100 : 0.00;
                        sendNotice(`📊 [Session ROI]: ${roiPct.toFixed(2)}% (You have recovered ${roiPct.toFixed(2)}% of your total expenditures)`);
                        break;
                    }
                    case 'profit':
                    case 'net': {
                        const cumulativePed = Object.values(this.stats.values).reduce((a, b) => a + b, 0);
                        const netPed = cumulativePed - this.stats.totalCost;
                        const profitMarginPct = this.stats.totalCost > 0 ? (netPed / this.stats.totalCost) * 100 : 0.00;
                        sendNotice(`${netPed >= 0 ? '📈' : '📉'} [Net Profit Growth]: ${profitMarginPct > 0 ? '+' : ''}${profitMarginPct.toFixed(2)}% (${netPed >= 0 ? 'Gain' : 'Loss'} relative to cost)`);
                        break;
                    }
                    case 'addcost': {
                        if (!isAdmin) return;
                        if (parts.length < 2) return sendNotice(`⚠️ Usage: !eu addcost [label] {amount}`);
                        let label = parts.length >= 3 ? parts[1].trim() : `cost${this.stats.expenses.length + 1}`;
                        let amtStr = parts.length >= 3 ? parts[2].trim() : parts[1].trim();
                        const parsedAmount = parseFloat(amtStr);
                        if (isNaN(parsedAmount) || parsedAmount <= 0) return sendNotice(`❌ Invalid expense number.`);
                        
                        this.stats.expenses.push({ label, amount: parsedAmount, timestamp: Date.now() });
                        this.stats.totalCost += parsedAmount;
                        this.updateUI();
                        sendNotice(`💸 Added [${label.toUpperCase()}]: +${parsedAmount.toFixed(4)} PED.`);
                        break;
                    }
                    case 'costlist':
                    case 'cost': {
                        if (this.stats.expenses.length === 0) return sendNotice(`📋 Expense log ledger is empty.`);
                        const listStr = this.stats.expenses.map((item, idx) => `#${idx + 1} [${item.label.toUpperCase()}]: ${item.amount.toFixed(4)}`).join(' | ');
                        sendNotice(`📋 Costs: ${listStr} | Total Cost: ${this.stats.totalCost.toFixed(4)} PED`);
                        break;
                    }
                    case 'ammo': sendNotice(`🔋 Universal Ammo looted: ${this.stats.universalAmmoValue.toFixed(4)} PED`); break;
                    case 'events': sendNotice(`🎯 Total distinct loot events: ${this.stats.lootEvents}`); break;
                    case 'globals': sendNotice(`🏆 Globals/HOFs hit: ${this.stats.globals} | Deaths: ${this.stats.deaths}`); break;
                    case 'skills': sendNotice(`✨ Total Experience Gained: +${this.stats.skills.total.toFixed(1)} XP`); break;
                    case 'start': if (isAdmin) this.startSession(); break;
                    case 'stop': if (isAdmin) this.stopSession(); break;
                    case 'reset': if (isAdmin) this.resetSession(); break;
                    case 'pause': if (isAdmin) this.pauseSession(); break;
                    case 'resume': if (isAdmin) this.resumeSession(); break;
                    default: sendNotice(`❌ Command !eu ${subCommand} unknown.`);
                }
            }
        }];
    }

/*     getCommands(sendNotice) {
        return [
            {
                name: 'eu',
                adminOnly: false,
                description: 'Entropia Universe tracking overlay runtime routing module control console.',
                execute: (user, message, flags) => {
                    const parts = message.trim().toLowerCase().split(/\s+/);
                    const subCommand = parts[0];
                    const isAdmin = flags.broadcaster || flags.mod;

                    if (!subCommand) {
                        sendNotice(`🤖 [EU Console]: Specify action parameters (!eu loot | ped | ammo | events | addcost | cost | costlist | help)`);
                        return;
                    }

                    switch (subCommand) {
                        case 'help':
                        case 'commands':
                        case 'h':
                            if (isAdmin) {
                                sendNotice(`🛠️ [EU Admin Help]: !eu [start|pause|reset|stop] or !eu addcost [label] {amount} or Toggle Panels: !eu toggle [grid|timer|total]`);
                            } else {
                                sendNotice(`📦 [EU Public Help]: Commands: !eu loot | !eu ped | !eu ammo | !eu events | !eu cost | !eu costlist | !eu skills`);
                            }
                            break;

                        case 'loot': {
                            const totalValue = Object.values(this.stats.values).reduce((a, b) => a + b, 0);
                            if (Object.keys(this.stats.loot).length === 0) {
                                sendNotice(`@${user}, no loot tracked in this session yet.`);
                                return;
                            }
                            
                            const topLoot = Object.entries(this.stats.values)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([name, val]) => `${this.stats.loot[name]}x ${name}`)
                                .join(', ');

                            sendNotice(`📦 Session Loot: ${topLoot} | Total Value: ${totalValue.toFixed(2)} PED`);
                            break;
                        }
						case 'ped':
                        case 'returns': {
                            const cumulativePed = Object.values(this.stats.values).reduce((a, b) => a + b, 0);
                            const totalCost = this.stats.totalCost || 0;
                            const netPed = cumulativePed - totalCost;
                            const sign = netPed > 0 ? '+' : '';
                            const statusMarker = netPed >= 0 ? '🟢' : '🔴';

                            sendNotice(`${statusMarker} [Session Balance]: Loot: ${cumulativePed.toFixed(4)} PED | Cost: ${totalCost.toFixed(4)} PED | Net: ${sign}${netPed.toFixed(4)} PED`);
                            break;
                        }

                        // --- Dedicated Pure ROI Command (Floor at 0%) ---
                        case 'roi': {
                            const cumulativePed = Object.values(this.stats.values).reduce((a, b) => a + b, 0);
                            const totalCost = this.stats.totalCost || 0;
                            
                            let roiPct = 100.00;
                            if (totalCost > 0) {
                                roiPct = (cumulativePed / totalCost) * 100;
                            } else if (cumulativePed === 0 && totalCost === 0) {
                                roiPct = 0.00;
                            }

                            sendNotice(`📊 [Session ROI]: ${roiPct.toFixed(2)}% (You have recovered ${roiPct.toFixed(2)}% of your total expenditures)`);
                            break;
                        }

                        // --- Dedicated Profit/Loss Margin Command (Can be Negative %) ---
                        case 'profit':
                        case 'net': {
                            const cumulativePed = Object.values(this.stats.values).reduce((a, b) => a + b, 0);
                            const totalCost = this.stats.totalCost || 0;
                            const netPed = cumulativePed - totalCost;
                            
                            let profitMarginPct = 0.00;
                            if (totalCost > 0) {
                                profitMarginPct = (netPed / totalCost) * 100;
                            } else if (cumulativePed > 0 && totalCost === 0) {
                                profitMarginPct = 100.00; // Infinite positive upside baseline
                            }

                            const sign = profitMarginPct > 0 ? '+' : '';
                            const statusMarker = netPed >= 0 ? '📈' : '📉';

                            sendNotice(`${statusMarker} [Net Profit Growth]: ${sign}${profitMarginPct.toFixed(2)}% (${netPed >= 0 ? 'Gain' : 'Loss'} relative to your investment cost)`);
                            break;
                        }
                        case 'ammo':
                        case 'ua':
                            sendNotice(`🔋 Universal Ammo looted this session: ${this.stats.universalAmmoValue.toFixed(4)} PED`);
                            break;

                        case 'events':
                        case 'kills':
                        case 'claims':
                            sendNotice(`🎯 Total distinct loot event triggers registered: ${this.stats.lootEvents}`);
                            break;

                        // --- NEW COMMAND: !eu addcost [optional_label] {amount} ---
                        case 'addcost':
                        case 'spend': {
                            if (!isAdmin) return;
                            
                            if (parts.length < 2) {
                                sendNotice(`⚠️ Usage: !eu addcost [label] {amount} -> e.g. !eu addcost decay 4.25`);
                                return;
                            }

                            let label = "";
                            let rawAmountStr = "";

                            // Determine if third parameter was passed or if we need a default fallback label
                            if (parts.length >= 3) {
                                label = parts[1].trim();
                                rawAmountStr = parts[2].trim();
                            } else {
                                // Default naming fallback generation path if third parameter isn't given
                                const fallbackIndex = this.stats.expenses.length + 1;
                                label = `cost${fallbackIndex}`;
                                rawAmountStr = parts[1].trim();
                            }

                            const parsedAmount = parseFloat(rawAmountStr);
                            if (isNaN(parsedAmount) || parsedAmount <= 0) {
                                sendNotice(`❌ Invalid expense value entered: "${rawAmountStr}". Please use numbers like 10.50 or 0.05`);
                                return;
                            }

                            // Commit to structured memory ledger array
                            this.stats.expenses.push({
                                label: label,
                                amount: parsedAmount,
                                timestamp: Date.now()
                            });

                            this.stats.totalCost += parsedAmount;
                            this.updateUI(); // Run full loop to recalibrate Returns % values instantly

                            sendNotice(`💸 Added cost entry [${label.toUpperCase()}]: +${parsedAmount.toFixed(4)} PED. Total costs run: ${this.stats.totalCost.toFixed(4)} PED.`);
                            break;
                        }

                        // --- NEW COMMAND: !eu cost or !eu totalcost ---
                        case 'cost':
                        case 'totalcost': {
                            if (this.stats.expenses.length === 0) {
                                sendNotice(`💸 Total Session Expense: 0.0000 PED. No decay or ammo costs logged yet.`);
                                return;
                            }

                            // Grouping matching tags to rank top spend areas
                            const combinedMap = {};
                            this.stats.expenses.forEach(item => {
                                combinedMap[item.label] = (combinedMap[item.label] || 0) + item.amount;
                            });

                            const topCosts = Object.entries(combinedMap)
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([lbl, val]) => `${lbl.toUpperCase()} (${val.toFixed(2)} PED)`)
                                .join(', ');

                            const distinctLabelsCount = Object.keys(combinedMap).length;

                            sendNotice(`💸 Total cost overhead: ${this.stats.totalCost.toFixed(4)} PED Across ${this.stats.expenses.length} logs | Top Expense profiles: ${topCosts || 'None'}`);
                            break;
                        }

                        // --- NEW COMMAND: !eu costlist ---
                        case 'costlist':
						case 'allcosts':
						case 'listcosts':
                        case 'costs': {
                            if (this.stats.expenses.length === 0) {
                                sendNotice(`📋 Expense log ledger is empty.`);
                                return;
                            }

                            // Map list out to a scannable string format list
                            const listStr = this.stats.expenses
                                .map((item, idx) => `#${idx + 1} [${item.label.toUpperCase()}]: ${item.amount.toFixed(4)}`)
                                .join(' | ');

                            sendNotice(`📋 Cost ledger items (${this.stats.expenses.length} logs total): ${listStr} | Cumulative Grand Total Cost: ${this.stats.totalCost.toFixed(4)} PED`);
                            break;
                        }

                        case 'globals':
                        case 'hofs':
                        case 'hof':
                            sendNotice(`🏆 Globals/HOFs hit this session: ${this.stats.globals} | Deaths: ${this.stats.deaths}`);
                            break;

                        case 'deaths':
                        case 'died':
                            sendNotice(`💀 Avatar deaths recorded this session: ${this.stats.deaths}`);
                            break;

                        case 'skills':
                        case 'skill':
                        case 'xp': {
                            const totalXp = this.stats.skills.total || 0;
                            
                            if (totalXp === 0) {
                                sendNotice(`✨ @${user}, no skill experience has been gained this session yet.`);
                                return;
                            }

                            if (parts[1]) {
                                const searchSkill = parts.slice(1).join(' ').toLowerCase();
                                const exactMatchKey = Object.keys(this.stats.skills).find(
                                    key => key !== 'total' && key.toLowerCase() === searchSkill
                                );

                                if (exactMatchKey) {
                                    sendNotice(`✨ [Skill Tracker]: +${this.stats.skills[exactMatchKey].toFixed(4)} XP in ${exactMatchKey}`);
                                } else {
                                    const fuzzyMatchKey = Object.keys(this.stats.skills).find(
                                        key => key !== 'total' && key.toLowerCase().includes(searchSkill)
                                    );
                                    if (fuzzyMatchKey) {
                                        sendNotice(`✨ [Skill Tracker]: +${this.stats.skills[fuzzyMatchKey].toFixed(4)} XP in ${fuzzyMatchKey}`);
                                    } else {
                                        sendNotice(`🔍 [Skill Tracker]: No gains recorded for "${parts.slice(1).join(' ')}" this session.`);
                                    }
                                }
                                return;
                            }

                            const sortedSkills = Object.entries(this.stats.skills)
                                .filter(([name]) => name !== 'total')
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 3)
                                .map(([name, val]) => `${name} (+${val.toFixed(2)})`)
                                .join(', ');

                            sendNotice(`✨ XP Gained: +${totalXp.toFixed(2)} Total Points | Top Gains: ${sortedSkills || 'None'}`);
                            break;
                        }

                        case 'toggle': {
                            if (!isAdmin) return;
                            const targetElement = parts[1];
                            let currentDisplay; 
                            
                            if (!targetElement) {
                                sendNotice(`⚠️ [EU Console]: Specify what to toggle. Usage: !eu toggle [grid | sessiontimer | total]`);
                                return;
                            }

                            switch (targetElement) {
                                case 'grid':
                                case 'loot':
                                    this.manifestGrids.forEach(grid => {
                                        currentDisplay = window.getComputedStyle(grid).display;
                                        grid.style.display = currentDisplay === 'none' ? 'grid' : 'none';
                                        sendNotice(`👁️ [Overlay]: Manifest Data Grid display toggled.`);
                                    });
                                    break;

                                case 'sessiontimer':
                                case 'timer':
                                    this.timerElements.forEach(el => {
                                        const target = el.closest('#entropia-timer-row, .timer-wrapper, .widget-card, .card, .stat-box') || el.parentElement || el;
                                        currentDisplay = window.getComputedStyle(target).display;
                                        target.style.display = currentDisplay === 'none' ? 'block' : 'none';
                                        sendNotice(`👁️ [Overlay]: Session Run Timer visibility toggled.`);
                                    });
                                    break;

                                case 'grandtotal':
                                case 'total':
                                    this.grandTotalElements.forEach(el => {
                                        const target = el.closest('#entropia-total-row, .total-wrapper, .widget-card, .card') || el.parentElement.parentElement || el;
                                        currentDisplay = window.getComputedStyle(target).display;
                                        target.style.display = currentDisplay === 'none' ? 'flex' : 'none';
                                        sendNotice(`👁️ [Overlay]: Accumulator Grand Total counter visibility toggled.`);
                                    });
                                    break;

                                default:
                                    sendNotice(`❌ Layout target selector [${targetElement}] not found on widget canvas.`);
                            }
                            break;
                        }

                        case 'startsession':
                        case 'start':
                            if (!isAdmin) return;
                            this.startSession();
                            sendNotice(`🟢 [EU Tracker]: Log processing cycle initialized/resumed by @${user}.`);
                            break;

                        case 'pausesession':
                        case 'pause':
                            if (!isAdmin) return;
                            this.pauseSession();
                            sendNotice(`🟡 [EU Tracker]: Polling queues paused by @${user}. Data updates are held in suspension.`);
                            break;
                        case 'resumesession':
                        case 'resume':
                            if (!isAdmin) return;
                            this.resumeSession();
                            sendNotice(`🟢 [EU Tracker]: Log polling processing resumed by @${user}.`);
                            break;
                        case 'resetsession':
                        case 'reset':
                            if (!isAdmin) return;
                            this.resetSession();
                            sendNotice(`🔄 [EU Tracker]: Running metrics wiped out cleanly back to baseline.`);
                            break;

                        case 'stopsession':
                        case 'stop':
                            if (!isAdmin) return;
                            this.stopSession();
                            sendNotice(`🛑 [EU Tracker]: Ingestion loop closed out completely by @${user}.`);
                            break;

                        default:
                            sendNotice(`❌ Action option !eu ${subCommand} unknown on target sub-routing stack.`);
                    }
                }
            }
        ];
    }
 */

}