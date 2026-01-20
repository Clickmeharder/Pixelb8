//=============================================================
/* ================= ITEM LIBRARY =========================== */
// fixes needed: bow currently looks like is held by the string. we want it to look like the player is holding the bow part.
const ITEM_DB = {
    // --- WEAPONS -----------------------------------------------------------------------------------
	// swords (melee)
	"Rusty Dagger":   { type: "weapon", style: "dagger", tier: 1, rarity: 0, power: 5,  speed: 1000,  value: 40,   color: "#777"},
    "Iron Sword":     { type: "weapon", style: "sword", tier: 1, rarity: 0, power: 12, speed: 1200,  value: 200,  color: "#eee" },
	"Steel Sword":     { type: "weapon", style: "sword", tier: 1, rarity: 0, power: 15, speed: 1500,  value: 2000,  color: "#777" },
	"Golden Sword":     { type: "weapon", style: "sword", tier: 1, rarity: 0, power: 30, speed: 1750,  value: 20000,  color: "#eee"},
	// Bows (archery)
	"Shitty Shortbow":{ type: "bow", style: "bow", tier: 1, rarity: 0, power: 5, speed: 1000,  value: 40,  color: "#eee" },
	"shortbow":{ type: "weapon", style: "bow", tier: 1, rarity: 0, power: 8, speed: 1250,  value: 200,   color: "#eee" },
    "Wooden Shortbow":{ type: "bow", style: "bow", tier: 1, rarity: 0, power: 10, speed: 1500,  value: 2000,   color: "#d2b48c" },
    "Oak Shortbow":{ type: "bow", style: "bow", tier: 1, rarity: 0, power: 15, speed: 1750,  value: 20000,  color: "#d2b48c" },
	//Stalves (magic)
	"Wooden Staff":   { type: "staff", style:"", tier: 1, rarity: 0, power: 10, speed: 500,  value: 40, color: "#00ffcc", poleColor: "#5d4037"  },
	"Styled Staff":   { type: "staff", style:"staff", tier: 1, rarity: 0, power: 15, speed: 750,  value: 40, color: "#00ffcc", poleColor: "#5d4037"  },
// -------------------------- TOOLS --------------------------------------------------------------------
    "Fishing Rod":    { type: "tool", style:"", tier: 1, rarity: 0, power: 0, value: 1,   color: "#8B4513" },
// ------------------------- Helmets and Hats ----------------------------------------------------------
	// --- Helmets     ---
	"Iron Helmet":    { type: "helmet",style: "knight", tier: 1, rarity: 0, def: 5, value: 150, color: "#aaa" },
	"Viking Helm":    { type: "helmet", style: "viking", tier: 1, rarity: 0, def: 6,  value: 400,  color: "#888" },
	"Steel Helmet":    { type: "helmet",style: "knight", tier: 1, rarity: 0, def: 7, value: 150, color: "#eee" },
	"Great Horns":    { type: "helmet", style: "horns", tier: 1, rarity: 0, def: 8,  value: 1200, color: "#FFD700" }, // Gold Viking horns!
	//---Wizard Hats   ---
    "Cool Hat": { type: "helmet", style: "wizard", tier: 1, rarity: 0, def: 1,  value: 150,  color: "#303f9f" },
	"Magic Hat": { type: "helmet", style: "wizard", tier: 1, rarity: 0, def: 3,  value: 150,  color: "#303f9f" },
    "Wizard Hat": { type: "helmet", style: "wizard", tier: 1, rarity: 0, def: 4,  value: 5000, color: "#4a148c" },
	"Archmage Point": { type: "helmet", style: "wizard", tier: 1, rarity: 0, def: 5,  value: 150,  color: "#303f9f" },
	//--- Lurker Hoods ---
	"Cool Hood":  { type: "hood", style: "hood", tier: 1, rarity: 0, def:1;                           value: 100, color: "#555" },
    "Lurker Hood":  { type: "hood", style: "hood", tier: 1, rarity: 0, def:2;                            value: 100, color: "#222" },
	"Cool Hood":  { type: "hood", style: "hood", tier: 1, rarity: 0, def:3;                           value: 100, color: "#555" },
	"Dark Hood":  { type: "hood", style: "hood", tier: 1, rarity: 0, def:5;                           value: 100, color: "#555" },
//------------------------------------------------------------------------------------------------------
// --------------------------- ARMOR/SHIRT -------------------------------------------------------------
	// --- shirts
    "Red Shirt":  { type: "armor", style:"", tier: 1, rarity: 0,  def: 0,                  value: 60,   color: "red" },
	"Orange Shirt":  { type: "armor", style:"", tier: 1, rarity: 0, def: 0,                  value: 60,   color: "orange" },
	"Yellow Shirt":  { type: "armor", style:"", tier: 1, rarity: 0, def: 0,                  value: 60,   color: "yellow" },
	"Green Shirt":  { type: "armor", style:"", tier: 1, rarity: 0, def: 0,                  value: 60,   color: "green" },
	"Blue Shirt":  { type: "armor", style:"", tier: 1, rarity: 0, def: 0,                  value: 60,   color: "blue" },
	"Brown Shirt" { type: "armor", style:"", tier: 1, rarity: 0, def: 0,                  value: 60,   color: "brown" },
	"Indigo Shirt" { type: "armor", style:"", tier: 1, rarity: 0, def: 0,                  value: 60,   color: "indigo" },
	"Violet Shirt" { type: "armor", style:"", tier: 1, rarity: 0, def: 0,                  value: 60,   color: "violet" },
	// --- archer
    "Leather Tunic":  { type: "armor", style:"", tier: 1, rarity: 0, def: 3,                  value: 60,   color: "#5c4033" },
	// --- melee
	"Iron Plate":     { type: "armor", style:"", tier: 1, rarity: 0, def: 4,                  value: 300,  color: "#aaa" },
	// --- magic
	"Wizard Robe":  { type: "armor", style:"", tier: 1, rarity: 0, def: 3,                  value: 60,   color: "blue" },
	// --- lurker
	"Lurker Robe":  { type: "armor", style:"", tier: 1, rarity: 0, def: 2,                  value: 60,   color: "#222" },
	// --- lumberjack
	// --- miner 
	//
//------------------------------------------------------------------------------------------------------
// ------------------------------PANTS------------------------------------------------------------------
	//basic pants
	"blue pants":  { type: "armor", style:"", tier: 1, rarity: 0, def: 0,                  value: 60,   color: "teal" },
	"gray pants":  { type: "armor", style:"", tier: 1, rarity: 0, def: 0,                  value: 60,   color: "gray" },
	"pink pants":  { type: "armor", style:"", tier: 1, rarity: 0, def: 0,                  value: 60,   color: "pink" },
	"Blue Shirt":  { type: "armor", style:"", tier: 1, rarity: 0, def: 0,                  value: 60,   color: "blue" },
	//melee
	"Iron Pants":  { type: "pants", style:"", tier: 1, rarity: 0, def :4, value: 100,color: "#aaa" },
	// --- archer
    "Leather Pants":  { type: "pants", style:"", tier: 1, rarity: 0, def :3, value: 100,color: "#3e2723" },
	// --- wizard
	"Wizard Pants":  { type: "pants", style:"", tier: 1, rarity: 0, def :3, value: 100,color: "blue" },
	// --- lurker
	"Lurker Pants":  { type: "pants", style:"", tier: 1, rarity: 0, def :2, value: 100,color: "#222" },
	
//------------------------------------------------------------------------------------------------------
// ------------------------------Boots------------------------------------------------------------------
    "leather Boots":  { type: "boots", style:"", tier: 1, rarity: 0, def: 1,                 value: 30,   color: "#5c4033" },
    "leather Booties":{ type: "boots", style:"", tier: 1, rarity: 0, def: 1,                 value: 35,   color: "#5c4033" },
//------------------------------------------------------------------------------------------------------

// ------------------------------Gloves------------------------------------------------------------------
    "White Gloves":   { type: "gloves", style:"", tier: 1, rarity: 0, value: 100, color: "#ffffff" },
	"Leather Gloves":   { type: "gloves", style:"", tier: 1, rarity: 0, value: 100, color: "#5c4033" },
    // --- SPECIALS ---
// special head
	"box":      { type: "helmet", style: "box", tier: 1, rarity: 0, def: 1, value: 5, color: "#d2b48c" },
	"Paper Bag":      { type: "helmet", style: "paperbag", tier: 1, rarity: 0, def: 1, value: 5, color: "#d2b48c" },
	"tv":      { type: "helmet", style: "tv", tier: 1, rarity: 0, def: 1, value: 5, color: "#d2b48c" },
	"wig":            { type: "helmet", style:"", tier: 1, rarity: 0, def: 1,style: "wig",     value: 5000, color: "yellow" },
    "Royal Crown":    { type: "helmet", style: "crown", tier: 1, rarity: 0, def: 2,  value: 10000, color: "#ff0000" },
	"uknown":    { type: "helmet", style: "centurion", tier: 1, rarity: 0, def: 2,  value: 10000, color: "#ffcc00" },
	"Pirate Hat":    { type: "helmet", style: "pirate", tier: 1, rarity: 0, def: 2,  value: 10000, color: "#222222" },
	"gentleman hat":    { type: "helmet", style: "gentleman", tier: 1, rarity: 0,  def: 2,  value: 10000, color: "#333333" },
	"fun hat":    { type: "helmet", style: "funhat", tier: 1, rarity: 0, def: 2,  value: 10000, color: "white" },
	"kabuto":    { type: "helmet", style: "samurai", tier: 1, rarity: 0, def: 2,  value: 10000, color: "#8B0000" },
	"stickmenpo":    { type: "helmet", style: "menpo", tier: 1, rarity: 0, def: 2,  value: 10000, color: "#8B0000" },
// special capes
    "Royal Cape":     { type: "cape", style:"cape", tier: 1, rarity: 0, value: 10000, color: "#880000" },
    "99 Cape":     { type: "cape", style:"cape", tier: 1, rarity: 0, value: 10000, color: "#880000" },
    "Cloak":     { type: "cape", style:"cloak", tier: 1, rarity: 0, value: 10000, color: "#333" },
    "Ball gown":     { type: "cape", style:"ballgown", tier: 1, rarity: 0, value: 10000, color: "purple" },
    "Angelic Ring":   { type: "helmet", style: "halo", tier: 1, rarity: 0, def: 0,  value: 9999, color: "yellow" },
// hair
	"hair1": { type: "hair", style: "mohawk", tier: 1, rarity: 0, color: "#ff69b4" },// pink mohawk
	"hair2": { type: "hair", style: "pigtails", tier: 1, rarity: 0, color: "#4b3621" },// pigtails hair
	"hair3": { type: "hair", style: "scribble", tier: 1, rarity: 0,   color: "#ffeb3b" }, // yellow child scribble
	"hair4": { type: "hair", style: "messy", tier: 1, rarity: 0,      color: "#614126" }, // messy 
	"hair5": { type: "hair", style: "braids", tier: 1, rarity: 0,    color: "#f3e5ab" }, // thick blonde braids
    "hair6": { type: "hair", style: "girly", tier: 1, rarity: 0,  color: "#f3e5ab" }, // girly braids
	"hair7": { type: "hair", style: "pomp", tier: 1, rarity: 0, color: "#614126" }, // Forward spiky pomp
    "hair8": { type: "hair", style: "twinspikes", tier: 1, rarity: 0, color: "#ff0000" }, // Red double spikes
	"hair11": { type: "hair", style: "drills", tier: 1, rarity: 0, color: "#f3e5ab" }, // spiral chunky drills 
	"oldman beard": { name: "Wizard Beard", tier: 1, rarity: 0, type: "hair", style: "wizardbeard", color: "#ffffff" },
	"wizard beard": { name: "Dark Mage Beard", tier: 1, rarity: 0, type: "hair", style: "wizardbeard", color: "#333333" },

// ---------------------------basic items----------------------------------------------------------------
	// --- unique fish ---
	"Golden Bass":    { type: "fish", tier: 1, rarity: 0, value: 100, color: "#FFD700" },
	// --- unique swimming find ---
	"Pearl":    { type: "fish", tier: 1, rarity: 0, value: 100, color: "white" },
    // --- MATERIALS ---
    "Leather scrap":  { type: "material", tier: 1, rarity: 0, value: 15,   color: "#a88d6d" },
	"Sea Shell":  { type: "material", tier: 1, rarity: 0, value: 15,   color: "#a88d6d" },
	"Leather scrap":  { type: "material", tier: 1, rarity: 0, value: 15,   color: "#a88d6d" },
	// other basic materials will go here
//-------------------------------------------------------------------------------------------------------
};
/* ================= EXTENDED ITEM LIBRARY ================= */
const DANCE_UNLOCKS = {
    1: { name: "The Hop", minLvl: 1 },
    2: { name: "The paddle", minLvl: 5 },
    3: { name: "The Lean",  minLvl: 1 },
    4: { name: "The groupy", minLvl: 1 },
	5: { name: "The Sway", minLvl: 1 },
    6: { name: "The sixthdance", minLvl: 1 },
    7: { name: "The ninthdance", minLvl: 1 },

	99: { name: "The 99", minLvl: 99 }
};

const DANCE_LIBRARY = {
    1: (now) => ({ bodyY: Math.sin(now / 100) * 8 }), // The Hop
    2: (now) => ({ armMove: Math.sin(now / 200) * 20 }), // The paddle
    3: (now) => ({ lean: Math.sin(now / 200) * 0.1 }), // The Sway
    4: (now) => ({ 
        bodyY: Math.abs(Math.sin(now / 150)) * -15,
        armMove: Math.sin(now / 150) * 5,
        pose: "head_hands" 
    }),
    5: (now) => ({ lean: Math.sin(now / 200) * 0.6 }), // The Lean
    6: (now) => ({ bodyY: Math.sin(now / 175) * 4 }), // The Bop
 
    7: (now) => ({ 
        bodyY: Math.min(0, Math.sin(now / 200) * -40),
        lean: Math.sin(now / 200) * 0.2,
        pose: "action"
    }),
    99: (now, p) => { 
        let bY = Math.min(0, Math.sin(now / 200) * -50); 
        if (bY > -1 && p.wasInAir) {
            spawnArrow(p.x, p.y + 25, p.x + 60, p.y + 25);
            spawnArrow(p.x, p.y + 25, p.x - 60, p.y + 25);
            p.wasInAir = false;
        }
        if (bY < -5) p.wasInAir = true;
        return { bodyY: bY, lean: 0, pose: "action" };
    },
};
/* ================= ITEM DRAWING LIBRARY ================= */
// headstyles are helmets or different head slot item styles
//===========================================================================================================
/* To make a Cowboy Hat: Take the pirate style, set foldHeight to 5, and make brimWidth much larger (like 25).
To make a Sombrero: Take the gentleman style, set brimSize to 30 and hatTall to 15, then change the color to yellow.
To make a Tiny Fancy Hat: Take the gentleman style, move the hX (horizontal) in the settings to hX + 8 so it sits tilted on the side of the head, and make all the sizes smaller. */
const WEAPON_STYLES = {
    "sword": (ctx, item, isAttacking, now) => {
        let swing = isAttacking ? Math.sin(now / 150) * 0.8 : Math.PI / 1.2;
        ctx.rotate(swing);
        ctx.strokeStyle = item.color || "#ccc";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(25, -2); ctx.stroke();
        ctx.strokeStyle = "#aa8800";
        ctx.beginPath(); ctx.moveTo(5, -6); ctx.lineTo(5, 6); ctx.stroke();
    },

	"bow": (ctx, item, isAttacking, now, p) => {
		ctx.rotate(isAttacking ? -0.6 : Math.PI / 7);

		// Calculate "Draw Amount" based on attack speed
		let weaponData = ITEM_DB[p.stats.equippedWeapon];
		let speed = weaponData?.speed || 2500;
		let timeSinceLast = now - (p.lastAttackTime || 0);
		
		// String pulls back as we get closer to the next attack
		let drawProgress = Math.min(1, timeSinceLast / speed);
		let pull = isAttacking ? (drawProgress * 15) : 0;

		// Bow Wood
		ctx.strokeStyle = item.color || "#8B4513";
		ctx.lineWidth = 3;
		ctx.beginPath(); 
		ctx.arc(-15, 0, 15, -Math.PI / 2, Math.PI / 2, false); 
		ctx.stroke();

		// Bowstring
		ctx.strokeStyle = "rgba(255,255,255,0.7)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(-15, -15); 
		ctx.lineTo(-15 - pull, 0); // Pulls back based on attack timer
		ctx.lineTo(-15, 15); 
		ctx.stroke();
	},

    "staff": (ctx, item, isAttacking, now) => {
        if (isAttacking) ctx.rotate(Math.sin(now / 150) * 0.5);
        ctx.strokeStyle = item.poleColor || "#4e342e";
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -45); ctx.stroke();
        let pulse = Math.sin(now / 400) * 5;
        ctx.fillStyle = item.color || "#00ffff";
        ctx.shadowBlur = 10 + pulse; ctx.shadowColor = ctx.fillStyle;
        ctx.beginPath(); ctx.arc(0, -50, 6, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0;
    },
	
	"fishing_rod": (ctx, item, isAttacking, now, p, bodyY, lean) => {
		const isActuallyFishing = p.activeTask === "fishing";
		
		ctx.strokeStyle = item.color || "#8B4513";
		ctx.lineWidth = 2;

		if (isActuallyFishing) {
			let bob = Math.sin(now / 300) * 5;
			
			// 1. Draw the Rod (Starting at 0,0 which is the Hand)
			ctx.beginPath();
			ctx.moveTo(0, 0); 
			// Tip is 40px right and 30px up from the hand
			const tipX = 40;
			const tipY = -30 + bob;
			ctx.lineTo(tipX, tipY);
			ctx.stroke();

			// 2. Draw the Line
			ctx.strokeStyle = "rgba(255,255,255,0.5)";
			ctx.lineWidth = 1;
			ctx.beginPath();
			ctx.moveTo(tipX, tipY);
			
			// This targets the water relative to the player
			// We subtract the current hand position to find the water in "local" space
			const waterX = 80; 
			const waterY = 60 - bodyY; 

			ctx.quadraticCurveTo(tipX + 10, tipY + 30, waterX, waterY);
			ctx.stroke();

			// 3. Draw the Bobber
			ctx.fillStyle = "#ff4444";
			ctx.beginPath(); 
			ctx.arc(waterX, waterY, 3, 0, Math.PI * 2); 
			ctx.fill();
		} else {
			// Idle/Walking: Carry it upright
			ctx.rotate(-Math.PI / 8);
			ctx.beginPath(); ctx.moveTo(0, 5); ctx.lineTo(0, -45); ctx.stroke();
		}
	},
	"axe": (ctx, item, isAttacking, now) => {
        // CHOPPING ANIMATION: A sharp, heavy downward tilt
        let chop = isAttacking ? Math.sin(now / 100) * 1.2 : Math.PI / 1.2;
        ctx.rotate(chop);
        
        // Handle
        ctx.strokeStyle = "#5d4037"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, 0); ctx.stroke();
        
        // Axe Head
        ctx.fillStyle = item.color || "#999";
        ctx.beginPath();
        ctx.moveTo(15, -5); ctx.lineTo(25, -8); ctx.lineTo(25, 8); ctx.lineTo(15, 5);
        ctx.fill(); ctx.stroke();
    },

    "pickaxe": (ctx, item, isAttacking, now) => {
        // MINING ANIMATION: Similar to axe but with a "rebound" feel
        let swing = isAttacking ? Math.sin(now / 120) * 1.4 : Math.PI / 1.2;
        ctx.rotate(swing);

        // Handle
        ctx.strokeStyle = "#4e342e"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, 0); ctx.stroke();

        // Pickaxe Head (The double-pointed arc)
        ctx.strokeStyle = item.color || "#aaa";
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(22, 0, 12, Math.PI * 0.7, Math.PI * 1.3);
        ctx.stroke();
    }
};

const HAT_STYLES = {
    "box": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -1;  // Vertical shift
        const w = 24, h = 26;
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.fillRect(hX - w/2, top - h/2, w, h);
        ctx.strokeRect(hX - w/2, top - h/2, w, h);
    },
	"paperbag": (ctx, hX, hY, color) => {
		// --- SETTINGS ---
		const offset = -2;  // Shifted slightly for a better "fit"
		const w = 26, h = 28;
		const top = hY + offset;
		const boxX = hX - w/2;
		const boxY = top - h/2;

		// 1. DRAW THE BAG
		ctx.fillStyle = color || "#c2b280"; // Default to a brown paper color
		ctx.fillRect(boxX, boxY, w, h);
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 1.5;
		ctx.strokeRect(boxX, boxY, w, h);

		// 2. DRAW EYE HOLES
		ctx.fillStyle = "#1a1a1a"; // Dark inside
		// Left Eye
		ctx.beginPath();
		ctx.arc(hX - 6, top - 2, 3, 0, Math.PI * 2);
		ctx.fill();
		// Right Eye
		ctx.beginPath();
		ctx.arc(hX + 6, top - 2, 3, 0, Math.PI * 2);
		ctx.fill();

		// 3. OPTIONAL: CRINKLE DETAILS
		ctx.strokeStyle = "rgba(0,0,0,0.1)"; // Very faint lines
		ctx.beginPath();
		ctx.moveTo(boxX + 4, boxY + 5);
		ctx.lineTo(boxX + 10, boxY + 12);
		ctx.stroke();

		// 4. JAGGED BOTTOM (Optional visual flair)
		ctx.strokeStyle = "#000";
		ctx.beginPath();
		ctx.moveTo(boxX, boxY + h);
		for (let i = 0; i <= w; i += 4) {
			ctx.lineTo(boxX + i, boxY + h + (i % 8 === 0 ? 2 : -2));
		}
		ctx.stroke();
	},
	"tv": (ctx, hX, hY, color) => {
		// --- SETTINGS ---
		const offset = -2;
		const w = 28, h = 24;
		const top = hY + offset;
		const boxX = hX - w/2;
		const boxY = top - h/2;

		// 1. DRAW THE CASING (The Plastic Shell)
		ctx.fillStyle = "#333"; // Dark grey plastic
		ctx.fillRect(boxX, boxY, w, h);
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;
		ctx.strokeRect(boxX, boxY, w, h);

		// 2. DRAW THE SCREEN (The "Glass")
		const margin = 4;
		ctx.fillStyle = "#1a1a1a"; // Off-black screen
		ctx.fillRect(boxX + margin, boxY + margin, w - (margin * 2), h - (margin * 2.5));
		
		// 3. DRAW THE FACE (Glowing Eyes/Smile)
		ctx.fillStyle = "#00ff00"; // Classic Retro Green
		ctx.shadowBlur = 5;
		ctx.shadowColor = "#00ff00";
		
		// Left Eye pixel
		ctx.fillRect(hX - 6, top - 2, 3, 3);
		// Right Eye pixel
		ctx.fillRect(hX + 3, top - 2, 3, 3);
		// Small smile pixel
		ctx.fillRect(hX - 3, top + 4, 6, 2);
		
		ctx.shadowBlur = 0; // Reset shadow so it doesn't bleed into other parts

		// 4. DRAW ANTENNAE
		ctx.strokeStyle = "#555";
		ctx.lineWidth = 1.5;
		// Left Antenna
		ctx.beginPath();
		ctx.moveTo(hX - 4, boxY);
		ctx.lineTo(hX - 10, boxY - 8);
		ctx.stroke();
		// Right Antenna
		ctx.beginPath();
		ctx.moveTo(hX + 4, boxY);
		ctx.lineTo(hX + 10, boxY - 8);
		ctx.stroke();

		// Small knobs on top of antennae
		ctx.fillStyle = "#ff0000";
		ctx.beginPath();
		ctx.arc(hX - 10, boxY - 8, 2, 0, Math.PI * 2);
		ctx.arc(hX + 10, boxY - 8, 2, 0, Math.PI * 2);
		ctx.fill();
	},
	"fishhat": (ctx, hX, hY, color) => {
		// --- SETTINGS ---
		const w = 28, h = 18;
		const top = hY - 4; // Sits slightly higher
		
		// 1. FISH BODY
		ctx.fillStyle = color || "#ff8c00"; // Default orange (Clownfish)
		ctx.beginPath();
		ctx.ellipse(hX, top, w/2, h/2, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// 2. THE TAIL (Triangular back)
		ctx.beginPath();
		ctx.moveTo(hX - 10, top);
		ctx.lineTo(hX - 22, top - 8);
		ctx.lineTo(hX - 22, top + 8);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// 3. THE EYE (Staring blankly)
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.arc(hX + 8, top - 2, 4, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();
		ctx.fillStyle = "#000";
		ctx.beginPath();
		ctx.arc(hX + 9, top - 2, 1.5, 0, Math.PI * 2);
		ctx.fill();

		// 4. THE MOUTH (O-shaped)
		ctx.beginPath();
		ctx.arc(hX + 13, top + 2, 2, 0, Math.PI * 2);
		ctx.stroke();
	},
	//HAIR
	// WIG IS SPECIAL ITS A HELMET NOT HAIR AND CAN BE COLORED BY ANY USER WITH A COMMAND
	"wig": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -4;
        const length = 20;
        const thickness = 5;
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.lineWidth = thickness;
        ctx.lineCap = "round";

        // 1. Scalp Top
        ctx.beginPath(); ctx.arc(hX, top, 12, Math.PI, 0); ctx.fill();

        // 2. Left and Right Side Strands (No chin connection)
        ctx.beginPath();
        // Left Strand
        ctx.moveTo(hX - 11, top); 
        ctx.quadraticCurveTo(hX - 15, top + 10, hX - 12, top + length);
        // Right Strand
        ctx.moveTo(hX + 11, top); 
        ctx.quadraticCurveTo(hX + 15, top + 10, hX + 12, top + length);
        ctx.stroke();

        // 3. Subtle Strand Details
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hX - 5, top - 10); ctx.lineTo(hX - 5, top - 2);
        ctx.moveTo(hX + 5, top - 10); ctx.lineTo(hX + 5, top - 2);
        ctx.stroke();
    },
	"mohawk": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -8;
        const hawkHeight = 15;   // How tall the spikes are
        const hawkWidth = 14;    // How far the hawk spreads front-to-back
        const numSpikes = 8;     // More spikes = more "strandy" look
        const strandColor = "rgba(0,0,0,0.2)";
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.strokeStyle = strandColor;
        ctx.lineWidth = 1;

        // 1. Draw the spikes in a fan shape
        ctx.beginPath();
        ctx.moveTo(hX - hawkWidth/2, top + 5);
        
        for (let i = 0; i <= numSpikes; i++) {
            // Calculate position along the curve of the head
            let pct = i / numSpikes;
            let angle = Math.PI + (pct * Math.PI); // Half circle arc
            
            // The tip of each hair clump
            let tx = hX + Math.cos(angle) * (hawkWidth);
            let ty = top + Math.sin(angle) * (hawkHeight);
            
            // The "valley" between spikes
            let vx = hX + Math.cos(angle + 0.1) * (hawkWidth - 4);
            let vy = top + Math.sin(angle + 0.1) * (hawkHeight - 4);

            ctx.lineTo(tx, ty);
            if (i < numSpikes) ctx.lineTo(vx, vy);
        }

        ctx.lineTo(hX + hawkWidth/2, top + 5);
        ctx.closePath();
        ctx.fill();

        // 2. Add internal strand lines for texture
        for (let i = 1; i < numSpikes; i++) {
            let pct = i / numSpikes;
            let angle = Math.PI + (pct * Math.PI);
            ctx.beginPath();
            ctx.moveTo(hX + Math.cos(angle) * 5, top + Math.sin(angle) * 2);
            ctx.lineTo(hX + Math.cos(angle) * (hawkWidth - 2), top + Math.sin(angle) * (hawkHeight - 2));
            ctx.stroke();
        }
    },
    "pigtails": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -8;     // Lifted higher to attach to top-sides
        const tieX = 10;       // Width out from center
        const tLen = 18;
        const bounce = Math.sin(Date.now() / 500) * 2;
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;

        // Scalp base
        ctx.beginPath(); ctx.arc(hX, top + 3, 11, Math.PI, 0); ctx.fill();

        // Tails attached to the upper sides
        [ -tieX, tieX ].forEach(side => {
            ctx.beginPath();
            ctx.moveTo(hX + side, top + 2);
            let targetX = hX + side + (side > 0 ? 8 : -8) + (side > 0 ? -bounce : bounce);
            ctx.quadraticCurveTo(targetX, top + 10, hX + side + (side > 0 ? 2 : -2), top + tLen);
            ctx.lineTo(hX + side + (side > 0 ? -3 : 3), top + tLen);
            ctx.quadraticCurveTo(targetX - (side > 0 ? 4 : -4), top + 10, hX + side, top + 4);
            ctx.fill();
            
            // Tiny hair ties
            ctx.fillStyle = "rgba(0,0,0,0.3)";
            ctx.fillRect(hX + side - 2, top + 1, 4, 2);
            ctx.fillStyle = color;
        });
    },
	"scribble": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -8;      // Lowered to sit tighter on the head
        const height = 4;       // Max height of the "scrawl"
        const width = 10;       // How far it spreads
        // ----------------
        const top = hY + offset;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        
        ctx.beginPath();
        ctx.moveTo(hX - width, top);
        
        // Loop to create "chaotic" low-profile peaks
        for(let i = 0; i < 12; i++) {
            let x = hX - width + (i * 1.8);
            // Height toggles between 2 and 'height' for a messy look
            let y = top - (i % 2 === 0 ? height : 2);
            ctx.lineTo(x, y);
            ctx.lineTo(x + 1, top + 1); // Return back toward the scalp
        }
        ctx.stroke();
        
        // A single tiny "messy loop" closer to the hair line
        ctx.beginPath();
        ctx.arc(hX + 2, top - 1, 2, 0, Math.PI * 2);
        ctx.stroke();
    },
	"braids": (ctx, hX, hY, color) => {
        const offset = -8;
        const top = hY + offset;
        const slowBounce = Math.sin(Date.now() / 1000) * 1.5;
        ctx.fillStyle = color;

        // Scalp
        ctx.beginPath(); ctx.arc(hX, top + 3, 11, Math.PI, 0); ctx.fill();

        // Chunky Braids
        [-10, 10].forEach(side => {
            ctx.beginPath();
            ctx.moveTo(hX + side, top + 2);
            // Zig-zag braid body
            for(let i=0; i<4; i++) {
                let y = top + 5 + (i * 4);
                let xOff = (i % 2 === 0 ? 3 : -3) + (side > 0 ? slowBounce : -slowBounce);
                ctx.lineTo(hX + side + xOff, y);
            }
            // Pointy bottom tuft
            ctx.lineTo(hX + side + (side > 0 ? slowBounce : -slowBounce), top + 22);
            ctx.fill();
        });
    },
	"messy": (ctx, hX, hY, color) => {
        const offset = -8;
        const height = 5;
        const width = 11;
        const top = hY + offset;
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        
        // Extra messy base scribble to break the half-circle
        for(let j=0; j<3; j++) {
            ctx.beginPath();
            ctx.moveTo(hX - width, top + j);
            for(let i = 0; i < 10; i++) {
                let x = hX - width + (i * 2.2);
                let y = top + j - (i % 2 === 0 ? height - j : 1);
                ctx.lineTo(x, y);
            }
            ctx.stroke();
        }
        // The loose loop
        ctx.beginPath(); ctx.arc(hX + 3, top - 2, 2.5, 0, Math.PI * 2); ctx.stroke();
    },
	"girly": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -8;
        const bThick = 5;        // Thickness of the braids
        const bLen = 22;         // Length of the braids
        const slowBounce = Math.sin(Date.now() / 1000) * 1.5;
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1;

        // Scalp with a "parting" line
        ctx.beginPath(); ctx.arc(hX, top + 3, 11, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.moveTo(hX, top - 8); ctx.lineTo(hX, top + 3); ctx.stroke();

        [-10, 10].forEach(side => {
            ctx.beginPath();
            ctx.moveTo(hX + side - (bThick/2), top + 2);
            
            // Draw the clumpy braid segments
            for(let i=0; i<4; i++) {
                let y = top + 5 + (i * 4);
                let xOff = (i % 2 === 0 ? bThick : -bThick) + (side > 0 ? slowBounce : -slowBounce);
                ctx.lineTo(hX + side + xOff, y);
                
                // Internal strand lines for "hairy" texture
                ctx.moveTo(hX + side, y - 2);
                ctx.lineTo(hX + side + (xOff/3), y + 2);
            }
            
            // The pointy bottom tuft
            ctx.lineTo(hX + side + (side > 0 ? slowBounce : -slowBounce), top + bLen);
            ctx.lineTo(hX + side - (side > 0 ? bThick : -bThick), top + 15);
            ctx.fill(); ctx.stroke();
        });
    },
	"drills": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -7;
        const dSize = 7;         // Width of the spiral
        const dLen = 20;         // Length of the drill
        const sway = Math.sin(Date.now() / 800) * 2;
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.strokeStyle = "rgba(0,0,0,0.2)";

        // Scalp
        ctx.beginPath(); ctx.arc(hX, top + 2, 11, Math.PI, 0); ctx.fill();

        [-11, 11].forEach(side => {
            ctx.beginPath();
            ctx.moveTo(hX + side, top + 2);
            
            // Spiral loop logic
            for(let i=0; i<dLen; i+=4) {
                let y = top + 2 + i;
                let xOff = Math.sin(i + Date.now()/500) * dSize; // The spiral curve
                ctx.quadraticCurveTo(hX + side + xOff + sway, y, hX + side + sway, y + 4);
            }
            
            // Jagged end of the drill
            ctx.lineTo(hX + side + sway, top + dLen + 5);
            ctx.fill(); ctx.stroke();
        });
    },
	"pomp": (ctx, hX, hY, color) => {
        const offset = -7;
        const top = hY + offset;
        const numSpikes = 6;
        ctx.fillStyle = color;
        ctx.strokeStyle = "rgba(0,0,0,0.2)";

        ctx.beginPath();
        ctx.moveTo(hX + 10, top + 5); // Start at back
        for (let i = 0; i <= numSpikes; i++) {
            let pct = i / numSpikes;
            // Angle shifted to lean forward
            let angle = Math.PI + (pct * (Math.PI * 0.8)); 
            let tx = hX + Math.cos(angle) * 15;
            let ty = top + Math.sin(angle) * 15;
            ctx.lineTo(tx, ty);
            ctx.lineTo(tx + 2, top + 2);
        }
        ctx.fill();
        // Texture lines
        for(let i=1; i<numSpikes; i++) {
            ctx.beginPath();
            ctx.moveTo(hX, top);
            ctx.lineTo(hX - 10, top - 5);
            ctx.stroke();
        }
    },
	"twinspikes": (ctx, hX, hY, color) => {
        const offset = -8;
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.strokeStyle = "rgba(0,0,0,0.2)";

        [-5, 5].forEach(side => {
            ctx.beginPath();
            ctx.moveTo(hX + side - 4, top + 5);
            for(let i=0; i<3; i++) {
                let x = hX + side - 4 + (i * 4);
                ctx.lineTo(x, top - 12);
                ctx.lineTo(x + 2, top + 5);
            }
            ctx.fill();
        });
        // Scalp connection
        ctx.beginPath(); ctx.arc(hX, top + 5, 8, Math.PI, 0); ctx.fill();
    },
	"wizardbeard": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = 4;       // Move up/down (Negative is up)
        const beardLen = 26;    // Length of the beard
        const beardWidth = 11;  // Width of the fan
        const sway = Math.sin(Date.now() / 1000) * 2;
        // ----------------
        const base = hY + offset;
        ctx.fillStyle = color;
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1;

        // 1. The Main Beard (Jagged clumpy edges)
        ctx.beginPath();
        ctx.moveTo(hX - 9, base - 1); 
        
        // Jagged tufts on the sides
        ctx.lineTo(hX - beardWidth + sway, base + 12);
        // The Pointy Tip
        ctx.lineTo(hX + sway, base + beardLen);
        // Right jagged tuft
        ctx.lineTo(hX + beardWidth + sway, base + 12);
        
        ctx.lineTo(hX + 9, base - 1);
        ctx.fill();
        ctx.stroke();
        // 2. The Mustache (Curved and clumpy)
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        // Left Mustache
        ctx.moveTo(hX - 2, base - 3); 
        ctx.quadraticCurveTo(hX - 8, base - 2, hX - 10, base + 2);
        // Right Mustache
        ctx.moveTo(hX + 2, base - 3); 
        ctx.quadraticCurveTo(hX + 8, base - 2, hX + 10, base + 2);
        ctx.stroke();
        // 3. Texture Strands (Mohawk-style internal lines)
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(hX - 4, base + 5);
        ctx.lineTo(hX - 3 + sway, base + beardLen - 8);
        ctx.moveTo(hX + 4, base + 5);
        ctx.lineTo(hX + 3 + sway, base + beardLen - 8);
        ctx.stroke();
    },
// ----------------------------------------------------------------
// HOOD STYLES-----------------------------------------------------
    "hood": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = 0;
        const depth = 10;     // How low the hood drapes
        const shadowSize = 8; // Size of the dark interior
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(hX - 13, top + depth);
        ctx.quadraticCurveTo(hX - 15, top - 20, hX, top - 20);
        ctx.quadraticCurveTo(hX + 15, top - 20, hX + 13, top + depth);
        ctx.fill();
        ctx.fillStyle = "rgba(0,0,0,0.4)";
        ctx.beginPath(); ctx.arc(hX, top, shadowSize, 0, Math.PI*2); ctx.fill();
    },

// HELMET STYLES-----------------------------------------------------
	"knight": (ctx, hX, hY, color) => {
		// --- SETTINGS ---
		const offset = -2;
		const faceVisible = 14;
		const helmetSize = 13;

		// --- EYE SLIT SETTINGS ---
		const slitW = 18;      // Width of the gap
		const slitH = 3;       // Height of the gap (thickness)
		const slitY = 2;       // Vertical position relative to 'top'
		const slitColor = "#1a1a1a"; 
		// ------------------------

		const top = hY + offset;

		// 1. MAIN HELMET SHAPE
		ctx.fillStyle = color;
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 1.5;

		ctx.beginPath(); 
		ctx.arc(hX, top, helmetSize, Math.PI, 0); 
		ctx.lineTo(hX + helmetSize, top + faceVisible); 
		ctx.lineTo(hX, top + faceVisible + 4); // The "chin" point
		ctx.lineTo(hX - helmetSize, top + faceVisible); 
		ctx.closePath();
		
		ctx.fill(); 
		ctx.stroke();

		// 2. THE EYE SLIT
		ctx.fillStyle = slitColor;
		// Centers the slit horizontally and places it at slitY
		ctx.fillRect(hX - slitW / 2, top + slitY, slitW, slitH);

		// 3. OPTIONAL: HELMET CREST (The line on top)
		ctx.beginPath();
		ctx.moveTo(hX, top - helmetSize);
		ctx.lineTo(hX, top - helmetSize - 4);
		ctx.stroke();
	},
	"spacehelmet": (ctx, hX, hY, color) => {
		// --- SETTINGS ---
		const radius = 16;
		const top = hY - 2;
		
		// 1. THE NECK RING (The base of the helmet)
		ctx.fillStyle = "#ddd";
		ctx.lineWidth = 2;
		ctx.strokeRect(hX - 14, top + 8, 28, 5);
		ctx.fillRect(hX - 14, top + 8, 28, 5);

		// 2. THE GLASS DOME
		ctx.save();
		ctx.globalAlpha = 0.4; // Make it see-through
		ctx.fillStyle = "#add8e6"; // Light blue glass
		ctx.beginPath();
		ctx.arc(hX, top, radius, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();

		// 3. THE OUTLINE & REFLECTION
		ctx.strokeStyle = "#fff"; // White shine
		ctx.beginPath();
		ctx.arc(hX, top, radius, 0, Math.PI * 2);
		ctx.stroke();

		// Shine highlight (that little 'glint' on glass)
		ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
		ctx.beginPath();
		ctx.arc(hX, top, radius - 4, Math.PI * 1.2, Math.PI * 1.4);
		ctx.stroke();

		// 4. SIDE COMM-PIECE (Antenna)
		ctx.fillStyle = "#999";
		ctx.fillRect(hX + 14, top - 4, 4, 8);
	},
    "horns": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -6; 
        const rimDepth = 4;
        const hornLength = 20; // Curve distance
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.beginPath(); 
        ctx.arc(hX, top, 11, Math.PI, 0); 
        ctx.lineTo(hX + 11, top + rimDepth); 
        ctx.lineTo(hX - 11, top + rimDepth); 
        ctx.closePath();
        ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(hX - 8, top - 3); ctx.quadraticCurveTo(hX - 20, top - 3 - hornLength, hX - 15, top + 4);
        ctx.lineTo(hX - 8, top + 2); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(hX + 8, top - 3); ctx.quadraticCurveTo(hX + 20, top - 3 - hornLength, hX + 15, top + 4);
        ctx.lineTo(hX + 8, top + 2); ctx.fill(); ctx.stroke();
    },

    "viking": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -5; // Moved up to clear eyes
        const rim = 3;
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(hX, top, 11, Math.PI, 0); 
        ctx.lineTo(hX + 11, top + rim); ctx.lineTo(hX - 11, top + rim); ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.moveTo(hX - 8, top - 5); ctx.quadraticCurveTo(hX - 20, top - 15, hX - 15, top + 2);
        ctx.lineTo(hX - 8, top - 2); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(hX + 8, top - 5); ctx.quadraticCurveTo(hX + 20, top - 15, hX + 15, top + 2);
        ctx.lineTo(hX + 8, top - 2); ctx.fill(); ctx.stroke();
    },

    "centurion": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -5;   
        const helmSize = 12;   
        const plumeTall = 15;   
        const plumeWide = 18;   
        const faceGap = 20;   
        const plumeColor = "#ff0000";
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = plumeColor; 
        ctx.beginPath();
        ctx.ellipse(hX, top - 8, plumeWide, plumeTall, 0, Math.PI, 0);
        ctx.fill(); ctx.stroke();

        ctx.fillStyle = color; 
        ctx.beginPath();
        ctx.arc(hX, top, helmSize, Math.PI, 0); 
        ctx.lineTo(hX + helmSize, top + faceGap); 
        ctx.lineTo(hX - helmSize, top + faceGap); 
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.beginPath(); ctx.moveTo(hX, top); ctx.lineTo(hX, top + faceGap + 2); ctx.stroke();
    },

	"samurai": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -6;
        const helmSize = 13;
        const crestSize = 15;   // The "V" or "Horn" horns on front
        const sideGuard = 12;   // How far down the neck guards go
        const highlight = "gold"; 
        // ----------------
        const top = hY + offset;

        // 1. The Side Guards (Behind the head)
        ctx.fillStyle = "#111"; // Usually black lacquered wood
        ctx.beginPath();
        ctx.moveTo(hX - helmSize, top);
        ctx.lineTo(hX - helmSize - 5, top + sideGuard);
        ctx.lineTo(hX + helmSize + 5, top + sideGuard);
        ctx.lineTo(hX + helmSize, top);
        ctx.fill(); ctx.stroke();

        // 2. The Main Helmet Bowl
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(hX, top, helmSize, Math.PI, 0);
        ctx.fill(); ctx.stroke();

        // 3. The Golden Crest (The "V" shape)
        ctx.strokeStyle = highlight;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(hX, top - 2);
        ctx.lineTo(hX - crestSize, top - crestSize); // Left horn
        ctx.moveTo(hX, top - 2);
        ctx.lineTo(hX + crestSize, top - crestSize); // Right horn
        ctx.stroke();
        ctx.lineWidth = 1; // Reset line width
    },
	"menpo": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -6;
        const helmSize = 13;
        const crestSize = 15;
        const sideGuard = 12;
        const highlight = "gold"; 
        
        // NEW COLOR LOGIC
        const helmColor = "#333";    // The helmet is now always Dark Iron
        const maskColor = color;      // The MASK now uses the color from ITEM_DB
        
        const mustacheColor = "rgba(255,255,255,0.5)"; 
        // ----------------
        const top = hY + offset;

        // 1. Side Guards (Matches the mask color)
        ctx.fillStyle = maskColor;
        ctx.beginPath();
        ctx.moveTo(hX - helmSize, top);
        ctx.lineTo(hX - helmSize - 5, top + sideGuard);
        ctx.lineTo(hX + helmSize + 5, top + sideGuard);
        ctx.lineTo(hX + helmSize, top);
        ctx.fill(); ctx.stroke();

        // 2. The Face Mask (Menpo) - Uses the Item Color
        ctx.fillStyle = maskColor;
        ctx.beginPath();
        ctx.arc(hX, hY + 2, 9, 0, Math.PI); 
        ctx.fill(); ctx.stroke();
        
        // Mustache detail
        ctx.strokeStyle = mustacheColor;
        ctx.beginPath();
        ctx.moveTo(hX - 4, hY + 3); ctx.lineTo(hX - 2, hY + 4);
        ctx.moveTo(hX + 4, hY + 3); ctx.lineTo(hX + 2, hY + 4);
        ctx.stroke();

        // 3. The Main Helmet Bowl - Uses the Hard-coded Helm Color
        ctx.fillStyle = helmColor;
        ctx.strokeStyle = "#000";
        ctx.beginPath();
        ctx.arc(hX, top, helmSize, Math.PI, 0);
        ctx.fill(); ctx.stroke();

        // 4. The Golden Crest
        ctx.strokeStyle = highlight;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(hX, top - 2);
        ctx.lineTo(hX - crestSize, top - crestSize);
        ctx.moveTo(hX, top - 2);
        ctx.lineTo(hX + crestSize, top - crestSize);
        ctx.stroke();
        ctx.lineWidth = 1;
    },
// ----------------------------------------------------------------
// ---MAGIC HATS-----------------------------------------------------
    "wizard": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -10;
        const brimWidth = 18;
        const hatHeight = 35;
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.ellipse(hX, top, brimWidth, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(hX - 10, top - 2);
        ctx.lineTo(hX, top - hatHeight); 
        ctx.lineTo(hX + 10, top - 2);
        ctx.closePath(); ctx.fill(); ctx.stroke();
    },
// ----------------------------------------------------------------
// -------SPECIAL HATS---------------------------------------------
    "crown": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -7;
        const spikes = 12; // Spike height
        const jewelColor = color;
        // ----------------
        const base = hY + offset;
        ctx.fillStyle = "#ffcc00";
        ctx.beginPath();
        ctx.moveTo(hX - 12, base);
        ctx.lineTo(hX - 12, base - spikes); ctx.lineTo(hX - 6, base - 6); 
        ctx.lineTo(hX, base - (spikes + 3)); ctx.lineTo(hX + 6, base - 6);      
        ctx.lineTo(hX + 12, base - spikes); ctx.lineTo(hX + 12, base);   
        ctx.closePath(); ctx.fill(); ctx.stroke();
        
        ctx.fillStyle = jewelColor; ctx.beginPath(); ctx.arc(hX, base - 8, 2, 0, Math.PI*2); ctx.fill();
    },
    "halo": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -25;
        const glowSize = 10;
        const haloColor = "yellow";
        // ----------------
        const top = hY + offset;
        ctx.strokeStyle = "rgba(255, 255, 0, 0.8)";
        ctx.lineWidth = 3;
        ctx.shadowBlur = glowSize; ctx.shadowColor = haloColor;
        ctx.beginPath(); ctx.ellipse(hX, top, 12, 4, 0, 0, Math.PI * 2); ctx.stroke();
        ctx.shadowBlur = 0; 
    },

// ----------------------------------------------------------------
// ------FUN HATS--------------------------------------------------
	"pirate": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -8;      // Up/Down
        const brimWidth = 20;   // How wide the hat sticks out
        const foldHeight = 12;  // How high the front "tri-corner" folds up
        const foldWidth = 15;   // How wide the front fold is
        const hatColor = "#222"; // Usually black or dark brown
        // ----------------
        const base = hY + offset;

        ctx.fillStyle = hatColor;
        ctx.strokeStyle = "#000";

        // Draw the main flat brim
        ctx.beginPath();
        ctx.ellipse(hX, base, brimWidth, 5, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // Draw the folded front part (the triangle look)
        ctx.beginPath();
        ctx.moveTo(hX - foldWidth, base);
        ctx.lineTo(hX, base - foldHeight);
        ctx.lineTo(hX + foldWidth, base);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Optional: Add a small skull or button in the middle
        ctx.fillStyle = "white";
        ctx.fillRect(hX - 1, base - 5, 2, 2);
    },
	"gentleman": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -7;      // Up/Down
        const brimSize = 18;    // Width of the brim
        const hatTall = 18;     // How high the hat goes (make it 50 for a crazy tall hat!)
        const hatWide = 12;     // How wide the top cylinder is
        const ribbonColor = "red";
        // ----------------
        const base = hY + offset;

        // 1. Draw the Brim
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(hX, base, brimSize, 4, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // 2. Draw the Cylinder
        ctx.fillRect(hX - hatWide, base - hatTall, hatWide * 2, hatTall);
        ctx.strokeRect(hX - hatWide, base - hatTall, hatWide * 2, hatTall);

        // 3. Draw the Ribbon (at the bottom of the cylinder)
        ctx.fillStyle = ribbonColor;
        ctx.fillRect(hX - hatWide, base - 5, hatWide * 2, 4);
    },
	"funhat": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -7;
        const brimSize = 18;
        const hatTall = 20;
        const hatWide = 12;
        const ribbonColor = "#cc0000"; // Red ribbon
        const patternType = "dots";    // OPTIONS: "none", "stripes", "dots"
        const patternColor = "rgba(255,255,255,0.3)"; // Subtle white
        // ----------------
        const base = hY + offset;

        // 1. Brim
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.ellipse(hX, base, brimSize, 4, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // 2. Main Hat Body
        ctx.fillRect(hX - hatWide, base - hatTall, hatWide * 2, hatTall);
        
        // --- PATTERN LOGIC ---
        ctx.save();
        ctx.clip(); // This keeps the pattern inside the hat body
        ctx.fillStyle = patternColor;
        if (patternType === "stripes") {
            for (let i = -hatWide; i < hatWide; i += 4) {
                ctx.fillRect(hX + i, base - hatTall, 2, hatTall);
            }
        } else if (patternType === "dots") {
            for (let i = -hatWide + 3; i < hatWide; i += 6) {
                ctx.beginPath(); ctx.arc(hX + i, base - (hatTall/2), 2, 0, Math.PI*2); ctx.fill();
            }
        }
        ctx.restore();

        // 3. Ribbon & Outline
        ctx.strokeRect(hX - hatWide, base - hatTall, hatWide * 2, hatTall);
        ctx.fillStyle = ribbonColor;
        ctx.fillRect(hX - hatWide, base - 6, hatWide * 2, 5);
    },
// ----------------------------------------------------------------
};
const CAPE_STYLES = {
    "cape": (ctx, p, bodyY, lean, item) => { // Paper Bag Style
		const headX = p.x + (lean * 20);
		const centerX = p.x + (lean * 10);
		ctx.fillStyle = item.color || "#550055";
		ctx.beginPath();
		ctx.moveTo(headX, p.y - 20 + bodyY); // Neck
		// Cape flares out behind
		ctx.quadraticCurveTo(headX - 25, p.y + 10 + bodyY, centerX - 15, p.y + 40 + bodyY);
		ctx.lineTo(centerX + 15, p.y + 40 + bodyY);
		ctx.quadraticCurveTo(headX + 25, p.y + 10 + bodyY, headX, p.y - 15 + bodyY);
		ctx.fill();
		ctx.strokeStyle = "rgba(0,0,0,0.3)";
		ctx.stroke();
    },
    "cloak": (ctx, p, bodyY, lean, item) => {// Paper Bag Style
		const headX = p.x + (lean * 20);
		const centerX = p.x + (lean * 10);
		ctx.fillStyle = item.color || "#550055";
		ctx.beginPath();
		ctx.moveTo(headX, p.y - 15 + bodyY); // Neck
		// Cape flares out behind
		ctx.quadraticCurveTo(headX - 25, p.y + 10 + bodyY, centerX - 15, p.y + 40 + bodyY);
		ctx.lineTo(centerX + 15, p.y + 40 + bodyY);
		ctx.quadraticCurveTo(headX + 25, p.y + 10 + bodyY, headX, p.y - 15 + bodyY);
		ctx.fill();
		ctx.strokeStyle = "rgba(0,0,0,0.3)";
		ctx.stroke();
	},
    "ballgown": (ctx, p, bodyY, lean, item) => {
		const headX = p.x + (lean * 20);
		const centerX = p.x + (lean * 10);
		ctx.fillStyle = item.color || "#550055";
		ctx.beginPath();
		ctx.moveTo(headX, p.y - 15 + bodyY); // Neck
		// Cape flares out behind
		ctx.quadraticCurveTo(headX - 25, p.y + 10 + bodyY, centerX - 15, p.y + 40 + bodyY);
		ctx.lineTo(centerX + 15, p.y + 40 + bodyY);
		ctx.quadraticCurveTo(headX + 25, p.y + 10 + bodyY, headX, p.y - 15 + bodyY);
		ctx.fill();
		ctx.strokeStyle = "rgba(0,0,0,0.3)";
		ctx.stroke();
	}
}
const BODY_PARTS = {
	     "stick": {
		head: (ctx, x, y, p) => {
            ctx.save();
            
            // 1. Fill the head with a faint version of p.color
            // This creates the "surface" for the eyes/mouth to sit on
            ctx.globalAlpha = 0.9; // 30% opacity
            ctx.fillStyle = p.color;
            ctx.beginPath(); 
            ctx.arc(x, y, 10, 0, Math.PI * 2); 
            ctx.fill();
            ctx.globalAlpha = 1.0;

            // 2. Draw the head outline (Stickman color)
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 3;
            ctx.beginPath(); 
            ctx.arc(x, y, 10, 0, Math.PI * 2); 
            ctx.stroke();

            // 3. Draw the Face features in Solid Black
            ctx.fillStyle = "#000000";
            ctx.strokeStyle = "#000000";
            ctx.lineWidth = 1; // Thinner lines for the smile

            // Eyes (Using your fillRect style)
            ctx.fillRect(x - 4, y - 3, 2, 2); // Left Eye
            ctx.fillRect(x + 2, y - 3, 2, 2); // Right Eye

            // Smile (Using your arc style)
            ctx.beginPath(); 
            ctx.arc(x, y + 2, 3, 0.1 * Math.PI, 0.9 * Math.PI); 
            ctx.stroke();

            ctx.restore();
        },
        torso: (ctx, hX, hY, bX, bY) => {
			// hY is head center, we start spine at neck (hY + 10)
			// bY is the hip position. We stop exactly there.
			ctx.beginPath(); 
			ctx.moveTo(hX, hY + 10); 
			ctx.lineTo(bX, bY); // REMOVED the extra +10 here
			ctx.stroke();
		},
        limbs: (ctx, startX, startY, endX, endY) => {
            ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
        }
    } 
/*     "stick": {
        head: (ctx, x, y, p) => {
            ctx.beginPath(); ctx.arc(x, y, 10, 0, Math.PI * 2); ctx.stroke();
            // Face
            ctx.fillStyle = p.color;
            ctx.fillRect(x + 2, y - 3, 2, 2); 
            ctx.fillRect(x + 6, y - 3, 2, 2); 
            ctx.beginPath(); ctx.arc(x + 4, y + 2, 3, 0, Math.PI); ctx.stroke();
        },
        torso: (ctx, hX, hY, bX, bY) => {
			// hY is head center, we start spine at neck (hY + 10)
			// bY is the hip position. We stop exactly there.
			ctx.beginPath(); 
			ctx.moveTo(hX, hY + 10); 
			ctx.lineTo(bX, bY); // REMOVED the extra +10 here
			ctx.stroke();
		},
        limbs: (ctx, startX, startY, endX, endY) => {
            ctx.beginPath(); ctx.moveTo(startX, startY); ctx.lineTo(endX, endY); ctx.stroke();
        }
    } */
    // You could add "chibi" or "armored" styles here later!
};
const POSE_LIBRARY = {
    "head_hands": (head) => ({
        left: { x: head.x - 12, y: head.y + 5 },
        right: { x: head.x + 12, y: head.y + 5 }
    }),
    "star": (head) => ({
        left: { x: head.x - 25, y: head.y - 10 },
        right: { x: head.x + 25, y: head.y - 10 }
    }),
    "action": (head, p, anim) => ({
        // Use head.x and head.y so the hand stays attached to the shoulder
        right: { x: head.x + 20 + (anim.lean * 10), y: head.y + 15 }
    }),
    "fishing": (head, p, anim) => ({
        // Fixed the double "right" and the missing parameter
        right: { x: head.x + 22, y: head.y + 15 }
    }),
	// NEW: Dynamic Swimming Pose
	"swimming": (head) => {
		// 1. Slower timing (divided by 600 instead of 200)
		const time = Date.now() / 600; 
		
		// 2. The 'swing' factor: goes from -1 to 1 and back
		const swing = Math.sin(time); 

		return {
			left: { 
				// Moves from head.x-30 to head.x (halfway)
				x: head.x - 15 + (swing * 15), 
				// Dips slightly as it strokes
				y: head.y + 25 + (Math.abs(swing) * 5) 
			},
			right: { 
				// Moves from head.x to head.x+30 (halfway)
				x: head.x + 15 - (swing * 15), 
				y: head.y + 25 + (Math.abs(swing) * 5)
			}
		};
	},
	"lurking": (head, p, anim) => {
    // A low, hunched-over posture
		const breathe = Math.sin(Date.now() / 1000) * 3;
		anim.bodyY = 10 + breathe; // Hunched down
		anim.lean = 0.4; // Leaning forward
		
		return {
			left:  { x: head.x - 10, y: head.y + 35 },
			right: { x: head.x + 5,  y: head.y + 30 }
		};
	}
};
