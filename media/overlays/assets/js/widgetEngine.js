console.log(" [Pixelb8 Stream Widget Engine]: initializing...");
 
/**
 * ============================================================================
 * PIXELB8 ECOSYSTEM: WIDGET ENGINE (Phase 1.5 - Hybrid Transition Bridge)
 * Concern: Manages modern module lifecycles while bridging legacy boot components.
 * ============================================================================
 */
export const WidgetEngine = {
    instances: {
        bitminer: null // Modern tracker
		streamjukebox: null  // 🎵 Modernized Jukebox instance slot
    },

    registryMap: {
        "miner-widget": {
            path: './bitminer-widget.js',
            className: 'StreamBitMinerWidget',
            instanceKey: 'bitminer'
        },
        // 🎵 Added structural registry mapping pointing to your new class
        "jukebox-widget": {
            path: './jukebox-widget.js',
            className: 'StreamJukeboxModule',
            instanceKey: 'streamjukebox'
        }
    },

    /**
     * Spawns or dismantles extended modules
     */
    async toggleWidget(idKey, enable) {
        const config = this.registryMap[idKey];
        if (!config) return; 

        if (enable) {
            if (!this.instances[config.instanceKey]) {
                try {
                    const module = await import(config.path);
                    const WidgetClass = module[config.className];
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
     * Handles the entire startup loading cascade for both modern and legacy tools
     */
    async initSavedWidgets(settings) {
        if (!settings) return;

        // 1. Boot up the modern BaseWidgetModule apps
        if (settings.bitminerWidgetEnabled) {
            await this.toggleWidget("miner-widget", true);
        }
		// 🎵 PROMOTED UPWARD: The Jukebox now spawns cleanly via the modern class handler
        if (settings.jukeboxWidgetEnabled) {
            await this.toggleWidget("jukebox-widget", true);
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
                // Using your exact initialization file target path
                const module = await import('./entropiauniverse-widget.js');
                window.EntropiaWidget = module.EntropiaWidget;
                window.entropiaLogParser = new module.EntropiaWidget();
                console.log("⚙️ [WidgetEngine - Legacy Bridge]: Entropia Tracker attached to global scope.");
            } catch (err) {
                console.error("❌ [Engine Legacy Boot Failure] Entropia:", err);
            }
        }

        // 🎸 Legacy Jukebox Boot Pass
/*         if (settings.jukeboxWidgetEnabled) {
            try {
                const module = await import('./jukebox.js');
                window.StreamJukebox = module.StreamJukebox;
                window.streamJukeboxEngine = new module.StreamJukebox();
                console.log("⚙️ [WidgetEngine - Legacy Bridge]: Jukebox attached to global scope.");
            } catch (err) {
                console.error("❌ [Engine Legacy Boot Failure] Jukebox:", err);
            }
        } */
		    // 2. Scan and inject any commands that were loaded during boot

    }
};