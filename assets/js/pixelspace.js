<style>
  #streamSpace {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
  .entity {
    position: fixed;
    font-size: 2rem;
    pointer-events: none;
    user-select: none;
    text-align: center;
  }
  .colonistship {
    position: fixed;
    width: min-content;
    height: min-content;
    pointer-events: none;
    user-select: none;
  }
  .ship-hitbox {
    width: 0;
    height: 0;
    border-left: 12px solid transparent;
    border-right: 12px solid transparent;
    border-bottom: 24px solid orangered;
    transform: rotate(0deg);
    transition: transform 0.3s ease;
    margin: auto;
  }
  .colonistship-name {
    position: absolute;
    bottom: -30px;
    left: 50%;
    transform: translateX(-50%);
    width: max-content;
    text-align: center;
    font-size: 0.8rem;
    color: white;
  }
  .ammo {
    position: absolute;
    font-size: 1.5rem;
    color: white;
    pointer-events: none;
    transition: top 0.5s ease;
  }
</style>

<div id="streamSpace"></div>

<script>
  const colonistShips = {};
  const enemies = [];
  const userColors = {};

  function randomPosition(el) {
    const x = Math.random() * (window.innerWidth - 50);
    const y = Math.random() * (window.innerHeight - 50);
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  }

  function spawnEnemyUFO() {
    const ufo = document.createElement("div");
    ufo.classList.add("entity");
    ufo.innerHTML = `🛸`;
    ufo.dataset.hp = 5;
    ufo.dataset.type = "enemy";
    randomPosition(ufo);
    document.getElementById("streamSpace").appendChild(ufo);
    enemies.push(ufo);
    moveEnemy(ufo);
    console.log("Enemy UFO spawned");

    setTimeout(() => {
      if (ufo.parentElement) ufo.remove();
    }, 20000);
  }

  function moveEnemy(enemy) {
    const interval = setInterval(() => {
      if (!enemy.parentElement) return clearInterval(interval);
      const angle = Math.random() * Math.PI * 2;
      const distance = Math.random() * 50;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      const rect = enemy.getBoundingClientRect();
      let newX = rect.left + dx;
      let newY = rect.top + dy;

      newX = Math.max(0, Math.min(window.innerWidth - 50, newX));
      newY = Math.max(0, Math.min(window.innerHeight - 50, newY));

      enemy.style.left = `${newX}px`;
      enemy.style.top = `${newY}px`;
    }, 2000);
  }

  function moveColonistShipRandomly(ship) {
    const interval = setInterval(() => {
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * 100;
      const dx = Math.cos(angle) * distance;
      const dy = Math.sin(angle) * distance;

      const rect = ship.getBoundingClientRect();
      let newX = rect.left + dx;
      let newY = rect.top + dy;

      newX = Math.max(0, Math.min(window.innerWidth - 50, newX));
      newY = Math.max(0, Math.min(window.innerHeight - 50, newY));

      ship.style.left = `${newX}px`;
      ship.style.top = `${newY}px`;

      checkAndShoot(ship);
    }, 2000);

    ship.dataset.animInterval = interval;
  }

  function checkAndShoot(ship) {
    const shipRect = ship.getBoundingClientRect();

    enemies.forEach((enemy) => {
      const enemyRect = enemy.getBoundingClientRect();
      const dx = enemyRect.left - shipRect.left;
      const dy = enemyRect.top - shipRect.top;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 200) {
        shootAt(ship, enemy);
      }
    });
  }

  function shootAt(ship, enemy) {
    const ammo = document.createElement("div");
    ammo.classList.add("ammo");
    ammo.textContent = "💥";

    const shipRect = ship.getBoundingClientRect();
    const enemyRect = enemy.getBoundingClientRect();
    const dx = enemyRect.left - shipRect.left;
    const dy = enemyRect.top - shipRect.top;
    const angle = Math.atan2(dy, dx);

    ammo.style.left = `${shipRect.left + 10}px`;
    ammo.style.top = `${shipRect.top + 10}px`;
    ammo.style.transform = `rotate(${angle}rad)`;

    document.getElementById("streamSpace").appendChild(ammo);

    const vx = Math.cos(angle) * 5;
    const vy = Math.sin(angle) * 5;

    const move = setInterval(() => {
      const x = parseFloat(ammo.style.left);
      const y = parseFloat(ammo.style.top);
      ammo.style.left = `${x + vx}px`;
      ammo.style.top = `${y + vy}px`;

      const ammoRect = ammo.getBoundingClientRect();
      const enemyRect = enemy.getBoundingClientRect();

      const colliding =
        ammoRect.left < enemyRect.right &&
        ammoRect.right > enemyRect.left &&
        ammoRect.top < enemyRect.bottom &&
        ammoRect.bottom > enemyRect.top;

      if (colliding) {
        clearInterval(move);
        ammo.remove();
        handleDamage(enemy);
      }
    }, 16);
  }

  function handleDamage(enemy) {
    let hp = parseInt(enemy.dataset.hp);
    hp -= 1;
    enemy.dataset.hp = hp;
    if (hp <= 0) {
      enemy.remove();
      console.log("Enemy destroyed!");
    }
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

  // Example spawn
  spawnColonistShip("jaedraze");

  // Enemy UFO spawn loop
  setInterval(() => {
    if (Math.random() < 0.5) spawnEnemyUFO();
  }, 8000);
</script>
