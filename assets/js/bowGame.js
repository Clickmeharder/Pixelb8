/**
 * fishyGame.js - NEW UNIQUE GAME: PRO BOW HUNT (way better than fishing!)
 * • First-person pro bow + hands (exactly like your reference photo, but with a modern compound bow)
 * • One command: !hunt
 * • Only ONE hunter at a time + clean queue
 * • Epic arrow flight with trail particles
 * • Random prey with rarity (deer, fox, eagle, legendary dragon, etc.)
 * • Scene is completely transparent until someone hunts, then fades away when done
 * • Much more dynamic & exciting than the old fishing game
 */

const canvas = document.getElementById('fishing-canvas');
const ctx = canvas.getContext('2d');

let canvasWidth, canvasHeight;
let currentHunter = null;
let queue = [];
let particles = [];
let arrowTrail = [];

const huntPrey = [
    { name: "🦌 Majestic Deer", rarity: 0.45, color: "#8B4513", scale: 1.2 },
    { name: "🦊 Clever Fox", rarity: 0.22, color: "#e67e22", scale: 1.0 },
    { name: "🦅 Golden Eagle", rarity: 0.15, color: "#f1c40f", scale: 1.4 },
    { name: "🐺 Alpha Wolf", rarity: 0.08, color: "#7f8c8d", scale: 1.3 },
    { name: "🐻 Grizzly Bear", rarity: 0.05, color: "#8d5524", scale: 1.8 },
    { name: "🐉 Legendary Dragon", rarity: 0.012, color: "#e74c3c", scale: 2.1 },
    { name: "🌟 Mythic Phoenix", rarity: 0.008, color: "#f39c12", scale: 1.6 },
    { name: "👑 Royal Elk", rarity: 0.04, color: "#2ecc71", scale: 1.5 }
];

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

function createSplash(x, y, count = 22, color = "#ffeb3b") {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 11,
            vy: (Math.random() - 0.5) * 8 - 6,
            life: 48 + Math.random() * 32,
            size: 4 + Math.random() * 5,
            color
        });
    }
}

function getRandomPrey() {
    let r = Math.random();
    let sum = 0;
    for (let prey of huntPrey) {
        sum += prey.rarity;
        if (r <= sum) return prey;
    }
    return huntPrey[0];
}

// ====================== QUEUE ======================
function tryStartHunt(user, userColor) {
    if (currentHunter) {
        queue.push({user, color: userColor || "#FFFFFF"});
        if (typeof displayChatMessage === "function") {
            displayChatMessage("HUNT", `⏳ ${user} joined the hunt queue!`, {}, {userColor: "#00f2ff"});
        }
        return;
    }
    startHunt({user, color: userColor || "#FFFFFF"});
}

function startHunt(data) {
    currentHunter = {
        user: data.user,
        color: data.color,
        state: 'drawing',
        bowX: canvasWidth * 0.78,
        bowY: canvasHeight * 0.78,
        arrowX: 0,
        arrowY: 0,
        targetX: canvasWidth * 0.32,
        targetY: canvasHeight * 0.55,
        drawStart: Date.now(),
        flightStart: 0,
        hitTime: 0,
        progress: 0,
        prey: null,
        opacity: 1
    };
}

function finishHunt() {
    if (!currentHunter) return;
    currentHunter = null;
    if (queue.length > 0) {
        const next = queue.shift();
        if (typeof displayChatMessage === "function") {
            displayChatMessage("HUNT", `🏹 ${next.user}'s turn to hunt!`, {}, {userColor: "#00f2ff"});
        }
        startHunt(next);
    }
}

// ====================== PRO BACKGROUND (same beautiful autumn lake as your photo) ======================
function drawProLakeBackground() {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.58);
    sky.addColorStop(0, '#87CEEB');
    sky.addColorStop(1, '#BCE4FF');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.58);

    // Distant forest
    ctx.fillStyle = '#2E8B57';
    for (let i = 0; i < 14; i++) {
        const x = (i * canvasWidth / 13) + (Math.random() * 20 - 10);
        ctx.beginPath();
        ctx.moveTo(x, canvasHeight * 0.58);
        ctx.lineTo(x - 42, canvasHeight * 0.58);
        ctx.lineTo(x - 21, canvasHeight * 0.37);
        ctx.fill();
    }

    // Water
    const water = ctx.createLinearGradient(0, canvasHeight * 0.58, 0, canvasHeight);
    water.addColorStop(0, '#1E7FD4');
    water.addColorStop(1, '#0B3A6B');
    ctx.fillStyle = water;
    ctx.fillRect(0, canvasHeight * 0.58, canvasWidth, canvasHeight * 0.42);

    // Ripples
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.28)";
    ctx.lineWidth = 2.8;
    for (let i = 0; i < 8; i++) {
        const y = canvasHeight * 0.62 + i * 13;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= canvasWidth; x += 42) {
            const offset = Math.sin((Date.now() / 340) + (x / 38) + i) * 7;
            ctx.quadraticCurveTo(x + 21, y + offset, x + 42, y);
        }
        ctx.stroke();
    }
    ctx.restore();
}

// ====================== PRO BOW + HANDS (exactly like the photo style) ======================
function drawProBowAndHands(hunter) {
    ctx.globalAlpha = hunter.opacity;

    const gripX = hunter.bowX;
    const gripY = hunter.bowY;

    // Jacket sleeve (dark like your photo)
    ctx.strokeStyle = '#1C2C3A';
    ctx.lineWidth = 36;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(gripX + 48, gripY + 48);
    ctx.quadraticCurveTo(gripX + 72, gripY + 18, gripX + 18, gripY - 22);
    ctx.stroke();

    // Right hand on bow grip
    ctx.fillStyle = '#F5C6AA';
    ctx.beginPath();
    ctx.ellipse(gripX + 14, gripY - 14, 27, 21, -0.6, 0, Math.PI * 2);
    ctx.fill();

    // Left hand pulling string (drawing the bow)
    const pullOffset = (hunter.state === 'drawing') ? Math.min((Date.now() - hunter.drawStart) / 1100, 1) * 68 : 0;
    ctx.fillStyle = '#F5C6AA';
    ctx.beginPath();
    ctx.ellipse(gripX - 38 - pullOffset, gripY - 38, 24, 18, 0.8, 0, Math.PI * 2);
    ctx.fill();

    // Compound bow riser + limbs (modern pro look)
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 18;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#000000';
    ctx.beginPath();
    ctx.moveTo(gripX - 12, gripY - 88);           // top limb
    ctx.quadraticCurveTo(gripX + 8, gripY - 22, gripX + 12, gripY + 38); // riser
    ctx.quadraticCurveTo(gripX + 8, gripY + 92, gripX - 14, gripY + 118); // bottom limb
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Bow string (pulled back when drawing)
    ctx.strokeStyle = '#E2E8F0';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(gripX - 12, gripY - 88);
    ctx.quadraticCurveTo(gripX - 48 - pullOffset * 0.6, gripY - 38, gripX - 14, gripY + 118);
    ctx.stroke();

    // Arrow (nocked on string)
    ctx.strokeStyle = '#F1C40F';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(gripX - 38 - pullOffset, gripY - 38);
    ctx.lineTo(gripX - 38 - pullOffset - 92, gripY - 38);
    ctx.stroke();

    // Arrow head
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.moveTo(gripX - 38 - pullOffset - 92, gripY - 38);
    ctx.lineTo(gripX - 38 - pullOffset - 112, gripY - 44);
    ctx.lineTo(gripX - 38 - pullOffset - 112, gripY - 32);
    ctx.fill();
}

// Arrow flight animation
function drawFlyingArrow(hunter) {
    if (hunter.state !== 'flying') return;

    const elapsed = Date.now() - hunter.flightStart;
    const prog = Math.min(elapsed / 920, 1);
    const eased = easeOutCubic(prog);

    hunter.arrowX = hunter.bowX - 130 + (hunter.targetX - (hunter.bowX - 130)) * eased;
    hunter.arrowY = hunter.bowY - 38 + (hunter.targetY - (hunter.bowY - 38)) * eased - Math.sin(Math.PI * eased) * 210;

    // Arrow body
    ctx.strokeStyle = '#F1C40F';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(hunter.arrowX + 22, hunter.arrowY);
    ctx.lineTo(hunter.arrowX - 42, hunter.arrowY);
    ctx.stroke();

    // Arrow head
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    ctx.moveTo(hunter.arrowX - 42, hunter.arrowY);
    ctx.lineTo(hunter.arrowX - 68, hunter.arrowY - 9);
    ctx.lineTo(hunter.arrowX - 68, hunter.arrowY + 9);
    ctx.fill();

    // Trail particles
    if (Math.random() < 0.7) {
        arrowTrail.push({
            x: hunter.arrowX - 30,
            y: hunter.arrowY,
            life: 18
        });
    }
    ctx.save();
    arrowTrail = arrowTrail.filter(t => {
        t.life--;
        ctx.globalAlpha = t.life / 18;
        ctx.fillStyle = '#F1C40F';
        ctx.fillRect(t.x, t.y, 6, 3);
        return t.life > 0;
    });
    ctx.restore();

    if (prog >= 1) {
        hunter.state = 'hit';
        hunter.hitTime = Date.now();
        hunter.prey = getRandomPrey();
        createSplash(hunter.arrowX, hunter.arrowY, 38, "#ffeb3b");
        if (typeof displayChatMessage === "function") {
            displayChatMessage("HUNT", `🏹 ${hunter.user} hunted a ${hunter.prey.name}!`, {}, {userColor: "#00f2ff"});
        }
    }
}

function drawCaughtPrey(hunter) {
    if (!hunter.prey) return;
    const elapsed = Date.now() - hunter.hitTime;
    const jump = Math.abs(Math.sin(elapsed / 140)) * 48;
    const px = canvasWidth * 0.32 + 40;
    const py = canvasHeight * 0.38 + jump;

    ctx.save();
    ctx.shadowBlur = 22;
    ctx.shadowColor = hunter.prey.color;
    ctx.font = `${38 * hunter.prey.scale}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(hunter.prey.name.split(' ')[0], px, py);
    ctx.restore();

    ctx.shadowBlur = 8;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 21px Arial';
    ctx.fillText(hunter.prey.name, px, py + 48);
    ctx.shadowBlur = 0;
}

function updateParticles() {
    ctx.save();
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.22;
        p.life--;
        ctx.globalAlpha = Math.max(0, p.life / 55);
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
        return p.life > 0;
    });
    ctx.restore();
}

function animate() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    if (!currentHunter && queue.length === 0 && particles.length === 0 && arrowTrail.length === 0) {
        requestAnimationFrame(animate);
        return;
    }

    if (currentHunter) drawProLakeBackground();

    if (currentHunter) {
        const h = currentHunter;

        if (h.state === 'drawing') {
            const elapsed = Date.now() - h.drawStart;
            h.progress = Math.min(elapsed / 1100, 1);
            if (h.progress >= 1) {
                h.state = 'flying';
                h.flightStart = Date.now();
                createSplash(h.bowX - 110, h.bowY - 38, 14, "#f1c40f");
            }
            drawProBowAndHands(h);
        }

        if (h.state === 'flying') {
            drawProBowAndHands(h);
            drawFlyingArrow(h);
        }

        if (h.state === 'hit') {
            drawProBowAndHands(h);
            drawCaughtPrey(h);

            if (Date.now() - h.hitTime > 3800) {
                h.opacity -= 0.06;
                if (h.opacity <= 0) finishHunt();
            }
        }
    }

    updateParticles();
    ctx.globalAlpha = 1;

    // Queue indicator
    if (queue.length > 0) {
        ctx.fillStyle = "rgba(0,0,0,0.65)";
        ctx.fillRect(canvasWidth - 270, 18, 250, 38);
        ctx.fillStyle = "#fff";
        ctx.font = "600 17px Arial";
        ctx.textAlign = "right";
        ctx.fillText(`Queue (${queue.length}) → ${queue[0].user}`, canvasWidth - 28, 42);
    }

    requestAnimationFrame(animate);
}

// ====================== COMMAND ======================
ComfyJS.onCommand = (user, command, message, flags, extra) => {
    if (command === "hunt") {
        tryStartHunt(user, extra.userColor);
        if (typeof playChatSound === "function") playChatSound("messageSound");
    }
};

animate();