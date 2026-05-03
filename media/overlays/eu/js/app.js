//===============================================
// --- 1. STATE & CONSTANTS ---
//===============================================
const STORAGE_KEY = "entropiaOBS_state_v1";
const SOUND_KEY = "entropiaOBS_sound_settings";

export let state = {
    twitchUser: "",
    layout: {
        nameX: 50, nameY: 70,
        terminalOutputX: 10, terminalOutputY: 10,
        showStreamerName: true,
        showTerminalOutput: true,
        primaryColor: "#00ff00"
    }
};

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
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    div.style = `padding: 2px 0; font-family: monospace; color: ${isError ? '#ff4444' : '#00ff00'};`;
    div.textContent = `[${timestamp}] ${isError ? "[ERR]" : "[LOG]"} ${message.toUpperCase()}`;

    logWindow.prepend(div);
    if (logWindow.childNodes.length > 20) logWindow.removeChild(logWindow.lastChild);
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
        state = { ...state, layout: { ...state.layout, ...loaded.layout }, twitchUser: loaded.twitchUser };
        
        if (state.twitchUser) {
            document.getElementById("streamerInput").value = state.twitchUser;
            document.getElementById("nameplate").textContent = state.twitchUser;
        }
    }

    // Sync Sliders and Checkboxes
    sliders.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = state.layout[id];
    });

    document.getElementById("showStreamerName").checked = state.layout.showStreamerName;
    document.getElementById("showTerminalOutput").checked = state.layout.showTerminalOutput;
    updateUI();
}

//===============================================
// --- 5. EVENT LISTENERS ---
//===============================================
document.getElementById("openMenu-Butt").addEventListener("click", () => {
    document.getElementById("comfycontrolContainer").classList.toggle("active");
});

sliders.forEach(id => {
    document.getElementById(id)?.addEventListener("input", (e) => {
        state.layout[id] = parseInt(e.target.value);
        updateUI();
    });
});

["showStreamerName", "showTerminalOutput"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", (e) => {
        state.layout[id] = e.target.checked;
        updateUI();
    });
});

document.getElementById("btnReset").addEventListener("click", () => {
    localStorage.clear();
    location.reload();
});

// Sound Controls logic
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
            window.soundSettings.customPaths[key] = URL.createObjectURL(file);
            localStorage.setItem(SOUND_KEY, JSON.stringify(window.soundSettings));
            refreshAudioInstance(key);
            addLog(`Sound ${key} updated!`);
        }
    });

    testBtn?.addEventListener('click', () => playSound(key));
});

// Initialization
loadData();
setInterval(saveData, 5000);