import { BaseWidgetModule } from './BaseWidgetModule.js';

// ============================================================================
// 🎨 Emojinko VIEW TEMPLATES (Dashboard Manager Layout)
// ============================================================================
const Emojinko_HTMLTEMPLATES = {
	dashboard: `
		<div style="background: #18181b; padding: 12px; border: 1px solid #27272a; border-radius: 6px; margin-bottom: 15px;">
			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
				<h4 style="margin: 0; color: var(--accent, #a855f7); font-size: 14px;">🎯 Drop Zone Controller</h4>
				<button id="dz-btn-clear" class="p8-btn alt-btn" style="font-size: 11px; padding: 2px 8px;">Reset Scores</button>
			</div>

			<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
				<span style="font-size: 13px; color: #e4e4e7;">Game Acceptance Loop</span>
				<label class="p8-switch">
					<input type="checkbox" id="dz-toggle-active" checked>
					<span class="p8-slider"></span>
				</label>
			</div>

			<div style="display: flex; align-items: center; gap: 10px; margin-bottom: 5px;">
				<span style="font-size: 12px; color: #a1a1aa; min-width: 70px;">Gravity Velocity</span>
				<input type="range" id="dz-gravity-slider" min="1" max="10" value="4" style="flex: 1; cursor: pointer; accent-color: var(--accent, #a855f7);">
				<span id="dz-grav-txt" style="font-size: 12px; font-family: monospace;">4s</span>
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
	/**
	 * 1. THE CONSTRUCTOR
	 * Harnesses base registrations and applies the constructor state-merging blueprint
	 * to safeguard properties against central routing drops.
	 */
	constructor() {
		super("stream_Emojinko", {
			menuTitle: "🎯 Chat Drop Zone Mini-Game"
		});

		// ✅ Safe Architectural State Extension Pattern
		this.state = {
			gameEnabled: true,
			dropDuration: 4, // Seconds it takes to fall
			scores: {},      // Persistent tracking ledger: { username: highscore }
			commandAccess: this.state?.commandAccess || {}
		};

		this.loadData();

		// Kick off mandatory control matrix DOM reevaluation patterns
		const matrixTarget = document.getElementById(this.controlId)?.querySelector('.matrix-container-target');
		if (matrixTarget) {
			matrixTarget.innerHTML = this.renderCommandRouterMatrixHTML();
		}
	}

	/**
	 * 2. DATA FRAMEWORK LOADING
	 * Setup tracking structures, static definitions, and persistent scoring rules.
	 */
	loadData() {
		super.loadData(); // Syncs baseline settings out of local cached structures automatically

		// Map configuration bucket boundaries for your overlay drop logic
		this.scoreZones = [
			{ minX: 0, maxX: 25, label: "100 Pts", multiplier: 100 },
			{ minX: 25, maxX: 50, label: "💥 RIP", multiplier: 0 },
			{ minX: 50, maxX: 75, label: "🍀 LUCKY", multiplier: 500 },
			{ minX: 75, maxX: 100, label: "50 Pts", multiplier: 50 }
		];
	}

	/**
	 * 3. DECLARATIVE DASHBOARD LAYOUTS
	 * Supplies template streams directly to the browser monolithic canvas frame stack.
	 */
	getControlsMarkup() {
		return `
			${Emojinko_HTMLTEMPLATES.dashboard}
			${Emojinko_HTMLTEMPLATES.leaderboard}
		`;
	}

	/**
	 * 4. VIEWPORT OVERLAY CANVAS ASSEMBLY
	 * Instantiates the dynamic physical sandbox right on top of your OBS browser layout frame.
	 */
	injectViewportOverlay() {
		const overlayWrapper = document.getElementById("overlay-wrapper");
		if (!overlayWrapper || document.getElementById(this.overlayId)) return;

		const overlayEl = document.createElement("div");
		overlayEl.id = this.overlayId;
		overlayEl.style.cssText = `position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; overflow: hidden; z-index: 10;`;
		
		// Build visual indicators for your buckets at the bottom of the stream window scene
		overlayEl.innerHTML = `
			<div id="dz-bucket-row" style="position: absolute; bottom: 0; left: 0; width: 100%; height: 40px; display: flex; background: rgba(24,24,27,0.5); border-top: 2px solid var(--accent, #a855f7); font-family: monospace; text-align: center; line-height: 40px; font-weight: bold; color: #fff; font-size: 11px;">
				<div style="flex: 1; border-right: 1px dashed #3f3f46; background: rgba(168,85,247,0.1);">100 PTS</div>
				<div style="flex: 1; border-right: 1px dashed #3f3f46; background: rgba(239,68,68,0.1); color: #ef4444;">💥 RIP</div>
				<div style="flex: 1; border-right: 1px dashed #3f3f46; background: rgba(34,197,94,0.1); color: #22c55e;">🍀 LUCKY</div>
				<div style="flex: 1; background: rgba(168,85,247,0.1);">50 PTS</div>
			</div>
		`;
		
		overlayWrapper.appendChild(overlayEl);
	}

	/**
	 * 5. DYNAMIC DOM INTERFACES & CONTROL SELECTION
	 * Synchronizes settings changes inside your Control Panel interface elements.
	 */
	bindEventListeners() {
		super.bindEventListeners(); // Keeps layout panel collapsibility operational

		const panel = document.getElementById(this.controlId);
		if (!panel) return;

		this.renderLeaderboardUI();

		// Toggle Game Access Loop state changes
		const activeToggle = panel.querySelector('#dz-toggle-active');
		if (activeToggle) {
			activeToggle.checked = this.state.gameEnabled;
			activeToggle.addEventListener('change', (e) => {
				this.state.gameEnabled = e.target.checked;
				this.saveData();
			});
		}

		// Handle Fall Acceleration Slider
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

		// Reset Scores Interaction Hook
		panel.addEventListener('click', (e) => {
			if (e.target.id === 'dz-btn-clear') {
				this.state.scores = {};
				this.saveData();
				this.renderLeaderboardUI();
				this.sendNotice("🧹 Drop Zone scoreboard database cleared!");
			}
		});
	}

	/**
	 * 6. CHAT DROP PHYSICS SIMULATION ENGINE
	 * Allocates a floating element onto the screen wrapper scene on command request.
	 */
	executeDropAction(user, customToken = "🪙") {
		if (!this.state.gameEnabled) return;

		const overlay = document.getElementById(this.overlayId);
		if (!overlay) return;

		// Clean up overly long strings to keep layout structures intact
		const cleanToken = customToken.substring(0, 5);
		
		// Generate random horizontal entry anchor point vector percentage (0% to 90%)
		const startXPercent = Math.floor(Math.random() * 90);

		const dropNode = document.createElement('div');
		dropNode.style.cssText = `position: absolute; top: -50px; left: ${startXPercent}%; font-size: 24px; padding: 6px; white-space: nowrap; font-family: monospace; text-shadow: 0 2px 4px rgba(0,0,0,0.8); color: #fff; text-align: center; transition: top ${this.state.dropDuration}s cubic-bezier(0.47, 0, 0.745, 0.715), left ${this.state.dropDuration}s ease-in-out;`;
		dropNode.innerHTML = `<div>${cleanToken}</div><div style="font-size: 9px; background: rgba(0,0,0,0.6); padding: 1px 4px; border-radius: 3px; margin-top: 2px;">${user}</div>`;
		
		overlay.appendChild(dropNode);

		// Trigger CSS-driven falling simulation engine sequences frames via timeout execution channels
		setTimeout(() => {
			dropNode.style.top = `calc(100% - 85px)`;
			// Apply a slight horizontal physics drift as the element travels down
			const driftFactor = (Math.random() * 15) - 7.5; 
			const finalX = Math.max(0, Math.min(92, startXPercent + driftFactor));
			dropNode.style.left = `${finalX}%`;
		}, 50);

		// Process target landing tracking evaluations when timeout lifecycle bounds end
		setTimeout(() => {
			// Read pixel positions or calculate percentage distributions to evaluate scored zones
			const finishedLeftPercent = parseFloat(dropNode.style.left);
			this.evaluateLandingZoneScore(user, finishedLeftPercent);
			
			// Visual pop fade sequence before removing object from DOM tree structure safely
			dropNode.style.transform = "scale(1.3)";
			dropNode.style.opacity = "0";
			dropNode.style.transition = "all 0.4s ease-out";
			
			setTimeout(() => dropNode.remove(), 400);
		}, this.state.dropDuration * 1000);
	}

	/**
	 * Core math routing evaluator processing entry impacts inside landing buckets
	 */
	evaluateLandingZoneScore(user, finalXPercent) {
		// Find matching bucket index based on position percentage maps
		const matchedBucket = this.scoreZones.find(zone => finalXPercent >= zone.minX && finalXPercent <= zone.maxX) || this.scoreZones[3];
		
		// Guard state.scores initialization boundary completely
		if (!this.state.scores) this.state.scores = {};
		
		const currentHigh = this.state.scores[user] || 0;
		if (matchedBucket.multiplier > currentHigh) {
			this.state.scores[user] = matchedBucket.multiplier;
			this.saveData();
			this.renderLeaderboardUI();
		}

		// Push output confirmations back down to native bot chat loops
		if (matchedBucket.multiplier > 0) {
			this.sendNotice(`🎯 @${user} landed in the [${matchedBucket.label}] zone, unlocking a highscore of ${matchedBucket.multiplier}!`);
		} else {
			this.sendNotice(`💀 Oof! @${user} dropped straight into the [${matchedBucket.label}] hazard!`);
		}
	}

	/**
	 * Panel list renderer refresh tool parsing local configurations structures maps
	 */
	renderLeaderboardUI() {
		const panel = document.getElementById(this.controlId);
		const container = panel?.querySelector('#dz-leaderboard-list');
		if (!container) return;

		// 🛡️ SHIELDED SHUNT: Fallback safely to empty object map if storage hasn't initialized yet
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
	// 🔌 7. THE CHAT ROUTING AND COMMAND MATRIX MANIFEST
	// ========================================================================
	/**
	 * Publishes game execution hooks back up inside the application's central manager.
	 */
	getModuleCommands() {
		return [
			{
				name: 'drop', // Command usage trigger condition parameter: !drop [emoji/token]
				defaultChat: true,
				defaultCp: true,
				execute: (user, message, flags) => {
					// Guard block routing using central layout permissions checklist maps
					if (!this.isCommandAllowed('drop', flags)) return;

					const targetToken = message.trim() || "🪙";
					this.executeDropAction(user, targetToken);
				}
			}
		];
	}
}