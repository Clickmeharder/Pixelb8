
let players = [];
let bossHP = 350; // Boss HP
let currentCOSbattleversion = 'beta 0.0182' ;
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
	  HealingLvl: 0,
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
      appendSystemMessage(`${player.name} attacks the boss twice!`);
      playerAttackBoss(player, 10); // First attack
      playerAttackBoss(player, 10); // Second attack
      player.combatXP += 20; // Gain 20 Combat XP for double attack
    } else if (randomPlayerAction === 2) {
      // Player heals
      const healAmount = Math.floor(Math.random() * 6); // Heal 0-5 HP
      player.hp = Math.min(player.hp + healAmount, 100); // Max HP is 100
      player.playerHP.innerText = `HP: ${player.hp}`; // Update player's HP display
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
      appendSystemMessage('Boss Defeated!');
      setgameMessage('Boss Defeated!');

      // Call XP calculation after boss is defeated
      calculateSurvivalBonus();
    }
  }

  attackNextPlayer();
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

	const combatLvlElement = document.createElement('div');
    combatLvlElement.textContent = `Combat Lvl: 1`;
    const combatXpElement = document.createElement('div');
    combatXpElement.textContent = `Combat XP: ${player.combatXP}`;
	const healingLvlElement = document.createElement('div');
    healingLvlElement.textContent = `Healing Lvl: 1`;
    const healingXpElement = document.createElement('div');
    healingXpElement.textContent = `Healing XP: ${player.healingXP}`;

    // Append the elements to the statsDiv
    statsDiv.appendChild(nameElement);
    statsDiv.appendChild(hpElement);
	statsDiv.appendChild(combatLvlElement);
    statsDiv.appendChild(combatXpElement);
	statsDiv.appendChild(healingLvlElement);
    statsDiv.appendChild(healingXpElement);

    // Append statsDiv to the playerStatsList
    playerStatsList.appendChild(statsDiv);
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


battleversionElement.innerText = `COS Battle Version: ${currentCOSbattleversion}`;
// Initialize file input and button functionality
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('startBattleButton').addEventListener('click', startBattle);