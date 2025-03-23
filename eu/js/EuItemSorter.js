let allRows = []; // Global variable to store all rows
// Keep track of the current sorting order for each column
const sortingOrders = {};
 /*---------------------------
   Initial Data Processing
---------------------------- */
// function to get the planets from the container column
function getPlanetFromContainer(container) {
  if (!container) return "";
  const match = container.match(/\((.*?)\)/);
  return match ? match[1] : "";
}

//function for removing header row, and empty rows
function preprocessInputData(inputData) {
    // Remove leading and trailing whitespace
    inputData = inputData.trim();
    // Split the input data into rows and columns
    let rows = inputData.split("\n");
    // Remove the header row if it exists
    if (rows.length > 0) {
        const headerRow = rows[0];
        if (headerRow === "Name\tQuantity\tValue\tContainer") {
            rows.shift(); // Remove the header row
        }
    }
    // Remove trailing empty rows or rows with only whitespace
    for (let i = rows.length - 1; i >= 0; i--) {
        if (rows[i].trim() === "") {
            rows.pop(); // Remove the empty row
        } else {
            break; // Stop when encountering a non-empty row
        }
    }
    return rows;
}




function processInput() {
    var button = document.getElementById("processitemlistdatabutt");
    var desiredVoiceIndex = 0;
    // Speak a message indicating that processing is complete
    speakLabel(" ,..Beep..., Analyzing...", desiredVoiceIndex);
    const inputTextArea = document.getElementById("itemData");
    let inputData = inputTextArea.value;
    // Preprocess the input data
    let rows = preprocessInputData(inputData);

    // Split the processed data into items
    const items = rows.map(row => row.split("\t"));

    var desiredVoiceIndex = 0;
    // Speak a message indicating that processing is complete
    speakLabel(" ,..Beep, beep, .", desiredVoiceIndex);
    // Populate the table with the processed data
    populateTable(items);

    // Extract unique planet names from the input data and populate the dropdown
    const planetSelect = document.getElementById("planetSelect");
    planetSelect.innerHTML = ""; // Clear existing options

    // Add a disabled and selected option "Select a planet"
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select a planet";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    planetSelect.appendChild(defaultOption);

    // Extract unique planet names from the input data and populate the dropdown
    const uniquePlanets = [...new Set(items.map(item => getPlanetFromContainer(item[3])))];

    // Include "Show All," "CARRIED," and "ESTATE" in the unique planets list
    uniquePlanets.push("Show All", "CARRIED", "ESTATE");

    uniquePlanets.forEach(planet => {
        const option = document.createElement("option");
        option.value = planet;
        option.textContent = planet;
        planetSelect.appendChild(option);
    });
	    // Change the button text to "Success!"
    
    button.textContent = "Data Processed Successfully!";
    button.style.filter = "hue-rotate(180deg)";
// Set a timeout to revert the button text after a few seconds
    setTimeout(function() {
        button.textContent = "Click to Process Data";
        button.style.filter = "none";
    }, 3000); // Change the button text back after 3000 milliseconds (3 seconds)
}

 /*------------------------------------------
   Table Population, Sorting, and Filtering
---------------------------------------------- */
// Function Table Population (includes calculateTotal)
function populateTable(data) {
  const tbody = document.querySelector("#itemTable tbody");

  // Clear existing rows
  tbody.innerHTML = "";

  // Populate the table with data
  data.forEach(item => {
    const row = document.createElement("tr");
    item.forEach(value => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.appendChild(cell);
    });
    tbody.appendChild(row);
    calculateTotalValue();
  });
}


// Function for sorting the table when clicking a column header
function sortTable(columnIndex) {
  const table = document.getElementById("itemTable");
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  // Determine the sorting order for the current column
  if (!sortingOrders[columnIndex]) {
    sortingOrders[columnIndex] = 'asc'; // Default to ascending order
  } else if (sortingOrders[columnIndex] === 'asc') {
    sortingOrders[columnIndex] = 'desc'; // Toggle to descending order
  } else {
    sortingOrders[columnIndex] = 'asc'; // Toggle back to ascending order
  }

  // Sort the rows based on the content of the selected column and the current sorting order
  rows.sort((a, b) => {
    const aValue = a.children[columnIndex] ? a.children[columnIndex].textContent : "";
    const bValue = b.children[columnIndex] ? b.children[columnIndex].textContent : "";
    let comparison = aValue.localeCompare(bValue, { numeric: true });
    return sortingOrders[columnIndex] === 'asc' ? comparison : -comparison;
  });

  // Update the table with the sorted rows
  tbody.innerHTML = "";
  rows.forEach(row => tbody.appendChild(row));
}
      /* Filtering */
// Function to filter items by planet- needs much better modularization& optimization
function filterItemsByPlanet() {
  const planetSelect = document.getElementById("planetSelect");
  const selectedPlanet = planetSelect.value.toLowerCase(); // Convert to lowercase
  const table = document.getElementById("itemTable");
  const tbody = table.querySelector("tbody");
  const rows = Array.from(tbody.querySelectorAll("tr"));

  // Show/hide rows based on the selected planet
  rows.forEach(row => {
    const containerCell = row.children[3];

    // Check if containerCell is defined before accessing textContent
    if (containerCell) {
      const container = containerCell.textContent.trim(); // Trim any leading or trailing whitespace
      const rowPlanet = getPlanetFromContainer(container);

      let showRow = false;

      // Check for special cases
      if (selectedPlanet === "show all") {
        showRow = true;
      } else if (selectedPlanet === "carried") {
        showRow = rowPlanet.toLowerCase() === "carried";
      } else if (selectedPlanet === "estate") {
        showRow = rowPlanet.toLowerCase() === "estate";
      } else {
        // Regular planet filtering
        showRow = rowPlanet.toLowerCase() === selectedPlanet;
      }

      row.style.display = showRow ? "" : "none";
    }
  });

  // Update the listed value after filtering
  updateListedValue();
}
// Function for filtering with inventory search input - needs much better modularization& optimization
function searchInventory() {
    const searchInput = document.getElementById("inventorySearch").value.toLowerCase();
    const table = document.getElementById("itemTable");
    const tbody = table.querySelector("tbody");

    let totalDisplayedValue = 0.00; // Initialize total displayed value

    // Reset totalDisplayedValue to 0 before calculating
    totalDisplayedValue = 0.00;

    // Check if the search input is empty
    if (searchInput.trim() === "") {
        // If search input is empty, display all rows that were set when the selected planet dropdown was selected
        allRows.forEach(row => {
            row.style.display = "";
            // Add the value of displayed rows to the total displayed value
            const valueCell = row.querySelector("td:nth-child(3)");
            if (valueCell) {
                const valueText = valueCell.textContent.trim();
                const floatValue = parseFloat(valueText);
                if (!isNaN(floatValue)) {
                    totalDisplayedValue += floatValue;
                }
            }
        });
    } else {
        // If search input is not empty, filter and display rows based on the search input
        allRows.forEach(row => {
            if (row.style.display !== "none") {
                let shouldShow = false;
                row.querySelectorAll("td").forEach(cell => {
                    if (cell.textContent.toLowerCase().includes(searchInput)) {
                        shouldShow = true;
                        // If the row matches the search input, add its value to the total displayed value
                        const valueCell = row.querySelector("td:nth-child(3)");
                        if (valueCell) {
                            const valueText = valueCell.textContent.trim();
                            const floatValue = parseFloat(valueText);
                            if (!isNaN(floatValue)) {
                                totalDisplayedValue += floatValue;
                            }
                        }
                    }
                });
                row.style.display = shouldShow ? "" : "none";
            }
        });
    }

    // Update the displayed total value
    const totalValueElement = document.getElementById("ListedValue");
    totalValueElement.textContent = "Listed Value: " + totalDisplayedValue.toFixed(2); // Display total value with 2 decimal places
}
/*----------------------------*/


 /*-------------------------------
    Maths and Calculamations
[Listed Value and Total TT Values]
--------------------------------- */
// Function to calculate Total Inventory TT Value
function calculateTotalValue() {
    const table = document.getElementById("itemTable");
    const tbody = table.querySelector("tbody");
    const rows = Array.from(tbody.querySelectorAll("tr"));

    let totalValue = 0.000;
    rows.forEach(row => {
        const valueCell = row.querySelector("td:nth-child(3)"); // Assuming Value column is the third column
        if (valueCell) {
            totalValue += parseFloat(valueCell.textContent.trim());
        }
    });

    const totalValueElement = document.getElementById("totalValue");
    totalValueElement.textContent = "Ttl: " + totalValue.toFixed(2) + " Ped"; // Display total value with 2 decimal places
}
// Function to calculate and update the listed value based on the visible rows
function updateListedValue() {
    let totalDisplayedValue = 0.00;
    const table = document.getElementById("itemTable");
    const tbody = table.querySelector("tbody");
    const visibleRows = Array.from(tbody.querySelectorAll("tr:not([style='display: none;'])"));
    // Calculate the sum of the values in the visible rows
    visibleRows.forEach(row => {
        const valueCell = row.querySelector("td:nth-child(3)"); // Assuming Value column is the third column
        if (valueCell) {
            const valueText = valueCell.textContent.trim();
            const floatValue = parseFloat(valueText);
            if (!isNaN(floatValue)) {
                totalDisplayedValue += floatValue;
            }
        }
    });
    // Update the displayed total value
    const totalValueElement = document.getElementById("ListedValue");
    totalValueElement.textContent = "TT:" + totalDisplayedValue.toFixed(2) + " Ped"; // Display total value with 2 decimal places
}



/*-------------------------------
    Extras and Unnecessaries
--------------------------------- */
// Speach Utterance Function
function speakLabel(label) {
    // Create a new SpeechSynthesisUtterance
    var utterance = new SpeechSynthesisUtterance(label);

    // Set up the onend event listener
    utterance.onend = function () {
        drawCharacter(); // Draw character's face after speaking
    };

    // Speak the utterance
    speechSynthesis.speak(utterance);
}

// Function to draw a sus character's face
function drawCharacter() {
    // Get the character face div
    var characterFace = document.getElementById("characterFace");
    
    // Change the character's face style or content
    characterFace.style.backgroundColor = "transparent";
    characterFace.innerHTML = ""; // Clear any previous content

    // Create an image element
    var characterImage = document.createElement("img");
    characterImage.src = "../../assets/images/icons/msagent-3.png";
    characterImage.style.maxWidth = "100%"; // Ensure the image fits within the container
    characterImage.style.filter = "hue-rotate(180deg) saturate(200%)"; // Apply filter effect to twist colors
    characterImage.style.transform = "scaleX(-1)"; // Flip horizontally

    // Append the image to the character face div
    characterFace.appendChild(characterImage);
}


 /* ---------------------------------
Stuffs happening on load -initializing
   -totalvalues, example data, etc
-----------------------------------*/
document.addEventListener("DOMContentLoaded", function () {
  // Sample data, soley for Example on page load
  const items = [
    ["Musca Thigh Guards (L) Blueprint", 1, 0.01, "Arkadia Armour▣"],
    ["Pirrel Pellets", 7, 2.10, "STORAGE (Arkadia)"],
    ["Pile Of Garnets", 96, 14.40, "STORAGE (Arkadia)"],
    ["Pet Name Tag", 12, 0.00, "STORAGE (Arkadia)"],
    ["Zolphic Oil", 2, 0.08, "STORAGE (Calypso)"],
    ["Zolphic Grease", 6, 0.48, "STORAGE (Calypso)"],
    ["Weapon Cells", 100000, 10.00, "STORAGE (DSEC9)"],
    ["Vibrant Sweat", 25, 0.00, "STORAGE (DSEC9)"],
    ["Universal Ammo", 2946, 0.29, "STORAGE (Monria)"],
    ["Tier 2 Component", 1, 0.14, "STORAGE (Monria)"],
    ["Universal Ammo", 101804, 10.18, "STORAGE (Planet Cyrene)"],
    ["Yellow Cassette", 10, 0.10, "STORAGE (Rocktropia)"],
    ["ArMatrix LP-25 (L)", 1, 12.89, "CARRIED"],
    ["ArMatrix LP-25 (L)", 1, 12.89, "ESTATE"]
  ];
  // Populate the table with sample data on page load
  populateTable(items);
  // Extract unique planet names from the sample data and populate the dropdown
  const planetSelect = document.getElementById("planetSelect");
  const uniquePlanets = [...new Set(items.map(item => getPlanetFromContainer(item[3])))];
  uniquePlanets.forEach(planet => {
    const option = document.createElement("option");
    option.value = planet;
    option.textContent = planet;
    planetSelect.appendChild(option);
  });
  // Store all rows when the dropdown option is selected
  planetSelect.addEventListener("change", function () {
    const table = document.getElementById("itemTable");
    const tbody = table.querySelector("tbody");
    allRows = Array.from(tbody.querySelectorAll("tr"));
  });
  calculateTotalValue();
});

