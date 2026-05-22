import { get, set, del } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

export class EntropiaWidget {
    constructor() {
        this.FILE_HANDLE_KEY = "entropia_chat_handle";
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

        this.initDOM();
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
        this.startBtn = document.getElementById('start-session-btn');
        this.browseBtn = document.getElementById('browseBtn');
        this.manifestGrid = document.getElementById('manifest-grid');
        this.pathInput = document.getElementById('pathInput');
        this.timerEl = document.getElementById('session-timer');
        
        if (this.browseBtn) this.browseBtn.addEventListener('click', () => this.handleBrowse());
        if (this.startBtn) this.startBtn.addEventListener('click', () => this.toggleSession());
    }

    async recoverSavedHandle() {
        try {
            const savedHandle = await get(this.FILE_HANDLE_KEY);
            if (savedHandle) {
                this.fileHandle = savedHandle;
                if (this.pathInput) this.pathInput.value = savedHandle.name;
                this.logEvent(`💾 AUTO_RECOVERY: Linked to ${savedHandle.name.toUpperCase()}`);
            }
        } catch (e) {
            console.error("Failed to recover log file handle:", e);
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
        if (this.startBtn.textContent === "STOP SESSION") {
            this.stopSession();
        } else {
            this.startSession();
        }
    }

    async startSession() {
        if (!this.fileHandle) {
            this.logEvent("❌ ERROR: Link Chat.log first!", true);
            return;
        }

        try {
            const perm = await this.fileHandle.requestPermission({ mode: 'read' });
            if (perm !== 'granted') {
                this.logEvent("❌ PERMISSION_DENIED", true);
                return;
            }

            const file = await this.fileHandle.getFile();
            this.lastSize = file.size;
            this.sessionStartTime = Date.now();
            this.isPaused = false;

            // Reset Internal Data Pools
            this.stats = { loot: {}, values: {}, skills: {}, deaths: 0, globals: 0 };
            if (this.manifestGrid) this.manifestGrid.innerHTML = '';

            // Engine Active UI Adjustments
            this.startBtn.textContent = "STOP SESSION";
            this.startBtn.style.background = "#d32f2f";

            // Start Tickers and Fast File Polling loops
            this.pollInterval = setInterval(() => this.pollWebLog(), 2000);
            this.sessionTickerInterval = setInterval(() => this.runSessionTicker(), 1000);
            
            this.logEvent(`✅ SESSION_STARTED: ${file.name}`);
        } catch (e) {
            this.logEvent("❌ AUTH_FAIL: Path reset.", true);
        }
    }

    stopSession() {
        clearInterval(this.pollInterval);
        clearInterval(this.sessionTickerInterval);
        if (this.startBtn) {
            this.startBtn.textContent = "START SESSION";
            this.startBtn.style.background = "#2e7d32";
        }
        this.logEvent("🛑 SESSION_STOPPED");
    }

    runSessionTicker() {
        if (this.isPaused || !this.sessionStartTime) return;

        const elapsed = Date.now() - this.sessionStartTime;
        const h = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
        const m = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
        
        if (this.timerEl) this.timerEl.textContent = `${h}:${m}:${s}`;
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
            // 1. Loot Processing Rule
            const lootMatch = message.match(this.regex.loot);
            if (lootMatch) {
                const [__, name, amt, val] = lootMatch;
                const itemName = name.trim();
                this.stats.loot[itemName] = (this.stats.loot[itemName] || 0) + parseInt(amt);
                this.stats.values[itemName] = (this.stats.values[itemName] || 0) + parseFloat(val);
                this.logEvent(`+ ${amt}x ${itemName}`);
                return;
            }

            // 2. Experience Gain Processing Rule
            const xpMatch = message.match(this.regex.experience);
            if (xpMatch) {
                const [__, xpVal, skillName] = xpMatch;
                const sName = skillName.trim();
                this.stats.skills[sName] = (this.stats.skills[sName] || 0) + parseFloat(xpVal);
                this.logEvent(`✨ XP: +${xpVal} ${sName}`);
                return;
            }

            // 3. Death Processing Rule
            if (message.includes("You have been killed") || message.includes("You died")) {
                this.stats.deaths++;
                this.logEvent("💀 DEATH REGISTERED");
                return;
            }
        }

        // 4. Global Broadcast Rule
        if (channel === 'Globals' && this.regex.globalHof.test(message)) {
            this.stats.globals++;
            this.logEvent(`🏆 GLOBAL: ${message}`);
        }
    }

    updateUI() {
        if (!this.manifestGrid || !this.sessionStartTime) return;

        let grandTotal = 0;
        const elapsedHours = (Date.now() - this.sessionStartTime) / 3600000;

        Object.keys(this.stats.loot).forEach(key => {
            const count = this.stats.loot[key] || 0;
            const totalValue = this.stats.values[key] || 0;
            grandTotal += totalValue;

            const safeKey = key.replace(/\s+/g, '-');
            let sessionEl = document.getElementById(`session-${safeKey}`);
            
            if (!sessionEl) {
                const row = document.createElement('div');
                row.className = 'manifest-row';
                row.innerHTML = `
                    <span class="m-name">${key.toUpperCase()}</span>
                    <span class="m-count" id="session-${safeKey}">0</span>
                    <span class="m-rate" id="rate-${safeKey}">0/hr</span>
                    <span class="m-val" id="val-${safeKey}">(0.0000)</span>
                `;
                this.manifestGrid.appendChild(row);
                sessionEl = document.getElementById(`session-${safeKey}`);
            }

            if (sessionEl) {
                sessionEl.textContent = count;
                const valEl = document.getElementById(`val-${safeKey}`);
                if (valEl) valEl.textContent = `(${totalValue.toFixed(4)})`;

                const rateEl = document.getElementById(`rate-${safeKey}`);
                if (rateEl) {
                    const perHour = (count / Math.max(0.01, elapsedHours)).toFixed(1);
                    rateEl.textContent = `${perHour}/hr`;
                }
            }
        });

        const totalEl = document.getElementById('session-grand-total');
        if (totalEl) totalEl.textContent = grandTotal.toFixed(4);
    }
}

console.log("entropia-widget.js version 0.002 finished loading without external dependencies!");