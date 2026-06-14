/**
 * Global OBS-Safe stream widget Engine
 * 
 * Safe for multiple widgets on a single monolithic canvas.
 */
 console.log(" [Pixelb8 Stream Widget Engine]: initializing...");
 
/**
 * ============================================================================
 * PIXELB8 ECOSYSTEM: WIDGET ENGINE (Phase 1 - Co-Exist Mode)
 * Concern: Manages execution lifecycles for modern BaseWidgetModule components.
 * ============================================================================
 */

export const WidgetEngine = {
    instances: {
        bitminer: null
    },

    registryMap: {
        "miner-widget": {
            path: './bitminer-widget.js',
            className: 'StreamBitMinerWidget',
            instanceKey: 'bitminer'
        }
    },

    /**
     * Spawns or dismantles extended modules without touching your legacy items
     */
    async toggleWidget(idKey, enable) {
        const config = this.registryMap[idKey];
        if (!config) return; 

        if (enable) {
            if (!this.instances[config.instanceKey]) {
                try {
                    const module = await import(config.path);
                    const WidgetClass = module[config.className];
                    
                    // This creates the instance, triggering injectUI() and loadData() automatically
                    this.instances[config.instanceKey] = new WidgetClass();
                    
                    if (typeof window.injectAllWidgetCommands === 'function') {
                        window.injectAllWidgetCommands();
                    }
                    console.log(`⚙️ [WidgetEngine]: Modern module "${config.className}" initialized safely.`);
                } catch (err) {
                    console.error(`❌ [WidgetEngine Init Failure]:`, err);
                }
            }
        } else {
            const activeInstance = this.instances[config.instanceKey];
            if (activeInstance) {
                if (typeof activeInstance.destroy === 'function') {
                    activeInstance.destroy();
                }
                this.instances[config.instanceKey] = null;
                console.log(`⚙️ [WidgetEngine]: Cleaned structural footprint for ${config.className}.`);
            }
        }
    },

    /**
     * Restores active state targets during initial app launch
     */
    initSavedWidgets(settings) {
        if (!settings) return;
        // Boot up only the bitminer through the engine pass for Phase 1
        if (settings.bitminerWidgetEnabled) {
            this.toggleWidget("miner-widget", true);
        }
    }
};

















// =========================================================================
// END OF HELPERFUNCTIONS FILE
// =========================================================================
console.log(" [Pixelb8 Stream Widget Engine]: Initialized.");