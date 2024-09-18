    // Display battle version at the top of the page
    let currentnewversion = 'beta 0.001';
    const newversionElement = document.getElementById('new-version');
    newversionElement.textContent = currentnewversion;

    // Game setup
    const boss = document.getElementById('boss');
    const players = [
      document.getElementById('player1'),
      document.getElementById('player2')
    ];

    // Initial positions
    let bossPosition = { x: 100, y: 100 };
    let playerPositions = [
      { x: 200, y: 300 },
      { x: 400, y: 400 }
    ];

    // Function for random movement
    function moveCharacter(character, position) {
      const oldX = position.x;
      const oldY = position.y;

      // Random movement logic
      const newX = Math.max(0, Math.min(750, position.x + (Math.random() * 40 - 20)));
      const newY = Math.max(0, Math.min(550, position.y + (Math.random() * 40 - 20)));

      position.x = newX;
      position.y = newY;

      // Change background based on movement direction
      if (newY < oldY) {
        character.style.backgroundImage = 'url(assets/defaultplayer/player-walk-up.png)';
      } else if (newX > oldX) {
        character.style.backgroundImage = 'url(assets/defaultplayer/player-walk-right.png)';
      } else if (newX < oldX) {
        character.style.backgroundImage = 'url(assets/defaultplayer/player-walk-left.png)';
      } else if (newY > oldY) {
        character.style.backgroundImage = 'url(assets/defaultplayer/player-walk-down.png)';
      }

      // Update the position of the character in the game
      character.style.left = `${newX}px`;
      character.style.top = `${newY}px`;
    }

    // Random event logic
    function triggerRandomEvent() {
      const chance = Math.random();
      if (chance < 0.2) { // 20% chance of a random event
        console.log("Random event triggered!");
        // Add event logic here, such as spawning an item, boosting health, etc.
      }
    }

    // Automated boss and player movement
    function updateGame() {
      moveCharacter(boss, bossPosition);
      players.forEach((player, index) => moveCharacter(player, playerPositions[index]));

      // Random stop and event trigger
      if (Math.random() < 0.05) { // 5% chance to pause for a brief moment
        triggerRandomEvent();
        setTimeout(updateGame, 1000); // Pause for 1 second
      } else {
        requestAnimationFrame(updateGame);
      }
    }

    // Start the game loop
    requestAnimationFrame(updateGame);