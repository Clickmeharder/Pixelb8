const player = document.getElementById("player");
let playerHealth = 100;
let inventoryCount = 0;

let playerPosition = { x: 0, y: 0 };

function updatePlayerPosition() {
    player.style.left = playerPosition.x + "px";
    player.style.top = playerPosition.y + "px";
}

function movePlayer(direction) {
    switch(direction) {
        case 'up':
            playerPosition.y -= 10;
            break;
        case 'down':
            playerPosition.y += 10;
            break;
        case 'left':
            playerPosition.x -= 10;
            break;
        case 'right':
            playerPosition.x += 10;
            break;
    }
    updatePlayerPosition();
}

function enemyAttack() {
    playerHealth -= 10;
    document.getElementById("health").innerText = `Health: ${playerHealth}`;
    if (playerHealth <= 0) {
        alert("You died!");
    }
}

function addItemToInventory() {
    inventoryCount++;
    document.getElementById("inventory").innerText = `Inventory: ${inventoryCount} items`;
}

document.addEventListener('keydown', function(event) {
    switch(event.key) {
        case 'ArrowUp': movePlayer('up'); break;
        case 'ArrowDown': movePlayer('down'); break;
        case 'ArrowLeft': movePlayer('left'); break;
        case 'ArrowRight': movePlayer('right'); break;
        case ' ': addItemToInventory(); break; // Space bar adds an item
    }
});

// Enemy attacks the player every 3 seconds
setInterval(enemyAttack, 3000);
