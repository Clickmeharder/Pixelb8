import { BaseWidgetModule } from './BaseWidgetModule.js';

// ============================================================================
// 🎨 Emojinko VIEW TEMPLATES (Dashboard Manager Layout)
// ============================================================================
const Emojinko_HTMLTEMPLATES = {
	dashboard: `
		<div style="background: #18181b; padding: 12px; border: 1px solid #27272a; border-radius: 6px; margin-bottom: 15px;">
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
				<h4 style="margin: 0; color: var(--accent, #a855f7); font-size: 14px;">🎯 Emojinko Controller</h4>
				<button id="dz-btn-clear" class="p8-btn alt-btn" style="font-size: 11px; padding: 2px 8px;">Reset Scores</button>
			</div>

			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
				<span style="font-size: 13px; color: #e4e4e7;">Game Acceptance Loop</span>
				<label class="p8-switch">
					<input type="checkbox" id="dz-toggle-active" checked>
					<span class="p8-slider"></span>
				</label>
			</div>

			<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
				<span style="font-size: 12px; color: #a1a1aa; min-width: 70px;">Gravity Velocity</span>
				<input type="range" id="dz-gravity-slider" min="1" max="10" value="4" style="flex: 1; cursor: pointer; accent-color: var(--accent, #a855f7);">
				<span id="dz-grav-txt" style="font-size: 12px; font-family: monospace;">4s</span>
			</div>

			<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
				<span style="font-size: 12px; color: #a1a1aa; min-width: 70px;">Drops / User</span>
				<input type="range" id="dz-limit-slider" min="1" max="20" value="3" style="flex: 1; cursor: pointer; accent-color: var(--accent, #a855f7);">
				<span id="dz-limit-txt" style="font-size: 12px; font-family: monospace;">3</span>
			</div>
		</div>
	`,

	leaderboard: `
		<div style="background: #18181b; padding: 12px; border: 1px solid #27272a; border-radius: 6px;">
			<h4 style="margin: 0 0 8px 0; color: #e4e4e7; font-size: 13px;">🏆 Top Drop Placements</h4>
			<div id="dz-leaderboard-list" style="font-family: monospace; font-size: 12px; display: flex; flex-direction: column; gap: 4px; max-height: 150px; overflow-y: auto;">
				<div style="color: #a1a1aa; text-align: center; padding: 10px 0;">No entries dropped yet...</div>
			</div>
		</div>
	`
};

export class StreamEmojinkoModule extends BaseWidgetModule {
	constructor() {
		super("stream_Emojinko", {
			menuTitle: "🎯 Emojinko"
		});

		// ✅ Expanded Architecture State Extension
		this.state = {
			gameEnabled: true,
			dropDuration: 4, 
			maxDropsPerUser: 3, // 🎚️ New dynamic property limit variable
			scores: {},      
			userDropTracker: {}, // Tracks drop limits per game session
			commandAccess: this.state?.commandAccess || {}
		};

		// Loop Variables for our native 2D canvas simulation loop
		this.pegs = [];
		this.activeTokens = [];
		this.canvas = null;
		this.ctx = null;
		this.animationFrameId = null;

		this.loadData();

		const matrixTarget = document.getElementById(this.controlId)?.querySelector('.matrix-container-target');
		if (matrixTarget) {
			matrixTarget.innerHTML = this.renderCommandRouterMatrixHTML();
		}
	}

	loadData() {
		super.loadData(); 

		this.scoreZones = [
			{ minX: 0, maxX: 25, label: "100 Pts", multiplier: 100 },
			{ minX: 25, maxX: 50, label: "💥 RIP", multiplier: 0 },
			{ minX: 50, maxX: 75, label: "🍀 LUCKY", multiplier: 500 },
			{ minX: 75, maxX: 100, label: "50 Pts", multiplier: 50 }
		];
	}

	getControlsMarkup() {
		return `
			${Emojinko_HTMLTEMPLATES.dashboard}
			${Emojinko_HTMLTEMPLATES.leaderboard}
		`;
	}

	/**
	 * VIEWPORT OVERLAY CANVAS ASSEMBLY
	 * Generates canvas overlay dimensions alongside mechanical peg arrays.
	 */
	injectViewportOverlay() {
		const overlayWrapper = document.getElementById("overlay-wrapper");
		if (!overlayWrapper || document.getElementById(this.overlayId)) return;

		const overlayEl = document.createElement("div");
		overlayEl.id = this.overlayId;
		overlayEl.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; z-index: 10;`;
		
		overlayEl.innerHTML = `
			<canvas id="dz-physics-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;"></canvas>

			<div id="dz-bucket-row" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 40px; display: flex; background: rgba(24,24,27,0.75); border-top: 2px solid var(--accent, #a855f7); font-family: monospace; text-align: center; line-height: 40px; font-weight: bold; color: #fff; font-size: 11px;">
				<div style="flex: 1; border-right: 1px dashed #3f3f46; background: rgba(168,85,247,0.1);">100 PTS</div>
				<div style="flex: 1; border-right: 1px dashed #3f3f46; background: rgba(239,68,68,0.1); color: #ef4444;">💥 RIP</div>
				<div style="flex: 1; border-right: 1px dashed #3f3f46; background: rgba(34,197,94,0.1); color: #22c55e;">🍀 LUCKY</div>
				<div style="flex: 1; background: rgba(168,85,247,0.1);">50 PTS</div>
			</div>
		`;
		
		overlayWrapper.appendChild(overlayEl);

		// Link context pointers to the freshly injected DOM canvas layer
		this.canvas = document.getElementById("dz-physics-canvas");
		if (this.canvas) {
			this.ctx = this.canvas.getContext("2d");
			this.resizePhysicsCanvas();
			window.addEventListener('resize', () => this.resizePhysicsCanvas());
			this.generatePlinkoPegMatrix();
			this.startPhysicsLoop();
		}
	}

	resizePhysicsCanvas() {
		if (!this.canvas) return;
		this.canvas.width = this.canvas.parentElement.clientWidth;
		this.canvas.height = this.canvas.parentElement.clientHeight;
		this.generatePlinkoPegMatrix(); // Re-render spacing safely across resolutions
	}

	/**
	 * PLINKO PEG FIELD GENERATOR
	 * Builds a triangular, staggered grid pattern down the screen.
	 */
	generatePlinkoPegMatrix() {
		if (!this.canvas) return;
		this.pegs = [];

		const width = this.canvas.width;
		const height = this.canvas.height;
		
		const rows = 9;              // Vertical fields
		const startY = height * 0.15; // Space below top text layouts
		const endY = height * 0.82;   // Finish space above buckets
		const rowSpacing = (endY - startY) / rows;

		for (let r = 0; r < rows; r++) {
			const currentY = startY + (r * rowSpacing);
			// Stagger counts between columns to split the drops across boundaries
			const pegCount = (r % 2 === 0) ? 10 : 11; 
			const colSpacing = width / (pegCount + 1);

			for (let c = 0; c < pegCount; c++) {
				const currentX = colSpacing * (c + 1);
				this.pegs.push({
					x: currentX,
					y: currentY,
					radius: 4.5
				});
			}
		}
	}

	bindEventListeners() {
		super.bindEventListeners(); 

		const panel = document.getElementById(this.controlId);
		if (!panel) return;

		this.renderLeaderboardUI();

		const activeToggle = panel.querySelector('#dz-toggle-active');
		if (activeToggle) {
			activeToggle.checked = this.state.gameEnabled;
			activeToggle.addEventListener('change', (e) => {
				this.state.gameEnabled = e.target.checked;
				this.saveData();
			});
		}

		const gravSlider = panel.querySelector('#dz-gravity-slider');
		const gravTxt = panel.querySelector('#dz-grav-txt');
		if (gravSlider) {
			gravSlider.value = this.state.dropDuration;
			if (gravTxt) gravTxt.textContent = `${this.state.dropDuration}s`;
			gravSlider.addEventListener('input', (e) => {
				this.state.dropDuration = parseInt(e.target.value, 10);
				if (gravTxt) gravTxt.textContent = `${this.state.dropDuration}s`;
				this.saveData();
			});
		}

		// 🎚️ Bind Dynamic Drop Cap Parameter Slider Controls
		const limitSlider = panel.querySelector('#dz-limit-slider');
		const limitTxt = panel.querySelector('#dz-limit-txt');
		if (limitSlider) {
			limitSlider.value = this.state.maxDropsPerUser || 3;
			if (limitTxt) limitTxt.textContent = limitSlider.value;
			limitSlider.addEventListener('input', (e) => {
				this.state.maxDropsPerUser = parseInt(e.target.value, 10);
				if (limitTxt) limitTxt.textContent = e.target.value;
				this.saveData();
			});
		}

		panel.addEventListener('click', (e) => {
			if (e.target.id === 'dz-btn-clear') {
				this.state.scores = {};
				this.state.userDropTracker = {}; // Wipe dynamic usage sessions too
				this.saveData();
				this.renderLeaderboardUI();
				this.sendNotice("🧹 Emojinko scoreboard and game drop logs cleared!");
			}
		});
	}

	/**
	 * CHAT DROP ACTION WITH TARGET BOUNDS
	 * Calculates custom drop locations from !drop {emoji} {1-4} commands
	 */
	executeDropAction(user, customToken = "🪙", targetSlot = null) {
		if (!this.state.gameEnabled) return;
		if (!this.canvas) this.injectViewportOverlay();

		// Check drop limitations
		if (!this.state.userDropTracker) this.state.userDropTracker = {};
		const userCount = this.state.userDropTracker[user] || 0;
		if (userCount >= this.state.maxDropsPerUser) {
			this.sendNotice(`🚫 Sorry @${user}, you've hit your max entry limit of ${this.state.maxDropsPerUser} drops this game!`);
			return;
		}

		// Increment and lock usage index
		this.state.userDropTracker[user] = userCount + 1;
		this.saveData();

		const cleanToken = customToken.substring(0, 5);
		const width = this.canvas.width;
		
		let startX = Math.random() * (width * 0.9); // Default fall dispersion coordinates

		// Parse Slot Options 1 through 4 cleanly onto horizontal screen regions
		if (targetSlot !== null) {
			const slot = Math.max(1, Math.min(4, targetSlot));
			const sectionSize = width / 4;
			// Drop from the horizontal center of the selected quadrant block
			startX = (sectionSize * (slot - 1)) + (sectionSize / 2);
		}

		// Push the token object to the high-performance physics stack array
		this.activeTokens.push({
			user: user,
			token: cleanToken,
			x: startX,
			y: -40,
			vx: (Math.random() * 2) - 1, // Symmetrical side drift speed vectors
			vy: 2,                       // Initial velocity vector
			radius: 14,                  // Collision footprint size boundary
			scale: 1,
			opacity: 1,
			isDying: false
		});
	}

	/**
	 * NATIVE PHYSICS ENGINE LOOP
	 * High-performance requestAnimationFrame loop parsing canvas vector impacts.
	 */
	startPhysicsLoop() {
		if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);

		const loop = () => {
			this.updatePhysicsState();
			this.drawPhysicsScene();
			this.animationFrameId = requestAnimationFrame(loop);
		};
		this.animationFrameId = requestAnimationFrame(loop);
	}

	updatePhysicsState() {
		if (!this.canvas) return;

		const width = this.canvas.width;
		const height = this.canvas.height;

		// Scaled Gravity based inversely on your duration parameters
		const gravityForce = (11 - this.state.dropDuration) * 0.05; 
		const dynamicFriction = 0.65; // Dampening rebound scalar values

		for (let i = this.activeTokens.length - 1; i >= 0; i--) {
			const t = this.activeTokens[i];

			if (t.isDying) {
				t.scale += 0.05;
				t.opacity -= 0.1;
				if (t.opacity <= 0) {
					this.activeTokens.splice(i, 1);
				}
				continue;
			}

			// Apply acceleration forces
			t.vy += gravityForce;
			t.x += t.vx;
			t.y += t.vy;

			// Left/Right Screen boundary deflection math
			if (t.x - t.radius < 0) {
				t.x = t.radius;
				t.vx *= -dynamicFriction;
			} else if (t.x + t.radius > width) {
				t.x = width - t.radius;
				t.vx *= -dynamicFriction;
			}

			// Core Grid Matrix Peg Collision System Checks
			for (let p of this.pegs) {
				const dx = t.x - p.x;
				const dy = t.y - p.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const minDist = t.radius + p.radius;

				if (dist < minDist) {
					// Snap vector path position outside peg radius to prevent sticking glitches
					const overlap = minDist - dist;
					const nx = dx / dist;
					const ny = dy / dist;

					t.x += nx * overlap;
					t.y += ny * overlap;

					// Vector dot product reflection formulas
					const dotProduct = t.vx * nx + t.vy * ny;
					t.vx = (t.vx - 2 * dotProduct * nx) * dynamicFriction;
					t.vy = (t.vy - 2 * dotProduct * ny) * dynamicFriction;

					// Inject random mini-bounce offset variables to spice things up
					t.vx += (Math.random() * 0.6) - 0.3;
				}
			}

			// Check bucket floor trigger impacts
			if (t.y >= height - 60) {
				t.isDying = true;
				const finalXPercent = (t.x / width) * 100;
				this.evaluateLandingZoneScore(t.user, finalXPercent);
			}
		}
	}

	/**
	 * CANVAS RENDER ENGINE
	 * Rasterizes structural grid pins alongside active user elements.
	 */
	drawPhysicsScene() {
		if (!this.ctx || !this.canvas) return;

		// Clear frame surface
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// 1. Draw Plinko Grid Pins
		this.ctx.fillStyle = "rgba(168, 85, 247, 0.4)"; // Soft glow accent
		for (let p of this.pegs) {
			this.ctx.beginPath();
			this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
			this.ctx.fill();
			
			// Bright inner core pinpoint
			this.ctx.fillStyle = "#ffffff";
			this.ctx.beginPath();
			this.ctx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
			this.ctx.fill();
			this.ctx.fillStyle = "rgba(168, 85, 247, 0.4)";
		}

		// 2. Draw falling active chat tokens
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";

		this.activeTokens.forEach(t => {
			this.ctx.save();
			this.ctx.globalAlpha = t.opacity;
			this.ctx.translate(t.x, t.y);
			this.ctx.scale(t.scale, t.scale);

			// Render Master Text Shadow Backing
			this.ctx.font = "26px Arial";
			this.ctx.fillStyle = "#000000";
			this.ctx.fillText(t.token, 2, 2);

			// Render Primary Interactive Token Element
			this.ctx.fillStyle = "#ffffff";
			this.ctx.fillText(t.token, 0, 0);

			// Render Chatter Name Tag directly below the particle bounds
			this.ctx.font = "bold 9px monospace";
			this.ctx.fillStyle = "rgba(0,0,0,0.75)";
			const textWidth = this.ctx.measureText(t.user).width;
			
			this.ctx.fillRect(-((textWidth + 6) / 2), 15, textWidth + 6, 12);
			this.ctx.fillStyle = "#ffffff";
			this.ctx.fillText(t.user, 0, 21);

			this.ctx.restore();
		});
	}

	evaluateLandingZoneScore(user, finalXPercent) {
		const matchedBucket = this.scoreZones.find(zone => finalXPercent >= zone.minX && finalXPercent <= zone.maxX) || this.scoreZones[3];
		if (!this.state.scores) this.state.scores = {};
		
		const currentHigh = this.state.scores[user] || 0;
		if (matchedBucket.multiplier > currentHigh) {
			this.state.scores[user] = matchedBucket.multiplier;
			this.saveData();
			this.renderLeaderboardUI();
		}

		if (matchedBucket.multiplier > 0) {
			this.sendNotice(`🎯 @${user} bounced into [${matchedBucket.label}], hitting a highscore of ${matchedBucket.multiplier}!`);
		} else {
			this.sendNotice(`💀 Oof! @${user} smashed right into a [${matchedBucket.label}] hazard zone!`);
		}
	}

	renderLeaderboardUI() {
		const panel = document.getElementById(this.controlId);
		const container = panel?.querySelector('#dz-leaderboard-list');
		if (!container) return;

		const scoreLedger = this.state?.scores || {};
		const sortedEntries = Object.entries(scoreLedger)
			.sort((a, b) => b[1] - a[1])
			.slice(0, 5);

		if (sortedEntries.length === 0) {
			container.innerHTML = `<div style="color: #a1a1aa; text-align: center; padding: 10px 0;">No entries dropped yet...</div>`;
			return;
		}

		container.innerHTML = sortedEntries.map(([name, score], idx) => `
			<div style="display: flex; justify-content: space-between; padding: 2px 4px; background: ${idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent'};">
				<span style="color: var(--accent, #a855f7); font-weight:bold;">#${idx + 1} ${name}</span>
				<span style="color: #22c55e;">${score} Pts</span>
			</div>
		`).join('');
	}

	// ========================================================================
	// 🔌 CHAT ROUTING AND COMMAND MATRIX MANIFEST
	// ========================================================================
	getModuleCommands() {
		return [
			{
				name: 'drop', // Command format parsing: !drop {emoji} {slot-index}
				defaultChat: true,
				defaultCp: true,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('drop', flags)) return;

					const parts = message.trim().split(/\s+/);
					let targetToken = "🪙";
					let chosenSlot = null;

					if (parts.length > 0 && parts[0] !== "") {
						targetToken = parts[0];
					}

					// Process target column slots if the chatter passed 1, 2, 3, or 4
					if (parts.length > 1) {
						const parsedInt = parseInt(parts[1], 10);
						if (!isNaN(parsedInt) && parsedInt >= 1 && parsedInt <= 4) {
							chosenSlot = parsedInt;
						}
					}

					this.executeDropAction(user, targetToken, chosenSlot);
				}
			}
		];
	}
}