/**
 * 🐾 StreamPet Widget Module
 * Follows the hot-swappable monolithic component structure.
 
 todo/notes:

 */
//===================================
// Libraries
//==================================
const DEFAULT_SOUND_SETTINGS = {
    masterEnabled: true,
    meowSound: true,
    purrSound: true,
    nyanSound: true,
    mewSound: true,
    barkSound: true,
    whineSound: true,
    clickSound: true,
    bubbleSound: true,
    petsplatSound: true,
    customPaths: {}
};

const DEFAULT_AUDIO_PATHS = {
    meowSound: '../assets/sounds/meowSound.mp3',
    mewSound: '../assets/sounds/mewSound.mp3',
    purrSound: '../assets/sounds/purrSound.mp3',
    nyanSound: '../assets/sounds/nyanSound.mp3',
    barkSound: '../assets/sounds/barkSound.mp3',
    whineSound: '../assets/sounds/whineSound.mp3',
    clickSound: '../assets/sounds/clickSound.mp3',
    bubbleSound: '../assets/sounds/bubbleSound.mp3',
    petsplatSound: '../assets/sounds/petsplatSound.mp3'
};
//
// state library
//----------------
const PET_STATE_LIBRARY = {


	walk: (pet, ctx) => {
		if (pet.registry.activeSpecies === "spider") {
			let dir = pet.state.spiderDir || 1;
			
			// 1. Check Web Interaction
			let activeWebNode = pet.state.spiderWebs.find(web => {
				let dx = web.x - pet.state.x;
				let dy = web.y - pet.state.y;
				return Math.sqrt(dx*dx + dy*dy) < web.size + 10;
			});

			if (activeWebNode) {
				pet.state.x += pet.state.facing * 1.5;
				if (Math.random() < 0.08) pet.state.y += (Math.random() > 0.5 ? 2 : -2);
				return;
			} 

			// 2. Wall / Ceiling / Floor Crawling Boundaries
			// Only crawl up walls if the spider is already near them!
			const nearCeiling = Math.abs(pet.state.y - ctx.CEIL_Y) <= 6;
			const nearFloor = Math.abs(pet.state.y - ctx.FLOOR_Y) <= 6;
			const nearLeftWall = Math.abs(pet.state.x - ctx.LEFT_X) <= 6;
			const nearRightWall = Math.abs(pet.state.x - ctx.RIGHT_X) <= 6;

			if (nearCeiling) { 
				pet.state.y = ctx.CEIL_Y; 
				pet.state.x += dir * 1.8;
				pet.state.facing = dir;
				if (pet.state.x <= ctx.LEFT_X) { pet.state.x = ctx.LEFT_X; pet.state.y = ctx.CEIL_Y + 4; }
				if (pet.state.x >= ctx.RIGHT_X) { pet.state.x = ctx.RIGHT_X; pet.state.y = ctx.CEIL_Y + 4; }
			} 
			else if (nearFloor) { 
				pet.state.y = ctx.FLOOR_Y; 
				pet.state.x += dir * 1.8;
				pet.state.facing = dir;
				if (pet.state.x <= ctx.LEFT_X) { pet.state.x = ctx.LEFT_X; pet.state.spiderDir = 1; }
				if (pet.state.x >= ctx.RIGHT_X) { pet.state.x = ctx.RIGHT_X; pet.state.spiderDir = -1; }
			} 
			else if (nearLeftWall) { 
				pet.state.x = ctx.LEFT_X; 
				pet.state.y += dir * 1.8;
				if (pet.state.y <= ctx.CEIL_Y) { pet.state.y = ctx.CEIL_Y; pet.state.spiderDir = 1; }
				if (pet.state.y >= ctx.FLOOR_Y) { pet.state.y = ctx.FLOOR_Y; pet.state.spiderDir = -1; }
			} 
			else if (nearRightWall) { 
				pet.state.x = ctx.RIGHT_X; 
				pet.state.y += dir * 1.8;
				if (pet.state.y <= ctx.CEIL_Y) { pet.state.y = ctx.CEIL_Y; pet.state.spiderDir = -1; }
				if (pet.state.y >= ctx.FLOOR_Y) { pet.state.y = ctx.FLOOR_Y; pet.state.spiderDir = 1; }
			} 
			else {
				// 3. Fallback: If trapped in mid-air (e.g. dropped off web), walk left/right on ground
				pet.state.x += dir * 1.8;
				pet.state.facing = dir;
				if (pet.state.x <= ctx.LEFT_X || pet.state.x >= ctx.RIGHT_X) {
					pet.state.spiderDir *= -1;
				}
			}
		} else {
			if (!pet.state.swimTargetX) {
				pet.state.swimTargetX = ctx.LEFT_X + Math.random() * (ctx.visibleW - (ctx.LEFT_X + ctx.RIGHT_X));
			}

			pet.state.x += (pet.state.swimTargetX - pet.state.x) * 0.02;
			pet.state.facing = (pet.state.swimTargetX > pet.state.x) ? 1 : -1;

			if (pet.registry.activeSpecies === "goldfish") {
				pet.state.y = (ctx.visibleH / 2) + Math.sin(ctx.t * 0.03) * 60;
				if(ctx.t % 20 === 0) pet.state.goldfishBubbles.push({x: pet.state.x, y: pet.state.y, r: 2, alpha: 0.8});
			}
			
			if (Math.abs(pet.state.x - pet.state.swimTargetX) < 10) {
				pet.state.swimTargetX = null;
			}
		}

		if (pet.state.actionTimer <= 0) { 
			pet.state.action = "idle"; 
			pet.state.actionTimer = 400; 
		}
	},
	walk_to_litter: (pet, ctx) => {
		if (pet.registry.activeSpecies === "goldfish") {
			if (!pet.state.aquaticPottyTarget) {
				pet.state.aquaticPottyTarget = {
					x: 100 + Math.random() * (ctx.visibleW - 200),
					y: 120 + Math.random() * (ctx.visibleH - 240)
				};
			}
			if (ctx.walkToPoint(pet.state.aquaticPottyTarget.x, pet.state.aquaticPottyTarget.y, 1.8)) {
				pet.state.aquaticPottyTarget = null;
				pet.state.action = "potty";
				pet.state.actionTimer = 90;
			}
		} else if (pet.registry.activeSpecies === "spider") {
			if (!pet.state.spiderPottyTarget) {
				const r = Math.random();
				if (r < 0.25) pet.state.spiderPottyTarget = { x: ctx.LEFT_X + Math.random() * (ctx.RIGHT_X - ctx.LEFT_X), y: ctx.CEIL_Y };
				else if (r < 0.50) pet.state.spiderPottyTarget = { x: ctx.LEFT_X + Math.random() * (ctx.RIGHT_X - ctx.LEFT_X), y: ctx.FLOOR_Y };
				else if (r < 0.75) pet.state.spiderPottyTarget = { x: ctx.LEFT_X, y: ctx.CEIL_Y + Math.random() * (ctx.FLOOR_Y - ctx.CEIL_Y) };
				else pet.state.spiderPottyTarget = { x: ctx.RIGHT_X, y: ctx.CEIL_Y + Math.random() * (ctx.FLOOR_Y - ctx.CEIL_Y) };
			}
			
			if (ctx.walkToPoint(pet.state.spiderPottyTarget.x, pet.state.spiderPottyTarget.y, 2.2)) {
				pet.state.spiderPottyTarget = null;
				pet.state.action = "potty";
				pet.state.actionTimer = 100;
			}
		} else {
			if (ctx.walkToPoint(ctx.litPos.x, ctx.litPos.y)) { 
				pet.state.action = "potty"; 
				pet.state.actionTimer = 120; 
			}
		}
	},
	walk_to_tower_climb: (pet, ctx) => {
		if (ctx.walkToPoint(ctx.towerPos.x, ctx.towerPos.y)) {
			pet.state.action = "climbing_tower";
		}
	},
	walk_to_tower_scratch: (pet, ctx) => {
		if (ctx.walkToPoint(ctx.towerPos.x, ctx.towerPos.y)) {
			pet.state.action = "scratching";
			pet.state.actionTimer = 180;
		}
	},
	walk_to_bed: (pet, ctx) => {
		let bedTargetX = ctx.bedPos.x;
		let bedTargetY = ctx.bedPos.y - 18;
		if (ctx.walkToPoint(bedTargetX, bedTargetY)) { 
			pet.state.action = "sleep"; 
			pet.state.actionTimer = 1000; 
		}
	},
	walk_to_food: (pet, ctx) => {
		let foodTargetX = ctx.bowlPos.x;
		let foodTargetY = (pet.registry.activeSpecies === "spider") ? ctx.FLOOR_Y : ctx.bowlPos.y;
		
		if (pet.registry.activeSpecies === "spider") {
			if (pet.state.y < ctx.FLOOR_Y - 5) {
				foodTargetX = (pet.state.x < ctx.visibleW / 2) ? ctx.LEFT_X : ctx.RIGHT_X;
				foodTargetY = ctx.FLOOR_Y;
			}
		}

		if (ctx.walkToPoint(foodTargetX, foodTargetY, 2.5)) { 
			if (pet.registry.activeSpecies === "spider" && Math.abs(pet.state.y - ctx.FLOOR_Y) < 5 && Math.abs(pet.state.x - ctx.bowlPos.x) > 15) {
				ctx.walkToPoint(ctx.bowlPos.x, ctx.FLOOR_Y, 2.5);
				return;
			}
			if (pet.state.hasFood) { 
				pet.state.action = "eating"; 
				pet.state.actionTimer = 140; 
			} else { 
				pet.state.action = "idle";
			}
		}
	},
	// walk to kick dirt after poop
	walk_to_kick: (pet, ctx) => {
		if (ctx.walkToPoint(ctx.litPos.x - 50, ctx.litPos.y)) { 
			pet.state.facing = 1; 
			pet.state.action = "kicking"; 
			pet.state.actionTimer = 80; 
		}
	},
	// go poop
	potty: (pet, ctx) => {
		if (pet.state.actionTimer <= 0) { 
			if (pet.registry.activeSpecies === "goldfish") {
				pet.activePet.poops.push({
					x: pet.state.x - (pet.state.facing * 10), y: pet.state.y + 5,
					ox: Math.random() * 100, swimOffset: Math.random() * Math.PI * 2
				});
				pet.activePet.digestive = 0;
				pet.state.action = "idle"; 
				pet.state.actionTimer = 250;
			} else if (pet.registry.activeSpecies === "spider") {
				let cleanX = pet.state.x;
				let cleanY = pet.state.y;
				
				if (cleanX > ctx.LEFT_X + 10 && cleanX < ctx.RIGHT_X - 10 && cleanY > ctx.CEIL_Y + 10 && cleanY < ctx.FLOOR_Y - 10) {
					let distToLeft = cleanX - ctx.LEFT_X;
					let distToRight = ctx.RIGHT_X - cleanX;
					let distToCeil = cleanY - ctx.CEIL_Y;
					let distToFloor = ctx.FLOOR_Y - cleanY;
					let minDist = Math.min(distToLeft, distToRight, distToCeil, distToFloor);
					
					if (minDist === distToLeft) cleanX = ctx.LEFT_X;
					else if (minDist === ctx.RIGHT_X) cleanX = ctx.RIGHT_X;
					else if (minDist === ctx.CEIL_Y) cleanY = ctx.CEIL_Y;
					else cleanY = ctx.FLOOR_Y;
				}

				pet.state.spiderWebs.push({
					x: cleanX, y: cleanY,
					size: 20 + Math.random() * 15
				});
				pet.activePet.digestive = 0;
				pet.state.action = "idle"; 
				pet.state.actionTimer = 200;
			} else {
				pet.activePet.poops.push({ox: Math.random()*100, isCeil: false}); 
				pet.activePet.digestive = 0; 
				pet.state.action = "walk_to_kick"; 
			}
		}
	},
	eating: (pet, ctx) => {
		if (pet.state.actionTimer <= 0) {
			pet.state.hasFood = false; 
			pet.activePet.hunger = Math.max(0, pet.activePet.hunger - 15); 
			pet.activePet.digestive += 1; 
			
			if (pet.activePet.digestive > pet.state.tummylimit) {
				pet.explodePet();
				return;
			}

			pet.activePet.exp += 20; 
			pet.state.action = "idle"; 
			pet.state.actionTimer = 300;
		}
	},



	//kick dirt to cover poop

	kicking: (pet, ctx) => {
		if (ctx.t % 2 === 0) {
			pet.state.particles.push({x: pet.state.x - 10, y: pet.state.y + 20, vx: 5 + Math.random()*6, vy: -4, s: 2.5, c: "#bdc3c7", life: 25});
		}
		if (pet.state.actionTimer <= 0) { 
			pet.state.action = "idle"; 
			pet.state.actionTimer = 300; 
		}
	},
	climbing_tower: (pet, ctx) => {
		const perchY = ctx.towerPos.y - 150;
		pet.state.y -= 1.5;
		
		if (pet.state.y <= perchY) {
			pet.state.y = perchY;
			pet.state.perchPos = { x: pet.state.x, y: pet.state.y }
			pet.state.action = "tower_sleep";
			pet.state.actionTimer = 800;
		}
	},
	scratching: (pet, ctx) => {
		if (ctx.t % 3 === 0) {
			const clawX = pet.state.x + (pet.state.facing * 15);
			const clawY = pet.state.y + 5; 

			pet.state.particles.push({
				x: clawX,
				y: clawY,
				vx: -pet.state.facing * (0.5 + Math.random() * 3),
				vy: -1 - Math.random() * 2,
				s: 2,
				c: "#d2b48c",
				life: 15
			});
		}

		if (pet.state.actionTimer <= 0) {
			pet.state.action = "idle";
			pet.state.actionTimer = Math.floor(Math.random() * 200) + 150;
		}
	},

	teased: (pet, ctx) => {
		if (pet.state.actionTimer > 0) {
			pet.state.x += (Math.random() - 0.5) * 6;
			pet.state.y += (Math.random() - 0.5) * 6;
			if (pet.state.actionTimer % 5 === 0) pet.state.facing *= -1;
		} else {
			pet.state.action = "idle";
			pet.state.actionTimer = 300;
		}
	},
	idle_return: (pet, ctx) => {
		// Smoothly glide back to the starting point
		pet.state.x += (pet.state.originalPos.x - pet.state.x) * 0.1;
		pet.state.y += (pet.state.originalPos.y - pet.state.y) * 0.1;

		if (pet.state.actionTimer <= 0) {
			pet.state.action = "idle";
			pet.state.actionTimer = 200;
		}
	},
	idle: (pet, ctx) => {
		if (pet.registry.activeSpecies === "goldfish") {
			pet.state.y = (ctx.visibleH / 2) + Math.sin(ctx.t * 0.04) * 40;
			if (Math.random() < 0.02) {
				pet.state.goldfishBubbles.push({
					x: pet.state.x + pet.state.facing * 20, 
					y: pet.state.y - 10, 
					r: 2 + Math.random() * 4, 
					alpha: 1
				});
			}
		}

		if (pet.registry.activeSpecies === "spider") {
			let currentWeb = pet.state.spiderWebs.find(w => Math.sqrt((w.x - pet.state.x)**2 + (w.y - pet.state.y)**2) < w.size);
			if (!currentWeb && !["rappel_drop", "rappel_hang", "rappel_rise"].includes(pet.state.action)) {
				if (pet.state.x > ctx.LEFT_X + 5 && pet.state.x < ctx.RIGHT_X - 5 && pet.state.y > ctx.CEIL_Y + 5 && pet.state.y < ctx.FLOOR_Y - 5) {
					if (pet.state.y < ctx.CEIL_Y + 40) pet.state.y = ctx.CEIL_Y;
					else if (pet.state.y > ctx.FLOOR_Y - 40) pet.state.y = ctx.FLOOR_Y;
					else if (pet.state.x < ctx.visibleW / 2) pet.state.x = ctx.LEFT_X;
					else pet.state.x = ctx.RIGHT_X;
				}
			}
		}

		if (pet.state.actionTimer <= 0) {
			if (Math.random() < 0.15) {
				if (pet.registry.activeSpecies === "kitty") pet.petSpeechBubble("Meow! 🐾");
				if (pet.registry.activeSpecies === "puppy") pet.petSpeechBubble("BARK! 🐶");
				if (pet.registry.activeSpecies === "spider") pet.petSpeechBubble("Click-click... 🕷️");
				if (pet.registry.activeSpecies === "goldfish") pet.petSpeechBubble("Blub... 🫧");
			}
			
			if (Math.random() < 0.4) { 
				pet.state.actionTimer = 400 + Math.random() * 400; 
				return; 
			}

			if (pet.activePet.digestive >= 3) { 
				pet.state.action = "walk_to_litter"; 
			} else {
				const r = Math.random();
				if (r < 0.20) { 
					pet.state.action = "walk"; 
					pet.state.facing = Math.random() > 0.5 ? 1 : -1; 
					pet.state.actionTimer = 300 + Math.random() * 300; 
				}
				else if (r < 0.40) pet.state.action = "walk_to_bed";
				else if (r < 0.60 && pet.state.layout.showTower) {
					pet.state.action = Math.random() > 0.5 ? "walk_to_tower_scratch" : "walk_to_tower_climb";
				}
				else pet.state.actionTimer = 500 + Math.random() * 500;
			}
		}
	},

// spider STUFF

	rappel_drop: (pet, ctx) => {
		pet.state.y += 3.5; 
		if (pet.state.y >= pet.state.rappelDepth) {
			pet.state.action = "rappel_hang";
			pet.state.actionTimer = 180 + Math.random() * 200;
		}
	},
	rappel_hang: (pet, ctx) => {
		pet.state.x += Math.sin(ctx.t * 0.05) * 0.4;
		if (pet.state.actionTimer <= 0) {
			pet.state.action = "rappel_rise";
		}
	},
	rappel_rise: (pet, ctx) => {
		pet.state.y -= 2.5; 
		if (pet.state.y <= ctx.CEIL_Y) {
			pet.state.y = ctx.CEIL_Y;
			pet.state.action = "idle";
			pet.state.actionTimer = 200;
		}
	},

	// nyanpet
	nyan: (pet, ctx) => {
		if (pet.state.nyanPhase === "takeoff") {
			const targetY = ctx.visibleH / 2;
			pet.state.y += (targetY - pet.state.y) * 0.05; 
			pet.state.x += pet.state.facing * 5;
			if (Math.abs(pet.state.y - targetY) < 15) pet.state.nyanPhase = "flying";
		} else if (pet.state.nyanPhase === "flying") {
			pet.state.x += pet.state.facing * 10; 
			pet.state.y = (ctx.visibleH / 2) + Math.sin(ctx.t * 0.1) * 100;
			if (pet.state.actionTimer < 80) pet.state.nyanPhase = "landing";
		} else if (pet.state.nyanPhase === "landing") {
			pet.state.x += (pet.state.originalPos.x - pet.state.x) * 0.08; 
			pet.state.y += (pet.state.originalPos.y - pet.state.y) * 0.08;
		}
		if (pet.state.nyanPhase !== "landing") {
			if (pet.state.x > ctx.visibleW + 150) pet.state.x = -150;
			if (pet.state.x < -150) pet.state.x = ctx.visibleW + 150;
		}
		if (pet.state.actionTimer <= 0) {
			pet.petAudio('stop', 'nyanSound');
			pet.state.x = pet.state.originalPos.x; 
			pet.state.y = pet.state.originalPos.y;
			pet.state.action = "idle"; 
			pet.state.actionTimer = 200;
		}
	},

//these, idk why they use pet state library fallback sleep
	sleep: (pet, ctx) => { PET_STATE_LIBRARY._fallbackSleep(pet, ctx); },
	tower_sleep: (pet, ctx) => { PET_STATE_LIBRARY._fallbackSleep(pet, ctx); },
	dance: (pet, ctx) => { PET_STATE_LIBRARY._fallbackSleep(pet, ctx); },
	special: (pet, ctx) => { PET_STATE_LIBRARY._fallbackSleep(pet, ctx); },

	// Common exit handler shared across shared static end states
	_fallbackSleep: (pet, ctx) => {
		if (pet.state.actionTimer <= 0) {
			// If he was on the tower, snap back to the exact perch
			if (pet.state.action === "tower_sleep" && pet.state.perchPos) {
				pet.state.x = pet.state.perchPos.x;
				pet.state.y = pet.state.perchPos.y;
				// Clear the anchor once he returns
				pet.state.perchPos = null;
			} else {
				// Otherwise, snap to his default ground floor original position
				pet.state.x = pet.state.originalPos.x;
				pet.state.y = pet.state.originalPos.y;
			}
			pet.state.action = "idle";
			pet.state.actionTimer = 200;
		}
	}
};
const PET_FLOOR_LIBRARY = {
	kitty: (ctx, floorTopY, visibleW, visibleH, thickness) => {
		// House Floor: Warm hardwood floor panels
		ctx.fillStyle = "#d2b48c"; 
		ctx.fillRect(-2000, floorTopY, 6000, thickness);
		
		// Draw plank lines across the massive field
		ctx.strokeStyle = "#b59975";
		ctx.lineWidth = 1.5;
		for (let x = -2000; x < 4000; x += 60) {
			ctx.beginPath();
			ctx.moveTo(x, floorTopY);
			ctx.lineTo(x, floorTopY + thickness);
			ctx.stroke();
		}
	},
	puppy: (ctx, floorTopY, visibleW, visibleH, thickness) => {
		// Backyard Floor: Rich green grass patch
		ctx.fillStyle = "#4caf50"; 
		ctx.fillRect(-2000, floorTopY, 6000, thickness);

		// Sprinkle textured grass blades
		ctx.strokeStyle = "#388e3c";
		ctx.lineWidth = 2;
		for (let x = -2000; x < 4000; x += 40) {
			const bladeH = 6 + (Math.abs(x) % 5);
			ctx.beginPath();
			ctx.moveTo(x, floorTopY);
			ctx.lineTo(x - 2, floorTopY - bladeH);
			ctx.stroke();
		}
	},
	spider: (ctx, floorTopY, visibleW, visibleH, thickness) => {
		// Dirt Floor: Rough textured dark brown ground
		ctx.fillStyle = "#5c4033"; 
		ctx.fillRect(-2000, floorTopY, 6000, thickness);

		// Add tiny pebbles/specks for detail
		ctx.fillStyle = "#4a3228";
		for (let i = -2000; i < 4000; i += 35) {
			let speckY = floorTopY + 5 + (Math.abs(i * 7) % (thickness - 40));
			ctx.fillRect(i, speckY, 3, 3);
		}
	},
	goldfish: (ctx, floorTopY, visibleW, visibleH, thickness) => {
		// Sand Floor: Soft underwater ocean sand with a subtle top gradient
		let sandGrad = ctx.createLinearGradient(0, floorTopY, 0, floorTopY + thickness);
		sandGrad.addColorStop(0, "#f2da91"); 
		sandGrad.addColorStop(1, "#dfc26d"); 
		
		ctx.fillStyle = sandGrad;
		ctx.fillRect(-2000, floorTopY, 6000, thickness);
	}
};
// ============================================================================
// SECTION 1B: CORE ENGINE PRESETS & PALETTES (Outside the Class)
// ============================================================================
const WIDGET_DEFAULT_BOUNDS = { left: "20px", top: "302px", width: "274px", height: "197px" };

const PET_SPECIES = ["kitty", "puppy", "spider", "goldfish"];
const KITTY_COLORS = ["#E67E22", "#95A5A6", "#2C3E50", "#ECF0F1", "#BDC3C7", "#D35400"];
const PUPPY_COLORS = ["#D2B48C", "#8B4513", "#F5DEB3", "#3E2723", "#FFF8DC", "#795548"];
const SPIDER_COLORS = ["#1A1A1A", "#3A1A1A", "#1A3A1A", "#2E1C47", "#004D40", "#424242"];
const GOLDFISH_COLORS = ["#FF5722", "#FF9800", "#FFC107", "#E91E63", "#FF3D00", "#FFFFFF"];
const BED_PRESETS = ["#e74c3c", "#3498db", "#2ecc71", "#f1c40f", "#9b59b6", "#e67e22", "#ffffff", "#333333"];

const HUNGER_TICK_MS = 144000; 
const BASE_FLOOR_Y = 110;

// Factory function to cleanly generate a fresh, unpolluted profile registry matrix
function createDefaultPetRegistry() {
    return {
        activeSpecies: "kitty",
        profiles: {
            kitty: {
                name: "Greta", isDead: false, birthday: Date.now(), ageDays: 0, stage: "Baby", exp: 0, hunger: 0, digestive: 0,
                lastHungerTick: Date.now(), poops: [],
                color: KITTY_COLORS[Math.floor(Math.random() * KITTY_COLORS.length)]
            },
            puppy: {
                name: "Barnaby", isDead: false, birthday: Date.now(), ageDays: 0, stage: "Baby", exp: 0, hunger: 0, digestive: 0,
                lastHungerTick: Date.now(), poops: [],
                color: PUPPY_COLORS[Math.floor(Math.random() * PUPPY_COLORS.length)]
            },
            spider: {
                name: "Webster", isDead: false, birthday: Date.now(), ageDays: 0, stage: "Baby", exp: 0, hunger: 0, digestive: 0,
                lastHungerTick: Date.now(), poops: [],
                color: SPIDER_COLORS[Math.floor(Math.random() * SPIDER_COLORS.length)]
            },
            goldfish: {
                name: "Bubbles", isDead: false, birthday: Date.now(), ageDays: 0, stage: "Baby", exp: 0, hunger: 0, digestive: 0,
                lastHungerTick: Date.now(), poops: [],
                color: GOLDFISH_COLORS[Math.floor(Math.random() * GOLDFISH_COLORS.length)]
            }
        }
    };
}

// Factory function to isolate the massive default runtime tracking object
function createDefaultState() {
    return {
        hideBorder: false, hideStatus: false, hideNameplate: false, hideBackground: false,
		hideFloor: true,
        originalPos: { x: 0, y: 0 },
        tummylimit: 11, nyanTimer: 0, nyanPhase: "takeoff",
        x: 200, y: window.innerHeight - 150, facing: 1,
        action: "idle", actionTimer: 300, animT: 0,
        hasFood: false, particles: [], overrideColor: null, paintBalloons: [], zoom: -2,
        spiderWebs: [], goldfishBubbles: [], puppyBones: [],
        layout: {
            nameX: 10, nameY: 1, statsX: 66, statsY: 5, bedX: 8, bedY: 94, bowlX: 89, bowlY: 97,
            litterX: 22, litterY: 91, towerX: 10, towerY: 89, showTower: true, bedColor: "#3498db"
        }
    };
}


// ============================================================================
// MAIN EXPORT CLASS
export class StreamPet {
	constructor() {
        console.log("🐾 [Pet Widget]: Initializing Core Ecosystem...");
        
        // 1. Core DOM Validation & Sizing Injection
        const overlayWrapper = document.getElementById("overlay-wrapper");
        if (!overlayWrapper) {
            console.error("❌ [Pet Widget Error]: #overlay-wrapper element not found in DOM.");
            return;
        }

        const savedBounds = localStorage.getItem("greta_widget_bounds");
        this.widgetBounds = savedBounds ? JSON.parse(savedBounds) : WIDGET_DEFAULT_BOUNDS;

        if (!document.getElementById("pet-widget")) {
            this.injectWidgetViewport(overlayWrapper);
        }

        // 2. Extract Native Contexts
        this.widgetContainer = document.getElementById("pet-widget");
        this.canvas = document.getElementById("companionCanvas");
        this.ctx = this.canvas.getContext("2d");

        // 3. Map Static Runtime Scalars (Safely referenced throughout your logic)
        this.PET_SPECIES = PET_SPECIES;
        this.KITTY_COLORS = KITTY_COLORS;
        this.PUPPY_COLORS = PUPPY_COLORS;
        this.SPIDER_COLORS = SPIDER_COLORS;
        this.GOLDFISH_COLORS = GOLDFISH_COLORS;
        this.BED_PRESETS = BED_PRESETS;
        this.HUNGER_TICK_MS = HUNGER_TICK_MS; 
        this.BASE_FLOOR_Y = BASE_FLOOR_Y;

        // 4. Generate Initial Data Frameworks (Overwritten seamlessly when loadData() fires)
        this.registry = createDefaultPetRegistry();
        this.state = createDefaultState();
        this.state.commandAccess = this.getDefaultCommandMatrix();

        // 5. Initialize Sub-Engines & Hardware Hooks
        // this.initAudioEngine();
		this.petAudio('init');
        this.injectUI();
        this.resizePetWidget();
        
        // 6. Memory De-serialization & Execution Loops
        this.loadData(); // This instantly overwrites the default structures above with your active save file
        
        this.initPetPlacement();
        this.renderControlPanel();
        
        this.saveInterval = setInterval(() => this.saveData(), 5000);
        this.animate = this.animate.bind(this);
        // this.animate();

        this.animationFrameId = requestAnimationFrame(this.animate);
		
		
		this.initContainerListeners(); 
        this.bindUIEventListeners();
    }

	destroyWidget() {
		console.log("⚠️ [Pet Widget]: Initiating ecosystem tear-down sequence...");
		// ========================================================
		// ⏰ BLOCK 1: ENGINE LOOPS & MECHANICAL TIMERS
		// ========================================================
		{
			if (this.animationFrameId) {
				cancelAnimationFrame(this.animationFrameId);
				this.animationFrameId = null;
			}
			if (this.saveInterval) {
				clearInterval(this.saveInterval);
				this.saveInterval = null;
			}
			if (this.bubbleTimeout) {
				clearTimeout(this.bubbleTimeout);
				this.bubbleTimeout = null;
			}
			if (this.explodeStage1Timeout) {
				clearTimeout(this.explodeStage1Timeout);
				this.explodeStage1Timeout = null;
			}
			if (this.explodeStage2Timeout) {
				clearTimeout(this.explodeStage2Timeout);
				this.explodeStage2Timeout = null;
			}
			console.log("   -> [Teardown]: Core loop engine and async timers defused.");
		}

		// ========================================================
		// 🔊 BLOCK 2: HARDWARE AUDIO ENGINE MUTING & BUFFER PURGE
		// ========================================================
		{
			// Fire the command router's internal teardown logic
			this.petAudio('destroy');

			if (window.soundSettings) {
				delete window.soundSettings;
			}
			console.log("   -> [Teardown]: Hardware audio channels silenced and purged via router.");
		}

		// ========================================================
		// 🛠️ BLOCK 3: CONTROL PANEL & WINDOW EVENT LISTENERS
		// ========================================================
		{
			const zoomSlider = document.getElementById("canvasZoom");
			if (zoomSlider && this._boundZoomHandler) {
				zoomSlider.removeEventListener("input", this._boundZoomHandler);
				this._boundZoomHandler = null;
			}
			if (this._boundResizeHandler) {
				window.removeEventListener('resizePetWidget', this._boundResizeHandler);
				this._boundResizeHandler = null;
			}
			if (this._boundGlobalClickCloser) {
				document.removeEventListener('click', this._boundGlobalClickCloser);
				this._boundGlobalClickCloser = null;
			}
			if (this.containerObserver) {
				this.containerObserver.disconnect();
				this.containerObserver = null;
			}
			console.log("   -> [Teardown]: Hardware input handlers and DOM observers unhooked.");
		}

		// ========================================================
		// 🧹 BLOCK 4: DOM INTERFACE DESTRUCTION
		// ========================================================
		{
			const optionsEl = document.getElementById("speciesSelectOptions");
			if (optionsEl) optionsEl.innerHTML = "";

			const controlPanel = document.getElementById("pet-widget-controls");
			if (controlPanel && controlPanel.parentNode) {
				controlPanel.parentNode.removeChild(controlPanel);
			}

			if (this.widgetContainer && this.widgetContainer.parentNode) {
				this.widgetContainer.parentNode.removeChild(this.widgetContainer);
			}
			console.log("   -> [Teardown]: UI Viewports and Control Panel elements deleted.");
		}

		// ========================================================
		// 🗑️ BLOCK 5: GC POINTER NULLIFICATION
		// ========================================================
		{
			this.canvas = null;
			this.ctx = null;
			this.widgetContainer = null;
			this.controlsContainer = null;
			console.log("✅ [Pet Widget]: Teardown complete. All core nodes cleared from memory.");
		}
	}
	injectWidgetViewport(overlayWrapper) {
        const petViewport = document.createElement("div");
        petViewport.id = "pet-widget";
        petViewport.classList.add("p8-widget");
        petViewport.style.zIndex = "101";
        petViewport.style.position = "absolute";
        
        // Apply persistent window coordinates instantly to avoid snapping frames
        petViewport.style.left = this.widgetBounds.left;
        petViewport.style.top = this.widgetBounds.top;
        petViewport.style.width = this.widgetBounds.width;
        petViewport.style.height = this.widgetBounds.height;

        petViewport.innerHTML = `
            <div id="bubble" class="chat-bubble"></div>
            <div id="nameplate">Loading...</div>
            <canvas id="companionCanvas"></canvas>
            <div id="status">❤️ Loading... | EXP 0</div>
        `;
        
        overlayWrapper.appendChild(petViewport);
        console.log("🐾 [Pet Widget]: Viewport DOM elements injected into overlay-wrapper.");
    }

    static get controlsTemplate() {
        const layoutMetrics = [
            ["name", "Nameplate X/Y", 50, 70, 0, 100],
            ["stats", "Stats X/Y", 50, 90, 0, 100],
            ["bed", "Cat/Dog Bed X/Y", 20, 100, 0, 100],     
            ["bowl", "Food Bowl X/Y", 45, 100, 0, 100],   
            ["litter", "Litter Box X/Y", 90, 100, 0, 100], 
            ["tower", "Tower / Castle X/Y", 70, 100, 0, 100]        
        ];

        const audioTracks = [
            { key: "meowSound", label: "😺 Standard Meow" },
            { key: "mewSound", label: "😾 Baby Mew" },
            { key: "purrSound", label: "💤 Content Purr" },
            { key: "barkSound", label: "🐕 Puppy Bark" },
            { key: "whineSound", label: "🥺 Puppy Whine" },
            { key: "clickSound", label: "🕷️ Spider Click" },
            { key: "bubbleSound", label: "🐟 Fish Bubble" },
            { key: "nyanSound", label: "🌈 Space Nyan Theme Loop" },
			{ key: "petsplatSound", label: "💥 Pet Explosion Splat" }
        ];

        return `
            <div class="collapsible-header" onclick="this.parentElement.classList.toggle('collapsed')">
				<span>🐾 Interactive Multi-Pet Companion Module</span>
				<span class="collapse-icon">▼</span>
			</div>
			<div class="collapsible-content">
				<div style="display: flex; flex-direction: column; gap: 12px;">
					
					<div style="background: #141414; padding: 10px; border-radius: 6px; border: 1px solid #27272a; display: flex; flex-direction: column; gap: 6px;">
						<label style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px; font-weight: bold;">Select Companion Species</label>
						
						<div style="position: relative; width: 100%;">
							<div id="speciesSelectDisplay" class="p8-input" style="background: #1c1c1f; border: 1px solid #3f3f46; color: #fff; height: 32px; line-height: 30px; padding: 0 8px; font-size: 12px; border-radius: 4px; width: 100%; cursor: pointer; box-sizing: border-box;">
								🐈 Kitty (Feline Engine v10)
							</div>
							
							<div id="speciesSelectOptions" class="custom-select-options-box" style="display: none; position: absolute; top: 34px; left: 0; width: 100%; background: #1c1c1f; border: 1px solid #3f3f46; border-radius: 4px; z-index: 1000; max-height: 200px; overflow-y: auto; box-sizing: border-box;">
								</div>
						</div>
					</div>

					<div style="background: #111114; border: 1px solid #27272a; border-radius: 6px; padding: 10px; display: flex; flex-direction: column; gap: 12px;">
						<div style="background: #141414; padding: 10px; border-radius: 6px; border: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
							<label style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px;">Identity Parameters</label>
							<input type="text" id="nameInput" class="p8-input" placeholder="Pet Name (e.g., Greta)" style="background: #1c1c1f; border: 1px solid #3f3f46; color: #fff; height: 28px; padding: 0 8px; font-size: 12px; border-radius: 4px;">
						</div>

						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
							<button type="button" id="btnFeed" class="p8-btn" style="padding: 6px 0; background: #1e3a8a; border: 1px solid #3b82f6; font-size: 11px;">🐟 DISPENSE FOOD</button>
							<button type="button" id="btnTreat" class="p8-btn" style="padding: 6px 0; background: #7c2d12; border: 1px solid #ea580c; font-size: 11px;">🍗 GIVE TREAT</button>
							<button type="button" id="btnPlay" class="p8-btn" style="padding: 6px 0; background: #581c87; border: 1px solid #a855f7; font-size: 11px;">🧶 COMPANION PLAY</button>
							<button type="button" id="btnDance" class="p8-btn" style="padding: 6px 0; background: #065f46; border: 1px solid #10b981; font-size: 11px;">✨ LIVE DANCE</button>
						</div>

						<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px;">
							<button type="button" id="btnClear" class="p8-btn alt-btn" style="padding: 6px 0; background: #27272a; font-size: 11px;">🧹 CLEAN ENVIRONMENT</button>
							<button type="button" id="btnRevive" class="p8-btn" style="padding: 6px 0; background: #991b1b; font-size: 11px;">💖 REVIVE PET</button>
						</div>

                        <div id="kittyContextNotes" class="species-note" style="font-size:11px; color:#a1a1aa; background:#18181b; padding:8px; border-radius:4px; border-left:3px solid #e67e22;">
                            <strong>Kitty Active:</strong> Enabled climbing updates for the Cat Tower, litter-box target tracking, and audio meow nodes.
                        </div>
                        <div id="puppyContextNotes" class="species-note" style="font-size:11px; color:#a1a1aa; background:#18181b; padding:8px; border-radius:4px; border-left:3px solid #d2b48c; display:none;">
                            <strong>Puppy Active:</strong> Canine engine tracks tail animations, active bone generation points, and dynamic ground friction parameters.
                        </div>
                        <div id="spiderContextNotes" class="species-note" style="font-size:11px; color:#a1a1aa; background:#18181b; padding:8px; border-radius:4px; border-left:3px solid #9c27b0; display:none;">
                            <strong>Spider Active:</strong> Inverting standard gravity matrix. Spider paths directly along roof layers and injects geometric web nets.
                        </div>
                        <div id="goldfishContextNotes" class="species-note" style="font-size:11px; color:#a1a1aa; background:#18181b; padding:8px; border-radius:4px; border-left:3px solid #2196f3; display:none;">
                            <strong>Goldfish Active:</strong> Floats viewport container parameters inside hydrodynamic swimming bounds. Disables standard walking algorithms.
                        </div>

						<details style="border: 1px solid #27272a; border-radius: 6px; background: #18181b;">
							<summary style="padding: 8px 10px; cursor: pointer; font-weight: bold; font-size: 12px; color: #fff; outline: none;">📐 Layout & Environment Settings</summary>
							<div style="padding: 10px; border-top: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
								<div style="display: flex; flex-direction: column; gap: 4px; padding-bottom: 8px; border-bottom: 1px solid #27272a;">
									<div style="display: flex; justify-content: space-between; font-size: 11px; color: #a1a1aa;">
										<span>Canvas Zoom Scaling</span>
										<span id="zoomValue" style="color: #0ec3c3; font-weight: bold;">1.0x</span>
									</div>
									<input type="range" id="canvasZoom" min="-2" max="2" step="0.1" value="0" style="width: 100%;">
								</div>
								<div style="background: #141414; padding: 10px; border-radius: 6px; border: 1px solid #27272a; display: flex; flex-direction: column; gap: 8px;">
									<div style="display: flex; justify-content: space-between; align-items: center;">
										<label style="font-size: 11px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.5px;">Max Tummy Capacity</label>
										<span id="tummyLimitValue" style="color: #ea580c; font-weight: bold; font-size: 12px;">5</span>
									</div>
									<input type="range" id="tummyLimitRange" min="1" max="15" value="5" style="width: 100%;">
								</div>
								<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
									<span>Hide Outer Border</span>
									<input type="checkbox" id="hideBorderToggle">
								</div>
								<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
									<span>Hide Background</span>
									<input type="checkbox" id="hideBackgroundToggle">
								</div>
								<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
									<span>Hide Environment Floor</span>
									<input type="checkbox" id="hideFloorToggle">
								</div>
								<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
									<span>Hide Status Text</span>
									<input type="checkbox" id="hideStatusToggle">
								</div>
								<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
									<span>Hide Nameplate Text</span>
									<input type="checkbox" id="hideNameplateToggle">
								</div>
								<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
									<span>Show Props/Tower</span>
									<input type="checkbox" id="showTower" checked>
								</div>
								<div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px;">
									<span style="font-size: 11px; color: #a1a1aa;">Bed Fabric Accent Color:</span>
									<div id="bedColorSwatches" style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 2px;"></div>
								</div>
								<div style="display: grid; grid-template-columns: 100px 1fr; gap: 6px; align-items: center; font-size: 11px; color: #a1a1aa;">
									${layoutMetrics.map(([id, label, xVal, yVal, minY, maxY]) => `
										<span>${label}</span>
										<div style="display: flex; flex-direction:column; gap: 4px;">
											<input type="range" id="${id}X" min="0" max="100" value="${xVal}" style="width:100%;">
											<input type="range" id="${id}Y" min="${minY}" max="${maxY}" value="${yVal}" style="width:100%;">
										</div>
									`).join('')}
								</div>
							</div>
						</details>
					</div>

					<details style="border: 1px solid #27272a; border-radius: 6px; background: #18181b;">
						<summary style="padding: 8px 10px; cursor: pointer; font-weight: bold; font-size: 12px; color: #fff; outline: none;">🔊 Audio Configurations</summary>
						<div style="padding: 10px; border-top: 1px solid #27272a; display: flex; flex-direction: column; gap: 10px;">
							<div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 6px; border-bottom: 1px solid #27272a;">
								<span style="font-size: 11px; color: #a1a1aa; font-weight: bold;">Master Audio Engine</span>
								<input type="checkbox" id="masterEnabled" checked>
							</div>
							<div style="display: flex; flex-direction: column; gap: 6px;">
								${audioTracks.map(({ key, label }) => `
									<div class="setting-row" data-key="${key}" style="display: flex; flex-direction: column; gap: 4px; background: #141414; padding: 6px; border-radius: 4px;">
										<div style="display: flex; justify-content: space-between; align-items: center;">
											<span style="font-size: 11px; color: #fff;">${label}</span>
											<input type="checkbox" checked>
										</div>
										<div style="display: flex; gap: 4px;">
											<button type="button" class="file-btn p8-btn alt-btn" style="flex: 1; padding: 2px 0; font-size: 10px;">Upload Audio</button>
											<button type="button" class="test-btn p8-btn" style="width: 40px; padding: 2px 0; font-size: 10px; background: #27272a;">▶</button>
											<input type="file" class="hidden-file-input" accept="audio/*" style="display: none;">
										</div>
									</div>
								`).join('')}
							</div>
						</div>
					</details>
					<details style="border: 1px solid #27272a; border-radius: 6px; background: #18181b; margin-top: 5px;">
						<summary style="padding: 8px 10px; cursor: pointer; font-weight: bold; font-size: 12px; color: #fff; outline: none;">🛠️ Live Command Router Matrix</summary>
						<div class="pet-matrix-container-target" style="padding: 10px; border-top: 1px solid #27272a; display: flex; flex-direction: column; gap: 4px;">
							</div>
					</details>
					<button type="button" id="btnReset" class="p8-btn" style="background: #991b1b; padding: 6px 0; font-size: 11px; margin-top: 5px;">⚠️ FACTORY RESET DATA</button>
				</div>
			</div>
        `;
    }

// ==========================================
// SECTION 2:some setup and bs
// ==========================================
    resizePetWidget() {
        if (!this.widgetContainer || !this.canvas) return;
        this.canvas.width = this.widgetContainer.clientWidth;
        this.canvas.height = this.widgetContainer.clientHeight;
        this.ctx.imageSmoothingEnabled = false;
    }
// ===============================================
// SECTION 3: UI ASSEMBLY synchronization, TEMPLATES & BINDINGS
// ===============================================
	injectUI() {
        const wrapper = document.getElementById("widget-control-wrapper");
        if (!wrapper) {
            console.warn("⚠️ [Pet Widget]: #widget-control-wrapper not found. Skipping UI injection.");
            return;
        }

        // Check if the outer panel skeleton already exists
        let petSection = document.getElementById("pet-widget-controls");
        
        if (!petSection) {
            petSection = document.createElement("div");
            petSection.id = "pet-widget-controls";
            petSection.className = "collapsible-section collapsed";
            petSection.innerHTML = StreamPet.controlsTemplate;

            const entropiaBox = document.getElementById("entropia-widget-controls");
            if (entropiaBox && entropiaBox.nextSibling) {
                wrapper.insertBefore(petSection, entropiaBox.nextSibling);
            } else {
                wrapper.appendChild(petSection);
            }
            console.log("🐾 [Pet Widget]: Global Multi-Pet Interface Injected.");
        }

        this.controlsContainer = petSection.querySelector('.pet-matrix-container-target') || petSection;
    }
	renderControlPanel() {
		if (!this.controlsContainer) return;

		// Clean, compact dark matrix matching #18181b aesthetics
		let html = `
			<p style="font-size: 11px; color: #a1a1aa; margin-bottom: 8px; line-height: 1.3;">
				Toggle interaction methods or fire a manual trigger to test animations and behaviors instantly.
			</p>
			<div class="matrix-table" style="width: 100%; font-family: sans-serif; font-size: 11px; display: flex; flex-direction: column; gap: 3px;">
				<div class="matrix-header" style="display: flex; font-weight: bold; padding: 4px 6px; background: #141414; border-radius: 4px; color: #a1a1aa; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">
					<div style="flex: 1.8;">Command Core</div>
					<div style="flex: 1; text-align: center;">💬 Chat</div>
					<div style="flex: 1; text-align: center;">🎁 Reward</div>
					<div style="flex: 0.8; text-align: center;">⚡ Test</div>
				</div>
		`;

		// 👇 FILTER OUT ADMINISTRATIVE / METADATA UTILITIES FROM CLUTTERING THE UI
		const hiddenCommands = ['help', 'rewards', 'clear', 'species', 'hidepet', 'showpet', 'togglepet'];

		Object.keys(this.state.commandAccess).forEach(cmd => {
			if (hiddenCommands.includes(cmd)) return; // Skip rendering these rows!

			const config = this.state.commandAccess[cmd];
			html += `
				<div class="matrix-row" style="display: flex; padding: 6px; background: #141414; border-radius: 4px; align-items: center;">
					<div style="flex: 1.8; font-weight: bold; text-transform: capitalize; color: #fff;">${cmd}</div>
					<div style="flex: 1; text-align: center; display: flex; justify-content: center;">
						<input type="checkbox" data-cmd="${cmd}" data-type="chat" ${config.chat ? 'checked' : ''} class="matrix-toggle" style="cursor: pointer; accent-color: #3498db; width: 14px; height: 14px; margin: 0;">
					</div>
					<div style="flex: 1; text-align: center; display: flex; justify-content: center;">
						<input type="checkbox" data-cmd="${cmd}" data-type="cp" ${config.cp ? 'checked' : ''} class="matrix-toggle" style="cursor: pointer; accent-color: #3498db; width: 14px; height: 14px; margin: 0;">
					</div>
					<div style="flex: 0.8; text-align: center; display: flex; justify-content: center;">
						<button data-cmd="${cmd}" class="matrix-test-btn" style="cursor: pointer; background: #27272a; color: #3498db; border: 1px solid #3f3f46; border-radius: 4px; font-size: 10px; padding: 2px 8px; display: flex; align-items: center; justify-content: center; transition: all 0.2s ease; height: 20px; min-width: 28px;" onmouseover="this.style.background='#3f3f46'; this.style.color='#fff';" onmouseout="this.style.background='#27272a'; this.style.color='#3498db';">
							▶
						</button>
					</div>
				</div>
			`;
		});

		html += `</div>`;
		
		this.controlsContainer.innerHTML = html;
		this.bindMatrixListeners();
	}
    applyEditModeStyles() {
        const el = document.getElementById("pet-widget");
        if (!el) return;
        if (document.body.classList.contains('edit-mode')) {
            el.style.pointerEvents = "auto"; 
        }
    }
    applyVisibilityStates() {
        if (this.widgetContainer) {
			if (this.state.hideWidget === true) {
				this.widgetContainer.style.display = 'none';
			} else {
				this.widgetContainer.style.display = 'block';
			}
            if (this.state.hideBorder) {
                this.widgetContainer.style.border = "none";
                this.widgetContainer.style.boxShadow = "none";
            } else {
                this.widgetContainer.style.border = "";
                this.widgetContainer.style.boxShadow = "";
            }

            if (this.state.hideBackground) {
                this.widgetContainer.style.setProperty("background", "transparent", "important");
            } else {
                this.widgetContainer.style.background = ""; 
            }
        }

        const statusEl = document.getElementById("status");
        if (statusEl) statusEl.style.display = this.state.hideStatus ? "none" : "block";
        
        const nameplateEl = document.getElementById("nameplate");
        if (nameplateEl) nameplateEl.style.display = this.state.hideNameplate ? "none" : "block";
    }
	updateUI() {
		const nameEl = document.getElementById("nameplate");
		const statsEl = document.getElementById("status");
		if(!nameEl || !statsEl) return;
		
		nameEl.style.left = this.state.layout.nameX + "%"; 
		nameEl.style.top = this.state.layout.nameY + "%";
		statsEl.style.left = this.state.layout.statsX + "%"; 
		statsEl.style.top = this.state.layout.statsY + "%";
		
		let sTxt = this.activePet.isDead ? "DECEASED" : (this.activePet.poops.length > 5 ? "SICK" : "HEALTHY");
		// statsEl.innerHTML = `${this.registry.activeSpecies.charAt(0).toUpperCase() + this.registry.activeSpecies.slice(1)} | Age: ${this.activePet.ageDays}d | Hunger: ${this.activePet.hunger}%<br>Status: ${sTxt} | EXP: ${this.activePet.exp}`;
		statsEl.innerHTML = `${this.registry.activeSpecies.charAt(0).toUpperCase() + this.registry.activeSpecies.slice(1)} | Age: ${this.activePet.ageDays}d | Hunger: ${this.activePet.hunger}%<br>Status: ${sTxt} [${this.state.action || 'idle'}] | EXP: ${this.activePet.exp}`;
		nameEl.textContent = this.activePet.isDead ? `${this.activePet.name.toUpperCase()}'S GHOST` : this.activePet.name.toUpperCase();
		
		// Dynamic Form Option Label Management
		const propLabel = document.querySelector('label[for="showTower"]') || document.getElementById("showTower")?.previousElementSibling;
		if (propLabel) {
			if (this.registry.activeSpecies === "puppy") propLabel.textContent = "Show Doghouse";
			else if (this.registry.activeSpecies === "goldfish") propLabel.textContent = "Show Castle/Coral";
			else propLabel.textContent = "Show Cat Tower";
		}

		// NEW: Dynamic Multi-Species Potty Label Swap
		const litterLabel = Array.from(document.querySelectorAll('span')).find(el => el.textContent.includes("Litter Box"));
		if (litterLabel) {
			litterLabel.textContent = (this.registry.activeSpecies === "puppy") ? "Grass Patch X/Y" : "Litter Box X/Y";
		}
	}

// ===============================================
// SECTION 4: listeners and BINDINGS
// ===============================================
    initSwatches() {
        const swatchContainer = document.getElementById("bedColorSwatches");
        if (!swatchContainer) return;
        swatchContainer.innerHTML = ""; 
        this.BED_PRESETS.forEach(color => {
            const btn = document.createElement("div");
            btn.className = "swatch" + (this.state.layout.bedColor === color ? " active" : "");
            btn.style.backgroundColor = color;
            btn.style.width = "20px";
            btn.style.height = "20px";
            btn.style.borderRadius = "4px";
            btn.style.cursor = "pointer";
            btn.style.border = this.state.layout.bedColor === color ? "2px solid #fff" : "1px solid #333";
            
            btn.addEventListener("click", () => {
                this.state.layout.bedColor = color;
                document.querySelectorAll(".swatch").forEach(s => s.style.border = "1px solid #333");
                btn.style.border = "2px solid #fff";
                this.petSpeechBubble("Comfy! ✨");
            });
            swatchContainer.appendChild(btn);
        });
    }

	initContainerListeners() {
		if (!this.widgetContainer) return;

		// Attach the observer to 'this' so the class retains a handle on it
		this.containerObserver = new MutationObserver((mutations) => {
			this.widgetBounds = {
				left: this.widgetContainer.style.left,
				top: this.widgetContainer.style.top,
				width: this.widgetContainer.style.width,
				height: this.widgetContainer.style.height
			};
			localStorage.setItem("greta_widget_bounds", JSON.stringify(this.widgetBounds));
			this.resizePetWidget(); 
		});

		this.containerObserver.observe(this.widgetContainer, { 
			attributes: true, 
			attributeFilter: ["style"] 
		});
		console.log("🐾 [Pet Widget]: Mutation Observer locked onto layout style mutations.");
	}

	bindMatrixListeners() {
		if (!this.controlsContainer) return;
		
		// Wire up the configuration access checkboxes
		this.controlsContainer.querySelectorAll('.matrix-toggle').forEach(checkbox => {
			checkbox.addEventListener('change', (e) => {
				const cmd = e.target.getAttribute('data-cmd');
				const type = e.target.getAttribute('data-type'); 
				const isChecked = e.target.checked;
				
				if (this.state.commandAccess && this.state.commandAccess[cmd]) {
					this.state.commandAccess[cmd][type] = isChecked;
					this.saveData(); 
					console.log(`[Config Router]: Updated "${cmd}" -> Access Mode [${type.toUpperCase()}]: ${isChecked}`);
				}
			});
		});

		// Wire up the "Play" test trigger buttons
		this.controlsContainer.querySelectorAll('.matrix-test-btn').forEach(button => {
			button.addEventListener('click', (e) => {
				// Find target element handling nested icon clicks safely
				const btn = e.target.closest('.matrix-test-btn');
				const cmd = btn.getAttribute('data-cmd');
				
				console.log(`[Test Simulator]: Locating routing handles for payload trigger: !pet ${cmd}`);

				// Fetch the executable routing layout from the framework
				if (typeof this.getCommands === 'function') {
					const commandSuite = this.getCommands((notice) => console.log(`[Simulated Response]: ${notice}`));
					const petCommand = commandSuite.find(c => c.name === 'pet');

					if (petCommand && typeof petCommand.execute === 'function') {
						// Simulate execution framework flags bypassing standard chat restrictions
						const simulatedFlags = {
							broadcaster: true,
							mod: false,
							isRewardSimulated: true // Simulates system-level permission clearance
						};
						
						// Route the core command text straight into the system engine
						petCommand.execute('BroadcasterUI', cmd, simulatedFlags);
					}
				}
			});
		});
	}

    bindUIEventListeners() {
		 window.addEventListener('resizePetWidget', () => this.resizePetWidget());
        // Looks for a button with id="exportPetSettings" anywhere in your HTML/UI engine
        const exportBtn = document.getElementById("exportPetSettings");
			if (exportBtn) {
				exportBtn.addEventListener("click", () => {
					// Calls the copy routine. If your environment uses a notify alert, pass it here
					this.exportSettingsToClipboard();
				});
				console.log("🔗 [Pet Widget]: Export Settings event listener attached to UI button.");
			}

        const bindClick = (id, callback) => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('click', callback);
        };

        const sliders = ["nameX", "nameY", "statsX", "statsY", "bedX", "bedY", "bowlX", "bowlY", "litterX", "litterY", "towerX", "towerY"];
        sliders.forEach(id => {
            const el = document.getElementById(id);
            if(el) el.addEventListener("input", (e) => this.state.layout[id] = parseInt(e.target.value));
        });

        // Identity rename tracking bound specifically to active isolated memory profile slot
        const nameIn = document.getElementById("nameInput");
        if (nameIn) {
            nameIn.addEventListener("input", (e) => {
                this.activePet.name = e.target.value || "Companion";
            });
        }
		const tummySlider = document.getElementById("tummyLimitRange");
		if (tummySlider) {
			tummySlider.addEventListener("input", (e) => {
				const val = parseInt(e.target.value);
				this.setTummyLimit(val);
				const display = document.getElementById("tummyLimitValue");
				if (display) display.innerText = val;
			});
		}
		const speciesOptions = [
            "🐈 Kitty (Feline Engine v10)",
            "🐕 Puppy (Canine Kinematics Engine)",
            "🕷️ Spider (Arachnid Procedural Pathing)",
            "🐟 Goldfish (Aquatic Fluid Physics)"
        ];
		setupCustomDropdownEngine("speciesSelectDisplay", "speciesSelectOptions", speciesOptions, (selectedText) => {
            let chosenSpecies = "kitty";
            if (selectedText.includes("Puppy")) chosenSpecies = "puppy";
            if (selectedText.includes("Spider")) chosenSpecies = "spider";
            if (selectedText.includes("Goldfish")) chosenSpecies = "goldfish";

            // Set the new species pointer
            this.registry.activeSpecies = chosenSpecies;
            
            // Re-sync name interface field value dynamically to reflect current animal
            if (nameIn) nameIn.value = this.activePet.name;

            // ⭐ FIX: Instead of old, floating hardcoded logic, call the snap positioning system 
            this.initPetPlacement();

            this.syncSpeciesInterfaceToggle();
            this.saveData();
            this.petSpeechBubble(`Swapped to ${this.activePet.name}!`);
        });

        document.addEventListener("click", () => {
            document.querySelectorAll(".custom-select-options-box").forEach(box => {
                box.style.display = "none";
            });
        });

        const zoomSlider = document.getElementById("canvasZoom");
        const zoomDisplay = document.getElementById("zoomValue");
        if (zoomSlider) {
            zoomSlider.addEventListener("input", (e) => {
                const val = parseFloat(e.target.value);
                this.state.zoom = val;
                if (zoomDisplay) zoomDisplay.textContent = `${val.toFixed(1)}x`;
            });
            zoomSlider.addEventListener("change", () => this.saveData());
        }

        const borderToggle = document.getElementById("hideBorderToggle");
        if (borderToggle) {
            borderToggle.addEventListener("change", (e) => {
                this.state.hideBorder = e.target.checked;
                this.applyVisibilityStates(); 
                this.saveData();
            });
        }

        const hideBGCheck = document.getElementById("hideBackgroundToggle");
        if (hideBGCheck) {
            hideBGCheck.addEventListener("change", (e) => {
                this.state.hideBackground = e.target.checked;
                this.applyVisibilityStates();
                this.saveData();
            });
        }

        const statusToggle = document.getElementById("hideStatusToggle");
        if (statusToggle) {
            statusToggle.addEventListener("change", (e) => {
                this.state.hideStatus = e.target.checked;
                this.applyVisibilityStates();
                this.saveData();
            });
        }

        const NameplateToggle = document.getElementById("hideNameplateToggle");
        if (NameplateToggle) {
            NameplateToggle.addEventListener("change", (e) => {
                this.state.hideNameplate = e.target.checked;
                this.applyVisibilityStates();
                this.saveData();
            });
        }

        const st = document.getElementById("showTower");
        if (st) st.addEventListener("change", (e) => {
            this.state.layout.showTower = e.target.checked;
            if(!this.state.layout.showTower && this.state.action.includes("tower")) this.state.action = "idle";
        });

        bindClick("btnFeed", () => { 
            if(!this.activePet.isDead && !this.state.hasFood) { 
                this.state.hasFood = true; 
                this.petSpeechBubble("Yum! Food dropped!"); 
            } 
        });
        bindClick("btnPlay", () => { if(!this.activePet.isDead) { this.state.action = "special"; this.state.actionTimer = 350; this.petSpeechBubble("Playing! ✨"); } });
        bindClick("btnDance", () => { if(!this.activePet.isDead) { this.state.action = "dance"; this.state.actionTimer = 300; this.petSpeechBubble("Dance! ✨"); } });
        bindClick("btnTreat", () => { if(!this.activePet.isDead) { this.activePet.hunger = Math.max(0, this.activePet.hunger - 5); this.state.action = "special"; this.state.actionTimer = 200; this.petSpeechBubble("NOM NOM! 🍗"); } });
        bindClick("btnClear", () => { 
            this.activePet.poops = []; 
            this.state.spiderWebs = [];
            this.state.goldfishBubbles = [];
            this.petSpeechBubble("Cleared and Scoured! 🧹"); 
        });
        bindClick("btnRevive", () => { this.revivePet(); });
        bindClick("btnReset", () => { 
            localStorage.removeItem("greta_widget_bounds");
            localStorage.removeItem("greta_ultra_v10"); 
            location.reload(); 
        });

        const masterToggle = document.getElementById("masterEnabled");
        if (masterToggle) {
            masterToggle.checked = window.soundSettings.masterEnabled;
            masterToggle.addEventListener("change", (e) => {
                window.soundSettings.masterEnabled = e.target.checked;
                localStorage.setItem('pixelkitty_sound_settings', JSON.stringify(window.soundSettings));
            });
        }

        document.querySelectorAll('.setting-row[data-key]').forEach(row => {
            const key = row.getAttribute('data-key');
            const checkbox = row.querySelector('input[type="checkbox"]');
            const fileBtn = row.querySelector('.file-btn');
            const fileInput = row.querySelector('.hidden-file-input');
            const testBtn = row.querySelector('.test-btn');

            if (checkbox) {
                checkbox.checked = window.soundSettings[key];
                checkbox.addEventListener('change', (e) => {
                    window.soundSettings[key] = e.target.checked;
                    localStorage.setItem('pixelkitty_sound_settings', JSON.stringify(window.soundSettings));
                });
            }

            if (fileBtn && fileInput) {
                fileBtn.addEventListener('click', () => fileInput.click());
                fileInput.addEventListener('change', (e) => {
                    const file = e.target.files[0];
                    if (file) {
                        const url = URL.createObjectURL(file);
                        window.soundSettings.customPaths[key] = url;
                        localStorage.setItem('pixelkitty_sound_settings', JSON.stringify(window.soundSettings));
                        // this.refreshAudioInstance(key);
						this.petAudio('refresh', key);
                        this.petSpeechBubble("Audio updated! 🎧");
                    }
                });
            }

            if (testBtn) {
                testBtn.addEventListener('click', () => this.petAudio('play', key));
            }
        });
    }

    syncSpeciesInterfaceToggle() {
        document.querySelectorAll(".species-note").forEach(el => el.style.display = "none");
        const currentNote = document.getElementById(`${this.registry.activeSpecies}ContextNotes`);
        if (currentNote) currentNote.style.display = "block";
    }

// ===============================================
// SECTION 5: pet system helpers
// ===============================================
	getPos(pctX, pctY, offY = 0) {
		// const containerW = this.widgetContainer.clientWidth;
		// const containerH = this.widgetContainer.clientHeight;
		const containerW = this.canvas.width;
		const containerH = this.canvas.height;
		
		// Calculate the logical 0-100% position
		const logicalX = (pctX / 100) * containerW;
		const logicalY = (pctY / 100) * containerH;

		// Adjust for the current zoom scale so the "visual" position is correct
		// This allows the slider to feel "locked" to the object's visual center
		const scaleVal = this.state.zoom >= 0 ? 1.0 + (this.state.zoom * 0.5) : 1.0 + (this.state.zoom * 0.25);
		
		const centerX = containerW / 2;
		const centerY = containerH - this.BASE_FLOOR_Y;

		// Inverse transform: This maps the logical position into the current zoomed view
		const finalX = centerX + (logicalX - centerX) / scaleVal;
		const finalY = centerY + (logicalY - centerY) / scaleVal;

		return { x: finalX, y: finalY + offY };
	}
	initPetPlacement() {
		if (!this.canvas) return;
		const visibleW = this.canvas.width;
		const visibleH = this.canvas.height;
		
		// Environment Edge Constraints
		const CEIL_Y = 30; 
		const FLOOR_Y = visibleH - this.BASE_FLOOR_Y;

		// 🛏️ Resolved coordinates based on canvas dimensions. 
		// The Zoom Engine (in animate()) will automatically apply scaling to these positions.
		const bedCoordinates = this.getPos(this.state.layout.bedX, this.state.layout.bedY);

		this.state.action = "idle";
		this.state.actionTimer = 200;

		if (this.registry.activeSpecies === "spider") {
			// Spiders drop directly above the bed's scaled X position on the roof
			this.state.x = bedCoordinates.x;
			this.state.y = CEIL_Y;
		} else if (this.registry.activeSpecies === "goldfish") {
			// Goldfish float in the mid-water horizon lane right over the bed's scaled X position
			this.state.x = bedCoordinates.x;
			this.state.y = visibleH / 2; 
		} else {
			// Terrestrial pets (Puppy, Kitty) land precisely on the scaled bed positions
			this.state.x = bedCoordinates.x;
			
			// If the bed is pushed all the way down to the floor, lock to true FLOOR_Y
			// Otherwise, use the dynamically scaled bed Y coordinate
			this.state.y = this.state.layout.bedY >= 100 ? FLOOR_Y : bedCoordinates.y;
		}

		// Cache the resolved matrix positions
		this.state.originalPos = { x: this.state.x, y: this.state.y };
		console.log(`🎯 [Pet Positioner]: Cleanly snapped ${this.registry.activeSpecies} to Bed with Zoom transformations accounted for.`);
	}
    // Sugar shorthand properties to easily get/set values inside the current isolated active pet data profile
    get activePet() {
        return this.registry.profiles[this.registry.activeSpecies];
    }
	setTummyLimit(newLimit) {
		this.state.tummylimit = parseInt(newLimit);
		console.log(`Tummy limit updated to: ${this.state.tummylimit}`);
		this.saveData(); // Assuming you have a persistence method
	}

// ===================================================
// SECTION 6: RENDER ENGINE, ANIMATION & AI PIPELINE
// ===================================================
	applyGravity(pet, ctx) {
		if (pet.registry.activeSpecies === "goldfish") return;

		// Check if the spider is currently using an airborne state
		const spiderIsClimbing = ["rappel_drop", "rappel_hang", "rappel_rise", "climbing_tower", "tower_sleep", "sleep"].includes(pet.state.action);
		
		// Check if the spider is safely sitting on a web node
		let isOnWeb = false;
		if (pet.registry.activeSpecies === "spider" && pet.state.spiderWebs) {
			isOnWeb = pet.state.spiderWebs.some(web => {
				let dx = web.x - pet.state.x;
				let dy = web.y - pet.state.y;
				return Math.sqrt(dx*dx + dy*dy) < web.size + 10;
			});
		}

		// If spider is climbing or on a web, freeze gravity!
		if (pet.registry.activeSpecies === "spider" && (spiderIsClimbing || isOnWeb)) {
			return; 
		}

		// Standard Gravity Engine (for Kitty, Puppy, and Free Spiders)
		const GROUND_CALIBRATION_OFFSET = -25; 
		const floorPos = this.getPos(0, 100).y + GROUND_CALIBRATION_OFFSET;

		if (pet.state.y < floorPos - 2) {
			pet.state.y += 2.5; 
		} else {
			pet.state.y = floorPos;
		}
	}
	drawEnvironment(tick) {
		const visibleW = this.canvas.width;
		const visibleH = this.canvas.height;
		const floorTopY = this.getPos(0, 100).y - 35;

		// ========================================================
		// PHASE 0: SPECIES-SPECIFIC FLOOR LAYER (BACKGROUND BASE)
		// ========================================================
		if (!this.state.hideFloor) { 
			this.drawPetFloor(floorTopY, visibleW, visibleH);
		}
		// ========================================================
		// PHASE 1: BACKGROUND / DECORATIVE OVERLAYS (FAR BACK)
		// ========================================================
		//if (this.registry.activeSpecies === "spider") {
			this.drawSpiderWebs();
			this.drawRappelStrand();
		//}
		// ========================================================
		// PHASE 2: LARGE STRUCTURE INTERIOR ENVIRONMENT (MIDGROUND)
		// ========================================================
		if (this.state.layout.showTower) {
			const towerPos = this.getPos(this.state.layout.towerX, this.state.layout.towerY);
			this.drawPetHouse(towerPos, tick);
		}
		// ========================================================
		// PHASE 3: PET BED INTERIOR FURNITURE (MIDGROUND FRONT)
		// ========================================================
		const bedPos = this.getPos(this.state.layout.bedX, this.state.layout.bedY);
		this.drawPetBed(bedPos, tick);
		// ========================================================
		// PHASE 4: POTTY BASE SANITARY MATRIX (MID BACK BACKGROUND)
		// ========================================================
		const litterPos = this.getPos(this.state.layout.litterX, this.state.layout.litterY);
		const boxW = 150;
		this.drawLitterBox(litterPos, boxW);
		this.drawWasteLayer(litterPos, boxW);
		// ========================================================
		// PHASE 5: INTERACTIVE CONSUMABLES LAYER (FOREGROUND EXTREME)
		// ========================================================
		const foodPos = this.getPos(this.state.layout.bowlX, this.state.layout.bowlY);
		this.drawFoodBowl(foodPos, tick);
		// ========================================================
		// PHASE 6: SCREEN ENGINE POST-PROCESSING & FX PASSES (FRONT)
		// ========================================================
		this.drawFishBubbles(tick);
		this.drawNyanTrail(tick, visibleH);
		this.drawPaintBalloons();
		this.updateAndDrawParticles();
	}
	updateAI(t) {
		// 1. GUARD CLAUSE: Freeze all AI activity immediately if exploding
		if (this.state.action === "bloating" || this.state.action === "explode") {
			if (this.state.actionTimer > 0) this.state.actionTimer--;
			return; 
		}
// ADD THIS: Define which actions are "grounded" vs "furniture/airborne"

		// 2. DATA ALLOCATION: Calculate frame layout coordinates and metrics
		const visibleW = this.canvas.width;
		const visibleH = this.canvas.height;
		const groundY = visibleH - this.BASE_FLOOR_Y;
		
		const bowlPos = this.getPos(this.state.layout.bowlX, this.state.layout.bowlY);
		const bedPos = this.getPos(this.state.layout.bedX, this.state.layout.bedY);
		const litPos = this.getPos(this.state.layout.litterX, this.state.layout.litterY);
		const towerPos = this.getPos(this.state.layout.towerX, this.state.layout.towerY);
		const CEIL_Y = 30; 
		const FLOOR_Y = visibleH - this.BASE_FLOOR_Y;
		const LEFT_X = 40;
		const RIGHT_X = visibleW - 40;
		const walkToPoint = (targetX, targetY, speed = 2) => this.walkToPoint(targetX, targetY, speed);
		
		const ctx = { t, visibleW, visibleH, groundY, bowlPos, bedPos, litPos, towerPos, CEIL_Y, FLOOR_Y, LEFT_X, RIGHT_X, walkToPoint };

		// 3. INTERNAL ENGINE UPDATES: Tick down clocks and run metabolism
		if (this.state.actionTimer > 0) this.state.actionTimer--;
		this.updatePetMetabolism();

		// 4. INTERRUPT MATRIX: Override normal behavior if food is present
		if (this.state.hasFood && !["nyan", "eating", "potty", "walk_to_litter", "rappel_drop", "rappel_hang", "rappel_rise"].includes(this.state.action)) {
			this.state.action = "walk_to_food";
		}
		// Define states that override gravity
		const isGrounded = ["idle", "walk", "walk_to_food", "walk_to_kick", "kicking", "scratching"];
		
		// Only run gravity if the action is one that should be grounded
		if (isGrounded.includes(this.state.action)) {
			this.applyGravity(this, ctx);
		}
		// 5. STATE EXECUTION: Run active state logic from the library
		if (PET_STATE_LIBRARY[this.state.action]) {
			PET_STATE_LIBRARY[this.state.action](this, ctx);
		}
	}
	animate = () => {
		this.state.animT++;
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.updateAI(this.state.animT);

		this.ctx.save();
		let rawSliderVal = (this.state.zoom === undefined) ? 0 : this.state.zoom;
		let scaleVal = rawSliderVal >= 0 ? 1.0 + (rawSliderVal * 0.5) : 1.0 + (rawSliderVal * 0.25);

		const anchorX = this.canvas.width / 2;
		const anchorY = this.canvas.height - this.BASE_FLOOR_Y;

		this.ctx.translate(anchorX, anchorY);
		this.ctx.scale(scaleVal, scaleVal);
		this.ctx.translate(-anchorX, -anchorY);

		this.drawEnvironment(this.state.animT);

		let petScale = (this.activePet.stage === "Baby") ? 0.6 : (this.activePet.stage === "Juvenile") ? 0.8 : 1.0;
		
		// ========================================================
		// RENDERING SPECIES DELEGATION ROUTER & EXPLOSION HANDLERS
		// ========================================================
		if (!this.state.hideMainSprite) {
			this.ctx.save();

			// Handle Stage 1: Swell up and violently shake the layout bounds
			if (this.state.action === "bloating") {
				petScale *= 1.35; // Expand dimensions dynamically during build-up
				const jitterX = (Math.random() - 0.5) * 5;
				const jitterY = (Math.random() - 0.5) * 5;
				this.ctx.translate(jitterX, jitterY);
			}

			if (this.registry.activeSpecies === "kitty") {
				this.drawKitty(this.state.animT, petScale);
			} else if (this.registry.activeSpecies === "puppy") {
				this.drawPuppy(this.state.animT, petScale);
			} else if (this.registry.activeSpecies === "spider") {
				this.drawSpider(this.state.animT, petScale);
			} else if (this.registry.activeSpecies === "goldfish") {
				this.drawFish(this.state.animT, petScale);
			}

			this.ctx.restore();

		}
		
		this.ctx.restore();
		this.updateUI();
		
		requestAnimationFrame(this.animate);
	}
	
// ==========================================
// Section 7: DRAWING PETS
// ==========================================
//
// KITTY DRAWING
//--------------------------------------------------
    drawkittyEars(x, y, color, sleeping) {
        this.ctx.fillStyle = color;
        if (sleeping) {
            this.ctx.beginPath(); this.ctx.moveTo(x - 15, y - 8); this.ctx.lineTo(x - 22, y + 2); this.ctx.lineTo(x - 5, y + 5); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.moveTo(x + 15, y - 8); this.ctx.lineTo(x + 22, y + 2); this.ctx.lineTo(x + 5, y + 5); this.ctx.fill();
        } else {
            this.ctx.beginPath(); this.ctx.moveTo(x - 20, y - 10); this.ctx.lineTo(x - 12, y - 40); this.ctx.lineTo(x - 2, y - 15); this.ctx.fill();
            this.ctx.beginPath(); this.ctx.moveTo(x + 20, y - 10); this.ctx.lineTo(x + 12, y - 40); this.ctx.lineTo(x + 2, y - 15); this.ctx.fill();
        }
    }
		drawkittyFace(x, y, begging, sleeping) {
			if (sleeping) {
				this.ctx.strokeStyle = "rgba(0,0,0,0.5)"; this.ctx.lineWidth = 2;
				this.ctx.beginPath(); this.ctx.arc(x - 7, y + 2, 5, 0.1 * Math.PI, 0.9 * Math.PI); this.ctx.stroke();
				this.ctx.beginPath(); this.ctx.arc(x + 9, y + 2, 5, 0.1 * Math.PI, 0.9 * Math.PI); this.ctx.stroke();
			} else {
				this.ctx.fillStyle = "white"; this.ctx.beginPath(); this.ctx.arc(x - 7, y - 5, 6, 0, Math.PI*2); this.ctx.arc(x + 9, y - 5, 6, 0, Math.PI*2); this.ctx.fill();
				this.ctx.fillStyle = "black"; this.ctx.beginPath(); this.ctx.arc(x - 6, y - 5, 2.5, 0, Math.PI*2); this.ctx.arc(x + 10, y - 5, 2.5, 0, Math.PI*2); this.ctx.fill();
			}
			this.ctx.strokeStyle = "rgba(255,255,255,0.4)"; this.ctx.lineWidth = 1;
			[0, 1, 2].forEach(i => {
			   this.ctx.beginPath(); this.ctx.moveTo(x+12, y+2*i); this.ctx.lineTo(x+30, y-8+8*i); this.ctx.stroke();
			   this.ctx.beginPath(); this.ctx.moveTo(x-10, y+2*i); this.ctx.lineTo(x-28, y-8+8*i); this.ctx.stroke();
			});
			this.ctx.fillStyle = "#ffaaaa";
			if (begging) { this.ctx.beginPath(); this.ctx.arc(x+1, y+8, 4, 0, Math.PI*2); this.ctx.fill(); }
			else { this.ctx.beginPath(); this.ctx.moveTo(x+1, y+3); this.ctx.lineTo(x-2, y); this.ctx.lineTo(x+4, y); this.ctx.fill(); }
		}
		drawKitty(t, scale) {
			this.ctx.save();
			
			// Check for teased state
			const isTeased = (this.state.action === "teased");
			
			const stateOffsets = { "sleep": 15, "tower_sleep": 15, "walk": 5, "idle": 0 };
			const baseOffset = stateOffsets[this.state.action] || 0;
			const bounce = (this.state.action === "dance") ? Math.abs(Math.sin(t * 0.2)) * 25 : 0;
			
			this.ctx.translate(this.state.x, this.state.y - bounce + baseOffset);
			this.ctx.scale(this.state.facing * scale, scale);
			
			this.ctx.fillStyle = "rgba(0,0,0,0.1)";
			this.ctx.beginPath(); this.ctx.ellipse(0, 30 + bounce - baseOffset, 45, 12, 0, 0, Math.PI*2); this.ctx.fill();

			let finalColor = this.activePet.isDead ? "#ffffff" : (this.activePet.poops.length > 5 ? "#8edb4b" : this.activePet.color);
			if(this.activePet.isDead) this.ctx.globalAlpha = 0.5;
			this.ctx.fillStyle = finalColor;

			if (this.state.action === "sleep" || this.state.action === "tower_sleep") {
				const breathing = Math.sin(t * 0.03) * 2.5;
				this.ctx.beginPath(); this.ctx.ellipse(0, 12, 42 + breathing, 32 + breathing, 0, 0, Math.PI * 2); this.ctx.fill();
				this.ctx.beginPath(); this.ctx.arc(15, 8, 22, 0, Math.PI*2); this.ctx.fill();
				this.ctx.beginPath(); this.ctx.lineWidth = 11; this.ctx.lineCap = "round"; this.ctx.strokeStyle = finalColor;
				this.ctx.arc(0, 18, 36, 0.5 * Math.PI, 1.4 * Math.PI); this.ctx.stroke();
				this.drawkittyEars(15, 8, finalColor, true); 
				this.drawkittyFace(15, 8, false, true);
			} else if (this.state.action === "special" || this.state.action === "scratching" || this.state.action === "trick") {
				if (this.state.action === "special") this.drawYarn(30, 20, t);
				let rot = (this.state.action === "trick") ? (t * 0.25) : 0;
				this.ctx.rotate(rot);

				this.ctx.beginPath(); this.ctx.ellipse(0, 0, 32, 42, 0, 0, Math.PI * 2); this.ctx.fill();
				this.ctx.beginPath(); this.ctx.arc(0, -45, 24, 0, Math.PI*2); this.ctx.fill();
				if (this.state.action === "special") {
					const reach = Math.sin(t * 0.2) * 15;
					this.ctx.fillRect(10, -5 + reach, 10, 15); this.ctx.fillRect(-20, -5 - reach, 10, 15);
				} else {
					this.ctx.fillRect(15, -25 + Math.sin(t*0.5)*5, 8, 15); this.ctx.fillRect(5, -35 + Math.sin(t*0.5)*5, 8, 15);
				}
				this.drawkittyEars(0, -45, finalColor, false); 
				// Pass isTeased here
				this.drawkittyFace(0, -45, false, false, isTeased);
			} else {
				this.ctx.beginPath(); this.ctx.ellipse(0, 0, 48, 30, 0, 0, Math.PI * 2); this.ctx.fill();
				this.ctx.beginPath(); this.ctx.arc(35, -15, 24, 0, Math.PI*2); this.ctx.fill();
				this.drawkittyEars(35, -15, finalColor, false);
				const walkCycle = (this.state.action.includes("walk")) ? Math.sin(t * 0.18) : 0;
				[[-35, 12], [-12, 12], [10, 12], [28, 12]].forEach((p, i) => {
					this.ctx.fillRect(p[0], p[1], 9, 16 + (i % 2 === 0 ? walkCycle : -walkCycle) * 8);
				});
				this.ctx.beginPath(); this.ctx.lineWidth = 8; this.ctx.lineCap = "round"; this.ctx.strokeStyle = finalColor;
				this.ctx.moveTo(-45, 0); this.ctx.bezierCurveTo(-65, 10, -80 + Math.sin(t * 0.06) * 18, -35, -60, -65); this.ctx.stroke();
				// Pass isTeased here
				this.drawkittyFace(35, -15, this.state.action === "beg", false, isTeased);
			}
			this.ctx.restore();
		}
// ==========================================

//  PUPPY DRAWING
//--------------------------------------------------
	// (mutt breed)
	drawPuppy(t, scale) {
		this.ctx.save();
		
		// 1. STATE LOGIC
		const isDancing = (this.state.action === "dance");
		const isTeased = (this.state.action === "teased");
		
		// If teased, add a rapid shake effect to the whole body
		const shake = isTeased ? Math.sin(t * 2) * 5 : 0;
		const wiggle = isDancing ? Math.sin(t * 0.4) * 0.2 : 0; 
		
		// Apply translation first
		this.ctx.translate(this.state.x + shake, this.state.y);
		
		// Apply the wiggle/shake rotation
		this.ctx.rotate(wiggle + (isTeased ? Math.sin(t) * 0.1 : 0));
		
		// Trick rotation (if applicable)
		let rotationAngle = (this.state.action === "trick") ? (t * 0.2) : 0;
		this.ctx.rotate(rotationAngle);
		
		this.ctx.scale(this.state.facing * scale, scale);

		// Ground shadow
		this.ctx.fillStyle = "rgba(0,0,0,0.1)";
		this.ctx.beginPath(); this.ctx.ellipse(0, 25, 48, 14, 0, 0, Math.PI*2); this.ctx.fill();

		let baseColor = this.activePet.isDead ? "#dddddd" : (this.activePet.poops.length > 5 ? "#a1d95d" : this.activePet.color);
		if(this.activePet.isDead) this.ctx.globalAlpha = 0.4;
		this.ctx.fillStyle = baseColor;

		if (this.state.action === "sleep" || this.state.action === "tower_sleep") {
			const breath = Math.sin(t * 0.04) * 2;
			this.ctx.beginPath(); this.ctx.ellipse(0, 10, 46 + breath, 34 + breath, 0, 0, Math.PI*2); this.ctx.fill();
			this.ctx.fillStyle = "#5d4037";
			this.ctx.beginPath(); this.ctx.arc(20, 14, 10, 0, Math.PI*2); this.ctx.fill();
		} else {
			this.ctx.beginPath(); this.ctx.ellipse(-5, 2, 45, 28, 0, 0, Math.PI*2); this.ctx.fill();
			this.ctx.beginPath(); this.ctx.arc(30, -22, 22, 0, Math.PI*2); this.ctx.fill();
			
			// Eyes (Change color to red if teased)
			this.ctx.fillStyle = isTeased ? "#ff0000" : "rgba(255,255,255,0.2)";
			this.ctx.beginPath(); this.ctx.ellipse(40, -18, 12, 9, 0, 0, Math.PI*2); this.ctx.fill();
			this.ctx.fillStyle = "black";
			this.ctx.beginPath(); this.ctx.arc(48, -20, 3, 0, Math.PI*2); this.ctx.fill();

			// Ears (If teased, draw them slightly more upright/alert)
			this.ctx.fillStyle = baseColor;
			const earAngle = isTeased ? -0.5 : 0.2;
			this.ctx.beginPath(); this.ctx.ellipse(22 + (isTeased ? 5 : 0), -24, 8, 18, earAngle, 0, Math.PI*2); this.ctx.fill();
			this.ctx.fillStyle = "#3e2723";
			this.ctx.beginPath(); this.ctx.ellipse(22 + (isTeased ? 5 : 0), -22, 5, 12, earAngle, 0, Math.PI*2); this.ctx.fill();

			this.ctx.fillStyle = "white";
			this.ctx.beginPath(); this.ctx.arc(34, -28, 5, 0, Math.PI*2); this.ctx.fill();
			this.ctx.fillStyle = "black";
			this.ctx.beginPath(); this.ctx.arc(36, -28, 2, 0, Math.PI*2); this.ctx.fill();

			// 2. TAIL WAG: Make it wag super fast during the dance!
			const wagSpeed = isDancing ? 1.5 : (this.state.action === "walk" || this.state.hasFood ? 0.6 : 0.2);
			const tailWag = Math.sin(t * wagSpeed) * 0.8 - 0.5;
			this.ctx.save();
			this.ctx.translate(-42, -5);
			this.ctx.rotate(tailWag);
			this.ctx.fillStyle = baseColor;
			this.ctx.fillRect(-22, -6, 24, 10);
			this.ctx.restore();

			// Legs
			const legSwing = (this.state.action === "walk") ? Math.sin(t * 0.22) * 10 : 0;
			this.ctx.fillStyle = baseColor;
			this.ctx.fillRect(-35, 15, 11, 16 + legSwing);
			this.ctx.fillRect(-15, 15, 11, 16 - legSwing);
			this.ctx.fillRect(10, 15, 11, 16 + legSwing);
			this.ctx.fillRect(25, 15, 11, 16 - legSwing);

			if (this.state.action === "special") this.drawYarn(40, 0, t);
		}
		this.ctx.restore();
	}
//  FISH DRAWING
//--------------------------------------------------
	drawFish(t, scale) {
		this.ctx.save();
		
		const isTeased = (this.state.action === "teased");
		
		// Frantic shaking when teased
		const shakeX = isTeased ? Math.sin(t * 0.8) * 10 : 0;
		const shakeY = isTeased ? Math.cos(t * 0.9) * 5 : 0;
		this.ctx.translate(this.state.x + shakeX, this.state.y + shakeY);

		if (this.state.action === "dance") {
			this.ctx.rotate(t * 0.2);
		}

		this.ctx.scale(this.state.facing * scale, scale);

		let fishColor = this.activePet.isDead ? "#e0e0e0" : this.activePet.color;
		if (this.activePet.isDead) {
			this.ctx.globalAlpha = 0.4;
			this.ctx.rotate(Math.PI);
		}
		this.ctx.fillStyle = fishColor;

		this.ctx.beginPath();
		this.ctx.ellipse(0, 0, 36, 22, 0, 0, Math.PI * 2);
		this.ctx.fill();

		const tailWiggle = Math.sin(t * (isTeased ? 0.6 : 0.28)) * (isTeased ? 25 : 12);
		this.ctx.beginPath();
		this.ctx.moveTo(-32, 0);
		this.ctx.bezierCurveTo(-55, -25 + tailWiggle, -65, -10 + tailWiggle, -58, tailWiggle);
		this.ctx.bezierCurveTo(-65, 10 + tailWiggle, -55, 25 + tailWiggle, -32, 0);
		this.ctx.fill();

		this.ctx.fillStyle = "rgba(255,255,255,0.3)";
		this.ctx.beginPath();
		this.ctx.moveTo(-32, 0);
		this.ctx.lineTo(-52, -15 + tailWiggle);
		this.ctx.lineTo(-50, 15 + tailWiggle);
		this.ctx.fill();

		this.ctx.fillStyle = fishColor;
		this.ctx.beginPath();
		this.ctx.moveTo(-10, -20);
		this.ctx.bezierCurveTo(-5, -38, -25, -32, -22, -14);
		this.ctx.fill();

		const finWave = Math.sin(t * (isTeased ? 0.4 : 0.12)) * (isTeased ? 20 : 8);
		this.ctx.save();
		this.ctx.translate(10, 8);
		this.ctx.rotate(finWave * Math.PI / 180);
		this.ctx.beginPath(); this.ctx.ellipse(0, 0, 14, 8, 0.5, 0, Math.PI * 2); this.ctx.fill();
		this.ctx.restore();

		// Angry eyes when teased
		this.ctx.fillStyle = isTeased ? "#ff0000" : "white";
		this.ctx.beginPath(); this.ctx.arc(20, -6, 7, 0, Math.PI * 2); this.ctx.fill();
		this.ctx.fillStyle = "black";
		this.ctx.beginPath(); this.ctx.arc(22, -6, 3.5, 0, Math.PI * 2); this.ctx.fill();

		if (this.state.action === "special") this.drawYarn(30, -5, t);

		this.ctx.restore();
	}
//  SPIDER DRAWING
//--------------------------------------------------
	drawSpider(t, scale) {
		this.ctx.save();
		
		const isTeased = (this.state.action === "teased");
		
		// Translation to position the spider (adds shake if teased)
		const shakeX = isTeased ? Math.sin(t * 0.5) * 8 : 0;
		this.ctx.translate(this.state.x + shakeX, this.state.y);

		// Apply "Dance" or "Teased" rotation
		if (this.state.action === "dance") {
			this.ctx.rotate(Math.sin(t * 0.5) * 0.5);
		} else if (isTeased) {
			this.ctx.rotate(Math.sin(t * 0.8) * 0.3);
		}

		this.ctx.scale(this.state.facing * scale, scale);

		let spiderColor = this.activePet.isDead ? "#777777" : this.activePet.color;
		if (this.activePet.isDead) this.ctx.globalAlpha = 0.3;
		this.ctx.fillStyle = spiderColor;
		this.ctx.strokeStyle = spiderColor;
		this.ctx.lineWidth = 3.5;

		// Web thread
		this.ctx.strokeStyle = "rgba(255,255,255,0.15)";
		this.ctx.lineWidth = 1;
		this.ctx.beginPath(); this.ctx.moveTo(0,0); this.ctx.lineTo(0, -this.state.y); this.ctx.stroke();

		this.ctx.fillStyle = spiderColor;
		this.ctx.strokeStyle = spiderColor;
		this.ctx.lineWidth = 3.5;

		this.ctx.beginPath(); this.ctx.arc(-16, 0, 18, 0, Math.PI*2); this.ctx.fill();
		this.ctx.beginPath(); this.ctx.arc(8, -2, 12, 0, Math.PI*2); this.ctx.fill();

		const isWalking = (this.state.action === "walk");
		const isDancing = (this.state.action === "dance");
		
		const legWave = isWalking ? Math.sin(t * 0.25) * 8 : (isDancing ? Math.sin(t * 0.8) * 20 : 0);
		
		for(let i = 0; i < 4; i++) {
			let offsetPhase = i * 0.4;
			// Legs move faster/erratically when teased
			let dynamicSwing = isWalking ? Math.sin(t * 0.22 + offsetPhase) * 12 : 
							   (isDancing ? Math.sin(t * 0.6 + offsetPhase) * 25 : (isTeased ? Math.sin(t * 1.5) * 15 : 0));

			this.ctx.beginPath();
			this.ctx.moveTo(0, -2);
			this.ctx.lineTo(-10 - (i*8), -24 - (Math.sin(t*0.1 + i)*4) + dynamicSwing);
			this.ctx.lineTo(-20 - (i*14), 18 + legWave);
			this.ctx.stroke();

			this.ctx.beginPath();
			this.ctx.moveTo(4, -2);
			this.ctx.lineTo(15 + (i*8), -22 - (Math.cos(t*0.1 + i)*4) - dynamicSwing);
			this.ctx.lineTo(24 + (i*14), 18 - legWave);
			this.ctx.stroke();
		}

		// Eyes: Pulse faster when teased
		this.ctx.fillStyle = this.activePet.isDead ? "black" : (isTeased ? "#ff00ff" : "#ff1744");
		let eyePulse = (isDancing || isTeased) ? Math.abs(Math.sin(t * (isTeased ? 0.5 : 0.2))) * 1.5 : 1;
		let eyeOffsets = [[12, -6], [16, -5], [14, -2], [18, -1], [10, -2], [14, 2]];
		eyeOffsets.forEach(pos => {
			this.ctx.beginPath(); this.ctx.arc(pos[0], pos[1], 1.5 * eyePulse, 0, Math.PI*2); this.ctx.fill();
		});

		if (this.state.action === "special") this.drawYarn(25, 10, t);

		this.ctx.restore();
	}


	drawPetFloor(floorTopY, visibleW, visibleH) {
		// A floor thickness of 300 gives it a deep 3D shelf dimension 
		// extending far below the canvas frame bounding limits
		const thickness = 400; 

		const species = this.registry.activeSpecies;

		if (PET_FLOOR_LIBRARY[species]) {
			this.ctx.save();
			// We do NOT call setTransform here. Stay inside the camera space!
			PET_FLOOR_LIBRARY[species](this.ctx, floorTopY, visibleW, visibleH, thickness);
			this.ctx.restore();
		}
	}
//===========================================
// Section 8: furniture & other static large objects
//===========================================

//------------------------------
// pet house drawing system
//------------------------------
	drawPetHouse(tPos, tick) {
		switch (this.registry.activeSpecies) {
			case "spider":
				this.drawSpiderNest(tPos, tick);
				break;
			case "goldfish":
				this.drawFishCastle(tPos, tick);
				break;
			case "puppy":
				this.drawDogHouse(tPos, tick);
				break;
			case "kitty":
			default:
				this.drawCatTower(tPos, tick);
				break;
		}
	}
	//------------------------------
		drawCatTower(tPos, tick) {
			// 1. Base Shadow
			this.ctx.fillStyle = "rgba(0,0,0,0.1)"; 
			this.ctx.fillRect(tPos.x - 60, tPos.y + 5, 120, 20); 

			// 2. Tower Base Plinth
			this.ctx.fillStyle = "#7f8c8d"; 
			this.ctx.fillRect(tPos.x - 55, tPos.y - 5, 110, 15); 

			// 3. Main Vertical Post (Sisal trunk)
			this.ctx.fillStyle = "#a67c52"; 
			this.ctx.fillRect(tPos.x - 10, tPos.y - 120, 20, 120); 

			// 4. Lower Mid-Platform
			this.ctx.fillStyle = "#95a5a6"; 
			this.ctx.fillRect(tPos.x - 40, tPos.y - 60, 80, 10); 

			// 5. Top Crowns Perch
			this.ctx.fillRect(tPos.x - 30, tPos.y - 125, 60, 10); 
		}
	//------------------------------
		drawDogHouse(tPos, tick) {
			this.ctx.save();
			// Base shadow
			this.ctx.fillStyle = "rgba(0,0,0,0.15)";
			this.ctx.fillRect(tPos.x - 55, tPos.y + 5, 110, 15);
			
			// Main Structure
			this.ctx.fillStyle = "#d7ccc8"; 
			this.ctx.fillRect(tPos.x - 45, tPos.y - 65, 90, 70);
			
			// Doorway
			this.ctx.fillStyle = "#3e2723"; 
			this.ctx.beginPath();
			this.ctx.arc(tPos.x, tPos.y - 25, 20, Math.PI, 0, false);
			this.ctx.fillRect(tPos.x - 20, tPos.y - 25, 40, 30);
			this.ctx.fill();
			
			// Roof Facade
			this.ctx.fillStyle = "#d7ccc8";
			this.ctx.beginPath();
			this.ctx.moveTo(tPos.x - 45, tPos.y - 65);
			this.ctx.lineTo(tPos.x, tPos.y - 95);
			this.ctx.lineTo(tPos.x + 45, tPos.y - 65);
			this.ctx.fill();
			
			// Roof Trim
			this.ctx.strokeStyle = "#d32f2f";
			this.ctx.lineWidth = 8;
			this.ctx.lineCap = "round";
			this.ctx.beginPath();
			this.ctx.moveTo(tPos.x - 55, tPos.y - 60);
			this.ctx.lineTo(tPos.x, tPos.y - 98);
			this.ctx.lineTo(tPos.x + 55, tPos.y - 60);
			this.ctx.stroke();
			this.ctx.restore();
		}
	//------------------------------
		drawFishCastle(tPos, tick) {
			// Main Keep
			this.ctx.fillStyle = "#ffb74d"; 
			this.ctx.fillRect(tPos.x - 40, tPos.y - 80, 80, 80);
			
			// Left & Right Spires
			this.ctx.fillStyle = "#e65100";
			this.ctx.fillRect(tPos.x - 50, tPos.y - 110, 30, 30);
			this.ctx.fillRect(tPos.x + 20, tPos.y - 110, 30, 30);
			
			// Gate Entrance
			this.ctx.fillStyle = "#4e342e"; 
			this.ctx.beginPath(); 
			this.ctx.arc(tPos.x, tPos.y, 20, Math.PI, 0, false); 
			this.ctx.fill();
		}
	//------------------------------
		drawSpiderNest(tPos, tick) {
			this.ctx.save();
			// Anchor structural cobweb down from ceiling at tower position x
			const nestX = tPos.x;
			const nestY = 65; // Suspended high ceiling nest line

			this.ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
			this.ctx.lineWidth = 1;

			// Draw supporting frame rays spanning outward and up to ceiling limits
			this.ctx.beginPath();
			for (let i = 0; i <= 8; i++) {
				let angle = Math.PI + (i / 8) * Math.PI; // Upward semi-circle grid
				this.ctx.moveTo(nestX, nestY);
				this.ctx.lineTo(nestX + Math.cos(angle) * 75, nestY + Math.sin(angle) * 45);
			}
			this.ctx.stroke();

			// Intersecting concentric orbit web strings
			for (let r = 15; r <= 65; r += 15) {
				this.ctx.beginPath();
				this.ctx.ellipse(nestX, nestY, r, r * 0.6, 0, Math.PI, Math.PI * 2);
				this.ctx.stroke();
			}

			// Draw central egg sac cocoon cocooned in the center
			this.ctx.fillStyle = "rgba(240, 240, 240, 0.85)";
			this.ctx.beginPath();
			this.ctx.ellipse(nestX, nestY + 5, 12, 18, 0, 0, Math.PI * 2);
			this.ctx.fill();
			this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
			this.ctx.stroke();
			this.ctx.restore();
		}
//-------------------------------------


//------------------------------
// pet beds
	drawPetBed(bPos, tick) {
		if (this.registry.activeSpecies === "spider") {
			// Structural radial support anchors for the web nest
			this.ctx.strokeStyle = "rgba(255,255,255,0.35)";
			this.ctx.lineWidth = 1;
			this.ctx.beginPath();
			for (let i = 0; i < 8; i++) {
				let angle = (i / 8) * Math.PI * 2;
				this.ctx.moveTo(bPos.x, bPos.y + 5);
				this.ctx.lineTo(bPos.x + Math.cos(angle) * 55, bPos.y + 5 + Math.sin(angle) * 18);
			}
			this.ctx.stroke();

			// Concentric horizontal web ring segments
			for (let r = 10; r <= 50; r += 12) {
				this.ctx.beginPath();
				this.ctx.ellipse(bPos.x, bPos.y + 5, r, r * 0.35, 0, 0, Math.PI * 2);
				this.ctx.stroke();
			}
		} else {
			// Grounding ambient drop shadow cushion
			this.ctx.fillStyle = "rgba(0,0,0,0.1)";
			this.ctx.beginPath(); 
			this.ctx.ellipse(bPos.x, bPos.y + 10, 70, 25, 0, 0, Math.PI * 2); 
			this.ctx.fill();
			
			// Main colored fabric bed core
			this.ctx.fillStyle = this.state.layout.bedColor;
			this.ctx.beginPath(); 
			this.ctx.ellipse(bPos.x, bPos.y + 5, 60, 20, 0, 0, Math.PI * 2); 
			this.ctx.fill();
		}
	}
//------------------------------
// food and bowl drawing
	drawFoodBowl(fPos, tick) {
		// Shadow base
		this.ctx.fillStyle = "rgba(0,0,0,0.2)"; 
		this.ctx.beginPath(); 
		this.ctx.ellipse(fPos.x, fPos.y + 5, 35, 10, 0, 0, Math.PI*2); 
		this.ctx.fill();

		// Outer Bowl rim
		this.ctx.fillStyle = "#ecf0f1"; 
		this.ctx.beginPath(); 
		this.ctx.ellipse(fPos.x, fPos.y, 32, 12, 0, 0, Math.PI*2); 
		this.ctx.fill();

		// Inner Bowl basin
		this.ctx.fillStyle = "#bdc3c7"; 
		this.ctx.beginPath(); 
		this.ctx.ellipse(fPos.x, fPos.y - 3, 30, 9, 0, 0, Math.PI*2); 
		this.ctx.fill();

		// Interactive food payload
		if (this.state.hasFood) {
			this.ctx.fillStyle = "#d35400"; 
			this.ctx.beginPath(); 
			this.ctx.ellipse(fPos.x, fPos.y - 4, 18, 5, 0, 0, Math.PI*2); 
			this.ctx.fill();
			
			this.ctx.font = "16px Arial";
			let foodIcon = "🐟";
			if (this.registry.activeSpecies === "puppy") foodIcon = "🍖";
			if (this.registry.activeSpecies === "spider") foodIcon = "🪰";
			if (this.registry.activeSpecies === "goldfish") foodIcon = "🍤";
			
			this.ctx.fillText(foodIcon, fPos.x - 8, fPos.y - 5);
		}
	}
//------------------------------
// litter box and poop drawing
	drawLitterBox(lPos, boxW) {
		// Only draw the litter box or grass patch if the pet is NOT a goldfish or spider
		if (this.registry.activeSpecies === "goldfish" || this.registry.activeSpecies === "spider") return;

		if (this.registry.activeSpecies === "puppy") {
			// Base Dirt Tray
			this.ctx.fillStyle = "#4e342e"; 
			this.ctx.fillRect(lPos.x - boxW/2, lPos.y + 2, boxW, 38);
			
			// Green Grass Mat
			this.ctx.fillStyle = "#2e7d32"; 
			this.ctx.fillRect(lPos.x - boxW/2 + 4, lPos.y + 4, boxW - 8, 32);
			
			// Procedural Grass Blades
			this.ctx.fillStyle = "#4caf50";
			for (let i = 0; i < 6; i++) {
				let bladeX = lPos.x - boxW/2 + 15 + (i * 22);
				this.ctx.fillRect(bladeX, lPos.y + 12 + (i % 3 * 4), 3, 10);
				this.ctx.fillRect(bladeX + 4, lPos.y + 16, 2, 6);
			}
			
			// Picket Fence Border Details
			this.ctx.fillStyle = "#f5f5f5";
			for(let p = 0; p <= boxW; p += 15) {
				this.ctx.fillRect(lPos.x - boxW/2 + p, lPos.y - 20, 4, 24); 
			}
			this.ctx.fillRect(lPos.x - boxW/2, lPos.y - 14, boxW, 4);   
			this.ctx.fillRect(lPos.x - boxW/2, lPos.y - 4, boxW, 4);    
		} else {
			// Standard Cat/Companion Plastic Litter Pan
			this.ctx.fillStyle = "rgba(0,0,0,0.2)"; 
			this.ctx.fillRect(lPos.x - boxW/2 + 5, lPos.y + 5, boxW, 40);
			this.ctx.fillStyle = "#2c3e50"; 
			this.ctx.fillRect(lPos.x - boxW/2, lPos.y, boxW, 40);
			this.ctx.fillStyle = "#95a5a6"; 
			this.ctx.fillRect(lPos.x - boxW/2 + 8, lPos.y + 4, boxW - 16, 30);
		}
	}
	drawWasteLayer(lPos, boxW) {
		this.activePet.poops.forEach(p => {
			if (this.registry.activeSpecies === "goldfish") {
				if (p.x === undefined) p.x = this.state.x;
				if (p.y === undefined) p.y = this.state.y;
				if (p.swimOffset === undefined) p.swimOffset = Math.random() * Math.PI * 2;

				// Float up naturally in aquarium water space
				p.y -= 0.2; 
				p.swimOffset += 0.03;
				let finalX = p.x + Math.sin(p.swimOffset) * 5;

				this.ctx.font = "14px Arial";
				this.ctx.fillText("💩", finalX, p.y);
			} else if (this.registry.activeSpecies === "spider") {
				// Spiders use architectural webs instead of standard floor assets
			} else {
				// Anchors standard waste to the litter pan coordinates layout
				let poopyY = p.isCeil ? 90 : lPos.y + 24;
				let poopyX = (lPos.x - boxW/2 + 20) + (p.ox || 0) % (boxW - 40);
				this.ctx.font = "14px Arial";
				this.ctx.fillText(p.isCeil ? "🕸️" : "💩", poopyX, poopyY);
			}
		});
	}


//=================================
// Section 9: PARTICALS AND TOP LAYER STUFF
//=================================
    drawSpiderWebs() {
		// Early exit guard: Only render background webs if the active species is a spider
		if (this.registry.activeSpecies !== "spider") return;
		this.state.spiderWebs.forEach(web => {
			this.ctx.strokeStyle = "rgba(255,255,255,0.28)";
			this.ctx.lineWidth = 1;
			this.ctx.beginPath();
			for(let i = 0; i < 8; i++) {
				let angle = (i / 8) * Math.PI * 2;
				this.ctx.moveTo(web.x, web.y);
				this.ctx.lineTo(web.x + Math.cos(angle) * web.size, web.y + Math.sin(angle) * web.size);
			}
			this.ctx.stroke();
		});
	}
	drawRappelStrand() {
		const isRappelling = ["rappel_drop", "rappel_hang", "rappel_rise"].includes(this.state.action);
		if (this.registry.activeSpecies !== "spider" || !isRappelling) return;

		this.ctx.strokeStyle = "rgba(255, 255, 255, 0.65)";
		this.ctx.lineWidth = 1.2;
		this.ctx.beginPath();
		
		// Connect line from ceiling anchor down to spider's live center position
		const anchorX = this.state.rappelAnchor ? this.state.rappelAnchor.x : this.state.x;
		this.ctx.moveTo(anchorX, 30); // Bound tightly to true CEIL_Y
		this.ctx.lineTo(this.state.x, this.state.y);
		this.ctx.stroke();
	}


    drawYarn(x, y, tick) {
        const roll = Math.sin(tick * 0.15) * 40;
        this.ctx.save();
        this.ctx.translate(x + roll, y);
        this.ctx.fillStyle = "rgba(0,0,0,0.1)";
        this.ctx.beginPath(); this.ctx.ellipse(0, 15, 15, 5, 0, 0, Math.PI*2); this.ctx.fill();
        
        let ballColor = "#e74c3c";
        if (this.registry.activeSpecies === "puppy") ballColor = "#ffeb3b"; // Tennis ball variant
        if (this.registry.activeSpecies === "spider") ballColor = "#9c27b0";
        
        this.ctx.fillStyle = ballColor;
        this.ctx.beginPath(); this.ctx.arc(0, 12, 12, 0, Math.PI*2); this.ctx.fill();
        this.ctx.strokeStyle = "rgba(0,0,0,0.2)";
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath(); this.ctx.arc(0, 0, 8, 0, Math.PI); this.ctx.stroke();
        this.ctx.restore();
    }
	drawPaintBalloons() {
		if (!this.state.paintBalloons || this.state.paintBalloons.length === 0) return;

		for (let i = this.state.paintBalloons.length - 1; i >= 0; i--) {
			let balloon = this.state.paintBalloons[i];

			balloon.x += balloon.vx;
			balloon.y += balloon.vy;

			this.ctx.save();
			this.ctx.fillStyle = balloon.color;
			this.ctx.beginPath();
			this.ctx.arc(balloon.x, balloon.y, balloon.radius, 0, Math.PI * 2);
			this.ctx.fill();
			this.ctx.strokeStyle = "#ffffff";
			this.ctx.lineWidth = 1.5;
			this.ctx.stroke();
			this.ctx.restore();

			const curDx = balloon.targetX - balloon.x;
			const curDy = balloon.targetY - balloon.y;
			const remainingDist = Math.sqrt(curDx * curDx + curDy * curDy);

			if (remainingDist < 10 || balloon.x < -50 || balloon.x > this.canvas.width + 50) {
				const reachedTarget = remainingDist < 15;

				if (balloon.isHit && reachedTarget) {
					this.state.overrideColor = balloon.color;
					
					if (this.activePet) {
						this.activePet.color = balloon.color;
					}
					
					this.petSpeechBubble("🎨 SPLATAFY!");
					this.petAudio('play', 'bubbleSound');
				} else if (reachedTarget) {
					this.petSpeechBubble("💨 MISSED!");
				}

				if (balloon.x >= -10 && balloon.x <= this.canvas.width + 10) {
					const particleCount = balloon.isHit ? 30 : 15;
					for (let p = 0; p < particleCount; p++) {
						this.state.particles.push({
							x: balloon.x,
							y: balloon.y,
							vx: (Math.random() - 0.5) * 8,
							vy: (Math.random() - 0.7) * 8,
							s: Math.random() * 3 + 2,
							c: balloon.color,
							life: Math.floor(Math.random() * 20) + 15
						});
					}
				}
				this.state.paintBalloons.splice(i, 1);
			}
		}
	}
	drawFishBubbles(tick) {
		if (this.registry.activeSpecies !== "goldfish") return;

		for (let i = this.state.goldfishBubbles.length - 1; i >= 0; i--) {
			let bubble = this.state.goldfishBubbles[i];
			
			bubble.y -= 1.2;
			bubble.x += Math.sin(tick * 0.05 + i) * 0.5;
			
			this.ctx.strokeStyle = `rgba(135, 206, 250, ${bubble.alpha})`;
			this.ctx.fillStyle = `rgba(173, 216, 230, ${bubble.alpha * 0.3})`;
			this.ctx.beginPath();
			this.ctx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
			this.ctx.fill();
			this.ctx.stroke();
			
			if (bubble.y < 50) {
				this.state.goldfishBubbles.splice(i, 1);
			}
		}
	}
	drawNyanTrail(tick, visibleH) {
		if (this.state.action !== "nyan") return;

		const colors = ["#ff0000", "#ff9900", "#ffff00", "#33ff00", "#0099ff", "#6633ff"];
		this.ctx.globalAlpha = this.state.nyanPhase === "flying" ? 1.0 : 0.4;
		
		for (let segment = 0; segment < 8; segment++) {
			const segOffset = segment * 35;
			const timeOffset = segment * 2;
			colors.forEach((col, i) => {
				this.ctx.fillStyle = col;
				const segY = (this.state.nyanPhase === "flying") ? (visibleH / 2) + Math.sin((t - timeOffset) * 0.1) * 100 : this.state.y; 
				const wiggle = Math.cos((tick - timeOffset) * 0.2 + i) * 5;
				this.ctx.fillRect(this.state.x - (this.state.facing * (60 + segOffset)), segY - 15 + (i * 6) + wiggle, 40, 6);
			});
		}
		this.ctx.globalAlpha = 1.0;
	}

    幕(txt) {} // Catch invalid encoding safely
	petSpeechBubble(txt) {
		const b = document.getElementById("bubble");
		if (!b) return;
		
		// 1. CLEAR PREVIOUS TIMEOUTS (Instance property AND element state memory)
		if (this.bubbleTimeout) {
			clearTimeout(this.bubbleTimeout);
			this.bubbleTimeout = null;
		}
		if (b.dataset.timeoutId) {
			clearTimeout(parseInt(b.dataset.timeoutId, 10));
		}

		// 2. INJECT CONTENT & POSITION METRICS
		b.textContent = txt; 
		b.style.left = (this.state.x - 50) + "px"; 
		b.style.top = (this.state.y - 200) + "px";
		b.style.opacity = "0.8";
		b.classList.add("show"); 

		// 3. SPECIES-SPECIFIC ROUTING AUDIO ENGINES
		if (txt.includes("Meow") || txt.includes("Kitty")) this.petAudio('play', 'meowSound');
		if (txt.includes("Mew")) this.petAudio('play', 'mewSound');
		if (txt.includes("Purrr") || txt.includes("Comfy")) this.petAudio('play', 'purrSound');
		if (txt.includes("BARK") || txt.includes("FETCH")) this.petAudio('play', 'barkSound');
		if (txt.includes("Hungry") && this.registry.activeSpecies === "puppy") this.petAudio('play', 'whineSound');
		if (txt.includes("SPIN") || (this.registry.activeSpecies === "spider" && Math.random() < 0.3)) this.petAudio('play', 'clickSound');
		if (txt.includes("LOOP") || txt.includes("FLAKES") || this.registry.activeSpecies === "goldfish") this.petAudio('play', 'bubbleSound');

		// 4. PERSIST TIMEOUT ID BOTH ON CLASS AND DOM ELEMENT DATASET
		const clearBubbleId = setTimeout(() => {
			b.classList.remove("show");
			// Clear out references cleanly once expired
			if (this.bubbleTimeout === clearBubbleId) this.bubbleTimeout = null;
			b.removeAttribute('data-timeout-id');
		}, 3000);

		this.bubbleTimeout = clearBubbleId;
		b.dataset.timeoutId = clearBubbleId;
	}
//=================================
// individual updates and stuff
//=================================
	updateAndDrawParticles() {
		for (let i = this.state.particles.length - 1; i >= 0; i--) {
			const p = this.state.particles[i];
			this.ctx.save();
			
			const isHeavyChunk = p.s > 5;
			this.ctx.fillStyle = p.c;
			this.ctx.globalAlpha = p.life < 30 ? p.life / 30 : 1.0;
			
			if (isHeavyChunk) {
				this.ctx.fillRect(p.x, p.y, p.s, p.s);
				this.ctx.strokeStyle = "#1a0000";
				this.ctx.lineWidth = 1;
				this.ctx.strokeRect(p.x, p.y, p.s, p.s);
			} else {
				this.ctx.fillRect(p.x, p.y, p.s, p.s);
			}
			this.ctx.restore();

			p.x += p.vx;
			p.y += p.vy;
			p.vy += isHeavyChunk ? 0.22 : 0.35;
			
			if (isHeavyChunk) {
				p.vx *= 0.985;
			}

			p.life--;
			if (p.life <= 0) {
				this.state.particles.splice(i, 1);
			}
		}
	}
	walkToPoint(targetX, targetY, speed = 2) {
		const dx = targetX - this.state.x; 
		const dy = targetY - this.state.y;
		const dist = Math.sqrt(dx * dx + dy * dy);
		if (dist > 12) {
			this.state.facing = dx > 0 ? 1 : -1;
			this.state.x += (dx / dist) * speed; 
			this.state.y += (dy / dist) * speed;
			return false;
		}
		return true;
	}
	updatePetMetabolism() {
		if (this.activePet.isDead) return;
		
		// 1. Calculate age levels and growth stages
		this.activePet.ageDays = Math.floor((Date.now() - this.activePet.birthday) / 86400000);
		this.activePet.stage = this.activePet.ageDays < 2 ? "Baby" : this.activePet.ageDays < 5 ? "Juvenile" : "Adult";

		// 2. Compute progressive metabolic hunger decay
		const now = Date.now();
		const msElapsed = now - this.activePet.lastHungerTick;
		if (msElapsed >= this.HUNGER_TICK_MS) {
			this.activePet.hunger = Math.min(100, this.activePet.hunger + Math.floor(msElapsed / this.HUNGER_TICK_MS)); 
			this.activePet.lastHungerTick = now - (msElapsed % this.HUNGER_TICK_MS);
		}
		
		// 3. Check for absolute starvation state
		if (this.activePet.hunger === 100) this.activePet.isDead = true;
	}



// ==========================================
// SECTION 10: pet functions & triggers etc
// ==========================================

    triggerNyan() {
        if (this.activePet.isDead || this.state.action === "nyan") return;
        this.state.originalPos = { x: this.state.x, y: this.state.y };
        this.state.action = "nyan";
        this.state.nyanPhase = "takeoff";
        this.state.actionTimer = 400;
        this.petAudio('play', 'nyanSound');
        this.petSpeechBubble("NYAN OVERDRIVE ACTIVATED! 🌈");
    }
	triggerPaintBomb(colorString, isHit) {
        if (this.state.action === "dead" || this.state.action === "explode" || this.state.action === "bloating") return;

        this.petSpeechBubble("🎈 INCOMING!!");
        this.petAudio('play', 'clickSound'); // Fits the tactical trigger sound

        // 1. Spawning trajectory setups
        const spawnFromLeft = Math.random() > 0.5;
        const startX = spawnFromLeft ? -30 : this.canvas.width + 30;
        const startY = Math.random() * (this.canvas.height - 80) + 40;

        // 2. Visual target placement offsets based on hit check
        let finalTargetX = this.state.x;
        let finalTargetY = this.state.y - 15;

        if (!isHit) {
            // Miss calculation: offset target horizontally and vertically to miss the pet sprite container entirely
            const missDirectionX = Math.random() > 0.5 ? 1 : -1;
            finalTargetX = this.state.x + (missDirectionX * (55 + Math.random() * 40));
            finalTargetY = this.state.y - (40 + Math.random() * 40);
        }

        const dx = finalTargetX - startX;
        const dy = finalTargetY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const travelVelocity = 8; // Projectile speed constant

        this.state.paintBalloons.push({
            x: startX,
            y: startY,
            vx: (dx / distance) * travelVelocity,
            vy: (dy / distance) * travelVelocity,
            color: colorString,
            isHit: isHit,
            targetX: finalTargetX,
            targetY: finalTargetY,
            radius: 9,
            distanceLeft: distance
        });
    }
	explodePet() {
        if (this.state.action === "bloating" || this.state.action === "dead") return;

        // 🛑 STAGE 1: BLOATING
        this.state.action = "bloating"; 
        this.state.hideMainSprite = false; // Still visible while expanding
        this.stopSound('nyanSound');
        this.petSpeechBubble("🤢 BLECH...");

        setTimeout(() => {
            // 💥 STAGE 2: THE DETONATION
			
            this.state.action = "explode";
            this.state.hideMainSprite = true; // 🌟 POP! Delete the main body instantly here
			this.petAudio('play', 'petsplatSound');
            this.petSpeechBubble("💥 SPLAT!");
            
            // Spray gore particles and body chunks from the vacant origin point
            const numParticles = 80;
            for (let i = 0; i < numParticles; i++) {
                const isChunk = Math.random() > 0.75;
                this.state.particles.push({
                    x: this.state.x, 
                    y: this.state.y - 20, 
                    vx: (Math.random() - 0.5) * 16,
                    vy: (Math.random() - 0.7) * 18, 
                    s: isChunk ? 6 + Math.random() * 6 : 2 + Math.random() * 4, 
                    c: isChunk ? "#5c0000" : "#8b0000", 
                    life: isChunk ? 120 + Math.random() * 60 : 60 + Math.random() * 40
                });
            }

            // 👻 STAGE 3: THE SPIRIT RISES (2 seconds of empty space later)
            setTimeout(() => {
                this.activePet.isDead = true;
                this.activePet.hunger = 100;
                
                this.state.isGhost = true; 
                this.state.hideMainSprite = false; // 🌟 Bring back visibility so the Ghost can be seen!
                this.state.action = "walk"; 
                this.petSpeechBubble("👻 OoooOoo...");
                
                this.saveData();

            }, 2000); // Time spent as empty space with flying debris

        }, 3200); // Bloat duration
    }
	teasePet() {
		if (this.activePet.isDead) return;

		// Set the action to 'teased' (you might need to add this case in your animate loop)
		this.state.action = "teased";
		this.state.actionTimer = 150; // How long they stay "teased"

		switch (this.registry.activeSpecies) {
			case "kitty":
			case "puppy":
				this.petSpeechBubble("Hey! That's mean! 😾");
				break;
			case "spider":
			case "goldfish":
				this.petSpeechBubble("Stop tapping the glass! 🫧");
				break;
		}
	}
	revivePet() {
		if (this.activePet.isDead) {
			this.activePet.isDead = false;
			this.activePet.hunger = 50; 
			this.state.action = "special";
			this.state.actionTimer = 200;
			this.activePet.lastHungerTick = Date.now();
			
			// --- Carcass Cleanup ---
			this.state.showCarcass = false;
			this.state.particles = [];
			this.petSpeechBubble("I'M ALIVE! 💖");
			this.saveData();
			
			for(let i=0; i<20; i++) {
				this.state.particles.push({
					x: this.state.x, 
					y: this.state.y, 
					vx: (Math.random() - 0.5) * 10, 
					vy: (Math.random() - 0.5) * 10, 
					s: 4, 
					c: "#ff77aa", 
					life: 40
				});
			}
		} else {
			this.petSpeechBubble("Already healthy! ✨");
		}
	}


// ==========================================
// SECTION 11: CHAT COMMAND ROUTER
// ==========================================
	getDefaultCommandMatrix() {
		return {
			feed:      { chat: true,  cp: true },
			play:      { chat: true,  cp: true },
			dance:     { chat: true,  cp: false },
			treat:     { chat: false, cp: true }, 
			trick:     { chat: true,  cp: false },
			status:    { chat: true,  cp: false },
			tease:     { chat: true,  cp: true },
			paintbomb: { chat: true,  cp: true }, // Added once here safely
			revive:    { chat: true,  cp: true }, 
			help:      { chat: true,  cp: false }, 
			rewards:   { chat: true,  cp: false }, 
			nyan:      { chat: true,  cp: true },  
			clear:     { chat: true,  cp: true },  
			species:   { chat: true,  cp: true },  
			hidepet:   { chat: true,  cp: true },  
			showpet:   { chat: true,  cp: true },  
			togglepet: { chat: true,  cp: true }   
		};
	}

	getCommands(sendNotice) {
		// =========================================================================
		// 🗺️ THE MASTER ALIAS DICTIONARY (Single source of truth for syntax mapping)
		// =========================================================================
		const aliasMap = {
			// User Help & Info
			'help':      { core: 'help',      admin: false },
			'h':         { core: 'help',      admin: false },
			'rewards':   { core: 'rewards',   admin: true },

			// Simulation Triggers
			'tease':           { core: 'tease',     admin: false },
			'tease pet':       { core: 'tease',     admin: false }, 
			'pulltail':        { core: 'tease',     admin: false }, 
			'pull tail':       { core: 'tease',     admin: false }, 
			'pull pets tail':  { core: 'tease',     admin: false },
			'tapglass':        { core: 'tease',     admin: false }, 
			'tap glass':       { core: 'tease',     admin: false },

			'feed':      { core: 'feed',      admin: false }, 
			'feed pet':  { core: 'feed',      admin: false }, 
			'food':      { core: 'feed',      admin: false }, 
			'fish':      { core: 'feed',      admin: false }, 
			'meat':      { core: 'feed',      admin: false }, 
			'bugs':      { core: 'feed',      admin: false }, 
			'flakes':    { core: 'feed',      admin: false },

			'play':      { core: 'play',      admin: false }, 
			'yarn':      { core: 'play',      admin: false }, 
			'ball':      { core: 'play',      admin: false }, 
			'web':       { core: 'play',      admin: false },

			'trick':     { core: 'trick',     admin: false },
			'dance':     { core: 'dance',     admin: false },
			'treat':     { core: 'treat',     admin: false }, 
			'nom':       { core: 'treat',     admin: false },
			'status':    { core: 'status',    admin: false }, 
			'stats':     { core: 'status',    admin: false },

			'paintbomb': { core: 'paintbomb', admin: false }, 
			'paint':     { core: 'paintbomb', admin: false }, 
			'bomb':      { core: 'paintbomb', admin: false }, 
			'splat':     { core: 'paintbomb', admin: false },

			// Administrator Routing Protocols
			'nyan':               { core: 'nyan',      admin: true }, 
			'rainbow':            { core: 'nyan',      admin: true },
			'revive':             { core: 'revive',    admin: false }, // Access matrix filters this instead of hardcoding
			'revive pet':         { core: 'revive',    admin: false }, 
			'revive active pet':  { core: 'revive',    admin: false },
			'clear':              { core: 'clear',     admin: false }, 
			'clean':              { core: 'clear',     admin: false },
			'species':            { core: 'species',   admin: true }, 
			'type':               { core: 'species',   admin: true },

			'hidepet':   { core: 'hidepet',   admin: true }, 
			'hide pet':  { core: 'hidepet',   admin: true }, 
			'hide':      { core: 'hidepet',   admin: true },
			'showpet':   { core: 'showpet',   admin: true }, 
			'show pet':  { core: 'showpet',   admin: true }, 
			'show':      { core: 'showpet',   admin: true },
			'togglepet': { core: 'togglepet', admin: true }, 
			'toggle pet':{ core: 'togglepet', admin: true }, 
			'toggle':    { core: 'togglepet', admin: true }
		};

		const petExecution = (user, message, flags) => {
			const incomingInput = message.trim().toLowerCase();
			const parts = incomingInput.split(/\s+/);
			const subCommand = parts[0];
			const isAdmin = flags ? (flags.broadcaster || flags.mod) : false;

			// Resolve input mapping configuration dynamically from master alias template
			const matchedMapping = aliasMap[incomingInput] || aliasMap[subCommand] || null;
			if (!matchedMapping) {
				sendNotice(`🐾 [Pet]: Option not recognized. Try: !pet [feed | play | dance | treat | status | trick]`);
				return;
			}

			const actualSub = matchedMapping.core;

			// =========================================================================
			// 🛑 HARDWARE FILTERS & SECURITY MATRIX GUARD ROUTER
			// =========================================================================
			if (this.state.commandAccess && this.state.commandAccess[actualSub]) {
				const config = this.state.commandAccess[actualSub];
				const isChannelPoint = !!(flags && (flags.customRewardId || flags.channelPointRedemption || flags.isRewardSimulated));
				const isChatMessage = !isChannelPoint;

				if (isChatMessage && !config.chat) return;

				if (isChannelPoint && !config.cp) {
					sendNotice(`❌ [Pet]: The "${incomingInput}" reward matrix is currently toggled off by the broadcaster.`);
					return;
				}
			}

			if (this.activePet.isDead && actualSub !== 'revive' && actualSub !== 'status') {
				sendNotice(`🪦 [Pet]: ${this.activePet.name} is currently deceased. Use !pet revive to save them!`);
				return;
			}

			// =========================================================================
			// 🎬 LOGICAL PROCESSING HUB (CLEAN ROUTING)
			// =========================================================================
			switch (actualSub) {
				case 'help':
					// Gather list of public user commands automatically using the defaults blueprint keys
					const availableCmds = Object.keys(this.getDefaultCommandMatrix()).filter(c => {
						const mapped = Object.values(aliasMap).find(m => m.core === c);
						return mapped ? !mapped.admin : true;
					});
					sendNotice(`🐾 [Pet Help]: Options: ${availableCmds.map(c => `!pet ${c}`).join(' | ')}`);
					if (isAdmin) sendNotice(`🛠️ [Admin]: !pet [nyan | revive | clear | species | rewards | hide | show | toggle]`);
					break;

				case 'rewards':
					if (!isAdmin) return;
					const groups = {};
					Object.entries(aliasMap).forEach(([trigger, data]) => {
						if (!groups[data.core]) groups[data.core] = [];
						groups[data.core].push(trigger);
					});

					sendNotice(`🎁 [Pet Reward Guide]: Create Twitch Channel Point Rewards with these exact names:`);
					if (groups['feed']) sendNotice(`   🍏 Feed Pet: ${groups['feed'].map(t => `"${t}"`).join(', ')}`);
					if (groups['tease']) sendNotice(`   😠 Tease Pet: ${groups['tease'].map(t => `"${t}"`).join(', ')}`);
					if (groups['play']) sendNotice(`   🥎 Play Pet: ${groups['play'].map(t => `"${t}"`).join(', ')}`);
					break;

				case 'hidepet':
					if (!isAdmin) return;
					if (this.widgetContainer) {
						this.widgetContainer.style.display = 'none';
						this.state.hideWidget = true;
						this.saveData();
						sendNotice(`🙈 [Pet]: ${this.activePet.name} has been hidden from the stream overlay.`);
					}
					break;

				case 'showpet':
					if (!isAdmin) return;
					if (this.widgetContainer) {
						this.widgetContainer.style.display = 'block';
						this.state.hideWidget = false;
						this.saveData();
						this.resizePetWidget();
						sendNotice(`👀 [Pet]: ${this.activePet.name} is back and visible!`);
					}
					break;

				case 'togglepet':
					if (!isAdmin) return;
					if (this.widgetContainer) {
						const isHidden = this.widgetContainer.style.display === 'none' || this.state.hideWidget;
						if (isHidden) {
							this.widgetContainer.style.display = 'block';
							this.state.hideWidget = false;
							this.resizePetWidget();
							sendNotice(`👀 [Pet]: Showing ${this.activePet.name}!`);
						} else {
							this.widgetContainer.style.display = 'none';
							this.state.hideWidget = true;
						}
						this.saveData();
					}
					break;

				case 'feed':
					if (!this.state.hasFood) {
						this.state.hasFood = true;
						if (this.registry.activeSpecies === "kitty") this.petSpeechBubble("Food! 🐟");
						if (this.registry.activeSpecies === "puppy") this.petSpeechBubble("BONE! 🍖");
						if (this.registry.activeSpecies === "spider") this.petSpeechBubble("CRICKET! 🪰");
						if (this.registry.activeSpecies === "goldfish") this.petSpeechBubble("FLAKES! 🍤");
						sendNotice(`🍽️ [Pet]: ${user} dropped food for ${this.activePet.name}!`);
					} else {
						sendNotice(`🍽️ [Pet]: There is already food in the bowl!`);
					}
					break;

				case 'play':
					this.state.action = "special";
					this.state.actionTimer = 350;
					if (this.registry.activeSpecies === "kitty") this.petSpeechBubble("Play! 🧶");
					if (this.registry.activeSpecies === "puppy") this.petSpeechBubble("FETCH! 🥎");
					if (this.registry.activeSpecies === "spider") this.petSpeechBubble("SPIN! 🕸️");
					if (this.registry.activeSpecies === "goldfish") this.petSpeechBubble("LOOP! 🫧");
					sendNotice(`🥎 [Pet]: ${user} actively engaged with ${this.activePet.name}!`);
					break;

				case 'dance':
					this.state.action = "dance";
					this.state.actionTimer = 300;
					this.petSpeechBubble("Dance! ✨");
					break;

				case 'treat':
					this.activePet.hunger = Math.max(0, this.activePet.hunger - 5);
					this.state.action = "special";
					this.state.actionTimer = 200;
					this.petSpeechBubble("NOM NOM NOM! 🍗");
					break;

				case 'trick':
					this.state.action = "trick";
					this.state.actionTimer = 250;
					if (this.registry.activeSpecies === "puppy") { this.petSpeechBubble("BACKFLIP! 🤸"); this.activePet.exp += 25; }
					else if (this.registry.activeSpecies === "kitty") { this.petSpeechBubble("PURR SLIDE! 🛷"); this.activePet.exp += 20; }
					else if (this.registry.activeSpecies === "spider") { this.petSpeechBubble("PARACHUTE! 🪂"); this.activePet.exp += 30; }
					else if (this.registry.activeSpecies === "goldfish") { this.petSpeechBubble("SPLASH FLIP! 🌊"); this.activePet.exp += 25; }
					break;

				case 'status':
					let healthTxt = this.activePet.poops.length > 5 ? "SICK" : "HEALTHY";
					sendNotice(`🐾 [${this.activePet.name}]: Species: ${this.registry.activeSpecies.toUpperCase()} | Age: ${this.activePet.ageDays}d | Hunger: ${this.activePet.hunger}% | Mood: ${healthTxt} | EXP: ${this.activePet.exp}`);
					break;

				case 'paintbomb':
					const rawArgs = message.trim().split(/\s+/).slice(1);
					let selectedColor = '';

					if (rawArgs.length === 0 || rawArgs[0] === '') {
						const randH = Math.floor(Math.random() * 360);
						selectedColor = `hsla(${randH}, 95%, 50%, 1)`;
					} else if (rawArgs[0].startsWith('#')) {
						const hslaObj = hexToHSLA(rawArgs[0]);
						selectedColor = `hsla(${hslaObj.h}, ${hslaObj.s}%, ${hslaObj.l}%, ${hslaObj.a})`;
					} else if (rawArgs.length >= 3) {
						const r = parseInt(rawArgs[0], 10) || 0;
						const g = parseInt(rawArgs[1], 10) || 0;
						const b = parseInt(rawArgs[2], 10) || 0;
						const a = rawArgs[3] !== undefined ? parseFloat(rawArgs[3]) : 1.0;
						const hslaObj = rgbToHSLA(r, g, b, a);
						selectedColor = `hsla(${hslaObj.h}, ${hslaObj.s}%, ${hslaObj.l}%, ${hslaObj.a})`;
					} else {
						const randH = Math.floor(Math.random() * 360);
						selectedColor = `hsla(${randH}, 95%, 50%, 1)`;
					}

					const isHit = Math.random() > 0.30; 

					if (typeof this.triggerPaintBomb === 'function') {
						this.triggerPaintBomb(selectedColor, isHit);
						if (isHit) {
							sendNotice(`🎈 [Paintbomb]: ${user} hurled a paint balloon at ${this.activePet.name}!`);
						} else {
							sendNotice(`💨 [Paintbomb]: ${user} hurled a paint balloon... but their aim was terrible and it might miss!`);
						}
					}
					break;

				case 'nyan':
					this.triggerNyan();
					sendNotice(`🌈 [Pet]: NYAN OVERDRIVE ACTIVATED BY STAFF!`);
					break;

				case 'tease':
					this.teasePet();
					sendNotice(`😠 [Pet]: ${user} teased ${this.activePet.name}!`);
					break;

				case 'species':
					if (isAdmin && parts[1]) {
						const speciesMap = { "kitty": "kitty", "kitten": "kitty", "puppy": "puppy", "dog": "puppy", "spider": "spider", "fish": "goldfish", "goldfish": "goldfish" };
						const targetKey = speciesMap[parts[1].toLowerCase()];
						if (targetKey && this.PET_SPECIES.includes(targetKey)) {
							this.selectSpecies(targetKey); 
							sendNotice(`🧬 [Pet]: Species hot-swapped to ${targetKey.toUpperCase()}!`);
						} else {
							sendNotice(`❌ [Pet]: Unknown species. Try: kitty, puppy, spider, or fish.`);
						}
					}
					break;

				case 'revive':
					if (this.activePet.exp > 100) {
						this.revivePet();
						sendNotice(`💖 [Pet]: ${this.activePet.name} was successfully revived by ${user}!`);
					} else {
						sendNotice(`❌ [Pet]: Only pets with greater than 100 can be revived ${this.activePet.name}!`);
					}
					break;

				case 'clear':
					this.activePet.poops = [];
					this.state.spiderWebs = [];
					this.state.goldfishBubbles = [];
					this.state.puppyBones = [];
					this.petSpeechBubble("Fresh sand! ✨");
					sendNotice(`🧹 [Pet]: ${user} scooped the environment layout parameters!`);
					break;
			}
		};

		// =========================================================================
		// 🚀 DYNAMIC ROUTER GENERATION (Generates and pipes commands automatically)
		// =========================================================================
		const baseCommands = [
			{ name: 'pet', adminOnly: false, execute: petExecution },
			{ name: 'kitty', adminOnly: false, execute: petExecution }
		];

		// Read directly from the alias keys to build and auto-register top-level chat handles
		Object.keys(aliasMap).forEach(alias => {
			baseCommands.push({
				name: alias,
				adminOnly: aliasMap[alias].admin,
				execute: (user, message, flags) => petExecution(user, alias, flags)
			});
		});

		return baseCommands;
	}


// ==========================================
// SECTION 12: loading and saving/ exporting and importing
// ==========================================
    saveData() { 
        // Save the entire multi-pet registry alongside standard global layout states
        const bundle = {
            registry: this.registry,
            state: this.state
        };
        localStorage.setItem("greta_ultra_v10", JSON.stringify(bundle)); 
    }
	loadData() {
		const saved = localStorage.getItem("greta_ultra_v10");
		if (saved) {
			const loadedBundle = JSON.parse(saved);
			
			if (loadedBundle.registry) this.registry = loadedBundle.registry;
			if (loadedBundle.state) {
				// Merge loaded state into current state
				this.state = { ...this.state, ...loadedBundle.state };
				
				// Check for the new property, and set default if it's missing
				if (this.state.tummylimit === undefined) {
					this.state.tummylimit = 8;
				}

				// 👇 BIOLOGICAL PATCH: Automatically loops blueprint definitions to repair old user custom settings
				if (loadedBundle.state.commandAccess) {
					const defaults = this.getDefaultCommandMatrix();
					const loadedAccess = loadedBundle.state.commandAccess || {};

					this.state.commandAccess = {};
					Object.keys(defaults).forEach(cmd => {
						// Retain specific channel adjustments if present, otherwise safe fallbacks are applied
						this.state.commandAccess[cmd] = loadedAccess[cmd] !== undefined 
							? loadedAccess[cmd] 
							: defaults[cmd];
					});
				}
			}
			
			// Loop through all individual isolated profiles to catch offline progression separately
			const now = Date.now();
			Object.keys(this.registry.profiles).forEach(key => {
				const profile = this.registry.profiles[key];
				const msOffline = now - profile.lastHungerTick;
				if (msOffline >= this.HUNGER_TICK_MS && !profile.isDead) {
					const pointsGained = Math.floor(msOffline / this.HUNGER_TICK_MS);
					let potentialHunger = profile.hunger + pointsGained;
					if (potentialHunger >= 100) { 
						profile.hunger = 70; 
						profile.lastHungerTick = now; 
					} else { 
						profile.hunger = potentialHunger; 
						profile.lastHungerTick = now - (msOffline % this.HUNGER_TICK_MS); 
					}
				}
			});
			
			const nameIn = document.getElementById("nameInput"); 
			if (nameIn && this.activePet) nameIn.value = this.activePet.name;
			
			const tummySlider = document.getElementById("tummyLimitRange");
			const tummyDisplay = document.getElementById("tummyLimitValue");

			// Ensure we use the loaded state value, default to 8 if not found
			const currentLimit = this.state.tummylimit !== undefined ? this.state.tummylimit : 8;

			if (tummySlider) {
				tummySlider.value = currentLimit;
				if (tummyDisplay) {
					tummyDisplay.innerText = currentLimit;
				}
			}
			
			const displayEl = document.getElementById("speciesSelectDisplay");
			if (displayEl && this.registry.activeSpecies) {
				const speciesMap = {
					kitty: "🐈 Kitty (Feline Engine v10)",
					puppy: "🐕 Puppy (Canine Kinematics Engine)",
					spider: "🕷️ Spider (Arachnid Procedural Pathing)",
					goldfish: "🐟 Goldfish (Aquatic Fluid Physics)"
				};
				displayEl.innerText = speciesMap[this.registry.activeSpecies] || speciesMap.kitty;
			}

			const hideBorderCheck = document.getElementById("hideBorderToggle");
			if (hideBorderCheck) hideBorderCheck.checked = this.state.hideBorder || false;

			const hideBackgroundCheck = document.getElementById("hideBackgroundToggle");
			if (hideBackgroundCheck) hideBackgroundCheck.checked = this.state.hideBackground || false;

			const hideFloorCheck = document.getElementById("hideFloorToggle");
			if (hideFloorCheck) hideFloorCheck.checked = this.state.hideFloor || false;

			const hideStatusCheck = document.getElementById("hideStatusToggle");
			if (hideStatusCheck) hideStatusCheck.checked = this.state.hideStatus || false;

			const hideNameplateCheck = document.getElementById("hideNameplateToggle");
			if (hideNameplateCheck) hideNameplateCheck.checked = this.state.hideNameplate || false;

			const checkT = document.getElementById("showTower"); 
			if (checkT && this.state.layout) checkT.checked = this.state.layout.showTower;
			
			// =========================================================================
			// 🎯 CANVASES ZOOM TRACKING & MEMORY LEAK SAFETY LAYER
			// =========================================================================
			const zoomSlider = document.getElementById("canvasZoom");
			const zoomDisplay = document.getElementById("zoomValue");
			if (zoomSlider) {
				let savedZoom = this.state.zoom !== undefined ? this.state.zoom : 0;
				zoomSlider.value = savedZoom;
				let scaleVal = savedZoom >= 0 ? 1.0 + (savedZoom * 0.5) : 1.0 + (savedZoom * 0.25);
				if (zoomDisplay) zoomDisplay.textContent = `${scaleVal.toFixed(1)}x`;

				// 1. Unhook old tracking pointer reference to avoid accumulating active memory listeners
				if (this._boundZoomHandler) {
					zoomSlider.removeEventListener("input", this._boundZoomHandler);
				}
				if (this._boundZoomSaveHandler) {
					zoomSlider.removeEventListener("change", this._boundZoomSaveHandler);
				}

				// 2. Verify that handleZoomInput exists before tying the context pointer
				if (typeof this.handleZoomInput === 'function') {
					this._boundZoomHandler = this.handleZoomInput.bind(this);
					zoomSlider.addEventListener("input", this._boundZoomHandler);
				} else {
					console.warn("⚠️ [Pet Widget Boot]: handleZoomInput method not found in class body during loadData.");
				}

				// 3. Attach standard runtime mouse-release data persistence trigger
				this._boundZoomSaveHandler = () => this.saveData();
				zoomSlider.addEventListener("change", this._boundZoomSaveHandler);
			}
			// =========================================================================
			// 🎯 hidefloor
			// =========================================================================
			const hideFloorToggleInput = document.getElementById("hideFloorToggle");
			if (hideFloorToggleInput) {
				// Remove old listeners to prevent memory leaking on multiple load invocations
				if (this._boundFloorToggleHandler) {
					hideFloorToggleInput.removeEventListener("change", this._boundFloorToggleHandler);
				}
				
				// Bind the engine assignment router directly
				this._boundFloorToggleHandler = (e) => {
					this.state.hideFloor = e.target.checked;
					this.saveData(); // Auto-persists structural updates instantly
				};
				hideFloorToggleInput.addEventListener("change", this._boundFloorToggleHandler);
			}
			if (this.state.layout) {
				Object.keys(this.state.layout).forEach(k => { 
					if (k === 'showTower' || k === 'bedColor') return;
					const el = document.getElementById(k);
					if (el) el.value = this.state.layout[k];
				});
			}
		}
		this.applyEditModeStyles();
		this.applyVisibilityStates();
		this.initSwatches(); 
		this.syncSpeciesInterfaceToggle();
	}
	handleZoomInput = (e) => {
		if (!e || !e.target) return;
		
		const val = parseFloat(e.target.value);
		this.state.zoom = val; // Store the raw slider value (-2 to 2)

		// Calculate dynamic visual scale using your dual-curve rendering algorithm
		let dynamicScale = val >= 0 ? 1.0 + (val * 0.5) : 1.0 + (val * 0.25);
		
		// Instantly update the UI indicator text
		const zoomDisplay = document.getElementById("zoomValue");
		if (zoomDisplay) {
			zoomDisplay.textContent = `${dynamicScale.toFixed(1)}x`;
		}
	};
	exportSettingsToClipboard(sendNotice = null) {
        try {
            // 1. Gather all of your custom layout sizes, coordinates, and pet profiles
            const configBundle = {
                widgetBounds: this.widgetBounds,
                registry: this.registry,
                state: this.state
            };

            // Convert the bundle into a clean, formatted JSON string
            const jsonString = JSON.stringify(configBundle, null, 4);

            // 2. Create a hidden textarea to force focus and execution permission
            const tempTextArea = document.createElement("textarea");
            tempTextArea.value = jsonString;
            
            // Move it completely off-screen so it's invisible to viewers
            tempTextArea.style.position = "absolute";
            tempTextArea.style.left = "-9999px";
            tempTextArea.style.top = "-9999px";
            document.body.appendChild(tempTextArea);

            // 3. Select the string text inside the element
            tempTextArea.focus();
            tempTextArea.select();
            tempTextArea.setSelectionRange(0, 99999); // Compatibility fix for older webkit builds

            // 4. Fire the copy command execution thread
            const success = document.execCommand("copy");
            document.body.removeChild(tempTextArea);

            if (success) {
                console.log("💾 [Pet Widget]: Your custom configuration settings have been successfully copied to your clipboard!");
                if (typeof sendNotice === "function") {
                    sendNotice("📋 [Pet Widget]: Settings bundle copied to clipboard! You can paste this directly into your backup files.");
                } else if (typeof p8Confirm === "function") {
                    alert("📋 Settings copied to clipboard! Paste it safely into a text file.");
                }
            } else {
                throw new Error("document.execCommand failed to execute.");
            }
        } catch (err) {
            console.error("❌ [Pet Widget Error]: Failed to copy settings automatically: ", err);
            
            // Fallback: If copy execution completely blocked, output the clean object to log stream
            console.log("👇 COPY THIS RAW DATA TEMPLATE MANUALLY:");
            console.log(JSON.stringify({
                widgetBounds: this.widgetBounds,
                registry: this.registry,
                state: this.state
            }));
        }
    }

// ==========================================
// SECTION 13: SOUND SYSTEM ENGINE
// ==========================================

	petAudio(action, key = null) {
        switch (action) {
            case 'init': {
                const savedSoundSettings = localStorage.getItem('pixelkitty_sound_settings');
                window.soundSettings = savedSoundSettings ? JSON.parse(savedSoundSettings) : DEFAULT_SOUND_SETTINGS;

                this.audioAssets = {};
                Object.keys(DEFAULT_AUDIO_PATHS).forEach(k => this.petAudio('refresh', k));
                break;
            }

            case 'refresh': {
                if (!key) return;
                const source = window.soundSettings.customPaths[key] || DEFAULT_AUDIO_PATHS[key];
                if (source) {
                    this.audioAssets[key] = new Audio(source);
                    if (key === 'nyanSound') this.audioAssets[key].loop = true;
                }
                break;
            }

            case 'play': {
                if (!key) return;
                if (window.soundSettings.masterEnabled && window.soundSettings[key]) {
                    const sound = this.audioAssets[key];
                    if (sound) {
                        sound.currentTime = 0; 
                        sound.play().catch(err => console.warn(`[!] Audio: ${key} blocked.`, err));
                    }
                }
                break;
            }

            case 'stop': {
                if (!key) return;
                if (this.audioAssets && this.audioAssets[key]) {
                    this.audioAssets[key].pause();
                    this.audioAssets[key].currentTime = 0;
                }
                break;
            }
            
            case 'destroy': {
                // Perfect hook for your destroyWidget loop!
                if (this.audioAssets) {
                    Object.keys(this.audioAssets).forEach(k => this.petAudio('stop', k));
                    this.audioAssets = {};
                }
                break;
            }
        }
    }

}