// =============================================
// MISSIONS TRACKER - WEB VERSION (No Electron)
// =============================================

const ALL_PLANETS = [
    "Earth", "Calypso", "Monria/DSEC", "Rocktropia", "Howling Mine", "Toulan",
    "Next Island", "Arkadia", "Arkadia Moon", "Cyrene", "Aris", "Setesh", "Foma",
    "Crystal Palace", "Space", "Interplanetary", "private Contract", "S.U.S Contract", "Other"
];

window.missions = [];
let collapsedPlanets = JSON.parse(localStorage.getItem('euColl_Planets')) || {};
let collapsedCats = JSON.parse(localStorage.getItem('euColl_Cats')) || {};

// --- INITIALIZATION ---
async function initDailyTimerApp() {
    console.log("🚀 Initializing Daily Mission Tracker (Web Version)...");

    // Try to load saved user progress from localStorage
    const savedMissions = localStorage.getItem('euMissions_v7');
    
    if (savedMissions) {
        try {
            window.missions = JSON.parse(savedMissions);
            console.log(`✅ Loaded ${window.missions.length} saved missions from localStorage`);
        } catch (e) {
            console.warn("⚠️ Corrupt saved missions, loading defaults...");
            await loadDefaultJSON();
        }
    } else {
        // No saved data → load master template
        await loadDefaultJSON();
    }

    render();
    setInterval(updateTimers, 1000);
    console.log("✅ Mission Tracker ready");
}

// Load default missions from JSON file
async function loadDefaultJSON() {
    try {
        const response = await fetch('./data/nexus/dailymissions.json');
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();

        if (Array.isArray(data)) {
            window.missions = data.map(m => ({
                ...m,
                cd: parseCooldown(m.cd),
                readyAt: 0,
                inProgress: false
            }));

            // Save this initial state
            saveToLocalStorage();
            console.log(`✅ Loaded ${window.missions.length} default missions from dailymissions.json`);
        } else {
            console.error("❌ dailymissions.json is not a valid array");
        }
    } catch (err) {
        console.error("❌ Failed to load dailymissions.json:", err);
        // Fallback: create empty array
        window.missions = [];
    }
}

// --- PERSISTENCE (localStorage) ---
function saveToLocalStorage() {
    try {
        localStorage.setItem('euMissions_v7', JSON.stringify(window.missions));
        localStorage.setItem('euColl_Planets', JSON.stringify(collapsedPlanets));
        localStorage.setItem('euColl_Cats', JSON.stringify(collapsedCats));
    } catch (e) {
        console.warn("Failed to save to localStorage", e);
    }
}

function saveAndRender() {
    saveToLocalStorage();
    render();
}

// --- CORE FUNCTIONS ---
function addMission() {
    const d = parseInt(document.getElementById('mDays').value) || 0;
    const h = parseInt(document.getElementById('mHrs').value) || 0;
    const m = parseInt(document.getElementById('mMins').value) || 0;
    const totalMinutes = (d * 1440) + (h * 60) + m;

    if (totalMinutes <= 0) {
        alert("Please set a cooldown time!");
        return;
    }

    window.missions.push({
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

    // Clear form
    ['mName', 'mCat', 'mWp', 'mReward', 'mDays', 'mHrs', 'mMins'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = "";
    });
}

function handleAction(id, action) {
    const m = window.missions.find(x => x.id === id);
    if (!m) return;

    if (typeof window.playSound === 'function') {
        window.playSound('ui-click');
    }

    if (action === 'start') {
        if (typeof window.speakText === 'function') {
            window.speakText(`Accepted ${m.name} on ${m.planet}`);
        }
        if (m.type === 'SOR') {
            m.readyAt = Date.now() + (m.cd * 60000);
        } else {
            m.inProgress = true;
        }
    } 
    else if (action === 'finish') {
        m.readyAt = Date.now() + (m.cd * 60000);
        m.inProgress = false;
    } 
    else if (action === 'reset') {
        m.readyAt = 0;
        m.inProgress = false;
    }

    saveAndRender();
}

async function togglePlanet(p) {
    collapsedPlanets[p] = !collapsedPlanets[p];
    saveToLocalStorage();
    render();
}

async function toggleCat(p, c) {
    const key = p + c;
    collapsedCats[key] = !collapsedCats[key];
    saveToLocalStorage();
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
    if (confirm("Restore defaults? This will wipe all custom missions and progress!")) {
        localStorage.removeItem('euMissions_v7');
        loadDefaultJSON().then(() => {
            render();
        });
    }
}

// --- IMPORT / EXPORT ---
function exportMissions() {
    const dataStr = JSON.stringify(window.missions, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'eu_missions_backup.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importMissionsClick() {
    document.getElementById('importFile').click();
}

function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const importedData = JSON.parse(event.target.result);
            if (Array.isArray(importedData)) {
                window.missions = importedData;
                saveAndRender();
                alert("✅ Missions imported successfully!");
            } else {
                alert("Invalid file format");
            }
        } catch (err) {
            alert("❌ Invalid JSON file");
        }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// --- PARSERS & FORMATTERS ---
function parseCooldown(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;

    let total = 0;
    const d = value.match(/(\d+)\s*d/);
    const h = value.match(/(\d+)\s*h/);
    const m = value.match(/(\d+)\s*m/);

    if (d) total += parseInt(d[1]) * 1440;
    if (h) total += parseInt(h[1]) * 60;
    if (m) total += parseInt(m[1]);

    if (total === 0 && !isNaN(value) && value !== "") {
        total = parseInt(value) * 60;
    }
    return total;
}

function formatTime(ms) {
    if (ms < 0) return "0h 0m 0s";
    let s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    return d > 0 ? `${d}d ${h}h ${m}m` : `${h}h ${m}m ${secs}s`;
}

// --- TIMER UPDATE ---
function updateTimers() {
    const now = Date.now();
    let missionFinished = false;

    window.missions.forEach(m => {
        if (m.readyAt > 0 && m.readyAt <= now) {
            m.readyAt = 0;
            missionFinished = true;

            if (typeof window.playSound === 'function') window.playSound('mission-done');
            if (typeof window.speakText === 'function') {
                setTimeout(() => window.speakText(`${m.name} on ${m.planet} is ready`), 500);
            }
        }
    });

    if (missionFinished) {
        saveAndRender();
        return;
    }

    // Update visible timers
    document.querySelectorAll('.timer-display[data-ready]').forEach(el => {
        const readyAt = parseInt(el.dataset.ready);
        if (readyAt > now) {
            el.innerText = formatTime(readyAt - now);
        } else {
            el.innerText = "READY";
            el.removeAttribute('data-ready');
        }
    });
}

// --- RENDER FUNCTIONS (unchanged) ---
const renderMission = (m) => { /* your existing renderMission code */ };
const renderCategory = (planetName, cat, pMissions) => { /* your existing code */ };
const renderPlanet = (planetName) => { /* your existing code */ };

function render() {
    const container = document.getElementById('planetList');
    if (!container) return;
    container.innerHTML = ALL_PLANETS.map(renderPlanet).join('');
}

// --- EVENT DELEGATION ---
document.addEventListener('DOMContentLoaded', () => {
    // Button listeners
    document.getElementById('btn-add-mission')?.addEventListener('click', addMission);
    document.getElementById('btn-export')?.addEventListener('click', exportMissions);
    document.getElementById('btn-import')?.addEventListener('click', importMissionsClick);
    document.getElementById('importFile')?.addEventListener('change', handleImport);
    document.getElementById('btn-reset')?.addEventListener('click', resetToDefaults);

    // Collapse buttons
    document.getElementById('btn-collapse')?.addEventListener('click', () => collapseAll(true));
    document.getElementById('btn-expand')?.addEventListener('click', () => collapseAll(false));

    // Main delegation for dynamic content
    const planetList = document.getElementById('planetList');
    if (planetList) {
        planetList.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action]');
            if (!target) return;

            const action = target.dataset.action;
            const id = parseInt(target.dataset.id);
            const planet = target.dataset.planet;
            const cat = target.dataset.cat;
            const wp = target.dataset.wp;

            switch (action) {
                case 'toggle-planet': togglePlanet(planet); break;
                case 'toggle-cat': toggleCat(planet, cat); break;
                case 'start':
                case 'finish':
                case 'reset': handleAction(id, action); break;
                case 'delete': deleteMission(id); break;
                case 'copy-wp': if (wp) navigator.clipboard.writeText(wp); break;
            }
        });
    }

    // Start the app
    initDailyTimerApp();
});

console.log('✅ Daily Mission Tracker Initialized (Web Version)');