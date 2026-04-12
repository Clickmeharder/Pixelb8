let guiDebug = false;

let overlayPreferences = {
    lastLoadoutName: '',
	lastFinderName: '',
    lastAmpName: '',
    lastExtractorName: '',
    lastFinderMU: 100,
    lastAmpMU: 100,
    lastExtractorMU: 100,
	showToolTypeIcon: true,
    useGlobalCooldown: true, // Cooldown Setting
    loadoutCooldownMs: 1250, // EU standard timing
    panels: { graph: true, hunt: true, combat: true, stats: true, skills: true, hof: true, pickups: true, crafting: true, mining: true, rings: true, dbuffcooldown: true },
    fields: {
		mining: { drops: true, totalCost: true, totalReturns: true, returnPct: true, avgReturn: true },
        crafting: { clicks: true, successes: true, nearSuccesses: true, fails: true, qrIncrease: true, loot: true, returnPct: true, totalCostPerClickPEC: true, totalCost: true, totalLoots: true },
        hunt: { globals: true, hofs: true, returnPCT: true, clickCost: true, totalCost: true, totalCostPerUsePEC: true, totalLoots: true, totalReturns: true },
        combat: { totalShots: true, crits: false, misses: false, totalDamage: true, enemyEvadeCount: false, enemyDodgeCount: false },
        stats: { damageDealt: true, damageTaken: true, heals: false, totalLoots: true, enhancersBroken: true, loot: true, universalAmmo: true, deathCount: false, healTimes: false },
        skills: { skills: true },
        pickupStats: { sweatGains: true, fruits: true, stones: true, commonDung: true, crudeOil: true, motorheadKegs: false, brokenElysianTechnology: false, rewardTokensLimeGreen: false, nawaFragments: false },
		rings: { leftRing: true, rightRing: true },
		dbuffcooldown: { timer: true, stacks: true }
    },
    bounds: { width: 180, height: 401, x: 50, y: 50 }
};
let finderIsEquipped = false;
window.finderIsEquipped = finderIsEquipped;
let extractorIsEquipped = false;
window.extractorIsEquipped = extractorIsEquipped;
let mainFapIsEquipped = false;
window.mainFapIsEquipped = mainFapIsEquipped;
let secondaryFapIsEquipped = false;
window.secondaryFapIsEquipped = secondaryFapIsEquipped;
let lastFinderUseTime = 0;
window.lastHotkeySwitchTime = 0;
//let lastHotkeySwitchTime = 0; // Tracks hardware hotkey timing
window.overlayPreferences = overlayPreferences;

// --- INITIALIZATION ---
(async () => {
    const saved = await window.electronAPI.loadOverlayPrefs();
    if (saved) {
        overlayPreferences = { 
            ...overlayPreferences, 
            ...saved, 
            panels: { ...overlayPreferences.panels, ...(saved.panels || {}) },
            fields: { ...overlayPreferences.fields, ...(saved.fields || {}) },
            bounds: { ...overlayPreferences.bounds, ...(saved.bounds || {}) },
            panelPositions: saved.panelPositions || {}
        };

        // Re-link to window scope
        window.overlayPreferences = overlayPreferences;

        if (overlayPreferences.bounds) {
            window.electronAPI.send('update-overlay-bounds', overlayPreferences.bounds);
        }
    }
    
    applyOverlayPreferences();

    if (!window.loadouts) {
        window.loadouts = await window.electronAPI.getLoadouts();
		if (guiDebug) console.log("🔹 appgui-Global loadouts populated:", window.loadouts);
    }
    renderLoadoutDropdown(window.loadouts);
	populateKeybindLoadoutSelects();
	populateKeybindRingSelects();
})();

window.initOverlayUI = async () => {
    const saved = await window.electronAPI.loadOverlayPrefs();
    if (saved) {
		overlayPreferences = { 
            ...overlayPreferences, 
            ...saved, 
            panels: { ...overlayPreferences.panels, ...(saved.panels || {}) },
            fields: { ...overlayPreferences.fields, ...(saved.fields || {}) },
            bounds: { ...overlayPreferences.bounds, ...(saved.bounds || {}) },
            panelPositions: saved.panelPositions || {}
        };

        window.overlayPreferences = saved; 
    }
    applyOverlayPreferences();
    // Don't fetch loadouts here; let the LoadoutSystem handle it
};

async function startApp() {
    window.isSystemInitializing = true; // 🤐 SILENCE START
    console.log("🚀 Starting Master Bootloader...");

    // 1. Load Preferences
    await window.initOverlayUI();

    // 2. Prepare Data (Only call initDropdowns ONCE here)
    await window.initLoadoutSystem(); 

    // 3. Restore Items
    if (window.initializeRingsFromSettings) {
        await window.initializeRingsFromSettings();
    }
    const lastLoadoutName = window.overlayPreferences?.lastLoadoutName;
    if (lastLoadoutName && typeof selectLoadout === 'function') {
        selectLoadout(lastLoadoutName, window.loadouts);
    }
    


    // 4. Start Chat (Pass 'false' or a flag to skip its internal dropdown init)
    await window.initChatSnooper(); 

	await initializeFapsFromSettings();
    window.isSystemInitializing = false; // 🔊 SILENCE END
    
    // 🔥 FINAL SYNC
    if (window.updateCalculations) window.updateCalculations(true);
}
// Kick it off once
startApp();

function getDynamicCooldown() {
    const prefs = window.overlayPreferences || {};
    const now = Date.now();
    
    const defaultCD = prefs.loadoutCooldownMs || 1250;
    const snappyCD = 400;      // Default EU weapon swap speed
    const idleThreshold = 2000; // 2 seconds of inactivity = "Idle"

    // 🟢 TIER 1: IDLE CHECK
    // If you haven't switched or acted in 2 seconds, allow a snappy swap.
    const timeSinceLastAction = now - (window.lastHotkeySwitchTime || 0);
    if (timeSinceLastAction > idleThreshold) {
        if (guiDebug) console.log(`[Cooldown] Idle detected. Snappy swap: ${snappyCD}ms`);
        return snappyCD;
    }

    // 🟢 TIER 2: FINDER SPECIALIST CHECK
    // If finder is equipped, use its specific UPM cooldown
    if (window.finderIsEquipped) {
        const m = window.miningLoadout || {};
        const upm = m.finder?.Properties?.General?.UsesPerMinute || 15;
        const finderCooldownMs = (60 / upm) * 1000;
        
        if (guiDebug) console.log(`[Cooldown] Finder Active: ${finderCooldownMs.toFixed(0)}ms`);
        return finderCooldownMs;
    }

    // 🟢 TIER 3: COMBAT APM CHECK
    const isOtherSpecialist = 
        window.extractorIsEquipped || 
        window.mainFapIsEquipped || 
        window.secondaryFapIsEquipped;

    if (!isOtherSpecialist && window.loadoutStats && window.loadoutStats.apm > 0) {
        const calculatedCD = (60 / window.loadoutStats.apm) * 1000;
        if (guiDebug) console.log(`[Cooldown] Combat APM: ${calculatedCD.toFixed(0)}ms`);
        return calculatedCD;
    }

    return defaultCD;
}
// --- HELPER: Cooldown Handler for Hotkeys Only ---
function handleHotkeySwitch(targetIndex) {
    const select = document.getElementById('loadoutSelect');
    if (!select || !select.options[targetIndex]) return;

    const prefs = window.overlayPreferences;
    const now = Date.now();

    // 1. Get required wait time
    const requiredCooldown = getDynamicCooldown();

    // 2. Check Cooldown
    if (prefs.useGlobalCooldown) {
        if (now - (window.lastHotkeySwitchTime || 0) < requiredCooldown) {
            if (guiDebug) console.warn(`⏳ Switch blocked. ${requiredCooldown.toFixed(0)}ms required.`);
            
            window.electronAPI.sendToOverlay('overlay-update', { 
                isBlockedAction: true 
            });
            // EXIT EARLY: Do NOT update the timestamp here!
            return; 
        }
    }

    // --- SUCCESS PATH ---
    // Everything below only runs if the cooldown check passes.

    // MINING SAFETY: Reset equipment state
    finderIsEquipped = false;
    extractorIsEquipped = false;
    mainFapIsEquipped = false;
    secondaryFapIsEquipped = false;

    // Execute Switch
    select.selectedIndex = targetIndex;
    selectLoadout(select.value, window.loadouts);
    window.electronAPI.sendToOverlay('loadout-update', { name: select.value });

    // 3. Update timestamp ONLY on successful execution
    window.lastHotkeySwitchTime = now;
}
// --- HELPER: Cooldown Handler for Hotkeys Only ---
function populateKeybindLoadoutSelects() {
    const selects = document.querySelectorAll('.loadout-mapping-select');
    let loadoutNames = [];

    // 🟢 1. Extract names based on data structure
    if (Array.isArray(window.loadouts)) {
        // It's an array: [{name: "Mining"}, {name: "Hunting"}]
        loadoutNames = window.loadouts.map(l => l.name).filter(Boolean);
    } else if (window.loadouts && typeof window.loadouts === 'object') {
        // It's an object where keys are IDs and names are inside
        // e.g., { "1": {name: "Mining"}, "2": {name: "Hunting"} }
        loadoutNames = Object.values(window.loadouts).map(l => l.name).filter(Boolean);
    }

    if (guiDebug) console.log("Extracted Loadout Names:", loadoutNames);

    selects.forEach(select => {
        const action = select.dataset.action;
        
        // 2. Clear and add default
        select.innerHTML = '<option value="none">-- Default --</option>';
        
        // 3. Populate with actual name strings
        loadoutNames.forEach(name => {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = name;
            select.appendChild(opt);
        });

        // 4. Set the previously saved selection
        if (window.overlayPreferences.keybindMappings && window.overlayPreferences.keybindMappings[action]) {
            select.value = window.overlayPreferences.keybindMappings[action];
        }

        // 5. Use .onchange to prevent duplicate listener stacking
        select.onchange = (e) => {
            if (!window.overlayPreferences.keybindMappings) {
                window.overlayPreferences.keybindMappings = {};
            }
            
            window.overlayPreferences.keybindMappings[action] = e.target.value;
            
            if (guiDebug) console.log(`Mapped [${action}] to loadout: ${e.target.value}`);
            
            if (typeof saveOverlayPreferences === 'function') {
                saveOverlayPreferences();
            }
        };
    });
}
async function populateKeybindRingSelects() {
    // 1. Efficient Loading (Lazy Load): 
    // Check if we already have the data globally. If not, fetch it.
    if (!window.cachedClothes || window.cachedClothes.length === 0) {
        if (guiDebug) console.log("Fetching clothes data for keybinds...");
        window.cachedClothes = await getData("clothings", "clothings.json");
    }

    const selects = document.querySelectorAll('.ring-mapping-select');
    
    // 2. Filter our data
    const allRings = window.cachedClothes.filter(item => item.Properties?.Type === "Ring");
    const leftRings = allRings.filter(r => r.Properties?.Slot?.toLowerCase() === "left finger");
    const rightRings = allRings.filter(r => r.Properties?.Slot?.toLowerCase() === "right finger");

    selects.forEach(select => {
        const action = select.dataset.action; 
        const isLeft = action.toLowerCase().includes('left');
        const options = isLeft ? leftRings : rightRings;

        // 3. Clear and add default
        select.innerHTML = '<option value="none">-- None --</option>';

        // 4. Populate
        options.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item.Name;
            opt.textContent = item.Name;
            select.appendChild(opt);
        });

        // 5. Restore saved preference
        if (window.overlayPreferences?.keybindMappings?.[action]) {
            select.value = window.overlayPreferences.keybindMappings[action];
        }

        // 6. Setup Save Listener
        select.onchange = (e) => {
            if (!window.overlayPreferences.keybindMappings) window.overlayPreferences.keybindMappings = {};
            window.overlayPreferences.keybindMappings[action] = e.target.value;
            
            if (guiDebug) console.log(`💍 Mapped [${action}] to: ${e.target.value}`);
            if (typeof saveOverlayPreferences === 'function') saveOverlayPreferences();
        };
    });
}
 document.addEventListener('DOMContentLoaded', () => {
    // 1. Initial Load: Fetch all current keybind labels from the backend
    if (window.electronAPI?.getBinds) {
        window.electronAPI.getBinds().then(binds => {
            Object.keys(binds).forEach(key => {
                const labelElem = document.getElementById(`label-${key}`);
                if (labelElem) labelElem.innerText = binds[key].label || "NOT_SET";
            });
        });
    }

    // 2. Attach Event Listeners for REBIND buttons
    const bindActions = [
        'lockToggle', 'powerToggle', 'startStop', 'pause', 'emergencyReset', 'resizeToggle',
        'prevLoadout', 'nextLoadout', 'loadout1', 'loadout2', 'loadout3', 'loadout4', 
        'loadout5', 'loadout6', 'loadout7', 'loadout8', 'loadout9', 'loadout10',
        'finderEquip', 'finderUnequip', 'extractorEquip', 'mainFap_Equip', 'secondaryFap_Equip', 'useTool',
		'leftRing1', 'leftRing2', 'leftRing3', 'leftRing4', 'rightRing1', 'rightRing2', 'rightRing3', 'rightRing4'
    ];

    bindActions.forEach(action => {
        const btn = document.getElementById(`btn-${action}`);
        if (btn) {
            btn.addEventListener('click', () => {
                const label = document.getElementById(`label-${action}`);
                if (label) {
                    label.innerText = ">>> LISTENING <<<";
                    label.classList.add('blink-text');
                }
                window.electronAPI.startCapture(action);
            });
        }
    });

    // 3. IPC Listeners for Hardware Hotkeys
    if (window.electronAPI?.on) {
        // Cycle Loadouts (Next/Prev)
        window.electronAPI.on('cycle-loadout', (event, direction) => {
            const select = document.getElementById('loadoutSelect');
            if (!select || select.options.length === 0) return;

            let newIndex = select.selectedIndex + direction;
            if (newIndex >= select.options.length) newIndex = 0;
            if (newIndex < 0) newIndex = select.options.length - 1;

            handleHotkeySwitch(newIndex);
        });

        // Specific Loadout Jump (1-10)
        window.electronAPI.on('jump-to-loadout', (event, index) => {
            const actionKey = `loadout${index + 1}`;
            const mappedName = window.overlayPreferences.keybindMappings?.[actionKey];
            const select = document.getElementById('loadoutSelect');
            if (!select) return;

            if (mappedName && mappedName !== "none") {
                const targetIndex = Array.from(select.options).findIndex(opt => opt.value === mappedName);
                if (targetIndex !== -1) {
                    handleHotkeySwitch(targetIndex);
                } else {
                    handleHotkeySwitch(index);
                }
            } else {
                handleHotkeySwitch(index);
            }
        });
		// --- DEDICATED RING LISTENER (TOGGLE LOGIC) ---
		// --- DEDICATED RING LISTENER (STRICT 1750ms GCD) ---
		window.electronAPI.on('ring-kb-action', (event, ringActionName) => {
			const prefs = window.overlayPreferences || {};
			const now = Date.now();
			const GCD_MS = 2150;
			
			// 1. GLOBAL COOLDOWN CHECK
			// This blocks ANY ring action (Equip OR Unequip) if the timer isn't up
			if (prefs.useGlobalCooldown) {
				const timeSinceLastAction = now - (window.lastHotkeySwitchTime || 0);

				if (timeSinceLastAction < GCD_MS) {
					console.warn(`💍 [GCD BLOCKED] Timer: ${timeSinceLastAction}ms / ${GCD_MS}ms`);
					
					// Trigger red shake on overlay
					window.electronAPI.sendToOverlay('equip-ring-action', { 
						ringSlot: ringActionName, 
						ringItemName: "BLOCKED_BY_GCD" 
					});
					return; // Exit early
				}
			}

			const ringName = prefs.keybindMappings?.[ringActionName];
			if (ringName && ringName !== "none") {
				let targetRing = ringName;
				let isUnequipping = false;

				// Toggle Logic
				if (ringActionName.toLowerCase().includes('left')) {
					const currentLeft = window.currentLeftRing?.Name || "None";
					isUnequipping = (currentLeft === ringName);
					targetRing = isUnequipping ? "None" : ringName;
					window.selectLeftring(targetRing);
				} else if (ringActionName.toLowerCase().includes('right')) {
					const currentRight = window.currentRightRing?.Name || "None";
					isUnequipping = (currentRight === ringName);
					targetRing = isUnequipping ? "None" : ringName;
					window.selectRightring(targetRing);
				}

				// 2. UPDATE TIMER ONLY ON SUCCESSFUL EQUIP
				// If we are unequipping, we don't reset the 1750ms timer
				if (!isUnequipping) {
					window.lastHotkeySwitchTime = now;
					console.log("💍 Ring Equipped: Starting GCD timer.");
				} else {
					console.log("💍 Ring Unequipped: GCD timer not reset.");
				}

				// 3. Notify Overlay
				window.electronAPI.sendToOverlay('equip-ring-action', { 
					ringSlot: ringActionName, 
					ringItemName: targetRing 
				});
			}
		});
		window.electronAPI.on('mining-kb-action', (event, action) => {
			const prefs = window.overlayPreferences || {};
			const now = Date.now();
			// --- 1. GLOBAL COOLDOWN CHECK ---
			// We block everything except 'useTool' and 'unequip' (optional, but safer)

		if (prefs.useGlobalCooldown && action !== 'useTool' && action !== 'unequip') {
				const currentGCD = getDynamicCooldown();

				if (now - (window.lastHotkeySwitchTime || 0) < currentGCD) {
					window.electronAPI.sendToOverlay('overlay-update', { isBlockedAction: true });
					return; 
				}
			}
			const m = window.miningLoadout;
			const upm = m.finder?.Properties?.General?.UsesPerMinute || 15;
			const finderCooldownMs = (60 / upm) * 1000;

			const clearAllToolStates = () => {
				window.finderIsEquipped = false;
				window.extractorIsEquipped = false;
				window.mainFapIsEquipped = false;
				window.secondaryFapIsEquipped = false;
			};

			// --- 2. EXECUTE SWITCH ---
			switch(action) {
				case 'equipOrLog':
					if (!window.finderIsEquipped) {
						clearAllToolStates();
						window.finderIsEquipped = true;
						console.log("⛏️ State: Finder Equipped");
						window.lastHotkeySwitchTime = now; // Update GCD Timer
						window.electronAPI.sendToOverlay('loadout-update', { name: "Mining Finder" });
					} else {
						// This uses the Finder's specific internal cooldown (Uses Per Minute)
						if (now - (window.lastFinderUseTime || 0) >= finderCooldownMs) {
							logMiningDrop();
							window.lastFinderUseTime = now;
						}
					}
					break;

				case 'equipExtractor':
					clearAllToolStates();
					window.extractorIsEquipped = true;
					console.log("🚜 State: Extractor Equipped");
					window.lastHotkeySwitchTime = now; // Update GCD Timer
					window.electronAPI.sendToOverlay('loadout-update', { name: "Extractor" });
					break;

				case 'equipMainFap':
					clearAllToolStates();
					window.mainFapIsEquipped = true;
					console.log("❤️ State: Main FAP Equipped");
					window.lastHotkeySwitchTime = now; // Update GCD Timer
					window.electronAPI.sendToOverlay('loadout-update', { name: "Main FAP" });
					break;

				case 'equipSecondaryFap':
					clearAllToolStates();
					window.secondaryFapIsEquipped = true;
					console.log("🩹 State: Secondary FAP Equipped");
					window.lastHotkeySwitchTime = now; // Update GCD Timer
					window.electronAPI.sendToOverlay('loadout-update', { name: "Secondary FAP" });
					break;

				case 'unequip':
					clearAllToolStates();
					console.log("🚫 State: All Tools Unequipped");
					// Usually, unequipping shouldn't trigger a new GCD, 
					// but we update the name so the overlay knows.
					window.electronAPI.sendToOverlay('loadout-update', { name: "Unequipped" });
					break;

				case 'useTool':
					if (window.finderIsEquipped && (now - (window.lastFinderUseTime || 0) >= finderCooldownMs)) {
						logMiningDrop();
						window.lastFinderUseTime = now;
					}
					break;
			}

			syncMiningUI();
			if (window.sendOverlayAll) window.sendOverlayAll();
		});

    }

    // 4. GCD Settings Toggle Listener
    const gcdToggle = document.getElementById('gcd-toggle');
    if (gcdToggle) {
        gcdToggle.checked = window.overlayPreferences.useGlobalCooldown;
        gcdToggle.addEventListener('change', (e) => {
            window.overlayPreferences.useGlobalCooldown = e.target.checked;
            if (typeof saveOverlayPreferences === 'function') saveOverlayPreferences();
        });
    }
	const iconToggle = document.getElementById('show-icons-toggle'); // Match your HTML ID
	if (iconToggle) {
		// Set initial state from loaded prefs
		iconToggle.checked = !!window.overlayPreferences.showToolTypeIcon;

		iconToggle.addEventListener('change', (e) => {
			// 1. Update the local preference object
			window.overlayPreferences.showToolTypeIcon = e.target.checked;
			
			// 2. Save to the JSON file
			if (typeof saveOverlayPreferences === 'function') {
				saveOverlayPreferences();
			}

			// 3. Immediately tell the overlay to update its look
			if (window.electronAPI && window.electronAPI.sendToOverlay) {
				window.electronAPI.sendToOverlay("overlay-prefs-update", window.overlayPreferences);
			}
		});
	}
    // 5. Handle Individual "Unset" (X) Buttons
    document.querySelectorAll('.unset-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const action = btn.getAttribute('data-action');
            if (!action) return;
            
            await window.electronAPI.invoke('reset-binds', 'single-unset', action);
            const label = document.getElementById(`label-${action}`);
            if (label) label.innerText = "NOT_SET";
        });
    });

    // 6. Handle Global Restore Defaults
    const restoreAllBtn = document.getElementById('btn-restore-all');
    if (restoreAllBtn) {
        restoreAllBtn.addEventListener('click', async () => {
            if (!confirm("Restore all keybinds to factory defaults?")) return;
            const newBinds = await window.electronAPI.invoke('reset-binds', 'all-default');
            Object.keys(newBinds).forEach(key => {
                const el = document.getElementById(`label-${key}`);
                if (el) el.innerText = newBinds[key].label;
            });
        });
    }

    // 7. Handle Global Unset All
    const unsetAllBtn = document.getElementById('btn-unset-all');
    if (unsetAllBtn) {
        unsetAllBtn.addEventListener('click', async () => {
            if (!confirm("This will disable ALL hotkeys. Proceed?")) return;
            await window.electronAPI.invoke('reset-binds', 'all-unset');
            document.querySelectorAll('.current-key').forEach(el => {
                el.innerText = "NOT_SET";
            });
        });
    }
});
// 5. Global Listener for Bind Completion
if (window.electronAPI?.onBindComplete) {
    window.electronAPI.onBindComplete((data) => {
        const labelElem = document.getElementById(`label-${data.action}`);
        if (labelElem) {
            labelElem.innerText = data.label;
            labelElem.classList.remove('blink-text');
        }
    });
}

 
function applyOverlayPreferences() {
  // 1. Apply Panel preferences (The main blocks like Hunt, Craft, Mining)
  document.querySelectorAll('.panel-toggle').forEach(cb => {
    const key = cb.dataset.panel;
    cb.checked = overlayPreferences.panels[key] ?? true;
  });

  // 2. Apply Field preferences (The individual stats inside panels)
  document.querySelectorAll('.data-toggle').forEach(cb => {
    // 🟢 UPDATED: Added "mining" to the inclusion list
    const section = [...cb.classList].find(c =>
      ["hunt", "combat", "stats", "skills", "pickupStats", "crafting", "mining", "rings", "dbuffcooldown"].includes(c)
    );
    const field = cb.dataset.field;

    if (section && field) {
      // Check if the specific field for that section exists in preferences
      const savedValue = overlayPreferences.fields[section]?.[field];
      cb.checked = savedValue ?? true; 
    }
  });
  if (typeof populateKeybindLoadoutSelects === 'function') {
        populateKeybindLoadoutSelects();
  }
  if (typeof populateKeybindRingSelects === 'function') {
        populateKeybindRingSelects();
  }
  const iconToggle = document.getElementById('show-icons-toggle');
    if (iconToggle) {
        iconToggle.checked = !!overlayPreferences.showToolTypeIcon;
    }
  if (guiDebug) console.log('Overlay preferences applied to GUI fields (including Crafting and Mining).');
}

function onOverlayCheckboxChange(e) {
  const target = e.target;
  const isPanel = target.classList.contains("panel-toggle");
  const isField = target.classList.contains("data-toggle");

  if (!isPanel && !isField) return;

  let update = {};

  if (isPanel) {
    // Handle toggling an entire panel
    const key = target.dataset.panel;
    overlayPreferences.panels[key] = target.checked;
    update = { panels: { [key]: target.checked } };
    if (guiDebug) console.log(`☑️ Panel toggle: ${key} = ${target.checked}`);
  } else if (isField) {
    // Handle toggling an individual stat field
    // 🟢 UPDATED: Added "mining" to the section detector
    const section = [...target.classList].find(c =>
      ["hunt", "combat", "stats", "skills", "pickupStats", "crafting", "mining", "rings", "dbuffcooldown"].includes(c)
    );
    
    const field = target.dataset.field;
    
    if (section && field) {
        if (!overlayPreferences.fields[section]) overlayPreferences.fields[section] = {};
        overlayPreferences.fields[section][field] = target.checked;
        
        update = { fields: { [section]: { [field]: target.checked } } };
        if (guiDebug) console.log(`☑️ Field toggle: ${section}.${field} = ${target.checked}`);
    }
  }
	// Catch-all for simple top-level preferences
	if (target.id === 'show-icons-toggle') {
        window.overlayPreferences.showToolTypeIcon = target.checked;
        if (guiDebug) console.log(`🛠️ Icon Display set to: ${target.checked}`);
    }
  // Persist the changes to the JSON settings file
  saveOverlayPreferences();

  // Send the live update to the Overlay window immediately
  if (window.electronAPI?.sendToOverlay) {
    // We send the WHOLE object to ensure the overlay has the latest context
    window.electronAPI.sendToOverlay("overlay-prefs-update", overlayPreferences);
  }
}

document.querySelectorAll('.panel-toggle, .data-toggle').forEach(cb => {
  cb.addEventListener('change', onOverlayCheckboxChange);
});

async function saveOverlayPreferences() {
    try {
        if (!overlayPreferences.keybindMappings) overlayPreferences.keybindMappings = {};
        
        // 🟢 UPDATED: Select both types of mapping dropdowns
        document.querySelectorAll('.loadout-mapping-select, .ring-mapping-select').forEach(select => {
            const action = select.dataset.action; // e.g., "loadout1" or "leftRing1"
            if (action) {
                overlayPreferences.keybindMappings[action] = select.value;
            }
        });

        if (guiDebug && (!overlayPreferences.panelPositions || Object.keys(overlayPreferences.panelPositions).length === 0)) {
            console.warn('Saving preferences with no panelPositions!');
        }

        // 1. Save to the JSON file
        await window.electronAPI.saveOverlayPrefs(overlayPreferences);
        
        if (guiDebug) console.log('📂 Overlay preferences saved to disk:', overlayPreferences);

        // 2. Notify the overlay window
        if (window.electronAPI?.sendToOverlay) {
            window.electronAPI.sendToOverlay('overlay-prefs-update', overlayPreferences);
        }
    } catch (err) {
        console.error("Failed to save overlay preferences:", err);
    }
}
// Optional: If you want to force a full refresh on certain actions
// window.electronAPI.sendToOverlay?.('overlay-refresh', overlayPreferences);


// --- [APP_GUI // STAT TAB LOGIC] ---

const statTabButtons = document.querySelectorAll(".stat-tab-btn");
// Note: We don't query statSections globally here anymore to avoid cross-talk

statTabButtons.forEach(btn => {
    btn.addEventListener("click", () => {
        const target = btn.dataset.stat;
        
        // --- FIX 1: SCOPED BUTTON RESET ---
        // Find the specific tab bar this button belongs to
        const parentTabGroup = btn.parentElement;
        parentTabGroup.querySelectorAll(".stat-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        // --- FIX 2: SCOPED SECTION SHOW/HIDE ---
        // Find the content container related to THIS specific group
        // We look for the next sibling or the closest wrapper
        const contentContainer = parentTabGroup.nextElementSibling; 
        if (!contentContainer) return;

        const localSections = contentContainer.querySelectorAll(".loadout-section");

        localSections.forEach(sec => {
            if (target === "all") {
                sec.style.display = "block";
            } else {
                // Only show the section that matches the target ID
                sec.style.display = (sec.id === `rightpanel-${target}`) ? "block" : "none";
            }
        });
    });
});
// run once on page load (default to offense)
// Run on page load to set defaults
document.addEventListener('DOMContentLoaded', () => {
    // Helper to activate a specific tab by its data-stat value
    const activateTab = (statValue) => {
        const btn = document.querySelector(`.stat-tab-btn[data-stat="${statValue}"]`);
        if (btn) {
            // We manually trigger the logic to ensure styles update 
            // even if the element is currently in a hidden parent tab
            btn.dispatchEvent(new Event('click', { bubbles: true }));
        }
    };

    // 1. Initialize the First Group (e.g. Combat)
    activateTab("Combat");

    // 2. Initialize the Second Group (Economy)
    // This will now work because our new click handler only clears its own group
    activateTab("economy");
});

// Function to check a single wrapper
function updateLoadoutWrapperVisibility(wrapper) {
    if (!wrapper) return;

    // Grab the main name span (weapon, amplifier, etc.)
    const nameSpan = wrapper.querySelector('span[class$="Name"]');
    const statSpans = wrapper.querySelectorAll('span:not([class$="Name"])');

    // Hide if name is 'None' or empty
    const isNameEmpty = !nameSpan || !nameSpan.textContent || nameSpan.textContent.toLowerCase() === 'none';

    // Hide if all stats are 0 or empty
    let areAllStatsZero = true;
    statSpans.forEach(s => {
        const val = parseFloat(s.textContent);
        if (!isNaN(val) && val !== 0) areAllStatsZero = false;
    });

    // Hide parent if either condition is met
    wrapper.style.display = (isNameEmpty || areAllStatsZero) ? 'none' : 'block';
}

// Update all wrappers
let loadoutVisibilityTimeout = null;

function updateAllLoadoutVisibility() {
    const wrappers = document.querySelectorAll('.infoRowWrapper[id^="InfoRowWrapper-current"]');
    let anyVisible = false;

    wrappers.forEach(wrapper => {
        // --- Optimized updateLoadoutWrapperVisibility logic inline to avoid extra function calls ---
        const nameSpan = wrapper.querySelector('span[class$="Name"]');
        const isNameEmpty = !nameSpan || !nameSpan.textContent || nameSpan.textContent.toLowerCase() === 'none';

        if (isNameEmpty) {
            wrapper.style.display = 'none';
        } else {
            // Only check stats if the name isn't 'None'
            const statSpans = wrapper.querySelectorAll('span:not([class$="Name"])');
            let areAllStatsZero = true;
            
            for (let s of statSpans) {
                const val = parseFloat(s.textContent);
                if (!isNaN(val) && val !== 0) {
                    areAllStatsZero = false;
                    break; // Exit loop early as soon as we find a real stat
                }
            }
            wrapper.style.display = areAllStatsZero ? 'none' : 'block';
        }

        if (wrapper.style.display !== 'none') anyVisible = true;
    });

    // Placeholder management
    let placeholder = document.getElementById('loadout-placeholder');
    if (placeholder) {
        placeholder.style.display = anyVisible ? 'none' : 'block';
    }
}

// 2. The Debouncer: Prevents the "Mutation Storm"
function debouncedLoadoutUpdate() {
    if (loadoutVisibilityTimeout) cancelAnimationFrame(loadoutVisibilityTimeout);
    
    // requestAnimationFrame is better than setTimeout for visual UI changes
    loadoutVisibilityTimeout = requestAnimationFrame(() => {
        updateAllLoadoutVisibility();
        loadoutVisibilityTimeout = null;
    });
}

function monitorLoadoutChanges() {
    const container = document.querySelector('.weaponInfoPanel');
    if (!container) return;

    // Initial run
    updateAllLoadoutVisibility();

    // 3. ONE Observer to rule them all
    const observer = new MutationObserver((mutations) => {
        // We don't care what changed, just that SOMETHING in the panel changed
        debouncedLoadoutUpdate();
    });

    // Observe the parent container once
    observer.observe(container, { 
        childList: true, 
        subtree: true, 
        characterData: true 
    });
}

// Start
monitorLoadoutChanges();
function changeView(viewId) {
    // 1. Hide all main content containers inside #inventory-main-content
    // 2. Show the requested container: e.g., document.getElementById('undecided-view-container').style.display = 'block';
    
    // 3. Render the content for the visible view
    if (viewId === 'undecided') {
        renderDashboardContent();
    } else if (viewId === 'market') {
        renderMerchantContent();
    }
}

/**
 * THE DOPE ASS ZIPPER
 * Adds SUPER coolio zipper functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    const zipper = document.querySelector('#zipperHandle');
    const wrapper = document.querySelector('#mapToggleWrapper');
    const teeth = document.querySelector('#zipperteeth');
    
    if (!zipper || !wrapper || !teeth) return;

    let isDragging = false;
    let isStuck = false; 
    let startMouseY = 0, startMouseX = 0, startHeight = 0;
    let lastMouseY = 0, lastMouseX = 0;
    let activeZone = null; 
    let currentMode = 'vertical';
    let horizontalPercent = 0;
    
    let clickCount = 0;
    let clickTimer = null;

    const tugThreshold = 25; 
    const detachThreshold = 40; 
    const strictUpAngle = 115; 
    const looseDownAngle = 85; 
    const horizontalFriction = 0.65; 
    const horizontalLeadAngle = 20;

    // Helper to sync the trail height
    function updateTeethHeight() {
        const currentHeight = wrapper.offsetHeight;
        teeth.style.height = `${currentHeight}px`;
    }

    // Initialize height
    updateTeethHeight();

    zipper.addEventListener('mousedown', (e) => {
        clickCount++;
        clearTimeout(clickTimer);
        
        if (clickCount === 2) {
            if (isStuck) {
                isStuck = false;
                zipper.classList.remove('stuck');
                if(window.playSound) window.playSound('ui-click'); 
            }
            zipper.classList.add('bounce-active');
            if(window.playSound) window.playSound('ui-click'); 
            setTimeout(() => { zipper.classList.remove('bounce-active'); }, 600); 
            clickCount = 0;
        }
        
        clickTimer = setTimeout(() => { clickCount = 0; }, 400);

        if (isStuck) return;

        isDragging = true;
        activeZone = null; 
        startMouseY = e.clientY;
        startMouseX = e.clientX;
        lastMouseY = e.clientY;
        lastMouseX = e.clientX;
        startHeight = wrapper.offsetHeight;
        
        zipper.classList.add('dragging');
        document.body.style.cursor = 'grabbing';
        e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging || isStuck) return;

        const rect = zipper.getBoundingClientRect();
        const pivotX = rect.left + rect.width / 2;
        const pivotY = rect.top + 6; 

        const dx = e.clientX - pivotX;
        const dy = e.clientY - pivotY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        let angle = Math.atan2(dx, dy) * (180 / Math.PI);
        let rotation = -angle; 
        zipper.style.setProperty('--zipper-rotation', `${rotation}deg`);

        const currentPullY = e.clientY - lastMouseY;
        const currentPullX = e.clientX - lastMouseX;
        const isPhysicallyMoving = Math.abs(currentPullY) > 0.5 || Math.abs(currentPullX) > 0.5;
        
        // CALIBRATED JAM CHANCE
        if (activeZone && isPhysicallyMoving && Math.random() < 0.001) {
            isStuck = true;
            isDragging = false;
            zipper.classList.add('stuck');
            zipper.classList.remove('engaged', 'dragging');
            if(window.playSound) {
                window.playSound('zipper-move', 'stop');
                window.playSound('ui-click'); 
            }
            document.body.style.cursor = 'help';
            return;
        }

        lastMouseY = e.clientY; 
        lastMouseX = e.clientX; 
        
        let pullDirectionY = (currentPullY < -1) ? 'up' : (currentPullY > 1 ? 'down' : null);
        let isZipping = false;

        if (currentMode === 'vertical') {
            const isTabStrictlyUp = Math.abs(rotation) > strictUpAngle;
            const isTabLooselyDown = Math.abs(rotation) < looseDownAngle;

            if (!activeZone && distance > tugThreshold) {
                if (pullDirectionY === 'up' && isTabStrictlyUp) {
                    activeZone = 'shrinking';
                    startMouseY = e.clientY; startHeight = wrapper.offsetHeight;
                    zipper.classList.add('engaged');
                } else if (pullDirectionY === 'down' && isTabLooselyDown) {
                    activeZone = 'growing';
                    startMouseY = e.clientY; startHeight = wrapper.offsetHeight;
                    zipper.classList.add('engaged');
                }
            }

            if (activeZone) {
                if ((activeZone === 'shrinking' && pullDirectionY === 'down') ||
                    (activeZone === 'growing' && pullDirectionY === 'up')) {
                    releaseZipper();
                    return;
                }
                const newHeight = startHeight + (e.clientY - startMouseY);
                if (newHeight <= 0) {
                    wrapper.style.setProperty('height', '0px', 'important');
                    updateTeethHeight();
                    if ((startMouseX - e.clientX) > detachThreshold) {
                        currentMode = 'horizontal';
                        horizontalPercent = 0;
                        releaseZipper();
                        zipper.classList.add('horizontal-mode');
                    }
                } else {
                    wrapper.style.setProperty('height', `${newHeight}px`, 'important');
                    updateTeethHeight(); // SYNC TEETH HEIGHT
                    if (isPhysicallyMoving) isZipping = true;
                }
            }
        } 
        else if (currentMode === 'horizontal') {
            const containerWidth = wrapper.parentElement.offsetWidth;
            const percentDelta = (currentPullX / containerWidth) * 100;
            const isLeadingLeft = rotation > horizontalLeadAngle;
            const isLeadingRight = rotation < -horizontalLeadAngle;

            let moved = false;
            if (currentPullX < -0.5 && isLeadingLeft) {
                horizontalPercent += Math.abs(percentDelta) * horizontalFriction;
                moved = true;
            } else if (currentPullX > 0.5 && isLeadingRight) {
                horizontalPercent -= Math.abs(percentDelta) * horizontalFriction;
                moved = true;
            }

            horizontalPercent = Math.max(0, Math.min(95, horizontalPercent));
            zipper.style.right = `${horizontalPercent}%`;
            
            if (moved) {
                zipper.classList.add('engaged');
                if (isPhysicallyMoving) isZipping = true;
            } else {
                zipper.classList.remove('engaged');
            }

            if (horizontalPercent <= 2 && pullDirectionY === 'down') {
                currentMode = 'vertical';
                zipper.classList.remove('horizontal-mode', 'engaged');
                zipper.style.right = '10px';
                wrapper.style.setProperty('height', '10px', 'important');
                updateTeethHeight();
            }
        }

        // Sound management
        if (window.playSound) {
            if (isZipping && !isStuck) {
                window.playSound('zipper-move', 'play');
            } else {
                window.playSound('zipper-move', 'stop');
            }
        }
    });

    function releaseZipper() {
        activeZone = null;
        isDragging = false;
        zipper.classList.remove('engaged', 'dragging');
        zipper.style.setProperty('--zipper-rotation', '3deg');
        if(window.playSound) window.playSound('zipper-move', 'stop');
    }

    window.addEventListener('mouseup', () => {
        if (isStuck) return;
        if (!isDragging) return;
        releaseZipper();
        document.body.style.cursor = 'default';
    });
});

/* END OF SUPER COOL ZIPPER*/
/*-----------------------------------------------------------------------
*/
function handleRetroToggle(checkboxId, storageKey, onToggleCallback) {
    const checkbox = document.getElementById(checkboxId);
    if (!checkbox) return;
    const parent = checkbox.closest('.retrotoggleswitchA');

    // 1. Initial State Load (Strict Sync)
    if (storageKey) {
        const savedValue = localStorage.getItem(storageKey);
        if (savedValue !== null) {
            const isOn = savedValue === "on";
            checkbox.checked = isOn;
            
            if (parent) {
                parent.classList.toggle("retrotoggleswitchA-on", isOn);
            }
        }
    }

    // 2. The Listener
    checkbox.addEventListener("change", () => {
        const isOn = checkbox.checked;
        
        // Update Visual Light
        if (parent) {
            parent.classList.toggle("retrotoggleswitchA-on", isOn);
        }

        // Save state (SKIP if storageKey is null)
        if (storageKey) {
            localStorage.setItem(storageKey, isOn ? "on" : "off");
        }
        
        // Fire external logic
        if (onToggleCallback) onToggleCallback(isOn);
    });
}
document.getElementById('toggleIncludeMU').addEventListener('change', (e) => {
    window.includeMUInCraftingCost = e.target.checked;
    
    // Recalculate and update overlay immediately
    if (typeof calculate === 'function') {
        calculate(); 
    }
    if (guiDebug) console.log("Crafting MU inclusion set to:", window.includeMUInCraftingCost);
});
// Run after DOM/stats are loaded

document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.key.toLowerCase() === 'l') {
    overlaySettings.locked = !overlaySettings.locked;
    saveOverlayPreferences();
  }
});
// Refresh overlay (reload)
document.getElementById('refreshOverlayBtn').addEventListener('click', () => {
  if (guiDebug) console.log('Requesting overlay refresh...');
  if (window.electronAPI && window.electronAPI.send) {
    // This channel MUST match the listener added in engineroom.js
    window.electronAPI.send('request-overlay-refresh'); 
  } else {
    console.error('Electron API not available to request refresh.');
  }
});
// Toggle overlay show/hide
document.getElementById('toggleOverlayBtn').addEventListener('click', async () => {
  const visible = await window.electronAPI.toggleOverlay();
  document.getElementById('toggleOverlayBtn').innerText = visible ? "Hide Overlay" : "Show Overlay";
});

// Toggle always-on-top
document.getElementById('overlayAlwaysOnTop').addEventListener('change', async (event) => {
  const isOnTop = await window.electronAPI.toggleOverlayOnTop();
  event.target.checked = isOnTop;
});
document.getElementById('showTeamGraph').addEventListener('change', (e) => {
  window.electronAPI.sendMainControlsUpdated({
    showTeamGraph: e.target.checked
  });
});

document.getElementById('toggleProfitAxis').addEventListener('change', (e) => {
  window.electronAPI.sendMainControlsUpdated({
    toggleProfitAxis: e.target.checked
  });
});

window.electronAPI.onReceiveRequestPrefs(() => {
    if (guiDebug) console.log("AppGUI: Overlay requested prefs. Sending current state...");
    
    // Use the API you already have to talk to the overlay
    if (window.electronAPI && window.electronAPI.sendToOverlay) {
        // We send the existing 'overlayPreferences' object on the existing channel
        window.electronAPI.sendToOverlay("overlay-prefs-update", overlayPreferences);
    }
});
// Receive sync updates from popout
window.electronAPI.onControlSync((state) => {
  document.getElementById('showTeamGraph').checked = !!state.showTeamGraph;
  document.getElementById('toggleProfitAxis').checked = !!state.toggleProfitAxis;
});

// Use the specific bridge function from your preload
window.electronAPI.onPopoutButton((buttonId) => {
    if (guiDebug) console.log("🎯 Hardware Keybind Received:", buttonId);

    if (buttonId === 'startStop') {
        startStopHunt();
    } 
    else if (buttonId === 'pause') {
        // Make sure this function name matches your actual pause logic
        if (typeof pauseResumeHunt === 'function') {
            pauseResumeHunt();
        } else {
            console.error("pauseResumeHunt function not found!");
        }
    }
    else if (buttonId === 'reset') {
        resetChart();
    }
});
// Listen for bounds updates sent from the main process (when the overlay moves/resizes/closes)
if (window.electronAPI.onSaveOverlayBounds) {
    window.electronAPI.onSaveOverlayBounds((bounds) => {
        if (guiDebug) console.log("AppGUI updating local bounds state:", bounds);
        
        // Update the local object so if we change a checkbox later, 
        // we have the most recent window position.
        //overlayPreferences.bounds = bounds;
		overlayPreferences = {
            ...overlayPreferences,
            ...bounds
        };
        // ❌ REMOVE saveOverlayPreferences(); 
        // Why? Because Engineroom.js already saved the file when the move happened.
        // Calling it again here is redundant and causes extra IPC traffic.
    });
} else {
    console.warn("⚠️ window.electronAPI.onSaveOverlayBounds listener not exposed in preload!");
}
console.log('✅appgui.js Initialized');