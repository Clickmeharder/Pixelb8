
let players = [];
let bossHP = 350; // Boss HP
let currentCOSbattleversion = 0.02;
const battleversionElement = document.getElementById('cos-battle-version');

const bossHPElement = document.getElementById('boss-hp');
const systemMessagesElement = document.getElementById('systemMessages');
const headerMessagesElement = document.getElementById('headerTexts');
const maxBossHP = 500; // The maximum HP the boss can heal to

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

// Add player images, names, HP, and XP to the page
function generatePlayers(playerNames) {
  const playersDiv = document.getElementById('players');
  playersDiv.innerHTML = ''; // Clear existing players

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

    return { 
      name, 
      playerContainer, 
      playerHP, 
      hp: 100, 
      xp: 0  // Add XP property for each player
    }; 
  });

  // Enable the Start Battle button
  document.getElementById('startBattleButton').disabled = false;
}

// Start the battle and loop through players
function startBattle() {
  let currentPlayerIndex = 0;

  function attackNextPlayer() {
    if (players.every(player => player.hp <= 0) || bossHP <= 0) {
      handleBattleEnd();
      return; // Stop if all players are defeated or boss is defeated
    }

    const player = players[currentPlayerIndex];
    const randomPlayerAction = Math.floor(Math.random() * 3); // Generate random action for player (0, 1, or 2)

    if (randomPlayerAction === 0) {
      // Default attack
      playerAttackBoss(player, 10); // Each player does 10 damage per attack
      player.xp += 10; // Gain 10 XP for attacking
    } else if (randomPlayerAction === 1) {
      // Double attack
      appendSystemMessage(`${player.name} attacks the boss twice!`);
      playerAttackBoss(player, 10); // First attack
      playerAttackBoss(player, 10); // Second attack
      player.xp += 20; // Gain 20 XP for double attack
    } else if (randomPlayerAction === 2) {
      // Player heals
      const healAmount = Math.floor(Math.random() * 6); // Heal 0-5 HP
      player.hp = Math.min(player.hp + healAmount, 100); // Max HP is 100
      player.playerHP.innerText = `HP: ${player.hp}`; // Update player's HP display
      appendSystemMessage(`${player.name} heals for ${healAmount} HP!`);
      player.xp += healAmount; // Gain XP equal to healing amount
    }

    updatePlayerStats(); // Update player stats display

    currentPlayerIndex++;

    if (bossHP > 0) {
      setTimeout(() => {
        // Boss attacks a random player
        bossAttack();
        if (players.some(player => player.hp > 0) && bossHP > 0) {
          setTimeout(attackNextPlayer, 1000); // Move to next player after 1 second
        }
      }, 1000); // Boss takes turn after player's attack
    } else {
      appendSystemMessage('Boss Defeated!');
      setgameMessage('Boss Defeated!');

      // Call XP calculation after boss is defeated
      calculateSurvivalBonus();
    }
  }

  attackNextPlayer();
}

// Player attacks boss with damage
function playerAttackBoss(player, damage) {
  bossHP -= damage;

  // Update boss HP display
  bossHPElement.textContent = Math.max(bossHP, 0); // Ensure boss HP doesn't go below 0

  // Append system message when a player attacks the boss
  appendSystemMessage(`${player.name} attacks the boss for ${damage} damage!`);

  // Visual feedback (e.g., change boss color briefly)
  document.getElementById('boss').style.borderColor = '#f00'; // Red flash
  setTimeout(() => {
    document.getElementById('boss').style.borderColor = '#4caf50'; // Back to green
  }, 500);
}

// Boss attacks with one of three options
function bossAttack() {
  const randomAttack = Math.floor(Math.random() * 3); // Generate a number between 0 and 2

  if (randomAttack === 0) {
    // Default attack: Boss attacks a random player
    const randomPlayerIndex = Math.floor(Math.random() * players.length);
    const player = players[randomPlayerIndex];
    const damage = Math.floor(Math.random() * 6) + 5; // Boss deals 5-10 damage
    player.hp -= damage;

    // Append system message when the boss attacks a player
    appendSystemMessage(`Boss attacks ${player.name} for ${damage} damage!`);

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

  } else if (randomAttack === 1) {
    // Area attack: Boss damages all players for 1-10 damage
    const areaDamage = Math.floor(Math.random() * 10) + 1;
    players.forEach(player => {
      player.hp -= areaDamage;

      // Update player's HP display
      player.playerHP.innerText = `HP: ${Math.max(player.hp, 0)}`;

      // Visual feedback for all players
      player.playerContainer.style.borderColor = '#f00'; // Red flash
      setTimeout(() => {
        player.playerContainer.style.borderColor = '#4caf50'; // Back to green
      }, 500);

      // Check if the player is defeated
      if (player.hp <= 0) {
        player.playerContainer.style.opacity = '0.5'; // Make defeated player look "faded"
        appendSystemMessage(`${player.name} has been defeated!`);
      }
    });

    // Append system message for area attack
    appendSystemMessage(`Boss uses area attack, damaging all players for ${areaDamage} damage!`);

  } else if (randomAttack === 2) {
    // Self-heal: Boss heals 1-10 HP
    const healAmount = Math.floor(Math.random() * 10) + 1;
    bossHP = Math.min(bossHP + healAmount, maxBossHP); // Boss can't heal beyond max HP

    // Update boss HP display
    bossHPElement.textContent = bossHP;

    // Append system message for boss self-heal
    appendSystemMessage(`Boss heals for ${healAmount} HP!`);
  }
}

// Handle the end of the battle, calculate survival bonus XP
function calculateSurvivalBonus() {
  players.forEach(player => {
    if (player.hp > 0) {
      const bonusXP = Math.floor(player.xp * 0.05); // 5% XP bonus for survival
      player.xp += bonusXP;
      appendSystemMessage(`${player.name} survived and gains a ${bonusXP} XP bonus! Total XP: ${player.xp}`);
    }
  });
}

// Helper function to append system messages
function appendSystemMessage(message) {
  const newMessage = document.createElement('p');
  newMessage.innerText = message;
  systemMessagesElement.appendChild(newMessage);
  systemMessagesElement.scrollTop = systemMessagesElement.scrollHeight; // Auto-scroll to the bottom
}

// Handle header message display
function setgameMessage(message) {
  headerMessagesElement.innerHTML = message;
}

// Update and display player stats
function updatePlayerStats() {
  const playerStatsList = document.getElementById('playerStatsList');
  playerStatsList.innerHTML = ''; // Clear existing stats

  players.forEach(player => {
    const statsDiv = document.createElement('div');
    statsDiv.classList.add('player-stats');

    // Create HTML elements to display player's stats
    const nameElement = document.createElement('div');
    nameElement.textContent = `Name: ${player.name}`;

    const hpElement = document.createElement('div');
    hpElement.textContent = `HP: ${player.hp}`;

    const xpElement = document.createElement('div');
    xpElement.textContent = `XP: ${player.xp}`;

    // Append the elements to the statsDiv
    statsDiv.appendChild(nameElement);
    statsDiv.appendChild(hpElement);
    statsDiv.appendChild(xpElement);

    // Append statsDiv to the playerStatsList
    playerStatsList.appendChild(statsDiv);
    handleBattleEnd();
  });
}

// Handle battle end, check if all players are defeated or the boss is defeated
function handleBattleEnd() {
  if (players.every(player => player.hp <= 0)) {
    setgameMessage('All players are defeated!');
    appendSystemMessage('All players are defeated!');
  } else if (bossHP <= 0) {
    setgameMessage('Boss Defeated!');
    appendSystemMessage('Boss Defeated!');
  }
}



battleversionElement.innerText = `COS Battle Version: ${currentCOSbattleversion}`;
// Initialize file input and button functionality
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('startBattleButton').addEventListener('click', updatePlayerStats);