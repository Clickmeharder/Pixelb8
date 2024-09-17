let players = [];
let lastEventTime = Date.now();
let currentdeathmatchversion = 'beta 0.001';
const deathmatchversionElement = document.getElementById('deathmatch-version');
// Declare a global variable to track the round
let currentRound = 1;
const currentRoundElement = document.getElementById('currentRound');
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

function generatePlayers(playerNames) {
  const playersDiv = document.getElementById('players');
  playersDiv.innerHTML = ''; 

  players = playerNames.map(name => {
    const playerContainer = document.createElement('div');
    playerContainer.classList.add('player-container');
    
    const player = document.createElement('div');
    player.classList.add('player');
    player.style.backgroundImage = `url('data/images/femaledefault.png')`;

    const playerName = document.createElement('span');
    playerName.innerText = name.trim();
    const playerHP = document.createElement('span');
    playerHP.innerText = 'HP: 100';

    playerContainer.appendChild(player);
    playerContainer.appendChild(playerName);
    playerContainer.appendChild(playerHP);
    playersDiv.appendChild(playerContainer);

    return { name, playerHP, hp: 100, weapon: null };
  });

  document.getElementById('startDeathmatchButton').disabled = false;
}

// Start deathmatch sequence
function startDeathmatch() {
  rushForWeapons();
}

function rushForWeapons() {
  players.forEach(player => {
    // Players rush for weapons with a 50% chance of finding one
    if (Math.random() > 0.5) {
      player.weapon = 'Basic Sword';
      systemMessage(`${player.name} found a Basic Sword!`);
    } else {
      systemMessage(`${player.name} didn't find a weapon.`);
    }
  });
  
  nextPhase(); // Move to the second phase
}

function nextPhase() {
  players.forEach(player => {
    const action = Math.floor(Math.random() * 3);

    if (action === 0) {
      systemMessage(`${player.name} is fleeing from other players.`);
    } else if (action === 1) {
      systemMessage(`${player.name} is targeting the nearest player.`);
      attackRandomPlayer(player);
    } else {
      systemMessage(`${player.name} is hiding and waiting for an opportunity.`);
    }
  });

  triggerRandomEvents();
}

function attackRandomPlayer(attacker) {
  const target = players[Math.floor(Math.random() * players.length)];
  if (target && target !== attacker && target.hp > 0) {
    const damage = Math.floor(Math.random() * 20) + 1;
    target.hp -= damage;
    target.playerHP.innerText = `HP: ${Math.max(target.hp, 0)}`;
    systemMessage(`${attacker.name} attacks ${target.name} for ${damage} damage!`);

    if (target.hp <= 0) {
      systemMessage(`${target.name} has been killed by ${attacker.name}!`);
      checkIfPlayerDefeated(target);
    }
  }
}

function checkIfPlayerDefeated(player) {
  player.playerHP.innerText = 'DEAD';
  player.hp = 0;

  if (players.filter(p => p.hp > 0).length === 1) {
    declareWinner();
  }
}

function declareWinner() {
  const winner = players.find(p => p.hp > 0);
  systemMessage(`${winner.name} is the last player standing!`);
}

// Trigger random events similar to boss battle
function triggerRandomEvents() {
  const now = Date.now();
  if (now - lastEventTime > 300000) { // Trigger every 5 minutes
    const randomEvents = [
      { name: 'found a rare weapon', type: 'weapon' },
      { name: 'triggered a trap and lost HP', type: 'trap' }
    ];

    players.forEach(player => {
      const event = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      if (event.type === 'weapon') {
        systemMessage(`${player.name} ${event.name}!`);
        player.weapon = 'Rare Weapon';
      } else if (event.type === 'trap') {
        const damage = Math.floor(Math.random() * 20) + 1;
        player.hp -= damage;
        player.playerHP.innerText = `HP: ${Math.max(player.hp, 0)}`;
        systemMessage(`${player.name} ${event.name} and took ${damage} damage!`);

        if (player.hp <= 0) {
          checkIfPlayerDefeated(player);
        }
      }
    });
    lastEventTime = now;
  }
}

// Display system messages
function systemMessage(message) {
  const messageElement = document.createElement('p');
  messageElement.innerText = message;
  document.getElementById('systemMessages').appendChild(messageElement);
}
// Display battle version at the top of the page
deathmatchversionElement.textContent = currentdeathmatchversion;
document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('startDeathmatchButton').addEventListener('click', startDeathmatch);
