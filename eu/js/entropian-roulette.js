// Example: Trigger weapon change based on a Twitch command (!nuke)
ComfyJS.onCommand = (user, command, message, flags, extra) => {
    if (command === 'nuke') { 
        nuke(); // Call the nuke function
    }
};

let currentCOSrouletteversion = 'CoS Roulette VU:Pre-alpha 0.0698';
const rouletteversionElement = document.getElementById('cos-roulette-version');
rouletteversionElement.textContent = currentCOSrouletteversion;

// Example global volume variable (default set to 0.5 for now)
let globalVolume = 0.5;  // You can later hook this to a volume slider or button

let players = [];
let playerAvatars = [];
let totalPlayers = '0';
let remainingPlayers = '0';

const systemMessagesElement = document.getElementById('systemMessages');
const headerMessagesElement = document.getElementById('headerTexts');
const offsetAngle = 90; // Offset to adjust initial straight-up position of gun

//current round
let currentRound = 1;
let firstDeathOccurred = false; // Track if the first death has occurred
const currentRoundElement = document.getElementById('currentRound');

function toggleHeader() {
    const headerRow = document.getElementById('header-row');
    const toggleButton = document.getElementById('toggleHeaderButton');
    
    if (headerRow.style.display === 'none') {
        headerRow.style.display = 'flex'; // Show the header
        toggleButton.innerText = '-'; // Change button text
    } else {
        headerRow.style.display = 'none'; // Hide the header
        toggleButton.innerText = '+'; // Change button text
    }
}

let nukeCalled = false; // Flag to track if the nuke command has been called
// Function to create and show the explosion effect
function showExplosionEffect() {
    // Create an image element for the explosion
    const explosionImg = document.createElement('img');
    explosionImg.src = 'data/images/guns/explosion.gif';
    explosionImg.style.position = 'absolute';
    explosionImg.style.left = '50%';
    explosionImg.style.top = '50%';
    explosionImg.style.transform = 'translate(-50%, -50%)'; // Center the image
    explosionImg.style.zIndex = '100'; // Ensure it's on top
    explosionImg.style.pointerEvents = 'none'; // Prevent interaction with the image

    // Get the roulette circle element
    const rouletteCircle = document.getElementById('roulette-circle');
    rouletteCircle.appendChild(explosionImg); // Append explosion image to the roulette circle

    // Play the explosion sound
    const explosionSound = new Audio('data/cos-sounds/explosion.mp3');
    explosionSound.play();

    // Remove the explosion image after a certain duration (optional)
    setTimeout(() => {
        rouletteCircle.removeChild(explosionImg);
    }, 3000); // Adjust the duration as needed
}
// Function to randomly select 3 to 5 players and apply damage
function nuke() {
    // Check if the nuke command has already been called
    if (nukeCalled) {
        setgameMessage("The nuke command has already been used and cannot be called again!");
        return; // Exit the function if nuke was already called
    }

    // Set the flag to true to prevent further calls
    nukeCalled = true;

    // Determine a random number of players to damage (between 3 and 5)
    const numberOfPlayersToDamage = Math.floor(Math.random() * 3) + 3; // Randomly selects 3, 4, or 5

    // Shuffle the players array and take the specified number of unique players
    const shuffledPlayers = players.sort(() => 0.5 - Math.random()).slice(0, numberOfPlayersToDamage);

    // Loop through the selected players and apply random damage
    shuffledPlayers.forEach(playerName => {
        const playerIndex = players.indexOf(playerName);
        const playerAvatar = playerAvatars[playerIndex];
		
        // Calculate individual damage for this player (between 0 and 50)
        const damage = Math.floor(Math.random() * 51); // Damage between 0 and 50
        const playerHP = applyDamage(playerAvatar, playerIndex, damage); // Apply damage to the player
		showExplosionEffect();
        // Log messages for the damage dealt
        setgameMessage(`${playerName} has been nuked for ${damage} damage! Remaining HP: ${playerHP}`);
        appendSystemMessage(`${playerName} has been nuked for ${damage} damage! Remaining HP: ${playerHP}`);
    });
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


function updateTopPlayers() {
  const topPlayersElement = document.getElementById('mostHpList');
  topPlayersElement.innerHTML = ''; // Clear previous list

  // Sort players by HP and get the top 5
  const sortedPlayers = players
    .map((name, index) => ({
      name,
      hp: parseInt(playerAvatars[index].querySelector('.player-hp').innerText.replace('HP: ', ''))
    }))
    .sort((a, b) => b.hp - a.hp)
    .slice(0, 25); // Get top 5

  // Display the top players
  sortedPlayers.forEach((player, index) => {
    const playerElement = document.createElement('div');

    // Determine the color based on HP
    let color;
    if (player.hp > 75) {
      color = 'green';
    } else if (player.hp >= 35) {
      color = 'orange';
    } else {
      color = 'red';
    }

    playerElement.style.color = color; // Set the text color
    playerElement.innerText = `${index + 1}. ${player.name} - HP: ${player.hp}`; // Add numbering
    topPlayersElement.appendChild(playerElement);
  });
}


function updateTotalPlayerCount(count) {
  totalPlayers = count;
  remainingPlayers = count; // Set remaining players to the total at the start
  document.getElementById('totalPlayerCount').innerText = `Total Players: ${totalPlayers}`;
  document.getElementById('swTitle').innerText = `Good Luck!`;
}


function updateRemainingPlayers() {
  if (remainingPlayers > 0) {
    remainingPlayers--; // Decrease remaining players by 1
    document.getElementById('totalRemainingCount').innerText = `${remainingPlayers}`;
	document.getElementById('swTitle').innerText = `Remaining`;
  }
}


let twitchusersJoined = [];
//commands
// Cheat command: Switch places with nearest player randomly
function cheatCommand(user) {
    const userIndex = twitchusersJoined.indexOf(user);
    let swapIndex;

    // Randomly decide to switch with player to the left or right
    if (Math.random() < 0.5) {
        // Swap with player to the left (if exists)
        swapIndex = userIndex - 1 >= 0 ? userIndex - 1 : twitchusersJoined.length - 1;
    } else {
        // Swap with player to the right (if exists)
        swapIndex = userIndex + 1 < twitchusersJoined.length ? userIndex + 1 : 0;
    }

    // Swap positions
    [twitchusersJoined[userIndex], twitchusersJoined[swapIndex]] = [twitchusersJoined[swapIndex], twitchusersJoined[userIndex]];

    console.log(`${user} swapped places with ${twitchusersJoined[swapIndex]}`);

    // Regenerate the players to update their positions in the game
    generatePlayers(twitchusersJoined);

    // Notify the chat about the cheat
    const messageDiv = document.createElement("div");
    messageDiv.textContent = `${user} used !cheat and swapped places with ${twitchusersJoined[swapIndex]}!`;
    document.getElementById("twitch-chat").appendChild(messageDiv);
}

// Leave game command: Remove user and regenerate players
function leaveGame(user) {
    const userIndex = twitchusersJoined.indexOf(user);
    
    if (userIndex !== -1) {
        // Remove user from the list
        twitchusersJoined.splice(userIndex, 1);
        delete cheatUsageTracker[user]; // Remove cheat usage tracking for the user
        console.log(`${user} has left the game`);

        // Regenerate the remaining players
        generatePlayers(twitchusersJoined);

        // Notify the chat
        const messageDiv = document.createElement("div");
        messageDiv.textContent = `${user} has left the game!`;
        document.getElementById("twitch-chat").appendChild(messageDiv);
    }
}
//-------------------------------------------------
//-------------------------------------------------

// Function to dynamically add a single player to the roulette circle
function addPlayerToGame(playerName) {
  const rouletteCircle = document.getElementById('roulette-circle');

  // Create the player avatar and its components
  const playerAvatar = document.createElement('div');
  playerAvatar.classList.add('player-avatar');
  playerAvatar.style.backgroundImage = `url('data/images/femaledefault.png')`;

  const playerTextContainer = document.createElement('div');
  playerTextContainer.classList.add('player-text-container');

  const playerNameElement = document.createElement('span');
  playerNameElement.innerText = playerName;
  playerNameElement.classList.add('player-name');

  const playerHP = document.createElement('span');
  playerHP.innerText = 'HP: 100';
  playerHP.classList.add('player-hp');

  const playerCB = document.createElement('span');
  playerCB.innerText = 'CB lvl: 1';
  playerCB.classList.add('player-cb');

  // Append the player info to the avatar
  playerTextContainer.appendChild(playerNameElement);
  playerTextContainer.appendChild(playerHP);
  playerTextContainer.appendChild(playerCB);
  playerAvatar.appendChild(playerTextContainer);

  // Add the player avatar to the roulette circle
  rouletteCircle.appendChild(playerAvatar);

  // Update total player count
  updateTotalPlayerCount(twitchusersJoined.length);

  // Recalculate positions for all players to spread them evenly
  setupRoulette(twitchusersJoined.length);
}
// Function to generate players dynamically
function generatePlayers(playerNames) {
  const rouletteCircle = document.getElementById('roulette-circle');
  playerAvatars = [];

  // Remove only the player avatars, keeping the gun intact
  const existingPlayerAvatars = rouletteCircle.querySelectorAll('.player-avatar');
  existingPlayerAvatars.forEach(avatar => rouletteCircle.removeChild(avatar));

  players = playerNames.map((name, index) => {
    name = name.trim();
    const playerAvatar = document.createElement('div');
    playerAvatar.classList.add('player-avatar');
    playerAvatar.style.backgroundImage = 'url("data/images/femaledefault.png")';

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

  // Update total players count
  totalPlayers = playerNames.length;
  updateTotalPlayerCount(totalPlayers);
}


// Function to rotate the gun and select a player
function rotateAndSelectPlayer(players) {
    const randomPlayerIndex = Math.floor(Math.random() * players.length);
    const angleToPlayer = (randomPlayerIndex / players.length) * 360;
    const correctedAngle = angleToPlayer - offsetAngle - 180;

    // Define min and max rotation duration (in milliseconds)
    const minDuration = 10;
    const maxDuration = 500;
    const playerThreshold = 5;

    // Interpolate the rotation duration based on remaining players
    let rotationDuration = minDuration + (maxDuration - minDuration) * (1 - players.length / 15);

    // Adjust duration further when there are few players remaining
    if (players.length <= playerThreshold) {
        const anticipationFactor = (playerThreshold - players.length + 1) / playerThreshold;
        rotationDuration += anticipationFactor * 1000;
    }

    // Rotate gun and arrow
    const gunImage = document.getElementById('gun-image');
    const gunArrow = document.getElementById('gun-arrow');
    gunImage.style.transition = `transform ${rotationDuration}ms ease-out`;
    gunImage.style.transform = `translate(-50%, -50%) rotate(${correctedAngle}deg)`;
    gunArrow.style.transition = `transform ${rotationDuration}ms ease-out`;
    gunArrow.style.transform = `translateX(-50%) rotate(${correctedAngle}deg)`;

    return { randomPlayerIndex, rotationDuration };
}




function pullGunTrigger(player, duration = 300, hideDelay = 300) {
  const gunLine = document.getElementById('gun-line');
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

  // Set the gun line properties
  gunLine.style.height = `${distance}px`;
  gunLine.style.transform = `rotate(${angle}deg)`;
  gunLine.style.transformOrigin = '0 0';
  gunLine.style.left = `50%`;
  gunLine.style.top = `50%`;
  gunLine.style.display = 'block';

  // Array of all six attack sounds
  const attackSounds = [
    // document.getElementById('attackSound'),
    document.getElementById('attackSound2')/*,
    document.getElementById('attackSound4'),
    document.getElementById('attackSound5'),
    document.getElementById('attackSound6') */
  ];

  // Randomize the pitch for the attack sound (smaller range for more subtle variation)
  const randomPitch = Math.random() * 0.76 + 1.2;  // Randomize between 0.9 and 1.1

  // Select a random sound from the array
  const randomSound = attackSounds[Math.floor(Math.random() * attackSounds.length)];
  randomSound.playbackRate = randomPitch;  // Apply the randomized pitch

  // Adjust volume based on globalVolume, reduced to a lower base level for this sound
  randomSound.volume = globalVolume * 0.1;  // Lower the volume of the attack sound


  // Set the timeout to hide the line and play the attack sound after the delay
  setTimeout(() => {
    randomSound.play();  // Play the randomly chosen attack sound
    gunLine.style.display = 'none';  // Hide the gun line after the attack
  }, hideDelay);  // Added randomized delay
}



// Function to handle a player being shot
function playerShot(selectedPlayer, randomPlayerIndex, damage) {
    const playerHPElement = selectedPlayer.querySelector('.player-hp');
    let currentHP = parseInt(playerHPElement.innerText.replace('HP: ', ''));
    currentHP = Math.max(0, currentHP - damage);
    playerHPElement.innerText = `HP: ${currentHP}`;
	selectedPlayer.style.backgroundColor = 'red';
    console.log(`${players[randomPlayerIndex]} is shot for ${damage} damage! Remaining HP: ${currentHP}`);
    setgameMessage(`${players[randomPlayerIndex]} is shot for ${damage} damage! Remaining HP: ${currentHP}`);
    appendSystemMessage(`${players[randomPlayerIndex]} is shot for ${damage} damage! Remaining HP: ${currentHP}`);
    updateTopPlayers();

    // Reset background color after the shot
    setTimeout(() => {
        selectedPlayer.style.backgroundColor = '#10908fa8';  // Reset to original color
    }, 300);  // Delay to allow the red color to be visible for a moment

    return currentHP;
}


// Function to handle a player being killed
function playerKilled(selectedPlayer, randomPlayerIndex) {
    console.log(`${players[randomPlayerIndex]} is dead!`);
    setgameMessage(`${players[randomPlayerIndex]} is dead!`);
    appendSystemMessage(`${players[randomPlayerIndex]} is dead!`);

    // Play the death sound
    playRandomDeathSound();

    // Remove player from game
    players.splice(randomPlayerIndex, 1);
    selectedPlayer.remove();
    playerAvatars.splice(randomPlayerIndex, 1);

    updateRemainingPlayers();
    updateRoundMessage();

    // Recalculate positions for remaining players
    setupRoulette(players.length);
}

//
//
// Main roulette function

// Main roulette function
function startRoulette() {
    if (players.length === 1) {
        announceWinner(players[0]);
        return;
    }

    // Rotate the gun and select a player
    const { randomPlayerIndex, rotationDuration } = rotateAndSelectPlayer(players);
    const selectedPlayer = playerAvatars[randomPlayerIndex];

    // Draw line to the selected player and apply damage
    setTimeout(() => {
        pullGunTrigger(selectedPlayer); // Draw the line and play sound/hide automatically
        setTimeout(() => {
            const damage = Math.floor(Math.random() * 11); // Random damage between 0 and 10
            const currentHP = playerShot(selectedPlayer, randomPlayerIndex, damage);

            if (currentHP <= 0) {
                playerKilled(selectedPlayer, randomPlayerIndex);

                if (!firstDeathOccurred) {
                    console.log(`First death occurred`);
                    firstDeathOccurred = true; // Set this to true on the first death
					firstDeathAnnouncement();
                    // Delay the next round by 5 seconds
                    setTimeout(() => {
                        startRoulette();
                    }, 5000);
					console.log(`5 seconds over = game should restart now`);
                    return; // Exit to prevent the next call
                } else {
                    console.log(`Subsequent death occurred`);
                }
            }

            // Set the timeout duration based on whether the first death has occurred
            const nextTimeout = firstDeathOccurred ? 300 : 100; // Adjusted for 1000ms if first death has occurred
            setTimeout(startRoulette, nextTimeout);

        }, 300);
    }, rotationDuration);
}


//-----------------------------------------
function randomWinnerAnnouncement(winner) {
  const announcements = [
    `Looks like luck was on their side! ${winner} dodged every bullet! Congratulations ${winner}! `,
    `Against all odds, ${winner} is still breathing! big Congratulations to ${winner}!`,
    `Bang! Bang! Just kidding, ${winner} survived the madness! absolutely astounding. Congratulations ${winner}!`,
    `The chamber clicked, but fate spared ${winner}. Congrats!`,
    `And then there was one... ${winner}, you're the last one standing! Congratulations ${winner}!`,
    `With bullets flying, only ${winner} made it out alive! Congratulations ${winner}!`,
    `Congratulations ${winner}! You all came for a game of chance, and ${winner} beat it!`,
    `Wow! alright folks. We have a champion: ${winner}! Looks like Death decided to take a break. Congratulations ${winner}`,
    `Boom or bust, ${winner} is the lucky one!  Congratulations ${winner}!`,
    `None of us expected it, but ${winner} came out of this Alive! Congratulations ${winner}!`
  ];

  // Randomize and select a winner announcement
  const randomAnnouncement = announcements[Math.floor(Math.random() * announcements.length)];

  // Create the speech utterance
  const utterance = new SpeechSynthesisUtterance(randomAnnouncement);

  // Speak the random announcement
  window.speechSynthesis.speak(utterance);

  // Optionally, return the text in case you want to log or display it
  return randomAnnouncement;
}


function announceWinner(winner) {
  const announcement = randomWinnerAnnouncement(winner); 

  // Update other parts of your code with the announcement
  console.log(announcement);
  setgameMessage(announcement);
  appendSystemMessage(announcement);
  // Call the distributeLoot function after announcing the winner
  distributeLoot();
}





//sounds
function playRandomDeathSound() {
    // Get all death sound elements in an array
    const deathSounds = [
/*         document.getElementById('playerdeath-Sound1'), */
        document.getElementById('playerdeath-Sound2'),
        document.getElementById('playerdeath-Sound3'),
        document.getElementById('playerdeath-Sound4')
    ];

    // Select a random sound from the array
    const randomIndex = Math.floor(Math.random() * deathSounds.length);
    const selectedSound = deathSounds[randomIndex];

    // Set the volume and play the sound
    selectedSound.volume = 0.9; // Adjust the volume as desired
    selectedSound.currentTime = 0; // Rewind to the start
    selectedSound.play();
}

// Function to apply damage to a player and return the updated HP
function applyDamage(player, playerIndex, damage) {
    const playerHPElement = player.querySelector('.player-hp');
    let currentHP = parseInt(playerHPElement.innerText.replace('HP: ', ''));
    currentHP = Math.max(0, currentHP - damage);
    playerHPElement.innerText = `HP: ${currentHP}`;
    player.style.backgroundColor = 'red';

    console.log(`${players[playerIndex]} is shot for ${damage} damage! Remaining HP: ${currentHP}`);

    setTimeout(() => {
        player.style.backgroundColor = '#10908fa8';  // Reset to original color
    }, 300);

    if (currentHP <= 0) {
        playerKilled(player, playerIndex); // Handle player death if HP reaches 0
    }

    return currentHP;
}

// Function to update & increment the round
function updateRoundMessage() {
  // Set the game message to the current round number
  currentRoundElement.textContent = 'Rounds ' + currentRound;
    currentRound++;
 // Adjust the timeout duration as needed (3000ms = 3 seconds)
}

// Function to announce the first death
function firstDeathAnnouncement() {
  const announcement = "Wow! alright folks, The first death of the roulette game has occured! Things should start heating up now!"; // Customize this message as needed

  // Use SpeechSynthesis API for spoken announcement
  const utterance = new SpeechSynthesisUtterance(announcement);
  speechSynthesis.speak(utterance);

  // Update other parts of your code with the announcement
  console.log(announcement);
  setgameMessage(announcement);
  appendSystemMessage(announcement);
}




//
// Display system messages in the chat box
function appendSystemMessage(message) {
  const messageElement = document.createElement('p');
  messageElement.textContent = message;
  systemMessagesElement.appendChild(messageElement);

  // Scroll to the bottom of the chat box
  systemMessagesElement.scrollTop = systemMessagesElement.scrollHeight;
}
//
// Set the header message for the game
function setgameMessage(message) {
  headerMessagesElement.textContent = message;
}

//
//---------------------
//prize pool fetching, and loot/prize calculations 
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

//extract prize pool value from text.match(Current Total Ped pool:\s*(\d+(\.\d+)?)/)
function extractPrizePool(text) {
  // Use a regular expression to find the prize pool value
  const match = text.match(/Current Total Ped pool:\s*(\d+(\.\d+)?)/);
  if (match) {
    return match[1]; // Return the captured value
  }
  return 'Not found'; // If the pattern does not match
}

// display remaining prize pool value ( sets the innertext of element )
function displayPrizePool(value) {
  document.getElementById('prizePool').innerText = `Current Prize Pool: ${value}`;
}

//calculate random loot amount based on player count
function calculateRandomLoot() {
  // Get the total players from the displayed text
  const totalPlayersText = document.getElementById('totalPlayerCount').innerText;
  const numPlayers = parseInt(totalPlayersText.replace('Total Players: ', ''), 10);

  // Define the minimum and maximum loot amounts per player
  const minLootPerPlayer = 0.01;
  const maxLootPerPlayer = 0.50;

  // Initialize total loot variable
  let totalLoot = 0;

  // Loop through the number of players and calculate random loot for each
  for (let i = 0; i < numPlayers; i++) {
    const lootForPlayer = Math.random() * (maxLootPerPlayer - minLootPerPlayer) + minLootPerPlayer;
    totalLoot += lootForPlayer; // Add to total loot
  }

  // Update the current prize display
  document.getElementById('currentPrize').innerText = `Survival Prize: ${totalLoot.toFixed(2)}`;

  // Return the total loot prize value
  return totalLoot;
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

    if (players.length === 1) {
        const lastSurvivingPlayer = players[0];

        // Get the calculated loot value
        const totalLoot = calculateRandomLoot();

        const lootMessage = `${lastSurvivingPlayer} receives ${totalLoot.toFixed(2)} from the loot pool.`;
        appendSystemMessage(lootMessage);

        const lootDiv = document.getElementById('loot');
        lootDiv.innerHTML = `<p>${lootMessage}</p>`;
        lootDiv.innerHTML += `<p>Total Value Looted: ${totalLoot.toFixed(2)}</p>`;
        lootDiv.innerHTML += `<p>Remaining Prize Pool: ${(totalPrizePool - totalLoot).toFixed(2)}</p>`;

        // Update the prize pool
        prizePoolElement.innerText = `Current Prize Pool: ${(totalPrizePool - totalLoot).toFixed(2)}`;

        // Save the remaining prize pool to local storage
        saveRemainingPrizePool();
    } else {
        console.log('No winner yet or no players remaining.');
    }
}


//file upload handling button
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



//save the new remaining prize pool amount to local storage
function saveRemainingPrizePool() {
    const prizePoolElement = document.getElementById('prizePool');
    const prizePoolText = prizePoolElement.innerText;
    const match = prizePoolText.match(/Current Prize Pool: (\d+(\.\d+)?)/);

    if (!match) {
        console.error('Prize pool value not found.');
        return;
    }

    let totalPrizePool = parseFloat(match[1]);

    // Save the remaining prize pool to local storage
    localStorage.setItem('remainingPrizePool', totalPrizePool.toFixed(2));
	// Log the saved value to the console
    console.log(`Remaining Prize Pool saved: ${totalPrizePool.toFixed(2)}`);
}

// To retrieve the value later
function getRemainingPrizePool() {
    const lastPrizePool = parseFloat(localStorage.getItem('remainingPrizePool'));
    return isNaN(lastPrizePool) ? 0 : lastPrizePool; // Return 0 if no value is found
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

// Assuming players is already defined and contains the player data
document.getElementById('calculateLootButton').addEventListener('click', function() {
  const numPlayers = players.filter(player => player.isAlive).length; // Count alive players
  const totalLootPrize = calculateRandomLoot(numPlayers);
  console.log(`Total Loot Prize: ${totalLootPrize}`);
});

document.addEventListener('DOMContentLoaded', () => {
  fetchPrizePool();
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
