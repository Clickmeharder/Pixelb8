(function () {
    "use strict";

    const STORAGE_KEY = "decguy_custom_content_v1";
    const WIDTH = 28;
    const HEIGHT = 31;
    const VALID_TILES = new Set(["#", 0, 2, 3, 4, 5]);
    const PLAYER_TILES = new Set([0, 2, 3]);
    const TILE_NAMES = {
        "#": "WALL",
        0: "PELLET",
        2: "POWER",
        3: "FLOOR",
        4: "HOME",
        5: "GATE"
    };
    const X_NODES = [1, 4, 7, 10, 17, 20, 23, 26];
    const Y_NODES = [1, 4, 7, 10, 18, 21, 24, 29];
    const THEMES = ["ION VAULT", "DECAY WORKS", "XENO GARDEN", "VOID RELAY", "FROST GRID", "RED CORE"];

    let data = loadData();
    let overlay = null;
    let view = "levels";
    let draft = newDraft();
    let selectedLevelId = null;
    let selectedPackId = null;
    let brush = "#";
    let painting = false;
    let mirrorPaint = true;
    let callbacks = {};

    function id(prefix) {
        if (crypto.randomUUID) return `${prefix}-${crypto.randomUUID()}`;
        return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    function clone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function escapeHtml(value) {
        return String(value ?? "").replace(/[&<>"']/g, character => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
        })[character]);
    }

    function loadData() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (parsed && Array.isArray(parsed.levels) && Array.isArray(parsed.packs)) {
                return { version: 1, levels: parsed.levels, packs: parsed.packs };
            }
        } catch (_) {}
        return { version: 1, levels: [], packs: [] };
    }

    function saveData() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new CustomEvent("decguy-content-changed"));
    }

    function hashSeed(text) {
        let hash = 2166136261;
        for (let index = 0; index < text.length; index++) {
            hash ^= text.charCodeAt(index);
            hash = Math.imul(hash, 16777619);
        }
        return hash >>> 0;
    }

    function mulberry32(seed) {
        return function () {
            seed |= 0;
            seed = seed + 0x6D2B79F5 | 0;
            let value = Math.imul(seed ^ seed >>> 15, 1 | seed);
            value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value;
            return ((value ^ value >>> 14) >>> 0) / 4294967296;
        };
    }

    function shuffle(values, random) {
        const result = [...values];
        for (let index = result.length - 1; index > 0; index--) {
            const swap = Math.floor(random() * (index + 1));
            [result[index], result[swap]] = [result[swap], result[index]];
        }
        return result;
    }

    function nodeId(row, column) {
        return row * X_NODES.length + column;
    }

    function nodePoint(node) {
        return {
            x: X_NODES[node % X_NODES.length],
            y: Y_NODES[Math.floor(node / X_NODES.length)]
        };
    }

    function edgeKey(edge) {
        return edge.a < edge.b ? `${edge.a}-${edge.b}` : `${edge.b}-${edge.a}`;
    }

    function mirrorNode(node) {
        const row = Math.floor(node / X_NODES.length);
        const column = node % X_NODES.length;
        return nodeId(row, X_NODES.length - 1 - column);
    }

    function graphValid(keys, edges) {
        const count = X_NODES.length * Y_NODES.length;
        const links = Array.from({ length: count }, () => []);
        edges.forEach(edge => {
            if (!keys.has(edgeKey(edge))) return;
            links[edge.a].push(edge.b);
            links[edge.b].push(edge.a);
        });
        if (links.some(neighbors => neighbors.length < 2)) return false;
        const visited = new Set([0]);
        const queue = [0];
        while (queue.length) {
            const current = queue.shift();
            links[current].forEach(next => {
                if (!visited.has(next)) {
                    visited.add(next);
                    queue.push(next);
                }
            });
        }
        return visited.size === count;
    }

    function carve(map, start, end, floorTile) {
        const dx = Math.sign(end.x - start.x);
        const dy = Math.sign(end.y - start.y);
        let x = start.x;
        let y = start.y;
        map[y][x] = floorTile;
        while (x !== end.x || y !== end.y) {
            x += dx;
            y += dy;
            map[y][x] = floorTile;
        }
    }

    function generateMap(seedText, openness, tunnelCount, levelType) {
        const random = mulberry32(hashSeed(seedText || "DEC-001"));
        const edges = [];
        const columns = X_NODES.length;
        const rows = Y_NODES.length;
        for (let row = 0; row < rows; row++) {
            for (let column = 0; column < columns; column++) {
                if (column < columns - 1) {
                    edges.push({ a: nodeId(row, column), b: nodeId(row, column + 1) });
                }
                if (row < rows - 1) {
                    edges.push({ a: nodeId(row, column), b: nodeId(row + 1, column) });
                }
            }
        }

        const active = new Set(edges.map(edgeKey));
        const protectedKeys = new Set([3, 4, 7].map(row =>
            edgeKey({ a: nodeId(row, 3), b: nodeId(row, 4) })
        ));
        const targetRemoval = Math.round(edges.length * (.18 + (100 - openness) * .0032));
        let removed = 0;

        for (const edge of shuffle(edges, random)) {
            if (removed >= targetRemoval) break;
            const mirrored = { a: mirrorNode(edge.a), b: mirrorNode(edge.b) };
            const keys = [...new Set([edgeKey(edge), edgeKey(mirrored)])];
            if (keys.some(key => protectedKeys.has(key) || !active.has(key))) continue;
            keys.forEach(key => active.delete(key));
            if (graphValid(active, edges)) removed += keys.length;
            else keys.forEach(key => active.add(key));
        }

        const floorTile = levelType === "maze" ? 0 : 3;
        const map = Array.from({ length: HEIGHT }, () => Array(WIDTH).fill("#"));
        edges.forEach(edge => {
            if (active.has(edgeKey(edge))) carve(map, nodePoint(edge.a), nodePoint(edge.b), floorTile);
        });

        shuffle([2, 4, 5, 6], random).slice(0, tunnelCount).forEach(rowIndex => {
            const y = Y_NODES[rowIndex];
            map[y][0] = 3;
            map[y][1] = 3;
            map[y][26] = 3;
            map[y][27] = 3;
        });

        if (levelType === "maze") {
            map[11][13] = 3;
            map[11][14] = 3;
            map[12][13] = 5;
            map[12][14] = 5;
            for (let y = 13; y <= 16; y++) {
                for (let x = 11; x <= 16; x++) map[y][x] = 4;
            }
            for (let x = 12; x <= 15; x++) map[29][x] = 3;
            [[1, 1], [26, 1], [1, 29], [26, 29]].forEach(([x, y]) => {
                if (map[y][x] === 0) map[y][x] = 2;
            });
        }
        return map;
    }

    function newDraft(type = "maze") {
        const seed = `DEC-${Math.floor(Math.random() * 999999).toString().padStart(6, "0")}`;
        return {
            id: id("level"),
            name: "UNTITLED LEVEL",
            type,
            theme: 0,
            mapData: generateMap(seed, 58, 1, type),
            settings: {
                seed, openness: 58, tunnels: 1,
                challengeType: "PEC RUSH", required: 12, timeSeconds: 34,
                itemPoints: 250, hazards: 1,
                hpBonus: 0, nodes: 3, speedScale: 1, shotScale: 1
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    function playerNeighbors(map, x, y) {
        const results = [];
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
            let nextX = x + dx;
            const nextY = y + dy;
            if (nextY < 0 || nextY >= HEIGHT) return;
            if (nextX < 0) nextX = WIDTH - 1;
            if (nextX >= WIDTH) nextX = 0;
            if (PLAYER_TILES.has(map[nextY][nextX])) results.push({ x: nextX, y: nextY });
        });
        return results;
    }

    function validateMap(map, type = "maze") {
        if (!Array.isArray(map) || map.length !== HEIGHT) {
            return { valid: false, message: `Map needs ${HEIGHT} rows.` };
        }
        for (let row = 0; row < HEIGHT; row++) {
            if (!Array.isArray(map[row]) || map[row].length !== WIDTH) {
                return { valid: false, message: `Row ${row + 1} needs ${WIDTH} tiles.` };
            }
            if (map[row].some(tile => !VALID_TILES.has(tile))) {
                return { valid: false, message: `Row ${row + 1} contains an invalid tile.` };
            }
        }

        const floor = [];
        map.forEach((row, y) => row.forEach((tile, x) => {
            if (PLAYER_TILES.has(tile)) floor.push({ x, y });
        }));
        if (!floor.length) return { valid: false, message: "Map has no player floor." };
        const visited = new Set([`${floor[0].x},${floor[0].y}`]);
        const queue = [floor[0]];
        while (queue.length) {
            const current = queue.shift();
            playerNeighbors(map, current.x, current.y).forEach(next => {
                const key = `${next.x},${next.y}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push(next);
                }
            });
        }
        if (visited.size !== floor.length) {
            return { valid: false, message: `${floor.length - visited.size} floor tiles are disconnected.` };
        }
        const deadEnds = floor.filter(tile => playerNeighbors(map, tile.x, tile.y).length < 2);
        if (deadEnds.length) return { valid: false, message: `${deadEnds.length} dead-end tiles found.` };
        if (type === "maze" && !map.flat().some(tile => tile === 0)) {
            return { valid: false, message: "Maze levels need pellet tiles (0)." };
        }
        const tunnels = map.filter(row => PLAYER_TILES.has(row[0]) && PLAYER_TILES.has(row[WIDTH - 1])).length;
        if (tunnels < 1 || tunnels > 2) {
            return { valid: false, message: `Map needs 1 or 2 wrap tunnels; found ${tunnels}.` };
        }
        return { valid: true, message: `${floor.length} walkable tiles · ${tunnels} tunnel${tunnels === 1 ? "" : "s"}` };
    }

    function normalizeLevel(level) {
        if (!level || !["maze", "challenge", "boss"].includes(level.type)) {
            throw new Error("Imported level has an invalid type.");
        }
        const validation = validateMap(level.mapData, level.type);
        if (!validation.valid) throw new Error(validation.message);
        const fresh = newDraft(level.type);
        return {
            ...fresh,
            ...clone(level),
            id: level.id || id("level"),
            name: String(level.name || "IMPORTED LEVEL").slice(0, 40),
            mapData: clone(level.mapData),
            settings: { ...fresh.settings, ...(level.settings || {}) },
            updatedAt: new Date().toISOString()
        };
    }

    function getLevel(levelId) {
        return data.levels.find(level => level.id === levelId);
    }

    function getPack(packId) {
        return data.packs.find(pack => pack.id === packId);
    }

    function packLevels(pack) {
        return (pack?.levelIds || []).map(getLevel).filter(Boolean).map(clone);
    }

    function makeOverlay() {
        overlay = document.createElement("section");
        overlay.id = "dec-level-maker";
        overlay.className = "maker-overlay";
        document.querySelector(".screen-container").appendChild(overlay);
        overlay.addEventListener("pointerup", () => painting = false);
        overlay.addEventListener("pointerleave", () => painting = false);
        render();
    }

    function open(options = {}) {
        callbacks = options;
        if (!overlay) makeOverlay();
        overlay.classList.remove("hidden");
        view = "levels";
        render();
    }

    function close() {
        if (overlay) overlay.classList.add("hidden");
        painting = false;
        if (callbacks.onClose) callbacks.onClose();
    }

    function paint(x, y) {
        draft.mapData[y][x] = brush;
        if (mirrorPaint) draft.mapData[y][WIDTH - 1 - x] = brush;
        draft.updatedAt = new Date().toISOString();
        renderGrid();
        renderValidation();
    }

    function renderGrid() {
        const grid = overlay?.querySelector(".maker-grid");
        if (!grid) return;
        grid.innerHTML = draft.mapData.map((row, y) => row.map((tile, x) =>
            `<button type="button" class="maker-cell tile-${tile === "#" ? "wall" : tile}" 
                data-x="${x}" data-y="${y}" title="${x},${y}: ${TILE_NAMES[tile]}"></button>`
        ).join("")).join("");
        grid.querySelectorAll(".maker-cell").forEach(cell => {
            const apply = () => paint(Number(cell.dataset.x), Number(cell.dataset.y));
            cell.addEventListener("pointerdown", event => {
                event.preventDefault();
                painting = true;
                apply();
            });
            cell.addEventListener("pointerenter", () => {
                if (painting) apply();
            });
        });
    }

    function renderValidation() {
        const target = overlay?.querySelector("#maker-validation");
        if (!target) return;
        const validation = validateMap(draft.mapData, draft.type);
        target.className = validation.valid ? "maker-validation valid" : "maker-validation invalid";
        target.textContent = `${validation.valid ? "✓" : "!"} ${validation.message}`;
    }

    function typeSettingsHtml() {
        if (draft.type === "challenge") {
            return `
                <label>CONTRACT<select id="maker-challenge-type">
                    ${["PEC RUSH", "SIGNAL CHAIN", "DRONE HEIST"].map(type =>
                        `<option${draft.settings.challengeType === type ? " selected" : ""}>${type}</option>`
                    ).join("")}
                </select></label>
                <label>ITEMS<input id="maker-required" type="number" min="1" max="40" value="${draft.settings.required}"></label>
                <label>SECONDS<input id="maker-time" type="number" min="10" max="180" value="${draft.settings.timeSeconds}"></label>
                <label>HAZARDS<input id="maker-hazards" type="number" min="0" max="8" value="${draft.settings.hazards}"></label>`;
        }
        if (draft.type === "boss") {
            return `
                <label>EXTRA HP<input id="maker-hp" type="number" min="0" max="10" value="${draft.settings.hpBonus}"></label>
                <label>NODES<input id="maker-nodes" type="number" min="1" max="8" value="${draft.settings.nodes}"></label>
                <label>SPEED<input id="maker-speed" type="number" min=".5" max="2" step=".1" value="${draft.settings.speedScale}"></label>
                <label>FIRE RATE<input id="maker-shot" type="number" min=".5" max="2" step=".1" value="${draft.settings.shotScale}"></label>`;
        }
        return `<label>THEME<select id="maker-theme">${
            THEMES.map((theme, index) => `<option value="${index}"${draft.theme === index ? " selected" : ""}>${theme}</option>`).join("")
        }</select></label>`;
    }

    function editorHtml() {
        const validation = validateMap(draft.mapData, draft.type);
        return `
            <div class="maker-toolbar">
                <button data-maker-close>← MENU</button>
                <button class="${view === "levels" ? "active" : ""}" data-maker-view="levels">LEVELS</button>
                <button class="${view === "packs" ? "active" : ""}" data-maker-view="packs">PACKS</button>
                <button data-maker-import>IMPORT</button>
                <input type="file" id="maker-import-file" accept=".json,application/json" hidden>
            </div>
            <div class="maker-scroll">
                <div class="maker-title-row">
                    <input id="maker-name" maxlength="40" value="${escapeHtml(draft.name)}">
                    <select id="maker-type">
                        <option value="maze"${draft.type === "maze" ? " selected" : ""}>MAZE</option>
                        <option value="challenge"${draft.type === "challenge" ? " selected" : ""}>CHALLENGE</option>
                        <option value="boss"${draft.type === "boss" ? " selected" : ""}>BOSS</option>
                    </select>
                </div>
                <div class="maker-generator">
                    <label>SEED<input id="maker-seed" value="${escapeHtml(draft.settings.seed)}"></label>
                    <label>OPEN<input id="maker-open" type="range" min="35" max="78" value="${draft.settings.openness}"></label>
                    <label>TUNNELS<select id="maker-tunnels">
                        <option value="1"${draft.settings.tunnels === 1 ? " selected" : ""}>1</option>
                        <option value="2"${draft.settings.tunnels === 2 ? " selected" : ""}>2</option>
                    </select></label>
                    <button id="maker-generate">GENERATE</button>
                </div>
                <div class="maker-type-settings">${typeSettingsHtml()}</div>
                <div class="maker-grid-wrap">
                    <div class="maker-grid" aria-label="Editable 28 by 31 level map"></div>
                    <div class="maker-palette">
                        ${["#", 0, 2, 3, 4, 5].map(tile =>
                            `<button class="tile-${tile === "#" ? "wall" : tile}${brush === tile ? " selected" : ""}" data-brush="${tile}">${tile}</button>`
                        ).join("")}
                        <label><input type="checkbox" id="maker-mirror"${mirrorPaint ? " checked" : ""}> MIRROR</label>
                    </div>
                </div>
                <p id="maker-validation" class="maker-validation ${validation.valid ? "valid" : "invalid"}">
                    ${validation.valid ? "✓" : "!"} ${escapeHtml(validation.message)}
                </p>
                <div class="maker-actions">
                    <button id="maker-new">NEW</button>
                    <button id="maker-save" class="primary">SAVE LEVEL</button>
                    <button id="maker-export">EXPORT</button>
                </div>
                <h3>SAVED LEVELS</h3>
                <div class="maker-library">${
                    data.levels.length ? data.levels.map(level => `
                        <div class="maker-library-item${selectedLevelId === level.id ? " selected" : ""}">
                            <button data-load-level="${level.id}"><b>${escapeHtml(level.name)}</b><span>${level.type.toUpperCase()}</span></button>
                            <button data-play-level="${level.id}" title="Play">▶</button>
                            <button data-delete-level="${level.id}" title="Delete">×</button>
                        </div>`).join("") :
                        `<p class="maker-empty">No custom levels saved yet.</p>`
                }</div>
            </div>`;
    }

    function packHtml() {
        const pack = getPack(selectedPackId) || {
            id: id("pack"), name: "UNTITLED PACK", description: "", levelIds: []
        };
        if (!selectedPackId) selectedPackId = pack.id;
        return `
            <div class="maker-toolbar">
                <button data-maker-close>← MENU</button>
                <button data-maker-view="levels">LEVELS</button>
                <button class="active" data-maker-view="packs">PACKS</button>
                <button data-maker-import>IMPORT</button>
                <input type="file" id="maker-import-file" accept=".json,application/json" hidden>
            </div>
            <div class="maker-scroll pack-editor">
                <div class="maker-title-row">
                    <input id="pack-name" maxlength="40" value="${escapeHtml(pack.name)}">
                    <button id="pack-new">NEW PACK</button>
                </div>
                <textarea id="pack-description" maxlength="180" placeholder="Pack description">${escapeHtml(pack.description)}</textarea>
                <div class="pack-columns">
                    <section>
                        <h3>LEVEL LIBRARY</h3>
                        <div class="maker-library">${
                            data.levels.length ? data.levels.map(level => `
                                <div class="maker-library-item">
                                    <button data-add-level="${level.id}"><b>${escapeHtml(level.name)}</b><span>${level.type.toUpperCase()}</span></button>
                                    <button data-add-level="${level.id}">＋</button>
                                </div>`).join("") :
                                `<p class="maker-empty">Create levels first.</p>`
                        }</div>
                    </section>
                    <section>
                        <h3>PLAY ORDER</h3>
                        <div class="pack-sequence">${
                            pack.levelIds.length ? pack.levelIds.map((levelId, index) => {
                                const level = getLevel(levelId);
                                return `<div>
                                    <span>${index + 1}. ${escapeHtml(level?.name || "MISSING LEVEL")}</span>
                                    <button data-pack-up="${index}">↑</button>
                                    <button data-pack-down="${index}">↓</button>
                                    <button data-pack-remove="${index}">×</button>
                                </div>`;
                            }).join("") : `<p class="maker-empty">Add levels in the order they should play.</p>`
                        }</div>
                    </section>
                </div>
                <div class="maker-actions">
                    <button id="pack-save" class="primary">SAVE PACK</button>
                    <button id="pack-play"${pack.levelIds.length ? "" : " disabled"}>PLAY PACK</button>
                    <button id="pack-export"${pack.levelIds.length ? "" : " disabled"}>EXPORT PACK</button>
                </div>
                <h3>SAVED PACKS</h3>
                <div class="maker-library">${
                    data.packs.length ? data.packs.map(saved => `
                        <div class="maker-library-item${saved.id === selectedPackId ? " selected" : ""}">
                            <button data-load-pack="${saved.id}"><b>${escapeHtml(saved.name)}</b><span>${saved.levelIds.length} LEVELS</span></button>
                            <button data-play-pack="${saved.id}" title="Play">▶</button>
                            <button data-delete-pack="${saved.id}" title="Delete">×</button>
                        </div>`).join("") :
                        `<p class="maker-empty">No level packs saved yet.</p>`
                }</div>
            </div>`;
    }

    function render() {
        if (!overlay) return;
        overlay.innerHTML = view === "packs" ? packHtml() : editorHtml();
        bindCommon();
        if (view === "packs") bindPackEditor();
        else {
            bindLevelEditor();
            renderGrid();
        }
    }

    function bindCommon() {
        overlay.querySelector("[data-maker-close]")?.addEventListener("click", close);
        overlay.querySelectorAll("[data-maker-view]").forEach(button => {
            button.addEventListener("click", () => {
                view = button.dataset.makerView;
                render();
            });
        });
        overlay.querySelector("[data-maker-import]")?.addEventListener("click", () =>
            overlay.querySelector("#maker-import-file").click()
        );
        overlay.querySelector("#maker-import-file")?.addEventListener("change", importFile);
    }

    function readEditorFields() {
        draft.name = overlay.querySelector("#maker-name")?.value.trim() || "UNTITLED LEVEL";
        draft.settings.seed = overlay.querySelector("#maker-seed")?.value.trim() || "DEC-001";
        draft.settings.openness = Number(overlay.querySelector("#maker-open")?.value || 58);
        draft.settings.tunnels = Number(overlay.querySelector("#maker-tunnels")?.value || 1);
        const theme = overlay.querySelector("#maker-theme");
        if (theme) draft.theme = Number(theme.value);
        const challengeType = overlay.querySelector("#maker-challenge-type");
        if (challengeType) draft.settings.challengeType = challengeType.value;
        const required = overlay.querySelector("#maker-required");
        if (required) draft.settings.required = Number(required.value);
        const time = overlay.querySelector("#maker-time");
        if (time) draft.settings.timeSeconds = Number(time.value);
        const hazards = overlay.querySelector("#maker-hazards");
        if (hazards) draft.settings.hazards = Number(hazards.value);
        const hp = overlay.querySelector("#maker-hp");
        if (hp) draft.settings.hpBonus = Number(hp.value);
        const nodes = overlay.querySelector("#maker-nodes");
        if (nodes) draft.settings.nodes = Number(nodes.value);
        const speed = overlay.querySelector("#maker-speed");
        if (speed) draft.settings.speedScale = Number(speed.value);
        const shot = overlay.querySelector("#maker-shot");
        if (shot) draft.settings.shotScale = Number(shot.value);
    }

    function bindLevelEditor() {
        overlay.querySelector("#maker-type").addEventListener("change", event => {
            readEditorFields();
            const nextType = event.target.value;
            if (nextType !== draft.type) {
                draft.type = nextType;
                draft.mapData = generateMap(
                    draft.settings.seed, draft.settings.openness, draft.settings.tunnels, nextType
                );
            }
            render();
        });
        overlay.querySelector("#maker-generate").addEventListener("click", () => {
            readEditorFields();
            draft.mapData = generateMap(
                draft.settings.seed, draft.settings.openness, draft.settings.tunnels, draft.type
            );
            render();
        });
        overlay.querySelectorAll("[data-brush]").forEach(button => {
            button.addEventListener("click", () => {
                const raw = button.dataset.brush;
                brush = raw === "#" ? "#" : Number(raw);
                render();
            });
        });
        overlay.querySelector("#maker-mirror").addEventListener("change", event => {
            mirrorPaint = event.target.checked;
        });
        overlay.querySelector("#maker-new").addEventListener("click", () => {
            draft = newDraft(draft.type);
            selectedLevelId = null;
            render();
        });
        overlay.querySelector("#maker-save").addEventListener("click", saveLevel);
        overlay.querySelector("#maker-export").addEventListener("click", () => {
            readEditorFields();
            const validation = validateMap(draft.mapData, draft.type);
            if (!validation.valid) return alert(validation.message);
            downloadJson(`${slug(draft.name)}.decguy-level.json`, {
                kind: "decguy-level", version: 1, level: clone(draft)
            });
        });
        overlay.querySelectorAll("[data-load-level]").forEach(button => {
            button.addEventListener("click", () => {
                selectedLevelId = button.dataset.loadLevel;
                draft = clone(getLevel(selectedLevelId));
                render();
            });
        });
        overlay.querySelectorAll("[data-play-level]").forEach(button => {
            button.addEventListener("click", () => playLevels([getLevel(button.dataset.playLevel)]));
        });
        overlay.querySelectorAll("[data-delete-level]").forEach(button => {
            button.addEventListener("click", () => deleteLevel(button.dataset.deleteLevel));
        });
    }

    function saveLevel() {
        readEditorFields();
        const validation = validateMap(draft.mapData, draft.type);
        if (!validation.valid) return alert(validation.message);
        draft.updatedAt = new Date().toISOString();
        const existingIndex = data.levels.findIndex(level => level.id === draft.id);
        if (existingIndex >= 0) data.levels[existingIndex] = clone(draft);
        else data.levels.push(clone(draft));
        selectedLevelId = draft.id;
        saveData();
        render();
    }

    function deleteLevel(levelId) {
        const level = getLevel(levelId);
        if (!level || !confirm(`Delete "${level.name}"?`)) return;
        data.levels = data.levels.filter(item => item.id !== levelId);
        data.packs.forEach(pack => {
            pack.levelIds = pack.levelIds.filter(idValue => idValue !== levelId);
        });
        if (selectedLevelId === levelId) {
            selectedLevelId = null;
            draft = newDraft();
        }
        saveData();
        render();
    }

    function currentPackDraft() {
        const saved = getPack(selectedPackId);
        if (saved) return saved;
        const name = overlay?.querySelector("#pack-name")?.value || "UNTITLED PACK";
        const description = overlay?.querySelector("#pack-description")?.value || "";
        const pack = { id: selectedPackId || id("pack"), name, description, levelIds: [] };
        selectedPackId = pack.id;
        data.packs.push(pack);
        return pack;
    }

    function capturePackText(pack) {
        pack.name = overlay.querySelector("#pack-name")?.value.trim() || "UNTITLED PACK";
        pack.description = overlay.querySelector("#pack-description")?.value.trim() || "";
        pack.updatedAt = new Date().toISOString();
    }

    function bindPackEditor() {
        overlay.querySelector("#pack-new").addEventListener("click", () => {
            selectedPackId = null;
            render();
        });
        overlay.querySelectorAll("[data-add-level]").forEach(button => {
            button.addEventListener("click", () => {
                const pack = currentPackDraft();
                capturePackText(pack);
                pack.levelIds.push(button.dataset.addLevel);
                render();
            });
        });
        overlay.querySelectorAll("[data-pack-up]").forEach(button => {
            button.addEventListener("click", () => movePackItem(Number(button.dataset.packUp), -1));
        });
        overlay.querySelectorAll("[data-pack-down]").forEach(button => {
            button.addEventListener("click", () => movePackItem(Number(button.dataset.packDown), 1));
        });
        overlay.querySelectorAll("[data-pack-remove]").forEach(button => {
            button.addEventListener("click", () => {
                const pack = currentPackDraft();
                capturePackText(pack);
                pack.levelIds.splice(Number(button.dataset.packRemove), 1);
                render();
            });
        });
        overlay.querySelector("#pack-save").addEventListener("click", () => {
            const pack = currentPackDraft();
            capturePackText(pack);
            saveData();
            render();
        });
        overlay.querySelector("#pack-play")?.addEventListener("click", () => {
            const pack = currentPackDraft();
            capturePackText(pack);
            playLevels(packLevels(pack), pack.name);
        });
        overlay.querySelector("#pack-export")?.addEventListener("click", () => {
            const pack = currentPackDraft();
            capturePackText(pack);
            downloadJson(`${slug(pack.name)}.decguy-pack.json`, {
                kind: "decguy-pack", version: 1,
                pack: clone(pack),
                levels: packLevels(pack)
            });
        });
        overlay.querySelectorAll("[data-load-pack]").forEach(button => {
            button.addEventListener("click", () => {
                selectedPackId = button.dataset.loadPack;
                render();
            });
        });
        overlay.querySelectorAll("[data-play-pack]").forEach(button => {
            button.addEventListener("click", () => {
                const pack = getPack(button.dataset.playPack);
                playLevels(packLevels(pack), pack.name);
            });
        });
        overlay.querySelectorAll("[data-delete-pack]").forEach(button => {
            button.addEventListener("click", () => {
                const pack = getPack(button.dataset.deletePack);
                if (!pack || !confirm(`Delete pack "${pack.name}"?`)) return;
                data.packs = data.packs.filter(item => item.id !== pack.id);
                if (selectedPackId === pack.id) selectedPackId = null;
                saveData();
                render();
            });
        });
    }

    function movePackItem(index, direction) {
        const pack = currentPackDraft();
        capturePackText(pack);
        const target = index + direction;
        if (target < 0 || target >= pack.levelIds.length) return;
        [pack.levelIds[index], pack.levelIds[target]] = [pack.levelIds[target], pack.levelIds[index]];
        render();
    }

    function playLevels(levels, packName = "") {
        const playable = levels.filter(Boolean).map(clone);
        if (!playable.length) return alert("This selection has no playable levels.");
        saveData();
        if (overlay) overlay.classList.add("hidden");
        if (callbacks.onPlay) callbacks.onPlay({ levels: playable, name: packName });
    }

    async function importFile(event) {
        const file = event.target.files?.[0];
        if (!file) return;
        try {
            const imported = JSON.parse(await file.text());
            if (imported.kind === "decguy-level" && imported.level) {
                const level = normalizeLevel(imported.level);
                level.id = id("level");
                data.levels.push(level);
                selectedLevelId = level.id;
                draft = clone(level);
                view = "levels";
            } else if (imported.kind === "decguy-pack" && imported.pack && Array.isArray(imported.levels)) {
                const idMap = new Map();
                imported.levels.forEach(rawLevel => {
                    const level = normalizeLevel(rawLevel);
                    const oldId = level.id;
                    level.id = id("level");
                    idMap.set(oldId, level.id);
                    data.levels.push(level);
                });
                const pack = {
                    ...imported.pack,
                    id: id("pack"),
                    name: String(imported.pack.name || "IMPORTED PACK").slice(0, 40),
                    levelIds: (imported.pack.levelIds || []).map(oldId => idMap.get(oldId)).filter(Boolean)
                };
                data.packs.push(pack);
                selectedPackId = pack.id;
                view = "packs";
            } else {
                throw new Error("This is not a DECGuy level or pack file.");
            }
            saveData();
            render();
        } catch (error) {
            alert(`Import failed: ${error.message}`);
        }
    }

    function slug(name) {
        return String(name || "decguy-level").toLowerCase()
            .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "decguy-level";
    }

    function downloadJson(filename, value) {
        const blob = new Blob([JSON.stringify(value, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement("a");
        anchor.href = url;
        anchor.download = filename;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 500);
    }

    window.DECLevelMaker = {
        open,
        close,
        getLevels: () => clone(data.levels),
        getPacks: () => clone(data.packs),
        getPackLevels: packId => packLevels(getPack(packId)),
        validateMap,
        generateMap
    };
})();