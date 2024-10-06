// Listen for the join command
ComfyJS.onCommand = (user, command, message, params, commandType) => {
    if (command === "hunt") {
        teaminvite(user);
		setgameMessage(`${user} tried to join!`);
    }
};

let currentCOSbattleversion = 'VU:Pre-alpha 0.02078test';
const battleversionElement = document.getElementById('cos-battle-version');
let players = [];
let bossHP = 350; // Boss HP
// Declare a global variable to track the round
let currentRound = 1;
let twitchusersJoined = [];
const currentRoundElement = document.getElementById('currentRound');
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
function teaminvite(user) {
    // Check if player already exists
    if (players.some(player => player.name === username)) {
        appendSystemMessage(`${user} is already in the game!`);
        return; // Stop if the player is already in the game
    }
  
    // Create a new player
    const playerContainer = document.createElement('div');
    playerContainer.classList.add('player-container');

    const player = document.createElement('div');
    player.classList.add('player');
    player.style.backgroundImage = `url('data/images/femaledefault.png')`; // Replace with your player image

    // Create a wrapper div for the player's info (name, HP, cb lvl)
    const playerInfoWrapper = document.createElement('div');
    playerInfoWrapper.classList.add('player-info-wrapper');

    // Create a span to hold the player's name
    const playerName = document.createElement('span');
    playerName.innerText = user; // Use the username from Twitch
    playerName.classList.add('player-name');

    // Create a span to hold the player's HP
    const playerHP = document.createElement('span');
    playerHP.innerText = 'HP: 100'; // Default HP for each player
    playerHP.classList.add('player-hp');

    // Create a span to hold the player's combat level
    const playerCB = document.createElement('span');
    playerCB.innerText = 'Cb lvl: 1'; // Default combat level for each player
    playerCB.classList.add('player-cb');

    // Append name, HP, and CB level to the info wrapper
    playerInfoWrapper.appendChild(playerName);
    playerInfoWrapper.appendChild(playerHP);
    playerInfoWrapper.appendChild(playerCB);

    // Append player and info wrapper to the player container
    playerContainer.appendChild(player);
    playerContainer.appendChild(playerInfoWrapper);

    // Append player container to the playersDiv
    document.getElementById('players').appendChild(playerContainer);

    // Add player to the players array
    players.push({
        name: user,
        playerContainer,
        playerHP,
        hp: 100,
        combatLvl: 0,
        combatXP: 0,
        healingLvl: 0,
        healingXP: 0,
    });

    appendSystemMessage(`${user} has joined the game!`);

    // Enable the Start Battle button if it's the first player
    if (players.length === 1) {
        document.getElementById('startBattleButton').disabled = false;
    }
}
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
	
    // Create a wrapper div for the player's info (name, HP, cb lvl)
    const playerInfoWrapper = document.createElement('div');
    playerInfoWrapper.classList.add('player-info-wrapper');

    // Create a span to hold the player's name
    const playerName = document.createElement('span');
    playerName.innerText = name;
    playerName.classList.add('player-name');
    
    // Create a span to hold the player's HP
    const playerHP = document.createElement('span');
    playerHP.innerText = 'HP: 100'; // Default HP for each player
    playerHP.classList.add('player-hp');
    
    // Create a span to hold the player's combat level
    const playerCB = document.createElement('span');
    playerCB.innerText = 'Cb lvl: 1'; // Default combat level for each player
    playerCB.classList.add('player-cb');

    // Append name, HP, and CB level to the info wrapper
    playerInfoWrapper.appendChild(playerName);
    playerInfoWrapper.appendChild(playerHP);
    playerInfoWrapper.appendChild(playerCB);

    // Append player and info wrapper to the player container
    playerContainer.appendChild(player);
    playerContainer.appendChild(playerInfoWrapper);
    
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
	  // Visual feedback (e.g., change player border color to red briefly)
      player.playerContainer.style.borderColor = '#4CAF50'; // GREEN
      setTimeout(() => {
        player.playerContainer.style.borderColor = '#2c2c2c00'; // Back to TRANSPARENT
      }, 1000);
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
      }, 3000); // Boss takes turn after player's attack
    } else {
      
	  handleBattleEnd();
    }
  }
  attackNextPlayer();
}


// Player attacks boss with damage
function playerAttackBoss(player, damage) {
  bossHP -= damage;
  player.totalDamageDealt = (player.totalDamageDealt || 0) + damage; // Track total damage dealt

  // Update boss HP display
  bossHPElement.textContent = Math.max(bossHP, 0);

  // Append system message when a player attacks the boss
  setgameMessage(`${player.name} attacks the boss for ${damage} damage!`);
  appendSystemMessage(`${player.name} attacks the boss for ${damage} damage!`);

  // Play attack sound at a lower volume
  const attackSound = document.getElementById('attackSound');
  attackSound.volume = 0.5; // Set volume to 50%
  attackSound.currentTime = 0; // Rewind to the start
  attackSound.play();
  
  // Visual feedback (e.g., change boss color briefly)
  document.getElementById('boss').style.borderColor = '#f00'; // Red flash
  setTimeout(() => {
    document.getElementById('boss').style.borderColor = '#2c2c2c00'; // Back to green
  }, 500);
}

// Check if a player is defeated and move them to defeatedPlayers div
function checkIfPlayerDefeated(player) {
  if (player.hp <= 0) {
    player.playerContainer.style.opacity = '0.3'; // Fade out defeated player
    setgameMessage(`${player.name} has been defeated!`);
    appendSystemMessage(`${player.name} has been defeated!`);

    // Play the death sound
	playRandomDeathSound();


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
      player.playerContainer.style.borderColor = '#2c2c2c00'; // Back to green
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
        player.playerContainer.style.borderColor = '#2c2c2c00'; // Back to green
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
	// Visual feedback (e.g., change boss color briefly)
    document.getElementById('boss').style.borderColor = '#4CAF50'; // Red flash
	setTimeout(() => {
	  document.getElementById('boss').style.borderColor = '#2c2c2c00'; // Back to green
	}, 1000);
    // Change the boss background image to the healing GIF
    const bossDiv = document.getElementById('boss');
    bossDiv.style.backgroundImage = 'url(data/images/mobs/gallard/gallardheal.gif)';

    // Play the heal sound
    const healSound = document.getElementById('gallardheal-Sound');
	healSound.volume = 0.6; // Set volume to 50%
    healSound.currentTime = 0; // Rewind to the start
    healSound.play();

    // Revert back to the default image after 1.5 seconds
    setTimeout(() => {
      bossDiv.style.backgroundImage = 'url(data/images/mobs/gallard/gallarddefault.png)';
    }, 3500);
  }

  updateRoundMessage();
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

function playRandomDeathSound() {
    // Get all death sound elements in an array
    const deathSounds = [
        document.getElementById('playerdeath-Sound1'),
        document.getElementById('playerdeath-Sound2'),
        document.getElementById('playerdeath-Sound3'),
        document.getElementById('playerdeath-Sound4')
    ];

    // Select a random sound from the array
    const randomIndex = Math.floor(Math.random() * deathSounds.length);
    const selectedSound = deathSounds[randomIndex];

    // Set the volume and play the sound
    selectedSound.volume = 0.6; // Adjust the volume as desired
    selectedSound.currentTime = 0; // Rewind to the start
    selectedSound.play();
}

//example usage
// playRandomDeathSound();


function getRandomLootAmount(maxLoot) {
  // Define the minimum loot amount
  const minLoot = 0.01;

  // Generate a random loot amount between minLoot and maxLoot
  return Math.random() * (maxLoot - minLoot) + minLoot;
}

function distributeLoot() {
  const prizePoolElement = document.getElementById('prizePool');
  const prizePoolText = prizePoolElement.innerText;
  const match = prizePoolText.match(/Current Prize Pool: (\d+(\.\d+)?)/);

  if (!match) {
    console.error('Prize pool value not found.');
    return;
  }

  let totalPrizePool = parseFloat(match[1]);
  const survivingPlayers = players.filter(player => player.hp > 0);

  if (survivingPlayers.length === 0) {
    console.log('No surviving players to distribute loot to.');
    return;
  }

  // Calculate the maximum loot to distribute (85% of the total prize pool)
  const maxLootAmount = totalPrizePool * 0.85;

  // Calculate total loot distributed
  let totalLootDistributed = 0;

  // Clear previous loot messages
  const lootDiv = document.getElementById('loot');
  lootDiv.innerHTML = '';

  survivingPlayers.forEach(player => {
    const playerDamage = player.totalDamageDealt || 0;
    const totalDamage = players.reduce((sum, player) => sum + (player.totalDamageDealt || 0), 0);
    const damagePercentage = playerDamage / totalDamage;

    // Generate random loot share based on the damage percentage
    const lootShare = getRandomLootAmount(maxLootAmount * damagePercentage);
    
    totalLootDistributed += lootShare;

    // Prevent distributing more than the maximum loot amount
    if (totalLootDistributed > maxLootAmount) {
      const excessAmount = totalLootDistributed - maxLootAmount;
      lootShare -= excessAmount;
      totalLootDistributed = maxLootAmount;
    }

    // Display loot for each player
    const lootMessage = `${player.name} receives ${lootShare.toFixed(2)} from the loot pool.`;
    appendSystemMessage(lootMessage); // Append to system messages
    lootDiv.innerHTML += `<p>${lootMessage}</p>`;
  });

  // Calculate remaining prize pool
  const remainingLootMessage = `Remaining Prize Pool: ${(totalPrizePool - totalLootDistributed).toFixed(2)}`;
  appendSystemMessage(remainingLootMessage); // Append to system messages
  lootDiv.innerHTML += `<p>Total Value Looted: ${totalLootDistributed.toFixed(2)}</p>`;
  lootDiv.innerHTML += `<p>${remainingLootMessage}</p>`;
}


// Function to update & increment the round
function updateRoundMessage() {
  // Set the game message to the current round number
  currentRoundElement.textContent = 'Round ' + currentRound;
  // Increment the round for the next time
  currentRound++;
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
    distributeLoot(); // Distribute loot when the boss is defeated
  } else if (players.every(player => player.hp <= 0)) {
    setgameMessage('All players have been defeated. The boss wins.');
    appendSystemMessage('All players have been defeated. The boss wins.');
    calculateSurvivalBonus();
  }
  // Display stats and XP for all players
  updatePlayerStats();
}

// Set the header message for the game
function setgameMessage(message) {
  headerMessagesElement.textContent = message;
}
document.addEventListener('DOMContentLoaded', () => {
  fetchPrizePool();
});

function fetchPrizePool() {
  fetch('data/susfunds-twitch.txt')
    .then(response => response.text())
    .then(text => {
      const prizePool = extractPrizePool(text);
      displayPrizePool(prizePool);
    })
    .catch(error => {
      console.error('Error fetching the prize pool file:', error);
      document.getElementById('prizePool').innerText = 'Error loading prize pool.';
    });
}

function extractPrizePool(text) {
  // Use a regular expression to find the prize pool value
  const match = text.match(/Current Total Ped pool:\s*(\d+(\.\d+)?)/);
  if (match) {
    return match[1]; // Return the captured value
  }
  return 'Not found'; // If the pattern does not match
}

function displayPrizePool(value) {
  document.getElementById('prizePool').innerText = `Current Prize Pool: ${value}`;
}



function simulateBossKill() {
  // Set bossHP to 0 to simulate boss defeat
  bossHP = 0;
  
  // Trigger battle end handling
  handleBattleEnd();
}
// Display battle version at the top of the page
battleversionElement.textContent = currentCOSbattleversion;
// Initialize file input and button functionality
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('startBattleButton').addEventListener('click', startBattle);