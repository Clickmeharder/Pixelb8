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
	  {
		id: 'TestBox',
		name: 'TestBox',
		icon: "📦",
		x: 100,
		y: 125,
		quantity: 1,
		weight: 10,
		width: 48,
		height: 24,
		size: 'large',
		type: 'object'
	  }
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


