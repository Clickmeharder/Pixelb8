const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 1024;
canvas.height = 576;
const gameWidth = canvas.width;
const gameHeight = canvas.height;


function drawPixelTown() {
    ctx.fillStyle = '#7EC850'; // Green grass
    ctx.fillRect(0, 0, gameWidth, gameHeight);
    // Add more drawing code here...
}





//character code
let selectedCharacter = null;

const player = {
    x: gameWidth / 2,
    y: gameHeight / 2,
    width: 32,
    height: 32,
    color: '#ff0000'
};

const characters = {
    'Adventurer': { stats: { health: 100, attack: 50 } },
    'Archer': { stats: { health: 80, attack: 60 } },
    'Knight': { stats: { health: 150, attack: 40 } },
    'Berserker': { stats: { health: 70, attack: 70 } },
    'Empath': { stats: { health: 90, healing: 50 } }
};



function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function handleMovement() {
    document.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                player.y -= 5;
                break;
            case 'ArrowDown':
                player.y += 5;
                break;
            case 'ArrowLeft':
                player.x -= 5;
                break;
            case 'ArrowRight':
                player.x += 5;
                break;
        }
    });
}

function selectCharacter(character) {
    selectedCharacter = character;
    document.getElementById('characterSelection').style.display = 'none';
    console.log(`Selected character: ${character}`);
    startGame();
}

function startGame() {
    console.log(`Starting game with ${selectedCharacter}`);
    player.stats = characters[selectedCharacter].stats;
    gameLoop();
}

function gameLoop() {
    ctx.clearRect(0, 0, gameWidth, gameHeight);
    drawPixelTown();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

handleMovement();
