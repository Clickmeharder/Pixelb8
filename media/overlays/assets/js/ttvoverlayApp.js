/* 
NOTES:

- begin splitting this file up into:
1-> ui/dom manipulation
2-> helper functions
3-> ttv connection & related logic:
       -twitch Auth
       -reward, cheer, message
	   -emoji handling & floating emojis
		
4-> widgetEngine
    -widget ui/dom connection
	-widget module lazy loading
	-built for future cusotm widget creation
4-> Timer Widget
5-> alertWidget?

todo:
step 1: move timers into their own widget, timer-widget.js
step 2: figure out step 3
step 3: uknown
- maybe create main.js
- main js can hold the theme creation logic, main settings, and core stuff ?
if i went this route we would have:
 helperfunctions.js
 main.js (core logic, and functions)
 ttvconnection.js (connects app and widgets to twitch)
 widgetEngine.js (builds and loads widgets using the theme stuff) 
 
 then my widgets (imported in widget engine & pass whatever is needed to ttvconnection.js):
   pet-widget.js
   jukebox-widget.js
   entropiauniverse-widget.js
   
   and new timer-widget.js


=======
future ideas:

 - add environment option to channel point manager bit cheer manager
    -> mist/fog   (fog on bottom of screen. when checked get options for set height and color)
	-> weather (snow, falling autumn leaves)  
	-> party lights
	-?filters?
*/

//==================================================================================
// Start of File
//--------------------------------------------------------------
//==================================================
import { WidgetEngine } from './widgetEngine.js';
//==================================================
//=============================================================================
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-

// --- STORAGE & SETTINGS INITIALIZATION ---
let settings = JSON.parse(localStorage.getItem('p8_settings')) || {
    botPrefix: "🤖[BOT]:",
    useBotPrefix: true,
    cmdPrefix: "ezlay",
    useCmdPrefix: true,
    consoleMessages: true,
    floatingEmotes: true,
	chatHidden: false,
	chatHeight: "350px",
    statusHidden: true,
    alertHidden: false,
//----------------------------
  // alert box element toggles
	
	rewardsEnabled: true,
	bitsEnabled: true,
//---------------------------
};
let BOT_PREFIX = settings.botPrefix;
let useBotPrefix = (String(settings.useBotPrefix) === "true");
let CMD_PREFIX = settings.cmdPrefix;
let useCmdPrefix = (String(settings.useCmdPrefix) === "true");
let floatingEmotes = (String(settings.floatingEmotes) === "true");
let consoleMessages = (String(settings.consoleMessages) === "true");
let rewardsEnabled = (String(settings.rewardsEnabled) !== "false");
let bitsEnabled = (String(settings.bitsEnabled) !== "false");


// Strict casting layout fallback normalization loops
let chatHidden = (String(settings.chatHidden) === "true");
let alertHidden = (String(settings.alertHidden) === "true");
let statusHidden = (String(settings.statusHidden) === "true");
let chatHeight = settings.chatHeight || "350px";


function saveSettings() {
    // Ground the context state object reference safely
    const state = window.settings || settings || {};

    // 1. Core Hardcoded Legacy Parameters Mapping
    state.botPrefix = typeof BOT_PREFIX !== 'undefined' ? BOT_PREFIX : state.botPrefix;
    state.useBotPrefix = typeof useBotPrefix !== 'undefined' ? useBotPrefix : state.useBotPrefix;
    state.cmdPrefix = typeof CMD_PREFIX !== 'undefined' ? CMD_PREFIX : state.cmdPrefix;
    state.useCmdPrefix = typeof useCmdPrefix !== 'undefined' ? useCmdPrefix : state.useCmdPrefix;
    state.consoleMessages = typeof consoleMessages !== 'undefined' ? consoleMessages : state.consoleMessages;
    state.floatingEmotes = typeof floatingEmotes !== 'undefined' ? floatingEmotes : state.floatingEmotes;
    state.chatHidden = typeof chatHidden !== 'undefined' ? chatHidden : state.chatHidden;
    state.statusHidden = typeof statusHidden !== 'undefined' ? statusHidden : state.statusHidden;
    state.alertHidden = typeof alertHidden !== 'undefined' ? alertHidden : state.alertHidden;
    state.rewardsEnabled = typeof rewardsEnabled !== 'undefined' ? rewardsEnabled : state.rewardsEnabled;
    state.bitsEnabled = typeof bitsEnabled !== 'undefined' ? bitsEnabled : state.bitsEnabled;
    state.chatHeight = typeof chatHeight !== 'undefined' ? chatHeight : state.chatHeight;

    // =========================================================================
    // 🧩 2. DYNAMIC LOOKUP LAYER: Map settings keys straight from WidgetEngine
    // =========================================================================
    if (window.DYNAMIC_WIDGET_MAPS && Array.isArray(window.DYNAMIC_WIDGET_MAPS)) {
        window.DYNAMIC_WIDGET_MAPS.forEach(config => {
            // Check if the current layout schema has updated state frames
            if (typeof SETTINGS_SCHEMA !== 'undefined') {
                const schemaItem = SETTINGS_SCHEMA.flatMap(g => g.items || []).find(i => i.idKey === config.settingsKey || i.idKey === config.settingsKey.replace('WidgetEnabled', '-widget'));
                if (schemaItem && typeof schemaItem.get === 'function') {
                    state[config.settingsKey] = schemaItem.get();
                    return;
                }
            }
            
            // Fallback: If not in schema UI yet, don't drop current structural memory values
            if (state[config.settingsKey] === undefined) {
                state[config.settingsKey] = false;
            }
        });
    }

    // Unify all referencing states back to the global execution target
    window.settings = state;
    if (typeof settings !== 'undefined') {
        settings = state;
    }

    // 3. Save directly to disk
    localStorage.setItem('p8_settings', JSON.stringify(state));
    console.log("💾 [Storage Engine]: All configuration entries and dynamic widgets saved successfully.");
    
    if (typeof updateManagerBadgesUI === "function") updateManagerBadgesUI();
    if (typeof updateAllBadgesUI === "function") updateAllBadgesUI();
}

// Ensure it is bound to window for module scripts
window.saveSettings = saveSettings;
//================================================
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
//=================================================

//=============================================================================
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-

const BOT_IDENTITY = "PIXELB8";
const CLIENT_ID = "l1zvkm35dmtw4doj4y699nhnvx655c";
const REDIRECT_URI = "pixelb8.lol/media/overlays/ezlay";
const FULL_REDIRECT = "https://" + REDIRECT_URI;
let activeChannel = "";

let pendingImageBase64 = "";

// Dom Elements (Adjusted for your new three-widget structure)
const alertWidget = document.getElementById("alert-widget");
const alertText = document.getElementById("alert-text");
const alertImage = document.getElementById("alert-image");
const statusWidget = document.getElementById('status-widget');
const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");
const chatWidget = document.getElementById('chat-widget');
const chatFeed = document.getElementById('chat-feed');
//=============================================================================
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_

// --- DYNAMIC THEMING & ALERTS DATA CORES ---
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

// DATA TRANSACTIONS INITIALIZATION MATRIX FOR BIT CHEERS 
if (!registry.bits) {
    registry.bits = {
        "1": { 
            text: "{user} cheered {bits} bits!", 
            img: "", 
            font_size: "2em", 
            font_color: "#ffffff", 
            duration: 8000, 
            anim_tx_in: "none", 
            anim_tx_out: "none", 
            anim_im_in: "none", 
            anim_im_out: "none" 
        },
        "100": { 
            text: "{user} cheered {bits} bits!", 
            img: "", 
            font_size: "2em", 
            font_color: "#ffffff", 
            duration: 8000, 
            anim_tx_in: "none", 
            anim_tx_out: "none", 
            anim_im_in: "none", 
            anim_im_out: "none" 
        },
        "500": { 
            text: "{user} cheered {bits} bits!", 
            img: "", 
            font_size: "2.5em", 
            font_color: "#bc6ff1", 
            duration: 8000, 
            anim_tx_in: "none", 
            anim_tx_out: "none", 
            anim_im_in: "none", 
            anim_im_out: "none" 
        },
        "1000": { 
            text: "{user} cheered {bits} bits!", 
            img: "", 
            font_size: "2.5em", 
            font_color: "#00f0ff", 
            duration: 8000, 
            anim_tx_in: "none", 
            anim_tx_out: "none", 
            anim_im_in: "none", 
            anim_im_out: "none" 
        },
        "5000": { 
            text: "{user} cheered {bits} bits!", 
            img: "", 
            font_size: "3em", 
            font_color: "#ff0055", 
            duration: 8000, 
            anim_tx_in: "none", 
            anim_tx_out: "none", 
            anim_im_in: "none", 
            anim_im_out: "none" 
        }
    };
}

//
//=============================================================================
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
// =========================================================================
// --- CONFIGURATION MAPS & STRUCTS ---
// =========================================================================
//
const DYNAMIC_WIDGET_MAPS = [
    { idKey: "jukebox", settingsKey: "jukeboxWidgetEnabled" },
    { idKey: "entropia-widget", settingsKey: "entropiaWidgetEnabled" },
    { idKey: "timer-widget", settingsKey: "timerWidgetEnabled" },
    { idKey: "pet-widget", settingsKey: "petWidgetEnabled" },
	// ⚙️ Modern WidgetEngine Mappings:
	{ idKey: "miner-widget", settingsKey: "bitminerWidgetEnabled" },
    { idKey: "jukebox-widget", settingsKey: "jukeboxWidgetEnabled" },
    { idKey: "emojinko-widget", settingsKey: "emojinkoWidgetEnabled" }
    // 🚀 To add future widgets, just drop a new line here! (e.g., { idKey: "goals-widget", settingsKey: "goalsWidgetEnabled" })
];

const PANEL_NAVIGATION_MAPS = [
    { 
        triggerId: "ctx-open-editor", 
        targetId: "style-editor", 
        onOpen: () => { if (typeof renderThemeList === "function") renderThemeList(); } 
    },
    { 
        triggerId: "quick-theme-btn", 
        targetId: "style-editor", 
        onOpen: () => { if (typeof renderThemeList === "function") renderThemeList(); } 
    },
    { 
        triggerId: "ctx-open-rewards", 
        targetId: "rewards-manager", 
        onOpen: () => { 
            if (typeof updateAllBadgesUI === "function") updateAllBadgesUI(); 
            if (typeof renderRewardsList === "function") renderRewardsList(); 
        } 
    },
    { 
        triggerId: "ctx-open-settings", 
        targetId: "settings-window", 
        onOpen: () => { if (typeof updateAllBadgesUI === "function") updateAllBadgesUI(); } 
    },
    // REFACTORED IN: Bits Manager context trigger
    { 
        triggerId: "ctx-open-bits", 
        targetId: "bit-manager",
        onOpen: () => { if (typeof updateAllBadgesUI === "function") updateAllBadgesUI(); }
    },
    // REFACTORED IN: Widgets Manager context trigger
    { 
        triggerId: "ctx-open-widgets", 
        targetId: "widgets-manager" 
    }
];
const BOOLEAN_TOGGLE_MAPS = [
    // --- MASTER ALERTS ---
    { 
        id: "settings-toggle-master-alerts", type: "change", valuePath: "checked", invert: true, 
        assignTo: (val) => { alertHidden = val; if (typeof settings !== 'undefined') settings.alertHidden = val; }, 
        onSync: () => { if (typeof saveSettings === "function") saveSettings(); if (typeof syncAllToggleUI === "function") syncAllToggleUI(); } 
    },
    { 
        id: "mgr-toggle-alert-btn", type: "click", valuePath: null, invert: false, 
        assignTo: () => { alertHidden = !alertHidden; if (typeof settings !== 'undefined') settings.alertHidden = alertHidden; }, 
        onSync: () => { if (typeof saveSettings === "function") saveSettings(); if (typeof syncAllToggleUI === "function") syncAllToggleUI(); } 
    },

    // --- REWARDS MANAGER CORES ---
    { 
        id: "mgr-toggle-rewards-btn", type: "click", valuePath: null, invert: false, 
        assignTo: () => { 
            if (typeof rewardsEnabled !== 'undefined') {
                rewardsEnabled = !rewardsEnabled; 
                if (typeof settings !== 'undefined') settings.rewardsEnabled = rewardsEnabled; 
            } else if (typeof settings !== 'undefined') {
                settings.rewardsEnabled = !settings.rewardsEnabled;
            }
        }, 
        onSync: () => { if (typeof saveSettings === "function") saveSettings(); if (typeof syncAllToggleUI === "function") syncAllToggleUI(); } 
    },

    // --- BITS MANAGER CORES ---
    { 
        id: "mgr-toggle-bits-btn", type: "click", valuePath: null, invert: false, 
        assignTo: () => { 
            if (typeof bitsEnabled !== 'undefined') {
                bitsEnabled = !bitsEnabled; 
                if (typeof settings !== 'undefined') settings.bitsEnabled = bitsEnabled; 
            } else if (typeof settings !== 'undefined') {
                settings.bitsEnabled = !settings.bitsEnabled;
            }
        }, 
        onSync: () => { if (typeof saveSettings === "function") saveSettings(); if (typeof syncAllToggleUI === "function") syncAllToggleUI(); } 
    }
];// Straight utility mapping dictionary for clean event routing execution pipelines
const SIMPLE_CLICK_MAPS = [
    { id: "ctx-reset",     handler: () => systemReset() },
    { id: "logout-btn-ui", handler: () => systemReset() },
    { id: "ctx-lock",      handler: () => setEditMode(!isEditMode) }
];
const DRAGGABLE_WINDOWS_CONFIG = [
    { winId: "bit-manager",           headerId: "bit-manager-header" },
    { winId: "settings-window",       headerId: "settings-manager-header" },
    { winId: "widgets-manager",       headerId: "widgets-manager-header" }
];

// Registry mapping overlay window elements to all actions that trigger their close event
const WINDOW_CLOSE_MAPS = [
    { win: "rewards-manager", triggers: ["close-rewards-btn", "close-rewards-top-btn"] },
    { win: "bit-manager",     triggers: ["close-bit-manager-btn", "close-bits-top-btn"] },
    { win: "settings-window",  triggers: ["close-settings-manager-btn", "close-settings-top-btn"] },
    { win: "style-editor",     triggers: ["close-editor-btn", "close-editor-top-btn"] },
	{ win: "widgets-manager",     triggers: [//"close-widgets-manager-btn",
	"close-widgets-top-btn"] }
];

const SETTINGS_SCHEMA = [
    {
        groupName: "🔔 Alert Core Management",
        items: [
            { 
                label: "Master Alert Visibility", 
                idKey: "master", 
                get: () => !alertHidden, 
                set: (v) => { 
                    alertHidden = !v; 
                    if (typeof settings !== 'undefined') settings.alertHidden = !v; 
                    if (typeof saveSettings === "function") saveSettings();
                    if (typeof syncAlertVisibilityState === "function") syncAlertVisibilityState(); 
                }
            },
            { 
                label: "Channel Point Alerts", 
                idKey: "rewards", 
                get: () => (typeof rewardsEnabled !== 'undefined' ? rewardsEnabled : (settings ? !!settings.rewardsEnabled : false)), 
                set: (v) => { 
                    if (typeof rewardsEnabled !== 'undefined') rewardsEnabled = v; 
                    if (typeof settings !== 'undefined') settings.rewardsEnabled = v; 
                    if (typeof saveSettings === "function") saveSettings(); 
                } 
            },
            { 
                label: "Bit Cheer Alerts", 
                idKey: "bits", 
                get: () => (typeof bitsEnabled !== 'undefined' ? bitsEnabled : (settings ? !!settings.bitsEnabled : false)), 
                set: (v) => { 
                    if (typeof bitsEnabled !== 'undefined') bitsEnabled = v; 
                    if (typeof settings !== 'undefined') settings.bitsEnabled = v; 
                    if (typeof saveSettings === "function") saveSettings(); 
                } 
            }
        ]
    },
    {
        groupName: "💬 Chat & UI Displays",
        items: [
            { 
                label: "Show Twitch Chat", 
                idKey: "chat-widget", 
                get: () => !chatHidden, 
                set: (v) => { 
                    chatHidden = !v; 
                    if (typeof settings !== 'undefined') settings.chatHidden = chatHidden;
                    if (chatWidget) {
                        chatWidget.style.display = chatHidden ? "none" : "block";
                        if (!chatHidden && chatFeed && typeof chatHeight !== 'undefined' && chatHeight) {
                            chatFeed.style.height = chatHeight;
                        }
                    }
                    if (typeof saveSettings === "function") saveSettings();
                }
            },
            { 
                label: "Show Stream Status", 
                idKey: "status-widget", 
                get: () => !statusHidden, 
                set: (v) => { 
                    statusHidden = !v; 
                    if (typeof settings !== 'undefined') settings.statusHidden = statusHidden;
                    if (statusWidget) statusWidget.style.display = statusHidden ? "none" : "block"; 
                    if (typeof saveSettings === "function") saveSettings(); 
                }
            },
            { 
                label: "Floating Chat Emotes", 
                idKey: "emotes", 
                get: () => floatingEmotes, 
                set: (v) => { 
                    floatingEmotes = v; 
                    if (typeof settings !== 'undefined') settings.floatingEmotes = v;
                    if (typeof saveSettings === "function") saveSettings(); 
                } 
            }
        ]
    },
    {
        groupName: "🤖 Bot & Core Backend Settings",
        items: [
            { 
                label: "Command Prefix Check", 
                idKey: "prefix-check", 
                get: () => useCmdPrefix, 
                set: (v) => { 
                    useCmdPrefix = v; 
                    if (typeof settings !== 'undefined') settings.useCmdPrefix = v;
                    if (typeof saveSettings === "function") saveSettings(); 
                } 
            },
            { 
                label: "Show Bot Prefixes", 
                idKey: "bot-visibility", 
                get: () => useBotPrefix, 
                set: (v) => { 
                    useBotPrefix = v; 
                    if (typeof settings !== 'undefined') settings.useBotPrefix = v;
                    if (typeof saveSettings === "function") saveSettings(); 
                } 
            },
            { 
                label: "Console Logging", 
                idKey: "console", 
                get: () => consoleMessages, 
                set: (v) => { 
                    consoleMessages = v; 
                    if (typeof settings !== 'undefined') settings.consoleMessages = v;
                    if (typeof saveSettings === "function") saveSettings(); 
                } 
            }
        ]
    },
	{
        groupName: "🧩 Widgets Settings",
        items: [
            { 
                label: "Enable Timer Widget", 
                idKey: "timer-widget", 
                get: () => (settings ? !!settings.timerWidgetEnabled : false), 
                set: (v) => { 
                    if (typeof settings !== 'undefined') settings.timerWidgetEnabled = v; 
                    if (typeof saveSettings === "function") saveSettings(); 
                    if (typeof syncAllToggleUI === "function") syncAllToggleUI();
                } 
            },
			{ 
                label: "Enable Pet Widget", 
                idKey: "pet-widget", 
                get: () => (settings ? !!settings.petWidgetEnabled : false), 
                set: async (v) => {
                    if (typeof settings !== 'undefined') settings.petWidgetEnabled = v; 
                    if (typeof saveSettings === "function") saveSettings(); 
                    
                    // Hot-load your future pet-widget.js file dynamically mid-session
                    if (v && typeof window.streamPetEngine === 'undefined') {
                        try {
                            const module = await import('./pet-widget.js');
                            window.StreamPet = module.StreamPet;
                            window.streamPetEngine = new module.StreamPet();
                            
                            if (typeof injectAllWidgetCommands === 'function') injectAllWidgetCommands();
                            console.log("🐾 Pet Widget Hot-Loaded and Instantiated mid-session!");
                        } catch (err) {
                            console.error("❌ Failed to hot-load Pet Widget source:", err);
                        }
                    }
                    
                    if (typeof syncAllToggleUI === "function") syncAllToggleUI();
                } 
            },

            { 
                label: "Enable Entropia Widget", 
                idKey: "entropia-widget", 
                get: () => (settings ? !!settings.entropiaWidgetEnabled : false), 
                set: async (v) => { // 🔄 Marked async for on-the-fly streaming
                    if (typeof settings !== 'undefined') settings.entropiaWidgetEnabled = v; 
                    if (typeof saveSettings === "function") saveSettings(); 
                    
                    // If turning ON and it hasn't been imported yet, load and instantiate it now!
                    if (v && typeof window.entropiaLogParser === 'undefined') {
                        try {
                            const module = await import('./entropia-widget.js');
                            window.EntropiaWidget = module.EntropiaWidget;
                            window.entropiaLogParser = new module.EntropiaWidget();
                            
                            // Hot-inject the new commands into your active chat listener
                            if (typeof injectAllWidgetCommands === 'function') injectAllWidgetCommands();
                            console.log("🎯 Entropia Tracker Hot-Loaded and Instantiated mid-session!");
                        } catch (err) {
                            console.error("❌ Failed to hot-load Entropia Tracker:", err);
                        }
                    }
                    
                    // Always sync up the visibility across windows instantly
                    if (typeof syncAllToggleUI === "function") syncAllToggleUI();
                } 
            },
/* 			{ 
                label: "Enable Jukebox Widget", 
                idKey: "jukebox", 
                get: () => (settings ? !!settings.jukeboxWidgetEnabled : false), 
                set: async (v) => {
                    // 1. Maintain your exact persistent state configuration safely
                    if (typeof settings !== 'undefined') settings.jukeboxWidgetEnabled = v; 
                    if (typeof saveSettings === "function") saveSettings(); 
                    
                    // ⚙️ Hand execution lifecycle rules cleanly over to the modern unified Engine!
                    if (typeof WidgetEngine !== 'undefined' && typeof WidgetEngine.toggleWidget === 'function') {
                        await WidgetEngine.toggleWidget("jukebox-widget", v);
                    } else {
                        console.warn("⚠️ [Schema Router]: WidgetEngine unavailable for Jukebox lifecycle modification.");
                    }
                    
                    // 3. Keep standard UI cross-window sync mechanics running
                    if (typeof syncAllToggleUI === "function") syncAllToggleUI();
                } 
            },
			{ 
                label: "Enable BitMiner Widget", 
                idKey: "miner-widget", 
                get: () => (settings ? !!settings.bitminerWidgetEnabled : false), 
                set: async (v) => {
                    // 1. Maintain your exact persistent state configuration
                    if (typeof settings !== 'undefined') settings.bitminerWidgetEnabled = v; 
                    if (typeof saveSettings === "function") saveSettings(); 
                    
                    // ⚙️ Hand execution logic over to the safe, isolated Phase 1 Engine
                    await WidgetEngine.toggleWidget("miner-widget", v);
                    
                    // 3. Keep standard UI cross-window sync mechanics running
                    if (typeof syncAllToggleUI === "function") syncAllToggleUI();
                } 
            } */
        ]
    }
	
];


//=============================================================================
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
// ==========================================
// --- Theme System ---
// ==========================================
let isEditMode = true, dragTarget = null, offset = { x: 0, y: 0 }, fadeTimeout;
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

function setEditMode(state) {
    isEditMode = state;
    document.body.classList.toggle('edit-mode', isEditMode);
    const badge = document.getElementById('mode-badge');
    if(badge) badge.style.display = isEditMode ? 'block' : 'none';
	// Dynamically update timer widget visibility context on mode switch
/*     if (typeof updateTimerWidgetVisibility === "function") {
        updateTimerWidgetVisibility();
    } */
	
}
function loadPositions() {
    document.querySelectorAll('.p8-widget').forEach(el => {
        const pos = JSON.parse(localStorage.getItem(`p8_pos_${el.id}`));
        if(pos) { el.style.top = pos.top; el.style.left = pos.left; }
    });

    // 🏎️ Target the inner feed for height restorations
    if (chatWidget) {
        const isHidden = !!settings.chatHidden;
        chatWidget.style.display = isHidden ? "none" : "block";
        
        // Apply saved custom height to the feed element instead of the parent container
        if (!isHidden && chatFeed) { 
            // 🛑 CRITICAL FALLBACK: If height is missing or less than 32px, reset to a clean default
            if (!chatHeight || parseInt(chatHeight) < 32) {
                chatHeight = "175px";
                if (typeof settings !== 'undefined') settings.chatHeight = "175px";
            }
            chatFeed.style.height = chatHeight; 
        }
    }
    if (alertWidget) { alertWidget.style.display = settings.alertHidden ? "none" : "block"; }
    if (statusWidget) { statusWidget.style.display = settings.statusHidden ? "none" : "block"; }
}
function applyTheme(name) {
    const theme = registry.themes[name];
    Object.keys(theme).forEach(k => document.documentElement.style.setProperty(k, theme[k]));
    if(theme['--accent']) document.documentElement.style.setProperty('--border-color', theme['--accent']);
    registry.active = name;
    localStorage.setItem('p8_registry', JSON.stringify(registry));
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
        // --- CONVERTED SELECT HANDLING ENGINE (STYLED TO MATCH ACTIVE THEME CUSTOM SELECT) ---
        else if (item.type === 'select') {
            // Safety fallback string to completely bypass undefined/unpopulated key runtime bugs
            const currentValue = registry.themes[registry.active][item.var] || '';
            
            // Build out shared custom dropdown UI block architecture using standard theme classes
            const selectWorkspace = document.createElement('div');
            selectWorkspace.className = 'custom-select';
            selectWorkspace.id = `theme-select-${item.id}`;

            // Resolve immediate visual display name (strip quote strings out of font declarations safely)
            const fallbackLabel = currentValue.includes(',') ? currentValue.split(',')[0].replace(/'/g, '') : currentValue;

            const displayEl = document.createElement('div');
            displayEl.className = 'select-trigger';
            displayEl.id = `display-theme-select-${item.id}`;
            displayEl.innerText = fallbackLabel || `Select ${item.label}...`;

            const optionsBox = document.createElement('div');
            optionsBox.className = 'select-options';
            optionsBox.id = `options-theme-select-${item.id}`;
            // Maintain display state inline toggle while relying on your style rules for structure layout
            optionsBox.style.display = 'none'; 

            // Populate items into the dropdown window list natively
            item.options.forEach(optVal => {
                const row = document.createElement('div');
                row.className = 'option-item';
                row.innerText = optVal.includes(',') ? optVal.split(',')[0].replace(/'/g, '') : optVal;
                row.style.cssText = "padding: 6px 10px; font-size: 11px; color: #e4e4e7; cursor: pointer; transition: background 0.2s;";

                // Match hover states to UI standards
                row.addEventListener('mouseenter', () => row.style.background = "var(--accent, #9146ff)");
                row.addEventListener('mouseleave', () => row.style.background = "transparent");

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
                document.querySelectorAll(".select-options, .custom-select-options-box").forEach(box => {
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
            range.value = parseInt(registry.themes[registry.active][item.var]) || 0;
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

function renderSettingsWindow() {
    const stackContainer = document.querySelector('#settings-window .settings-stack');
    if (!stackContainer) return;
    
    // Clear the stack before drawing to ensure fresh state on re-renders
    stackContainer.innerHTML = '';

    // Remove any restrictive heights on the main stack container so sections can sit together naturally
    stackContainer.style.cssText = "padding-top: 10px; display: flex; flex-direction: column; gap: 8px;";

    // Feed globally defined constant structure directly down into the view assembler
    SETTINGS_SCHEMA.forEach(group => {
        const detailsEl = document.createElement('details');
        detailsEl.className = 'settings-group-wrapper';
        detailsEl.open = false; 
        detailsEl.style.cssText = "border: 1px solid #27272a; border-radius: 4px; background: #09090b; overflow: hidden;";

        const summaryEl = document.createElement('summary');
        summaryEl.className = 'settings-group-header';
        summaryEl.style.cssText = "padding: 6px 8px; font-size: 14px; font-weight: 600; color: var(--accent, #a855f7); background: #18181b; cursor: pointer; user-select: none; list-style: none; display: flex; align-items: center; justify-content: space-between;";
        summaryEl.innerHTML = `<span>${group.groupName}</span><span class="group-arrow" style="font-size: 11px; opacity: 0.6;">▼</span>`;
        
        detailsEl.appendChild(summaryEl);

        // This inner container is where we restrict height and isolate the scroll area
        const innerPanel = document.createElement('div');
        innerPanel.className = 'settings-group-content';
        innerPanel.style.cssText = `
            padding: 6px 8px; 
            display: flex; 
            flex-direction: column; 
            gap: 6px; 
            background: #09090b;
            max-height: 120px;       /* 🛑 Caps the height of just this category dropdown */
            overflow-y: auto;        /* 🌟 Adds a scrollbar only to this block if items overflow */
            overflow-x: hidden;
            padding-right: 4px;      /* Prevents trackbars from clipping your toggle row layout */
        `;

        group.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'settings-toggle-row';
            row.style.cssText = "display: flex; justify-content: space-between; align-items: center; flex-shrink: 0;"; // flex-shrink: 0 stops items from compressing

            row.innerHTML = `
                <span class="settings-toggle-label" style="font-size: 11px; color: #e4e4e7;">${item.label}:</span>
                <div class="settings-toggle-controls" style="display: flex; align-items: center; gap: 8px;">
                    <span id="stg-${item.idKey}-status-badge" class="toggle-status-badge">---</span>
                    <button type="button" id="stg-toggle-${item.idKey}-btn" class="toggle-action-btn">Toggle</button>
                </div>
            `;

            const toggleBtn = row.querySelector(`#stg-toggle-${item.idKey}-btn`);
            if (toggleBtn) {
                // 🌟 FIX: Make this callback async so it handles async widget booting safely
                toggleBtn.addEventListener('click', async () => {
                    const currentVal = item.get();
                    
                    // ⏳ Await the setter promise completion before executing the UI sync
                    await item.set(!currentVal);
					console.log('togglebtn clicked:'+ toggleBtn);
					console.log('currentVal = '+ currentVal);
                    if (typeof syncAllToggleUI === 'function') {
                        syncAllToggleUI(); 
						console.log('syncAllToggleUI was called:');
                    }
                });
            }
            innerPanel.appendChild(row);
        });

        detailsEl.appendChild(innerPanel);
        stackContainer.appendChild(detailsEl);
    });

    if (typeof syncAllToggleUI === 'function') {
        syncAllToggleUI();
    }
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

        item.querySelector(".test-btn").addEventListener("click", () => {
            triggerAlertPipeline(key, "StreamerTest", 500, "Testing my custom overlays!");
        });

        item.querySelector(".alt-btn").addEventListener("click", () => {
            document.getElementById("reward-name-input").value = key;
            document.getElementById("reward-text-input").value = rewardData.text;
            document.getElementById("reward-font-color").value = rewardData.fontColor || "#ffffff";
            document.getElementById("reward-font-color-hex").value = rewardData.fontColor || "#ffffff";

            REWARD_INPUTS_REGISTRY.forEach(param => {
                const targetField = document.getElementById(param.id);
                if (targetField) {
                    const keyProp = param.id.replace("reward-", "").replace(/-([a-z])/g, g => g[1].toUpperCase());
                    targetField.value = rewardData[keyProp] || "";
                }
            });

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

            stagedSoundsPool = (rewardData.sounds && Array.isArray(rewardData.sounds)) ? [...rewardData.sounds] : [];
            if (typeof renderStagedSoundsUI === "function") renderStagedSoundsUI();
        });

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
//=============================================================================
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
// ==========================================
// --- Alert System ---
// ==========================================

// --- DYNAMIC REWARD ALERT REGISTRY ---
// Allows streamers to store templates for any Channel Point reward name
// Structural array mapping state variables to element inputs and persistent targets
const REWARD_SELECTS_REGISTRY = [
    { id: "reward-text-in-anim",  def: "none" },
    { id: "reward-text-out-anim", def: "none" },
    { id: "reward-img-in-anim",   def: "none" },
    { id: "reward-img-out-anim",  def: "none" },
    { id: "reward-font-weight",   def: "bold" },
    { id: "reward-img-mode",      def: "loop" }
];
const REWARD_INPUTS_REGISTRY = [
    { id: "reward-font-size",      type: "text" },
    { id: "reward-text-outline",   type: "text" },
    { id: "reward-img-size",       type: "text" },
    { id: "reward-text-duration",  type: "text" },
    { id: "reward-img-duration",   type: "text" }
];

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
// --- BITS ALERT PIPELINE EXECUTION ---
function triggerBitAlertPipeline(user, bits, message) {
    if (!registry.bits || alertHidden) return;

    // 1. Find the highest matching threshold tier configured by the user
    const tiers = Object.keys(registry.bits).map(Number).sort((a, b) => b - a);
    let chosenTier = "1"; // Default fallback
    
    for (let tier of tiers) {
        if (bits >= tier) {
            chosenTier = String(tier);
            break;
        }
    }

    const tierData = registry.bits[chosenTier];
    if (!tierData) return;

    // 2. Clear any lingering timeout states to avoid blinking artifacts
    if (fadeTimeout) clearTimeout(fadeTimeout);

    // 3. Format text templates using regex variable replacement parsing
    let parsedText = tierData.text || "{user} cheered {bits} bits!";
    parsedText = parsedText.replace(/{user}/g, user)
                           .replace(/{user\.toUpperCase\(\)}/g, user.toUpperCase())
                           .replace(/{bits}/g, bits)
                           .replace(/{message}/g, message || "");

    // 4. Update the DOM elements with custom parameters
    alertText.innerHTML = processedMessage || parsedText; 
    alertText.style.fontSize = tierData.font_size || "2em";
    alertText.style.color = tierData.font_color || "#ffffff";

    if (tierData.img && alertImage) {
        alertImage.innerHTML = `<img src="${tierData.img}" />`;
        alertImage.style.display = "block";
    } else if (alertImage) {
        alertImage.innerHTML = "";
        alertImage.style.display = "none";
    }

    // 5. Strip old transition utilities and apply Custom Entry Animation classes
    alertText.className = "";
    if (alertImage) alertImage.className = "";
    
    // Force a browser reflow trick to restart animations cleanly
    void alertWidget.offsetWidth; 

    if (tierData.anim_tx_in && tierData.anim_tx_in !== "none") {
        alertText.classList.add(tierData.anim_tx_in);
    }
    if (tierData.img && alertImage && tierData.anim_im_in && tierData.anim_im_in !== "none") {
        alertImage.classList.add(tierData.anim_im_in);
    }

    // Reveal the main structural widget frame
    alertWidget.style.opacity = "1";
    alertWidget.style.display = "block";

    // 6. Clean lifecycle timeline management (Runs exit animations before hiding frame)
    const duration = parseInt(tierData.duration) || 8000;
    fadeTimeout = setTimeout(() => {
        // Apply Exit Animations if configured
        if (tierData.anim_tx_out && tierData.anim_tx_out !== "none") {
            alertText.className = "";
            alertText.classList.add(tierData.anim_tx_out);
        }
        if (tierData.img && alertImage && tierData.anim_im_out && tierData.anim_im_out !== "none") {
            alertImage.className = "";
            alertImage.classList.add(tierData.anim_im_out);
        }

        // Wait for the CSS animation track length to finish before killing opacity completely
        setTimeout(() => {
            alertWidget.style.opacity = "0";
            fadeTimeout = setTimeout(() => {
                alertWidget.style.display = "none";
                alertText.className = "";
                if (alertImage) {
                    alertImage.className = "";
                    alertImage.innerHTML = "";
                }
            }, 500); // Matches the fallback standard master fade transition time
        }, 800); // Matches your CSS utility default animation length (.8s)
    }, duration);
}

/* Global utility to cleanly coordinate Master Alert visibility and states */
function syncAlertVisibilityState() {
    saveSettings();
    if (typeof updateManagerBadgesUI === "function") updateManagerBadgesUI();
    if (alertWidget) {
        alertWidget.style.display = alertHidden ? "none" : "block";
        alertWidget.style.opacity = alertHidden ? "0" : "1";
    }
}
function syncAllToggleUI() {
    const s = typeof settings !== 'undefined' ? settings : {};
    
    // Helper to update specific badges
    const updateBadge = (id, isActive) => {
        const el = document.getElementById(id);
        if (el) {
            el.className = `toggle-status-badge ${isActive ? 'status-enabled' : 'status-disabled'}`;
            el.innerText = isActive ? "Enabled" : "Disabled";
        }
    };

    // 🤖 AUTOMATED SETTINGS BADGE LOOP: Updates stg-[idKey]-status-badge
    if (typeof SETTINGS_SCHEMA !== 'undefined') {
        SETTINGS_SCHEMA.forEach(group => {
            group.items.forEach(item => {
                updateBadge(`stg-${item.idKey}-status-badge`, item.get());
            });
        });
    }

    // 🎯 INDEPENDENT MANAGEMENT SYNC: Alerts manager panel badges
    updateBadge("mgr-alert-status-badge", !alertHidden);
    updateBadge("mgr-rewards-status-badge", s.rewardsEnabled);
    updateBadge("mgr-bits-status-badge", s.bitsEnabled);

    // 🧩 AUTOMATED WIDGET DOM VISIBILITY LOOP
    DYNAMIC_WIDGET_MAPS.forEach(({ idKey, settingsKey }) => {
        const isActive = !!s[settingsKey];

        // 1. Automatically syncs any container matching your dashboard controls: "[idKey]-controls"
        const controls = document.getElementById(`${idKey}-controls`);
        if (controls) {
            controls.style.display = isActive ? "block" : "none";
            controls.style.opacity = isActive ? "1" : "0.5";
            controls.style.pointerEvents = isActive ? "auto" : "none";
        }

        // 2. Automatically syncs any stream overlay elements matching the base ID: "[idKey]"
        const overlay = document.getElementById(idKey);
        if (overlay) {
            overlay.style.display = isActive ? "block" : "none";
        }
    });

    // 🏎️ EXCEPTION HANDLING / CORE AUDIO ENGINE SYNC
    // (Keep unique non-UI side-effects right below the loop)
    if (window.streamJukeboxEngine) {
        window.streamJukeboxEngine.setWidgetActiveState(!!s.jukeboxWidgetEnabled);
    }
}
window.syncAllToggleUI = syncAllToggleUI;
function updateAllBadgesUI() {
    // 1. Resolve State Flags
    // Read variables matching your memory allocation rules
    const isAlertActive = (String(alertHidden) !== "true"); 
    const isRewardsActive = (String(rewardsEnabled) === "true");
    const isBitsActive = (String(bitsEnabled) === "true");

    // 2. Helper Array Mapping to distribute classes evenly
    const toggleTargets = [
        { ids: ["mgr-alert-status-badge"], active: isAlertActive },
        { ids: ["mgr-rewards-status-badge", "stg-rewards-status-badge"], active: isRewardsActive },
        { ids: ["mgr-bits-status-badge", "stg-bits-status-badge"], active: isBitsActive },
        { ids: ["stg-master-status-badge"], active: isAlertActive }
    ];

    // 3. Render Status Updates Loops
    toggleTargets.forEach(target => {
        target.ids.forEach(id => {
            const el = document.getElementById(id);
            if (!el) return;
            
            if (target.active) {
                el.innerText = "ACTIVE";
                el.className = "toggle-status-badge status-enabled";
            } else {
                el.innerText = "MUTED";
                el.className = "toggle-status-badge status-disabled";
            }
        });
    });
}
//=============================================================================
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-

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
window.botSay = botSay;

// --- CORE COMMAND LOGIC & WIDGET VISIBILITY CONTROLS ---
// --- CENTRALIZED COMMAND REGISTRY ---
// Helper to parse ID or default to latest

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
            
            // 🏎️ Self-contained mapping dictionary of only your targets
            const toggleMap = {
                "consolemessages": { name: "Console messages", get: () => consoleMessages, set: v => consoleMessages = v },
                "floatingemotes":  { name: "Floating Emotes",  get: () => floatingEmotes,  set: v => floatingEmotes = v },
                "botprefix":       { name: "Bot Prefix visibility", get: () => useBotPrefix, set: v => useBotPrefix = v },
                "chat":            { name: "Chat Widget visibility", get: () => chatHidden, set: v => chatHidden = v, element: chatWidget, invertUI: true },
                "status":          { name: "Status Widget visibility", get: () => statusHidden, set: v => statusHidden = v, element: statusWidget, invertUI: true },
                "alert":           { name: "Alert Widget visibility", get: () => alertHidden, set: v => alertHidden = v, element: alertWidget, invertUI: true, isAlert: true },
                "alerts":          { name: "Alert Widget visibility", get: () => alertHidden, set: v => alertHidden = v, element: alertWidget, invertUI: true, isAlert: true }
            };

            // 1. Handle the one outlier command that requires a unique string format
            if (target === "cmdprefix") {
                useCmdPrefix = !useCmdPrefix;
                botSay(`Prefix Mode: ${useCmdPrefix ? "REQUIRED (!" + CMD_PREFIX + ")" : "Disabled"}`);
                saveSettings();
                return;
            }

            // 2. Look up the match in our map
            const targetConfig = toggleMap[target];
            if (!targetConfig) {
                botSay(`Toggle target [${target}] not recognized.`);
                return;
            }

            // 3. Execute the variable flip
            const nextVal = !targetConfig.get();
            targetConfig.set(nextVal);

            // 4. Update the predefined element's display style if it exists in the map
            if (targetConfig.element) {
                targetConfig.element.style.display = nextVal ? "none" : "block";
                if (targetConfig.isAlert && nextVal) {
                    targetConfig.element.style.opacity = "0";
                }
            }

            // 5. Output the streamlined confirmation message
            const stateLabel = targetConfig.invertUI 
                ? (nextVal ? "Hidden" : "Visible") 
                : (nextVal ? "Enabled" : "Disabled");
                
            botSay(`${targetConfig.name}: ${stateLabel}`);

            // 6. Commit everything safely to disk
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
	"timer": {
		adminOnly: true,
		execute: (user, message, flags) => {
			const parts = message.trim().toLowerCase().split(" ");
			const action = parts[0];
			const id = parts[1];

			switch (action) {
				case "help":
					botSay(`Timer Help: !countdown [sec] [label] | !savecountdown [sec] [name] | !timer list | !timer [pause/reset/stop/split] [id]`);
					break;

				case "list":
					const activeIds = Object.keys(activeTimers);
					if (activeIds.length === 0) {
						botSay("No timers are currently running.");
					} else {
						botSay(`Active Timers: ${activeIds.map(id => `[${id}: ${activeTimers[id].label}]`).join(", ")}`);
					}
					break;

				case "pause":
				case "reset":
				case "stop":
				case "split":
					if (!id || !activeTimers[id]) {
						botSay(`Please specify a valid Timer ID. Use 'timer list' to see active IDs.`);
						return;
					}
					if (action === "pause") { pauseTimerInstance(id); botSay(`Paused ${activeTimers[id].type}: ${id}`); }
					else if (action === "reset") { resetTimerInstance(id); botSay(`Reset ${activeTimers[id].type}: ${id}`); }
					else if (action === "stop") { stopTimerInstance(id); botSay(`Stopped ${activeTimers[id].type}: ${id}`); }
					else if (action === "split") { splitTimerInstance(id); }
					break;

				default:
					botSay("Action not recognized. Use 'timer help' for a list of valid commands.");
			}
		}
	},
    "countdown": {
        adminOnly: true,
        execute: (user, message, flags) => {
            const parts = message.trim().split(" ");
            const firstArg = parts[0].toLowerCase();
            if (savedCountdowns[firstArg]) {
                createTimerInstance(parts.slice(1).join(" ") || firstArg, savedCountdowns[firstArg]);
                botSay(`Launched template [${firstArg}].`);
                return;
            }
            const duration = parseInt(parts[0]) || 0;
            if (duration <= 0) { botSay(`Usage: !${CMD_PREFIX} countdown [seconds] [label]`); return; }
            createTimerInstance(parts.slice(1).join(" ") || "Countdown", duration);
            botSay(`Started Countdown: (${duration}s)`);
        }
    },
    "savecountdown": {
        adminOnly: true,
        execute: (user, message, flags) => {
            const parts = message.trim().split(" ");
            const duration = parseInt(parts[0]) || 0;
            const keyName = parts.slice(1).join(" ").trim().toLowerCase();
            if (duration <= 0 || !keyName) { botSay(`Usage: !${CMD_PREFIX} savecountdown [seconds] [name]`); return; }
            savedCountdowns[keyName] = duration;
            saveCountdownsToStorage();
            botSay(`Preset Saved! Use: !${CMD_PREFIX} countdown ${keyName}`);
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
        if (!rewardsEnabled) return;
        // 1. Normalize the reward name to look up in our command mapping
        const lookupKey = reward.toLowerCase().trim();
        // 2. Check if an active module (like StreamPet) registered a matching interaction
        if (commandsRegistry && commandsRegistry[lookupKey]) {
            console.log(`🎯 [Pet Sync]: Channel point match found for "${lookupKey}"! Triggering module...`);
            // Build mock flags matching your standard chat handler layout
            const mockFlags = { broadcaster: false, mod: false, subscriber: false };
            try {
                // Fire the module's execution loop directly
                commandsRegistry[lookupKey].execute(user, message, mockFlags);
            } catch (err) {
                console.error(`❌ [Pet Sync]: Failed to execute custom reward module logic for !${lookupKey}:`, err);
            }
        } else {
            triggerAlertPipeline(reward, user, cost, message);
        }
    };
	ComfyJS.onCheer = (user, message, bits, flags, extra) => {
		if (!bitsEnabled) return; 
		triggerBitAlertPipeline(user, bits, message);
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
        if (targetCommand === "helloworld") {
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
//
//=============================================================================
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-


//============================
function determineExecutionEnvironment() {
    const params = new URLSearchParams(window.location.search);
    const channel = params.get("channel");
    const token = params.get("token");

    if (token && channel) {
        // 🎬 OBS BROWSER SOURCE ROUTE
        document.body.style.backgroundColor = "transparent";
        document.body.style.backgroundImage = "none";
        
        const wrapper = document.getElementById("overlay-wrapper");
        if (wrapper) wrapper.style.display = "block";
        
        setEditMode(false);
        startTwitch(channel, token);
        console.log(`🎬 [Environment]: Running as transparent OBS Overlay for channel: ${channel}`);
    } else {
        // 💻 DESKTOP BROWSER CONFIGURATION ROUTE
        document.body.style.backgroundColor = "#1a1a1a";
        document.body.style.backgroundImage = "none";
        
        const setupUI = document.getElementById("setup-interface");
        if (setupUI) setupUI.style.display = "block";
        
        checkTwitchAuth();
        console.log("💻 [Environment]: Running as local Browser Config Dashboard");
    }
}
async function init() {
    // 1. Initial Core Boot Sequence
    applyTheme(registry.active);
    determineExecutionEnvironment();
    
    // Core Layout & Registry Loading
    loadPositions();

    // =========================================================================
    // 🌐 UNIFY GLOBALS & DE-SERIALIZE PERSISTED DISK DATA FIRST
    // Fixes the boot race condition by pulling saved states before grounding passes.
    // =========================================================================
    try {
        const rawSavedSettings = localStorage.getItem('p8_settings');
        if (rawSavedSettings) {
            // Hydrate global window storage with real history frames
            window.settings = JSON.parse(rawSavedSettings);
            // Sync the legacy local scoping reference if it exists in this execution layer
            if (typeof settings !== 'undefined') {
                settings = window.settings;
            }
            console.log("💾 [Init Storage Pass]: Successfully loaded persisted settings from disk.");
        } else {
            // Fallback initialization if user has a totally clear cache
            if (typeof settings !== 'undefined') {
                window.settings = settings;
            } else {
                window.settings = window.settings || {};
            }
        }
    } catch (err) {
        console.error("❌ [Init Storage Pass]: Failed to parse local storage profile:", err);
        window.settings = window.settings || {};
    }

    // =========================================================================
    // 🎛️ DATA GROUNDING PASS
    // Safe to run now! Will only apply false if it doesn't exist on disk.
    // =========================================================================
    if (typeof WidgetEngine !== 'undefined' && WidgetEngine.registryMap) {
        Object.values(WidgetEngine.registryMap).forEach(config => {
            if (window.settings[config.settingsKey] === undefined) {
                window.settings[config.settingsKey] = false;
                console.log(`✨ [Init Data Pass]: Grounded missing flag "${config.settingsKey}" to false.`);
            }
        });
    }

    // =========================================================================
    // 🧩 2. INJECT DYNAMIC ENGINE WIDGETS INTO SCHEMA BEFORE RENDERING
    // =========================================================================
    if (typeof WidgetEngine !== 'undefined' && typeof WidgetEngine.injectWidgetsIntoSchema === 'function') {
        WidgetEngine.injectWidgetsIntoSchema(SETTINGS_SCHEMA);
        console.log("🧩 [WidgetEngine]: Successfully injected dynamic entries into SETTINGS_SCHEMA.");
    } else {
        console.warn("⚠️ [WidgetEngine]: Injection skipped. Engine layout configuration not detected.");
    }

    // =========================================================================
    // 🖥️ 3. RENDER THE INTERFACE NOW THAT THE MANIFEST IS COMPLETE
    // =========================================================================
    renderSettingsWindow(); 
    renderThemeControls();
    
    // Legacy compatibility snapshot assignment block
    const s = window.settings;

    // =========================================================================
    // ⚙️ 4. SYSTEM EXTENSION ENGINE CASCADE (BOOT ACTIVE SYSTEM UNITS)
    // =========================================================================
    if (typeof WidgetEngine !== 'undefined') {
        await WidgetEngine.initSavedWidgets(s);
    }

    // 5. Scan and inject any commands that were loaded during boot
    console.log("📡 [Command Registry]: Running boot scan...");
    injectAllWidgetCommands();
    
    // Populate registry array caches for rewards and bits
    renderRewardsList(); 
    populateCustomDropdowns();
    initTimerEngine();
    
    // Bind all event listeners to the DOM and sync UI states
    bindEvents();
    if (typeof syncAllToggleUI === 'function') {
        syncAllToggleUI();
    }
    
    console.log("🚀 ttvoverlayapp.js version 0.112 finished loading");
}
function injectAllWidgetCommands() {
    // 🔍 Dynamic Registry Mapping Arrays
    const activeWidgets = [
        { name: "StreamPet", instance: window.streamPetEngine },
        { name: "EntropiaParser", instance: window.entropiaLogParser }
    ];

    // ⚙️ AUTOMATED ENGINE INSTANCE COLLECTION LAYER
    if (typeof WidgetEngine !== 'undefined' && WidgetEngine.instances && WidgetEngine.registryMap) {
        Object.entries(WidgetEngine.registryMap).forEach(([idKey, config]) => {
            const liveInstance = WidgetEngine.instances[config.instanceKey];
            if (liveInstance) {
                activeWidgets.push({
                    name: `${config.className} (Engine)`,
                    instance: liveInstance
                });
            }
        });
    }

    console.log("📡 [Command Registry]: Starting automated injection scan...");

    activeWidgets.forEach(widget => {
        if (widget.instance) {
            console.log(`✅ [Command Registry]: Found active instance for ${widget.name}. Injecting...`);
            injectWidgetCommands(widget.instance);
        } else {
            console.warn(`⚠️ [Command Registry]: Widget instance for ${widget.name} is null/undefined. Skipping.`);
        }
    });

    console.log("🏁 [Command Registry]: Injection scan complete.");
}
function injectWidgetCommands(widgetInstance) {
    if (!widgetInstance) return;

    // ✅ FIXED: Check for both modern architectural naming and legacy fallback naming
    const getCommandsFn = widgetInstance.getModuleCommands || widgetInstance.getCommands;

    if (typeof getCommandsFn === 'function') {
        // Run the function contextually bound to its instance
        const widgetCommands = getCommandsFn.call(widgetInstance, botSay);
        
        const registeredKeys = [];

        widgetCommands.forEach(cmd => {
            const lookupKey = cmd.name.toLowerCase().trim();
            
            if (!commandsRegistry[lookupKey]) {
                commandsRegistry[lookupKey] = {
                    adminOnly: cmd.adminOnly || false,
                    execute: cmd.execute
                };
                
                const adminTag = cmd.adminOnly ? "🔒" : "👤";
                registeredKeys.push(`!${lookupKey} ${adminTag}`);
            }
        });

        if (registeredKeys.length > 0) {
            console.log(`📡 [Commands]: Hooked [${registeredKeys.join(", ")}]`);
        } else {
            console.log(`📡 [Commands]: Scanning complete. No new command injections needed.`);
        }
    } else {
        console.warn(`⚠️ [Command Registry]: Instance found but matches no blueprint command signatures.`);
    }
}
//=============================================================================
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
// ==========================================
// --- dom/bindings---
// ==========================================


function bindRewardsManagerEvents() {
    const rewardsPanel = document.getElementById("rewards-manager");
    if (!rewardsPanel) return;

    const fileInput = document.getElementById("reward-file-input");
    const urlInput = document.getElementById("reward-img-input");
    const fontColorPicker = document.getElementById("reward-font-color");
    const fontColorHex = document.getElementById("reward-font-color-hex");
    const soundFileInput = document.getElementById("reward-sound-file");
    const addSoundBtn = document.getElementById("push-sound-btn");
    const labelSoundBtn = document.getElementById("add-sound-file-btn");

    // Initialize UI state
    if (fontColorPicker && fontColorHex) {
        fontColorPicker.addEventListener("input", function() { 
            fontColorHex.value = this.value; 
        });
        fontColorHex.addEventListener("input", function() {
            if (/^#[0-9A-F]{6}$/i.test(this.value)) 
                fontColorPicker.value = this.value;
        });
    }

    // Image upload handler
    bindBase64FileReader(fileInput,
        (base64) => {
            pendingImageBase64 = base64;
            if(urlInput) {
                urlInput.value = "";
                urlInput.placeholder = "Using local file...";
            }
        },
        () => { pendingImageBase64 = ""; }
    );

    if (urlInput) {
        urlInput.addEventListener("input", function() {
            if (this.value.trim() !== "") {
                if(fileInput) fileInput.value = "";
                pendingImageBase64 = "";
            }
        });
    }

    // Audio upload handler
    let loadedAudioBase64 = "";
    let loadedAudioName = "";

    if (soundFileInput) {
        bindBase64FileReader(soundFileInput,
            (base64, filename) => {
                loadedAudioBase64 = base64;
                loadedAudioName = filename;
                if(labelSoundBtn) labelSoundBtn.innerText = `📁 ${filename}`;
                if (addSoundBtn) addSoundBtn.disabled = false;
            },
            () => {
                loadedAudioBase64 = "";
                loadedAudioName = "";
                if (addSoundBtn) addSoundBtn.disabled = true;
                if(labelSoundBtn) labelSoundBtn.innerText = "🎵 Choose Sound Asset";
            }
        );
    }

    if (addSoundBtn) {
        addSoundBtn.addEventListener("click", function() {
            if (!loadedAudioBase64 || typeof stagedSoundsPool === 'undefined') return;
            
            stagedSoundsPool.push({ 
                name: loadedAudioName, 
                data: loadedAudioBase64, 
                volume: 1.0 
            });

            // Reset audio UI
            loadedAudioBase64 = "";
            loadedAudioName = "";
            if(soundFileInput) soundFileInput.value = "";
            if(labelSoundBtn) labelSoundBtn.innerText = "🎵 Choose Sound Asset";
            this.disabled = true;
            
            if (typeof renderStagedSoundsUI === "function") renderStagedSoundsUI();
        });
    }

    // Save Logic
    const saveBtn = document.getElementById("save-reward-btn");
    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const nameEl = document.getElementById("reward-name-input");
            const textEl = document.getElementById("reward-text-input");
            if (!nameEl || !textEl) return;

            const nameKey = nameEl.value.trim().toLowerCase();
            const alertText = textEl.value.trim();

            if (!nameKey || !alertText) {
                alert("Reward Name and Alert Text are required!");
                return;
            }

            const payload = {
                text: alertText,
                image: pendingImageBase64 || (urlInput ? urlInput.value.trim() : ""),
                sounds: typeof stagedSoundsPool !== 'undefined' ? [...stagedSoundsPool] : [],
                fontColor: fontColorHex ? fontColorHex.value.trim() : "#ffffff"
            };

            // Map registries to payload
            REWARD_SELECTS_REGISTRY.forEach(item => {
                const camelKey = item.id.replace("reward-", "").replace(/-([a-z])/g, g => g[1].toUpperCase());
                payload[camelKey] = getCustomSelectValue(item.id);
            });

            REWARD_INPUTS_REGISTRY.forEach(item => {
                const el = document.getElementById(item.id);
                const camelKey = item.id.replace("reward-", "").replace(/-([a-z])/g, g => g[1].toUpperCase());
                payload[camelKey] = el ? el.value.trim() : "";
            });

            rewardAlerts[nameKey] = payload;
            saveRewardAlerts();

            // UI Cleanup
            nameEl.value = "";
            textEl.value = "";
            if(urlInput) { 
                urlInput.value = ""; 
                urlInput.placeholder = "Web Image/GIF URL"; 
            }
            if(fileInput) fileInput.value = "";
            if(soundFileInput) soundFileInput.value = "";
            pendingImageBase64 = "";
            if (addSoundBtn) addSoundBtn.disabled = true;
            if(labelSoundBtn) labelSoundBtn.innerText = "🎵 Choose Sound Asset";
            
            if (typeof stagedSoundsPool !== 'undefined') stagedSoundsPool = [];

            // Reset dropdowns
            REWARD_SELECTS_REGISTRY.forEach(item => 
                setCustomSelectValue(item.id, item.def)
            );

            REWARD_INPUTS_REGISTRY.forEach(item => { 
                const el = document.getElementById(item.id); 
                if (el) el.value = ""; 
            });

            if (typeof renderStagedSoundsUI === "function") renderStagedSoundsUI();
            if (typeof renderRewardsList === "function") renderRewardsList();
        });
    }

    // Populate dropdowns AFTER the panel is fully loaded
    setTimeout(() => {
        if (typeof populateCustomDropdowns === "function") {
            populateCustomDropdowns();
        }
        if (typeof updateManagerBadgesUI === "function") {
            updateManagerBadgesUI();
        }
    }, 150);
}
// ==========================================
// --- BITS CONFIGURATION ENGINE ---
// ==========================================
function bindBitManagerEvents() {
    const bitManagerWindow = document.getElementById("bit-manager");
    if (!bitManagerWindow) return;

    const tierDisplay = document.getElementById("current-bit-tier-display");
    if (tierDisplay && !tierDisplay.getAttribute("data-selected-tier")) {
        tierDisplay.setAttribute("data-selected-tier", "1");
    }

    function loadBitTierToUI(tier) {
        if (!registry.bits || !registry.bits[tier]) return;
        const data = registry.bits[tier];

        document.getElementById("bit-text-input").value = data.text || "";
        document.getElementById("bit-img-input").value = data.img || "";
        document.getElementById("bit-font-size").value = data.font_size || "2em";
        document.getElementById("bit-font-color-hex").value = data.font_color || "#ffffff";
        document.getElementById("bit-alert-duration").value = data.duration || 8000;

        document.getElementById("display-bit-text-in-anim").innerText = data.anim_tx_in || "none";
        document.getElementById("display-bit-text-out-anim").innerText = data.anim_tx_out || "none";
        document.getElementById("display-bit-img-in-anim").innerText = data.anim_im_in || "none";
        document.getElementById("display-bit-img-out-anim").innerText = data.anim_im_out || "none";
    }

    // Tier Selector (already in HTML)
    const tierOptionsContainer = document.getElementById("bit-tier-options");
    if (tierDisplay && tierOptionsContainer) {
        tierDisplay.addEventListener("click", (e) => {
            e.stopImmediatePropagation();
            tierOptionsContainer.style.display = tierOptionsContainer.style.display === "block" ? "none" : "block";
        });

        tierOptionsContainer.querySelectorAll(".option-item").forEach(item => {
            item.addEventListener("click", (e) => {
                e.stopImmediatePropagation();
                const targetTier = item.getAttribute("data-tier");
                tierDisplay.textContent = item.textContent;
                tierDisplay.setAttribute("data-selected-tier", targetTier);
                tierOptionsContainer.style.display = "none";
                loadBitTierToUI(targetTier);
            });
        });
    }

    // Use unified dropdown system instead of old setupCustomDropdownEngine
    setTimeout(() => {
        if (typeof populateCustomDropdowns === "function") {
            populateCustomDropdowns();
        }
    }, 200);

    // Save button
    const saveBtn = document.getElementById("save-bit-config-btn");
    if (saveBtn) {
        saveBtn.addEventListener("click", async () => {
            const activeTier = tierDisplay.getAttribute("data-selected-tier") || "1";
            if (!registry.bits) registry.bits = {};

            registry.bits[activeTier] = {
                text: document.getElementById("bit-text-input").value.trim(),
                img: document.getElementById("bit-img-input").value.trim(),
                font_size: document.getElementById("bit-font-size").value.trim() || "2em",
                font_color: document.getElementById("bit-font-color-hex").value.trim() || "#ffffff",
                duration: parseInt(document.getElementById("bit-alert-duration").value) || 8000,
                anim_tx_in: document.getElementById("display-bit-text-in-anim").innerText,
                anim_tx_out: document.getElementById("display-bit-text-out-anim").innerText,
                anim_im_in: document.getElementById("display-bit-img-in-anim").innerText,
                anim_im_out: document.getElementById("display-bit-img-out-anim").innerText
            };

            localStorage.setItem('p8_registry', JSON.stringify(registry));

            if (typeof p8Confirm === "function") {
                await p8Confirm(`Tier Configuration (${activeTier}+ Bits) Saved Securely!`, true);
            } else {
                alert("Configuration Saved!");
            }
        });
    }

    // Load initial tier
    loadBitTierToUI(tierDisplay.getAttribute("data-selected-tier") || "1");
}
// ==========================================
// --- MAIN EVENT LISTENER BINDING ENGINE ---
// ==========================================
/* function bindEvents() {
    const SCOPES = "chat:read chat:edit channel:read:redemptions";

    // 1. Core Platform Auth & Clipboard Utility Wiring
    onSafeClick("login-button", () => {
        window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(FULL_REDIRECT)}&response_type=token&scope=${encodeURIComponent(SCOPES)}`;
    });

    onSafeClick("obs-url-output", (e, target) => {
        navigator.clipboard.writeText(target.innerText);
        const originalText = target.innerText;
        target.innerText = "COPIED TO CLIPBOARD!";
        setTimeout(() => target.innerText = originalText, 1500);
    });

    // 2. Window Navigation
    PANEL_NAVIGATION_MAPS.forEach(cfg => {
        onSafeClick(cfg.triggerId, () => {
            const targetPanel = document.getElementById(cfg.targetId);
            if (targetPanel) targetPanel.style.display = 'block';
            closeContextMenu();
            if (cfg.onOpen) cfg.onOpen();
        });
    });

    // 3. Boolean Toggles
    BOOLEAN_TOGGLE_MAPS.forEach(cfg => {
        const handler = (e) => {
            const incomingVal = cfg.valuePath ? e.target[cfg.valuePath] : null;
            const finalVal = cfg.invert ? !incomingVal : incomingVal;
            cfg.assignTo(finalVal);
            if (cfg.onSync) cfg.onSync();
        };
        if (cfg.type === "change") {
            onSafeChange(cfg.id, handler);
        } else {
            onSafeClick(cfg.id, handler);
        }
    });

    // --- Timer UI & Color Sync ---
    const colorPicker = document.getElementById("tmr-color");
    const colorText = document.getElementById("tmr-color-text");

    const updateTimerStyles = () => {
        const color = colorText.value;
        document.querySelectorAll('.p8-timer-widget').forEach(el => {
            el.style.color = color;
        });
    };

    if (colorPicker && colorText) {
        colorPicker.addEventListener("input", (e) => {
            colorText.value = e.target.value;
            updateTimerStyles();
        });

        colorText.addEventListener("input", (e) => {
            const val = e.target.value;
            if (/^#[0-9A-F]{6}$/i.test(val)) {
                colorPicker.value = val;
                updateTimerStyles();
            }
        });
    }

    onSafeClick("ui-create-timer-btn", () => {
        const lblInput = document.getElementById("timer-label-input");
        const durInput = document.getElementById("timer-duration-input");
        
        const label = lblInput.value.trim() || "Timer";
        const duration = durInput.value || 0;
        
        const config = {
            labelFontSize: document.getElementById("tmr-label-fz").value || "14px",
            labelFontWeight: document.getElementById("tmr-label-fw").value || "600",
            timerFontSize: document.getElementById("tmr-fz").value || "24px",
            timerFontColor: colorText.value || "#ffffff",
            showMode: document.getElementById("tmr-visibility").value || "always"
        };

        createTimerInstance(label, duration, config);
        lblInput.value = "";
        durInput.value = "";
    });

    onSafeClick("close-widgets-manager-btn", () => {
        const widgetWin = document.getElementById("widgets-manager");
        if (widgetWin) widgetWin.style.display = "none";
    });

    // Window Close Handlers
    if (typeof WINDOW_CLOSE_MAPS !== 'undefined' && Array.isArray(WINDOW_CLOSE_MAPS)) {
        WINDOW_CLOSE_MAPS.forEach(mapping => {
            if (mapping && Array.isArray(mapping.triggers)) {
                mapping.triggers.forEach(triggerId => {
                    onSafeClick(triggerId, () => {
                        const targetWindow = document.getElementById(mapping.win);
                        if (targetWindow) targetWindow.style.display = 'none';
                    });
                });
            }
        });
    }

    // Simple Click Handlers
    SIMPLE_CLICK_MAPS.forEach(cfg => {
        const shouldStopPropagation = (cfg.id === "ctx-lock");
        onSafeClick(cfg.id, () => {
            cfg.handler();
            if (cfg.id.startsWith("ctx-")) closeContextMenu();
        }, shouldStopPropagation);
    });

    // Theme Selector
    onSafeClick("current-theme-display", () => {
        const themeOptions = document.getElementById('theme-options');
        if (themeOptions) {
            themeOptions.style.display = themeOptions.style.display === 'block' ? 'none' : 'block';
        }
    }, true);

    onSafeClick("save-theme-btn", async () => {
        const nameInput = document.getElementById('theme-name-input');
        const newName = (nameInput ? nameInput.value.trim() : '') || 'Custom Theme';
        
        if (typeof registry !== 'undefined' && registry.themes) {
            registry.themes[newName] = JSON.parse(JSON.stringify(registry.themes[registry.active]));
            registry.active = newName;
            localStorage.setItem('p8_registry', JSON.stringify(registry));
            
            if (typeof renderThemeList === "function") renderThemeList();
            if (typeof p8Confirm === "function") await p8Confirm('Theme Settings Saved', true);
        }
    });

    // Draggable Windows
    if (typeof makeElementDraggable === "function") {
        DRAGGABLE_WINDOWS_CONFIG.forEach(cfg => {
            if (document.getElementById(cfg.winId)) {
                makeElementDraggable(cfg.winId, cfg.headerId);
            }
        });
    }

    // === GLOBAL MOUSEDOWN HANDLER ===
	window.addEventListener('mousedown', e => {
		const ctxMenu = document.getElementById('p8-ctx-menu');
		const themeOpts = document.getElementById('theme-options');
		
		// ... (keep your existing context menu and select-box cleanup code)
		if (ctxMenu && ctxMenu.style.display === 'block' && !ctxMenu.contains(e.target)) {
			closeContextMenu();
		}
		
		if (themeOpts && themeOpts.style.display === 'block' && !e.target.closest('#theme-selector')) {
			themeOpts.style.display = 'none';
		}

		if (!e.target.closest('.custom-select-display') &&
			!e.target.closest('.select-trigger') &&
			!e.target.closest('.custom-select-options-box') &&
			!e.target.closest('.select-options') &&
			!e.target.closest('.option-item')) {
			
			document.querySelectorAll(".custom-select-options-box, .select-options").forEach(b => {
				b.style.display = "none";
			});
		}
		
		// Check if we should even process this drag
		if (typeof isEditMode === 'undefined' || !isEditMode || e.button !== 0 ||
			e.target.closest('#style-editor, #rewards-manager, #bit-manager, #settings-window, #widgets-manager, .timer-btn-group, .setup-container, .p8-modal')) {
			return;
		}
		
		// Identify potential drag target
		dragTarget = e.target.closest('.p8-widget');
		
		if (dragTarget) {
			// --- NEW: RESIZER EXCLUSION LOGIC ---
			const r = dragTarget.getBoundingClientRect();
			const handleSize = 64; // Matches your CSS resize zone
			
			// Calculate if click is within bottom-right 20px
			const isClickingResizer = (e.clientX > r.right - handleSize && 
									   e.clientY > r.bottom - handleSize);
			
			// If clicking the resizer, abort the drag logic so CSS resize can take over
			if (isClickingResizer) {
				dragTarget = null;
				return;
			}
			// ------------------------------------
			
			offset = { x: e.clientX - r.left, y: e.clientY - r.top };
		}
	});

    window.addEventListener('mousemove', e => {
        if (typeof dragTarget !== 'undefined' && dragTarget) {
            dragTarget.style.left = (e.clientX - offset.x) + 'px';
            dragTarget.style.top = (e.clientY - offset.y) + 'px';
        }
    });

    window.addEventListener('mouseup', () => {
        if (typeof dragTarget !== 'undefined' && dragTarget) {
            localStorage.setItem(`p8_pos_${dragTarget.id}`, JSON.stringify({
                top: dragTarget.style.top,
                left: dragTarget.style.left
            }));
            dragTarget = null;
        }
    });
	// 🆕 NEW: Automated Resize Tracking for Native CSS Resize Handlers (Targeting Inner Chat Feed)
	// 🆕 FIXED: Automated Resize Tracking with Safety Guards for Toggle States
	if (chatFeed) {
        let resizeTimeout;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const currentHeight = entry.contentRect.height;

                // 🛑 SHARPENED GATE: If the height is below 32px, the widget was toggled hidden.
                // Ignore it entirely so it doesn't overwrite your real settings configuration!
                if (currentHeight < 32) continue;

                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    chatHeight = `${Math.round(currentHeight)}px`;
                    
                    if (typeof settings !== 'undefined') {
                        settings.chatHeight = chatHeight;
                    }

                    if (typeof saveSettings === "function") {
                        saveSettings();
                    }
                }, 200);
            }
        });
        resizeObserver.observe(chatFeed);
    }
    window.addEventListener('contextmenu', e => {
        if (e.target.closest('.setup-container') || e.target.closest('.p8-modal')) return;
        e.preventDefault();
        const ctxMenu = document.getElementById('p8-ctx-menu');
        if (ctxMenu) {
            ctxMenu.style.display = 'block';
            ctxMenu.style.left = e.clientX + 'px';
            ctxMenu.style.top = e.clientY + 'px';
        }
    });

    if (typeof bindRewardsManagerEvents === "function") bindRewardsManagerEvents();
    if (typeof bindBitManagerEvents === "function") bindBitManagerEvents();
    
    // NEW: Unified State Sync
    if (typeof syncAllToggleUI === "function") {
        syncAllToggleUI();
    }
}
 */
// =========================================================================
// ⚙️ MAIN EVENT LISTENER BINDING ENGINE
// =========================================================================
function bindEvents() {
    // Fire up targeted semantic subsystems
    bindTwitchAuthEvents();
    bindLayoutNavigationEvents();
	//bindtimersystemevents is currently inside helper functions and the timer logic should eventually be put into its own widget
    bindTimerSystemEvents();
    bindActionRegistryMaps();
    bindGlobalWindowInteractions(); // Runs layout close codes + global mouse canvas rules

    // Execute isolated downstream manager bindings
    if (typeof bindRewardsManagerEvents === "function") bindRewardsManagerEvents();
    if (typeof bindBitManagerEvents === "function") bindBitManagerEvents();
    
    if (typeof syncAllToggleUI === "function") {
        syncAllToggleUI();
    }
}

// =========================================================================
// 🌐 SYSTEM MODULE SUB-BINDERS
// =========================================================================

/**
 * Handles Twitch platform application handshake and credential management utilities
 */
function bindTwitchAuthEvents() {
    const SCOPES = "chat:read chat:edit channel:read:redemptions";

    onSafeClick("login-button", () => {
        window.location.href = `https://id.twitch.tv/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(FULL_REDIRECT)}&response_type=token&scope=${encodeURIComponent(SCOPES)}`;
    });

    onSafeClick("obs-url-output", (e, target) => {
        navigator.clipboard.writeText(target.innerText);
        const originalText = target.innerText;
        target.innerText = "COPIED TO CLIPBOARD!";
        setTimeout(() => target.innerText = originalText, 1500);
    });
}

/**
 * Manages configuration workspace panels, themes, map collections, and toggles
 */
function bindLayoutNavigationEvents() {
    // Panel Router Navigation
    PANEL_NAVIGATION_MAPS.forEach(cfg => {
        onSafeClick(cfg.triggerId, () => {
            const targetPanel = document.getElementById(cfg.targetId);
            if (targetPanel) targetPanel.style.display = 'block';
            closeContextMenu();
            if (cfg.onOpen) cfg.onOpen();
        });
    });

    // Binary Switch Registry Maps
    BOOLEAN_TOGGLE_MAPS.forEach(cfg => {
        const handler = (e) => {
            const incomingVal = cfg.valuePath ? e.target[cfg.valuePath] : null;
            const finalVal = cfg.invert ? !incomingVal : incomingVal;
            cfg.assignTo(finalVal);
            if (cfg.onSync) cfg.onSync();
        };
        if (cfg.type === "change") {
            onSafeChange(cfg.id, handler);
        } else {
            onSafeClick(cfg.id, handler);
        }
    });

    // Core Custom Theme Selections
    onSafeClick("current-theme-display", () => {
        const themeOptions = document.getElementById('theme-options');
        if (themeOptions) {
            themeOptions.style.display = themeOptions.style.display === 'block' ? 'none' : 'block';
        }
    }, true);
    onSafeClick("close-widgets-manager-btn", () => {
        const widgetWin = document.getElementById("widgets-manager");
        if (widgetWin) widgetWin.style.display = "none";
    });

    if (typeof WINDOW_CLOSE_MAPS !== 'undefined' && Array.isArray(WINDOW_CLOSE_MAPS)) {
        WINDOW_CLOSE_MAPS.forEach(mapping => {
            if (mapping && Array.isArray(mapping.triggers)) {
                mapping.triggers.forEach(triggerId => {
                    onSafeClick(triggerId, () => {
                        const targetWindow = document.getElementById(mapping.win);
                        if (targetWindow) targetWindow.style.display = 'none';
                    });
                });
            }
        });
    }
    onSafeClick("save-theme-btn", async () => {
        const nameInput = document.getElementById('theme-name-input');
        const newName = (nameInput ? nameInput.value.trim() : '') || 'Custom Theme';
        
        if (typeof registry !== 'undefined' && registry.themes) {
            registry.themes[newName] = JSON.parse(JSON.stringify(registry.themes[registry.active]));
            registry.active = newName;
            localStorage.setItem('p8_registry', JSON.stringify(registry));
            
            if (typeof renderThemeList === "function") renderThemeList();
            if (typeof p8Confirm === "function") await p8Confirm('Theme Settings Saved', true);
        }
    });
}

/**
 * Attaches handlers for generating and styling on-screen alert and countdown widgets
 */

/**
 * Loops through unified abstract action registries to parse simple system state routines
 * (Resets, logouts, canvas edit-locking flags, and context-menu auto-collapsing)
 */
function bindActionRegistryMaps() {
    if (typeof SIMPLE_CLICK_MAPS !== 'undefined' && Array.isArray(SIMPLE_CLICK_MAPS)) {
        SIMPLE_CLICK_MAPS.forEach(cfg => {
            const shouldStopPropagation = (cfg.id === "ctx-lock");
            
            onSafeClick(cfg.id, () => {
                cfg.handler();
                if (cfg.id.startsWith("ctx-")) {
                    closeContextMenu();
                }
            }, shouldStopPropagation);
        });
    }
}

/**
 * Sets deep window-level interaction rules and interface layout wrappers
 * (Draggable windows, close maps, click-away blurs, context menus, and resize canvas caching)
 */
function bindGlobalWindowInteractions() {
    // =========================================================================
    // 🪟 EXPLICIT WINDOW LAYOUT & PANEL VISIBILITY CONTROLS
    // =========================================================================
    // Manual close override for widgets settings drawer
    onSafeClick("close-widgets-manager-btn", () => {
        const widgetWin = document.getElementById("widgets-manager");
        if (widgetWin) widgetWin.style.display = "none";
    });
    // Iterative registry handling for abstract system modal loops
    if (typeof WINDOW_CLOSE_MAPS !== 'undefined' && Array.isArray(WINDOW_CLOSE_MAPS)) {
        WINDOW_CLOSE_MAPS.forEach(mapping => {
            if (mapping && Array.isArray(mapping.triggers)) {
                mapping.triggers.forEach(triggerId => {
                    onSafeClick(triggerId, () => {
                        const targetWindow = document.getElementById(mapping.win);
                        if (targetWindow) targetWindow.style.display = 'none';
                    });
                });
            }
        });
    }
    // Draggable UI Windows configurations hook
    if (typeof makeElementDraggable === "function") {
        DRAGGABLE_WINDOWS_CONFIG.forEach(cfg => {
            if (document.getElementById(cfg.winId)) {
                makeElementDraggable(cfg.winId, cfg.headerId);
            }
        });
    }
    // =========================================================================
    // 🖱️ LOW-LEVEL GLOBAL CAPTURE LISTENERS (Mouse & Canvas Operations)
    // =========================================================================
    window.addEventListener('mousedown', e => {
        const ctxMenu = document.getElementById('p8-ctx-menu');
        const themeOpts = document.getElementById('theme-options');
        
        // Auto-collapse layout context settings
        if (ctxMenu && ctxMenu.style.display === 'block' && !ctxMenu.contains(e.target)) {
            closeContextMenu();
        }
        
        // Auto-collapse open theme selectors
        if (themeOpts && themeOpts.style.display === 'block' && !e.target.closest('#theme-selector')) {
            themeOpts.style.display = 'none';
        }

        // Auto-blur dynamic dropdown boxes when clicking canvas dead space
        if (!e.target.closest('.custom-select-display') &&
            !e.target.closest('.select-trigger') &&
            !e.target.closest('.custom-select-options-box') &&
            !e.target.closest('.select-options') &&
            !e.target.closest('.option-item')) {
            
            document.querySelectorAll(".custom-select-options-box, .select-options").forEach(b => {
                b.style.display = "none";
            });
        }
        
        // Drag validation tracking gate
        if (typeof isEditMode === 'undefined' || !isEditMode || e.button !== 0 ||
            e.target.closest('#style-editor, #rewards-manager, #bit-manager, #settings-window, #widgets-manager, .timer-btn-group, .setup-container, .p8-modal')) {
            return;
        }
        
        dragTarget = e.target.closest('.p8-widget');
        
        if (dragTarget) {
            const r = dragTarget.getBoundingClientRect();
            const handleSize = 64; 
            
            const isClickingResizer = (e.clientX > r.right - handleSize && 
                                       e.clientY > r.bottom - handleSize);
            
            if (isClickingResizer) {
                dragTarget = null;
                return;
            }
            
            offset = { x: e.clientX - r.left, y: e.clientY - r.top };
        }
    });

    window.addEventListener('mousemove', e => {
        if (typeof dragTarget !== 'undefined' && dragTarget) {
            dragTarget.style.left = (e.clientX - offset.x) + 'px';
            dragTarget.style.top = (e.clientY - offset.y) + 'px';
        }
    });

    window.addEventListener('mouseup', () => {
        if (typeof dragTarget !== 'undefined' && dragTarget) {
            localStorage.setItem(`p8_pos_${dragTarget.id}`, JSON.stringify({
                top: dragTarget.style.top,
                left: dragTarget.style.left
            }));
            dragTarget = null;
        }
    });
    // =========================================================================
    // 📊 LAYOUT OBSERVERS & CONTEXT INTERCEPTORS
    // =========================================================================
    if (typeof chatFeed !== 'undefined' && chatFeed) {
        let resizeTimeout;
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                const currentHeight = entry.contentRect.height;
                if (currentHeight < 32) continue;

                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    chatHeight = `${Math.round(currentHeight)}px`;
                    
                    if (typeof settings !== 'undefined') {
                        settings.chatHeight = chatHeight;
                    }
                    if (typeof saveSettings === "function") {
                        saveSettings();
                    }
                }, 200);
            }
        });
        resizeObserver.observe(chatFeed);
    }

    window.addEventListener('contextmenu', e => {
        if (e.target.closest('.setup-container') || e.target.closest('.p8-modal')) return;
        e.preventDefault();
        const ctxMenu = document.getElementById('p8-ctx-menu');
        if (ctxMenu) {
            ctxMenu.style.display = 'block';
            ctxMenu.style.left = e.clientX + 'px';
            ctxMenu.style.top = e.clientY + 'px';
        }
    });
}

init();
//=============================================================================
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_
//-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-_-
//=================================================================================
//---------------------------------------------------------------------------------
//_________________________________________________________________________________
