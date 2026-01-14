let missionsData = JSON.parse(localStorage.getItem('missionsData')) || [];
const planetSelect = document.getElementById('planetSelect');

function setupMissions() {
    loadMissionsFromStorage();
    updateMissionsList();
}

// Filter and display missions based on selected planet
function updateMissionsList() {
    const missionsList = document.getElementById('missionsList');
    missionsList.innerHTML = '';

    console.log("Updating missions list... Current planet:", planetSelect.value);
    console.log("Missions before filtering:", missionsData);

    const selectedPlanet = planetSelect.value;
    const filteredMissions = selectedPlanet === "all" 
        ? missionsData 
        : missionsData.filter(mission => mission.planet === selectedPlanet);

    console.log("Filtered missions:", filteredMissions);

    filteredMissions.forEach((mission, index) => {
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

    console.log("Mission list updated.");

    document.querySelectorAll('.editMissionBtn').forEach(button => {
        button.addEventListener('click', e => editMission(e.target.dataset.index));
    });

    document.querySelectorAll('.deleteMissionBtn').forEach(button => {
        button.addEventListener('click', e => deleteMission(e.target.dataset.index));
    });
}

function saveMission(index = null) {
    const mission = {
        name: document.getElementById('missionNameInput').value.trim(),
        pickupLocation: document.getElementById('pickupLocationInput').value,
        objective: document.getElementById('objectiveInput').value,
        objectiveLocation: document.getElementById('objectiveLocationInput').value,
        turnInLocation: document.getElementById('turnInLocationInput').value,
        reward: document.getElementById('rewardInput').value,
        category: document.getElementById('categorySelect').value,
        repeatable: document.getElementById('repeatableCheckbox').checked,
        prerequisite: document.getElementById('prerequisiteCheckbox').checked,
        planet: planetSelect.value
    };

    console.log("Saving mission:", mission); // Debugging

    if (mission.name) {
        if (index === null) {
            missionsData.push(mission);
            console.log("New mission added:", mission);
        } else {
            missionsData[index] = mission;
            console.log("Mission updated at index:", index, mission);
        }

        saveMissionsToStorage();
        updateMissionsList();
        closeMissionModal();
    } else {
        console.error("Mission name is required!");
    }
}

function editMission(index) {
    const mission = missionsData[index];
    document.getElementById('missionNameInput').value = mission.name;
    document.getElementById('pickupLocationInput').value = mission.pickupLocation;
    document.getElementById('objectiveInput').value = mission.objective;
    document.getElementById('objectiveLocationInput').value = mission.objectiveLocation;
    document.getElementById('turnInLocationInput').value = mission.turnInLocation;
    document.getElementById('rewardInput').value = mission.reward;
    document.getElementById('categorySelect').value = mission.category;
    document.getElementById('repeatableCheckbox').checked = mission.repeatable;
    document.getElementById('prerequisiteCheckbox').checked = mission.prerequisite;
    document.getElementById('planetSelect').value = mission.planet;

    showMissionModal();

    document.getElementById('saveEntryBtn').onclick = () => saveMission(index);
}

function loadMissionsFromStorage() {
    const storedMissions = localStorage.getItem('missionsData');
    if (storedMissions) {
        missionsData = JSON.parse(storedMissions);
        console.log("Loaded missions from storage:", missionsData);
        updateMissionsList();
    } else {
        console.log("No missions found in storage.");
    }
}

function saveMissionsToStorage() {
    console.log("Current Missions in Storage:", localStorage.getItem('missionsData'));
    console.log("Current Missions in Memory:", missionsData);
    localStorage.setItem('missionsData', JSON.stringify(missionsData));
}

function deleteMission(index) {
    missionsData.splice(index, 1);
    saveMissionsToStorage();
    updateMissionsList();
}

document.getElementById('deleteAllMissionsBtn').addEventListener('click', () => {
    localStorage.removeItem('missionsData');
    missionsData = [];
    updateMissionsList();
    console.log("All missions deleted.");
    alert("All missions have been deleted.");
});

planetSelect.addEventListener('change', updateMissionsList);

document.getElementById('showAllMissionsBtn').addEventListener('click', () => {
    planetSelect.value = "all";
    console.log("Show all missions triggered, current planet:", planetSelect.value);
    updateMissionsList();
});
