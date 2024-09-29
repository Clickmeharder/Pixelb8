// Twitch command handling
ComfyJS.onCommand = (user, command, message, flags, extra) => {
  if (command === "joingame") {
    // Check if the user is already in the list
    if (!twitchusersJoined.includes(user)) {
      twitchusersJoined.push(user);
      console.log(`${user} has joined the game`);

      // Append to the Twitch chat div to confirm user joined
      const messageDiv = document.createElement("div");
      messageDiv.textContent = `${user} has joined the game!`;
      document.getElementById("twitch-chat").appendChild(messageDiv);

      // Add the new player to the game individually
      addPlayerToGame(user);
    } else {
      // If user is already in the game, notify them
      const messageDiv = document.createElement("div");
      messageDiv.textContent = `${user}, you're already in the game!`;
      document.getElementById("twitch-chat").appendChild(messageDiv);
    }
  }
};

ComfyJS.Init("jaedraze");