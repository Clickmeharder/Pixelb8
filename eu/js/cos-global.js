let currentCOSrouletteversion = 'VU:Pre-alpha 0.0207';
// Display battle version at the top of the page
const rouletteversionElement = document.getElementById('cos-roulette-version');
rouletteversionElement.textContent = currentCOSrouletteversion;

let players = [];

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
    // Create a span to hold the player's cb lvl
    const playerCB = document.createElement('span');
    playerCB.innerText = 'Cb lvl: 1'; // Default HP for each player
    playerCB.classList.add('player-cb');

    // Append player, name, and HP to the container
    playerContainer.appendChild(player);
    playerContainer.appendChild(playerName);
    playerContainer.appendChild(playerHP);
	playerContainer.appendChild(playerCB);
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
  document.getElementById('startGameButton').disabled = false;
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


// Initialize file input and button functionality
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
