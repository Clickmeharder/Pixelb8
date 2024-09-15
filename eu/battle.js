let players = [];
let bossHP = 1000; // Boss HP
const bossHPElement = document.getElementById('boss-hp');

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

// Add player images and names to the page
function generatePlayers(playerNames) {
  const playersDiv = document.getElementById('players');
  playersDiv.innerHTML = ''; // Clear existing players

  players = playerNames.map((name, index) => {
    const playerContainer = document.createElement('div');
    playerContainer.classList.add('player-container');
    
    const player = document.createElement('div');
    player.classList.add('player');
    player.style.backgroundImage = `url('data/images/avatarwavingg.png')`; // Replace with your player image

    // Create a span to hold the player's name
    const playerName = document.createElement('span');
    playerName.innerText = name;
    playerName.classList.add('player-name');

    // Append player and name to the container
    playerContainer.appendChild(player);
    playerContainer.appendChild(playerName);

    // Append player container to the playersDiv
    playersDiv.appendChild(playerContainer);

    return { name, playerContainer };
  });

  // Enable the Start Battle button
  document.getElementById('startBattleButton').disabled = false;
}

// Attack boss one player at a time
function startBattle() {
  let currentPlayerIndex = 0;

  function attackNextPlayer() {
    if (currentPlayerIndex >= players.length || bossHP <= 0) {
      return; // Stop if no more players or boss is defeated
    }

    const player = players[currentPlayerIndex];
    const attackPower = 1; // Each player does 100 damage per attack
    bossHP -= attackPower;

    // Update boss HP display
    bossHPElement.textContent = Math.max(bossHP, 0); // Ensure boss HP doesn't go below 0

    // Visual feedback (e.g., change boss color briefly)
    document.getElementById('boss').style.borderColor = '#f00'; // Red flash
    setTimeout(() => {
      document.getElementById('boss').style.borderColor = '#4caf50'; // Back to green
    }, 500);

    currentPlayerIndex++;
    if (bossHP > 0) {
      setTimeout(attackNextPlayer, 1000); // Move to next player after 1 second
    } else {
      alert('Boss Defeated!');
    }
  }

  attackNextPlayer();
}

// Initialize file input and button functionality
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('startBattleButton').addEventListener('click', startBattle);