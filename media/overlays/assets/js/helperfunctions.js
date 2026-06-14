
/**
 * Helper Functions script
 * 
 * 
 */
 
 
 
 
 
 console.log(" [Helper Functions]: Initializing initializing...");
 
// --- color helpers ---
function hexToHSLA(hex) {
    if(!hex || hex.startsWith('hsla')) return parseHSLA(hex || 'hsla(0,0%,0%,1)');
    if(hex.startsWith('rgba')) {
        const vals = hex.match(/\d+(\.\d+)?/g);
        return rgbToHSLA(vals[0], vals[1], vals[2], vals[3] || 1);
    }
    let r=0, g=0, b=0;
    if (hex.length == 4) { r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3]; }
    else { r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6]; }
    return rgbToHSLA(r, g, b, 1);
}
function rgbToHSLA(r, g, b, a) {
    r /= 255; g /= 255; b /= 255;
    let cmin = Math.min(r,g,b), cmax = Math.max(r,g,b), delta = cmax - cmin, h = 0, s = 0, l = 0;
    if (delta == 0) h = 0; else if (cmax == r) h = ((g - b) / delta) % 6; else if (cmax == g) h = (b - r) / delta + 2; else h = (r - g) / delta + 4;
    h = Math.round(h * 60); if (h < 0) h += 360;
    l = (cmax + cmin) / 2; s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
    return { h, s: Math.round(s * 100), l: Math.round(l * 100), a: parseFloat(a) };
}
function parseHSLA(str) {
    const vals = str.match(/\d+(\.\d+)?/g);
    return { h: vals[0], s: vals[1], l: vals[2], a: vals[3] || 1 };
}


const AVAILABLE_IN_ANIMATIONS = ["none", "fadeIn", "bounceIn", "zoomIn", "slideInDown", "slideInUp"];
const AVAILABLE_OUT_ANIMATIONS = ["none", "fadeOut", "bounceOut", "zoomOut", "slideOutUp", "slideOutDown"];
 const CUSTOM_SELECT_DATA = {
    "reward-text-in-anim": AVAILABLE_IN_ANIMATIONS,
    "reward-img-in-anim": AVAILABLE_IN_ANIMATIONS,
    "reward-text-out-anim": AVAILABLE_OUT_ANIMATIONS,
    "reward-img-out-anim": AVAILABLE_OUT_ANIMATIONS,
    "reward-font-weight": [
        { value: "normal", label: "Normal (400)" },
        { value: "bold", label: "Bold (700)" },
        { value: "900", label: "Black (900)" },
        { value: "300", label: "Light (300)" }
    ],
    "reward-img-mode": [
        { value: "loop", label: "Loop Continuously" },
        { value: "once", label: "Play Once (Reset)" }
    ],
    // Bit Cheer Manager Additions
    "bit-tier-selector": [
        { value: "1", label: "Tier 1 (1+ Bits)" },
        { value: "100", label: "Tier 2 (100+ Bits)" },
        { value: "500", label: "Tier 3 (500+ Bits)" },
        { value: "1000", label: "Tier 4 (1000+ Bits)" },
        { value: "5000", label: "Tier 5 (5000+ Bits)" }
    ],
    // Explicitly binding the Bit Animation IDs so populateCustomDropdowns maps them safely
    "bit-text-in-anim": AVAILABLE_IN_ANIMATIONS,
    "bit-text-out-anim": AVAILABLE_OUT_ANIMATIONS,
    "bit-img-in-anim": AVAILABLE_IN_ANIMATIONS,
    "bit-img-out-anim": AVAILABLE_OUT_ANIMATIONS
};
 // Programmatic getter and setter wrappers to maintain backward compatibility with your save actions
function getCustomSelectValue(id) {
    return customSelectValues[id];
}
function setCustomSelectValue(id, value) {
    customSelectValues[id] = value;
    
    // Support both fallback matching patterns
    const displayEl = document.getElementById(`display-${id}`) || document.getElementById(`current-${id}`);
    if (!displayEl) return;

    // Resolve structural label representations if tracking raw object lists
    const dataset = CUSTOM_SELECT_DATA[id];
    if (dataset && typeof dataset[0] === 'object') {
        const matched = dataset.find(item => String(item.value) === String(value));
        displayEl.innerText = matched ? matched.label : value;
    } else {
        displayEl.innerText = value;
    }

    // Contextual Trigger: Fire custom change updates for the Bit Tier configuration loader
    if (id === "bit-tier-selector") {
        if (typeof loadBitTierConfig === "function") {
            loadBitTierConfig(value);
        }
        return;
    }

    // --- LIVE GRAPH REWRITE ENGINE MATCHES ---
    // If we are configuring a Bit Alert Dropdown, update registry tracking immediately
    if (id.startsWith("bit-")) {
        const activeTier = customSelectValues["bit-tier-selector"] || "1";
        if (registry.bits && registry.bits[activeTier]) {
            // Map the internal field layout key (e.g., bit-text-in-anim -> anim_tx_in)
            let targetKey = null;
            if (id === "bit-text-in-anim") targetKey = "anim_tx_in";
            if (id === "bit-text-out-anim") targetKey = "anim_tx_out";
            if (id === "bit-img-in-anim") targetKey = "anim_im_in";
            if (id === "bit-img-out-anim") targetKey = "anim_im_out";

            if (targetKey) {
                registry.bits[activeTier][targetKey] = value;
                console.log(`Saved bit array transaction [Tier ${activeTier}]: ${targetKey} -> ${value}`);
            }
        }
    }
}
function populateCustomDropdowns() {
    Object.keys(CUSTOM_SELECT_DATA).forEach(id => {
        const displayEl = document.getElementById(`display-${id}`) || 
                          document.getElementById(`current-${id}`) || 
                          document.getElementById(id);

        const optionsEl = document.getElementById(`options-${id}`) || 
                          document.getElementById(`${id}-options`);

        if (!displayEl || !optionsEl) {
            // console.warn(`Dropdown elements not found for ID: ${id}`);
            return;
        }

        const optionsData = CUSTOM_SELECT_DATA[id];
        optionsEl.innerHTML = "";

        optionsData.forEach(item => {
            const val = typeof item === 'object' ? item.value : item;
            const text = typeof item === 'object' ? item.label : item;

            const row = document.createElement("div");
            row.className = "option-item";
            row.innerText = text;
            row.dataset.value = val;

            row.style.cssText = "padding: 6px 10px; font-size: 11px; color: #e4e4e7; cursor: pointer;";

            row.addEventListener("mouseenter", () => row.style.background = "var(--accent, #9146ff)");
            row.addEventListener("mouseleave", () => row.style.background = "transparent");

            row.addEventListener("click", (e) => {
                e.stopImmediatePropagation();   // Crucial fix
                setCustomSelectValue(id, val);
                optionsEl.style.display = "none";
            });

            optionsEl.appendChild(row);
        });

        // Attach click handler to display (only once)
        if (!displayEl.dataset.dropdownInitialized) {
            displayEl.dataset.dropdownInitialized = "true";

            displayEl.addEventListener("click", (e) => {
                e.stopImmediatePropagation();

                // Close all other dropdowns
                document.querySelectorAll(".custom-select-options-box, .select-options").forEach(box => {
                    if (box !== optionsEl) box.style.display = "none";
                });

                optionsEl.style.display = optionsEl.style.display === "block" ? "none" : "block";
            });
        }
    });
}



function makeElementDraggable(targetId, handleId) {
    const target = document.getElementById(targetId);
    const handle = document.getElementById(handleId);

    if (!target || !handle) return;

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    handle.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        // Only drag on left click
        if (e.button !== 0) return;
        
        e.preventDefault();
        
        // Get the initial mouse cursor position
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // If the element uses a centering transform (like the Theme Manager),
        // capture its current bounding coordinates and strip the transform immediately
        // BEFORE dragging starts to avoid jumping.
        const computedStyle = window.getComputedStyle(target);
        if (computedStyle.transform !== 'none' && !target.style.left) {
            const rect = target.getBoundingClientRect();
            target.style.transform = 'none';
            target.style.left = rect.left + 'px';
            target.style.top = rect.top + 'px';
        }
        
        // Attach event listeners for moving and releasing the mouse
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        // Calculate the new cursor position
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;

        // Set the element's new absolute position coordinates
        let newTop = target.offsetTop - pos2;
        let newLeft = target.offsetLeft - pos1;

        // --- UPDATED BOUNDARY GUARDS ---
        // Prevent window from getting lost off the top or left edge
        if (newTop < 0) newTop = 0;
        if (newLeft < 0) newLeft = 0;

        // Prevent window from escaping past the right side of the screen
        if (newLeft + target.offsetWidth > window.innerWidth) {
            newLeft = window.innerWidth - target.offsetWidth;
        }

        // FIX: Allow the window to slide all the way to the bottom frame.
        // It locks it right before the header handle (approx 40px) vanishes off-screen.
        const minVisibleHeader = 40; 
        if (newTop > window.innerHeight - minVisibleHeader) {
            newTop = window.innerHeight - minVisibleHeader;
        }

        // Apply new styles
        target.style.top = newTop + "px";
        target.style.left = newLeft + "px";
        
        // Clear right/bottom anchors so they don't fight the explicit top/left styling
        target.style.right = 'auto';
        target.style.bottom = 'auto';
    }

    function closeDragElement() {
        // Stop moving when mouse button is released
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function setupCustomDropdownEngine(displayId, optionsId, optionItems, onSelectionCallback = null) {
    console.log(`[Global UI]: Mounting dropdown -> Display: ${displayId}, Items: ${optionItems ? optionItems.length : '0'}`);
    
    const displayEl = document.getElementById(displayId);
    const optionsEl = document.getElementById(optionsId);
    if (!displayEl || !optionsEl) return null;

    // --- 1. Flush Existing Options DOM Elements ---
    optionsEl.innerHTML = "";

    // --- 2. Build and Append Options via Document Fragment (High Performance) ---
    const fragment = document.createDocumentFragment();
    
    optionItems.forEach(itemText => {
        const opt = document.createElement("div");
        opt.className = "option-item";
        opt.style.cssText = "padding: 6px 8px; cursor: pointer; color: #fff; font-size: 12px; transition: background 0.1s ease;";
        opt.innerText = itemText;
        
        // Hover dynamics wired cleanly without memory leaks
        opt.addEventListener("mouseenter", () => { opt.style.background = "#27272a"; });
        opt.addEventListener("mouseleave", () => { opt.style.background = "transparent"; });
        
        // Selection router
        opt.addEventListener("click", (e) => {
            e.stopPropagation();
            displayEl.innerText = itemText;
            optionsEl.style.display = "none";
            optionsEl.classList.remove("menu-open");
            if (onSelectionCallback) onSelectionCallback(itemText);
        });
        
        fragment.appendChild(opt);
    });
    optionsEl.appendChild(fragment);

    // --- 3. Manage the Toggle Event Listeners ---
    // Remove old handler reference if this dropdown was hot-swapped or rebuilt
    if (displayEl._boundDropdownToggle) {
        displayEl.removeEventListener("click", displayEl._boundDropdownToggle);
    }

    // Assign the fresh execution handle directly to the element pointer
    displayEl._boundDropdownToggle = function(e) {
        e.stopPropagation();
        
        // Close all other dropdown menus on the canvas to prevent overlaps
        document.querySelectorAll(".custom-select-options-box").forEach(box => {
            if (box !== optionsEl) {
                box.style.display = "none";
                box.classList.remove("menu-open");
            }
        });
        
        // Toggle active menu state with class toggles to force OBS bounding updates
        if (optionsEl.style.display === "block") {
            optionsEl.style.display = "none";
            optionsEl.classList.remove("menu-open");
        } else {
            optionsEl.style.display = "block";
            optionsEl.classList.add("menu-open");
        }
    };

    displayEl.addEventListener("click", displayEl._boundDropdownToggle);
    
    return { displayEl, optionsEl };
}

// =========================================================================
// --- DOM UTILITY & EVENT ROUTING HELPERS ---
// =========================================================================
/* Safely attaches a click listener to an element if it exists in the DOM. */
function onSafeClick(id, callback, stopPropagation = false) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", (e) => {
        if (stopPropagation) e.stopPropagation();
        callback(e, el);
    });
}
/* Safely attaches a change listener to an input element if it exists in the DOM. */
function onSafeChange(id, callback) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", (e) => callback(e, el));
}
/* Inline file streaming parsing utility to cut file handler duplicate code blocks */
function bindBase64FileReader(inputElement, onLoadedSuccess, onClearFallback) {
    if (!inputElement) return;
    inputElement.addEventListener("change", function(e) {
        const file = e.target.files[0];
        if (!file) {
            onClearFallback();
            return;
        }
        const reader = new FileReader();
        reader.onload = (evt) => onLoadedSuccess(evt.target.result, file.name);
        reader.readAsDataURL(file);
    });
}

// ==========================================
// 🛠️ emergency reset functions
// ==========================================
/**
 * Universally deletes a setting key from both the monolithic settings wrapper 
 * and independent localStorage entries, then syncs the active UI state.
 * @param {string} key - The precise settings property name or independent localStorage key to remove.
 * @param {boolean} [shouldReload=false] - Optional flag to force a hard reload after wiping.
 */
function deleteSetting(key, shouldReload = false) {
    let wasDeleted = false;

    // 1. Target the monolithic grouped settings object if it exists
    if (localStorage.getItem('settings')) {
        try {
            let s = JSON.parse(localStorage.getItem('settings'));
            
            // Check if the property actively exists in the schema object
            if (s && s.hasOwnProperty(key)) {
                delete s[key];
                localStorage.setItem('settings', JSON.stringify(s));
                
                // Mirror the deletion to your active top-level runtime settings variable
                if (typeof settings !== 'undefined' && settings.hasOwnProperty(key)) {
                    delete settings[key];
                }
                wasDeleted = true;
                console.log(`[Storage] Cleaned property "${key}" out of the monolithic settings wrapper.`);
            }
        } catch (e) {
            console.error(`[Storage Error] Failed to parse settings object while deleting key "${key}":`, e);
        }
    }

    // 2. Fall back to checking independent localStorage cache keys (like legacy elements or positions)
    if (localStorage.getItem(key) !== null) {
        localStorage.removeItem(key);
        wasDeleted = true;
        console.log(`[Storage] Removed independent key entry "${key}" from localStorage directly.`);
    }

    // 3. Clear any active matching top-level global runtime variables if they exist
    if (window.hasOwnProperty(key)) {
        window[key] = undefined;
        wasDeleted = true;
    }

    // 4. Determine post-execution routing flow
    if (wasDeleted) {
        if (shouldReload) {
            console.log(`[Storage] Reload requested. Refreshing page wrapper context...`);
            location.reload();
            return;
        }

        // Live update the application UI context states without requiring a reload
        if (typeof loadPositions === "function") loadPositions();
        if (typeof syncAllToggleUI === "function") syncAllToggleUI();
        
        console.log(`[Storage] Hot-sync complete. Element attributes updated across active layout components.`);
    } else {
        console.warn(`[Storage Wrapper] Specified key "${key}" was not located in active storage contexts.`);
    }
}

//deleteSetting('chatHeight'); 
// Instantly deletes it from storage and snaps the feed back to its default 175px CSS floor safely!

//deleteSetting('p8_pos_chat-widget', true); 
// Erases the manual drag tracking position memory and reloads the window to pop it back to 400px/20px baseline rules.
async function systemReset() {
    if(await p8Confirm("This will logout and reset your local settings. Proceed?")) {
        localStorage.clear();
        window.location.href = FULL_REDIRECT;
    }
}



// --- MODAL & HELPERS ---
async function p8Confirm(message, isAlert = false) {
    const overlay = document.getElementById('p8-modal-overlay');
    const msgEl = document.getElementById('modal-msg');
    const cancelBtn = document.getElementById('modal-cancel');
    const confirmBtn = document.getElementById('modal-confirm');
    
    msgEl.innerText = message;
    cancelBtn.style.display = isAlert ? 'none' : 'block';
    overlay.style.display = 'flex';

    return new Promise((resolve) => {
        const cleanup = (val) => {
            overlay.style.display = 'none';
            confirmBtn.replaceWith(confirmBtn.cloneNode(true));
            cancelBtn.replaceWith(cancelBtn.cloneNode(true));
            resolve(val);
        };
        document.getElementById('modal-confirm').addEventListener('click', () => cleanup(true));
        document.getElementById('modal-cancel').addEventListener('click', () => cleanup(false));
    });
}
function closeContextMenu() {
    const ctxMenu = document.getElementById('p8-ctx-menu');
    if (ctxMenu) ctxMenu.style.display = 'none';
}

// =========================================================================
// GLOBAL VIEWPORT CANVAS INTERACTION CLOSER
// =========================================================================
// Closes open dropdown menus when clicking on the open layout space in the OBS Interact Window
if (typeof window !== "undefined" && !window._globalDropdownCloserWired) {
    document.addEventListener("click", () => {
        document.querySelectorAll(".custom-select-options-box").forEach(box => {
            box.style.display = "none";
            box.classList.remove("menu-open");
        });
    });
    window._globalDropdownCloserWired = true;
    console.log("🚀 [Helper Engine]: Global OBS Dropdown Closer successfully wired to DOM.");
}
















// =========================================================================
// END OF HELPERFUNCTIONS FILE
// =========================================================================
console.log(" [Helper Functions]: Initialized.");