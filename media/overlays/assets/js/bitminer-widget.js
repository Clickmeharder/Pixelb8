/**
 * ============================================================================
 * PIXELB8 ECOSYSTEM WIDGET COMPONENT: STREAM BIT-MINER
 * Architecture: Monolithic example extending the BaseWidgetModule template.
 * ============================================================================
 */

import { BaseWidgetModule } from "./BaseWidgetModule.js";

// 1. EXTRA MODULE SCHEMA MATRIX
const MINER_CONFIG = {
    SAND_COLOR: "#dfc26d",
    ORE_COLOR: "#ffb703",
    SPARK_COLORS: ["#ff0055", "#00ffcc", "#ffcc00"]
};

// 2. STATE OVERRIDES & EXTENSIONS
function createMinerRegistry() {
    return {
        activeProfile: "streamer_miner",
        profiles: {
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
        layout: {
            anchorX: 50,
            anchorY: 75,
            showProps: true
        }
    };
}

// ============================================================================
// MINER ROUTER ACTION LIBRARY
// ============================================================================
const MINER_ACTION_LIBRARY = {
    idle: (widget, ctx) => {
        if (widget.state.heatLevel > 0) widget.state.heatLevel -= 0.2;
        if (ctx.t % 300 === 0 && Math.random() < 0.3) {
            widget.setWidgetBubble("Sensors scanning subterranean layers...");
        }
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
            widget.setWidgetBubble("✨ ORE VEIN SHATTERED! Bits mined successfully.");
            widget.saveData();
        }
    }
};

// ============================================================================
// EXTENDED RUNTIME EXPORT CLASS
// ============================================================================
export class StreamBitMinerWidget extends BaseWidgetModule {
    constructor() {
        super("bit_miner_system");
        this.registry = createMinerRegistry();
        this.state = createMinerState();
		this.canvas = document.getElementById("miner-canvas");
		if (this.canvas) {
			this.ctx = this.canvas.getContext("2d");
		}
        this.loadData();
    }

    static get controlsTemplate() {
        return `
            <div class="collapsible-header" onclick="this.parentElement.classList.toggle('collapsed')">
                <span>⛏️ PixelB8 Deep-Core Bit Miner Matrix</span>
                <span class="collapse-icon">▼</span>
            </div>
            <div class="collapsible-content">
                <div style="display: flex; flex-direction: column; gap: 12px; padding: 10px; background: #111114;">
                    <div style="background: #141414; padding: 8px; border-radius: 4px; border: 1px solid #27272a;">
                        <label style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Telemetry Frame Config</label>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px; font-size: 12px; color: #fff;">
                            <span>Hide Overlay Framing Outline</span>
                            <input type="checkbox" id="minerHideBorderToggle">
                        </div>
                    </div>
                    <button type="button" id="btnMineVein" class="p8-btn" style="background: #e67e22; border: 1px solid #f39c12; padding: 8px 0; font-size: 11px; cursor: pointer; color: #fff; font-weight: bold; border-radius: 4px;">
                        💥 ENGAGE SONIC EXCAVATOR DRILL
                    </button>
                    <button type="button" id="btnMinerReset" class="p8-btn" style="background: #991b1b; border: 1px solid #ef4444; padding: 6px 0; font-size: 11px; margin-top: 5px; cursor: pointer; color: #fff; font-weight: bold; border-radius: 4px;">
                        ⚠️ PURGE MINERAL REGISTRY CACHE
                    </button>
                </div>
            </div>
        `;
    }

	injectUI() {
		// 1. Overlay mount
		const overlayWrapper = document.getElementById("overlay-wrapper");
		if (overlayWrapper && !document.getElementById("miner-overlay-element")) {
			const overlayEl = document.createElement("div");
			overlayEl.id = "miner-overlay-element";
			overlayEl.className = "p8-widget"; 
			overlayEl.style.position = "absolute";
			
			// IMPORTANT: Inject both the unique bubble AND the unique canvas here
			overlayEl.innerHTML = `
				<div id="miner-bubble" class="chat-bubble"></div>
				<canvas id="miner-canvas"></canvas>
			`;
			
			overlayWrapper.appendChild(overlayEl);
		}

		// 2. Control Panel mount
		const controlContainer = document.getElementById("widget-control-wrapper");
		if (controlContainer && !document.getElementById("miner-widget-controls")) {
			const panelSection = document.createElement("div");
			panelSection.id = "miner-widget-controls";
			panelSection.className = "collapsible-section collapsed";
			panelSection.innerHTML = StreamBitMinerWidget.controlsTemplate;
			controlContainer.appendChild(panelSection);
		}
	}
	setWidgetBubble(txt) {
		const bubble = document.getElementById("miner-bubble");
		if (!bubble) return;

		// Clear existing timer logic (copy-paste your existing logic)
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
	bindEventListeners() {
        const controlContainer = document.getElementById("miner-widget-controls");
        if (!controlContainer) return;

        controlContainer.addEventListener("change", (e) => {
            // Target any checkbox inside your panel cleanly
            if (e.target.type === "checkbox") {
                this.state.hideBorder = e.target.checked;
                this.applyVisibilityStates();
                this.saveData();
            }
        });

        controlContainer.addEventListener("click", (e) => {
            if (e.target.id === "btnMineVein") {
                if (this.state.heatLevel >= 85) {
                    this.setWidgetBubble("❌ DRILL CORE OVERHEATED! Allow thermal venting sequence.");
                    return;
                }
                this.state.action = "processing";
                this.state.actionTimer = 90;
                this.setWidgetBubble("⚡ Boring into crystalized bit-vein layers...");
            }
            if (e.target.id === "btnMinerReset") {
                if (confirm("Are you sure you want to discard your mined minerals inventory data?")) {
                    localStorage.removeItem(this.STORAGE_KEY);
                    window.location.reload();
                }
            }
        });
    }

	applyVisibilityStates() {
        const overlayEl = document.getElementById("miner-overlay-element");
        if (!overlayEl) return;
        
        if (this.state.hideBorder) {
            overlayEl.style.border = "none";
            overlayEl.style.background = "transparent";
        } else {
            // Clear inline styles so the CSS file's var(--accent) takes over!
            overlayEl.style.border = "";
            overlayEl.style.background = "";
        }
    }
    loadData() {
        super.loadData();
        const borderToggle = document.getElementById("minerHideBorderToggle");
        if (borderToggle) borderToggle.checked = this.state.hideBorder || false;
        this.applyVisibilityStates();
    }

    updateAI(t) {
        if (MINER_ACTION_LIBRARY[this.state.action]) {
            MINER_ACTION_LIBRARY[this.state.action](this, { t });
        }
        for (let i = this.state.particles.length - 1; i >= 0; i--) {
            const p = this.state.particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.25;
            p.life--;
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
