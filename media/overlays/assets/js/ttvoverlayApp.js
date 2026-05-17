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
let useBotPrefix = settings.useBotPrefix;
let CMD_PREFIX = settings.cmdPrefix;
let useCmdPrefix = settings.useCmdPrefix;
let floatingEmotes = settings.floatingEmotes;
let consoleMessages = settings.consoleMessages;

function saveSettings() {
    settings.botPrefix = BOT_PREFIX;
    settings.useBotPrefix = useBotPrefix;
    settings.cmdPrefix = CMD_PREFIX;
    settings.useCmdPrefix = useCmdPrefix;
    settings.consoleMessages = consoleMessages;
    settings.floatingEmotes = floatingEmotes;
    localStorage.setItem('p8_settings', JSON.stringify(settings));
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
        soundRow.style.cssText = "display: flex; justify-content: space-between; align-items: center; background: #09090b; border: 1px solid #27272a; padding: 6px 10px; border-radius: 6px; font-size: 11px;";
        
        // Fallback properties for fallback compatibility handling
        let displayName = `🔊 Custom Sound #${index + 1}`;
        let audioPlayTarget = "";

        if (soundItem && typeof soundItem === "object") {
            displayName = soundItem.name || displayName;
            audioPlayTarget = soundItem.data || "";
        } else if (typeof soundItem === "string") {
            // Backward compatibility loop for legacy plain string assets
            displayName = soundItem.startsWith("data:") ? `🔊 Custom Sound #${index + 1}` : soundItem.split('/').pop();
            audioPlayTarget = soundItem;
        }
        
        soundRow.innerHTML = `
            <span style="color: #e4e4e7; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 180px;" title="${displayName}">${displayName}</span>
            <div style="display: flex; gap: 6px; align-items: center;">
                <button type="button" style="background: none; border: none; color: var(--accent); cursor: pointer; padding: 2px;" onclick="playSound('${audioPlayTarget}', 0.7)">▶️</button>
                <button type="button" style="background: none; border: none; color: #f87171; cursor: pointer; padding: 2px;" onclick="removeStagedSoundItem(${index})">❌</button>
            </div>
        `;
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

function populateAnimationDropdowns() {
    const textIn = document.getElementById("reward-text-in-anim");
    const textOut = document.getElementById("reward-text-out-anim");
    const imgIn = document.getElementById("reward-img-in-anim");
    const imgOut = document.getElementById("reward-img-out-anim");

    if (!textIn || !textOut || !imgIn || !imgOut) return;

    textIn.innerHTML = AVAILABLE_IN_ANIMATIONS.map(a => `<option value="${a}">${a}</option>`).join("");
    imgIn.innerHTML = AVAILABLE_IN_ANIMATIONS.map(a => `<option value="${a}">${a}</option>`).join("");
    
    textOut.innerHTML = AVAILABLE_OUT_ANIMATIONS.map(a => `<option value="${a}">${a}</option>`).join("");
    imgOut.innerHTML = AVAILABLE_OUT_ANIMATIONS.map(a => `<option value="${a}">${a}</option>`).join("");
}

// 1. Hook up UI Toggle Actions inside your bindEvents() function block
function bindRewardsManagerEvents() {
    const rewardsPanel = document.getElementById("rewards-manager");
    const fileInput = document.getElementById("reward-file-input");
    const urlInput = document.getElementById("reward-img-input");
    
    // Core references for the audio pool form elements
    const soundFileInput = document.getElementById("reward-sound-file");
    const addSoundBtn = document.getElementById("push-sound-btn");
    const labelSoundBtn = document.getElementById("add-sound-file-btn");

    // Initialize animation selector choices directly on application setup
    populateAnimationDropdowns();

    // Open panel from context option
    document.getElementById("ctx-open-rewards").addEventListener("click", () => {
        rewardsPanel.style.display = "block";
        document.getElementById('p8-ctx-menu').style.display = 'none';
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
    let loadedAudioName = ""; // Holds the human-readable filename

    soundFileInput.addEventListener("change", function(e) {
        const file = e.target.files[0];
        
        if (!file) {
            loadedAudioBase64 = "";
            loadedAudioName = "";
            addSoundBtn.disabled = true;
            labelSoundBtn.innerText = "🎵 Choose Sound Asset";
            return;
        }
        
        // Cache the filename directly from the operating system event
        loadedAudioName = file.name;
        labelSoundBtn.innerText = `📁 ${file.name}`;
        
        // Convert target sound file into Base64 for local browser data streaming
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
        
        // Save as an object mapping the real asset name to its data stream
        stagedSoundsPool.push({
            name: loadedAudioName,
            data: loadedAudioBase64
        });
        
        // Reset control values to prepare for next file choices
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
        
        // Determine if we use local file memory string or raw web layout link URL
        let finalImage = pendingImageBase64 ? pendingImageBase64 : urlInput.value.trim();

        if (!nameKey || !alertText) {
            alert("Reward Name and Alert Text are required!");
            return;
        }

        // Save complete architectural schema layout to local state registry
        rewardAlerts[nameKey] = {
            text: alertText,
            image: finalImage,
            textInAnim: document.getElementById("reward-text-in-anim").value,
            textOutAnim: document.getElementById("reward-text-out-anim").value,
            imgInAnim: document.getElementById("reward-img-in-anim").value,
            imgOutAnim: document.getElementById("reward-img-out-anim").value,
            sounds: [...stagedSoundsPool] // Map dynamic sound pool directly into data item
        };
        saveRewardAlerts();

        // UI Reset sequence
        nameEl.value = "";
        textEl.value = "";
        urlInput.value = "";
        urlInput.placeholder = "Web Image/GIF URL";
        fileInput.value = "";
        pendingImageBase64 = "";
        document.getElementById("reward-text-in-anim").value = "none";
        document.getElementById("reward-text-out-anim").value = "none";
        document.getElementById("reward-img-in-anim").value = "none";
        document.getElementById("reward-img-out-anim").value = "none";
        
        // Reset dynamic audio form elements completely for the next setup task
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

        // Default configurations for backward compatibility with older saves
        const tIn = rewardData.textInAnim || "none";
        const tOut = rewardData.textOutAnim || "none";
        const iIn = rewardData.imgInAnim || "none";
        const iOut = rewardData.imgOutAnim || "none";
        const soundCount = rewardData.sounds ? rewardData.sounds.length : 0;

        item.innerHTML = `
            <div style="font-weight: bold; color: var(--accent); font-size: 13px; margin-bottom: 4px; text-transform: uppercase;">${key}</div>
            <div style="font-size: 12px; color: #e4e4e7; margin-bottom: 2px; word-break: break-word;"><strong>Txt:</strong> ${rewardData.text}</div>
            <div style="font-size: 11px; color: #a1a1aa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"><strong>Asset:</strong> ${imageDisplaySrc}</div>
            <div style="font-size: 10px; color: #71717a; margin-top: 4px; font-family: monospace;">
                Txt: [In: ${tIn} | Out: ${tOut}]<br>
                Img: [In: ${iIn} | Out: ${iOut}]<br>
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
            document.getElementById("reward-text-in-anim").value = tIn;
            document.getElementById("reward-text-out-anim").value = tOut;
            document.getElementById("reward-img-in-anim").value = iIn;
            document.getElementById("reward-img-out-anim").value = iOut;
            
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
        if (menu.style.display === 'block' && !menu.contains(e.target)) menu.style.display = 'none';
        if (opts.style.display === 'block' && !e.target.closest('#theme-selector')) opts.style.display = 'none';
        
        // Safety guard: Added #rewards-manager so editing inputs doesn't clear element focuses
        if (!isEditMode || e.button !== 0 || e.target.closest('#style-editor') || e.target.closest('#rewards-manager') || e.target.closest('.setup-container') || e.target.closest('.p8-modal')) return;
        
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
    if (!alertWidget || !alertText) return;

    // Structural initialization defaults
    let config = {
        text: `✨ <strong>${user}</strong> spent ${cost || 0} points on <br><strong>${reward}</strong>! ✨`,
        image: "",
        textInAnim: "fadeIn",
        textOutAnim: "fadeOut",
        imgInAnim: "fadeIn",
        imgOutAnim: "fadeOut",
        sounds: [] // Default empty sound array layout
    };

    // If custom configurations are discovered inside memory cache arrays, apply overrides
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
    }

    // --- HANDLE SOUND POOL SELECTION ---
    if (config.sounds && config.sounds.length > 0) {
        // Pick 1 random sound file out of the registered sound configuration pool
        const randomIndex = Math.floor(Math.random() * config.sounds.length);
        const chosenItem = config.sounds[randomIndex];
        
        // Extract raw data stream string whether entry layout is configured as an object or flat string
        const targetAudioSource = (chosenItem && typeof chosenItem === "object") ? chosenItem.data : chosenItem;
        
        // Execute playback instantly
        if (targetAudioSource) {
            playSound(targetAudioSource, 0.85);
        }
    }

    // Step 1: Strip previous tracking keyframes cleanly before refiring
    alertText.className = "";
    if (alertImage) alertImage.className = "";

    // Step 2: Content Sync Injection
    alertText.innerHTML = config.text;
    if (config.image && alertImage) {
        alertImage.innerHTML = `<img src="${config.image}" style="max-width:100%; height:auto; margin-top:10px; display:block;">`;
    } else if (alertImage) {
        alertImage.innerHTML = "";
    }

    // Step 3: Trigger INTRO Transitions
    alertWidget.style.display = "block";
    void alertWidget.offsetWidth;
    alertWidget.style.opacity = "1";
    
    if (config.textInAnim !== "none") alertText.classList.add(config.textInAnim);
    if (config.image && alertImage && config.imgInAnim !== "none") {
        const targetImg = alertImage.querySelector("img");
        if (targetImg) targetImg.classList.add(config.imgInAnim);
    }

    // Step 4: Queue OUTRO Transitions
    clearTimeout(window.fadeTimeout);
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
                    }
                }, 500);
            }
        }, 1000);
    }, 8000);

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
        else if (item.type === 'select') {
            const sel = document.createElement('select');
            sel.className = 'p8-input';
            item.options.forEach(o => {
                const opt = document.createElement('option');
                opt.value = o;
                opt.innerText = o.includes(',') ? o.split(',')[0].replace(/'/g, '') : o;
                if(registry.themes[registry.active][item.var] === o) opt.selected = true;
                sel.appendChild(opt);
            });
            sel.addEventListener('change', (e) => {
                document.documentElement.style.setProperty(item.var, e.target.value);
                registry.themes[registry.active][item.var] = e.target.value;
            });
            group.appendChild(sel);
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
            // Updated Widget Logic: Toggles visibility style AND saves state to memory context
            else if (target === "chat") {
                const w = document.getElementById("chat-widget");
                settings.chatHidden = !settings.chatHidden;
                w.style.display = settings.chatHidden ? "none" : "block";
                botSay(`Chat Widget visibility: ${settings.chatHidden ? "Hidden" : "Visible"}`);
            }
            else if (target === "alert" || target === "alerts") {
                const w = document.getElementById("alert-widget");
                settings.alertHidden = !settings.alertHidden;
                w.style.display = settings.alertHidden ? "none" : "block";
                botSay(`Alert Widget visibility: ${settings.alertHidden ? "Hidden" : "Visible"}`);
            }
            else if (target === "status") {
                const w = document.getElementById("status-widget");
                settings.statusHidden = !settings.statusHidden;
                w.style.display = settings.statusHidden ? "none" : "block";
                botSay(`Status Widget visibility: ${settings.statusHidden ? "Hidden" : "Visible"}`);
            }
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