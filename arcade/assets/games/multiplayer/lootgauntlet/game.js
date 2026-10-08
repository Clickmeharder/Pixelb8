'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const cabinet = document.getElementById('cabinet');
const zoomBtn = document.getElementById('zoomBtn');
const coinSlot = document.getElementById('coinSlotBtn');
const startPanel = document.getElementById('start-panel');
const joystickBall = document.getElementById('joystickBall');
const btnShoot = document.getElementById('btnShoot');
const btnBomb = document.getElementById('btnBomb');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const TILE = 32;
const TAU = Math.PI * 2;

let audioCtx = null;
function initAudio() {
    if (audioCtx) { if (audioCtx.state === 'suspended') audioCtx.resume(); return; }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
}

function playTone(freq, duration, type = 'square', volume = 0.05) {
    if (!audioCtx) return;
    try {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type; osc.frequency.value = freq;
        gain.gain.setValueAtTime(volume, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(); osc.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function speakVoice(text) {
    announcerText = text;
    announcerTimer = 180;
    playTone(150, 0.4, 'sawtooth', 0.1);
    setTimeout(() => playTone(120, 0.4, 'sawtooth', 0.1), 100);
    setTimeout(() => playTone(90, 0.5, 'sawtooth', 0.1), 200);
}

zoomBtn.addEventListener('pointerdown', e => { 
    e.preventDefault(); cabinet.classList.toggle('lean-in'); playTone(600, 0.05, 'triangle'); 
});

const keys = { Up: false, Down: false, Left: false, Right: false, Shoot: false, Bomb: false };
let lastFaced = 'right';

function mapKeyCode(code, isDown) {
    if (code === 'ArrowLeft' || code === 'KeyA') { keys.Left = isDown; if(isDown) lastFaced = 'left'; }
    if (code === 'ArrowRight' || code === 'KeyD') { keys.Right = isDown; if(isDown) lastFaced = 'right'; }
    if (code === 'ArrowUp' || code === 'KeyW') { keys.Up = isDown; if(isDown) lastFaced = 'up'; }
    if (code === 'ArrowDown' || code === 'KeyS') { keys.Down = isDown; if(isDown) lastFaced = 'down'; }
    if (code === 'Space') { keys.Shoot = isDown; if(isDown) btnShoot.classList.add('active-press'); else btnShoot.classList.remove('active-press'); }
    if (code === 'ShiftLeft' || code === 'ShiftRight') { keys.Bomb = isDown; if(isDown) btnBomb.classList.add('active-press'); else btnBomb.classList.remove('active-press'); }
}

window.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        if (gameState === 'INSERT_COIN' || gameState === 'GAME_OVER' || gameState === 'VICTORY') activateCoinSlot();
        else if (gameState === 'CHAR_SELECT') startGame();
        return;
    }
    if (!e.repeat) mapKeyCode(e.code, true);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e => mapKeyCode(e.code, false));

btnShoot.addEventListener('mousedown', () => keys.Shoot = true);
btnShoot.addEventListener('mouseup', () => keys.Shoot = false);
btnBomb.addEventListener('mousedown', () => keys.Bomb = true);
btnBomb.addEventListener('mouseup', () => keys.Bomb = false);

// Game Entities
let gameState = 'INSERT_COIN';
let announcerText = "";
let announcerTimer = 0;

// MASSIVELY BUFFED CLASSES: Lower fireRate = Shoots faster
const classes = [
    { name: 'MINER', color: '#3366ff', speed: 3, dmg: 40, projSpeed: 10, projLife: 15, projColor: '#fff', fireRate: 8, hpDrain: 0.8 },
    { name: 'HUNTER', color: '#33cc33', speed: 4.5, dmg: 20, projSpeed: 14, projLife: 30, projColor: '#0f0', fireRate: 5, hpDrain: 1.2 },
    { name: 'CRAFTER', color: '#9933ff', speed: 2.5, dmg: 60, projSpeed: 8, projLife: 20, projColor: '#f0f', fireRate: 12, hpDrain: 1.0 },
    { name: 'SWEATER', color: '#ffcc00', speed: 3.5, dmg: 25, projSpeed: 12, projLife: 25, projColor: '#ff0', fireRate: 6, hpDrain: 0.5 }
];
let selectedClass = 0;

let player = { x: 0, y: 0, w: 24, h: 24, ped: 2000, score: 0, keys: 0, bombs: 1, cooldown: 0, hitTimer: 0 };
let projectiles = [];
let enemies = [];
let spawners = [];
let items = [];
let particles = [];
let walls = [];
let doors = [];
let exitZone = null;
let currentLevel = 1;
let pedDrainTimer = 0;

const levelMaps = [
    [ // Level 1
        "WWWWWWWWWWWWWWWWWWWW",
        "W...P......W.......W",
        "W...S......W...S...W",
        "W..........D.......W",
        "WWWWWW.WWWWWWWWWWWWW",
        "W...W...W......W...W",
        "W.L.W...W..L...W.O.W",
        "W.K.W.O.W......W...W",
        "W...W...WWWW.WWW...W",
        "WWWWW..........W...W",
        "W...S..........W...W",
        "W.......WWWWWWWW.D.W",
        "W.O........S.......W",
        "W..............L.E.W",
        "WWWWWWWWWWWWWWWWWWWW"
    ],
    [ // Level 2
        "WWWWWWWWWWWWWWWWWWWW",
        "W.P.W...L......S...W",
        "W...W...WWWWWWWW...W",
        "W.K.D.....O........W",
        "WWWWW...WWWWWWWWWWWW",
        "W...W...W..L...W...W",
        "W.S.W.S.W......W.K.W",
        "W...W...W..WWWWW...W",
        "WWWWW.WWW..W...W.D.W",
        "W..........W.L.W...W",
        "W..O.WWWW..W...W...W",
        "W....W..D......W.O.W",
        "WWWWWW..WWWWWWWW...W",
        "W.L..S.......S...E.W",
        "WWWWWWWWWWWWWWWWWWWW"
    ],
    [ // Level 3 (Boss Room style)
        "WWWWWWWWWWWWWWWWWWWW",
        "W.O......WW......O.W",
        "W...S..........S...W",
        "W........WW........W",
        "WWWWWW........WWWWWW",
        "W..................W",
        "W....S...P....S....W",
        "W..................W",
        "WWWWWW........WWWWWW",
        "W........WW........W",
        "W...S....WW....S...W",
        "W.O..............O.W",
        "WWWWWWWW.DD.WWWWWWWW",
        "W.L.L.L..EE..L.L.L.W",
        "WWWWWWWWWWWWWWWWWWWW"
    ]
];

function activateCoinSlot() {
    initAudio();
    playTone(880, 0.1, 'square'); setTimeout(() => playTone(1200, 0.2, 'sine'), 100);
    startPanel.classList.add('hidden');
    gameState = 'CHAR_SELECT';
    selectedClass = 0;
    speakVoice("WELCOME TO LOOT GAUNTLET.");
}
coinSlot.addEventListener('click', activateCoinSlot);

function startGame() {
    currentLevel = 1;
    player.score = 0;
    player.ped = 2000;
    player.keys = 0;
    player.bombs = 1;
    loadLevel(currentLevel);
    gameState = 'PLAYING';
    speakVoice(`${classes[selectedClass].name} ENTERS THE DUNGEON.`);
}

function loadLevel(levelNum) {
    projectiles = []; enemies = []; spawners = []; items = []; particles = []; walls = []; doors = []; exitZone = null;
    const map = levelMaps[levelNum - 1];
    
    for (let y = 0; y < map.length; y++) {
        for (let x = 0; x < map[y].length; x++) {
            const px = x * TILE; const py = y * TILE;
            const cell = map[y][x];
            
            if (cell === 'W') walls.push({ x: px, y: py, w: TILE, h: TILE });
            else if (cell === 'D') doors.push({ x: px, y: py, w: TILE, h: TILE });
            else if (cell === 'P') { player.x = px + 4; player.y = py + 4; }
            else if (cell === 'S') spawners.push({ x: px, y: py, w: TILE, h: TILE, hp: 100, timer: Math.random()*60 });
            else if (cell === 'L') items.push({ type: 'loot', x: px+8, y: py+8, w: 16, h: 16 });
            else if (cell === 'O') items.push({ type: 'food', x: px+8, y: py+8, w: 16, h: 16 });
            else if (cell === 'K') items.push({ type: 'key', x: px+8, y: py+8, w: 16, h: 16 });
            else if (cell === 'E') exitZone = { x: px, y: py, w: TILE, h: TILE };
        }
    }
}

function spawnHitSpark(x, y, color) {
    for (let i = 0; i < 6; i++) {
        particles.push({ x: x, y: y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, life: 10 + Math.random()*10, color: color });
    }
}

function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.w && rect1.x + rect1.w > rect2.x && rect1.y < rect2.y + rect2.h && rect1.y + rect1.h > rect2.y;
}

function moveEntity(ent, dx, dy, isPlayer) {
    ent.x += dx;
    let hitWall = false;
    for (let w of walls) { if (checkCollision(ent, w)) { hitWall = true; break; } }
    if (!hitWall && isPlayer) {
        for (let i=0; i<doors.length; i++) {
            if (checkCollision(ent, doors[i])) {
                if (player.keys > 0) { player.keys--; doors.splice(i, 1); playTone(600, 0.1, 'square'); } 
                else { hitWall = true; }
                break;
            }
        }
    } else if (!isPlayer && !hitWall) {
        for (let d of doors) { if (checkCollision(ent, d)) { hitWall = true; break; } }
    }
    
    if (hitWall) ent.x -= dx;

    ent.y += dy;
    hitWall = false;
    for (let w of walls) { if (checkCollision(ent, w)) { hitWall = true; break; } }
    if (!hitWall && isPlayer) {
        for (let i=0; i<doors.length; i++) {
            if (checkCollision(ent, doors[i])) {
                if (player.keys > 0) { player.keys--; doors.splice(i, 1); playTone(600, 0.1, 'square'); } 
                else { hitWall = true; }
                break;
            }
        }
    } else if (!isPlayer && !hitWall) {
        for (let d of doors) { if (checkCollision(ent, d)) { hitWall = true; break; } }
    }
    if (hitWall) ent.y -= dy;
}

function updateGame(dt) {
    if (player.hitTimer > 0) player.hitTimer--;

    // REDUCED PED Drain 
    pedDrainTimer += dt;
    if (pedDrainTimer >= 1.0) {
        player.ped -= Math.floor(5 * classes[selectedClass].hpDrain); // Halved the drain
        pedDrainTimer = 0;
        if (player.ped <= 0) {
            gameState = 'GAME_OVER'; speakVoice("YOUR PED CARD IS DECLINED."); playTone(150, 1.0, 'sawtooth');
            return;
        } else if (player.ped < 500 && Math.random() < 0.05 && announcerTimer <= 0) {
            speakVoice(`${classes[selectedClass].name} NEEDS PED BADLY!`);
        }
    }

    // Input Movement
    let dx = 0, dy = 0;
    const spd = classes[selectedClass].speed;
    if (keys.Left) dx = -spd;
    if (keys.Right) dx = spd;
    if (keys.Up) dy = -spd;
    if (keys.Down) dy = spd;
    
    if (dx !== 0 || dy !== 0) {
        moveEntity(player, dx, dy, true);
        joystickBall.style.transform = `translate(${dx*3}px, ${dy*3}px)`;
    } else {
        joystickBall.style.transform = `translate(0px, 0px)`;
    }

    // Exit Level
    if (exitZone && checkCollision(player, exitZone)) {
        currentLevel++;
        if (currentLevel > levelMaps.length) {
            gameState = 'VICTORY'; speakVoice("YOU SURVIVED THE ENTROPIA GRIND!"); playTone(800, 1.0, 'square');
        } else {
            loadLevel(currentLevel); speakVoice("ENTERING DEEPER SECTORS."); playTone(500, 0.5, 'sine');
        }
        return;
    }

    // Items
    for (let i = items.length - 1; i >= 0; i--) {
        if (checkCollision(player, items[i])) {
            let itm = items[i];
            items.splice(i, 1);
            if (itm.type === 'loot') { player.score += 500; playTone(900, 0.1, 'sine'); }
            else if (itm.type === 'food') { player.ped += 500; playTone(700, 0.2, 'square'); }
            else if (itm.type === 'key') { player.keys++; playTone(1200, 0.1, 'triangle'); }
        }
    }

    // Combat
    if (player.cooldown > 0) player.cooldown--;
    if (keys.Shoot && player.cooldown <= 0) {
        player.cooldown = classes[selectedClass].fireRate;
        const pSpeed = classes[selectedClass].projSpeed;
        let pVx = 0, pVy = 0;
        if (lastFaced === 'left') pVx = -pSpeed;
        else if (lastFaced === 'right') pVx = pSpeed;
        else if (lastFaced === 'up') pVy = -pSpeed;
        else if (lastFaced === 'down') pVy = pSpeed;

        projectiles.push({
            x: player.x + 8, y: player.y + 8, w: 8, h: 8,
            vx: pVx, vy: pVy, life: classes[selectedClass].projLife,
            color: classes[selectedClass].projColor, isPlayer: true, dmg: classes[selectedClass].dmg
        });
        playTone(600, 0.05, 'square');
    }

    // Bomb (Mind Essence)
    if (keys.Bomb && player.bombs > 0) {
        player.bombs--; keys.Bomb = false;
        playTone(100, 0.8, 'noise');
        spawnHitSpark(player.x, player.y, '#fff');
        enemies.forEach(e => { e.hp -= 200; spawnHitSpark(e.x, e.y, '#f00'); });
        speakVoice("MIND ESSENCE CLEARS THE ROOM.");
    }

    // Projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
        let p = projectiles[i];
        p.x += p.vx; p.y += p.vy; p.life--;
        
        let hit = false;
        for (let w of walls) { if (checkCollision(p, w)) { hit = true; break; } }
        for (let d of doors) { if (checkCollision(p, d)) { hit = true; break; } }

        if (p.isPlayer && !hit) {
            for (let j = spawners.length - 1; j >= 0; j--) {
                if (checkCollision(p, spawners[j])) {
                    spawners[j].hp -= p.dmg; hit = true; spawnHitSpark(p.x, p.y, '#ff0'); playTone(300, 0.1, 'sawtooth');
                    if (spawners[j].hp <= 0) { spawners.splice(j, 1); player.score += 200; playTone(200, 0.2, 'noise'); }
                    break;
                }
            }
            if (!hit) {
                for (let j = enemies.length - 1; j >= 0; j--) {
                    if (checkCollision(p, enemies[j])) {
                        enemies[j].hp -= p.dmg; hit = true; spawnHitSpark(p.x, p.y, '#f00'); playTone(400, 0.05, 'sawtooth');
                        if (enemies[j].hp <= 0) { enemies.splice(j, 1); player.score += 50; }
                        break;
                    }
                }
            }
        }
        if (hit || p.life <= 0) projectiles.splice(i, 1);
    }

    // SLOWER SPAWNERS
    spawners.forEach(s => {
        s.timer--;
        if (s.timer <= 0 && enemies.length < 25) { // Capped enemies at 25
            s.timer = 150 + Math.random() * 100; // Takes much longer to spawn
            let ex = s.x + (Math.random() > 0.5 ? -24 : TILE);
            let ey = s.y + (Math.random() > 0.5 ? -24 : TILE);
            let typeColor = Math.random() > 0.5 ? '#00cc00' : '#cc0000'; 
            
            // THINNER, SLOWER ENEMIES
            let eSpeed = 0.7 + Math.random() * 0.6; 
            enemies.push({ x: ex, y: ey, w: 16, h: 16, hp: 40, color: typeColor, speed: eSpeed });
        }
    });

    // Enemies
    enemies.forEach(e => {
        let dx = 0, dy = 0;
        if (player.x < e.x) dx = -e.speed; else if (player.x > e.x) dx = e.speed;
        if (player.y < e.y) dy = -e.speed; else if (player.y > e.y) dy = e.speed;
        
        moveEntity(e, dx, dy, false);

        if (checkCollision(e, player) && player.hitTimer <= 0) {
            player.ped -= 20; // Reduced collision damage
            player.hitTimer = 45; // Longer invincibility window
            playTone(150, 0.2, 'sawtooth');
            spawnHitSpark(player.x, player.y, '#f00');
            if (Math.random() < 0.1 && announcerTimer <= 0) speakVoice("THE SWARM IS DRAINING YOUR PED.");
        }
    });

    // Particles
    particles.forEach(p => { p.x += p.vx; p.y += p.vy; p.life--; });
    particles = particles.filter(p => p.life > 0);

    if (announcerTimer > 0) announcerTimer--;
}

function draw() {
    ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, WIDTH, HEIGHT);

    if (gameState === 'INSERT_COIN') return;

    if (gameState === 'CHAR_SELECT') {
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 36px Impact'; ctx.textAlign = 'center'; ctx.fillText('SELECT CLASS', WIDTH/2, 100);
        
        classes.forEach((c, i) => {
            const bx = 80 + i * 140;
            ctx.fillStyle = (i === selectedClass) ? '#333' : '#111'; ctx.fillRect(bx, 150, 100, 120);
            ctx.strokeStyle = (i === selectedClass) ? '#ffd700' : '#444'; ctx.lineWidth = 4; ctx.strokeRect(bx, 150, 100, 120);
            
            ctx.fillStyle = c.color; ctx.fillRect(bx + 35, 170, 30, 30);
            ctx.fillStyle = '#fff'; ctx.font = '14px monospace'; ctx.fillText(c.name, bx + 50, 220);
            ctx.fillStyle = '#aaa'; ctx.font = '10px monospace'; ctx.fillText(`SPD: ${c.speed}`, bx + 50, 240);
            ctx.fillText(`DMG: ${c.dmg}`, bx + 50, 255);
        });

        ctx.fillStyle = '#00ffff'; ctx.font = '16px monospace'; ctx.fillText('USE LEFT/RIGHT ARROWS. PRESS ENTER TO START.', WIDTH/2, 350);

        if (keys.Left && !keys.LHold) { selectedClass = Math.max(0, selectedClass - 1); keys.LHold = true; playTone(500, 0.05, 'sine'); }
        if (keys.Right && !keys.RHold) { selectedClass = Math.min(classes.length - 1, selectedClass + 1); keys.RHold = true; playTone(500, 0.05, 'sine'); }
        if (!keys.Left) keys.LHold = false;
        if (!keys.Right) keys.RHold = false;
        return;
    }

    if (gameState === 'PLAYING' || gameState === 'GAME_OVER' || gameState === 'VICTORY') {
        // Draw Map
        ctx.fillStyle = '#222';
        walls.forEach(w => { 
            ctx.fillRect(w.x, w.y, w.w, w.h); 
            ctx.strokeStyle = '#555'; ctx.lineWidth=2; ctx.strokeRect(w.x+2, w.y+2, w.w-4, w.h-4); 
        });

        ctx.fillStyle = '#8B4513'; doors.forEach(d => { ctx.fillRect(d.x, d.y, d.w, d.h); ctx.fillStyle='#ffd700'; ctx.beginPath(); ctx.arc(d.x+16, d.y+16, 4, 0, TAU); ctx.fill(); ctx.fillStyle = '#8B4513'; });
        
        ctx.fillStyle = '#440000';
        spawners.forEach(s => { 
            ctx.fillRect(s.x, s.y, s.w, s.h); 
            ctx.fillStyle = '#ff0000'; ctx.fillRect(s.x+8, s.y+8, 16, 16); 
            ctx.fillStyle = '#440000'; 
        });

        items.forEach(i => {
            if (i.type === 'loot') { ctx.fillStyle = '#ffd700'; ctx.fillRect(i.x, i.y, i.w, i.h); ctx.fillStyle = '#aa8800'; ctx.fillRect(i.x+2, i.y+4, 12, 8); }
            else if (i.type === 'food') { ctx.fillStyle = '#00ccff'; ctx.beginPath(); ctx.arc(i.x+8, i.y+8, 8, 0, TAU); ctx.fill(); }
            else if (i.type === 'key') { ctx.fillStyle = '#ccc'; ctx.fillRect(i.x, i.y+4, 16, 4); ctx.fillRect(i.x+12, i.y+4, 4, 8); }
        });

        if (exitZone) { ctx.fillStyle = '#111'; ctx.fillRect(exitZone.x, exitZone.y, exitZone.w, exitZone.h); ctx.fillStyle = '#0f0'; ctx.font = '10px monospace'; ctx.fillText('EXIT', exitZone.x+16, exitZone.y+20); }

        enemies.forEach(e => { ctx.fillStyle = e.color; ctx.fillRect(e.x, e.y, e.w, e.h); ctx.fillStyle='#000'; ctx.fillRect(e.x+4, e.y+4, 4, 4); ctx.fillRect(e.x+10, e.y+4, 4, 4); });
        
        projectiles.forEach(p => { ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, p.w, p.h); });
        particles.forEach(p => { ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 4, 4); });

        // Player
        if (player.hitTimer % 4 < 2) {
            ctx.fillStyle = classes[selectedClass].color;
            ctx.fillRect(player.x, player.y, player.w, player.h);
            ctx.fillStyle = '#fff';
            // Eyes based on face direction
            if (lastFaced === 'right') { ctx.fillRect(player.x+16, player.y+4, 4,4); ctx.fillRect(player.x+16, player.y+16, 4,4); }
            else if (lastFaced === 'left') { ctx.fillRect(player.x+4, player.y+4, 4,4); ctx.fillRect(player.x+4, player.y+16, 4,4); }
            else if (lastFaced === 'up') { ctx.fillRect(player.x+4, player.y+4, 4,4); ctx.fillRect(player.x+16, player.y+4, 4,4); }
            else { ctx.fillRect(player.x+4, player.y+16, 4,4); ctx.fillRect(player.x+16, player.y+16, 4,4); }
        }

        // UI Header
        ctx.fillStyle = '#000'; ctx.fillRect(0, 0, WIDTH, 40);
        ctx.strokeStyle = '#ffd700'; ctx.lineWidth = 2; ctx.strokeRect(0, 0, WIDTH, 40);
        
        ctx.fillStyle = '#ffd700'; ctx.font = 'bold 18px "Courier New", monospace'; ctx.textAlign = 'left';
        ctx.fillText(`SCORE: ${player.score}`, 15, 25);
        ctx.fillStyle = player.ped < 500 ? '#ff3333' : '#00ffcc';
        ctx.textAlign = 'center'; ctx.fillText(`PED: ${player.ped}`, WIDTH/2, 25);
        
        ctx.fillStyle = '#fff'; ctx.textAlign = 'right';
        ctx.fillText(`KEYS: ${player.keys} | ME: ${player.bombs}`, WIDTH - 15, 25);

        // Announcer
        if (announcerTimer > 0) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, HEIGHT - 50, WIDTH, 50);
            ctx.fillStyle = (Math.floor(announcerTimer/5)%2===0) ? '#ffd700' : '#ff3333';
            ctx.font = 'bold 22px Impact'; ctx.textAlign = 'center';
            ctx.fillText(announcerText, WIDTH/2, HEIGHT - 18);
        }

        if (gameState === 'GAME_OVER') {
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
            ctx.fillStyle = '#ff3333'; ctx.font = 'bold 48px Impact'; ctx.textAlign = 'center'; ctx.fillText('BANKRUPT', WIDTH/2, HEIGHT/2 - 20);
            ctx.fillStyle = '#fff'; ctx.font = '16px monospace'; ctx.fillText(`FINAL SCORE: ${player.score}`, WIDTH/2, HEIGHT/2 + 20);
            ctx.fillStyle = '#ffd700'; ctx.fillText('PRESS ENTER TO RESTART', WIDTH/2, HEIGHT/2 + 60);
        } else if (gameState === 'VICTORY') {
            ctx.fillStyle = 'rgba(0,0,0,0.8)'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
            ctx.fillStyle = '#ffd700'; ctx.font = 'bold 48px Impact'; ctx.textAlign = 'center'; ctx.fillText('HOF SECURED!', WIDTH/2, HEIGHT/2 - 20);
            ctx.fillStyle = '#fff'; ctx.font = '16px monospace'; ctx.fillText(`FINAL SCORE: ${player.score}`, WIDTH/2, HEIGHT/2 + 20);
            ctx.fillText('PRESS ENTER TO REPLAY', WIDTH/2, HEIGHT/2 + 60);
        }
    }
}

let lastTime = performance.now();
function gameLoop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;

    if (gameState === 'PLAYING') updateGame(dt);
    draw();

    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);