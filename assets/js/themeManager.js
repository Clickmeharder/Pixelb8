const ThemeManager = {
  init: function () {
    const savedTheme = this.getTheme();
    if (savedTheme) this.setTheme(savedTheme);

    this.applySavedLayout();

    document.querySelectorAll(".themeselect").forEach(button => {
      button.addEventListener("click", () => {
        const theme = button.id.replace("Butt", "");
        this.setTheme(theme);
      });
    });

    document.querySelectorAll(".layout-slider").forEach(slider => {
      slider.addEventListener("input", () => {
        const varName = slider.dataset.var;
        const suffix = slider.dataset.suffix || "";
        const value = slider.value + suffix;
        this.saveLayoutVariable(varName, value);
      });

      const varName = slider.dataset.var;
      const savedValue = this.getSetting(varName);
      if (savedValue) {
        slider.value = parseFloat(savedValue);
        document.documentElement.style.setProperty(varName, savedValue);
      }
    });
  },

  setTheme(themeName) {
    localStorage.setItem("theme", themeName);
    document.documentElement.className = themeName;
  },

  getTheme() {
    return localStorage.getItem("theme");
  },

  saveLayoutVariable(varName, value) {
    document.documentElement.style.setProperty(varName, value);
    localStorage.setItem(varName, value);
  },

  applySavedLayout() {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith("--")) {
        const value = localStorage.getItem(key);
        document.documentElement.style.setProperty(key, value);
      }
    }
  },

  getSetting(key) {
    return localStorage.getItem(key);
  }
};
