document.addEventListener('DOMContentLoaded', () => {
  setupUI();
  setupMissions();
  loadMissionsFromStorage();
  openTab('missions');
});