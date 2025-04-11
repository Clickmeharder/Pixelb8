let canvas = document.getElementById("canvas1");
let sections = ["FREE Beer Ked", "poop", "free spin", "Recycling Scrip", "Colonist Roulette", "Merp Race", "Trivia", "Ordinance Crate", "idk", "another option", "nothing"];
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
	bodyFont = styles.getPropertyValue('--body-font').trim();
	bordercolor = styles.getPropertyValue('--border-color').trim();
	glowColor = styles.getPropertyValue('--glow-color').trim();
	console.log('Current Body Class:', document.body.className);
	// Log the results
	console.log('Color 1 (--wheel-color):', color1);
	console.log('Color 2 (--wheel-color2):', color2);
	console.log('Color 3 (--wheel-color3):', color3);
	console.log('Body Font (--body-font):', bodyFont);
	console.log('Border color (--border-color):', borderColor);
	console.log('Glow Color (--glow-color):', bodyFont);
	// Use resolved values in your array
	colors = [color1, color2];
function debugThemeStyles() {
	styles = getComputedStyle(document.body);
	color1 = styles.getPropertyValue('--wheel-color').trim();
	color2 = styles.getPropertyValue('--wheel-color2').trim();
	color3 = styles.getPropertyValue('--wheel-color3').trim();
	bodyFont = styles.getPropertyValue('--body-font').trim();
	bordercolor = styles.getPropertyValue('--border-color').trim();
	glowColor = styles.getPropertyValue('--glow-color').trim();
	console.log('Current Body Class:', document.body.className);
	// Log the results
	console.log('Color 1 (--wheel-color):', color1);
	console.log('Color 2 (--wheel-color2):', color2);
	console.log('Color 3 (--wheel-color3):', color3);
	console.log('Body Font (--body-font):', bodyFont);
	console.log('Border color (--border-color):', borderColor);
	console.log('Glow Color (--glow-color):', bodyFont);
	// Use resolved values in your array
	colors = [color1, color2];
	wheels = null;
	frame = null;
	repaint(angle);
}
// Fallback if the CSS variable isn't set
const wheelFontConfig = {
  family: bodyFont || "Arial",
  weight: "bold",
  minSize: 12,
  maxSize: 18,
  scaleFactor: 0.9
};

		function repaint(angle) {
			const wrapper = document.getElementById("wheelcanvaswrapper");
			const wrapperBounds = wrapper.getBoundingClientRect();
			canvas.width = wrapperBounds.width;
			canvas.height = wrapperBounds.height;

			// Set the radius to be half of the canvas width or height (whichever is smaller)
			let r = Math.min(canvas.width, canvas.height) * 0.98 / 2; 

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
						ctx.fillStyle = "#ff8900f5";//"var(--text-color-alt)";//"#ff8900f5"
						ctx.font = `${wheelFontConfig.weight} ${fontSize}px ${wheelFontConfig.family}`;
						ctx.textAlign = "center";
						ctx.textBaseline = "middle";
						ctx.translate(r, r);
						ctx.rotate(a);
						ctx.fillText(sections[i], r * 0.62, 0);
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
				ctx.fillStyle = "#004040eb";//"var(--bg-color)";//"#004040eb";
				ctx.fill();

				// Draw the inner circle
				ctx.fillStyle = "#004040eb";//"var(--bg-color)";//"#004040eb";
				ctx.strokeStyle = "#001f1fe8";//"var(--input-bg-color)";//"#001f1fe8";
				ctx.lineWidth = 6;//was 8
				ctx.beginPath();
				ctx.arc(frameCx, frameCy, r / 6, 0, 2 * Math.PI, false);//was 4
				ctx.fill();
				ctx.stroke();

				// Draw the pointer
				ctx.translate(frameCx, frameCy);
				ctx.rotate(Math.PI - 0.2);
				ctx.beginPath();
				ctx.moveTo(-r * 1.1, -r * 0.05);
				ctx.lineTo(-r * 0.9, 0);
				ctx.lineTo(-r * 1.1, r * 0.05);
				ctx.fillStyle = "#f00";//"var(--button-text-color)";//"#f00";
				ctx.fill();
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
						resultDisplay.textContent = `🎉 Winner: ${winningSection}`;
					}
				}
			}

			requestAnimationFrame(frame);
			running = true;
		}

		// Bind the spin to mouse click
		canvas.onmousedown = function() {
			if (!running) {
				spinTo(Math.random() * sections.length | 0, 5000);
			}
		};


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
