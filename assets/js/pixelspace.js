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

function moveChatterShipRandomly(ship) {
  console.log(`Moving ChatterShip: ${ship.id}`);

  // Random movement interval for chatter ships
  const movementInterval = setInterval(() => {
    const angle = Math.random() * 360; // Random angle in radians
    const distance = Math.random() * 100; // Random distance
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    const rect = ship.getBoundingClientRect();
    let newX = rect.left + dx;
    let newY = rect.top + dy;

    // Stay within bounds of the screen
    newX = Math.max(0, Math.min(window.innerWidth - 50, newX));
    newY = Math.max(0, Math.min(window.innerHeight - 50, newY));

    ship.style.left = `${newX}px`;
    ship.style.top = `${newY}px`;

    console.log(`ChatterShip (${ship.id}) new position: left=${newX}px, top=${newY}px`);
  }, 2000); // Move every 2 seconds

  ship.dataset.animInterval = movementInterval; // Store interval for potential clearing later
}

function spawnChatterShip(user) {
    if (document.getElementById(`ship-${user}`)) return; // prevent duplicates

    const ship = document.createElement("div");
    ship.classList.add("chattership");
    ship.id = `ship-${user}`;

    const userColor = userColors[user] || "orangered";

    // Set ship text/icon
    ship.textContent = "🚀";

    // Apply user color to the name
    const nameTag = document.createElement("div");
    nameTag.classList.add("chattership-name");
    nameTag.textContent = user;
    nameTag.style.color = userColor;
    ship.appendChild(nameTag);

    // Apply movement, styles, etc.
    ship.style.left = `${Math.random() * 90}vw`;
    ship.style.top = `${Math.random() * 80}vh`;

    // Save the color for use in projectiles
    ship.dataset.user = user;
    ship.dataset.color = userColor;

    document.body.appendChild(ship);

    moveChatterShipRandomly(ship); // Begin moving chattership randomly
    chatterShips[user] = ship;
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

function fireAmmoFromShip(ship) {
    const ammo = document.createElement("div");
    ammo.classList.add("ammo");
    ammo.textContent = "💥";

    // Use ship's stored color
    const color = ship.dataset.color || "white";
    ammo.style.color = color;

    ammo.style.left = ship.style.left;
    ammo.style.top = ship.style.top;

    document.body.appendChild(ammo);

    moveAmmo(ammo);
}

// UFO spawns randomly
setInterval(() => {
  const chance = Math.random();
  if (chance < 0.4) spawnEnemyUFO();
}, 10000);


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
  .chattership-name {
    position: absolute;
    bottom: -30px;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 0.8rem;
    color: inherit;
  }
  .ammo {
    position: absolute;
    font-size: 1.5rem;
    color: inherit;
    transition: top 0.5s ease;
  }
  .ammo.move {
    top: 100%;
  }
`;
document.head.appendChild(style);

console.log("pixelspace initiated");

