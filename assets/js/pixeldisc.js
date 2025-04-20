

const userPixeldiscConfig = {
  enableLever: "on",    // can be "on", "always", or "off"
  autoFade: "off",    // can be "on" or "off"
  autoFadeTime: 5000 // Time in ms
};
const toggleOptions = {
  enableLever: ["on", "always", "off"],
  autoFade: ["on", "off"]
};  // Toggle for auto fade


let canvas = document.getElementById("canvas1");
let sections = ["Prize 1", "Prize 2", "Prize 3", "Prize 4", "Prize 5", "Prize 6", "Prize 7"];
let chatterWheelsections = [];
let colors = ["#001f1fe8", "#004040eb"];
let wheels = null;
let frame = null;
const removeSelect = document.getElementById("removewheelsection");
const addInput = document.getElementById("addwheelsection");
const addButton = document.getElementById("wheel-addsectionButt");
const removeButton = document.getElementById("wheel-removesectionButt");
const lever = document.getElementById("discRotationLever");
const leverWrapper = document.getElementById("discRotationLeverWrapper");

const wrapper = document.getElementById("wheelcanvaswrapper");
let styles = getComputedStyle(document.body);
	color1 = styles.getPropertyValue('--wheel-color').trim();
	color2 = styles.getPropertyValue('--wheel-color2').trim();
	color3 = styles.getPropertyValue('--wheel-color3').trim();
	wheelFont = styles.getPropertyValue('--wheel-font').trim();
	wheelTextColor = styles.getPropertyValue('--wheel-text-color').trim();
	borderColor = styles.getPropertyValue('--border-color').trim();
	glowColor = styles.getPropertyValue('--glow-color').trim();
	console.log('Current Body Class:', document.body.className);
	// Use resolved values in your array
	colors = [color1, color2];

// Pointer Config
const pointerLength = 1.4;//= 1.2;
const pointerWidth = 0.10;//= 0.08;
let pointerColor = wheelTextColor; //"#f00";
const WIN_GLOW_COLOR = { r: 0, g: 255, b: 0 }; // Green glow
// Wheel configuration
const wheelFontConfig = {
  family: wheelFont || "Arial",
  weight: "bold",
  minSize: 8,
  maxSize: 20,
  scaleFactor: 0.8
};


let highlightedIndex = null;
let highlightStartTime = null;
const HIGHLIGHT_DURATION = 5000; // 1 second glow

// Easing function: easeOutQuad (starts fast, slows down)
function easeOutQuad(t) {
	return t * (2 - t);
}

function debugThemeStyles() {
	styles = getComputedStyle(document.body);
	color1 = styles.getPropertyValue('--wheel-color').trim();
	color2 = styles.getPropertyValue('--wheel-color2').trim();
	color3 = styles.getPropertyValue('--wheel-color3').trim();
	wheelFont = styles.getPropertyValue('--wheel-font').trim();
	wheelTextColor = styles.getPropertyValue('--wheel-text-color').trim();
	borderColor = styles.getPropertyValue('--border-color').trim();
	glowColor = styles.getPropertyValue('--glow-color').trim();
	console.log('Current Body Class:', document.body.className);
	// Log the results
	console.log('Wheel Font (--wheel-font):', wheelFont);
	console.log('Wheel Text Color (--wheel-text-color):', wheelTextColor);
	console.log('Color 1 (--wheel-color):', color1);
	console.log('Color 2 (--wheel-color2):', color2);
	console.log('Color 3 (--wheel-color3):', color3);
	console.log('Border color (--border-color):', borderColor);
	console.log('Glow Color (--glow-color):', glowColor);
	colors = [color1, color2];
	wheels = null;
	frame = null;
	repaint(angle);
}
function repaintWheel() {
	styles = getComputedStyle(document.body);
	color1 = styles.getPropertyValue('--wheel-color').trim();
	color2 = styles.getPropertyValue('--wheel-color2').trim();
	color3 = styles.getPropertyValue('--wheel-color3').trim();
	wheelFont = styles.getPropertyValue('--wheel-font').trim();
	wheelTextColor = styles.getPropertyValue('--wheel-text-color').trim();
	borderColor = styles.getPropertyValue('--border-color').trim();
	glowColor = styles.getPropertyValue('--glow-color').trim();
	// Use resolved values in your array
	colors = [color1, color2];
	wheels = null;
	frame = null;
	console.log(`attemtping to repaint wheel`);
	repaint(angle);
}
		function repaint(angle) {
			const wrapper = document.getElementById("wheelcanvaswrapper");
			const wrapperBounds = wrapper.getBoundingClientRect();
			canvas.width = wrapperBounds.width;
			canvas.height = wrapperBounds.height;

			// Set the radius to be half of the canvas width or height (whichever is smaller)
			let r = Math.min(canvas.width, canvas.height) * 1 / 2; 

			// Ensure the wheel is centered in the middle of the canvas
			let cx = canvas.width / 2;
			let cy = canvas.height / 2;

			if (wheels === null) {
				wheels = [];

				// Create the wheel segments
				for (let selected = 0; selected < sections.length; selected++) {
					let wheelCanvas = document.createElement("canvas");
					wheelCanvas.width = wheelCanvas.height = 2 * r; // Full width and height to fit the wheel
					let ctx = wheelCanvas.getContext("2d");

					// Draw each section
					for (let i = 0; i < sections.length; i++) {
						let a0 = 2 * Math.PI * i / sections.length;
						let a1 = a0 + 2 * Math.PI / sections.length;
						let a = 2 * Math.PI * (i + 0.5) / sections.length;

						ctx.beginPath();
						ctx.moveTo(r, r);
						ctx.arc(r, r, r, a0, a1, false);
						ctx.fillStyle = colors[i % 2];
						ctx.fill();
						ctx.strokeStyle = borderColor;//"var(--border-color)";//"#0ea4a4e8";
						ctx.lineWidth = 1;
						ctx.stroke();

						// Draw the text
						const fontSize = Math.min(
						  Math.max(r / sections.length * wheelFontConfig.scaleFactor, wheelFontConfig.minSize),
						  wheelFontConfig.maxSize
						);
						ctx.save();
						ctx.fillStyle = wheelTextColor;
						ctx.font = `${wheelFontConfig.weight} ${fontSize}px ${wheelFontConfig.family}`;
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.translate(r, r);
						ctx.rotate(a);

						// Optional: Drop shadow for depth
						ctx.shadowColor = "rgba(0, 0, 0, 0.6)";
						ctx.shadowOffsetX = 2;
						ctx.shadowOffsetY = 2;
						ctx.shadowBlur = 3;

						// Fill the text (main color)
						ctx.fillText(sections[i], r * 0.56, 0);

						// Optional: Strong black stroke to make text pop
/* 						ctx.shadowColor = "transparent"; 
						ctx.lineWidth = 0.1;
						ctx.strokeStyle = "black";
						ctx.strokeText(sections[i], r * 0.56, 0); */

						ctx.restore();
					}
					wheels.push(wheelCanvas);
				}
			}

			// Create the frame (outer circle and pointer)
			if (frame === null) {
				frame = document.createElement("canvas");
				frame.width = frame.height = 2 * r * 1.25; // Adjust frame to fit the full size of the wheel
				let ctx = frame.getContext("2d"), frameCx = frame.width / 2, frameCy = frame.height / 2;

				// Draw the outer circle
				ctx.beginPath();
				ctx.arc(frameCx, frameCy, r * 1.025, 0, 2 * Math.PI, true);
				ctx.arc(frameCx, frameCy, r * 0.975, 0, 2 * Math.PI, false);
				ctx.fillStyle = borderColor;//"var(--bg-color)";//"#004040eb";
				ctx.fill();

				// Draw the inner circle
				ctx.fillStyle = color2;//"var(--bg-color)";//"#004040eb";
				ctx.strokeStyle = borderColor;//"var(--input-bg-color)";//"#001f1fe8";
				ctx.lineWidth = 6;//was 8
				ctx.beginPath();
				ctx.arc(frameCx, frameCy, r / 6, 0, 2 * Math.PI, false);//was 4
				ctx.fill();
				ctx.stroke();

				// -----------------
				// Draw The Pointer
				ctx.save(); // Save before translate/rotate
				ctx.translate(frameCx, frameCy);
				ctx.rotate(Math.PI - 0.2);

				// Draw Pointer Shape
				ctx.beginPath();
				ctx.moveTo(-r * pointerLength, -r * pointerWidth);
				ctx.lineTo(-r * 0.85, 0);
				ctx.lineTo(-r * pointerLength, r * pointerWidth);
				ctx.closePath();

				// Outset Border Style
				ctx.shadowOffsetX = 2;
				ctx.shadowOffsetY = 2;
				ctx.shadowBlur = 4;
				ctx.shadowColor = "rgba(0, 0, 0, 0.4)"; // Subtle dark drop shadow

				// Fill (main color)
				ctx.fillStyle = wheelTextColor;
				ctx.fill();

				// Stroke (brighter edge on top-left for "light" side)
				ctx.shadowColor = "transparent"; // Disable shadow for stroke
				ctx.lineWidth = 2;
				ctx.strokeStyle = borderColor;//"#ffaaaa"; // Light edge, like it's catching light
				ctx.stroke();

				ctx.restore(); // Always restore after transforming
			}

			// Set the canvas size to match the wrapper
			let ctx = canvas.getContext("2d");
			canvas.width = wrapperBounds.width;
			canvas.height = wrapperBounds.height;

			// Draw the selected section of the wheel
			let selected = (Math.floor((-0.2 - angle) * sections.length / (2 * Math.PI)) % sections.length);
			if (selected < 0) selected += sections.length;

			ctx.save();
			ctx.translate(cx, cy); // Center the canvas
			ctx.rotate(angle); // Rotate by the angle
			ctx.translate(-wheels[selected].width / 2, -wheels[selected].height / 2); // Center the wheel on the canvas
			ctx.drawImage(wheels[selected], 0, 0);
			ctx.restore();

						// Highlight/WIN Glow
			// Highlight/WIN Glow with Pulse
			if (highlightedIndex !== null && highlightStartTime !== null) {
				const elapsed = performance.now() - highlightStartTime;
				if (elapsed < HIGHLIGHT_DURATION) {
					const t = elapsed / HIGHLIGHT_DURATION; // Normalize to 0–1
					const eased = easeOutQuad(1 - t); // Reverse easing for fade-out with pulse
					const opacity = eased * 0.3;
					const blur = eased * 30; // More dramatic pulse blur at the start

					ctx.save();
					ctx.translate(cx, cy);
					ctx.rotate(angle);

					// Draw highlight arc
					const a0 = 2 * Math.PI * highlightedIndex / sections.length;
					const a1 = a0 + 2 * Math.PI / sections.length;
					ctx.beginPath();
					ctx.moveTo(0, 0);
					ctx.arc(0, 0, r, a0, a1);
					ctx.closePath();

					ctx.fillStyle = `rgba(0, 255, 0, ${opacity})`; // Pulsing glow
					ctx.shadowColor = `rgba(0, 255, 0, ${opacity * 3})`;
					ctx.shadowBlur = blur;
					ctx.fill();

					ctx.restore();

					requestAnimationFrame(() => repaint(angle)); // continue animation
				} else {
					highlightedIndex = null; // end of animation
				}
			}
					// Draw the outer frame (pointer and ring)
		ctx.drawImage(frame, cx - frame.width / 2, cy - frame.height / 2);
		}

				// Spin function
		let angle = 0, running = false;
		let fadeTimeout;
		function spinTo(winner, duration, extraSpins = 5) {
			  // 🔁 Clear any existing auto-fade timeout
		  if (fadeTimeout) {
			clearTimeout(fadeTimeout);
			console.log("[AutoFade] Cleared previous fade timeout.");
		  }
		  const sectionAngle = 2 * Math.PI / sections.length;

		  // Randomize spin count a bit: 4–6 extra full rotations
		  const randomSpins = extraSpins + Math.floor(Math.random() * 3); // 5–7 total

		  let final_angle = (0.2) + (0.5 + winner) * sectionAngle + randomSpins * 2 * Math.PI;
		  let start_angle = angle - Math.floor(angle / (2 * Math.PI)) * 2 * Math.PI;
		  let start = performance.now();

		  function frame() {
			let now = performance.now();
			let t = Math.min(1, (now - start) / duration);

			// Smooth in/out easing
			t = 3 * t * t - 2 * t * t * t;

			angle = start_angle + t * (final_angle - start_angle);
			repaint(angle);

			if (t < 1) {
			  requestAnimationFrame(frame);
			} else {
			  running = false;

			  // 🏆 Determine the winning section
			  let winningIndex = Math.floor(((-0.2 - angle) % (2 * Math.PI)) * sections.length / (2 * Math.PI));
			  if (winningIndex < 0) winningIndex += sections.length;
			  let winningSection = sections[winningIndex];
			  highlightedIndex = winningIndex;
			  highlightStartTime = performance.now();
			  repaint(angle);

			  console.log("Winner:", winningSection);
			  const resultDisplay = document.getElementById("wheel-result");
			  if (resultDisplay) {
				showElement(resultDisplay, "slide");
				resultDisplay.textContent = `${winningSection}`;
			  }

			  // 🎯 Auto fade AFTER spin completes
			  if (userPixeldiscConfig.autoFade === "on") {
				if (wrapper) {
				  fadeTimeout = setTimeout(() => {
					console.log(`[AutoFade] Hiding elements after ${userPixeldiscConfig.autoFadeTime}ms`);
					hideElement(wrapper, "slide");
					hideElement(resultDisplay, "slide");
					      // Update toggle button after fade
			    	const toggleButton = document.getElementById("showWheelButt");
				    if (toggleButton) {
					  toggleButton.innerHTML = '<i class="fas fa-eye"></i> Show';
				    }
				  }, userPixeldiscConfig.autoFadeTime);
				}
			  }
			}
		  }
		  requestAnimationFrame(frame);
		  running = true;
		}
		function spinWheel() {
			if (!running) {
				const randomWinner = Math.floor(Math.random() * sections.length);
				const randomDuration = 5000 + Math.random() * 10000; // 3–6 seconds
				spinTo(randomWinner, randomDuration);
			  // We add the fade time after the spin finishes
			}
		  }
// Bind the spin to mouse click
canvas.onmousedown = function() {
	spinWheel();
};
//comment this function out if you want to stop the resizing
window.addEventListener("resize", () => repaint(angle));


	function getSavedWheels() {
		return JSON.parse(localStorage.getItem("savedWheels") || "{}");
	}
	function saveWheelsToStorage(wheels) {
		localStorage.setItem("savedWheels", JSON.stringify(wheels));
	}
function updateLoadDropdown() {
    const loadSelect = document.getElementById("loadwheelsection");
    loadSelect.innerHTML = "";

    const wheels = getSavedWheels();
    for (const name in wheels) {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        loadSelect.appendChild(option);
    }
}
function updateRemoveDropdown() {
    const removeSelect = document.getElementById("removewheelsection");
    removeSelect.innerHTML = "";

    sections.forEach((section, index) => {
        const option = document.createElement("option");
        option.value = index;
        option.textContent = section;
        removeSelect.appendChild(option);
    });
}

	function addwheelSection() {
		const newSection = addInput.value.trim();
		if (newSection && !sections.includes(newSection)) {
			sections.push(newSection);
			updateRemoveDropdown();
			addInput.value = "";

			wheels = null;
			frame = null;
			repaint(angle);
		} else {
			console.log("Section name is empty or already exists.");
		}
	}
	function addUserWheelSection(user) {
		const newSection = user.trim();
		if (newSection && !chatterWheelsections.find(entry => entry.label === newSection)) {
			chatterWheelsections.push(newSection);
			updateRemoveDropdown();
			displayConsoleMessage(user, `You've been added to the Chatter Wheel ✅`);
			repaintWheel(); // Ensure the wheel is updated after the section is added
		} else {
			console.log("Chatter name is empty or already exists in the Chatter Wheel.");
			displayConsoleMessage(user, `You're already on the Chatter Wheel ❌`);
		}
	}
	addButton.addEventListener("click", () => {
		console.log("add section butt clicked!");
		addwheelSection();
	});
	function removewheelSection() {
		const selectedIndex = removeSelect.value;
		if (selectedIndex !== "") {
			sections.splice(selectedIndex, 1);
			updateRemoveDropdown();

			// 🔁 Force redraw
			wheels = null;
			frame = null;
			repaint(angle);
		}
	}
	removeButton.addEventListener("click", () => {
		console.log("remove section butt clicked!");
		removewheelSection();
	});
	function savePixelDiscConfig() {
	  localStorage.setItem("pixelDiscConfig", JSON.stringify(userPixeldiscConfig));
	}
	function applyConfigToUI() {
	  document.getElementById("discRotationLeverToggle").value = userPixeldiscConfig.enableLever;
	  document.getElementById("autoFadeToggle").checked = userPixeldiscConfig.autoFade === "on";
	  document.getElementById("fadeTimeInput").value = userPixeldiscConfig.autoFadeTime / 1000;
	  updateLeverVisibility();
	  updateAllStatusIndicators(userPixeldiscConfig);
	}
	function loadPixelDiscConfig() {
	  const savedConfig = localStorage.getItem("pixelDiscConfig");
	  if (savedConfig) {
		const parsedConfig = JSON.parse(savedConfig);
		Object.assign(userPixeldiscConfig, parsedConfig);
	  }
	  applyConfigToUI();
	}

	function savewheelSections() {
		const name = document.getElementById("savewheelsections").value.trim();
		if (!name) return alert("Please enter a name for your wheel.");

		let wheels = getSavedWheels();
		wheels[name] = sections.slice(); // save a copy
		saveWheelsToStorage(wheels);
		updateLoadDropdown();
		console.log(`Wheel "${name}" saved!`);
	}
	//save wheel sections button
	document.getElementById("save-sectionsButt").addEventListener("click", () => {
		console.log(`Wheel "${name}" saved!`);
		savewheelSections()
	});
	//load wheel sections button
	function loadwheelSections() {
		const name = document.getElementById("loadwheelsection").value;
		const wheels = getSavedWheels();

		if (wheels[name]) {
			sections = wheels[name].slice(); // copy
			updateRemoveDropdown();
			repaintWheel();
		} else {
			console.log("Selected wheel not found.");
		}
	}
	document.getElementById("load-sectionsButt").addEventListener("click", () => {
		console.log(`Wheel "load sections butt clicked!`);
		loadwheelSections();
		repaintWheel();
	});
function deletewheelSections() { 
	const select = document.getElementById("loadwheelsection");
	const name = select.value;

	if (!name) {
		console.log("No wheel selected.");
		return;
	}

	const wheels = getSavedWheels();
	delete wheels[name];
	saveWheelsToStorage(wheels);
	updateLoadDropdown();
	repaintWheel();
	console.log(`Wheel "${name}" deleted.`);
}

document.getElementById("delete-saved-wheel").addEventListener("click", () => {
	console.log(`Wheel "delete wheel butt clicked!"`);
	deletewheelSections();
	repaintWheel();
});

function addTestChatters(count = 3) {
	const exampleUsers = ["TestUser1", "TestUser2", "TestUser3"];

	for (let i = 0; i < count && i < exampleUsers.length; i++) {
		const username = exampleUsers[i];
		if (!chatterWheelsections.find(entry => entry.label === username)) {
			chatterWheelsections.push({ label: username });
		}
	}
	console.log(`✅ Added ${count} test chatters to the Chatter Wheel`, chatterWheelsections);
	repaintWheel(); // Optional: update the wheel display immediately
}
	
function showWheel() {
	const wheelWrapper = document.getElementById("wheelcanvaswrapper");
	const leverWrapper = document.getElementById("discRotationLeverWrapper");
	const toggleButton = document.getElementById("showWheelButt");
	if (!wheelWrapper || !leverWrapper) return;

	// Toggle visibility
	const isVisible = window.getComputedStyle(wheelWrapper).visibility === "visible";
	const mode = userPixeldiscConfig.enableLever;

	if (isVisible) {
		// Hide wheel
		wheelWrapper.style.animation = "fadeOut 0.5s ease-in forwards";
		setTimeout(() => {
			wheelWrapper.style.visibility = "hidden";
		}, 500);

		// Hide lever only if mode is "on"
		if (mode === "on") {
			leverWrapper.style.animation = "fadeOut 0.5s ease-in forwards";
			setTimeout(() => {
				leverWrapper.style.visibility = "hidden";
			}, 500);
			console.log(`Lever hidden (mode: ${mode}) ❌`);
		} else {
			console.log(`Lever stays visible (mode: ${mode}) ✅`);
		}

		console.log("Wheel hidden ❌");

		// Update button
		if (toggleButton) {
			toggleButton.innerHTML = '<i class="fas fa-eye"></i> Show';
		}
	} else {
		// Show wheel
		wheelWrapper.style.visibility = "visible";
		wheelWrapper.style.display = "flex";
		wheelWrapper.style.animation = "fadeIn 0.8s ease-out forwards";

		// Show lever only if mode is "on" or "always"
		if (mode === "always" || mode === "on") {
			leverWrapper.style.visibility = "visible";
			leverWrapper.style.animation = "fadeIn 0.8s ease-out forwards";
			console.log(`Lever shown (mode: ${mode}) ✅`);
		}
		// Update button
		if (toggleButton) {
			toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i> Hide';
		}
		repaintWheel();
		console.log("Wheel shown ✅");


	}
}

function forceShowWheel() {
	const wheelWrapper = document.getElementById("wheelcanvaswrapper");
	const leverWrapper = document.getElementById("discRotationLeverWrapper");
	const toggleButton = document.getElementById("showWheelButt");
	if (!wheelWrapper || !leverWrapper) return;

	const isVisible = window.getComputedStyle(wheelWrapper).visibility === "visible";
	const mode = userPixeldiscConfig.enableLever;

	if (!isVisible) {
		// Show wheel
		wheelWrapper.style.visibility = "visible";
		wheelWrapper.style.display = "flex";
		wheelWrapper.style.animation = "fadeIn 0.8s ease-out forwards";

		// Show lever if mode allows
		if (mode === "always" || mode === "on") {
			leverWrapper.style.visibility = "visible";
			leverWrapper.style.animation = "fadeIn 0.8s ease-out forwards";
		}

		// Update button
		if (toggleButton) {
			toggleButton.innerHTML = '<i class="fas fa-eye-slash"></i> Hide';
		}

		console.log("Wheel force-shown ✅");
	}
}

document.getElementById("showWheelButt")?.addEventListener("click", showWheel);
function updateLeverVisibility() {
	const lever = document.getElementById("discRotationLeverWrapper");
	const wheelWrapper = document.getElementById("wheelcanvaswrapper");
	const mode = userPixeldiscConfig.enableLever;

	if (!lever || !wheelWrapper) return;

	if (mode === "off") {
		console.log("lever disabled ❌");
		lever.style.animation = "fadeOut 0.5s ease-in forwards";
		setTimeout(() => {
			lever.style.visibility = "hidden";
		}, 500);
	} else if (mode === "always") {
		console.log("lever always visible ✅");
		lever.style.visibility = "visible";
		lever.style.animation = "fadeIn 0.8s ease-out forwards";
	} else if (mode === "on") {
		const wrapperVisible = window.getComputedStyle(wheelWrapper).visibility === "visible";
		if (wrapperVisible) {
			console.log("lever visible (wheel shown) ✅");
			lever.style.visibility = "visible";
			lever.style.animation = "fadeIn 0.8s ease-out forwards";
		} else {
			console.log("lever hidden (wheel not shown) ❌");
			lever.style.animation = "fadeOut 0.5s ease-in forwards";
			setTimeout(() => {
				lever.style.visibility = "hidden";
			}, 500);
		}
	}
}
function pullDiscRotationLever() {
      console.log(`Wheel done gonna spun!`);
	  showElement(wheelcanvaswrapper, "fade");
	  if (running) return;

	  lever.classList.add("pull");
	  showElement(wheelcanvaswrapper, "fade");
	  spinWheel();

	  setTimeout(() => {
		lever.classList.remove("pull");
	  }, 800);
}


	document.getElementById("discRotationButton").addEventListener("click", () => {
		console.log(`Wheel done gonna spun!`);
		showElement(wheelcanvaswrapper, "fade");
		spinWheel();
	});

	document.getElementById("discRotationLever").addEventListener("click", () => {
		pullDiscRotationLever();
	});


// Initial values from the config
document.getElementById("discRotationLeverToggle").value = userPixeldiscConfig.enableLever;
document.getElementById("autoFadeToggle").checked = userPixeldiscConfig.autoFade === "on";  // Checking if it's "on"
document.getElementById("fadeTimeInput").value = userPixeldiscConfig.autoFadeTime / 1000;

// Event listeners to update config and status indicators
document.getElementById("discRotationLeverToggle").addEventListener("change", (e) => {
  userPixeldiscConfig.enableLever = e.target.value;  // Will be "on", "always", or "off"
  savePixelDiscConfig();
  updateLeverVisibility();  // Update visibility of lever
  updateAllStatusIndicators(userPixeldiscConfig);  // Update status indicators
});

document.getElementById("autoFadeToggle").addEventListener("change", (e) => {
  savePixelDiscConfig();
  userPixeldiscConfig.autoFade = e.target.checked ? "on" : "off";  // Set to "on" or "off"
  updateAllStatusIndicators(userPixeldiscConfig);  // Update status indicators
});



document.getElementById("fadeTimeInput").addEventListener("input", (e) => {
  const seconds = parseFloat(e.target.value) || 0;
  userPixeldiscConfig.autoFadeTime = seconds * 1000;
  savePixelDiscConfig(); // Save *after* updating the config
});

	document.addEventListener('DOMContentLoaded', () => {
	  	// Initialize dropdown when page loads
		updateRemoveDropdown();
		updateLoadDropdown();
		loadPixelDiscConfig();
		updateAllStatusIndicators(userPixeldiscConfig);
	});
/*  localStorage.removeItem("pixelDiscConfig"); */
console.log("disc1.00 side A")