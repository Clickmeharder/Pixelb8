/**
 * 🐾 StreamPet Widget Module
 * Follows the hot-swappable monolithic component structure.
 */
export class StreamPet {
	constructor() {
        console.log("🐾 [Pet Widget]: Initializing Core...");
        
        // --- 1. DYNAMIC VIEWPORT INJECTION ---
        const overlayWrapper = document.getElementById("overlay-wrapper");
        if (!overlayWrapper) {
            console.error("❌ [Pet Widget Error]: #overlay-wrapper element not found in DOM.");
            return;
        }

        // Only inject if it doesn't already exist
        if (!document.getElementById("pet-widget")) {
            const petViewport = document.createElement("div");
            petViewport.id = "pet-widget";
			petViewport.classList.add("p8-widget");
            petViewport.style.zIndex = "101";
            petViewport.innerHTML = `
                <div id="bubble" class="chat-bubble"></div>
                <div id="nameplate">Loading...</div>
                <canvas id="companionCanvas"></canvas>
                <div id="status">❤️ Greta | EXP 0</div>
            `;
            overlayWrapper.appendChild(petViewport);
            console.log("🐾 [Pet Widget]: Viewport DOM elements injected into overlay-wrapper.");
        }

        // Now safe to pull nodes out of our newly generated markup
        this.canvas = document.getElementById("companionCanvas");
        this.ctx = this.canvas.getContext("2d");

        // --- 2. CORE STATE SETUP ---
        this.KITTY_COLORS = ["#E67E22", "#95A5A6", "#2C3E50", "#ECF0F1", "#BDC3C7", "#D35400"];
        this.BED_PRESETS = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22", "#ffffff", "#333333"];
        this.HUNGER_TICK_MS = 144000; 
        this.BASE_FLOOR_Y = 110;

		this.state = {
            twitchUser: "",
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
            originalPos: { x: 0, y: 0 },
            nyanTimer: 0,
            nyanPhase: "takeoff",
            x: 200,
            y: window.innerHeight - 150,
            facing: 1,
            action: "idle",
            actionTimer: 300,
            animT: 0,
            poops: [],
            hasFood: false,
            particles: [],
            zoom: 0, // Default range value matching input slider base slider 0
            dimensions: {
                width: "", height: "", left: "", top: ""
            },
            layout: {
                nameX: 50, nameY: 70,
                statsX: 50, statsY: 90,
                bedX: 20, bedY: 0,
                bowlX: 45, bowlY: 0,
                litterX: 90, litterY: 0,
                towerX: 70, towerY: 0,
                showTower: true,
                bedColor: "#e74c3c"
            }
        };
        // --- 2. SOUND SYSTEM INITIALIZATION ---
        const defaultSoundSettings = {
            masterEnabled: true,
            meowSound: true,
            purrSound: true,
            nyanSound: true,
            mewSound: true,
            customPaths: {}
        };

        this.defaultPaths = {
            meowSound: '../assets/sounds/meowSound.mp3',
            mewSound: '../assets/sounds/mewSound.mp3',
            purrSound: '../assets/sounds/purrSound.mp3',
            nyanSound: '../assets/sounds/nyanSound.mp3'
        };

        const savedSoundSettings = localStorage.getItem('pixelkitty_sound_settings');
        window.soundSettings = savedSoundSettings ? JSON.parse(savedSoundSettings) : defaultSoundSettings;

        this.audioAssets = {};
        Object.keys(this.defaultPaths).forEach(key => this.refreshAudioInstance(key));

        // --- 3. DYNAMIC UI INJECTION ---
        this.injectUI();

        // --- 4. RUN LIFECYCLE INITIALIZATION ---
        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.loadData();
        
        // Start Loops
        this.saveInterval = setInterval(() => this.saveData(), 5000);
        this.animate = this.animate.bind(this);
        this.animate();

        this.bindUIEventListeners();
		this.initPersistenceObservers();
    }

    // --- CHAT COMMAND ROUTER ---
	getCommands(sendNotice) {
        const petExecution = (user, message, flags) => {
            const parts = message.trim().toLowerCase().split(/\s+/);
            const subCommand = parts[0];
            const isAdmin = flags.broadcaster || flags.mod;

            let actualSub = subCommand;
            
            if (this.state.isDead && actualSub !== 'revive' && actualSub !== 'status' && actualSub !== 'stats') {
                sendNotice(`🪦 [Pet]: ${this.state.name} is currently deceased. Use !pet revive or use the control panel to save them!`);
                return;
            }

            if (!actualSub) {
                sendNotice(`🐾 [Pet]: Available options: !pet [feed | play | dance | treat | status]`);
                return;
            }

            switch (actualSub) {
                case 'help':
                case 'h':
                    sendNotice(`🐾 [Pet Help]: !pet feed | !pet play | !pet dance | !pet treat | !pet status`);
                    if (isAdmin) sendNotice(`🛠️ [Admin]: !pet [nyan | revive | clear]`);
                    break;

                case 'feed':
                case 'food':
                case 'fish':
                    if (!this.state.hasFood) {
                        this.state.hasFood = true;
                        this.say("Food! 🐟");
                        sendNotice(`🐟 [Pet]: ${user} dropped a fish for ${this.state.name}!`);
                    } else {
                        sendNotice(`🍽️ [Pet]: There is already food in the bowl!`);
                    }
                    break;

                case 'play':
                case 'yarn':
                    this.state.action = "special";
                    this.state.actionTimer = 350;
                    this.say("Play! 🧶");
                    sendNotice(`🧶 [Pet]: ${user} tossed a ball of yarn to ${this.state.name}!`);
                    break;

                case 'dance':
                    this.state.action = "dance";
                    this.state.actionTimer = 300;
                    this.say("Dance! ✨");
                    break;

                case 'treat':
                case 'nom':
                    this.state.hunger = Math.max(0, this.state.hunger - 5);
                    this.state.action = "special";
                    this.state.actionTimer = 200;
                    this.say("NOM NOM NOM! 🍗");
                    break;

                case 'status':
                case 'stats':
                    let healthTxt = this.state.poops.length > 5 ? "SICK" : "HEALTHY";
                    sendNotice(`🐾 [${this.state.name}]: Age: ${this.state.ageDays}d | Hunger: ${this.state.hunger}% | Mood: ${healthTxt} | EXP: ${this.state.exp}`);
                    break;

                case 'nyan':
                case 'rainbow':
                    if (isAdmin) {
                        this.triggerNyan();
                        sendNotice(`🌈 [Pet]: NYAN OVERDRIVE ACTIVATED BY STAFF!`);
                    }
                    break;

                case 'revive':
                    if (isAdmin || this.state.exp > 100) {
                        this.reviveKitty();
                        sendNotice(`💖 [Pet]: ${this.state.name} was successfully revived by ${user}!`);
                    } else {
                        sendNotice(`❌ [Pet]: Only staff or high EXP users can revive ${this.state.name}!`);
                    }
                    break;

                case 'clear':
                case 'clean':
                    this.state.poops = [];
                    this.say("Fresh sand! ✨");
                    sendNotice(`🧹 [Pet]: ${user} scooped the litter box!`);
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
            { name: 'clean', adminOnly: false, execute: (user, message, flags) => petExecution(user, 'clean', flags) },
            { name: 'status', adminOnly: false, execute: (user, message, flags) => petExecution(user, 'status', flags) },
            { name: 'nyan', adminOnly: true, execute: (user, message, flags) => petExecution(user, 'nyan', flags) },
            { name: 'revive', adminOnly: false, execute: (user, message, flags) => petExecution(user, 'revive', flags) }
        ];
	}

	static get controlsTemplate() {
		const layoutMetrics = [
			["name", "Nameplate X/Y", 50, 70, 0, 100],
			["stats", "Stats X/Y", 50, 90, 0, 100],
			["bed", "Cat Bed X/Y", 20, 100, 0, 100],     
			["bowl", "Food Bowl X/Y", 45, 100, 0, 100],   
			["litter", "Litter Box X/Y", 90, 100, 0, 100], 
			["tower", "Tower X/Y", 70, 100, 0, 100]       
		];

        const audioTracks = [
            { key: "meowSound", label: "😺 Standard Meow" },
            { key: "mewSound", label: "😾 Baby Mew" },
            { key: "purrSound", label: "💤 Content Purr" },
            { key: "nyanSound", label: "🌈 Space Nyan Theme Loop" }
        ];

        return `
            <div class="collapsible-header" onclick="this.parentElement.classList.toggle('collapsed')">
                <span>🐾 Interactive Pet Module</span>
                <span class="collapse-icon">▼</span>
            </div>
            <div class="collapsible-content">
                <div style="display: flex; flex-direction: column; gap: 12px;">
                    
                    <div style="background: #141414; padding: 10px; border-radius: 6px; border: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
                        <label style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px;">Identity & Feed</label>
                        <input type="text" id="nameInput" class="p8-input" placeholder="Pet Name (e.g., Greta)" style="background: #1c1c1f; border: 1px solid #3f3f46; color: #fff; height: 28px; padding: 0 8px; font-size: 12px; border-radius: 4px;">
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                        <button type="button" id="btnFeed" class="p8-btn" style="padding: 6px 0; background: #1e3a8a; border: 1px solid #3b82f6; font-size: 11px;">🐟 FEED FISH</button>
                        <button type="button" id="btnTreat" class="p8-btn" style="padding: 6px 0; background: #7c2d12; border: 1px solid #ea580c; font-size: 11px;">🍗 GIVE TREAT</button>
                        <button type="button" id="btnPlay" class="p8-btn" style="padding: 6px 0; background: #581c87; border: 1px solid #a855f7; font-size: 11px;">🧶 PLAY YARN</button>
                        <button type="button" id="btnDance" class="p8-btn" style="padding: 6px 0; background: #065f46; border: 1px solid #10b981; font-size: 11px;">✨ DANCE</button>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
                        <button type="button" id="btnClear" class="p8-btn alt-btn" style="padding: 6px 0; background: #27272a; font-size: 11px;">🧹 CLEAN LITTER</button>
                        <button type="button" id="btnRevive" class="p8-btn" style="padding: 6px 0; background: #991b1b; font-size: 11px;" onclick="if(window.petWidgetInstance) window.petWidgetInstance.reviveKitty();">💖 REVIVE PET</button>
                    </div>

                    <details style="border: 1px solid #27272a; border-radius: 6px; background: #18181b;">
                        <summary style="padding: 8px 10px; cursor: pointer; font-weight: bold; font-size: 12px; color: #fff; outline: none;">📐 Layout & Environment</summary>
                        <div style="padding: 10px; border-top: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
                            <div style="display: flex; flex-direction: column; gap: 4px; padding-bottom: 8px; border-bottom: 1px solid #27272a;">
								<div style="display: flex; justify-content: space-between; font-size: 11px; color: #a1a1aa;">
									<span>Canvas Zoom Scaling</span>
									<span id="zoomValue" style="color: #0ec3c3; font-weight: bold;">1.0x</span>
								</div>
								<input type="range" id="canvasZoom" min="-2" max="2" step="0.1" value="0" style="width: 100%;">
							</div>

                            <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
                                <span>Show Cat Tower</span>
                                <input type="checkbox" id="showTower" checked>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
                                <span style="font-size: 11px; color: #a1a1aa;">Bed Fabric Accent Color:</span>
                                <div id="bedColorSwatches" style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 2px;"></div>
                            </div>
                            <div style="display: grid; grid-template-columns: 70px 1fr; gap: 6px; align-items: center; font-size: 11px; color: #a1a1aa;">
                                    ${layoutMetrics.map(([id, label, xVal, yVal, minY, maxY]) => `
                                        <span>${label}</span>
                                        <div style="display: flex;flex-direction:column; gap: 4px;">
                                            <input type="range" id="${id}X" min="0" max="100" value="${xVal}" style="flex:1;">
                                            <input type="range" id="${id}Y" min="${minY}" max="${maxY}" value="${yVal}" style="flex:1;">
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </details>

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
        console.log("🐾 [Pet Widget]: Interface Injected into control panel hierarchy.");
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

	resize() {
		const parentW = window.innerWidth;
		const parentH = window.innerHeight;

		this.canvas.width = parentW + 200;
		this.canvas.height = parentH + 200;
		this.ctx.imageSmoothingEnabled = false;
	}

	getPos(pctX, pctY, offY = 0) {
		const visibleW = this.canvas.width - 200;
		const visibleH = this.canvas.height - 200;

		let rawSliderVal = (this.state.zoom === undefined) ? 0 : this.state.zoom;
		let scaleVal = rawSliderVal >= 0 ? 1.0 + (rawSliderVal * 0.5) : 1.0 + (rawSliderVal * 0.25);

		const anchorX = visibleW / 2;
		const anchorY = visibleH - this.BASE_FLOOR_Y;

		const targetX = (pctX / 100) * window.innerWidth;
		const targetY = (pctY / 100) * window.innerHeight;

		const finalX = anchorX + (targetX - anchorX) / scaleVal;
		const finalY = anchorY + (targetY - anchorY) / scaleVal;

		return {
			x: finalX,
			y: finalY + offY
		};
	}

	say(txt) {
		const b = document.getElementById("bubble");
		if (!b) return;
		b.textContent = txt; 
		b.style.left = (this.state.x - 50) + "px"; 
		b.style.top = (this.state.y - 140) + "px";
		b.classList.add("show"); 
		
		if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
		this.bubbleTimeout = setTimeout(() => b.classList.remove("show"), 3000);

		if (txt.includes("Meow")) this.playSound('meowSound');
		if (txt.includes("Mew")) this.playSound('mewSound');
		if (txt.includes("Purrr")) this.playSound('purrSound');
	}

	triggerNyan() {
		if (this.state.isDead || this.state.action === "nyan") return;
		this.state.originalPos = { x: this.state.x, y: this.state.y };
		this.state.action = "nyan";
		this.state.nyanPhase = "takeoff";
		this.state.actionTimer = 400;
		this.playSound('nyanSound');
		this.say("NYAN NYAN NYAN! 🌈");
	}

	animate = () => {
		this.state.animT++;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.updateAI(this.state.animT);

		this.ctx.save();
		
		this.ctx.translate(100, 100);

		let rawSliderVal = (this.state.zoom === undefined) ? 0 : this.state.zoom;
		let scaleVal = rawSliderVal >= 0 ? 1.0 + (rawSliderVal * 0.5) : 1.0 + (rawSliderVal * 0.25);

		const visibleW = this.canvas.width - 200;
		const visibleH = this.canvas.height - 200;
		const anchorX = visibleW / 2;
		const anchorY = visibleH - this.BASE_FLOOR_Y;

		this.ctx.translate(anchorX, anchorY);
		this.ctx.scale(scaleVal, scaleVal);
		this.ctx.translate(-anchorX, -anchorY);

		this.drawEnvironment(this.state.animT);

		let petScale = 1.0;
		if (this.state.stage === "Baby") petScale = 0.6;
		if (this.state.stage === "Juvenile") petScale = 0.8;

		this.drawKitty(this.state.animT, petScale);
		
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
		this.ctx.fillStyle = "#e74c3c";
		this.ctx.beginPath(); this.ctx.arc(0, 12, 12, 0, Math.PI*2); this.ctx.fill();
		this.ctx.strokeStyle = "#c0392b";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath(); this.ctx.arc(0, 0, 8, 0, Math.PI); this.ctx.stroke();
		this.ctx.beginPath(); this.ctx.moveTo(-12, 0); this.ctx.lineTo(12, -5); this.ctx.stroke();
		this.ctx.beginPath(); this.ctx.moveTo(-12, 5); this.ctx.bezierCurveTo(-20, 15, -30, 0, -45, 10); this.ctx.stroke();
		this.ctx.restore();
	}

	drawEnvironment(t) {
		const bPos = this.getPos(this.state.layout.bedX, this.state.layout.bedY);
		this.ctx.fillStyle = "rgba(0,0,0,0.1)";
		this.ctx.beginPath(); this.ctx.ellipse(bPos.x, bPos.y + 10, 70, 25, 0, 0, Math.PI*2); this.ctx.fill();
		this.ctx.fillStyle = this.state.layout.bedColor;
		this.ctx.beginPath(); this.ctx.ellipse(bPos.x, bPos.y + 5, 60, 20, 0, 0, Math.PI*2); this.ctx.fill();

		if (this.state.layout.showTower) {
			const tPos = this.getPos(this.state.layout.towerX, this.state.layout.towerY);
			this.ctx.fillStyle = "rgba(0,0,0,0.1)"; this.ctx.fillRect(tPos.x - 60, tPos.y + 5, 120, 20); 
			this.ctx.fillStyle = "#7f8c8d"; this.ctx.fillRect(tPos.x - 50, tPos.y - 5, 100, 15); 
			this.ctx.fillStyle = "#a67c52"; this.ctx.fillRect(tPos.x - 10, tPos.y - 120, 20, 120); 
			this.ctx.fillStyle = "#95a5a6"; this.ctx.fillRect(tPos.x - 40, tPos.y - 60, 80, 10); this.ctx.fillRect(tPos.x - 30, tPos.y - 125, 60, 10); 
		}

		const fPos = this.getPos(this.state.layout.bowlX, this.state.layout.bowlY);
		this.ctx.fillStyle = "rgba(0,0,0,0.2)"; this.ctx.beginPath(); this.ctx.ellipse(fPos.x, fPos.y + 5, 35, 10, 0, 0, Math.PI*2); this.ctx.fill();
		this.ctx.fillStyle = "#ecf0f1"; this.ctx.beginPath(); this.ctx.ellipse(fPos.x, fPos.y, 32, 12, 0, 0, Math.PI*2); this.ctx.fill();
		this.ctx.fillStyle = "#bdc3c7"; this.ctx.beginPath(); this.ctx.ellipse(fPos.x, fPos.y - 3, 30, 9, 0, 0, Math.PI*2); this.ctx.fill();
		if(this.state.hasFood) {
			this.ctx.fillStyle = "#d35400"; this.ctx.beginPath(); this.ctx.ellipse(fPos.x, fPos.y - 4, 18, 5, 0, 0, Math.PI*2); this.ctx.fill();
			this.ctx.font = "18px Arial"; this.ctx.fillText("🐟", fPos.x - 10, fPos.y - 6);
		}

		const lPos = this.getPos(this.state.layout.litterX, this.state.layout.litterY);
		const boxW = 150;
		this.ctx.fillStyle = "rgba(0,0,0,0.2)"; this.ctx.fillRect(lPos.x - boxW/2 + 5, lPos.y + 5, boxW, 50);
		this.ctx.fillStyle = "#2c3e50"; this.ctx.fillRect(lPos.x - boxW/2, lPos.y, boxW, 50);
		this.ctx.fillStyle = "#95a5a6"; this.ctx.fillRect(lPos.x - boxW/2 + 8, lPos.y + 5, boxW - 16, 38);
		this.state.poops.forEach(p => this.ctx.fillText("💩", (lPos.x - boxW/2 + 20) + p.ox % (boxW - 40), lPos.y + 30));

		if (this.state.action === "nyan") {
			const colors = ["#ff0000", "#ff9900", "#ffff00", "#33ff00", "#0099ff", "#6633ff"];
			const visibleW = this.canvas.width - 200;
			const visibleH = this.canvas.height - 200;
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

		this.state.particles.forEach((p, i) => {
			this.ctx.fillStyle = p.c; this.ctx.globalAlpha = p.life / 30;
			this.ctx.fillRect(p.x, p.y, p.s, p.s); this.ctx.globalAlpha = 1.0;
			p.x += p.vx; p.y += p.vy; p.vy += 0.3; p.life--;
			if(p.life <= 0) this.state.particles.splice(i, 1);
		});
	}

	drawKitty(t, scale) {
		this.ctx.save();
		let bounce = (this.state.action === "dance") ? Math.abs(Math.sin(t * 0.2)) * 25 : 0;
		this.ctx.translate(this.state.x, this.state.y - bounce);
		this.ctx.scale(this.state.facing * scale, scale);
		
		this.ctx.fillStyle = "rgba(0,0,0,0.1)";
		this.ctx.beginPath(); this.ctx.ellipse(0, 30 + bounce, 45, 12, 0, 0, Math.PI*2); this.ctx.fill();

		let finalColor = this.state.isDead ? "#ffffff" : (this.state.poops.length > 5 ? "#8edb4b" : this.state.color);
		if(this.state.isDead) this.ctx.globalAlpha = 0.5;
		this.ctx.fillStyle = finalColor;

		if (this.state.action === "sleep" || this.state.action === "tower_sleep") {
			const breathing = Math.sin(t * 0.03) * 2.5;
			this.ctx.beginPath(); this.ctx.ellipse(0, 12, 42 + breathing, 32 + breathing, 0, 0, Math.PI * 2); this.ctx.fill();
			this.ctx.beginPath(); this.ctx.arc(15, 8, 22, 0, Math.PI*2); this.ctx.fill();
			this.ctx.beginPath(); this.ctx.lineWidth = 11; this.ctx.lineCap = "round"; this.ctx.strokeStyle = finalColor;
			this.ctx.arc(0, 18, 36, 0.5 * Math.PI, 1.4 * Math.PI); this.ctx.stroke();
			this.drawkittyEars(15, 8, finalColor, true); this.drawkittyFace(15, 8, false, true);
		} 
		else if (this.state.action === "special" || this.state.action === "scratching") {
			if (this.state.action === "special") this.drawYarn(30, 20, t);
			const shake = (this.state.action === "scratching") ? Math.sin(t*0.5)*5 : 0;
			this.ctx.translate(shake, 0);
			this.ctx.beginPath(); this.ctx.ellipse(0, 0, 32, 42, 0, 0, Math.PI * 2); this.ctx.fill();
			this.ctx.beginPath(); this.ctx.arc(0, -45, 24, 0, Math.PI*2); this.ctx.fill();
			this.ctx.fillStyle = finalColor;
			if (this.state.action === "special") {
				const reach = Math.sin(t * 0.2) * 15;
				this.ctx.fillRect(10, -5 + reach, 10, 15); this.ctx.fillRect(-20, -5 - reach, 10, 15);
			} else {
				this.ctx.fillRect(15, -25 + Math.sin(t*0.5)*5, 8, 15); this.ctx.fillRect(5, -35 + Math.sin(t*0.5)*5, 8, 15);
			}
			this.drawkittyEars(0, -45, finalColor, false); this.drawkittyFace(0, -45, false, false);
		}
		else if (["groom", "potty", "kicking", "beg"].includes(this.state.action)) {
			this.ctx.beginPath(); this.ctx.ellipse(0, 0, 32, 42, 0, 0, Math.PI * 2); this.ctx.fill();
			this.ctx.beginPath(); this.ctx.arc(0, -45, 24, 0, Math.PI*2); this.ctx.fill();
			if (this.state.action === "kicking") {
				this.ctx.fillStyle = finalColor; this.ctx.fillRect(10, 10 + Math.sin(t * 0.5) * 15, 10, 15);
			}
			this.drawkittyEars(0, -45, finalColor, false); this.drawkittyFace(0, -45, this.state.action === "beg", false);
		}
		else {
			this.ctx.beginPath(); this.ctx.ellipse(0, 0, 48, 30, 0, 0, Math.PI * 2); this.ctx.fill();
			this.ctx.beginPath(); this.ctx.arc(35, -15, 24, 0, Math.PI*2); this.ctx.fill();
			this.drawkittyEars(35, -15, finalColor, false);
			const walkCycle = (this.state.action.includes("walk")) ? Math.sin(t * 0.18) : 0;
			[[-35, 12], [-12, 12], [10, 12], [28, 12]].forEach((p, i) => {
				this.ctx.fillRect(p[0], p[1], 9, 16 + (i % 2 === 0 ? walkCycle : -walkCycle) * 8);
			});
			this.ctx.beginPath(); this.ctx.lineWidth = 8; this.ctx.lineCap = "round"; this.ctx.strokeStyle = finalColor;
			this.ctx.moveTo(-45, 0); this.ctx.bezierCurveTo(-65, 10, -80 + Math.sin(t * 0.06) * 18, -35, -60, -65); this.ctx.stroke();
			this.drawkittyFace(35, -15, false, false);
		}
		this.ctx.restore();
	}

	drawkittyEars(x, y, color, sleeping) {
		this.ctx.fillStyle = color;
		if (sleeping) {
			this.ctx.beginPath(); this.ctx.moveTo(x - 15, y - 8); this.ctx.lineTo(x - 22, y + 2); this.ctx.lineTo(x - 5, y + 5); this.ctx.fill();
			this.ctx.beginPath(); this.ctx.moveTo(x + 15, y - 8); this.ctx.lineTo(x + 22, y + 2); this.ctx.lineTo(x + 5, y + 5); this.ctx.fill();
		} else {
			this.ctx.beginPath(); this.ctx.moveTo(x - 20, y - 10); this.ctx.lineTo(x - 12, y - 40); this.lineTo(x - 2, y - 15); this.ctx.fill();
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
		this.ctx.strokeStyle = "rgba(255,255,255,0.6)"; this.ctx.lineWidth = 1;
		[0, 1, 2].forEach(i => {
		   this.ctx.beginPath(); this.ctx.moveTo(x+12, y+2*i); this.ctx.lineTo(x+30, y-8+8*i); this.ctx.stroke();
		   this.ctx.beginPath(); this.ctx.moveTo(x-10, y+2*i); this.ctx.lineTo(x-28, y-8+8*i); this.ctx.stroke();
		});
		this.ctx.fillStyle = "#ffaaaa";
		if (begging) { this.ctx.beginPath(); this.ctx.arc(x+1, y+8, 4, 0, Math.PI*2); this.ctx.fill(); }
		else { this.ctx.beginPath(); this.ctx.moveTo(x+1, y+3); this.ctx.lineTo(x-2, y); this.ctx.lineTo(x+4, y); this.ctx.fill(); }
	}

	reviveKitty() {
		if (this.state.isDead) {
			this.state.isDead = false;
			this.state.hunger = 50; 
			this.state.action = "special";
			this.state.actionTimer = 200;
			this.state.lastHungerTick = Date.now();
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
		if (this.state.isDead) return;
		this.state.ageDays = Math.floor((Date.now() - this.state.birthday) / 86400000);
		this.state.stage = this.state.ageDays < 2 ? "Baby" : this.state.ageDays < 5 ? "Juvenile" : "Adult";

		const now = Date.now();
		const msElapsed = now - this.state.lastHungerTick;
		if (msElapsed >= this.HUNGER_TICK_MS) {
			this.state.hunger = Math.min(100, this.state.hunger + Math.floor(msElapsed / this.HUNGER_TICK_MS)); 
			this.state.lastHungerTick = now - (msElapsed % this.HUNGER_TICK_MS);
		}
		if (this.state.hunger === 100) this.state.isDead = true;

		const walkToPoint = (targetX, targetY, speed = 2) => {
			const dx = targetX - this.state.x; const dy = targetY - this.state.y;
			const dist = Math.sqrt(dx * dx + dy * dy);
			if (dist > 10) {
				this.state.facing = dx > 0 ? 1 : -1;
				this.state.x += (dx / dist) * speed; this.state.y += (dy / dist) * speed;
				return false;
			}
			return true;
		};

		// Workspace resolution math 
		const visibleW = this.canvas.width - 200;
		const visibleH = this.canvas.height - 200;
		const floorLineY = visibleH - this.BASE_FLOOR_Y;
		
		// 🛠️ SCALE INVERSION FOR AI DESTINATIONS:
		// Ensures the pathfinding algorithm targets unscaled canvas spots so it matches the transformed render pipeline.
		let rawSliderVal = (this.state.zoom === undefined) ? 0 : this.state.zoom;
		let scaleVal = rawSliderVal >= 0 ? 1.0 + (rawSliderVal * 0.5) : 1.0 + (rawSliderVal * 0.25);
		const anchorX = visibleW / 2;
		const anchorY = visibleH - this.BASE_FLOOR_Y;

		const getUnscaledPos = (pctX, pctY, offY) => {
			const targetX = (pctX / 100) * window.innerWidth;
			const targetY = (pctY / 100) * window.innerHeight;
			return {
				x: anchorX + (targetX - anchorX) / scaleVal,
				y: anchorY + (targetY - anchorY) / scaleVal + offY
			};
		};

		const bowlPos = getUnscaledPos(this.state.layout.bowlX, this.state.layout.bowlY, 0);
		const bedPos = getUnscaledPos(this.state.layout.bedX, this.state.layout.bedY, 0);
		const litPos = getUnscaledPos(this.state.layout.litterX, this.state.layout.litterY, 0);
		const towerPos = getUnscaledPos(this.state.layout.towerX, this.state.layout.towerY, 0);

		if (this.state.actionTimer > 0) this.state.actionTimer--;
		if (this.state.hasFood && !["nyan", "eating", "potty", "kicking", "walk_to_kick", "walk_to_litter"].includes(this.state.action)) this.state.action = "walk_to_food";

		switch(this.state.action) {
			case "nyan":
				if (this.state.nyanPhase === "takeoff") {
					const targetY = visibleH / 2;
					this.state.y += (targetY - this.state.y) * 0.05; this.state.x += this.state.facing * 5;
					if (Math.abs(this.state.y - targetY) < 15) this.state.nyanPhase = "flying";
				} else if (this.state.nyanPhase === "flying") {
					this.state.x += this.state.facing * 10; this.state.y = (visibleH / 2) + Math.sin(t * 0.1) * 100;
					if (this.state.actionTimer < 80) this.state.nyanPhase = "landing";
				} else if (this.state.nyanPhase === "landing") {
					this.state.x += (this.state.originalPos.x - this.state.x) * 0.08; this.state.y += (this.state.originalPos.y - this.state.y) * 0.08;
				}
				if (this.state.nyanPhase !== "landing") {
					if (this.state.x > visibleW + 150) this.state.x = -150;
					if (this.state.x < -150) this.state.x = visibleW + 150;
				}
				if (this.state.actionTimer <= 0) {
					this.stopSound('nyanSound');
					this.state.x = this.state.originalPos.x; this.state.y = this.state.originalPos.y;
					this.state.action = "dance"; this.state.actionTimer = 200;
				}
				break;
			case "walk_to_food":
				if (walkToPoint(bowlPos.x, bowlPos.y)) { 
					if (this.state.hasFood) { this.state.action = "eating"; this.state.actionTimer = 150; }
					else { this.state.action = "beg"; this.state.actionTimer = 150; this.say("Hungry! 🐟"); }
				}
				break;
			case "eating":
				if (this.state.actionTimer <= 0) {
					this.state.hasFood = false; this.state.hunger = Math.max(0, this.state.hunger - 10); 
					this.state.digestive++; this.state.exp += 15; this.state.action = "idle"; this.state.actionTimer = 400;
				}
				break;
			case "walk_to_litter":
				if (walkToPoint(litPos.x, litPos.y)) { this.state.action = "potty"; this.state.actionTimer = 150; }
				break;
			case "potty":
				if (this.state.actionTimer <= 0) { this.state.poops.push({ox: Math.random()*100}); this.state.digestive = 0; this.state.action = "walk_to_kick"; }
				break;
			case "walk_to_kick":
				if (walkToPoint(litPos.x - 60, litPos.y)) { this.state.facing = 1; this.state.action = "kicking"; this.state.actionTimer = 100; }
				break;
			case "kicking":
				if (t % 2 === 0) this.state.particles.push({x: this.state.x - 10, y: this.state.y + 25, vx: 6 + Math.random()*8, vy: -5, s: 2, c: "#bdc3c7", life: 30});
				if (this.state.actionTimer <= 0) { this.state.action = "idle"; this.state.actionTimer = 400; this.say("I made a Poopy!"); }
				break;
			case "walk_to_bed":
				if (walkToPoint(bedPos.x, bedPos.y)) { this.state.action = "sleep"; this.state.actionTimer = 1200; }
				break;
			case "walk_to_tower_scratch":
				if (walkToPoint(towerPos.x - 15, towerPos.y)) { this.state.facing = 1; this.state.action = "scratching"; this.state.actionTimer = 200; this.say("Scritch! 🐾"); }
				break;
			case "walk_to_tower_climb":
				if (walkToPoint(towerPos.x, towerPos.y - 145)) { this.state.action = "tower_sleep"; this.state.actionTimer = 1500; }
				break;
			case "scratching":
				 if (t % 3 === 0) this.state.particles.push({x: this.state.x + 10, y: this.state.y - 10, vx: Math.random()*4, vy: -2, s: 2, c: "#d2b48c", life: 15});
				 if (this.state.actionTimer <= 0) this.state.action = "idle";
				 break;
			case "idle":
				if (this.state.actionTimer <= 0) {
					if (Math.random() < 0.20) {
						let sound = "Meow!";
						if (this.state.hunger < 20) sound = "Purrr... ❤️";
						if (this.state.hunger > 70) sound = "Mew? (Hungry)";
						this.say("Meow! 🐾");
					}
					if (Math.random() < 0.5) { this.state.actionTimer = 600 + Math.random() * 600; return; }
					if (this.state.digestive >= 3) { this.state.action = "walk_to_litter"; } 
					else {
						const r = Math.random();
						if (r < 0.15) { this.state.action = "walk"; this.state.facing = Math.random() > 0.5 ? 1 : -1; this.state.actionTimer = 400 + Math.random() * 400; }
						else if (r < 0.25) this.state.action = "walk_to_bed";
						else if (r < 0.40 && this.state.layout.showTower) this.state.action = Math.random() > 0.5 ? "walk_to_tower_scratch" : "walk_to_tower_climb";
						else this.state.actionTimer = 800 + Math.random() * 1000;
					}
				}
				break;
			case "walk":
				this.state.x += this.state.facing * 1.2;
				if (this.state.x < 100 || this.state.x > visibleW - 100) this.state.facing *= -1;
				if (this.state.actionTimer <= 0) { this.state.action = "idle"; this.state.actionTimer = 500; }
				break;
			case "sleep":
			case "tower_sleep":
			case "dance":
			case "special":
				if (this.state.actionTimer <= 0) { 
					if(this.state.action === "tower_sleep") this.state.y = floorLineY;
					this.state.action = "idle"; 
				}
				break;
		}
	}

	updateUI() {
		const nameEl = document.getElementById("nameplate");
		const statsEl = document.getElementById("status");
		if(!nameEl || !statsEl) return;
		nameEl.style.left = this.state.layout.nameX + "%"; nameEl.style.top = this.state.layout.nameY + "%";
		statsEl.style.left = this.state.layout.statsX + "%"; statsEl.style.top = this.state.layout.statsY + "%";
		let sTxt = this.state.isDead ? "DECEASED" : (this.state.poops.length > 5 ? "SICK" : "HEALTHY");
		statsEl.innerHTML = `${this.state.name} | Age: ${this.state.ageDays}d | Hunger: ${this.state.hunger}%<br>Status: ${sTxt} | EXP: ${this.state.exp}`;
		nameEl.textContent = (this.state.isDead ? "GHOST " : this.state.stage.toUpperCase() + " ") + this.state.name.toUpperCase();
	}

	saveData() { localStorage.setItem("greta_ultra_v10", JSON.stringify(this.state)); }

	loadData() {
		const saved = localStorage.getItem("greta_ultra_v10");
		if (saved) {
			const loaded = JSON.parse(saved);
			this.state = { ...this.state, ...loaded };
			const now = Date.now();
			const msOffline = now - this.state.lastHungerTick;
			if (msOffline >= this.HUNGER_TICK_MS && !this.state.isDead) {
				const pointsGained = Math.floor(msOffline / this.HUNGER_TICK_MS);
				let potentialHunger = this.state.hunger + pointsGained;
				if (potentialHunger >= 100) { 
					this.state.hunger = 70; 
					this.state.lastHungerTick = now; 
				} else { 
					this.state.hunger = potentialHunger; 
					this.state.lastHungerTick = now - (msOffline % this.HUNGER_TICK_MS); 
				}
			}
			
			const nameIn = document.getElementById("nameInput"); 
			if (nameIn) nameIn.value = this.state.name;
			
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
					zoomSlider.addEventListener("change", () => {
						this.saveData();
					});
					zoomSlider.dataset.listenerWired = "true";
				}
			}

			Object.keys(this.state.layout).forEach(k => { 
				if (k === 'showTower' || k === 'bedColor') return;
				const el = document.getElementById(k);
				if (el) {
					el.value = this.state.layout[k];
				}
			});
		}

		const el = document.getElementById("pet-widget");
        if (el && this.state.dimensions) {
            if (this.state.dimensions.width) el.style.width = this.state.dimensions.width;
            if (this.state.dimensions.height) el.style.height = this.state.dimensions.height;
            if (this.state.dimensions.left) el.style.left = this.state.dimensions.left;
            if (this.state.dimensions.top) el.style.top = this.state.dimensions.top;
        }
		this.initSwatches(); 
	}

	initPersistenceObservers() {
        const el = document.getElementById("pet-widget");
        if (!el) return;

        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === "attributes" && mutation.attributeName === "style") {
                    this.state.dimensions.left = el.style.left;
                    this.state.dimensions.top = el.style.top;
                }
            });
        });
        
        mutationObserver.observe(el, { attributes: true, attributeFilter: ["style"] });

        if (window.ResizeObserver) {
            const resizeObserver = new ResizeObserver((entries) => {
                for (let entry of entries) {
                    if (entry.contentRect.width === 0 || entry.contentRect.height === 0) continue;
                    
                    const newW = entry.target.clientWidth;
                    const newH = entry.target.clientHeight;

                    this.state.dimensions.width = `${newW}px`;
                    this.state.dimensions.height = `${newH}px`;

                    if (this.canvas.width !== newW || this.canvas.height !== newH) {
                        this.canvas.width = newW;
                        this.canvas.height = newH;
                    }
                }
            });
            resizeObserver.observe(el);
        }
    }

	initSwatches() {
		const swatchContainer = document.getElementById("bedColorSwatches");
		if (!swatchContainer) return;
		swatchContainer.innerHTML = ""; 
		this.BED_PRESETS.forEach(color => {
			const btn = document.createElement("div");
			btn.className = "swatch" + (this.state.layout.bedColor === color ? " active" : "");
			btn.style.backgroundColor = color;
			btn.addEventListener("click", () => {
				this.state.layout.bedColor = color;
				document.querySelectorAll(".swatch").forEach(s => s.classList.remove("active"));
				btn.classList.add("active");
				this.say("Comfy! ✨");
			});
			swatchContainer.appendChild(btn);
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

		const zoomSlider = document.getElementById("canvasZoom");
        const zoomDisplay = document.getElementById("zoomValue");
        if (zoomSlider) {
            zoomSlider.addEventListener("input", (e) => {
                const val = parseFloat(e.target.value);
                this.state.zoom = val;
                if (zoomDisplay) zoomDisplay.textContent = `${val.toFixed(1)}x`;
            });
            zoomSlider.addEventListener("change", () => {
                this.saveData();
            });
        }

        const st = document.getElementById("showTower");
        if (st) st.addEventListener("change", (e) => {
            this.state.layout.showTower = e.target.checked;
            if(!this.state.layout.showTower && this.state.action.includes("tower")) this.state.action = "idle";
        });

        bindClick("btnFeed", () => { if(!this.state.isDead && !this.state.hasFood) { this.state.hasFood = true; this.say("Food! 🐟"); } });
        bindClick("btnPlay", () => { if(!this.state.isDead) { this.state.action = "special"; this.state.actionTimer = 350; this.say("Play! 🧶"); } });
        bindClick("btnDance", () => { if(!this.state.isDead) { this.state.action = "dance"; this.state.actionTimer = 300; this.say("Dance! ✨"); } });
        bindClick("btnTreat", () => { if(!this.state.isDead) { this.state.hunger = Math.max(0, this.state.hunger - 5); this.state.action = "special"; this.state.actionTimer = 200; this.say("NOM NOM NOM! 🍗"); } });
        bindClick("btnClear", () => { this.state.poops = []; this.say("Fresh sand! ✨"); });
        bindClick("btnReset", () => { 
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
}