//----

/* 
NOTES:

- find a solution for browser page falling asleep 
- make entropia widget disabled until enabled by Default 


one of these loots or system messsages crashed the loot tracker ( it stopped runnign on loot)

[System]: Mission updated (Cleanup Job (Daily))
[System]: You received [Credit - H.M.] x (200) Value: 2 PED
[System]: You received [Space Mining Scrip - H.M.] x (1) Value: 0 PED
[System]: You received [Scottium Stone] x (2) Value: 0.25 PED
[System]: You received [Universal Ammo] x (7500) Value: 0.75 PED
[System]: Mission completed (Cleanup Job (Daily))





- entropia-widget shouldnt load unless widget is enabled, once enabled require refresh
-create landing page:
	-> on first load, prompt user:
			"OBS Browser Source" or "Web overlay"
-copy theme to clipboard, import theme
-copy settings/profile to clipboard, iimport settings/profile

- import local widget
-twitch commands to pull info from entropianexus
-web tracker for eu 


-team tracking & commands
-import loadout from entropia nexus and calculate cost / stats
-finish other polling stuff

-add more toggle-able stats and info to entropia-widget (overlay) ( off by default )

-toggleable seperate euteam-widget with class euwidgets
   ->   if entropia-widget is disabled, then so it eu-team widget;
      but, if entropia-widget is enabled eu-team widget is toggleable.
	  
-add minifest grid mode options(looted item list)
modes:
 autocycle
	->cycle all selected every {input desired time between modes}
 itemtotal, ((current generic default mode ) this is the only mode our specific toggles change, all other modes have preset values and info) 
 biggest loots
 skills
 combatstats ( similar to recount addon for wow)
 team (team members and lootlogs
 recent globals:
		(a top section that shows the most recent global by anyplayer on the streamers current planet abot a section for a list of all streamers hof in history with timestamps)
			*** sortable with commands or interact window ***
 
 
 - add environment option to channel point manager bit cheer manager
    -> mist/fog   (fog on bottom of screen. when checked get options for set height and color)
	-> weather (snow, falling autumn leaves)  
	-> party lights
	-?filters?
*/
//__________________________________________________
//==================================================
// --- MODULE IMPORTS ---
// import { EntropiaWidget } from './entropia-widget.js';
import { EntropiaWidget } from './entropia-widget-refactored.js';
import { StreamJukebox } from './jukebox.js'; // 🟢 Added Jukebox Engine Module
console.log("🚀 [Module Load]: entropia-widget-refactored.js version 0.002 imported successfully without dependencies!");
console.log("🚀 [Module Load]: jukebox.js version 1.000 imported successfully!");

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
    settings.botPrefix = BOT_PREFIX;
    settings.useBotPrefix = useBotPrefix;
    settings.cmdPrefix = CMD_PREFIX;
    settings.useCmdPrefix = useCmdPrefix;
    settings.consoleMessages = consoleMessages;
    settings.floatingEmotes = floatingEmotes;
    
    settings.chatHidden = chatHidden;

    settings.statusHidden = statusHidden;
    //---------------------------------------
	// Alert Widget
	settings.alertHidden = alertHidden;
	settings.rewardsEnabled = rewardsEnabled;
    settings.bitsEnabled = bitsEnabled;
	// Add these lines to commit reward/bit values to disk
	settings.chatHeight = chatHeight;
	//---------------------------------------
    localStorage.setItem('p8_settings', JSON.stringify(settings));
    
    // Auto-refresh panel states inside active DOM elements if they exist
    if (typeof updateManagerBadgesUI === "function") {
        updateManagerBadgesUI();
		updateAllBadgesUI();
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
const statusWidget = document.getElementById('status-widget');
const statusIndicator = document.getElementById("status-indicator");
const statusText = document.getElementById("status-text");
const chatWidget = document.getElementById('chat-widget');
const chatFeed = document.getElementById('chat-feed');
let isEditMode = true, dragTarget = null, offset = { x: 0, y: 0 }, fadeTimeout;

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
// Add to your registry initialization in ttvoverlayApp.js
if (!registry.timers) {
    registry.timers = {
        defaults: {
            labelFontSize: "14px",
            labelFontWeight: "600",
            timerFontSize: "24px",
            timerFontColor: "#ffffff",
            showMode: "always" // Options: "always", "counting", "never"
        }
    };
}
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

// ==========================================
// --- CORE MAPS CONFIGURATIONS ---
// ==========================================

let pendingImageBase64 = "";

const AVAILABLE_IN_ANIMATIONS = ["none", "fadeIn", "bounceIn", "zoomIn", "slideInDown", "slideInUp"];
const AVAILABLE_OUT_ANIMATIONS = ["none", "fadeOut", "bounceOut", "zoomOut", "slideOutUp", "slideOutDown"];
// =========================================================================
// --- CONFIGURATION MAPS & STRUCTS ---
// =========================================================================

// 🌐 GLOBAL CORE CONFIGURATION LAYER (Single Source of Truth)
const SETTINGS_SCHEMA = [
    {
        groupName: "🔔 Alert Core Management",
        items: [
            { 
                label: "Master Alert Visibility", 
                idKey: "master", 
                get: () => !alertHidden, 
                set: (v) => { alertHidden = !v; settings.alertHidden = !v; syncAlertVisibilityState(); }
            },
            { 
                label: "Channel Point Alerts", 
                idKey: "rewards", 
                get: () => rewardsEnabled, 
                set: (v) => { rewardsEnabled = v; settings.rewardsEnabled = v; saveSettings(); } 
            },
            { 
                label: "Bit Cheer Alerts", 
                idKey: "bits", 
                get: () => bitsEnabled, 
                set: (v) => { bitsEnabled = v; settings.bitsEnabled = v; saveSettings(); } 
            },
            { 
                label: "Song Request Jukebox", 
                idKey: "jukebox", 
                get: () => !!settings.jukeboxWidgetEnabled, 
                set: (v) => { settings.jukeboxWidgetEnabled = v; saveSettings(); } 
            }
        ]
    },
    {
        groupName: "💬 Chat & UI Displays",
        items: [
            { 
                label: "Show Twitch Chat Widget", 
                idKey: "chat-widget", 
                get: () => !chatHidden, 
                set: (v) => { 
                    chatHidden = !v; 
                    if (chatWidget) {
                        chatWidget.style.display = chatHidden ? "none" : "block";
                        if (!chatHidden && chatFeed && typeof chatHeight !== 'undefined' && chatHeight) {
                            chatFeed.style.height = chatHeight;
                        }
                    }
                    saveSettings();
                }
            },
            { 
                label: "Show Stream Status Indicator", 
                idKey: "status-widget", 
                get: () => !statusHidden, 
                set: (v) => { statusHidden = !v; if (statusWidget) statusWidget.style.display = statusHidden ? "none" : "block"; saveSettings(); }
            },
            { 
                label: "Floating Chat Emotes", 
                idKey: "emotes", 
                get: () => floatingEmotes, 
                set: (v) => { floatingEmotes = v; saveSettings(); } 
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
                set: (v) => { useCmdPrefix = v; saveSettings(); } 
            },
            { 
                label: "Show Bot Prefixes", 
                idKey: "bot-visibility", 
                get: () => useBotPrefix, 
                set: (v) => { useBotPrefix = v; saveSettings(); } 
            },
            { 
                label: "Console Logging", 
                idKey: "console", 
                get: () => consoleMessages, 
                set: (v) => { consoleMessages = v; saveSettings(); } 
            }
        ]
    }
];
// Maps trigger elements to their target interface panels and optional callback lifecycle hooks
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
// Maps HTML inputs/buttons to reactive parameters, executing automated mutations and context syncs
const BOOLEAN_TOGGLE_MAPS = [
    // --- MASTER ALERTS ---
    { 
        id: "settings-toggle-master-alerts", type: "change", valuePath: "checked", invert: true, 
        assignTo: (val) => { alertHidden = val; settings.alertHidden = val; }, 
        onSync: () => { saveSettings(); syncAllToggleUI(); } 
    },
    { 
        id: "stg-toggle-master-btn", type: "click", valuePath: null, invert: false, 
        assignTo: () => { alertHidden = !alertHidden; settings.alertHidden = alertHidden; }, 
        onSync: () => { saveSettings(); syncAllToggleUI(); } 
    },
    { 
        id: "mgr-toggle-alert-btn", type: "click", valuePath: null, invert: false, 
        assignTo: () => { alertHidden = !alertHidden; settings.alertHidden = alertHidden; }, 
        onSync: () => { saveSettings(); syncAllToggleUI(); } 
    },

    // --- REWARDS ---
    { 
        id: "stg-toggle-rewards-btn", type: "click", valuePath: null, invert: false, 
        assignTo: () => { rewardsEnabled = !rewardsEnabled; settings.rewardsEnabled = rewardsEnabled; }, 
        onSync: () => { saveSettings(); syncAllToggleUI(); } 
    },
    { 
        id: "mgr-toggle-rewards-btn", type: "click", valuePath: null, invert: false, 
        assignTo: () => { rewardsEnabled = !rewardsEnabled; settings.rewardsEnabled = rewardsEnabled; }, 
        onSync: () => { saveSettings(); syncAllToggleUI(); } 
    },

    // --- BITS ---
    { 
        id: "stg-toggle-bits-btn", type: "click", valuePath: null, invert: false, 
        assignTo: () => { bitsEnabled = !bitsEnabled; settings.bitsEnabled = bitsEnabled; }, 
        onSync: () => { saveSettings(); syncAllToggleUI(); } 
    },
    { 
        id: "mgr-toggle-bits-btn", type: "click", valuePath: null, invert: false, 
        assignTo: () => { bitsEnabled = !bitsEnabled; settings.bitsEnabled = bitsEnabled; }, 
        onSync: () => { saveSettings(); syncAllToggleUI(); } 
    },

    // --- JUKEBOX ---
    { 
        id: "stg-toggle-jukebox-btn", type: "click", valuePath: null, invert: false, 
        assignTo: () => { settings.jukeboxWidgetEnabled = !settings.jukeboxWidgetEnabled; }, 
        onSync: () => { saveSettings(); syncAllToggleUI(); } 
    }
];
// Straight utility mapping dictionary for clean event routing execution pipelines
const SIMPLE_CLICK_MAPS = [
    { id: "ctx-reset",     handler: () => systemReset() },
    { id: "logout-btn-ui", handler: () => systemReset() },
    { id: "ctx-lock",      handler: () => setEditMode(!isEditMode) }
];
// Configuration layout for elements requiring dynamic dragging parameters
const DRAGGABLE_WINDOWS_CONFIG = [
    { winId: "bit-manager",           headerId: "bit-manager-header" },
    { winId: "settings-window",       headerId: "settings-manager-header" },
    { winId: "widgets-manager",       headerId: "widgets-manager-header" }
];

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
    ],
    // Bit Cheer Manager Additions
    "bit-tier-selector": [
        { value: "1", label: "Tier 1 (1+ Bits)" },
        { value: "100", label: "Tier 2 (100+ Bits)" },
        { value: "500", label: "Tier 3 (500+ Bits)" },
        { value: "1000", label: "Tier 4 (1000+ Bits)" },
        { value: "5000", label: "Tier 5 (5000+ Bits)" }
    ],
    // Explicitly binding the Bit Animation IDs so populateCustomDropdowns maps them safely
    "bit-text-in-anim": AVAILABLE_IN_ANIMATIONS,
    "bit-text-out-anim": AVAILABLE_OUT_ANIMATIONS,
    "bit-img-in-anim": AVAILABLE_IN_ANIMATIONS,
    "bit-img-out-anim": AVAILABLE_OUT_ANIMATIONS
};
// State engine to track actively selected values since we don't have standard .value anymore
let customSelectValues = {
    "reward-text-in-anim": "none",
    "reward-text-out-anim": "none",
    "reward-img-in-anim": "none",
    "reward-img-out-anim": "none",
    "reward-font-weight": "bold",
    "reward-img-mode": "loop",
    // Bit Cheer Manager State Fallbacks
    "bit-tier-selector": "1",
    "bit-text-in-anim": "none",
    "bit-text-out-anim": "none",
    "bit-img-in-anim": "none",
    "bit-img-out-anim": "none"
};

// Registry mapping overlay window elements to all actions that trigger their close event
const WINDOW_CLOSE_MAPS = [
    { win: "rewards-manager", triggers: ["close-rewards-btn", "close-rewards-top-btn"] },
    { win: "bit-manager",     triggers: ["close-bit-manager-btn", "close-bits-top-btn"] },
    { win: "settings-window",  triggers: ["close-settings-manager-btn", "close-settings-top-btn"] },
    { win: "style-editor",     triggers: ["close-editor-btn", "close-editor-top-btn"] },
	{ win: "widgets-manager",     triggers: [//"close-widgets-manager-btn",
	"close-widgets-top-btn"] }
];
// Configuration layout matrix for the Custom Select dropdown boxes
const DROPDOWN_CONFIGS = [
    { display: "display-bit-text-in-anim",   options: "options-bit-text-in-anim",   list: ["bounceIn", "fadeIn", "slideInLeft", "slideInRight", "zoomIn", "none"] },
    { display: "display-bit-text-out-anim",  options: "options-bit-text-out-anim",  list: ["bounceOut", "fadeOut", "slideOutLeft", "slideOutRight", "zoomOut", "none"] },
    { display: "display-bit-img-in-anim",    options: "options-bit-img-in-anim",    list: ["bounceIn", "fadeIn", "slideInLeft", "slideInRight", "zoomIn", "none"] },
    { display: "display-bit-img-out-anim",   options: "options-bit-img-out-anim",   list: ["bounceOut", "fadeOut", "slideOutLeft", "slideOutRight", "zoomOut", "none"] }
];
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
    
    // Core Layout & Registry Loading
    loadPositions();
	renderSettingsWindow();
    renderThemeControls();
    
    // 1. INSTANTIATE WIDGETS
    try {
        if (typeof EntropiaWidget !== 'undefined') {
            window.entropiaLogParser = new EntropiaWidget();
            console.log("✅ Entropia Widget Instance created.");
        } else {
            console.warn("⚠️ [Init Warning]: EntropiaWidget class is not defined.");
        }
    } catch (entropiaError) {
        console.error("❌ [Init Error]: Failed to initialize Entropia Widget:", entropiaError);
    }

    try {
        if (typeof StreamJukebox !== 'undefined') {
            window.streamJukeboxEngine = new StreamJukebox();
            console.log("✅ Jukebox Instance created.");
        } else {
            console.warn("⚠️ [Init Warning]: StreamJukebox class is not defined.");
        }
    } catch (jukeboxError) {
        console.error("❌ [Init Error]: Failed to initialize Jukebox Module:", jukeboxError);
    }

    // 2. NOW inject commands (only after both instances are guaranteed to exist)
    console.log("📡 [Command Registry]: Starting injection scan...");
    injectAllWidgetCommands();
	
    // Populate registry array caches for rewards and bits
    renderRewardsList(); 
    populateCustomDropdowns();
    initTimerEngine();
    
    // Bind all event listeners to the DOM
    bindEvents();
    console.log("ttvoverlayapp.js version 0.112 finished loading");
}
function injectAllWidgetCommands() {
    const activeWidgets = [
        { name: "EntropiaParser", instance: window.entropiaLogParser },
        { name: "StreamJukebox", instance: window.streamJukeboxEngine }
    ];

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
    // Pass the local botSay utility directly into the initialization layer
	console.log("🔍 Attempting to inject commands for:", widgetInstance);
    if (widgetInstance && typeof widgetInstance.getCommands === 'function') {
        const widgetCommands = widgetInstance.getCommands(botSay);
        console.log("📦 Commands received from widget:", widgetCommands);
        widgetCommands.forEach(cmd => {
            const lookupKey = cmd.name.toLowerCase().trim();
            
            if (!commandsRegistry[lookupKey]) {
                // Perfect, 1:1 schema assignment mirror
                commandsRegistry[lookupKey] = {
                    adminOnly: cmd.adminOnly || false,
                    execute: cmd.execute
                };
                console.log(`📡 Registered Native Module Command: !${lookupKey} [AdminOnly: ${commandsRegistry[lookupKey].adminOnly}]`);
            }
        });
    }
}

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



// ==========================================
// --- REWARDS LIST GENERATION SYSTEM ---
// ==========================================
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
function renderSettingsWindow() {
    const stackContainer = document.querySelector('#settings-window .settings-stack');
    if (!stackContainer) return;
    
    // Clear the stack before drawing to ensure fresh state on re-renders
    stackContainer.innerHTML = '';

    // Apply layout constraints to keep the panel tightly bounds-locked and navigable
    stackContainer.style.cssText = "padding-top: 10px; display: flex; flex-direction: column; gap: 10px; max-height: 250px; overflow-y: auto; overflow-x: hidden; padding-right: 4px;";

    // Feed globally defined constant structure directly down into the view assembler
    SETTINGS_SCHEMA.forEach(group => {
        const detailsEl = document.createElement('details');
        detailsEl.className = 'settings-group-wrapper';
        detailsEl.open = true; // Remains open initially; allows simple collapsing transitions
        detailsEl.style.cssText = "border: 1px solid #27272a; border-radius: 4px; background: #09090b; margin-bottom: 2px; overflow: hidden;";

        const summaryEl = document.createElement('summary');
        summaryEl.className = 'settings-group-header';
        summaryEl.style.cssText = "padding: 6px 8px; font-size: 11px; font-weight: 600; color: var(--accent, #a855f7); background: #18181b; cursor: pointer; user-select: none; list-style: none; display: flex; align-items: center; justify-content: space-between;";
        summaryEl.innerHTML = `<span>${group.groupName}</span><span class="group-arrow" style="font-size: 9px; opacity: 0.6;">▼</span>`;
        
        detailsEl.appendChild(summaryEl);

        const innerPanel = document.createElement('div');
        innerPanel.className = 'settings-group-content';
        innerPanel.style.cssText = "padding: 6px 8px; display: flex; flex-direction: column; gap: 6px; background: #09090b;";

        group.items.forEach(item => {
            const row = document.createElement('div');
            row.className = 'settings-toggle-row';
            row.style.cssText = "display: flex; justify-content: space-between; align-items: center;";

            row.innerHTML = `
                <span class="settings-toggle-label" style="font-size: 12px; color: #e4e4e7;">${item.label}:</span>
                <div class="settings-toggle-controls" style="display: flex; align-items: center; gap: 8px;">
                    <span id="stg-${item.idKey}-status-badge" class="toggle-status-badge">---</span>
                    <button type="button" id="stg-toggle-${item.idKey}-btn" class="toggle-action-btn">Toggle</button>
                </div>
            `;

            const toggleBtn = row.querySelector(`#stg-toggle-${item.idKey}-btn`);
            if (toggleBtn) {
                toggleBtn.addEventListener('click', () => {
                    const currentVal = item.get();
                    item.set(!currentVal);
                    syncAllToggleUI(); // Push live tracking visual flags across active panes
                });
            }

            innerPanel.appendChild(row);
        });

        detailsEl.appendChild(innerPanel);
        stackContainer.appendChild(detailsEl);
    });

    // Run structural component badge sync instantly on panel drawing completion
    syncAllToggleUI();
}
// --- EVENT BINDING ---
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
    
    // Helper to update specific badges (Preserves your clean class style naming assignments!)
    const updateBadge = (id, isActive) => {
        const el = document.getElementById(id);
        if (el) {
            el.className = `toggle-status-badge ${isActive ? 'status-enabled' : 'status-disabled'}`;
            el.innerText = isActive ? "ON" : "OFF";
        }
    };

    // 🤖 AUTOMATED LOOP: Automatically updates every badge inside your settings window schema!
    if (typeof SETTINGS_SCHEMA !== 'undefined') {
        SETTINGS_SCHEMA.forEach(group => {
            group.items.forEach(item => {
                updateBadge(`stg-${item.idKey}-status-badge`, item.get());
            });
        });
    }

    // 🎯 INDEPENDENT MANAGEMENT SYNC: Handles your multi-window alerts manager panel badges
    updateBadge("mgr-alert-status-badge", !alertHidden);
    updateBadge("mgr-rewards-status-badge", s.rewardsEnabled);
    updateBadge("mgr-bits-status-badge", s.bitsEnabled);

    // 🎸 JUKEBOX VISUAL SIDE-EFFECTS: Handles the opacity/interaction changes on your player element
    const jbControls = document.getElementById("jukebox-widget-controls");
    if (jbControls) {
        jbControls.style.display = s.jukeboxWidgetEnabled ? "block" : "none";
        jbControls.style.opacity = s.jukeboxWidgetEnabled ? "1" : "0.5";
        jbControls.style.pointerEvents = s.jukeboxWidgetEnabled ? "auto" : "none";
    }

    // 🏎️ CORE AUDIO ENGINE SYNC
    if (window.streamJukeboxEngine) {
        window.streamJukeboxEngine.setWidgetActiveState(s.jukeboxWidgetEnabled);
    }
}
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

// Programmatic getter and setter wrappers to maintain backward compatibility with your save actions
function getCustomSelectValue(id) {
    return customSelectValues[id];
}
function setCustomSelectValue(id, value) {
    customSelectValues[id] = value;
    
    // Support both fallback matching patterns
    const displayEl = document.getElementById(`display-${id}`) || document.getElementById(`current-${id}`);
    if (!displayEl) return;

    // Resolve structural label representations if tracking raw object lists
    const dataset = CUSTOM_SELECT_DATA[id];
    if (dataset && typeof dataset[0] === 'object') {
        const matched = dataset.find(item => String(item.value) === String(value));
        displayEl.innerText = matched ? matched.label : value;
    } else {
        displayEl.innerText = value;
    }

    // Contextual Trigger: Fire custom change updates for the Bit Tier configuration loader
    if (id === "bit-tier-selector") {
        if (typeof loadBitTierConfig === "function") {
            loadBitTierConfig(value);
        }
        return;
    }

    // --- LIVE GRAPH REWRITE ENGINE MATCHES ---
    // If we are configuring a Bit Alert Dropdown, update registry tracking immediately
    if (id.startsWith("bit-")) {
        const activeTier = customSelectValues["bit-tier-selector"] || "1";
        if (registry.bits && registry.bits[activeTier]) {
            // Map the internal field layout key (e.g., bit-text-in-anim -> anim_tx_in)
            let targetKey = null;
            if (id === "bit-text-in-anim") targetKey = "anim_tx_in";
            if (id === "bit-text-out-anim") targetKey = "anim_tx_out";
            if (id === "bit-img-in-anim") targetKey = "anim_im_in";
            if (id === "bit-img-out-anim") targetKey = "anim_im_out";

            if (targetKey) {
                registry.bits[activeTier][targetKey] = value;
                console.log(`Saved bit array transaction [Tier ${activeTier}]: ${targetKey} -> ${value}`);
            }
        }
    }
}
function populateCustomDropdowns() {
    Object.keys(CUSTOM_SELECT_DATA).forEach(id => {
        const displayEl = document.getElementById(`display-${id}`) || 
                          document.getElementById(`current-${id}`) || 
                          document.getElementById(id);

        const optionsEl = document.getElementById(`options-${id}`) || 
                          document.getElementById(`${id}-options`);

        if (!displayEl || !optionsEl) {
            // console.warn(`Dropdown elements not found for ID: ${id}`);
            return;
        }

        const optionsData = CUSTOM_SELECT_DATA[id];
        optionsEl.innerHTML = "";

        optionsData.forEach(item => {
            const val = typeof item === 'object' ? item.value : item;
            const text = typeof item === 'object' ? item.label : item;

            const row = document.createElement("div");
            row.className = "option-item";
            row.innerText = text;
            row.dataset.value = val;

            row.style.cssText = "padding: 6px 10px; font-size: 11px; color: #e4e4e7; cursor: pointer;";

            row.addEventListener("mouseenter", () => row.style.background = "var(--accent, #9146ff)");
            row.addEventListener("mouseleave", () => row.style.background = "transparent");

            row.addEventListener("click", (e) => {
                e.stopImmediatePropagation();   // Crucial fix
                setCustomSelectValue(id, val);
                optionsEl.style.display = "none";
            });

            optionsEl.appendChild(row);
        });

        // Attach click handler to display (only once)
        if (!displayEl.dataset.dropdownInitialized) {
            displayEl.dataset.dropdownInitialized = "true";

            displayEl.addEventListener("click", (e) => {
                e.stopImmediatePropagation();

                // Close all other dropdowns
                document.querySelectorAll(".custom-select-options-box, .select-options").forEach(box => {
                    if (box !== optionsEl) box.style.display = "none";
                });

                optionsEl.style.display = optionsEl.style.display === "block" ? "none" : "block";
            });
        }
    });
}

// --- color helpers ---
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

// --- INITIALIZE DRAGGING FOR BOTH WINDOWS ---
document.addEventListener("DOMContentLoaded", () => {
    // Parameter 1: The Main Window Element ID
    // Parameter 2: The Header/Handle Element ID
    makeElementDraggable("style-editor", "theme-manager-header");
    makeElementDraggable("rewards-manager", "rewards-manager-header");
});
function makeElementDraggable(targetId, handleId) {
    const target = document.getElementById(targetId);
    const handle = document.getElementById(handleId);

    if (!target || !handle) return;

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        // Only drag on left click
        if (e.button !== 0) return;
        
        e.preventDefault();
        
        // Get the initial mouse cursor position
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // If the element uses a centering transform (like the Theme Manager),
        // capture its current bounding coordinates and strip the transform immediately
        // BEFORE dragging starts to avoid jumping.
        const computedStyle = window.getComputedStyle(target);
        if (computedStyle.transform !== 'none' && !target.style.left) {
            const rect = target.getBoundingClientRect();
            target.style.transform = 'none';
            target.style.left = rect.left + 'px';
            target.style.top = rect.top + 'px';
        }
        
        // Attach event listeners for moving and releasing the mouse
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        // Set the element's new absolute position coordinates
        let newTop = target.offsetTop - pos2;
        let newLeft = target.offsetLeft - pos1;

        // --- UPDATED BOUNDARY GUARDS ---
        // Prevent window from getting lost off the top or left edge
        if (newTop < 0) newTop = 0;
        if (newLeft < 0) newLeft = 0;

        // Prevent window from escaping past the right side of the screen
        if (newLeft + target.offsetWidth > window.innerWidth) {
            newLeft = window.innerWidth - target.offsetWidth;
        }

        // FIX: Allow the window to slide all the way to the bottom frame.
        // It locks it right before the header handle (approx 40px) vanishes off-screen.
        const minVisibleHeader = 40; 
        if (newTop > window.innerHeight - minVisibleHeader) {
            newTop = window.innerHeight - minVisibleHeader;
        }

        // Apply new styles
        target.style.top = newTop + "px";
        target.style.left = newLeft + "px";
        
        // Clear right/bottom anchors so they don't fight the explicit top/left styling
        target.style.right = 'auto';
        target.style.bottom = 'auto';
    }

    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}
function setupCustomDropdownEngine(displayId, optionsId, optionItems, onSelectionCallback = null) {
	console.log(`Setting up: ${displayId}, Items count: ${optionItems ? optionItems.length : 'NULL'}`);
    const displayEl = document.getElementById(displayId);
    const optionsEl = document.getElementById(optionsId);
	if (!displayEl) console.error(`Missing Display Element: ${displayId}`);
    if (!optionsEl) console.error(`Missing Options Element: ${optionsId}`);
    if (!displayEl || !optionsEl) return;


    optionsEl.innerHTML = "";
    optionItems.forEach(anim => {
        const opt = document.createElement("div");
        opt.className = "option-item";
        opt.style.cssText = "padding: 4px 8px; cursor: pointer;";
        opt.innerText = anim;
        opt.addEventListener("click", (e) => {
            e.stopPropagation();
            displayEl.innerText = anim;
            optionsEl.style.display = "none";
            if (onSelectionCallback) onSelectionCallback(anim);
        });
        optionsEl.appendChild(opt);
    });

    displayEl.addEventListener("click", (e) => {
        e.stopPropagation();
        document.querySelectorAll(".custom-select-options-box").forEach(box => {
            if (box !== optionsEl) box.style.display = "none";
        });
        optionsEl.style.display = optionsEl.style.display === "block" ? "none" : "block";
    });
}
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

// =========================================================================
// --- DOM UTILITY & EVENT ROUTING HELPERS ---
// =========================================================================
/* Safely attaches a click listener to an element if it exists in the DOM. */
function onSafeClick(id, callback, stopPropagation = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", (e) => {
        if (stopPropagation) e.stopPropagation();
        callback(e, el);
    });
}
/* Safely attaches a change listener to an input element if it exists in the DOM. */
function onSafeChange(id, callback) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", (e) => callback(e, el));
}
/* Inline file streaming parsing utility to cut file handler duplicate code blocks */
function bindBase64FileReader(inputElement, onLoadedSuccess, onClearFallback) {
    if (!inputElement) return;
    inputElement.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) {
            onClearFallback();
            return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => onLoadedSuccess(evt.target.result, file.name);
        reader.readAsDataURL(file);
    });
}
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
function closeContextMenu() {
    const ctxMenu = document.getElementById('p8-ctx-menu');
    if (ctxMenu) ctxMenu.style.display = 'none';
}
// --- CORE COMMAND LOGIC & WIDGET VISIBILITY CONTROLS ---
// --- CENTRALIZED COMMAND REGISTRY ---
// Helper to parse ID or default to latest
function resolveTargetId(message, type) {
    const parts = message.trim().split(" ");
    const id = parts[0]; // Assume first argument is the ID
    return activeTimers[id] && activeTimers[id].type === type ? id : getLatestInstanceIdByType(type);
}

const commandsRegistry = {
    "hello": {
        adminOnly: false,
        execute: (user, message, flags) => {
            botSay(`System active. Current prefix: !${useCmdPrefix ? CMD_PREFIX : '[NONE]'}`);
        }
    },
/* 	"toggle": {
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
                if (chatWidget) { chatWidget.style.display = chatHidden ? "none" : "block"; }
                botSay(`Chat Widget visibility: ${chatHidden ? "Hidden" : "Visible"}`);
            }
            else if (target === "alert" || target === "alerts") {
                alertHidden = !alertHidden;
                if (alertWidget) {
                    alertWidget.style.display = alertHidden ? "none" : "block";
                    if (alertHidden) alertWidget.style.opacity = "0";
                }
                botSay(`Alert Widget visibility: ${alertHidden ? "Hidden" : "Visible"}`);
            }
            else if (target === "status") {
                statusHidden = !statusHidden;
                if (statusWidget) { statusWidget.style.display = statusHidden ? "none" : "block"; }
                botSay(`Status Widget visibility: ${statusHidden ? "Hidden" : "Visible"}`);
            }
            // This now safely synchronizes our updated global variables to localStorage
            saveSettings();
        }
    }, */
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
        triggerAlertPipeline(reward, user, cost, message);
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


// =====================================================================================================================================================
// =========================================================================
// --- SOUND SYSTEM ---
// =========================================================================
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

// =========== END OF SOUND SYTEM ===================================
// =====================================================================================================================================================


// =====================================================================================================================================================
// =========================================================================
// --- TIMERS & RUNTIME CONTEXT ENGINE STATE ---
// =========================================================================
// Persistent configurations saved across sessions
let activeTimers = JSON.parse(localStorage.getItem('p8_active_timers')) || {}; 
let timerIntervalId = null;
let savedCountdowns = JSON.parse(localStorage.getItem('p8_saved_countdowns')) || {};
function saveCountdownsToStorage() {
    localStorage.setItem('p8_saved_countdowns', JSON.stringify(savedCountdowns));
}
function saveActiveTimersToStorage() {
    localStorage.setItem('p8_active_timers', JSON.stringify(activeTimers));
}
// Global Core Controller Initialization Wrapper
function initTimerEngine() {
    // Restore runtime ticks if active instances are pulled from storage on load
    const keys = Object.keys(activeTimers);
    if (keys.length > 0) {
        const shouldRestart = keys.some(id => activeTimers[id].running);
        if (shouldRestart && !timerIntervalId) {
            timerIntervalId = setInterval(processTimersTick, 1000);
        }
    }

    // Direct render draw call
    renderActiveTimersUI();
}
function updateTimerStyles() {
    const colorValue = document.getElementById('tmr-color-text').value;
    
    if (/^#[0-9A-F]{6}$/i.test(colorValue)) {
        document.getElementById('tmr-color-picker').value = colorValue;
    }

    const timers = document.querySelectorAll('.timer-instance-class');
    timers.forEach(t => {
        t.style.color = colorValue;
    });

    settings.timerColor = colorValue;
    saveSettings();
}
function createTimerInstance(label = "Timer", durationSeconds = 0, customStyles = {}) {
    const id = "tmr_" + Date.now();
    const type = parseInt(durationSeconds) > 0 ? "countdown" : "stopwatch";
    
    activeTimers[id] = {
        id: id,
        label: label,
        duration: parseInt(durationSeconds) || 0,
        elapsed: 0,
        running: true,
        splits: [],
        type: type,
        settings: {
            labelFontSize: customStyles.labelFontSize || "14px",
            labelFontWeight: customStyles.labelFontWeight || "600",
            timerFontSize: customStyles.timerFontSize || "24px",
            timerFontColor: customStyles.timerFontColor || "#ffffff",
            showMode: customStyles.showMode || "always" // always, counting, never
        }
    };
    
    saveActiveTimersToStorage();
    startTimerInstance(id);
    return id;
}
function startTimerInstance(id) {
    if (!activeTimers[id]) return;
    activeTimers[id].running = true;
    saveActiveTimersToStorage();
    
    if (!timerIntervalId) {
        timerIntervalId = setInterval(processTimersTick, 1000);
    }
    renderActiveTimersUI();
}
function pauseTimerInstance(id) {
    if (!activeTimers[id]) return;
    activeTimers[id].running = false;
    saveActiveTimersToStorage();
    renderActiveTimersUI();
}
function resetTimerInstance(id) {
    if (!activeTimers[id]) return;
    activeTimers[id].elapsed = 0;
    activeTimers[id].splits = [];
    saveActiveTimersToStorage();
    renderActiveTimersUI();
}
function stopTimerInstance(id) {
    if (!activeTimers[id]) return;
    delete activeTimers[id];
    saveActiveTimersToStorage();
    
    if (Object.keys(activeTimers).length === 0) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
    renderActiveTimersUI();
}
function splitTimerInstance(id) {
    const t = activeTimers[id];
    if (!t || !t.running) return;
    const currentDisplay = formatTimeDigits(t.type === "countdown" ? (t.duration - t.elapsed) : t.elapsed);
    t.splits.push(currentDisplay);
    saveActiveTimersToStorage();
    renderActiveTimersUI();
}
function processTimersTick() {
    let hasRunningTimers = false;
    let stateChanged = false;
    
    Object.keys(activeTimers).forEach(id => {
        const t = activeTimers[id];
        if (!t.running) return;
        
        hasRunningTimers = true;
        t.elapsed++;
        stateChanged = true;
        
        if (t.type === "countdown" && t.elapsed >= t.duration) {
            t.elapsed = t.duration;
            t.running = false;
            if (typeof p8Confirm === "function") {
                p8Confirm(`⏰ Countdown Finished: [${t.label}]`, true);
            } else if (typeof botSay === "function") {
                botSay(`⏰ Countdown Finished: [${t.label}]!`);
            }
        }
    });
    
    if (stateChanged) saveActiveTimersToStorage();
    
    if (!hasRunningTimers && timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
    
    renderActiveTimersUI();
}
function formatTimeDigits(totalSeconds) {
    if (totalSeconds < 0) totalSeconds = 0;
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}
function renderActiveTimersUI() {
    const listContainer = document.getElementById("active-timers-list");
    const overlayDigits = document.getElementById("timer-display-digits");
    const overlayTitle = document.getElementById("timer-widget-title");
    const overlaySplits = document.getElementById("timer-splits-container");
    const timerWidget = document.getElementById("timer-widget");
    
    if (listContainer) listContainer.innerHTML = "";
    if (overlaySplits) overlaySplits.innerHTML = "";
    
    const keys = Object.keys(activeTimers);
    if (keys.length === 0) {
        if (overlayDigits) overlayDigits.innerText = "00:00:00";
        if (overlayTitle) overlayTitle.innerText = "⏱️ No Active Timers";
        if (timerWidget) timerWidget.style.display = "none";
        return;
    }
    
    const primaryTimer = activeTimers[keys[keys.length - 1]];
    if (primaryTimer) {
        const s = primaryTimer.settings || {};
        const remaining = primaryTimer.type === "countdown" ? (primaryTimer.duration - primaryTimer.elapsed) : primaryTimer.elapsed;
        
        if (overlayDigits) {
            overlayDigits.innerText = formatTimeDigits(remaining);
            overlayDigits.style.fontSize = s.timerFontSize || "24px";
            overlayDigits.style.color = s.timerFontColor || "#ffffff";
        }
        
        if (overlayTitle) {
            overlayTitle.innerText = `${primaryTimer.type === 'stopwatch' ? '⏱️' : '⏳'} ${primaryTimer.label}`;
            overlayTitle.style.fontSize = s.labelFontSize || "14px";
            overlayTitle.style.fontWeight = s.labelFontWeight || "600";
        }
        
        const editModeActive = (typeof isEditMode !== "undefined" && isEditMode);
        const shouldShow = editModeActive ? true : (
            s.showMode === "always" ? true :
            s.showMode === "counting" ? primaryTimer.running :
            false 
        );
        if (timerWidget) timerWidget.style.display = shouldShow ? "block" : "none";
        
        primaryTimer.splits.forEach((splitVal, index) => {
            const div = document.createElement("div");
            div.style.borderBottom = "1px solid rgba(255, 255, 255, 0.05)";
            div.style.padding = "2px 0";
            div.innerText = `Split 🟢 ${index + 1}: ${splitVal}`;
            if (overlaySplits) overlaySplits.appendChild(div);
        });
    }
    
    keys.forEach(id => {
        const t = activeTimers[id];
        const rem = t.type === "countdown" ? (t.duration - t.elapsed) : t.elapsed;
        
        const row = document.createElement("div");
        row.className = "timer-control-row";
        row.style.cssText = "display:flex; align-items:center; justify-content:space-between; margin-bottom:5px; background:rgba(0,0,0,0.2); padding:4px; border-radius:4px;";
        
        row.innerHTML = `
            <span style="max-width:60%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; color:${t.running ? 'var(--accent)' : '#a1a1aa'}">
                ${t.type === 'stopwatch' ? '⏱️' : '⏳'} ${t.label} (${formatTimeDigits(rem)})
            </span>
            <div class="timer-btn-group" style="display:flex; gap:2px;">
                <button type="button" class="t-start-btn" style="background:none; border:none; cursor:pointer;">▶️</button>
                <button type="button" class="t-pause-btn" style="background:none; border:none; cursor:pointer;">⏸️</button>
                <button type="button" class="t-reset-btn" style="background:none; border:none; cursor:pointer;">🔄</button>
                <button type="button" class="t-split-btn" style="background:none; border:none; cursor:pointer; ${t.type === 'countdown' ? 'display:none;' : ''}">✂️</button>
                <button type="button" class="t-delete-btn" style="background:none; border:none; cursor:pointer;">❌</button>
            </div>
        `;

        // 🟢 DIRECT INLINE EVENT BINDING: Completely bypasses event delegation
        row.querySelector(".t-start-btn").onclick = (e) => {
            e.stopPropagation();
            console.log(`⏱️ Start clicked for timer: ${t.id}`);
            startTimerInstance(t.id);
        };

        row.querySelector(".t-pause-btn").onclick = (e) => {
            e.stopPropagation();
            console.log(`⏱️ Pause clicked for timer: ${t.id}`);
            pauseTimerInstance(t.id);
        };

        row.querySelector(".t-reset-btn").onclick = (e) => {
            e.stopPropagation();
            console.log(`⏱️ Reset clicked for timer: ${t.id}`);
            resetTimerInstance(t.id);
        };

        row.querySelector(".t-split-btn").onclick = (e) => {
            e.stopPropagation();
            console.log(`⏱️ Split clicked for timer: ${t.id}`);
            splitTimerInstance(t.id);
        };

        row.querySelector(".t-delete-btn").onclick = (e) => {
            e.stopPropagation();
            console.log(`❌ Delete/Remove clicked for timer: ${t.id}`);
            stopTimerInstance(t.id);
        };

        if (listContainer) listContainer.appendChild(row);
    });
}
document.addEventListener("DOMContentLoaded", () => {
    initTimerEngine();
});
function getLatestInstanceIdByType(type) {
    const keys = Object.keys(activeTimers);
    for (let i = keys.length - 1; i >= 0; i--) {
        if (activeTimers[keys[i]].type === type) {
            return keys[i];
        }
    }
    return null;
}
// ================END OF TIMER SHIT========================================
// ========================================================================================================================================================

// ==========================================
// --- REWARDS MANAGER CONTROL ENGINE ---
// ==========================================
// Ensure this function exists globally in overlayapp.js

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
function bindEvents() {
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
        
        if (typeof isEditMode === 'undefined' || !isEditMode || e.button !== 0 ||
            e.target.closest('#style-editor, #rewards-manager, #bit-manager, #settings-window, #widgets-manager, .timer-btn-group, .setup-container, .p8-modal')) {
            return;
        }
        
        dragTarget = e.target.closest('.p8-widget');
        if (dragTarget) {
            const r = dragTarget.getBoundingClientRect();
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
init();

// ==========================================
// 🛠️ TEMPORARY ONE-TIME COLD RESET SCRIPT
// ==========================================
/**
 * Universally deletes a setting key from both the monolithic settings wrapper 
 * and independent localStorage entries, then syncs the active UI state.
 * @param {string} key - The precise settings property name or independent localStorage key to remove.
 * @param {boolean} [shouldReload=false] - Optional flag to force a hard reload after wiping.
 */
function deleteSetting(key, shouldReload = false) {
    let wasDeleted = false;

    // 1. Target the monolithic grouped settings object if it exists
    if (localStorage.getItem('settings')) {
        try {
            let s = JSON.parse(localStorage.getItem('settings'));
            
            // Check if the property actively exists in the schema object
            if (s && s.hasOwnProperty(key)) {
                delete s[key];
                localStorage.setItem('settings', JSON.stringify(s));
                
                // Mirror the deletion to your active top-level runtime settings variable
                if (typeof settings !== 'undefined' && settings.hasOwnProperty(key)) {
                    delete settings[key];
                }
                wasDeleted = true;
                console.log(`[Storage] Cleaned property "${key}" out of the monolithic settings wrapper.`);
            }
        } catch (e) {
            console.error(`[Storage Error] Failed to parse settings object while deleting key "${key}":`, e);
        }
    }

    // 2. Fall back to checking independent localStorage cache keys (like legacy elements or positions)
    if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        wasDeleted = true;
        console.log(`[Storage] Removed independent key entry "${key}" from localStorage directly.`);
    }

    // 3. Clear any active matching top-level global runtime variables if they exist
    if (window.hasOwnProperty(key)) {
        window[key] = undefined;
        wasDeleted = true;
    }

    // 4. Determine post-execution routing flow
    if (wasDeleted) {
        if (shouldReload) {
            console.log(`[Storage] Reload requested. Refreshing page wrapper context...`);
            location.reload();
            return;
        }

        // Live update the application UI context states without requiring a reload
        if (typeof loadPositions === "function") loadPositions();
        if (typeof syncAllToggleUI === "function") syncAllToggleUI();
        
        console.log(`[Storage] Hot-sync complete. Element attributes updated across active layout components.`);
    } else {
        console.warn(`[Storage Wrapper] Specified key "${key}" was not located in active storage contexts.`);
    }
}

//deleteSetting('chatHeight'); 
// Instantly deletes it from storage and snaps the feed back to its default 175px CSS floor safely!

//deleteSetting('p8_pos_chat-widget', true); 
// Erases the manual drag tracking position memory and reloads the window to pop it back to 400px/20px baseline rules.
async function systemReset() {
    if(await p8Confirm("This will logout and reset your local settings. Proceed?")) {
        localStorage.clear();
        window.location.href = FULL_REDIRECT;
    }
}
