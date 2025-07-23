
// GAME LOOP
function gameLoop() {
  updateEntityBehaviors();
  // Always update distances — even when debug is off
  updateEnemyDistances();
  // Only render debug UI if debug mode is on
  if (debugMode) {
	enemyDeetsDebug();

  }

  requestAnimationFrame(gameLoop);
}




document.addEventListener('keydown', (e) => {
  const activeTag = document.activeElement.tagName.toLowerCase();
  const isTyping = activeTag === 'input' || activeTag === 'textarea';
  let key = keyAliases[e.key] || e.key.toLowerCase();

  if (!isTyping && ['w', 'a', 's', 'd', 'q', 'e', 'i', 'l', 'f', ' ', 'shift'].includes(key)) {
    keysPressed[key] = true;
    updateWobble();
    e.preventDefault();
  }

  if (key === '`' && !keysPressed['`']) {
    keysPressed['`'] = true;
    const debugcontrolpanel = document.getElementById('debug-panel');
    if (debugcontrolpanel) {
      debugcontrolpanel.style.display = debugMode ? 'none' : 'block';
    }
    debugMode = !debugMode;
    updateDebugOverlay(maps[currentMap].obstacles, detectionRadius);
    e.preventDefault();
  }
});

document.addEventListener('keyup', (e) => {
  const activeTag = document.activeElement.tagName.toLowerCase();
  const isTyping = activeTag === 'input' || activeTag === 'textarea';
  let key = keyAliases[e.key] || e.key.toLowerCase();

  if (!isTyping && ['w', 'a', 's', 'd', 'q', 'e', 'shift'].includes(key)) {
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

  if (key === '`') {
    delete keysPressed['`'];
  }
});



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







// Start the loop only once
if (!window.hasGameLoopStarted) {
  window.hasGameLoopStarted = true;
  gameLoop(); // kicks things off
  console.log('Shits gettin loopy');
}




