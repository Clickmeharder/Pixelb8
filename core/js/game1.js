	const canvas = document.getElementById("game-canvas");
	const ctx = canvas.getContext("2d");

	// Set canvas size
	canvas.width = 800;
	canvas.height = 600;

	// Game state variables
	let score = 0;
	let lives = 3;
	let player = { x: 375, y: 550, width: 50, height: 20, speed: 5 };
	let bullets = [];
	let enemies = [];
	let enemySpeed = 2;

	// Draw the player
	function drawPlayer() {
		ctx.fillStyle = "#00ff00";
		ctx.fillRect(player.x, player.y, player.width, player.height);
	}

	// Draw bullets
	function drawBullets() {
		ctx.fillStyle = "#ff0000";
		bullets.forEach((bullet) => {
			ctx.fillRect(bullet.x, bullet.y, 5, 10);
		});
	}

	// Draw enemies
	function drawEnemies() {
		ctx.fillStyle = "#ffff00";
		enemies.forEach((enemy) => {
			ctx.fillRect(enemy.x, enemy.y, 40, 40);
		});
	}

	// Move bullets
	function updateBullets() {
		bullets.forEach((bullet, index) => {
			bullet.y -= 5; // Move up
			if (bullet.y < 0) bullets.splice(index, 1); // Remove off-screen bullets
		});
	}

	// Move enemies
	function updateEnemies() {
		enemies.forEach((enemy, index) => {
			enemy.y += enemySpeed; // Move down
			if (enemy.y > canvas.height) {
				enemies.splice(index, 1);
				lives--; // Lose a life if enemy passes
			}
		});
	}

	// Collision detection
	function checkCollisions() {
		bullets.forEach((bullet, bIndex) => {
			enemies.forEach((enemy, eIndex) => {
				if (
					bullet.x < enemy.x + 40 &&
					bullet.x + 5 > enemy.x &&
					bullet.y < enemy.y + 40 &&
					bullet.y + 10 > enemy.y
				) {
					// Remove bullet and enemy
					bullets.splice(bIndex, 1);
					enemies.splice(eIndex, 1);
					score += 100; // Add points
				}
			});
		});
	}

	// Spawn enemies
	function spawnEnemies() {
		if (enemies.length < 5) {
			const x = Math.random() * (canvas.width - 40); // Random horizontal position
			enemies.push({ x, y: 0 });
		}
	}

	// Update game state
	function update() {
		ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
		drawPlayer();
		drawBullets();
		drawEnemies();
		updateBullets();
		updateEnemies();
		checkCollisions();
		spawnEnemies();

		// Update HUD
		document.getElementById("score").textContent = score;
		document.getElementById("lives").textContent = lives;

		// Check for game over
		// Check for game over
		if (lives <= 0) {
			setTimeout(() => {
				if (confirm("Game Over! Do you want to play again?")) {
					restartGame(); // Call a function to restart the game
				}
			}, 100); // Slight delay to prevent any race conditions
		}

	// Player movement
	document.addEventListener("keydown", (e) => {
		if (e.key === "ArrowLeft" && player.x > 0) player.x -= player.speed;
		if (e.key === "ArrowRight" && player.x + player.width < canvas.width)
			player.x += player.speed;
		if (e.key === " ") {
			bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y }); // Fire bullet
		}
	});

	// Start game
	update();