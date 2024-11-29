// Generalized Game Framework
class RetroGame {
    constructor(containerId, options = {}) {
        // Game Setup
        this.container = document.getElementById(containerId);
        this.canvas = document.createElement("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = options.width || 800;
        this.canvas.height = options.height || 600;
        this.container.appendChild(this.canvas);

        // HUD (Optional)
        this.hud = document.createElement("div");
        this.hud.id = "hud";
        this.container.appendChild(this.hud);

        // Game State
        this.running = false;
        this.lastFrameTime = 0;
        this.options = options;
    }

    // Initialize the Game
    init() {
        this.running = true;
        this.lastFrameTime = performance.now();
        this.updateHUD("Game Initialized!");
        this.gameLoop();
    }

    // Game Loop
    gameLoop() {
        if (!this.running) return;
        const now = performance.now();
        const delta = now - this.lastFrameTime;
        this.lastFrameTime = now;

        // Clear Canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Call the update and draw methods
        this.update(delta);
        this.draw();

        requestAnimationFrame(() => this.gameLoop());
    }

    // Game Logic (To be Extended)
    update(delta) {
        // Example: Update HUD with FPS
        const fps = Math.round(1000 / delta);
        this.updateHUD(`FPS: ${fps}`);
    }

    draw() {
        // Example: Draw a moving square
        const size = 50;
        const x = Math.random() * (this.canvas.width - size);
        const y = Math.random() * (this.canvas.height - size);
        this.ctx.fillStyle = "#FF4500";
        this.ctx.fillRect(x, y, size, size);
    }

    // Stop the Game
    stop() {
        this.running = false;
        this.updateHUD("Game Stopped");
    }

    // Update HUD Content
    updateHUD(text) {
        if (this.hud) this.hud.textContent = text;
    }
}

// Example Usage
document.addEventListener("DOMContentLoaded", () => {
    const myGame = new RetroGame("game-container", { width: 800, height: 600 });
    myGame.init();

    // Example Interaction: Restart Game on Click
    document.getElementById("game-container").addEventListener("click", () => {
        if (!myGame.running) myGame.init();
    });
});
