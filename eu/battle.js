// Handle the file upload and parse player names
function handleFileUpload(event) {
  const file = event.target.files[0]; // Get the uploaded file
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      const text = e.target.result;
      const playerNames = text.trim().split('\n');
      generatePlayers(playerNames);
    };
    reader.readAsText(file); // Read the file content as text
  }
}

// Add player images and names to the page (no animations)
function generatePlayers(playerNames) {
  const playersDiv = document.getElementById('players');
  playersDiv.innerHTML = ''; // Clear existing players

  playerNames.forEach((name) => {
    const playerContainer = document.createElement('div');
    playerContainer.classList.add('player-container');
    
    const player = document.createElement('div');
    player.classList.add('player');
    player.style.backgroundImage = `url('assets/images/avatarwavingg.png')`; // Replace with your player image

    // Create a span to hold the player's name
    const playerName = document.createElement('span');
    playerName.innerText = name;
    playerName.classList.add('player-name');

    // Append player and name to the container
    playerContainer.appendChild(player);
    playerContainer.appendChild(playerName);

    // Append player container to the playersDiv
    playersDiv.appendChild(playerContainer);
  });
}

// Initialize file input functionality
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
