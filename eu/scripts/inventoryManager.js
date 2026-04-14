// Inventory Manager (inventoryManager.js) - FINAL PERSISTENCE & UI FIX
// =========================================================
let inventoryDEBUG = window.inventoryDEBUG
window.getData = window.getData || (typeof getData === 'function' ? getData : null);
window.selectedItems = new Set();
let inventoryFullyInitialized = false;
let showFullContainerPath = false;
let currentTotalAssets = 0;
// Global State for Privacy
let isTotalHidden = true;
// Global State for Privacy (Add as many zones as you need)
const privacyStates = {
    summary_total: true,    // Main total card
    summary_liquid: true,   // PED/Ammo card
    summary_pending: true,  // Sell MU card
    summary_fixed: true,    // Save/Craft card
    full_list: true,        // Full Inventory Table Header
    undecided: true,       // Pending Decisions Header
    sidebar_ped: true,      // Sidebar Cash
    sidebar_ammo: true,      // Sidebar Ammo
	buy_list: true,         // buy list
	save_list: true,    
    sell_mu_list: true, 
    sell_tt_list: true, 
    craft_list: true
};

const bulkbar = document.getElementById('bulk-action-bar');
const checkAllundecided = document.getElementById('check-all-undecided');
const fullpathToggles = document.querySelectorAll('.chk-show-full-path');
const fulltableKey = 'FULL_LIST_TABLE';
const fullTbodyId = 'full-list-tbody';
const inputs = {
	fullSearch: document.getElementById('full-list-search'),
	uSearch: document.getElementById('undecided-search'),
	pathInput: document.getElementById('inventory-path-display'),
	buyNameInput: document.getElementById('buy-name'),
	buyqtyInput: document.getElementById('buy-qty'),
	buymuInput: document.getElementById('buy-mu')
}
const buttons = {
	csvLoadBtn: document.getElementById('load-csv-btn'),
	inventoryCsvclipBtn: document.getElementById('btn-import-clipboard'),
	undoLastDecisionBtn: document.getElementById('undo-btn'),
	settingsBrowseBtn: document.getElementById('btn-select-inventory')
}
const selects = {
	planet: document.getElementById('filter-planet'),
	cat: document.getElementById('filter-category'),
	uPlanet: document.getElementById('undecided-planet-filter'),
	uCat: document.getElementById('undecided-category-filter'),
	mPlanet: document.getElementById('market-planet-filter'),
	mCat: document.getElementById('market-category-filter') 
};
 
const toggle = document.getElementById('backlightToggle');
const labelText = document.querySelector('.switch-label');
// Initialize Trade History
// 1. GLOBAL STATE
let tradeHistory = JSON.parse(localStorage.getItem('tradeHistory')) || [];
let tradeDraft = []; // The staging area for multi-item trades

// 2. GLOBAL UI CONSTANTS
const playerIn = document.getElementById('trade-player-name');
const nameIn = document.getElementById('trade-item-name');
const unitIn = document.getElementById('trade-unit-tt');
const qtyIn = document.getElementById('trade-qty');
const muIn = document.getElementById('trade-mu');
const priceIn = document.getElementById('trade-price');
const feedback = document.getElementById('trade-feedback');

const sidebarLog = document.getElementById('trade-history-log');
const fullTbody = document.getElementById('trade-history-full-tbody');

const btnStageSell = document.getElementById('btn-stage-sell');
const btnStageBuy = document.getElementById('btn-stage-buy');
const btnProcess = document.getElementById('btn-process-trade');
const btnUndo = document.getElementById('btn-undo-trade');
const btnClear = document.getElementById('btn-clear-trade-history'); // From Tab D header

// 3. PRICE CALCULATION
const priceCalc = () => {
    const q = parseFloat(qtyIn.value) || 0;
    const u = parseFloat(unitIn.value) || 0;
    const m = (muIn.value === "" || isNaN(muIn.value)) ? 100 : parseFloat(muIn.value);
    priceIn.value = ((q * u) * (m / 100)).toFixed(2);
};

const decisionCardElements = {
    card: document.getElementById('decision-card'),
    empty: document.getElementById('decision-empty'),
    inputs: document.getElementById('decision-inputs'),
    btns: document.getElementById('decision-buttons'),
    confirmBtn: document.getElementById('decision-confirm-btn'), // Fixed syntax
    details: document.getElementById('decision-item-details'),
    inputVal: document.getElementById('decision-input-val'), // Added to cache
    inputLabel: document.getElementById('decision-input-label'), // Added to cache
    // Text elements
    name: document.getElementById('decision-item-name'),
    type: document.getElementById('decision-item-type'),
    subtype: document.getElementById('decision-item-subtype'),
    container: document.getElementById('decision-item-container'),
    qty: document.getElementById('decision-item-qty'),
    val: document.getElementById('decision-item-value')
};
//const THISinventoryDEBUG = true;
let inventoryState = {
    items: {},
    decisions: {}, // Stores your Save/Sell/Craft choices
    buyingList: [],
    undecidedQueue: [], 
	currentDecisionId: null,
    currentActionType: null,
    actionHistory: [],
    pedCashItems: [],      
    ammoItems: [],         
    inventoryFilePath: null, 
    sortConfig: {
        'UNDECIDED_TABLE': { column: 'totalValue', direction: 'desc', isValue: true },    
        'SAVE': { column: 'totalValue', direction: 'desc', isValue: true },
        'SELL_MU': { column: 'totalValue', direction: 'desc', isValue: true },
        'SELL_TT': { column: 'totalValue', direction: 'desc', isValue: true },
        'CRAFT': { column: 'totalValue', direction: 'desc', isValue: true },
        'BUY': { column: 'name', direction: 'asc', isValue: false }, 
        // 🟢 FIX: Add sort config for the Full Inventory List table
        'FULL_LIST_TABLE': { column: 'totalValue', direction: 'desc', isValue: true },
        'PED_CASH_TABLE': { column: 'totalValuePed', direction: 'desc', isValue: true },
        'AMMO_TABLE': { column: 'totalValuePed', direction: 'desc', isValue: true },
    },
    // 🟢 NEW: Storage for the sorted data used by the virtualizer
    virtualizedData: {},
};

const decisionLabels = {
    'SAVE': 'Fixed Assets',
    'SELL_MU': 'Items for Auction',
    'SELL_TT': 'Sell to TT',
    'CRAFT': 'Crafting Materials',
	'BUY': 'Items to Buy'
};
const MASTER_CATEGORY_LIST = [
    "Material", "Decoration", "MiscTool", "Strongbox", "Weapon", "Armor", 
    "MedicalTool", "Clothing", "Refiner", "Finder", "Excavator", 
    "BlueprintBook", "MedicalChip", "TeleportationChip", "EffectChip", 
    "WeaponAmplifier", "WeaponVisionAttachment", "Absorber", "FinderAmplifier", 
    "ArmorPlating", "Enhancer", "MindforceImplant", "Blueprint", "Vehicle", 
    "Furniture", "StorageContainer", "Sign", "Consumable", "Capsule", "Pet"
];

const VIRTUAL_ROW_HEIGHT = 20; 
const VIRTUAL_BUFFER_SIZE = 50; 

const renderedContent = {
    'InventoryTabA': false, // Full Inventory List
    'InventoryTabB': false, // Decisions Queue (Undecided List)
    'InventoryTabC': false, // Market Overview (SAVE, SELL_MU, SELL_TT, CRAFT)
    'InventoryTabD': false, // Buying List
    // Sidebar Collapsibles
    'PED_CASH_TABLE': false,
    'AMMO_TABLE': false,
};
const ROW_TEMPLATES = {
    SELL_MU: createTemplateRow(8),
    UNDECIDED: createTemplateRow(5),
    CRAFT: createTemplateRow(7),
    SAVE: createTemplateRow(6),
    SELL_TT: createTemplateRow(6),
    BUY: createTemplateRow(8),
    DEFAULT: createTemplateRow(5)
};
//---------NEW INVENTORY FILE BULLSHIT-----------
// ==================== CLEAN & PURE DATA-DRIVEN FILTERS ====================
function sanitizeItemName(name) {
    if (!name) return "";
    // Keep it simple: lower case and trim. 
    // Only add regex if your items.json specifically lacks spaces after commas.
    return name.toLowerCase().trim();
}
async function initItemLookupSystem() {
    window.itemLookupMap = new Map(); 
    window.itemDataMap = new Map();   
    window.categoryNames = new Set(MASTER_CATEGORY_LIST); 
    
    try {
        const itemsData = await window.getData("items", "items.json") || []; 
        
        for (let i = 0; i < itemsData.length; i++) {
            const d = itemsData[i];
            if (!d.Name) continue;

            const typeFromJSON = d.Properties?.Type || d.Type || "Unknown"; 
            
            // --- HELPER: Register a name variant ---
            const registerVariant = (nameStr) => {
                const clean = sanitizeItemName(nameStr);
                if (!clean) return;
                
                // Set type lookup
                window.itemLookupMap.set(clean, typeFromJSON);
                // Set full data reference (only if not already set, or if it's the primary name)
                if (!window.itemDataMap.has(clean) || nameStr === d.Name) {
                    window.itemDataMap.set(clean, d);
                }
            };

            // 1. Register Primary Name
            registerVariant(d.Name);

            // 2. Register all Aliases (e.g., "Shogun Harness (M)")
            if (Array.isArray(d.Aliases)) {
                d.Aliases.forEach(alias => registerVariant(alias));
            }
        }

        // 3. Layer Corrections (Overrides)
        if (window.electronAPI) {
            const corrections = await window.electronAPI.loadAppState('itemTypeCorrections');
            if (corrections) {
                Object.entries(corrections).forEach(([name, manualType]) => {
                    const cleanName = sanitizeItemName(name);
                    window.itemLookupMap.set(cleanName, manualType);
                    
                    if (window.itemDataMap.has(cleanName)) {
                        const cachedObj = window.itemDataMap.get(cleanName);
                        if (!cachedObj.Properties) cachedObj.Properties = {};
                        cachedObj.Properties.Type = manualType;
                        cachedObj.Type = manualType;
                    }
                });
            }
        }
        console.log(`[🗺️] Item Maps ready. Entries: ${window.itemDataMap.size}`);
    } catch (err) {
        console.error("🚩 Failed to initialize lookup system:", err);
    }
}
/**
 * Returns just the Type string for an item
 */
function getItemType(item) {
    const name = item.Name || item.name;
    const cleanName = sanitizeItemName(name);
    if (window.itemLookupMap && window.itemLookupMap.has(cleanName)) {
        return window.itemLookupMap.get(cleanName);
    }
    return "Unknown";
}

/**
 * Returns the full JSON object for an item (for sidebar info panel)
 */
function getItemData(name) {
    if (!name) return null;
    const cleanName = sanitizeItemName(name);
    return window.itemDataMap?.get(cleanName) || null;
}
// History stack to track navigation
window.infoHistory = window.infoHistory || [];

window.infoHistory = window.infoHistory || [];

async function showItemInfo(itemName, isBackAction = false) {
    const panel = document.getElementById('item-info-panel');
    const nameEl = document.getElementById('info-item-name');
    const detailsEl = document.getElementById('info-item-details');
    const refEl = document.getElementById('info-ref-id'); 
    
    if (!panel || !detailsEl) return;

    const cleanName = itemName.toLowerCase().trim();
    
    // 1. Primary Lookup from global map
    let baseData = window.itemDataMap.get(cleanName);

    // 2. Alias Fallback
    if (!baseData) {
        for (let item of window.itemDataMap.values()) {
            if (item.Aliases && item.Aliases.some(a => a.toLowerCase() === cleanName)) {
                baseData = item;
                break;
            }
        }
    }

    if (!baseData) {
        nameEl.innerText = itemName;
        detailsEl.innerHTML = `<div class='p-2 text-red-500 font-mono text-[10px] animate-pulse'>[ERROR] DATA_NOT_FOUND: ${itemName}</div>`;
        panel.style.display = 'block';
        return;
    }

    // --- BREADCRUMB HISTORY ---
    if (!isBackAction) {
        const currentItem = nameEl.innerText.replace('RETURN / ', '').trim();
        if (currentItem && currentItem !== "ITEM DETAILS" && currentItem !== itemName) {
            window.infoHistory = window.infoHistory || [];
            window.infoHistory.push(currentItem);
        }
    }

    // Cache Mapping for Detailed Data
    const cacheMap = {
        'weapons': window.cachedWeapons,
        'armors': window.cachedArmors,
        'materials': window.cachedMaterials,
        'blueprints': window.cachedBlueprints,
        'clothes': window.cachedClothes,
        'medical-tools': window.cachedMedicalTools,
        'medicaltools': window.cachedMedicalTools,
        'medical-chips': window.cachedMedicalChips,
        'medicalchips': window.cachedMedicalChips,
        'finders': window.cachedFinders,
        'amplifiers': window.cachedAmplifiers,
        'scopes': window.cachedScopes,
        'weaponvisionattachments': window.cachedScopes,
        'faps': window.cachedFaps
    };

    let detailedData = null;
    let category = "";
    const url = baseData.Links?.$Url || "";
    if (url) {
        const parts = url.split('/'); 
        category = parts[1]?.toLowerCase();
        const subId = parseInt(parts[2]);
        const targetCache = cacheMap[category];
        if (targetCache) {
            detailedData = targetCache.find(x => x.Id === subId || x.ItemId === subId);
        }
    }

    const data = detailedData || baseData;
    const displayName = data.Name || itemName;
    const refTarget = displayName.toLowerCase().trim();

    // --- HEADER ---
    if (window.infoHistory && window.infoHistory.length > 0) {
        nameEl.innerHTML = `
            <span id="info-back-btn" style="cursor:pointer; color:#a855f7; opacity:0.8;">
                RETURN
            </span> 
            <span style="opacity:0.3; margin: 0 4px;">/</span> 
            ${displayName}<i class="fas fa-chevron-down collapsible-icon text-white"></i>`;
    } else {
        nameEl.innerText = displayName;
    }

    if (refEl) refEl.innerText = `REF_ID // ${data.ItemId || data.Id || '0000'}`;

    const renderAnyData = (obj) => {
        if (!obj || typeof obj !== 'object') return "";
        let snippet = "";
        const skipKeys = ['Links', 'Name', 'Id', 'ItemId', 'ClassId', 'Tiers', 'EffectsOnEquip', 'EffectsOnUse', 'Aliases'];
        for (const [key, val] of Object.entries(obj)) {
            if (skipKeys.includes(key) || val === null || val === undefined) continue;
            if (typeof val === 'object' && !Array.isArray(val)) {
                snippet += `
                    <details class="term-details">
                        <summary class="term-summary">
                            <i class="fas fa-caret-right mr-2" style="font-size:10px;"></i>
                            <span class="term-label">${key.toUpperCase()} ${val.Name ? `<span style="opacity:0.4;">[${val.Name}]</span>` : ''}</span>
                        </summary>
                        <div class="term-content">${renderAnyData(val)}</div>
                    </details>`;
            } else if (!Array.isArray(val)) {
                snippet += `<div class="term-kv"><span class="term-key">${key.toLowerCase()}</span><span class="term-val">${val}</span></div>`;
            }
        }
        return snippet;
    };

    let html = `<div class="terminal-body">`;

    // --- WEAPON PERFORMANCE ---
    if (category === 'weapons' || data.Properties?.Type === 'Weapon') {
        const maxedSettings = { hitSkill: 999, dmgSkill: 999, weaponMU: 1, ammoMU: 1, totalMaxDamage: Number(data.Properties?.Damage?.MaxDamage || 0) };
        const result = typeof calculateWeaponData === 'function' ? calculateWeaponData(data, maxedSettings) : null;
        if (result) {
            const valid = (num, dec = 2) => isFinite(parseFloat(num)) ? parseFloat(num).toFixed(dec) : "0.00";
            html += `
                <div class="perf-block">
                    <div class="perf-header"><span class="perf-title">Maxed Performance Profile</span><i class="fas fa-microchip" style="color: rgba(237, 137, 54, 0.4); font-size: 10px;"></i></div>
                    <div class="perf-grid">
                        <div class="term-kv"><span class="term-key">DPP</span><span class="term-val highlight">${valid(result.econ.dpp, 4)}</span></div>
                        <div class="term-kv"><span class="term-key">USES</span><span class="term-val" style="color:#fff;">${result.econ.totalUses.toLocaleString()}</span></div>
                        <div class="term-kv"><span class="term-key">DPS</span><span class="term-val" style="color:#fff;">${valid(result.dps, 2)}</span></div>
                        <div class="term-kv"><span class="term-key">EFF</span><span class="term-val" style="color:#fff;">${result.econ.efficiency || 0}%</span></div>
                        <div class="term-kv"><span class="term-key">COST</span><span class="term-val" style="color:#fff;">${valid(result.econ.costPerUsePEC, 2)} pec</span></div>
                    </div>
                </div>`;
        }
    }

    // --- ARMOR PROTECTION ---
    if (category === 'armors' || data.Properties?.Type === 'Armor') {
        const prot = data.Properties?.Protection;
        if (prot) {
            html += `
                <div class="perf-block" style="border-color: rgba(74, 222, 128, 0.3);">
                    <div class="perf-header"><span class="perf-title" style="color:#4ade80;">Armor Protection Profile</span><i class="fas fa-shield-alt" style="color: rgba(74, 222, 128, 0.4); font-size: 10px;"></i></div>
                    <div class="perf-grid">`;
            for (const [pType, pVal] of Object.entries(prot)) {
                if (pVal > 0) {
                    html += `<div class="term-kv"><span class="term-key">${pType.toUpperCase()}</span><span class="term-val" style="color:#4ade80;">${pVal}</span></div>`;
                }
            }
            html += `</div></div>`;
        }
    }
    
    // Core Properties
    if (data.Properties) html += renderAnyData(data.Properties);
    const rootClone = { ...data }; delete rootClone.Properties; 
    html += renderAnyData(rootClone);

    // --- CRAFTABLE VIA BLUEPRINT (PRODUCT LOOKUP) ---
    const allBlueprints = window.cachedBlueprints || [];
    const craftSourceMatches = allBlueprints.filter(bp => {
        const prodName = bp.ProductName || bp.Name.replace(" Blueprint", "");
        return prodName.toLowerCase().trim() === refTarget;
    });

    if (craftSourceMatches.length > 0) {
        html += `
            <div class="mt-4 pt-3 border-t border-orange-500/30">
                <details class="term-details" open>
                    <summary class="term-summary" style="color:#ed8936;">
                        <i class="fas fa-hammer mr-2" style="font-size:10px;"></i>
                        <span class="term-label">CRAFTABLE VIA BLUEPRINT</span>
                    </summary>
                    <div class="term-content mt-2">
                        <div class="space-y-2">
                            ${craftSourceMatches.map(bp => `
                                <div class="info-nav-link" 
                                     style="border-color: rgba(237, 137, 54, 0.2); background: rgba(237, 137, 54, 0.05);" 
                                     data-nav-name="${bp.Name.replace(/"/g, '&quot;')}">
                                    <div style="display:flex; justify-content:space-between; align-items:center;">
                                        <span style="color:#ed8936; font-size:11px;">${bp.Name}</span>
                                        <i class="fas fa-external-link-alt" style="font-size:8px; opacity:0.5;"></i>
                                    </div>
                                    ${bp.SuccessRate ? `<div style="font-size:9px; color:#aaa; margin-top:2px;">Base Success: ${bp.SuccessRate}%</div>` : ''}
                                </div>`).join('')}
                        </div>
                    </div>
                </details>
            </div>`;
    }

    // --- USED AS INGREDIENT (INGREDIENT REVERSE LOOKUP) ---
    const bpMatches = typeof multiFieldFilter === 'function' ? multiFieldFilter(displayName, allBlueprints) : [];
    if (bpMatches.length > 0) {
        html += `
            <div class="mt-2 pt-2 border-t border-purple-500/30">
                <details class="term-details">
                    <summary class="term-summary" style="color:#a855f7;">
                        <i class="fas fa-flask mr-2" style="font-size:10px;"></i>
                        <span class="term-label">USED IN ${bpMatches.length} BLUEPRINTS</span>
                    </summary>
                    <div class="term-content mt-2" style="max-height: 150px; overflow-y: auto;">
                        <div class="space-y-1">
                            ${bpMatches.slice(0, 50).map(bp => `
                                <div class="info-nav-link" data-nav-name="${bp.Name.replace(/"/g, '&quot;')}">
                                    <span>${bp.Name}</span>
                                </div>`).join('')}
                        </div>
                    </div>
                </details>
            </div>`;
    }

    // --- REFINING RECIPES ---
    const refiningRecipes = window.cachedRefiningRecipes || [];
    const refMatches = refiningRecipes.filter(r => {
        const isIngredient = r.Ingredients?.some(ing => ing.Item?.Name?.toLowerCase().trim() === refTarget);
        const isProduct = r.Product?.Name?.toLowerCase().trim() === refTarget;
        return isIngredient || isProduct;
    });
    if (refMatches.length > 0) {
        html += `
            <div class="mt-2 pt-2 border-t border-cyan-500/30">
                <details class="term-details">
                    <summary class="term-summary" style="color:#22d3ee;">
                        <i class="fas fa-fire mr-2" style="font-size:10px;"></i>
                        <span class="term-label">REFINING_LOGS [${refMatches.length}]</span>
                    </summary>
                    <div class="term-content mt-2" style="max-height: 150px; overflow-y: auto;">
                        <div class="space-y-1">
                            ${refMatches.map(r => {
                                const isInput = r.Ingredients?.some(ing => ing.Item?.Name?.toLowerCase().trim() === refTarget);
                                const otherItem = isInput ? r.Product?.Name : r.Ingredients?.[0]?.Item?.Name;
                                return `
                                    <div class="info-nav-link" style="border-color: rgba(34, 211, 238, 0.2); background: rgba(34, 211, 238, 0.05);" data-nav-name="${otherItem.replace(/"/g, '&quot;')}">
                                        <div style="font-size:9px; color:#22d3ee;">${isInput ? 'Ingredient → ' + otherItem : 'Result ← ' + otherItem}</div>
                                    </div>`;
                            }).join('')}
                        </div>
                    </div>
                </details>
            </div>`;
    }

    // --- LOADOUT PRESENCE ---
    const loadouts = window.loadouts || [];
    const findInLoadout = (obj) => {
        if (!obj || typeof obj !== 'object') return false;
        for (const value of Object.values(obj)) {
            if (typeof value === 'string' && value.toLowerCase().trim() === refTarget) return true;
            if (typeof value === 'object' && value !== null) {
                if (findInLoadout(value)) return true;
            }
        }
        return false;
    };

    const loadoutMatches = loadouts.filter(l => findInLoadout(l));
    if (loadoutMatches.length > 0) {
        html += `
            <div class="mt-2 pt-2 border-t border-green-500/30">
                <details class="term-details">
                    <summary class="term-summary" style="color:#4ade80;">
                        <i class="fas fa-shield-alt mr-2" style="font-size:10px;"></i>
                        <span class="term-label">ACTIVE LOADOUTS [${loadoutMatches.length}]</span>
                    </summary>
                    <div class="term-content mt-2">
                        <div class="space-y-1">
                            ${loadoutMatches.map(l => `
                                <div style="padding:6px; background:rgba(74, 222, 128, 0.05); border:1px solid rgba(74, 222, 128, 0.1); border-radius:3px;">
                                    <span style="font-size:10px; color:#ccc; font-family:monospace;">${l.name.toUpperCase()}</span>
                                </div>`).join('')}
                        </div>
                    </div>
                </details>
            </div>`;
    }

    html += `</div>`;
    detailsEl.innerHTML = html;
    panel.style.display = 'block';
}
function getItemContainerPath(item, allItems) {
    if (!item) return "N/A";
    let path = [item.location];
    if (!item.containerRef || item.containerRef === 'null') {
        return item.location;
    }
    let currentRef = item.containerRef;
    let depth = 0; 
    while (currentRef && currentRef !== 'null' && depth < 15) {
        const parent = allItems[currentRef];
        if (parent) {
            if (parent.containerRef && parent.containerRef !== 'null') {
                path.push(parent.location);
                currentRef = parent.containerRef;
            } else {
                // We hit the top! Add the parent name AND the physical world location
                path.push(parent.name);
                path.push(parent.location);
                currentRef = null; // Stop the loop
            }
        } else {
            path.push(`(Missing Container: ${currentRef})`);
            break;
        }
        depth++;
    }
    return path.join(', ');
}
function getInventory() {
    return Object.values(inventoryState.items).map(item => {
        const type = typeof getItemType === 'function' ? getItemType(item) : (item.category || 'Item');
        const decision = inventoryState.decisions[String(item.id)] || { type: 'UNDECIDED', meta: {} };   
        return {
            ...item,
            type: type,
            decision: decision,
        };
    });
}
// ==================== FIXED: Read Real Categories from Properties.Type ====================

async function updateFilterDropdowns() {
    if (!Object.values(selects).some(el => el)) return;
    // 1. Reset Dropdowns
    const reset = (el, txt) => { if(el) el.innerHTML = `<option value="ALL">${txt}</option>`; };
    reset(selects.planet, "All Locations");
    reset(selects.cat, "All Categories");
    reset(selects.uPlanet, "All Planets");
    reset(selects.uCat, "All Categories");
    reset(selects.mPlanet, "All Locations");
    reset(selects.mCat, "All Categories");

    // 2. Planet Extraction Logic (Strict)
    const planetNames = new Set();
    const inventoryItems = Object.values(inventoryState.items || {});
    inventoryItems.forEach(item => {
        if (item.location) {
            const loc = item.location.toUpperCase();
            
            // Handle CARRIED and HUB explicitly
            if (loc === "CARRIED" || loc === "HUB") {
                planetNames.add(loc);
                return;
            }

            // ONLY extract names inside STORAGE (PLANET NAME)
            const match = loc.match(/STORAGE\s*\(([^)]+)\)/i);
            if (match && match[1]) {
                planetNames.add(match[1].trim().toUpperCase());
            }
            // Fallback is REMOVED to prevent "random" locations from cluttering list
        }
    });
    // 3. Ensure Lookup System (Categories) is ready
    if (!window.categoryNames || window.categoryNames.size === 0) {
        await initItemLookupSystem();
    }
    // 4. Populate UI
    const populate = (el, set) => {
        if (!el || !set) return;
        const sorted = Array.from(set).sort((a, b) => {
            if (a === "CARRIED") return -1;
            if (b === "CARRIED") return 1;
            if (a === "HUB") return -1;
            return a.localeCompare(b);
        });

        sorted.forEach(val => {
            el.appendChild(new Option(val, val));
        });
    };
    populate(selects.planet, planetNames);
    populate(selects.cat, window.categoryNames);
    populate(selects.uPlanet, planetNames);
    populate(selects.uCat, window.categoryNames);
    populate(selects.mPlanet, planetNames);
    populate(selects.mCat, window.categoryNames);
}
// Function to handle the "Browse" button click in Settings
// ================= WEB VERSION - FILTER DROPDOWNS =================
async function updateFilterDropdowns() {
    if (!Object.values(selects).some(el => el)) return;

    // 1. Reset all dropdowns
    const reset = (el, txt) => {
        if (el) el.innerHTML = `<option value="ALL">${txt}</option>`;
    };

    reset(selects.planet, "All Locations");
    reset(selects.cat, "All Categories");
    reset(selects.uPlanet, "All Planets");
    reset(selects.uCat, "All Categories");
    reset(selects.mPlanet, "All Locations");
    reset(selects.mCat, "All Categories");

    // 2. Extract unique planets from inventory
    const planetNames = new Set();
    const inventoryItems = Object.values(inventoryState.items || {});

    inventoryItems.forEach(item => {
        if (item.location) {
            const loc = item.location.toUpperCase();

            if (loc === "CARRIED" || loc === "HUB") {
                planetNames.add(loc);
                return;
            }

            // Extract planet name from STORAGE (Planet Name)
            const match = loc.match(/STORAGE\s*\(([^)]+)\)/i);
            if (match && match[1]) {
                planetNames.add(match[1].trim().toUpperCase());
            }
        }
    });

    // 3. Ensure category lookup is ready
    if (!window.categoryNames || window.categoryNames.size === 0) {
        await initItemLookupSystem();
    }

    // 4. Populate dropdowns
    const populate = (el, set) => {
        if (!el || !set) return;
        const sorted = Array.from(set).sort((a, b) => {
            if (a === "CARRIED") return -1;
            if (b === "CARRIED") return 1;
            if (a === "HUB") return -1;
            return a.localeCompare(b);
        });

        sorted.forEach(val => {
            el.appendChild(new Option(val, val));
        });
    };

    populate(selects.planet, planetNames);
    populate(selects.cat, window.categoryNames || new Set());
    populate(selects.uPlanet, planetNames);
    populate(selects.uCat, window.categoryNames || new Set());
    populate(selects.mPlanet, planetNames);
    populate(selects.mCat, window.categoryNames || new Set());

    console.log(`✅ Filter dropdowns updated: ${planetNames.size} planets, ${window.categoryNames?.size || 0} categories`);
}

// ================= WEB VERSION - MANUAL IMPORT (Clipboard only) =================
async function handleManualFileSelection() {
    alert("In the web version, please use the '📋 Paste Inventory Csv' button instead.");
}

// ================= WEB VERSION - STARTUP INITIALIZATION =================
async function initializeInventoryStartup() {
    console.log("🔄 Starting inventory initialization (Web Version)...");

    // 1. Check if we have clipboard-saved data
    const mode = localStorage.getItem('inventorySourceMode');
    if (mode === 'CLIPBOARD') {
        const cachedCSV = localStorage.getItem('customInventoryData');
        if (cachedCSV) {
            console.log("Restoring inventory from clipboard cache...");
            const blob = new Blob([cachedCSV], { type: 'text/csv' });
            const virtualFile = new File([blob], "clipboard_cache.csv", { type: 'text/csv' });
            await loadAndProcessFile(virtualFile);
            return;
        }
    }

    // 2. If no clipboard data, check if we have any items already in memory
    if (Object.keys(inventoryState.items || {}).length > 0) {
        console.log("Inventory already loaded in memory.");
        renderInitialTabA();
        updateSummary();
        return;
    }

    // 3. No data at all → prompt user to paste from clipboard
    console.log("No inventory data found. Prompting user to paste from clipboard.");
    if (confirm("No inventory data found.\n\nWould you like to paste your inventory from clipboard now?")) {
        await importInventoryFromClipboard();
    } else {
        console.log("User declined to load inventory on startup.");
    }

    updateFilterDropdowns();
}

// ================= FULL PATH TOGGLE SYNC =================
function initPathfullpathTogglesync() {
    // Use event delegation on document (safest for dynamic content)
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('chk-show-full-path')) {
            showFullContainerPath = e.target.checked;

            // Sync ALL checkboxes with this class
            document.querySelectorAll('.chk-show-full-path').forEach(el => {
                el.checked = showFullContainerPath;
            });

            // Refresh views
            refreshInventoryViews();
        }
    });

    // Initial sync on load
    document.querySelectorAll('.chk-show-full-path').forEach(el => {
        el.checked = showFullContainerPath;
    });

    console.log("✅ Full path toggle sync initialized");
}
// =========================================================
// 🟢 NEW/MODIFIED: LAZY LOAD & TAB HANDLERS
// =========================================================
function initPathfullpathTogglesync() {    
    // 1. Listen for clicks on the DOCUMENT (Event Delegation)
    // This handles checkboxes even if they are added to the DOM later
    document.addEventListener('change', (e) => {
        if (e.target.classList.contains('chk-show-full-path')) {
            showFullContainerPath = e.target.checked;
            
            // 2. Sync ALL checkboxes with this class so they all match
            document.querySelectorAll('.chk-show-full-path').forEach(el => {
                el.checked = showFullContainerPath;
            });

            // 3. Trigger UI Refresh
            refreshInventoryViews();
        }
    });

    // 4. Initial Sync: Make sure all existing boxes match the current state on load
    document.querySelectorAll('.chk-show-full-path').forEach(el => {
        el.checked = showFullContainerPath;
    });
}

// Helper to avoid repeating this block of code everywhere
function refreshInventoryViews() {
    if (typeof renderInitialTabA === 'function') renderInitialTabA();   
    
    // Handle Undecided Tab
    if (typeof renderFilteredUndecided === 'function') {
        const s = document.getElementById('undecided-search')?.value || '';
        const p = document.getElementById('undecided-planet-filter')?.value || 'ALL';
        const c = document.getElementById('undecided-category-filter')?.value || 'ALL';
        renderFilteredUndecided(s, p, c);
    }
    
    // Handle Market Tabs
    const activeTab = inventoryState.currentTab; 
    if (['SAVE', 'SELL_MU', 'SELL_TT', 'CRAFT'].includes(activeTab)) {
        renderTable(activeTab, getTbodyId(activeTab));
    }
}
function renderInitialTabA() {
    renderFullInventoryList(); 
    renderedContent['InventoryTabA'] = true;
}

async function preRenderHiddenTabs() {
    const state = inventoryState;
    const tabsToProcess = [];
    if (!renderedContent['InventoryTabB']) {
        tabsToProcess.push({ name: 'TabB', action: refreshUndecidedUI });
    }
    if (!renderedContent['InventoryTabC']) {
        tabsToProcess.push({ 
            name: 'TabC', 
            action: () => renderInventory(['SAVE', 'SELL_MU', 'SELL_TT', 'CRAFT']) 
        });
    }
    if (!renderedContent['FullList']) {
        tabsToProcess.push({ name: 'FullList', action: () => renderFullInventoryList() });
    }
    for (const tab of tabsToProcess) {
/* 		await new Promise(resolve => {
            if ('requestIdleCallback' in window) {
                requestIdleCallback(resolve); 
            } else {
                setTimeout(resolve, 0);
            }
        }); */

        console.log(`✔️📲 Processing  ${tab.name}...`);
		if (tab.name === 'FullList' && !inventoryFullyInitialized) {
				inventoryFullyInitialized = true;
				console.log(`✅ Processing Complete...`);
				console.log(`☑️ InventoryManager fully initiated!`);
		}
        tab.action();
        renderedContent[tab.name === 'FullList' ? 'FullList' : `Inventory${tab.name}`] = true;
    }
}
function handleInventorySubTabSwitching(subtabId) {
    const state = inventoryState;

    // Tab A: Full Inventory
    if (subtabId === 'InventoryTabA') {
        if (!renderedContent['InventoryTabA'] || state.needsFullRefresh) {
            renderFullInventoryList();
            renderedContent['InventoryTabA'] = true;
            state.needsFullRefresh = false;
        }
    } 
    // Tab B: Decisions Queue
    else if (subtabId === 'InventoryTabB') {
        if (!renderedContent['InventoryTabB'] || state.needsUndecidedRefresh) {
            refreshUndecidedUI(); 
            renderedContent['InventoryTabB'] = true;
            state.needsUndecidedRefresh = false;
        }
    } 
    // Tab C: Market View (Save, Sell, Craft)
    else if (subtabId === 'InventoryTabC') {
        if (!renderedContent['InventoryTabC'] || state.needsMarketRefresh) {
            renderInventory(['SAVE', 'SELL_MU', 'SELL_TT', 'CRAFT']);
            renderedContent['InventoryTabC'] = true;
            state.needsMarketRefresh = false;
        }
    }
}
function handleCollapsibleContentRendering(targetId) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) return;
    const isCollapsed = targetElement.classList.toggle('collapsed');
    if (!isCollapsed) {
        if (targetId === 'ped-cash-location-content' && !renderedContent['PED_CASH_TABLE']) {
            renderDetailedLocationTable('ped-cash-tbody', inventoryState.pedCashItems);
            renderedContent['PED_CASH_TABLE'] = true;
        } 
        else if (targetId === 'ammo-location-content' && !renderedContent['AMMO_TABLE']) {
            renderDetailedLocationTable('ammo-tbody', inventoryState.ammoItems);
            renderedContent['AMMO_TABLE'] = true;
        }
    }
}
function toggleCollapsible(headerEl) {
    const targetId = headerEl.getAttribute('data-target');
    const contentEl = document.getElementById(targetId);
    if (!contentEl) return;

    // Toggle the visibility
    contentEl.classList.toggle('hidden'); 
    
    // Toggle the icon if it exists
    const iconEl = headerEl.querySelector('.collapsible-icon');
    if (iconEl) {
        if (contentEl.classList.contains('hidden')) {
            iconEl.classList.replace('fa-chevron-down', 'fa-chevron-up');
        } else {
            iconEl.classList.replace('fa-chevron-up', 'fa-chevron-down');
        }
    }
}

function getTbodyId(decisionType) {
    switch (decisionType) {
        case 'UNDECIDED': return 'undecided-tbody';
        case 'SAVE':      return 'save-tbody'; 
        case 'SELL_MU':   return 'sell-mu-tbody';
        case 'SELL_TT':   return 'sell-tt-tbody';
        case 'CRAFT':     return 'craft-tbody';
        case 'BUY':       return 'buy-tbody';
        case 'FULL_LIST': return 'full-list-tbody';
        default: return null;
    }
}
function getTableKeyFromTbodyId(tbodyId) {
    // Converts e.g., 'full-list-tbody' to 'FULL_LIST_TABLE'
    return tbodyId.toUpperCase().replace(/-/g, '_').replace('_TBODY', '_TABLE');
}
function getItemSortValue(item, column) {
    if (!item) return '';

    // Helper to force a clean numeric value from ANY string/number combo
    const cleanNum = (val) => {
        if (val === undefined || val === null || val === '') return 0;
        // Stringify, remove commas, spaces, and "PED", then parse
        const cleaned = String(val).replace(/,/g, '').replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    };

    // --- 1. BUYING LIST SPECIFIC ---
    if (column === 'planet') return item.planet || 'ALL';
    if (column === 'targetQty') return cleanNum(item.targetQty);
    if (column === 'targetMu') return cleanNum(item.targetMu);
    if (column === 'ttValue') return cleanNum(item.ttValue);

    if (column === 'totalTT') {
        return cleanNum(item.ttValue) * cleanNum(item.targetQty);
    }

    if (column === 'maxBuy') {
        const totalTT = cleanNum(item.ttValue) * cleanNum(item.targetQty);
        return totalTT * (cleanNum(item.targetMu) / 100);
    }

    // --- 2. SIDEBAR & INVENTORY ---
    
    // QTY
    if (column === 'quantity' || column === 'qty') {
        return cleanNum(item.quantity || item.qty);
    }

    // TT/UNIT
    if (column === 'value' || column === 'unitValue') {
        return cleanNum(item.value || item.ttValue);
    }

    // TOTAL VALUE
    if (column === 'totalValue') {
        // Special case for buying list
        if (item.targetQty !== undefined) {
             return (cleanNum(item.ttValue) * cleanNum(item.targetQty)) * (cleanNum(item.targetMu) / 100);
        }
        return cleanNum(item.totalValue || item.totalValuePed);
    }

    // --- 3. OTHERS ---
    if (column === 'decision') return item.decision?.type || 'UNDECIDED';
    if (column === 'mu') return cleanNum(item.decision?.meta?.mu);
    
    return item[column] !== undefined ? item[column] : '';
}
function sortItems(items, tableKey) {
    const config = inventoryState.sortConfig[tableKey];
    if (!config || !config.column) return items;

    return [...items].sort((a, b) => {
        const valA = getItemSortValue(a, config.column);
        const valB = getItemSortValue(b, config.column);

        // Force both to numbers for a "Math" check
        const numA = parseFloat(valA);
        const numB = parseFloat(valB);

        // If BOTH are valid numbers, do a math subtraction sort
        if (!isNaN(numA) && !isNaN(numB)) {
            return config.direction === 'asc' ? numA - numB : numB - numA;
        }

        // Otherwise, fall back to string/alphabetical
        const strA = String(valA).toLowerCase();
        const strB = String(valB).toLowerCase();
        
        if (strA < strB) return config.direction === 'asc' ? -1 : 1;
        if (strA > strB) return config.direction === 'asc' ? 1 : -1;
        return 0;
    });
}
function getItemTTValueByName(itemName) {
    if (!itemName || !inventoryState.items) return 0;

    const cleanName = itemName.toLowerCase().trim();

    // Find best match in current inventory
    const matchingItem = Object.values(inventoryState.items).find(item => {
        return (item.name || '').toLowerCase().trim() === cleanName;
    });

    if (matchingItem) {
        // Prefer .value (TT per unit), fallback to totalValue / quantity
        if (matchingItem.value && matchingItem.value > 0) {
            return parseFloat(matchingItem.value);
        }
        if (matchingItem.totalValue && matchingItem.quantity) {
            return parseFloat(matchingItem.totalValue) / parseFloat(matchingItem.quantity);
        }
    }
    return 0; // fallback if not found
}

function createTemplateRow(cellCount) {
    const tr = document.createElement('tr');
    tr.className = 'text-gray-300 hover:bg-gray-700/50 text-xs inventory-row';
    tr.style.position = 'absolute';
    tr.style.width = '100%';
    tr.style.height = `${VIRTUAL_ROW_HEIGHT}px`;
    
    for (let i = 0; i < cellCount; i++) {
        tr.insertCell();
    }
    return tr;
}

// 2. The Optimized function
function createRowElement(item, type) {
    if (!item || !item.id) return null;
    const template = ROW_TEMPLATES[type] || ROW_TEMPLATES.DEFAULT;
    const row = template.cloneNode(true);
    row.dataset.itemId = item.id;
    updateVirtualRowContent(row, item, type);
    return row;
}
function insertRow(itemId, decisionType) {
    if (decisionType === 'FULL_LIST') {
        renderFullInventoryList();
    } else if (['SAVE', 'SELL_MU', 'SELL_TT', 'CRAFT', 'UNDECIDED', 'BUY'].includes(decisionType)) {
        // Now includes 'BUY'
        if (decisionType === 'BUY') {
            renderBuyingList();
        } else {
            renderTable(decisionType, getTbodyId(decisionType));
        }
    }
}
function createFullInventoryRow(item) {
    if (!item || !item.id) return null;

    const row = document.createElement('tr');
    row.dataset.itemId = item.id;
    row.classList.add('text-gray-300', 'hover:bg-gray-700/50', 'text-xs', 'inventory-row');
    row.style.position = 'absolute';
    row.style.width = '100%';
    row.style.height = `${VIRTUAL_ROW_HEIGHT}px`;
    // Create exactly 7 cells (matches your thead)
    for (let i = 0; i < 7; i++) {
        row.insertCell();
    }

    updateFullInventoryRowContent(row, item);
    return row;
}
function updateVirtualRowContent(row, item, type) {
    if (!row || !item) return;

    // =========================================================
    // 1. SPECIAL CASE: BUYING LIST (Improved layout + visual % inside input)
    // =========================================================
	if (type === 'BUY' || type === 'BUY_TABLE') {
		const cells = row.cells;
		if (cells.length < 8) return;

		// 1. Location (first column)
		cells[0].className = 'col-location font-bold text-gray-400 uppercase text-[10px]';
		cells[0].textContent = (item.planet || 'ALL');

		// 2. Name
		cells[1].textContent = item.name || '';

		// 3. Target Qty
		cells[2].textContent = Math.ceil(item.targetQty || 0).toLocaleString();

		// 4. TT/Unit (read-only)
		cells[3].className = 'col-ttvalue text-cyan-300 font-mono text-right px-1';
		cells[3].textContent = (item.ttValue || 0).toFixed(4);

		// 5. Total TT = TT/Unit × Target Qty (read-only)
		const totalTT = (item.ttValue || 0) * (item.targetQty || 0);
		cells[4].className = 'col-total font-mono text-cyan-400';
		cells[4].textContent = totalTT.toFixed(2);

		// 6. Target MU% (with visual % inside input)
		cells[5].className = 'col-mu px-1 flex justify-center items-center';
		let muInput = cells[5].querySelector('.mu-edit-input');
		
		const currentMu = (item.targetMu || 100).toFixed(1);
		const maxBuyPrice = totalTT * ((item.targetMu || 100) / 100);

		if (!muInput) {
			cells[5].innerHTML = `
				<div class="mu-wrapper relative w-full max-w-[82px]">
					<input type="number" step="0.1" min="0" 
						   class="mu-edit-input bg-gray-950 text-yellow-400 border border-gray-600 
								  rounded px-3 py-1 text-center text-[11px] h-6 w-full pr-8" 
						   value="${currentMu}" 
						   data-id="${item.id}"
						   title="Item: ${item.name}\nTarget Qty: ${Math.ceil(item.targetQty || 0).toLocaleString()}\nTT/Unit: ${(item.ttValue || 0).toFixed(4)} PED\nTotal TT: ${totalTT.toFixed(2)} PED\nMax Buy Price: ${maxBuyPrice.toFixed(2)} PED">
					<span class="absolute right-2 top-1/2 -translate-y-1/2 text-yellow-400 text-[11px] pointer-events-none font-medium select-none">%</span>
				</div>
			`;
			muInput = cells[5].querySelector('input');
		} else {
			muInput.value = currentMu;
			muInput.dataset.id = item.id;
			muInput.title = `Item: ${item.name}\nTarget Qty: ${Math.ceil(item.targetQty || 0).toLocaleString()}\nTT/Unit: ${(item.ttValue || 0).toFixed(4)} PED\nTotal TT: ${totalTT.toFixed(2)} PED\nMax Buy Price: ${maxBuyPrice.toFixed(2)} PED`;
		}

		// 7. Max Buy Price (live calculated)
		cells[6].className = 'col-total font-mono text-green-400';
		cells[6].textContent = maxBuyPrice.toFixed(2);

		// 8. Action (trash)
		let btn = cells[7].querySelector('button');
		if (!btn) {
			cells[7].innerHTML = `<button data-action="remove-buy" class="text-red-500 hover:text-red-400"><i class="fas fa-trash-alt"></i></button>`;
			btn = cells[7].querySelector('button');
		}
		btn.dataset.id = item.id;

		row.dataset.itemId = item.id;

		// Sync column widths to prevent disappearing rows
		const table = document.getElementById('buy-table');
		if (table) {
			const ths = table.querySelectorAll('thead th');
			ths.forEach((th, idx) => {
				if (cells[idx]) {
					const w = th.style.width || getComputedStyle(th).width;
					cells[idx].style.width = w;
					cells[idx].style.minWidth = w;
				}
			});
		}
		return;
	}

    // =========================================================
    // 2. STANDARD INVENTORY / MARKET TABLES (unchanged)
    // =========================================================
    
    const decision = inventoryState.decisions[String(item.id)] || { type: 'UNDECIDED', meta: {} };
    const cells = row.cells;
    let cellIndex = 0;

    const fullPath = getItemContainerPath(item, inventoryState.items);
    const displayLocation = (showFullContainerPath ? fullPath : (item.location || 'N/A')).toUpperCase();

    if (type === 'UNDECIDED' || type === 'UNDECIDED_TABLE') {
        let cb = cells[cellIndex].querySelector('.item-checkbox');
        if (!cb) {
            cells[cellIndex].className = 'text-center w-10';
            cells[cellIndex].innerHTML = `<input type="checkbox" class="item-checkbox" data-id="${item.id}">`;
            cb = cells[cellIndex].querySelector('input');
        } else {
            cb.dataset.id = item.id;
        }
        cb.checked = window.selectedItems?.has(String(item.id)) || false;
        cellIndex++;

        cells[cellIndex].className = 'col-location italic text-gray-500 uppercase text-[10px]';
        cells[cellIndex].textContent = displayLocation;
        cellIndex++;
    } else {
        cells[cellIndex].className = 'col-location font-bold text-gray-400 uppercase text-[10px] w-24';
        cells[cellIndex].textContent = displayLocation;
        cellIndex++;
    }

    cells[cellIndex].className = 'col-name';
    cells[cellIndex].textContent = item.name || 'N/A';
    cellIndex++;

    cells[cellIndex].className = 'col-qty';
    cells[cellIndex].textContent = (item.quantity || 0).toLocaleString(undefined, {maximumFractionDigits: 0});
    cellIndex++;

    if (type === 'SELL_MU') {
        const muValue = decision.meta.mu || 100;
        const total = item.totalValue || 0;

        cells[cellIndex].className = 'col-unit text-gray-500';
        cells[cellIndex++].textContent = (item.value || 0).toFixed(2);

        cells[cellIndex].className = 'col-total font-mono';
        cells[cellIndex++].textContent = total.toFixed(2);

        // MU% with visual % (same style as Buy table)
        cells[cellIndex].className = 'col-mu px-1 flex justify-center items-center';
        const muInputContainer = cells[cellIndex];
        let muInput = muInputContainer.querySelector('.mu-edit-input');
        if (!muInput) {
            muInputContainer.innerHTML = `
                <div class="relative w-full max-w-[75px]">
                    <input type="number" step="0.1" class="mu-edit-input bg-gray-950 text-yellow-400 border border-gray-600 rounded px-3 py-1 text-center text-[11px] h-6 w-full pr-8" value="${muValue}" data-id="${item.id}">
                    <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-yellow-400 text-[11px] pointer-events-none font-medium select-none">%</span>
                </div>
            `;
        } else {
            muInput.value = muValue;
            muInput.dataset.id = item.id;
        }
        cellIndex++;

        cells[cellIndex].className = 'col-price font-bold text-yellow-500';
        cells[cellIndex++].textContent = (total * (muValue / 100)).toFixed(2);

    } else if (type === 'SAVE' || type === 'SELL_TT') {
        cells[cellIndex].className = 'col-unit text-gray-500';
        cells[cellIndex++].textContent = (item.value || 0).toFixed(2);

        cells[cellIndex].className = 'col-total font-mono text-cyan-400';
        cells[cellIndex++].textContent = (item.totalValue || 0).toFixed(2);

    } else {
        cells[cellIndex].className = 'col-total font-mono';
        cells[cellIndex++].textContent = (item.totalValue || 0).toFixed(2);

        if (type === 'CRAFT') {
            cells[cellIndex].className = 'col-bp text-orange-400';
            cells[cellIndex++].textContent = decision.meta.bp || 'N/A';
        }
    }

	const isUndecided = (type === 'UNDECIDED' || type === 'UNDECIDED_TABLE');
    
    if (!isUndecided) {
        // Action Button (only for SAVE, SELL_MU, SELL_TT, CRAFT, etc.)
        const btn = cells[cellIndex].querySelector('button');
        if (!btn) {
            cells[cellIndex].className = 'col-action';
            cells[cellIndex].innerHTML = 
                `<button data-action="revert" class="text-red-400 hover:text-red-300 font-bold uppercase">X</button>`;
        } else {
            btn.dataset.action = 'revert';
            btn.className = 'text-red-400 hover:text-red-300 font-bold uppercase';
            btn.textContent = 'X';
        }
        cellIndex++;   // ← Only move forward if we actually added the action column
    }
    // For UNDECIDED: Do NOTHING → no action column, no cellIndex++

    const itemType = typeof getItemType === 'function' ? getItemType(item) : 'Item';
    row.title = `Name: ${item.name}\nType: ${itemType}\nPath: ${fullPath}\nTotal: ${(item.totalValue || 0).toFixed(2)} PED`;
    row.dataset.itemId = item.id;
}
function updateFullInventoryRowContent(row, item) {
    if (!row || !item) return;

    const decisionType = item.decision?.type || 'UNDECIDED';
    const decisionLabel = decisionType === 'UNDECIDED' 
        ? 'Undecided' 
        : (decisionLabels[decisionType] || decisionType);

    // Ensure we always have exactly 7 cells
    while (row.cells.length > 5) row.deleteCell(-1);
    while (row.cells.length < 5) row.insertCell();

    const fullPath = getItemContainerPath(item, inventoryState.items);
    const displayLocation = showFullContainerPath 
        ? fullPath 
        : (item.location || 'N/A');

    // 0. Location
    row.cells[0].textContent = displayLocation.toUpperCase();
    row.cells[0].className = 'col-location font-bold text-gray-400 uppercase text-[10px] w-24';

    // 1. Name
    row.cells[1].textContent = item.name || 'N/A';
    row.cells[1].className = 'col-name';

    // 2. Quantity
    row.cells[2].textContent = (item.quantity || 0).toLocaleString(undefined, {maximumFractionDigits: 0});
    row.cells[2].className = 'col-qty';

    // 3. TT/Unit
    row.cells[3].textContent = (item.value || 0).toFixed(2);
    row.cells[3].className = 'col-unit text-gray-500';

    // 4. Total TT
    row.cells[4].textContent = (item.totalValue || 0).toFixed(2);
    row.cells[4].className = 'col-total font-mono text-cyan-400';

/*     // 5. Decision
    row.cells[5].textContent = decisionLabel;
    row.cells[5].className = 'col-decision italic';

    // 6. Action
    row.cells[6].innerHTML = `<button data-action="decide" class="text-cyan-400 hover:text-cyan-300 transition text-xs font-bold uppercase">Decide</button>`;
    row.cells[6].className = 'col-action'; */

    // Tooltip
    const itemType = typeof getItemType === 'function' ? getItemType(item) : (item.type || 'Item');
    row.title = `Name: ${item.name}\nType: ${itemType}\nPath: ${fullPath}\nTotal: ${(item.totalValue || 0).toFixed(2)} PED`;
    row.dataset.itemId = item.id;
}

function createCommunityMarketRow(item) {
	const row = document.createElement('tr');
    // Added 'text-xs' and other classes to match FullInventoryRow
    row.className = 'text-gray-300 hover:bg-gray-700/50 text-xs inventory-row info-nav-link';
    row.setAttribute('data-user-id', item.userId);
    row.style.height = `${VIRTUAL_ROW_HEIGHT}px`;
    row.style.position = 'absolute';
    row.style.width = '100%';
    row.style.display = 'flex'; // Ensure flex is set from the start

    const isWtb = item.type === 'wtb';
    const statusColor = isWtb ? '#48bb78' : '#ed8936';
    const updatedDate = new Date(item.updatedAt).toLocaleDateString();

    row.innerHTML = `
        <td class="col-type" style="color: ${statusColor}; font-weight: bold;">${isWtb ? 'WTB' : 'WTS'}</td>
        <td class="col-name"><strong>${item.name || 'Unknown'}</strong></td>
        <td class="col-qty">${(item.quantity || item.targetQty || 1).toLocaleString()}</td>
        <td class="col-mu" style="color: #ecc94b;">${item.mu || item.targetMu || 100}%</td>
        <td class="col-player" style="color: #4fd1c5;">${item.displayName}</td>
        <td class="col-date" style="color: #666;">${updatedDate}</td>
    `;
    return row;
}
// CENTRAL VIRTUAL SCROLL HANDLER
function handleVirtualScroll(tableKey) {
    let scrollContainerId, tbodyId;

    if (tableKey === 'FULL_LIST_TABLE') {
        scrollContainerId = 'fulllist-scroll-container';
        tbodyId = 'full-list-tbody';           // ← Force hyphen (correct)
    } else {
        const prefix = tableKey.toLowerCase().replace(/_table/g, '');
        scrollContainerId = prefix.replace(/_/g, '') + '-scroll-container';
        tbodyId = prefix.replace(/_/g, '-') + '-tbody';
    }

    const scrollContainer = document.getElementById(scrollContainerId);
    const tbody = document.getElementById(tbodyId);
    const itemsToRender = inventoryState.virtualizedData[tableKey] || [];

    if (!tbody || !scrollContainer) {
        if (inventoryDEBUG) console.warn(`VirtualScroll: Elements not found for ${tableKey}`, { scrollContainerId, tbodyId });
        return;
    }

    const scrollTop = scrollContainer.scrollTop;
    const startIndex = Math.max(0, Math.floor(scrollTop / VIRTUAL_ROW_HEIGHT));
    const endIndex = Math.min(itemsToRender.length, startIndex + VIRTUAL_BUFFER_SIZE);

    const existingRows = tbody.children;
    const type = tableKey === 'FULL_LIST_TABLE' ? 'FULL_LIST' : tableKey.replace('_TABLE', '');

    const updateFn = (tableKey === 'FULL_LIST_TABLE') 
        ? updateFullInventoryRowContent 
        : updateVirtualRowContent;

    // Width syncing
    const tableEl = scrollContainer.querySelector('table');
    const ths = tableEl ? tableEl.querySelectorAll('thead th') : [];
    const currentWidths = Array.from(ths).map(th => 
        th.style.width || getComputedStyle(th).width || '120px'
    );

    for (let i = 0; i < VIRTUAL_BUFFER_SIZE; i++) {
        const row = existingRows[i];
        const dataIndex = startIndex + i;

        if (row && dataIndex < itemsToRender.length) {
            const item = itemsToRender[dataIndex];

            updateFn(row, item, type);

            const cells = row.cells;
            for (let j = 0; j < cells.length; j++) {
                if (currentWidths[j]) {
                    cells[j].style.width = currentWidths[j];
                    cells[j].style.minWidth = currentWidths[j];
                }
            }

            row.style.transform = `translateY(${dataIndex * VIRTUAL_ROW_HEIGHT}px)`;
            row.style.display = 'flex';
            row.style.visibility = 'visible';
        } 
        else if (row) {
            row.style.display = 'none';
        }
    }
}

/* async function saveDecisions() {
    if (window.electronAPI) {
        // Save the decisions object
        await window.electronAPI.saveAppState('inventoryDecisions', inventoryState.decisions);
        // ADD THIS: Save the buying list array
        await window.electronAPI.saveAppState('inventoryBuyingList', inventoryState.buyingList);
    }
}
async function loadDecisions() {
    if (window.electronAPI) {
        // Load existing decisions
        const loadedDecisions = await window.electronAPI.loadAppState('inventoryDecisions');
        if (loadedDecisions) {
            inventoryState.decisions = loadedDecisions;
        }

        // ADD THIS: Load the buying list
        const loadedBuyingList = await window.electronAPI.loadAppState('inventoryBuyingList');
        if (loadedBuyingList) {
            inventoryState.buyingList = loadedBuyingList;
            renderBuyingList(); // Refresh the UI with the loaded data
        }

        rebuildDecisionQueue();
        updateSummary();
        
        if (typeof renderFullInventoryList === 'function') {
            renderFullInventoryList();
        }
        
        promptNextDecision();
    }
} */
// ================= WEB VERSION - SAVE & LOAD DECISIONS + BUYING LIST =================

async function saveDecisions() {
    try {
        // Save decisions (Save/Sell/Craft choices)
        localStorage.setItem('inventoryDecisions', JSON.stringify(inventoryState.decisions || {}));

        // Save buying list
        localStorage.setItem('inventoryBuyingList', JSON.stringify(inventoryState.buyingList || []));

        console.log("💾 Decisions & Buying List saved to localStorage");
    } catch (err) {
        console.error("Failed to save decisions/buying list:", err);
    }
}

async function loadDecisions() {
    try {
        // Load decisions
        const savedDecisions = localStorage.getItem('inventoryDecisions');
        if (savedDecisions) {
            inventoryState.decisions = JSON.parse(savedDecisions);
            console.log(`✅ Loaded ${Object.keys(inventoryState.decisions).length} decisions`);
        }

        // Load buying list
        const savedBuyingList = localStorage.getItem('inventoryBuyingList');
        if (savedBuyingList) {
            inventoryState.buyingList = JSON.parse(savedBuyingList);
            console.log(`✅ Loaded ${inventoryState.buyingList.length} buying items`);
        }

        // Refresh UI
        rebuildDecisionQueue();
        updateSummary();

        if (typeof renderFullInventoryList === 'function') {
            renderFullInventoryList();
        }
        if (typeof renderBuyingList === 'function') {
            renderBuyingList();
        }

        promptNextDecision();

    } catch (err) {
        console.error("Failed to load decisions/buying list:", err);
        // Fallback to empty state
        inventoryState.decisions = {};
        inventoryState.buyingList = [];
    }
}
function rebuildDecisionQueue() {
    inventoryState.undecidedQueue = Object.values(inventoryState.items)
        .filter(item => !inventoryState.decisions[String(item.id)])
        .map(item => item.id);

    // Optional: Sort by value so the Decision Card shows most valuable items first
    inventoryState.undecidedQueue.sort((a, b) => {
        const itemA = inventoryState.items[a];
        const itemB = inventoryState.items[b];
        return (itemB?.totalValue || 0) - (itemA?.totalValue || 0);
    });
}
// ==================== BULK SKIP FUNCTIONS (Pro Feature) ====================
function updateBulkBarUI() {
    const countLabel = document.getElementById('selected-count');
    if (!bulkbar) return;
    const selectedCount = window.selectedItems.size;
    if (selectedCount > 0) {
        bulkbar.classList.remove('hidden');
        bulkbar.classList.add('flex');
        countLabel.textContent = `${selectedCount} Items Selected`;
    } else {
        bulkbar.classList.add('hidden');
        bulkbar.classList.remove('flex');
    }
    if (checkAllundecided) {
        const totalUndecided = (inventoryState.virtualizedData['UNDECIDED_TABLE'] || []).length;
        checkAllundecided.checked = totalUndecided > 0 && selectedCount === totalUndecided;
    }
}
// The core processing function
async function applyBulkAction(actionType) {
    if (!window.selectedItems || window.selectedItems.size === 0) return; 
    const idsToProcess = Array.from(window.selectedItems);
    if (!confirm(`Apply ${actionType.toUpperCase()} to ${idsToProcess.length} items?`)) return;
    // 1. Batch State Updates
    idsToProcess.forEach(itemId => {
        // Use String(itemId) to ensure consistency with loadDecisions
        inventoryState.decisions[String(itemId)] = {
            type: actionType.toUpperCase(),
            timestamp: Date.now(),
            meta: { bulk: true }
        };
    });
    // 2. Persist immediately after the loop
    await saveDecisions(); 
    // 3. Filter Queue in one go
    const selectedSet = new Set(idsToProcess.map(id => String(id)));
    inventoryState.undecidedQueue = inventoryState.undecidedQueue.filter(id => !selectedSet.has(String(id)));
    // 3. Mark all tabs as needing refresh
    inventoryState.needsFullRefresh = true;
    inventoryState.needsUndecidedRefresh = true;
    inventoryState.needsMarketRefresh = true;
    // 4. Cleanup UI
    window.selectedItems.clear();
    const checkAll = document.getElementById('check-all-undecided');
    if (checkAll) checkAll.checked = false;

    // 5. Final UI Sync (Only the visible one)
    updateBulkBarUI();
    refreshUndecidedUI(); // Assuming user is on the Undecided tab during bulk action
    updateSummary();
}
function resetDecisionUI() {
    const decisionInputs = document.getElementById('decision-inputs');
    const decisionButtons = document.getElementById('decision-buttons');
    if (decisionInputs) decisionInputs.classList.add('hidden'); 
    if (decisionButtons) decisionButtons.classList.remove('hidden'); 
}
function updateDecision(itemId, type, meta = {}) {
    if (!inventoryState.items[itemId]) return;
    const strId = String(itemId);
    const previousDecision = inventoryState.decisions[strId] ? { ...inventoryState.decisions[strId] } : null;  

    // 1. Log to History
    inventoryState.actionHistory.push({ 
        type: 'decision', 
        itemId: itemId, 
        oldDecision: previousDecision 
    });

    // 2. Update State
    if (type === 'UNDECIDED') {
        delete inventoryState.decisions[strId];
        if (!inventoryState.undecidedQueue.includes(itemId)) {
             inventoryState.undecidedQueue.push(itemId);
        }
    } else {
        inventoryState.decisions[strId] = { type, meta, timestamp: Date.now() };
        inventoryState.undecidedQueue = inventoryState.undecidedQueue.filter(id => String(id) !== strId);
    }

    // 3. Persist
    saveDecisions();

    // 4. Update UI 
    updateSummary(); 
    renderFullInventoryList(); 
    
    // --- FIX: Refresh the Market Category Tables (Save/Sell/Craft) ---
    if (typeof renderInventory === 'function') {
        // This force-refreshes the data for all 4 category tables
        renderInventory(['SAVE', 'SELL_MU', 'SELL_TT', 'CRAFT']);
    }

    // Refresh Undecided Tab
    if (typeof renderFilteredUndecided === 'function') {
        renderFilteredUndecided();
    }

    promptNextDecision(); 
}
function handleDecisionAction(action) {
    const itemId = inventoryState.currentDecisionId;
    if (!itemId) return;

    const els = decisionCardElements;

    // 1. Initial UI Reset: Hide buttons and inputs while processing
    if (els.btns) els.btns.classList.add('hidden');
    if (els.inputs) els.inputs.classList.add('hidden');
    if (els.confirmBtn) els.confirmBtn.classList.add('hidden');

    // 2. Simple Actions (Instant)
    if (action === 'save') {
        updateDecision(itemId, 'SAVE');
        promptNextDecision();
    } 
    else if (action === 'sell_tt') {
        updateDecision(itemId, 'SELL_TT');
        promptNextDecision();
    } 
    else if (action === 'skip') {
        // Move to back of queue and move on
        inventoryState.undecidedQueue.push(itemId);
        inventoryState.currentDecisionId = null; 
        promptNextDecision();
    }
    // 3. Complex Actions (Require secondary input)
    else if (action === 'sell_mu' || action === 'craft') {
        inventoryState.currentActionType = action; 

        // Set up the input field based on the action
        if (els.inputLabel) {
            els.inputLabel.textContent = action === 'sell_mu' 
                ? 'Enter MU% (>= 100):' 
                : 'Enter Blueprint Name:';
        }
        
        if (els.inputVal) {
            els.inputVal.value = ''; // Reset the box
            // Optional: focus the input for better UX
            setTimeout(() => els.inputVal.focus(), 10); 
        }

        // Show the input area and confirm button
        if (els.inputs) els.inputs.classList.remove('hidden');
        if (els.confirmBtn) els.confirmBtn.classList.remove('hidden');
    }
}
function handleDecisionConfirm() {
    const itemId = inventoryState.currentDecisionId;
    const action = inventoryState.currentActionType;
    const els = decisionCardElements; // Use our global cache

    // Get the value from the cached input element
    const inputVal = els.inputVal ? els.inputVal.value.trim() : null;

    if (!itemId || !action) return; 
    
    let isHandled = false;

    if (action === 'sell_mu') {
        let mu = parseFloat(inputVal);
        if (isNaN(mu) || mu < 100) {
            alert("Invalid MU%: Must be >= 100.");
            if (els.inputVal) els.inputVal.focus(); // Help the user fix it
            return;
        }
        updateDecision(itemId, 'SELL_MU', { mu: mu.toFixed(1) });
        isHandled = true;
    } 
    else if (action === 'craft') {
        if (!inputVal) {
            alert("Blueprint Name required.");
            if (els.inputVal) els.inputVal.focus();
            return;
        }
        updateDecision(itemId, 'CRAFT', { bp: inputVal });
        isHandled = true;
    }

    if (isHandled) {
        inventoryState.currentActionType = null;
        
        // Use cached elements to hide the input UI
        if (els.inputs) els.inputs.classList.add('hidden');
        if (els.btns) els.btns.classList.add('hidden');
        if (els.confirmBtn) els.confirmBtn.classList.add('hidden');

        promptNextDecision(); 
    }
}
function handleDecisionCancel() {
	const decisionInputs = document.getElementById('decision-inputs');
    inventoryState.currentActionType = null;
    if (decisionInputs) decisionInputs.classList.add('hidden');
    if (decisionConfirmBtn) decisionConfirmBtn.classList.add('hidden');
    
    if (decisionButtons) decisionButtons.classList.remove('hidden');
}
function updateDecisionQueueCard() {
    promptNextDecision(); 
}
function handleTableAction(itemId, action) {
    if (action === 'revert') {
        updateDecision(itemId, 'UNDECIDED');
    } 
    else if (action === 'decide') {
        inventoryState.undecidedQueue = inventoryState.undecidedQueue.filter(id => id !== itemId);
        inventoryState.undecidedQueue.unshift(itemId);
        
        inventoryState.currentDecisionId = null;
        promptNextDecision();
    } 
    else if (action === 'remove-buy') {
        inventoryState.buyingList = inventoryState.buyingList.filter(item => item.id !== itemId);
        
        const row = document.querySelector(`tr[data-item-id="${itemId}"]`);
        if (row) row.remove();
        
        saveDecisions();
        renderBuyingList();        // This will now use the 8-column version
        return;
    }
}


// 🟢 MODIFIED: renderBuyingList (Uses DocumentFragment batching)
function renderBuyingList() {
    let items = inventoryState.buyingList ? [...inventoryState.buyingList] : [];

    // Optional: Fill missing ttValue on the fly (helps with old saved data)
    items.forEach(item => {
        if (!item.ttValue || item.ttValue === 0) {
            item.ttValue = getItemTTValueByName(item.name);
        }
    });

    // Sort using the BUY_TABLE config
    items = sortItems(items, 'BUY_TABLE');

    // Render with the virtual table system
    renderVirtualTable('BUY_TABLE', items, createRowElement);
	updateTableCountHeader('buy-table-count', items);
}
function addBuyingItem() {
    const name = inputs.buyNameInput.value.trim();
    const targetQty = parseFloat(inputs.buyqtyInput.value);
    const targetMu = parseFloat(inputs.buymuInput.value);
    
    // Get the selected planet
    const targetPlanet = document.getElementById('buy-planet') 
                         ? document.getElementById('buy-planet').value 
                         : 'ALL';

    if (!name || isNaN(targetQty) || targetQty <= 0 || isNaN(targetMu) || targetMu <= 0) {
        alert("Please enter a valid Item Name, Quantity (>0), and Target MU% (>0).");
        return;
    }

    const ttValue = getItemTTValueByName(name);

    const newItem = {
        name: name,
        targetQty: targetQty,
        targetMu: targetMu,
        ttValue: parseFloat(ttValue.toFixed(4)),
        planet: targetPlanet,           // ← Saved planet
        id: `buy-${Date.now()}`
    };

    inventoryState.buyingList.push(newItem);
    saveDecisions();

    // Clear inputs
    inputs.buyNameInput.value = '';
    inputs.buyqtyInput.value = '';
    inputs.buymuInput.value = '';

    // Reset planet dropdown to ALL after adding
    const planetSelect = document.getElementById('buy-planet');
    if (planetSelect) planetSelect.value = 'ALL';

    renderBuyingList();
}

/**
 * CENTRAL VIRTUAL TABLE RENDERER
 * Handles initial DOM construction, height calculations, 
 * and width synchronization for virtualized tables.
 */
// Cache these once on load so promptNextDecision is lightning fast
async function promptNextDecision() {    
    let nextId = null; 
    
    // 1. Find the next item that hasn't been decided yet
    while (inventoryState.undecidedQueue.length > 0) {
        const shiftedId = inventoryState.undecidedQueue.shift(); 
        const itemExists = inventoryState.items[shiftedId];
        const isUndecided = !inventoryState.decisions[String(shiftedId)];
        
        if (itemExists && isUndecided) {
            nextId = shiftedId;
            break; 
        }
    }

    const nextItem = nextId ? inventoryState.items[nextId] : null;
    const els = decisionCardElements; 

    // Safety check: ensure the card exists in the current view
    if (!els.card) return;

    if (nextItem) {
        inventoryState.currentDecisionId = nextId;
        
        // 2. Determine Type via the Lookup Map (The Source of Truth)
        const rawType = typeof getItemType === 'function' ? getItemType(nextItem) : 'Unknown';
        const subType = nextItem.SubType || nextItem.Properties?.SubType || 'N/A';

        // 3. Update Basic UI Fields
        if (els.name) els.name.textContent = nextItem.name || 'N/A';
        if (els.subtype) els.subtype.textContent = subType;
        if (els.container) els.container.textContent = nextItem.location || 'N/A';
        if (els.qty) els.qty.textContent = (nextItem.quantity || 0).toLocaleString();
        if (els.val) els.val.textContent = (nextItem.totalValue || 0).toFixed(2) + ' PED';

        // 4. Handle Inline Type Correction Logic
        const typeSlot = document.getElementById('type-display-slot');
        if (typeSlot) {
            if (rawType === 'Unknown' || !rawType || rawType === 'N/A') {
                typeSlot.innerHTML = `
                    <div class="flex items-center space-x-1">
                        <select id="inline-type-select" class="bg-gray-800 text-pink-400 text-[11px] rounded px-1 border border-pink-900 focus:outline-none h-5">
                            <option value="">Choose...</option>
                            ${[...window.categoryNames].sort().map(cat => `<option value="${cat}">${cat}</option>`).join('')}
                        </select>
                        <button id="btn-inline-type-confirm" class="text-green-500 hover:text-green-400 transition-colors">
                            <i class="fas fa-check-circle"></i>
                        </button>
                    </div>
                `;

                document.getElementById('btn-inline-type-confirm').onclick = async () => {
                    const newType = document.getElementById('inline-type-select').value;
                    if (newType) {
                        const cleanName = sanitizeItemName(nextItem.name);

                        // A. Update the Global Map (Immediate effect for all items of this name)
                        if (window.itemLookupMap) window.itemLookupMap.set(cleanName, newType);
                        
                        // B. Update the current item object
                        inventoryState.items[nextId].category = newType;
                        
                        // C. Update UI Slot
                        typeSlot.innerHTML = `<span id="decision-item-type" class="text-pink-400 font-bold">${newType}</span>`;

                        // D. Persistence: Save to a dedicated corrections store
                        if (window.electronAPI) {
                            const corrections = await window.electronAPI.loadAppState('itemTypeCorrections') || {};
                            corrections[cleanName] = newType;
                            await window.electronAPI.saveAppState('itemTypeCorrections', corrections);
                        }

                        // E. Sync other UI components
                        renderFullInventoryList();
                        updateSummary();
                    }
                };
            } else {
                typeSlot.innerHTML = `<span id="decision-item-type" class="text-gray-400">${rawType}</span>`;
            }
        }

        // 5. Reset UI State
        els.details?.classList.remove('hidden');
        els.inputs?.classList.add('hidden');
        els.btns?.classList.remove('hidden');
        els.empty?.classList.add('hidden');
        els.card.classList.remove('hidden');

    } else {
        inventoryState.currentDecisionId = null;
        els.card.classList.add('hidden');
        els.empty?.classList.remove('hidden');
        els.details?.classList.add('hidden');
        els.btns?.classList.add('hidden');  
    }

    updateSummary();
}
function undoLastAction() {
    const action = inventoryState.actionHistory.pop();
    if (!action) return;

    if (action.type === 'decision' && action.itemId) {
        const itemId = action.itemId;
        const oldDecision = action.oldDecision;
        
        const oldType = oldDecision?.type || 'UNDECIDED';
        const currentType = inventoryState.decisions[itemId]?.type || 'UNDECIDED';
        
        // 1. Revert the decision state
        if (oldDecision) {
            inventoryState.decisions[itemId] = { type: oldType, meta: oldDecision.meta };
            inventoryState.undecidedQueue = inventoryState.undecidedQueue.filter(id => id !== itemId);
        } else {
            delete inventoryState.decisions[itemId];
            if (!inventoryState.undecidedQueue.includes(itemId)) {
                inventoryState.undecidedQueue.unshift(itemId);
            }
        }
        
        // 2. Save the reverted state
        saveDecisions();

        // 3. Re-render affected lists (fast due to virtualization)
        if (['SAVE', 'SELL_MU', 'SELL_TT', 'CRAFT', 'UNDECIDED'].includes(currentType)) {
             renderTable(currentType, getTbodyId(currentType));
        }
        if (['SAVE', 'SELL_MU', 'SELL_TT', 'CRAFT', 'UNDECIDED'].includes(oldType)) {
             renderTable(oldType, getTbodyId(oldType));
        }
        renderFullInventoryList(); 
        
        // 4. Update UI
        updateSummary(); 
        promptNextDecision(); 
    }
}

// Helper to keep the refresh logic DRY (Don't Repeat Yourself)
function refreshUndecidedUI() {
    renderFilteredUndecided();  
    updateSummary();
    inventoryState.needsUndecidedRefresh = false;
    // Check if we need to show the next decision card
    if (typeof promptNextDecision === "function") {
        promptNextDecision();
    }
}

// ==================== FILTERED UNDECIDED RENDERING ====================
function renderFullInventoryList() {
    const sort = inventoryState.sortConfig[fulltableKey];
    
    let items = Object.values(inventoryState.items).map(item => {
        const type = typeof getItemType === 'function' ? getItemType(item) : (item.category || 'Unknown');
        return {
            ...item,
            _typeLower: type.toLowerCase(),
            decision: inventoryState.decisions[String(item.id)] || { type: 'UNDECIDED', meta: {} }
        };
    });

    // Apply filters
    const normSearch = (inputs.fullSearch?.value || '').trim().toLowerCase();
    const planetFilter = (selects.planet?.value || 'ALL').toUpperCase();
    const categoryFilter = (selects.cat?.value || 'ALL').toLowerCase();

    items = items.filter(item => {
        const itemLoc = (item.location || 'UNKNOWN').toUpperCase();
        const itemTypeLower = item._typeLower;

        const matchesSearch = !normSearch || 
            item.name.toLowerCase().includes(normSearch) || 
            itemTypeLower.includes(normSearch);
        
        const matchesPlanet = (planetFilter === 'ALL') || itemLoc.includes(planetFilter);
        const matchesCategory = (categoryFilter === 'all') || itemTypeLower.includes(categoryFilter);

        return matchesSearch && matchesPlanet && matchesCategory;
    });

    // Sort
    if (sort && items.length > 0) {
        items = sortItems(items, fulltableKey);
    }

    //updateTableCountHeader('full-list-count', `${items.length} / ${Object.keys(inventoryState.items).length}`);
	const totalRaw = Object.keys(inventoryState.items).length;
	const countDisplay = `${items.length} / ${totalRaw}`;

	// Pass 'items' (the array) so it can calculate the PED sum
	updateTableCountHeader('full-list-count', items, countDisplay);
	//
	//
    // Render with virtual table
    renderVirtualTable('FULL_LIST_TABLE', items, createFullInventoryRow);
}
function renderFilteredUndecided() {
    // 1. Get initial Undecided set
    let items = Object.values(inventoryState.items).filter(item => {
        const decision = inventoryState.decisions[String(item.id)];
        return !decision || decision.type === 'UNDECIDED';
    });

    // 2. Get filter values from cached objects
    const normSearch = (inputs.uSearch?.value || '').trim().toLowerCase();
    const planetFilter = (selects.uPlanet?.value || 'ALL').toUpperCase();
    const categoryFilter = (selects.uCat?.value || 'ALL').toLowerCase();

    // 3. Filter
    items = items.filter(item => {
        const itemType = typeof getItemType === 'function' ? getItemType(item) : 'Unknown';
        const itemTypeLower = itemType.toLowerCase();
        const itemLoc = (item.location || 'UNKNOWN').toUpperCase();

        const matchesSearch = !normSearch || 
            (item.name || '').toLowerCase().includes(normSearch) || 
            itemTypeLower.includes(normSearch);

        const matchesPlanet = (planetFilter === 'ALL') || itemLoc.includes(planetFilter);

        const matchesCategory = (categoryFilter === 'all') || 
                               itemTypeLower.includes(categoryFilter);

        return matchesSearch && matchesPlanet && matchesCategory;
    });

    // 4. Sort (Using Undecided Table config)
    const sort = inventoryState.sortConfig['UNDECIDED_TABLE'];
    if (sort && items.length > 0) {
        items.sort((a, b) => {
            const aVal = getItemSortValue(a, sort.column);
            const bVal = getItemSortValue(b, sort.column);
            return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
        });
    }

    renderVirtualTable('UNDECIDED_TABLE', items, createRowElement, updateVirtualRowContent);

    // 🎯 THE FIX: Define the variable before using it
    const countDisplay = `${items.length}`; 

    // Now pass the defined variable to the header update function
    updateTableCountHeader('undecided-table-count', items, countDisplay);
}
/**
 * Optimized Sort-Only Renderer for the Full Inventory Table
 * Use this for header clicks to avoid re-filtering 3,000 items.
 */
function renderCommunityMarketTable(marketItems) {
    // 1. Get Filters
    const searchTerm = (document.getElementById('market-search')?.value || '').toLowerCase();
    const typeFilter = currentMarketFilter; // 'wtb', 'wts', or 'both'

    // 2. Filter the raw Firebase data
    let filtered = marketItems.filter(item => {
        const matchesType = (typeFilter === 'both') || (item.type === typeFilter);
        const matchesSearch = !searchTerm || 
            (item.name || '').toLowerCase().includes(searchTerm) || 
            (item.displayName || '').toLowerCase().includes(searchTerm);
        return matchesType && matchesSearch;
    });

    // 3. Sort (Optional: use your existing sort logic if you have a market sort state)
    // For now, we'll sort by date descending
    filtered.sort((a, b) => b.updatedAt - a.updatedAt);

    // 4. Update Header Count
    updateTableCountHeader('market-table-count', filtered);

    // 5. Hand off to the Virtual Engine
    // Note: We use a custom row creator because the Market UI is unique
    renderVirtualTable('COMMUNITY_MARKET_TABLE', filtered, createCommunityMarketRow);
}
function renderFullTable() {
    // 1. Prepare Data
    let items = Object.values(inventoryState.items).map(item => {
        const type = typeof getItemType === 'function' ? getItemType(item) : (item.category || 'Unknown');
        return {
            ...item,
            _typeLower: type.toLowerCase(), // Pre-calculate for speed
            decision: inventoryState.decisions[String(item.id)] || { type: 'UNDECIDED', meta: {} }
        };
    });
    const searchTerm = inputs.fullSearch?.value.toLowerCase() || '';
    const planetFilter = (selects.planet?.value || 'ALL').toUpperCase();
    const categoryFilter = (selects.cat?.value || 'ALL').toLowerCase();
    items = items.filter(item => {
        // Search
        const matchesSearch = !searchTerm || 
            item.name.toLowerCase().includes(searchTerm) || 
            item._typeLower.includes(searchTerm);
        const itemLoc = (item.location || 'UNKNOWN').toUpperCase();
        const matchesPlanet = (planetFilter === 'ALL') || itemLoc.includes(planetFilter);

        // Category (Using .includes() instead of .startsWith() to catch sub-categories)
        const matchesCategory = (categoryFilter === 'all') || 
                               item._typeLower.includes(categoryFilter);

        return matchesSearch && matchesPlanet && matchesCategory;
    });
    const sort = inventoryState.sortConfig[fulltableKey];
    if (sort && items.length > 0) {
        const isNumeric = ['totalValue', 'value', 'quantity'].includes(sort.column);
        items.sort((a, b) => {
            // Use pre-calculated sort values if possible, otherwise call helper
            const aVal = getItemSortValue(a, sort.column);
            const bVal = getItemSortValue(b, sort.column);

            if (isNumeric) {
                return sort.direction === 'asc' ? (aVal - bVal) : (bVal - aVal);
            }
            return sort.direction === 'asc' 
                ? String(aVal).localeCompare(String(bVal)) 
                : String(bVal).localeCompare(String(aVal));
        });
    }
    // 5. Update UI
    updateSortIcons(fullTbodyId, sort);
    // Update count header using the total from inventoryState
	const totalRaw = Object.keys(inventoryState.items).length;
	const countDisplay = `${items.length} / ${totalRaw}`;

	// Pass 'items' (the array) so it can calculate the PED sum
	updateTableCountHeader('full-list-count', items, countDisplay);
    renderVirtualTable(fulltableKey, items, createFullInventoryRow, updateFullInventoryRowContent);
}
function renderTable(type, tbodyId) {
    // 1. Standardize the key (e.g., 'SAVE' becomes 'SAVE_TABLE')
    const tableKey = type.endsWith('_TABLE') ? type : `${type}_TABLE`;
    let itemsToRender = [];
    // 2. Pull the correct items
    if (type === 'UNDECIDED') {
        itemsToRender = inventoryState.undecidedQueue
            .map(id => inventoryState.items[id])
            .filter(item => item);
    } else { 
        for (const itemId in inventoryState.decisions) {
            if (inventoryState.decisions[itemId].type === type) {
                const item = inventoryState.items[itemId];
                if (item) {
                    itemsToRender.push({ 
                        ...item, 
                        decision: inventoryState.decisions[itemId] 
                    });
                }
            }
        }
    }
    // 3. 🟢 Apply Market Filters (Planet/Category)
    const planetFilter = inventoryState.currentMarketPlanetFilter || 'ALL';
    const catFilter = inventoryState.currentMarketCategoryFilter || 'ALL';
    if (planetFilter !== 'ALL' || catFilter !== 'ALL') {
        itemsToRender = itemsToRender.filter(item => {
            const matchPlanet = planetFilter === 'ALL' || 
                               (item.location || '').toUpperCase().includes(planetFilter);
            const matchCat = catFilter === 'ALL' || 
                             (item.category || '').toUpperCase() === catFilter;
            return matchPlanet && matchCat;
        });
    }
    // 4. Apply Sorting
    const sort = inventoryState.sortConfig[tableKey];
    if (sort && itemsToRender.length > 0) {
        itemsToRender.sort((a, b) => {
            const aValRaw = getItemSortValue(a, sort.column, tableKey);
            const bValRaw = getItemSortValue(b, sort.column, tableKey);

            // Determine if numeric or string
            const isNumeric = ['totalValue', 'value', 'quantity', 'mu'].includes(sort.column);
            
            const aVal = isNumeric ? (parseFloat(aValRaw) || 0) : String(aValRaw || '').toLowerCase();
            const bVal = isNumeric ? (parseFloat(bValRaw) || 0) : String(bValRaw || '').toLowerCase();

            if (sort.direction === 'asc') return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        });
    }
    updateSortIcons(tbodyId, sort);
    renderVirtualTable(tableKey, itemsToRender, createRowElement, updateVirtualRowContent);
/*     const countHeaderId = tableKey.toLowerCase().replace('_table', '-table-count');
    updateTableCountHeader(countHeaderId, itemsToRender.length); */
	// At the bottom of renderTable():
	const countHeaderId = tableKey.toLowerCase().replace('_table', '-table-count');

	// Change from .length to the actual array 'itemsToRender'
	updateTableCountHeader(countHeaderId, itemsToRender);
}

/* function renderVirtualTable(tableKey, itemsToRender, rowCreatorFunction) {
    // Special handling for Full List to ensure consistent IDs
    let tbodyId, scrollContainerId;
    if (tableKey === 'FULL_LIST_TABLE') {
        tbodyId = 'full-list-tbody';                    // ← Force correct hyphen ID
        scrollContainerId = 'fulllist-scroll-container';
    } else {
        const prefix = tableKey.toLowerCase().replace(/_table/g, '');
        tbodyId = prefix.replace(/_/g, '-') + '-tbody';
        scrollContainerId = prefix.replace(/_/g, '') + '-scroll-container';
    }
    const tbody = document.getElementById(tbodyId);
    const scrollContainer = document.getElementById(scrollContainerId);
    if (!tbody || !scrollContainer) {
        console.warn(`renderVirtualTable: Missing elements for ${tableKey}`, { tbodyId, scrollContainerId });
        return;
    }
    // Sync header widths for the initial creation of buffer rows
    const tableEl = scrollContainer.querySelector('table');
    const ths = tableEl ? tableEl.querySelectorAll('thead th') : [];
    const currentWidths = Array.from(ths).map(th => th.style.width || getComputedStyle(th).width);
    inventoryState.virtualizedData[tableKey] = itemsToRender;
    tbody.style.height = `${itemsToRender.length * VIRTUAL_ROW_HEIGHT}px`;
    tbody.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const initialRenderCount = Math.min(itemsToRender.length, VIRTUAL_BUFFER_SIZE);
    for (let i = 0; i < initialRenderCount; i++) {
        const item = itemsToRender[i];
        const row = rowCreatorFunction(item, tableKey.replace('_TABLE', ''));
        // Set widths on initial cells to match headers
        const cells = row.querySelectorAll('td');
        cells.forEach((td, idx) => {
            if (currentWidths[idx]) {
                td.style.width = currentWidths[idx];
                td.style.minWidth = currentWidths[idx];
            }
        });
        row.style.transform = `translateY(${i * VIRTUAL_ROW_HEIGHT}px)`;
        fragment.appendChild(row);
    }
    tbody.appendChild(fragment);
    handleVirtualScroll(tableKey);
    scrollContainer.onscroll = () => handleVirtualScroll(tableKey);
}

 */
function renderVirtualTable(tableKey, itemsToRender, rowCreatorFunction) {
    // 1. Resolve IDs based on the tableKey
    let tbodyId, scrollContainerId;

    if (tableKey === 'FULL_LIST_TABLE') {
        tbodyId = 'full-list-tbody';
        scrollContainerId = 'fulllist-scroll-container';
    } 
    else if (tableKey === 'COMMUNITY_MARKET_TABLE') {
        // Explicit IDs for the community market tab
        tbodyId = 'market-tbody';
        scrollContainerId = 'market-scroll-container';
    } 
    else {
        // Default logic for DECISION tables (e.g., KEEP_TABLE, SELL_TABLE)
        const prefix = tableKey.toLowerCase().replace(/_table/g, '');
        tbodyId = prefix.replace(/_/g, '-') + '-tbody';
        scrollContainerId = prefix.replace(/_/g, '') + '-scroll-container';
    }

    const tbody = document.getElementById(tbodyId);
    const scrollContainer = document.getElementById(scrollContainerId);

    if (!tbody || !scrollContainer) {
        console.warn(`renderVirtualTable: Missing elements for ${tableKey}`, { tbodyId, scrollContainerId });
        return;
    }

    // 2. Sync header widths for the initial creation of buffer rows
    // This ensures the td matches the th before the first scroll event
    const tableEl = scrollContainer.querySelector('table');
    const ths = tableEl ? tableEl.querySelectorAll('thead th') : [];
    const currentWidths = Array.from(ths).map(th => th.style.width || getComputedStyle(th).width);

    // 3. Update State and Container Height
    inventoryState.virtualizedData[tableKey] = itemsToRender;
    tbody.style.height = `${itemsToRender.length * VIRTUAL_ROW_HEIGHT}px`;
    
    // Clear and build initial fragment
    tbody.innerHTML = '';
    const fragment = document.createDocumentFragment();
    const initialRenderCount = Math.min(itemsToRender.length, VIRTUAL_BUFFER_SIZE);

    // 4. Initial Render Pass
    for (let i = 0; i < initialRenderCount; i++) {
        const item = itemsToRender[i];
        // Pass the item and a sanitized key to the row creator
        const row = rowCreatorFunction(item, tableKey.replace('_TABLE', ''));
        
        // Set widths on initial cells to match headers (Fixes the alignment issue)
        const cells = row.querySelectorAll('td');
        cells.forEach((td, idx) => {
            if (currentWidths[idx]) {
                td.style.width = currentWidths[idx];
                td.style.minWidth = currentWidths[idx];
            }
        });

        row.style.transform = `translateY(${i * VIRTUAL_ROW_HEIGHT}px)`;
        fragment.appendChild(row);
    }

    tbody.appendChild(fragment);

    // 5. Attach Scroll Logic
    handleVirtualScroll(tableKey);
    scrollContainer.onscroll = () => handleVirtualScroll(tableKey);
}



/* 
function renderDetailedLocationTable(tbodyId, itemsArray) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const tableKey = getTableKeyFromTbodyId(tbodyId);
    
    // 1. Ensure a default sort exists if one isn't set
    if (!inventoryState.sortConfig[tableKey]) { 
        inventoryState.sortConfig[tableKey] = { 
            column: 'totalValue', // Use 'totalValue' to match getItemSortValue logic
            direction: 'desc' 
        }; 
    }

    // 2. 🎯 THE MAJOR FIX: Use the global sortItems function 
    // This uses our regex-cleaning and parseFloat logic!
    const sortedItems = sortItems([...itemsArray], tableKey); 

    // 3. Clear and build the fragment
    tbody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    sortedItems.forEach(item => {
        const row = document.createElement('tr');
        row.className = 'text-xs hover:bg-gray-700 inventory-row';
        
        // We use || 0 to prevent errors if a property is missing
        const qty = parseFloat(String(item.quantity || 0).replace(/,/g, ''));
        const val = parseFloat(String(item.totalValuePed || item.totalValue || 0).replace(/,/g, ''));

        row.innerHTML = `
            <td class="col-name">${item.name || 'Unknown'}</td>
            <td class="col-qty">${qty.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
            <td class="col-total">${val.toFixed(2)}</td>
            <td class="col-location">${item.location || 'N/A'}</td>
        `;
        fragment.appendChild(row);
    });

    tbody.appendChild(fragment);
    
    // Update the header count
    const headerId = tbodyId.replace('-tbody', '-table-count');
    updateTableCountHeader(headerId, itemsArray);
}
 */

function renderDetailedLocationTable(tbodyId, itemsArray) {
    const tbody = document.getElementById(tbodyId);
    if (!tbody) return;

    const tableKey = getTableKeyFromTbodyId(tbodyId);
    
    // 1. Ensure a default sort
    if (!inventoryState.sortConfig[tableKey]) { 
        inventoryState.sortConfig[tableKey] = { 
            column: 'totalValue', 
            direction: 'desc' 
        }; 
    }

    // 2. Sort the data
    const sortedItems = sortItems([...itemsArray], tableKey); 

    // 3. Clear and build
    tbody.innerHTML = '';
    const fragment = document.createDocumentFragment();

    sortedItems.forEach(item => {
        const row = document.createElement('tr');
        // Standardize classes: 'display-flex' ensures it doesn't squish
        row.className = 'text-xs hover:bg-gray-700 inventory-row';
        row.style.display = 'flex'; 
        row.style.width = '100%';
        
        const qty = parseFloat(String(item.quantity || 0).replace(/,/g, ''));
        const val = parseFloat(String(item.totalValuePed || item.totalValue || 0).replace(/,/g, ''));

        // Use the same column classes as your other tables so the CSS widths apply
        row.innerHTML = `
            <td class="col-name" style="flex: 1;">${item.name || 'Unknown'}</td>
            <td class="col-qty" style="width: 80px; justify-content: flex-end;">${qty.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
            <td class="col-total" style="width: 100px; justify-content: flex-end; font-family: monospace;">${val.toFixed(2)}</td>
        `;
        fragment.appendChild(row);
    });

    tbody.appendChild(fragment);
    
    // Update the header count
    const headerId = tbodyId.replace('-tbody', '-table-count');
    updateTableCountHeader(headerId, itemsArray);
}

function initTableResizer() {
    // Consolidated selector: targets all headers with a col- class across all tabs
    const tableHeaders = document.querySelectorAll('th[class*="col-"]');

    tableHeaders.forEach(th => {
        let isResizing = false;
        let startX, startWidth, colClass;

        th.addEventListener('mousedown', e => {
            // Check for handle on right edge
            if (e.offsetX < th.offsetWidth - 12) return; 

            colClass = Array.from(th.classList).find(c => c.startsWith('col-'));
            if (!colClass) return;

            isResizing = true;
            startX = e.pageX;
            startWidth = th.offsetWidth;

            th.classList.add('is-resizing');
            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
        });

        const onMouseMove = e => {
            if (!isResizing) return;

            const delta = e.pageX - startX;
            let newWidth = startWidth + delta;

            // === ENFORCE MINIMUM WIDTHS ===
            if (colClass === 'col-mu') {
                newWidth = Math.max(newWidth, 110);
            } else if (colClass === 'col-name') {
                newWidth = Math.max(newWidth, 150);
            } else if (colClass === 'col-player') {
                newWidth = Math.max(newWidth, 140); // Standardize for Usernames
            } else if (colClass === 'col-tx-total' || colClass === 'col-location') {
                newWidth = Math.max(newWidth, 100);
            } else {
                newWidth = Math.max(newWidth, 60);
            }

            // Update the CSS variable globally
            document.documentElement.style.setProperty(`--${colClass}-width`, `${newWidth}px`);
        };

        const stopResize = () => {
            if (!isResizing) return;
            isResizing = false;

            th.classList.remove('is-resizing');
            document.body.style.userSelect = '';
            document.body.style.cursor = '';

            // NOTE: We removed heavy re-renders here because CSS variables 
            // handle the visual stretching instantly.
            console.log(`Column ${colClass} set to ${th.offsetWidth}px`);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', stopResize);
    });
}

/**
 * Helper to redraw the correct virtual table after a column resize
 */
/**
 * Helper to redraw the correct components after a column resize
 * Ensures all visible tables snap to the new CSS variable widths
 */
/* function handleResizeRedraw() {
    const mainTab = document.getElementById('InventoryTabA'); 
    const buyingTab = document.getElementById('InventoryTabC');
    const historyTab = document.getElementById('InventoryTabD'); 
    
    // 1. Redraw Trade History (Tab D)
    // Checks if the tab is currently visible
    if (historyTab && historyTab.style.display !== 'none') {
        renderTradeHistory(); 
    } 

    // 2. Redraw Buying List (Tab C)
    if (buyingTab && buyingTab.style.display !== 'none') {
        if (typeof renderBuyingList === 'function') {
            renderBuyingList();
        }
    } 

    // 3. Redraw Main Inventory (Tab A)
    if (mainTab && mainTab.style.display !== 'none') {
        // Redraw the standard virtualized inventory list
        const items = inventoryState.virtualizedData['FULL_LIST_TABLE'] || [];
        if (typeof renderVirtualTable === 'function') {
            renderVirtualTable('FULL_LIST_TABLE', items, createRowElement);
        }

        // IMPORTANT: If you have smaller static tables on the same page 
        // (like a summary or "Sell MU" preview), redraw those here too:
        if (typeof renderSellMUTable === 'function') renderSellMUTable();
    }
    
    // 4. Always update the Sidebar Log 
    // This ensures the mini-trade-logger in the sidebar stays aligned
    if (typeof renderSidebarLog === 'function') {
        renderSidebarLog();
    }
} */
function handleResizeRedraw() {
    console.log("🔄 Column resize detected - redrawing visible tables");

    // 1. Full Inventory List (Tab A)
    if (document.getElementById('InventoryTabA')?.style.display !== 'none') {
        if (typeof renderFullInventoryList === 'function') {
            renderFullInventoryList();
        }
    }

    // 2. Trade Tab (Tab C - Buying/Selling lists)
    if (document.getElementById('InventoryTabC')?.style.display !== 'none') {
        if (typeof renderBuyingList === 'function') renderBuyingList();
        if (typeof renderSellMUTable === 'function') renderSellMUTable();
    }

    // 3. Community Market Tab (Tab D) ← This was missing proper support
    const communityTab = document.getElementById('InventoryTabD');
    if (communityTab && communityTab.style.display !== 'none') {
        if (typeof loadCommunityMarket === 'function') {
            loadCommunityMarket();        // Re-render the market with new widths
        }
    }

    // 4. Undecided / Decision Queue (Tab B)
    if (document.getElementById('InventoryTabB')?.style.display !== 'none') {
        if (typeof renderFilteredUndecided === 'function') {
            renderFilteredUndecided();
        }
    }

    // Force table layout recalculation on all tables
    document.querySelectorAll('table.tableTheme').forEach(table => {
        table.style.tableLayout = 'fixed';
        // Small reflow trick
        void table.offsetWidth;
    });
}


function updateSortIcons(tbodyId, config) {
    const table = document.getElementById(tbodyId)?.closest('table');
    if (!table || !config) return;
    // Reset all icons in this table
    table.querySelectorAll('.fas.fa-sort, .fas.fa-sort-up, .fas.fa-sort-down').forEach(icon => {
        icon.className = 'fas fa-sort ml-1 opacity-20';
    });
    // Highlight active column icon
    const activeTh = table.querySelector(`th[data-column="${config.column}"]`);
    if (activeTh) {
        const icon = activeTh.querySelector('i');
        if (icon) {
            icon.className = `fas fa-sort-${config.direction === 'asc' ? 'up' : 'down'} ml-1 opacity-100 text-cyan-400`;
        }
    }
}
// 🟢 MODIFIED: Full table render now uses the virtual renderer for all core tables

//filterfullinventorylist function is not currently used
function filterFullInventoryList() {
    const searchTerm = inputs.fullSearch.value.trim().toLowerCase(); 
    // Re-run the main render function, passing the search term
    renderFullInventoryList(searchTerm);
}
function refreshAllInventoryTables() {
    console.log("🔄 Syncing Inventory UI...");

    // 1. Refresh the specific tables (Undecided, Save, Sell, Craft, etc.)
    // Passing 'ALL' tells your renderInventory function to loop through 
    // every category and rebuild the virtual tables.
    if (typeof renderInventory === 'function') {
        renderInventory(['ALL', 'FULL']);
    }

    // 2. Refresh the Decision logic
    // This ensures the "Next Item" card matches the filtered undecided set
    if (typeof renderFilteredUndecided === 'function') {
        renderFilteredUndecided();
    }
    
    // 3. Update the Top-Level Summaries (PED totals, item counts)
    if (typeof updateSummary === 'function') {
        updateSummary();
    }

    // 4. Trigger the Decision Prompt if we're in "Decide" mode
    if (typeof promptNextDecision === "function") {
        promptNextDecision();
    }
}
function renderInventory(types) {
    if (types.includes('ALL')) {
        types = ['UNDECIDED', 'SAVE', 'SELL_MU', 'SELL_TT', 'CRAFT', 'BUY'];
    }

    types.forEach(type => {
        const tbodyId = getTbodyId(type);
        if (['UNDECIDED', 'SAVE', 'SELL_MU', 'SELL_TT', 'CRAFT'].includes(type)) {
            renderTable(type, tbodyId); 
        } else if (type === 'BUY') {
            renderBuyingList();
        }
    });

    // 🟢 MOVE THIS OUTSIDE THE LOOP
    // Only render the full list if we are actually on the tab that needs it
    // or if specifically requested.
    if (types.includes('FULL')) {
        renderFullInventoryList();
    }
}


// ---

/* Item count only *//*

function updateTableCountHeader(elementId, count) {
    const el = document.getElementById(elementId);
    if (el) {
        el.textContent = `(${count} in list)`;
    }
} */
/**
 * Item count & total tt value *
 * Updates the H2/Header counts and sums the Total TT for any table
 * @param {string} elementId - The ID of the <span> or <h2> to update
 * @param {Array} items - The array of items currently in the table
 * @param {string|number} totalOverride - Optional: For "X / Y" style displays
 */

/*
 * Universal Header Updater
 * Handles: Full List, Undecided, Market Tabs (Save/MU/TT/Craft), and Sidebar
 */

function updateTableCountHeader(elementId, items, totalOverride = null) {
    const el = document.getElementById(elementId);
    if (!el) return;

    const itemsArray = Array.isArray(items) ? items : Object.values(items || {});
   
    // Calculate total
    const totalTT = itemsArray.reduce((sum, item) => {
        const val = getItemSortValue(item, 'totalValue');
        return sum + (parseFloat(val) || 0);
    }, 0);

    const countDisplay = totalOverride !== null ? totalOverride : itemsArray.length;

    // Determine privacy zone
    let zone = 'full_list';
    if (elementId.includes('undecided')) zone = 'undecided';
    if (elementId.includes('buy'))       zone = 'buy_list';
    if (elementId === 'ped-cash-table-count') zone = 'sidebar_ped';
    if (elementId === 'ammo-table-count') zone = 'sidebar_ammo';
    if (elementId.includes('save'))    zone = 'save_list';    
    if (elementId.includes('sell_mu')) zone = 'sell_mu_list'; 
    if (elementId.includes('sell_tt')) zone = 'sell_tt_list'; 
    if (elementId.includes('craft'))   zone = 'craft_list';   

    const isHidden = privacyStates[zone];
    const displayValue = isHidden ? "••••••" : totalTT.toFixed(2);

    el.innerHTML = `
        <span class="header-total-wrapper">
            <span class="header-count-label opacity-70">(${countDisplay} in list)</span>
            <span class="header-separator" style="margin: 0 6px; opacity: 0.2;">|</span>
            <span class="privacy-toggle" data-zone="${zone}">
                <span class="header-total-value ${isHidden ? 'privacy-hidden' : ''}">
                    ${displayValue}
                    <span class="pedtext">PED</span>
                </span>
            </span>
        </span>
    `;
}
function renderSummaryTotal() {
    const el = document.getElementById('summary-total');
    const icon = document.getElementById('privacy-icon');
    if (!el) return;

    const isHidden = privacyStates.summary_total;

    if (isHidden) {
        el.textContent = "•••••• PED";
        el.classList.add('blur-sm', 'opacity-50', 'select-none');
        if (icon) icon.className = 'fas fa-eye-slash ml-auto text-gray-600 text-[10px] privacy-icon';
    } else {
        el.textContent = currentTotalAssets.toFixed(2) + ' PED';
        el.classList.remove('blur-sm', 'opacity-50', 'select-none');
        if (icon) icon.className = 'fas fa-eye ml-auto text-yellow-500 text-[10px] privacy-icon';
    }
}
/** Recalculates all totals and refreshes summary UI components.
 * Fixed: Now forces Ped and Ammo tables to render on load.
 */
function updateSummary() {
    const inventory = getInventory(); 
    
    // 1. Initialize data structures
    const totals = { 
        UNDECIDED: 0, SAVE: 0, SELL_MU: 0, SELL_TT: 0, 
        CRAFT: 0, liquidCash: 0, totalAssets: 0, totalAmmo: 0 
    };
    const counts = { UNDECIDED: 0, SAVE: 0, SELL_MU: 0, SELL_TT: 0, CRAFT: 0 };

    // 2. Aggregate Inventory Decisions
    inventory.forEach(item => {
        const value = item.totalValue || 0;
        const type = item.decision?.type || 'UNDECIDED';
        
        if (totals[type] !== undefined) {
            totals[type] += value;
            counts[type]++;
        } else {
             totals.UNDECIDED += value;
             counts.UNDECIDED++;
        }
    });

    // 3. Aggregate Liquid Assets (PED/Ammo)
    inventoryState.pedCashItems.forEach(item => { totals.liquidCash += (item.totalValuePed || 0); });
    inventoryState.ammoItems.forEach(item => { totals.totalAmmo += (item.totalValuePed || 0); });
    
    // 4. Calculate Final Account Value
    totals.totalAssets = totals.UNDECIDED + 
                         totals.SAVE + totals.SELL_MU + totals.SELL_TT + totals.CRAFT;

    // 5. Update Global Privacy Tracker
    currentTotalAssets = totals.totalAssets;

    // 6. UI: Privacy-Aware Rendering for Total Value
    renderSummaryTotal();

    // 7. UI: Privacy-Aware Metric Cards
    const applyPrivacyToMetric = (elementId, value, zone) => {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        const isHidden = privacyStates[zone];
        el.textContent = isHidden ? "•••••• PED" : value.toFixed(2) + ' PED';
        
        if (isHidden) {
            el.classList.add('blur-sm', 'opacity-50', 'select-none');
        } else {
            el.classList.remove('blur-sm', 'opacity-50', 'select-none');
        }
        
        const card = el.closest('.summary-metric');
        const icon = card?.querySelector('.privacy-icon');
        if (icon) {
            icon.className = `fas ${isHidden ? 'fa-eye-slash text-gray-600' : 'fa-eye text-yellow-500'} ml-auto text-[10px] privacy-icon`;
        }
    };

    applyPrivacyToMetric('summary-liquid', totals.liquidCash, 'summary_liquid');
    applyPrivacyToMetric('summary-pending', totals.SELL_MU, 'summary_pending');
    applyPrivacyToMetric('summary-fixed', (totals.SAVE + totals.CRAFT), 'summary_fixed');

    // 8. UI: Update Header Counts
    // CRITICAL: We removed the '-table-count' IDs from here to prevent overwriting our HTML formatting
    const countMappings = {
        'undecided-count': `(${counts.UNDECIDED} left)`
    };

    Object.entries(countMappings).forEach(([id, text]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    });

    // 9. Location-specific sidebar tables
    renderDetailedLocationTable('ped-cash-tbody', inventoryState.pedCashItems);
    renderDetailedLocationTable('ammo-tbody', inventoryState.ammoItems);
    
    renderedContent['PED_CASH_TABLE'] = true;
    renderedContent['AMMO_TABLE'] = true;
}
function parseCsvToInventory(csvContent) {
    const rawLines = csvContent.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    if (rawLines.length <= 1) return {};

    const lines = [];
    for (let i = 0; i < rawLines.length; i++) {
        let currentLine = rawLines[i];
        if (currentLine.includes('STORAGE (The Hub') && !currentLine.includes(')"')) {
            if (i + 1 < rawLines.length) {
                i++; 
                currentLine += " " + rawLines[i]; 
            }
        }
        lines.push(currentLine);
    }

    inventoryState.pedCashItems = [];
    inventoryState.ammoItems = [];
    
    const dataLines = lines.slice(1);    
    const items = {};
    
    const isTsv = lines[0].includes('\t');
    const separator = isTsv ? '\t' : ',';

    const AMMO_TERMS = ['weapon cell', 'universal ammo', 'shrapnel', 'explosive projectile', 'mind essence', 'survey probe', 'ammo'];
    const LIQUID_CASH_NAMES = ['project entropia dollar', 'project entropia cent', 'credit - h.m.'];

    for (let i = 0; i < dataLines.length; i++) {
        const line = dataLines[i];
        const rawValues = line.split(separator);
        
        try {
            const csvId = (rawValues[0] || '').trim().replace(/^"|"$/g, '');
            const name = (rawValues[1] || '').trim().replace(/^"|"$/g, '');
            const quantity = parseFloat((rawValues[2] || '0').trim());
            const totalValuePed = parseFloat((rawValues[3] || '0').replace(/[^\d.]/g, ''));
            const location = (rawValues[4] || '').trim().replace(/^"|"$/g, '');
            const containerRefRaw = (rawValues[5] || '').trim().replace(/^"|"$/g, '');
            
            // 🟢 CRITICAL: Convert 'null' string to actual null
            const containerRef = (containerRefRaw === 'null' || !containerRefRaw) ? null : containerRefRaw;

            if (name && !isNaN(quantity)) {
                const lowerName = name.toLowerCase();
                const isCashItem = lowerName.includes('ped card') || lowerName === 'ped' || LIQUID_CASH_NAMES.includes(lowerName);
                const isStrictAmmo = AMMO_TERMS.some(term => lowerName.includes(term));

			if (isCashItem || isStrictAmmo) {
				const targetList = isCashItem ? inventoryState.pedCashItems : inventoryState.ammoItems;
				targetList.push({ 
					name, 
					quantity, 
					totalValuePed, 
					totalValue: totalValuePed, 
					location,
					id: csvId // Add ID for consistency
				}); 
			}
                
                const newItem = {
                    id: csvId, 
                    name: name, 
                    quantity: quantity,    
                    value: totalValuePed / quantity, 
                    totalValue: totalValuePed, 
                    location: location || 'Unknown', 
                    containerRef: containerRef, 
                    originalIndex: i + 2,
                    decision: inventoryState.decisions[csvId] || { type: 'UNDECIDED', meta: {} }
                };

                if (window.itemLookupMap) {
                    const cleanNameKey = name.replace(/\s*,\s*/g, ',').toLowerCase().trim();
                    newItem.type = window.itemLookupMap.get(cleanNameKey) || "Unknown";
                } else {
                    newItem.type = "Unknown";
                }

                items[csvId] = newItem;
            }
        } catch (error) { console.error("Parse error", error); }
    }
    
    // ... (rest of queue sorting logic)
    return items;
}
// ================= WEB VERSION - INVENTORY LOADING =================

async function loadAndProcessFile(fileOrPath) {
    if (!fileOrPath) return false;

    // Ensure decisions are loaded first
    await loadDecisions();

    let csvData = "";

    // 1. Handle File object (from clipboard or file input) or string path
    if (fileOrPath instanceof File) {
        csvData = await fileOrPath.text();
        inventoryState.inventoryFilePath = "Clipboard Import";
        console.log("📋 Loaded inventory from clipboard");
    } 
    else if (typeof fileOrPath === 'string') {
        // For web version, we treat string as raw CSV text (rare case)
        csvData = fileOrPath;
        inventoryState.inventoryFilePath = "Manual CSV";
    } 
    else {
        console.error("Invalid input to loadAndProcessFile");
        return false;
    }

    // 2. Initialize item lookup system BEFORE parsing
    await initItemLookupSystem();

    // 3. Parse CSV into inventory state
    const newItems = parseCsvToInventory(csvData);
    inventoryState.items = newItems;

    // Reset temporary states
    inventoryState.actionHistory = [];
    inventoryState.currentDecisionId = null;

    // Reset rendering flags
    if (typeof renderedContent !== 'undefined') {
        Object.keys(renderedContent).forEach(key => renderedContent[key] = false);
    }

    // Sync with crafting plans if function exists
    if (typeof syncInventoryToPlans === 'function') {
        await syncInventoryToPlans();
    }

    // 4. Update UI
    await updateFilterDropdowns();
    renderInitialTabA();
    updateSummary();
    promptNextDecision();

    console.log(`✅ Inventory loaded: ${Object.keys(newItems).length} items`);
    return true;
}

// ================= LOAD INVENTORY (Web Version) =================
async function loadInventory(forceNewSelection = false) {
    // In web version, we don't have a persistent file path like Electron
    // So we rely on clipboard import or manual upload

    if (forceNewSelection) {
        alert("In the web version, please use the 'Paste Inventory from Clipboard' button.");
        return;
    }

    // If we already have data in memory, just re-render
    if (Object.keys(inventoryState.items).length > 0) {
        renderInitialTabA();
        updateSummary();
        return;
    }

    // No data yet — prompt user to paste from clipboard
    if (confirm("No inventory data found.\n\nWould you like to paste your inventory from clipboard now?")) {
        await importInventoryFromClipboard();
    } else {
        console.log("User declined to load inventory on startup.");
    }
}

// ================= CLIPBOARD IMPORT (Already mostly good) =================
async function importInventoryFromClipboard() {
    try {
        const clipboardText = await navigator.clipboard.readText();

        if (!clipboardText || !clipboardText.trim()) {
            alert("Clipboard is empty or doesn't contain text.");
            return;
        }

        if (!confirm("This will OVERWRITE your current inventory with the clipboard data.\n\nProceed?")) {
            return;
        }

        // Create virtual File object
        const blob = new Blob([clipboardText], { type: 'text/csv' });
        const virtualFile = new File([blob], "clipboard_inventory.csv", { type: 'text/csv' });

        // Process it
        const success = await loadAndProcessFile(virtualFile);

        if (success) {
            // Save raw text for persistence
            saveInventoryToState(clipboardText);
            updateFilterDropdowns();
            alert("✅ Inventory successfully imported from clipboard!");
        }

    } catch (err) {
        console.error("Clipboard Error:", err);
        alert("Failed to read clipboard.\nMake sure the page has focus and clipboard permission is granted.");
    }
}

// ================= SAVE INVENTORY STATE (Web Version) =================
function saveInventoryToState(csvText) {
    try {
        localStorage.setItem('customInventoryData', csvText);
        localStorage.setItem('inventorySourceMode', 'CLIPBOARD');
        console.log("💾 Inventory raw data saved to localStorage");
    } catch (err) {
        console.warn("Failed to save inventory to localStorage", err);
    }
}
function copyTableToClipboard(tableId, fileName) {
    const table = document.getElementById(tableId);
    if (!table) return;

    const rows = Array.from(table.querySelectorAll('tr'));
    
    const csvContent = rows.map(row => {
        // Get all cells (th or td)
        const cells = Array.from(row.querySelectorAll('th, td'));
        
        // Filter out the 'Action' column (usually the last one)
        // or any cell containing a button/icon only
        return cells
            .filter(cell => !cell.classList.contains('col-action'))
            .map(cell => {
                // Clean the text: remove extra whitespace and handle quotes
                let data = cell.innerText.replace(/\s+/g, ' ').trim();
                // If data contains a comma, wrap it in quotes for CSV safety
                if (data.includes(',')) {
                    data = `"${data}"`;
                }
                return data;
            })
            .join(',');
    }).join('\n');

    // Copy to Clipboard
    navigator.clipboard.writeText(csvContent).then(() => {
        // Visual Feedback (You can replace this with a custom toast/notification)
        const btn = document.querySelector(`[data-action="copy-csv-${tableId.includes('sell') ? 'sell' : 'buy'}"]`);
        const originalText = btn.innerHTML;
        
        btn.innerHTML = `<i class="fas fa-check mr-1"></i> Copied!`;
        btn.classList.replace('bg-blue-600', 'bg-green-600');
        
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.replace('bg-green-600', 'bg-blue-600');
        }, 2000);

        console.log(`[SYSTEM] ${fileName} copied to clipboard successfully.`);
    }).catch(err => {
        console.error('[ERROR] Could not copy CSV: ', err);
    });
}

/**
 * Debounce helper to prevent performance lag during rapid typing.
 */
function debounce(func, timeout = 0) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
}

function refreshAllInventoryTables() {
    // 1. Refresh the primary category tables (Save, Sell, Craft)
    if (typeof renderInventory === 'function') {
        renderInventory(['SAVE', 'SELL_MU', 'SELL_TT', 'CRAFT']);
    }
    
    // 2. Refresh the Undecided/Filterable lists
    if (typeof renderFilteredUndecided === 'function') renderFilteredUndecided();
    if (typeof renderFullInventoryList === 'function') renderFullInventoryList();
    
    // 3. Update the summary numbers at the top of the page
    if (typeof updateSummary === 'function') updateSummary();
}
// Make table cells clickable with persistent active state
function initTableCellClick() {
    document.addEventListener('click', (e) => {
        const td = e.target.closest('td');
        
        // Remove active from all cells first
        document.querySelectorAll('.tableTheme td.active').forEach(cell => {
            cell.classList.remove('active');
        });

        // If we clicked on a td inside .tableTheme, activate it
        if (td && td.closest('.tableTheme')) {
            td.classList.add('active');
        }
    });
}
function initInventoryListeners() {
    // --- 1. CSV and Import Listeners ---
    const b = buttons;
    if (b.csvLoadBtn) b.csvLoadBtn.addEventListener('click', () => loadInventory(true));
    if (b.inventoryCsvclipBtn) b.inventoryCsvclipBtn.addEventListener('click', importInventoryFromClipboard);
    if (b.undoLastDecisionBtn) b.undoLastDecisionBtn.addEventListener('click', undoLastAction);
    if (b.settingsBrowseBtn) b.settingsBrowseBtn.addEventListener('click', handleManualFileSelection);

    // --- 2. UNIFIED DEBOUNCED RENDERERS ---
    const debouncedFullRender = debounce(() => {
        renderFullInventoryList();
    }, 0);

    const debouncedUndecidedRender = debounce(() => {
        renderFilteredUndecided();
    }, 0);

    // --- 3. ATTACH DEBOUNCED LISTENERS ---
    [inputs.fullSearch, selects.planet, selects.cat].forEach(el => {
        if (el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', debouncedFullRender);
    });

    [inputs.uSearch, selects.uPlanet, selects.uCat].forEach(el => {
        if (el) el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', debouncedUndecidedRender);
    });

    // --- 4. GLOBAL CLICK HANDLER ---
    document.addEventListener('click', (e) => {
        const target = e.target;

        // === 1. Privacy Toggles ===
        const toggleTrigger = target.closest('.privacy-toggle') || target.closest('.summary-metric');
        if (toggleTrigger) {
            let zone = toggleTrigger.dataset.zone;
            if (!zone) {
                if (toggleTrigger.querySelector('#summary-total')) zone = 'summary_total';
                else if (toggleTrigger.querySelector('#summary-liquid')) zone = 'summary_liquid';
                else if (toggleTrigger.querySelector('#summary-pending')) zone = 'summary_pending';
                else if (toggleTrigger.querySelector('#summary-fixed')) zone = 'summary_fixed';
            }

			if (zone && privacyStates[zone] !== undefined) {
				privacyStates[zone] = !privacyStates[zone];

				// --- ROUTING LOGIC: Tell the app which function to run to show the change ---
				if (zone === 'summary_total') {
					renderSummaryTotal();
				} else if (zone.startsWith('summary_') || zone.startsWith('sidebar_')) {
					updateSummary();
				} else if (zone === 'full_list') {
					renderFullInventoryList();
				} else if (zone === 'undecided') {
					renderFilteredUndecided();
					updateDecisionQueueCard(); // Update the top card total too
				} else if (zone === 'buy_list') {
					if (typeof renderBuyingList === 'function') renderBuyingList();
				} 
				// ADD THESE FOR THE MARKET OVERVIEW TABLES:
				else if (zone === 'save_list') {
					renderTable('SAVE', 'save-tbody');
				} else if (zone === 'sell_mu_list') {
					renderTable('SELL_MU', 'sell-mu-tbody');
				} else if (zone === 'sell_tt_list') {
					renderTable('SELL_TT', 'sell-tt-tbody');
				} else if (zone === 'craft_list') {
					renderTable('CRAFT', 'craft-tbody');
				}
				
				return;
			}
        }

        // === 2. Sub-tab switching ===
        const subTabBtn = target.closest('[data-subtab]');
        if (subTabBtn) {
            handleInventorySubTabSwitching(subTabBtn.dataset.subtab);
            return;
        }

        // === 3. Collapsible headers ===
        const headerElement = target.closest('[data-toggle="collapse"]');
        if (headerElement) {
            toggleCollapsible(headerElement);
            handleCollapsibleContentRendering(headerElement.getAttribute('data-target'));
            return;
        }

        // === 4. Sortable table headers ===
		const sortHeader = target.closest('th[data-column]');
		if (sortHeader) {
			const table = sortHeader.closest('table');
			if (!table) return;

			const tableId = table.id;
			const column = sortHeader.dataset.column;
			const tableKey = tableId.toUpperCase().replace(/-/g, '_');

			const current = inventoryState.sortConfig[tableKey] || { column: '', direction: 'desc' };
			inventoryState.sortConfig[tableKey] = {
				column: column,
				direction: (current.column === column && current.direction === 'desc') ? 'asc' : 'desc'
			};

			// --- ROUTING LOGIC ---
			if (tableId === 'full-list-table') {
				renderFullInventoryList();
			} else if (tableId === 'buy-table') {
				renderBuyingList();
			} 
			// FIX FOR SIDEBAR TABLES:
			else if (tableId === 'ped-cash-table') {
				// 1. Get the current items
				let data = inventoryState.pedCashItems || [];
				// 2. Sort them using the NEW logic
				const sortedData = sortItems(data, 'PED_CASH_TABLE');
				// 3. Render the sorted result
				renderDetailedLocationTable('ped-cash-tbody', sortedData);
			} 
			else if (tableId === 'ammo-table') {
				let data = inventoryState.ammoItems || [];
				const sortedData = sortItems(data, 'AMMO_TABLE');
				renderDetailedLocationTable('ammo-tbody', sortedData);
			}
			// All other market tables (SAVE, MU, etc.)
			else {
				const type = tableKey.replace('_TABLE', '');
				renderTable(type, getTbodyId(type));
			}
			return;
		}
        // === 5. ACTION BUTTONS ===
        const actionElement = target.closest('[data-action]');
        if (actionElement) {
            let action = actionElement.getAttribute('data-action');
            if (!action) return;
            e.stopImmediatePropagation();

            if (action === 'add-buying-item') {
                addBuyingItem();
            } 
            else if (['save', 'sell_mu', 'sell_tt', 'craft', 'skip'].includes(action)) {
                handleDecisionAction(action);
            } 
            else if (action === 'confirm') handleDecisionConfirm();
            else if (action === 'cancel') handleDecisionCancel();
            else if (['revert', 'decide', 'remove-buy'].includes(action)) {
                let itemId = actionElement.dataset.id || actionElement.closest('tr')?.dataset.itemId;

                if (itemId) {
                    if (action === 'remove-buy') {
                        inventoryState.buyingList = inventoryState.buyingList.filter(item => item.id !== itemId);
                        saveDecisions();
                        renderBuyingList();
                        if (typeof displayPlanDetails === 'function' && currentActivePlanId) displayPlanDetails(currentActivePlanId);
                    } else {
                        handleTableAction(itemId, action);
                    }
                }
            }
            return;
        }

        // === 6. Bulk Actions ===
        const bulkBtn = target.closest('[data-bulk-action]');
        if (bulkBtn) {
            applyBulkAction(bulkBtn.getAttribute('data-bulk-action'));
            return;
        }
    });

    // --- 5. DYNAMIC INPUT HANDLER (MU% Updates) ---
    document.addEventListener('input', (e) => {
        const target = e.target;
        if (!target.classList.contains('mu-edit-input')) return;

        const itemId = target.dataset.id;
        const newMU = parseFloat(target.value) || 100;

        // Case A: Standard Decisions (Market Tables)
        if (inventoryState.decisions[itemId]) {
            inventoryState.decisions[itemId].meta.mu = newMU;
            const row = target.closest('tr');
            if (row && inventoryState.items[itemId]) {
                const priceCell = row.querySelector('.col-price');
                if (priceCell) {
                    const price = (inventoryState.items[itemId].totalValue * (newMU / 100)).toFixed(2);
                    priceCell.textContent = price;
                }
            }
        } 
        // Case B: Buying List
        else {
            const buyItem = inventoryState.buyingList.find(i => i.id === itemId);
            if (buyItem) {
                buyItem.targetMu = newMU;
                const row = target.closest('tr');
                if (row) updateVirtualRowContent(row, buyItem, 'BUY');
            }
        }
        saveDecisions();
        updateSummary();
    });

    // --- 6. Bulk Select Checkboxes ---
    const undecidedTbody = document.getElementById('undecided-tbody');
    if (undecidedTbody) {
        undecidedTbody.addEventListener('change', (e) => {
            if (e.target.classList.contains('item-checkbox')) {
                const id = String(e.target.dataset.id);
                e.target.checked ? window.selectedItems.add(id) : window.selectedItems.delete(id);
                updateBulkBarUI();
            }
        });
    }

    const checkAllCheckbox = document.getElementById('check-all-undecided');
    if (checkAllCheckbox) {
        checkAllCheckbox.addEventListener('change', () => {
            const isChecked = checkAllCheckbox.checked;
            const undecidedItems = inventoryState.virtualizedData['UNDECIDED_TABLE'] || [];
            if (isChecked) {
                undecidedItems.forEach(item => item.id && window.selectedItems.add(String(item.id)));
            } else {
                window.selectedItems.clear();
            }
            updateBulkBarUI();
            renderFilteredUndecided();
        });
    }
}

function initUniversalSearch() {
    const searchInput = document.getElementById('universal-search-input');
    const resultsPanel = document.getElementById('search-results-dropdown');
    const clearBtn = document.getElementById('clear-search');

    if (!searchInput || !resultsPanel) return;

		// 1. Core Search Logic
	const performSearch = (query) => {
		const term = query.toLowerCase().trim();
		
		// Debug: Check if map is empty
		if (window.itemDataMap.size === 0) {
			console.warn("Universal Search: window.itemDataMap is empty!");
		}

		if (term.length < 2) {
			resultsPanel.style.display = 'none';
			return;
		}

		const matches = [];
		// Convert Map to array and filter for better reliability
		for (let [key, data] of window.itemDataMap) {
			const itemName = (data.Name || "").toLowerCase();
			const nameMatch = itemName.includes(term);
			
			// Check Aliases safely
			const aliasMatch = Array.isArray(data.Aliases) && 
							   data.Aliases.some(a => a.toLowerCase().includes(term));

			if (nameMatch || aliasMatch) {
				matches.push({
					name: data.Name || key,
					type: data.Properties?.Type || 'Item',
					isAlias: !nameMatch && aliasMatch
				});
			}
			if (matches.length > 50) break;
		}

		console.log(`Search for "${term}" found ${matches.length} matches.`);
		renderResults(matches);
	};
    // 2. Render Result Rows
    const renderResults = (matches) => {
        if (matches.length === 0) {
            resultsPanel.innerHTML = `<div style="padding: 10px; color: #666; font-size: 11px;">NO DATA FOUND</div>`;
        } else {
            resultsPanel.innerHTML = matches.map(m => `
                <div class="itemsearch-result-row" 
                     data-name="${m.name.replace(/"/g, '&quot;')}"
                     style="padding: 8px 12px; border-bottom: 1px solid #222; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-family: monospace;">
                    <div>
                        <span style="color: #fff; font-size: 12px;">${m.name}</span>
                        ${m.isAlias ? `<span style="color: #a855f7; font-size: 9px; margin-left: 8px; opacity: 0.6;">(ALIAS MATCH)</span>` : ''}
                    </div>
                    <span style="color: #444; font-size: 10px; text-transform: uppercase;">${m.type}</span>
                </div>
            `).join('');
        }
        resultsPanel.style.display = 'block';
    };

    // 3. Event Listeners
    searchInput.addEventListener('input', (e) => performSearch(e.target.value));

    // Focus listener to show results again if query exists
    searchInput.addEventListener('focus', () => {
        if (searchInput.value.trim().length >= 2) resultsPanel.style.display = 'block';
    });

    // Handle Selection (Event Delegation)
    resultsPanel.addEventListener('click', (e) => {
        const row = e.target.closest('.itemsearch-result-row');
        if (row) {
            const targetName = row.getAttribute('data-name');
            showItemInfo(targetName);
            
            // UI Cleanup
            searchInput.value = targetName;
            resultsPanel.style.display = 'none';
        }
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('#universal-lookup-container')) {
			resultsPanel.style.cssText = `
				display: none; 
				position: absolute; 
				top: 100%; 
				left: 0; 
				right: 0; 
				z-index: 99999; 
				background: #0f0f0f;
				padding: 12px;
				border: 1px solid #1d8dad; 
				max-height: 400px; 
				overflow-y: auto; 
				box-shadow: 0 10px 30px rgba(0,0,0,0.8);
				pointer-events: auto;
			`;
        }
    });

    clearBtn.addEventListener('click', () => {
        searchInput.value = "";
        resultsPanel.style.display = 'none';
        searchInput.focus();
    });

    // Keyboard Navigation (Esc to close)
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            resultsPanel.style.display = 'none';
            searchInput.blur();
        }
    });
}

function initQuickTrade() {
    const typeToggle = document.getElementById('trade-type-toggle');
    const toggleLabel = document.getElementById('toggle-label');
    const btnStageItem = document.getElementById('btn-stage-item');
    const locIn = document.getElementById('trade-location');

    // Update UI labels and colors when toggle flips
    typeToggle?.addEventListener('change', () => {
        const isSale = typeToggle.checked;
        toggleLabel.innerText = isSale ? "SALE" : "PURCHASE";
        toggleLabel.style.color = isSale ? "#f56565" : "#48bb78";
    });

    // Attach numeric calculation listeners
    [qtyIn, unitIn, muIn].forEach(el => el?.addEventListener('input', priceCalc));

    // STAGING LOGIC: Add item to the draft list
    const handleStage = () => {
        const currentType = typeToggle.checked ? 'SELL' : 'BUY';
        
        const item = {
            name: nameIn.value.trim(),
            qty: parseFloat(qtyIn.value) || 0,
            unit: parseFloat(unitIn.value) || 0,
            peds: parseFloat(priceIn.value) || 0,
            mu: parseFloat(muIn.value) || 100,
            location: locIn?.value.trim() || "", // Capture the optional location
            type: currentType
        };

        if (!item.name || item.qty <= 0) {
            if (feedback) feedback.innerText = "Error: Name & Qty required.";
            return;
        }

        // Check for consistency: Once a draft starts, all items must be same type (BUY or SELL)
        if (tradeDraft.length > 0 && tradeDraft[0].type !== currentType) {
            if (feedback) feedback.innerText = `Error: Cannot mix Purchases and Sales in one TX.`;
            return;
        }

        tradeDraft.push(item);
        renderDraft();
        
        // Reset item-specific inputs but keep Player Name and Location for batch entry convenience
        [nameIn, unitIn, qtyIn].forEach(i => i.value = "");
        muIn.value = "100"; 
        priceIn.value = "0.00";
        if (feedback) feedback.innerText = `Staged ${currentType}: ${item.name}`;
    };

    // COMMIT LOGIC: Save the whole transaction to ledger and update inventory
    const processTransaction = () => {
        if (tradeDraft.length === 0) return;
        
        const txId = "TX-" + Date.now();
        const playerName = playerIn?.value.trim() || "Anon";
        const txDate = new Date().toLocaleString();

        tradeDraft.forEach(stageItem => {
            const lowName = stageItem.name.toLowerCase();

            // 1. Sync with Buying List
            if (inventoryState.buyingList && stageItem.type === 'BUY') {
                const bItem = inventoryState.buyingList.find(i => i.name.toLowerCase() === lowName);
                if (bItem) bItem.targetQty = Math.max(0, bItem.targetQty - stageItem.qty);
            }

            // 2. Sync with Inventory Stock & Location
            for (const id in inventoryState.items) {
                const invItem = inventoryState.items[id];
                if (invItem.name.toLowerCase() === lowName) {
                    // Update Quantity
                    invItem.quantity += (stageItem.type === 'BUY' ? stageItem.qty : -stageItem.qty);
                    invItem.quantity = Math.max(0, invItem.quantity);
                    
                    // Update Location if provided
                    if (stageItem.location) {
                        invItem.location = stageItem.location;
                    }
                    
                    // Update Value
                    if (stageItem.unit > 0) invItem.value = stageItem.unit;
                    invItem.totalValue = invItem.quantity * (invItem.value || 0);
                    break;
                }
            }

            // 3. Add to Permanent Ledger
            tradeHistory.push({
                ...stageItem,
                txId: txId,
                player: playerName,
                date: txDate
            });
        });

        // Cleanup
        tradeDraft = []; 
        if (playerIn) playerIn.value = ""; 
        if (locIn) locIn.value = ""; // Clear location after full commit
        
        renderDraft();
        saveAndRefresh(`Transaction Processed.`);
    };

    // Attach Click Events
    btnStageItem?.addEventListener('click', handleStage);
    btnProcess?.addEventListener('click', processTransaction);
    
    btnUndo?.addEventListener('click', () => {
        if (!tradeHistory.length) return;
        const lastTxId = tradeHistory[tradeHistory.length - 1].txId;
        // Remove all items belonging to the last transaction ID
        tradeHistory = tradeHistory.filter(t => t.txId !== lastTxId);
        saveAndRefresh("Last Transaction Undone");
    });
}
function renderDraft() {
    const container = document.getElementById('trade-draft-container');
    const list = document.getElementById('trade-draft-list');
    const commitBtn = document.getElementById('btn-process-trade');
    if (!container || !list) return;

    if (tradeDraft.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    
    // Change Commit Button color based on transaction type
    const isBuy = tradeDraft[0].type === 'BUY';
    commitBtn.style.backgroundColor = isBuy ? "#22543d" : "#742a2a";
    commitBtn.style.borderColor = isBuy ? "#2f855a" : "#9b2c2c";
    commitBtn.innerText = isBuy ? "COMMIT PURCHASE" : "COMMIT SALE";

    list.innerHTML = tradeDraft.map((item, idx) => `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222; padding: 3px 0;">
            <span style="color: ${item.type === 'BUY' ? '#48bb78' : '#f56565'}">
                <b>${item.type === 'BUY' ? 'PURCHASE' : 'SALE'}</b> ${item.qty}x ${item.name}
            </span>
            <i class="fas fa-trash" onclick="removeFromDraft(${idx})" style="cursor:pointer; color:#666; font-size: 0.8em;"></i>
        </div>
    `).join('');
}
// Global hook for trash icon
window.removeFromDraft = (idx) => {
    tradeDraft.splice(idx, 1);
    renderDraft();
};

/**
 * RENDER: Trade History (Sidebar & Full Ledger)
 */
function renderTradeHistory() {
    // --- 1. Sidebar Mini-Log ---
    const sidebarLog = document.getElementById('trade-sidebar-log'); 
    
    if (sidebarLog) {
        if (tradeHistory.length === 0) {
            sidebarLog.innerHTML = `<div style="color: #444; padding: 5px;">No recent trades...</div>`;
        } else {
            const sidebarGroups = {};
            tradeHistory.forEach(item => {
                if (!sidebarGroups[item.txId]) {
                    sidebarGroups[item.txId] = { 
                        items: [], 
                        total: 0, 
                        player: item.player, 
                        date: item.date, 
                        type: item.type,
                        location: item.location 
                    };
                }
                sidebarGroups[item.txId].items.push(item);
                sidebarGroups[item.txId].total += (parseFloat(item.peds) || 0);
            });

            const sortedIds = Object.keys(sidebarGroups).sort((a, b) => 
                parseInt(b.split('-')[1]) - parseInt(a.split('-')[1])
            ).slice(0, 10);

            sidebarLog.innerHTML = sortedIds.map(id => {
                const g = sidebarGroups[id];
                const isPurchase = g.type === 'BUY';
                const statusColor = isPurchase ? '#48bb78' : '#f56565';
                const cashColor = isPurchase ? '#f56565' : '#48bb78';
                const sign = isPurchase ? '-' : '+';
                const time = g.date.includes(',') ? g.date.split(',')[1].trim() : g.date;

                const hasValidLocation = g.location && 
                                       g.location.trim() !== "" && 
                                       g.location.toUpperCase() !== "CLASSIFIED";
                
                const locationHtml = hasValidLocation 
                    ? `<div style="color: #718096; font-size: 0.8em; margin-top: -2px; margin-bottom: 4px; font-style: italic;">
                        <i class="fas fa-map-marker-alt" style="font-size: 0.9em;"></i> ${g.location}
                       </div>` 
                    : '';

                return `
                <details style="border-bottom: 1px solid #222; cursor: pointer; font-size: 0.9em;">
                    <summary style="list-style: none; padding: 4px 0; display: flex; justify-content: space-between; align-items: center;">
                        <span>
                            <span style="color: #666;">[${time}]</span> 
                            <b style="color: ${statusColor}">${g.type}</b> 
                            <span style="color: #4fd1c5;">${g.player || 'Anon'}</span>
                        </span>
                        <b style="color: ${cashColor};">${sign}${g.total.toFixed(2)}</b>
                    </summary>
                    <div style="padding: 5px 10px; background: rgba(0,0,0,0.2); font-size: 0.85em; color: #ccc;">
                        ${locationHtml}
                        ${g.items.map(i => {
                            const safeName = i.name.replace(/'/g, "\\'");
                            // REMOVED onclick: added info-nav-link and data-nav-name for delegation
                            return `<div class="history-item-bullet info-nav-link" data-nav-name="${safeName}" style="cursor:help; padding: 1px 0;">• ${i.qty}x ${i.name}</div>`;
                        }).join('')}
                    </div>
                </details>`;
            }).join('');
        }
    }

    // --- 2. Tab D Full Ledger ---
    const fullTbody = document.getElementById('trade-history-full-tbody');
    if (fullTbody) {
        if (tradeHistory.length === 0) {
            fullTbody.innerHTML = '<tr><td colspan="9" style="text-align:center; padding:40px; color:#666;">No trade history found.</td></tr>';
            return;
        }

        const groups = {};
        tradeHistory.forEach(item => {
            if (!groups[item.txId]) {
                groups[item.txId] = { items: [], totalPeds: 0, date: item.date, player: item.player, type: item.type };
            }
            groups[item.txId].items.push(item);
            groups[item.txId].totalPeds += (parseFloat(item.peds) || 0);
        });

        const sortedTxIds = Object.keys(groups).sort((a, b) => 
            (parseInt(b.split('-')[1]) || 0) - (parseInt(a.split('-')[1]) || 0)
        );

        let html = '';
        sortedTxIds.forEach(txId => {
            const group = groups[txId];
            const sign = group.type === 'BUY' ? '-' : '+';
            const cashColor = group.type === 'BUY' ? '#48bb78' : '#f56565';
            const rowTint = group.type === 'BUY' ? 'rgba(72, 187, 120, 0.02)' : 'rgba(245, 101, 101, 0.02)';

            group.items.forEach((item, index) => {
                const isFirst = index === 0;
                const locDisp = item.location && item.location.trim() !== "" ? item.location : "CLASSIFIED";
                const groupStyle = `border-top: ${isFirst ? '2px solid #444' : '1px solid #222'}; background: ${rowTint}; cursor: pointer;`;

                html += `
                    <tr style="${groupStyle}" data-item-name="${item.name.replace(/"/g, '&quot;')}" class="history-row">
                        <td class="col-date" style="width: var(--col-date-width, 160px); color: #666;">
                            ${isFirst ? group.date : ''}
                        </td>
                        <td class="col-type" style="width: var(--col-type-width, 70px); color: ${item.type === 'BUY' ? '#48bb78' : '#f56565'}; font-weight: bold;">
                            ${item.type}
                        </td>
                        <td class="col-location" style="width: var(--col-location-width, 160px); color: #888; font-style: italic;">
                            ${locDisp}
                        </td>
                        <td class="col-player" style="width: var(--col-player-width, 150px); color: #4fd1c5;">
                            ${isFirst ? (group.player || 'Anon') : ''}
                        </td>
                        <td class="col-name" style="width: var(--col-name-width, auto); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                            ${item.name}
                        </td>
                        <td class="col-qty" style="width: var(--col-qty-width, 80px); text-align: right;">
                            ${item.qty}
                        </td>
                        <td class="col-mu" style="width: var(--col-mu-width, 70px); text-align: right; color: #ecc94b;">
                            ${item.mu}%
                        </td>
                        <td class="col-peds" style="width: var(--col-peds-width, 100px); text-align: right; color: ${cashColor};">
                            ${sign}${Number(item.peds).toFixed(2)}
                        </td>
                        <td class="col-tx-total" style="width: var(--col-tx-total-width, 110px); text-align: right; font-weight: bold; color: ${cashColor}; background: rgba(0,0,0,0.15);">
                            ${isFirst ? sign + group.totalPeds.toFixed(2) : ''}
                        </td>
                    </tr>`;
            });
        });
        fullTbody.innerHTML = html;
    }
}

// INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
	initUniversalSearch();
    initQuickTrade();
    renderTradeHistory();

    // Universal Click Listener (Tables and Navigation Links)
    document.addEventListener('click', (e) => {
        // 1. Handle Navigation Links (Purple Links / Blueprint Cards / Sidebar Bullets)
        const navItem = e.target.closest('[data-nav-name]');
        if (navItem) {
            const targetName = navItem.getAttribute('data-nav-name');
            if (targetName && typeof showItemInfo === 'function') {
                showItemInfo(targetName);
                return; // Early exit
            }
        }

        // 2. Handle the Info Panel Back Button
        if (e.target.closest('#info-back-btn')) {
            if (window.infoHistory && window.infoHistory.length > 0) {
                const previousItem = window.infoHistory.pop();
                showItemInfo(previousItem, true); // true flag tells it not to add current item to history again
            }
            return;
        }

        // 3. Handle Table Rows (Full Ledger)
        const row = e.target.closest('tr');
        if (!row || e.target.closest('button, input, select, .checkbox-cell')) return;

        let itemName = row.getAttribute('data-item-name') || 
                       row.querySelector('.col-name')?.innerText || 
                       row.querySelector('td:nth-child(2)')?.innerText;

        if (itemName && typeof showItemInfo === 'function') {
            showItemInfo(itemName.trim());
        }

        // 4. Handle Autofill logic
        if (typeof handleTableFill === 'function' && (row.dataset.itemId || row.getAttribute('data-item-name'))) {
            handleTableFill(e);
        }
    });
});
document.addEventListener('DOMContentLoaded', async () => {
	// Load saved state
	if (localStorage.getItem("backlight") === "on") {
		toggle.checked = true;
		setTimeout(() => {
			document.body.classList.add("backlight-on");
		}, 900);
	}
	// Listener for Sell MU Table CSV butt
    document.querySelector('[data-action="copy-csv-sell"]')?.addEventListener('click', () => {
        copyTableToClipboard('sell_mu-table', 'Sell_MU_Export.csv');
    });

    // Listener for Buying List Table CSV Butt
    document.querySelector('[data-action="copy-csv-buy"]')?.addEventListener('click', () => {
        copyTableToClipboard('buy-table', 'Buying_List_Export.csv');
    });
	// Listen for toggle changes
	toggle.addEventListener("change", () => {
		const isOn = toggle.checked;

		if (isOn) {
			// 1.2 second delay before backlight + green light turn on
			setTimeout(() => {
				document.body.classList.add("backlight-on");
			}, 1200);
		} else {
			document.body.classList.remove("backlight-on");
		}

		localStorage.setItem("backlight", isOn ? "on" : "off");
	});
	initTableResizer();
	initPathfullpathTogglesync();
    initInventoryListeners();

    // Checks path and runs loadAndProcessFile automatically if path exists
    await initializeInventoryStartup();
    updateFilterDropdowns();
    await loadDecisions(); 
    updateSummary(); 
    renderInitialTabA(); 
    updateDecisionQueueCard();
	preRenderHiddenTabs();
	initTableCellClick();
	
});
