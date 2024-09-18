// Display battle version at the top of the page
let currentnewversion = 'beta 0.001';
const newversionElement = document.getElementById('new-version');
deathmatchversionElement.textContent = currentdeathmatchversion;

// Game setup
const boss = document.getElementById('boss');
const players = [
  document.getElementById('player1'),
  document.getElementById('player2')
];

// Initial positions
let bossPosition = { x: 100, y: 100 };
let playerPositions = [
  { x: 200, y: 300 },
  { x: 400, y: 400 }
];

// Move boss and players randomly
function moveCharacter(character, position) {
  // Randomly move within the boundaries of the game area
  const newX = Math.max(0, Math.min(750, position.x + (Math.random() * 40 - 20)));
  const newY = Math.max(0, Math.min(550, position.y + (Math.random() * 40 - 20)));
  
  position.x = newX;
  position.y = newY;

  // Update the position of the character in the game
  character.style.left = `${newX}px`;
  character.style.top = `${newY}px`;
}

// Automated boss and player movement
function updateGame() {
  // Move boss
  moveCharacter(boss, bossPosition);

  // Move each player
  players.forEach((player, index) => {
    moveCharacter(player, playerPositions[index]);
  });

  // Call this function again after a delay for continuous movement
  setTimeout(updateGame, 1000); // Adjust the interval as needed
}

// Start the game loop
updateGame();

function moveCharacter(character, position) {
  const oldX = position.x;
  const oldY = position.y;

  // Random movement logic
  const newX = Math.max(0, Math.min(750, position.x + (Math.random() * 40 - 20)));
  const newY = Math.max(0, Math.min(550, position.y + (Math.random() * 40 - 20)));

  position.x = newX;
  position.y = newY;

  // Change background based on movement direction
  if (newX > oldX && newY < oldY) {
    character.style.backgroundImage = 'url(../assets/defaultplayer/femalerightdefault.png)';//'url(assets/defaultplayer/player-walk-topright.png)';
  } else if (newX < oldX && newY < oldY) {
    character.style.backgroundImage = 'url(../assets/defaultplayer/femaleleftdefault.png)';//'url(assets/defaultplayer/player-walk-topleft.png)';
  } else if (newX > oldX && newY > oldY) {
    character.style.backgroundImage = 'url(../assets/defaultplayer/femaledefault.png)';//'url(assets/defaultplayer/player-walk-down.png)';
  } else if (newX < oldX && newY > oldY) {
    character.style.backgroundImage = 'url(../assets/defaultplayer/femaleleftdefault.png)';//'url(assets/defaultplayer/player-walk-left.png)';
  }

  // Update the position of the character in the game
  character.style.left = `${newX}px`;
  character.style.top = `${newY}px`;
}