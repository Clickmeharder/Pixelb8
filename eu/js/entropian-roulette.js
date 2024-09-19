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

  // Randomize the gun rotation duration between 1 and 3 seconds
  const rotationDuration = Math.random() * 2000 + 1000; // 1000 to 3000ms

  // Rotate the gun and arrow together
  gunImage.style.transition = `transform ${rotationDuration}ms ease-out`; // Smooth transition for rotation
  gunImage.style.transform = `translate(-50%, -50%) rotate(${correctedAngle}deg)`;
  gunArrow.style.transition = `transform ${rotationDuration}ms ease-out`; // Smooth transition for rotation
  gunArrow.style.transform = `translateX(-50%) rotate(${correctedAngle}deg)`;

  // Turn the selected player red
  const selectedPlayer = playerAvatars[randomPlayerIndex];
  selectedPlayer.style.backgroundColor = 'red';

  // After gun rotation completes, start the laser shooting animation
  setTimeout(() => {
    // Draw a line to the selected player
    drawLineToPlayer(selectedPlayer, gunLine);

    // Add the shooting animation after gun rotation completes
    setTimeout(() => {
      // Apply damage to the player
      console.log(`${players[randomPlayerIndex]} is shot for ${damage} damage!`);

      // Hide the line after animation completes
      setTimeout(() => {
        gunLine.style.display = 'none';
      }, 1000); // Match the duration of the animation

      // Reset animation state
      gunLine.style.display = 'block'; // Make sure the line is visible
      gunLine.style.animation = 'none'; // Reset animation
      gunLine.offsetHeight; // Trigger a reflow to restart animation
      gunLine.style.animation = 'shootLaser 1s ease-out'; // Start animation
    }, 500); // Slight delay before shooting after rotation
  }, rotationDuration); // Delay for gun rotation
}
function drawLineToPlayer(player, gunLine) {
  const gunArrow = document.getElementById('gun-arrow');
  const gunArrowRect = gunArrow.getBoundingClientRect(); // Get the bounding rectangle of the gun arrow
  const playerRect = player.getBoundingClientRect(); // Get the bounding rectangle of the player

  // Calculate the center point of the gun arrow
  const gunCenterX = gunArrowRect.left + gunArrowRect.width / 2;
  const gunCenterY = gunArrowRect.top + gunArrowRect.height / 2;

  // Calculate the center point of the player
  const playerCenterX = playerRect.left + playerRect.width / 2;
  const playerCenterY = playerRect.top + playerRect.height / 2;

  // Calculate the distance between the gun and the player using Pythagoras theorem
  const dx = playerCenterX - gunCenterX;
  const dy = playerCenterY - gunCenterY;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Calculate the angle between the gun and the player
  const angle = Math.atan2(dy, dx) * (180 / Math.PI) - 90; // Subtract 45 degrees for correction


  // Adjust line properties to point to the player
  gunLine.style.height = `${distance}px`; // Set the line's height to the distance between the gun and player
  gunLine.style.transform = `rotate(${angle}deg)`; // Rotate the line to face the player
  gunLine.style.transformOrigin = '0 0'; // Set the origin to the top-left of the line

  // Set the line's starting position to the center of the gun
  gunLine.style.left = `50%`; // Set left to the gun's center X position
  gunLine.style.top = `50%`;  // Set top to the gun's center Y position

  // Make sure the line is visible
  gunLine.style.display = 'block';
}

// Example usage with animation
document.addEventListener('DOMContentLoaded', () => {
  setupRoulette();
  document.getElementById('startRouletteButton').addEventListener('click', startRoulette);
});