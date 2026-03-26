/**
 * fishGame.js - Advanced Twitch Fishing Overlay Logic
 */

const canvas = document.getElementById('fishing-canvas');
const ctx = canvas.getContext('2d');

let canvasWidth, canvasHeight;
const activeFishers = [];

// Enhanced Fish List
const fishTypes = [
    { name: "🐟 Common Bass", rarity: 0.6, color: "#4fa3a5", scale: 1 },
    { name: "🐠 Tropical Guppy", rarity: 0.2, color: "#ff8c00", scale: 0.8 },
    { name: "🐡 Blowfish", rarity: 0.1, color: "#ead864", scale: 1.2 },
    { name: "🦈 Rare Shark", rarity: 0.04, color: "#4b5d67", scale: 2.5 },
    { name: "✨ Golden Koi", rarity: 0.01, color: "#ffd700", scale: 1.5 },
    { name: "👞 Old Boot", rarity: 0.05, color: "#5d4037", scale: 1.1 }
];

function resizeCanvas() {
    canvasWidth = window.innerWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function spawnFishingEvent(user, userColor) {
    if (activeFishers.find(f => f.user === user)) return;

    const fisher = {
        user: user,
        color: userColor || "#FFFFFF",
        x: Math.random() * (canvasWidth - 300) + 150,
        y: canvasHeight - 20,
        state: 'casting', 
        bobberX: 0,
        bobberY: 0,
        targetX: 0,
        targetY: 0,
        progress: 0,
        fish: null,
        opacity: 0
    };

    // Calculate dynamic landing spot
    fisher.targetX = fisher.x + (Math.random() * 160 - 80);
    fisher.targetY = canvasHeight - 180 - (Math.random() * 60);
    fisher.bobberX = fisher.x;
    fisher.bobberY = fisher.y;

    activeFishers.push(fisher);

    // Casting Animation Sequence
    let castInterval = setInterval(() => {
        fisher.opacity = Math.min(fisher.opacity + 0.1, 1);
        fisher.progress += 0.02;
        
        // Parabolic arc for the bobber
        fisher.bobberX = fisher.x + (fisher.targetX - fisher.x) * fisher.progress;
        fisher.bobberY = fisher.y + (fisher.targetY - fisher.y) * fisher.progress - Math.sin(Math.PI * fisher.progress) * 100;

        if (fisher.progress >= 1) {
            clearInterval(castInterval);
            fisher.state = 'waiting';
            waitForBite(fisher);
        }
    }, 20);
}

function waitForBite(fisher) {
    const waitTime = 3000 + Math.random() * 5000;
    setTimeout(() => {
        fisher.state = 'reeling';
        fisher.fish = fishTypes[Math.floor(Math.random() * fishTypes.length)]; // Simplified for brevity, use determineCatch for weights
        
        // Reel it in
        setTimeout(() => {
            fisher.state = 'caught';
            if (typeof displayChatMessage === "function") {
                displayChatMessage("POND", `🌟 ${fisher.user} reeled in a ${fisher.fish.name}!`, {}, {userColor: "#00f2ff"});
            }
            // Cleanup
            setTimeout(() => {
                let fadeOut = setInterval(() => {
                    fisher.opacity -= 0.05;
                    if (fisher.opacity <= 0) {
                        clearInterval(fadeOut);
                        const idx = activeFishers.indexOf(fisher);
                        if (idx > -1) activeFishers.splice(idx, 1);
                    }
                }, 50);
            }, 4000);
        }, 1000);
    }, waitTime);
}

function drawPondEffects() {
    // Subtle water ripples at bottom
    ctx.save();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
        let shift = (Date.now() / 1000 + i) % 3;
        ctx.beginPath();
        ctx.ellipse(canvasWidth/2, canvasHeight - 150, 800 * shift, 100 * shift, 0, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.restore();
}

function animate() {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    drawPondEffects();

    activeFishers.forEach(f => {
        ctx.globalAlpha = f.opacity;
        
        // 1. Draw User Tag
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.roundRect(f.x - 50, f.y - 120, 100, 25, 5);
        ctx.fill();
        ctx.fillStyle = f.color;
        ctx.font = "bold 14px Arial";
        ctx.textAlign = "center";
        ctx.fillText(f.user, f.x, f.y - 103);

        // 2. Draw Fishing Rod (Stylized)
        ctx.strokeStyle = "#4e342e";
        ctx.lineWidth = 5;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.lineTo(f.x + 10, f.y - 100);
        ctx.stroke();

        // 3. Draw Fishing Line (Curved)
        ctx.strokeStyle = "rgba(255,255,255,0.4)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(f.x + 10, f.y - 100);
        // Quadratic curve makes the line look less stiff
        ctx.quadraticCurveTo(f.x + 20, f.y - 50, f.bobberX, f.bobberY);
        ctx.stroke();

        // 4. Draw Bobber
        let bobShift = f.state === 'waiting' ? Math.sin(Date.now() / 400) * 3 : 0;
        ctx.fillStyle = "#ff4444";
        ctx.beginPath();
        ctx.arc(f.bobberX, f.bobberY + bobShift, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "white";
        ctx.beginPath();
        ctx.arc(f.bobberX, f.bobberY + bobShift, 3, 0, Math.PI);
        ctx.fill();

        // 5. Draw Catch Animation
        if (f.state === 'caught' && f.fish) {
            ctx.font = `${24 * f.fish.scale}px Arial`;
            let jumpY = Math.abs(Math.sin(Date.now() / 300)) * 20;
            ctx.fillText(f.fish.name.split(' ')[0], f.x, f.y - 150 - jumpY);
            ctx.font = "bold 16px Arial";
            ctx.fillStyle = "white";
            ctx.fillText(f.fish.name, f.x, f.y - 130);
        }
    });

    ctx.globalAlpha = 1.0;
    requestAnimationFrame(animate);
}

// Hook into ComfyJS (Assumes ComfyJS is loaded in HTML)
ComfyJS.onCommand = (user, command, message, flags, extra) => {
    if (command === "fish") {
        spawnFishingEvent(user, extra.userColor);
        if (typeof playChatSound === "function") playChatSound("messageSound");
    }
};

animate();