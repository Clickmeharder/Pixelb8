import { get, set, del } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

export class EntropiaWidget {
    constructor() {
        this.FILE_HANDLE_KEY = "entropia_chat_handle";
        this.VISIBILITY_KEY = "entropia_overlay_visible";
        this.fileHandle = null;
        this.lastSize = 0;
        this.lastProcessedLine = "";
        this.errorCount = 0;
        this.MAX_RETRIES = 5;
        this.isPaused = false;
        this.sessionStartTime = null;
        this.sessionTickerInterval = null;
        
        // Comprehensive internal state tracking
        this.stats = {
            loot: {},
            values: {},
            skills: {},
            deaths: 0,
            globals: 0
        };

        // Entropia Custom Regular Expression Library
        this.regex = {
            logLine: /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[([^\]]+)\]\s*(.*)$/,
            loot: /You received\s+\[?(.+?)\]?\s+x\s+\((\d+)\)\s+Value:\s*([\d.]+)\s*PED/i,
            experience: /You have gained\s+([\d.]+)\s+experience in your (.+) skill/i,
            globalHof: /Hall of Fame|Rare Item|ATH/i
        };

        // Delay DOM binding until the page layout is completely stable
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initDOM());
        } else {
            this.initDOM();
        }

        this.recoverSavedHandle();
    }

    // Helper method to log events directly inside our widget system
    logEvent(message, isWarning = false) {
        if (isWarning) {
            console.warn(`[Entropia Widget]: ${message}`);
        } else {
            console.log(`[Entropia Widget]: ${message}`);
        }
    }

    initDOM() {
        this.logEvent("🔌 Initializing decoupled architecture (Manager Controls -> Dual Display Outputs)...");

        // 1. Interactive Core Controls (Expected strictly inside your Widgets Manager panel)
        this.browseBtn = document.getElementById('browseBtn');
        this.startBtn = document.getElementById('start-session-btn');
        this.resetBtn = document.getElementById('btnReset');
        this.pathInput = document.getElementById('pathInput');
        this.visibilityToggle = document.getElementById('entropia-visibility-toggle');

        // Target stream overlay widget wrapper node strictly outside of inputs context
        this.overlayWidgetContainer = document.querySelector('#overlay-wrapper #entropia-widget') || document.getElementById('entropia-widget');

        // 2. Dual Broadcast UI Viewports (Updates both the Manager Panel and the Twitch Overlay simultaneously)
        this.manifestGrids = document.querySelectorAll('#manifest-grid');
        this.timerElements = document.querySelectorAll('#session-timer');
        this.grandTotalElements = document.querySelectorAll('#session-grand-total');

        // Event Attachment Verification
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
                this.resetSession();
            });
        }

        if (this.visibilityToggle) {
            this.visibilityToggle.addEventListener('change', (e) => {
                this.handleVisibilityChange(e.target.checked);
            });
        } else {
            console.warn("⚠️ [Entropia Widget]: #entropia-visibility-toggle not found in DOM.");
        }
    }

    async recoverSavedHandle() {
        try {
            // Recover file pointer handle
            const savedHandle = await get(this.FILE_HANDLE_KEY);
            if (savedHandle) {
                this.fileHandle = savedHandle;
                if (this.pathInput) this.pathInput.value = savedHandle.name;
                this.logEvent(`💾 AUTO_RECOVERY: Restored link pointer to ${savedHandle.name.toUpperCase()}`);
            }

            // Recover display visualization switch setting state
            const savedVisibility = await get(this.VISIBILITY_KEY);
            const isVisible = savedVisibility !== false; // Default to true if not initialized yet
            
            if (this.visibilityToggle) {
                this.visibilityToggle.checked = isVisible;
                // Run background updates on slider elements if styled manually
                const slider = this.visibilityToggle.nextElementSibling;
                if (slider) slider.style.backgroundColor = isVisible ? '#0ea5e9' : '#3f3f46';
            }
            this.handleVisibilityChange(isVisible, false);

        } catch (e) {
            console.error("Failed to recover persistent initialization configurations:", e);
        }
    }

    handleVisibilityChange(shouldShow, persistState = true) {
        if (this.overlayWidgetContainer) {
            this.overlayWidgetContainer.style.display = shouldShow ? 'block' : 'none';
            this.logEvent(`Visibility configuration applied: ${shouldShow ? 'VISIBLE' : 'HIDDEN'}`);
        }
        
        // Dynamically style custom background trackers for manual sliders
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
        } catch (err) {
            this.logEvent("❌ PICKER_CANCELLED", true);
        }
    }

    async toggleSession() {
        if (!this.startBtn) return;
        if (this.pollInterval) {
            this.stopSession();
        } else {
            this.startSession();
        }
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
            alert("Please click 'LINK LOG' first to select your Entropia Chat.log file.");
            return;
        }

        try {
            const hasPermission = await this.verifyPermission();
            if (!hasPermission) {
                this.logEvent("❌ PERMISSION_DENIED: Browser blocked sandbox file-read.", true);
                alert("Browser access denied. Please click 'LINK LOG' again to authorize folder polling.");
                return;
            }

            const file = await this.fileHandle.getFile();
            this.lastSize = file.size;
            this.sessionStartTime = Date.now();
            this.isPaused = false;

            // Clear data matrices on clean run initialization
            this.stats = { loot: {}, values: {}, skills: {}, deaths: 0, globals: 0 };
            this.manifestGrids.forEach(grid => grid.innerHTML = '');

            // Adjust active engine control panel configurations
            if (this.startBtn) {
                this.startBtn.textContent = "STOP SESSION";
                this.startBtn.style.background = "#d32f2f";
            }

            this.pollInterval = setInterval(() => this.pollWebLog(), 2000);
            this.sessionTickerInterval = setInterval(() => this.runSessionTicker(), 1000);
            
            this.logEvent(`✅ SESSION_STARTED: ${file.name}`);
        } catch (e) {
            console.error("Critical Engine failure starting session: ", e);
            this.logEvent(`❌ AUTH_FAIL: Path execution failure.`, true);
        }
    }

    stopSession() {
        clearInterval(this.pollInterval);
        clearInterval(this.sessionTickerInterval);
        this.pollInterval = null;
        this.sessionTickerInterval = null;

        if (this.startBtn) {
            this.startBtn.textContent = "START SESSION";
            this.startBtn.style.background = "#2e7d32";
        }
        this.logEvent("🛑 SESSION_STOPPED");
    }

    resetSession() {
        this.stats = { loot: {}, values: {}, skills: {}, deaths: 0, globals: 0 };
        this.lastProcessedLine = "";
        if (this.sessionStartTime) this.sessionStartTime = Date.now();
        
        this.manifestGrids.forEach(grid => grid.innerHTML = '');
        this.grandTotalElements.forEach(el => el.textContent = "0.0000");
        this.timerElements.forEach(el => el.textContent = "00:00:00");
        
        this.logEvent("🧹 SESSION_STATS_CLEARED.");
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
                    if (line.trim()) this.parseLine(line);
                });
                this.lastSize = file.size;
            } else if (file.size < this.lastSize) {
                this.logEvent("⚠️ ROTATION: Log shrink detected.", true);
                this.lastSize = file.size;
            }
            this.errorCount = 0;
        } catch (err) {
            if (++this.errorCount >= this.MAX_RETRIES) {
                this.logEvent("❌ PERMISSION_STUCK: Auto Stopping.", true);
                this.stopSession();
            }
        }
    }

    parseLine(line) {
        if (line === this.lastProcessedLine || !line.trim()) return;

        const logMatch = line.match(this.regex.logLine);
        if (!logMatch) return;

        const [_, timestamp, channel, message] = logMatch;
        this.lastProcessedLine = line;

        if (channel === 'System') {
            const lootMatch = message.match(this.regex.loot);
            if (lootMatch) {
                const [__, name, amt, val] = lootMatch;
                const itemName = name.trim();
                this.stats.loot[itemName] = (this.stats.loot[itemName] || 0) + parseInt(amt);
                this.stats.values[itemName] = (this.stats.values[itemName] || 0) + parseFloat(val);
                this.logEvent(`+ ${amt}x ${itemName}`);
                return;
            }

            const xpMatch = message.match(this.regex.experience);
            if (xpMatch) {
                const [__, xpVal, skillName] = xpMatch;
                const sName = skillName.trim();
                this.stats.skills[sName] = (this.stats.skills[sName] || 0) + parseFloat(xpVal);
                this.logEvent(`✨ XP: +${xpVal} ${sName}`);
                return;
            }

            if (message.includes("You have been killed") || message.includes("You died")) {
                this.stats.deaths++;
                this.logEvent("💀 DEATH REGISTERED");
                return;
            }
        }

        if (channel === 'Globals' && this.regex.globalHof.test(message)) {
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

            const safeKey = key.replace(/\s+/g, '-');
            
            // Loop updates across all matching display destinations (manager panel grid & overlay grid)
            this.manifestGrids.forEach(grid => {
                let sessionEl = grid.querySelector(`.session-${safeKey}`);
                
                if (!sessionEl) {
                    const row = document.createElement('div');
                    row.className = 'manifest-row';
                    row.innerHTML = `
                        <span class="m-name">${key.toUpperCase()}</span>
                        <span class="m-count session-${safeKey}">0</span>
                        <span class="m-rate rate-${safeKey}">0/hr</span>
                        <span class="m-val val-${safeKey}">(0.0000)</span>
                    `;
                    grid.appendChild(row);
                    sessionEl = grid.querySelector(`.session-${safeKey}`);
                }

                if (sessionEl) {
                    sessionEl.textContent = count;
                    const valEl = grid.querySelector(`.val-${safeKey}`);
                    if (valEl) valEl.textContent = `(${totalValue.toFixed(4)})`;

                    const rateEl = grid.querySelector(`.rate-${safeKey}`);
                    if (rateEl) {
                        const perHour = (count / Math.max(0.01, elapsedHours)).toFixed(1);
                        rateEl.textContent = `${perHour}/hr`;
                    }
                }
            });
        });

        this.grandTotalElements.forEach(el => el.textContent = grandTotal.toFixed(4));
    }
}