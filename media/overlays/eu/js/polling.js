/**
 * polling.js - Sovereign Entropia Log Parser & Session Tracker
 * Version: 0.04 - Twitch Sync & Pause Logic Update
 * Specialized for high-density log analysis and Twitch-integrated overlays.
 */

import { addLog, state, saveData } from './newapp.js';
import { get, set } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

// ==========================================================================
// 1. GLOBAL STATE & REFERENCES (Exposed for comfyEU.js)
// ==========================================================================
let fileHandle = null; 
let lastSize = 0;
let pollInterval = null;
let sessionTickerInterval = null;
let lastProcessedLine = "";
let errorCount = 0;
const MAX_RETRIES = 5;
const FILE_HANDLE_KEY = "entropia_chat_handle";

// Attach directly to window to ensure the Twitch script sees real-time updates
window.sessionStats = {}; 
window.sessionValues = {};
window.sessionSkills = {}; 
window.sessionDeaths = 0;  
window.globalCount = 0;    
window.isPaused = false;   
window.sessionStartTime = Date.now(); 

// ==========================================================================
// 2. REGEX LIBRARY (Entropia Universe Specific)
// ==========================================================================
const timestampChannelMessageRegex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[([^\]]+)\]\s*(.*)$/;
const lootDetailsRegex = /You received\s+\[?(.+?)\]?\s+x\s+\((\d+)\)\s+Value:\s*([\d.]+)\s*PED/i;
const experienceRegex = /You have gained\s+([\d.]+)\s+experience in your (.+) skill/i;
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
 * Restores reference from IDB.
 */
window.initializeFile = async function(handle) {
    if (!handle) return;
    fileHandle = handle; 
    
    if (pathInput) pathInput.value = fileHandle.name;
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
    // Respect remote pause command from Twitch
    if (window.isPaused) return;

    const elapsed = Date.now() - window.sessionStartTime;
    const h = Math.floor(elapsed / 3600000).toString().padStart(2, '0');
    const m = Math.floor((elapsed % 3600000) / 60000).toString().padStart(2, '0');
    const s = Math.floor((elapsed % 60000) / 1000).toString().padStart(2, '0');
    const timeStr = `${h}:${m}:${s}`;

    // Update Internal UI Timer
    const timerEl = document.getElementById('session-timer');
    if (timerEl) timerEl.textContent = timeStr;

    // Update Overlay Timer (for Twitch/OBS)
    const overlayTimer = document.getElementById('overlay-timer');
    if (overlayTimer) overlayTimer.textContent = timeStr;

    updateSessionUI();
}

/**
 * High-Density UI: Creates grid rows on the fly for new loot types.
 */
function updateSessionUI() {
    let grandTotal = 0;
    const now = Date.now();
    const elapsedHours = (now - window.sessionStartTime) / 3600000;

    Object.keys(window.sessionStats).forEach(key => {
        const count = window.sessionStats[key] || 0;
        const totalValue = window.sessionValues[key] || 0;
        grandTotal += totalValue;

        const safeKey = key.replace(/\s+/g, '-');
        let sessionEl = document.getElementById(`session-${safeKey}`);
        
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
    // Stop parsing if file is missing OR if session is paused via Twitch
    if (!fileHandle || window.isPaused) return;

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
            addLog("⚠️ ROTATION: Log shrink detected.", true);
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
        // A. LOOT PARSING
        const lootMatch = message.match(lootDetailsRegex);
        if (lootMatch) {
            const itemName = lootMatch[1].trim(); 
            const amount = parseInt(lootMatch[2]);
            const value = parseFloat(lootMatch[3]);

            if (!(itemName in window.sessionStats)) {
                window.sessionStats[itemName] = 0;
                window.sessionValues[itemName] = 0;
            }
            window.sessionStats[itemName] += amount;
            window.sessionValues[itemName] += value;
            updateSessionUI();
            addLog(`+ ${amount}x ${itemName}`);
            return;
        }

        // B. XP PARSING
        const xpMatch = message.match(experienceRegex);
        if (xpMatch) {
            const xpVal = parseFloat(xpMatch[1]);
            const skillName = xpMatch[2].trim();
            window.sessionSkills[skillName] = (window.sessionSkills[skillName] || 0) + xpVal;
            addLog(`✨ XP: +${xpVal} ${skillName}`);
            return;
        }

        // C. DEATH TRACKING
        if (message.includes("You have been killed") || message.includes("You died")) {
            window.sessionDeaths++;
            addLog("💀 DEATH REGISTERED", true);
            return;
        }
    }

    // D. GLOBAL TRACKING
    if (channel === 'Globals' && globalHofRegex.test(message)) {
        window.globalCount++;
        addLog(`🏆 GLOBAL: ${message}`, false);
    }
};

// ==========================================================================
// 7. EVENT LISTENERS
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
        // 1. Handle Stopping
        if (startBtn.textContent === "STOP SESSION") {
            if (sessionTickerInterval) clearInterval(sessionTickerInterval);
            if (window.pollInterval) clearInterval(window.pollInterval);
            startBtn.textContent = "START SESSION";
            startBtn.style.background = "#2e7d32"; 
            addLog("🛑 SESSION_STOPPED.", true);
            return;
        }

        // 2. Handle missing handle
        if (!fileHandle) {
            addLog("❌ ERROR: Link Chat.log first!", true);
            // Shake the browse button to guide the user
            const bBtn = document.getElementById("browseBtn");
            if (bBtn) bBtn.style.boxShadow = "0 0 20px #ff0000";
            return;
        }

        try {
            // 3. FORCE PERMISSION REQUEST (Solves the OBS Permission Denied)
            const opts = { mode: 'read' };
            if ((await fileHandle.queryPermission(opts)) !== 'granted') {
                addLog("🔐 REQUESTING FILE ACCESS...");
                if ((await fileHandle.requestPermission(opts)) !== 'granted') {
                    addLog("❌ PERMISSION_DENIED", true);
                    return;
                }
            }

            // 4. Initialization Logic
            const file = await fileHandle.getFile();
            lastSize = file.size; 
            window.sessionStartTime = Date.now(); 
            window.isPaused = false; 

            if (window.pollInterval) clearInterval(window.pollInterval);
            if (sessionTickerInterval) clearInterval(sessionTickerInterval);

            window.pollInterval = setInterval(window.pollWebLog, 2500); 
            sessionTickerInterval = setInterval(runSessionTicker, 1000);

            window.sessionStats = {};
            window.sessionValues = {};
            window.sessionSkills = {};
            window.sessionDeaths = 0;
            window.globalCount = 0;
            
            if (manifestGrid) manifestGrid.innerHTML = '';

            startBtn.textContent = "STOP SESSION";
            startBtn.style.background = "#d32f2f"; 
            startBtn.style.boxShadow = "0 0 10px #ff0000";
            addLog(`✅ SESSION_STARTED: ${file.name}`);

            if ('wakeLock' in navigator) await navigator.wakeLock.request('screen');

        } catch (err) {
            addLog("❌ ACCESS_FAILED: RE-LINK LOG", true);
            console.error(err);
        }
    });
}

if (resetBtn) {
    resetBtn.addEventListener('click', () => {
        window.sessionStats = {};
        window.sessionValues = {};
        window.sessionSkills = {};
        window.sessionDeaths = 0;
        window.globalCount = 0;
        window.sessionStartTime = Date.now();
        if (manifestGrid) manifestGrid.innerHTML = '';
        updateSessionUI();
        addLog("🧹 SESSION_STATS_CLEARED.");
    });
}

// ==========================================================================
// 8. INITIAL STARTUP
// ==========================================================================


addLog("POLLING_ENGINE: V0.05 ONLINE");