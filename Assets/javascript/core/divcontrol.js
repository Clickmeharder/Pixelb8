/* 	function toggleSpendTool() {
		var rightPanel = document.getElementById('HUD-RightPanel');
		rightPanel.style.display = (rightPanel.style.display === 'none') ? 'block' : 'none';
		// You can now reference the clicked button if needed
		console.log('Button clicked:', clickedButton);
	} */

    // Event listeners for the "lockedinput" buttons to toggle input fields
// Usage example without custom HTML

const lockedElements = document.querySelectorAll("#lockedinput");
lockedElements.forEach(button => {
    button.addEventListener("click", function () {
        const targetElement = this.parentElement.querySelector("input, select");
        targetElement.disabled = !targetElement.disabled;

        // Change the image source based on the disabled state
        const img = this.querySelector("img");
        img.src = targetElement.disabled ? "../../Assets/images/mouse_padlock.png" : "../../Assets/images/tools_gear-0.png";
    });
});
	function toggleCacheMenu() {
	var showButton = document.getElementById('showaddcacheitem-Button');
	cachemenubuttonClick2();
	 //
	showButton.classList.toggle('buttonactive', weaponCacheAdditions.style.display !== 'none');
	
  // Add your toggle functionality here (e.g., cachemenubuttonClick2())
}

	var currentImageIndex = 0; // Initialize the index of the current image

	function toggleSpendTool() {
		// Get the button with the id 'spendtool-button'
		var button = document.getElementById('spendtool-button');

		// Array of image sources to cycle through
		var images = [
			'../../Assets/images/spendtool-on.png',
			'../../Assets/images/spendtool-mainonly.png',
			'../../Assets/images/spendtool-buttons.png',
			'../../Assets/images/spendtool-off.png'
		];

		// Get the current image source
		var currentImage = images[currentImageIndex];

		// Toggle the image source for the current button
		button.querySelector('img').src = currentImage;

		// Log the current image index
		console.log('Current Image Index:', currentImageIndex);

		// Perform actions based on the current image index
		switch (currentImageIndex) {
			case 0:
				// Actions for the first image (e.g., hide spendtool-buttons)
				var rightPanel = document.getElementById('HUD-RightPanel');
				var spendToolButtons = document.getElementById('spendtool-buttons');
				rightPanel.style.display = 'block';
				spendToolButtons.style.display = 'block';
				console.log('SPEND TOOL Main Display: ON');
				break;
			case 1:
				// Actions for the second image (e.g., hide HUD-RightPanel)
				var spendToolButtons = document.getElementById('spendtool-buttons');
				spendToolButtons.style.display = 'none';
				console.log('Spend Tool Buttons: OFF');
				break;
			case 2:
				// Actions for the third image (e.g., show spendtool-buttons)
				var rightPanel = document.getElementById('HUD-RightPanel');
				var spendToolButtons = document.getElementById('spendtool-buttons');
				rightPanel.style.display = 'none';
				spendToolButtons.style.display = 'block';
				console.log('Spend Tool Main Display: OFF');
				console.log('Spend Tool buttons: ON');
				break;
			case 3:
				var spendToolButtons = document.getElementById('spendtool-buttons');
				spendToolButtons.style.display = 'none';
				console.log('Spend Tool buttons: OFF');
				console.log('case3 break');
				break;
		}

    // Increment the index to get the next image
    currentImageIndex = (currentImageIndex + 1) % images.length;

    // Log additional actions for all images (if needed)
    console.log('Additional actions for all images (if needed)');



}

function toggleeventdetailsmenu(clickedButton) {
    var targetelement = document.getElementById('eventdetailsmenu');
    targetelement.style.display = (targetelement.style.display === 'block') ? 'none' : 'block';

    // Toggle button color and border color
    toggleButtonStyle(clickedButton);
	console.log('Toggle Button clicked:', clickedButton);
}

function togglefinaleventprofitdisplay(clickedButton) {
    var targetelement = document.getElementById('eventfinalprofitorloss');
    targetelement.style.display = (targetelement.style.display === 'block') ? 'none' : 'block';

    // Toggle button color and border color
    toggleButtonStyle(clickedButton);
	console.log('Toggle Button clicked:', clickedButton);
}

function togglefeevaluedisplay2(clickedButton) {
    var targetelement = document.getElementById('eventticketprices');
    targetelement.style.display = (targetelement.style.display === 'block') ? 'none' : 'block';

    // Toggle button color and border color
    toggleButtonStyle(clickedButton);
	console.log('Toggle Button clicked:', clickedButton);
}

function togglefeevaluedisplay(clickedButton) {
    var targetelement = document.getElementById('eventticketfees');
    targetelement.style.display = (targetelement.style.display === 'block') ? 'none' : 'block';

    // Toggle button color and border color
    toggleButtonStyle(clickedButton);
	console.log('Toggle Button clicked:', clickedButton);
}

function toggleButtonStyle(button) {
    // Change button color and border color
    button.style.color = (button.style.color === 'rgb(7, 186, 197)') ? '' : '#07bac5';
    button.style.borderColor = (button.style.borderColor === 'rgb(7, 186, 197)') ? '' : '#07bac5';
}
function togglesingleroundButtonStyle(button) {
    // Change button color and border color
    button.style.borderColor = (button.style.borderColor === 'rgb(7, 186, 197)') ? '' : '#07bac5';
	button.style.backgroundColor = (button.style.backgroundColor === 'black') ? '#101128f2' : 'black';
}
function toggleexpandbudgets(clickedButton) {
    var targetElement = document.getElementById('HUD-LeftPanel');

    // Check if the original width is stored in a data attribute
    var originalWidth = targetElement.dataset.originalWidth;

    // If it's not stored, get the current width and store it
    if (!originalWidth) {
        originalWidth = window.getComputedStyle(targetElement).width;
        targetElement.dataset.originalWidth = originalWidth;
    }

    // Toggle width property
    targetElement.style.width = (targetElement.style.width === '590px') ? originalWidth : '590px';

    // Set style of the clicked button
    clickedButton.style.borderStyle = (clickedButton.style.borderStyle === 'inset') ? '' : 'inset';
	clickedButton.style.borderColor = (clickedButton.style.borderColor === 'rgb(7, 186, 197)') ? '' : '#07bac5';
    clickedButton.style.backgroundColor = (clickedButton.style.backgroundColor === 'black') ? '#101128f2' : 'black';

    // Set filter for the image inside the button
    var image = clickedButton.querySelector('img');
    if (image) {
        var currentFilter = image.style.filter;
        var newFilter = (currentFilter === 'brightness(80%) hue-rotate(85deg)') ? 'brightness(70%) hue-rotate(45deg)' : 'brightness(80%) hue-rotate(85deg)';
        image.style.filter = newFilter;
    }

    // You can now reference the clicked button if needed
    console.log('expand balance Button clicked:', clickedButton);
}

function toggletoolButtons(clickedButton) {
	var targetelement = document.getElementById('toolsmenu-buttons');
	targetelement.style.display = (targetelement.style.display === 'flex') ? 'none' : 'flex';
	togglesingleroundButtonStyle(clickedButton)
	// You can now reference the clicked button if needed
	console.log('Button clicked:', clickedButton);
}
function toggletoolsWindow(clickedButton) {
	var targetelement = document.getElementById('HUD-EventplannerWindow');
	targetelement.style.display = (targetelement.style.display === 'block') ? 'none' : 'block';
	togglesingleroundButtonStyle(clickedButton)
	// You can now reference the clicked button if needed
	console.log('Button clicked:', clickedButton);
}	


function toggleaddmanualbudgetexpense(clickedButton) {
	var targetelement = document.getElementById('expensecontrolpanel');
	targetelement.style.display = (targetelement.style.display === 'block') ? 'none' : 'block';
	togglesingleroundButtonStyle(clickedButton)
	// You can now reference the clicked button if needed
	console.log('Button clicked:', clickedButton);
}	

function toggleaddtobudget(clickedButton) {
	var targetelement = document.getElementById('addcontrolpanel');
	targetelement.style.display = (targetelement.style.display === 'block') ? 'none' : 'block';
	togglesingleroundButtonStyle(clickedButton)
	// You can now reference the clicked button if needed
	console.log('Button clicked:', clickedButton);
}	

function toggleSellItemStashMenu(clickedButton) {
	var targetelement = document.getElementById('sellitemsMenu');
	targetelement.style.display = (targetelement.style.display === 'block') ? 'none' : 'block';

	// You can now reference the clicked button if needed
	console.log('Button clicked:', clickedButton);
}	
// 
function toggleEditCacheMenu(clickedButton) {
	var targetelement = document.getElementById('EditItemStashMenu');
	targetelement.style.display = (targetelement.style.display === 'block') ? 'none' : 'block';

	// You can now reference the clicked button if needed
	console.log('Button clicked:', clickedButton);
}	
// 
function toggleRestockItemStashMenu(clickedButton) {
	var targetelement = document.getElementById('restockItemStashMenu');
	targetelement.style.display = (targetelement.style.display === 'block') ? 'none' : 'block';

	// You can now reference the clicked button if needed
	console.log('Button clicked:', clickedButton);
}	
// current main cache button (tab button)
	function toggleWeaponcacheMenu(clickedButton) {
		var targetelement = document.getElementById('weaponscacheMenu');
		targetelement.style.display = (targetelement.style.display === 'flex') ? 'none' : 'flex';

		// You can now reference the clicked button if needed
		console.log('Button clicked:', clickedButton);
	}
//menu buttons----------------------------------
	function calenderdisplaybuttonClick(clickedButton) {
		var CallenderWindow = document.getElementById('HUD-CallenderWindow');
		
		if (CallenderWindow.classList.contains('visible')) {
			// Change opacity before removing the visible class
			CallenderWindow.style.opacity = 0;

			// Use setTimeout to delay the removal of the visible class
			setTimeout(function () {
				CallenderWindow.classList.remove('visible');
			}, 500); // Adjust the delay time (in milliseconds) based on your transition duration
		} else {
			// Add visible class and set opacity to 1
			CallenderWindow.classList.add('visible');
			CallenderWindow.style.opacity = 1;
		}

		console.log('calenderdisplaybuttonClick clicked:', clickedButton);
		console.log('Element visibility and opacity toggled:', CallenderWindow);
	}

	function cachedisplaybuttonClick(clickedButton) {
		var stashmaindisplay = document.getElementById('stashmaindisplay');
        stashmaindisplay.style.display = (stashmaindisplay.style.display === 'block') ? 'none' : 'block';
		console.log('cachedisplaybuttonClick clicked:', clickedButton);
		console.log('Element display toggled:', stashmaindisplay);
		
	}
	function cachemenubuttonClick2(clickedButton) {
		var weaponCacheAdditions = document.getElementById('weaponCacheAdditions');
        weaponCacheAdditions.style.display = (weaponCacheAdditions.style.display === 'block') ? 'none' : 'block';
		console.log('cachemenubuttonClick2 clicked:', clickedButton);
		console.log('Element display toggled:', weaponCacheAdditions);
		
	}

	function cachemenubuttonClick3(clickedButton) {
		var weaponCacheStash = document.getElementById('weaponCacheStash');
		weaponCacheStash.style.display = (weaponCacheStash.style.display === 'block') ? 'none' : 'block';

		// You can now reference the clicked button if needed
		console.log('cachemenubuttonClick3 clicked:', clickedButton);
	}


//more buttons------------------------------

	// Updated definition of the toggleRecentExpenses function
	function toggleitempriceList(clickedButton) {
		var itempricelist = document.getElementById('itempriceList');
		itempricelist.style.display = (itempricelist.style.display === 'block') ? 'none' : 'block';

		// You can now reference the clicked button if needed
		console.log('Button clicked:', clickedButton);
	}


	// Updated definition of the toggleRecentExpenses function
	function toggleRecentExpenses(clickedButton) {
		var recentExpenseBox = document.getElementById('recentexpensebox');
		recentExpenseBox.style.display = (recentExpenseBox.style.display === 'block') ? 'none' : 'block';
		togglesingleroundButtonStyle(clickedButton)
		// You can now reference the clicked button if needed
		console.log('Button clicked:', clickedButton);
	}
	// New function definition for toggling the Budget Overview
	function toggleBudgetOverview(clickedButton) {
		var hudLeftPanel = document.getElementById('HUD-LeftPanel');
		hudLeftPanel.style.display = (hudLeftPanel.style.display === 'block') ? 'none' : 'block';
		togglesingleroundButtonStyle(clickedButton)
		// You can now reference the clicked button if needed
		console.log('Budget Overview Button clicked:', clickedButton);
	}
	function toggleSettingsMenu() {
		const settingsMenu = document.getElementById("SettingsMenu");
		clickedButton = document.getElementById("showSettings-Button");
		togglesingleroundButtonStyle(clickedButton)
		// Toggle the display of the settings menu
		settingsMenu.style.display = (settingsMenu.style.display === 'block') ? 'none' : 'block';
	}
	function toggleNotesContainer() {
		const notesContainer = document.querySelector('.notescontainer');

		// Toggle the display of the notes container
		notesContainer.style.display = (notesContainer.style.display === 'block') ? 'none' : 'block';
	}
	
	function toggleStorageMenu() {
		const storageMenu = document.getElementById("buttongroup-Localstorage");

		// Toggle the display of the local storage button group
		storageMenu.style.display = (storageMenu.style.display === 'block') ? 'none' : 'block';
	}
	function toggleConstructionContainer() {
		const constructionContainer = document.querySelector('.itemsunderconstruction');

		// Toggle the display of the local storage button group
		constructionContainer.style.display = (constructionContainer.style.display === 'block') ? 'none' : 'block';
	}
	function selfDestruct() {
		// Check if local storage is supported
		if (typeof(Storage) !== "undefined") {
			// Ask for confirmation
			var confirmed = confirm("Are you sure you want to Self destruct? you will lose all saved data.");

			if (confirmed) {
				// Clear all items in local storage
				localStorage.clear();
				alert("Self destruct initiated. T- 3 seconds.");
			} else {
				alert("Self destruct sequence aborted.🤓 Have a nice day.");
			}
		} else {
			alert("Local storage is not supported in this browser.");
		}
	}
// Function to export multiple tables to CSV
// Function to export multiple tables to CSV
function exportTablesToCSV(tableIds, filename) {
    const csv = [];

    // Iterate over table IDs
    tableIds.forEach(tableId => {
        const rows = document.querySelectorAll(`#${tableId} tbody tr`);
        const headers = document.querySelectorAll(`#${tableId} thead th`);
        
        // Add header row to CSV
        const headerRow = Array.from(headers).map(header => header.innerText);
        csv.push(`${tableId === "WTStable" ? "Items For Sale" : "Buying Items"}:\n${headerRow.join(',')}`); // Add header above the table

        // Iterate over rows and cells to build CSV data
        rows.forEach(row => {
            const rowData = [];
            const cells = row.querySelectorAll('td');
            cells.forEach(cell => {
                if (cell.querySelector('input')) {
                    // If the cell contains an input, use the input value or set to 0 if empty
                    rowData.push(cell.querySelector('input').value || '0');
                } else {
                    rowData.push(cell.innerText);
                }
            });
            csv.push(rowData.join(','));
        });

        csv.push(''); // Add a space before the next table
    });

    // Create a Blob and initiate download
    const blob = new Blob([csv.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
// Function to export multiple tables to JSON
function exportTablesToJSON(tableIds, filename) {
    const jsonData = [];

    // Iterate over table IDs
    tableIds.forEach(tableId => {
        const rows = document.querySelectorAll(`#${tableId} tbody tr`);
        const headers = document.querySelectorAll(`#${tableId} thead th`);
        
        // Add header row to JSON data
        jsonData.push({ tableHeader: `Items For Sale`, tableData: {} }); // Add header above the table

        // Iterate over rows and cells to build JSON data
        rows.forEach(row => {
            const rowData = {};
            const cells = row.querySelectorAll('td');
            cells.forEach((cell, index) => {
                const header = headers[index].innerText;
                if (cell.querySelector('input')) {
                    // If the cell contains an input, use the input value
                    rowData[header] = cell.querySelector('input').value;
                } else {
                    rowData[header] = cell.innerText;
                }
            });
            jsonData.push(rowData);
        });

        jsonData.push({ tableHeader: '', tableData: {} }); // Add a space before the next table
    });

    // Create a Blob and initiate download
    const blob = new Blob([JSON.stringify(jsonData)], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Usage example
document.getElementById("Exportcsv-button").addEventListener("click", function () {
    exportTablesToCSV(["WTStable", "WTBtable"], "exported_data.csv");
});

document.getElementById("Exportjson-button").addEventListener("click", function () {
    exportTablesToJSON(["WTStable", "WTBtable"], "exported_data.json");
});

// Function to copy PLAIN  HTML content of tables
function copyTablesHtml(tableIds) {
    const htmlContent = [];

    // Create a wrapper div for the header and subheader with a border
    htmlContent.push('<div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 20px;">');

    // Add the page header
    htmlContent.push('<h1>Page Header</h1>');

    // Add the subheader
    htmlContent.push('<h2>Subheader</h2>');

    // Close the wrapper div for the header and subheader
    htmlContent.push('</div>');

    // Create a wrapper div for tables
    htmlContent.push('<div style="display: flex;">');

    // Iterate over table IDs
    tableIds.forEach((tableId, index) => {
        const table = document.getElementById(tableId);
        if (table) {
            // Create a wrapper div for each table with a border
            htmlContent.push('<div style="border: 1px solid #ddd; flex: 1; margin: 10px;">');

            // Add an <h4> label inside the table wrapper div based on the tableId
            let h4Label = '';
            if (tableId === 'WTStable') {
                h4Label = 'Items for Sale:';
            } else if (tableId === 'WTBtable') {
                h4Label = 'Item Purchase Offers:';
            }
            htmlContent.push(`<h4>${h4Label}</h4>`);

            // Clone the table to avoid modifying the original
            const clonedTable = table.cloneNode(true);

            // Apply styling to the table for a more visually appealing look
            clonedTable.style.width = '100%';
            clonedTable.style.borderCollapse = 'collapse';
            clonedTable.style.fontSize = '14px';

            // Add a new column for displaying the planet information
            const planetColumnHeader = document.createElement('th');
            planetColumnHeader.textContent = 'Planet';
            clonedTable.querySelector('thead tr').insertBefore(planetColumnHeader, clonedTable.querySelector('thead tr').firstChild);

            // Iterate over rows to add planet information
            const dataRows = clonedTable.querySelectorAll('tbody tr');
            dataRows.forEach(row => {
                const itemTitle = row.querySelector('td:first-child').getAttribute('title'); // Get the title attribute of the first cell
                const planetCell = document.createElement('td');
                planetCell.textContent = itemTitle; // Set planet cell to the title of the item
                row.insertBefore(planetCell, row.firstChild);
            });

            // Get the outer HTML content of the cloned table
            const tableHtml = clonedTable.outerHTML;

            // Add a script to the HTML for keyup event on markup cell input
            const script = document.createElement('script');
            script.textContent = `

                 document.addEventListener('DOMContentLoaded', function () {
				// Select all input fields
				const inputFields = document.querySelectorAll('table input[type="text"]');

				// Add event listener to each input field
				inputFields.forEach(function (input) {
				  input.addEventListener('input', function (event) {
					updateTotalCost(event);
					updatePricePerItem(event);
				  });
				});

				// Function to update total cost
				function updateTotalCost(event) {
				  // Get the parent row of the input field
				  const row = event.target.closest('tr');

				  // Get the input value and price per item from the current row
				  const inputValue = parseFloat(row.querySelector('td:nth-child(7) input').value) || 0;
				  const pricePerItem = parseFloat(row.querySelector('td:nth-child(5)').textContent) || 0;

				  // Calculate total cost
				  const totalCost = inputValue * pricePerItem;

				  // Update the total cost cell in the current row
				  row.querySelector('td:nth-child(8)').textContent = totalCost.toFixed(2);
				}

				// Function to update price per item
				function updatePricePerItem(event) {
				  // Get the parent row of the input field
				  const row = event.target.closest('tr');

				  // Get the markup value and tt value from the current row
				  const markupValue = parseFloat(row.querySelector('td:nth-child(4) input').value) || 0;
				  const ttValue = parseFloat(row.querySelector('td:nth-child(3)').textContent) || 0;

				  // Calculate price per item
				  const pricePerItem = ttValue * (markupValue / 100);

				  // Update the price per item cell in the current row
				  row.querySelector('td:nth-child(5)').textContent = pricePerItem.toFixed(2);
				}
				 $(document).ready(function() {
						$('#WTStable, #WTBtable').DataTable();
					});
			  });
            `;

            // Combine HTML content with the script
            htmlContent.push(tableHtml, script.outerHTML);

            // Close the wrapper div for each table
            htmlContent.push('</div>');
        }
    });

    // Close the main flex row wrapper
    htmlContent.push('</div>');

    // Combine HTML content with line breaks
    const combinedHtml = htmlContent.join('\n');

    // Create a textarea element to hold the HTML content
    const textarea = document.createElement('textarea');
    textarea.value = combinedHtml;
    document.body.appendChild(textarea);

    // Select the text in the textarea
    textarea.select();
    document.execCommand('copy');

    // Remove the textarea
    document.body.removeChild(textarea);
}


// Function to copy fancy HTML content of tables with image and button group in the header
function copyTablesFancyHtml(tableIds) {
    const htmlContent = [];

        // Create a wrapper div for the body with background color and max-width
    htmlContent.push('<div style="background-color: #2b2a2a; padding: 10px;max-height:100%; max-width: 99vw; margin: 0 auto; position: relative;">');

    // Create an absolute wrapper for the content
    htmlContent.push('<div style="position: relative; top: 0; left: 0; right: 0; bottom: 0;"height:98%; width: 98%;');


    // Create a wrapper div for the header and subheader with dark-themed styles
    htmlContent.push('<div style="border: 1px solid #333; background-color: #222; color: #444; padding: 10px 6px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">');

    // Add the page header with an image and button group
    htmlContent.push('<div style="display: flex; align-items: center;">');
    htmlContent.push('<img src="https://cdn.discordapp.com/attachments/1125594015442669639/1197511732738932746/msagent-4.png?ex=65bb88b5&is=65a913b5&hm=6450f6bdb740b23de05984a08b54bbeb9fa485fdacdf6ae123eac3e23f71eb78&" alt="Page Logo" style="height: 60px; margin-right: 10px;">'); // Replace your_image_url.jpg with the actual URL of your image

    // Add the page header text
    htmlContent.push('<h1 style="color: #524e4e;">Page Header</h1>');
    htmlContent.push('</div>');

    // Add the button group on the right side
    htmlContent.push('<div style="display: flex;">');
    htmlContent.push('<button style="margin-right: 5px;">/wisper</button>');
    htmlContent.push('<button style="margin-right: 5px;">My Links</button>');
    // Add more buttons as needed
    htmlContent.push('</div>');

    // Close the wrapper div for the header and subheader
    htmlContent.push('</div>');

    // Create a wrapper div for tables with dark-themed styles
    htmlContent.push('<div style="display: flex;flex-wrap: wrap; background-color: #333; padding: 0px 0px;position: absolute; max-width: 100%;">');

    // Iterate over table IDs
    tableIds.forEach((tableId, index) => {
        const table = document.getElementById(tableId);
        if (table) {
			
            // Create a wrapper div for each table with dark-themed styles
            htmlContent.push('<div style="border: 1px solid #222; flex: 1; margin: 4px; background-color: #444; padding: 4px 4px;">');

            // Add an <h4> label inside the table wrapper div based on the tableId
            let h4Label = '';
            if (tableId === 'WTStable') {
                h4Label = 'Items for Sale:';
            } else if (tableId === 'WTBtable') {
                h4Label = 'Item Purchase Offers:';
            }
            htmlContent.push(`<h4 style="color: #727476; font-weight:bold;">${h4Label}</h4>`);

            // Clone the table to avoid modifying the original
            const clonedTable = table.cloneNode(true);

            // Apply dark-themed styling to the table for a more visually appealing look
            clonedTable.style.width = '100%';
            clonedTable.style.borderCollapse = 'collapse';
            clonedTable.style.fontSize = '14px';

            // Add a new column for displaying the planet information
            const planetColumnHeader = document.createElement('th');
            planetColumnHeader.textContent = 'Planet';
            planetColumnHeader.style.border = '1px solid #444';
            clonedTable.querySelector('thead tr').insertBefore(planetColumnHeader, clonedTable.querySelector('thead tr').firstChild);

            // Iterate over rows to add planet information
            const dataRows = clonedTable.querySelectorAll('tbody tr');
            dataRows.forEach(row => {
                const itemTitle = row.querySelector('td:first-child').getAttribute('title'); // Get the title attribute of the first cell
                const planetCell = document.createElement('td');
                planetCell.textContent = itemTitle; // Set planet cell to the title of the item
                planetCell.style.border = '1px solid #444';
                planetCell.style.background = '#333'; // Set background color of tbody cells
                planetCell.style.color = '#727476'; // Set text color of tbody cells
                row.insertBefore(planetCell, row.firstChild);
            });

            // Get the outer HTML content of the cloned table
            const tableHtml = clonedTable.outerHTML;

            // Add a script to the HTML for keyup event on markup cell input
            const script = document.createElement('script');
            script.textContent = `
                 document.addEventListener('DOMContentLoaded', function () {
				// Select all input fields
				const inputFields = document.querySelectorAll('table input[type="text"]');
				
				// Apply additional styles to table cells and input fields
				const additionalStyles = document.createElement('style');
				additionalStyles.textContent = \`
					table.dataTable tbody th, table.dataTable tbody td {
						padding: 1px 0px !important;
						text-align: center !important;
						min-width: 121px !important;
						width: 166px !important;
						color: #80898b;
						border: 3px inset #4f595d;
						background: #313131;
					}
					body {
						background-color: #333;
						color: ;
						width: 100vw;
					}
					input {
						width: 85x !important;
						background: #0000004f;
					}
					select {
						background-color: #0000004f;
						opacity: 0.7;
					}
					button {
						color: #444;
						background-color: #0000004f;
					}
					.paginate_button.current {
						background-color: #0000004f;
					}
					table.dataTable thead .sorting {
						border: 3px outset #454545;
						text-align: center;
						background-color: #18162d;
						color: #333c46de!important;
						padding: 0px;
					}
					table.dataTable thead .sorting_asc {
						border: 3px outset #454545;
						color: #385a80c9;
						background-color: #18162d;
						box-shadow: -0px 5px 30px 0px #020a13e0;
						text-align: center;
					}
					table.dataTable thead .sorting_desc {
						border: 3px outset #454545;
						color: #385a80c9;
						background-color: #18162d;
						box-shadow: -0px 5px 30px 0px #020a13e0;
						text-align: center;
					}
				\`;
				document.head.appendChild(additionalStyles);
				
				// Add event listener to each input field
				inputFields.forEach(function (input) {
				  input.addEventListener('input', function (event) {
					updateTotalCost(event);
					updatePricePerItem(event);
				  });
				});

				// Function to update total cost
				function updateTotalCost(event) {
				  // Get the parent row of the input field
				  const row = event.target.closest('tr');

				  // Get the input value and price per item from the current row
				  const inputValue = parseFloat(row.querySelector('td:nth-child(7) input').value) || 0;
				  const pricePerItem = parseFloat(row.querySelector('td:nth-child(5)').textContent) || 0;

				  // Calculate total cost
				  const totalCost = inputValue * pricePerItem;

				  // Update the total cost cell in the current row
				  row.querySelector('td:nth-child(8)').textContent = totalCost.toFixed(2);
				}

				// Function to update price per item
				function updatePricePerItem(event) {
				  // Get the parent row of the input field
				  const row = event.target.closest('tr');

				  // Get the markup value and tt value from the current row
				  const markupValue = parseFloat(row.querySelector('td:nth-child(4) input').value) || 0;
				  const ttValue = parseFloat(row.querySelector('td:nth-child(3)').textContent) || 0;

				  // Calculate price per item
				  const pricePerItem = ttValue * (markupValue / 100);

				  // Update the price per item cell in the current row
				  row.querySelector('td:nth-child(5)').textContent = pricePerItem.toFixed(2);
				}
				 $(document).ready(function() {
						$('#WTStable, #WTBtable').DataTable();
					});
			  });
            `;

            // Combine HTML content with the script
            htmlContent.push(tableHtml, script.outerHTML);

            // Close the wrapper div for each table
            htmlContent.push('</div>');
        }
    });

    // Close the main flex row wrapper
    htmlContent.push('</div>');

    // Close the wrapper div for the body
    htmlContent.push('</div>');

    // Combine HTML content with line breaks
    const combinedHtml = htmlContent.join('\n');

    // Create a textarea element to hold the HTML content
    const textarea = document.createElement('textarea');
    textarea.value = combinedHtml;
    document.body.appendChild(textarea);

    // Select the text in the textarea
    textarea.select();
    document.execCommand('copy');

    // Remove the textarea
    document.body.removeChild(textarea);
}

document.getElementById("PLcopyfancyhtml-button").addEventListener("click", function () {
	console.log('copybasichtml button clicked');
    copyTablesFancyHtml(["WTStable", "WTBtable"]);
	console.log('attempting to copy basic html to clipboard');

});
// Usage example without custom HTML
document.getElementById("PLcopyhtml-button").addEventListener("click", function () {
	console.log('copy fancy htmlbutton clicked');
    copyTablesHtml(["WTStable", "WTBtable"]);
	console.log('attempting to copy fancy html to clipboard');
});
// Function to make a window draggable
const makeDraggable = (header, windowElement) => {
    let isDragging = false;
    let mouseX;
    let mouseY;
    let offsetX;
    let offsetY;

    const handleMouseDown = (e) => {
        isDragging = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
        offsetX = windowElement.offsetLeft;
        offsetY = windowElement.offsetTop;

        // Add 'dragging-header' class on mousedown
        header.classList.add('dragging-header');
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;

        windowElement.style.left = offsetX + deltaX + 'px';
        windowElement.style.top = offsetY + deltaY + 'px';
    };

    const handleMouseUp = () => {
        isDragging = false;

        // Remove 'dragging-header' class on mouseup
        header.classList.remove('dragging-header');
    };

    header.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
};

// Apply draggable functionality to all elements with the class "draggable-header"
const draggableHeaders = document.querySelectorAll('.draggable-header');
draggableHeaders.forEach((header) => {
    const windowElement = header.closest('[data-draggable="true"]');
    if (windowElement) {
        makeDraggable(header, windowElement);
    }
});
