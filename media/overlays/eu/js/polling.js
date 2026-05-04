/**
 * polling.js - Sovereign Entropia Log Parser & Session Tracker
 * Version: 0.03 - Security & High-Density UI Refactor
 * Specialized for high-density log analysis and Twitch-integrated overlays.
 */

import { addLog, state, saveData } from './app.js';
import { get, set } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

// ==========================================================================
// 1. GLOBAL STATE & REFERENCES
// ==========================================================================
let fileHandle = null; 
let lastSize = 0;
let pollInterval = null;
let sessionTickerInterval = null;
let lastProcessedLine = "";
let errorCount = 0;
const MAX_RETRIES = 5;
const FILE_HANDLE_KEY = "entropia_chat_handle";

// Performance tracking objects
const sessionStats = {}; 
const sessionValues = {};

// Expose to global scope for Twitch/External Command access (comfyEU.js)
window.sessionStats = sessionStats;
window.sessionValues = sessionValues;
window.sessionStartTime = Date.now(); 

// ==========================================================================
// 2. REGEX LIBRARY (Entropia Universe Specific)
// ==========================================================================
const timestampChannelMessageRegex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[([^\]]+)\]\s*(.*)$/;
const lootDetailsRegex = /You received\s+\[?(.+?)\]?\s+x\s+\((\d+)\)\s+Value:\s*([\d.]+)\s*PED/i;
const experienceRegex = /You have gained\s+([\d.]+)\s+experience in your (.+) skill/i;
const sweatRegex = /You received.*Vibrant Sweat/;
const globalValueRegex = /with a value of ([\d,.]+) PED/i;
const globalHofRegex = /Hall of Fame|Rare Item|ATH/i;

// ==========================================================================
// 3. UI ELEMENT SELECTION
// ==========================================================================
const startBtn = document.getElementById('start-session-btn');
const resetBtn = document.getElementById('btnReset'); 
const browseBtn = document.getElementById('browseBtn');
const pathInput = document.getElementById('pathInput');
const manifestGrid = document.getElementById('manifest-grid');

// ==========================================================================
// 4. PERSISTENCE & INITIALIZATION
// ==========================================================================

/**
 * Restores reference from IDB. Does NOT call getFile() to avoid NotAllowedError.
 */
window.initializeFile = async function(handle) {
    if (!handle) return;
    fileHandle = handle; 
    
    // Update path input with name only (safe for auto-boot)
    if (pathInput) pathInput.value = fileHandle.name;
    
    // Update global app state
    state.logLinked = true;
    
    if (startBtn) {
        startBtn.textContent = "START SESSION";
        startBtn.style.background = "#2e7d32"; 
        startBtn.style.boxShadow = "0 0 10px #00ff00";
    }
    
    addLog(`💾 LOG_LINK_READY: ${fileHandle.name.toUpperCase()}`);
};

// ==========================================================================
// 5. UI UPDATE & TICKER LOGIC
// ==========================================================================

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
 * High-Density UI: Creates grid rows on the fly for new loot types.
 */
function updateSessionUI() {
    let grandTotal = 0;
    const now = Date.now();
    const elapsedHours = (now - window.sessionStartTime) / 3600000;

    Object.keys(sessionStats).forEach(key => {
        const count = sessionStats[key] || 0;
        const totalValue = sessionValues[key] || 0;
        grandTotal += totalValue;

        const safeKey = key.replace(/\s+/g, '-');
        let sessionEl = document.getElementById(`session-${safeKey}`);
        
        // Create row if it doesn't exist
        if (!sessionEl && manifestGrid) {
            const row = document.createElement('div');
            row.className = 'manifest-row';
            row.innerHTML = `
                <span class="m-name">${key.toUpperCase()}</span>
                <span class="m-count" id="session-${safeKey}">0</span>
                <span class="m-rate" id="rate-${safeKey}">0/hr</span>
                <span class="m-val" id="val-${safeKey}">(0.0000)</span>
            `;
            manifestGrid.appendChild(row);
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

// ==========================================================================
// 6. POLLING & PARSING CORE
// ==========================================================================

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
            addLog("⚠️ ROTATION: Log shrink detected. Pointer reset.", true);
            lastSize = file.size;
        }
        errorCount = 0;
    } catch (err) {
        errorCount++;
        if (errorCount >= MAX_RETRIES) {
            clearInterval(window.pollInterval);
            addLog("❌ ACCESS_LOST: Check browser permissions.", true);
        }
    }
};

window.handleChatLine = function(line) {
    if (line === lastProcessedLine || !line.trim()) return;

    const logMatch = line.match(timestampChannelMessageRegex);
    if (!logMatch) return;

    const [_, timestamp, channel, message] = logMatch;
    lastProcessedLine = line;

    if (channel === 'System') {
        const lootMatch = message.match(lootDetailsRegex);
        if (lootMatch) {
            const itemName = lootMatch[1].trim(); 
            const amount = parseInt(lootMatch[2]);
            const value = parseFloat(lootMatch[3]);

            if (!(itemName in sessionStats)) {
                sessionStats[itemName] = 0;
                sessionValues[itemName] = 0;
            }
            sessionStats[itemName] += amount;
            sessionValues[itemName] += value;
            updateSessionUI();
            addLog(`+ ${amount}x ${itemName}`);
            return;
        }

        const xpMatch = message.match(experienceRegex);
        if (xpMatch) {
            addLog(`✨ XP: +${xpMatch[1]} ${xpMatch[2]}`);
            return;
        }
    }

    if (channel === 'Globals' && globalHofRegex.test(message)) {
        addLog(`🏆 GLOBAL: ${message}`, false);
    }
};

// ==========================================================================
// 7. EVENT LISTENERS (Gestures for Permission)
// ==========================================================================

if (browseBtn) {
    browseBtn.addEventListener('click', async () => {
        try {
            const [handle] = await window.showOpenFilePicker({
                types: [{ description: 'Entropia Log', accept: { 'text/plain': ['.log'] } }],
                multiple: false
            });
            await set(FILE_HANDLE_KEY, handle);
            await window.initializeFile(handle);
            addLog(`📂 LOG_LINKED: SUCCESS`);
        } catch (err) {
            addLog("❌ PICKER_CANCELLED", true);
        }
    });
}

if (startBtn) {
    startBtn.addEventListener('click', async () => {
        if (startBtn.textContent === "STOP SESSION") {
            if (sessionTickerInterval) clearInterval(sessionTickerInterval);
            if (window.pollInterval) clearInterval(window.pollInterval);
            startBtn.textContent = "START SESSION";
            startBtn.style.background = "#2e7d32"; 
            addLog("🛑 SESSION_STOPPED.", true);
            return;
        }

        if (!fileHandle) {
            addLog("❌ ERROR: Link Chat.log first!", true);
            return;
        }

        try {
            // CRITICAL: Request permission inside the click event to avoid NotAllowedError
            const status = await fileHandle.requestPermission({ mode: 'read' });
            if (status !== 'granted') {
                addLog("❌ PERMISSION_DENIED", true);
                return;
            }

            const file = await fileHandle.getFile();
            lastSize = file.size; 
            window.sessionStartTime = Date.now(); 

            // Clear existing intervals
            if (window.pollInterval) clearInterval(window.pollInterval);
            if (sessionTickerInterval) clearInterval(sessionTickerInterval);

            // Start Tickers
            window.pollInterval = setInterval(window.pollWebLog, 2500); 
            sessionTickerInterval = setInterval(runSessionTicker, 1000);

            // Reset local stats
            Object.keys(sessionStats).forEach(k => delete sessionStats[k]);
            Object.keys(sessionValues).forEach(k => delete sessionValues[k]);
            if (manifestGrid) manifestGrid.innerHTML = '';

            startBtn.textContent = "STOP SESSION";
            startBtn.style.background = "#d32f2f"; 
            addLog(`✅ SESSION_STARTED: ${file.name}`);

            if ('wakeLock' in navigator) await navigator.wakeLock.request('screen');

        } catch (err) {
            addLog("❌ ACCESS_FAILED", true);
            console.error(err);
        }
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        Object.keys(sessionStats).forEach(k => delete sessionStats[k]);
        Object.keys(sessionValues).forEach(k => delete sessionValues[k]);
        if (manifestGrid) manifestGrid.innerHTML = '';
        window.sessionStartTime = Date.now();
        updateSessionUI();
        addLog("🧹 SESSION_STATS_CLEARED.");
    });
}

// ==========================================================================
// 8. INITIAL STARTUP
// ==========================================================================
window.addEventListener('DOMContentLoaded', async () => {
    // Check IndexedDB for previous file handle
    const savedHandle = await get(FILE_HANDLE_KEY);
    if (savedHandle) {
        await window.initializeFile(savedHandle);
    }
});

addLog("POLLING_ENGINE: V0.03 ONLINE");