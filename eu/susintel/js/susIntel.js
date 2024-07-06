const resultsDiv = document.getElementById("susIntel-results");
const fileInput = document.getElementById("susIntel-fileInput");
const keywordInput = document.getElementById("susIntel-keyword");
const searchButton = document.getElementById("susIntel-searchButton");
const sortButton = document.getElementById("sortresultsButton");
const sortOrderSelect = document.getElementById("sortOrder");
const popupButton = document.getElementById("cleanpopupButton"); // Get the popup button
	const popupContainer = document.getElementById("popupContainer"); // Get the popup container
const cleanButton = document.getElementById("cleanButton");
const downloadButton = document.getElementById("susIntel-downloadButton");

function handleFileSearch(keywordsInput) {
  const keywordsArray = keywordsInput.split(",").map(keyword => keyword.trim());
  const file = fileInput.files[0];
  if (!file) {
    alert("Please select a chat log file.");
    return;
  }
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const logContent = event.target.result;
    const filteredLines = applyFilters(logContent, keywordsArray);
    displayResults(filteredLines);
  };
  fileReader.readAsText(file);
}

function applyFilters(logContent, keywordsArray) {
  const lines = logContent.split("\n");
  const isSystemChecked = document.getElementById("susIntel-systemLog").checked;
  const isRookieChecked = document.getElementById("susIntel-rookieLog").checked;
  const isTradeChecked = document.getElementById("susIntel-tradeLog").checked;
  const daysThreshold = parseInt(document.getElementById("resultsolderthanXdays").value);
  const filteredLines = lines.filter(line => {
    const containsAnyKeyword = keywordsArray.some(keyword => line.includes(keyword));
    const isSystem = isSystemChecked && line.includes("[System]");
    const isRookie = isRookieChecked && line.includes("[Rookie]");
    const isTrade = isTradeChecked && (line.includes("Trade]") || line.includes("trade]"));
    let isWithinDaysThreshold = true;
    if (daysThreshold > 0) {
      isWithinDaysThreshold = isLineWithinDaysThreshold(line, daysThreshold);
    }
    return containsAnyKeyword && (isSystem || isRookie || isTrade) && isWithinDaysThreshold;
  });
  return filteredLines;
}

function isLineWithinDaysThreshold(line, daysThreshold) {
  const dateString = line.substring(0, 10);
  const lineDate = new Date(dateString);
  const currentDate = new Date();
  const differenceInDays = Math.floor((currentDate - lineDate) / (1000 * 60 * 60 * 24));
  return differenceInDays <= daysThreshold;
}

function createParagraphLine(line) {
  const resultItem = document.createElement("p");
  resultItem.textContent = line;
  resultsDiv.appendChild(resultItem);
}

function displayResults(lines) {
  resultsDiv.innerHTML = "";
  const sortedLines = sortResults(lines);
  sortedLines.forEach(createParagraphLine);
}

function sortResults(lines) {
  const sortOrder = sortOrderSelect.value;
  return lines.sort((a, b) => {
    const dateA = new Date(a.substring(0, 10));
    const dateB = new Date(b.substring(0, 10));
    if (sortOrder === "newest") {
      return dateB - dateA;
    } else {
      return dateA - dateB;
    }
  });
}
// Function to handle the close popup action
function handleClosePopup() {
    // Hide the popup or perform any desired action

    if (popupContainer) {
        popupContainer.style.display = 'none'; // Hide the popup
    }
    console.log("Popup closed");
}
document.addEventListener("DOMContentLoaded", function () {
  downloadButton.addEventListener("click", function () {
        cleanAndDownload(); // Call the same cleanAndDownload function
	});

	function cleanAndDownload() {
		const file = fileInput.files[0];
		if (!file) {
			alert("Please select a chat log file.");
			return;
		}

		const fileReader = new FileReader();
		const newContent = [];
		const daysToKeep = parseInt(olderThanInput.value) || 7; // Read the input value or default to 7

		fileReader.onload = function (event) {
			const logContent = event.target.result;
			const lines = logContent.split("\n");

			const currentDate = new Date();
			const daysAgo = new Date();
			daysAgo.setDate(currentDate.getDate() - daysToKeep);

			lines.forEach(line => {
				if (line.includes("[System]")) {
					const timestamp = line.substring(0, 19); // Extract timestamp substring
					const lineDate = new Date(timestamp);
					if (lineDate >= daysAgo) {
						newContent.push(line);
					}
				} else {
					newContent.push(line);
				}
			});

			const cleanedContent = newContent.join("\n");
			downloadCleanedFile(cleanedContent, file.name);
		};

		fileReader.readAsText(file);
	}

	function downloadCleanedFile(content, fileName) {
		const blob = new Blob([content], { type: "text/plain" });

		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = fileName;


		// Trigger the click event on the link to initiate the download
		a.click();
		alert("NOTICE: You must move the new downloaded chat.log to the folder containing the original chat.log!\n \n This should prompt you to replace the old file with the same name; Otherwise, you can manually delete the old log file, also ensure the new file is named ' chat.log '\n \n Remember to empty your recycle bin regularly!");
	}
  popupButton.addEventListener("click", function () {
    popupContainer.style.display = "block"; // Display the popup
  });

  // Add event listeners to close the popup when clicked outside of it
  popupContainer.addEventListener("click", function (event) {
    if (event.target === popupContainer) {
      popupContainer.style.display = "none"; // Hide the popup
    }
  });
  searchButton.addEventListener("click", function () {
    handleFileSearch(keywordInput.value);
  });
  
  sortButton.addEventListener("click", function () {
    const lines = Array.from(resultsDiv.children).map(child => child.textContent);
    displayResults(lines);
  });
      // Add event listener for the close button click event
  const closeButton =   document.getElementById("closepopup");
  closeButton.addEventListener("click", function () {
    handleClosePopup();
  });
});