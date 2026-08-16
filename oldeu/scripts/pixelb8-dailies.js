const ALL_PLANETS = [
    "Earth", "Calypso", "Monria/DSEC", "Rocktropia", "Howling Mine", "Toulan", 
    "Next Island", "Arkadia", "Arkadia Moon", "Cyrene", "Aris", "Setesh", "Foma", 
    "Crystal Palace", "Space", "Interplanetary", "private Contract", "S.U.S Contract", "Other"
];

//let missions = [];
window.missions = [];
let collapsedPlanets = JSON.parse(localStorage.getItem('euColl_Planets')) || {};
let collapsedCats = JSON.parse(localStorage.getItem('euColl_Cats')) || {};

// --- INITIALIZATION ---
// ================= WEB VERSION - INITIALIZATION =================
async function initDailyTimerApp() {
    console.log("🚀 Initializing Daily Mission Tracker (Web Version)...");

    // 1. Try to load saved user progress from localStorage
    const savedMissionsStr = localStorage.getItem('euMissions_v7');
    const savedPlanetsStr = localStorage.getItem('euColl_Planets');
    const savedCatsStr = localStorage.getItem('euColl_Cats');

    if (savedMissionsStr) {
        try {
            window.missions = JSON.parse(savedMissionsStr);
            console.log(`✅ Loaded ${window.missions.length} saved missions from localStorage`);
        } catch (e) {
            console.warn("⚠️ Saved missions data was corrupted. Loading defaults instead.");
            window.missions = [];
        }
    } else {
        console.log("ℹ️ No saved missions found → loading default template");
        await loadDefaultJSON();
    }

    // Load collapse states
    if (savedPlanetsStr) {
        try {
            collapsedPlanets = JSON.parse(savedPlanetsStr);
        } catch (e) {
            collapsedPlanets = {};
        }
    }

    if (savedCatsStr) {
        try {
            collapsedCats = JSON.parse(savedCatsStr);
        } catch (e) {
            collapsedCats = {};
        }
    }

    // Final render + start timer
    render();
    setInterval(updateTimers, 1000);

    console.log("✅ Daily Mission Tracker initialized successfully");
}
/* async function initDailyTimerApp() {
    // 1. Load user-specific progress from Electron AppData (user_memory folder)
    // This replaces localStorage.getItem
    const savedMissions = await window.electronAPI.loadAppState('euMissions_v7');
    const savedPlanets = await window.electronAPI.loadAppState('euColl_Planets');
    const savedCats = await window.electronAPI.loadAppState('euColl_Cats');

    if (savedMissions) {
        window.missions = savedMissions;
    } else {
        // 2. If no user save exists, load the "Master Template" from data/nexus/
        await loadDefaultJSON();
    }

    collapsedPlanets = savedPlanets || {};
    collapsedCats = savedCats || {};

    render(); 
    setInterval(updateTimers, 1000);
} */
/* async function loadDefaultJSON() {
    try {
        // 🟢 FIX: Use your new bridge instead of fetch()
        const data = await window.electronAPI.readMissionJSON('dailymissions.json');
        
        if (data) {
            missions = data.map(m => ({
                ...m,
                cd: parseCooldown(m.cd),
                readyAt: 0,
                inProgress: false
            }));
            // Save this initial state to the user's AppData immediately
            await saveAndRender();
            console.log("✅ Successfully initialized missions from dailymissions.json");
        } else {
            console.error("❌ Critical Error: readMissionJSON returned null. Check data/nexus/ path.");
        }
    } catch (err) {
        console.error("❌ Critical Error: Failed to invoke readMissionJSON", err);
    }
}
// --- CORE LOGIC ---

// --- UPDATED PERSISTENCE ---

async function saveAndRender() {
    // This replaces localStorage.setItem
    await window.electronAPI.saveAppState('euMissions_v7', missions);
    render();
} */
// ================= WEB VERSION - LOAD DEFAULT MISSIONS =================
async function loadDefaultJSON() {
    console.log("🔄 Loading default missions from dailymissions.json...");

    try {
        // Try multiple common paths (in case of different folder setups)
        const possiblePaths = [
            './data/nexus/dailymissions.json',
            'data/nexus/dailymissions.json',
            '../data/nexus/dailymissions.json'
        ];

        let data = null;

        for (const path of possiblePaths) {
            try {
                const response = await fetch(path);
                if (response.ok) {
                    data = await response.json();
                    console.log(`✅ Loaded missions from: ${path}`);
                    break;
                }
            } catch (e) {
                // try next path
            }
        }

        if (!data) {
            console.error("❌ Could not find dailymissions.json in any expected path.");
            // Create a minimal fallback so the UI isn't empty
            window.missions = [{
                id: Date.now(),
                planet: "Calypso",
                category: "General",
                name: "Sample Daily Mission (JSON not found)",
                cd: 120,           // 2 hours
                type: "Regular",
                wp: "",
                reward: "Test Reward",
                readyAt: 0,
                inProgress: false
            }];
            saveAndRender();
            return;
        }

        if (Array.isArray(data)) {
            window.missions = data.map(m => ({
                ...m,
                cd: parseCooldown(m.cd),
                readyAt: 0,
                inProgress: false
            }));

            console.log(`✅ Successfully loaded ${window.missions.length} default missions`);
            saveAndRender();
        } else {
            console.error("❌ dailymissions.json is not a valid array");
        }
    } catch (err) {
        console.error("❌ Error loading default missions:", err);
    }
}

// ================= WEB VERSION - SAVE & RENDER =================
// Helper to save collapse states + missions to localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem('euMissions_v7', JSON.stringify(window.missions));
        localStorage.setItem('euColl_Planets', JSON.stringify(collapsedPlanets));
        localStorage.setItem('euColl_Cats', JSON.stringify(collapsedCats));
    } catch (err) {
        console.warn("Failed to save to localStorage", err);
    }
}
function saveAndRender() {
    saveToLocalStorage();
    render();
    console.log(`💾 Saved & Rendering`);
}
function addMission() {
    const d = parseInt(document.getElementById('mDays').value) || 0;
    const h = parseInt(document.getElementById('mHrs').value) || 0;
    const m = parseInt(document.getElementById('mMins').value) || 0;
    const totalMinutes = (d * 1440) + (h * 60) + m;

    if (totalMinutes <= 0) return alert("Please set a cooldown time!");

    missions.push({
        id: Date.now(),
        planet: document.getElementById('mPlanet').value,
        category: document.getElementById('mCat').value || "General",
        name: document.getElementById('mName').value || "Unnamed",
        cd: totalMinutes,
        type: document.getElementById('mType').value,
        wp: document.getElementById('mWp').value,
        reward: document.getElementById('mReward').value,
        readyAt: 0,
        inProgress: false
    });

    saveAndRender();
    ['mName', 'mCat', 'mWp', 'mReward', 'mDays', 'mHrs', 'mMins'].forEach(id => document.getElementById(id).value = "");
}

function handleAction(id, action) {
    const m = missions.find(x => x.id === id);
    if (!m) return;
    // 🔊 Play your existing UI click sound
    if (typeof window.playSound === 'function') {
        window.playSound('ui-click');
    }
    if (action === 'start') {
		if (typeof window.speakText === 'function') {
            window.speakText(`Accepted ${m.name} on ${m.planet}`);
        }
        if (m.type === 'SOR') m.readyAt = Date.now() + (m.cd * 60000);
        else m.inProgress = true;
    } else if (action === 'finish') {
        m.readyAt = Date.now() + (m.cd * 60000);
        m.inProgress = false;
    } else if (action === 'reset') {
        m.readyAt = 0;
        m.inProgress = false;
    }
    saveAndRender();
}
// --- UI HELPERS ---
// ================= WEB VERSION - COLLAPSE & ACTION FUNCTIONS =================

async function togglePlanet(p) {
    collapsedPlanets[p] = !collapsedPlanets[p];
    saveToLocalStorage();   // Uses localStorage instead of Electron
    render();
}

async function toggleCat(p, c) {
    const key = p + c;
    collapsedCats[key] = !collapsedCats[key];
    saveToLocalStorage();   // Uses localStorage instead of Electron
    render();
}

function collapseAll(val) {
    ALL_PLANETS.forEach(p => collapsedPlanets[p] = val);
    saveToLocalStorage();
    render();
}

function deleteMission(id) {
    if (confirm("Delete mission?")) {
        window.missions = window.missions.filter(m => m.id !== id);
        saveAndRender();
    }
}

function resetToDefaults() {
    if (confirm("Restore defaults? This wipes custom missions and progress!")) {
        localStorage.removeItem('euMissions_v7');
        localStorage.removeItem('euColl_Planets');
        localStorage.removeItem('euColl_Cats');
        
        // Reset in-memory objects too
        collapsedPlanets = {};
        collapsedCats = {};
        
        loadDefaultJSON();
    }
}

// --- IMPORT / EXPORT ---

function exportMissions() {
    const dataStr = JSON.stringify(missions, null, 2);
    const blob = new Blob([dataStr], {type : 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eu_missions_backup.json';
    a.click();
}

function importMissionsClick() { document.getElementById('importFile').click(); }

function handleImport(e) {
    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            if (Array.isArray(importedData)) {
                missions = importedData;
                saveAndRender();
                alert("Imported successfully!");
            }
        } catch(err) { alert("Invalid JSON File"); }
    };
    reader.readAsText(e.target.files[0]);
    e.target.value = '';
}

// --- PARSERS & FORMATTERS ---

function parseCooldown(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    let total = 0;
    const d = value.match(/(\d+)\s*d/), h = value.match(/(\d+)\s*h/), m = value.match(/(\d+)\s*m/);
    if (d) total += parseInt(d[1]) * 1440;
    if (h) total += parseInt(h[1]) * 60;
    if (m) total += parseInt(m[1]);
    if (total === 0 && !isNaN(value) && value !== "") total = parseInt(value) * 60;
    return total;
}

function formatTime(ms) {
    if (ms < 0) return "0h 0m 0s";
    let s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), secs = s % 60;
    return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${secs}s`;
}


 function updateTimers() {
    const now = Date.now();
    let missionFinished = false;
    
    // We'll use this to track the 'closest' timer for every planet in one go
    const planetNextTimers = {};

    // 1. SINGLE PASS: Update logic & prep planet timers
    window.missions.forEach(m => {
        // Handle missions that just finished
        if (m.readyAt > 0 && m.readyAt <= now) {
            m.readyAt = 0; 
            missionFinished = true; 
            
            if (typeof window.playSound === 'function') window.playSound('mission-done');
            if (typeof window.speakText === 'function') {
                setTimeout(() => {
                    window.speakText(`${m.name} on ${m.planet} is ready`);
                }, 500); 
            }
        }

        // If it's still counting down, check if it's the 'soonest' for its planet
        if (m.readyAt > now) {
            const pName = m.planet;
            if (!planetNextTimers[pName] || m.readyAt < planetNextTimers[pName].readyAt) {
                planetNextTimers[pName] = { 
                    name: m.name, 
                    readyAt: m.readyAt,
                    slug: pName.replace(/[^a-z0-9]/gi, '')
                };
            }
        }
    });

    // 2. RE-RENDER & EXIT: If state changed, don't waste time on manual DOM updates
    if (missionFinished) {
        if (typeof saveAndRender === 'function') saveAndRender();
        return; 
    }

    // 3. OPTIMIZED DOM UPDATE: Update individual countdown labels
    // We target only elements that HAVE a countdown to avoid looping empty spans
    document.querySelectorAll('.timer-display[data-ready]').forEach(el => {
        const readyAt = parseInt(el.dataset.ready);
        if (readyAt > now) {
            el.innerText = formatTime(readyAt - now);
        } else {
            // Cleanup: if it passed while we were looking, clear the label
            el.innerText = "READY";
            el.removeAttribute('data-ready');
        }
    });

    // 4. FAST PLANET HEADER UPDATES:
    // Instead of filtering the whole mission list per planet, we just iterate 
    // the small object we built in Step 1.
    for (const [planetName, data] of Object.entries(planetNextTimers)) {
        const nextEl = document.querySelector(`.next-timer-${data.slug}`);
        if (nextEl) {
            nextEl.innerText = ` Next: ${data.name} (${formatTime(data.readyAt - now)})`;
        }
    }
}
function copyWP(text) {
    navigator.clipboard.writeText(text);
    alert("Waypoint copied!");
}

// --- RESTORED RENDER ENGINE ---

const renderMission = (m) => {
    const isCD = m.readyAt && (m.readyAt > Date.now());
    const stateClass = m.inProgress ? 'in-progress' : (isCD ? 'on-cooldown' : '');
    
    // Helper to get difficulty class
    const getDiffClass = (diff) => {
        if (!diff) return '';
        const d = diff.toLowerCase();
        if (d.includes('very easy')) return 'diff-v-easy';
        if (d.includes('easy')) return 'diff-easy';
        if (d.includes('medium')) return 'diff-medium';
        if (d.includes('hard')) return 'diff-hard';
        if (d.includes('very hard') || d.includes('extreme')) return 'diff-v-hard';
        return '';
    };

    const diffClass = getDiffClass(m.difficulty);
    
    return `
        <div class="mission-row ${stateClass}">
            <div class="mission-info">
                <h4>${m.name}</h4>
                <div class="mission-meta">
                    ${m.difficulty ? `<span class="diff-badge ${diffClass}">${m.difficulty}</span>` : ''}
                    <span>${m.reward || ''}</span>
                    ${m.wp ? `<span class="wp-tag" data-action="copy-wp" data-wp="${m.wp}">COPY WP</span>` : ''}
                </div>
            </div>
            <div class="status-text">
                ${m.inProgress ? '<span class="status-active">ACTIVE</span>' : 
                  isCD ? `<span class="status-timer timer-display" data-ready="${m.readyAt}" data-id="${m.id}">${formatTime(m.readyAt - Date.now())}</span>` : 
                  '<span class="status-ready">READY</span>'}
            </div>
            <div class="actions">
                ${!m.inProgress && !isCD ? `<button class="btn-start" data-action="start" data-id="${m.id}">START</button>` : ''}
                ${m.inProgress ? `<button class="btn-finish" data-action="finish" data-id="${m.id}">FINISH</button>` : ''}
                ${isCD ? `<button class="btn-reset" data-action="reset" data-id="${m.id}">RESET</button>` : ''}
            </div>
            <button class="btn-delete" data-action="delete" data-id="${m.id}">×</button>
        </div>`;
};

const renderCategory = (planetName, cat, pMissions) => {
    const catKey = planetName + cat;
    const isCatColl = collapsedCats[catKey];
    const missionsInCat = pMissions.filter(m => m.category === cat);
    
    return `
        <div class="category-wrapper ${isCatColl ? 'collapsedSection' : ''}">
            <div class="category-header" data-action="toggle-cat" data-planet="${planetName}" data-cat="${cat}">
                <span>${cat}</span>
                <i class="fa-solid ${isCatColl ? 'fa-plus' : 'fa-minus'}"></i>
            </div>
            <div class="category-content">
                ${missionsInCat.map(renderMission).join('')}
            </div>
        </div>`;
};

const renderPlanet = (planetName) => {
    const pMissions = missions.filter(m => m.planet.toLowerCase() === planetName.toLowerCase());
    if (pMissions.length === 0) return ''; 

    const now = Date.now();
    const readyMissions = pMissions.filter(m => (!m.readyAt || m.readyAt <= now) && !m.inProgress);
    const cdMissions = pMissions.filter(m => m.readyAt && m.readyAt > now);
    
    const readyCount = readyMissions.length;
    const cdCount = cdMissions.length;
    const progressPct = (readyCount / pMissions.length) * 100;
    const isPlanetCollapsed = collapsedPlanets[planetName];
    const categories = [...new Set(pMissions.map(m => m.category))];
    const planetSlug = planetName.replace(/[^a-z0-9]/gi, ''); // Removes spaces/slashes for safe class names

    let closestMissionHtml = '';
    if (cdCount > 0) {
        const closest = cdMissions.reduce((prev, curr) => (prev.readyAt < curr.readyAt) ? prev : curr);
        closestMissionHtml = `<span class="closest-timer next-timer-${planetSlug}"> Next: ${closest.name} (${formatTime(closest.readyAt - now)})</span>`;
    }

    return `
        <div class="planet-section ${isPlanetCollapsed ? 'collapsedSection' : ''}">
            <div class="progress-container"><div class="progress-fill" style="width: ${progressPct}%"></div></div>
            <div class="planet-header" data-action="toggle-planet" data-planet="${planetName}">
                <span><i class="fa-solid ${isPlanetCollapsed ? 'fa-square-plus' : 'fa-planet-ringed'}"></i> ${planetName}</span>
                <div class="header-stats">
                    <span class="stat-cd">${cdCount} on CD</span>
                    <span class="stat-ready">${readyCount} Ready</span>
                    ${closestMissionHtml}
                    <i class="fa-solid ${isPlanetCollapsed ? 'fa-caret-down' : 'fa-caret-up'}"></i>
                </div>
            </div>
            <div class="planet-content">
                ${categories.map(cat => renderCategory(planetName, cat, pMissions)).join('')}
            </div>
        </div>`;
};
function render() {
    const container = document.getElementById('planetList');
    if (!container) return;
    container.innerHTML = ALL_PLANETS.map(renderPlanet).join('');
}
document.addEventListener('DOMContentLoaded', () => {
    // 1. Menu Toggle
    document.getElementById('btn-menu-toggle')?.addEventListener('click', toggleMenu);

    // 2. Add Mission
    document.getElementById('btn-add-mission')?.addEventListener('click', addMission);

    // 3. Export Data
    document.getElementById('btn-export')?.addEventListener('click', exportMissions);

    // 4. Import Data Trigger
    const fileInput = document.getElementById('importFile');
    document.getElementById('btn-import')?.addEventListener('click', () => fileInput.click());
    fileInput?.addEventListener('change', (event) => handleImport(event));

    // 5. Reset Defaults
    document.getElementById('btn-reset')?.addEventListener('click', resetToDefaults);

    // 6. Global Collapse/Expand
    document.getElementById('btn-collapse')?.addEventListener('click', () => collapseAll(true));
    document.getElementById('btn-expand')?.addEventListener('click', () => collapseAll(false));

    // --- NEW: THE EVENT DELEGATE FOR DYNAMIC CONTENT ---
    // This handles all clicks inside the mission list (Planets, Categories, Buttons)
    const planetList = document.getElementById('planetList');
    if (planetList) {
        planetList.addEventListener('click', (e) => {
            // Find the closest element that has a data-action attribute
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.getAttribute('data-action');
            const id = target.getAttribute('data-id');
            const planet = target.getAttribute('data-planet');
            const cat = target.getAttribute('data-cat');
            const wp = target.getAttribute('data-wp');

            // Handle the specific action
            switch (action) {
                case 'toggle-planet':
                    togglePlanet(planet);
                    break;
                case 'toggle-cat':
                    toggleCat(planet, cat);
                    break;
                case 'start':
                case 'finish':
                case 'reset':
                    handleAction(parseInt(id), action);
                    break;
                case 'delete':
                    deleteMission(parseInt(id));
                    break;
                case 'copy-wp':
                    copyWP(wp);
                    break;
            }
        });
    }
});
// Start everything
initDailyTimerApp();
console.log('✅ Daily Mission Tracker Initiatalized');
