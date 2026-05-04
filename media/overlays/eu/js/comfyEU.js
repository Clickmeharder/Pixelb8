/**
 * comfyEU.js - Twitch Integration for Entropia Scout
 * Version: 0.02 - Optimized for Polling V2 Logic
 * No-Dependency / Vanilla JS Implementation
 */

import { state, saveData, addLog, playSound } from './app.js';

// ===============================================
// --- 1. TWITCH CONNECTION & PERSISTENCE ---
// ===============================================

/**
 * Connects to Twitch and ensures the username is saved to the global state.
 */
const connectToTwitch = () => {
    const user = document.getElementById("streamerInput")?.value.trim();
    if (user) {
        // Persist the user to state so it survives reload
        state.twitchUser = user;
        saveData();
        
        // Initialize ComfyJS (Loaded via CDN in HTML)
        ComfyJS.Init(user);
        
        const nameplate = document.getElementById("nameplate");
        if (nameplate) nameplate.textContent = user;
        
        addLog(`CONNECTED: TWITCH CHANNEL ${user.toUpperCase()}`);
        playSound("meowSound");
    }
};

// Event listener instead of onclick for sovereign compliance
document.getElementById("connectBtn")?.addEventListener("click", connectToTwitch);

// ===============================================
// --- 2. COMMAND HANDLING ---
// ===============================================

ComfyJS.onCommand = (user, command, message, flags, extra) => {
    const cmd = command.toLowerCase();
    const isAuthorized = flags.broadcaster || flags.mod;

    // Standard Test Command
    if (cmd === "test") {
        addLog(`CMD_TEST: REQUEST FROM ${user.toUpperCase()}`);
        playSound("meowSound");
    }

    // Toggle Terminal Visibility
    if (cmd === "toggle") {
        const terminal = document.getElementById("terminaloutput");
        if (terminal) {
            terminal.style.display = terminal.style.display === "none" ? "block" : "none";
            addLog(`CMD_UI: TERMINAL DISPLAY TOGGLED`);
        }
    }

    // Remote Session Start/Stop (Authorized Only)
    if ((cmd === "start" || cmd === "stop") && isAuthorized) {
        const startBtn = document.getElementById('start-session-btn');
        if (!startBtn) return;

        const isStarting = cmd === "start" && startBtn.textContent === "START SESSION";
        const isStopping = cmd === "stop" && startBtn.textContent === "STOP SESSION";

        if (isStarting || isStopping) {
            startBtn.click(); // Triggers polling.js logic via event listener
            addLog(`CMD_REMOTE: SESSION ${cmd.toUpperCase()} BY ${user.toUpperCase()}`);
        }
    }

    // Session Total Command: Displays loot stats and PED value in the bubble overlay
    if (cmd === "sessiontotal") {
        const itemName = message.trim(); 
        
        if (!itemName || !window.sessionStats) {
            addLog("TWITCH: INVALID COMMAND DATA", true);
            return;
        }

        // Search session data using a normalized comparison
        const key = Object.keys(window.sessionStats).find(k => {
            return k.trim().toLowerCase() === itemName.toLowerCase();
        });

        if (key) {
            const total = window.sessionStats[key];
            const pedValue = window.sessionValues[key] || 0; // Integrated from polling.js V2
            const startTime = window.sessionStartTime || Date.now();
            const elapsedHours = (Date.now() - startTime) / 3600000;
            const perHour = (total / Math.max(0.01, elapsedHours)).toFixed(1);

            showSessionAlert(key, total, perHour, pedValue);
            addLog(`TWITCH: ${user.toUpperCase()} QUERIED ${key}`);
        } else {
            addLog(`TWITCH: NO DATA FOR "${itemName.toUpperCase()}"`, true);
        }
    }
};

// ===============================================
// --- 3. VISUAL OVERLAY SYSTEM ---
// ===============================================

/**
 * Visual Alert System for Twitch Commands
 * Displays data in the absolutely-positioned bubble element.
 */
function showSessionAlert(name, total, rate, pedValue) {
    const bubble = document.getElementById("bubble");
    if (!bubble) return;

    // Populate bubble with styled session data and PED value
    bubble.innerHTML = `
        <div style="color: var(--accent-cyan, #0ec3c3); font-size: 8px; margin-bottom: 5px; border-bottom: 1px solid #444; letter-spacing: 1px; font-family: monospace;">SESSION STATS</div>
        <div style="font-size: 11px; margin: 5px 0; font-weight: bold; color: #fff;">${name.toUpperCase()}</div>
        <div style="font-size: 10px;">TOTAL: <span style="color: #ffcc00;">${total}</span></div>
        <div style="font-size: 9px; color: #aaa; margin-top: 2px;">VALUE: ${pedValue.toFixed(4)} PED</div>
        <div style="color: var(--accent-cyan, #00ffff); font-size: 9px; margin-top: 3px;">AVG: ${rate}/HR</div>
    `;

    // Trigger CSS transition
    bubble.classList.add("show");
    
    // Clear existing timeout to prevent flickering on multiple calls
    if (window.bubbleTimeout) clearTimeout(window.bubbleTimeout);
    
    // Auto-hide after visibility period (7 seconds)
    window.bubbleTimeout = setTimeout(() => {
        bubble.classList.remove("show");
    }, 7000);
}

// ===============================================
// --- 4. INITIALIZATION ---
// ===============================================

ComfyJS.onChat = (user, message, flags, self, extra) => {
    if (!self) {
        // Chat monitoring for debug or future terminal integration
    }
};

/**
 * Auto-connect if a username was persisted in the state.
 */
window.addEventListener('DOMContentLoaded', () => {
    if (state.twitchUser) {
        const streamerInput = document.getElementById("streamerInput");
        if (streamerInput) {
            streamerInput.value = state.twitchUser;
            // Auto-initialize connection to avoid manual clicking on reload
            ComfyJS.Init(state.twitchUser);
            
            const nameplate = document.getElementById("nameplate");
            if (nameplate) nameplate.textContent = state.twitchUser;
            
            addLog(`TWITCH: AUTO-RECONNECTED AS ${state.twitchUser.toUpperCase()}`);
        }
    }
});