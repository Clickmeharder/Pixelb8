
let enemySpawnsByMap = {
  roomA: [],
  house: [],
  roomB: [],
  lake: [],
  garden: [],
  forest: [],
  roomG: [],
  cave: [
    { type: 'sneakyGoblin', x: 150, y: 200 },
	{ type: 'sleepyGoblin', x: 250, y: 225 },
    { type: 'ambitiousGoblin', x: 350, y: 200 },
	{ type: 'angryGoblin', x: 350, y: 200 }
  ],
  town: []
};

let pixelbotStats = {
  health: 100,
};
let detectR = 125;

let entityCategorytypes = {
  enemies: [],
  critters: [],
  pets: [],
  projectiles: [],
}

function updateEnemyDistances() {
  const playerPos = getPlayerCenter();
  if (!playerPos) return;

  const entities = maps[currentMap]?.entities || [];
  entities.forEach((enemy) => {
    if (enemy.type !== "enemy") return;

    const enemyWidth = enemy.width || 32;
    const enemyHeight = enemy.height || 32;
    const offsetX = enemy.visualOffsetX || 12;
    const offsetY = enemy.visualOffsetY || 6;

    const enemyCenterX = enemy.x + enemyWidth / 2 + offsetX;
    const enemyCenterY = enemy.y + enemyHeight / 2 + offsetY;

    const dx = playerPos.x - enemyCenterX;
    const dy = playerPos.y - enemyCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    enemy.distanceToPlayer = distance; // store it for use elsewhere
    enemy.center = { x: enemyCenterX, y: enemyCenterY }; // optional, useful
  });
}

const enemies = {
  ambitiousGoblin: {
    name: 'Ambitious Goblin',
    type: 'enemy',
    baseSpeed: 1.2,
    attackRange: 45,
    attackCooldown: 500,
    health: 30,
    damage: 5,
    spriteSet: {
      down_right: 'core/js/core-apps/pixelbotApp/images/sprites/enemies/sneakygoblin_downfaced_right.png',
      down_left: 'core/js/core-apps/pixelbotApp/images/sprites/enemies/sneakygoblin_downfaced_left.png',
      up: 'core/js/core-apps/pixelbotApp/images/sprites/enemies/sneakygoblin_upfaced.png'
    },
    visualOffsetX: 18, // offsets to align sprite correctly
    visualOffsetY: 6,
    behavior: 'patrol',
    patrolPoints: [
      { x: 0, y: 0 },
      { x: 100, y: 0 },
      { x: 100, y: 100 },
      { x: 0, y: 100 }
    ]
  },
  angryGoblin: {
    name: 'Angry Goblin',
    type: 'enemy',
    baseSpeed: 0.8,
    attackRange: 45,
    attackCooldown: 750,
    health: 60,
    damage: 10,
    spriteSet: {
      down_right: 'core/js/core-apps/pixelbotApp/images/sprites/enemies/sneakygoblin_downfaced_right.png',
      down_left: 'core/js/core-apps/pixelbotApp/images/sprites/enemies/sneakygoblin_downfaced_left.png',
      up: 'core/js/core-apps/pixelbotApp/images/sprites/enemies/sneakygoblin_upfaced.png'
    },
    visualOffsetX: 12, // offsets to align sprite correctly
    visualOffsetY: 6,
    behavior: 'aggro'
  },
  sleepyGoblin: {
    name: 'Sleepy Goblin',
    type: 'enemy',
    baseSpeed: 0.4,
    attackRange: 15,
    attackCooldown: 2000,
    health: 15,
    damage: 3,
    spriteSet: {
      down_right: 'core/js/core-apps/pixelbotApp/images/sprites/enemies/sneakygoblin_downfaced_right.png',
      down_left: 'core/js/core-apps/pixelbotApp/images/sprites/enemies/sneakygoblin_downfaced_left.png',
      up: 'core/js/core-apps/pixelbotApp/images/sprites/enemies/sneakygoblin_upfaced.png'
    },	
    visualOffsetX: 12, // offsets to align sprite correctly
    visualOffsetY: 6,
    behavior: 'patrol',
    patrolPoints: [
      { x: 0, y: 0 },
      { x: 50, y: 0 },
      { x: 50, y: 50 },
      { x: 0, y: 50 }
    ]
  },
  sneakyGoblin: {
    name: 'Sneaky Goblin',
    type: 'enemy',
    baseSpeed: 0.4,
    attackRange: 250,
    attackCooldown: 3000,
    health: 15,
    damage: 3,
    spriteSet: {
      down_right: 'core/js/core-apps/pixelbotApp/images/sprites/enemies/sneakygoblin_downfaced_right.png',
      down_left: 'core/js/core-apps/pixelbotApp/images/sprites/enemies/sneakygoblin_downfaced_left.png',
      up: 'core/js/core-apps/pixelbotApp/images/sprites/enemies/sneakygoblin_upfaced.png'
    },	
    visualOffsetX: 12, // offsets to align sprite correctly
    visualOffsetY: 6,
    behavior: 'patrol',
    patrolPoints: [
      { x: 750, y: 0 },
      { x: 50, y: 0 },
      { x: 250, y: 50 },
      { x: 0, y: 750 }
    ]
  }
};

const lootTables = {
  "Sneaky Goblin": [
    { name: "Goblin Tooth", chance: 0.5 },   // 50% drop chance
    { name: "Rusty Dagger", chance: 0.2 },   // 20% chance
    { name: "Money", chance: 0.1, quantity: [1, 3] }, // 10%, 1–3 coins
  ],
  "Sleepy Goblin": [
    { name: "Goblin Tooth", chance: 0.5 },   // 50% drop chance
    { name: "Rusty Dagger", chance: 0.2 },   // 20% chance
    { name: "Money", chance: 0.1, quantity: [1, 3] }, // 10%, 1–3 coins
  ],
  "Angry Goblin": [
    { name: "Goblin Tooth", chance: 0.5 },   // 50% drop chance
    { name: "Rusty Dagger", chance: 0.2 },   // 20% chance
    { name: "Money", chance: 0.1, quantity: [1, 3] }, // 10%, 1–3 coins
  ],
  "Goblin Boss": [
    { name: "Goblin Crown", chance: 0.05 },
    { name: "Money", chance: 0.6, quantity: [5, 10] },
    { name: "Goblin Tooth", chance: 0.9 },
  ]
};

function spawnEnemy(key, x, y, mapName = currentMap) {
  const map = maps[mapName];
  if (!map) {
    console.warn(`Map "${mapName}" does not exist.`);
    return;
  }

  // Get a random key if none provided
  const enemyKeys = Object.keys(enemies);
  if (!key) {
    key = enemyKeys[Math.floor(Math.random() * enemyKeys.length)];
  }

  const def = enemies[key];
  if (!def) {
    console.warn(`No enemy definition found for key: ${key}`);
    return;
  }

  // Randomize position if not provided
  if (typeof x !== 'number') {
    x = Math.floor(Math.random() * map.width); // assumes map has width
  }
  if (typeof y !== 'number') {
    y = Math.floor(Math.random() * map.height); // assumes map has height
  }

  const enemy = {
    id: `enemy_${key}_${Date.now()}`,
    key,
    type: 'enemy',
    name: def.name || key,
    x,
    y,
    map: mapName,
    speed: def.baseSpeed || 1,
    baseSpeed: def.baseSpeed || 1,
    maxHealth: def.health,
    health: def.health,
    damage: def.damage || 1,
    attackRange: def.attackRange || 20,
    attackCooldown: def.attackCooldown || 1000,
    lastAttackTime: 0,
    state: 'idle',
    scale: def.scale || 1,
    direction: 'down_right',
    spriteSet: def.spriteSet || {},
    visualOffsetX: def.visualOffsetX || 0,
    visualOffsetY: def.visualOffsetY || 0,
    behavior: def.behavior || 'idle',
    patrolPoints: def.patrolPoints ? def.patrolPoints.map(p => ({
      x: p.x + x,
      y: p.y + y
    })) : null,
    patrolIndex: 0
  };

  if (!map.entities) {
    map.entities = [];
  }

  map.entities.push(enemy);

  if (mapName === currentMap) {
    renderEntities();
  }
}

function spawnEnemiesForMap(mapName) {
  const spawns = enemySpawnsByMap[mapName] || [];

  spawns.forEach(spawn => {
    spawnEnemy(spawn.type, spawn.x, spawn.y, mapName);
  });
}

// Populate enemy dropdown from your 'enemies' object keys
function populateEnemySelect() {
  const select = document.getElementById('enemySelect');
  select.innerHTML = ''; // optional: clear existing options if repopulating

  Object.entries(enemies).forEach(([key, enemy]) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${enemy.name} (ID: ${key})`; // or just enemy.name

    // Store extra data attributes
    option.dataset.id = key;


    select.appendChild(option);
  });
}


// Spawn function for multiple enemies at some default or random position
function spawnSelectedEnemies() {
  const select = document.getElementById('enemySelect');
  const quantityInput = document.getElementById('enemyQuantity');
  const enemyKey = select.value;
  const quantity = parseInt(quantityInput.value, 10);

  if (!enemyKey) {
    alert('Please select an enemy!');
    return;
  }
  if (!quantity || quantity < 1) {
    alert('Please enter a valid quantity (1 or more)!');
    return;
  }

  for (let i = 0; i < quantity; i++) {
    // For demo, spawn near center with some random offset
    const x = 400 + Math.random() * 100 - 50;
    const y = 300 + Math.random() * 100 - 50;

    spawnEnemy(enemyKey, x, y, currentMap);
  }

  alert(`Spawned ${quantity} x ${enemies[enemyKey].name} on ${currentMap}.`);
}

// Kill all enemies of selected type on the current map
function removeSelectedEnemies() {
  const select = document.getElementById('enemySelect');
  const enemyKey = select.value;

  if (!enemyKey) {
    alert('Please select an enemy to kill!');
    return;
  }

  // Filter out enemies of this type
  maps[currentMap].entities = maps[currentMap].entities.filter(entity => entity.key !== enemyKey);

  alert(`Killed all ${enemies[enemyKey].name} on ${currentMap}.`);
}




function logAllEntities() {
  console.log("---- Logging all entities on all maps ----");
  for (const mapName in maps) {
    console.log(`Map: ${mapName}`);
    const ents = maps[mapName].entities || [];
    if (ents.length === 0) {
      console.log("  No entities on this map.");
      continue;
    }
    ents.forEach((entity, index) => {
      console.log(`  Entity #${index}:`, entity);

      // Also log keys and values to see structure better
      const keys = Object.keys(entity);
      console.log(`    Keys: ${keys.join(', ')}`);

      // Log specific flags you suspect
      if ('Enemies' in entity) console.log(`    Enemies: ${entity.Enemies}`);
      if ('isEnemy' in entity) console.log(`    isEnemy: ${entity.isEnemy}`);
    });
  }
  console.log("---- End of entities log ----");
}


function removeEnemies() {
  // Remove all enemies on the current map by filtering out entities with type 'enemy'
  maps[currentMap].entities = maps[currentMap].entities.filter(entity => entity.type !== 'enemy');
}

function removeAllEnemiesEverywhere() {
  // Remove all enemies on all maps by filtering out entities with type 'enemy'
  for (const mapName in maps) {
    maps[mapName].entities = maps[mapName].entities.filter(entity => entity.type !== 'enemy');
  }
}

function removeEntities() {
  // Removes all entities on the current map
  maps[currentMap].entities = [];
}

function removeAllEntitiesEverywhere() {
    // Removes all Entities on all maps
  for (const mapName in maps) {
    maps[mapName].entities = [];
  }
}


//
function getDirectionFromVector(vector) {
  const { x, y } = vector;

  // Normalize direction
  const normalizedX = Math.round(x);
  const normalizedY = Math.round(y);

  // Map direction to sprite
  if (normalizedY === -1) return "up"; // up, up_left, up_right
  if (normalizedX === -1) return "down_left"; // left or down_left
  if (normalizedX === 1) return "down_right"; // right or down_right
  return "idle"; // fallback
}


function moveTowards(ent, targetX, targetY) {
  const dx = targetX - ent.x;
  const dy = targetY - ent.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance > 1) {
    const angle = Math.atan2(dy, dx);
    ent.x += Math.cos(angle) * ent.speed;
    ent.y += Math.sin(angle) * ent.speed;

    ent.direction = getDirectionFromVector({ x: dx / distance, y: dy / distance });
  }
}


function updateEntityBehaviors() {
  const entities = maps[currentMap]?.entities;
  if (!entities) return;

  entities.forEach(ent => {
    if (!ent.behavior) return; // skip non-AI entities like pets or objects

    switch (ent.behavior) {
      case 'aggro':
        handleEnemyBehavior(ent);
        break;
      case 'follow':
        handleFollowBehavior(ent);
        break;
      case 'patrol':
      default:
        handlePatrolOrAggroBehavior(ent);
        break;
    }
  });

  renderEntities();
}

function handleEnemyBehavior(enemy) {
  if (!enemy || typeof enemy.distanceToPlayer !== 'number' || !enemy.center) return;

  const playerPos = getPlayerCenter();
  if (!playerPos) return;

  if (enemy.distanceToPlayer < detectR) {
    moveTowards(enemy, playerPos.x, playerPos.y);
    attemptAttack(enemy);
  }
}


function handlePatrolOrAggroBehavior(enemy) {
  if (!enemy || typeof enemy.distanceToPlayer !== 'number' || !enemy.center) return;

  const playerPos = getPlayerCenter();
  if (!playerPos) return;

  if (enemy.distanceToPlayer < detectR) {
    moveTowards(enemy, playerPos.x, playerPos.y);
    attemptAttack(enemy);
    return;
  }

  // Basic patrol logic
  const patrol = enemy.patrolPoints?.[enemy.patrolIndex];
  if (!patrol) return;

  moveTowards(enemy, patrol.x, patrol.y);

  const closeEnough = Math.abs(enemy.x - patrol.x) < 2 && Math.abs(enemy.y - patrol.y) < 2;
  if (closeEnough) {
    enemy.patrolIndex = (enemy.patrolIndex + 1) % enemy.patrolPoints.length;
  }
}

function attemptAttack(enemy) {
  const now = Date.now();
  if (now - enemy.lastAttackTime < enemy.attackCooldown) return;

  const playerPos = getPlayerCenter();
  if (!playerPos) return;

  const dx = playerPos.x - enemy.center.x;
  const dy = playerPos.y - enemy.center.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance <= enemy.attackRange) {
    enemy.lastAttackTime = now;

    // Only using damage type and amount as per your function definition
    damagePixelbot("normal", enemy.damage);

    console.log(`${enemy.name} attacked! Dealt ${enemy.damage} normal damage.`);
  }
}


const dmgColors = {
  burn: 'orange',
  poison: 'green',
  bleed: 'red',
  cold: 'blue',
  critical: 'white',
  normal: 'grey',
  default: 'gray'
};

let isSlowed = false;

function damagePixelbot(dmgType, amount) {
  // Apply instant damage (normal, critical, etc.)
  if (['normal', 'critical'].includes(dmgType) || !['burn', 'bleed', 'poison', 'cold'].includes(dmgType)) {
    applyDirectDamage(amount, dmgType);
  }

  // Handle DOT effects
  if (dmgType === 'burn') {
    applyDOT(3, 400, Math.floor(amount / 3), 'burn');
  } else if (dmgType === 'bleed') {
    applyDOT(5, 800, Math.floor(amount / 5), 'bleed');
  } else if (dmgType === 'poison') {
    applyDOT(7, 1000, Math.floor(amount / 7), 'poison');
  } else if (dmgType === 'cold') {
    applySlow(2000);
    applyDirectDamage(amount, 'cold');
  }

  console.log(`Player took ${amount} ${dmgType} damage.`);
}

function applyDirectDamage(amount, type) {
  pixelbotStats.health = Math.max(0, pixelbotStats.health - amount);

  // Update health UI
  const healthSpan = document.getElementById("pixelbotHealth");
  if (healthSpan) {
    healthSpan.innerText = `Health: ${pixelbotStats.health}`;
  }

  // Show damage splash
  const splash = document.createElement('div');
  splash.textContent = `-${amount}`;
  splash.style.position = 'absolute';
  splash.style.left = `${collisionBox.x}px`;
  splash.style.top = `${collisionBox.y - 20}px`;
  splash.style.color = dmgColors[type] || dmgColors.default;
  splash.style.fontWeight = 'bold';
  splash.style.zIndex = 1000;
  splash.style.pointerEvents = 'none';
  document.body.appendChild(splash);

  splash.animate([
    { transform: 'translateY(0)', opacity: 1 },
    { transform: 'translateY(-30px)', opacity: 0 }
  ], {
    duration: 800,
    easing: 'ease-out'
  }).onfinish = () => splash.remove();

  // Flash effect
  const pixelb8 = document.getElementById('pixelb8');
  const flashColor = dmgColors[type] || dmgColors.default;
  if (pixelb8) {
    pixelb8.style.filter = `drop-shadow(0 0 10px ${flashColor})`;
    setTimeout(() => {
      pixelb8.style.filter = '';
    }, 100);
  }
}

function applyDOT(ticks, interval, damagePerTick, type) {
  let tickCount = 0;
  const dot = setInterval(() => {
    if (tickCount++ >= ticks) {
      clearInterval(dot);
    } else {
      applyDirectDamage(damagePerTick, type);
    }
  }, interval);
}

function applySlow(duration) {
  if (isSlowed) return;
  isSlowed = true;

  // Hook into your movement system here (e.g. reduce speed multiplier)
  console.log("Player slowed!");

  setTimeout(() => {
    isSlowed = false;
    console.log("Slow ended.");
  }, duration);
}

// Create and animate the damage radius visual effect
function showRadiusEffect(amount, x, y, hitSomething) {
  const hitRadius = 50;
  const radiusEl = document.createElement('div');

  const intensity = Math.min(1, Math.max(0.2, amount / 10));
  const red = Math.floor(255 * intensity);
  const grey = Math.floor(255 * (1 - intensity));

  const bgOpacity = hitSomething ? 0.2 : 0.05;
  const borderOpacity = hitSomething ? 0.4 : 0.1;

  radiusEl.style.position = 'absolute';
  radiusEl.style.left = `${x - hitRadius}px`;
  radiusEl.style.top = `${y - hitRadius}px`;
  radiusEl.style.width = `${hitRadius * 2}px`;
  radiusEl.style.height = `${hitRadius * 2}px`;
  radiusEl.style.borderRadius = '50%';
  radiusEl.style.backgroundColor = `rgba(${red}, ${grey}, ${grey}, ${bgOpacity})`;
  radiusEl.style.border = `2px solid rgba(${red}, ${grey}, ${grey}, ${borderOpacity})`;
  radiusEl.style.pointerEvents = 'none';
  radiusEl.style.zIndex = 9998;
  radiusEl.style.opacity = '0';
  radiusEl.style.transform = 'scale(0.5)';
  radiusEl.style.transition = 'opacity 0.8s ease-out, transform 0.5s ease-out';

  document.body.appendChild(radiusEl);

  requestAnimationFrame(() => {
    radiusEl.style.opacity = '1';
    radiusEl.style.transform = 'scale(1.3)';
  });

  setTimeout(() => {
    radiusEl.style.opacity = '0';
  }, 400);

  setTimeout(() => {
    radiusEl.remove();
  }, 1000);
}

function showSplashDamage(amount, enemy) {
  const el = document.getElementById(enemy.id);
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const offsetX = -30;   // Add positive/negative pixels to move left/right
  const offsetY = -20; // Add pixels to move up/down (e.g., -20 to float above)

  const x = rect.left + rect.width / 2 + offsetX;
  const y = rect.top + offsetY;

  const damageEl = document.createElement('div');
  damageEl.textContent = `-${amount.toFixed(0)}`;
  damageEl.style.position = 'fixed'; // use fixed so it doesn't get offset by scroll
  damageEl.style.left = `${x}px`;
  damageEl.style.top = `${y}px`;
  damageEl.style.transform = 'translate(-50%, 0)';
  damageEl.style.fontWeight = 'bold';
  damageEl.style.fontSize = '20px';
  damageEl.style.color = 'red';
  damageEl.style.pointerEvents = 'none';
  damageEl.style.zIndex = 9999;
  damageEl.style.opacity = '1';
  damageEl.style.transition = 'transform 0.8s ease-out, opacity 0.8s ease-out';

  document.body.appendChild(damageEl);

  requestAnimationFrame(() => {
    damageEl.style.transform = 'translate(-50%, -40px)';
    damageEl.style.opacity = '0';
  });

  setTimeout(() => {
    damageEl.remove();
  }, 1000);
}







function dropEnemyLoot(enemy, x, y) {
  const lootTable = lootTables[enemy.name];
  if (!lootTable) {
    console.warn(`No loot table found for enemy: ${enemy.name}`);
    return;
  }
  lootTable.forEach(item => {
    if (Math.random() < item.chance) {
      let quantity = 1;
      if (Array.isArray(item.quantity)) {
        const [min, max] = item.quantity;
        quantity = Math.floor(Math.random() * (max - min + 1)) + min;
      }
      console.log(`💀 ${enemy.name} dropped ${quantity}x ${item.name} at (${x}, ${y})`);
      dropItemByName(item.name, x, y, quantity);
    }
  });
}

function unalive(enemy, x, y) {
  console.log(`💀 ${enemy.name} Unalived!💀`);
  dropEnemyLoot(enemy, x, y);
}

function applyDamageRadius(amount, x, y) {
  const hitRadius = 50;
  const enemies = maps[currentMap]?.entities?.filter(e => e.type === 'enemy');
  if (!enemies?.length) return;

  let hitSomething = false;
  let anyDied = false;

  for (const enemy of enemies) {
    const centerX = enemy.center?.x ?? (enemy.x + (enemy.width || 32) / 2);
    const centerY = enemy.center?.y ?? (enemy.y + (enemy.height || 32) / 2);

    const dx = centerX - x;
    const dy = centerY - y;
    const distance = Math.hypot(dx, dy);

    if (distance <= hitRadius) {
      hitSomething = true;
      enemy.health -= amount;

      console.log(`Hit! Dealt ${amount} to ${enemy.name}`);
      console.log(`Hit ${enemy.name}! Remaining HP: ${enemy.health.toFixed(1)}`);

      showSplashDamage(amount, enemy);
      damageEffect("wobble", enemy);

      if (enemy.health <= 0) {
        enemy.health = 0;
        enemy.state = 'dead';
        console.log(`${enemy.name} defeated!`);
		console.log(`X/Y:${enemy.x}/${enemy.y}`);
        // ✅ Optional: spawn loot
		// dropItemByName("Goblin Tooth", enemy.x, enemy.y);
		unalive(enemy, enemy.x, enemy.y);
        // ✅ Remove from entity list
        maps[currentMap].entities = maps[currentMap].entities.filter(e => e !== enemy);
        anyDied = true;
      }
    }
  }

  if (anyDied) {
    renderEntities(); // Re-render only if one or more died
  }

  // Optional visual effect on hit
  // showRadiusEffect(amount, x, y, hitSomething);
}

function damageEffect(effect, enemy, persistent = false) {
  const el = document.getElementById(enemy.id);
  if (!el) return;

  el.classList.remove('wobble', 'squash', 'cold', 'burning', 'hurt');

  if (persistent) {
    if (effect === 'cold' || effect === 'burning') {
      el.classList.add(effect);
      return; // persistent effect stays until manually removed
    }
  }

  switch (effect) {
    case 'wobble':
    case 'squash':
    case 'hurt':
      el.classList.add(effect);
      setTimeout(() => {
        el.classList.remove(effect);
      }, 1500);
      break;

    case 'cold':
    case 'burning':
      el.classList.add(effect);
      setTimeout(() => {
        el.classList.remove(effect);
      }, 4000);
      break;

    default:
      el.classList.add('hurt');
      setTimeout(() => {
        el.classList.remove('hurt');
      }, 4500);
      break;
  }
}

function throwHeldItem(targetX, targetY) {
  if (!heldItem) return;

  const playerEl = document.getElementById('pixelb8');
  const gameArea = document.getElementById('gameArea');
  if (!playerEl || !gameArea) {
    console.warn('Player or game area not found!');
    return;
  }

  const playerX = parseFloat(playerEl.style.left) + playerEl.offsetWidth / 2;
  const playerY = parseFloat(playerEl.style.top) + playerEl.offsetHeight / 2;

  const flyEl = document.createElement('div');
  flyEl.classList.add('flying-item');
  flyEl.textContent = heldItem.icon || '❓';
  flyEl.style.position = 'absolute';
  flyEl.style.left = `${playerX}px`;
  flyEl.style.top = `${playerY}px`;
  flyEl.style.fontSize = '28px';
  flyEl.style.pointerEvents = 'none';
  flyEl.style.zIndex = 9999;
  gameArea.appendChild(flyEl);

  const duration = 1000;
  const startTime = performance.now();

  const deltaX = targetX - playerX;
  const deltaY = targetY - playerY;
  const arcHeight = -150;

  const offset = { x: 8, y: 8 }; // fine-tuning tweak

  function animate(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const currentX = playerX + deltaX * progress;
    const peakY = playerY + arcHeight;
    const currentY =
      (1 - progress) ** 2 * playerY +
      2 * (1 - progress) * progress * peakY +
      progress ** 2 * targetY;

    flyEl.style.left = `${currentX}px`;
    flyEl.style.top = `${currentY}px`;
    flyEl.style.transform = `rotate(${720 * progress}deg)`;

    if (progress < 1) {
      requestAnimationFrame(animate);
    } else {
      // ✅ Correct: use currentX/currentY and element size for map-local center
      const itemWidth = flyEl.offsetWidth;
      const itemHeight = flyEl.offsetHeight;

      const localX = currentX + itemWidth / 2 + offset.x;
      const localY = currentY + itemHeight / 2 + offset.y;

      // Damage calculation based on item type
      const itemName = heldItem.name.toLowerCase();
      let damage = 0;

      if (itemName.includes('apple')) {
        damage = Math.random();
      } else if (itemName.includes('wrench')) {
        damage = 1 + Math.random();
      } else if (itemName.includes('axe') || itemName.includes('hatchet')) {
        damage = 8 + Math.random() * 8;
      } else if (itemName.includes('pickle')) {
        damage = 0.2 + Math.random() * 0.3;
      } else {
        damage = 0.5;
      }

      applyDamageRadius(damage, localX, localY);

      flyEl.style.opacity = '0';
      setTimeout(() => flyEl.remove(), 300);

      if (heldItem.quantity > 1) {
        heldItem.quantity -= 1;
      } else {
        heldItem = null;
      }

      renderInventory();
    }
  }

  requestAnimationFrame(animate);
}


function updateHealthDisplay() {
  const healthSpan = document.getElementById("pixelbotHealth");
  if (healthSpan) {
    healthSpan.innerText = `Health: ${pixelbotStats.Health}`;
  }
}


function renderEntities() {
  const gameArea = document.getElementById("gameArea");

  // Remove all existing enemies first
  document.querySelectorAll(".enemy").forEach(e => e.remove());

  const entities = maps[currentMap]?.entities;
  if (!entities) return;

  entities.forEach(enemy => {
    if (enemy.type !== 'enemy') return;

    const enemyDiv = document.createElement("div");
    enemyDiv.classList.add("enemy");
    enemyDiv.id = enemy.id;
    enemyDiv.style.position = "absolute";
    enemyDiv.style.left = `${enemy.x}px`;
    enemyDiv.style.top = `${enemy.y}px`;
    enemyDiv.style.textAlign = "center";

    // 💾 Store useful info as data-attributes
    enemyDiv.dataset.health = enemy.health;
    enemyDiv.dataset.maxHealth = enemy.maxHealth;
    enemyDiv.dataset.speed = enemy.speed;
    enemyDiv.dataset.baseSpeed = enemy.baseSpeed;
    enemyDiv.dataset.damage = enemy.damage;
    enemyDiv.dataset.range = enemy.attackRange;
    enemyDiv.dataset.state = enemy.state;
    enemyDiv.dataset.behavior = enemy.behavior;
	// ➕ Add x, y, and id for easy access
	enemyDiv.dataset.x = enemy.x;
	enemyDiv.dataset.y = enemy.y;
	enemyDiv.dataset.id = enemy.id;
    // Add sprite image
    const spriteImg = document.createElement("img");
    const direction = (enemy.direction === 'idle' || !enemy.spriteSet[enemy.direction])
      ? enemy.lastDirection || 'down_right'
      : enemy.direction;

    enemy.lastDirection = direction;

    spriteImg.src = enemy.spriteSet[direction] || enemy.spriteSet.down_right;
    spriteImg.alt = enemy.name;
    spriteImg.style.width = "32px";
    spriteImg.style.height = "32px";
    enemyDiv.appendChild(spriteImg);

    // Add enemy name under sprite
    const nameTag = document.createElement("div");
    nameTag.textContent = enemy.name;
    nameTag.style.fontSize = "12px";
    nameTag.style.color = "#00baff";
    nameTag.style.textShadow = "0 0 2px black";
    nameTag.style.marginTop = "2px";
    enemyDiv.appendChild(nameTag);

    gameArea.appendChild(enemyDiv);
  });
}

// Call this once on page load or script load
populateEnemySelect();
//bottom of script
if (!window.entityBehaviorInterval) {
  window.entityBehaviorInterval = setInterval(updateEntityBehaviors, 200);
  

}