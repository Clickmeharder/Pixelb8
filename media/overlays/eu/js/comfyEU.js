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
};

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