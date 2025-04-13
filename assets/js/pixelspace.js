    const streamSpace = document.getElementById('streamSpace');

    // --- Global Variables ---
    let userShip = null;
    let colonistShips = [];
    let satellites = [];
    let gameOver = false;

    // --- Colonist Ship Class ---
    class ColonistShip {
      constructor(x, y) {
        this.element = document.createElement('div');
        this.element.classList.add('ship');
        this.x = x;
        this.y = y;
        this.health = 100;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        streamSpace.appendChild(this.element);
      }
      move() {
        // Simple idle movement for colonist ships
        const angle = Math.random() * Math.PI * 2;  // Random direction
        this.x += Math.cos(angle) * 2;
        this.y += Math.sin(angle) * 2;

        if (this.x < 0) this.x = streamSpace.offsetWidth;
        if (this.x > streamSpace.offsetWidth) this.x = 0;
        if (this.y < 0) this.y = streamSpace.offsetHeight;
        if (this.y > streamSpace.offsetHeight) this.y = 0;

        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
      }
    }

    // --- Satellite Class ---
    class Satellite {
      constructor(x, y) {
        this.element = document.createElement('div');
        this.element.classList.add('satellite');
        this.x = x;
        this.y = y;
        this.element.style.left = `${x}px`;
        this.element.style.top = `${y}px`;
        streamSpace.appendChild(this.element);
      }
    }

    // --- User Ship Class (Movement along border) ---
    class UserShip {
      constructor() {
        this.element = document.createElement('div');
        this.element.classList.add('ship');
        this.x = 0;
        this.y = 0;
        this.direction = 'right'; // Start moving to the right
        this.element.style.left = `${this.x}px`;
        this.element.style.top = `${this.y}px`;
        streamSpace.appendChild(this.element);

        // Start moving the ship
        this.moveAlongBorder();
      }

      moveAlongBorder() {
        const moveInterval = setInterval(() => {
          switch (this.direction) {
            case 'right':
              this.x += 2;
              if (this.x >= streamSpace.offsetWidth - 50) this.direction = 'down'; // Change direction to down at the right edge
              break;
            case 'down':
              this.y += 2;
              if (this.y >= streamSpace.offsetHeight - 50) this.direction = 'left'; // Change direction to left at the bottom edge
              break;
            case 'left':
              this.x -= 2;
              if (this.x <= 0) this.direction = 'up'; // Change direction to up at the left edge
              break;
            case 'up':
              this.y -= 2;
              if (this.y <= 0) this.direction = 'right'; // Change direction to right at the top edge
              break;
          }

          this.element.style.left = `${this.x}px`;
          this.element.style.top = `${this.y}px`;

        }, 16); // Move every ~16ms for smooth movement (60fps)
      }
    }

    // --- Command Handlers (Twitch) ---
    function spawnColonistShip(user) {
      const x = Math.random() * streamSpace.offsetWidth;
      const y = Math.random() * streamSpace.offsetHeight;
      const colonistShip = new ColonistShip(x, y);
      colonistShips.push(colonistShip);
      displayConsoleMessage(user, `Colonist ship spawned at (${x}, ${y})!`);
    }

    function spawnSatellite(user) {
      const x = Math.random() * streamSpace.offsetWidth;
      const y = Math.random() * streamSpace.offsetHeight;
      const satellite = new Satellite(x, y);
      satellites.push(satellite);
      displayConsoleMessage(user, `Satellite launched at (${x}, ${y})!`);
    }

    function displayConsoleMessage(user, message) {
      console.log(`${user}: ${message}`);
    }

    // --- Command Trigger (Simulating Twitch Chat Commands) ---
    function onCommandReceived(user, command) {
      if (command.toLowerCase() === 'launch') {
        spawnColonistShip(user);
      } else if (command.toLowerCase() === 'launch-sat') {
        spawnSatellite(user);
      }
    }

    // Example commands (You can replace these with actual Twitch command handling)
    setTimeout(() => onCommandReceived("streamer", "launch"), 1000);  // Simulate !launch command
    setTimeout(() => onCommandReceived("streamer", "launch-sat"), 5000);  // Simulate !launch-sat command

    // Create the user ship and start its movement along the border
    userShip = new UserShip();
