let twitchusersJoined = [];

ComfyJS.onCommand = (user, command, message, flags, extra) => {
    switch(command) {
        case "joingame":
            if (!twitchusersJoined.includes(user)) {
                twitchusersJoined.push(user);
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
                // Implement cheat: Switch places with a nearby player
                cheatCommand(user);
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