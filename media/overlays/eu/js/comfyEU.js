/**
 * comfyEU.js - Twitch Integration for Entropia Scout
 * Version: 0.07 - Centralized State Sync & UI Toggle Fix
 * No-Dependency / Vanilla JS Implementation
 */

import { state, saveData, addLog, playSound, updateUI } from './app.js';

// ===============================================
// --- 1. TWITCH CONNECTION & PERSISTENCE ---
// ===============================================

/**
 * Connects to Twitch and ensures the username is saved to the global state.
 */
const connectToTwitch = () => {
    const user = document.getElementById("streamerInput")?.value.trim();
    if (user) {
        state.twitchUser = user;
        saveData();
        
        ComfyJS.Init(user);
        
        const nameplate = document.getElementById("nameplate");
        if (nameplate) nameplate.textContent = user;
        
        addLog(`CONNECTED: TWITCH CHANNEL ${user.toUpperCase()}`);
        playSound("meowSound");
    }
};

document.getElementById("connectBtn")?.addEventListener("click", connectToTwitch);

// ===============================================
// --- 2. COMMAND HANDLING & UI TOGGLES ---
// ===============================================

ComfyJS.onCommand = (user, command, message, flags, extra) => {
    const cmd = command.toLowerCase();
    const isAuthorized = flags.broadcaster || flags.mod;
    const isStreamer = flags.broadcaster; 

    // --- PERMISSION-AWARE HELP COMMAND ---
    if (cmd === "help" || cmd === "commands") {
        const publicCmds = ["!test", "!sessiontotal", "!loot", "!skills", "!globals", "!deaths", "!help"];
        const authCmds = ["!start", "!stop", "!pause", "!unpause", "!resume"];
        const streamerCmds = ["!toggleterm", "!togglename", "!toggletotal", "!togglegrid", "!toggletimer"];

        let available = [...publicCmds];
        if (isAuthorized) available = [...available, ...authCmds];
        if (isStreamer) available = [...available, ...streamerCmds];

        const commandString = available.join(", ");
        addLog(`HELP: [${user.toUpperCase()}] CAN USE: ${commandString}`);
        showSessionAlert("COMMANDS", available.length, "AVAILABLE", 0);
    }

    // Standard Test Command
    if (cmd === "test") {
        addLog(`CMD_TEST: REQUEST FROM ${user.toUpperCase()}`);
        playSound("meowSound");
    }

    // --- UI OVERLAY TOGGLES (Broadcaster Only) ---
    // Updated logic: Modify global state then trigger updateUI() for sync.
    if (isStreamer) {
        // 1. Toggle Terminal Visibility
        if (cmd === "toggleterm" || cmd === "toggle") {
            state.layout.showTerminalOutput = !state.layout.showTerminalOutput;
            addLog(`CMD_UI: TERMINAL ${state.layout.showTerminalOutput ? 'ENABLED' : 'DISABLED'}`);
            updateUI();
            saveData();
        }

        // 2. Toggle Nameplate Visibility
        if (cmd === "togglename") {
            state.layout.showStreamerName = !state.layout.showStreamerName;
            addLog(`CMD_UI: NAMEPLATE ${state.layout.showStreamerName ? 'ENABLED' : 'DISABLED'}`);
            updateUI();
            saveData();
        }

        // 3. Toggle Session Total visibility
        if (cmd === "toggletotal") {
            const el = document.getElementById("session-grand-total")?.parentElement;
            if (el) {
                // Since this isn't in core state yet, we toggle manually but with a fallback check
                const isHidden = el.style.display === "none";
                el.style.display = isHidden ? "flex" : "none";
                addLog(`CMD_UI: GRAND TOTAL TOGGLED`);
            }
        }

        // 4. Toggle the entire Loot Manifest Grid
        if (cmd === "togglegrid") {
            state.layout.showManifest = !state.layout.showManifest;
            addLog(`CMD_UI: MANIFEST GRID ${state.layout.showManifest ? 'ENABLED' : 'DISABLED'}`);
            updateUI();
            saveData();
        }

        // 5. Toggle Session Timer Visibility
        if (cmd === "toggletimer") {
            state.layout.showOverlayTimer = !state.layout.showOverlayTimer;
            addLog(`CMD_UI: TIMER ${state.layout.showOverlayTimer ? 'ENABLED' : 'DISABLED'}`);
            updateUI();
            saveData();
        }
    }

    // --- REMOTE SESSION CONTROL (Authorized Only) ---
    if (isAuthorized) {
        const startBtn = document.getElementById('start-session-btn');

        if (cmd === "startsession" && startBtn?.textContent === "START SESSION") {
            startBtn.click();
            addLog(`CMD_REMOTE: SESSION STARTED BY ${user.toUpperCase()}`);
        }

        if (cmd === "stopsession" && startBtn?.textContent === "STOP SESSION") {
            startBtn.click();
            addLog(`CMD_REMOTE: SESSION STOPPED BY ${user.toUpperCase()}`);
        }

        if (cmd === "pausesession" && !window.isPaused) {
            window.isPaused = true;
            if (startBtn) startBtn.style.opacity = "0.5";
            addLog(`CMD_REMOTE: SESSION PAUSED BY ${user.toUpperCase()}`);
            showSessionAlert("SESSION", 0, "PAUSED", 0);
        }

        if ((cmd === "unpausesession" || cmd === "resumesession") && window.isPaused) {
            window.isPaused = false;
            if (startBtn) startBtn.style.opacity = "1.0";
            addLog(`CMD_REMOTE: SESSION RESUMED BY ${user.toUpperCase()}`);
            showSessionAlert("SESSION", 0, "RESUMED", 0);
        }
    }

    // --- SESSION STATS QUERY ---
    if (cmd === "sessiontotal" || cmd === "loot") {
        const itemName = message.trim(); 
        if (!itemName || !window.sessionStats) return;

        const key = Object.keys(window.sessionStats).find(k => k.trim().toLowerCase() === itemName.toLowerCase());

        if (key) {
            const total = window.sessionStats[key];
            const pedValue = window.sessionValues[key] || 0; 
            const startTime = window.sessionStartTime || Date.now();
            const elapsedHours = (Date.now() - startTime) / 3600000;
            const perHour = (total / Math.max(0.01, elapsedHours)).toFixed(1);

            showSessionAlert(key, total, perHour, pedValue);
            addLog(`TWITCH: ${user.toUpperCase()} QUERIED ${key}`);
        } else {
            addLog(`TWITCH: NO DATA FOR "${itemName.toUpperCase()}"`, true);
        }
    }

    // --- SESSION SKILLS QUERY ---
    if (cmd === "skills") {
        const targetSkill = message.trim().toLowerCase();
        if (!window.sessionSkills || Object.keys(window.sessionSkills).length === 0) return;

        if (!targetSkill) {
            const topSkills = Object.entries(window.sessionSkills)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3)
                .map(([name, val]) => `${name}: ${val.toFixed(2)}`)
                .join(" | ");
            addLog(`TWITCH: TOP SKILLS: ${topSkills}`);
        } else {
            const key = Object.keys(window.sessionSkills).find(k => k.toLowerCase() === targetSkill);
            if (key) {
                const totalXp = window.sessionSkills[key];
                showSessionAlert(`SKILL: ${key}`, totalXp.toFixed(2), "XP", 0);
            }
        }
    }

    // --- GLOBAL COUNTER ---
    if (cmd === "globals") {
        const count = window.globalCount || 0;
        addLog(`TWITCH: ${count} GLOBALS TRACKED THIS SESSION`);
        showSessionAlert("GLOBALS", count, "TOTAL", 0);
    }

    // --- SESSION DEATHS ---
    if (cmd === "deaths") {
        const deaths = window.sessionDeaths || 0;
        addLog(`TWITCH: YOU HAVE DIED ${deaths} TIMES THIS SESSION.`);
        showSessionAlert("DEATHS", deaths, "TOTAL", 0);
    }
};

// ===============================================
// --- 3. VISUAL OVERLAY SYSTEM ---
// ===============================================

function showSessionAlert(name, total, rate, pedValue) {
    const bubble = document.getElementById("bubble");
    if (!bubble) return;

    bubble.innerHTML = `
        <div style="color: var(--accent-cyan, #0ec3c3); font-size: 8px; margin-bottom: 5px; border-bottom: 1px solid #444; letter-spacing: 1px; font-family: monospace;">SESSION STATS</div>
        <div style="font-size: 11px; margin: 5px 0; font-weight: bold; color: #fff;">${name.toUpperCase()}</div>
        <div style="font-size: 10px;">TOTAL: <span style="color: #ffcc00;">${total}</span></div>
        <div style="font-size: 9px; color: #aaa; margin-top: 2px;">VALUE: ${pedValue.toFixed(4)} PED</div>
        <div style="color: var(--accent-cyan, #00ffff); font-size: 9px; margin-top: 3px;">AVG: ${rate}/HR</div>
    `;

    bubble.classList.add("show");
    
    if (window.bubbleTimeout) clearTimeout(window.bubbleTimeout);
    
    window.bubbleTimeout = setTimeout(() => {
        bubble.classList.remove("show");
    }, 7000);
}

// ===============================================
// --- 4. INITIALIZATION ---
// ===============================================

ComfyJS.onChat = (user, message, flags, self, extra) => {};

window.addEventListener('DOMContentLoaded', () => {
    if (state.twitchUser) {
        const streamerInput = document.getElementById("streamerInput");
        if (streamerInput) {
            streamerInput.value = state.twitchUser;
            ComfyJS.Init(state.twitchUser);
            
            const nameplate = document.getElementById("nameplate");
            if (nameplate) nameplate.textContent = state.twitchUser;
            
            addLog(`TWITCH: AUTO-RECONNECTED AS ${state.twitchUser.toUpperCase()}`);
        }
    }
});

addLog("comfyEU.js: V0.07 ONLINE");