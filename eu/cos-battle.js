let players = [];
let bossHP = 350; // Boss HP
let currentCOSbattleversion = 'beta 0.0192';
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

  // Generate players based on the entire list
  players = playerNames.map(name => {
    name = name.trim(); // Remove extra whitespace or newline characters

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

    // Track combatXP and healingXP separately
    return { 
      name, 
      playerContainer, 
      playerHP, 
      hp: 100,
      combatLvl: 0,
      combatXP: 0,  // Combat XP starts at 0
      healingLvl: 0,
      healingXP: 0,  // Healing XP starts at 0
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
    if (!player) {
      console.error('Player is undefined at index:', currentPlayerIndex);
      handleBattleEnd();
      return; // Stop if player is not found
    }

    const randomPlayerAction = Math.floor(Math.random() * 3); // Generate random action for player (0, 1, or 2)

    if (randomPlayerAction === 0) {
      // Default attack
      playerAttackBoss(player, 10); // Each player does 10 damage per attack
      player.combatXP += 10; // Gain 10 Combat XP for attacking
    } else if (randomPlayerAction === 1) {
      // Double attack
	  setgameMessage(`${player.name} attacks the boss twice!`);
      appendSystemMessage(`${player.name} attacks the boss twice!`);
      playerAttackBoss(player, 10); // First attack
      playerAttackBoss(player, 10); // Second attack
      player.combatXP += 20; // Gain 20 Combat XP for double attack
    } else if (randomPlayerAction === 2) {
      // Player heals
      const healAmount = Math.floor(Math.random() * 6); // Heal 0-5 HP
      player.hp = Math.min(player.hp + healAmount, 100); // Max HP is 100
      player.playerHP.innerText = `HP: ${player.hp}`; // Update player's HP display
	  setgameMessage(`${player.name} heals for ${healAmount} HP!`);
      appendSystemMessage(`${player.name} heals for ${healAmount} HP!`);
      player.healingXP += healAmount; // Gain Healing XP equal to healing amount
    }

    updatePlayerStats(); // Update player stats display

    currentPlayerIndex = (currentPlayerIndex + 1) % players.length; // Ensure index wraps around

    if (bossHP > 0) {
      setTimeout(() => {
        // Boss attacks a random player
        bossAttack();
        if (players.some(player => player.hp > 0) && bossHP > 0) {
          setTimeout(attackNextPlayer, 1000); // Move to next player after 1 second
        }
      }, 1000); // Boss takes turn after player's attack
    } else {
      
	  handleBattleEnd();
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
  setgameMessage(`${player.name} attacks the boss for ${damage} damage!`);
  appendSystemMessage(`${player.name} attacks the boss for ${damage} damage!`);

  // Visual feedback (e.g., change boss color briefly)
  document.getElementById('boss').style.borderColor = '#f00'; // Red flash
  setTimeout(() => {
    document.getElementById('boss').style.borderColor = '#4caf50'; // Back to green
  }, 500);
}

// Check if a player is defeated and move them to defeatedPlayers div
function checkIfPlayerDefeated(player) {
  if (player.hp <= 0) {
    player.playerContainer.style.opacity = '0.3'; // Fade out defeated player
    setgameMessage(`${player.name} has been defeated!`);
    appendSystemMessage(`${player.name} has been defeated!`);

    // Move player to the defeatedPlayers div
    const defeatedPlayersDiv = document.getElementById('defeatedPlayers');
    defeatedPlayersDiv.appendChild(player.playerContainer); // Move the player's container to the defeated section

    // Remove player from the active players list
    players = players.filter(p => p.name !== player.name);

    // Call handleBattleEnd if all players are defeated
    if (players.length === 0) {
      handleBattleEnd();
    }
  }
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
    setgameMessage(`Boss attacks ${player.name} for ${damage} damage!`);
    appendSystemMessage(`Boss attacks ${player.name} for ${damage} damage!`);

    // Update player's HP display
    player.playerHP.innerText = `HP: ${Math.max(player.hp, 0)}`; // Ensure HP doesn't go below 0

    // Visual feedback (e.g., change player border color to red briefly)
    player.playerContainer.style.borderColor = '#f00'; // Red flash
    setTimeout(() => {
      player.playerContainer.style.borderColor = '#4caf50'; // Back to green
    }, 500);

    // Check if the player is defeated
    checkIfPlayerDefeated(player);

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
      checkIfPlayerDefeated(player);
    });

    // Append system message for area attack
    setgameMessage(`Boss uses area attack, damaging all players for ${areaDamage} damage!`);
    appendSystemMessage(`Boss uses area attack, damaging all players for ${areaDamage} damage!`);

  } else if (randomAttack === 2) {
    // Self-heal: Boss heals 1-10 HP
    const healAmount = Math.floor(Math.random() * 10) + 1;
    bossHP = Math.min(bossHP + healAmount, maxBossHP); // Boss can't heal beyond max HP

    // Update boss HP display
    bossHPElement.textContent = bossHP;

    // Append system message for boss self-heal
    setgameMessage(`Boss heals for ${healAmount} HP!`);
    appendSystemMessage(`Boss heals for ${healAmount} HP!`);
  }
}

// Update and display player stats
function updatePlayerStats() {
  const playerStatsList = document.getElementById('playerStatsList');
  playerStatsList.innerHTML = ''; // Clear existing stats

  players.forEach(player => {
    const statsElement = document.createElement('li');
    statsElement.textContent = `${player.name} - Combat Lvl: ${player.combatLvl}, Combat XP: ${player.combatXP}, Healing Lvl: ${player.healingLvl}, Healing XP: ${player.healingXP}, HP: ${player.hp}`;
    playerStatsList.appendChild(statsElement);
  });
}
// Calculate XP bonus for players who survived the battle
function calculateSurvivalBonus() {
  players.forEach(player => {
    if (player.hp > 0) {
      // Add a 5% bonus to combat and healing XP if the player survived the battle
      player.combatXP += Math.floor(player.combatXP * 0.05);
      player.healingXP += Math.floor(player.healingXP * 0.05);
	  setgameMessage(`${player.name} survived the battle and earned a 5% XP bonus!`);
      appendSystemMessage(`${player.name} survived the battle and earned a 5% XP bonus!`);
    }
  });
  updatePlayerStats(); // Refresh the displayed stats
}

// Display system messages in the chat box
function appendSystemMessage(message) {
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  systemMessagesElement.appendChild(messageElement);

  // Scroll to the bottom of the chat box
  systemMessagesElement.scrollTop = systemMessagesElement.scrollHeight;
}

// Handle end of the battle
function handleBattleEnd() {
  if (bossHP <= 0) {
	setgameMessage('The battle is over. The players have defeated the boss!');
    appendSystemMessage('The battle is over. The players have defeated the boss!');
	calculateSurvivalBonus();
  } else if (players.every(player => player.hp <= 0)) {
	setgameMessage('All players have been defeated. The boss wins.');
    appendSystemMessage('All players have been defeated. The boss wins.');
	calculateSurvivalBonus();
  }
  setgameMessage('All players have been defeated. The boss wins.');
  appendSystemMessage('All players have been defeated. The boss wins.');
  // Display stats and XP for all players
  updatePlayerStats();
}

// Set the header message for the game
function setgameMessage(message) {
  headerMessagesElement.textContent = message;
}

// Display battle version at the top of the page
battleversionElement.textContent = currentCOSbattleversion;
// Initialize file input and button functionality
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('startBattleButton').addEventListener('click', startBattle);