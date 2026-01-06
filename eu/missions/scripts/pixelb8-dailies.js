const ALL_PLANETS = [
    "Earth", "Calypso", "Monria/DSEC", "Rocktropia", "Howling Mine", "Toulan", 
    "Next Island", "Arkadia", "Arkadia Moon", "Cyrene", "Aris", "Setesh", "Foma", 
    "Crystal Palace", "Space"
];

let collapsedPlanets = JSON.parse(localStorage.getItem('euColl_Planets')) || {};
let collapsedCats = JSON.parse(localStorage.getItem('euColl_Cats')) || {};

const defaultMissions = [
    { id: 1, planet: "Calypso", category: "Daily Terminal", name: "Daily Hunting 1", cd: 21, type: "SOR", reward: "1 Token (+20 Bonus)", wp: "/wp [Calypso, 61955, 76163, 138, Daily Mission Terminal]", difficulty: "Easy" },
    { id: 2, planet: "Calypso", category: "Daily Terminal", name: "Daily Hunting 2", cd: 21, type: "SOF", reward: "1 Token (+20 Bonus)", wp: "/wp [Calypso, 61955, 76163, 138, Daily Mission Terminal]", difficulty: "Medium" },
    { id: 6, planet: "Calypso", category: "misc", name: "Feffoid Cave (Instance)", cd: 21, type: "SOF", reward: "1 Token", wp: "/wp [Calypso, 61327, 75263, 118, Waypoint]" }
];

let missions = JSON.parse(localStorage.getItem('euMissions_v7')) || [...defaultMissions];

// --- CORE FUNCTIONS ---

function saveAndRender() {
    localStorage.setItem('euMissions_v7', JSON.stringify(missions));
    render();
}

function addMission() {
    const name = document.getElementById('mName').value;
    const cat = document.getElementById('mCat').value || "General";
    const planet = document.getElementById('mPlanet').value;
    const cd = parseInt(document.getElementById('mCD').value);
    const type = document.getElementById('mType').value;

    missions.push({
        id: Date.now(),
        planet: planet,
        category: cat,
        name: name || "Unnamed",
        cd: cd,
        type: type,
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
            m.readyAt = Date.now() + (m.cd * 60 * 60 * 1000);
            m.inProgress = false;
        } else {
            m.inProgress = true;
        }
    } else if (action === 'finish') {
        m.readyAt = Date.now() + (m.cd * 60 * 60 * 1000);
        m.inProgress = false;
    } else if (action === 'reset') {
        m.readyAt = 0;
        m.inProgress = false;
    }
    saveAndRender();
}

// --- UI CONTROLS ---

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

function formatTime(ms) {
    let s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const secs = s % 60;
    return `${h}h ${m}m ${secs}s`;
}

// --- RENDER ENGINE ---

function render() {
    const container = document.getElementById('planetList');
    if (!container) return;

    let mainHtml = '';

    ALL_PLANETS.forEach(planetName => {
        const pMissions = missions.filter(m => m.planet === planetName);
        if (pMissions.length === 0) return; // Skip planets with no missions

        const readyCount = pMissions.filter(m => (!m.readyAt || m.readyAt <= Date.now()) && !m.inProgress).length;
        const progressPct = (readyCount / pMissions.length) * 100;
        const isCollapsed = collapsedPlanets[planetName];

        mainHtml += `
            <div class="planet-section ${isCollapsed ? 'collapsed' : ''}">
                <div class="progress-container"><div class="progress-fill" style="width: ${progressPct}%"></div></div>
                <div class="planet-header" onclick="togglePlanet('${planetName}')">
                    <span><i class="fa-solid ${isCollapsed ? 'fa-planet-ringed' : 'fa-globe'}"></i> ${planetName}</span>
                    <div class="header-stats">
                        <span class="stat-ready">${readyCount} Ready</span>
                        <i class="fa-solid ${isCollapsed ? 'fa-caret-down' : 'fa-caret-up'}"></i>
                    </div>
                </div>
                <div class="planet-content">`;

        const categories = [...new Set(pMissions.map(m => m.category))];
        categories.forEach(cat => {
            const catKey = planetName + cat;
            const isCatColl = collapsedCats[catKey];
            
            mainHtml += `
                <div class="category-wrapper ${isCatColl ? 'collapsed' : ''}">
                    <div class="category-header" onclick="toggleCat('${planetName}','${cat}')">
                        <span>${cat}</span>
                        <i class="fa-solid ${isCatColl ? 'fa-plus' : 'fa-minus'}"></i>
                    </div>
                    <div class="category-content">`;

            pMissions.filter(m => m.category === cat).forEach(m => {
                const isCD = m.readyAt && (m.readyAt > Date.now());
                const stateClass = m.inProgress ? 'in-progress' : (isCD ? 'on-cooldown' : '');
                
                mainHtml += `
                    <div class="mission-row ${stateClass}">
                        <div class="mission-info">
                            <h4>${m.name}</h4>
                            <div class="mission-meta">
                                ${m.difficulty ? `<span class="diff-badge">${m.difficulty}</span>` : ''}
                                <span>${m.reward || ''}</span>
                                ${m.wp ? `<span class="wp-tag" onclick="event.stopPropagation(); copyWP('${m.wp}')">COPY WP</span>` : ''}
                                <span class="cd-type-tag">[${m.type}]</span>
                            </div>
                        </div>
                        <div class="status-text">
                            ${m.inProgress ? '<span class="status-active">MISSION ACTIVE</span>' : 
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
            });
            mainHtml += `</div></div>`;
        });
        mainHtml += `</div></div>`;
    });

    container.innerHTML = mainHtml;
}

// Start
setInterval(render, 1000);
render();