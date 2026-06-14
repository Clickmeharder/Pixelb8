console.log(" [Pixelb8 Stream Widget Engine]: initializing...");
 
/**
 * ============================================================================
 * PIXELB8 ECOSYSTEM: WIDGET ENGINE (Phase 1.5 - Hybrid Transition Bridge)
 * Concern: Manages modern module lifecycles while bridging legacy boot components.
 * ============================================================================
 */
function injectAllWidgetCommands() {
    // 🔍 Read instances from both legacy window tags AND your modern engine tracks
    const activeWidgets = [
        { name: "StreamPet", instance: window.streamPetEngine },
        { name: "EntropiaParser", instance: window.entropiaLogParser },
        { name: "StreamJukebox", instance: window.streamJukeboxEngine },
        
        // ⚙️ Safely scan your new engine instances array if the engine is initialized
        { 
            name: "BitMiner (Engine)", 
            instance: (typeof WidgetEngine !== 'undefined' && WidgetEngine.instances) ? WidgetEngine.instances.bitminer : null 
        }
    ];

    console.log("📡 [Command Registry]: Starting automated injection scan...");

    activeWidgets.forEach(widget => {
        if (widget.instance) {
            console.log(`✅ [Command Registry]: Found active instance for ${widget.name}. Injecting...`);
            injectWidgetCommands(widget.instance);
        } else {
            console.warn(`⚠️ [Command Registry]: Widget instance for ${widget.name} is null/undefined. Skipping.`);
        }
    });

    console.log("🏁 [Command Registry]: Injection scan complete.");
}
function injectWidgetCommands(widgetInstance) {
    if (widgetInstance && typeof widgetInstance.getCommands === 'function') {
        const widgetCommands = widgetInstance.getCommands(botSay);
        
        // Track successfully registered commands to print in a single line
        const registeredKeys = [];

        widgetCommands.forEach(cmd => {
            const lookupKey = cmd.name.toLowerCase().trim();
            
            if (!commandsRegistry[lookupKey]) {
                commandsRegistry[lookupKey] = {
                    adminOnly: cmd.adminOnly || false,
                    execute: cmd.execute
                };
                
                // Append format tag to our logging collection array
                const adminTag = cmd.adminOnly ? "🔒" : "👤";
                registeredKeys.push(`!${lookupKey} ${adminTag}`);
            }
        });

        // 📝 Consolidated Log: One clean printout statement per widget
        if (registeredKeys.length > 0) {
            console.log(`📡 [Commands]: Hooked [${registeredKeys.join(", ")}]`);
        } else {
            console.log(`📡 [Commands]: Scanning complete. No new command injections needed.`);
        }
    }
}
export const WidgetEngine = {
    instances: {
        bitminer: null // Modern tracker
    },

    registryMap: {
        "miner-widget": {
            path: './bitminer-widget.js',
            className: 'StreamBitMinerWidget',
            instanceKey: 'bitminer'
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
        if (settings.jukeboxWidgetEnabled) {
            try {
                const module = await import('./jukebox.js');
                window.StreamJukebox = module.StreamJukebox;
                window.streamJukeboxEngine = new module.StreamJukebox();
                console.log("⚙️ [WidgetEngine - Legacy Bridge]: Jukebox attached to global scope.");
            } catch (err) {
                console.error("❌ [Engine Legacy Boot Failure] Jukebox:", err);
            }
        }
		    // 2. Scan and inject any commands that were loaded during boot
		console.log("📡 [Command Registry]: Running boot scan...");
		injectAllWidgetCommands();
    }
};