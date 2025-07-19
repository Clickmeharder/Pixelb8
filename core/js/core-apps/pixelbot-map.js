const maps = {
  roomA: {
    name: "Room A",
    obstacles: [
      { x: 0, y: 0, width: 800, height: 25 },
      { x: 0, y: 575, width: 800, height: 25 },
      { x: 0, y: 0, width: 25, height: 600 },
      { x: 775, y: 0, width: 25, height: 600 },
      { x: 375, y: 550, width: 50, height: 50, isExit: true, direction: "down", target: "lake" }
    ],
    placedItems: [
      {
        id: 'Roomfish1',
        name: 'Fish',
        icon: '🐟',
        size: 'tiny',
        quantity: 1,
        x: 360,
        y: 350,
        collisionBox: { x: 360, y: 350, width: 20, height: 20 }
      }
    ],
    startX: 100,
    startY: 300
  },
  house: {
    name: "Pixelbot's House",
    obstacles: [
      { x: 0, y: 0, width: 800, height: 25 },
      { x: 0, y: 575, width: 800, height: 25 },
      { x: 0, y: 0, width: 25, height: 600 },
      { x: 750, y: 0, width: 25, height: 600 },
      { x: 375, y: 550, width: 50, height: 50, isExit: true, direction: "down", target: "garden" }
    ],
    placedItems: [
      {
        id: 'box1',
        name: 'Box',
        icon: '📦',
        size: 'large',
        quantity: 1,
        x: 300,
        y: 200,
        collisionBox: { x: 300, y: 200, width: 44, height: 44 }
      }
	],
    startX: 365,
    startY: 525
  },
  roomC: {
    name: "Whispering Room",
    obstacles: [
      { x: 0, y: 0, width: 800, height: 25 },
      { x: 0, y: 575, width: 800, height: 25 },
      { x: 0, y: 0, width: 25, height: 600 },
      { x: 750, y: 0, width: 25, height: 600 },
      { x: 375, y: 550, width: 50, height: 50, isExit: true, direction: "down", target: "forest" }
    ],
    placedItems: [
      {
        id: 'tree1',
        name: 'Tree',
        icon: '🌳',
        size: 'large',
        quantity: 1,
        x: 300,
        y: 200,
        collisionBox: { x: 300, y: 200, width: 44, height: 44 }
      },
      {
        id: 'tree2',
        name: 'Tree',
        icon: '🌲',
        size: 'large',
        quantity: 1,
        x: 500,
        y: 250,
        collisionBox: { x: 500, y: 250, width: 44, height: 44 }
      }
    ],
    startX: 100,
    startY: 300
  },
  lake: {
    name: "Crystal Lake",
    obstacles: [
      { x: 0, y: 0, width: 800, height: 25 },
      { x: 0, y: 575, width: 800, height: 25 },
      { x: 0, y: 0, width: 25, height: 600 },
      { x: 750, y: 0, width: 25, height: 600 },
	  { x: 375, y: 0, width: 50, height: 50, isExit: true, direction: "up", target: "roomA" },
      { x: 725, y: 300, width: 50, height: 50, isExit: true, direction: "right", target: "garden" }
    ],
    placedItems: [
      {
        id: 'lakefish2',
        name: 'Fish',
        icon: '🐟',
        size: 'tiny',
        quantity: 1,
        x: 360,
        y: 350,
        collisionBox: { x: 360, y: 350, width: 20, height: 20 }
      }
    ],
    startX: 100,
    startY: 300
  },
  garden: {
    name: "garden",
    obstacles: [
      { x: 0, y: 0, width: 800, height: 25 },
      { x: 0, y: 575, width: 800, height: 25 },
      { x: 0, y: 0, width: 25, height: 600 },
      { x: 750, y: 0, width: 25, height: 600 },
      { x: 375, y: 0, width: 50, height: 50, isExit: true, direction: "up", target: "house" },
      { x: 725, y: 300, width: 50, height: 50, isExit: true, direction: "right", target: "forest" },
      { x: 0, y: 300, width: 50, height: 50, isExit: true, direction: "left", target: "lake" },
      { x: 375, y: 550, width: 50, height: 50, isExit: true, direction: "down", target: "cave" }
    ],
    placedItems: [],
    startX: 325,
    startY: 50
  },
  forest: {
    name: "Whispering Forest",
    obstacles: [
      { x: 0, y: 0, width: 800, height: 25 },
      { x: 0, y: 575, width: 800, height: 25 },
      { x: 0, y: 0, width: 25, height: 600 },
      { x: 750, y: 0, width: 25, height: 600 },
	  { x: 375, y: 0, width: 50, height: 50, isExit: true, direction: "up", target: "roomC" },
      { x: 0, y: 300, width: 50, height: 50, isExit: true, direction: "left", target: "garden" },
	  { x: 375, y: 550, width: 50, height: 50, isExit: true, direction: "down", target: "town" }
    ],
    placedItems: [
      {
        id: 'tree3',
        name: 'Tree',
        icon: '🌳',
        size: 'large',
        quantity: 1,
        x: 300,
        y: 200,
        collisionBox: { x: 300, y: 200, width: 44, height: 44 }
      },
      {
        id: 'tree4',
        name: 'Tree',
        icon: '🌲',
        size: 'large',
        quantity: 1,
        x: 500,
        y: 250,
        collisionBox: { x: 500, y: 250, width: 44, height: 44 }
      }
    ],
    startX: 100,
    startY: 300
  },
  roomG: {
    name: "unused area",
    obstacles: [
      { x: 0, y: 0, width: 800, height: 25 },
      { x: 0, y: 575, width: 800, height: 25 },
      { x: 0, y: 0, width: 25, height: 600 },
      { x: 750, y: 0, width: 25, height: 600 },
      { x: 375, y: 0, width: 50, height: 50, isExit: true, direction: "up", target: "house" },
	  { x: 725, y: 300, width: 50, height: 50, isExit: true, direction: "right", target: "cave" }
    ],
    placedItems: [
      {
        id: 'rock1',
        name: 'Rock',
        icon: '🪨',
        size: 'normal',
        quantity: 1,
        x: 400,
        y: 300,
        collisionBox: { x: 400, y: 300, width: 32, height: 32 }
      }
    ],
    startX: 375,
    startY: 525
  },
  cave: {
    name: "Mossy Cave",
    obstacles: [
      { x: 0, y: 0, width: 800, height: 25 },
      { x: 0, y: 575, width: 800, height: 25 },
      { x: 0, y: 0, width: 25, height: 600 },
      { x: 750, y: 0, width: 25, height: 600 },
      { x: 375, y: 0, width: 50, height: 50, isExit: true, direction: "up", target: "garden" }
    ],
    placedItems: [
      {
        id: 'rock2',
        name: 'Rock',
        icon: '🪨',
        size: 'normal',
        quantity: 1,
        x: 400,
        y: 300,
        collisionBox: { x: 400, y: 300, width: 32, height: 32 }
      }
    ],
    startX: 375,
    startY: 525
  },
  town: {
    name: "Town",
    obstacles: [
      { x: 0, y: 0, width: 800, height: 25 },
      { x: 0, y: 575, width: 800, height: 25 },
      { x: 0, y: 0, width: 25, height: 600 },
      { x: 750, y: 0, width: 25, height: 600 },
      { x: 375, y: 0, width: 50, height: 50, isExit: true, direction: "up", target: "forest" }
    ],
    placedItems: [
      {
        id: 'rock3',
        name: 'Rock',
        icon: '🪨',
        size: 'normal',
        quantity: 1,
        x: 400,
        y: 300,
        collisionBox: { x: 400, y: 300, width: 32, height: 32 }
      }
    ],
    startX: 375,
    startY: 525
  }

};

const roomPositions = {
  roomA: { row: 1, col: 1 },
  house: { row: 1, col: 2 },
  roomC: { row: 1, col: 3 },
  lake: { row: 2, col: 1 },
  garden: { row: 2, col: 2 },
  forest: { row: 2, col: 3 },
  roomG: { row: 3, col: 1 },
  cave: { row: 3, col: 2 },
  town: { row: 3, col: 3 },
};

let currentMap = "house";
let player = { x: 350, y: 300 };
function getSavedOrDefaultPlacedItems(mapName) {
  const key = `placedItems_${mapName}`;
  const saved = localStorage.getItem(key);
  const defaultItems = maps[mapName]?.placedItems || [];
  if (saved) {
    console.log(`[Map: ${mapName}] Loaded saved placedItems from localStorage.`);
    return JSON.parse(saved);
  } else {

    if (!maps[mapName]) {
      console.warn(`[Map: ${mapName}] WARNING: Map not found in maps object.`);
    } else if (defaultItems.length === 0) {
      console.warn(`[Map: ${mapName}] No default placedItems found.`);
    } else {
      console.log(`[Map: ${mapName}] No saved placedItems. Using default items from maps and saving to localStorage.`);
      console.table(defaultItems);
    }

    const clonedDefaults = JSON.parse(JSON.stringify(defaultItems)); // avoid mutation
    localStorage.setItem(key, JSON.stringify(clonedDefaults));
    return clonedDefaults;
  }
}


// Load and setup map
function updateMapDisplay(mapName) {
  const mapDisplay = document.getElementById('mapDisplay');
  mapDisplay.textContent = `Map: ${mapName}`;
  updateWorldMapList(); // Refresh map list with current highlight
}
function updateMiniMap(mapName) {
  const mapDisplay = document.getElementById('mapDisplay');
  const miniMap = document.getElementById('miniMap');

  mapDisplay.innerHTML = `🗺️ Map: ${mapName}`;
  miniMap.innerHTML = '';

  Object.entries(roomPositions).forEach(([name, pos]) => {
    const roomDiv = document.createElement('div');
    roomDiv.classList.add('mini-room');
    if (name === mapName) {
      roomDiv.classList.add('current');
    }

    roomDiv.textContent = name.slice(0, 6); // Short name

    // Positioning using grid-area
    roomDiv.style.gridRowStart = pos.row;
    roomDiv.style.gridColumnStart = pos.col;

    miniMap.appendChild(roomDiv);
  });
}
function toggleWorldMap() {
  const modal = document.getElementById('worldMapModal');
  modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
}

function updateWorldMapList() {
  const list = document.getElementById('worldMapList');
  list.innerHTML = '';

  Object.entries(maps).forEach(([key, map]) => {
    const li = document.createElement('li');
    li.textContent = `${map.name || key}`;

    if (key === currentMap) {
      li.classList.add('current-map');
      li.textContent += ' ← You are here';
    }

    list.appendChild(li);
  });
}
function loadMap(mapName) {
  const map = maps[mapName];
  currentMap = mapName;
  collisionBox.x = map.startX;
  collisionBox.y = map.startY;
  placedItems = getSavedOrDefaultPlacedItems(mapName); // <- from above
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
	updateMapDisplay(currentMap);
	updateMiniMap(currentMap);
  });
}
function renderDroppedItems() {
  const mergeThreshold = 10;

  // Clear previous DOM elements
  document.querySelectorAll('.dropped-item, .dropped-item-label-wrapper').forEach(el => el.remove());
  console.log('renderDroppedItems Ran');

  const originalItems = droppedItemsByMap[currentMap];
  const mergedItems = [];

  // Merge logic
  originalItems.forEach(item => {
    let merged = false;

    for (let other of mergedItems) {
      const sameType = item.name === other.name && item.icon === other.icon;
      const dx = item.x - other.x;
      const dy = item.y - other.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (sameType && distance <= mergeThreshold) {
        // Merge items
        other.quantity += item.quantity;
        // Average position
        other.x = Math.round((other.x + item.x) / 2);
        other.y = Math.round((other.y + item.y) / 2);
        merged = true;
        break;
      }
    }

    if (!merged) {
      mergedItems.push({ ...item }); // clone the item
    }
  });

  // Render merged items
  mergedItems.forEach(item => {
    // Icon container
    const iconContainer = document.createElement('div');
    iconContainer.classList.add('dropped-item');
    iconContainer.style.position = 'absolute';
    iconContainer.style.left = `${item.x}px`;
    iconContainer.style.top = `${item.y}px`;
    iconContainer.style.cursor = 'pointer';
    iconContainer.style.userSelect = 'none';
    iconContainer.style.textAlign = 'center';
    iconContainer.style.zIndex = '10';
    iconContainer.style.transform = 'translate(-50%, -100%)';

    if (item.size) iconContainer.dataset.size = item.size;

    const iconSpan = document.createElement('span');
    iconSpan.classList.add('dropped-item-icon');
    iconSpan.textContent = item.icon || '❓';

    iconContainer.appendChild(iconSpan);
    iconContainer.title = `${item.name} x${item.quantity}`;
    iconContainer.dataset.id = item.id;
    iconContainer.onclick = () => {
      moveToAndPickUpItem(item.x, item.y, item.id);
    };
    gameArea.appendChild(iconContainer);

    // Label container
    const labelWrapper = document.createElement('div');
    labelWrapper.classList.add('dropped-item-label-wrapper');
    labelWrapper.style.position = 'absolute';
    labelWrapper.style.left = `${item.x}px`;
    labelWrapper.style.top = `${item.y + 5}px`;
    labelWrapper.style.transform = 'translate(-50%, 0)';
    labelWrapper.style.zIndex = '50';

    const label = document.createElement('div');
    label.classList.add('dropped-item-label');
    label.textContent = `${item.name} x${item.quantity}`;

    labelWrapper.appendChild(label);
    label.addEventListener('mouseenter', () => {
      iconSpan.classList.add('hovered');
    });
    label.addEventListener('mouseleave', () => {
      iconSpan.classList.remove('hovered');
    });
    gameArea.appendChild(labelWrapper);
  });
}

function renderPlacedItems(items) {
  console.log('renderPlacedItems Ran');
  document.querySelectorAll(".placed-item").forEach(el => el.remove());

  const sizeMap = {
    tiny: '12px',
    small: '18px',
    normal: '22px',
    large: '42px',
    huge: '64px',
    massive: '80px'
  };

  items.forEach(item => {
    const el = document.createElement('div');
    el.classList.add("placed-item");
    el.id = item.id;
    el.style.position = 'absolute';
    el.style.left = `${item.x}px`;
    el.style.top = `${item.y}px`;

    if (item.id.toLowerCase().includes('tree')) {
      el.classList.add('tree');
    }

    const fontSize = sizeMap[item.size] || sizeMap['normal'];
    el.style.fontSize = fontSize;

    el.textContent = item.icon || '?';
    el.title = `${item.name} x${item.quantity || 1}`;

    // Set fixed z-index for all placed items
    el.style.zIndex = 19;

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