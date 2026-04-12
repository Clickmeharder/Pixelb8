// ====== Chatsnooper.js (renderer) ======
// Chat filter state
const masterChats = ["System", "Trade", "Local", "Globals", "Rookie", "Team"];
// Channel colors (RGB for easier tinting)
const channelColors = {
    "System": "255,165,0",   // orange
    "Rookie": "29,189,29",   // green
    "Society": "128,0,128",  // purple
    "Trade": "128,128,128",  // grey
    "#CalyTrade": "128,128,128",
    "Globals": "197,84,39",  // reddish
    "Local": "255,255,255"   // white
};

const chatState = {};
masterChats.forEach(c => chatState[c] = true);
// Watchlist for highlights

// Paths for saved data
let watcherFilePath = null;
let lastLootTimestamp = null;
// This uses the global path you defined in engineroom.js
// Note: This requires window.electronAPI.userDataPath to be exposed in preload.js
const DATA_DIR = window.electronAPI.userDataPath + '/data/chatsnooper/'; 

const SETTINGS_FILE = DATA_DIR + 'settings.json';
const LOADOUTS_FILE = DATA_DIR + 'loadouts.json';
const USERNAMES_FILE = DATA_DIR + 'usernames.json';
const currentfilepath = document.getElementById('currentfilepath');

// ===== Usernames ====================================================
let savedUsernames = [];
let lastUsedUsername = '';
const usernameInput = document.getElementById('entropiaUsername');
const usernameDatalist = document.getElementById('usernameOptions');
const saveUsernameBtn = document.getElementById('saveUsername');
const removeUsernameBtn = document.getElementById('removeUsername');
const watchlist = ["Hall of Fame", "Rare Item", "ATH", lastUsedUsername];
if (DEBUG) console.log('last used username:'+ lastUsedUsername);
// _____________________________________________________________________
// ----- Team tracking -----// ===== TEAM UI UPDATE SCHEDULER ==========
let teamUIDebounceTimer = null;
let pendingTeamUpdate = false;
let teamMembers = {}; // Example: { "Jaedraze": { totalLoot: 5.21, deaths: 0, lootHistory: { "Shrapnel": { quantity: 100, totalValue: 0.01 } } } }
const nameAliases = {}; // shortName -> fullName
let teamMessagesLog = [];
let totalTeamLoot = {};
let currentHunt = [];


// ===============================
// 🔧 DOM CACHES
// ===============================
const output = document.getElementById('output');
let totalsPanels = document.querySelectorAll('.totalsPanel');
let huntSummaryPanels = document.querySelectorAll('.HuntSummary');
let combatSummaryPanels = document.querySelectorAll('.combatSummary');
let skillGainsPanels = document.querySelectorAll('.SkillGains');
const healAmountEls = document.querySelectorAll('.totalHealAmount');
const healTimesEls = document.querySelectorAll('.totalHealTimes');
const teamLootPanel = document.getElementById('teamLootPanel');
const teamMessagesLogDiv = document.getElementById('teamMessagesLog');
// ===== Log Selection / Watching =====
const chooseLogBtn = document.getElementById('chooseLog');
const logStatus = document.getElementById('logStatus');
//======================================================================

// ===== Precompile regexes for efficiency =====
const timestampChannelMessageRegex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[([^\]]+)\]\s*(.*)$/;
const lootDetailsRegex = /You received\s+(.+?)\s+x\s+\((\d+)\)\s+Value:\s*([\d.]+)\s*PED/i;
const experienceRegex = /You have gained\s+([\d.]+)\s+experience in your (.+) skill/i;

// ===== Common Action Regexes =====

//crafting
const qrIncreaseRegex = /Your blueprint Quality Rating has improved/i;

//the rest
const inflictedRegex = /inflicted\s+([\d.]+)/i;
const tookRegex = /took\s+([\d.]+)/i;
const healedRegex = /You healed(?:\s+\w+)?\s+([\d.]+)/i;

const criticalHitRegex = /critical hit/i;
const evadeRegex = /The target Evaded your attack/i;
const dodgeRegex = /The target Dodged your attack/i;
const missRegex = /You missed/i;
const killedByRegex = /You were killed by/i;
// Matches: Your enhancer [Name] on your [Weapon] broke. You have [N] enhancers remaining... You received [Value] PED Shrapnel.
const enhancerBreakRegex = /Your enhancer (.+?) on your (.+?) broke\. You have (\d+) enhancers remaining.*You received ([\d.]+) PED Shrapnel/i;
// ======= Cached Regular Expressions =======
const teamTimestampRegex = /^(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}) \[Team\] \[\]\s*(.*)$/;
const teamJoinedRegex = /joined the team/i;
const teamLeftRegex = /left the team/i;
const teamKilledRegex = /was killed/i;
const teamLootRegex = /^(.+?) received (?:a |an )?(.+?)(?: \((\d+)\))?$/;

const pedValueRegex = /Value:/;
const pedAmountRegex = /([\d.]+)\s*PED/i;
const lootTimestampRegex = /^(\d{2}:\d{2}:\d{2})/;
const universalAmmoRegex = /You received.*Universal Ammo/;
const sweatRegex = /You received.*Vibrant Sweat/;
const FRUIT_NAMES = ['Papplon', 'Bombardo', 'Haimoros', 'Caroot'];
const STONE_NAMES = ['Brukite', 'Sopur', 'Nissit', 'Kaldon', 'Truton'];
//new regex--------------------------------------------------------------------
//-------------------------------------------------------------------------------
// Add these to your existing list:
//commented out regex below only works if theres an amount (2 or more picked up)
// const pickupRegex = /Picked up (.+?) \((\d+)\)/;
// The (?: \((\d+)\))? part means "Look for a space, then parentheses with a number, but only if they exist"
const pickupRegex = /Picked up (.+?)(?: \((\d+)\))?$/;
const globalValueRegex = /with a value of ([\d,.]+) PED/i;
const globalHofRegex = /Hall of Fame|Rare Item|ATH/i;
const dungRegex = /Common Dung/i;
const oilRegex = /Crude Oil/i;
const kegRegex = /Motorhead Keg/i;
const elysianRegex = /Broken Elysian Technology/i;
const tokenRegex = /Reward Token \(Lime Green\)/i;
const nawaRegex = /Nawa Fragments/i;

// ===== Calypso Event Regexes =====
const laharEventRegex = /Robot forces have launched an attack on Fort Lahar/i;
// ===== Mission Regex =====

const missionReceivedRegex = /New Mission received \((.+?)\)/i;

const missionCompletedRegex = /Mission completed \((.+?)\)/i;
const missionUpdatedRegex = /Mission updated \((.+?)\)/i;
// ===== Mining Regex =====
// Example: You received Iron Stone x (2) Value: 0.2600 PED
const extractRegex = /You received .* x \((\d+)\) Value: ([\d.]+) PED/;
// Example: You have claimed a resource! (Iron Stone)


const claimRegex = /You have claimed a resource! \((.*)\)/;
const depletedRegex = /This resource is depleted/;

// ==== waypoint regex ====
// This strictly matches: [Planet, Long, Lat, Alt, Name]
const lastKnownlocationRegex = /\[([^,]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([^\]]+)\]/;

//-------------------------------------------------------------------------------
//-------------------------------------------------------------------------------
// Ensure /data/chatsnooper/ exists
async function ensureDataDir() {
  // write a dummy .keep file to create folder if missing
  //await window.electronAPI.writeFile(DATA_DIR + '.keep', '');
  return true;
}
// ===== Ensure default files exist =====
async function ensureDataFiles() {
  try {
    // Ensure data folder exists
    await ensureDataDir();
    // Define defaults
    const defaults = {
      [SETTINGS_FILE]: { logFilePath: '' },
      [LOADOUTS_FILE]: { loadouts: [] },
      [USERNAMES_FILE]: { usernames: [], lastUsed: '' },
    };
    // Loop through files and verify
    for (const [file, defaultData] of Object.entries(defaults)) {
      const loaded = await loadJSON(file);

      // If load failed or returned invalid, recreate file
      if (!loaded || typeof loaded !== 'object') {
        console.warn(`⚠️ Recreating missing or invalid file: ${file}`);
        await saveJSON(file, defaultData);
      } else {
      if (DEBUG) console.log(`✅ Verified file: ${file}`);
      }
    }
  } catch (err) {
    console.error('❌ ensureDataFiles() failed:', err);
  }
}
// Generic load/save with error handling
async function saveJSON(file, data) {
  try {
    // 🟢 ADD THIS LINE TO DEBUG:
  if (DEBUG) console.log("📂 Attempting to save to:", file); 
    
    await window.electronAPI.writeFile(file, JSON.stringify(data, null, 2));
  if (DEBUG) console.log(`✅ Saved JSON: ${file}`);
  } catch (err) {
    console.error(`❌ Failed to save ${file}:`, err);
  }
}
async function loadJSON(file) {
  try {
    const content = await window.electronAPI.readFile(file);
    if (!content) {
      console.warn(`⚠️ File missing or empty: ${file}`);
      return null;
    }
    try {
      return JSON.parse(content);
    } catch (parseErr) {
      console.error(`❌ Failed to parse JSON in ${file}:`, parseErr);
      return null;
    }
  } catch (err) {
    console.error(`❌ Failed to read file ${file}:`, err);
    return null;
  }
}

/*------------------------------------------------------------------*/
/*fap shit*/
window.loadoutStats = window.loadoutStats || { totalCostPerUsePEC: 0 };
window.faps = window.faps || { 
    // FAP objects now explicitly store the original 'baseMinHeal' and 'baseMaxHeal'
    // for use in chat log matching, and calculate 'effectiveInstantMinHeal' for display.
    mainFap: { name: 'None', cost: 0, usesPerMin: 0, baseMinHeal: 0, baseMaxHeal: 0, isHoT: false, hotPct: 0, effectiveInstantMinHeal: 0 },
    secondaryFap: { name: 'None', cost: 0, usesPerMin: 0, baseMinHeal: 0, baseMaxHeal: 0, isHoT: false, hotPct: 0, effectiveInstantMinHeal: 0 }
}; 
// FAP Usage Tracker to enforce cooldowns
let fapUsageTracker = {
    mainFap: { lastUsed: 0, cooldownMS: 0 },
    secondaryFap: { lastUsed: 0, cooldownMS: 0 }
};
window.fapPersistence = window.fapPersistence || {
    lastMainFap: 'None',
    lastSecondaryFap: 'None',
    lastMainHotPct: 0,
    lastSecondaryHotPct: 0
};

/*---STAT CONSTS---*/
//crafting stats
const craftingStats = {
    clicks: 0,                // Total attempts (Success + Near Success + Fail)
    successes: 0,             // "Product" received
    nearSuccesses: 0,         // "Residue/Materials" received
    fails: 0,                 // "Nothing" received (Heartbeat trigger)
    totalLoots: 0,            // Count of individual items received (Shrapnel, etc.)
    totalCost: 0,             // Total PED spent on clicks
    loot: 0,                  // Total PED value of items returned
    qrIncrease: 0,            // Count of QR progress lines
    returnPct: 0,             // (loot / totalCost) * 100
    totalCostPerClickPEC: 0   // The PEC value of a single click for the current BP
};

// --- Mining Stats ---
const miningStats = {
    drops: 0,
    totalCost: 0,
    totalReturns: 0,
    returnPct: 0,
    avgReturn: 0,
    claimsFound: 0,
    claimsExtracted: 0,
    claims: [] // Array of resource names found this session
};
window.miningStats = miningStats;

//hunt stats
const stats = {
  damageDealt: 0,
  damageTaken: 0,
  heals: 0,
  totalLoots: 0,
  loot: 0,
  universalAmmo: 0,
  enhancersBroken: 0,
  deathCount: 0,
  healTimes: 0,

};
const pickupStats = {
// Add all new pickup item counters:
	sweatGains: 0,
    fruits: 0,
    stones: 0,
    commonDung: 0,
    crudeOil: 0,
    motorheadKegs: 0,
    brokenElysianTechnology: 0,
    rewardTokensLimeGreen: 0,
    nawaFragments: 0,
};
// ===== Track structured stats =====
const combatStats = { totalShots: 0, crits: 0, misses: 0, totalDamage: 0,  enemyEvadeCount: 0, enemyDodgeCount: 0 };
const huntStats = { totalLoots: 0, totalReturns: 0, totalCost: 0, globals: 0, hofs: 0 };
const skillStats = { total: 0 }; // plus dynamic skill names
let lootHistory = {};

// ======== Helper Functions ========
let logBuffer = [];
let logFlushTimer = null;

function flushLogs() {
  if (logBuffer.length === 0) return;

  const joined = logBuffer.join('');
  output.insertAdjacentHTML('beforeend', joined);
  //terminalOutput.insertAdjacentHTML('beforeend', joined);

  output.scrollTop = output.scrollHeight;
  terminalOutput.scrollTop = terminalOutput.scrollHeight;

  logBuffer = [];
}
setInterval(flushLogs, 300); // every 300ms

// ===== Throttle overlay/panel updates =====
let pendingUpdate = false;
function scheduleTeamUIUpdate() {
    if (pendingTeamUpdate) return; // already scheduled, skip
    pendingTeamUpdate = true;
    // Wait a bit to catch bursty updates (100–150ms is good for logs)
    teamUIDebounceTimer = setTimeout(() => {
        updateTeamLootUI();
        updateTeamMessagesLog();
        pendingTeamUpdate = false;
    }, 120);
}
let uiUpdateTimer = null; // Variable to hold the timer

function scheduleUIUpdate() {
    // 1. Clear the existing timer if one is already running.
    // This "resets" the clock every time a new loot line arrives.
    if (uiUpdateTimer) {
        clearTimeout(uiUpdateTimer);
    }
    uiUpdateTimer = setTimeout(() => {
        updateStats();
        updateHuntSummary();
        updateCombatSummary();
        updateSkillGains();  
        sendOverlayAll(); 
        uiUpdateTimer = null; // Reset the timer variable
    }, 100); // 100ms is the "sweet spot" for snappy but batched updates
}

// ===== Chat Filter UI =====
const chatListDiv = document.getElementById('chatList');
const newChatInput = document.getElementById('newChatName');
const addChatBtn = document.getElementById('addChat');

function renderChatList() {
  chatListDiv.innerHTML = '';
  masterChats.forEach(chat => {
    const id = `chat_${chat.replace(/\s/g,'_')}`;
    const label = document.createElement('label');
    label.style.marginRight = '10px';
    label.innerHTML = `<input type="checkbox" id="${id}" ${chatState[chat] ? 'checked' : ''}> ${chat}`;
    chatListDiv.appendChild(label);

    const checkbox = label.querySelector('input');
    checkbox.addEventListener('change', () => {
      chatState[chat] = checkbox.checked;
    });
  });
}

addChatBtn.addEventListener('click', () => {
  const newChat = newChatInput.value.trim();
  if (newChat && !masterChats.includes(newChat)) {
    masterChats.push(newChat);
    chatState[newChat] = true;
    renderChatList();
    newChatInput.value = '';
  }
});
renderChatList();

chooseLogBtn.addEventListener('click', async () => {
  const result = await window.electronAPI.chooseLog();
  if (!result || !result.filePath) return;

  watcherFilePath = result.filePath;
  currentfilepath.innerText = `Watching: ${watcherFilePath}`;
  logStatus.innerText = 'Initializing...';

  await window.electronAPI.startWatch(watcherFilePath);

  // Save chosen log path immediately
  await saveJSON(SETTINGS_FILE, { logFilePath: watcherFilePath });

  // Listen for incoming log chunks
  window.electronAPI.onLogUpdate((chunk) => {
    output.innerText += chunk;
    output.scrollTop = output.scrollHeight;
  });

  logStatus.innerText = 'Watching log...';
});

// Receive updates from main process
window.electronAPI.onLogUpdate((chunk) => {
  const lines = chunk.split(/\r?\n/).filter(l => l.trim() !== '');
  lines.forEach(line => handleLogLine(line));
});

// ====================================
// Helper: send updates to overlay
function sendToOverlay(channel, data) {
  if (window.electronAPI?.sendToOverlay) {
    window.electronAPI.sendToOverlay(channel, data);
  } else {
    console.warn("Overlay API not available", channel, data);
  }
}

function getEffectiveMinHeal(fap) {
    // If FAP is not marked as HoT, the full minHeal is effective instantly
    if (!fap.isHoT || fap.name === 'None') {
        return fap.minHeal;
    }
  if (DEBUG) console.log(`[FAP ADJUST] HoT FAP detected (${fap.name}). Using stored minHeal (${fap.minHeal.toFixed(1)}) as Effective Instant Min Heal.`);
    // Ensure the effective min heal isn't negative
    return Math.max(0, fap.minHeal);
};

//line parsing helpers
// ===== last location Line Parser =====
function parselastKnownLocationLine(message, timestamp) {
    const cleanRegex = /\[([A-Za-z\s]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([^\]]+)\]/;
    const match = message.match(cleanRegex);
    
    if (!match) return false;

    const planet = match[1].trim();
    const long = parseFloat(match[2]);
    const lat = parseFloat(match[3]);
    const alt = Math.floor(parseFloat(match[4]));
    const displayName = "Last Known Position"; 

    if (typeof setLastKnownPosition === 'function') {
        // Pass the timestamp from the log line here
        setLastKnownPosition(planet, long, lat, alt, displayName, timestamp);
    }

    return true;
}

// Matches coordinates with an OPTIONAL $name at the end
const gameMapWaypointRegex = /(Added|Removed|Reached) waypoint (to|from|was removed from) map: \[position:[^$]+\$[^$]+\$(\d+),(\d+),(\d+)(?:\$([^\]]+))?\]/;
function parseGameMapWaypoint(message, timestamp) {
    const match = message.match(gameMapWaypointRegex);
    if (!match) return false;

    // match[0] = Full string
    // match[1] = "Added", "Removed", or "Reached"
    // match[2] = "to", "from", or "was removed from" (The second group in your regex)
    // match[3] = Longitude
    // match[4] = Latitude
    // match[5] = Altitude
    // match[6] = Optional Name

    const action = match[1];
    const isRemoval = action === "Removed" || action === "Reached";
    
    // ADJUSTED INDEXES HERE:
    const long = parseInt(match[3]); 
    const lat = parseInt(match[4]);
    const alt = parseInt(match[5]);
    
    // match[6] is the optional name
    let customName = match[6] ? match[6].trim() : "Waypoint 📍";

    console.log(`[Matched Gamemap Wp] Action: ${action}, Name: ${customName}, Coords: ${long}, ${lat}`);

    const currentPlanet = window.lastKnownPos?.planet || "Planet Calypso";
    
    if (!isRemoval) {
        addUserWaypoint('sessionWaypoints', {
            planet: currentPlanet,
            long: long,
            lat: lat,
            alt: alt,
            name: customName,
            timestamp: timestamp
        });
        console.log(`[MAP] Added: ${customName}`);
    } else {
        // REMOVAL LOGIC
        if (window.sessionWaypoints) {
            const initialCount = window.sessionWaypoints.length;
            window.sessionWaypoints = window.sessionWaypoints.filter(wp => 
                !(wp.long === long && wp.lat === lat)
            );
            
            if (window.sessionWaypoints.length !== initialCount) {
                localStorage.setItem('entropia_session_waypoints', JSON.stringify(window.sessionWaypoints));
                console.log(`[MAP] Removed: ${customName} at ${long}, ${lat}`);
                if (typeof queueRender === 'function') queueRender();
            }
        }
    }
    return true;
}
// ===== Combat Line Parser =====
function parseCombatLine(line, costThisHit) {
    if (
        !(
            inflictedRegex.test(line) ||
            evadeRegex.test(line) ||
            dodgeRegex.test(line) ||
            missRegex.test(line) ||
            tookRegex.test(line)
        )
    ) return false;

    if (inflictedRegex.test(line)) {
        const dmgMatch = line.match(inflictedRegex);
        const dmg = dmgMatch ? parseFloat(dmgMatch[1]) : 0;
        stats.damageDealt += dmg;
        combatStats.totalShots += 1;
        huntStats.totalCost += costThisHit;

        if (criticalHitRegex.test(line)) {
            combatStats.crits = (combatStats.crits || 0) + 1;
        }
    } else if (evadeRegex.test(line)) {
        combatStats.totalShots++;
        combatStats.enemyEvadeCount++;
        huntStats.totalCost += costThisHit;
    } else if (dodgeRegex.test(line)) {
        combatStats.totalShots++;
        combatStats.enemyDodgeCount++;
        huntStats.totalCost += costThisHit;
    } else if (missRegex.test(line)) {
        combatStats.totalShots++;
        combatStats.misses++;
        huntStats.totalCost += costThisHit;
    } else if (tookRegex.test(line)) {
        const dmgMatch = line.match(tookRegex);
        const dmg = dmgMatch ? parseFloat(dmgMatch[1]) : 0;
        stats.damageTaken += dmg;
    }

    return true;
}
// ===== Heal Line Parser =====
function parseHealLine(line) {
    if (!healedRegex.test(line)) return false;

    const match = line.match(healedRegex);
    if (!match) return false;

    const healAmount = parseFloat(match[1]);
    stats.heals += healAmount;
    stats.healTimes = (stats.healTimes || 0) + 1;

    const fapCandidates = [
        { type: 'mainFap', ...window.faps.mainFap },
        { type: 'secondaryFap', ...window.faps.secondaryFap }
    ];

    const currentTime = Date.now();
    const potentialMatches = [];

    for (const fap of fapCandidates) {
        if (fap.name === 'None') continue;
        const minHealEffective = window.getEffectiveMinHeal(fap);
        const maxHealEffective = fap.maxHeal;
        if (healAmount >= minHealEffective && healAmount <= maxHealEffective) {
            const tracker = fapUsageTracker[fap.type];
            const cooldownMS = (60 / (fap.usesPerMin || 1)) * 1000;
            potentialMatches.push({
                fap,
                type: fap.type,
                cooldownExpired: (currentTime - tracker.lastUsed) >= cooldownMS,
                cooldownMS,
                tracker
            });
        }
    }

    let bestAction = { type: 'none', match: null };
    if (potentialMatches.length) {
        const newUseMatches = potentialMatches.filter(m => m.cooldownExpired);
        if (newUseMatches.length) {
            newUseMatches.sort((a, b) => (b.cooldownMS || 0) - (a.cooldownMS || 0));
            bestAction.type = 'newUse';
            bestAction.match = newUseMatches[0];
        } else {
            potentialMatches.sort((a, b) => (b.fap.cost || 0) - (a.fap.cost || 0));
            bestAction.type = 'cooldownActive';
            bestAction.match = potentialMatches[0];
        }
    }

    if (bestAction.type === 'newUse') {
        const match = bestAction.match;
        const tracker = match.tracker;
        const bestMatch = match.fap;
        huntStats.totalCost += bestMatch.cost;
        tracker.lastUsed = currentTime;
        tracker.cooldownMS = match.cooldownMS;
      if (DEBUG) console.log(`✔️ FAP Use: ${bestMatch.name}. Cost added: ${bestMatch.cost.toFixed(5)} PED. New cooldown: ${(match.cooldownMS / 1000).toFixed(1)}s.`);
    } else if (bestAction.type === 'cooldownActive') {
      if (DEBUG) console.log(`FAP Heal: ${bestAction.match.fap.name}. Cooldown active. Cost NOT applied.`);
    } else {
      if (DEBUG) console.log(`❌ No equipped FAP matched the healed amount.`);
    }

    return true;
}
function parseDeathExpLine(line) {
    if (line.includes("You were killed by")) {
        stats.deathCount += 1;
        return true;
    }
    const match = line.match(experienceRegex);
    if (match) {
        const [_, xp, skillName] = match;
        skillStats[skillName] = (skillStats[skillName] || 0) + parseFloat(xp);
        skillStats.total += parseFloat(xp);
        return true;
    }
    return false;
}
// ======= Parse Loot Line =======
// ====== LOOT & HUNTING GLOBALS ======

let lastLootIncrementTime = 0; 
const LOOT_COOLDOWN_MS = 20;
const CRAFT_COOLDOWN_MS = 200; 
let recentlyDepletedClaims = [];
let currentCraftBurstHasProduct = false;
const CRAFTING_NON_PRODUCT_ITEMS = [
    "animal oil residue", "metal residue", "energy matter residue", "enmatter residue", 
    "robot component residue", "shrapnel", "nanocube", "blueprint", "tailoring remnants"
];

 function parseLootLine(line) {
    const pedValueRegex = /Value[:\s]+([\d.]+)\s+PED/i;
    if (!pedValueRegex.test(line)) return false;

    // 🟢 GUARD: Only record loot if tracking is active and not paused
    const isTracking = window.getIsTrackingHunts ? window.getIsTrackingHunts() : false;
    if (!isTracking || window.isHuntPaused) return true; 
    
    const currentTime = Date.now();
    const lootDetails = extractLootDetails(line);
    if (!lootDetails) return false;

    const { name, value, quantity } = lootDetails;
    const itemNameLower = name.toLowerCase();

    // Record in global history (Breakdown panel)
    if (!lootHistory[name]) lootHistory[name] = { quantity: 0, totalValue: 0 };
    lootHistory[name].quantity += (quantity || 1);
    lootHistory[name].totalValue += value;

    // --- 🟢 SMART TARGETED IDENTIFICATION (Mining) ---
    // 1. Check index in active claims
    const claimIndex = miningStats.claims.findIndex(c => 
        itemNameLower.includes(c.toLowerCase()) || c.toLowerCase().includes(itemNameLower)
    );

    // 2. Check index in recently depleted (the chatsnooper-local buffer)
    const recentIndex = recentlyDepletedClaims.findIndex(r => 
        itemNameLower.includes(r.toLowerCase()) || r.toLowerCase().includes(itemNameLower)
    );

    const isMiningItem = (claimIndex !== -1 || recentIndex !== -1);

    if (isMiningItem) {
        if (DEBUG) console.log(`⛏️ Intercepted Mining Loot: ${name} (${value} PED)`);

        // 🟢 NEW: Apply Extractor Decay to Total Cost (Only on successful extraction)
        const extractorDecay = window.miningStats.activeExtractorDecay || 0;
        miningStats.totalCost += extractorDecay;

        // If it was still in active claims, move it to recent and remove from active
        // This ensures double-claims are handled specifically by name
        if (claimIndex !== -1) {
            const resourceName = miningStats.claims.splice(claimIndex, 1)[0];
            recentlyDepletedClaims.push(resourceName);
            
            // Clean up the local buffer after 15 seconds
            setTimeout(() => {
                recentlyDepletedClaims = recentlyDepletedClaims.filter(r => r !== resourceName);
            }, 15000);
        }
        
        miningStats.totalReturns += value;

        // ROI/Average Math
        if (miningStats.totalCost > 0) {
            miningStats.returnPct = (miningStats.totalReturns / miningStats.totalCost) * 100;
        }
        if (miningStats.drops > 0) {
            miningStats.avgReturn = miningStats.totalReturns / miningStats.drops;
        }

        // Update UI Displays
        const guiReturnEl = document.getElementById('display-totalReturns');
        const guiCostEl = document.getElementById('display-totalMiningCost');
        
        if (guiReturnEl) guiReturnEl.textContent = `${miningStats.totalReturns.toFixed(4)} PED`;
        if (guiCostEl) guiCostEl.textContent = `${miningStats.totalCost.toFixed(3)} PED`;

        window.sendOverlayAll();
        return true; // Stop here!
    }

    // --- Mode 1: Crafting ---
    if (window.trackingMode === 'crafting') {
        const isSameClickBurst = (currentTime - lastLootIncrementTime < CRAFT_COOLDOWN_MS);
        const isActualProduct = !CRAFTING_NON_PRODUCT_ITEMS.some(nonProd => itemNameLower.includes(nonProd));

        if (!isSameClickBurst) {
            currentCraftBurstHasProduct = isActualProduct; 
            if (currentCraftBurstHasProduct) {
                craftingStats.successes++;
                recordCraftingAttempt("Loot Success", false); 
            } else {
                craftingStats.nearSuccesses++;
                recordCraftingAttempt("Near Success", false);
            }
            lastLootIncrementTime = currentTime;
        } else {
            if (isActualProduct && !currentCraftBurstHasProduct) {
                currentCraftBurstHasProduct = true;
                craftingStats.successes++;
                if (craftingStats.nearSuccesses > 0) craftingStats.nearSuccesses--; 
            }
        }
        
        craftingStats.loot += value;
        craftingStats.totalLoots++; 
        if (craftingStats.totalCost > 0) craftingStats.returnPct = (craftingStats.loot / craftingStats.totalCost) * 100;
        scheduleUIUpdate();
        return true; 
    }

    // --- Mode 2: Hunting (Default) ---
	// 🟢 THE FIX: Check for Universal Ammo specifically
    const isUniversalAmmo = typeof universalAmmoRegex !== 'undefined' && universalAmmoRegex.test(line);

    if (isUniversalAmmo) {
        // Record only to Universal Ammo stats
        stats.universalAmmo += value;
        
        if (DEBUG) console.log(`♻️ Universal Ammo Conversion Tracked: ${value} PED`);
        
        // We return true here so it DOES NOT add to huntStats.totalReturns 
        // and DOES NOT count as a "loot drop" in the totalLoots counter.
        scheduleUIUpdate();
        return true; 
    }
	if (itemNameLower.includes("vibrant sweat")) {
        // Increment sweat by the quantity (e.g., 4 or 15)
        pickupStats.sweatGains += (quantity || 1);
        
        if (DEBUG) console.log(`💧 Sweat recorded: ${quantity || 1} bottles`);
        
        // Return true here so it DOES NOT count as a "Loot Drop" or "PED Return"
        scheduleUIUpdate();
        return true;
    }
    // Standard Hunting Loot Logic (Only reached if NOT UA)
    stats.loot += value;
    huntStats.totalReturns += value;

    if (currentTime - lastLootIncrementTime > LOOT_COOLDOWN_MS) {
        huntStats.totalLoots += 1;
        stats.totalLoots += 1;
        lastLootIncrementTime = currentTime;

        if (currentHunt) {
            currentHunt.timeline.push({
                timestamp: new Date().toISOString(),
                returnValue: value,
                totalCost: huntStats.totalCost || 0,
                totalReturns: huntStats.totalReturns || 0,
                returnPct: huntStats.totalCost > 0 ? (huntStats.totalReturns / huntStats.totalCost) * 100 : 0
            });
        }
    }

    scheduleUIUpdate();
    return true;
}
 function recordCraftingAttempt(reason, shouldUpdateUI = true) {
    const costPerClickPED = window.currentClickCost || 0; 
    
    craftingStats.clicks++;
    craftingStats.totalCost += costPerClickPED;
    craftingStats.totalCostPerClickPEC = costPerClickPED * 100;
    
    if (craftingStats.totalCost > 0) {
        craftingStats.returnPct = (craftingStats.loot / craftingStats.totalCost) * 100;
    }

    if (currentHunt) {
        currentHunt.timeline.push({
            timestamp: new Date().toISOString(),
            cost: costPerClickPED,
            returnValue: 0, 
            totalCost: craftingStats.totalCost,
            totalReturns: craftingStats.loot,
            reason: reason
        });
    }
    
    // Only update if we aren't in the middle of a massive loot burst
    if (shouldUpdateUI) scheduleUIUpdate();
}

function parseEnhancerBreakLine(line) {
    const match = line.match(enhancerBreakRegex);
    if (!match) return false;

    // 1. Increment the count
    stats.enhancersBroken = (stats.enhancersBroken || 0) + 1;

    // 2. Extract data (optional, for debugging or future use)
    const [_, enhancerName, itemName, remaining, shrapnelVal] = match;
    
    if (DEBUG) {
        console.log(`🛠️ [ENHANCER_BREAK] ${enhancerName} on ${itemName} destroyed.`);
        console.log(`🛠️ [REFUND] ${shrapnelVal} PED Shrapnel ignored (TT-Neutral).`);
    }

    // 3. Update UI
    const breakEl = document.getElementById('enhancerBreakCount');
    if (breakEl) {
        breakEl.innerText = stats.enhancersBroken.toString().padStart(3, '0');
    }

    // Return true so the Pipeline stops here and doesn't log the shrapnel as profit
    return true; 
}
// ===== Globals / HOF Parser =====
function parseGlobalsLine(message) {
    // 1. Check if the message contains your name (case-insensitive)
    if (!message.toLowerCase().includes(lastUsedUsername.toLowerCase())) return false;

    // 2. Distinguish between Global and HOF
    const isHOF = globalHofRegex.test(message); 

    if (isHOF) {
        huntStats.hofs = (huntStats.hofs || 0) + 1;
        // window.playSound('hof-sound'); 
        if (DEBUG) console.log("⭐ HOF Detected for " + lastUsedUsername);
    } else {
        huntStats.globals = (huntStats.globals || 0) + 1;
        // window.playSound('global-sound'); 
        if (DEBUG) console.log("💰 Global Detected for " + lastUsedUsername);
    }

    // 3. Extract value for the console/debug
    const valueMatch = message.match(globalValueRegex);
    if (valueMatch && DEBUG) {
        const val = parseFloat(valueMatch[1].replace(/,/g, ''));
        console.log(`Global Value: ${val} PED`);
    }

    return true;
}
// ===== Pickup Line Parser (New) =====
function parsePickupLine(line) {
	// 1. Match using the new regex (where the amount group is optional)
	const match = line.match(pickupRegex); 
	if (!match) return false;

	// 2. Extract the name
	const itemName = match[1].trim();

	// 3. SMART AMOUNT LOGIC:
	// If match[2] exists, turn it into a number. 
	// If it doesn't exist (undefined), it's a single item, so use 1.
	const amount = match[2] ? parseInt(match[2], 10) : 1;

	// 4. Safety check (optional, but good)
	if (isNaN(amount) || amount <= 0) return false;
    // --- 1. Category Checks (Arrays) ---
    if (FRUIT_NAMES.includes(itemName)) {
        pickupStats.fruits++; 
        return true; 
    } 
    if (STONE_NAMES.includes(itemName)) {
        pickupStats.stones += amount;
        return true;
    }
    // --- 2. Specific Item Checks (Using Regex .test) ---
    if (dungRegex.test(itemName)) {
        pickupStats.commonDung += amount;
        window.playSound('dung-sound');
        return true; 
    } 
    if (oilRegex.test(itemName)) {
        pickupStats.crudeOil += amount;
        window.playSound('oil-sound');
        return true;
    } 
    if (kegRegex.test(itemName)) {
        pickupStats.motorheadKegs += amount;
        window.playSound('oil-sound');
        return true;
    }
    if (elysianRegex.test(itemName)) {
        pickupStats.brokenElysianTechnology += amount;
        return true;
    }
    if (tokenRegex.test(itemName)) {
        pickupStats.rewardTokensLimeGreen += amount;
        return true;
    }
    if (nawaRegex.test(itemName)) {
        pickupStats.nawaFragments += amount;
        return true;
    }
    return false; 
}
// ======= Parse Team Channel Messages =======
function parseTeamLine(line) {
    const tsMatch = line.match(teamTimestampRegex);
    if (!tsMatch) return;

    const [, timestamp, message] = tsMatch;
    teamMessagesLog.push({ timestamp, message });

    const extractMember = (msg, regex) => {
        let member = msg.replace(regex, '').trim();
        const parts = member.split(' ');
        // Logic to extract the name, usually the last part
        return parts.length > 2 ? parts[parts.length - 1] : member;
    };

    const ensureMember = (member) => {
        if (!teamMembers[member]) {
            // Add member only if they are not already tracked
            teamMembers[member] = { deaths: 0, lootHistory: {}, active: true };
        }
    };

    let uiNeedsUpdate = false;
    // 👇'teamLeftRegex' handling for accurate status
    if (teamLeftRegex.test(message)) {
        const member = extractMember(message, teamLeftRegex);
        if (teamMembers[member]) teamMembers[member].active = false;
        uiNeedsUpdate = true;
    } 
    // 👇'teamKilledRegex' handling and ensure member exists
    else if (teamKilledRegex.test(message)) {
        const member = extractMember(message, teamKilledRegex);
        ensureMember(member); // Ensure they are tracked even if not seen looting yet
        teamMembers[member].deaths += 1;
        uiNeedsUpdate = true;
    } 
    // 👇 CRITICAL: Team Loot is the reliable trigger for adding a member
    else {
        const lootMatch = message.match(teamLootRegex);
        if (lootMatch) {
            let [, member, itemName, quantity] = lootMatch;
            const qtyNum = quantity ? parseInt(quantity, 10) : 1;

            // Ensure we use the short/display name provided by the loot message
            member = member.split(' ').length > 2 ? member.split(' ').pop() : member;
            ensureMember(member); // This reliably adds the member using the correct name

            if (!teamMembers[member].lootHistory[itemName]) {
                teamMembers[member].lootHistory[itemName] = { quantity: 0 };
            }
            teamMembers[member].lootHistory[itemName].quantity += qtyNum;
            teamMembers[member].active = true; // Mark as active whenever they loot
            uiNeedsUpdate = true;
        }
    }

    if (uiNeedsUpdate) scheduleTeamUIUpdate();
}
// ===== Fort Attack Line Parser (New) =====
function parseFortEventLine(channel, message) {
    // Only look for System messages
    if (channel !== 'System') return false;
    // Look for the specific attack phrase
	if (laharEventRegex.test(message)) {
	//line below is old line before adding it to precompiled regex
    //if (message.includes("Robot forces have launched an attack on Fort Lahar")) {
        // ⭐ Play the new sound
        window.playSound('lahar-event');
      if (DEBUG) console.log("Fort Lahar attack detected. Playing alarm sound.");
        return true;
    }
    return false;
}
// ===== Mission line Parser (New) =====
/* function parseMissionLogLine(message) {
    console.log("[MissionDebug] Parsing line:", message); // Debugging Log

    // 1. Trim the message to remove invisible leading/trailing spaces
    const cleanMsg = message.trim();

    const receivedMatch = cleanMsg.match(missionReceivedRegex);
    const completedMatch = cleanMsg.match(missionCompletedRegex);

    if (!receivedMatch && !completedMatch) {
        return false; 
    }

    const missionName = receivedMatch ? receivedMatch[1] : completedMatch[1];
    const action = receivedMatch ? 'start' : 'finish';

    console.log(`[MissionDebug] Detected Action: ${action} for: ${missionName}`);

    // 2. CRITICAL: Use window.missions because it's defined in the other script
    if (!window.missions || window.missions.length === 0) {
        console.error("[MissionDebug] Mission database not loaded yet!");
        return false;
    }

    // 3. Find the mission
    const targetMission = window.missions.find(m => 
        m.name.toLowerCase().includes(missionName.toLowerCase()) || 
        missionName.toLowerCase().includes(m.name.toLowerCase())
    );

    if (targetMission) {
        console.log(`[Auto-Timer] Triggering ${action} for ID: ${targetMission.id}`);
        handleAction(targetMission.id, action); // This function is global
        return true;
    }

    console.warn(`[Auto-Timer] Could not find "${missionName}" in your dailies list.`);
    return false;
}
 */
function parseMissionLogLine(message) {
    // ⚡ PERFORMANCE GUARD: 
    // If the word "Mission" isn't even in the line, don't waste CPU on Regex or Loops.
    if (!message.includes("Mission")) return false;

    const cleanMsg = message.trim();

    // Regex Checks
    const receivedMatch = cleanMsg.match(missionReceivedRegex);
    const completedMatch = cleanMsg.match(missionCompletedRegex);
    const updatedMatch = cleanMsg.match(missionUpdatedRegex);

    if (!receivedMatch && !completedMatch && !updatedMatch) return false;

    // Identify Action and Name
    let missionName = "";
    let action = "";

    if (receivedMatch) { 
        missionName = receivedMatch[1]; 
        action = 'start'; 
    } else if (completedMatch) { 
        missionName = completedMatch[1]; 
        action = 'finish'; 
    } else if (updatedMatch) { 
        missionName = updatedMatch[1]; 
        action = 'update'; 
    }

    if (!window.missions || window.missions.length === 0) return false;

    // Find mission in your dailies list (Case Insensitive)
    const searchName = missionName.toLowerCase();
    const targetMission = window.missions.find(m => 
        m.name.toLowerCase() === searchName || 
        searchName.includes(m.name.toLowerCase())
    );

    if (targetMission) {
        if (DEBUG) console.log(`[Auto-Timer] Triggering ${action} for: ${targetMission.name}`);
        // This function resides in pixelb8-dailies.js
        handleAction(targetMission.id, action); 
        return true;
    }

    return false;
}
 // ===== mining claim line Parser (New) =====
function parseMiningLine(text) {
    const isTracking = window.getIsTrackingHunts ? window.getIsTrackingHunts() : false;
    if (!isTracking || window.isHuntPaused) return false;

    const claimRegex = /You have claimed a resource! \((.*)\)/;
    const depletedRegex = /This resource is depleted/;

    const claimMatch = text.match(claimRegex);
    if (claimMatch) {
        const resourceName = claimMatch[1];
        
        // 1. Update Stats
        miningStats.claimsFound += 1;
        
        // 2. Add to active list (case-insensitive check to be safe)
        const alreadyExists = miningStats.claims.some(c => c.toLowerCase() === resourceName.toLowerCase());
        if (!alreadyExists) {
            miningStats.claims.push(resourceName);
        }
        
        // 3. Update UI
        const guiClaimEl = document.getElementById('display-claimsFound');
        if (guiClaimEl) guiClaimEl.textContent = miningStats.claimsFound;
        
        if (DEBUG) console.log(`⛏️ Claim Found: ${resourceName} (Active: ${miningStats.claims.length})`);
        
        window.sendOverlayAll();
        return true;
    }

    if (depletedRegex.test(text)) {
        // 1. Update Stats
        miningStats.claimsExtracted += 1;
        
        // 2. Update UI
        const guiExtractedEl = document.getElementById('display-claimsExtracted');
        if (guiExtractedEl) guiExtractedEl.textContent = miningStats.claimsExtracted;
        
        if (DEBUG) console.log(`⛏️ Resource Depleted. Total Extracted: ${miningStats.claimsExtracted}`);
        
        // 🟢 IMPORTANT: If for some reason the loot line didn't clear the claim 
        // (e.g. no loot was received on the final pull), we might have a 'stuck' claim.
        // We could clear the oldest claim here as a fallback, but for now, 
        // letting parseLootLine handle it is more precise for multi-claims.

        window.sendOverlayAll();
        return true;
    }

    return false;
}
// Each parser returns true if it handled the line, false otherwise.
// ===== Unified Line Parser Pipeline =====
const lineParsers = [

  (line, costThisHit) => parseCombatLine(line, costThisHit),
  
  (line) => parseEnhancerBreakLine(line),
  (line) => parsePickupLine(line),
  (line) => parseHealLine(line),
  (line) => parseDeathExpLine(line),
  (line) => parseLootLine(line), 
  (line) => parseMiningLine(line)
];
// ----- Integration -----
function handleTeamChannel(line) {
  if (!line.includes("[Team]")) return;
  parseTeamLine(line);
}
function processSystemLine(line, costThisHit, timestamp, message) {
  for (const parseFn of lineParsers) {
    if (parseFn(line, costThisHit)) {
      return true;
    }
  }
  return false;
}

// ===== Optimized using precompiled regex =====
// ===== Regex Cache =====
const regexCache = new Map();
function getCachedRegex(key, pattern, flags = '') {
  if (!regexCache.has(key)) {
    regexCache.set(key, new RegExp(pattern, flags));
  }
  return regexCache.get(key);
}

// ===== Extract Helpers (Optimized) =====
// Extract damage/heal numbers after specific keywords
function extractNumber(line) {
  let match = null;
  if (line.includes("inflicted")) {
    match = line.match(inflictedRegex);
  } else if (line.includes("took")) {
    match = line.match(tookRegex);
  } else if (line.includes("healed")) {
    match = line.match(healedRegex);
  }
  return match ? parseFloat(match[1]) : 0;
}
// Extract PED value
function extractLoot(line) {
  const match = line.match(pedAmountRegex);
  return match ? parseFloat(match[1].replace(/,/g, '')) : 0;
}

function extractLootDetails(line) {
  const match = line.match(lootDetailsRegex);
  if (!match) return null;
  const name = match[1].trim();
  const quantity = match[2] ? parseInt(match[2], 10) : 1;
  const value = match[3] ? parseFloat(match[3].replace(/,/g, '')) : 0;
  return { name, quantity, value };
}

// ===== HELPER for Main Log Handler =====
function formatLogLine({ line, timestamp, channel, message }) {
  const rgb = channelColors[channel] || "93,93,93";
  const watched = watchlist.some(w => line.includes(w));

  return `<div style="white-space:nowrap;">
    ${watched ? '<strong>[WATCHED]</strong> ' : ''}
    <span style="color:rgb(93,93,93)">${timestamp}</span> 
    <span style="color:rgb(${rgb});">[${channel}]</span> 
    <span style="color:rgba(${rgb},0.9);">${message}</span>
  </div>`;
}
// ===== Main Log Handler =====
//parseMissionLogLine(message)
/* function handleLogLine(line) {
  const matchedChannel = masterChats.find(chat => chatState[chat] && line.includes(`[${chat}]`));
  if (!matchedChannel) return; 

  const match = line.match(timestampChannelMessageRegex);
  if (!match) return; 
  const [, timestamp, channel, message] = match;

  logBuffer.push(formatLogLine({ line, timestamp, channel, message }));

  // ===========================================================
  // 🟢 GLOBAL HANDLERS (Always active when tracking)
  // ===========================================================
  if (channel === 'System') {
      parseFortEventLine(channel, message);
      parseMissionLogLine(message);
      parselastKnownLocationLine(message, timestamp);
	  parseGameMapWaypoint(message, timestamp);
      // 1. Capture XP Gains (Skills) here so they work for BOTH Hunt & Craft
      // We call the existing parseDeathExpLine logic directly on the message
      const expMatch = message.match(experienceRegex);
      if (expMatch) {
          const [_, xp, skillName] = expMatch;
          skillStats[skillName] = (skillStats[skillName] || 0) + parseFloat(xp);
          skillStats.total += parseFloat(xp);
          if (DEBUG) console.log(`🎓 Skill Gained: ${skillName} +${xp}`);
          scheduleUIUpdate();
      }

      // 2. Handle Blueprint QR Increases
      if (qrIncreaseRegex.test(message)) {
          craftingStats.qrIncrease++;
          // Also add to skillStats so it shows up in "Draw All" Skill Gains
          const qrKey = "Blueprint QR Increase";
          skillStats[qrKey] = (skillStats[qrKey] || 0) + 1;
          skillStats.total += 1;
          if (DEBUG) console.log("📈 BP Quality Improved!");
          scheduleUIUpdate(); 
      }
  }

  // Quick exit if not tracking
  if (!isTrackingHunts || window.isHuntPaused) {
      return scheduleUIUpdate();
  }

  // --- HUNT/CRAFT SPECIFIC ROUTING ---
  switch (channel) {
    case 'Globals': parseGlobalsLine(message); break;
    case 'Team': parseTeamLine(line); break;
    case 'System':
      // DYNAMIC COST: Check if crafting or hunting
      const isCrafting = window.trackingMode === 'crafting';
      const costThisHit = isCrafting 
        ? (window.currentClickCost || 0) 
        : (window.loadoutStats?.totalCostPerUsePEC / 100 || 0);

      if (processSystemLine(line, costThisHit, timestamp, message) && currentHunt) {
        // Sync financial totals to the current session object
        if (isCrafting) {
            currentHunt.totalCost = craftingStats.totalCost;
            currentHunt.totalReturns = craftingStats.loot;
        } else {
            currentHunt.totalCost = huntStats.totalCost;
            currentHunt.totalReturns = huntStats.totalReturns;
            currentHunt.totalLoots = huntStats.totalLoots;
			window.lastHotkeySwitchTime = Date.now();
            if (DEBUG) console.log("🛡️ Action Detected: Loadout switch cooldown reset.");
        }
      }
      break;
  }
  scheduleUIUpdate();
}
 */

function handleLogLine(line) {
    // 1. QUICK FILTER: Ignore if the channel is toggled off in UI
    const matchedChannel = masterChats.find(chat => chatState[chat] && line.includes(`[${chat}]`));
    if (!matchedChannel) return; 

    // 2. REGEX SPLIT: Extract timestamp, channel, and the actual message
    const match = line.match(timestampChannelMessageRegex);
    if (!match) return; 
    const [, timestamp, channel, message] = match;

    // 3. BATCHED UI UPDATE: Add to the visual log buffer
    logBuffer.push(formatLogLine({ line, timestamp, channel, message }));

    // ===========================================================
    // 🟢 PASSIVE SYSTEM HANDLERS (Dailies, Map, Events)
    // Runs even if Hunt/Craft tracking is OFF
    // ===========================================================
    if (channel === 'System') {
        // Mission Log Check (Highest Priority for Dailies)
        if (parseMissionLogLine(message)) return scheduleUIUpdate();

        // Map & Waypoint Checks
        const isMapAction = parseGameMapWaypoint(message, timestamp) || parselastKnownLocationLine(message, timestamp);
        if (isMapAction) return; // Map functions trigger their own renders

        // Event Sounds (Fort Lahar, etc)
        parseFortEventLine(channel, message);
    }

    // ===========================================================
    // 🔴 ACTIVE TRACKING PIPELINE (Hunt / Craft / Mining)
    // ===========================================================
    if (!isTrackingHunts || window.isHuntPaused) {
        return scheduleUIUpdate();
    }

    switch (channel) {
        case 'Globals': 
            parseGlobalsLine(message); 
            break;

        case 'Team': 
            if (typeof parseTeamLine === 'function') parseTeamLine(line); 
            break;

        case 'System':
            const isCrafting = window.trackingMode === 'crafting';
            const costThisHit = isCrafting 
                ? (window.currentClickCost || 0) 
                : (window.loadoutStats?.totalCostPerUsePEC / 100 || 0);

            // processSystemLine runs the LineParsers array (Loot, XP, Combat, etc)
            if (processSystemLine(line, costThisHit, timestamp, message)) {
                syncSessionTotals(isCrafting);
            }
            break;
    }

    scheduleUIUpdate();
}
function syncSessionTotals(isCrafting) {
    if (!currentHunt) return;
    
    if (isCrafting) {
        currentHunt.totalCost = craftingStats.totalCost;
        currentHunt.totalReturns = craftingStats.loot;
    } else {
        currentHunt.totalCost = huntStats.totalCost;
        currentHunt.totalReturns = huntStats.totalReturns;
        currentHunt.totalLoots = huntStats.totalLoots;
        
        // Reset the "recently acted" flag for your loadout switcher logic
        window.lastHotkeySwitchTime = Date.now();
    }
}
// ===============================
// DOM UPDATE HELPERS
// ===============================
function updateElementsText(elements, label, value) {
  elements.forEach(el => {
    if (el.dataset.value !== value.toString()) { // prevent redundant reflow
      el.innerHTML = `<strong>${label}:</strong> ${value}`;
      el.dataset.value = value;
    }
  });
}

function renderPanelHTML(panel, html) {
  if (panel.dataset.lastHTML !== html) {
    panel.innerHTML = html;
    panel.dataset.lastHTML = html;
  }
}

// ===============================
//        CORE STATS UPDATING
// ===============================
// PRECOMPILED TEMPLATES
// ===============================
const statsTemplate = ({ totalLoots, loot, damageDealt, damageTaken, heals, universalAmmo, enhancers }) =>
  `<p><strong>Loots:</strong> ${totalLoots}</p>
   <p><strong>Loot:</strong> ${loot}</p>
   <p><strong>Damage Dealt:</strong> ${damageDealt}</p>
   <p><strong>Damage Taken:</strong> ${damageTaken}</p>
   <p><strong>Total Heals:</strong> ${heals}</p>
   <p><strong>Universal Ammo Received:</strong> ${universalAmmo}</p>
   <p><strong>Enhancers:</strong> ${enhancers}</p>`;

const huntSummaryTemplate = ({ totalLoots, totalCost, totalReturns, returnPct, globals, hofs, deaths }) =>
  `<p><strong>Loots:</strong> ${totalLoots}</p>
   <p><strong>Cost:</strong> ${totalCost}</p>
   <p><strong>Returns:</strong> ${totalReturns}</p>
   <p><strong>Return %:</strong> ${returnPct}%</p>
   <p><strong>Globals:</strong> ${globals}</p>
   <p><strong>Hofs:</strong> ${hofs}</p>
   <p><strong>Deaths:</strong> ${deaths}</p>`;

const combatSummaryTemplate = ({
  totalShots, damageDealt, critPct, missPct, dps, dpp,
  damageTaken, heals, deaths, enemyEvadeCount, enemyDodgeCount, enhancers
}) =>
  `<p><strong>Total Shots:</strong> ${totalShots}</p>
   <p><strong>Damage Dealt:</strong> ${damageDealt}</p>
   <p><strong>Critical %:</strong> ${critPct}%</p>
   <p><strong>Miss %:</strong> ${missPct}%</p>
   <p><strong>DPS:</strong> ${dps}</p>
   <p><strong>DPP:</strong> ${dpp}</p>
   <p><strong>Damage Taken:</strong> ${damageTaken}</p>
   <p><strong>Heals:</strong> ${heals}</p>
   <p><strong>Total Deaths:</strong> ${deaths}</p>
   <p><strong>Enemy Evades:</strong> ${enemyEvadeCount}</p>
   <p><strong>Enemy Dodges:</strong> ${enemyDodgeCount}</p>
   <p><strong>Enhancers:</strong> ${enhancers}</p>`;

// Precompile team member HTML
const teamMemberTemplate = (member, data, totalLooted) => {
  const memberTotal = Object.values(data.lootHistory).reduce((a, b) => a + b.quantity, 0);
  const sharePercent = totalLooted ? (memberTotal / totalLooted) * 100 : 0;
  const barColor = data.active ? 'lime' : 'gray';

  const lootDetails = Object.entries(data.lootHistory)
    .map(([item, info]) => `<div class="loot-item">• ${item}: ${info.quantity}x</div>`)
    .join('') || '<div class="loot-item empty">No loot yet</div>';

  const status = data.active
    ? '<span class="status active">(Active)</span>'
    : '<span class="status left">(Left team)</span>';

  return `
    <div class="team-member">
      <div class="member-header" data-member="${member}">
        <strong>${member}</strong> ${status} — Deaths: ${data.deaths}
        <div class="loot-bar"><div class="loot-bar-fill" style="width:${sharePercent}%; background:${barColor};"></div></div>
        <div class="loot-share">${sharePercent.toFixed(1)}%</div>
      </div>
      <div class="loot-details hidden">${lootDetails}</div>
    </div>`;
};
function updateStats() {
  const html = statsTemplate({
    totalLoots: stats.totalLoots,
    loot: stats.loot.toFixed(4),
    damageDealt: stats.damageDealt.toFixed(1),
    damageTaken: stats.damageTaken.toFixed(1),
    heals: stats.heals.toFixed(1),
    universalAmmo: stats.universalAmmo.toFixed(4)
  });
  totalsPanels.forEach(p => renderPanelHTML(p, html));
}

function updateHuntSummary() {
  const html = huntSummaryTemplate({
    totalLoots: huntStats.totalLoots,
    totalCost: huntStats.totalCost.toFixed(4),
    totalReturns: huntStats.totalReturns.toFixed(4),
    returnPct: huntStats.totalCost ? ((huntStats.totalReturns / huntStats.totalCost) * 100).toFixed(1) : 0,
    globals: huntStats.globals,
    hofs: huntStats.hofs,
    deaths: stats.deathCount
  });
  huntSummaryPanels.forEach(p => renderPanelHTML(p, html));

  const lootPanel = document.getElementById('lootBreakdown');
  if (lootPanel) {
    const breakdown = Object.entries(lootHistory)
      .map(([item, data]) => `<p>${item}: ${data.quantity}x — ${data.totalValue.toFixed(2)} PED</p>`)
      .join('') || `<p>No loot data yet</p>`;
    renderPanelHTML(lootPanel, `<h4>Loot Breakdown:</h4>${breakdown}`);
  }

}

function updateCombatSummary() {
  const html = combatSummaryTemplate({
    totalShots: combatStats.totalShots,
    damageDealt: stats.damageDealt.toFixed(1),
    critPct: combatStats.crits ? ((combatStats.crits / combatStats.totalShots) * 100).toFixed(1) : 0,
    missPct: combatStats.misses ? ((combatStats.misses / combatStats.totalShots) * 100).toFixed(1) : 0,
    dps: 0,
    dpp: 0,
    damageTaken: stats.damageTaken.toFixed(1),
    heals: stats.heals.toFixed(1),
    deaths: stats.deathCount,
    enemyEvadeCount: combatStats.enemyEvadeCount,
    enemyDodgeCount: combatStats.enemyDodgeCount,
    enhancers: 0
  });
  combatSummaryPanels.forEach(p => renderPanelHTML(p, html));
}
function updateSkillGains() {
  const htmlParts = [`<p><strong>Total Skill Gain:</strong> ${skillStats.total.toFixed(4)}</p>`];
  for (const [skill, xp] of Object.entries(skillStats)) {
    if (skill === 'total') continue;
    htmlParts.push(`<p><strong>${skill}:</strong> ${xp.toFixed(4)}</p>`);
  }
  const html = htmlParts.join('');
  skillGainsPanels.forEach(p => renderPanelHTML(p, html));
}


function updateTeamLootUI() {
  if (!teamLootPanel) return;
  const totalLooted = Object.values(teamMembers)
    .reduce((sum, m) => sum + Object.values(m.lootHistory).reduce((a, b) => a + b.quantity, 0), 0);

  const html = Object.entries(teamMembers)
    .map(([member, data]) => teamMemberTemplate(member, data, totalLooted))
    .join('');
  renderPanelHTML(teamLootPanel, html);

  teamLootPanel.querySelectorAll('.member-header').forEach(header => {
    header.onclick = () => header.nextElementSibling.classList.toggle('hidden');
  });
}
function updateTeamMessagesLog() {
  if (!teamMessagesLogDiv) return;

  const html = teamMessagesLog
    .map(msg => `<div>[${msg.timestamp}] ${msg.message}</div>`)
    .join('');

  renderPanelHTML(teamMessagesLogDiv, html);
  teamMessagesLogDiv.scrollTop = teamMessagesLogDiv.scrollHeight;
}

function updateHealInfo() {
  const heals = stats.heals.toFixed(1);
  const healTimes = stats.healTimes || 0;
  updateElementsText(healAmountEls, 'Total Heal amount', heals);
  updateElementsText(healTimesEls, 'Total times healed', healTimes);
  sendToOverlay("update-heal-info", { heals, healTimes });
}
// ===============================
// 🌐 Overlay sync
// ===============================
// Helper: Sum up total loot for a single member
function calculateMemberLoot(memberData) {
  return Object.values(memberData.lootHistory || {}).reduce((sum, amount) => sum + amount, 0);
}

// Helper: Calculate total team loot and per-member totals
function calculateTeamLoot(teamMembers) {
  let totalTeamLoot = 0;
  const memberTotals = {};

  for (const [name, data] of Object.entries(teamMembers)) {
    const memberLoot = calculateMemberLoot(data);
    memberTotals[name] = memberLoot;
    totalTeamLoot += memberLoot;
  }

  return { totalTeamLoot, memberTotals };
}

// Helper: Build team data including percentages
function buildTeamData(teamMembers) {
  const { totalTeamLoot, memberTotals } = calculateTeamLoot(teamMembers);

  return Object.fromEntries(
    Object.entries(teamMembers).map(([name, data]) => {
      const memberLoot = memberTotals[name] || 0;
      const percent = totalTeamLoot ? ((memberLoot / totalTeamLoot) * 100).toFixed(1) : 0;
      return [
        name,
        {
          deaths: data.deaths,
          active: data.active,
          lootHistory: { ...data.lootHistory },
          totalLoot: memberLoot,
          percentOfTeamLoot: percent
        }
      ];
    })
  );
}

//obs broadcast bullshit
const broadcastToggle = document.getElementById('broadcastToggle');

broadcastToggle.addEventListener('change', (e) => {
    const isEnabled = e.target.checked;
    localStorage.setItem('broadcastEnabled', isEnabled);
    
    // Add a small delay or check to prevent spamming
    window.electronAPI.send('toggle-obs-server', isEnabled);
});
// On App Load: Check if it should be started immediately
if (localStorage.getItem('broadcastEnabled') === 'true') {
    window.electronAPI.send('toggle-obs-server', true);
}

// 🟢 Changed from 'function sendOverlayAll' to 'window.sendOverlayAll ='
window.sendOverlayAll = function() {
    const isTracking = window.getIsTrackingHunts ? window.getIsTrackingHunts() : false;
    const isPaused = window.isHuntPaused || false;
    
    // 1. Determine Mode
    const mode = window.trackingMode || 'hunting';

    // 2. Capture Names
    const loadoutSelect = document.getElementById('loadoutSelect');
    const currentLoadout = loadoutSelect ? loadoutSelect.value : 'None Selected';

    const bpField = document.getElementById('blueprintNameField');
    const currentBP = bpField ? (bpField.value || bpField.textContent || 'None') : 'None';
	
	const miningEquipped = !!window.finderIsEquipped;
	const finderSpan = document.getElementById('display-finderName');
    const currentFinder = (finderSpan && finderSpan.textContent.trim() !== "")  ? finderSpan.textContent  : 'Finder';
	
	const extractorEquipped = !!window.extractorIsEquipped;
    const extractorInput = document.getElementById('extractor-tool-selectInput');
    const currentExtractor = extractorInput ? (extractorInput.value || 'Extractor') : 'Extractor';
	const mainfapEquipped = !!window.mainFapIsEquipped;
    const mainFapName = window.faps?.mainFap?.name || 'Main FAP';
	const secondaryfapEquipped = !!window.secondaryFapIsEquipped;
    const secondaryFapName = window.faps?.secondaryFap?.name || 'Secondary FAP';

    // 3. 🟢 SYNC GLOBAL MATH BEFORE SENDING
    // Hunting ROI
    if (huntStats.totalCost > 0) {
        huntStats.returnPct = (huntStats.totalReturns / huntStats.totalCost) * 100;
    } else {
        huntStats.returnPct = 0;
    }
    
    // Crafting ROI
    if (craftingStats.totalCost > 0) {
        craftingStats.returnPct = (craftingStats.loot / craftingStats.totalCost) * 100;
    } else {
        craftingStats.returnPct = 0;
    }

    // Mining ROI
    if (miningStats.totalCost > 0) {
        miningStats.returnPct = (miningStats.totalReturns / miningStats.totalCost) * 100;
    } else {
        miningStats.returnPct = 0;
    }

    // 4. 🟢 DYNAMIC COST PER CLICK/SHOT
    let activeCostPEC = 0;
    if (mode === 'crafting') {
        activeCostPEC = (window.currentClickCost || 0) * 100;
    } else {
        activeCostPEC = window.loadoutStats?.totalCostPerUsePEC || 0;
    }

    // 5. Construct Payload
    const overlayData = {
        trackingMode: mode, 
        huntStats: {
            ...huntStats,
            // Force current math into the spread for the overlay to read
            returnPct: huntStats.returnPct,
            totalCostPerUsePEC: mode === 'hunting' ? activeCostPEC : (huntStats.totalCostPerUsePEC || 0),
            // Map 'loot' specifically if overlay.js expects it
            loot: huntStats.totalReturns || 0 
        },
        craftingStats: { 
            ...craftingStats, 
            totalCostPerClickPEC: activeCostPEC,
            returnPct: craftingStats.returnPct
        },
        miningStats: { 
            ...miningStats,
            returnPct: miningStats.returnPct
        },
        combatStats: { ...combatStats },
        skillStats: { ...skillStats },
        stats: { ...stats },
        pickupStats: { ...pickupStats },
        lootHistory: { ...lootHistory },
        
        currentLoadoutName: currentLoadout,
        currentBlueprintName: currentBP,
        currentFinderName: currentFinder,
		
		currentExtractorName: currentExtractor, // 🟢 Added
        currentMainFapName: mainFapName,        // 🟢 Added
        currentSecondaryFapName: secondaryFapName, // 🟢 Added
		isMiningToolEquipped: miningEquipped,
		isExtractorEquipped: extractorEquipped,       // 🟢 Added
        isMainFapEquipped: mainfapEquipped,           // 🟢 Added
        isSecondaryFapEquipped: secondaryfapEquipped, // 🟢 Added
        team: typeof teamMembers !== 'undefined' ? teamMembers : [], 
        totalTeamLoot: 0, 
        teamMessagesLog: typeof teamMessagesLog !== 'undefined' ? teamMessagesLog : [],
        isPaused: isPaused,
        isTracking: isTracking
    };

    // 6. Dispatch to Overlay
    if (typeof sendToOverlay === 'function') {
        sendToOverlay("overlay-update", overlayData);
    } else if (window.electronAPI?.sendToOverlay) {
        window.electronAPI.sendToOverlay("overlay-update", overlayData);
    }

    // 7. OBS / Web Bridge Sync
    const broadcastOn = localStorage.getItem('broadcastEnabled') === 'true';
    if (broadcastOn && window.electronAPI?.send) {
        window.electronAPI.send('sync-live-overlay', overlayData);
    }
};


// wrapper
function sendOverlayAll() {
    window.sendOverlayAll();
}

// ===== username stuff =====
function renderUsernameOptions() {
  usernameDatalist.innerHTML = '';
  savedUsernames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    usernameDatalist.appendChild(option);
  });
  if (lastUsedUsername) usernameInput.value = lastUsedUsername;
}

saveUsernameBtn.addEventListener('click', async () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("Enter username");
  if (!savedUsernames.includes(name)) savedUsernames.push(name);
  lastUsedUsername = name;
  await saveJSON(USERNAMES_FILE, { usernames: savedUsernames, lastUsed: lastUsedUsername });
  renderUsernameOptions();
});
removeUsernameBtn.addEventListener('click', async () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("Enter username to remove");
  savedUsernames = savedUsernames.filter(u => u !== name);
  if (lastUsedUsername === name) lastUsedUsername = '';
  await saveJSON(USERNAMES_FILE, { usernames: savedUsernames, lastUsed: lastUsedUsername });
  usernameInput.value = '';
  renderUsernameOptions();
});

// =====selected fap persistence=====
window.saveFapSettings = async function (mainFapName, secondaryFapName, mainHoT, secondaryHoT, mainHotPercent, secondaryHotPercent) {
    // 1. Load current settings from disk
    const settings = await loadJSON(SETTINGS_FILE);

    // 2. Update the FAP fields in the settings object
    settings.lastMainFap = mainFapName;
    settings.lastSecondaryFap = secondaryFapName;
    settings.mainFapIsHoT = mainHoT;  
    settings.secondaryFapIsHoT = secondaryHoT; 
    // NEW: Save the HoT percentage data
    settings.mainFapHoTPercent = mainHotPercent;  
    settings.secondaryFapHoTPercent = secondaryHotPercent;  
    
    // 3. Persist the updated settings back to disk
    await saveJSON(SETTINGS_FILE, settings); 
  if (DEBUG) console.log(`FAP settings saved: Main=${mainFapName} (HoT: ${mainHoT}, Pct: ${mainHotPercent}), Secondary=${secondaryFapName} (HoT: ${secondaryHoT}, Pct: ${secondaryHotPercent})`);
};

// Function to expose team data to other renderer scripts (like hunttracker.js)
window.getTeamHuntData = () => {
    return {
        // Expose the raw data objects
        teamMembers: teamMembers, 
        teamMessagesLog: teamMessagesLog 
    };
};

// Function to reset team data when a new hunt starts
window.resetTeamHuntData = () => {
  if (DEBUG) console.log("Resetting Team Hunt Data");
    teamMembers = {};
    teamMessagesLog = [];
    // Ensure all references are updated (important for UI to clear)
    scheduleTeamUIUpdate();
};

function resetHunt() {
  if (typeof lootHistory !== 'undefined') {
    for (let key in lootHistory) {
      delete lootHistory[key];
    }
  }

  const nameInput = document.getElementById('huntName');
  const notesInput = document.getElementById('huntNotes');
  if (nameInput) nameInput.value = '';
  if (notesInput) notesInput.value = '';

  const chartTitle = document.getElementById('chartTitle');
  if (chartTitle) chartTitle.textContent = 'Live Tracking: Ready';

  // 1. Reset General Stats
  Object.assign(stats, {
    damageDealt: 0, damageTaken: 0, heals: 0, totalLoots: 0,
    loot: 0, deathCount: 0, healTimes: 0, universalAmmo: 0,
    sweatGains: 0, enhancersBroken: 0
  });
  // 🟢 NEW: Reset Mining Stats
	Object.assign(miningStats, {
        drops: 0,
        totalCost: 0,
        totalReturns: 0,
        returnPct: 0,
        avgReturn: 0,
        claimsFound: 0,
        claimsExtracted: 0, // Reset the depletion counter
        claims: []          // Clear the active claims list
    });
  // 2. Reset Pickup Stats
  Object.assign(pickupStats, {
    sweatGains: 0, fruits: 0, stones: 0, commonDung: 0, crudeOil: 0,
    motorheadKegs: 0, brokenElysianTechnology: 0,
    rewardTokensLimeGreen: 0, nawaFragments: 0
  });

  // 3. Reset Combat Stats
  Object.assign(combatStats, {
    totalShots: 0, crits: 0, misses: 0, totalDamage: 0,
    enemyEvadeCount: 0, enemyDodgeCount: 0
  });

  // 4. Reset Hunt Totals
  Object.assign(huntStats, {
    totalLoots: 0, totalReturns: 0, totalCost: 0, globals: 0, hofs: 0
  });

  // 5. 🟢 NEW: Reset Crafting Stats
  Object.assign(craftingStats, {
    clicks: 0,                // Total attempts (Success + Near Success + Fail)
    successes: 0,             // "Product" received
    nearSuccesses: 0,         // "Residue/Materials" received
    fails: 0,                 // "Nothing" received (Heartbeat trigger)
    totalLoots: 0,            // Count of individual items received (Shrapnel, etc.)
    totalCost: 0,             // Total PED spent on clicks
    loot: 0,                  // Total PED value of items returned
    qrIncrease: 0,            // Count of QR progress lines
    returnPct: 0,             // (loot / totalCost) * 100
    totalCostPerClickPEC: 0   // The PEC value of a single click for the current BP
  });

  // Reset team data
  if (typeof window.resetTeamHuntData === "function") {
    window.resetTeamHuntData();
  }

  Object.assign(skillStats, { total: 0 });
  lastLootTimestamp = null;

  // Update UI and overlay
  scheduleUIUpdate();
  if (DEBUG) console.log("All stats (including Crafting) reset.");
}
// ===== Initialization =====

window.initChatSnooper = async () => {
    if (DEBUG) console.log("Initializing ChatSnooper...");

    await ensureDataFiles(); // folder + files
    
    const settings = await loadJSON(SETTINGS_FILE);
    if (settings?.logFilePath) {
        watcherFilePath = settings.logFilePath;
        const pathDisplay = document.getElementById('currentfilepath');
        if (pathDisplay) {
            pathDisplay.innerText = `Watching: ${watcherFilePath}`;
        }
        await window.electronAPI.startWatch(watcherFilePath);
    }

    const loadoutsData = await loadJSON(LOADOUTS_FILE);
    if (loadoutsData?.loadouts) loadouts = loadoutsData.loadouts;

    const usernamesData = await loadJSON(USERNAMES_FILE);
    if (usernamesData?.usernames) savedUsernames = usernamesData.usernames;
    if (usernamesData?.lastUsed) lastUsedUsername = usernamesData.lastUsed;

    // FAP persistence settings
    window.fapPersistence = {
        lastMainFap: settings?.lastMainFap || 'None',
        lastSecondaryFap: settings?.lastSecondaryFap || 'None',
        mainFapIsHoT: settings?.mainFapIsHoT || false,
        secondaryFapIsHoT: settings?.secondaryFapIsHoT || false,
        mainFapHoTPercent: settings?.mainFapHoTPercent || '',
        secondaryFapHoTPercent: settings?.secondaryFapHoTPercent || ''
    };

    scheduleUIUpdate(); 
    renderUsernameOptions();

    if (DEBUG) console.log("FAP SETTINGS DATA LOAD COMPLETE");

    /**
     * 🛑 REDUNDANCY CHECK
     * If isSystemInitializing is true, the Master Bootloader (startApp) 
     * is already handling the dropdown initialization. We skip it here
     * to prevent the "waterfall" of redundant data fetches and calculations.
     */
    if (window.initDropdowns) {
        if (!window.isSystemInitializing) {
            //await window.initDropdowns();
            if (DEBUG) console.log("Loadout initialization complete via ChatSnooper.");
            scheduleUIUpdate(); 
        } else {
            if (DEBUG) console.log("⏭️ Skipping ChatSnooper dropdown init (Handled by Master Bootloader)");
        }
    } else {
        console.warn("window.initDropdowns is not available. Loadout data may be stuck at 0.");
    }
    
    console.log("✅ ChatSnooper initialized.");
};

document.getElementById('resetHuntBtn').addEventListener('click', () => {
	resetHunt();

});

scheduleUIUpdate();
if (DEBUG) console.log('chatsnooper script loaded');
