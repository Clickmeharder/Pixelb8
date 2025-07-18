const pixelb8 = document.getElementById('pixelb8');
const gameArea = document.getElementById('gameArea');
//move to stuff

//  -  - - --  -- - -
let idleTimer;
let debugMode = false;
let debugBox = null;
let debugOverlay = null;
let detectionCircle = null;
const keysPressed = {};
let pendingObjectToPlace = null;
let pendingPlacedItemToPickUpId = null;
let pendingDroppedItemToPickUpId = null;
let pendingActionAfterArrival = null;
let currentFacingKey = null;
const baseSpeed = 2.0;
let speedModifier = 1.0;
const keyAliases = {
  ArrowUp: 'w',
  ArrowDown: 's',
  ArrowLeft: 'a',
  ArrowRight: 'd'
};
const baseDetectionRadius = 150;
const sneakDetectionRadius = 75;
let detectionRadius = baseDetectionRadius;

const directions = {
  ArrowUp: 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-walk-up.png',
  ArrowDown: 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-walk-down.png',
  ArrowLeft: 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-walk-left.png',
  ArrowRight: 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-walk-right.png',
  'ArrowUp+ArrowRight': 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-walk-topright.png',
  'ArrowUp+ArrowLeft': 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-walk-topleft.png',
  'ArrowDown+ArrowRight': 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-face-bottomright.png',
  'ArrowDown+ArrowLeft': 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-face-bottomleft.png'
};
const gameWidth = 800;
const gameHeight = 600;

const collisionBox = {
  x: 350,
  y: 300,
  width: 42,
  height: 16
};

const spriteOffset = {
  x: -42,
  y: -100
};
function preloadSprites() {
  // Preload directional sprites
  const directionPromises = Object.values(directions).map(url => {
    return new Promise(resolve => {
      const img = new Image();
      img.onload = resolve;
      img.src = url;
    });
  });

  // Preload idle sprite
  const idlePromise = new Promise(resolve => {
    const idleImg = new Image();
    idleImg.onload = resolve;
    idleImg.src = 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-transform-clean.gif';
  });

  return Promise.all([...directionPromises, idlePromise]);
}


preloadSprites().then(() => {
  console.log("All sprites preloaded.");
  setupMovement();
  loadMap("house");
});
function updateSpriteDirection(facingKey) {
  const newImage = directions[facingKey];
  if (!newImage || pixelb8.style.backgroundImage === `url("${newImage}")`) return;

  // Fade out briefly before changing sprite
  pixelb8.style.opacity = '0.6';
  setTimeout(() => {
    pixelb8.style.backgroundImage = `url("${newImage}")`;
    pixelb8.style.opacity = '1';
  }, 50);
}

function createDebugOverlay() {
  if (!debugOverlay) {
    debugOverlay = document.createElement('div');
    debugOverlay.style.position = 'absolute';
    debugOverlay.style.left = '0px';
    debugOverlay.style.top = '0px';
    debugOverlay.style.width = `${gameWidth}px`;
    debugOverlay.style.height = `${gameHeight}px`;
    debugOverlay.style.border = '2px solid lime';
    debugOverlay.style.pointerEvents = 'none';
    debugOverlay.style.zIndex = '1000';
    debugOverlay.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
    gameArea.appendChild(debugOverlay);
  }
}

function updateDebugOverlay(obstacles, detectionRadius) {
  if (!debugMode) {
    if (debugOverlay) debugOverlay.remove();
    if (debugBox) debugBox.remove();
    if (detectionCircle) {
      detectionCircle.remove();
      detectionCircle = null;
    }
    debugOverlay = null;
    debugBox = null;
    return;
  }

  createDebugOverlay();
  debugOverlay.querySelectorAll('.debug-collision').forEach(el => el.remove());

  if (!debugBox) {
    debugBox = document.createElement('div');
    debugBox.classList.add('debug-collision');
    debugBox.style.position = 'absolute';
    debugBox.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    debugBox.style.border = '1px solid red';
    debugBox.style.zIndex = '1010';
    debugOverlay.appendChild(debugBox);
  }
  debugBox.style.left = `${collisionBox.x}px`;
  debugBox.style.top = `${collisionBox.y}px`;
  debugBox.style.width = `${collisionBox.width}px`;
  debugBox.style.height = `${collisionBox.height}px`;

  obstacles.forEach(obs => {
    const box = document.createElement('div');
    box.classList.add('debug-collision');
    box.style.position = 'absolute';
    box.style.left = `${obs.x}px`;
    box.style.top = `${obs.y}px`;
    box.style.width = `${obs.width}px`;
    box.style.height = `${obs.height}px`;
    box.style.backgroundColor = 'rgba(255, 0, 0, 0.3)';
    box.style.border = '1px solid red';
    box.style.zIndex = '1005';
    debugOverlay.appendChild(box);
  });

  // Create detectionCircle if it doesn't exist yet
  if (!detectionCircle) {
    detectionCircle = document.createElement('div');
    detectionCircle.style.position = 'absolute';
    detectionCircle.style.border = '2px dashed yellow';
    detectionCircle.style.borderRadius = '50%';
    detectionCircle.style.pointerEvents = 'none';
    detectionCircle.style.zIndex = '1000';
    detectionCircle.style.backgroundColor = 'rgba(255, 255, 0, 0.1)';
    debugOverlay.appendChild(detectionCircle);
  }

  const centerX = collisionBox.x + collisionBox.width / 2;
  const centerY = collisionBox.y + collisionBox.height / 2;
  const diameter = detectionRadius * 2;
  const yOffset = 50; // Adjust this value to move the circle up or down

  detectionCircle.style.width = `${diameter}px`;
  detectionCircle.style.height = `${diameter}px`;
  detectionCircle.style.left = `${centerX - detectionRadius}px`;
  detectionCircle.style.top = `${centerY - detectionRadius - yOffset}px`;
}

function isColliding(x1, y1, w1, h1, x2, y2, w2, h2) {
  return !(x1 + w1 <= x2 || x1 >= x2 + w2 || y1 + h1 <= y2 || y1 >= y2 + h2);
}

function canMoveTo(newX, newY, obstacles) {
  if (newX < 0 || newY < 0 || newX + collisionBox.width > gameWidth || newY + collisionBox.height > gameHeight) {
    return false;
  }
  for (let obs of obstacles) {
    if (isColliding(newX, newY, collisionBox.width, collisionBox.height, obs.x, obs.y, obs.width, obs.height)) {
      if (obs.isExit) return 'exit:' + obs.target;
      return false;
    }
  }
  return true;
}


let wobbleActive = false;

function triggerWobble() {
  pixelb8.classList.remove('wobble');
  void pixelb8.offsetWidth;
  pixelb8.classList.add('wobble');
  wobbleActive = true;

  // Remove flag after animation ends
  pixelb8.addEventListener('animationend', () => {
    wobbleActive = false;
  }, { once: true });
}
function applyTilt() {
  let tilt = 0;
  const q = keysPressed['q'];
  const e = keysPressed['e'];
  const w = keysPressed['w'];
  const s = keysPressed['s'];
  const shift = keysPressed['shift'];
  const sneakScale = shift ? 0.8 : 1;

  if ((q && (w || s)) && !e) {
    tilt = -10; // Lean left
  } else if ((e && (w || s)) && !q) {
    tilt = 10; // Lean right
  }

  pixelb8.style.transform = `rotate(${tilt}deg) scale(${sneakScale})`;
}

function updateWobble() {
  const isAS = keysPressed['a'] && keysPressed['s'];
  const isSD = keysPressed['s'] && keysPressed['d'];
  const isAW = keysPressed['a'] && keysPressed['w'];
  const isDW = keysPressed['d'] && keysPressed['w'];

  const shouldWobble = isAS || isSD || isAW || isDW;

  if (shouldWobble) {
    if (!pixelb8.classList.contains('wobble')) {
      pixelb8.classList.add('wobble');
    }
  } else {
    pixelb8.classList.remove('wobble');
  }
}

function updateSpritePosition() {
  pixelb8.style.left = `${collisionBox.x + spriteOffset.x}px`;
  pixelb8.style.top = `${collisionBox.y + spriteOffset.y}px`;
}

function setupMovement() {
  clearTimeout(idleTimer);
  pixelb8.classList.add('animate');
  pixelb8.style.transition = 'transform 0.15s ease, opacity 0.15s ease';

  function getFacingKey(dx, dy) {
    if (dy < 0 && dx > 0) return 'ArrowUp+ArrowRight';
    if (dy < 0 && dx < 0) return 'ArrowUp+ArrowLeft';
    if (dy > 0 && dx > 0) return 'ArrowDown+ArrowRight';
    if (dy > 0 && dx < 0) return 'ArrowDown+ArrowLeft';
    if (dy < 0) return 'ArrowUp';
    if (dy > 0) return 'ArrowDown';
    if (dx > 0) return 'ArrowRight';
    if (dx < 0) return 'ArrowLeft';
    return null;
  }

	function isPlayerNear(x, y, threshold = 60) {
	  const dx = x - collisionBox.x;
	  const dy = y - collisionBox.y;
	  return Math.sqrt(dx * dx + dy * dy) <= threshold;
	}

	function updateMovement() {
	  let dx = 0, dy = 0;
	  let facingKey = null;
	  let tiltOnly = false;

	  const q = keysPressed['q'];
	  const e = keysPressed['e'];
	  const shift = keysPressed['shift'];

	  if (shift) {
		speedModifier = 0.5;
		detectionRadius = sneakDetectionRadius;
		pixelb8.style.opacity = '0.5';
	  } else {
		speedModifier = 1.0;
		detectionRadius = baseDetectionRadius;
		pixelb8.style.opacity = '1';
	  }

	  if (targetPosition) {
		let distX = targetPosition.x - collisionBox.x;
		let distY = targetPosition.y - collisionBox.y;
		const dist = Math.sqrt(distX * distX + distY * distY);

		if (dist < moveThreshold) {
		  console.log(dist + '/' + moveThreshold + ' dist is < moveThreshold');

		  // --- Handle Dropped Item Pickup ---
		  if (pendingDroppedItemToPickUpId !== null) {
			console.log('[Pickup Check] pendingDroppedItemToPickUpId =', pendingDroppedItemToPickUpId);

			const item = droppedItemsByMap[currentMap].find(d => d.id === pendingDroppedItemToPickUpId);

			if (!item) {
			  console.warn('[Pickup] Item with ID not found in droppedItems:', pendingDroppedItemToPickUpId);
			} else {
			  console.log('[Pickup] Found dropped item:', item);

			  if (isPlayerNear(item.x, item.y)) {
				console.log('[Pickup] Player is near the item');
				pickUpItem(item);
			  } else {
				console.log('[Pickup] Player is NOT near the item');
			  }
			}

			pendingDroppedItemToPickUpId = null;
		  }

		  // --- Handle Object Placement ---
		  if (pendingObjectToPlace) {
			  const item = pendingObjectToPlace;

			  const droppedItems = droppedItemsByMap[currentMap];
			  const droppedIndex = droppedItems.findIndex(d => d.id === item.id);
			  if (droppedIndex !== -1) {
				droppedItems.splice(droppedIndex, 1);
			  }

			  const map = maps[currentMap];
			  const placedItem = {
				...item,
				x: collisionBox.x,
				y: collisionBox.y,
				interactable: true,
				placedFromDrop: true
			  };

			  if (placedItem.name.toLowerCase().includes("box")) {
				initBoxStorage(placedItem, 8);
			  }

			  // You could add growth metadata here if it's a plant
			  if (placedItem.isPlant) {
				placedItem.growthStage = 0;
				placedItem.plantedAt = Date.now();
			  }

			  map.placedItems.push(placedItem);
			  renderDroppedItems();
			  renderPlacedItems(map.placedItems);
			  pendingObjectToPlace = null;
		  }

		  // --- Cleanup ---
		  targetPosition = null;
		  for (let key in keysPressed) delete keysPressed[key];

		} else {
		  dx = (distX / dist) * baseSpeed * speedModifier;
		  dy = (distY / dist) * baseSpeed * speedModifier;
		  facingKey = getFacingKey(dx, dy);
		}

	  } else {
		const w = keysPressed['w'];
		const s = keysPressed['s'];
		const a = keysPressed['a'];
		const d = keysPressed['d'];

		if (w) dy -= baseSpeed * speedModifier;
		if (s) dy += baseSpeed * speedModifier;
		if (a) dx -= baseSpeed * speedModifier;
		if (d) dx += baseSpeed * speedModifier;

		if (w || s) {
		  if (q) dx -= baseSpeed * speedModifier * 0.5;
		  if (e) dx += baseSpeed * speedModifier * 0.5;
		}

		if (dx !== 0 && dy !== 0) {
		  const diag = Math.sqrt(2);
		  dx /= diag;
		  dy /= diag;
		}

		if ((dx !== 0 || dy !== 0) && !tiltOnly) {
		  facingKey = getFacingKey(dx, dy);
		}
	  }

	  // --- Collision ---
	  if (dx !== 0 || dy !== 0) {
		const newX = collisionBox.x + dx;
		const newY = collisionBox.y + dy;

		const currentObstacles = maps[currentMap].obstacles.concat(
		  maps[currentMap].placedItems.map(item => ({
			x: item.x + 4,
			y: item.y + (item.height || 24),
			width: item.width || 44,
			height: 24
		  }))
		);

		const moveAllowed = canMoveTo(newX, newY, currentObstacles);

		if (moveAllowed === true) {
		  collisionBox.x = newX;
		  collisionBox.y = newY;
		  updateSpritePosition();
		  updateDebugOverlay(currentObstacles, detectionRadius);
		} else if (typeof moveAllowed === 'string' && moveAllowed.startsWith('exit:')) {
		  loadMap(moveAllowed.split(':')[1]);
		  targetPosition = null;
		  itemToPickUpIndex = null;
		}
	  }

	  // --- Facing Direction ---
	  if (facingKey && directions[facingKey] && currentFacingKey !== facingKey) {
		const newImage = directions[facingKey];
		if (pixelb8.style.backgroundImage !== `url("${newImage}")`) {
		  pixelb8.style.backgroundImage = `url("${newImage}")`;
		}
		currentFacingKey = facingKey;
	  }

	  applyTilt();
	  resetIdleTimer();
	}
  let animationFrameId;
  function animationLoop() {
    updateMovement();
    animationFrameId = requestAnimationFrame(animationLoop);
  }

  document.addEventListener('keydown', (e) => {
    let key = keyAliases[e.key] || e.key.toLowerCase();

    if (['w', 'a', 's', 'd', 'q', 'e', 'shift'].includes(key)) {
      keysPressed[key] = true;
      updateWobble();
      e.preventDefault();
    }

    if (key === 'p' && !keysPressed['p']) {
      keysPressed['p'] = true;
      debugMode = !debugMode;
      updateDebugOverlay(maps[currentMap].obstacles, detectionRadius);
      e.preventDefault();
    }
  });

  document.addEventListener('keyup', (e) => {
    let key = keyAliases[e.key] || e.key.toLowerCase();

    if (['w', 'a', 's', 'd', 'q', 'e', 'shift'].includes(key)) {
      delete keysPressed[key];
      updateWobble();

      if (!keysPressed['q'] && !keysPressed['e']) {
        const sneakScale = speedModifier < 1 ? 0.8 : 1;
        pixelb8.style.transform = `rotate(0deg) scale(${sneakScale})`;
      }

      if ((key === 'a' || key === 'd') && !keysPressed['a'] && !keysPressed['d']) {
        if (keysPressed['w']) {
          updateSpriteDirection('ArrowUp');
        } else {
          updateSpriteDirection('ArrowDown');
        }
      }

      e.preventDefault();
    }

    if (key === 'p') {
      delete keysPressed['p'];
    }
  });

  animationLoop();

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      pixelb8.style.backgroundImage = 'url(https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-transform-clean.gif)';
      pixelb8.classList.add('animate');
      pixelb8.style.transform = '';
      pixelb8.style.opacity = '1';
      pixelb8.style.zIndex = '20';
      currentFacingKey = null;
    }, 5000);
  }

  resetIdleTimer();
}

function moveTo(x, y) {
  const clampedX = Math.min(Math.max(x, 0), gameWidth - collisionBox.width);
  const clampedY = Math.min(Math.max(y, 0), gameHeight - collisionBox.height);
  targetPosition = { x: clampedX, y: clampedY };
  showMoveIndicator(x, y);
}
function showMoveIndicator(x, y) {
  const indicator = document.getElementById('move-indicator');
  const size = 20;

  indicator.style.left = `${x - size / 2}px`;
  indicator.style.top = `${y - size / 2}px`;
  indicator.style.opacity = '1';

  indicator.classList.add('pulsing'); // Optional for animation

  setTimeout(() => {
    indicator.style.opacity = '0';
    indicator.classList.remove('pulsing');
  }, 500);
}
if (!document.getElementById('move-indicator')) {
  const moveIndicator = document.createElement('div');
  moveIndicator.id = 'move-indicator';
  document.getElementById('gameArea').appendChild(moveIndicator);
}


