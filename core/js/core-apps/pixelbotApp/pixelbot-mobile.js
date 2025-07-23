const VIRTUAL_WIDTH = 1024;
const VIRTUAL_HEIGHT = 600;
let scale = 1.000;
function isMobile() {
  return window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
}

function resizeGameArea() {
  const gameArea = document.getElementById("gameArea");
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const scaleX = windowWidth / VIRTUAL_WIDTH;
  const scaleY = windowHeight / VIRTUAL_HEIGHT;

  scale = Math.min(scaleX, scaleY);

  gameArea.style.transform = `scale(${scale})`;
  gameArea.style.width = `${VIRTUAL_WIDTH}px`;
  gameArea.style.height = `${VIRTUAL_HEIGHT}px`;

  // Only set transform origin on mobile
  if (isMobile()) {
    gameArea.style.transformOrigin = 'top left';
  } else {
    gameArea.style.transformOrigin = 'center center'; // or default
  }
}

window.addEventListener('resize', resizeGameArea);
window.addEventListener('load', resizeGameArea);