

const ALL_PLANETS = [
    "Earth", "Calypso", "Monria/DSEC", "Rocktropia", "Howling Mine", "Toulan", 
    "Next Island", "Arkadia", "Arkadia Moon", "Cyrene", "Aris", "Setesh", "Foma", 
    "Crystal Palace", "Space"
];

let collapsedPlanets = JSON.parse(localStorage.getItem('euColl_Planets')) || {};
let collapsedCats = JSON.parse(localStorage.getItem('euColl_Cats')) || {};
//
    const defaultMissions = [
		{ id: 1, planet: "Calypso", category: "Daily Terminal", name: "Daily Hunting 1", cd: 21h, type: "SOR", reward: "1 Token (+20 Bonus)", wp: "/wp [Calypso, 61955, 76163, 138, Daily Mission Terminal]", difficulty: "Easy" },
        { id: 2, planet: "Calypso", category: "Daily Terminal", name: "Daily Hunting 2", cd: 21h, type: "SOR", reward: "1 Token (+20 Bonus)",  wp: "/wp [Calypso, 61955, 76163, 138, Daily Mission Terminal]", difficulty: "Medium" },
        { id: 3, planet: "Calypso", category: "Daily Terminal", name: "Daily Hunting 3", cd: 21h, type: "SOR", reward: "1 Token (+20 Bonus)", wp: "/wp [Calypso, 61955, 76163, 138, Daily Mission Terminal]", difficulty: "Hard" },
        { id: 4, planet: "Calypso", category: "Daily Terminal", name: "Daily Crafting", cd: 21h, type: "SOR", reward: "1 Token (+10 Bonus)", wp: "/wp [Calypso, 61955, 76163, 138, Daily Mission Terminal]", difficulty: "Easy" },
        { id: 5, planet: "Calypso", category: "Daily Terminal", name: "Daily Mining", cd: 21h, type: "SOR", reward: "1-2 Token (+20 Bonus)", wp: "/wp [Calypso, 61955, 76163, 138, Daily Mission Terminal]", difficulty: "Easy" },
        { id: 6, planet: "Calypso", category: "misc", name: "Feffoid Cave (Instance)", cd: 21h, type: "SOF", reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]" },
        { id: 7, planet: "Calypso", category: "misc", name: "Argo Cave (Instance)", cd: 21h, type: "SOF", reward: "1 Token", wp: "/wp [Calypso, 62719, 76117, 102, Waypoint]" },
        { id: 8, planet: "Calypso", category: "misc", name: "Jinn's Minions (Shared)", cd: 21h, type: "SOF", reward: "4 Tokens", wp: "/wp [Calypso, 68245, 79062, 361, Waypoint]" },
        { id: 9, planet: "Calypso", category: "misc", name: "Bloodclaw (Contaminated)", cd: 21h, type: "SOF", reward: "6 Tokens", wp: "/wp [Calypso, 79580, 87787, 243, Waypoint]" },
        { id: 10, planet: "Calypso", category: "AI", name: "Alice Laurent", cd: 21h, type: "SOR", reward: "AI Reward", wp: "/wp [Calypso, 63225, 74453, 131, Alice Laurent]", difficulty: "Very Easy" },
        { id: 11, planet: "Calypso", category: "AI", name: "Boris", cd: 21h, type: "SOR", reward: "AI Reward", wp: "/wp [Calypso, 61955, 76163, 138, Boris]", difficulty: "Easy" },
        { id: 12, planet: "Calypso", category: "AI", name: "Lauren Ashford", cd: 21h, type: "SOR", reward: "AI Reward", wp: "/wp [Calypso, 63344, 87480, 126, Lauren Ashford]", difficulty: "Medium" },
        { id: 13, planet: "Calypso", category: "AI", name: "Leia Cassidy", cd: 21h, type: "SOR", reward: "AI Reward", wp: "/wp [Calypso, 80538, 68314, 160, Leia Cassidy]", difficulty: "Hard" },
        { id: 14, planet: "Calypso", category: "AI", name: "Hanna Hendrix", cd: 21h, type: "SOR", reward: "AI Reward", wp: "/wp [Calypso, 35469, 60113, 240, Hanna Hendrix]", difficulty: "Hard" },
        { id: 15, planet: "Calypso", category: "AI", name: "Hans Kaufman", cd: 21h, type: "SOR", reward: "AI Reward", wp: "/wp [Calypso, 37054, 53560, 179, Hans Kaufman]", difficulty: "Hard" },
        { id: 16, planet: "Calypso", category: "AI", name: "Bobby", cd: 21h, type: "SOR", reward: "AI Reward", wp: "/wp [Calypso, 37021h, 53551, 179, Bobby]", difficulty: "Hard" },
        { id: 17, planet: "Calypso", category: "AI", name: "Thorleif Schtoll", cd: 21h, type: "SOR", reward: "AI Reward", wp: "/wp [Calypso, 80459, 68299, 163, Thorleif Schtoll]", difficulty: "Very Hard" },
        { id: 100, planet: "Aris", category: "misc", name: "Arkadia Placeholder 1", cd: 21h, type: "SOR", reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]", difficulty: "Easy"  },
		// SETESH
		{ id: 101, planet: "Setesh", category: "misc", name: "Arkadia Placeholder 1", cd: 21h, type: "SOR", reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]", difficulty: "Easy"  },
		// FOMA
		{ id: 102, planet: "Foma", category: "misc", name: "Arkadia Placeholder 1", cd: 21h, type: "SOR", reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]", difficulty: "Easy"  },
		// CRYSTAL PALACE
		{ id: 103, planet: "Crystal Palace", category: "misc", name: "Arkadia Placeholder 1", type: "SOR", cd: 21h, reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]", difficulty: "Easy"  },
        // MONRIA/DSEC
		{ id: 104, planet: "Monria/DSEC", category: "misc", name: "Monria Placeholder 1", cd: 21h, type: "SOR", reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]", difficulty: "Easy"  },
		// ROCKTROPIA
		{ id: 105, planet: "Rocktropia", category: "misc", name: "Arkadia Placeholder 1", cd: 21h, type: "SOR", reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]", difficulty: "Easy"  },
		// HOWLING MINE
		{ id: 106, planet: "Howling Mine", category: "misc", name: "Arkadia Placeholder 1", cd: 21h, type: "SOR", reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]", difficulty: "Easy"  },
		// TOULAN
        { id: 107, planet: "Toulan", category: "misc", name: "Arkadia Placeholder 1", cd: 21h, type: "SOR", reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]", difficulty: "Easy"  },
		// NEXT ISLAND
        { id: 108, planet: "Next Island", category: "misc", name: "Arkadia Placeholder 1", cd: 21h, type: "SOR", reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]", difficulty: "Easy"  },
		// ARKADIA
        { id: 109, planet: "Arkadia", category: "misc", name: "Toulan Placeholder 1", cd: 7d, type: "SOR", reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]", difficulty: "Easy"  },
		// CYRENE
        { id: 111, planet: "Cyrene", category: "misc", name: "Cyrene Placeholder 1", cd: 1h 30m, type: "SOR", reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]", difficulty: "Easy"  },
		// SPACE
		{ id: 112, planet: "Space", category: "misc", name: "Arkadia Placeholder 1", cd: 16h, type: "SOR", reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]", difficulty: "Easy"  }
		
    ];

let missions = JSON.parse(localStorage.getItem('euMissions_v7'));

if (!missions) {
    // Parse the default missions only the first time
    missions = defaultMissions.map(m => ({
        ...m,
        cd: parseCooldown(m.cd)
    }));
}
// --- CORE FUNCTIONS ---

function saveAndRender() {
    localStorage.setItem('euMissions_v7', JSON.stringify(missions));
    render();
}

function addMission() {
    const name = document.getElementById('mName').value;
    const cat = document.getElementById('mCat').value || "General";
    const planet = document.getElementById('mPlanet').value;
    const type = document.getElementById('mType').value;
    const wp = document.getElementById('mWp').value;
    const reward = document.getElementById('mReward').value;

    // Get the new time values (default to 0 if empty)
    const cdRaw = document.getElementById('mCD').value; // e.g., "1d 12h"
    const totalMinutes = parseCooldown(cdRaw);

    if (totalMinutes <= 0) {
        alert("Please set a cooldown time!");
        return;
    }

    missions.push({
        id: Date.now(),
        planet: planet,
        category: cat,
        name: name || "Unnamed",
        cd: totalMinutes, // Now storing in minutes!
        type: type,
        wp: wp,
        reward: reward,
        readyAt: 0,
        inProgress: false
    });
    saveAndRender();
}

function handleAction(id, action) {
    const m = missions.find(x => x.id === id);
    if (!m) return;

    if (action === 'start') {
        if (m.type === 'SOR') {
            m.readyAt = Date.now() + (m.cd * 60 * 1000); // Minutes * 60sec * 1000ms
            m.inProgress = false;
        } else {
            m.inProgress = true;
        }
    } else if (action === 'finish') {
        m.readyAt = Date.now() + (m.cd * 60 * 1000); // Minutes * 60sec * 1000ms
        m.inProgress = false;
    } else if (action === 'reset') {
        m.readyAt = 0;
        m.inProgress = false;
    }
    saveAndRender();
}

// --- UI CONTROLS ---

function togglePlanet(p) {
    // Force boolean toggle
    collapsedPlanets[p] = !collapsedPlanets[p];
    localStorage.setItem('euColl_Planets', JSON.stringify(collapsedPlanets));
    render();
}

function toggleCat(p, c) {
    const key = p + c;
    collapsedCats[key] = !collapsedCats[key];
    localStorage.setItem('euColl_Cats', JSON.stringify(collapsedCats));
    render();
}

function collapseAll(shouldCollapse) {
    ALL_PLANETS.forEach(p => {
        collapsedPlanets[p] = shouldCollapse;
    });
    localStorage.setItem('euColl_Planets', JSON.stringify(collapsedPlanets));
    render();
}

function copyWP(text) {
    navigator.clipboard.writeText(text);
    // Simple non-intrusive log instead of alert if preferred, but alert is fine for now
    alert("Waypoint copied!");
}

function deleteMission(id) {
    if(confirm("Delete this mission?")) {
        missions = missions.filter(m => m.id !== id);
        saveAndRender();
    }
}
// HELPER: Converts strings like "1d 21h" or "45m" into total minutes
function parseToMinutes(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    
    let total = 0;
    const d = value.match(/(\d+)\s*d/);
    const h = value.match(/(\d+)\s*h/);
    const m = value.match(/(\d+)\s*m/);

    if (d) total += parseInt(d[1]) * 1440;
    if (h) total += parseInt(h[1]) * 60;
    if (m) total += parseInt(m[1]);

    // Fallback: If just a number string like "21", assume hours
    if (total === 0 && !isNaN(value) && value !== "") total = parseInt(value) * 60;
    
    return total;
}
function formatTime(ms) {
    if (ms < 0) return "0h 0m 0s";
    let s = Math.floor(ms / 1000);
    const d = Math.floor(s / 86400);
    const h = Math.floor((s % 86400) / 3600);
    const m = Math.floor((s % 3600) / 60);
    const secs = s % 60;

    if (d > 0) return `${d}d ${h}h ${m}m`;
    return `${h}h ${m}m ${secs}s`;
}

// ------------------------ RENDER ENGINE --------------------

// --- RENDER COMPONENTS ---

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
                    ${m.wp ? `<span class="wp-tag" onclick="event.stopPropagation(); copyWP('${m.wp}')">COPY WP</span>` : ''}
                </div>
            </div>
            <div class="status-text">
                ${m.inProgress ? '<span class="status-active">ACTIVE</span>' : 
                  isCD ? `<span class="status-timer">${formatTime(m.readyAt - Date.now())}</span>` : 
                  '<span class="status-ready">READY</span>'}
            </div>
            <div class="actions">
                ${!m.inProgress && !isCD ? `<button class="btn-start" onclick="event.stopPropagation(); handleAction(${m.id},'start')">START</button>` : ''}
                ${m.inProgress ? `<button class="btn-finish" onclick="event.stopPropagation(); handleAction(${m.id},'finish')">FINISH</button>` : ''}
                ${isCD ? `<button onclick="event.stopPropagation(); handleAction(${m.id},'reset')">RESET</button>` : ''}
            </div>
            <button class="btn-delete" onclick="event.stopPropagation(); deleteMission(${m.id})">×</button>
        </div>`;
};

const renderCategory = (planetName, cat, pMissions) => {
    const catKey = planetName + cat;
    const isCatColl = collapsedCats[catKey];
    const missionsInCat = pMissions.filter(m => m.category === cat);
    
    return `
        <div class="category-wrapper ${isCatColl ? 'collapsedSection' : ''}">
            <div class="category-header" onclick="toggleCat('${planetName}','${cat}')">
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

    // Find the mission closest to finishing its cooldown
    let closestMissionHtml = '';
    if (cdCount > 0) {
        const closest = cdMissions.reduce((prev, curr) => (prev.readyAt < curr.readyAt) ? prev : curr);
        closestMissionHtml = `<span class="closest-timer"> Next: ${closest.name} (${formatTime(closest.readyAt - now)})</span>`;
    }

    return `
        <div class="planet-section ${isPlanetCollapsed ? 'collapsedSection' : ''}">
            <div class="progress-container"><div class="progress-fill" style="width: ${progressPct}%"></div></div>
            <div class="planet-header" onclick="togglePlanet('${planetName}')">
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

// --- MAIN RENDER ENGINE ---

function render() {
    const container = document.getElementById('planetList');
    if (!container) return;
    container.innerHTML = ALL_PLANETS.map(renderPlanet).join('');
}
// This keeps the timers updating every second without flickering the whole UI
setInterval(() => {
    render();
}, 1000);

render();
console.log('pixelb8-dailies.js version 1.0.2');