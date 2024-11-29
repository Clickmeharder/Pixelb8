const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

document.getElementById("funwrap1").appendChild(canvas);

// Variables for game state
let score = 0;
let lives = 3;
let player = { x: 375, y: 550, width: 50, height: 20, speed: 5 };
let bullets = [];
let enemies = [];
let enemySpeed = 2;

// Key press states
let keys = {};

// Initialize event listeners
function setupListeners() {
    window.addEventListener("keydown", (e) => (keys[e.key] = true));
    window.addEventListener("keyup", (e) => (keys[e.key] = false));
}

// Spawn enemies
function spawnEnemies() {
    for (let i = 0; i < 5; i++) {
        enemies.push({
            x: Math.random() * (canvas.width - 50),
            y: Math.random() * 100,
            width: 50,
            height: 20,
        });
    }
}

// Draw player
function drawPlayer() {
    ctx.fillStyle = "blue";
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

// Draw bullets
function drawBullets() {
    ctx.fillStyle = "red";
    bullets.forEach((bullet) => {
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });
}

// Draw enemies
function drawEnemies() {
    ctx.fillStyle = "green";
    enemies.forEach((enemy) => {
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });
}

// Move player
function movePlayer() {
    if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
    if (keys["ArrowRight"] && player.x + player.width < canvas.width)
        player.x += player.speed;
}

// Shoot bullets
function shootBullet() {
    if (keys[" "]) {
        bullets.push({ x: player.x + player.width / 2 - 5, y: player.y, width: 5, height: 10 });
        keys[" "] = false; // Prevent continuous firing
    }
}

// Move bullets
function moveBullets() {
    bullets.forEach((bullet) => (bullet.y -= 5));
    bullets = bullets.filter((bullet) => bullet.y > 0);
}

// Move enemies
function moveEnemies() {
    enemies.forEach((enemy) => (enemy.y += enemySpeed));
    enemies = enemies.filter((enemy) => enemy.y < canvas.height);
}

// Detect collisions
function detectCollisions() {
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (
                bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y
            ) {
                // Remove bullet and enemy
                bullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
                score += 10;
            }
        });
    });

    enemies.forEach((enemy) => {
        if (
            enemy.x < player.x + player.width &&
            enemy.x + enemy.width > player.x &&
            enemy.y < player.y + player.height &&
            enemy.y + enemy.height > player.y
        ) {
            lives--;
            if (lives <= 0) endGame();
        }
    });
}

// End game
function endGame() {
    setTimeout(() => {
        if (confirm("Game Over! Do you want to play again?")) {
            restartGame();
        }
    }, 100);
}

// Restart game
function restartGame() {
    score = 0;
    lives = 3;
    player = { x: 375, y: 550, width: 50, height: 20, speed: 5 };
    bullets = [];
    enemies = [];
    spawnEnemies();
    update();
}

// Update game state
function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    movePlayer();
    shootBullet();
    moveBullets();
    moveEnemies();
    detectCollisions();

    // Draw everything
    drawPlayer();
    drawBullets();
    drawEnemies();

    // Draw score and lives
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 20);
    ctx.fillText(`Lives: ${lives}`, 10, 40);

    // Continue game loop
    if (lives > 0) {
        requestAnimationFrame(update);
    }
}

// Start the game
function startGame() {
    setupListeners();
    spawnEnemies();
    update();
}

// Run the game when the page loads
window.onload = startGame;
