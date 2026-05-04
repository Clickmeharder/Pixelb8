/**
 * comfyEU.js - Twitch Integration for Entropia Scout
 * Version: 0.03 - UI Command Suite & Administrative Security
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
// --- 2. COMMAND HANDLING & UI TOGGLES ---
// ===============================================

ComfyJS.onCommand = (user, command, message, flags, extra) => {
    const cmd = command.toLowerCase();
    const isAuthorized = flags.broadcaster || flags.mod;
    const isStreamer = flags.broadcaster; // Strict check for UI manipulation

    // Standard Test Command
    if (cmd === "test") {
        addLog(`CMD_TEST: REQUEST FROM ${user.toUpperCase()}`);
        playSound("meowSound");
    }

    // --- UI OVERLAY TOGGLES (Broadcaster Only) ---
    if (isStreamer) {
        // Toggle Terminal Visibility
        if (cmd === "toggleterm" || cmd === "toggle") {
            const el = document.getElementById("terminaloutput");
            if (el) {
                el.style.display = (el.style.display === "none") ? "block" : "none";
                addLog(`CMD_UI: TERMINAL TOGGLED BY ${user.toUpperCase()}`);
            }
        }

        // Toggle Nameplate Visibility
        if (cmd === "togglename") {
            const el = document.getElementById("nameplate");
            if (el) {
                el.style.visibility = (el.style.visibility === "hidden") ? "visible" : "hidden";
                addLog(`CMD_UI: NAMEPLATE TOGGLED BY ${user.toUpperCase()}`);
            }
        }

        // Toggle Session Total/Grand Total visibility
        if (cmd === "toggletotal") {
            const el = document.getElementById("session-grand-total")?.parentElement;
            if (el) {
                el.style.display = (el.style.display === "none") ? "flex" : "none";
                addLog(`CMD_UI: GRAND TOTAL TOGGLED BY ${user.toUpperCase()}`);
            }
        }

        // Toggle the entire Loot Manifest Grid
        if (cmd === "togglegrid") {
            const el = document.getElementById("manifest-grid");
            if (el) {
                el.style.display = (el.style.display === "none") ? "grid" : "none";
                addLog(`CMD_UI: MANIFEST GRID TOGGLED BY ${user.toUpperCase()}`);
            }
        }
    }

    // --- REMOTE SESSION CONTROL (Authorized Only) ---
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

    // --- SESSION STATS QUERY ---
    // Displays loot stats and PED value in the bubble overlay[cite: 1]
    if (cmd === "sessiontotal" || cmd === "loot") {
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
	// --- NEW: SESSION SKILLS QUERY ---
	// Usage: !skills (shows last gained) or !skills [SkillName] (shows total for session)
	if (cmd === "skills") {
		const targetSkill = message.trim().toLowerCase();
		if (!window.sessionSkills || Object.keys(window.sessionSkills).length === 0) {
			addLog("TWITCH: NO SKILL DATA RECORDED", true);
			return;
		}

		if (!targetSkill) {
			// Show the top 3 most improved skills this session
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

	// --- NEW: GLOBAL COUNTER ---
	// Usage: !globals (Total number of globals tracked this session)
	if (cmd === "globals") {
		const count = window.globalCount || 0;
		addLog(`TWITCH: ${count} GLOBALS TRACKED THIS SESSION`);
		showSessionAlert("GLOBALS", count, "TOTAL", 0);
	}

	// --- NEW: SESSION DEATHS ---
	// Usage: !deaths
	if (cmd === "deaths") {
		const deaths = window.sessionDeaths || 0;
		addLog(`TWITCH: YOU HAVE DIED ${deaths} TIMES THIS SESSION.`);
		showSessionAlert("DEATHS", deaths, "TOTAL", 0);
	}
};

// ===============================================
// --- 3. VISUAL OVERLAY SYSTEM ---
// ===============================================

/**
 * Visual Alert System for Twitch Commands
 * Displays data in the absolutely-positioned bubble element.[cite: 1]
 */
function showSessionAlert(name, total, rate, pedValue) {
    const bubble = document.getElementById("bubble");
    if (!bubble) return;

    // Populate bubble with high-density styled session data
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
    // Optional: Monitor chat for specific trigger words or logs
};

/**
 * Auto-connect if a username was persisted in the state.
 */
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