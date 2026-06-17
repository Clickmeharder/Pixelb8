import { BaseWidgetModule } from './BaseWidgetModule.js';

// ============================================================================
// 🎨 Emojinko VIEW TEMPLATES (Dashboard Manager Layout)
// ============================================================================
const Emojinko_HTMLTEMPLATES = {
	dashboard: (dropDuration, maxDrops, gameActive, overlayVisible) => `
		<div style="background: #18181b; padding: 12px; border: 1px solid #27272a; border-radius: 6px; margin-bottom: 15px;">
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; gap: 8px;">
				<button id="dz-btn-toggle-game" class="p8-btn ${gameActive ? 'alt-btn' : ''}" style="font-size: 11px; padding: 4px 10px; font-weight: bold; min-width: 95px; border-radius: 4px; border: 1px solid ${gameActive ? '#ef4444' : '#a855f7'}; background: ${gameActive ? 'rgba(239,68,68,0.15)' : 'rgba(168,85,247,0.15)'}; color: ${gameActive ? '#f87171' : '#c084fc'}; cursor: pointer;">
					${gameActive ? '🛑 End Game' : '🎮 Start Game'}
				</button>
			</div>

			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; background: rgba(255,255,255,0.02); padding: 6px; border-radius: 4px;">
				<span style="font-size: 12px; color: #e4e4e7;">Overlay Stage Visibility</span>
				<label class="p8-switch" style="cursor: pointer; display: inline-flex; align-items: center;">
					<input type="checkbox" id="dz-toggle-visibility" ${overlayVisible ? 'checked' : ''}>
					<span class="p8-slider"></span>
				</label>
			</div>

			<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
				<span style="font-size: 12px; color: #a1a1aa; min-width: 85px;">Gravity Velocity</span>
				<input type="range" id="dz-gravity-slider" min="1" max="10" value="${dropDuration}" style="flex: 1; cursor: pointer; accent-color: var(--accent, #a855f7);">
				<span id="dz-grav-txt" style="font-size: 12px; font-family: monospace;">${dropDuration}s</span>
			</div>

			<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
				<span style="font-size: 12px; color: #a1a1aa; min-width: 85px;">Drops / User</span>
				<input type="range" id="dz-limit-slider" min="1" max="20" value="${maxDrops}" style="flex: 1; cursor: pointer; accent-color: var(--accent, #a855f7);">
				<span id="dz-limit-txt" style="font-size: 12px; font-family: monospace;">${maxDrops}</span>
			</div>

			<div style="text-align: right;">
				<button id="dz-btn-clear" class="p8-btn alt-btn" style="font-size: 10px; padding: 2px 6px; opacity: 0.7;">Reset All Ledgers</button>
			</div>
		</div>
	`,

	leaderboard: `
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
	`
};

export class StreamEmojinkoModule extends BaseWidgetModule {
	constructor() {
		super("stream_Emojinko", {
			menuTitle: "🎯 Emojinko!"
		});

		// 🛡️ Architectural State Extension Blueprint
		this.state = {
			gameActive: false,
			overlayVisible: true,
			dropDuration: 4,
			maxDropsPerUser: 3,
			scores: {},            // Persistent structural scoreboard record
			currentMatchScores: {}, // Flushed out completely at start of each match
			userDropTracker: {},    // Managed within individual active matches
			scoreZones: [
				{ label: "100 PTS", multiplier: 100, color: "rgba(168,85,247,0.05)", textColor: "#fff" },
				{ label: "💥 RIP", multiplier: 0, color: "rgba(239,68,68,0.1)", textColor: "#ef4444" },
				{ label: "🍀 LUCKY", multiplier: 500, color: "rgba(34,197,94,0.1)", textColor: "#22c55e" },
				{ label: "50 PTS", multiplier: 50, color: "rgba(168,85,247,0.05)", textColor: "#fff" }
			],
			commandAccess: this.state?.commandAccess || {}
		};

		// Engine tracking loops contexts
		this.physicsCanvas = null;
		this.physicsCtx = null;
		this.pegs = [];
		this.activeTokens = [];
		this.physicsLoopId = null;
		this._resizeHandler = null;

		this.canvas = null;
		this.ctx = null;

		this.loadData();

		const matrixTarget = document.getElementById(this.controlId)?.querySelector('.matrix-container-target');
		if (matrixTarget) {
			matrixTarget.innerHTML = this.renderCommandRouterMatrixHTML();
		}
	}

	getControlsMarkup() {
		return `
			${Emojinko_HTMLTEMPLATES.dashboard(
				this.state.dropDuration || 4, 
				this.state.maxDropsPerUser || 3, 
				this.state.gameActive || false,
				this.state.overlayVisible !== false
			)}
			${Emojinko_HTMLTEMPLATES.leaderboard}
		`;
	}

	injectViewportOverlay() {
		const overlayWrapper = document.getElementById("overlay-wrapper") || document.body;
		if (!overlayWrapper) return;

		const existingOverlay = document.getElementById(this.overlayId);
		if (existingOverlay) existingOverlay.remove();

		const overlayEl = document.createElement("div");
		overlayEl.id = this.overlayId;
		overlayEl.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; z-index: 9999; display: ${this.state.overlayVisible ? 'block' : 'none'};`;
		
		// Build dynamic buckets block markup mapped from state tracking configuration rules
		const zones = this.state.scoreZones || [];
		const bucketDivs = zones.map(z => `
			<div style="flex: 1; border-right: 1px dashed #3f3f46; background: ${z.color}; color: ${z.textColor || '#fff'};">
				${z.label}
			</div>
		`).join('');

		overlayEl.innerHTML = `
			<canvas id="dz-physics-canvas-${this.overlayId}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; display: block;"></canvas>
			<div id="dz-bucket-row" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 45px; display: flex; background: rgba(15,15,19,0.96); border-top: 2px solid var(--accent, #a855f7); font-family: monospace; text-align: center; line-height: 45px; font-weight: bold; font-size: 11px; z-index: 10000; text-transform: uppercase; letter-spacing: 0.05em;">
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

		if (targetWidth < 100) targetWidth = 1920;
		if (targetHeight < 100) targetHeight = 1080;
		
		this.physicsCanvas.width = targetWidth;
		this.physicsCanvas.height = targetHeight;
		
		this.generatePlinkoPegMatrix(); 
	}

	/**
	 * 📐 ALTERNATING TRIANGULAR PLINKO MATRIX
	 * Generates clean alternating rows to ensure items bounce organically left and right.
	 */
	generatePlinkoPegMatrix() {
		if (!this.physicsCanvas) return;
		this.pegs = [];

		const width = this.physicsCanvas.width;
		const height = this.physicsCanvas.height;
		
		const rows = 9;               
		const startY = height * 0.20; 
		const endY = height * 0.78;   
		const rowSpacing = (endY - startY) / rows;

		for (let r = 0; r < rows; r++) {
			const currentY = startY + (r * rowSpacing);
			// Alternate peg offset positions based on current row parity
			const isEven = (r % 2 === 0);
			const pegCount = isEven ? 11 : 12; 
			const colSpacing = width / (pegCount + 1);

			for (let c = 0; c < pegCount; c++) {
				let currentX = colSpacing * (c + 1);
				
				// Apply a half-step horizontal offset block shift to non-even row layers
				if (!isEven) {
					currentX += (colSpacing / 2) - (colSpacing / 2);
				}

				this.pegs.push({
					x: currentX,
					y: currentY,
					radius: 5
				});
			}
		}
	}

	bindEventListeners() {
		super.bindEventListeners(); 
		const panel = document.getElementById(this.controlId);
		if (!panel) return;

		this.renderLeaderboardUI();
		this.injectViewportOverlay();

		// Interactive Game Trigger Lifecycle Manager
		const toggleGameBtn = panel.querySelector('#dz-btn-toggle-game');
		if (toggleGameBtn) {
			toggleGameBtn.addEventListener('click', () => {
				if (this.state.gameActive) {
					this.endEmojinkoGame();
				} else {
					this.startEmojinkoGame();
				}
			});
		}

		// Interactive Stage Overlay Filter
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
			gravSlider.value = this.state.dropDuration;
			gravSlider.addEventListener('input', (e) => {
				this.state.dropDuration = parseInt(e.target.value, 10);
				if (gravTxt) gravTxt.textContent = `${this.state.dropDuration}s`;
				this.saveData();
			});
		}

		const limitSlider = panel.querySelector('#dz-limit-slider');
		const limitTxt = panel.querySelector('#dz-limit-txt');
		if (limitSlider) {
			limitSlider.value = this.state.maxDropsPerUser;
			limitSlider.addEventListener('input', (e) => {
				this.state.maxDropsPerUser = parseInt(e.target.value, 10);
				if (limitTxt) limitTxt.textContent = this.state.maxDropsPerUser;
				this.saveData();
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
		this.sendNotice("🎮 A new match of Emojinko has begun! Type !drop [emoji] [1-4] to join the standings!");
	}

	endEmojinkoGame() {
		this.state.gameActive = false;
		this.saveData();
		
		this.updateControllerButtonUI();
		
		// Map and evaluate winners sequence string output
		const matchEntries = Object.entries(this.state.currentMatchScores || {})
			.sort((a, b) => b[1] - a[1]);
			
		if (matchEntries.length > 0) {
			this.sendNotice(`🛑 The match has concluded! Top Winner: @${matchEntries[0] [0]} with ${matchEntries[0] [1]} Pts!`);
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
			btn.classList.add('alt-btn');
			btn.style.border = "1px solid #ef4444";
			btn.style.background = "rgba(239,68,68,0.15)";
			btn.style.color = "#f87171";
		} else {
			btn.textContent = "🎮 Start Game";
			btn.classList.remove('alt-btn');
			btn.style.border = "1px solid #a855f7";
			btn.style.background = "rgba(168,85,247,0.15)";
			btn.style.color = "#c084fc";
		}
	}

	executeDropAction(user, customToken = "🪙", targetSlot = null, bypassMatchCheck = false) {
		// Enforce match limits unless running on an unregulated solo request execution context
		if (!this.state.gameActive && !bypassMatchCheck) {
			this.sendNotice(`🚫 There is no match running right now, @${user}. Wait for the streamer to start the game!`);
			return;
		}

		if (!bypassMatchCheck) {
			if (!this.state.userDropTracker) this.state.userDropTracker = {};
			const userCount = this.state.userDropTracker[user] || 0;
			if (userCount >= this.state.maxDropsPerUser) {
				return; // Silently catch or ignore overflow drop entries inside competitive logs
			}
			this.state.userDropTracker[user] = userCount + 1;
			this.saveData();
		}

		const cleanToken = customToken.substring(0, 5);
		const width = this.physicsCanvas ? this.physicsCanvas.width : window.innerWidth;
		
		let startX = Math.random() * (width * 0.8) + (width * 0.1);

		if (targetSlot !== null) {
			const numBuckets = this.state.scoreZones.length || 4;
			const slot = Math.max(1, Math.min(numBuckets, targetSlot));
			const sectionSize = width / numBuckets;
			// Center slot drop targets with safe horizontal offset variance
			startX = (sectionSize * (slot - 1)) + (sectionSize / 2) + ((Math.random() * 40) - 20);
		}

		this.activeTokens.push({
			user: user,
			token: cleanToken,
			x: startX,
			y: -30, 
			vx: (Math.random() * 3.5) - 1.75, 
			vy: 1,                         
			radius: 22, // Bigger physics model size mapping bounds 
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

		const gravityForce = (11 - (this.state.dropDuration || 4)) * 0.04 + 0.09; 
		const dynamicFriction = 0.56; 

		for (let i = this.activeTokens.length - 1; i >= 0; i--) {
			const t = this.activeTokens[i];
			if (!t) continue;

			if (t.isDying) {
				t.scale += 0.06;
				t.opacity -= 0.1;
				if (t.opacity <= 0) {
					this.activeTokens.splice(i, 1);
				}
				continue;
			}

			t.vy += gravityForce;
			t.x += t.vx;
			t.y += t.vy;

			// Handle Wall Bounds Collisions
			if (t.x - t.radius < 0) {
				t.x = t.radius;
				t.vx *= -dynamicFriction;
			} else if (t.x + t.radius > width) {
				t.x = width - t.radius;
				t.vx *= -dynamicFriction;
			}

			// Triangular Peg Collisions Loop
			for (let p of this.pegs) {
				const dx = t.x - p.x;
				const dy = t.y - p.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const minDist = t.radius + p.radius;

				if (dist < minDist) {
					const overlap = minDist - dist;
					const nx = dx / dist;
					const ny = dy / dist;

					t.x += nx * overlap;
					t.y += ny * overlap;

					const dotProduct = t.vx * nx + t.vy * ny;
					t.vx = (t.vx - 2 * dotProduct * nx) * dynamicFriction;
					t.vy = (t.vy - 2 * dotProduct * ny) * dynamicFriction;

					// Add extra sideways distribution drift momentum
					t.vx += (Math.random() * 1.6) - 0.8;
				}
			}

			const floorLine = height > 50 ? height - 47 : height;
			if (t.y >= floorLine) {
				t.isDying = true;
				const finalXPercent = (t.x / width) * 100;
				this.evaluateLandingZoneScore(t.user, finalXPercent, t.isSolo);
			}
		}
	}

	drawPhysicsScene() {
		if (!this.physicsCtx || !this.physicsCanvas) return;
		this.physicsCtx.clearRect(0, 0, this.physicsCanvas.width, this.physicsCanvas.height);

		// Render Alternate-Spaced Plinko Grid Peg Pins
		for (let p of this.pegs) {
			this.physicsCtx.fillStyle = "rgba(168, 85, 247, 0.45)";
			this.physicsCtx.beginPath();
			this.physicsCtx.arc(p.x, p.y, p.radius + 1.5, 0, Math.PI * 2);
			this.physicsCtx.fill();
			
			this.physicsCtx.fillStyle = "#ffffff";
			this.physicsCtx.beginPath();
			this.physicsCtx.arc(p.x, p.y, p.radius * 0.45, 0, Math.PI * 2);
			this.physicsCtx.fill();
		}

		// Render Dynamic Active Tokens (Upscaled Font Sizes)
		this.physicsCtx.textAlign = "center";
		this.physicsCtx.textBaseline = "middle";

		this.activeTokens.forEach(t => {
			if (!t) return;
			this.physicsCtx.save();
			this.physicsCtx.globalAlpha = t.opacity;
			this.physicsCtx.translate(t.x, t.y);
			this.physicsCtx.scale(t.scale, t.scale);

			// Render the scaled up emoji token graphic
			this.physicsCtx.font = "34px Arial";
			this.physicsCtx.fillText(t.token, 0, -4);

			// User Label Nameplates
			this.physicsCtx.font = "bold 10px monospace";
			this.physicsCtx.fillStyle = t.isSolo ? "rgba(34, 197, 94, 0.9)" : "rgba(24, 24, 27, 0.88)";
			const textWidth = this.physicsCtx.measureText(t.user).width;
			
			this.physicsCtx.fillRect(-((textWidth + 8) / 2), 18, textWidth + 8, 14);
			this.physicsCtx.fillStyle = "#ffffff";
			this.physicsCtx.fillText(t.user, 0, 25);

			this.physicsCtx.restore();
		});
	}

	evaluateLandingZoneScore(user, finalXPercent, isSolo = false) {
		const zones = this.state.scoreZones || [];
		const numZones = zones.length || 4;
		
		// Find matching bucket target segment index distribution percentage
		const zoneIndex = Math.min(numZones - 1, Math.floor(finalXPercent / (100 / numZones)));
		const matchedBucket = zones[zoneIndex] || zones[numZones - 1];
		
		if (isSolo) {
			if (matchedBucket.multiplier > 0) {
				this.sendNotice(`✨ [SOLO] @${user} hit the [${matchedBucket.label}] slot for a casual ${matchedBucket.multiplier} points!`);
			} else {
				this.sendNotice(`💨 [SOLO] @${user} dropped straight into the [${matchedBucket.label}] hazard!`);
			}
			return; // Do not modify leaderboard datasets during unregulated solo runs
		}

		// Ensure score objects remain safe
		if (!this.state.scores) this.state.scores = {};
		if (!this.state.currentMatchScores) this.state.currentMatchScores = {};

		// 1. Process Current Match Tracker Standings
		const currentMatchHigh = this.state.currentMatchScores[user] || 0;
		if (matchedBucket.multiplier > currentMatchHigh) {
			this.state.currentMatchScores[user] = matchedBucket.multiplier;
		}

		// 2. Process Session Highscores
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

		// ⚡ Render Current Match UI Container
		const matchContainer = panel.querySelector('#dz-match-list');
		if (matchContainer) {
			const matchEntries = Object.entries(this.state.currentMatchScores || {})
				.sort((a, b) => b[1] - a[1]).slice(0, 5);

			if (matchEntries.length === 0) {
				matchContainer.innerHTML = `<div style="color: #71717a; text-align: center; padding: 6px 0;">No active match scores...</div>`;
			} else {
				matchContainer.innerHTML = matchEntries.map(([name, score], idx) => `
					<div style="display: flex; justify-content: space-between; padding: 2px 4px; background: ${idx === 0 ? 'rgba(168,85,247,0.08)' : 'transparent'};">
						<span style="color: #c084fc; font-weight:bold;">#${idx + 1} ${name}</span>
						<span style="color: #a855f7;">${score} Pts</span>
					</div>
				`).join('');
			}
		}

		// 🏆 Render Session Highscores Container
		const leaderContainer = panel.querySelector('#dz-leaderboard-list');
		if (leaderContainer) {
			const sessionEntries = Object.entries(this.state.scores || {})
				.sort((a, b) => b[1] - a[1]).slice(0, 5);

			if (sessionEntries.length === 0) {
				leaderContainer.innerHTML = `<div style="color: #71717a; text-align: center; padding: 6px 0;">No entries indexed yet...</div>`;
			} else {
				leaderContainer.innerHTML = sessionEntries.map(([name, score], idx) => `
					<div style="display: flex; justify-content: space-between; padding: 2px 4px; background: ${idx % 2 === 0 ? 'rgba(255,255,255,0.02)' : 'transparent'};">
						<span style="color: #e4e4e7; font-weight:normal;">#${idx + 1} ${name}</span>
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

	// ========================================================================
	// 🔌 CHAT ROUTING AND COMMAND MATRIX MANIFEST
	// ========================================================================
	getModuleCommands() {
		return [
			{
				name: 'drop', // Usage: !drop [emoji] [slot 1-4]
				defaultChat: true,
				defaultCp: true,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('drop', flags)) return;
					const parts = message.trim().split(/\s+/);
					let token = "🪙";
					let slot = null;

					if (parts.length > 0 && parts[0] !== "") token = parts[0];
					if (parts.length > 1) {
						const pInt = parseInt(parts[1], 10);
						if (!isNaN(pInt)) slot = pInt;
					}
					this.executeDropAction(user, token, slot, false);
				}
			},
			{
				name: 'dropemoji', // Unregulated sandbox dropping command usage trigger: !dropemoji [token] [slot]
				defaultChat: true,
				defaultCp: true,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('dropemoji', flags)) return;
					const parts = message.trim().split(/\s+/);
					let token = "✨";
					let slot = null;

					if (parts.length > 0 && parts[0] !== "") token = parts[0];
					if (parts.length > 1) {
						const pInt = parseInt(parts[1], 10);
						if (!isNaN(pInt)) slot = pInt;
					}
					// Bypasses match checks to run completely separately from competitive games
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
				name: 'setgravity', // Usage: !setgravity [1-10]
				defaultChat: false,
				defaultCp: true,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('setgravity', flags)) return;
					const val = parseInt(message.trim(), 10);
					if (!isNaN(val) && val >= 1 && val <= 10) {
						this.state.dropDuration = val;
						this.saveData();
						this.sendNotice(`⚙️ Emojinko gravity velocity drop parameter updated to ${val}s.`);
						// Force panel control slider repaint sync if template window is open
						const slider = document.getElementById(this.controlId)?.querySelector('#dz-gravity-slider');
						if (slider) slider.value = val;
						const txt = document.getElementById(this.controlId)?.querySelector('#dz-grav-txt');
						if (txt) txt.textContent = `${val}s`;
					}
				}
			},
			{
				name: 'setlimit', // Usage: !setlimit [1-20]
				defaultChat: false,
				defaultCp: true,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('setlimit', flags)) return;
					const val = parseInt(message.trim(), 10);
					if (!isNaN(val) && val >= 1 && val <= 20) {
						this.state.maxDropsPerUser = val;
						this.saveData();
						this.sendNotice(`⚙️ Emojinko maximum drop cap limit restricted to ${val} per user.`);
						const slider = document.getElementById(this.controlId)?.querySelector('#dz-limit-slider');
						if (slider) slider.value = val;
						const txt = document.getElementById(this.controlId)?.querySelector('#dz-limit-txt');
						if (txt) txt.textContent = val;
					}
				}
			}
		];
	}
}