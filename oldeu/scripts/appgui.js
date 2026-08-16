let guiDebug = false;




async function startApp() {
    window.isSystemInitializing = true; // 🤐 SILENCE START
    console.log("🚀 Starting Master Bootloader...");

    window.isSystemInitializing = false; // 🔊 SILENCE END
    
    // 🔥 FINAL SYNC
    if (window.updateCalculations) window.updateCalculations(true);
}
// Kick it off once
startApp();





// --- [APP_GUI // STAT TAB LOGIC] ---

document.addEventListener('DOMContentLoaded', () => {

    // === MAIN TABS (Blueprints, Missions, Items, Map, etc.) ===
    const mainTabButtons = document.querySelectorAll('#tab-buttons .tab-btn');

    mainTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetTab = btn.dataset.tab;

            // Deactivate all main tabs
            mainTabButtons.forEach(b => b.classList.remove('active-subtab', 'active'));

            // Activate clicked one
            btn.classList.add('active-subtab', 'active');

            // Hide all main tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });

            // Show the target tab
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.style.display = 'block';
            }
        });
    });

    // === SUBTABS (Inside each main tab) ===
    const subtabButtons = document.querySelectorAll('.subtab-btn');

    subtabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetSubtab = btn.dataset.subtab;

            // Find the parent tab content this subtab belongs to
            const parentTabContent = btn.closest('.tab-content');
            if (!parentTabContent) return;

            // Deactivate all subtabs in this group
            parentTabContent.querySelectorAll('.subtab-btn').forEach(b => {
                b.classList.remove('active-subtab');
				b.classList.remove('active');
            });

            // Activate this one
            btn.classList.add('active-subtab');
			btn.classList.add('active');
            // Hide all subtab contents in this group
            parentTabContent.querySelectorAll('.subtab-content').forEach(content => {
                content.style.display = 'none';
            });

            // Show the target subtab
            const targetSubContent = document.getElementById(targetSubtab);
            if (targetSubContent) {
                targetSubContent.style.display = 'block';
            }
        });
    });

    // === Set default active tabs on load ===
    const defaultMainTab = document.querySelector('.tab-btn[data-tab="craftingTab"]');
    if (defaultMainTab) {
        defaultMainTab.click();
    }

    // Activate first subtab inside Crafting tab
    const defaultSubtab = document.querySelector('#craftingTab .subtab-btn[data-subtab="craftingOverview"]');
    if (defaultSubtab) {
        defaultSubtab.click();
    }

    console.log('✅ Tab system initialized successfully');
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
/* document.getElementById('toggleIncludeMU').addEventListener('change', (e) => {
    window.includeMUInCraftingCost = e.target.checked;
    
    // Recalculate and update overlay immediately
    if (typeof calculate === 'function') {
        calculate(); 
    }
    if (guiDebug) console.log("Crafting MU inclusion set to:", window.includeMUInCraftingCost);
}); */
// Run after DOM/stats are loaded


// Refresh overlay (reload)

console.log('✅appgui.js Initialized');