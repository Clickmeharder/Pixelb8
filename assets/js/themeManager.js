document.addEventListener("DOMContentLoaded", () => {
  // Theme buttons
  const themeButtons = document.querySelectorAll(".themeselect");
  themeButtons.forEach(button => {
    button.addEventListener("click", (event) => {
      const themeName = event.target.id.replace('-themeButt', '');
      setTheme(themeName);
    });
  });

  // Range sliders for position controls
  const sliders = document.querySelectorAll("input[type='range']");
  sliders.forEach(slider => {
    const valueLabel = document.getElementById(slider.id + "Value");
    
    // Update the value label when slider changes
    slider.addEventListener("input", () => {
      const value = slider.value;
      valueLabel.textContent = value + (slider.id.includes("X") ? "px" : "%");
      updateLayoutVariable(slider.id, value + (slider.id.includes("X") ? "px" : "%"));
    });

    // Initialize the slider values and labels on load
    const initialValue = slider.value;
    valueLabel.textContent = initialValue + (slider.id.includes("X") ? "px" : "%");
  });

  // Load saved theme and layout settings
  const savedSettings = JSON.parse(localStorage.getItem("themeSettings"));
  if (savedSettings) {
    document.body.className = savedSettings.themeName;
    const layout = savedSettings.layout || {};
    Object.entries(layout).forEach(([varName, value]) => {
      document.documentElement.style.setProperty(varName, value);
      const input = document.getElementById(varName);
      if (input) {
        input.value = parseInt(value);
        const valueLabel = document.getElementById(varName + "Value");
        if (valueLabel) {
          valueLabel.textContent = value + (varName.includes("X") ? "px" : "%");
        }
      }
    });
  }
});

function setTheme(themeName, saveLayout = true) {
  document.body.className = themeName;

  const layoutSettings = saveLayout ? {
    "--entriviaQuestion-Y": getComputedStyle(document.documentElement).getPropertyValue("--entriviaQuestion-Y"),
    "--entriviaQuestion-X": getComputedStyle(document.documentElement).getPropertyValue("--entriviaQuestion-X"),
    "--entriviaAnnouncement-Y": getComputedStyle(document.documentElement).getPropertyValue("--entriviaAnnouncement-Y"),
    "--entriviaAnnouncement-X": getComputedStyle(document.documentElement).getPropertyValue("--entriviaAnnouncement-X"),
    "--twitchchat-Y": getComputedStyle(document.documentElement).getPropertyValue("--twitchchat-Y"),
    "--twitchchat-X": getComputedStyle(document.documentElement).getPropertyValue("--twitchchat-X"),
  } : {};

  const themeSettings = {
    themeName,
    layout: layoutSettings,
  };

  localStorage.setItem("themeSettings", JSON.stringify(themeSettings));
}

function updateLayoutVariable(varName, value) {
  document.documentElement.style.setProperty(varName, value);

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