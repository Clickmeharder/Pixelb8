const maps = {
  house: {
    name: "Pixelbot's House",
    obstacles: [
      { x: 0, y: 0, width: 800, height: 25 }, // top wall
      { x: 0, y: 575, width: 800, height: 25 }, // bottom wall
      { x: 0, y: 0, width: 25, height: 600 }, // left wall
      { x: 750, y: 0, width: 25, height: 600 }, // right wall
      { x: 375, y: 550, width: 50, height: 50, isExit: true, direction: "down", target: "street" }
    ],
	placedItems: [

    ],
    startX: 365,
    startY: 525
  },
  street: {
    name: "Outside",
    obstacles: [
      { x: 0, y: 0, width: 800, height: 25 }, // top wall
      { x: 0, y: 575, width: 800, height: 25 }, // bottom wall
      { x: 0, y: 0, width: 25, height: 600 }, // left wall
      { x: 750, y: 0, width: 25, height: 600 }, // right wall
      { x: 375, y: 0, width: 25, height: 50, isExit: true, direction: "up", target: "house" }
    ],
    placedItems: [],
    startX: 325,
    startY: 50
  }
};

let currentMap = "house";
let player = { x: 350, y: 300 };

// Load and setup map
function loadMap(mapName) {
  const map = maps[mapName];
  currentMap = mapName;
  collisionBox.x = map.startX;
  collisionBox.y = map.startY;

  renderObstacles(map.obstacles);
  renderPlacedItems(map.placedItems);
  renderDroppedItems();
  updateSpritePosition();
  updateDebugOverlay(map.obstacles);
}

// Render obstacles
function renderObstacles(obstacles) {
  document.querySelectorAll(".obstacle").forEach(el => el.remove());

  obstacles.forEach(obs => {
    const div = document.createElement('div');
    div.classList.add('obstacle');
    div.style.position = 'absolute';
    div.style.left = `${obs.x}px`;
    div.style.top = `${obs.y}px`;
    div.style.width = `${obs.width}px`;
    div.style.height = `${obs.height}px`;

    if (obs.type === 'storage') {
      div.classList.add('storage-unit');
      div.id = 'storage-object';
      div.style.backgroundColor = '#88c0d080';
      div.style.border = '2px solid #5e81ac';
      div.title = 'Storage Unit';
      div.style.zIndex = '2';
    } else {
      div.style.backgroundColor = obs.isExit ? '#00ffff88' : '#0066ff88';
      div.style.border = obs.isExit ? '2px dashed #00ffff' : 'none';
      div.style.zIndex = '1';
    }

    div.style.pointerEvents = 'none';
    gameArea.appendChild(div);
  });
}
function renderDroppedItems() {
  document.querySelectorAll('.dropped-item').forEach(el => el.remove());
  console.log('renderDroppedItems Ran')
  const droppedItems = droppedItemsByMap[currentMap];

  droppedItems.forEach((item, index) => {
    const container = document.createElement('div');
    container.classList.add('dropped-item');
    container.style.position = 'absolute';
    container.style.left = `${item.x}px`;
    container.style.top = `${item.y}px`;
    container.style.cursor = 'pointer';
    container.style.userSelect = 'none';
    container.style.textAlign = 'center';
    container.style.zIndex = '10';
    container.style.transform = 'translate(-50%, -100%)';

    if (item.size) container.dataset.size = item.size;

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('dropped-item-icon');
    iconSpan.textContent = item.icon || '❓';

    const label = document.createElement('div');
    label.classList.add('dropped-item-label');
    label.textContent = `${item.name} x${item.quantity}`;

    container.appendChild(iconSpan);
    container.appendChild(label);

    container.title = '${item.name} x${item.quantity}';
    container.dataset.id = item.id;

    gameArea.appendChild(container);
  });
}
function renderPlacedItems(items) {
  console.log('renderPlacedItems Ran')
  document.querySelectorAll(".placed-item").forEach(el => el.remove());

  const playerY = player.y; // <- your in-game Y position

  items.forEach(item => {
    const el = document.createElement('div');
    el.classList.add("placed-item");
    el.id = item.id;
    el.style.position = 'absolute';
    el.style.left = `${item.x}px`;
    el.style.top = `${item.y}px`;
    el.style.fontSize = item.size === 'large' ? '42px' : item.size === 'small' ? '18px' : '22px';
    el.textContent = item.icon || '?';
    el.title = `${item.name} x${item.quantity || 1}`;

    // Compare item Y with player Y to decide z-index
    if (item.y < playerY) {
      el.style.zIndex = '10'; // behind player
    } else {
      el.style.zIndex = '30'; // in front of player
    }

    gameArea.appendChild(el);
  });
}




gameArea.addEventListener('dragover', (e) => {
  e.preventDefault();  // Allow drop
  e.dataTransfer.dropEffect = 'move';
});

gameArea.addEventListener('drop', (e) => {
  e.preventDefault();
  const data = e.dataTransfer.getData('text/plain');
  
  if (!data) return;

  let parsed;
  try {
    parsed = JSON.parse(data);
  } catch {
    alert('Invalid item data dropped');
    return;
  }

  const itemId = parsed.id;
  const quantity = parsed.quantity || 1;

  const rect = gameArea.getBoundingClientRect();
  const dropX = e.clientX - rect.left;
  const dropY = e.clientY - rect.top;

  dropItemAtPosition(itemId, quantity, dropX, dropY);
});