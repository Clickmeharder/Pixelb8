import { BaseWidgetModule } from './BaseWidgetModule.js';

export class StreamEmojinkoModule extends BaseWidgetModule {
	constructor() {
		super("stream_Emojinko", {
			menuTitle: "🎯 Emojinko Plinko Game"
		});

		// 🛡️ Fail-Safe Core State Matrix Hydration Pattern
		this.state = {
			gameActive: this.state?.gameActive !== undefined ? this.state.gameActive : false,
			overlayVisible: this.state?.overlayVisible !== undefined ? this.state.overlayVisible : true,
			dropDuration: this.state?.dropDuration || 4,
			maxDropsPerUser: this.state?.maxDropsPerUser || 3,
			scores: this.state?.scores || {},
			currentMatchScores: this.state?.currentMatchScores || {},
			userDropTracker: this.state?.userDropTracker || {},
			// Default configurable arrays stored inside state for complete panel mutability
			scoreZones: this.state?.scoreZones || [
				{ label: "100 PTS", multiplier: 100, color: "rgba(168,85,247,0.05)", textColor: "#ffffff" },
				{ label: "💥 RIP", multiplier: 0, color: "rgba(239,68,68,0.1)", textColor: "#ef4444" },
				{ label: "🍀 LUCKY", multiplier: 500, color: "rgba(34,197,94,0.1)", textColor: "#22c55e" },
				{ label: "50 PTS", multiplier: 50, color: "rgba(168,85,247,0.05)", textColor: "#ffffff" }
			],
			commandAccess: this.state?.commandAccess || {}
		};

		// Engine tracking properties isolated from core base canvases
		this.physicsCanvas = null;
		this.physicsCtx = null;
		this.pegs = [];
		this.activeTokens = [];
		this.physicsLoopId = null;
		this._resizeHandler = null;

		// Explicitly decouple base framework classic canvas variables
		this.canvas = null;
		this.ctx = null;

		this.loadData();

		// Synchronize internal permissions grid systems inside parent interface windows
		const matrixTarget = document.getElementById(this.controlId)?.querySelector('.matrix-container-target');
		if (matrixTarget) {
			matrixTarget.innerHTML = this.renderCommandRouterMatrixHTML();
		}
	}

	/**
	 * 🎨 RENDERS CONFIGURABLE SETTINGS AND LEDGERS
	 */
	getControlsMarkup() {
		const zones = this.state.scoreZones || [];
		
		// Map dynamic structural settings markup inputs for mutable bucket array customization
		const bucketInputsHTML = zones.map((zone, idx) => `
			<div class="dz-bucket-config-row" data-idx="${idx}" style="display: flex; gap: 6px; align-items: center; margin-bottom: 6px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 4px; border: 1px solid #27272a;">
				<span style="font-size: 11px; font-family: monospace; color: #a1a1aa; width: 14px;">#${idx + 1}</span>
				<input type="text" class="dz-bucket-label-in" value="${zone.label}" placeholder="Label" style="flex: 2; background: #09090b; border: 1px solid #3f3f46; color: #fff; font-size: 11px; padding: 2px 4px; border-radius: 3px;">
				<input type="number" class="dz-bucket-val-in" value="${zone.multiplier}" placeholder="Pts" style="width: 55px; background: #09090b; border: 1px solid #3f3f46; color: #22c55e; font-size: 11px; padding: 2px 4px; border-radius: 3px; font-family: monospace;">
			</div>
		`).join('');

		return `
			<div style="background: #18181b; padding: 12px; border: 1px solid #27272a; border-radius: 6px; margin-bottom: 15px;">
				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px;">
					<h4 style="margin: 0; color: var(--accent, #a855f7); font-size: 14px;">🎯 Emojinko Controller</h4>
					<button id="dz-btn-toggle-game" class="p8-btn" style="font-size: 11px; padding: 4px 10px; font-weight: bold; min-width: 95px; border-radius: 4px; cursor: pointer;">
						${this.state.gameActive ? '🛑 End Game' : '🎮 Start Game'}
					</button>
				</div>

				<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(255,255,255,0.02); padding: 6px; border-radius: 4px;">
					<span style="font-size: 12px; color: #e4e4e7;">Overlay Stage Visibility</span>
					<label class="p8-switch" style="cursor: pointer; display: inline-flex; align-items: center;">
						<input type="checkbox" id="dz-toggle-visibility" ${this.state.overlayVisible ? 'checked' : ''}>
						<span class="p8-slider"></span>
					</label>
				</div>

				<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
					<span style="font-size: 12px; color: #a1a1aa; min-width: 85px;">Gravity Velocity</span>
					<input type="range" id="dz-gravity-slider" min="1" max="10" value="${this.state.dropDuration}" style="flex: 1; cursor: pointer; accent-color: var(--accent, #a855f7);">
					<span id="dz-grav-txt" style="font-size: 12px; font-family: monospace;">${this.state.dropDuration}s</span>
				</div>

				<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
					<span style="font-size: 12px; color: #a1a1aa; min-width: 85px;">Drops / User</span>
					<input type="range" id="dz-limit-slider" min="1" max="20" value="${this.state.maxDropsPerUser}" style="flex: 1; cursor: pointer; accent-color: var(--accent, #a855f7);">
					<span id="dz-limit-txt" style="font-size: 12px; font-family: monospace;">${this.state.maxDropsPerUser}</span>
				</div>

				<div style="margin-top: 12px; margin-bottom: 12px; border-top: 1px solid #27272a; padding-top: 10px;">
					<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
						<span style="font-size: 12px; color: #e4e4e7; font-weight: bold;">📥 Configure Scoring Buckets</span>
						<button id="dz-btn-add-bucket" class="p8-btn alt-btn" style="font-size: 10px; padding: 1px 6px;">+ Add Slot</button>
					</div>
					<div id="dz-buckets-editor-wrap">
						${bucketInputsHTML}
					</div>
				</div>

				<div style="text-align: right;">
					<button id="dz-btn-clear" class="p8-btn alt-btn" style="font-size: 10px; padding: 2px 6px; opacity: 0.7;">Reset All Ledgers</button>
				</div>
			</div>

			<div id="dz-dashboard-embedded-preview-container" style="display:none; background: #09090b; border: 1px solid #27272a; border-radius: 6px; padding: 6px; margin-bottom: 15px;">
				<span style="font-size: 11px; color: #a1a1aa; font-family: monospace; display: block; margin-bottom: 4px;">📺 Active Module Sandbox Preview Screen:</span>
				<div id="dz-preview-mount-node" style="position: relative; width: 100%; height: 320px; background: #141417; overflow: hidden; border-radius: 4px;"></div>
			</div>

			<div style="background: #18181b; padding: 12px; border: 1px solid #27272a; border-radius: 6px; display: flex; flex-direction: column; gap: 12px;">
				<div>
					<h4 style="margin: 0 0 6px 0; color: #a855f7; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">⚡ Current Match Standings</h4>
					<div id="dz-match-list" style="font-family: monospace; font-size: 12px; display: flex; flex-direction: column; gap: 4px; max-height: 120px; overflow-y: auto; background: rgba(0,0,0,0.15); padding: 4px; border-radius: 4px;">
						<div style="color: #71717a; text-align: center; padding: 6px 0;">No active match scores...</div>
					</div>
				</div>
				
				<hr style="border: 0; border-top: 1px solid #27272a; margin: 0;" />

				<div>
					<h4 style="margin: 0 0 6px 0; color: #e4e4e7; font-size: 12px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.05em;">🏆 All-Time Highscores</h4>
					<div id="dz-leaderboard-list" style="font-family: monospace; font-size: 12px; display: flex; flex-direction: column; gap: 4px; max-height: 120px; overflow-y: auto; background: rgba(0,0,0,0.15); padding: 4px; border-radius: 4px;">
						<div style="color: #71717a; text-align: center; padding: 6px 0;">No entries indexed yet...</div>
					</div>
				</div>
			</div>
		`;
	}

	/**
	 * 🛠️ ROBUST INJECTION SHUNT OVERRIDE
	 * Fixes dropping issue by automatically providing a container mount path if #overlay-wrapper is missing.
	 */
	injectViewportOverlay() {
		let overlayWrapper = document.getElementById("overlay-wrapper");
		let fallbackContext = false;

		// Structural Fallback Switch: if overlay wrapper doesn't exist, we are loading in the admin portal layout context
		if (!overlayWrapper) {
			const previewSection = document.getElementById("dz-dashboard-embedded-preview-container");
			const mountNode = document.getElementById("dz-preview-mount-node");
			if (previewSection && mountNode) {
				previewSection.style.display = "block";
				overlayWrapper = mountNode;
				fallbackContext = true;
			}
		}

		if (!overlayWrapper) return;

		const existingOverlay = document.getElementById(this.overlayId);
		if (existingOverlay) existingOverlay.remove();

		const overlayEl = document.createElement("div");
		overlayEl.id = this.overlayId;
		overlayEl.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; z-index: 9999; display: ${this.state.overlayVisible ? 'block' : 'none'};`;
		
		const zones = this.state.scoreZones || [];
		const bucketDivs = zones.map(z => `
			<div style="flex: 1; border-right: 1px solid rgba(63,63,70,0.4); background: ${z.color || 'rgba(168,85,247,0.05)'}; color: ${z.textColor || '#fff'}; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: ${fallbackContext ? '9px' : '11px'}.">
				${z.label}
			</div>
		`).join('');

		overlayEl.innerHTML = `
			<canvas id="dz-physics-canvas-${this.overlayId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; display: block;"></canvas>
			<div id="dz-bucket-row" style="position: absolute; bottom: 0; left: 0; width: 100%; height: ${fallbackContext ? '28px' : '45px'}; display: flex; background: rgba(15,15,19,0.96); border-top: 2px solid var(--accent, #a855f7); font-family: monospace; text-align: center; line-height: ${fallbackContext ? '28px' : '45px'}; font-weight: bold; z-index: 10000; text-transform: uppercase; letter-spacing: 0.05em;">
				${bucketDivs}
			</div>
		`;
		
		overlayWrapper.appendChild(overlayEl);

		this.physicsCanvas = document.getElementById(`dz-physics-canvas-${this.overlayId}`);
		if (this.physicsCanvas) {
			this.physicsCtx = this.physicsCanvas.getContext("2d");
			this.resizePhysicsCanvas();
			
			if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
			this._resizeHandler = () => this.resizePhysicsCanvas();
			window.addEventListener('resize', this._resizeHandler);
			
			this.startPhysicsLoop();
		}
	}

	resizePhysicsCanvas() {
		if (!this.physicsCanvas) return;
		const parent = this.physicsCanvas.parentElement;
		let targetWidth = parent ? parent.clientWidth : window.innerWidth;
		let targetHeight = parent ? parent.clientHeight : window.innerHeight;

		if (targetWidth < 50) targetWidth = 1920;
		if (targetHeight < 50) targetHeight = 1080;
		
		this.physicsCanvas.width = targetWidth;
		this.physicsCanvas.height = targetHeight;
		
		this.generatePlinkoPegMatrix(); 
	}

	/**
	 * 📐 TRULY INTERLOCKED TRIANGULAR MATRIX
	 */
	generatePlinkoPegMatrix() {
		if (!this.physicsCanvas) return;
		this.pegs = [];

		const width = this.physicsCanvas.width;
		const height = this.physicsCanvas.height;
		
		const rows = 8;               
		const startY = height * 0.18; 
		const endY = height * 0.76;   
		const rowSpacing = (endY - startY) / rows;

		for (let r = 0; r < rows; r++) {
			const currentY = startY + (r * rowSpacing);
			const isEven = (r % 2 === 0);
			
			// Alternating configuration widths completely stops direct vertical fall-through
			const pegCount = isEven ? 10 : 11; 
			const colSpacing = width / (pegCount + 1);

			for (let c = 0; c < pegCount; c++) {
				const currentX = colSpacing * (c + 1);
				this.pegs.push({
					x: currentX,
					y: currentY,
					radius: width < 600 ? 3 : 5 // Responsive scale adjustments for panel testing boxes
				});
			}
		}
	}

	bindEventListeners() {
		super.bindEventListeners(); 
		const panel = document.getElementById(this.controlId);
		if (!panel) return;

		// Mount dynamic layout wrappers immediately
		this.injectViewportOverlay();
		this.updateControllerButtonUI();
		this.renderLeaderboardUI();

		// Interactive Game Trigger Lifecycle Manager
		const toggleGameBtn = panel.querySelector('#dz-btn-toggle-game');
		if (toggleGameBtn) {
			toggleGameBtn.replaceWith(toggleGameBtn.cloneNode(true)); // Wipe dangling edge handlers
			panel.querySelector('#dz-btn-toggle-game').addEventListener('click', () => {
				if (this.state.gameActive) {
					this.endEmojinkoGame();
				} else {
					this.startEmojinkoGame();
				}
			});
		}

		// Stage Visibility Monitor Input
		const visToggle = panel.querySelector('#dz-toggle-visibility');
		if (visToggle) {
			visToggle.addEventListener('change', (e) => {
				this.state.overlayVisible = e.target.checked;
				this.saveData();
				const overlay = document.getElementById(this.overlayId);
				if (overlay) overlay.style.display = this.state.overlayVisible ? 'block' : 'none';
			});
		}

		const gravSlider = panel.querySelector('#dz-gravity-slider');
		const gravTxt = panel.querySelector('#dz-grav-txt');
		if (gravSlider) {
			gravSlider.addEventListener('input', (e) => {
				this.state.dropDuration = parseInt(e.target.value, 10);
				if (gravTxt) gravTxt.textContent = `${this.state.dropDuration}s`;
				this.saveData();
			});
		}

		const limitSlider = panel.querySelector('#dz-limit-slider');
		const limitTxt = panel.querySelector('#dz-limit-txt');
		if (limitSlider) {
			limitSlider.addEventListener('input', (e) => {
				this.state.maxDropsPerUser = parseInt(e.target.value, 10);
				if (limitTxt) limitTxt.textContent = this.state.maxDropsPerUser;
				this.saveData();
			});
		}

		// 📥 REAL-TIME CONFIGURATION BINDINGS FOR LIVE BUCKET SLOTS
		const syncBucketInputsState = () => {
			const rows = panel.querySelectorAll('.dz-bucket-config-row');
			const updatedZones = [];
			rows.forEach(row => {
				const labelVal = row.querySelector('.dz-bucket-label-in').value || "SCORE";
				const multVal = parseInt(row.querySelector('.dz-bucket-val-in').value, 10) || 0;
				
				// Keep matching background highlights synced cleanly
				let color = "rgba(168,85,247,0.05)";
				let textColor = "#ffffff";
				if (multVal === 0) { color = "rgba(239,68,68,0.1)"; textColor = "#ef4444"; }
				else if (multVal >= 500) { color = "rgba(34,197,94,0.1)"; textColor = "#22c55e"; }

				updatedZones.push({ label: labelVal, multiplier: multVal, color, textColor });
			});
			this.state.scoreZones = updatedZones;
			this.saveData();
			this.injectViewportOverlay(); // Instantly update viewports!
		};

		panel.addEventListener('input', (e) => {
			if (e.target.classList.contains('dz-bucket-label-in') || e.target.classList.contains('dz-bucket-val-in')) {
				syncBucketInputsState();
			}
		});

		const addBucketBtn = panel.querySelector('#dz-btn-add-bucket');
		if (addBucketBtn) {
			addBucketBtn.addEventListener('click', (e) => {
				e.preventDefault();
				if (this.state.scoreZones.length >= 8) return; // Keep distribution sizes safe
				this.state.scoreZones.push({ label: "50 PTS", multiplier: 50, color: "rgba(168,85,247,0.05)", textColor: "#ffffff" });
				this.saveData();
				// Re-render UI inputs box completely
				const wrap = panel.querySelector('#dz-buckets-editor-wrap');
				if (wrap) {
					wrap.innerHTML = this.state.scoreZones.map((zone, idx) => `
						<div class="dz-bucket-config-row" data-idx="${idx}" style="display: flex; gap: 6px; align-items: center; margin-bottom: 6px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 4px; border: 1px solid #27272a;">
							<span style="font-size: 11px; font-family: monospace; color: #a1a1aa; width: 14px;">#${idx + 1}</span>
							<input type="text" class="dz-bucket-label-in" value="${zone.label}">
							<input type="number" class="dz-bucket-val-in" value="${zone.multiplier}">
						</div>
					`).join('');
				}
				this.injectViewportOverlay();
			});
		}

		panel.addEventListener('click', (e) => {
			if (e.target.id === 'dz-btn-clear') {
				e.preventDefault();
				this.state.scores = {};
				this.state.currentMatchScores = {};
				this.state.userDropTracker = {}; 
				this.activeTokens = [];
				this.saveData();
				this.renderLeaderboardUI();
				this.sendNotice("🧹 Emojinko framework data matrices flushed clean successfully!");
			}
		});
	}

	startEmojinkoGame() {
		this.state.gameActive = true;
		this.state.currentMatchScores = {};
		this.state.userDropTracker = {};
		this.saveData();
		
		this.updateControllerButtonUI();
		this.renderLeaderboardUI();
		this.sendNotice("🎮 A new match of Emojinko has begun! Type !drop [emoji] [slot] to join the standings!");
	}

	endEmojinkoGame() {
		this.state.gameActive = false;
		this.saveData();
		
		this.updateControllerButtonUI();
		
		const matchEntries = Object.entries(this.state.currentMatchScores || {})
			.sort((a, b) => b[1] - a[1]);
			
		if (matchEntries.length > 0) {
			this.sendNotice(`🛑 The match has concluded! Winner: @${matchEntries[0][0]} with ${matchEntries[0][1]} Pts!`);
		} else {
			this.sendNotice("🛑 The match has concluded! No scores were registered this round.");
		}
	}

	updateControllerButtonUI() {
		const panel = document.getElementById(this.controlId);
		const btn = panel?.querySelector('#dz-btn-toggle-game');
		if (!btn) return;
		
		if (this.state.gameActive) {
			btn.textContent = "🛑 End Game";
			btn.style.cssText = "font-size: 11px; padding: 4px 10px; font-weight: bold; min-width: 95px; border-radius: 4px; border: 1px solid #ef4444; background: rgba(239,68,68,0.2); color: #f87171; cursor: pointer;";
		} else {
			btn.textContent = "🎮 Start Game";
			btn.style.cssText = "font-size: 11px; padding: 4px 10px; font-weight: bold; min-width: 95px; border-radius: 4px; border: 1px solid #a855f7; background: rgba(168,85,247,0.2); color: #c084fc; cursor: pointer;";
		}
	}

	executeDropAction(user, customToken = "🪙", targetSlot = null, bypassMatchCheck = false) {
		if (!this.state.gameActive && !bypassMatchCheck) {
			this.sendNotice(`🚫 There is no match running right now, @${user}. Wait for the stream game to start!`);
			return;
		}

		if (!bypassMatchCheck) {
			if (!this.state.userDropTracker) this.state.userDropTracker = {};
			const userCount = this.state.userDropTracker[user] || 0;
			if (userCount >= this.state.maxDropsPerUser) return;
			this.state.userDropTracker[user] = userCount + 1;
			this.saveData();
		}

		const cleanToken = customToken.substring(0, 5);
		const width = this.physicsCanvas ? this.physicsCanvas.width : 400;
		
		let startX = Math.random() * (width * 0.8) + (width * 0.1);

		if (targetSlot !== null) {
			const numBuckets = this.state.scoreZones.length || 4;
			const slot = Math.max(1, Math.min(numBuckets, targetSlot));
			const sectionSize = width / numBuckets;
			startX = (sectionSize * (slot - 1)) + (sectionSize / 2) + ((Math.random() * 20) - 10);
		}

		this.activeTokens.push({
			user: user,
			token: cleanToken,
			x: startX,
			y: -20, 
			vx: (Math.random() * 2.5) - 1.25, 
			vy: 1,                         
			radius: width < 600 ? 10 : 22, // Size-adaptive responsive downscaling layout limits
			scale: 1,
			opacity: 1,
			isDying: false,
			isSolo: bypassMatchCheck
		});
	}

	startPhysicsLoop() {
		if (this.physicsLoopId) cancelAnimationFrame(this.physicsLoopId);
		const loop = () => {
			this.updatePhysicsState();
			this.drawPhysicsScene();
			this.physicsLoopId = requestAnimationFrame(loop);
		};
		this.physicsLoopId = requestAnimationFrame(loop);
	}

	updatePhysicsState() {
		if (!this.physicsCanvas) return;

		const width = this.physicsCanvas.width;
		const height = this.physicsCanvas.height;

		const gravityForce = (11 - (this.state.dropDuration || 4)) * 0.03 + 0.07; 
		const dynamicFriction = 0.55; 

		for (let i = this.activeTokens.length - 1; i >= 0; i--) {
			const t = this.activeTokens[i];
			if (!t) continue;

			if (t.isDying) {
				t.scale += 0.05;
				t.opacity -= 0.1;
				if (t.opacity <= 0) this.activeTokens.splice(i, 1);
				continue;
			}

			t.vy += gravityForce;
			t.x += t.vx;
			t.y += t.vy;

			if (t.x - t.radius < 0) {
				t.x = t.radius; t.vx *= -dynamicFriction;
			} else if (t.x + t.radius > width) {
				t.x = width - t.radius; t.vx *= -dynamicFriction;
			}

			for (let p of this.pegs) {
				const dx = t.x - p.x;
				const dy = t.y - p.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const minDist = t.radius + p.radius;

				if (dist < minDist) {
					const overlap = minDist - dist;
					t.x += (dx / dist) * overlap;
					t.y += (dy / dist) * overlap;

					const dotProduct = t.vx * (dx / dist) + t.vy * (dy / dist);
					t.vx = (t.vx - 2 * dotProduct * (dx / dist)) * dynamicFriction;
					t.vy = (t.vy - 2 * dotProduct * (dy / dist)) * dynamicFriction;
					t.vx += (Math.random() * 1.2) - 0.6;
				}
			}

			const floorLine = height - (this.physicsCanvas.height < 500 ? 30 : 47);
			if (t.y >= floorLine) {
				t.isDying = true;
				const finalXPercent = (t.x / width) * 100;
				this.evaluateLandingZoneScore(t.user, finalXPercent, t.isSolo);
			}
		}
	}

	drawPhysicsScene() {
		if (!this.physicsCtx || !this.physicsCanvas) return;
		const width = this.physicsCanvas.width;
		this.physicsCtx.clearRect(0, 0, width, this.physicsCanvas.height);

		// Peg Renderer
		for (let p of this.pegs) {
			this.physicsCtx.fillStyle = "rgba(168, 85, 247, 0.4)";
			this.physicsCtx.beginPath(); this.physicsCtx.arc(p.x, p.y, p.radius + 1, 0, Math.PI * 2); this.physicsCtx.fill();
		}

		this.physicsCtx.textAlign = "center";
		this.physicsCtx.textBaseline = "middle";

		this.activeTokens.forEach(t => {
			if (!t) return;
			this.physicsCtx.save();
			this.physicsCtx.globalAlpha = t.opacity;
			this.physicsCtx.translate(t.x, t.y);
			this.physicsCtx.scale(t.scale, t.scale);

			// Scale rendering fonts based on running sandbox wrapper sizes
			const sizeSmall = width < 600;
			this.physicsCtx.font = sizeSmall ? "16px Arial" : "34px Arial";
			this.physicsCtx.fillText(t.token, 0, sizeSmall ? -1 : -4);

			this.physicsCtx.font = sizeSmall ? "7px monospace" : "bold 10px monospace";
			this.physicsCtx.fillStyle = t.isSolo ? "rgba(34, 197, 94, 0.9)" : "rgba(24, 24, 27, 0.88)";
			const textWidth = this.physicsCtx.measureText(t.user).width;
			
			this.physicsCtx.fillRect(-((textWidth + 6) / 2), sizeSmall ? 7 : 18, textWidth + 6, sizeSmall ? 9 : 14);
			this.physicsCtx.fillStyle = "#ffffff";
			this.physicsCtx.fillText(t.user, 0, sizeSmall ? 11 : 25);
			this.physicsCtx.restore();
		});
	}

	evaluateLandingZoneScore(user, finalXPercent, isSolo = false) {
		const zones = this.state.scoreZones || [];
		const numZones = zones.length || 4;
		
		const zoneIndex = Math.min(numZones - 1, Math.floor(finalXPercent / (100 / numZones)));
		const matchedBucket = zones[zoneIndex] || zones[numZones - 1];
		
		if (isSolo) {
			if (matchedBucket.multiplier > 0) {
				this.sendNotice(`✨ [SOLO] @${user} hit the [${matchedBucket.label}] slot for a casual ${matchedBucket.multiplier} points!`);
			} else {
				this.sendNotice(`💨 [SOLO] @${user} dropped straight into the [${matchedBucket.label}] hazard!`);
			}
			return; 
		}

		if (!this.state.scores) this.state.scores = {};
		if (!this.state.currentMatchScores) this.state.currentMatchScores = {};

		const currentMatchHigh = this.state.currentMatchScores[user] || 0;
		if (matchedBucket.multiplier > currentMatchHigh) {
			this.state.currentMatchScores[user] = matchedBucket.multiplier;
		}

		const currentSessionHigh = this.state.scores[user] || 0;
		if (matchedBucket.multiplier > currentSessionHigh) {
			this.state.scores[user] = matchedBucket.multiplier;
		}

		this.saveData();
		this.renderLeaderboardUI();

		if (matchedBucket.multiplier > 0) {
			this.sendNotice(`🎯 @${user} bounced into [${matchedBucket.label}], securing a score of ${matchedBucket.multiplier}!`);
		} else {
			this.sendNotice(`💀 Oof! @${user} plummeted into a [${matchedBucket.label}] danger slot!`);
		}
	}

	renderLeaderboardUI() {
		const panel = document.getElementById(this.controlId);
		if (!panel) return;

		const matchContainer = panel.querySelector('#dz-match-list');
		if (matchContainer) {
			const matchEntries = Object.entries(this.state.currentMatchScores || {})
				.sort((a, b) => b[1] - a[1]).slice(0, 5);

			if (matchEntries.length === 0) {
				matchContainer.innerHTML = `<div style="color: #71717a; text-align: center; padding: 6px 0;">No active match scores...</div>`;
			} else {
				matchContainer.innerHTML = matchEntries.map(([name, score], idx) => `
					<div style="display: flex; justify-content: space-between; padding: 2px 4px; background: rgba(168,85,247,0.06);">
						<span style="color: #c084fc; font-weight:bold;">#${idx + 1} ${name}</span>
						<span style="color: #a855f7;">${score} Pts</span>
					</div>
				`).join('');
			}
		}

		const leaderContainer = panel.querySelector('#dz-leaderboard-list');
		if (leaderContainer) {
			const sessionEntries = Object.entries(this.state.scores || {})
				.sort((a, b) => b[1] - a[1]).slice(0, 5);

			if (sessionEntries.length === 0) {
				leaderContainer.innerHTML = `<div style="color: #71717a; text-align: center; padding: 6px 0;">No entries indexed yet...</div>`;
			} else {
				leaderContainer.innerHTML = sessionEntries.map(([name, score], idx) => `
					<div style="display: flex; justify-content: space-between; padding: 2px 4px; background: ${idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'};">
						<span style="color: #e4e4e7;">#${idx + 1} ${name}</span>
						<span style="color: #22c55e;">${score} Pts</span>
					</div>
				`).join('');
			}
		}
	}

	destroy() {
		if (this.physicsLoopId) cancelAnimationFrame(this.physicsLoopId);
		if (this._resizeHandler) window.removeEventListener('resize', this._resizeHandler);
		const container = document.getElementById(this.overlayId);
		if (container) container.remove();
		super.destroy();
	}

	getModuleCommands() {
		return [
			{
				name: 'drop',
				defaultChat: true,
				defaultCp: true,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('drop', flags)) return;
					const parts = message.trim().split(/\s+/);
					let token = "🪙"; let slot = null;
					if (parts.length > 0 && parts[0] !== "") token = parts[0];
					if (parts.length > 1) {
						const pInt = parseInt(parts[1], 10); if (!isNaN(pInt)) slot = pInt;
					}
					this.executeDropAction(user, token, slot, false);
				}
			},
			{
				name: 'dropemoji',
				defaultChat: true,
				defaultCp: true,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('dropemoji', flags)) return;
					const parts = message.trim().split(/\s+/);
					let token = "✨"; let slot = null;
					if (parts.length > 0 && parts[0] !== "") token = parts[0];
					if (parts.length > 1) {
						const pInt = parseInt(parts[1], 10); if (!isNaN(pInt)) slot = pInt;
					}
					this.executeDropAction(user, token, slot, true);
				}
			},
			{
				name: 'startgame',
				defaultChat: false,
				defaultCp: true,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('startgame', flags)) return;
					this.startEmojinkoGame();
				}
			},
			{
				name: 'endgame',
				defaultChat: false,
				defaultCp: true,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('endgame', flags)) return;
					this.endEmojinkoGame();
				}
			},
			{
				name: 'setgravity',
				defaultChat: false,
				defaultCp: true,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('setgravity', flags)) return;
					const val = parseInt(message.trim(), 10);
					if (!isNaN(val) && val >= 1 && val <= 10) {
						this.state.dropDuration = val; this.saveData();
						this.sendNotice(`⚙️ Emojinko gravity drop duration set to ${val}s.`);
						const slider = document.getElementById(this.controlId)?.querySelector('#dz-gravity-slider');
						if (slider) slider.value = val;
					}
				}
			},
			{
				name: 'setlimit',
				defaultChat: false,
				defaultCp: true,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('setlimit', flags)) return;
					const val = parseInt(message.trim(), 10);
					if (!isNaN(val) && val >= 1 && val <= 20) {
						this.state.maxDropsPerUser = val; this.saveData();
						this.sendNotice(`⚙️ Emojinko entry drop cap set to ${val}.`);
						const slider = document.getElementById(this.controlId)?.querySelector('#dz-limit-slider');
						if (slider) slider.value = val;
					}
				}
			}
		];
	}
}