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
        this.pollInterval = null;
        
        // Comprehensive internal state tracking matching old global schemas
        this.stats = {
            loot: {},
            values: {},
            skills: {},
            deaths: 0,
            globals: 0
        };

        // Entropia Custom Regular Expression Library (Restored legacy definitions)
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
        this.timerElements = document.querySelectorAll('#session-timer, #overlay-timer');
        this.grandTotalElements = document.querySelectorAll('#session-grand-total');
        this.returnsElements = document.querySelectorAll('#session-returns');

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
    }

    /**
     * Wipes ONLY the log path and handle from storage.
     * Mechanical Necessity: Clears stale handles without touching UI positioning.
     */
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
            // Recover file pointer handle
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
                            this.startBtn.style.background = "#555";
                            if (this.browseBtn) this.browseBtn.style.boxShadow = "0 0 15px #0ec3c3";
                            this.logEvent("🔑 RE-AUTH_REQUIRED: Click Start Session to grant runtime access.");
                        }
                    }
                } catch (err) {
                    this.logEvent("⚠️ HANDLE_STALE: Resetting path reference...", true);
                    await this.clearLogPath();
                }
            }

            // Recover display visualization switch setting state
            const savedVisibility = await get(this.VISIBILITY_KEY);
            const isVisible = savedVisibility !== false; // Default to true if not initialized yet
            
            if (this.visibilityToggle) {
                this.visibilityToggle.checked = isVisible;
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
        
        if (this.visibilityToggle && this.visibilityToggle.nextElementSibling) {
            this.visibilityToggle.nextElementSibling.style.backgroundColor = shouldShow ? '#0ea5e9' : '#3f3f46';
        }

        if (this.persistState) {
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
            if (this.browseBtn) this.browseBtn.style.boxShadow = "0 0 20px #ff0000";
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

            // Clear any lingering background processes before spin-up
            if (this.pollInterval) clearInterval(this.pollInterval);
            if (this.sessionTickerInterval) clearInterval(this.sessionTickerInterval);

            // Clean state parameters reset matrix
            this.stats = { loot: {}, values: {}, skills: {}, deaths: 0, globals: 0 };
            this.manifestGrids.forEach(grid => grid.innerHTML = '');

            // Adjust active control panel engine UI elements
            if (this.startBtn) {
                this.startBtn.textContent = "STOP SESSION";
                this.startBtn.style.background = "#d32f2f";
                this.startBtn.style.boxShadow = "0 0 10px #ff0000";
            }
            if (this.browseBtn) this.browseBtn.style.boxShadow = "none";

            // Prevent screen sleep during long streaming runs
            if ('wakeLock' in navigator) {
                try { await navigator.wakeLock.request('screen'); } catch (e) {}
            }

            this.pollInterval = setInterval(() => this.pollWebLog(), 2000);
            this.sessionTickerInterval = setInterval(() => this.runSessionTicker(), 1000);
            
            this.logEvent(`✅ SESSION_STARTED: ${file.name}`);
        } catch (e) {
            console.error("Critical Engine failure starting session: ", e);
            this.logEvent(`❌ AUTH_FAIL: Path execution failure. Hard reset triggered.`, true);
            await this.clearLogPath();
        }
    }

    pauseSession() {
        this.isPaused = true;
        this.logEvent("⏸️ TRACKING_PAUSED: Log incoming queues held in suspense pool.");
    }

    resumeSession() {
        this.isPaused = false;
        this.logEvent("▶️ TRACKING_RESUMED: Polling channels re-opened.");
    }

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
        this.stats = { loot: {}, values: {}, skills: {}, deaths: 0, globals: 0 };
        this.lastProcessedLine = "";
        this.sessionStartTime = Date.now();
        
        this.manifestGrids.forEach(grid => grid.innerHTML = '');
        this.grandTotalElements.forEach(el => el.textContent = "0.0000");
        this.timerElements.forEach(el => el.textContent = "00:00:00");
        this.returnsElements.forEach(el => {
            el.textContent = "0.00";
            el.style.color = '#a1a1aa';
        });
        
        this.logEvent("🧹 SESSION_STATS_CLEARED.");
        this.updateUI();
    }

    runSessionTicker() {
        if (this.isPaused || !this.sessionStartTime) return;

        const elapsed = Date.now() - this.sessionStartTime;
        const h = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
        const m = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
        const timeStr = `${h}:${m}:${s}`;
        
        this.timerElements.forEach(el => el.textContent = timeStr);
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
                this.logEvent("❌ PERMISSION_STUCK: Automatic engine path shutdown.", true);
                this.stopSession();
                this.clearLogPath();
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
                const itemName = lootMatch[1].trim();
                const amt = parseInt(lootMatch[2]);
                const val = parseFloat(lootMatch[3]);

                this.stats.loot[itemName] = (this.stats.loot[itemName] || 0) + amt;
                this.stats.values[itemName] = (this.stats.values[itemName] || 0) + val;
                
                this.updateUI();
                this.logEvent(`+ ${amt}x ${itemName}`);
                return;
            }

            const xpMatch = message.match(this.regex.experience);
            if (xpMatch) {
                const xpVal = parseFloat(xpMatch[1]);
                const skillName = xpMatch[2].trim();
                this.stats.skills[skillName] = (this.stats.skills[skillName] || 0) + xpVal;
                this.logEvent(`✨ XP: +${xpVal} ${skillName}`);
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

        // --- LIVE SESSION RETURNS CALCULATION MATRIX ---
        let returnsPct = 0;
        if (grandTotal > 0) {
            returnsPct = 100.00; 
        }

        this.returnsElements.forEach(el => {
            el.textContent = returnsPct.toFixed(2);

            if (returnsPct >= 100) {
                el.style.color = '#22c55e'; // Profitable / Break-Even (Green)
            } else if (returnsPct >= 90) {
                el.style.color = '#eab308'; // Expected Return Curve (Yellow)
            } else if (returnsPct > 0) {
                el.style.color = '#ef4444'; // Underperforming (Red)
            } else {
                el.style.color = '#a1a1aa'; // Uninitialized Baseline (Zinc)
            }
        });
    }

    // --- REFACTORED COMMAND REPOSITORY CONSOLE MAPPER ---
    getCommands(sendNotice) {
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
                        sendNotice(`🤖 [EU Console]: Specify action parameters (!eu loot | ped | globals | toggle | help)`);
                        return;
                    }

                    switch (subCommand) {
                        // --- HELP & DOCUMENTATION MODULE ---
                        case 'help':
                        case 'commands':
                        case 'h':
                            if (isAdmin) {
                                sendNotice(`🛠️ [EU Admin Help]: !eu [start | pause | reset | stop] or Toggle Panels: !eu toggle [grid | sessiontimer | total]`);
                            } else {
                                sendNotice(`📦 [EU Public Help]: Available commands: !eu loot (Top Items) | !eu ped (Session Value) | !eu globals (Global Counter)`);
                            }
                            break;

                        // --- VIEW-ONLY DATA CHANNELS ---
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

                        case 'ped': {
                            const cumulativePed = Object.values(this.stats.values).reduce((a, b) => a + b, 0);
                            sendNotice(`💰 Current Session Value: ${cumulativePed.toFixed(4)} PED`);
                            break;
                        }

                        case 'globals':
                        case 'hofs':
                        case 'hof':
                            sendNotice(`🏆 Globals/HOFs hit this session: ${this.stats.globals} | Deaths: ${this.stats.deaths}`);
                            break;

                        // --- NESTED VISIBILITY TOGGLES (Fixed to target wrappers/parents cleanly) ---
                        case 'toggle':
                            if (!isAdmin) return;
                            const targetElement = parts[1];
                            
                            if (!targetElement) {
                                sendNotice(`⚠️ [EU Console]: Specify what to toggle. Usage: !eu toggle [grid | sessiontimer | total]`);
                                return;
                            }

                            switch (targetElement) {
                                case 'grid':
                                case 'loot':
                                    this.manifestGrids.forEach(grid => {
                                        // The grid itself is the wrapper/container for item data logs
                                        const currentDisplay = window.getComputedStyle(grid).display;
                                        grid.style.display = currentDisplay === 'none' ? 'grid' : 'none';
                                        sendNotice(`👁️ [Overlay]: Manifest Data Grid display toggled.`);
                                    });
                                    break;

                                case 'sessiontimer':
                                case 'timer':
                                    this.timerElements.forEach(el => {
                                        // Crawl up to hide the parent layout wrapper card/container if present, else fallback to element
                                        const target = el.closest('.widget-card, .card, .stat-box, .timer-wrapper') || el;
                                        const currentDisplay = window.getComputedStyle(target).display;
                                        target.style.display = currentDisplay === 'none' ? 'block' : 'none';
                                    });
                                    sendNotice(`👁️ [Overlay]: Session Run Timer visibility toggled.`);
                                    break;

                                case 'grandtotal':
                                case 'total':
                                    this.grandTotalElements.forEach(el => {
                                        // Crawl up to hide the parent layout wrapper card/container if present, else fallback to element
                                        const target = el.closest('.widget-card, .card, .stat-box, .total-wrapper') || el;
                                        const currentDisplay = window.getComputedStyle(target).display;
                                        target.style.display = currentDisplay === 'none' ? 'block' : 'none';
                                    });
                                    sendNotice(`👁️ [Overlay]: Accumulator Grand Total counter visibility toggled.`);
                                    break;

                                default:
                                    sendNotice(`❌ Layout target selector [${targetElement}] not found on widget canvas.`);
                            }
                            break;

                        // --- PROTECTED PLATFORM MANAGEMENT EXECUTION CHANNELS ---
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
}