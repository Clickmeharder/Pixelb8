const ALL_PLANETS = [
    "Earth", "Calypso", "Monria/DSEC", "Rocktropia", "Howling Mine", "Toulan", 
    "Next Island", "Arkadia", "Arkadia Moon", "Cyrene", "Aris", "Setesh", "Foma", 
    "Crystal Palace", "Space", "Interplanetary", "private Contract", "S.U.S Contract", "Other"
];

let missions = [];
let collapsedPlanets = JSON.parse(localStorage.getItem('euColl_Planets')) || {};
let collapsedCats = JSON.parse(localStorage.getItem('euColl_Cats')) || {};

// --- INITIALIZATION ---

async function initDailyTimerApp() {
    const saved = localStorage.getItem('euMissions_v7');
    
    if (saved) {
        missions = JSON.parse(saved);
    } else {
        await loadDefaultJSON();
    }

    render(); // Full render on load
    
    // Efficiency: Update only text every second, not the whole HTML
    setInterval(updateTimers, 1000);
}

async function loadDefaultJSON() {
    try {
        const response = await fetch('./assets/data/dailymissions.json');
        const data = await response.json();
        
        // Map the JSON strings into working data
        missions = data.map(m => ({
            ...m,
            cd: parseCooldown(m.cd),
            readyAt: 0,
            inProgress: false
        }));
        
        saveAndRender();
    } catch (err) {
        console.error("Critical Error: Could not load missions.json", err);
        missions = []; 
    }
}

// --- CORE LOGIC ---

function saveAndRender() {
    localStorage.setItem('euMissions_v7', JSON.stringify(missions));
    render();
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

    if (action === 'start') {
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

function togglePlanet(p) {
    collapsedPlanets[p] = !collapsedPlanets[p];
    localStorage.setItem('euColl_Planets', JSON.stringify(collapsedPlanets));
    render();
}

function toggleCat(p, c) {
    collapsedCats[p + c] = !collapsedCats[p + c];
    localStorage.setItem('euColl_Cats', JSON.stringify(collapsedCats));
    render();
}

function collapseAll(val) {
    ALL_PLANETS.forEach(p => collapsedPlanets[p] = val);
    localStorage.setItem('euColl_Planets', JSON.stringify(collapsedPlanets));
    render();
}

function deleteMission(id) {
    if(confirm("Delete mission?")) {
        missions = missions.filter(m => m.id !== id);
        saveAndRender();
    }
}

function resetToDefaults() {
    if(confirm("Restore defaults? This wipes custom missions and progress!")) {
        localStorage.removeItem('euMissions_v7');
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
    
    // Update individual mission timers
    document.querySelectorAll('.timer-display').forEach(el => {
        const readyAt = parseInt(el.dataset.ready);
        if (readyAt <= now) {
            render(); // Only rerender the whole UI when a timer actually finishes
        } else {
            el.innerText = formatTime(readyAt - now);
        }
    });

    // Update planet header "Next:" timers
    ALL_PLANETS.forEach(planetName => {
        const planetSlug = planetName.replace(/[^a-z0-9]/gi, '');
        const nextEl = document.querySelector(`.next-timer-${planetSlug}`);
        if (!nextEl) return;

        const pMissions = missions.filter(m => m.planet.toLowerCase() === planetName.toLowerCase());
        const cdMissions = pMissions.filter(m => m.readyAt && m.readyAt > now);
        
        if (cdMissions.length > 0) {
            const closest = cdMissions.reduce((prev, curr) => (prev.readyAt < curr.readyAt) ? prev : curr);
            nextEl.innerText = ` Next: ${closest.name} (${formatTime(closest.readyAt - now)})`;
        }
    });
}

function copyWP(text) {
    navigator.clipboard.writeText(text);
    alert("Waypoint copied!");
}

// --- RESTORED RENDER ENGINE ---

const renderMission = (m) => {
    const isCD = m.readyAt && (m.readyAt > Date.now());
    const stateClass = m.inProgress ? 'in-progress' : (isCD ? 'on-cooldown' : '');
    
    return `
        <div class="mission-row ${stateClass}">
            <div class="mission-info">
                <h4>${m.name}</h4>
                <div class="mission-meta">
                    ${m.difficulty ? `<span class="diff-badge">${m.difficulty}</span>` : ''}
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
console.log('pixelb8-dailies.js version 1.0.4 - JSON Integrated');
console.log('pixelb8-dailies.js version 1.0.2');