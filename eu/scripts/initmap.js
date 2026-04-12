/* --- 1. STATE & CONFIGURATION --- */
let mapState = { zoom: 1, x: 0, y: 0, isDragging: false, startX: 0, startY: 0 };
let cachedTeleporters = [];
let hoveredItem = null; 
const savedPos = localStorage.getItem('entropia_last_known_pos');

let lastKnownPos = savedPos ? JSON.parse(savedPos) : {
    planet: "",
    long: 0,
    lat: 0,
    alt: 0,
    waypoint: "",
    timestamp: "",
    active: false
};

// Ensure the window object is synced for your other functions
window.lastKnownPos = lastKnownPos;
// Add these to your global variables at the top of the file
window.sessionWaypoints = window.sessionWaypoints || [];
window.savedWaypoints = window.savedWaypoints || [];
window.miningClaims = window.miningClaims || [];

// Helper to save any list back to storage
function saveWaypointsToDisk(listName) {
    const keys = {
        sessionWaypoints: 'entropia_session_waypoints',
        savedWaypoints: 'entropia_saved_waypoints',
        miningClaims: 'entropia_mining_claims'
    };
    if (keys[listName]) {
        localStorage.setItem(keys[listName], JSON.stringify(window[listName]));
    }
}

const mapWrapper = document.getElementById('mapWrapper');
const mapContainer = document.getElementById('theMap');
const mapCanvas = document.getElementById('mapCanvas'); 
const ctx = mapCanvas ? mapCanvas.getContext('2d') : null;
// let mapTooltip = null;

const wikkiBasemapData = [`
Name;Planetary System;Planet;Left Offset;Bottom Offset;Width;Height;Scale;Order;Max. Zoom
Ancient Greece;Next Island;Ancient Greece;32768;16384;512;512;16;15;3
Arctic;Rocktropia;Hunt The THING;32768;16384;1024;1024;8;9;3
Arkadia Moon;Arkadia;Arkadia Moon;8192;8197;516;516;16;11;3
Calypso;Calypso;Planet Calypso;16384;24576;4608;4608;16;1;9
Calypso Gateway;Calypso;Planet Calypso;65536;65536;512;512;16;3;3
Thule;Calypso;Thule;65536;65536;512;512;16;3;3
Crystal Palace;Calypso;Crystal Palace;65536;65536;512;512;16;4;3
foma;Calypso;Asteroid F.O.M.A.;65536;65536;512;512;16;5;3
Hell;Rocktropia;ROCKtropia;32768;16384;1024;1024;8;8;3
Secret Island;Rocktropia;ROCKtropia;32768;16399;512;512;16;10;3
Monria;Monria;Monria;32768;16384;512;512;16;18;3
Next Island;Next Island;Next Island;122880;81920;1024;1024;16;14;6
Planet Arkadia;Arkadia;Planet Arkadia;8192;8192;1536;1536;16;12;6
Arkadia Underground;Arkadia;Planet Arkadia Underground;8182;16384;512;512;16;13;3
Planet Cyrene;Cyrene;Planet Cyrene;131072;73732;1024;1024;8;17;6
Planet Toulan;Planet Toulan;Planet Toulan;131072;90143;512;512;16;19;2
Rocktropia;Rocktropia;ROCKtropia;131072;81920;1024;2048;8;7;6
Setesh;Calypso;Setesh;65536;65536;512;512;16;3;3
Space;Space;Space;49168;49181;3072;2560;16;16;4
The Hub;Cyrene;The Hub;1;1;500;500;8;20;3
`][0].trim();

const planetNameMap = {
    "space": "Space", "ancientgreece": "Ancient Greece", "setesh": "Setesh",
    "calypso": "Calypso", "calypsogateway": "Calypso Gateway", "thule": "Thule",
    "aris": "ARIS", "foma": "Asteroid F.O.M.A.", "crystalpalace": "Crystal Palace",
    "monria": "Monria", "rocktropia": "ROCKtropia", "arctic": "Hunt The THING",
    "secretisland": "Secret Island", "hell": "Hell", "howlingmine": "Howling Mine",
    "toulan": "Toulan", "arkadiamoon": "Arkadia Moon", "arkadia": "Arkadia",
    "arkadiaunderground": "Arkadia Underground", "cyrene": "Cyrene",
    "nextisland": "Next Island", "thehub": "The Hub"
};
/* --- 2. MAP REGISTRY --- */

const MAP_CONFIG = {};
wikkiBasemapData.split('\n').slice(1).forEach(line => {
    const [name, sys, planet, left, bottom, w, h, scale] = line.split(';');
    const width = parseFloat(w);
    const height = parseFloat(h);
    
    // We use Calypso (4608) as our "1.0" baseline for large maps.
    // Smaller maps will have a higher sizeFactor, requiring LESS zoom to see labels.
    const sizeFactor = 4608 / width; 

    MAP_CONFIG[name] = {
        left: parseFloat(left), bottom: parseFloat(bottom),
        width: width, height: height,
        scale: parseFloat(scale), 
        sizeFactor: sizeFactor, // High for small maps, 1.0 for Calypso
        isInitialized: true
    };
});


function getConfigLookup(wikiName) {
    const mapping = {
        "Arkadia": "Planet Arkadia",
        "Cyrene": "Planet Cyrene",
        "Toulan": "Planet Toulan",
        "Hunt The THING": "Arctic",
        "ARIS": "ARIS",
        // BRIDGE: If wikiName is "Asteroid F.O.M.A.", point to the "foma" config entry
        "Asteroid F.O.M.A.": "foma",
        "FOMA": "foma",
		"ROCKtropia": "Rocktropia"
    };
    // If the mapping exists, use it; otherwise use the wikiName directly
    return mapping[wikiName] || wikiName;
}

// Add this near the top of your script (with other constants)
/* function renderCanvasLayers() {
    if (!ctx || !mapCanvas) return;

    // --- STEP 1: RESOLUTION & VIEWPORT SYNC ---
    const rect = mapContainer.getBoundingClientRect();
    if (mapCanvas.width !== rect.width || mapCanvas.height !== rect.height) {
        mapCanvas.width = rect.width;
        mapCanvas.height = rect.height;
    }

    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const configName = getConfigLookup(wikiName);
    const config = MAP_CONFIG[configName];
    const imgEl = document.getElementById('baseMapImg');

    if (!config || !imgEl) return;

    // --- STEP 2: SCALING & STATE ---
    const sizeFactor = config.sizeFactor || 1;
    const effectiveZoom = mapState.zoom * sizeFactor;
    const getFontSize = (base) => Math.max(11, base);

    // Label visibility
    const showLabels = {};
    allowedTypes.forEach(type => {
        showLabels[type] = labelToggles[type] ? labelToggles[type].checked : false;
    });

    // Reset counts
    const counts = {};
    allowedTypes.forEach(type => counts[type] = 0);

    // --- STEP 3: THE RENDER LOOP ---
    for (const [regKey, group] of Object.entries(MAP_REGISTRY)) {
        if (!group.active || group.isDOM) continue;

        // Get data - with special fallback for teleporters
        let dataArray = window[`cached${group.dataSource}`] ||
                        window[`cached${group.dataSource.toLowerCase()}`] || [];

        if (group.matchType === 'teleporter' && dataArray.length === 0) {
            dataArray = window.cachedTeleporters || [];
        }

        if (!dataArray.length) continue;

        const color = group.color || "#ffffff";

        dataArray.forEach(item => {
            // Planet check
            const itemPlanet = item.planet || (item.Planet?.Name) || "";
            if (itemPlanet.toLowerCase() !== wikiName.toLowerCase()) return;

            // Type check
            if (group.matchType && item.type !== group.matchType) return;

            // Coordinates (supports both formats)
            const long = item.long || item.Longitude || item.longitude;
            const lat  = item.lat  || item.Latitude  || item.latitude;
            if (!long || !lat) return;

            const pos = getMapPosition(configName, long, lat);
            if (!pos) return;

            const px = ((pos.leftPct / 100) * imgEl.offsetWidth * mapState.zoom) + mapState.x;
            const py = ((pos.topPct / 100) * imgEl.offsetHeight * mapState.zoom) + mapState.y;

            // Culling
            if (px < -50 || px > rect.width + 50 || py < -50 || py > rect.height + 50) {
                counts[group.matchType || 'teleporter'] = (counts[group.matchType || 'teleporter'] || 0) + 1;
                return;
            }

            counts[group.matchType || 'teleporter'] = (counts[group.matchType || 'teleporter'] || 0) + 1;

            if (hoveredItem && hoveredItem.id === item.id) return;


			// Inside renderCanvasLayers, find where you call drawFunc:
			const drawFunc = window['draw' + (group.matchType || item.type)];
			if (typeof drawFunc === 'function') {
				const dynamicScale = mapState.zoom > 1 
					? Math.max(0.8, 1.5 / Math.sqrt(mapState.zoom)) 
					: mapState.zoom;

				// Pass 'item' as the last argument so drawarea can see its properties
				drawFunc(ctx, px, py, color, false, dynamicScale, item);
			}
            // === DYNAMIC LABEL ===
            const cfg = drawConfig[group.matchType || 'teleporter'];
            if (cfg && showLabels[group.matchType || 'teleporter'] && effectiveZoom >= cfg.zoom) {
                const opacity = Math.min(1, (effectiveZoom - (group.matchType === 'teleporter' ? 1.0 : 2.0)) * 2);
                const fontSize = getFontSize(cfg.font);
                drawTacticalLabel(ctx, px, py, item.name || item.Name, color, fontSize, opacity, 1);
            }
        });
    }

    // --- STEP 4: UPDATE UI COUNTS ---
    Object.keys(countSpans).forEach(type => {
        const span = countSpans[type];
        if (span) {
            span.innerText = counts[type] || 0;
        }
    });

    // --- STEP 5: HOVERED ITEM ---
    if (hoveredItem) {
        const pos = getMapPosition(configName, hoveredItem.long, hoveredItem.lat);
        if (pos) {
            const hPx = ((pos.leftPct / 100) * imgEl.offsetWidth * mapState.zoom) + mapState.x;
            const hPy = ((pos.topPct / 100) * imgEl.offsetHeight * mapState.zoom) + mapState.y;

            const regEntry = Object.values(MAP_REGISTRY).find(r => r.matchType === hoveredItem.type);
            const color = regEntry ? regEntry.color : "#ffffff";

            const drawFunc = window['draw' + hoveredItem.type];
            if (typeof drawFunc === 'function') {
                drawFunc(ctx, hPx, hPy, color, true, 1);
            }

            drawTacticalLabel(ctx, hPx, hPy, hoveredItem.name, color, 16, 1, 1, true);
        }
    }
} */
let occupiedRegions = [];
let labelCache = null; 
let needsLabelUpdate = true; // Flag to trigger a bake
/* function setLastKnownPosition(planet, long, lat, alt, name) {
    // 1. Update global state for drawing logic in mapstest.js
    // We use Math.floor/round to ensure coordinates are clean integers
    window.lastKnownPos = { 
        planet: planet, 
        long: Math.round(long), 
        lat: Math.round(lat), 
        alt: parseInt(alt), // Ensures '112m' becomes 112
        waypoint: name,
		timestamp: timeStr,
        active: true 
    };

    // 2. AUTO-SWITCH PLANET: Update the dropdown if we move to a new world
    const planetSelect = document.getElementById('planetMapSelect');
    if (planetSelect) {
        const targetOption = Array.from(planetSelect.options).find(opt => 
            opt.text.toLowerCase().includes(planet.toLowerCase())
        );
        if (targetOption && planetSelect.value !== targetOption.value) {
            planetSelect.value = targetOption.value;
            // Trigger the change event to swap the map background image
            planetSelect.dispatchEvent(new Event('change'));
        }
    }

	// 2. Update the UI Element (The text under the buttons)
    const el = document.getElementById('lastKnownPosition');
    if (el) {
        el.innerHTML = `
            <div class="pos-main">[${planet}, ${window.lastKnownPos.long}, ${window.lastKnownPos.lat}, ${window.lastKnownPos.alt}, ${name}]</div>
            <div class="pos-timestamp" style="font-size: 0.8em; opacity: 0.7; color: #00ffff;">
                SIGNAL ACQUIRED: ${timeStr}
            </div>
        `;
    }

    if (typeof renderCanvasLayers === 'function') {
        renderCanvasLayers();
    }
}
 */
/* function setLastKnownPosition(planet, long, lat, alt, name, logTimestamp) {
    const finalTime = logTimestamp || new Date().toLocaleTimeString();

    const newPos = { 
        planet: planet, 
        long: Math.round(long), 
        lat: Math.round(lat), 
        alt: parseInt(alt), 
        waypoint: name, 
        timestamp: finalTime, 
        active: true 
    };
    // 2. AUTO-SWITCH PLANET: Update the dropdown if we move to a new world
    const planetSelect = document.getElementById('planetMapSelect');
    if (planetSelect) {
        const targetOption = Array.from(planetSelect.options).find(opt => 
            opt.text.toLowerCase().includes(planet.toLowerCase())
        );
        if (targetOption && planetSelect.value !== targetOption.value) {
            planetSelect.value = targetOption.value;
            // Trigger the change event to swap the map background image
            planetSelect.dispatchEvent(new Event('change'));
        }
    }
    // Update global state
    window.lastKnownPos = newPos;

    // PERSISTENCE: Save to browser storage
    localStorage.setItem('entropia_last_known_pos', JSON.stringify(newPos));

    // Update UI Element
    const el = document.getElementById('lastKnownPosition');
    if (el) {
        el.innerHTML = `
            <div class="pos-main">[${planet}, ${newPos.long}, ${newPos.lat}, ${newPos.alt}, ${name}]</div>
            <div class="pos-timestamp" style="font-size: 0.85em; opacity: 0.8; color: #00ffff; font-family: monospace;">
                SIGNAL LOGGED: ${finalTime}
            </div>
        `;
    }

    if (typeof renderCanvasLayers === 'function') {
        renderCanvasLayers();
    }
}
 */
function setLastKnownPosition(planet, long, lat, alt, name, logTimestamp) {
    const finalTime = logTimestamp || new Date().toLocaleTimeString();

    const newPos = { 
        planet: planet, 
        long: Math.round(long), 
        lat: Math.round(lat), 
        alt: parseInt(alt), 
        waypoint: name, 
        timestamp: finalTime, 
        active: true 
    };

    // 2. AUTO-SWITCH PLANET: Updated to prevent Arkadia vs Arkadia Moon confusion
    const planetSelect = document.getElementById('planetMapSelect');
    if (planetSelect) {
        const options = Array.from(planetSelect.options);
        const incomingPlanet = planet.trim().toLowerCase();

        // Priority 1: Look for an EXACT text match (e.g., "Arkadia" vs "Arkadia Moon")
        let targetOption = options.find(opt => opt.text.trim().toLowerCase() === incomingPlanet);

        // Priority 2: Fallback to partial match if no exact match exists
        // We sort by length (longest first) to ensure "Arkadia Moon" matches before "Arkadia"
        if (!targetOption) {
            targetOption = options
                .filter(opt => opt.text.toLowerCase().includes(incomingPlanet))
                .sort((a, b) => b.text.length - a.text.length)[0];
        }

        if (targetOption && planetSelect.value !== targetOption.value) {
            planetSelect.value = targetOption.value;
            // Trigger the change event to swap the map background image
            planetSelect.dispatchEvent(new Event('change'));
            if (typeof DEBUG !== 'undefined' && DEBUG) {
                console.log(`[MAP] Auto-switched to: ${targetOption.text}`);
            }
        }
    }

    // Update global state
    window.lastKnownPos = newPos;

    // PERSISTENCE: Save to browser storage
    localStorage.setItem('entropia_last_known_pos', JSON.stringify(newPos));

    // Update UI Element
    const el = document.getElementById('lastKnownPosition');
    if (el) {
        el.innerHTML = `
            <div class="pos-main">[${planet}, ${newPos.long}, ${newPos.lat}, ${newPos.alt}, ${name}]</div>
            <div class="pos-timestamp" style="font-size: 0.85em; opacity: 0.8; color: #00ffff; font-family: monospace;">
                SIGNAL LOGGED: ${finalTime}
            </div>
        `;
    }

    if (typeof renderCanvasLayers === 'function') {
        renderCanvasLayers();
    }
}

function addUserWaypoint(listName, wp) {
    if (!window[listName]) return;

    // Check for duplicates
    const exists = window[listName].some(item => 
        item.long === Math.round(wp.long) && 
        item.lat === Math.round(wp.lat) &&
        item.planet === wp.planet
    );
    if (exists && listName === 'sessionWaypoints') return;

    const entry = {
        id: Date.now() + Math.random(),
        planet: wp.planet,
        long: Math.round(wp.long),
        lat: Math.round(wp.lat),
        name: wp.name,
        timestamp: wp.timestamp || new Date().toLocaleTimeString(),
        type: listName 
    };

    window[listName].push(entry);
    saveWaypointsToDisk(listName); // Use the new helper

    if (typeof queueRender === 'function') queueRender();
}

function updateLabelCache() {
    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const configName = getConfigLookup(wikiName);
    const config = MAP_CONFIG[configName];
    const imgEl = document.getElementById('baseMapImg');
    
    // GUARD: Ensure we have dimensions
    if (!config || !imgEl || imgEl.naturalWidth === 0) return; 

    if (!labelCache) labelCache = document.createElement('canvas');
    const tempCtx = labelCache.getContext('2d');

    labelCache.width = imgEl.naturalWidth;
    labelCache.height = imgEl.naturalHeight;

    tempCtx.clearRect(0, 0, labelCache.width, labelCache.height);
    window.occupiedRegions = []; 

    // We need to re-run the registry loop to bake the colors correctly
    for (const [regKey, group] of Object.entries(MAP_REGISTRY)) {
        if (!group.active || group.isDOM) continue;
        
        const groupMatch = group.matchType.toLowerCase();
        const showLabels = labelToggles[groupMatch]?.checked;
        if (!showLabels) continue;

        let dataArray = window[`cached${group.dataSource}`] || 
                        window[`cached${group.dataSource.toLowerCase()}`] || [];

        dataArray.forEach(item => {
            const itemPlanet = item.planet || (item.Planet?.Name) || "";
            if (wikiName && itemPlanet.toLowerCase() !== wikiName.toLowerCase()) return;

            const props = item.Properties || item.properties || {};
            
            // Fix: Ensure we match the type within the data array
            const itemType = (item.type || props.Type || "").toLowerCase();
            if (itemType !== groupMatch) return;

            const long = item.long || item.Longitude || props.Coordinates?.Longitude;
            const lat  = item.lat  || item.Latitude  || props.Coordinates?.Latitude;
            if (long === undefined || lat === undefined) return;

            const pos = getMapPosition(configName, long, lat);
            if (!pos) return;

            // Project to the High-Res Cache Canvas
            const px = (pos.leftPct / 100) * labelCache.width;
            const py = (pos.topPct / 100) * labelCache.height;

            // COLOR LOGIC: Handle Area-specific colors during the bake
            let drawColor = group.color || "#ffffff";
            if (itemType === 'area') {
                const areaTypeKey = (props.AreaType || item.AreaType || "").toLowerCase();
                if (AREATYPE_COLORS[areaTypeKey]) drawColor = AREATYPE_COLORS[areaTypeKey];
            }

            // Bake with fixed size for the high-res sheet
            drawTacticalLabel(tempCtx, px, py, item.name || item.Name || props.Name || "", drawColor, 12, 1, 1, false, false);
        });
    }
    needsLabelUpdate = false;
}
/* function renderCanvasLayers() {
    if (!ctx || !mapCanvas) return;

    // --- STEP 1: RESOLUTION SYNC ---
    const rect = mapContainer.getBoundingClientRect();
    if (mapCanvas.width !== rect.width || mapCanvas.height !== rect.height) {
        mapCanvas.width = rect.width;
        mapCanvas.height = rect.height;
    }

    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const configName = getConfigLookup(wikiName);
    const config = MAP_CONFIG[configName];
    const imgEl = document.getElementById('baseMapImg');

    if (!config || !imgEl) return;

    // --- STEP 2: CACHE CHECK ---
    // If needsLabelUpdate is true, this bakes all static labels to the offscreen labelCache
    if (needsLabelUpdate) {
        updateLabelCache();
    }

    const counts = {};
    Object.values(MAP_REGISTRY).forEach(g => { if (g.matchType) counts[g.matchType.toLowerCase()] = 0; });

    // --- STEP 3: DRAW DOTS & SHAPES (PASS 1) ---
    for (const [regKey, group] of Object.entries(MAP_REGISTRY)) {
        if (!group.active || group.isDOM) continue;

        let dataArray = window[`cached${group.dataSource}`] ||
                        window[`cached${group.dataSource.toLowerCase()}`] || [];

        if (!dataArray.length) continue;

        const groupColor = group.color || "#ffffff";
        const groupMatch = group.matchType.toLowerCase();

        dataArray.forEach(item => {
            const itemPlanet = item.planet || (item.Planet?.Name) || "";
            if (wikiName && itemPlanet.toLowerCase() !== wikiName.toLowerCase()) return;

            const props = item.Properties || item.properties || {};
            const itemType = (item.type || props.Type || "").toLowerCase();
            if (itemType !== groupMatch) return;

            const long = item.long || item.Longitude || props.Coordinates?.Longitude;
            const lat  = item.lat  || item.Latitude  || props.Coordinates?.Latitude;
            if (long === undefined || lat === undefined) return;

            const pos = getMapPosition(configName, long, lat);
            if (!pos) return;

            const px = ((pos.leftPct / 100) * imgEl.offsetWidth * mapState.zoom) + mapState.x;
            const py = ((pos.topPct / 100) * imgEl.offsetHeight * mapState.zoom) + mapState.y;

            // Culling check
            const buffer = (regKey === 'areatype_canvas') ? 1000 : 100; 
            if (px < -buffer || px > rect.width + buffer || py < -buffer || py > rect.height + buffer) return;

            counts[groupMatch] = (counts[groupMatch] || 0) + 1;
            
            // Skip the "base" draw for the item being hovered so we don't get z-fighting
            if (hoveredItem && hoveredItem.id === item.id) return;

            // Draw Point Visuals (Fast)
            const dynamicScale = mapState.zoom > 1 ? Math.max(0.8, 1.5 / Math.sqrt(mapState.zoom)) : mapState.zoom;
            
            let drawColor = groupColor;
            if (itemType === 'area') {
                const areaTypeKey = (props.AreaType || item.AreaType || "").toLowerCase();
                if (AREATYPE_COLORS[areaTypeKey]) drawColor = AREATYPE_COLORS[areaTypeKey];
            }

            const drawFunc = (itemType === 'area') ? window['drawarea'] : window['draw' + itemType];
            if (typeof drawFunc === 'function') {
                drawFunc(ctx, px, py, drawColor, false, dynamicScale, item, regKey);
            }
        });
    }

    // --- STEP 4: DRAW BAKED LABELS (The Sticker Sheet) ---
    if (labelCache && labelCache.width > 0 && labelCache.height > 0) {
        ctx.save();
        
        // OPACITY MATH: 
        // Labels start appearing at zoom 0.2 and reach full opacity by zoom 1.2
        const fadeOpacity = (mapState.zoom - 0.2) * 1.0; 
        ctx.globalAlpha = Math.min(1, Math.max(0, fadeOpacity));
        
        // Draw the entire offscreen canvas in one single call
        ctx.drawImage(
            labelCache, 
            mapState.x, 
            mapState.y, 
            imgEl.offsetWidth * mapState.zoom, 
            imgEl.offsetHeight * mapState.zoom
        );
        ctx.restore();
    }

    // --- STEP 5: HOVER OVERLAY (PASS 2) ---
    if (hoveredItem) {
        const hProps = hoveredItem.Properties || hoveredItem.properties || {};
        const hLong = hoveredItem.long || hoveredItem.Longitude || hProps.Coordinates?.Longitude;
        const hLat  = hoveredItem.lat  || hoveredItem.Latitude  || hProps.Coordinates?.Latitude;
        const pos = getMapPosition(configName, hLong, hLat);

        if (pos && imgEl) {
            const hPx = ((pos.leftPct / 100) * imgEl.offsetWidth * mapState.zoom) + mapState.x;
            const hPy = ((pos.topPct / 100) * imgEl.offsetHeight * mapState.zoom) + mapState.y;
            const itemType = (hoveredItem.type || hProps.Type || "").toLowerCase();
            
            // Re-check registry for hover color
            const regEntry = Object.values(MAP_REGISTRY).find(r => (r.matchType || "").toLowerCase() === itemType);
            let hoverColor = regEntry ? regEntry.color : "#ffffff";

            // If it's an area, use the area-specific type color
            if (itemType === 'area') {
                const areaTypeKey = (hProps.AreaType || hoveredItem.AreaType || "").toLowerCase();
                if (AREATYPE_COLORS[areaTypeKey]) hoverColor = AREATYPE_COLORS[areaTypeKey];
                
                if (window['drawarea']) {
                    window['drawarea'](ctx, hPx, hPy, hoverColor, true, 1, hoveredItem, 'hover_layer');
                }
            } else if (window['draw' + itemType]) {
                window['draw' + itemType](ctx, hPx, hPy, hoverColor, true, 1, hoveredItem);
            }

            // Hover label is high-priority: bypasses collision and stays at full opacity
            const hoverName = hoveredItem.name || hoveredItem.Name || hProps.Name || "Unknown";
            drawTacticalLabel(ctx, hPx, hPy, hoverName, hoverColor, 16, 1, 1, true, true);
        }
    }

    // --- STEP 6: UPDATE UI COUNTERS ---
    Object.keys(countSpans).forEach(type => {
        const span = countSpans[type];
        if (span) {
            span.innerText = counts[type.toLowerCase()] || 0;
        }
    });
}*/
/* function renderCanvasLayers() {
    if (!ctx || !mapCanvas) return;

    // --- STEP 1: RESOLUTION SYNC ---
    const rect = mapContainer.getBoundingClientRect();
    if (mapCanvas.width !== rect.width || mapCanvas.height !== rect.height) {
        mapCanvas.width = rect.width;
        mapCanvas.height = rect.height;
    }

    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const configName = getConfigLookup(wikiName);
    const config = MAP_CONFIG[configName];
    const imgEl = document.getElementById('baseMapImg');

    if (!config || !imgEl) return;

    // --- STEP 2: CACHE CHECK ---
    if (needsLabelUpdate) {
        updateLabelCache();
    }

    const counts = {};
    Object.values(MAP_REGISTRY).forEach(g => { if (g.matchType) counts[g.matchType.toLowerCase()] = 0; });

    // --- STEP 3: DRAW DATASET ENTITIES (NPCs, Mobs, etc.) ---
    for (const [regKey, group] of Object.entries(MAP_REGISTRY)) {
        if (!group.active || group.isDOM) continue;

        let dataArray = window[`cached${group.dataSource}`] ||
                        window[`cached${group.dataSource.toLowerCase()}`] || [];

        if (!dataArray.length) continue;

        const groupColor = group.color || "#ffffff";
        const groupMatch = group.matchType.toLowerCase();

        dataArray.forEach(item => {
            const itemPlanet = item.planet || (item.Planet?.Name) || "";
            if (wikiName && itemPlanet.toLowerCase() !== wikiName.toLowerCase()) return;

            const props = item.Properties || item.properties || {};
            const itemType = (item.type || props.Type || "").toLowerCase();
            if (itemType !== groupMatch) return;

            const long = item.long || item.Longitude || props.Coordinates?.Longitude;
            const lat  = item.lat  || item.Latitude  || props.Coordinates?.Latitude;
            if (long === undefined || lat === undefined) return;

            const pos = getMapPosition(configName, long, lat);
            if (!pos) return;

            const px = ((pos.leftPct / 100) * imgEl.offsetWidth * mapState.zoom) + mapState.x;
            const py = ((pos.topPct / 100) * imgEl.offsetHeight * mapState.zoom) + mapState.y;

            const buffer = (regKey === 'areatype_canvas') ? 1000 : 100; 
            if (px < -buffer || px > rect.width + buffer || py < -buffer || py > rect.height + buffer) return;

            counts[groupMatch] = (counts[groupMatch] || 0) + 1;
            
            if (hoveredItem && hoveredItem.id === item.id) return;

            const dynamicScale = mapState.zoom > 1 ? Math.max(0.8, 1.5 / Math.sqrt(mapState.zoom)) : mapState.zoom;
            
            let drawColor = groupColor;
            const drawFunc = (itemType === 'area') ? window['drawarea'] : window['draw' + itemType];
            if (typeof drawFunc === 'function') {
                drawFunc(ctx, px, py, drawColor, false, dynamicScale, item, regKey);
            }
        });
    }

    // --- STEP 4: DRAW BAKED LABELS ---
    if (labelCache && labelCache.width > 0 && labelCache.height > 0) {
        ctx.save();
        const fadeOpacity = (mapState.zoom - 0.2) * 1.0; 
        ctx.globalAlpha = Math.min(1, Math.max(0, fadeOpacity));
        ctx.drawImage(
            labelCache, 
            mapState.x, 
            mapState.y, 
            imgEl.offsetWidth * mapState.zoom, 
            imgEl.offsetHeight * mapState.zoom
        );
        ctx.restore();
    }

    // --- STEP 5: DRAW LAST KNOWN POSITION (The Chat-Parsed Location) ---
    // We check the global window.lastKnownPos since it's not in our JSON data

    const lkp = window.lastKnownPos;
    let isUserHovered = false; // Track if we are hovering the user icon
    
    if (lkp && lkp.active && wikiName) {
        if (lkp.planet.toLowerCase() === wikiName.toLowerCase()) {
            const pos = getMapPosition(configName, lkp.long, lkp.lat);
            if (pos) {
                const px = ((pos.leftPct / 100) * imgEl.offsetWidth * mapState.zoom) + mapState.x;
                const py = ((pos.topPct / 100) * imgEl.offsetHeight * mapState.zoom) + mapState.y;
                
                const userScale = mapState.zoom > 1 ? Math.max(0.8, 1.5 / Math.sqrt(mapState.zoom)) : 1;

                // CHECK HOVER: If your mouse move logic sets hoveredItem.isLastKnown
                isUserHovered = (hoveredItem && hoveredItem.isLastKnown);
                
                if (typeof drawLastKnownPosition === 'function') {
                    drawLastKnownPosition(ctx, px, py, "#00ffff", isUserHovered, userScale);
                }
            }
        }
    }

    // --- STEP 6: HOVER OVERLAY ---
    if (hoveredItem) {
        // A. SPECIAL CASE: User Marker Hover
		if (hoveredItem.isLastKnown && lkp) {
			const pos = getMapPosition(configName, lkp.long, lkp.lat);
			if (pos) {
				const hPx = ((pos.leftPct / 100) * imgEl.offsetWidth * mapState.zoom) + mapState.x;
				const hPy = ((pos.topPct / 100) * imgEl.offsetHeight * mapState.zoom) + mapState.y;
				
				// Combine name and timestamp for a "System Log" look
				const fullLabel = `${lkp.waypoint || "POSITION"} [${lkp.timestamp}]`;
				
				drawTacticalLabel(ctx, hPx, hPy, fullLabel, "#00ffff", 16, 1, 1, true, true);
			}
		}
        // B. STANDARD CASE: Registry Item Hover (NPCs, Mobs, etc)
        else {
            const hProps = hoveredItem.Properties || hoveredItem.properties || {};
            const hLong = hoveredItem.long || hoveredItem.Longitude || hProps.Coordinates?.Longitude;
            const hLat  = hoveredItem.lat  || hoveredItem.Latitude  || hProps.Coordinates?.Latitude;
            const pos = getMapPosition(configName, hLong, hLat);

            if (pos && imgEl) {
                const hPx = ((pos.leftPct / 100) * imgEl.offsetWidth * mapState.zoom) + mapState.x;
                const hPy = ((pos.topPct / 100) * imgEl.offsetHeight * mapState.zoom) + mapState.y;
                const itemType = (hoveredItem.type || hProps.Type || "").toLowerCase();
                
                const regEntry = Object.values(MAP_REGISTRY).find(r => (r.matchType || "").toLowerCase() === itemType);
                let hoverColor = regEntry ? regEntry.color : "#ffffff";

                if (window['draw' + itemType]) {
                    window['draw' + itemType](ctx, hPx, hPy, hoverColor, true, 1, hoveredItem);
                }

                const hoverName = hoveredItem.name || hoveredItem.Name || hProps.Name || "Unknown";
                drawTacticalLabel(ctx, hPx, hPy, hoverName, hoverColor, 16, 1, 1, true, true);
            }
        }
    }
    // --- STEP 7: UPDATE UI COUNTERS ---
    Object.keys(countSpans).forEach(type => {
        const span = countSpans[type];
        if (span) {
            span.innerText = counts[type.toLowerCase()] || 0;
        }
    });
}
 */
function renderCanvasLayers() {
    if (!ctx || !mapCanvas) return;

    // --- STEP 1: RESOLUTION SYNC ---
    const rect = mapContainer.getBoundingClientRect();
    if (mapCanvas.width !== rect.width || mapCanvas.height !== rect.height) {
        mapCanvas.width = rect.width;
        mapCanvas.height = rect.height;
    }

    ctx.clearRect(0, 0, mapCanvas.width, mapCanvas.height);

    const planetKey = document.getElementById('planetMapSelect').value;
    const wikiName = planetNameMap[planetKey];
    const configName = getConfigLookup(wikiName);
    const config = MAP_CONFIG[configName];
    const imgEl = document.getElementById('baseMapImg');

    if (!config || !imgEl) return;

    // --- STEP 2: CACHE CHECK ---
    if (needsLabelUpdate) {
        updateLabelCache();
    }

    const counts = {};
    Object.values(MAP_REGISTRY).forEach(g => { if (g.matchType) counts[g.matchType.toLowerCase()] = 0; });

    // --- STEP 3: DRAW DATASET ENTITIES (NPCs, Mobs, etc.) ---
    for (const [regKey, group] of Object.entries(MAP_REGISTRY)) {
        if (!group.active || group.isDOM) continue;

        let dataArray = window[`cached${group.dataSource}`] ||
                        window[`cached${group.dataSource.toLowerCase()}`] || [];

        if (!dataArray.length) continue;

        const groupColor = group.color || "#ffffff";
        const groupMatch = group.matchType.toLowerCase();

        dataArray.forEach(item => {
            const itemPlanet = item.planet || (item.Planet?.Name) || "";
            if (wikiName && itemPlanet.toLowerCase() !== wikiName.toLowerCase()) return;

            const props = item.Properties || item.properties || {};
            const itemType = (item.type || props.Type || "").toLowerCase();
            if (itemType !== groupMatch) return;

            const long = item.long || item.Longitude || props.Coordinates?.Longitude;
            const lat  = item.lat  || item.Latitude  || props.Coordinates?.Latitude;
            if (long === undefined || lat === undefined) return;

            const pos = getMapPosition(configName, long, lat);
            if (!pos) return;

            const px = ((pos.leftPct / 100) * imgEl.offsetWidth * mapState.zoom) + mapState.x;
            const py = ((pos.topPct / 100) * imgEl.offsetHeight * mapState.zoom) + mapState.y;

            const buffer = (regKey === 'areatype_canvas') ? 1000 : 100; 
            if (px < -buffer || px > rect.width + buffer || py < -buffer || py > rect.height + buffer) return;

            counts[groupMatch] = (counts[groupMatch] || 0) + 1;
            
            // Skip drawing if it's currently hovered (we draw hover on top later)
            if (hoveredItem && hoveredItem.id === item.id) return;

            const dynamicScale = mapState.zoom > 1 ? Math.max(0.8, 1.5 / Math.sqrt(mapState.zoom)) : mapState.zoom;
            
            let drawColor = groupColor;
            const drawFunc = (itemType === 'area') ? window['drawarea'] : window['draw' + itemType];
            if (typeof drawFunc === 'function') {
                drawFunc(ctx, px, py, drawColor, false, dynamicScale, item, regKey);
            }
        });
    }

    // --- STEP 4: DRAW BAKED LABELS ---
    if (labelCache && labelCache.width > 0 && labelCache.height > 0) {
        ctx.save();
        const fadeOpacity = (mapState.zoom - 0.2) * 1.0; 
        ctx.globalAlpha = Math.min(1, Math.max(0, fadeOpacity));
        ctx.drawImage(
            labelCache, 
            mapState.x, 
            mapState.y, 
            imgEl.offsetWidth * mapState.zoom, 
            imgEl.offsetHeight * mapState.zoom
        );
        ctx.restore();
    }

    // --- STEP 5: DRAW LAST KNOWN POSITION (Live Tracking) ---
    const lkp = window.lastKnownPos;
    const dynamicScale = mapState.zoom > 1 ? Math.max(0.8, 1.5 / Math.sqrt(mapState.zoom)) : 1;

    if (lkp && lkp.active && wikiName) {
        if (lkp.planet.toLowerCase() === wikiName.toLowerCase()) {
            const pos = getMapPosition(configName, lkp.long, lkp.lat);
            if (pos) {
                const px = ((pos.leftPct / 100) * imgEl.offsetWidth * mapState.zoom) + mapState.x;
                const py = ((pos.topPct / 100) * imgEl.offsetHeight * mapState.zoom) + mapState.y;
                
                const isUserHovered = (hoveredItem && hoveredItem.isLastKnown);
                if (typeof drawLastKnownPosition === 'function') {
                    drawLastKnownPosition(ctx, px, py, "#00ffff", isUserHovered, dynamicScale);
                }
            }
        }
    }

    // --- STEP 6: DRAW EXPANDED USER WAYPOINTS (Session, Saved, Mining) ---
	// --- STEP 6: DRAW EXPANDED USER WAYPOINTS ---
	const userLists = [
		{ data: window.sessionWaypoints, color: "#ff4444", label: 'Session' },
		{ data: window.savedWaypoints, color: "#ffff00", label: 'Saved' },
		{ data: window.miningClaims, color: "#00ff00", label: 'Mining' }
	];

	userLists.forEach(list => {
		if (!list.data || list.data.length === 0) return;
		
		// DEBUG: See if we have data at all
		console.log(`[DRAW] Checking ${list.label} list. Count: ${list.data.length}`);

		list.data.forEach(wp => {
			// DEBUG: Check Planet Mismatch
			if (wp.planet.toLowerCase() !== wikiName.toLowerCase()) {
				// Only log this once per render to avoid spamming
				console.log(`[DRAW] Planet Mismatch: WP(${wp.planet}) vs Map(${wikiName})`);
				return;
			}

			const pos = getMapPosition(configName, wp.long, wp.lat);
			if (pos) {
				const px = ((pos.leftPct / 100) * imgEl.offsetWidth * mapState.zoom) + mapState.x;
				const py = ((pos.topPct / 100) * imgEl.offsetHeight * mapState.zoom) + mapState.y;

				console.log(`[DRAW] Rendering ${wp.name} at Screen: ${px}, ${py}`);

				const isHovered = (hoveredItem && hoveredItem.id === wp.id);
				if (typeof drawUserWaypoint === 'function') {
					drawUserWaypoint(ctx, px, py, list.color, isHovered, dynamicScale, wp);
				}
			} else {
				console.error(`[DRAW] Failed to get map position for coords: ${wp.long}, ${wp.lat}`);
			}
		});
	});

    // --- STEP 7: HOVER OVERLAY ---
    if (hoveredItem) {
        const isUserItem = hoveredItem.isLastKnown || 
                           ['sessionWaypoints', 'savedWaypoints', 'miningClaims'].includes(hoveredItem.type);
        
        // Find coordinates for any hovered item
        const hProps = hoveredItem.Properties || hoveredItem.properties || {};
        const hLong = hoveredItem.long || hoveredItem.Longitude || hProps.Coordinates?.Longitude;
        const hLat  = hoveredItem.lat  || hoveredItem.Latitude  || hProps.Coordinates?.Latitude;
        const pos = getMapPosition(configName, hLong, hLat);

        if (pos && imgEl) {
            const hPx = ((pos.leftPct / 100) * imgEl.offsetWidth * mapState.zoom) + mapState.x;
            const hPy = ((pos.topPct / 100) * imgEl.offsetHeight * mapState.zoom) + mapState.y;

            if (isUserItem) {
                // Tactical Label for User Waypoints (includes timestamp)
                const name = hoveredItem.name || hoveredItem.waypoint || "WAYPOINT";
                const timeStr = hoveredItem.timestamp ? ` [${hoveredItem.timestamp}]` : "";
                const fullLabel = `${name}${timeStr}`;
                const userColor = hoveredItem.isLastKnown ? "#00ffff" : 
                                 (hoveredItem.type === 'miningClaims' ? "#00ff00" : "#ffff00");

                drawTacticalLabel(ctx, hPx, hPy, fullLabel, userColor, 16, 1, 1, true, true);
            } else {
                // Standard Registry Hover
                const itemType = (hoveredItem.type || hProps.Type || "").toLowerCase();
                const regEntry = Object.values(MAP_REGISTRY).find(r => (r.matchType || "").toLowerCase() === itemType);
                let hoverColor = regEntry ? regEntry.color : "#ffffff";

                if (window['draw' + itemType]) {
                    window['draw' + itemType](ctx, hPx, hPy, hoverColor, true, 1, hoveredItem);
                }

                const hoverName = hoveredItem.name || hoveredItem.Name || hProps.Name || "Unknown";
                drawTacticalLabel(ctx, hPx, hPy, hoverName, hoverColor, 16, 1, 1, true, true);
            }
        }
    }

    // --- STEP 8: UPDATE UI COUNTERS ---
    Object.keys(countSpans).forEach(type => {
        const span = countSpans[type];
        if (span) {
            span.innerText = counts[type.toLowerCase()] || 0;
        }
    });
}
function clearUserWaypoints(listName = 'sessionWaypoints', all = false) {
    const listsToClear = all 
        ? ['sessionWaypoints', 'savedWaypoints', 'miningClaims'] 
        : [listName];

    const storageKeys = {
        sessionWaypoints: 'entropia_session_waypoints',
        savedWaypoints: 'entropia_saved_waypoints',
        miningClaims: 'entropia_mining_claims'
    };

    listsToClear.forEach(list => {
        if (window[list]) {
            // 1. Wipe Memory
            window[list] = [];
            
            // 2. Wipe Disk
            if (storageKeys[list]) {
                localStorage.removeItem(storageKeys[list]);
            }
            
            console.log(`[SYSTEM] Cleared all data from: ${list}`);
        }
    });

    // 3. Update UI
    if (typeof queueRender === 'function') queueRender();
    
    // Optional: If you have a specific UI counter update function
    if (typeof updateUICounters === 'function') updateUICounters();
}
/* Drawing Functions
-----------------------*/
function drawLastKnownPosition(ctx, x, y, color, hovered, scaleInverse) {
    // 1. DYNAMIC SIZE
    const size = (hovered ? 15 : 12) * scaleInverse;
    
    ctx.save();
    ctx.translate(x, y);

    // 2. SELECTION / PULSE GLOW
    // Always pulsing if it's the active signal, extra bright if hovered
    const pulse = (Math.sin(Date.now() / 400) * 0.2) + 1.0;
    const glowAlpha = hovered ? 0.4 : 0.2;

    ctx.beginPath();
    ctx.arc(0, 0, size * 1.8 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = glowAlpha;
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 3. TACTICAL OUTER RING
    ctx.beginPath();
    ctx.arc(0, 0, size * pulse, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2 * scaleInverse;
    ctx.stroke();

    // 4. THE CORE DIAMOND
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.lineTo(size, 0);
    ctx.lineTo(0, size);
    ctx.lineTo(-size, 0);
    ctx.closePath();
    
    ctx.fillStyle = color;
    ctx.shadowBlur = 10 * scaleInverse;
    ctx.shadowColor = color;
    ctx.fill();

    // 5. INNER PRECISION DOT
    ctx.beginPath();
    ctx.arc(0, 0, 2 * scaleInverse, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    ctx.restore();
}
function drawUserWaypoint(ctx, x, y, color, hovered, scaleInverse, item) {
    const size = (hovered ? 14 : 10) * scaleInverse;
    
    ctx.save();
    ctx.translate(x, y);

    // 1. DETERMINE ICON
    let icon = "📍"; // Default
    if (item.name?.includes("DEATH")) icon = "⚰️";
    if (item.type === 'miningClaims') icon = "⛏️";
    if (item.type === 'savedWaypoints' && !item.name?.includes("DEATH")) icon = "🕴️";

    // 2. BACKGROUND GLOW (Pulse)
    const pulse = (Math.sin(Date.now() / 600) * 0.15) + 1.0;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.5 * pulse, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.globalAlpha = hovered ? 0.4 : 0.15;
    ctx.fill();

    // 3. DRAW ICON
    ctx.globalAlpha = 1.0;
    ctx.font = `${size * 1.8}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Slight shadow for readability on busy maps
    ctx.shadowBlur = 4 * scaleInverse;
    ctx.shadowColor = "black";
    
    ctx.fillText(icon, 0, 0);

    // 4. HOVER RING
    if (hovered) {
        ctx.beginPath();
        ctx.arc(0, 0, size * 2, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 1.5 * scaleInverse;
        ctx.setLineDash([4, 2]); // Tactical dashed line
        ctx.stroke();
    }

    ctx.restore();
}
/**
 * Main draw call for Area-type items.
 * Handles both the tactical anchor dot and the area geometry (shapes).
 */
function drawarea(ctx, x, y, color, hovered, scaleInverse, item, regKey) {
    const props = item.Properties || item.properties || {};
    if (!props && !item.Name) {
        console.warn(`[drawarea] Item missing Properties object.`);
        return;
    }

    // 1. Resolve the specific AreaType color (Syncs Dots with Shapes)
    const rawType = props.AreaType || item.AreaType || "";
    const normalizedType = rawType.toLowerCase();
    
    // We prioritize the hovered color passed from the registry (usually white/highlight) 
    // but fall back to the specific mapping for the idle state.
    let fillColor = hovered ? color : (AREATYPE_COLORS[normalizedType] || color);

    // 2. Draw Anchor Point (Dots)
    if (regKey === 'area_canvas' || regKey === 'hover_layer' || hovered) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, (hovered ? 6 : 4) * scaleInverse, 0, Math.PI * 2);
        
        ctx.fillStyle = fillColor; // Use the resolved type color
        ctx.shadowBlur = hovered ? 10 : 0;
        ctx.shadowColor = fillColor;
        
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.6)"; // Darker stroke for better contrast
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
    }

    // 3. Draw Geometry (Shapes)
    if (regKey === 'areatype_canvas' || regKey === 'hover_layer' || hovered) {
        if (props.Shape && props.Data) {
            // We pass the resolved fillColor to ensure consistency
            drawAreaGeometry(ctx, fillColor, item, x, y, hovered);
        } else if (regKey === 'areatype_canvas') {
             console.warn(`[drawarea] Item ${item.Name || 'Unknown'} marked as Area but has no Shape/Data.`);
        }
    }
}

/**
 * Handles the actual Canvas pathing for shapes (Polygons, Circles, Rectangles).
 * Prioritizes the passed 'color' (Registry Tactical Color) when hovered is true.
 */
function drawAreaGeometry(ctx, color, item, centerX, centerY, hovered) {
    // 1. Extract Properties
    const props = item.Properties || item.properties || {};
    const shape = props.Shape;
    const data = props.Data;
    
    if (!shape || !data) return;

    const rawType = props.AreaType || item.AreaType || "";
    const normalizedType = rawType.toLowerCase();

    // 2. Setup the Color Mapping for idle states


    // 3. FIX: Determine final fill color. 
    // If hovered, we use the tactical 'color' passed from the registry (e.g., White).
    // Otherwise, we use the specific AreaType color or the registry default.
    const fillColor = hovered ? color : (AREATYPE_COLORS[normalizedType] || color);

    // 4. Map Configuration
    const imgEl = document.getElementById('baseMapImg');
    const planetKey = document.getElementById('planetMapSelect').value;
    const planetName = planetNameMap[planetKey];
    const configName = getConfigLookup(planetName);
    const config = MAP_CONFIG[configName];
    
    if (!config || !imgEl) return;

    const worldWidthMeters = config.width * (config.scale || 1);
    const pixelsPerMeter = (imgEl.offsetWidth / worldWidthMeters) * mapState.zoom;

    // 5. Canvas Styles
// 5. Canvas Styles
    ctx.save();
    
    // IDLE: Increased from 0.15 to 0.4 (40% solid)
    // HOVER: Increased from 0.5 to 0.75 (75% solid)
    ctx.globalAlpha = hovered ? 0.6 : 0.2; 
    
    ctx.fillStyle = fillColor;
    ctx.strokeStyle = fillColor;
    
    // Make the border a bit thicker so the shape's edge is clear
    ctx.lineWidth = hovered ? 3.0 : 1.5; 

    ctx.beginPath();
    
    // 6. Draw Geometry based on Shape
    if (shape === "Polygon" && data.vertices) {
        const v = data.vertices;
        for (let i = 0; i < v.length; i += 2) {
            const vPos = getMapPosition(configName, v[i], v[i+1]);
            if (!vPos) continue;
            const vx = ((vPos.leftPct / 100) * imgEl.offsetWidth * mapState.zoom) + mapState.x;
            const vy = ((vPos.topPct / 100) * imgEl.offsetHeight * mapState.zoom) + mapState.y;
            if (i === 0) ctx.moveTo(vx, vy);
            else ctx.lineTo(vx, vy);
        }
        ctx.closePath();
    } 
    else if (shape === "Circle") {
        const r = (data.radius || data.Radius || 100) * pixelsPerMeter;
        ctx.arc(centerX, centerY, r, 0, Math.PI * 2);
    }
    else if (shape === "Rectangle") {
        const w = (data.width || data.Width || 0) * pixelsPerMeter;
        const h = (data.height || data.Height || 0) * pixelsPerMeter;
        ctx.rect(centerX - (w / 2), centerY - (h / 2), w, h);
    }
	
	ctx.fill();

    // The stroke (border) should be almost fully solid
    ctx.globalAlpha = hovered ? 0.95 : 0.6; 
    ctx.stroke();
    ctx.restore();
}
/* 
function drawTacticalLabel(ctx, x, y, text, color, fontSize, opacity, scaleInverse, ignoreCollision = false, isHovered = false) {
    if (opacity <= 0 || !text) return;

    const textClean = text.toUpperCase();
    const maxWidth = 180;
    
    // OPTIMIZATION: Monospace calculation (Courier New)
    // Average width is ~0.6 of font size.
    const charWidth = fontSize * 0.6;
    let lines = [];

    if (isHovered) {
        // Word wrap for hover
        let words = textClean.split(' ');
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            if ((currentLine.length + words[i].length + 1) * charWidth < maxWidth) {
                currentLine += " " + words[i];
            } else {
                lines.push(currentLine);
                currentLine = words[i];
            }
        }
        lines.push(currentLine);
    } else {
        // Fast Truncation: No while loop, just math.
        const maxChars = Math.floor(maxWidth / charWidth);
        if (textClean.length > maxChars) {
            lines = [textClean.substring(0, maxChars - 3) + "..."];
        } else {
            lines = [textClean];
        }
    }

    const maxLineWidth = lines.reduce((max, l) => Math.max(max, l.length * charWidth), 0);
    const paddingX = fontSize * 0.6;
    const paddingY = fontSize * 0.4;
    const lineHeight = fontSize * 1.2;
    const rectW = Math.round(maxLineWidth + (paddingX * 2));
    const rectH = Math.round((lines.length * lineHeight) + (paddingY * 1.5));

    const offset = Math.max(20, (fontSize * 1.8) * scaleInverse);
    const labelX = Math.round(x + offset);
    const labelY = Math.round(y - (fontSize / 2) - paddingY); 

    // Collision Check
    if (!ignoreCollision && !isHovered) {
        if (!window.occupiedRegions) window.occupiedRegions = [];
        const buffer = 4;
        const isOverlap = window.occupiedRegions.some(r => 
            labelX < r.x + r.w + buffer && labelX + rectW > r.x - buffer &&
            labelY < r.y + r.h + buffer && labelY + rectH > r.y - buffer
        );
        if (isOverlap) return; 
        window.occupiedRegions.push({ x: labelX, y: labelY, w: rectW, h: rectH });
    }

    // Draw
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.font = `bold ${Math.round(fontSize)}px "Courier New", monospace`;
    
    // Leader Line
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.moveTo(x, y);
    ctx.lineTo(labelX, labelY + (lineHeight / 2) + paddingY);
    ctx.stroke();

    // Box
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(labelX, labelY, rectW, rectH);
    ctx.strokeStyle = color;
    ctx.strokeRect(labelX, labelY, rectW, rectH);

    // Text
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    lines.forEach((line, index) => {
        ctx.fillText(line, labelX + paddingX, labelY + paddingY + (index * lineHeight));
    });
    ctx.restore();
}
 *//**
 * TACTICAL HUD LABEL
 * Draws high-contrast slugs with scale-aware leader lines.
 */
function drawTacticalLabel(ctx, x, y, text, color, fontSize, opacity, scaleInverse, ignoreCollision = false, isHovered = false) {
    if (opacity <= 0 || !text) return;

    const textClean = text.toUpperCase();
    ctx.font = `bold ${Math.round(fontSize)}px "Courier New", monospace`;
    
    const maxWidth = 180;
    const words = textClean.split(' ');
    let lines = [];
    
    // 1. GENERATE LINES
    if (isHovered) {
        // Full Wrap Logic
        let currentLine = words[0];
        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = ctx.measureText(currentLine + " " + word).width;
            if (width < maxWidth) {
                currentLine += " " + word;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine);
    } else {
        // Single Line Logic with Ellipsis
        let singleLine = textClean;
        if (ctx.measureText(singleLine).width > maxWidth) {
            // Trim until it fits with "..."
            while (ctx.measureText(singleLine + "...").width > maxWidth && singleLine.length > 0) {
                singleLine = singleLine.substring(0, singleLine.length - 1);
            }
            singleLine += "...";
        }
        lines = [singleLine];
    }

    // 2. DIMENSIONS
    const paddingX = fontSize * 0.6;
    const paddingY = fontSize * 0.4;
    const lineHeight = fontSize * 1.2;
    
    let maxLineWidth = 0;
    lines.forEach(l => {
        const w = ctx.measureText(l).width;
        if (w > maxLineWidth) maxLineWidth = w;
    });

    const rectW = Math.round(maxLineWidth + (paddingX * 2));
    const rectH = Math.round((lines.length * lineHeight) + (paddingY * 1.5));

    // 3. POSITIONING
    const offset = Math.max(20, (fontSize * 1.8) * scaleInverse);
    const labelX = Math.round(x + offset);
    // When expanding, we keep the top-left anchored so it grows downward
    const labelY = Math.round(y - (fontSize / 2) - paddingY); 

    // COLLISION (Only check if not hovered, to prevent jumping)
    if (!ignoreCollision && !isHovered) {
        const buffer = 4;
        const isOverlap = (window.occupiedRegions || []).some(r => 
            labelX < r.x + r.w + buffer && labelX + rectW > r.x - buffer &&
            labelY < r.y + r.h + buffer && labelY + rectH > r.y - buffer
        );
        if (isOverlap) return; 
        window.occupiedRegions.push({ x: labelX, y: labelY, w: rectW, h: rectH });
    }

    // 4. DRAWING
    ctx.save();
    ctx.globalAlpha = opacity;

    // LEADER LINE (Points to the first line's vertical center)
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(1, 1.2 * scaleInverse);
    ctx.moveTo(x, y);
    ctx.lineTo(labelX, labelY + (lineHeight / 2) + paddingY);
    ctx.stroke();

    // BACKGROUND
    ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
    ctx.fillRect(labelX, labelY, rectW, rectH);
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.strokeRect(labelX, labelY, rectW, rectH);

    // TEXT
    ctx.fillStyle = color;
    ctx.textBaseline = "top";
    lines.forEach((line, index) => {
        ctx.fillText(line, labelX + paddingX, labelY + paddingY + (index * lineHeight));
    });
    
    ctx.restore();
}
function drawCrispLabel(ctx, x, y, text, color, fontSize, opacity, scaleInverse) {
    if (opacity <= 0) return;

    ctx.save();
    ctx.globalAlpha = opacity;
    
    ctx.font = `bold ${fontSize}px "Courier New", monospace`;
    ctx.textBaseline = "middle";

    // Offset shrinks as you zoom so text doesn't drift away on big maps
    const textX = x + (10 * scaleInverse); 
    const textY = y;

    const textUpper = text.toUpperCase();

    // 1. HIGH-CONTRAST BORDER (Replaced shadow with stroke for better performance)
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2 * scaleInverse; // Thinner border on deep zoom
    ctx.lineJoin = "round";
    ctx.strokeText(textUpper, textX, textY);
    
    // 2. MAIN TEXT
    ctx.fillStyle = color;
    ctx.fillText(textUpper, textX, textY);
    
    ctx.restore();
}


function drawmagicalflower(ctx, x, y, color, hovered, scaleInverse) {
    const size = (hovered ? 10 : 7) * scaleInverse;
    const petalRadius = size * 0.6;
    
    ctx.save();
    ctx.translate(x, y);

    // Draw 5 Petals
    ctx.fillStyle = color;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1 * scaleInverse;

    for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5;
        const px = Math.cos(angle) * (size * 0.5);
        const py = Math.sin(angle) * (size * 0.5);
        
        ctx.beginPath();
        ctx.arc(px, py, petalRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
    }

    // Central yellow/bright core for the flower
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = "#fff"; // Bright center
    ctx.fill();
    ctx.stroke();

    ctx.restore();
}
function drawinstanceentrance(ctx, x, y, color, hovered, scaleInverse) {
    const size = (hovered ? 16 : 12) * scaleInverse;

    ctx.save();
    ctx.translate(x, y);

    // === 1. MAIN ROCK BODY (better shading) ===
    const grad = ctx.createLinearGradient(0, -size, 0, size);
    grad.addColorStop(0, "#4a4a4a"); // top lighter
    grad.addColorStop(1, "#1a1a1a"); // bottom darker

    ctx.fillStyle = grad;
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1.5 * scaleInverse;

    ctx.beginPath();
    ctx.moveTo(-size * 1.5, size * 0.6);
    ctx.lineTo(-size * 1.6, -size * 0.2);
    ctx.lineTo(-size * 1.2, -size * 0.9);
    ctx.lineTo(-size * 0.5, -size * 1.3);
    ctx.lineTo(size * 0.2, -size * 1.25);
    ctx.lineTo(size * 1.0, -size * 0.9);
    ctx.lineTo(size * 1.6, -size * 0.2);
    ctx.lineTo(size * 1.5, size * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // === 2. DEEP CAVE INTERIOR (layered darkness) ===
    // outer darkness
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.moveTo(-size * 1.1, size * 0.6);
    ctx.bezierCurveTo(-size * 1.0, -size * 1.4, size * 1.0, -size * 1.4, size * 1.1, size * 0.6);
    ctx.fill();

    // inner deeper layer (adds depth illusion)
    ctx.fillStyle = "#050505";
    ctx.beginPath();
    ctx.moveTo(-size * 0.8, size * 0.5);
    ctx.bezierCurveTo(-size * 0.7, -size * 1.0, size * 0.7, -size * 1.0, size * 0.8, size * 0.5);
    ctx.fill();

    // === 3. ENTRANCE EDGE HIGHLIGHT (rock lip) ===
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 1.2 * scaleInverse;

    ctx.beginPath();
    ctx.moveTo(-size * 1.0, size * 0.55);
    ctx.bezierCurveTo(-size * 0.9, -size * 1.2, size * 0.9, -size * 1.2, size * 1.0, size * 0.55);
    ctx.stroke();

    // === 4. PORTAL GLOW (more atmospheric) ===
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5 * scaleInverse;
    ctx.globalAlpha = hovered ? 1.0 : 0.6;

    ctx.beginPath();
    ctx.moveTo(-size * 0.85, size * 0.5);
    ctx.bezierCurveTo(-size * 0.7, -size * 1.0, size * 0.7, -size * 1.0, size * 0.85, size * 0.5);
    ctx.stroke();

    // soft glow halo
    ctx.shadowColor = color;
    ctx.shadowBlur = 8 * scaleInverse;
    ctx.stroke();
    ctx.shadowBlur = 0;

    ctx.globalAlpha = 1;

    // === 5. ROCK CRACKS (more natural angles) ===
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 0.8 * scaleInverse;

    ctx.beginPath();

    // left cracks
    ctx.moveTo(-size * 1.2, size * 0.2);
    ctx.lineTo(-size * 0.9, -size * 0.1);
    ctx.lineTo(-size * 1.0, -size * 0.4);

    // right cracks
    ctx.moveTo(size * 1.1, size * 0.2);
    ctx.lineTo(size * 0.8, -size * 0.2);
    ctx.lineTo(size * 1.0, -size * 0.5);

    // top fracture
    ctx.moveTo(-size * 0.3, -size * 1.1);
    ctx.lineTo(size * 0.2, -size * 0.95);

    ctx.stroke();

    // === 6. GROUND BASE (more grounded) ===
    ctx.fillStyle = "#111";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1 * scaleInverse;

    ctx.fillRect(-size * 1.7, size * 0.6, size * 3.4, size * 0.25);
    ctx.strokeRect(-size * 1.7, size * 0.6, size * 3.4, size * 0.25);

    ctx.restore();
}

function drawoutpost(ctx, x, y, color, hovered, scaleInverse) {
    const size = (hovered ? 11 : 9) * scaleInverse;
    
    ctx.save();
    ctx.translate(x, y);

    // 1. STONE BASE (Tapered bottom)
    ctx.fillStyle = color; // Main stone color
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1.5 * scaleInverse;

    ctx.beginPath();
    ctx.moveTo(-size * 0.6, size * 0.8);  // Bottom left
    ctx.lineTo(size * 0.6, size * 0.8);   // Bottom right
    ctx.lineTo(size * 0.5, -size * 0.4);  // Top right of base
    ctx.lineTo(-size * 0.5, -size * 0.4); // Top left of base
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 2. WOODEN SUPPORTS / MID-SECTION (Darker band)
    ctx.fillStyle = "#3d2b1f"; // Dark wood brown
    ctx.fillRect(-size * 0.55, -size * 0.5, size * 1.1, size * 0.2);
    ctx.strokeRect(-size * 0.55, -size * 0.5, size * 1.1, size * 0.2);

    // 3. THE UPPER WATCH ROOM (Overhanging slightly)
    ctx.fillStyle = color;
    ctx.fillRect(-size * 0.7, -size * 1.1, size * 1.4, size * 0.6);
    ctx.strokeRect(-size * 0.7, -size * 1.1, size * 1.4, size * 0.6);

    // 4. CRENELLATIONS (The "teeth" on top of the walls)
    ctx.fillStyle = color;
    const teeth = 3;
    const toothWidth = (size * 1.4) / (teeth * 2 - 1);
    for (let i = 0; i < teeth; i++) {
        ctx.fillRect(-size * 0.7 + (i * toothWidth * 2), -size * 1.25, toothWidth, size * 0.2);
        ctx.strokeRect(-size * 0.7 + (i * toothWidth * 2), -size * 1.25, toothWidth, size * 0.2);
    }

    // 5. PEAKED ROOF (Optional - adds height)
    ctx.fillStyle = "#4a0000"; // Dark red/brown tiles
    ctx.beginPath();
    ctx.moveTo(-size * 0.8, -size * 1.1);
    ctx.lineTo(0, -size * 1.8);
    ctx.lineTo(size * 0.8, -size * 1.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 6. TINY WINDOW (Archers loop)
    ctx.fillStyle = "#111111";
    ctx.fillRect(-size * 0.1, -size * 0.9, size * 0.2, size * 0.3);

    // 7. STONE TEXTURE (Simple horizontal lines)
    ctx.strokeStyle = "rgba(0,0,0,0.2)";
    ctx.beginPath();
    ctx.moveTo(-size * 0.3, size * 0.2);
    ctx.lineTo(size * 0.3, size * 0.2);
    ctx.moveTo(-size * 0.4, size * 0.5);
    ctx.lineTo(size * 0.4, size * 0.5);
    ctx.stroke();

    ctx.restore();
}
function drawestate(ctx, x, y, color, hovered, scaleInverse) {
    const size = (hovered ? 12 : 8) * scaleInverse;
    
    ctx.save();
    ctx.translate(x, y);

    // 1. THE FOUNDATION / FIRST FLOOR (Stone/Darker)
    ctx.fillStyle = color; 
    ctx.strokeStyle = "#111111";
    ctx.lineWidth = 1.2 * scaleInverse;
    
    // Draw bottom floor rectangle
    ctx.fillRect(-size * 0.8, -size * 0.7, size * 1.6, size * 0.7);
    ctx.strokeRect(-size * 0.8, -size * 0.7, size * 1.6, size * 0.7);


    // 2. THE SECOND FLOOR (Main Color / Wood-Plaster)
    // We make this slightly wider than the first floor for a "medieval" look
    ctx.fillStyle = color;
    ctx.fillRect(-size * 0.7, 0, size * 1.4, size * 0.8);
    ctx.strokeRect(-size * 0.7, 0, size * 1.4, size * 0.8);

    // 3. CHIMNEY (To the side)
    ctx.fillStyle = "#444444";
    ctx.fillRect(size * 0.3, -size * 1.3, size * 0.3, size * 0.6);
    ctx.strokeRect(size * 0.3, -size * 1.3, size * 0.3, size * 0.6);

    // 4. THE ROOF (Triangular Peak)
    ctx.fillStyle = "#5c2a2a"; // Rooftile dark red
    ctx.beginPath();
    ctx.moveTo(-size * 1.0, -size * 0.7);
    ctx.lineTo(0, -size * 1.6);
    ctx.lineTo(size * 1.0, -size * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 5. DOOR (Centered on bottom floor)
    ctx.fillStyle = "#2b1d0e"; // Dark wood
    ctx.fillRect(-size * 0.15, size * 0.3, size * 0.3, size * 0.5);

    // 6. WINDOWS (Upper floor)
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)"; // Light reflection
    ctx.fillRect(-size * 0.5, -size * 0.4, size * 0.25, size * 0.25);
    ctx.fillRect(size * 0.25, -size * 0.4, size * 0.25, size * 0.25);

    // 7. DECORATIVE TIMBER BEAMS (The "X" or vertical lines on the house)
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.8 * scaleInverse;
    ctx.beginPath();
    // Vertical beam in the middle of the second floor
    ctx.moveTo(0, -size * 0.7);
    ctx.lineTo(0, 0);
    // Diagonal beams
    ctx.moveTo(-size * 0.8, -size * 0.7);
    ctx.lineTo(-size * 0.4, 0);
    ctx.moveTo(size * 0.8, -size * 0.7);
    ctx.lineTo(size * 0.4, 0);
    ctx.stroke();

    ctx.restore();
}
function drawcity(ctx, x, y, color, hovered, scaleInverse) {
    const size = (hovered ? 15 : 11) * scaleInverse;
    
    ctx.save();
    ctx.translate(x, y);

    // 1. THE FOUNDATION (Thin high-tech curb)
    ctx.fillStyle = "#1a1a1a"; 
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1 * scaleInverse;
    // Thinner slab (0.2 height)
    ctx.fillRect(-size * 1.3, 0, size * 2.6, size * 0.2);
    ctx.strokeRect(-size * 1.3, 0, size * 2.6, size * 0.2);

    // 2. LEFT BUILDING (Medium Height - Stepped)
    ctx.fillStyle = color;
    ctx.fillRect(-size * 1.1, -size * 0.7, size * 0.6, size * 0.7);
    ctx.strokeRect(-size * 1.1, -size * 0.7, size * 0.6, size * 0.7);
    // Roof cap for left building
    ctx.fillStyle = "#333";
    ctx.fillRect(-size * 1.1, -size * 0.8, size * 0.6, size * 0.1);

    // 3. RIGHT BUILDING (Shortest)
    ctx.fillStyle = color;
    ctx.fillRect(size * 0.5, -size * 0.5, size * 0.6, size * 0.5);
    ctx.strokeRect(size * 0.5, -size * 0.5, size * 0.6, size * 0.5);

    // 4. THE MAIN SKYSCRAPER (Tall Center Spire)
    // This is the tall part of the 🏙️ emoji
    ctx.fillStyle = color;
    ctx.fillRect(-size * 0.35, -size * 1.6, size * 0.7, size * 1.6);
    ctx.strokeRect(-size * 0.35, -size * 1.6, size * 0.7, size * 1.6);

    // 5. THE TOP "ANTENNA" SECTION (Emoji detail)
    ctx.fillStyle = "#222";
    ctx.fillRect(-size * 0.15, -size * 1.8, size * 0.3, size * 0.2);
    ctx.strokeRect(-size * 0.15, -size * 1.8, size * 0.3, size * 0.2);

    // 6. ENTRANCE (Neon Hub)
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.4;
    ctx.fillRect(-size * 0.15, 0, size * 0.3, size * 0.2);
    ctx.globalAlpha = 1.0;

    // 7. WINDOW GRID (To give it the Cityscape feel)
    ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
    // Tall tower windows
    ctx.fillRect(-size * 0.2, -size * 1.4, size * 0.1, size * 0.15);
    ctx.fillRect(size * 0.1, -size * 1.4, size * 0.1, size * 0.15);
    ctx.fillRect(-size * 0.2, -size * 1.0, size * 0.1, size * 0.15);
    ctx.fillRect(size * 0.1, -size * 1.0, size * 0.1, size * 0.15);
    
    // Left building window
    ctx.fillRect(-size * 0.9, -size * 0.5, size * 0.2, size * 0.1);

    // 8. DATA/CIRCUIT LINES (Sci-fi texture)
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.lineWidth = 0.5 * scaleInverse;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.6); ctx.lineTo(0, 0); // Vertical line down center
    ctx.stroke();

    ctx.restore();
}

function drawcamp(ctx, x, y, color, hovered, scaleInverse) {
    const size = (hovered ? 13 : 10) * scaleInverse;
    
    ctx.save();
    ctx.translate(x, y);

    // Tent / main structure (triangle + base)
    ctx.fillStyle = color;
    ctx.strokeStyle = "black";
    ctx.lineWidth = 1.6 * scaleInverse;

    // Base rectangle
    ctx.fillRect(-size * 0.8, -size * 0.2, size * 1.6, size * 0.5);
    ctx.strokeRect(-size * 0.8, -size * 0.2, size * 1.6, size * 0.5);

    // Tent roof
    ctx.beginPath();
    ctx.moveTo(-size * 0.85, -size * 0.2);
    ctx.lineTo(0, -size * 1.05);
    ctx.lineTo(size * 0.85, -size * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Campfire / detail dot
    ctx.fillStyle = "#ffaa33";
    ctx.beginPath();
    ctx.arc(0, size * 0.15, size * 0.22, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
}
/* 
function drawarea(ctx, x, y, color, hovered, scaleInverse) {
    // Increased base radius to 4.5 (from 3.5)
    const radius = (hovered ? 6 : 4.5) * scaleInverse;

    ctx.save();
    // Shadow/Border
    ctx.beginPath();
    ctx.arc(x, y, radius + 1.0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fill();

    // Carrot Orange Core
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}
 */

function drawinteractable(ctx, x, y, color, hovered, scaleInverse) {
    // Increased base radius to 4.5 (from 3.5)
    const radius = (hovered ? 6 : 4.5) * scaleInverse;

    ctx.save();
    // Shadow/Border
    ctx.beginPath();
    ctx.arc(x, y, radius + 1.0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fill();

    // Carrot Orange Core
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}
function drawvendor(ctx, x, y, color, hovered, scaleInverse) {
    // Increased base radius to 4.5 (from 3.5)
    const radius = (hovered ? 6 : 4.5) * scaleInverse;

    ctx.save();
    // Shadow/Border
    ctx.beginPath();
    ctx.arc(x, y, radius + 1.0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    ctx.fill();

    // Carrot Orange Core
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
}
function drawrevivalpoint(ctx, x, y, color, hovered, scaleInverse) {
    const size = (hovered ? 11 : 10) * scaleInverse;
    
    ctx.save();
    ctx.translate(x, y);

    // 1. THE BASE PLATE (Heavy Industrial Foundation)
    ctx.fillStyle = "#1a1a1a";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1 * scaleInverse;
    ctx.fillRect(-size * 0.8, size * 0.4, size * 1.6, size * 0.3);
    ctx.strokeRect(-size * 0.8, size * 0.4, size * 1.6, size * 0.3);

    // 2. THE MAIN TERMINAL BODY (Yellow/Black Industrial Look)
    ctx.fillStyle = color; // Entropia Terminal Yellow
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1.2 * scaleInverse;
    
    // Main vertical pillar
    ctx.fillRect(-size * 0.4, -size * 1.0, size * 0.8, size * 1.4);
    ctx.strokeRect(-size * 0.4, -size * 1.0, size * 0.8, size * 1.4);

    // 3. THE SLOPED HEAD (Top of the terminal)
    ctx.beginPath();
    ctx.moveTo(-size * 0.4, -size * 1.0);
    ctx.lineTo(size * 0.4, -size * 1.0);
    ctx.lineTo(size * 0.3, -size * 1.4); // Tapered top
    ctx.lineTo(-size * 0.3, -size * 1.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 4. THE SCREEN / CONSOLE (Glowing Area)
    // We use the 'color' variable here (likely Green or White for Revive)
    ctx.fillStyle = "#111111"; // Screen background
    ctx.fillRect(-size * 0.25, -size * 0.8, size * 0.5, size * 0.4);
    
    // The actual "Display" glow
    ctx.fillStyle = ctx.fillStyle = "#00FF0080";;
    ctx.globalAlpha = 0.6;
    ctx.fillRect(-size * 0.2, -size * 0.75, size * 0.4, size * 0.3);
    ctx.globalAlpha = 1.0;

    // 5. THE TERMINAL KEYBOARD SHELF (Protruding part)
    ctx.fillStyle = "#333333";
    ctx.fillRect(-size * 0.5, -size * 0.3, size * 1.0, size * 0.15);
    ctx.strokeRect(-size * 0.5, -size * 0.3, size * 1.0, size * 0.15);

    // 6. INDUSTRIAL STRIPES (Warning lines on the sides)
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 0.8 * scaleInverse;
    ctx.beginPath();
    // Left side stripes
    ctx.moveTo(-size * 0.4, -size * 0.1); ctx.lineTo(-size * 0.2, 0);
    ctx.moveTo(-size * 0.4, size * 0.2);  ctx.lineTo(-size * 0.2, size * 0.3);
    // Right side stripes
    ctx.moveTo(size * 0.4, -size * 0.1); ctx.lineTo(size * 0.2, 0);
    ctx.moveTo(size * 0.4, size * 0.2);  ctx.lineTo(size * 0.2, size * 0.3);
    ctx.stroke();

    // 7. REVIVE ICON (Small '+' or Heart on top)
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5 * scaleInverse;
    ctx.beginPath();
    ctx.moveTo(0, -size * 1.3); ctx.lineTo(0, -size * 1.1); // Vertical
    ctx.moveTo(-size * 0.1, -size * 1.2); ctx.lineTo(size * 0.1, -size * 1.2); // Horizontal
    ctx.stroke();

    ctx.restore();
}
function drawnpc(ctx, x, y, color, hovered, scaleInverse) {
    const size = (hovered ? 12 : 8) * scaleInverse;
    
    ctx.save();
    ctx.translate(x, y);

    // 1. SELECTION GLOW
    if (hovered) {
        ctx.beginPath();
        ctx.arc(0, -size * 0.4, size * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.globalAlpha = 1.0;
    }

    // Set shared styles for the "Suit"
    ctx.fillStyle = color; 
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1 * scaleInverse;

    // 2. LEGS & BOOTS
    // Left Leg
    ctx.fillRect(-size * 0.45, size * 0.4, size * 0.3, size * 0.7);
    ctx.strokeRect(-size * 0.45, size * 0.4, size * 0.3, size * 0.7);
    // Right Leg
    ctx.fillRect(size * 0.15, size * 0.4, size * 0.3, size * 0.7);
    ctx.strokeRect(size * 0.15, size * 0.4, size * 0.3, size * 0.7);
    
    // Boots (Darker)
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(-size * 0.55, size * 0.9, size * 0.4, size * 0.2); // Left boot
    ctx.fillRect(size * 0.15, size * 0.9, size * 0.4, size * 0.2);  // Right boot

    // 3. ARMS (Angled slightly out)
    ctx.fillStyle = color;
    // Left Arm
    ctx.save();
    ctx.translate(-size * 0.6, -size * 0.2);
    ctx.rotate(0.2);
    ctx.fillRect(-size * 0.2, 0, size * 0.25, size * 0.8);
    ctx.strokeRect(-size * 0.2, 0, size * 0.25, size * 0.8);
    ctx.restore();
    
    // Right Arm
    ctx.save();
    ctx.translate(size * 0.6, -size * 0.2);
    ctx.rotate(-0.2);
    ctx.fillRect(-size * 0.05, 0, size * 0.25, size * 0.8);
    ctx.strokeRect(-size * 0.05, 0, size * 0.25, size * 0.8);
    ctx.restore();

    // 4. TORSO (The main jumpsuit body)
    ctx.fillStyle = color;
    ctx.fillRect(-size * 0.6, -size * 0.3, size * 1.2, size * 0.8);
    ctx.strokeRect(-size * 0.6, -size * 0.3, size * 1.2, size * 0.8);

    // 5. THE HEAD & VISOR
    ctx.fillStyle = "#d2b48c"; // Skin tone
    ctx.beginPath();
    ctx.arc(0, -size * 0.7, size * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Sci-fi Visor
    ctx.fillStyle = "#1a1a1a";
    ctx.fillRect(-size * 0.25, -size * 0.85, size * 0.5, size * 0.15);

    // 6. DETAIL SEAMS (Armor/Suit lines)
    ctx.strokeStyle = "rgba(0,0,0,0.3)";
    ctx.beginPath();
    ctx.moveTo(0, -size * 0.3); ctx.lineTo(0, size * 0.4); // Zipper
    ctx.moveTo(-size * 0.6, 0); ctx.lineTo(size * 0.6, 0); // Belt line
    ctx.stroke();

    ctx.restore();
}
function drawteleporter(ctx, x, y, color, hovered, scaleInverse) {
    const size = (hovered ? 12 : 10) * scaleInverse;
    
    ctx.save();
    ctx.translate(x, y);
	// 1. THE MAIN PAD (Circular high-tech base)
    ctx.fillStyle = "#a0a0a0"; // Brighter Steel Color
    ctx.strokeStyle = "#444444"; // Softer metallic border
    ctx.lineWidth = 1 * scaleInverse;
    
    // Draw the main disc
    ctx.beginPath();
    ctx.ellipse(0, size * 0.3, size * 1.2, size * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // OPTIONAL: Add a subtle inner shine to the metal
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.3, size * 1.1, size * 0.5, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. THE ENERGY CORE (The glowing center)
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.ellipse(0, size * 0.3, size * 0.6, size * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // 3. THE GENERATOR PYLONS (The 3 pillars around the edge)
    // We use your blocky style for these
    ctx.fillStyle = "#333333";
    // Left Pylon
    ctx.fillRect(-size * 1.1, -size * 0.2, size * 0.25, size * 0.6);
    ctx.strokeRect(-size * 1.1, -size * 0.2, size * 0.25, size * 0.6);
    
    // Right Pylon
    ctx.fillRect(size * 0.85, -size * 0.2, size * 0.25, size * 0.6);
    ctx.strokeRect(size * 0.85, -size * 0.2, size * 0.25, size * 0.6);

    // 4. PYLON TIPS (Glowing lights on top of pillars)
    ctx.fillStyle = color;
    ctx.fillRect(-size * 1.1, -size * 0.3, size * 0.25, size * 0.15); // Left
    ctx.fillRect(size * 0.85, -size * 0.3, size * 0.25, size * 0.15); // Right

    // 5. VERTICAL BEAM (The "Active" teleport beam)
    // Only shows up clearly when hovered to simulate it being "ready"
    if (hovered) {
        const gradient = ctx.createLinearGradient(0, size * 0.3, 0, -size * 1.5);
        gradient.addColorStop(0, color);
        gradient.addColorStop(1, "transparent");
        
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.4;
        ctx.fillRect(-size * 0.4, -size * 1.5, size * 0.8, size * 1.8);
        ctx.globalAlpha = 1.0;
    }

    // 6. TECH DETAIL (Circuit rings on the pad)
    ctx.strokeStyle = "rgba(255,255,255,0.2)";
    ctx.beginPath();
    ctx.ellipse(0, size * 0.3, size * 0.9, size * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
}
function drawgravestone(ctx, x, y, color, hovered, scaleInverse) {
    const size = (hovered ? 12 : 8) * scaleInverse;
    
    ctx.save();
    ctx.translate(x, y);

    // 1. THE DIRT/BASE (Small flat platform)
    ctx.fillStyle = "#1a1a1a";
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 1 * scaleInverse;
    ctx.fillRect(-size * 0.8, size * 0.1, size * 1.6, size * 0.3);
    ctx.strokeRect(-size * 0.8, size * 0.1, size * 1.6, size * 0.3);

    // 2. THE TOMBSTONE BODY (Arched top)
    ctx.fillStyle = "#333333"; // Dark Stone / Metal
    ctx.strokeStyle = "#000000";
    
    ctx.beginPath();
    // Start bottom left
    ctx.moveTo(-size * 0.6, size * 0.1);
    // Line up to start of arch
    ctx.lineTo(-size * 0.6, -size * 0.6);
    // The Rounded Top
    ctx.quadraticCurveTo(0, -size * 1.6, size * 0.6, -size * 0.6);
    // Line back down to bottom right
    ctx.lineTo(size * 0.6, size * 0.1);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. THE GLOWING ETCHING (The "RIP" or Cross)
    // We use the 'color' variable here so it matches your UI theme
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5 * scaleInverse;
    ctx.globalAlpha = 0.7;
    
    ctx.beginPath();
    // Vertical bar of the cross
    ctx.moveTo(0, -size * 0.8);
    ctx.lineTo(0, -size * 0.1);
    // Horizontal bar
    ctx.moveTo(-size * 0.25, -size * 0.6);
    ctx.lineTo(size * 0.25, -size * 0.6);
    ctx.stroke();
    ctx.globalAlpha = 1.0;

    // 4. CHIPPED CORNER (Detail to make it look weathered)
    ctx.fillStyle = "#1a1a1a";
    ctx.beginPath();
    ctx.moveTo(-size * 0.6, -size * 0.4);
    ctx.lineTo(-size * 0.4, -size * 0.6);
    ctx.lineTo(-size * 0.6, -size * 0.6);
    ctx.fill();

    ctx.restore();
}


// Helper for the center dot
function drawPointCore(ctx, x, y, color, hovered, scaleInverse) {
    const radius = (hovered ? 6 : 4.5) * scaleInverse;
    ctx.beginPath();
    ctx.arc(x, y, radius + 1, 0, Math.PI * 2);
    ctx.fillStyle = 'black';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawGenericPoint(ctx, x, y, color, hovered) {
    const size = hovered ? 5 : 3;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
}
