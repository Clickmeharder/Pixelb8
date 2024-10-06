
let cheatUsageTracker = {}; // Object to track whether a player has used cheat
ComfyJS.onCommand = (user, command, message, flags, extra) => {
    console.log(`Command received: ${command} from ${user}`);
};
ComfyJS.onCommand = (user, command, message, flags, extra) => {
    switch(command) {
        case "join":
            if (!twitchusersJoined.includes(user)) {
                twitchusersJoined.push(user);
                cheatUsageTracker[user] = false; // Initialize cheat usage for the player
                console.log(`${user} has joined the game`);

                // Append to the Twitch chat div to confirm user joined
                const messageDiv = document.createElement("div");
                messageDiv.textContent = `${user} has joined the game!`;
                document.getElementById("twitch-chat").appendChild(messageDiv);

                // Dynamically generate the player for the new user
                generatePlayers(twitchusersJoined);
            } else {
                // If user is already in the game, notify them
                const messageDiv = document.createElement("div");
                messageDiv.textContent = `${user}, you're already in the game!`;
                document.getElementById("twitch-chat").appendChild(messageDiv);
            }
            break;
        
        case "cheat":
            if (twitchusersJoined.includes(user)) {
                // Check if the player has already used their cheat
                if (cheatUsageTracker[user]) {
                    const messageDiv = document.createElement("div");
                    messageDiv.textContent = `${user}, you've already used your cheat!`;
                    document.getElementById("twitch-chat").appendChild(messageDiv);
                } else {
                    // Allow the player to use the cheat
                    cheatCommand(user);
                    cheatUsageTracker[user] = true; // Mark that the player has used their cheat
                }
            } else {
                const messageDiv = document.createElement("div");
                messageDiv.textContent = `${user}, you need to join the game first!`;
                document.getElementById("twitch-chat").appendChild(messageDiv);
            }
            break;

        case "leavegame":
            if (twitchusersJoined.includes(user)) {
                // Remove the player from the game
                leaveGame(user);
            } else {
                const messageDiv = document.createElement("div");
                messageDiv.textContent = `${user}, you're not in the game!`;
                document.getElementById("twitch-chat").appendChild(messageDiv);
            }
            break;
    }
};

ComfyJS.Init("jaedraze");