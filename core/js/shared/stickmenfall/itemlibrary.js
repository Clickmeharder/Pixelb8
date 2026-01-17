//=============================================================
/* ================= ITEM LIBRARY =========================== */
// fixes needed: bow currently looks like is held by the string. we want it to look like the player is holding the bow part.
const ITEM_DB = {
    // --- WEAPONS -----------------------------------------------------------------------------------
	// swords (melee)
	"Rusty Dagger":   { type: "weapon", style: "dagger", power: 5,  speed: 1000,  value: 40,   color: "#777" },
    "Iron Sword":     { type: "weapon", style: "sword", power: 12, speed: 2500,  value: 200,  color: "#eee" },
	// Bows (archery)
	"shortbow":{ type: "weapon", style: "bow", power: 5,  speed: 1250,  value: 30,   color: "#eee" },
    "Shitty Shortbow":{ type: "bow", style: "bow", power: 8,  speed: 1000,  value: 100,  color: "#eee" },
    "Wooden Shortbow":{ type: "bow", style: "bow", power: 5,  speed: 1250,  value: 30,   color: "#d2b48c" },
    "Oak Shortbow":{ type: "bow", style: "bow", power: 8,  speed: 1000,  value: 100,  color: "#d2b48c" },
	//Stalves (magic)
	"Wooden Staff":   { type: "staff", color: "#00ffcc", poleColor: "#5d4037", power: 5, speed: 2000,  value: 40  },
	"Styled Staff":   { type: "staff", style:"staff", color: "#00ffcc", poleColor: "#5d4037", power: 5, speed: 2000,  value: 40  },
// -------------------------- TOOLS --------------------------------------------------------------------
    "Fishing Rod":    { type: "tool", style:"", power: 0, value: 1,   color: "#8B4513" },
// ------------------------- Helmets and Hats ----------------------------------------------------------
	// --- Helmets     ---
    "Viking Helm":    { type: "helmet", style: "viking", def: 4,  value: 400,  color: "#888" },
    "Great Horns":    { type: "helmet", style: "horns", def: 6,  value: 1200, color: "#FFD700" }, // Gold Viking horns!
	"Steel Helmet":    { type: "helmet",style: "knight", def: 5, value: 150, color: "#eee" },
	"Iron Helmet":    { type: "helmet",style: "knight", def: 5, value: 150, color: "#aaa" },
	//---Wizard Hats   ---
    "Apprentice Hat": { type: "helmet", style: "wizard", def: 1,  value: 150,  color: "#303f9f" },
    "Archmage Point": { type: "helmet", style: "wizard", def: 3,  value: 5000, color: "#4a148c" },
	//--- Lurker Hoods ---
	"Lurker Hood":  { type: "hood", style: "hood",                            value: 100, color: "#555" },
    "Assassin Hood":  { type: "hood", style: "hood",                            value: 100, color: "#222" },
//------------------------------------------------------------------------------------------------------
// --------------------------- ARMOR/SHIRT -------------------------------------------------------------
	// --- archer
    "Leather Tunic":  { type: "armor", style:"",  def: 2,                  value: 60,   color: "#5c4033" },
	// --- melee
	"Iron Plate":     { type: "armor", style:"",  def: 5,                  value: 300,  color: "#aaa" },
	// --- magic
	// --- fisher
	// --- lumberjack
	// --- miner 
	//
//------------------------------------------------------------------------------------------------------
// ------------------------------PANTS------------------------------------------------------------------
	// --- archer
    "Leather Pants":  { type: "pants", style:"", def :2, value: 100,color: "#3e2723" },
	// --- archer
//------------------------------------------------------------------------------------------------------
// ------------------------------Boots------------------------------------------------------------------
    "leather Boots":  { type: "boots", style:"", def: 1,                 value: 30,   color: "#5c4033" },
    "leather Booties":{ type: "boots", style:"", def: 1,                 value: 35,   color: "#5c4033" },
//------------------------------------------------------------------------------------------------------

// ------------------------------Gloves------------------------------------------------------------------
    "White Gloves":   { type: "gloves", style:"", value: 100, color: "#ffffff" },
	"leather Gloves":   { type: "gloves", style:"", value: 100, color: "#5c4033" },
    // --- SPECIALS ---
// special head
	"Paper Bag":      { type: "helmet", style: "box", def: 1, value: 5, color: "#d2b48c" },
	"wig":            { type: "helmet", style:"", def: 1,style: "wig",     value: 5000, color: "yellow" },
    "Royal Crown":    { type: "helmet", style: "crown",  def: 2,  value: 10000, color: "#ff0000" },
	"uknown":    { type: "helmet", style: "centurion",  def: 2,  value: 10000, color: "#ffcc00" },
	"Pirate Hat":    { type: "helmet", style: "pirate",  def: 2,  value: 10000, color: "#222222" },
	"gentleman hat":    { type: "helmet", style: "gentleman",  def: 2,  value: 10000, color: "#333333" },
	"fun hat":    { type: "helmet", style: "funhat",  def: 2,  value: 10000, color: "white" },
	"kabuto":    { type: "helmet", style: "samurai",  def: 2,  value: 10000, color: "#8B0000" },
	"stickmenpo":    { type: "helmet", style: "menpo",  def: 2,  value: 10000, color: "#8B0000" },
// special capes
    "Royal Cape":     { type: "cape", style:"", color: "#880000", value: 10000 },
    "Cloak":     { type: "cape", style:"", color: "#880000", value: 10000 },
    "Ball gown":     { type: "cape", style:"", color: "#880000", value: 10000 },
    "Angelic Ring":   { type: "helmet", style: "halo",   def: 0,  value: 9999, color: "yellow" },
    "hair1":     { type: "hair", style: "hair",   value: 5, color: "#ffff00" },//spiky hair
	"hair2": { type: "hair", style: "spiky", color: "#f3e5ab" },//"spiky blonde hair"
	"hair3": { type: "hair", style: "mohawk", color: "#ff69b4" },// pink mohawk
	"hair4": { type: "hair", style: "ponytail", color: "#222222" },// ponytail
	"hair5": { type: "hair", style: "bob", color: "#4b3621" },// bob hair
	"hair6": { type: "hair", style: "pigtails", color: "#4b3621" },// pigtails hair
// special weapon/tool
//    "Paint Brush":     { type: "hair",   style: "hair",   value: 5, color: "#ffff00" },
    // Legacy support (still works without a style property - just defaults to type)
// ---------------------------basic items----------------------------------------------------------------
	// --- unique fish ---
	"Golden Bass":    { type: "fish", value: 100, color: "#FFD700" },
    // --- MATERIALS ---
    "Leather scrap":  { type: "material", value: 15,   color: "#a88d6d" },
//-------------------------------------------------------------------------------------------------------
};
/* ================= EXTENDED ITEM LIBRARY ================= */
const DANCE_UNLOCKS = {
    1: { name: "The Squat", minLvl: 1 },
    2: { name: "The Flail", minLvl: 5 },
    3: { name: "The Lean",  minLvl: 1 },
    4: { name: "The Op-Pa", minLvl: 1 },
	5: { name: "The 99", minLvl: 1 },// Fixed to 20 to match your level-up logic
    6: { name: "The sixthdance", minLvl: 1 },
    7: { name: "The seventhdance", minLvl: 1 },
    8: { name: "The eigthdance",  minLvl: 1 },
    9: { name: "The ninthdance", minLvl: 1 },
	10: { name: "The tenthdance", minLvl: 1 }
};

const DANCE_LIBRARY = {
    1: (now) => ({ bodyY: Math.sin(now / 100) * 8 }), // The Squat
    2: (now) => ({ armMove: Math.sin(now / 50) * 20 }), // The Flail
    3: (now) => ({ lean: Math.sin(now / 200) * 0.6 }), // The Lean
    4: (now) => ({ 
        bodyY: Math.abs(Math.sin(now / 150)) * -15,
        armMove: Math.sin(now / 150) * 5,
        pose: "head_hands" 
    }),
    5: (now, p) => { 
        let bY = Math.min(0, Math.sin(now / 200) * -50); 
        if (bY > -1 && p.wasInAir) {
            spawnArrow(p.x, p.y + 25, p.x + 60, p.y + 25);
            spawnArrow(p.x, p.y + 25, p.x - 60, p.y + 25);
            p.wasInAir = false;
        }
        if (bY < -5) p.wasInAir = true;
        return { bodyY: bY, lean: 0, pose: "action" };
    },
    6: (now) => ({ bodyY: Math.sin(now / 75) * 4 }), // The Bop
    7: (now) => ({ armMove: Math.sin(now / 50) * 50 }), // The Wave
    8: (now) => ({ lean: Math.sin(now / 200) * 0.1 }), // The Sway
    9: (now) => ({ 
        bodyY: Math.min(0, Math.sin(now / 150) * -25),
        armMove: Math.sin(now / 150) * 5,
        pose: "star" 
    }),
    10: (now) => ({ 
        bodyY: Math.min(0, Math.sin(now / 200) * -40),
        lean: Math.sin(now / 200) * 0.2,
        pose: "action"
    })
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

    "bow": (ctx, item, isAttacking, now) => {
		// 1. Rotation: Tilt the bow
		ctx.rotate(isAttacking ? -0.6 : Math.PI / 7);

		// 2. The Bow Body (The Wood)
		ctx.strokeStyle = item.color || "#8B4513";
		ctx.lineWidth = 3;
		ctx.beginPath(); 
		/* We center the arc at (-15, 0) with a radius of 15.
		   This means the right-most edge of the arc is exactly at (0, 0).
		   Now the hand (0,0) is holding the wooden belly!
		*/
		ctx.arc(-15, 0, 15, -Math.PI / 2, Math.PI / 2, false); 
		ctx.stroke();

		// 3. The Grip (Drawn right on the hand at 0,0)
		ctx.strokeStyle = "#5d4037";
		ctx.lineWidth = 4;
		ctx.beginPath(); 
		ctx.moveTo(0, -3); 
		ctx.lineTo(0, 3); 
		ctx.stroke();

		// 4. The Bowstring
		ctx.strokeStyle = "rgba(255,255,255,0.7)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		
		// The string tips are at the ends of the arc (x: -15, y: +/-15)
		ctx.moveTo(-15, -15); 

		if (isAttacking) {
			// Pull the string back AWAY from the wood
			// Since wood is at -15, pulling to -25 or -30 looks like a heavy draw
			ctx.lineTo(-30, 0); 
		} else {
			// String is resting straight between the tips
			ctx.lineTo(-15, 0); 
		}
		
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
	// WIG IS SPECIAL ITS A HELMET NOT HAIR AND CAN BE COLORED BY ANY USER WITH A COMMAND
    "wig": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = 0;
        const thickness = 6;
        const length = 18;
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.strokeStyle = color;
        ctx.beginPath(); ctx.arc(hX, top, 13, 0.1 * Math.PI, 0.9 * Math.PI); ctx.lineWidth = thickness; ctx.stroke();
        ctx.beginPath(); ctx.arc(hX, top - 2, 11, Math.PI, 0); ctx.fill();
        ctx.lineWidth = 5; ctx.beginPath();
        ctx.moveTo(hX - 10, top - 2); ctx.quadraticCurveTo(hX - 14, top + 10, hX - 11, top + length);
        ctx.moveTo(hX + 10, top - 2); ctx.quadraticCurveTo(hX + 14, top + 10, hX + 11, top + length); ctx.stroke();
    },
// HAIR STYLES-----------------------------------------------------
"hair": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -6;      // Up/Down
        const width = 12;       // Scalp width
        const spikeCount = 5;   
        const spikeH = 6;       // Height of hair spikes
        const sideDrop = 6;     // How far hair comes down the ears
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(hX - width, top + sideDrop);
        for (let i = 0; i <= spikeCount; i++) {
            let x = hX - width + (i * (width * 2 / spikeCount));
            let y = top - (i % 2 === 0 ? spikeH : 2);
            ctx.lineTo(x, y);
        }
        ctx.lineTo(hX + width, top + sideDrop);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.stroke();
    },

    // 2. LIBERTY SPIKES (Wilder/Sharper)
    "spiky": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -7;
        const width = 13;
        const numSpikes = 7;
        const spikeH = 10;
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(hX - width, top + 4);
        for (let i = 0; i <= numSpikes; i++) {
            let x = hX - width + (i * (width * 2 / numSpikes));
            let y = top - spikeH;
            ctx.lineTo(x, y);
            if(i < numSpikes) ctx.lineTo(x + (width/numSpikes), top - 2);
        }
        ctx.lineTo(hX + width, top + 4);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.stroke();
    },

    // 3. MOHAWK
    "mohawk": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -9;
        const mWidth = 6;       // Thickness of the hawk
        const mHeight = 14;      // Height of the hawk
        const lean = 2;         // Tilted back slightly
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(hX - lean, top + 3, mWidth, mHeight, 0, Math.PI, 0);
        ctx.lineTo(hX + mWidth, top + 5);
        ctx.lineTo(hX - mWidth, top + 5);
        ctx.closePath();
        ctx.fill(); ctx.stroke();
    },

    // 4. PONYTAIL (With Natural Sway)
    "ponytail": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -5;
        const pLen = 22;        // Length of tail
        const pThick = 6;       // Thickness of tail
        // Natural swaying math (Slowed down from 200 to 450)
        const sway = Math.sin(Date.now() / 450) * 2.5; 
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;

        // Scalp
        ctx.beginPath(); ctx.arc(hX, top, 11, Math.PI, 0); ctx.fill();

        // The Tail
        ctx.beginPath();
        ctx.moveTo(hX - 6, top + 2);
        ctx.quadraticCurveTo(hX - 12 + sway, top + 10, hX - 8 + (sway * 1.5), top + pLen);
        ctx.lineTo(hX - 8 + pThick + (sway * 1.5), top + pLen);
        ctx.quadraticCurveTo(hX - 8 + sway, top + 10, hX, top + 4);
        ctx.fill();
    },

    // 5. BOB HAIR
    "bob": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -4;
        const bWidth = 13;      // Volume of the bob
        const bLength = 14;     // How far down it goes
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(hX, top, bWidth, Math.PI, 0);
        ctx.lineTo(hX + bWidth, top + bLength);
        ctx.lineTo(hX + 6, top + bLength - 4); // Face cutout
        ctx.lineTo(hX - 6, top + bLength - 4); 
        ctx.lineTo(hX - bWidth, top + bLength);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.1)"; ctx.stroke();
    },

    // 6. PIGTAILS (Subtle Bounce)
    "pigtails": (ctx, hX, hY, color) => {
        // --- SETTINGS ---
        const offset = -5;
        const tiePos = 11;      // Distance from center
        const tLen = 16;        // Tail length
        const tThick = 5;       // Tail thickness
        // Subtle bounce math (Slowed down from 150 to 500)
        const bounce = Math.sin(Date.now() / 500) * 2;
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;

        // Scalp
        ctx.beginPath(); ctx.arc(hX, top, tiePos, Math.PI, 0); ctx.fill();

        // Left Tail
        ctx.beginPath();
        ctx.moveTo(hX - tiePos, top + 2);
        ctx.quadraticCurveTo(hX - tiePos - 6 + bounce, top + 6, hX - tiePos + bounce, top + tLen);
        ctx.lineTo(hX - tiePos + tThick + bounce, top + tLen);
        ctx.quadraticCurveTo(hX - tiePos + 2 + bounce, top + 6, hX - tiePos + 2, top + 2);
        ctx.fill();

        // Right Tail
        ctx.beginPath();
        ctx.moveTo(hX + tiePos, top + 2);
        ctx.quadraticCurveTo(hX + tiePos + 6 - bounce, top + 6, hX + tiePos - bounce, top + tLen);
        ctx.lineTo(hX + tiePos - tThick - bounce, top + tLen);
        ctx.quadraticCurveTo(hX + tiePos - 2 - bounce, top + 6, hX + tiePos - 2, top + 2);
        ctx.fill();
    }
};
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
        const offset = 0;
        const faceVisible = 10; // Depth of the side guards
        // ----------------
        const top = hY + offset;
        ctx.fillStyle = color;
        ctx.beginPath(); ctx.arc(hX, top, 12, Math.PI, 0); 
        ctx.lineTo(hX + 12, top + faceVisible); ctx.lineTo(hX - 12, top + faceVisible); ctx.closePath();
        ctx.fill(); ctx.stroke();
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
		ctx.moveTo(headX, p.y - 15 + bodyY); // Neck
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
    }
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
    })
};
