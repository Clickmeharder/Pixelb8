const root = document.documentElement;

const sliders = [
  { id: "twitchchatY", unit: "%", variable: "--twitchchat-Y", min: 0, max: 75 },
  { id: "twitchchatX", unit: "%", variable: "--twitchchat-X", min: 0, max: 100 },
  { id: "entriviaAnnouncementY", unit: "%", variable: "--entriviaAnnouncement-Y", min: 0, max: 100 },
  { id: "entriviaAnnouncementX", unit: "%", variable: "--entriviaAnnouncement-X", min: 0, max: 100 },
  { id: "entriviaQuestionY", unit: "%", variable: "--entriviaQuestion-Y", min: 0, max: 88 },
  { id: "entriviaQuestionX", unit: "%", variable: "--entriviaQuestion-X", min: 0, max: 71 },
  { id: "wheelY", unit: "%", variable: "--wheel-Y", min: 0, max: 66 },
  { id: "wheelX", unit: "%", variable: "--wheel-X", min: 0, max: 90 },
  { id: "wheelResultY", unit: "%", variable: "--wheelResult-Y", min: 0, max: 100 },
  { id: "wheelResultX", unit: "%", variable: "--wheelResult-X", min: 0, max: 100 },
  { id: "wheelLeverY", unit: "%", variable: "--wheelLever-Y", min: 0, max: 100 },
  { id: "wheelLeverX", unit: "%", variable: "--wheelLever-X", min: 0, max: 100 }
];
const wheelSliders = [
  { id: "wheelY", unit: "%", variable: "--wheel-Y", min: 0, max: 66 },
  { id: "wheelX", unit: "%", variable: "--wheel-X", min: 0, max: 90 },
  { id: "wheelResultY", unit: "%", variable: "--wheelResult-Y", min: 0, max: 100 },
  { id: "wheelResultX", unit: "%", variable: "--wheelResult-X", min: 0, max: 100 }
];
// Slider handling
sliders.forEach(({ id, unit, variable, min, max }) => {
  const input = document.getElementById(id);
  const valueDisplay = document.getElementById(id + "Value");

  // Apply min/max limits to the slider
  input.min = min;
  input.max = max;

  // Set the initial value of the slider based on the saved layout (if available)
  const savedSettings = JSON.parse(localStorage.getItem("themeSettings"));
  if (savedSettings && savedSettings.layout) {
    const savedValue = savedSettings.layout[variable];
    if (savedValue) {
      input.value = parseFloat(savedValue);
      valueDisplay.textContent = savedValue;
    }
  }

  // Add event listener for input changes
  input.addEventListener("input", () => {
    const value = input.value + unit; // Add the correct unit (px or %)
    root.style.setProperty(variable, value); // Update CSS variable
    valueDisplay.textContent = value; // Update value display

    // Save the updated layout to localStorage
    const currentSettings = JSON.parse(localStorage.getItem("themeSettings")) || {};
    const themeName = currentSettings.themeName || document.body.className || "";

    const newSettings = {
      themeName,
      layout: {
        ...(currentSettings.layout || {}),
        [variable]: value
      }
    };

    localStorage.setItem("themeSettings", JSON.stringify(newSettings));
  });
});

// Theme selection via buttons
document.querySelectorAll('.themeselect').forEach(button => {
  button.addEventListener('click', function() {
    // Get the ID of the clicked button
    const buttonId = this.id;

    // Remove 'Butt' from the buttonId and construct the theme name
    const theme = buttonId.replace('Butt', ''); // e.g., "light-theme" from "light-themeButt"
    console.log("Theme button clicked: " + theme);

    // Now, call the setTheme function with the theme name
    setTheme(theme);
	// if wheel script is enabled uncomment the repaintWheel function. otherwise comment it
	repaintWheel();
  });
});
function setTheme(themeName, saveLayout = true) {
  document.body.className = themeName;

  // Gather layout settings
  const layoutSettings = saveLayout ? {
    "--entriviaQuestion-Y": getComputedStyle(document.documentElement).getPropertyValue("--entriviaQuestion-Y"),
    "--entriviaQuestion-X": getComputedStyle(document.documentElement).getPropertyValue("--entriviaQuestion-X"),
    "--entriviaAnnouncement-Y": getComputedStyle(document.documentElement).getPropertyValue("--entriviaAnnouncement-Y"),
    "--entriviaAnnouncement-X": getComputedStyle(document.documentElement).getPropertyValue("--entriviaAnnouncement-X"),
    "--twitchchat-Y": getComputedStyle(document.documentElement).getPropertyValue("--twitchchat-Y"),
    "--twitchchat-X": getComputedStyle(document.documentElement).getPropertyValue("--twitchchat-X"),
	"--wheel-Y": getComputedStyle(document.documentElement).getPropertyValue("--twitchchat-Y"),
    "--wheel-X": getComputedStyle(document.documentElement).getPropertyValue("--twitchchat-X"),
	"--wheelResult-Y": getComputedStyle(document.documentElement).getPropertyValue("--wheelResult-Y"),
    "--wheelResult-X": getComputedStyle(document.documentElement).getPropertyValue("--wheelResult-X"),
    "--wheelLever-Y": getComputedStyle(document.documentElement).getPropertyValue("--wheelLever-Y"),
    "--wheelLever-X": getComputedStyle(document.documentElement).getPropertyValue("--wheelLever-X")
  } : {};

  // Save both theme and layout
  const themeSettings = {
    themeName,
    layout: layoutSettings,
  };

  localStorage.setItem("themeSettings", JSON.stringify(themeSettings));
  console.log("Saved theme settings:", themeSettings);
}


const backgroundImageURL = "https://pixelb8.lol./assets/images/ads/ads19.jpeg"; // Replace with your image
function setBackgroundImage(url) {
	document.body.style.backgroundImage = `url('${url}')`;
}
function removeBackgroundImage() {
	document.body.style.backgroundImage = "none";
}

// Toggle element fn 
//function to toggle element visibility
//example usage:
//toggleElement("myBox"); // Uses default "fade" animation
//toggleElement("myBox", "slide"); // Uses slide animation
//<button onclick="toggleElement('myBox')">Toggle Box</button>
//<button onclick="toggleElement('myBox', 'slide')">Toggle Slide Box</button>

function toggleElement(elementId, animationType = "fade") {
  const element = document.getElementById(elementId);
  if (!element) return false;  // Return false if element doesn't exist

  let isVisible = element.style.visibility === "visible";

  if (isVisible) {
	// Hide element with animation
	element.style.animation = animationType === "slide" ? "slideOut 0.5s ease-in forwards" : "fadeOut 0.5s ease-in forwards";
	setTimeout(() => {
	  console.log("Butt toggled " + elementId);
	  element.classList.remove("active");
	  element.style.visibility = "hidden";
	}, 500); // Matches animation duration
  } else {
	// Show element with animation
	element.style.visibility = "visible";
	element.classList.add("active");
	element.style.animation = animationType === "slide" ? "slideIn 0.8s ease-out forwards" : "fadeIn 0.8s ease-out forwards";
  }

  // Return the new visibility state (true for visible, false for hidden)
  return !isVisible;
}
function showElement(element, animationType = "fade") {
  if (!element) return;
  element.style.display = "block";
  element.style.visibility = "visible";
  element.style.opacity = "1.00";
  element.classList.add("active");
  element.style.animation = animationType === "slide"
	? "slideIn 0.8s ease-out forwards"
	: "fadeIn 0.8s ease-out forwards";
}
function hideElement(element, animationType = "fade") {
  if (!element) return;
  element.style.animation = animationType === "slide"
	? "slideOut 0.5s ease-in forwards"
	: "fadeOut 0.5s ease-in forwards";
  setTimeout(() => {
	element.classList.remove("active");
	element.style.display = "none";
	element.style.visibility = "hidden";
  }, 500); // Matches animation duration
}
document.querySelectorAll('.toggle-toggle').forEach(button => {
  const targetId = button.dataset.target;
  const animation = button.dataset.animation || "fade";
  
  button.addEventListener("click", () => {
	const isVisible = toggleElement(targetId, animation);
	button.innerHTML = isVisible
	  ? '<i class="fas fa-eye-slash"></i> Hide'
	  : '<i class="fas fa-eye"></i> Show';
  });
});
const showthemeExamplesSwitch = document.getElementById("showthemeExamples");
const examplemessagebox = document.getElementById("exampleMessagebox");
const examplepanelwrapper = document.getElementById("examplepanelwrapper");
showthemeExamplesSwitch.addEventListener("change", function () {
  if (this.checked) {
	showentrivia();
	showElement(examplemessagebox, "fade");
	showElement(examplepanelwrapper, "fade");
  } else {
	hideentrivia();
	hideElement(examplemessagebox, "fade");
	hideElement(examplepanelwrapper, "fade");
  }
});
document.querySelectorAll(".close-btn").forEach(btn => {
  btn.addEventListener("click", () => {
	const parent = btn.parentElement;
	if (parent && parent.id) {
	  toggleElement(parent.id, "fade"); // or use "slide", etc., depending on your animations
	}
  });
});

function updateIndicatorLights() { 
	let thesesettings = { usedefaultquestions, usecustomquestions, consolemessages, twitchChatOverlay, chatanswers, audioSetting, hideButtonBubble };
	document.querySelectorAll(".light-indicator").forEach(indicator => {
		const optionName = indicator.getAttribute("data-option");
		const optionValue = thesesettings[optionName]; // Get the value safely
		
		// Set light color based on value
		const lightColor = (optionValue === true || optionValue === "on") 
			? "green" 
			: (optionValue === false || optionValue === "off") 
				? "red" 
				: "gray"; // Fallback color
		indicator.style.backgroundColor = lightColor;

		// Find the nearest <strong> element and change text color
		const statusText = indicator.closest('.statusindicatorWrapper').querySelector('strong');
		if (statusText) {
			statusText.style.color = lightColor;  // Set the text color to green/red
			statusText.textContent = (optionValue === true || optionValue === "on") ? "Enabled" : "Disabled";
		}
	});
}
function updateAllStatusIndicators(configObject) {
  const indicators = document.querySelectorAll(".status-indicator");

  indicators.forEach(indicator => {
	const variable = indicator.dataset.statusVariable;
	const value = configObject[variable];

	// Remove all known status classes first
	indicator.classList.remove("status-on", "status-off", "status-always", "status-unknown");

	// Default fallback style
	let label = "—";
	if (value === "on") {
	  indicator.classList.add("status-on");
	  label = "ON";
	} else if (value === "always") {
	  indicator.classList.add("status-always");
	  label = "ALWAYS";
	} else if (value === "off") {
	  indicator.classList.add("status-off");
	  label = "OFF";
	} else {
	  indicator.classList.add("status-unknown");
	  label = value ?? "UNKNOWN";
	}

	// Optional: Set text inside the indicator
	indicator.textContent = label;
  });
}

// main button event listeners
//enentrivia-toggle button
document.getElementById("thePixelButt").addEventListener("click", function () {
	let container = document.getElementById("Bubble");
	container.classList.toggle("active");
	console.log("Butt clicked: thePixelButt");
});
// Adding event listener to the parent container (#Bubble)
document.getElementById('Bubble').addEventListener('click', function(event) {
	// Check if the clicked element has the 'Butt' class
	if (event.target.classList.contains('widgetcontrols')) {
		console.log("Bubblebutt opens some widget controls");
		// Get the ID of the clicked button
		const buttonId = event.target.id;

		// Remove 'Butt' from the buttonId and construct the corresponding controller ID
		const controllerId = buttonId.replace('Butt', '') + 'controller';
		console.log("Butt pressed: " + controllerId);
		toggleElement(controllerId, 'fade');
	}
});


document.getElementById("simulatebackground").addEventListener("change", function() {
  if (this.checked) {
    setBackgroundImage(backgroundImageURL);
  } else {
    removeBackgroundImage();
  }
});
document.querySelectorAll(".rangeinput").forEach(function(input) {
  input.addEventListener("input", function () {
    const value = (this.value - this.min) / (this.max - this.min) * 100;
    this.style.background = `var(--bg-color)`;
  });
});



function replaceAllSelects() {
    const selects = document.querySelectorAll('select');

    selects.forEach(originalSelect => {
        const customWrapper = document.createElement('div');
        customWrapper.classList.add('custom-dropdown');

        const selectedDiv = document.createElement('div');
        selectedDiv.classList.add('selected');
        selectedDiv.textContent = originalSelect.options[originalSelect.selectedIndex]?.text || 'Select...';
        customWrapper.appendChild(selectedDiv);

        const optionsDiv = document.createElement('div');
        optionsDiv.classList.add('options');

        [...originalSelect.options].forEach(option => {
            const optionDiv = document.createElement('div');
            optionDiv.classList.add('option');
            optionDiv.textContent = option.text;
            optionDiv.dataset.value = option.value;

            optionDiv.addEventListener('click', () => {
                selectedDiv.textContent = option.text;
                originalSelect.value = option.value;
                originalSelect.dispatchEvent(new Event('change'));
                customWrapper.classList.remove('active');
            });

            optionsDiv.appendChild(optionDiv);
        });

        customWrapper.appendChild(optionsDiv);

        selectedDiv.addEventListener('click', () => {
            customWrapper.classList.toggle('active');
        });

        originalSelect.style.display = 'none';
        originalSelect.parentNode.insertBefore(customWrapper, originalSelect);
    });

    // Close all custom dropdowns on outside click
    document.addEventListener('click', (e) => {
        document.querySelectorAll('.custom-dropdown').forEach(dropdown => {
            if (!dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    });
}

// On DOMContentLoaded, load saved theme and layout settings
window.addEventListener("DOMContentLoaded", () => {
  const savedSettings = JSON.parse(localStorage.getItem("themeSettings"));
  if (savedSettings) {
    // Set the theme
    document.body.className = savedSettings.themeName;

    // Set all layout variables
    const layout = savedSettings.layout || {};
    Object.entries(layout).forEach(([varName, value]) => {
      document.documentElement.style.setProperty(varName, value);
    });
	debugThemeStyles();
	replaceAllSelects();
    console.log("Loaded saved theme settings:", savedSettings);
  }
});
/* localStorage.removeItem("themeSettings"); */


