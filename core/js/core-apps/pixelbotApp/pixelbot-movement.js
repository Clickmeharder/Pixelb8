const pixelb8 = document.getElementById('pixelb8');
const gameArea = document.getElementById('gameArea');
//move to stuff

//  -  - - --  -- - -
let idleTimer;

const keysPressed = {};
let pendingObjectToPlace = null;
let pendingPlacedItemToPickUpId = null;
let pendingDroppedItemToPickUpId = null;
let pendingActionAfterArrival = null;
let currentFacingKey = null;
let isSneaking = false;

const baseSpeed = 2.0;
let speedModifier = 1.0;
const keyAliases = {
  ArrowUp: 'w',
  ArrowDown: 's',
  ArrowLeft: 'a',
  ArrowRight: 'd'
};

function getPlayerCenter() {
  const playerElement = document.getElementById('pixelb8');
  if (!playerElement) return null;

  const playerX = (parseInt(playerElement.style.left, 10) || 0) + playerElement.offsetWidth / 2;
  const playerY = (parseInt(playerElement.style.top, 10) || 0) + playerElement.offsetHeight / 2;

  return { x: playerX, y: playerY };
}

const directions = {
  ArrowUp: 'core/js/core-apps/pixelbotApp/images/sprites/pixelbot/pixelbot-walk-up.png',
  ArrowDown: 'core/js/core-apps/pixelbotApp/images/sprites/pixelbot/pixelbot-walk-down.png',
  ArrowLeft: 'core/js/core-apps/pixelbotApp/images/sprites/pixelbot/pixelbot-walk-left.png',
  ArrowRight: 'core/js/core-apps/pixelbotApp/images/sprites/pixelbot/pixelbot-walk-right.png',
  'ArrowUp+ArrowRight': 'core/js/core-apps/pixelbotApp/images/sprites/pixelbot/pixelbot-walk-topright.png',
  'ArrowUp+ArrowLeft': 'core/js/core-apps/pixelbotApp/images/sprites/pixelbot/pixelbot-walk-topleft.png',
  'ArrowDown+ArrowRight': 'core/js/core-apps/pixelbotApp/images/sprites/pixelbot/pixelbot-face-bottomright.png',
  'ArrowDown+ArrowLeft': 'core/js/core-apps/pixelbotApp/images/sprites/pixelbot/pixelbot-face-bottomleft.png'
};
const gameWidth = 1024;
const gameHeight = 586;



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
    idleImg.src = 'core/js/core-apps/pixelbotApp/images/sprites/pixelbot/pixelbot-transform-clean.gif';
  });

  return Promise.all([...directionPromises, idlePromise]);
}


preloadSprites().then(() => {
  console.log("Pixelbot has Joined the chat");
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

	  let sneakZIndexTimeout;

	  if (shift) {
		  speedModifier = 0.5;
		  detectionRadius = sneakDetectionRadius;
		  pixelb8.style.opacity = '0.5';
		  isSneaking = true;
		  updateSneak();
		// Cancel any scheduled reset
		if (sneakZIndexTimeout) {
			clearTimeout(sneakZIndexTimeout);
			sneakZIndexTimeout = null;
		}

		// Raise z-index
		document.querySelectorAll('.dropped-item').forEach(el => {
			el.style.zIndex = '100';
		});
	  } else {
		  isSneaking = false;
		  speedModifier = 1.0;
		  detectionRadius = baseDetectionRadius;
		  updateSneak();
		  pixelb8.style.opacity = '1';
		  // Delay resetting z-index by 8 seconds
		  sneakZIndexTimeout = setTimeout(() => {
			document.querySelectorAll('.dropped-item').forEach(el => {
			  el.style.zIndex = '8';
			});
		  }, 10000);
	  }

	  if (targetPosition) {
		let distX = targetPosition.x - collisionBox.x;
		let distY = targetPosition.y - collisionBox.y;
		const dist = Math.sqrt(distX * distX + distY * distY);

		if (dist < moveThreshold) {
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
				pendingDroppedItemToPickUpId = null;
			  }
			}

			pendingDroppedItemToPickUpId = null;
		  }
			// --- Handle Placed Item Interact ---
		  // --- Placed Item Interact ---
		  if (pendingPlacedItemToInteractId !== null) {
			console.log('[Interact Check] pendingPlacedItemToInteractId =', pendingPlacedItemToInteractId);

			const map = maps[currentMap];
			const item = map.placedItems.find(p => p.id === pendingPlacedItemToInteractId);

			if (!item) {
			  console.warn('[Interact] Placed item with ID not found:', pendingPlacedItemToInteractId);
			} else {
			  console.log('[Interact] Player is near enough to interact');
			  interactWithPlacedItem(item.id);
			}

			pendingPlacedItemToInteractId = null;
			interactWithPlacedItem(item.id);
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
		// --- Update pixelb8 z-index based on Y compared to nearby placed items ---
		// --- Update pixelb8 z-index based on Y compared to nearby placed items ---
		// --- Update pixelb8 z-index based on Y compared to nearby placed items ---
		let lowestYBelow = null;
		let influencingItem = null;
		const radius = 60; // Radius to consider nearby items

		const placedItems = maps[currentMap]?.placedItems || [];

		placedItems.forEach(placed => {
		  const box = placed.collisionBox || placed;

		  // Adjust Y position for z-index check: lowered by 1 collisionBox.height
		  const adjustedY = box.y + (box.height || 24);

		  // Calculate center positions for distance check
		  const playerCenterX = collisionBox.x + collisionBox.width / 2;
		  const playerCenterY = collisionBox.y + collisionBox.height / 2;
		  const itemCenterX = box.x + (box.width || 44) / 2;
		  const itemCenterY = adjustedY + (box.height || 24) / 2;

		  const dx = itemCenterX - playerCenterX;
		  const dy = itemCenterY - playerCenterY;
		  const distance = Math.sqrt(dx * dx + dy * dy);

		  // Only consider items within radius and below the player
		  if (distance <= radius && adjustedY > collisionBox.y) {
			if (lowestYBelow === null || adjustedY < lowestYBelow) {
			  lowestYBelow = adjustedY;
			  influencingItem = box;
			}
		  }
		});

		if (lowestYBelow !== null) {
		  pixelb8.style.zIndex = 18; // Behind nearest below item
		} else {
		  pixelb8.style.zIndex = 20; // In front if none found below
		}

		// --- Debug highlight for z-index logic ---
		if (debugMode && debugOverlay) {
		  // Clear any previous zcheck boxes
		  const existing = debugOverlay.querySelectorAll('.debug-zcheck');
		  existing.forEach(el => el.remove());

		  if (influencingItem) {
			const zcheckBox = document.createElement('div');
			zcheckBox.classList.add('debug-zcheck');
			zcheckBox.style.position = 'absolute';
			zcheckBox.style.left = `${influencingItem.x}px`;
			// Shift debug box down by the item's height to match adjustedY logic
			zcheckBox.style.top = `${influencingItem.y + (influencingItem.height || 24)}px`;
			zcheckBox.style.width = `${influencingItem.width || 44}px`;
			zcheckBox.style.height = `${influencingItem.height || 24}px`;
			zcheckBox.style.border = '2px dashed lime';
			zcheckBox.style.backgroundColor = 'rgba(0,255,0,0.15)';
			zcheckBox.style.zIndex = '1015';
			debugOverlay.appendChild(zcheckBox);
		  }
		}


	  // --end of updatefunction
	  applyTilt();
	  resetIdleTimer();
	}
  let animationFrameId;
  function animationLoop() {
    updateMovement();

    animationFrameId = requestAnimationFrame(animationLoop);
  }
  animationLoop();

  function resetIdleTimer() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      pixelb8.style.backgroundImage = 'url(core/js/core-apps/pixelbotApp/images/sprites/pixelbot/pixelbot-transform-clean.gif)';
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


