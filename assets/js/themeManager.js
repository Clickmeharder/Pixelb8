const root = document.documentElement;

const sliders = [
  { id: "twitchchatY", unit: "%", variable: "--twitchchat-Y", min: 0, max: 75 },
  { id: "twitchchatX", unit: "%", variable: "--twitchchat-X", min: 0, max: 100 },
  { id: "entriviaAnnouncementY", unit: "%", variable: "--entriviaAnnouncement-Y", min: 0, max: 100 },
  { id: "entriviaAnnouncementX", unit: "%", variable: "--entriviaAnnouncement-X", min: 0, max: 100 },
  { id: "entriviaQuestionY", unit: "%", variable: "--entriviaQuestion-Y", min: 0, max: 88 },
  { id: "entriviaQuestionX", unit: "%", variable: "--entriviaQuestion-X", min: 0, max: 71 },
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
  });
});
function updateBubblewrapVisibility() {
	const bubblewrap = document.getElementById("bubblewrap");

	if (!bubblewrap) return;

	const hide = hideButtonBubble === true || hideButtonBubble === "on";

	bubblewrap.style.opacity = hide ? "0.00" : "1.00";
}
// Set theme function to update the theme and save the layout
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
  } : {};

  // Save both theme and layout
  const themeSettings = {
    themeName,
    layout: layoutSettings,
  };

  localStorage.setItem("themeSettings", JSON.stringify(themeSettings));
  console.log("Saved theme settings:", themeSettings);
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

    console.log("Loaded saved theme settings:", savedSettings);
  }
});
/* localStorage.removeItem("themeSettings"); */
updateBubblewrapVisibility();