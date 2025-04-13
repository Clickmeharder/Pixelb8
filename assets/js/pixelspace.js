ComfyJS.onCommand = (user, command, message, flags, extra) => {
    console.log("User:", user, "command:", command);
    displayConsoleMessage(user, `!${command}`);
    
    // Store user color from extra
    if (!userColors[user]) {
        userColors[user] = extra.userColor || "orangered"; // Default to white if no color is provided
    }

    // Handle !launch command
    if (command.toLowerCase() === "launch") {
        if (!isStreamerAndAuthorize(user, command)) return;
        displayConsoleMessage(user, `!${command} ✅`);
        spawnShip(user);  // Call the spawnShip function to spawn the ship on canvas
    }
};
function spawnShip(user) {
    // Assign the user a ship with a random position and color
    const userShip = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        angle: 0,
        color: userColors[user] || "orangered",
        bullets: [],
        alive: true,
        equipment: [{ammo: 10}, {ammo: 10}], // Example equipment with ammo
        resources: { common: 0, lessCommon: 0, uncommon: 0 },
        keys: { left: "a", right: "d", thrust: "w" }
    };

    // Store the ship object for the user
    ships[user] = userShip;

    // Notify the player their ship has spawned
    displayConsoleMessage(user, `Your ship has launched!`);
}

// Move the ship based on key inputs
function moveShip(ship) {
  if (keysPressed[ship.keys.left]) ship.angle -= 0.05;
  if (keysPressed[ship.keys.right]) ship.angle += 0.05;
  if (keysPressed[ship.keys.thrust]) {
    ship.x += Math.cos(ship.angle) * 2;
    ship.y += Math.sin(ship.angle) * 2;
  }
  // Keep the ship inside the screen
  if (ship.x < 0) ship.x = canvas.width;
  if (ship.x > canvas.width) ship.x = 0;
  if (ship.y < 0) ship.y = canvas.height;
  if (ship.y > canvas.height) ship.y = canvas.height;
}

// Shoot bullets
function shootBullet(ship) {
  if (ship.alive && ship.equipment && ship.equipment[0].ammo > 0) {
    ship.equipment[0].ammo--;  // Decrease ammo
    ship.bullets.push({ x: ship.x, y: ship.y, angle: ship.angle, speed: 5 });  // Add a new bullet
  }
}

// Key events to handle shooting
window.addEventListener("keydown", (e) => {
  keysPressed[e.key.toLowerCase()] = true;
  if (e.key === " " && ships['player1'].alive) shootBullet(ships['player1']);
});
window.addEventListener("keyup", (e) => {
  keysPressed[e.key.toLowerCase()] = false;
});

function drawShip(ship) {
  if (!ship.alive) return;
  ctx.save();
  ctx.translate(ship.x, ship.y);
  ctx.rotate(ship.angle);
  ctx.beginPath();
  ctx.moveTo(10, 0); // Shape of the spaceship
  ctx.lineTo(-10, 7);
  ctx.lineTo(-5, 0);
  ctx.lineTo(-10, -7);
  ctx.closePath();
  ctx.strokeStyle = ship.color;
  ctx.stroke();
  ctx.restore();

  // Draw bullets
  ship.bullets.forEach((bullet, index) => {
    bullet.x += Math.cos(bullet.angle) * bullet.speed;
    bullet.y += Math.sin(bullet.angle) * bullet.speed;
    ctx.fillStyle = "white";
    ctx.fillRect(bullet.x, bullet.y, 3, 3);  // Draw each bullet
    if (bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
      ship.bullets.splice(index, 1);  // Remove bullets that go offscreen
    }
  });
}
function checkShipCollision(ship) {
  ship.bullets.forEach((bullet, bIndex) => {
    asteroids.forEach((asteroid, aIndex) => {
      if (Math.hypot(bullet.x - asteroid.x, bullet.y - asteroid.y) < asteroid.size) {
        // Handle asteroid destruction and resource gathering here
        ship.resources[resourceType] += 1;
        ship.bullets.splice(bIndex, 1);
        asteroids.splice(aIndex, 1);
      }
    });
  });
}