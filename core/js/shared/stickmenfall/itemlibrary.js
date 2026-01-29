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
	"Iron Axe":            { type: "weapon", style: "axe",sources:"achievement", tier: 2,  rarity: 7,  power: 15,  speed: 1800, value: 25000,  color: "#888" },
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
	"Skilled Warrior Cape":  { type:"cape",style:"cape",sources:"achievement",  tier: 11, rarity: 13, value: 10000, color: "#2a2a2a" },
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
	"oldman beard": { name: "Wizard Beard",        sources:"dungeon",  tier: 10, rarity: 7, type: "hair", style: "wizardbeard", color: "#ffffff" },
	"wizard beard": { name: "Dark Mage Beard",     sources:"dungeon",  tier: 8, rarity: 5, type: "hair", style: "wizardbeard", color: "#333333" },

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
	"Bass":    { type: "fish", sources:"fishing", tier: 1, rarity: 0, value: 100, color: "#FFD700" },
	"Trout":    { type: "fish", sources:"fishing", tier: 2, rarity: 0, value: 100, color: "#FFD700" },
	"Salmon":    { type: "fish", sources:"fishing", tier: 3, rarity: 0, value: 100, color: "#FFD700" },
	"Tuna":    { type: "fish", sources:"fishing", tier: 4, rarity: 0, value: 100, color: "#FFD700" },
	"Shark":    { type: "fish", sources:"fishing", tier: 5, rarity: 0, value: 100, color: "#FFD700" },
	"Lobster":    { type: "fish", sources:"fishing", tier: 6, rarity: 0, value: 1000, color: "#FFD700" },
	
	// --- unique fish ---
	"Golden Bass":    { type: "fish", source:"fishing",  tier: 10, rarity: 0, value: 100, color: "#FFD700" },
	// --- unique swimming find ---
	"Pearl":    { type: "fish", sources:"fishing swimming",  tier: 3, rarity: 5, value: 100, color: "white" },
	"Black Pearl":    { type: "fish", sources:"fishing swimming",  tier: 6, rarity: 5, value: 100, color: "black" },
	//rare fishing finds
	"fishhat":      { type: "helmet", sources:"fishing",  style: "fishhat", tier: 99, rarity: 13, def: 1, value: 500000, color: "#d2b48c" },
    // --- MATERIALS ---
    "Leather scrap":  { type: "material", sources:"fishing",  tier: 1, rarity: 0, value: 15,   color: "#a88d6d" },
	"Sea Shell":  { type: "material", sources:"fishing swimming",  tier: 8, rarity: 0, value: 15,   color: "#a88d6d" },
	"a Rock":  { type: "material", sources:"swimming",  tier: 8, rarity: 0, value: 15,   color: "#a88d6d" },
	// --- treasure ---
	"Trophy":         { type:"treasure",style:"", sources:"treasure",  tier: 99, rarity: 13, value: 10000, color: "#ffd700" },
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
		
		// Only one hand punches at a time, very quickly
		const punchLeft = (isAttacking && progress < 0.5) ? Math.sin(progress * Math.PI * 2) * 15 : 0;
		const punchRight = (isAttacking && progress >= 0.5) ? Math.sin((progress - 0.5) * Math.PI * 2) * 15 : 0;

		return {
			// High Guard (Classic Stickman look)
			left:  { x: head.x - 12 - punchLeft, y: shoulderY - 5 },
			right: { x: head.x + 12 + punchRight, y: shoulderY - 5 },
			
			// NO ELBOWS defined here = Arms will stay perfectly straight lines!
			// NO KNEES defined here = Legs will stay perfectly straight lines!
			
			leftFoot:  { x: p.x - 12, yOffset: 0 },
			rightFoot: { x: p.x + 12, yOffset: 0 }
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
	}
};

const BODY_PARTS = {
    "stick": {
/*         head: (ctx, x, y, p) => {
            ctx.save();
            ctx.globalAlpha = 0.9;
            ctx.fillStyle = p.color || "#ff4444";
            ctx.beginPath(); 
            ctx.arc(x, y, 10, 0, Math.PI * 2); 
            ctx.fill();
            ctx.strokeStyle = "#000";
            ctx.lineWidth = 1;
            ctx.stroke();

            // Eyes
            ctx.fillStyle = "#000";
            ctx.fillRect(x - 4, y - 3, 2, 2); 
            ctx.fillRect(x + 2, y - 3, 2, 2); 
            ctx.restore();
			// --- THE SMILE ---
			ctx.beginPath();
			// Creates a half-circle arc from left to right below the eyes
			ctx.arc(x, y + 2, 4, 0.2 * Math.PI, 0.8 * Math.PI); 
			ctx.stroke();
        }, */
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

			// --- EYES ---
			ctx.fillStyle = "#000";
			if (p.emote === "laugh") {
				// "X X" eyes
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(x - 5, y - 5); ctx.lineTo(x - 2, y - 2);
				ctx.moveTo(x - 2, y - 5); ctx.lineTo(x - 5, y - 2);
				ctx.moveTo(x + 2, y - 5); ctx.lineTo(x + 5, y - 2);
				ctx.moveTo(x + 5, y - 5); ctx.lineTo(x + 2, y - 2);
				ctx.stroke();
			} else if (p.emote === "cry") {
				// Normal eyes + blue teardrops
				ctx.fillRect(x - 4, y - 3, 2, 2); 
				ctx.fillRect(x + 2, y - 3, 2, 2);
				ctx.fillStyle = "#00f";
				ctx.fillRect(x - 4, y, 2, 4);
				ctx.fillRect(x + 2, y, 2, 4);
			} else {
				// Standard eyes
				ctx.fillRect(x - 4, y - 3, 2, 2); 
				ctx.fillRect(x + 2, y - 3, 2, 2); 
			}

			// --- MOUTHS ---
			ctx.beginPath();
			ctx.strokeStyle = "#000";
			ctx.lineWidth = 1.5;

			switch(p.emote) {
				case "sad":
				case "cry":
					// Frown (Upside down arc)
					ctx.arc(x, y + 7, 4, 1.2 * Math.PI, 1.8 * Math.PI);
					break;
				case "surprised":
					// Small "o" circle
					ctx.arc(x, y + 4, 2.5, 0, Math.PI * 2);
					break;
				case "laugh":
					// Big open smile
					ctx.arc(x, y + 2, 5, 0, Math.PI);
					ctx.closePath();
					ctx.fillStyle = "#000";
					ctx.fill();
					break;
				default:
					// Standard Smile
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
    }
};


const MONSTER_STYLES = {
    blob: (ctx, e, now, cfg) => {
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
	// Inside your MONSTER_STYLES object:
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
    }
};
const MONSTER_DB = {
    // --- BASE / TRAINING ---
    "Slime": { drawType: "blob", color: "#4caf50", hpMult: 1.0, bodyW: 25, bodyH: 20 },
    "FireSlime": { drawType: "blob", color: "#ff4500", hpMult: 1.2, glow: true, glowColor: "#ff0" },
    "StickmanHunter": { drawType: "stickman", hpMult: 1.2, canEquip: true },

    // --- SPIDERS ---
    "Spiderling": { drawType: "spider", scale: 0.5, color: "#555", hpMult: 0.5 },
    "CaveSpider": { drawType: "spider", scale: 1.0, color: "#333", hpMult: 1.0 },
    "WolfSpider": { drawType: "spider", scale: 1.8, color: "#5d4037", hpMult: 2.5, special: "web_shot" },
    "FireSpider": { drawType: "spider", scale: 1.2, color: "#ff4500", glow: true, glowColor: "#ff0", special: "burn" },
    "IceSpider": { drawType: "spider", scale: 1.2, color: "#00ffff", glow: true, glowColor: "#fff", special: "freeze" },

    // --- CANINES ---
    "StreetDog": { drawType: "canine", color: "#8b4513", bodyW: 20, headAnchor: {x: -25, y: -10}, hpMult: 1.0 },
    "DireWolf": { drawType: "canine", color: "#444", fuzz: true, scale: 1.5, bodyW: 30, headAnchor: {x: -35, y: -15}, hpMult: 3.0 },
    "FrostWolf": { drawType: "canine", color: "#f0ffff", fuzz: true, scale: 1.5, glow: true, glowColor: "#00f", hpMult: 3.0 },

    // --- VOID / ABYSSAL ---
    "VoidWalker": { drawType: "stickman", color: "#4b0082", hpMult: 2.0, glow: true },
    "ShadowWraith": { drawType: "blob", color: "#1a1a1a", hpMult: 1.5, bodyW: 15, bodyH: 40 },
    "VoidDragon": { drawType: "beast", color: "#2e0854", hpMult: 5.0, scale: 2.0, legCount: 4 },
    "CosmicHorror": { drawType: "beast", color: "#ff00ff", hpMult: 6.0, scale: 2.5, legCount: 12 },

    // --- WEIRD/MIMICS ---
    "StaffMimic": { drawType: "phalic", color: "#ff69b4", hpMult: 2.0, hasArms: true, armAnchor: {x: 0, y: -30} },
    "PinkWobbler": { drawType: "phalic", color: "#da70d6", hpMult: 1.5, scale: 0.8 },

    // --- BOSSES ---
    "DUNGEON_OVERLORD": { drawType: "stickman", scale: 2.5, color: "#f00", hpMult: 8.0, canEquip: true },
    "BROOD_MOTHER": { drawType: "spider", scale: 4.0, color: "#1a1a1a", hpMult: 10, special: "spawn_spiderlings" },
    "FENRIR_LITE": { drawType: "canine", fuzz: true, scale: 3.5, color: "#000", hpMult: 12, glow: true },
    "VOID_CORRUPTOR": { drawType: "beast", scale: 4.0, color: "#000", hpMult: 15, legCount: 10 },
    "FROST_JOTUN": { drawType: "stickman", scale: 5.0, color: "#fff", hpMult: 18 },
    "MAGMA_CORE": { drawType: "blob", scale: 6.0, color: "#f00", hpMult: 20 },
    "THE_GRAND_MIMIC": { drawType: "phalic", scale: 5.0, color: "#ff69b4", hpMult: 15 },
    "QUEEN_GOSSAMER": { drawType: "spider", scale: 5.0, color: "#gold", hpMult: 25 },
    "CERBERUS_JUNIOR": { drawType: "canine", scale: 4.0, color: "#500", hpMult: 20 },
    "VOID_EXARCH": { drawType: "stickman", scale: 6.0, color: "#4b0082", hpMult: 30 },
    "ASTRAL_TITAN": { drawType: "beast", scale: 8.0, color: "#fff", hpMult: 40 },
    "CHRONOS": { drawType: "stickman", scale: 10.0, color: "#00d4ff", hpMult: 50 },
    "THE_CREATOR": { drawType: "custom_path", scale: 12.0, hpMult: 100 } 
};
// Theme-based tier waves
const DUNGEON_THEMES = {
    1: { name: "The Training Grounds", mobs: ["Slime", "StickmanHunter"], boss: "DUNGEON_OVERLORD" },
    2: { name: "The Silken Den", mobs: ["Spiderling", "CaveSpider"], boss: "BROOD_MOTHER" },
    3: { name: "The Howling Woods", mobs: ["StreetDog", "DireWolf"], boss: "FENRIR_LITE" },
    4: { name: "The Abyssal Breach", mobs: ["VoidWalker", "ShadowWraith"], boss: "VOID_CORRUPTOR" },
    5: { name: "The Frozen Tundra", mobs: ["IceSpider", "FrostWolf"], boss: "FROST_JOTUN" },
    6: { name: "The Scorched Earth", mobs: ["FireSpider", "FireSlime"], boss: "MAGMA_CORE" },
    7: { name: "The Mimic Pantry", mobs: ["StaffMimic", "PinkWobbler"], boss: "THE_GRAND_MIMIC" },
    8: { name: "Arachnid Overrun", mobs: ["WolfSpider", "FireSpider", "IceSpider"], boss: "QUEEN_GOSSAMER" },
    9: { name: "The Cursed Kennel", mobs: ["DireWolf", "FrostWolf"], boss: "CERBERUS_JUNIOR" },
    10: { name: "The Void Horizon", mobs: ["VoidDragon", "ShadowWraith"], boss: "VOID_EXARCH" },
    11: { name: "Celestial Spire", mobs: ["StarWraith", "VoidWalker"], boss: "ASTRAL_TITAN" },
    12: { name: "The End Times", mobs: ["CosmicHorror", "DireWolf"], boss: "CHRONOS" },
    13: { name: "The Final Singularity", mobs: ["VoidDragon", "CosmicHorror", "WolfSpider"], boss: "THE_CREATOR" }
};
