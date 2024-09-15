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

// Add player images to the page and animate them
function generatePlayers(playerNames) {
  const playersDiv = document.getElementById('players');
  playersDiv.innerHTML = ''; // Clear existing players

  playerNames.forEach((name, index) => {
    const player = document.createElement('div');
    player.classList.add('player');
    player.style.backgroundImage = `url('player_image.png')`; // Replace with your player image
    player.style.top = `${Math.random() * 400}px`;
    player.style.left = `${Math.random() * 600}px`;
    
    // Animate players attacking boss
    animatePlayer(player);
    playersDiv.appendChild(player);
  });
}

// Simple animation function for players
function animatePlayer(player) {
  let posX = 0;
  let posY = 0;
  const boss = document.getElementById('boss');
  const bossRect = boss.getBoundingClientRect();

  const interval = setInterval(() => {
    const playerRect = player.getBoundingClientRect();
    if (playerRect.left >= bossRect.left && playerRect.top >= bossRect.top) {
      clearInterval(interval); // Stop when near boss
      player.style.backgroundColor = 'red'; // Indicate hit
    } else {
      player.style.left = `${posX += 5}px`;
      player.style.top = `${posY += 5}px`;
    }
  }, 100);
}

// Initialize file input and button functionality
document.getElementById('fileInput').addEventListener('change', handleFileUpload);