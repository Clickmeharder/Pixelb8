let players = [];
const systemMessages = document.getElementById('systemMessages');

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
    player.style.backgroundImage = `url('data/images/femaledefault.png')`; // Replace with your player image

    // Create a span to hold the player's name
    const playerName = document.createElement('span');
    playerName.innerText = name;
    playerName.classList.add('player-name');

    // Append player and name to the container
    playerContainer.appendChild(player);
    playerContainer.appendChild(playerName);

    // Set random initial position
    playerContainer.style.top = `${Math.random() * 80}vh`;
    playerContainer.style.left = `${Math.random() * 95}vw`;

    // Append player container to the playersDiv
    playersDiv.appendChild(playerContainer);

    return { name, playerContainer, loot: 0 };
  });

  // Start roaming and resource searching
  startRoaming();
}

// Make players randomly roam around the screen, but smoothly
function startRoaming() {
  setInterval(() => {
    players.forEach(player => {
      const newTop = Math.random() * 80 + 'vh';
      const newLeft = Math.random() * 95 + 'vw';
      player.playerContainer.style.top = newTop;
      player.playerContainer.style.left = newLeft;
    });
  }, 10000); // Roam every 10 seconds for smoother movement

  // Start searching for resources every 5 minutes
  setInterval(searchForResources, 300000); // 5 minutes
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

// Add system messages to the systemMessages div
function addSystemMessage(message) {
  const messageElement = document.createElement('p');
  messageElement.innerText = message;
  systemMessages.appendChild(messageElement);
  systemMessages.scrollTop = systemMessages.scrollHeight; // Auto-scroll to the latest message
}

// Initialize file input and button functionality
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
