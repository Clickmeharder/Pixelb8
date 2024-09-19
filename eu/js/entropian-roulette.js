const players = ['Player 1', 'Player 2', 'Player 3', 'Player 4', 'Player 5'];
const playerAvatars = [];
let gunAngle = 0;

// Create player avatars and place them in a circle
function setupRoulette() {
  const rouletteCircle = document.getElementById('roulette-circle');
  const radius = rouletteCircle.offsetWidth / 2;

  players.forEach((player, index) => {
    const angle = (index / players.length) * 360;
    const playerDiv = document.createElement('div');
    playerDiv.classList.add('player-avatar');
    playerDiv.style.transform = `rotate(${angle}deg) translate(${radius}px) rotate(-${angle}deg)`;
    rouletteCircle.appendChild(playerDiv);
    playerAvatars.push(playerDiv);
  });
}

// Spin the gun and choose a random player
function startRoulette() {
  const randomPlayerIndex = Math.floor(Math.random() * players.length);
  const angleToPlayer = (randomPlayerIndex / players.length) * 360;
  const damage = Math.floor(Math.random() * 11); // Damage between 0-10

  // Rotate the gun to point at the selected player
  const gunImage = document.getElementById('gun-image');
  gunAngle += 360 + angleToPlayer;
  gunImage.style.transform = `rotate(${gunAngle}deg)`;

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
