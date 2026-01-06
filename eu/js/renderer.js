
  // === Main tabs ===
  const mainTabs = document.querySelectorAll('.tab');
  const mainContents = document.querySelectorAll('.tab-content');

  mainTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      mainTabs.forEach(t => t.classList.remove('active'));
      mainContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
    });
  });

  // === Loot subtabs ===
  const lootTabs = document.querySelectorAll('.weaponcompare-tab');
  const lootContents = document.querySelectorAll('.weaponcompare-subtab-content');

  lootTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      lootTabs.forEach(t => t.classList.remove('active'));
      lootContents.forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const target = document.getElementById(tab.dataset.tab);
      if (target) target.classList.add('active');
    });
  });

// ===== Optional Voice Control (stub) =====
function initVoiceControl() {
  if (!('webkitSpeechRecognition' in window)) {
    console.log("Voice recognition not supported.");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim();
    console.log("Voice command detected:", transcript);
  };
  recognition.start();
}

initVoiceControl(); // Uncomment to enable early
