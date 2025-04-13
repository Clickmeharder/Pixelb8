// == Basic Twitch Overlay Space Game ==
// Icons: 🚀 (chattership), 🛸 (enemy UFO), 🛰️ (satellite)

const chatterShips = {};
const satellites = {};
const enemies = [];

function randomPosition(el) {
  const x = Math.random() * (window.innerWidth - 50);
  const y = Math.random() * (window.innerHeight - 50);
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
}

function animateEntity(el, type) {
  const interval = setInterval(() => {
    const angle = Math.random() * 360;
    const distance = Math.random() * 50;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const rect = el.getBoundingClientRect();
    let newX = rect.left + dx;
    let newY = rect.top + dy;

    // Stay in bounds
    newX = Math.max(0, Math.min(window.innerWidth - 50, newX));
    newY = Math.max(0, Math.min(window.innerHeight - 50, newY));

    el.style.left = `${newX}px`;
    el.style.top = `${newY}px`;
  }, 3000);

  el.dataset.animInterval = interval;
}

function spawnChatterShip(user) {
  if (chatterShips[user]) return; // only one per user

  const ship = document.createElement("div");
  ship.classList.add("entity");
  ship.innerHTML = `🚀<span class="callSign">${user}</span>`;
  ship.dataset.hp = 3;
  randomPosition(ship);
  document.body.appendChild(ship);
  chatterShips[user] = ship;

  animateEntity(ship, "ship");
}

function spawnSatellite(user) {
  const sat = document.createElement("div");
  sat.classList.add("entity");
  sat.innerHTML = `🛰️<span class="callSign">${user}</span>`;
  randomPosition(sat);
  document.body.appendChild(sat);
  satellites[user] = sat;

  animateEntity(sat, "satellite");
}

function spawnEnemyUFO() {
  const ufo = document.createElement("div");
  ufo.classList.add("entity");
  ufo.innerHTML = `🛸`;
  ufo.dataset.hp = 5;
  randomPosition(ufo);
  document.body.appendChild(ufo);
  enemies.push(ufo);

  animateEntity(ufo, "ufo");

  setTimeout(() => {
    if (ufo.parentElement) ufo.remove();
  }, 20000);
}


// UFO spawns randomly
setInterval(() => {
  const chance = Math.random();
  if (chance < 0.4) spawnEnemyUFO();
}, 10000);

// TEST commands (you can remove these in production)
setTimeout(() => handleChatCommand("jaedraze", "!launch"), 1000);
setTimeout(() => handleChatCommand("spacequeen", "!launch-sat"), 3000);
setTimeout(() => handleChatCommand("neobubble", "!launch"), 5000);

// == CSS ==
const style = document.createElement("style");
style.textContent = `
  body {
    margin: 0;
    overflow: hidden;
    background: transparent;
  }
  .entity {
    position: fixed;
    font-size: 2rem;
    transition: transform 0.3s ease;
    pointer-events: none;
    user-select: none;
    text-align: center;
  }
  .callSign {
    font-size: 0.7rem;
    color: white;
    display: block;
    margin-top: -5px;
  }
`;
document.head.appendChild(style);