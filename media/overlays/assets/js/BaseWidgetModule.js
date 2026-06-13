/**
 * ============================================================================
 * PIXELB8 ECOSYSTEM WIDGET COMPONENT BLUEPRINT (v1.1)
 * Architecture: Monolithic, sovereign, zero-external-dependencies.
 * Memory Strategy: Dynamic Instance-Key Isolate System
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
		// Standard non-blocking frame cycle updates
		if (Math.random() < 0.01) {
			widget.setWidgetBubble("System Status: Nominal.");
		}
	},
	processing: (widget, ctx) => {
		// Active algorithmic manipulation states
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
	 */
	constructor(widgetSubKey = "generic_system") {
			this.STORAGE_KEY = `pixelb8_widget_${widgetSubKey}`;
			// Generate unique IDs based on the Class Name (e.g., streambitminerwidget)
			this.baseId = this.constructor.name.toLowerCase();
			this.overlayId = `${this.baseId}-overlay`;
			this.controlId = `${this.baseId}-controls`;

			this.canvas = document.getElementById(`${this.baseId}-canvas`);
			if (this.canvas) {
				this.ctx = this.canvas.getContext("2d");
			}

			this.registry = createDefaultWidgetRegistry();
			this.state = createDefaultWidgetState();

			this.injectUI();
			this.bindEventListeners(); // Now uses dynamic targets
			this.loadData();
			
			this.saveInterval = setInterval(() => this.saveData(), 5000);
			this.animate = this.animate.bind(this);
			requestAnimationFrame(this.animate);
		}

	// ========================================================================
	// DECLARATIVE CONTROL INTERFACE SPECIFICATIONS
	// ========================================================================
	static get controlsTemplate() {
		return `
			<div class="collapsible-header" onclick="this.parentElement.classList.toggle('collapsed')">
				<span>🛠️ Widget Module Interface Matrix</span>
				<span class="collapse-icon">▼</span>
			</div>
			<div class="collapsible-content">
				<div style="display: flex; flex-direction: column; gap: 12px; padding: 10px; background: #111114;">
					
					<div style="background: #141414; padding: 8px; border-radius: 4px; border: 1px solid #27272a;">
						<label style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Interface Toggles</label>
						<div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 12px; color: #fff;">
							<span>Hide Blueprint Outer Border</span>
							<input type="checkbox" id="widgetHideBorderToggle">
						</div>
					</div>

					<button type="button" id="btnWidgetTrigger" class="p8-btn" style="background: #1e3a8a; border: 1px solid #3b82f6; padding: 6px 0; font-size: 11px; cursor: pointer; color: #fff; font-weight: bold; border-radius: 4px;">
						EXECUTE MATRIX ALGORITHM
					</button>

					<button type="button" id="btnWidgetReset" class="p8-btn" style="background: #991b1b; border: 1px solid #ef4444; padding: 6px 0; font-size: 11px; margin-top: 5px; cursor: pointer; color: #fff; font-weight: bold; border-radius: 4px;">
						⚠️ PURGE INSTANCE DATA CACHE
					</button>
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

				// CHANGE: Scope the lookup to this widget's specific control container
				const controlPanel = document.getElementById(this.controlId);
				if (controlPanel) {
					// Find the toggle inside this specific container only
					const borderToggle = controlPanel.querySelector('input[type="checkbox"]');
					if (borderToggle) {
						borderToggle.checked = this.state.hideBorder || false;
					}
				}

			} catch (err) {
				console.error(`⚠️ [Boot Error]: Corrupted save string hit on namespace "${this.STORAGE_KEY}":`, err);
			}
		}
		this.applyVisibilityStates();
	}

	// ========================================================================
	// INTERFACE BINDING & EVENT DISPATCH ENGINES
	// ========================================================================
	injectUI() {
		// 1. Mount Overlay Viewport
		const overlayWrapper = document.getElementById("overlay-wrapper");
		if (overlayWrapper && !document.getElementById(this.overlayId)) {
			const overlayEl = document.createElement("div");
			overlayEl.id = this.overlayId;
			overlayEl.className = "p8-widget"; // Crucial for your CSS positioning system
			overlayEl.style.position = "absolute";
			
			// Inject a UNIQUE canvas for this widget instance
			// We use baseId so every widget has its own surface
			overlayEl.innerHTML = `<canvas id="${this.baseId}-canvas"></canvas>`;
			
			overlayWrapper.appendChild(overlayEl);
		}

		// 2. Mount Control Panel
		const controlWrapper = document.getElementById("widget-control-wrapper");
		if (controlWrapper && !document.getElementById(this.controlId)) {
			const panelSection = document.createElement("div");
			panelSection.id = this.controlId;
			panelSection.className = "collapsible-section collapsed";
			panelSection.innerHTML = this.constructor.controlsTemplate;
			controlWrapper.appendChild(panelSection);
		}
	}

	bindEventListeners() {
		const panelContainer = document.getElementById(this.controlId);
		if (!panelContainer) return;

		// Delegated Change Input Capturing Pattern
		panelContainer.addEventListener("change", (e) => {
			if (e.target.id === "widgetHideBorderToggle") {
				this.state.hideBorder = e.target.checked;
				this.applyVisibilityStates();
				this.saveData();
			}
		});

		// Delegated Action Click Capturing Pattern
		panelContainer.addEventListener("click", (e) => {
			if (e.target.id === "btnWidgetTrigger") {
				this.state.action = "processing";
				this.state.actionTimer = 120; // 2 seconds running at 60hz
				this.setWidgetBubble("Executing state processing routing vectors...");
			}
			if (e.target.id === "btnWidgetReset") {
				if (confirm(`Are you completely sure you want to clear metrics for this tracking node? This will wipe: ${this.STORAGE_KEY}`)) {
					localStorage.removeItem(this.STORAGE_KEY);
					window.location.reload();
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
			container.style.border = "1px solid #27272a";
		}
	}

	setWidgetBubble(txt) {
		const bubble = document.getElementById("bubble");
		if (!bubble) return;

		// 1. Kill any overlapping timers running across instance frames
		if (this.bubbleTimeout) {
			clearTimeout(this.bubbleTimeout);
			this.bubbleTimeout = null;
		}
		if (bubble.dataset.timeoutId) {
			clearTimeout(parseInt(bubble.dataset.timeoutId, 10));
		}

		// 2. Paint text properties 
		bubble.textContent = txt;
		bubble.classList.add("show");

		// 3. Set up the absolute double-lock execution tracker
		const timerId = setTimeout(() => {
			bubble.classList.remove("show");
			if (this.bubbleTimeout === timerId) this.bubbleTimeout = null;
			bubble.removeAttribute('data-timeout-id');
		}, 3000);

		this.bubbleTimeout = timerId;
		bubble.dataset.timeoutId = timerId;
	}

	// ========================================================================
	// RENDER PROCESSING TIMELINE PASSES
	// ========================================================================
	updateAI(t) {
		const ctx = {
			t,
			width: this.canvas ? this.canvas.width : 0,
			height: this.canvas ? this.canvas.height : 0
		};

		// Route real-time state changes through the action library matrix
		if (WIDGET_ACTION_LIBRARY[this.state.action]) {
			WIDGET_ACTION_LIBRARY[this.state.action](this, ctx);
		}
	}

	drawEnvironment(tick) {
		if (!this.ctx) return;
		// 🎨 Inject module drawing pipelines (Phase 0 -> Phase 6 layout operations) here
	}

	animate(timestamp) {
		const tick = Math.floor(timestamp / 16.67); // Normalized 60hz engine loop metric

		this.updateAI(tick);

		if (this.ctx && this.canvas) {
			// Wipe frame clear for next redraw stack pass
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			
			this.ctx.save();
			// Scale variables and camera anchor operations run cleanly here...
			
			this.drawEnvironment(tick);
			
			this.ctx.restore();
		}

		this.animationFrameId = requestAnimationFrame(this.animate);
	}
}