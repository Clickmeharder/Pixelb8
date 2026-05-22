import { addLog, state } from './newapp.js';
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
        
        // Internal state
        this.stats = {
            loot: {},
            values: {},
            skills: {},
            deaths: 0,
            globals: 0
        };

        this.initDOM();
    }

    initDOM() {
        this.startBtn = document.getElementById('start-session-btn');
        this.browseBtn = document.getElementById('browseBtn');
        this.manifestGrid = document.getElementById('manifest-grid');
        this.pathInput = document.getElementById('pathInput');
        
        if (this.browseBtn) this.browseBtn.addEventListener('click', () => this.handleBrowse());
        if (this.startBtn) this.startBtn.addEventListener('click', () => this.toggleSession());
    }

    async handleBrowse() {
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{ description: 'Entropia Log', accept: { 'text/plain': ['.log'] } }],
                multiple: false
            });
            await set(this.FILE_HANDLE_KEY, handle);
            this.fileHandle = handle;
            if(this.pathInput) this.pathInput.value = handle.name;
            addLog(`📂 LOG_LINKED: ${handle.name}`);
        } catch (err) {
            addLog("❌ PICKER_CANCELLED");
        }
    }

    async toggleSession() {
        if (this.startBtn.textContent === "STOP SESSION") {
            this.stopSession();
        } else {
            this.startSession();
        }
    }

    async startSession() {
        if (!this.fileHandle) {
            addLog("❌ ERROR: Link Chat.log first!");
            return;
        }

        try {
            const perm = await this.fileHandle.requestPermission({ mode: 'read' });
            if (perm !== 'granted') return;

            const file = await this.fileHandle.getFile();
            this.lastSize = file.size;
            this.sessionStartTime = Date.now();
            
            this.startBtn.textContent = "STOP SESSION";
            this.pollInterval = setInterval(() => this.pollWebLog(), 2000);
            addLog("✅ SESSION_STARTED");
        } catch (e) {
            addLog("❌ AUTH_FAIL: Re-link log.");
        }
    }

    stopSession() {
        clearInterval(this.pollInterval);
        this.startBtn.textContent = "START SESSION";
        addLog("🛑 SESSION_STOPPED");
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
            }
        } catch (err) {
            if (++this.errorCount >= this.MAX_RETRIES) this.stopSession();
        }
    }

    parseLine(line) {
        // Regex logic encapsulated
        const lootMatch = line.match(/You received\s+\[?(.+?)\]?\s+x\s+\((\d+)\)\s+Value:\s*([\d.]+)\s*PED/i);
        if (lootMatch) {
            const [_, name, amt, val] = lootMatch;
            this.stats.loot[name] = (this.stats.loot[name] || 0) + parseInt(amt);
            this.stats.values[name] = (this.stats.values[name] || 0) + parseFloat(val);
            this.updateUI();
            addLog(`+ ${amt}x ${name}`);
        }
        // Add other regex matches here (XP, Global, etc.)
    }

    updateUI() {
        if (!this.manifestGrid) return;
        // Logic to update DOM nodes inside the widget
    }
	console.log("entropia-widget.js version 0.001 finished loading");
}