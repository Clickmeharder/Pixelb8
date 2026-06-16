console.log("🚀 [Pixelb8 Stream Widget Engine]: initializing...");

/**
 * ============================================================================
 * PIXELB8 ECOSYSTEM: WIDGET ENGINE (Phase 1.6 - Unified Core System)
 * Concern: Manages modern module lifecycles while bridging legacy boot components.
 * ============================================================================
 */
export const WidgetEngine = {
    instances: {
        bitminer: null, 
        streamjukebox: null  
    },

    registryMap: {
        "miner-widget": {
            path: './bitminer-widget.js',
            className: 'StreamBitMinerWidget',
            instanceKey: 'bitminer'
        },
        "jukebox-widget": {
            path: './jukebox-widget.js',
            className: 'StreamJukeboxModule',
            instanceKey: 'streamjukebox'
        }
    },

    /**
     * Spawns or dismantles extended modules
     * @param {string} idKey - Core registry key entry identifier
     * @param {boolean} enable - Target toggle operational condition
     * @param {boolean} deferCommandRefresh - If true, skips updating global chat maps instantly
     */
    async toggleWidget(idKey, enable, deferCommandRefresh = false) {
        const config = this.registryMap[idKey];
        if (!config) return; 

        if (enable) {
            if (!this.instances[config.instanceKey]) {
                try {
                    // Cache bust string additions ensure updates serve cleanly across hot-reloads
                    const cacheBuster = `?v=${Date.now()}`;
                    const module = await import(config.path + cacheBuster);
                    const WidgetClass = module[config.className];
                    
                    this.instances[config.instanceKey] = new WidgetClass();
                    console.log(`⚙️ [WidgetEngine]: Modern module "${config.className}" initialized safely.`);
                    
                    if (!deferCommandRefresh && typeof window.injectAllWidgetCommands === 'function') {
                        window.injectAllWidgetCommands();
                    }
                } catch (err) {
                    console.error(`❌ [WidgetEngine Init Failure]:`, err);
                }
            }
        } else {
            const activeInstance = this.instances[config.instanceKey];
            if (activeInstance) {
                try {
                    if (typeof activeInstance.destroy === 'function') {
                        activeInstance.destroy();
                    }
                } catch (err) {
                    console.error(`❌ [WidgetEngine Teardown Error] for ${config.className}:`, err);
                }
                
                this.instances[config.instanceKey] = null;
                console.log(`⚙️ [WidgetEngine]: Cleaned structural footprint for ${config.className}.`);
                
                if (!deferCommandRefresh && typeof window.injectAllWidgetCommands === 'function') {
                    window.injectAllWidgetCommands();
                }
            }
        }
    },

    /**
     * Handles the entire startup loading cascade for both modern and legacy tools
     */
    async initSavedWidgets(settings) {
        if (!settings) return;

        // 1. Boot modern BaseWidgetModule systems silently, deferring command injection passes
        if (settings.bitminerWidgetEnabled) {
            await this.toggleWidget("miner-widget", true, true);
        }
        if (settings.jukeboxWidgetEnabled) {
            await this.toggleWidget("jukebox-widget", true, true);
        }

        // =========================================================================
        // 🏛️ LEGACY COMPATIBILITY LAYER (To be refactored into classes later)
        // =========================================================================
        
        // 🐾 Legacy Pet Widget Boot Pass
        if (settings.petWidgetEnabled) {
            try {
                const module = await import('./pet-widget.js');
                window.StreamPet = module.StreamPet;
                window.streamPetEngine = new module.StreamPet();
                console.log("⚙️ [WidgetEngine - Legacy Bridge]: Pet Widget attached to global scope.");
            } catch (err) {
                console.error("❌ [Engine Legacy Boot Failure] Pet Widget:", err);
            }
        }

        // 🎯 Legacy Entropia Widget Boot Pass
        if (settings.entropiaWidgetEnabled) {
            try {
                const module = await import('./entropiauniverse-widget.js');
                window.EntropiaWidget = module.EntropiaWidget;
                window.entropiaLogParser = new module.EntropiaWidget();
                console.log("⚙️ [WidgetEngine - Legacy Bridge]: Entropia Tracker attached to global scope.");
            } catch (err) {
                console.error("❌ [Engine Legacy Boot Failure] Entropia:", err);
            }
        }

        // 2. UNIFIED INJECTION POINT: Safely rebuild command routing arrays once core loads wrap up
        if (typeof window.injectAllWidgetCommands === 'function') {
            window.injectAllWidgetCommands();
            console.log("⚙️ [WidgetEngine]: Core manifest mapping compiled cleanly for active chat listeners.");
        }
    }
};