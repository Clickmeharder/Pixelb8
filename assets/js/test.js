
// offshoot game called stickmenpo - samurai ninja game?

// creation tool. make a pen u can draw with, 
//choose if its a player body, an enemy, a weapon, an armour, a helmet, a bow, a staff or a graffiti or npc, or projectile or face or  and save data

//dont Constants and important things
const c = document.getElementById("c");
const areaDisplayDiv = document.getElementById("areaDisplay");
const ctx = c.getContext("2d");
let mouse = { x: 0, y: 0 };
let players = {};
//
//
//=======utility we culd probably group in a shared globaljs
function getRandomHex() {
    return "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}
/* ================= UTILS ================= */
// --- on screen message boxes-------------------
// (top left system messages)
function systemMessage(text) {
    const div = document.createElement("div");
    div.className = "sysMsg";
    div.textContent = text;
    document.getElementById("stickmenfall-systemMsgBox").appendChild(div);
    setTimeout(() => div.remove(), 8000);
}
//        IDLE ACTION MESSAGES
// ( big bottom right ext box )
let idleBoxFadeTimeout = null;

function idleActionMsg(playerName, text, color = "#0f0") {
    const box = document.getElementById("idleActionsBox");
    if (!box) return;

    // 1. Create the entry
    const entry = document.createElement("div");
    entry.style.marginBottom = "3px";
    entry.style.borderLeft = `3px solid ${color}`;
    entry.style.paddingLeft = "8px";
    entry.style.fontFamily = "monospace";
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    entry.innerHTML = `
        <span style="color: #666; font-size: 11px;">[${time}]</span> 
        <strong style="color: ${color};">${playerName}:</strong> 
        <span style="color: #bbb;">${text}</span>
    `;

    // 2. Add to box and scroll
    box.appendChild(entry);
    box.scrollTop = box.scrollHeight;

    if (box.childNodes.length > 50) {
        box.removeChild(box.firstChild);
    }

    // 3. THE "POP & FADE" LOGIC
    // Bring the box to life
    box.classList.add("active");

    // Clear any existing timer so it doesn't fade too early
    if (idleBoxFadeTimeout) {
        clearTimeout(idleBoxFadeTimeout);
    }

    // Set a timer to hide the box after 5 seconds of inactivity
    idleBoxFadeTimeout = setTimeout(() => {
        box.classList.remove("active");
        
        // Optional: Clear old messages when it fades out to keep it fresh
        // setTimeout(() => { box.innerHTML = ""; }, 500); 
    }, 5000); 
}
/* ====grr============= CONFIG & STATE ================== */
// we can change these [ basically options ] 
let viewArea = "home"; 
const TASK_DURATION = 15 * 60 * 1000; // 15 Minutes

/* ================= DATA PERSISTENCE ================= */
function loadStats(name) {
    const saved = localStorage.getItem("rpg_" + name);
    let stats = saved ? JSON.parse(saved) : {
		lastArea: "home",
		maxhp:100,
		currentHp: 100,
		pixels: 1500,
		lastX: 400,
        lastY: 450,
        attackLevel: 1, attackXP: 0,
		archerLevel: 1, archerXP: 0,
		magicLevel: 1, magicXP: 0,
        healLevel: 1, healXP: 0,
        fishLevel: 1, fishXP: 0,
        danceLevel: 1, danceXP: 0,
		lurkLevel: 1, lurkXP: 0,
		swimLevel: 1, swimXP: 0,
        swimDistance: 0,
		combatLevel: 1,
        inventory: ["Fishing Rod"],
        equippedWeapon: null,
        equippedArmor: null,
        equippedHelmet: null,
        equippedBoots: null,
        // --- NEW SLOTS FOR NEW PLAYERS ---
        equippedPants: null,
        equippedCape: null,
        equippedGloves: null,
        equippedHair: null,
        wigColor: null,
        activeTask: null,
// --- ORGANIZED AREA STATS ---
        dungeon: { completedTiers: [], highestTier: 0, kills: 0, bossKills: 0, achievements: 0 },
        pond:    { visited: false, fishCaught: 0, deepDives: 0, achievements: 0 },
        arena:   { wins: 0, winStreak: 0, totalMatches: 0, achievements:0 },
        story:   { chapter: 0, progress: 0, achievements:0 }
    };

    // --- SAFETY CHECKS (Ensure objects exist for old saves) ---
    if (!stats.dungeon) {
		stats.dungeon = { highestTier: 0, kills: 0, bossKills: 0, achievements: 0, completedTiers: [] };
	}

	// Add this line to handle existing players who have a dungeon object but no array yet
	if (!stats.dungeon.completedTiers) {
		stats.dungeon.completedTiers = [];
	}
    if (!stats.pond)    stats.pond = { visited: false, fishCaught: 0, deepDives: 0, achievements:0 };
    if (!stats.arena)   stats.arena = { wins: 0, winStreak: 0, totalMatches: 0, achievements:0 };
    if (!stats.story)   stats.story = { chapter: 0, progress: 0, achievements:0 };
	// --- SAFETY CHECKS FOR PERSISTENCE ---
    if (stats.lastX === undefined) stats.lastX = 400;
    if (stats.lastY === undefined) stats.lastY = 450;
    if (stats.lastArea === undefined) stats.lastArea = "home";
    if (stats.activeTask === undefined) stats.activeTask = null;
    if (stats.currentHp === undefined) stats.currentHp = stats.maxhp;
	// --- MIGRATION: STRIP WEIGHT FROM NAMES ---
	if (stats.inventory && Array.isArray(stats.inventory)) {
		stats.inventory = stats.inventory.map(item => {
			if (typeof item === 'string') {
				// This replaces things like "1.41kg Bass" or "0.5kb Bass" with just "Bass"
				// It looks for digits, dots, and 'kg' or 'kb' followed by a space
				return item.replace(/^\d+(\.\d+)?k[gb]\s+/, "");
			}
			return item;
		});
	}
	// --- MIGRATION: GOLD TO PIXELS ---
    if (stats.gold !== undefined) {
        // If they had pixels already, add gold to it, otherwise just set it
        stats.pixels = (stats.pixels || 0) + stats.gold;
        // Remove the old gold key so we don't migrate it again
        delete stats.gold; 
        console.log(`Migrated ${name}'s gold to pixels.`);
    }
	
    // --- SAFETY CHECKS FOR OLD SAVES ---
    if (isNaN(stats.pixels) || stats.pixels === null) stats.pixels = 0;
	// Inside the initial stats object and the safety checks
	if (stats.maxhp === undefined) stats.maxhp = 100;
	if (stats.archerLevel === undefined) stats.archerLevel = 1;
	if (stats.archerXP === undefined) stats.archerXP = 0;
	if (stats.magicLevel === undefined) stats.magicLevel = 1;
	if (stats.magicXP === undefined) stats.magicXP = 0;
	if (stats.lurkLevel === undefined) stats.lurkLevel = 1;
	if (stats.lurkXP === undefined) stats.lurkXP = 0;
	if (stats.swimLevel === undefined) stats.swimLevel = 1;
    if (stats.swimXP === undefined) stats.swimXP = 0;
    if (stats.swimDistance === undefined) stats.swimDistance = 0;
	
    // --- SAFETY CHECKS FOR OLD SAVES ---
    if (isNaN(stats.pixels) || stats.pixels === null) stats.pixels = 0;
    
    if (!stats.inventory || !Array.isArray(stats.inventory)) {
        stats.inventory = ["Fishing Rod"];
    }

    if (!stats.inventory.includes("Fishing Rod")) {
        stats.inventory.push("Fishing Rod");
    }
    
    // Instead of 8 separate if statements, you could do this:
	const slots = ["Weapon", "Armor", "Helmet", "Boots", "Pants", "Cape", "Gloves", "Hair"];
	slots.forEach(slot => {
		if (stats[`equipped${slot}`] === undefined) stats[`equipped${slot}`] = null;
	});

    if (stats.danceLevel === undefined) stats.danceLevel = 1;
    if (stats.danceXP === undefined) stats.danceXP = 0;
    if (stats.wigColor === undefined) stats.wigColor = null;

    return stats;
}

function saveStats(p) {
    // 0. Update the stats object with live data before saving
    p.stats.lastX = p.x;
    p.stats.lastY = p.y;
    p.stats.lastArea = p.area;
    p.stats.activeTask = p.activeTask;
    p.stats.currentHp = p.hp;

    // 1. Run the achievement check
    checkAchievements(p);

    // 2. Commit to localStorage
    localStorage.setItem("rpg_" + p.name, JSON.stringify(p.stats));

    // 3. UI RE-RENDER (Keep your existing UI trigger logic here)
    const localProfile = getActiveProfile();
    if (localProfile && p.name.toLowerCase() === localProfile.name.toLowerCase()) {
        const modal = document.getElementById('inventory-modal');
        if (modal && !modal.classList.contains('hidden')) {
            renderInventoryUI();
        }
    }
}

const ACHIEVEMENT_DB = {
    // Pond Achievements
    "Fishing Rod": { check: (s) => s.pond.visited === true, text: "Visit the Pond" },
    
    // Arena Achievements
    "Great Axe": { check: (s) => s.arena.wins >= 50, text: "Win 50 Arena matches" },
    "PvP Cape": { check: (s) => s.arena.winStreak >= 10, text: "Get a 10-win streak" },
    "PvP Boots": { check: (s) => s.arena.totalMatches >= 3, text: "Complete 3 matches" },

    // Level 50 Capes
    "Warrior Cape": { check: (s) => s.attackLevel >= 50, text: "Attack Level 50" },
    "Wizard Cape": { check: (s) => s.magicLevel >= 50, text: "Magic Level 50" },
    "Archer Cape": { check: (s) => s.archerLevel >= 50, text: "Archer Level 50" },
    "Lurker Cape": { check: (s) => s.lurkLevel >= 50, text: "Lurk Level 50" },
    "Healer Cape": { check: (s) => s.healLevel >= 50, text: "Heal Level 50" },
    "Fishing Cape": { check: (s) => s.fishLevel >= 50, text: "Fishing Level 50" },
    "Swimmer Cape": { check: (s) => s.swimLevel >= 50, text: "Swim Level 50" },
    "Nuber Cape": { check: (s) => s.combatLevel >= 50, text: "Combat Level 50" },

    // Level 99 Capes
    "Skilled Warrior Cape": { check: (s) => s.attackLevel >= 99, text: "Attack Level 99" },
    "Skilled Wizard Cape": { check: (s) => s.magicLevel >= 99, text: "Magic Level 99" },
    "Skilled Archer Cape": { check: (s) => s.archerLevel >= 99, text: "Archer Level 99" },
    "Skilled Lurker Cape": { check: (s) => s.lurkLevel >= 99, text: "Lurk Level 99" },
    "Skilled Healer Cape": { check: (s) => s.healLevel >= 99, text: "Heal Level 99" },
    "Skilled Fishing Cape": { check: (s) => s.fishLevel >= 99, text: "Fishing Level 99" },
    "Skilled Swimmer Cape": { check: (s) => s.swimLevel >= 99, text: "Swim Level 99" },
    "Uber Cape": { check: (s) => s.combatLevel >= 99, text: "Combat Level 99" }
};
function checkAchievements(p) {
    const s = p.stats;
    let unlockedAny = false;

    // 1. Check Unique Achievements from the DB
    Object.keys(ACHIEVEMENT_DB).forEach(itemName => {
        const goal = ACHIEVEMENT_DB[itemName];
        
        // Check if they already own it (Inventory or any Equipped slot)
        const owned = s.inventory.includes(itemName) || 
                      Object.values(s.equipped || {}).includes(itemName);

        if (goal.check(s) && !owned) {
            s.inventory.push(itemName);
            unlockedAny = true;
            announceAchievement(p, itemName);
        }
    });

	// 2. Generic Tier Achievements (Dungeon)
    if (!s.dungeon.completedTiers) s.dungeon.completedTiers = [];

	for (let t = 1; t <= 10; t++) {
		if (s.dungeon.highestTier >= t && !s.dungeon.completedTiers.includes(t)) {
			s.dungeon.completedTiers.push(t);
			s.inventory.push("Achievement Trophy");
			unlockedAny = true;
			announceAchievement(p, `Tier ${t} Mastery`);
		}
	}

    return unlockedAny;
}
localStorage.removeItem("rpg_jaedraze");
localStorage.removeItem("rpg_JaeDraze");

// Helper to keep code clean
function announceAchievement(p, label) {
    spawnFloater(p, `🏆 UNLOCKED: ${label}`, "#ffcc00");
    systemMessage(`🎊 ACHIEVEMENT: ${p.name} earned ${label}!`);
    spawnLootBeam(p, 13);
}
/* ================= PLAYER SETUP ================= */
function getPlayer(name, color) {
    const lowName = name.toLowerCase();
    
    if (players[lowName]) {
        if (color) players[lowName].color = (typeof color === 'object') ? (color.userColor || "orangered") : color;
        return players[lowName];
    }
    
    const loadedStats = loadStats(name);

    players[lowName] = {
        name: name,
        color: (typeof color === 'object') ? (color.userColor || "#00ffff") : (color || "#00ffff"),
        // --- LOAD FROM PERSISTENCE ---
        x: loadedStats.lastX,
        y: loadedStats.lastY,
        area: loadedStats.lastArea,
        activeTask: loadedStats.activeTask,
        // -----------------------------
        targetX: null,
        dead: false,
        danceStyle: 0,
        lastDanceXP: 0,
        stats: loadedStats
    };

    updateCombatLevel(players[lowName]);
    
    // Set HP from persistence or 25% floor
    players[lowName].hp = loadedStats.currentHp || Math.floor(players[lowName].maxHp);

    return players[lowName];
}

function movePlayer(p, targetArea) {
    if (p.dead) {
        systemMessage(`${p.name} is a corpse and cannot travel!`);
        return;
    }

    // 1. Set the new area
    p.area = targetArea;
    const groundLevel = 450; 

    // 2. Area-Specific Logic & Discovery Stats
    if (targetArea === "pond") {
        // Set Spawn Location
        p.x = Math.random() * 150 + 50;
        
        // Initialize stats if missing (Safety for old saves)
        if (!p.stats.pond) p.stats.pond = { visited: false, fishCaught: 0, deepDives: 0 };
        
        // Discovery Trigger (Grants Fishing Rod via checkAchievements)
        if (!p.stats.pond.visited) {
            p.stats.pond.visited = true;
            spawnFloater(p, "📍 DISCOVERED: THE POND", "#00ffff");
            systemMessage(`🌟 ${p.name} found the Mystic Pond!`);
        }
    } 
    else if (targetArea === "arena") {
        // Initialize Arena stats if missing
        if (!p.stats.arena) p.stats.arena = { wins: 0, winStreak: 0, totalMatches: 0 };
        
        // Positioning: Spectators go to the bleacher sides
        if (p.activeTask !== "pvp") {
            const side = Math.random() > 0.5 ? 1 : 0;
            p.x = side === 1 ? (Math.random() * 100 + 50) : (Math.random() * 100 + 650);
        } else {
            p.x = 400; // Fighters start center
        }
    } 
    else if (targetArea === "dungeon") {
        p.x = 400;
        // Initialize Dungeon stats if missing
        if (!p.stats.dungeon) p.stats.dungeon = { highestTier: 0, kills: 0, bossKills: 0 };
        
        if (p.stats.dungeon.highestTier === 0) {
            spawnFloater(p, "🏰 ENTERED THE DUNGEON", "#ff4444");
        }
    } 
    else {
        // Default spawn (Home or other areas)
        p.x = Math.random() * 600 + 100;
    }

    // 3. Physics & Visual Transition
    // Start slightly above the ground to trigger the "drop-in" effect
    p.y = -50; 
    p.targetY = groundLevel;
    p.targetX = null; 
    p.activeTask = "none"; // Stop current task upon travel

    // 4. Global Queue Management
    if (targetArea !== "dungeon") {
        // Remove from dungeon queue if they leave
        if (typeof dungeonQueue !== 'undefined') {
            dungeonQueue = dungeonQueue.filter(n => n !== p.name.toLowerCase());
        }
    }

    // 5. Finalize State
    // saveStats triggers checkAchievements, which checks p.stats.pond.visited
    saveStats(p); 
    systemMessage(`${p.name} traveled to ${targetArea}`);
}

// =================================================
/* ================= PLAYER TOOLTIPS =============== */
// catch mouse over/hover event of the stickmen on screen
c.addEventListener('mousemove', (e) => {
    const rect = c.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
});
// now we draw tool tip for the player we are hovering to show the stats etc of that player
function handleTooltips() {
    const tt = document.getElementById("tooltip");
    let hover = null;

    // Check Players in view
    Object.values(players).forEach(p => {
        if (p.area === viewArea && Math.hypot(p.x - mouse.x, p.y - mouse.y) < 30) hover = p;
    });

    // Check Enemies/Boss in view
    if (viewArea === "dungeon") {
        enemies.forEach(e => { if(!e.dead && Math.hypot(e.x - mouse.x, e.y - mouse.y) < 20) hover = e; });
        if (boss && !boss.dead && Math.hypot(boss.x - mouse.x, boss.y - mouse.y) < 40) hover = boss;
    }

    if (hover) {
        tt.style.display = "block";
        tt.style.left = (mouse.x + 15) + "px";
        tt.style.top = (mouse.y + 15) + "px";
        if (hover.name === "Minion" || hover.name === "DUNGEON OVERLORD") {
            tt.innerHTML = `<b style="color:#ff4444">${hover.name}</b><br>HP: ${hover.hp}/${hover.maxHp}`;
        } else {
            tt.innerHTML = `<b>${hover.name}</b> [Lv ${hover.stats.combatLevel}]<br>HP: ${hover.hp}/${hover.maxHp}<br>Task: ${hover.activeTask || 'Idle'}`;
        }
    } else { tt.style.display = "none"; }
}
let selectedPlayerForBubble = null;

c.addEventListener('click', (e) => {
    const bubble = document.getElementById("player-context-bubble");
    let clickedPlayer = null;

    // Check who we clicked
    Object.values(players).forEach(p => {
        if (p.area === viewArea && Math.hypot(p.x - mouse.x, p.y - mouse.y) < 30) {
            clickedPlayer = p;
        }
    });

    if (clickedPlayer) {
        selectedPlayerForBubble = clickedPlayer;
        showContextBubble(clickedPlayer);
    } else {
        // Hide if clicking empty ground
        bubble.classList.add('hidden');
    }
});

function showContextBubble(p) {
    const bubble = document.getElementById("player-context-bubble");
    const rect = c.getBoundingClientRect();

    bubble.classList.remove('hidden');
    document.getElementById('bubble-name').textContent = p.name;

    // Position bubble above player's head
    // We use rect.left/top to handle page scrolling
    bubble.style.left = (rect.left + p.x - (bubble.offsetWidth / 2)) + "px";
    bubble.style.top = (rect.top + p.y - 100) + "px";
}

// Wire up the bubble buttons
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('bubble-bag-btn').addEventListener('click', () => {
        if (selectedPlayerForBubble) {
            // Set the profile selector to this player so our existing UI logic works
            const selector = document.getElementById('profileSelector');
            selector.value = selectedPlayerForBubble.name;
            
            // Trigger your existing inventory toggle
            toggleInventory(); 
            
            document.getElementById("player-context-bubble").classList.add('hidden');
        }
    });

    document.getElementById('bubble-respawn-btn').addEventListener('click', () => {
        if (selectedPlayerForBubble) {
            processGameCommand(selectedPlayerForBubble.name, "respawn");
            document.getElementById("player-context-bubble").classList.add('hidden');
        }
    });
});
//===============================================

//------------------------------------------------

//------------------------------------------------
//            SPLASH TEXT
let floaters = [];
// We set color to null by default so the function knows to use p.color
function spawnFloater(p, text, color = null) {
    const name = p.name || "System";
    const area = p.area || "home";
    const x = p.x || 400;
    const y = p.y ? p.y - 60 : 300;

    // If no specific color was passed, use the player's own color
    const finalColor = color || p.color || "#0f0";

    // 1. Send to the log box
    idleActionMsg(name, `[${area.toUpperCase()}] ${text}`, finalColor);

    // 2. Push to the visual floating text
    floaters.push({ 
        text, 
        x, 
        y, 
        color: finalColor, 
        life: 150,
        area: area 
    });
}
function updateSplashText(ctx) {
    for (let i = floaters.length - 1; i >= 0; i--) {
        let f = floaters[i];
        if (f.area !== viewArea) continue; 

        ctx.save();
        ctx.globalAlpha = f.life / 100;
        ctx.fillStyle = f.color;
        ctx.font = "bold 14px monospace";
        ctx.fillText(f.text, f.x, f.y);
        
        f.y -= 1;
        f.life -= 2;
        if (f.life <= 0) floaters.splice(i, 1);
        ctx.restore();
    }
}
//---------------------------------------------------

//==================================================================
// ---- skill system ---
//lvl up and xp
function xpNeeded(lvl) { return Math.floor(50 * Math.pow(1.3, lvl)); }
function updateCombatLevel(p) {
    const s = p.stats;
    const highOffense = Math.max(s.attackLevel, s.archerLevel, s.magicLevel);
    
    // 1. Calculate Combat Level
    s.combatLevel = Math.floor((highOffense + s.healLevel + s.lurkLevel + (s.fishLevel * 0.5)) / 2);

    // 2. Calculate scaling HP
    const baseHP = 100;
    const hpBonus = (s.attackLevel * 4) + 
                    (Math.max(s.archerLevel, s.magicLevel) * 3) + 
                    (s.lurkLevel * 2) + (s.healLevel * 2) + 
                    (s.fishLevel * 1) + (s.swimLevel * 1);

    const newMax = baseHP + hpBonus;

    // 3. Update Max HP
    p.maxHp = newMax;       
    p.stats.maxhp = newMax; 

    // 4. HP SYNC & SAFETY (The New Part)
    // If the player somehow has no HP (new player), set to 75% floor
    if (p.hp === undefined || p.hp === null) {
        //p.hp = Math.floor(newMax * 0.85);
		p.hp = newMax;
    }

    // Ensure current HP never exceeds the new Max HP (important for level ups)
    if (p.hp > p.maxHp) {
        p.hp = p.maxHp;
    }

    // Push the live HP into the stats object so saveStats() writes it to LocalStorage
    p.stats.currentHp = p.hp;
	saveStats(p);
}

//===================================================================


function addItemToPlayer(playerName, itemName) {
    const p = players[playerName];
    if (!p) return;
    if (!ITEM_DB[itemName]) return;

    // 1. Initialize inventory inside STATS (where loadStats puts it)
    if (!p.stats.inventory) p.stats.inventory = [];

    // 2. Add the item to the persistent array
    p.stats.inventory.push(itemName);

    // 3. Auto-Equip Logic (Updated for all slots)
    const type = ITEM_DB[itemName].type;
    if (type === "helmet" || type === "hood") p.stats.equippedHelmet = itemName;
    if (type === "staff" || type === "weapon") p.stats.equippedWeapon = itemName;
    if (type === "cape") p.stats.equippedCape = itemName;
    if (type === "pants") p.stats.equippedPants = itemName;
    if (type === "boots") p.stats.equippedBoots = itemName;
    if (type === "gloves") p.stats.equippedGloves = itemName;
    if (type === "hair") p.stats.equippedHair = itemName;

    // 4. Feedback & Save
    idleActionMsg(`${p.name} obtained: ${itemName}`, ITEM_DB[itemName].color || "#fff");
    systemMessage(`${p.name} added [${itemName}] to inventory.`);
    saveStats(p); // Important: Save the new item immediately!
}
function clearPlayerInventory(playerName) {
    const p = players[playerName];
    if (!p) {
        console.error("Player not found!");
        return;
    }

    // 1. Reset Inventory (Always keep the Fishing Rod)
    p.stats.inventory = ["Fishing Rod"];

    // 2. Un-equip everything
    p.stats.equippedWeapon = null;
    p.stats.equippedArmor = null;
    p.stats.equippedHelmet = null;
    p.stats.equippedBoots = null;
    p.stats.equippedPants = null;
    p.stats.equippedCape = null;
    p.stats.equippedGloves = null;
    p.stats.equippedHair = null;

    // 3. Optional: Reset pixels if you want a total wipe
    // p.stats.pixels = 0;

    // 4. Save and Feedback
    saveStats(p);
    systemMessage(`System: ${playerName}'s inventory has been cleared.`);
    spawnFloater(p, "Inventory Reset", "#ff0000");
    
    // Refresh UI if needed
    if (typeof updateUI === "function") updateUI();
}
function scrubAllInventories() {
    Object.values(players).forEach(p => {
        if (p.stats && p.stats.inventory) {
            // Filter out anything that is null, undefined, or not in the ITEM_DB
            p.stats.inventory = p.stats.inventory.filter(item => item !== null && ITEM_DB[item]);
            
            // Ensure they still have a rod
            if (!p.stats.inventory.includes("Fishing Rod")) {
                p.stats.inventory.push("Fishing Rod");
            }
            saveStats(p);
        }
    });
    console.log("All inventories scrubbed of null items!");
}
//================== COMBAT ==============================
// --- COMBAT -----------------------
function performAttack(p) {
    if (p.dead) return;

    // 1. Identify Target
    let target = (p.area === "dungeon") 
        ? (enemies.find(e => !e.dead) || (boss && !boss.dead ? boss : null))
        : Object.values(players).find(pl => pl.area === "home" && !pl.dead && pl.name !== p.name);

    if (!target || target.dead) {
        p.activeTask = null;
        return;
    }

    // 2. Determine Weapon Stats
    const weapon = ITEM_DB[p.stats.equippedWeapon] || { power: 0, type: "melee", speed: 2000 };
    
    let skillType = "attack"; 
    if (weapon.type === "bow") skillType = "archer";
    if (weapon.type === "staff") skillType = "magic";

    const isRanged = (skillType !== "attack");
    const rangeNeeded = isRanged ? 250 : 60; 
    const attackSpeed = weapon.speed || 2000;

    // 3. Positioning Logic
    const dist = Math.abs(p.x - target.x);
    if (dist > rangeNeeded) {
        const offset = p.x < target.x ? -rangeNeeded + 20 : rangeNeeded - 20;
        p.targetX = target.x + offset;
    } else {
        p.targetX = null; 
        p.lean = 0;

        // 4. Attack Execution
        const now = Date.now();
        if (!p.lastAttackTime) p.lastAttackTime = 0;

        if (now - p.lastAttackTime > attackSpeed) {
            // Calculate Raw Damage (Defense is handled in applyDamage)
            let skillLvl = p.stats[skillType + "Level"] || 1;
            let rawDmg = 5 + (skillLvl * 2) + (weapon.power || 0);

            // Visual Projectiles
            if (weapon.type === "bow") {
                spawnProjectile(p.x, p.y - 15, target.x, target.y - 15, "#fff", "arrow", p.area);
            } else if (weapon.type === "staff") {
                spawnProjectile(p.x, p.y - 15, target.x, target.y - 15, weapon.color || "#00ffff", "magic", p.area);
            }

            // Apply Damage
            applyDamage(target, rawDmg);
            p.lastAttackTime = now;

            // 5. Handle Loot (Only for Dungeon Enemies)
            if (target.hp <= 0 && (target.isEnemy || target.isBoss) && !target.looted) {
                target.looted = true;
				// --- NEW: INCREMENT DUNGEON STATS ---
				if (!p.stats.dungeon) p.stats.dungeon = { highestTier: 0, kills: 0, bossKills: 0 };
				
				p.stats.dungeon.kills++;
				if (target.isBoss) p.stats.dungeon.bossKills++;
				
				// Update highest tier reached
				if (dungeonWave > p.stats.dungeon.highestTier) {
					p.stats.dungeon.highestTier = dungeonWave;
				}
				// ------------------------------------
			
                handleLoot(p, target);
            }

            // 6. Award XP
            p.stats[skillType + "XP"] = (p.stats[skillType + "XP"] || 0) + 10;
            if (p.stats[skillType + "XP"] >= xpNeeded(p.stats[skillType + "Level"])) {
                p.stats[skillType + "Level"]++;
                p.stats[skillType + "XP"] = 0;
                spawnFloater(p, `${skillType.toUpperCase()} UP!`, "#FFD700");
                updateCombatLevel(p);
            }
            

        }
    }
}
function applyDamage(target, rawAmount, color = "#f00") {
    if (target.dead) return;

    // --- 1. DEFENSE CALCULATION ---
    let totalDef = 0;
    // Check if target is a player (stats) or an enemy (equipped)
    let gearSource = target.stats || target.equipped; 
    if (gearSource) {
        // Map slots based on whether it's a Player object or Enemy object
        const slots = target.stats 
            ? ["equippedHelmet", "equippedArmor", "equippedPants", "equippedBoots"] 
            : ["helmet", "armor", "pants", "boots"];
            
        slots.forEach(s => {
            let itemName = target.stats ? target.stats[s] : target.equipped[s];
            let item = ITEM_DB[itemName];
            if (item) totalDef += (item.def || 0);
        });
    }

    // --- 2. EVASION CHECK (LURK) ---
    if (target.stats && target.stats.lurkLevel) {
        // 5% base + 1% per level, capped at 50%
        let dodgeChance = Math.min(0.50, 0.05 + (target.stats.lurkLevel * 0.01));
        if (Math.random() < dodgeChance) {
            spawnFloater(target, "MISS", "#fff");
            
            // Award Lurk XP for dodging
            target.stats.lurkXP = (target.stats.lurkXP || 0) + 5;
            if (target.stats.lurkXP >= xpNeeded(target.stats.lurkLevel)) {
                target.stats.lurkLevel++;
                target.stats.lurkXP = 0;
                spawnFloater(target, "LURK UP!", "#FFD700");
                updateCombatLevel(target);
            }
            return; // Attack missed, exit function
        }
    }

    // --- 3. FINAL DAMAGE ---
    // Subtract defense from raw amount, but ensure at least 1 damage is dealt
    let finalAmount = Math.max(1, rawAmount - totalDef);

    target.hp -= finalAmount;
	if (target.stats) {
        target.stats.currentHp = target.hp;
    }
    spawnFloater(target, `-${finalAmount}`, color);

    // --- 4. DEATH HANDLING ---
    if (target.hp <= 0) {
        target.hp = 0;
		if (target.stats) target.stats.currentHp = 0; // Sync death
        target.dead = true;
        target.activeTask = "none";
        target.deathTime = Date.now();
        target.deathStyle = Math.random() > 0.5 ? "faceplant" : "backflip";
        
        const deathMsg = target.isEnemy || target.isBoss 
            ? `${target.name} has been slain!` 
            : `${target.name} has fallen!`;
        systemMessage(deathMsg);
    }
}
//
// HEALINF
function performHeal(p, mode = "auto", target = null) {
    const healLvl = p.stats.healLevel || 1;
    const now = Date.now();

    // Cooldown check for manual commands (prevents spamming)
    if (mode !== "auto" && p.lastManualHeal && now - p.lastManualHeal < 2000) return;
    if (mode !== "auto") p.lastManualHeal = now;

    let allies = Object.values(players).filter(pl => pl.area === p.area && !pl.dead);
    
    // --- 1. CALCULATE POWER ---
    let baseAmt = 10 + (healLvl * 5); 

    if (mode === "focus" && target) {
        // STRONG SINGLE HEAL
        applyHealEffect(p, target, baseAmt, "focus");
    } 
    else if (mode === "all") {
        // WEAK TEAM HEAL
        let aoeAmt = Math.floor(baseAmt * 0.4); 
        allies.forEach(a => applyHealEffect(p, a, aoeAmt, "all"));
    } 
    else if (mode === "auto") {
        // MEDIUM AUTO HEAL (Targets lowest HP)
        let needyAllies = allies.filter(a => a.hp < a.maxHp);
        if (needyAllies.length === 0) return;
        
        needyAllies.sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp));
        let autoTarget = needyAllies[0];
        
        let autoAmt = Math.floor(baseAmt * 0.7);
        applyHealEffect(p, autoTarget, autoAmt, "auto");
    }
}

// Helper to handle the actual HP gain, XP, and Visuals
function applyHealEffect(p, target, amount, mode) {
    if (target.hp >= target.maxHp && mode !== "all") return;

    target.hp = Math.min(target.maxHp, target.hp + amount);
// SYNC: Update stats so health gain persists
    if (target.stats) {
        target.stats.currentHp = target.hp;
    }
    const healerWeapon = ITEM_DB[p.stats.equippedWeapon] || {};
    spawnProjectile(p.x, p.y - 20, target.x, target.y - 20, healerWeapon.color || "#00ffff", "magic", p.area);
    spawnFloater(target, `+${amount} HP`, "#0f0");

    // XP Award
    p.stats.healXP = (p.stats.healXP || 0) + (mode === "focus" ? 20 : (mode === "all" ? 10 : 15));

    if (p.stats.healXP >= xpNeeded(p.stats.healLevel)) {
        p.stats.healLevel++;
        p.stats.healXP = 0;
        spawnFloater(p, `HEAL LEVEL UP! (${p.stats.healLevel})`, "#FFD700");
        updateCombatLevel(p);
    }
}
//============================================================
// ============== 	FISHING STUFF ============================
// --- Fishing Merchant --------------------------------------
const merchantSettings = {
    stayMinutes: 2,    // How many minutes she stays
    cycleTotal: 28,     // Total minutes in one full loop (Stay + Away)
};
let forceBuyer = null;
let buyerActive = false;
//fish merchant----------------
function updateBuyerNPC() {
    const now = Date.now();
    
    // We use the settings here
    let cycle = Math.floor(now / 60000) % merchantSettings.cycleTotal; 
    let wasActive = buyerActive;

    if (forceBuyer !== null) {
        buyerActive = forceBuyer;
    } else {
        // If stayMinutes is 2, she is active during minute 0 and 1
        buyerActive = (cycle < merchantSettings.stayMinutes); 
    }

    if (buyerActive && !wasActive) {
        systemMessage("--- [NPC] THE FISH MERCHANT HAS ARRIVED (2X pixels)! ---");
    } else if (!buyerActive && wasActive) {
        systemMessage("--- [NPC] THE FISH MERCHANT HAS LEFT THE AREA. ---");
    }
}
// called inside drawScenery function under the pond section to update time she stays away and time she stays properly:
function drawBuyer(ctx) {
    if (!buyerActive || viewArea !== "pond") return;
    
    const bx = 115; 
    const by = 500; 
    const now = Date.now();
    
    // Smooth levitation and cloak sway
    let floatY = Math.sin(now / 800) * 6;
    let sway = Math.sin(now / 400) * 3;
    let gemPulse = 5 + Math.abs(Math.sin(now / 500)) * 10;

    ctx.save();
    ctx.translate(bx, by + floatY);

    // --- 1. THE TRAILING CAPE (Behind her, blowing slightly) ---
    ctx.fillStyle = "#2a1233"; // Very dark shadow purple
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.quadraticCurveTo(-25 + sway, 0, -15 + sway, 35);
    ctx.lineTo(5, 30);
    ctx.fill();

    // --- 2. THE LEGS ---
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-3, 10); ctx.lineTo(-5, 30);
    ctx.moveTo(3, 10); ctx.lineTo(5, 30);
    ctx.stroke();

    // --- 3. STRUCTURED CLOAK (Facing Right/Pond) ---
    // Main Cloak Body
    ctx.fillStyle = "#4B0082"; 
    ctx.beginPath();
    ctx.moveTo(0, -35); // Neck
    ctx.bezierCurveTo(-15, -20, -18, 10, -12, 25); // Back curve
    ctx.lineTo(15, 25); // Bottom front
    ctx.bezierCurveTo(8, 10, 12, -20, 0, -35); // Front curve (facing pond)
    ctx.fill();

    // pixels Trim on Cloak
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // --- 4. THE ARMS & STAFF (Staff is on the Pond side) ---
    ctx.strokeStyle = "#ffdbac"; // Hands
    ctx.lineWidth = 2.5;
    
    // Arm resting on staff (Right arm, facing pond)
    ctx.beginPath();
    ctx.moveTo(8, -15);
    ctx.lineTo(18, -5); 
    ctx.stroke();

    // The Mystic Staff
    ctx.strokeStyle = "#3e2723"; // Dark wood
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(20, 30);
    ctx.lineTo(20, -50);
    ctx.stroke();

    // Staff Gem (Glow effect)
    ctx.shadowBlur = gemPulse;
    ctx.shadowColor = "#00ffff";
    ctx.fillStyle = "#e0ffff";
    ctx.beginPath();
    ctx.arc(20, -55, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // --- 5. THE HEAD & DEEP HOOD ---
    // Inner Hood
    ctx.fillStyle = "#0a0a0a";
    ctx.beginPath();
    ctx.ellipse(2, -45, 9, 11, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Eyes (Facing the pond)
    ctx.fillStyle = "#00ffff";
    ctx.beginPath();
    ctx.arc(6, -46, 1.5, 0, Math.PI * 2);
    ctx.arc(10, -46, 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Structured Hood Outer
    ctx.fillStyle = "#4B0082";
    ctx.beginPath();
    ctx.moveTo(-8, -40);
    ctx.quadraticCurveTo(0, -65, 15, -40);
    ctx.quadraticCurveTo(18, -30, 10, -35);
    ctx.lineTo(-8, -35);
    ctx.fill();

    // --- 6. MAGICAL PARTICLES ---
    if (Math.random() > 0.85) {
        ctx.fillStyle = "#FFD700";
        let px = Math.random() * 30 - 15;
        let py = Math.random() * 50 - 25;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        ctx.arc(px, py, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }

    // --- 7. HUD LABELS ---
    ctx.restore();
    ctx.textAlign = "center";
    ctx.font = "bold 13px monospace";
    
    // Label follows the float
    let textY = by + floatY - 75;
    
    ctx.fillStyle = "black";
    ctx.fillText("MYSTERIOUS MERCHANT", bx + 1, textY + 1);
    ctx.fillStyle = "#ffff00";
    ctx.fillText("MYSTERIOUS MERCHANT", bx, textY);
    
    ctx.font = "11px monospace";
    ctx.fillStyle = "#00ffff";
    ctx.fillText("✦ 2X pixels RATE ✦", bx, textY + 14);
}


// idle actions
//xp gained by action skills
// fishing task :
/* --- FISHING RARITY MAP (Formula: roll^4 * 14) ---
  The higher the rarity, the exponentially harder it is to roll.
  
  RARITY 0-2  (Common):    ~60.0% chance   [Bass, Trout, etc.]
  RARITY 3-4  (Uncommon):  ~12.0% chance   [Salmon, Tuna]
  RARITY 5-6  (Rare):      ~8.5%  chance   [Pearl, Black Pearl]
  RARITY 7-8  (Epic):      ~6.0%  chance   [Catfish, Shark]
  RARITY 9-10 (Legendary): ~5.0%  chance   [Golden Bass]
  RARITY 11-12(Mythic):    ~4.5%  chance   [Ancient Finds]
  RARITY 13   (Godly):     ~4.0%  chance   [Fish Hat / Master Loot]

  Note: Fallback logic ensures if a high rarity roll fails to find a fish 
  in your current tier, it will give you a standard fish from your max tier.
*/
function performFish(p) {
    if (p.area !== "pond" || p.dead) return;
    
    const baitCost = 15; 
    if ((p.stats.pixels || 0) < baitCost) {
        systemMessage(`${p.name} needs more pixels for bait!`);
        p.activeTask = "none"; 
        return;
    }
    p.stats.pixels -= baitCost;

    const fishLevel = p.stats.fishLevel || 1;
    
    // Escape Chance
    if (Math.random() < Math.max(0.10, 0.40 - (fishLevel * 0.01))) {
        spawnFloater(p, "LOST IT!", "#ff6666");
        return; 
    }

    // Tier Mapping based on your requirements
    let currentTier = 1;
    if (fishLevel >= 75) currentTier = 6;
    else if (fishLevel >= 40) currentTier = 5; // Start getting Sharks
    else if (fishLevel >= 30) currentTier = 4; // Start getting Tuna
    else if (fishLevel >= 20) currentTier = 3; // Start getting Salmon
    else if (fishLevel >= 10) currentTier = 2; // Start getting Trout

    // Rarity Roll (0-13)
    let roll = Math.random();
    let selectedRarity = Math.floor(Math.pow(roll, 4) * 14); 

    // Find Clean Names from ITEM_DB
    let possibleFish = Object.keys(ITEM_DB).filter(key => {
		const item = ITEM_DB[key];
		return item.sources && item.sources.includes("fishing") && 
			   item.tier <= currentTier && 
			   item.rarity == selectedRarity;
	});

    // Fallback if rarity roll is too high for current tier
    if (possibleFish.length === 0) {
        possibleFish = Object.keys(ITEM_DB).filter(key => {
            const item = ITEM_DB[key];
            return item.type === "fish" && item.tier <= currentTier;
        });
    }

    if (possibleFish.length > 0) {
        const fishName = possibleFish[Math.floor(Math.random() * possibleFish.length)];
        const itemData = ITEM_DB[fishName];

        // Give the item (CLEAN STRING)
        p.stats.inventory.push(fishName);
		// --- INCREMENT POND STATS ---
		if (!p.stats.pond) p.stats.pond = { visited: true, fishCaught: 0, deepDives: 0 };
		p.stats.pond.fishCaught++; 
		p.stats.pond.visited = true; // Safety update
		// ----------------------------
        
        spawnFloater(p, `🎣 Caught: ${fishName}!`, itemData.color || "#44ccff");
        if (itemData.rarity >= 8) spawnLootBeam(p, itemData.rarity);
    }

    // Rare Global Chances
    if (Math.random() < 0.005) { // 0.5% chance for hat
         p.stats.inventory.push("fishhat");
         spawnFloater(p, "✨ FOUND A FISH HAT!", "#d2b48c");
         spawnLootBeam(p, 13);
    }

    // XP Logic...
    p.stats.fishXP = (p.stats.fishXP || 0) + 15;
    if (p.stats.fishXP >= xpNeeded(fishLevel) * 2) {
        p.stats.fishLevel++;
        p.stats.fishXP = 0;
        systemMessage(`[LEVEL UP] ${p.name} Fisher Lvl ${p.stats.fishLevel}!`);
		updateCombatLevel(p);
    }
}
function performSwim(p) {
    if (p.area !== "pond" || p.dead) return;
    if (p.stats.swimDistance === undefined) p.stats.swimDistance = 0;

    let roll = Math.random();
    let resultText = "";
    let floaterColor = "#00ffff"; // Cyan for swimming
    let foundItem = false;
	if (!p.stats.pond) p.stats.pond = { visited: true, fishCaught: 0, deepDives: 0 };
    p.stats.pond.visited = true;
    // 1. Rarity Logic for Diving
    if (roll < 0.005) {
        p.stats.inventory.push("Pearl");
		p.stats.pond.deepDives++; // INCREMENT
        resultText = "found a SHINING PEARL!";
        floaterColor = "#fff5e6";
        foundItem = true;
        systemMessage(`✨ ${p.name} dove deep and surfaced with a Rare Pearl!`);
    } 
    else if (roll < 0.05) {
        p.stats.inventory.push("Sea Shell");
		p.stats.pond.deepDives++; // INCREMENT
        resultText = "found a pretty Sea Shell";
        foundItem = true;
    }
    else {
        const meters = Math.floor(Math.random() * 5 + 1);
        p.stats.swimDistance += meters;
        resultText = `swam ${meters}m...`;
    }

    let displayMsg = `🏊 ${resultText}`;
    if (!foundItem) displayMsg += ` (Total: ${p.stats.swimDistance}m)`;
    
    // Updated clean call
    spawnFloater(p, displayMsg, floaterColor);
    
    // XP Logic
    p.stats.swimXP = (p.stats.swimXP || 0) + 12;
    if (p.stats.swimXP >= xpNeeded(p.stats.swimLevel || 1) * 2) {
        p.stats.swimLevel = (p.stats.swimLevel || 1) + 1; 
        p.stats.swimXP = 0;
        systemMessage(`${p.name} SWIM UP! (Lv ${p.stats.swimLevel})`);
        
        // Fixed the level-up floater here too!
        spawnFloater(p, `SWIM UP! (Lv ${p.stats.swimLevel})`, "#FFD700");
		updateCombatLevel(p);
    }


}
//------------------------------------------------------------
//xp gained over time skills
function handleDancing(p, now) {
    if (!p.lastDanceXP) p.lastDanceXP = 0;
    
    if (now - p.lastDanceXP > 5000) {
        let xpGain = 5 + (p.danceStyle * 2); 
        p.stats.danceXP += xpGain;
        p.lastDanceXP = now;

        // Using your xpNeeded function for consistency
        let nextLevelXP = xpNeeded(p.stats.danceLevel); 
        if (p.stats.danceXP >= nextLevelXP) {
            p.stats.danceLevel++;
            p.stats.danceXP = 0;
            
            // CLEAN CALL: Purple color for dancing
            spawnFloater(p, `DANCE LEVEL ${p.stats.danceLevel}!`, "#ff00ff");
            
            if (p.stats.danceLevel === 5) systemMessage(`${p.name} unlocked Style 2: The Flail!`);
            if (p.stats.danceLevel === 10) systemMessage(`${p.name} unlocked Style 3: The Lean!`);
            if (p.stats.danceLevel === 20) systemMessage(`${p.name} unlocked Style 4: The Groupy!`);
            
            updateCombatLevel(p);
        }
    }
}
function handleLurking(p, now) {
    if (!p.lastLurkXP) p.lastLurkXP = 0;
    
    if (now - p.lastLurkXP > 5000) {
        let xpGain = 8; 
        p.stats.lurkXP += xpGain;
        p.lastLurkXP = now;

        let nextLevelXP = xpNeeded(p.stats.lurkLevel);
        if (p.stats.lurkXP >= nextLevelXP) {
            p.stats.lurkLevel++;
            p.stats.lurkXP = 0;
            
            // CLEAN CALL: Dark gray for lurking
            spawnFloater(p, `LURK LEVEL ${p.stats.lurkLevel}!`, "#555555");
            updateCombatLevel(p);
        }
    }
}
// ( *if at pond & if on shore -> get in boat, and float,
// else if at fishing pond and in water->float to shore and get off boat
//rideBoat(){}; 
//add boating skill too ( helps fishing ) 

//------------------------------------------------------------
//============================================================

//============================================================
//future woodcutting/mining function sections
//chopTrees(){};
//------------------------------------------------------------
//mineRocks(){};
//------------------------------------------------------------
//buildStuff(){};
//============================================================

//============================================================
//future Lurking action function section
//goLurking(){}
//------------------------------------------------------------
//rideBoat(){}
//dockBoat(){}
//------------------------------------------------------------
//============================================================

//============================================================
//======================= ARENA AREA =======================
// --- ARENA variables ---
let arenaActive = false;
let arenaMode = "ffa"; // "1v1", "teams", "ffa"
let arenaQueue = [];
let arenaTimer = 0;
let arenaMatchInterval = null;
let pvpRankings = {}; // {playerName: {wins: 0, kills: 0, rating: 1000}}
/* const arenaConfig = {
    title: "🏆 ARENA RANKINGS",
    labels: {
        timer: (s) => `⚔️ ARENA START: ${s}s`,
        empty: "No battles fought yet...",
        count: (n) => `Players in Arena: ${n}`,
        matchActive: "● MATCH IN PROGRESS",
        matchOpen: "● ARENA OPEN"
    },
    // Keep the logic for data processing here
    getTopRankings: (limit = 5) => {
        return Object.entries(pvpRankings)
            .sort(([, a], [, b]) => b.rating - a.rating)
            .slice(0, limit);
    }
}; */
const arenaConfig = {
    minPlayers: 2,
    queueTime: 45, // seconds
    modes: ["1v1", "teams", "ffa"],
    title: "🏆 ARENA RANKINGS",
    labels: {
        timer: (s) => `⚔️ ARENA START: ${s}s`,
        empty: "No battles fought yet...",
        count: (n) => `Players in Arena: ${n}`,
        matchActive: "● MATCH IN PROGRESS",
        matchOpen: "● ARENA OPEN"
    },
    // Keep the logic for data processing here
    getTopRankings: (limit = 5) => {
        return Object.entries(pvpRankings)
            .sort(([, a], [, b]) => b.rating - a.rating)
            .slice(0, limit);
    }
};

function joinArenaQueue(p) {
    if (p.dead) return;
    if (arenaActive) {
        systemMessage("⚔️ Match in progress. You will be a spectator until it ends.");
        return;
    }

    const nameKey = p.name.toLowerCase();
    if (!arenaQueue.includes(nameKey)) {
        arenaQueue.push(nameKey);
        systemMessage(`⚔️ ${p.name} joined the queue (${arenaQueue.length}/${arenaConfig.minPlayers})`);
    }

    if (!arenaMatchInterval) {
        arenaTimer = arenaConfig.queueTime;
        arenaMatchInterval = setInterval(() => {
            arenaTimer--;
            if (arenaTimer === 10) systemMessage("⚔️ ARENA: Match starting in 10 seconds!");
            if (arenaTimer <= 0) {
                clearInterval(arenaMatchInterval);
                arenaMatchInterval = null;
                processArenaStart();
            }
        }, 1000);
    }
}

function processArenaStart() {
    if (arenaQueue.length < arenaConfig.minPlayers) {
        systemMessage("⚔️ Arena match cancelled: Not enough players.");
        arenaQueue = [];
        return;
    }

    // Determine Mode
    if (arenaQueue.length === 2) arenaMode = "1v1";
    else if (arenaQueue.length % 2 === 0 && arenaQueue.length <= 6) arenaMode = "teams";
    else arenaMode = "ffa";

    systemMessage(`⚔️ ARENA START: ${arenaMode.toUpperCase()} MODE!`);
    arenaActive = true;
    
    // Only players in the queue get to fight
    arenaQueue.forEach(name => {
        let p = players[name.toLowerCase()];
        if (p) {
            p.area = "arena";
            p.y = 540;
            p.hp = p.maxHp; 
            p.dead = false;
            p.activeTask = "pvp"; // This activates their combat AI
            p.x = 200 + Math.random() * 400;
        }
    });

    if (arenaMode === "teams") {
        arenaQueue.sort((a, b) => players[a].stats.combatLevel - players[b].stats.combatLevel);
        arenaQueue.forEach((name, i) => {
            if(players[name]) players[name].team = (i % 2 === 0) ? "Red" : "Blue";
        });
    }

    arenaQueue = []; // Reset queue for next game
}
function handlePvPLogic(p, now) {
    if (p.dead || !arenaActive) return;

    // 1. Find targets who are ALSO in the PvP task (Excludes spectators)
    let targets = Object.values(players).filter(t => 
        t.area === "arena" && 
        !t.dead && 
        t.activeTask === "pvp" && 
        t.name !== p.name
    );

    if (arenaMode === "teams") {
        targets = targets.filter(t => t.team !== p.team);
    }

    if (targets.length === 0) return;

    // 2. Find closest target
    targets.sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x));
    let target = targets[0];

    // 3. Movement vs Attack
    let dist = Math.abs(target.x - p.x);
    let range = 60; // Melee range

    if (dist > range) {
        p.targetX = target.x; // Move toward them
    } else {
        p.targetX = null; // Stay still to attack
        // Attack logic is handled by updatePlayerActions calling performPvPAttack
    }
}
function performPvPAttack(p) {
    // Find a target in the Arena
	let targets = Object.values(players).filter(target => 
		target.area === "arena" && 
		!target.dead && 
		target.activeTask === "pvp" && // CRITICAL: Only hit other fighters
		target.name !== p.name
	);

    // Team check
    if (arenaMode === "teams") {
        targets = targets.filter(t => t.team !== p.team);
    }

    if (targets.length === 0) {
        checkArenaVictory();
        return;
    }

    // Fairness Logic: Target the player closest to your own combat level
    targets.sort((a, b) => {
        let diffA = Math.abs(a.stats.combatLevel - p.stats.combatLevel);
        let diffB = Math.abs(b.stats.combatLevel - p.stats.combatLevel);
        return diffA - diffB;
    });

    let target = targets[0];
    
    // Calculate Damage
    let dmg = Math.floor(5 + (p.stats.combatLevel * 1.5));
    applyDamage(target, dmg);
    spawnFloater(target, `-${dmg}`, "#ff4444");

    if (target.dead) {
        systemMessage(`⚔️ ${p.name} eliminated ${target.name}!`);
        updatePvPRank(p.name, 1, 0); // +1 kill
		// --- NEW: INCREMENT PERSONAL ARENA STATS ---
		if (!p.stats.arena) p.stats.arena = { wins: 0, winStreak: 0, totalMatches: 0 };
		// We can't track "kills" in the arena object yet, so let's add it or use wins
		saveStats(p);
        checkArenaVictory();
    }
}



function checkArenaVictory() {
    if (!arenaActive) return;

    // 1. Identify all fighters (excluding spectators)
    const fighters = Object.values(players).filter(p => p.area === "arena" && p.activeTask === "pvp");
    const alive = fighters.filter(p => !p.dead);
    
    let winner = null;
    let winningTeam = null;

    // 2. Determine if the match is over
    if (arenaMode === "teams") {
        const redAlive = alive.filter(p => p.team === "Red");
        const blueAlive = alive.filter(p => p.team === "Blue");
        
        if (redAlive.length > 0 && blueAlive.length === 0) winningTeam = "Red";
        if (blueAlive.length > 0 && redAlive.length === 0) winningTeam = "Blue";
        
        if (winningTeam) winner = winningTeam + " Team";
    } else {
        // In FFA or 1v1, game ends when only 1 player remains
        if (alive.length === 1) winner = alive[0].name;
    }

    // 3. Process Victory Logic
    if (winner) {
        arenaActive = false;
        systemMessage(`🏆 ARENA VICTORY: ${winner} WINS!`);
        
        // 4. Update Stats for Everyone Involved
        fighters.forEach(p => {
            // Ensure the arena stats object exists
            if (!p.stats.arena) p.stats.arena = { wins: 0, winStreak: 0, totalMatches: 0 };
            
            p.stats.arena.totalMatches++;

            const isWinner = (arenaMode === "teams") ? (p.team === winningTeam) : (p.name === winner);

            if (isWinner) {
                // Winner Logic
                p.stats.arena.wins++;
                p.stats.arena.winStreak++;
                
                // Update Global Rankings (Existing logic)
                if (arenaMode !== "teams") {
                    updatePvPRank(p.name, 0, 1);
                }
                
                spawnFloater(p, "WINNER! 🔥", "#FFD700");
            } else {
                // Loser Logic
                p.stats.arena.winStreak = 0; // Reset streak on loss
            }

            // Sync and check achievements (Capes, etc)
            saveStats(p); 
        });

        // 5. Cleanup and Teleportation
        setTimeout(() => {
            fighters.forEach(p => {
                p.activeTask = "none";
                p.team = null; 
                // Return them to town or their previous area
                movePlayer(p, "town"); 
            });
            
            // Visual reset for the area
            systemMessage("⚔️ Arena has been cleared for the next match.");
        }, 5000); // 5 second delay to let winners celebrate
    }
}
function updatePvPRank(name, kill, win) {
    if (!pvpRankings[name]) pvpRankings[name] = { kills: 0, wins: 0, rating: 1000 };
    pvpRankings[name].kills += kill;
    pvpRankings[name].wins += win;
    pvpRankings[name].rating += (win * 25) + (kill * 5);
    // Save to localStorage
    localStorage.setItem("pvp_rankings", JSON.stringify(pvpRankings));
}


//============================================================
//======================= DUNGEON AREA =======================
// --- DUNGEON variables -------------------------------------
// --- DUNGEON variables -------------------------------------
let enemies = [];
let boss = null;

let dungeonQueue = [];
let dungeonTimer = null;
let dungeonActive = false;
let dungeonWave = 1;
let dungeonTier = 1; 
let dungeonSecondsLeft = 0;
let dungeonCountdownInterval = null; 
let dungeonEmptyTimer = null; 
let dungeonEmptySeconds = 0;

const dungeonUIConfig = {
    header: "PARTY STATUS",
    labels: {
        wave: (num, tier) => `WAVE ${num} (Tier ${tier})`,
        timer: (s) => `DUNGEON: ${s}s`,
        boss: (hp) => `BOSS: ${hp}%`
    },
    getStatusClass: (pct, isDead) => {
        if (isDead) return "hp-dead";
        if (pct < 30) return "hp-danger";
        return "hp-healthy";
    }
};

/**
 * SINGLE SOURCE OF TRUTH: Tier Calculation
 * Wave 1-5 = Tier 1, 6-10 = Tier 2, etc.
 */
function getTierFromWave(wave) {
    return Math.floor((wave - 1) / 5) + 1;
}

//-----------------------------------------------------------
/* --- DUNGEON LOOT RARITY MAP (Formula: roll^4 * 14) ---
   Normal Mobs follow the Standard Map. Bosses get a +3 Rarity Floor.

   [ NORMAL MOB CHANCES ]
   RARITY 0-5  (Common/Uncommon): ~80% chance 
   RARITY 6-9  (Rare/Epic):       ~12% chance  --> [Spawns Loot Beam @ 8+]
   RARITY 10-13(Legendary/Godly): ~8%  chance  --> [Spawns Loot Beam]

   [ BOSS MOB CHANCES ] (Includes +3 Rarity Bonus)
   RARITY 3-8  (Uncommon/Epic):   ~80% chance  --> [Harder to get "trash"]
   RARITY 9-12 (Legendary):       ~15% chance 
   RARITY 13   (Godly):            ~5%  chance  --> [Max Rarity capped at 13]

   TIER GATING:
   Items are locked by (Wave - 1 / 5) + 1. 
   
   GEAR STEALING:
   Independent 10% chance to steal EACH item a mob is wearing.
*/

//-- MAIN DUNGEON STUFF --
function joinDungeonQueue(p) {
    if (p.dead) return;

    const nameKey = p.name.toLowerCase();
    if (!dungeonQueue.includes(nameKey)) {
        dungeonQueue.push(nameKey);
        systemMessage(`${p.name} joined the queue (${dungeonQueue.length} total)`);
    }

    if (!dungeonCountdownInterval) {
        dungeonSecondsLeft = 60;
        systemMessage("Dungeon timer started!");

        dungeonCountdownInterval = setInterval(() => {
            dungeonSecondsLeft--;

            if (dungeonSecondsLeft === 30) {
                viewArea = "dungeon";
                const selector = document.getElementById("view-area-selector");
                if (selector) selector.value = "dungeon";
                
                areaDisplayDiv.textContent = "Dungeon";
                systemMessage("System: Sending vanguard to the dungeon floor...");

                dungeonQueue.forEach(name => {
                    let player = players[name.toLowerCase()];
                    if (player && !player.dead) {
                        player.area = "dungeon";
                        player.y = -200; 
                        player.x = 50 + Math.random() * 250; 
                        player.targetY = 540; 
                        player.targetX = null; 
                        player.activeTask = "attacking"; 
                    }
                });

                setTimeout(() => {
                    organizeDungeonRanks();
                    systemMessage("System: Get Ready!");
                }, 1500);
            }

            if (dungeonSecondsLeft <= 0) {
                clearInterval(dungeonCountdownInterval);
                dungeonCountdownInterval = null;
                startDungeon();
            }
        }, 1000);
    }
}

function organizeDungeonRanks() {
    Object.values(players).forEach(p => {
        if (p.area !== "dungeon" || p.dead) return;

        const weapon = ITEM_DB[p.stats.equippedWeapon] || { type: "melee" };
        const isRanged = (weapon.type === "bow" || weapon.type === "staff");

        if (isRanged) {
            p.targetX = 40 + Math.random() * 60; 
        } else {
            p.targetX = 160 + Math.random() * 90;
        }
    });
}

function startDungeon() {
    dungeonActive = true;
    dungeonWave = 1; 
    dungeonTier = getTierFromWave(dungeonWave);
    
    areaDisplayDiv.textContent = "Wave " + dungeonWave, "T" + dungeonTier;
    systemMessage("The Dungeon Gates have opened! The monsters are here!");
    enemies = [];
    dungeonQueue = []; 
    spawnWave();
}

function spawnWave() {
    enemies = [];
    const partySize = Object.values(players).filter(p => p.area === "dungeon" && !p.dead).length || 1;
    const isBossWave = (dungeonWave % 5 === 0);
    

	dungeonTier = getTierFromWave(dungeonWave);
    const waveSize = Math.floor(2 + (dungeonWave / 2) + (partySize - 1));
    const types = ["Slime", "StickmanHunter", "Grumble", "VoidWalker"];

    for (let i = 0; i < waveSize; i++) {
        let type = types[Math.floor(Math.random() * types.length)];
        let isStickman = (type === "StickmanHunter" || type === "VoidWalker");
        let enemyHp = (40 + (dungeonWave * 20)) * (1 + (partySize * 0.2));

        enemies.push({ 
            name: type, 
            area: "dungeon",
            hp: enemyHp, 
            maxHp: enemyHp, 
            x: 500 + (i * 60),
            y: 540, 
            dead: false,
            isEnemy: true,
            isStickman: isStickman,
            stats: { lurkLevel: 0 },
            equipped: isStickman ? generateRandomLoadout(dungeonTier) : {}
        });
    }

    if (isBossWave) {
        let bossHp = (400 + (dungeonWave * 100)) * partySize;
        boss = {
            name: "DUNGEON OVERLORD",
            area: "dungeon",
            hp: bossHp,
            maxHp: bossHp,
            x: 800,
            y: 540,
            dead: false,
            isBoss: true,
            isMonster: true,
            color: "#ff0000"
        };
        systemMessage(`⚠️ BOSS WAVE! Scaling for ${partySize} hero(es)!`);
    } else {
        boss = null;
    }
}

function checkDungeonProgress() {
    if (!dungeonActive) return;
    
    let aliveEnemies = enemies.filter(e => !e.dead).length;
    if (aliveEnemies === 0 && (!boss || boss.dead)) {
        
        // CHECK COMPLETION BEFORE INCREMENTING WAVE
        const tierFinished = getTierFromWave(dungeonWave);
        const isCompletionWave = (dungeonWave % 5 === 0);

        if (isCompletionWave) {
            Object.values(players).forEach(p => {
                if (p.area === "dungeon" && !p.dead) {
                    // Update player's highest tier record
                    if (tierFinished > p.stats.dungeon.highestTier) {
                        p.stats.dungeon.highestTier = tierFinished;
                        
                        // Now check achievements—it will find the new tier!
                        checkAchievements(p);
                        saveStats(p);
                    }
                }
            });
            systemMessage(`⭐ Tier ${tierFinished} Cleared!`);
        }

        dungeonWave++; 
        spawnWave();
    }
}

function checkDungeonFailure() {
    if (!dungeonActive) return;
    const winners = Object.values(players).filter(p => p.area === "dungeon" && !p.dead);
    
    if (winners.length === 0) {
        if (!dungeonEmptyTimer) {
            dungeonEmptySeconds = 60;
            systemMessage("⚠️ ALL HEROES HAVE FALLEN! Dungeon closing in 60s!");

            dungeonEmptyTimer = setInterval(() => {
                dungeonEmptySeconds--;
                if (dungeonEmptySeconds % 10 === 0 && dungeonEmptySeconds > 0) {
                    systemMessage(`⚠️ DUNGEON COLLAPSE: ${dungeonEmptySeconds}s remaining!`);
                }

                if (dungeonEmptySeconds <= 0) {
                    clearInterval(dungeonEmptyTimer);
                    dungeonEmptyTimer = null;
                    closeDungeon("FAILURE");
                }
            }, 1000);
        }
    } else if (dungeonEmptyTimer) {
        systemMessage("🛡️ A hero is standing! Dungeon collapse aborted.");
        clearInterval(dungeonEmptyTimer);
        dungeonEmptyTimer = null;
    }
}

function closeDungeon(reason) {
    dungeonActive = false;
    enemies = [];
    boss = null;
    
    if (dungeonEmptyTimer) {
        clearInterval(dungeonEmptyTimer);
        dungeonEmptyTimer = null;
    }

    systemMessage(reason === "FAILURE" ? "❌ DUNGEON FAILED!" : "✅ DUNGEON CLEARED!");

    Object.values(players).forEach(p => {
        if (p.area === "dungeon") {
            p.area = "town";
            p.x = 400; p.y = 550;
            p.activeTask = "none";
        }
    });

    viewArea = "town";
    const selector = document.getElementById("view-area-selector");
    if (selector) selector.value = "town";
}

function handleEnemyAttacks() {
    let dwellers = Object.values(players).filter(p => p.area === "dungeon" && !p.dead);
    if (dwellers.length === 0) return;
    
    const partyScaling = 1 + (dwellers.length - 1) * 0.1;
    let allAttackers = [...enemies];
    if (boss && !boss.dead) allAttackers.push(boss);

    allAttackers.forEach(e => {
        if (e.dead) return;

        let target = dwellers[Math.floor(Math.random() * dwellers.length)];
        let dmg = (3 + Math.floor(dungeonWave * 1.5)) * partyScaling;
        if (e.isTrainingMob) dmg = 1 + (Math.random() * 2);
        if (e.isBoss) dmg *= 2.5;

        if (e.equipped && e.equipped.weapon) {
            const weaponData = ITEM_DB[e.equipped.weapon];
            if (weaponData) {
                if (weaponData.type === "bow") {
                    spawnProjectile(e.x, e.y - 15, target.x, target.y - 15, "#fff", "arrow", "dungeon");
                } else if (weaponData.type === "staff") {
                    spawnProjectile(e.x, e.y - 15, target.x, target.y - 15, weaponData.color || "#ff00ff", "magic", "dungeon");
                }
            }
        }

        if (e.isBoss && dwellers.length > 3) {
            applyDamage(target, Math.floor(dmg));
            let secondTarget = dwellers[Math.floor(Math.random() * dwellers.length)];
            applyDamage(secondTarget, Math.floor(dmg));
            spawnProjectile(e.x, e.y - 40, secondTarget.x, secondTarget.y - 15, "#ff0000", "magic", "dungeon");
        } else {
            applyDamage(target, Math.floor(dmg)); 
        }
    });
}

function getBestAvailableTier(type, desiredTier) {
    const allItemsOfType = Object.values(ITEM_DB).filter(i => i.type === type);
    if (allItemsOfType.length === 0) return [];
    const maxExistingTier = Math.max(...allItemsOfType.map(i => i.tier || 1));
    const targetTier = Math.min(desiredTier, maxExistingTier);

    return Object.keys(ITEM_DB).filter(key => {
        const item = ITEM_DB[key];
        return item.type === type && item.tier === targetTier;
    });
}

function generateRandomLoadout(tier) {
    const weaponPool = Object.keys(ITEM_DB).filter(key => {
        const i = ITEM_DB[key];
        const isWeaponType = (i.type === "weapon" || i.type === "bow" || i.type === "staff");
        return isWeaponType && i.tier === tier;
    });

    const headPool  = getBestAvailableTier("helmet", tier);
    const armorPool = getBestAvailableTier("armor", tier);
    const legPool   = getBestAvailableTier("pants", tier);

    const pick = (pool) => {
        if (!pool || pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    };

    return {
        weapon: pick(weaponPool),
        helmet: pick(headPool),
        armor:  Math.random() < 0.7 ? pick(armorPool) : null,
        pants:  Math.random() < 0.7 ? pick(legPool) : null
    };
}

function handleLoot(p, target) {
    const currentTier = getTierFromWave(dungeonWave);
    let lootFound = [];

    if (target.isTrainingMob) {
        p.stats.pixels += 5;
        spawnFloater(p, "+5px (Training)", "#888");
        saveStats(p);
        return;
    }

    if (target.equipped) {
        Object.values(target.equipped).forEach(itemName => {
            if (itemName && Math.random() < 0.10) lootFound.push(itemName);
        });
    }

    if (lootFound.length === 0) {
        let roll = Math.random();
        let selectedRarity = Math.floor(Math.pow(roll, 4) * 14); 
        if (target.isBoss) selectedRarity = Math.min(13, selectedRarity + 3);

        let possibleLoot = Object.keys(ITEM_DB).filter(key => {
            const item = ITEM_DB[key];
            return item.sources && item.sources.includes("dungeon") && 
                   item.tier <= currentTier && 
                   item.rarity == selectedRarity;
        });

        if (possibleLoot.length === 0) {
            possibleLoot = Object.keys(ITEM_DB).filter(key => {
                const item = ITEM_DB[key];
                return item.sources && item.sources.includes("dungeon") && 
                       item.tier <= currentTier && 
                       item.rarity < selectedRarity;
            });
        }

        if (possibleLoot.length > 0) {
            lootFound.push(possibleLoot[Math.floor(Math.random() * possibleLoot.length)]);
        }
    }

    lootFound.forEach(finalItem => {
        if (!p.stats.inventory.includes(finalItem)) {
            p.stats.inventory.push(finalItem);
            const rarity = ITEM_DB[finalItem].rarity || 0;
            spawnFloater(p, `✨ ${finalItem}!`, `hsl(${Math.min(300, rarity * 25)}, 80%, 60%)`);
            systemMessage(`${p.name} found: ${finalItem} (Rarity ${rarity})`);
            spawnLootBeam(p, rarity);
        } else {
            let scrapValue = Math.floor((ITEM_DB[finalItem].value || 50) * 0.2);
            p.stats.pixels += scrapValue;
            spawnFloater(p, `+${scrapValue}px (Duplicate)`, "#888");
        }
    });

    p.stats.pixels += (10 * currentTier);
    saveStats(p);
}

let lootBeams = [];
function spawnLootBeam(p, rarity) {
    if (rarity < 8) return;
    const hue = Math.min(300, rarity * 25);
    lootBeams.push({
        x: p.x, y: p.y + 20,
        alpha: 1.0,
        color: `hsla(${hue}, 100%, 50%, `,
        width: 10 + (rarity * 2)
    });
}

function drawLootBeams(ctx) {
    for (let i = lootBeams.length - 1; i >= 0; i--) {
        let b = lootBeams[i];
        let grad = ctx.createLinearGradient(b.x, b.y, b.x, b.y - 600);
        grad.addColorStop(0, b.color + b.alpha + ")");
        grad.addColorStop(1, b.color + "0)");
        ctx.fillStyle = grad;
        ctx.globalCompositeOperation = "lighter";
        ctx.fillRect(b.x - b.width/2, b.y - 600, b.width, 600);
        ctx.globalCompositeOperation = "source-over";
        b.alpha -= 0.02;
        if (b.alpha <= 0) lootBeams.splice(i, 1);
    }
}

function updateDungeonIdleTraining() {
    if (dungeonActive) return;
    const dwellers = Object.values(players).filter(p => p.area === "dungeon" && !p.dead);
    if (dwellers.length === 0) {
        enemies = [];
        return;
    }

    if (enemies.filter(e => !e.dead).length === 0) {
        const avgCombat = dwellers.reduce((sum, p) => sum + (p.stats.combatLevel || 1), 0) / dwellers.length;
        const count = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < count; i++) {
            let trainingHp = 100 + (avgCombat * 50);
            enemies.push({
                name: "Dungeon Stray",
                area: "dungeon",
                hp: trainingHp,
                maxHp: trainingHp,
                x: 500 + (i * 80),
                y: 540,
                dead: false,
                isEnemy: true,
                isTrainingMob: true,
                stats: { lurkLevel: 0 },
                equipped: {} 
            });
        }
        systemMessage(`🛡️ Training Mobs spawned (Avg Lvl ${Math.floor(avgCombat)})`);
    }
}
//=========================================================================
/* ======================== DRAWING ======================================= */

// ---PROJECTILES ----


const projectiles = []; // Rename from arrows

function spawnProjectile(startX, startY, endX, endY, color, type, area) {
    projectiles.push({ 
        x: startX, 
        y: startY, 
        tx: endX, 
        ty: endY, 
        life: 30, 
        color, 
        type, 
        area // Store the area (e.g., "dungeon", "home", "arena")
    });
}

function drawProjectiles(ctx) {
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let prj = projectiles[i];
        
        // Update logic (always happens)
        prj.x += (prj.tx - prj.x) * 0.15;
        prj.y += (prj.ty - prj.y) * 0.15;
        prj.life--;

        // Clean up dead projectiles
        if (prj.life <= 0) {
            projectiles.splice(i, 1);
            continue;
        }

        // --- FILTER VIEW ---
        // Only draw if the projectile's area matches the viewArea
        if (prj.area !== viewArea) continue;

        ctx.save();
        ctx.strokeStyle = prj.color;
        ctx.globalAlpha = prj.life / 30;
        
        if (prj.type === "arrow") {
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(prj.x, prj.y);
            ctx.lineTo(prj.x + (prj.tx > prj.x ? 15 : -15), prj.y);
            ctx.stroke();
        } else {
            // Magic Bolt
            ctx.shadowBlur = 10;
            ctx.shadowColor = prj.color;
            ctx.fillStyle = prj.color;
            ctx.beginPath();
            ctx.arc(prj.x, prj.y, 4, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }
}
/*----------------------------------------------*/

function updatePhysics(p) {
    const groundLevel = 540; // Feet will touch the 475 floor line

    // --- STATE 1: FALLING (Area Entry) ---
    // This handles the 'drop-in' effect when traveling
    if (p.targetY !== undefined && p.targetY !== null) {
        if (p.y < p.targetY) {
            p.y += 12; // Falling speed
            p.lean = 0.1; 
            return; // STOP: Don't allow horizontal movement while in mid-air
        } else {
            p.y = p.targetY;
            p.targetY = null; // Successfully landed
            spawnFloater(p, "LANDED!", "#fff");
            if (window.shakeAmount !== undefined) window.shakeAmount = 5; // Tiny landing thud
        }
    }

    // --- STATE 2: EMERGENCY FLOOR CHECK ---
    // If a player somehow ends up at y=150 (the old bug), 
    // this will pull them down to the actual floor.
    if (!p.targetY && p.y < groundLevel) {
        p.y += 5; 
        if (p.y > groundLevel) p.y = groundLevel;
    }

    // --- STATE 3: WALKING (Horizontal) ---
    if (p.targetX !== null && p.targetX !== undefined) {
        let oldX = p.x;
        let dx = p.targetX - p.x;
        
        // Use a small buffer (5px) to prevent "shaking" at the destination
        if (Math.abs(dx) > 5) {
            p.x += dx * 0.1; // Smooth easing
            p.lean = dx > 0 ? 0.2 : -0.2; // Lean into the movement

            // Pond Water Interactions
            if (p.area === "pond") {
                // Trigger splash when crossing the shore line (x=250)
                if ((oldX <= 250 && p.x > 250) || (oldX > 250 && p.x <= 250)) {
                    if (typeof triggerSplash === "function") triggerSplash(p);
                }
            }
        } else {
            p.x = p.targetX; // Snap exactly to target
            p.lean = 0;
            
            // Logic: Only clear targetX if we aren't currently in a combat task
            // This prevents AI from "forgetting" their target during Arena/Dungeon fights
            if (p.activeTask !== "attacking" && p.activeTask !== "pvp") {
                p.targetX = null;
            }
        }
    }

    // --- STATE 4: SEPARATION (Crowd Control) ---
    // Only resolve crowding if the player is actually on the ground
    if (p.y >= groundLevel) {
        resolveCrowding(p);
    }
}
function resolveCrowding(p) {
    const bubble = 35; // Increased slightly for clarity
    Object.values(players).forEach(other => {
        if (other === p || other.area !== p.area || other.dead || other.targetY !== undefined) return;

        let dx = p.x - other.x;
        if (Math.abs(dx) < bubble) {
            let force = (bubble - Math.abs(dx)) * 0.15;
            
            // TACTICAL AWARENESS: 
            // If p is Melee and other is Ranged, Melee has "priority" 
            // and will push the Ranged unit backward more easily.
            const pWeapon = ITEM_DB[p.stats.equippedWeapon] || { type: "melee" };
            const oWeapon = ITEM_DB[other.stats.equippedWeapon] || { type: "melee" };
            
            if (pWeapon.type === "melee" && (oWeapon.type === "bow" || oWeapon.type === "staff")) {
                p.x += dx > 0 ? force * 0.5 : -force * 0.5; // Melee moves less
                other.x += dx > 0 ? -force * 1.5 : force * 1.5; // Ranged gets pushed more
            } else {
                p.x += dx > 0 ? force : -force;
            }
        }
    });
}
function triggerSplash(p) {
    // We pass 'p' so the floater knows the name, area, and position
    spawnFloater(p, "💦 SPLASH!", "#44ccff");
    
    // If you have sound:
    // playSound("splash"); 
}
// ==============================================
// =-===--===-- DRRAW STICKMEN ---===---===---===-=
// ----------------------------------------------
/* Draw Equipment functions */
// --- 1. HAIR & HOODS (Head Layers) ---

// 1. The Hair Coordinator
function drawHair(ctx, p, bodyY, lean) {
    const item = ITEM_DB[p.stats.equippedHair];
    if (!item) return;
    const hX = p.x + (lean * 20);
    const hY = p.y - 30 + bodyY;
    drawHeadLayer(ctx, hX, hY, item, p);
}

// 2. The Helmet Coordinator
function drawHelmetItem(ctx, p, bodyY, lean) {
    const item = ITEM_DB[p.stats.equippedHelmet];
    if (!item) return;
    const hX = p.x + (lean * 20);
    const hY = p.y - 30 + bodyY; 
    drawHeadLayer(ctx, hX, hY, item, p);
}

// 3. The Painter (Logic & Style)
function drawHeadLayer(ctx, hX, hY, item, p) {
    if (!item) return;
    
    const style = item.style || "hair";
    const helmetName = p.stats.equippedHelmet ? p.stats.equippedHelmet.toLowerCase() : "";

    const finalColor = (p.stats.wigColor && (item.type === "hair" || helmetName === "wig")) 
        ? p.stats.wigColor 
        : (item.color || "#614126");

    ctx.save();
    const drawFn = HAT_STYLES[style] || HAT_STYLES["hair"];
    drawFn(ctx, hX, hY, finalColor);
    ctx.restore();
}

// --- 2. CAPES (Drawn behind the stickman) ---
function drawCapeItem(ctx, p, anchors) {
	const item = ITEM_DB[p.stats.equippedCape];
	if (!item) return;
    const headX = anchors.headX;

    const centerX = p.x + (anchors.lean * 10);
    ctx.fillStyle = item.color || "#666";
    ctx.beginPath();
    // Start at neck (Higher up than before)
    ctx.moveTo(headX, p.y - 40 + anchors.bodyY); 
    // Left side of cape
    ctx.quadraticCurveTo(headX - 25, p.y + 10 + anchors.bodyY, centerX - 18, p.y + 22 + anchors.bodyY);
    // Bottom edge
    ctx.lineTo(centerX + 10, p.y + 15 + anchors.bodyY);
    // Right side of cape back to neck
    ctx.quadraticCurveTo(headX + 25, p.y + 10 + anchors.bodyY, headX, p.y - 10 + anchors.bodyY);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)"; // Softer outline for capes
    ctx.stroke();

}
// --- 3. armor drawn over body ---
function drawArmor(ctx, p, anchors) {
    const item = ITEM_DB[p.stats.equippedArmor];
    if (!item) return;
    const headX = anchors.headX;
    const hipX = p.x + (anchors.lean * 5);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(headX - 7, p.y - 18 + anchors.bodyY); 
    ctx.lineTo(headX + 7, p.y - 18 + anchors.bodyY); 
    ctx.lineTo(hipX + 7, p.y + 8 + anchors.bodyY);    
    ctx.lineTo(hipX - 7, p.y + 8 + anchors.bodyY);    
    ctx.closePath();
    ctx.fillStyle = item.color;
    ctx.globalAlpha = 0.8;
    ctx.fill();
    ctx.globalAlpha = 1.0;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}

// --- 4. PANTS (Drawn over the legs) ---
function drawPantsItem(ctx, p, anchors, leftFoot, rightFoot, item) {
    ctx.save();
    ctx.strokeStyle = item.color || "#333";
    ctx.lineWidth = 5; 
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(p.x, anchors.hipY);
    ctx.lineTo(leftFoot.x, leftFoot.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(p.x, anchors.hipY);
    ctx.lineTo(rightFoot.x, rightFoot.y);
    ctx.stroke();
    ctx.restore();
}

// --- 5. BOOTS ---
function drawBoots(ctx, p, leftFoot, rightFoot) {
    const item = ITEM_DB[p.stats.equippedBoots];
    if (!item) return;
    ctx.save();
    ctx.fillStyle = item.color || "#444";
    ctx.strokeStyle = "#000"; 
    ctx.lineWidth = 1;
    ctx.fillRect(leftFoot.x - 4, leftFoot.y - 2, 8, 5); 
    ctx.strokeRect(leftFoot.x - 4, leftFoot.y - 2, 8, 5);
    ctx.fillRect(leftFoot.x - 2, leftFoot.y - 6, 4, 5); 
    ctx.fillRect(rightFoot.x - 4, rightFoot.y - 2, 8, 5);
    ctx.strokeRect(rightFoot.x - 4, rightFoot.y - 2, 8, 5);
    ctx.fillRect(rightFoot.x - 2, rightFoot.y - 6, 4, 5);
    ctx.restore();
}

// --- 6. GLOVES (Fixed: Save/Restore prevents lineWidth leakage) ---
function drawGlovesItem(ctx, handX, handY, item) {
    ctx.save();
    ctx.fillStyle = item.color || "#fff";
    ctx.lineWidth = 1; 
    ctx.beginPath();
    ctx.arc(handX, handY, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#000"; 
    ctx.stroke();
    ctx.restore();
}

// --- ENEMY SPECIFIC DRAWING EQUIVALENTS ---

function drawEnemyArmor(ctx, e, anchors, item) {
    if (!item) return;
    const headX = anchors.headX;
    const hipX = e.x + (anchors.lean * 5);

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(headX - 7, e.y - 18 + anchors.bodyY); 
    ctx.lineTo(headX + 7, e.y - 18 + anchors.bodyY); 
    ctx.lineTo(hipX + 7, e.y + 8 + anchors.bodyY);    
    ctx.lineTo(hipX - 7, e.y + 8 + anchors.bodyY);    
    ctx.closePath();
    ctx.fillStyle = item.color || "#777";
    ctx.globalAlpha = 0.9; 
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
}

function drawEnemyPants(ctx, e, anchors, leftFoot, rightFoot, item) {
    if (!item) return;
    ctx.save();
    ctx.strokeStyle = item.color || "#333";
    ctx.lineWidth = 5; 
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(e.x, anchors.hipY);
    ctx.lineTo(leftFoot.x, leftFoot.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.x, anchors.hipY);
    ctx.lineTo(rightFoot.x, rightFoot.y);
    ctx.stroke();
    ctx.restore();
}

function drawEnemyHeadgear(ctx, e, anchors, item) {
    if (!item) return;
    // Determine if it's hair or a helmet based on the item type
    const style = item.style || (item.type === "hair" ? "hair" : "helmet");
    const hX = e.x + (anchors.lean * 20);
    const hY = e.y - 30 + anchors.bodyY;
    
    ctx.save();
    // Use your existing HAT_STYLES library
    const drawFn = HAT_STYLES[style] || HAT_STYLES["hair"];
    drawFn(ctx, hX, hY, item.color || "#444");
    ctx.restore();
}
// --- Draw weapons ---
function drawWeaponItem(ctx, p, now, anchors, hX, hY) {
    let weaponName = p.stats.equippedWeapon;
    let item = ITEM_DB[weaponName];
    
    // Virtual tools for tasks
    if (p.activeTask === "woodcutting" && !item) item = { type: "axe", style: "axe" };
    if (p.activeTask === "mining" && !item) item = { type: "pickaxe", style: "pickaxe" };
    if (p.activeTask === "fishing") item = item || { type: "fishing_rod", style: "fishing_rod" };   
    
    if (!item) return;

    ctx.save();
    ctx.translate(hX, hY);

    const style = item.style || item.type || "sword";
    const drawFn = WEAPON_STYLES[style] || WEAPON_STYLES["sword"];

    // COMBAT/ACTION CHECK: 
    const isAttacking = (p.activeTask === "attacking");
    const isWorking = ["woodcutting", "mining"].includes(p.activeTask);
    const isFishing = (p.activeTask === "fishing");
    const useActiveAnim = isAttacking || isWorking || isFishing;

    drawFn(ctx, item, useActiveAnim, now, p, anchors.bodyY, anchors.lean);
    ctx.restore();
}

// --- drawEquipment ---
function drawEquipment(ctx, p, now, anchors, leftHand, rightHand, leftFoot, rightFoot, shouldHoldWeapon) {
    // 1. Draw items behind/on body
    if (p.stats.equippedPants) drawPantsItem(ctx, p, anchors, leftFoot, rightFoot, ITEM_DB[p.stats.equippedPants]);
    if (p.stats.equippedArmor) drawArmor(ctx, p, anchors); 

    if (p.stats.equippedGloves) {
        const gloveItem = ITEM_DB[p.stats.equippedGloves];
        drawGlovesItem(ctx, leftHand.x, leftHand.y, gloveItem);
        drawGlovesItem(ctx, rightHand.x, rightHand.y, gloveItem);
    }

    // 2. Draw Weapon/Tool
    const isTask = ["woodcutting", "mining", "fishing", "swimming", "lurking"].includes(p.activeTask);
    if (shouldHoldWeapon || isTask) {
        drawWeaponItem(ctx, p, now, anchors, rightHand.x, rightHand.y);
    }

    // 3. Draw Head Layers (Original coordinator logic)
    if (p.stats.equippedHair) drawHair(ctx, p, anchors.bodyY, anchors.lean);
    if (p.stats.equippedHelmet) drawHelmetItem(ctx, p, anchors.bodyY, anchors.lean);

    // 4. Draw Feet
    if (p.stats.equippedBoots) drawBoots(ctx, p, leftFoot, rightFoot);
}

// --- HELPERS ---
function getAnimationState(p, now) {
    let anim = { bodyY: 0, armMove: 0, lean: p.lean || 0, pose: null };
    
    // Swimming Depth
    if (p.activeTask === "swimming" && p.area === "pond" && p.x > 250) {
        const bobbing = Math.sin(now / 400) * 5; 
        anim.bodyY = 60 + bobbing; 
    }

    // Lurking Pose (The Crouch)
    if (p.activeTask === "lurking") {
        const breathe = Math.sin(now / 1000) * 3;
        anim.bodyY = 15 + breathe; // Sit lower to the ground
        anim.lean = 0.3; // Lean forward slightly
    }

    if (p.activeTask === "dancing" && DANCE_LIBRARY[p.danceStyle]) {
        anim = { ...anim, ...DANCE_LIBRARY[p.danceStyle](now, p) };
    }

    return anim;
}
function getAnchorPoints(p, anim) {
    return {
        headX: p.x + (anim.lean * 20),
        headY: p.y - 30 + anim.bodyY,
        get shoulderY() { return this.headY + 15; },
        hipY: p.y + 0 + anim.bodyY,
        lean: anim.lean,
        bodyY: anim.bodyY
    };
}

function getLimbPositions(p, anchors, anim, now) {
    // Explicitly check for swimming first so it doesn't default to "action"
    let activePose = anim.pose || p.forcedPose;

// If it's an enemy, it's usually in "action" pose if near a player
    if (!activePose) {
        if (p.isEnemy) activePose = "action"; 
        else if (p.activeTask === "swimming") activePose = "swimming";
        else if (p.activeTask === "fishing") activePose = "fishing";
        else if (["attacking", "woodcutting", "mining"].includes(p.activeTask)) activePose = "action";
    }
    let leftHand = { x: anchors.headX - 18, y: anchors.shoulderY + 10 + anim.armMove };
    let rightHand = { x: anchors.headX + 18, y: anchors.shoulderY + 10 - anim.armMove };

    // Apply the Pose Overrides (This makes the circular arm motion work)
    if (activePose && POSE_LIBRARY[activePose]) {
        const overrides = POSE_LIBRARY[activePose]({ x: anchors.headX, y: anchors.headY }, p, anim);
        if (overrides.left) leftHand = overrides.left;
        if (overrides.right) rightHand = overrides.right;
    }

    const walk = (p.targetX !== null) ? Math.sin(now / 100) * 10 : 0;
    const footY = p.y + 25 + anim.bodyY; // Keep feet attached to the sunken body

    return {
        leftHand, rightHand,
        leftFoot: { x: p.x - 10 - walk, y: footY },
        rightFoot: { x: p.x + 10 + walk, y: footY }
    };
}

function drawStickmanBody(ctx, p, anchors, limbs) {
    const style = BODY_PARTS["stick"]; 
    ctx.save();
    ctx.strokeStyle = p.color; 
    ctx.lineWidth = 3; // Standard stickman thickness
// If they are swimming in the water (x > 250), we submerge them
    const isDeep = (p.area === "pond" && p.x > 250);
    style.head(ctx, anchors.headX, anchors.headY, p);
    style.torso(ctx, anchors.headX, anchors.headY, p.x, anchors.hipY); 
	//arms
    style.limbs(ctx, anchors.headX, anchors.shoulderY, limbs.leftHand.x, limbs.leftHand.y); 
    style.limbs(ctx, anchors.headX, anchors.shoulderY, limbs.rightHand.x, limbs.rightHand.y);
	//legs
    style.limbs(ctx, p.x, anchors.hipY, limbs.leftFoot.x, limbs.leftFoot.y); 
    style.limbs(ctx, p.x, anchors.hipY, limbs.rightFoot.x, limbs.rightFoot.y);
	if (isDeep) {
        ctx.globalAlpha = 0.3; // Make legs "underwater"
    }
    ctx.restore();
}

// --- MAIN FUNCTIONS ---
function drawStickman(ctx, p) {
    if (p.area !== viewArea) return;
    const now = Date.now();
    if (p.dead) return drawCorpse(ctx, p, now);
	ctx.save(); 

    if (p.activeTask === "lurking") {
        // Apply transparency to everything drawn until ctx.restore()
        let alpha = Math.max(0.1, 0.7 - (p.stats.lurkLevel * 0.015));
        ctx.globalAlpha = alpha + (Math.sin(now / 500) * 0.05);
    }
    const anim = getAnimationState(p, now);
    const anchors = getAnchorPoints(p, anim);
    const limbs = getLimbPositions(p, anchors, anim, now);

	// Everything inside here (Cape, Body, Items) will now be transparent!
    if (p.stats.equippedCape) drawCapeItem(ctx, p, anchors);
	

	
    drawStickmanBody(ctx, p, anchors, limbs);
    renderEquipmentLayer(ctx, p, now, anchors, limbs.leftHand, limbs.rightHand, limbs.leftFoot, limbs.rightFoot);
// --- HP & NAME ---
    ctx.textAlign = "center";
    
    // 1. Draw Name (stays at p.y + 40)
    ctx.fillStyle = "#fff"; 
    ctx.font = "12px monospace"; 
    ctx.fillText(p.name, p.x, p.y + 40);

    // 2. Draw HP Bar Background (Moved to p.y + 48)
    ctx.fillStyle = "#444"; 
    ctx.fillRect(p.x - 20, p.y + 48, 40, 4);

    // 3. Draw HP Bar Fill (Moved to p.y + 48)
    ctx.fillStyle = "#0f0"; 
    ctx.fillRect(p.x - 20, p.y + 48, 40 * (p.hp / p.maxHp), 4);

    ctx.restore(); // Stop being transparent
}

function drawEnemyStickman(ctx, e) {
    if (e.area !== viewArea || e.dead) return;
    const now = Date.now();

    const anim = { bodyY: Math.sin(now / 200) * 2, armMove: 0, lean: -0.2 }; 
    const anchors = getAnchorPoints(e, anim); 
    const limbs = getLimbPositions(e, anchors, anim, now);

    ctx.save();
    // Flip Logic: Mirroring the body
    ctx.translate(e.x, 0); 
    ctx.scale(-1, 1); 
    ctx.translate(-e.x, 0); 

    ctx.strokeStyle = (e.name === "VoidWalker") ? "#a020f0" : "#ff4444"; 
    ctx.lineWidth = 1;
    drawStickmanBody(ctx, e, anchors, limbs);

    if (e.equipped) {
        if (e.equipped.pants) drawEnemyPants(ctx, e, anchors, limbs.leftFoot, limbs.rightFoot, ITEM_DB[e.equipped.pants]);
        if (e.equipped.armor) drawEnemyArmor(ctx, e, anchors, ITEM_DB[e.equipped.armor]);
        if (e.equipped.helmet) drawEnemyHeadgear(ctx, e, anchors, ITEM_DB[e.equipped.helmet]);
        if (e.equipped.gloves) {
            drawGlovesItem(ctx, limbs.leftHand.x, limbs.leftHand.y, ITEM_DB[e.equipped.gloves]);
            drawGlovesItem(ctx, limbs.rightHand.x, limbs.rightHand.y, ITEM_DB[e.equipped.gloves]);
        }
        if (e.equipped.weapon) {
            let weapon = ITEM_DB[e.equipped.weapon];
            ctx.save();
            ctx.translate(limbs.rightHand.x, limbs.rightHand.y);
            const drawFn = WEAPON_STYLES[weapon.style || weapon.type] || WEAPON_STYLES["sword"];
            drawFn(ctx, weapon, true, now, e, anchors.bodyY, anchors.lean);
            ctx.restore();
        }
    }
    ctx.restore(); // Exit mirroring before drawing text!

    // --- ENEMY NAME & HP BAR ---
    ctx.textAlign = "center";
    ctx.fillStyle = "#ff4444"; // Reddish name for enemies
    ctx.font = "bold 12px monospace";
    ctx.fillText(e.name, e.x, e.y + 40);

    // HP Bar
    ctx.fillStyle = "#444"; 
    ctx.fillRect(e.x - 20, e.y + 48, 40, 4);
    ctx.fillStyle = "#f00"; // Red fill for enemies
    ctx.fillRect(e.x - 20, e.y + 48, 40 * (e.hp / e.maxHp), 4);
}

function drawMonster(ctx, m) {
    if (m.dead) return;
    ctx.save();
    const bob = Math.sin(Date.now() / 200) * 5;
    const scale = m.isBoss ? 2.5 : 1;

    ctx.translate(m.x, m.y + bob);
    ctx.scale(scale, scale);

    // Simple Slime/Blob Body
    ctx.fillStyle = m.color || "#00ff00";
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Aggressive Eyes
    ctx.fillStyle = "white";
    ctx.beginPath();
    ctx.arc(-7, -5, 5, 0, Math.PI * 2); ctx.arc(7, -5, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "black";
    ctx.fillRect(-9, -6, 4, 4); ctx.fillRect(5, -6, 4, 4);

    ctx.restore(); // Restore before text so scale doesn't mess up font size

    // --- MONSTER NAME & HP BAR ---
    ctx.textAlign = "center";
    ctx.fillStyle = m.isBoss ? "#ff00ff" : "#fff"; // Bosses get a special color name
    ctx.font = m.isBoss ? "bold 14px monospace" : "12px monospace";
    
    // Position text slightly lower if it's a big boss
    const textYOffset = m.isBoss ? 60 : 35;
    ctx.fillText(m.name, m.x, m.y + textYOffset);

    // HP Bar
    ctx.fillStyle = "#444";
    ctx.fillRect(m.x - 25, m.y + textYOffset + 8, 50, 5);
    ctx.fillStyle = "#ff0000";
    ctx.fillRect(m.x - 25, m.y + textYOffset + 8, 50 * (m.hp / m.maxHp), 5);
}

function renderEquipmentLayer(ctx, p, now, anchors, leftHand, rightHand, leftFoot, rightFoot) {
    const weaponItem = ITEM_DB[p.stats.equippedWeapon];
    const task = p.activeTask || "none";
    let shouldHoldWeapon = (task === "attacking") || (["none", "lurking"].includes(task) && !p.manualSheath);

    if (weaponItem && !shouldHoldWeapon) {
        drawSheathedWeapon(ctx, p, anchors, weaponItem);
    }
    drawEquipment(ctx, p, now, anchors, leftHand, rightHand, leftFoot, rightFoot, shouldHoldWeapon);
}

function drawSheathedWeapon(ctx, p, anchors, item) {
    ctx.save();
    ctx.translate(p.x - 5 - (anchors.lean * 5), p.y - 5 + anchors.bodyY);
    ctx.rotate(Math.PI / 1.2);
    ctx.globalAlpha = 0.6;
    const style = item.style || item.type || "sword";
    const drawFn = WEAPON_STYLES[style] || WEAPON_STYLES["sword"];
    ctx.scale(0.8, 0.8);
    drawFn(ctx, item, false, 0); 
    ctx.restore();
}

function drawCorpse(ctx, p, now) {
    const timeSinceDeath = now - p.deathTime;
    const progress = Math.min(1, timeSinceDeath / 800);
    ctx.save();
    ctx.fillStyle = "rgba(180, 0, 0, 0.6)";
    const poolSize = progress * 25;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 25, poolSize, poolSize / 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(p.x, p.y + (progress * 20));
    let rot = p.deathStyle === "faceplant" ? (Math.PI / 2) * progress : (-Math.PI / 2) * progress;
    ctx.rotate(rot);

    const deadAnchors = { headX: 0, headY: -30, shoulderY: -15, hipY: 10, lean: 0, bodyY: 0 };
    const deadLimbs = { leftHand: { x: -18, y: 0 }, rightHand: { x: 18, y: 0 }, leftFoot: { x: -10, y: 25 }, rightFoot: { x: 10, y: 25 } };

    const corpseActor = { ...p, x: 0, y: 0 }; 
    drawStickmanBody(ctx, corpseActor, deadAnchors, deadLimbs);

    ctx.save();
    ctx.strokeStyle = "#000000"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(-6, -33); ctx.lineTo(-2, -27); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-2, -33); ctx.lineTo(-6, -27); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(2, -33); ctx.lineTo(6, -27); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6, -33); ctx.lineTo(2, -27); ctx.stroke();
    ctx.restore();

    renderEquipmentLayer(ctx, corpseActor, now, deadAnchors, deadLimbs.leftHand, deadLimbs.rightHand, deadLimbs.leftFoot, deadLimbs.rightFoot);
    ctx.restore();
}
//-------------------------------------------

//===============================================================================
// ================= DRAWING THE SCENERY AND AREAS ===========
/* const backgrounds = {
    home: "#1a1a2e",
    town: "#1e272e",
    dungeon: "#160a0a",
    arena: "#000000",
    pond: "#0a1612"
}; */
const backgrounds = {
    home: "",
    town: "",
    dungeon: "",
    arena: "",
    pond: ""
};
/* function drawScenery(ctx) {
    const now = Date.now();

    if (viewArea === "home") {
        ctx.fillStyle = "#252545";
        ctx.fillRect(0, 475, c.width, 125);
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        for(let i=0; i<10; i++) {
            let x = (i * 100 + (now/50)) % c.width;
            ctx.fillRect(x, 100 + (i*20), 2, 2);
        }

    } else if (viewArea === "town") {
        // --- TOWN SQUARE ---
        ctx.fillStyle = "#2f3542"; // Paved stones
        ctx.fillRect(0, 475, c.width, 125);
        // Stone details
        ctx.strokeStyle = "#3e4451";
        for(let i=0; i<c.width; i+=100) {
            ctx.strokeRect(i, 475, 100, 50);
        }
        // Central Monument Base
        ctx.fillStyle = "#57606f";
        ctx.fillRect(350, 420, 100, 55);

    } else if (viewArea === "arena") {
        // --- BATTLE ARENA ---
        ctx.fillStyle = "#3d2b1f"; // Dirt/Sand floor
        ctx.fillRect(0, 475, c.width, 125);
        // Background stadium walls
        ctx.fillStyle = "#1e1e1e";
        ctx.fillRect(0, 200, c.width, 275);
        // Torch flickers
        ctx.fillStyle = (now % 200 < 100) ? "#ff9f43" : "#ee5253";
        ctx.beginPath(); ctx.arc(100, 250, 5, 0, 7); ctx.fill();
        ctx.beginPath(); ctx.arc(700, 250, 5, 0, 7); ctx.fill();
		// Inside drawScenery for the Arena section
		ctx.fillStyle = "#2c3e50";
		ctx.fillRect(300, 420, 200, 55); // Pedestal for the winner
		ctx.fillStyle = "#f1c40f"; // Gold trim
		ctx.fillRect(300, 420, 200, 5);

    } else if (viewArea === "pond") {
        ctx.fillStyle = "#1a2e1a";
        ctx.fillRect(0, 475, 250, 125); 
        ctx.fillStyle = "#0a2e3a";
        ctx.fillRect(250, 485, c.width - 250, 115);
        drawBuyer(ctx);

    } else if (viewArea === "dungeon") {
        ctx.fillStyle = "#110505";
        ctx.fillRect(0, 475, c.width, 125);
        ctx.strokeStyle = "#2a1010";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(100, 0); ctx.lineTo(120, 100); ctx.lineTo(80, 200);
        ctx.stroke();
    }
}
 */
function drawScenery(ctx) {
    const now = Date.now();
    const floorH = 60;                // The thickness of the floor
    const floorY = c.height - floorH; // 540

    // Set floor color based on area
    if (viewArea === "home") {
        ctx.fillStyle = "#252545";
        ctx.fillRect(0, floorY, c.width, floorH);
    } else if (viewArea === "town") {
        ctx.fillStyle = "#2f3542"; 
        ctx.fillRect(0, floorY, c.width, floorH);
        // Stone details
        ctx.strokeStyle = "#3e4451";
        for(let i=0; i<c.width; i+=100) {
            ctx.strokeRect(i, floorY, 100, 30);
        }
    } else if (viewArea === "arena") {
        ctx.fillStyle = "#3d2b1f"; 
        ctx.fillRect(0, floorY, c.width, floorH);
        // Pedestal (Sitting on the new lower floor)
        ctx.fillStyle = "#2c3e50";
        ctx.fillRect(300, floorY - 55, 200, 55); 
    } else if (viewArea === "pond") {
        ctx.fillStyle = "#1a2e1a"; // Grass
        ctx.fillRect(0, floorY, 250, floorH); 
        ctx.fillStyle = "#0a2e3a"; // Water
        ctx.fillRect(250, floorY + 10, c.width - 250, floorH - 10);
    } else if (viewArea === "dungeon") {
        ctx.fillStyle = "#110505";
        ctx.fillRect(0, floorY, c.width, floorH);
    }
}
//================================================================================
// This wrapper function just organizes the "Background" layer
function renderScene() {
    // 1. Draw the base sky/wall color
    //ctx.fillStyle = backgrounds[viewArea];
   //ctx.fillRect(0, 0, c.width, c.height);

    // 2. Draw the specific props you wrote (Floor, Ripples, Cracks)
    drawScenery(ctx);
}
//================================================================================
//-----=======------=======---GAME LOOP STUFF--=======-----========----
function updatePlayerStatus(p, now) {
    if (p.activeTask && p.taskEndTime && now > p.taskEndTime) {
        systemMessage(`${p.name} stopped ${p.activeTask} (Idle timeout).`);
		spawnFloater(p, `stopped ${p.activeTask} (Idle timeout)`, "#ff4444");
        p.activeTask = null;
        p.targetX = null;
        p.danceStyle = 0;
    }
}

/* function updatePlayerMovement(p) {
    if (p.targetX !== null && p.targetX !== undefined) {
        let dx = p.targetX - p.x;
        if (Math.abs(dx) > 5) {
            p.x += dx * 0.1;
            p.lean = dx > 0 ? 0.2 : -0.2;
        } else {
            p.lean = 0;
            if (p.activeTask !== "attacking") p.targetX = null;
        }
    }
} */

function updatePlayerActions(p, now) {
    if (p.dead) return;
	if (p.activeTask === "lurking") {
		handleLurking(p, now);
	}
    // Handle Dancing
    if (p.activeTask === "dancing") {
        handleDancing(p, now);
    }
	if (p.activeTask === "healing") {
		let weapon = ITEM_DB[p.stats.equippedWeapon];
		let healSpeed = weapon?.speed || 2500;
		
		if (!p.lastHealTime) p.lastHealTime = 0;
		if (now - p.lastHealTime > healSpeed) {
			performHeal(p, "auto"); // Runs the auto logic
			p.lastHealTime = now;
		}
	}
    // Handle Attacking
    if (p.activeTask === "attacking") {
        let weapon = ITEM_DB[p.stats.equippedWeapon];
        let attackSpeed = weapon?.speed || 2500;
        if (!p.lastAttackTime) p.lastAttackTime = 0;
        if (now - p.lastAttackTime > attackSpeed) {
            performAttack(p);
            p.lastAttackTime = now;
        }
    }
	if (p.activeTask === "pvp") {
		let weapon = ITEM_DB[p.stats.equippedWeapon] || { speed: 2000 };
		if (!p.lastAttackTime) p.lastAttackTime = 0;
		
		if (now - p.lastAttackTime > (weapon.speed || 2000)) {
			performPvPAttack(p);
			p.lastAttackTime = now;
		}
	}
}




function updateAreaPlayerCounts() {
    const counts = { home: 0, town: 0, pond: 0, dungeon: 0, arena: 0 };
    
    Object.values(players).forEach(p => {
        if (counts[p.area] !== undefined) counts[p.area]++;
    });

    const selector = document.getElementById("view-area-selector");
    if (selector) {
        // Change the dungeon icon based on activity
        const dungeonIcon = dungeonActive ? "👹" : "👾";
        const dungeonLabel = dungeonActive ? "RAID ACTIVE" : "Dungeon";

        selector.options[0].text = `🏠 Home (${counts.home})`;
        selector.options[1].text = `🏙️ Town (${counts.town})`;
		selector.options[2].text = `🏟️ Arena (${counts.arena})`;
        selector.options[3].text = `🎣 Pond (${counts.pond})`;
        selector.options[4].text = `👾 Dungeon (${counts.dungeon})`;
        
    }
}
// Call this inside your requestAnimationFrame or a 1-second interval
//setInterval(updateAreaPlayerCounts, 1000);
/* ================= GAME LOOP ================= */
/* ================= GAME LOOP ================= */
//--GAME LOOP HELPERS
const systemTimers = {
    lastGlobalTick: Date.now(),
    lastEnemyTick: Date.now(),
	lastAutoSave: Date.now(),
    globalInterval: 3000, // 3 seconds (Fishing, etc.)
    enemyInterval: 4000,   // 4 seconds (Enemy Attacks)
    saveInterval: 15000 // 30 seconds
};
function updateSystemTicks(now) {
    // 3s Global Tick
    if (now - systemTimers.lastGlobalTick > systemTimers.globalInterval) {
        Object.values(players).forEach(p => {
            if (p.dead || p.area !== "pond") return;

            // Existing Fishing logic
            if (p.activeTask === "fishing") {
                if (Math.random() > 0.8) performFish(p);
            }
            
            // NEW: Swimming logic
            if (p.activeTask === "swimming") {
                if (Math.random() > 0.7) performSwim(p);
            }
        });
        systemTimers.lastGlobalTick = now;
    }
    // 4s Enemy Tick
    if (now - systemTimers.lastEnemyTick > systemTimers.enemyInterval) {
        if (dungeonActive) handleEnemyAttacks();
        systemTimers.lastEnemyTick = now;
    }
	if (now - systemTimers.lastAutoSave > systemTimers.saveInterval) {
        Object.values(players).forEach(p => saveStats(p));
        systemTimers.lastAutoSave = now;
        console.log("Game Autosaved");
    }
	updateBuyerNPC();
}

function updateDungeonScoreboard() {
    const partyList = document.getElementById("dungeon-party-list");
    const enemyList = document.getElementById("dungeon-enemy-list");
    
    // 1. Clear the enemy list entirely before re-rendering 
    // This prevents "ghost" enemies from previous waves staying on screen
    if (enemyList) enemyList.innerHTML = "";

    // 2. Update Party HP List
    const partyDwellers = Object.values(players).filter(p => p.area === "dungeon");
    partyDwellers.forEach(p => {
        const hpPct = Math.max(0, Math.floor((p.hp / p.maxHp) * 100));
        const statusClass = dungeonUIConfig.getStatusClass(hpPct, p.dead);
        const displayText = `${p.name}: ${hpPct}%`;
        
        syncUI(`party-${p.name}`, displayText, "dungeon-party-list");
        const el = document.getElementById(`party-${p.name}`);
        if (el && el.className !== statusClass) el.className = statusClass;
    });

    // 3. Update Wave & Enemies
    const waveBox = document.getElementById("dungeon-wave-section");
    if (dungeonActive) {
        waveBox.style.display = "block";
        updateText("dungeon-wave-display", dungeonUIConfig.labels.wave(dungeonWave, dungeonTier));

        const bossEl = document.getElementById("dungeon-boss-hp");
        if (boss && !boss.dead) {
            bossEl.style.display = "block";
            bossEl.textContent = dungeonUIConfig.labels.boss(Math.max(0, Math.floor((boss.hp/boss.maxHp)*100)));
        } else {
            bossEl.style.display = "none";
        }

        // Only show enemies that are NOT dead
        enemies.filter(e => !e.dead).forEach((e, idx) => {
            const div = document.createElement("div");
            div.className = "hp-healthy";
            div.textContent = `${e.name}: ${Math.max(0, Math.floor((e.hp/e.maxHp)*100))}%`;
            enemyList.appendChild(div);
        });
    } else {
        waveBox.style.display = "none";
    }
}
function updateArenaScoreboard() {
    const arenaBox = document.getElementById("arenaUI");
    if (!arenaBox) return;

    // 1. Update Rankings List
    const topPlayers = arenaConfig.getTopRankings();
    const leaderboardContainer = document.getElementById("arena-leaderboard");

    if (topPlayers.length === 0) {
        updateText("arena-leaderboard", arenaConfig.labels.empty);
    } else {
        // We sync individual rows to avoid rebuilding the whole table
        topPlayers.forEach(([name, stats], idx) => {
            const rowId = `arena-rank-${idx}`;
            const content = `${name.toUpperCase()} | ${stats.wins}/${stats.kills} | ${stats.rating}`;
            syncUI(rowId, content, "arena-leaderboard");
        });
    }

    // 2. Update Status & Count
    const isMatch = (typeof arenaActive !== 'undefined' && arenaActive);
    const statusEl = document.getElementById("arena-status-text");
    if (statusEl) {
        statusEl.textContent = isMatch ? arenaConfig.labels.matchActive : arenaConfig.labels.matchOpen;
        statusEl.style.color = isMatch ? "#ff0000" : "#00ff00";
    }

    const count = Object.values(players).filter(p => p.area === "arena").length;
    updateText("arena-player-count", arenaConfig.labels.count(count));
}
function updateUI() {
    // 1. Area Header
    updateText("areaDisplay", viewArea);

    // 2. DUNGEON UI
    const isDungeon = (viewArea === "dungeon");
    const dungeonBox = document.getElementById("dungeon-stats");
    const dTimerBox = document.getElementById("dungeon-timer-box");

    if (dTimerBox) {
        dTimerBox.style.display = (dungeonSecondsLeft > 0) ? "block" : "none";
        updateText("dungeon-timer-val", `DUNGEON START: ${dungeonSecondsLeft}s`);
    }

    if (dungeonBox) {
        dungeonBox.style.display = isDungeon ? "block" : "none";
        if (isDungeon) updateDungeonScoreboard();
    }

    // 3. ARENA UI
    const isArena = (viewArea === "arena");
    const arenaBox = document.getElementById("arenaUI");
    const aTimerBox = document.getElementById("arena-timer-box");

    if (aTimerBox) {
        const showArenaTimer = (typeof arenaMatchInterval !== 'undefined' && arenaMatchInterval && arenaTimer > 0);
        aTimerBox.style.display = showArenaTimer ? "block" : "none";
        updateText("arena-timer-val", arenaConfig.labels.timer(arenaTimer));
    }

    if (arenaBox) {
        arenaBox.style.display = isArena ? "block" : "none";
        if (isArena) updateArenaScoreboard();
    }
}

let frameCount = 0;
function gameLoop() {
    const now = Date.now();
    frameCount++; 
    ctx.clearRect(0, 0, c.width, c.height); 

    // 1. Visual Foundation (Shake & Background)
    ctx.save();
    if (window.shakeAmount > 0) {
        let sx = (Math.random() - 0.5) * window.shakeAmount;
        let sy = (Math.random() - 0.5) * window.shakeAmount;
        ctx.translate(sx, sy);
        window.shakeAmount *= 0.9; 
        if (window.shakeAmount < 0.1) window.shakeAmount = 0;
    }

    renderScene(); 
    
    // 2. PERFORMANCE: UI Sync (Throttle to ~20fps)
    if (frameCount % 3 === 0) {
        updateUI(); 
    }

    // 3. World Logic (Runs regardless of view)
    if (dungeonActive) {
        checkDungeonProgress(); 
        checkDungeonFailure();  
    } else {
        // If raid is off, check if anyone is inside doing training
        const anyoneInDungeon = Object.values(players).some(p => p.area === "dungeon");
        if (anyoneInDungeon) updateDungeonIdleTraining();
    }

    if (typeof arenaActive !== 'undefined' && arenaActive) {
        checkArenaVictory();
    }

    // 4. Area-Specific Rendering (Monsters/Beams)
    if (viewArea === "dungeon") {
        drawLootBeams(ctx); 
        if (boss && !boss.dead) drawMonster(ctx, boss);
        enemies.forEach(e => {
            if (!e.dead) {
                if (e.isStickman) drawEnemyStickman(ctx, e);
                else drawMonster(ctx, e);
            }
        });
    }

    // 5. Player Processing (Loop once for both logic and drawing)
    Object.values(players).forEach(p => {
        // Logic runs for everyone everywhere
        if (!p.dead) {
            updatePhysics(p);           
            updatePlayerStatus(p, now); 
            
            if (p.activeTask === "pvp") {
                handlePvPLogic(p, now);
            } else {
                updatePlayerActions(p, now); 
            }
        }

        // Draw only if in the current view
        if (p.area === viewArea) {
            drawStickman(ctx, p);
            
            // Team Underglow for Arena
            if (viewArea === "arena" && typeof arenaMode !== 'undefined' && arenaMode === "teams" && p.team) {
                ctx.fillStyle = p.team === "Red" ? "rgba(255,0,0,0.3)" : "rgba(0,0,255,0.3)";
                ctx.beginPath();
                ctx.ellipse(p.x, p.y + 5, 20, 10, 0, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    });

    // 6. Global Overlays & Ticks
    updateAreaPlayerCounts();
    updateSystemTicks(now);  
    drawProjectiles(ctx);    
    updateSplashText(ctx);   
    handleTooltips();        

    ctx.restore(); 
    requestAnimationFrame(gameLoop);
}
/* =================END GAME LOOP ================= */
/* =================END GAME LOOP ================= */


/* ======================================================= */
/* ================= CHAT COMMAND SYSTEM ================= */
/* --- Handle Chat Commands ---*/
// Example of how you would handle a future Browser Input field
const chatInput = document.getElementById("browserChatInput");
const profileSelector = document.getElementById("profileSelector");
const colorPicker = document.getElementById("browserColorPicker");
function handleBrowserInput() {

    let text = chatInput.value;
    let p = players[localPlayerName]; 

    // Use the exact same router!
    centralCommandRouter(p, p.name, text, { developer: true });

    input.value = "";
}
function sendAction(commandStr) {
    const current = getActiveProfile();
    
    // 1. Intercept the Inventory button
    if (commandStr === "inventory") {
        toggleInventory(); // Call your new UI function instead of the text command
        return; 
    }

    // 2. Normal command logic for everything else
    const flags = { 
        developer: true, 
        broadcaster: (current.name.toLowerCase() === streamername.toLowerCase()) 
    };

    processGameCommand(current.name, commandStr, flags, { userColor: current.color });
    console.log(`Action Bar: ${commandStr} sent for ${current.name}`);
}
let currentInventoryFilter = "all";
let currentSortMode = "tier";
let currentInventoryView = "items"; // Options: "items", "stats", "achievements"
function toggleInventory() {
    const modal = document.getElementById('inventory-modal');
    modal.classList.toggle('hidden');
    if (!modal.classList.contains('hidden')) {
        renderInventoryUI();
    }
}

function renderInventoryUI() {
    const p = getActiveProfile();
    const playerObj = players[p.name.toLowerCase()];
    if (!playerObj) return;

    // 1. Update Header & Pixels
    const nameEl = document.getElementById('inv-player-name');
    const pixelEl = document.getElementById('inv-pixels-val');
    if (nameEl) nameEl.textContent = p.name.toUpperCase();
    if (pixelEl) pixelEl.textContent = (playerObj.stats.pixels || 0).toFixed(0);
    
    // 2. Section Routing
    const backpackTab = document.getElementById('backpack-Tab');
    const achTab = document.getElementById('achievements-tab');
    const statsTab = document.getElementById('stats-tab');

    // Grids for rendering
    const bpGrid = document.getElementById('backpack-grid');
    const achGrid = document.getElementById('achievements-grid');
    const statsGrid = document.getElementById('stats-grid');

    // Hide all tab containers first
    [backpackTab, achTab, statsTab].forEach(el => el?.classList.add('hidden'));
    
    // Always render equipped section
    renderEquippedSection(playerObj);

    // Show active tab and trigger specific render
    if (currentInventoryView === "achievements") {
        achTab?.classList.remove('hidden');
        renderAchievements(playerObj);
    } 
    else if (currentInventoryView === "stats") {
        statsTab?.classList.remove('hidden');
        renderStatsView(playerObj);
    } 
    else {
        // Default to Items/Backpack
        backpackTab?.classList.remove('hidden');
        renderItemsView(playerObj, bpGrid);
    }
}
function renderEquippedSection(playerObj) {
    const equipGrid = document.getElementById('equipped-grid');
    if (!equipGrid) return;

    const slots = [
        { label: "Weapon", key: "equippedWeapon", cmd: "weapon" },
        { label: "Helmet", key: "equippedHelmet", cmd: "helmet" },
        { label: "Armor", key: "equippedArmor", cmd: "armor" },
        { label: "Pants", key: "equippedPants", cmd: "pants" },
        { label: "Boots", key: "equippedBoots", cmd: "boots" },
        { label: "Cape", key: "equippedCape", cmd: "cape" },
        { label: "Gloves", key: "equippedGloves", cmd: "gloves" }
    ];

    equipGrid.innerHTML = "";
    slots.forEach(slot => {
        const itemName = playerObj.stats[slot.key];
        const itemData = ITEM_DB[itemName] || null;
        
        const div = document.createElement('div');
        div.className = `equip-slot ${itemName ? 'has-item' : 'is-empty'}`;
        
        // Use the sanitized uiAction
        if (itemName) {
            div.onclick = () => uiAction('unequip', slot.cmd);
        }

        div.innerHTML = `
            <small class="slot-label">${slot.label}</small>
            <div class="slot-item" style="color: ${itemData ? itemData.color : '#555'}">
                ${itemName || "---"}
            </div>
            ${itemName ? `<div class="unequip-hint">Click to Remove</div>` : ''}
        `;
        equipGrid.appendChild(div);
    });
}

function renderItemsView(playerObj, bpGrid) {
    // 1. Get IDs of currently equipped items
    const equippedItems = [
        playerObj.stats.equippedWeapon, playerObj.stats.equippedArmor,
        playerObj.stats.equippedHelmet, playerObj.stats.equippedPants,
        playerObj.stats.equippedGloves, playerObj.stats.equippedBoots,
        playerObj.stats.equippedCape
    ].filter(Boolean);

    const hideEquippedEl = document.getElementById("filter-hide-equipped");
    const hideEquipped = hideEquippedEl ? hideEquippedEl.checked : false;

    // 2. Filter logic
    let itemsToRender = playerObj.stats.inventory.filter(item => {
        if (hideEquipped && equippedItems.includes(item)) return false;
        
        const data = ITEM_DB[item] || {};
        const type = data.type || "";

        if (currentInventoryFilter === "all") return true;

        // NEW: Hats filter (Covers all headgear types)
        if (currentInventoryFilter === "helmet") {
            return ["helmet", "hood", "viking", "wizard", "crown", "hair"].includes(type);
        }

        // GEAR filter (Everything wearable except hats, which now have their own button)
        if (currentInventoryFilter === "gear") {
            return ["weapon", "armor", "pants", "gloves", "boots", "cape", "staff", "bow"].includes(type);
        }

        // MISC/Material filter
        if (currentInventoryFilter === "material") {
            return type === "material" || type === "tool" || type === "consumable";
        }

        // FISH or specific direct matches
        return type === currentInventoryFilter;
    });

    // 3. Sort logic
    itemsToRender.sort((a, b) => {
        const dataA = ITEM_DB[a] || {};
        const dataB = ITEM_DB[b] || {};

        if (currentSortMode === "tier") return (dataB.tier || 0) - (dataA.tier || 0);
        if (currentSortMode === "value") return (dataB.value || 0) - (dataA.value || 0);
        if (currentSortMode === "rarity") return (dataB.rarity || 0) - (dataA.rarity || 0);
        if (currentSortMode === "name") return a.localeCompare(b);
        
        // NEW: Sort by Type (Alphabetical)
        if (currentSortMode === "type") {
            const typeA = dataA.type || "";
            const typeB = dataB.type || "";
            return typeA.localeCompare(typeB);
        }

        return 0;
    });

    // 4. Render
    bpGrid.innerHTML = "";
    bpGrid.classList.remove('hidden'); 

    itemsToRender.forEach((item) => {
        const itemData = ITEM_DB[item] || {};
        const isUnsellable = itemData.type === "tool" || (itemData.sources?.includes("achievement"));
        
        const div = document.createElement('div');
        div.className = "inv-slot";
        div.innerHTML = `
            <div class="slot-content">
                <span class="item-tier">T${itemData.tier || 1}</span>
                <span class="slot-item-name" style="color:${itemData.color || '#fff'};">${item}</span>
                <span class="item-price">${isUnsellable ? 'BOUND' : '$' + (itemData.value || 0)}</span>
                <div class="item-actions">
                    <button class="btn-use">USE</button>
                    ${isUnsellable ? '' : `<button class="btn-sell">SELL</button>`}
                </div>
            </div>
        `;

        div.querySelector('.btn-use').addEventListener('click', (e) => {
            e.stopPropagation();
            uiAction('equip', item);
        });
        
        const sellBtn = div.querySelector('.btn-sell');
        if (sellBtn) {
            sellBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                uiAction('sell', item);
            });
        }

        bpGrid.appendChild(div);
    });
}
function renderStatsView(playerObj) {
    const statsGrid = document.getElementById('stats-grid');
    const s = playerObj.stats;

    statsGrid.innerHTML = `
        <div class="stats-container">
            <div class="stats-header-box">
                <div class="stat-main">
                    <span class="stat-label">COMBAT LEVEL</span>
                    <span class="stat-value" style="color:#ff4444">${s.combatLevel}</span>
                </div>
                <div class="stat-main">
                    <span class="stat-label">HEALTH</span>
                    <span class="stat-value" style="color:#44ff44">${playerObj.hp} / ${playerObj.maxHp}</span>
                </div>
            </div>
            <div class="stats-skills-list">
                ${renderStatRow("Attack", s.attackLevel, s.attackXP, "#ff6666")}
                ${renderStatRow("Archery", s.archerLevel, s.archerXP, "#66ff66")}
                ${renderStatRow("Magic", s.magicLevel, s.magicXP, "#6666ff")}
                ${renderStatRow("Healing", s.healLevel, s.healXP, "#ff66ff")}
                ${renderStatRow("Lurking", s.lurkLevel, s.lurkXP, "#888888")}
                ${renderStatRow("Fishing", s.fishLevel, s.fishXP, "#66ccff")}
                ${renderStatRow("Swimming", s.swimLevel, s.swimXP, "#4488ff")}
                ${renderStatRow("Dancing", s.danceLevel, s.danceXP, "#ffcc00")}
            </div>
        </div>
    `;
}

function renderStatRow(name, level, xp, color) {
    const nextXP = typeof xpNeeded === 'function' ? xpNeeded(level) : (level * 100);
    const pct = Math.min(100, (xp / nextXP) * 100);
    return `
        <div class="stat-row">
            <div class="stat-info"><span>${name}</span><span>Lvl ${level}</span></div>
            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width:${pct}%; background-color:${color}"></div></div>
            <small>${xp.toFixed(0)} / ${nextXP} XP</small>
        </div>
    `;
}
function renderAchievements(playerObj) {
    const achGrid = document.getElementById('achievements-grid');
    const s = playerObj.stats;
    achGrid.innerHTML = "";

    // 1. Render Uniques from DB
    Object.keys(ACHIEVEMENT_DB).forEach(itemName => {
        const goal = ACHIEVEMENT_DB[itemName];
        const equippedItems = [
			s.equippedWeapon, s.equippedArmor, s.equippedHelmet, 
			s.equippedBoots, s.equippedPants, s.equippedCape, 
			s.equippedGloves, s.equippedHair
		];

		const hasIt = s.inventory.includes(itemName) || equippedItems.includes(itemName);
        const itemData = ITEM_DB[itemName] || { color: "#fff" };

        renderAchRow(
            achGrid, 
            itemName, 
            hasIt, 
            itemData.color, 
            hasIt ? "UNLOCKED" : goal.text
        );
    });

    // 2. Render Tiers
    for (let t = 1; t <= 10; t++) {
        const hasTier = s.dungeon.completedTiers?.includes(t);
        renderAchRow(
            achGrid, 
            `Tier ${t} Mastery`, 
            hasTier, 
            `hsl(${t * 30}, 70%, 60%)`, 
            hasTier ? "UNLOCKED" : `Reach Dungeon Tier ${t}`
        );
    }
}

function renderAchRow(container, title, isUnlocked, color, subtext) {
    const div = document.createElement('div');
    div.className = `ach-row ${isUnlocked ? 'unlocked' : 'locked'}`;
    div.innerHTML = `
        <div class="ach-icon" style="color:${color}">${isUnlocked ? '🏆' : '🔒'}</div>
        <div class="ach-info">
            <strong>${title}</strong><br>
            <small style="color: ${isUnlocked ? '#aaa' : '#ff6666'}">${subtext}</small>
        </div>
    `;
    container.appendChild(div);
}
// Helper to bridge UI clicks to game commands
function uiAction(cmd, itemName) {
    const p = getActiveProfile();
    if (!p) return;

    // Wrapping in quotes handles items with spaces like "Leather Scrap"
    const fullCommand = `${cmd} "${itemName}"`;
    
    processGameCommand(p.name, fullCommand);
    
    setTimeout(renderInventoryUI, 50);
}
// Wait for the DOM to load to ensure the action bar exists

/* ================= COMMAND FUNCTIONS ================= */

function cmdStop(p, user) {
    // 1. Restore weapon if it was put away
    if (p.stats.lastWeapon) {
        p.stats.equippedWeapon = p.stats.lastWeapon;
        systemMessage(`${p.name} drew their ${p.stats.equippedWeapon} again.`);
        p.stats.lastWeapon = null;
    }

    // 2. Clear Tasks
    p.activeTask = null;
    p.taskEndTime = null;
    p.danceStyle = 0;
    p.forcedPose = null; 

    // 3. Return to Shore logic
    if (p.area === "pond" && p.x > 200) {
        systemMessage(`${user} is heading back to the shore.`);
        p.targetX = 100 + (Math.random() * 80); // Walk back to a random spot on the sand
    } else {
        p.targetX = null; // Just stop where you are if on land
    }
    
    systemMessage(`${user} stopped their current action.`);
    saveStats(p);
}
function cmdSetPose(p, user, args) {
    if (p.dead) return;
    let chosenPose = args[1]?.toLowerCase();

    if (!chosenPose || chosenPose === "none" || chosenPose === "off") {
        p.forcedPose = null;
        systemMessage(`${user} cleared their pose.`);
        return;
    }

    if (POSE_LIBRARY[chosenPose]) {
        p.forcedPose = chosenPose;

        // --- NEW: CANCEL DANCING ---
        if (p.activeTask === "dancing") {
            p.activeTask = null;
            p.danceStyle = 0;
        }
        // ---------------------------

        systemMessage(`${user} set pose to: ${chosenPose}`);
    } else {
        const available = Object.keys(POSE_LIBRARY).join(", ");
        systemMessage(`Unknown pose. Available: ${available}`);
    }
}
function cmdDance(p, user, args) {
    if (p.dead) return;
	// Store weapon before dancing
    if (p.stats.equippedWeapon) {
        p.stats.lastWeapon = p.stats.equippedWeapon;
        p.stats.equippedWeapon = null;
    }

    const level = p.stats.danceLevel || 1;
    let chosenStyle = parseInt(args[1]);
    if (!isNaN(chosenStyle)) {
        if (!DANCE_UNLOCKS[chosenStyle]) {
            systemMessage(`${user}, try styles 1, 2, 3, or 4!`);
            return;
        }
        if (level < DANCE_UNLOCKS[chosenStyle].minLvl) {
            systemMessage(`${user}, you need Dance Lvl ${DANCE_UNLOCKS[chosenStyle].minLvl} for that!`);
            return;
        }
        p.danceStyle = chosenStyle;
    } else {
        let unlockedStyles = [1];
        if (level >= 5) unlockedStyles.push(2);
        if (level >= 10) unlockedStyles.push(3);
        if (level >= 20) unlockedStyles.push(4);
        p.danceStyle = unlockedStyles[Math.floor(Math.random() * unlockedStyles.length)];
    }

    p.activeTask = "dancing";
    p.taskEndTime = Date.now() + (15 * 60 * 1000);
    systemMessage(`${user} is performing ${DANCE_UNLOCKS[p.danceStyle].name}!`);
    saveStats(p);
}
function cmdTestDance(p, user, args, flags) {
    // Only allow the streamer (broadcaster) or moderators to use this
/*     if (!flags.broadcaster && !flags.mod) {
        systemMessage(`${user}, only the host can force-test animations!`);
        return;
    } */

    let chosenStyle = parseInt(args[0]); // Using args[0] assuming "!testdance 4"

    if (isNaN(chosenStyle) || !DANCE_UNLOCKS[chosenStyle]) {
        const available = Object.keys(DANCE_UNLOCKS).join(", ");
        systemMessage(`Streamer, pick a style to force: ${available}`);
        return;
    }

    // Bypass level check entirely
    p.danceStyle = chosenStyle;
    p.activeTask = "dancing";
    p.taskEndTime = Date.now() + (5 * 60 * 1000); // Shorter duration for testing
    
    systemMessage(`[TEST MODE] ${user} is force-playing: ${DANCE_UNLOCKS[chosenStyle].name}`);
}
function cmdListDances(p) {
    const lvl = p.stats.danceLevel;
    let msg = `Your Dance Lvl: ${lvl}. Available Dances: [1] The Hop (Lvl 1) `;
    msg += lvl >= 5 ? `[2] The Flail (Lvl 5) ` : `[2] LOCKED (Lvl 5) `;
    msg += lvl >= 10 ? `[3] The Lean (Lvl 10)` : `[3] LOCKED (Lvl 10)`;
    systemMessage(msg);
}
function cmdWigColor(p, args) {
    const equippedId = p.stats.equippedHelmet;
    const itemData = ITEM_DB[equippedId];

    // 1. Requirement Check
    if (!equippedId || (equippedId.toLowerCase() !== "wig" && (!itemData || itemData.type !== "hair"))) {
        systemMessage(`${p.name}, you need to be wearing a wig or hair to change its color!`);
        return;
    }

    const colorArg = args[1]; // Get the word after !wigcolor
    let finalColor;

    // 2. Logic for Color Selection
    if (!colorArg) {
        // No color provided? Use the player's body color
        finalColor = p.color;
        systemMessage(`${p.name}'s hair now matches their body!`);
    } else if (colorArg.toLowerCase() === "random") {
        // User typed "random"? Pick a random hex
        finalColor = getRandomHex();
        systemMessage(`${p.name} rolled a random hair color!`);
    } else {
        // User typed a specific color? Validate it
        const isHex = /^#([0-9A-F]{3}){1,2}$/i.test(colorArg);
        const safeColors = ["red", "blue", "green", "pink", "purple", "orange", "white", "black", "cyan", "magenta", "yellow", "brown"];
        
        if (isHex || safeColors.includes(colorArg.toLowerCase())) {
            finalColor = colorArg;
            systemMessage(`${p.name}'s hair/wig is now ${colorArg}!`);
        } else {
            systemMessage(`Invalid color! Use a hex, a name, or 'random'.`);
            return; // Exit if input is garbage
        }
    }

    // 3. Save and Apply
    p.stats.wigColor = finalColor;
    saveStats(p);
}
// --- COMBAT & TASKS ---
function cmdAttack(p, user) {
    if (p.activeTask === "attacking") { 
        systemMessage(`${user}: Already attacking.`); 
        return; 
    }
    
    p.activeTask = "attacking";
    // Keep your 15-minute timer logic
    p.taskEndTime = Date.now() + (15 * 60 * 1000); 
    // Reset attack cooldown so they hit immediately
    p.lastAttackTime = 0; 
    
    systemMessage(`${user} started attacking (15m idle)`);
}
function cmdHeal(p, user, args) {
    if (p.dead) return;

    // 1. Safety Check: If args doesn't exist, make it an empty array
    const safeArgs = args || [];
    // Get the word after !heal (e.g., "all" or "Gemini")
    let targetName = safeArgs[1] ? safeArgs[1].toLowerCase() : null;

    // SCENARIO A: !heal all (Manual AOE)
    if (targetName === "all") {
        performHeal(p, "all");
        return;
    }

    // SCENARIO B: !heal [name] (Manual Focus)
    if (targetName && players[targetName]) {
        let target = players[targetName];
        if (target.area === p.area && !target.dead) {
            performHeal(p, "focus", target);
            return;
        } else {
            systemMessage(`${user}: Target is not in your area or is dead.`);
            return;
        }
    }

    // SCENARIO C: !heal (Start Auto-Idle Mode)
    // Runs if targetName is null OR if they typed a name that doesn't exist
    if (!targetName || !players[targetName]) {
        if (p.activeTask === "healing") {
            systemMessage(`${user}: You are already in auto-healing mode.`);
        } else {
            p.activeTask = "healing";
            p.taskEndTime = Date.now() + (15 * 60 * 1000);
            systemMessage(`${user} started auto-healing the party (15m idle).`);
        }
        saveStats(p);
        return;
    }
}
/* function cmdHeal(p, args) {
    let target = players[args[1]];
    if (target && target.area === p.area && !target.dead) {
        let amt = 10 + (p.stats.healLevel * 5);
        target.hp = Math.min(target.maxHp, target.hp + amt);
		spawnFloater(`+${amt} HP`, target.x, target.y - 40, "#0f0", target.area);
        p.stats.healXP += 15;
        if (p.stats.healXP >= xpNeeded(p.stats.healLevel)) {
            p.stats.healLevel++; p.stats.healXP = 0; 
            systemMessage(`${p.name} HEAL UP! (Lv ${p.stats.healLevel})`);
        }
        saveStats(p);
    }
} */
//auto unequip version of fish cmd
function cmdRespawn(p) {
    if (!p.dead) {
        systemMessage(`${p.name}, you aren't even dead!`);
        return;
    }

    // 1. Reset Stats
    p.dead = false;
    p.hp = p.maxHp;
    p.activeTask = "none";

    // 2. Move to Town
    p.area = "town";
    p.x = 400; // Town center
    p.y = 450;
    p.targetX = null;
    p.targetY = null;



    systemMessage(`${p.name} has respawned in Town.`);
    saveStats(p);
}
function cmdLurk(p, user) {
    if (p.dead) return;
    if (p.activeTask === "lurking") {
        systemMessage(`${user} is already lurking in the shadows...`);
        return;
    }

    p.activeTask = "lurking";
    p.taskEndTime = Date.now() + (15 * 60 * 1000); // 15 mins
    
    // Optional: Hide the weapon when lurking
/*     if (p.stats.equippedWeapon) {
        p.manualSheath = true; 
    } */

    spawnFloater("vanished into shadows...", p.x, p.y - 60, "#555555", p.area, p.name);
    saveStats(p);
}
function cmdFish(p, user) {
    if (p.area !== "pond") { 
        systemMessage(`${user}: Go to the pond first.`); 
        return; 
    }
    if (p.activeTask === "fishing") { 
        systemMessage(`${user}: You are already fishing.`); 
        return; 
    }

    // --- NEW: INITIAL BAIT CHECK ---
    const baitCost = 15;
    if ((p.stats.pixels || 0) < baitCost) {
        systemMessage(`${user}: You need at least ${baitCost} pixels to buy bait!`);
        return;
    }

    // REMEMBER AND UNEQUIP WEAPON
    if (p.stats.equippedWeapon) {
        p.stats.lastWeapon = p.stats.equippedWeapon;
        p.stats.equippedWeapon = null;
        systemMessage(`${p.name} put away their ${p.stats.lastWeapon} to fish.`);
    }

    // POSITIONING
    // Walk to the edge of the pond
    p.targetX = 180 + (Math.random() * 40 - 20);
    
    // START TASK
    p.activeTask = "fishing";
    p.taskEndTime = Date.now() + (15 * 60 * 1000); // 15-minute idle timer
    
    systemMessage(`${user} started fishing! (Costs ${baitCost} pixels per cast)`);
    saveStats(p);
}
function cmdSwim(p, user) {
    if (p.area !== "pond") {
        systemMessage(`${user}: The water is at the pond.`);
        return;
    }
    if (p.activeTask === "swimming") { 
        systemMessage(`${user}: Already swimming.`); 
        return; 
    }
    // Auto-Unequip Weapon
    if (p.stats.equippedWeapon) {
        p.stats.lastWeapon = p.stats.equippedWeapon;
        p.stats.equippedWeapon = null;
        systemMessage(`${p.name} stripped off their gear to go for a dip.`);
    }
    // Move the player INTO the water (x > 250)
    p.targetX = 400 + (Math.random() * 250);
	
    p.activeTask = "swimming";
    p.taskEndTime = Date.now() + (15 * 60 * 1000); // 15 mins

    systemMessage(`${p.name} jumped into the water!`);
    saveStats(p);
}
function cmdEquip(p, args) {
    if (p.activeTask && p.activeTask !== "none") {
        systemMessage(`${p.name}: You are too busy ${p.activeTask} to change gear right now! Stop what you are doing first.`);
        return;
    }

    // SANITIZATION: Join all args and strip quotes
    let inputName = args.slice(1).join(" ").toLowerCase().replace(/"/g, "");
    
    // Find the item using the sanitized name
    let invItem = p.stats.inventory.find(i => i.toLowerCase() === inputName);
    
    if (!invItem) {
        systemMessage(`${p.name}: You don't have "${inputName}".`);
        return;
    }

    // Get the exact casing from the DB
    let dbKey = Object.keys(ITEM_DB).find(k => k.toLowerCase() === invItem.toLowerCase());
    let itemData = ITEM_DB[dbKey];
    const type = itemData.type;

    if (type === "tool" || type === "fishing_rod" || type === "pickaxe" || type === "axe") {
        systemMessage(`${p.name}: You don't need to equip tools. Just start the task!`);
        return;
    }

    let msg = "";
    if (["weapon", "staff", "bow"].includes(type)) {
        p.stats.equippedWeapon = dbKey;
        msg = `slung the ${dbKey} over their shoulder`;
    } else if (type === "armor") {
        p.stats.equippedArmor = dbKey;
        msg = `put on the ${dbKey}`;
    } else if (["helmet", "hood", "hair", "viking", "wizard", "crown"].includes(type)) {
        p.stats.equippedHelmet = dbKey; 
        msg = `is wearing ${dbKey}`;
    } else if (type === "boots") {
        p.stats.equippedBoots = dbKey;
        msg = `laced up ${dbKey}`;
    } else if (type === "pants") {
        p.stats.equippedPants = dbKey;
        msg = `put on ${dbKey}`;
    } else if (type === "gloves") {
        p.stats.equippedGloves = dbKey;
        msg = `put on ${dbKey}`;
    } else if (type === "cape") {
        p.stats.equippedCape = dbKey;
        msg = `donned the ${dbKey}`;
    }

    if (msg) {
        systemMessage(`${p.name} ${msg}!`);
        saveStats(p);
    }
}
function cmdSheath(p, user) {
    p.manualSheath = !p.manualSheath;
    const status = p.manualSheath ? "put away" : "drawn";
    systemMessage(`${p.name} has ${status} their weapon.`);
    saveStats(p);
}
function cmdUnequip(p, args) {
    // SANITIZATION: join and strip quotes
    const target = args[1] ? args.slice(1).join(" ").toLowerCase().replace(/"/g, "") : "all";
    let found = false;

    const slots = {
        weapon: "equippedWeapon", staff: "equippedWeapon", bow: "equippedWeapon",
        armor: "equippedArmor",
        helmet: "equippedHelmet", hood: "equippedHelmet", hair: "equippedHair",
        boots: "equippedBoots",
        pants: "equippedPants",
        cape: "equippedCape",
        gloves: "equippedGloves"
    };

    if (target === "all") {
        Object.values(slots).forEach(s => p.stats[s] = null);
        found = true;
    } else if (slots[target]) {
        p.stats[slots[target]] = null;
        found = true;
    }

    if (found) {
        systemMessage(`${p.name} unequipped ${target === "all" ? "everything" : target}.`);
        saveStats(p);
    } else {
        systemMessage(`${p.name}: Invalid slot "${target}". (weapon/armor/helmet/boots/pants/cape/gloves/all)`);
    }
}
function cmdInventory(p, user, args) {
    let filter = args[1] ? args[1].toLowerCase() : "all";
    let items = p.stats.inventory;
    let result = [];

    // --- 1. ORIGINAL FILTER LOGIC ---
    if (filter === "weapons") {
		result = items.filter(i => ["weapon", "staff"].includes(ITEM_DB[i]?.type));
	} else if (filter === "armor" || filter === "gear") {
		// Gear shows everything wearable
		result = items.filter(i => ["armor", "helmet", "boots", "pants", "cape", "gloves", "hood"].includes(ITEM_DB[i]?.type));
	} else if (filter === "cosmetics") {
		result = items.filter(i => ["hair", "wig"].includes(ITEM_DB[i]?.type));
	}
    else if (filter === "fish") result = items.filter(i => i.includes("kg"));
    else if (filter === "tools") result = items.filter(i => ITEM_DB[i]?.type === "tool" || i === "Fishing Rod");
    else result = items;

    if (result.length === 0) {
        systemMessage(`${user}'s ${filter} inventory is empty.`);
        return;
    }

    // --- 2. NEW COLUMN & STACKING LOGIC ---
    let counts = {};
    let fishWeight = 0;
    let fishCount = 0;

    result.forEach(item => {
        if (item.includes("kg")) {
            // Extract weight from string like "2.5kg Bass"
            let weight = parseFloat(item.split("kg")[0]) || 0;
            fishWeight += weight;
            fishCount++;
        } else {
            // Stack gear/items
            counts[item] = (counts[item] || 0) + 1;
        }
    });

    // --- 3. DISPLAY FORMATTING ---
    // Header mimicking the Old HUD style
    let output = `\n[ ${user.toUpperCase()}'S ${filter.toUpperCase()} ]`;
    
    // Add Fish Summary if any are in the filtered results
    if (fishCount > 0) {
        output += `\n> Fish x${fishCount} (Total: ${fishWeight.toFixed(2)}kg)`;
    }

    // Add Stacked Items in a column
    for (let [name, qty] of Object.entries(counts)) {
        output += `\n> ${name} ${qty > 1 ? "x" + qty : ""}`;
    }

    systemMessage(output);
}
function cmdSell(p, user, args) {
    if (p.dead) return;
    if (p.stats.inventory.length === 0) {
        systemMessage(`${user}: Your inventory is empty.`);
        return;
    }
    if (!args || args.length < 2) {
        systemMessage(`${user}: Try "!sell fish" or click an item.`);
        return;
    }

    // SANITIZATION: join and strip quotes
    let target = args.slice(1).join(" ").toLowerCase().replace(/"/g, "");
    
    let totalPixels = 0;
    let itemsRemoved = 0;
    updateBuyerNPC(); 

    const isAtPond = (p.area === "pond");
    const isAtTown = (p.area === "town");
    
    let multiplier = 1;
    if (buyerActive && isAtPond) {
        const fishersCount = Object.values(players).filter(player => player.area === "pond").length;
        multiplier = 2 + (fishersCount * 0.1); 
    }

    if (!isAtPond && !isAtTown) {
        systemMessage(`${user}: You can only sell at the Pond or in Town!`);
        return;
    }

    if (target === "fish") {
        p.stats.inventory = p.stats.inventory.filter(item => {
            const itemData = ITEM_DB[item];
            if (itemData && itemData.type === "fish" && !itemData.sources?.includes("achievement")) {
                totalPixels += Math.floor(itemData.value * multiplier);
                itemsRemoved++;
                return false;
            }
            return true;
        });
    } else {
        let index = p.stats.inventory.findIndex(i => i.toLowerCase() === target);
        if (index !== -1) {
            let itemName = p.stats.inventory[index];
            let itemData = ITEM_DB[itemName];
            
            if (itemData) {
                if (itemData.sources?.includes("achievement") || itemData.type === "tool" || !itemData.value) {
                    systemMessage(`${user}: You cannot sell ${itemName}! It is a soulbound item.`);
                    return; 
                }

                let price = itemData.value || 0;
                if (buyerActive && isAtPond && (itemData.type === "fish" || itemData.type === "material")) {
                    price *= multiplier;
                }

                totalPixels = Math.floor(price);
                p.stats.inventory.splice(index, 1);
                itemsRemoved = 1;
            }
        }
    }

    if (itemsRemoved > 0) {
        p.stats.pixels = (p.stats.pixels || 0) + totalPixels;
        let msg = `${user} sold ${itemsRemoved} items for ${totalPixels.toFixed(0)} pixels!`;
        if (buyerActive && isAtPond) msg += ` 💰 [BONUS x${multiplier.toFixed(1)}]`;
        systemMessage(msg);
        spawnFloater(p, `+$${totalPixels}`, "#44ff44");
        saveStats(p);
    } else {
        systemMessage(`${user}: Could not find "${target}" to sell.`);
    }
}
function cmdBalance(p) {
    // Formatting pixels to 2 decimal places as requested
    const displaypixels = (p.stats.pixels || 0).toFixed(2);
    
    // Using your specific prison wallet phrasing
    systemMessage(`${p.name} has ${displaypixels} coins stuffed in their prison wallet`);
}
function cmdGive(caller, args, flags) {

    // Syntax: !give [player] [item name]
    let targetName = args[1];
    let itemName = args.slice(2).join(" ");
    
    let p = Object.values(players).find(pl => pl.name.toLowerCase() === targetName.toLowerCase());
    
    if (p && ITEM_DB[itemName]) {
        if (!p.stats.inventory) p.stats.inventory = [];
        p.stats.inventory.push(itemName);
        systemMessage(`[ADMIN] Gave ${itemName} to ${p.name}.`);
        saveStats(p);
    } else {
        systemMessage(`System: Could not find player ${targetName} or item ${itemName}.`);
    }
}
// --- STATS & INFO ---
function cmdShowStats(user, args) {
    let targetName = args[1] ? args[1].toLowerCase() : user.toLowerCase();
    let targetData = null;
    let finalName = "";

    let onlinePlayer = Object.values(players).find(pl => pl.name.toLowerCase() === targetName);
    
    if (onlinePlayer) {
        targetData = onlinePlayer.stats;
        finalName = onlinePlayer.name;
    } else {
        let saved = localStorage.getItem("rpg_" + targetName);
        if (saved) {
            targetData = JSON.parse(saved);
            finalName = targetName;
        }
    }

    if (targetData) {
        // Updated to include SWIM and SWIM DISTANCE
        const swimStr = `SWIM: ${targetData.swimLevel || 1} (${targetData.swimDistance || 0}m)`;
        const danceStr = `DANCE: ${targetData.danceLevel || 1}`;
        
        systemMessage(`${finalName} - CB: ${targetData.combatLevel} | ATK: ${targetData.attackLevel} | FISH: ${targetData.fishLevel} | ${swimStr} | ${danceStr} | HEAL: ${targetData.healLevel}`);
    } else {
        systemMessage(`System: Could not find stats for ${targetName}`);
    }
}
function cmdTopStats() {
    let allStats = [];
    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        if (key.startsWith("rpg_")) {
            let name = key.replace("rpg_", "");
            try {
                let data = JSON.parse(localStorage.getItem(key));
                allStats.push({ name, cb: data.combatLevel || 1 });
            } catch(e) {}
        }
    }
    allStats.sort((a, b) => b.cb - a.cb);
    let top5 = allStats.slice(0, 5).map((s, i) => `#${i+1} ${s.name}(Lv${s.cb})`).join(" | ");
    systemMessage(`TOP PLAYERS: ${top5}`);
}
// --- SOCIAL ---
function cmdMingle(p, user, args) {
    if (p.area !== "home") return;
    let target = players[args[1]] || Object.values(players).find(pl => pl.name !== user && pl.area === "home" && !pl.dead);
    if (target) { 
        p.mingleTarget = target; 
        setTimeout(() => { p.mingleTarget = null; }, 5000); 
    }
}

/* ================= THE COMFY ROUTER ================= */
/* maybe we can turn this comfyjsonchat into a function that the twitchchat script can call to run ommands from here? */
const STICKMEN_USER_CMDS = [
    { command: "attack", description: "Engage in combat at the dungeon.", usage: "attack" },
    { command: "fish", description: "Start fishing at the pond.", usage: "fish" },
    { command: "dance", description: "Perform a dance (Style 1-4).", usage: "dance [style#]" },
    { command: "bal", description: "Check your pixels balance.", usage: "bal" },
    { command: "equip", description: "Equip an item from inventory.", usage: "equip [item name]" }
];
const STICKMEN_ADMIN_CMDS = [
    { command: "showfishing", description: "Switch view to Fishing Pond.", usage: "showfishing" },
    { command: "spawnmerchant", description: "Force the merchant to appear.", usage: "spawnmerchant" },
    { command: "testdance", description: "Test an animation regardless of level.", usage: "testdance [style#]" }
];

// 1. First, define the utility functions so they are ready
function saveAllProfiles() {
    localStorage.setItem("allProfiles", JSON.stringify(profiles));
    localStorage.setItem("activeProfileIndex", activeProfileIndex);
}

function getActiveProfile() {
    return profiles[activeProfileIndex];
}

// 2. Setup defaults (using your variables)
const defaultStreamer = (typeof streamername !== 'undefined' && streamername) ? streamername : "Jaedraze";
const defaultColor = (typeof streamerColor !== 'undefined' && streamerColor) ? streamerColor : "#6441a5";

// 3. Load and Force Sync
let profiles = JSON.parse(localStorage.getItem("allProfiles"));
let activeProfileIndex = parseInt(localStorage.getItem("activeProfileIndex")) || 0;

if (!profiles || profiles.length === 0) {
    profiles = [
        { name: "Player1", color: "#00ffff" },
        { name: defaultStreamer, color: defaultColor }
    ];
} else {
    let sIndex = profiles.findIndex(pr => pr.name.toLowerCase() === defaultStreamer.toLowerCase());
    if (sIndex === -1) {
        profiles.push({ name: defaultStreamer, color: defaultColor });
    } else {
        // This is what fixes the "Purple Bug"
        profiles[sIndex].name = defaultStreamer; 
        profiles[sIndex].color = defaultColor; 
    }
}

// 4. Save the synced data
saveAllProfiles();
// THE MASTER COMMAND TRIGGER
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const msg = chatInput.value.trim();
        if (!msg) return;

        const current = getActiveProfile();
        
        // CHECK: Are we currently pretending to be the streamer?
        // If our profile name matches the Twitch streamer name, we are 'broadcaster'
        const isStreamerIdentity = (current.name.toLowerCase() === streamername.toLowerCase());

        const flags = { 
            developer: true, // Local browser always has dev access
            broadcaster: isStreamerIdentity, // Gain streamer powers if name matches
            mod: isStreamerIdentity 
        };

        processGameCommand(current.name, msg, flags, { userColor: current.color });

        chatInput.value = ""; 
    }
});
// Function to update profile via commands
function updateBrowserProfile(newName, newColor) {
    const current = getActiveProfile();
    if (!current) return;

    if (newName && newName !== current.name) {
        // Migrate stats to the new name in LocalStorage
        const oldKey = "rpg_" + current.name.toLowerCase();
        const newKey = "rpg_" + newName.toLowerCase();
        const data = localStorage.getItem(oldKey);
        if (data) {
            localStorage.setItem(newKey, data);
            localStorage.removeItem(oldKey);
        }
        // Remove the old player object so it recreates with the new name
        if (players[current.name.toLowerCase()]) delete players[current.name.toLowerCase()];
        current.name = newName;
    }

    if (newColor) {
        current.color = newColor;
        const p = players[current.name.toLowerCase()];
        if (p) p.color = newColor;
    }
    
    saveAllProfiles();
    refreshProfileUI();
}
// --- 2. THE REFRESH FUNCTION ---
function refreshProfileUI() {
    // Safety check: stop if elements are missing
    if (!profileSelector) {
        console.warn("UI Error: profileSelector element not found in HTML.");
        return;
    }

    profileSelector.innerHTML = "";
    profiles.forEach((p, index) => {
        let opt = document.createElement("option");
        opt.value = index;
        opt.textContent = p.name;
        if (index === activeProfileIndex) opt.selected = true;
        profileSelector.appendChild(opt);
    });

    const current = getActiveProfile();
    if (current && colorPicker) {
        let activeColor = current.color; 
        // Force string conversion in case of object contamination
        if (typeof activeColor === 'object') activeColor = activeColor.userColor || "#00ffff";
        colorPicker.value = activeColor;
    }
}
profileSelector.addEventListener("change", (e) => {
    activeProfileIndex = parseInt(e.target.value);
    saveAllProfiles();
    refreshProfileUI();
    
    const current = getActiveProfile();
    // This forces the stickman to appear immediately
    getPlayer(current.name, current.color);
    
    systemMessage(`Active Player: ${current.name}`);
});
function processGameCommand(user, msg, flags = {}, extra = {}) {
	const current = getActiveProfile();
    if (current && user.toLowerCase() === current.name.toLowerCase()) {
        let twitchColor = (typeof extra.userColor === 'string') ? extra.userColor : null;
        
        // If Twitch sends a valid color, and it's different from our current profile color
        if (twitchColor && current.color !== twitchColor) {
            console.log(`Syncing ${user}'s color to Twitch: ${twitchColor}`);
            current.color = twitchColor;
            
            // Update the actual player stickman immediately
            let pObj = players[user.toLowerCase()];
            if (pObj) pObj.color = twitchColor;

            saveAllProfiles();
            refreshProfileUI();
        }
    }
    let p = getPlayer(user, extra.userColor);
    let args = msg.split(" ");
    let cmd = args[0].toLowerCase();

    // --- 1. ADMIN & AUTHORIZATION CHECK ---
	const adminCommands = [
			"showhome", "showdungeon", "showpond", "spawnmerchant", 
			"despawnmerchant", "resetmerchant", "give", "additem", "scrub",
			"name", "/name", "color", "/color" // Added these here
	];
    if (adminCommands.includes(cmd)) {
        // If it's the browser (developer) OR passes your Twitch streamer check
        let isAuthorized = flags.developer || isStreamerAndAuthorize(user, cmd);
        
        if (!isAuthorized) {
            console.warn(`Unauthorized admin attempt: ${user} tried ${cmd}`);
            return; 
        }
		// Add these to processGameCommand
		if (cmd === "/newprofile") {
			if (flags.developer) {
				let newName = args[1];
				if (newName) {
					profiles.push({ name: newName, color: "#ffffff" });
					activeProfileIndex = profiles.length - 1;
					saveAllProfiles();
					refreshProfileUI();
					systemMessage(`Created and switched to profile: ${newName}`);
				}
			}
			return;
		}
        // Admin Logic Execution
        if (cmd === "scrub") { scrubAllInventories(); return; }
        if (cmd === "give" || cmd === "additem") {
            let target = args[1];
            let item = args.slice(2).join(" ");
            addItemToPlayer(target, item);
            return;
        }
        if (cmd === "showhome" || cmd === "home") { viewArea = "home"; return; }
        if (cmd === "showdungeon" || cmd === "dungeon") { viewArea = "dungeon"; return; }
        if (cmd === "showpond" || cmd === "pond") { viewArea = "pond"; return; }
        if (cmd === "showarena" || cmd === "arena") { viewArea = "arena"; return; }
		if (cmd === "showtown" || cmd === "town") { viewArea = "town"; return; }
        if (cmd === "spawnmerchant") { forceBuyer = true; updateBuyerNPC(); systemMessage("[Pond] Merchant spawned."); return; }
        if (cmd === "despawnmerchant") { forceBuyer = false; updateBuyerNPC(); systemMessage("[Pond] Merchant removed."); return; }
        if (cmd === "resetmerchant") { forceBuyer = null; updateBuyerNPC(); return; }
		// COMMAND: /name [NewName]
		if (cmd === "name" || cmd === "/name") {
			if (flags.developer) {
				let newName = args[1];
				if (newName) {
					updateBrowserProfile(newName, null);
				}
			}
			return;
		}

		// COMMAND: /color [HexCode]
		if (cmd === "color" || cmd === "/color") {
			if (flags.developer) {
				let newColor = args[1]; // e.g., #ff0000
				if (newColor && newColor.startsWith("#")) {
					updateBrowserProfile(null, newColor);
				} else {
					systemMessage("Usage: /color #ff0000");
				}
			}
			return;
		}
    }

    // --- 2. STANDARD PLAYER COMMANDS (Everyone) ---
    if (cmd === "clear" || cmd === "!clear") { clearPlayerInventory(p.name); return; }
    if (cmd === "stop" || cmd === "idle" || cmd === "!reset") { cmdStop(p, user); return; }
    if (cmd === "attack") { cmdAttack(p, user); return; }
    if (cmd === "fish")   { cmdFish(p, user); return; }
    if (cmd === "swim")   { cmdSwim(p, user); return; }
    // Add 'user' so the function gets: (player object, name string, arguments array)
	if (cmd === "heal") { cmdHeal(p, user, args); return; }
    if (cmd === "dance")  { cmdDance(p, user, args); return; }
	if (cmd === "lurk")   { cmdLurk(p, user); return; }
    if (cmd === "travel") { movePlayer(p, args[1]); return; }
    if (cmd === "home")   { movePlayer(p, "home"); return; }
	if (cmd === "pond")   { movePlayer(p, "pond"); return; }
	if (cmd === "town")   { movePlayer(p, "town"); return; }
	if (cmd === "arena")   { movePlayer(p, "arena"); return; }
    if (cmd === "dungeon"){ movePlayer(p, "dungeon"); return; }
    if (cmd === "join")   { joinDungeonQueue(p); return; }
	if (cmd === "pvp")   { joinArenaQueue(p); return; }
    if (cmd === "inventory") { cmdInventory(p, user, args); return; }
    if (cmd === "equip")     { cmdEquip(p, args); return; }
    if (cmd === "unequip")   { cmdUnequip(p, args); return; }
    if (cmd === "sell")      { cmdSell(p, user, args); return; }
    if (cmd === "bal" || cmd === "money") { cmdBalance(p); return; }
	if (cmd === "wigcolor")  { cmdWigColor(p, args); return; } // Added back
	if (cmd === "listdances") { cmdListDances(p); return; }
    if (cmd === "respawn") { 
		cmdRespawn(p); 
		return; 
	}
	
}

//ComfyJS.onChat = (user, msg, color, flags, extra) => {

ComfyJS.onChat = (user, msg, color, flags, extra) => {
    // Keep track of colors
    if (!userColors[user]) {
        userColors[user] = extra.userColor || "orangered";
    }

    // Pass everything to the Master Router
    processGameCommand(user, msg, flags, extra);
};


let uiCache = {}
function syncUI(id, content, parentId) {
    // 1. Get or Create from Cache
    if (!uiCache[id]) {
        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement("div");
            el.id = id;
            const parent = document.getElementById(parentId);
            if (parent) parent.appendChild(el);
        }
        uiCache[id] = el;
    }

    const element = uiCache[id];

    // 2. ONLY update if content is different
    // This prevents the browser from re-rendering the text 60 times a second
    if (element.innerHTML !== content) {
        element.innerHTML = content;
    }
}





document.addEventListener("DOMContentLoaded", () => {
    // 1. Action Bar
    const actionBar = document.getElementById("action-bar");
    if (actionBar) {
        actionBar.addEventListener("click", (event) => {
            const btn = event.target.closest("button");
            if (btn) {
                const action = btn.getAttribute("data-action");
                if (action) sendAction(action);
            }
        });
    }
	const viewAreaSelector = document.getElementById("view-area-selector");
	viewAreaSelector.addEventListener("change", (e) => {
		const newArea = e.target.value;
		viewArea = newArea;
		// Force the dropdown text to update right now
		updateAreaPlayerCounts(); 
	});

    // 3. Inventory Filters & Sort
    const filterContainer = document.getElementById("inventory-filters");
    if (filterContainer) {
        filterContainer.addEventListener("click", (e) => {
            if (e.target.classList.contains("filter-btn")) {
                document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
                e.target.classList.add("active");
                currentInventoryFilter = e.target.getAttribute("data-filter");
                renderInventoryUI();
            }
        });
    }

    const hideEquippedCheck = document.getElementById("filter-hide-equipped");
    if (hideEquippedCheck) hideEquippedCheck.addEventListener("change", renderInventoryUI);

    const sortSelect = document.getElementById("inv-sort-mode");
    if (sortSelect) {
        sortSelect.addEventListener("change", (e) => {
            currentSortMode = e.target.value;
            renderInventoryUI();
        });
    }

    // 4. NEW: Tab Switching for Items / Stats / Achievements
    const tabContainer = document.getElementById("inventory-tabs"); // Ensure you have a container with this ID
    if (tabContainer) {
        tabContainer.addEventListener("click", (e) => {
            const btn = e.target.closest("button");
            if (btn && btn.getAttribute("data-view")) {
                currentInventoryView = btn.getAttribute("data-view");
                
                // UI feedback for active tab
                document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active-tab"));
                btn.classList.add("active-tab");
                
                renderInventoryUI();
            }
        });
    }
});

//==========================
//RUNNING ON LOAD
gameLoop();