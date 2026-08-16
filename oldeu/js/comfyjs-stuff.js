
let cheatUsageTracker = {}; // Object to track whether a player has used cheat


ComfyJS.onCommand = (user, command, message, flags, extra) => {
    console.log(`Command received: ${command} from ${user}`);
    switch(command.toLowerCase()) { // Convert to lowercase to avoid case sensitivity issues
        
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

        case "heal":
        case "fap":
            if (playersHealed[user]) {
                const messageDiv = document.createElement("div");
                messageDiv.textContent = `${user}, you have already used the heal/fap command!`;
                document.getElementById("twitch-chat").appendChild(messageDiv);
                return;
            }

            playersHealed[user] = true; // Mark the player as having used the heal/fap command

            const playerIndex = players.indexOf(user);
            if (playerIndex === -1) {
                setgameMessage(`${user} is not in the game and cannot be healed/fapped!`);
                return;
            }

            const playerAvatar = playerAvatars[playerIndex];
            const healAmount = Math.floor(Math.random() * 6) + 5; // Heal between 5 and 10
            const playerHPElement = playerAvatar.querySelector('.player-hp');
            let currentHP = parseInt(playerHPElement.innerText.replace('HP: ', ''));
            const newHP = Math.min(currentHP + healAmount, 100); // Cap at 100 HP

            playerHPElement.innerText = `HP: ${newHP}`;
            setgameMessage(`${user} has healed/fapped for ${healAmount} HP! Remaining HP: ${newHP}`);
            appendSystemMessage(`${user} has healed/fapped for ${healAmount} HP! Remaining HP: ${newHP}`);
            break;

        case "nuke":
            nuke(); // Call the nuke function
            break;

        default:
            console.log(`Unknown command: ${command}`);
            break;
    }
};

// Initialize ComfyJS with the correct Twitch username
ComfyJS.Init("jaedraze");