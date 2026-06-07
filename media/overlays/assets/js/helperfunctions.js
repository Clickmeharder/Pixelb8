/**
 * Global OBS-Safe High-Density Custom Dropdown Engine
 * Pure functional layout utility. Resolves native select clipping bugs in OBS Studio.
 * Safe for multiple widgets on a single monolithic canvas.
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