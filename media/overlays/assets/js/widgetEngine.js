console.log("🚀 [Pixelb8 Stream Widget Engine]: initializing...");

/**
 * ============================================================================
 * PIXELB8 ECOSYSTEM: WIDGET ENGINE (Phase 1.7 - Data-Driven Core System)
 * Concern: Manages modern module lifecycles while bridging legacy boot components.
 * ============================================================================
 */
export const WidgetEngine = {
    // Dynamic runtime registry tracking active instances automatically on the fly
    instances: {},

    // 💡 THE SINGLE SOURCE OF TRUTH: Add a widget here, and it handles everything else.
    registryMap: {
        "miner-widget": {
            path: './bitminer-widget.js',
            className: 'StreamBitMinerWidget',
            instanceKey: 'bitminer',
            settingsKey: 'bitminerWidgetEnabled' // Links registry directly to your settings payload
        },
        "jukebox-widget": {
            path: './jukebox-widget.js',
            className: 'StreamJukeboxModule',
            instanceKey: 'streamjukebox',
            settingsKey: 'jukeboxWidgetEnabled'
        },
        "emojinko-widget": {
            path: './emojinko-widget.js',
            className: 'StreamEmojinkoModule',
            instanceKey: 'emojinko',
            settingsKey: 'emojinkoWidgetEnabled'
        }
    },

    /**
     * Loops over all modern registry items and toggles them based on incoming settings flags.
     */
    async autoBootModernWidgets(settings) {
        // Grab every entry key (e.g., "miner-widget", "emojinko-widget")
        const widgetKeys = Object.keys(this.registryMap);
        
        for (const idKey of widgetKeys) {
            const config = this.registryMap[idKey];
            
            // If the settings payload has this widget's unique settings key marked true, fire it up
            if (settings[config.settingsKey]) {
                // Pass true to third argument to defer mass chat command re-injection passes until the loop wraps up
                await this.toggleWidget(idKey, true, true);
            }
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
                    const cacheBuster = `?v=${Date.now()}`;
                    const module = await import(config.path + cacheBuster);
                    const WidgetClass = module[config.className];
                    
                    // The dynamic instances tracking assignment slot initializes right here automatically
                    this.instances[config.instanceKey] = new WidgetClass();
                    console.log(`⚙️ [WidgetEngine]: Modern module "${config.className}" initialized safely.`);
                    
                    if (!deferCommandRefresh && typeof window.injectAllWidgetCommands === 'function') {
                        window.injectAllWidgetCommands();
                    }
                } catch (err) {
                    console.error(`❌ [WidgetEngine Init Failure] for ${config.className}:`, err);
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
     * Dynamically injects schema rules into your UI settings panels directly from the registry definitions
     * @param {Array} schema - Your core SETTINGS_SCHEMA structure array from ttvoverlay.js
     */
    injectWidgetsIntoSchema(schema) {
        const widgetGroup = schema.find(group => group.groupName === "🧩 Widgets Settings");
        if (!widgetGroup) return;

        Object.entries(this.registryMap).forEach(([idKey, config]) => {
            // Check to prevent accidental duplicate appends across hot-reloads
            if (widgetGroup.items.some(item => item.idKey === idKey)) return;

            // Clean strings (e.g., "StreamEmojinkoModule" -> "Emojinko")
            const cleanName = config.className
                .replace('Stream', '')
                .replace('Widget', '')
                .replace('Module', '');

            widgetGroup.items.push({
                label: `Enable ${cleanName} Widget`,
                idKey: idKey,
                get: () => (typeof settings !== 'undefined' ? !!settings[config.settingsKey] : false),
                set: async (v) => {
                    if (typeof settings !== 'undefined') settings[config.settingsKey] = v;
                    if (typeof saveSettings === "function") saveSettings();

                    // Direct pipeline down to dynamic lifecycle hot-swaps
                    await this.toggleWidget(idKey, v);

                    if (typeof syncAllToggleUI === "function") syncAllToggleUI();
                }
            });
        });
    },

    /**
     * Handles the entire startup loading cascade for both modern and legacy tools
     */
    async initSavedWidgets(settings) {
        if (!settings) return;

        // 1. Cleanly execute the dynamic modern auto-boot engine sequence
        await this.autoBootModernWidgets(settings);

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