'use strict';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const groundCanvas = document.createElement('canvas');
groundCanvas.width = canvas.width; groundCanvas.height = canvas.height;
const groundCtx = groundCanvas.getContext('2d');
const cabinet = document.getElementById('cabinet');
const screenContainer = document.getElementById('screenContainer');
const crtOverlay = document.getElementById('crtOverlay');
const zoomBtn = document.getElementById('zoomBtn');
const crtBtn = document.getElementById('crtBtn');
const steeringWheel = document.getElementById('steeringWheel');
const hornBtn = document.getElementById('hornBtn');
const shifterKnob = document.getElementById('shifterKnob');
const coinSlot = document.getElementById('coinSlotBtn');
const startPanel = document.getElementById('start-panel');
const gameoverPanel = document.getElementById('gameover-panel');
const resultTitle = document.getElementById('result-title');
const finalScoreText = document.getElementById('final-score');
const resultNextHint = document.getElementById('result-next-hint');

const WIDTH = canvas.width;
const HEIGHT = canvas.height;
const MPH_TO_MPS = 0.44704;
const MAX_LEVEL = 15;
const TAU = Math.PI * 2;

const LEVELS = [
    null,
    { name: 'GREENWAY CLASSIC', destination: 'Earth Countryside', theme: 'green', length: 8500, checkpointEvery: 1700, startTime: 58, checkpointBonus: 22, curve: 0.68, hill: 0.55, traffic: 0.78, roadWidth: 1.08, topSpeed: 260, intro: 'The road begins on Earth.' },
    { name: 'PALM DESERT RUN', destination: 'Earth Desert Highway', theme: 'desert', length: 9000, checkpointEvery: 1800, startTime: 60, checkpointBonus: 22, curve: 0.62, hill: 0.42, traffic: 0.74, roadWidth: 1.10, topSpeed: 270, intro: 'Heat, sand and a very long highway.' },
    { name: 'METRO MIDNIGHT', destination: 'Earth City', theme: 'city', length: 9300, checkpointEvery: 1860, startTime: 62, checkpointBonus: 22, curve: 0.80, hill: 0.22, traffic: 1.05, roadWidth: 1.04, topSpeed: 268, intro: 'Thread the traffic and escape the city.' },
    { name: 'SUMMIT ATTACK', destination: 'Earth Mountains', theme: 'mountain', length: 9800, checkpointEvery: 1960, startTime: 66, checkpointBonus: 23, curve: 0.94, hill: 1.00, traffic: 0.62, roadWidth: 1.02, topSpeed: 262, intro: 'One last climb before leaving Earth.' },
    { name: 'LUNAR LAUNCH', destination: 'Spacepecs Launch Pad → Moon', theme: 'moon', length: 10000, checkpointEvery: 2000, startTime: 67, checkpointBonus: 24, curve: 0.72, hill: 0.55, traffic: 0.48, roadWidth: 1.12, topSpeed: 275, intro: 'Park at Spacepecs. Next stop: the Moon.', specialIntro: 'rocket' },
    { name: 'CALYPSO VECTOR', destination: 'Moon Orbit → Planet Calypso', theme: 'space', length: 12000, checkpointEvery: 2400, startTime: 70, checkpointBonus: 25, curve: 0.74, hill: 0.30, traffic: 0.68, roadWidth: 1.18, topSpeed: 360, intro: 'Launch the ship and follow the Calypso vector.', vehicle: 'ship', specialIntro: 'space', finishLabel: 'CALYPSO' },
    { name: 'CALYPSO FRONTIER', destination: 'Planet Calypso', theme: 'calypso', length: 10500, checkpointEvery: 2100, startTime: 67, checkpointBonus: 24, curve: 0.84, hill: 0.72, traffic: 0.82, roadWidth: 1.06, topSpeed: 282, intro: 'Alien skies, outposts and the Calypso frontier.' },
    { name: 'ARKADIA TRANSIT', destination: 'Calypso Orbit → Planet Arkadia', theme: 'space', length: 12500, checkpointEvery: 2500, startTime: 72, checkpointBonus: 25, curve: 0.84, hill: 0.28, traffic: 0.78, roadWidth: 1.16, topSpeed: 372, intro: 'Board your equipped ship and depart Calypso.', vehicle: 'ship', specialIntro: 'launch', launchFrom: 'CALYPSO', launchTo: 'ARKADIA', launchTheme: 'calypso', finishLabel: 'ARKADIA' },
    { name: 'ARKADIA CIRCUIT', destination: 'Planet Arkadia', theme: 'arkadia', length: 11200, checkpointEvery: 2240, startTime: 70, checkpointBonus: 24, curve: 0.94, hill: 0.66, traffic: 0.78, roadWidth: 1.03, topSpeed: 288, intro: 'Race the red roads beneath Arkadian towers.' },
    { name: 'NEXT ISLAND VECTOR', destination: 'Arkadia Orbit → Next Island', theme: 'space', length: 12800, checkpointEvery: 2560, startTime: 73, checkpointBonus: 26, curve: 0.90, hill: 0.30, traffic: 0.86, roadWidth: 1.15, topSpeed: 378, intro: 'Launch from Arkadia for Next Island.', vehicle: 'ship', specialIntro: 'launch', launchFrom: 'ARKADIA', launchTo: 'NEXT ISLAND', launchTheme: 'arkadia', finishLabel: 'NEXT ISLAND' },
    { name: 'CARNIVAL CRASH', destination: 'Carnival Island, Next Island', theme: 'carnival', length: 9300, checkpointEvery: 1860, startTime: 66, checkpointBonus: 23, curve: 0.90, hill: 0.18, traffic: 1.20, roadWidth: 1.16, topSpeed: 220, intro: 'The bumper cars escaped the arena.', vehicle: 'bumper' },
    { name: 'ROCKTROPIA VECTOR', destination: 'Next Island Orbit → ROCKtropia', theme: 'space', length: 13200, checkpointEvery: 2640, startTime: 75, checkpointBonus: 26, curve: 0.94, hill: 0.32, traffic: 0.92, roadWidth: 1.14, topSpeed: 384, intro: 'Leave Next Island in your equipped ship.', vehicle: 'ship', specialIntro: 'launch', launchFrom: 'NEXT ISLAND', launchTo: 'ROCKTROPIA', launchTheme: 'carnival', finishLabel: 'ROCKTROPIA' },
    { name: 'CITY OF DREAMS', destination: 'ROCKtropia', theme: 'rocktropia', length: 11400, checkpointEvery: 2280, startTime: 70, checkpointBonus: 24, curve: 0.96, hill: 0.28, traffic: 1.10, roadWidth: 1.05, topSpeed: 292, intro: 'Neon, noise and no speed limit.' },
    { name: 'FOMA VECTOR', destination: 'ROCKtropia Orbit → FOMA Asteroid', theme: 'space', length: 13800, checkpointEvery: 2760, startTime: 78, checkpointBonus: 27, curve: 1.00, hill: 0.34, traffic: 1.00, roadWidth: 1.13, topSpeed: 392, intro: 'One final deep-space sprint to FOMA.', vehicle: 'ship', specialIntro: 'launch', launchFrom: 'ROCKTROPIA', launchTo: 'FOMA', launchTheme: 'rocktropia', finishLabel: 'FOMA' },
    { name: 'FOMA FINAL', destination: 'FOMA Asteroid', theme: 'foma', length: 12500, checkpointEvery: 2500, startTime: 74, checkpointBonus: 25, curve: 1.04, hill: 0.58, traffic: 0.86, roadWidth: 1.02, topSpeed: 304, intro: 'The final race around the asteroid.' }
];

// Challenge tuning for each destination. Later stages progressively reduce
// the forgiveness of the road assist, add sharper corners and increase the
// chance of unpredictable traffic events.
const LEVEL_RULES = [
    null,
    { difficulty: 0.72, speedLimit: 105, policeChance: 0.018, speedTraps: 0, panicChance: 0.035, racers: 0 },
    { difficulty: 0.80, speedLimit: 115, policeChance: 0.015, speedTraps: 1, panicChance: 0.040, racers: 0 },
    { difficulty: 0.92, speedLimit: 90, policeChance: 0.026, speedTraps: 1, panicChance: 0.052, racers: 0 },
    { difficulty: 1.02, speedLimit: 100, policeChance: 0.013, speedTraps: 1, panicChance: 0.055, racers: 0 },
    { difficulty: 1.08, speedLimit: 120, policeChance: 0.000, speedTraps: 0, panicChance: 0.045, racers: 0 },
    { difficulty: 1.12, speedLimit: 999, policeChance: 0.000, speedTraps: 0, panicChance: 0.025, racers: 0 },
    { difficulty: 1.18, speedLimit: 125, policeChance: 0.014, speedTraps: 1, panicChance: 0.060, racers: 0 },
    { difficulty: 1.22, speedLimit: 999, policeChance: 0.000, speedTraps: 0, panicChance: 0.032, racers: 0 },
    { difficulty: 1.30, speedLimit: 999, policeChance: 0.000, speedTraps: 0, panicChance: 0.070, racers: 5, raceRequired: true, requiredPosition: 3 },
    { difficulty: 1.29, speedLimit: 999, policeChance: 0.000, speedTraps: 0, panicChance: 0.040, racers: 0 },
    { difficulty: 1.28, speedLimit: 999, policeChance: 0.000, speedTraps: 0, panicChance: 0.090, racers: 0 },
    { difficulty: 1.34, speedLimit: 999, policeChance: 0.000, speedTraps: 0, panicChance: 0.046, racers: 0 },
    { difficulty: 1.40, speedLimit: 110, policeChance: 0.018, speedTraps: 1, panicChance: 0.078, racers: 0 },
    { difficulty: 1.44, speedLimit: 999, policeChance: 0.000, speedTraps: 0, panicChance: 0.052, racers: 0 },
    { difficulty: 1.52, speedLimit: 999, policeChance: 0.000, speedTraps: 0, panicChance: 0.085, racers: 6, raceRequired: true, requiredPosition: 1 }
];

// Deliberately authored turn sections. `wide` bends are readable at speed,
// `tight` bends reward braking, `esses` alternate direction, and `hairpin`
// sections become increasingly common later in the journey.
const TURN_PLANS = [
    null,
    [ { start: .16, end: .30, amp: .42, type: 'wide' }, { start: .39, end: .54, amp: -.52, type: 'wide' }, { start: .64, end: .76, amp: .48, type: 'wide' }, { start: .81, end: .90, amp: -.44, type: 'tight' } ],
    [ { start: .11, end: .26, amp: -.48, type: 'wide' }, { start: .32, end: .43, amp: .63, type: 'tight' }, { start: .50, end: .67, amp: -.58, type: 'wide' }, { start: .72, end: .84, amp: .72, type: 'tight' }, { start: .86, end: .94, amp: -.52, type: 'esses' } ],
    [ { start: .10, end: .20, amp: .60, type: 'tight' }, { start: .24, end: .34, amp: -.68, type: 'tight' }, { start: .38, end: .49, amp: .72, type: 'esses' }, { start: .54, end: .64, amp: -.70, type: 'tight' }, { start: .68, end: .79, amp: .78, type: 'tight' }, { start: .83, end: .93, amp: -.72, type: 'esses' } ],
    [ { start: .09, end: .22, amp: -.62, type: 'wide' }, { start: .27, end: .36, amp: .88, type: 'hairpin' }, { start: .40, end: .51, amp: -.75, type: 'tight' }, { start: .56, end: .65, amp: .96, type: 'hairpin' }, { start: .69, end: .80, amp: -.78, type: 'esses' }, { start: .84, end: .93, amp: .94, type: 'hairpin' } ],
    [ { start: .12, end: .27, amp: .56, type: 'wide' }, { start: .33, end: .45, amp: -.72, type: 'tight' }, { start: .51, end: .62, amp: .82, type: 'hairpin' }, { start: .67, end: .80, amp: -.70, type: 'esses' }, { start: .84, end: .93, amp: .86, type: 'hairpin' } ],
    [ { start: .10, end: .23, amp: -.54, type: 'wide' }, { start: .28, end: .39, amp: .72, type: 'tight' }, { start: .44, end: .57, amp: -.78, type: 'esses' }, { start: .62, end: .72, amp: .84, type: 'tight' }, { start: .77, end: .88, amp: -.90, type: 'hairpin' } ],
    [ { start: .09, end: .21, amp: .66, type: 'wide' }, { start: .25, end: .35, amp: -.78, type: 'tight' }, { start: .39, end: .49, amp: .90, type: 'hairpin' }, { start: .54, end: .66, amp: -.80, type: 'esses' }, { start: .70, end: .80, amp: .94, type: 'hairpin' }, { start: .84, end: .94, amp: -.86, type: 'tight' } ],
    [ { start: .08, end: .20, amp: -.70, type: 'wide' }, { start: .25, end: .36, amp: .84, type: 'tight' }, { start: .41, end: .53, amp: -.88, type: 'esses' }, { start: .58, end: .68, amp: .96, type: 'hairpin' }, { start: .74, end: .86, amp: -.92, type: 'tight' } ],
    [ { start: .08, end: .19, amp: -.78, type: 'tight' }, { start: .23, end: .32, amp: .98, type: 'hairpin' }, { start: .36, end: .47, amp: -.90, type: 'esses' }, { start: .51, end: .60, amp: 1.02, type: 'hairpin' }, { start: .64, end: .75, amp: -.88, type: 'tight' }, { start: .79, end: .88, amp: 1.04, type: 'hairpin' }, { start: .90, end: .96, amp: -.68, type: 'tight' } ],
    [ { start: .07, end: .18, amp: .76, type: 'tight' }, { start: .22, end: .33, amp: -.90, type: 'esses' }, { start: .38, end: .48, amp: 1.00, type: 'hairpin' }, { start: .53, end: .65, amp: -.94, type: 'tight' }, { start: .70, end: .82, amp: 1.03, type: 'hairpin' }, { start: .86, end: .94, amp: -.78, type: 'esses' } ],
    [ { start: .08, end: .19, amp: .72, type: 'esses' }, { start: .23, end: .33, amp: -.82, type: 'tight' }, { start: .38, end: .49, amp: .90, type: 'hairpin' }, { start: .54, end: .65, amp: -.86, type: 'esses' }, { start: .69, end: .80, amp: .94, type: 'hairpin' }, { start: .84, end: .94, amp: -.78, type: 'tight' } ],
    [ { start: .07, end: .18, amp: -.82, type: 'tight' }, { start: .22, end: .32, amp: 1.00, type: 'hairpin' }, { start: .36, end: .47, amp: -.94, type: 'esses' }, { start: .51, end: .61, amp: 1.06, type: 'hairpin' }, { start: .66, end: .78, amp: -.96, type: 'tight' }, { start: .82, end: .92, amp: 1.08, type: 'hairpin' } ],
    [ { start: .07, end: .17, amp: -.78, type: 'tight' }, { start: .20, end: .29, amp: .96, type: 'hairpin' }, { start: .33, end: .43, amp: -.90, type: 'esses' }, { start: .47, end: .56, amp: 1.04, type: 'hairpin' }, { start: .60, end: .70, amp: -.92, type: 'tight' }, { start: .74, end: .83, amp: 1.06, type: 'hairpin' }, { start: .86, end: .95, amp: -.92, type: 'esses' } ],
    [ { start: .06, end: .17, amp: .86, type: 'tight' }, { start: .20, end: .30, amp: -1.04, type: 'hairpin' }, { start: .34, end: .45, amp: .98, type: 'esses' }, { start: .49, end: .59, amp: -1.09, type: 'hairpin' }, { start: .63, end: .73, amp: 1.02, type: 'tight' }, { start: .77, end: .88, amp: -1.10, type: 'hairpin' }, { start: .90, end: .96, amp: .80, type: 'esses' } ],
    [ { start: .07, end: .17, amp: .88, type: 'tight' }, { start: .20, end: .29, amp: -1.04, type: 'hairpin' }, { start: .32, end: .42, amp: .96, type: 'esses' }, { start: .45, end: .54, amp: -1.08, type: 'hairpin' }, { start: .57, end: .67, amp: 1.00, type: 'tight' }, { start: .70, end: .79, amp: -1.10, type: 'hairpin' }, { start: .82, end: .90, amp: 1.04, type: 'hairpin' }, { start: .91, end: .97, amp: -.82, type: 'esses' } ]
];

const CURVE_CAPS = [0, .48, .64, .78, .94, .92, .86, 1.00, 1.04, 1.10, 1.11, 1.12, 1.15, 1.19, 1.22, 1.25];

function currentRules() { return LEVEL_RULES[selectedLevel] || LEVEL_RULES[1]; }

const CONFIG = {
    viewDistance: 1450,
    // Keep nearby traffic rendered until it reaches the actual contact zone.
    // This prevents cars vanishing a moment before a collision is registered.
    nearDistance: 1.25,
    offRoadStart: 1.10,
    hardEdge: 1.72,
    // Compact swept-contact zone. High-speed tunnelling is still prevented,
    // but the cars must visually reach one another before an impact occurs.
    collisionFront: 2.30,
    collisionRear: 0.52,
    roadAssistStrength: 0.63
};

// Progressive gearbox: 1st and 2nd are short punchy gears, then each
// successive gear takes noticeably longer to pull through than the last.
const CAR_GEARS = [
    { maxSpd: 0, accel: 0, endTorque: 0 },
    { maxSpd: 52, accel: 48, endTorque: 0.68 },
    { maxSpd: 98, accel: 34, endTorque: 0.61 },
    { maxSpd: 164, accel: 21, endTorque: 0.48 },
    { maxSpd: 232, accel: 13.2, endTorque: 0.36 },
    { maxSpd: 300, accel: 8.4, endTorque: 0.20 }
];

const SHIP_GEARS = [
    { maxSpd: 0, accel: 0, endTorque: 0 },
    { maxSpd: 92, accel: 64, endTorque: 0.70 },
    { maxSpd: 158, accel: 45, endTorque: 0.62 },
    { maxSpd: 232, accel: 29, endTorque: 0.49 },
    { maxSpd: 305, accel: 18, endTorque: 0.36 },
    { maxSpd: 380, accel: 11.5, endTorque: 0.22 }
];

let audioCtx = null;
let engineOsc = null;
let engineGain = null;
let audioMuted = false;

function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function lerp(a, b, t) { return a + (b - a) * t; }
function smoothstep(edge0, edge1, value) {
    const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
}
function fract(value) { return value - Math.floor(value); }
function hash(value) { return fract(Math.sin(value * 127.1) * 43758.5453); }
function hexToRgb(color) {
    const source = String(color || '#000').trim();

    // mixColor() returns rgb(...), so accept both generated RGB values and
    // regular hexadecimal colours. Previously nested colour blending tried to
    // parse "rgb(...)" as hexadecimal, producing NaN and making the road
    // inherit the rumble-strip fill colour instead of drawing pavement.
    const rgbMatch = source.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)/i);
    if (rgbMatch) {
        return {
            r: clamp(Math.round(Number(rgbMatch[1])), 0, 255),
            g: clamp(Math.round(Number(rgbMatch[2])), 0, 255),
            b: clamp(Math.round(Number(rgbMatch[3])), 0, 255)
        };
    }

    const value = source.replace('#', '');
    const normalized = value.length === 3
        ? value.split('').map(ch => ch + ch).join('')
        : value.padEnd(6, '0').slice(0, 6);
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return {
        r: Number.isFinite(r) ? r : 0,
        g: Number.isFinite(g) ? g : 0,
        b: Number.isFinite(b) ? b : 0
    };
}
function mixColor(a, b, t) {
    const c1 = hexToRgb(a); const c2 = hexToRgb(b); const amount = clamp(t, 0, 1);
    const r = Math.round(lerp(c1.r, c2.r, amount));
    const g = Math.round(lerp(c1.g, c2.g, amount));
    const bl = Math.round(lerp(c1.b, c2.b, amount));
    return `rgb(${r},${g},${bl})`;
}
function currentLevel() { return LEVELS[selectedLevel] || LEVELS[1]; }

const PAINT_COLORS = ['#cc0000', '#00a8ff', '#16c784', '#ffd21f', '#ff6b1a', '#b044e8', '#f4f4f4', '#151515', '#ff4fa3', '#00e7d4', '#8b5a2b', '#7d8794'];
const ACCENT_COLORS = ['#f4c430', '#ffffff', '#00ffcc', '#ff365d', '#2d66ff', '#ff9f1c', '#9a5cff', '#101010'];

const VEHICLE_CATALOG = [
    // The player begins in the same modest sedan used by ordinary traffic.
    { id: 'citizen_sedan', name: 'EVERYDAY SEDAN', class: 'ground', kind: 'car', design: 'civilian', price: 0, speed: 0.92, accel: 0.94, handling: 0.96, brakes: 0.96, armor: 0.98, paint: 6, accent: 7, description: 'A plain civilian car just like the other drivers use.' },
    // The restored original player-car silhouette is deliberately option two.
    { id: 'roadster', name: 'OUT DRIVE CLASSIC', class: 'ground', kind: 'car', design: 'classic', price: 6500, speed: 1.00, accel: 1.00, handling: 1.00, brakes: 1.00, armor: 1.00, paint: 0, accent: 0, description: 'The original red arcade hero car, restored and customizable.' },
    { id: 'police_interceptor', name: 'HIGHWAY INTERCEPTOR', class: 'ground', kind: 'car', design: 'police', price: 32000, speed: 1.12, accel: 1.10, handling: 1.08, brakes: 1.22, armor: 1.28, paint: 6, accent: 4, description: 'A retired pursuit car with lights, armor and huge brakes.' },
    { id: 'comet_gt', name: 'COMET GT', class: 'ground', kind: 'car', design: 1, price: 9000, speed: 1.05, accel: 1.08, handling: 1.06, brakes: 1.02, armor: 0.92, paint: 4, accent: 1, description: 'Light, lively and eager out of corners.' },
    { id: 'iron_mammoth', name: 'IRON MAMMOTH 4X4', class: 'ground', kind: 'truck', design: 0, price: 18000, speed: 0.93, accel: 0.91, handling: 0.80, brakes: 1.16, armor: 1.62, paint: 10, accent: 0, description: 'Slower, heavy and extremely hard to destroy.' },
    { id: 'stinger_r9', name: 'STINGER R-9', class: 'ground', kind: 'bike', design: 0, price: 26000, speed: 1.10, accel: 1.18, handling: 1.25, brakes: 1.00, armor: 0.48, paint: 2, accent: 1, description: 'Wild acceleration and razor handling, but fragile.' },
    { id: 'calypso_interceptor', name: 'CALYPSO INTERCEPTOR', class: 'ground', kind: 'car', design: 2, price: 48000, speed: 1.13, accel: 1.12, handling: 1.14, brakes: 1.10, armor: 1.03, paint: 9, accent: 3, description: 'Alien-road technology with superb grip.' },
    { id: 'foma_hypercar', name: 'FOMA HYPERCAR', class: 'ground', kind: 'car', design: 3, price: 95000, speed: 1.21, accel: 1.18, handling: 1.13, brakes: 1.15, armor: 0.91, paint: 7, accent: 5, description: 'Absurd speed built for asteroid royalty.' },

    { id: 'bumper_candy', name: 'CANDY COMET', class: 'bumper', kind: 'bumper', design: 0, price: 12000, speed: 1.02, accel: 1.06, handling: 1.08, brakes: 1.05, armor: 1.25, paint: 8, accent: 1, description: 'A bright Carnival Island classic.' },
    { id: 'bumper_neon', name: 'NEON NUISANCE', class: 'bumper', kind: 'bumper', design: 1, price: 24000, speed: 1.08, accel: 1.12, handling: 1.14, brakes: 1.08, armor: 1.16, paint: 9, accent: 6, description: 'Sharper steering with glowing rails.' },
    { id: 'bumper_lootius', name: 'LOOTIUS DODGEM', class: 'bumper', kind: 'bumper', design: 2, price: 45000, speed: 1.15, accel: 1.16, handling: 1.10, brakes: 1.12, armor: 1.42, paint: 0, accent: 0, description: 'The premium bumper car blessed by Lootius.' },

    { id: 'sleipnir_xr', name: 'SLEIPNIR XR', class: 'ship', kind: 'ship', design: 1, price: 300000, speed: 1.08, accel: 1.10, handling: 1.08, brakes: 1.08, armor: 1.18, paint: 6, accent: 2, description: 'A fast upgraded interplanetary workhorse.' },
    { id: 'quadwing_viper', name: 'QUAD-WING VIPER', class: 'ship', kind: 'ship', design: 2, price: 650000, speed: 1.17, accel: 1.18, handling: 1.16, brakes: 1.13, armor: 1.05, paint: 3, accent: 7, description: 'Four wings, enormous thrust, very little restraint.' },
    { id: 'warp_phantom', name: 'WARP PHANTOM', class: 'ship', kind: 'ship', design: 3, price: 1200000, speed: 1.28, accel: 1.24, handling: 1.20, brakes: 1.18, armor: 1.25, paint: 7, accent: 6, description: 'The ultimate super-rich deep-space machine.' }
];

const RENTAL_BUMPER = { id: 'rental_bumper', name: 'CARNIVAL RENTAL', class: 'bumper', kind: 'bumper', design: 0, price: 0, speed: 1, accel: 1, handling: 1, brakes: 1, armor: 1.15, paint: 8, accent: 1 };
const RENTAL_SHIP = { id: 'rental_ship', name: 'SPACEPECS SHUTTLE', class: 'ship', kind: 'ship', design: 0, price: 0, speed: 1, accel: 1, handling: 1, brakes: 1, armor: 1, paint: 6, accent: 2 };
const GARAGE_CLASSES = ['ground', 'bumper', 'ship'];
const GARAGE_CLASS_LABELS = { ground: 'ROAD VEHICLES', bumper: 'BUMPER CARS', ship: 'SPACECRAFT' };
const UPGRADE_KEYS = ['engine', 'handling', 'brakes', 'armor', 'nitrous'];

function freshGarageData() {
    return {
        credits: 0,
        owned: ['citizen_sedan'],
        selected: { ground: 'citizen_sedan', bumper: 'rental_bumper', ship: 'rental_ship' },
        upgrades: {},
        paint: {},
        plates: {}
    };
}

function loadGarageData() {
    const fallback = freshGarageData();
    try {
        const saved = JSON.parse(localStorage.getItem('outspeed_garage_v1') || 'null');
        if (!saved || typeof saved !== 'object') return fallback;
        let owned = Array.isArray(saved.owned) ? saved.owned.filter(id => VEHICLE_CATALOG.some(v => v.id === id)) : [];
        if (!owned.includes('citizen_sedan')) owned.unshift('citizen_sedan');
        const selected = Object.assign({}, fallback.selected, saved.selected || {});
        // One-time save migration: everyone receives and starts in the civilian
        // sedan, but every previously purchased vehicle, upgrade and credit is kept.
        if (localStorage.getItem('outspeed_civilian_starter_migrated_v1') !== 'true') {
            // The Roadster used to be the free starter, so remove that legacy
            // ownership once and put it back in the shop as garage option two.
            owned = owned.filter(id => id !== 'roadster');
            selected.ground = 'citizen_sedan';
            localStorage.setItem('outspeed_civilian_starter_migrated_v1', 'true');
        }
        return {
            credits: Math.max(0, Number(saved.credits) || 0),
            owned,
            selected,
            upgrades: saved.upgrades && typeof saved.upgrades === 'object' ? saved.upgrades : {},
            paint: saved.paint && typeof saved.paint === 'object' ? saved.paint : {},
            plates: saved.plates && typeof saved.plates === 'object' ? saved.plates : {}
        };
    } catch (error) {
        return fallback;
    }
}

let garageData = loadGarageData();
// The garage is available immediately. Money, rather than story completion,
// is now the only gate on vehicles, paint and upgrades.
let garageUnlocked = true;
localStorage.setItem('outspeed_garage_unlocked', 'true');
let garageVisited = localStorage.getItem('outspeed_garage_visited_v2') === 'true';
let garageClassIndex = 0;
let garageVehicleIndex = 0;
let garageMessage = '';
let garageMessageTimer = 0;
let plateEditing = false;
let plateEditBuffer = '';

function saveGarageData() {
    localStorage.setItem('outspeed_garage_v1', JSON.stringify(garageData));
}

function vehicleClassForLevel() {
    if (currentLevel().vehicle === 'ship') return 'ship';
    if (currentLevel().vehicle === 'bumper') return 'bumper';
    return 'ground';
}

function getVehicleById(id) { return VEHICLE_CATALOG.find(vehicle => vehicle.id === id) || null; }
function isVehicleOwned(id) { return garageData.owned.includes(id); }
function vehiclesForGarageClass(cls) { return VEHICLE_CATALOG.filter(vehicle => vehicle.class === cls); }

function getActiveVehicle() {
    const cls = vehicleClassForLevel();
    const selectedId = garageData.selected[cls];
    const selected = getVehicleById(selectedId);
    if (selected && isVehicleOwned(selected.id)) return selected;
    if (cls === 'ship') return RENTAL_SHIP;
    if (cls === 'bumper') return RENTAL_BUMPER;
    return getVehicleById('citizen_sedan') || VEHICLE_CATALOG[0];
}

function getVehicleUpgrade(vehicle, key) {
    const upgrades = garageData.upgrades[vehicle.id] || {};
    return clamp(Number(upgrades[key]) || 0, 0, 5);
}

function getVehiclePaint(vehicle) {
    const saved = garageData.paint[vehicle.id] || {};
    const paintIndex = Number.isFinite(saved.paint) ? saved.paint : vehicle.paint || 0;
    const accentIndex = Number.isFinite(saved.accent) ? saved.accent : vehicle.accent || 0;
    return {
        body: PAINT_COLORS[((paintIndex % PAINT_COLORS.length) + PAINT_COLORS.length) % PAINT_COLORS.length],
        accent: ACCENT_COLORS[((accentIndex % ACCENT_COLORS.length) + ACCENT_COLORS.length) % ACCENT_COLORS.length],
        paintIndex,
        accentIndex
    };
}

function sanitizePlate(value, preserveTrailingSpace = false) {
    let plate = String(value || '').toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/ {2,}/g, ' ').slice(0, 7);
    if (!preserveTrailingSpace) plate = plate.trim();
    return plate;
}

function getVehiclePlate(vehicle) {
    const savedPlate = garageData.plates && garageData.plates[vehicle.id];
    return sanitizePlate(savedPlate || 'JAE') || 'JAE';
}

function canUseLicensePlate(vehicle) {
    return vehicle.class === 'ground' && vehicle.kind !== 'ship' && vehicle.kind !== 'bumper';
}

function beginPlateEdit() {
    const vehicle = garageCurrentVehicle();
    if (!isVehicleOwned(vehicle.id)) {
        setGarageMessage('BUY THE VEHICLE TO CUSTOMIZE ITS PLATE');
        return;
    }
    if (!canUseLicensePlate(vehicle)) {
        setGarageMessage('THIS VEHICLE DOES NOT USE A ROAD LICENSE PLATE');
        return;
    }
    plateEditing = true;
    plateEditBuffer = getVehiclePlate(vehicle);
    setGarageMessage('TYPE UP TO 7 CHARACTERS — ENTER SAVES');
    playTone(760, 0.06, 'sine', 0.04);
}

function commitPlateEdit() {
    const vehicle = garageCurrentVehicle();
    const plate = sanitizePlate(plateEditBuffer) || 'JAE';
    garageData.plates = garageData.plates || {};
    garageData.plates[vehicle.id] = plate;
    plateEditing = false;
    plateEditBuffer = '';
    saveGarageData();
    setGarageMessage(`LICENSE PLATE SAVED: ${plate}`);
    playTone(940, 0.08, 'triangle', 0.045);
}

function cancelPlateEdit() {
    plateEditing = false;
    plateEditBuffer = '';
    setGarageMessage('LICENSE PLATE EDIT CANCELLED');
    playTone(360, 0.05, 'triangle', 0.035);
}


function resetVehicleDamage() {
    vehicleDamage = { engine: 0, body: 0, frontTires: 0, rearTires: 0, brakes: 0 };
}
function damageMultiplier(component, minimum = 0.42) {
    return lerp(1, minimum, clamp((vehicleDamage[component] || 0) / 100, 0, 1));
}
function applyVehicleDamage(severity, impact = 0) {
    const base = severity === 'catastrophic' ? 72 : severity === 'severe' ? 38 : severity === 'medium' ? 20 : 7;
    const scale = clamp(base + impact * 0.055, base, 92);
    vehicleDamage.body = clamp(vehicleDamage.body + scale * (0.72 + Math.random() * 0.30), 0, 100);
    vehicleDamage.engine = clamp(vehicleDamage.engine + scale * (0.32 + Math.random() * 0.34), 0, 100);
    vehicleDamage.brakes = clamp(vehicleDamage.brakes + scale * (0.16 + Math.random() * 0.26), 0, 100);
    const sideBias = Math.random();
    vehicleDamage.frontTires = clamp(vehicleDamage.frontTires + scale * (sideBias < .58 ? .42 : .22), 0, 100);
    vehicleDamage.rearTires = clamp(vehicleDamage.rearTires + scale * (sideBias >= .42 ? .42 : .22), 0, 100);
}
function nitroCapacityFor(vehicle = getActiveVehicle()) {
    const level = getVehicleUpgrade(vehicle, 'nitrous');
    return level <= 0 ? 0 : 2.1 + level * 1.15;
}
function fireSpaceWeapon() {
    if (gameState !== 'RACING' || vehicleClassForLevel() !== 'ship') return;
    const weaponLevel = getVehicleUpgrade(getActiveVehicle(), 'weapon');
    if (weaponLevel <= 0) { setEventMessage('NO SHIP WEAPON INSTALLED — BUY ONE IN GARAGE', 2.1); playTone(120, .08, 'square', .03); return; }
    if (weaponCooldown > 0) return;
    weaponCooldown = Math.max(.10, .36 - weaponLevel * .045);
    weaponFlash = .12;
    spaceProjectiles.push({ z: pos + 12, x: playerX, speed: 470 + weaponLevel * 95, power: weaponLevel, life: 2.3 });
    playTone(680 + weaponLevel * 90, .07, 'sawtooth', .045);
}
function updateSpaceWeapons(dt) {
    weaponCooldown = Math.max(0, weaponCooldown - dt);
    weaponFlash = Math.max(0, weaponFlash - dt);
    for (let i = spaceProjectiles.length - 1; i >= 0; i -= 1) {
        const shot = spaceProjectiles[i];
        shot.life -= dt;
        shot.z += shot.speed * dt;
        let hit = false;
        for (const car of trafficCars) {
            if (car.kind !== 'ship' || car.wreckState || car.parked) continue;
            if (Math.abs(car.z - shot.z) < 16 && Math.abs(car.x - shot.x) < .30) {
                wreckTraffic(car, shot.power >= 4 ? 'explode' : 'roll');
                score += 700 + shot.power * 180;
                setEventMessage(`SPACE TARGET DESTROYED +${700 + shot.power * 180}`, 1.2);
                hit = true; break;
            }
        }
        if (hit || shot.life <= 0 || shot.z > pos + CONFIG.viewDistance + 300) spaceProjectiles.splice(i, 1);
    }
}

function getVehiclePerformance(vehicle = getActiveVehicle()) {
    const engine = getVehicleUpgrade(vehicle, 'engine');
    const handling = getVehicleUpgrade(vehicle, 'handling');
    const brakes = getVehicleUpgrade(vehicle, 'brakes');
    const armor = getVehicleUpgrade(vehicle, 'armor');
    const nitrous = getVehicleUpgrade(vehicle, 'nitrous');
    const weapon = vehicle.class === 'ship' ? getVehicleUpgrade(vehicle, 'weapon') : 0;
    return {
        topSpeed: vehicle.speed * (1 + engine * 0.028),
        accel: vehicle.accel * (1 + engine * 0.050),
        handling: vehicle.handling * (1 + handling * 0.060),
        brakes: vehicle.brakes * (1 + brakes * 0.085),
        armor: vehicle.armor * (1 + armor * 0.120),
        nitrous, weapon
    };
}

function effectiveTopSpeed() { return currentLevel().topSpeed * getVehiclePerformance().topSpeed; }
function currentGears() {
    const ship = vehicleClassForLevel() === 'ship';
    const base = ship ? SHIP_GEARS : CAR_GEARS;
    const baseTop = ship ? 380 : 300;
    const perf = getVehiclePerformance();
    const speedScale = effectiveTopSpeed() / baseTop;
    return base.map((gear, index) => index === 0 ? gear : ({
        maxSpd: gear.maxSpd * speedScale,
        accel: gear.accel * perf.accel,
        endTorque: gear.endTorque
    }));
}
function levelTopSpeed() { return effectiveTopSpeed(); }

function garageCurrentClass() { return GARAGE_CLASSES[garageClassIndex] || 'ground'; }
function garageCurrentList() { return vehiclesForGarageClass(garageCurrentClass()); }
function garageCurrentVehicle() {
    const list = garageCurrentList();
    garageVehicleIndex = clamp(garageVehicleIndex, 0, Math.max(0, list.length - 1));
    return list[garageVehicleIndex] || VEHICLE_CATALOG[0];
}
function setGarageMessage(message) { garageMessage = message; garageMessageTimer = 2.2; }

function getUpgradeCost(vehicle, key) {
    const level = getVehicleUpgrade(vehicle, key);
    if (level >= 5) return 0;
    const statFactor = key === 'engine' ? 1.25 : key === 'armor' ? 0.92 : key === 'nitrous' ? 1.35 : key === 'weapon' ? 1.70 : 1;
    const vehicleFactor = Math.max(1, vehicle.price / 18000 + 1);
    return Math.round((1100 + Math.pow(level + 1, 1.72) * 1450) * vehicleFactor * statFactor / 50) * 50;
}

function equipOrBuyGarageVehicle() {
    const vehicle = garageCurrentVehicle();
    if (!isVehicleOwned(vehicle.id)) {
        if (garageData.credits < vehicle.price) {
            setGarageMessage(`NEED ${(vehicle.price - garageData.credits).toLocaleString()} MORE CREDITS`);
            playTone(160, 0.14, 'square');
            return;
        }
        garageData.credits -= vehicle.price;
        garageData.owned.push(vehicle.id);
        setGarageMessage(`${vehicle.name} PURCHASED!`);
        playTone(780, 0.10, 'sine');
        window.setTimeout(() => playTone(1080, 0.16, 'sine'), 90);
    }
    garageData.selected[vehicle.class] = vehicle.id;
    saveGarageData();
    setGarageMessage(`${vehicle.name} EQUIPPED`);
}

function buyGarageUpgrade(key) {
    const vehicle = garageCurrentVehicle();
    if (key === 'weapon' && vehicle.class !== 'ship') { setGarageMessage('WEAPONS ARE SPACECRAFT ONLY'); return; }
    if (!isVehicleOwned(vehicle.id)) {
        setGarageMessage('BUY THE VEHICLE FIRST');
        return;
    }
    const current = getVehicleUpgrade(vehicle, key);
    if (current >= 5) {
        setGarageMessage(`${key.toUpperCase()} ALREADY MAXED`);
        return;
    }
    const cost = getUpgradeCost(vehicle, key);
    if (garageData.credits < cost) {
        setGarageMessage(`NEED ${(cost - garageData.credits).toLocaleString()} MORE CREDITS`);
        playTone(150, 0.12, 'square');
        return;
    }
    garageData.credits -= cost;
    garageData.upgrades[vehicle.id] = Object.assign({}, garageData.upgrades[vehicle.id] || {}, { [key]: current + 1 });
    saveGarageData();
    setGarageMessage(`${key.toUpperCase()} UPGRADED TO ${current + 1}/5`);
    playTone(520 + current * 85, 0.12, 'triangle');
}

function cycleGaragePaint(which) {
    const vehicle = garageCurrentVehicle();
    if (!isVehicleOwned(vehicle.id)) {
        setGarageMessage('BUY THE VEHICLE TO CUSTOMIZE IT');
        return;
    }
    const current = getVehiclePaint(vehicle);
    garageData.paint[vehicle.id] = {
        paint: which === 'paint' ? (current.paintIndex + 1) % PAINT_COLORS.length : current.paintIndex,
        accent: which === 'accent' ? (current.accentIndex + 1) % ACCENT_COLORS.length : current.accentIndex
    };
    saveGarageData();
    playTone(which === 'paint' ? 690 : 840, 0.06, 'sine');
}

function awardRaceCredits() {
    const cleanScore = Math.max(0, Math.floor(score));
    let payout = 1800 + selectedLevel * 900 + Math.floor(cleanScore * 0.045) + overtakes * 125 + nearMisses * 175;
    if (currentRules().raceRequired) payout += racePosition === 1 ? 4500 : racePosition === 2 ? 2500 : 1500;
    if (mode === 'STORY' && selectedLevel === MAX_LEVEL) payout += 40000;
    payout = Math.max(1000, Math.round(payout / 50) * 50);
    garageData.credits += payout;
    saveGarageData();
    return payout;
}

function initAudio() {
    if (audioCtx) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        return;
    }
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;
    audioCtx = new AudioContextClass();
    engineOsc = audioCtx.createOscillator();
    engineGain = audioCtx.createGain();
    engineOsc.type = 'sawtooth';
    engineOsc.connect(engineGain);
    engineGain.connect(audioCtx.destination);
    engineGain.gain.value = 0.0001;
    engineOsc.start();
}

function playTone(freq, duration, type = 'square', volume = 0.05) {
    if (!audioCtx || audioMuted) return;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(volume, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
}

let hornCooldownUntil = 0;
let playerSirenActive = false;
let playerSirenToneTimer = 0;
let playerSirenTrafficTimer = 0;
let playerSirenPhase = 0;
let crtEnabled = localStorage.getItem('outspeed_crt_enabled_v1') !== 'false';

function isPolicePlayerVehicle() {
    const vehicle = getActiveVehicle();
    return Boolean(vehicle && vehicle.class === 'ground' && vehicle.design === 'police');
}

function applyCrtState() {
    screenContainer.classList.toggle('crt-disabled', !crtEnabled);
    crtBtn.classList.toggle('active', crtEnabled);
    crtBtn.textContent = crtEnabled ? 'CRT ON' : 'CRT OFF';
    crtBtn.setAttribute('aria-pressed', String(crtEnabled));
}

function toggleCrt() {
    crtEnabled = !crtEnabled;
    localStorage.setItem('outspeed_crt_enabled_v1', String(crtEnabled));
    applyCrtState();
    playTone(crtEnabled ? 760 : 310, 0.07, 'triangle', 0.035);
    if (['STARTING', 'RACING', 'FINISHING'].includes(gameState)) {
        setEventMessage(`CRT SCANLINES ${crtEnabled ? 'ON' : 'OFF'}`, 1.0);
    }
}

function updateCrtEffect() {
    if (!crtEnabled) return;
    const racing = ['STARTING', 'RACING', 'FINISHING', 'CRASHING', 'BUSTED'].includes(gameState);
    // Scanlines become wider and much fainter beyond second gear. This keeps
    // the CRT character without producing a harsh high-speed strobe pattern.
    const highSpeedSoftening = racing ? smoothstep(82, 225, speed) : 0;
    const opacity = lerp(0.68, 0.24, highSpeedSoftening);
    const lineSize = lerp(4.0, 7.2, highSpeedSoftening);
    crtOverlay.style.setProperty('--crt-opacity', opacity.toFixed(3));
    crtOverlay.style.setProperty('--crt-line-size', `${lineSize.toFixed(2)}px`);
}

function requestTrafficYield(emergency = false) {
    if (gameState !== 'RACING') return 0;
    let moved = 0;
    const range = emergency ? 320 : 125;
    for (const car of trafficCars) {
        if (car.kind !== 'car' || car.parked || car.wreckState || car.panicking) continue;
        const dz = car.z - pos;
        if (dz < 7 || dz > range || car.yieldCooldown > 0) continue;
        const laneGap = Math.abs(car.x - playerX);
        if (!emergency && laneGap > 0.58) continue;
        const proximity = 1 - clamp(dz / range, 0, 1);
        const chance = emergency ? 0.94 : 0.16 + proximity * 0.30;
        if (Math.random() > chance) continue;

        const side = Math.abs(car.x) > 0.18
            ? Math.sign(car.x)
            : (car.x >= playerX ? 1 : -1);
        car.yielding = true;
        car.emergencyYield = emergency;
        car.yieldTimer = emergency ? 4.8 + Math.random() * 1.7 : 1.6 + Math.random() * 0.8;
        car.yieldCooldown = emergency ? 1.0 : 2.8;
        car.panicChecked = true;
        car.targetX = emergency
            ? side * (1.22 + Math.random() * 0.12)
            : clamp(car.x + side * (0.38 + Math.random() * 0.24), -0.94, 0.94);
        moved += 1;
    }
    return moved;
}

function honkHorn() {
    const now = performance.now();
    if (now < hornCooldownUntil) return;
    hornCooldownUntil = now + 210;
    initAudio();

    const inGarage = gameState === 'GARAGE';
    const vehicle = inGarage ? garageCurrentVehicle() : getActiveVehicle();
    const sciFiHorn = vehicle && vehicle.kind === 'ship';
    const notes = sciFiHorn ? [520, 780] : vehicle && vehicle.kind === 'truck' ? [185, 232] : [310, 392];
    const duration = sciFiHorn ? 0.16 : 0.22;

    if (audioCtx && !audioMuted) {
        notes.forEach((frequency, index) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = sciFiHorn ? 'sine' : (index === 0 ? 'square' : 'triangle');
            osc.frequency.setValueAtTime(frequency, audioCtx.currentTime);
            if (!sciFiHorn) osc.frequency.exponentialRampToValueAtTime(frequency * 0.965, audioCtx.currentTime + duration);
            gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
            gain.gain.linearRampToValueAtTime(index === 0 ? 0.050 : 0.034, audioCtx.currentTime + 0.018);
            gain.gain.setValueAtTime(index === 0 ? 0.050 : 0.034, audioCtx.currentTime + duration * 0.66);
            gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + duration + 0.02);
        });
    }

    hornBtn.classList.add('horn-active');
    window.setTimeout(() => hornBtn.classList.remove('horn-active'), 120);
    if (['STARTING', 'RACING', 'FINISHING'].includes(gameState)) {
        const yielded = sciFiHorn ? 0 : requestTrafficYield(false);
        eventMessage = yielded > 0 ? 'HONK — DRIVER MOVING OVER!' : (sciFiHorn ? 'SHIP SIGNAL!' : 'HONK!');
        eventMessageTimer = yielded > 0 ? 1.05 : 0.55;
    }
}

function setPlayerSiren(active, announce = true) {
    if (active && !isPolicePlayerVehicle()) {
        if (announce) {
            setEventMessage('SIREN REQUIRES THE HIGHWAY INTERCEPTOR', 1.5);
            playTone(190, 0.12, 'square', 0.035);
        }
        playerSirenActive = false;
        return false;
    }
    playerSirenActive = Boolean(active);
    playerSirenToneTimer = 0;
    playerSirenTrafficTimer = 0;
    playerSirenPhase = 0;
    if (announce) {
        setEventMessage(`POLICE SIREN ${playerSirenActive ? 'ON — TRAFFIC YIELDING' : 'OFF'}`, 1.35);
        playTone(playerSirenActive ? 980 : 360, 0.09, 'square', 0.045);
    }
    return true;
}

function togglePlayerSiren() {
    setPlayerSiren(!playerSirenActive, true);
}

function updatePlayerSiren(dt) {
    if (!playerSirenActive) return;
    if (!isPolicePlayerVehicle() || !['STARTING', 'RACING', 'FINISHING'].includes(gameState)) {
        setPlayerSiren(false, false);
        return;
    }

    playerSirenToneTimer -= dt;
    playerSirenTrafficTimer -= dt;
    if (playerSirenToneTimer <= 0) {
        const high = playerSirenPhase % 2 === 0;
        playTone(high ? 960 : 690, 0.20, 'square', 0.036);
        playerSirenPhase += 1;
        playerSirenToneTimer = 0.22;
    }
    if (playerSirenTrafficTimer <= 0) {
        requestTrafficYield(true);
        playerSirenTrafficTimer = 0.48;
    }
}

applyCrtState();

function updateEngineSound(rpmRatio, throttle = false) {
    if (!engineOsc || !engineGain || !audioCtx) return;
    if (audioMuted) {
        engineGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.05);
        return;
    }
    const ratio = clamp(rpmRatio, 0, 1);
    const ship = currentLevel().vehicle === 'ship';
    const pitch = ship ? 82 + ratio * 420 : 64 + ratio * 360 + (throttle ? 24 : 0);
    const volume = speed < 0.5 ? 0.006 : 0.013 + ratio * 0.029;
    engineOsc.type = ship ? 'triangle' : 'sawtooth';
    engineOsc.frequency.setTargetAtTime(pitch, audioCtx.currentTime, 0.055);
    engineGain.gain.setTargetAtTime(volume, audioCtx.currentTime, 0.075);
}

function stopEngine() {
    if (engineGain && audioCtx) engineGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.08);
}

let gameState = 'INSERT_COIN';
let mode = 'STORY';
function mapLegacyTourProgress(value) {
    const old = clamp(Number(value) || 1, 1, 11);
    if (old <= 7) return old;
    if (old === 8) return 9;
    if (old === 9) return 11;
    if (old === 10) return 13;
    return 15;
}
const legacyCampaignProgress = parseInt(localStorage.getItem('outspeed_entropia_unlocked_v2') || '1', 10);
const savedCampaignProgress = parseInt(localStorage.getItem('outspeed_entropia_unlocked_v3') || String(mapLegacyTourProgress(legacyCampaignProgress)), 10);
let unlockedLevels = Number.isFinite(savedCampaignProgress) ? clamp(savedCampaignProgress, 1, MAX_LEVEL) : 1;
const legacyStoryProgress = parseInt(localStorage.getItem('outspeed_story_current_v1') || String(legacyCampaignProgress), 10);
const savedStoryProgress = parseInt(localStorage.getItem('outspeed_story_current_v2') || String(mapLegacyTourProgress(legacyStoryProgress)), 10);
let storyCurrentLevel = Number.isFinite(savedStoryProgress) ? clamp(savedStoryProgress, 1, MAX_LEVEL) : unlockedLevels;
let selectedLevel = 1;
const DEV_CHEAT_CODE = 'JAEDEV';
let devCodeBuffer = '';
let paused = false;
let autoShift = localStorage.getItem('outspeed_auto_shift') !== 'false';
let handlingAssist = localStorage.getItem('outspeed_assist') !== 'false';

let countdownTimer = 0;
let countdownValue = 3;
let goFlashTimer = 0;
let radioTimer = 0;
let handX = 400;
let specialIntroTimer = 0;
let specialIntroDuration = 0;
let finishCelebration = 0;

let pos = 0;
let speed = 0;
let playerX = 0;
let lateralVelocity = 0;
let steerRotation = 0;
let engineRPM = 0;
let currentGear = 1;
let timeLeft = 0;
let nextCheckpoint = 0;
let score = 0;
let overtakes = 0;
let checkpointFlash = 0;
let shiftFlash = 0;
let crashFlash = 0;
let collisionCooldown = 0;
let hitboxDebug = false;
let trafficSpawnTimer = 1.5;
let trafficCars = [];
let finishPending = false;
let resultAdvanceTimer = 0;
let resultPayout = 0;
let lastResultWon = false;
let racePosition = 1;
let raceFieldSize = 1;
let raceLeaderFinished = false;
let policeChase = {
    active: false, timer: 0, sirenTimer: 0, source: '',
    gap: 0, escapeProgress: 0, escapeNeeded: 0, escapeSpeed: 0,
    copSpeed: 0, maxDuration: 0
};
let bustedTimer = 0;
let crashState = { active: false, fatal: false, timer: 0, duration: 0, severity: '', angle: 0, roll: 0, message: '' };
let crashParticles = [];
let explosionBursts = [];
let impactFreeze = 0;
let dangerFlash = 0;
let eventMessage = '';
let eventMessageTimer = 0;
let nearMisses = 0;
let vehicleDamage = { engine: 0, body: 0, frontTires: 0, rearTires: 0, brakes: 0 };
let nitroCharge = 0;
let nitroActive = false;
let weaponCooldown = 0;
let spaceProjectiles = [];
let weaponFlash = 0;

// Driving-effects state. These are visual/handling layers and do not alter
// the real course distance, checkpoint, or traffic coordinate system.
let roadFlowOffset = 0;
let handbrakeAmount = 0;
let burnoutAmount = 0;
let donutAmount = 0;
let donutPhase = 0;
let driftAngle = 0;
let tireSmoke = [];
let skidMarks = [];
let smokeAccumulator = 0;
let skidAccumulator = 0;
let skidToneCooldown = 0;

const KEYBIND_STORAGE_KEY = 'outspeed_keybinds_v1';
const KEYBIND_ACTIONS = [
    { id: 'accelerate', label: 'ACCELERATE', defaults: ['ArrowUp', 'KeyW'] },
    { id: 'brake', label: 'BRAKE / REVERSE', defaults: ['ArrowDown', 'KeyS'] },
    { id: 'left', label: 'STEER LEFT', defaults: ['ArrowLeft', 'KeyA'] },
    { id: 'right', label: 'STEER RIGHT', defaults: ['ArrowRight', 'KeyD'] },
    { id: 'handbrake', label: 'HANDBRAKE', defaults: ['Space', ''] },
    { id: 'nitro', label: 'NITRO / BOOST', defaults: ['KeyN', ''] },
    { id: 'horn', label: 'HORN', defaults: ['KeyE', ''] },
    { id: 'siren', label: 'POLICE SIREN', defaults: ['Shift+KeyE', ''] },
    { id: 'weapon', label: 'SHIP WEAPON', defaults: ['KeyF', ''] },
    { id: 'shiftUp', label: 'SHIFT UP', defaults: ['Shift+ArrowUp', ''] },
    { id: 'shiftDown', label: 'SHIFT DOWN', defaults: ['Shift+ArrowDown', ''] },
    { id: 'pause', label: 'PAUSE', defaults: ['KeyP', ''] },
    { id: 'mute', label: 'MUTE AUDIO', defaults: ['KeyM', ''] },
    { id: 'assist', label: 'ROAD ASSIST', defaults: ['KeyH', ''] },
    { id: 'autoShift', label: 'AUTO SHIFT', defaults: ['KeyT', ''] },
    { id: 'lean', label: 'LEAN / ZOOM', defaults: ['KeyL', ''] },
    { id: 'crt', label: 'CRT LINES', defaults: ['F2', ''] }
];

function defaultKeybinds() {
    return Object.fromEntries(KEYBIND_ACTIONS.map(action => [action.id, [...action.defaults]]));
}

function loadKeybinds() {
    const defaults = defaultKeybinds();
    try {
        const saved = JSON.parse(localStorage.getItem(KEYBIND_STORAGE_KEY) || 'null');
        if (!saved || typeof saved !== 'object') return defaults;
        for (const action of KEYBIND_ACTIONS) {
            const slots = Array.isArray(saved[action.id]) ? saved[action.id] : defaults[action.id];
            defaults[action.id] = [String(slots[0] || ''), String(slots[1] || '')];
        }
    } catch (error) {
        return defaults;
    }
    return defaults;
}

let keybinds = loadKeybinds();
let pressedCodes = new Set();
let settingsSelection = 0;
let settingsSlot = 0;
let settingsScroll = 0;
let settingsRebinding = null;
let settingsConfirmId = '';
let settingsConfirmTimer = 0;
let settingsMessage = '';
let settingsMessageTimer = 0;

const SETTINGS_COMMANDS = [
    { id: 'reset_keybinds', label: 'RESET KEYBINDS TO DEFAULTS', color: '#8defff' },
    { id: 'reset_story', label: 'RESET STORY + LEVEL UNLOCKS', color: '#ffca28' },
    { id: 'reset_garage', label: 'RESET GARAGE + CREDITS', color: '#ff8bcf' },
    { id: 'reset_all', label: 'RESET ALL GAME PROGRESS', color: '#ff5858' }
];

function saveKeybinds() {
    localStorage.setItem(KEYBIND_STORAGE_KEY, JSON.stringify(keybinds));
}

function resetKeybindsToDefaults() {
    keybinds = defaultKeybinds();
    saveKeybinds();
    refreshDrivingKeyState();
}

function bindingParts(binding) {
    const parts = String(binding || '').split('+').filter(Boolean);
    return {
        shift: parts.includes('Shift'),
        ctrl: parts.includes('Ctrl'),
        alt: parts.includes('Alt'),
        meta: parts.includes('Meta'),
        code: parts.find(part => !['Shift', 'Ctrl', 'Alt', 'Meta'].includes(part)) || ''
    };
}

function modifierHeld(name) {
    if (name === 'Shift') return pressedCodes.has('ShiftLeft') || pressedCodes.has('ShiftRight');
    if (name === 'Ctrl') return pressedCodes.has('ControlLeft') || pressedCodes.has('ControlRight');
    if (name === 'Alt') return pressedCodes.has('AltLeft') || pressedCodes.has('AltRight');
    if (name === 'Meta') return pressedCodes.has('MetaLeft') || pressedCodes.has('MetaRight');
    return false;
}

function isBindingHeld(binding) {
    const parts = bindingParts(binding);
    if (!parts.code || !pressedCodes.has(parts.code)) return false;
    if (parts.shift && !modifierHeld('Shift')) return false;
    if (parts.ctrl && !modifierHeld('Ctrl')) return false;
    if (parts.alt && !modifierHeld('Alt')) return false;
    if (parts.meta && !modifierHeld('Meta')) return false;
    return true;
}

function isActionHeld(actionId) {
    return (keybinds[actionId] || []).some(isBindingHeld);
}

function refreshDrivingKeyState() {
    keys.ArrowUp = isActionHeld('accelerate');
    keys.ArrowDown = isActionHeld('brake');
    keys.ArrowLeft = isActionHeld('left');
    keys.ArrowRight = isActionHeld('right');
    keys.Space = isActionHeld('handbrake');
    keys.n = isActionHeld('nitro');
    keys.Shift = modifierHeld('Shift');
    // Legacy aliases remain false; gameplay reads the action-backed fields above.
    keys.w = keys.s = keys.a = keys.d = keys.f = false;
}

function eventMatchesBinding(event, binding) {
    const parts = bindingParts(binding);
    if (!parts.code || event.code !== parts.code) return false;
    const eventShift = Boolean(event.shiftKey);
    const eventCtrl = Boolean(event.ctrlKey);
    const eventAlt = Boolean(event.altKey);
    const eventMeta = Boolean(event.metaKey);
    return parts.shift === eventShift && parts.ctrl === eventCtrl && parts.alt === eventAlt && parts.meta === eventMeta;
}

function actionPressed(event, actionId) {
    return (keybinds[actionId] || []).some(binding => eventMatchesBinding(event, binding));
}

function bindingFromEvent(event) {
    const code = event.code;
    if (!code || ['ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight', 'AltLeft', 'AltRight', 'MetaLeft', 'MetaRight'].includes(code)) return '';
    const modifiers = [];
    if (event.ctrlKey) modifiers.push('Ctrl');
    if (event.altKey) modifiers.push('Alt');
    if (event.shiftKey) modifiers.push('Shift');
    if (event.metaKey) modifiers.push('Meta');
    modifiers.push(code);
    return modifiers.join('+');
}

function formatBinding(binding) {
    if (!binding) return '—';
    return String(binding).split('+').map(part => {
        const names = {
            ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
            Space: 'SPACE', Escape: 'ESC', Enter: 'ENTER', Backspace: 'BACKSPACE',
            Shift: 'SHIFT', Ctrl: 'CTRL', Alt: 'ALT', Meta: 'META'
        };
        if (names[part]) return names[part];
        if (/^Key[A-Z]$/.test(part)) return part.slice(3);
        if (/^Digit[0-9]$/.test(part)) return part.slice(5);
        if (/^Numpad[0-9]$/.test(part)) return `NUM ${part.slice(6)}`;
        return part.toUpperCase();
    }).join('+');
}

function bindingLabel(actionId) {
    return (keybinds[actionId] || []).filter(Boolean).map(formatBinding).join(' / ') || 'UNBOUND';
}

function assignKeybind(actionId, slot, binding) {
    if (!keybinds[actionId]) return;
    const oldBinding = keybinds[actionId][slot] || '';
    for (const action of KEYBIND_ACTIONS) {
        for (let i = 0; i < 2; i += 1) {
            if (action.id === actionId && i === slot) continue;
            if (keybinds[action.id][i] === binding && binding) {
                keybinds[action.id][i] = oldBinding;
            }
        }
    }
    // Do not keep the same binding in both slots of one action.
    const otherSlot = slot === 0 ? 1 : 0;
    if (keybinds[actionId][otherSlot] === binding) keybinds[actionId][otherSlot] = '';
    keybinds[actionId][slot] = binding;
    saveKeybinds();
    refreshDrivingKeyState();
}

function settingsItems() {
    return [
        ...KEYBIND_ACTIONS.map(action => ({ type: 'binding', id: action.id, label: action.label })),
        ...SETTINGS_COMMANDS.map(command => ({ type: 'command', ...command }))
    ];
}

function enterSettings() {
    gameState = 'SETTINGS';
    settingsSelection = 0;
    settingsSlot = 0;
    settingsScroll = 0;
    settingsRebinding = null;
    settingsConfirmId = '';
    settingsMessage = '';
    settingsMessageTimer = 0;
    resetControls();
    playTone(720, 0.08, 'triangle');
}

function resetStoryAndUnlocks() {
    unlockedLevels = 1;
    storyCurrentLevel = 1;
    selectedLevel = 1;
    mode = 'STORY';
    saveStoryProgress();
}

function resetGarageProgress() {
    garageData = freshGarageData();
    garageVisited = false;
    garageClassIndex = 0;
    garageVehicleIndex = 0;
    localStorage.removeItem('outspeed_garage_visited_v2');
    localStorage.removeItem('outspeed_civilian_starter_migrated_v1');
    localStorage.setItem('outspeed_garage_unlocked', 'true');
    saveGarageData();
}

function executeSettingsCommand(commandId) {
    if (commandId === 'reset_keybinds') {
        resetKeybindsToDefaults();
        settingsMessage = 'DEFAULT KEYBINDS RESTORED';
    } else if (commandId === 'reset_story') {
        resetStoryAndUnlocks();
        settingsMessage = 'STORY AND LEVEL UNLOCKS RESET';
    } else if (commandId === 'reset_garage') {
        resetGarageProgress();
        settingsMessage = 'GARAGE, VEHICLES, UPGRADES AND CREDITS RESET';
    } else if (commandId === 'reset_all') {
        resetStoryAndUnlocks();
        resetGarageProgress();
        settingsMessage = 'ALL STORY AND GARAGE PROGRESS RESET';
    }
    settingsMessageTimer = 3.2;
    settingsConfirmId = '';
    settingsConfirmTimer = 0;
    playTone(commandId === 'reset_all' ? 230 : 520, 0.16, 'square', 0.045);
}

function requestSettingsCommand(commandId) {
    if (settingsConfirmId !== commandId || settingsConfirmTimer <= 0) {
        settingsConfirmId = commandId;
        settingsConfirmTimer = 4.0;
        settingsMessage = 'PRESS ENTER AGAIN TO CONFIRM';
        settingsMessageTimer = 4.0;
        playTone(330, 0.09, 'triangle', 0.035);
        return;
    }
    executeSettingsCommand(commandId);
}

const keys = {
    ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false,
    w: false, s: false, a: false, d: false, n: false, f: false, Shift: false, Space: false
};

function setGear(newGear, playSound = true) {
    const clampedGear = clamp(newGear, 1, 5);
    if (clampedGear === currentGear) return;
    currentGear = clampedGear;
    shifterKnob.textContent = String(currentGear);
    shifterKnob.style.top = `${70 - (currentGear - 1) * 15}px`;
    shiftFlash = 0.7;
    if (playSound) playTone(260 + currentGear * 120, 0.08, 'triangle', 0.045);
}

function resetControls() {
    pressedCodes.clear();
    Object.keys(keys).forEach(key => { keys[key] = false; });
    steerRotation = 0;
    steeringWheel.style.transform = 'rotate(0deg)';
}


function saveStoryProgress() {
    localStorage.setItem('outspeed_story_current_v2', String(storyCurrentLevel));
    localStorage.setItem('outspeed_entropia_unlocked_v3', String(unlockedLevels));
    // Keep the legacy keys updated for older builds without losing the new route.
    localStorage.setItem('outspeed_story_current_v1', String(Math.min(storyCurrentLevel, 11)));
    localStorage.setItem('outspeed_entropia_unlocked_v2', String(Math.min(unlockedLevels, 11)));
}

function beginNewStory() {
    storyCurrentLevel = 1;
    selectedLevel = 1;
    mode = 'STORY';
    saveStoryProgress();
    startRadioSequence();
}

function completeCampaignForDevelopment() {
    unlockedLevels = MAX_LEVEL;
    storyCurrentLevel = MAX_LEVEL;
    selectedLevel = MAX_LEVEL;
    garageUnlocked = true;
    garageVisited = true;
    garageData.credits = Math.max(garageData.credits, 2500000);
    localStorage.setItem('outspeed_garage_unlocked', 'true');
    localStorage.setItem('outspeed_garage_visited_v2', 'true');
    saveStoryProgress();
    saveGarageData();
    startPanel.classList.add('hidden');
    gameoverPanel.classList.add('hidden');
    gameState = 'GARAGE';
    garageClassIndex = 0;
    garageVehicleIndex = 0;
    setGarageMessage('DEV TOUR COMPLETE — 2,500,000 CR ADDED');
    playTone(980, 0.12, 'square', 0.055);
    window.setTimeout(() => playTone(1320, 0.18, 'sine', 0.055), 120);
}

function toggleLean() {
    cabinet.classList.toggle('lean-in');
    playTone(600, 0.05, 'triangle');
    zoomBtn.classList.add('forced-active');
    window.setTimeout(() => zoomBtn.classList.remove('forced-active'), 100);
}

zoomBtn.addEventListener('pointerdown', event => {
    event.preventDefault();
    event.stopPropagation();
    toggleLean();
});

crtBtn.addEventListener('pointerdown', event => {
    event.preventDefault();
    event.stopPropagation();
    toggleCrt();
});

hornBtn.addEventListener('pointerdown', event => {
    event.preventDefault();
    event.stopPropagation();
    honkHorn();
});

window.addEventListener('keydown', event => {
    const key = event.key;
    const lowerKey = key.length === 1 ? key.toLowerCase() : key;
    pressedCodes.add(event.code);
    refreshDrivingKeyState();

    // Backquote (`) toggles a live collision-box overlay. It is intentionally
    // independent of remappable controls so it is always available for tuning.
    if (event.code === 'Backquote' || key === '`' || key === '~') {
        event.preventDefault();
        hitboxDebug = !hitboxDebug;
        if (['STARTING', 'RACING', 'CRASHING', 'FINISHING'].includes(gameState)) {
            setEventMessage(`HITBOX DEBUG ${hitboxDebug ? 'ON' : 'OFF'}`, 1.4);
        }
        playTone(hitboxDebug ? 920 : 360, 0.06, 'square', 0.035);
        return;
    }

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(key)) event.preventDefault();
    if (event.repeat && !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(key)) return;

    // ENTER acts exactly like the physical coin slot on the title and loss
    // screens. Victories still advance automatically through Story Mode.
    if ((gameState === 'INSERT_COIN' || gameState === 'GAMEOVER') && key === 'Enter') {
        event.preventDefault();
        activateCoinSlot();
        return;
    }

    if (gameState === 'SETTINGS') {
        event.preventDefault();
        const items = settingsItems();

        if (settingsRebinding) {
            if (key === 'Escape') {
                settingsRebinding = null;
                settingsMessage = 'REBIND CANCELLED';
                settingsMessageTimer = 1.4;
                playTone(320, 0.06, 'triangle');
                return;
            }
            if (key === 'Backspace' || key === 'Delete') {
                assignKeybind(settingsRebinding.actionId, settingsRebinding.slot, '');
                settingsRebinding = null;
                settingsMessage = 'BINDING CLEARED';
                settingsMessageTimer = 1.5;
                playTone(420, 0.06, 'triangle');
                return;
            }
            const binding = bindingFromEvent(event);
            if (!binding) {
                settingsMessage = 'PRESS A NON-MODIFIER KEY';
                settingsMessageTimer = 1.3;
                return;
            }
            assignKeybind(settingsRebinding.actionId, settingsRebinding.slot, binding);
            settingsMessage = `${KEYBIND_ACTIONS.find(action => action.id === settingsRebinding.actionId).label}: ${formatBinding(binding)}`;
            settingsMessageTimer = 2.0;
            settingsRebinding = null;
            playTone(760, 0.08, 'sine');
            return;
        }

        if (key === 'Escape') {
            gameState = 'MAIN_MENU';
            settingsConfirmId = '';
            settingsConfirmTimer = 0;
            resetControls();
            playTone(360, 0.06, 'triangle');
            return;
        }
        if (key === 'ArrowUp' || key === 'w' || key === 'W') {
            settingsSelection = (settingsSelection + items.length - 1) % items.length;
            settingsConfirmId = '';
            playTone(560, 0.035, 'sine', 0.025);
        } else if (key === 'ArrowDown' || key === 's' || key === 'S') {
            settingsSelection = (settingsSelection + 1) % items.length;
            settingsConfirmId = '';
            playTone(640, 0.035, 'sine', 0.025);
        } else if (key === 'ArrowLeft' || key === 'a' || key === 'A') {
            settingsSlot = 0;
            playTone(520, 0.035, 'sine', 0.025);
        } else if (key === 'ArrowRight' || key === 'd' || key === 'D') {
            settingsSlot = 1;
            playTone(700, 0.035, 'sine', 0.025);
        } else if (key === 'Enter' || key === ' ') {
            const item = items[settingsSelection];
            if (item.type === 'binding') {
                settingsRebinding = { actionId: item.id, slot: settingsSlot };
                settingsMessage = `PRESS NEW KEY FOR ${item.label}`;
                settingsMessageTimer = 99;
                playTone(820, 0.06, 'triangle');
            } else {
                requestSettingsCommand(item.id);
            }
        } else if (key === 'Backspace' || key === 'Delete') {
            const item = items[settingsSelection];
            if (item.type === 'binding') {
                assignKeybind(item.id, settingsSlot, '');
                settingsMessage = 'BINDING CLEARED';
                settingsMessageTimer = 1.5;
            }
        }

        const visibleRows = 9;
        if (settingsSelection < settingsScroll) settingsScroll = settingsSelection;
        if (settingsSelection >= settingsScroll + visibleRows) settingsScroll = settingsSelection - visibleRows + 1;
        return;
    }

    // Type JAEDEV from either story/menu screen to complete the campaign
    // and open a funded garage for testing.
    if (['MAIN_MENU', 'STORY_MENU'].includes(gameState) && /^[a-z0-9]$/i.test(key)) {
        devCodeBuffer = (devCodeBuffer + key.toUpperCase()).slice(-DEV_CHEAT_CODE.length);
        if (devCodeBuffer === DEV_CHEAT_CODE) {
            completeCampaignForDevelopment();
            devCodeBuffer = '';
            return;
        }
    }

    if (gameState === 'GARAGE' && plateEditing) {
        event.preventDefault();
        if (key === 'Enter') { commitPlateEdit(); return; }
        if (key === 'Escape') { cancelPlateEdit(); return; }
        if (key === 'Backspace') {
            plateEditBuffer = plateEditBuffer.slice(0, -1);
            playTone(420, 0.025, 'square', 0.018);
            return;
        }
        if ((/^[a-z0-9]$/i.test(key) || key === ' ') && plateEditBuffer.length < 7) {
            plateEditBuffer = sanitizePlate(plateEditBuffer + key, true);
            playTone(600 + plateEditBuffer.length * 28, 0.025, 'square', 0.018);
        }
        return;
    }

    if (actionPressed(event, 'crt')) {
        event.preventDefault();
        toggleCrt();
        return;
    }
    if (actionPressed(event, 'weapon') && gameState === 'RACING') { fireSpaceWeapon(); return; }
    if (actionPressed(event, 'siren') && ['STARTING', 'RACING', 'FINISHING'].includes(gameState)) {
        togglePlayerSiren();
        return;
    }
    if (actionPressed(event, 'horn') && ['STARTING', 'RACING', 'FINISHING'].includes(gameState)) {
        honkHorn();
        return;
    }
    if (actionPressed(event, 'lean')) toggleLean();
    if (actionPressed(event, 'mute')) {
        audioMuted = !audioMuted;
        if (!audioMuted) playTone(760, 0.08, 'sine');
    }
    if (actionPressed(event, 'assist')) {
        handlingAssist = !handlingAssist;
        localStorage.setItem('outspeed_assist', String(handlingAssist));
        playTone(handlingAssist ? 900 : 350, 0.08, 'sine');
    }
    if (actionPressed(event, 'autoShift')) {
        autoShift = !autoShift;
        localStorage.setItem('outspeed_auto_shift', String(autoShift));
        playTone(autoShift ? 900 : 350, 0.08, 'triangle');
    }
    if (actionPressed(event, 'pause') && ['LEVEL_INTRO', 'STARTING', 'RACING', 'FINISHING'].includes(gameState)) {
        paused = !paused;
        if (paused) stopEngine();
        else lastTime = performance.now();
    }

    if (gameState === 'GARAGE') {
        if (key === 'Escape' || lowerKey === 'g') {
            plateEditing = false;
            plateEditBuffer = '';
            gameState = 'MAIN_MENU';
            playTone(360, 0.06, 'triangle');
            return;
        }
        if (key === 'ArrowUp' || lowerKey === 'w') {
            garageClassIndex = (garageClassIndex + GARAGE_CLASSES.length - 1) % GARAGE_CLASSES.length;
            garageVehicleIndex = 0;
            plateEditing = false;
            playTone(620, 0.05, 'sine');
            return;
        }
        if (key === 'ArrowDown' || lowerKey === 's') {
            garageClassIndex = (garageClassIndex + 1) % GARAGE_CLASSES.length;
            garageVehicleIndex = 0;
            plateEditing = false;
            playTone(720, 0.05, 'sine');
            return;
        }
        if (key === 'ArrowLeft' || lowerKey === 'a') {
            const list = garageCurrentList();
            garageVehicleIndex = (garageVehicleIndex + list.length - 1) % list.length;
            plateEditing = false;
            playTone(560, 0.04, 'sine');
            return;
        }
        if (key === 'ArrowRight' || lowerKey === 'd') {
            const list = garageCurrentList();
            garageVehicleIndex = (garageVehicleIndex + 1) % list.length;
            plateEditing = false;
            playTone(660, 0.04, 'sine');
            return;
        }
        if (key === 'Enter' || key === ' ') { equipOrBuyGarageVehicle(); return; }
        if (lowerKey === 'c') { cycleGaragePaint('paint'); return; }
        if (lowerKey === 'v') { cycleGaragePaint('accent'); return; }
        if (lowerKey === 'p') { beginPlateEdit(); return; }
        if (['1', '2', '3', '4', '5'].includes(key)) { buyGarageUpgrade(UPGRADE_KEYS[Number(key) - 1]); return; }
        if (key === '6') { buyGarageUpgrade('weapon'); return; }
        return;
    }

    if (gameState === 'MAIN_MENU') {
        if (key === '3' || lowerKey === 'g') {
            garageVisited = true;
            localStorage.setItem('outspeed_garage_visited_v2', 'true');
            gameState = 'GARAGE';
            garageClassIndex = 0;
            garageVehicleIndex = 0;
            garageMessageTimer = 0;
            playTone(720, 0.10, 'triangle');
            return;
        }
        if (key === '4' || lowerKey === 's') {
            enterSettings();
            return;
        }
        if (key === '1') {
            gameState = 'STORY_MENU';
            devCodeBuffer = '';
            playTone(650, 0.07, 'sine');
        } else if (key === '2') {
            mode = 'ARCADE';
            selectedLevel = 1;
            startRadioSequence();
        }
    } else if (gameState === 'STORY_MENU') {
        if (key === 'Escape') {
            gameState = 'MAIN_MENU';
            playTone(360, 0.06, 'triangle');
            return;
        }
        if (key === '1' || lowerKey === 'c') {
            mode = 'STORY';
            selectedLevel = storyCurrentLevel;
            startRadioSequence();
            return;
        }
        if (key === '2' || lowerKey === 'n') {
            beginNewStory();
            return;
        }
    } else if (gameState === 'RADIO_DASH') {
        if (mode === 'ARCADE') {
            if (key === 'ArrowLeft' || lowerKey === 'a') {
                selectedLevel = Math.max(1, selectedLevel - 1);
                playTone(650, 0.05, 'sine');
            }
            if (key === 'ArrowRight' || lowerKey === 'd') {
                selectedLevel = Math.min(unlockedLevels, selectedLevel + 1);
                playTone(780, 0.05, 'sine');
            }
        }
        if (key === 'Enter' || key === ' ') beginSelectedLevel();
    }

    if (actionPressed(event, 'shiftUp') && ['STARTING', 'RACING'].includes(gameState)) {
        event.preventDefault();
        autoShift = false;
        localStorage.setItem('outspeed_auto_shift', 'false');
        setGear(currentGear + 1);
    } else if (actionPressed(event, 'shiftDown') && ['STARTING', 'RACING'].includes(gameState)) {
        event.preventDefault();
        autoShift = false;
        localStorage.setItem('outspeed_auto_shift', 'false');
        setGear(currentGear - 1);
    }
}, { passive: false });

window.addEventListener('keyup', event => {
    pressedCodes.delete(event.code);
    refreshDrivingKeyState();
});
window.addEventListener('blur', resetControls);

function activateCoinSlot() {
    if (gameState !== 'INSERT_COIN' && gameState !== 'GAMEOVER') return;
    initAudio();
    playTone(880, 0.1, 'square');
    window.setTimeout(() => playTone(1200, 0.18, 'sine'), 90);
    startPanel.classList.add('hidden');
    gameoverPanel.classList.add('hidden');
    gameState = 'MAIN_MENU';
    paused = false;
    resetControls();
}

coinSlot.addEventListener('click', activateCoinSlot);

// Dedicated retry/start listener. This runs in the capture phase so Enter
// cannot be swallowed by menu navigation, a focused control, or remapped keys.
// It supports both the regular Enter key and the numeric-keypad Enter key.
window.addEventListener('keydown', event => {
    const isEnterKey = event.key === 'Enter' || event.code === 'Enter' || event.code === 'NumpadEnter';
    if (!isEnterKey || event.repeat) return;
    if (gameState !== 'INSERT_COIN' && gameState !== 'GAMEOVER') return;

    event.preventDefault();
    event.stopImmediatePropagation();
    activateCoinSlot();
}, { capture: true, passive: false });

function startRadioSequence() {
    gameState = 'RADIO_DASH';
    handX = 400;
    radioTimer = 0;
    playTone(180, 0.18, 'sawtooth');
}

function beginSelectedLevel() {
    const level = currentLevel();
    if (level.specialIntro) {
        gameState = 'LEVEL_INTRO';
        specialIntroTimer = 0;
        specialIntroDuration = level.specialIntro === 'rocket' ? 8.2 : level.specialIntro === 'launch' ? 6.2 : 4.5;
        stopEngine();
    } else {
        startRaceSequence();
    }
}

function startRaceSequence() {
    const level = currentLevel();
    gameState = 'STARTING';
    paused = false;
    countdownTimer = 3.4;
    countdownValue = 3;
    goFlashTimer = 0;
    checkpointFlash = 0;
    shiftFlash = 0;
    crashFlash = 0;
    collisionCooldown = 0;
    finishCelebration = 0;
    finishPending = false;
    engineRPM = 0;
    pos = 0;
    speed = 0;
    playerX = 0;
    lateralVelocity = 0;
    timeLeft = level.startTime;
    nextCheckpoint = level.checkpointEvery;
    score = 0;
    overtakes = 0;
    trafficCars = [];
    trafficSpawnTimer = 2.7;
    roadFlowOffset = 0;
    handbrakeAmount = 0;
    burnoutAmount = 0;
    donutAmount = 0;
    donutPhase = 0;
    driftAngle = 0;
    tireSmoke = [];
    skidMarks = [];
    smokeAccumulator = 0;
    skidAccumulator = 0;
    skidToneCooldown = 0;
    racePosition = 1;
    raceFieldSize = 1;
    raceLeaderFinished = false;
    policeChase = {
        active: false, timer: 0, sirenTimer: 0, source: '',
        gap: 0, escapeProgress: 0, escapeNeeded: 0, escapeSpeed: 0,
        copSpeed: 0, maxDuration: 0
    };
    bustedTimer = 0;
    crashState = { active: false, fatal: false, timer: 0, duration: 0, severity: '', angle: 0, roll: 0, message: '' };
    crashParticles = [];
    explosionBursts = [];
    impactFreeze = 0;
    dangerFlash = 0;
    eventMessage = '';
    eventMessageTimer = 0;
    nearMisses = 0;
    resetVehicleDamage();
    nitroCharge = nitroCapacityFor();
    nitroActive = false;
    weaponCooldown = 0;
    weaponFlash = 0;
    spaceProjectiles = [];
    setPlayerSiren(false, false);
    setGear(1, false);
    shifterKnob.textContent = '1';
    shifterKnob.style.top = '70px';
    resetControls();
    initializeSpecialTraffic();
}

function showResult(won, reason = '') {
    paused = false;
    setPlayerSiren(false, false);
    stopEngine();
    resetControls();
    const level = currentLevel();
    lastResultWon = won;
    resultPayout = 0;

    if (won) {
        gameState = 'WIN_RESULTS';
        resultAdvanceTimer = 5.4;
        resultTitle.textContent = selectedLevel === MAX_LEVEL && mode === 'STORY' ? 'ENTROPIA TOUR COMPLETE!' : 'COURSE CLEARED!';
        resultTitle.style.color = '#00ffcc';
        playTone(900, 0.18, 'sine');
        window.setTimeout(() => playTone(1200, 0.24, 'sine'), 170);
        resultPayout = awardRaceCredits();

        if (mode === 'STORY' && selectedLevel === storyCurrentLevel && storyCurrentLevel < MAX_LEVEL) {
            storyCurrentLevel += 1;
            unlockedLevels = Math.max(unlockedLevels, storyCurrentLevel);
            saveStoryProgress();
        }
        if (mode === 'STORY' && selectedLevel === MAX_LEVEL) {
            resultNextHint.textContent = 'TOUR COMPLETE — RETURNING TO YOUR GARAGE...';
        } else if (mode === 'STORY') {
            resultNextHint.textContent = 'NEXT RACE STARTS AUTOMATICALLY...';
        } else {
            resultNextHint.textContent = 'RETURNING TO THE ARCADE MENU...';
        }
    } else {
        gameState = 'GAMEOVER';
        resultTitle.textContent = reason || 'TIME OUT';
        resultTitle.style.color = reason.includes('POLICE') ? '#4da6ff' : '#d31111';
        resultNextHint.textContent = 'Press ENTER or click the coin slot to try again';
        playTone(reason.includes('POLICE') ? 210 : 150, 0.75, 'sawtooth');
    }

    const nextText = won && selectedLevel < MAX_LEVEL ? `<br>NEXT: ${LEVELS[selectedLevel + 1].destination}` : '';
    const raceText = currentRules().raceRequired ? `<br>RACE POSITION: ${racePosition}/${raceFieldSize}` : '';
    const payoutText = won ? `<br><span style="color:#ffda3a">CREDITS EARNED: ${resultPayout.toLocaleString()}<br>BANK: ${Math.floor(garageData.credits).toLocaleString()}</span>` : '';
    const unlockText = won && mode === 'STORY' && selectedLevel === MAX_LEVEL ? '<br><span style="color:#ff7ee8">ENTROPIA TOUR COMPLETE — GARAGE BONUS PAID!</span>' : '';
    finalScoreText.innerHTML = `${level.name}<br>DISTANCE: ${Math.floor(pos)}m / ${level.length}m<br>SCORE: ${Math.floor(score)}<br>OVERTAKES: ${overtakes}<br>NEAR MISSES: ${nearMisses}${raceText}${payoutText}${nextText}${unlockText}`;
    gameoverPanel.classList.remove('hidden');
}

function turnContribution(z, event, length) {
    const start = event.start * length;
    const end = event.end * length;
    if (z <= start || z >= end) return 0;
    const t = clamp((z - start) / Math.max(1, end - start), 0, 1);
    const envelope = Math.sin(Math.PI * t);
    if (event.type === 'esses') return event.amp * Math.sin(Math.PI * 2 * t) * envelope;
    if (event.type === 'hairpin') return event.amp * Math.sin(Math.PI * t) * (0.92 + 0.18 * Math.sin(Math.PI * t));
    if (event.type === 'tight') return event.amp * Math.sin(Math.PI * t);
    return event.amp * Math.sin(Math.PI * t) * 0.86;
}

function trackCenterAt(z, levelNumber) {
    const level = LEVELS[levelNumber];
    const rules = LEVEL_RULES[levelNumber];
    const intro = smoothstep(240, 900, z);
    const finishEase = 1 - smoothstep(level.length - 720, level.length - 80, z);
    const phase = levelNumber * 0.71;
    let center = (
        Math.sin(z / (1380 - levelNumber * 18) + phase) * 0.10 +
        Math.sin(z / (2550 + levelNumber * 25) - phase * 0.4) * 0.07
    ) * level.curve;

    const plans = TURN_PLANS[levelNumber] || [];
    for (const event of plans) center += turnContribution(z, event, level.length) * (0.82 + rules.difficulty * 0.18);

    if (level.theme === 'city' || level.theme === 'rocktropia') center += Math.sin(z / 520 + phase) * 0.055;
    if (level.theme === 'carnival') center += Math.sin(z / 440) * 0.065;
    if (level.theme === 'space') center *= 0.78;
    return clamp(center * intro * finishEase, -1.28, 1.28);
}

function getActiveTurn(z, levelNumber) {
    const level = LEVELS[levelNumber];
    const plans = TURN_PLANS[levelNumber] || [];
    for (const event of plans) {
        if (z >= event.start * level.length && z <= event.end * level.length) return event;
    }
    return null;
}

function getUpcomingTurn(z, levelNumber, lookAhead = 650) {
    const level = LEVELS[levelNumber];
    const plans = TURN_PLANS[levelNumber] || [];
    let best = null;
    let bestDistance = Infinity;
    for (const event of plans) {
        const start = event.start * level.length;
        const distance = start - z;
        if (distance >= -50 && distance <= lookAhead && distance < bestDistance) {
            best = event;
            bestDistance = distance;
        }
    }
    return best ? { ...best, distance: Math.max(0, bestDistance) } : null;
}

function getTrackMetrics(z, levelNumber) {
    const level = LEVELS[levelNumber];
    const rules = LEVEL_RULES[levelNumber];
    const center = trackCenterAt(z, levelNumber);
    const sample = 4;
    const center2 = trackCenterAt(z + sample, levelNumber);
    const curvatureCap = CURVE_CAPS[levelNumber] || 1.35;
    const curvature = clamp(((center2 - center) / sample) * (300 + rules.difficulty * 48), -curvatureCap, curvatureCap);
    const activeTurn = getActiveTurn(z, levelNumber);
    const phase = levelNumber * 0.71;
    const intro = smoothstep(240, 900, z);
    const finishEase = 1 - smoothstep(level.length - 720, level.length - 80, z);
    let hill = intro * finishEase * level.hill * (Math.sin(z / 920 + phase) * 8 + Math.sin(z / 1850 - 0.6) * 5);
    if (level.theme === 'city' || level.theme === 'carnival' || level.theme === 'space') hill *= 0.45;
    const danger = clamp(Math.abs(curvature), 0, 1);
    const vehicleFloor = level.vehicle === 'ship' ? 145 : level.vehicle === 'bumper' ? 58 : 62;
    const recommendedSpeed = lerp(level.topSpeed * 0.94, vehicleFloor, Math.pow(danger, 0.72));
    const widthScale = clamp(1 - danger * (0.035 + rules.difficulty * 0.035), 0.86, 1);
    const isDark = Math.floor(z / 34) % 2 === 0;
    return {
        center,
        curvature,
        hill,
        isDark,
        widthScale,
        turnType: activeTurn ? activeTurn.type : '',
        recommendedSpeed
    };
}

function calculateRPMRatio() {
    const gears = currentGears();
    const gear = gears[currentGear];
    const floorSpeed = currentGear === 1 ? 0 : gears[currentGear - 1].maxSpd * 0.62;
    const usableRange = Math.max(1, gear.maxSpd - floorSpeed);
    return clamp((speed - floorSpeed) / usableRange, 0.08, 1);
}

function updateAutomaticGearbox() {
    if (!autoShift || gameState !== 'RACING') return;
    const gears = currentGears();
    const gear = gears[currentGear];
    if (currentGear < 5 && speed > gear.maxSpd * 0.92) {
        setGear(currentGear + 1);
        return;
    }
    if (currentGear > 1) {
        const lowerMax = gears[currentGear - 1].maxSpd;
        if (speed < lowerMax * 0.70) setGear(currentGear - 1);
    }
}

function makeTrafficCar(options = {}) {
    const colors = ['#1e56ff', '#c8c8c8', '#17a63c', '#ffd21f', '#ff7b1a', '#b833d6', '#00e8ff'];
    return {
        z: options.z ?? pos + 360,
        x: options.x ?? 0,
        targetX: options.targetX ?? options.x ?? 0,
        speed: options.speed ?? 65,
        targetSpeed: options.targetSpeed ?? options.speed ?? 65,
        color: options.color || colors[Math.floor(Math.random() * colors.length)],
        counted: false,
        kind: options.kind || 'car',
        parked: Boolean(options.parked),
        triggered: false,
        panicChecked: false,
        panicking: false,
        panicTimer: 0,
        panicCrashTimer: Infinity,
        yielding: false,
        emergencyYield: false,
        yieldTimer: 0,
        yieldCooldown: 0,
        cruiseSpeed: options.speed ?? 65,
        wreckState: '',
        wreckTimer: 0,
        rollAngle: 0,
        rollRate: 0,
        laneTimer: 1 + Math.random() * 3,
        aiBase: options.aiBase || 0,
        racerId: options.racerId || 0,
        finished: false,
        lastDz: Infinity
    };
}

function initializeSpecialTraffic() {
    const level = currentLevel();
    const rules = currentRules();
    const lanes = [-0.63, -0.22, 0.22, 0.63];

    for (let i = 0; i < rules.speedTraps; i += 1) {
        const fraction = rules.speedTraps === 1 ? (selectedLevel % 2 ? 0.58 : 0.42) : 0.35 + i * 0.28;
        const side = (i + selectedLevel) % 2 ? -1 : 1;
        trafficCars.push(makeTrafficCar({
            z: level.length * fraction,
            x: side * 1.31,
            targetX: side * 1.31,
            speed: 0,
            kind: 'police',
            parked: true,
            color: '#f3f3f3'
        }));
    }

    if (rules.racers > 0) {
        raceFieldSize = rules.racers + 1;
        for (let i = 0; i < rules.racers; i += 1) {
            const baseRatio = selectedLevel === MAX_LEVEL ? 0.61 + i * 0.012 : 0.56 + i * 0.014;
            trafficCars.push(makeTrafficCar({
                z: 54 + i * 13,
                x: lanes[i % lanes.length],
                targetX: lanes[i % lanes.length],
                speed: 0,
                targetSpeed: level.topSpeed * baseRatio,
                aiBase: level.topSpeed * baseRatio,
                kind: 'racer',
                racerId: i + 1,
                color: ['#00eaff', '#ffde22', '#ff4f7d', '#7cff45', '#be55ff', '#ff7b1a'][i % 6]
            }));
        }
    }
}

function spawnTraffic() {
    const level = currentLevel();
    const rules = currentRules();
    const ordinaryCount = trafficCars.filter(car => !car.parked && car.kind !== 'racer').length;
    const maxCars = level.theme === 'carnival' ? 13 : 10;
    if (ordinaryCount >= maxCars) return;

    const laneChoices = [-0.61, -0.21, 0.21, 0.61];
    const lane = laneChoices[Math.floor(Math.random() * laneChoices.length)];
    const isShip = level.vehicle === 'ship';
    const isBumper = level.vehicle === 'bumper';
    const canSpawnPolice = !isShip && !isBumper && !policeChase.active && Math.random() < rules.policeChance;
    const base = isShip ? 118 : isBumper ? 48 : 52;
    const spread = isShip ? 115 : isBumper ? 65 : 66;
    const highSpeedSpawnPull = smoothstep(125, effectiveTopSpeed(), speed);
    const spawnDistance = lerp(510, 255, highSpeedSpawnPull) + Math.random() * lerp(620, 380, highSpeedSpawnPull);

    trafficCars.push(makeTrafficCar({
        z: pos + spawnDistance,
        x: lane,
        targetX: lane,
        speed: base + Math.random() * spread,
        kind: canSpawnPolice ? 'police' : isShip ? 'ship' : isBumper ? 'bumper' : 'car',
        color: canSpawnPolice ? '#f4f4f4' : undefined
    }));
}

function setEventMessage(message, duration = 1.7) {
    eventMessage = message;
    eventMessageTimer = duration;
}

function triggerPoliceChase(car, source = 'PATROL') {
    if (policeChase.active || gameState !== 'RACING') return;
    const rules = currentRules();
    if (speed <= rules.speedLimit + 12) return;

    const topSpeed = effectiveTopSpeed();
    const copSkill = 0.72 + Math.random() * 0.10;
    policeChase = {
        active: true,
        timer: 0,
        sirenTimer: 0,
        source,
        gap: 82 + Math.random() * 34,
        escapeProgress: 0,
        escapeNeeded: 5.5 + Math.random() * 2.5,
        escapeSpeed: Math.min(topSpeed * 0.82, Math.max(rules.speedLimit + 42, topSpeed * 0.68)),
        copSpeed: clamp(Math.max(rules.speedLimit + 50, topSpeed * copSkill), rules.speedLimit + 48, topSpeed * 0.86),
        maxDuration: 25 + Math.random() * 6
    };
    if (car) car.triggered = true;
    setEventMessage(source === 'SPEED TRAP' ? 'RADAR LOCK — RUN OR PULL OVER!' : 'YOU PASSED A COP SPEEDING — GO!', 2.5);
    dangerFlash = 1.4;
    playTone(720, 0.12, 'square', 0.06);
    window.setTimeout(() => playTone(520, 0.12, 'square', 0.06), 130);
}

function escapePoliceChase() {
    if (!policeChase.active) return;
    policeChase.active = false;
    const bonus = 2500 + selectedLevel * 350;
    score += bonus;
    setEventMessage(`YOU LOST THE COPS! +${bonus} SCORE`, 2.8);
    dangerFlash = 0;
    playTone(880, 0.11, 'sine', 0.055);
    window.setTimeout(() => playTone(1180, 0.18, 'sine', 0.055), 110);
}

function spawnCrashBurst(power = 1, explosion = false) {
    const count = Math.floor(18 + power * 28);
    for (let i = 0; i < count; i += 1) {
        const angle = Math.random() * TAU;
        const velocity = 40 + Math.random() * (90 + power * 110);
        crashParticles.push({
            x: WIDTH / 2 + (Math.random() - 0.5) * 55,
            y: HEIGHT - 72 + (Math.random() - 0.5) * 28,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity - 45,
            gravity: 125 + Math.random() * 90,
            life: 0.55 + Math.random() * 1.15,
            maxLife: 1.7,
            size: 1.5 + Math.random() * 4.5,
            color: explosion ? (Math.random() < 0.55 ? '#ffb020' : '#ff3b18') : (Math.random() < 0.55 ? '#e6e6e6' : '#4b4b4b')
        });
    }
    if (explosion) explosionBursts.push({ x: WIDTH / 2, y: HEIGHT - 82, radius: 8, life: 0.72, maxLife: 0.72 });
}

function wreckTraffic(car, severity = 'roll') {
    if (!car || car.wreckState) return;
    car.wreckState = severity === 'catastrophic' || severity === 'explode' ? 'exploded' : severity === 'minor' ? 'spin' : 'roll';
    car.wreckTimer = car.wreckState === 'exploded' ? 4.5 : 3.4;
    car.rollRate = (Math.random() < 0.5 ? -1 : 1) * (car.wreckState === 'roll' ? 7 + Math.random() * 7 : 3 + Math.random() * 4);
    car.targetX = clamp(car.x + (Math.random() < 0.5 ? -1 : 1) * (0.7 + Math.random() * 0.55), -1.6, 1.6);
    car.speed *= car.wreckState === 'exploded' ? 0.18 : 0.42;
    if (Math.abs(car.z - pos) < 95) spawnCrashBurst(car.wreckState === 'exploded' ? 1.15 : 0.65, car.wreckState === 'exploded');
}

function startPlayerCrash(severity, car = null, impact = 0) {
    applyVehicleDamage(severity, impact);
    const catastrophic = severity === 'catastrophic';
    const severe = severity === 'severe';
    const medium = severity === 'medium';
    const duration = catastrophic ? 3.1 : severe ? 1.9 : medium ? 1.05 : 0.45;
    crashState = {
        active: true,
        fatal: catastrophic,
        timer: duration,
        duration,
        severity,
        angle: 0,
        roll: 0,
        message: catastrophic ? 'CATASTROPHIC WRECK!' : severe ? 'MAJOR CRASH!' : medium ? 'SPIN OUT!' : 'IMPACT!'
    };
    impactFreeze = catastrophic ? 0.11 : severe ? 0.075 : 0.035;
    crashFlash = catastrophic ? 1.25 : severe ? 0.9 : medium ? 0.62 : 0.36;
    dangerFlash = Math.max(dangerFlash, catastrophic ? 1.8 : 0.7);
    spawnCrashBurst(catastrophic ? 1.55 : severe ? 1.05 : medium ? 0.7 : 0.35, catastrophic || (severe && impact > 170));

    if (catastrophic) {
        gameState = 'CRASHING';
        speed *= 0.48;
        playTone(58, 0.85, 'sawtooth', 0.10);
    } else if (severe) {
        speed *= 0.28;
        lateralVelocity += (Math.random() < 0.5 ? -1 : 1) * 2.8;
        playTone(72, 0.48, 'sawtooth', 0.09);
    } else if (medium) {
        speed *= 0.48;
        lateralVelocity += (Math.random() < 0.5 ? -1 : 1) * 1.75;
        playTone(92, 0.32, 'sawtooth', 0.075);
    } else {
        speed *= 0.70;
        lateralVelocity += playerX <= (car ? car.x : 0) ? -0.7 : 0.7;
        playTone(125, 0.18, 'sawtooth', 0.055);
    }
}

function handlePlayerCollision(car) {
    const bumper = currentLevel().vehicle === 'bumper';
    const relativeSpeed = Math.max(0, speed - car.speed);
    const armor = Math.max(0.45, getVehiclePerformance().armor);
    const impact = (relativeSpeed + Math.abs(lateralVelocity) * 34) / armor;
    const damageSpeed = speed / armor;

    if (bumper) {
        speed = Math.max(28, speed * 0.76);
        lateralVelocity += playerX <= car.x ? -0.9 : 0.9;
        wreckTraffic(car, 'minor');
        collisionCooldown = 0.42;
        crashFlash = 0.28;
        playTone(180, 0.12, 'sawtooth', 0.045);
        return;
    }

    let severity = 'minor';
    if ((damageSpeed >= 252 && impact >= 145) || impact >= 205) severity = 'catastrophic';
    else if (damageSpeed >= 205 || impact >= 140) severity = 'severe';
    else if (damageSpeed >= 128 || impact >= 78) severity = 'medium';

    if (severity === 'catastrophic') wreckTraffic(car, 'catastrophic');
    else if (severity === 'severe') wreckTraffic(car, Math.random() < 0.48 ? 'explode' : 'roll');
    else if (severity === 'medium') wreckTraffic(car, 'roll');
    else wreckTraffic(car, 'minor');

    startPlayerCrash(severity, car, impact);
    collisionCooldown = severity === 'minor' ? 0.7 : 1.25;
}

function updatePoliceChase(dt) {
    if (!policeChase.active || gameState !== 'RACING') return;
    policeChase.timer += dt;
    policeChase.sirenTimer -= dt;
    if (policeChase.sirenTimer <= 0) {
        const high = Math.floor(policeChase.timer * 4) % 2 === 0;
        playTone(high ? 760 : 520, 0.09, 'square', 0.032);
        policeChase.sirenTimer = 0.24;
    }

    const cleanRun = !crashState.active && collisionCooldown <= 0 && Math.abs(playerX) < CONFIG.offRoadStart;
    const fastEnough = cleanRun && speed >= policeChase.escapeSpeed;
    const playerVelocity = speed * MPH_TO_MPS;
    const copVelocity = policeChase.copSpeed * MPH_TO_MPS;

    // Distance is simulated instead of using an unavoidable countdown. Speed,
    // clean driving and staying on the road can now genuinely create a gap.
    policeChase.gap += (playerVelocity - copVelocity) * dt;
    if (fastEnough) {
        policeChase.gap += 3.4 * dt;
        policeChase.escapeProgress += dt;
    } else {
        policeChase.escapeProgress = Math.max(0, policeChase.escapeProgress - dt * 0.80);
        policeChase.gap -= (speed < 45 ? 8.5 : 1.5) * dt;
    }
    if (!cleanRun) policeChase.gap -= 13 * dt;
    if (crashState.active) policeChase.gap -= 22 * dt;
    policeChase.gap = clamp(policeChase.gap, 0, 280);

    if (policeChase.escapeProgress >= policeChase.escapeNeeded && policeChase.gap >= 150) {
        escapePoliceChase();
        return;
    }

    if (policeChase.gap <= 7 || policeChase.timer >= policeChase.maxDuration) {
        policeChase.active = false;
        gameState = 'BUSTED';
        bustedTimer = 2.4;
        setEventMessage('PULL OVER! YOU ARE BUSTED.', 2.4);
        speed *= 0.55;
        stopEngine();
    }
}

function updateCrashEffects(dt) {
    eventMessageTimer = Math.max(0, eventMessageTimer - dt);
    dangerFlash = Math.max(0, dangerFlash - dt);
    impactFreeze = Math.max(0, impactFreeze - dt);
    if (crashState.active && !crashState.fatal) {
        crashState.timer -= dt;
        crashState.angle += dt * (crashState.severity === 'severe' ? 7.5 : 4.8);
        crashState.roll = Math.sin(crashState.angle) * (crashState.severity === 'severe' ? 0.30 : 0.17);
        if (crashState.timer <= 0) crashState = { active: false, fatal: false, timer: 0, duration: 0, severity: '', angle: 0, roll: 0, message: '' };
    }
    for (let i = crashParticles.length - 1; i >= 0; i -= 1) {
        const particle = crashParticles[i];
        particle.life -= dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vy += particle.gravity * dt;
        particle.vx *= Math.max(0, 1 - dt * 1.6);
        if (particle.life <= 0) crashParticles.splice(i, 1);
    }
    for (let i = explosionBursts.length - 1; i >= 0; i -= 1) {
        const burst = explosionBursts[i];
        burst.life -= dt;
        burst.radius += dt * 165;
        if (burst.life <= 0) explosionBursts.splice(i, 1);
    }
}

function updateCrashSequence(dt) {
    crashState.timer -= dt;
    crashState.angle += dt * 9.5;
    crashState.roll += dt * 5.6;
    speed = Math.max(0, speed - (48 + speed * 0.15) * dt);
    pos += speed * MPH_TO_MPS * dt * 0.52;
    lateralVelocity += Math.sin(crashState.angle) * dt * 1.6;
    playerX = clamp(playerX + lateralVelocity * dt, -CONFIG.hardEdge, CONFIG.hardEdge);
    if (crashState.timer <= 0) showResult(false, 'CATASTROPHIC WRECK');
}

function updateBustedSequence(dt) {
    bustedTimer -= dt;
    speed = Math.max(0, speed - 70 * dt);
    pos += speed * MPH_TO_MPS * dt * 0.30;
    if (bustedTimer <= 0) showResult(false, 'BUSTED BY POLICE');
}

function playerCollisionHalfWidth() {
    // These are inner collision widths in normalized road-lane units, not the
    // full visible body width. Mirrors, fenders and visual overhang are safe.
    const vehicle = getActiveVehicle();
    const vehicleClass = vehicleClassForLevel();

    if (vehicleClass === 'ship') return 0.064;
    if (vehicleClass === 'bumper') return 0.050;
    if (vehicle.kind === 'bike') return 0.031;
    if (vehicle.kind === 'truck') return 0.072;
    if (vehicle.design === 'police') return 0.061;
    if (vehicle.design === 'classic') return 0.057;
    if (vehicle.design === 'civilian') return 0.052;
    return 0.058;
}

function trafficCollisionHalfWidth(car) {
    // Traffic uses a deliberately narrow chassis box. The visible wheels and
    // body corners can overlap slightly without causing an unfair collision.
    let width = 0.050;
    if (car.kind === 'ship') width = 0.064;
    else if (car.kind === 'bumper') width = 0.049;
    else if (car.kind === 'police' || car.kind === 'racer') width = 0.055;
    if (car.wreckState) width += 0.010;
    return width;
}

function playerTrafficCollisionWidth(car) {
    return playerCollisionHalfWidth() + trafficCollisionHalfWidth(car);
}

function updateTraffic(dt) {
    const level = currentLevel();
    const rules = currentRules();
    trafficSpawnTimer -= dt;
    if (trafficSpawnTimer <= 0) {
        spawnTraffic();
        trafficSpawnTimer = Math.max(0.72, 3.45 - level.traffic * 1.30 + Math.random() * 1.55);
    }

    collisionCooldown = Math.max(0, collisionCooldown - dt);
    const playerTopSpeed = effectiveTopSpeed();
    const speedRatio = clamp(speed / Math.max(1, playerTopSpeed), 0, 1);

    for (let index = trafficCars.length - 1; index >= 0; index -= 1) {
        const car = trafficCars[index];
        const oldDz = Number.isFinite(car.lastDz) ? car.lastDz : (car.z - pos);

        if (car.wreckState) {
            car.wreckTimer -= dt;
            car.rollAngle += car.rollRate * dt;
            car.x += (car.targetX - car.x) * Math.min(1, dt * 1.8);
            car.speed = Math.max(0, car.speed - 38 * dt);
            car.z += car.speed * MPH_TO_MPS * dt;
            if (car.wreckTimer <= 0 || car.z < pos - 110) trafficCars.splice(index, 1);
            continue;
        }

        if (car.kind === 'racer') {
            if (car.finished) {
                car.z = level.length + 24 + car.racerId * 7;
                car.speed = 0;
                continue;
            }
            car.laneTimer -= dt;
            const trackAhead = getTrackMetrics(car.z + 130, selectedLevel);
            if (car.laneTimer <= 0) {
                car.laneTimer = 1.1 + Math.random() * 2.4;
                const preferredInside = trackAhead.curvature > 0 ? 0.42 : trackAhead.curvature < 0 ? -0.42 : (Math.random() - 0.5) * 1.1;
                car.targetX = clamp(preferredInside + (Math.random() - 0.5) * 0.34, -0.72, 0.72);
            }
            const gap = car.z - pos;
            let target = car.aiBase;
            if (gap < -230) target += 28;
            if (gap > 310) target -= 26;
            if (Math.abs(trackAhead.curvature) > 0.55) target = Math.min(target, trackAhead.recommendedSpeed * (0.90 + Math.random() * 0.07));
            car.targetSpeed = clamp(target, 96, level.topSpeed * 0.90);
            car.speed += clamp(car.targetSpeed - car.speed, -25 * dt, 27 * dt);
            car.x += (car.targetX - car.x) * Math.min(1, dt * (1.5 + car.speed / 150));
            car.z += car.speed * MPH_TO_MPS * dt;
            if (car.z >= level.length && pos < level.length - 3 && gameState === 'RACING') {
                car.finished = true;
                car.z = level.length + 24 + car.racerId * 7;
                car.speed = 0;
                const finishedRivals = trafficCars.filter(other => other.kind === 'racer' && other.finished).length;
                const allowedAhead = Math.max(1, rules.requiredPosition || 1);
                if (finishedRivals >= allowedAhead) {
                    raceLeaderFinished = true;
                    showResult(false, allowedAhead > 1 ? 'MISSED THE PODIUM' : 'OUTRACED — RIVAL WON');
                    return;
                }
                continue;
            }
        } else if (car.parked) {
            // Parked radar trap remains stationary beside the road.
        } else {
            car.yieldCooldown = Math.max(0, car.yieldCooldown - dt);
            if (car.yielding) {
                car.yieldTimer -= dt;
                const steerRate = car.emergencyYield ? 3.9 : 2.4;
                car.x += (car.targetX - car.x) * Math.min(1, dt * steerRate);
                if (car.emergencyYield) {
                    // Emergency vehicles make civilians pull onto the shoulder
                    // and slow down so the player can pass cleanly.
                    car.speed = approach(car.speed, 24, 36 * dt);
                }
                if (car.yieldTimer <= 0) {
                    car.yielding = false;
                    car.emergencyYield = false;
                    car.targetX = clamp(car.x, -0.68, 0.68);
                    car.cruiseSpeed = Math.max(45, car.cruiseSpeed || car.speed);
                }
            } else if (!car.panicking && car.kind === 'car' && car.speed < car.cruiseSpeed) {
                car.speed = approach(car.speed, car.cruiseSpeed, 12 * dt);
            }

            car.z += car.speed * MPH_TO_MPS * dt;
            if (car.kind === 'ship') car.x += Math.sin(car.z * 0.012 + index) * 0.0009;
            if (car.panicking) {
                car.panicTimer -= dt;
                car.panicCrashTimer -= dt;
                car.x += (car.targetX - car.x) * Math.min(1, dt * (3.2 + rules.difficulty));
                car.x += Math.sin(performance.now() * 0.018 + index) * dt * 0.22;
                if (car.panicCrashTimer <= 0) wreckTraffic(car, speed > 210 && Math.random() < 0.45 ? 'explode' : 'roll');
            }
        }

        const dz = car.z - pos;
        car.lastDz = dz;

        if ((car.kind === 'car' || car.kind === 'police') && !car.parked && !car.yielding && !car.panicChecked && dz > 5 && dz < 30) {
            const closingSpeed = speed - car.speed;
            if (closingSpeed > 86 && speed > 125) {
                car.panicChecked = true;
                if (car.kind === 'car' && Math.random() < rules.panicChance * lerp(0.75, 1.65, speedRatio)) {
                    car.panicking = true;
                    car.panicTimer = 1.2 + Math.random() * 1.7;
                    const swerveTowardPlayer = Math.random() < 0.34;
                    const side = swerveTowardPlayer ? Math.sign(playerX - car.x || (Math.random() - 0.5)) : (Math.random() < 0.5 ? -1 : 1);
                    car.targetX = clamp(car.x + side * (0.52 + Math.random() * 0.62), -1.46, 1.46);
                    car.panicCrashTimer = Math.random() < 0.54 ? 0.45 + Math.random() * 1.2 : Infinity;
                    setEventMessage('YOU SCARED A DRIVER — WATCH THE SWERVE!', 1.7);
                }
            }
        }

        if (oldDz >= 0 && dz < 0) {
            if (car.kind === 'police' && !car.triggered) triggerPoliceChase(car, car.parked ? 'SPEED TRAP' : 'PATROL');
            if (!car.parked && car.kind !== 'racer' && car.kind !== 'police' && !car.counted) {
                car.counted = true;
                overtakes += 1;
                score += car.kind === 'ship' ? 500 : 350;
                if (Math.abs(car.x - playerX) < 0.40 && speed - car.speed > 75) {
                    nearMisses += 1;
                    score += 250;
                    setEventMessage('HIGH-SPEED NEAR MISS!', 1.1);
                }
                playTone(1050, 0.04, 'sine', 0.025);
            }
        }

        // Use a swept, compact collision zone. `oldDz` prevents tunnelling
        // through a car at very high speed, while the small front/rear bounds
        // stop collisions from firing before the sprites visibly touch.
        const crossedContactZone = Math.min(oldDz, dz) < CONFIG.collisionFront
            && Math.max(oldDz, dz) > -CONFIG.collisionRear;
        const visibleLateralOverlap = Math.abs(car.x - playerX) < playerTrafficCollisionWidth(car);
        if (collisionCooldown <= 0 && !car.parked && crossedContactZone && visibleLateralOverlap) {
            handlePlayerCollision(car);
            if (gameState === 'CRASHING') return;
        }

        if (car.kind !== 'racer') {
            if (dz < (car.parked ? -170 : -95) || dz > CONFIG.viewDistance + 340) trafficCars.splice(index, 1);
        }
    }

    // Panicked drivers can collide with nearby traffic, creating a moving
    // obstacle the player must read and avoid.
    for (let a = 0; a < trafficCars.length; a += 1) {
        const first = trafficCars[a];
        if (first.wreckState || first.parked) continue;
        for (let b = a + 1; b < trafficCars.length; b += 1) {
            const second = trafficCars[b];
            if (second.wreckState || second.parked) continue;
            if (Math.abs(first.z - second.z) < 5.5 && Math.abs(first.x - second.x) < 0.25 && (first.panicking || second.panicking)) {
                wreckTraffic(first, Math.random() < 0.22 ? 'explode' : 'roll');
                wreckTraffic(second, 'roll');
            }
        }
    }

    const racersAhead = trafficCars.filter(car => car.kind === 'racer' && !car.wreckState && car.z > pos).length;
    racePosition = currentRules().racers > 0 ? racersAhead + 1 : 1;
}


function approach(value, target, amount) {
    if (value < target) return Math.min(target, value + amount);
    return Math.max(target, value - amount);
}

function emitTireEffects(dt, intensity, steerInput, donutMode = false) {
    if (intensity <= 0.02 || currentLevel().vehicle === 'ship') return;
    const orbitX = donutMode ? Math.sin(donutPhase) * 19 : 0;
    const orbitY = donutMode ? Math.cos(donutPhase) * 5 : 0;
    const rate = 8 + intensity * (donutMode ? 48 : 30);
    smokeAccumulator += dt * rate;
    while (smokeAccumulator >= 1) {
        smokeAccumulator -= 1;
        const side = Math.random() < 0.5 ? -1 : 1;
        tireSmoke.push({
            x: WIDTH / 2 + orbitX + side * (25 + Math.random() * 5),
            y: HEIGHT - 43 + orbitY + Math.random() * 5,
            vx: (Math.random() - 0.5) * 18 - steerInput * 9,
            vy: -(12 + Math.random() * 19),
            life: 0.48 + Math.random() * 0.52,
            maxLife: 1,
            size: 2.5 + Math.random() * 4.5
        });
    }

    const markRate = donutMode ? 34 : 18;
    skidAccumulator += dt * markRate * intensity;
    while (skidAccumulator >= 1) {
        skidAccumulator -= 1;
        const side = Math.random() < 0.5 ? -1 : 1;
        skidMarks.push({
            x: WIDTH / 2 + orbitX + side * 30,
            y: HEIGHT - 29 + orbitY,
            vx: -steerInput * (8 + speed * 0.035),
            vy: 48 + speed * 0.32,
            life: 0.62 + intensity * 0.55,
            angle: driftAngle * Math.PI / 180
        });
    }
}

function updateTireEffects(dt) {
    skidToneCooldown = Math.max(0, skidToneCooldown - dt);
    for (let i = tireSmoke.length - 1; i >= 0; i -= 1) {
        const particle = tireSmoke[i];
        particle.life -= dt;
        particle.x += particle.vx * dt;
        particle.y += particle.vy * dt;
        particle.vx *= Math.max(0, 1 - dt * 1.6);
        particle.vy -= 4 * dt;
        particle.size += 7 * dt;
        if (particle.life <= 0) tireSmoke.splice(i, 1);
    }
    for (let i = skidMarks.length - 1; i >= 0; i -= 1) {
        const mark = skidMarks[i];
        mark.life -= dt;
        mark.x += mark.vx * dt;
        mark.y += mark.vy * dt;
        if (mark.life <= 0 || mark.y > HEIGHT + 15) skidMarks.splice(i, 1);
    }
    if (tireSmoke.length > 140) tireSmoke.splice(0, tireSmoke.length - 140);
    if (skidMarks.length > 120) skidMarks.splice(0, skidMarks.length - 120);
}

function drawTireEffects() {
    ctx.save();
    for (const mark of skidMarks) {
        ctx.globalAlpha = clamp(mark.life * 0.68, 0, 0.55);
        ctx.strokeStyle = '#111';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(mark.x - Math.sin(mark.angle) * 4, mark.y);
        ctx.lineTo(mark.x + Math.sin(mark.angle) * 5, mark.y + 12);
        ctx.stroke();
    }
    for (const particle of tireSmoke) {
        const alpha = clamp(particle.life / particle.maxLife, 0, 1) * 0.42;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#d9d9d9';
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, TAU);
        ctx.fill();
    }
    ctx.restore();
}

function updateStarting(dt, gas, left, right) {
    countdownTimer -= dt;
    const newCountdown = Math.ceil(countdownTimer);
    if (newCountdown < countdownValue && newCountdown > 0) {
        countdownValue = newCountdown;
        playTone(410, 0.08, 'square');
    }
    const launchBurnout = keys.Space && currentLevel().vehicle !== 'ship';
    if (gas) engineRPM += (launchBurnout ? 88 : 66) * dt;
    else engineRPM -= 45 * dt;
    engineRPM = clamp(engineRPM, 0, 100);
    burnoutAmount = approach(burnoutAmount, launchBurnout && gas ? 1 : 0, dt * 4.5);
    handbrakeAmount = approach(handbrakeAmount, launchBurnout ? 1 : 0, dt * 7);
    emitTireEffects(dt, burnoutAmount, (right ? 1 : 0) - (left ? 1 : 0), false);

    const targetWheel = left ? -48 : right ? 48 : 0;
    steerRotation += (targetWheel - steerRotation) * Math.min(1, dt * 10);
    steeringWheel.style.transform = `rotate(${steerRotation}deg)`;
    updateEngineSound(engineRPM / 100, gas);

    if (countdownTimer <= 0) {
        const launchQuality = engineRPM / 100;
        speed = 6 + launchQuality * (currentLevel().vehicle === 'ship' ? 14 : 10);
        if (engineRPM >= 82 && engineRPM <= 98) {
            speed += currentLevel().vehicle === 'ship' ? 9 : 5;
            score += 250;
        }
        gameState = 'RACING';
        goFlashTimer = 1.1;
        playTone(820, 0.3, 'square');
    }
}

function updateRacing(dt, gas, brake, steerInput, handbrake) {
    const level = currentLevel();
    const rules = currentRules();
    timeLeft -= dt;
    if (timeLeft <= 0) {
        timeLeft = 0;
        showResult(false);
        return;
    }

    if (pos >= level.length) {
        pos = level.length;
        if (rules.raceRequired && racePosition > (rules.requiredPosition || 1)) {
            showResult(false, `FINISHED ${racePosition}/${raceFieldSize} — OUTRACED`);
            return;
        }
        score += Math.ceil(timeLeft) * 100;
        gameState = 'FINISHING';
        finishCelebration = 2.5;
        finishPending = true;
        stopEngine();
        playTone(1250, 0.15, 'sine');
        window.setTimeout(() => playTone(1650, 0.22, 'sine'), 140);
        return;
    }

    if (crashState.active && !crashState.fatal) {
        gas = false;
        brake = crashState.severity === 'severe';
        steerInput *= crashState.severity === 'severe' ? 0.18 : 0.36;
    }

    updateAutomaticGearbox();
    const gears = currentGears();
    const activeGear = gears[currentGear];
    const basePlayerTopSpeed = effectiveTopSpeed();
    const vehiclePerf = getVehiclePerformance();
    const engineHealth = damageMultiplier('engine', .46);
    const tireHealth = Math.min(damageMultiplier('frontTires', .38), damageMultiplier('rearTires', .42));
    const brakeHealth = damageMultiplier('brakes', .40);
    const nitrousLevel = getVehicleUpgrade(getActiveVehicle(), 'nitrous');
    nitroActive = Boolean(keys.n && nitrousLevel > 0 && nitroCharge > 0 && gas && !handbrake);
    const nitroTopBoost = nitroActive ? .08 + nitrousLevel * .018 : 0;
    const playerTopSpeed = basePlayerTopSpeed * engineHealth * (1 + nitroTopBoost);
    const maxForGear = Math.min(activeGear.maxSpd, playerTopSpeed);
    const gearFloor = currentGear === 1 ? 0 : gears[currentGear - 1].maxSpd * 0.72;
    const gearProgress = clamp((speed - gearFloor) / Math.max(1, maxForGear - gearFloor), 0, 1);
    const atRedline = speed >= maxForGear - 0.35;
    const drag = level.vehicle === 'ship' ? 1.15 + speed * 0.0045 : 1.55 + speed * 0.0085;
    const isShip = level.vehicle === 'ship';
    const handbrakeActive = handbrake && !isShip;
    const burnoutMode = handbrakeActive && gas && speed < 24;
    const donutMode = burnoutMode && Math.abs(steerInput) > 0.18;

    handbrakeAmount = approach(handbrakeAmount, handbrakeActive ? 1 : 0, dt * (handbrakeActive ? 8 : 5));
    burnoutAmount = approach(burnoutAmount, burnoutMode ? 1 : 0, dt * (burnoutMode ? 5 : 3.5));
    donutAmount = approach(donutAmount, donutMode ? 1 : 0, dt * (donutMode ? 5 : 3.2));

    if (gas && !atRedline && !burnoutMode) {
        const endTorque = activeGear.endTorque ?? 0.45;
        const torqueFade = lerp(1, endTorque, Math.pow(gearProgress, 1.28 + currentGear * 0.13));
        speed += activeGear.accel * torqueFade * engineHealth * dt;
        if (nitroActive) speed += (22 + nitrousLevel * 8.5) * dt;
    } else if (gas && atRedline && !burnoutMode) {
        speed -= 0.45 * dt;
    } else if (!burnoutMode) {
        speed -= drag * dt;
    }

    if (burnoutMode) {
        speed = approach(speed, donutMode ? 7 : 4, dt * 6);
        if (donutMode) {
            donutPhase += steerInput * dt * (4.2 + burnoutAmount * 2.0);
            lateralVelocity += steerInput * 0.42 * dt;
        }
    }

    if (brake) speed -= (isShip ? 60 : 54 + speed * 0.055) * vehiclePerf.brakes * brakeHealth * dt;
    if (handbrakeActive && !burnoutMode) {
        const lockupForce = 80 + speed * 0.24;
        speed -= lockupForce * dt;
        lateralVelocity += steerInput * (1.55 + speed / 88) * dt;
        if (speed > 18 && skidToneCooldown <= 0) {
            playTone(135 + Math.random() * 35, 0.055, 'sawtooth', 0.018);
            skidToneCooldown = 0.13;
        }
    }

    if (!autoShift && currentGear > 1) {
        const safeFloor = gears[currentGear - 1].maxSpd * 0.46;
        if (speed < safeFloor && gas && !burnoutMode) speed -= 5.5 * dt;
    }

    const track = getTrackMetrics(pos, selectedLevel);
    const speedRatio = clamp(speed / effectiveTopSpeed(), 0, 1);
    const normalSteerRate = (isShip ? lerp(1.92, 1.16, speedRatio) : lerp(1.72, 0.90, speedRatio)) * vehiclePerf.handling * tireHealth;
    const slideBoost = handbrakeActive ? lerp(1.25, 2.55, speedRatio) : 1;
    const targetLateralVelocity = steerInput * normalSteerRate * slideBoost;
    const highSpeedGripLoss = smoothstep(0.58, 1, speedRatio) * rules.difficulty;
    const steeringGrip = handbrakeActive ? 3.2 : lerp(9.2, 4.4, clamp(highSpeedGripLoss, 0, 1));
    lateralVelocity += (targetLateralVelocity - lateralVelocity) * Math.min(1, dt * steeringGrip);

    const cornerDanger = clamp(Math.abs(track.curvature), 0, 1.2);
    const overspeed = Math.max(0, speed - track.recommendedSpeed) / Math.max(35, track.recommendedSpeed);
    const baseCurveForce = Math.pow(speed / (isShip ? 178 : 126), 2) * (0.39 + rules.difficulty * 0.13);
    const overspeedForce = 1 + overspeed * (1.25 + rules.difficulty * 0.75);
    const rawCurvePull = -track.curvature * baseCurveForce * overspeedForce;
    const assistStrengthAtSpeed = handlingAssist
        ? CONFIG.roadAssistStrength * (1 - smoothstep(0.42, 1, speedRatio) * 0.72) / Math.max(0.9, rules.difficulty)
        : 0;
    const curvePull = rawCurvePull * (1 - assistStrengthAtSpeed);
    playerX += (lateralVelocity + curvePull) * dt;

    if (cornerDanger > 0.48 && overspeed > 0.08) {
        dangerFlash = Math.max(dangerFlash, 0.16);
        if (skidToneCooldown <= 0 && !isShip) {
            playTone(156 + Math.random() * 25, 0.045, 'sawtooth', 0.012 + overspeed * 0.008);
            skidToneCooldown = 0.18;
        }
    }

    if (handlingAssist && !handbrakeActive) {
        const assistFade = 1 - speedRatio * 0.76;
        if (Math.abs(steerInput) < 0.05 && Math.abs(playerX) < 1.02) playerX += -playerX * 0.10 * assistFade * dt;
        if (Math.abs(playerX) > 0.90 && Math.sign(steerInput) !== Math.sign(playerX)) playerX += -Math.sign(playerX) * 0.18 * assistFade * dt;
    }

    if (nitroActive) {
        nitroCharge = Math.max(0, nitroCharge - dt);
        roadFlowOffset += speed * MPH_TO_MPS * dt * (.8 + nitrousLevel * .16);
        if (Math.random() < dt * 16) crashParticles.push({ x: WIDTH / 2 + (Math.random()-.5)*28, y: HEIGHT-42, vx:(Math.random()-.5)*12, vy:28+Math.random()*20, gravity:-10, life:.25, maxLife:.25, size:1.5+Math.random()*2, color:'#68f7ff' });
    }
    const offRoad = Math.abs(playerX) > CONFIG.offRoadStart;
    if (offRoad) {
        if (!isShip && speed > 90) { vehicleDamage.frontTires = clamp(vehicleDamage.frontTires + dt * speed * .007, 0, 100); vehicleDamage.rearTires = clamp(vehicleDamage.rearTires + dt * speed * .009, 0, 100); }
        speed -= (isShip ? 10 : 15 + Math.max(0, speed - 65) * 0.15) * dt;
        lateralVelocity *= Math.max(0, 1 - 2.8 * dt);
        if (handlingAssist && Math.abs(steerInput) < 0.05 && !handbrakeActive) playerX += -Math.sign(playerX) * 0.20 * dt;
    }

    if (Math.abs(playerX) > CONFIG.hardEdge) {
        const edgeSign = Math.sign(playerX) || 1;
        playerX = edgeSign * (CONFIG.hardEdge - 0.10);
        if (collisionCooldown <= 0 && level.vehicle !== 'ship' && speed > 42) {
            const armoredSpeed = speed / Math.max(0.45, getVehiclePerformance().armor);
            const edgeSeverity = armoredSpeed > 245 ? 'catastrophic' : armoredSpeed > 190 ? 'severe' : armoredSpeed > 115 ? 'medium' : 'minor';
            startPlayerCrash(edgeSeverity, null, armoredSpeed * 0.72);
            collisionCooldown = 1.1;
            if (edgeSeverity === 'catastrophic') return;
        }
        lateralVelocity = -edgeSign * Math.max(0.42, Math.abs(lateralVelocity) * 0.34);
        speed *= level.vehicle === 'bumper' ? 0.91 : speed > 42 ? 0.80 : 0.96;
    }

    const driftTarget = handbrakeActive && speed > 10 ? -steerInput * lerp(11, 38, speedRatio) : -steerInput * lerp(1.5, 6.5, speedRatio);
    driftAngle += (driftTarget - driftAngle) * Math.min(1, dt * (handbrakeActive ? 7 : 5));
    if (donutMode) driftAngle = Math.sin(donutPhase) * 34 * Math.sign(steerInput || 1);
    if (crashState.active && !crashState.fatal) driftAngle += Math.sin(crashState.angle) * (crashState.severity === 'severe' ? 26 : 13);

    speed = clamp(speed, 0, playerTopSpeed);
    const arcadeTravelScale = lerp(1, 1.28, Math.pow(speedRatio, 1.75));
    pos += speed * MPH_TO_MPS * dt * arcadeTravelScale;
    roadFlowOffset += speed * MPH_TO_MPS * dt * lerp(0.45, 5.9, Math.pow(speedRatio, 1.22));
    score += speed * dt * (isShip ? 1.05 : 0.82) * (1 + rules.difficulty * 0.08);
    updateTraffic(dt);
    updateSpaceWeapons(dt);
    if (gameState !== 'RACING') return;
    updatePoliceChase(dt);
    if (gameState !== 'RACING') return;

    const tireIntensity = Math.max(
        burnoutAmount,
        handbrakeActive ? smoothstep(12, 95, speed) * (0.55 + Math.abs(steerInput) * 0.45) : 0,
        !isShip ? clamp(overspeed * cornerDanger * 0.85, 0, 0.8) : 0
    );
    emitTireEffects(dt, tireIntensity, steerInput, donutMode);

    if (pos >= nextCheckpoint && nextCheckpoint < level.length - 250) {
        timeLeft += level.checkpointBonus;
        nitroCharge = Math.min(nitroCapacityFor(), nitroCharge + .55 + getVehicleUpgrade(getActiveVehicle(), 'nitrous') * .16);
        nextCheckpoint += level.checkpointEvery;
        checkpointFlash = 1.8;
        score += 1000;
        playTone(1180, 0.09, 'sine');
        window.setTimeout(() => playTone(1550, 0.16, 'sine'), 90);
    }

    const wheelTarget = steerInput * 62;
    steerRotation += (wheelTarget - steerRotation) * Math.min(1, dt * 10);
    steeringWheel.style.transform = `rotate(${steerRotation}deg)`;
    const rpmRatio = burnoutMode ? 0.92 + Math.sin(performance.now() * 0.025) * 0.06 : calculateRPMRatio();
    engineRPM = clamp(rpmRatio * 100, 0, 100);
    updateEngineSound(clamp(rpmRatio, 0, 1), gas || burnoutMode);
}

function update(dt) {
    checkpointFlash = Math.max(0, checkpointFlash - dt);
    shiftFlash = Math.max(0, shiftFlash - dt);
    crashFlash = Math.max(0, crashFlash - dt);
    goFlashTimer = Math.max(0, goFlashTimer - dt);
    if (!paused) {
        updateTireEffects(dt);
        updateCrashEffects(dt);
        updatePlayerSiren(dt);
    }

    garageMessageTimer = Math.max(0, garageMessageTimer - dt);
    settingsMessageTimer = Math.max(0, settingsMessageTimer - dt);
    settingsConfirmTimer = Math.max(0, settingsConfirmTimer - dt);
    if (settingsConfirmTimer <= 0) settingsConfirmId = '';

    if (gameState === 'WIN_RESULTS') {
        resultAdvanceTimer -= dt;
        const seconds = Math.max(1, Math.ceil(resultAdvanceTimer));
        if (mode === 'STORY' && selectedLevel === MAX_LEVEL) resultNextHint.textContent = `TOUR COMPLETE — GARAGE IN ${seconds}`;
        else if (mode === 'STORY') resultNextHint.textContent = `NEXT RACE STARTS IN ${seconds}`;
        else resultNextHint.textContent = `RETURNING TO MENU IN ${seconds}`;
        if (resultAdvanceTimer <= 0) {
            gameoverPanel.classList.add('hidden');
            if (mode === 'STORY' && selectedLevel < MAX_LEVEL) {
                selectedLevel = storyCurrentLevel;
                startRadioSequence();
            } else if (mode === 'STORY' && selectedLevel === MAX_LEVEL) {
                garageVisited = true;
                localStorage.setItem('outspeed_garage_visited_v2', 'true');
                gameState = 'GARAGE';
                garageClassIndex = 0;
                garageVehicleIndex = 0;
                setGarageMessage('TOUR COMPLETE — WELCOME HOME');
            } else {
                gameState = 'MAIN_MENU';
            }
        }
        return;
    }

    if (paused || ['INSERT_COIN', 'MAIN_MENU', 'STORY_MENU', 'GARAGE', 'SETTINGS', 'GAMEOVER'].includes(gameState)) return;
    if (impactFreeze > 0 && ['RACING', 'CRASHING'].includes(gameState)) return;

    if (gameState === 'RADIO_DASH') {
        radioTimer += dt;
        handX += (220 - handX) * Math.min(1, dt * 3.8);
        if (mode === 'STORY' && radioTimer > 2.2) beginSelectedLevel();
        return;
    }

    if (gameState === 'LEVEL_INTRO') {
        specialIntroTimer += dt;
        if (specialIntroTimer >= specialIntroDuration) startRaceSequence();
        return;
    }

    if (gameState === 'FINISHING') {
        finishCelebration -= dt;
        if (finishCelebration <= 0 && finishPending) {
            finishPending = false;
            showResult(true);
        }
        return;
    }

    if (gameState === 'CRASHING') {
        updateCrashSequence(dt);
        return;
    }

    if (gameState === 'BUSTED') {
        updateBustedSequence(dt);
        return;
    }

    const upPressed = keys.ArrowUp || keys.w;
    const downPressed = keys.ArrowDown || keys.s;
    const gas = upPressed;
    const brake = downPressed;
    const left = keys.ArrowLeft || keys.a;
    const right = keys.ArrowRight || keys.d;
    const steerInput = (right ? 1 : 0) - (left ? 1 : 0);
    const handbrake = keys.Space;

    if (gameState === 'STARTING') updateStarting(dt, gas, left, right);
    else if (gameState === 'RACING') updateRacing(dt, gas, brake, steerInput, handbrake);
}

function drawSprite(type, x, y, scale, params = {}) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (type === 'GIRL') {
        const waving = Boolean(params.waving);
        const hologram = Boolean(params.hologram);
        ctx.globalAlpha = hologram ? 0.75 : 1;
        ctx.fillStyle = hologram ? '#65f8ff' : '#ffcc00';
        ctx.fillRect(-10, -80, 20, 25);
        ctx.fillStyle = hologram ? '#b9ffff' : '#ffddaa';
        ctx.fillRect(-8, -75, 16, 15);
        ctx.fillStyle = hologram ? '#176a91' : '#dd0000';
        ctx.fillRect(-9, -60, 18, 30);
        ctx.fillStyle = hologram ? '#b9ffff' : '#ffddaa';
        ctx.fillRect(-8, -30, 6, 20);
        ctx.fillRect(2, -30, 6, 20);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-9, -10, 8, 10);
        ctx.fillRect(1, -10, 8, 10);
        ctx.save();
        ctx.translate(-8, -55);
        ctx.rotate(waving ? Math.sin(performance.now() * 0.02) * 1.1 - 0.8 : -0.5);
        ctx.fillStyle = hologram ? '#b9ffff' : '#ffddaa';
        ctx.fillRect(-4, 0, 8, 25);
        ctx.fillStyle = '#888';
        ctx.fillRect(-2, -60, 4, 80);
        ctx.fillStyle = '#fff';
        ctx.fillRect(2, -60, 40, 25);
        ctx.fillStyle = '#000';
        ctx.fillRect(2, -60, 10, 12);
        ctx.fillRect(22, -60, 10, 12);
        ctx.fillRect(12, -48, 10, 12);
        ctx.fillRect(32, -48, 10, 12);
        ctx.restore();
    } else if (['CAR', 'BUMPER', 'POLICE', 'RACER'].includes(type)) {
        const bumper = type === 'BUMPER';
        const police = type === 'POLICE';
        const racer = type === 'RACER';
        const wrecked = Boolean(params.wreckState);
        const bodyColor = params.wreckState === 'exploded' ? '#292929' : police ? '#f2f2f2' : (params.color || '#999');
        if (wrecked) ctx.rotate((params.rollAngle || 0) + (params.wreckState === 'spin' ? Math.sin(performance.now() * 0.018) * 0.35 : 0));

        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(-20, -10, 8, 10);
        ctx.fillRect(12, -10, 8, 10);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-18, -5, 36, 5);
        ctx.fillStyle = bodyColor;
        ctx.beginPath();
        ctx.moveTo(-18, -12);
        ctx.lineTo(18, -12);
        ctx.lineTo(20, bumper ? -24 : -30);
        ctx.lineTo(-20, bumper ? -24 : -30);
        ctx.fill();

        if (bumper) {
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.beginPath(); ctx.arc(0, -17, 23, 0, TAU); ctx.stroke();
            ctx.fillStyle = '#111'; ctx.fillRect(-8, -36, 16, 10);
        } else {
            ctx.fillStyle = '#111'; ctx.fillRect(-15, -45, 30, 15);
            ctx.fillStyle = 'rgba(180,230,255,0.38)'; ctx.fillRect(-13, -43, 26, 11);
            ctx.fillStyle = bodyColor; ctx.fillRect(-15, -48, 30, 3);
        }

        if (police) {
            ctx.fillStyle = '#151515'; ctx.fillRect(-20, -28, 40, 9);
            ctx.fillStyle = '#fff'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillText('POLICE', 0, -21); ctx.textAlign = 'left';
            const flash = Math.floor(performance.now() / 120) % 2 === 0;
            ctx.fillStyle = flash ? '#ff2020' : '#263cff'; ctx.fillRect(-9, -52, 9, 4);
            ctx.fillStyle = flash ? '#263cff' : '#ff2020'; ctx.fillRect(0, -52, 9, 4);
            if (params.parked) {
                ctx.strokeStyle = '#9fe8ff'; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.arc(22, -38, 8, -1.2, 1.2); ctx.stroke();
                ctx.fillStyle = '#444'; ctx.fillRect(18, -39, 8, 4);
            }
        }

        if (racer) {
            ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -25, 8, 0, TAU); ctx.fill();
            ctx.fillStyle = '#111'; ctx.font = 'bold 9px monospace'; ctx.textAlign = 'center'; ctx.fillText(String(params.racerId || 1), 0, -22); ctx.textAlign = 'left';
            ctx.fillStyle = '#00ffcc'; ctx.fillRect(-17, -15, 34, 3);
        }

        ctx.fillStyle = params.panicking ? '#fff07a' : '#ff3333';
        ctx.fillRect(-15, -18, 6, 4);
        ctx.fillRect(9, -18, 6, 4);

        if (params.wreckState === 'exploded') {
            for (let i = 0; i < 5; i += 1) {
                const flicker = Math.sin(performance.now() * 0.025 + i) * 3;
                ctx.fillStyle = i % 2 ? '#ffcf35' : '#ff4b18';
                ctx.beginPath(); ctx.arc(-12 + i * 6, -35 - Math.abs(flicker), 7 + (i % 2) * 3, 0, TAU); ctx.fill();
            }
            ctx.fillStyle = 'rgba(45,45,45,0.65)';
            ctx.beginPath(); ctx.arc(0, -55, 17, 0, TAU); ctx.fill();
        }
    } else if (type === 'SHIP') {
        if (params.wreckState) ctx.rotate((params.rollAngle || 0) + Math.sin(performance.now() * .02) * .12);
        ctx.fillStyle = params.wreckState === 'exploded' ? 'rgba(255,80,20,0.45)' : 'rgba(0,200,255,0.28)';
        ctx.beginPath();
        ctx.moveTo(-8, 10); ctx.lineTo(0, 40 + Math.sin(performance.now() * 0.02) * 5); ctx.lineTo(8, 10); ctx.fill();
        ctx.fillStyle = params.wreckState === 'exploded' ? '#343434' : (params.color || '#b8d4e8');
        ctx.beginPath();
        ctx.moveTo(0, -50); ctx.lineTo(28, 8); ctx.lineTo(10, 3); ctx.lineTo(0, 18); ctx.lineTo(-10, 3); ctx.lineTo(-28, 8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#143b59';
        ctx.beginPath(); ctx.ellipse(0, -13, 8, 17, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#00eaff';
        ctx.fillRect(-16, 5, 7, 4); ctx.fillRect(9, 5, 7, 4);
    } else if (type === 'LASER') {
        const pulse = .72 + Math.sin(performance.now() * .045) * .28;
        ctx.fillStyle = `rgba(80,255,255,${pulse})`;
        ctx.fillRect(-3, -24, 6, 30);
        ctx.fillStyle = '#fff'; ctx.fillRect(-1, -31, 2, 40);
    } else if (type === 'TREE' || type === 'PINE') {
        ctx.fillStyle = '#5b3218';
        ctx.fillRect(-3, -22, 6, 22);
        ctx.fillStyle = params.dark ? '#164d1e' : '#23762d';
        if (type === 'PINE') {
            for (let i = 0; i < 3; i += 1) {
                ctx.beginPath();
                ctx.moveTo(0, -56 + i * 14); ctx.lineTo(-18 + i * 3, -20 + i * 7); ctx.lineTo(18 - i * 3, -20 + i * 7); ctx.closePath(); ctx.fill();
            }
        } else {
            ctx.beginPath(); ctx.arc(0, -34, 15, 0, TAU); ctx.fill();
            ctx.beginPath(); ctx.arc(-8, -25, 11, 0, TAU); ctx.fill();
            ctx.beginPath(); ctx.arc(9, -25, 11, 0, TAU); ctx.fill();
        }
    } else if (type === 'PALM') {
        ctx.strokeStyle = '#7c4a24';
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(5, -38, 0, -70); ctx.stroke();
        ctx.strokeStyle = '#18813a';
        ctx.lineWidth = 5;
        for (let i = 0; i < 7; i += 1) {
            const a = i / 7 * TAU;
            ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(Math.cos(a) * 28, -70 + Math.sin(a) * 15); ctx.stroke();
        }
    } else if (type === 'CACTUS') {
        ctx.fillStyle = '#218b46';
        ctx.fillRect(-5, -48, 10, 48);
        ctx.fillRect(-18, -34, 14, 8); ctx.fillRect(-18, -34, 7, 22);
        ctx.fillRect(4, -25, 16, 8); ctx.fillRect(13, -38, 7, 21);
    } else if (type === 'ROCK') {
        ctx.fillStyle = params.color || '#777';
        ctx.beginPath(); ctx.moveTo(-18, 0); ctx.lineTo(-10, -22); ctx.lineTo(7, -30); ctx.lineTo(22, -7); ctx.lineTo(16, 0); ctx.closePath(); ctx.fill();
    } else if (type === 'BUILDING') {
        const h = params.height || 70;
        ctx.fillStyle = params.color || '#343a48';
        ctx.fillRect(-24, -h, 48, h);
        ctx.fillStyle = params.window || '#ffd95a';
        for (let yy = -h + 10; yy < -8; yy += 14) {
            for (let xx = -16; xx <= 10; xx += 13) ctx.fillRect(xx, yy, 6, 6);
        }
        if (params.neon) {
            ctx.fillStyle = params.neon;
            ctx.fillRect(-22, -h + 3, 44, 3);
        }
    } else if (type === 'TOWER') {
        ctx.fillStyle = params.color || '#7b4539';
        ctx.fillRect(-12, -75, 24, 75);
        ctx.beginPath(); ctx.moveTo(-18, -75); ctx.lineTo(0, -100); ctx.lineTo(18, -75); ctx.fill();
        ctx.fillStyle = params.glow || '#60eaff';
        ctx.fillRect(-4, -65, 8, 42);
    } else if (type === 'TENT') {
        ctx.fillStyle = params.color || '#ff315c';
        ctx.beginPath(); ctx.moveTo(-28, 0); ctx.lineTo(0, -55); ctx.lineTo(28, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.moveTo(-12, 0); ctx.lineTo(0, -55); ctx.lineTo(12, 0); ctx.closePath(); ctx.fill();
    } else if (type === 'SIGN') {
        ctx.fillStyle = '#555'; ctx.fillRect(-3, -48, 6, 48);
        ctx.fillStyle = params.color || '#171717'; ctx.fillRect(-34, -78, 68, 32);
        ctx.strokeStyle = params.glow || '#00ffcc'; ctx.lineWidth = 3; ctx.strokeRect(-34, -78, 68, 32);
        ctx.fillStyle = params.glow || '#00ffcc'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.fillText(params.text || 'OUT DRIVE', 0, -59); ctx.textAlign = 'left';
    } else if (type === 'POST') {
        ctx.fillStyle = '#f5f5f5'; ctx.fillRect(-2, -18, 4, 18);
        ctx.fillStyle = '#e82020'; ctx.fillRect(-3, -18, 6, 6);
    } else if (type === 'GATE') {
        const finish = Boolean(params.finish);
        ctx.fillStyle = finish ? '#f5f5f5' : '#202020';
        ctx.fillRect(-78, -82, 10, 82); ctx.fillRect(68, -82, 10, 82); ctx.fillRect(-78, -82, 156, 12);
        ctx.fillStyle = finish ? '#111' : '#00ffcc';
        ctx.fillRect(-68, -79, 136, 7);
        if (finish) {
            for (let i = 0; i < 12; i += 1) {
                ctx.fillStyle = i % 2 ? '#fff' : '#111';
                ctx.fillRect(-66 + i * 11, -78, 11, 10);
            }
        }
        ctx.fillStyle = finish ? '#fff' : '#00ffcc';
        ctx.font = 'bold 14px Impact, sans-serif'; ctx.textAlign = 'center';
        ctx.fillText(params.text || (finish ? 'FINISH' : 'START'), 0, -91); ctx.textAlign = 'left';
    }
    ctx.restore();
}

function getProjection(z, xOffset, horizonY, currentCenter) {
    const level = currentLevel();
    const distance = z - pos;
    const speedFov = clamp(speed / effectiveTopSpeed(), 0, 1);
    const effectiveViewDistance = CONFIG.viewDistance * lerp(1, 0.50, Math.pow(speedFov, 1.08));
    if (distance < CONFIG.nearDistance || distance > effectiveViewDistance) return null;
    const normalizedDistance = clamp((distance - CONFIG.nearDistance) / (effectiveViewDistance - CONFIG.nearDistance), 0, 1);
    const exponent = lerp(2.18, 1.24, speedFov);
    const t = 1 - Math.pow(normalizedDistance, 1 / exponent);
    const metrics = getTrackMetrics(z, selectedLevel);
    const baseRoad = level.theme === 'space' ? 240 : 252;
    const roadHalf = (12 + Math.pow(t, 1.36) * baseRoad) * level.roadWidth * metrics.widthScale * (1 + speedFov * 0.43);
    const curveOffset = (metrics.center - currentCenter) * WIDTH * 0.48 * (1 - t * 0.35);
    const cameraOffset = -playerX * roadHalf * 0.82;
    const midpoint = WIDTH / 2 + curveOffset + cameraOffset;
    return { x: midpoint + xOffset * roadHalf, y: horizonY + t * (HEIGHT - horizonY), scale: 0.13 + Math.pow(t, 2.1) * 1.58, t, roadHalf, midpoint };
}

function drawStars(count, drift = 0, bright = false) {
    for (let i = 0; i < count; i += 1) {
        const seed = i * 19.17 + selectedLevel * 77;
        const x = fract(hash(seed) + drift * (0.15 + hash(seed + 2) * 0.5)) * WIDTH;
        const y = hash(seed + 4) * HEIGHT * 0.72;
        const size = bright ? 1 + hash(seed + 8) * 2 : 1;
        ctx.fillStyle = hash(seed + 9) > 0.82 ? '#9edfff' : '#fff';
        ctx.fillRect(x, y, size, size);
    }
}

function drawThemeBackground(horizonY, metrics) {
    const level = currentLevel();
    const theme = level.theme;
    if (theme === 'green') {
        const sky = ctx.createLinearGradient(0, 0, 0, horizonY + 20);
        sky.addColorStop(0, '#3b8eea'); sky.addColorStop(1, '#b7e5ff');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#436c43';
        ctx.beginPath(); ctx.moveTo(0, horizonY + 5);
        for (let x = -60; x <= WIDTH + 80; x += 55) ctx.lineTo(x, horizonY - 17 - Math.sin((x - metrics.center * 50) * 0.04) * 17);
        ctx.lineTo(WIDTH, horizonY + 5); ctx.closePath(); ctx.fill();
    } else if (theme === 'desert') {
        const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
        sky.addColorStop(0, '#4ca6d8'); sky.addColorStop(0.72, '#ffba68'); sky.addColorStop(1, '#ffd48a');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#df7f35';
        ctx.beginPath(); ctx.moveTo(0, horizonY + 7);
        for (let x = -40; x <= WIDTH + 60; x += 80) {
            const h = 18 + hash(x + selectedLevel) * 25;
            ctx.lineTo(x, horizonY + 5); ctx.lineTo(x + 25, horizonY - h); ctx.lineTo(x + 60, horizonY - h * 0.65); ctx.lineTo(x + 80, horizonY + 5);
        }
        ctx.lineTo(WIDTH, horizonY + 7); ctx.closePath(); ctx.fill();
    } else if (theme === 'city') {
        const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
        sky.addColorStop(0, '#17234a'); sky.addColorStop(1, '#e67f71');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        for (let i = 0; i < 24; i += 1) {
            const w = 14 + hash(i * 4) * 22;
            const h = 25 + hash(i * 7) * 75;
            const x = i * 19 - 22 - (metrics.center * 25 % 20);
            ctx.fillStyle = i % 2 ? '#22283b' : '#30354b'; ctx.fillRect(x, horizonY - h, w, h + 5);
            ctx.fillStyle = '#ffdf6b';
            for (let yy = horizonY - h + 8; yy < horizonY - 6; yy += 12) if (hash(i * 33 + yy) > 0.35) ctx.fillRect(x + 4, yy, 3, 4);
        }
    } else if (theme === 'mountain') {
        const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
        sky.addColorStop(0, '#4f9ee8'); sky.addColorStop(1, '#d9f1ff');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#6e8295';
        ctx.beginPath(); ctx.moveTo(0, horizonY + 8);
        for (let x = -60; x <= WIDTH + 80; x += 65) {
            const peak = horizonY - 45 - hash(x + 9) * 40;
            ctx.lineTo(x, horizonY + 8); ctx.lineTo(x + 34, peak); ctx.lineTo(x + 65, horizonY + 8);
        }
        ctx.lineTo(WIDTH, horizonY + 8); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#f5fbff';
        for (let x = -26; x < WIDTH; x += 65) {
            const py = horizonY - 53 - hash(x + 9) * 30;
            ctx.beginPath(); ctx.moveTo(x + 18, py + 20); ctx.lineTo(x + 34, py); ctx.lineTo(x + 47, py + 22); ctx.closePath(); ctx.fill();
        }
    } else if (theme === 'moon') {
        ctx.fillStyle = '#02030a'; ctx.fillRect(0, 0, WIDTH, HEIGHT); drawStars(65, 0, false);
        ctx.fillStyle = '#3986d8'; ctx.beginPath(); ctx.arc(65, 58, 25, 0, TAU); ctx.fill();
        ctx.fillStyle = '#3b8b49'; ctx.beginPath(); ctx.arc(58, 53, 8, 0, TAU); ctx.fill();
        ctx.fillStyle = '#6e737c';
        ctx.beginPath(); ctx.moveTo(0, horizonY + 7);
        for (let x = 0; x <= WIDTH; x += 35) ctx.lineTo(x, horizonY - 7 - hash(x + 13) * 16);
        ctx.lineTo(WIDTH, horizonY + 7); ctx.closePath(); ctx.fill();
    } else if (theme === 'space') {
        ctx.fillStyle = '#010106'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        drawStars(95, pos * 0.0007, true);
        const progress = clamp(pos / level.length, 0, 1);
        const planetR = 13 + Math.pow(progress, 2.2) * 74;
        const px = WIDTH * 0.72 - metrics.center * 25;
        const py = 75;
        ctx.fillStyle = '#2774b9'; ctx.beginPath(); ctx.arc(px, py, planetR, 0, TAU); ctx.fill();
        ctx.fillStyle = '#68a748';
        ctx.beginPath(); ctx.ellipse(px - planetR * 0.2, py - planetR * 0.1, planetR * 0.32, planetR * 0.18, 0.5, 0, TAU); ctx.fill();
        ctx.fillStyle = 'rgba(255,255,255,0.35)';
        ctx.beginPath(); ctx.arc(px - planetR * 0.22, py - planetR * 0.22, planetR * 0.13, 0, TAU); ctx.fill();
    } else if (theme === 'calypso') {
        const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
        sky.addColorStop(0, '#17485f'); sky.addColorStop(0.65, '#e28457'); sky.addColorStop(1, '#ffd083');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#c8e6ff'; ctx.beginPath(); ctx.arc(330, 50, 21, 0, TAU); ctx.fill();
        ctx.fillStyle = '#5b566b';
        ctx.beginPath(); ctx.moveTo(0, horizonY + 6);
        for (let x = 0; x <= WIDTH; x += 45) ctx.lineTo(x, horizonY - 12 - hash(x + 91) * 35);
        ctx.lineTo(WIDTH, horizonY + 6); ctx.closePath(); ctx.fill();
    } else if (theme === 'arkadia') {
        const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
        sky.addColorStop(0, '#3f2147'); sky.addColorStop(0.65, '#d65a47'); sky.addColorStop(1, '#ffad5d');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.fillStyle = '#b9302f'; ctx.beginPath(); ctx.arc(330, 52, 20, 0, TAU); ctx.fill();
        ctx.fillStyle = '#673b38';
        ctx.beginPath(); ctx.moveTo(0, horizonY + 6);
        for (let x = -20; x <= WIDTH; x += 52) ctx.lineTo(x, horizonY - 10 - hash(x + 71) * 28);
        ctx.lineTo(WIDTH, horizonY + 6); ctx.closePath(); ctx.fill();
    } else if (theme === 'carnival') {
        const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
        sky.addColorStop(0, '#35105b'); sky.addColorStop(1, '#ee4f9a');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.strokeStyle = '#ffd84a'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(330, horizonY - 24, 34, 0, TAU); ctx.stroke();
        for (let i = 0; i < 8; i += 1) {
            const a = i / 8 * TAU;
            ctx.beginPath(); ctx.moveTo(330, horizonY - 24); ctx.lineTo(330 + Math.cos(a) * 34, horizonY - 24 + Math.sin(a) * 34); ctx.stroke();
        }
        ctx.fillStyle = '#172748'; ctx.fillRect(0, horizonY - 4, WIDTH, 12);
    } else if (theme === 'rocktropia') {
        const sky = ctx.createLinearGradient(0, 0, 0, horizonY);
        sky.addColorStop(0, '#070715'); sky.addColorStop(0.65, '#221044'); sky.addColorStop(1, '#ec1c80');
        ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT); drawStars(30, 0, false);
        for (let i = 0; i < 22; i += 1) {
            const w = 15 + hash(i * 8) * 24;
            const h = 35 + hash(i * 11) * 90;
            const x = i * 20 - 18;
            ctx.fillStyle = i % 2 ? '#101325' : '#17152c'; ctx.fillRect(x, horizonY - h, w, h + 5);
            ctx.fillStyle = i % 3 === 0 ? '#00f7ff' : '#ff2ca8'; ctx.fillRect(x + 2, horizonY - h + 5, w - 4, 2);
        }
    } else if (theme === 'foma') {
        const grad = ctx.createRadialGradient(WIDTH / 2, horizonY, 10, WIDTH / 2, horizonY, WIDTH * 0.75);
        grad.addColorStop(0, '#31445e'); grad.addColorStop(0.55, '#151925'); grad.addColorStop(1, '#050609');
        ctx.fillStyle = grad; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        drawStars(38, 0, false);
        ctx.fillStyle = '#30333b';
        ctx.beginPath(); ctx.moveTo(0, 0);
        for (let x = 0; x <= WIDTH; x += 28) ctx.lineTo(x, 16 + hash(x + 22) * 33);
        ctx.lineTo(WIDTH, 0); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#20232a';
        ctx.beginPath(); ctx.moveTo(0, HEIGHT);
        for (let x = 0; x <= WIDTH; x += 30) ctx.lineTo(x, HEIGHT - 30 - hash(x + 44) * 42);
        ctx.lineTo(WIDTH, HEIGHT); ctx.closePath(); ctx.fill();
    }
}

function getGroundColors(theme, stripe) {
    const sets = {
        green: ['#1c8c2d', '#219c32', '#55585d', '#62656a', '#e32222', '#ffffff'],
        desert: ['#d99045', '#e2a253', '#56585c', '#62656a', '#ffffff', '#e62222'],
        city: ['#2d313b', '#343945', '#494e59', '#555b66', '#ffd54a', '#202020'],
        mountain: ['#41663c', '#4b7646', '#4b5059', '#5a6069', '#ffffff', '#e32222'],
        moon: ['#686b72', '#767a82', '#444850', '#50545d', '#d8d8d8', '#333'],
        calypso: ['#5f6b3a', '#718044', '#5a4c47', '#675853', '#54d7ff', '#f7f3d2'],
        arkadia: ['#8c4338', '#9e5042', '#4f4544', '#5d504d', '#f3d07a', '#2b2728'],
        carnival: ['#29265b', '#34306d', '#704c7f', '#82558d', '#ffe548', '#ff3a9d'],
        rocktropia: ['#19142d', '#211938', '#353044', '#41394e', '#00f7ff', '#ff2ca8'],
        foma: ['#24272e', '#2c3038', '#3c414a', '#484f59', '#ffb52e', '#d8d8d8']
    };
    return sets[theme] || sets.green;
}

function collectSceneryObjects() {
    const level = currentLevel();
    const objects = [];
    const spacing = level.theme === 'city' || level.theme === 'rocktropia' ? 62 : level.theme === 'carnival' ? 56 : 76;
    const first = Math.floor(pos / spacing) * spacing + spacing;
    // Frequent edge reflectors provide a reliable speed reference. The old
    // 80-105m scenery spacing made every speed look like a slow Sunday drive.
    const postSpacing = level.theme === 'space' ? 42 : 22;
    const firstPost = Math.floor(pos / postSpacing) * postSpacing + postSpacing;
    for (let z = firstPost; z < pos + CONFIG.viewDistance; z += postSpacing) {
        const seq = Math.floor(z / postSpacing);
        objects.push({ type: 'POST', z, x: -1.17, params: { glow: level.theme === 'rocktropia' ? '#ff2ca8' : level.theme === 'moon' ? '#6deaff' : '#fff4a5' } });
        objects.push({ type: 'POST', z: z + postSpacing * 0.5, x: 1.17, params: { glow: level.theme === 'rocktropia' ? '#00f7ff' : level.theme === 'moon' ? '#6deaff' : '#fff4a5' } });
    }

    for (let z = first; z < pos + CONFIG.viewDistance; z += spacing) {
        const seq = Math.floor(z / spacing);
        const r = hash(seq * 3.13 + selectedLevel * 5);
        const leftX = -(1.34 + hash(seq + 1) * 0.25);
        const rightX = 1.34 + hash(seq + 2) * 0.25;
        let leftType = 'POST';
        let rightType = 'POST';
        let leftParams = {};
        let rightParams = {};

        if (level.theme === 'green') {
            leftType = r > 0.25 ? 'TREE' : 'POST'; rightType = r > 0.55 ? 'TREE' : 'POST';
        } else if (level.theme === 'desert') {
            leftType = r > 0.38 ? 'PALM' : 'CACTUS'; rightType = r > 0.62 ? 'PALM' : 'CACTUS';
        } else if (level.theme === 'city') {
            leftType = 'BUILDING'; rightType = 'BUILDING';
            leftParams = { height: 55 + r * 60, color: seq % 2 ? '#303746' : '#252b37', window: '#ffd45e' };
            rightParams = { height: 50 + hash(seq + 3) * 70, color: seq % 2 ? '#272d3a' : '#353b48', window: '#7fd7ff' };
        } else if (level.theme === 'mountain') {
            leftType = r > 0.23 ? 'PINE' : 'ROCK'; rightType = r > 0.45 ? 'PINE' : 'ROCK'; leftParams = { color: '#5d6269' }; rightParams = { color: '#676d74' };
        } else if (level.theme === 'moon') {
            leftType = r > 0.45 ? 'ROCK' : 'SIGN'; rightType = r > 0.65 ? 'ROCK' : 'POST';
            leftParams = leftType === 'SIGN' ? { text: seq % 2 ? 'MOON BASE' : 'LOW GRAV', color: '#17202b', glow: '#6deaff' } : { color: '#858992' };
            rightParams = { color: '#757982' };
        } else if (level.theme === 'calypso') {
            leftType = r > 0.46 ? 'TOWER' : 'ROCK'; rightType = r > 0.65 ? 'TREE' : 'TOWER';
            leftParams = { color: '#675048', glow: '#58e9ff' }; rightParams = { color: '#514b66', glow: '#ffbd4a', dark: true };
        } else if (level.theme === 'arkadia') {
            leftType = r > 0.5 ? 'TOWER' : 'ROCK'; rightType = r > 0.35 ? 'ROCK' : 'SIGN';
            leftParams = { color: '#693b31', glow: '#ff923d' };
            rightParams = rightType === 'SIGN' ? { text: 'ARKADIA', color: '#291c1d', glow: '#ff9c45' } : { color: '#823f35' };
        } else if (level.theme === 'carnival') {
            leftType = r > 0.42 ? 'TENT' : 'SIGN'; rightType = r > 0.58 ? 'TENT' : 'SIGN';
            leftParams = leftType === 'SIGN' ? { text: 'WIN BIG!', color: '#3b155f', glow: '#ffe548' } : { color: seq % 2 ? '#ff315c' : '#25c9e8' };
            rightParams = rightType === 'SIGN' ? { text: 'BUMPER!', color: '#4e174d', glow: '#ff4bd5' } : { color: seq % 2 ? '#28d890' : '#ff9f1c' };
        } else if (level.theme === 'rocktropia') {
            leftType = r > 0.30 ? 'BUILDING' : 'SIGN'; rightType = r > 0.45 ? 'BUILDING' : 'PALM';
            leftParams = leftType === 'SIGN' ? { text: seq % 2 ? 'ROCK!' : 'DREAMS', color: '#0b0715', glow: '#ff2ca8' } : { height: 65 + r * 70, color: '#151224', window: '#00f7ff', neon: '#ff2ca8' };
            rightParams = rightType === 'BUILDING' ? { height: 55 + hash(seq + 4) * 85, color: '#111321', window: '#ff4bc2', neon: '#00f7ff' } : {};
        } else if (level.theme === 'foma') {
            leftType = r > 0.35 ? 'ROCK' : 'SIGN'; rightType = r > 0.55 ? 'ROCK' : 'TOWER';
            leftParams = leftType === 'SIGN' ? { text: 'FOMA', color: '#11151b', glow: '#ffb52e' } : { color: '#4b4e55' };
            rightParams = rightType === 'TOWER' ? { color: '#3a3d43', glow: '#ffb52e' } : { color: '#55585f' };
        }
        objects.push({ type: leftType, z, x: leftX, params: leftParams });
        objects.push({ type: rightType, z: z + spacing * 0.32, x: rightX, params: rightParams });
    }
    return objects;
}

function drawSpaceCourse(horizonY, currentMetrics) {
    const level = currentLevel();
    const speedRatio = clamp(speed / effectiveTopSpeed(), 0, 1);
    const ringSpacing = lerp(138, 78, speedRatio);
    const flowPos = pos + roadFlowOffset * 0.72;
    const first = Math.floor(flowPos / ringSpacing) * ringSpacing + ringSpacing;
    for (let virtualZ = flowPos + CONFIG.viewDistance; virtualZ >= first; virtualZ -= ringSpacing) {
        const distance = virtualZ - flowPos;
        const z = pos + distance;
        const projection = getProjection(z, 0, horizonY, currentMetrics.center);
        if (!projection) continue;
        const alpha = clamp(projection.t * 0.55, 0.08, 0.55);
        ctx.strokeStyle = `rgba(70,210,255,${alpha})`;
        ctx.lineWidth = Math.max(1, projection.scale * 2);
        ctx.beginPath();
        ctx.ellipse(projection.midpoint, projection.y, projection.roadHalf * 0.92, projection.roadHalf * 0.34, 0, 0, TAU);
        ctx.stroke();
    }
    if (speedRatio > 0.38) {
        ctx.strokeStyle = `rgba(255,255,255,${0.12 + speedRatio * 0.22})`;
        ctx.lineWidth = 1;
        for (let i = 0; i < 24; i += 1) {
            const a = hash(i * 8.2 + pos * 0.002) * TAU;
            const r = 40 + hash(i * 3.7) * 170;
            const x = WIDTH / 2 + Math.cos(a) * r;
            const y = HEIGHT / 2 + Math.sin(a) * r * 0.55;
            ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * (8 + speedRatio * 24), y + Math.sin(a) * (5 + speedRatio * 15)); ctx.stroke();
        }
    }
}

function drawRoadAndScenery() {
    const level = currentLevel();
    const currentMetrics = getTrackMetrics(pos, selectedLevel);
    const speedRatio = clamp(speed / Math.max(1, effectiveTopSpeed()), 0, 1);
    const cameraPulse = gameState === 'RACING' ? Math.sin(performance.now() * 0.018) * speedRatio * 1.4 : 0;
    const horizonY = HEIGHT * (0.432 - speedRatio * 0.102) + currentMetrics.hill * 0.18 + cameraPulse;
    drawThemeBackground(horizonY, currentMetrics);

    if (level.theme === 'space') {
        drawSpaceCourse(horizonY, currentMetrics);
    } else {
        const colors = getGroundColors(level.theme);
        // At speed the two pavement shades merge into one stable asphalt tone.
        // The target stays deliberately dark/neutral so the road never washes out white.
        const roadBlend = smoothstep(.30, .76, speedRatio);
        const groundBlend = smoothstep(.26, .72, speedRatio);
        const averageRoad = mixColor(colors[2], colors[3], .5);
        const speedRoadTarget = mixColor(averageRoad, '#4d5157', .58);
        const averageGrass = mixColor(colors[0], colors[1], .5);
        const roadLines = [];
        groundCtx.clearRect(0, 0, WIDTH, HEIGHT);

        for (let y = Math.floor(horizonY); y < HEIGHT; y += 1) {
            const t = clamp((y - horizonY) / (HEIGHT - horizonY), 0, 1);
            const exponent = lerp(2.18, 1.24, speedRatio);
            const effectiveViewDistance = CONFIG.viewDistance * lerp(1, 0.50, Math.pow(speedRatio, 1.08));
            const distance = CONFIG.nearDistance + (effectiveViewDistance - CONFIG.nearDistance) * Math.pow(1 - t, exponent);
            const worldZ = pos + distance;
            const surfaceZ = worldZ + roadFlowOffset;
            const metrics = getTrackMetrics(worldZ, selectedLevel);
            const roadHalf = (12 + Math.pow(t, 1.36) * 252) * level.roadWidth * metrics.widthScale * (1 + speedRatio * 0.43);
            const curveOffset = (metrics.center - currentMetrics.center) * WIDTH * 0.48 * (1 - t * 0.35);
            const cameraOffset = -playerX * roadHalf * 0.82;
            const midpoint = WIDTH / 2 + curveOffset + cameraOffset;

            // Only the out-of-bounds terrain is drawn to the blurred ground layer.
            const grassDark = Math.floor(surfaceZ / lerp(26, 15, speedRatio)) % 2 === 0;
            const grassBase = grassDark ? colors[0] : colors[1];
            groundCtx.fillStyle = mixColor(grassBase, averageGrass, groundBlend);
            groundCtx.fillRect(0, y, WIDTH, 1);

            // Keep the red/white (or theme-specific) edge blocks crisp and visible.
            // Their world-space blocks become slightly longer at speed to avoid flicker.
            const rumbleWidth = Math.max(2, roadHalf * 0.10);
            const rumbleDark = Math.floor(surfaceZ / lerp(15, 24, speedRatio)) % 2 === 0;
            const rumbleColor = rumbleDark ? colors[4] : colors[5];

            const baseRoad = metrics.isDark ? colors[2] : colors[3];
            let roadColor = mixColor(baseRoad, speedRoadTarget, roadBlend);
            const checker = worldZ < 28 || (worldZ > level.length - 20 && worldZ < level.length + 8);
            if (checker) roadColor = Math.floor(worldZ / 3.5) % 2 === 0 ? '#f4f4f4' : '#171717';
            roadLines.push({ y, midpoint, roadHalf, rumbleWidth, rumbleColor, roadColor, surfaceZ, checker });
        }

        // Blur only the terrain outside the road. The pavement and rumble strips
        // are rendered afterwards at full opacity so they cannot bleed together.
        ctx.save();
        const blurPx = speedRatio < .28 ? 0 : lerp(.35, 2.35, smoothstep(.28, 1, speedRatio));
        if (blurPx > 0) ctx.filter = `blur(${blurPx}px)`;
        ctx.drawImage(groundCanvas, 0, 0);
        ctx.restore();

        for (const line of roadLines) {
            // Separate left/right rumble strips instead of one large under-road band.
            ctx.fillStyle = line.rumbleColor;
            ctx.fillRect(line.midpoint - line.roadHalf - line.rumbleWidth, line.y, line.rumbleWidth, 1);
            ctx.fillRect(line.midpoint + line.roadHalf, line.y, line.rumbleWidth, 1);

            // Opaque pavement always sits above the blurred terrain.
            ctx.fillStyle = line.roadColor;
            ctx.fillRect(line.midpoint - line.roadHalf, line.y, line.roadHalf * 2, 1);

            // Dash frequency stops accelerating after mid-speed, preventing eye-strain.
            const stripeSpacing = lerp(18, 13.5, smoothstep(0, .58, speedRatio));
            const laneStripe = Math.floor(line.surfaceZ / stripeSpacing) % 2 === 0;
            if (laneStripe && line.roadHalf > 18 && !line.checker) {
                const stripeWidth = Math.max(1, line.roadHalf * 0.021);
                ctx.fillStyle = level.theme === 'carnival' ? '#ffe548' : level.theme === 'rocktropia' ? '#00f7ff' : '#f4f4e8';
                ctx.fillRect(line.midpoint - stripeWidth / 2, line.y, stripeWidth, 1);
                if (level.theme === 'city' || level.theme === 'rocktropia') {
                    const lane2 = line.roadHalf * 0.48;
                    ctx.fillStyle = level.theme === 'rocktropia' ? '#ff2ca8' : '#d9d9d9';
                    ctx.fillRect(line.midpoint - lane2, line.y, Math.max(1, line.roadHalf * 0.012), 1);
                    ctx.fillRect(line.midpoint + lane2, line.y, Math.max(1, line.roadHalf * 0.012), 1);
                }
            }
        }
    }

    const objects = level.theme === 'space' ? [] : collectSceneryObjects();
    objects.push({ type: 'GATE', z: 32, x: 0, params: { text: level.theme === 'space' ? 'LAUNCH' : 'START' } });
    objects.push({ type: 'GIRL', z: 46, x: -0.72, params: { waving: gameState === 'RACING' && pos < 650, hologram: level.theme === 'space' || level.theme === 'moon' } });
    objects.push({ type: 'GATE', z: level.length, x: 0, params: { finish: true, text: level.finishLabel || (level.theme === 'space' ? 'DESTINATION' : 'FINISH') } });
    spaceProjectiles.forEach(shot => { if (shot.z > pos && shot.z < pos + CONFIG.viewDistance) objects.push({ type: 'LASER', z: shot.z, x: shot.x, params: shot }); });

    trafficCars.forEach(car => {
        if (car.z > pos + CONFIG.nearDistance && car.z < pos + CONFIG.viewDistance) {
            const type = car.kind === 'ship' ? 'SHIP' : car.kind === 'bumper' ? 'BUMPER' : car.kind === 'police' ? 'POLICE' : car.kind === 'racer' ? 'RACER' : 'CAR';
            objects.push({ type, z: car.z, x: car.x, params: car });
        }
    });

    objects.sort((a, b) => b.z - a.z);
    objects.forEach(object => {
        const projection = getProjection(object.z, object.x, horizonY, currentMetrics.center);
        if (!projection) return;
        let scale = projection.scale * 0.78;
        if (['CAR', 'BUMPER', 'POLICE', 'RACER'].includes(object.type)) scale = projection.scale * 0.62;
        else if (object.type === 'LASER') scale = projection.scale * 0.32;
        else if (object.type === 'SHIP') scale = projection.scale * 0.54;
        else if (object.type === 'GIRL') scale = projection.scale * 0.36;
        else if (object.type === 'GATE') scale = projection.scale * (object.params && object.params.finish ? 0.90 : 0.50);
        else if (object.type === 'BUILDING') scale = projection.scale * 0.92;
        if (speedRatio > 0.62 && projection.t > 0.42 && !['GATE', 'GIRL', 'LASER'].includes(object.type)) {
            const dx = projection.x - WIDTH / 2;
            const dy = projection.y - horizonY;
            const mag = Math.max(1, Math.hypot(dx, dy));
            const streak = (speedRatio - 0.56) * 23 * projection.t;
            ctx.strokeStyle = `rgba(255,255,255,${0.035 + speedRatio * 0.09})`;
            ctx.lineWidth = Math.max(1, scale * 1.4);
            ctx.beginPath(); ctx.moveTo(projection.x, projection.y); ctx.lineTo(projection.x + dx / mag * streak, projection.y + dy / mag * streak); ctx.stroke();
        }
        drawSprite(object.type, projection.x, projection.y, scale, object.params || {});
    });

    drawSpeedEffects(speedRatio, level.theme);
    return { horizonY, currentMetrics };
}

function drawSpeedEffects(speedRatio, theme) {
    if (speedRatio < 0.16) return;
    const vanishX = WIDTH / 2 - playerX * 22;
    const vanishY = HEIGHT * (0.39 - speedRatio * 0.03);
    const count = Math.floor(12 + speedRatio * 52);
    const phase = roadFlowOffset * 0.013;

    ctx.save();
    ctx.lineCap = 'round';
    for (let i = 0; i < count; i += 1) {
        const seed = i * 17.31 + Math.floor(phase * 7);
        const angle = hash(seed + 2) * TAU;
        const radius = 45 + hash(seed + 5) * 235;
        const radial = fract(hash(seed + 8) + phase * (0.22 + speedRatio * 0.88));
        const x = vanishX + Math.cos(angle) * radius * radial;
        const y = vanishY + Math.sin(angle) * radius * radial * 0.56;
        const dx = x - vanishX;
        const dy = y - vanishY;
        const length = (5 + speedRatio * 48) * (0.35 + radial);
        const mag = Math.max(1, Math.hypot(dx, dy));
        ctx.strokeStyle = `rgba(255,255,255,${0.035 + speedRatio * 0.22 * radial})`;
        ctx.lineWidth = speedRatio > 0.78 ? 1.35 : 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx / mag * length, y + dy / mag * length);
        ctx.stroke();
    }

    if (speedRatio > 0.58) {
        const sideAlpha = (speedRatio - 0.58) * 0.52;
        const blur = ctx.createLinearGradient(0, 0, WIDTH, 0);
        blur.addColorStop(0, `rgba(255,255,255,${sideAlpha})`);
        blur.addColorStop(0.16, 'rgba(255,255,255,0)');
        blur.addColorStop(0.84, 'rgba(255,255,255,0)');
        blur.addColorStop(1, `rgba(255,255,255,${sideAlpha})`);
        ctx.fillStyle = blur;
        ctx.fillRect(0, 45, WIDTH, HEIGHT - 45);
    }
    if (theme !== 'space' && speedRatio > 0.86) {
        ctx.fillStyle = `rgba(255,255,255,${(speedRatio - 0.86) * 0.15})`;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
    }
    ctx.restore();
}

function drawVehicleModel(vehicle, x, y, scale, options = {}) {
    const paint = options.paint || getVehiclePaint(vehicle);
    const body = paint.body;
    const accent = paint.accent;
    const braking = Boolean(options.braking);
    const thrust = Boolean(options.thrust);
    const preview = Boolean(options.preview);
    const plate = sanitizePlate(options.plate || getVehiclePlate(vehicle)) || 'JAE';
    const drawPlate = (centerX, topY, width = 16, height = 6) => {
        ctx.fillStyle = '#ece7d5';
        ctx.fillRect(centerX - width / 2, topY, width, height);
        ctx.strokeStyle = '#202020';
        ctx.lineWidth = 0.7;
        ctx.strokeRect(centerX - width / 2, topY, width, height);
        ctx.fillStyle = '#111';
        const fontSize = plate.length >= 7 ? 3.1 : plate.length >= 5 ? 3.7 : 4.4;
        ctx.font = `bold ${fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(plate, centerX, topY + height * 0.55);
        ctx.textAlign = 'left';
        ctx.textBaseline = 'alphabetic';
    };
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);

    if (vehicle.kind === 'ship') {
        if (thrust || preview) {
            ctx.fillStyle = 'rgba(0,255,255,0.48)';
            ctx.beginPath(); ctx.moveTo(-11, 24); ctx.lineTo(-3, 48 + (preview ? 0 : Math.random() * 8)); ctx.lineTo(2, 24); ctx.fill();
            ctx.beginPath(); ctx.moveTo(11, 24); ctx.lineTo(3, 48 + (preview ? 0 : Math.random() * 8)); ctx.lineTo(-2, 24); ctx.fill();
        }
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(0, 27, 31, 8, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = body;
        if (vehicle.design === 3) {
            ctx.beginPath(); ctx.moveTo(0, -38); ctx.lineTo(18, -9); ctx.lineTo(39, 12); ctx.lineTo(17, 20); ctx.lineTo(0, 12); ctx.lineTo(-17, 20); ctx.lineTo(-39, 12); ctx.lineTo(-18, -9); ctx.closePath(); ctx.fill();
        } else if (vehicle.design === 2) {
            ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(13, -8); ctx.lineTo(42, -1); ctx.lineTo(35, 15); ctx.lineTo(13, 10); ctx.lineTo(0, 24); ctx.lineTo(-13, 10); ctx.lineTo(-35, 15); ctx.lineTo(-42, -1); ctx.lineTo(-13, -8); ctx.closePath(); ctx.fill();
        } else if (vehicle.design === 1) {
            ctx.beginPath(); ctx.moveTo(0, -34); ctx.lineTo(16, -8); ctx.lineTo(34, 12); ctx.lineTo(15, 18); ctx.lineTo(0, 10); ctx.lineTo(-15, 18); ctx.lineTo(-34, 12); ctx.lineTo(-16, -8); ctx.closePath(); ctx.fill();
        } else {
            ctx.beginPath(); ctx.moveTo(0, -33); ctx.lineTo(16, -6); ctx.lineTo(31, 15); ctx.lineTo(12, 20); ctx.lineTo(0, 11); ctx.lineTo(-12, 20); ctx.lineTo(-31, 15); ctx.lineTo(-16, -6); ctx.closePath(); ctx.fill();
        }
        ctx.fillStyle = accent; ctx.fillRect(-5, -24, 10, 39);
        ctx.fillStyle = '#11283c'; ctx.beginPath(); ctx.ellipse(0, -9, 9, 15, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#84f6ff'; ctx.fillRect(-17, 14, 8, 4); ctx.fillRect(9, 14, 8, 4);
        ctx.restore(); return;
    }

    if (vehicle.kind === 'bumper') {
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(0, 22, 43, 12, 0, 0, TAU); ctx.fill();
        ctx.strokeStyle = accent; ctx.lineWidth = vehicle.design === 2 ? 8 : 6; ctx.beginPath(); ctx.ellipse(0, 8, 42, 18, 0, 0, TAU); ctx.stroke();
        ctx.fillStyle = body; ctx.beginPath(); ctx.ellipse(0, 5, 34, 15, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#111'; ctx.fillRect(-12, -12, 24, 15);
        ctx.fillStyle = braking ? '#ff7777' : '#651313'; ctx.fillRect(-27, 3, 8, 5); ctx.fillRect(19, 3, 8, 5);
        if (vehicle.design >= 1) { ctx.fillStyle = accent; ctx.fillRect(-4, -21, 8, 10); }
        if (vehicle.design === 2) { ctx.fillStyle = '#fff'; ctx.font = 'bold 8px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('L', 0, 2); ctx.textAlign = 'left'; }
        ctx.restore(); return;
    }

    if (vehicle.kind === 'bike') {
        ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.beginPath(); ctx.ellipse(0, 25, 17, 6, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#080808'; ctx.fillRect(-8, 9, 6, 23); ctx.fillRect(2, 9, 6, 23);
        ctx.fillStyle = body; ctx.beginPath(); ctx.moveTo(-9, 12); ctx.lineTo(-6, -8); ctx.lineTo(0, -18); ctx.lineTo(6, -8); ctx.lineTo(9, 12); ctx.closePath(); ctx.fill();
        ctx.fillStyle = accent; ctx.fillRect(-3, -17, 6, 28);
        ctx.fillStyle = '#222'; ctx.beginPath(); ctx.arc(0, -28, 8, 0, TAU); ctx.fill();
        ctx.fillStyle = braking ? '#ff7777' : '#5b1111'; ctx.fillRect(-5, 10, 10, 4);
        drawPlate(0, 15, 11, 5);
        ctx.restore(); return;
    }

    if (vehicle.design === 'civilian') {
        // This is the exact Level 1 traffic-car silhouette, shifted downward
        // only so every player vehicle shares the same road-contact anchor.
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(-20, 15, 8, 10);
        ctx.fillRect(12, 15, 8, 10);
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(-18, 20, 36, 5);
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.moveTo(-18, 13); ctx.lineTo(18, 13);
        ctx.lineTo(20, -5); ctx.lineTo(-20, -5);
        ctx.fill();
        ctx.fillStyle = '#111';
        ctx.fillRect(-15, -20, 30, 15);
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        ctx.fillRect(-13, -18, 26, 11);
        ctx.fillStyle = body;
        ctx.fillRect(-15, -23, 30, 3);
        ctx.fillStyle = accent;
        ctx.fillRect(-18, 5, 36, 2);
        ctx.fillStyle = braking ? '#ff7777' : '#ff3333';
        ctx.fillRect(-15, 7, 6, 4);
        ctx.fillRect(9, 7, 6, 4);
        drawPlate(0, 8, 14, 6);
        ctx.restore(); return;
    }

    if (vehicle.design === 'classic') {
        // Faithful recreation of the original OUT DRIVE player car.
        ctx.fillStyle = 'rgba(0,0,0,0.48)'; ctx.fillRect(-27, 18, 54, 7);
        ctx.fillStyle = '#090909'; ctx.fillRect(-29, 5, 10, 20); ctx.fillRect(19, 5, 10, 20);
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.moveTo(-27, 13); ctx.lineTo(27, 13); ctx.lineTo(30, -1); ctx.lineTo(-30, -1); ctx.closePath(); ctx.fill();
        ctx.fillStyle = body; ctx.fillRect(-25, -5, 50, 7);
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.moveTo(-22, -6); ctx.lineTo(22, -6); ctx.lineTo(18, -22); ctx.lineTo(-18, -22); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(0,200,255,0.42)';
        ctx.beginPath(); ctx.moveTo(-18, -8); ctx.lineTo(18, -8); ctx.lineTo(15, -19); ctx.lineTo(-15, -19); ctx.closePath(); ctx.fill();
        // Closed-roof Classic: no exposed driver/head block.
        ctx.fillStyle = braking ? '#ff7777' : '#650909'; ctx.fillRect(-23, 4, 9, 5); ctx.fillRect(14, 4, 9, 5);
        drawPlate(0, 8, 16, 6);
        ctx.restore(); return;
    }

    if (vehicle.design === 'police') {
        const emergencyLights = playerSirenActive && ['STARTING', 'RACING', 'FINISHING'].includes(gameState);
        const flash = Math.floor(performance.now() / 120) % 2 === 0;
        ctx.fillStyle = 'rgba(0,0,0,0.48)'; ctx.fillRect(-29, 18, 58, 7);
        ctx.fillStyle = '#090909'; ctx.fillRect(-30, 4, 10, 21); ctx.fillRect(20, 4, 10, 21);
        ctx.fillStyle = body;
        ctx.beginPath(); ctx.moveTo(-28, 14); ctx.lineTo(28, 14); ctx.lineTo(25, -17); ctx.lineTo(-25, -17); ctx.closePath(); ctx.fill();
        ctx.fillStyle = '#161616'; ctx.fillRect(-27, -5, 54, 9);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 7px monospace'; ctx.textAlign = 'center'; ctx.fillText('POLICE', 0, 2); ctx.textAlign = 'left';
        ctx.fillStyle = '#111'; ctx.fillRect(-18, -34, 36, 17);
        ctx.fillStyle = 'rgba(160,220,255,0.42)'; ctx.fillRect(-15, -31, 30, 11);
        ctx.fillStyle = emergencyLights ? (flash ? '#ff2020' : '#244cff') : '#4c1111'; ctx.fillRect(-11, -39, 11, 5);
        ctx.fillStyle = emergencyLights ? (flash ? '#244cff' : '#ff2020') : '#111b4c'; ctx.fillRect(0, -39, 11, 5);
        ctx.fillStyle = accent; ctx.fillRect(-28, 7, 56, 3);
        ctx.fillStyle = braking ? '#ff7777' : '#c41919'; ctx.fillRect(-22, 5, 8, 5); ctx.fillRect(14, 5, 8, 5);
        drawPlate(0, 9, 16, 6);
        ctx.restore(); return;
    }

    const truck = vehicle.kind === 'truck';
    const wide = truck ? 33 : vehicle.design === 3 ? 29 : 25;
    const height = truck ? 29 : vehicle.design === 2 ? 18 : 15;
    ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(-wide, 18, wide * 2, 7);
    ctx.fillStyle = '#090909'; ctx.fillRect(-wide - 2, 7, 9, 18); ctx.fillRect(wide - 7, 7, 9, 18);
    ctx.fillStyle = body;
    ctx.beginPath(); ctx.moveTo(-wide, 15); ctx.lineTo(wide, 15); ctx.lineTo(wide - 2, -height); ctx.lineTo(-wide + 2, -height); ctx.closePath(); ctx.fill();
    if (truck) {
        ctx.fillStyle = '#151515'; ctx.fillRect(-25, -17, 50, 13);
        ctx.fillStyle = body; ctx.fillRect(-28, -4, 56, 10);
        ctx.fillStyle = accent; ctx.fillRect(-30, 7, 60, 4);
    } else {
        ctx.fillStyle = '#111'; ctx.beginPath(); ctx.moveTo(-19, -height + 2); ctx.lineTo(19, -height + 2); ctx.lineTo(15, -3); ctx.lineTo(-15, -3); ctx.closePath(); ctx.fill();
        ctx.fillStyle = 'rgba(0,200,255,0.42)'; ctx.fillRect(-15, -height + 4, 30, Math.max(6, height - 9));
        ctx.fillStyle = accent;
        if (vehicle.design === 1) ctx.fillRect(-wide, 1, wide * 2, 4);
        else if (vehicle.design === 2) { ctx.fillRect(-4, -height, 8, height + 14); ctx.fillRect(-wide - 2, -height - 4, wide * 2 + 4, 3); }
        else if (vehicle.design === 3) { ctx.fillRect(-wide, 10, wide * 2, 3); ctx.fillRect(-wide - 4, -height - 5, wide * 2 + 8, 4); }
        else ctx.fillRect(-12, -height, 7, 7);
    }
    ctx.fillStyle = braking ? '#ff7777' : '#5a0909'; ctx.fillRect(-wide + 5, 5, 9, 5); ctx.fillRect(wide - 14, 5, 9, 5);
    drawPlate(0, 9, truck ? 18 : 16, 6);
    ctx.restore();
}

function drawPlayerVehicle(x, y, currentSpeed, steerAngle, isOffRoad) {
    const vehicle = getActiveVehicle();
    const level = currentLevel();
    const paint = getVehiclePaint(vehicle);
    const isShip = vehicleClassForLevel() === 'ship';
    const bumper = vehicleClassForLevel() === 'bumper';
    let bounce = currentSpeed > 5 ? Math.sin(performance.now() * (isOffRoad ? 0.045 : 0.028)) * (isOffRoad ? 3 : 1.4) : 0;
    if (gameState === 'STARTING' && engineRPM > 20) bounce = (Math.random() - 0.5) * (engineRPM / 30);
    if (burnoutAmount > 0.05) bounce += (Math.random() - 0.5) * 3.5 * burnoutAmount;
    const orbitX = Math.sin(donutPhase) * 19 * donutAmount;
    const orbitY = Math.cos(donutPhase) * 5 * donutAmount;
    // Normalize the on-road silhouette so the player's vehicle is only a
    // little larger than a traffic car at the bottom of the projection.
    let scale;
    if (isShip) scale = 0.92;
    else if (bumper) scale = 0.68;
    else if (vehicle.kind === 'bike') scale = 1.28;
    else if (vehicle.kind === 'truck') scale = 0.78;
    else if (vehicle.design === 'civilian') scale = 1.08;
    else if (vehicle.design === 'classic' || vehicle.design === 'police') scale = 0.80;
    else if (vehicle.design === 3) scale = 0.78;
    else scale = 0.88;
    const modelBottom = isShip ? 48 : vehicle.kind === 'bike' ? 32 : bumper ? 30 : 25;
    const screenBottom = y + 17;

    ctx.save();
    ctx.translate(x + orbitX + steerAngle * (isShip ? 0.10 : 0), screenBottom - modelBottom * scale + bounce + orbitY);
    ctx.rotate((isShip ? steerAngle * 0.003 : driftAngle * Math.PI / 180) + (crashState.active ? crashState.roll : 0));
    drawVehicleModel(vehicle, 0, 0, scale, {
        paint,
        braking: (keys.ArrowDown || keys.s) || keys.Space,
        thrust: currentSpeed > 2 || nitroActive
    });
    if (isShip && weaponFlash > 0) {
        ctx.fillStyle = `rgba(150,255,255,${clamp(weaponFlash * 8, 0, 1)})`;
        ctx.beginPath(); ctx.arc(0, -46 * scale, 7 * scale, 0, TAU); ctx.fill();
    }
    ctx.restore();
}


function drawHitboxDebug(view) {
    if (!hitboxDebug || !view) return;

    const horizonY = view.horizonY;
    const currentCenter = view.currentMetrics.center;
    const nearProjection = getProjection(pos + CONFIG.nearDistance + 0.08, 0, horizonY, currentCenter);
    const nearRoadHalf = nearProjection ? nearProjection.roadHalf : 285;
    const playerHalfPx = Math.max(4, playerCollisionHalfWidth() * nearRoadHalf);
    const playerBottom = HEIGHT - 1;
    const playerHeight = vehicleClassForLevel() === 'ship' ? 30 : 24;

    ctx.save();
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 3]);

    // Player's exact lateral inner box.
    ctx.fillStyle = 'rgba(60,255,130,0.13)';
    ctx.strokeStyle = '#42ff87';
    ctx.fillRect(WIDTH / 2 - playerHalfPx, playerBottom - playerHeight, playerHalfPx * 2, playerHeight);
    ctx.strokeRect(WIDTH / 2 - playerHalfPx + 0.5, playerBottom - playerHeight + 0.5, playerHalfPx * 2 - 1, playerHeight - 1);

    for (const car of trafficCars) {
        if (car.z <= pos + CONFIG.nearDistance || car.z >= pos + CONFIG.viewDistance || car.parked) continue;
        const projection = getProjection(car.z, car.x, horizonY, currentCenter);
        if (!projection) continue;

        const halfPx = Math.max(3, trafficCollisionHalfWidth(car) * projection.roadHalf);
        const boxHeight = Math.max(5, projection.scale * (car.kind === 'ship' ? 42 : car.kind === 'bumper' ? 24 : 31));
        const top = projection.y - boxHeight;
        const color = car.wreckState ? '#ff9f32' : car.kind === 'police' ? '#4fa9ff' : car.kind === 'racer' ? '#ff49dd' : '#ff4e4e';

        ctx.fillStyle = car.wreckState ? 'rgba(255,159,50,0.14)' : 'rgba(255,70,70,0.11)';
        ctx.strokeStyle = color;
        ctx.fillRect(projection.x - halfPx, top, halfPx * 2, boxHeight);
        ctx.strokeRect(projection.x - halfPx + 0.5, top + 0.5, halfPx * 2 - 1, boxHeight - 1);
    }

    // Show the compact swept front-contact band used by the collision test.
    const contactProjection = getProjection(pos + CONFIG.collisionFront, 0, horizonY, currentCenter);
    if (contactProjection) {
        ctx.setLineDash([2, 3]);
        ctx.strokeStyle = 'rgba(255,230,80,0.9)';
        ctx.beginPath();
        ctx.moveTo(0, contactProjection.y);
        ctx.lineTo(WIDTH, contactProjection.y);
        ctx.stroke();
    }

    ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(0,0,0,0.62)';
    ctx.fillRect(82, 5, 236, 17);
    ctx.strokeStyle = '#42ff87';
    ctx.strokeRect(82.5, 5.5, 235, 16);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 8px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.fillText('HITBOX DEBUG  ` TO TOGGLE  •  GREEN PLAYER / RED TRAFFIC', WIDTH / 2, 16);
    ctx.textAlign = 'left';
    ctx.restore();
}

function drawMainMenu() {
    ctx.fillStyle = '#050608'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffcc'; ctx.font = 'italic bold 34px Impact, sans-serif'; ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 12; ctx.fillText('OUT DRIVE', WIDTH / 2, 40); ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = 'bold 10px "Courier New", monospace'; ctx.fillText('ROAD TO ENTROPIA', WIDTH / 2, 56);

    ctx.font = 'bold 14px "Courier New", monospace'; ctx.fillStyle = '#ffffff'; ctx.fillText('1  STORY JOURNEY', WIDTH / 2, 83);
    ctx.font = '9px "Courier New", monospace'; ctx.fillStyle = '#9fffea'; ctx.fillText(`Continue at Level ${storyCurrentLevel} or begin again`, WIDTH / 2, 98);

    ctx.font = 'bold 14px "Courier New", monospace'; ctx.fillStyle = '#ffca28'; ctx.fillText('2  ARCADE SELECT', WIDTH / 2, 124);
    ctx.font = '9px "Courier New", monospace'; ctx.fillStyle = '#ffe7a0'; ctx.fillText(`${unlockedLevels} of ${MAX_LEVEL} destinations unlocked`, WIDTH / 2, 139);

    ctx.font = 'bold 14px "Courier New", monospace'; ctx.fillStyle = '#ff65d8'; ctx.fillText('3  GARAGE', WIDTH / 2, 165);
    ctx.font = '9px "Courier New", monospace'; ctx.fillStyle = '#ffb6ed'; ctx.fillText(`${Math.floor(garageData.credits).toLocaleString()} credits • vehicles • upgrades • paint`, WIDTH / 2, 180);

    ctx.font = 'bold 14px "Courier New", monospace'; ctx.fillStyle = '#8defff'; ctx.fillText('4  SETTINGS & RESET', WIDTH / 2, 206);
    ctx.font = '9px "Courier New", monospace'; ctx.fillStyle = '#c8f8ff'; ctx.fillText('Remap controls and manage saved progress', WIDTH / 2, 221);

    ctx.font = '8px "Courier New", monospace'; ctx.fillStyle = handlingAssist ? '#62ff8c' : '#ff7777';
    ctx.fillText(`ASSIST ${handlingAssist ? 'ON' : 'OFF'} • AUTO SHIFT ${autoShift ? 'ON' : 'OFF'} • CRT ${crtEnabled ? 'ON' : 'OFF'}`, WIDTH / 2, 250);
    ctx.fillStyle = '#aaa'; ctx.fillText(`${bindingLabel('horn')} HORN • ${bindingLabel('nitro')} NITRO • ${bindingLabel('weapon')} SHIP WEAPON`, WIDTH / 2, 267);
    ctx.fillStyle = '#66727e'; ctx.fillText('Type JAEDEV for the development unlock', WIDTH / 2, 286);
    ctx.textAlign = 'left';
}

function drawStoryMenu() {
    ctx.fillStyle = '#050608'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#00ffcc'; ctx.font = 'italic bold 30px Impact, sans-serif'; ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 10; ctx.fillText('STORY JOURNEY', WIDTH / 2, 48); ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff'; ctx.font = '10px "Courier New", monospace'; ctx.fillText('EARTH → ENTROPIA UNIVERSE', WIDTH / 2, 66);

    ctx.fillStyle = '#111820'; ctx.fillRect(34, 88, WIDTH - 68, 62);
    ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 2; ctx.strokeRect(34, 88, WIDTH - 68, 62);
    ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 16px "Courier New", monospace'; ctx.fillText('1 / C   CONTINUE STORY', WIDTH / 2, 112);
    ctx.fillStyle = '#d8fff8'; ctx.font = '10px "Courier New", monospace';
    ctx.fillText(storyCurrentLevel === MAX_LEVEL && unlockedLevels === MAX_LEVEL ? 'FOMA FINAL — TOUR READY' : `LEVEL ${storyCurrentLevel}: ${LEVELS[storyCurrentLevel].name}`, WIDTH / 2, 132);

    ctx.fillStyle = '#211609'; ctx.fillRect(34, 166, WIDTH - 68, 62);
    ctx.strokeStyle = '#ffca28'; ctx.strokeRect(34, 166, WIDTH - 68, 62);
    ctx.fillStyle = '#ffca28'; ctx.font = 'bold 16px "Courier New", monospace'; ctx.fillText('2 / N   NEW STORY', WIDTH / 2, 190);
    ctx.fillStyle = '#ffe8a8'; ctx.font = '9px "Courier New", monospace'; ctx.fillText('Restart at Earth Level 1', WIDTH / 2, 209);
    ctx.fillText('Garage, vehicles and credits are preserved', WIDTH / 2, 221);

    ctx.fillStyle = '#ffb6ed'; ctx.font = '9px "Courier New", monospace'; ctx.fillText('GARAGE IS ALWAYS AVAILABLE FROM THE MAIN MENU', WIDTH / 2, 246);
    ctx.fillStyle = '#aaa'; ctx.fillText('ESC: BACK', WIDTH / 2, 260);
    ctx.fillStyle = '#52606d'; ctx.font = '8px "Courier New", monospace'; ctx.fillText('DEV AUTO-COMPLETE CODE: JAEDEV', WIDTH / 2, 282);
    ctx.textAlign = 'left';
}

function drawSettings() {
    const items = settingsItems();
    const visibleRows = 9;
    settingsScroll = clamp(settingsScroll, 0, Math.max(0, items.length - visibleRows));

    const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    bg.addColorStop(0, '#071018'); bg.addColorStop(0.58, '#111b25'); bg.addColorStop(1, '#050608');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#8defff'; ctx.font = 'italic bold 27px Impact, sans-serif'; ctx.shadowColor = '#00dfff'; ctx.shadowBlur = 9; ctx.fillText('SETTINGS', WIDTH / 2, 30); ctx.shadowBlur = 0;
    ctx.fillStyle = '#bdefff'; ctx.font = '8px "Courier New", monospace'; ctx.fillText('UP/DOWN SELECT • LEFT/RIGHT SLOT • ENTER CHANGE', WIDTH / 2, 44);

    const rowTop = 57;
    const rowHeight = 21;
    for (let visible = 0; visible < visibleRows; visible += 1) {
        const itemIndex = settingsScroll + visible;
        if (itemIndex >= items.length) break;
        const item = items[itemIndex];
        const y = rowTop + visible * rowHeight;
        const selected = itemIndex === settingsSelection;

        ctx.fillStyle = selected ? 'rgba(0,255,204,0.18)' : (visible % 2 === 0 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.08)');
        ctx.fillRect(12, y - 12, WIDTH - 24, 19);
        if (selected) {
            ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 1; ctx.strokeRect(12.5, y - 11.5, WIDTH - 25, 18);
        }

        ctx.textAlign = 'left';
        ctx.font = 'bold 8px "Courier New", monospace';
        ctx.fillStyle = item.type === 'command' ? item.color : '#eef7ff';
        ctx.fillText(item.label, 19, y + 1);

        if (item.type === 'binding') {
            const slots = keybinds[item.id] || ['', ''];
            for (let slot = 0; slot < 2; slot += 1) {
                const x = slot === 0 ? 231 : 318;
                const activeSlot = selected && settingsSlot === slot;
                ctx.fillStyle = activeSlot ? '#00ffcc' : 'rgba(255,255,255,0.10)';
                ctx.fillRect(x, y - 10, 71, 15);
                ctx.fillStyle = activeSlot ? '#04100d' : '#d8e3ea';
                ctx.textAlign = 'center'; ctx.font = 'bold 7px "Courier New", monospace';
                ctx.fillText(formatBinding(slots[slot]), x + 35.5, y + 1);
            }
        } else {
            ctx.textAlign = 'right'; ctx.fillStyle = settingsConfirmId === item.id ? '#fff36b' : '#8996a3'; ctx.font = 'bold 7px "Courier New", monospace';
            ctx.fillText(settingsConfirmId === item.id ? 'ENTER AGAIN' : 'ENTER', WIDTH - 20, y + 1);
        }
    }

    if (items.length > visibleRows) {
        const trackY = rowTop - 12;
        const trackH = visibleRows * rowHeight - 2;
        const thumbH = Math.max(22, trackH * visibleRows / items.length);
        const maxScroll = Math.max(1, items.length - visibleRows);
        const thumbY = trackY + (trackH - thumbH) * (settingsScroll / maxScroll);
        ctx.fillStyle = 'rgba(255,255,255,0.10)'; ctx.fillRect(WIDTH - 8, trackY, 3, trackH);
        ctx.fillStyle = '#00ffcc'; ctx.fillRect(WIDTH - 8, thumbY, 3, thumbH);
    }

    ctx.textAlign = 'center';
    if (settingsRebinding) {
        const action = KEYBIND_ACTIONS.find(entry => entry.id === settingsRebinding.actionId);
        ctx.fillStyle = 'rgba(0,0,0,0.92)'; ctx.fillRect(24, 103, WIDTH - 48, 76);
        ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 2; ctx.strokeRect(24, 103, WIDTH - 48, 76);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 10px "Courier New", monospace'; ctx.fillText(`PRESS A KEY FOR ${action.label}`, WIDTH / 2, 126);
        ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 13px "Courier New", monospace'; ctx.fillText(`SLOT ${settingsRebinding.slot + 1}`, WIDTH / 2, 148);
        ctx.fillStyle = '#aaa'; ctx.font = '7px "Courier New", monospace'; ctx.fillText('ESC CANCEL • BACKSPACE CLEAR', WIDTH / 2, 166);
    }

    ctx.fillStyle = settingsMessageTimer > 0 ? (settingsConfirmId ? '#fff36b' : '#00ffcc') : '#8795a1';
    ctx.font = 'bold 8px "Courier New", monospace';
    ctx.fillText(settingsMessageTimer > 0 ? settingsMessage : 'BACKSPACE CLEARS A BINDING • ESC RETURNS', WIDTH / 2, 272);
    ctx.fillStyle = '#65727e'; ctx.font = '7px "Courier New", monospace';
    ctx.fillText('RESET ALL PROGRESS KEEPS DISPLAY SETTINGS AND KEYBINDS', WIDTH / 2, 287);
    ctx.textAlign = 'left';
}

function drawStatBar(label, value, x, y, width = 92) {
    const normalized = clamp((value - 0.45) / 1.15, 0, 1);
    ctx.font = 'bold 8px "Courier New", monospace'; ctx.fillStyle = '#ddd'; ctx.fillText(label, x, y);
    ctx.fillStyle = '#20242a'; ctx.fillRect(x + 47, y - 7, width, 7);
    ctx.fillStyle = value >= 1.15 ? '#ff5ed8' : value >= 1.02 ? '#00ffcc' : '#ffca28'; ctx.fillRect(x + 47, y - 7, width * normalized, 7);
}

function drawGarage() {
    const cls = garageCurrentClass();
    const vehicle = garageCurrentVehicle();
    const owned = isVehicleOwned(vehicle.id);
    const equipped = garageData.selected[vehicle.class] === vehicle.id;
    const paint = getVehiclePaint(vehicle);
    const perf = getVehiclePerformance(vehicle);
    const list = garageCurrentList();

    const bg = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    bg.addColorStop(0, '#10151c'); bg.addColorStop(0.62, '#202730'); bg.addColorStop(1, '#090b0f');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.strokeStyle = '#2b333d'; ctx.lineWidth = 1;
    for (let y = 118; y < HEIGHT; y += 18) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(WIDTH, y); ctx.stroke(); }
    ctx.fillStyle = '#00ffcc'; ctx.font = 'italic bold 25px Impact, sans-serif'; ctx.fillText('OUT DRIVE GARAGE', 12, 27);
    ctx.textAlign = 'right'; ctx.font = 'bold 11px "Courier New", monospace'; ctx.fillStyle = '#ffda3a'; ctx.fillText(`${Math.floor(garageData.credits).toLocaleString()} CR`, WIDTH - 10, 22); ctx.textAlign = 'left';

    GARAGE_CLASSES.forEach((name, index) => {
        const x = 10 + index * 128;
        ctx.fillStyle = index === garageClassIndex ? '#00ffcc' : '#343b45'; ctx.fillRect(x, 38, 118, 18);
        ctx.fillStyle = index === garageClassIndex ? '#06120f' : '#bbb'; ctx.font = 'bold 8px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.fillText(GARAGE_CLASS_LABELS[name], x + 59, 50);
    });
    ctx.textAlign = 'left';

    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px "Courier New", monospace'; ctx.textAlign = 'center'; ctx.fillText(vehicle.name, WIDTH / 2, 76);
    ctx.font = '9px "Courier New", monospace'; ctx.fillStyle = equipped ? '#62ff8c' : owned ? '#9fffea' : '#ffca28';
    ctx.fillText(equipped ? 'EQUIPPED' : owned ? 'OWNED — PRESS ENTER TO EQUIP' : `${vehicle.price.toLocaleString()} CREDITS`, WIDTH / 2, 91);
    ctx.fillStyle = '#9aa5b1'; ctx.font = '8px "Courier New", monospace'; ctx.fillText(`${garageVehicleIndex + 1}/${list.length}  ${vehicle.description}`, WIDTH / 2, 106);
    ctx.textAlign = 'left';

    ctx.save(); ctx.translate(WIDTH / 2, 147); ctx.rotate(Math.sin(performance.now() * 0.0012) * 0.035); drawVehicleModel(vehicle, 0, 0, vehicle.kind === 'ship' ? 1.55 : vehicle.kind === 'bike' ? 1.75 : vehicle.kind === 'truck' ? 1.38 : 1.58, { paint, preview: true }); ctx.restore();

    if (canUseLicensePlate(vehicle)) {
        const shownPlate = plateEditing ? (plateEditBuffer || ' ') : getVehiclePlate(vehicle);
        ctx.fillStyle = '#e9e4d3'; ctx.fillRect(WIDTH / 2 - 36, 164, 72, 17);
        ctx.strokeStyle = plateEditing ? '#00ffcc' : '#252525'; ctx.lineWidth = 2; ctx.strokeRect(WIDTH / 2 - 36, 164, 72, 17);
        ctx.fillStyle = '#111'; ctx.font = 'bold 10px monospace'; ctx.textAlign = 'center'; ctx.fillText(shownPlate + (plateEditing && Math.floor(performance.now() / 350) % 2 === 0 ? '_' : ''), WIDTH / 2, 176); ctx.textAlign = 'left';
    }

    drawStatBar('SPEED', perf.topSpeed, 14, 181);
    drawStatBar('ACCEL', perf.accel, 14, 194);
    drawStatBar('HANDLE', perf.handling, 14, 207);
    drawStatBar('BRAKES', perf.brakes, 214, 181);
    drawStatBar('ARMOR', perf.armor, 214, 194);
    ctx.font = '8px "Courier New", monospace'; ctx.fillStyle = '#bbb'; ctx.fillText(`NITRO ${getVehicleUpgrade(vehicle, 'nitrous')}/5${vehicle.class === 'ship' ? `  WPN ${getVehicleUpgrade(vehicle, 'weapon')}/5` : ''}`, 214, 207);

    const garageUpgradeKeys = vehicle.class === 'ship' ? [...UPGRADE_KEYS, 'weapon'] : UPGRADE_KEYS;
    const upgradeEntries = garageUpgradeKeys.map((key, index) => {
        const level = getVehicleUpgrade(vehicle, key);
        const label = key === 'nitrous' ? 'NITRO' : key === 'weapon' ? 'WPN' : key.slice(0, 3).toUpperCase();
        return `${index + 1}:${label} ${level}/5${level < 5 ? ` ${getUpgradeCost(vehicle, key).toLocaleString()}` : ' MAX'}`;
    });
    ctx.fillStyle = '#15191f'; ctx.fillRect(6, 218, WIDTH - 12, 76);
    ctx.textAlign = 'center'; ctx.font = '7px "Courier New", monospace'; ctx.fillStyle = '#fff';
    ctx.fillText(upgradeEntries.slice(0, 3).join('   '), WIDTH / 2, 231);
    ctx.fillText(upgradeEntries.slice(3).join('   '), WIDTH / 2, 242);
    ctx.fillStyle = '#9fffea'; ctx.font = '8px "Courier New", monospace'; ctx.fillText('←/→ VEHICLE   ↑/↓ CLASS   ENTER BUY/EQUIP', WIDTH / 2, 257);
    ctx.fillStyle = '#ffb6ed'; ctx.font = '8px "Courier New", monospace'; ctx.fillText(vehicle.class === 'ship' ? 'C BODY • V ACCENT • 1–5 UPGRADES • 6 WEAPON' : 'C BODY • V ACCENT • P PLATE • 1–5 UPGRADES', WIDTH / 2, 271);
    ctx.fillStyle = '#aaa'; ctx.fillText('G or ESC: RETURN TO MENU', WIDTH / 2, 285);
    if (plateEditing) {
        ctx.fillStyle = 'rgba(0,0,0,0.92)'; ctx.fillRect(44, 108, WIDTH - 88, 43);
        ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 2; ctx.strokeRect(44, 108, WIDTH - 88, 43);
        ctx.fillStyle = '#fff'; ctx.font = 'bold 9px "Courier New", monospace'; ctx.fillText('TYPE LICENSE PLATE — 7 CHARACTERS MAX', WIDTH / 2, 122);
        ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 15px monospace'; ctx.fillText((plateEditBuffer || ' ') + (Math.floor(performance.now() / 350) % 2 === 0 ? '_' : ''), WIDTH / 2, 140);
        ctx.fillStyle = '#aaa'; ctx.font = '7px "Courier New", monospace'; ctx.fillText('ENTER SAVE • BACKSPACE DELETE • ESC CANCEL', WIDTH / 2, 149);
    } else if (garageMessageTimer > 0) {
        ctx.fillStyle = 'rgba(0,0,0,0.82)'; ctx.fillRect(28, 112, WIDTH - 56, 28);
        ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 10px "Courier New", monospace'; ctx.fillText(garageMessage, WIDTH / 2, 130);
    }
    ctx.textAlign = 'left';
}

function drawRadioDash() {
    const level = currentLevel();
    ctx.fillStyle = '#536f86'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.moveTo(0, 92); ctx.lineTo(WIDTH, 92); ctx.lineTo(WIDTH, HEIGHT); ctx.lineTo(0, HEIGHT); ctx.fill();
    ctx.fillStyle = '#050505'; ctx.fillRect(WIDTH / 2 - 112, 108, 224, 100);
    ctx.fillStyle = '#222'; ctx.fillRect(WIDTH / 2 - 99, 121, 198, 60);
    ctx.fillStyle = '#00ff65'; ctx.font = 'bold 13px "Courier New", monospace'; ctx.textAlign = 'center';
    ctx.fillText(`${mode === 'STORY' ? 'STORY' : 'ARCADE'} ${selectedLevel}/${MAX_LEVEL}`, WIDTH / 2, 141);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 12px "Courier New", monospace'; ctx.fillText(level.name, WIDTH / 2, 159);
    ctx.fillStyle = '#89ffba'; ctx.font = '9px "Courier New", monospace'; ctx.fillText(level.destination, WIDTH / 2, 175);
    ctx.fillStyle = '#444'; ctx.beginPath(); ctx.arc(WIDTH / 2 - 89, 192, 9, 0, TAU); ctx.fill(); ctx.beginPath(); ctx.arc(WIDTH / 2 + 89, 192, 9, 0, TAU); ctx.fill();
    ctx.strokeStyle = '#111'; ctx.lineWidth = 20; ctx.beginPath(); ctx.arc(WIDTH / 2, HEIGHT + 50, 100, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#ffddaa'; ctx.fillRect(handX, 181, 40, 20); ctx.fillRect(handX - 10, 181, 10, 15);
    ctx.font = '11px "Courier New", monospace'; ctx.fillStyle = '#fff'; ctx.fillText(mode === 'ARCADE' ? 'LEFT / RIGHT: SELECT DESTINATION' : level.intro, WIDTH / 2, 235);
    ctx.fillStyle = '#00ffcc'; ctx.fillText('ENTER: BEGIN JOURNEY', WIDTH / 2, 258);
    ctx.fillStyle = '#aaa'; ctx.fillText(`${bindingLabel('handbrake')} BRAKE • ${bindingLabel('horn')} HORN • ${bindingLabel('nitro')} NITRO • ${autoShift ? 'AUTO' : 'MANUAL'}`, WIDTH / 2, 281);
    ctx.textAlign = 'left';
}

function drawRocketIntro() {
    const t = clamp(specialIntroTimer / specialIntroDuration, 0, 1);
    ctx.fillStyle = '#071223'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    const dawn = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    dawn.addColorStop(0, '#071223'); dawn.addColorStop(0.58, '#29577a'); dawn.addColorStop(1, '#d99853');
    ctx.fillStyle = dawn; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = '#20242a'; ctx.fillRect(0, 220, WIDTH, 80);
    ctx.fillStyle = '#555'; ctx.fillRect(228, 88, 14, 138); ctx.fillRect(280, 110, 7, 116);
    ctx.strokeStyle = '#777'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(235, 105); ctx.lineTo(283, 120); ctx.stroke();

    const launchPhase = smoothstep(0.34, 0.94, t);
    const rocketY = 190 - launchPhase * 315;
    ctx.save(); ctx.translate(258, rocketY);
    ctx.fillStyle = '#e8edf2'; ctx.fillRect(-14, -70, 28, 72);
    ctx.beginPath(); ctx.moveTo(-14, -70); ctx.lineTo(0, -98); ctx.lineTo(14, -70); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#d21d2d'; ctx.fillRect(-14, -22, 28, 13); ctx.fillRect(-24, -5, 12, 20); ctx.fillRect(12, -5, 12, 20);
    ctx.fillStyle = '#3fdcff'; ctx.beginPath(); ctx.arc(0, -54, 6, 0, TAU); ctx.fill();
    if (launchPhase > 0) {
        ctx.fillStyle = '#fff6a0'; ctx.beginPath(); ctx.moveTo(-9, 3); ctx.lineTo(0, 50 + Math.sin(specialIntroTimer * 22) * 8); ctx.lineTo(9, 3); ctx.fill();
        ctx.fillStyle = '#ff6a20'; ctx.beginPath(); ctx.moveTo(-6, 3); ctx.lineTo(0, 35 + Math.sin(specialIntroTimer * 18) * 6); ctx.lineTo(6, 3); ctx.fill();
    }
    ctx.restore();

    ctx.fillStyle = '#111'; ctx.fillRect(36, 215, 88, 22); ctx.fillStyle = '#d31111'; ctx.fillRect(45, 199, 70, 20);
    ctx.fillStyle = '#050505'; ctx.fillRect(45, 231, 18, 8); ctx.fillRect(97, 231, 18, 8);
    ctx.fillStyle = '#f4c430'; ctx.fillRect(55, 190, 8, 8);
    ctx.fillStyle = '#0d1520'; ctx.fillRect(16, 155, 126, 34); ctx.strokeStyle = '#00ffcc'; ctx.lineWidth = 3; ctx.strokeRect(16, 155, 126, 34);
    ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 18px Impact, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('SPACEPECS', 79, 178);

    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px "Courier New", monospace'; ctx.fillText(t < 0.32 ? 'PARKING AT LAUNCH PAD...' : t < 0.90 ? 'LIFTOFF!' : 'DESTINATION: THE MOON', WIDTH / 2, 36);
    ctx.font = '10px "Courier New", monospace'; ctx.fillStyle = '#9fffea'; ctx.fillText(`LEVEL ${selectedLevel} — ${currentLevel().name}`, WIDTH / 2, 54); ctx.textAlign = 'left';
}

function drawSpaceIntro() {
    const t = clamp(specialIntroTimer / specialIntroDuration, 0, 1);
    ctx.fillStyle = '#010106'; ctx.fillRect(0, 0, WIDTH, HEIGHT); drawStars(95, t * 2.2, true);
    ctx.save(); ctx.translate(WIDTH / 2, HEIGHT / 2 + 25); ctx.scale(2.1 + t * 0.4, 2.1 + t * 0.4); drawSprite('SHIP', 0, 0, 1, { color: '#dce9f2' }); ctx.restore();
    ctx.strokeStyle = `rgba(76,220,255,${0.2 + t * 0.6})`; ctx.lineWidth = 3;
    for (let i = 0; i < 10; i += 1) {
        const r = 22 + i * 18 + t * 35;
        ctx.beginPath(); ctx.ellipse(WIDTH / 2, HEIGHT / 2 + 20, r * 1.8, r * 0.7, 0, 0, TAU); ctx.stroke();
    }
    ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 17px "Courier New", monospace'; ctx.fillText(t < 0.55 ? 'SHIP SYSTEMS ONLINE' : `${currentLevel().finishLabel || 'DEEP SPACE'} VECTOR LOCKED`, WIDTH / 2, 38);
    ctx.fillStyle = '#00ffcc'; ctx.font = '10px "Courier New", monospace'; ctx.fillText(`LEVEL ${selectedLevel} — ${currentLevel().name}`, WIDTH / 2, 56); ctx.textAlign = 'left';
}


function planetLaunchPalette(theme) {
    if (theme === 'calypso') return { sky: '#30256f', ground: '#5a3158', glow: '#9ffff4' };
    if (theme === 'arkadia') return { sky: '#35131c', ground: '#8a3728', glow: '#ffb06b' };
    if (theme === 'carnival') return { sky: '#28125c', ground: '#db4bb5', glow: '#7dfff0' };
    return { sky: '#160827', ground: '#4d163f', glow: '#ff56d8' };
}
function drawPlanetLaunchIntro() {
    const level = currentLevel();
    const t = clamp(specialIntroTimer / specialIntroDuration, 0, 1);
    const palette = planetLaunchPalette(level.launchTheme);
    const sky = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    sky.addColorStop(0, '#01010a'); sky.addColorStop(.55, palette.sky); sky.addColorStop(1, palette.ground);
    ctx.fillStyle = sky; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    drawStars(48, t * .28, true);
    ctx.fillStyle = palette.ground; ctx.fillRect(0, 218, WIDTH, 82);
    for (let i = 0; i < 10; i += 1) {
        const x = i * 49 - 18;
        ctx.fillStyle = i % 2 ? mixColor(palette.ground, '#000000', .20) : mixColor(palette.ground, '#ffffff', .08);
        ctx.beginPath(); ctx.moveTo(x, 218); ctx.lineTo(x + 24, 188 - (i % 3) * 11); ctx.lineTo(x + 52, 218); ctx.fill();
    }
    const lift = smoothstep(.25, .90, t);
    const shipY = 220 - lift * 285;
    const ship = getActiveVehicle();
    ctx.save();
    ctx.translate(WIDTH / 2, shipY);
    ctx.scale(2.05 + lift * .20, 2.05 + lift * .20);
    drawVehicleModel(ship, 0, 0, 1, { paint: getVehiclePaint(ship), thrust: lift > .02, preview: true });
    ctx.restore();
    if (lift > 0) {
        const beam = ctx.createLinearGradient(0, shipY + 12, 0, HEIGHT);
        beam.addColorStop(0, `rgba(120,255,255,${.72 - lift * .25})`); beam.addColorStop(1, 'rgba(120,255,255,0)');
        ctx.fillStyle = beam; ctx.beginPath(); ctx.moveTo(WIDTH/2-16, shipY+8); ctx.lineTo(WIDTH/2+16, shipY+8); ctx.lineTo(WIDTH/2+70, HEIGHT); ctx.lineTo(WIDTH/2-70, HEIGHT); ctx.fill();
    }
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff'; ctx.font = 'bold 16px "Courier New", monospace';
    ctx.fillText(t < .20 ? `BOARDING ${ship.name}` : t < .82 ? `LAUNCHING FROM ${level.launchFrom}` : `${level.launchTo} VECTOR ACQUIRED`, WIDTH / 2, 33);
    ctx.fillStyle = palette.glow; ctx.font = 'bold 10px "Courier New", monospace'; ctx.fillText(`${level.launchFrom} → ${level.launchTo}`, WIDTH / 2, 51);
    ctx.fillStyle = '#d9faff'; ctx.font = '8px "Courier New", monospace'; ctx.fillText('YOUR EQUIPPED SHIP • NO LAUNCH PAD REQUIRED', WIDTH / 2, 68);
    ctx.textAlign = 'left';
}

function drawLevelIntro() {
    if (currentLevel().specialIntro === 'rocket') drawRocketIntro();
    else if (currentLevel().specialIntro === 'launch') drawPlanetLaunchIntro();
    else drawSpaceIntro();
}

function drawCrashEffects() {
    ctx.save();
    for (const burst of explosionBursts) {
        const alpha = clamp(burst.life / burst.maxLife, 0, 1);
        const gradient = ctx.createRadialGradient(burst.x, burst.y, 0, burst.x, burst.y, burst.radius);
        gradient.addColorStop(0, `rgba(255,255,205,${alpha})`);
        gradient.addColorStop(0.35, `rgba(255,151,25,${alpha * 0.92})`);
        gradient.addColorStop(1, 'rgba(255,40,0,0)');
        ctx.fillStyle = gradient;
        ctx.beginPath(); ctx.arc(burst.x, burst.y, burst.radius, 0, TAU); ctx.fill();
    }
    for (const particle of crashParticles) {
        ctx.globalAlpha = clamp(particle.life / particle.maxLife, 0, 1);
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
    }
    ctx.globalAlpha = 1;

    if (crashState.active) {
        const severityAlpha = crashState.severity === 'catastrophic' ? 0.85 : crashState.severity === 'severe' ? 0.56 : 0.30;
        ctx.strokeStyle = `rgba(235,245,255,${severityAlpha})`;
        ctx.lineWidth = crashState.severity === 'catastrophic' ? 2 : 1;
        const cx = WIDTH * 0.52;
        const cy = HEIGHT * 0.42;
        for (let i = 0; i < (crashState.severity === 'catastrophic' ? 15 : 8); i += 1) {
            const a = hash(i * 7.31 + crashState.duration) * TAU;
            const len = 28 + hash(i * 4.4) * 120;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(a) * len, cy + Math.sin(a) * len * 0.75);
            ctx.stroke();
        }
        ctx.textAlign = 'center';
        ctx.font = 'bold 24px Impact, sans-serif';
        ctx.fillStyle = crashState.severity === 'catastrophic' ? '#ff321f' : '#fff';
        ctx.shadowColor = '#000'; ctx.shadowBlur = 8;
        ctx.fillText(crashState.message, WIDTH / 2, 111);
        ctx.shadowBlur = 0; ctx.textAlign = 'left';
    }
    ctx.restore();
}

function drawPoliceOverlay() {
    if (!policeChase.active && gameState !== 'BUSTED') return;
    const catchProgress = gameState === 'BUSTED' ? 1 : 1 - clamp((policeChase.gap - 7) / 190, 0, 1);
    const escapeProgress = gameState === 'BUSTED' ? 0 : clamp(policeChase.escapeProgress / Math.max(0.1, policeChase.escapeNeeded), 0, 1);
    const flash = Math.floor(performance.now() / 120) % 2 === 0;
    ctx.save();
    ctx.fillStyle = flash ? `rgba(255,20,35,${0.07 + catchProgress * 0.19})` : `rgba(30,70,255,${0.07 + catchProgress * 0.19})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    const mirrorW = 116;
    const mirrorH = 38;
    const mx = WIDTH / 2 - mirrorW / 2;
    const my = 9;
    ctx.fillStyle = '#070707'; ctx.fillRect(mx - 4, my - 4, mirrorW + 8, mirrorH + 8);
    ctx.fillStyle = '#26313b'; ctx.fillRect(mx, my, mirrorW, mirrorH);
    const copScale = 0.30 + catchProgress * 0.76;
    drawSprite('POLICE', WIDTH / 2, my + mirrorH + 5, copScale, { color: '#fff' });
    ctx.strokeStyle = flash ? '#ff2035' : '#2645ff'; ctx.lineWidth = 3; ctx.strokeRect(mx, my, mirrorW, mirrorH);

    ctx.textAlign = 'center';
    ctx.font = 'bold 13px "Courier New", monospace';
    ctx.fillStyle = '#fff';
    ctx.fillText(gameState === 'BUSTED' ? 'PULL OVER — BUSTED!' : 'POLICE CHASE — OUTRUN THEM!', WIDTH / 2, 62);
    if (gameState !== 'BUSTED') {
        ctx.font = '8px "Courier New", monospace';
        ctx.fillStyle = '#aee8ff';
        ctx.fillText(`COP GAP ${Math.floor(policeChase.gap)}m  •  HOLD ${Math.ceil(policeChase.escapeSpeed)}+ MPH`, WIDTH / 2, 74);
        ctx.fillStyle = '#161b22'; ctx.fillRect(WIDTH / 2 - 74, 79, 148, 6);
        ctx.fillStyle = '#00ff9d'; ctx.fillRect(WIDTH / 2 - 74, 79, 148 * escapeProgress, 6);
        ctx.strokeStyle = '#d7fff1'; ctx.lineWidth = 1; ctx.strokeRect(WIDTH / 2 - 74, 79, 148, 6);
    }
    ctx.textAlign = 'left';
    ctx.restore();
}


function damageColor(amount) {
    if (amount < 22) return '#55ff7d';
    if (amount < 48) return '#ffe34f';
    if (amount < 74) return '#ff8c31';
    return '#ff3131';
}
function drawAnalogGauge(cx, cy, radius, ratio, label, valueText, dangerRatio = .86) {
    ctx.save();
    ctx.translate(cx, cy);
    // Only 20% opaque: instruments remain legible without hiding the road.
    ctx.fillStyle = 'rgba(3,6,9,.20)'; ctx.beginPath(); ctx.arc(0, 0, radius, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(180,196,208,.68)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(0, 0, radius-1, Math.PI*.78, Math.PI*2.22); ctx.stroke();
    for (let i=0;i<=8;i++) { const a=lerp(Math.PI*.78,Math.PI*2.22,i/8); ctx.strokeStyle=i/8>=dangerRatio?'rgba(255,69,69,.90)':'rgba(219,229,236,.78)'; ctx.lineWidth=i%2?1:1.5; ctx.beginPath(); ctx.moveTo(Math.cos(a)*(radius-5),Math.sin(a)*(radius-5)); ctx.lineTo(Math.cos(a)*(radius-1),Math.sin(a)*(radius-1)); ctx.stroke(); }
    const angle=lerp(Math.PI*.78,Math.PI*2.22,clamp(ratio,0,1));
    ctx.strokeStyle=ratio>=dangerRatio?'#ff3838':'#00ffcc'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(Math.cos(angle)*Math.max(4,radius-8),Math.sin(angle)*Math.max(4,radius-8)); ctx.stroke();
    ctx.fillStyle='rgba(255,255,255,.88)'; ctx.beginPath(); ctx.arc(0,0,Math.max(1.8,radius*.075),0,TAU); ctx.fill();
    ctx.textAlign='center';
    const labelSize = radius < 23 ? 5 : 7;
    const valueSize = radius < 23 ? 6 : 8;
    ctx.font=`bold ${labelSize}px "Courier New", monospace`; ctx.fillStyle='rgba(190,208,220,.88)'; ctx.fillText(label,0,radius < 23 ? 5 : 7);
    ctx.font=`bold ${valueSize}px "Courier New", monospace`; ctx.fillStyle='rgba(255,255,255,.94)'; ctx.fillText(valueText,0,radius < 23 ? 12 : 16);
    ctx.restore();
}
function drawDamageSkeleton(x, y) {
    const d=vehicleDamage;
    ctx.save(); ctx.translate(x,y);
    // Transparent grey glass panel; no opaque black backing.
    ctx.fillStyle='rgba(116,126,136,.16)'; ctx.fillRect(-43,-25,86,50);
    ctx.strokeStyle='rgba(190,204,214,.42)'; ctx.lineWidth=1; ctx.strokeRect(-43,-25,86,50);
    ctx.textAlign='center'; ctx.font='bold 6px "Courier New", monospace'; ctx.fillStyle='rgba(220,232,239,.82)'; ctx.fillText('VEHICLE DAMAGE',0,-17);

    // The chassis itself is deliberately translucent, with damage colour layered in.
    ctx.globalAlpha=.72;
    ctx.strokeStyle=damageColor(d.body); ctx.lineWidth=2.2; ctx.strokeRect(-9,-10,18,25);
    ctx.fillStyle=damageColor(d.engine); ctx.fillRect(-7,-9,14,8);
    ctx.fillStyle=damageColor(d.frontTires); ctx.fillRect(-16,-9,5,9); ctx.fillRect(11,-9,5,9);
    ctx.fillStyle=damageColor(d.rearTires); ctx.fillRect(-16,7,5,9); ctx.fillRect(11,7,5,9);
    ctx.fillStyle=damageColor(d.brakes); ctx.fillRect(-6,7,12,6);
    ctx.globalAlpha=1;
    const total=(d.engine+d.body+d.frontTires+d.rearTires+d.brakes)/5;
    ctx.font='bold 6px "Courier New", monospace'; ctx.fillStyle=damageColor(total); ctx.fillText(`${Math.round(total)}%`,29,4);
    ctx.font='5px "Courier New", monospace'; ctx.fillStyle='rgba(220,232,239,.72)'; ctx.fillText('TOTAL',29,-4);
    ctx.restore();
}

function drawHUD() {
    const level = currentLevel();
    ctx.save(); ctx.shadowBlur = 4; ctx.shadowColor = '#000'; ctx.font = 'bold 13px "Courier New", monospace'; ctx.fillStyle = '#fff';
    ctx.fillText(`SCORE ${Math.floor(score)}`, 8, 18); ctx.fillText(`LVL ${selectedLevel}/${MAX_LEVEL}`, 8, 35);
    ctx.textAlign = 'center'; ctx.fillStyle = timeLeft <= 10 ? '#ff4d4d' : '#fff'; ctx.fillText(`TIME ${Math.ceil(timeLeft)}`, WIDTH / 2, 18);
    const progress = clamp(pos / level.length, 0, 1);
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(118, 26, 164, 8);
    ctx.fillStyle = level.theme === 'rocktropia' ? '#ff2ca8' : '#00ffcc'; ctx.fillRect(119, 27, 162 * progress, 6);
    ctx.font = '8px "Courier New", monospace'; ctx.fillStyle = '#fff'; ctx.fillText(level.name, WIDTH / 2, 46);
    ctx.textAlign = 'right'; ctx.font = 'bold 13px "Courier New", monospace'; ctx.fillStyle = '#ffda3a'; ctx.fillText(`${Math.floor(speed)} MPH`, WIDTH - 8, 18); ctx.fillStyle = '#fff'; ctx.fillText(`${level.vehicle === 'ship' ? 'THRUST' : 'GEAR'} ${currentGear}`, WIDTH - 8, 35); ctx.textAlign = 'left';

    // Bottom-right instrument cluster: large speedometer with a smaller RPM gauge tucked to its lower-left.
    drawAnalogGauge(WIDTH - 45, HEIGHT - 49, 36, speed / Math.max(1, effectiveTopSpeed()), 'MPH', `${Math.floor(speed)}`, .82);
    drawAnalogGauge(WIDTH - 103, HEIGHT - 30, 19, engineRPM / 100, level.vehicle === 'ship' ? 'PWR' : 'RPM', `${Math.round(engineRPM)}`, .88);

    // Bottom-left status stack: damage, then nitrous, then RPM.
    drawDamageSkeleton(54, HEIGHT - 76);
    const barX = 10;
    const barWidth = 92;
    const nitroY = HEIGHT - 35;
    const tachY = HEIGHT - 18;
    const nitroMax = nitroCapacityFor();

    ctx.font='bold 6px "Courier New", monospace';
    ctx.fillStyle=nitroMax>0?'rgba(191,250,255,.88)':'rgba(160,160,160,.68)';
    ctx.fillText(nitroMax>0?'NITRO [N]':'NO NITRO',barX,nitroY-3);
    ctx.fillStyle = 'rgba(3,6,9,.28)'; ctx.fillRect(barX, nitroY, barWidth, 8);
    ctx.strokeStyle = 'rgba(180,210,220,.28)'; ctx.lineWidth=1; ctx.strokeRect(barX, nitroY, barWidth, 8);
    ctx.fillStyle = nitroActive ? 'rgba(255,255,255,.88)' : 'rgba(62,232,255,.76)';
    ctx.fillRect(barX + 1, nitroY + 1, (barWidth - 2) * (nitroMax > 0 ? clamp(nitroCharge / nitroMax, 0, 1) : 0), 6);

    ctx.fillStyle='rgba(190,218,225,.80)'; ctx.fillText(level.vehicle === 'ship'?'POWER':'RPM',barX,tachY-3);
    ctx.fillStyle = 'rgba(3,6,9,.28)'; ctx.fillRect(barX, tachY, barWidth, 8);
    ctx.strokeStyle = 'rgba(180,210,220,.28)'; ctx.strokeRect(barX, tachY, barWidth, 8);
    ctx.fillStyle = engineRPM > 90 ? 'rgba(255,51,51,.82)' : 'rgba(0,255,204,.76)';
    ctx.fillRect(barX + 1, tachY + 1, (barWidth - 2) * clamp(engineRPM / 100, 0, 1), 6);

    if (level.vehicle === 'ship') {
        const w=getVehicleUpgrade(getActiveVehicle(),'weapon');
        ctx.fillStyle=w>0?'rgba(159,255,250,.88)':'rgba(150,150,150,.68)';
        ctx.fillText(w>0?`WEAPON ${w}/5 [F]`:'NO WEAPON',112,HEIGHT-8);
    }

    const rules = currentRules();
    const warningMetrics = getTrackMetrics(pos + 250, selectedLevel);
    const upcomingTurn = getUpcomingTurn(pos, selectedLevel, 720);
    if (upcomingTurn || Math.abs(warningMetrics.curvature) > 0.24) {
        const turnType = upcomingTurn ? upcomingTurn.type : (Math.abs(warningMetrics.curvature) > 0.72 ? 'hairpin' : 'tight');
        const direction = upcomingTurn ? Math.sign(upcomingTurn.amp) : Math.sign(warningMetrics.curvature);
        const warningDistance = upcomingTurn ? Math.ceil(upcomingTurn.distance / 25) * 25 : 0;
        const targetSpeed = Math.floor(getTrackMetrics(pos + Math.max(250, warningDistance + 120), selectedLevel).recommendedSpeed / 5) * 5;
        ctx.textAlign = 'center';
        ctx.font = 'bold 25px sans-serif';
        ctx.fillStyle = turnType === 'hairpin' ? '#ff493d' : turnType === 'tight' ? '#ffb43b' : '#fff36a';
        ctx.fillText(direction < 0 ? '◀' : '▶', WIDTH / 2, 70);
        ctx.font = 'bold 9px "Courier New", monospace';
        const label = turnType === 'hairpin' ? 'HAIRPIN' : turnType === 'esses' ? 'ESSES' : turnType === 'tight' ? 'TIGHT TURN' : (level.vehicle === 'ship' ? 'VECTOR BEND' : 'WIDE TURN');
        ctx.fillText(`${label}${warningDistance ? ` ${warningDistance}m` : ''}`, WIDTH / 2, 81);
        if (speed > targetSpeed + 12 && turnType !== 'wide') {
            ctx.fillStyle = '#ff493d';
            ctx.fillText(`BRAKE — ${targetSpeed} MPH`, WIDTH / 2, 92);
        }
        ctx.textAlign = 'left';
    }

    if (rules.raceRequired) {
        ctx.font = 'bold 12px "Courier New", monospace';
        ctx.fillStyle = racePosition === 1 ? '#00ffcc' : '#ffcf35';
        ctx.fillText(`POSITION ${racePosition}/${raceFieldSize}${(rules.requiredPosition || 1) > 1 ? '  TOP 3' : ''}`, 8, 53);
    } else if (rules.speedLimit < 900 && level.vehicle !== 'ship') {
        ctx.font = '9px "Courier New", monospace';
        ctx.fillStyle = speed > rules.speedLimit ? '#ff5555' : '#b8e8ff';
        ctx.fillText(`LIMIT ${rules.speedLimit}`, 8, 53);
    }

    if (Math.abs(playerX) > CONFIG.offRoadStart) {
        ctx.textAlign = 'center'; ctx.font = 'bold 16px "Courier New", monospace'; ctx.fillStyle = '#ff4040'; ctx.fillText(level.vehicle === 'ship' ? 'OUTSIDE FLIGHT CORRIDOR!' : 'OFF ROAD — STEER BACK!', WIDTH / 2, 102); ctx.textAlign = 'left';
    }
    if (checkpointFlash > 0) {
        ctx.textAlign = 'center'; ctx.font = 'bold 23px Impact, sans-serif'; ctx.fillStyle = '#00ffcc'; ctx.fillText(`CHECKPOINT +${level.checkpointBonus}s`, WIDTH / 2, 118); ctx.textAlign = 'left';
    }
    if (shiftFlash > 0) {
        ctx.textAlign = 'center'; ctx.font = 'bold 12px "Courier New", monospace'; ctx.fillStyle = '#fff'; ctx.fillText(`${level.vehicle === 'ship' ? 'THRUST' : 'GEAR'} ${currentGear}`, WIDTH / 2, 92); ctx.textAlign = 'left';
    }
    if (nitroActive) { ctx.textAlign='center'; ctx.font='bold 11px "Courier New", monospace'; ctx.fillStyle='#8fffff'; ctx.fillText(level.vehicle==='ship'?'BOOST ENGAGED!':'NITROUS!', WIDTH/2, HEIGHT-38); ctx.textAlign='left'; }
    if (keys.Space && level.vehicle !== 'ship') {
        ctx.textAlign = 'center';
        ctx.font = 'bold 13px "Courier New", monospace';
        ctx.fillStyle = burnoutAmount > 0.55 && Math.abs((keys.ArrowRight || keys.d ? 1 : 0) - (keys.ArrowLeft || keys.a ? 1 : 0)) > 0 ? '#ff4fd8' : '#ffb52e';
        ctx.fillText(donutAmount > 0.45 ? 'DOUGHNUT!' : burnoutAmount > 0.45 ? 'BURNOUT!' : 'HANDBRAKE!', WIDTH / 2, HEIGHT - 12);
        ctx.textAlign = 'left';
    }
    if (eventMessageTimer > 0 && eventMessage) {
        ctx.textAlign = 'center';
        ctx.font = 'bold 11px "Courier New", monospace';
        ctx.fillStyle = eventMessage.includes('POLICE') || eventMessage.includes('RADAR') ? '#86c8ff' : eventMessage.includes('SWERVE') ? '#ffd45d' : '#fff';
        ctx.fillText(eventMessage, WIDTH / 2, 106);
        ctx.textAlign = 'left';
    }
    ctx.font = '9px "Courier New", monospace'; ctx.fillStyle = handlingAssist ? '#75ff96' : '#ffb84a'; ctx.fillText(`ASSIST ${handlingAssist ? 'ON' : 'OFF'}`, WIDTH - 72, HEIGHT - 9);
    if (playerSirenActive) {
        const pulse = Math.floor(performance.now() / 150) % 2 === 0;
        ctx.textAlign = 'center';
        ctx.font = 'bold 10px "Courier New", monospace';
        ctx.fillStyle = pulse ? '#ff4b4b' : '#5d7cff';
        ctx.fillText('POLICE SIREN ON  •  SHIFT+E TO STOP', WIDTH / 2, HEIGHT - 27);
        ctx.textAlign = 'left';
    }
    ctx.restore();
}

function drawRace() {
    const level = currentLevel();
    const speedRatio = clamp(speed / effectiveTopSpeed(), 0, 1);
    const crashShake = crashState.active ? (crashState.severity === 'catastrophic' ? 17 : crashState.severity === 'severe' ? 10 : 5) : 0;
    const shake = ['RACING', 'CRASHING'].includes(gameState) ? Math.max(0, speedRatio - 0.28) * 10.5 + handbrakeAmount * smoothstep(25, 140, speed) * 2.4 + crashShake : 0;
    ctx.save();
    ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake * 0.55);
    const roadView = drawRoadAndScenery();
    drawTireEffects();
    drawPlayerVehicle(WIDTH / 2, HEIGHT - 18, speed, steerRotation, Math.abs(playerX) > CONFIG.offRoadStart);
    drawHitboxDebug(roadView);
    ctx.restore();
    drawHUD();
    drawCrashEffects();
    drawPoliceOverlay();

    if (gameState === 'STARTING') {
        ctx.textAlign = 'center'; ctx.shadowColor = '#ff0000'; ctx.shadowBlur = 10; ctx.fillStyle = '#fff'; ctx.font = 'bold 72px Impact, sans-serif'; ctx.fillText(String(Math.max(1, countdownValue)), WIDTH / 2, HEIGHT / 2 + 16);
        ctx.shadowBlur = 0; ctx.font = 'bold 15px "Courier New", monospace'; ctx.fillStyle = engineRPM >= 82 && engineRPM <= 98 ? '#00ffcc' : '#ffba3a'; ctx.fillText(`${level.vehicle === 'ship' ? 'POWER' : 'REV'} ${Math.floor(engineRPM)}%`, WIDTH / 2, HEIGHT / 2 + 49);
        if (engineRPM >= 82 && engineRPM <= 98) ctx.fillText('PERFECT LAUNCH ZONE', WIDTH / 2, HEIGHT / 2 + 69);
        ctx.textAlign = 'left';
    }
    if (goFlashTimer > 0) {
        ctx.textAlign = 'center'; ctx.font = 'bold 58px Impact, sans-serif'; ctx.fillStyle = '#fff'; ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 12; ctx.fillText(level.vehicle === 'ship' ? 'LAUNCH!' : 'GO!', WIDTH / 2, HEIGHT / 2 + 12); ctx.shadowBlur = 0; ctx.textAlign = 'left';
    }
    if (gameState === 'FINISHING') {
        ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.shadowColor = '#00ffcc'; ctx.shadowBlur = 14; ctx.font = 'bold 50px Impact, sans-serif'; ctx.fillText('FINISH!', WIDTH / 2, HEIGHT / 2 - 2); ctx.shadowBlur = 0;
        ctx.font = 'bold 12px "Courier New", monospace'; ctx.fillStyle = '#00ffcc'; ctx.fillText(level.destination, WIDTH / 2, HEIGHT / 2 + 25); ctx.textAlign = 'left';
    }
    if (gameState === 'BUSTED') {
        ctx.fillStyle = 'rgba(0,0,0,0.28)'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
        ctx.textAlign = 'center'; ctx.font = 'bold 46px Impact, sans-serif'; ctx.fillStyle = '#fff'; ctx.fillText('BUSTED!', WIDTH / 2, HEIGHT / 2 + 12); ctx.textAlign = 'left';
    }
    if (crashFlash > 0) { ctx.fillStyle = `rgba(255,25,25,${Math.min(0.58, crashFlash * 0.55)})`; ctx.fillRect(0, 0, WIDTH, HEIGHT); }
    if (dangerFlash > 0 && Math.floor(performance.now() / 90) % 2 === 0) { ctx.strokeStyle = `rgba(255,65,35,${Math.min(0.55, dangerFlash * 0.4)})`; ctx.lineWidth = 8; ctx.strokeRect(2, 2, WIDTH - 4, HEIGHT - 4); }
}

function drawPaused() {
    ctx.fillStyle = 'rgba(0,0,0,0.72)'; ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.textAlign = 'center'; ctx.fillStyle = '#00ffcc'; ctx.font = 'bold 38px Impact, sans-serif'; ctx.fillText('PAUSED', WIDTH / 2, HEIGHT / 2 - 8);
    ctx.fillStyle = '#fff'; ctx.font = '13px "Courier New", monospace'; ctx.fillText('Press P to continue', WIDTH / 2, HEIGHT / 2 + 28); ctx.textAlign = 'left';
}

function draw() {
    if (gameState === 'INSERT_COIN') { ctx.fillStyle = '#000'; ctx.fillRect(0, 0, WIDTH, HEIGHT); return; }
    if (gameState === 'MAIN_MENU') drawMainMenu();
    else if (gameState === 'STORY_MENU') drawStoryMenu();
    else if (gameState === 'GARAGE') drawGarage();
    else if (gameState === 'SETTINGS') drawSettings();
    else if (gameState === 'RADIO_DASH') drawRadioDash();
    else if (gameState === 'LEVEL_INTRO') drawLevelIntro();
    else if (['STARTING', 'RACING', 'FINISHING', 'CRASHING', 'BUSTED', 'GAMEOVER', 'WIN_RESULTS'].includes(gameState)) drawRace();
    if (paused) drawPaused();
}

let lastTime = performance.now();
function gameLoop(time) {
    const dt = clamp((time - lastTime) / 1000, 0, 0.05);
    lastTime = time;
    update(dt);
    draw();
    updateCrtEffect();
    requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);
