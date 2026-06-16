/**
 * ============================================================================
 * PIXELB8 ECOSYSTEM WIDGET COMPONENT BLUEPRINT (v1.5 - Restructured Architecture)
 * Architecture: Monolithic, sovereign, zero-external-dependencies.
 * Lifecycle Layer: Centralized UI Injections with Cascaded Downstream Hooks
 * Features: Core Command Routing, Automated Matrix Framework, Global Notice Pipeline
 * ============================================================================
 */

// 1. GLOBAL ENGINE DEFAULTS & SCALARS
const WIDGET_CONFIG_DEFAULTS = {
	SAVE_INTERVAL_MS: 5000,
	DEFAULT_WIDTH: 400,
	DEFAULT_HEIGHT: 300
};

// 2. ISOLATED INITIALIZATION SCHEMAS (Factory Pattern Data Nodes)
function createDefaultWidgetRegistry() {
	return {
		activeProfile: "default",
		profiles: {
			default: { name: "System Echo", totalTicks: 0, level: 1 }
		}
	};
}

function createDefaultWidgetState() {
	return {
		isVisible: true,
		hideBorder: false,
		zoomScale: 0,
		particles: [],
		action: "idle",
		actionTimer: 0,
		commandAccess: {}, // 🛠️ Master matrix mapping configuration node
		layout: {
			anchorX: 50,
			anchorY: 50,
			showProps: true
		}
	};
}

// ============================================================================
// WIDGET ROUTER LIBRARIES (State & View Matrix Dispatches)
// ============================================================================
const WIDGET_ACTION_LIBRARY = {
	idle: (widget, ctx) => {
		if (Math.random() < 0.01) {
			widget.setWidgetBubble("System Status: Nominal.");
		}
	},
	processing: (widget, ctx) => {
		if (widget.state.actionTimer > 0) {
			widget.state.actionTimer--;
		} else {
			widget.state.action = "idle";
			widget.setWidgetBubble("Process routine complete!");
		}
	}
};

// ============================================================================
// MAIN WIDGET ENGINE EXPORT CLASS
// ============================================================================
export class BaseWidgetModule {
	/**
	 * @param {string} widgetSubKey - Unique namespace identifier for LocalStorage containment.
	 * @param {Object} options - Custom configuration parameters passed down from child instances.
	 */
	constructor(widgetSubKey = "generic_system", options = {}) {
		this.widgetSubKey = widgetSubKey; // Retain raw identifier for scoping handles
		this.STORAGE_KEY = `pixelb8_widget_${widgetSubKey}`;
		
		// 🌐 SYNCHRONIZED ECOSYSTEM MATCHING: Use the precise sub-key matching your WidgetEngine maps
		this.baseId = widgetSubKey; 
		this.overlayId = `${this.baseId}`;
		this.controlId = `${this.baseId}-controls`;

		// Evaluates options profile fields first before selecting generic fallbacks
		this.widgetMenuTitle = options.menuTitle || `🛠️ ${this.constructor.name} Matrix Interface`;

		this.canvas = document.getElementById(`${this.baseId}-canvas`);
		if (this.canvas) {
			this.ctx = this.canvas.getContext("2d");
		}

		this.registry = createDefaultWidgetRegistry();
		this.state = createDefaultWidgetState();

		// Safe loading execution waterfall
		this.injectUI();
		this.bindEventListeners(); 
		this.loadData(); 
		
		this.saveInterval = setInterval(() => this.saveData(), WIDGET_CONFIG_DEFAULTS.SAVE_INTERVAL_MS);
		this.animate = this.animate.bind(this);
		requestAnimationFrame(this.animate);
	}

	/**
	 * Centralized message routing pipeline.
	 * Accessible by all child widgets using this.sendNotice(txt)
	 */
	sendNotice(txt) {
		// 1. Instantly update the UI visual workspace bubble component
		if (typeof this.setWidgetBubble === 'function') {
			this.setWidgetBubble(txt);
		}
		
		// 2. Broadcast across the module context layer straight into Twitch chat
		if (typeof window.botSay === 'function') {
			window.botSay(txt);
		} else {
			console.warn(`⚠️ [${this.baseId} Base Engine]: window.botSay is not available contextually.`);
		}
	}

	/**
	 * Fallback schema configuration method. Children override this to supply 
	 * the router matrix with commands, defaults, and functional callback references.
	 * @returns {Array<{name: string, defaultChat: boolean, defaultCp: boolean, execute: Function}>}
	 */
	getModuleCommands() {
		return [];
	}

	/**
	 * Security Core Gate: Validates if incoming chat arguments or channel points 
	 * can trigger behaviors according to the live broadcaster toggles.
	 */
	isCommandAllowed(cmdName, flags = {}) {
		if (!this.state.commandAccess || !this.state.commandAccess[cmdName]) return true;
		
		const config = this.state.commandAccess[cmdName];
		const isChannelPoint = !!(flags.customRewardId || flags.channelPointRedemption || flags.isRewardSimulated);

		if (isChannelPoint) return config.cp;
		return config.chat;
	}

	/**
	 * Loops through current runtime code schemas and ensures local state parameters 
	 * match saved settings, appending safety blueprints if empty.
	 */
	reconcileCommandMatrix() {
		const structuralCommands = this.getModuleCommands();
		if (!structuralCommands || structuralCommands.length === 0) return;

		if (!this.state.commandAccess) this.state.commandAccess = {};

		structuralCommands.forEach(cmd => {
			if (!this.state.commandAccess[cmd.name]) {
				this.state.commandAccess[cmd.name] = {
					chat: cmd.defaultChat !== undefined ? cmd.defaultChat : true,
					cp: cmd.defaultCp !== undefined ? cmd.defaultCp : false
				};
			}
		});
	}

	/**
	 * Universal Dynamic Render String Core.
	 * Spits out the styled dark-matrix configuration parameters directly into the parent template.
	 */
	renderCommandRouterMatrixHTML() {
		const keys = Object.keys(this.state.commandAccess || {});
		if (keys.length === 0) {
			return `<p style="font-size: 11px; color: #71717a; padding: 4px 6px; margin: 0;">No routable commands registered for this module architecture.</p>`;
		}

		let html = `
			<p style="font-size: 11px; color: #a1a1aa; margin-top: 0; margin-bottom: 8px; line-height: 1.3;">
				Toggle interaction methods or fire a manual trigger to run routines and actions instantly.
			</p>
			<div class="matrix-table" style="width: 100%; font-family: sans-serif; font-size: 11px; display: flex; flex-direction: column; gap: 3px;">
				<div class="matrix-header" style="display: flex; font-weight: bold; padding: 4px 6px; background: #141414; border-radius: 4px; color: #a1a1aa; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">
					<div style="flex: 1.8;">Command Core</div>
					<div style="flex: 1; text-align: center;">💬 Chat</div>
					<div style="flex: 1; text-align: center;">🎁 Reward</div>
					<div style="flex: 0.8; text-align: center;">⚡ Test</div>
				</div>
		`;

		keys.forEach(cmd => {
			const config = this.state.commandAccess[cmd];
			html += `
				<div class="matrix-row" style="display: flex; padding: 6px; background: #141414; border-radius: 4px; align-items: center;">
					<div style="flex: 1.8; font-weight: bold; text-transform: lowercase; color: #fff; font-family: monospace;">!${cmd}</div>
					<div style="flex: 1; text-align: center; display: flex; justify-content: center;">
						<input type="checkbox" data-cmd="${cmd}" data-type="chat" ${config.chat ? 'checked' : ''} class="matrix-toggle" style="cursor: pointer; accent-color: #3498db; width: 14px; height: 14px; margin: 0;">
					</div>
					<div style="flex: 1; text-align: center; display: flex; justify-content: center;">
						<input type="checkbox" data-cmd="${cmd}" data-type="cp" ${config.cp ? 'checked' : ''} class="matrix-toggle" style="cursor: pointer; accent-color: #3498db; width: 14px; height: 14px; margin: 0;">
					</div>
					<div style="flex: 0.8; text-align: center; display: flex; justify-content: center;">
						<button data-cmd="${cmd}" class="matrix-test-btn" style="cursor: pointer; background: #27272a; color: #3498db; border: 1px solid #3f3f46; border-radius: 4px; font-size: 10px; padding: 2px 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; height: 20px; min-width: 28px;" onmouseover="this.style.background='#3f3f46'; this.style.color='#fff';" onmouseout="this.style.background='#27272a'; this.style.color='#3498db';">
							▶
						</button>
					</div>
				</div>
			`;
		});

		html += `</div>`;
		return html;
	}

	/**
	 * UNIVERSAL AUTOMATED MARKUP INTERSECTION FRAMEWORK
	 * Merges clean local widget dashboards with core settings and matrix systems globally.
	 */
	getUniversalControlsTemplate() {
		const childMarkup = typeof this.getControlsMarkup === 'function'
			? this.getControlsMarkup()
			: `
				<div style="background: #141414; padding: 8px; border-radius: 4px; border: 1px solid #27272a;">
					<label style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Interface Toggles</label>
					<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 12px; color: #fff;">
						<span>Hide Blueprint Outer Border</span>
						<input type="checkbox" id="widgetHideBorderToggle">
					</div>
				</div>
			`;

		const matrixRowsHTML = this.renderCommandRouterMatrixHTML();
		
		const matrixSection = `
			<details style="border: 1px solid #27272a; border-radius: 6px; background: #18181b; margin-top: 5px;">
				<summary style="padding: 8px 10px; cursor: pointer; font-weight: bold; font-size: 12px; color: #fff; outline: none; user-select: none;">🛠️ Live Command Router Matrix</summary>
				<div class="matrix-container-target" style="padding: 10px; border-top: 1px solid #27272a; display: flex; flex-direction: column; gap: 4px;">
					${matrixRowsHTML}
				</div>
			</details>
		`;

		const actionButtons = typeof this.getControlsMarkup === 'function' ? '' : `
			<button type="button" id="btnWidgetTrigger" class="p8-btn" style="background: #1e3a8a; border: 1px solid #3b82f6; padding: 6px 0; font-size: 11px; cursor: pointer; color: #fff; font-weight: bold; border-radius: 4px; margin-top: 5px;">
				EXECUTE MATRIX ALGORITHM
			</button>
			<button type="button" id="btnWidgetReset" class="p8-btn" style="background: #991b1b; border: 1px solid #ef4444; padding: 6px 0; font-size: 11px; margin-top: 5px; cursor: pointer; color: #fff; font-weight: bold; border-radius: 4px;">
				⚠️ PURGE INSTANCE DATA CACHE
			</button>
		`;

		return `
			<div class="collapsible-header" onclick="this.parentElement.classList.toggle('collapsed')">
				<span>${this.widgetMenuTitle}</span>
				<span class="collapse-icon">▼</span>
			</div>
			<div class="collapsible-content">
				<div style="display: flex; flex-direction: column; gap: 12px; padding: 10px; background: #111114;">
					${childMarkup}
					${matrixSection}
					${actionButtons}
				</div>
			</div>
		`;
	}

	// ========================================================================
	// ENGINE POSITION MATRIX ROUTERS (Camera & Vector Translations)
	// ========================================================================
	getPos(pctX, pctY) {
		if (!this.canvas) return { x: 0, y: 0 };
		return {
			x: (pctX / 100) * this.canvas.width,
			y: (pctY / 100) * this.canvas.height
		};
	}

	// ========================================================================
	// RUNTIME MEMORY RECONCILIATION LAYERS (LocalStorage Isolated IO)
	// ========================================================================
	saveData() {
		const payload = {
			registry: this.registry,
			state: this.state
		};
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify(payload));
	}

	loadData() {
		const saved = localStorage.getItem(this.STORAGE_KEY);
		if (saved) {
			try {
				const loadedBundle = JSON.parse(saved);
				if (loadedBundle.registry) this.registry = loadedBundle.registry;
				if (loadedBundle.state) {
					this.state = { ...this.state, ...loadedBundle.state };
				}

				const controlPanel = document.getElementById(this.controlId);
				if (controlPanel) {
					const borderToggle = controlPanel.querySelector('#widgetHideBorderToggle');
					if (borderToggle) {
						borderToggle.checked = this.state.hideBorder || false;
					}
				}
			} catch (err) {
				console.error(`⚠️ [Boot Error]: Save trace hit failure on namespace "${this.STORAGE_KEY}":`, err);
			}
		}
		
		// Run core data initialization alignment passes
		this.reconcileCommandMatrix();
		this.applyVisibilityStates();
		
		const matrixTarget = document.getElementById(this.controlId)?.querySelector('.matrix-container-target');
		if (matrixTarget) {
			matrixTarget.innerHTML = this.renderCommandRouterMatrixHTML();
		}
	}

	// ========================================================================
	// INTERFACE BINDING & EVENT DISPATCH ENGINES
	// ========================================================================
	injectUI() {
		if (typeof this.injectViewportOverlay === 'function') {
			this.injectViewportOverlay();
		} else {
			const overlayWrapper = document.getElementById("overlay-wrapper");
			if (overlayWrapper && !document.getElementById(this.overlayId)) {
				const overlayEl = document.createElement("div");
				overlayEl.id = this.overlayId;
				overlayEl.className = "p8-widget"; 
				overlayEl.style.position = "absolute";
				
				const savedLayout = localStorage.getItem(`p8_pos_${this.overlayId}`);
				if (savedLayout) {
					try {
						const coords = JSON.parse(savedLayout);
						overlayEl.style.left = coords.left;
						overlayEl.style.top = coords.top;
					} catch (err) {
						console.error(`⚠️ [Layout Error]: Corrupted position string for ${this.overlayId}:`, err);
					}
				} else {
					overlayEl.style.left = "100px";
					overlayEl.style.top = "100px";
				}
				
				overlayEl.innerHTML = `
					<div id="${this.baseId}-bubble" class="chat-bubble"></div>
					<canvas id="${this.baseId}-canvas"></canvas>
				`;
				
				overlayWrapper.appendChild(overlayEl);

				this.canvas = document.getElementById(`${this.baseId}-canvas`);
				if (this.canvas) {
					this.ctx = this.canvas.getContext("2d");
				}
			}
		}

		const controlWrapper = document.getElementById("widget-control-wrapper") || document.getElementById("widgets-manager");
		if (controlWrapper && !document.getElementById(this.controlId)) {
			const panelSection = document.createElement("div");
			panelSection.id = this.controlId;
			panelSection.className = "collapsible-section collapsed";
			
			panelSection.innerHTML = this.getUniversalControlsTemplate();
			controlWrapper.appendChild(panelSection);

			if (typeof this.syncUIPanelElements === 'function') {
				this.syncUIPanelElements();
			}
		}
	}

	destroy() {
		if (this.saveInterval) {
			clearInterval(this.saveInterval);
			this.saveInterval = null;
		}
		
		if (this.animationFrameId) {
			cancelAnimationFrame(this.animationFrameId);
			this.animationFrameId = null;
		}

		const overlayEl = document.getElementById(this.overlayId);
		if (overlayEl) overlayEl.remove();

		const controlEl = document.getElementById(this.controlId);
		if (controlEl) controlEl.remove();
		
		console.log(`🛑 [Lifecycle]: Module safely unloaded and components destroyed.`);
	}

	bindEventListeners() {
		const panelContainer = document.getElementById(this.controlId);
		if (!panelContainer) return;

		// ⚡ EVENT DELEGATION UPGRADE: Captures dynamic inputs without dropping on innerHTML overwrites
		panelContainer.addEventListener("change", (e) => {
			if (e.target.id === "widgetHideBorderToggle") {
				this.state.hideBorder = e.target.checked;
				this.applyVisibilityStates();
				this.saveData();
			}

			if (e.target.classList.contains("matrix-toggle")) {
				const cmd = e.target.getAttribute("data-cmd");
				const type = e.target.getAttribute("data-type");
				const isChecked = e.target.checked;

				if (this.state.commandAccess && this.state.commandAccess[cmd]) {
					this.state.commandAccess[cmd][type] = isChecked;
					this.saveData();
					console.log(`[Config Router - ${this.constructor.name}]: Updated "${cmd}" -> [${type.toUpperCase()}]: ${isChecked}`);
				}
			}
		});

		panelContainer.addEventListener("click", (e) => {
			if (e.target.id === "btnWidgetTrigger") {
				this.state.action = "processing";
				this.state.actionTimer = 120;
				this.setWidgetBubble("Executing state processing routing vectors...");
			}
			if (e.target.id === "btnWidgetReset") {
				if (confirm(`Are you completely sure you want to clear metrics for this tracking node? This will wipe: ${this.STORAGE_KEY}`)) {
					localStorage.removeItem(this.STORAGE_KEY);
					window.location.reload();
				}
			}

			const testBtn = e.target.closest(".matrix-test-btn");
			if (testBtn) {
				const cmdName = testBtn.getAttribute("data-cmd");
				console.log(`[Test Simulator - ${this.constructor.name}]: Forcing simulated payload pass -> !${cmdName}`);

				const suite = this.getModuleCommands();
				const targetCommand = suite.find(c => c.name === cmdName);

				if (targetCommand && typeof targetCommand.execute === 'function') {
					const simulatedFlags = {
						broadcaster: true,
						mod: false,
						isRewardSimulated: true
					};
					targetCommand.execute("BroadcasterConsole", "", simulatedFlags);
				}
			}
		});
	}

	applyVisibilityStates() {
		const container = document.getElementById(this.overlayId);
		if (!container) return;
		
		if (this.state.hideBorder) {
			container.style.border = "none";
			container.style.background = "transparent";
		} else {
			container.style.border = "";
			container.style.background = "";
		}
	}

	setWidgetBubble(txt) {
		const bubble = document.getElementById(`${this.baseId}-bubble`);
		if (!bubble) return;

		if (this.bubbleTimeout) {
			clearTimeout(this.bubbleTimeout);
			this.bubbleTimeout = null;
		}
		if (bubble.dataset.timeoutId) {
			clearTimeout(parseInt(bubble.dataset.timeoutId, 10));
		}

		bubble.textContent = txt;
		bubble.classList.add("show");

		const timerId = setTimeout(() => {
			bubble.classList.remove("show");
			if (this.bubbleTimeout === timerId) this.bubbleTimeout = null;
			bubble.removeAttribute('data-timeout-id');
		}, 3000);

		this.bubbleTimeout = timerId;
		bubble.dataset.timeoutId = timerId;
	}

	updateAI(t) {
		const ctx = {
			t,
			width: this.canvas ? this.canvas.width : 0,
			height: this.canvas ? this.canvas.height : 0
		};

		if (WIDGET_ACTION_LIBRARY[this.state.action]) {
			WIDGET_ACTION_LIBRARY[this.state.action](this, ctx);
		}
	}

	drawEnvironment(tick) {
		if (!this.ctx) return;
	}

	animate(timestamp) {
		if (this.state && this.state.isVisible === false) {
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
				this.animationFrameId = null;
			}
			return;
		}

		const tick = Math.floor(timestamp / 16.67);
		this.updateAI(tick);

		if (this.ctx && this.canvas) {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.save();
			this.drawEnvironment(tick);
			this.ctx.restore();
		}

		this.animationFrameId = requestAnimationFrame(this.animate.bind(this));
	}
}