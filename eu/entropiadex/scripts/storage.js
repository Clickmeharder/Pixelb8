function loadMissionsFromStorage() {
  const storedMissions = localStorage.getItem('missionsData');
  if (storedMissions) {
    missionsData = JSON.parse(storedMissions);
    updateMissionsList();
  }
}

function saveMissionsToStorage() {
  localStorage.setItem('missionsData', JSON.stringify(missionsData));
}
