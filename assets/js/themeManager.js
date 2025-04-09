const ThemeManager = {
  init: function () {
    console.log("[ThemeManager] Initializing...");

    const savedTheme = this.getTheme();
    console.log("[ThemeManager] Saved theme:", savedTheme);
    if (savedTheme) {
      this.setTheme(savedTheme);
      console.log("[ThemeManager] Theme applied:", savedTheme);
    }

    this.applySavedLayout();

    // Handle theme button clicks
    document.querySelectorAll(".themeselect").forEach(button => {
      button.addEventListener("click", () => {
        const theme = button.id.replace("Butt", "");
        console.log(`[ThemeManager] Theme button clicked: ${theme}`);
        this.setTheme(theme);
      });
    });

    // Handle layout slider input events
    document.querySelectorAll(".layout-slider").forEach(slider => {
      slider.addEventListener("input", () => {
        const varName = slider.dataset.var;
        const suffix = slider.dataset.suffix || "";
        const value = slider.value + suffix;
        console.log(`[ThemeManager] Slider changed: ${varName} = ${value}`);
        this.saveLayoutVariable(varName, value);
      });

      // Restore saved layout settings
      const varName = slider.dataset.var;
      const savedValue = this.getSetting(varName);
      if (savedValue) {
        console.log(`[ThemeManager] Restoring saved slider value for ${varName}: ${savedValue}`);
        slider.value = parseFloat(savedValue);
        document.documentElement.style.setProperty(varName, savedValue);
      }
    });
  },

  setTheme(themeName) {
    console.log(`[ThemeManager] Setting theme: ${themeName}`);
    localStorage.setItem("theme", themeName);
    document.documentElement.className = themeName;
    console.log(`[ThemeManager] Theme set to: ${themeName}`);
  },

  getTheme() {
    const theme = localStorage.getItem("theme");
    console.log(`[ThemeManager] Retrieved theme from localStorage: ${theme}`);
    return theme;
  },

  saveLayoutVariable(varName, value) {
    console.log(`[ThemeManager] Saving layout variable: ${varName} = ${value}`);
    document.documentElement.style.setProperty(varName, value);
    localStorage.setItem(varName, value);
    console.log(`[ThemeManager] Layout variable saved: ${varName} = ${value}`);
  },

  applySavedLayout() {
    console.log("[ThemeManager] Applying saved layout...");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("--")) {
        const value = localStorage.getItem(key);
        console.log(`[ThemeManager] Applying layout variable: ${key} = ${value}`);
        document.documentElement.style.setProperty(key, value);
      }
    }
  },

  getSetting(key) {
    const value = localStorage.getItem(key);
    console.log(`[ThemeManager] Retrieved setting for ${key}: ${value}`);
    return value;
  }
};
