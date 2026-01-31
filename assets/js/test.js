
// offshoot game called stickmenpo - samurai ninja game?
// still need story mode, streamer helped by chat can unlock things for everyone? new areas? new skills? boating?


const stickmenfall_Config = {
    // ... your other config settings
    idleViewInterval: 3 * 60 * 1000, // 6 minutes in ms
    idleViewEnabled: false          // Off by default
};
let cameraTransition = {
    active: false,
    alpha: 1.0, // Start at 1.0 (visible)
    targetArea: null,
    state: "out" // "out" for fading out (to transparent), "in" for fading back in
};
let lastIdleSwitchTime = Date.now();
function runIdleViewMode() {
    if (!stickmenfall_Config.idleViewEnabled || (viewArea === "dungeon" && dungeonActive) || cameraTransition.active) {
        return;
    }

    const now = Date.now();
    const areaCounts = {};
    Object.values(players).forEach(p => {
        areaCounts[p.area] = (areaCounts[p.area] || 0) + 1;
    });

    // BUG FIX: Ensure we only look at areas that ARE NOT the current viewArea
    const otherAreasWithPlayers = Object.keys(areaCounts).filter(area => area !== viewArea);
    
    if (otherAreasWithPlayers.length === 0) return;

    const currentAreaEmpty = (areaCounts[viewArea] || 0) === 0;
    const timerExpired = (now - lastIdleSwitchTime) >= stickmenfall_Config.idleViewInterval;

    if (currentAreaEmpty || timerExpired) {
        let pool = [];
        otherAreasWithPlayers.forEach(area => {
            const count = areaCounts[area];
            for (let i = 0; i < count; i++) {
                pool.push(area);
            }
        });

        if (pool.length > 0) {
            const selectedArea = pool[Math.floor(Math.random() * pool.length)];
            
            // Start the opacity dissolve
            cameraTransition.active = true;
            cameraTransition.alpha = 1.0;
            cameraTransition.state = "out";
            cameraTransition.targetArea = selectedArea;
            
            lastIdleSwitchTime = now;
        }
    }
}
function drawDirectorIndicator(ctx) {
    if (!stickmenfall_Config.idleViewEnabled) return;

    ctx.save();

    // Position in top-right corner
    const x = c.width - 60;
    const y = 40;
    const now = Date.now();
	// Inside drawDirectorIndicator
	const timeElapsed = now - lastIdleSwitchTime;
	const timeLeft = Math.max(0, stickmenfall_Config.idleViewInterval - timeElapsed);
	const seconds = Math.ceil(timeLeft / 1000);

	if (seconds <= 10) { // Only show countdown for the last 10 seconds
		ctx.fillStyle = "#ffaa00";
		ctx.fillText(`Switching in ${seconds}s`, x - 5, y + 28);
	}
    // 1. Draw the "REC" Dot (Blinks every second)
    const isRed = Math.floor(now / 1000) % 2 === 0;
    ctx.fillStyle = isRed ? "#ff0000" : "#550000";
    ctx.beginPath();
    ctx.arc(x - 45, y - 5, 4, 0, Math.PI * 2);
    ctx.fill();

    // 2. Draw "AUTO" Text
    ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
    ctx.font = "bold 10px monospace";
    ctx.textAlign = "right";
    ctx.fillText("AUTO-CAM", x - 5, y + 15);

    // 3. Draw the Cameraman (Mini Stickman)
    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 2;
    
    // Body
    ctx.beginPath();
    ctx.moveTo(x, y); ctx.lineTo(x, y + 10); // Torso
    ctx.moveTo(x, y + 10); ctx.lineTo(x - 5, y + 18); // Leg L
    ctx.moveTo(x, y + 10); ctx.lineTo(x + 5, y + 18); // Leg R
    ctx.stroke();

    // Head
    ctx.beginPath();
    ctx.arc(x, y - 5, 4, 0, Math.PI * 2);
    ctx.stroke();

    // The Camera (Rectangle with lens)
    ctx.fillStyle = "#333";
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 1;
    ctx.fillRect(x - 12, y - 2, 10, 6); // Camera body
    ctx.strokeRect(x - 12, y - 2, 10, 6);
    ctx.beginPath();
    ctx.arc(x - 14, y + 1, 2, 0, Math.PI * 2); // Lens
    ctx.fill();
    ctx.stroke();

    // Arms holding the camera
    ctx.strokeStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(x, y + 2); ctx.lineTo(x - 6, y + 2);
    ctx.stroke();

    ctx.restore();
}
function startCameraFade(target) {
    cameraTransition.active = true;
    cameraTransition.alpha = 1.0;  // Start fully visible
    cameraTransition.state = "out"; // Fade OUT to transparent
    cameraTransition.targetArea = target;
}

function updateAndDrawFade(ctx, width, height) {
    if (!cameraTransition.active) return;

    const speed = 0.02; 

    if (cameraTransition.state === "out") {
        cameraTransition.alpha -= speed;
        if (cameraTransition.alpha <= 0) {
            cameraTransition.alpha = 0;
            // SWAP AREA WHILE INVISIBLE
            changeViewArea(cameraTransition.targetArea);
            cameraTransition.state = "in";
        }
    } else {
        cameraTransition.alpha += speed;
        if (cameraTransition.alpha >= 1) {
            cameraTransition.alpha = 1;
            cameraTransition.active = false;
        }
    }
}
// Helper to sync the UI when switching
function changeViewArea(newArea) {
    viewArea = newArea;
    const selector = document.getElementById("view-area-selector");
    if (selector) selector.value = newArea;
    // Reset the idle timer so the AI waits another 6 minutes 
    // from the moment the area was changed (manually or automatically)
    lastIdleSwitchTime = Date.now(); 
}
// creation tool. make a pen u can draw with, 
//choose if its a player body, an enemy, a weapon, an armour, a helmet, a bow, a staff or a graffiti or npc, or projectile or face or  and save data

//dont Constants and important things
const c = document.getElementById("c");
const areaDisplayDiv = document.getElementById("areaDisplay");
const ctx = c.getContext("2d");
let mouse = { x: 0, y: 0 };
let players = {};
let viewArea = "home"; 

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

/* ================= DATA PERSISTENCE ================= */
function loadStats(name) {
    const saved = localStorage.getItem("rpg_" + name);
    let stats = saved ? JSON.parse(saved) : {
		lastArea: "home",
		maxhp:100,
		currentHp: 100,
		pixels: 1500,
		lastX: 400,
        lastY: 460,
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
    if (stats.lastY === undefined) stats.lastY = 460;
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
const SKILL_INFO = {
    "Attack": { info: "Gained by hitting enemies.", rate: "5 XP / hit", bonus: "Increases Max Hit" },
    "Archery": { info: "Gained using bows.", rate: "6 XP / hit", bonus: "Increases Attack Speed" },
    "Magic": { info: "Gained using staves.", rate: "8 XP / cast", bonus: "Increases Spell Damage" },
    "Healing": { info: "Gained by healing.", rate: "10 XP / heal", bonus: "Increases Heal Amount" },
    "Lurking": { info: "Gained while hidden.", rate: "2 XP / sec", bonus: "Increased dodge Chance" },
    "Fishing": { info: "Gained by catching fish.", rate: "15-50 XP / catch", bonus: "Bigger & Better Fish" },
    "Swimming": { info: "Gained by swimming in water.", rate: "3 XP / sec", bonus: "Higher Max Oxygen" },
    "Dancing": { info: "Gained by vibing.", rate: "5 XP / tick", bonus: "Global Luck Boost" }
};
const ACHIEVEMENT_DB = {
    // Pond Achievements
    "Fishing Rod": { check: (s) => s.pond.visited === true, text: "Visit the Pond" },
    
    // Arena Achievements
	"Crude Axe": { check: (s) => s.arena.wins >= 1, text: "Win 1 Arena matches" },
	"Iron Axe": { check: (s) => s.arena.wins >= 10, text: "Win 10 Arena matches" },
	"Steel Axe": { check: (s) => s.arena.wins >= 25, text: "Win 25 Arena matches" },
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

    Object.keys(ACHIEVEMENT_DB).forEach(itemName => {
        const goal = ACHIEVEMENT_DB[itemName];
        
        const equippedItems = [
            s.equippedWeapon, s.equippedArmor, s.equippedHelmet, 
            s.equippedBoots, s.equippedPants, s.equippedCape, 
            s.equippedGloves, s.equippedHair
        ];

        const owned = s.inventory.includes(itemName) || equippedItems.includes(itemName);

        if (goal.check(s) && !owned) {
            s.inventory.push(itemName);
            unlockedAny = true;
            announceAchievement(p, itemName);
        }
    });

    return unlockedAny;
}
// Replace the dungeon section of checkAchievements with this specific function
function rewardTierMastery(p, tier) {
    const s = p.stats;
    if (!s.dungeon.completedTiers) s.dungeon.completedTiers = [];

    // ONLY reward if they haven't cleared THIS specific tier before
    if (!s.dungeon.completedTiers.includes(tier)) {
        s.dungeon.completedTiers.push(tier);
        s.inventory.push("Achievement Trophy");
        announceAchievement(p, `Tier ${tier} Mastery`);
        saveStats(p); 
    }
}
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
        stats: loadedStats,
		cooldowns: {}
    };

    updateCombatLevel(players[lowName]);
    
    // Set HP from persistence or 25% floor
    //players[lowName].hp = loadedStats.currentHp || Math.floor(players[lowName].maxHp);
	players[lowName].hp = loadedStats.currentHp || loadedStats.maxhp;
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

    Object.values(players).forEach(p => {
        if (p.area === viewArea && Math.hypot(p.x - mouse.x, p.y - mouse.y) < 30) hover = p;
    });

    if (viewArea === "dungeon") {
        enemies.forEach(e => { if(!e.dead && Math.hypot(e.x - mouse.x, e.y - mouse.y) < 20) hover = e; });
        if (boss && !boss.dead && Math.hypot(boss.x - mouse.x, boss.y - mouse.y) < 40) hover = boss;
    }

    if (hover) {
        tt.style.display = "block";
        tt.style.left = (mouse.x + 15) + "px";
        tt.style.top = (mouse.y + 15) + "px";

        if (hover.isEnemy || hover.isBoss) {
            tt.innerHTML = `<b style="color:#ff4444">${hover.name}</b><br>HP: ${Math.floor(hover.hp)}/${Math.floor(hover.maxHp)}`;
        } else {
            let statusText = "";
            let nameStyle = "color: white;";

            if (hover.dead) {
                const timeDead = Date.now() - hover.deathTime;
                
                // Timeline match: 0-5m (Fresh), 5-10m (Decaying), 10-15m (Buried), 15m+ (Ghost)
                const isGhost = timeDead > (15 * 60 * 1000);
                const isBuried = timeDead > (10 * 60 * 1000);
                const isDecaying = timeDead > (5 * 60 * 1000);

                let statusLabel = "DEAD";
                let labelColor = "#ff4444";

                if (isGhost) {
                    statusLabel = "GHOST";
                    labelColor = "#a0f0ff"; // Ghostly Cyan
                } else if (isBuried) {
                    statusLabel = "BURIED";
                    labelColor = "#888888"; // Stone Grey
                } else if (isDecaying) {
                    statusLabel = "DECAYING";
                    labelColor = "#708090"; // Slate Blue/Grey
                }

                statusText = `<b style="color:${labelColor}">${statusLabel}</b>`;
                nameStyle = "color: #aaaaaa; text-decoration: line-through;";
            } else {
                statusText = `HP: ${Math.floor(hover.hp)}/${Math.floor(hover.maxHp)}<br>Task: ${hover.activeTask || 'Idle'}`;
            }

            tt.innerHTML = `<span style="${nameStyle}"><b>${hover.name}</b></span> [Lv ${hover.stats.combatLevel}]<br>${statusText}`;
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
    const respawnBtn = document.getElementById('bubble-respawn-btn');
    const rect = c.getBoundingClientRect();

    bubble.classList.remove('hidden');
    document.getElementById('bubble-name').textContent = p.name;

    // Only show the Respawn button if the player is actually dead
    if (p.dead) {
        respawnBtn.style.display = "inline-block";
    } else {
        respawnBtn.style.display = "none";
    }

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

            //toggleInventory(); 
            toggleStickmenInventory(selectedPlayerForBubble);
            document.getElementById("player-context-bubble").classList.add('hidden');
        }
    });

    document.getElementById('bubble-respawn-btn').addEventListener('click', () => {
        if (selectedPlayerForBubble) {
            processGameCommand(selectedPlayerForBubble.name, "!respawn");
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

    const now = Date.now();

    // 1. Identify Target
    let target = (p.area === "dungeon") 
        ? (enemies.find(e => !e.dead) || (boss && !boss.dead ? boss : null))
        : Object.values(players).find(pl => pl.area === p.area && !pl.dead && pl.name !== p.name);

    if (!target) {
        p.targetX = null;
        return; 
    }

    // --- Facing Logic ---
    p.facing = (target.x > p.x) ? 1 : -1;

    // 2. Weapon & Style Stats
    const weaponKey = p.stats?.equippedWeapon || p.equipped?.weapon;
    const weapon = ITEM_DB[weaponKey];
    
    // Fallback to "Unarmed/Boxing" stats
    const isUnarmed = !weapon;
    const type = isUnarmed ? "unarmed" : weapon.type;
    const skillType = (type === "bow") ? "archer" : (type === "staff" ? "magic" : "attack");
    
    // Boxing range is tight (40), Melee is (60), Ranged is (250)
    const rangeNeeded = isUnarmed ? 40 : (type === "bow" || type === "staff" ? 250 : 60);
    const attackSpeed = isUnarmed ? 800 : (weapon.speed || 1000);

    // 3. Positioning Logic
    const dist = Math.abs(p.x - target.x);

    if (dist > rangeNeeded) {
        // Generate a slightly unique offset so players don't stack perfectly on one pixel
        const jitter = ((p.zLane || 0) % 10) - 5; 
        const finalRange = rangeNeeded - 10 + jitter;
        
        const offset = p.x < target.x ? -finalRange : finalRange;
        p.targetX = target.x + offset;
    } else {
        // We are in range! Stop walking and start swinging
        p.targetX = null;
        
        // Initialize timer if this is the start of the fight
        if (!p.lastAttackTime) p.lastAttackTime = now - attackSpeed;

        // 4. Attack Execution
        if (now - p.lastAttackTime > attackSpeed) {
            const skillLvl = p.stats[skillType + "Level"] || 1;
            const power = isUnarmed ? 0 : (weapon.power || 0);
            const rawDmg = 5 + (skillLvl * 2) + power;

            // Visual Projectiles
            if (type === "bow") {
                spawnProjectile(p.x, p.y - 12, target.x, target.y - 15, "#fff", "arrow", p.area);
            } else if (type === "staff") {
                spawnProjectile(p.x, p.y - 12, target.x, target.y - 15, weapon?.color || "#00ffff", "magic", p.area);
            }

            // Apply Damage
            applyDamage(target, rawDmg);
            p.lastAttackTime = now; 

            // Handle Loot/Stats on kill
            if (target.hp <= 0 && (target.isEnemy || target.isBoss)) {
                if (!p.stats.dungeon) p.stats.dungeon = { highestTier: 0, kills: 0, bossKills: 0 };
                p.stats.dungeon.kills++;
                handleLoot(p, target);
            }

            // Award XP
            const xpGain = 10;
            p.stats[skillType + "XP"] = (p.stats[skillType + "XP"] || 0) + xpGain;
            
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
        // 5% base + 1% per level, capped at 35%
        let dodgeChance = Math.min(0.35, 0.05 + (target.stats.lurkLevel * 0.01));
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
// HEALING
function performHeal(p, mode = "auto", target = null) {
    const healLvl = p.stats.healLevel || 1;
    const now = Date.now();

    if (mode !== "auto" && p.lastManualHeal && now - p.lastManualHeal < 2000) return;
    if (mode !== "auto") p.lastManualHeal = now;

    let allies = Object.values(players).filter(pl => pl.area === p.area && !pl.dead);
    
    // --- CALCULATE POWER ---
    let baseAmt = 10 + (healLvl * 5); 

    if (mode === "focus" && target) {
        // Apply Self-Heal Penalty (50% reduction if healing self)
        let finalAmt = (target.name === p.name) ? Math.floor(baseAmt * 0.5) : baseAmt;
        applyHealEffect(p, target, finalAmt, "focus");
    } 
    else if (mode === "all") {
        // Team heal: Healer gets 40% of base, Others get 40%
        allies.forEach(a => {
            let amount = Math.floor(baseAmt * 0.4);
            // Even in "all" mode, healers get less back for themselves
            if (a.name === p.name) amount = Math.floor(amount * 0.5); 
            applyHealEffect(p, a, amount, "all");
        });
    } 
    else if (mode === "auto") {
        let needyAllies = allies.filter(a => a.hp < a.maxHp);
        if (needyAllies.length === 0) return;
        
        // BALANCE: Auto-heal now prioritizes other players over the self.
        // It sorts by HP%, but gives a "priority boost" to anyone who isn't the healer.
        needyAllies.sort((a, b) => {
            let scoreA = (a.hp / a.maxHp) + (a.name === p.name ? 0.3 : 0); // Self is treated as having +30% HP
            let scoreB = (b.hp / b.maxHp) + (b.name === p.name ? 0.3 : 0);
            return scoreA - scoreB;
        });

        let autoTarget = needyAllies[0];
        let autoAmt = Math.floor(baseAmt * 0.7);
        
        // Reduce auto-heal effectiveness if it finally decides to heal the caster
        if (autoTarget.name === p.name) autoAmt = Math.floor(autoAmt * 0.5);
        
        applyHealEffect(p, autoTarget, autoAmt, "auto");
    }
}
// Helper to handle the actual HP gain, XP, and Visuals
function applyHealEffect(p, target, amount, mode) {
    if (target.hp >= target.maxHp && mode !== "all") return;

    // Diminishing XP: Healing someone already healthy gives less reward
    const healthRatio = target.hp / target.maxHp;
    let xpMultiplier = 1.0;
    if (healthRatio > 0.8) xpMultiplier = 0.5; // Half XP if target is >80% health

    target.hp = Math.min(target.maxHp, target.hp + amount);

    if (target.stats) {
        target.stats.currentHp = target.hp;
    }

    const healerWeapon = ITEM_DB[p.stats.equippedWeapon] || {};
    // Visual distinction: Redder projectile if healing self (Self-penalty indicator)
    let healColor = (target.name === p.name) ? "#ff99ff" : (healerWeapon.color || "#00ffff");
    
    spawnProjectile(p.x, p.y - 20, target.x, target.y - 20, healColor, "magic", p.area);
    spawnFloater(target, `+${amount} HP`, (target.name === p.name ? "#ffaa00" : "#0f0"));

    // XP Award with Multiplier
    let baseXP = (mode === "focus" ? 20 : (mode === "all" ? 10 : 15));
    p.stats.healXP = (p.stats.healXP || 0) + Math.floor(baseXP * xpMultiplier);

    if (p.stats.healXP >= xpNeeded(p.stats.healLevel)) {
        p.stats.healLevel++;
        p.stats.healXP = 0;
        spawnFloater(p, `HEAL LEVEL UP! (${p.stats.healLevel})`, "#FFD700");
        updateCombatLevel(p);
    }
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

function getStruggleLimit(p) {
    const swimLvl = p.stats.swimmingLevel || 1;
    // Level 1 = 30s. Each level adds 10s. 
    // Formula: 30 + (Level - 1) * 10
    const seconds = 30 + (swimLvl - 1) * 10;
    return seconds * 1000; // Return in milliseconds
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
/* function handleLurking(p, now) {
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

 */
function handleLurking(p, now) {
    if (!p.lastLurkXP) p.lastLurkXP = 0;
    
    // 1. XP TICK (Every 5 seconds)
    if (now - p.lastLurkXP > 5000) {
        // Base gain
        let xpGain = 8; 

        // BONUS: If an enemy is nearby (within 150px) but hasn't "detected" them, 
        // give them double XP for the risk!
        const risky = (typeof enemies !== 'undefined') && enemies.some(e => !e.dead && Math.hypot(e.x - p.x, e.y - p.y) < 150);
        if (risky) {
            xpGain *= 2;
            spawnFloater(p, "Risky Lurk!", "#a020f0");
        }

        p.stats.lurkXP += xpGain;
        p.lastLurkXP = now;

        let nextLevelXP = xpNeeded(p.stats.lurkLevel);
        if (p.stats.lurkXP >= nextLevelXP) {
            p.stats.lurkLevel++;
            p.stats.lurkXP = 0;
            
            // Level up floater (Dark purple/gray)
            spawnFloater(p, `LURK LEVEL ${p.stats.lurkLevel}!`, "#4b0082");
            updateCombatLevel(p);
        }
    }

    // 2. VISUAL POLISH (Shadow Particles)
    // Occasionally spawn a puff of "shadow" to show they are hiding
    if (frameCount % 180 === 0) {
        spawnFloater(p, "◌", "rgba(75, 0, 130, 0.3)");
    }
}
const TRAINING_CONFIG = {
    "pushups":  { skill: "attack", xp: 10 },
    "meditate": { skill: "magic",  xp: 5  }
};
function performTraining(p, trainingType) {
    if (p.dead) return;
    const config = TRAINING_CONFIG[trainingType];
    if (!config) return;

    // Set the task so the game loop knows they are currently training
    p.activeTask = "training";
    p.trainingType = trainingType; 

    // Initial XP award
    const skillType = config.skill;
    p.stats[skillType + "XP"] = (p.stats[skillType + "XP"] || 0) + config.xp;
    
    systemMessage(`${p.name} is now training ${skillType}!`);
}
function handleTraining(p, now) {
    if (!p.lastTrainingXP) p.lastTrainingXP = now;

    // Award XP every 5 seconds
    if (now - p.lastTrainingXP > 5000) {

        // FIX: Change trainingType to p.trainingType
        const config = TRAINING_CONFIG[p.trainingType]; 
        
        if (!config) return;

        const skillType = config.skill;
        p.stats[skillType + "XP"] = (p.stats[skillType + "XP"] || 0) + config.xp;
        p.lastTrainingXP = now;

        // Level up logic...
        let currentLvl = p.stats[skillType + "Level"] || 1;
        if (p.stats[skillType + "XP"] >= xpNeeded(currentLvl)) {
            p.stats[skillType + "Level"] = currentLvl + 1;
            p.stats[skillType + "XP"] = 0;
            spawnFloater(p, `${skillType.toUpperCase()} LVL ${p.stats[skillType + "Level"]}!`, "#FFD700");
            updateCombatLevel(p);
        }
    }
}
//============================================================
// ============== 	FISHING MERCHANT STUFF ===================
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
    
    const bx = 75; 
    const by = 325; 
    const now = Date.now();
    
    // Animation Constants
    let floatY = Math.sin(now / 800) * 8;
    let sway = Math.sin(now / 400) * 4;
    let gemPulse = 8 + Math.abs(Math.sin(now / 500)) * 12;
    let shadowScale = 1 - (Math.abs(floatY) / 40); // Shadow shrinks as she rises

    ctx.save();

    // --- 1. GROUND SHADOW (Static on floor, scales with height) ---
    ctx.fillStyle = "rgba(0, 0, 0, 0.25)";
    ctx.beginPath();
    ctx.ellipse(bx, by + 32, 15 * shadowScale, 5 * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    // Move to floating position
    ctx.translate(bx, by + floatY);

    // --- 2. THE TRAILING CAPE (Back Layer) ---
    ctx.fillStyle = "#1a0821"; // Darker depth purple
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.quadraticCurveTo(-30 + sway, 10, -18 + sway, 40);
    ctx.lineTo(8, 35);
    ctx.fill();

    // --- 3. THE SKELETON (Using your stickman style for consistency) ---
    ctx.strokeStyle = "#111";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    // Legs disappearing into cloak
    ctx.beginPath();
    ctx.moveTo(-4, 5); ctx.lineTo(-6, 25);
    ctx.moveTo(4, 5); ctx.lineTo(6, 25);
    ctx.stroke();

    // --- 4. STRUCTURED CLOAK & TRIM ---
    ctx.fillStyle = "#4B0082"; 
    ctx.beginPath();
    ctx.moveTo(0, -35); // Neck
    ctx.bezierCurveTo(-20, -10, -22, 15, -15, 30); // Back
    ctx.lineTo(18, 30); // Bottom
    ctx.bezierCurveTo(12, 15, 15, -10, 0, -35); // Front
    ctx.fill();

    // Golden Trim Border
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 1.8;
    ctx.stroke();

    // --- 5. THE STAFF (Sandwiched behind arm, in front of body) ---
    // Staff Wood
    ctx.strokeStyle = "#3e2723";
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(22, 35);
    ctx.lineTo(22, -55);
    ctx.stroke();

    // Staff Gemstone Glow
    ctx.shadowBlur = gemPulse;
    ctx.shadowColor = "#00ffff";
    ctx.fillStyle = "#e0ffff";
    ctx.beginPath();
    ctx.arc(22, -60, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0; // Reset shadow immediately

    // Staff Decorative Rings
    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, -50, 4, 2);
    ctx.strokeRect(20, -45, 4, 2);

    // --- 6. ARMS ---
    ctx.strokeStyle = "#ffdbac"; 
    ctx.lineWidth = 3;
    // Holding the staff
    ctx.beginPath();
    ctx.moveTo(5, -12);
    ctx.lineTo(22, -15);
    ctx.stroke();

    // --- 7. THE DEEP HOODED HEAD ---
    // Black Void of Hood
    ctx.fillStyle = "#050505";
    ctx.beginPath();
    ctx.ellipse(3, -48, 10, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Eyes (Bright cyan glow)
    ctx.fillStyle = "#00ffff";
    ctx.shadowBlur = 5;
    ctx.shadowColor = "#00ffff";
    ctx.beginPath();
    ctx.arc(7, -49, 2, 0, Math.PI * 2);
    ctx.arc(12, -49, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Outer Hood Cowl
    ctx.fillStyle = "#4B0082";
    ctx.beginPath();
    ctx.moveTo(-10, -42);
    ctx.quadraticCurveTo(0, -70, 18, -42);
    ctx.quadraticCurveTo(22, -32, 12, -38);
    ctx.lineTo(-10, -38);
    ctx.fill();

    // --- 8. MAGICAL EMISSIONS ---
    // Gold particles that drift upward
    if (Math.random() > 0.8) {
        ctx.fillStyle = "#FFD700";
        let px = (Math.random() * 40) - 20;
        let py = (Math.random() * 60) - 30;
        ctx.globalAlpha = Math.random();
        ctx.beginPath();
        ctx.arc(px, py, 1.2, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();

    // --- 9. UI LABELS (Outside translate to prevent text wobble) ---
    ctx.textAlign = "center";
    ctx.font = "bold 13px monospace";
    let uiY = by + floatY - 85;

    // Name Label with drop shadow
    ctx.fillStyle = "black";
    ctx.fillText("MYSTERIOUS MERCHANT", bx + 1, uiY + 1);
    ctx.fillStyle = "#FFD700";
    ctx.fillText("MYSTERIOUS MERCHANT", bx, uiY);
    
    // Subtext (Animated pulse)
    let pulseText = Math.abs(Math.sin(now/1000));
    ctx.font = "bold 11px monospace";
    ctx.fillStyle = `rgba(0, 255, 255, ${0.5 + pulseText * 0.5})`;
    ctx.fillText("✦ 2X PIXEL RATE ✦", bx, uiY + 16);
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
let dungeonGraceTimer = null;
let dungeonGraceSeconds = 0;
let isDungeonResting = false; // Prevents progress checks during rest
const dungeonUIConfig = {
    header: "PARTY STATUS",
    labels: {
        theme: (name) => `📍 ${name}`, // New label for the Area Name
        wave: (num, tier) => `WAVE ${num} (Tier ${tier})`,
        rest: (s) => `RESTING: ${s}s`,
        timer: (s) => `DUNGEON: ${s}s`,
        boss: (name, hp) => `${name}: ${hp}%` // Updated to show the Boss Name
    },
    getStatusClass: (pct, isDead) => {
        if (isDead) return "hp-dead";
        if (pct < 30) return "hp-danger";
        return "hp-healthy";
    }
};
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
/**
 * Wave 1-5 = Tier 1, 6-10 = Tier 2, etc.
 */
function testDungeonTier(p, targetTier, targetWave = null) {
    if (p.dead) return;

    // FIX: Clear the queue so real players don't accidentally get pulled into your test
    dungeonQueue = []; 

    // 1. Force state reset
    dungeonActive = true;
    isDungeonResting = false;
    enemies = [];
    boss = null;
    if (dungeonCountdownInterval) { 
		clearInterval(dungeonCountdownInterval); 
		dungeonCountdownInterval = null; 
	}
    // 2. Calculate Wave logic
    targetTier = parseInt(targetTier) || 1;
    let waveOffset = targetWave ? (parseInt(targetWave) - 1) : 0;
    dungeonWave = ((targetTier - 1) * 5) + 1 + waveOffset;
    dungeonTier = targetTier;

    // 3. Move Admin to the floor immediately
    viewArea = "dungeon";
    p.area = "dungeon";
    p.y = 540;
    p.x = 150;
    p.activeTask = "attacking";

    // Update UI
    const selector = document.getElementById("view-area-selector");
    if (selector) selector.value = "dungeon";
    areaDisplayDiv.textContent = "Wave " + dungeonWave + " (T" + dungeonTier + ")";

    systemMessage(`🛠️ ADMIN TEST: Jumping to Tier ${dungeonTier} Wave ${dungeonWave}`);
    
    // 4. Spawn and Organize
    spawnWave();
    organizeDungeonRanks();
    
    // 5. FIX: Kill ALL possible dungeon timers to prevent "ghost" waves or collapses
    if (dungeonCountdownInterval) { clearInterval(dungeonCountdownInterval); dungeonCountdownInterval = null; }
    if (dungeonGraceTimer) { clearInterval(dungeonGraceTimer); dungeonGraceTimer = null; }
    if (dungeonEmptyTimer) { clearInterval(dungeonEmptyTimer); dungeonEmptyTimer = null; }
}
function joinDungeonQueue(p) {
    if (p.dead) return;

    // 1. Block entry if a dungeon is already live
    if (dungeonActive) {
        systemMessage(`❌ ${p.name}, a dungeon is already in progress!`);
        return;
    }

    // 2. Add to queue
    const nameKey = p.name.toLowerCase();
    if (!dungeonQueue.includes(nameKey)) {
        dungeonQueue.push(nameKey);
        systemMessage(`${p.name} joined the queue (${dungeonQueue.length} total)`);
    }

    // 3. Start the timer ONLY if it isn't already running
    if (!dungeonCountdownInterval) {
        enemies = []; // Clear training mobs
        dungeonSecondsLeft = 60;
        systemMessage("Dungeon timer started! 60 seconds until entry.");

        dungeonCountdownInterval = setInterval(() => {
            dungeonSecondsLeft--;

            // Milestone: 30 Seconds - Teleport players to the floor (Vanguard)
            if (dungeonSecondsLeft === 30) {
                viewArea = "dungeon";
                const selector = document.getElementById("view-area-selector");
                if (selector) selector.value = "dungeon";
                
                areaDisplayDiv.textContent = "Dungeon Floor";
                systemMessage("System: Sending vanguard to the dungeon floor...");

                dungeonQueue.forEach(name => {
                    let player = players[name.toLowerCase()];
                    if (player && !player.dead) {
                        player.area = "dungeon";
                        player.y = -200; // Drop from ceiling
                        player.x = 50 + Math.random() * 250; 
                        player.targetY = 540; // Floor height
                        player.targetX = null; 
                        player.activeTask = "attacking"; 
                    }
                });

                // Small delay to let them land before organizing
                setTimeout(() => {
                    organizeDungeonRanks();
                    systemMessage("System: Get Ready!");
                }, 1500);
            }

            // Milestone: 0 Seconds - Start the actual fight
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

        // Save what they were doing (attacking, healing, lurking)
        // Only save it if they aren't ALREADY organizing, to avoid overwriting with "organizing"
        if (p.activeTask !== "organizing") {
            p.lastTask = p.activeTask || "none";
        }
        
        p.activeTask = "organizing";

        const weaponName = p.stats.equippedWeapon;
        const weapon = ITEM_DB[weaponName] || { type: "unarmed" };
        
        // melee = "weapon" or "unarmed". ranged = "bow" or "staff"
        const isRanged = (weapon.type === "bow" || weapon.type === "staff");

        if (isRanged) {
            p.targetX = 40 + Math.random() * 60; 
        } else {
            p.targetX = 160 + Math.random() * 90;
        }
        
        if (p.zLane === undefined) p.zLane = Math.floor(Math.random() * 25);
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

function getBestAvailableTier(type, desiredTier) {
    const allDungeonItems = Object.keys(ITEM_DB).filter(key => {
        const i = ITEM_DB[key];
        return i.type === type && i.sources && i.sources.includes("dungeon");
    });

    const validItems = allDungeonItems.filter(key => ITEM_DB[key].tier <= desiredTier);

    if (validItems.length === 0) {
        if (allDungeonItems.length > 0) {
            const minTier = Math.min(...allDungeonItems.map(k => ITEM_DB[k].tier));
            return allDungeonItems.filter(k => ITEM_DB[k].tier === minTier);
        }
        return [];
    }

    const maxTierInRange = Math.max(...validItems.map(key => ITEM_DB[key].tier));
    return validItems.filter(key => ITEM_DB[key].tier === maxTierInRange);
}

function generateRandomLoadout(tier) {
    // 1. Log the attempt
    console.group(`🛠️ Generating Loadout for Tier: ${tier}`);

    const weaponPool = Object.keys(ITEM_DB).filter(key => {
        const i = ITEM_DB[key];
        const isWeaponType = (i.type === "weapon" || i.type === "bow" || i.type === "staff");
        return isWeaponType && i.tier === tier && i.sources === "dungeon";
    });

    const pools = {
        weapon: weaponPool,
        helmet: getBestAvailableTier("helmet", tier),
        armor:  getBestAvailableTier("armor", tier),
        pants:  getBestAvailableTier("pants", tier),
        gloves: getBestAvailableTier("gloves", tier),
        boots:  getBestAvailableTier("boots", tier)
    };

    // 2. Critical Debug: Show exactly what items were found for this Tier
    Object.keys(pools).forEach(slot => {
        if (pools[slot].length === 0) {
            console.error(`❌ Slot [${slot}] is EMPTY for Tier ${tier}!`);
        } else {
            console.log(`✅ Slot [${slot}]: ${pools[slot].length} items found.`);
        }
    });

    const pick = (pool) => {
        if (!pool || pool.length === 0) return null;
        return pool[Math.floor(Math.random() * pool.length)];
    };

    const loadout = {
        weapon: pick(pools.weapon),
        helmet: pick(pools.helmet),
        armor:  Math.random() < 0.9 ? pick(pools.armor) : null,
        pants:  Math.random() < 0.9 ? pick(pools.pants) : null,
        gloves: Math.random() < 0.5 ? pick(pools.gloves) : null,
        boots:  Math.random() < 0.5 ? pick(pools.boots) : null,
        cape:   (tier >= 5 && Math.random() < 0.1) ? pick(getBestAvailableTier("cape", tier)) : null
    };

    console.log("Final Loadout Result:", loadout);
    console.groupEnd();

    return loadout;
}

function spawnWave() {
    enemies = [];
    const partySize = Object.values(players).filter(p => p.area === "dungeon" && !p.dead).length || 1;
    const isBossWave = (dungeonWave % 5 === 0);
    
    // 1. Update Tier
    dungeonTier = getTierFromWave(dungeonWave);

    // 2. Select Theme Config
    const themeKeys = Object.keys(DUNGEON_THEMES).map(Number);
    const highestThemeDefined = Math.max(...themeKeys);
    const themeIndex = Math.min(dungeonTier, highestThemeDefined);
    const currentTheme = DUNGEON_THEMES[themeIndex] || DUNGEON_THEMES[1];
    
    const themePool = currentTheme.mobs;

    // --- NEW CAPPING LOGIC ---
    const MAX_MOBS = 8; // Adjust this to your preference
    let calculatedWaveSize = Math.floor(2 + (dungeonWave / 2) + (partySize - 1));
    
    let actualSpawnCount = calculatedWaveSize;
    let strengthMult = 1.0;

    if (calculatedWaveSize > MAX_MOBS) {
        // Example: if calculated is 16 and max is 8, strengthMult becomes 2.0
        strengthMult = calculatedWaveSize / MAX_MOBS;
        actualSpawnCount = MAX_MOBS;
    }
    // -------------------------

    if (!isBossWave) {
        systemMessage(`--- Wave ${dungeonWave}: ${currentTheme.name} ---`);
        if (strengthMult > 1) {
            systemMessage(`⚠️ Warning: Enemies are ${Math.round(strengthMult * 100)}% stronger!`);
        }
    }

    // 3. Spawn Normal Mobs
    for (let i = 0; i < actualSpawnCount; i++) {
        let typeName = themePool[Math.floor(Math.random() * themePool.length)];
        let config = MONSTER_DB[typeName] || MONSTER_DB["Slime"] || { drawType: "blob", hpMult: 1, color: "#fff" };

        // HP Scaling (Now multiplied by strengthMult)
        let enemyHp = (40 + (dungeonWave * 25)) * (config.hpMult || 1.0) * (1 + (partySize * 0.25)) * strengthMult;

        let isHanging = false;
        let startY = 530 + (Math.random() * 20);

        if (typeName === "Spiderling" && Math.random() < 0.4) {
            isHanging = true;
            startY = 50 + (Math.random() * 150);
        }

        enemies.push({ 
            name: typeName, 
            area: "dungeon",
            level: dungeonTier * 5,
            hp: enemyHp, 
            maxHp: enemyHp, 
            x: 500 + (i * 70),
            y: startY,
            isHanging: isHanging,
            dead: false,
            isEnemy: true,
            config: config, 
            color: config.color || "#ff4444",
            drawType: config.drawType, 
            scale: (config.scale || 1.0) * (1 + (strengthMult - 1) * 0.2), // Subtly make them larger
            strengthMult: strengthMult, // Store this for damage calculation
            isStickman: config.drawType === "stickman",
            equipped: config.canEquip ? generateRandomLoadout(dungeonTier) : {}
        });
    }

    // 4. Spawn Theme Boss
    if (isBossWave) {
        let bossKey = currentTheme.boss || "DUNGEON_OVERLORD";
        let bossConfig = MONSTER_DB[bossKey] || MONSTER_DB["DUNGEON_OVERLORD"];
        
        // Bosses also benefit from the strengthMult if the wave was supposed to be huge
        let bossHp = (500 + (dungeonWave * 150)) * (bossConfig.hpMult || 5.0) * partySize * strengthMult;
        
        boss = {
            name: bossKey.replace(/_/g, " "),
            area: "dungeon",
            level: (dungeonTier * 5) + 5, 
            hp: bossHp,
            maxHp: bossHp,
            x: 850, 
            y: 540,
            dead: false,
            isBoss: true,
            isEnemy: true,
            isMonster: true,
            config: bossConfig,
            color: bossConfig.color || "#ff0000",
            scale: bossConfig.scale || 2.0,
            isHanging: false,
            strengthMult: strengthMult,
            equipped: bossConfig.canEquip ? generateRandomLoadout(dungeonTier) : {}
        };
        
        systemMessage(`⚠️ TIER ${dungeonTier} BOSS: ${boss.name} has emerged!`);
    } else {
        boss = null;
    }
}
function startGracePeriod(seconds) {
    isDungeonResting = true;
    dungeonGraceSeconds = seconds;
    
    // Clear any existing timer just in case
    if (dungeonGraceTimer) clearInterval(dungeonGraceTimer);

    // 1. Organize ranks immediately so they walk to position during rest
    organizeDungeonRanks();

    dungeonGraceTimer = setInterval(() => {
        dungeonGraceSeconds--;

        // Visual reminders for the players
        if (dungeonGraceSeconds === 10) systemMessage("⚠️ 10 Seconds until next wave!");
        if (dungeonGraceSeconds === 3)  systemMessage("3... 2... 1...");

        if (dungeonGraceSeconds <= 0) {
            clearInterval(dungeonGraceTimer);
            dungeonGraceTimer = null;
            isDungeonResting = false;
            
            dungeonWave++; 
            spawnWave();
            
            // Final rank check to snap anyone who moved
            organizeDungeonRanks();
        }
    }, 1000);
}
function checkDungeonProgress() {
    if (!dungeonActive || isDungeonResting) return;
    
    let aliveEnemies = enemies.filter(e => !e.dead).length;
    if (aliveEnemies === 0 && (!boss || boss.dead)) {
        
        const isCompletionWave = (dungeonWave % 5 === 0);
        const tierJustFinished = dungeonTier;

        if (isCompletionWave) {
            Object.values(players).forEach(p => {
                if (p.area === "dungeon" && !p.dead) {
                    if (tierJustFinished > p.stats.dungeon.highestTier) {
                        p.stats.dungeon.highestTier = tierJustFinished;
                    }
                    rewardTierMastery(p, tierJustFinished);
                }
            });
            systemMessage(`⭐ Tier ${tierJustFinished} Cleared! 60s Rest Period.`);
            startGracePeriod(60); // 60 seconds for Tiers
        } else {
            systemMessage(`Wave ${dungeonWave} Cleared! 30s Rest Period.`);
            startGracePeriod(30); // 30 seconds for Waves
        }
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
    isDungeonResting = false;
    enemies = [];
    boss = null;
    
    if (dungeonEmptyTimer) { clearInterval(dungeonEmptyTimer); dungeonEmptyTimer = null; }
    if (dungeonGraceTimer) { clearInterval(dungeonGraceTimer); dungeonGraceTimer = null; }
    if (dungeonCountdownInterval) { clearInterval(dungeonCountdownInterval); dungeonCountdownInterval = null; }

    systemMessage(reason === "FAILURE" ? "❌ DUNGEON FAILED!" : "✅ DUNGEON CLEARED!");

    // Convert to array so we can use the index for unique spacing
    const playerList = Object.values(players);

    playerList.forEach((p, index) => {
        if (p.area === "dungeon") {
            p.area = "graveyard";
            
            // --- SMART SCATTER LOGIC ---
            // Spread X across most of the canvas (50 to 750)
            // Use (index * 20) to ensure even if Math.random() is similar, 
            // the corpses are physically offset from each other.
            p.x = 50 + (Math.random() * 600) + (index * 10 % 50); 
            
            // Tighten Y so they sit on the floor (e.g., between 520 and 560)
            // Adjust 520/40 based on where your floor visual actually sits
            p.y = 520 + (Math.random() * 40);
            
            p.activeTask = "none";

            if (p.dead && !p.deathTime) {
                p.deathTime = Date.now();
            }
        }
    });

    viewArea = "graveyard";
    const selector = document.getElementById("view-area-selector");
    if (selector) selector.value = "graveyard";
}
function handleEnemyAttacks() {
    let dwellers = Object.values(players).filter(p => p.area === "dungeon" && !p.dead);
    // If no players are in the dungeon, enemies stop attacking
    if (dwellers.length === 0) {
        [...enemies, boss].forEach(e => { if(e) e.activeTask = "none"; });
        return;
    }
    
    let allAttackers = [...enemies];
    if (boss && !boss.dead) allAttackers.push(boss);

    const now = Date.now();

    allAttackers.forEach(e => {
        if (e.dead) return;

        // 1. Target Selection
        // Enemies stay focused on one target if possible, or pick a random one
        let target = dwellers[Math.floor(Math.random() * dwellers.length)];
        
        // 2. State Setup (Triggers getAnimationState to draw weapon poses)
        e.activeTask = "attacking"; 

        // 3. Weapon Speed & Stats
        const weaponKey = e.equipped?.weapon;
        const weapon = ITEM_DB[weaponKey] || { power: 0, type: "unarmed", speed: 1500 };
        const attackSpeed = weapon.speed || 1500;

        // Initialize timer if this is the first swing of the wave
        if (!e.lastAttackTime) e.lastAttackTime = now - attackSpeed;

        // 4. The Attack Cycle (Only execute at the end of the swing/pull animation)
        if (now - e.lastAttackTime > attackSpeed) {
            
            // --- SPECIAL ABILITIES (20-30% chance on successful hit) ---
            const spec = e.config?.special;
            if (spec) {
                const procRoll = Math.random();
                if (spec === "web_shot" && procRoll < 0.2) {
                    target.isWebbed = true;
                    target.webExpiry = now + 3000;
                    spawnFloater(target, "🕸️ WEBBED!", "#fff");
                    spawnProjectile(e.x, e.y - 15, target.x, target.y - 15, "#ffffff", "web", "dungeon");
                }
                
                if (spec === "burn" && procRoll < 0.3) {
                    target.isBurning = true;
                    target.burnExpiry = now + 5000;
                    spawnFloater(target, "🔥 BURNING!", "#ff4500");
                }

                if (spec === "freeze" && procRoll < 0.2) {
                    target.isFrozen = true;
                    target.freezeExpiry = now + 2000;
                    spawnFloater(target, "❄️ FROZEN!", "#00ffff");
                }
				if (spec === "entangle" && procRoll < 0.4) {
					target.isEntangled = true;
					target.entangleExpiry = now + 2500;
					spawnFloater(target, "🌿 ENTANGLED!", "#2d5a27");
				}
            }

            // --- DAMAGE CALCULATION ---
            // Base wave damage + weapon power
            let dmg = ((3 + (dungeonWave * 1.5)) + (weapon.power || 0)) * (e.strengthMult || 1);
			if (e.isBoss) dmg *= 2.5;

            // --- PROJECTILE SPAWNING ---
            if (weapon.type === "bow") {
                spawnProjectile(e.x, e.y - 12, target.x, target.y - 15, "#fff", "arrow", "dungeon");
            } else if (weapon.type === "staff") {
                spawnProjectile(e.x, e.y - 12, target.x, target.y - 15, weapon.color || "#ff00ff", "magic", "dungeon");
            }

            // Apply the final damage
            applyDamage(target, Math.floor(dmg));

            // RESET the swing timer so the animation starts over
            e.lastAttackTime = now; 
        }
    });
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
    if (dungeonActive || dungeonCountdownInterval) return;
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
				config: MONSTER_DB["Slime"],
				drawType: "blob",
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

/* function updatePhysics(p) {
    // 1. Define the depth area
    const horizonY = 530; 
    const frontY = 560;
    
    // Each player gets a "lane" so they don't all overlap
    if (p.zLane === undefined) p.zLane = Math.floor(Math.random() * 25);
    const groundLevel = horizonY + p.zLane; 

    // --- STATE 1: FALLING ---
    if (p.targetY !== undefined && p.targetY !== null) {
        if (p.y < groundLevel) { // Fall to their specific lane, not a flat line
            p.y += 12;
            p.lean = 0.1; 
            return;
        } else {
            p.y = groundLevel;
            p.targetY = null;
            // ... landed effects ...
        }
    }

    // --- STATE 2: EMERGENCY FLOOR CHECK ---
    if (!p.targetY && p.y !== groundLevel) {
        // Smoothly pull them to their lane if they got bumped
        p.y += (groundLevel - p.y) * 0.1;
    }

    // --- STATE 3: WALKING ---
	// --- Inside updatePhysics(p) ---
	if (p.targetX !== null && p.targetX !== undefined) {
		let dx = p.targetX - p.x;
		if (Math.abs(dx) > 3) {
			p.x += dx * 0.12;
			p.lean = dx > 0 ? 0.2 : -0.2;
		} else {
			// --- ARRIVED AT POSITION ---
			p.x = p.targetX;
			p.lean = 0;
			p.targetX = null;

			// If they were organizing, put them back to their previous job
			if (p.activeTask === "organizing") {
				p.activeTask = p.lastTask || "none";
				p.lastTask = null; // Clear it out
			}
		}
	}

    // --- STATE 4: SEPARATION ---
    // Pass the target goal so we know if they should be "ghosting"
    resolveCrowding(p);
}
 */
function updatePhysics(p) {
    const now = Date.now();

    // --- 1. STATUS EXPIRY (Check every frame) ---
    if (p.isEntangled && now > p.entangleExpiry) p.isEntangled = false;
    if (p.isWebbed && now > p.webExpiry) p.isWebbed = false;
    if (p.isFrozen && now > p.freezeExpiry) p.isFrozen = false;
    if (p.isBurning && now > p.burnExpiry) p.isBurning = false;

    // --- 2. DEFINE DEPTH AREA ---
    const horizonY = 530; 
    if (p.zLane === undefined) p.zLane = Math.floor(Math.random() * 25);
    const groundLevel = horizonY + p.zLane; 

    // --- STATE 1: FALLING ---
    if (p.targetY !== undefined && p.targetY !== null) {
        if (p.y < groundLevel) { 
            p.y += 12;
            p.lean = 0.1; 
            return;
        } else {
            p.y = groundLevel;
            p.targetY = null;
        }
    }

    // --- STATE 2: EMERGENCY FLOOR CHECK ---
    if (!p.targetY && p.y !== groundLevel) {
        p.y += (groundLevel - p.y) * 0.1;
    }

    // --- STATE 3: WALKING ---
    if (p.targetX !== null && p.targetX !== undefined) {
        let dx = p.targetX - p.x;
        
        // --- APPLY SPEED MODIFIERS ---
        let moveStrength = 0.12; // Your base walking lerp strength
        
        if (p.isFrozen) {
            moveStrength = 0; // Can't move at all
        } else if (p.isWebbed) {
            moveStrength *= 0.25; // 75% slow
        } else if (p.isEntangled) {
            moveStrength *= 0.5;  // 50% slow
        }

        if (Math.abs(dx) > 3) {
            p.x += dx * moveStrength; // Use the modified strength
            p.lean = dx > 0 ? 0.2 : -0.2;
        } else {
            p.x = p.targetX;
            p.lean = 0;
            p.targetX = null;

            if (p.activeTask === "organizing") {
                p.activeTask = p.lastTask || "none";
                p.lastTask = null;
            }
        }
    }

    // --- STATE 4: SEPARATION ---
    resolveCrowding(p);
}
function resolveCrowding(p) {
    const bubbleX = 30; 
    const bubbleY = 15; 
    
    // We no longer 'return' if targetX exists. 
    // Instead, we just adjust how much the collision affects them.

    for (let id in players) {
        let other = players[id];
        if (other === p || other.area !== p.area || other.dead || other.targetY) continue;

        let dx = p.x - other.x;
        let dy = p.y - other.y;

        if (Math.abs(dx) < bubbleX && Math.abs(dy) < bubbleY) {
            // 1. Calculate Force
            if (dx === 0) dx = p.id > other.id ? 1 : -1;
            
            // If the player is ACTIVELY moving (targetX), we reduce the repulsion 
            // so they can still reach their target, but don't perfectly overlap.
            let pushStrength = (p.targetX !== null) ? 0.05 : 0.15;
            let forceX = (bubbleX - Math.abs(dx)) * pushStrength;
            
            // 2. APPLY X-AXIS PUSH
            p.x += dx > 0 ? forceX : -forceX;

            // 3. LATERAL EVASION (The "Go Around" Logic)
            // If they are colliding horizontally, nudge the Y position 
            // to help them slip into a different 'lane'.
            let forceY = (bubbleY - Math.abs(dy)) * 0.12;
            p.y += dy > 0 ? forceY : -forceY;
            
            // Clamp Y so they don't walk off the floor into the sky/UI
            p.y = Math.max(530, Math.min(565, p.y));
        }
    }
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
    const itemKey = p.stats?.equippedHair || p.equipped?.hair;
    const item = ITEM_DB[itemKey];
    if (!item) return;
    const hX = p.x + (lean * 20);
    const hY = p.y - 30 + bodyY;
    drawHeadLayer(ctx, hX, hY, item, p);
}

// 2. The Helmet Coordinator
function drawHelmetItem(ctx, p, bodyY, lean) {
    const itemKey = p.stats?.equippedHelmet || p.equipped?.helmet;
    const item = ITEM_DB[itemKey];
    if (!item) return;
    const hX = p.x + (lean * 20);
    const hY = p.y - 30 + bodyY; 
    drawHeadLayer(ctx, hX, hY, item, p);
}

// 3. The Painter (Logic & Style)
function drawHeadLayer(ctx, hX, hY, item, p) {
    if (!item) return;
    
    const style = item.style || "hair";

    // 1. SAFELY find the helmet name for the "wig" check
    const helmKey = (p.stats && p.stats.equippedHelmet) || (p.equipped && p.equipped.helmet) || "";
    const helmetName = helmKey.toLowerCase();

    // 2. SAFELY check for wigColor using ?. 
    // This prevents the "Cannot read properties of undefined" error
    const finalColor = (p.stats?.wigColor && (item.type === "hair" || helmetName === "wig")) 
        ? p.stats.wigColor 
        : (item.color || "#614126");

    ctx.save();
    
    // Reset state to ensure clean drawing
    ctx.strokeStyle = "#000000"; 
    ctx.lineWidth = 1.5; 
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.shadowBlur = 0; 

    const drawFn = HAT_STYLES[style] || HAT_STYLES["hair"];
    drawFn(ctx, hX, hY, finalColor);
    
    ctx.restore();
}

// --- 2. CAPES (Drawn behind the stickman) ---
function drawCapeItem(ctx, p, anchors) {
    // Check both potential locations for the item key
    const itemKey = (p.stats && p.stats.equippedCape) || (p.equipped && p.equipped.cape);
    const item = ITEM_DB[itemKey];
    
    if (!item) return;

    const headX = anchors.headX;
    const centerX = p.x + (anchors.lean * 10);
    
    ctx.fillStyle = item.color || "#666";
    ctx.beginPath();
    // Start at neck
    ctx.moveTo(headX, p.y - 40 + anchors.bodyY); 
    // Left side
    ctx.quadraticCurveTo(headX - 25, p.y + 10 + anchors.bodyY, centerX - 18, p.y + 22 + anchors.bodyY);
    // Bottom edge
    ctx.lineTo(centerX + 10, p.y + 15 + anchors.bodyY);
    // Right side back to neck
    ctx.quadraticCurveTo(headX + 25, p.y + 10 + anchors.bodyY, headX, p.y - 10 + anchors.bodyY);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.stroke();
}
// --- 3. armor drawn over body ---
function drawArmor(ctx, p, anchors) {
    const itemKey = p.stats?.equippedArmor || p.equipped?.armor;
    const item = ITEM_DB[itemKey];
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
    if (!item) return;

    // 1. Get the same limb data the body uses
    const now = Date.now();
    const anim = getAnimationState(p, now);
    const limbs = getLimbPositions(p, anchors, anim, now);

    ctx.save();
    ctx.strokeStyle = item.color || "#333";
    ctx.lineWidth = 4; 
    ctx.lineCap = "round";
    ctx.lineJoin = "round"; // Crucial for the knee bend

    // --- Left Leg Pant ---
    ctx.beginPath();
    ctx.moveTo(p.x, anchors.hipY);
    if (limbs.leftKnee) {
        // Bend the pants at the knee
        ctx.lineTo(limbs.leftKnee.x, limbs.leftKnee.y);
    }
    ctx.lineTo(leftFoot.x, leftFoot.y);
    ctx.stroke();
    
    // --- Right Leg Pant ---
    ctx.beginPath();
    ctx.moveTo(p.x, anchors.hipY);
    if (limbs.rightKnee) {
        // Bend the pants at the knee
        ctx.lineTo(limbs.rightKnee.x, limbs.rightKnee.y);
    }
    ctx.lineTo(rightFoot.x, rightFoot.y);
    ctx.stroke();

    ctx.restore();
}
// --- 5. BOOTS ---

function drawBoots(ctx, p, leftFoot, rightFoot) {
    const itemKey = (p.stats && p.stats.equippedBoots) || (p.equipped && p.equipped.boots);
    const item = ITEM_DB[itemKey];
    
    if (!item) return;
    ctx.save();
    ctx.fillStyle = item.color || "#444";
    ctx.strokeStyle = "#000"; 
    ctx.lineWidth = 1;
    // Left
    ctx.fillRect(leftFoot.x - 4, leftFoot.y - 2, 8, 5); 
    ctx.strokeRect(leftFoot.x - 4, leftFoot.y - 2, 8, 5);
    ctx.fillRect(leftFoot.x - 2, leftFoot.y - 6, 4, 5); 
    // Right
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
function drawGloves(ctx, p, limbs) {
    // 1. Universal Inventory Check
    const itemKey = (p.stats && p.stats.equippedGloves) || (p.equipped && p.equipped.gloves);
    const item = ITEM_DB[itemKey];
    
    if (!item) return;

    // 2. Call the Painter for both hands
    // Limbs contains .leftHand and .rightHand objects {x, y}
    drawGlovesItem(ctx, limbs.leftHand.x, limbs.leftHand.y, item);
    drawGlovesItem(ctx, limbs.rightHand.x, limbs.rightHand.y, item);
}
// --- ENEMY SPECIFIC DRAWING EQUIVALENTS ---

// --- Draw weapons ---
function drawWeaponItem(ctx, p, now, anchors, hX, hY) {
    // 1. Identify the item (Handle Player stats vs Enemy equipped)
    let weaponName = p.stats ? p.stats.equippedWeapon : (p.equipped ? p.equipped.weapon : null);
    let item = ITEM_DB[weaponName];
    
    // 2. Virtual tools for non-combat tasks
    if (p.activeTask === "woodcutting" && (!item || item.type !== "axe")) item = { type: "axe", style: "axe", speed: 1500 };
    if (p.activeTask === "mining" && (!item || item.type !== "pickaxe")) item = { type: "pickaxe", style: "pickaxe", speed: 1500 };
    if (p.activeTask === "fishing") item = item || { type: "fishing_rod", style: "fishing_rod", speed: 2000 };   
    
    if (!item) return;

    ctx.save();
    ctx.translate(hX, hY);

    const style = item.style || item.type || "sword";
    const drawFn = WEAPON_STYLES[style] || WEAPON_STYLES["sword"];

    // 3. Determine if we are in an "Active" state
    const isAttacking = (p.activeTask === "attacking" || p.activeTask === "pvp");
    const isWorking = ["woodcutting", "mining"].includes(p.activeTask);
    const isFishing = (p.activeTask === "fishing");
    const useActiveAnim = isAttacking || isWorking || isFishing;

    // 4. Calculate Normalized Progress (0.0 to 1.0)
    let attackProgress = 0; 
    if (useActiveAnim) {
        // Use lastAttackTime for combat, or lastActionTime/now for generic tasks
        const startTime = p.lastAttackTime || p.lastActionTime || 0;
        const actionSpeed = item.speed || 2500;
        const elapsed = now - startTime;
        
        // Clamp between 0 and 1
        attackProgress = Math.min(1, elapsed / actionSpeed);
    }

    // 5. Execute Draw
    // We pass attackProgress as the final argument
    drawFn(ctx, item, useActiveAnim, now, p, anchors.bodyY, anchors.lean, attackProgress);
    
    ctx.restore();
}


// --- drawEquipment ---
function renderEquipmentLayer(ctx, p, now, anchors, lH, rH, lF, rF) {
    // Determine source of equipment (Player vs Enemy)
    const eq = p.stats || p.equipped || {};
    const weaponKey = eq.equippedWeapon || eq.weapon;
    const weaponItem = ITEM_DB[weaponKey];
    
    const task = p.activeTask || "none";
    
    // Enemy behavior: Always "drawn" if they are a guard/voidwalker, 
    // otherwise use the player's manual sheath logic.
    let shouldHold = (p.isEnemy) ? true : 
                     (task === "attacking" || task === "pvp") || 
                     (["none", "lurking"].includes(task) && !p.manualSheath);

    // 1. Bottom: Sheathed weapon
    if (weaponItem && !shouldHold) drawSheathedWeapon(ctx, p, anchors, weaponItem);
    
    // 2. Middle: Body Clothes
    const pantsKey = eq.equippedPants || eq.pants;
    if (pantsKey) drawPantsItem(ctx, p, anchors, lF, rF, ITEM_DB[pantsKey]);
    
    const armorKey = eq.equippedArmor || eq.armor;
    if (armorKey) drawArmor(ctx, p, anchors, ITEM_DB[armorKey]);
    
    drawGloves(ctx, p, { leftHand: lH, rightHand: rH });

    // 3. Middle-Top: Held Weapons
    if (shouldHold || ["woodcutting", "mining", "fishing"].includes(task)) {
        drawWeaponItem(ctx, p, now, anchors, rH.x, rH.y);
    }

    // 4. THE SANDWICH: Head first, then Hat on top
    BODY_PARTS["stick"].head(ctx, anchors.headX, anchors.headY, p);
    
    const hairKey = eq.equippedHair || eq.hair;
    if (hairKey) drawHair(ctx, p, anchors.bodyY, anchors.lean);
    
    const helmKey = eq.equippedHelmet || eq.helmet;
    if (helmKey) drawHelmetItem(ctx, p, anchors.bodyY, anchors.lean);

    // 5. Very Top: Feet
    const bootsKey = eq.equippedBoots || eq.boots;
    if (bootsKey) drawBoots(ctx, p, lF, rF);
}
// --- HELPERS ---
function getAnimationState(p, now) {
    let anim = { bodyY: 0, armMove: 0, lean: p.lean || 0, pose: null };
    // 1. Determine which pose is active
    let activePose = p.forcedPose || anim.pose;
    // Fallback: If training and no pose is forced, default to pushups
    if (p.activeTask === "training" && !activePose) activePose = "pushups";
	if (activePose === "sit") {
        anim.bodyY = 20;
		//anim.lean = -0.4;
        anim.pose = "sit";
	} else if (activePose === "pushups") {
		const rep = (Math.sin(now / 300) + 1) / 2;
		anim.bodyY = 18 + (rep * 10); // How far the chest drops
		anim.lean = -1.3;             // The "Plank" angle (more negative = more horizontal)
		anim.pose = "pushups";
    } else if (activePose === "meditation") {
        const breathe = Math.sin(now / 1000) * 3;
        anim.bodyY = 10 + breathe; // Gentle hovering/bobbing
        anim.pose = "meditation";
    }
    // 1. Swimming
    const isInWater = (p.area === "pond" && p.x > 250);
    if (isInWater) {
        const bobbing = Math.sin(now / 400) * 5; 
        anim.bodyY = (p.activeTask === "swimming") ? (30 + bobbing) : (45 + bobbing);
    }

    // 2. Lurking
    if (p.activeTask === "lurking") {
        const breathe = Math.sin(now / 1000) * 3;
        anim.bodyY = 15 + breathe; 
        anim.lean = 0.3; 
    }

    // 3. Dancing
    if (p.activeTask === "dancing" && DANCE_LIBRARY[p.danceStyle]) {
        anim = { ...anim, ...DANCE_LIBRARY[p.danceStyle](now, p) };
    }

    // 4. Attack Reactivity & Pose Selection
    if ((p.activeTask === "attacking" || p.activeTask === "pvp") && p.lastAttackTime) {
		const itemKey = p.equipped?.weapon || p.stats?.equippedWeapon; 
		const item = ITEM_DB[itemKey];
		const speed = item?.speed || 2000;
		const progress = Math.min(1, (now - p.lastAttackTime) / speed);
		
		// Ensure facing exists
		const dir = p.facing || 1; 

		if (!item) {
			anim.pose = "boxing";
			const lunge = Math.sin(progress * Math.PI);
			anim.lean = dir * (0.2 + (lunge * 0.2)); // Lean towards target
		} else if (item.type === "bow" || item.type === "staff") {
			anim.pose = (item.type === "bow") ? "archer" : "action";
			// Lean slightly back/away for tension or slightly forward for casting
			anim.lean = dir * (item.type === "bow" ? -0.1 : 0.1); 
		} else {
			anim.pose = "action";
			const lungePower = Math.sin(progress * Math.PI); 
			anim.lean = dir * (0.2 + (lungePower * 0.4));
			anim.bodyY += lungePower * 8;
		}
	}

    // 5. Sleeping
    if (p.isSleeping && !p.activeTask) {
        anim.bodyY = 20; 
        anim.lean = 0.5; 
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
    let activePose = anim.pose || p.forcedPose;
    const itemKey = p.stats?.equippedWeapon || p.equipped?.weapon;
    const item = ITEM_DB[itemKey];

    // 1. Determine Pose
    if (!activePose) {
        if (p.activeTask === "swimming") activePose = "swimming";
        else activePose = "idle";
    }

    // 2. Default "Safety" Limbs (If pose library fails)
    let limbs = {
        leftHand: { x: anchors.headX - 18, y: anchors.shoulderY + 10 },
        rightHand: { x: anchors.headX + 18, y: anchors.shoulderY + 10 },
        leftFoot: { x: p.x - 10, y: p.y + 25 + anim.bodyY },
        rightFoot: { x: p.x + 10, y: p.y + 25 + anim.bodyY },
        leftElbow: null,
        rightElbow: null,
        leftKnee: null,
        rightKnee: null
    };

    const speed = item?.speed || 1000;
    const startTime = p.lastAttackTime || p.lastActionTime || now;
    const progress = Math.min(1, (now - startTime) / speed) || 0;

    // 3. Apply Pose Library with strict fallback
    if (activePose && POSE_LIBRARY[activePose]) {
        try {
            const overrides = POSE_LIBRARY[activePose]({ x: anchors.headX, y: anchors.headY }, p, anim, progress);
            
            if (overrides) {
                // Map the overrides back to our limb object
                if (overrides.left) limbs.leftHand = overrides.left;
                if (overrides.right) limbs.rightHand = overrides.right;
                
                if (overrides.leftFoot) {
                    limbs.leftFoot.x = overrides.leftFoot.x ?? limbs.leftFoot.x;
                    limbs.leftFoot.y = (p.y + 25 + anim.bodyY) + (overrides.leftFoot.yOffset || 0);
                }
                if (overrides.rightFoot) {
                    limbs.rightFoot.x = overrides.rightFoot.x ?? limbs.rightFoot.x;
                    limbs.rightFoot.y = (p.y + 25 + anim.bodyY) + (overrides.rightFoot.yOffset || 0);
                }
                
                // Carry over joints
                limbs.leftElbow = overrides.leftElbow;
                limbs.rightElbow = overrides.rightElbow;
                limbs.leftKnee = overrides.leftKnee;
                limbs.rightKnee = overrides.rightKnee;
            }
        } catch (e) {
            console.error("Pose Animation Error:", activePose, e);
        }
    }

    return limbs;
}

function drawStickmanBody(ctx, p, anchors, limbs) {
    const style = BODY_PARTS["stick"]; 
    ctx.strokeStyle = p.color; 
    ctx.lineWidth = 3; 
    ctx.lineCap = "round";
    ctx.lineJoin = "round"; // CRITICAL: This connects segments smoothly

    // 1. Torso (The spine)
    style.torso(ctx, anchors.headX, anchors.headY, p.x, anchors.hipY); 
    
    // 2. Arms (Use joint if pose provides it, otherwise straight line)
    style.limbs(ctx, anchors.headX, anchors.shoulderY, limbs.leftHand.x, limbs.leftHand.y, limbs.leftElbow); 
    style.limbs(ctx, anchors.headX, anchors.shoulderY, limbs.rightHand.x, limbs.rightHand.y, limbs.rightElbow);
    
    // 3. Legs (Use joint if pose provides it, otherwise straight line)
    style.limbs(ctx, p.x, anchors.hipY, limbs.leftFoot.x, limbs.leftFoot.y, limbs.leftKnee); 
    style.limbs(ctx, p.x, anchors.hipY, limbs.rightFoot.x, limbs.rightFoot.y, limbs.rightKnee);
}
// --- MAIN FUNCTIONS ---
function drawStickman(ctx, p) {
    if (p.area !== viewArea || p.isHidden) return;
    const now = Date.now();
    if (p.dead) return drawCorpse(ctx, p, now);

    // --- ANTI-OVERLAP LOGIC ---
    // Using alphabetical sort (other.name < p.name) to keep stack order consistent
    const nearbyPlayers = Object.values(players).filter(other => 
        other.area === p.area && 
        !other.dead && 
        other !== p && 
        Math.abs(other.x - p.x) < 35 && 
        other.name < p.name 
    ).length;
    
    const stackY = nearbyPlayers * 16; // 16px gap per player nameplate

    const anim = getAnimationState(p, now);
    const anchors = getAnchorPoints(p, anim);
    const limbs = getLimbPositions(p, anchors, anim, now);
    const isDeep = (p.area === "pond" && p.x > 250);

    ctx.save(); 
    // ---Scaling/Flipping Logic ---
    if ((p.activeTask === "attacking" || p.activeTask === "pvp") && p.facing === -1) {
        ctx.translate(p.x, 0);
        ctx.scale(-1, 1);
        ctx.translate(-p.x, 0);
    }

    // --- 1. TRANSPARENCY & WORLD EFFECTS ---
    let baseAlpha = 1.0;
    if (p.activeTask === "lurking") {
        baseAlpha = Math.max(0.1, 0.7 - (p.stats.lurkLevel * 0.015));
        baseAlpha += (Math.sin(now / 500) * 0.05);
    }
    ctx.globalAlpha = isDeep ? baseAlpha * 0.3 : baseAlpha;

    // --- 2. BACK LAYER & SKELETON ---
    if (p.stats.equippedCape) drawCapeItem(ctx, p, anchors);
    drawStickmanBody(ctx, p, anchors, limbs);

    // --- 3. THE EQUIPMENT SANDWICH ---
    renderEquipmentLayer(ctx, p, now, anchors, limbs.leftHand, limbs.rightHand, limbs.leftFoot, limbs.rightFoot);
	drawPlayerStatusEffects(ctx, p, now);
    ctx.restore();

    // --- 4. UI RENDERING (Names & Conditional HP) ---
    let uiAlpha = isDeep ? Math.max(0.5, baseAlpha * 0.7) : baseAlpha;
    ctx.globalAlpha = uiAlpha;
    ctx.textAlign = "center";
    
    // Applying stackY here (moving downwards from p.y + 36)
    const nameY = p.y + 36 + stackY;
    const hpY = p.y + 40 + stackY;

    // --- 5. Name with Combat Level ---
    const combatLvl = p.stats.combatLevel || 3;
    ctx.fillStyle = "#fff"; 
    ctx.font = "12px monospace"; 
    ctx.fillText(`${p.name} (Lvl ${combatLvl})`, p.x, nameY);

    // --- 6. HP Bar ---
    if (p.hp < p.maxHp) {
        ctx.fillStyle = "rgba(68, 68, 68, 0.8)";
        ctx.fillRect(p.x - 20, hpY, 40, 4);
        
        let hpColor = (p.struggleStartTime && isDeep && Math.floor(now / 200) % 2 === 0) ? "#f00" : "#0f0";
        ctx.fillStyle = hpColor;
        ctx.fillRect(p.x - 20, hpY, 40 * (p.hp / p.maxHp), 4);
    }

    // --- 7. CHAT BUBBLE ---
    if (p.chatMessage && (now - p.chatTime < 5000)) {
        const age = now - p.chatTime;
        if (age > 4000) ctx.globalAlpha = 1 - (age - 4000) / 1000;
        
        // Chat bubbles remain above head (p.y + anim.bodyY) as requested
        drawChatBubble(ctx, p, p.x, p.y + anim.bodyY, p.chatMessage);
    }
}

function drawEnemyStickman(ctx, e) {
    if (e.area !== viewArea || e.dead) return;
    const now = Date.now();
    
    // Same overlap check
    const nearby = enemies.filter(other => !other.dead && other !== e && Math.abs(other.x - e.x) < 30 && other.id < e.id).length;
    const stackY = nearby * 18;

    const anim = getAnimationState(e, now); 
    const anchors = getAnchorPoints(e, anim);
    const limbs = getLimbPositions(e, anchors, anim, now);

    ctx.save();
    ctx.translate(e.x, 0); 
    ctx.scale(-1, 1); 
    ctx.translate(-e.x, 0); 
    drawStickmanBody(ctx, e, anchors, limbs);
    renderEquipmentLayer(ctx, e, now, anchors, limbs.leftHand, limbs.rightHand, limbs.leftFoot, limbs.rightFoot);
    ctx.restore(); 
	drawEnemyUI(ctx, e, 1, stackY);

}
function renderMonsterBody(ctx, e, now) {
    const cfg = e.config;
    if (!cfg) return;
    // --- Standard Monster Logic (Slimes, etc.) ---
    const scale = e.scale || cfg.scale || 1.0;
    const styleFn = MONSTER_STYLES[cfg.drawType] || MONSTER_STYLES.blob;

    ctx.save();
    ctx.translate(e.x, e.y); // Monsters use e.y, Stickmen use a ground-baseline
    ctx.scale(scale, scale); 
    
    ctx.fillStyle = e.color || "#ff4444";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2 / scale; 
    
    styleFn(ctx, e, now, cfg);
    renderMonsterHead(ctx, e, cfg);
    
    ctx.restore();
    
    drawEnemyUI(ctx, e);
}
function renderMonsterHead(ctx, e, cfg) {
    const headAt = cfg.headAnchor || { x: 0, y: -15 };
    ctx.save();
    ctx.translate(headAt.x, headAt.y);
    
    if (e.equipped?.helmet) {
        const hat = ITEM_DB[e.equipped.helmet];
        // Use your global HAT_STYLES here too!
        const style = hat.style || "helmet";
        if (HAT_STYLES[style]) {
            HAT_STYLES[style](ctx, 0, 0, hat.color || "#777");
        }
    } else if (cfg.drawType !== "custom_path") {
        // Default monster face if no helmet
        ctx.beginPath();
        ctx.arc(0, 0, cfg.headSize || 8, 0, Math.PI * 2);
        ctx.fill(); 
        ctx.stroke();
        // Eyes
        ctx.fillStyle = "#000";
        ctx.fillRect(-4, -2, 2, 2); 
        ctx.fillRect(2, -2, 2, 2);
    }
    ctx.restore();
}
function renderMonsterWings(ctx, e, now, cfg) {
    const flap = Math.sin(now / 100) * 0.5;
    ctx.fillStyle = e.color;
    ctx.globalAlpha = 0.6;
    [-1, 1].forEach(side => {
        ctx.save();
        ctx.translate(cfg.wingAnchor?.x || 0, cfg.wingAnchor?.y || 0);
        ctx.rotate(side * (Math.PI / 4 + flap));
        ctx.beginPath();
        ctx.ellipse(side * 25, 0, 30, 15, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
        ctx.restore();
    });
    ctx.globalAlpha = 1.0;
}
function drawMonster(ctx, e) {
    if (e.area !== viewArea || e.dead) return;
    const now = Date.now();
    const cfg = e.config || { drawType: "blob" };

    if (cfg.drawType === "stickman") {
        drawEnemyStickman(ctx, e);
        return;
    }

    // --- ANTI-OVERLAP LOGIC ---
    // Count how many enemies are to the left of this one in the same spot
    const nearby = enemies.filter(other => 
        !other.dead && 
        other !== e && 
        Math.abs(other.x - e.x) < 30 && 
        other.id < e.id // Only offset if the other has a lower ID
    ).length;
    const stackY = nearby * 18; // Move text up 15px per nearby enemy

    ctx.save();
    ctx.translate(e.x, e.y);
    const scale = e.scale || cfg.scale || 1.0;
    ctx.scale(scale, scale);

    // 1. Draw Body
    const styleFn = MONSTER_STYLES[cfg.drawType] || MONSTER_STYLES.blob;
    styleFn(ctx, e, now, cfg);
    if (cfg.wings) renderMonsterWings(ctx, e, now, cfg);

    // 2. Draw UI (Pass the scale and stack height)
    drawEnemyUI(ctx, e, scale, stackY); 

    ctx.restore(); 
}

function drawEnemyUI(ctx, e, scale, stackY = 0) {
    ctx.save();
    
    // 1. Reset scale so text stays sharp
    ctx.scale(1/scale, 1/scale);
    ctx.textAlign = "center";

    // 2. Position Logic
    // If drawing inside drawMonster (translated), drawX/Y are 0 relative to e.x, e.y
    // If drawing inside drawEnemyStickman (restored), we use e.x, e.y
    const isTranslated = (scale !== 1 || (e.config && e.config.drawType !== "stickman"));
    const drawX = isTranslated ? 0 : e.x;
    const drawY = isTranslated ? 0 : e.y;
    
    // "At the feet" logic: move down 38px, then add stackY to push deeper if crowded
    const finalY = drawY + 38 + stackY; 

    // 3. Name Rendering (Using your specific requested colors)
    ctx.font = e.isBoss ? "bold 16px monospace" : "12px monospace";
    ctx.fillStyle = e.isBoss ? "#ff3333" : (e.name === "VoidWalker" ? "#a020f0" : "#ffffff");
    
    const enemyLvl = e.level || e.stats?.combatLevel || "??";
    ctx.fillText(`${e.name} [Lvl ${enemyLvl}]`, drawX, finalY);

    // 4. HP Bar Rendering (Using your specific requested styles)
    const barWidth = e.isBoss ? 100 : 40;
    ctx.fillStyle = "rgba(0,0,0,0.5)"; // Dark background
    ctx.fillRect(drawX - barWidth/2, finalY + 5, barWidth, 5);
    
    // Green if above 30%, Red if low
    ctx.fillStyle = (e.hp / e.maxHp > 0.3) ? "#0f0" : "#f00";
    ctx.fillRect(drawX - barWidth/2, finalY + 5, barWidth * (e.hp / e.maxHp), 5);
    
    ctx.restore();
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

// Updated Body Helper to support "Fresh" vs "Rotting"
function generateGhostTalk() {
    const length = 8 + Math.floor(Math.random() * 33); // 8 to 40 characters
    let str = "";
    for (let i = 0; i < length; i++) {
        str += (Math.random() > 0.5) ? "o" : "O";
    }
    return str;
}
function drawDecayingBody(ctx, p, now, progress, isRotting) {
    ctx.save();
    ctx.translate(0, progress * 20);
    let rot = p.deathStyle === "faceplant" ? (Math.PI / 2) * progress : (-Math.PI / 2) * progress;
    ctx.rotate(rot);

    // Use player color if fresh, Slate Grey if rotting
    const displayColor = isRotting ? "#708090" : (p.color || "#ff4444");
    const corpseActor = { ...p, x: 0, y: 0, color: displayColor, emote: "ko" };
    
    const deadAnchors = { headX: 0, headY: -30, shoulderY: -15, hipY: 10, lean: 0, bodyY: 0 };
    const deadLimbs = { 
        leftHand: { x: -18, y: 0 }, rightHand: { x: 18, y: 0 }, 
        leftFoot: { x: -10, y: 25 }, rightFoot: { x: 10, y: 25 } 
    };

    BODY_PARTS["stick"].head(ctx, deadAnchors.headX, deadAnchors.headY, corpseActor);
    drawStickmanBody(ctx, corpseActor, deadAnchors, deadLimbs);
    
    // Only draw flies if rotting
    if (isRotting) {
        ctx.fillStyle = "#000";
        for(let i = 0; i < 4; i++) {
            const flyX = Math.sin(now / 100 + (i * 15)) * 18;
            const flyY = Math.cos(now / 150 + (i * 25)) * 12 - 20;
            ctx.fillRect(flyX, flyY, 2, 2);
        }
    }
    ctx.restore();
}
// --- Sub-function: The Gravestone ---
function drawGravestone(ctx, name) {
    ctx.save();
    ctx.translate(0, 10);
    
    // Draw Stone
    ctx.fillStyle = "#888";
    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-15, -30, 30, 40, [10, 10, 0, 0]);
    ctx.fill();
    ctx.stroke();

    // Draw "R.I.P" and Player Name
    ctx.fillStyle = "#333";
    ctx.font = "bold 8px Arial";
    ctx.textAlign = "center";
    ctx.fillText("R.I.P", 0, -18);
    ctx.font = "6px Arial";
    ctx.fillText(name.substring(0, 8), 0, -8);
    ctx.restore();
}
function drawCorpse(ctx, p, now) {
    const timeSinceDeath = now - p.deathTime;
    const progress = Math.min(1, timeSinceDeath / 800);
    
    const stage1_Decay = 5 * 60 * 1000;
    const stage2_Grave = 10 * 60 * 1000;
    const stage3_Ghost = 15 * 60 * 1000;

    ctx.save();
    
    // --- 1. THE GROUND LAYER ---
    let groundColor = "rgba(180, 0, 0, 0.6)";
    if (timeSinceDeath > stage1_Decay) groundColor = "rgba(80, 0, 0, 0.8)";
    if (timeSinceDeath > stage2_Grave) groundColor = "rgba(101, 67, 33, 0.9)";
    
    ctx.fillStyle = groundColor;
    const poolSize = progress * 25;
    ctx.beginPath();
    ctx.ellipse(p.x, p.y + 25, poolSize, poolSize / 3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.translate(p.x, p.y);

    // --- 2. DECIDE VISUAL STAGE ---
    let bubbleY = -30; // Default height for bubble

    if (timeSinceDeath < stage1_Decay) {
        drawDecayingBody(ctx, p, now, progress, false);
    } 
    else if (timeSinceDeath < stage2_Grave) {
        drawDecayingBody(ctx, p, now, progress, true);
        bubbleY = -10; // Bubbles float lower while decaying on the ground
    } 
    else {
        drawGravestone(ctx, p.name);
        if (timeSinceDeath > stage3_Ghost) {
            const ghostTime = timeSinceDeath - stage3_Ghost;
            const floatY = Math.sin(ghostTime / 1000) * 10 - 40;
            const ghostAlpha = Math.min(0.4, (ghostTime / 5000));
            
            ctx.save();
            ctx.globalAlpha = ghostAlpha;
            ctx.translate(0, floatY);
            bubbleY = floatY - 20; // Bubble follows the ghost as it bobs
            
            const ghostActor = { ...p, x: 0, y: 0, color: "#e0f7fa", emote: "neutral" };
            const ghostAnchors = { headX: 0, headY: -30, shoulderY: -15, hipY: 10, lean: 0, bodyY: 0 };
            const ghostLimbs = { leftHand: { x: -15, y: -5 }, rightHand: { x: 15, y: -5 }, leftFoot: { x: -5, y: 20 }, rightFoot: { x: 5, y: 20 } };

            BODY_PARTS["stick"].head(ctx, ghostAnchors.headX, ghostAnchors.headY, ghostActor);
            drawStickmanBody(ctx, ghostActor, ghostAnchors, ghostLimbs);
            ctx.restore();
        }
    }
    
    // --- 3. GHOST CHAT BUBBLES ---
    // Only show if Decaying OR Ghost (not while "freshly" dead or just a grave)
    const isDecaying = timeSinceDeath >= stage1_Decay && timeSinceDeath < stage2_Grave;
    const isGhost = timeSinceDeath >= stage3_Ghost;

    if ((isDecaying || isGhost) && p.chatMessage && (now - p.chatTime < 5000)) {
        ctx.restore(); // Exit the player translation to use world coordinates
        ctx.save();
        
        const age = now - p.chatTime;
        if (age > 4000) ctx.globalAlpha = 1 - (age - 4000) / 1000;

        // Draw the bubble. Note: We use p.x and p.y + bubbleY 
        // because we restored context and are back in world space.
        drawChatBubble(ctx, p, p.x, p.y + bubbleY, p.chatMessage, "italic");
        ctx.restore();
    } else {
        ctx.restore();
    }
}

//----------
function handleMobEffects(now) {
    if (viewArea !== "dungeon" && viewArea !== "lab") return;

    const activeEnemies = enemies.concat(boss || []).filter(e => e && !e.dead);
    const alivePlayers = Object.values(players).filter(p => p.area === viewArea && !p.dead);

    if (activeEnemies.length === 0) return;

    let cloudCount = 0;
    
    activeEnemies.forEach(e => {
        const type = e.config?.drawType || e.drawType;

        // --- 1. CLOUDS (Storm & Regular) ---
        if (type === "cloud") {
            cloudCount++;
            if (e.config?.storm) {
                if (!e.lastZap) e.lastZap = now + (Math.random() * 5000);
                if (now - e.lastZap > 8000) {
                    if (alivePlayers.length > 0) {
                        const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
                        applyDamage(target, 15 + (dungeonTier * 3));
                        spawnFloater(target, "⚡ ZAP!", "#fff700");
                        e.triggerLightning = now + 100; 
                    }
                    e.lastZap = now + (Math.random() * 4000);
                }
            }
        }

        // --- 2. GARDEN GNOMES ---
        if (type === "gardenGnome") {
            if (!e.lastPrank || now - e.lastPrank > 12000) {
                if (alivePlayers.length > 0) {
                    const target = alivePlayers[Math.floor(Math.random() * alivePlayers.length)];
                    const stolen = 5 * dungeonTier;
                    target.stats.pixels = Math.max(0, target.stats.pixels - stolen);
                    spawnFloater(target, `💸 -${stolen}px`, "#ff0000");
                }
                e.lastPrank = now;
            }
        }

        // --- 3. VOID SINGULARITY (Gravity Pull) ---
		if (type === "singularity") {
			alivePlayers.forEach(p => {
				const dx = e.x - p.x;
				const dist = Math.abs(dx);
				if (dist < 400) { 
					// Pull strength increases slightly as you get closer
					const strength = 0.02 * (1 - dist / 500); 
					p.x += dx * strength;
					
					// Optional: If the player gets TOO close, do tiny tick damage
					if (dist < 20 && now % 1000 < 100) {
						applyDamage(p, 1);
					}
				}
			});
		}
    });

    // --- 4. THE SUN ---
    const sun = activeEnemies.find(e => (e.config?.drawType || e.drawType) === "sun");
    if (sun) {
        sun.config.isAngry = (cloudCount === 0);
        if (sun.config.isAngry && alivePlayers.length > 0) {
            if (!sun.lastEffectTick || now - sun.lastEffectTick > 3000) {
                alivePlayers.forEach(p => {
                    applyDamage(p, 5 + (dungeonTier * 2));
                    spawnFloater(p, "🔥 SUNBURN", "#ff4500");
                });
                sun.lastEffectTick = now;
            }
        }
    }
}
function drawMobEffects(ctx, now) {
    if (viewArea !== "dungeon" && viewArea !== "lab") return;
    
    const activeEnemies = enemies.concat(boss || []).filter(e => e && !e.dead);
    if (activeEnemies.length === 0) return;

    // 1. Sun Heatwave
    const sun = activeEnemies.find(e => (e.config?.drawType || e.drawType) === "sun");
    if (sun && sun.config?.isAngry) {
        MONSTER_EFFECTS.heatwave(ctx, now);
    }

    // 2. Storm Clouds (Lightning & Rain)
    const stormClouds = activeEnemies.filter(e => (e.config?.drawType || e.drawType) === "cloud" && e.config?.storm);
    if (stormClouds.length > 0) {
        MONSTER_EFFECTS.storm(ctx, now, { stormClouds });
    }

    // 3. Gnomes (Gold particle pops)
    const activeGnomes = activeEnemies.filter(e => (e.config?.drawType || e.drawType) === "gardenGnome");
    if (activeGnomes.length > 0) {
        MONSTER_EFFECTS.gnomePrank(ctx, now, { activeGnomes });
    }

    // 4. Void Warp (Particle suction)
    const singularities = activeEnemies.filter(e => (e.config?.drawType || e.drawType) === "singularity");
    if (singularities.length > 0) {
        MONSTER_EFFECTS.voidWarp(ctx, now, { singularities });
    }
}
function drawPlayerStatusEffects(ctx, p, now) {
    ctx.save();
    // Position at player's feet
    ctx.translate(0, 5); 

    // --- ENTANGLED (Bushman) ---
    if (p.isEntangled && now < p.entangleExpiry) {
        ctx.strokeStyle = "#2d5a27";
        ctx.lineWidth = 2;
        for (let i = 0; i < 4; i++) {
            const shake = Math.sin(now / 50 + i) * 2;
            ctx.beginPath();
            ctx.moveTo(-15, 0);
            ctx.quadraticCurveTo(-10 + shake, -15, 0, -5);
            ctx.quadraticCurveTo(10 - shake, -20, 15, 0);
            ctx.stroke();
            // Tiny thorns
            ctx.fillStyle = "#1a3316";
            ctx.fillRect(-8 + shake, -10, 2, 2);
            ctx.fillRect(8 - shake, -12, 2, 2);
        }
    }

    // --- WEBBED (Spider) ---
    if (p.isWebbed && now < p.webExpiry) {
        ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
        ctx.lineWidth = 1.5;
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(Math.cos(angle) * 20, Math.sin(angle) * 10);
            ctx.stroke();
        }
    }

    // --- FROZEN (Special) ---
    if (p.isFrozen && now < p.freezeExpiry) {
        ctx.fillStyle = "rgba(0, 255, 255, 0.3)";
        ctx.strokeStyle = "#fff";
        ctx.beginPath();
        ctx.roundRect(-20, -45, 40, 50, 5);
        ctx.fill();
        ctx.stroke();
    }

    ctx.restore();
}
//-------------------------------------------
// --- WORKSHOP PRO SYSTEM ---
// i think we should make it so we can only use creation tool when we are at the lab, and new items and monsters should always start at tier 1, after--
// modeling them with the creation tool we should be able to do something in the lab to "grow" the creature/mob/npc/enemy  or "manufacture" the weapon/hat or item - 
// growing creatures/bosses/monsters/enemies or npc's should reward a new skill "biology" and manufacturing items should go towards a new engineer skill
// after reaching a certain biology skill we shuld unlock the ability to "mutate" default enemies,monsters and creatures, or custom ones, or make hybrids giving them a mutation stat
// if the mutated products are further mutated they get mrore mutated allowing users to create new enemies and creatures or npcs, mutate them, make hybrids or w.e --
// perpetually make them wierder and unique and engineering shuld have a similar mechanic for items

let isDrawing = false;
let currentPath = [];
let anchor = { x: 100, y: 100 };
const wCanvas = document.getElementById('workshop-canvas');
const wCtx = wCanvas.getContext('2d');

// 1. Mouse Events
wCanvas.onmousedown = (e) => {
    isDrawing = true;
    const rect = wCanvas.getBoundingClientRect();
    // Add starting point
    addPoint(e.clientX - rect.left, e.clientY - rect.top);
};

wCanvas.onmouseup = () => {
    isDrawing = false;
    currentPath.push(null); // Line break
};

wCanvas.onmousemove = (e) => {
    if (!isDrawing) return;
    const rect = wCanvas.getBoundingClientRect();
    addPoint(e.clientX - rect.left, e.clientY - rect.top);
    drawPreview();
};

function addPoint(x, y) {
    const thickness = document.getElementById('brush-thickness').value;
    const color = document.getElementById('brush-color').value;
    currentPath.push({ 
        x: x, 
        y: y, 
        thickness: parseInt(thickness), 
        color: color 
    });
}

// 2. Preview Engine
function drawPreview() {
    wCtx.clearRect(0, 0, 200, 200);
    
    // Draw Anchor Crosshair
    wCtx.strokeStyle = "rgba(255, 50, 50, 0.6)";
    wCtx.lineWidth = 1;
    wCtx.beginPath();
    wCtx.moveTo(anchor.x - 15, anchor.y); wCtx.lineTo(anchor.x + 15, anchor.y);
    wCtx.moveTo(anchor.x, anchor.y - 15); wCtx.lineTo(anchor.x, anchor.y + 15);
    wCtx.stroke();

    // Draw Stylized Lines
    if (currentPath.length === 0) return;

    for (let i = 0; i < currentPath.length; i++) {
        const p = currentPath[i];
        if (!p || i === 0 || !currentPath[i-1]) {
            if (p) {
                wCtx.beginPath();
                wCtx.moveTo(p.x, p.y);
            }
            continue;
        }

        wCtx.lineCap = "round";
        wCtx.lineJoin = "round";
        wCtx.strokeStyle = p.color;
        wCtx.lineWidth = p.thickness;
        
        wCtx.lineTo(p.x, p.y);
        wCtx.stroke();
        
        // Start fresh for next segment to allow color/thickness changes
        wCtx.beginPath();
        wCtx.moveTo(p.x, p.y);
    }
}

// 3. Asset Injection/asset saving

function saveAsset(silent = false) {
    const nameInput = document.getElementById('asset-name');
    const name = nameInput.value.trim().replace(/\s+/g, '_') || "Custom_" + Date.now();
    const type = document.getElementById('drawing-type').innerText.toLowerCase();
    
    const pathCopy = [...currentPath];
    const assetAnchor = { ...anchor };

    if (type === "weapon") {
        WEAPON_STYLES[name] = (ctx, item) => {
            ctx.lineCap = "round";
            ctx.beginPath();
            pathCopy.forEach((p, i) => {
                if (!p) { ctx.stroke(); ctx.beginPath(); return; }
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.thickness * 0.25; 
                const tx = (p.x - assetAnchor.x) * 0.25;
                const ty = (p.y - assetAnchor.y) * 0.25;
                ctx.lineTo(tx, ty);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(tx, ty);
            });
        };
        ITEM_DB[name] = { type: "weapon", style: name, power: 25, rarity: 5, sources: "dungeon", value: 1500, color: "#fff" };
    } 
    
    else if (type === "helmet") {
        HAT_STYLES[name] = (ctx, hX, hY, color) => {
            ctx.save();
            ctx.translate(hX, hY);
            ctx.lineCap = "round";
            ctx.beginPath();
            pathCopy.forEach((p, i) => {
                if (!p) { ctx.stroke(); ctx.beginPath(); return; }
                ctx.strokeStyle = p.color;
                ctx.lineWidth = p.thickness * 0.4;
                const tx = (p.x - assetAnchor.x) * 0.4;
                const ty = (p.y - assetAnchor.y) * 0.4;
                ctx.lineTo(tx, ty);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(tx, ty);
            });
            ctx.restore();
        };
        ITEM_DB[name] = { type: "helmet", style: name, def: 12, rarity: 5, sources: "dungeon", value: 1200 };
    }

    else if (type === "monster") {
        MONSTER_DB[name] = {
            drawType: "custom_path",
            pathData: pathCopy.map(p => p ? { 
                x: (p.x - assetAnchor.x) * 0.8, 
                y: (p.y - assetAnchor.y) * 0.8,
                color: p.color,
                thickness: p.thickness
            } : null),
            hpMult: 2.5,
            scale: 1.0
        };
    }

    if (!silent) {
        systemMessage(`🎨 Saved ${type}: ${name}`);
        closeWorkshop();
    }
}

// 4. Smart Testing
function testCurrentCreation() {
    const nameInput = document.getElementById('asset-name');
    const name = nameInput.value.trim() || "Test_Asset";
    const type = document.getElementById('drawing-type').innerText.toLowerCase();
    
    saveAsset(true); // Save silently

    if (type === "monster") {
        enemies.push({
            name: name,
            area: viewArea,
            hp: 1000, maxHp: 1000,
            x: 550, y: 540,
            config: MONSTER_DB[name],
            drawType: "custom_path",
            dead: false,
            isEnemy: true,
            stats: { lurkLevel: 0 }
        });
        systemMessage("🧪 Test Monster Spawned!");
    } else {
        // Give to player 1
        const p = Object.values(players)[0];
        if (p) {
            if (!p.stats.inventory.includes(name)) p.stats.inventory.push(name);
            if (type === "weapon") p.stats.equippedWeapon = name;
            if (type === "helmet") p.stats.equippedHelmet = name;
            systemMessage(`🧪 ${name} equipped to ${p.name}!`);
        }
    }
}

function setWorkshopType(type) {
    document.getElementById('drawing-type').innerText = type;
    clearCanvas();
}

function clearCanvas() {
    currentPath = [];
    wCtx.clearRect(0, 0, wCanvas.width, wCanvas.height);
    drawPreview();
}

function closeWorkshop() {
    document.getElementById('workshop-modal').classList.add('hidden');
    currentPath = [];
}

function openWorkshop(type = "Weapon") {
    document.getElementById('drawing-type').innerText = type;
    document.getElementById('workshop-modal').classList.remove('hidden');
    drawPreview();
}
// more lab viewArea stuff
function spawnLabTest(monsterKey) {
    const config = MONSTER_DB[monsterKey];
    if (!config) return;

    const testHp = 5000; 
    boss = null; // Clear any existing boss so it doesn't draw in the lab

    const testMob = {
        name: `TEST_${monsterKey}`,
        area: "lab", // Matches the check in gameLoop
        level: 99,
        hp: testHp,
        maxHp: testHp,
        x: 400, 
        y: 530, 
        dead: false,
        isEnemy: true,
        config: config,
        color: config.color || "#ffffff",
        drawType: config.drawType,
        scale: config.scale || 1.0,
        isHanging: (monsterKey === "Spiderling"),
        isStickman: config.drawType === "stickman",
        equipped: config.canEquip ? generateRandomLoadout(10) : {}
    };

    enemies = [testMob]; 
    systemMessage(`🔬 Lab: Testing ${monsterKey}...`);
}
function labParade() {
    const keys = Object.keys(MONSTER_DB);
    let i = 0;
    const interval = setInterval(() => {
        spawnLabTest(keys[i]);
        i++;
        if (i >= keys.length) clearInterval(interval);
    }, 10000); // Swaps monster every 10 seconds
}
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
    pond: "",
	lab: ""
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
let dungeonFloorOffset = 0;
function drawScenery(ctx) {
    const now = Date.now();
    const floorH = 45;                // The thickness of the floor
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
		drawBuyer(ctx);
    }
	else if (viewArea === "dungeon") {
		// 1. Dynamic Floor Color (Gets darker/purpler as Tier increases)
		// Tier 1: #3d2b1f (Brown) -> Tier 13: #0a0510 (Deep Void)
		const darkness = Math.min(180, (dungeonTier - 1) * 15);
		ctx.fillStyle = `rgb(${61 - (darkness/4)}, ${43 - (darkness/5)}, ${31 - (darkness/6)})`;
		ctx.fillRect(0, floorY, c.width, floorH);

		// 2. Dirt Texture/Pebbles (Scattered logic)
		ctx.fillStyle = "rgba(0,0,0,0.2)";
		for (let i = 0; i < c.width; i += 40) {
			// Use a pseudo-random seed based on 'i' so dirt doesn't jump around
			let x = i + (Math.sin(i) * 20);
			let size = 2 + (Math.cos(i) * 2);
			ctx.beginPath();
			ctx.arc(x, floorY + 15 + (Math.sin(i) * 10), size, 0, Math.PI * 2);
			ctx.fill();
		}

		// 3. Tier-Based Accents (Banner Overlay Style)
		// We add small visual cues on the floor line itself
		if (dungeonTier >= 2 && dungeonTier < 5) {
			// Small Cobwebs for Spider Tiers
			ctx.strokeStyle = "rgba(255,255,255,0.1)";
			for(let i=100; i<c.width; i+=300) {
				ctx.beginPath();
				ctx.moveTo(i, floorY); ctx.lineTo(i+20, floorY+15);
				ctx.moveTo(i+20, floorY); ctx.lineTo(i, floorY+15);
				ctx.stroke();
			}
		} else if (dungeonTier >= 5 && dungeonTier < 8) {
			// Frost/Ice patches
			ctx.fillStyle = "rgba(150, 220, 255, 0.2)";
			for(let i=50; i<c.width; i+=200) {
				ctx.fillRect(i, floorY + 2, 40, 4);
			}
		} else if (dungeonTier >= 10) {
			// Void Cracks for Endgame
			ctx.strokeStyle = "#a020f0";
			ctx.lineWidth = 1;
			for(let i=0; i<c.width; i+=150) {
				ctx.beginPath();
				ctx.moveTo(i, floorY);
				ctx.lineTo(i + 15, floorY + 10);
				ctx.lineTo(i + 5, floorY + 25);
				ctx.stroke();
			}
		}

		// 4. Subtle "Floor Shadow" (Helps the banner look clean on stream)
		ctx.fillStyle = "rgba(0,0,0,0.3)";
		ctx.fillRect(0, floorY, c.width, 3);
	}
	else if (viewArea === "lab") {
		// 1. The Floor (Cold, dark metallic panels)
		ctx.fillStyle = "#1a1c2c"; 
		ctx.fillRect(0, floorY, c.width, floorH);

		// 2. High-Tech Floor Paneling
		ctx.strokeStyle = "#333c57";
		ctx.lineWidth = 2;
		for (let i = 0; i < c.width; i += 120) {
			// Vertical Panel Dividers
			ctx.beginPath();
			ctx.moveTo(i, floorY);
			ctx.lineTo(i, floorY + floorH);
			ctx.stroke();

			// Horizontal accent line
			ctx.beginPath();
			ctx.moveTo(i, floorY + 10);
			ctx.lineTo(i + 120, floorY + 10);
			ctx.stroke();

			// Hexagon bolt details in corners
			ctx.fillStyle = "#292c3d";
			ctx.fillRect(i + 5, floorY + 4, 4, 4);
		}

		// 3. Glowing Power Conduits (Cables on the floor)
		ctx.strokeStyle = "#00f2ff"; // Neon Cyan
		ctx.lineWidth = 1;
		ctx.shadowBlur = 5;
		ctx.shadowColor = "#00f2ff";
		
		ctx.beginPath();
		ctx.moveTo(0, floorY + 2);
		ctx.lineTo(c.width, floorY + 2); // Thin light strip at top of floor
		ctx.stroke();
		ctx.shadowBlur = 0; // Always reset shadow for performance

		// 4. Background Containment Tubes (Silhouettes)
		for (let i = 100; i < c.width; i += 300) {
			// Glass Tube
			ctx.fillStyle = "rgba(0, 242, 255, 0.05)";
			ctx.fillRect(i, floorY - 120, 60, 120);
			
			// Tube Bases
			ctx.fillStyle = "#333c57";
			ctx.fillRect(i - 5, floorY - 5, 70, 5); // Bottom rim
			ctx.fillRect(i - 5, floorY - 125, 70, 8); // Top rim
			
			// Bubbles inside tube (Animated)
			ctx.fillStyle = "rgba(0, 242, 255, 0.3)";
			for(let b=0; b<3; b++) {
				let bY = (Date.now() / 20 + (i*b)) % 100;
				ctx.beginPath();
				ctx.arc(i + 30 + (Math.sin(bY/10)*10), floorY - bY, 2, 0, Math.PI*2);
				ctx.fill();
			}
		}
	}
	else if (viewArea === "graveyard") {
		// 1. The Ground (Dark Earth/Dead Grass)
		ctx.fillStyle = "#1a1a1a"; // Very dark grey/brown
		ctx.fillRect(0, floorY, c.width, floorH);

		// 2. Dead Grass Tufts
		ctx.strokeStyle = "#2d3319"; // Sickly green
		ctx.lineWidth = 1;
		for (let i = 0; i < c.width; i += 40) {
			let x = i + (Math.sin(i) * 20);
			ctx.beginPath();
			ctx.moveTo(x, floorY);
			ctx.lineTo(x - 5, floorY - 8);
			ctx.moveTo(x, floorY);
			ctx.lineTo(x + 3, floorY - 10);
			ctx.stroke();
		}

		// 3. Background Tombstones (Distant)
		ctx.fillStyle = "#333";
		for (let i = 50; i < c.width; i += 120) {
			let h = 20 + (Math.sin(i) * 10);
			// Rounded tombstone shape
			ctx.beginPath();
			ctx.roundRect(i, floorY - h, 25, h + 5, [10, 10, 0, 0]);
			ctx.fill();
			
			// Etched Cross detail
			ctx.strokeStyle = "#444";
			ctx.beginPath();
			ctx.moveTo(i + 12, floorY - h + 5);
			ctx.lineTo(i + 12, floorY - h + 15);
			ctx.moveTo(i + 7, floorY - h + 8);
			ctx.lineTo(i + 17, floorY - h + 8);
			ctx.stroke();
		}

		// 4. Low-lying Rolling Fog (Optional Visual Polish)
		ctx.fillStyle = "rgba(200, 200, 255, 0.05)";
		let fogShift = (Date.now() / 50) % 200;
		for (let j = 0; j < 2; j++) {
			for (let i = -200; i < c.width; i += 200) {
				ctx.beginPath();
				ctx.ellipse(i + fogShift + (j * 100), floorY - 5, 120, 20, 0, 0, Math.PI * 2);
				ctx.fill();
			}
		}
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

/* 
CB LVL - IDLE time (MIN) - IDLE DURATION (HRS)  
lvl 1	   -  022 mins	- 0.3 hrs
lvl 20	   -  155 mins	- 2.5 hrs
lvl 50	   -  365 mins  - 6.0 hrs
lvl 80	   -  575 mins	- 9.5 hrs
lvl 100    -  715 mins	- 11.9 hrs
 */
function getDynamicDuration(p) {
    const baseMinutes = 15;
    const lvl = p.stats.combatLevel || 1;
    
    // This formula adds roughly 7 minutes per level
    // Level 1: 15 + (1 * 7) = 22 mins
    // Level 100: 15 + (100 * 7) = 715 mins (just under 12 hours)
    const totalMinutes = baseMinutes + (lvl * 5);
    
    return totalMinutes * 60 * 1000; // Convert to milliseconds
}
/**
 * Sets the active task and end time based on player's combat level.
 */
function startTask(p, taskName) {
    const duration = getDynamicDuration(p);
    
    p.activeTask = taskName;
    p.taskEndTime = Date.now() + duration;

    // Convert to more readable format for your console logs
    const totalMinutes = Math.floor(duration / 60000);
    const hrs = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    
    console.log(`[TASK] ${p.name} -> ${taskName} for ${hrs}h ${mins}m`);
}
function updatePlayerStatus(p, now) {
    if (p.dead && !p.isHidden) {
        const timeSinceAction = now - (p.lastActionTime || now);
        if (timeSinceAction > 15 * 60 * 1000) p.isHidden = true;
        return;
    }

    if (p.activeTask && p.taskEndTime && now > p.taskEndTime) {
        if (p.area === "pond" && p.x > 250) {
            const limit = getStruggleLimit(p);
            
            if (!p.struggleStartTime) {
                p.struggleStartTime = now;
                const timeText = Math.floor(limit / 1000);
                systemMessage(`${p.name} is out of breath! ${timeText}s to reach shore!`);
                spawnFloater(p, "LOW O2!", "#ff0000");
            }

            // Drown if struggle duration exceeds level-based limit
            if (now - p.struggleStartTime > limit) {
                cmdStop(p, p.name); 
            }
        } else {
            systemMessage(`${p.name}'s task expired.`);
            spawnFloater(p, `Task Finished`, "#ff4444");
            cmdStop(p, p.name);
            p.lastActionTime = now;
        }
    }

    const idleTime = now - (p.lastActionTime || now);
    if (idleTime > 15 * 60 * 1000) { 
        if (!p.isHidden) { 
            p.isHidden = true;
            if (p.area === "pond" && p.x > 250 && !p.dead) {
                p.hp = 0; p.dead = true; p.deathTime = now;
                systemMessage(`${p.name} drowned after idling in the water.`);
            }
        }
    } else if (idleTime > 5 * 60 * 1000) {
        p.isSleeping = true; p.isHidden = false;
    } else {
        p.isSleeping = false; p.isHidden = false;
    }
}
function updatePlayerActions(p, now) {
    if (p.dead) return;

    // 1. Stealth/Lurking
    if (p.activeTask === "lurking") {
        handleLurking(p, now);
    }

    // 2. Social/Dancing
    if (p.activeTask === "dancing") {
        handleDancing(p, now);
    }

    // 3. Automated Healing
    if (p.activeTask === "healing") {
        let weapon = ITEM_DB[p.stats.equippedWeapon];
        let healSpeed = weapon?.speed || 3500;
        
        if (!p.lastHealTime) p.lastHealTime = 0;
        if (now - p.lastHealTime > healSpeed) {
            performHeal(p, "auto"); 
            p.lastHealTime = now;
        }
    }

    // 4. Combat (Dungeons/Enemies)
    // Removed the timer logic here. performAttack handles its own 
    // attackSpeed checks and resets p.lastAttackTime only on hit.
    if (p.activeTask === "attacking") {
        performAttack(p);
    }

    // 5. Combat (Player vs Player)
    // Similarly, performPvPAttack should handle its own internal timing 
    // to prevent animation flickering.
    if (p.activeTask === "pvp") {
        performPvPAttack(p);
    }
	if (p.activeTask === "training") {
        handleTraining(p, now);
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
	lastEffectTick: Date.now(),
	effectInterval: 100,
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
	// ---  COMBAT TICK ---
    if (now - systemTimers.lastEnemyTick > systemTimers.enemyInterval) {
        // Only attack if the player is in the dungeon and it's active
        if (dungeonActive) handleEnemyAttacks();
        systemTimers.lastEnemyTick = now;
    }
	// -- mob area effect tick ---  
	if (now - systemTimers.lastEffectTick > systemTimers.effectInterval) {
		// Logic runs if the dungeon is active, even if we are looking at the Shop
		if (dungeonActive || viewArea === "lab") {
			handleMobEffects(now); 
		}
		systemTimers.lastEffectTick = now;
	}
	// Auto-Save Logic
    if (now - systemTimers.lastAutoSave > systemTimers.saveInterval) {
        // 1. Save all players
        Object.values(players).forEach(p => saveStats(p));
        systemTimers.lastAutoSave = now;
        
        // 2. Trigger UI Visual
        const saveEl = document.getElementById("save-indicator");
        if (saveEl) {
            saveEl.classList.remove("save-hidden");
            saveEl.classList.add("save-visible");

            // Hide it again after 2 seconds
            setTimeout(() => {
                saveEl.classList.remove("save-visible");
                saveEl.classList.add("save-hidden");
            }, 2000);
        }

        console.log("Game Autosaved");
    }
	updateBuyerNPC();
}
function updateAreaPlayerCounts() {
    const counts = { home: 0, town: 0, pond: 0, dungeon: 0, arena: 0, graveyard: 0, lab: 0, };
    
    Object.values(players).forEach(p => {
        if (counts[p.area] !== undefined) counts[p.area]++;
    });

    const selector = document.getElementById("view-area-selector");
    if (selector) {
        // Change the dungeon icon based on activity👻⚰️👹👾🏠🏙️🏟️🎣
        const dungeonIcon = dungeonActive ? "👹" : "👾";
        const dungeonLabel = dungeonActive ? "RAID ACTIVE" : "Dungeon";

        selector.options[0].text = `🏠 Home (${counts.home})`;
        selector.options[1].text = `🏙️ Town (${counts.town})`;
		selector.options[2].text = `🏟️ Arena (${counts.arena})`;
        selector.options[3].text = `🎣 Pond (${counts.pond})`;
        selector.options[4].text = `👾 Dungeon (${counts.dungeon})`;
		selector.options[5].text = `⚰️ Graveyard (${counts.graveyard})`;
		selector.options[6].text = `🧪 Laboratory (${counts.lab})`;
        
    }
}

function updateDungeonScoreboard() {
    const enemyList = document.getElementById("dungeon-enemy-list");
    const waveBox = document.getElementById("dungeon-wave-section");
    if (!enemyList || !waveBox) return;

    const currentTheme = DUNGEON_THEMES[dungeonTier] || DUNGEON_THEMES[1];

    // 1. Party HP (Using your existing syncUI helper is good, it prevents re-creating divs)
    const partyDwellers = Object.values(players).filter(p => p.area === "dungeon");
    partyDwellers.forEach(p => {
        const hpPct = Math.max(0, Math.floor((p.hp / p.maxHp) * 100));
        const statusClass = dungeonUIConfig.getStatusClass(hpPct, p.dead);
        syncUI(`party-${p.name}`, `${p.name}: ${hpPct}%`, "dungeon-party-list");
        const el = document.getElementById(`party-${p.name}`);
        if (el) el.className = statusClass;
    });

    if (dungeonActive) {
        waveBox.style.display = "block";
        
        // Update Theme & Wave
        const themeText = dungeonUIConfig.labels.theme(currentTheme.name);
        const waveText = isDungeonResting 
            ? dungeonUIConfig.labels.rest(dungeonGraceSeconds) 
            : dungeonUIConfig.labels.wave(dungeonWave, dungeonTier);
            
        updateText("dungeon-theme-display", themeText); 
        updateText("dungeon-wave-display", waveText);

        // 2. Boss UI
        const bossEl = document.getElementById("dungeon-boss-hp");
        if (boss && !boss.dead) {
            bossEl.style.display = "block";
            const bossHp = Math.max(0, Math.floor((boss.hp / boss.maxHp) * 100));
            bossEl.textContent = dungeonUIConfig.labels.boss(boss.name, bossHp);
        } else {
            bossEl.style.display = "none";
        }

        // 3. Enemy List Performance Fix
        // Instead of innerHTML = "", we only update if counts change or use fragments
        const aliveEnemies = enemies.filter(e => !e.dead);
        
        // Simple way: Only update innerHTML if it's actually different or at a lower frequency
        let enemyHTML = "";
        aliveEnemies.forEach(e => {
            const hpPct = Math.max(0, Math.floor((e.hp / e.maxHp) * 100));
            enemyHTML += `<div class="enemy-list-item" style="color:${e.color || '#ff4444'}">
                            ${e.name}: ${hpPct}%
                          </div>`;
        });
        enemyList.innerHTML = enemyHTML;

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
        // Show the box if we are in the initial countdown OR in a mid-run rest period
        const showDungeonTimer = (dungeonSecondsLeft > 0 || isDungeonResting);
        dTimerBox.style.display = showDungeonTimer ? "block" : "none";
        
        if (dungeonSecondsLeft > 0) {
            updateText("dungeon-timer-val", `DUNGEON START: ${dungeonSecondsLeft}s`);
        } else if (isDungeonResting) {
            updateText("dungeon-timer-val", `NEXT WAVE: ${dungeonGraceSeconds}s`);
        }
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

    // 4. INVENTORY TICK (Only if modal is open and on the Stats tab)
    if (frameCount % 30 === 0) {
        const modal = document.getElementById('inventory-modal');
        if (modal && !modal.classList.contains('hidden') && currentInventoryView === "stats") {
            if (currentInvTarget) renderStatsView(currentInvTarget);
        }
    }
}

let frameCount = 0;
function gameLoop() {
    const now = Date.now();
    frameCount++; 
    ctx.clearRect(0, 0, c.width, c.height); 

    // --- 1. LOGIC & TRANSITION UPDATES ---
    // Update the transition state (Calculates the alpha for this frame)
    updateAndDrawFade(ctx, c.width, c.height);
    // Check if the "Director" wants to switch areas
    runIdleViewMode();

    // --- 2. VISUAL FOUNDATION & ALPHA CONTROL ---
    ctx.save();
    
    // Screen Shake Logic
    if (window.shakeAmount > 0) {
        let sx = (Math.random() - 0.5) * window.shakeAmount;
        let sy = (Math.random() - 0.5) * window.shakeAmount;
        ctx.translate(sx, sy);
        window.shakeAmount *= 0.9; 
        if (window.shakeAmount < 0.1) window.shakeAmount = 0;
    }

    // --- THE DISSOLVE EFFECT ---
    // If a transition is active, we use its alpha. Otherwise, we stay at 1.0 (Solid)
    ctx.globalAlpha = cameraTransition.active ? cameraTransition.alpha : 1.0;
	handleMobEffects(now);
    // --- 3. WORLD RENDERING ---
    renderScene();
	drawMobEffects(ctx, now);
    if (frameCount % 3 === 0) updateUI(); 
    
    if (dungeonActive) {
        checkDungeonProgress(); 
        checkDungeonFailure();  
    } else {
        const anyoneInDungeon = Object.values(players).some(p => p.area === "dungeon");
        if (anyoneInDungeon) updateDungeonIdleTraining();
    }

    if (typeof arenaActive !== 'undefined' && arenaActive) {
        checkArenaVictory();
    }

    // Update Logic for all players
    Object.values(players).forEach(p => {
        if (!p.dead) {
            updatePhysics(p);           
            updatePlayerStatus(p, now); 
            
            if (p.activeTask === "pvp") {
                handlePvPLogic(p, now);
            } else {
                updatePlayerActions(p, now); 
            }
        }
    });

    // --- 4. RENDER PASS (Depth Sorting) ---
    let renderQueue = [];
    
    // Queue Players in current area
    Object.values(players).forEach(p => {
        if (p.area === viewArea) {
            renderQueue.push({ type: 'player', data: p, y: p.y });
        }
    });

    // Queue Monsters (Updated to include LAB view)
    if (viewArea === "dungeon" || viewArea === "lab") {
        // Add Boss if exists and matches area
        if (boss && !boss.dead && boss.area === viewArea) {
            renderQueue.push({ type: 'monster', data: boss, y: boss.y });
        }
        
        // Add Enemies that match area
        enemies.forEach(e => {
            if (!e.dead && e.area === viewArea) {
                renderQueue.push({ type: 'monster', data: e, y: e.y });
            }
        });

        // Only show loot beams in the actual dungeon
        if (viewArea === "dungeon") {
            drawLootBeams(ctx); 
        }
    }

    // Sort by Y-axis for depth
    renderQueue.sort((a, b) => a.y - b.y);

    // Draw everything in the sorted queue
    renderQueue.forEach(obj => {
        if (obj.type === 'player') {
            if (viewArea === "arena" && typeof arenaMode !== 'undefined' && arenaMode === "teams" && obj.data.team) {
                ctx.save();
                ctx.fillStyle = obj.data.team === "Red" ? "rgba(255,0,0,0.3)" : "rgba(0,0,255,0.3)";
                ctx.beginPath();
                ctx.ellipse(obj.data.x, obj.data.y + 2, 20, 8, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            drawStickman(ctx, obj.data);
        } else if (obj.type === 'monster') {
            drawMonster(ctx, obj.data);
        }
    });

    // --- 5. OVERLAYS (Fading with the world) ---
    updateAreaPlayerCounts();
    updateSystemTicks(now);  
    drawProjectiles(ctx);    
    updateSplashText(ctx);   
    handleTooltips();        
    drawDirectorIndicator(ctx);

    // --- 6. CLEANUP ---
    ctx.restore(); // Restores BOTH the shake translation AND the globalAlpha

    requestAnimationFrame(gameLoop);
}
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

let currentInvTarget = null;
// for players to open their own (self) inventory
const tooltipEl = document.getElementById('stat-tooltip');

function showStatTooltip(e, skillName) {
    const info = SKILL_INFO[skillName];
    if (!info) return;

    tooltipEl.innerHTML = `
        <span class="tooltip-title">${skillName.toUpperCase()}</span>
        ${info.info}<br>
        <span class="tooltip-rate">Rate: ${info.rate}</span><br>
        <span class="tooltip-bonus">Effect: ${info.bonus}</span>
    `;
    tooltipEl.classList.remove('hidden-tooltip');
    moveStatTooltip(e);
}

function moveStatTooltip(e) {
    // Offset by 15px so it doesn't sit directly under the cursor
    tooltipEl.style.left = (e.clientX + 15) + 'px';
    tooltipEl.style.top = (e.clientY + 15) + 'px';
}

function hideStatTooltip() {
    tooltipEl.classList.add('hidden-tooltip');
}
function toggleInventory() {
    const modal = document.getElementById('inventory-modal');
    
    // If it's already open, the button acts as a "Close" toggle
    if (!modal.classList.contains('hidden')) {
        closeInventory();
    } else {
        const p = getActiveProfile();
        const playerObj = players[p.name.toLowerCase()];
        openInventoryModal(playerObj);
    }
}
function toggleStickmenInventory(playerObj) {
    if (!playerObj) return;

    const modal = document.getElementById('inventory-modal');
    const isModalOpen = !modal.classList.contains('hidden');

    // If the modal is open AND we clicked the SAME person, close it.
    if (isModalOpen && currentInvTarget === playerObj) {
        closeInventory();
    } else {
        // Otherwise, open it (or switch the view to this new person)
        openInventoryModal(playerObj);
    }
}

// Internal function to open the inventory modal
function openInventoryModal(playerObj) {
    const modal = document.getElementById('inventory-modal');
    currentInvTarget = playerObj; // Lock the target
    
    modal.classList.remove('hidden');
    renderInventoryUI(playerObj);
}
function renderInventoryUI(playerObj) {
    // If called without arguments (like from a Tab click), use the global target
    if (!playerObj) playerObj = currentInvTarget;
    if (!playerObj) return;

    // 1. Update Header (Uses the name from the passed object)
    const nameEl = document.getElementById('inv-player-name');
    const pixelEl = document.getElementById('inv-pixels-val');
    if (nameEl) nameEl.textContent = playerObj.name.toUpperCase();
    if (pixelEl) pixelEl.textContent = (playerObj.stats.pixels || 0).toFixed(0);
    
    // 2. Section Routing
    const backpackTab = document.getElementById('backpack-Tab');
    const achTab = document.getElementById('achievements-tab');
    const statsTab = document.getElementById('stats-tab');
    const bpGrid = document.getElementById('backpack-grid');

    [backpackTab, achTab, statsTab].forEach(el => el?.classList.add('hidden'));
    
    renderEquippedSection(playerObj);

    if (currentInventoryView === "achievements") {
        achTab?.classList.remove('hidden');
        renderAchievements(playerObj);
    } 
    else if (currentInventoryView === "stats") {
        statsTab?.classList.remove('hidden');
        renderStatsView(playerObj);
    } 
    else {
        backpackTab?.classList.remove('hidden');
        renderItemsView(playerObj, bpGrid);
    }
}
function uiAction(cmd, itemName) {
    // Use the current target (the person whose inventory is open)
    const p = currentInvTarget; 
    if (!p) return;

    const fullCommand = `${cmd} "${itemName}"`;
    
    // Pass the target's name so processGameCommand affects them
    processGameCommand(p.name, fullCommand);
    
    // Refresh the UI after a short delay
    setTimeout(() => renderInventoryUI(p), 50);
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
            div.onclick = () => uiAction('!unequip', slot.cmd);
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
            uiAction('!equip', item);
        });
        
        const sellBtn = div.querySelector('.btn-sell');
        if (sellBtn) {
            sellBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                uiAction('!sell', item);
            });
        }

        bpGrid.appendChild(div);
    });
}
function renderStatsView(playerObj) {
    const statsGrid = document.getElementById('stats-grid');
    const s = playerObj.stats;

    // --- NEW: Calculate Idle Durations ---
    const totalDurationMS = getDynamicDuration(playerObj);
    const totalMinutes = Math.floor(totalDurationMS / 60000);
    
    let timeRemainingStr = "None";
    if (playerObj.activeTask && playerObj.taskEndTime) {
        const remainingMS = playerObj.taskEndTime - Date.now();
        if (remainingMS > 0) {
            const rMins = Math.floor(remainingMS / 60000);
            const rSecs = Math.floor((remainingMS % 60000) / 1000);
            timeRemainingStr = `${rMins}m ${rSecs}s`;
        } else {
            timeRemainingStr = "Expiring...";
        }
    }

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

            <div class="stats-activity-box" style="background: rgba(0,0,0,0.3); padding: 10px; margin: 10px 0; border-radius: 5px; border: 1px solid #444;">
                <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                    <span style="color:#aaa; font-size:10px;">IDLE CAPACITY (LVL ${s.combatLevel})</span>
                    <span style="color:#fff; font-weight:bold;">${totalMinutes} Minutes</span>
                </div>
                <div style="display:flex; justify-content:space-between;">
                    <span style="color:#aaa; font-size:10px;">CURRENT TASK TIMER</span>
                    <span style="color:#00ffff; font-family:monospace;">${timeRemainingStr}</span>
                </div>
                <div style="font-size:9px; color:#666; margin-top:5px; text-align:center;">
                    Task: ${playerObj.activeTask ? playerObj.activeTask.toUpperCase() : "IDLE"}
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
    
    // Convert name to match our SKILL_INFO keys
    const info = SKILL_INFO[name] || { info: "Generic Skill", rate: "???", bonus: "???" };

    return `
        <div class="stat-row" 
             onmouseenter="showStatTooltip(event, '${name}')" 
             onmouseleave="hideStatTooltip()"
             onmousemove="moveStatTooltip(event)">
            <div class="stat-info">
                <span>${name}</span>
                <span>Lvl ${level}</span>
            </div>
            <div class="stat-bar-bg">
                <div class="stat-bar-fill" style="width:${pct}%; background-color:${color}"></div>
            </div>
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

function cmdTrain(p, user, type) {
    if (p.dead) return;

    // Call the updated direct pose function
    cmdSetPose(p, type); 

    // Clear any temporary timers (like a wave timer)
    if (p.poseTimer) {
        clearTimeout(p.poseTimer);
        p.poseTimer = null;
    }

    // Set task for the game loop to handle XP
    p.activeTask = "training";
    p.trainingType = type;
    p.lastTrainingXP = Date.now(); 

    systemMessage(`${user} is now training: ${type}!`);
    saveStats(p);
}
function cmdEmote(p, type) {
    p.emote = type;
    
    // Clear any existing emote timer
    if (p.emoteTimer) clearTimeout(p.emoteTimer);
    
    // Reset to "normal" after 5 seconds
    p.emoteTimer = setTimeout(() => {
        p.emote = null;
    }, 5000);
	console.log(p + 'used emote' + type);
}
function cmdSetPose(p, poseName) {
    if (p.dead) return;
    
    let chosenPose = poseName?.toLowerCase();

    // 1. CLEAR POSE
    if (!chosenPose || ["none", "off", "stand"].includes(chosenPose)) {
        p.forcedPose = null;
        p.anim.bodyY = 0;
        p.anim.lean = 0;
        if (p.poseTimer) clearTimeout(p.poseTimer);
        systemMessage(`${p.name} is now standing.`);
        return;
    }

    // 2. VALIDATE & SET
    if (POSE_LIBRARY[chosenPose]) {
        const combatPoses = ["boxing", "archer", "action"];
        if (combatPoses.includes(chosenPose)) {
            systemMessage(`The ${chosenPose} pose is for combat only!`);
            return;
        }

        p.forcedPose = chosenPose;

        // 3. CLEANUP
        if (p.activeTask === "dancing") {
            p.activeTask = null;
            p.danceStyle = 0;
        }
        if (p.poseTimer) clearTimeout(p.poseTimer);

        systemMessage(`${p.name} set pose to: ${chosenPose}`);
    } else {
        const available = Object.keys(POSE_LIBRARY)
            .filter(k => !["boxing", "archer", "action"].includes(k))
            .join(", ");
        systemMessage(`Unknown pose. Available: ${available}`);
    }
}
function cmdTempPose(p, poseType, duration = 3000) {
    if (p.dead || !POSE_LIBRARY[poseType]) return;

    // 1. Set the body pose
    p.forcedPose = poseType;

    // 2. Cancel dancing so the pose takes priority
    if (p.activeTask === "dancing") {
        p.activeTask = null;
        p.taskEndTime = null;
        p.danceStyle = 0;
    }

    // 3. Clear any existing pose timer to prevent overlap
    if (p.poseTimer) clearTimeout(p.poseTimer);

    // 4. THE BLOCK GOES HERE: Reset to "none" after the duration
    p.poseTimer = setTimeout(() => {
		// Check if player and anim object still exist
		if (p && p.anim && p.forcedPose === poseType) {
			p.forcedPose = null;
			p.anim.bodyY = 0;
			p.anim.lean = 0;

			if (poseType === "pee") {
				cmdEmote(p, "neutral"); 
			}
		}
	}, duration);
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
    startTask(p, "attacking");
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
            startTask(p, "healing");
            systemMessage(`${user} started auto-healing the party (15m idle).`);
        }
        saveStats(p);
        return;
    }
}

function cmdRespawn(p) {
    if (!p.dead) {
        systemMessage(`${p.name}, you aren't even dead!`);
        return;
    }
    // 1. Reset Stats
    p.dead = false;
    p.hp = p.maxHp;
    p.activeTask = null; // Changed from "none" to null for consistency
    p.taskEndTime = null; // Clear the timer
	p.deathTime = null;
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
    startTask(p, "lurking");
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
    startTask(p, "fishing");
    
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
	startTask(p, "swimming");
    systemMessage(`${p.name} jumped into the water!`);
    saveStats(p);
}
function cmdDance(p, user, args) {
    if (p.dead) return;

    // Handle Weapon Sheathing
    if (p.stats.equippedWeapon) {
        p.stats.lastWeapon = p.stats.equippedWeapon;
        p.stats.equippedWeapon = null;
    }

    const level = p.stats.danceLevel || 1;
    let chosenStyle = parseInt(args[1]);

    // Get a list of ALL dances the player currently has the level for
    const unlockedIDs = Object.keys(DANCE_UNLOCKS)
        .filter(id => level >= DANCE_UNLOCKS[id].minLvl)
        .map(id => parseInt(id));

    if (!isNaN(chosenStyle)) {
        // Checking if the specific ID exists and if the player is high enough level
        if (!DANCE_UNLOCKS[chosenStyle]) {
            systemMessage(`${user}, that dance style doesn't exist!`);
            return;
        }
        if (level < DANCE_UNLOCKS[chosenStyle].minLvl) {
            systemMessage(`${user}, you need Dance Lvl ${DANCE_UNLOCKS[chosenStyle].minLvl} for ${DANCE_UNLOCKS[chosenStyle].name}!`);
            return;
        }
        p.danceStyle = chosenStyle;
    } else {
        // Randomize from ALL unlocked dances automatically
        p.danceStyle = unlockedIDs[Math.floor(Math.random() * unlockedIDs.length)];
    }

    // Force clear any static poses before dancing
    p.forcedPose = null; 
    
    startTask(p, "dancing");
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
    const lvl = p.stats.danceLevel || 1;
    let unlocked = [];
    let nextUnlock = null;

    Object.keys(DANCE_UNLOCKS).forEach(id => {
        const dance = DANCE_UNLOCKS[id];
        if (lvl >= dance.minLvl) {
            unlocked.push(`[${id}] ${dance.name}`);
        } else {
            // Track the very next dance they can get
            if (!nextUnlock || dance.minLvl < nextUnlock.minLvl) {
                nextUnlock = dance;
            }
        }
    });

    systemMessage(`Lvl ${lvl} Dances: ${unlocked.join(", ")}`);
    if (nextUnlock) {
        systemMessage(`Next: ${nextUnlock.name} at Lvl ${nextUnlock.minLvl}!`);
    }
}

function cmdStop(p, user) {
    const now = Date.now();
    const isTimeout = p.taskEndTime && now >= p.taskEndTime;
    const struggleDuration = p.struggleStartTime ? (now - p.struggleStartTime) : 0;
    const limit = getStruggleLimit(p);

    // 1. DROWNING LOGIC (Check against dynamic limit)
    if (isTimeout && p.area === "pond" && p.x > 250 && struggleDuration >= limit) {
        p.hp = 0;
        p.dead = true;
        p.deathTime = now;
        p.activeTask = null;
        p.taskEndTime = null;
        p.struggleStartTime = null; 
        systemMessage(`💀 ${p.name} ran out of air after ${Math.floor(limit/1000)}s of struggling.`);
        saveStats(p);
        return; 
    }

    // 2. SAFE EXIT
    if (p.stats.lastWeapon) {
        p.stats.equippedWeapon = p.stats.lastWeapon;
        p.stats.lastWeapon = null;
    }

    if (p.area === "pond" && p.x > 200) {
        systemMessage(`${p.name} is heading back to the shore.`);
        p.targetX = 100 + (Math.random() * 80); 
    } else {
        p.targetX = null; 
    }

    p.activeTask = null;
    p.taskEndTime = null;
    p.struggleStartTime = null; 
    p.danceStyle = 0;
    p.forcedPose = null; 
    
    saveStats(p);
}

// TODO:
// cmdequip needs ot be made smarter so its easier to use via twitch chat commands, 
// !equip weapon (should auto equip the highest tier weapon they have, since no type is set it will choose a weapon type matching their their highest skill (
// !equip staff, equip book or equip wand - should equip highest tier staff wand or book
// !equip sword (highest tier sword type)
// !equip highest tier by type, or !equip highest tier by type && skill
// so !equip armor should take that players highest skill and match their highest tier armor or equipment of that type, with that skill
// same with !equip legs, !equip boots, !equip pants, !equip helmet, cape, cloak, gloves, bow, sword, axe, staff, book, wand /equip weapon matches their highest skill and equip sword or dagger will just point to the weapon type since all melee weapons are "weapon" type   
// !equip healer - should equip highest tier staff type that has item.heal: 1; or higher
// !equip archer - should equip the highest tier bow type and items matching item.skill "archer"
// !equip lurker - eauips highest tier lurker stuff item.skill = "lurk" 
//Equip attack or equip melee - equips highest tier "weapon" types & equipment that matches item.skill "attack"
// !equip sword
//archer = "bow"
// and just !equip should find their highest skill and equip matching weapon, bow, or staff, and equipment and gear them up,
// and of course !equip random 

// attack = "weapon"
// magic = "staff", "wand" or "book"
// heal =  "staff", "wand" or "book" && item.heal exists and is greater than 0
// lurk = (second highest skill lvl matching weapons)"

function cmdEquip(p, args) {
	const canEquip = !p.activeTask || p.activeTask === "none" || p.activeTask === "organizing";

    if (!canEquip) {
        systemMessage(`${p.name}: You are too busy ${p.activeTask} to change gear right now!`);
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

    if (p.activeTask === "organizing") {
        organizeDungeonRanks(); 
    }
    if (msg) {
        systemMessage(`${p.name} ${msg}!`);
		renderInventoryUI();
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
		renderInventoryUI();
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

function cmdLabTestAdmin(p, args) {
    const subCmd = args[1]?.toLowerCase();
    const targetKey = args[2]; // e.g., "WolfSpider" or "5"

    // 1. !lab parade
    if (subCmd === "parade") {
        viewArea = "lab";
        labParade();
        return;
    }

    // 2. !lab spawnmob [monsterKey] OR !lab spawnmob (random)
    if (subCmd === "spawnmob") {
        viewArea = "lab";
        let mobToSpawn;

        if (targetKey) {
            // Find specific key (case-insensitive)
            mobToSpawn = Object.keys(MONSTER_DB).find(k => k.toLowerCase() === targetKey.toLowerCase());
        } else {
            // Random mob from the whole DB
            const keys = Object.keys(MONSTER_DB);
            mobToSpawn = keys[Math.floor(Math.random() * keys.length)];
        }

        if (mobToSpawn) {
            spawnLabTest(mobToSpawn);
        } else {
            systemMessage(`❌ Monster "${targetKey}" not found.`);
        }
        return;
    }

    // 3. !lab spawntier [tierNumber]
    if (subCmd === "spawntier") {
        viewArea = "lab";
        const tier = parseInt(targetKey) || 1;
        const theme = DUNGEON_THEMES[tier] || DUNGEON_THEMES[1];
        const randomMob = theme.mobs[Math.floor(Math.random() * theme.mobs.length)];
        
        systemMessage(`🔬 Lab: Spawning Tier ${tier} (${theme.name})`);
        spawnLabTest(randomMob);
        return;
    }

    systemMessage("Usage: !lab parade | spawnmob [key] | spawntier [num]");
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

function drawChatBubble(ctx, p, x, y, msg, fontStyle = "") {
    ctx.save(); // Save current state (including non-italic font)

    // Apply font style for this bubble only
    ctx.font = `${fontStyle} 11px monospace`.trim();
    
    const padding = 8;
    const textWidth = ctx.measureText(msg).width;
    const bw = textWidth + padding * 2;
    const bh = 18;
    const bx = x - bw / 2;
    const by = y - 65;

    // Bubble Background
    ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 5);
    ctx.fill();
    ctx.stroke();

    // Little triangle pointer
    ctx.beginPath();
    ctx.moveTo(x - 5, by + bh);
    ctx.lineTo(x + 5, by + bh);
    ctx.lineTo(x, by + bh + 5);
    ctx.fill();
    ctx.stroke();

    // Text rendering
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(msg, x, by + 13);

    ctx.restore(); // Reset to previous state (removes italics)
}
// --- Helper Function for Cooldowns ---
function isOnCooldown(p, cmd, seconds) {
    const now = Date.now();
    const lastUse = p.cooldowns[cmd] || 0;
    const diff = (now - lastUse) / 1000;

    if (diff < seconds) {
        console.log(`${p.name} is on cooldown for ${cmd}: ${Math.ceil(seconds - diff)}s left`);
        return true;
    }
    
    p.cooldowns[cmd] = now; // Set the new cooldown time
    return false;
}


const adminCommands = [
    "!idlemode", "!showhome", "::home", "!showtown", "::town", "!showgraveyard", 
    "::graveyard", "::gy", "!showpond", "::pond", "!showdungeon", "::dungeon", 
    "!showarena", "::arena", "!spawnmerchant", "!despawnmerchant", "!resetmerchant", 
    "!give", "!additem", "!scrub", "name", "/name", "color", "/color", 
    "!labadmin", "!dungeontest", "!nuke" // <--- Added here
];
/* 
some cmd usage:
labadmin cmd usage:
!labadmin parade	Starts the automatic rotation of all monsters.
!labadmin spawnmob	Spawns a completely random monster from the DB.
!labadmin spawnmob DireWolf	Spawns the specific Dire Wolf for testing.
!labadmin spawntier 5	Spawns a random mob from the Tier 5 (Frozen Tundra) pool. */
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
        if (cmd === "!scrub") { scrubAllInventories(); return; }
        if (cmd === "!give" || cmd === "!additem") {
            let target = args[1];
            let item = args.slice(2).join(" ");
            addItemToPlayer(target, item);
            return;
        }
		if (cmd === "!labadmin") {
			// We pass 'p' (the player object) and 'args' (the split message)
			cmdLabTestAdmin(p, args);
			return;
		}
		if (cmd === "!idlemode") {
			stickmenfall_Config.idleViewEnabled = !stickmenfall_Config.idleViewEnabled;
			systemMessage(`Idle View Mode: ${stickmenfall_Config.idleViewEnabled ? "ON" : "OFF"}`);
			lastIdleSwitchTime = Date.now(); // Reset timer on toggle
		}
        if (cmd === "!showhome" || cmd === "::home") { viewArea = "home"; return; }
        if (cmd === "!showdungeon" || cmd === "::dungeon") { viewArea = "dungeon"; return; }
        if (cmd === "!showpond" || cmd === "::pond") { viewArea = "pond"; return; }
        if (cmd === "!showarena" || cmd === "::arena") { viewArea = "arena"; return; }
		if (cmd === "!showtown" || cmd === "::town") { viewArea = "town"; return; }
		if (cmd === "!showgraveyard" || cmd === "::gy") { viewArea = "graveyard"; return; }
		if (cmd === "!showlab" || cmd === "::lab") { viewArea = "lab"; return; }
        if (cmd === "!spawnmerchant") { forceBuyer = true; updateBuyerNPC(); systemMessage("[Pond] Merchant spawned."); return; }
        if (cmd === "!despawnmerchant") { forceBuyer = false; updateBuyerNPC(); systemMessage("[Pond] Merchant removed."); return; }
        if (cmd === "!resetmerchant") { forceBuyer = null; updateBuyerNPC(); return; }
		// COMMAND: /name [NewName]
		if (cmd === "!name" || cmd === "/name") {
			if (flags.developer) {
				let newName = args[1];
				if (newName) {
					updateBrowserProfile(newName, null);
				}
			}
			return;
		}

		// COMMAND: /color [HexCode]
		if (cmd === "!color" || cmd === "/color") {
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
		if (cmd === "!dungeontest") {
			// Usage: !dungeontest [Tier] [Wave]
			// args[1] is Tier, args[2] is Wave (based on your .split(" ") logic)
			let t = args[1] ? args[1].replace(/\D/g, "") : 1;
			let w = args[2] ? args[2].replace(/\D/g, "") : 1;

			testDungeonTier(p, t, w);
			return;
		}

		if (cmd === "!nuke") {
			enemies.forEach(e => { e.hp = 0; e.dead = true; });
			if (boss) { boss.hp = 0; boss.dead = true; }
			systemMessage("☢️ Admin cleared the floor.");
			checkDungeonProgress(); // Trigger the wave completion logic immediately
			return;
		}
    }
// --- 2. STANDARD PLAYER ACTION COMMANDS (Everyone) ---
    // Define cooldowns for groups of commands
    // Actions that can be spammed slightly
    const fastActions = ["!attack", "!fish", "!swim", "!lurk", "!sheath", "!dance", "!heal", "!unequip", "!equip", ]; 
    // Actions that should be slower
    const mediumActions = [ "!travel", "!respawn", "!clearinventory", "!clearinv"];
    // Travel and UI commands
    const slowActions = ["!home", "!pond", "!town", "!arena", "!dungeon", "!join", "!pvp"];
    // Apply the cooldown checks
    if (fastActions.includes(cmd) && isOnCooldown(p, "fast", 3)) return;
    if (mediumActions.includes(cmd) && isOnCooldown(p, "med", 6)) return;
    if (slowActions.includes(cmd) && isOnCooldown(p, "slow", 8)) return;
    // Now run the actual logic
    if (cmd === "!clearinventory" || cmd === "!clearinv") { clearPlayerInventory(p.name); return; }
    if (cmd === "!stop" || cmd === "!idle" || cmd === "!reset") { cmdStop(p, user); return; }
    if (cmd === "!attack" || cmd === "attack") { cmdAttack(p, user); return; }
    if (cmd === "!fish" || cmd === "fish")   { cmdFish(p, user); return; }
    if (cmd === "!swim")   { cmdSwim(p, user); return; }
    if (cmd === "!heal")   { cmdHeal(p, user, args); return; }
    if (cmd === "!dance")  { cmdDance(p, user, args); return; }
    if (cmd === "!lurk")   { cmdLurk(p, user); return; }
	if (cmd === "!meditate"|| cmd === "::meditate" ) { cmdTrain(p, user, "meditate"); return; }
	if (cmd === "!pushups" || cmd === "::pushups" )  { cmdTrain(p, user, "pushups"); return; }
    if (cmd === "!respawn") { cmdRespawn(p); return; }
	// The General Command
	
    // -- Travel commands
    if (cmd === "!travel") { movePlayer(p, args[1]); return; }
    if (cmd === "!home")   { movePlayer(p, "home"); return; }
    if (cmd === "!pond")   { movePlayer(p, "pond"); return; }
    if (cmd === "!town")   { movePlayer(p, "town"); return; }
    if (cmd === "!arena")  { movePlayer(p, "arena"); return; }
    if (cmd === "!dungeon") { movePlayer(p, "dungeon"); return; }
	if (cmd === "!lab") { movePlayer(p, "lab"); return; }
	if (cmd === "!graveyard" || cmd === "!gy") { movePlayer(p, "graveyard"); return; }
    // -- Events
    if (cmd === "!join")   { joinDungeonQueue(p); return; }
    if (cmd === "!pvp")    { joinArenaQueue(p); return; }
	
    // -- Misc / UI (Usually no cooldown or very short)
	if (cmd === ":)" || cmd === "!happy")     { cmdEmote(p, "happy"); return; }
	if (cmd === ":(" || cmd === "!sad")       { cmdEmote(p, "sad"); return; }
	if (cmd === ":'(" || cmd === "!cry")      { cmdEmote(p, "cry"); return; }
	if (cmd === "xd" || cmd === "!laugh")     { cmdEmote(p, "laugh"); return; }
	if (cmd === ":o" || cmd === "!surprised") { cmdEmote(p, "surprised"); return; }
	if (cmd === ":d" || cmd === "!grin")      { cmdEmote(p, "grin"); return; }
	if (cmd === "0.0" || cmd === "wtf")       { cmdEmote(p, "wtf"); return; }
	if (cmd === ":@" || cmd === "!angry")     { cmdEmote(p, "angry"); return; }
	if (cmd === ":3")                         { cmdEmote(p, "cat"); return; }
	if (cmd === "uwu")                        { cmdEmote(p, "uwu"); return;}
	if (cmd === ":/")                         { cmdEmote(p, "skeptical"); return; }
	if (cmd === ":|" || cmd === "-_-" || cmd === "-.-")        { cmdEmote(p, "neutral"); return; }
	if (cmd === ":p")                         { cmdEmote(p, "tongue"); return; }
	if (cmd === ":#" || cmd === "!blush")      { cmdEmote(p, "blush"); return; }
	if (cmd === "x.x" || cmd === "!dead") { cmdEmote(p, "ko"); return; }
	const greetings = ["0/", "o/", "\\o", "\\0", "hi", "hey", "hello", "ola"];
    if (greetings.includes(cmd)) {
        cmdEmote(p, "grin"); 
        cmdTempPose(p, "wave", 3000); 
        return; 
    }
	if (cmd === "!pee" || cmd === "::pee") { cmdTempPose(p, "pee", 5000); return; }
	if (cmd === "!pose" || cmd === "::pose")    { cmdSetPose(p, args[1]); return; }
	if (cmd === "!sit" || cmd === "::sit")     { cmdSetPose(p, "sit"); return; }
	if (cmd === "!stand" || cmd === "::stand")   { cmdSetPose(p, "none"); return; }
    if (cmd === "!wigcolor")   { cmdWigColor(p, args); return; }
    if (cmd === "!sheath")     { cmdSheath(p, user); return; }
    if (cmd === "!equip")      { cmdEquip(p, args); return; }
    if (cmd === "!unequip")    { cmdUnequip(p, args); return; }
    if (cmd === "!inventory" || cmd === "!bag") { cmdInventory(p, user, args); return; }
    if (cmd === "!sell")       { cmdSell(p, user, args); return; }
    if (cmd === "!bal" || cmd === "!pixels") { cmdBalance(p); return; }
    if (cmd === "!listdances") { cmdListDances(p); return; }
	const isAttemptedCommand = msg.startsWith("!") || msg.startsWith(")") || msg.startsWith(":") || msg.startsWith("/");

    // Also check if it's a short, normal message.
    // We don't want to show bubbles for attempted commands that failed.
	// --- Inside Section 3: Chat Bubble Logic ---
	if (!isAttemptedCommand && msg.length <= 40) {
		if (!isOnCooldown(p, "chat_bubble", 3)) {
			
			if (p.dead) {
				const timeDead = Date.now() - p.deathTime;
				const stage1_Decay = 5 * 60 * 1000;
				const stage2_Grave = 10 * 60 * 1000;
				const stage3_Ghost = 15 * 60 * 1000;

				// Only allow moaning if they are Decaying or a Ghost
				// This prevents the "Buried" gravestone from moaning
				const canMoan = (timeDead >= stage1_Decay && timeDead < stage2_Grave) || (timeDead >= stage3_Ghost);

				if (canMoan) {
					p.chatMessage = generateGhostTalk();
					p.chatTime = Date.now();
				}
				// If they are "Freshly Dead" or "Buried", we do nothing (Silence)
			} else {
				// Living players speak normally
				p.chatMessage = msg;
				p.chatTime = Date.now();
			}
		}
	}
}

// 1. The Regular Chat Handler
ComfyJS.onChat = (user, msg, color, flags, extra) => {
    if (!userColors[user]) userColors[user] = extra.userColor || "orangered";
    processGameCommand(user, msg, flags, extra);

};

// 2. The Command Handler (Matches messages starting with !)
ComfyJS.onCommand = (user, cmd, args, flags, extra) => {
    if (!userColors[user]) userColors[user] = extra.userColor || "orangered";
  // Join args array into a space-separated string maybe
    //let argString = (args && args.length > 0) ? args.join(" ") : "";
    //let fullMsg = "!" + cmd + " " + argString;
    // Reconstruct the message so processGameCommand can read it normally
    // We add the "!" back to the cmd so your prefix-stripping logic works perfectly
    let fullMsg = "!" + cmd + " " + args;
    
    processGameCommand(user, fullMsg.trim(), flags, extra);
};

// Close button specifically
document.getElementById('inventoryClosebtn').addEventListener('click', () => {
    closeInventory();
});
function closeInventory() {
    const modal = document.getElementById('inventory-modal');
    modal.classList.add('hidden');
    
    // Clear the target so toggleStickmenInventory knows 
    // nothing is currently being viewed.
    currentInvTarget = null; 
}
// Function to handle the cleanup
document.addEventListener('keydown', (e) => {
    if (e.key === "Escape") {
        const modal = document.getElementById('inventory-modal');
        if (!modal.classList.contains('hidden')) {
            closeInventory();
        }
        
        // Also hide the context bubble if it's open
        document.getElementById("player-context-bubble").classList.add('hidden');
    }
});


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

//localStorage.removeItem("rpg_JaeDraze");
//localStorage.removeItem("rpg_Player1");
//localStorage.removeItem("rpg_player1");