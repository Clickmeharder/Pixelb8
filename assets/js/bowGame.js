/**
 * fishyGame.js - FULLY ANIMATED VECTOR BOW HUNT (no images needed!)
 * • Super smooth, high-quality canvas animations (way better than before)
 * • Real compound bow with tension string, cams, and draw animation
 * • Arrow flies with rotation + glowing trail + wind effect
 * • Animated background (swaying forest + rippling lake + sky gradient)
 * • Prey pops in with impact flash + breathing animation
 * • Still 100% transparent for OBS until someone types !hunt
 * • One hunter at a time + queue
 */

const canvas = document.getElementById('fishing-canvas');
const ctx = canvas.getContext('2d');

let canvasWidth, canvasHeight;
let currentHunter = null;
let queue = [];
let particles = [];
let arrowTrail = [];

const huntPrey = [
    { name: "🦌 Majestic Deer", rarity: 0.45, color: "#8B4513", scale: 1.25 },
    { name: "🦊 Clever Fox", rarity: 0.22, color: "#e67e22", scale: 1.05 },
    { name: "🦅 Golden Eagle", rarity: 0.15, color: "#f1c40f", scale: 1.45 },
    { name: "🐺 Alpha Wolf", rarity: 0.08, color: "#7f8c8d", scale: 1.35 },
    { name: "🐻 Grizzly Bear", rarity: 0.05, color: "#8d5524", scale: 1.85 },
    { name: "🐉 Legendary Dragon", rarity: 0.012, color: "#e74c3c", scale: 2.2 },
    { name: "🌟 Mythic Phoenix", rarity: 0.008, color: "#f39c12", scale: 1.7 }
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

function createImpact(x, y, count = 35, color = "#ffeb3b") {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 14,
            vy: (Math.random() - 0.5) * 12 - 8,
            life: 60 + Math.random() * 40,
            size: 4.5 + Math.random() * 6,
            color,
            gravity: 0.25
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
        drawStart: Date.now(),
        flightStart: 0,
        hitTime: 0,
        arrowX: 0,
        arrowY: 0,
        targetX: canvasWidth * 0.29,
        targetY: canvasHeight * 0.47,
        prey: null,
        opacity: 1,
        bowTension: 0
    };
}

function finishHunt() {
    if (!currentHunter) return;
    currentHunter = null;
    if (queue.length > 0) {
        const next = queue.shift();
        if (typeof displayChatMessage === "function") {
            displayChatMessage("HUNT", `🏹 ${next.user}'s turn!`, {}, {userColor: "#00f2ff"});
        }
        startHunt(next);
    }
}

// ====================== ANIMATED BACKGROUND ======================
function drawAnimatedBackground() {
    // Sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.58);
    sky.addColorStop(0, '#7ec0ee');
    sky.addColorStop(1, '#c3e0ff');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.58);

    // Animated forest (gentle sway)
    const time = Date.now() / 1200;
    ctx.fillStyle = '#1e6b3a';
    for (let i = 0; i < 18; i++) {
        const sway = Math.sin(time + i) * 8;
        const x = (i * canvasWidth / 17) + sway;
        ctx.beginPath();
        ctx.moveTo(x, canvasHeight * 0.58);
        ctx.lineTo(x - 48, canvasHeight * 0.58);
        ctx.lineTo(x - 24, canvasHeight * 0.34);
        ctx.fill();
    }

    // Lake water
    const water = ctx.createLinearGradient(0, canvasHeight * 0.58, 0, canvasHeight);
    water.addColorStop(0, '#1e7fd4');
    water.addColorStop(1, '#0b3a6b');
    ctx.fillStyle = water;
    ctx.fillRect(0, canvasHeight * 0.58, canvasWidth, canvasHeight * 0.42);

    // Multi-layer animated ripples
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2.8;
    for (let i = 0; i < 9; i++) {
        const y = canvasHeight * 0.64 + i * 14;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= canvasWidth; x += 38) {
            const offset = Math.sin((Date.now() / 280) + (x / 35) + i * 1.3) * 9;
            ctx.quadraticCurveTo(x + 19, y + offset, x + 38, y);
        }
        ctx.stroke();
    }
    ctx.restore();
}

// ====================== PRO ANIMATED BOW + HANDS ======================
function drawAnimatedBow(hunter) {
    ctx.globalAlpha = hunter.opacity;
    const baseX = canvasWidth * 0.78;
    const baseY = canvasHeight * 0.79;

    // Jacket sleeve
    ctx.strokeStyle = '#1c2c3a';
    ctx.lineWidth = 38;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(baseX + 52, baseY + 52);
    ctx.quadraticCurveTo(baseX + 78, baseY + 12, baseX + 22, baseY - 28);
    ctx.stroke();

    // Right hand on grip
    ctx.fillStyle = '#f5c6aa';
    ctx.beginPath();
    ctx.ellipse(baseX + 18, baseY - 18, 29, 22, -0.65, 0, Math.PI * 2);
    ctx.fill();

    // Left hand pulling string
    const tension = hunter.state === 'drawing' 
        ? Math.min((Date.now() - hunter.drawStart) / 1150, 1) 
        : (hunter.state === 'flying' ? 0 : 0.1);
    hunter.bowTension = tension;

    ctx.fillStyle = '#f5c6aa';
    ctx.beginPath();
    ctx.ellipse(baseX - 42 - tension * 72, baseY - 42, 26, 19, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Compound bow body (modern carbon look)
    ctx.strokeStyle = '#111827';
    ctx.lineWidth = 19;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#00000088';
    ctx.beginPath();
    ctx.moveTo(baseX + 8, baseY - 95);                    // top limb
    ctx.quadraticCurveTo(baseX + 18, baseY - 28, baseX + 14, baseY + 42); // riser
    ctx.quadraticCurveTo(baseX + 12, baseY + 95, baseX - 12, baseY + 122); // bottom limb
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Cams (the wheels on compound bows)
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(baseX - 8, baseY - 95, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(baseX - 8, baseY + 122, 11, 0, Math.PI * 2);
    ctx.fill();

    // Bow string (animated tension)
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 4.2;
    ctx.beginPath();
    ctx.moveTo(baseX - 8, baseY - 95);
    ctx.quadraticCurveTo(baseX - 48 - tension * 78, baseY - 42, baseX - 12, baseY + 122);
    ctx.stroke();

    // Arrow nocked (moves with tension)
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 5.5;
    ctx.beginPath();
    ctx.moveTo(baseX - 42 - tension * 72, baseY - 42);
    ctx.lineTo(baseX - 42 - tension * 72 - 105, baseY - 42);
    ctx.stroke();

    // Arrowhead
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(baseX - 42 - tension * 72 - 105, baseY - 42);
    ctx.lineTo(baseX - 42 - tension * 72 - 132, baseY - 50);
    ctx.lineTo(baseX - 42 - tension * 72 - 132, baseY - 34);
    ctx.fill();
}

// Arrow flight + trail
function drawFlyingArrow(hunter) {
    if (hunter.state !== 'flying') return;

    const elapsed = Date.now() - hunter.flightStart;
    const prog = Math.min(elapsed / 880, 1);
    const eased = easeOutCubic(prog);

    hunter.arrowX = canvasWidth * 0.71 + (hunter.targetX - canvasWidth * 0.71) * eased;
    hunter.arrowY = canvasHeight * 0.66 + (hunter.targetY - canvasHeight * 0.66) * eased - Math.sin(Math.PI * eased) * 235;

    const angle = Math.atan2(
        (hunter.targetY - hunter.arrowY),
        (hunter.targetX - hunter.arrowX)
    ) + Math.sin(elapsed / 80) * 0.04; // slight wobble

    ctx.save();
    ctx.translate(hunter.arrowX, hunter.arrowY);
    ctx.rotate(angle);
    ctx.strokeStyle = '#fcd34d';
    ctx.lineWidth = 6;
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#fcd34d';
    ctx.beginPath();
    ctx.moveTo(28, 0);
    ctx.lineTo(-58, 0);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Arrowhead
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(-58, 0);
    ctx.lineTo(-88, -12);
    ctx.lineTo(-88, 12);
    ctx.fill();
    ctx.restore();

    // Glowing trail
    if (Math.random() < 0.85) {
        arrowTrail.push({x: hunter.arrowX - 45, y: hunter.arrowY, life: 24});
    }
    ctx.save();
    arrowTrail = arrowTrail.filter(t => {
        t.life--;
        ctx.globalAlpha = t.life / 24;
        ctx.fillStyle = '#fcd34d';
        ctx.fillRect(t.x, t.y, 11, 4);
        return t.life > 0;
    });
    ctx.restore();

    if (prog >= 1) {
        hunter.state = 'hit';
        hunter.hitTime = Date.now();
        hunter.prey = getRandomPrey();
        createImpact(hunter.arrowX, hunter.arrowY, 48, "#ffeb3b");
        if (typeof displayChatMessage === "function") {
            displayChatMessage("HUNT", `🏹 ${hunter.user} hunted a ${hunter.prey.name}!`, {}, {userColor: "#00f2ff"});
        }
    }
}

function drawHitPrey(hunter) {
    if (!hunter.prey) return;

    const elapsed = Date.now() - hunter.hitTime;
    const breath = Math.sin(elapsed / 180) * 6;
    const px = hunter.targetX + 55;
    const py = hunter.targetY - 95 + breath;

    ctx.save();
    ctx.shadowBlur = 28;
    ctx.shadowColor = hunter.prey.color;
    ctx.font = `${44 * hunter.prey.scale}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(hunter.prey.name.split(' ')[0], px, py);
    ctx.restore();

    ctx.shadowBlur = 10;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 23px Arial';
    ctx.fillText(hunter.prey.name, px, py + 56);
    ctx.shadowBlur = 0;
}

function updateParticles() {
    ctx.save();
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity || 0.22;
        p.life--;
        ctx.globalAlpha = Math.max(0, p.life / 65);
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

    drawAnimatedBackground();

    if (currentHunter) {
        const h = currentHunter;

        if (h.state === 'drawing') {
            const elapsed = Date.now() - h.drawStart;
            if (elapsed > 1180) {
                h.state = 'flying';
                h.flightStart = Date.now();
            }
            drawAnimatedBow(h);
        }

        if (h.state === 'flying') {
            drawAnimatedBow(h);
            drawFlyingArrow(h);
        }

        if (h.state === 'hit') {
            drawAnimatedBow(h);
            drawHitPrey(h);

            if (Date.now() - h.hitTime > 3900) {
                h.opacity -= 0.07;
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