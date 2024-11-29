class DodgeGame {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = 800;
        this.canvas.height = 600;
        this.container.appendChild(this.canvas);

        this.hud = document.createElement("div");
        this.hud.id = "hud";
        this.container.appendChild(this.hud);

        this.running = false;
        this.player = { x: 400, y: 500, size: 30, speed: 5 };
        this.blocks = [];
        this.score = 0;

        this.keys = {};
        this.lastFrameTime = 0;

        this.init();
    }

    init() {
        this.running = true;
        this.score = 0;
        this.blocks = [];
        this.updateHUD("Score: 0");
        document.addEventListener("keydown", (e) => (this.keys[e.key] = true));
        document.addEventListener("keyup", (e) => (this.keys[e.key] = false));
        this.gameLoop();
    }

    gameLoop() {
        if (!this.running) return;
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;

        this.update(delta);
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    update(delta) {
        // Update player position
        if (this.keys["ArrowLeft"] && this.player.x > 0) {
            this.player.x -= this.player.speed;
        }
        if (this.keys["ArrowRight"] && this.player.x < this.canvas.width - this.player.size) {
            this.player.x += this.player.speed;
        }
        if (this.keys["ArrowUp"] && this.player.y > 0) {
            this.player.y -= this.player.speed;
        }
        if (this.keys["ArrowDown"] && this.player.y < this.canvas.height - this.player.size) {
            this.player.y += this.player.speed;
        }

        // Add new blocks periodically
        if (Math.random() < 0.02) {
            const size = Math.random() * 30 + 20;
            this.blocks.push({
                x: Math.random() * (this.canvas.width - size),
                y: -size,
                size,
                speed: Math.random() * 3 + 2,
            });
        }

        // Update blocks
        for (let block of this.blocks) {
            block.y += block.speed;
        }

        // Remove blocks that leave the screen
        this.blocks = this.blocks.filter((block) => block.y < this.canvas.height);

        // Check for collisions
        for (let block of this.blocks) {
            if (
                this.player.x < block.x + block.size &&
                this.player.x + this.player.size > block.x &&
                this.player.y < block.y + block.size &&
                this.player.y + this.player.size > block.y
            ) {
                this.gameOver();
                return;
            }
        }

        // Update score
        this.score += Math.floor(delta / 10);
        this.updateHUD(`Score: ${this.score}`);
    }

    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw player
        this.ctx.fillStyle = "#00FF00";
        this.ctx.fillRect(this.player.x, this.player.y, this.player.size, this.player.size);

        // Draw blocks
        this.ctx.fillStyle = "#FF0000";
        for (let block of this.blocks) {
            this.ctx.fillRect(block.x, block.y, block.size, block.size);
        }
    }

    gameOver() {
        this.running = false;
        this.updateHUD(`Game Over! Final Score: ${this.score}. Click to Restart.`);
        this.container.addEventListener("click", () => this.restart(), { once: true });
    }

    restart() {
        this.init();
    }

    updateHUD(text) {
        this.hud.textContent = text;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const game = new DodgeGame("game-container");
});
