const ThemeManager = {
  init: function () {
    console.log("[ThemeManager] Initializing...");

    const savedTheme = this.getTheme();
    console.log("[ThemeManager] Saved theme:", savedTheme);

    if (savedTheme) {
      this.setTheme(savedTheme);
      console.log("[ThemeManager] Theme applied:", savedTheme);
    } else {
      console.log("[ThemeManager] No saved theme found. Proceeding with default theme.");
    }

    this.applySavedLayout();

    // Handle theme button clicks
    document.querySelectorAll(".themeselect").forEach(button => {
      button.addEventListener("click", () => {
        const theme = button.id.replace("-themeButt", "");  // Adjusting for the exact match of 'themeButt'
        console.log(`[ThemeManager] Theme button clicked: ${theme}`);
        this.setTheme(theme); // Call setTheme
      });
    });
  },

  setTheme(themeName) {
    console.log(`[ThemeManager] Setting theme: ${themeName}`);
    // Save to localStorage
    localStorage.setItem("theme", themeName);
    
    // Apply theme class to the <body> element (to control theme-related styles)
    document.body.className = themeName; // Set theme class on the <body> tag
    
    console.log(`[ThemeManager] Theme set to: ${themeName}`);
    console.log(`[ThemeManager] theme saved to localStorage: ${localStorage.getItem("theme")}`);
  },

  getTheme() {
    const theme = localStorage.getItem("theme");
    console.log(`[ThemeManager] Retrieved theme from localStorage: ${theme}`);
    return theme;
  },

  saveLayoutVariable(varName, value) {
    console.log(`[ThemeManager] Saving layout variable: ${varName} = ${value}`);
    document.documentElement.style.setProperty(varName, value); // Apply positioning/layout variable to <html>
    localStorage.setItem(varName, value);
    console.log(`[ThemeManager] Layout variable saved: ${varName} = ${value}`);
  },

  applySavedLayout() {
    console.log("[ThemeManager] Applying saved layout...");
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("--")) {  // Apply layout variables (those starting with --)
        const value = localStorage.getItem(key);
        console.log(`[ThemeManager] Applying layout variable: ${key} = ${value}`);
        document.documentElement.style.setProperty(key, value); // Apply to <html>
      }
    }
  },

  getSetting(key) {
    const value = localStorage.getItem(key);
    console.log(`[ThemeManager] Retrieved setting for ${key}: ${value}`);
    return value;
  }
};
