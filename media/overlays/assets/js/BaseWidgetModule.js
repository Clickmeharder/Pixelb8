/**
 * ============================================================================
 * PIXELB8 ECOSYSTEM WIDGET COMPONENT BLUEPRINT (v1.2 - Dynamic)
 * Architecture: Monolithic, sovereign, zero-external-dependencies.
 * ============================================================================
 */

const WIDGET_CONFIG_DEFAULTS = {
	SAVE_INTERVAL_MS: 5000
};

function createDefaultWidgetRegistry() {
	return { activeProfile: "default", profiles: { default: { name: "System Echo", totalTicks: 0, level: 1 } } };
}

function createDefaultWidgetState() {
	return {
		isVisible: true,
		hideBorder: false,
		action: "idle",
		actionTimer: 0,
		layout: { anchorX: 50, anchorY: 50 }
	};
}

const WIDGET_ACTION_LIBRARY = {
	idle: (widget) => { if (Math.random() < 0.01) widget.setWidgetBubble("System Status: Nominal."); },
	processing: (widget) => {
		if (widget.state.actionTimer > 0) {
			widget.state.actionTimer--;
		} else {
			widget.state.action = "idle";
			widget.setWidgetBubble("Process routine complete!");
		}
	}
};

export class BaseWidgetModule {
	constructor(widgetSubKey = "generic_system") {
		this.STORAGE_KEY = `pixelb8_widget_${widgetSubKey}`;
		
		// DYNAMIC ID GENERATION
		this.baseId = this.constructor.name.toLowerCase();
		this.overlayId = `${this.baseId}-overlay`;
		this.controlId = `${this.baseId}-controls`;

		this.canvas = document.getElementById("companionCanvas");
		if (this.canvas) this.ctx = this.canvas.getContext("2d");

		this.registry = createDefaultWidgetRegistry();
		this.state = createDefaultWidgetState();

		this.injectUI();
		this.bindEventListeners();
		this.loadData();
		
		this.saveInterval = setInterval(() => this.saveData(), WIDGET_CONFIG_DEFAULTS.SAVE_INTERVAL_MS);
		this.animate = this.animate.bind(this);
		requestAnimationFrame(this.animate);
	}

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
					<button type="button" id="btnWidgetTrigger" class="p8-btn" style="background: #1e3a8a; border: 1px solid #3b82f6; padding: 6px 0; font-size: 11px; cursor: pointer; color: #fff; font-weight: bold; border-radius: 4px;">EXECUTE MATRIX ALGORITHM</button>
					<button type="button" id="btnWidgetReset" class="p8-btn" style="background: #991b1b; border: 1px solid #ef4444; padding: 6px 0; font-size: 11px; margin-top: 5px; cursor: pointer; color: #fff; font-weight: bold; border-radius: 4px;">⚠️ PURGE INSTANCE DATA CACHE</button>
				</div>
			</div>
		`;
	}

	getPos(pctX, pctY) {
		if (!this.canvas) return { x: 0, y: 0 };
		return { x: (pctX / 100) * this.canvas.width, y: (pctY / 100) * this.canvas.height };
	}

	saveData() {
		localStorage.setItem(this.STORAGE_KEY, JSON.stringify({ registry: this.registry, state: this.state }));
	}

	loadData() {
		const saved = localStorage.getItem(this.STORAGE_KEY);
		if (saved) {
			const loaded = JSON.parse(saved);
			this.registry = loaded.registry || this.registry;
			this.state = { ...this.state, ...loaded.state };
			const toggle = document.getElementById(this.controlId)?.querySelector('#widgetHideBorderToggle');
			if (toggle) toggle.checked = this.state.hideBorder;
		}
		this.applyVisibilityStates();
	}

	injectUI() {
		const overlayWrapper = document.getElementById("overlay-wrapper");
		if (overlayWrapper && !document.getElementById(this.overlayId)) {
			const overlayEl = document.createElement("div");
			overlayEl.id = this.overlayId;
			overlayEl.className = "p8-widget"; // Crucial for positioning systems
			overlayEl.style.position = "absolute";
			overlayWrapper.appendChild(overlayEl);
		}

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
		const panel = document.getElementById(this.controlId);
		if (!panel) return;

		panel.addEventListener("change", (e) => {
			if (e.target.id === "widgetHideBorderToggle") {
				this.state.hideBorder = e.target.checked;
				this.applyVisibilityStates();
				this.saveData();
			}
		});

		panel.addEventListener("click", (e) => {
			if (e.target.id === "btnWidgetTrigger") {
				this.state.action = "processing";
				this.state.actionTimer = 120;
				this.setWidgetBubble("Executing state processing routing vectors...");
			}
			if (e.target.id === "btnWidgetReset") {
				if (confirm(`Wipe storage for ${this.baseId}?`)) {
					localStorage.removeItem(this.STORAGE_KEY);
					window.location.reload();
				}
			}
		});
	}

	applyVisibilityStates() {
		const container = document.getElementById(this.overlayId);
		if (!container) return;
		container.style.border = this.state.hideBorder ? "none" : "1px solid #27272a";
		container.style.background = this.state.hideBorder ? "transparent" : "rgba(0,0,0,0.2)";
	}

	setWidgetBubble(txt) {
		const bubble = document.getElementById("bubble");
		if (!bubble) return;
		bubble.textContent = txt;
		bubble.classList.add("show");
		if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
		this.bubbleTimeout = setTimeout(() => bubble.classList.remove("show"), 3000);
	}

	updateAI(t) {
		if (WIDGET_ACTION_LIBRARY[this.state.action]) {
			WIDGET_ACTION_LIBRARY[this.state.action](this, { t });
		}
	}

	drawEnvironment(tick) { if (this.ctx) {} }

	animate(timestamp) {
		const tick = Math.floor(timestamp / 16.67);
		this.updateAI(tick);
		if (this.ctx && this.canvas) {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			this.ctx.save();
			this.drawEnvironment(tick);
			this.ctx.restore();
		}
		this.animationFrameId = requestAnimationFrame(this.animate);
	}
}