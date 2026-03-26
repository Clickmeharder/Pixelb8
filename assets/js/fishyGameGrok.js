/**
 * fishyGame.js - PRO FIRST-PERSON PERSPECTIVE (exactly like the reference photo)
 * • Realistic hands + jacket sleeves + modern spinning reel (just like the image)
 * • Pro rod with line guides, slight bend, and carbon-fiber look
 * • Autumn lake background with distant forest + sky (matches the photo perfectly)
 * • Ice mode still works but uses the same pro rod style
 * • Only one fisher at a time + queue
 * • Scene appears only when someone is fishing and fades away completely
 */

const canvas = document.getElementById('fishing-canvas');
const ctx = canvas.getContext('2d');

let canvasWidth, canvasHeight;
let currentFisher = null;
let queue = [];
let particles = [];

const fishTypes = [
    { name: "🐟 Common Bass", rarity: 0.52, color: "#4fa3a5", scale: 1.1 },
    { name: "🐠 Tropical Guppy", rarity: 0.18, color: "#ff8c00", scale: 0.85 },
    { name: "🐡 Blowfish", rarity: 0.09, color: "#ead864", scale: 1.3 },
    { name: "🦈 Rare Shark", rarity: 0.035, color: "#4b5d67", scale: 2.4 },
    { name: "✨ Golden Koi", rarity: 0.008, color: "#ffd700", scale: 1.6 },
    { name: "👞 Old Boot", rarity: 0.04, color: "#5d4037", scale: 1.0 },
    { name: "🦀 Pinchy Crab", rarity: 0.07, color: "#e67e22", scale: 1.05 },
    { name: "🐙 Squiddy Octopus", rarity: 0.045, color: "#9b59b6", scale: 1.35 },
    { name: "💎 Lost Treasure", rarity: 0.022, color: "#3498db", scale: 1.1 },
    { name: "🌈 Rainbow Trout", rarity: 0.05, color: "#1abc9c", scale: 1.2 }
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

function createSplash(x, y, count = 18, color = "#a0e0ff") {
    for (let i = 0; i < count; i++) {
        particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 9,
            vy: (Math.random() - 0.5) * 7 - 4,
            life: 55 + Math.random() * 35,
            size: 3.5 + Math.random() * 4,
            color
        });
    }
}

function getRandomFish() {
    let r = Math.random();
    let sum = 0;
    for (let fish of fishTypes) {
        sum += fish.rarity;
        if (r <= sum) return fish;
    }
    return fishTypes[0];
}

// ====================== QUEUE ======================
function tryStartFishing(user, userColor, mode) {
    if (currentFisher) {
        queue.push({user, color: userColor || "#FFFFFF", mode});
        if (typeof displayChatMessage === "function") {
            displayChatMessage("POND", `⏳ ${user} joined the fishing queue!`, {}, {userColor: "#00f2ff"});
        }
        return;
    }
    startFishing({user, color: userColor || "#FFFFFF", mode});
}

function startFishing(data) {
    currentFisher = {
        user: data.user,
        color: data.color,
        mode: data.mode,
        state: data.mode === 'ice' ? 'augering' : 'casting',
        bobberX: canvasWidth * 0.38,
        bobberY: canvasHeight * 0.68,
        targetX: canvasWidth * 0.38,
        targetY: canvasHeight * 0.68,
        castStart: Date.now(),
        waitStart: 0,
        biteStart: 0,
        reelStart: 0,
        caughtTime: 0,
        progress: 0,
        fish: null,
        opacity: 1
    };
}

function finishFishing() {
    if (!currentFisher) return;
    currentFisher = null;
    if (queue.length > 0) {
        const next = queue.shift();
        if (typeof displayChatMessage === "function") {
            displayChatMessage("POND", `🎣 ${next.user}'s turn!`, {}, {userColor: "#00f2ff"});
        }
        startFishing(next);
    }
}

// ====================== PRO BACKGROUND (exactly like your photo) ======================
function drawProLakeBackground() {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, canvasHeight * 0.58);
    sky.addColorStop(0, '#87CEEB');
    sky.addColorStop(1, '#BCE4FF');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight * 0.58);

    // Distant autumn forest (matches the photo)
    ctx.fillStyle = '#2E8B57';
    for (let i = 0; i < 14; i++) {
        const x = (i * canvasWidth / 13) + (i % 3) * 12;
        ctx.beginPath();
        ctx.moveTo(x, canvasHeight * 0.58);
        ctx.lineTo(x - 38, canvasHeight * 0.58);
        ctx.lineTo(x - 19, canvasHeight * 0.38);
        ctx.fill();

        ctx.fillStyle = '#F4A261'; // autumn yellow/orange
        ctx.beginPath();
        ctx.ellipse(x - 19, canvasHeight * 0.52, 32, 24, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#2E8B57';
    }

    // Water / lake
    const water = ctx.createLinearGradient(0, canvasHeight * 0.58, 0, canvasHeight);
    water.addColorStop(0, '#1E7FD4');
    water.addColorStop(1, '#0B3A6B');
    ctx.fillStyle = water;
    ctx.fillRect(0, canvasHeight * 0.58, canvasWidth, canvasHeight * 0.42);

    // Surface ripples (subtle like the photo)
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.lineWidth = 2.8;
    for (let i = 0; i < 8; i++) {
        const y = canvasHeight * 0.62 + i * 13;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= canvasWidth; x += 42) {
            const offset = Math.sin((Date.now() / 340) + (x / 38) + i) * 6;
            ctx.quadraticCurveTo(x + 21, y + offset, x + 42, y);
        }
        ctx.stroke();
    }
    ctx.restore();
}

function drawIceBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    grad.addColorStop(0, '#e3f2fd');
    grad.addColorStop(1, '#81d4fa');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    ctx.strokeStyle = "rgba(255,255,255,0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(canvasWidth * 0.15, canvasHeight * 0.45);
    ctx.quadraticCurveTo(canvasWidth * 0.45, canvasHeight * 0.32, canvasWidth * 0.78, canvasHeight * 0.55);
    ctx.stroke();

    // Ice hole
    ctx.shadowBlur = 20;
    ctx.shadowColor = "#0b2c5e";
    ctx.fillStyle = "#0b2c5e";
    ctx.beginPath();
    ctx.arc(canvasWidth * 0.38, canvasHeight * 0.68, 72, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 11;
    ctx.beginPath();
    ctx.arc(canvasWidth * 0.38, canvasHeight * 0.68, 78, 0, Math.PI * 2);
    ctx.stroke();
}

// ====================== PRO ROD + HANDS (matches your reference photo) ======================
function drawProRodAndHands(fisher) {
    ctx.globalAlpha = fisher.opacity;

    const handBaseX = canvasWidth * 0.79;
    const handBaseY = canvasHeight * 0.79;

    // Right sleeve / jacket (dark like photo)
    ctx.strokeStyle = '#1C2C3A';
    ctx.lineWidth = 34;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(handBaseX + 45, handBaseY + 55);
    ctx.quadraticCurveTo(handBaseX + 65, handBaseY + 20, handBaseX + 12, handBaseY - 18);
    ctx.stroke();

    // Right hand gripping rod butt
    ctx.fillStyle = '#F5C6AA';
    ctx.beginPath();
    ctx.ellipse(handBaseX + 8, handBaseY - 12, 26, 19, -0.7, 0, Math.PI * 2);
    ctx.fill();

    // Fingers on grip
    ctx.fillStyle = '#F5C6AA';
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.ellipse(handBaseX - 12 - i * 5, handBaseY - 28 + i * 4, 7, 14, 1.1, 0, Math.PI * 2);
        ctx.fill();
    }

    // Left hand on reel (exactly like photo)
    const reelX = handBaseX - 48;
    const reelY = handBaseY - 48;
    ctx.fillStyle = '#F5C6AA';
    ctx.beginPath();
    ctx.ellipse(reelX + 18, reelY + 12, 24, 17, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Modern spinning reel body (black + silver like photo)
    ctx.fillStyle = '#1C2526';
    ctx.beginPath();
    ctx.ellipse(reelX, reelY, 31, 24, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#A8B5B8';
    ctx.beginPath();
    ctx.ellipse(reelX, reelY, 13, 13, 0, 0, Math.PI * 2);
    ctx.fill();

    // Reel handle
    ctx.strokeStyle = '#34495E';
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(reelX + 26, reelY + 6);
    ctx.lineTo(reelX + 44, reelY + 22);
    ctx.stroke();

    // Pro fishing rod (carbon look, slight bend)
    ctx.strokeStyle = '#0F1C2B';
    ctx.lineWidth = 13;
    ctx.shadowBlur = 8;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.moveTo(handBaseX + 8, handBaseY - 28); // after grip
    let tipX = handBaseX - 165;
    let tipY = handBaseY - 155;
    ctx.quadraticCurveTo(handBaseX - 85, handBaseY - 95, tipX, tipY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Rod tip section (thinner)
    ctx.strokeStyle = '#1F2A38';
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);
    ctx.lineTo(tipX - 68, tipY - 42);
    ctx.stroke();

    // Line guides (gold rings like real rods)
    ctx.strokeStyle = '#E8B923';
    ctx.lineWidth = 2.5;
    for (let i = 1; i < 6; i++) {
        const gx = handBaseX + 8 - (173 * i / 6);
        const gy = handBaseY - 28 - (127 * i / 6);
        ctx.beginPath();
        ctx.arc(gx, gy, 4.5, 0, Math.PI * 2);
        ctx.stroke();
    }

    // Fishing line from tip
    ctx.strokeStyle = 'rgba(235,245,255,0.9)';
    ctx.lineWidth = 1.9;
    ctx.beginPath();
    ctx.moveTo(tipX - 68, tipY - 42);

    // Dynamic bobber position (same logic as before but positioned to look natural)
    if (fisher.state === 'casting' && fisher.mode === 'pond') {
        const prog = fisher.progress;
        fisher.bobberX = handBaseX - 165 + (fisher.targetX - (handBaseX - 165)) * prog;
        fisher.bobberY = handBaseY - 155 + (fisher.targetY - (handBaseY - 155)) * prog - Math.sin(Math.PI * prog) * 195;
    } else if (fisher.state === 'reeling') {
        const prog = Math.min((Date.now() - fisher.reelStart) / 1150, 1);
        const eased = easeOutCubic(prog);
        fisher.bobberX = fisher.targetX + ((tipX - 68) - fisher.targetX) * eased;
        fisher.bobberY = fisher.targetY + ((tipY - 42) - fisher.targetY) * eased;
    }

    ctx.quadraticCurveTo(tipX - 30, tipY - 65, fisher.bobberX, fisher.bobberY);
    ctx.stroke();
}

function drawBobber(fisher) {
    let bobY = fisher.bobberY;
    if (fisher.state === 'waiting') {
        const t = (Date.now() - fisher.waitStart) / 280;
        bobY += Math.sin(t * 4.5) * 7 + Math.sin(t * 11) * 2;
    } else if (fisher.state === 'biting') {
        const prog = Math.min((Date.now() - fisher.biteStart) / 420, 1);
        bobY += 32 * Math.sin(prog * Math.PI * 2);
    }

    ctx.fillStyle = '#ff2222';
    ctx.beginPath();
    ctx.arc(fisher.bobberX, bobY, 8, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(fisher.bobberX, bobY, 3.5, 0, Math.PI);
    ctx.fill();
}

function drawCaughtFish(fisher) {
    if (!fisher.fish) return;
    const elapsed = Date.now() - fisher.caughtTime;
    const jump = Math.abs(Math.sin(elapsed / 160)) * 45;
    const fx = canvasWidth * 0.38 + 35;
    const fy = canvasHeight * 0.38 + jump;

    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = fisher.fish.color;
    ctx.font = `${36 * fisher.fish.scale}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(fisher.fish.name.split(' ')[0], fx, fy);
    ctx.restore();

    ctx.shadowBlur = 6;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 19px Arial';
    ctx.fillText(fisher.fish.name, fx, fy + 44);
    ctx.shadowBlur = 0;
}

function updateParticles() {
    ctx.save();
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.19;
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

    if (!currentFisher && queue.length === 0 && particles.length === 0) {
        requestAnimationFrame(animate);
        return;
    }

    // Background
    if (currentFisher) {
        if (currentFisher.mode === 'pond') drawProLakeBackground();
        else drawIceBackground();
    }

    if (currentFisher) {
        const f = currentFisher;

        // Casting / augering
        if (f.state === 'casting' && f.mode === 'pond') {
            const elapsed = Date.now() - f.castStart;
            f.progress = Math.min(elapsed / 780, 1);
            if (f.progress >= 1) {
                f.state = 'waiting';
                f.waitStart = Date.now();
                createSplash(f.bobberX, f.bobberY, 16);
                const waitTime = 2600 + Math.random() * 6200;
                setTimeout(() => { if (f.state === 'waiting') triggerBite(f); }, waitTime);
            }
        }

        if (f.state === 'augering' && f.mode === 'ice') {
            const elapsed = Date.now() - f.castStart;
            if (elapsed > 1100) {
                f.state = 'waiting';
                f.waitStart = Date.now();
                createSplash(f.bobberX, f.bobberY + 12, 24, "#88ddff");
                const waitTime = 2400 + Math.random() * 5800;
                setTimeout(() => { if (f.state === 'waiting') triggerBite(f); }, waitTime);
            }
        }

        // Reeling
        if (f.state === 'reeling') {
            const elapsed = Date.now() - f.reelStart;
            const prog = Math.min(elapsed / 1150, 1);
            if (prog >= 1) {
                f.state = 'caught';
                f.caughtTime = Date.now();
                createSplash(f.bobberX, f.bobberY + 10, 32, "#ffdd66");
                if (typeof displayChatMessage === "function") {
                    displayChatMessage("POND", `🌟 ${f.user} reeled in a ${f.fish.name}!`, {}, {userColor: "#00f2ff"});
                }
            }
        }

        drawProRodAndHands(f);
        if (f.state !== 'caught') drawBobber(f);
        if (f.state === 'caught') drawCaughtFish(f);

        if (f.state === 'caught' && Date.now() - f.caughtTime > 4200) {
            f.opacity -= 0.055;
            if (f.opacity <= 0) finishFishing();
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

function triggerBite(f) {
    f.state = 'biting';
    f.biteStart = Date.now();
    createSplash(f.bobberX, f.bobberY + 8, 26, "#00bbff");

    setTimeout(() => {
        if (f.state === 'biting') {
            f.state = 'reeling';
            f.reelStart = Date.now();
            f.fish = getRandomFish();
        }
    }, 420);
}

// ====================== COMMANDS ======================
ComfyJS.onCommand = (user, command, message, flags, extra) => {
    if (command === "fish" || command === "icefish") {
        const mode = command === "icefish" ? "ice" : "pond";
        tryStartFishing(user, extra.userColor, mode);
        if (typeof playChatSound === "function") playChatSound("messageSound");
    }
};

animate();