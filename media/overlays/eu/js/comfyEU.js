import { state, saveData, addLog, playSound } from './app.js';

// --- Twitch Connection ---
document.getElementById("connectBtn").addEventListener("click", () => {
    const user = document.getElementById("streamerInput").value.trim();
    if (user) {
        state.twitchUser = user;
        saveData();
        
        // Use ComfyJS (loaded via CDN in HTML)
        ComfyJS.Init(user);
        
        const nameplate = document.getElementById("nameplate");
        if (nameplate) nameplate.textContent = user;
        
        addLog(`CONNECTED: Twitch channel ${user}`);
        playSound("meowSound");
    }
});

// --- Command Handling ---
ComfyJS.onCommand = (user, command, message, flags, extra) => {
    const cmd = command.toLowerCase();
    const isAuthorized = flags.broadcaster || flags.mod;

    // Standard Test Command
    if (cmd === "test") {
        addLog(`CMD_TEST: Request from ${user}`);
        playSound("meowSound");
    }

    // Toggle Terminal Visibility
    if (cmd === "toggle") {
        const terminal = document.getElementById("terminaloutput");
        if (terminal) {
            terminal.style.display = terminal.style.display === "none" ? "block" : "none";
            addLog(`CMD_UI: Terminal display toggled.`);
        }
    }

    // Remote Session Start[cite: 4]
    if (cmd === "start" && isAuthorized) {
        const startBtn = document.getElementById('start-session-btn');
        if (startBtn && startBtn.textContent === "START SESSION") {
            startBtn.click(); // Triggers polling.js logic
            addLog(`CMD_REMOTE: Session started by ${user}`);
        }
    }

    // Remote Session Stop[cite: 4]
    if (cmd === "stop" && isAuthorized) {
        const startBtn = document.getElementById('start-session-btn');
        if (startBtn && startBtn.textContent === "STOP SESSION") {
            startBtn.click(); // Triggers polling.js cleanup
            addLog(`CMD_REMOTE: Session stopped by ${user}`);
        }
    }

    // NEW: Session Total Command[cite: 1, 4]
    if (cmd === "sessiontotal") {
        const itemName = message.trim();
        if (!itemName || !window.sessionStats) return;

        // Find the item in our session data (case-insensitive)[cite: 4]
        const key = Object.keys(window.sessionStats).find(
            k => k.toLowerCase() === itemName.toLowerCase()
        );

        if (key) {
            const total = window.sessionStats[key];
            const elapsedHours = (Date.now() - window.sessionStartTime) / 3600000;
            const perHour = (total / Math.max(0.01, elapsedHours)).toFixed(1);

            // Trigger the on-screen visual alert
            showSessionAlert(key, total, perHour);
            addLog(`TWITCH: ${user} queried ${key}`);
        } else {
            addLog(`TWITCH: ${user} searched for "${itemName}" (No data found)`, true);
        }
    }
};

/**
 * Visual Alert System for Twitch Commands[cite: 1]
 */
function showSessionAlert(name, total, rate) {
    const bubble = document.getElementById("bubble");
    if (!bubble) return;

    // Populate the bubble with formatted high-density data[cite: 4]
    bubble.innerHTML = `
        <div style="color: #0ec3c3; font-size: 8px; margin-bottom: 5px; border-bottom: 1px solid #444;">SESSION STATS</div>
        <div style="font-size: 11px; margin: 5px 0;">${name.toUpperCase()}</div>
        <div style="font-size: 10px;">TOTAL: <span style="color: #ffcc00;">${total}</span></div>
        <div style="color: #00ffff; font-size: 9px; margin-top: 3px;">AVG: ${rate}/hr</div>
    `;

    // Visual trigger
    bubble.classList.add("show");
    
    // Auto-hide after visibility period[cite: 4]
    setTimeout(() => {
        bubble.classList.remove("show");
    }, 7000);
}

ComfyJS.onChat = (user, message, flags, self, extra) => {
    // Log active chat to terminal for monitoring
    if (!self) {
        console.log(`${user}: ${message}`);
    }
};

// Initialize on load if user is already saved
window.addEventListener('DOMContentLoaded', () => {
    if (state.twitchUser) {
        const streamerInput = document.getElementById("streamerInput");
        if (streamerInput) streamerInput.value = state.twitchUser;
        // Optionally auto-init: ComfyJS.Init(state.twitchUser);
    }
});