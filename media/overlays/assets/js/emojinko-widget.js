import { BaseWidgetModule } from './BaseWidgetModule.js';

// ============================================================================
// 🎨 Emojinko VIEW TEMPLATES (Dashboard Manager Layout)
// ============================================================================
const Emojinko_HTMLTEMPLATES = {
	dashboard: (dropDuration, maxDrops) => `
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
				<input type="range" id="dz-gravity-slider" min="1" max="10" value="${dropDuration}" style="flex: 1; cursor: pointer; accent-color: var(--accent, #a855f7);">
				<span id="dz-grav-txt" style="font-size: 12px; font-family: monospace;">${dropDuration}s</span>
			</div>

			<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
				<span style="font-size: 12px; color: #a1a1aa; min-width: 70px;">Drops / User</span>
				<input type="range" id="dz-limit-slider" min="1" max="20" value="${maxDrops}" style="flex: 1; cursor: pointer; accent-color: var(--accent, #a855f7);">
				<span id="dz-limit-txt" style="font-size: 12px; font-family: monospace;">${maxDrops}</span>
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

		// 🌟 FIX 1: Establish safe fallback baselines before loadData executes parsing maps
		this.state = {
			gameEnabled: true,
			dropDuration: 4, 
			maxDropsPerUser: 3, 
			scores: {},      
			userDropTracker: {}, 
			commandAccess: this.state?.commandAccess || {}
		};

		// Loop Variables for our native 2D canvas simulation loop
		this.pegs = [];
		this.activeTokens = [];
		this.canvas = null;
		this.ctx = null;
		this.animationFrameId = null;

		this.loadData();

		// Kick off mandatory control matrix DOM reevaluation patterns
		const matrixTarget = document.getElementById(this.controlId)?.querySelector('.matrix-container-target');
		if (matrixTarget) {
			matrixTarget.innerHTML = this.renderCommandRouterMatrixHTML();
		}

		// 🌟 FIX 2: Trigger viewport initialization immediately at module boot sequence phase
		setTimeout(() => this.injectViewportOverlay(), 200);
	}

	loadData() {
		super.loadData(); 

		// Ensure nested complex tracking objects aren't dropped during runtime extensions
		if (!this.state.scores) this.state.scores = {};
		if (!this.state.userDropTracker) this.state.userDropTracker = {};
		if (this.state.dropDuration === undefined) this.state.dropDuration = 4;
		if (this.state.maxDropsPerUser === undefined) this.state.maxDropsPerUser = 3;

		this.scoreZones = [
			{ minX: 0, maxX: 25, label: "100 Pts", multiplier: 100 },
			{ minX: 25, maxX: 50, label: "💥 RIP", multiplier: 0 },
			{ minX: 50, maxX: 75, label: "🍀 LUCKY", multiplier: 500 },
			{ minX: 75, maxX: 100, label: "50 Pts", multiplier: 50 }
		];
	}

	getControlsMarkup() {
		// 🌟 FIX 3: Dynamic parameter interpolation avoids 'undefined' value displays on load
		return `
			${Emojinko_HTMLTEMPLATES.dashboard(this.state.dropDuration, this.state.maxDropsPerUser)}
			${Emojinko_HTMLTEMPLATES.leaderboard}
		`;
	}

	/**
	 * VIEWPORT OVERLAY CANVAS ASSEMBLY
	 */
	injectViewportOverlay() {
		// 1. Ensure we don't duplicate the element layer
		if (document.getElementById(this.overlayId)) return;

		// 2. Locate your streaming container layout template target
		let overlayWrapper = document.getElementById("overlay-wrapper") || 
		                     document.getElementById("main-layout") || 
		                     document.querySelector(".ttv-overlay-container") || // Added fallbacks
		                     document.body;
		
		const overlayEl = document.createElement("div");
		overlayEl.id = this.overlayId;
		
		// 🌟 FIX: Force explicit high-visibility bounds on the wrapper layout element
		overlayEl.style.cssText = `
			position: absolute; 
			top: 0; 
			left: 0; 
			width: 100vw; 
			height: 100vh; 
			pointer-events: none; 
			overflow: hidden; 
			z-index: 9999;
		`;
		
		overlayEl.innerHTML = `
			<canvas id="dz-physics-canvas" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; display: block;"></canvas>

			<div id="dz-bucket-row" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 40px; display: flex; background: rgba(24,24,27,0.9); border-top: 2px solid var(--accent, #a855f7); font-family: monospace; text-align: center; line-height: 40px; font-weight: bold; color: #fff; font-size: 11px; z-index: 10000;">
				<div style="flex: 1; border-right: 1px dashed #3f3f46; background: rgba(168,85,247,0.1);">100 PTS</div>
				<div style="flex: 1; border-right: 1px dashed #3f3f46; background: rgba(239,68,68,0.1); color: #ef4444;">💥 RIP</div>
				<div style="flex: 1; border-right: 1px dashed #3f3f46; background: rgba(34,197,94,0.1); color: #22c55e;">🍀 LUCKY</div>
				<div style="flex: 1; background: rgba(168,85,247,0.1);">50 PTS</div>
			</div>
		`;
		
		overlayWrapper.appendChild(overlayEl);

		this.canvas = document.getElementById("dz-physics-canvas");
		if (this.canvas) {
			this.ctx = this.canvas.getContext("2d");
			
			// Force layout sizing calculations
			this.resizePhysicsCanvas();
			
			// Safely bind scaling listeners
			window.removeEventListener('resize', () => this.resizePhysicsCanvas());
			window.addEventListener('resize', () => this.resizePhysicsCanvas());
			
			this.startPhysicsLoop();
		}
	}

	resizePhysicsCanvas() {
		if (!this.canvas) return;
		
		// 🌟 FIX: If layout container parameters parse to 0, default directly to screen view dimensions
		const targetWidth = this.canvas.parentElement.clientWidth || window.innerWidth;
		const targetHeight = this.canvas.parentElement.clientHeight || window.innerHeight;
		
		this.canvas.width = targetWidth;
		this.canvas.height = targetHeight;
		
		console.log(`📐 [Emojinko Engine]: Physics Resolution set to ${targetWidth}x${targetHeight}`);
		
		// Recompute peg geometry arrays safely inside the new valid boundaries
		this.generatePlinkoPegMatrix(); 
	}
	/**
	 * PLINKO PEG FIELD GENERATOR
	 */
	generatePlinkoPegMatrix() {
		if (!this.canvas) return;
		this.pegs = [];

		const width = this.canvas.width;
		const height = this.canvas.height;
		
		const rows = 8;              
		const startY = height * 0.18; 
		const endY = height * 0.80;   
		const rowSpacing = (endY - startY) / rows;

		for (let r = 0; r < rows; r++) {
			const currentY = startY + (r * rowSpacing);
			// Stagger peg layouts per column to generate true organic pin reactions
			const isEven = (r % 2 === 0);
			const pegCount = isEven ? 9 : 10; 
			const colSpacing = width / (pegCount + 1);

			for (let c = 0; c < pegCount; c++) {
				// Offset even paths slightly to maintain proper lattice triangles
				const currentX = colSpacing * (c + 1);
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
			gravTxt.textContent = `${this.state.dropDuration}s`;
			gravSlider.addEventListener('input', (e) => {
				this.state.dropDuration = parseInt(e.target.value, 10);
				gravTxt.textContent = `${this.state.dropDuration}s`;
				this.saveData();
			});
		}

		const limitSlider = panel.querySelector('#dz-limit-slider');
		const limitTxt = panel.querySelector('#dz-limit-txt');
		if (limitSlider) {
			limitSlider.value = this.state.maxDropsPerUser;
			limitTxt.textContent = this.state.maxDropsPerUser;
			limitSlider.addEventListener('input', (e) => {
				this.state.maxDropsPerUser = parseInt(e.target.value, 10);
				limitTxt.textContent = e.target.value;
				this.saveData();
			});
		}

		// 🌟 FIX 4: Complete reset coverage maps across all runtime scopes
		const clearBtn = panel.querySelector('#dz-btn-clear');
		if (clearBtn) {
			clearBtn.addEventListener('click', (e) => {
				e.preventDefault();
				e.stopPropagation();
				this.state.scores = {};
				this.state.userDropTracker = {}; 
				this.activeTokens = []; // Clear current active tokens
				this.saveData();
				this.renderLeaderboardUI();
				this.sendNotice("🧹 Emojinko scoreboard, tokens, and drop limits cleared!");
			});
		}
	}

	/**
	 * CHAT DROP ACTION WITH TARGET BOUNDS
	 */
	executeDropAction(user, customToken = "🪙", targetSlot = null) {
		if (!this.state.gameEnabled) return;
		
		// Force dynamic instantiation loop check to ensure canvas references aren't broken
		if (!this.canvas || !document.getElementById(this.overlayId)) {
			this.injectViewportOverlay();
		}

		if (!this.state.userDropTracker) this.state.userDropTracker = {};
		
		const userCount = this.state.userDropTracker[user] || 0;
		if (userCount >= this.state.maxDropsPerUser) {
			this.sendNotice(`🚫 Sorry @${user}, you've hit your max entry limit of ${this.state.maxDropsPerUser} drops this game!`);
			return;
		}

		this.state.userDropTracker[user] = userCount + 1;
		this.saveData();

		const cleanToken = customToken.substring(0, 5);
		const width = this.canvas ? this.canvas.width : window.innerWidth;
		
		let startX = Math.random() * (width * 0.9);

		if (targetSlot !== null) {
			const slot = Math.max(1, Math.min(4, targetSlot));
			const sectionSize = width / 4;
			startX = (sectionSize * (slot - 1)) + (sectionSize / 2) + ((Math.random() * 20) - 10);
		}

		this.activeTokens.push({
			user: user,
			token: cleanToken,
			x: startX,
			y: -20,
			vx: (Math.random() * 1.5) - 0.75, 
			vy: 1,                       
			radius: 12,                  
			scale: 1,
			opacity: 1,
			isDying: false
		});
	}

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

		// Normalized physical gravity vector constant translations
		const gravityForce = (11 - this.state.dropDuration) * 0.04 + 0.05; 
		const dynamicFriction = 0.58; 

		for (let i = this.activeTokens.length - 1; i >= 0; i--) {
			const t = this.activeTokens[i];

			if (t.isDying) {
				t.scale += 0.04;
				t.opacity -= 0.08;
				if (t.opacity <= 0) {
					this.activeTokens.splice(i, 1);
				}
				continue;
			}

			t.vy += gravityForce;
			t.x += t.vx;
			t.y += t.vy;

			// Handle edge bounces
			if (t.x - t.radius < 0) {
				t.x = t.radius;
				t.vx *= -dynamicFriction;
			} else if (t.x + t.radius > width) {
				t.x = width - t.radius;
				t.vx *= -dynamicFriction;
			}

			// Core Circle-to-Point Peg Vector Collisions
			for (let p of this.pegs) {
				const dx = t.x - p.x;
				const dy = t.y - p.y;
				const dist = Math.sqrt(dx * dx + dy * dy);
				const minDist = t.radius + p.radius;

				if (dist < minDist) {
					const overlap = minDist - dist;
					const nx = dx / dist;
					const ny = dy / dist;

					// Push token out of the peg path geometry space
					t.x += nx * overlap;
					t.y += ny * overlap;

					const dotProduct = t.vx * nx + t.vy * ny;
					t.vx = (t.vx - 2 * dotProduct * nx) * dynamicFriction;
					t.vy = (t.vy - 2 * dotProduct * ny) * dynamicFriction;

					// Inject horizontal dispersion variance
					t.vx += (Math.random() * 0.8) - 0.4;
				}
			}

			// Landing Row detection boundaries
			if (t.y >= height - 55) {
				t.isDying = true;
				const finalXPercent = (t.x / width) * 100;
				this.evaluateLandingZoneScore(t.user, finalXPercent);
			}
		}
	}

	drawPhysicsScene() {
		if (!this.ctx || !this.canvas) return;

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// 1. Render Peg Matrix Pins Layout
		for (let p of this.pegs) {
			this.ctx.fillStyle = "rgba(168, 85, 247, 0.35)";
			this.ctx.beginPath();
			this.ctx.arc(p.x, p.y, p.radius + 2, 0, Math.PI * 2);
			this.ctx.fill();
			
			this.ctx.fillStyle = "#ffffff";
			this.ctx.beginPath();
			this.ctx.arc(p.x, p.y, p.radius * 0.5, 0, Math.PI * 2);
			this.ctx.fill();
		}

		// 2. Render Falling Tokens Layout Arrays
		this.ctx.textAlign = "center";
		this.ctx.textBaseline = "middle";

		this.activeTokens.forEach(t => {
			this.ctx.save();
			this.ctx.globalAlpha = t.opacity;
			this.ctx.translate(t.x, t.y);
			this.ctx.scale(t.scale, t.scale);

			this.ctx.font = "24px Arial";
			this.ctx.fillStyle = "#000000";
			this.ctx.fillText(t.token, 1.5, 1.5);
			this.ctx.fillStyle = "#ffffff";
			this.ctx.fillText(t.token, 0, 0);

			this.ctx.font = "bold 9px monospace";
			this.ctx.fillStyle = "rgba(15, 15, 15, 0.8)";
			const textWidth = this.ctx.measureText(t.user).width;
			
			this.ctx.fillRect(-((textWidth + 6) / 2), 14, textWidth + 6, 11);
			this.ctx.fillStyle = "#e4e4e7";
			this.ctx.fillText(t.user, 0, 20);

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

	getModuleCommands() {
		return [
			{
				name: 'drop',
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