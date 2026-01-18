// offshoot game called stickmenpo - samurai ninja game?

// creation tool. make a pen u can draw with, 
//choose if its a player body, an enemy, a weapon, an armour, a helmet, a bow, a staff or a graffiti or npc, or projectile or face or  and save data

//dont Constants and important things
const c = document.getElementById("c");
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
function idleActionMsg(text, color = "#0f0") {
    const box = document.getElementById("idleActionsBox");
    if (!box) return;

    const entry = document.createElement("div");
    entry.style.color = color;
    entry.style.marginBottom = "2px";
    entry.style.borderLeft = `2px solid ${color}`;
    entry.style.paddingLeft = "5px";
    
    // Add a timestamp so you can see when it happened
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    entry.innerHTML = `<span style="color:#555;">[${time}]</span> ${text}`;

    box.appendChild(entry);

    // Auto-scroll to the bottom
    box.scrollTop = box.scrollHeight;

    // Optional: Limit the number of messages so the page doesn't lag
    if (box.childNodes.length > 50) {
        box.removeChild(box.firstChild);
    }
}

/* ====grr============= CONFIG & STATE ================== */
// we can change these [ basically options ] 
let viewArea = "home"; 
const TASK_DURATION = 15 * 60 * 1000; // 15 Minutes
/* ================= DATA PERSISTENCE ================= */
/* ================= DATA PERSISTENCE ================= */
function loadStats(name) {
    const saved = localStorage.getItem("rpg_" + name);
    let stats = saved ? JSON.parse(saved) : {
        attackLevel: 1, attackXP: 0,
        healLevel: 1, healXP: 0,
        fishLevel: 1, fishXP: 0,
        danceLevel: 1, danceXP: 0,
		swimLevel: 1, swimXP: 0, 
        swimDistance: 0,
        combatLevel: 1,
        gold: 0,
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
        wigColor: null 
    };
	if (stats.swimLevel === undefined) stats.swimLevel = 1;
    if (stats.swimXP === undefined) stats.swimXP = 0;
    if (stats.swimDistance === undefined) stats.swimDistance = 0;
    // --- SAFETY CHECKS FOR OLD SAVES ---
    if (isNaN(stats.gold) || stats.gold === null) stats.gold = 0;
    
    if (!stats.inventory || !Array.isArray(stats.inventory)) {
        stats.inventory = ["Fishing Rod"];
    }

    if (!stats.inventory.includes("Fishing Rod")) {
        stats.inventory.push("Fishing Rod");
    }
    
    // --- PATCH MISSING SLOTS FOR OLD PLAYERS ---
    if (stats.equippedWeapon === undefined) stats.equippedWeapon = null;
    if (stats.equippedArmor === undefined) stats.equippedArmor = null;
    if (stats.equippedHelmet === undefined) stats.equippedHelmet = null;
    if (stats.equippedBoots === undefined) stats.equippedBoots = null;
    
    // New patches for the new items!
    if (stats.equippedPants === undefined) stats.equippedPants = null;
    if (stats.equippedCape === undefined) stats.equippedCape = null;
    if (stats.equippedGloves === undefined) stats.equippedGloves = null;
    if (stats.equippedHair === undefined) stats.equippedHair = null;

    if (stats.danceLevel === undefined) stats.danceLevel = 1;
    if (stats.danceXP === undefined) stats.danceXP = 0;
    if (stats.wigColor === undefined) stats.wigColor = null;

    return stats;
}
function saveStats(p) {
    localStorage.setItem("rpg_" + p.name, JSON.stringify(p.stats));
}
/* ================= PLAYER SETUP ================= */
function getPlayer(name, color) {
    if (players[name]) return players[name];
    
    players[name] = {
        name, 
        color: color || "#00ffff",
        x: Math.random() * 800 + 100, 
        y: 450,
        targetX: null,
        hp: 100, 
        maxHp: 100, 
        dead: false,
        area: "home", 
        activeTask: null,
        danceStyle: 0, // <--- Correct way to add it! s
		lastDanceXP: 0,
        stats: loadStats(name)
    };
    
    return players[name];
}
function movePlayer(p, targetArea) {
    if (p.dead) {
        systemMessage(`${p.name} is a corpse and cannot travel!`);
        return;
    }
    p.area = targetArea;

    if (targetArea === "pond") {
        // Shore is 0 to 250. We keep them between 50 and 200 so they aren't off-screen 
        // or touching the very edge of the water.
        p.x = Math.random() * 150 + 50; 
        p.y = 450 + Math.random() * 20; // Keep them on a flat line along the shore
    } else {
        p.x = Math.random() * 700 + 100;
        p.y = 400 + Math.random() * 100;
    }

    p.activeTask = null; 
    if (targetArea !== "dungeon") dungeonQueue = dungeonQueue.filter(n => n !== p.name);
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
//===============================================

//------------------------------------------------

//------------------------------------------------
//            SPLASH TEXT
let floaters = [];
function spawnFloater(text, x, y, color, area) {
    // If for some reason area isn't passed, fall back to 'home'
    const spawnArea = area || "home";
    console.log(`%c[FLOATER] "${text}" spawned in [${spawnArea}]`, `color: ${color}; font-weight: bold; background: #000;`);
	// 2. Idle Actions Box (HTML)
    // We send a cleaner version of the text to the UI box
    idleActionMsg(`[${spawnArea}] ${text}`, color);
    // 3. (OPTIONAL DEBUG) Trace to see what called this (performFish, handleEnemyAttacks, etc)
    //console.trace("Trigger Source:");
	//4. push to the array
    floaters.push({ 
        text, 
        x, 
        y, 
        color, 
        life: 150,
        area: spawnArea // Crucial: This tags the text to its specific room
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
    p.stats.combatLevel = Math.floor((p.stats.attackLevel + p.stats.healLevel + (p.stats.fishLevel * 0.5)) / 2);
}
//-------------------------------------------------------------------
function applyDamage(target, amount, color = "#f00") {
    if (target.dead) return;

    target.hp -= amount;
    spawnFloater(`-${amount}`, target.x, target.y - 40, color, target.area);

    if (target.hp <= 0) {
        target.hp = 0;
        target.dead = true;
        target.activeTask = "none"; // Stop whatever they were doing
        target.deathTime = Date.now();
        target.deathStyle = Math.random() > 0.5 ? "faceplant" : "backflip";
        
        systemMessage(`${target.name || 'A player'} has fallen!`);
    }
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

//================== COMBAT ==============================
// --- COMBAT -----------------------
function performAttack(p) {
    if (p.dead) return;

    // 1. Identify Target
    let target = null;
    if (p.area === "dungeon") {
        target = enemies.find(e => !e.dead) || boss;
    } else if (p.area === "home") {
        target = Object.values(players).find(pl => pl.area === "home" && !pl.dead && pl.name !== p.name);
    }
    if (!target || target.dead) return;

    // 2. Determine Range and Position
    const isBow = p.stats.equippedWeapon?.toLowerCase().includes("shortbow");
    const rangeNeeded = isBow ? 200 : 50;
    
    // Set movement target: Bow users stay back, Melee users go close
    p.targetX = target.x - (isBow ? 150 : 30);

    // 3. Range Check & Combat Execution
    if (Math.abs(p.x - target.x) <= rangeNeeded) {
        let weapon = ITEM_DB[p.stats.equippedWeapon];
        let dmg = 5 + (p.stats.attackLevel * 2) + (weapon ? weapon.power : 0);
        
        // Visuals
        if (isBow) {
            spawnArrow(p.x + 10, p.y - 10, target.x, target.y);
        }
        
        target.hp -= dmg;
        spawnFloater(`-${dmg}`, target.x, target.y - 40, "#ff4444", target.area);

        // 4. Kill Logic & Looting
        if (target.hp <= 0) {
            target.hp = 0;
            target.dead = true;
            systemMessage(`${target.name || "Enemy"} slain by ${p.name}!`);

            if (p.area === "dungeon") {
                handleLoot(p, target); // Cleaned up loot into its own check
                checkDungeonProgress();
            }
        }

        // 5. XP and Progress
        p.stats.attackXP += 10;
        if (p.stats.attackXP >= xpNeeded(p.stats.attackLevel)) {
            p.stats.attackLevel++;
            p.stats.attackXP = 0;
            systemMessage(`${p.name} ATK UP (Lv ${p.stats.attackLevel})`);
        }
        updateCombatLevel(p);
        saveStats(p);
    }
}
// Loot Helper to keep performAttack clean
function handleLoot(p, target) {
    let roll = Math.random();
    let drop = null;

    if (target === boss) {
        // Boss guaranteed high-tier
        drop = roll > 0.5 ? "Iron Plate" : "Iron Sword";
    } else {
        // Minion rare drops
        if (roll > 0.98) drop = "Iron helmet";
        else if (roll > 0.90) drop = "shitty shortbow";
        else if (roll > 0.85) drop = "Leather Tunic";
        else if (roll > 0.70) drop = "Paper Bag";
    }

    if (drop) {
        p.stats.inventory.push(drop);
        systemMessage(`✨ ${p.name} looted: ${drop}!`);
    }
}
//------------------------------------

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
        systemMessage("--- [NPC] THE FISH MERCHANT HAS ARRIVED (2X GOLD)! ---");
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

    // Gold Trim on Cloak
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
    ctx.fillText("✦ 2X GOLD RATE ✦", bx, textY + 14);
}
// fishing task :
function performFish(p) {
    if (p.area !== "pond" || p.dead) return;
    if (p.stats.fishCaught === undefined) p.stats.fishCaught = 0;

    let roll = Math.random();
    let resultText = "";
    let isFish = false;
    let floaterColor = "#44ccff"; // Default Blue

    // 1. Check for Buyer-Only Golden Fish (5% chance)
    if (buyerActive && Math.random() < 0.05) {
        p.stats.inventory.push("Golden Bass");
        resultText = "GOLDEN BASS!";
        floaterColor = "#FFD700"; // Gold color
        isFish = true;
        systemMessage(`✨ ${p.name} landed a rare GOLDEN BASS!`);
    } 
    // 2. Original Rarity Logic
    else if (roll < 0.001) {
        p.stats.inventory.push("wig");
        resultText = "THE LEGENDARY WIG!";
        floaterColor = "#FFD700";
        systemMessage(`[!] MYTHIC CATCH: ${p.name} found a Legendary Wig!`);
    } 
    else if (roll < 0.015) {
        p.stats.inventory.push("leather Booties");
        resultText = "leather Boots!";
    } 
    else if (roll < 0.065) {
        p.stats.inventory.push("Leather scrap");
        resultText = "Leather scrap";
        floaterColor = "#a88d6d";
    } 
    else {
        const weight = (Math.random() * 20 + 0.5).toFixed(1);
        const fishItem = `${weight}kg Bass`; 
        p.stats.inventory.push(fishItem);
        resultText = fishItem;
        isFish = true;
        p.stats.fishCaught++;
    }

    let displayMsg = `🎣 ${resultText}`;
    if (isFish && resultText !== "GOLDEN BASS!") displayMsg += ` (#${p.stats.fishCaught})`;

    spawnFloater(displayMsg, p.x, p.y - 60, floaterColor, p.area);
    
    // XP Logic
    p.stats.fishXP += 10;
    if (p.stats.fishXP >= xpNeeded(p.stats.fishLevel) * 2) {
        p.stats.fishLevel++; 
        p.stats.fishXP = 0;
        systemMessage(`${p.name} FISH UP! (Lv ${p.stats.fishLevel})`);
    }
    updateCombatLevel(p);
    saveStats(p);
}
//============================================================
// === NEW SWIMMING STUFF (LIKE FISHING THIS CAN ONLY CURRENTLY BE DONE IN THE POND AREA
function performSwim(p) {
    if (p.area !== "pond" || p.dead) return;
    if (p.stats.swimDistance === undefined) p.stats.swimDistance = 0;

    let roll = Math.random();
    let resultText = "";
    let floaterColor = "#00ffff"; // Cyan for swimming
    let foundItem = false;

    // 1. Rarity Logic for Diving
    if (roll < 0.005) {
        p.stats.inventory.push("Pearl");
        resultText = "found a SHINING PEARL!";
        floaterColor = "#fff5e6";
        foundItem = true;
        systemMessage(`✨ ${p.name} dove deep and surfaced with a Rare Pearl!`);
    } 
    else if (roll < 0.05) {
        p.stats.inventory.push("Sea Shell");
        resultText = "found a pretty Sea Shell";
        foundItem = true;
    }
    else {
        // Just distance gain
        const meters = Math.floor(Math.random() * 5 + 1);
        p.stats.swimDistance += meters;
        resultText = `swam ${meters}m...`;
    }

    let displayMsg = `🏊 ${resultText}`;
    if (!foundItem) displayMsg += ` (Total: ${p.stats.swimDistance}m)`;

    spawnFloater(displayMsg, p.x, p.y - 60, floaterColor, p.area);
    
    // XP Logic
    p.stats.swimXP = (p.stats.swimXP || 0) + 12;
    if (p.stats.swimXP >= xpNeeded(p.stats.swimLevel || 1) * 2) {
        p.stats.swimLevel = (p.stats.swimLevel || 1) + 1; 
        p.stats.swimXP = 0;
        systemMessage(`${p.name} SWIM UP! (Lv ${p.stats.swimLevel})`);
    }
    updateCombatLevel(p);
    saveStats(p);
}
//------------------------------------------------------------

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
//goSwimming(){}
//------------------------------------------------------------
//rideBoat(){}
//dockBoat(){}
//------------------------------------------------------------
//============================================================

//============================================================
//======================= DUNGEON AREA =======================
// --- DUNGEON variables -------------------------------------
let enemies = [];
let boss = null;

let dungeonQueue = [];
let dungeonTimer = null;
let dungeonActive = false;
let dungeonWave = 1;
let dungeonSecondsLeft = 0;
let dungeonCountdownInterval = null; // To track the interval
//-----------------------------------------------------------
//-- MAIN DUNGEON STUFF --
function joinDungeonQueue(p) {
    if (p.dead) return;
    
    if (!dungeonQueue.includes(p.name)) {
        dungeonQueue.push(p.name);
        systemMessage(`${p.name} joined the queue (${dungeonQueue.length} total)`);
    }

    // If the timer isn't already running, start it
    if (!dungeonCountdownInterval) {
        dungeonSecondsLeft = 60;
        
        systemMessage("Dungeon timer started!");

        dungeonCountdownInterval = setInterval(() => {
            dungeonSecondsLeft--;

            // --- AUTO-SWITCH VIEW (30 seconds before start) ---
            if (dungeonSecondsLeft === 30) {
                viewArea = "dungeon";
                document.getElementById("areaDisplay").textContent = "StickmenFallv2.1.9 - VIEWING: DUNGEON (PREPARING)";
                systemMessage("System: Switching view to Dungeon for upcoming raid...");
            }

            // --- START DUNGEON (At 0 seconds) ---
            if (dungeonSecondsLeft <= 0) {
                clearInterval(dungeonCountdownInterval);
                dungeonCountdownInterval = null;
                startDungeon();
            }
        }, 1000);
    }
}
function startDungeon() {
    dungeonSecondsLeft = 0; // Clear the counter
    dungeonActive = true;
    
    // Ensure the view is definitely on the dungeon
    viewArea = "dungeon"; 
    document.getElementById("areaDisplay").textContent = "StickmenFallv2.1.9 - VIEWING: DUNGEON (ACTIVE)";

    dungeonQueue.forEach(name => {
        let p = players[name];
        if (p && !p.dead) {
            p.area = "dungeon";
            p.x = Math.random() * 400 + 50;
            p.y = -100; // Start higher up
            p.targetY = 450; 
        }
    });
    
    systemMessage("The Dungeon Gates have opened!");
    spawnWave();
}

function spawnWave() {
    enemies = [];
    for (let i = 0; i < 3; i++) {
        enemies.push({ name: "Minion", hp: 50 * dungeonWave, maxHp: 50 * dungeonWave, x: 600 + (i * 50), y: 400, dead: false });
    }
    if (dungeonWave % 3 === 0) {
        boss = { name: "DUNGEON OVERLORD", hp: 500, maxHp: 500, x: 800, y: 350, dead: false };
    }
}

function checkDungeonProgress() {
    let aliveEnemies = enemies.filter(e => !e.dead).length;
    if (aliveEnemies === 0 && (!boss || boss.dead)) {
        dungeonWave++; spawnWave();
    }
}
// enemy logic
function handleEnemyAttacks() {
    let dwellers = Object.values(players).filter(p => p.area === "dungeon" && !p.dead);
    if (dwellers.length === 0) return;
    
    enemies.forEach(e => {
        if (e.dead) return;
        let target = dwellers[Math.floor(Math.random() * dwellers.length)];
        
        // Use the new function!
        applyDamage(target, 5); 
    });
}
/*------------------------------------------------------------*/

//=========================================================================
/* ======================== DRAWING ======================================= */

// ---PROJECTILES ----
/*-------- Arrows ------------------------------*/
const arrows = [];
function spawnArrow(startX, startY, endX, endY) {
    arrows.push({ x: startX, y: startY, tx: endX, ty: endY, life: 30 });
}
function updateArrows(ctx) {
    for (let i = arrows.length - 1; i >= 0; i--) {
        let a = arrows[i];
        // Move towards target
        a.x += (a.tx - a.x) * 0.15;
        a.y += (a.ty - a.y) * 0.15;
        
        ctx.strokeStyle = `rgba(255, 255, 255, ${a.life / 30})`; // Fade out
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(a.x + (a.tx > a.x ? 15 : -15), a.y); // Pointing direction
        ctx.stroke();

        a.life--;
        if (a.life <= 0) arrows.splice(i, 1);
    }
}
/*----------------------------------------------*/

// stickmen physics
function updatePhysics(p) {
    // Vertical Fall (Dungeon Entrance)
    if (p.targetY !== undefined && p.y < p.targetY) {
        p.y += 10; 
        if (p.y >= p.targetY) { p.y = p.targetY; delete p.targetY; }
    }

    // Horizontal Walk (Attacking/Moving)
    if (p.targetX !== null && p.targetX !== undefined) {
        let dx = p.targetX - p.x;
        if (Math.abs(dx) > 5) {
            p.x += dx * 0.1; // Smooth slide toward target
            // Cheeky "Leaning" effect while running
            p.lean = dx > 0 ? 0.2 : -0.2;
        } else {
            p.lean = 0;
            // If they were running to attack but target is gone, return to idle
            if (p.activeTask !== "attacking") p.targetX = null;
        }
    }
}

// ==============================================
// =-===--===-- DRRAW STICKMEN ---===---===---===-=
// ----------------------------------------------
/* Draw Equipment functions */
// --- 1. HAIR & HOODS (Head Layers) ---

// 1. The Hair Coordinator
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
function drawCapeItem(ctx, p, anchors, item) {

    const headX = anchors.headX;

    const centerX = p.x + (anchors.lean * 10);
    ctx.fillStyle = item.color || "#550055";
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
/* function getAnimationState(p, now) {
    let anim = { bodyY: 0, armMove: 0, lean: p.lean || 0, pose: null };
    if (p.activeTask === "dancing" && DANCE_LIBRARY[p.danceStyle]) {
        anim = { ...anim, ...DANCE_LIBRARY[p.danceStyle](now, p) };
    }
    return anim;
} */
// --- 1. Update Animation State to handle Swimming Y-offset ---
function getAnimationState(p, now) {
    let anim = { bodyY: 0, armMove: 0, lean: p.lean || 0, pose: null };
    
    // Sink the character if they are in the water at the pond
    if (p.activeTask === "swimming" && p.area === "pond" && p.x > 250) {
        anim.bodyY = 50; // Lower the whole body by 15 pixels
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

/* function getLimbPositions(p, anchors, anim, now) {
    const isFishing = p.activeTask === "fishing";
    const isAction = ["attacking", "woodcutting", "mining", "swimming", "lurking"].includes(p.activeTask);
    let leftHand = { x: anchors.headX - 18, y: anchors.shoulderY + 10 + anim.armMove };
    let rightHand = { x: anchors.headX + 18, y: anchors.shoulderY + 10 - anim.armMove };

    let activePose = anim.pose || p.forcedPose || (isFishing ? "fishing" : (isAction ? "action" : null));
    if (activePose && POSE_LIBRARY[activePose]) {
        const overrides = POSE_LIBRARY[activePose]({ x: anchors.headX, y: anchors.headY }, p, anim);
        if (overrides.left) leftHand = overrides.left;
        if (overrides.right) rightHand = overrides.right;
    }

    const walk = (p.targetX !== null) ? Math.sin(now / 100) * 10 : 0;
    const legSpread = (activePose === "star") ? 18 : 10;
    const footY = p.y + 25 + (anchors.bodyY > 0 ? 0 : anchors.bodyY);

    return {
        leftHand, rightHand,
        leftFoot: { x: p.x - legSpread - walk, y: footY },
        rightFoot: { x: p.x + legSpread + walk, y: footY }
    };
}
 */
function getLimbPositions(p, anchors, anim, now) {
    // Explicitly check for swimming first so it doesn't default to "action"
    let activePose = anim.pose || p.forcedPose;
    
    if (!activePose) {
        if (p.activeTask === "swimming") activePose = "swimming";
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
    updatePhysics(p); 
    const now = Date.now();
    if (p.dead) return drawCorpse(ctx, p, now);

    const anim = getAnimationState(p, now);
    const anchors = getAnchorPoints(p, anim);
    const limbs = getLimbPositions(p, anchors, anim, now);

    if (p.stats.equippedCape) drawCapeItem(ctx, p, anchors, ITEM_DB[p.stats.equippedCape]);
    drawStickmanBody(ctx, p, anchors, limbs);
    renderEquipmentLayer(ctx, p, now, anchors, limbs.leftHand, limbs.rightHand, limbs.leftFoot, limbs.rightFoot);
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
const backgrounds = {
    home: "#1a1a2e",
    dungeon: "#160a0a",
    pond: "#0a1612"
};
function drawScenery(ctx) {
    const now = Date.now();

    if (viewArea === "home") {
        // --- CHILL HOME VIBES ---
        // Draw a simple Floor/Ground
        ctx.fillStyle = "#252545";
        ctx.fillRect(0, 475, c.width, 125);

        // Draw some "Stars" or "Dust" in the air
        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        for(let i=0; i<10; i++) {
            let x = (i * 100 + (now/50)) % c.width;
            ctx.fillRect(x, 100 + (i*20), 2, 2);
        }

    } else if (viewArea === "pond") {
        // --- LAKE / WATER VIBES ---
        // The Shore
        ctx.fillStyle = "#1a2e1a";
        ctx.fillRect(0, 475, 250, 125); // Land on the left

        // The Water
        ctx.fillStyle = "#0a2e3a";
        ctx.fillRect(250, 485, c.width - 250, 115);

        // Water Ripples
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.lineWidth = 2;
        for(let i=0; i<5; i++) {
            let rx = 300 + (i * 120);
            let ry = 520 + (Math.sin(now/500 + i) * 10);
            ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx + 40, ry); ctx.stroke();
        }
		drawBuyer(ctx);
    } else if (viewArea === "dungeon") {
        // --- GRITTY DUNGEON VIBES ---
        // Floor
        ctx.fillStyle = "#110505";
        ctx.fillRect(0, 475, c.width, 125);

        // Cracks in the wall/back
        ctx.strokeStyle = "#2a1010";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(100, 0); ctx.lineTo(120, 100); ctx.lineTo(80, 200);
        ctx.moveTo(600, 0); ctx.lineTo(580, 150); ctx.lineTo(620, 300);
        ctx.stroke();

        // Spikes/Pillars
        ctx.fillStyle = "#1d0a0a";
        ctx.beginPath(); ctx.moveTo(200, 475); ctx.lineTo(225, 300); ctx.lineTo(250, 475); ctx.fill();
    }
	
}
//================================================================================

//================================================================================
//-----=======------=======---GAME LOOP STUFF--=======-----========----
function updatePlayerStatus(p, now) {
    if (p.activeTask && p.taskEndTime && now > p.taskEndTime) {
        systemMessage(`${p.name} stopped ${p.activeTask} (Idle timeout).`);
        p.activeTask = null;
        p.targetX = null;
        p.danceStyle = 0;
    }
}

function updatePlayerMovement(p) {
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
}
function handleDancing(p, now) {
    if (!p.lastDanceXP) p.lastDanceXP = 0;
    
    if (now - p.lastDanceXP > 5000) {
        let xpGain = 5 + (p.danceStyle * 2); 
        p.stats.danceXP += xpGain;
        p.lastDanceXP = now;

        let nextLevelXP = p.stats.danceLevel * 100;
        if (p.stats.danceXP >= nextLevelXP) {
            p.stats.danceLevel++;
            p.stats.danceXP = 0;
            spawnFloater(`DANCE LEVEL ${p.stats.danceLevel}!`, p.x, p.y - 40, "#ff00ff", p.area);
            
            // Notification for unlocks
            if (p.stats.danceLevel === 5) systemMessage(`${p.name} unlocked Dance Style 2: The Flail!`);
            if (p.stats.danceLevel === 10) systemMessage(`${p.name} unlocked Dance Style 3: The Lean!`);
            if (p.stats.danceLevel === 20) systemMessage(`${p.name} unlocked Dance Style 4: The Op-Pa!`);
            
            saveStats(p);
        }
    }
}

function updatePlayerActions(p, now) {
    if (p.dead) return;

    // Handle Dancing
    if (p.activeTask === "dancing") {
        handleDancing(p, now);
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
}


// This wrapper function just organizes the "Background" layer
function renderScene() {
    // 1. Draw the base sky/wall color
    ctx.fillStyle = backgrounds[viewArea];
    ctx.fillRect(0, 0, c.width, c.height);

    // 2. Draw the specific props you wrote (Floor, Ripples, Cracks)
    drawScenery(ctx);
}


/* ================= GAME LOOP ================= */
/* ================= GAME LOOP ================= */
//--GAME LOOP HELPERS
const systemTimers = {
    lastGlobalTick: Date.now(),
    lastEnemyTick: Date.now(),
    globalInterval: 3000, // 3 seconds (Fishing, etc.)
    enemyInterval: 4000   // 4 seconds (Enemy Attacks)
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
	updateBuyerNPC();
}
function updateUI() {
    // 2. Enemy UI Updates
    let enemyText = "";
    if (viewArea === "dungeon") {
        // We look at the global 'enemies' array and 'boss' object
        enemies.forEach(e => { 
            if(!e.dead) enemyText += `Enemy: ${e.hp}hp<br>`; 
        });
        
        if (boss && !boss.dead) {
            enemyText += `<b>BOSS: ${boss.hp}hp</b>`;
        }
    }
    
    // Update the HTML element on your page
    const uiElement = document.getElementById("enemyUI");
    if (uiElement) {
        uiElement.innerHTML = enemyText;
    }
}
/* ================= GAME LOOP ================= */
function gameLoop() {
    const now = Date.now();
    
    // 1. Rendering (The Visuals)
    renderScene();
    
    // 2. Interface (The Text/UI)
    updateUI();

    // 3. Entity Logic (The Players)
    Object.values(players).forEach(p => {
        updatePlayerStatus(p, now); // Handles timeouts & stats
        updatePlayerMovement(p);   // Handles walking/leaning
        updatePlayerActions(p, now); // Handles dancing/attacking
        drawStickman(ctx, p);
    });

    // 4. World Systems (The Timers)
    updateSystemTicks(now);
    updateArrows(ctx);
	updateSplashText(ctx);
    handleTooltips();
    requestAnimationFrame(gameLoop);
}
/* ================= GAME LOOP ================= */
/* ================= GAME LOOP ================= */
/* ================= GAME LOOP ================= */


/* ======================================================= */
/* ================= CHAT COMMAND SYSTEM ================= */
/* --- Handle Chat Commands ---*/
function handleChatCommand(input) {
    if (!input.startsWith("!")) return;

    const args = input.slice(1).split(" "); // Remove "!" and split
    const command = args[0].toLowerCase();
    const targetItem = args.slice(1).join(" "); // Rejoin the rest for names with spaces

    if (command === "add" || command === "give") {
        // For this example, we'll give it to the first player found 
        // or a specific 'currentPlayer' variable if you have one.
        const firstPlayer = Object.keys(players)[0]; 
        addItemToPlayer(firstPlayer, targetItem);
    }
}
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
    let msg = `Your Dance Lvl: ${lvl}. Available Dances: [1] The Squat (Lvl 1) `;
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

function cmdHeal(p, args) {
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
}
//auto unequip version of fish cmd
function cmdFish(p, user) {
    if (p.area !== "pond") { 
        systemMessage(`${user}: Go to pond first.`); 
        return; 
    }
    if (p.activeTask === "fishing") { 
        systemMessage(`${user}: Already fishing.`); 
        return; 
    }

    // REMEMBER AND UNEQUIP
    if (p.stats.equippedWeapon) {
        p.stats.lastWeapon = p.stats.equippedWeapon; // Store it!
        p.stats.equippedWeapon = null;
        systemMessage(`${p.name} put away their ${p.stats.lastWeapon} to fish.`);
    }

    p.targetX = 200; 
    p.activeTask = "fishing";
    p.taskEndTime = Date.now() + (15 * 60 * 1000);
    
    systemMessage(`${user} started fishing!`);
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
    p.targetX = 350 + (Math.random() * 150);
	
    p.activeTask = "swimming";
    p.taskEndTime = Date.now() + (15 * 60 * 1000); // 15 mins

    systemMessage(`${p.name} jumped into the water!`);
    saveStats(p);
}
function cmdEquip(p, args) {
    // 1. BLOCK EQUIPPING DURING TASKS
    // Checks if the player is busy doing something (fishing, mining, attacking, etc.)
    if (p.activeTask && p.activeTask !== "none") {
        systemMessage(`${p.name}: You are too busy ${p.activeTask} to change gear right now! Stop what you are doing first.`);
        return;
    }

    let inputName = args.slice(1).join(" ").toLowerCase();
    let invItem = p.stats.inventory.find(i => i.toLowerCase() === inputName);
    
    if (!invItem) {
        systemMessage(`${p.name}: You don't have "${args.slice(1).join(" ")}".`);
        return;
    }

    let dbKey = Object.keys(ITEM_DB).find(k => k.toLowerCase() === invItem.toLowerCase());
    let itemData = ITEM_DB[dbKey];
    const type = itemData.type;

    // 2. BLOCK TOOLS: Tools are used automatically by tasks, not equipped
    if (type === "tool" || type === "fishing_rod" || type === "pickaxe" || type === "axe") {
        systemMessage(`${p.name}: You don't need to equip tools. Just start the task!`);
        return;
    }

    let msg = "";

    // 3. EQUIP LOGIC
    if (type === "weapon" || type === "staff" || type === "bow") {
        p.stats.equippedWeapon = dbKey;
        msg = `slung the ${dbKey} over their shoulder`;
    } else if (type === "armor") {
        p.stats.equippedArmor = dbKey;
        msg = `put on the ${dbKey}`;
    } else if (type === "helmet" || type === "hood" || type === "hair" || type === "viking" || type === "wizard" || type === "crown") {
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
    const target = args[1] ? args[1].toLowerCase() : "all";
    let found = false;

    const slots = {
        weapon: "equippedWeapon",
        staff: "equippedWeapon",
        armor: "equippedArmor",
        helmet: "equippedHelmet",
        hood: "equippedHelmet",
        boots: "equippedBoots",
        pants: "equippedPants",
        cape: "equippedCape",
        gloves: "equippedGloves",
        hair: "equippedHair"
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
        systemMessage(`${p.name}: Invalid slot. (weapon/armor/helmet/boots/pants/cape/gloves/hair/all)`);
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
function cmdSell(p, args) {
    if (p.stats.inventory.length === 0) {
        systemMessage(`${p.name}: Your inventory is empty.`);
        return;
    }

    let target = args.slice(1).join(" ").toLowerCase();
    let totalGold = 0;
    let itemsRemoved = 0;
    
    // Update the Buyer status before calculating
    updateBuyerNPC(); 
    let multiplier = buyerActive ? 2 : 1;

    if (target === "fish") {
        p.stats.inventory = p.stats.inventory.filter(item => {
            // 1. Handle Regular weight-based fish (e.g., "10.5kg Bass")
            if (item.toLowerCase().includes("kg")) {
                let weightStr = item.split("kg")[0].replace(/[^0-9.]/g, '');
                let weight = parseFloat(weightStr);
                
                if (!isNaN(weight)) {
                    // 1 gold per kg * multiplier
                    totalGold += Math.floor(weight * 1 * multiplier);
                    itemsRemoved++;
                    return false; // Remove from inventory
                }
            }
            
            // 2. Handle Golden Bass specifically within the fish command
            if (item === "Golden Bass") {
                let baseValue = ITEM_DB["Golden Bass"]?.value || 100;
                // We apply the multiplier here too since the Merchant loves rare fish!
                totalGold += (baseValue * multiplier);
                itemsRemoved++;
                return false; // Remove from inventory
            }

            return true; // Keep everything else (weapons, etc)
        });
    } else {
        // Handle selling a specific single item by name
        let index = p.stats.inventory.findIndex(i => i.toLowerCase() === target);
        if (index !== -1) {
            let itemName = p.stats.inventory[index];
            let itemData = ITEM_DB[itemName];
            
            let price = itemData?.value || 50;
            
            // If selling Golden Bass by name while Merchant is active, give bonus
            if (itemName === "Golden Bass") {
                totalGold = price * multiplier;
            } else {
                totalGold = price;
            }

            p.stats.inventory.splice(index, 1);
            itemsRemoved = 1;
        }
    }

    if (itemsRemoved > 0) {
        // Final sanity check to prevent NaN from corrupting the save
        if (isNaN(totalGold)) totalGold = 0;
        
        p.stats.gold = (p.stats.gold || 0) + totalGold;
        
        let msg = `${p.name} sold ${itemsRemoved} item(s) for ${totalGold.toFixed(2)} gold!`;
        
        // Add a special flair message if they sold to the Merchant
        if (buyerActive) {
            msg += " 💰 [MERCHANT SPECIAL RATE]";
        }
        
        systemMessage(msg);
        saveStats(p);
    } else {
        systemMessage(`${p.name}: Could not find "${target}" to sell. Try "!sell fish".`);
    }
}

function cmdBalance(p) {
    // Formatting gold to 2 decimal places as requested
    const displayGold = (p.stats.gold || 0).toFixed(2);
    
    // Using your specific prison wallet phrasing
    systemMessage(`${p.name} has ${displayGold} coins stuffed in their prison wallet`);
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
    { command: "bal", description: "Check your gold balance.", usage: "bal" },
    { command: "equip", description: "Equip an item from inventory.", usage: "equip [item name]" }
];
const STICKMEN_ADMIN_CMDS = [
    { command: "showfishing", description: "Switch view to Fishing Pond.", usage: "showfishing" },
    { command: "spawnmerchant", description: "Force the merchant to appear.", usage: "spawnmerchant" },
    { command: "testdance", description: "Test an animation regardless of level.", usage: "testdance [style#]" }
];
//ComfyJS.onChat = (user, msg, color, flags, extra) => {
//function stickmenCommandHandler(user, msg, command, color, flags, extra) {//
//    console.log("UserColor:", extra.userColor, "User:", user, "Message:", message);//
//    console.log("Emotes:", extra.messageEmotes); // Debugging: Check if emotes are detected//
//    displayChatMessage(user, message, flags, extra);  // Show message in chat box//
ComfyJS.onChat = (user, msg, color, flags, extra) => {
//	console.log( "User:", user, "command:", command,);
//	displayConsoleMessage(user, `!${command}`);
    // Store user color from extra	
    if (!userColors[user]) {
        userColors[user] = extra.userColor || "orangered"; // Default to white if no color is provided
    }

    let p = getPlayer(user, extra.userColor);
    let args = msg.split(" ");
	//const cmd = args.shift().toLowerCase();//
    let cmd = args[0].toLowerCase();
	if (cmd === "stop" || cmd === "idle" || cmd === "!reset") {
			cmdStop(p, user);
		}
    // Combat & Tasks//
    if (cmd === "attack") cmdAttack(p, user);
    if (cmd === "fish")   cmdFish(p, user);
	if (cmd === "swim") cmdSwim(p, user);
    if (cmd === "heal")   cmdHeal(p, args);
    if (cmd === "pose" || cmd === "setpose") {
        cmdSetPose(p, user, args);
    }
    // Movement//
    if (cmd === "travel")  movePlayer(p, args[1]);
    if (cmd === "home")    movePlayer(p, "home");
    if (cmd === "dungeon") movePlayer(p, "dungeon");
    if (cmd === "join")    joinDungeonQueue(p);
    if (cmd === "dance") {cmdDance(p, user, args);}
	if (cmd === "listdances") {cmdListDances(p);}
    // Stats & Inventory//
    if (cmd === "stats")    cmdShowStats(user, args);
    if (cmd === "topstats") cmdTopStats();
	if (cmd === "equip") cmdEquip(p, args);
	if (cmd === "sheath") cmdSheath(p, args);
	if (cmd === "unequip") cmdUnequip(p, args);
    if (cmd === "inventory") cmdInventory(p, user, args);
	if (cmd === "sell") cmdSell(p, args);
	if (cmd === "bal" || cmd === "wallet" || cmd === "money") {cmdBalance(p);}
	//special//
	if (cmd === "wigcolor") { cmdWigColor(p, args); }
    // Status//
    if (cmd === "mingle") cmdMingle(p, user, args);
    if (cmd === "respawn" && p.dead) { 
        p.dead = false; p.hp = p.maxHp; 
        systemMessage(`${p.name} returned to life!`); 
    }

/*     // Admin Controls//
    if (flags.broadcaster || flags.mod) {
        if (cmd === "showhome") { viewArea = "home"; document.getElementById("areaDisplay").textContent = "StickmenFallv2.1.9 - VIEWING: HOME"; }
        if (cmd === "showdungeon") { viewArea = "dungeon"; document.getElementById("areaDisplay").textContent = "StickmenFallv2.1.9 - VIEWING: DUNGEON"; }
        if (cmd === "showfishing") { viewArea = "pond"; document.getElementById("areaDisplay").textContent = "StickmenFallv2.1.9 - VIEWING: FISHING POND"; }
		// --- Manual Merchant Controls ---//
		if (cmd === "spawnmerchant") {forceBuyer = true;updateBuyerNPC();systemMessage("[ADMIN] Merchant forced to spawn.");}
		if (cmd === "despawnmerchant") {forceBuyer = false;updateBuyerNPC();systemMessage("[ADMIN] Merchant forced to leave.");}
		// reset puts him back on the 7-minute automatic timer//
		if (cmd === "resetmerchant") {forceBuyer = null; updateBuyerNPC();systemMessage("[ADMIN] Merchant returned to automatic schedule.");}
		if (cmd === "testdance") {cmdTestDance(p, user, args.slice(1), flags);}
    } */
// Admin & Streamer Controls
    // We check if the command exists first, then verify authorization
    const adminCommands = ["showhome", "showdungeon", "showpond", "spawnmerchant", "despawnmerchant", "resetmerchant", "give", "additem"];
    
    if (adminCommands.includes(cmd)) {
        if (!isStreamerAndAuthorize(user, cmd)) return;
		// Inside the Admin Controls section of your router:
		if (cmd === "give" || cmd === "additem") {
			cmdGive(user, args, flags);
		}
        if (cmd === "showhome") { 
            viewArea = "home"; 
            document.getElementById("areaDisplay").textContent = "StickmenFallv2.1.9 - VIEWING: HOME"; 
        }
        if (cmd === "showdungeon") { 
            viewArea = "dungeon"; 
            document.getElementById("areaDisplay").textContent = "StickmenFallv2.1.9 - VIEWING: DUNGEON"; 
        }
        if (cmd === "showpond") { 
            viewArea = "pond"; 
            document.getElementById("areaDisplay").textContent = "StickmenFallv2.1.9 - VIEWING: FISHING POND"; 
        }
        
        // --- Manual Merchant Controls ---
        if (cmd === "spawnmerchant") {
            forceBuyer = true;
            updateBuyerNPC();
            systemMessage("[ADMIN] Merchant forced to spawn.");
        }
        if (cmd === "despawnmerchant") {
            forceBuyer = false;
            updateBuyerNPC();
            systemMessage("[ADMIN] Merchant forced to leave.");
        }
        if (cmd === "resetmerchant") {
            forceBuyer = null; 
            updateBuyerNPC();
            systemMessage("[ADMIN] Merchant returned to automatic schedule.");
        }
        if (cmd === "testdance") {
            forceBuyer = null; 
             cmdTestDance(p, user, args.slice(1), flags);
            systemMessage("[ADMIN] testing a dance.");
        }
    }

    // Special case for testdance (often allowed for mods too)
    if (cmd === "testdance") {
        if (flags.broadcaster || flags.mod) {
            cmdTestDance(p, user, args.slice(1), flags);
        }
    }
};

// REGISTER the command metadata//
/* registerPluginCommands(STICKMEN_USER_CMDS, false);
registerPluginCommands(STICKMEN_ADMIN_CMDS, true); */
// REGISTER the game with the comfychat.js//
//registerChatPlugin(stickmenCommandHandler);



gameLoop();

