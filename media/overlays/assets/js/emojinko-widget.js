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
				<label class="p8-switch" style="cursor: pointer;">
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
		// Pass clean matching subkey identifier down to base layer configurations
		super("emojinko", {
			menuTitle: "🎯 Emojinko Plinko Game"
		});

		// 🛡️ HYDRATE EXTENDED STATE SAFE-GUARDS WITHOUT OVERWRITING CENTRAL STORAGE
		this.state.gameEnabled = this.state.gameEnabled !== undefined ? this.state.gameEnabled : true;
		this.state.dropDuration = this.state.dropDuration || 4;
		this.state.maxDropsPerUser = this.state.maxDropsPerUser || 3;
		if (!this.state.scores) this.state.scores = {};
		if (!this.state.userDropTracker) this.state.userDropTracker = {};

		// Dedicated local 2D environment properties isolated completely from base frame calls
		this.physicsCanvas = null;
		this.physicsCtx = null;
		this.pegs = [];
		this.activeTokens = [];
		this.physicsLoopId = null;

		// Explicit bucket coordinates mapped out across 100% vector bounds
		this.scoreZones = [
			{ minX: 0, maxX: 25, label: "100 Pts", multiplier: 100 },
			{ minX: 25, maxX: 50, label: "💥 RIP", multiplier: 0 },
			{ minX: 50, maxX: 75, label: "🍀 LUCKY", multiplier: 500 },
			{ minX: 75, maxX: 100, label: "50 Pts", multiplier: 50 }
		];

		// Neutralize internal system hooks so they won't compete for canvas space
		this.canvas = null;
		this.ctx = null;

		// Kickoff canvas generation
		this.injectViewportOverlay();
		
		// Synchronize permissions structure grid maps inside the dashboard
		const matrixTarget = document.getElementById(this.controlId)?.querySelector('.matrix-container-target');
		if (matrixTarget) {
			matrixTarget.innerHTML = this.renderCommandRouterMatrixHTML();
		}
	}

	getControlsMarkup() {
		return `
			${Emojinko_HTMLTEMPLATES.dashboard(this.state.dropDuration || 4, this.state.maxDropsPerUser || 3)}
			${Emojinko_HTMLTEMPLATES.leaderboard}
		`;
	}

	injectViewportOverlay() {
		if (document.getElementById("dz-emojinko-overlay-container")) return;

		const overlayWrapper = document.getElementById("overlay-wrapper") || 
		                       document.getElementById("main-layout") || 
		                       document.body;
		
		const overlayEl = document.createElement("div");
		overlayEl.id = "dz-emojinko-overlay-container";
		overlayEl.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;overflow:hidden;z-index:99999;";
		
		overlayEl.innerHTML = `
			<canvas id="dz-physics-canvas" style="position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;display:block;"></canvas>
			<div id="dz-bucket-row" style="position:absolute;bottom:0;left:0;width:100%;height:40px;display:flex;background:rgba(24,24,27,0.95);border-top:2px solid var(--accent,#a855f7);font-family:monospace;text-align:center;line-height:40px;font-weight:bold;color:#fff;font-size:11px;z-index:100000;">
				<div style="flex:1;border-right:1px dashed #3f3f46;background:rgba(168,85,247,0.05);">100 PTS</div>
				<div style="flex:1;border-right:1px dashed #3f3f46;background:rgba(239,68,68,0.1);color:#ef4444;">💥 RIP</div>
				<div style="flex:1;border-right:1px dashed #3f3f46;background:rgba(34,197,94,0.1);color:#22c55e;">🍀 LUCKY</div>
				<div style="flex:1;background:rgba(168,85,247,0.05);">50 PTS</div>
			</div>
		`;
		
		overlayWrapper.appendChild(overlayEl);

		this.physicsCanvas = document.getElementById("dz-physics-canvas");
		if (this.physicsCanvas) {
			this.physicsCtx = this.physicsCanvas.getContext("2d");

			this.resizePhysicsCanvas();
			
			// Safe window hook handling patterns
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

	generatePlinkoPegMatrix() {
		if (!this.physicsCanvas) return;
		this.pegs = [];

		const width = this.physicsCanvas.width;
		const height = this.physicsCanvas.height;
		
		const rows = 8;              
		const startY = height * 0.22; 
		const endY = height * 0.82;   
		const rowSpacing = (endY - startY) / rows;

		for (let r = 0; r < rows; r++) {
			const currentY = startY + (r * rowSpacing);
			const isEven = (r % 2 === 0);
			const pegCount = isEven ? 9 : 10; 
			const colSpacing = width / (pegCount + 1);

			for (let c = 0; c < pegCount; c++) {
				const currentX = colSpacing * (c + 1);
				this.pegs.push({
					x: currentX,
					y: currentY,
					radius: 4
				});
			}
		}
	}

	bindEventListeners() {
		super.bindEventListeners(); 

		const panel = document.getElementById(this.controlId);
		if (!panel) return;

		this.renderLeaderboardUI();

		// Handle live changes explicitly mapping back down to UI text elements
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
				this.state.userDropTracker = {}; 
				this.activeTokens = [];
				this.saveData();
				this.renderLeaderboardUI();
				this.sendNotice("🧹 Emojinko scoreboard, tokens, and drop limits cleared!");
			}
		});
	}

	executeDropAction(user, customToken = "🪙", targetSlot = null) {
		if (!this.state.gameEnabled) return;
		
		if (!this.physicsCanvas || !document.getElementById("dz-emojinko-overlay-container")) {
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
		const width = this.physicsCanvas ? this.physicsCanvas.width : window.innerWidth;
		
		let startX = Math.random() * (width * 0.8) + (width * 0.1);

		if (targetSlot !== null) {
			const slot = Math.max(1, Math.min(4, targetSlot));
			const sectionSize = width / 4;
			startX = (sectionSize * (slot - 1)) + (sectionSize / 2) + ((Math.random() * 40) - 20);
		}

		this.activeTokens.push({
			user: user,
			token: cleanToken,
			x: startX,
			y: -20, 
			vx: (Math.random() * 3) - 1.5, 
			vy: 1,                        
			radius: 14,                    
			scale: 1,
			opacity: 1,
			isDying: false
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

		// Calculate realistic speed vectors using the control panel slider properties safely
		const gravityForce = (11 - (this.state.dropDuration || 4)) * 0.04 + 0.08; 
		const dynamicFriction = 0.58; 

		for (let i = this.activeTokens.length - 1; i >= 0; i--) {
			const t = this.activeTokens[i];

			if (t.isDying) {
				t.scale += 0.05;
				t.opacity -= 0.08;
				if (t.opacity <= 0) {
					this.activeTokens.splice(i, 1);
				}
				continue;
			}

			t.vy += gravityForce;
			t.x += t.vx;
			t.y += t.vy;

			// Handle boundaries
			if (t.x - t.radius < 0) {
				t.x = t.radius;
				t.vx *= -dynamicFriction;
			} else if (t.x + t.radius > width) {
				t.x = width - t.radius;
				t.vx *= -dynamicFriction;
			}

			// Rigid peg interaction math
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

					// Add extra organic plinko bounce variation
					t.vx += (Math.random() * 1.4) - 0.7;
				}
			}

			const floorLine = height > 50 ? height - 42 : height;
			if (t.y >= floorLine) {
				t.isDying = true;
				const finalXPercent = (t.x / width) * 100;
				this.evaluateLandingZoneScore(t.user, finalXPercent);
			}
		}
	}

	drawPhysicsScene() {
		if (!this.physicsCtx || !this.physicsCanvas) return;

		this.physicsCtx.clearRect(0, 0, this.physicsCanvas.width, this.physicsCanvas.height);

		// Render Plinko Grid Peg Pins
		for (let p of this.pegs) {
			this.physicsCtx.fillStyle = "rgba(168, 85, 247, 0.4)";
			this.physicsCtx.beginPath();
			this.physicsCtx.arc(p.x, p.y, p.radius + 1, 0, Math.PI * 2);
			this.physicsCtx.fill();
			
			this.physicsCtx.fillStyle = "#ffffff";
			this.physicsCtx.beginPath();
			this.physicsCtx.arc(p.x, p.y, p.radius * 0.4, 0, Math.PI * 2);
			this.physicsCtx.fill();
		}

		// Render Dynamic Active Tokens
		this.physicsCtx.textAlign = "center";
		this.physicsCtx.textBaseline = "middle";

		this.activeTokens.forEach(t => {
			this.physicsCtx.save();
			this.physicsCtx.globalAlpha = t.opacity;
			this.physicsCtx.translate(t.x, t.y);
			this.physicsCtx.scale(t.scale, t.scale);

			this.physicsCtx.font = "24px Arial";
			this.physicsCtx.fillText(t.token, 0, 0);

			this.physicsCtx.font = "bold 9px monospace";
			this.physicsCtx.fillStyle = "rgba(24, 24, 27, 0.85)";
			const textWidth = this.physicsCtx.measureText(t.user).width;
			
			this.physicsCtx.fillRect(-((textWidth + 6) / 2), 14, textWidth + 6, 13);
			this.physicsCtx.fillStyle = "#ffffff";
			this.physicsCtx.fillText(t.user, 0, 20);

			this.physicsCtx.restore();
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

		const scoreLedger = this.state.scores || {};
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

	destroy() {
		if (this.physicsLoopId) {
			cancelAnimationFrame(this.physicsLoopId);
		}
		if (this._resizeHandler) {
			window.removeEventListener('resize', this._resizeHandler);
		}
		const container = document.getElementById("dz-emojinko-overlay-container");
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