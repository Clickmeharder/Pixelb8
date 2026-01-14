/**
 * PLUGIN NAME: [Your Plugin Name Here]
 * DESCRIPTION: A template for creating modular game components.
 */

(function() { // Wrapped in a IIFE to keep variables private
    
    /* 1. PLUGIN CONFIG & DATA */
    const PLUGIN_NAME = "MyNewGame"; // Change this for the HUD header
    
    /* 2. COMMAND DEFINITIONS */
    // Add your commands here. They will automatically appear in the HUD!
    const MY_PLUGIN_COMMANDS = {
        "hello": { 
            admin: false, 
            desc: "A friendly greeting.", 
            usage: "hello", 
            action: (p, user, args) => {
                systemMessage(`Hello ${user}! Welcome to the ${PLUGIN_NAME} plugin.`);
            }
        },
        "setstats": { 
            admin: true, 
            desc: "Admin only stat change.", 
            usage: "setstats [value]", 
            action: (p, user, args) => {
                console.log("Admin command fired!");
            }
        }
    };

    /* 3. LOGIC HANDLER */
    function pluginCommandHandler(user, msg, flags, extra) {
        // Optional: Get player data if this is for StickmenFall, or define your own
        // let p = getPlayer(user, extra.userColor); 
        
        let args = msg.split(" ");
        let cmd = args[0].toLowerCase().replace('!', ''); 

        const cmdData = MY_PLUGIN_COMMANDS[cmd];
        if (cmdData) {
            // Permission Check
            if (cmdData.admin && !flags.broadcaster && !flags.mod) return;
            // Execute Action
            cmdData.action(null, user, args, flags); 
        }
    }

    /* 4. INITIALIZATION (The Safety Net) */
    function initPlugin() {
        try {
            console.log(`[${PLUGIN_NAME}] Initializing...`);

            // Verify Engine is present
            if (typeof registerPluginCommands !== "function" || typeof registerChatPlugin !== "function") {
                throw new Error("TwitchChat Engine not found. Load twitchChat.js before this script.");
            }

            // Prepare lists for HUD
            const userList = [];
            const adminList = [];

            Object.keys(MY_PLUGIN_COMMANDS).forEach(key => {
                const c = MY_PLUGIN_COMMANDS[key];
                const entry = { command: key, description: c.desc, usage: c.usage };
                if (c.admin) adminList.push(entry);
                else userList.push(entry);
            });

            // Register with Engine
            registerPluginCommands(userList, false, PLUGIN_NAME);
            registerPluginCommands(adminList, true, PLUGIN_NAME);
            registerChatPlugin(pluginCommandHandler);

            // Start your specific loops here
            // myPluginLoop();

            console.log(`[${PLUGIN_NAME}] Ready!`);
        } catch (e) {
            console.error(`[${PLUGIN_NAME}] Failed to load:`, e.message);
        }
    }


})();