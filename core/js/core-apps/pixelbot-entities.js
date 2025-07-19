let npcsByMap = {};
let enemiesByMap = {};
let petsByMap = {};
function clearNPCs() {
  for (const map in npcsByMap) {
    npcsByMap[map] = [];
  }
}

function clearEnemies() {
  for (const map in enemiesByMap) {
    enemiesByMap[map] = [];
  }
}

function clearPets() {
  for (const map in petsByMap) {
    petsByMap[map] = [];
  }
}

function ensureEntitiesArray(mapName) {
  if (!maps[mapName].entities) {
    maps[mapName].entities = [];
    console.log(`Initialized empty entities array for map: ${mapName}`);
  }
}

function debugAddTestNPC() {
  ensureEntitiesArray(currentMap);
  const npc = {
    id: `npc_${Date.now()}`,
    name: 'Test NPC',
    type: 'npc',
    x: player.x + 1,
    y: player.y,
    map: currentMap
  };
  maps[currentMap].entities.push(npc);
  console.log('Added NPC:', npc);
  renderEntities();
}

function debugAddTestEnemy() {
  ensureEntitiesArray(currentMap);
  const enemy = {
    id: `enemy_${Date.now()}`,
    name: 'Test Enemy',
    type: 'enemy',
    x: player.x + 2,
    y: player.y,
    map: currentMap,
    behavior: 'aggro',
    aggroRange: 100,
    speed: 1,
    targetId: 'player', // could be used to follow the player
  };
  maps[currentMap].entities.push(enemy);
  console.log('Added Enemy:', enemy);
  renderEntities();
}
function debugAddPatrolEnemy() {
  ensureEntitiesArray(currentMap);
  const enemy = {
    id: `enemy_${Date.now()}`,
    name: 'Patrol Bot',
    type: 'enemy',
    x: player.x,
    y: player.y,
    behavior: 'patrol',
    speed: 1,
    patrolPoints: [
      { x: player.x, y: player.y },
      { x: player.x + 100, y: player.y },
      { x: player.x + 100, y: player.y + 100 },
      { x: player.x, y: player.y + 100 }
    ],
    patrolIndex: 0
  };
  maps[currentMap].entities.push(enemy);
  console.log('Added Patrol Enemy:', enemy);
  renderEntities();
}
function debugAddTestPet() {
  ensureEntitiesArray(currentMap);
  const pet = {
    id: `pet_${Date.now()}`,
    name: 'Test Pet',
    type: 'pet',
    x: player.x - 1,
    y: player.y,
    map: currentMap,
    behavior: 'follow',
    followDistance: 50,
    speed: 1,
    targetId: 'player',
  };
  maps[currentMap].entities.push(pet);
  console.log('Added Pet:', pet);
  renderEntities();
}

function addSneakyGoblin(mapName) {
  const goblin = {
    id: `enemy_goblin_${Date.now()}`,
    name: 'Sneaky Goblin',
    type: 'enemy',
    icon: '👺',
    x: 150,
    y: 220,
    health: 30,
    maxHealth: 30,
    damage: 5,
    behavior: 'sneaky' // optional AI behavior tag
  };

  if (!maps[mapName].entities) {
    maps[mapName].entities = [];
  }

  maps[mapName].entities.push(goblin);
  if (mapName === currentMap) renderEntities(); // optional update
}


function updateEntityBehaviors() {
  const entities = maps[currentMap].entities;
  if (!entities) return;

  entities.forEach(ent => {
    switch (ent.behavior) {
      case 'aggro':
        handleAggroBehavior(ent);
        break;
      case 'follow':
        handleFollowBehavior(ent);
        break;
      case 'patrol':
        handlePatrolBehavior(ent);
        break;
    }
  });

  renderEntities();
}


function handlePatrolBehavior(ent) {
  if (!ent.patrolPoints || ent.patrolPoints.length === 0) return;

  const point = ent.patrolPoints[ent.patrolIndex];
  const dx = point.x - ent.x;
  const dy = point.y - ent.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < 5) {
    // Reached point, move to next
    ent.patrolIndex = (ent.patrolIndex + 1) % ent.patrolPoints.length;
  } else {
    // Move toward current patrol point
    const angle = Math.atan2(dy, dx);
    ent.x += Math.cos(angle) * ent.speed;
    ent.y += Math.sin(angle) * ent.speed;
  }
}

function handleAggroBehavior(ent) {
  const target = player;
  const dx = target.x - ent.x;
  const dy = target.y - ent.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance < ent.aggroRange) {
    const angle = Math.atan2(dy, dx);
    ent.x += Math.cos(angle) * ent.speed;
    ent.y += Math.sin(angle) * ent.speed;
  }
}
function handleFollowBehavior(ent) {
  const target = player;
  const dx = target.x - ent.x;
  const dy = target.y - ent.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance > ent.followDistance) {
    const angle = Math.atan2(dy, dx);
    ent.x += Math.cos(angle) * ent.speed;
    ent.y += Math.sin(angle) * ent.speed;
  }
}
function renderEntities() {
  // Clear existing entities
  document.querySelectorAll(".entity").forEach(el => el.remove());

  const map = maps[currentMap];
  if (!map?.entities) return;

  map.entities.forEach(ent => {
    const el = document.createElement('div');
    el.classList.add('entity', `entity-${ent.type}`);
    el.id = ent.id;
    el.style.position = 'absolute';
    el.style.left = `${ent.x}px`;
    el.style.top = `${ent.y}px`;
    el.style.transform = 'translate(-50%, -100%)';
    el.style.zIndex = '20'; // Above placed items
    el.style.cursor = 'pointer';
    el.style.userSelect = 'none';
    el.title = ent.name;

    // Choose icon per type
    const iconMap = {
      npc: '👤',
      enemy: '💀',
      pet: '🐾'
    };

    el.textContent = ent.icon || iconMap[ent.type] || '❓';
    el.dataset.type = ent.type;

    // Click interaction (optional)
    el.addEventListener('click', () => {
      alert(`${ent.name} (${ent.type}) clicked!`);
    });

    gameArea.appendChild(el);
  });
}


if (!window.entityBehaviorInterval) {
  window.entityBehaviorInterval = setInterval(updateEntityBehaviors, 200);
}