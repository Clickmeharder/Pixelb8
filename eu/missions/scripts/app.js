document.addEventListener("DOMContentLoaded", () => {
    const planetSelect = document.getElementById("planetSelect");
    const missionsList = document.getElementById("missionsList");
    const addMissionBtn = document.getElementById("addMissionBtn");
    const deleteAllMissionsBtn = document.getElementById("deleteAllMissionsBtn");
    const missionsTab = document.getElementById("missionsTab");

    const modal = document.getElementById("addMissionModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const missionForm = document.getElementById("missionForm");
    const missionNameInput = document.getElementById("missionName");
    const objectiveInput = document.getElementById("objective");
    const rewardInput = document.getElementById("reward");

    let missions = []; // Default + user missions
    let userMissions = JSON.parse(localStorage.getItem("userMissions")) || [];

    // Load default missions from CSV
    async function loadDefaultMissions() {
        try {
            const response = await fetch("/eu/missions/assets/data/defaultmissions.csv");
            if (!response.ok) throw new Error("Failed to load missions");

            const csvText = await response.text();
            missions = parseCSV(csvText);
            displayMissions();
        } catch (error) {
            console.error("Error loading default missions:", error);
        }
    }

    // Parse CSV into JSON format
    function parseCSV(csvText) {
        return csvText.trim().split("\n").slice(1).map(line => {
            const [planet, name, , type, objective, repeatable, reward] = line.split(";");
            return { planet, name, type, objective, repeatable, reward };
        });
    }

    // Display missions based on selected planet
    function displayMissions() {
        missionsList.innerHTML = "";
        const selectedPlanet = planetSelect.value;

        const filteredMissions = [...missions, ...userMissions].filter(m => m.planet === selectedPlanet);

        filteredMissions.forEach((mission, index) => {
            const li = document.createElement("li");
            li.innerHTML = `
                <strong>${mission.name}</strong> - ${mission.objective} (${mission.type || "Unknown"}) 
                <br> Reward: ${mission.reward || "None"} 
                <br> <button onclick="editMission(${index})">Edit</button>
                <button onclick="deleteMission(${index})">Delete</button>
            `;
            missionsList.appendChild(li);
        });
    }

    // Show modal
    addMissionBtn.addEventListener("click", () => {
        modal.style.display = "block";
        missionForm.dataset.editIndex = ""; // Clear edit index
    });

    // Hide modal
    closeModalBtn.addEventListener("click", () => modal.style.display = "none");

    // Save or update mission
    missionForm.addEventListener("submit", event => {
        event.preventDefault();
        const newMission = {
            planet: planetSelect.value,
            name: missionNameInput.value.trim(),
            objective: objectiveInput.value.trim(),
            reward: rewardInput.value.trim()
        };

        if (!newMission.planet) return alert("Select a planet first!");

        const editIndex = missionForm.dataset.editIndex;
        if (editIndex) {
            userMissions[editIndex] = newMission;
        } else {
            userMissions.push(newMission);
        }

        localStorage.setItem("userMissions", JSON.stringify(userMissions));
        displayMissions();
        modal.style.display = "none";
        missionForm.reset();
    });

    // Edit mission
    window.editMission = function(index) {
        const mission = userMissions[index];
        missionNameInput.value = mission.name;
        objectiveInput.value = mission.objective;
        rewardInput.value = mission.reward;
        modal.style.display = "block";
        missionForm.dataset.editIndex = index;
    };

    // Delete mission
    window.deleteMission = function(index) {
        if (confirm("Delete this mission?")) {
            userMissions.splice(index, 1);
            localStorage.setItem("userMissions", JSON.stringify(userMissions));
            displayMissions();
        }
    };

    // Delete all user missions
    deleteAllMissionsBtn.addEventListener("click", () => {
        if (confirm("Delete all user-added missions?")) {
            localStorage.removeItem("userMissions");
            userMissions = [];
            displayMissions();
        }
    });

    // Show missions when clicking tab
    missionsTab.addEventListener("click", displayMissions);

    // Load default missions
    loadDefaultMissions();
});
