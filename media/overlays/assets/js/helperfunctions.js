
/**
 * Helper Functions script
 * 
 * 
 */
 console.log(" [Helper Functions]: Initializing initializing...");



let registry = JSON.parse(localStorage.getItem('p8_registry')) || {
    active: 'Default',
    themes: {
        'Default': { 
            '--bg': 'rgba(24, 24, 27, 0.8)', 
            '--accent': '#9146ff', 
            '--border-color': '#9146ff', 
            '--border-radius': '12px', 
            '--font-size': '18px',
            '--font-family': "'Segoe UI', sans-serif",
            '--border-style': 'solid'
        }
    }
};

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

let customSelectValues = {
    "reward-text-in-anim": "none",
    "reward-text-out-anim": "none",
    "reward-img-in-anim": "none",
    "reward-img-out-anim": "none",
    "reward-font-weight": "bold",
    "reward-img-mode": "loop",
    // Bit Cheer Manager State Fallbacks
    "bit-tier-selector": "1",
    "bit-text-in-anim": "none",
    "bit-text-out-anim": "none",
    "bit-img-in-anim": "none",
    "bit-img-out-anim": "none"
};
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

// --- INITIALIZE DRAGGING FOR BOTH WINDOWS ---
document.addEventListener("DOMContentLoaded", () => {
    // Parameter 1: The Main Window Element ID
    // Parameter 2: The Header/Handle Element ID
    makeElementDraggable("style-editor", "theme-manager-header");
    makeElementDraggable("rewards-manager", "rewards-manager-header");
});
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

// ==============================================================================================================
// =========================================================================
// --- SOUND SYSTEM ---
// =========================================================================
// Centralized Generic Audio Utility
function playSound(audioSource, volume = 0.8) {
    if (!audioSource) return;

    try {
        const audio = new Audio(audioSource);
        audio.volume = Math.min(Math.max(volume, 0), 1); // Clamp volume between 0.0 and 1.0
        
        // Play the audio asset
        audio.play().catch(err => {
            console.error("Audio playback blocked or failed:", err);
        });

        // Cleanup memory once playback finishes
        audio.onended = () => {
            audio.remove();
        };
    } catch (e) {
        console.error("Failed to initialize audio element:", e);
    }
}
// Staged storage arrays for the current item actively open in the template form editor
let stagedSoundsPool = [];
// Helper utility to render active sound chips inside the editor panel
function renderStagedSoundsUI() {
    const listContainer = document.getElementById("reward-sounds-list");
    if (!listContainer) return;
    
    listContainer.innerHTML = "";
    
    if (stagedSoundsPool.length === 0) {
        listContainer.innerHTML = `<div style="font-size: 11px; color: #52525b; font-style: italic; padding: 4px;">No custom audio assigned.</div>`;
        return;
    }
    
    stagedSoundsPool.forEach((soundItem, index) => {
        const soundRow = document.createElement("div");
        soundRow.style.cssText = "display: flex; gap: 8px; justify-content: space-between; align-items: center; background: #09090b; border: 1px solid #27272a; padding: 6px 10px; border-radius: 6px; font-size: 11px;";
        
        // Fallback properties for safety configuration management
        let displayName = `🔊 Custom Sound #${index + 1}`;
        let audioPlayTarget = "";
        let currentVol = 1.0;

        if (soundItem && typeof soundItem === "object") {
            displayName = soundItem.name || displayName;
            audioPlayTarget = soundItem.data || "";
            currentVol = soundItem.volume !== undefined ? soundItem.volume : 1.0;
        } else if (typeof soundItem === "string") {
            // Backward compatibility tracking loop for legacy data variants
            displayName = soundItem.startsWith("data:") ? `🔊 Custom Sound #${index + 1}` : soundItem.split('/').pop();
            audioPlayTarget = soundItem;
        }
        
        soundRow.innerHTML = `
            <div style="display: flex; flex-direction: column; flex-grow: 1; min-width: 0;">
                <span style="color: #e4e4e7; text-overflow: ellipsis; overflow: hidden; white-space: nowrap; max-width: 160px; margin-bottom: 2px;" title="${displayName}">${displayName}</span>
                <div style="display: flex; align-items: center; gap: 4px;">
                    <span style="font-size: 9px; color: #71717a; font-family: monospace; width: 24px;">Vol:</span>
                    <input type="range" class="sound-vol-slider" min="0" max="1" step="0.05" value="${currentVol}" style="width: 70px; height: 3px; accent-color: var(--accent); cursor: pointer; margin: 0; padding: 0;">
                    <span class="vol-label" style="font-size: 9px; color: #a1a1aa; font-family: monospace; width: 26px; text-align: right;">${Math.round(currentVol * 100)}%</span>
                </div>
            </div>
            <div style="display: flex; gap: 6px; align-items: center; flex-shrink: 0;">
                <button type="button" class="play-preview-btn" style="background: none; border: none; color: var(--accent); cursor: pointer; padding: 2px;">▶️</button>
                <button type="button" style="background: none; border: none; color: #f87171; cursor: pointer; padding: 2px;" onclick="removeStagedSoundItem(${index})">❌</button>
            </div>
        `;

        // Update volume value inside the data object array when the slider is dragged
        const slider = soundRow.querySelector(".sound-vol-slider");
        const volLabel = soundRow.querySelector(".vol-label");
        
        slider.addEventListener("input", function() {
            const v = parseFloat(this.value);
            volLabel.innerText = `${Math.round(v * 100)}%`;
            
            if (stagedSoundsPool[index] && typeof stagedSoundsPool[index] === "object") {
                stagedSoundsPool[index].volume = v;
            } else if (typeof stagedSoundsPool[index] === "string") {
                // Upgrade string on-the-fly to prevent syntax runtime bugs if user slides an legacy object item
                stagedSoundsPool[index] = {
                    name: displayName,
                    data: audioPlayTarget,
                    volume: v
                };
            }
        });

        // Test play layout handler with specific assigned settings configuration
        soundRow.querySelector(".play-preview-btn").addEventListener("click", () => {
            const currentObj = stagedSoundsPool[index];
            const targetVolume = (currentObj && typeof currentObj === "object" && currentObj.volume !== undefined) ? currentObj.volume : 0.7;
            playSound(audioPlayTarget, targetVolume);
        });

        listContainer.appendChild(soundRow);
    });
}

// Global hook execution to safely pull items out of memory cache via index position
window.removeStagedSoundItem = function(index) {
    stagedSoundsPool.splice(index, 1);
    renderStagedSoundsUI();
};

// =========== END OF SOUND SYTEM ===================================
// ==============================================================================================================
// ===============================================================================================================
// =========================================================================
// --- TIMERS & RUNTIME CONTEXT ENGINE STATE ---
// =========================================================================
// Persistent configurations saved across sessions
let activeTimers = JSON.parse(localStorage.getItem('p8_active_timers')) || {}; 
let timerIntervalId = null;
let savedCountdowns = JSON.parse(localStorage.getItem('p8_saved_countdowns')) || {};
function saveCountdownsToStorage() {
    localStorage.setItem('p8_saved_countdowns', JSON.stringify(savedCountdowns));
}
function saveActiveTimersToStorage() {
    localStorage.setItem('p8_active_timers', JSON.stringify(activeTimers));
}
// Global Core Controller Initialization Wrapper
function initTimerEngine() {
    // Restore runtime ticks if active instances are pulled from storage on load
    const keys = Object.keys(activeTimers);
    if (keys.length > 0) {
        const shouldRestart = keys.some(id => activeTimers[id].running);
        if (shouldRestart && !timerIntervalId) {
            timerIntervalId = setInterval(processTimersTick, 1000);
        }
    }

    // Direct render draw call
    renderActiveTimersUI();
}
function updateTimerStyles() {
    const colorValue = document.getElementById('tmr-color-text').value;
    
    if (/^#[0-9A-F]{6}$/i.test(colorValue)) {
        document.getElementById('tmr-color-picker').value = colorValue;
    }

    const timers = document.querySelectorAll('.timer-instance-class');
    timers.forEach(t => {
        t.style.color = colorValue;
    });

    settings.timerColor = colorValue;
    saveSettings();
}
function createTimerInstance(label = "Timer", durationSeconds = 0, customStyles = {}) {
    const id = "tmr_" + Date.now();
    const type = parseInt(durationSeconds) > 0 ? "countdown" : "stopwatch";
    
    activeTimers[id] = {
        id: id,
        label: label,
        duration: parseInt(durationSeconds) || 0,
        elapsed: 0,
        running: true,
        splits: [],
        type: type,
        settings: {
            labelFontSize: customStyles.labelFontSize || "14px",
            labelFontWeight: customStyles.labelFontWeight || "600",
            timerFontSize: customStyles.timerFontSize || "24px",
            timerFontColor: customStyles.timerFontColor || "#ffffff",
            showMode: customStyles.showMode || "always" // always, counting, never
        }
    };
    
    saveActiveTimersToStorage();
    startTimerInstance(id);
    return id;
}
function startTimerInstance(id) {
    if (!activeTimers[id]) return;
    activeTimers[id].running = true;
    saveActiveTimersToStorage();
    
    if (!timerIntervalId) {
        timerIntervalId = setInterval(processTimersTick, 1000);
    }
    renderActiveTimersUI();
}
function pauseTimerInstance(id) {
    if (!activeTimers[id]) return;
    activeTimers[id].running = false;
    saveActiveTimersToStorage();
    renderActiveTimersUI();
}
function resetTimerInstance(id) {
    if (!activeTimers[id]) return;
    activeTimers[id].elapsed = 0;
    activeTimers[id].splits = [];
    saveActiveTimersToStorage();
    renderActiveTimersUI();
}
function stopTimerInstance(id) {
    if (!activeTimers[id]) return;
    delete activeTimers[id];
    saveActiveTimersToStorage();
    
    if (Object.keys(activeTimers).length === 0) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
    renderActiveTimersUI();
}
function splitTimerInstance(id) {
    const t = activeTimers[id];
    if (!t || !t.running) return;
    const currentDisplay = formatTimeDigits(t.type === "countdown" ? (t.duration - t.elapsed) : t.elapsed);
    t.splits.push(currentDisplay);
    saveActiveTimersToStorage();
    renderActiveTimersUI();
}
function processTimersTick() {
    let hasRunningTimers = false;
    let stateChanged = false;
    
    Object.keys(activeTimers).forEach(id => {
        const t = activeTimers[id];
        if (!t.running) return;
        
        hasRunningTimers = true;
        t.elapsed++;
        stateChanged = true;
        
        if (t.type === "countdown" && t.elapsed >= t.duration) {
            t.elapsed = t.duration;
            t.running = false;
            if (typeof p8Confirm === "function") {
                p8Confirm(`⏰ Countdown Finished: [${t.label}]`, true);
            } else if (typeof botSay === "function") {
                botSay(`⏰ Countdown Finished: [${t.label}]!`);
            }
        }
    });
    
    if (stateChanged) saveActiveTimersToStorage();
    
    if (!hasRunningTimers && timerIntervalId) {
        clearInterval(timerIntervalId);
        timerIntervalId = null;
    }
    
    renderActiveTimersUI();
}
function formatTimeDigits(totalSeconds) {
    if (totalSeconds < 0) totalSeconds = 0;
    const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const secs = String(totalSeconds % 60).padStart(2, '0');
    return `${hrs}:${mins}:${secs}`;
}
function renderActiveTimersUI() {
    const listContainer = document.getElementById("active-timers-list");
    const overlayDigits = document.getElementById("timer-display-digits");
    const overlayTitle = document.getElementById("timer-widget-title");
    const overlaySplits = document.getElementById("timer-splits-container");
    const timerWidget = document.getElementById("timer-widget");
    
    if (listContainer) listContainer.innerHTML = "";
    if (overlaySplits) overlaySplits.innerHTML = "";
    
    const keys = Object.keys(activeTimers);
    if (keys.length === 0) {
        if (overlayDigits) overlayDigits.innerText = "00:00:00";
        if (overlayTitle) overlayTitle.innerText = "⏱️ No Active Timers";
        if (timerWidget) timerWidget.style.display = "none";
        return;
    }
    
    const primaryTimer = activeTimers[keys[keys.length - 1]];
    if (primaryTimer) {
        const s = primaryTimer.settings || {};
        const remaining = primaryTimer.type === "countdown" ? (primaryTimer.duration - primaryTimer.elapsed) : primaryTimer.elapsed;
        
        if (overlayDigits) {
            overlayDigits.innerText = formatTimeDigits(remaining);
            overlayDigits.style.fontSize = s.timerFontSize || "24px";
            overlayDigits.style.color = s.timerFontColor || "#ffffff";
        }
        
        if (overlayTitle) {
            overlayTitle.innerText = `${primaryTimer.type === 'stopwatch' ? '⏱️' : '⏳'} ${primaryTimer.label}`;
            overlayTitle.style.fontSize = s.labelFontSize || "14px";
            overlayTitle.style.fontWeight = s.labelFontWeight || "600";
        }
        
        const editModeActive = (typeof isEditMode !== "undefined" && isEditMode);
        const shouldShow = editModeActive ? true : (
            s.showMode === "always" ? true :
            s.showMode === "counting" ? primaryTimer.running :
            false 
        );
        if (timerWidget) timerWidget.style.display = shouldShow ? "block" : "none";
        
        primaryTimer.splits.forEach((splitVal, index) => {
            const div = document.createElement("div");
            div.style.borderBottom = "1px solid rgba(255, 255, 255, 0.05)";
            div.style.padding = "2px 0";
            div.innerText = `Split 🟢 ${index + 1}: ${splitVal}`;
            if (overlaySplits) overlaySplits.appendChild(div);
        });
    }
    
    keys.forEach(id => {
        const t = activeTimers[id];
        const rem = t.type === "countdown" ? (t.duration - t.elapsed) : t.elapsed;
        
        const row = document.createElement("div");
        row.className = "timer-control-row";
        row.style.cssText = "display:flex; align-items:center; justify-content:space-between; margin-bottom:5px; background:rgba(0,0,0,0.2); padding:4px; border-radius:4px;";
        
        row.innerHTML = `
            <span style="max-width:60%; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; color:${t.running ? 'var(--accent)' : '#a1a1aa'}">
                ${t.type === 'stopwatch' ? '⏱️' : '⏳'} ${t.label} (${formatTimeDigits(rem)})
            </span>
            <div class="timer-btn-group" style="display:flex; gap:2px;">
                <button type="button" class="t-start-btn" style="background:none; border:none; cursor:pointer;">▶️</button>
                <button type="button" class="t-pause-btn" style="background:none; border:none; cursor:pointer;">⏸️</button>
                <button type="button" class="t-reset-btn" style="background:none; border:none; cursor:pointer;">🔄</button>
                <button type="button" class="t-split-btn" style="background:none; border:none; cursor:pointer; ${t.type === 'countdown' ? 'display:none;' : ''}">✂️</button>
                <button type="button" class="t-delete-btn" style="background:none; border:none; cursor:pointer;">❌</button>
            </div>
        `;

        // 🟢 DIRECT INLINE EVENT BINDING: Completely bypasses event delegation
        row.querySelector(".t-start-btn").onclick = (e) => {
            e.stopPropagation();
            console.log(`⏱️ Start clicked for timer: ${t.id}`);
            startTimerInstance(t.id);
        };

        row.querySelector(".t-pause-btn").onclick = (e) => {
            e.stopPropagation();
            console.log(`⏱️ Pause clicked for timer: ${t.id}`);
            pauseTimerInstance(t.id);
        };

        row.querySelector(".t-reset-btn").onclick = (e) => {
            e.stopPropagation();
            console.log(`⏱️ Reset clicked for timer: ${t.id}`);
            resetTimerInstance(t.id);
        };

        row.querySelector(".t-split-btn").onclick = (e) => {
            e.stopPropagation();
            console.log(`⏱️ Split clicked for timer: ${t.id}`);
            splitTimerInstance(t.id);
        };

        row.querySelector(".t-delete-btn").onclick = (e) => {
            e.stopPropagation();
            console.log(`❌ Delete/Remove clicked for timer: ${t.id}`);
            stopTimerInstance(t.id);
        };

        if (listContainer) listContainer.appendChild(row);
    });
}
if (!registry.timers) {
    registry.timers = {
        defaults: {
            labelFontSize: "14px",
            labelFontWeight: "600",
            timerFontSize: "24px",
            timerFontColor: "#ffffff",
            showMode: "always" // Options: "always", "counting", "never"
        }
    };
}
document.addEventListener("DOMContentLoaded", () => {
    initTimerEngine();
});
function getLatestInstanceIdByType(type) {
    const keys = Object.keys(activeTimers);
    for (let i = keys.length - 1; i >= 0; i--) {
        if (activeTimers[keys[i]].type === type) {
            return keys[i];
        }
    }
    return null;
}

// ================END OF TIMER SHIT========================================
// ========================================================================================================================================================





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