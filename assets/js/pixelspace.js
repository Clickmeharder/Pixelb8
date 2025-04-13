// == Basic Twitch Overlay Space Game ==
// Icons: 🚀 (chattership), 🛸 (enemy UFO), 🛰️ (satellite)

// Let's add them to <div id="streamSpace"></div> instead of the body
const colonistShips = {};
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
    const angle = Math.random() * 2 * Math.PI;
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
    const angle = Math.random() * 2 * Math.PI; 
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

function spawnColonistShip(user) {
  if (document.getElementById(`ship-${user}`)) return;

  const ship = document.createElement("div");
  ship.classList.add("colonistship");
  ship.id = `ship-${user}`;

  const shipHitbox = document.createElement("div");
  shipHitbox.classList.add("ship-hitbox");

  const userColor = userColors[user] || "orangered";
  shipHitbox.style.borderBottomColor = userColor;

  const nameTag = document.createElement("div");
  nameTag.classList.add("colonistship-name");
  nameTag.textContent = user;
  nameTag.style.color = userColor;

  ship.appendChild(shipHitbox);
  ship.appendChild(nameTag);

  ship.style.left = `${Math.random() * 90}vw`;
  ship.style.top = `${Math.random() * 80}vh`;

  document.getElementById("streamSpace").appendChild(ship);
  moveColonistShipRandomly(ship);
  colonistShips[user] = ship;
}

function spawnSatellite(user) {
  const sat = document.createElement("div");
  sat.classList.add("entity");
  sat.innerHTML = `🛰️<span class="callSign">${user}</span>`;
  randomPosition(sat);
  document.getElementById("streamSpace").appendChild(sat); // Add satellite to streamSpace div
  satellites[user] = sat;

  animateEntity(sat, "satellite");
}

function spawnEnemyUFO() {
  const ufo = document.createElement("div");
  ufo.classList.add("entity");
  ufo.innerHTML = `🛸`;
  ufo.dataset.hp = 5;
  randomPosition(ufo);
  document.getElementById("streamSpace").appendChild(ufo); // Add UFO to streamSpace div
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

    document.getElementById("streamSpace").appendChild(ammo); // Add ammo to streamSpace div

    moveAmmo(ammo);
}

// UFO spawns randomly
setInterval(() => {
  const chance = Math.random();
  if (chance < 0.4) spawnEnemyUFO();
}, 10000);


console.log("pixelspace initiated");
