//===============================================
// --- 1. STATE & CONSTANTS ---
//===============================================
import { get, set } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

const STORAGE_KEY = "entropiaOBS_state_v1";
const SOUND_KEY = "entropiaOBS_sound_settings";
const FILE_HANDLE_KEY = "entropia_chat_handle";

export let state = {
    twitchUser: "",
    layout: {
        nameX: 50, nameY: 70,
        terminalOutputX: 10, terminalOutputY: 10,
        manifestX: 80, manifestY: 80,
        bubbleX: 50, bubbleY: 50,
        
        showStreamerName: true,
        showTerminalOutput: true,
        showManifest: true,

        textColor: "#ffffff",
        elementBg: "rgba(0,0,0,0.8)",
        borderColor: "#0ec3c3",
        borderStyle: "solid",
        borderWidth: 2,
        borderRadius: 0,
        fontSize: 10,
        textOutline: 0
    },
    sessionActive: false,
    logLinked: false
};

window.addLog = addLog;

const sliders = [
    "nameX", "nameY", "terminalOutputX", "terminalOutputY", 
    "manifestX", "manifestY", "bubbleX", "bubbleY",
    "borderWidth", "borderRadius", "fontSize", "textOutline"
];

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

    div.style = `padding: 2px 0; font-family: monospace; color: ${isError ? '#ff4444' : state.layout.textColor}; font-size: 9px;`;
    div.textContent = `[${timestamp}] ${isError ? "[ERR]" : "[LOG]"} ${message.toUpperCase()}`;

    logWindow.prepend(div);
    if (logWindow.childNodes.length > 25) logWindow.removeChild(logWindow.lastChild);
}

function applyStyles() {
    const targets = document.querySelectorAll('.chat-bubble, .textcontainer, #nameplate, #session-manifest');
    targets.forEach(el => {
        el.style.color = state.layout.textColor;
        el.style.backgroundColor = state.layout.elementBg;
        el.style.borderColor = state.layout.borderColor;
        el.style.borderStyle = state.layout.borderStyle;
        el.style.borderWidth = state.layout.borderWidth + "px";
        el.style.borderRadius = state.layout.borderRadius + "px";
        el.style.fontSize = state.layout.fontSize + "px";
        el.style.textShadow = state.layout.textOutline > 0 ? `0 0 ${state.layout.textOutline}px black` : "none";
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

function setupSwatches(containerId, stateKey) {
    const container = document.getElementById(containerId);
    if (!container) return;
    const colors = ["#ffffff", "#0ec3c3", "#ff0000", "#00ff00", "#0000ff", "#ffff00", "#ff00ff", "#000000", "rgba(0,0,0,0)", "rgba(0,0,0,0.6)", "#ffaa00", "#55ff55"];
    
    colors.forEach(color => {
        const btn = document.createElement('button');
        btn.style.backgroundColor = color;
        btn.className = "swatch-btn";
        btn.onclick = () => {
            state.layout[stateKey] = color;
            updateUI();
            saveData();
        };
        container.appendChild(btn);
    });
}

//===============================================
// --- 4. DATA PERSISTENCE & FILE HANDLING ---
//===============================================
export function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/**
 * Restores the Chat.log handle from IndexedDB[cite: 3, 4]
 */
async function restoreFileHandle() {
    const savedHandle = await get(FILE_HANDLE_KEY);
    if (savedHandle && window.initializeFile) {
        try {
            const options = { mode: 'read' };
            if (await savedHandle.queryPermission(options) === 'granted') {
                await window.initializeFile(savedHandle);
                addLog("LOG_RECONNECTED: AUTO");
            } else {
                addLog("LOG_PENDING: CLICK BROWSE TO AUTHORIZE", true);
                document.getElementById("browseBtn").style.boxShadow = "0 0 10px yellow";
            }
        } catch (err) {
            console.warn("File handle restoration failed", err);
        }
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
        
        // Auto-persist Twitch Username[cite: 4]
        if (state.twitchUser) {
            const input = document.getElementById("streamerInput");
            if (input) input.value = state.twitchUser;
            // Trigger ComfyJS connection if defined in global scope
            if (window.ComfyJS) ComfyJS.Init(state.twitchUser);
        }
    }

    sliders.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = state.layout[id];
    });

    ["showStreamerName", "showTerminalOutput", "showManifest"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.checked = state.layout[id];
    });
    
    const styleSel = document.getElementById("borderStyle");
    if (styleSel) styleSel.value = state.layout.borderStyle;

    updateUI();
    await restoreFileHandle();[cite: 3]
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
        state.twitchUser = user;[cite: 4]
        saveData();
        location.reload(); // Reload to initialize ComfyJS with new user
    }
});

sliders.forEach(id => {
    document.getElementById(id)?.addEventListener("input", (e) => {
        state.layout[id] = parseInt(e.target.value);
        updateUI();
    });
});

["showStreamerName", "showTerminalOutput", "showManifest"].forEach(id => {
    document.getElementById(id)?.addEventListener("change", (e) => {
        state.layout[id] = e.target.checked;
        updateUI();
    });
});

document.getElementById("borderStyle")?.addEventListener("change", (e) => {
    state.layout.borderStyle = e.target.value;
    updateUI();
});

document.getElementById("btnReset")?.addEventListener("click", () => {
    if(confirm("Factory Reset: Clear all settings and file handles?")) {
        localStorage.clear();
        set(FILE_HANDLE_KEY, null);[cite: 3]
        location.reload();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupSwatches("textSwatches", "textColor");
    setupSwatches("bgSwatches", "elementBg");
    setupSwatches("borderSwatches", "borderColor");
    setInterval(saveData, 5000);
});