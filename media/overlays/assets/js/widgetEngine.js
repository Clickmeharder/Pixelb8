console.log("🚀 [Pixelb8 Stream Widget Engine]: initializing...");

/**
 * ============================================================================
 * PIXELB8 ECOSYSTEM: WIDGET ENGINE (Phase 1.9 - Synchronized Lifecycles)
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
        const widgetKeys = Object.keys(this.registryMap);
        
        for (const idKey of widgetKeys) {
            const config = this.registryMap[idKey];
            
            // Explicitly sync window.settings to protect boot states
            if (window.settings && window.settings[config.settingsKey] !== undefined) {
                settings[config.settingsKey] = window.settings[config.settingsKey];
            }
            
            if (settings[config.settingsKey]) {
                await this.toggleWidget(idKey, true, true);
            }
        }
    },

    /**
     * Spawns or dismantles extended modules
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
                    
                    this.instances[config.instanceKey] = new WidgetClass(idKey);
                    console.log(`⚙️ [WidgetEngine]: Modern module "${config.className}" initialized safely with namespace scope "${idKey}".`);
                    
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
     */
    injectWidgetsIntoSchema(schema) {
        const widgetGroup = schema.find(group => group.groupName === "🧩 Widgets Settings");
        if (!widgetGroup) return;

        Object.entries(this.registryMap).forEach(([idKey, config]) => {
            if (widgetGroup.items.some(item => item.idKey === idKey)) return;

            const cleanName = config.className
                .replace('Stream', '')
                .replace('Widget', '')
                .replace('Module', '');

            widgetGroup.items.push({
                label: `Enable ${cleanName} Widget`,
                idKey: idKey,
                get: () => {
                    const globalSettings = window.settings || {};
                    return !!globalSettings[config.settingsKey];
                },
                set: async (v) => {
                    if (!window.settings) window.settings = {};
                    
                    // Force state alignment instantly in memory
                    window.settings[config.settingsKey] = v;

                    // Trigger the updated global save sequence
                    if (typeof window.saveSettings === "function") {
                        window.saveSettings();
                    }

                    await this.toggleWidget(idKey, v);

                    if (typeof window.syncAllToggleUI === "function") {
                        window.syncAllToggleUI();
                    }
                }
            });
        });
    },

    /**
     * Handles the entire startup loading cascade for both modern and legacy tools
     */
    async initSavedWidgets(settings) {
        if (!settings) return;

        await this.autoBootModernWidgets(settings);

        // =========================================================================
        // 🏛️ LEGACY COMPATIBILITY LAYER
        // =========================================================================
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

        if (typeof window.injectAllWidgetCommands === 'function') {
            window.injectAllWidgetCommands();
            console.log("⚙️ [WidgetEngine]: Core manifest mapping compiled cleanly for active chat listeners.");
        }
    }
};

// ============================================================================
// 🔌 GLOBAL REGISTRY HOOKS FOR TTVOVERLAYAPP.JS
// Exposes references so storage serialization engines know what keys to write.
// ============================================================================
if (typeof window !== 'undefined') {
    window.WidgetEngine = WidgetEngine;
    
    // Map registry definitions down into an iterable array flat list for saveSettings()
    window.DYNAMIC_WIDGET_MAPS = Object.values(WidgetEngine.registryMap);
}