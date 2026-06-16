/**
 * ============================================================================
 * PIXELB8 ECOSYSTEM WIDGET COMPONENT: STREAM BIT-MINER
 * Architecture: Clean Extension of the BaseWidgetModule Blueprint.
 * Variant: Integrated Automation Framework (v1.4 Compliance)
 * ============================================================================
 */

import { BaseWidgetModule } from "./BaseWidgetModule.js";

const MINER_CONFIG = {
	SAND_COLOR: "#dfc26d",
	ORE_COLOR: "#ffb703",
	SPARK_COLORS: ["#ff0055", "#00ffcc", "#ffcc00"]
};

function createMinerRegistry() {
	return {
		activeProfile: "streamer_miner",
		profiles: {
			default: { name: "System Echo", totalTicks: 0, level: 1 }, // Retain core fallback node
			streamer_miner: { name: "Crypto-Cracker v1", totalMined: 0, depthMeters: 12 }
		}
	};
}

function createMinerState() {
	return {
		isVisible: true,
		hideBorder: false,
		zoomScale: 0,
		particles: [],
		action: "idle",
		actionTimer: 0,
		heatLevel: 0,
		rockHealth: 100,
		commandAccess: {}, // Shared tracking registry
		layout: {
			anchorX: 50,
			anchorY: 75,
			showProps: true
		}
	};
}

const MINER_ACTION_LIBRARY = {
	idle: (widget, ctx) => {
		if (widget.state.heatLevel > 0) widget.state.heatLevel -= 0.2;
/* 		if (ctx.t % 300 === 0 && Math.random() < 0.3) {
			widget.setWidgetBubble("Sensors scanning subterranean layers...");
		} */
	},
	processing: (widget, ctx) => {
		if (widget.state.actionTimer > 0) {
			widget.state.actionTimer--;
			if (widget.state.heatLevel < 100) widget.state.heatLevel += 1.5;

			const origin = widget.getPos(widget.state.layout.anchorX, widget.state.layout.anchorY);
			widget.state.particles.push({
				x: origin.x + (Math.random() - 0.5) * 40,
				y: origin.y - 10,
				vx: (Math.random() - 0.5) * 6,
				vy: -3 - Math.random() * 4,
				s: 2 + Math.random() * 3,
				c: MINER_CONFIG.SPARK_COLORS[Math.floor(Math.random() * MINER_CONFIG.SPARK_COLORS.length)],
				life: 25
			});
		} else {
			widget.state.action = "idle";
			widget.registry.profiles.streamer_miner.totalMined += Math.floor(Math.random() * 5) + 1;
			widget.registry.profiles.streamer_miner.depthMeters += 2;
			widget.sendNotice("✨ ORE VEIN SHATTERED! Bits mined successfully.");
			widget.saveData();
		}
	}
};

export class StreamBitMinerWidget extends BaseWidgetModule {
	constructor() {
		// 1. Initialize the base class framework
		super("bit_miner_system", {
			menuTitle: "⛏️ PixelB8 Deep-Core Bit Miner Matrix"
		});
		
		// 2. ✅ MERGE state and registry instead of overwriting them completely
		this.registry.profiles = {
			...this.registry.profiles,
			...createMinerRegistry().profiles
		};
		this.registry.activeProfile = "streamer_miner";

		this.state = {
			...this.state,
			...createMinerState(),
			commandAccess: this.state.commandAccess || {} // Retain the matrix reference
		};

		// 3. Re-sync data and force the UI Matrix re-render pass
		this.loadData();
		
		// 4. Force a fresh markup calculation now that commands are reconciled
		const matrixTarget = document.getElementById(this.controlId)?.querySelector('.matrix-container-target');
		if (matrixTarget) {
			matrixTarget.innerHTML = this.renderCommandRouterMatrixHTML();
		}
	}

	/**
	 * Integrated dynamic panel intersection.
	 * Returns module-specific dashboard panels to inject straight into the base markup layout.
	 */
	getControlsMarkup() {
		return `
			<div style="background: #141414; padding: 8px; border-radius: 4px; border: 1px solid #27272a;">
				<label style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Telemetry Frame Config</label>
				<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 12px; color: #fff;">
					<span>Hide Overlay Framing Outline</span>
					<input type="checkbox" id="widgetHideBorderToggle" ${this.state.hideBorder ? 'checked' : ''}>
				</div>
			</div>
			<button type="button" id="${this.baseId}-btnMine" class="p8-btn" style="background: #e67e22; border: 1px solid #f39c12; padding: 8px 0; font-size: 11px; cursor: pointer; color: #fff; font-weight: bold; border-radius: 4px;">
				💥 ENGAGE SONIC EXCAVATOR DRILL
			</button>
			<button type="button" id="${this.baseId}-btnReset" class="p8-btn" style="background: #991b1b; border: 1px solid #ef4444; padding: 6px 0; font-size: 11px; margin-top: 5px; cursor: pointer; color: #fff; font-weight: bold; border-radius: 4px;">
				⚠️ PURGE MINERAL REGISTRY CACHE
			</button>
		`;
	}

	/**
	 * Appends child control-panel button operations directly into the structural framework.
	 */
	syncUIPanelElements() {
		const controlPanel = document.getElementById(this.controlId);
		if (!controlPanel) return;

		// Re-sync specialized elements matching current local data profiles on initial UI render passes
		const borderToggle = controlPanel.querySelector('#widgetHideBorderToggle');
		if (borderToggle) {
			borderToggle.checked = this.state.hideBorder || false;
		}
	}

	/**
	 * Extends the centralized click dispatch engines for module actions.
	 */
	bindEventListeners() {
		// 1. Fire upstream parent listeners to automatically manage layout checkbox dispatches and simulation tests
		super.bindEventListeners();

		const controlContainer = document.getElementById(this.controlId);
		if (!controlContainer) return;

		controlContainer.addEventListener("click", (e) => {
			if (e.target.id === `${this.baseId}-btnMine`) {
				if (this.state.heatLevel >= 85) {
					this.setWidgetBubble("❌ DRILL CORE OVERHEATED! Allow thermal venting sequence.");
					return;
				}
				this.state.action = "processing";
				this.state.actionTimer = 90;
				this.setWidgetBubble("⚡ Boring into crystalized bit-vein layers...");
			}
			if (e.target.id === `${this.baseId}-btnReset`) {
				if (confirm("Are you sure you want to discard your mined minerals inventory data?")) {
					localStorage.removeItem(this.STORAGE_KEY);
					window.location.reload();
				}
			}
		});
	}

	// ========================================================================
	// MODULE COMMAND INTERCEPT ROUTERS & MATRIX HOOKS
	// ========================================================================
	getModuleCommands() {
		return [
			{
				name: 'mine',
				defaultChat: true,
				defaultCp: false,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('mine', flags)) return;
					
					// 1. Check thermal restrictions
					if (this.state.heatLevel >= 85) {
						this.sendNotice(`⚠️ [${user}]: ❌ Deep-Core Drill is overheated (${Math.floor(this.state.heatLevel)}%)! Allow thermal venting sequence.`);
						return;
					}
					
					// 2. Reject commands if already processing a mining sequence
					if (this.state.action === "processing") {
						this.sendNotice(`⛏️ [${user}]: The sonic excavator drill is already boring into an active vein!`);
						return;
					}

					// 3. Trip state parameters to start updating via updateAI loop
					this.state.action = "processing";
					this.state.actionTimer = 90; // Runs animation pipeline for 90 ticks
					this.sendNotice(`⛏️ [${user}] activated the Excavator! Boring into crystalized bit-vein layers...`);
				}
			},
			{
				name: 'minerstatus',
				defaultChat: true,
				defaultCp: false,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('minerstatus', flags)) return;
					
					const profile = this.registry.profiles.streamer_miner;
					const thermalStatus = this.state.heatLevel > 70 ? "CRITICAL/OVERHEATED" : "STABLE";
					
					this.sendNotice(`🛰️ [Miner Telemetry] Profile: ${profile.name} | Total Mined: ${profile.totalMined} P8-Bits | Current Depth: ${profile.depthMeters}m | Core Temp: ${Math.floor(this.state.heatLevel)}% (${thermalStatus})`);
				}
			},
			{
				name: 'vent',
				defaultChat: true,
				defaultCp: false,
				execute: (user, message, flags) => {
					if (!this.isCommandAllowed('vent', flags)) return;
					
					// Broadcaster or Mod execution bypass rule
					if (flags?.broadcaster || flags?.mod) {
						this.state.heatLevel = 0;
						this.sendNotice(`💨 [Mod Override]: Emergency coolant released! Core temperature dropped back to 0%.`);
					} else {
						// Regular chatters can vent a tiny bit manually
						if (this.state.heatLevel > 0) {
							this.state.heatLevel = Math.max(0, this.state.heatLevel - 15);
							this.sendNotice(`💨 ${user} manually purged a high-pressure thermal escape valve. Core dropped by 15%!`);
						} else {
							this.sendNotice(`💨 ${user}, core temperature is already completely stable.`);
						}
					}
				}
			}
		];
	}

	updateAI(t) {
		if (MINER_ACTION_LIBRARY[this.state.action]) {
			MINER_ACTION_LIBRARY[this.state.action](this, { t });
		}
		for (let i = this.state.particles.length - 1; i >= 0; i--) {
			const p = this.state.particles[i];
			p.x += p.vx; p.y += p.vy; p.vy += 0.25; p.life--;
			if (p.life <= 0) this.state.particles.splice(i, 1);
		}
	}

	drawEnvironment(tick) {
		if (!this.ctx || !this.canvas) return;
		const base = this.getPos(this.state.layout.anchorX, this.state.layout.anchorY);
		const profile = this.registry.profiles.streamer_miner;

		this.ctx.fillStyle = MINER_CONFIG.SAND_COLOR;
		this.ctx.fillRect(0, base.y, this.canvas.width, this.canvas.height - base.y);

		this.ctx.fillStyle = MINER_CONFIG.ORE_COLOR;
		this.ctx.save();
		this.ctx.translate(base.x, base.y);
		if (this.state.action === "processing") this.ctx.translate((Math.random() - 0.5) * 4, (Math.random() - 0.5) * 4);

		this.ctx.beginPath();
		this.ctx.moveTo(0, -40);
		this.ctx.lineTo(35, 0);
		this.ctx.lineTo(0, 15);
		this.ctx.lineTo(-35, 0);
		this.ctx.closePath();
		this.ctx.fill();
		this.ctx.restore();

		this.state.particles.forEach(p => {
			this.ctx.fillStyle = p.c;
			this.ctx.fillRect(p.x, p.y, p.s, p.s);
		});

		this.ctx.fillStyle = "#ffffff";
		this.ctx.font = "bold 11px monospace";
		this.ctx.fillText(`MINED BALANCE: ${profile.totalMined} P8-BITS`, 15, 25);
		this.ctx.fillText(`CURRENT DEPTH: ${profile.depthMeters}M`, 15, 40);

		this.ctx.fillStyle = "#27272a";
		this.ctx.fillRect(15, 52, 120, 6);
		this.ctx.fillStyle = this.state.heatLevel > 70 ? "#ff0055" : "#00ffcc";
		this.ctx.fillRect(15, 52, (this.state.heatLevel / 100) * 120, 6);
	}
}