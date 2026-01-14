document.addEventListener('DOMContentLoaded', () => {

  // Grab the necessary elements from the DOM
  const planetSelect = document.getElementById('planetSelect');
  const tabNav = document.querySelector('.tab-nav');
  const missionsContent = document.getElementById('missionsContent');
  const creatureCodexContent = document.getElementById('creatureCodexContent');
  const miningClaimsContent = document.getElementById('miningClaimsContent');
  
  const missionsList = document.getElementById('missionsList');
  const creatureCodexList = document.getElementById('creatureCodexList');
  const miningClaimsList = document.getElementById('miningClaimsList');


  let currentTab = 'missions';  // Initialize the current tab

  // Show tabs when a planet is selected
  planetSelect.addEventListener('change', function () {
    if (planetSelect.value !== "") {
      tabNav.style.display = 'block'; // Show tab navigation
      openTab('missions'); // Default to showing Missions tab content
    }
  });

  // Function to open and switch between tabs
  function openTab(tabName) {
    // Hide all content sections
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => section.style.display = 'none');
    // Remove active class from all buttons
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => button.classList.remove('active'));
    // Show the clicked tab's content
    const tabContent = document.getElementById(tabName + 'Content');
    if (tabContent) {
      tabContent.style.display = 'block';
    } else {
      console.error(`Tab content with id '${tabName}Content' not found!`);
    }
    // Add 'active' class to the clicked button
    const activeButton = document.querySelector(`.tab-btn[id="${tabName}Tab"]`);
    if (activeButton) {
      activeButton.classList.add('active');
    } else {
      console.error(`Tab button for '${tabName}' not found!`);
    }
  }

  // Event listeners for the tabs
  document.getElementById('missionsTab').addEventListener('click', () => openTab('missions'));
  document.getElementById('creatureCodexTab').addEventListener('click', () => openTab('creatureCodex'));
  document.getElementById('miningClaimsTab').addEventListener('click', () => openTab('miningClaims'));



  // Open modal when 'Add Mission' button is clicked
  document.getElementById('addMissionBtn').addEventListener('click', () => {
    // Clear the input fields in case of re-opening the modal
    missionNameInput.value = '';
    pickupLocationInput.value = '';
    objectiveInput.value = '';
    objectiveLocationInput.value = '';
    turnInLocationInput.value = '';
    rewardInput.value = '';
    categorySelect.value = '';
    repeatableCheckbox.checked = false;
    prerequisiteCheckbox.checked = false;

    addMissionModal.style.display = 'block';
    currentTab = 'missions';
  });

  // Close modal
  closeModalBtn.addEventListener('click', () => {
    addMissionModal.style.display = 'none';
  });

  // Save new entry
  saveEntryBtn.addEventListener('click', () => {
    // Collect input data
    const newMission = {
        name: missionNameInput.value,
        pickupLocation: pickupLocationInput.value,
        objective: objectiveInput.value,
        objectiveLocation: objectiveLocationInput.value,
        turnInLocation: turnInLocationInput.value,
        reward: rewardInput.value,
        category: categorySelect.value,
        repeatable: repeatableCheckbox.checked,
        prerequisite: prerequisiteCheckbox.checked
    };

    // Only add the mission if the name is provided
    if (newMission.name.trim() !== '') {
        missionsData.push(newMission);

        // Save updated missionsData to localStorage
        localStorage.setItem('missionsData', JSON.stringify(missionsData));

        updateMissionsList();
        addMissionModal.style.display = 'none'; // Close modal
    }
});


  // Function to update the mission list display
  function updateMissionsList() {
    missionsList.innerHTML = ''; // Clear the list
    missionsData.forEach((mission, index) => {
      const listItem = document.createElement('li');
      listItem.classList.add('mission-item');
      listItem.innerHTML = `
        <strong>${mission.name}</strong> (Category: ${mission.category})<br>
        Pickup: ${mission.pickupLocation}<br>
        Objective: ${mission.objective} at ${mission.objectiveLocation}<br>
        Turn In: ${mission.turnInLocation}<br>
        Reward: ${mission.reward}<br>
        Repeatable: ${mission.repeatable ? 'Yes' : 'No'}, Prerequisite: ${mission.prerequisite ? 'Yes' : 'No'}<br>
        <button class="editMissionBtn" data-index="${index}">Edit</button>
        <button class="deleteMissionBtn" data-index="${index}">Delete</button>
      `;
      missionsList.appendChild(listItem);
    });

    // Add event listeners for editing and deleting missions
    document.querySelectorAll('.editMissionBtn').forEach(button => {
      button.addEventListener('click', (e) => {
        const missionIndex = e.target.getAttribute('data-index');
        editMission(missionIndex);
      });
    });

    document.querySelectorAll('.deleteMissionBtn').forEach(button => {
      button.addEventListener('click', (e) => {
        const missionIndex = e.target.getAttribute('data-index');
        deleteMission(missionIndex);
      });
    });
  }

  // Edit mission function
  function editMission(index) {
    const mission = missionsData[index];
    missionNameInput.value = mission.name;
    pickupLocationInput.value = mission.pickupLocation;
    objectiveInput.value = mission.objective;
    objectiveLocationInput.value = mission.objectiveLocation;
    turnInLocationInput.value = mission.turnInLocation;
    rewardInput.value = mission.reward;
    categorySelect.value = mission.category;
    repeatableCheckbox.checked = mission.repeatable;
    prerequisiteCheckbox.checked = mission.prerequisite;

    addMissionModal.style.display = 'block';

    // Replace the save button functionality with edit functionality
    saveEntryBtn.removeEventListener('click', saveMission);
    saveEntryBtn.addEventListener('click', () => saveMission(index));
  }

  // Save mission (edit or new)
  function saveMission(index = null) {
    const updatedMission = {
      name: missionNameInput.value,
      pickupLocation: pickupLocationInput.value,
      objective: objectiveInput.value,
      objectiveLocation: objectiveLocationInput.value,
      turnInLocation: turnInLocationInput.value,
      reward: rewardInput.value,
      category: categorySelect.value,
      repeatable: repeatableCheckbox.checked,
      prerequisite: prerequisiteCheckbox.checked
    };

    if (updatedMission.name.trim() !== '') {
      if (index === null) {
        missionsData.push(updatedMission); // New mission
      } else {
        missionsData[index] = updatedMission; // Edit existing mission
      }
      updateMissionsList();
      addMissionModal.style.display = 'none'; // Close modal
    }
  }

  // Delete mission
  function deleteMission(index) {
    missionsData.splice(index, 1); // Remove the mission from the array
    localStorage.setItem('missionsData', JSON.stringify(missionsData)); // Save updated data
    updateMissionsList(); // Refresh the list
  }


  // Default to "Missions" tab on page load
  openTab('missions');
});
