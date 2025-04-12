let canvas = document.getElementById("canvas1");
let sections = ["FREE Beer Keg", "poop", "free spin", "Recycling Scrip", "Colonist Roulette", "Merp Race", "Trivia", "Ordinance Crate", "nothing"];
let colors = ["#001f1fe8", "#004040eb"];

let wheels = null;
let frame = null;
const removeSelect = document.getElementById("removewheelsection");
const addInput = document.getElementById("addwheelsection");
const addButton = document.getElementById("wheel-addsectionButt");
const removeButton = document.getElementById("wheel-removesectionButt");

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
// Wheel configuration
const wheelFontConfig = {
  family: wheelFont || "Arial",
  weight: "bold",
  minSize: 11,
  maxSize: 21,
  scaleFactor: 0.9
};

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
						ctx.shadowColor = "transparent"; // Disable shadow for stroke
						ctx.lineWidth = 0.5;
						ctx.strokeStyle = "black";
						ctx.strokeText(sections[i], r * 0.56, 0);

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

			// Draw the outer frame (pointer and ring)
			ctx.drawImage(frame, cx - frame.width / 2, cy - frame.height / 2);
		}
		// Spin function
		let angle = 0, running = false;
		function spinTo(winner, duration) {
			let final_angle = (-0.2) - (0.5 + winner) * 2 * Math.PI / sections.length;
			let start_angle = angle - Math.floor(angle / (2 * Math.PI)) * 2 * Math.PI - 5 * 2 * Math.PI;
			let start = performance.now();
			function frame() {
				let now = performance.now();
				let t = Math.min(1, (now - start) / duration);
				t = 3 * t * t - 2 * t * t * t; // ease in out
				angle = start_angle + t * (final_angle - start_angle);
				repaint(angle);
				if (t < 1) {
				requestAnimationFrame(frame);
				} else {
					running = false;
					// 🏆 Determine the winning section
					let winningIndex = (Math.floor((-0.2 - angle) * sections.length / (2 * Math.PI)) % sections.length);
					if (winningIndex < 0) winningIndex += sections.length;
					let winningSection = sections[winningIndex];
					// 🔊 Log and/or display the winner
					console.log("Winner:", winningSection);
					const resultDisplay = document.getElementById("wheel-result");
					if (resultDisplay) {
						resultDisplay.textContent = `${winningSection}`;
					}
				}
			}
			requestAnimationFrame(frame);
			running = true;
		}
		function spinWheel() {
				if (!running) {
				spinTo(Math.random() * sections.length | 0, 5000);
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
		removeSelect.innerHTML = ""; // Clear current options
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

			// 🔁 Force redraw
			wheels = null;
			frame = null;
			repaint(angle);
		} else {
			console.log("Section name is empty or already exists.");
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
	function savewheelSections() {
		const name = document.getElementById("savewheelsections").value.trim();
		if (!name) return alert("Please enter a name for your wheel.");

		const wheels = getSavedWheels();
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
			wheels = null;
			frame = null;
			repaint(angle);
		} else {
			console.log("Selected wheel not found.");
		}
	}
	document.getElementById("load-sectionsButt").addEventListener("click", () => {
		console.log(`Wheel "load sections butt clicked!`);
		loadwheelSections();
	});
	function deletewheelSections() {
		const select = document.getElementById("loadwheelsection");
		const name = select.value;

		if (!name) return alert("No wheel selected.");
		const confirmed = confirm(`Are you sure you want to delete the wheel "${name}"?`);

		if (!confirmed) return;

		const wheels = getSavedWheels();
		delete wheels[name];
		saveWheelsToStorage(wheels);
		updateLoadDropdown();
		console.log(`Wheel "${name}" deleted.`);
	}
	document.getElementById("delete-saved-wheel").addEventListener("click", () => {
		console.log(`Wheel "delete wheel butt clicked!`);
		deletewheelSections();
	});
	document.addEventListener('DOMContentLoaded', () => {
	  	// Initialize dropdown when page loads
		updateRemoveDropdown();
		updateLoadDropdown();
	});
