function setTheme(themeName, saveLayout = true) {
  // Apply theme to body
  document.body.className = themeName;

  // Gather layout settings if required
  const layoutSettings = saveLayout ? {
    "--entriviaQuestion-Y": getComputedStyle(document.documentElement).getPropertyValue("--entriviaQuestion-Y"),
    "--entriviaQuestion-X": getComputedStyle(document.documentElement).getPropertyValue("--entriviaQuestion-X"),
    "--entriviaAnnouncement-Y": getComputedStyle(document.documentElement).getPropertyValue("--entriviaAnnouncement-Y"),
    "--entriviaAnnouncement-X": getComputedStyle(document.documentElement).getPropertyValue("--entriviaAnnouncement-X"),
    "--twitchchat-Y": getComputedStyle(document.documentElement).getPropertyValue("--twitchchat-Y"),
    "--twitchchat-X": getComputedStyle(document.documentElement).getPropertyValue("--twitchchat-X"),
  } : {};

  // Save both theme and layout in localStorage
  const themeSettings = {
    themeName,
    layout: layoutSettings,
  };

  localStorage.setItem("themeSettings", JSON.stringify(themeSettings));
  console.log("Saved theme settings:", themeSettings);
}

window.addEventListener("DOMContentLoaded", () => {
  const savedSettings = JSON.parse(localStorage.getItem("themeSettings"));
  if (savedSettings) {
    // Set the theme on page load
    document.body.className = savedSettings.themeName;

    // Apply all layout variables
    const layout = savedSettings.layout || {};
    Object.entries(layout).forEach(([varName, value]) => {
      document.documentElement.style.setProperty(varName, value);
    });

    console.log("Loaded saved theme settings:", savedSettings);
  }
});

function updateLayoutVariable(varName, value) {
  // Update the layout variable
  document.documentElement.style.setProperty(varName, value);

  // Save new layout, keeping the current theme
  const currentSettings = JSON.parse(localStorage.getItem("themeSettings")) || {};
  const themeName = currentSettings.themeName || document.body.className || "";

  const newSettings = {
    themeName,
    layout: {
      ...(currentSettings.layout || {}),
      [varName]: value
    }
  };

  localStorage.setItem("themeSettings", JSON.stringify(newSettings));
}

// Example of handling slider inputs to update layout variables
const slider = document.getElementById("slider"); // Make sure this element exists
slider.addEventListener("input", () => {
  const value = slider.value + "%"; // Assuming you want a percentage
  updateLayoutVariable("--entriviaQuestion-Y", value);
});

// Initialize the input fields with the current layout values on page load
document.getElementById("entriviaQuestionY").value = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--entriviaQuestion-Y"));
document.getElementById("entriviaQuestionX").value = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--entriviaQuestion-X"));
document.getElementById("entriviaAnnouncementY").value = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--entriviaAnnouncement-Y"));
document.getElementById("entriviaAnnouncementX").value = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--entriviaAnnouncement-X"));
document.getElementById("twitchchatY").value = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--twitchchat-Y"));
document.getElementById("twitchchatX").value = parseInt(getComputedStyle(document.documentElement).getPropertyValue("--twitchchat-X"));