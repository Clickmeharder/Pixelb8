
    const avatars = {}; // Store active players
    const commands = ['!move', '!jump', '!skat']; // Available commands

    // Ensure ComfyJS is loaded before proceeding
    if (typeof ComfyJS === 'undefined') {
      console.error('ComfyJS is not defined. Ensure the script is loaded properly.');
    } else {
      // Function to sync avatars to the beat
      function syncToBeat(player, command) {
        const avatar = document.getElementById(player);
        if (avatar) {
          // Perform action based on command
          switch (command) {
            case '!move':
              avatar.style.transform = `translateX(${Math.random() * 100 - 50}px)`;
              break;
            case '!jump':
              avatar.style.transform = `translateY(-30px)`;
              setTimeout(() => (avatar.style.transform = 'translateY(0px)'), 200);
              break;
            case '!skat':
              avatar.style.backgroundColor = "#ff00ff";
              setTimeout(() => (avatar.style.backgroundColor = "white"), 500);
              break;
          }
        }
      }

      // Create a new avatar when a player joins
      async function addPlayer(user, profileImageURL) {
        if (!avatars[user]) {
          const avatar = document.createElement('div');
          avatar.id = user;
          avatar.classList.add('avatar');
          avatar.style.left = `${Math.random() * 90}%`;
          avatar.style.bottom = '10%';

          const img = document.createElement('img');
          img.src = profileImageURL || 'https://placekitten.com/50/50'; // Default image
          avatar.appendChild(img);

          document.body.appendChild(avatar);
          avatars[user] = true;
        }
      }

      // Initialize Comfy.js
      // Initialize ComfyJS with the correct Twitch username
	  ComfyJS.Init("jaedraze");

      // Handle chat messages
      ComfyJS.onCommand = (user, command, message, flags, extra) => {
        if (commands.includes(`!${command}`)) {
          if (!avatars[user]) {
            addPlayer(user, extra.userProfileImage);
          }
          syncToBeat(user, `!${command}`);
        }
      };
    }