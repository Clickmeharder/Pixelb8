/**
 * MAP.JS - Professional Entropia Universe Mapping Engine
 */
// death waypoint should look like this ⚰️
// secet agent waypoint = 🕴️
// custom waypoint / pin = 📍
function copyWaypoint(planet, long, lat, name) {
    let cleanName = name || "WayPoint";
    const MAX_CHARS = 25;

    // 1. Check if it's a MobArea string
    if (cleanName.includes('-') || cleanName.includes(',')) {
        const mobGroups = cleanName.split(',');
        const mobNames = [];

        mobGroups.forEach(group => {
            const namePart = group.split('-')[0].trim();
            if (namePart && !mobNames.includes(namePart)) {
                mobNames.push(namePart);
            }
        });

        if (mobNames.length > 0) {
            const totalMobs = mobNames.length;
            
            // Attempt 1: First 2 names + "X more"
            let attempt = `${mobNames.slice(0, 2).join(', ')}`;
            if (totalMobs > 2) attempt += ` +${totalMobs - 2} more`;

            if (attempt.length <= MAX_CHARS) {
                cleanName = attempt;
            } else {
                // Attempt 2: Just 1 name + "X more"
                attempt = `${mobNames[0]}`;
                if (totalMobs > 1) attempt += ` +${totalMobs - 1} more`;
                
                if (attempt.length <= MAX_CHARS) {
                    cleanName = attempt;
                } else {
                    // Attempt 3: If "Name +X more" is STILL too long, 
                    // fall back to just "Name +X" to save space
                    attempt = `${mobNames[0]}`;
                    if (totalMobs > 1) attempt += ` +${totalMobs - 1}`;
                    
                    if (attempt.length <= MAX_CHARS) {
                        cleanName = attempt;
                    } else {
                        // Attempt 4: Hard truncate
                        cleanName = mobNames[0].substring(0, MAX_CHARS - 3).trim() + "...";
                    }
                }
            }
        }
    }

    // 2. Final safety check for non-mob waypoints
    if (cleanName.length > MAX_CHARS) {
        cleanName = cleanName.substring(0, MAX_CHARS - 3).trim() + "...";
    }

    // 3. Construct the in-game command
    const wpString = `/wp [${planet}, ${Math.round(long)}, ${Math.round(lat)}, 0, ${cleanName}]`;
    
    navigator.clipboard.writeText(wpString).then(() => {
        const toast = document.getElementById('copyToast');
        if (toast) {
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }
        console.log("[SYSTEM] Waypoint copied: " + wpString);
		showCopyNotification();
    }).catch(err => {
        console.error("[CRITICAL] Clipboard Access Denied: ", err);
    });
}
/* function instantfocusOnPoint(long, lat) {
    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const configLookup = getConfigLookup(wikiName);
    const pos = getMapPosition(configLookup, long, lat);
    
    if (pos) {
        const imgEl = document.getElementById('baseMapImg');
        const viewRect = mapContainer.getBoundingClientRect();
        
        const mapW = imgEl.offsetWidth;
        const mapH = imgEl.offsetHeight;

        // 1. Target Zoom
        const targetZoom = 8.0; 

        // 2. Target Coordinates
        const targetPointX = (pos.leftPct / 100) * mapW;
        const targetPointY = (pos.topPct / 100) * mapH;

        const targetX = (viewRect.width / 2) - (targetPointX * targetZoom);
        const targetY = (viewRect.height / 2) - (targetPointY * targetZoom);

        // 3. Trigger Digital Scan Interface


        // 4. Smoothly Pan/Zoom after a tiny delay to let the sweep start
        setTimeout(() => {
            animateMapTo(targetX, targetY, targetZoom, 1000);
        }, 100);
    }
}
 */
function instantfocusOnPoint(long, lat) {
    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const configLookup = getConfigLookup(wikiName);
    const pos = getMapPosition(configLookup, long, lat);
    
    if (pos) {
        const imgEl = document.getElementById('baseMapImg');
        const viewRect = mapContainer.getBoundingClientRect();
        
        // Ensure we are using the real pixel dimensions of the map
        const mapW = imgEl.offsetWidth || imgEl.naturalWidth;
        const mapH = imgEl.offsetHeight || imgEl.naturalHeight;

        // TARGET ZOOM: 15.0 is a very deep tactical zoom
        const targetZoom = 15.0; 

        const targetPointX = (pos.leftPct / 100) * mapW;
        const targetPointY = (pos.topPct / 100) * mapH;

        // Center calculation
        const targetX = (viewRect.width / 2) - (targetPointX * targetZoom);
        const targetY = (viewRect.height / 2) - (targetPointY * targetZoom);

        setTimeout(() => {
            // Note: Removed the 'label' and 'gameCoords' args to match the fixed function
            animateMapTo(targetX, targetY, targetZoom, 800); 
        }, 50);
    }
}
/* function animateMapTo(targetX, targetY, targetZoom, label, gameCoords, duration = 1000) {
    const startX = mapState.x;
    const startY = mapState.y;
    const startZoom = mapState.zoom;
    const startTime = performance.now();
	
    mapContainer.classList.add('scan-flicker');

    function step(now) {
        const progress = Math.min((now - startTime) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 4); // Quartic Ease Out (snappier)

        mapState.x = startX + (targetX - startX) * ease;
        mapState.y = startY + (targetY - startY) * ease;
        mapState.zoom = startZoom + (targetZoom - startZoom) * ease;

        updateMapTransform();

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            mapContainer.classList.remove('scan-flicker');
            // TRAP: The reticle needs screen-center coordinates once move is done
            const viewRect = mapWrapper.getBoundingClientRect();
        }
    }

    requestAnimationFrame(step);
} */
function animateMapTo(targetX, targetY, targetZoom, duration = 1000) {
    const startX = mapState.x;
    const startY = mapState.y;
    const startZoom = mapState.zoom;
    const startTime = performance.now();
    
    mapContainer.classList.add('scan-flicker');

    function step(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Quartic Ease Out (Snappy start, smooth finish)
        const ease = 1 - Math.pow(1 - progress, 4); 

        // Update the global state
        mapState.x = startX + (targetX - startX) * ease;
        mapState.y = startY + (targetY - startY) * ease;
        mapState.zoom = startZoom + (targetZoom - startZoom) * ease;

        // CRITICAL: This must update BOTH translate and scale
        updateMapTransform();

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            mapContainer.classList.remove('scan-flicker');
        }
    }

    requestAnimationFrame(step);
}
/**
 * Spawns a tracking reticle at a specific screen position
 */
/**
 * 30-Second Satellite Search Sequence
 */
async function focusOnPoint(long, lat) {
    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const cfgLookup = getConfigLookup(wikiName);
    const pos = getMapPosition(cfgLookup, long, lat);
    
    if (!pos) return;

    const imgEl = document.getElementById('baseMapImg');
    const viewRect = mapWrapper.getBoundingClientRect();
    const mapW = imgEl.offsetWidth;
    const mapH = imgEl.offsetHeight;
    const targetZoom = 8.0;

    // Center point calculations
    const targetPointX = (pos.leftPct / 100) * mapW;
    const targetPointY = (pos.topPct / 100) * mapH;
    const finalX = (viewRect.width / 2) - (targetPointX * targetZoom);
    const finalY = (viewRect.height / 2) - (targetPointY * targetZoom);

    const label = hoveredItem ? (hoveredItem.name || hoveredItem.Name) : "UNIDENTIFIED";
    const gameCoords = `${Math.round(long)}, ${Math.round(lat)}`;

    // Prepare UI
    const sweepContainer = document.getElementById('satelliteSweep');
    sweepContainer.innerHTML = '';
    mapContainer.classList.add('scan-flicker');

    // 1. RANDOMIZE SEARCH DURATION (10s to 20s)
	const totalSearchTime = Math.floor(Math.random() * (8000 - 4000 + 1)) + 4000;
    const totalSteps = Math.floor(Math.random() * (8 - 4 + 1)) + 4;
    const stepDuration = totalSearchTime / totalSteps;

    console.log(`[SYSTEM] Initializing Satellite Search: ${totalSearchTime/1000}s duration across ${totalSteps} hops.`);

    // Start the sweep bar
    const sweepBar = document.createElement('div');
    sweepBar.className = 'sweep-bar';
    sweepContainer.appendChild(sweepBar);

    let barY = 0;
    const barInterval = setInterval(() => {
        barY = (barY + 5) % 100; 
        sweepBar.style.top = barY + "%";
    }, 30);

    // 2. THE SEARCH LOOP
    for (let i = 0; i < totalSteps; i++) {
        const isFinal = i === totalSteps - 1;
        
        // Radius collapses as we approach the final step
        const searchRadius = isFinal ? 0 : (700 * (1 - i/totalSteps)); 
        const offsetX = (Math.random() * (searchRadius * 2)) - searchRadius;
        const offsetY = (Math.random() * (searchRadius * 2)) - searchRadius;
        
        const bracket = document.createElement('div');
        bracket.className = 'search-bracket';
        bracket.style.left = '50%';
        bracket.style.top = '50%';
        sweepContainer.appendChild(bracket);

        // Pan map to the hop or the final destination
        await animateMapToPromise(finalX + offsetX, finalY + offsetY, targetZoom, stepDuration);
        
        bracket.remove();
        if(!isFinal) await new Promise(r => setTimeout(r, 150));
    }

    // 3. LOCK-ON
    clearInterval(barInterval);
	instantfocusOnPoint(long, lat);
    sweepBar.remove();
    mapContainer.classList.remove('scan-flicker');
    spawnTrackingReticle(label, gameCoords);
}
function spawnTrackingReticle(label, coords) {
    const sweepContainer = document.getElementById('satelliteSweep');
    const reticle = document.createElement('div');
    reticle.className = 'tracking-reticle reticle-pulse';
    
    // Position at 50/50 because the map has been panned to center the point
    reticle.style.left = '50%';
    reticle.style.top = '50%';

    reticle.innerHTML = `
        <div class="reticle-bracket tl"></div>
        <div class="reticle-bracket tr"></div>
        <div class="reticle-bracket bl"></div>
        <div class="reticle-bracket br"></div>
        <div class="reticle-crosshair"></div>
        <div class="reticle-metadata">
            <div class="id-status">TARGET IDENTIFIED</div>
            <div>ID: ${label}</div>
            <div>LOC: [${coords}]</div>
            <div style="font-size:8px; opacity:0.6; margin-top:5px;">SIGNAL: VERIFIED</div>
        </div>
    `;

    sweepContainer.appendChild(reticle);
	
    setTimeout(() => {
        reticle.style.transition = 'opacity 1s';
        reticle.style.opacity = '0';
        setTimeout(() => reticle.remove(), 1000);
    }, 6000);
	
}
/**
 * Helper: Promise-based  more complicating and not quite right map animation
 */
function animateMapToPromise(targetX, targetY, targetZoom, duration) {
    return new Promise((resolve) => {
        const startX = mapState.x;
        const startY = mapState.y;
        const startZoom = mapState.zoom;
        const startTime = performance.now();

        function step(now) {
            const progress = Math.min((now - startTime) / duration, 1);
            // Smooth ease in-out
            const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;

            mapState.x = startX + (targetX - startX) * ease;
            mapState.y = startY + (targetY - startY) * ease;
            mapState.zoom = startZoom + (targetZoom - startZoom) * ease;

            updateMapTransform();

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                resolve();
            }
        }
        requestAnimationFrame(step);
    });
}


function getCanvasItemAtPos(mouseX, mouseY) {
	const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey] || ""; // Safety fallback
    const configLookup = getConfigLookup(wikiName);
    
    const rect = mapWrapper.getBoundingClientRect();
    const localX = (mouseX - rect.left) / rect.width;
    const localY = (mouseY - rect.top) / rect.height;
    const hitRadius = 15; 

    // --- CHECK LAST KNOWN POSITION ---
    const lkp = window.lastKnownPos;
    
    // SAFETY CHECK: Ensure lkp exists, is active, and has a valid planet string
    if (lkp && lkp.active && lkp.planet && wikiName) { 
        if (lkp.planet.toLowerCase() === wikiName.toLowerCase()) {
            const pos = getMapPosition(configLookup, lkp.long, lkp.lat);
            if (pos) {
                const pxPct = pos.leftPct / 100;
                const pyPct = pos.topPct / 100;
                
                const dx = (pxPct - localX) * rect.width;
                const dy = (pyPct - localY) * rect.height;
                
                if (Math.hypot(dx, dy) < hitRadius) {
                    return { 
                        ...lkp, 
                        isLastKnown: true, 
                        type: 'User',
                        name: lkp.waypoint || "Last Known Position" 
                    };
                }
            }
        }
    }
	// --- CHECK USER WAYPOINT LISTS (Session, Saved, Mining) ---
    const userLists = [
        { data: window.sessionWaypoints, type: 'sessionWaypoints' },
        { data: window.savedWaypoints, type: 'savedWaypoints' },
        { data: window.miningClaims, type: 'miningClaims' }
    ];

    for (const list of userLists) {
        if (!list.data || list.data.length === 0) continue;

        for (const wp of list.data) {
            // Planet check (fuzzy matching like the render function)
            const wpPlanet = (wp.planet || "").toLowerCase();
            const targetWiki = wikiName.toLowerCase();
            if (!wpPlanet.includes(targetWiki) && !targetWiki.includes(wpPlanet)) continue;

            const pos = getMapPosition(configLookup, wp.long, wp.lat);
            if (pos) {
                const pxPct = pos.leftPct / 100;
                const pyPct = pos.topPct / 100;
                
                const dx = (pxPct - localX) * rect.width;
                const dy = (pyPct - localY) * rect.height;
                
                if (Math.hypot(dx, dy) < hitRadius) {
                    // Return the waypoint but ensure the type is set for Step 7 in render
                    return { 
                        ...wp, 
                        type: list.type 
                    };
                }
            }
        }
    }
    // --- 4. CHECK REGISTRY DATASETS (NPCs, Mobs, etc) ---
    for (const group of Object.values(MAP_REGISTRY)) {
        if (!group.active || group.isDOM) continue;
        const data = window[`cached${group.dataSource}`] || window[`cached${group.dataSource.toLowerCase()}`];
        if (!data) continue;

        for (const item of data) {
            // Planet check (supporting various naming conventions in JSON)
            const itemPlanet = item.planet || (item.Planet && item.Planet.Name) || "";
            if (itemPlanet.toLowerCase() !== wikiName.toLowerCase()) continue;
            
            // Type check
            const itemType = (item.type || (item.Properties && item.Properties.Type) || "").toLowerCase();
            if (itemType !== group.matchType.toLowerCase()) continue;

            const pos = getMapPosition(configLookup, item.long, item.lat);
            if (!pos) continue;

            const pxPct = pos.leftPct / 100;
            const pyPct = pos.topPct / 100;
            
            const dx = (pxPct - localX) * rect.width;
            const dy = (pyPct - localY) * rect.height;
            
            const dist = Math.hypot(dx, dy);
            if (dist < hitRadius) return item; 
        }
    }
    return null;
}



const allowedTypes = [
    'teleporter', 'npc', 'outpost', 'revivalpoint',
    'vendor', 'interactable', 'magicalflower', 'instanceentrance', 'camp', 'city', 'estate', 'area'
];
const allowedAreaTypes = [
    'MobArea', 'LandArea', 'ZoneArea', 'EstateArea', 
    'WaveEventArea', 'PvpArea', 'PvpLootArea'
];

const maplists = {};
const countSpans = {};
const labelToggles = {};
allowedTypes.forEach(type => {
    let listid = type + 'List';
	let countid = type + 'Count';
	let labeltoggleid = type + 'LabelToggle';
    maplists[type] = document.getElementById(listid);
    countSpans[type] = document.getElementById(countid);
    labelToggles[type] = document.getElementById(labeltoggleid);
});
const drawConfig = {
    teleporter:     { zoom: 1.5,  font: 14 },
    npc:            { zoom: 3.5,  font: 12 },
    outpost:        { zoom: 2.0,  font: 12 },
	camp:        { zoom: 2.0,  font: 12 },
	city:        { zoom: 2.0,  font: 12 },
	estate:        { zoom: 2.0,  font: 12 },
    revivalpoint:   { zoom: 2.0,  font: 12 },
    vendor:         { zoom: 2.5,  font: 12 },
    interactable:   { zoom: 2.5,  font: 12 },
    magicalflower:  { zoom: 2.5,  font: 12 },
    instanceentrance: { zoom: 2.5, font: 12 },
	area: { zoom: 2.0, font: 12 }
};
const AREATYPE_COLORS = {
	"mobarea": "rgba(255, 255, 255, 0.4)",//"rgba(255, 153, 153, 0.6)",      // Light Red
	"landarea": "#32cd32",      // Green
	"zonearea": "#3399ff",      // Sky Blue
	"pvparea": "#ff9900",       // Orange
	"pvplootarea": "#ff6666",   // Blood Red
	"waveeventarea": "#8425bf", // Purple
	"eventarea": "#555555",
	"estatearea": "#777777"     // Grey
};
const MAP_REGISTRY = {
	areatype_canvas: {
		label: "areashape",
		active: false,
        dataSource: 'Locations', // Points to window.cachedLocations
        matchType: 'area',       // Matches "Type": "Area" in your JSON
		matchAreaType: 'areatype',
        color: '#ffffff', 
        active: true,
		icon: '🧿' 
    },
    // Canvas Layer (High-Performance Tactical)
    area_canvas: { 
        label: "area (Dots)", 
        active: true, 
        dataSource: 'Locations', 
        matchType: 'area', 
        color: '#ff4d4d', 
        icon: '👾' // 
    },
    teleporter_canvas: { 
        label: "Teleporters", 
        active: true, 
        dataSource: 'Locations', 
        matchType: 'teleporter', 
        color: '#00ffff', 
        icon: '💠' // 💠 🧿
    },
    npc_canvas: { 
        label: "Npc", 
        active: false, 
        dataSource: 'Locations', 
        matchType: 'npc', 
        color: '#ed9121', 
        icon: '🧍‍' //🧍‍👤
    },
    outpost_canvas: { 
        label: "Outposts (Canvas)", 
        active: false, 
        dataSource: 'Locations', 
        matchType: 'outpost', 
        color: '#898a8b', 
        icon: '🏰' 
    },
    camp_canvas: { 
        label: "Camps (Canvas)", 
        active: false, 
        dataSource: 'Locations', 
        matchType: 'camp', 
        color: '#E3A857',//'#39ff14', 
        icon: '🏕️' 
    },
    city_canvas: { 
        label: "City (Canvas)", 
        active: false, 
        dataSource: 'Locations', 
        matchType: 'city', 
        color: '#61918e',//'#39ff14', 
        icon: '🏙️' 
    },
    estate_canvas: { 
        label: "Estates (Canvas)", 
        active: false, 
        dataSource: 'Locations', 
        matchType: 'estate', 
        color: '#B68E65',//'#39ff14', 
        icon: '🏠' //🏠 🏚️
    },
	revivalpoint_canvas: { 
        label: "Revival Points", 
        active: false, 
        dataSource: 'Locations', 
        matchType: 'revivalpoint', 
        color: '#ff4d4d', // Tactical Red
        icon: '💔' // 🧬 🏥 💔
    },
	vendor_canvas: { 
        label: "Vendors", 
        active: false, 
        dataSource: 'Locations', 
        matchType: 'vendor', 
        color: '#D4AF37', // Tactical Red
        icon: '🏷️' 
    },
	interactable_canvas: { 
        label: "Interactable", 
        active: false, 
        dataSource: 'Locations', 
        matchType: 'interactable', 
        color: '#474545', // gold
        icon: '🔘' 
    },
	magicalflower_canvas: { 
        label: "Magical Flower", 
        active: false, 
        dataSource: 'Locations', 
        matchType: 'magicalflower', 
        color: '#8425bf', // purple
        icon: '🌸' 
    },
	instanceentrance_canvas: { 
        label: "Instance Entrance", 
        active: false, 
        dataSource: 'Locations', 
        matchType: 'instanceentrance', 
        color: '#4a4a4a', // dark gray
        icon: '🕳️' 
    }
};

// original teleporters function:

async function loadTeleporters() {
    try {
        if (typeof getData === "function") {
            cachedTeleporters = await getData("teleporters", "teleporters.json");
            console.log(`✅ Loaded ${cachedTeleporters.length} legacy teleporters from teleporters.json`);
        }
    } catch (err) {
        console.warn("Could not load teleporters.json (using locations only):", err);
        cachedTeleporters = [];
    }
}
let cachedMobs = [];
async function loadMobsData() {
    try {
        if (typeof getData === "function") {
            // Using your existing getData helper
            cachedMobs = await getData("mobs", "mobs.json");
            console.log(`✅ Loaded ${cachedMobs.length} unique mob definitions from mobs.json`);
            
            // Populate the UI if the element exists
            if (document.getElementById('mobComboboxInput')) {
                initMobCombobox();
            }
        }
    } catch (err) {
        console.warn("Could not load mobs.json:", err);
        cachedMobs = [];
    }
}


/* function updateSidebarLists() {
    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    
    const globalSearchInput = document.getElementById('globalFuzzySearch');
    const globalSearch = globalSearchInput ? globalSearchInput.value.toLowerCase().trim() : "";

    // --- 1. SIDEBAR TOGGLE & HEADER DELEGATION ---
    // We attach this to the main section to handle the caret/collapse
    const mainSection = document.getElementById('mapsTab-mainSection');
    if (mainSection && !mainSection.dataset.listenerAttached) {
        mainSection.onclick = (e) => {
            const header = e.target.closest('#waypointlistHeader') || e.target.closest('#toggleListLayout');
            if (header) {
                const sidebar = mainSection.querySelector('.map-sidebar');
                const toggler = mainSection.querySelector('.sectionToggler');
                
                const isCollapsed = sidebar.classList.toggle('collapsed');
                
                if (toggler) {
                    toggler.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)';
                }

                // Notify map canvas to recalculate its width
                window.dispatchEvent(new Event('resize'));
            }
        };
        mainSection.dataset.listenerAttached = "true";
    }

    // --- 2. RESET CONTENT ---
    Object.values(maplists).forEach(el => { 
        if (el) el.innerHTML = ''; 
    });

    const counts = {};
    allowedTypes.forEach(type => counts[type] = 0);

    const allLocations = window['cachedLocations'] || window['cachedlocations'] || [];
    const allNPCs = window['cachedNPCs'] || window['cachednpcs'] || [];
    const masterData = [...allLocations, ...allNPCs];

    // --- 3. BUILD ROW FUNCTION ---
    const buildRow = (item) => {
        const div = document.createElement('div');
        div.className = 'list-row';
        
        const hProps = item.Properties || item.properties || {};
        const rawName = item.name || item.Name || hProps.Name || "Unknown";
        const itemType = (item.type || hProps.Type || "").toLowerCase();
        const areaType = (item.AreaType || hProps.AreaType || "").toLowerCase();
        
        const long = item.long || item.Longitude || hProps.Coordinates?.Longitude || 0;
        const lat = item.lat || item.Latitude || hProps.Coordinates?.Latitude || 0;
        
        let finalDisplayName = rawName;

        if (itemType === 'area' || areaType.includes('mob')) {
            const mobGroups = rawName.split(',');
            const mobNames = [];
            mobGroups.forEach(group => {
                const namePart = group.split('-')[0].trim();
                if (namePart && !mobNames.includes(namePart)) {
                    mobNames.push(namePart);
                }
            });

            if (mobNames.length > 0) {
                const limit = 3;
                const shown = mobNames.slice(0, limit);
                finalDisplayName = shown.join(', ');
                if (mobNames.length > limit) finalDisplayName += '...';
            }
        }

        div.innerHTML = `
            <div class="row-info">
                <span class="name" title="${rawName}">${finalDisplayName}</span>
            </div>
            <div class="actions">
                <button class="action-btn focus-btn" title="Focus on Map">📍</button>
            </div>
        `;

        // Row Click: Detail + Focus
        div.onclick = () => {
            showWaypointDetails(item);
            focusOnPoint(long, lat);
        };

        // Button Click: Focus (Stop Bubbling)
        div.querySelector('.focus-btn').onclick = (e) => {
            e.stopPropagation();
            showWaypointDetails(item);
            focusOnPoint(long, lat);
        };

        // Hover: Map Highlight
        div.addEventListener('mouseenter', () => { window.hoveredItem = item; renderCanvasLayers(); });
        div.addEventListener('mouseleave', () => { window.hoveredItem = null; renderCanvasLayers(); });

        return div;
    };

    // --- 4. LOCAL FILTER HELPER ---
    const addLocalFilter = (container, targetList, placeholder = "Filter list...") => {
        if (container.querySelector('.local-filter-input')) return;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholder;
        input.className = 'local-filter-input';
        
        input.onclick = (e) => e.stopPropagation();

        input.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            targetList.querySelectorAll('.list-row').forEach(row => {
                const text = row.querySelector('.name').innerText.toLowerCase();
                row.style.display = text.includes(val) ? '' : 'none';
            });
        });

        container.prepend(input);
    };

    // --- 5. PROCESS CATEGORIES ---
    allowedTypes.forEach(type => {
        const targetList = maplists[type];
        const section = document.getElementById(type + 'ListSection');
        if (!targetList || !section) return;

        // --- LAYER TOGGLE ---
        const summary = section.querySelector('summary');
        if (summary) {
            const existingToggle = summary.querySelector('.toggle-btn');
            if (existingToggle) existingToggle.remove();

            const regKey = (type === 'area') ? 'area_canvas' : type + '_canvas';
            const group = MAP_REGISTRY[regKey];
            const isActive = group ? group.active : false;

            const toggleBtn = document.createElement('button');
            toggleBtn.className = `toggle-btn ${isActive ? 'active' : ''}`;
            toggleBtn.innerHTML = group?.icon || '🔘';
            toggleBtn.style.marginRight = '8px';
            section.classList.toggle('layer-off', !isActive);

            toggleBtn.onclick = (e) => {
                e.stopPropagation();
                if (group) {
                    group.active = !group.active;
                    if (type === 'area' && MAP_REGISTRY['areatype_canvas']) {
                        MAP_REGISTRY['areatype_canvas'].active = group.active;
                    }
                    toggleBtn.classList.toggle('active');
                    section.classList.toggle('layer-off', !group.active);
                    renderCanvasLayers();
                }
            };
            summary.insertBefore(toggleBtn, summary.firstChild);
        }

        addLocalFilter(section, targetList);

        const filteredData = masterData.filter(item => {
            const itemType = (item.type || item.Properties?.Type || "").toLowerCase().replace(/\s/g, '');
            const itemPlanet = item.planet || (item.Planet && item.Planet.Name) || "";
            const planetMatch = !wikiName || itemPlanet.toLowerCase() === wikiName.toLowerCase();
            
            if (!planetMatch || itemType !== type) return false;
            if (globalSearch === "") return true;
            
            return (item.name || item.Name || "").toLowerCase().includes(globalSearch);
        });

        counts[type] = filteredData.length;

        // --- SUB-GROUPING FOR AREAS ---
        if (type === 'area') {
            const groups = {};
            filteredData.forEach(item => {
                const subType = item.Properties?.AreaType || item.AreaType || "General";
                if (!groups[subType]) groups[subType] = [];
                groups[subType].push(item);
            });

            Object.keys(groups).sort().forEach(groupName => {
                const items = groups[groupName];
                const subWrapper = document.createElement('details');
                subWrapper.className = 'area-subgroup';
                
                const header = document.createElement('summary');
                header.className = 'subgroup-header';
                header.innerText = `${groupName.toUpperCase()} (${items.length})`;
                subWrapper.appendChild(header);

                const subContent = document.createElement('div');
                subContent.className = 'subgroup-content';

                const subList = document.createElement('div');
                subList.className = 'subgroup-list';
                items.forEach(it => subList.appendChild(buildRow(it)));
                
                subContent.appendChild(subList);
                subWrapper.appendChild(subContent);
                addLocalFilter(subContent, subList, `Search ${groupName}...`);
                targetList.appendChild(subWrapper);
            });
        } else {
            filteredData.forEach(item => {
                targetList.appendChild(buildRow(item));
            });
        }
    });

    // --- 6. UPDATE BADGES ---
    Object.keys(countSpans).forEach(type => {
        const span = countSpans[type];
        if (span) span.innerText = counts[type] || 0;
    });
} */
function updateSidebarLists() {
    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const globalSearchInput = document.getElementById('globalFuzzySearch');
    const globalSearch = globalSearchInput ? globalSearchInput.value.toLowerCase().trim() : "";
    const mainSection = document.getElementById('mapsTab-mainSection');

    // --- HELPER: LOCAL FILTER LOGIC ---
    // Defined inside so it's always in scope for the processing loop
    const addLocalFilter = (container, targetList, placeholder = "Filter list...") => {
        if (container.querySelector('.local-filter-input')) return;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholder;
        input.className = 'local-filter-input';
        input.onclick = (e) => e.stopPropagation();

        input.addEventListener('input', (e) => {
            const val = e.target.value.toLowerCase();
            // This hides/shows the rows based on the local input
            targetList.querySelectorAll('.list-row').forEach(row => {
                const text = row.dataset.name.toLowerCase(); // Use dataset for faster search
                row.style.display = text.includes(val) ? '' : 'none';
            });
        });

        container.prepend(input);
    };

    // --- 1. GLOBAL DELEGATED LISTENERS (Attach ONCE) ---
    if (mainSection && !mainSection.dataset.listenerAttached) {
        mainSection.addEventListener('click', (e) => {
            // A. Sidebar Toggle Logic
            const header = e.target.closest('#waypointlistHeader, #toggleListLayout');
            if (header) {
                const sidebar = mainSection.querySelector('.map-sidebar');
                const toggler = mainSection.querySelector('.sectionToggler');
                const isCollapsed = sidebar.classList.toggle('collapsed');
                if (toggler) toggler.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(90deg)';
                window.dispatchEvent(new Event('resize'));
                return;
            }

            // B. Row Click Logic (Details + Focus)
            const row = e.target.closest('.list-row');
            if (row) {
                const lat = parseFloat(row.dataset.lat);
                const long = parseFloat(row.dataset.long);
                const mockItem = { 
                    name: row.dataset.name, 
                    long: long, 
                    lat: lat, 
                    type: row.dataset.type 
                };
                
                showWaypointDetails(mockItem);
                focusOnPoint(long, lat);
                
                if (e.target.classList.contains('focus-btn')) e.stopPropagation();
            }
        });

        // C. Hover Logic (Highlighting)
        mainSection.addEventListener('mouseover', (e) => {
            const row = e.target.closest('.list-row');
            if (row) {
                window.hoveredItem = { name: row.dataset.name, long: row.dataset.long, lat: row.dataset.lat };
                if (typeof queueRender === 'function') queueRender();
            }
        });
        mainSection.addEventListener('mouseout', (e) => {
            if (e.target.closest('.list-row')) {
                window.hoveredItem = null;
                if (typeof queueRender === 'function') queueRender();
            }
        });

        mainSection.dataset.listenerAttached = "true";
    }

    // --- 2. DATA PREPARATION ---
    const allLocations = window['cachedLocations'] || window['cachedlocations'] || [];
    const allNPCs = window['cachedNPCs'] || window['cachednpcs'] || [];
    const masterData = [...allLocations, ...allNPCs];
    
    const counts = {};
    allowedTypes.forEach(t => counts[t] = 0);

    // --- 3. THE "ROW BUILDER" (String Version) ---
    const getRowHtml = (item, type) => {
        const hProps = item.Properties || item.properties || {};
        const rawName = item.name || item.Name || hProps.Name || "Unknown";
        const long = item.long || item.Longitude || hProps.Coordinates?.Longitude || 0;
        const lat = item.lat || item.Latitude || hProps.Coordinates?.Latitude || 0;
        const areaType = (item.AreaType || hProps.AreaType || "").toLowerCase();

        let finalDisplayName = rawName;
        if (type === 'area' || areaType.includes('mob')) {
            const names = [...new Set(rawName.split(',').map(g => g.split('-')[0].trim()))];
            finalDisplayName = names.slice(0, 3).join(', ') + (names.length > 3 ? '...' : '');
        }

        return `
            <div class="list-row" 
                 data-name="${rawName.replace(/"/g, '&quot;')}" 
                 data-long="${long}" 
                 data-lat="${lat}" 
                 data-type="${type}">
                <div class="row-info">
                    <span class="name" title="${rawName.replace(/"/g, '&quot;')}">${finalDisplayName}</span>
                </div>
                <div class="actions">
                    <button class="action-btn focus-btn" title="Focus">📍</button>
                </div>
            </div>`;
    };

    // --- 4. PROCESSING ---
    allowedTypes.forEach(type => {
        const targetList = maplists[type];
        const section = document.getElementById(type + 'ListSection');
        if (!targetList || !section) return;

        // Initialize Toggle UI and Local Filter Input once per section
        const summary = section.querySelector('summary');
        if (summary && !summary.dataset.init) {
            const regKey = (type === 'area') ? 'area_canvas' : type + '_canvas';
            const group = MAP_REGISTRY[regKey];
            
            const toggleBtn = document.createElement('button');
            toggleBtn.className = `toggle-btn ${group?.active ? 'active' : ''}`;
            toggleBtn.innerHTML = group?.icon || '🔘';
            toggleBtn.onclick = (e) => {
                e.stopPropagation();
                if (group) {
                    group.active = !group.active;
                    toggleBtn.classList.toggle('active', group.active);
                    section.classList.toggle('layer-off', !group.active);
                    renderCanvasLayers();
                }
            };
            summary.insertBefore(toggleBtn, summary.firstChild);
            summary.dataset.init = "true";
            
            // Call our helper to add the search bar above the list
            addLocalFilter(section, targetList);
        }

        // Filter and Build HTML String
        const filtered = masterData.filter(item => {
            const itemType = (item.type || item.Properties?.Type || "").toLowerCase().replace(/\s/g, '');
            const itemPlanet = item.planet || (item.Planet && item.Planet.Name) || "";
            const planetMatch = !wikiName || itemPlanet.toLowerCase() === wikiName.toLowerCase();
            if (!planetMatch || itemType !== type) return false;
            return globalSearch === "" || (item.name || item.Name || "").toLowerCase().includes(globalSearch);
        });

        counts[type] = filtered.length;

        if (type === 'area') {
            const groups = {};
            filtered.forEach(it => {
                const sType = it.Properties?.AreaType || it.AreaType || "General";
                if (!groups[sType]) groups[sType] = "";
                groups[sType] += getRowHtml(it, type);
            });

            let areaHtml = "";
            Object.keys(groups).sort().forEach(gName => {
                areaHtml += `
                    <details class="area-subgroup">
                        <summary class="subgroup-header">${gName.toUpperCase()} (${filtered.filter(i => (i.Properties?.AreaType || i.AreaType || "General") === gName).length})</summary>
                        <div class="subgroup-content"><div class="subgroup-list">${groups[gName]}</div></div>
                    </details>`;
            });
            targetList.innerHTML = areaHtml;
        } else {
            targetList.innerHTML = filtered.map(it => getRowHtml(it, type)).join('');
        }
    });

    // --- 5. UPDATE BADGES ---
    Object.keys(countSpans).forEach(type => {
        if (countSpans[type]) countSpans[type].innerText = counts[type] || 0;
    });
}
/* --- 7. MATH & TRANSFORMS --- */

function getMapPosition(configKey, gameLong, gameLat) {
    const cfg = MAP_CONFIG[configKey];
    
    // If the config isn't ready yet (common with ARIS dynamic loading), 
    // we return null silently to let the caller skip this item.
    if (!cfg || !cfg.isInitialized || cfg.scale === 0) {
        return null;
    }
	
    return {
        leftPct: ((gameLong - cfg.left) / (cfg.width * cfg.scale)) * 100,
        topPct: (1 - ((gameLat - cfg.bottom) / (cfg.height * cfg.scale))) * 100
    };
}
/**
 * Scans all cached data to find unique mob names for a specific planet.
 * @param {string} planetName - e.g., "Calypso", "Monria"
 * @returns {string[]} Sorted array of unique mob names
 */
function getUniqueMobsByPlanet(planetName) {
    const allMobs = window.cachedmobs || [];
    
    const filtered = allMobs.filter(mob => {
        if (!mob) return false;
        
        // Use the raw JSON keys: .Planet.Name
        const itemPlanet = (mob.Planet && mob.Planet.Name) || mob.planet || "";
        
        return itemPlanet.toLowerCase().includes(planetName.toLowerCase()) || 
               planetName.toLowerCase().includes(itemPlanet.toLowerCase());
    });

    // Use .Name (Capital N) and filter out any nulls/undefineds
    const names = filtered
        .map(mob => mob.Name || mob.name)
        .filter(name => typeof name === 'string'); // Ensure only strings enter the list
    
    return [...new Set(names)].sort();
}
/* function populateMobDropdown(selectId) {
    // We can keep the old function for data safety, 
    // but the main UI will now use the Combobox
    initMobCombobox();
    
    // Clear the search input when the planet changes
    const input = document.getElementById('mobComboboxInput');
    if (input) input.value = "";
} */
function populateMobDropdown(selectId) {
    const input = document.getElementById('mobComboboxInput');
    const results = document.getElementById('mobComboboxResults');
    if (input) input.value = "";
    if (results) {
        results.innerHTML = "";
        results.style.display = 'none';
    }

    // Only init listeners if they aren't there
    if (input && !input.dataset.init) {
        initMobCombobox();
        input.dataset.init = "true";
    }
}
/**
 * Handles the selection of a mob from the custom list
 */
function selectMobFromCombobox(mobName) {
    const input = document.getElementById('mobComboboxInput');
    const results = document.getElementById('mobComboboxResults');
    
    input.value = mobName;
    results.style.display = 'none';

    // 1. Trigger the map/habitat scan (locations.json)
    if (typeof updateMobMatchList === 'function') {
        updateMobMatchList(mobName);
    }

    // 2. Trigger the detailed intelligence report (mobs.json)
    if (typeof updateSelectedMobDetails === 'function') {
        updateSelectedMobDetails(mobName);
    }
}
function updateMobMatchList(selectedMob) {
    const matchEl = document.getElementById('mapmobmatchEl');
    const sourceEl = document.getElementById('mobmatchSourceEl');
    if (!matchEl) return;

    matchEl.innerHTML = '';
    if (!selectedMob) {
        if (sourceEl) sourceEl.innerText = 'DATA SOURCE: STANDBY';
        return;
    }

    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = (typeof planetNameMap !== 'undefined' && planetNameMap[planetKey]) ? planetNameMap[planetKey] : planetKey;

    // --- TIER 1: Check locations.json (Spatial data) ---
    const allLocations = window['cachedlocations'] || [];
    const spatialMatches = allLocations.filter(item => {
        if (!item) return false;
        const itemPlanet = item.planet || (item.Planet && item.Planet.Name) || "";
        const isCorrectPlanet = itemPlanet.toLowerCase().includes(wikiName.toLowerCase()) || 
                                wikiName.toLowerCase().includes(itemPlanet.toLowerCase());
        if (!isCorrectPlanet) return false;
        const rawName = (item.name || item.Name || "").toLowerCase();
        return rawName.includes(selectedMob.toLowerCase());
    });

    // --- TIER 2 & 3: Check mobs.json (Global Data & Spawns) ---
    const globalMobEntry = (window.cachedmobs || []).find(m => 
        (m.Name || m.name || "").toLowerCase() === selectedMob.toLowerCase()
    );

    let spawnMatches = [];
    if (globalMobEntry && globalMobEntry.Spawns) {
        // Filter spawns inside mobs.json that match the current planet
        spawnMatches = globalMobEntry.Spawns.filter(s => {
            const spawnPlanet = s.Planet?.Name || "";
            return spawnPlanet.toLowerCase().includes(wikiName.toLowerCase()) || 
                   wikiName.toLowerCase().includes(spawnPlanet.toLowerCase());
        }).map(s => ({
            // Normalize the spawn object so renderSpatialRow can read it
            name: s.Name,
            long: s.Properties?.Coordinates?.Longitude || 0,
            lat: s.Properties?.Coordinates?.Latitude || 0,
            Properties: s.Properties,
            Planet: s.Planet,
            isSpawnData: true // Flag to identify origin
        }));
    }

    // --- UPDATE HEADER & SOURCE ---
    if (sourceEl) {
        let sourceFile = "NOT FOUND";
        if (spatialMatches.length > 0) {
            sourceFile = "LOCATIONS.JSON";
        } else if (spawnMatches.length > 0) {
            sourceFile = "MOBS.JSON (SPAWN)";
        } else if (globalMobEntry) {
            sourceFile = "MOBS.JSON (INTEL)";
        }
        sourceEl.innerText = `${selectedMob.toUpperCase()} | SOURCE: ${sourceFile}`;
    }

    // --- RENDER LOGIC ---
    if (spatialMatches.length > 0) {
        // Priority 1: Use custom locations
        spatialMatches.forEach(item => renderSpatialRow(item, selectedMob, matchEl));
    } 
    else if (spawnMatches.length > 0) {
        // Priority 2: Fallback to official Spawns from mobs.json
        spawnMatches.forEach(item => renderSpatialRow(item, selectedMob, matchEl));
    } 
    else if (globalMobEntry) {
        // Priority 3: Only stats available
        matchEl.innerHTML = `
            <div style="padding: 12px 10px; border-bottom: 1px solid #333; background: rgba(255,165,0,0.05);">
                <div style="color: #ff9800; font-size: 10px; font-weight: bold; margin-bottom: 4px;">COORDINATES MISSING</div>
                <div style="color: #fff; font-size: 11px;">Entity found in database, but no map coordinates or spawn areas recorded for ${wikiName}.</div>
            </div>`;
    } 
    else {
        matchEl.innerHTML = `<div style="padding: 10px; color: #ff4444; font-size: 11px;">Biological signature not found in any local files.</div>`;
    }
}

function renderStatGrid(obj, color) {
    if (!obj) return "";
    
    // Filter out keys that are null or undefined
    const validStats = Object.entries(obj).filter(([_, val]) => val !== null && val !== undefined);
    
    if (validStats.length === 0) {
        return `<div style="color:#444; font-size:9px; font-style:italic;">NO DATA RECORDED</div>`;
    }
    
    return validStats.map(([key, val]) => `
        <div style="background: #151515; border: 1px solid #222; padding: 4px 6px; border-radius: 2px; display: flex; flex-direction: column; justify-content: center;">
            <div style="font-size: 1.0rem; color: #666; text-transform: uppercase; line-height: 1;">${key}</div>
            <div style="font-size: 0.90rem; color: ${color}; font-weight: bold; margin-top: 2px;">${val}</div>
        </div>
    `).join('');
}

function updateSelectedMobDetails(mobName) {
    const detailsEl = document.getElementById('selectedmobDetailsEl');
    if (!detailsEl) return;

    const mobData = (window.cachedmobs || []).find(m => 
        (m.Name || m.name || "").toLowerCase() === mobName.toLowerCase()
    );

    if (!mobData) {
        detailsEl.innerHTML = `<div style="padding:1.5rem; color:#666; font-family: monospace;">DATA NOT FOUND</div>`;
        return;
    }

    const isSweatable = mobData.Properties?.IsSweatable ? "YES" : "NO";

    const getHeader = (title, id, color) => `
        <div class="mob-details-header" data-target="${id}" style="cursor:pointer; padding: 0.75rem 1rem; background: #1a1a1a; border-bottom: 1px solid #333; display: flex; justify-content: space-between; align-items: center;">
            <span style="color: #cd9615; font-size: 0.9rem; font-weight: bold; pointer-events: none; letter-spacing: 1px;">${title}</span>
            <span class="section-arrow" style="transition: transform 0.2s; color: ${color}; font-size: 0.8rem; pointer-events: none;">▶</span>
        </div>
    `;

    let html = `
        <div style="background: #0a0a0a; border: 1px solid #333; color: #eee; font-family: monospace; line-height: 1.4;">
            <div style="padding: 1rem; border-bottom: 2px solid #0d6914; background: #111;">
                <h2 style="color:#9da59d; margin:0 0 0.25rem 0; font-size: 1.4rem; letter-spacing: 1px;">${mobData.Name.toUpperCase()}</h2>
                <div style="font-size: 0.85rem; color: #888;">TYPE: ${mobData.Type} | SWEATABLE: ${isSweatable}</div>
            </div>
    `;

    // --- 1. MATURITIES & INTEL SECTION ---
    html += getHeader("MATURITIES & INTEL", "section-mats", "#b77815");
    html += `<div id="section-mats" style="display:none; padding: 0.75rem; border-bottom: 1px solid #222;">`;
    
    if (mobData.Maturities) {
        mobData.Maturities.forEach((mat, mIdx) => {
            const matLoot = (mobData.Loots || []).filter(l => l.Maturity?.Name?.toLowerCase() === mat.Name?.toLowerCase());
            const level = mat.Level || mat.Properties?.Level || '?';
            const hp = mat.Properties?.Health || mat.Health || '?';
            const intelId = `intel-${mIdx}`;

            html += `
                <div style="background: #151515; border: 1px solid #333; margin-bottom: 0.75rem; padding: 0.75rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div style="color: #fff; font-weight: bold; font-size: 1.1rem;">${mat.Name}</div>
                        
                        <div style="display:flex; gap:12px; align-items:center;">
                            <span style="color: #ff4444; font-size: 1rem; font-weight: bold;">HP ${hp}</span>
                            <span style="color: #b77815; font-size: 0.8rem; border: 1px solid #b77815; padding: 1px 5px; border-radius: 2px; font-weight: bold;">LVL ${level}</span>
                            <button class="intel-toggle-btn" data-target="${intelId}" style="background:#222; color:#36c536; border:1px solid #444; font-size:0.75rem; cursor:pointer; padding:4px 8px; font-family:monospace; font-weight:bold;">[ SHOW INTEL ]</button>
                        </div>
                    </div>

                    <div id="${intelId}" class="intel-panel" style="display:none; margin-top:1rem; padding:0.75rem; background:#0c0c0c; border:1px inset #222;">
                        
                        <div style="color:#ff4d4d; font-size:0.85rem; margin-bottom:0.5rem; border-left: 3px solid #ff4d4d; padding-left: 8px; font-weight:bold;">ATTRIBUTES</div>
                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px; margin-bottom:1.25rem;">
                            ${renderStatGrid(mat.Properties?.Attributes, "#eee", "0.85rem")}
                        </div>
                        
                        <div style="color:#4da6ff; font-size:0.85rem; margin-bottom:0.5rem; border-left: 3px solid #4da6ff; padding-left: 8px; font-weight:bold;">DEFENSE</div>
                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:6px; margin-bottom:1.25rem;">
                            ${renderStatGrid(mat.Properties?.Defense, "#4da6ff", "0.85rem")}
                        </div>

                        ${mat.Attacks && mat.Attacks.length > 0 ? `
                            <div style="color:#ff9800; font-size:0.85rem; margin-bottom:0.5rem; border-left: 3px solid #ff9800; padding-left: 8px; font-weight:bold;">OFFENSIVE VECTORS</div>
                            <div style="margin-bottom:1.25rem;">
                                ${mat.Attacks.map(atk => `
                                    <div style="background:rgba(255,152,0,0.05); padding:0.5rem; margin-bottom:0.5rem; border:1px solid #222;">
                                        <div style="font-size:0.9rem; color:#fff; display:flex; justify-content:space-between; margin-bottom:5px; border-bottom:1px solid #333; padding-bottom:3px;">
                                            <span>${atk.Name}</span>
                                            <span style="color:#ff4d4d; font-weight:bold;">${atk.TotalDamage} DMG</span>
                                        </div>
                                        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap:4px;">
                                            ${renderStatGrid(atk.Damage, "#ff9800", "0.8rem")}
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        ` : ''}

                        <div style="color:#9da59d; font-size:0.85rem; margin-bottom:0.5rem; border-left: 3px solid #9da59d; padding-left: 8px; font-weight:bold;">RECOVERABLE RESOURCES</div>
                        <div style="display: flex; flex-wrap: wrap; gap: 5px;">
                            ${matLoot.length > 0 
                                ? matLoot.map(l => `<span class="mapMoblootItem" style="font-size: 0.85rem; background: #111; padding: 3px 7px; border: 1px solid #333; color: #ff9800;">${l.Item?.Name}</span>`).join('')
                                : '<span style="color:#444; font-size:0.85rem; font-style:italic;">No loot signatures</span>'
                            }
                        </div>
                    </div>
                </div>`;
        });
    }
    html += `</div>`;

    // --- 2. HABITATS SECTION ---
    html += getHeader("KNOWN HABITATS", "section-spawns", "#4da6ff");
    html += `<div id="section-spawns" style="display:none; padding: 0.75rem;">`;
    if (mobData.Spawns && mobData.Spawns.length > 0) {
        mobData.Spawns.forEach((s, idx) => {
            const long = s.Properties?.Coordinates?.Longitude || 0;
            const lat = s.Properties?.Coordinates?.Latitude || 0;
            html += `
                <div class="habitat-row" data-idx="${idx}" style="cursor:pointer; padding: 0.75rem; background: rgba(77,166,255,0.05); border: 1px solid #1a3a5a; margin-bottom: 0.5rem; border-radius: 4px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="color: #4da6ff; font-weight: bold; font-size: 0.9rem;">[${s.Planet?.Name || 'N/A'}]</span>
                        <span style="color: #888; font-size: 0.75rem; font-weight: bold; letter-spacing: 1px;">📍 FOCUS</span>
                    </div>
                    <div style="color: #fff; font-size: 1rem; margin-bottom: 4px;">${s.Name}</div>
                    <div style="color: #666; font-size: 0.85rem;">COORD: ${long}, ${lat}</div>
                </div>`;
        });
    } else {
        html += `<div style="padding: 1rem; color: #666; font-size: 0.9rem;">No spatial signatures found.</div>`;
    }
    html += `</div></div>`;

    detailsEl.innerHTML = html;
    attachMobDetailListeners(mobData);
}
function attachMobDetailListeners(mobData) {
    const detailsContainer = document.getElementById('selectedmobDetailsEl');
    if (!detailsContainer) return;

    // 1. CLICK DELEGATION
    detailsContainer.onclick = (e) => {
        // --- A. Toggle Main Sections (Biometrics, Habitats) ---
        const header = e.target.closest('.mob-details-header');
        if (header) {
            if (typeof toggleSection === 'function') {
                toggleSection(header);
            }
            return;
        }

        // --- B. Handle [INTEL] Buttons (Nested Toggle) ---
        const intelBtn = e.target.closest('.intel-toggle-btn');
        if (intelBtn) {
            e.stopPropagation(); // Stop parent click events
            const targetId = intelBtn.getAttribute('data-target');
            const targetEl = document.getElementById(targetId);
            
            if (targetEl) {
                const isHidden = targetEl.style.display === 'none';
                targetEl.style.display = isHidden ? 'block' : 'none';
                intelBtn.innerText = isHidden ? '[ HIDE INTEL ]' : '[ SHOW INTEL ]';
                // Visual feedback: green when active, dark when closed
                intelBtn.style.background = isHidden ? '#36c536' : '#222';
                intelBtn.style.color = isHidden ? '#000' : '#36c536';
            }
            return;
        }

        // --- C. Focus Map on Habitat Click ---
        const habitatRow = e.target.closest('.habitat-row');
        if (habitatRow) {
            const idx = habitatRow.getAttribute('data-idx');
            const spawn = mobData.Spawns[idx];
            if (spawn && spawn.Properties?.Coordinates) {
                const long = spawn.Properties.Coordinates.Longitude;
                const lat = spawn.Properties.Coordinates.Latitude;
                if (typeof focusOnPoint === 'function') focusOnPoint(long, lat);
            }
        }
    };

    // 2. HOVER LISTENERS (Remains the same)
    const habitatRows = detailsContainer.querySelectorAll('.habitat-row');
    habitatRows.forEach(row => {
        const idx = row.getAttribute('data-idx');
        const spawn = mobData.Spawns[idx];

        const mapItem = {
            name: spawn.Name,
            long: spawn.Properties?.Coordinates?.Longitude || 0,
            lat: spawn.Properties?.Coordinates?.Latitude || 0,
            Properties: spawn.Properties,
            Planet: spawn.Planet,
            type: 'area'
        };

        row.addEventListener('mouseenter', () => {
            row.style.background = 'rgba(77,166,255,0.15)';
            window.hoveredItem = mapItem;
            if (typeof renderCanvasLayers === 'function') renderCanvasLayers();
        });

        row.addEventListener('mouseleave', () => {
            row.style.background = 'rgba(77,166,255,0.05)';
            window.hoveredItem = null;
            if (typeof renderCanvasLayers === 'function') renderCanvasLayers();
        });
    });
}
function toggleSection(headerEl) {
    const sectionId = headerEl.getAttribute('data-target');
    const section = document.getElementById(sectionId);
    const arrow = headerEl.querySelector('.section-arrow');
    
    if (!section) return;

    if (section.style.display === 'none') {
        section.style.display = 'block';
        if (arrow) arrow.style.transform = 'rotate(90deg)';
        headerEl.style.background = '#222'; // Visual feedback
    } else {
        section.style.display = 'none';
        if (arrow) arrow.style.transform = 'rotate(0deg)';
        headerEl.style.background = '#1a1a1a';
    }
}
/**
 * Handles rendering for items that actually have coordinates
 */
function renderSpatialRow(item, selectedMob, container) {
    const props = item.Properties || item.properties || {};
    const rawName = item.name || item.Name || props.Name || "";
    const density = typeof getDensityValue === 'function' ? getDensityValue(item) : "0";
    const long = Math.round(item.long || item.Longitude || 0);
    const lat = Math.round(item.lat || item.Latitude || 0);

    // Calculate percentage for the bar width
    // Adjust '10' to whatever your maximum density value is
    const maxDensity = 6; 
    const densityPercent = Math.min(Math.max((parseFloat(density) / maxDensity) * 100, 5), 100);

    const segments = rawName.split(',').map(s => s.trim());
    const targetSegment = segments.find(s => s.toLowerCase().includes(selectedMob.toLowerCase())) || "";
    const maturities = targetSegment.split('-')[1]?.trim() || "Common";

    const row = document.createElement('div');
    row.className = 'mob-match-row';
    row.style.cssText = "padding: 10px; border-bottom: 1px solid #222; cursor: pointer; transition: 0.2s;";
    
    row.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; pointer-events:none;">
            <span style="color: #b77815; font-size: 1.0rem; font-weight: bold;">[${long}, ${lat}]</span>
            
            <div style="width: 120px; display: flex; flex-direction: column; align-items: flex-end; gap: 2px;">
                <div style="display: flex; justify-content: space-between; width: 100%; font-size: 0.75rem; color: #ff4444; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px;">
                    <span>Density</span>
                    <span>${density}</span>
                </div>
                <div style="width: 100%; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; border: 1px solid rgba(255,68,68,0.2);">
                    <div style="width: ${densityPercent}%; height: 100%; background: linear-gradient(90deg, #800000 0%, #ff4444 100%); box-shadow: 0 0 5px rgba(255,68,68,0.5);"></div>
                </div>
            </div>
        </div>
        <div style="color: #9da59d; font-size: 0.90rem; font-weight: bold; pointer-events:none;">➣ ${maturities}</div>
    `;

    row.addEventListener('click', () => {
        focusOnPoint(long, lat);
        showWaypointDetails(item);
    });
    
    row.addEventListener('mouseenter', () => row.style.background = 'rgba(255,255,255,0.03)');
    row.addEventListener('mouseleave', () => row.style.background = 'transparent');

    container.appendChild(row);
}
function updateMapTransform() {
    mapWrapper.style.transform = `translate(${mapState.x}px, ${mapState.y}px) scale(${mapState.zoom})`;
    const scaleFactor = 1 / mapState.zoom;
    document.querySelectorAll('.waypoint').forEach(wp => {
        wp.style.transform = `translate(-50%, -50%) scale(${scaleFactor})`;
    });
    renderCanvasLayers();
}


/**
 * SPECIAL FOR ARIS: 
 * Aris coordinates are often relative to a specific center point (36864).
 * This function calculates the offset based on the image size if the static config is missing.
 */
function ensurePlanetConfig(wikiName, imgEl) {
    const configLookup = getConfigLookup(wikiName);
    
    // If it's already in our static MAP_CONFIG (from the big string), use it.
    if (MAP_CONFIG[configLookup] && MAP_CONFIG[configLookup].isInitialized && configLookup !== "ARIS") {
        return MAP_CONFIG[configLookup];
    }

    // Dynamic Calculation for ARIS or missing maps
    const w = imgEl.naturalWidth;
    const h = imgEl.naturalHeight;
    const autoScale = (w >= 1024) ? 8 : 16;

    if (configLookup === "ARIS") {
        // The "Special" ARIS math from your old version
        const calculatedLeft = 36864 - ((w * autoScale) * 0.5);
        MAP_CONFIG["ARIS"] = { 
            left: Math.round(calculatedLeft), 
            bottom: 0, 
            width: w, 
            height: h, 
            scale: autoScale, 
            isInitialized: true 
        };
    } else if (!MAP_CONFIG[configLookup]) {
        // Fallback for any other map not in the semicolon list
        MAP_CONFIG[configLookup] = { left: 0, bottom: 0, width: w, height: h, scale: 16, isInitialized: true };
    }
    return MAP_CONFIG[configLookup];
}


/* --- 8. some UI stuff --- */

function createWaypointElement(left, top, label, typeId) {
    const dot = document.createElement('div');
    dot.className = 'waypoint';
    dot.style.left = `${left}%`;
    dot.style.top = `${top}%`;
    dot.dataset.label = label;
    dot.style.transform = `translate(-50%, -50%) scale(${1 / mapState.zoom})`;
    dot.innerHTML = '🌀';
    return dot;
}

/* function updateTooltip(e) {
    const rect = mapWrapper.getBoundingClientRect();
    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const cfg = MAP_CONFIG[getConfigLookup(wikiName)];
    const displayEl = document.getElementById('static-coords');

    if (!displayEl) return;

    if (cfg) {
        // 1. Calculate the percentage across the CURRENT visual width/height of the map
        const localX = (e.clientX - rect.left) / rect.width;
        const localY = (e.clientY - rect.top) / rect.height;

        // 2. Convert to Game Coordinates
        const gameX = Math.round(cfg.left + (localX * cfg.width * cfg.scale));
        const gameY = Math.round(cfg.bottom + ((1 - localY) * cfg.height * cfg.scale));

        // 3. Check for hovered items to show names, otherwise show raw coords
        if (hoveredItem) {
            displayEl.innerHTML = `<strong>${hoveredItem.name}</strong> (${gameX}, ${gameY})`;
        } else {
            displayEl.innerHTML = `${wikiName}: ${gameX}, ${gameY}`;
        }
    } else {
        displayEl.innerHTML = `Coordinates Unavailable`;
    }
}
 */
function updateTooltip(e) {
    const rect = mapWrapper.getBoundingClientRect();
    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const configLookup = getConfigLookup(wikiName);
    const cfg = MAP_CONFIG[configLookup];
    const displayEl = document.getElementById('static-coords');

    if (!displayEl) return;

    if (cfg) {
        const localX = (e.clientX - rect.left) / rect.width;
        const localY = (e.clientY - rect.top) / rect.height;

        const gameX = Math.round(cfg.left + (localX * cfg.width * (cfg.scale || 1)));
        const gameY = Math.round(cfg.bottom + ((1 - localY) * cfg.height * (cfg.scale || 1)));

        if (hoveredItem) {
            const hProps = hoveredItem.Properties || hoveredItem.properties || {};
            const rawName = hoveredItem.name || hoveredItem.Name || hProps.Name || "Unknown";
            const itemType = (hoveredItem.type || hProps.Type || "").toLowerCase();
            
            let tooltipLines = [];

            if (itemType === 'area') {
                const rawAreaType = hProps.AreaType || hoveredItem.AreaType || "Area";
                tooltipLines.push(`[${rawAreaType.toUpperCase()}]`);

                const parts = rawName.split(' - ');
                const mobNames = [];
                
                for (let i = 0; i < parts.length; i += 2) {
                    // 1. Extract potential name
                    let cleanName = parts[i].split(',').pop().trim(); 
                    if(!cleanName) cleanName = parts[i].trim();

                    // 2. VALIDATION: Skip if name contains '/' (it's a maturity)
                    // or if it's empty, or already in our unique list
                    if(cleanName && !cleanName.includes('/') && !mobNames.includes(cleanName)) {
                        mobNames.push(cleanName);
                    }
                }

                mobNames.forEach(name => {
                    tooltipLines.push(`➣ ${name}`);
                });
            } else {
                tooltipLines.push(rawName);
            }

            // Final Waypoint Line
            tooltipLines.push(`[ ${wikiName}, ${gameX}, ${gameY} ]`);
            displayEl.innerHTML = tooltipLines.join('\n');
            
        } else {
            displayEl.innerHTML = `${wikiName}: ${gameX}, ${gameY}`;
        }
    } else {
        displayEl.innerHTML = `Coordinates Unavailable`;
    }
}
function resetView() {
    mapState.zoom = 1; mapState.x = 0; mapState.y = 0;
    updateMapTransform();
}


/* --- 9. CONTEXT MENU & WAYPOINTS --- */

let contextMenu = null;

/* function showContextMenu(e) {
    e.preventDefault(); // Stop browser menu
    
    if (!contextMenu) contextMenu = createContextMenu();
    
    const rect = mapWrapper.getBoundingClientRect();
    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const cfg = MAP_CONFIG[getConfigLookup(wikiName)];

    if (!cfg) return;

    // 1. Calculate Game Coordinates from Click Position
    const localX = (e.clientX - rect.left) / rect.width;
    const localY = (e.clientY - rect.top) / rect.height;
    const gameX = Math.round(cfg.left + (localX * cfg.width * cfg.scale));
    const gameY = Math.round(cfg.bottom + ((1 - localY) * cfg.height * cfg.scale));

    // 2. Build the WP String
    const wpLabel = `Dropped Pin`;
    const wpString = `/wp [${wikiName}, ${gameX}, ${gameY}, 0, ${wpLabel}]`;

    // 3. Update Menu Content
    contextMenu.innerHTML = `
        <div class="menu-header">${wikiName}</div>
        <div class="menu-coords">${gameX}, ${gameY}</div>
        <button class="menu-btn" id="ctxCopyBtn">📋 Copy Waypoint</button>
    `;

    // 4. Position and Show
    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.classList.add('active');

    // 5. Handle Copy Button
    document.getElementById('ctxCopyBtn').onclick = () => {
        navigator.clipboard.writeText(wpString).then(() => {
            showCopyNotification();
            contextMenu.classList.remove('active');
        });
    };
}
 */

/* function showContextMenu(e) {
    e.preventDefault();
    if (!contextMenu) contextMenu = createContextMenu();
    
    const rect = mapWrapper.getBoundingClientRect();
    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const cfg = MAP_CONFIG[getConfigLookup(wikiName)];

    if (!cfg) return;

    // 1. Calculate Coordinates
    const localX = (e.clientX - rect.left) / rect.width;
    const localY = (e.clientY - rect.top) / rect.height;
    const gameX = Math.round(cfg.left + (localX * cfg.width * cfg.scale));
    const gameY = Math.round(cfg.bottom + ((1 - localY) * cfg.height * cfg.scale));

    // 2. Identify Item and Format Label
    const item = getCanvasItemAtPos(e.clientX, e.clientY);
    const rawName = item ? (item.name || item.Name || item.Properties?.Name) : "Dropped Pin";
    const type = item ? (item.type || item.Properties?.Type || "").toLowerCase() : "";
    const areaType = item ? (item.AreaType || item.Properties?.AreaType || "").toLowerCase() : "";
    
    let displayLabel = rawName;

    // --- APPLY SMART TRIMMING FOR MOB AREAS ---
    if (item && (type === 'area' || areaType.includes('mob'))) {
        const mobGroups = rawName.split(',');
        const mobNames = [];

        mobGroups.forEach(group => {
            const namePart = group.split('-')[0].trim();
            if (namePart && !mobNames.includes(namePart)) {
                mobNames.push(namePart);
            }
        });

        if (mobNames.length > 0) {
            const limit = 2; // Context menus should be even tighter than tooltips
            const shown = mobNames.slice(0, limit);
            displayLabel = shown.join(', ');
            if (mobNames.length > limit) {
                displayLabel += ` +${mobNames.length - limit} more`;
            }
        }
    }

    // 3. Render Menu Content
    contextMenu.innerHTML = `
        <div class="menu-header" title="${rawName}">${displayLabel}</div>
        <div class="menu-coords" style="font-family: monospace; color: #888; margin-bottom: 8px; padding: 0 10px;">${gameX}, ${gameY}</div>
        <button class="menu-btn" id="ctxCopyBtn">📋 Copy Waypoint</button>
        ${item ? `<button class="menu-btn" id="ctxDetailsBtn">🔍 View Details</button>` : ''}
    `;

    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.classList.add('active');

    // 4. Attach Listeners
    document.getElementById('ctxCopyBtn').onclick = () => {
        // Use rawName for the copy function so our 25-char logic handles the clipboard
        copyWaypoint(wikiName, gameX, gameY, rawName);
        contextMenu.classList.remove('active');
    };

    if (item && document.getElementById('ctxDetailsBtn')) {
        document.getElementById('ctxDetailsBtn').onclick = () => {
            showWaypointDetails(item);
            contextMenu.classList.remove('active');
        };
    }
} */
function showContextMenu(e) {
    e.preventDefault();
    if (!contextMenu) contextMenu = createContextMenu();
    
    const rect = mapWrapper.getBoundingClientRect();
    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const cfg = MAP_CONFIG[getConfigLookup(wikiName)];

    if (!cfg) return;

    // 1. Calculate Coordinates
    const localX = (e.clientX - rect.left) / rect.width;
    const localY = (e.clientY - rect.top) / rect.height;
    const gameX = Math.round(cfg.left + (localX * cfg.width * cfg.scale));
    const gameY = Math.round(cfg.bottom + ((1 - localY) * cfg.height * cfg.scale));

    // 2. Identify Item
    const item = getCanvasItemAtPos(e.clientX, e.clientY);
    const rawName = item ? (item.name || item.Name || item.Properties?.Name) : "Dropped Pin";
    const type = item ? (item.type || item.Properties?.Type || "").toLowerCase() : "";
    const areaType = item ? (item.AreaType || item.Properties?.AreaType || "").toLowerCase() : "";
    
    // Check if this is one of our user-created waypoint types
    const isUserWaypoint = item && ['sessionwaypoints', 'savedwaypoints', 'miningclaims'].includes(type);

    let displayLabel = rawName;
    // ... (Your existing Mob Area trimming logic remains here) ...

    // 3. Render Menu Content
    contextMenu.innerHTML = `
        <div class="menu-header" title="${rawName}">${displayLabel}</div>
        <div class="menu-coords" style="font-family: monospace; color: #888; margin-bottom: 8px; padding: 0 10px;">${gameX}, ${gameY}</div>
        <button class="menu-btn" id="ctxCopyBtn">📋 Copy Waypoint</button>
        ${item ? `<button class="menu-btn" id="ctxDetailsBtn">🔍 View Details</button>` : ''}
        ${isUserWaypoint ? `<button class="menu-btn" id="ctxRemoveBtn" style="color: #ff4444; border-top: 1px solid #444;">❌ Remove Waypoint</button>` : ''}
    `;

    contextMenu.style.left = `${e.clientX}px`;
    contextMenu.style.top = `${e.clientY}px`;
    contextMenu.classList.add('active');

    // 4. Attach Listeners
    document.getElementById('ctxCopyBtn').onclick = () => {
        copyWaypoint(wikiName, gameX, gameY, rawName);
        contextMenu.classList.remove('active');
    };

    if (item && document.getElementById('ctxDetailsBtn')) {
        document.getElementById('ctxDetailsBtn').onclick = () => {
            showWaypointDetails(item);
            contextMenu.classList.remove('active');
        };
    }

    // 5. NEW: Remove Waypoint Listener
    if (isUserWaypoint && document.getElementById('ctxRemoveBtn')) {
        document.getElementById('ctxRemoveBtn').onclick = () => {
            // Use the list type to target the correct window array
            const listKey = item.type; // e.g., 'sessionWaypoints'
            if (window[listKey]) {
                window[listKey] = window[listKey].filter(wp => wp.id !== item.id);
                saveWaypointsToDisk(listKey);
                if (typeof queueRender === 'function') queueRender();
                console.log(`[SYSTEM] Removed ${item.name} from ${listKey}`);
            }
            contextMenu.classList.remove('active');
        };
    }
}
/**
 * Helper to extract density from item or properties.
 * Returns a number (default 0).
 */
function getDensityValue(item) {
    const props = item.Properties || item.properties || {};
    return Number(item.Density || props.Density || 0);
}
function showWaypointDetails(item) {
    const detailBox = document.getElementById('mapMainDetails');
    if (!detailBox) return;

    // 1. Data Normalization
    const props = item.Properties || item.properties || {};
    const rawName = item.name || item.Name || props.Name || "Unknown Location";
    const planet = item.planet || (item.Planet && item.Planet.Name) || "Unknown Planet";
    const type = (item.type || props.Type || "POI").toUpperCase();
    const areaType = (item.AreaType || props.AreaType || "").toLowerCase();
    const long = Math.round(item.long || item.Longitude || 0);
    const lat = Math.round(item.lat || item.Latitude || 0);

    // 2. Density Logic
    const currentDensity = getDensityValue(item);
    // Find max density in current dataset to scale the bar (fallback to 5 if none found)
    const allData = [...(window['cachedLocations'] || []), ...(window['cachedNPCs'] || [])];
    const maxDensity = Math.max(...allData.map(d => getDensityValue(d)), 5);
    const densityPercent = (currentDensity / maxDensity) * 100;

    // --- NAME EXTRACTION (Max 3 + Overflow) ---
    let displayHeaderName = rawName;
    const isMobArea = type === 'AREA' || areaType.includes('mob');

    if (isMobArea) {
        const mobGroups = rawName.split(',');
        const mobNames = [];
        mobGroups.forEach(group => {
            const namePart = group.split('-')[0].trim();
            if (namePart && !mobNames.includes(namePart)) {
                mobNames.push(namePart);
            }
        });
        if (mobNames.length > 0) {
            const limit = 3;
            const shownNames = mobNames.slice(0, limit);
            const extraCount = mobNames.length - limit;
            displayHeaderName = shownNames.join(', ');
            if (extraCount > 0) displayHeaderName += `... +${extraCount} more`;
        }
    }

    // 3. Build HTML
    let html = `
        <div class="waypoint-detail-card">
            <div class="detail-header" style="border-bottom: 1px solid #444; padding-bottom: 10px; margin-bottom: 10px;">
                <h3 style="margin: 0; color: #b77815; font-size: 1.1rem; line-height:1.2;" title="${rawName}">
                    ${displayHeaderName}
                </h3>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
                    <span style="color: #00e5ff; font-size: 10px; letter-spacing: 1px;">${type} • ${planet}</span>
                    <span style="font-family: monospace; font-size: 11px; color: #888;">[${long}, ${lat}]</span>
                </div>
            </div>`;

    // --- DENSITY BAR UI ---
    if (currentDensity > 0) {
        html += `
        <div class="density-container" style="margin-bottom: 12px; background: rgba(0,0,0,0.3); padding: 6px; border-radius: 4px; border: 1px solid #333;">
            <div style="display: flex; justify-content: space-between; font-size: 9px; color: #ff4444; text-transform: uppercase; margin-bottom: 4px; font-weight: bold;">
                <span>Spawn Density</span>
                <span>Level ${currentDensity}</span>
            </div>
            <div style="width: 100%; height: 4px; background: #222; border-radius: 2px; overflow: hidden;">
                <div style="width: ${densityPercent}%; height: 100%; background: linear-gradient(90deg, #660000, #ff0000); box-shadow: 0 0 8px #ff0000;"></div>
            </div>
        </div>`;
    }

    // 4. PvP / Lootable Checks
    const isPvP = rawName.toLowerCase().includes('pvp') || areaType.includes('pvp') || props.IsPvP;
    const isLootable = rawName.toLowerCase().includes('lootable') || props.IsLootable;
    if (isPvP) {
        html += `<div style="background: rgba(255, 0, 0, 0.2); border: 1px solid #ff4444; padding: 5px; margin-bottom: 10px; text-align: center; color: #ff4444; font-weight: bold; font-size: 11px;">
            ⚠️ WARNING: PVP ZONE ${isLootable ? '(LOOTABLE)' : ''}
        </div>`;
    }

    // 5. Area / Mob Inhabitants
    if (isMobArea) {
        html += `<div style="margin-bottom: 10px;"><div style="color: #00d9ff; font-size: 1.1rem; margin-bottom: 5px; border-bottom:2px ridge #00d9ff;">Full Habitat Scan</div>`;
        const fullGroups = rawName.split(',').map(p => p.trim());
        fullGroups.forEach(part => {
            if (part && !part.toLowerCase().includes('pvp')) {
                html += `<div style="font-size: 0.9rem; color: #aaa;font-weight:bold; margin-bottom: 2px;">➣ ${part}</div>`;
            }
        });
        html += `</div>`;
    }

    // 6. Extended Telemetry (Filtered)
    let extraInfoHtml = '';
    const ignoreList = ['name', 'Name', 'type', 'Type', 'long', 'Longitude', 'lat', 'Latitude', 'planet', 'Properties', 'properties', 'AreaType', 'Density'];
    const combinedData = { ...item, ...props };
    Object.keys(combinedData).forEach(key => {
        if (!ignoreList.includes(key) && typeof combinedData[key] !== 'object' && combinedData[key] !== null) {
            extraInfoHtml += `<div style="display: flex; justify-content: space-between; border-bottom: 1px dashed #222; padding: 2px 0;"><span style="color: #666;">${key}:</span><span style="color: #aaa;">${combinedData[key]}</span></div>`;
        }
    });

    if (extraInfoHtml) {
        html += `<div style="background: #0d0d0d; padding: 8px; border-radius: 4px; margin-top: 10px;"><div style="font-size: 9px; color: #444; margin-bottom: 5px; text-transform: uppercase;">Extended Telemetry</div><div style="font-size: 10px;">${extraInfoHtml}</div></div>`;
    }

    // 7. Action Buttons
    html += `
            <div class="detail-actions" style="margin-top: 15px; display: flex; gap: 8px;">
                <button class="subtab-btn" id="btnDetailCenter" style="flex: 1; padding: 6px; font-size: 10px;">CENTER VIEW</button>
                <button class="subtab-btn" id="btnDetailCopy" style="flex: 1; padding: 6px; font-size: 10px;">COPY /WP</button>
            </div>
        </div>`;

    detailBox.innerHTML = html;

	// Inside showWaypointDetails, after setting innerHTML:
	const btnCenter = document.getElementById('btnDetailCenter');
	const btnCopy = document.getElementById('btnDetailCopy');

	if (btnCenter) {
		btnCenter.addEventListener('click', () => focusOnPoint(long, lat));
	}
	if (btnCopy) {
		btnCopy.addEventListener('click', () => copyWaypoint(planet, long, lat, rawName));
	}
}
function createContextMenu() {
    const el = document.createElement('div');
    el.id = 'mapContextMenu';
    el.className = 'custom-context-menu';
    document.body.appendChild(el);
    return el;
}

function showCopyNotification() {
    const toast = document.getElementById('copyToast') || createToastElement();
    toast.innerText = "Waypoint Copied!";
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

function createToastElement() {
    const el = document.createElement('div');
    el.id = 'copyToast';
    el.className = 'map-toast';
    document.body.appendChild(el);
    return el;
}




/* --- 10. INITIALIZATION --- */

async function initTeleporters() {
    try {
        if (typeof getData === "function") {
            cachedTeleporters = await getData("teleporters", "teleporters.json");
            drawTeleportersForCurrentPlanet();
        }
    } catch (err) { console.error("TP Load Error:", err); }
}

function initializeLayerControls() {
    // --- 1. SETUP INDIVIDUAL TOGGLES ---
    // We only call handleRetroToggle here. It already handles:
    // - Loading the initial state from localStorage
    // - Adding the 'change' listener
    // - Toggling the 'retrotoggleswitchA-on' class
    allowedTypes.forEach(type => {
        const toggleId = type + 'LabelToggle';
        const storageKey = 'map_' + type + '_labels';

        handleRetroToggle(toggleId, storageKey, (isOn) => {
            // This callback runs AFTER handleRetroToggle does the visual work
            console.log(`[SYSTEM] ${type} Labels: ${isOn ? 'ON' : 'OFF'}`);
            needsLabelUpdate = true; 
            queueRender();
        });
    });

    // --- 2. MASTER LABEL TOGGLE ---
	// --- 2. MASTER LABEL TOGGLE ---
	const masterToggle = document.getElementById('masterLabelToggle');
	if (masterToggle) {
		handleRetroToggle('masterLabelToggle', null, (isMasterOn) => {
			allowedTypes.forEach((type, index) => {
				const checkbox = document.getElementById(type + 'LabelToggle');
				const parent = checkbox?.closest('.retrotoggleswitchA');
				
				if (checkbox && parent) {
					// If turning OFF, do it instantly. If turning ON, use the cool stagger.
					const randomDelay = isMasterOn ? Math.random() * 550 + 50 : 0; 

					setTimeout(() => {
						checkbox.checked = isMasterOn;
						
						// Force the class toggle
						if (isMasterOn) {
							parent.classList.add('retrotoggleswitchA-on');
						} else {
							parent.classList.remove('retrotoggleswitchA-on');
						}

						// Explicitly update storage
						localStorage.setItem('map_' + type + '_labels', isMasterOn ? 'on' : 'off');
						
						if (index === allowedTypes.length - 1) {
							needsLabelUpdate = true;
							queueRender();
						}
					}, randomDelay);
				}
			});
		});
	}
    console.log("✅ Label toggles synchronized.");
}
/**
 * Scans for areas containing the selected mob and updates the results element.
 */

async function initAllData() {
    await Promise.all([
        initGroupData('locations', 'locations.json'),
        initGroupData('teleporters', 'teleporters.json'),
		initGroupData('mobs', 'mobs.json')
    ]);
	if (typeof initMobCombobox === "function") {
        initMobCombobox();
    }
    updateSidebarLists();
    renderCanvasLayers();        // initial render
	
}

// Updated to handle both normal locations and raw teleporters.json
async function initGroupData(groupKey, fileName) {
    try {
        if (typeof getData !== "function") return;

        const raw = await getData(groupKey, fileName);

        if (groupKey === 'teleporters') {
            // ... existing teleporter mapping ...
            window.cachedTeleporters = raw.map(tp => ({
                id: tp.Id || tp.Name,
                name: tp.Name || "Unknown Teleporter",
                type: 'teleporter',
                planet: tp.Planet?.Name || "Unknown",
                lat: tp.Properties?.Coordinates?.Latitude || tp.Latitude || 0,
                long: tp.Properties?.Coordinates?.Longitude || tp.Longitude || 0
            }));
            console.log(`[ENGINE] Cached ${window.cachedTeleporters.length} legacy teleporters.`);
        } 
        else if (groupKey === 'mobs') {
			// Store the raw array so we keep Maturities, Spawns, and Stats
			window.cachedmobs = raw; 
			console.log(`[ENGINE] Cached ${window.cachedmobs.length} full mob profiles.`);
		}
        else {
            // Normal locations.json / npcs etc.
            window[`cached${groupKey}`] = raw.reduce((acc, item) => {
                const rawType = item.Properties?.Type || "";
                const normalizedType = rawType.toLowerCase().replace(/\s/g, '');
                if (!allowedTypes.includes(normalizedType)) return acc;

                acc.push({
                    id: item.Id,
                    name: item.Name || "Unknown",
                    type: normalizedType,
                    planet: item.Planet?.Name || "Unknown",
                    lat: item.Properties?.Coordinates?.Latitude || 0,
                    long: item.Properties?.Coordinates?.Longitude || 0,
                    Properties: item.Properties 
                });
                return acc;
            }, []);
            console.log(`[ENGINE] Cached ${window[`cached${groupKey}`].length} items for ${groupKey}`);
        }

        renderCanvasLayers();
    } catch (err) {
        console.warn(`[ENGINE] File ${fileName} skip/missing.`, err);
        if (groupKey === 'teleporters') window.cachedTeleporters = [];
        if (groupKey === 'mobs') window.cachedmobs = [];
    }
}

function initMobFuzzySearch() {
    const searchInput = document.getElementById('mobFuzzySearch');
    const dropdown = document.getElementById('mapmobfilterDropdown');

    if (!searchInput || !dropdown) return;

    searchInput.addEventListener('input', (e) => {
        const term = e.target.value.toLowerCase();
        const options = dropdown.querySelectorAll('option');

        let firstMatch = null;

        options.forEach(opt => {
            // Never hide the default "-- Select --" option
            if (opt.value === "") return;

            const text = opt.textContent.toLowerCase();
            const isMatch = text.includes(term);
            
            // Toggle visibility (using display: none on options works in most modern browsers)
            opt.style.display = isMatch ? 'block' : 'none';

            // Keep track of the first visible match to auto-select or highlight
            if (isMatch && !firstMatch) firstMatch = opt;
        });

        // Optional: If there's exactly one match, you could auto-select it, 
        // but usually, it's better to let the user click.
    });
}

function initMobCombobox() {
    const input = document.getElementById('mobComboboxInput');
    const results = document.getElementById('mobComboboxResults');
    const planetKey = document.getElementById('planetMapSelect')?.value || "";
    const wikiName = (typeof planetNameMap !== 'undefined' && planetNameMap[planetKey]) ? planetNameMap[planetKey] : planetKey;

    if (!input || !results) return;

    const masterMobList = getUniqueMobsByPlanet(wikiName);

    const renderList = (term = "") => {
        const filtered = masterMobList.filter(mob => 
            mob && typeof mob === 'string' && mob.toLowerCase().includes(term.toLowerCase())
        );

        if (filtered.length > 0) {
            results.style.display = 'block';
            results.innerHTML = filtered.map(mob => `
                <div class="combobox-item" data-mob="${mob}" 
                     style="padding: 6px 10px; color: #fff; font-size: 11px; cursor: pointer; border-bottom: 1px solid #222;">
                    ${mob}
                </div>
            `).join('');
        } else {
            results.style.display = 'none';
        }
    };

    // --- NEW: Double-click to clear and select text ---
    input.addEventListener('dblclick', () => {
        input.value = "";
        input.select(); // Optional: keeps the focus and shows cursor
        renderList(""); // Show the full list again after clearing
    });

    // --- UPDATED: Focus and Click logic ---
    input.addEventListener('focus', () => renderList(input.value));
    
    input.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevents the document click listener from closing it immediately
        renderList(input.value);
    });

    input.addEventListener('input', (e) => renderList(e.target.value));

    // Selection logic
    results.addEventListener('click', (e) => {
        const item = e.target.closest('.combobox-item');
        if (item) {
            const mobName = item.getAttribute('data-mob');
            selectMobFromCombobox(mobName);
            results.style.display = 'none'; // Ensure it hides after selection
        }
    });

    // Hover Effects
    results.addEventListener('mouseover', (e) => {
        const item = e.target.closest('.combobox-item');
        if (item) {
            item.style.background = '#111';
            item.style.color = '#9da59d';
        }
    });
    results.addEventListener('mouseout', (e) => {
        const item = e.target.closest('.combobox-item');
        if (item) {
            item.style.background = 'transparent';
            item.style.color = '#fff';
        }
    });

    // --- UPDATED: Close logic ---
    // This handles clicking outside the component
    const closeDropdown = (e) => {
        // Change '.mob-combobox-container' to the actual class of your wrapper div
        if (!input.contains(e.target) && !results.contains(e.target)) {
            results.style.display = 'none';
        }
    };

    document.addEventListener('click', closeDropdown);
}


let renderPending = false;
function queueRender() {
    if (renderPending) return;
    renderPending = true;
    requestAnimationFrame(() => {
        renderCanvasLayers();
        renderPending = false;
    });
}
function initmapcontainer() {
	mapContainer.addEventListener('mousedown', (e) => {
		if (e.button !== 0) return;
		mapState.isDragging = true;
		mapState.startX = e.clientX - mapState.x;
		mapState.startY = e.clientY - mapState.y;
	});
	mapContainer.addEventListener('click', (e) => {
		const wp = e.target.closest('.waypoint');
		const planetKey = document.getElementById('planetMapSelect').value;
		const wikiName = planetNameMap[planetKey];

		if (wp) {
			const item = cachedTeleporters.find(t => t.Name === wp.dataset.label);
			if (item) copyWaypoint(wikiName, item.Properties.Coordinates.Longitude, item.Properties.Coordinates.Latitude, item.Name);
			return;
		}

		const item = getCanvasItemAtPos(e.clientX, e.clientY);
		if (item) copyWaypoint(item.planet, item.long, item.lat, item.name);
	});
	// --- SECTION 9: UPDATED LISTENERS ---
	mapContainer.addEventListener('mousemove', (e) => {
        if (mapState.isDragging) {
            mapState.x = e.clientX - mapState.startX;
            mapState.y = e.clientY - mapState.startY;
            updateMapTransform(); // updateMapTransform should call queueRender()
            return; 
        }
        
        const item = getCanvasItemAtPos(e.clientX, e.clientY);
        
        if (item !== hoveredItem) {
            hoveredItem = item;
            mapContainer.style.cursor = item ? 'pointer' : 'crosshair';
            queueRender(); // Use the debouncer here!
        }
        
        updateTooltip(e);
		
    });
	mapContainer.addEventListener('click', (e) => {
		// If we just finished a drag, don't trigger a click/waypoint copy
		// (Optional: you can add a 'wasDragging' check here)
		
		const wp = e.target.closest('.waypoint');
		const planetKey = document.getElementById('planetMapSelect').value;
		const wikiName = planetNameMap[planetKey];

		// Check DOM Waypoints
		if (wp) {
			const item = cachedTeleporters.find(t => t.Name === wp.dataset.label);
			if (item) copyWaypoint(wikiName, item.Properties.Coordinates.Longitude, item.Properties.Coordinates.Latitude, item.Name);
			return;
		}

		// Check Canvas Items (NPCs, Outposts, etc)
		const item = getCanvasItemAtPos(e.clientX, e.clientY);
		if (item) {
			copyWaypoint(item.planet, item.long, item.lat, item.name);
			showWaypointDetails(item);
		}
	});
	mapContainer.addEventListener('wheel', (e) => {
		e.preventDefault();

		// 1. Determine direction and use a MULTIPLIER instead of a fixed sum
		// 1.1 = 10% zoom in, 0.9 = 10% zoom out
		const zoomSpeed = 0.15; 
		const factor = e.deltaY > 0 ? (1 - zoomSpeed) : (1 + zoomSpeed);
		
		// 2. Calculate the new zoom level by multiplying
		const newZoom = Math.min(Math.max(mapState.zoom * factor, 0.1), 100);

		// 3. Coordinate math (stays mostly the same, but use newZoom)
		const rect = mapContainer.getBoundingClientRect();
		
		// Position of mouse relative to the map container
		const mouseX = e.clientX - rect.left;
		const mouseY = e.clientY - rect.top;

		// Project mouse to "World" coordinates before zoom
		const worldX = (mouseX - mapState.x) / mapState.zoom;
		const worldY = (mouseY - mapState.y) / mapState.zoom;

		// Update state
		mapState.zoom = newZoom;

		// Reposition x/y so the point under the mouse stays under the mouse
		mapState.x = mouseX - (worldX * newZoom);
		mapState.y = mouseY - (worldY * newZoom);

		updateMapTransform();
	}, { passive: false });
	mapContainer.addEventListener('contextmenu', showContextMenu);

	window.addEventListener('mouseup', () => { mapState.isDragging = false; });
	document.getElementById('zoomin')?.addEventListener('click', () => {
		// Zoom in by 25%
		const newZoom = Math.min(mapState.zoom * 1.25, 10);
		// Note: Simple button zoom doesn't track mouse, centers on current view
		// If you want it to zoom into the center of the screen, you'd need the 
		// worldX/worldY logic using mapContainer.offsetWidth / 2
		mapState.zoom = newZoom;
		updateMapTransform();
	});
	document.getElementById('zoomout')?.addEventListener('click', () => {
		// Zoom out by 25%
		mapState.zoom = Math.max(mapState.zoom * 0.8, 0.1);
		updateMapTransform();
	});

	document.getElementById('resetview')?.addEventListener('click', resetView);
	const mapTab = document.getElementById('themapTab');
	if (mapTab) {
		const resizeObserver = new ResizeObserver(() => {
			// This fires whenever #themapTab changes size
			resetView();
			
			// If your canvas doesn't auto-stretch via CSS, 
			// you may also need to update canvas internal dimensions here:
			// updateCanvasSize(); 
			
			// console.log("[SYSTEM] Layout shift detected. Resetting Viewport.");
		});

		resizeObserver.observe(mapTab);
	}
	const clearBtn = document.getElementById('btn-clear-waypoints');

    if (clearBtn) {
        clearBtn.addEventListener('click', (e) => {
            // Optional: Tactical "Confirm" check to prevent accidental wipes during a stream
            const confirmed = confirm("CONFIRM SYSTEM PURGE: Clear all session waypoints?");
            
            if (confirmed) {
                // Trigger the function we built
                clearUserWaypoints('sessionWaypoints');
                
                // Visual feedback: brief flicker effect for that CRT vibe
                clearBtn.style.backgroundColor = "rgba(255, 68, 68, 0.5)";
                setTimeout(() => {
                    clearBtn.style.backgroundColor = "";
                }, 150);
                
                console.log("[UI] User triggered session waypoint purge.");
            }
        });
    }
	document.getElementById('planetMapSelect').addEventListener('change', function(e) {
		const planetKey = e.target.value;
		const imgEl = document.getElementById('baseMapImg');
		resetView();
		document.querySelectorAll('.waypoint').forEach(wp => wp.remove());
		
		const extensions = ['jpg', 'png'];
		let extIndex = 0;
		
		const tryLoadImage = () => {
			imgEl.src = `assets/images/maps/${planetKey}_map.${extensions[extIndex]}`;
		};

		imgEl.onerror = () => {
			extIndex++;
			if (extIndex < extensions.length) tryLoadImage();
		};

		imgEl.onload = () => {
			const wikiName = planetNameMap[planetKey];
			// CRITICAL: Initialize the config (especially for ARIS) before drawing
			ensurePlanetConfig(wikiName, imgEl); 
			//drawTeleportersForCurrentPlanet();
			needsLabelUpdate = true; // CRITICAL: Planet changed, must rebake labels
            queueRender();

			updateSidebarLists();
			populateMobDropdown('mapmobfilterDropdown');
		};
		
		tryLoadImage();
	});
	const mobFilter = document.getElementById('mapmobfilterDropdown');
	if (mobFilter) {
		mobFilter.addEventListener('change', (e) => {
			updateMobMatchList(e.target.value);
		});
	}
	// Close menu on left click or escape
	window.addEventListener('click', (e) => {
		if (contextMenu && !contextMenu.contains(e.target)) {
			contextMenu.classList.remove('active');
		}
	});

	document.querySelectorAll('#mapDetailsContainer h2.mob-details-header').forEach(h2 => {
		h2.onclick = () => toggleSection(h2);
	});
}

function initUserWaypoints() {
    // --- 1. RESTORE LAST KNOWN POSITION (LKP) ---
    const savedPos = localStorage.getItem('entropia_last_known_pos');
    if (savedPos) {
        try {
            const parsed = JSON.parse(savedPos);
            window.lastKnownPos = parsed;
            if (parsed.active) {
                const el = document.getElementById('lastKnownPosition');
                if (el) {
                    el.innerHTML = `
                        <div class="pos-main">[${parsed.planet}, ${parsed.long}, ${parsed.lat}, ${parsed.alt}, ${parsed.waypoint}]</div>
                        <div class="pos-timestamp" style="font-size: 0.85em; opacity: 0.8; color: #00ffff; font-family: monospace;">
                            SIGNAL RESTORED: ${parsed.timestamp}
                        </div>
                    `;
                }
            }
        } catch (e) { console.error("LKP Restore Error", e); }
    }

    // --- 2. RESTORE LIST COLLECTIONS ---
    const restoreList = (key, globalName) => {
        const saved = localStorage.getItem(key);
        if (saved) {
            try { window[globalName] = JSON.parse(saved); }
            catch (e) { console.error(`Error restoring ${globalName}`, e); }
        }
    };

    restoreList('entropia_session_waypoints', 'sessionWaypoints');
    restoreList('entropia_saved_waypoints', 'savedWaypoints');
    restoreList('entropia_mining_claims', 'miningClaims');

    // --- 3. TRIGGER INITIAL DRAW ---
    if (typeof queueRender === 'function') queueRender();
}
function initCrtScreen() {
    const crt = document.querySelector('.crt-overlay');
    if (!crt) return;

    // --- 1. CRT SCANLINES TOGGLE ---
    handleRetroToggle('crtOverlayToggle', 'map_crt_effect', (isOn) => {
        // Only apply the 'hidden' toggle if the system is actually powered on
        const isPoweredOn = document.getElementById('mapPowerToggle')?.checked;
        
        if (isOn && isPoweredOn) {
            crt.classList.remove('hidden');
        } else if (!isOn) {
            crt.classList.add('hidden');
        }
        console.log(`[SYSTEM] CRT Matrix ${isOn ? 'Engaged' : 'Disengaged'}.`);
    });

    // --- 2. SYSTEM POWER TOGGLE ---
    handleRetroToggle('mapPowerToggle', 'map_system_power', (isOn) => {
        // Clean up animation classes immediately
        crt.classList.remove('is-shutting-off', 'power-on', 'active', 'power-off');

        if (isOn) {
            // BOOTING UP
            crt.classList.add('power-on'); 
            
            setTimeout(() => {
                crt.classList.remove('power-on');
                crt.classList.add('active'); 
                
                // Final check: If power is on, should scanlines be visible?
                const scanlinesEnabled = document.getElementById('crtOverlayToggle')?.checked;
                crt.classList.toggle('hidden', !scanlinesEnabled);
                
                if (typeof renderCanvasLayers === 'function') renderCanvasLayers(); 
            }, 450); 
        } else {
            // SHUTTING DOWN
            crt.classList.add('is-shutting-off');

            setTimeout(() => {
                crt.classList.remove('is-shutting-off');
                crt.classList.add('power-off');
                // Force hidden when off so scanlines don't ghost over a black screen
                crt.classList.add('hidden'); 
            }, 300);
        }
    });
}
document.getElementById('globalFuzzySearch').addEventListener('input', () => {
    updateSidebarLists();
});

document.addEventListener("DOMContentLoaded", () => {
    // 1. Restore saved data first
    initUserWaypoints();

    // 2. Existing Button Listeners (Keep these here)
    const focusBtn = document.getElementById('focusLastknownPositionbtn');
    if (focusBtn) {
        focusBtn.addEventListener('click', () => {
            const pos = window.lastKnownPos;
            if (pos && pos.active) {
                focusOnPoint(pos.long, pos.lat);
            }
        });
    }

    const copyBtn = document.getElementById('copyLastknownPositionbtn');
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            const pos = window.lastKnownPos;
            if (pos && pos.active) {
                copyWaypoint(pos.planet, pos.long, pos.lat, pos.waypoint);
            }
        });
    }

    // 3. Initialize the rest
    initializeLayerControls();
    initmapcontainer();
    initCrtScreen();
    initAllData();
});