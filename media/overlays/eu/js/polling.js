/**
 * newpolling.js - Sovereign Entropia Log Parser & Session Tracker
 * Version: 0.02 - No-Dependency / Vanilla JS 
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
let lastLogTimestamp = 0;
let errorCount = 0;
const MAX_RETRIES = 5;
const FILE_HANDLE_KEY = "entropia_chat_handle";

// Performance tracking objects
const sessionStats = {}; 
const sessionValues = {};

// Expose to global scope for Twitch/External Command access
window.sessionStats = sessionStats;
window.sessionValues = sessionValues;
window.sessionStartTime = Date.now(); 

// ==========================================================================
// 2. REGEX LIBRARY (Entropia Universe Specific)
// ==========================================================================
const timestampChannelMessageRegex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[([^\]]+)\]\s*(.*)$/;
const lootDetailsRegex = /You received\s+\[?(.+?)\]?\s+x\s+\((\d+)\)\s+Value:\s*([\d.]+)\s*PED/i;
const experienceRegex = /You have gained\s+([\d.]+)\s+experience in your (.+) skill/i;
const enhancerBreakRegex = /Your enhancer (.+?) on your (.+?) broke\. You have (\d+) enhancers remaining.*You received ([\d.]+) PED Shrapnel/i;
const pickupRegex = /Picked up (.+?)(?: \((\d+)\))?$/;
const globalValueRegex = /with a value of ([\d,.]+) PED/i;
const globalHofRegex = /Hall of Fame|Rare Item|ATH/i;
const sweatRegex = /You received.*Vibrant Sweat/;

// ==========================================================================
// 3. UI ELEMENT SELECTION
// ==========================================================================
const startBtn = document.getElementById('start-session-btn');
const resetBtn = document.getElementById('btnReset'); 
const browseBtn = document.getElementById('browseBtn');
const pathInput = document.getElementById('pathInput');

// ==========================================================================
// 4. PERSISTENCE & INITIALIZATION
// ==========================================================================

/**
 * Validates the file handle and updates the UI status
 */
window.initializeFile = async function(handle) {
    if (!handle) return;
    fileHandle = handle; 
    
    try {
        const file = await fileHandle.getFile();
        if (pathInput) pathInput.value = file.name;
        
        // Update global app state
        state.logLinked = true;
        
        if (startBtn) {
            startBtn.textContent = "START SESSION";
            startBtn.style.setProperty('--btn-bg', "#2e7d32"); // Sovereign CSS Variable usage
            startBtn.style.background = "#2e7d32"; 
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
                rateEl.style.color = perHour > 0 ? "var(--accent-cyan, #00ffff)" : "#444";
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
            
            // Standardizing line split to handle different OS line endings
            text.split(/\r?\n/).forEach(l => { 
                if (l.trim()) window.handleChatLine(l); 
            });
            lastSize = file.size;
        } else if (file.size < lastSize) {
            addLog("⚠️ SECURITY: Log shrink detected (possible log rotation). Resetting pointer.", true);
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
 * handleChatLine acts as the traffic controller for all log data
 */
window.handleChatLine = async function(line) {
    if (line === lastProcessedLine || !line.trim()) return;

    const logMatch = line.match(timestampChannelMessageRegex);
    if (!logMatch) return;

    const [_, timestamp, channel, message] = logMatch;
    lastProcessedLine = line;

    // --- SYSTEM CHANNEL ROUTER ---
    if (channel === 'System') {
        
        // 1. LOOT PARSING (Fishing, Mining, Combat Loot)
        const lootMatch = message.match(lootDetailsRegex);
        if (lootMatch) {
            const itemName = lootMatch[1].trim(); 
            const amount = parseInt(lootMatch[2]);
            const value = parseFloat(lootMatch[3]);

            if (!isNaN(value)) {
                if (!(itemName in sessionStats)) {
                    sessionStats[itemName] = 0;
                    sessionValues[itemName] = 0;
                }
                sessionStats[itemName] += amount;
                sessionValues[itemName] += value;

                updateSessionUI();
                addLog(`🎣 CAUGHT: ${amount}x ${itemName}`);
                return;
            }
        }

        // 2. XP PARSING
        const xpMatch = message.match(experienceRegex);
        if (xpMatch) {
            const val = xpMatch[1];
            const skill = xpMatch[2];
            addLog(`✨ XP: +${val} in ${skill}`);
            return;
        }

        // 3. VIBRANT SWEAT PARSING
        if (sweatRegex.test(message)) {
            // Specialized logic for sweat collection if needed
            return;
        }
    }

    // --- GLOBALS CHANNEL ROUTER ---
    if (channel === 'Globals') {
        if (globalHofRegex.test(message)) {
            const valMatch = message.match(globalValueRegex);
            const value = valMatch ? valMatch[1] : "Unknown";
            addLog(`🏆 GLOBAL: ${message}`, false);
        }
    }
};

// ==========================================================================
// 7. SESSION CONTROL EVENT LISTENERS (NO-ONCLICK)
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
            
            browseBtn.style.boxShadow = "none";
            addLog(`📂 LOG_LINKED: SUCCESS`);
        } catch (err) {
            addLog("❌ PICKER_CANCELLED", true);
        }
    });
}

if (startBtn) {
    startBtn.addEventListener('click', async () => {
        // STOP Logic
        if (startBtn.textContent === "STOP SESSION") {
            if (sessionTickerInterval) clearInterval(sessionTickerInterval);
            if (window.pollInterval) clearInterval(window.pollInterval);
            
            startBtn.textContent = "START SESSION";
            startBtn.style.background = "#2e7d32"; 
            startBtn.style.boxShadow = "0 0 10px #00ff00";
            addLog("🛑 SESSION_STOPPED.", true);
            return;
        }

        // START Logic
        if (!fileHandle) {
            addLog("❌ ERROR: Link Chat.log first!", true);
            if (browseBtn) browseBtn.style.boxShadow = "0 0 15px #0ec3c3";
            return;
        }

        try {
            const status = await fileHandle.requestPermission({ mode: 'read' });
            if (status !== 'granted') {
                addLog("❌ PERMISSION_DENIED", true);
                return;
            }

            const file = await fileHandle.getFile();
            lastSize = file.size; // Pointer set to current end of log
            window.sessionStartTime = Date.now(); 

            if (window.pollInterval) clearInterval(window.pollInterval);
            if (sessionTickerInterval) clearInterval(sessionTickerInterval);

            window.pollInterval = setInterval(window.pollWebLog, 3000); 
            sessionTickerInterval = setInterval(runSessionTicker, 1000);

            // Reset session data
            Object.keys(sessionStats).forEach(key => delete sessionStats[key]);
            Object.keys(sessionValues).forEach(key => delete sessionValues[key]);

            startBtn.textContent = "STOP SESSION";
            startBtn.style.background = "#d32f2f"; 
            startBtn.style.boxShadow = "none";
            
            addLog(`✅ SESSION_STARTED: ${file.name}`);

            if ('wakeLock' in navigator) {
                try { await navigator.wakeLock.request('screen'); } catch(e){}
            }

        } catch (err) {
            addLog("❌ ACCESS_FAILED: Check permissions.", true);
            console.error(err);
        }
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        Object.keys(sessionStats).forEach(key => delete sessionStats[key]);
        Object.keys(sessionValues).forEach(key => delete sessionValues[key]);
        window.sessionStartTime = Date.now();
        updateSessionUI();
        addLog("🧹 SESSION_STATS_CLEARED.");
    });
}

// ==========================================================================
// 8. INITIAL STARTUP
// ==========================================================================
window.addEventListener('DOMContentLoaded', async () => {
    if (pathInput) pathInput.placeholder = "Link Chat.log to begin...";
    
    // Attempt to restore handle from IndexedDB
    const savedHandle = await get(FILE_HANDLE_KEY);
    if (savedHandle) {
        addLog("📂 RESTORING_LOG_LINK...");
        await window.initializeFile(savedHandle);
    }
});

addLog("entropia obs source version_0.02 loaded Successfully");