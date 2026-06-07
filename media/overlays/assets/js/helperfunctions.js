/**
 * Global OBS-Safe High-Density Custom Dropdown Engine
 * Pure functional layout utility. Resolves native select clipping bugs in OBS Studio.
 * Safe for multiple widgets on a single monolithic canvas.
 */
 console.log(" [Helper Functions]: Initializing initializing...");
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