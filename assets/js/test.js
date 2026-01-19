
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
function idleActionMsg(playerName, text, color = "#0f0") {
    const box = document.getElementById("idleActionsBox");
    if (!box) return;

    const entry = document.createElement("div");
    entry.style.marginBottom = "3px";
    entry.style.borderLeft = `3px solid ${color}`; // Color is used for the line
    entry.style.paddingLeft = "8px";
    entry.style.fontFamily = "monospace";
    
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    // The color variable is only used inside the style attribute here
    entry.innerHTML = `
        <span style="color: #666; font-size: 11px;">[${time}]</span> 
        <strong style="color: ${color};">${playerName}:</strong> 
        <span style="color: #bbb;">${text}</span>
    `;

    box.appendChild(entry);
    box.scrollTop = box.scrollHeight;

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
		archerLevel: 1, archerXP: 0,
		magicLevel: 1, magicXP: 0,
        healLevel: 1, healXP: 0,
        fishLevel: 1, fishXP: 0,
        danceLevel: 1, danceXP: 0,
		lurkLevel: 1, lurkXP: 0,
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
	// Inside the initial stats object and the safety checks
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
        p.x = Math.random() * 200 + 75; 
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
    // Get the highest offensive skill
    const highOffense = Math.max(s.attackLevel, s.archerLevel, s.magicLevel);
    
    // Combat Level = (HighSkill + Heal + Lurk + Fish/2) / 2
    // This rewards specialized builds and high-utility players
    p.stats.combatLevel = Math.floor((highOffense + s.healLevel + s.lurkLevel + (s.fishLevel * 0.5)) / 2);
}

function applyDamage(target, amount, color = "#f00") {
    if (target.dead) return;

    // --- EVASION CHECK ---
    // If the target is a player with a lurkLevel, give them a chance to dodge
    if (target.stats && target.stats.lurkLevel) {
        // 5% base + 1% per lurk level (capped at 50%)
        let dodgeChance = Math.min(0.50, 0.05 + (target.stats.lurkLevel * 0.01));
        if (Math.random() < dodgeChance) {
            spawnFloater(target, "MISS", "#fff");
            // Give a tiny bit of Lurk XP for successful dodging
            target.stats.lurkXP += 5;
            if (target.stats.lurkXP >= xpNeeded(target.stats.lurkLevel)) {
                target.stats.lurkLevel++;
                target.stats.lurkXP = 0;
                spawnFloater(target, "LURK UP!", "#FFD700");
                updateCombatLevel(target);
            }
            return; // Exit function, no damage taken
        }
    }

    target.hp -= amount;
    spawnFloater(target, `-${amount}`, color);

    if (target.hp <= 0) {
        target.hp = 0;
        target.dead = true;
        target.activeTask = "none";
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

    // 3. Optional: Reset gold if you want a total wipe
    // p.stats.gold = 0;

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

    if (!target || target.dead) return;

    // 2. Weapon & Skill Type Check
    const weapon = ITEM_DB[p.stats.equippedWeapon] || { power: 0, type: "melee" };
    
    let skillType = "attack"; // Default Melee
    if (weapon.type === "bow") skillType = "archer";
    if (weapon.type === "staff") skillType = "magic";

    const isRanged = (skillType !== "attack");
    const rangeNeeded = isRanged ? 250 : 60;
    p.targetX = target.x - (isRanged ? 180 : 40);

    // 3. Execution
    if (Math.abs(p.x - target.x) <= rangeNeeded) {
        // Calculate Defense
        let targetDef = 0;
        let gearSource = target.stats || target.equipped; 
        if (gearSource) {
             const slots = target.stats ? ["equippedHelmet", "equippedArmor", "equippedPants", "equippedBoots"] : ["helmet", "armor", "pants", "boots"];
             slots.forEach(s => {
                 let item = ITEM_DB[target.stats ? target.stats[s] : target.equipped[s]];
                 if (item) targetDef += (item.def || 0);
             });
        }

        // Damage calculation using the specific skill level
        let skillLvl = p.stats[skillType + "Level"];
        let baseDmg = 5 + (skillLvl * 2) + (weapon.power || 0);
        let actualDmg = Math.max(1, baseDmg - targetDef);

        if (weapon.type === "bow") spawnArrow(p.x, p.y - 10, target.x, target.y);
        
        applyDamage(target, actualDmg);
		// CHECK FOR DEATH & LOOT
        if (target.hp <= 0) { // If they just died from that hit
			// Only drop loot if they weren't already marked as 'looted'
			if ((target.isEnemy || target.isBoss) && !target.looted) {
				target.looted = true; // Prevent double-looting
				handleLoot(p, target);
				systemMessage(`${p.name} defeated ${target.name}!`);
			}
		}
        // 4. Award XP to the correct skill
        p.stats[skillType + "XP"] += 10;
        if (p.stats[skillType + "XP"] >= xpNeeded(p.stats[skillType + "Level"])) {
            p.stats[skillType + "Level"]++;
            p.stats[skillType + "XP"] = 0;
            spawnFloater(p, `${skillType.toUpperCase()} UP!`, "#FFD700");
        }

        updateCombatLevel(p);
        saveStats(p);
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


// idle actions
//xp gained by action skills
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

    // Updated clean call
    spawnFloater(p, displayMsg, floaterColor);

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
    }
    updateCombatLevel(p);
    saveStats(p);
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
            
            saveStats(p);
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
            saveStats(p);
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
                document.getElementById("areaDisplay").textContent = "StickmenFall: DUNGEON (Pixel8ing)";
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
    document.getElementById("areaDisplay").textContent = "StickmenFall: DUNGEON (ACTIVE)";

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
    // Every 5th wave is a Boss Wave
    const isBossWave = (dungeonWave % 5 === 0);
    const waveSize = isBossWave ? 2 : 3; // Fewer minions if there is a boss

    const types = ["Slime", "StickmanHunter", "Grumble", "VoidWalker"];

    for (let i = 0; i < waveSize; i++) {
        let type = types[Math.floor(Math.random() * types.length)];
        let isStickman = (type === "StickmanHunter" || type === "VoidWalker");
        
        // Balanced HP scaling: 50 + (25 per wave)
        let enemyHp = 50 + (dungeonWave * 25);

        enemies.push({ 
            name: type, 
            area: "dungeon",
            hp: enemyHp, 
            maxHp: enemyHp, 
            x: 500 + (i * 100), 
            y: 450, 
            dead: false,
            isEnemy: true,
            isStickman: isStickman,
            stats: { lurkLevel: 0 },
            equipped: isStickman ? generateRandomLoadout() : {} 
        });
    }

    // SPAWN BOSS
    if (isBossWave) {
        boss = {
            name: "DUNGEON OVERLORD",
            area: "dungeon",
            hp: 500 + (dungeonWave * 50),
            maxHp: 500 + (dungeonWave * 50),
            x: 800,
            y: 450,
            dead: false,
            isBoss: true,
            isMonster: true, // Uses drawMonster
            color: "#ff0000"
        };
        systemMessage("⚠️ A BOSS HAS APPEARED!");
    } else {
        boss = null;
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
    
    // Include the boss in the attack loop
    let allAttackers = [...enemies];
    if (boss && !boss.dead) allAttackers.push(boss);

    allAttackers.forEach(e => {
        if (e.dead) return;
        let target = dwellers[Math.floor(Math.random() * dwellers.length)];
        
        // NEW BALANCED DAMAGE: Base 3 + 1 per wave
        let dmg = 3 + Math.floor(dungeonWave * 1.2); 
        if (e.isBoss) dmg *= 2; // Boss hits harder
        
        applyDamage(target, dmg); 
    });
}
/*------------------------------------------------------------*/
function generateRandomLoadout() {
    // Helper to get random item by type from your ITEM_DB
    const getItemsByType = (type) => Object.keys(ITEM_DB).filter(key => ITEM_DB[key].type === type);

    const weaponPool = getItemsByType("sword").concat(getItemsByType("bow"), getItemsByType("staff"));
    const headPool = getItemsByType("helmet").concat(getItemsByType("hair"));
    const armorPool = getItemsByType("armor");
    const legPool = getItemsByType("pants");
    const glovePool = getItemsByType("gloves");

    return {
        weapon: weaponPool[Math.floor(Math.random() * weaponPool.length)],
        helmet: headPool[Math.floor(Math.random() * headPool.length)],
        // 70% chance to have these parts
        armor: Math.random() < 0.7 ? armorPool[Math.floor(Math.random() * armorPool.length)] : null,
        pants: Math.random() < 0.7 ? legPool[Math.floor(Math.random() * legPool.length)] : null,
        gloves: Math.random() < 0.5 ? glovePool[Math.floor(Math.random() * glovePool.length)] : null
    };
}
// Loot Helper to keep performAttack clean
function handleLoot(p, target) {
    let lootFound = [];
    let goldGained = 0;
    let roll = Math.random();

    // 1. Drop-the-Gear Logic (Check for valid items)
    if (target.equipped) {
        Object.values(target.equipped).forEach(itemName => {
            // itemName must exist and pass the 15% drop rate
            if (itemName && Math.random() < 0.15) {
                lootFound.push(itemName);
            }
        });
    }

    // 2. Boss/Minion Specifics
    if (target.isBoss) {
        goldGained = 500;
        lootFound.push("Royal Cape");
    } else {
        goldGained = 10;
        if (roll > 0.95) lootFound.push("Leather scrap");
    }

    // Apply Gold
    p.stats.gold += goldGained;

    // 3. Process the loot and show messages
    if (lootFound.length > 0) {
        lootFound.forEach(item => {
            // Final safety check: ensure item isn't null and exists in DB
            if (item && ITEM_DB[item]) {
                if (!p.stats.inventory.includes(item)) {
                    p.stats.inventory.push(item);
                    spawnFloater(p, `✨ ${item}!`, "#FFD700");
                    systemMessage(`${p.name} looted: ${item}`);
                }
            }
        });
    } else {
        // --- NEW FEEDBACK MESSAGE ---
        // If no items were found in the roll
        systemMessage(`${p.name}: That creature did not carry any loot.`);
        spawnFloater(p, "No loot", "#888");
    }
    
    saveStats(p);
}
//------------------------------------

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

	if (p.targetX !== null && p.targetX !== undefined) {
		let oldX = p.x;
		let dx = p.targetX - p.x;
		
		if (Math.abs(dx) > 5) {
			p.x += dx * 0.1;
			p.lean = dx > 0 ? 0.2 : -0.2;

			// --- SPLASH DETECTION ---
			// If we move from shore ( < 250) to water ( > 250)
			if (oldX <= 250 && p.x > 250 && p.area === "pond") {
				triggerSplash(p);
			}
			// If we move from water back to shore
			if (oldX > 250 && p.x <= 250 && p.area === "pond") {
				triggerSplash(p);
			}

		} else {
			p.lean = 0;
			if (p.activeTask !== "attacking") p.targetX = null;
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
    updatePhysics(p); 
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
    if (p.stats.equippedCape) drawCapeItem(ctx, p, anchors, ITEM_DB[p.stats.equippedCape]);
    drawStickmanBody(ctx, p, anchors, limbs);
    renderEquipmentLayer(ctx, p, now, anchors, limbs.leftHand, limbs.rightHand, limbs.leftFoot, limbs.rightFoot);

    ctx.restore(); // Stop being transparent for the next player or background
}

function drawEnemyStickman(ctx, e) {
    if (e.area !== viewArea || e.dead) return;
    const now = Date.now();

    // Setup positions
    const anim = { bodyY: Math.sin(now / 200) * 2, armMove: 0, lean: -0.2 }; 
    const anchors = getAnchorPoints(e, anim); 
    const limbs = getLimbPositions(e, anchors, anim, now);

    ctx.save();
    
    // Flip Logic: Mirror the enemy so they face the players
    ctx.translate(e.x, 0); 
    ctx.scale(-1, 1); 
    ctx.translate(-e.x, 0); 

    // Enemy Style
    ctx.strokeStyle = (e.name === "VoidWalker") ? "#a020f0" : "#ff4444"; 
    ctx.lineWidth = 3;

    // 1. Draw the base stickman body
    drawStickmanBody(ctx, e, anchors, limbs);

    // 2. Draw Equipment Layers
    if (e.equipped) {
        // Pants (Drawn first so they are "under" the armor)
        if (e.equipped.pants) {
            drawEnemyPants(ctx, e, anchors, limbs.leftFoot, limbs.rightFoot, ITEM_DB[e.equipped.pants]);
        }

        // Armor
        if (e.equipped.armor) {
            drawEnemyArmor(ctx, e, anchors, ITEM_DB[e.equipped.armor]);
        }

        // Headgear (Helmet or Hair)
        if (e.equipped.helmet) {
            drawEnemyHeadgear(ctx, e, anchors, ITEM_DB[e.equipped.helmet]);
        }

        // Gloves
        if (e.equipped.gloves) {
            drawGlovesItem(ctx, limbs.leftHand.x, limbs.leftHand.y, ITEM_DB[e.equipped.gloves]);
            drawGlovesItem(ctx, limbs.rightHand.x, limbs.rightHand.y, ITEM_DB[e.equipped.gloves]);
        }
        
        // Weapon (Handled by your existing WEAPON_STYLES)
        if (e.equipped.weapon) {
            let weapon = ITEM_DB[e.equipped.weapon];
            ctx.save();
            ctx.translate(limbs.rightHand.x, limbs.rightHand.y);
            const drawFn = WEAPON_STYLES[weapon.style || weapon.type] || WEAPON_STYLES["sword"];
            drawFn(ctx, weapon, true, now, e, anchors.bodyY, anchors.lean);
            ctx.restore();
        }
    }

    ctx.restore(); 
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

    ctx.restore();
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
		spawnFloater(p, `stopped ${p.activeTask} (Idle timeout)`, "#ff4444");
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

function updatePlayerActions(p, now) {
    if (p.dead) return;
	if (p.activeTask === "lurking") {
		handleLurking(p, now);
	}
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
    let uiHTML = "";

    // --- 1. COUNTDOWN SECTION ---
    if (dungeonCountdownInterval && dungeonSecondsLeft > 0) {
        uiHTML += `
            <div style="background: rgba(0,0,0,0.7); padding: 10px; border: 2px solid #ffcc00; text-align: center; margin-bottom: 10px; border-radius: 5px;">
                <b style="color: #ffcc00; font-size: 16px;">DUNGEON STARTING IN: ${dungeonSecondsLeft}s</b><br>
                <small style="color: #fff;">Prepare your gear!</small>
            </div>`;
    }

    // --- 2. PLAYER STATUS SECTION (Visible in Dungeon) ---
    if (viewArea === "dungeon") {
        uiHTML += `<div style="background: rgba(0,0,0,0.5); padding: 5px; border: 1px solid #00ffff; margin-bottom: 10px;">`;
        uiHTML += `<b style="color: #00ffff;">PARTY STATUS:</b><br>`;
        Object.values(players).filter(p => p.area === "dungeon").forEach(p => {
            const hpPct = Math.floor((p.hp / p.maxHp) * 100);
            const color = p.dead ? "#ff0000" : (hpPct < 30 ? "#ffaa00" : "#00ff00");
            uiHTML += `<div style="font-size: 12px; color: ${color};">
                ${p.name}: ${p.hp}/${p.maxHp} HP [${hpPct}%] ${p.dead ? '💀' : ''}
            </div>`;
        });
        uiHTML += `</div>`;
    }

    // --- 3. ENEMY & BOSS SECTION ---
    if (viewArea === "dungeon" && dungeonActive) {
        uiHTML += `<div style="color: #ff4444; font-weight: bold; border-bottom: 1px solid #555; margin-bottom: 5px;">`;
        uiHTML += `RAID WAVE: ${dungeonWave} | TIER: ${Math.floor(dungeonWave/5) + 1}`;
        uiHTML += `</div>`;

        if (boss && !boss.dead) {
            const bPct = Math.floor((boss.hp / boss.maxHp) * 100);
            uiHTML += `<b style="color: gold;">BOSS: ${boss.hp} HP (${bPct}%)</b><br>`;
        }

        enemies.forEach(e => { 
            if(!e.dead) {
                const hpPercent = Math.floor((e.hp / e.maxHp) * 100);
                uiHTML += `<span style="color: #ddd;">${e.name}:</span> ${e.hp} HP (${hpPercent}%)<br>`; 
            }
        });
    }

    const uiElement = document.getElementById("enemyUI");
    if (uiElement) uiElement.innerHTML = uiHTML;
}
/* ================= GAME LOOP ================= */
function gameLoop() {
    const now = Date.now();
    
    // 1. Rendering (The Visuals - Background Layer)
    renderScene();
    
    // 2. Interface (The Text/UI)
    // This now shows the wave, difficulty, and enemy HP
    updateUI();
	
    // 3. Entity Logic & Progress (Calculations)
    if (dungeonActive) {
        // Checks if wave is cleared and handles Boss/Minion spawning
        checkDungeonProgress();
    }

    // 4. Draw Dungeon Entities (Mid-Layer)
    if (viewArea === "dungeon") {
        // Draw Boss first if alive
        if (boss && !boss.dead) {
            drawMonster(ctx, boss);
        }
        // Draw Minions
        enemies.forEach(e => {
            if (!e.dead) {
                if (e.isStickman) {
                    drawEnemyStickman(ctx, e);
                } else {
                    drawMonster(ctx, e);
                }
            }
        });
    }

    // 5. Player Logic & Drawing (Top-Layer)
    Object.values(players).forEach(p => {
        // Skip players in other areas
        if (p.area !== viewArea) return;

        updatePlayerStatus(p, now);   // Timeouts & idle logic
        updatePlayerMovement(p);     // Walking & physics
        updatePlayerActions(p, now); // Combat & loot triggers are inside here
        drawStickman(ctx, p);        // Visual rendering
    });

    // 6. World Systems (Effects & Timers)
    updateSystemTicks(now); // Handles enemy AI attacks and global intervals
    updateArrows(ctx);      // Renders projectiles
    updateSplashText(ctx);  // Renders "Level Up" and damage floaters
    handleTooltips();

    // 7. Next Frame
    requestAnimationFrame(gameLoop);
	refreshProfileUI();
}
/* ================= GAME LOOP ================= */
/* ================= GAME LOOP ================= */


/* ======================================================= */
/* ================= CHAT COMMAND SYSTEM ================= */
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
function cmdLurk(p, user) {
    if (p.dead) return;
    if (p.activeTask === "lurking") {
        systemMessage(`${user} is already lurking in the shadows...`);
        return;
    }

    p.activeTask = "lurking";
    p.taskEndTime = Date.now() + (15 * 60 * 1000); // 15 mins
    
    // Optional: Hide the weapon when lurking
    if (p.stats.equippedWeapon) {
        p.manualSheath = true; 
    }

    spawnFloater("vanished into shadows...", p.x, p.y - 60, "#555555", p.area, p.name);
    saveStats(p);
}
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
    p.targetX = 400 + (Math.random() * 250);
	
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


// --- 1. DATA PERSISTENCE ---
let profiles = JSON.parse(localStorage.getItem("allProfiles")) || [
    { name: "Player1", color: "#00ffff" },
    { name: "Jaedraze", color: "#6441a5" }
];
let activeProfileIndex = parseInt(localStorage.getItem("activeProfileIndex")) || 0;

// --- 2. UI REFERENCES ---
const chatInput = document.getElementById("browserChatInput");
const profileSelector = document.getElementById("profileSelector");
const colorPicker = document.getElementById("browserColorPicker");

// --- 3. CORE FUNCTIONS ---
function saveAllProfiles() {
    localStorage.setItem("allProfiles", JSON.stringify(profiles));
    localStorage.setItem("activeProfileIndex", activeProfileIndex);
}

function getActiveProfile() {
    return profiles[activeProfileIndex];
}

function refreshProfileUI() {
    if (!profileSelector) return;
    profileSelector.innerHTML = "";
    profiles.forEach((p, index) => {
        let opt = document.createElement("option");
        opt.value = index;
        opt.textContent = p.name;
        if (index === activeProfileIndex) opt.selected = true;
        profileSelector.appendChild(opt);
    });
    if (colorPicker) colorPicker.value = getActiveProfile().color;
}

function updateBrowserProfile(newName, newColor) {
    const current = getActiveProfile();
    
    if (newName) current.name = newName;
    if (newColor) {
        current.color = newColor;
        // UPDATE THE LIVE PLAYER COLOR
        if (players[current.name]) {
            players[current.name].color = newColor;
        }
    }
    
    saveAllProfiles();
    refreshProfileUI();
}
// Function to update profile via commands
function processGameCommand(user, msg, flags = {}, extra = {}) {
    let p = getPlayer(user, extra.userColor);
    let args = msg.split(" ");
    let cmd = args[0].toLowerCase();

    // --- ADMIN & SYSTEM COMMANDS ---
    const adminCommands = [
        "showhome", "showdungeon", "showpond", "spawnmerchant", 
        "despawnmerchant", "resetmerchant", "give", "additem", "scrub",
        "name", "/name", "color", "/color", "/newprofile"
    ];

    if (adminCommands.includes(cmd)) {
        let isAuthorized = flags.developer || isStreamerAndAuthorize(user, cmd);
        if (!isAuthorized) return;

        if (cmd === "/newprofile") {
            let newName = args[1];
            if (newName) {
                profiles.push({ name: newName, color: "#ffffff" });
                activeProfileIndex = profiles.length - 1;
                saveAllProfiles();
                refreshProfileUI();
                systemMessage(`Created profile: ${newName}`);
            }
            return;
        }

        if (cmd === "name" || cmd === "/name") {
            updateBrowserProfile(args[1], null);
            return;
        }

        if (cmd === "color" || cmd === "/color") {
            if (args[1] && args[1].startsWith("#")) {
                updateBrowserProfile(null, args[1]);
            }
            return;
        }

        // World Admin
        if (cmd === "scrub") { scrubAllInventories(); return; }
        if (cmd === "give" || cmd === "additem") {
            addItemToPlayer(args[1], args.slice(2).join(" "));
            return;
        }
        if (cmd === "showhome") { viewArea = "home"; document.getElementById("areaDisplay").textContent = "Home"; return; }
		if (cmd === "showpond") { viewArea = "pond"; document.getElementById("areaDisplay").textContent = "Pond"; return; }
        if (cmd === "showdungeon") { viewArea = "dungeon"; document.getElementById("areaDisplay").textContent = "Dungeon"; return; }
        
        // Merchant Admin
        if (cmd === "spawnmerchant") { forceBuyer = true; updateBuyerNPC(); return; }
        if (cmd === "despawnmerchant") { forceBuyer = false; updateBuyerNPC(); return; }
        if (cmd === "resetmerchant") { forceBuyer = null; updateBuyerNPC(); return; }
    }

    // --- STANDARD PLAYER COMMANDS ---
    if (cmd === "stop" || cmd === "idle" || cmd === "!reset") { cmdStop(p, user); return; }
    if (cmd === "attack") { cmdAttack(p, user); return; }
    if (cmd === "fish")   { cmdFish(p, user); return; }
    if (cmd === "swim")   { cmdSwim(p, user); return; }
    if (cmd === "heal")   { cmdHeal(p, args); return; }
	if (cmd === "lurk")   {cmdLurk(p, user); return; }
    if (cmd === "dance")  { cmdDance(p, user, args); return; }
	if (cmd === "mingle") { cmdMingle(p, user, args); return; }
    if (cmd === "pose" || cmd === "setpose") { cmdSetPose(p, user, args); return; }
	
    if (cmd === "travel") { movePlayer(p, args[1]); return; }
    if (cmd === "home")   { movePlayer(p, "home"); return; }
    if (cmd === "dungeon"){ movePlayer(p, "dungeon"); return; }
    if (cmd === "join")   { joinDungeonQueue(p); return; }
    if (cmd === "inventory") { cmdInventory(p, user, args); return; }
    if (cmd === "equip")     { cmdEquip(p, args); return; }
    if (cmd === "unequip")   { cmdUnequip(p, args); return; }
	if (cmd === "sheath") { cmdSheath(p, args); return; }
	if (cmd === "wigcolor") { cmdWigColor(p, args); return; }
    // Status//
    if (cmd === "sell")      { cmdSell(p, args); return; }
    if (cmd === "bal" || cmd === "money") { cmdBalance(p); return; }
	if (cmd === "stats")    { cmdShowStats(user, args); return; };
    if (cmd === "topstats") { cmdTopStats();  return; }
	if (cmd === "clear" || cmd === "!clear") { clearPlayerInventory(p.name); return; }
    if (cmd === "respawn" && p.dead) { p.dead = false; p.hp = p.maxHp; systemMessage(`${p.name} returned to life!`);return; }
}
//ComfyJS.onChat = (user, msg, color, flags, extra) => {
// Twitch Input
ComfyJS.onChat = (user, msg, color, flags, extra) => {
    if (!userColors[user]) userColors[user] = extra.userColor || "orangered";
    if (twitchChatOverlay === "off") return;
    console.log("Emotes:", extra.messageEmotes); // Debugging: Check if emotes are detected
    displayChatMessage(user, msg, flags, extra);  // Show message in chat box
    processGameCommand(user, msg, flags, extra);
};

// Browser Chat Input
chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        const msg = chatInput.value.trim();
        if (!msg) return;

        const current = getActiveProfile();
        
        // Use a very safe check for the streamer identity
        const isStreamerIdentity = streamername && 
            current.name.toLowerCase() === streamername.toLowerCase();

        console.log(`Controlling: ${current.name}, IsBroadcaster: ${isStreamerIdentity}`);

        processGameCommand(current.name, msg, { 
            developer: true, 
            broadcaster: isStreamerIdentity, 
            mod: isStreamerIdentity 
        }, { userColor: current.color });

        chatInput.value = ""; 
    }
});
// Profile Selection Dropdown
profileSelector.addEventListener("change", (e) => {
    activeProfileIndex = parseInt(e.target.value);
    saveAllProfiles();
    refreshProfileUI();
    systemMessage(`Now playing as: ${getActiveProfile().name}`);
});

// Color Picker
colorPicker.addEventListener("input", (e) => {
    updateBrowserProfile(null, e.target.value);
});


/* ComfyJS.onChat = (user, msg, color, flags, extra) => {
//	console.log( "User:", user, "command:", command,);
//	displayConsoleMessage(user, `!${command}`);
    // Store user color from extra	
    if (!userColors[user]) {
        userColors[user] = extra.userColor || "orangered"; // Default to white if no color is provided
    }

    let p = getPlayer(user, extra.userColor);
    let args = msg.split(" ");
// 1. Try the Central Router first (for clear/scrub/future browser commands)
    // We pass 'developer: true' if we want to bypass Twitch flags for local testing
    let wasCentralCmd = centralCommandRouter(p, user, msg, { 
        broadcaster: flags.broadcaster, 
        mod: flags.mod,
        developer: false // Change to true if testing locally without Twitch
    });
	if (wasCentralCmd) return; // Stop here if it was handled
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
	if (cmd === "lurk") {cmdLurk(p, user);}
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
            document.getElementById("areaDisplay").textContent = "StickmenFall: HOME"; 
        }
        if (cmd === "showdungeon") { 
            viewArea = "dungeon"; 
            document.getElementById("areaDisplay").textContent = "StickmenFall: DUNGEON"; 
        }
        if (cmd === "showpond") { 
            viewArea = "pond"; 
            document.getElementById("areaDisplay").textContent = "StickmenFall: FISHING POND"; 
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
 */

gameLoop();

