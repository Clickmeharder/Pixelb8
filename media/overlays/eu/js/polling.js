//<script type="module" src="js/polling.js"></script>
import { addLog, state, saveData } from './app.js';
import { get, set } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

// ===== Global State & References =====
let fileHandle = null; 
let lastSize = 0;
let pollInterval = null;
let sessionTickerInterval = null;
let lastProcessedLine = "";
let lastLogTimestamp = 0;
let errorCount = 0;
const MAX_RETRIES = 5;
const FILE_HANDLE_KEY = "entropia_chat_handle";

// Essential data objects for tracking session performance
const sessionStats = {}; 
const sessionValues = {};

// EXPOSE TO GLOBAL SCOPE for Twitch command access
window.sessionStats = sessionStats;
window.sessionValues = sessionValues;
window.sessionStartTime = Date.now(); 

// ===== UI Elements =====
const startBtn = document.getElementById('start-session-btn');
const resetBtn = document.getElementById('btnReset'); 
const browseBtn = document.getElementById('browseBtn');
const pathInput = document.getElementById('pathInput');

// ===== Persistence & Initialization =====

/**
 * Internal helper to set up the handle and UI.
 * Refactored to "Ready" state without auto-starting the poll.
 */
window.initializeFile = async function(handle) {
    if (!handle) return;
    fileHandle = handle; 
    
    try {
        const file = await fileHandle.getFile();
        if (pathInput) pathInput.value = file.name;
        
        // Update global app state
        state.logLinked = true;
        
        // Set UI to "Ready to Start" mode
        if (startBtn) {
            startBtn.textContent = "START SESSION";
            startBtn.style.background = "#2e7d32"; // Green for Ready
            startBtn.style.boxShadow = "0 0 10px #00ff00";
        }
        
        if (browseBtn) browseBtn.style.boxShadow = "none";
        addLog("💾 LOG_LINKED: " + file.name.toUpperCase());
    } catch (err) {
        addLog("❌ LINK_EXPIRED: CLICK 'LINK CHAT.LOG'", true);
        if (browseBtn) browseBtn.style.boxShadow = "0 0 15px #0ec3c3";
        console.error(err);
    }
};

// ===== UI Update Logic =====

function runSessionTicker() {
    const timerEl = document.getElementById('session-timer');
    if (timerEl) {
        const elapsed = Date.now() - window.sessionStartTime;
        const h = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
        const m = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
        const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
        timerEl.textContent = `${h}:${m}:${s}`;
    }
    updateSessionUI();
}

function updateSessionUI() {
    let grandTotal = 0;
    const now = Date.now();
    const elapsedMs = Math.max(1000, now - window.sessionStartTime); 
    const elapsedHours = elapsedMs / 3600000;

    Object.keys(sessionStats).forEach(key => {
        const count = sessionStats[key] || 0;
        const totalValue = sessionValues[key] || 0;
        grandTotal += totalValue;

        const safeKey = key.replace(/\s+/g, '-');
        const sessionEl = document.getElementById(`session-${safeKey}`);
        
        if (count > 0 && sessionEl) {
            sessionEl.textContent = count;
            const valEl = document.getElementById(`val-${safeKey}`);
            if (valEl) valEl.textContent = `(${totalValue.toFixed(4)})`;

            const rateEl = document.getElementById(`rate-${safeKey}`);
            if (rateEl) {
                const perHour = (count / elapsedHours).toFixed(1);
                rateEl.textContent = `${perHour}/hr`;
                rateEl.style.color = perHour > 0 ? "#00ffff" : "#444";
            }
        }
    });

    const totalEl = document.getElementById('session-grand-total');
    if (totalEl) totalEl.textContent = grandTotal.toFixed(4);
}

// ===== Polling & Parsing Core =====

window.pollWebLog = async function() {
    if (!fileHandle) return;
    try {
        const file = await fileHandle.getFile();
        if (file.size > lastSize) {
            const blob = file.slice(lastSize, file.size);
            const text = await blob.text();
            text.split(/\r?\n/).forEach(l => { 
                if (l.trim()) window.handleChatLine(l); 
            });
            lastSize = file.size;
        } else if (file.size < lastSize) {
            addLog("⚠️ SECURITY: Log shrink detected. Resetting pointer.", true);
            lastSize = file.size;
        }
        errorCount = 0;
    } catch (err) {
        errorCount++;
        if (errorCount >= MAX_RETRIES) {
            if (window.pollInterval) clearInterval(window.pollInterval);
            addLog("❌ SCOUT_HALTED: File access lost.", true);
        }
    }
};

window.handleChatLine = async function(line) {
    if (line === lastProcessedLine) return;

    const fishRegex = /^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s\[System\]\s+\[\]\s+You received\s+\[?(.*?)\]?\s+x\s+\((\d+)\)\s+Value:\s+([\d.]+)\s+PED/;
    const match = line.match(fishRegex);

    if (match) {
        const logTimeString = match[1];
        const fishType = match[2].trim(); 
        const amount = parseInt(match[3]);
        const value = parseFloat(match[4]);
        const currentLogTimestamp = new Date(logTimeString).getTime();

        const secondsBetweenLogs = (currentLogTimestamp - lastLogTimestamp) / 1000;
        if (lastLogTimestamp !== 0 && secondsBetweenLogs < 1) return; 

        if (!isNaN(value)) {
            lastLogTimestamp = currentLogTimestamp;
            lastProcessedLine = line; 

            if (!(fishType in sessionStats)) {
                sessionStats[fishType] = 0;
                sessionValues[fishType] = 0;
            }
            
            sessionStats[fishType] += amount;
            sessionValues[fishType] += value;

            updateSessionUI();
            addLog(`🎣 CAUGHT: ${amount}x ${fishType}`);
        }
    }
};

// ===== Session Control Handlers =====

browseBtn.onclick = async () => {
    try {
        const [handle] = await window.showOpenFilePicker({
            types: [{ description: 'Entropia Log', accept: { 'text/plain': ['.log'] } }],
            multiple: false
        });
        
        // Save handle to IndexedDB for persistence across reloads
        await set(FILE_HANDLE_KEY, handle);
        await window.initializeFile(handle);
        
        if (browseBtn) browseBtn.style.boxShadow = "none";
        addLog(`📂 LOG_LINKED: SUCCESS`);
    } catch (err) {
        addLog("❌ PICKER_CANCELLED", true);
    }
};

startBtn.onclick = async () => {
    // 1. Logic for STOPPING
    if (startBtn.textContent === "STOP SESSION") {
        if (sessionTickerInterval) clearInterval(sessionTickerInterval);
        if (window.pollInterval) clearInterval(window.pollInterval);
        
        startBtn.textContent = "START SESSION";
        startBtn.style.background = "#2e7d32"; 
        startBtn.style.boxShadow = "0 0 10px #00ff00";
        addLog("🛑 SESSION_STOPPED.", true);
        return;
    }

    // 2. Logic for STARTING
    if (!fileHandle) {
        addLog("❌ ERROR: Link Chat.log first!", true);
        if (browseBtn) browseBtn.style.boxShadow = "0 0 15px #0ec3c3";
        return;
    }

    try {
        // Security: Request/Verify permission via user gesture
        const status = await fileHandle.requestPermission({ mode: 'read' });
        if (status !== 'granted') {
            addLog("❌ PERMISSION_DENIED", true);
            return;
        }

        const file = await fileHandle.getFile();
        lastSize = file.size; // Jump to the end to ignore historical data
        window.sessionStartTime = Date.now(); 

        // Clear existing intervals
        if (window.pollInterval) clearInterval(window.pollInterval);
        if (sessionTickerInterval) clearInterval(sessionTickerInterval);

        // Start fresh intervals
        window.pollInterval = setInterval(window.pollWebLog, 3000); 
        sessionTickerInterval = setInterval(runSessionTicker, 1000);

        // Reset Session Stats for the fresh start
        Object.keys(sessionStats).forEach(key => sessionStats[key] = 0);
        Object.keys(sessionValues).forEach(key => sessionValues[key] = 0);

        // UI Update to Running state
        startBtn.textContent = "STOP SESSION";
        startBtn.style.background = "#d32f2f"; 
        startBtn.style.boxShadow = "none";
        
        addLog(`✅ SESSION_STARTED: ${file.name}`);

        // Keep page active
        if ('wakeLock' in navigator) {
            try { await navigator.wakeLock.request('screen'); } catch(e){}
        }

    } catch (err) {
        addLog("❌ ACCESS_FAILED: Check permissions.", true);
        console.error(err);
    }
};

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        Object.keys(sessionStats).forEach(key => delete sessionStats[key]);
        Object.keys(sessionValues).forEach(key => delete sessionValues[key]);
        window.sessionStartTime = Date.now();
        addLog("🧹 SESSION_STATS_CLEARED.");
    });
}

// ===== Initial Startup =====
window.addEventListener('DOMContentLoaded', () => {
    if (pathInput) pathInput.placeholder = "Link Chat.log to begin...";
});