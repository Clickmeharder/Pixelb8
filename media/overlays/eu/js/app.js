//===============================================
// --- 1. STATE & CONSTANTS ---
//===============================================
const STORAGE_KEY = "entropiaOBS_state_v1";
const SOUND_KEY = "entropiaOBS_sound_settings";

export let state = {
    twitchUser: "",
    layout: {
        nameX: 50, 
        nameY: 70,
        terminalOutputX: 10, 
        terminalOutputY: 10,
        showStreamerName: true,
        showTerminalOutput: true,
        primaryColor: "#00ff00",
        secondaryColor: "#000"
    },
    sessionActive: false,
    logLinked: false
};

// Expose addLog globally so non-module scripts or external triggers can use it
window.addLog = addLog;

const sliders = ["nameX", "nameY", "terminalOutputX", "terminalOutputY"];

//===============================================
// --- 2. SOUND SYSTEM ---
//===============================================
const defaultPaths = { meowSound: 'assets/sounds/meowSound.mp3' };
const savedSoundSettings = localStorage.getItem(SOUND_KEY);

window.soundSettings = savedSoundSettings ? JSON.parse(savedSoundSettings) : {
    masterEnabled: true,
    meowSound: true,
    customPaths: {}
};

const audioAssets = {};

function refreshAudioInstance(key) {
    const source = window.soundSettings.customPaths[key] || defaultPaths[key];
    if (source) {
        audioAssets[key] = new Audio(source);
    }
}

// Initialize audio objects on boot
Object.keys(window.soundSettings).forEach(key => {
    if (key !== 'masterEnabled' && key !== 'customPaths') refreshAudioInstance(key);
});

export function playSound(soundKey) {
    if (window.soundSettings.masterEnabled && window.soundSettings[soundKey]) {
        const sound = audioAssets[soundKey];
        if (sound) {
            sound.currentTime = 0;
            sound.play().catch(err => console.warn(`Audio blocked: ${soundKey}`, err));
        }
    }
}

//===============================================
// --- 3. UI SYNC & LOGGING ---
//===============================================
export function addLog(message, isError = false) {
    const logWindow = document.getElementById("terminaloutput");
    if (!logWindow) return;

    const div = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString([], { 
        hour12: false, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });

    div.style = `padding: 2px 0; font-family: monospace; color: ${isError ? '#ff4444' : '#00ff00'}; font-size: 9px;`;
    div.textContent = `[${timestamp}] ${isError ? "[ERR]" : "[LOG]"} ${message.toUpperCase()}`;

    logWindow.prepend(div);
    
    // Keep the log lean for performance in OBS browser sources[cite: 4]
    if (logWindow.childNodes.length > 25) {
        logWindow.removeChild(logWindow.lastChild);
    }
}

function updateUI() {
    const nameplate = document.getElementById("nameplate");
    const terminal = document.getElementById("terminaloutput");

    if (nameplate) {
        nameplate.style.left = state.layout.nameX + "%";
        nameplate.style.top = state.layout.nameY + "%";
        nameplate.style.display = state.layout.showStreamerName ? "block" : "none";
    }
    if (terminal) {
        terminal.style.left = state.layout.terminalOutputX + "%";
        terminal.style.top = state.layout.terminalOutputY + "%";
        terminal.style.display = state.layout.showTerminalOutput ? "block" : "none";
    }
}

//===============================================
// --- 4. DATA PERSISTENCE ---
//===============================================
export function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const loaded = JSON.parse(saved);
        // Deep merge layout to ensure new keys aren't lost
        state = { 
            ...state, 
            layout: { ...state.layout, ...loaded.layout }, 
            twitchUser: loaded.twitchUser || "" 
        };
        
        if (state.twitchUser) {
            const streamInput = document.getElementById("streamerInput");
            const plate = document.getElementById("nameplate");
            if (streamInput) streamInput.value = state.twitchUser;
            if (plate) plate.textContent = state.twitchUser;
        }
    }

    // Sync Sliders and Checkboxes with loaded state
    sliders.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = state.layout[id];
    });

    const checkName = document.getElementById("showStreamerName");
    const checkTerm = document.getElementById("showTerminalOutput");
    if (checkName) checkName.checked = state.layout.showStreamerName;
    if (checkTerm) checkTerm.checked = state.layout.showTerminalOutput;
    
    updateUI();
}

//===============================================
// --- 5. EVENT LISTENERS ---
//===============================================

// UI Toggles
document.getElementById("openMenu-Butt")?.addEventListener("click", () => {
    document.getElementById("comfycontrolContainer").classList.toggle("active");
});

// Layout Adjustments
sliders.forEach(id => {
    document.getElementById(id)?.addEventListener("input", (e) => {
        state.layout[id] = parseInt(e.target.value);
        updateUI();
    });
});

// Visibility Toggles
["showStreamerName", "showTerminalOutput"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", (e) => {
        state.layout[id] = e.target.checked;
        updateUI();
    });
});

// Master Reset[cite: 3]
document.getElementById("btnReset")?.addEventListener("click", () => {
    if(confirm("Factory Reset: Clear all settings and logs?")) {
        localStorage.clear();
        location.reload();
    }
});

// Sound Controls logic[cite: 4]
document.querySelectorAll('.setting-row[data-key]').forEach(row => {
    const key = row.getAttribute('data-key');
    const checkbox = row.querySelector('input[type="checkbox"]');
    const fileInput = row.querySelector('.hidden-file-input');
    const testBtn = row.querySelector('.test-btn');

    if (checkbox) {
        checkbox.checked = window.soundSettings[key];
        checkbox.addEventListener('change', (e) => {
            window.soundSettings[key] = e.target.checked;
            localStorage.setItem(SOUND_KEY, JSON.stringify(window.soundSettings));
        });
    }

    row.querySelector('.file-btn')?.addEventListener('click', () => fileInput.click());

    fileInput?.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            // Create local URL for the session[cite: 4]
            window.soundSettings.customPaths[key] = URL.createObjectURL(file);
            localStorage.setItem(SOUND_KEY, JSON.stringify(window.soundSettings));
            refreshAudioInstance(key);
            addLog(`SOUND_UPDATED: ${key}`);
        }
    });

    testBtn?.addEventListener('click', () => playSound(key));
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    // Auto-save loop to ensure state survives unexpected browser source crashes[cite: 3]
    setInterval(saveData, 5000);
});