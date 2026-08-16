
let isDropdownsInitialized = false;
// ================= Cached Data =================
let cachedWeapons = [];
let cachedAmplifiers = [];
let cachedVisionAttachments = [];
let cachedScopes = [];
let cachedAbsorbers = [];
let cachedBlueprints = [];
let cachedClothes = [];
let cachedMedicalTools = [];
let cachedMedicalChips = [];
let cachedMaterials = [];
let cachedArmors = [];
window.cachedFaps = []; // Already on window

// ================= Cached Mining Data =================
let cachedFinders = [];
let cachedFinderAmps = [];
let cachedExcavators = [];
// ================= EXPOSE TO GLOBAL WINDOW =================

// ================= Dedicated Mining State ================
window.miningLoadout = {
    finder: null,
    amplifier: null,
    extractor: null,
    activeSearches: {
        enmatter: false,
        ore: false,
        treasure: false
    }
};
// ================= Current Data ================
window.currentLoadout = {
  weapon: null,
  amplifier: null,
  vision1: null,
  vision2: null,
  scope: null,
  absorber: null,
  LeftRing: null,
  RightRing: null,
  mainFap: null, 
  secondaryFap: null
};

let currentWeapon = null;
let currentAmplifier = null;
let currentVision1 = null;
let currentVision2 = null;
let currentScope = null;
let currentAbsorber = null;
let currentLeftRing = null;
let currentRightRing = null;
// ======================================================
const BASE_URL = 'https://api.entropianexus.com/';
const statusEl = document.getElementById('NexusAPIstatus');

// 🔀 Toggle between local JSONs and API
// let USE_LOCAL_DATA = true;
let USE_LOCAL_DATA = localStorage.getItem('USE_LOCAL_DATA') !== 'false';
window.BASE_URL = BASE_URL; // <-- FIX: Set BASE_URL globally

// 🔀 Toggle between local JSONs and API
window.USE_LOCAL_DATA = USE_LOCAL_DATA; // <-- FIX: Set USE_LOCAL_DATA globally

function toggleDataSource(type) {
  if (type === "data-source") {
    // Flip the boolean
    USE_LOCAL_DATA = !USE_LOCAL_DATA;
    window.USE_LOCAL_DATA = USE_LOCAL_DATA;
    
    // 💾 PERSISTENCE: Save the new state
    localStorage.setItem('USE_LOCAL_DATA', USE_LOCAL_DATA);
    
    if (DEBUG) console.log("Data source toggled. Local?", USE_LOCAL_DATA);
    
    updateStatusElements();

    // Only trigger a full repopulate if the system is NOT in the middle of a boot
    if (!window.isSystemInitializing) {
        initCaches(); 
    }
  }
}
// ================= Formulas =================
const entropiaFormulas = {
  hitAbility: `(Non-SIB) HA = 4 + 0.06 * Hit Level
(SIB) HA = 6 + ((Hit Level - Recommended) / (Max - Recommended)) * 4`,
  critAbility: `(Non-SIB) CHA = √Hit Level
(SIB) CHA = √((Hit Level - Recommended) / (Max - Recommended)) * 10`,
  hitRate: `Hit Rate = (Hit Ability + 80) / 100`,
  dpp: `DPP = Effective Damage / (Ammo Cost + Decay Cost)`,
  minDamage: `(Non-SIB) MinDamage = 25% + (0.75 * (DMG Level / Max DMG Level))
(SIB) MinDamage = 50% + (0.50 * (DMG Level - Recommended) / (Max - Recommended))`,
  apm: `⚠Proper Formula Unknown⚠\nCurrent approximation:
APM = BaseAPM * (0.5 + 0.5 * (Hit Level - Start) / (Max - Start))
(Capped between MinAPM and BaseAPM)`,
  reloadTime: `⚠Proper Formula Unknown⚠\nCurrent approximation:
Reload Time = 60 / APM`,
  effectiveDamage: `Effective damage = Average damage * Hit rate
Or, more precisely:
Effective damage = ((Minimal damage + Maximal damage) / 2) * (80 + Hit ability)
For a maxed weapon: MaxDamage * 0.75 * 0.9`
};

// ================= Terminal Logging =================
function appendData(text) {
  const line = document.createElement("div");
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

// ================= Local/API Data Loader =================
// ================= Local/API Data Loader =================
// ================= WEB-ONLY DATA LOADER =================
async function getData(endpoint, localFile = null) {
    const filename = localFile || `${endpoint}.json`;

    console.log(`[NEXUS_WEB] Attempting to load: ${filename}`);

    // 1. Primary: Fetch from ./data/nexus/ folder (recommended)
    try {
        const response = await fetch(`./data/nexus/${filename}`);
        if (response.ok) {
            const data = await response.json();
            const items = Array.isArray(data) ? data : (data?.items || []);
            if (items.length > 0) {
                console.log(`[NEXUS_WEB] ✅ SUCCESS: Loaded ${items.length} items from ./data/nexus/${filename}`);
                return items;
            }
        } else {
            console.warn(`[NEXUS_WEB] Fetch returned ${response.status} for ${filename}`);
        }
    } catch (err) {
        console.warn(`[NEXUS_WEB] Fetch failed for ${filename}:`, err.message);
    }

    // 2. Fallback: Try localStorage cache (if user uploaded files before)
    try {
        const cached = localStorage.getItem(`nexus_cache_${filename}`);
        if (cached) {
            const data = JSON.parse(cached);
            const items = Array.isArray(data) ? data : (data?.items || []);
            if (items.length > 0) {
                console.log(`[NEXUS_WEB] ✅ Loaded ${items.length} items from localStorage cache for ${filename}`);
                return items;
            }
        }
    } catch (err) {
        console.warn(`[NEXUS_WEB] localStorage cache error for ${filename}`);
    }

    // 3. Special fallback for materials → items.json
    if (filename.includes('materials') || endpoint.includes('material')) {
        console.log(`[NEXUS_WEB] materials.json not found → trying items.json as fallback`);
        try {
            const response = await fetch('./data/nexus/items.json');
            if (response.ok) {
                const data = await response.json();
                const items = Array.isArray(data) ? data : (data?.items || []);
                // Optionally filter only materials if you want, but for now return all
                console.log(`[NEXUS_WEB] ✅ Fallback: Loaded ${items.length} items from items.json`);
                return items;
            }
        } catch (err) {
            console.warn(`[NEXUS_WEB] items.json fallback also failed`);
        }
    }

    console.warn(`[NEXUS_WEB] ❌ No data found for ${filename}. Returning empty array.`);
    return [];
}//------------------------------------------------------------
//------------------------------------------------------------
// ================= DOWNLOADING DATA =================
async function downloadData(filename, endpoint) {
  statusEl.innerHTML = `<div class=" NexusAPISpinner"></div>Fetching ${filename}...`;
  try {
    const res = await fetch(BASE_URL + endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename + '.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    statusEl.textContent = `Status: ${filename} downloaded!`;
  } catch(err) {
    console.error(err);
    statusEl.textContent = `Status: Failed to fetch ${filename}`;
  }
}

async function downloadMultiple(endpoints) {
  for (const ep of endpoints) {
    await downloadData(ep, ep);
  }
}

async function downloadAllZip(endpoints) {
  statusEl.innerHTML = `<div class=" NexusAPISpinner"></div>Fetching all datasets...`;
  const zip = new JSZip();
  try {
    for (const ep of endpoints) {
      statusEl.innerHTML = `<div class=" NexusAPISpinner"></div>Fetching ${ep}...`;
      const res = await fetch(BASE_URL + ep);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      zip.file(ep + '.json', JSON.stringify(data, null, 2));
    }
    const content = await zip.generateAsync({type:"blob"});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(content);
    a.download = 'entropia_nexus_data.zip';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(a.href);
    statusEl.textContent = 'Status: All datasets downloaded as ZIP!';
  } catch(err) {
    console.error(err);
    statusEl.textContent = 'Status: Failed to fetch some datasets for ZIP';
  }
}

async function fetchData(endpoint, specific = null) {
  let fullEndpoint = endpoint;
  if (specific) fullEndpoint += `/${encodeURIComponent(specific)}`;
  
  try {
    const res = await fetch(BASE_URL + fullEndpoint);
    
    // If it's a 404, don't throw an error, just return null silently
    if (res.status === 404) return null;
    
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    return data;
  } catch (err) {
    // Only log actual network errors or 500-range server crashes
    console.warn(`Fetch notice for ${fullEndpoint}:`, err.message);
    return null;
  }
}
// Fetch + print into terminal
async function fetchAndPrint(endpoint, specific = null) {
  const data = await fetchData(endpoint, specific);
  if (data) {
    window.SuSTerminalCommands.printData(data, endpoint);
  } else {
    window.SuSTerminalCommands.printData(null, endpoint);
  }
}

// Simple filter utility
function filterData(data, key, value) {
  if (!Array.isArray(data)) return [];
  return data.filter(item => String(item[key]).toLowerCase().includes(String(value).toLowerCase()));
}

// Fetch, filter and print
async function fetchFilterAndPrint(endpoint, key, value) {
  const data = await fetchData(endpoint);
  if (!data) {
    window.SuSTerminalCommands.printData(null, endpoint);
    return;
  }
  const filtered = filterData(data, key, value);
  window.SuSTerminalCommands.printData(filtered, `${endpoint} (filtered by ${key}=${value})`);
}
function createNoneFromFirstItem(item) {
  if (!item || typeof item !== "object") return { Name: "None", IsSIB: false };

  const clone = JSON.parse(JSON.stringify(item));

  // Overwrite top-level Name
  if ("Name" in clone) clone.Name = "None";

  // Recursive zeroing function
  function zeroOut(obj) {
    if (Array.isArray(obj)) return [];
    if (typeof obj !== "object" || obj === null) return obj;

    for (const key in obj) {
      if (key === "Name") continue; // never overwrite Name
      if (key.toLowerCase() === "issib") { // handle IsSIB/IsSiB keys anywhere
        obj[key] = false;
      } else if (typeof obj[key] === "number") {
        obj[key] = 0.0;
      } else if (typeof obj[key] === "string") {
        obj[key] = null;
      } else if (Array.isArray(obj[key])) {
        obj[key] = [];
      } else if (typeof obj[key] === "object" && obj[key] !== null) {
        zeroOut(obj[key]);
      }
    }
    return obj;
  }

  return zeroOut(clone);
}


//------------------------------------------------------------
// ================= Populate Dropdown Helper =================
function populateDropdown(inputElement, containerId, items, currentRefSetter = null) {
  if (!inputElement || !containerId || !items) return;
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = "";
  const isDatalist = container.tagName.toLowerCase() === "datalist";

  if (isDatalist) {
    // Simple <datalist> handling
    items.forEach(item => {
      const opt = document.createElement("option");
      opt.value = item.Name;
      container.appendChild(opt);
    });
  } else {
    // Custom dropdown with divs
    items.forEach(item => {
      const optionDiv = document.createElement("div");
      optionDiv.textContent = item.Name;

      // Single click: set input and update selection
      optionDiv.addEventListener("click", e => {
        e.stopPropagation(); // prevent outside click from closing immediately
        inputElement.value = item.Name;
        if (currentRefSetter) currentRefSetter(item);
        inputElement.dispatchEvent(new Event("input"));
        inputElement.dispatchEvent(new Event("change"));
		container.querySelectorAll("div").forEach(div => {
      });
        container.style.display = "none"; // hide dropdown
      });

      container.appendChild(optionDiv);
    });

    // Show dropdown on focus
    inputElement.addEventListener("focus", e => {
      e.stopPropagation();
      container.style.display = "block";
    });

    // Double-click to clear input but keep dropdown open
    inputElement.addEventListener("dblclick", e => {
      e.stopPropagation();
      inputElement.value = "";
      inputElement.dispatchEvent(new Event("input"));
      container.style.display = "block"; // ensure dropdown stays visible
    });

    // Hide dropdown when clicking outside
    document.addEventListener("click", e => {
      if (!container.contains(e.target) && e.target !== inputElement) {
        container.style.display = "none";
      }
    });

    // Filter options as user types
    inputElement.addEventListener("input", () => {
      const filter = inputElement.value.toLowerCase();
      container.querySelectorAll("div").forEach(div => {
        div.style.display = div.textContent.toLowerCase().includes(filter) ? "block" : "none";
      });
      container.style.display = "block"; // ensure dropdown stays visible while typing
    });
  }

  // Reset input initially
  inputElement.value = "";
}
// ================= Dropdown Population =================

// ================= POPULATE CACHES ONLY (Web Version - No Dropdowns) =================
async function populateMiningCache() {
    cachedFinders = await getData("finders", "finders.json");
    const noneFinder = cachedFinders.length ? createNoneFromFirstItem(cachedFinders[0]) : { Name: "None" };
    cachedFinders.unshift(noneFinder);   // Add "None" at start

    cachedFinderAmps = await getData("finderamplifiers", "finderamplifiers.json");
    const noneAmp = cachedFinderAmps.length ? createNoneFromFirstItem(cachedFinderAmps[0]) : { Name: "None" };
    cachedFinderAmps.unshift(noneAmp);

    cachedExcavators = await getData("excavators", "excavators.json");
    const noneExtractor = cachedExcavators.length ? createNoneFromFirstItem(cachedExcavators[0]) : { Name: "None" };
    cachedExcavators.unshift(noneExtractor);

    console.log(`[CACHE] Mining tools loaded: ${cachedFinders.length} finders, ${cachedFinderAmps.length} amps, ${cachedExcavators.length} extractors`);
}
async function populateWeaponCache() {
    cachedWeapons = await getData("weapons", "weapons.json");
    const noneItem = cachedWeapons.length ? createNoneFromFirstItem(cachedWeapons[0]) : { Name: "None" };
    cachedWeapons = [noneItem, ...cachedWeapons];

    if (!currentWeapon) currentWeapon = cachedWeapons[0];
    console.log(`[CACHE] Weapons loaded: ${cachedWeapons.length} items`);
}
async function populateAmplifierCache() {
    cachedAmplifiers = await getData("weaponamplifiers", "amplifiers.json");
    const noneItem = cachedAmplifiers.length ? createNoneFromFirstItem(cachedAmplifiers[0]) : { Name: "None" };
    cachedAmplifiers = [noneItem, ...cachedAmplifiers];

    if (!currentAmplifier) currentAmplifier = cachedAmplifiers[0];
    console.log(`[CACHE] Amplifiers loaded: ${cachedAmplifiers.length} items`);
}
async function populateScopeCache() {
    const allAttachments = await getData("weaponvisionattachments", "weaponvisionattachments.json");
    cachedScopes = allAttachments.filter(item => 
        item.Properties?.Type === "Scope" || item.Properties?.Type === "Sight"
    );

    const noneItem = cachedScopes.length ? createNoneFromFirstItem(cachedScopes[0]) : { Name: "None" };
    cachedScopes = [noneItem, ...cachedScopes];

    if (!currentScope) currentScope = cachedScopes[0];
    console.log(`[CACHE] Scopes loaded: ${cachedScopes.length} items`);
}
async function populateVisionCache() {
    const allAttachments = await getData("weaponvisionattachments", "weaponvisionattachments.json");
    cachedVisionAttachments = allAttachments.filter(item => 
        item.Properties?.Type === "Sight"
    );

    const noneItem = cachedVisionAttachments.length ? createNoneFromFirstItem(cachedVisionAttachments[0]) : { Name: "None" };
    cachedVisionAttachments = [noneItem, ...cachedVisionAttachments];

    if (!currentVision1) currentVision1 = cachedVisionAttachments[0];
    if (!currentVision2) currentVision2 = cachedVisionAttachments[0];

    console.log(`[CACHE] Vision attachments loaded: ${cachedVisionAttachments.length} items`);
}
async function populateAbsorberCache() {
    cachedAbsorbers = await getData("absorbers", "absorbers.json");
    const noneItem = cachedAbsorbers.length ? createNoneFromFirstItem(cachedAbsorbers[0]) : { Name: "None" };
    cachedAbsorbers = [noneItem, ...cachedAbsorbers];

    if (!currentAbsorber) currentAbsorber = cachedAbsorbers[0];
    console.log(`[CACHE] Absorbers loaded: ${cachedAbsorbers.length} items`);
}
async function populateRingCache() {
    cachedClothes = await getData("clothings", "clothings.json");

    const allRings = cachedClothes.filter(item => item.Properties?.Type === "Ring");
    const leftRings = allRings.filter(r => r.Properties?.Slot?.toLowerCase() === "left finger");
    const rightRings = allRings.filter(r => r.Properties?.Slot?.toLowerCase() === "right finger");

    // Add None options
    const noneLeft = leftRings.length ? createNoneFromFirstItem(leftRings[0]) : { Name: "None" };
    const noneRight = rightRings.length ? createNoneFromFirstItem(rightRings[0]) : { Name: "None" };
    leftRings.unshift(noneLeft);
    rightRings.unshift(noneRight);

    // Store for later use (you can access them via window if needed)
    window.cachedLeftRings = leftRings;
    window.cachedRightRings = rightRings;

    if (!window.currentLeftRing) window.currentLeftRing = leftRings[0];
    if (!window.currentRightRing) window.currentRightRing = rightRings[0];

    console.log(`[CACHE] Rings loaded: ${leftRings.length} left, ${rightRings.length} right`);
}
async function populateAllClothesCache() {
    cachedClothes = await getData("clothings", "clothings.json");
    const noneItem = cachedClothes.length ? createNoneFromFirstItem(cachedClothes[0]) : { Name: "None" };
    const allClothes = [noneItem, ...cachedClothes];

    window.cachedAllClothes = allClothes;   // expose if needed

    if (!currentLoadout.selectedClothing) currentLoadout.selectedClothing = allClothes[0];
    console.log(`[CACHE] All clothes loaded: ${allClothes.length} items`);
}
async function populateFAPCache() {
    const tools = await getData("medicaltools", "medicaltools.json");
    if (tools.length) cachedMedicalTools = tools;

    const chips = await getData("medicalchips", "medicalchips.json");
    if (chips.length) cachedMedicalChips = chips;

    const allFaps = [...cachedMedicalTools, ...cachedMedicalChips];
    window.cachedFaps = allFaps;

    const noneItem = allFaps.length ? createNoneFromFirstItem(allFaps[0]) : { Name: "None" };
    const dropdownItems = [noneItem, ...allFaps];   // even if not used as dropdown

    if (!window.currentLoadout.mainFap) window.currentLoadout.mainFap = noneItem;
    if (!window.currentLoadout.secondaryFap) window.currentLoadout.secondaryFap = noneItem;

    console.log(`[CACHE] FAPs loaded: ${allFaps.length} items`);
}
async function populateMaterialsCache() {
    try {
        // Use your existing getData helper to pull materials.json
        const materials = await getData("materials", "materials.json");
        
        if (materials && materials.length > 0) {
            cachedMaterials = materials;
            window.cachedMaterials = materials; // Sync for the Item Info Terminal
            if (DEBUG) console.log(`[Materials] Cache populated with ${materials.length} items.`);
        }
    } catch (err) {
        console.error("Failed to load materials list:", err);
    }
}
async function populateRefiningCache() {
    try {
        const recipes = await getData("refining", "refiningrecipes.json");
        if (recipes) {
            window.cachedRefiningRecipes = recipes;
            console.log(`[Refining] Cache populated with ${recipes.length} recipes.`);
        }
    } catch (err) {
        console.error("Failed to load refining recipes:", err);
    }
}
async function populateArmorsCache() {
    try {
        const armors = await getData("armors", "armors.json");
        if (armors) {
            window.cachedArmors = armors;
            console.log(`[armors] Cache populated with ${armors.length} recipes.`);
        }
    } catch (err) {
        console.error("Failed to load refining recipes:", err);
    }
}
async function populateNexusDropdown() {
  try {
    const spinner = document.getElementById("bpLoadingSpinner");
    if (spinner) spinner.style.display = "block";

    //const res = await fetch("https://api.entropianexus.com/blueprints");
	const blueprints = await getData("blueprints", "blueprints.json");

    cachedBlueprints = blueprints;
	syncCachesToWindow();
    // REMOVE OR COMMENT THIS LINE:
    // renderFilteredBlueprints(blueprints); 

    if (spinner) spinner.style.display = "none";
  } catch (err) {
    console.error("Failed to load blueprint list:", err);
  }
}

// ================= MAIN INITIALIZATION =================
async function initCaches() {
    console.log("🟢 Starting cache population for web version...");

    await Promise.all([
        populateWeaponCache(),
        populateAmplifierCache(),
        populateVisionCache(),
        populateScopeCache(),
        populateAbsorberCache(),
        populateRingCache(),
        populateAllClothesCache(),
        populateFAPCache(),
        populateMiningCache(),
		populateMaterialsCache(),
        populateRefiningCache(),
        populateArmorsCache()
    ]);

    syncCachesToWindow();

    console.log("✅ All caches populated successfully for web version.");
}



window.initCaches = initCaches;
// ================= Event Listeners =================
function updateStatusElements() {
  const text = USE_LOCAL_DATA ? "📂 Local Storage" : "🌐 EntropiaNexus API";
  document.querySelectorAll(".NexusAPIstatus").forEach(el => el.textContent = text);
  appendData(`> Pixelbot: We are Currently sourcing data from ${text}`);
}

// Call on load
document.addEventListener("DOMContentLoaded", async () => {
  USE_LOCAL_DATA = localStorage.getItem('USE_LOCAL_DATA') !== 'false';
  window.USE_LOCAL_DATA = USE_LOCAL_DATA;
  updateStatusElements(); // update immediately
  //await initCaches();

  const dataSourceButton = document.getElementById("DataSourceToggle");

  dataSourceButton.addEventListener("click", () => {
	toggleDataSource(dataSourceButton.getAttribute("data-toggle"));
	updateStatusElements(); // update when toggled
  });
});


//=====================================================
//============crafting buddy api junk ========================
//====================================================

 
//let cachedBlueprints = [];

function fuzzyMatch(pattern, text) {
  pattern = pattern.toLowerCase();
  text = text.toLowerCase();

  let patternIdx = 0;
  let textIdx = 0;

  while (patternIdx < pattern.length && textIdx < text.length) {
    if (pattern[patternIdx] === text[textIdx]) {
      patternIdx++;
    }
    textIdx++;
  }

  return patternIdx === pattern.length;
}

function renderAllBlueprintsList(filteredList) {
  const container = document.getElementById("allBlueprintsList");
  
  // Optimization: Only show the first 100 matches to prevent UI freezing
  const topResults = filteredList.slice(0, 100);

  const html = topResults.map(bp => `
    <div class="bp-list-item" data-name="${bp.Name.replace(/"/g, '&quot;')}">
      ${bp.Name}
    </div>
  `).join('');

  container.innerHTML = html || '<div class="no-results">No blueprints found</div>';
}

function loadBlueprint(index) {
  const saved = JSON.parse(localStorage.getItem('blueprints') || '[]');
  const bp = saved[index];
  if (!bp) return;

  document.getElementById('itemName').value = bp.bpName;
  document.getElementById('maxTT').value = bp.maxTT;
  document.getElementById('bpType').value = bp.bpType;
  document.getElementById('bpMu').value = bp.bpMu;
  document.getElementById('sellMu').value = bp.sellMu;
  document.getElementById('successRate').value = bp.successRate;
  document.getElementById('residuePerSuccess').value = bp.residuePerSuccess;
  document.getElementById('clicks').value = bp.clicks;
  document.getElementById('bpBook').value = bp.bpBook || '';

  document.getElementById('materials').innerHTML = '';
  materialIndex = 0;
  bp.materials.forEach(m => addMaterial(m.name, m.qty, m.tt, m.mu));
  toggleBpMuField();
  const clicksInput = document.getElementById('clicks');
  let clicks = parseInt(clicksInput.value);
  if (typeof window.calculate === 'function') {
    window.calculate();
  } else {
    console.warn("CraftingBuddy not yet loaded. Skipping calculation.");
  }
}

function resetBlueprintFieldsNoBlanks() {
  document.querySelectorAll('.eu-blueprint input').forEach(input => {
    if (input.id === 'materialFilter') return; // ✅ Don't clear this input

    if (input.type === 'number') input.value = '';
    if (input.type === 'text') input.value = '';
	const clicksInput = document.getElementById('clicks');
	let clicks = parseInt(clicksInput.value);

	if (!clicks || clicks < 1) {
	  clicks = 1;
	  clicksInput.value = 1; // Update the field visually
	}
  });

  document.querySelectorAll('.eu-blueprint select').forEach(select => {
    select.selectedIndex = 0;
  });

  document.getElementById('successRate').value = 38;
  document.getElementById('nearSuccessRate').value = 50;
  document.getElementById('failRate').value = 12;

  const qvscSlider = document.getElementById('qvsc');
  qvscSlider.value = 0;
  document.getElementById('qvscLabel').innerText = '0%';
  updateRatesFromSlider();

  const materialsContainer = document.getElementById('materials');
  materialsContainer.innerHTML = '';

  if (typeof materialIndex !== 'undefined') {
    materialIndex = 0;
  }
}


function multiFieldFilter(query, blueprints) {
  const lowerQuery = query.toLowerCase();

  // Handle level:x input for filtering by level
  if (lowerQuery.startsWith("level:")) {
    const level = parseInt(lowerQuery.split(":")[1]);
    if (!isNaN(level)) {
      return blueprints.filter(bp => bp.Properties?.Level === level);
    }
  }

  return blueprints.filter(bp => {
    return (
      bp.Name.toLowerCase().includes(lowerQuery) ||
      (bp.Product?.Name?.toLowerCase().includes(lowerQuery)) ||
      (bp.Properties?.Type?.toLowerCase().includes(lowerQuery)) ||
      (bp.Profession?.Name?.toLowerCase().includes(lowerQuery)) ||
      (bp.Book?.Name?.toLowerCase().includes(lowerQuery)) ||
      bp.Materials?.some(mat => mat.Item.Name.toLowerCase().includes(lowerQuery))
    );
  });
}

function renderFilteredBlueprints(filteredList) {
  const datalist = document.getElementById("bpList");
  datalist.innerHTML = "";
  filteredList.forEach(bp => {
    const option = document.createElement("option");
    option.value = bp.Name;
    datalist.appendChild(option);
  });
}

function showMarkupReminder() {
  const popup = document.getElementById("markupReminderPopup");

  // Check if user previously disabled the popup
  const disabled = localStorage.getItem("disableMarkupReminder");
  if (popup && !disabled) {
    popup.style.display = "block";
  }
}

function closeReminderPopup() {
  document.getElementById("markupReminderPopup").style.display = "none";
}

function disableReminderPopup() {
  localStorage.setItem("disableMarkupReminder", "true");
  closeReminderPopup();
}
function resetMarkupReminder() {
  localStorage.removeItem("disableMarkupReminder");
}

async function loadBlueprintByName(name, silent = false) {
  try {
    let bp;
    const searchName = name.trim();

    if (USE_LOCAL_DATA) {
      // Find the blueprint in the already loaded local cache (Case-Insensitive)
      bp = cachedBlueprints.find(b => b.Name.toLowerCase() === searchName.toLowerCase());
    } else {
      // Fetch specifically from the API
      const res = await fetch("https://api.entropianexus.com/blueprints/" + encodeURIComponent(searchName));
      bp = await res.json();
    }

    if (!bp) throw new Error(`Blueprint data for "${searchName}" not found`);

    // Reset UI fields before loading new data
    resetBlueprintFieldsNoBlanks();

    // Populate Main BP Info
    document.getElementById("blueprintNameField").value = bp.Name || bp.Product?.Name || '';
    document.getElementById("bpBook").value = bp.Book?.Name || '';
    document.getElementById("bpLevel").value = bp.Properties?.Level || 0;
    document.getElementById("bpType").value = "Unlimited";
    document.getElementById("bpMu").value = 105;
    document.getElementById("qr").value = 1;
    document.getElementById("sellMu").value = 101;

    // Calculate Max TT from materials
    const totalTT = bp.Materials.reduce((sum, mat) => {
      const unitTT = mat.Item?.Properties?.Economy?.MaxTT || 0;
      return sum + mat.Amount * unitTT;
    }, 0);
    document.getElementById("maxTT").value = totalTT.toFixed(2);

    // Add individual materials
    bp.Materials.forEach((mat) => {
      const matName = mat.Item?.Name || "Unknown Material";
      const qty = mat.Amount || 1;
      const tt = mat.Item?.Properties?.Economy?.MaxTT || 0.01;
      const mu = 100; // Standardize to 100 for cost lookup
      addMaterial(matName, qty, tt, mu);
    });

    // Trigger calculation engine
    if (typeof window.calculate === 'function') {
      window.calculate();
    } else {
      console.warn("CraftingBuddy not yet loaded. Skipping calculation.");
    }

    // Only show reminder if not in silent mode (importer)
    if (!silent && typeof showMarkupReminder === "function") {
      showMarkupReminder();
    }

    return true; // Success

  } catch (err) {
    console.error("Failed to load blueprint data:", err);
    if (!silent) {
      alert("Failed to load blueprint: " + name);
    }
    return false; // Failure
  }
}
// New & improved change listener
document.getElementById("materialFilter").addEventListener("change", async (e) => {
    const name = e.target.value;
    const match = cachedBlueprints.find(bp => bp.Name === name);
    if (match) {
        await loadBlueprintByName(name);
    }
});


let filterTimeout;
document.getElementById("materialFilter").addEventListener("input", (e) => {
  const query = e.target.value.trim();
  
  clearTimeout(filterTimeout);
  filterTimeout = setTimeout(() => {
      const filtered = query
        ? multiFieldFilter(query, cachedBlueprints)
        : cachedBlueprints;

      // REMOVE THIS: This is what creates the unnecessary popup
      // renderFilteredBlueprints(filtered); 

      // KEEP THIS: This renders your nice custom list
      renderAllBlueprintsList(filtered);

  }, 200); 
});

document.getElementById("showAllBlueprintsBtn").addEventListener("click", () => {
  const list = document.getElementById("allBlueprintsList");
  const btn = document.getElementById("showAllBlueprintsBtn");

  list.classList.toggle("hidden");

  if (!list.classList.contains("hidden")) {
    renderAllBlueprintsList(cachedBlueprints);  // render first
    btn.classList.add("active");                // activate after rendering
  } else {
    btn.classList.remove("active");             // turn off when hidden
  }
});




document.addEventListener('DOMContentLoaded', () => {
  populateNexusDropdown();
  initCaches();
  const btn = document.getElementById("showAllBlueprintsBtn");
  btn.classList.add("active");
  btn.classList.remove("active");
// This handles clicks for every blueprint in the list efficiently
  const allBpsContainer = document.getElementById("allBlueprintsList");
  if (allBpsContainer) {
    allBpsContainer.addEventListener('click', (e) => {
        const item = e.target.closest('.bp-list-item');
        if (item) {
            const bpName = item.getAttribute('data-name');
            loadBlueprintByName(bpName);
            if (DEBUG) console.log(`[Nexus API] Loading: ${bpName}`);
        }
    });
  }
  
  
	const listContainer = document.getElementById('blueprintList');
	if (listContainer) {
		listContainer.addEventListener('click', (e) => {
			const clickable = e.target.closest('.bp-clickable');
			const deleteBtn = e.target.closest('.delete-bp');

			if (clickable) {
				const index = clickable.getAttribute('data-index');
				loadBlueprint(parseInt(index));
			}

			if (deleteBtn) {
				e.stopPropagation();
				const index = deleteBtn.getAttribute('data-index');
				if(confirm("Delete this blueprint?")) {
					deleteBlueprint(parseInt(index));
					//renderBlueprintList(); // Refresh list
				}
			}
		});
	}
  
    syncCachesToWindow();
});


/*
 * Core Logic for comparing Local vs API data
 */
async function runSyncDiff(endpoint, localFile) {
    const startTime = performance.now();
    
    try {
        const [localDataRaw, apiDataRaw] = await Promise.all([
            window.electronAPI.loadNexusJSON(localFile).catch(() => []),
            fetch(window.BASE_URL + endpoint)
                .then(res => res.json())
                .then(d => Array.isArray(d) ? d : d.items || [])
                .catch(() => [])
        ]);

        const localData = Array.isArray(localDataRaw) ? localDataRaw : (localDataRaw?.items || []);
        const apiData = Array.isArray(apiDataRaw) ? apiDataRaw : (apiDataRaw?.items || []);

        // --- NEW KEY GENERATOR ---
        const getUniqueKey = (item) => {
            if (!item || !item.Name) return null;
            // Only use complex keys for locations to prevent name-clashes
            if (endpoint === 'locations') {
                const id = item.Id || item.id || 'no-id';
                const type = (item.Properties?.Type || item.type || 'no-type').toLowerCase();
                return `${item.Name.toLowerCase()}|${id}|${type}`;
            }
            return item.Name; // Default behavior for other categories
        };

        const localMap = new Map();
        localData.forEach(item => {
            const key = getUniqueKey(item);
            if (key) localMap.set(key, item);
        });

        const apiMap = new Map();
        apiData.forEach(item => {
            const key = getUniqueKey(item);
            if (key) apiMap.set(key, item);
        });

        const results = {
            endpoint,
            missingLocally: [],
            missingOnAPI: [],
            countAPI: apiData.length,
            countLocal: localData.length
        };

        // Compare using the new keys
        for (const apiItem of apiData) {
            const key = getUniqueKey(apiItem);
            if (key && !localMap.has(key)) {
                results.missingLocally.push(apiItem.Name);
            }
        }

        for (const localItem of localData) {
            const key = getUniqueKey(localItem);
            if (key && !apiMap.has(key)) {
                results.missingOnAPI.push(localItem.Name);
            }
        }

        const duration = (performance.now() - startTime).toFixed(2);
        console.log(`%c[Sync] ${endpoint} checked in ${duration}ms`, 'color: #00d4ff');
        return results;

    } catch (err) {
        console.error(`[Sync:ERROR] Failed to run diff for ${endpoint}:`, err);
        return { endpoint, missingLocally: [], missingOnAPI: [], countAPI: 0, countLocal: 0 };
    }
}
const NEXUS_REGISTRY = [
    { name: 'Items', ep: 'items', file: 'items.json' },
    { name: 'Blueprints', ep: 'blueprints', file: 'blueprints.json' },
    { name: 'Weapons', ep: 'weapons', file: 'weapons.json' },
    { name: 'Amplifiers', ep: 'weaponamplifiers', file: 'amplifiers.json' },
    { name: 'Clothing', ep: 'clothings', file: 'clothings.json' },
    { name: 'Absorbers', ep: 'absorbers', file: 'absorbers.json' },
    { name: 'Excavators', ep: 'excavators', file: 'excavators.json' },
    { name: 'Finders', ep: 'finders', file: 'finders.json' },
    { name: 'Med Chips', ep: 'medicalchips', file: 'medicalchips.json' },
    { name: 'Med Tools', ep: 'medicaltools', file: 'medicaltools.json' },
    { name: 'Finder Amps', ep: 'finderamplifiers', file: 'finderamplifiers.json' },
    { name: 'Scopes and Sights', ep: 'weaponvisionattachments', file: 'weaponvisionattachments.json' },
    { name: 'Teleporters', ep: 'teleporters', file: 'teleporters.json' },
	{ name: 'Locations', ep: 'locations', file: 'locations.json' },
    { name: 'Refining', ep: 'refiningrecipes', file: 'refiningrecipes.json' },
	{ name: 'mobs', ep: 'mobs', file: 'mobs.json' },
	{ name: 'Materials', ep: 'materials', file: 'materials.json' }
];

window.NexusScanner = {
    checkAll: async function() {
        const oldUI = document.getElementById('nexus-scanner-overlay');
        if (oldUI) oldUI.remove();

        const ui = document.createElement('div');
        ui.id = 'nexus-scanner-overlay';
        ui.style = `
            position: fixed; top: 1%; left: 10%; width: 80%; max-height: 93%;
            background: rgba(10, 10, 15, 0.98); color: rgb(191 101 45); z-index: 10000;
            border: 2px solid rgb(73 71 71); padding: 8px; border-radius: 8px;
            font-family: 'Segoe UI', monospace; overflow-y: auto; box-shadow: rgb(6 6 6) -27px 34px 30px;
        `;
       
        ui.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px; border-bottom: 2px solid #00d4ff; padding-bottom: 10px;">
                <h2 style="margin:0;">NEXUS SYNC DASHBOARD</h2>
                <div>
                    <button id="btn-check-all-again" style="background:#00d4ff; color:#000; border:none; padding:8px 15px; cursor:pointer; font-weight:bold; margin-right:10px;">RE-SCAN ALL</button>
                    <button id="btn-close-scanner" style="background:#ff4444; color:white; border:none; padding:8px 15px; cursor:pointer; font-weight:bold;">CLOSE</button>
                </div>
            </div>
            <table style="width:96%; margin: auto; text-align:left; border-collapse: collapse;">
                <thead>
                    <tr style="border-bottom: 1px solid #00d4ff; color: #888;">
                        <th style="padding:10px;">Category</th>
                        <th>API Count</th>
                        <th>Local Count</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="nexus-results-body">
                    <tr><td colspan="5" style="text-align:center; padding:20px;">Scanning data sources...</td></tr>
                </tbody>
            </table>
            <div style="margin-top:25px; padding:15px; border-top: 1px dashed #444; text-align:center; color: #ffcc00; font-weight:bold; letter-spacing:1px;">
                ⚠️ AFTER PATCHING: PLEASE RELOAD THE APP FOR CHANGES TO TAKE EFFECT
            </div>
        `;
        document.body.appendChild(ui);

        // Global buttons
        document.getElementById('btn-check-all-again').addEventListener('click', () => this.checkAll());
        document.getElementById('btn-close-scanner').addEventListener('click', () => ui.remove());

        const tbody = document.getElementById('nexus-results-body');
        tbody.innerHTML = '';

        for (const cat of NEXUS_REGISTRY) {
            const res = await runSyncDiff(cat.ep, cat.file);
            const needsUpdate = res.missingLocally.length > 0;

            const tr = document.createElement('tr');
            tr.style.borderBottom = "1px solid #222";
            tr.innerHTML = `
                <td style="padding:3px; font-weight:bold;">${cat.name}</td>
                <td>${res.countAPI}</td>
                <td>${res.countLocal}</td>
                <td style="color: ${needsUpdate ? '#ff4444' : '#44ff44'}">
                    ${needsUpdate ? 'OUTDATED (' + res.missingLocally.length + ')' : 'UP TO DATE'}
                </td>
                <td>
                    <button id="refresh-${cat.ep}-${cat.file.replace('.json','')}" 
                            style="cursor:pointer; background:transparent; border:1px solid #00d4ff; color:#00d4ff; padding:4px 8px; margin-right:5px; font-size:10px;">
                        REFRESH
                    </button>
                    <button id="patch-${cat.ep}-${cat.file.replace('.json','')}" 
                            style="cursor:pointer; background:#00d4ff; border:none; color:#000; padding:5px 12px; font-weight:bold;">
                        PATCH
                    </button>
                </td>
            `;
            tbody.appendChild(tr);

            // Use unique button IDs to prevent conflicts (especially between Items and Materials)
            const refreshBtn = document.getElementById(`refresh-${cat.ep}-${cat.file.replace('.json','')}`);
            const patchBtn   = document.getElementById(`patch-${cat.ep}-${cat.file.replace('.json','')}`);

            if (refreshBtn) {
                refreshBtn.addEventListener('click', async () => {
                    refreshBtn.innerText = "Checking...";
                    await this.check(cat.name);
                    this.checkAll();
                });
            }

            if (patchBtn) {
                patchBtn.addEventListener('click', () => {
                    this.patch(cat.name);
                });
            }
        }
    },

    check: async function(name) {
        const cat = NEXUS_REGISTRY.find(c => 
            c.name.toLowerCase() === name.toLowerCase() || 
            c.ep === name
        );
        if (!cat) return;
        const res = await runSyncDiff(cat.ep, cat.file);
        console.table(res);
        return res;
    },
	patch: async function(name) {
        const cat = NEXUS_REGISTRY.find(c => c.name.toLowerCase() === name.toLowerCase() || c.ep === name);
        if (!cat) return;

        console.log(`%c[Nexus] Starting Patch for ${cat.name}...`, 'color: #00d4ff; font-weight: bold;');

        const [localDataRaw, apiDataRaw] = await Promise.all([
            window.electronAPI.loadNexusJSON(cat.file).catch(() => []),
            fetch(window.BASE_URL + cat.ep)
                .then(res => res.json())
                .then(d => Array.isArray(d) ? d : d.items || [])
                .catch(() => [])
        ]);

        const localData = Array.isArray(localDataRaw) ? localDataRaw : [];
        const apiData = Array.isArray(apiDataRaw) ? apiDataRaw : [];

        const getUniqueKey = (item) => {
            if (!item || !item.Name) return null;
            if (cat.ep === 'locations') {
                const id = item.Id || item.id || 'no-id';
                const type = (item.Properties?.Type || item.type || 'no-type').toLowerCase();
                return `${item.Name.toLowerCase()}|${id}|${type}`;
            }
            return item.Name;
        };

        // Counters and Tracking
        const stats = {
            newFromAPI: [],
            updated: [],
            localOnly: []
        };

        const mergedMap = new Map();
        
        // 1. Load Local Data into Map
        localData.forEach(item => {
            const key = getUniqueKey(item);
            if (key) mergedMap.set(key, { ...item, _source: 'local' });
        });

        // 2. Merge API Data and Track Changes
        apiData.forEach(apiItem => {
            const key = getUniqueKey(apiItem);
            if (!key) return;

            if (mergedMap.has(key)) {
                // It exists locally - update it
                const existing = mergedMap.get(key);
                mergedMap.set(key, { ...existing, ...apiItem, _source: 'merged' });
                stats.updated.push(apiItem.Name);
            } else {
                // It's brand new from the API
                mergedMap.set(key, { ...apiItem, _source: 'api' });
                stats.newFromAPI.push(apiItem.Name);
            }
        });

        // 3. Identify Local-Only (The "Extra Shits")
        mergedMap.forEach((value, key) => {
            if (value._source === 'local') {
                stats.localOnly.push(value.Name);
            }
            // Clean up the internal helper property before saving
            delete value._source;
        });

        // --- THE BREAKDOWN LOG ---
        console.group(`%c📊 MERGE BREAKDOWN: ${cat.name}`, 'color: #ffcc00; font-size: 12px;');
        console.log(`Total Local Records: ${localData.length}`);
        console.log(`Total API Records:   ${apiData.length}`);
        console.log(`Final Merged Total:  ${mergedMap.size}`);
        
        if (stats.newFromAPI.length > 0) {
            console.log(`%c[+] NEW FROM API (${stats.newFromAPI.length}):`, 'color: #00ff9c;', stats.newFromAPI);
        }
        if (stats.localOnly.length > 0) {
            console.log(`%c[!] LOCAL ONLY / CUSTOM (${stats.localOnly.length}):`, 'color: #ff4444;', stats.localOnly);
        }
        if (stats.updated.length > 0) {
            console.log(`%c[*] UPDATED/SYNCED (${stats.updated.length}):`, 'color: #00d4ff;');
        }
        console.groupEnd();

        // 4. Download Process
        const finalData = Array.from(mergedMap.values());
        const blob = new Blob([JSON.stringify(finalData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = cat.file;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        alert(`${cat.name} Patched!\n\nNew: ${stats.newFromAPI.length}\nUpdated: ${stats.updated.length}\nLocal-only Kept: ${stats.localOnly.length}\n\nCheck Console (F12) for details.`);
    }
};

/**
 * Merge teleporters.json into locations.json
 * Shows stats first, then lets you download the merged file
 */

async function mergeTeleportersIntoLocations() {
    const mergeBtn = document.getElementById('mergeTeleportersBtn');
    const messageEl = document.getElementById('mergeMessages');

    try {
        if (mergeBtn) mergeBtn.disabled = true;
        if (messageEl) messageEl.innerHTML = "🔄 Analyzing differences...";

        const locationsRaw = await getData('locations', 'locations.json');
        const teleportersRaw = await getData('teleporters', 'teleporters.json');

        // 1. Isolate only Teleporters from the massive locations.json
        const locationsTeleporters = locationsRaw.filter(item => 
            (item.Properties?.Type || "").toLowerCase().includes('teleporter')
        );

        // 2. Create Unique Keys for Comparison (Planet + Name + Type)
        const getSig = (item) => `${item.Planet?.Name || item.PlanetName || ''}|${item.Name || ''}|teleporter`.toLowerCase();

        const localKeys = new Set(locationsTeleporters.map(getSig));
        const apiKeys = new Set(teleportersRaw.map(getSig));

        // 3. Find the "Extra Shits" (In Local but NOT in API)
        const extraInLocal = locationsTeleporters.filter(item => !apiKeys.has(getSig(item)));
        
        // 4. Find the Missing Shits (In API but NOT in Local)
        const missingFromLocal = teleportersRaw.filter(item => !localKeys.has(getSig(item)));

        // --- THE REPORTING SECTION ---
        console.group("%c🛰️ TELEPORTER DIFF REPORT", "color: #ffcc00; font-weight: bold; font-size: 12px;");
        console.log(`Local Teleporters: ${locationsTeleporters.length}`);
        console.log(`API Teleporters: ${teleportersRaw.length}`);
        
        if (extraInLocal.length > 0) {
            console.log(`%c[!] Found ${extraInLocal.length} items locally that aren't on the API:`, "color: #ff4444; font-weight: bold;");
            extraInLocal.forEach(item => {
                const lat = item.Properties?.Coordinates?.Latitude || item.Latitude || 0;
                const lon = item.Properties?.Coordinates?.Longitude || item.Longitude || 0;
                console.log(`   > "${item.Name}" on ${item.Planet?.Name} [${lon}, ${lat}]`);
            });
        }

        if (missingFromLocal.length > 0) {
            console.log(`%c[+] Found ${missingFromLocal.length} items on API to be added:`, "color: #00ff9c; font-weight: bold;");
            missingFromLocal.forEach(item => console.log(`   > "${item.Name}" (${item.Planet?.Name || item.PlanetName})`));
        }
        console.groupEnd();

        // 5. Update UI
        if (messageEl) {
            messageEl.innerHTML = `
                Local: <b>${locationsTeleporters.length}</b> | API: <b>${teleportersRaw.length}</b><br>
                <span style="color:#ff4444">Custom/Extra: <b>${extraInLocal.length}</b></span><br>
                <span style="color:#00ff9c">New to Add: <b>${missingFromLocal.length}</b></span>
            `;
        }

        if (missingFromLocal.length === 0) {
            if (mergeBtn) mergeBtn.textContent = "✅ Fully Synced";
            return;
        }

        // 6. Confirmation Logic
        const confirmMerge = confirm(
            `DIFF DETECTED:\n\n` +
            `- You have ${extraInLocal.length} local-only items (these will be KEPT).\n` +
            `- There are ${missingFromLocal.length} new items from the API to add.\n\n` +
            `Proceed with merging the ${missingFromLocal.length} new items?`
        );

        if (!confirmMerge) return;

        // Perform Merge (Keeping everything local + adding missing API items)
        const convertedMissing = missingFromLocal.map(tp => ({
            Id: tp.Id || `tp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            Name: tp.Name || "Unknown Teleporter",
            Planet: tp.Planet || { Name: tp.PlanetName || "Unknown" },
            Properties: {
                Type: "Teleporter",
                Coordinates: {
                    Latitude: tp.Properties?.Coordinates?.Latitude || tp.Latitude || 0,
                    Longitude: tp.Properties?.Coordinates?.Longitude || tp.Longitude || 0
                }
            }
        }));

        const mergedData = [...locationsRaw, ...convertedMissing];

        // Download logic remains same...
        const blob = new Blob([JSON.stringify(mergedData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'locations_merged.json';
        a.click();
        URL.revokeObjectURL(url);

    } catch (err) {
        console.error("❌ Merge failed:", err);
    } finally {
        if (mergeBtn) mergeBtn.disabled = false;
    }
}
 
 // Add this once during initialization (e.g. at the end of your init function)
// Setup function - call this once during initialization
function setupMergeTeleportersButton() {
    const mergeBtn = document.getElementById('mergeTeleportersBtn');
    const messageEl = document.getElementById('mergeMessages');

    if (!mergeBtn) return;

    // Click listener
    mergeBtn.addEventListener('click', () => {
        mergeTeleportersIntoLocations();
    });

    // Auto-check on load and update button text
    async function checkMergeStatus() {
        try {
            const locationsRaw = await getData('locations', 'locations.json');
            const teleportersRaw = await getData('teleporters', 'teleporters.json');

            const locationsTeleporters = locationsRaw.filter(item => 
                (item.Properties?.Type || "").toLowerCase().includes('teleporter')
            );

            const existingNames = new Set(
                locationsTeleporters.map(item => 
                    `${item.Planet?.Name || ''}|${item.Name || ''}`.toLowerCase()
                )
            );

            const missingCount = teleportersRaw.filter(tp => {
                const key = `${tp.Planet?.Name || ''}|${tp.Name || ''}`.toLowerCase();
                return !existingNames.has(key);
            }).length;

            if (missingCount === 0) {
                mergeBtn.textContent = "✅ No merge needed";
                mergeBtn.disabled = true;
                if (messageEl) messageEl.innerHTML = "✅ All teleporters are already in locations.json";
            } else {
                mergeBtn.textContent = `🔄 Merge Teleporters (${missingCount} missing)`;
                if (messageEl) messageEl.innerHTML = `${missingCount} teleporters missing from locations.json`;
            }
        } catch (e) {
            console.warn("Could not check merge status on load");
        }
    }

    // Run check on load
    checkMergeStatus();

    console.log("✅ Merge teleporters button + auto-check initialized");
}
// Wait for the DOM to be ready, then attach the listener to your HTML button
document.addEventListener('DOMContentLoaded', () => {
	setupMergeTeleportersButton();
    const syncBtn = document.getElementById('nexus-sync-launcher');
    
    if (syncBtn) {
        syncBtn.addEventListener('click', async () => {
            // This mirrors exactly what happens when you type it in the console
            await window.NexusScanner.checkAll();
        });
    }
});
if (DEBUG) console.log("Current Data Source. Local?", USE_LOCAL_DATA);
if (DEBUG) console.log('NexusAPI 2.0 script loaded with proper caching and globals');
// Initial sync on script load


// 1. ADD THIS AT THE VERY BOTTOM OF entropianexusapi.js
function syncCachesToWindow() {
    window.cachedWeapons = cachedWeapons;
    window.cachedAmplifiers = cachedAmplifiers;
    window.cachedVisionAttachments = cachedVisionAttachments;
    window.cachedScopes = cachedScopes;
    window.cachedAbsorbers = cachedAbsorbers;
    window.cachedBlueprints = cachedBlueprints;
    window.cachedClothes = cachedClothes;
    window.cachedMedicalTools = cachedMedicalTools;
    window.cachedMedicalChips = cachedMedicalChips;
    window.cachedMaterials = cachedMaterials;
    window.cachedArmors = cachedArmors;
    // Mining Data
    window.cachedFinders = cachedFinders;
    window.cachedFinderAmps = cachedFinderAmps;
    window.cachedExcavators = cachedExcavators;

    console.log("🔗 Global caches synchronized to window.");
}

syncCachesToWindow();