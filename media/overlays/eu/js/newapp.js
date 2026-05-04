/**
 * newapp.js - Entropia Scout Core Engine (Monolith Edition)
 * Version: 0.10.1 - Grand Total Fix & Decoupled Manifest Architecture
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
 * CRITICAL V0.10: State includes decoupled positioning for 
 * the Manifest Grid and the Grand Total footer.
 */
export const state = {
    twitchUser: "",
    layout: {
        nameX: 50, nameY: 70,
        terminalOutputX: 10, terminalOutputY: 10,
        manifestX: 80, manifestY: 80,
        totalX: 80, totalY: 95, // DECOUPLED: Independent Footer Position
        bubbleX: 50, bubbleY: 50,
        overlayTimerX: 10, overlayTimerY: 90, 
        showStreamerName: true,
        showTerminalOutput: true,
        showManifest: true,     // Toggles the Grid
        showTotal: true,        // DECOUPLED: Toggles the Total
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
    "manifestX", "manifestY", "totalX", "totalY",
    "bubbleX", "bubbleY", "overlayTimerX", "overlayTimerY", 
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
// --- 3. UI LOGGING & VISUALS ---
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
    const targets = document.querySelectorAll('.chat-bubble, .textcontainer, #nameplate, #session-manifest, #manifest-footer, #overlay-timer');
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
        footer: document.getElementById("manifest-footer"), 
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
    if (els.footer) {
        els.footer.style.left = state.layout.totalX + "%";
        els.footer.style.top = state.layout.totalY + "%";
        els.footer.style.display = state.layout.showTotal ? "flex" : "none";
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

    ["showStreamerName", "showTerminalOutput", "showManifest", "showTotal", "showOverlayTimer"].forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) checkbox.checked = state.layout[id];
    });

    applyStyles();
}

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
// --- 4. TWITCH (COMFY) LOGIC ---
// ===============================================

function showSessionAlert(name, total, rate, pedValue) {
    const bubble = document.getElementById("bubble");
    if (!bubble) return;

    bubble.innerHTML = `
        <div style="color: #0ec3c3; font-size: 8px; margin-bottom: 5px; border-bottom: 1px solid #444; letter-spacing: 1px; font-family: monospace;">SESSION STATS</div>
        <div style="font-size: 11px; margin: 5px 0; font-weight: bold; color: #fff;">${name.toUpperCase()}</div>
        <div style="font-size: 10px;">TOTAL: <span style="color: #ffcc00;">${total}</span></div>
        <div style="font-size: 9px; color: #aaa; margin-top: 2px;">VALUE: ${Number(pedValue).toFixed(4)} PED</div>
        <div style="color: #00ffff; font-size: 9px; margin-top: 3px;">AVG: ${rate}/HR</div>
    `;

    bubble.classList.add("show");
    if (window.bubbleTimeout) clearTimeout(window.bubbleTimeout);
    window.bubbleTimeout = setTimeout(() => bubble.classList.remove("show"), 7000);
}

const initComfy = (user) => {
    if (!user || !window.ComfyJS) return;
    
    ComfyJS.onCommand = (user, command, message, flags, extra) => {
        const cmd = command.toLowerCase();
        const chatterName = user.toLowerCase();
        const streamerTarget = state.twitchUser.toLowerCase();
        const isStreamer = (chatterName === streamerTarget);
        const isAuthorized = isStreamer || flags.mod;

        if (cmd === "help" || cmd === "commands") {
            const publicCmds = ["!test", "!sessiontotal", "!loot", "!skills", "!globals", "!deaths", "!help"];
            const authCmds = ["!startsession", "!stopsession", "!pausesession", "!resumesession"];
            const streamerCmds = ["!toggleterm", "!togglename", "!toggletotal", "!togglegrid", "!toggletimer"];
            
            let available = [...publicCmds];
            if (isAuthorized) available = [...available, ...authCmds];
            if (isStreamer) available = [...available, ...streamerCmds];
            
            addLog(`HELP: [${user.toUpperCase()}] CAN USE: ${available.join(", ")}`);
            showSessionAlert("COMMANDS", available.length, "AVAILABLE", 0);
        }

        if (cmd === "test") { 
            addLog(`CMD_TEST: REQUEST FROM ${user.toUpperCase()}`); 
            playSound("meowSound"); 
        }

        // --- UI OVERLAY TOGGLES (Streamer Only) ---
        if (isStreamer) {
            if (cmd === "toggleterm" || cmd === "toggle") {
                const status = window.toggleOverlayElement("showTerminalOutput");
                addLog(`CMD_UI: TERMINAL ${status ? 'ENABLED' : 'DISABLED'}`);
            }
            if (cmd === "togglename") {
                const status = window.toggleOverlayElement("showStreamerName");
                addLog(`CMD_UI: NAMEPLATE ${status ? 'ENABLED' : 'DISABLED'}`);
            }
            if (cmd === "togglegrid") {
                const status = window.toggleOverlayElement("showManifest");
                addLog(`CMD_UI: MANIFEST GRID ${status ? 'ENABLED' : 'DISABLED'}`);
            }
            if (cmd === "toggletotal") {
                const status = window.toggleOverlayElement("showTotal");
                addLog(`CMD_UI: GRAND TOTAL ${status ? 'ENABLED' : 'DISABLED'}`);
            }
            if (cmd === "toggletimer") {
                const status = window.toggleOverlayElement("showOverlayTimer");
                addLog(`CMD_UI: TIMER ${status ? 'ENABLED' : 'DISABLED'}`);
            }
        }

        // --- REMOTE SESSION CONTROL ---
        if (isAuthorized) {
            const startBtn = document.getElementById('start-session-btn');
            if (cmd === "startsession" && startBtn?.textContent === "START SESSION") startBtn.click();
            if (cmd === "stopsession" && startBtn?.textContent === "STOP SESSION") startBtn.click();
            if (cmd === "pausesession" && !window.isPaused) {
                window.isPaused = true;
                if (startBtn) startBtn.style.opacity = "0.5";
                addLog(`CMD_REMOTE: SESSION PAUSED BY ${user.toUpperCase()}`);
                showSessionAlert("SESSION", 0, "PAUSED", 0);
            }
            if ((cmd === "unpausesession" || cmd === "resumesession") && window.isPaused) {
                window.isPaused = false;
                if (startBtn) startBtn.style.opacity = "1.0";
                addLog(`CMD_REMOTE: SESSION RESUMED BY ${user.toUpperCase()}`);
                showSessionAlert("SESSION", 0, "RESUMED", 0);
            }
        }

        // --- STATS & SKILLS QUERIES ---
        if (cmd === "sessiontotal" || cmd === "loot") {
            const itemName = message.trim();
            if (itemName && window.sessionStats) {
                const key = Object.keys(window.sessionStats).find(k => k.trim().toLowerCase() === itemName.toLowerCase());
                if (key) {
                    const total = window.sessionStats[key];
                    const elapsedHours = (Date.now() - (window.sessionStartTime || Date.now())) / 3600000;
                    showSessionAlert(key, total, (total / Math.max(0.01, elapsedHours)).toFixed(1), window.sessionValues[key] || 0);
                    addLog(`TWITCH: ${user.toUpperCase()} QUERIED ${key}`);
                }
            }
        }

        if (cmd === "skills") {
            const targetSkill = message.trim().toLowerCase();
            if (window.sessionSkills && Object.keys(window.sessionSkills).length > 0) {
                if (!targetSkill) {
                    const top = Object.entries(window.sessionSkills).sort((a,b) => b[1]-a[1]).slice(0,3).map(([n,v])=>`${n}: ${v.toFixed(2)}`).join(" | ");
                    addLog(`TWITCH: TOP SKILLS: ${top}`);
                } else {
                    const key = Object.keys(window.sessionSkills).find(k => k.toLowerCase() === targetSkill);
                    if (key) showSessionAlert(`SKILL: ${key}`, window.sessionSkills[key].toFixed(2), "XP", 0);
                }
            }
        }
        
        if (cmd === "globals") {
            addLog(`TWITCH: ${window.globalCount || 0} GLOBALS TRACKED`);
            showSessionAlert("GLOBALS", window.globalCount || 0, "TOTAL", 0);
        }
        if (cmd === "deaths") {
            addLog(`TWITCH: ${window.sessionDeaths || 0} DEATHS TRACKED`);
            showSessionAlert("DEATHS", window.sessionDeaths || 0, "TOTAL", 0);
        }
    };

    ComfyJS.Init(user);
    addLog(`TWITCH: INITIALIZED FOR ${user.toUpperCase()}`);
};

// ===============================================
// --- 5. DATA PERSISTENCE & FILE HANDLING ---
// ===============================================
export function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function restoreFileHandle() {
    const savedHandle = await get(FILE_HANDLE_KEY);
    if (!savedHandle) return;
    try {
        const perm = await savedHandle.queryPermission({ mode: 'read' });
        const attemptInit = () => {
            if (window.initializeFile) {
                window.initializeFile(savedHandle);
                if (perm !== 'granted') {
                    const bBtn = document.getElementById("browseBtn");
                    if (bBtn) bBtn.style.boxShadow = "0 0 15px #0ec3c3";
                }
            } else { setTimeout(attemptInit, 200); }
        };
        attemptInit();
    } catch (err) { addLog("LOG_RECOVERY_FAILED", true); }
}

async function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        const loaded = JSON.parse(saved);
        Object.assign(state.layout, loaded.layout);
        state.twitchUser = loaded.twitchUser || "";
        if (state.twitchUser) initComfy(state.twitchUser);
    }

    numericSliders.forEach(id => { 
        const el = document.getElementById(id);
        if (el) el.value = state.layout[id]; 
    });

    document.querySelectorAll('.rgb-slider').forEach(slider => {
        const key = slider.dataset.color;
        const channel = slider.dataset.channel;
        if (state.layout[key]) slider.value = state.layout[key][channel];
    });
    ["borderStyle", "fontFamily"].forEach(id => { if (document.getElementById(id)) document.getElementById(id).value = state.layout[id]; });

    updateUI();
    restoreFileHandle();
}

// ===============================================
// --- 6. EVENT LISTENERS ---
// ===============================================

document.getElementById("openMenu-Butt")?.addEventListener("click", () => {
    document.getElementById("comfycontrolContainer").classList.toggle("active");
});

document.getElementById("connectBtn")?.addEventListener("click", () => {
    const user = document.getElementById("streamerInput")?.value.trim();
    if (user) {
        state.twitchUser = user;
        saveData();
        location.reload(); 
    }
});

document.querySelectorAll('.rgb-slider').forEach(slider => {
    slider.addEventListener('input', (e) => {
        const key = e.target.dataset.color;
        const channel = e.target.dataset.channel;
        state.layout[key][channel] = parseInt(e.target.value);
        applyStyles(); // Faster visual feedback for colors
    });
    slider.addEventListener('change', saveData);
});

/**
 * FIXED DECOUPLED LISTENER:
 * Ensures totalX, totalY, showTotal, and Timer elements sync with state.
 */
document.querySelectorAll('input:not(.rgb-slider), select').forEach(input => {
    input.addEventListener('input', (e) => {
        const id = e.target.id;
        
        // Verify key exists in layout
        if (id in state.layout) {
            let val;
            if (e.target.type === "checkbox") {
                val = e.target.checked;
            } else if (e.target.type === "range") {
                val = parseFloat(e.target.value);
                // Core coordinate flooring for clean CSS rendering
                if (id.endsWith('X') || id.endsWith('Y')) val = Math.floor(val);
            } else {
                val = e.target.value;
            }
            
            state.layout[id] = val;
            updateUI();
        }
    });

    // Save strictly on change or interaction end to avoid IDB/LocalStorage spam
    input.addEventListener('change', saveData);
});

document.getElementById("btnReset")?.addEventListener("click", () => {
    if(confirm("Factory Reset? This clears all layout and sound settings.")) { 
        localStorage.clear(); 
        set(FILE_HANDLE_KEY, null); 
        location.reload(); 
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setInterval(saveData, 10000);
});

addLog("APP_CORE [newapp.js]: V0.10.1 ONLINE");