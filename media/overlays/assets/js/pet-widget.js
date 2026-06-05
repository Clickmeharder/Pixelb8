/**
 * 🐾 StreamPet Widget Module
 * Follows the hot-swappable monolithic component structure.
 */
export class StreamPet {
    constructor() {
        console.log("🐾 [Pet Widget]: Initializing Core Ecosystem...");
        
        // ==========================================
        // SECTION 1: CORE INITIALIZATION & DOM INJECTION
        // ==========================================
        const overlayWrapper = document.getElementById("overlay-wrapper");
        if (!overlayWrapper) {
            console.error("❌ [Pet Widget Error]: #overlay-wrapper element not found in DOM.");
            return;
        }

        // Pull layout dimensions from storage before building to prevent visual snapping
        const savedBounds = localStorage.getItem("greta_widget_bounds");
        this.widgetBounds = savedBounds ? JSON.parse(savedBounds) : {
            left: "100px",
            top: "100px",
            width: "400px",
            height: "400px"
        };

        // Only inject viewport if it doesn't already exist
        if (!document.getElementById("pet-widget")) {
            const petViewport = document.createElement("div");
            petViewport.id = "pet-widget";
            petViewport.classList.add("p8-widget");
            petViewport.style.zIndex = "101";
            petViewport.style.position = "absolute";
            
            // Reapply persistent window coordinates instantly
            petViewport.style.left = this.widgetBounds.left;
            petViewport.style.top = this.widgetBounds.top;
            petViewport.style.width = this.widgetBounds.width;
            petViewport.style.height = this.widgetBounds.height;

            petViewport.innerHTML = `
                <div id="bubble" class="chat-bubble"></div>
                <div id="nameplate">Loading...</div>
                <canvas id="companionCanvas"></canvas>
                <div id="status">❤️ Loading... | EXP 0</div>
            `;
            overlayWrapper.appendChild(petViewport);
            console.log("🐾 [Pet Widget]: Viewport DOM elements injected into overlay-wrapper.");
        }

        // Extract native canvas context references
        this.widgetContainer = document.getElementById("pet-widget");
        this.canvas = document.getElementById("companionCanvas");
        this.ctx = this.canvas.getContext("2d");

        // Core Static Presets & Palettes
        this.PET_SPECIES = ["kitty", "puppy", "spider", "goldfish"];
        this.KITTY_COLORS = ["#E67E22", "#95A5A6", "#2C3E50", "#ECF0F1", "#BDC3C7", "#D35400"];
        this.PUPPY_COLORS = ["#D2B48C", "#8B4513", "#F5DEB3", "#3E2723", "#FFF8DC", "#795548"];
        this.SPIDER_COLORS = ["#1A1A1A", "#3A1A1A", "#1A3A1A", "#2E1C47", "#004D40", "#424242"];
        this.GOLDFISH_COLORS = ["#FF5722", "#FF9800", "#FFC107", "#E91E63", "#FF3D00", "#FFFFFF"];
        this.BED_PRESETS = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22", "#ffffff", "#333333"];
        
        this.HUNGER_TICK_MS = 144000; 
        this.BASE_FLOOR_Y = 110;

        // NEW: Decentralized Species-Specific Profiles Database
        // This ensures every single animal tracks its own independent name, stats, age, and records cleanly.
        this.registry = {
            activeSpecies: "kitty", // Current live companion pointer
            profiles: {
                kitty: {
                    name: "Greta",
                    isDead: false,
                    birthday: Date.now(),
                    ageDays: 0,
                    stage: "Baby",
                    exp: 0,
                    hunger: 0,
                    digestive: 0,
                    lastHungerTick: Date.now(),
                    color: this.KITTY_COLORS[Math.floor(Math.random() * this.KITTY_COLORS.length)],
                    poops: []
                },
                puppy: {
                    name: "Barnaby",
                    isDead: false,
                    birthday: Date.now(),
                    ageDays: 0,
                    stage: "Baby",
                    exp: 0,
                    hunger: 0,
                    digestive: 0,
                    lastHungerTick: Date.now(),
                    color: this.PUPPY_COLORS[Math.floor(Math.random() * this.PUPPY_COLORS.length)],
                    poops: []
                },
                spider: {
                    name: "Webster",
                    isDead: false,
                    birthday: Date.now(),
                    ageDays: 0,
                    stage: "Baby",
                    exp: 0,
                    hunger: 0,
                    digestive: 0,
                    lastHungerTick: Date.now(),
                    color: this.SPIDER_COLORS[Math.floor(Math.random() * this.SPIDER_COLORS.length)],
                    poops: []
                },
                goldfish: {
                    name: "Bubbles",
                    isDead: false,
                    birthday: Date.now(),
                    ageDays: 0,
                    stage: "Baby",
                    exp: 0,
                    hunger: 0,
                    digestive: 0,
                    lastHungerTick: Date.now(),
                    color: this.GOLDFISH_COLORS[Math.floor(Math.random() * this.GOLDFISH_COLORS.length)],
                    poops: []
                }
            }
        };

        // Shared Local Viewport Mechanics and Runtime Settings Structure
        this.state = {
            twitchUser: "",
            hideBorder: false,
            hideStatus: false,
            hideNameplate: false,
            hideBackground: false,
            originalPos: { x: 0, y: 0 },
            nyanTimer: 0,
            nyanPhase: "takeoff",
            x: 200,
            y: window.innerHeight - 150,
            facing: 1,
            action: "idle",
            actionTimer: 300,
            animT: 0,
            hasFood: false,
            particles: [],
            zoom: 0, 
            
            // Dynamic secondary matrices for specific simulation profiles
            spiderWebs: [],
            goldfishBubbles: [],
            puppyBones: [],

            layout: {
                nameX: 50, nameY: 70,
                statsX: 50, statsY: 90,
                bedX: 20, bedY: 100,
                bowlX: 45, bowlY: 100,
                litterX: 90, litterY: 100,
                towerX: 70, towerY: 100,
                showTower: true,
                bedColor: "#e74c3c"
            }
        };

        // Initialize Audio Sub-Engine
        this.initAudioEngine();

        // Inject Config Menu Interface
        this.injectUI();

        // Fire initial sizing setup and register display observer
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Load runtime memory maps
        this.loadData();
        this.initContainerListeners(); 
        
        // Kick off intervals and processing thread loops
        this.saveInterval = setInterval(() => this.saveData(), 5000);
        this.animate = this.animate.bind(this);
        this.animate();

        this.bindUIEventListeners();
    }

    // ==========================================
    // SECTION 2: INPUT, BOUNDS & DATA PERSISTENCE
    // ==========================================
    initContainerListeners() {
        if (!this.widgetContainer) return;

        const observer = new MutationObserver((mutations) => {
            this.widgetBounds = {
                left: this.widgetContainer.style.left,
                top: this.widgetContainer.style.top,
                width: this.widgetContainer.style.width,
                height: this.widgetContainer.style.height
            };
            localStorage.setItem("greta_widget_bounds", JSON.stringify(this.widgetBounds));
            this.resize(); // Re-sync the canvas internal resolution
        });

        observer.observe(this.widgetContainer, { 
            attributes: true, 
            attributeFilter: ["style"] 
        });
    }

    // Sugar shorthand properties to easily get/set values inside the current isolated active pet data profile
    get activePet() {
        return this.registry.profiles[this.registry.activeSpecies];
    }

    saveData() { 
        // Save the entire multi-pet registry alongside standard global layout states
        const bundle = {
            registry: this.registry,
            state: this.state
        };
        localStorage.setItem("greta_ultra_v10", JSON.stringify(bundle)); 
    }

    loadData() {
        const saved = localStorage.getItem("greta_ultra_v10");
        if (saved) {
            const loadedBundle = JSON.parse(saved);
            
            if (loadedBundle.registry) this.registry = loadedBundle.registry;
            if (loadedBundle.state) this.state = { ...this.state, ...loadedBundle.state };
            
            // Loop through all individual isolated profiles to catch offline progression separately
            const now = Date.now();
            Object.keys(this.registry.profiles).forEach(key => {
                const profile = this.registry.profiles[key];
                const msOffline = now - profile.lastHungerTick;
                if (msOffline >= this.HUNGER_TICK_MS && !profile.isDead) {
                    const pointsGained = Math.floor(msOffline / this.HUNGER_TICK_MS);
                    let potentialHunger = profile.hunger + pointsGained;
                    if (potentialHunger >= 100) { 
                        profile.hunger = 70; 
                        profile.lastHungerTick = now; 
                    } else { 
                        profile.hunger = potentialHunger; 
                        profile.lastHungerTick = now - (msOffline % this.HUNGER_TICK_MS); 
                    }
                }
            });
            
            const nameIn = document.getElementById("nameInput"); 
            if (nameIn) nameIn.value = this.activePet.name;

            const displayEl = document.getElementById("speciesSelectDisplay");
            if (displayEl && this.registry.activeSpecies) {
                const speciesMap = {
                    kitty: "🐈 Kitty (Feline Engine v10)",
                    puppy: "🐕 Puppy (Canine Kinematics Engine)",
                    spider: "🕷️ Spider (Arachnid Procedural Pathing)",
                    goldfish: "🐟 Goldfish (Aquatic Fluid Physics)"
                };
                displayEl.innerText = speciesMap[this.registry.activeSpecies] || speciesMap.kitty;
            }

            const hideBorderCheck = document.getElementById("hideBorderToggle");
            if (hideBorderCheck) hideBorderCheck.checked = this.state.hideBorder || false;

            const hideBackgroundCheck = document.getElementById("hideBackgroundToggle");
            if (hideBackgroundCheck) hideBackgroundCheck.checked = this.state.hideBackground || false;

            const hideStatusCheck = document.getElementById("hideStatusToggle");
            if (hideStatusCheck) hideStatusCheck.checked = this.state.hideStatus || false;

            const hideNameplateCheck = document.getElementById("hideNameplateToggle");
            if (hideNameplateCheck) hideNameplateCheck.checked = this.state.hideNameplate || false;

            const checkT = document.getElementById("showTower"); 
            if (checkT) checkT.checked = this.state.layout.showTower;
            
            const zoomSlider = document.getElementById("canvasZoom");
            const zoomDisplay = document.getElementById("zoomValue");
            if (zoomSlider) {
                let savedZoom = this.state.zoom !== undefined ? this.state.zoom : 0;
                zoomSlider.value = savedZoom;
                let scaleVal = savedZoom >= 0 ? 1.0 + (savedZoom * 0.5) : 1.0 + (savedZoom * 0.25);
                if (zoomDisplay) zoomDisplay.textContent = `${scaleVal.toFixed(1)}x`;

                if (!zoomSlider.dataset.listenerWired) {
                    zoomSlider.addEventListener("input", (e) => {
                        const val = parseFloat(e.target.value);
                        this.state.zoom = val;
                        let dynamicScale = val >= 0 ? 1.0 + (val * 0.5) : 1.0 + (val * 0.25);
                        if (zoomDisplay) zoomDisplay.textContent = `${dynamicScale.toFixed(1)}x`;
                    });
                    zoomSlider.dataset.listenerWired = "true";
                }
            }

            Object.keys(this.state.layout).forEach(k => { 
                if (k === 'showTower' || k === 'bedColor') return;
                const el = document.getElementById(k);
                if (el) el.value = this.state.layout[k];
            });
        }
        this.applyEditModeStyles();
        this.applyVisibilityStates();
        this.initSwatches(); 
        this.syncSpeciesInterfaceToggle();
    }

    resize() {
        if (!this.widgetContainer || !this.canvas) return;
        this.canvas.width = this.widgetContainer.clientWidth;
        this.canvas.height = this.widgetContainer.clientHeight;
        this.ctx.imageSmoothingEnabled = false;
    }

    getPos(pctX, pctY, offY = 0) {
        const visibleW = this.canvas.width;
        const visibleH = this.canvas.height;

        let rawSliderVal = (this.state.zoom === undefined) ? 0 : this.state.zoom;
        let scaleVal = rawSliderVal >= 0 ? 1.0 + (rawSliderVal * 0.5) : 1.0 + (rawSliderVal * 0.25);

        const anchorX = visibleW / 2;
        const anchorY = visibleH - this.BASE_FLOOR_Y;

        const targetX = (pctX / 100) * visibleW;
        const targetY = (pctY / 100) * visibleH;

        const finalX = anchorX + (targetX - anchorX) / scaleVal;
        const finalY = anchorY + (targetY - anchorY) / scaleVal;

        return { x: finalX, y: finalY + offY };
    }

    // ==========================================
    // SECTION 3: SOUND SYSTEM ENGINE
    // ==========================================
    initAudioEngine() {
        const defaultSoundSettings = {
            masterEnabled: true,
            meowSound: true,
            purrSound: true,
            nyanSound: true,
            mewSound: true,
            barkSound: true,
            whineSound: true,
            clickSound: true,
            bubbleSound: true,
            customPaths: {}
        };

        this.defaultPaths = {
            meowSound: '../assets/sounds/meowSound.mp3',
            mewSound: '../assets/sounds/mewSound.mp3',
            purrSound: '../assets/sounds/purrSound.mp3',
            nyanSound: '../assets/sounds/nyanSound.mp3',
            barkSound: '../assets/sounds/barkSound.mp3',
            whineSound: '../assets/sounds/whineSound.mp3',
            clickSound: '../assets/sounds/clickSound.mp3',
            bubbleSound: '../assets/sounds/bubbleSound.mp3'
        };

        const savedSoundSettings = localStorage.getItem('pixelkitty_sound_settings');
        window.soundSettings = savedSoundSettings ? JSON.parse(savedSoundSettings) : defaultSoundSettings;

        this.audioAssets = {};
        Object.keys(this.defaultPaths).forEach(key => this.refreshAudioInstance(key));
    }

    refreshAudioInstance(key) {
        const source = window.soundSettings.customPaths[key] || this.defaultPaths[key];
        if (source) {
            this.audioAssets[key] = new Audio(source);
            if (key === 'nyanSound') this.audioAssets[key].loop = true;
        }
    }

    playSound(soundKey) {
        if (window.soundSettings.masterEnabled && window.soundSettings[soundKey]) {
            const sound = this.audioAssets[soundKey];
            if (sound) {
                sound.currentTime = 0; 
                sound.play().catch(err => console.warn(`[!] Audio: ${soundKey} blocked.`, err));
            }
        }
    }

    stopSound(soundKey) {
        if (this.audioAssets[soundKey]) {
            this.audioAssets[soundKey].pause();
            this.audioAssets[soundKey].currentTime = 0;
        }
    }

    // ==========================================
    // SECTION 4: CHAT COMMAND ROUTER
    // ==========================================
    getCommands(sendNotice) {
        const petExecution = (user, message, flags) => {
            const parts = message.trim().toLowerCase().split(/\s+/);
            const subCommand = parts[0];
            const isAdmin = flags.broadcaster || flags.mod;

            let actualSub = subCommand;
            
            if (this.activePet.isDead && actualSub !== 'revive' && actualSub !== 'status' && actualSub !== 'stats') {
                sendNotice(`🪦 [Pet]: ${this.activePet.name} is currently deceased. Use !pet revive to save them!`);
                return;
            }

            if (!actualSub) {
                sendNotice(`🐾 [Pet]: Available options: !pet [feed | play | dance | treat | status | trick]`);
                return;
            }

            switch (actualSub) {
                case 'help':
                case 'h':
                    sendNotice(`🐾 [Pet Help]: !pet feed | !pet play | !pet dance | !pet treat | !pet status | !pet trick`);
                    if (isAdmin) sendNotice(`🛠️ [Admin]: !pet [nyan | revive | clear | species]`);
                    break;

                case 'feed':
                case 'food':
                case 'fish':
                case 'meat':
                case 'bugs':
                case 'flakes':
                    if (!this.state.hasFood) {
                        this.state.hasFood = true;
                        if (this.registry.activeSpecies === "kitty") this.say("Food! 🐟");
                        if (this.registry.activeSpecies === "puppy") this.say("BONE! 🍖");
                        if (this.registry.activeSpecies === "spider") this.say("CRICKET! 🪰");
                        if (this.registry.activeSpecies === "goldfish") this.say("FLAKES! 🍤");
                        sendNotice(`🍽️ [Pet]: ${user} dropped food for ${this.activePet.name}!`);
                    } else {
                        sendNotice(`🍽️ [Pet]: There is already food in the bowl!`);
                    }
                    break;

                case 'play':
                case 'yarn':
                case 'ball':
                case 'web':
                    this.state.action = "special";
                    this.state.actionTimer = 350;
                    if (this.registry.activeSpecies === "kitty") this.say("Play! 🧶");
                    if (this.registry.activeSpecies === "puppy") this.say("FETCH! 🥎");
                    if (this.registry.activeSpecies === "spider") this.say("SPIN! 🕸️");
                    if (this.registry.activeSpecies === "goldfish") this.say("LOOP! 🫧");
                    sendNotice(`🥎 [Pet]: ${user} actively engaged with ${this.activePet.name}!`);
                    break;

                case 'dance':
                    this.state.action = "dance";
                    this.state.actionTimer = 300;
                    this.say("Dance! ✨");
                    break;

                case 'treat':
                case 'nom':
                    this.activePet.hunger = Math.max(0, this.activePet.hunger - 5);
                    this.state.action = "special";
                    this.state.actionTimer = 200;
                    this.say("NOM NOM NOM! 🍗");
                    break;

                case 'trick':
                    if (this.activePet.isDead) return;
                    this.state.action = "trick";
                    this.state.actionTimer = 250;
                    if (this.registry.activeSpecies === "puppy") { this.say("BACKFLIP! 🤸"); this.activePet.exp += 25; }
                    else if (this.registry.activeSpecies === "kitty") { this.say("PURR SLIDE! 🛷"); this.activePet.exp += 20; }
                    else if (this.registry.activeSpecies === "spider") { this.say("PARACHUTE! 🪂"); this.activePet.exp += 30; }
                    else if (this.registry.activeSpecies === "goldfish") { this.say("SPLASH FLIP! 🌊"); this.activePet.exp += 25; }
                    break;

                case 'status':
                case 'stats':
                    let healthTxt = this.activePet.poops.length > 5 ? "SICK" : "HEALTHY";
                    sendNotice(`🐾 [${this.activePet.name}]: Species: ${this.registry.activeSpecies.toUpperCase()} | Age: ${this.activePet.ageDays}d | Hunger: ${this.activePet.hunger}% | Mood: ${healthTxt} | EXP: ${this.activePet.exp}`);
                    break;

                case 'nyan':
                case 'rainbow':
                    if (isAdmin) {
                        this.triggerNyan();
                        sendNotice(`🌈 [Pet]: NYAN OVERDRIVE ACTIVATED BY STAFF!`);
                    }
                    break;

                case 'species':
                    if (isAdmin && parts[1] && this.PET_SPECIES.includes(parts[1])) {
                        this.registry.activeSpecies = parts[1];
                        this.saveData();
                        this.loadData();
                        sendNotice(`🧬 [Pet]: Species hot-swapped to ${parts[1].toUpperCase()}!`);
                    }
                    break;

                case 'revive':
                    if (isAdmin || this.activePet.exp > 100) {
                        this.revivePet();
                        sendNotice(`💖 [Pet]: ${this.activePet.name} was successfully revived by ${user}!`);
                    } else {
                        sendNotice(`❌ [Pet]: Only staff or high EXP users can revive ${this.activePet.name}!`);
                    }
                    break;

                case 'clear':
                case 'clean':
                    this.activePet.poops = [];
                    this.state.spiderWebs = [];
                    this.state.goldfishBubbles = [];
                    this.say("Fresh sand! ✨");
                    sendNotice(`🧹 [Pet]: ${user} scooped the environment layout parameters!`);
                    break;

                default:
                    sendNotice(`❌ Action !pet ${actualSub} unknown.`);
            }
        };

        return [
            { name: 'pet', adminOnly: false, execute: petExecution },
            { name: 'kitty', adminOnly: false, execute: petExecution },
            { name: 'feed', adminOnly: false, execute: (user, message, flags) => petExecution(user, 'feed', flags) },
            { name: 'play', adminOnly: false, execute: (user, message, flags) => petExecution(user, 'play', flags) },
            { name: 'dance', adminOnly: false, execute: (user, message, flags) => petExecution(user, 'dance', flags) },
            { name: 'treat', adminOnly: false, execute: (user, message, flags) => petExecution(user, 'treat', flags) },
            { name: 'trick', adminOnly: false, execute: (user, message, flags) => petExecution(user, 'trick', flags) },
            { name: 'clean', adminOnly: false, execute: (user, message, flags) => petExecution(user, 'clean', flags) },
            { name: 'status', adminOnly: false, execute: (user, message, flags) => petExecution(user, 'status', flags) },
            { name: 'nyan', adminOnly: true, execute: (user, message, flags) => petExecution(user, 'nyan', flags) },
            { name: 'revive', adminOnly: false, execute: (user, message, flags) => petExecution(user, 'revive', flags) }
        ];
    }

    // ==========================================
    // SECTION 5: UI ASSEMBLY, TEMPLATES & BINDINGS
    // ==========================================
    static get controlsTemplate() {
        const layoutMetrics = [
            ["name", "Nameplate X/Y", 50, 70, 0, 100],
            ["stats", "Stats X/Y", 50, 90, 0, 100],
            ["bed", "Cat/Dog Bed X/Y", 20, 100, 0, 100],     
            ["bowl", "Food Bowl X/Y", 45, 100, 0, 100],   
            ["litter", "Litter Box X/Y", 90, 100, 0, 100], 
            ["tower", "Tower / Castle X/Y", 70, 100, 0, 100]        
        ];

        const audioTracks = [
            { key: "meowSound", label: "😺 Standard Meow" },
            { key: "mewSound", label: "😾 Baby Mew" },
            { key: "purrSound", label: "💤 Content Purr" },
            { key: "barkSound", label: "🐕 Puppy Bark" },
            { key: "whineSound", label: "🥺 Puppy Whine" },
            { key: "clickSound", label: "🕷️ Spider Click" },
            { key: "bubbleSound", label: "🐟 Fish Bubble" },
            { key: "nyanSound", label: "🌈 Space Nyan Theme Loop" }
        ];

        return `
            <div class="collapsible-header" onclick="this.parentElement.classList.toggle('collapsed')">
				<span>🐾 Interactive Multi-Pet Companion Module</span>
				<span class="collapse-icon">▼</span>
			</div>
			<div class="collapsible-content">
				<div style="display: flex; flex-direction: column; gap: 12px;">
					
					<div style="background: #141414; padding: 10px; border-radius: 6px; border: 1px solid #27272a; display: flex; flex-direction: column; gap: 6px;">
						<label style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Select Companion Species</label>
						
						<div style="position: relative; width: 100%;">
							<div id="speciesSelectDisplay" class="p8-input" style="background: #1c1c1f; border: 1px solid #3f3f46; color: #fff; height: 32px; line-height: 30px; padding: 0 8px; font-size: 12px; border-radius: 4px; width: 100%; cursor: pointer; box-sizing: border-box;">
								🐈 Kitty (Feline Engine v10)
							</div>
							
							<div id="speciesSelectOptions" class="custom-select-options-box" style="display: none; position: absolute; top: 34px; left: 0; width: 100%; background: #1c1c1f; border: 1px solid #3f3f46; border-radius: 4px; z-index: 1000; max-height: 200px; overflow-y: auto; box-sizing: border-box;">
								</div>
						</div>
					</div>

					<div style="background: #111114; border: 1px solid #27272a; border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 12px;">
						<div style="background: #141414; padding: 10px; border-radius: 6px; border: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
							<label style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px;">Identity Parameters</label>
							<input type="text" id="nameInput" class="p8-input" placeholder="Pet Name (e.g., Greta)" style="background: #1c1c1f; border: 1px solid #3f3f46; color: #fff; height: 28px; padding: 0 8px; font-size: 12px; border-radius: 4px;">
						</div>

						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
							<button type="button" id="btnFeed" class="p8-btn" style="padding: 6px 0; background: #1e3a8a; border: 1px solid #3b82f6; font-size: 11px;">🐟 DISPENSE FOOD</button>
							<button type="button" id="btnTreat" class="p8-btn" style="padding: 6px 0; background: #7c2d12; border: 1px solid #ea580c; font-size: 11px;">🍗 GIVE TREAT</button>
							<button type="button" id="btnPlay" class="p8-btn" style="padding: 6px 0; background: #581c87; border: 1px solid #a855f7; font-size: 11px;">🧶 COMPANION PLAY</button>
							<button type="button" id="btnDance" class="p8-btn" style="padding: 6px 0; background: #065f46; border: 1px solid #10b981; font-size: 11px;">✨ LIVE DANCE</button>
						</div>

						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
							<button type="button" id="btnClear" class="p8-btn alt-btn" style="padding: 6px 0; background: #27272a; font-size: 11px;">🧹 CLEAN ENVIRONMENT</button>
							<button type="button" id="btnRevive" class="p8-btn" style="padding: 6px 0; background: #991b1b; font-size: 11px;">💖 REVIVE PET</button>
						</div>

                        <div id="kittyContextNotes" class="species-note" style="font-size:11px; color:#a1a1aa; background:#18181b; padding:8px; border-radius:4px; border-left:3px solid #e67e22;">
                            <strong>Kitty Active:</strong> Enabled climbing updates for the Cat Tower, litter-box target tracking, and audio meow nodes.
                        </div>
                        <div id="puppyContextNotes" class="species-note" style="font-size:11px; color:#a1a1aa; background:#18181b; padding:8px; border-radius:4px; border-left:3px solid #d2b48c; display:none;">
                            <strong>Puppy Active:</strong> Canine engine tracks tail animations, active bone generation points, and dynamic ground friction parameters.
                        </div>
                        <div id="spiderContextNotes" class="species-note" style="font-size:11px; color:#a1a1aa; background:#18181b; padding:8px; border-radius:4px; border-left:3px solid #9c27b0; display:none;">
                            <strong>Spider Active:</strong> Inverting standard gravity matrix. Spider paths directly along roof layers and injects geometric web nets.
                        </div>
                        <div id="goldfishContextNotes" class="species-note" style="font-size:11px; color:#a1a1aa; background:#18181b; padding:8px; border-radius:4px; border-left:3px solid #2196f3; display:none;">
                            <strong>Goldfish Active:</strong> Floats viewport container parameters inside hydrodynamic swimming bounds. Disables standard walking algorithms.
                        </div>

						<details style="border: 1px solid #27272a; border-radius: 6px; background: #18181b;">
							<summary style="padding: 8px 10px; cursor: pointer; font-weight: bold; font-size: 12px; color: #fff; outline: none;">📐 Layout & Environment Settings</summary>
							<div style="padding: 10px; border-top: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
								<div style="display: flex; flex-direction: column; gap: 4px; padding-bottom: 8px; border-bottom: 1px solid #27272a;">
									<div style="display: flex; justify-content: space-between; font-size: 11px; color: #a1a1aa;">
										<span>Canvas Zoom Scaling</span>
										<span id="zoomValue" style="color: #0ec3c3; font-weight: bold;">1.0x</span>
									</div>
									<input type="range" id="canvasZoom" min="-2" max="2" step="0.1" value="0" style="width: 100%;">
								</div>
								<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
									<span>Hide Outer Border</span>
									<input type="checkbox" id="hideBorderToggle">
								</div>
								<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
									<span>Hide Background</span>
									<input type="checkbox" id="hideBackgroundToggle">
								</div>
								<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
									<span>Hide Status Text</span>
									<input type="checkbox" id="hideStatusToggle">
								</div>
								<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
									<span>Hide Nameplate Text</span>
									<input type="checkbox" id="hideNameplateToggle">
								</div>
								<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
									<span>Show Props/Tower</span>
									<input type="checkbox" id="showTower" checked>
								</div>
								<div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
									<span style="font-size: 11px; color: #a1a1aa;">Bed Fabric Accent Color:</span>
									<div id="bedColorSwatches" style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 2px;"></div>
								</div>
								<div style="display: grid; grid-template-columns: 100px 1fr; gap: 6px; align-items: center; font-size: 11px; color: #a1a1aa;">
									${layoutMetrics.map(([id, label, xVal, yVal, minY, maxY]) => `
										<span>${label}</span>
										<div style="display: flex; flex-direction:column; gap: 4px;">
											<input type="range" id="${id}X" min="0" max="100" value="${xVal}" style="width:100%;">
											<input type="range" id="${id}Y" min="${minY}" max="${maxY}" value="${yVal}" style="width:100%;">
										</div>
									`).join('')}
								</div>
							</div>
						</details>
					</div>

					<details style="border: 1px solid #27272a; border-radius: 6px; background: #18181b;">
						<summary style="padding: 8px 10px; cursor: pointer; font-weight: bold; font-size: 12px; color: #fff; outline: none;">🔊 Audio Configurations</summary>
						<div style="padding: 10px; border-top: 1px solid #27272a; display: flex; flex-direction: column; gap: 10px;">
							<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
								<span style="font-size: 11px; color: #a1a1aa; font-weight: bold;">Master Audio Engine</span>
								<input type="checkbox" id="masterEnabled" checked>
							</div>
							<div style="display: flex; flex-direction: column; gap: 6px;">
								${audioTracks.map(({ key, label }) => `
									<div class="setting-row" data-key="${key}" style="display: flex; flex-direction: column; gap: 4px; background: #141414; padding: 6px; border-radius: 4px;">
										<div style="display: flex; justify-content: space-between; align-items: center;">
											<span style="font-size: 11px; color: #fff;">${label}</span>
											<input type="checkbox" checked>
										</div>
										<div style="display: flex; gap: 4px;">
											<button type="button" class="file-btn p8-btn alt-btn" style="flex: 1; padding: 2px 0; font-size: 10px;">Upload Audio</button>
											<button type="button" class="test-btn p8-btn" style="width: 40px; padding: 2px 0; font-size: 10px; background: #27272a;">▶</button>
											<input type="file" class="hidden-file-input" accept="audio/*" style="display: none;">
										</div>
									</div>
								`).join('')}
							</div>
						</div>
					</details>

					<button type="button" id="btnReset" class="p8-btn" style="background: #991b1b; padding: 6px 0; font-size: 11px; margin-top: 5px;">⚠️ FACTORY RESET DATA</button>
				</div>
			</div>
        `;
    }

    injectUI() {
        const wrapper = document.getElementById("widget-control-wrapper");
        if (!wrapper) {
            console.warn("⚠️ [Pet Widget]: #widget-control-wrapper not found. Skipping UI injection.");
            return;
        }

        if (document.getElementById("pet-widget-controls")) return;

        const petSection = document.createElement("div");
        petSection.id = "pet-widget-controls";
        petSection.className = "collapsible-section collapsed";
        petSection.innerHTML = StreamPet.controlsTemplate;

        const entropiaBox = document.getElementById("entropia-widget-controls");
        if (entropiaBox && entropiaBox.nextSibling) {
            wrapper.insertBefore(petSection, entropiaBox.nextSibling);
        } else {
            wrapper.appendChild(petSection);
        }
        console.log("🐾 [Pet Widget]: Global Multi-Pet Interface Injected.");
    }

    syncSpeciesInterfaceToggle() {
        document.querySelectorAll(".species-note").forEach(el => el.style.display = "none");
        const currentNote = document.getElementById(`${this.registry.activeSpecies}ContextNotes`);
        if (currentNote) currentNote.style.display = "block";
    }

    initSwatches() {
        const swatchContainer = document.getElementById("bedColorSwatches");
        if (!swatchContainer) return;
        swatchContainer.innerHTML = ""; 
        this.BED_PRESETS.forEach(color => {
            const btn = document.createElement("div");
            btn.className = "swatch" + (this.state.layout.bedColor === color ? " active" : "");
            btn.style.backgroundColor = color;
            btn.style.width = "20px";
            btn.style.height = "20px";
            btn.style.borderRadius = "4px";
            btn.style.cursor = "pointer";
            btn.style.border = this.state.layout.bedColor === color ? "2px solid #fff" : "1px solid #333";
            
            btn.addEventListener("click", () => {
                this.state.layout.bedColor = color;
                document.querySelectorAll(".swatch").forEach(s => s.style.border = "1px solid #333");
                btn.style.border = "2px solid #fff";
                this.say("Comfy! ✨");
            });
            swatchContainer.appendChild(btn);
        });
    }

    setupCustomDropdownEngine(displayId, optionsId, optionItems, onSelectionCallback = null) {
        console.log(`Setting up: ${displayId}, Items count: ${optionItems ? optionItems.length : 'NULL'}`);
        const displayEl = document.getElementById(displayId);
        const optionsEl = document.getElementById(optionsId);
        if (!displayEl || !optionsEl) return;

        optionsEl.innerHTML = "";
        optionItems.forEach(anim => {
            const opt = document.createElement("div");
            opt.className = "option-item";
            opt.style.cssText = "padding: 6px 8px; cursor: pointer; color: #fff; font-size: 12px;";
            opt.innerText = anim;
            
            opt.addEventListener("mouseenter", () => opt.style.background = "#27272a");
            opt.addEventListener("mouseleave", () => opt.style.background = "transparent");
            
            opt.addEventListener("click", (e) => {
                e.stopPropagation();
                displayEl.innerText = anim;
                optionsEl.style.display = "none";
                if (onSelectionCallback) onSelectionCallback(anim);
            });
            optionsEl.appendChild(opt);
        });

        displayEl.addEventListener("click", (e) => {
            e.stopPropagation();
            document.querySelectorAll(".custom-select-options-box").forEach(box => {
                if (box !== optionsEl) box.style.display = "none";
            });
            optionsEl.style.display = optionsEl.style.display === "block" ? "none" : "block";
        });
    }

    bindUIEventListeners() {
        const bindClick = (id, callback) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', callback);
        };

        const sliders = ["nameX", "nameY", "statsX", "statsY", "bedX", "bedY", "bowlX", "bowlY", "litterX", "litterY", "towerX", "towerY"];
        sliders.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener("input", (e) => this.state.layout[id] = parseInt(e.target.value));
        });

        // Identity rename tracking bound specifically to active isolated memory profile slot
        const nameIn = document.getElementById("nameInput");
        if (nameIn) {
            nameIn.addEventListener("input", (e) => {
                this.activePet.name = e.target.value || "Companion";
            });
        }

        const speciesOptions = [
            "🐈 Kitty (Feline Engine v10)",
            "🐕 Puppy (Canine Kinematics Engine)",
            "🕷️ Spider (Arachnid Procedural Pathing)",
            "🐟 Goldfish (Aquatic Fluid Physics)"
        ];

        this.setupCustomDropdownEngine("speciesSelectDisplay", "speciesSelectOptions", speciesOptions, (selectedText) => {
            let chosenSpecies = "kitty";
            if (selectedText.includes("Puppy")) chosenSpecies = "puppy";
            if (selectedText.includes("Spider")) chosenSpecies = "spider";
            if (selectedText.includes("Goldfish")) chosenSpecies = "goldfish";

            this.registry.activeSpecies = chosenSpecies;
            
            // Re-sync name interface field value dynamically to reflect current animal
            if (nameIn) nameIn.value = this.activePet.name;

            // Floor anchor adjustment rules
            const visibleH = this.canvas.height;
            if (chosenSpecies === "spider") this.state.y = 80;
            else if (chosenSpecies === "goldfish") this.state.y = visibleH / 2;
            else this.state.y = visibleH - this.BASE_FLOOR_Y;

            this.syncSpeciesInterfaceToggle();
            this.saveData();
            this.say(`Swapped to ${this.activePet.name}!`);
        });

        document.addEventListener("click", () => {
            document.querySelectorAll(".custom-select-options-box").forEach(box => {
                box.style.display = "none";
            });
        });

        const zoomSlider = document.getElementById("canvasZoom");
        const zoomDisplay = document.getElementById("zoomValue");
        if (zoomSlider) {
            zoomSlider.addEventListener("input", (e) => {
                const val = parseFloat(e.target.value);
                this.state.zoom = val;
                if (zoomDisplay) zoomDisplay.textContent = `${val.toFixed(1)}x`;
            });
            zoomSlider.addEventListener("change", () => this.saveData());
        }

        const borderToggle = document.getElementById("hideBorderToggle");
        if (borderToggle) {
            borderToggle.addEventListener("change", (e) => {
                this.state.hideBorder = e.target.checked;
                this.applyVisibilityStates(); 
                this.saveData();
            });
        }

        const hideBGCheck = document.getElementById("hideBackgroundToggle");
        if (hideBGCheck) {
            hideBGCheck.addEventListener("change", (e) => {
                this.state.hideBackground = e.target.checked;
                this.applyVisibilityStates();
                this.saveData();
            });
        }

        const statusToggle = document.getElementById("hideStatusToggle");
        if (statusToggle) {
            statusToggle.addEventListener("change", (e) => {
                this.state.hideStatus = e.target.checked;
                this.applyVisibilityStates();
                this.saveData();
            });
        }

        const NameplateToggle = document.getElementById("hideNameplateToggle");
        if (NameplateToggle) {
            NameplateToggle.addEventListener("change", (e) => {
                this.state.hideNameplate = e.target.checked;
                this.applyVisibilityStates();
                this.saveData();
            });
        }

        const st = document.getElementById("showTower");
        if (st) st.addEventListener("change", (e) => {
            this.state.layout.showTower = e.target.checked;
            if(!this.state.layout.showTower && this.state.action.includes("tower")) this.state.action = "idle";
        });

        bindClick("btnFeed", () => { 
            if(!this.activePet.isDead && !this.state.hasFood) { 
                this.state.hasFood = true; 
                this.say("Yum! Food dropped!"); 
            } 
        });
        bindClick("btnPlay", () => { if(!this.activePet.isDead) { this.state.action = "special"; this.state.actionTimer = 350; this.say("Playing! ✨"); } });
        bindClick("btnDance", () => { if(!this.activePet.isDead) { this.state.action = "dance"; this.state.actionTimer = 300; this.say("Dance! ✨"); } });
        bindClick("btnTreat", () => { if(!this.activePet.isDead) { this.activePet.hunger = Math.max(0, this.activePet.hunger - 5); this.state.action = "special"; this.state.actionTimer = 200; this.say("NOM NOM! 🍗"); } });
        bindClick("btnClear", () => { 
            this.activePet.poops = []; 
            this.state.spiderWebs = [];
            this.state.goldfishBubbles = [];
            this.say("Cleared and Scoured! 🧹"); 
        });
        bindClick("btnRevive", () => { this.revivePet(); });
        bindClick("btnReset", () => { 
            localStorage.removeItem("greta_widget_bounds");
            localStorage.removeItem("greta_ultra_v10"); 
            location.reload(); 
        });

        const masterToggle = document.getElementById("masterEnabled");
        if (masterToggle) {
            masterToggle.checked = window.soundSettings.masterEnabled;
            masterToggle.addEventListener("change", (e) => {
                window.soundSettings.masterEnabled = e.target.checked;
                localStorage.setItem('pixelkitty_sound_settings', JSON.stringify(window.soundSettings));
            });
        }

        document.querySelectorAll('.setting-row[data-key]').forEach(row => {
            const key = row.getAttribute('data-key');
            const checkbox = row.querySelector('input[type="checkbox"]');
            const fileBtn = row.querySelector('.file-btn');
            const fileInput = row.querySelector('.hidden-file-input');
            const testBtn = row.querySelector('.test-btn');

            if (checkbox) {
                checkbox.checked = window.soundSettings[key];
                checkbox.addEventListener('change', (e) => {
                    window.soundSettings[key] = e.target.checked;
                    localStorage.setItem('pixelkitty_sound_settings', JSON.stringify(window.soundSettings));
                });
            }

            if (fileBtn && fileInput) {
                fileBtn.addEventListener('click', () => fileInput.click());
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const url = URL.createObjectURL(file);
                        window.soundSettings.customPaths[key] = url;
                        localStorage.setItem('pixelkitty_sound_settings', JSON.stringify(window.soundSettings));
                        this.refreshAudioInstance(key);
                        this.say("Audio updated! 🎧");
                    }
                });
            }

            if (testBtn) {
                testBtn.addEventListener('click', () => this.playSound(key));
            }
        });
    }

    幕(txt) {} // Catch invalid encoding safely
    say(txt) {
        const b = document.getElementById("bubble");
        if (!b) return;
        b.textContent = txt; 
        b.style.left = (this.state.x - 50) + "px"; 
        b.style.top = (this.state.y - 140) + "px";
        b.classList.add("show"); 
        
        if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
        this.bubbleTimeout = setTimeout(() => b.classList.remove("show"), 3000);

        if (txt.includes("Meow") || txt.includes("Kitty")) this.playSound('meowSound');
        if (txt.includes("Mew")) this.playSound('mewSound');
        if (txt.includes("Purrr") || txt.includes("Comfy")) this.playSound('purrSound');
        if (txt.includes("BARK") || txt.includes("FETCH")) this.playSound('barkSound');
        if (txt.includes("Hungry") && this.registry.activeSpecies === "puppy") this.playSound('whineSound');
        if (txt.includes("SPIN") || this.registry.activeSpecies === "spider" && Math.random() < 0.3) this.playSound('clickSound');
        if (txt.includes("LOOP") || txt.includes("FLAKES") || this.registry.activeSpecies === "goldfish") this.playSound('bubbleSound');
    }

	updateUI() {
		const nameEl = document.getElementById("nameplate");
		const statsEl = document.getElementById("status");
		if(!nameEl || !statsEl) return;
		
		nameEl.style.left = this.state.layout.nameX + "%"; 
		nameEl.style.top = this.state.layout.nameY + "%";
		statsEl.style.left = this.state.layout.statsX + "%"; 
		statsEl.style.top = this.state.layout.statsY + "%";
		
		let sTxt = this.activePet.isDead ? "DECEASED" : (this.activePet.poops.length > 5 ? "SICK" : "HEALTHY");
		statsEl.innerHTML = `${this.activePet.name} (${this.registry.activeSpecies.toUpperCase()}) | Age: ${this.activePet.ageDays}d | Hunger: ${this.activePet.hunger}%<br>Status: ${sTxt} | EXP: ${this.activePet.exp}`;
		nameEl.textContent = this.activePet.isDead ? `${this.activePet.name.toUpperCase()}'S GHOST` : this.activePet.name.toUpperCase();
		
		// Dynamic Form Option Label Management
		const propLabel = document.querySelector('label[for="showTower"]') || document.getElementById("showTower")?.previousElementSibling;
		if (propLabel) {
			if (this.registry.activeSpecies === "puppy") propLabel.textContent = "Show Doghouse";
			else if (this.registry.activeSpecies === "goldfish") propLabel.textContent = "Show Castle/Coral";
			else propLabel.textContent = "Show Cat Tower";
		}

		// NEW: Dynamic Multi-Species Potty Label Swap
		const litterLabel = Array.from(document.querySelectorAll('span')).find(el => el.textContent.includes("Litter Box"));
		if (litterLabel) {
			litterLabel.textContent = (this.registry.activeSpecies === "puppy") ? "Grass Patch X/Y" : "Litter Box X/Y";
		}
	}

    applyEditModeStyles() {
        const el = document.getElementById("pet-widget");
        if (!el) return;
        if (document.body.classList.contains('edit-mode')) {
            el.style.pointerEvents = "auto"; 
        }
    }

    applyVisibilityStates() {
        if (this.widgetContainer) {
            if (this.state.hideBorder) {
                this.widgetContainer.style.border = "none";
                this.widgetContainer.style.boxShadow = "none";
            } else {
                this.widgetContainer.style.border = "";
                this.widgetContainer.style.boxShadow = "";
            }

            if (this.state.hideBackground) {
                this.widgetContainer.style.setProperty("background", "transparent", "important");
            } else {
                this.widgetContainer.style.background = ""; 
            }
        }

        const statusEl = document.getElementById("status");
        if (statusEl) statusEl.style.display = this.state.hideStatus ? "none" : "block";
        
        const nameplateEl = document.getElementById("nameplate");
        if (nameplateEl) nameplateEl.style.display = this.state.hideNameplate ? "none" : "block";
    }

    // ==========================================
    // SECTION 6: RENDER ENGINE, ANIMATION & AI PIPELINE
    // ==========================================
    triggerNyan() {
        if (this.activePet.isDead || this.state.action === "nyan") return;
        this.state.originalPos = { x: this.state.x, y: this.state.y };
        this.state.action = "nyan";
        this.state.nyanPhase = "takeoff";
        this.state.actionTimer = 400;
        this.playSound('nyanSound');
        this.say("NYAN OVERDRIVE ACTIVATED! 🌈");
    }

    revivePet() {
        if (this.activePet.isDead) {
            this.activePet.isDead = false;
            this.activePet.hunger = 50; 
            this.state.action = "special";
            this.state.actionTimer = 200;
            this.activePet.lastHungerTick = Date.now();
            this.say("I'M ALIVE! 💖");
            this.saveData();
            
            for(let i=0; i<20; i++) {
                this.state.particles.push({
                    x: this.state.x, 
                    y: this.state.y, 
                    vx: (Math.random() - 0.5) * 10, 
                    vy: (Math.random() - 0.5) * 10, 
                    s: 4, 
                    c: "#ff77aa", 
                    life: 40
                });
            }
        } else {
            this.say("Already healthy! ✨");
        }
    }

    updateAI(t) {
        if (this.activePet.isDead) return;
        this.activePet.ageDays = Math.floor((Date.now() - this.activePet.birthday) / 86400000);
        this.activePet.stage = this.activePet.ageDays < 2 ? "Baby" : this.activePet.ageDays < 5 ? "Juvenile" : "Adult";

        const now = Date.now();
        const msElapsed = now - this.activePet.lastHungerTick;
        if (msElapsed >= this.HUNGER_TICK_MS) {
            this.activePet.hunger = Math.min(100, this.activePet.hunger + Math.floor(msElapsed / this.HUNGER_TICK_MS)); 
            this.activePet.lastHungerTick = now - (msElapsed % this.HUNGER_TICK_MS);
        }
        if (this.activePet.hunger === 100) this.activePet.isDead = true;

        const visibleW = this.canvas.width;
        const visibleH = this.canvas.height;
        
        let rawSliderVal = (this.state.zoom === undefined) ? 0 : this.state.zoom;
        let scaleVal = rawSliderVal >= 0 ? 1.0 + (rawSliderVal * 0.5) : 1.0 + (rawSliderVal * 0.25);
        const anchorX = visibleW / 2;
        const anchorY = visibleH - this.BASE_FLOOR_Y;

        const getUnscaledPos = (pctX, pctY) => {
            const targetX = (pctX / 100) * visibleW;
            const targetY = (pctY / 100) * visibleH;
            return {
                x: anchorX + (targetX - anchorX) / scaleVal,
                y: anchorY + (targetY - anchorY) / scaleVal
            };
        };

        const bowlPos = getUnscaledPos(this.state.layout.bowlX, this.state.layout.bowlY);
        const bedPos = getUnscaledPos(this.state.layout.bedX, this.state.layout.bedY);
        const litPos = getUnscaledPos(this.state.layout.litterX, this.state.layout.litterY);
        const towerPos = getUnscaledPos(this.state.layout.towerX, this.state.layout.towerY);

        // Species Anchor Re-scoping
        let groundY = visibleH - this.BASE_FLOOR_Y;
        if (this.registry.activeSpecies === "spider") {
            groundY = 70; // Ceil-mount tracking line
        }

        const walkToPoint = (targetX, targetY, speed = 2) => {
            const dx = targetX - this.state.x; 
            const dy = targetY - this.state.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 12) {
                this.state.facing = dx > 0 ? 1 : -1;
                this.state.x += (dx / dist) * speed; 
                this.state.y += (dy / dist) * speed;
                return false;
            }
            return true;
        };

        if (this.state.actionTimer > 0) this.state.actionTimer--;
        
        // Feed trigger processing intercept
        if (this.state.hasFood && !["nyan", "eating", "potty", "kicking", "walk_to_kick", "walk_to_litter"].includes(this.state.action)) {
            this.state.action = "walk_to_food";
        }

        // ========================================================
        // COMPANION SPECIES FSM ENGINE
        // ========================================================
        switch(this.state.action) {
            case "nyan":
                if (this.state.nyanPhase === "takeoff") {
                    const targetY = visibleH / 2;
                    this.state.y += (targetY - this.state.y) * 0.05; 
                    this.state.x += this.state.facing * 5;
                    if (Math.abs(this.state.y - targetY) < 15) this.state.nyanPhase = "flying";
                } else if (this.state.nyanPhase === "flying") {
                    this.state.x += this.state.facing * 10; 
                    this.state.y = (visibleH / 2) + Math.sin(t * 0.1) * 100;
                    if (this.state.actionTimer < 80) this.state.nyanPhase = "landing";
                } else if (this.state.nyanPhase === "landing") {
                    this.state.x += (this.state.originalPos.x - this.state.x) * 0.08; 
                    this.state.y += (this.state.originalPos.y - this.state.y) * 0.08;
                }
                if (this.state.nyanPhase !== "landing") {
                    if (this.state.x > visibleW + 150) this.state.x = -150;
                    if (this.state.x < -150) this.state.x = visibleW + 150;
                }
                if (this.state.actionTimer <= 0) {
                    this.stopSound('nyanSound');
                    this.state.x = this.state.originalPos.x; 
                    this.state.y = this.state.originalPos.y;
                    this.state.action = "dance"; 
                    this.state.actionTimer = 200;
                }
                break;

            case "walk_to_food":
                let destY = (this.registry.activeSpecies === "spider") ? 70 : bowlPos.y;
                if (walkToPoint(bowlPos.x, destY, 2.5)) { 
                    if (this.state.hasFood) { 
                        this.state.action = "eating"; 
                        this.state.actionTimer = 140; 
                    } else { 
                        this.state.action = "beg"; 
                        this.state.actionTimer = 120; 
                        this.say("Feed me! 🍽️"); 
                    }
                }
                break;

            case "eating":
                if (this.state.actionTimer <= 0) {
                    this.state.hasFood = false; 
                    this.activePet.hunger = Math.max(0, this.activePet.hunger - 15); 
                    this.activePet.digestive += 1; 
                    this.activePet.exp += 20; 
                    this.state.action = "idle"; 
                    this.state.actionTimer = 300;
                    if(this.registry.activeSpecies === "goldfish") {
                        this.playSound("bubbleSound");
                        this.state.goldfishBubbles.push({x: this.state.x, y: this.state.y, r: 6, alpha: 1});
                    }
                }
                break;

            case "walk_to_litter":
                let litterDestY = (this.registry.activeSpecies === "spider") ? 70 : litPos.y;
                if (walkToPoint(litPos.x, litterDestY)) { 
                    this.state.action = "potty"; 
                    this.state.actionTimer = 120; 
                }
                break;

            case "potty":
                if (this.state.actionTimer <= 0) { 
                    this.activePet.poops.push({ox: Math.random()*100, isCeil: (this.registry.activeSpecies === "spider")}); 
                    this.activePet.digestive = 0; 
                    this.state.action = (this.registry.activeSpecies === "spider") ? "idle" : "walk_to_kick"; 
                    if (this.registry.activeSpecies === "spider") this.say("Dropped silk line! 🕸️");
                }
                break;

            case "walk_to_kick":
                if (walkToPoint(litPos.x - 50, litPos.y)) { 
                    this.state.facing = 1; 
                    this.state.action = "kicking"; 
                    this.state.actionTimer = 80; 
                }
                break;

            case "kicking":
                if (t % 2 === 0) {
                    this.state.particles.push({x: this.state.x - 10, y: this.state.y + 20, vx: 5 + Math.random()*6, vy: -4, s: 2.5, c: "#bdc3c7", life: 25});
                }
                if (this.state.actionTimer <= 0) { 
                    this.state.action = "idle"; 
                    this.state.actionTimer = 300; 
                    this.say("All cleaned! ✨"); 
                }
                break;

            case "walk_to_bed":
                let bedDestY = (this.registry.activeSpecies === "spider") ? 70 : bedPos.y;
                if (walkToPoint(bedPos.x, bedDestY)) { 
                    this.state.action = "sleep"; 
                    this.state.actionTimer = 1000; 
                }
                break;

            case "walk_to_tower_scratch":
                let propY = (this.registry.activeSpecies === "spider") ? 70 : towerPos.y;
                if (walkToPoint(towerPos.x - 20, propY)) { 
                    this.state.facing = 1; 
                    this.state.action = "scratching"; 
                    this.state.actionTimer = 180; 
                    this.say(this.registry.activeSpecies === "spider" ? "Spinning web asset! 🕸️" : "Scritch scratch! 🐾"); 
                }
                break;

            case "walk_to_tower_climb":
                let climbY = (this.registry.activeSpecies === "spider") ? 90 : towerPos.y - 140;
                if (walkToPoint(towerPos.x, climbY)) { 
                    this.state.action = "tower_sleep"; 
                    this.state.actionTimer = 1200; 
                }
                break;

            case "scratching":
                 if (t % 3 === 0) {
                     let pColor = (this.registry.activeSpecies === "spider") ? "#ffffff" : "#a67c52";
                     this.state.particles.push({x: this.state.x + 15, y: this.state.y, vx: (Math.random()-0.5)*4, vy: -2, s: 2, c: pColor, life: 15});
                 }
                 if (this.state.actionTimer <= 0) {
                     if (this.registry.activeSpecies === "spider") {
                         this.state.spiderWebs.push({x: this.state.x, y: this.state.y, size: 30});
                     }
                     this.state.action = "idle";
                 }
                 break;

            case "trick":
                if (this.state.actionTimer <= 0) this.state.action = "idle";
                break;

            case "idle":
                // Internal structural float loop for fish
                if (this.registry.activeSpecies === "goldfish") {
                    this.state.y = (visibleH / 2) + Math.sin(t * 0.04) * 40;
                    if (Math.random() < 0.02) {
                        this.state.goldfishBubbles.push({x: this.state.x + this.state.facing*20, y: this.state.y - 10, r: 2 + Math.random()*4, alpha: 1});
                    }
                }

                if (this.state.actionTimer <= 0) {
                    if (Math.random() < 0.15) {
                        if (this.registry.activeSpecies === "kitty") this.say("Meow! 🐾");
                        if (this.registry.activeSpecies === "puppy") this.say("BARK! 🐶");
                        if (this.registry.activeSpecies === "spider") this.say("Click-click... 🕷️");
                        if (this.registry.activeSpecies === "goldfish") this.say("Blub... 🫧");
                    }
                    
                    if (Math.random() < 0.4) { 
                        this.state.actionTimer = 400 + Math.random() * 400; 
                        return; 
                    }

                    if (this.activePet.digestive >= 3) { 
                        this.state.action = "walk_to_litter"; 
                    } else {
                        const r = Math.random();
                        if (r < 0.20) { 
                            this.state.action = "walk"; 
                            this.state.facing = Math.random() > 0.5 ? 1 : -1; 
                            this.state.actionTimer = 300 + Math.random() * 300; 
                        }
                        else if (r < 0.40) this.state.action = "walk_to_bed";
                        else if (r < 0.60 && this.state.layout.showTower) {
                            this.state.action = Math.random() > 0.5 ? "walk_to_tower_scratch" : "walk_to_tower_climb";
                        }
                        else this.state.actionTimer = 500 + Math.random() * 500;
                    }
                }
                break;

            case "walk":
                this.state.x += this.state.facing * 1.5;
                if (this.registry.activeSpecies === "goldfish") {
                    this.state.y = (visibleH / 2) + Math.sin(t * 0.07) * 50;
                    if(t % 5 === 0) this.state.goldfishBubbles.push({x: this.state.x, y: this.state.y, r: 2, alpha: 0.8});
                }
                if (this.state.x < 80 || this.state.x > visibleW - 80) this.state.facing *= -1;
                if (this.state.actionTimer <= 0) { 
                    this.state.action = "idle"; 
                    this.state.actionTimer = 400; 
                }
                break;

            case "sleep":
            case "tower_sleep":
            case "dance":
            case "special":
                if (this.state.actionTimer <= 0) { 
                    if(this.state.action === "tower_sleep") this.state.y = groundY;
                    this.state.action = "idle"; 
                }
                break;
        }
    }

    animate = () => {
        this.state.animT++;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.updateAI(this.state.animT);

        this.ctx.save();
        let rawSliderVal = (this.state.zoom === undefined) ? 0 : this.state.zoom;
        let scaleVal = rawSliderVal >= 0 ? 1.0 + (rawSliderVal * 0.5) : 1.0 + (rawSliderVal * 0.25);

        const anchorX = this.canvas.width / 2;
        const anchorY = this.canvas.height - this.BASE_FLOOR_Y;

        this.ctx.translate(anchorX, anchorY);
        this.ctx.scale(scaleVal, scaleVal);
        this.ctx.translate(-anchorX, -anchorY);

        this.drawEnvironment(this.state.animT);

        let petScale = (this.activePet.stage === "Baby") ? 0.6 : (this.activePet.stage === "Juvenile") ? 0.8 : 1.0;
        
        // ========================================================
        // RENDERING SPECIES DELEGATION ROUTER
        // ========================================================
        if (this.registry.activeSpecies === "kitty") {
            this.drawKitty(this.state.animT, petScale);
        } else if (this.registry.activeSpecies === "puppy") {
            this.drawPuppy(this.state.animT, petScale);
        } else if (this.registry.activeSpecies === "spider") {
            this.drawSpider(this.state.animT, petScale);
        } else if (this.registry.activeSpecies === "goldfish") {
            this.drawGoldfish(this.state.animT, petScale);
        }
        
        this.ctx.restore();
        this.updateUI();
        requestAnimationFrame(this.animate);
    }

    drawYarn(x, y, t) {
        const roll = Math.sin(t * 0.15) * 40;
        this.ctx.save();
        this.ctx.translate(x + roll, y);
        this.ctx.fillStyle = "rgba(0,0,0,0.1)";
        this.ctx.beginPath(); this.ctx.ellipse(0, 15, 15, 5, 0, 0, Math.PI*2); this.ctx.fill();
        
        let ballColor = "#e74c3c";
        if (this.registry.activeSpecies === "puppy") ballColor = "#ffeb3b"; // Tennis ball variant
        if (this.registry.activeSpecies === "spider") ballColor = "#9c27b0";
        
        this.ctx.fillStyle = ballColor;
        this.ctx.beginPath(); this.ctx.arc(0, 12, 12, 0, Math.PI*2); this.ctx.fill();
        this.ctx.strokeStyle = "rgba(0,0,0,0.2)";
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath(); this.ctx.arc(0, 0, 8, 0, Math.PI); this.ctx.stroke();
        this.ctx.restore();
    }

    drawEnvironment(t) {
        const visibleW = this.canvas.width;
        const visibleH = this.canvas.height;

        // Draw structural spider webs if tracking arrays populated
        this.state.spiderWebs.forEach(web => {
            this.ctx.strokeStyle = "rgba(255,255,255,0.25)";
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            for(let i=0; i<8; i++) {
                let angle = (i / 8) * Math.PI * 2;
                this.ctx.moveTo(web.x, web.y);
                this.ctx.lineTo(web.x + Math.cos(angle)*web.size, web.y + Math.sin(angle)*web.size);
            }
            this.ctx.stroke();
        });

        // Bed structural block render updates
        const bPos = this.getPos(this.state.layout.bedX, this.state.layout.bedY);
        this.ctx.fillStyle = "rgba(0,0,0,0.1)";
        this.ctx.beginPath(); this.ctx.ellipse(bPos.x, bPos.y + 10, 70, 25, 0, 0, Math.PI*2); this.ctx.fill();
        this.ctx.fillStyle = this.state.layout.bedColor;
        this.ctx.beginPath(); this.ctx.ellipse(bPos.x, bPos.y + 5, 60, 20, 0, 0, Math.PI*2); this.ctx.fill();

        // Object Prop Variant: Cat Tower vs Castle/Coral
        if (this.state.layout.showTower) {
            const tPos = this.getPos(this.state.layout.towerX, this.state.layout.towerY);
            
            if (this.registry.activeSpecies === "goldfish") {
                // Aquarium Castle/Coral layout block
                this.ctx.fillStyle = "#ffb74d"; 
                this.ctx.fillRect(tPos.x - 40, tPos.y - 80, 80, 80);
                this.ctx.fillStyle = "#e65100";
                this.ctx.fillRect(tPos.x - 50, tPos.y - 110, 30, 30);
                this.ctx.fillRect(tPos.x + 20, tPos.y - 110, 30, 30);
                this.ctx.fillStyle = "#4e342e"; // Main gateway door open
                this.ctx.beginPath(); this.ctx.arc(tPos.x, tPos.y, 20, Math.PI, 0, false); this.ctx.fill();
                
            } else if (this.registry.activeSpecies === "puppy") {
                // 🐕 Cozy Doghouse Asset Block
                this.ctx.save();
                
                // Base Shadow
                this.ctx.fillStyle = "rgba(0,0,0,0.15)";
                this.ctx.fillRect(tPos.x - 55, tPos.y + 5, 110, 15);
                
                // Main Wood Structure Walls
                this.ctx.fillStyle = "#d7ccc8"; 
                this.ctx.fillRect(tPos.x - 45, tPos.y - 65, 90, 70);
                
                // Front Doorway Arch (Dark interior)
                this.ctx.fillStyle = "#3e2723"; 
                this.ctx.beginPath();
                this.ctx.arc(tPos.x, tPos.y - 25, 20, Math.PI, 0, false);
                this.ctx.fillRect(tPos.x - 20, tPos.y - 25, 40, 30);
                this.ctx.fill();
                
                // Triangular Peak Wall Fill
                this.ctx.fillStyle = "#d7ccc8";
                this.ctx.beginPath();
                this.ctx.moveTo(tPos.x - 45, tPos.y - 65);
                this.ctx.lineTo(tPos.x, tPos.y - 95);
                this.ctx.lineTo(tPos.x + 45, tPos.y - 65);
                this.ctx.fill();
                
                // Overhanging Roof Slats (Classic Red Doghouse Roof)
                this.ctx.strokeStyle = "#d32f2f";
                this.ctx.lineWidth = 8;
                this.ctx.lineCap = "round";
                this.ctx.beginPath();
                this.ctx.moveTo(tPos.x - 55, tPos.y - 60);
                this.ctx.lineTo(tPos.x, tPos.y - 98);
                this.ctx.lineTo(tPos.x + 55, tPos.y - 60);
                this.ctx.stroke();
                
                this.ctx.restore();
                
            } else {
                // Standard Feline Tower framework block (Kitty / Spider fallback)
                this.ctx.fillStyle = "rgba(0,0,0,0.1)"; this.ctx.fillRect(tPos.x - 60, tPos.y + 5, 120, 20); 
                this.ctx.fillStyle = "#7f8c8d"; this.ctx.fillRect(tPos.x - 55, tPos.y - 5, 110, 15); 
                this.ctx.fillStyle = "#a67c52"; this.ctx.fillRect(tPos.x - 10, tPos.y - 120, 20, 120); 
                this.ctx.fillStyle = "#95a5a6"; this.ctx.fillRect(tPos.x - 40, tPos.y - 60, 80, 10); this.ctx.fillRect(tPos.x - 30, tPos.y - 125, 60, 10); 
            }
        }
        // Bowl processing map updates
        const fPos = this.getPos(this.state.layout.bowlX, this.state.layout.bowlY);
        this.ctx.fillStyle = "rgba(0,0,0,0.2)"; this.ctx.beginPath(); this.ctx.ellipse(fPos.x, fPos.y + 5, 35, 10, 0, 0, Math.PI*2); this.ctx.fill();
        this.ctx.fillStyle = "#ecf0f1"; this.ctx.beginPath(); this.ctx.ellipse(fPos.x, fPos.y, 32, 12, 0, 0, Math.PI*2); this.ctx.fill();
        this.ctx.fillStyle = "#bdc3c7"; this.ctx.beginPath(); this.ctx.ellipse(fPos.x, fPos.y - 3, 30, 9, 0, 0, Math.PI*2); this.ctx.fill();
        if(this.state.hasFood) {
            this.ctx.fillStyle = "#d35400"; this.ctx.beginPath(); this.ctx.ellipse(fPos.x, fPos.y - 4, 18, 5, 0, 0, Math.PI*2); this.ctx.fill();
            this.ctx.font = "16px Arial";
            let foodIcon = "🐟";
            if (this.registry.activeSpecies === "puppy") foodIcon = "🍖";
            if (this.registry.activeSpecies === "spider") foodIcon = "🪰";
            if (this.registry.activeSpecies === "goldfish") foodIcon = "🍤";
            this.ctx.fillText(foodIcon, fPos.x - 8, fPos.y - 5);
        }

        // Environment Sandbox Litter Box Layout Map
		// ========================================================
        // POLYMORPHIC POTTY SANITARY MATRIX (Litter Box vs Grass Patch)
        // ========================================================
        const lPos = this.getPos(this.state.layout.litterX, this.state.layout.litterY);
        const boxW = 150;

		if (this.registry.activeSpecies === "puppy") {
            // 🌿 Fresh Sod Grass Patch Variant for Canines
            // Base Underlay Dirt Shadow Matrix
            this.ctx.fillStyle = "#4e342e"; 
            this.ctx.fillRect(lPos.x - boxW/2, lPos.y + 2, boxW, 38);
            
            // Vibrant Grass Turf Slabs
            this.ctx.fillStyle = "#2e7d32"; 
            this.ctx.fillRect(lPos.x - boxW/2 + 4, lPos.y + 4, boxW - 8, 32);
            
            // Procedural Blade Clusters Accent Details
            this.ctx.fillStyle = "#4caf50";
            for (let i = 0; i < 6; i++) {
                let bladeX = lPos.x - boxW/2 + 15 + (i * 22);
                this.ctx.fillRect(bladeX, lPos.y + 12 + (i % 3 * 4), 3, 10);
                this.ctx.fillRect(bladeX + 4, lPos.y + 16, 2, 6);
            }
            
            // Miniature Backyard Decorative Picket Border Trim (Shifted on top of grass)
            this.ctx.fillStyle = "#f5f5f5";
            
            // 1. Vertical posts: Started at lPos.y - 20 with a height of 24 so they terminate exactly at lPos.y + 4
            for(let p = 0; p <= boxW; p += 15) {
                this.ctx.fillRect(lPos.x - boxW/2 + p, lPos.y - 20, 4, 24); 
            }
            
            // 2. Rails: Shifted upward to fit proportionally within the new picket area height
            this.ctx.fillRect(lPos.x - boxW/2, lPos.y - 14, boxW, 4);   // Top rail
            this.ctx.fillRect(lPos.x - boxW/2, lPos.y - 4, boxW, 4);    // Bottom rail
        } else {
            // 🐈 Standard Feline Sand Litter Box Enclosure
            this.ctx.fillStyle = "rgba(0,0,0,0.2)"; 
            this.ctx.fillRect(lPos.x - boxW/2 + 5, lPos.y + 5, boxW, 40);
            this.ctx.fillStyle = "#2c3e50"; 
            this.ctx.fillRect(lPos.x - boxW/2, lPos.y, boxW, 40);
            this.ctx.fillStyle = "#95a5a6"; 
            this.ctx.fillRect(lPos.x - boxW/2 + 8, lPos.y + 4, boxW - 16, 30);
        }
        
        // Render associated waste units uniformly relative to localized coordinate indexes
        this.activePet.poops.forEach(p => {
            let poopyY = p.isCeil ? 90 : lPos.y + 24;
            let poopyX = (lPos.x - boxW/2 + 20) + p.ox % (boxW - 40);
            this.ctx.font = "14px Arial";
            this.ctx.fillText(p.isCeil ? "🕸️" : "💩", poopyX, poopyY);
        });
        // Fluid Goldfish bubble update execution loops
        if (this.registry.activeSpecies === "goldfish") {
            this.state.goldfishBubbles.forEach((bubble, idx) => {
                bubble.y -= 1.2;
                bubble.x += Math.sin(t*0.05 + idx)*0.5;
                this.ctx.strokeStyle = `rgba(135, 206, 250, ${bubble.alpha})`;
                this.ctx.fillStyle = `rgba(173, 216, 230, ${bubble.alpha * 0.3})`;
                this.ctx.beginPath(); this.ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI*2);
                this.ctx.fill(); this.ctx.stroke();
                if(bubble.y < 50) this.state.goldfishBubbles.splice(idx,1);
            });
        }

        // Global Nyan Overlay Frame Generation Engine Matrix
        if (this.state.action === "nyan") {
            const colors = ["#ff0000", "#ff9900", "#ffff00", "#33ff00", "#0099ff", "#6633ff"];
            this.ctx.globalAlpha = this.state.nyanPhase === "flying" ? 1.0 : 0.4;
            for (let segment = 0; segment < 8; segment++) {
                const segOffset = segment * 35;
                const timeOffset = segment * 2;
                colors.forEach((col, i) => {
                    this.ctx.fillStyle = col;
                    const segY = (this.state.nyanPhase === "flying") ? (visibleH / 2) + Math.sin((t - timeOffset) * 0.1) * 100 : this.state.y; 
                    const wiggle = Math.cos((t - timeOffset) * 0.2 + i) * 5;
                    this.ctx.fillRect(this.state.x - (this.state.facing * (60 + segOffset)), segY - 15 + (i * 6) + wiggle, 40, 6);
                });
            }
            this.ctx.globalAlpha = 1.0;
        }

        // Global Particle Physics Array Stack Processing
        this.state.particles.forEach((p, i) => {
            this.ctx.fillStyle = p.c; this.ctx.globalAlpha = p.life / 30;
            this.ctx.fillRect(p.x, p.y, p.s, p.s); this.ctx.globalAlpha = 1.0;
            p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life--;
            if(p.life <= 0) this.state.particles.splice(i, 1);
        });
    }

    // ==========================================
    // CORE VISUAL RENDERING ROUTERS PER SPECIES
    // ==========================================
    
    drawKitty(t, scale) {
        this.ctx.save();
        const stateOffsets = { "sleep": 15, "tower_sleep": 15, "walk": 5, "idle": 0 };
        const baseOffset = stateOffsets[this.state.action] || 0;
        const bounce = (this.state.action === "dance") ? Math.abs(Math.sin(t * 0.2)) * 25 : 0;
        
        this.ctx.translate(this.state.x, this.state.y - bounce + baseOffset);
        this.ctx.scale(this.state.facing * scale, scale);
        
        this.ctx.fillStyle = "rgba(0,0,0,0.1)";
        this.ctx.beginPath(); this.ctx.ellipse(0, 30 + bounce - baseOffset, 45, 12, 0, 0, Math.PI*2); this.ctx.fill();

        let finalColor = this.activePet.isDead ? "#ffffff" : (this.activePet.poops.length > 5 ? "#8edb4b" : this.activePet.color);
        if(this.activePet.isDead) this.ctx.globalAlpha = 0.5;
        this.ctx.fillStyle = finalColor;

        if (this.state.action === "sleep" || this.state.action === "tower_sleep") {
            const breathing = Math.sin(t * 0.03) * 2.5;
            this.ctx.beginPath(); this.ctx.ellipse(0, 12, 42 + breathing, 32 + breathing, 0, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.arc(15, 8, 22, 0, Math.PI*2); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.lineWidth = 11; this.ctx.lineCap = "round"; this.ctx.strokeStyle = finalColor;
            this.ctx.arc(0, 18, 36, 0.5 * Math.PI, 1.4 * Math.PI); this.ctx.stroke();
            this.drawkittyEars(15, 8, finalColor, true); this.drawkittyFace(15, 8, false, true);
        } else if (this.state.action === "special" || this.state.action === "scratching" || this.state.action === "trick") {
            if (this.state.action === "special") this.drawYarn(30, 20, t);
            let rot = (this.state.action === "trick") ? (t * 0.25) : 0;
            this.ctx.rotate(rot);

            this.ctx.beginPath(); this.ctx.ellipse(0, 0, 32, 42, 0, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.arc(0, -45, 24, 0, Math.PI*2); this.ctx.fill();
            if (this.state.action === "special") {
                const reach = Math.sin(t * 0.2) * 15;
                this.ctx.fillRect(10, -5 + reach, 10, 15); this.ctx.fillRect(-20, -5 - reach, 10, 15);
            } else {
                this.ctx.fillRect(15, -25 + Math.sin(t*0.5)*5, 8, 15); this.ctx.fillRect(5, -35 + Math.sin(t*0.5)*5, 8, 15);
            }
            this.drawkittyEars(0, -45, finalColor, false); this.drawkittyFace(0, -45, false, false);
        } else {
            this.ctx.beginPath(); this.ctx.ellipse(0, 0, 48, 30, 0, 0, Math.PI * 2); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.arc(35, -15, 24, 0, Math.PI*2); this.ctx.fill();
            this.drawkittyEars(35, -15, finalColor, false);
            const walkCycle = (this.state.action.includes("walk")) ? Math.sin(t * 0.18) : 0;
            [[-35, 12], [-12, 12], [10, 12], [28, 12]].forEach((p, i) => {
                this.ctx.fillRect(p[0], p[1], 9, 16 + (i % 2 === 0 ? walkCycle : -walkCycle) * 8);
            });
            this.ctx.beginPath(); this.ctx.lineWidth = 8; this.ctx.lineCap = "round"; this.ctx.strokeStyle = finalColor;
            this.ctx.moveTo(-45, 0); this.ctx.bezierCurveTo(-65, 10, -80 + Math.sin(t * 0.06) * 18, -35, -60, -65); this.ctx.stroke();
            this.drawkittyFace(35, -15, this.state.action === "beg", false);
        }
        this.ctx.restore();
    }
    
    drawkittyEars(x, y, color, sleeping) {
        this.ctx.fillStyle = color;
        if (sleeping) {
            this.ctx.beginPath(); this.ctx.moveTo(x - 15, y - 8); this.ctx.lineTo(x - 22, y + 2); this.ctx.lineTo(x - 5, y + 5); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.moveTo(x + 15, y - 8); this.ctx.lineTo(x + 22, y + 2); this.ctx.lineTo(x + 5, y + 5); this.ctx.fill();
        } else {
            this.ctx.beginPath(); this.ctx.moveTo(x - 20, y - 10); this.ctx.lineTo(x - 12, y - 40); this.ctx.lineTo(x - 2, y - 15); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.moveTo(x + 20, y - 10); this.ctx.lineTo(x + 12, y - 40); this.ctx.lineTo(x + 2, y - 15); this.ctx.fill();
        }
    }

    drawkittyFace(x, y, begging, sleeping) {
        if (sleeping) {
            this.ctx.strokeStyle = "rgba(0,0,0,0.5)"; this.ctx.lineWidth = 2;
            this.ctx.beginPath(); this.ctx.arc(x - 7, y + 2, 5, 0.1 * Math.PI, 0.9 * Math.PI); this.ctx.stroke();
            this.ctx.beginPath(); this.ctx.arc(x + 9, y + 2, 5, 0.1 * Math.PI, 0.9 * Math.PI); this.ctx.stroke();
        } else {
            this.ctx.fillStyle = "white"; this.ctx.beginPath(); this.ctx.arc(x - 7, y - 5, 6, 0, Math.PI*2); this.ctx.arc(x + 9, y - 5, 6, 0, Math.PI*2); this.ctx.fill();
            this.ctx.fillStyle = "black"; this.ctx.beginPath(); this.ctx.arc(x - 6, y - 5, 2.5, 0, Math.PI*2); this.ctx.arc(x + 10, y - 5, 2.5, 0, Math.PI*2); this.ctx.fill();
        }
        this.ctx.strokeStyle = "rgba(255,255,255,0.4)"; this.ctx.lineWidth = 1;
        [0, 1, 2].forEach(i => {
           this.ctx.beginPath(); this.ctx.moveTo(x+12, y+2*i); this.ctx.lineTo(x+30, y-8+8*i); this.ctx.stroke();
           this.ctx.beginPath(); this.ctx.moveTo(x-10, y+2*i); this.ctx.lineTo(x-28, y-8+8*i); this.ctx.stroke();
        });
        this.ctx.fillStyle = "#ffaaaa";
        if (begging) { this.ctx.beginPath(); this.ctx.arc(x+1, y+8, 4, 0, Math.PI*2); this.ctx.fill(); }
        else { this.ctx.beginPath(); this.ctx.moveTo(x+1, y+3); this.ctx.lineTo(x-2, y); this.ctx.lineTo(x+4, y); this.ctx.fill(); }
    }

    // ==========================================
    // NEW COMPANION ADDITION 1: PUPPY ENGINE
    // ==========================================
    drawPuppy(t, scale) {
        this.ctx.save();
        const bounce = (this.state.action === "dance") ? Math.abs(Math.sin(t * 0.25)) * 20 : 0;
        let rotationAngle = (this.state.action === "trick") ? (t * 0.2) : 0;

        this.ctx.translate(this.state.x, this.state.y - bounce);
        this.ctx.rotate(rotationAngle);
        this.ctx.scale(this.state.facing * scale, scale);

        // Ground shadow
        this.ctx.fillStyle = "rgba(0,0,0,0.1)";
        this.ctx.beginPath(); this.ctx.ellipse(0, 25, 48, 14, 0, 0, Math.PI*2); this.ctx.fill();

        let baseColor = this.activePet.isDead ? "#dddddd" : (this.activePet.poops.length > 5 ? "#a1d95d" : this.activePet.color);
        if(this.activePet.isDead) this.ctx.globalAlpha = 0.4;
        this.ctx.fillStyle = baseColor;

        if (this.state.action === "sleep" || this.state.action === "tower_sleep") {
            // Curled up sleeping puppy dog matrix
            const breath = Math.sin(t * 0.04) * 2;
            this.ctx.beginPath(); this.ctx.ellipse(0, 10, 46 + breath, 34 + breath, 0, 0, Math.PI*2); this.ctx.fill();
            this.ctx.fillStyle = "#5d4037"; // Dark snout spot preset
            this.ctx.beginPath(); this.ctx.arc(20, 14, 10, 0, Math.PI*2); this.ctx.fill();
        } else {
            // Standard dynamic standing/walking framework puppy body
            this.ctx.beginPath(); this.ctx.ellipse(-5, 2, 45, 28, 0, 0, Math.PI*2); this.ctx.fill();
            
            // Canine head structure positioning
            this.ctx.beginPath(); this.ctx.arc(30, -22, 22, 0, Math.PI*2); this.ctx.fill();
            
            // Snout / Muzzle asset layer injection
            this.ctx.fillStyle = "rgba(255,255,255,0.2)";
            this.ctx.beginPath(); this.ctx.ellipse(40, -18, 12, 9, 0, 0, Math.PI*2); this.ctx.fill();
            this.ctx.fillStyle = "black";
            this.ctx.beginPath(); this.ctx.arc(48, -20, 3, 0, Math.PI*2); this.ctx.fill(); // Nose node

            // Floppy canine ear rendering logic arrays
            this.ctx.fillStyle = baseColor;
            this.ctx.beginPath(); this.ctx.ellipse(22, -24, 8, 18, 0.2, 0, Math.PI*2); this.ctx.fill();
            this.ctx.fillStyle = "#3e2723"; // Inner contrast ear profile
            this.ctx.beginPath(); this.ctx.ellipse(22, -22, 5, 12, 0.2, 0, Math.PI*2); this.ctx.fill();

            // Eyes injection matrix
            this.ctx.fillStyle = "white";
            this.ctx.beginPath(); this.ctx.arc(34, -28, 5, 0, Math.PI*2); this.ctx.fill();
            this.ctx.fillStyle = "black";
            this.ctx.beginPath(); this.ctx.arc(36, -28, 2, 0, Math.PI*2); this.ctx.fill();

            // Happy tail wag engine logic loop speed mapping
            const wagSpeed = (this.state.action === "walk" || this.state.hasFood) ? 0.6 : 0.2;
            const tailWag = Math.sin(t * wagSpeed) * 0.4 - 0.5;
            this.ctx.save();
            this.ctx.translate(-42, -5);
            this.ctx.rotate(tailWag);
            this.ctx.fillStyle = baseColor;
            this.ctx.fillRect(-22, -6, 24, 10);
            this.ctx.restore();

            // Dynamic walking kinematic legs matrix mapping array strings
            const legSwing = (this.state.action === "walk") ? Math.sin(t * 0.22) * 10 : 0;
            this.ctx.fillStyle = baseColor;
            this.ctx.fillRect(-35, 15, 11, 16 + legSwing);
            this.ctx.fillRect(-15, 15, 11, 16 - legSwing);
            this.ctx.fillRect(10, 15, 11, 16 + legSwing);
            this.ctx.fillRect(25, 15, 11, 16 - legSwing);

            if (this.state.action === "special") this.drawYarn(40, 0, t);
        }
        this.ctx.restore();
    }

    // ==========================================
    // NEW COMPANION ADDITION 2: SPIDER COMPANION
    // ==========================================
    drawSpider(t, scale) {
        this.ctx.save();
        
        // Spider handles inversion mapping layout calculations smoothly
        this.ctx.translate(this.state.x, this.state.y);
        this.ctx.scale(this.state.facing * scale, scale);

        let spiderColor = this.activePet.isDead ? "#777777" : this.activePet.color;
        if(this.activePet.isDead) this.ctx.globalAlpha = 0.3;
        this.ctx.fillStyle = spiderColor;
        this.ctx.strokeStyle = spiderColor;
        this.ctx.lineWidth = 3;

        // Ceil ceiling support hanging web element thread lines
        this.ctx.strokeStyle = "rgba(255,255,255,0.15)";
        this.ctx.lineWidth = 1;
        this.ctx.beginPath(); this.ctx.moveTo(0,0); this.ctx.lineTo(0, -this.state.y); this.ctx.stroke();

        this.ctx.fillStyle = spiderColor;
        this.ctx.strokeStyle = spiderColor;
        this.ctx.lineWidth = 3.5;

        // Base structural body spheres: Abdomen & Cephalothorax
        this.ctx.beginPath(); this.ctx.arc(-16, 0, 18, 0, Math.PI*2); this.ctx.fill(); // Main abdomen sphere
        this.ctx.beginPath(); this.ctx.arc(8, -2, 12, 0, Math.PI*2); this.ctx.fill();  // Head cluster body sphere

        // Dynamic multi-leg procedural animation arrays loops
        const legWave = (this.state.action === "walk") ? Math.sin(t * 0.25) * 8 : 0;
        
        for(let i=0; i<4; i++) {
            let offsetPhase = i * 0.4;
            let dynamicSwing = (this.state.action === "walk") ? Math.sin(t * 0.22 + offsetPhase) * 12 : 0;

            // Left Side Extended Legs Representation Matrix Channels
            this.ctx.beginPath();
            this.ctx.moveTo(0, -2);
            this.ctx.lineTo(-10 - (i*8), -24 - (Math.sin(t*0.1 + i)*4) + dynamicSwing);
            this.ctx.lineTo(-20 - (i*14), 18 + legWave);
            this.ctx.stroke();

            // Right Side Legs Representation Matrix Channels
            this.ctx.beginPath();
            this.ctx.moveTo(4, -2);
            this.ctx.lineTo(15 + (i*8), -22 - (Math.cos(t*0.1 + i)*4) - dynamicSwing);
            this.ctx.lineTo(24 + (i*14), 18 - legWave);
            this.ctx.stroke();
        }

        // Spider Red Arachnid Eye Clusters Array Rendering
        this.ctx.fillStyle = this.activePet.isDead ? "black" : "#ff1744";
        let eyeOffsets = [[12, -6], [16, -5], [14, -2], [18, -1], [10, -2], [14, 2]];
        eyeOffsets.forEach(pos => {
            this.ctx.beginPath(); this.ctx.arc(pos[0], pos[1], 1.5, 0, Math.PI*2); this.ctx.fill();
        });

        if (this.state.action === "special") this.drawYarn(25, 10, t);

        this.ctx.restore();
    }

    // ==========================================
    // NEW COMPANION ADDITION 3: GOLDFISH MODULE
    // ==========================================
    drawGoldfish(t, scale) {
        this.ctx.save();
        
        // Float logic vector transformation mapping rules
        this.ctx.translate(this.state.x, this.state.y);
        this.ctx.scale(this.state.facing * scale, scale);

        let fishColor = this.activePet.isDead ? "#e0e0e0" : this.activePet.color;
        if(this.activePet.isDead) {
            this.ctx.globalAlpha = 0.4;
            this.ctx.rotate(Math.PI); // Float inverted upside down if deceased
        }
        this.ctx.fillStyle = fishColor;

        // Main structural streamlined fluid teardrop body mesh representation
        this.ctx.beginPath(); 
        this.ctx.ellipse(0, 0, 36, 22, 0, 0, Math.PI*2); 
        this.ctx.fill();

        // Elegant wavy tail fin architecture loops
        const tailWiggle = Math.sin(t * 0.28) * 12;
        this.ctx.beginPath();
        this.ctx.moveTo(-32, 0);
        this.ctx.bezierCurveTo(-55, -25 + tailWiggle, -65, -10 + tailWiggle, -58, tailWiggle);
        this.ctx.bezierCurveTo(-65, 10 + tailWiggle, -55, 25 + tailWiggle, -32, 0);
        this.ctx.fillStyle = fishColor;
        this.ctx.fill();
        
        // Secondary sheer internal accent layer mapping lines for fins
        this.ctx.fillStyle = "rgba(255,255,255,0.3)";
        this.ctx.beginPath();
        this.ctx.moveTo(-32,0);
        this.ctx.lineTo(-52, -15 + tailWiggle);
        this.ctx.lineTo(-50, 15 + tailWiggle);
        this.ctx.fill();

        // Dorsal Top fin architecture layer
        this.ctx.fillStyle = fishColor;
        this.ctx.beginPath();
        this.ctx.moveTo(-10, -20);
        this.ctx.bezierCurveTo(-5, -38, -25, -32, -22, -14);
        this.ctx.fill();

        // Pectoral steering fin animation wave parameters
        const finWave = Math.sin(t * 0.12) * 8;
        this.ctx.save();
        this.ctx.translate(10, 8);
        this.ctx.rotate(finWave * Math.PI / 180);
        this.ctx.beginPath(); this.ctx.ellipse(0, 0, 14, 8, 0.5, 0, Math.PI*2); this.ctx.fill();
        this.ctx.restore();

        // Large glassy aquatic eye sockets arrays logic
        this.ctx.fillStyle = "white";
        this.ctx.beginPath(); this.ctx.arc(20, -6, 7, 0, Math.PI*2); this.ctx.fill();
        this.ctx.fillStyle = "black";
        this.ctx.beginPath(); this.ctx.arc(22, -6, 3.5, 0, Math.PI*2); this.ctx.fill();
        this.ctx.fillStyle = "white";
        this.ctx.beginPath(); this.ctx.arc(24, -8, 1, 0, Math.PI*2); this.ctx.fill(); // Highlight node

        if (this.state.action === "special") this.drawYarn(30, -5, t);

        this.ctx.restore();
    }
}