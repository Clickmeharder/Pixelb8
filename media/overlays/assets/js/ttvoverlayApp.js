// --- STORAGE & SETTINGS INITIALIZATION ---
let settings = JSON.parse(localStorage.getItem('p8_settings')) || {
    botPrefix: "🤖[BOT]:",
    useBotPrefix: true,
    cmdPrefix: "ezlay",
    useCmdPrefix: true,
    consoleMessages: true,
    floatingEmotes: true,
    chatHidden: false,
    alertHidden: false,
    statusHidden: true
};
let BOT_PREFIX = settings.botPrefix;
let useBotPrefix = (String(settings.useBotPrefix) === "true");
let CMD_PREFIX = settings.cmdPrefix;
let useCmdPrefix = (String(settings.useCmdPrefix) === "true");
let floatingEmotes = (String(settings.floatingEmotes) === "true");
let consoleMessages = (String(settings.consoleMessages) === "true");

// Strict casting layout fallback normalization loops
let chatHidden = (String(settings.chatHidden) === "true");
let alertHidden = (String(settings.alertHidden) === "true");
let statusHidden = (String(settings.statusHidden) === "true");

function saveSettings() {
    settings.botPrefix = BOT_PREFIX;
    settings.useBotPrefix = useBotPrefix;
    settings.cmdPrefix = CMD_PREFIX;
    settings.useCmdPrefix = useCmdPrefix;
    settings.consoleMessages = consoleMessages;
    settings.floatingEmotes = floatingEmotes;
    
    settings.chatHidden = chatHidden;
    settings.alertHidden = alertHidden;
    settings.statusHidden = statusHidden;
    
    localStorage.setItem('p8_settings', JSON.stringify(settings));
    
    // Auto-refresh panel states inside active DOM elements if they exist
    if (typeof updateManagerBadgesUI === "function") {
        updateManagerBadgesUI();
    }
}

// --- DYNAMIC REWARD ALERT REGISTRY ---
// Allows streamers to store templates for any Channel Point reward name
let rewardAlerts = JSON.parse(localStorage.getItem('p8_reward_alerts')) || {
    "hydrate": {
        text: "💧 DRINK WATER, {user.toUpperCase()}!",
        image: "" // Optional URL string for custom gifs/images
    },
    "fart": {
        text: "💨 {user} just let one loose! It stinks in here.",
        image: ""
    }
};

function saveRewardAlerts() {
    localStorage.setItem('p8_reward_alerts', JSON.stringify(rewardAlerts));
}

const BOT_IDENTITY = "PIXELB8";
const CLIENT_ID = "l1zvkm35dmtw4doj4y699nhnvx655c";
const REDIRECT_URI = "pixelb8.lol/media/overlays/ezlay";
const FULL_REDIRECT = "https://" + REDIRECT_URI;
let activeChannel = "";

// Dom Elements (Adjusted for your new three-widget structure)
const alertWidget = document.getElementById("alert-widget");
const alertText = document.getElementById("alert-text");
const alertImage = document.getElementById("alert-image");
const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");

let isEditMode = true, dragTarget = null, offset = { x: 0, y: 0 }, fadeTimeout;

let registry = JSON.parse(localStorage.getItem('p8_registry')) || {
    active: 'Default',
    themes: {
        'Default': { 
            '--bg': 'rgba(24, 24, 27, 0.8)', 
            '--accent': '#9146ff', 
            '--border-color': '#9146ff', 
            '--border-radius': '12px', 
            '--font-size': '18px',
            '--font-family': "'Segoe UI', sans-serif",
            '--border-style': 'solid'
        }
    }
};

const styleConfig = [
    { 
        id: 'font', 
        label: 'Font Family', 
        var: '--font-family', 
        type: 'select', 
        options: [
            "'Segoe UI', system-ui, sans-serif", 
            "Inter, 'Helvetica Neue', Arial, sans-serif",
            "'Courier New', monospace", 
            "'Lucida Console', Monaco, monospace",
            "Consolas, 'Andale Mono', monospace",
            "Impact, Charcoal, sans-serif", 
            "'Arial Black', Gadget, sans-serif",
            "Georgia, serif", 
            "'Times New Roman', Times, serif",
            "'Palatino Linotype', 'Book Antiqua', serif",
            "cursive", 
            "'Comic Sans MS', 'Comic Sans', cursive",
            "Trebuchet MS, sans-serif"
        ] 
    },
    { id: 'size', label: 'Text Size', var: '--font-size', type: 'range', min: 12, max: 48 },
    { id: 'bg', label: 'Widget Background', var: '--bg', type: 'hsla' },
    { id: 'bstyle', label: 'Border Style', var: '--border-style', type: 'select', options: ['solid', 'dashed', 'dotted', 'double', 'none'] },
    { id: 'accent', label: 'Accent & Border Color', var: '--accent', type: 'hsla' },
    { id: 'radius', label: 'Corner Radius', var: '--border-radius', type: 'range', min: 0, max: 50 }
];

// --- OBS CONSOLE BRIDGE ---
const originalLog = console.log;
const originalError = console.error;
const originalWarn = console.warn;

console.log = function(...args) {
    originalLog.apply(console, args);
    const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    displayConsoleMessage("DEBUG", msg);
};

console.error = function(...args) {
    originalError.apply(console, args);
    const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    displayConsoleMessage("ERROR", msg);
};

console.warn = function(...args) {
    originalWarn.apply(console, args);
    const msg = args.map(arg => typeof arg === 'object' ? JSON.stringify(arg) : arg).join(' ');
    displayConsoleMessage("WARN", msg);
};

// --- MODAL & HELPERS ---
async function p8Confirm(message, isAlert = false) {
    const overlay = document.getElementById('p8-modal-overlay');
    const msgEl = document.getElementById('modal-msg');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');
    
    msgEl.innerText = message;
    cancelBtn.style.display = isAlert ? 'none' : 'block';
    overlay.style.display = 'flex';

    return new Promise((resolve) => {
        const cleanup = (val) => {
            overlay.style.display = 'none';
            confirmBtn.replaceWith(confirmBtn.cloneNode(true));
            cancelBtn.replaceWith(cancelBtn.cloneNode(true));
            resolve(val);
        };
        document.getElementById('modal-confirm').addEventListener('click', () => cleanup(true));
        document.getElementById('modal-cancel').addEventListener('click', () => cleanup(false));
    });
}



// Centralized Generic Audio Utility
function playSound(audioSource, volume = 0.8) {
    if (!audioSource) return;

    try {
        const audio = new Audio(audioSource);
        audio.volume = Math.min(Math.max(volume, 0), 1); // Clamp volume between 0.0 and 1.0
        
        // Play the audio asset
        audio.play().catch(err => {
            console.error("Audio playback blocked or failed:", err);
        });

        // Cleanup memory once playback finishes
        audio.onended = () => {
            audio.remove();
        };
    } catch (e) {
        console.error("Failed to initialize audio element:", e);
    }
}

// Staged storage arrays for the current item actively open in the template form editor
let stagedSoundsPool = [];

// Helper utility to render active sound chips inside the editor panel
function renderStagedSoundsUI() {
    const listContainer = document.getElementById("reward-sounds-list");
    if (!listContainer) return;
    
    listContainer.innerHTML = "";
    
    if (stagedSoundsPool.length === 0) {
        listContainer.innerHTML = `<div style="font-size: 11px; color: #52525b; font-style: italic; padding: 4px;">No custom audio assigned.</div>`;
        return;
    }
    
    stagedSoundsPool.forEach((soundItem, index) => {
        const soundRow = document.createElement("div");
        soundRow.style.cssText = "display: flex; gap: 8px; justify-content: space-between; align-items: center; background: #09090b; border: 1px solid #27272a; padding: 6px 10px; border-radius: 6px; font-size: 11px;";
        
        // Fallback properties for safety configuration management
        let displayName = `🔊 Custom Sound #${index + 1}`;
        let audioPlayTarget = "";
        let currentVol = 1.0;

        if (soundItem && typeof soundItem === "object") {
            displayName = soundItem.name || displayName;
            audioPlayTarget = soundItem.data || "";
            currentVol = soundItem.volume !== undefined ? soundItem.volume : 1.0;
        } else if (typeof soundItem === "string") {
            // Backward compatibility tracking loop for legacy data variants
            displayName = soundItem.startsWith("data:") ? `🔊 Custom Sound #${index + 1}` : soundItem.split('/').pop();
            audioPlayTarget = soundItem;
        }
        
        soundRow.innerHTML = `
            <div style="display: flex; flex-direction: column; flex-grow: 1; min-width: 0;">
                <span style="color: #e4e4e7; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 160px; margin-bottom: 2px;" title="${displayName}">${displayName}</span>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-size: 9px; color: #71717a; font-family: monospace; width: 24px;">Vol:</span>
                    <input type="range" class="sound-vol-slider" min="0" max="1" step="0.05" value="${currentVol}" style="width: 70px; height: 3px; accent-color: var(--accent); cursor: pointer; margin: 0; padding: 0;">
                    <span class="vol-label" style="font-size: 9px; color: #a1a1aa; font-family: monospace; width: 26px; text-align: right;">${Math.round(currentVol * 100)}%</span>
                </div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
                <button type="button" class="play-preview-btn" style="background: none; border: none; color: var(--accent); cursor: pointer; padding: 2px;">▶️</button>
                <button type="button" style="background: none; border: none; color: #f87171; cursor: pointer; padding: 2px;" onclick="removeStagedSoundItem(${index})">❌</button>
            </div>
        `;

        // Update volume value inside the data object array when the slider is dragged
        const slider = soundRow.querySelector(".sound-vol-slider");
        const volLabel = soundRow.querySelector(".vol-label");
        
        slider.addEventListener("input", function() {
            const v = parseFloat(this.value);
            volLabel.innerText = `${Math.round(v * 100)}%`;
            
            if (stagedSoundsPool[index] && typeof stagedSoundsPool[index] === "object") {
                stagedSoundsPool[index].volume = v;
            } else if (typeof stagedSoundsPool[index] === "string") {
                // Upgrade string on-the-fly to prevent syntax runtime bugs if user slides an legacy object item
                stagedSoundsPool[index] = {
                    name: displayName,
                    data: audioPlayTarget,
                    volume: v
                };
            }
        });

        // Test play layout handler with specific assigned settings configuration
        soundRow.querySelector(".play-preview-btn").addEventListener("click", () => {
            const currentObj = stagedSoundsPool[index];
            const targetVolume = (currentObj && typeof currentObj === "object" && currentObj.volume !== undefined) ? currentObj.volume : 0.7;
            playSound(audioPlayTarget, targetVolume);
        });

        listContainer.appendChild(soundRow);
    });
}

// Global hook execution to safely pull items out of memory cache via index position
window.removeStagedSoundItem = function(index) {
    stagedSoundsPool.splice(index, 1);
    renderStagedSoundsUI();
};


function hexToHSLA(hex) {
    if(!hex || hex.startsWith('hsla')) return parseHSLA(hex || 'hsla(0,0%,0%,1)');
    if(hex.startsWith('rgba')) {
        const vals = hex.match(/\d+(\.\d+)?/g);
        return rgbToHSLA(vals[0], vals[1], vals[2], vals[3] || 1);
    }
    let r=0, g=0, b=0;
    if (hex.length == 4) { r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3]; }
    else { r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6]; }
    return rgbToHSLA(r, g, b, 1);
}
function rgbToHSLA(r, g, b, a) {
    r /= 255; g /= 255; b /= 255;
    let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin, h = 0, s = 0, l = 0;
    if (delta == 0) h = 0; else if (cmax == r) h = ((g - b) / delta) % 6; else if (cmax == g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4;
    h = Math.round(h * 60); if (h < 0) h += 360;
    l = (cmax + cmin) / 2; s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    return { h, s: Math.round(s * 100), l: Math.round(l * 100), a: parseFloat(a) };
}
function parseHSLA(str) {
    const vals = str.match(/\d+(\.\d+)?/g);
    return { h: vals[0], s: vals[1], l: vals[2], a: vals[3] || 1 };
}




function init() {
    applyTheme(registry.active);
    const params = new URLSearchParams(window.location.search);
    if (params.get("token") && params.get("channel")) {
        document.body.style.backgroundColor = "transparent";
        document.body.style.backgroundImage = "none";
        document.getElementById("overlay-wrapper").style.display = "block";
        setEditMode(false);
        startTwitch(params.get("channel"), params.get("token"));
    } else {
        document.body.style.backgroundColor = "#1a1a1a";
        document.body.style.backgroundImage = "none";
        document.getElementById("setup-interface").style.display = "block";
        checkTwitchAuth();
    }
    loadPositions();
    renderThemeControls();
    
    // Auto-populates registry array cache instantly on application kick-off
    renderRewardsList(); 
    
    bindEvents();
}

function setEditMode(state) {
    isEditMode = state;
    document.body.classList.toggle('edit-mode', isEditMode);
    const badge = document.getElementById('mode-badge');
    if(badge) badge.style.display = isEditMode ? 'block' : 'none';
}

function applyTheme(name) {
    const theme = registry.themes[name];
    Object.keys(theme).forEach(k => document.documentElement.style.setProperty(k, theme[k]));
    if(theme['--accent']) document.documentElement.style.setProperty('--border-color', theme['--accent']);
    registry.active = name;
    localStorage.setItem('p8_registry', JSON.stringify(registry));
}

async function systemReset() {
    if(await p8Confirm("This will logout and reset your local settings. Proceed?")) {
        localStorage.clear();
        window.location.href = FULL_REDIRECT;
    }
}
// --- WORKSPACE DATA GRAPH & ANIMATION MANIFESTS ---
let pendingImageBase64 = "";

const AVAILABLE_IN_ANIMATIONS = ["none", "fadeIn", "bounceIn", "zoomIn", "slideInDown", "slideInUp"];
const AVAILABLE_OUT_ANIMATIONS = ["none", "fadeOut", "bounceOut", "zoomOut", "slideOutUp", "slideOutDown"];

// Data registries for the options blocks
const CUSTOM_SELECT_DATA = {
    "reward-text-in-anim": AVAILABLE_IN_ANIMATIONS,
    "reward-img-in-anim": AVAILABLE_IN_ANIMATIONS,
    "reward-text-out-anim": AVAILABLE_OUT_ANIMATIONS,
    "reward-img-out-anim": AVAILABLE_OUT_ANIMATIONS,
    "reward-font-weight": [
        { value: "normal", label: "Normal (400)" },
        { value: "bold", label: "Bold (700)" },
        { value: "900", label: "Black (900)" },
        { value: "300", label: "Light (300)" }
    ],
    "reward-img-mode": [
        { value: "loop", label: "Loop Continuously" },
        { value: "once", label: "Play Once (Reset)" }
    ]
};

// State engine to track actively selected values since we don't have standard .value anymore
let customSelectValues = {
    "reward-text-in-anim": "none",
    "reward-text-out-anim": "none",
    "reward-img-in-anim": "none",
    "reward-img-out-anim": "none",
    "reward-font-weight": "bold",
    "reward-img-mode": "loop"
};

// Programmatic getter and setter wrappers to maintain backward compatibility with your save actions
function getCustomSelectValue(id) {
    return customSelectValues[id];
}

function setCustomSelectValue(id, value) {
    customSelectValues[id] = value;
    const displayEl = document.getElementById(`display-${id}`);
    if (!displayEl) return;

    // Resolve structural label representations if tracking raw object lists
    const dataset = CUSTOM_SELECT_DATA[id];
    if (dataset && typeof dataset[0] === 'object') {
        const matched = dataset.find(item => item.value === value);
        displayEl.innerText = matched ? matched.label : value;
    } else {
        displayEl.innerText = value;
    }
}

function populateCustomDropdowns() {
    Object.keys(CUSTOM_SELECT_DATA).forEach(id => {
        const displayEl = document.getElementById(`display-${id}`);
        const optionsEl = document.getElementById(`options-${id}`);
        if (!displayEl || !optionsEl) return;

        const optionsData = CUSTOM_SELECT_DATA[id];
        optionsEl.innerHTML = ""; // Flush template buffer

        // Generate elements dynamically matching the option-item class framework
        optionsData.forEach(item => {
            const val = typeof item === 'object' ? item.value : item;
            const text = typeof item === 'object' ? item.label : item;
            
            const row = document.createElement("div");
            row.className = "option-item";
            row.innerText = text;
            row.style.cssText = "padding: 6px 10px; font-size: 11px; color: #e4e4e7; cursor: pointer; transition: background 0.2s;";
            
            // Hover styles matching custom CSS style configurations
            row.addEventListener("mouseenter", () => row.style.background = "rgba(255,255,255,0.05)");
            row.addEventListener("mouseleave", () => row.style.background = "transparent");

            row.addEventListener("click", (e) => {
                e.stopPropagation();
                setCustomSelectValue(id, val);
                optionsEl.style.display = "none";
            });
            optionsEl.appendChild(row);
        });

        // Click wrapper to toggle display layout state maps
        displayEl.addEventListener("click", (e) => {
            e.stopPropagation();
            // Close all other open instances first to prevent stack issues
            document.querySelectorAll(".custom-select-options-box").forEach(box => {
                if(box !== optionsEl) box.style.display = "none";
            });
            optionsEl.style.display = optionsEl.style.display === "block" ? "none" : "block";
        });
    });
}

// 1. Hook up UI Toggle Actions inside your bindEvents() function block
// Helper tracking routine to update the control deck indicators
function updateManagerBadgesUI() {
    const badge = document.getElementById("mgr-alert-status-badge");
    if (!badge) return;
    
    if (alertHidden) {
        badge.innerText = "MUTED";
        badge.style.background = "#7f1d1d";
        badge.style.color = "#fecaca";
    } else {
        badge.innerText = "ACTIVE";
        badge.style.background = "#064e3b";
        badge.style.color = "#a7f3d0";
    }
}

function bindRewardsManagerEvents() {
    const rewardsPanel = document.getElementById("rewards-manager");
    const fileInput = document.getElementById("reward-file-input");
    const urlInput = document.getElementById("reward-img-input");
    
    // Core references for the audio pool form elements
    const soundFileInput = document.getElementById("reward-sound-file");
    const addSoundBtn = document.getElementById("push-sound-btn");
    const labelSoundBtn = document.getElementById("add-sound-file-btn");

    // Style and Pipeline Lifetime Configuration Elements
    const fontSizeInput = document.getElementById("reward-font-size");
    const fontColorPicker = document.getElementById("reward-font-color");
    const fontColorHex = document.getElementById("reward-font-color-hex");
    const textOutlineInput = document.getElementById("reward-text-outline");
    const imgSizeInput = document.getElementById("reward-img-size");
    
    // New Lifetime & GIF Playback Elements
    const textDurationInput = document.getElementById("reward-text-duration");
    const imgDurationInput = document.getElementById("reward-img-duration");

    // Synchronize color picker with hex input field natively
    if (fontColorPicker && fontColorHex) {
        fontColorPicker.addEventListener("input", function() {
            fontColorHex.value = this.value;
        });
        fontColorHex.addEventListener("input", function() {
            if (/^#[0-9A-F]{6}$/i.test(this.value)) {
                fontColorPicker.value = this.value;
            }
        });
    }

    // Initialize animation selector choices directly on application setup
    populateCustomDropdowns();
    
    // Render initial settings states into the control badges
    updateManagerBadgesUI();

    // Wire up the control deck toggle button click handler
    const deckToggleBtn = document.getElementById("mgr-toggle-alert-btn");
    if (deckToggleBtn) {
        deckToggleBtn.addEventListener("click", () => {
            alertHidden = !alertHidden;
            saveSettings();
            
            // Instantly refresh the visual text badge on the control panel panel
            updateManagerBadgesUI();
            
            // Sync active visibility changes instantly
            if (alertWidget) {
                if (alertHidden) {
                    alertWidget.style.display = "none";
                    alertWidget.style.opacity = "0";
                } else {
                    // Restore default visibility state so upcoming redeems render natively
                    alertWidget.style.display = "block";
                    alertWidget.style.opacity = "1";
                }
            }
        });
    }

    // Open panel from context option
    document.getElementById("ctx-open-rewards").addEventListener("click", () => {
        rewardsPanel.style.display = "block";
        document.getElementById('p8-ctx-menu').style.display = 'none';
        updateManagerBadgesUI();
        renderRewardsList();
    });

    // Close Button layout routine
    document.getElementById("close-rewards-btn").addEventListener("click", () => {
        rewardsPanel.style.display = "none";
    });

    // Convert local files to persistent Base64 Data Strings
    fileInput.addEventListener("change", function() {
        const file = this.files[0];
        if (!file) {
            pendingImageBase64 = "";
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            pendingImageBase64 = e.target.result; // Holds complete inline data:image/... base64 string
            urlInput.value = ""; // Clear text input to show file asset takes priority
            urlInput.placeholder = "Using selected local file asset...";
        };
        reader.readAsDataURL(file);
    });

    // Clear file selection if user goes back to typing a URL link
    urlInput.addEventListener("input", function() {
        if (this.value.trim() !== "") {
            fileInput.value = "";
            pendingImageBase64 = "";
            urlInput.placeholder = "Web Image/GIF URL";
        }
    });

    // --- SOUND FILE ASSET MONITORING LISTENERS ---
    let loadedAudioBase64 = "";
    let loadedAudioName = ""; 

    soundFileInput.addEventListener("change", function(e) {
        const file = e.target.files[0];
        
        if (!file) {
            loadedAudioBase64 = "";
            loadedAudioName = "";
            addSoundBtn.disabled = true;
            labelSoundBtn.innerText = "🎵 Choose Sound Asset";
            return;
        }
        
        loadedAudioName = file.name;
        labelSoundBtn.innerText = `📁 ${file.name}`;
        
        const reader = new FileReader();
        reader.onload = function(evt) {
            loadedAudioBase64 = evt.target.result;
            addSoundBtn.disabled = false;
        };
        reader.readAsDataURL(file);
    });

    // Push asset onto the active staged storage tracking pool registry
    addSoundBtn.addEventListener("click", function() {
        if (!loadedAudioBase64) return;
        
        stagedSoundsPool.push({
            name: loadedAudioName,
            data: loadedAudioBase64,
            volume: 1.0
        });
        
        loadedAudioBase64 = "";
        loadedAudioName = "";
        soundFileInput.value = "";
        labelSoundBtn.innerText = "🎵 Choose Sound Asset";
        this.disabled = true;
        
        renderStagedSoundsUI();
    });

    // Save and register configuration handler
    document.getElementById("save-reward-btn").addEventListener("click", () => {
        const nameEl = document.getElementById("reward-name-input");
        const textEl = document.getElementById("reward-text-input");

        const nameKey = nameEl.value.trim().toLowerCase();
        const alertText = textEl.value.trim();
        
        let finalImage = pendingImageBase64 ? pendingImageBase64 : urlInput.value.trim();

        if (!nameKey || !alertText) {
            alert("Reward Name and Alert Text are required!");
            return;
        }

        rewardAlerts[nameKey] = {
            text: alertText,
            image: finalImage,
            textInAnim: getCustomSelectValue("reward-text-in-anim"),
            textOutAnim: getCustomSelectValue("reward-text-out-anim"),
            imgInAnim: getCustomSelectValue("reward-img-in-anim"),
            imgOutAnim: getCustomSelectValue("reward-img-out-anim"),
            sounds: [...stagedSoundsPool],
            fontSize: fontSizeInput.value.trim(),
            fontColor: fontColorHex.value.trim(),
            textOutline: textOutlineInput.value.trim(),
            fontWeight: getCustomSelectValue("reward-font-weight"),
            imgSize: imgSizeInput.value.trim() || "",
            textDuration: textDurationInput ? textDurationInput.value.trim() : "",
            imgMode: getCustomSelectValue("reward-img-mode"),
            imgDuration: imgDurationInput ? imgDurationInput.value.trim() : ""
        };
        saveRewardAlerts();

        // UI Reset sequence
        nameEl.value = "";
        textEl.value = "";
        urlInput.value = "";
        urlInput.placeholder = "Web Image/GIF URL";
        fileInput.value = "";
        pendingImageBase64 = "";
        
        // Dynamic resets to state-engine variable tracking entries
        setCustomSelectValue("reward-text-in-anim", "none");
        setCustomSelectValue("reward-text-out-anim", "none");
        setCustomSelectValue("reward-img-in-anim", "none");
        setCustomSelectValue("reward-img-out-anim", "none");
        setCustomSelectValue("reward-font-weight", "bold");
        setCustomSelectValue("reward-img-mode", "loop");
        
        fontSizeInput.value = "";
        fontColorPicker.value = "#ffffff";
        fontColorHex.value = "#ffffff";
        textOutlineInput.value = "";
        imgSizeInput.value = "";
        
        if (textDurationInput) textDurationInput.value = "";
        if (imgDurationInput) imgDurationInput.value = "";
        
        stagedSoundsPool = [];
        if (typeof renderStagedSoundsUI === "function") renderStagedSoundsUI();
        soundFileInput.value = "";
        labelSoundBtn.innerText = "🎵 Choose Sound Asset";
        addSoundBtn.disabled = true;
        
        renderRewardsList();
    });
}

function renderRewardsList() {
    const container = document.getElementById("rewards-list-container");
    if (!container) return;
    container.innerHTML = "";

    const keys = Object.keys(rewardAlerts);
    if (keys.length === 0) {
        container.innerHTML = `<div style="font-size: 12px; color: #71717a; text-align: center; padding: 10px;">No custom rewards mapped yet.</div>`;
        return;
    }

    keys.forEach(key => {
        const rewardData = rewardAlerts[key];
        const item = document.createElement("div");
        item.style.cssText = "background: rgba(255,255,255,0.05); padding: 10px; border-radius: 6px; border: 1px solid #27272a; position: relative;";
        
        const isBase64 = rewardData.image && rewardData.image.startsWith("data:");
        const imageDisplaySrc = isBase64 ? "[Local Embedded File]" : (rewardData.image || "[None]");

        const tIn = rewardData.textInAnim || "none";
        const tOut = rewardData.textOutAnim || "none";
        const iIn = rewardData.imgInAnim || "none";
        const iOut = rewardData.imgOutAnim || "none";
        const soundCount = rewardData.sounds ? rewardData.sounds.length : 0;
        
        const fSize = rewardData.fontSize || "[Default]";
        const fColor = rewardData.fontColor || "#ffffff";
        const fWeight = rewardData.fontWeight || "bold";
        const tOutline = rewardData.textOutline || "[Default]";
        const iSize = rewardData.imgSize || "[Default]";
        
        // Runtime fallbacks for list visualization
        const tDur = rewardData.textDuration ? `${rewardData.textDuration}ms` : "8000ms [Def]";
        const iMode = rewardData.imgMode || "loop";
        const iDur = rewardData.imgDuration ? `${rewardData.imgDuration}ms` : (iMode === "once" ? "Once Match" : "Text Match");

        item.innerHTML = `
            <div style="font-weight: bold; color: var(--accent); font-size: 13px; margin-bottom: 4px; text-transform: uppercase;">${key}</div>
            <div style="font-size: 12px; color: #e4e4e7; margin-bottom: 2px; word-break: break-word;"><strong>Txt:</strong> ${rewardData.text}</div>
            <div style="font-size: 11px; color: #a1a1aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><strong>Asset:</strong> ${imageDisplaySrc}</div>
            <div style="font-size: 10px; color: #71717a; margin-top: 4px; font-family: monospace; line-height: 1.4;">
                Txt: [In: ${tIn} | Out: ${tOut}] (Dur: ${tDur})<br>
                Img: [In: ${iIn} | Out: ${iOut}] (Playback: ${iMode} | Dur: ${iDur})<br>
                Style: [Sz: ${fSize} | Clr: ${fColor} | Wt: ${fWeight} | Outln: ${tOutline} | ImgSz: ${iSize}]<br>
                Audio Pool: [${soundCount} active sounds]
            </div>
            <div style="display: flex; gap: 6px; margin-top: 8px;">
                <button class="p8-btn test-btn" style="padding: 2px 8px; font-size: 11px; background: rgba(168, 85, 247, 0.2); color: #c084fc; border: 1px solid #a855f7;">Test</button>
                <button class="p8-btn alt-btn" style="padding: 2px 8px; font-size: 11px;">Edit</button>
                <button class="p8-btn del-btn" style="padding: 2px 8px; font-size: 11px; background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid #ef4444;">Delete</button>
            </div>
        `;

        // Trigger Simulated Alert Testing Pipeline
        item.querySelector(".test-btn").addEventListener("click", () => {
            triggerAlertPipeline(key, "StreamerTest", 500, "Testing my custom overlays!");
        });

        // Populate form layout parameters on Edit click
        item.querySelector(".alt-btn").addEventListener("click", () => {
            document.getElementById("reward-name-input").value = key;
            document.getElementById("reward-text-input").value = rewardData.text;
            
            document.getElementById("reward-font-size").value = rewardData.fontSize || "";
            document.getElementById("reward-font-color").value = rewardData.fontColor || "#ffffff";
            document.getElementById("reward-font-color-hex").value = rewardData.fontColor || "#ffffff";
            document.getElementById("reward-text-outline").value = rewardData.textOutline || "";
            document.getElementById("reward-img-size").value = rewardData.imgSize || "";
            
            // Map configuration fields during target selection
            if (document.getElementById("reward-text-duration")) {
                document.getElementById("reward-text-duration").value = rewardData.textDuration || "";
            }
            if (document.getElementById("reward-img-duration")) {
                document.getElementById("reward-img-duration").value = rewardData.imgDuration || "";
            }
            
            // --- DROPDOWN WORKSPACE STATE ENGINES MAPPING REPLACEMENTS ---
            setCustomSelectValue("reward-text-in-anim", tIn);
            setCustomSelectValue("reward-text-out-anim", tOut);
            setCustomSelectValue("reward-img-in-anim", iIn);
            setCustomSelectValue("reward-img-out-anim", iOut);
            setCustomSelectValue("reward-font-weight", rewardData.fontWeight || "bold");
            setCustomSelectValue("reward-img-mode", rewardData.imgMode || "loop");
            
            if (isBase64) {
                pendingImageBase64 = rewardData.image;
                document.getElementById("reward-img-input").value = "";
                document.getElementById("reward-img-input").placeholder = "Using loaded local embedded file asset...";
            } else {
                pendingImageBase64 = "";
                document.getElementById("reward-img-input").value = rewardData.image || "";
                document.getElementById("reward-img-input").placeholder = "Web Image/GIF URL";
            }
            document.getElementById("reward-file-input").value = "";

            // --- LOAD PRE-EXISTING SOUNDS INTO THE POOL EDITOR ---
            if (rewardData.sounds && Array.isArray(rewardData.sounds)) {
                stagedSoundsPool = [...rewardData.sounds];
            } else {
                stagedSoundsPool = [];
            }
            if (typeof renderStagedSoundsUI === "function") {
                renderStagedSoundsUI();
            }
        });

        // Bind delete processing
        item.querySelector(".del-btn").addEventListener("click", () => {
            if (confirm(`Remove alert layout tracking for [${key}]?`)) {
                delete rewardAlerts[key];
                saveRewardAlerts();
                renderRewardsList();
            }
        });

        container.appendChild(item);
    });
}

// --- EVENT BINDING ---
function bindEvents() {
    const SCOPES = "chat:read chat:edit channel:read:redemptions";
    document.getElementById("login-button").addEventListener("click", () => {
        window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(FULL_REDIRECT)}&response_type=token&scope=${encodeURIComponent(SCOPES)}`;
    });

    document.getElementById("obs-url-output").addEventListener("click", function() {
        navigator.clipboard.writeText(this.innerText);
        const old = this.innerText; this.innerText = "COPIED TO CLIPBOARD!";
        setTimeout(() => this.innerText = old, 1500);
    });

    document.getElementById("ctx-open-editor").addEventListener("click", () => {
        document.getElementById('style-editor').style.display = 'block';
        document.getElementById('p8-ctx-menu').style.display = 'none';
        renderThemeList();
    });

    document.getElementById("quick-theme-btn").addEventListener("click", () => {
        document.getElementById('style-editor').style.display = 'block';
        renderThemeList();
    });
    
    document.getElementById("ctx-lock").addEventListener("click", (e) => {
        e.stopPropagation();
        setEditMode(!isEditMode);
        document.getElementById('p8-ctx-menu').style.display = 'none';
    });

    document.getElementById("ctx-reset").addEventListener("click", systemReset);
    document.getElementById("logout-btn-ui").addEventListener("click", systemReset);
    document.getElementById("close-editor-btn").addEventListener("click", () => document.getElementById('style-editor').style.display = 'none');

    document.getElementById('current-theme-display').addEventListener('click', (e) => {
        e.stopPropagation();
        const opts = document.getElementById('theme-options');
        opts.style.display = opts.style.display === 'block' ? 'none' : 'block';
    });

    document.getElementById('save-theme-btn').addEventListener('click', async () => {
        const newName = document.getElementById('theme-name-input').value.trim() || 'Custom Theme';
        registry.themes[newName] = JSON.parse(JSON.stringify(registry.themes[registry.active]));
        registry.active = newName;
        localStorage.setItem('p8_registry', JSON.stringify(registry));
        renderThemeList();
        await p8Confirm('Theme Settings Saved', true);
    });

	window.addEventListener('mousedown', e => {
        const menu = document.getElementById('p8-ctx-menu');
        const opts = document.getElementById('theme-options');
        
        // 1. GLOBAL CLOSING LOGIC (Runs on any click across the app)
        if (menu.style.display === 'block' && !menu.contains(e.target)) menu.style.display = 'none';
        if (opts.style.display === 'block' && !e.target.closest('#theme-selector')) opts.style.display = 'none';
        
        // Clear all dynamically generated theme controls options boxes if clicking abstractly
        if (!e.target.closest('.custom-select-display')) {
            document.querySelectorAll(".custom-select-options-box").forEach(b => b.style.display = "none");
        }
        
        // 2. SAFETY INTERCEPT GUARD CLAUSE (Protects inputs and panels from breaking drag states)
        if (!isEditMode || e.button !== 0 || e.target.closest('#style-editor') || e.target.closest('#rewards-manager') || e.target.closest('.setup-container') || e.target.closest('.p8-modal')) return;
        
        // 3. WIDGET DRAGGING SYSTEM
        dragTarget = e.target.closest('.p8-widget');
        if (dragTarget) {
            const r = dragTarget.getBoundingClientRect();
            offset = { x: e.clientX - r.left, y: e.clientY - r.top };
        }
    });

    window.addEventListener('mousemove', e => {
        if (dragTarget) {
            dragTarget.style.left = (e.clientX - offset.x) + 'px';
            dragTarget.style.top = (e.clientY - offset.y) + 'px';
        }
    });

    window.addEventListener('mouseup', () => {
        if (dragTarget) {
            localStorage.setItem(`p8_pos_${dragTarget.id}`, JSON.stringify({top: dragTarget.style.top, left: dragTarget.style.left}));
            dragTarget = null;
        }
    });

    window.addEventListener('contextmenu', e => {
        if (e.target.closest('.setup-container') || e.target.closest('.p8-modal')) return;
        e.preventDefault();
        const menu = document.getElementById('p8-ctx-menu');
        menu.style.display = 'block'; menu.style.left = e.clientX + 'px'; menu.style.top = e.clientY + 'px';
    });

    bindRewardsManagerEvents();
}
// --- CENTRALIZED ALERT PIPELINE ENGINE ---
// Handles formatting, visual injections, animations, and chat confirmation outputs
function triggerAlertPipeline(reward, user, cost, message) {
    console.log(`${user} redeemed ${reward} for ${cost || 0} points!`);
    
    const lookupName = reward.toLowerCase().trim();

    // --- FIX: If alerts are muted/hidden globally, skip all visual/audio renderings ---
    if (alertHidden) {
        if (lookupName === "hydrate") {
            botSay(`Drink up, Captain @${user}!`);
        } else if (lookupName === "fart") {
            botSay(`@${user}! You just stank up the whole feed.`);
        } else {
            botSay(`@${user} spent ${cost || 0} points on ${reward}.`);
        }
        return; // Halt routine instantly!
    }

    if (!alertWidget || !alertText) return;

    // Clear tracking timeouts to prevent cascading visual collapses
    clearTimeout(window.fadeTimeout);
    clearTimeout(window.imgClearTimeout);

    // Reset layout modifications back to global defaults
    alertText.style.fontSize = "";
    alertText.style.color = "";
    alertText.style.fontWeight = "";
    alertText.style.textShadow = "";

    // Structural initialization defaults
    let config = {
        text: `✨ <strong>${user}</strong> spent ${cost || 0} points on <br><strong>${reward}</strong>! ✨`,
        image: "",
        textInAnim: "fadeIn",
        textOutAnim: "fadeOut",
        imgInAnim: "fadeIn",
        imgOutAnim: "fadeOut",
        sounds: [],
        fontSize: "",
        fontColor: "",
        textOutline: "",
        fontWeight: "bold",
        imgSize: "",
        // Lifecycles tracking parameters
        textDuration: 8000, 
        imgMode: "loop",
        imgDuration: null
    };

    // Apply custom settings overrides if present in store matching records
    if (rewardAlerts && rewardAlerts[lookupName]) {
        const custom = rewardAlerts[lookupName];
        config.text = custom.text
            .replace(/{user}/gi, user)
            .replace(/{user.toUpperCase\(\)}/gi, user.toUpperCase())
            .replace(/{cost}/gi, cost || 0)
            .replace(/{message}/gi, message || "");
        
        config.image = custom.image || "";
        if (custom.textInAnim) config.textInAnim = custom.textInAnim;
        if (custom.textOutAnim) config.textOutAnim = custom.textOutAnim;
        if (custom.imgInAnim) config.imgInAnim = custom.imgInAnim;
        if (custom.imgOutAnim) config.imgOutAnim = custom.imgOutAnim;
        if (custom.sounds) config.sounds = custom.sounds; 

        config.fontSize = custom.fontSize || "";
        config.fontColor = custom.fontColor || "";
        config.textOutline = custom.textOutline || "";
        config.fontWeight = custom.fontWeight || "bold";
        config.imgSize = custom.imgSize || "";
        
        // Parse custom durations smoothly
        if (custom.textDuration && !isNaN(custom.textDuration)) {
            config.textDuration = parseInt(custom.textDuration, 10);
        }
        if (custom.imgMode) config.imgMode = custom.imgMode;
        if (custom.imgDuration && !isNaN(custom.imgDuration)) {
            config.imgDuration = parseInt(custom.imgDuration, 10);
        }
    }

    // --- APPLY STYLE INJECTIONS TO OUTLET DOM ---
    if (config.fontSize) alertText.style.fontSize = config.fontSize;
    if (config.fontColor) alertText.style.color = config.fontColor;
    if (config.fontWeight) alertText.style.fontWeight = config.fontWeight;
    
    if (config.textOutline) {
        if (!config.textOutline.includes(",")) {
            const parts = config.textOutline.trim().split(/\s+/);
            if (parts.length === 2) {
                const size = parts[0];
                const clr = parts[1];
                alertText.style.textShadow = `${size} ${size} 0px ${clr}, -${size} -${size} 0px ${clr}, ${size} -${size} 0px ${clr}, -${size} ${size} 0px ${clr}`;
            } else {
                alertText.style.textShadow = config.textOutline;
            }
        } else {
            alertText.style.textShadow = config.textOutline;
        }
    } else {
        alertText.style.textShadow = "3px 3px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000";
    }

    // --- HANDLE SOUND POOL SELECTION ---
    if (config.sounds && config.sounds.length > 0) {
        const randomIndex = Math.floor(Math.random() * config.sounds.length);
        const chosenItem = config.sounds[randomIndex];
        
        let targetAudioSource = "";
        let targetVolume = 0.85; 

        if (chosenItem && typeof chosenItem === "object") {
            targetAudioSource = chosenItem.data || "";
            if (chosenItem.volume !== undefined) {
                targetVolume = chosenItem.volume;
            }
        } else if (typeof chosenItem === "string") {
            targetAudioSource = chosenItem;
        }
        
        if (targetAudioSource) {
            playSound(targetAudioSource, targetVolume);
        }
    }

    // Strip previous animation state styles completely
    alertText.className = "";
    if (alertImage) alertImage.className = "";

    // Inject alert payload strings
    alertText.innerHTML = config.text;
    
    if (config.image && alertImage) {
        const finalSizeStyle = config.imgSize ? `width:${config.imgSize}; max-width:${config.imgSize};` : 'max-width:100%;';
        
        // --- CACHE BUSTER FOR GIF PLAY ONCE ---
        // Appending a distinct microsecond timestamp parameter forces browser render components to re-read frames from scratch
        const cacheBusterUrl = config.image.startsWith("data:") ? config.image : `${config.image}${config.image.includes('?') ? '&' : '?'}_ts=${Date.now()}`;
        
        alertImage.innerHTML = `<img src="${cacheBusterUrl}" style="${finalSizeStyle} height:auto; margin-top:10px; display:block; margin-left:auto; margin-right:auto;">`;
    } else if (alertImage) {
        alertImage.innerHTML = "";
    }

    // Display container node layout instantly
    alertWidget.style.display = "block";
    void alertWidget.offsetWidth;
    alertWidget.style.opacity = "1";
    
    // Fire intro animations
    if (config.textInAnim !== "none") alertText.classList.add(config.textInAnim);
    if (config.image && alertImage && config.imgInAnim !== "none") {
        const targetImg = alertImage.querySelector("img");
        if (targetImg) targetImg.classList.add(config.imgInAnim);
    }

    // --- MANAGE INDEPENDENT IMAGE LIFECYCLE CONTROLS ---
    if (config.image && alertImage) {
        const targetImg = alertImage.querySelector("img");
        
        // Calculate when the image asset should actively drop out
        let targetImgClearDelay = null;
        
        if (config.imgDuration !== null) {
            targetImgClearDelay = config.imgDuration;
        } else if (config.imgMode === "once") {
            // "Play Once" default safety boundary: clear asset after 2500ms if no exact duration value was supplied
            targetImgClearDelay = 2500;
        }

        if (targetImgClearDelay !== null) {
            window.imgClearTimeout = setTimeout(() => {
                // If outbound animation configurations exist, apply them to the image node before tearing down
                if (targetImg && config.imgOutAnim !== "none") {
                    if (config.imgInAnim !== "none") targetImg.classList.remove(config.imgInAnim);
                    targetImg.classList.add(config.imgOutAnim);
                    
                    // Allow outro animation to visually finish (500ms window) before wiping node elements
                    setTimeout(() => {
                        if (alertImage) alertImage.innerHTML = "";
                    }, 500);
                } else {
                    if (alertImage) alertImage.innerHTML = "";
                }
            }, targetImgClearDelay);
        }
    }

    // --- MANAGE TEXT & MAIN WIDGET LIFECYCLE CONTROLS ---
    window.fadeTimeout = setTimeout(() => {
        if (config.textInAnim !== "none") alertText.classList.remove(config.textInAnim);
        
        const targetImg = alertImage ? alertImage.querySelector("img") : null;
        if (targetImg && config.imgInAnim !== "none") targetImg.classList.remove(config.imgInAnim);

        if (config.textOutAnim !== "none") alertText.classList.add(config.textOutAnim);
        if (targetImg && config.imgOutAnim !== "none") targetImg.classList.add(config.imgOutAnim);

        setTimeout(() => {
            if (window.fadeTimeout) {
                alertWidget.style.opacity = "0";
                setTimeout(() => {
                    if (alertWidget.style.opacity === "0") {
                        alertWidget.style.display = "none";
                        if (alertImage) alertImage.innerHTML = ""; // Complete cleanup
                    }
                }, 500);
            }
        }, 1000);
    }, config.textDuration);

    if (lookupName === "hydrate") {
        botSay(`Drink up, Captain @${user}!`);
    } else if (lookupName === "fart") {
        botSay(`@${user}! You just stank up the whole feed.`);
    } else {
        botSay(`@${user} spent ${cost || 0} points on ${reward}.`);
    }
}

function renderThemeControls() {
    const container = document.getElementById('variable-controls');
    if (!container) return;
    container.innerHTML = '';
    
    styleConfig.forEach(item => {
        const group = document.createElement('div');
        group.className = 'input-group';
        group.innerHTML = `<label>${item.label}</label>`;

        if (item.type === 'hsla') {
            const currentStr = registry.themes[registry.active][item.var];
            const val = hexToHSLA(currentStr);
            
            const picker = document.createElement('div');
            picker.className = 'hsla-picker';
            picker.innerHTML = `
                <div class="hsla-row"><span>H</span><input type="range" class="hsla-slider hue-slider" max="360" value="${val.h}"></div>
                <div class="hsla-row"><span>S</span><input type="range" class="hsla-slider" max="100" value="${val.s}"></div>
                <div class="hsla-row"><span>L</span><input type="range" class="hsla-slider" max="100" value="${val.l}"></div>
                <div class="hsla-row"><span>A</span><input type="range" class="hsla-slider opacity-slider" max="100" value="${val.a * 100}"></div>
                <div class="preview-chip"><div class="preview-bg"></div><div class="preview-color" id="prev-${item.id}"></div></div>
            `;
            
            const updateHSLA = () => {
                const [h, s, l, a] = Array.from(picker.querySelectorAll('input')).map(i => i.value);
                const hslaStr = `hsla(${h}, ${s}%, ${l}%, ${a/100})`;
                document.documentElement.style.setProperty(item.var, hslaStr);
                registry.themes[registry.active][item.var] = hslaStr;
                picker.querySelector('.preview-color').style.backgroundColor = hslaStr;
                if(item.var === '--accent') {
                    document.documentElement.style.setProperty('--border-color', hslaStr);
                    registry.themes[registry.active]['--border-color'] = hslaStr;
                }
            };

            picker.querySelectorAll('input').forEach(i => i.addEventListener('input', updateHSLA));
            picker.querySelector('.preview-color').style.backgroundColor = currentStr;
            group.appendChild(picker);
        } 
        // --- CONVERTED SELECT HANDLING ENGINE ---
        else if (item.type === 'select') {
            const currentValue = registry.themes[registry.active][item.var];
            
            // Build out your shared custom dropdown UI block architecture
            const selectWorkspace = document.createElement('div');
            selectWorkspace.className = 'custom-select-workspace';
            selectWorkspace.id = `theme-select-${item.id}`;
            selectWorkspace.style.cssText = "position: relative; width: 100%;";

            // Resolve immediate visual display name (strip quote strings out of font declarations)
            const fallbackLabel = currentValue.includes(',') ? currentValue.split(',')[0].replace(/'/g, '') : currentValue;

            const displayEl = document.createElement('div');
            displayEl.className = 'custom-select-display';
            displayEl.id = `display-theme-select-${item.id}`;
            displayEl.innerText = fallbackLabel;

            const optionsBox = document.createElement('div');
            optionsBox.className = 'custom-select-options-box';
            optionsBox.id = `options-theme-select-${item.id}`;
            optionsBox.style.cssText = "display: none; position: absolute; top: 100%; left: 0; width: 100%; z-index: 1000; max-height: 200px; overflow-y: auto; background: #09090b; border: 1px solid #27272a; border-radius: 6px; margin-top: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.5);";

            // Populate items into the dropdown window list natively
            item.options.forEach(optVal => {
                const row = document.createElement('div');
                row.className = 'option-item';
                row.innerText = optVal.includes(',') ? optVal.split(',')[0].replace(/'/g, '') : optVal;
                row.style.cssText = "padding: 6px 10px; font-size: 11px; color: #e4e4e7; cursor: pointer; transition: background 0.2s;";

                row.addEventListener("mouseenter", () => row.style.background = "rgba(255,255,255,0.05)");
                row.addEventListener("mouseleave", () => row.style.background = "transparent");

                // Process selections on click actions
                row.addEventListener('click', (e) => {
                    e.stopPropagation();
                    
                    // Update layout values immediately
                    document.documentElement.style.setProperty(item.var, optVal);
                    registry.themes[registry.active][item.var] = optVal;
                    
                    // Synchronize Display Target Output 
                    displayEl.innerText = row.innerText;
                    optionsBox.style.display = 'none';
                });
                
                optionsBox.appendChild(row);
            });

            // Bind workspace toggle state engine
            displayEl.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close all existing custom menus anywhere on the overlay platform
                document.querySelectorAll(".custom-select-options-box").forEach(box => {
                    if (box !== optionsBox) box.style.display = "none";
                });
                optionsBox.style.display = optionsBox.style.display === 'block' ? 'none' : 'block';
            });

            selectWorkspace.appendChild(displayEl);
            selectWorkspace.appendChild(optionsBox);
            group.appendChild(selectWorkspace);
        }
        else {
            const range = document.createElement('input');
            range.type = 'range'; range.className = 'p8-input';
            range.min = item.min; range.max = item.max;
            range.value = parseInt(registry.themes[registry.active][item.var]);
            range.addEventListener('input', (e) => {
                const val = e.target.value + 'px';
                document.documentElement.style.setProperty(item.var, val);
                registry.themes[registry.active][item.var] = val;
            });
            group.appendChild(range);
        }
        container.appendChild(group);
    });
}

function renderThemeList() {
    const list = document.getElementById('theme-options');
    const display = document.getElementById('current-theme-display');
    const nameInput = document.getElementById('theme-name-input');
    const delBtn = document.getElementById('delete-theme-btn');
    
    list.innerHTML = '';
    display.innerText = registry.active;
    nameInput.value = registry.active;
    delBtn.disabled = (registry.active === 'Default');
    
    Object.keys(registry.themes).forEach(name => {
        const opt = document.createElement('div');
        opt.className = 'option-item';
        opt.innerText = name;
        opt.addEventListener('click', () => {
            applyTheme(name);
            renderThemeList();
            renderThemeControls();
            list.style.display = 'none';
        });
        list.appendChild(opt);
    });
}

function loadPositions() {
    document.querySelectorAll('.p8-widget').forEach(el => {
        const pos = JSON.parse(localStorage.getItem(`p8_pos_${el.id}`));
        if(pos) { el.style.top = pos.top; el.style.left = pos.left; }
    });

    // NEW: Apply the persistent visibility states on load
    document.getElementById("chat-widget").style.display = settings.chatHidden ? "none" : "block";
    document.getElementById("alert-widget").style.display = settings.alertHidden ? "none" : "block";
    document.getElementById("status-widget").style.display = settings.statusHidden ? "none" : "block";
}
async function checkTwitchAuth() {
    const h = new URLSearchParams(window.location.hash.substring(1));
    const token = h.get("access_token");
    if (token) {
        const res = await fetch("https://api.twitch.tv/helix/users", {
            headers: { "Authorization": `Bearer ${token}`, "Client-Id": CLIENT_ID }
        });
        const d = await res.json();
        const channelName = d.data[0].login;
        document.getElementById("auth-gate").style.display = "none";
        document.getElementById("obs-instructions").style.display = "block";
        document.getElementById("obs-url-output").innerText = `${FULL_REDIRECT}?channel=${channelName}&token=${token}`;
        history.replaceState(null, "", window.location.pathname);
    }
}

// --- WIDGET RENDERING ENGINE ---
function displayConsoleMessage(user, message) {
    if (!consoleMessages) return;
    const consoleContainer = document.getElementById("chat-feed");
    if (!consoleContainer) return;

    const consoleMessage = document.createElement("div");
    consoleMessage.classList.add("consoleMessage");

    const usernameSpan = document.createElement("span");
    usernameSpan.classList.add("consoleUser");
    usernameSpan.innerHTML = `${user}: `;

    const messageSpan = document.createElement("span");
    messageSpan.classList.add("consoleMessageText");
    messageSpan.innerHTML = message;

    consoleMessage.appendChild(usernameSpan);
    consoleMessage.appendChild(messageSpan);
    consoleContainer.appendChild(consoleMessage);

    setTimeout(() => { consoleMessage.style.opacity = '0'; }, 15000);
    setTimeout(() => { consoleMessage.remove(); }, 15500);

    if (consoleContainer.children.length > 5) {
        consoleContainer.removeChild(consoleContainer.firstChild);
    }
}

function displayChatMessage(user, message, flags = {}, extra = {}, processed = null) {
    const chatContainer = document.getElementById("chat-feed");
    if (!chatContainer) return;

    const chatMessage = document.createElement("div");
    chatMessage.classList.add("chat-msg");

    const usernameSpan = document.createElement("span");
    usernameSpan.classList.add("chat-user");
    usernameSpan.innerHTML = user + ": ";
    usernameSpan.style.color = extra.userColor || 'var(--accent)';

    const data = processed || processMessageWithEmotes(message, extra.messageEmotes);

    const messageSpan = document.createElement("span");
    messageSpan.classList.add("twitchmessage");
    messageSpan.innerHTML = data.message; 

    chatMessage.appendChild(usernameSpan);
    chatMessage.appendChild(messageSpan);
    chatContainer.prepend(chatMessage);
    
    if (data.emoteList && data.emoteList.length > 0) {
        data.emoteList.forEach(emoteURL => {
            if (typeof animateFloatingEmote === "function") {
                animateFloatingEmote(emoteURL);
            }
        });
    }

    setTimeout(() => {
        chatMessage.style.transition = "opacity 1s ease";
        chatMessage.style.opacity = '0';
    }, 14000);

    setTimeout(() => { chatMessage.remove(); }, 15000);

    while (chatContainer.children.length > 5) {
        chatContainer.removeChild(chatContainer.lastChild);
    }
}

function processMessageWithEmotes(message, messageEmotes) {
    if (!messageEmotes) return { message, emoteList: [] };

    let messageArray = message.split('');
    let emoteList = [];

    Object.keys(messageEmotes).forEach(emoteID => {
        messageEmotes[emoteID].forEach(range => {
            let [start, end] = range.split('-').map(Number);
            let emoteURL = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteID}/default/dark/3.0`;
            emoteList.push(emoteURL);
            
            messageArray[start] = `<img src="${emoteURL}" class="twitchEmote">`;
            for (let i = start + 1; i <= end; i++) {
                messageArray[i] = ''; 
            }
        });
    });

    return { message: messageArray.join(''), emoteList };
}

function animateFloatingEmote(emoteURL) {
    if (!floatingEmotes) return;
    const emote = document.createElement("img");
    emote.src = emoteURL;
    emote.classList.add("floatingEmote");

    let size = Math.random() * 16 + 64; 
    emote.style.width = `${size}px`;
    emote.style.height = `${size}px`;
    emote.style.left = Math.random() * 100 + "vw";
    emote.style.top = Math.random() * 100 + "vh";
    emote.style.opacity = "1";
    emote.style.transform = `scale(${Math.random() * 0.2 + 0.9})`;

    document.body.appendChild(emote);

    let randomX = (Math.random() - 0.5) * 600; 
    let randomY = (Math.random() - 0.5) * 600; 

    setTimeout(() => {
        emote.style.transition = "transform 5s linear, opacity 8s ease-out"; 
        emote.style.transform = `translate(${randomX}px, ${randomY}px) scale(${Math.random() * 0.8 + 0.8})`; 
        emote.style.opacity = "0.7";
    }, 100);

    setTimeout(() => emote.remove(), 7000);
}

function botSay(msg) {
    if (typeof ComfyJS !== "undefined" && activeChannel) {
        const finalMessage = useBotPrefix ? `${BOT_PREFIX} ${msg}` : msg;
        ComfyJS.Say(finalMessage, activeChannel);
    } else {
        console.warn("BotSay failed: ComfyJS not initialized or channel missing.");
    }
}

// --- CORE COMMAND LOGIC & WIDGET VISIBILITY CONTROLS ---
// --- CENTRALIZED COMMAND REGISTRY ---
const commandsRegistry = {
    "hello": {
        adminOnly: false,
        execute: (user, message, flags) => {
            botSay(`System active. Current prefix: !${useCmdPrefix ? CMD_PREFIX : '[NONE]'}`);
        }
    },
	"toggle": {
        adminOnly: true,
        execute: (user, message, flags) => {
            const target = message.toLowerCase().trim();
            
            if (target === "consolemessages") {
                consoleMessages = !consoleMessages;
                botSay(`Console messages: ${consoleMessages ? "Enabled" : "Disabled"}`);
            } 
            else if (target === "cmdprefix") {
                useCmdPrefix = !useCmdPrefix;
                botSay(`Prefix Mode: ${useCmdPrefix ? "REQUIRED (!" + CMD_PREFIX + ")" : "Disabled"}`);
            }
            else if (target === "botprefix") {
                useBotPrefix = !useBotPrefix;
                botSay(`Bot Prefix visibility is now: ${useBotPrefix ? "Enabled" : "Disabled"}`);
            }
            else if (target === "floatingemotes") {
                floatingEmotes = !floatingEmotes;
                botSay(`Floating Emotes are now: ${floatingEmotes ? "Enabled" : "Disabled"}`);
            }
            // --- FIX: Sync with global variables and correct visual elements ---
            else if (target === "chat") {
                chatHidden = !chatHidden;
                
                // Checks both common widget naming variations
                const w = document.getElementById("chat-widget") || document.getElementById("chat-container") || document.getElementById("p8-chat-box");
                if (w) w.style.display = chatHidden ? "none" : "block";
                
                botSay(`Chat Widget visibility: ${chatHidden ? "Hidden" : "Visible"}`);
            }
            else if (target === "alert" || target === "alerts") {
                alertHidden = !alertHidden;
                
                const w = document.getElementById("alert-widget") || document.getElementById("alert-container") || alertWidget;
                if (w) {
                    w.style.display = alertHidden ? "none" : "block";
                    if (alertHidden) w.style.opacity = "0";
                }
                
                botSay(`Alert Widget visibility: ${alertHidden ? "Hidden" : "Visible"}`);
            }
            else if (target === "status") {
                statusHidden = !statusHidden;
                
                const w = document.getElementById("status-widget") || document.getElementById("status-container") || document.getElementById("status-indicator");
                if (w) w.style.display = statusHidden ? "none" : "block";
                
                botSay(`Status Widget visibility: ${statusHidden ? "Hidden" : "Visible"}`);
            }
            
            // This now safely synchronizes our updated global variables to localStorage
            saveSettings();
        }
    },
    "addreward": {
        adminOnly: true,
        execute: (user, message, flags) => {
            if (message.includes("|")) {
                let textPart = message;
                let imageUrl = "";

                if (message.includes("||")) {
                    const imgSplit = message.split("||");
                    textPart = imgSplit[0].trim();
                    imageUrl = imgSplit[1].trim();
                }

                const parts = textPart.split("|");
                const rewardName = parts[0].trim().toLowerCase();
                const alertString = parts.slice(1).join("|").trim();
                
                if (!rewardName || !alertString) {
                    botSay(`Error parsing template. Ensure you have content before and after the single pipe '|'.`);
                    return;
                }

                rewardAlerts[rewardName] = { text: alertString, image: imageUrl };
                saveRewardAlerts();

                if (imageUrl) {
                    botSay(`Registered custom alert with layout graphic for [${parts[0].trim()}].`);
                } else {
                    botSay(`Registered custom text alert for [${parts[0].trim()}].`);
                }
            } else {
                botSay(`Usage: !${CMD_PREFIX} addreward Reward Name | Text Template [|| Optional Image/GIF URL]`);
            }
        }
    },
    "setcmdprefix": {
        adminOnly: true,
        execute: (user, message, flags) => {
            if (message) {
                CMD_PREFIX = message.trim().split(" ")[0]; 
                saveSettings();
                botSay(`Command keyword set to: !${CMD_PREFIX}`);
            }
        }
    },
    "setbotprefix": {
        adminOnly: true,
        execute: (user, message, flags) => {
            if (message) {
                BOT_PREFIX = message.trim();
                saveSettings();
                botSay(`Bot name set to: ${BOT_PREFIX}`);
            }
        }
    },
    "help": {
        adminOnly: false,
        execute: (user, message, flags) => {
            const isAdmin = flags.broadcaster || flags.mod;
            
            // DYNAMIC SCANNING: Map out names based on current caller context permissions
            const allowedCommands = Object.keys(commandsRegistry).filter(cmdName => {
                const cmdConfig = commandsRegistry[cmdName];
                return !cmdConfig.adminOnly || isAdmin;
            });

            const prefixStr = useCmdPrefix ? `!${CMD_PREFIX} ` : `!`;
            const formattedList = allowedCommands.map(name => `${prefixStr}${name}`).join(", ");

            botSay(`Available commands for your permission level: ${formattedList}`);
        }
    }
};

// Aliasing 'commands' to call the exact same logic as 'help' safely
commandsRegistry["commands"] = commandsRegistry["help"];

// --- REFACTORED CORE ROUTER ---
function handlePixelCommands(user, command, message, flags) {
    const targetCmd = command.toLowerCase().trim();
    const cmdConfig = commandsRegistry[targetCmd];

    // If command doesn't exist, exit quietly
    if (!cmdConfig) return;

    // Direct permission boundary check
    const isAdmin = flags.broadcaster || flags.mod;
    if (cmdConfig.adminOnly && !isAdmin) return;

    // Process implementation callback
    cmdConfig.execute(user, message, flags);
}
// --- TWITCH OVERLAY LIQUID CONTEXT ---
function startTwitch(channel, token) {
    const formattedToken = token.startsWith("oauth:") ? token : `oauth:${token}`;
    
    ComfyJS.onConnected = () => {
        if(statusIndicator) {
            statusIndicator.innerText = "SYSTEM: ONLINE";
            statusIndicator.style.color = "#00ff88";
        }
        if(statusText) statusText.innerText = `CONNECTED TO: ${channel.toUpperCase()}`;
        activeChannel = channel;
    };

    ComfyJS.onChat = (user, message, flags, self, extra) => {
        const processed = processMessageWithEmotes(message, extra.messageEmotes);
        displayChatMessage(user, message, flags, extra, processed); 
    };

    // --- CHANNEL POINT REWARD TRIGGER ---
    ComfyJS.onReward = (user, reward, cost, message, extra) => {
        // Pass live WebSocket event payloads directly down to our alert engine
        triggerAlertPipeline(reward, user, cost, message);
    }; 
    ComfyJS.onCommand = (user, command, message, flags, extra) => {
        let targetCommand = command.toLowerCase();
        let targetArgs = message;

        if (useCmdPrefix) {
            if (targetCommand === CMD_PREFIX.toLowerCase()) {
                const parts = message.trim().split(" ");
                targetCommand = parts[0].toLowerCase(); 
                targetArgs = parts.slice(1).join(" ");  
            } else {
                return; 
            }
        }
        
        if (targetCommand === "hello") {
            if (alertText && alertWidget) {
                alertText.innerText = `👋 Welcome, @${user}!`;
                alertWidget.style.opacity = "1";
                setTimeout(() => { alertWidget.style.opacity = "0"; }, 6000);
            }
        }
        handlePixelCommands(user, targetCommand, targetArgs, flags);
    };

    ComfyJS.Init(channel, formattedToken);
}

init();