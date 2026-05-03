import { state, saveData, addLog, playSound } from './app.js';

//===============================================
// --- 1. TWITCH CONNECTION & PERSISTENCE ---
//===============================================

/**
 * Connects to Twitch and ensures the username is saved to the global state[cite: 4].
 */
const connectToTwitch = () => {
    const user = document.getElementById("streamerInput").value.trim();
    if (user) {
        // Persist the user to state so it survives reload[cite: 4]
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

document.getElementById("connectBtn")?.addEventListener("click", connectToTwitch);

//===============================================
// --- 2. COMMAND HANDLING ---
//===============================================

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

    // Remote Session Start[cite: 4]
    if (cmd === "start" && isAuthorized) {
        const startBtn = document.getElementById('start-session-btn');
        if (startBtn && startBtn.textContent === "START SESSION") {
            startBtn.click(); // Triggers polling.js logic
            addLog(`CMD_REMOTE: SESSION STARTED BY ${user.toUpperCase()}`);
        }
    }

    // Remote Session Stop[cite: 4]
    if (cmd === "stop" && isAuthorized) {
        const startBtn = document.getElementById('start-session-btn');
        if (startBtn && startBtn.textContent === "STOP SESSION") {
            startBtn.click(); // Triggers polling.js cleanup
            addLog(`CMD_REMOTE: SESSION STOPPED BY ${user.toUpperCase()}`);
        }
    }

    // Session Total Command: Displays loot stats in the bubble overlay[cite: 1, 4]
	if (cmd === "sessiontotal") {
		// message captures everything after !sessiontotal (e.g., "Fish Scrap")
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
			const startTime = window.sessionStartTime || Date.now(); // Fallback to now if not set
			const elapsedHours = (Date.now() - startTime) / 3600000;
			const perHour = (total / Math.max(0.01, elapsedHours)).toFixed(1);

			showSessionAlert(key, total, perHour);
			addLog(`TWITCH: ${user.toUpperCase()} QUERIED ${key}`);
		} else {
			// Log the exact string received to debug hidden characters/spaces
			addLog(`TWITCH: NO DATA FOR "${itemName.toUpperCase()}"`, true);
		}
	}
};

//===============================================
// --- 3. VISUAL OVERLAY SYSTEM ---
//===============================================

/**
 * Visual Alert System for Twitch Commands[cite: 1]
 * Displays data in the absolutely-positioned bubble element.
 */
function showSessionAlert(name, total, rate) {
    const bubble = document.getElementById("bubble");
    if (!bubble) return;

    // Populate bubble with styled session data[cite: 4]
    bubble.innerHTML = `
        <div style="color: #0ec3c3; font-size: 8px; margin-bottom: 5px; border-bottom: 1px solid #444; letter-spacing: 1px;">SESSION STATS</div>
        <div style="font-size: 11px; margin: 5px 0; font-weight: bold;">${name.toUpperCase()}</div>
        <div style="font-size: 10px;">TOTAL: <span style="color: #ffcc00;">${total}</span></div>
        <div style="color: #00ffff; font-size: 9px; margin-top: 3px;">AVG: ${rate}/HR</div>
    `;

    // Trigger CSS transition
    bubble.classList.add("show");
    
    // Auto-hide after visibility period (7 seconds)[cite: 4]
    setTimeout(() => {
        bubble.classList.remove("show");
    }, 7000);
}

//===============================================
// --- 4. INITIALIZATION ---
//===============================================

ComfyJS.onChat = (user, message, flags, self, extra) => {
    if (!self) {
        console.log(`${user}: ${message}`);
    }
};

/**
 * Auto-connect if a username was persisted in the state[cite: 4].
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