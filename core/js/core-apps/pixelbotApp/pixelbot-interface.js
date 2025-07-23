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


function updateSneak() {
  const sneakStatus = document.getElementById('sneakStatus');
  if (sneakStatus) {
    if (isSneaking) {
      sneakStatus.style.display = 'block';
      sneakStatus.textContent = 'Sneaking 👤 r=70';  // or add any visual effect
      sneakStatus.style.color = 'green'; // just an example styling
	  detectR = 70;
    } else {
      sneakStatus.style.display = 'block';
	  sneakStatus.textContent = 'HiMom r=70';
	  detectR = 125;
    }
	return { playerisSneaking: true };
  }
}



//-----------------------------------------
let debugMode = false;
let debugBox = null;
let debugOverlay = null;
let detectionCircle = null;

function createUniqueItemId(baseName) {
  return `${baseName}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function switchDebugTab(tabId) {
  // Get all tabs
  const tabs = document.querySelectorAll('.debug-panel-Tab');
  
  tabs.forEach(tab => {
    if (tab.id === tabId) {
      tab.style.display = 'block'; // Show selected tab
    } else {
      tab.style.display = 'none';  // Hide others
    }
  });
}
// Call this when page loads to set default tab and load saved notes
document.addEventListener('DOMContentLoaded', () => {
  switchDebugTab('debug-main-Tab');
  loadDebugNotes();
});

function saveDebugNotes() {
  const notes = document.getElementById('debugNotesTextarea').value;
  localStorage.setItem('pixelb8_debugnotes', notes);
  alert('Debug notes saved!');
}

function loadDebugNotes() {
  const savedNotes = localStorage.getItem('pixelb8_debugnotes');
  if (savedNotes !== null) {
    document.getElementById('debugNotesTextarea').value = savedNotes;
  }
}
//debugging
function debugSpawnRandomEnemy() {
  const types = Object.keys(enemies);
  const randomType = types[Math.floor(Math.random() * types.length)];
  const randX = player.x + Math.floor(Math.random() * 100);
  const randY = player.y + Math.floor(Math.random() * 100);
  spawnEnemy(randomType, randX, randY, currentMap);
}

function createDebugOverlay() {
  if (!debugOverlay) {
    debugOverlay = document.createElement('div');
	debugOverlay.classList.add('debug-overlay');
	debugOverlay.id = 'debugoverlay';
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
function enemyDeetsDebug() {
  const overlay = document.getElementById("debugoverlay");
  if (!overlay) return;

  // Remove previous enemy debug visuals
  const old = document.getElementById("enemy-debug-container");
  if (old) old.remove();

  const container = document.createElement("div");
  container.id = "enemy-debug-container";

  document.querySelectorAll(".enemy").forEach(enemyEl => {
    const x = parseInt(enemyEl.style.left);
    const y = parseInt(enemyEl.style.top);
    const range = parseFloat(enemyEl.dataset.range);
    const id = enemyEl.id;

    if (isNaN(x) || isNaN(y) || isNaN(range)) return;

    // 🔴 Range circle
    const rangeCircle = document.createElement("div");
    rangeCircle.className = "debug-range-circle";
    rangeCircle.style.position = "absolute";
    rangeCircle.style.left = `${x + 16 - range}px`;
    rangeCircle.style.top = `${y + 16 - range}px`;
    rangeCircle.style.width = `${range * 2}px`;
    rangeCircle.style.height = `${range * 2}px`;
    rangeCircle.style.borderRadius = "50%";
    rangeCircle.style.border = "1px dashed red";
    rangeCircle.style.pointerEvents = "none";
    rangeCircle.style.opacity = "0.5";

    // 📋 Stats label box
    const statsBox = document.createElement("div");
    statsBox.className = "debug-stats-box";
    statsBox.style.position = "absolute";
    statsBox.style.left = `${x + 36}px`;
    statsBox.style.top = `${y - 10}px`;
    statsBox.style.fontSize = "10px";
    statsBox.style.lineHeight = "12px";
    statsBox.style.background = "rgba(0,0,0,0.7)";
    statsBox.style.color = "lime";
    statsBox.style.padding = "4px";
    statsBox.style.borderRadius = "4px";
    statsBox.style.textShadow = "0 0 2px black";
    statsBox.style.whiteSpace = "pre";
    statsBox.style.pointerEvents = "none";

    // Pull in enemy data
    const stats = [
      `ID: ${id}`,
      `Health: ${enemyEl.dataset.health}/${enemyEl.dataset.maxHealth}`,
      `Speed: ${enemyEl.dataset.speed} (Base: ${enemyEl.dataset.baseSpeed})`,
      `Damage: ${enemyEl.dataset.damage}`,
      `Range: ${enemyEl.dataset.range}`,
      `State: ${enemyEl.dataset.state}`,
      `Behavior: ${enemyEl.dataset.behavior}`
    ];

    statsBox.textContent = stats.join('\n');

    container.appendChild(rangeCircle);
    container.appendChild(statsBox);
  });

  overlay.appendChild(container);
}


function updateEnemyDistanceDebugOverlay() {
  const overlay = document.getElementById("debugoverlay");
  const panel = document.getElementById("debug-panel");

  if (!debugMode) {
    // Hide or remove both elements if debug mode is off
    if (overlay) overlay.style.display = "none";
    if (panel) panel.style.display = "none";
    return;
  }

  // Show both elements
  if (overlay) overlay.style.display = "block";
  if (panel) panel.style.display = "block";

  // Clear previous debug elements
  overlay.querySelectorAll('.debug-info-box, .debug-line, .debug-dot, .debug-dot-player').forEach(el => el.remove());

  const playerPos = getPlayerCenter();
  if (!playerPos) return;

  const entities = maps[currentMap]?.entities || [];
  entities.forEach((enemy) => {
    if (enemy.type !== "enemy") return;

    const distance = enemy.distanceToPlayer ?? 0;
    const enemyCenter = enemy.center || { x: enemy.x, y: enemy.y };

    // Info Box
    const infoBox = document.createElement("div");
    infoBox.className = "debug-info-box";
    infoBox.innerHTML = `
      <strong>${enemy.name}</strong> (ID: ${enemy.id})<br>
      Position: (${Math.round(enemy.x)}, ${Math.round(enemy.y)})<br>
      Player: (${Math.round(playerPos.x)}, ${Math.round(playerPos.y)})<br>
      Distance: ${Math.round(distance)} px<br>
      Health: ${enemy.health} / ${enemy.maxHealth || "?"}<br>
      Level: ${enemy.level || "1"}<br>
    `;
    overlay.appendChild(infoBox);

    // Line from enemy to player
    const dx = playerPos.x - enemyCenter.x;
    const dy = playerPos.y - enemyCenter.y;
    const angle = Math.atan2(dy, dx);

    const line = document.createElement("div");
    line.className = "debug-line";
    line.style.left = `${enemyCenter.x}px`;
    line.style.top = `${enemyCenter.y}px`;
    line.style.width = `${distance}px`;
    line.style.transform = `rotate(${angle}rad)`;
    overlay.appendChild(line);

    // Enemy center dot
    const dot = document.createElement("div");
    dot.className = "debug-dot";
    dot.style.left = `${enemyCenter.x - 2}px`;
    dot.style.top = `${enemyCenter.y - 2}px`;
    overlay.appendChild(dot);
  });

  // Player center dot
  const playerDot = document.createElement("div");
  playerDot.className = "debug-dot-player";
  playerDot.style.left = `${playerPos.x - 2}px`;
  playerDot.style.top = `${playerPos.y - 2}px`;
  overlay.appendChild(playerDot);
}


function updateDebugOverlay(obstacles, detectionRadius) {
  const playerElement = document.getElementById('pixelb8');
	if (playerElement) {
	  playerElement.style.border = debugMode ? '2px solid red' : 'none';
  }
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

  const zcheck = debugOverlay.querySelector('.debug-zcheck');
  if (zcheck) zcheck.remove();

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
  const yOffset = 50;

  detectionCircle.style.width = `${diameter}px`;
  detectionCircle.style.height = `${diameter}px`;
  detectionCircle.style.left = `${centerX - detectionRadius}px`;
  detectionCircle.style.top = `${centerY - detectionRadius - yOffset}px`;

  // ✅ Now call the separate debug function for enemy distance
  
  updateEnemyDistanceDebugOverlay();
  
}

function updateDebugPanelVisibility() {
  const panel = document.getElementById('debug-panel');
  panel.style.display = debugMode ? 'block' : 'none';

  // Also toggle the debug overlay visibility or clear it
  const overlay = document.getElementById('debugoverlay');
  if (!debugMode && overlay) {
    overlay.innerHTML = ''; // Clear all debug elements
  }
}

function goFullscreen() {
  const gameArea = document.getElementById('gameArea');
  if (gameArea.requestFullscreen) {
    gameArea.requestFullscreen();
  }
}
playAnywayBtn.addEventListener('click', () => {
  devOverlay.classList.add('closing');

  setTimeout(() => {
    devOverlay.style.display = 'none';

    // Show and fade in game area
    const gameArea = document.getElementById('gameArea');
    gameArea.style.opacity = '1';
    gameArea.classList.add('fade-in'); // trigger CSS transition
  }, 900); // match animation duration
});

document.addEventListener('DOMContentLoaded', () => {
  const devOverlay = document.getElementById('devOverlay');
  const playAnywayBtn = document.getElementById('playAnywayBtn');

  playAnywayBtn.addEventListener('click', () => {
    // Add animation class
    devOverlay.classList.add('closing');

    // Wait for animation to finish before hiding
    setTimeout(() => {
      devOverlay.style.display = 'none';
    }, 800); // match the animation duration from CSS
  });

  // Show overlay on load
  devOverlay.style.display = 'flex';
});


function fadeOutGameArea(callback) {
  const gameArea = document.getElementById("gameArea");

  function onFadeEnd() {
    gameArea.removeEventListener("transitionend", onFadeEnd);
    if (callback) callback(); // continue once fade-out completes
  }

  gameArea.addEventListener("transitionend", onFadeEnd);
  gameArea.classList.remove("visible");
}

function fadeInGameArea() {
  document.getElementById("gameArea").classList.add("visible");
}


function showLoading() {
  const screen = document.getElementById("loadingScreen");
  const gameArea = document.getElementById("gameArea");

  // Fade out game area
  gameArea.classList.remove("fade-in");
  gameArea.classList.add("fade-out");


}
function hideLoading() {
  const screen = document.getElementById("loadingScreen");
  const gameArea = document.getElementById("gameArea");

  setTimeout(() => {

    // Fade game area back in
    gameArea.classList.remove("fade-out");
    gameArea.classList.add("fade-in");
  }, 800); // match the animation duration
}

