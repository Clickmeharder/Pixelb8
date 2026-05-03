//<script type="module" src="js/polling.js"></script>

// ===== Global State & References =====
let fileHandle = null; 
let lastSize = 0;
let pollInterval = null;
let sessionTickerInterval = null;
let lastProcessedLine = "";
let lastLogTimestamp = 0;
let errorCount = 0;
const MAX_RETRIES = 5;

// Essential data objects for tracking session performance[cite: 4]
const sessionStats = {}; 
const sessionValues = {};
window.sessionStartTime = Date.now(); 

// ===== UI Update Logic[cite: 4] =====

/**
 * Updates the visual clock and triggers the rate recalculations.
 */
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

/**
 * Calculates /hr rates and updates all dynamic session rows.
 */
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
        const rowEl = document.getElementById(`row-${safeKey}`);
        
        if (count > 0 && rowEl) {
            // Update Counts
            const sessionEl = document.getElementById(`session-${safeKey}`);
            if (sessionEl) sessionEl.textContent = count;

            // Update PED Value
            const valEl = document.getElementById(`val-${safeKey}`);
            if (valEl) valEl.textContent = `(${totalValue.toFixed(4)})`;

            // Update Rate per Hour
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

// ===== Polling & Parsing Core[cite: 1, 4] =====

/**
 * Browser-based log poller using File System Access API.
 */
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

/**
 * High-performance regex parsing for chat.log lines[cite: 1].
 */
window.handleChatLine = async function(line) {
    if (line === lastProcessedLine) return;

    // Strict regex for Entropia System messages regarding loot/catches[cite: 4]
    const fishRegex = /^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s\[System\]\s+\[\]\s+You received\s+\[?(.*?)\]?\s+x\s+\((\d+)\)\s+Value:\s+([\d.]+)\s+PED/;
    const match = line.match(fishRegex);

    if (match) {
        const logTimeString = match[1];
        const fishType = match[2].trim(); 
        const amount = parseInt(match[3]);
        const value = parseFloat(match[4]);
        const currentLogTimestamp = new Date(logTimeString).getTime();

        // Anti-spam filter for simultaneous log entries[cite: 4]
        const secondsBetweenLogs = (currentLogTimestamp - lastLogTimestamp) / 1000;
        if (lastLogTimestamp !== 0 && secondsBetweenLogs < 1) return; 

        if (!isNaN(value)) {
            lastLogTimestamp = currentLogTimestamp;
            lastProcessedLine = line; 

            if (!(fishType in sessionStats)) {
                sessionStats[fishType] = 0;
                sessionValues[fishType] = 0;
            }
            
            const safeKey = fishType.replace(/\s+/g, '-');
            if (!document.getElementById(`row-${safeKey}`)) {
                if (typeof createDynamicRow === 'function') createDynamicRow(fishType);
            }

            sessionStats[fishType] += amount;
            sessionValues[fishType] += value;

            if (typeof updateSessionUI === 'function') updateSessionUI();
            addLog(`🎣 CAUGHT: ${amount}x ${fishType}`);
        }
    }
};

// ===== Storage & Persistence[cite: 4] =====

async function saveFileHandle(handle) {
    const db = await initDB();
    const tx = db.transaction('settings', 'readwrite');
    tx.objectStore('settings').put(handle, 'logFileHandle');
    return tx.complete;
}

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('PixelB8_Storage', 1);
        request.onupgradeneeded = (e) => e.target.result.createObjectStore('settings');
        request.onsuccess = (e) => resolve(e.target.result);
        request.onerror = (e) => reject(e.error);
    });
}

/**
 * Wake Lock to prevent the OBS browser source from throttling[cite: 4].
 */
async function requestWakeLock() {
    try {
        if ('wakeLock' in navigator) {
            let wakeLock = await navigator.wakeLock.request('screen');
            addLog("🌙 WAKE_LOCK: Engaged. Preventing sleep throttling.");
            wakeLock.addEventListener('release', () => console.log('Wake Lock released'));
        }
    } catch (err) {
        console.warn("Wake Lock failed:", err);
    }
}

// ===== Session Control Handlers[cite: 4] =====

const startBtn = document.getElementById('start-session-btn'); // Ensure this ID matches your HTML

startBtn.onclick = async () => {
    if (startBtn.textContent === "STOP SESSION") {
        if (sessionTickerInterval) clearInterval(sessionTickerInterval);
        if (window.pollInterval) clearInterval(window.pollInterval);
        
        startBtn.textContent = "START SESSION";
        startBtn.style.background = ""; 
        startBtn.style.opacity = "1.0";
        addLog("🛑 SESSION_STOPPED.", true);
        return;
    }

    window.sessionStartTime = Date.now(); 
    
    // Reset local session trackers
    Object.keys(sessionStats).forEach(key => sessionStats[key] = 0);
    Object.keys(sessionValues).forEach(key => sessionValues[key] = 0);

    try {
        if (!fileHandle) {
            const pickerResult = await window.showOpenFilePicker({
                types: [{ description: 'Entropia Log', accept: { 'text/plain': ['.log'] } }],
                multiple: false
            });
            fileHandle = pickerResult[0];
            await saveFileHandle(fileHandle);
        } else {
            const opts = { mode: 'read' };
            if (await fileHandle.queryPermission(opts) !== 'granted') {
                if (await fileHandle.requestPermission(opts) !== 'granted') throw new Error("Permission denied");
            }
        }
        
        const file = await fileHandle.getFile();
        lastSize = file.size; 
        
        if (window.pollInterval) clearInterval(window.pollInterval);
        window.pollInterval = setInterval(window.pollWebLog, 3000); 
        
        await requestWakeLock();
        addLog("📡 CHAT_LOG: Bound and Polling.");
    } catch (err) {
        addLog("❌ ACCESS_FAILED: Check permissions.", true);
        return;
    }

    if (sessionTickerInterval) clearInterval(sessionTickerInterval);
    sessionTickerInterval = setInterval(runSessionTicker, 1000);

    startBtn.textContent = "STOP SESSION";
    startBtn.style.background = "#d32f2f"; 
    addLog(`✅ WATCHER_ENGAGED`);
};

const resetBtn = document.getElementById('reset-session-btn');

resetBtn.onclick = () => {
    if (!confirm("Wipe session counts?")) return;

    Object.keys(sessionStats).forEach(key => sessionStats[key] = 0);
    Object.keys(sessionValues).forEach(key => sessionValues[key] = 0);
    window.sessionStartTime = Date.now();

    const container = document.getElementById('manifest-grid');
    if (container) container.innerHTML = ''; 

    if (document.getElementById('session-grand-total')) document.getElementById('session-grand-total').textContent = "0.0000";
    if (document.getElementById('session-timer')) document.getElementById('session-timer').textContent = "00:00:00";

    addLog("🧹 SESSION_RESET.");
};

// ===== Initial Startup[cite: 4] =====

window.addEventListener('DOMContentLoaded', () => {
    const pathInput = document.getElementById('pathInput'); // Adjust ID as needed
    if (pathInput) pathInput.placeholder = "Click START to link Chat.log";
});