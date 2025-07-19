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
  document.querySelectorAll('.dropped-item, .dropped-item-label-wrapper').forEach(el => el.remove());
  console.log('renderDroppedItems Ran');
  const droppedItems = droppedItemsByMap[currentMap];

  droppedItems.forEach((item, index) => {
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

    // Label container (separate from icon)
    const labelWrapper = document.createElement('div');
    labelWrapper.classList.add('dropped-item-label-wrapper');
    labelWrapper.style.position = 'absolute';
    labelWrapper.style.left = `${item.x}px`;
    labelWrapper.style.top = `${item.y + 5}px`; // slight offset down from icon
    labelWrapper.style.transform = 'translate(-50%, 0)';
    labelWrapper.style.zIndex = '50';
    labelWrapper.style.pointerEvents = ''; // So it doesn’t interfere with clicking

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