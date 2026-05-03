import { state, saveData, addLog, playSound } from './app.js';

// --- Twitch Connection ---
document.getElementById("connectBtn").addEventListener("click", () => {
    const user = document.getElementById("streamerInput").value.trim();
    if (user) {
        state.twitchUser = user;
        saveData();
        
        // Use ComfyJS (loaded via CDN in HTML)
        ComfyJS.Init(user);
        
        document.getElementById("nameplate").textContent = user;
        addLog(`Connected to Twitch: ${user}`);
        playSound("meowSound");
    }
});

// --- Command Handling ---
ComfyJS.onCommand = (user, command, message, flags, extra) => {
    const cmd = command.toLowerCase();

    if (cmd === "test") {
        addLog(`Command from ${user}: TEST`);
        playSound("meowSound");
    }

    if (cmd === "toggle") {
        const terminal = document.getElementById("terminaloutput");
        if (terminal) {
            terminal.style.display = terminal.style.display === "none" ? "block" : "none";
        }
    }
};

ComfyJS.onChat = (user, message, flags, self, extra) => {
    // Optional: add chat to log or bubble
    console.log(`${user}: ${message}`);
};