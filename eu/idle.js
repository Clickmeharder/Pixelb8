let players = [];
const systemMessages = document.getElementById('systemMessages');
let currentidleversion = 'beta 0.001';
const idleversionElement = document.getElementById('idle-version');
// Handle the file upload and parse player names
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      const playerNames = text.trim().split('\n');
      generatePlayers(playerNames);
    };
    reader.readAsText(file);
  }
}

// Add player images and names to the page
function generatePlayers(playerNames) {
  const playersDiv = document.getElementById('players');
  playersDiv.innerHTML = '';

  players = playerNames.map((name, index) => {
    const playerContainer = document.createElement('div');
    playerContainer.classList.add('player-container');

    const player = document.createElement('div');
    player.classList.add('player');
    player.style.backgroundImage = `url('data/images/femaledefault.png')`;

    const playerName = document.createElement('span');
    playerName.innerText = name;
    playerName.classList.add('player-name');

    playerContainer.appendChild(player);
    playerContainer.appendChild(playerName);

    playerContainer.style.top = `${Math.random() * 80}vh`;
    playerContainer.style.left = `${Math.random() * 95}vw`;

    playersDiv.appendChild(playerContainer);

    return {
      name,
      playerContainer,
      loot: 0,
      state: 'roaming',
      roamTimeout: null,
      lurkRadius: 0.1 + Math.random() * 2.0, // Random lurk radius between 0.1 and 0.3 vw
      lurkDuration: Math.random() * 120000 + 60000, // 1 to 3 minutes
      roamDuration: Math.random() * 60000 + 30000, // 30 to 90 seconds
      lurkRadiusElement: null // Placeholder for lurk radius circle
    };
  });

  startPlayerActivity();
}

function startPlayerActivity() {
  players.forEach(player => {
    // Create an additional element under the player's name to show status and time
    const statusText = document.createElement('span');
    statusText.classList.add('status-text');
    player.playerContainer.appendChild(statusText);

    function switchState() {
      if (player.state === 'roaming') {
        // Start lurking
        player.state = 'lurking';
        showLurkRadius(player);
        statusText.innerText = 'Lurking...'; // Update status text to show Lurk state
        const lurkStartTime = Date.now();

        const lurkDurationMs = player.lurkDuration;
        const lurkInterval = setInterval(() => {
          const elapsed = Date.now() - lurkStartTime;
          const remainingTime = ((lurkDurationMs - elapsed) / 1000).toFixed(1); // Remaining time in seconds
          statusText.innerText = `Lurking... ${remainingTime}s left`;

          if (elapsed >= lurkDurationMs) {
            clearInterval(lurkInterval);
            player.state = 'roaming';
            hideLurkRadius(player); // Hide the radius when roaming
            statusText.innerText = 'Roaming...';
            switchState();
          }
        }, 100); // Update the remaining time every 100ms
      } else {
        // Start roaming
        player.state = 'roaming';
        hideLurkRadius(player); // Hide the radius when roaming
        statusText.innerText = 'Roaming...';

        setTimeout(() => {
          player.state = 'lurking';
          showLurkRadius(player); // Show the radius when lurking
          statusText.innerText = 'Lurking...';
          switchState();
        }, player.roamDuration);
      }
    }

    // Initial state
    switchState();

    // Manage player movement
    setInterval(() => {
      if (player.state === 'lurking') {
        // 30% chance to move to the edge
        const shouldMoveToEdge = Math.random() < 0.3;

        if (shouldMoveToEdge) {
          // Move to the edge of the lurk radius
          const angle = Math.random() * 2 * Math.PI; // Random angle
          const x = Math.cos(angle) * player.lurkRadius;
          const y = Math.sin(angle) * player.lurkRadius;

          const currentTop = parseFloat(player.playerContainer.style.top) || 50;
          const currentLeft = parseFloat(player.playerContainer.style.left) || 50;

          player.playerContainer.style.transition = 'top 1s ease, left 1s ease'; // Faster transition
          player.playerContainer.style.top = `${currentTop + y}vh`;
          player.playerContainer.style.left = `${currentLeft + x}vw`;
        } else {
          // Move randomly within the lurk radius
          const x = Math.random() * player.lurkRadius * 2 - player.lurkRadius;
          const y = Math.random() * player.lurkRadius * 2 - player.lurkRadius;

          const currentTop = parseFloat(player.playerContainer.style.top) || 50;
          const currentLeft = parseFloat(player.playerContainer.style.left) || 50;

          player.playerContainer.style.transition = 'top 1s ease, left 1s ease'; // Faster transition
          player.playerContainer.style.top = `${currentTop + y}vh`;
          player.playerContainer.style.left = `${currentLeft + x}vw`;
        }

        triggerRandomEvents(true); // Higher chance of events happening when lurking
      } else if (player.state === 'roaming') {
        // Move the player to a new random location on the map while roaming
        player.playerContainer.style.transition = 'top 5s ease, left 5s ease'; // Normal speed while roaming
        const newTop = Math.random() * 80 + 'vh';
        const newLeft = Math.random() * 95 + 'vw';
        player.playerContainer.style.top = newTop;
        player.playerContainer.style.left = newLeft;
      }
    }, 2000); // Update position every 2 seconds for more frequent movement
  });

  setInterval(searchForResources, 300000); // Search for resources every 5 minutes
}

// Show the lurk radius when player is lurking
function showLurkRadius(player) {
  const playerSize = 50; // Player size is 50px by 50px
  const radiusSize = playerSize * 4; // Lurk radius is 4 times the player's size (200px)

  if (!player.lurkRadiusElement) {
    const radiusElement = document.createElement('div');
    radiusElement.classList.add('lurk-radius');
    radiusElement.style.width = `${radiusSize}px`;
    radiusElement.style.height = `${radiusSize}px`;

    // Center the radius relative to the player
    radiusElement.style.top = `${-((radiusSize - playerSize) / 2)}px`;
    radiusElement.style.left = `${-((radiusSize - playerSize) / 2)}px`;

    // Attach radius to player container
    player.lurkRadiusElement = radiusElement;
    player.playerContainer.appendChild(radiusElement); 
  }
}


// Hide the lurk radius when player starts roaming
function hideLurkRadius(player) {
  if (player.lurkRadiusElement) {
    player.playerContainer.removeChild(player.lurkRadiusElement);
    player.lurkRadiusElement = null; // Reset radius element
  }
}
// Search for resources and give loot to players
function searchForResources() {
  players.forEach(player => {
    const loot = (Math.random() * 0.99 + 0.01).toFixed(2); // Generate loot between 0.01 and 1.00
    player.loot += parseFloat(loot);

    // Display system message
    addSystemMessage(`${player.name} found ${loot} loot!`);
  });
}
let lastEventTime = Date.now();
function triggerRandomEvents(isLurking) {
  const now = Date.now();
  const eventInterval = isLurking ? Math.random() * 1800000 + 1800000 : Math.random() * 3600000 + 1800000;

  if (now - lastEventTime >= eventInterval) {
    const events = [
      { type: 'resource', name: 'fruit', amount: Math.floor(Math.random() * 200) + 1 },
      { type: 'resource', name: 'stone', amount: Math.floor(Math.random() * 200) + 1 },
      { type: 'resource', name: 'feces', amount: Math.floor(Math.random() * 200) + 1 },
      { type: 'danger', name: 'fall', chance: ishiding ? 0.2 : 0.1 }
    ];

    players.forEach(player => {
      const event = events[Math.floor(Math.random() * events.length)];

      if (event.type === 'resource') {
        if (Math.random() < 0.5) {
          const loot = event.amount;
          player.loot += loot;
          addSystemMessage(`${player.name} found ${loot} ${event.name}!`);
        }
      } else if (event.type === 'danger') {
        if (Math.random() < event.chance) {
          addSystemMessage(`${player.name} nearly fell to their death but survived!`);
        }
      }
    });

    lastEventTime = now; // Update last event time
  }
}

function addSystemMessage(message) {
  const messageElement = document.createElement('p');
  messageElement.innerText = message;
  systemMessages.appendChild(messageElement);
  systemMessages.scrollTop = systemMessages.scrollHeight;
}
// Display battle version at the top of the page
idleversionElement.textContent = currentidleversion;
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
