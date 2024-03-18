const dieSounds = ["die_Sound1", "die_Sound2", "die_Sound3"];
const eatSounds = ["eat_Sound1", "eat_Sound2", "eat_Sound3", "eat_Sound4"];
const canvas = document.getElementById("snakeCanvas");
const context = canvas.getContext("2d");
const gridSize = 4;
let score = 0;
let snake = [{ x: 5, y: 5 }];
let food = { x: 10, y: 10 };
let direction = "right";
let highscores = JSON.parse(localStorage.getItem("highscores")) || [
  { name: "Player1", score: 10 },
  { name: "Player2", score: 9 },
  { name: "Player1", score: 8 },
  { name: "Player2", score: 7 },
  { name: "Player1", score: 6 },
  { name: "Player2", score: 5 },
];
let isShiftPressed = false;
let gameInterval = 150; // Base interval for normal speed
const resetButton = document.getElementById("resetButton");
resetButton.addEventListener("click", function () {
  startSnakeGame();
});
function startSnakeGame() {
  // Reset all relevant variables to initial values
  score = 0;
  snake = [{ x: 5, y: 5 }];
  food = { x: 10, y: 10 };
  direction = "right";
  isShiftPressed = false;
  gameInterval = 150;

  // Clear the game interval if it's running
  clearInterval(gameIntervalId);

  // Generate new food position
  generateFood();

  // Start the game again with the updated initial values
  gameIntervalId = setInterval(updateGameArea, gameInterval);
}

function drawSnakePart(part, isFast) {
  context.fillStyle = isFast ? "blue" : "grey"; // Change color for fast speed
  context.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);

  // Draw a border around the grid element
  context.strokeStyle = "black";
  context.lineWidth = 1;
  context.strokeRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
}

function drawFood() {
  context.fillStyle = "#8A2BE2";
  context.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function updateGameArea() {
  context.clearRect(0, 0, canvas.width, canvas.height);

  // Move the snake
  const newHead = { x: snake[0].x, y: snake[0].y };
  switch (direction) {
    case "up":
      newHead.y--;
      break;
    case "down":
      newHead.y++;
      break;
    case "left":
      newHead.x--;
      break;
    case "right":
      newHead.x++;
      break;
  }
  // Increment score for moving
  score += isShiftPressed ? 2 : 1;
  // Check for collision with food
  if (newHead.x === food.x && newHead.y === food.y) {
    snake.push({});
    generateFood();
    score += isShiftPressed ? 100 : 25; // Increment score for eating food
    if (Math.random() <= 0.25) {
      const randomEatIndex = Math.floor(Math.random() * eatSounds.length);
      playSound(eatSounds[randomEatIndex]); // Play a random "eat" sound
      // Listen for the "ended" event on the eatSound audio element
      eatSound.addEventListener("ended", function () {});
    } else {
      playSound("gulp_Sound1"); // Play a random "gulp" sound
    }
  }
  // Update the score display
  const scoreDisplay = document.getElementById("scoreDisplay");
  scoreDisplay.textContent = `Score: ${score}`;

  // Check for collision with walls or self
  if (
    newHead.x < 0 ||
    newHead.y < 0 ||
    newHead.x >= canvas.width / gridSize ||
    newHead.y >= canvas.height / gridSize ||
    snake.some((part) => part.x === newHead.x && part.y === newHead.y)
  ) {
    clearInterval(gameIntervalId);
    displayGameOver(); // Call the function to display game over
    const randomIndex = Math.floor(Math.random() * dieSounds.length); //choose random sound
    playSound(dieSounds[randomIndex]); // Play the "die" sound

    return;
  }

  // Move the tail
  for (let i = snake.length - 1; i > 0; i--) {
    snake[i] = { ...snake[i - 1] };
  }
  snake[0] = newHead;

  // Draw game elements
  snake.forEach((part) => drawSnakePart(part, isShiftPressed)); // Pass the isShiftPressed value
  drawFood();
}

function generateFood() {
  food = {
    x: Math.floor(Math.random() * (canvas.width / gridSize)),
    y: Math.floor(Math.random() * (canvas.height / gridSize)),
  };
}

const speedDisplay = document.createElement("div");
speedDisplay.setAttribute("id", "speedDisplay");
speedDisplay.style.marginTop = "";
speedDisplay.style.fontFamily = "Arial, sans-serif";
speedDisplay.style.fontSize = "14px";
speedDisplay.style.color = "white";
speedDisplay.textContent = `Speed: ----`;

// Append speedIndicator and speedDisplay to displayhud-container
const displayHudContainer = document.querySelector(".displayhud-container");
displayHudContainer.appendChild(speedIndicator);
displayHudContainer.appendChild(speedDisplay);

document.addEventListener("keydown", function (event) {
  switch (event.key) {
    case "ArrowUp":
    case "w":
    case "W":
      playSound("move_Sound"); // Play the "up" sound
      direction = "up";
      break;
    case "ArrowDown":
    case "s":
    case "S":
      playSound("move_Sound"); // Play the "down" sound
      direction = "down";
      break;
    case "ArrowLeft":
    case "a":
    case "A":
      playSound("move_Sound"); // Play the "left" sound
      direction = "left";
      break;
    case "ArrowRight":
    case "d":
    case "D":
      direction = "right";
      playSound("move_Sound"); // Play the "right" sound
      break;
    case "Shift":
      isShiftPressed = true;
      gameInterval = isShiftPressed ? 50 : 150; // Adjust the interval for faster speed
      speedIndicator.style.backgroundColor = "green";
      speedDisplay.textContent = "Speed: Fast";
      clearInterval(gameIntervalId);
      gameIntervalId = setInterval(updateGameArea, gameInterval);
      gameInterval = isShiftPressed ? baseInterval / 2 : baseInterval;
      updateSpeedGauge();
      break;
  }
});

const saveScoreButton = document.getElementById("savescoreButton");

saveScoreButton.addEventListener("click", function () {
  // Prompt the player for their name
  const playerName = prompt("Congratulations! You've achieved a high score. Please enter your name:");

  if (playerName) {
    // Check if the score qualifies for the highscores list
    const lowestHighscore = highscores[highscores.length - 1];
    if (score > lowestHighscore.score) {
      // Update the lowest highscore with the new score and name
      lowestHighscore.name = playerName;
      lowestHighscore.score = score;

      // Sort and save highscores to localStorage
      highscores.sort((a, b) => b.score - a.score);
      localStorage.setItem("highscores", JSON.stringify(highscores));

      // Call displayHighscores to refresh the displayed high scores
      displayHighscores();
    } else {
      alert("Your score is not high enough to make it to the top 10 highscores.");
    }
  }
});

document.addEventListener("keyup", function (event) {
  if (event.key === "Shift") {
    baseInterval = 50;
    isShiftPressed = false;
    gameInterval = 150; // Reset interval to normal speed
    speedIndicator.style.backgroundColor = "black";
    speedDisplay.textContent = "Speed: Normal";
    clearInterval(gameIntervalId);
    gameIntervalId = setInterval(updateGameArea, gameInterval);
    gameInterval = baseInterval;
    updateSpeedGauge();
  }
});

let gameIntervalId;

//----------------------------------------//
//----------------------------
// Game over, man...Game Over.
//----------------------------
//----------------------------

function displayGameOver() {
  // Disable key press events for 2 seconds
  let isKeyPressDisabled = true;
  setTimeout(() => {
    isKeyPressDisabled = false;
  }, 2000);

  context.fillStyle = "black";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "green";
  context.font = "bold 16px Arial";

  const gameOverText = "Game Over man... Game over...";
  let currentIndex = 0;
  speedIndicator.style.backgroundColor = "red";

  function typeNextCharacter() {
    if (currentIndex < gameOverText.length) {
      context.clearRect(0, canvas.height / 2 - 20, canvas.width, 40);
      context.fillText(gameOverText.substring(0, currentIndex + 1), canvas.width / 3 - 70, canvas.height / 2);
      currentIndex++;
      setTimeout(typeNextCharacter, 100); // Adjust the delay between characters if needed
    } else {
      context.textDecoration = "none"; // Reset text decoration
      context.font = "14px Arial";
      context.fillText("Press any key to retry", canvas.width / 1.72 - 110, canvas.height / 2 + 40);
    }
  }

  setTimeout(typeNextCharacter, 1000);

  // Listen for key press events only if key press is not disabled
  document.addEventListener("keydown", function handleKeyPress(event) {
    if (!isKeyPressDisabled) {
      document.removeEventListener("keydown", handleKeyPress);

      if (event.key !== "Shift") {
        isShiftPressed = false;
        startSnakeGame();
        // Reload the page to restart the game
      }
    }
  });
}

//----------------------------
// Speed gauge -------------
//----------------------------
//
function updateSpeedGauge() {
  const maxSpeed = 300; // Adjust as needed
  const normalizedSpeed = gameInterval / maxSpeed;
  const speedIndicator = document.getElementById("speedIndicator");
  const speedDisplay = document.getElementById("speedDisplay"); // Make sure to get the speedDisplay element

  speedIndicator.style.width = "10px";
  speedIndicator.style.height = "10px"; // Set a fixed height for the speedIndicator

  speedDisplay.textContent = `Speed: ${isShiftPressed ? "Fast" : "Normal"}`;
}

//=======================
//-----------------------
//       HIGHSCORES
//-----------------------
//=======================

function displayHighscores() {
  const highscoresList = document.getElementById("highscores-list");
  highscoresList.innerHTML = "";

  highscores.forEach((entry, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `${index + 1}. ${entry.name}: ${entry.score}`;
    highscoresList.appendChild(listItem);
  });
}

// Call displayHighscores to show the highscores on your highscores page
displayHighscores();

//=======================
//-----------------------
//       SOUNDS
//-----------------------
//=======================

function playSound(soundId) {
  const soundElement = document.getElementById(soundId);
  soundElement.currentTime = 0;
  soundElement.play();
}

document.getElementById("hud-sus-snake").addEventListener("transitionend", function () {
  if (!this.classList.contains("hidden")) {
    startSnakeGame();
  }
});
