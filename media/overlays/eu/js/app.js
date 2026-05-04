/**
 * app.js - Entropia Scout Core Engine
 * Version: 0.06 - Direct Toggle API & Module Sync
 * Specialized for sovereign, no-dependency web architecture.
 */

import { get, set } from 'https://cdn.jsdelivr.net/npm/idb-keyval@6/+esm';

// ===============================================
// --- 1. STATE & CONSTANTS ---
// ===============================================
const STORAGE_KEY = "entropiaOBS_state_v3"; 
const SOUND_KEY = "entropiaOBS_sound_settings";
const FILE_HANDLE_KEY = "entropia_chat_handle";

/**
 * CRITICAL V0.05+: State is a const. 
 * Use Object.assign during load to maintain reference for other modules.
 */
export const state = {
    twitchUser: "",
    layout: {
        nameX: 50, nameY: 70,
        terminalOutputX: 10, terminalOutputY: 10,
        manifestX: 80, manifestY: 80,
        bubbleX: 50, bubbleY: 50,
        overlayTimerX: 10, overlayTimerY: 90, 
        showStreamerName: true,
        showTerminalOutput: true,
        showManifest: true,
        showOverlayTimer: true, 
        textColor: { r: 255, g: 255, b: 255 },
        bgColor1: { r: 0, g: 0, b: 0 },
        bgColor2: { r: 0, g: 0, b: 0 },
        bgAlpha: 0.8,
        borderColor1: { r: 14, g: 195, b: 195 },
        borderColor2: { r: 14, g: 195, b: 195 },
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

const numericSliders = [
    "nameX", "nameY", "terminalOutputX", "terminalOutputY", 
    "manifestX", "manifestY", "bubbleX", "bubbleY",
    "overlayTimerX", "overlayTimerY", 
    "borderWidth", "borderRadius", "fontSize", "textOutline", "bgAlpha"
];

const colorKeys = ["textColor", "bgColor1", "bgColor2", "borderColor1", "borderColor2"];

// ===============================================
// --- 2. SOUND SYSTEM ---
// ===============================================
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

// ===============================================
// --- 3. UI SYNC & STYLING ---
// ===============================================

function rgbToCss(rgbObj, alpha = 1) {
    return `rgba(${rgbObj.r}, ${rgbObj.g}, ${rgbObj.b}, ${alpha})`;
}

export function addLog(message, isError = false) {
    const logWindow = document.getElementById("terminaloutput");
    if (!logWindow) return;

    const div = document.createElement('div');
    const timestamp = new Date().toLocaleTimeString([], { 
        hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' 
    });

    const textColor = rgbToCss(state.layout.textColor);
    div.style = `padding: 2px 0; font-family: ${state.layout.fontFamily}; color: ${isError ? '#ff4444' : textColor}; font-size: 9px;`;
    div.textContent = `[${timestamp}] ${isError ? "[ERR]" : "[LOG]"} ${message.toUpperCase()}`;

    logWindow.prepend(div);
    if (logWindow.childNodes.length > 25) logWindow.removeChild(logWindow.lastChild);
}

window.addLog = addLog; 

function applyStyles() {
    const targets = document.querySelectorAll('.chat-bubble, .textcontainer, #nameplate, #session-manifest, #overlay-timer');
    const l = state.layout;

    const bgRgba1 = rgbToCss(l.bgColor1, l.bgAlpha);
    const bgRgba2 = rgbToCss(l.bgColor2, l.bgAlpha);
    const textRgb = rgbToCss(l.textColor);
    const borderRgb1 = rgbToCss(l.borderColor1);
    const borderRgb2 = rgbToCss(l.borderColor2);

    targets.forEach(el => {
        el.style.color = textRgb;
        el.style.fontSize = l.fontSize + "px";
        el.style.fontFamily = l.fontFamily;
        el.style.textShadow = l.textOutline > 0 ? `0 0 ${l.textOutline}px black` : "none";
        el.style.background = `linear-gradient(135deg, ${bgRgba1}, ${bgRgba2})`;
        el.style.borderStyle = l.borderStyle;
        el.style.borderWidth = l.borderWidth + "px";
        el.style.borderRadius = l.borderRadius + "px";
        
        if (JSON.stringify(l.borderColor1) === JSON.stringify(l.borderColor2)) {
            el.style.borderImage = "none";
            el.style.borderColor = borderRgb1;
        } else {
            el.style.borderImageSource = `linear-gradient(135deg, ${borderRgb1}, ${borderRgb2})`;
            el.style.borderImageSlice = 1;
        }
    });

    colorKeys.forEach(key => {
        const preview = document.getElementById(`preview-${key}`);
        if (preview) preview.style.backgroundColor = rgbToCss(l[key]);
    });
}

export function updateUI() {
    const els = {
        nameplate: document.getElementById("nameplate"),
        terminal: document.getElementById("terminaloutput"),
        manifest: document.getElementById("session-manifest"),
        bubble: document.getElementById("bubble"),
        overlayTimer: document.getElementById("overlay-timer")
    };

    if (els.nameplate) {
        els.nameplate.style.left = state.layout.nameX + "%";
        els.nameplate.style.top = state.layout.nameY + "%";
        els.nameplate.style.transform = "translate(-50%, -50%)";
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
    if (els.overlayTimer) {
        els.overlayTimer.style.left = state.layout.overlayTimerX + "%";
        els.overlayTimer.style.top = state.layout.overlayTimerY + "%";
        els.overlayTimer.style.transform = "translate(-50%, -50%)";
        els.overlayTimer.style.display = state.layout.showOverlayTimer ? "block" : "none";
    }

    // CRITICAL: Sync checkboxes in the menu with current state to prevent input drift
    ["showStreamerName", "showTerminalOutput", "showManifest", "showOverlayTimer"].forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = state.layout[id];
    });

    applyStyles();
}

/**
 * EXPORTED GLOBAL API: Direct Toggle
 * Called by comfyEU.js to flip switches and force immediate sync/save.
 */
window.toggleOverlayElement = (layoutKey) => {
    if (state.layout.hasOwnProperty(layoutKey)) {
        state.layout[layoutKey] = !state.layout[layoutKey];
        updateUI();
        saveData();
        return state.layout[layoutKey];
    }
    return null;
};

// ===============================================
// --- 4. DATA PERSISTENCE & FILE HANDLING ---
// ===============================================
export function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function restoreFileHandle() {
    const savedHandle = await get(FILE_HANDLE_KEY);
    if (!savedHandle) return;

    try {
        const perm = await savedHandle.queryPermission({ mode: 'read' });
        const attemptInitialization = () => {
            if (window.initializeFile) {
                window.initializeFile(savedHandle);
                if (perm !== 'granted') {
                    const bBtn = document.getElementById("browseBtn");
                    if (bBtn) bBtn.style.boxShadow = "0 0 15px #0ec3c3";
                }
            } else {
                setTimeout(attemptInitialization, 200);
            }
        };
        attemptInitialization();
    } catch (err) {
        addLog("LOG_RECOVERY_FAILED", true);
    }
}

async function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const loaded = JSON.parse(saved);
        
        // V0.05 Fix: Use Object.assign to update the existing layout object 
        // instead of reassigning 'state.layout' to a new memory address.
        Object.assign(state.layout, loaded.layout);
        state.twitchUser = loaded.twitchUser || "";
        
        if (state.twitchUser && window.ComfyJS) {
            ComfyJS.Init(state.twitchUser);
        }
    }

    // Sync Sliders
    numericSliders.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = state.layout[id];
    });

    // Sync Color Sliders
    document.querySelectorAll('.rgb-slider').forEach(slider => {
        const key = slider.dataset.color;
        const channel = slider.dataset.channel;
        if (state.layout[key]) slider.value = state.layout[key][channel];
    });

    // Sync Selects
    ["borderStyle", "fontFamily"].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = state.layout[id];
    });

    updateUI();
    restoreFileHandle();
}

// ===============================================
// --- 5. EVENT LISTENERS ---
// ===============================================

// Toggle Settings Menu
document.getElementById("openMenu-Butt")?.addEventListener("click", () => {
    document.getElementById("comfycontrolContainer").classList.toggle("active");
});

// Twitch Connect
document.getElementById("connectBtn")?.addEventListener("click", () => {
    const user = document.getElementById("streamerInput").value.trim();
    if (user) {
        state.twitchUser = user;
        saveData();
        location.reload(); 
    }
});

// Color Slider Input Handling
document.querySelectorAll('.rgb-slider').forEach(slider => {
    slider.addEventListener('input', (e) => {
        const colorKey = e.target.dataset.color;
        const channel = e.target.dataset.channel;
        state.layout[colorKey][channel] = parseInt(e.target.value);
        updateUI();
    });
});

// Generic Input/Range Handling
document.querySelectorAll('input:not(.rgb-slider), select').forEach(input => {
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
            saveData(); 
        }
    });
});

// Factory Reset
document.getElementById("btnReset")?.addEventListener("click", () => {
    if(confirm("Factory Reset? This clears all layout and sound settings.")) {
        localStorage.clear();
        set(FILE_HANDLE_KEY, null);
        location.reload();
    }
});

// DOM Load Init
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    // Safety interval (secondary to immediate saves)
    setInterval(saveData, 10000);
});

addLog("app.js: V0.06 ONLINE");