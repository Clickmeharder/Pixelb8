const ALL_PLANETS = ["Earth", "Calypso", "Monria/DSEC", "Rocktropia", "Howling Mine", "Toulan", "Next Island", "Arkadia", "Arkadia Moon", "Cyrene", "Aris", "Setesh", "Foma", "Crystal Palace", "Space"];

let missions = [];
let collapsedPlanets = JSON.parse(localStorage.getItem('euColl_Planets')) || {};
let collapsedCats = JSON.parse(localStorage.getItem('euColl_Cats')) || {};

// --- INITIALIZATION ---

async function initApp() {
    const saved = localStorage.getItem('euMissions_v7');
    
    if (saved) {
        missions = JSON.parse(saved);
    } else {
        await loadDefaultJSON();
    }

    render();
    setInterval(render, 1000);
}

async function loadDefaultJSON() {
    try {
        const response = await fetch('./assets/data/dailymissions.json'); // Make sure path is correct
        const data = await response.json();
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

    if (totalMinutes <= 0) return alert("Set a cooldown time!");

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
    // Clear inputs
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
    if(confirm("Restore defaults? This wipes custom missions!")) {
        localStorage.removeItem('euMissions_v7');
        loadDefaultJSON();
    }
}

function exportMissions() {
    const blob = new Blob([JSON.stringify(missions, null, 2)], {type : 'application/json'});
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
            missions = JSON.parse(event.target.result);
            saveAndRender();
            alert("Imported!");
        } catch(err) { alert("Invalid File"); }
    };
    reader.readAsText(e.target.files[0]);
}

function parseCooldown(val) {
    if (typeof val === 'number') return val;
    let total = 0;
    const d = val.match(/(\d+)d/), h = val.match(/(\d+)h/), m = val.match(/(\d+)m/);
    if (d) total += d[1] * 1440;
    if (h) total += h[1] * 60;
    if (m) total += m[1] * 1;
    return total || parseInt(val) * 60 || 0;
}

function formatTime(ms) {
    let s = Math.max(0, Math.floor(ms / 1000));
    const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60), secs = s % 60;
    return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${secs}s`;
}

function copyWP(text) {
    navigator.clipboard.writeText(text);
    alert("Copied!");
}

// --- RENDER ENGINE ---

const renderMission = (m) => {
    const isCD = m.readyAt > Date.now();
    return `
        <div class="mission-row ${m.inProgress ? 'in-progress' : isCD ? 'on-cooldown' : ''}">
            <div class="mission-info">
                <h4>${m.name}</h4>
                <div class="mission-meta">
                    ${m.difficulty ? `<span class="diff-badge">${m.difficulty}</span>` : ''}
                    <span>${m.reward || ''}</span>
                    ${m.wp ? `<span class="wp-tag" onclick="event.stopPropagation(); copyWP('${m.wp}')">COPY WP</span>` : ''}
                </div>
            </div>
            <div class="status-text">
                ${m.inProgress ? 'ACTIVE' : isCD ? formatTime(m.readyAt - Date.now()) : 'READY'}
            </div>
            <div class="actions">
                ${!m.inProgress && !isCD ? `<button onclick="handleAction(${m.id},'start')">START</button>` : ''}
                ${m.inProgress ? `<button onclick="handleAction(${m.id},'finish')">FINISH</button>` : ''}
                ${isCD ? `<button onclick="handleAction(${m.id},'reset')">RESET</button>` : ''}
            </div>
            <button class="btn-delete" onclick="deleteMission(${m.id})">×</button>
        </div>`;
};

function render() {
    const container = document.getElementById('planetList');
    if (!container) return;
    container.innerHTML = ALL_PLANETS.map(pName => {
        const pMissions = missions.filter(m => m.planet === pName);
        if (!pMissions.length) return '';
        const isColl = collapsedPlanets[pName];
        const categories = [...new Set(pMissions.map(m => m.category))];
        return `
            <div class="planet-section ${isColl ? 'collapsedSection' : ''}">
                <div class="planet-header" onclick="togglePlanet('${pName}')">
                    <span>${pName}</span>
                    <i class="fa-solid ${isColl ? 'fa-caret-down' : 'fa-caret-up'}"></i>
                </div>
                <div class="planet-content">
                    ${categories.map(cat => {
                        const isCatColl = collapsedCats[pName + cat];
                        return `
                            <div class="category-wrapper ${isCatColl ? 'collapsedSection' : ''}">
                                <div class="category-header" onclick="event.stopPropagation(); toggleCat('${pName}','${cat}')">
                                    <span>${cat}</span>
                                </div>
                                <div class="category-content">
                                    ${pMissions.filter(m => m.category === cat).map(renderMission).join('')}
                                </div>
                            </div>`;
                    }).join('')}
                </div>
            </div>`;
    }).join('');
}

initApp();
console.log('pixelb8-dailies.js version 1.0.2');