const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5', 'Player 6', 'Player 7', 'Player 8', 'Player 9', 'Player 10'];
const playerAvatars = [];
let gunAngle = 0;

function setupRoulette() {
  const rouletteCircle = document.getElementById('roulette-circle');
  const radius = rouletteCircle.offsetWidth / 2 - 10;  // Perfect radius as you mentioned

  // Set the gun at the center
  const gunImage = document.getElementById('gun-image');
  gunImage.style.left = '50%';
  gunImage.style.top = '50%';
  gunImage.style.transform = 'translate(-50%, -50%) rotate(0deg)'; // Ensure it's always centered initially

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
  const angleToPlayer = (randomPlayerIndex / players.length) * 360;
  const damage = Math.floor(Math.random() * 11); // Damage between 0-10

  // Rotate the gun and arrow to point at the selected player
  const gunImage = document.getElementById('gun-image');
  const gunArrow = document.getElementById('gun-arrow');
  gunAngle += 360 + angleToPlayer;
  
  // Rotate the gun and arrow together
  gunImage.style.transform = `translate(-50%, -50%) rotate(${gunAngle}deg)`;
  gunArrow.style.transform = `translateX(-50%) rotate(${gunAngle}deg)`; // Arrow rotates with the gun

  // Apply damage to the player
  setTimeout(() => {
    alert(`${players[randomPlayerIndex]} is shot for ${damage} damage!`);
  }, 1000); // 1 second delay to match gun rotation
}

// Initialize the roulette
document.addEventListener('DOMContentLoaded', () => {
  setupRoulette();
  document.getElementById('startRouletteButton').addEventListener('click', startRoulette);
});
