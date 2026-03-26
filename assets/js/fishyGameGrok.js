/**
 * fishyGame.js - FIRST-PERSON PERSPECTIVE FISHING (pond + ice)
 * • Only ONE person fishes at a time
 * • Queue system for multiple !fish / !icefish
 * • Beautiful first-person rod + hands
 * • Pond cast OR ice auger + drop
 * • Scene only appears while someone is fishing, then fully fades away
 */

const canvas = document.getElementById('fishing-canvas');
const ctx = canvas.getContext('2d');

let canvasWidth, canvasHeight;
let currentFisher = null;     // {user, color, mode: 'pond'|'ice', state, ...}
let queue = [];               // waiting users
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

// ====================== QUEUE & START ======================
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
        bobberX: canvasWidth / 2,
        bobberY: canvasHeight * 0.62,
        targetX: canvasWidth / 2 + (Math.random() * 140 - 70),
        targetY: canvasHeight * 0.68,
        castStart: Date.now(),
        waitStart: 0,
        biteStart: 0,
        reelStart: 0,
        caughtTime: 0,
        progress: 0,
        fish: null,
        opacity: 1,
        lineLength: 0
    };

    if (currentFisher.mode === 'ice') {
        currentFisher.bobberX = canvasWidth / 2;   // always center hole
        currentFisher.targetX = canvasWidth / 2;
    }
}

function finishFishing() {
    if (!currentFisher) return;
    const wasUser = currentFisher.user;
    currentFisher = null;

    // start next in queue
    if (queue.length > 0) {
        const next = queue.shift();
        if (typeof displayChatMessage === "function") {
            displayChatMessage("POND", `🎣 ${next.user}'s turn!`, {}, {userColor: "#00f2ff"});
        }
        startFishing(next);
    }
}

// ====================== DRAW HELPERS ======================
function drawPondBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, canvasHeight);
    grad.addColorStop(0, '#0f4c8a');
    grad.addColorStop(1, '#1e7fd4');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // surface reflection
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 7; i++) {
        const y = canvasHeight * 0.55 + i * 11;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= canvasWidth; x += 38) {
            const offset = Math.sin(Date.now() / 320 + x / 40 + i) * 7;
            ctx.quadraticCurveTo(x + 19, y + offset, x + 38, y);
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

    // ice cracks
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(canvasWidth * 0.2, canvasHeight * 0.45);
    ctx.quadraticCurveTo(canvasWidth * 0.4, canvasHeight * 0.38, canvasWidth * 0.65, canvasHeight * 0.52);
    ctx.moveTo(canvasWidth * 0.35, canvasHeight * 0.6);
    ctx.quadraticCurveTo(canvasWidth * 0.7, canvasHeight * 0.48, canvasWidth * 0.85, canvasHeight * 0.65);
    ctx.stroke();

    // ice hole
    ctx.shadowBlur = 15;
    ctx.shadowColor = "#0b2c5e";
    ctx.fillStyle = "#0b2c5e";
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, canvasHeight * 0.67, 68, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.fillStyle = "#ffffff";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.arc(canvasWidth / 2, canvasHeight * 0.67, 72, 0, Math.PI * 2);
    ctx.stroke();
}

function drawFirstPersonRod(fisher) {
    const handX = canvasWidth / 2 - 30;
    const handY = canvasHeight - 70;

    ctx.globalAlpha = fisher.opacity;

    // hand
    ctx.fillStyle = '#f5c6aa';
    ctx.beginPath();
    ctx.ellipse(handX + 12, handY + 8, 22, 14, Math.PI / 6, 0, Math.PI * 2);
    ctx.fill();

    // rod grip
    ctx.strokeStyle = '#8B5A2B';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(handX, handY + 12);
    ctx.lineTo(handX + 65, handY - 25);
    ctx.stroke();

    // rod shaft (thinner)
    ctx.strokeStyle = '#d2b48c';
    ctx.lineWidth = 5;
    let tipX = handX + 65;
    let tipY = handY - 25;

    if (fisher.state === 'casting' || fisher.state === 'reeling') {
        const bend = fisher.mode === 'ice' ? 0 : Math.sin(Date.now() / 180) * 4;
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.quadraticCurveTo(tipX + 80, tipY - 85 + bend, tipX + 140, tipY - 140);
        tipX += 140;
        tipY -= 140;
    } else {
        ctx.beginPath();
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX + 140, tipY - 140);
        tipX += 140;
        tipY -= 140;
    }
    ctx.stroke();

    // line from rod tip
    ctx.strokeStyle = 'rgba(220,235,255,0.75)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(tipX, tipY);

    if (fisher.state === 'casting' && fisher.mode === 'pond') {
        const prog = fisher.progress;
        fisher.bobberX = handX + 65 + (fisher.targetX - (handX + 65)) * prog;
        fisher.bobberY = handY - 25 + (fisher.targetY - (handY - 25)) * prog - Math.sin(Math.PI * prog) * 180;
    } else if (fisher.state === 'reeling') {
        const prog = Math.min((Date.now() - fisher.reelStart) / 1100, 1);
        const eased = easeOutCubic(prog);
        fisher.bobberX = fisher.targetX + ((handX + 205) - fisher.targetX) * eased;
        fisher.bobberY = fisher.targetY + ((handY - 165) - fisher.targetY) * eased;
    }

    ctx.quadraticCurveTo(tipX + 30, tipY - 40, fisher.bobberX, fisher.bobberY);
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
    const fx = canvasWidth / 2 + 30;
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

    // nothing to draw → stay transparent
    if (!currentFisher && queue.length === 0 && particles.length === 0) {
        requestAnimationFrame(animate);
        return;
    }

    // background
    if (currentFisher) {
        if (currentFisher.mode === 'pond') drawPondBackground();
        else drawIceBackground();
    }

    if (currentFisher) {
        const f = currentFisher;

        // casting / augering logic
        if (f.state === 'casting' && f.mode === 'pond') {
            const elapsed = Date.now() - f.castStart;
            f.progress = Math.min(elapsed / 780, 1);
            const eased = easeOutCubic(f.progress);

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

        // reeling
        if (f.state === 'reeling') {
            const elapsed = Date.now() - f.reelStart;
            const prog = Math.min(elapsed / 1100, 1);
            if (prog >= 1) {
                f.state = 'caught';
                f.caughtTime = Date.now();
                createSplash(f.bobberX, f.bobberY + 10, 32, "#ffdd66");
                if (typeof displayChatMessage === "function") {
                    displayChatMessage("POND", `🌟 ${f.user} reeled in a ${f.fish.name}!`, {}, {userColor: "#00f2ff"});
                }
            }
        }

        drawFirstPersonRod(f);
        if (f.state !== 'caught') drawBobber(f);
        if (f.state === 'caught') drawCaughtFish(f);

        // fade out after catch
        if (f.state === 'caught' && Date.now() - f.caughtTime > 4200) {
            f.opacity -= 0.055;
            if (f.opacity <= 0) finishFishing();
        }
    }

    updateParticles();
    ctx.globalAlpha = 1;

    // tiny queue indicator
    if (queue.length > 0) {
        ctx.fillStyle = "rgba(0,0,0,0.6)";
        ctx.fillRect(canvasWidth - 260, 18, 240, 38);
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