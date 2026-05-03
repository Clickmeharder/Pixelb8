//===============================================
// --- 1. STATE & CONSTANTS ---
//===============================================
import { get, set } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

const STORAGE_KEY = "entropiaOBS_state_v2"; // Incremented version for new schema
const SOUND_KEY = "entropiaOBS_sound_settings";
const FILE_HANDLE_KEY = "entropia_chat_handle";

export let state = {
    twitchUser: "",
    layout: {
        // Positions
        nameX: 50, nameY: 70,
        terminalOutputX: 10, terminalOutputY: 10,
        manifestX: 80, manifestY: 80,
        bubbleX: 50, bubbleY: 50,
        
        // Visibility
        showStreamerName: true,
        showTerminalOutput: true,
        showManifest: true,

        // Dynamic Styling Engine
        textColor: "#ffffff",
        bgColor1: "#000000",
        bgColor2: "#000000",
        bgAlpha: 0.8,
        borderColor1: "#0ec3c3",
        borderColor2: "#0ec3c3",
        borderStyle: "solid",
        borderWidth: 2,
        borderRadius: 0,
        fontSize: 10,
        textOutline: 0,
        fontFamily: "'Segoe UI', sans-serif"
    },
    sessionActive: false,
    logLinked: false
};

window.addLog = addLog;

const numericSliders = [
    "nameX", "nameY", "terminalOutputX", "terminalOutputY", 
    "manifestX", "manifestY", "bubbleX", "bubbleY",
    "borderWidth", "borderRadius", "fontSize", "textOutline", "bgAlpha"
];

const colorInputs = ["textColor", "bgColor1", "bgColor2", "borderColor1", "borderColor2"];

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
    if (source) audioAssets[key] = new Audio(source);
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
    const timestamp = new Date().toLocaleTimeString([], { 
        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });

    div.style = `padding: 2px 0; font-family: ${state.layout.fontFamily}; color: ${isError ? '#ff4444' : state.layout.textColor}; font-size: 9px;`;
    div.textContent = `[${timestamp}] ${isError ? "[ERR]" : "[LOG]"} ${message.toUpperCase()}`;

    logWindow.prepend(div);
    if (logWindow.childNodes.length > 25) logWindow.removeChild(logWindow.lastChild);
}

// Helper: Convert Hex to RGBA for alpha support
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function applyStyles() {
    const targets = document.querySelectorAll('.chat-bubble, .textcontainer, #nameplate, #session-manifest');
    const l = state.layout;

    const bgRgba1 = hexToRgba(l.bgColor1, l.bgAlpha);
    const bgRgba2 = hexToRgba(l.bgColor2, l.bgAlpha);

    targets.forEach(el => {
        // Typography
        el.style.color = l.textColor;
        el.style.fontSize = l.fontSize + "px";
        el.style.fontFamily = l.fontFamily;
        el.style.textShadow = l.textOutline > 0 ? `0 0 ${l.textOutline}px black` : "none";

        // Background Gradient
        el.style.background = `linear-gradient(135deg, ${bgRgba1}, ${bgRgba2})`;

        // Border Logic
        el.style.borderStyle = l.borderStyle;
        el.style.borderWidth = l.borderWidth + "px";
        el.style.borderRadius = l.borderRadius + "px";
        
        if (l.borderColor1 === l.borderColor2) {
            el.style.borderImage = "none";
            el.style.borderColor = l.borderColor1;
        } else {
            el.style.borderImageSource = `linear-gradient(135deg, ${l.borderColor1}, ${l.borderColor2})`;
            el.style.borderImageSlice = 1;
        }
    });
}

function updateUI() {
    const els = {
        nameplate: document.getElementById("nameplate"),
        terminal: document.getElementById("terminaloutput"),
        manifest: document.getElementById("session-manifest"),
        bubble: document.getElementById("bubble")
    };

    if (els.nameplate) {
        els.nameplate.style.left = state.layout.nameX + "%";
        els.nameplate.style.top = state.layout.nameY + "%";
        els.nameplate.style.display = state.layout.showStreamerName ? "block" : "none";
        if (state.twitchUser) els.nameplate.textContent = state.twitchUser;
    }
    if (els.terminal) {
        els.terminal.style.left = state.layout.terminalOutputX + "%";
        els.terminal.style.top = state.layout.terminalOutputY + "%";
        els.terminal.style.display = state.layout.showTerminalOutput ? "block" : "none";
    }
    if (els.manifest) {
        els.manifest.style.left = state.layout.manifestX + "%";
        els.manifest.style.top = state.layout.manifestY + "%";
        els.manifest.style.display = state.layout.showManifest ? "block" : "none";
    }
    if (els.bubble) {
        els.bubble.style.left = state.layout.bubbleX + "%";
        els.bubble.style.top = state.layout.bubbleY + "%";
    }
    applyStyles();
}

//===============================================
// --- 4. DATA PERSISTENCE & FILE HANDLING ---
//===============================================
export function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function restoreFileHandle() {
    const savedHandle = await get(FILE_HANDLE_KEY);
    if (!savedHandle) {
        addLog("LOG_LINK_REQUIRED: BROWSE TO CHAT.LOG");
        return;
    }

    try {
        const perm = await savedHandle.queryPermission({ mode: 'read' });
        const attemptInitialization = () => {
            if (window.initializeFile) {
                window.initializeFile(savedHandle);
                if (perm === 'granted') {
                    addLog("LOG_RECONNECTED: AUTO");
                } else {
                    addLog("LOG_FOUND: CLICK START TO AUTHORIZE");
                    const bBtn = document.getElementById("browseBtn");
                    if (bBtn) bBtn.style.boxShadow = "0 0 15px #0ec3c3";
                }
            } else {
                setTimeout(attemptInitialization, 200);
            }
        };
        attemptInitialization();
    } catch (err) {
        console.warn("Handle recovery failed", err);
        addLog("LOG_RECOVERY_FAILED", true);
    }
}

async function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const loaded = JSON.parse(saved);
        state = { 
            ...state, 
            layout: { ...state.layout, ...loaded.layout }, 
            twitchUser: loaded.twitchUser || "" 
        };
        
        if (state.twitchUser) {
            const input = document.getElementById("streamerInput");
            if (input) input.value = state.twitchUser;
            if (window.ComfyJS) ComfyJS.Init(state.twitchUser);
        }
    }

    // Sync UI elements to state
    numericSliders.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = state.layout[id];
    });

    colorInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = state.layout[id];
    });

    ["showStreamerName", "showTerminalOutput", "showManifest"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = state.layout[id];
    });
    
    ["borderStyle", "fontFamily"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = state.layout[id];
    });

    updateUI();
    restoreFileHandle();
}

//===============================================
// --- 5. EVENT LISTENERS ---
//===============================================
document.getElementById("openMenu-Butt")?.addEventListener("click", () => {
    document.getElementById("comfycontrolContainer").classList.toggle("active");
});

document.getElementById("connectBtn")?.addEventListener("click", () => {
    const user = document.getElementById("streamerInput").value;
    if (user) {
        state.twitchUser = user;
        saveData();
        location.reload();
    }
});

// Universal input listener for layout settings
document.querySelectorAll('input, select').forEach(input => {
    input.addEventListener('input', (e) => {
        const id = e.target.id;
        if (state.layout.hasOwnProperty(id)) {
            if (e.target.type === "range") {
                state.layout[id] = parseFloat(e.target.value);
            } else if (e.target.type === "checkbox") {
                state.layout[id] = e.target.checked;
            } else {
                state.layout[id] = e.target.value;
            }
            updateUI();
        }
    });
});

document.getElementById("btnReset")?.addEventListener("click", () => {
    if(confirm("Factory Reset: Clear all settings and file handles?")) {
        localStorage.clear();
        set(FILE_HANDLE_KEY, null);
        location.reload();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setInterval(saveData, 5000);
});