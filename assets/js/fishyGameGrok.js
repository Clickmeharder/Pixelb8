/**
 * fishyGame.js - BEAUTIFIED + ON-DEMAND POND (only appears on !fish, fades away when done)
 * Background + everything is 100% transparent for OBS until someone fishes
 * Improved fisherman character + new fun catchables
 */

const canvas = document.getElementById('fishing-canvas');
const ctx = canvas.getContext('2d');

let canvasWidth, canvasHeight;
const activeFishers = [];
let particles = [];

// Expanded fun fish list (weighted rarity)
const fishTypes = [
    { name: "🐟 Common Bass", rarity: 0.55, color: "#4fa3a5", scale: 1.1 },
    { name: "🐠 Tropical Guppy", rarity: 0.18, color: "#ff8c00", scale: 0.85 },
    { name: "🐡 Blowfish", rarity: 0.09, color: "#ead864", scale: 1.3 },
    { name: "🦈 Rare Shark", rarity: 0.035, color: "#4b5d67", scale: 2.4 },
    { name: "✨ Golden Koi", rarity: 0.008, color: "#ffd700", scale: 1.6 },
    { name: "👞 Old Boot", rarity: 0.04, color: "#5d4037", scale: 1.0 },
    // ── FUN NEW CATCHABLES ──
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
            x: x, y: y,
            vx: (Math.random() - 0.5) * 9,
            vy: (Math.random() - 0.5) * 7 - 4,
            life: 55 + Math.random() * 35,
            size: 3.5 + Math.random() * 4,
            color: color
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

function spawnFishingEvent(user, userColor) {
    if (activeFishers.find(f => f.user === user)) return;

    const fisher = {
        user: user,
        color: userColor || "#FFFFFF",
        x: Math.random() * (canvasWidth - 400) + 150,
        y: canvasHeight - 55,
        state: 'casting',
        bobberX: 0,
        bobberY: 0,
        targetX: 0,
        targetY: 0,
        castStart: Date.now(),
        waitStart: 0,
        biteStart: 0,
        reelStart: 0,
        caughtTime: 0,
        progress: 0,
        fish: null,
        opacity: 1
    };

    fisher.targetX = fisher.x + (Math.random() * 220 - 110);
    fisher.targetY = canvasHeight - 210 - (Math.random() * 70);
    fisher.bobberX = fisher.x + 20;
    fisher.bobberY = fisher.y - 95;

    activeFishers.push(fisher);
}

function triggerBite(fisher) {
    fisher.state = 'biting';
    fisher.biteStart = Date.now();
    createSplash(fisher.bobberX, fisher.bobberY + 5, 22, "#00bbff");

    setTimeout(() => {
        if (fisher.state === 'biting') {
            fisher.state = 'reeling';
            fisher.reelStart = Date.now();
            fisher.fish = getRandomFish();
        }
    }, 380);
}

function drawWaterBackground() {
    const grad = ctx.createLinearGradient(0, canvasHeight * 0.35, 0, canvasHeight);
    grad.addColorStop(0, '#1e7fd4');
    grad.addColorStop(1, '#0b2c5e');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
}

function drawPondEffects() {
    // Surface waves
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 2.5;
    for (let i = 0; i < 6; i++) {
        const y = canvasHeight - 195 + i * 9;
        ctx.beginPath();
        ctx.moveTo(0, y);
        for (let x = 0; x <= canvasWidth; x += 45) {
            const offset = Math.sin((Date.now() / 280) + x / 45 + i) * 6;
            ctx.quadraticCurveTo(x + 22.5, y + offset, x + 45, y);
        }
        ctx.stroke();
    }
    ctx.restore();

    // Gentle deep ripples
    ctx.save();
    ctx.strokeStyle = "rgba(255,255,255,0.08)";
    ctx.lineWidth = 3;
    for (let i = 0; i < 3; i++) {
        const shift = (Date.now() / 1200 + i * 2) % 8;
        ctx.beginPath();
        ctx.ellipse(canvasWidth / 2, canvasHeight - 140, 720 * shift, 55 * shift, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

function drawFisher(fisher) {
    ctx.globalAlpha = fisher.opacity;
    const bx = fisher.x;
    const by = fisher.y;

    // Legs + boots
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(bx - 26, by - 45, 13, 45);   // left leg
    ctx.fillRect(bx - 9, by - 45, 13, 45);    // right leg
    ctx.fillStyle = '#34495e';
    ctx.fillRect(bx - 29, by - 8, 16, 10);    // left boot
    ctx.fillRect(bx - 12, by - 8, 16, 10);    // right boot

    // Jacket body
    ctx.fillStyle = '#27ae60';
    ctx.fillRect(bx - 22, by - 88, 30, 48);

    // Skin arm holding rod
    ctx.strokeStyle = '#f5c6aa';
    ctx.lineWidth = 11;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(bx - 10, by - 72);
    ctx.quadraticCurveTo(bx + 8, by - 82, bx + 28, by - 105);
    ctx.stroke();

    // Head
    ctx.fillStyle = '#f5c6aa';
    ctx.beginPath();
    ctx.arc(bx - 7, by - 99, 13.5, 0, Math.PI * 2);
    ctx.fill();

    // Hat + brim
    ctx.fillStyle = '#2c3e50';
    ctx.beginPath();
    ctx.ellipse(bx - 7, by - 115, 17, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(bx - 22, by - 118, 30, 5);

    // Rod (with slight bend while reeling)
    ctx.strokeStyle = '#8B5A2B';
    ctx.lineWidth = 8.5;
    ctx.shadowBlur = 4;
    ctx.shadowColor = '#3d2a1f';
    ctx.beginPath();
    ctx.moveTo(bx + 28, by - 105);
    const bend = (fisher.state === 'reeling') ? -12 : 0;
    ctx.quadraticCurveTo(bx + 48 + bend, by - 128, bx + 25, by - 155);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Reel
    ctx.fillStyle = '#333333';
    ctx.beginPath();
    ctx.arc(bx + 35, by - 115, 8, 0, Math.PI * 2);
    ctx.fill();

    // Fishing line
    ctx.strokeStyle = 'rgba(220,235,255,0.7)';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(bx + 25, by - 155);
    ctx.quadraticCurveTo(bx + 45, by - 120, fisher.bobberX, fisher.bobberY);
    ctx.stroke();
}

function drawBobber(fisher) {
    let bobY = fisher.bobberY;
    if (fisher.state === 'waiting') {
        const t = (Date.now() - fisher.waitStart) / 280;
        bobY += Math.sin(t * 4) * 6 + Math.sin(t * 9) * 2.5;
    } else if (fisher.state === 'biting') {
        const prog = Math.min((Date.now() - fisher.biteStart) / 380, 1);
        bobY += 28 * Math.sin(prog * Math.PI * 1.8);
    }

    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.arc(fisher.bobberX, bobY, 7.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(fisher.bobberX, bobY, 3.5, 0, Math.PI);
    ctx.fill();
}

function drawCaughtFish(fisher) {
    if (!fisher.fish) return;
    const elapsed = Date.now() - fisher.caughtTime;
    const jump = Math.abs(Math.sin(elapsed / 170)) * 38;
    const fishX = fisher.x + 45;
    const fishY = fisher.y - 195 + jump;

    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = fisher.fish.color;
    ctx.font = `${34 * fisher.fish.scale}px Arial`;
    ctx.textAlign = "center";
    ctx.fillText(fisher.fish.name.split(' ')[0], fishX, fishY);
    ctx.restore();

    ctx.shadowBlur = 4;
    ctx.shadowColor = '#000000';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 17px Arial';
    ctx.textAlign = "center";
    ctx.fillText(fisher.fish.name, fishX, fishY + 40);
    ctx.shadowBlur = 0;
}

function updateAndDrawParticles() {
    ctx.save();
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.18;
        p.life--;
        const alpha = Math.max(0, p.life / 55);

        ctx.globalAlpha = alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        return p.life > 0;
    });
    ctx.restore();
}

function animate() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // ONLY draw the pond + everything when someone is actually fishing
    if (activeFishers.length === 0 && particles.length === 0) {
        requestAnimationFrame(animate);
        return;
    }

    drawWaterBackground();
    drawPondEffects();

    activeFishers.forEach(f => {
        // Casting (smooth parabolic arc)
        if (f.state === 'casting') {
            const elapsed = Date.now() - f.castStart;
            f.progress = Math.min(elapsed / 820, 1);
            const eased = easeOutCubic(f.progress);

            f.bobberX = f.x + (f.targetX - f.x) * eased;
            f.bobberY = f.y - 95 + (f.targetY - (f.y - 95)) * eased - Math.sin(Math.PI * eased) * 135;

            if (f.progress >= 1) {
                f.state = 'waiting';
                f.waitStart = Date.now();
                createSplash(f.bobberX, f.bobberY, 14);

                // Schedule bite AFTER casting finishes
                const waitTime = 2800 + Math.random() * 6500;
                setTimeout(() => {
                    if (f.state === 'waiting') triggerBite(f);
                }, waitTime);
            }
        }

        // Reeling in
        if (f.state === 'reeling') {
            const elapsed = Date.now() - f.reelStart;
            const prog = Math.min(elapsed / 1250, 1);
            const eased = easeOutCubic(prog);

            const rodTipX = f.x + 25;
            const rodTipY = f.y - 155;

            f.bobberX = f.targetX + (rodTipX - f.targetX) * eased;
            f.bobberY = f.targetY + (rodTipY - f.targetY) * eased;

            if (prog >= 1) {
                f.state = 'caught';
                f.caughtTime = Date.now();
                createSplash(f.bobberX, f.bobberY + 12, 28, "#ffdd66");

                if (typeof displayChatMessage === "function") {
                    displayChatMessage("POND", `🌟 ${f.user} reeled in a ${f.fish.name}!`, {}, {userColor: "#00f2ff"});
                }
            }
        }

        drawFisher(f);
        drawBobber(f);

        if (f.state === 'caught') {
            drawCaughtFish(f);

            // Fade fisherman + fish out after catch
            if (Date.now() - f.caughtTime > 4000) {
                f.opacity -= 0.045;
                if (f.opacity <= 0) {
                    const idx = activeFishers.indexOf(f);
                    if (idx > -1) activeFishers.splice(idx, 1);
                }
            }
        }
    });

    updateAndDrawParticles();
    ctx.globalAlpha = 1;

    requestAnimationFrame(animate);
}

// ====================== COMFYJS HOOK ======================
ComfyJS.onCommand = (user, command, message, flags, extra) => {
    if (command === "fish") {
        spawnFishingEvent(user, extra.userColor);
        if (typeof playChatSound === "function") playChatSound("messageSound");
    }
};

animate();