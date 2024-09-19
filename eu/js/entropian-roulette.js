let currentCOSrouletteversion = 'VU:Pre-alpha 0.0001';
const rouletteversionElement = document.getElementById('cos-roulette-version');
rouletteversionElement.textContent = currentCOSrouletteversion;

let players = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10'];
let playerAvatars = [];
const systemMessagesElement = document.getElementById('systemMessages');
const headerMessagesElement = document.getElementById('headerTexts');
const offsetAngle = 90; // Offset to adjust initial straight-up position of gun
let currentRound = 1;

const currentRoundElement = document.getElementById('currentRound');
function handleFileUpload(event) {
  console.log('File upload triggered');
  const file = event.target.files[0];
  if (file) {
    console.log('File selected:', file.name);
    const reader = new FileReader();
    reader.onload = function(e) {
      console.log('File loaded:', e.target.result);
      const text = e.target.result;
      const playerNames = text.trim().split('\n');
      generatePlayers(playerNames);
    };
    reader.readAsText(file);
  }
}

function setupRoulette(playerCount) {
  const rouletteCircle = document.getElementById('roulette-circle');
  const radius = rouletteCircle.offsetWidth / 2 - 10;  // Adjust radius
  const gunImage = document.getElementById('gun-image');

  // Center the gun
  gunImage.style.left = '50%';
  gunImage.style.top = '50%';
  gunImage.style.transform = 'translate(-50%, -50%)';

  playerAvatars.forEach((playerDiv, index) => {
    if (index < playerCount) {
      playerDiv.style.display = 'block';
      const angle = (index / playerCount) * 2 * Math.PI;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      playerDiv.style.left = `calc(50% + ${x}px - 40px)`;
      playerDiv.style.top = `calc(50% + ${y}px - 40px)`;
    } else {
      playerDiv.style.display = 'none';
    }
  });
}

function generatePlayers(playerNames) {
  const rouletteCircle = document.getElementById('roulette-circle');
  playerAvatars = [];
  players = playerNames.map((name, index) => {
    name = name.trim();
    const playerAvatar = document.createElement('div');
    playerAvatar.classList.add('player-avatar');
    playerAvatar.style.backgroundImage = `url('data/images/femaledefault.png')`;

    const playerTextContainer = document.createElement('div');
    playerTextContainer.classList.add('player-text-container');
    const playerName = document.createElement('span');
    playerName.innerText = name;
    playerName.classList.add('player-name');
    const playerHP = document.createElement('span');
    playerHP.innerText = 'HP: 100';
    playerHP.classList.add('player-hp');
    const playerCB = document.createElement('span');
    playerCB.innerText = 'CB lvl: 1';
    playerCB.classList.add('player-cb');
    playerTextContainer.appendChild(playerName);
    playerTextContainer.appendChild(playerHP);
    playerTextContainer.appendChild(playerCB);
    playerAvatar.appendChild(playerTextContainer);
    rouletteCircle.appendChild(playerAvatar);
    playerAvatars.push(playerAvatar);
    return name;
  });
  setupRoulette(playerNames.length);
}

function startRoulette() {
  if (players.length === 1) {
    announceWinner(players[0]);
    return;
  }

  const randomPlayerIndex = Math.floor(Math.random() * players.length);
  const angleToPlayer = (randomPlayerIndex / players.length) * 360;
  const damage = Math.floor(Math.random() * 11);

  const gunImage = document.getElementById('gun-image');
  const gunArrow = document.getElementById('gun-arrow');
  const gunLine = document.getElementById('gun-line');

  // Define min and max rotation duration (in milliseconds)
  const minDuration = 10;  // Fastest spin
  const maxDuration = 1000;  // Slowest spin
  const playerThreshold = 5; // When it slows down more

  // Interpolate the rotation duration based on remaining players
  let rotationDuration = minDuration + (maxDuration - minDuration) * (1 - players.length / 15);


  // Adjust duration further when there are few players remaining
  if (players.length <= playerThreshold) {
    const anticipationFactor = (playerThreshold - players.length + 1) / playerThreshold;
    rotationDuration += anticipationFactor * 1000;  // Add up to 1000ms anticipation for low players
  }

  playerAvatars.forEach(player => player.style.backgroundColor = '#10908fa8');
  const correctedAngle = angleToPlayer - offsetAngle - 180;
  gunImage.style.transition = `transform ${rotationDuration}ms ease-out`;
  gunImage.style.transform = `translate(-50%, -50%) rotate(${correctedAngle}deg)`;
  gunArrow.style.transition = `transform ${rotationDuration}ms ease-out`;
  gunArrow.style.transform = `translateX(-50%) rotate(${correctedAngle}deg)`;

  const selectedPlayer = playerAvatars[randomPlayerIndex];
  selectedPlayer.style.backgroundColor = 'red';

  setTimeout(() => {
    drawLineToPlayer(selectedPlayer, gunLine);

    setTimeout(() => {
      const playerHPElement = selectedPlayer.querySelector('.player-hp');
      let currentHP = parseInt(playerHPElement.innerText.replace('HP: ', ''));
      currentHP = Math.max(0, currentHP - damage);
      playerHPElement.innerText = `HP: ${currentHP}`;
      console.log(`${players[randomPlayerIndex]} is shot for ${damage} damage! Remaining HP: ${currentHP}`);
	  setgameMessage(`${players[randomPlayerIndex]} is shot for ${damage} damage! Remaining HP: ${currentHP}`);
	  appendSystemMessage(`${players[randomPlayerIndex]} is shot for ${damage} damage! Remaining HP: ${currentHP}`);

      if (currentHP <= 0) {
        console.log(`${players[randomPlayerIndex]} is dead!`);
		setgameMessage(`${players[randomPlayerIndex]} is dead!`);
		appendSystemMessage(`${players[randomPlayerIndex]} is dead!`);
        players.splice(randomPlayerIndex, 1);  // Remove player from the array
        selectedPlayer.remove();  // Remove player avatar from the DOM
        playerAvatars.splice(randomPlayerIndex, 1);  // Remove avatar from avatars array

        // Recalculate positions for remaining players
        setupRoulette(players.length);
		updateRoundMessage();
      }

      setTimeout(() => {
        gunLine.style.display = 'none';
        attackSound.play();
		
        // Repeat the roulette until only one player remains
        setTimeout(startRoulette, 1000);
      });

    }, 300);
  }, rotationDuration);
}

function announceWinner(winner) {
  alert(`${winner} is the winner!`);
  console.log(`${winner} is the winner!`);
  setgameMessage(`${winner} is the winner!`);
  appendSystemMessage(`${winner} is the winner!`);
  distributeLoot();
}

function drawLineToPlayer(player, gunLine) {
  const gunArrow = document.getElementById('gun-arrow');
  const gunArrowRect = gunArrow.getBoundingClientRect();
  const playerRect = player.getBoundingClientRect();
  const gunCenterX = gunArrowRect.left + gunArrowRect.width / 2;
  const gunCenterY = gunArrowRect.top + gunArrowRect.height / 2;
  const playerCenterX = playerRect.left + playerRect.width / 2;
  const playerCenterY = playerRect.top + playerRect.height / 2;
  const dx = playerCenterX - gunCenterX;
  const dy = playerCenterY - gunCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI) - 90;

  gunLine.style.height = `${distance}px`;
  gunLine.style.transform = `rotate(${angle}deg)`;
  gunLine.style.transformOrigin = '0 0';
  gunLine.style.left = `50%`;
  gunLine.style.top = `50%`;
  gunLine.style.display = 'block';
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

  // Only distribute loot if there's exactly one remaining player (the winner)
  if (players.length === 1) {
    const lastSurvivingPlayer = players[0];

    // Distribute the entire prize pool to the last player
    const lootMessage = `${lastSurvivingPlayer} receives ${totalPrizePool.toFixed(2)} from the loot pool.`;
    appendSystemMessage(lootMessage); // Append to system messages

    const lootDiv = document.getElementById('loot');
    lootDiv.innerHTML = `<p>${lootMessage}</p>`;
    lootDiv.innerHTML += `<p>Total Value Looted: ${totalPrizePool.toFixed(2)}</p>`;
    lootDiv.innerHTML += `<p>Remaining Prize Pool: 0.00</p>`;

    // Reset the prize pool
    prizePoolElement.innerText = 'Current Prize Pool: 0.00';
  } else {
    console.log('No winner yet or no players remaining.');
  }
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








// JavaScript for custom resizer
const resizable = document.querySelector('.resizable');
const resizer = document.querySelector('.resizer');

resizer.addEventListener('mousedown', function(e) {
  e.preventDefault();
  
  // Track initial mouse position and container height
  const initialY = e.clientY;
  const initialHeight = resizable.offsetHeight;
  
  function onMouseMove(e) {
    // Calculate the new height
    const newHeight = initialHeight + (e.clientY - initialY);
    resizable.style.height = `${newHeight}px`;  // Set the new height
  }

  function onMouseUp() {
    // Remove the event listeners when the mouse is released
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  // Attach the event listeners to handle resizing
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
});

// Support touch events for mobile devices
resizer.addEventListener('touchstart', function(e) {
  e.preventDefault();
  
  // Track initial touch position and container height
  const initialY = e.touches[0].clientY;
  const initialHeight = resizable.offsetHeight;
  
  function onTouchMove(e) {
    // Calculate the new height
    const newHeight = initialHeight + (e.touches[0].clientY - initialY);
    resizable.style.height = `${newHeight}px`;  // Set the new height
  }

  function onTouchEnd() {
    // Remove the event listeners when the touch is released
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
  }

  // Attach the event listeners to handle resizing
  window.addEventListener('touchmove', onTouchMove);
  window.addEventListener('touchend', onTouchEnd);
});

document.addEventListener('DOMContentLoaded', () => {
  setupRoulette();
  document.getElementById('fileInput').addEventListener('change', handleFileUpload);
  document.getElementById('startRouletteButton').addEventListener('click', startRoulette);
  document.getElementById('customFileButton').addEventListener('click', function() {
    document.getElementById('fileInput').click();
  });

  document.getElementById('fileInput').addEventListener('change', function() {
    const fileName = this.files[0] ? this.files[0].name : 'No file chosen';
    document.getElementById('fileName').textContent = fileName;
  });
});
