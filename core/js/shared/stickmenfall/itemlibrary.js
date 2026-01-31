const CUSTOM_ASSETS = {
    weapons: {},
    hats: {},
    monsters: {}
};
//=============================================================
/* ================= ITEM LIBRARY =========================== */
// fixes needed: bow currently looks like is held by the string. we want it to look like the player is holding the bow part.
/* --- DUNGEON LOOT RARITY MAP (Formula: roll^4 * 14) ---
   Normal Mobs follow the Standard Map. Bosses get a +3 Rarity Floor.

   [ NORMAL MOB CHANCES ]
   RARITY 0-5  (Common/Uncommon): ~80% chance 
   RARITY 6-9  (Rare/Epic):       ~12% chance  --> [Spawns Loot Beam @ 8+]
   RARITY 10-13(Legendary/Godly): ~8%  chance  --> [Spawns Loot Beam]

   [ BOSS MOB CHANCES ] (Includes +3 Rarity Bonus)
   RARITY 3-8  (Uncommon/Epic):   ~80% chance  --> [Harder to get "trash"]
   RARITY 9-12 (Legendary):       ~15% chance 
   RARITY 13   (Godly):           ~5%  chance  --> [Max Rarity capped at 13]

   TIER GATING:
   Items are locked by (Wave - 1 / 5) + 1. 
   Wave 1-5:   Tier 1  |  Wave 6-10:  Tier 2
   Wave 11-15: Tier 3  |  Wave 16-20: Tier 4 ... and so on.
   
   GEAR STEALING:
   Independent 10% chance to steal EACH item a mob is wearing before 
   the rarity roll even happens.
*/
const ITEM_DB = {
    // --- WEAPONS -----------------------------------------------------------------------------------

// -------------------------- TOOLS --------------------------------------------------------------------
    
// ------------------------- Helmets and Hats ----------------------------------------------------------

// --- HEAVY HELMETS (KNIGHT/VIKING) ---
	"Bucket":            { type: "helmet", skill: "attack", style: "knight", sources:"dungeon", tier: 1,  rarity: 0,  def: 1,  value: 30,     color: "#999" },
	"Copper Basin":      { type: "helmet", skill: "attack", style: "knight", sources:"dungeon", tier: 2,  rarity: 1,  def: 3,  value: 100,    color: "#b87333" },
	"Iron Helmet":       { type: "helmet", skill: "attack", style: "knight", sources:"dungeon", tier: 3,  rarity: 2,  def: 5,  value: 150,    color: "#aaa" },
	"Viking Helm":       { type: "helmet", skill: "attack", style: "viking", sources:"dungeon", tier: 4,  rarity: 4,  def: 7,  value: 400,    color: "#888" },
	"Steel Helmet":      { type: "helmet", skill: "attack", style: "knight", sources:"dungeon", tier: 5,  rarity: 5,  def: 9,  value: 1000,   color: "#eee" },
	"Great Horns":       { type: "helmet", skill: "attack", style: "horns",  sources:"dungeon",  tier: 6,  rarity: 7,  def: 12, value: 3500,   color: "#FFD700" },
	"Paladin Visor":     { type: "helmet", skill: "attack", style: "knight", sources:"dungeon", tier: 7,  rarity: 8,  def: 18, value: 12000,  color: "#fff" },
	"Dragonscale Helm":  { type: "helmet", skill: "attack", style: "viking", sources:"dungeon", tier: 8,  rarity: 10, def: 25, value: 45000,  color: "#ff5722" },
	"Titan Faceplate":   { type: "helmet", skill: "attack", style: "knight", sources:"dungeon", tier: 9,  rarity: 11, def: 35, value: 120000, color: "#7e57c2" },
	"Dreadnought Crown": { type: "helmet", skill: "attack", style: "knight", sources:"dungeon", tier: 10, rarity: 12, def: 50, value: 300000, color: "#ff1744" },
	"The Iron God":      { type: "helmet", skill: "attack", style: "knight", sources:"dungeon", tier: 11, rarity: 13, def: 75, value: 750000, color: "#ffffff" },
// --- WIZARD HATS ---
	"Cloth Hat":         { type: "helmet", skill: "magic", style: "wizard", sources:"dungeon", tier: 1,  rarity: 1,  def: 0,  value: 50,     color: "#90caf9" },
	"Cool Hat":          { type: "helmet", skill: "magic", style: "wizard", sources:"dungeon", tier: 2,  rarity: 3,  def: 1,  value: 150,    color: "#303f9f" },
	"Magic Hat":         { type: "helmet", skill: "magic", style: "wizard", sources:"dungeon", tier: 3,  rarity: 4,  def: 2,  value: 400,    color: "#5c6bc0" },
	"Wizard Hat":        { type: "helmet", skill: "magic", style: "wizard", sources:"dungeon", tier: 4,  rarity: 5,  def: 3,  value: 5000,   color: "#4a148c" },
	"Archmage Hat":      { type: "helmet", skill: "magic", style: "wizard", sources:"dungeon", tier: 5,  rarity: 7,  def: 4,  value: 12000,  color: "#7b1fa2" },
	"Elementalist Hat":  { type: "helmet", skill: "magic", style: "wizard", sources:"dungeon", tier: 6,  rarity: 8,  def: 6,  value: 25000,  color: "#e53935" },
	"Void Hat":          { type: "helmet", skill: "magic", style: "wizard", sources:"dungeon", tier: 7,  rarity: 9,  def: 9,  value: 55000,  color: "#311b92" },
	"Star Hat":          { type: "helmet", skill: "magic", style: "wizard", sources:"dungeon", tier: 8,  rarity: 10, def: 13, value: 110000, color: "#00e5ff" },
	"Nebula Hat":        { type: "helmet", skill: "magic", style: "wizard", sources:"dungeon", tier: 9,  rarity: 11, def: 18, value: 240000, color: "#ea80fc" },
	"Nebula Crown":      { type: "helmet", skill: "magic", style: "crown",  sources:"dungeon", tier: 9,  rarity: 13, def: 18, value: 1000000, color: "#ea80fc" },
	"Reality Peak":      { type: "helmet", skill: "magic", style: "wizard", sources:"dungeon", tier: 10, rarity: 12, def: 25, value: 500000, color: "#ffd600" },
	"Eye of the Cosmos": { type: "helmet", skill: "magic", style: "wizard", sources:"dungeon", tier: 11, rarity: 13, def: 40, value: 1200000,color: "#ffffff" },
// --- LURKER HOODS ---
	"Dirty Rag":         { type: "helmet", skill: "lurk", style: "hood", sources:"dungeon", tier: 1,  rarity: 0,  def: 0,  value: 20,    color: "#555" },
	"Bandit Hood":       { type: "helmet", skill: "lurk", style: "hood", sources:"dungeon", tier: 2,  rarity: 2,  def: 1,  value: 120,   color: "#333" },
	"Thief Hood":        { type: "helmet", skill: "lurk", style: "hood", sources:"dungeon", tier: 3,  rarity: 3,  def: 2,  value: 300,   color: "#444" },
	"Rogue Hood":        { type: "helmet", skill: "lurk", style: "hood", sources:"dungeon", tier: 4,  rarity: 4,  def: 3,  value: 800,   color: "#222" },
	"Cool Hood":         { type: "helmet", skill: "lurk", style: "hood", sources:"dungeon", tier: 5,  rarity: 5,  def: 4,  value: 2000,  color: "#777" },
	"Stalker Hood":      { type: "helmet", skill: "lurk", style: "hood", sources:"dungeon", tier: 6,  rarity: 6,  def: 6,  value: 5000,  color: "#555" },
	"Dark Hood":         { type: "helmet", skill: "lurk", style: "hood", sources:"dungeon", tier: 7,  rarity: 7,  def: 8,  value: 15000, color: "#333" },
	"Lurker Hood":       { type: "helmet", skill: "lurk", style: "hood", sources:"dungeon", tier: 8,  rarity: 10, def: 11, value: 40000, color: "#222" },
	"Assassin Hood":     { type: "helmet", skill: "lurk", style: "hood", sources:"dungeon", tier: 9,  rarity: 11, def: 15, value: 95000, color: "#b71c1c" },
	"Phantom Hood":      { type: "helmet", skill: "lurk", style: "hood", sources:"dungeon", tier: 10, rarity: 12, def: 22, value: 210000,color: "#9e9e9e" },
	"Shadow Hood":       { type: "helmet", skill: "lurk", style: "hood", sources:"dungeon", tier: 11, rarity: 13, def: 35, value: 550000,color: "#000000" },
//------------------------------------------------------------------------------------------------------
// --------------------------- ARMOR/SHIRT -------------------------------------------------------------
	// --- shirts
	"White Shirt":   { type: "armor", style:"", sources:"dungeon", tier: 11, rarity: 1, def: 5, value: 200,   color: "red" },
	"Black Shirt":   { type: "armor", style:"", sources:"dungeon", tier: 10, rarity: 1, def: 5, value: 200,   color: "red" },
    "Red Shirt":     { type: "armor", style:"", sources:"dungeon", tier: 9, rarity: 1, def: 5,  value: 90,   color: "red" },
	"Pink Shirt":    { type: "armor", style:"", sources:"dungeon", tier: 8, rarity: 1, def: 4,  value: 80,   color: "pink" },
	"Brown Shirt":   { type: "armor", style:"", sources:"dungeon", tier: 7, rarity: 1, def: 1,  value: 30,   color: "brown" },
	"Green Shirt":   { type: "armor", style:"", sources:"dungeon", tier: 6, rarity: 1, def: 1,  value: 50,   color: "green" },
	"Orange Shirt":  { type: "armor", style:"", sources:"dungeon", tier: 5, rarity: 1, def: 0,  value: 70,   color: "orange" },
	"Yellow Shirt":  { type: "armor", style:"", sources:"dungeon", tier: 4, rarity: 1, def: 0,  value: 60,   color: "yellow" },
	"Blue Shirt":    { type: "armor", style:"", sources:"dungeon", tier: 3, rarity: 1, def: 0,  value: 40,   color: "blue" },
	"Indigo Shirt":  { type: "armor", style:"", sources:"dungeon", tier: 2, rarity: 1, def: 0,  value: 20,   color: "indigo" },
	"Violet Shirt":  { type: "armor", style:"", sources:"dungeon", tier: 1, rarity: 1, def: 0,  value: 10,   color: "violet" },
	// --- lumberjack
	// --- miner 
	// -- fisher
//------------------------------------------------------------------------------------------------------
// ------------------------------PANTS------------------------------------------------------------------
	// --- Pants
	"White Pants":  { type: "pants", style:"", sources:"dungeon", tier: 11, rarity: 1,  def: 5,                  value: 200,   color: "red" },
	"Black Pants":  { type: "pants", style:"", sources:"dungeon", tier: 10, rarity: 1,  def: 5,                  value: 200,   color: "red" },
    "Red Pants":    { type: "pants", style:"", sources:"dungeon", tier: 9, rarity: 1,  def: 5,                  value: 90,   color: "red" },
	"Pink Pants":   { type: "pants", style:"", sources:"dungeon", tier: 8, rarity: 1,  def: 4,                  value: 80,   color: "pink" },
	"Brown Pants":  { type: "pants", style:"", sources:"dungeon", tier: 7, rarity: 1, def: 1,                  value: 30,   color: "brown" },
	"Green Pants":  { type: "pants", style:"", sources:"dungeon", tier: 6, rarity: 1, def: 1,                  value: 50,   color: "green" },
	"Orange Pants": { type: "pants", style:"", sources:"dungeon", tier: 5, rarity: 1, def: 0,                  value: 70,   color: "orange" },
	"Yellow Pants": { type: "pants", style:"", sources:"dungeon", tier: 4, rarity: 1, def: 0,                  value: 60,   color: "yellow" },
	"Blue Pants":   { type: "pants", style:"", sources:"dungeon", tier: 3, rarity: 1, def: 0,                  value: 40,   color: "blue" },
	"Indigo Pants": { type: "pants", style:"", sources:"dungeon", tier: 2, rarity: 1, def: 0,                  value: 20,   color: "indigo" },
	"Violet Pants": { type: "pants", style:"", sources:"dungeon", tier: 1, rarity: 1, def: 0,                  value: 10,   color: "violet" },
//
//					--- WEAPONS (11 tiers) ---
// --- SWORDS (MELEE) ---
	"Rusty Dagger":       { type: "weapon", style: "dagger", sources:"dungeon", tier: 1,  rarity: 0,  power: 5,   speed: 1500, value: 40,     color: "#777" },
	"Iron Sword":         { type: "weapon", style: "sword",  sources:"dungeon", tier: 2,  rarity: 1,  power: 12,  speed: 1400, value: 200,    color: "#eee" },
	"Steel Sword":        { type: "weapon", style: "sword",  sources:"dungeon", tier: 3,  rarity: 2,  power: 18,  speed: 1300, value: 800,    color: "#999" },
	"Flanged Mace":       { type: "weapon", style: "sword",  sources:"dungeon", tier: 4,  rarity: 4,  power: 25,  speed: 1500, value: 2500,   color: "#bbb" },
	"Golden Sword":       { type: "weapon", style: "sword",  sources:"dungeon", tier: 5,  rarity: 5,  power: 35,  speed: 1400, value: 10000,  color: "#ffd700" },
	"Great Sword":        { type: "weapon", style: "sword",  sources:"dungeon", tier: 6,  rarity: 7,  power: 50,  speed: 1800, value: 25000,  color: "#888" },
	"Cobalt Claymore":    { type: "weapon", style: "sword",  sources:"dungeon", tier: 7,  rarity: 8,  power: 65,  speed: 1600, value: 50000,  color: "#1976d2" },
	"Mythril Blade":      { type: "weapon", style: "sword",  sources:"dungeon", tier: 8,  rarity: 10, power: 85,  speed: 1400, value: 100000, color: "#4fc3f7" },
	"Dragon-Bone Smasher":{ type: "weapon", style: "sword",  sources:"dungeon", tier: 9,  rarity: 11, power: 120, speed: 2000, value: 250000, color: "#fff9c4" },
	"World-Eater Blade":  { type: "weapon", style: "sword",  sources:"dungeon", tier: 10, rarity: 12, power: 180, speed: 1700, value: 500000, color: "#ff1744" },
	"Infinity Edge":      { type: "weapon", style: "sword",  sources:"dungeon", tier: 11, rarity: 13, power: 250, speed: 1200, value: 1000000,color: "#ffffff" },
// --- BOWS (ARCHERY) ---
	"Shitty Shortbow":   { type: "bow", style: "bow", sources:"dungeon", tier: 1,  rarity: 0,  power: 4,   speed: 800,  value: 40,     color: "#a1887f" },
	"Recurve Bow":       { type: "bow", style: "bow", sources:"dungeon", tier: 2,  rarity: 1,  power: 10,  speed: 1000, value: 250,    color: "#8d6e63" },
	"Oak Longbow":       { type: "bow", style: "bow", sources:"dungeon", tier: 3,  rarity: 2,  power: 16,  speed: 1200, value: 900,    color: "#d2b48c" },
	"Hunter's Crossbow": { type: "bow", style: "bow", sources:"dungeon", tier: 4,  rarity: 4,  power: 24,  speed: 1500, value: 3000,   color: "#795548" },
	"Elven Windbow":     { type: "bow", style: "bow", sources:"dungeon", tier: 5,  rarity: 6,  power: 32,  speed: 900,  value: 12000,  color: "#8bc34a" },
	"Eagle-Eye Bow":     { type: "bow", style: "bow", sources:"dungeon", tier: 6,  rarity: 7,  power: 45,  speed: 1100, value: 28000,  color: "#fff176" },
	"Shadow-String":     { type: "bow", style: "bow", sources:"dungeon", tier: 7,  rarity: 9,  power: 60,  speed: 1000, value: 55000,  color: "#4a148c" },
	"Crystal Piercer":   { type: "bow", style: "bow", sources:"dungeon", tier: 8,  rarity: 10, power: 80,  speed: 900,  value: 110000, color: "#00e5ff" },
	"Dragon-Breath Bow": { type: "bow", style: "bow", sources:"dungeon", tier: 9,  rarity: 11, power: 110, speed: 1300, value: 280000, color: "#ff5722" },
	"Void-Reaver Bow":   { type: "bow", style: "bow", sources:"dungeon", tier: 10, rarity: 12, power: 160, speed: 1100, value: 550000, color: "#aa00ff" },
	"Apollo's Will":     { type: "bow", style: "bow", sources:"dungeon", tier: 11, rarity: 13, power: 220, speed: 800,  value: 1200000,color: "#ffd600" },
// --- STAVES (MAGIC) ---
	"Twisted Branch":    { type: "staff", style:"staff", sources:"dungeon",  tier: 1,  rarity: 0,  power: 6,   speed: 1200, heal: 0, value: 50,    color: "#fff", poleColor: "#5d4037" },
	"Apprentice Wand":   { type: "staff", style:"staff", sources:"dungeon",  tier: 2,  rarity: 1,  power: 14,  speed: 1000, heal: 0, value: 300,   color: "#90caf9", poleColor: "#8d6e63" },
	"Wooden Staff":      { type: "staff", style:"staff", sources:"dungeon",  tier: 3,  rarity: 2,  power: 6,  speed: 1400, heal: 5, value: 1000,  color: "#fff", poleColor: "#5d4037" },
	"Acolyte's Pillar":  { type: "staff", style:"staff", sources:"dungeon",  tier: 4,  rarity: 4,  power: 30,  speed: 1600, heal: 5, value: 3500,  color: "#9c27b0", poleColor: "#4a148c" },
	"Styled Staff":      { type: "staff", style:"staff", sources:"dungeon", tier: 5,  rarity: 6,  power: 42,  speed: 1300, heal: 5, value: 15000, color: "#00ffcc", poleColor: "#004d40" },
	"Volcano Scepter":   { type: "staff", style:"staff", sources:"dungeon", tier: 6,  rarity: 7,  power: 60,  speed: 1800, heal: 6, value: 32000, color: "#ff1744", poleColor: "#3e2723" },
	"Glacial Spike":     { type: "staff", style:"staff", sources:"dungeon", tier: 7,  rarity: 9,  power: 75,  speed: 1500, heal: 7, value: 65000, color: "#80d8ff", poleColor: "#01579b" },
	"Staff of Ruin":     { type: "staff", style:"staff", sources:"dungeon", tier: 8,  rarity: 10, power: 100, speed: 1400, heal: 8, value: 130000,color: "#673ab7", poleColor: "#212121" },
	"Celestial Pole":    { type: "staff", style:"staff", sources:"dungeon", tier: 9,  rarity: 11, power: 140, speed: 1200, heal: 9, value: 300000,color: "#e1f5fe", poleColor: "#b3e5fc" },
	"Abyssal Eye":       { type: "staff", style:"staff", sources:"dungeon", tier: 10, rarity: 12, power: 200, speed: 1100, heal: 10, value: 600000,color: "#ff00ff", poleColor: "#000" },
	"The Origin Point":  { type: "staff", style:"staff", sources:"dungeon", tier: 11, rarity: 13, power: 300, speed: 900, heal: 15, value: 1500000,color: "#fff", poleColor: "#ffd600" },

// --- ARCHER GEAR (11 TIERS) ---
	"Leather Vest":       { type: "armor", skill:"archer", sources:"dungeon", tier: 1,  rarity: 1,  def: 2,  value: 60,    color: "#5c4033" },
	"Leather Pants":      { type: "pants", skill:"archer", sources:"dungeon", tier: 1,  rarity: 1,  def: 1,  value: 40,    color: "#3e2723" },
	"Studded Vest":       { type: "armor", skill:"archer", sources:"dungeon", tier: 2,  rarity: 2,  def: 4,  value: 200,   color: "#795548" },
	"Studded Pants":      { type: "pants", skill:"archer", sources:"dungeon", tier: 2,  rarity: 2,  def: 2,  value: 150,   color: "#5d4037" },
	"Hunter Tunic":       { type: "armor", skill:"archer", sources:"dungeon", tier: 3,  rarity: 3,  def: 6,  value: 500,   color: "#2e7d32" },
	"Hunter Pants":       { type: "pants", skill:"archer", sources:"dungeon", tier: 3,  rarity: 3,  def: 4,  value: 400,   color: "#1b5e20" },
	"Hardleather Vest":   { type: "armor", skill:"archer", sources:"dungeon", tier: 4,  rarity: 4,  def: 8,  value: 1000,  color: "#a1887f" },
	"Hardleather Pants":  { type: "pants", skill:"archer", sources:"dungeon", tier: 4,  rarity: 4,  def: 6,  value: 800,   color: "#8d6e63" },
	"Ranger Tunic":       { type: "armor", skill:"archer", sources:"dungeon", tier: 5,  rarity: 5,  def: 11, value: 2500,  color: "#4caf50" },
	"Ranger Pants":       { type: "pants", skill:"archer", sources:"dungeon", tier: 5,  rarity: 5,  def: 8,  value: 2000,  color: "#388e3c" },
	"Wild Tunic":         { type: "armor", skill:"archer", sources:"dungeon", tier: 6,  rarity: 6,  def: 15, value: 5000,  color: "#8bc34a" },
	"Wild Pants":         { type: "pants", skill:"archer", sources:"dungeon", tier: 6,  rarity: 6,  def: 11, value: 4000,  color: "#689f38" },
	"Sky-Stalker Tunic":  { type: "armor", skill:"archer", sources:"dungeon", tier: 7,  rarity: 8,  def: 20, value: 12000, color: "#80deea" },
	"Sky-Stalker Pants":  { type: "pants", skill:"archer", sources:"dungeon", tier: 7,  rarity: 8,  def: 15, value: 9000,  color: "#4dd0e1" },
	"Wind-Reaver Tunic":  { type: "armor", skill:"archer", sources:"dungeon", tier: 8,  rarity: 10, def: 26, value: 25000, color: "#00e5ff" },
	"Wind-Reaver Pants":  { type: "pants", skill:"archer", sources:"dungeon", tier: 8,  rarity: 10, def: 20, value: 20000, color: "#00b8d4" },
	"DragonScale Tunic":  { type: "armor", skill:"archer", sources:"dungeon", tier: 9,  rarity: 11, def: 35, value: 50000, color: "#ffab40" },
	"DragonScale Pants":  { type: "pants", skill:"archer", sources:"dungeon", tier: 9,  rarity: 11, def: 28, value: 45000, color: "#ff9100" },
	"Nature Tunic":       { type: "armor", skill:"archer", sources:"dungeon", tier: 10, rarity: 12, def: 45, value: 90000, color: "#00c853" },
	"Nature Pants":       { type: "pants", skill:"archer", sources:"dungeon", tier: 10, rarity: 12, def: 38, value: 80000, color: "#1b5e20" },
	"Celestial Vest":     { type: "armor", skill:"archer", sources:"dungeon", tier: 11, rarity: 13, def: 60, value: 200000,color: "#b2ff59" },
	"Celestial Pants":    { type: "pants", skill:"archer", sources:"dungeon", tier: 11, rarity: 13, def: 52, value: 180000,color: "#76ff03" },
	//
	// --- MELEE GEAR (11 TIERS) ---
	"Iron Plate":         { type: "armor", skill:"attack", sources:"dungeon", tier: 1,  rarity: 1,  def: 4,  value: 300,   color: "#aaa" },
	"Iron Pants":         { type: "pants", skill:"attack", sources:"dungeon", tier: 1,  rarity: 1,  def: 3,  value: 200,   color: "#999" },
	"Steel Plate":        { type: "armor", skill:"attack", sources:"dungeon", tier: 2,  rarity: 2,  def: 7,  value: 800,   color: "#eee" },
	"Steel Pants":        { type: "pants", skill:"attack", sources:"dungeon", tier: 2,  rarity: 2,  def: 5,  value: 600,   color: "#ddd" },
	"Heavy Steel":        { type: "armor", skill:"attack", sources:"dungeon", tier: 3,  rarity: 4,  def: 10, value: 2000,  color: "#cfd8dc" },
	"Heavy Pants":        { type: "pants", skill:"attack", sources:"dungeon", tier: 3,  rarity: 4,  def: 8,  value: 1500,  color: "#b0bec5" },
	"Darksteel Plate":    { type: "armor", skill:"attack", sources:"dungeon", tier: 4,  rarity: 5,  def: 14, value: 5000,  color: "#455a64" },
	"DarkSteel Pants":    { type: "pants", skill:"attack", sources:"dungeon", tier: 4,  rarity: 5,  def: 11, value: 4000,  color: "#37474f" },
	"Cobalt Plate":       { type: "armor", skill:"attack", sources:"dungeon", tier: 5,  rarity: 6,  def: 19, value: 10000, color: "#1976d2" },
	"Cobalt Pants":       { type: "pants", skill:"attack", sources:"dungeon", tier: 5,  rarity: 6,  def: 15, value: 8000,  color: "#1565c0" },
	"Mithril Plate":      { type: "armor", skill:"attack", sources:"dungeon", tier: 6,  rarity: 7,  def: 25, value: 20000, color: "#4fc3f7" },
	"Mithril Pants":      { type: "pants", skill:"attack", sources:"dungeon", tier: 6,  rarity: 7,  def: 20, value: 18000, color: "#29b6f6" },
	"Adamantite Plate":   { type: "armor", skill:"attack", sources:"dungeon", tier: 7,  rarity: 9,  def: 32, value: 40000, color: "#d32f2f" },
	"Adamantite Pants":   { type: "pants", skill:"attack", sources:"dungeon", tier: 7,  rarity: 9,  def: 26, value: 35000, color: "#b71c1c" },
	"Obsidian Plate":     { type: "armor", skill:"attack", sources:"dungeon", tier: 8,  rarity: 10, def: 42, value: 75000, color: "#212121" },
	"Obsidian Pants":     { type: "pants", skill:"attack", sources:"dungeon", tier: 8,  rarity: 10, def: 35, value: 65000, color: "#000000" },
	"Paladin Plate":      { type: "armor", skill:"attack", sources:"dungeon", tier: 9,  rarity: 11, def: 55, value: 150000,color: "#ffeb3b" },
	"Paladin Pants":      { type: "pants", skill:"attack", sources:"dungeon", tier: 9,  rarity: 11, def: 48, value: 130000,color: "#fdd835" },
	"Titan Plate":        { type: "armor", skill:"attack", sources:"dungeon", tier: 10, rarity: 12, def: 75, value: 300000,color: "#7e57c2" },
	"Titan Pants":        { type: "pants", skill:"attack", sources:"dungeon", tier: 10, rarity: 12, def: 65, value: 250000,color: "#5e35b1" },
	"Dreadnought Plate":  { type: "armor", skill:"attack", sources:"dungeon", tier: 11, rarity: 13, def: 100,value: 500000,color: "#ff1744" },
	"Dreadnought Pants":  { type: "pants", skill:"attack", sources:"dungeon", tier: 11, rarity: 13, def: 90, value: 450000,color: "#d50000" },
	//
	// --- MAGIC GEAR (11 TIERS) ---
	"Apprentice Robe":    { type: "armor", skill:"magic", sources:"dungeon", tier: 1,  rarity: 1,  def: 1,  value: 100,   color: "#90caf9" },
	"Apprentice Pants":   { type: "pants", skill:"magic", sources:"dungeon", tier: 1,  rarity: 1,  def: 0,  value: 80,    color: "#64b5f6" },
	"Wizard Robe":        { type: "armor", skill:"magic", sources:"dungeon", tier: 2,  rarity: 2,  def: 3,  value: 400,   color: "#2196f3" },
	"Wizard Pants":       { type: "pants", skill:"magic", sources:"dungeon", tier: 2,  rarity: 2,  def: 2,  value: 300,   color: "#1e88e5" },
	"Mystic Robe":        { type: "armor", skill:"magic", sources:"dungeon", tier: 3,  rarity: 4,  def: 5,  value: 1200,  color: "#9c27b0" },
	"Mystic Pants":       { type: "pants", skill:"magic", sources:"dungeon", tier: 3,  rarity: 4,  def: 4,  value: 1000,  color: "#8e24aa" },
	"Sorcerer's Robe":    { type: "armor", skill:"magic", sources:"dungeon", tier: 4,  rarity: 5,  def: 8,  value: 3000,  color: "#673ab7" },
	"Sorcerer's Pants":   { type: "pants", skill:"magic", sources:"dungeon", tier: 4,  rarity: 5,  def: 6,  value: 2500,  color: "#5e35b1" },
	"Elementalist Robe":  { type: "armor", skill:"magic", sources:"dungeon", tier: 5,  rarity: 6,  def: 12, value: 7000,  color: "#f44336" },
	"Elementalist Pants": { type: "pants", skill:"magic", sources:"dungeon", tier: 5,  rarity: 6,  def: 9,  value: 6000,  color: "#e53935" },
	"Archmage Robe":      { type: "armor", skill:"magic", sources:"dungeon", tier: 6,  rarity: 8,  def: 18, value: 15000, color: "#3f51b5" },
	"Archmage Pants":     { type: "pants", skill:"magic", sources:"dungeon", tier: 6,  rarity: 8,  def: 14, value: 12000, color: "#3949ab" },
	"Void Robe":          { type: "armor", skill:"magic", sources:"dungeon", tier: 7,  rarity: 9,  def: 25, value: 35000, color: "#311b92" },
	"Void Pants":         { type: "pants", skill:"magic", sources:"dungeon", tier: 7,  rarity: 9,  def: 20, value: 30000, color: "#1a237e" },
	"Star Robe":          { type: "armor", skill:"magic", sources:"dungeon", tier: 8,  rarity: 10, def: 35, value: 80000, color: "#00bcd4" },
	"Star Pants":         { type: "pants", skill:"magic", sources:"dungeon", tier: 8,  rarity: 10, def: 28, value: 70000, color: "#00acc1" },
	"Reality Robe":       { type: "armor", skill:"magic", sources:"dungeon", tier: 9,  rarity: 11, def: 48, value: 160000,color: "#e91e63" },
	"Reality Pants":      { type: "pants", skill:"magic", sources:"dungeon", tier: 9,  rarity: 11, def: 40, value: 140000,color: "#c2185b" },
	"Mage Robe":          { type: "armor", skill:"magic", sources:"dungeon", tier: 10, rarity: 12, def: 65, value: 350000,color: "#ffd600" },
	"Mage Pants":         { type: "pants", skill:"magic", sources:"dungeon", tier: 10, rarity: 12, def: 55, value: 300000,color: "#ffab00" },
	"Astral Robe":        { type: "armor", skill:"magic", sources:"dungeon", tier: 11, rarity: 10, def: 80, value: 550000,color: "#b3e5fc" },
	"Astral Pants":       { type: "pants", skill:"magic", sources:"dungeon", tier: 11, rarity: 10, def: 80, value: 550000,color: "#b3e5fc" },
	"Omniscience":        { type: "armor", skill:"magic", sources:"dungeon", tier: 11, rarity: 13, def: 90, value: 600000,color: "#ffffff" },
	//
	// --- LURKER GEAR (11 TIERS) ---
	"Lurker Robe":         { type: "armor", skill:"lurk", sources:"dungeon", tier: 1,  rarity: 1,  def: 1,  value: 120,   color: "#424242" },
	"Lurker Pants":        { type: "pants", skill:"lurk", sources:"dungeon", tier: 1,  rarity: 1,  def: 1,  value: 100,   color: "#212121" },
	"Shadow Robe":         { type: "armor", skill:"lurk", sources:"dungeon", tier: 2,  rarity: 3,  def: 3,  value: 500,   color: "#37474f" },
	"Shadow Pants":        { type: "pants", skill:"lurk", sources:"dungeon", tier: 2,  rarity: 3,  def: 2,  value: 400,   color: "#263238" },
	"Night-Stalker Robe":  { type: "armor", skill:"lurk", sources:"dungeon", tier: 3,  rarity: 5,  def: 6,  value: 1500,  color: "#4a148c" },
	"Night-Stalker Pants": { type: "pants", skill:"lurk", sources:"dungeon", tier: 3,  rarity: 5,  def: 4,  value: 1200,  color: "#311b92" },
	"Phantom Robe":        { type: "armor", skill:"lurk", sources:"dungeon", tier: 4,  rarity: 6,  def: 10, value: 4000,  color: "#78909c" },
	"Phantom Pants":       { type: "pants", skill:"lurk", sources:"dungeon", tier: 4,  rarity: 6,  def: 7,  value: 3000,  color: "#607d8b" },
	"Assassin Robe":       { type: "armor", skill:"lurk", sources:"dungeon", tier: 5,  rarity: 7,  def: 14, value: 9000,  color: "#b71c1c" },
	"Assassin Pants":      { type: "pants", skill:"lurk", sources:"dungeon", tier: 5,  rarity: 7,  def: 11, value: 7500,  color: "#880e4f" },
	"Specter Robe":        { type: "armor", skill:"lurk", sources:"dungeon", tier: 6,  rarity: 8,  def: 20, value: 18000, color: "#9e9e9e" },
	"Specter Pants":       { type: "pants", skill:"lurk", sources:"dungeon", tier: 6,  rarity: 8,  def: 16, value: 15000, color: "#757575" },
	"Venomscale Robe":     { type: "armor", skill:"lurk", sources:"dungeon", tier: 7,  rarity: 9,  def: 28, value: 38000, color: "#00c853" },
	"Venomscale Pants":    { type: "pants", skill:"lurk", sources:"dungeon", tier: 7,  rarity: 9,  def: 22, value: 32000, color: "#00e676" },
	"Abyssal Robe":        { type: "armor", skill:"lurk", sources:"dungeon", tier: 8,  rarity: 10, def: 38, value: 85000, color: "#121212" },
	"Abyssal Pants":       { type: "pants", skill:"lurk", sources:"dungeon", tier: 8,  rarity: 10, def: 30, value: 75000, color: "#000000" },
	"Eclipse Robe":        { type: "armor", skill:"lurk", sources:"dungeon", tier: 9,  rarity: 11, def: 52, value: 170000,color: "#304ffe" },
	"Eclipse Pants":       { type: "pants", skill:"lurk", sources:"dungeon", tier: 9,  rarity: 11, def: 42, value: 150000,color: "#1a237e" },
	"Soul-Reaper Robe":    { type: "armor", skill:"lurk", sources:"dungeon", tier: 10, rarity: 12, def: 70, value: 380000,color: "#6200ea" },
	"Soul-Reaper Pants":   { type: "pants", skill:"lurk", sources:"dungeon", tier: 10, rarity: 12, def: 60, value: 320000,color: "#4a148c" },
	"Ghost in the Shell":  { type: "armor", skill:"lurk", sources:"dungeon", tier: 11, rarity: 13, def: 95, value: 650000,color: "#cfd8dc" },
	"Ghostly Echoes":      { type: "pants", skill:"lurk", sources:"dungeon", tier: 11, rarity: 13, def: 85, value: 580000,color: "#eceff1" },
//
//
//------------------------------------------------------------------------------------------------------
// ------------------------------Boots------------------------------------------------------------------
	"Cloth Boots":    { type: "boots", style:"", sources:"dungeon", tier: 1, rarity: 0, def: 1, value: 30,   color: "#4d4033" },
    "leather Boots":  { type: "boots", style:"", sources:"dungeon", tier: 2, rarity: 0, def: 2, value: 30,   color: "#5c4033" },
    "leather Booties":{ type: "boots", style:"", sources:"dungeon", tier: 5, rarity: 5, def: 3, value: 35,   color: "#5c2033" },
//------------------------------------------------------------------------------------------------------

// ------------------------------Gloves------------------------------------------------------------------
	// --- Gloves
	"White Gloves":  { type: "gloves", style:"", sources:"dungeon", tier: 11, rarity: 1, def: 5,  value: 200,   color: "white" },
	"Black Gloves":  { type: "gloves", style:"", sources:"dungeon", tier: 10, rarity: 1, def: 5,  value: 200,   color: "#111" },
    "Red Gloves":    { type: "gloves", style:"", sources:"dungeon", tier: 9,  rarity: 1, def: 5,  value: 90,   color: "red" },
	"Pink Gloves":   { type: "gloves", style:"", sources:"dungeon", tier: 8,  rarity: 1, def: 4,  value: 80,   color: "pink" },
	"Brown Gloves":  { type: "gloves", style:"", sources:"dungeon", tier: 7,  rarity: 1, def: 1,  value: 30,   color: "brown" },
	"Green Gloves":  { type: "gloves", style:"", sources:"dungeon", tier: 6,  rarity: 1, def: 1,  value: 50,   color: "green" },
	"Orange Gloves": { type: "gloves", style:"", sources:"dungeon", tier: 5,  rarity: 1, def: 0,  value: 70,   color: "orange" },
	"Yellow Gloves": { type: "gloves", style:"", sources:"dungeon", tier: 4,  rarity: 1, def: 0,  value: 60,   color: "yellow" },
	"Blue Gloves":   { type: "gloves", style:"", sources:"dungeon", tier: 3,  rarity: 1, def: 0,  value: 40,   color: "blue" },
	"Indigo Gloves": { type: "gloves", style:"", sources:"dungeon", tier: 2,  rarity: 1, def: 0,  value: 20,   color: "indigo" },
	"Leather Gloves":{ type: "gloves", style:"", sources:"dungeon", tier: 2,  rarity: 0, def: 1,  value: 100, color: "#5c4033" },
	"Violet Gloves": { type: "gloves", style:"", sources:"dungeon", tier: 1,  rarity: 1, def: 0,  value: 10,   color: "violet" },

    // --- SPECIALS ---
	// special head
	"box":            { type: "helmet", style: "box", sources:"dungeon", tier: 1, rarity: 10, def: 1, value: 5, color: "#d2b48c" },
	"Paper Bag":      { type: "helmet", style: "paperbag", sources:"dungeon", tier: 2, rarity: 10, def: 1, value: 5, color: "#d2b48c" },
	"wig":            { type: "helmet", style:"", sources:"dungeon", tier: 3, rarity: 0, def: 1,style: "wig",     value: 5000, color: "yellow" },
	"centurion":      { type: "helmet", style: "centurion", sources:"dungeon", tier: 4, rarity: 0, def: 2,  value: 2500, color: "#ffcc00" },
	"tv":             { type: "helmet", style: "tv", sources:"dungeon", tier: 5, rarity: 10, def: 1, value: 5, color: "#d2b48c" },
	"Pirate Hat":     { type: "helmet", style: "pirate", sources:"dungeon", tier: 5, rarity: 0, def: 2,  value: 5000, color: "#222222" },
	"Space Helmet":   { type: "helmet", style: "spacehelmet", sources:"dungeon", tier: 5, rarity: 10, def: 4, value: 500000, color: "#d2b48c" },
	"gentleman hat":  { type: "helmet", style: "gentleman", sources:"dungeon", tier: 6, rarity: 0,  def: 2,  value: 10000, color: "#333333" },
	"fun hat":        { type: "helmet", style: "funhat", sources:"dungeon", tier: 7, rarity: 0, def: 2,  value: 10000, color: "white" }, 
	"kabuto":         { type: "helmet", style: "samurai", sources:"dungeon", tier: 8, rarity: 0, def: 2,  value: 10000, color: "#8B0000" },
	"stickmenpo":     { type: "helmet", style: "menpo", sources:"pvp", tier: 9, rarity: 0, def: 2,  value: 10000, color: "#8B0000" },
	"Royal Crown":    { type: "helmet", style: "crown", sources:"dungeon", tier: 10, rarity: 0, def: 2,  value: 10000, color: "#ff0000" },
	"Angelic Ring":   { type: "helmet", style: "halo", sources:"dungeon", tier: 11, rarity: 13, def: 0,  value: 9999, color: "yellow" },
// --- ACHIEVEMENT REWARDS ---
	"Fishing Rod":          { type: "tool", style:"",sources:"achievement", tier: 100, rarity: 13, power: 0, value: 100,   color: "#8B4513" },
	"PvP Boots":            { type:"boots",style:"",sources:"achievement",  tier: 99, rarity: 1, value: 10000, color: "#7a231a" },
	"Crude Axe":            { type: "weapon", style: "axe",sources:"achievement", tier: 1,  rarity: 7,  power: 7,  speed: 2000, value: 25000,  color: "brown" },
	"Iron Axe":             { type: "weapon", style: "axe",sources:"achievement", tier: 2,  rarity: 7,  power: 15,  speed: 1800, value: 25000,  color: "#888" },
	"Steel Axe":            { type: "weapon", style: "axe",sources:"achievement", tier: 3,  rarity: 7,  power: 20,  speed: 1750, value: 25000,  color: "#888" },
	"Great Axe":            { type: "weapon", style: "axe",sources:"achievement", tier: 6,  rarity: 7,  power: 55,  speed: 2000, value: 25000,  color: "#444" },
// special capes
    "Nuber Cape":           { type:"cape",style:"cape",sources:"achievement",  tier: 10, rarity: 13, value: 10000, color: "#333" },
	"Warrior Cape":         { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "#555" },
    "Wizard Cape":          { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "blue" },
	"Archer Cape":          { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "olive" },
	"Lurker Cape":          { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "#424242" },
	"Healer Cape":          { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "white" },
	"Fishing Cape":         { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "teal" },
	"Swimmer Cape":         { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "red" },
    "Uber Cape":            { type:"cape",style:"cape",sources:"achievement",  tier: 10, rarity: 13, value: 10000, color: "black" },
	"Skilled Warrior Cape": { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "#2a2a2a" },
    "Skilled Wizard Cape":  { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "#1c1c1d" },
	"Skilled Archer Cape":  { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "#1e1e1e" },
	"Skilled Lurker Cape":  { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "#2d2d2d" },
	"Skilled Fishing Cape": { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "#4a4a4a" },
	"Skilled Swimmer Cape": { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "#3b3b3b" },
	"99 Tier Cape":         { type:"cape",style:"cape",sources:"achievement",  tier: 99, rarity: 1, value: 10000, color: "#ffd700" },
    "Cloak":                { type:"cape",style:"cloak",sources:"dungeon",     tier: 5, rarity: 10, value: 10000, color: "gray" },
	"Achievement Trophy":   { type: "material", sources:"trophy", tier: 1, rarity: 1, value: 500, color: "gold", description: "A mark of your progress." },
	
// hair
	"hair1": { type: "hair", style: "mohawk",      sources:"dungeon",  tier: 9, rarity: 1, color: "#ff69b4" },// pink mohawk
	"hair2": { type: "hair", style: "pigtails",    sources:"dungeon",  tier: 8, rarity: 2, color: "#4b3621" },// pigtails hair
	"hair3": { type: "hair", style: "scribble",    sources:"dungeon",  tier: 7, rarity: 3,   color: "#ffeb3b" }, // yellow child scribble
	"hair4": { type: "hair", style: "messy",       sources:"dungeon",  tier: 6, rarity: 4,      color: "#614126" }, // messy 
	"hair5": { type: "hair", style: "braids",      sources:"dungeon",  tier: 5, rarity: 5,    color: "#f3e5ab" }, // thick blonde braids
    "hair6": { type: "hair", style: "girly",       sources:"dungeon",  tier: 4, rarity: 6,  color: "#f3e5ab" }, // girly braids
	"hair7": { type: "hair", style: "pomp",        sources:"dungeon",  tier: 3, rarity: 7, color: "#614126" }, // Forward spiky pomp
    "hair8": { type: "hair", style: "twinspikes",  sources:"dungeon",  tier: 2, rarity: 9, color: "#ff0000" }, // Red double spikes
	"hair11": { type: "hair", style: "drills",     sources:"dungeon",  tier: 1, rarity: 8, color: "#f3e5ab" }, // spiral chunky drills 
	"oldman beard": {  type: "hair", style: "wizardbeard", sources:"dungeon",  tier: 10, rarity: 7, color: "#ffffff" },
	"wizard beard": {  type: "hair", style: "wizardbeard", sources:"dungeon",  tier: 8, rarity: 5, color: "#333333" },

// ---------------------------basic items----------------------------------------------------------------
	// --- normal fish ----
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
	"Bass":    { type: "fish", sources:"fishing", tier: 1, rarity: 0, value: 100, color: "#FFD700", stacks: true },
	"Trout":    { type: "fish", sources:"fishing", tier: 2, rarity: 0, value: 100, color: "#FFD700", stacks: true  },
	"Salmon":    { type: "fish", sources:"fishing", tier: 3, rarity: 0, value: 100, color: "#FFD700", stacks: true  },
	"Tuna":    { type: "fish", sources:"fishing", tier: 4, rarity: 0, value: 100, color: "#FFD700", stacks: true  },
	"Shark":    { type: "fish", sources:"fishing", tier: 5, rarity: 0, value: 100, color: "#FFD700", stacks: true  },
	"Lobster":    { type: "fish", sources:"fishing", tier: 6, rarity: 0, value: 1000, color: "#FFD700", stacks: true  },
	
	// --- unique fish ---
	"Golden Bass":    { type: "fish", source:"fishing",  tier: 10, rarity: 0, value: 100, color: "#FFD700", stacks: true },
	//rare fishing finds
	"fishhat":      { type: "helmet", sources:"fishing",  style: "fishhat", tier: 99, rarity: 13, def: 1, value: 500000, color: "#d2b48c" },
	// --- unique swimming find ---
	"Pearl":    { type: "fish", sources:"fishing swimming",  tier: 3, rarity: 5, value: 100, color: "white", stacks: true },
	"Black Pearl":    { type: "fish", sources:"fishing swimming",  tier: 6, rarity: 5, value: 100, color: "black", stacks: true },

    // --- MATERIALS ---
    "Leather scrap":  { type: "material", sources:"fishing",  tier: 1, rarity: 0, value: 15,   color: "#a88d6d", stacks: true },
	"Sea Shell":  { type: "material", sources:"fishing swimming",  tier: 8, rarity: 0, value: 15,   color: "#a88d6d", stacks: true },
	"a Rock":  { type: "material", sources:"swimming",  tier: 8, rarity: 0, value: 15,   color: "#a88d6d" },
	"bone":  { type: "material", sources:"dungeon",  tier: 1, rarity: 0, value: 1, color: "#a88d6d", stacks: true },
	// --- treasure ---
	"Trophy":         { type:"treasure",style:"", sources:"treasure",  tier: 99, rarity: 13, value: 10000, color: "#ffd700", stacks: true },
	// other basic materials will go here
//-------------------------------------------------------------------------------------------------------
};
/* ================= EXTENDED ITEM LIBRARY ================= */
const DANCE_UNLOCKS = {
    1: { name: "The Hop", minLvl: 1 },
    2: { name: "The paddle", minLvl: 1 },
    3: { name: "The Lean",  minLvl: 1 },
    4: { name: "The groupy", minLvl: 1 },
	5: { name: "The Sway", minLvl: 1 },
    6: { name: "The sixthdance", minLvl: 1 },
    7: { name: "The ninthdance", minLvl: 1 },
	8: { name: "The Slav", minLvl: 1 },
    9: { name: "The Disco", minLvl: 1 },
	10: { name: "The Worm", minLvl: 1 },
    11: { name: "Breakspin", minLvl: 1 },
	12: { name: "The Moonwalk", minLvl: 1 },
    13: { name: "The Robot", minLvl: 1 },
    14: { name: "The Carlton", minLvl: 1 },
	15: { name: "The Twerk", minLvl: 1 },
	16: { name: "Backflip", minLvl: 1 },
	17: { name: "The Matrix", minLvl: 1 },
	99: { name: "The 99", minLvl: 1 }
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

    8: (now) => {
        // High-intensity squatting (The Slav/Hardbass)
        const bounce = Math.abs(Math.sin(now / 150)) * 15;
        return { 
            bodyY: 10 + bounce, 
            pose: "crouch",
            lean: Math.sin(now / 300) * 0.2 
        };
    },
    9: (now) => {
        // Alternating Dab (Uses the elbow logic)
        const side = Math.sin(now / 400) > 0 ? 1 : -1;
        return {
            bodyY: Math.sin(now / 200) * 5,
            lean: side * 0.3,
            pose: "dab"
        };
    },
	10: (now, p) => {
        // We drop the bodyY significantly so they are on the floor
        // and add a bit of forward "inchworm" movement to the lean
        const move = Math.sin(now / 500) * 0.2; 
        
        return { 
            bodyY: 25, 
            pose: "worm",
            lean: -0.5 + move // Hunching forward
        };
    },
	11: (now) => {
        const wobble = Math.sin(now / 100) * 0.1;
        return { 
            bodyY: 15,  // Pushes the head down toward the ground level
            pose: "headspin",
            lean: wobble // The slight tilt of a balancing spinner
        };
    },
	12: (now) => {
        // The Moonwalk: Lean forward, glide backward
        return {
            bodyY: 2, 
            lean: 0.3, // Lean "into" the slide
            pose: "glide"
        };
    },
    13: (now) => {
        // The Robot: Moves only in "ticks" using a floor function
        const tick = Math.floor(now / 250);
        const jerkyLean = (tick % 4 === 0) ? 0.2 : -0.1;
        return {
            bodyY: (tick % 2 === 0) ? 2 : 0,
            lean: jerkyLean,
            pose: "stiff"
        };
    },
    14: (now) => {
        // The Carlton: Big torso snaps and arm swings
        const snap = Math.sin(now / 200);
        return {
            bodyY: Math.abs(snap) * 5,
            lean: snap * 0.5,
            pose: "swing"
        };
    },
	15: (now) => {
        // The rhythm: A heavy bounce combined with a rapid vibration
        const rhythmicBounce = Math.abs(Math.sin(now / 300)) * 5;
        const vibration = Math.sin(now / 50) * 3;

        return {
            bodyY: 12 + rhythmicBounce, // Deep squat
            lean: 0.8, // Heavy lean forward
            pose: "twerk"
        };
    },
	16: (now, p) => {
        const duration = 800; // ms per flip
        const elapsed = now % duration;
        const progress = elapsed / duration;

        // 1. HEIGHT: Parabolic jump arc
        // Uses the formula: h = -4 * max * (p - 0.5)^2 + max
        const jumpHeight = -100 * Math.pow(progress - 0.5, 2) + 25;
        
        // 2. ROTATION: Update the pose progress
        // We pass this into the pose so the limbs know where they are
        p.flipProgress = progress;

        // 3. OFFSET: Move the head in a circle around the "waist"
        const radius = 20;
        const rotX = Math.sin(progress * Math.PI * 2) * radius;
        const rotY = Math.cos(progress * Math.PI * 2) * radius;

        return {
            bodyY: -jumpHeight + rotY, 
            lean: rotX * 0.05, // Tilts the torso as it rotates
            pose: "flip",
            flipProgress: progress 
        };
    },
	17: (now) => {
        // Slow motion sway
        const slowSway = Math.sin(now / 1200); 
        // We only want to lean BACKWARDS (positive lean in your system usually)
        const extremeLean = Math.abs(slowSway) * 1.5; 

        return {
            bodyY: 10 + (extremeLean * 5), // Drop the hips as we lean back
            lean: extremeLean, 
            pose: "matrix"
        };
    },
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
	"sword": (ctx, item, isAttacking, now, p, bodyY, lean, progress) => {
        // Points straight out from the swinging hand
        ctx.rotate(-Math.PI / 4); 
        ctx.strokeStyle = item.color || "#ccc";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(25, 0); ctx.stroke();
        // Guard
        ctx.strokeStyle = "#aa8800";
        ctx.beginPath(); ctx.moveTo(5, -6); ctx.lineTo(5, 6); ctx.stroke();
    },

    "axe": (ctx, item, isAttacking, now, p, bodyY, lean, progress) => {
        ctx.rotate(-Math.PI / 4);
        ctx.strokeStyle = "#5d4037"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, 0); ctx.stroke();
        ctx.fillStyle = item.color || "#999";
        ctx.beginPath();
        ctx.moveTo(15, -5); ctx.lineTo(25, -8); ctx.lineTo(25, 8); ctx.lineTo(15, 5);
        ctx.fill(); ctx.stroke();
    },

    "dagger": (ctx, item, isAttacking, now, p, bodyY, lean, progress) => {
        ctx.rotate(-Math.PI / 4);
        ctx.strokeStyle = item.color || "#777"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(12, 0); ctx.stroke();
    },

	"bow": (ctx, item, isAttacking, now, p, bodyY, lean, progress) => {
		ctx.rotate(isAttacking ? -0.1 : 0.2); 

		const bowX = -15; // Shifted left to stay on the hand
		const pullAmount = isAttacking ? (progress * 22) : 0;

		// Wood Arc
		ctx.strokeStyle = item.color || "#8B4513";
		ctx.lineWidth = 3;
		ctx.beginPath(); 
		ctx.arc(bowX, 0, 18, -Math.PI / 2, Math.PI / 2, false); 
		ctx.stroke();

		// String (Pulls back exactly to match the hand movement)
		ctx.strokeStyle = "rgba(255,255,255,0.7)";
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(bowX, -18); 
		ctx.lineTo(bowX - pullAmount, 0); 
		ctx.lineTo(bowX, 18); 
		ctx.stroke();

		// Arrow (disappears just before firing)
		if (isAttacking && progress < 0.9) {
			ctx.strokeStyle = "#eee";
			ctx.lineWidth = 2;
			ctx.beginPath();
			ctx.moveTo(bowX - pullAmount, 0);
			ctx.lineTo(bowX + 25 - pullAmount, 0); 
			ctx.stroke();
		}
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
    "pickaxe": (ctx, item, isAttacking, now, p, bodyY, lean, progress) => {
        // Mining: Fast strike, slow pull back
        let rotation = Math.PI / 1.2;
        if (isAttacking && progress < 1.0) {
            rotation = (progress < 0.3) 
                ? 1.2 - (progress * 6) // Rapid strike
                : -0.6 + (progress * 1.8); // Slow drag back
        }
        ctx.rotate(rotation);
        ctx.strokeStyle = "#4e342e"; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(22, 0); ctx.stroke();
        ctx.strokeStyle = item.color || "#aaa"; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(22, 0, 12, Math.PI * 0.7, Math.PI * 1.3); ctx.stroke();
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
// The "Custom" handler: This will be called for any hat you draw in the workshop
    "customHat": (ctx, hX, hY, color, styleName) => {
        const pathData = CUSTOM_ASSETS.hats[styleName];
        if (!pathData) return;

        ctx.save();
        ctx.translate(hX, hY); // Move to head position
        ctx.fillStyle = color || "#ccc";
        ctx.strokeStyle = "#000";
        ctx.lineWidth = 1.5;

        ctx.beginPath();
        pathData.path.forEach(p => {
            if (!p) { 
                ctx.fill(); 
                ctx.stroke(); 
                ctx.beginPath(); 
                return; 
            }
            // Normalize relative to the anchor you set in the workshop
            // We use a slightly larger scale (0.5) for hats compared to weapons (0.2)
            ctx.lineTo((p.x - pathData.anchor.x) * 0.5, (p.y - pathData.anchor.y) * 0.5);
        });
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
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
const POSE_LIBRARY = {
    "head_hands": (head) => ({
        left: { x: head.x - 12, y: head.y + 5 },
        right: { x: head.x + 12, y: head.y + 5 }
    }),
    "star": (head) => ({
        left: { x: head.x - 25, y: head.y - 10 },
        right: { x: head.x + 25, y: head.y - 10 }
    }),
/*     "action": (head, p, anim) => ({
        right: { x: head.x + 20 + (anim.lean * 10), y: head.y + 15 }
    }), */
	"action": (head, p, anim, progress = 0) => {
        const shoulder = { x: head.x, y: head.y + 15 };
        const armLength = 25;
        
        let angle;
        const isAction = p.activeTask === "attacking" || p.activeTask === "pvp" || ["woodcutting", "mining"].includes(p.activeTask);

        if (isAction && progress < 1.0) {
            // SNAP MATH:
            if (progress < 0.4) {
                // Phase 1: Slow Wind-up (move back slightly)
                angle = -2.5 - (progress * 0.5); 
            } else if (progress < 0.6) {
                // Phase 2: THE SNAP (Travels 180 degrees in 20% of the time)
                const snapProgress = (progress - 0.4) / 0.2;
                angle = -2.7 + (snapProgress * 3.5); 
            } else {
                // Phase 3: Hold/Recover
                angle = 0.8;
            }
        } else {
            angle = 0.8; // Idle position
        }

        return {
            left:  { x: head.x - 15, y: head.y + 25 },
            right: { 
                x: shoulder.x + Math.cos(angle) * armLength, 
                y: shoulder.y + Math.sin(angle) * armLength 
            }
        };
    },
	"boxing": (head, p, anim, progress = 0) => {
		const isAttacking = (p.activeTask === "attacking" || p.activeTask === "pvp");
		const shoulderY = head.y + 15;
		
		// 1. BOUNCE & WEAVE
		// Even when idling, boxers bounce. When attacking, they bob faster.
		const bobSpeed = isAttacking ? 150 : 300;
		const bounce = Math.abs(Math.sin(Date.now() / bobSpeed)) * 3;
		const weave = Math.sin(Date.now() / 400) * 4; // Side-to-side head movement

		// 2. PUNCH LOGIC (Snap and Recoil)
		// We use a power curve so the punch goes out fast and returns slightly slower
		const punchPower = Math.sin(progress * Math.PI);
		const punchL = (isAttacking && progress < 0.5) ? punchPower * 25 : 0;
		const punchR = (isAttacking && progress >= 0.5) ? punchPower * 25 : 0;

		// 3. TORSO LEAN
		// The body leans INTO the punch
		const punchLean = (punchL > 0) ? -5 : (punchR > 0 ? 5 : 0);

		return {
			// HANDS: Set in a high "guard" near the face when not punching
			left:  { 
				x: head.x - 10 - punchL + weave, 
				y: shoulderY - 8 - (punchL > 0 ? 2 : 0) + bounce 
			},
			right: { 
				x: head.x + 10 + punchR + weave, 
				y: shoulderY - 8 - (punchR > 0 ? 2 : 0) + bounce 
			},

			// KNEES: Bent stance for power
			leftKnee:  { x: p.x - 14 + punchLean, y: p.y + 12 + bounce },
			rightKnee: { x: p.x + 14 + punchLean, y: p.y + 12 + bounce },

			// FEET: Wide "Philly Shell" or standard boxing stance
			leftFoot:  { x: p.x - 15 + (punchL * 0.2), yOffset: -bounce * 0.5 },
			rightFoot: { x: p.x + 15 - (punchR * 0.2), yOffset: -bounce * 0.5 },
			
			// Pass lean back to the renderer if your system supports torso rotation
			bodyLean: punchLean 
		};
	},
	"archer": (head, p, anim, progress = 0) => {
		const isAttacking = (p.activeTask === "attacking" || p.activeTask === "pvp");
		const pullAmount = (isAttacking && progress < 1.0) ? (progress * 22) : 0;

		// --- ARM LOGIC ---
		const shoulderL = { x: head.x - 5, y: head.y + 15 };
		const handL = { x: head.x + 5 - pullAmount, y: head.y + 18 };
		const elbowL = {
			x: shoulderL.x - (pullAmount * 0.4) - 5,
			y: shoulderL.y - (pullAmount * 0.5) 
		};

		// --- DYNAMIC KNEE LOGIC ---
		// Only bend knees during the attack draw
		const kneeDip = pullAmount * 0.2;   // How much the knee drops (Y)
		const kneeFlare = pullAmount * 0.3; // How much the knee pushes OUT (X)

		// Hip position (p.x is the center of the body)
		const hipY = p.y + 0 + anim.bodyY;
		const footY = p.y + 25 + anim.bodyY;

		return {
			// HANDS
			right: { x: head.x + 25 + (anim.lean * 10), y: head.y + 18 },
			left: handL,
			leftElbow: elbowL,

			// KNEES (The joints between Hip and Foot)
			// Left Knee pushes further left, Right Knee pushes further right
			leftKnee: isAttacking ? { x: p.x - 10 - kneeFlare, y: hipY + 12 + kneeDip } : null,
			rightKnee: isAttacking ? { x: p.x + 10 + kneeFlare, y: hipY + 12 + kneeDip } : null,

			// FEET (Widen the stance slightly as he pulls)
			leftFoot: { x: p.x - 10 - (kneeFlare * 0.5), yOffset: 0 },
			rightFoot: { x: p.x + 10 + (kneeFlare * 0.5), yOffset: 0 }
		};
	},
    "fishing": (head, p, anim) => ({
        // Fixed the double "right" and the missing parameter
		left:  { x: head.x - 10, y: head.y + 35 },
        right: { x: head.x + 22, y: head.y + 15 }
    }),

	"swimming": (head, p, anim) => {
		const now = Date.now();
		
		// Arm flapping speed and height
		const flapTime = now / 400; 
		const flapAmp = 12; // How high/low they flap
		const shoulderY = head.y + 15;
		
		// Flutter kick math (slightly faster than arms)
		const kickTime = now / 300;
		const kickAmp = 8;

		return {
			left: { 
				// Stay to the left, but move up and down
				x: head.x - 22, 
				y: shoulderY + Math.sin(flapTime) * flapAmp 
			},
			right: { 
				// Stay to the right, move up and down (offset by PI for alternating)
				x: head.x + 22, 
				y: shoulderY + Math.sin(flapTime + Math.PI) * flapAmp
			},
			// Feet keep their rhythmic kicking
			leftFoot:  { yOffset: Math.sin(kickTime) * kickAmp },
			rightFoot: { yOffset: Math.sin(kickTime + Math.PI) * kickAmp }
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
	},
	"crouch": (head, p, anim) => {
		anim.bodyY = 18; // Very low
		const hipY = p.y + anim.bodyY;
		
		return {
			left:  { x: head.x - 15, y: head.y + 20 },
			right: { x: head.x + 15, y: head.y + 20 },
			
			// Knees pushed out far to the sides
			leftKnee:  { x: p.x - 22, y: hipY + 2 },
			rightKnee: { x: p.x + 22, y: hipY + 2 },
			
			// Feet pinned to the ground
			leftFoot:  { x: p.x - 12, yOffset: -anim.bodyY },
			rightFoot: { x: p.x + 12, yOffset: -anim.bodyY }
		};
	},
	"dab": (head, p, anim) => {
        const shoulderY = head.y + 15;
        return {
            left: { x: head.x - 25, y: head.y - 7 },
            leftElbow: { x: head.x - 15, y: shoulderY - 5 },
            right: { x: head.x + 25, y: head.y - 10 },
            // Ground the feet
            leftFoot: { x: p.x - 15, yOffset: -anim.bodyY },
            rightFoot: { x: p.x + 5, yOffset: -anim.bodyY }
        };
    },
	"kick": (head, p, anim) => {
        const hipY = p.y + anim.bodyY;
        return {
            left:  { x: head.x - 15, y: head.y + 10 },
            right: { x: head.x + 15, y: head.y + 10 },
            // Knee tucks relative to moving hips
            leftKnee: { x: p.x - 5, y: hipY - 10 },
            leftFoot: { x: p.x - 15, yOffset: -10 - anim.bodyY }, 
            rightFoot: { x: p.x + 5, yOffset: -anim.bodyY } // Planted foot
        };
    },
	"shush": (head, p, anim) => {
		// One hand to the mouth (elbow sharp)
		return {
			left:      { x: head.x, y: head.y + 5 },
			leftElbow: { x: head.x - 15, y: head.y + 15 },
			right:     { x: head.x + 12, y: head.y + 25 }
		};
	},
	"worm": (head, p, anim) => {
        const now = Date.now();
        const getWave = (offset) => Math.sin((now * 0.008) - (offset * 0.1)) * 15;
        return {
            left:  { x: head.x - 10, y: head.y + 15 + getWave(10) },
            right: { x: head.x + 10, y: head.y + 15 + getWave(10) },
            leftKnee:  { x: head.x - 40, y: head.y + 10 + getWave(40) },
            rightKnee: { x: head.x - 40, y: head.y + 10 + getWave(45) },
            // The worm is horizontal, so we offset the yOffset significantly
            leftFoot:  { x: head.x - 70, yOffset: -15 + getWave(70) - anim.bodyY },
            rightFoot: { x: head.x - 75, yOffset: -15 + getWave(75) - anim.bodyY }
        };
    },
	"headspin": (head, p, anim) => {
		const now = Date.now();
		const spinSpeed = now / 150;
		const legSpread = 25;
		
		// Circular motion math
		const lx = Math.cos(spinSpeed) * legSpread;
		const ly = Math.sin(spinSpeed) * 10;
		const rx = Math.cos(spinSpeed + Math.PI) * legSpread;
		const ry = Math.sin(spinSpeed + Math.PI) * 10;

		return {
			// FIX: Hands are on the floor. 
			// We use p.y + 25 to find the "Floor" and subtract bodyY
			left:  { x: head.x - 15, y: p.y + 25 }, 
			right: { x: head.x + 15, y: p.y + 25 },

			// Knees and Feet stay relative to the head/torso (yOffset: 0)
			// because they are flailing in the air.
			leftKnee:  { x: head.x + lx * 0.5, y: head.y - 15 + ly },
			rightKnee: { x: head.x + rx * 0.5, y: head.y - 15 + ry },
			leftFoot:  { x: head.x + lx, yOffset: -50 + ly },
			rightFoot: { x: head.x + rx, yOffset: -50 + ry }
		};
	},
	"glide": (head, p, anim) => {
        const cycle = (Date.now() / 400) % 2;
        const leftIsLeading = cycle < 1;
        const hipY = p.y + anim.bodyY;
        return {
            left:  { x: head.x - 10, y: head.y + 25 },
            right: { x: head.x + 10, y: head.y + 25 },
            leftKnee:  { x: p.x - 5, y: hipY + (leftIsLeading ? 5 : 12) },
            rightKnee: { x: p.x + 5, y: hipY + (!leftIsLeading ? 5 : 12) },
            // Moonwalk-style gliding requires feet to stay on floor
            leftFoot:  { x: p.x - 12, yOffset: (leftIsLeading ? -4 : 0) - anim.bodyY },
            rightFoot: { x: p.x + 12, yOffset: (!leftIsLeading ? -4 : 0) - anim.bodyY }
        };
    },
	"stiff": (head, p, anim) => {
        const hipY = p.y + anim.bodyY;
        return {
            left:  { x: head.x - 20, y: head.y + 15 },
            leftElbow: { x: head.x - 20, y: head.y + 25 },
            right: { x: head.x + 20, y: head.y + 5 },
            rightElbow: { x: head.x + 5, y: head.y + 5 },
            leftKnee:  { x: p.x - 10, y: hipY + 10 },
            rightKnee: { x: p.x + 15, y: hipY + 15 },
            leftFoot:  { x: p.x - 15, yOffset: -anim.bodyY },
            rightFoot: { x: p.x + 20, yOffset: -anim.bodyY }
        };
    },
	"swing": (head, p, anim) => {
		const swingX = Math.sin(Date.now() / 200) * 20;
		const hipY = p.y + anim.bodyY; // Get dynamic hip
		return {
			left:  { x: head.x - 10 + swingX, y: head.y + 15 - Math.abs(swingX) },
			right: { x: head.x + 10 + swingX, y: head.y + 15 - Math.abs(swingX) },
			// FIX: Knees must be relative to the dynamic hipY
			leftKnee:  { x: p.x - 10 + (swingX * 0.2), y: hipY + 12 },
			rightKnee: { x: p.x + 10 + (swingX * 0.2), y: hipY + 12 },
			// Add feet grounding if you want them planted
			leftFoot:  { x: p.x - 10, yOffset: -anim.bodyY },
			rightFoot: { x: p.x + 10, yOffset: -anim.bodyY }
		};
	},
	"twerk": (head, p, anim) => {
        const shake = Math.sin(Date.now() / 75) * 8; 
        const hipY = p.y + anim.bodyY;
        return {
            left:  { x: head.x + 15, y: head.y + 25 },
            right: { x: head.x + 18, y: head.y + 25 },
            leftKnee:  { x: p.x - 15, y: hipY + 5 },
            rightKnee: { x: p.x + 15, y: hipY + 5 },
            // Keep the feet wide and planted
            leftFoot:  { x: p.x - 12, yOffset: -anim.bodyY },
            rightFoot: { x: p.x + 12, yOffset: -anim.bodyY },
            twerkShake: shake 
        };
    },
	"flip": (head, p, anim) => {
        const progress = anim.flipProgress || 0; // 0 to 1
        const angle = progress * Math.PI * 2; // Full circle in radians
        
        // As we flip, we "tuck" the knees in for speed
        const tuck = Math.sin(progress * Math.PI) * 15;

        return {
            // Hands tucking the knees
            left:  { x: head.x - 5, y: head.y + 20 },
            right: { x: head.x + 5, y: head.y + 20 },
            
            // Knees pulled close to the chest (tucked)
            leftKnee:  { x: head.x - 10 + tuck, y: head.y + 10 + tuck },
            rightKnee: { x: head.x + 10 - tuck, y: head.y + 10 + tuck },

            // Feet following the rotation
            leftFoot:  { x: head.x - 5, yOffset: -10 },
            rightFoot: { x: head.x + 5, yOffset: -10 }
        };
    },
	"matrix": (head, p, anim) => {
        const hipY = p.y + anim.bodyY;
        const kneeForward = (anim.lean || 0) * 40; 
        return {
            left:  { x: head.x - 25, y: head.y + 10 },
            right: { x: head.x + 25, y: head.y + 10 },
            leftKnee:  { x: p.x - 10 + kneeForward, y: hipY - 5 },
            rightKnee: { x: p.x + 10 + kneeForward, y: hipY - 5 },
            leftFoot:  { x: p.x - 12, yOffset: -anim.bodyY },
            rightFoot: { x: p.x + 12, yOffset: -anim.bodyY }
        };
    },
	"sit": (head, p, anim) => {
		anim.lean = 0.4;
		const hipY = p.y + anim.bodyY; // The pivot point for the legs
		// 2. Leg Logic: Hip -> Knee -> Foot
		// To avoid "weird legs," we keep the knee between the hip and foot
		// KneeY is slightly ABOVE the hip to show the thighs are angled up
		const kneeL = { x: p.x - 15, y: hipY - 2 }; 
		const kneeR = { x: p.x + 15, y: hipY - 2 };

		// 3. Feet: Pushed slightly further out than the knees
		// No yOffset needed here because we want them to drop with the bodyY
		const footL = { x: p.x + 15 }; 
		const footR = { x: p.x - 15 };

		return {
			left:  { x: head.x - 10, y: head.y + 35 },
			right: { x: head.x + 5,  y: head.y + 30 }
			
			// Joint flare
			leftKnee: kneeL,
			rightKnee: kneeR,
			
			// Ground contact
			leftFoot: footL,
			rightFoot: footR
		};
	},

	"pushups": (head, p, anim) => {
		// 1. The Ground Lock
		const groundYOffset = -anim.bodyY;

		// 2. Define Shoulders (where the arms start)
		// These move with the head and the lean
		const shoulderY = head.y + 15;
		
		// 3. Hand Logic (Gloves attach here)
		// We place hands on the ground (yOffset) and slightly forward/back from the head
		const handL = { x: head.x - 10, yOffset: groundYOffset };
		const handR = { x: head.x + 10, yOffset: groundYOffset };

		// 4. Elbow Logic (The Bend)
		// To make them bend, the elbow must be OFFSET from the shoulder-to-hand line
		const elbowL = { x: head.x - 20, y: shoulderY + 5 };
		const elbowR = { x: head.x + 20, y: shoulderY + 5 };

		// 5. Foot Logic (The Pivot)
		// If lean is negative (leaning left), feet must be on the RIGHT (+x)
		const feetX = p.x + 35; 

		return {
			// HANDS (Gloves draw here)
			left: handL,
			right: handR,
			
			// ARMS (Forces the V-shape)
			leftElbow: elbowL,
			rightElbow: elbowR,

			// LEGS (Straight line)
			leftKnee: null,
			rightKnee: null,

			// FEET (Locked to floor, matching the tilt)
			leftFoot: { x: feetX, yOffset: groundYOffset },
			rightFoot: { x: feetX + 3, yOffset: groundYOffset }
		};
	},

    "meditate": (head, p, anim) => {
        const hipY = p.y + anim.bodyY;
        return {
            left:  { x: p.x - 15, y: hipY - 2 },
            right: { x: p.x + 15, y: hipY - 2 },
            leftKnee:  { x: p.x - 20, y: hipY + 5 },
            rightKnee: { x: p.x + 20, y: hipY + 5 },
            leftFoot:  { x: p.x - 8 },
            rightFoot: { x: p.x + 8 }
        };
    },
    "pee": (head, p, anim) => {
        const now = Date.now();
        // Particle logic inside the pose:
        if (now % 5 === 0) { // Throttled spawning
            const streamX = p.x + (8 * p.facing);
            const streamY = p.y + 12;
            const targetX = p.x + (25 * p.facing);
            const targetY = p.y + 25;
            // Assuming spawnProjectile exists in your global scope
            if (typeof spawnProjectile === "function") {
                spawnProjectile(streamX, streamY, targetX, targetY, "#ff0", "drop", p.area);
            }
        }

        return {
            left:  { x: head.x, y: head.y + 28 }, 
            right: { x: head.x + 12, y: head.y + 22 },
            rightElbow: { x: head.x + 18, y: head.y + 18 },
            leftFoot: { x: p.x - 8, yOffset: 0 },
            rightFoot: { x: p.x + 8, yOffset: 0 }
        };
    },
	"wave": (head, p, anim) => {
		const handSwing = Math.sin(Date.now() / 130) * 14;
		return {
			right:  { x: head.x + 12, y: head.y + 25 },
			left: { x: head.x - 15 + handSwing, y: head.y - 4 },
			LeftElbow: { x: head.x - 15, y: head.y + 10 },
			// FIX: Ground the feet so they don't slide when the body bobs
			leftFoot:  { x: p.x - 10, yOffset: -anim.bodyY },
			rightFoot: { x: p.x + 10, yOffset: -anim.bodyY }
		};
	}
};

const BODY_PARTS = {
    "stick": {
		head: (ctx, x, y, p) => {
			ctx.save();
			ctx.globalAlpha = 0.9;
			ctx.fillStyle = p.color || "#ff4444";
			ctx.beginPath(); 
			ctx.arc(x, y, 10, 0, Math.PI * 2); 
			ctx.fill();
			ctx.strokeStyle = "#000";
			ctx.lineWidth = 1;
			ctx.stroke();

			const emote = p.emote;

			// --- 1. EYES ---
			ctx.fillStyle = "#000";
			ctx.lineWidth = 1.5;

			if (emote === "laugh" || emote === "ko") {
				// "X X" eyes (Thicker for laugh/ko)
				const drawX = (ex, ey, size) => {
					ctx.beginPath();
					ctx.moveTo(ex - size, ey - size); ctx.lineTo(ex + size, ey + size);
					ctx.moveTo(ex + size, ey - size); ctx.lineTo(ex - size, ey + size);
					ctx.stroke();
				};
				const xSize = emote === "laugh" ? 2.5 : 2;
				drawX(x - 4, y - 3, xSize);
				drawX(x + 4, y - 3, xSize);
			} else if (emote === "cry") {
				// Normal eyes + blue teardrops
				ctx.fillRect(x - 4, y - 3, 2, 2); 
				ctx.fillRect(x + 2, y - 3, 2, 2);
				ctx.fillStyle = "#00f";
				ctx.fillRect(x - 4, y, 2, 4);
				ctx.fillRect(x + 2, y, 2, 4);
			} else if (emote === "uwu" || emote === "blush") {
				// "n n" curved eyes
				ctx.beginPath();
				ctx.arc(x - 4, y - 2, 2, Math.PI, 0); ctx.stroke();
				ctx.beginPath();
				ctx.arc(x + 4, y - 2, 2, Math.PI, 0); ctx.stroke();
			} else if (emote === "wtf") {
				// Wide circle eyes
				ctx.beginPath();
				ctx.arc(x - 4, y - 3, 3, 0, Math.PI * 2); ctx.stroke();
				ctx.beginPath();
				ctx.arc(x + 4, y - 3, 3, 0, Math.PI * 2); ctx.stroke();
			} else if (emote === "angry") {
				// Angled "> <" eyes
				ctx.beginPath();
				ctx.moveTo(x - 6, y - 5); ctx.lineTo(x - 2, y - 2); 
				ctx.moveTo(x + 6, y - 5); ctx.lineTo(x + 2, y - 2);
				ctx.stroke();
			} else {
				// Standard square eyes
				ctx.fillRect(x - 4, y - 3, 2, 2); 
				ctx.fillRect(x + 2, y - 3, 2, 2); 
			}

			// --- 2. OVERLAYS (Blush Cheeks) ---
			if (emote === "blush") {
				ctx.fillStyle = "rgba(255, 100, 100, 0.5)";
				ctx.beginPath();
				ctx.arc(x - 6, y + 2, 2.5, 0, Math.PI * 2);
				ctx.arc(x + 6, y + 2, 2.5, 0, Math.PI * 2);
				ctx.fill();
			}

			// --- 3. MOUTHS ---
			ctx.beginPath();
			ctx.strokeStyle = "#000";
			ctx.lineWidth = 1.5;

			switch(emote) {
				case "sad":
				case "cry":
					ctx.arc(x, y + 7, 4, 1.2 * Math.PI, 1.8 * Math.PI);
					break;
				case "surprised":
				case "wtf":
					const oSize = emote === "wtf" ? 2 : 2.5;
					ctx.arc(x, y + 5, oSize, 0, Math.PI * 2);
					break;
				case "laugh":
					ctx.arc(x, y + 2, 5, 0, Math.PI);
					ctx.closePath();
					ctx.fillStyle = "#000";
					ctx.fill();
					break;
				case "grin":
					ctx.arc(x, y + 2, 5, 0, Math.PI);
					ctx.closePath();
					ctx.fillStyle = "#fff";
					ctx.fill();
					break;
				case "ko":
					ctx.moveTo(x - 3, y + 5); ctx.lineTo(x + 3, y + 2);
					break;
				case "tongue":
					ctx.moveTo(x - 3, y + 2); ctx.lineTo(x + 3, y + 2);
					ctx.stroke();
					ctx.fillStyle = "#ff6666";
					ctx.beginPath();
					ctx.arc(x + 2, y + 3, 3, 0, Math.PI);
					ctx.fill();
					break;
				case "uwu": 
				case "cat":
					ctx.arc(x - 2, y + 3, 2, 0, Math.PI); 
					ctx.stroke();
					ctx.beginPath();
					ctx.arc(x + 2, y + 3, 2, 0, Math.PI);
					break;
				case "angry":
					ctx.arc(x, y + 6, 3, 0, Math.PI * 2);
					ctx.fillStyle = "#000";
					ctx.fill();
					break;
				case "skeptical":
					ctx.moveTo(x - 4, y + 5); ctx.lineTo(x + 4, y + 2);
					break;
				case "neutral":
					ctx.moveTo(x - 4, y + 4); ctx.lineTo(x + 4, y + 4);
					break;
				case "blush":
					ctx.arc(x, y + 4, 3, 0.2 * Math.PI, 0.8 * Math.PI);
					break;
				default:
					ctx.arc(x, y + 2, 4, 0.2 * Math.PI, 0.8 * Math.PI);
					break;
			}
			ctx.stroke();
			ctx.restore();
		},
        torso: (ctx, hX, hY, bX, bY) => {
            ctx.beginPath(); 
            ctx.moveTo(hX, hY + 10);
            ctx.lineTo(bX, bY); 
            ctx.stroke();
        },
        limbs: (ctx, startX, startY, endX, endY, joint = null) => {
            ctx.beginPath(); 
            ctx.moveTo(startX, startY);
            if (joint) ctx.lineTo(joint.x, joint.y);
            ctx.lineTo(endX, endY);
            ctx.stroke();
        }
    },
	"beast": {
        leg: (ctx, x, y, angle, length, phase) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // Create a "jointed" look using the phase (animation time)
            const kneeX = (length / 2) + Math.cos(phase) * 5;
            const kneeY = Math.sin(phase) * 10;
            
            const footX = length + Math.cos(phase - 0.5) * 5;
            const footY = 15 + Math.sin(phase - 0.5) * 5;

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(kneeX, kneeY); // Hip to Knee
            ctx.lineTo(footX, footY); // Knee to Foot
            ctx.stroke();
            
            ctx.restore();
        },
        body: (ctx, x, y, width, color) => {
            ctx.save();
            ctx.translate(x, y);
            
            // Draw a main body segment
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(0, -5, width * 1.5, width, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Add a "hump" or back segment for more beast-like silhouette
            ctx.beginPath();
            ctx.ellipse(-width * 0.5, -width * 0.8, width, width * 0.6, 0.2, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            ctx.restore();
        }
    }
};

const MONSTER_PARTS = {
	
	
}


const MONSTER_EFFECTS = {
	heatwave: (ctx, now) => {
        ctx.save();
        const time = now / 1000;
        ctx.globalCompositeOperation = "overlay";
        ctx.fillStyle = `rgba(255, 80, 0, ${0.08 + Math.sin(time * 1.5) * 0.03})`; // Slower pulse
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.restore();
    },

	storm: (ctx, now, data) => {
        const { stormClouds } = data;
        
        // A. Global Atmosphere (Rare, Soft Flashes)
        // Reduced from 0.98 to 0.995 (very rare) and lower opacity
        if (Math.random() > 0.995) {
            ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
            ctx.fillRect(0, 0, c.width, c.height);
        }

        // Rain particles
        ctx.strokeStyle = "rgba(174, 194, 224, 0.3)";
        for (let i = 0; i < 8; i++) {
            let rx = Math.random() * c.width;
            let ry = Math.random() * c.height;
            ctx.beginPath();
            ctx.moveTo(rx, ry);
            ctx.lineTo(rx - 3, ry + 10);
            ctx.stroke();
        }

        // B. Specific Lightning Bolts
        stormClouds.forEach(cloud => {
            if (cloud.triggerLightning && now < cloud.triggerLightning) {
                ctx.save();
                ctx.strokeStyle = "rgba(255, 255, 255, 0.9)";
                ctx.lineWidth = 2;
                ctx.shadowBlur = 10;
                ctx.shadowColor = "cyan";
                ctx.beginPath();
                ctx.moveTo(cloud.x, cloud.y + 10);
                ctx.lineTo(cloud.x - 10, cloud.y + 30);
                ctx.lineTo(cloud.x + 5, cloud.y + 45);
                ctx.lineTo(cloud.x - 5, 540); 
                ctx.stroke();
                ctx.restore();
            }
        });
    },
	gnomePrank: (ctx, now, data) => {
        const { activeGnomes } = data;
        
        activeGnomes.forEach(gnome => {
            // If the logic function recently triggered a prank (within the last 1 second)
            if (gnome.lastPrank && now - gnome.lastPrank < 1000) {
                const progress = (now - gnome.lastPrank) / 1000;
                
                ctx.save();
                ctx.translate(gnome.x, gnome.y - 20);
                
                // Draw a few gold "pixel" particles popping out of the gnome
                ctx.fillStyle = "gold";
                for (let i = 0; i < 5; i++) {
                    const angle = (i * 72) * (Math.PI / 180);
                    const dist = 10 + (progress * 30);
                    const size = 3 * (1 - progress); // Shrink as they fade
                    
                    ctx.beginPath();
                    ctx.rect(
                        Math.cos(angle) * dist, 
                        Math.sin(angle) * dist - (progress * 20), 
                        size, size
                    );
                    ctx.fill();
                }
                ctx.restore();
            }
        });
    },
	voidWarp: (ctx, now, data) => {
		const { singularities } = data;
		ctx.save();
		singularities.forEach(s => {
			const time = now / 1000;
			// Center of the singularity is usually ~25px above its base/y
			const centerX = s.x;
			const centerY = s.y - 25; 

			for (let i = 0; i < 12; i++) {
				// Added a spiral rotation to the angle based on distance
				const loop = (now % 1500) / 1500; 
				const dist = 120 * (1 - loop);
				const angle = (i / 12) * Math.PI * 2 + (time * 3) + (loop * 2);
				
				// Fade particles in as they appear, out as they hit the center
				const alpha = loop < 0.2 ? loop * 5 : (1 - loop);
				ctx.fillStyle = `rgba(180, 0, 255, ${alpha})`;
				
				ctx.beginPath();
				ctx.arc(
					centerX + Math.cos(angle) * dist, 
					centerY + Math.sin(angle) * dist, 
					1 + loop * 2, 0, Math.PI * 2
				);
				ctx.fill();
			}
		});
		ctx.restore();
	}
};
const MONSTER_STYLES = {
/*     blob: (ctx, e, now, cfg) => {
        const wobble = Math.sin(now / 150) * 5;
		ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, (cfg.bodyW || 20) + wobble, (cfg.bodyH || 15) - wobble, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
    },
    spider: (ctx, e, now, cfg) => {
        // Arachnid movement logic: Alternating leg pairs
        const walk = Math.sin(now / 100) * 12;
        ctx.strokeStyle = e.color;
        ctx.lineWidth = cfg.legWidth || 2;
        for (let i = 0; i < 8; i++) {
            const side = i < 4 ? -1 : 1;
            const angle = (i % 4) * (Math.PI / 4) - Math.PI/2;
            const move = (i % 2 === 0) ? walk : -walk;
            
            ctx.beginPath();
            ctx.moveTo(0, 0);
            // Jointed legs that "stomp"
            ctx.lineTo(Math.cos(angle) * 15 * side, -10 + move); 
            ctx.lineTo(Math.cos(angle) * 25 * side, (cfg.legH || 15));
            ctx.stroke();
        }
        // Thorax/Abdomen
        ctx.beginPath();
        ctx.ellipse(0, 0, cfg.bodyW || 15, cfg.bodyH || 12, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
    },
    canine: (ctx, e, now, cfg) => {
        const walk = Math.sin(now / 120) * 15;
        // 4 Legs
        ctx.lineWidth = 4;
        [ -10, 10 ].forEach((xOffset, i) => {
            const move = (i === 0) ? walk : -walk;
            // Front & Back Legs
            ctx.beginPath();
            ctx.moveTo(xOffset, 5);
            ctx.lineTo(xOffset + move, 20);
            ctx.stroke();
        });
        // Fuzzier body (Wolf style)
        if (cfg.fuzz) {
            ctx.beginPath();
            for(let a=0; a<Math.PI*2; a+=0.4) {
                let r = (cfg.bodyW || 25) + (Math.random() * 5);
                ctx.lineTo(Math.cos(a)*r, Math.sin(a)*r - 5);
            }
            ctx.closePath();
        } else {
            ctx.beginPath();
            ctx.roundRect(-25, -15, 50, 20, 10);
        }
        ctx.fill(); ctx.stroke();
    }, */
	blob: (ctx, e, now, cfg) => {
        // --- BOUNCE & SQUASH ---
        const bounce = Math.abs(Math.sin(now / 250)) * 15;
        const squash = bounce * 0.2;
        ctx.translate(0, -bounce); 

        // Body
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, (cfg.bodyW || 25) + squash, (cfg.bodyH || 20) - squash, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();

        // --- GOOGLY EYES ---
        const jiggleX = Math.sin(now / 100) * 2;
        const jiggleY = Math.cos(now / 100) * 2;
        [-7, 7].forEach(side => {
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(side, -5, 6, 0, Math.PI * 2);
            ctx.fill(); ctx.stroke();
            // Pupil
            ctx.fillStyle = "#000";
            ctx.beginPath();
            ctx.arc(side + jiggleX, -5 + jiggleY, 2.5, 0, Math.PI * 2);
            ctx.fill();
        });
    },

	spider: (ctx, e, now, cfg) => {
		let offsetX = 0;
		let offsetY = 0;

		// --- 1. HANGING & CLIMBING LOGIC ---
		if (e.isHanging) {
			// Initialize movement properties if they don't exist
			if (e.hangY === undefined) e.hangY = e.y; 
			
			// Randomly decide to skitter up/down or drop
			// We use 'now' and the enemy's hash (e.x) to ensure they don't all act at once
			const seed = Math.sin(now / 2000 + e.x);
			
			if (seed > 0.8) { 
				// Climb up slightly
				e.y -= 0.5;
			} else if (seed < -0.95) {
				// Drop logic: check if we should drop all the way
				// 1% chance per frame when in "drop zone" to commit to the floor
				if (Math.random() < 0.01) {
					e.isHanging = false; 
					e.isDropping = true;
				} else {
					e.y += 0.5; // Just lowering the web
				}
			}

			// Draw the web string
			ctx.save();
			ctx.strokeStyle = "rgba(238, 238, 238, 0.6)";
			ctx.setLineDash([5, 3]); // Optional: makes web look "silky"
			ctx.beginPath();
			ctx.moveTo(0, 0);
			ctx.lineTo(0, -e.y); // Strings up to the ceiling
			ctx.stroke();
			ctx.restore();

			// Swaying rotation
			ctx.rotate(Math.sin(now / 500 + e.x) * 0.15);
		} 
		
		// --- 2. DROPPING TO FLOOR LOGIC ---
		else if (e.isDropping) {
			const floorY = 540; // Adjust this to your actual ground level
			if (e.y < floorY) {
				e.y += 8; // Fast drop speed
				// Draw a trailing web line while falling
				ctx.save();
				ctx.strokeStyle = "rgba(238, 238, 238, 0.4)";
				ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -e.y); ctx.stroke();
				ctx.restore();
			} else {
				e.y = floorY;
				e.isDropping = false; // It has landed!
			}
		}
		
		// --- 3. GROUNDED SKITTER LOGIC ---
		else {
			const jitter = Math.sin(now / 150) * 8;
			const roam = Math.sin(now / 1200 + e.x) * 40;
			offsetX = jitter + roam;
			offsetY = Math.sin(now / 40) * 2;
		}

		ctx.save();
		ctx.translate(offsetX, offsetY);

		// --- 4. LEGS (Adaptive) ---
		// If e.isDropping, legs reach UP. If isHanging, legs are TUCKED.
		let legState = "walking";
		if (e.isHanging) legState = "hanging";
		if (e.isDropping) legState = "falling";

		const walk = legState === "walking" ? Math.sin(now / 100) * 12 : Math.sin(now / 400) * 5;
		ctx.strokeStyle = e.color || "#222";
		ctx.lineWidth = cfg.legWidth || 2;
		
		for (let i = 0; i < 8; i++) {
			const side = i < 4 ? -1 : 1;
			const angle = (i % 4) * (Math.PI / 4) - Math.PI/2;
			const move = (i % 2 === 0) ? walk : -walk;
			
			ctx.beginPath();
			ctx.moveTo(0, 0);
			
			if (legState === "hanging") {
				ctx.lineTo(Math.cos(angle) * 10 * side, -15 + move);
				ctx.lineTo(Math.cos(angle) * 20 * side, -25);
			} else if (legState === "falling") {
				// Legs reaching up as it falls
				ctx.lineTo(Math.cos(angle) * 15 * side, -20 + move);
				ctx.lineTo(Math.cos(angle) * 10 * side, -35);
			} else {
				ctx.lineTo(Math.cos(angle) * 15 * side, -10 + move); 
				ctx.lineTo(Math.cos(angle) * 25 * side, (cfg.legH || 15));
			}
			ctx.stroke();
		}

		// --- 5. BODY & EYES ---
		ctx.fillStyle = e.color || "#222";
		ctx.beginPath();
		ctx.ellipse(0, 0, cfg.bodyW || 15, cfg.bodyH || 12, 0, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		if (cfg.scale >= 1.0) {
			ctx.fillStyle = "#f00";
			const eyeOffset = Math.sin(now / 100) * 0.5;
			[{x:-4, y:-2}, {x:4, y:-2}, {x:-2, y:-5}, {x:2, y:-5}].forEach(p => {
				ctx.beginPath();
				ctx.arc(p.x + eyeOffset, p.y, 1.5, 0, Math.PI * 2);
				ctx.fill();
			});
		}

		ctx.restore();
	},
	canine: (ctx, e, now, cfg) => {
		const walk = Math.sin(now / 150) * 12;
		const breathe = Math.sin(now / 300) * 2;
		const bodyW = cfg.bodyW || 25;
		const bodyH = (cfg.bodyH || 15) + breathe; // Breathe affects height slightly

		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;

		// 1. TAIL
		ctx.save();
		ctx.translate(bodyW - 5, -5);
		ctx.rotate(Math.sin(now / 100) * 0.4 + 0.5); 
		ctx.fillStyle = e.color;
		ctx.beginPath();
		ctx.ellipse(10, 0, 12, 4, 0, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();
		ctx.restore();

		// 2. LEGS
		ctx.lineWidth = 3;
		[ -bodyW + 8, bodyW - 8 ].forEach((xOff, i) => {
			const move = (i === 0) ? walk : -walk;
			ctx.beginPath();
			ctx.moveTo(xOff, 5);
			ctx.lineTo(xOff + move, 20);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(xOff + 5, 5);
			ctx.lineTo(xOff + 5 - move, 20);
			ctx.stroke();
		});

		// 3. BODY (With static fur strokes)
		ctx.fillStyle = e.color;
		ctx.beginPath();
		// Base smooth ellipse
		ctx.ellipse(0, 0, bodyW, bodyH, 0, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		if (cfg.fuzz) {
			ctx.beginPath();
			// Add static fur strokes around the perimeter
			for (let a = 0; a < Math.PI * 2; a += 0.6) {
				// We use the angle 'a' to determine the position, 
				// no Math.random() so it stays stable.
				const fx = Math.cos(a) * bodyW;
				const fy = Math.sin(a) * bodyH;
				
				// Draw a small "V" shape for fur spikes
				ctx.moveTo(fx, fy);
				// Points outward slightly
				ctx.lineTo(fx * 1.2, fy * 1.2); 
				ctx.lineTo(fx * 1.1, fy * 0.9);
			}
			ctx.stroke();
		}

		// 4. HEAD & SNOUT
		const head = cfg.headAnchor || { x: -bodyW + 5, y: -10 };
		ctx.save();
		ctx.translate(head.x, head.y + (breathe * 0.5));
		
		// Ears
		ctx.fillStyle = e.color;
		[-4, 4].forEach(ex => {
			ctx.beginPath();
			ctx.moveTo(ex, -5);
			ctx.lineTo(ex - 3, -15);
			ctx.lineTo(ex + 3, -15);
			ctx.fill(); ctx.stroke();
			// Add a little fur to ears too
			if (cfg.fuzz) {
				ctx.moveTo(ex - 3, -15);
				ctx.lineTo(ex - 5, -18);
			}
		});

		ctx.beginPath();
		ctx.ellipse(0, 0, 10, 8, 0, 0, Math.PI * 2); // Skull
		ctx.ellipse(-8, 3, 8, 5, 0, 0, Math.PI * 2); // Muzzle
		ctx.fill(); ctx.stroke();

		// Eyes
		ctx.fillStyle = (cfg.glow) ? (cfg.glowColor || "#f00") : "#000";
		if (cfg.glow) {
			ctx.shadowBlur = 10;
			ctx.shadowColor = cfg.glowColor || "#f00";
		}
		ctx.beginPath();
		ctx.arc(-2, -2, 2, 0, Math.PI * 2);
		ctx.arc(-8, -2, 1.5, 0, Math.PI * 2);
		ctx.fill();
		
		ctx.restore();
	},
    phalic: (ctx, e, now, cfg) => {
        const sway = Math.sin(now / 200) * 0.1;
        ctx.rotate(sway);
        // Shaft
        ctx.beginPath();
        ctx.roundRect(-10, -50, 20, 50, 8);
        ctx.fill(); ctx.stroke();
        // Tip
        ctx.beginPath();
        ctx.arc(0, -50, 12, Math.PI, 0);
        ctx.fillStyle = "#ffb6c1"; // Pinkish tip
        ctx.fill(); ctx.stroke();
        // Base
        ctx.fillStyle = e.color;
        ctx.beginPath();
        ctx.arc(-8, 0, 10, 0, Math.PI * 2);
        ctx.arc(8, 0, 10, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
    },
    beast: (ctx, e, now, cfg) => {
        ctx.strokeStyle = e.color;
        ctx.lineWidth = 2;
        for(let i=0; i < (cfg.legCount || 8); i++) {
            const side = i < (cfg.legCount/2 || 4) ? 1 : -1;
            const phase = (now / 150) + (i * 0.5);
            // Assuming BODY_PARTS is global
            BODY_PARTS.beast.leg(ctx, 0, 10, side === 1 ? 0 : Math.PI, cfg.legH || 25, phase);
        }
        BODY_PARTS.beast.body(ctx, 0, 10, cfg.bodyW || 15, e.color);
    },
	horror: (ctx, e, now, cfg) => {
		const time = now / 1000;
		const bodyW = cfg.bodyW || 20;
		const color = e.color || "#ff00ff";
		
		// 1. PHASE SHIFT (The "Cooler" Effect)
		// Draws a faint, expanding ring/aura that "pulses" out from the center
		const phase = (now % 1000) / 1000;
		ctx.save();
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.globalAlpha = 1 - phase;
		ctx.beginPath();
		ctx.arc(0, 0, bodyW + (phase * 30), 0, Math.PI * 2);
		ctx.stroke();
		ctx.restore();

		// 2. FLUID TENTACLES
		const legCount = cfg.legCount || 6;
		ctx.strokeStyle = color;
		ctx.lineWidth = 3;
		for (let i = 0; i < legCount; i++) {
			// Slow rotation + independent waving
			const baseAngle = (i / legCount) * Math.PI * 2 + (time * 0.2);
			const wave = Math.sin(time * 3 + i) * 0.5;
			const angle = baseAngle + wave;
			
			const reach = 45 + Math.sin(time * 2 + i) * 10;
			
			ctx.beginPath();
			ctx.moveTo(0, 0);
			// "S" curve math for a more liquid feel
			const cp1x = Math.cos(angle - 0.4) * (reach * 0.6);
			const cp1y = Math.sin(angle - 0.4) * (reach * 0.6);
			const endX = Math.cos(angle) * reach;
			const endY = Math.sin(angle) * reach;
			
			ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
			ctx.stroke();

			// Glowing tips instead of hooks
			ctx.fillStyle = "#fff";
			ctx.shadowBlur = 5;
			ctx.shadowColor = color;
			ctx.beginPath();
			ctx.arc(endX, endY, 2, 0, Math.PI * 2);
			ctx.fill();
			ctx.shadowBlur = 0;
		}

		// 3. THE VOID CORE (Shifting mass)
		ctx.fillStyle = color;
		ctx.beginPath();
		for (let a = 0; a < Math.PI * 2; a += 0.3) {
			// Complex noise: layering two sines for a "breathing meat" effect
			const noise = Math.sin(time * 2 + a * 3) * 3 + Math.cos(time * 4 + a * 2) * 2;
			const r = bodyW + noise;
			const x = Math.cos(a) * r;
			const y = Math.sin(a) * r;
			if (a === 0) ctx.moveTo(x, y);
			else ctx.lineTo(x, y);
		}
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// 4. THE "OBSERVER" EYES
		const eyeSeed = (e.id || 1) * 100;
		for (let i = 0; i < 5; i++) {
			// Eyes drift slowly in their sockets
			const driftX = Math.sin(time + i) * 2;
			const driftY = Math.cos(time * 0.7 + i) * 2;
			const eyeX = Math.sin(eyeSeed + i) * (bodyW * 0.5) + driftX;
			const eyeY = Math.cos(eyeSeed + i) * (bodyW * 0.5) + driftY;
			
			// Pupils that always track "The Creator" (0,0 world center or mouse)
			// Here we just make them look frantic
			ctx.fillStyle = "#fff";
			ctx.beginPath();
			ctx.arc(eyeX, eyeY, 3.5, 0, Math.PI * 2);
			ctx.fill();
			
			ctx.fillStyle = "#000";
			ctx.beginPath();
			ctx.arc(eyeX + Math.sin(time * 4 + i) * 1.5, eyeY + Math.cos(time * 4 + i) * 1.5, 1.5, 0, Math.PI * 2);
			ctx.fill();
		}

		// 5. STATIC OVERLAY (Subtle scanlines)
		ctx.strokeStyle = "rgba(255,255,255,0.1)";
		ctx.lineWidth = 1;
		for(let l = -bodyW; l < bodyW; l += 4) {
			ctx.beginPath();
			ctx.moveTo(-bodyW, l);
			ctx.lineTo(bodyW, l);
			ctx.stroke();
		}
	},
	wraith: (ctx, e, now, cfg) => {
		const floatY = Math.sin(now / 400) * 15; // Slow, ghostly hovering
		const wave = Math.sin(now / 200) * 5;
		const bodyW = cfg.bodyW || 15;
		const bodyH = cfg.bodyH || 40;
		const color = e.color || "#fff";
		const glowColor = cfg.glowColor || "#00d4ff";

		ctx.save();
		ctx.translate(0, floatY);

		// 1. GHOSTLY GLOW
		if (cfg.glow) {
			ctx.shadowBlur = 20;
			ctx.shadowColor = glowColor;
		}

		// 2. THE CLOAK / BODY (Trailing effect)
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(-bodyW, 0);
		// Head/Shoulders
		ctx.bezierCurveTo(-bodyW, -bodyH, bodyW, -bodyH, bodyW, 0);
		// The "Tattered" Bottom
		for (let i = 0; i <= 3; i++) {
			const x = bodyW - (i * (bodyW * 2 / 3));
			const tailWarp = Math.sin((now / 150) + i) * 10;
			ctx.quadraticCurveTo(x, bodyH + tailWarp, x - (bodyW / 1.5), 0);
		}
		ctx.fill();

		// 3. FLOATING HANDS
		ctx.lineWidth = 2;
		ctx.strokeStyle = color;
		[-1, 1].forEach(side => {
			const handX = side * (bodyW + 15 + wave);
			const handY = Math.cos(now / 300) * 10;
			
			// Arm "Mist"
			ctx.setLineDash([5, 5]);
			ctx.beginPath();
			ctx.moveTo(side * bodyW, -10);
			ctx.quadraticCurveTo(side * (bodyW + 10), -10, handX, handY);
			ctx.stroke();
			ctx.setLineDash([]);

			// Hand
			ctx.beginPath();
			ctx.arc(handX, handY, 4, 0, Math.PI * 2);
			ctx.fill();
		});

		// 4. THE FACE (Condition for Shadow variants)
		ctx.shadowBlur = 0; 
		
		// Check if it's a Shadow variant based on name or color
		if (e.name?.includes("Shadow") || color === "#1a1a1a") {
			// ShadowWraiths get piercing red pin-prick eyes
			ctx.fillStyle = "#ff0044"; 
			ctx.shadowBlur = 10;
			ctx.shadowColor = "#ff0044";
			[-4, 4].forEach(ex => {
				ctx.beginPath();
				ctx.arc(ex, -bodyH * 0.6, 1.5, 0, Math.PI * 2);
				ctx.fill();
			});
		} else {
			// Standard wraith empty sockets
			ctx.fillStyle = "rgba(0,0,0,0.8)";
			[-4, 4].forEach(ex => {
				ctx.beginPath();
				// Spooky elongated eyes
				ctx.ellipse(ex, -bodyH * 0.6, 3, 5, 0, 0, Math.PI * 2);
				ctx.fill();
			});
		}

		ctx.restore();
	},
	titan: (ctx, e, now, cfg) => {
		const time = now / 1000;
		const breathe = Math.sin(time * 2) * 5;
		const color = e.color || "#fff";
		const glowColor = cfg.glowColor || "#00d4ff";

		ctx.save();
		
		// 1. ASTRAL GLOW (The aura around the titan)
		ctx.shadowBlur = 30;
		ctx.shadowColor = glowColor;

		// 2. THE CORE (Central chest piece)
		ctx.fillStyle = glowColor;
		ctx.beginPath();
		ctx.arc(0, -40 + breathe, 15, 0, Math.PI * 2);
		ctx.fill();

		// 3. ARMOR PLATES (Floating Stone/Metal)
		ctx.fillStyle = color;
		ctx.strokeStyle = "#333";
		ctx.lineWidth = 2;

		// Torso/Shoulders
		ctx.beginPath();
		ctx.moveTo(-35, -55 + breathe);
		ctx.lineTo(35, -55 + breathe);
		ctx.lineTo(25, -20 + breathe);
		ctx.lineTo(-25, -20 + breathe);
		ctx.closePath();
		ctx.fill(); ctx.stroke();

		// Floating Arms (Bulky gauntlets)
		[-1, 1].forEach(side => {
			const swing = Math.sin(time + (side * 0.5)) * 10;
			ctx.save();
			ctx.translate(side * 45, -30 + swing);
			ctx.rotate(side * 0.2);
			// Gauntlet
			ctx.beginPath();
			ctx.roundRect(-10, -5, 20, 35, 5);
			ctx.fill(); ctx.stroke();
			// Joint Glow
			ctx.fillStyle = glowColor;
			ctx.beginPath();
			ctx.arc(0, 0, 4, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		});

		// 4. THE LEGS (Heavy Pillars)
		[-1, 1].forEach(side => {
			ctx.beginPath();
			ctx.moveTo(side * 15, -20 + breathe);
			ctx.lineTo(side * 20, 10);
			ctx.lineTo(side * 5, 10);
			ctx.closePath();
			ctx.fill(); ctx.stroke();
		});

		// 5. THE HEAD (Floating Crown/Mask)
		ctx.save();
		ctx.translate(0, -70 + (breathe * 1.5));
		// Halo/Crown
		ctx.strokeStyle = glowColor;
		ctx.beginPath();
		ctx.arc(0, 0, 18, Math.PI, 0);
		ctx.stroke();
		// Face Plate
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(-8, -5);
		ctx.lineTo(8, -5);
		ctx.lineTo(0, 10);
		ctx.closePath();
		ctx.fill(); ctx.stroke();
		ctx.restore();

		ctx.restore();
	},
	dragon: (ctx, e, now, cfg) => {
		const scale = e.scale || 1;
		const color = e.color || "#2e0854";
		const time = now / 1000;
		
		// 1. WINGS (Draw behind body)
		const flap = Math.sin(now / 200) * 0.6;
		ctx.save();
		ctx.fillStyle = color;
		ctx.globalAlpha = 0.7;
		[-1, 1].forEach(side => {
			ctx.save();
			ctx.rotate(side * (0.8 + flap));
			ctx.beginPath();
			// Webbed wing shape
			ctx.moveTo(0, 0);
			ctx.quadraticCurveTo(side * 40, -40, side * 60, 10);
			ctx.quadraticCurveTo(side * 30, 20, 0, 0);
			ctx.fill();
			ctx.strokeStyle = "#000";
			ctx.stroke();
			ctx.restore();
		});
		ctx.restore();

		// 2. SEGMENTED BODY (Serpentine)
		const segmentCount = 6;
		for (let i = segmentCount; i >= 0; i--) {
			const segmentTime = time - (i * 0.15);
			const offX = i * 15;
			const offY = Math.sin(segmentTime * 4) * 10;
			const segScale = 1 - (i * 0.12); // Tapers toward the tail

			ctx.save();
			ctx.translate(offX, offY);
			ctx.scale(segScale, segScale);
			
			ctx.fillStyle = color;
			ctx.beginPath();
			ctx.arc(0, 0, 15, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();

			// Add "Void Spikes" on the back
			ctx.beginPath();
			ctx.moveTo(0, -15);
			ctx.lineTo(5, -25);
			ctx.lineTo(-5, -25);
			ctx.fill();

			ctx.restore();
		}

		// 3. HEAD (Draw on top of the front segment)
		ctx.save();
		const headBob = Math.sin(time * 4) * 5;
		ctx.translate(-5, headBob);
		
		// Dragon Skull
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.ellipse(0, 0, 18, 12, 0, 0, Math.PI * 2); // Main head
		ctx.ellipse(-12, 5, 12, 7, 0.2, 0, Math.PI * 2); // Snout
		ctx.fill();
		ctx.stroke();

		// Horns
		ctx.lineWidth = 3;
		[-5, 5].forEach(hx => {
			ctx.beginPath();
			ctx.moveTo(hx, -8);
			ctx.quadraticCurveTo(hx + 10, -25, hx + 15, -20);
			ctx.stroke();
		});

		// Glowing Void Eyes
		ctx.fillStyle = "#ff00ff";
		ctx.shadowBlur = 10;
		ctx.shadowColor = "#ff00ff";
		ctx.beginPath();
		ctx.arc(-5, -2, 3, 0, Math.PI * 2);
		ctx.fill();
		
		ctx.restore();
	},
	horse: (ctx, e, now, cfg) => {
		const time = now / 1000;
		const walk = Math.sin(now / 120) * 12;
		const breathe = Math.sin(now / 300) * 2;
		const hover = cfg.wings ? Math.sin(now / 200) * 10 : 0;
		
		// Proportions: Horses have shorter, taller bodies than dogs
		const bodyW = cfg.bodyW || 22; 
		const bodyH = cfg.bodyH || 18; 
		const color = e.color || "#8b4513";

		ctx.save();
		ctx.translate(0, hover);

		// 1. WINGS (Pegasus) - Drawn behind body
		if (cfg.wings) {
			const flap = Math.sin(now / 150) * 0.8;
			ctx.save();
			ctx.fillStyle = "rgba(240, 240, 255, 0.9)";
			[-1, 1].forEach(side => {
				ctx.beginPath();
				ctx.ellipse(side * 8, -15, 25, 10, side * (0.6 + flap), 0, Math.PI * 2);
				ctx.fill(); ctx.stroke();
			});
			ctx.restore();
		}

		// 2. TAIL (Bushy)
		ctx.save();
		ctx.translate(bodyW - 5, -bodyH + 5);
		ctx.rotate(Math.sin(now / 200) * 0.4 + 0.5);
		ctx.fillStyle = "#332211"; // Mane/Tail color
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.quadraticCurveTo(15, 5, 10, 35);
		ctx.quadraticCurveTo(5, 35, 0, 10);
		ctx.fill(); ctx.stroke();
		ctx.restore();

		// 3. LEGS (Taller and joints added)
		ctx.lineWidth = 3.5;
		ctx.strokeStyle = "#000";
		[-bodyW + 8, bodyW - 8].forEach((xOff, i) => {
			const move = (i === 0) ? walk : -walk;
			// Front and back pairs
			[0, 4].forEach(z => {
				ctx.beginPath();
				ctx.moveTo(xOff + z, 0);
				ctx.lineTo(xOff + z + move * 0.3, 15); // Joint
				ctx.lineTo(xOff + z + move, 32);       // Hoof
				ctx.stroke();
				// Hoof detail
				ctx.fillStyle = "#222";
				ctx.fillRect(xOff + z + move - 3, 30, 6, 5);
			});
		});

		// 4. BODY (Deep chest, angled upward)
		ctx.save();
		ctx.rotate(-0.1); // Angled up at the front
		ctx.fillStyle = color;
		ctx.beginPath();
		// A more anatomical shape: deeper at the chest
		ctx.roundRect(-bodyW, -bodyH + breathe, bodyW * 2, bodyH * 1.8, 12);
		ctx.fill(); ctx.stroke();
		ctx.restore();

		// 5. NECK & HEAD
		ctx.save();
		ctx.translate(-bodyW + 5, -bodyH + 5 + breathe);
		
		// Arched Neck
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.moveTo(0, 5);
		ctx.quadraticCurveTo(-5, -15, -15, -25); // Arched front
		ctx.lineTo(-5, -30);
		ctx.lineTo(12, -5); // Back of neck
		ctx.fill(); ctx.stroke();

		// Mane (Hair)
		ctx.fillStyle = "#332211";
		ctx.beginPath();
		ctx.moveTo(5, -10);
		ctx.quadraticCurveTo(15, -20, 10, -35);
		ctx.lineTo(0, -25);
		ctx.fill();

		// Skull & Muzzle
		ctx.translate(-15, -28);
		ctx.rotate(0.4); // Tilt head down slightly
		ctx.fillStyle = color;
		ctx.beginPath();
		ctx.roundRect(-6, -6, 20, 10, 4); // Muzzle
		ctx.roundRect(-2, -10, 12, 14, 6); // Skull
		ctx.fill(); ctx.stroke();

		// Eye
		ctx.fillStyle = "#000";
		ctx.beginPath(); ctx.arc(2, -4, 2, 0, Math.PI * 2); ctx.fill();

		// Ears
		ctx.beginPath();
		ctx.ellipse(5, -11, 4, 2, -Math.PI/4, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// 6. HORN (Improved Spiral)
		if (cfg.horns) {
			ctx.save();
			ctx.translate(2, -12);
			ctx.rotate(-0.6);
			if (cfg.glow) { ctx.shadowBlur = 15; ctx.shadowColor = "gold"; }
			ctx.fillStyle = "#fff";
			ctx.beginPath();
			ctx.moveTo(-3, 0); ctx.lineTo(0, -30); ctx.lineTo(3, 0);
			ctx.fill(); ctx.stroke();
			ctx.restore();
		}
		
		ctx.restore(); // End Head/Neck

		// 7. RAINBOW TRAIL
		if (cfg.horns && cfg.glow) {
			ctx.save();
			ctx.globalCompositeOperation = "screen";
			for (let i = 0; i < 5; i++) {
				const colors = ["#ff4d4d", "#ffcc00", "#33ff33", "#33ccff", "#cc33ff"];
				ctx.fillStyle = colors[i];
				ctx.globalAlpha = 0.4 - (i * 0.05);
				ctx.beginPath();
				ctx.arc(bodyW + 10 + (i * 10), Math.sin(time * 6 + i) * 10, 8 - i, 0, Math.PI * 2);
				ctx.fill();
			}
			ctx.restore();
		}

		ctx.restore();
	},
	cow: (ctx, e, now, cfg) => {
		// 1. IDENTITY & PERSISTENCE
		// We use e.x (spawn position) or e.id as a seed so spots stay fixed to the cow
		const seed = e.id || Math.floor(e.maxHp); 
		const isCalf = e.name.toLowerCase() === "calf";
		const isDairy = e.name.toLowerCase() === "dairy_cow";
		
		// Scaling for types
		const scale = isCalf ? 0.6 : (isDairy ? 1.2 : 1.0);
		const bodyW = (cfg.bodyW || 30) * scale;
		const bodyH = (cfg.bodyH || 20) * scale;
		
		// 2. MOO ANIMATION
		// Cow moos every ~5 seconds for a brief moment
		const mooCycle = (now + (seed * 100)) % 5000;
		const isMooing = mooCycle < 600; // Open mouth for 0.6 seconds
		const mouthOpen = isMooing ? Math.sin(now / 50) * 5 : 0;

		const walk = Math.sin(now / 180) * 10;
		
		ctx.save();
		// Subtle breathing or head bob
		ctx.translate(0, isMooing ? -2 : 0);

		// 3. LEGS (Back)
		ctx.lineWidth = 3 * scale;
		ctx.strokeStyle = "#000";
		[-bodyW + 8, bodyW - 12].forEach((xOff, i) => {
			const move = (i === 0) ? walk : -walk;
			ctx.beginPath();
			ctx.moveTo(xOff, 5);
			ctx.lineTo(xOff + (move * 0.3), 20 * scale);
			ctx.stroke();
		});

		// 4. UDDERS (Dairy Cow specific or large Cow)
		if (isDairy || (cfg.udders && !isCalf)) {
			ctx.fillStyle = "#ffb6c1";
			ctx.beginPath();
			ctx.ellipse(5, 8 * scale, 12 * scale, 8 * scale, 0, 0, Math.PI * 2);
			ctx.fill();
		}

		// 5. BODY & STATIC SPOTS
		ctx.fillStyle = e.color || "#ffffff";
		ctx.beginPath();
		ctx.roundRect(-bodyW, -bodyH, bodyW * 2, bodyH * 1.8, 10 * scale);
		ctx.fill();
		ctx.stroke();

		// SPOTS: Seeded random, not animated
		ctx.save();
		ctx.clip(); 
		ctx.fillStyle = "#1a1a1a";
		// Generate 6 spots based on the cow's seed
		for (let i = 1; i <= 6; i++) {
			const spotX = Math.sin(seed * i) * bodyW;
			const spotY = Math.cos(seed * i) * bodyH - (bodyH * 0.2);
			const spotSize = (Math.abs(Math.sin(seed + i)) * 10 + 5) * scale;
			ctx.beginPath();
			ctx.ellipse(spotX, spotY, spotSize * 1.5, spotSize, seed * i, 0, Math.PI * 2);
			ctx.fill();
		}
		ctx.restore();

		// 6. HEAD & MOOING
		ctx.save();
		ctx.translate(-bodyW, -bodyH * 0.4);
		
		// Ears (flapping slightly if mooing)
		const earFlick = isMooing ? Math.sin(now / 100) * 0.2 : 0;
		[-1, 1].forEach(side => {
			ctx.fillStyle = e.color || "#ffffff";
			ctx.beginPath();
			ctx.ellipse(side * 8, -5, 6 * scale, 3 * scale, (side * 0.5) + earFlick, 0, Math.PI * 2);
			ctx.fill(); ctx.stroke();
		});

		// Face
		ctx.beginPath();
		ctx.roundRect(-12 * scale, -10 * scale, 22 * scale, 22 * scale, 5 * scale);
		ctx.fill(); ctx.stroke();

		// Muzzle + Mooing logic
		ctx.fillStyle = "#ffb6c1";
		ctx.beginPath();
		// muzzle shifts down when mooing
		ctx.roundRect(-12 * scale, 2 * scale, 22 * scale, (10 + mouthOpen) * scale, 5 * scale);
		ctx.fill(); ctx.stroke();

		if (isMooing) {
			// Mouth hole
			ctx.fillStyle = "#441111";
			ctx.beginPath();
			ctx.ellipse(0, 10 * scale, 4 * scale, (2 + mouthOpen/2) * scale, 0, 0, Math.PI * 2);
			ctx.fill();
			// Visual "MOO" text
			ctx.fillStyle = "#fff";
			ctx.font = "bold 12px Arial";
			ctx.fillText("MOO!", 10, -10);
		}

		// Eyes
		ctx.fillStyle = "#000";
		[-5, 5].forEach(ex => {
			ctx.beginPath(); ctx.arc(ex * scale, -2 * scale, 2 * scale, 0, Math.PI * 2); ctx.fill();
		});

		// Horns (Only for Cows/Dairy Cows, not calves)
		if (!isCalf) {
			ctx.fillStyle = "#eee";
			[-1, 1].forEach(side => {
				ctx.beginPath();
				ctx.moveTo(side * 5 * scale, -10 * scale);
				ctx.lineTo(side * 10 * scale, -18 * scale);
				ctx.lineTo(side * 2 * scale, -10 * scale);
				ctx.fill(); ctx.stroke();
			});
		}

		ctx.restore();
		ctx.restore();
	},
	cloud: (ctx, e, now, cfg) => {
		const time = now / 1000;
		const color = cfg.storm ? "#4a4a4a" : "#ffffff";
		const puffCount = 6;
		
		ctx.save();
		// Gentle drifting motion
		ctx.translate(Math.sin(time) * 10, Math.cos(time * 0.5) * 5);

		// Draw the fluffy puffs
		ctx.fillStyle = color;
		ctx.strokeStyle = cfg.storm ? "#333" : "#ddd";
		ctx.lineWidth = 2;

		for (let i = 0; i < puffCount; i++) {
			const angle = (i / puffCount) * Math.PI * 2;
			const x = Math.cos(angle) * 20;
			const y = Math.sin(angle) * 10;
			const size = 15 + Math.sin(time + i) * 2;
			
			ctx.beginPath();
			ctx.arc(x, y, size, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}

		// Storm Logic: Lightning
		if (cfg.storm && Math.random() > 0.98) {
			ctx.strokeStyle = "#fff700";
			ctx.lineWidth = 3;
			ctx.shadowBlur = 15;
			ctx.shadowColor = "#fff700";
			ctx.beginPath();
			ctx.moveTo(0, 10);
			ctx.lineTo(-10, 30);
			ctx.lineTo(5, 30);
			ctx.lineTo(-5, 50);
			ctx.stroke();
		}
		ctx.restore();
	},
	gardenGnome: (ctx, e, now, cfg) => {
		const walk = Math.sin(now / 150) * 5;
		
		ctx.save();
		// Body (Blue Tunic)
		ctx.fillStyle = "#3498db";
		ctx.beginPath();
		ctx.roundRect(-10, -5, 20, 15, 5);
		ctx.fill(); ctx.stroke();

		// Beard (White and Fluffy)
		ctx.fillStyle = "#fff";
		ctx.beginPath();
		ctx.moveTo(-8, -5);
		ctx.quadraticCurveTo(0, 15, 8, -5);
		ctx.fill();

		// Face
		ctx.fillStyle = "#ffdbac";
		ctx.beginPath();
		ctx.arc(0, -8, 7, 0, Math.PI * 2);
		ctx.fill();

		// Pointy Red Hat
		ctx.fillStyle = "#e74c3c";
		ctx.beginPath();
		ctx.moveTo(-9, -12);
		ctx.lineTo(0, -30 + walk);
		ctx.lineTo(9, -12);
		ctx.fill(); ctx.stroke();

		// Tiny Eyes
		ctx.fillStyle = "#000";
		ctx.fillRect(-3, -10, 2, 2);
		ctx.fillRect(1, -10, 2, 2);
		ctx.restore();
	},
	sun: (ctx, e, now, cfg) => {
		const time = now / 1000;
		const isAngry = cfg.isAngry; // Set this via your dungeon controller
		const sunColor = isAngry ? "#ff4500" : "#ffce00";
		
		ctx.save();
		// Pulse effect
		const scale = 1 + Math.sin(time * 3) * 0.05;
		ctx.scale(scale, scale);

		// 1. RAYS
		ctx.strokeStyle = sunColor;
		ctx.lineWidth = 6;
		ctx.lineCap = "round";
		for (let i = 0; i < 12; i++) {
			const angle = (i / 12) * Math.PI * 2 + (time * 0.5);
			const len = isAngry ? 50 : 40;
			ctx.beginPath();
			ctx.moveTo(Math.cos(angle) * 25, Math.sin(angle) * 25);
			ctx.lineTo(Math.cos(angle) * len, Math.sin(angle) * len);
			ctx.stroke();
		}

		// 2. CORE
		ctx.fillStyle = sunColor;
		ctx.shadowBlur = 20;
		ctx.shadowColor = sunColor;
		ctx.beginPath();
		ctx.arc(0, 0, 30, 0, Math.PI * 2);
		ctx.fill();
		ctx.shadowBlur = 0;

		// 3. FACE
		if (isAngry) {
			// Angered Face: Downward brows and open mouth
			ctx.strokeStyle = "#000";
			ctx.lineWidth = 3;
			// Angry Brows
			ctx.beginPath(); ctx.moveTo(-15, -15); ctx.lineTo(-5, -8); ctx.stroke();
			ctx.beginPath(); ctx.moveTo(15, -15); ctx.lineTo(5, -8); ctx.stroke();
			// Mouth
			ctx.fillStyle = "#000";
			ctx.beginPath(); ctx.arc(0, 12, 8, 0, Math.PI, true); ctx.fill();
		} else {
			// Cool Face: Sunglasses and Smile
			ctx.fillStyle = "#000";
			// Sunglasses
			ctx.beginPath();
			ctx.roundRect(-18, -10, 15, 10, 2);
			ctx.roundRect(3, -10, 15, 10, 2);
			ctx.fill();
			ctx.beginPath(); ctx.moveTo(-3, -5); ctx.lineTo(3, -5); ctx.stroke();
			// Smile
			ctx.beginPath();
			ctx.arc(0, 5, 12, 0.2, Math.PI - 0.2);
			ctx.stroke();
		}
		ctx.restore();
	},
	singularity: (ctx, e, now, cfg) => {
		const time = now / 1000;
		const pulse = Math.sin(time * 4) * 10;
		
		ctx.save();
		// 1. THE EVENT HORIZON (Outer Glow)
		const gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 40 + pulse);
		gradient.addColorStop(0, "#000");
		gradient.addColorStop(0.5, "#4b0082"); // Indigo
		gradient.addColorStop(1, "transparent");
		
		ctx.fillStyle = gradient;
		ctx.beginPath();
		ctx.arc(0, 0, 50 + pulse, 0, Math.PI * 2);
		ctx.fill();

		// 2. SPATIAL DISTORTION (Swirling Rings)
		ctx.strokeStyle = "#fff";
		ctx.lineWidth = 1;
		for (let i = 0; i < 3; i++) {
			ctx.save();
			ctx.rotate(time * (i + 1) * (i % 2 === 0 ? 1 : -1));
			ctx.beginPath();
			ctx.ellipse(0, 0, 30 + pulse, 10, 0, 0, Math.PI * 2);
			ctx.globalAlpha = 0.3;
			ctx.stroke();
			ctx.restore();
		}

		// 3. THE CORE (Black Hole)
		ctx.fillStyle = "#000";
		ctx.shadowBlur = 15;
		ctx.shadowColor = "#ff00ff";
		ctx.beginPath();
		ctx.arc(0, 0, 15 - (pulse * 0.2), 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},
	bushman: (ctx, e, now, cfg) => {
		const time = now / 1000;
		const isAttacking = e.activeTask === "attacking";
		const jitter = isAttacking ? Math.sin(now / 50) * 3 : Math.sin(now / 1000) * 1;

		ctx.save();
		ctx.translate(jitter, 0);

		// 1. LEAVES (The Disguise)
		ctx.fillStyle = "#2d5a27"; // Dark Green
		for (let i = 0; i < 6; i++) {
			const angle = (i / 6) * Math.PI * 2;
			ctx.beginPath();
			ctx.ellipse(Math.cos(angle) * 15, Math.sin(angle) * 10, 18, 12, angle, 0, Math.PI * 2);
			ctx.fill();
			ctx.stroke();
		}

		// 2. THE REVEAL (Hidden Eyes)
		// Only show red eyes when attacking or low health
		if (isAttacking || e.hp < (e.maxHp * 0.5)) {
			ctx.fillStyle = "#ff0000";
			ctx.beginPath(); ctx.arc(-8, -2, 3, 0, Math.PI * 2); ctx.fill();
			ctx.beginPath(); ctx.arc(8, -2, 3, 0, Math.PI * 2); ctx.fill();
			
			// Scary wooden teeth
			ctx.fillStyle = "#5d4037";
			ctx.fillRect(-10, 5, 20, 4);
		}

		// 3. VINES (Legs)
		if (isAttacking) {
			ctx.strokeStyle = "#5d4037";
			ctx.lineWidth = 3;
			[-12, 12].forEach(x => {
				ctx.beginPath();
				ctx.moveTo(x, 10);
				ctx.quadraticCurveTo(x + jitter * 5, 20, x, 30);
				ctx.stroke();
			});
		}
		ctx.restore();
	},
	treant: (ctx, e, now, cfg) => {
		const time = now / 1000;
		// We check e.config.name because that contains "Maple", "Oak", "Dead", etc.
		const name = (e.config?.name || "").toLowerCase();
		
		const wobble = Math.sin(time * 2) * 0.05;
		const breath = Math.sin(time * 1.5) * 5;

		ctx.save();
		// Anchor at the base and wobble slightly
		ctx.translate(0, 0); 
		ctx.rotate(wobble);

		// --- 1. SET SPECIES COLORS & LOGIC ---
		let leafColor = "#2d5a27"; // Default Oak Green
		let trunkColor = "#5d4037"; // Healthy Brown
		let isWeeping = false;
		let isDead = name.includes("dead");

		if (name.includes("maple")) leafColor = "#b22222"; // Deep Red
		if (name.includes("willow")) { leafColor = "#8fbc8f"; isWeeping = true; }
		if (name.includes("yew")) leafColor = "#1a3316"; // Dark Forest Green
		
		if (isDead) {
			leafColor = "transparent";
			trunkColor = "#3e2723"; // Rotted Dark Brown
		}

		// --- 2. TRUNK (The Body) ---
		ctx.fillStyle = trunkColor;
		ctx.strokeStyle = "#221100";
		ctx.lineWidth = 2;
		
		ctx.beginPath();
		ctx.moveTo(-15, 40); // Root base
		ctx.lineTo(-10, -20); // Top left
		ctx.lineTo(10, -20);  // Top right
		ctx.lineTo(15, 40);  // Root base
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// Add wood cracks if Dead
		if (isDead) {
			ctx.strokeStyle = "rgba(0,0,0,0.3)";
			ctx.lineWidth = 1;
			for(let i = 0; i < 3; i++) {
				ctx.beginPath();
				ctx.moveTo(-5, 5 + (i * 8));
				ctx.lineTo(5, 10 + (i * 8));
				ctx.stroke();
			}
		}

		// --- 3. THE FACE (Glowing Eyes) ---
		// Dead trees have dull gray eyes, living have glowing lime
		ctx.fillStyle = isDead ? "#555" : "#e6ee9c";
		if (!isDead) {
			ctx.shadowBlur = 8;
			ctx.shadowColor = "#e6ee9c";
		}
		
		ctx.beginPath();
		ctx.arc(-5, 0, 3, 0, Math.PI * 2);
		ctx.arc(5, 0, 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.shadowBlur = 0; // Reset shadow for rest of draw

		// --- 4. THE CANOPY (Leaves) ---
		if (leafColor !== "transparent") {
			ctx.fillStyle = leafColor;
			
			if (isWeeping) {
				// Willow: Long hanging elliptical vines
				for (let i = -2; i <= 2; i++) {
					ctx.beginPath();
					ctx.ellipse(i * 12, 5 + breath, 8, 25, 0, 0, Math.PI * 2);
					ctx.fill();
					ctx.strokeStyle = "rgba(0,0,0,0.1)";
					ctx.stroke();
				}
			} else {
				// Standard: Circular bushy clumps
				for (let i = 0; i < 5; i++) {
					const angle = (i / 5) * Math.PI * 2;
					const ox = Math.cos(angle) * 15;
					const oy = -30 + Math.sin(angle) * 10 + (breath * 0.5);
					ctx.beginPath();
					ctx.arc(ox, oy, 20, 0, Math.PI * 2);
					ctx.fill();
				}
			}
		}

		// --- 5. BRANCH ARMS ---
		ctx.strokeStyle = trunkColor;
		ctx.lineWidth = 4;
		ctx.lineCap = "round";
		
		const armSwing = Math.sin(time * 3) * 8;
		
		// Left Arm
		ctx.beginPath();
		ctx.moveTo(-10, 10);
		ctx.lineTo(-25 + armSwing, 20 + (breath * 0.5));
		ctx.stroke();
		
		// Right Arm
		ctx.beginPath();
		ctx.moveTo(10, 10);
		ctx.lineTo(25 - armSwing, 20 + (breath * 0.5));
		ctx.stroke();

		ctx.restore();
	},
	demon: (ctx, e, now, cfg) => {
		const time = now / 1000;
		const isBoss = e.config?.isBoss;
		const breathe = Math.sin(time * 2) * 5;

		ctx.save();
		// Body (Muscular triangle)
		ctx.fillStyle = isBoss ? "#660000" : "#a30000";
		ctx.beginPath();
		ctx.moveTo(-20, 40);
		ctx.lineTo(0, -30 - breathe);
		ctx.lineTo(20, 40);
		ctx.fill();

		// Horns
		ctx.strokeStyle = "#222";
		ctx.lineWidth = 4;
		ctx.beginPath();
		ctx.moveTo(-10, -25); ctx.quadraticCurveTo(-25, -50, -30, -30); // Left
		ctx.moveTo(10, -25); ctx.quadraticCurveTo(25, -50, 30, -30);   // Right
		ctx.stroke();

		// Glowing Eyes
		ctx.fillStyle = "#fffa00";
		ctx.shadowBlur = 10; ctx.shadowColor = "orange";
		ctx.beginPath();
		ctx.arc(-8, -15, 3, 0, Math.PI * 2);
		ctx.arc(8, -15, 3, 0, Math.PI * 2);
		ctx.fill();
		ctx.restore();
	},

	imp: (ctx, e, now, cfg) => {
		const time = now / 1000;
		const hop = Math.abs(Math.sin(time * 5)) * 10;
		ctx.save();
		ctx.translate(0, -hop);
		ctx.fillStyle = "#ff4500";
		ctx.beginPath(); ctx.arc(0, 20, 15, 0, Math.PI * 2); ctx.fill(); // Round body
		// Tiny wings
		ctx.fillStyle = "#333";
		ctx.beginPath();
		ctx.moveTo(-10, 15); ctx.lineTo(-25, 5); ctx.lineTo(-10, 25);
		ctx.moveTo(10, 15); ctx.lineTo(25, 5); ctx.lineTo(10, 25);
		ctx.fill();
		ctx.restore();
	},
	polititian: (ctx, e, now, cfg) => {
		const name = (e.config?.name || "").toLowerCase();
		ctx.save();
		
		// Suit Body
		ctx.fillStyle = "#222";
		ctx.fillRect(-10, 0, 20, 30);
		
		// White Shirt/Tie
		ctx.fillStyle = "#fff";
		ctx.fillRect(-2, 0, 4, 10);
		ctx.fillStyle = "#f00"; // Red tie
		ctx.fillRect(-1, 2, 2, 8);

		// Head
		ctx.fillStyle = "#ffdbac";
		ctx.beginPath(); ctx.arc(0, -10, 10, 0, Math.PI * 2); ctx.fill();

		// Briefcase
		ctx.fillStyle = "#4e342e";
		ctx.fillRect(12, 15, 12, 10);
		ctx.restore();
	},
	satan: (ctx, e, now, cfg) => {
		const time = now / 1000;
		const breathe = Math.sin(time * 1.5) * 8;
		const wingFlap = Math.sin(time * 4) * 0.2;

		ctx.save();
		
		// --- 1. MASSIVE DEMONIC WINGS ---
		ctx.fillStyle = "#330000";
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 2;
		
		// Left Wing
		ctx.save();
		ctx.translate(-15, -10);
		ctx.rotate(-wingFlap);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.quadraticCurveTo(-60, -60, -80, 20);
		ctx.quadraticCurveTo(-40, 10, 0, 30);
		ctx.fill(); ctx.stroke();
		ctx.restore();

		// Right Wing
		ctx.save();
		ctx.translate(15, -10);
		ctx.rotate(wingFlap);
		ctx.beginPath();
		ctx.moveTo(0, 0);
		ctx.quadraticCurveTo(60, -60, 80, 20);
		ctx.quadraticCurveTo(40, 10, 0, 30);
		ctx.fill(); ctx.stroke();
		ctx.restore();

		// --- 2. THE MAIN BODY (The Throne/Torso) ---
		// Darker, more muscular red
		ctx.fillStyle = "#660000";
		ctx.beginPath();
		ctx.moveTo(-30, 50);
		ctx.lineTo(-20, -40 - (breathe * 0.5));
		ctx.lineTo(20, -40 - (breathe * 0.5));
		ctx.lineTo(30, 50);
		ctx.closePath();
		ctx.fill();
		ctx.stroke();

		// --- 3. THE HEAD & HORNS ---
		ctx.fillStyle = "#660000";
		ctx.beginPath();
		ctx.arc(0, -50 - breathe, 18, 0, Math.PI * 2);
		ctx.fill();
		ctx.stroke();

		// Massive Curved Horns
		ctx.strokeStyle = "#111";
		ctx.lineWidth = 6;
		ctx.lineCap = "round";
		// Left Horn
		ctx.beginPath();
		ctx.moveTo(-10, -60 - breathe);
		ctx.bezierCurveTo(-30, -90, -50, -60, -45, -40);
		ctx.stroke();
		// Right Horn
		ctx.beginPath();
		ctx.moveTo(10, -60 - breathe);
		ctx.bezierCurveTo(30, -90, 50, -60, 45, -40);
		ctx.stroke();

		// --- 4. GLOWING FEATURES ---
		// Eyes
		ctx.fillStyle = "#fff700";
		ctx.shadowBlur = 15;
		ctx.shadowColor = "red";
		ctx.beginPath();
		ctx.arc(-7, -52 - breathe, 4, 0, Math.PI * 2);
		ctx.arc(7, -52 - breathe, 4, 0, Math.PI * 2);
		ctx.fill();

		// Burning Chest Core
		const corePulse = 0.5 + Math.sin(time * 5) * 0.5;
		ctx.fillStyle = `rgba(255, 69, 0, ${corePulse})`;
		ctx.beginPath();
		ctx.moveTo(-10, -20);
		ctx.lineTo(0, 10);
		ctx.lineTo(10, -20);
		ctx.fill();

		ctx.restore();
	},
	angel: (ctx, e, now, cfg) => {
		const time = now / 1000;
		const breathe = Math.sin(time * 2) * 5;
		const flap = Math.sin(time * 3) * 0.2;

		ctx.save();
		// 1. Feathered Wings
		ctx.fillStyle = "#fff";
		ctx.strokeStyle = "#ddd";
		[-1, 1].forEach(side => {
			ctx.save();
			ctx.scale(side, 1);
			ctx.rotate(flap);
			ctx.beginPath();
			ctx.moveTo(10, 0);
			ctx.bezierCurveTo(40, -40, 60, 20, 10, 30);
			ctx.fill(); ctx.stroke();
			ctx.restore();
		});

		// 2. Robed Body
		ctx.fillStyle = "#f5f5f5";
		ctx.beginPath();
		ctx.moveTo(-15, 40); ctx.lineTo(0, -20 - breathe); ctx.lineTo(15, 40);
		ctx.fill();

		// 3. Halo
		ctx.strokeStyle = "#ffd700";
		ctx.lineWidth = 3;
		ctx.shadowBlur = 10; ctx.shadowColor = "gold";
		ctx.beginPath();
		ctx.ellipse(0, -45 - breathe, 15, 5, 0, 0, Math.PI * 2);
		ctx.stroke();
		
		ctx.restore();
	},

	winged_butt: (ctx, e, now, cfg) => {
		const time = now / 1000;
		const flap = Math.sin(time * 15) * 0.5; // Fast fluttering
		
		ctx.save();
		// Tiny wings
		ctx.fillStyle = "#fff";
		[-1, 1].forEach(side => {
			ctx.save();
			ctx.scale(side, 1);
			ctx.rotate(flap);
			ctx.beginPath(); ctx.arc(15, -10, 10, 0, Math.PI * 2); ctx.fill();
			ctx.restore();
		});

		// The... Body
		ctx.fillStyle = "#ffdbac";
		ctx.beginPath();
		ctx.arc(-8, 0, 12, 0, Math.PI * 2); // Left cheek
		ctx.arc(8, 0, 12, 0, Math.PI * 2);  // Right cheek
		ctx.fill();
		ctx.restore();
	},

	deity: (ctx, e, now, cfg) => {
		const time = now / 1000;
		// Hovering effect
		const float = Math.sin(time * 1.5) * 20;
		
		ctx.save();
		ctx.translate(0, float);
		
		// 1. The Aura (Expanding circles)
		const auraScale = 1 + Math.sin(time * 2) * 0.1;
		ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
		ctx.beginPath();
		ctx.arc(0, 0, 80 * auraScale, 0, Math.PI * 2);
		ctx.fill();

		// 2. The Form (A silhouette of pure light)
		ctx.shadowBlur = 40;
		ctx.shadowColor = "#fff";
		ctx.fillStyle = "#fff";
		
		// Abstract triangular "Prime" form
		ctx.beginPath();
		ctx.moveTo(0, -60);
		ctx.lineTo(-40, 60);
		ctx.lineTo(40, 60);
		ctx.closePath();
		ctx.fill();

		// 3. The Eye of Providence
		ctx.fillStyle = "#ffd700";
		ctx.beginPath();
		ctx.arc(0, -10, 8, 0, Math.PI * 2);
		ctx.fill();
		
		// 4. Rings of Power
		ctx.strokeStyle = "rgba(255, 215, 0, 0.5)";
		ctx.lineWidth = 2;
		for(let i=0; i<3; i++) {
			ctx.save();
			ctx.rotate(time + i);
			ctx.beginPath();
			ctx.ellipse(0, 0, 70, 20, 0, 0, Math.PI * 2);
			ctx.stroke();
			ctx.restore();
		}

		ctx.restore();
	},
	custom_path: (ctx, e, now, cfg) => {
		if (!cfg.pathData) return;
		ctx.lineCap = "round";
		ctx.beginPath();
		cfg.pathData.forEach(p => {
			if (!p) { ctx.stroke(); ctx.beginPath(); return; }
			ctx.strokeStyle = p.color || "#ff0000";
			ctx.lineWidth = (p.thickness || 2) * (e.scale || 1);
			ctx.lineTo(p.x, p.y);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(p.x, p.y);
		});
	},
    stickman: (ctx, e, now, cfg) => {
        // We mirror here because drawEnemyStickman usually expects world coords, 
        // but inside our new render logic we are already translated.
        ctx.scale(-1, 1);
        drawEnemyStickman(ctx, e, true); // Pass a flag to skip internal translation if needed
    },
	theCreator: (ctx, e, now, cfg) => {
		const breathe = Math.sin(now / 400) * 3;
		const sway = Math.sin(now / 600) * 0.05;
		
		ctx.save();
		ctx.rotate(sway);
		ctx.translate(0, breathe);

		// 1. LEGS (Blue Jeans)
		ctx.fillStyle = "#3b5998"; // Denim Blue
		ctx.strokeStyle = "#1a1a1a";
		ctx.lineWidth = 2;
		// Left Leg
		ctx.beginPath();
		ctx.roundRect(-12, 10, 10, 30, [0, 0, 5, 5]);
		ctx.fill(); ctx.stroke();
		// Right Leg
		ctx.beginPath();
		ctx.roundRect(2, 10, 10, 30, [0, 0, 5, 5]);
		ctx.fill(); ctx.stroke();

		// 2. TORSO (Black T-Shirt)
		ctx.fillStyle = "#1a1a1a";
		ctx.beginPath();
		ctx.roundRect(-15, -25, 30, 38, 8);
		ctx.fill(); ctx.stroke();
		
		// Short Sleeves
		[-1, 1].forEach(side => {
			ctx.beginPath();
			ctx.roundRect(side * 15 - (side === -1 ? 8 : 0), -22, 8, 15, 4);
			ctx.fill(); ctx.stroke();
		});

		// 3. HEAD (Green Halftone Guy)
		// Skin
		ctx.fillStyle = "#22ff22"; // Bright Hacker Green
		ctx.beginPath();
		ctx.arc(0, -45, 18, 0, Math.PI * 2);
		ctx.fill(); ctx.stroke();

		// Square Glasses
		ctx.strokeStyle = "#000";
		ctx.lineWidth = 1.5;
		[-7, 7].forEach(side => {
			ctx.strokeRect(side - 5, -48, 10, 8); // Lens frames
		});
		ctx.beginPath(); ctx.moveTo(-2, -44); ctx.lineTo(2, -44); ctx.stroke(); // Bridge

		// Messy Black Hair
		ctx.fillStyle = "#000";
		for(let i=0; i<8; i++) {
			const hAngle = (i / 8) * Math.PI - Math.PI;
			ctx.beginPath();
			ctx.ellipse(Math.cos(hAngle) * 12, -55 + Math.sin(hAngle) * 5, 10, 6, hAngle, 0, Math.PI * 2);
			ctx.fill();
		}

		// Bunny Ears
		const earWiggle = Math.sin(now / 200) * 0.1;
		[-1, 1].forEach(side => {
			ctx.save();
			ctx.translate(side * 8, -60);
			ctx.rotate(side * 0.3 + (side * earWiggle));
			// Outer Ear
			ctx.fillStyle = "#000"; // Black ears to match hair
			ctx.beginPath();
			ctx.ellipse(0, -12, 6, 18, 0, 0, Math.PI * 2);
			ctx.fill(); ctx.stroke();
			// Inner Ear
			ctx.fillStyle = "#22ff22"; // Green inner ear
			ctx.beginPath();
			ctx.ellipse(0, -12, 3, 12, 0, 0, Math.PI * 2);
			ctx.fill();
			ctx.restore();
		});

		// 4. HACKER AURA (Halftone/Matrix Effect)
		if (Math.random() > 0.8) {
			ctx.fillStyle = "#22ff22";
			ctx.font = "bold 10px monospace";
			ctx.fillText(Math.random() > 0.5 ? "1" : "0", Math.random() * 40 - 20, Math.random() * -80);
		}

		ctx.restore();
	}
};
const MONSTER_DB = {
    // --- BASE / TRAINING ---
    "Slime": { drawType: "blob", color: "#4caf50", hpMult: 1.0, bodyW: 25, bodyH: 20 },
    "FireSlime": { drawType: "blob", color: "#ff4500", hpMult: 1.2, glow: true, glowColor: "#ff0" },
    "StickmanHunter": { drawType: "stickman", hpMult: 1.2, canEquip: true },
	"Stickman_Elite": { drawType: "stickman", hpMult: 1.5, canEquip: true },
	"Richard": { drawType: "stickman", hpMult: 3 },
	"somehing_else": { drawType: "beast", scale: 1.0, color: "#000", hpMult: 15, legCount: 4 },
    // --- SPIDERS ---
    "Spiderling": { drawType: "spider", scale: 0.5, color: "#555", hpMult: 0.5 },
    "CaveSpider": { drawType: "spider", scale: 1.0, color: "#333", hpMult: 1.0 },
    "WolfSpider": { drawType: "spider", scale: 1.8, color: "#5d4037", hpMult: 2.5, special: "web_shot" },
    "FireSpider": { drawType: "spider", scale: 1.2, color: "#ff4500", glow: true, glowColor: "#ff0", special: "burn" },
    "IceSpider": { drawType: "spider", scale: 1.2, color: "#00ffff", glow: true, glowColor: "#fff", special: "freeze" },

    // --- CANINES (Anchors tightened for scaling) ---
    "StreetDog": { drawType: "canine", color: "#8b4513", bodyW: 20, headAnchor: {x: -15, y: -5}, hpMult: 1.0 },
    "DireWolf": { drawType: "canine", color: "#444", fuzz: true, scale: 1.5, bodyW: 30, headAnchor: {x: -20, y: -8}, hpMult: 3.0 },
    "FrostWolf": { drawType: "canine", color: "#f0ffff", fuzz: true, scale: 1.5, glow: true, glowColor: "#00f", hpMult: 3.0 },
	// --- HORSES ---
	"pony": { drawType: "horse", color: "#d2b48c", bodyW: 15, headAnchor: {x: -15, y: -10}, hpMult: 1.0 },
	"horse": { drawType: "horse", color: "#8b4513", scale: 1.5, bodyW: 25, headAnchor: {x: -25, y: -15}, hpMult: 3.0 },
	"unicorn": { drawType: "horse", color: "#ffffff", horns: true, scale: 1.5, bodyW: 25, headAnchor: {x: -25, y: -15}, glow: true, glowColor: "#fff0f5", hpMult: 4.0 },
	"pegasus": { drawType: "horse", color: "#f0f8ff", wings: true, scale: 1.5, bodyW: 25, headAnchor: {x: -25, y: -15}, glow: true, glowColor: "#00ffff", hpMult: 5.0 },
	// --- COWS ---
	"calf": { drawType: "cow", color: "#ffffff", bodyW: 15, headAnchor: {x: -18, y: -10}, hpMult: 5.0 },
	"Cow": { drawType: "cow", color: "#ffffff", utters: true, scale: 1.5, bodyW: 25, headAnchor: {x: -28, y: -15}, hpMult: 5.0 },
	"dairy_Cow": { drawType: "cow", color: "#ffffff", bell: true, utters: true, scale: 1.6, bodyW: 28, headAnchor: {x: -30, y: -18}, glow: true, glowColor: "#00ffff", hpMult: 8.0 },
    // --- VOID / ABYSSAL ---
    "VoidWalker": { drawType: "stickman", color: "#4b0082", hpMult: 2.0, glow: true },
    "ShadowWraith": { drawType: "wraith", color: "#1a1a1a", glow: true, glowColor: "#4b0082",hpMult: 1.5, bodyW: 15, bodyH: 40 },
    "VoidDragon": { drawType: "dragon", color: "#2e0854", hpMult: 5.0, scale: 2.0, glow: true, glowColor: "#ff00ff" },
    "CosmicHorror": { drawType: "beast", color: "#ff00ff",},
    "StarWraith": { drawType: "wraith", color: "#fff", glow: true, glowColor: "#00d4ff", hpMult: 2.0, bodyW: 12, bodyH: 45 }, 
	"SeaWraith": { drawType: "wraith", color: "#e0ffff", glow: true, glowColor: "#00ced1", hpMult: 2.0, bodyW: 12, bodyH: 45 }, 
	"CosmicHorror": { drawType: "horror", color: "#ff00ff", scale: 1.5, legCount: 8, bodyW: 25 },

    // --- WEIRD/MIMICS ---
    "StaffMimic": { drawType: "phalic", color: "#ff69b4", hpMult: 2.0, hasArms: true, armAnchor: {x: 0, y: -30} },
    "PinkWobbler": { drawType: "phalic", color: "#da70d6", hpMult: 1.5, scale: 0.8 },
	"Living_Bush": { drawType: "bushman", hpMult: 12, special: "entangle"},
	"Maple_Treant": { drawType: "treant", hpMult: 1.5, scale: 0.8, special: "entangle" },
    "Oak_Treant":   { drawType: "treant", hpMult: 1.8, scale: 0.9, special: "entangle" },
    "Willow_Treant":{ drawType: "treant", hpMult: 1.4, scale: 0.8, special: "entangle" },
    "Yew_Treant":   { drawType: "treant", hpMult: 2.0, scale: 1.0, special: "entangle" },
    "Dead_Treant":  { drawType: "treant", hpMult: 1.2, scale: 0.8 },
	//hell types
	"demon": { drawType: "demon", hpMult: 80, special: "burn", scale: 1.2 },
	"little_devil": { drawType: "imp", hpMult: 25, special: "web_shot", scale: 0.6 },
	"tortured_soul": { drawType: "wraith", hpMult: 35, special: "freeze", scale: 0.9 },
	"A_Polititian": { drawType: "polititian", hpMult: 50, special: "entangle", scale: 0.9 },
	"Devil": { drawType: "satan", isBoss: true, hpMult: 500, special: "burn", scale: 2.2 },
    // --- BOSSES ---
	"Void_Singularity": { drawType: "singularity", hpMult: 60, scale: 1.5},
    "DUNGEON_OVERLORD": { drawType: "stickman", scale: 2.5, color: "#f00", hpMult: 8.0, canEquip: true },
    "BROOD_MOTHER": { drawType: "spider", scale: 4.0, color: "#1a1a1a", hpMult: 10, special: "spawn_spiderlings" },
    "FENRIR_LITE": { drawType: "canine", fuzz: true, scale: 2, color: "#000", hpMult: 12, glow: true, headAnchor: {x: -20, y: -5} },
    "VOID_CORRUPTOR": { drawType: "horror", scale: 2.0, color: "#1a1a1a", glow: true, glowColor: "#4b0082", hpMult: 15, legCount: 12 },
    "FROST_JOTUN": { drawType: "stickman", scale: 5.0, color: "#fff", hpMult: 18 },
    "MAGMA_CORE": { drawType: "blob", scale: 6.0, color: "#f00", hpMult: 20 },
    "THE_MAIN_ATTRACTION": { drawType: "phalic", scale: 5.0, color: "#ff69b4", hpMult: 15 },
    "QUEEN_GOSSAMER": { drawType: "spider", scale: 5.0, color: "gold", hpMult: 25 }, // Fixed color string
    "CERBERUS_JUNIOR": { drawType: "canine", scale: 3.0, color: "#500", hpMult: 20, headAnchor: {x: -15, y: -5} },
    "VOID_EXARCH": { drawType: "stickman", scale: 4.0, color: "#4b0082", hpMult: 30 },
    "ASTRAL_TITAN": { drawType: "titan", scale: 3.0, color: "#e0e0e0", glow: true, glowColor: "#00d4ff", hpMult: 40 },
    "CHRONOS": { drawType: "stickman", scale: 7.0, color: "#00d4ff", hpMult: 50, canEquip: true},
    "THE_CREATOR": { drawType: "theCreator", scale: 4.0, hpMult: 100 },
	"defaultCustomMonster": { drawType: "custom_path", scale: 8.5, hpMult: 100 }, 
	"Cloud": { 
			drawType: "cloud", 
			hpMult: 8, 
		},
	"Storm_Cloud": { 
		drawType: "cloud", 
		storm: true, 
		hpMult: 15, 
		xpValue: 45,
		special: "lightning" 
	},
	"Garden_Gnome": {
		drawType: "gardenGnome",
		hpMult: 5,
		xpValue: 30,
		special: "thief"
	},
	"angel": { 
		drawType: "angel", hpMult: 90, special: "burn", scale: 1.1 
	}, // "Burn" represents "Holy Fire"
	"winged_Butt": { 
		drawType: "winged_butt", hpMult: 30, scale: 0.7 
	},
	"God": { 
		drawType: "deity", hpMult: 1000, scale: 3.0 
	},
	"THE_SUN": { 
		drawType: "sun", 
		isBoss: true,
		scale: 4, 
		hpMult: 150,
		xpValue: 5000,
		isAngry: false // Default state
	}
};
// Theme-based tier waves
const DUNGEON_THEMES = {
    1: { name: "The Training Grounds", mobs: ["Slime", "StickmanHunter"], boss: "DUNGEON_OVERLORD" },
    2: { name: "The Silken Den", mobs: ["Spiderling", "CaveSpider"], boss: "BROOD_MOTHER" },
    3: { name: "The Howling Woods", mobs: ["StreetDog","Maple_Treant", "DireWolf"], boss: "FENRIR_LITE" },
    4: { name: "The Abyssal Breach", mobs: ["VoidWalker", "StickmanHunter", "ShadowWraith"], boss: "VOID_CORRUPTOR" },
    5: { name: "The Frozen Tundra", mobs: ["IceSpider", "StickmanHunter", "FrostWolf"], boss: "FROST_JOTUN" },
    6: { name: "The Scorched Earth", mobs: ["FireSpider", "Stickman_Elite", "FireSlime"], boss: "MAGMA_CORE" },
    7: { name: "Richards Pantry", mobs: ["StaffMimic", "Richard","winged_Butt", "PinkWobbler"], boss: "THE_MAIN_ATTRACTION" },
    8: { name: "Arachnid Overrun", mobs: ["WolfSpider", "FireSpider", "IceSpider"], boss: "QUEEN_GOSSAMER" },
    9: { name: "The Cursed Kennel", mobs: ["DireWolf", "somehing_else", "FrostWolf"], boss: "CERBERUS_JUNIOR" },
    10: { name: "The Void Horizon", mobs: ["VoidDragon", "ShadowWraith"], boss: "VOID_EXARCH" },
    11: { name: "Celestial Spire", mobs: ["StarWraith", "StickmanHunter", "VoidWalker"], boss: "ASTRAL_TITAN" },
    12: { name: "The End Times", mobs: ["CosmicHorror", "StickmanHunter", "DireWolf"], boss: "CHRONOS" },
    13: { name: "The Creators Realm", mobs: ["VoidDragon", "CosmicHorror",  "StickmanHunter"], boss: "THE_CREATOR" },
	14: { name: "Cow", mobs: ["calf", "Cow", "Willow_Treant"], boss: "dairy_Cow" },
	15: { name: "Ig its Horses now", mobs: ["pony", "StickmanHunter", "horse"], boss: "pegasus" },
	16: { name: "Sunny Day", mobs: ["Cloud", "Storm_Cloud", "unicorn", "gardenGnome"], boss: "The_Sun" },
	17: { name: "The Whispering Wilds", mobs: ["Maple_Treant", "Oak_Treant", "Living_Bush", "Willow_Treant"], boss: "Void_Singularity" },
	18: { name: "The Place Below", mobs: ["demon", "little_devil", "tortured_soul", "politition"], boss: "a Devil" },
	19: { name: "The Place Above", mobs: ["Cloud", "angel", "winged_Butt"], boss: "a God" }
};
