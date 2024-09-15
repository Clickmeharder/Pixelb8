let players = [];
let bossHP = 1000; // Boss HP
const bossHPElement = document.getElementById('boss-hp');
const systemMessagesElement = document.getElementById('systemMessages');

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

// Add player images, names, and HP to the page
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

    // Create a span to hold the player's HP
    const playerHP = document.createElement('span');
    playerHP.innerText = 'HP: 100'; // Default HP for each player
    playerHP.classList.add('player-hp');

    // Append player, name, and HP to the container
    playerContainer.appendChild(player);
    playerContainer.appendChild(playerName);
    playerContainer.appendChild(playerHP);

    // Append player container to the playersDiv
    playersDiv.appendChild(playerContainer);

    return { name, playerContainer, playerHP, hp: 100 }; // Store player's HP
  });

  // Enable the Start Battle button
  document.getElementById('startBattleButton').disabled = false;
}

// Attack boss one player at a time, and the boss attacks players
function startBattle() {
  let currentPlayerIndex = 0;

  function attackNextPlayer() {
    if (currentPlayerIndex >= players.length || bossHP <= 0) {
      return; // Stop if no more players or boss is defeated
    }

    const player = players[currentPlayerIndex];
    const attackPower = 1; // Each player does 1 damage per attack
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
      setTimeout(() => {
        // Boss attacks a random player
        bossAttack();
        if (bossHP > 0) {
          setTimeout(attackNextPlayer, 1000); // Move to next player after 1 second
        }
      }, 1000); // Boss takes turn after player's attack
    } else {
      appendSystemMessage('Boss Defeated!');
    }
  }

  attackNextPlayer();
}

// Boss attacks a random player
function bossAttack() {
  const randomPlayerIndex = Math.floor(Math.random() * players.length);
  const player = players[randomPlayerIndex];

  const damage = Math.floor(Math.random() * 6) + 5; // Boss deals 5-10 damage
  player.hp -= damage;

  // Update player's HP display
  player.playerHP.innerText = `HP: ${Math.max(player.hp, 0)}`; // Ensure HP doesn't go below 0

  // Visual feedback (e.g., change player border color to red briefly)
  player.playerContainer.style.borderColor = '#f00'; // Red flash
  setTimeout(() => {
    player.playerContainer.style.borderColor = '#4caf50'; // Back to green
  }, 500);

  // Check if the player is defeated
  if (player.hp <= 0) {
    player.playerContainer.style.opacity = '0.5'; // Make defeated player look "faded"
    appendSystemMessage(`${player.name} has been defeated!`);
  }
}

// Function to append system messages to the system messages box
function appendSystemMessage(message) {
  const messageElement = document.createElement('div');
  messageElement.innerText = message;
  systemMessagesElement.appendChild(messageElement);

  // Scroll to the bottom of the messages box
  systemMessagesElement.scrollTop = systemMessagesElement.scrollHeight;
}

// Initialize file input and button functionality
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('startBattleButton').addEventListener('click', startBattle);
