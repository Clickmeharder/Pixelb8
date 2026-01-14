function setupUI() {
  const planetSelect = document.getElementById('planetSelect');
  const tabNav = document.querySelector('.tab-nav');

  planetSelect.addEventListener('change', () => {
    if (planetSelect.value !== "") {
      tabNav.style.display = 'block';
      openTab('missions');
    }
  });

  document.getElementById('missionsTab').addEventListener('click', () => openTab('missions'));
  document.getElementById('creatureCodexTab').addEventListener('click', () => openTab('creatureCodex'));
  document.getElementById('miningClaimsTab').addEventListener('click', () => openTab('miningClaims'));

  document.getElementById('addMissionBtn').addEventListener('click', showMissionModal);
  document.getElementById('closeModalBtn').addEventListener('click', closeMissionModal);
  document.getElementById('saveEntryBtn').addEventListener('click', saveMission);
}

function openTab(tabName) {
  document.querySelectorAll('.content-section').forEach(section => section.style.display = 'none');
  document.querySelectorAll('.tab-btn').forEach(button => button.classList.remove('active'));

  const tabContent = document.getElementById(`${tabName}Content`);
  if (tabContent) tabContent.style.display = 'block';

  const activeButton = document.querySelector(`.tab-btn[id="${tabName}Tab"]`);
  if (activeButton) activeButton.classList.add('active');
}

function showMissionModal() {
  document.getElementById('addMissionModal').style.display = 'block';
}

function closeMissionModal() {
  document.getElementById('missionForm').reset(); // Resets all inputs
  document.getElementById('addMissionModal').style.display = 'none';
}
document.getElementById('closeModalBtn').addEventListener('click', () => {
    const missionForm = document.getElementById('missionForm'); // Make sure this matches your form's ID
    if (missionForm) {
        missionForm.reset(); // Reset all form inputs
    }

    closeMissionModal(); // Close the modal
});