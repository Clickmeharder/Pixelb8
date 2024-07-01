const pixelb8 = document.getElementById('pixelb8');
let x = 27; // Starting position (centered for 800x600)
let y = 34; // Starting position (centered for 800x600)
let idleTimer;

const directions = {
    ArrowUp: 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-walk-up.png',
    ArrowDown: 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-walk-down.png',
    ArrowLeft: 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-walk-left.png',
    ArrowRight: 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-walk-right.png',
    'ArrowUp+ArrowRight': 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-walk-topright.png',
    'ArrowUp+ArrowLeft': 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-walk-topleft.png',
    'ArrowDown+ArrowRight': 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-face-bottomright.png',
    'ArrowDown+ArrowLeft': 'https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-face-bottomleft.png'
};

function moveCharacter() {
    clearTimeout(idleTimer);
    pixelb8.classList.add('animate');

    document.addEventListener('keydown', (event) => {
        clearTimeout(idleTimer);
        pixelb8.classList.add('animate');
        let moved = false;

        if (event.key === 'w') {
            y = Math.max(0, y - 5);
            pixelb8.style.backgroundImage = `url(${directions['ArrowUp']})`;
            moved = true;
        } else if (event.key === 's') {
            y = Math.min(536, y + 5); // Adjusting for sprite height
            pixelb8.style.backgroundImage = `url(${directions['ArrowDown']})`;
            moved = true;
        } else if (event.key === 'a') {
            x = Math.max(0, x - 5);
            pixelb8.style.backgroundImage = `url(${directions['ArrowLeft']})`;
            moved = true;
        } else if (event.key === 'd') {
            x = Math.min(736, x + 5); // Adjusting for sprite width
            pixelb8.style.backgroundImage = `url(${directions['ArrowRight']})`;
            moved = true;
        }

        if (event.key === 'e') {
            pixelb8.style.backgroundImage = `url(${directions['ArrowUp+ArrowRight']})`;
        } else if (event.key === 'q') {
            pixelb8.style.backgroundImage = `url(${directions['ArrowUp+ArrowLeft']})`;
        } else if (event.key === 's' && event.key === 'd') {
            pixelb8.style.backgroundImage = `url(${directions['ArrowDown+ArrowRight']})`;
        } else if (event.key === 's' && event.key === 'a') {
            pixelb8.style.backgroundImage = `url(${directions['ArrowDown+ArrowLeft']})`;
        }

        if (moved) {
            pixelb8.style.left = `${x}px`;
            pixelb8.style.top = `${y}px`;
        }

        resetIdleTimer();
    });

    function resetIdleTimer() {
        idleTimer = setTimeout(() => {
            pixelb8.style.backgroundImage = 'url(https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-transform-clean.gif)';
            pixelb8.classList.add('animate');
        }, 5000); // 30 seconds
    }

    resetIdleTimer();
}

moveCharacter();