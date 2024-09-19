const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10'];
const playerAvatars = [];
const offsetAngle = 90; // Offset to adjust initial straight-up position of gun

function setupRoulette() {
  const rouletteCircle = document.getElementById('roulette-circle');
  const radius = rouletteCircle.offsetWidth / 2 - 10;  // Perfect radius as you mentioned

  // Set the gun at the center
  const gunImage = document.getElementById('gun-image');
  gunImage.style.left = '50%';
  gunImage.style.top = '50%';
  gunImage.style.transform = 'translate(-50%, -50%)'; // Ensure it's always centered initially

  // Calculate positions for each player and place them around the circle
  players.forEach((player, index) => {
    const angle = (index / players.length) * 2 * Math.PI; // Convert index to radians
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;

    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player-avatar');
    
    // Center the player avatars at their calculated (x, y) positions
    playerDiv.style.left = `calc(50% + ${x}px - 40px)`;  // Adjusting for half avatar size
    playerDiv.style.top = `calc(50% + ${y}px - 40px)`;   // Adjusting for half avatar size
    playerDiv.textContent = player;

    rouletteCircle.appendChild(playerDiv);
    playerAvatars.push(playerDiv);
  });
}

// Spin the gun and choose a random player
function startRoulette() {
  const randomPlayerIndex = Math.floor(Math.random() * players.length);
  const angleToPlayer = (randomPlayerIndex / players.length) * 360; // Angle to the player in degrees
  const damage = Math.floor(Math.random() * 11); // Damage between 0-10

  // Rotate the gun and arrow to point at the selected player
  const gunImage = document.getElementById('gun-image');
  const gunArrow = document.getElementById('gun-arrow');
  const gunLine = document.getElementById('gun-line');

  // Reset player colors before starting new round
  playerAvatars.forEach(player => player.style.backgroundColor = '#688a6a');

  // Adjust the angle based on the initial position offset of the gun (90 degrees)
  const correctedAngle = angleToPlayer - offsetAngle - 180; // Reversed direction

  // Rotate the gun and arrow together
  gunImage.style.transform = `translate(-50%, -50%) rotate(${correctedAngle}deg)`;
  gunArrow.style.transform = `translateX(-50%) rotate(${correctedAngle}deg)`;

  // Turn the selected player red
  const selectedPlayer = playerAvatars[randomPlayerIndex];
  selectedPlayer.style.backgroundColor = 'red';

  // Draw a line to the selected player (simple visual aid for laser)
  drawLineToPlayer(selectedPlayer, gunLine);

  // Apply damage to the player
  setTimeout(() => {
    alert(`${players[randomPlayerIndex]} is shot for ${damage} damage!`);
  }, 1000); // 1 second delay to match gun rotation
}

function drawLineToPlayer(player, gunLine) {
  const gunArrow = document.getElementById('gun-arrow');
  const gunArrowCenter = gunArrow.getBoundingClientRect(); // Get the bounding rectangle of the gun arrow
  const playerCenter = player.getBoundingClientRect();

  // Calculate the center of the gun arrow
  const arrowCenterX = gunArrowCenter.left + gunArrowCenter.width / 2;
  const arrowCenterY = gunArrowCenter.top + gunArrowCenter.height / 2;

  // Calculate the distance and angle from the gun arrow to the player
  const dx = playerCenter.left + playerCenter.width / 2 - arrowCenterX;
  const dy = playerCenter.top + playerCenter.height / 2 - arrowCenterY;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI); // Convert to degrees

  // Adjust the angle by adding 90 degrees to correct the rotation offset
  const adjustedAngle = angle + 90;

  // Set line properties
  gunLine.style.width = '1px'; // Fixed width for the line
  gunLine.style.height = '207px'; // Fixed height for the line
  gunLine.style.transform = `rotate(${adjustedAngle}deg)`; // Rotate the line to point at the player
  gunLine.style.transformOrigin = 'bottom center'; // Rotate around the bottom center of the line
  
  // Adjust the vertical position based on the rotation angle
  const lineHeight = 207; // Height of the line
  const offsetY = (lineHeight / 2) * Math.sin(angle * (Math.PI / 180)); // Calculate vertical offset based on angle

  gunLine.style.left = '50%'; // Always centered horizontally
  gunLine.style.top = `${-offsetY}px`; // Adjust top based on the rotation

  gunLine.style.display = 'block';  // Show the line
  
  // Add animation
  gunLine.style.animation = 'shootLaser 1s ease-out'; // Duration and easing can be adjusted
}

// Example usage with animation
document.addEventListener('DOMContentLoaded', () => {
  setupRoulette();
  document.getElementById('startRouletteButton').addEventListener('click', startRoulette);
});