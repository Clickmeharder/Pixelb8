class DungeonCrawler {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.gridSize = 10;
        this.grid = [];
        this.playerPosition = { x: 0, y: 0 }; // Player starts at top-left
        this.exitPosition = { x: 9, y: 9 }; // Exit at bottom-right
        this.init();
    }

    init() {
        this.createGrid();
        this.renderGrid();
        document.addEventListener("keydown", (e) => this.handleInput(e));
    }

    createGrid() {
        // Create a random grid with walls and paths
        this.grid = Array.from({ length: this.gridSize }, () =>
            Array.from({ length: this.gridSize }, () => (Math.random() > 0.2 ? 1 : 0)) // 80% paths, 20% walls
        );

        // Ensure player and exit positions are walkable
        this.grid[this.playerPosition.y][this.playerPosition.x] = 1;
        this.grid[this.exitPosition.y][this.exitPosition.x] = 1;
    }

    renderGrid() {
        // Clear the existing grid
        this.container.innerHTML = "";

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement("div");
                cell.classList.add("cell");

                // Assign class based on grid values
                if (this.grid[y][x] === 1) cell.classList.add("path");
                else cell.classList.add("wall");

                // Player and exit
                if (x === this.playerPosition.x && y === this.playerPosition.y) {
                    cell.classList.add("player");
                } else if (x === this.exitPosition.x && y === this.exitPosition.y) {
                    cell.classList.add("exit");
                }

                this.container.appendChild(cell);
            }
        }
    }

    handleInput(event) {
        const { x, y } = this.playerPosition;

        let newX = x;
        let newY = y;

        // Handle arrow keys for movement
        if (event.key === "ArrowUp") newY -= 1;
        if (event.key === "ArrowDown") newY += 1;
        if (event.key === "ArrowLeft") newX -= 1;
        if (event.key === "ArrowRight") newX += 1;

        // Check bounds and ensure the next tile is walkable
        if (
            newX >= 0 &&
            newX < this.gridSize &&
            newY >= 0 &&
            newY < this.gridSize &&
            this.grid[newY][newX] === 1
        ) {
            this.playerPosition = { x: newX, y: newY };
            this.checkWinCondition();
            this.renderGrid();
        }
    }

    checkWinCondition() {
        // Check if the player has reached the exit
        if (
            this.playerPosition.x === this.exitPosition.x &&
            this.playerPosition.y === this.exitPosition.y
        ) {
            alert("You Win! The dungeon has been cleared!");
            this.init(); // Restart the game
        }
    }
}

// Initialize the game when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    new DungeonCrawler("game-container");
});
