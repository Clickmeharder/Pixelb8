    class Asteroid {
      constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
        this.shape = this.generateShape();
      }
      generateShape() {
        let points = [];
        let sides = 6 + Math.floor(Math.random() * 4);
        for (let i = 0; i < sides; i++) {
          let angle = (Math.PI * 2 * i) / sides;
          let radius = this.size * (0.8 + Math.random() * 0.4);
          points.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius });
        }
        return points;
      }
      move() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = canvas.height;
      }
      draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        this.shape.forEach((point, index) => {
          if (index === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        });
        ctx.closePath();
        ctx.strokeStyle = "white";
        ctx.stroke();
        ctx.restore();
      }
    }

    // --- WeaponGenerator Class ---
    class WeaponGenerator {
      constructor() {
        this.ammo = 0;
        this.maxAmmo = 500;
        this.lastUpdate = Date.now();
        this.generateRate = 1; // 1 ammo per second
        this.type = "weaponGen";
        this.name = "Basic Weapon Generator";
      }
      update() {
        let now = Date.now();
        let delta = now - this.lastUpdate;
        if (delta >= 1000) {
          let increments = Math.floor(delta / 1000);
          this.ammo = Math.min(this.maxAmmo, this.ammo + increments);
          this.lastUpdate += increments * 1000;
        }
      }
    }

    // --- ResearchDrone Class ---
    class ResearchDrone {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.dataCollectionProgress = 0;
        this.dataTransmissionProgress = 0;
        this.transmissionReceived = false;
        this.collecting = true;
        this.transmitting = false;
      }
      update(deltaTime) {
        if (this.collecting) {
          this.dataCollectionProgress += deltaTime * 0.01; // adjust rate as needed
          if (this.dataCollectionProgress >= 100) {
            this.dataCollectionProgress = 100;
            this.collecting = false;
            this.transmitting = true;
          }
        } else if (this.transmitting) {
          this.dataTransmissionProgress += deltaTime * 0.02; // adjust rate as needed
          if (this.dataTransmissionProgress >= 100) {
            this.dataTransmissionProgress = 100;
            this.transmitting = false;
            this.transmissionReceived = true;
          }
        }
      }
      draw(ctx) {
        ctx.save();
        ctx.fillStyle = "cyan";
        ctx.beginPath();
        ctx.arc(this.x, this.y, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    }

// --- Ship Class (Player 1 Only) ---
class Ship {
  constructor(x, y, color, keys, player) {
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.color = color;
    this.keys = keys;
    this.bullets = [];
    this.alive = true;
    this.player = player;
    // Resources: common = Iron, lessCommon = Copper, uncommon = Titanium
    this.resources = { common: 0, lessCommon: 0, uncommon: 0, researchData: 0 };
    this.equipment = [null, null];
    this.inventory = [];
    // Crafting properties
    this.craftingLevel = 1;
    this.craftingXP = 0;
    this.craftingXPNeeded = 10;

    // Research drone (store instance when deployed)
    this.deployedResearchDrone = null;
    this.currentCraftingProcess = null;
  }
  move() {
    moveShip(this);
  }
  shoot() {
    shootBullet(this);
  }
  checkCollision() {
    checkShipCollision(this);
  }
  draw() {
    drawShip(this);
  }
}
