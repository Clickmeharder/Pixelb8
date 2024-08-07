let selectedOption, colonistName, userInput;
var userImg = "url('https://pixelb8.lol/assets/images/ads/ads15.jpeg')";
let plComment = "";
// Function to toggle the Item Price List Menu
function refreshStashTable(clickedbutton) {
   // Reload the data to reflect the changes in the UI
	loadCacheDataFromLocalStorage();
}
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
//end of copyTablesHtml function

// Function to copy fancy HTML content of tables with image and button group in the header
function copyTablesFancyHtml(tableIds, colonistName) {
    const htmlContent = [];
	htmlContent.push('<head>');
	htmlContent.push('<title>Pixelb8-');
	htmlContent.push(`${colonistName}`);
	htmlContent.push('</title>');
	htmlContent.push('<link rel="icon" type="image/png" href="https://pixelb8.lol/assets/images/logo/pixelbotfavicon.png">');
	htmlContent.push('<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>');
	htmlContent.push('<link rel="stylesheet" type="text/css" href="https://cdn.datatables.net/1.10.25/css/jquery.dataTables.css">');
	htmlContent.push('<script type="text/javascript" charset="utf8" src="https://cdn.datatables.net/1.10.25/js/jquery.dataTables.js"></script>');
	htmlContent.push('</head>');
	// create a body element to wrap the page div that contains all of the content.
	htmlContent.push(`<body style="background-image:url('${userImg}');">`);
	htmlContent.push('<div id="gameArea">');
	htmlContent.push('<div id="pixelb8" style="opacity: 0.8; background-image: url(&quot;https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-transform-clean.gif&quot;); left: 27px; top: 34px;" class="animate"></div>');
	htmlContent.push('</div>');
    // Create a wrapper div for all of the page content inside the body
    htmlContent.push('<div style="background-color: #2b2a2a; padding: 10px;max-height:100%; max-width: 99vw; margin: 0 auto; position: relative;opacity:0.8;">');

    // Create an absolute wrapper for the content
    htmlContent.push('<div style="position: relative; top: 0; left: 0; right: 0; bottom: 0;height:98%; width: 98%;">');


    // Create a wrapper div for the header and subheader with dark-themed styles
    htmlContent.push('<div style="border: 1px solid #333; background-color: #222; color: #444; padding: 10px 6px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;">');

    // Add the page header with an image and button group
    htmlContent.push('<div style="display: flex; align-items:center;background-color:rgb(113 116 122 / 40%);border:2px outset #000;padding:4px;">');
    htmlContent.push('<img src="https://Pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-transform-clean.gif" alt="Page Logo" style="visibility: hidden;height: 60px; margin-right: -60px;">');
    // Add the page header text
    htmlContent.push('<h3 style="margin: 0px;margin-left: 37px;color: #08aeff;text-shadow: -6px 8px 3px black;transform: rotate(-22deg);">Pixelb8.lol</h3>');
    htmlContent.push('</div>');
	
	//add the customizable header text
	htmlContent.push('<div style="margin:0;">');
	htmlContent.push('<!--change the options below to customize the header. -->')
	htmlContent.push('<h1 style="padding:2px;margin:auto;');
	htmlContent.push('    font-family:;');
	htmlContent.push('    font-weight:;');
	htmlContent.push('font-size:calc(1em + 1vw);');
	htmlContent.push('    border:0px solid #524e4e;');
	htmlContent.push('    color: #524e4e;">');
	htmlContent.push(`${colonistName}`);
	htmlContent.push('</h1>');
	htmlContent.push('</div>');
    // Add the button group on the right side
	
    htmlContent.push('<div style="display: flex;">');
    htmlContent.push('<button style="margin-right: 5px;">/wisper [');
	htmlContent.push(`${colonistName}`);
	htmlContent.push(']</button>');
    htmlContent.push('<button style="margin-right: 5px;">My Links</button>');
    // Add more buttons as needed
    htmlContent.push('</div>');
	htmlContent.push('</div>');
	htmlContent.push('<div id="merchantcommentbox" style="opacity:1;color: #222;font-family:lucida console;background:#3a3a3a;border:3px outset #000;padding:4px;">');
	htmlContent.push('<h1 style="font-size:14px;margin:auto;text-align:center;">Item Pricelist</h1>');
	htmlContent.push('<p id="merchantcomment" style="text-align:left;border:3px inset #444;font-family:lucida ;background:#00000087;color:green;opacity:1;">');
	htmlContent.push(`${plComment}`);
	htmlContent.push('</p>');
	
    // Close the wrapper div for the header and subheader
	htmlContent.push('</div>');

    // Create a wrapper div for tables with dark-themed styles
    htmlContent.push('<div style="display: flex;flex-wrap: wrap; background-color: #333; padding: 0px 0px;position: ; max-width: 99vw;margin:auto;margin-top:0;">');

    // Iterate over table IDs
    tableIds.forEach((tableId, index) => {
        const table = document.getElementById(tableId);
        if (table) {
			
            // Create a wrapper div for each table with dark-themed styles
            htmlContent.push('<div style="border: 1px solid #222; flex: 1; margin: 4px; background-color: #444; padding: 4px 4px;max-width:99vw;margin:auto;margin-top:0;">');

            // Add an <h4> label inside the table wrapper div based on the tableId
            let h4Label = '';
            if (tableId === 'WTStable') {
                h4Label = 'Items for Sale';
            } else if (tableId === 'WTBtable') {
                h4Label = 'Item Purchase Offers';
            }
            htmlContent.push(`<h4 style="color: #000000;font-weight:bold;margin:0;width:max-content;">${h4Label}</h4>`);

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
						background-image:;
						background-size: cover;
						background-repeat: no-repeat;
						background-position: center;
						color: ;
						opacity:1;
						width: 100vw;
					}
					input {
						width: 85x !important;
						background: #0000004f;
						color: #00defad6;
						font-weight: bold;
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
						box-shadow: ;
						text-align: center;
					}
					table.dataTable thead .sorting_desc {
						border: 3px outset #454545;
						color: #385a80c9;
						background-color: #18162d;
						box-shadow: ;
						text-align: center;
					}
					td.dataTables_empty {
						display: none;
					}
					.dataTables_wrapper .dataTables_length select {
						border: 1px inset #000;
						border-radius: 3px;
						padding: 5px;
						color: #08aeff;
						background-color: #18162d;
						padding: 4px;
					}
					.dataTables_wrapper .dataTables_filter input {
						border: 1px inset #000;
						border-radius: 3px;
						padding: 5px;
						color: #08aeff;
						background-color: #18162d;
						padding: 4px;
					}
					input[type="search"]:focus-visible {
						outline: 1px ridge #00f1ff;
						color: #00f1ff;
					}
					table.dataTable tbody td:nth-child(1) {
						width: 100% !important;
						min-width: 5% !important;
						max-width: 25% !important;
					}
					table.dataTable tbody td:nth-child(2) {
						color: #a15c0f;
						font-weight: bold;
						width: 50% !important;
					}
					td {
						min-width: 90px !important;
						width: 100%;
						max-width: 13% !important;
					}
					/* Style the sorting indicators */
					th.sorting::after,
					th.sorting_asc::after,
					th.sorting_desc::after {
						display: inline-block;
						margin-left: 10px;
						border-width: 5px;
						border-style: solid;
						border-color: transparent;
					}

					/* Default sort indicator */
					th.sorting::after {
						border-top-color: #000; /* Triangle pointing upwards */
					}

					/* Ascending sort indicator */
					th.sorting_asc::after {
						border-bottom-color: #000; /* Triangle pointing downwards */
					}

					/* Descending sort indicator */
					th.sorting_desc::after {
						border-top-color: #000; /* Triangle pointing upwards */
					}
					.custom-scrollbar::-webkit-scrollbar {
						 /* Hides scrollbar in WebKit browsers (Chrome, Safari) */
					}

					.custom-scrollbar {
						-ms-overflow-style: none;  /* Hides scrollbar in IE and Edge */
						scrollbar-width: 1px;
						scrollbar-opacity:0.1!important;/* Hides scrollbar in Firefox */
					}
							/* Custom scrollbar for WebKit browsers (Chrome, Safari) */
					.custom-scrollbar::-webkit-scrollbar {
						width: 7px; /* Width of the scrollbar */
					}

					.custom-scrollbar::-webkit-scrollbar-track {
					  opacity:0.1;
						background: ; /* Background of the scrollbar track */
					}

					.custom-scrollbar::-webkit-scrollbar-thumb {
						background: #888; /* Background of the scrollbar thumb */
						border-radius: 6px; /* Round edges of the scrollbar thumb */
					}

					.custom-scrollbar::-webkit-scrollbar-thumb:hover {
						background: #555; /* Background of the scrollbar thumb on hover */
					}
					#gameArea {
						position: fixed;
						width: 100vw;
						height: 100vh;
						z-index: 100;
						pointer-events: none;
						/* opacity: 1.0; */
					}
					#pixelb8 {
						position: fixed;
						width: 64px; /* Adjust according to your sprite size */
						height: 64px; /* Adjust according to your sprite size */
						background-image: url('https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-face-front.png'); /* Initial spritesheet */
						background-size: cover;
						opacity:1.0;
						transition:0.3, smooth;
					}
					#pixelb8.batterylow {
						position: fixed;
						width: 64px; /* Adjust according to your sprite size */
						height: 64px; /* Adjust according to your sprite size */
						background-image: url('https://pixelb8.lol/assets/images/sprites/pixelbot/pixelbot-face-front.png'); /* Initial spritesheet */
						background-size: cover;
						opacity: 0.8;
						transition: all 1.9s ease 0s;
					}
					@keyframes move {
						0% { background-position: 0 0; }
						100% { background-position: -124px 0; } /* Move to the second frame */
					}

					.animate {
						animation: move 1s steps(2) infinite; /* 1s duration, 2 steps (frames), infinite loop */
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
				  const markupValue = parseFloat(row.querySelector('td:nth-child(4) input').value) || markupValue;
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
			// Close the other div 
			htmlContent.push('</div>');
			// Close the other div 
			htmlContent.push('</div>');
			// Close the other div 
			htmlContent.push('</div>');
			// Close the body wrapper
			htmlContent.push('</body>');
			htmlContent.push('<script src="https://pixelb8.lol/core/js/core-apps/pixelbot-movement.js"></script>');
        }
    });


    // Combine HTML content with line breaks
    const combinedHtml = htmlContent.join('\n');

    // Create a textarea element with the ID "fancypricelist-html"
	const textarea = document.createElement('textarea');
	textarea.id = 'fancypricelist-html'; // Set the ID
    textarea.value = combinedHtml;
    document.body.appendChild(textarea);

    // Select the text in the textarea
    textarea.select();
    //document.execCommand('copy');
	// Create a close button
	const closeButton = document.createElement('button');
	closeButton.id = 'closefancypricelist-textarea'; // Set the ID
	closeButton.textContent = 'Close Text Box'; // Set button text

	// Append the button to the document body
	document.body.appendChild(closeButton);
    // Remove the textarea
    //document.body.removeChild(textarea);
	// Add event listener to the button to remove both elements
	closeButton.addEventListener('click', function() {
		const textarea = document.getElementById("fancypricelist-html");
		const button = document.getElementById("closefancypricelist-textarea");
		if (textarea) {
			document.body.removeChild(textarea);
		}
		if (button) {
			document.body.removeChild(button);
		}
	});

}

document.getElementById("PLcreate-button-fancy").addEventListener("click", function () {
    console.log('copyfancyhtml button clicked');
// Get and set the selected value from the dropdown
    selectedOption = document.getElementById("PL-selectTables").value;
    console.log(selectedOption);
// Get and set the user's entered Colonist name
    colonistName = document.getElementById("PL-input-colonistName").value;
    console.log('Colonist name entered:', colonistName);
// Get and set the user's input from the textarea
    userInput = document.getElementById("PL-textarea-userinput-plbody").value;
	plComment = userInput;
    console.log('User input:', userInput);
	console.log('new user comment:', plComment);
// Get and set the user's input from the image input
    userImg = document.getElementById("PL-input-userimg").value;
    console.log('User image input:', userImg);
	// If the user provided a name, run the function
    if (colonistName) {
        console.log('Attempting to copy fancy HTML to clipboard'); 
        // Example if statement based on the selected option
        if (selectedOption === "For Sale") {
            copyTablesFancyHtml(["WTStable"], colonistName);
            console.log("For Sale selected");
        } else if (selectedOption === "Purchase Offers") {
            copyTablesFancyHtml(["WTBtable"], colonistName);
            console.log("Purchase Offers selected");
        } else if (selectedOption === "Include Both") {
            copyTablesFancyHtml(["WTStable", "WTBtable"], colonistName);
            console.log("Include Both selected");
        }
    } else {
        console.log('No Colonist name entered. Operation cancelled.');
    }
});


// Usage example without custom HTML styling
document.getElementById("PLcopyhtml-button").addEventListener("click", function () {
	console.log('copy fancy htmlbutton clicked');
    copyTablesHtml(["WTStable", "WTBtable"]);
	console.log('attempting to copy fancy html to clipboard');
});

document.addEventListener("DOMContentLoaded", function () {
    const itemSelect = document.getElementById("Weaponscacheitemselect");
	const restockitemSelect = document.getElementById("Restockitemselect");
	const Sellitemselect = document.getElementById("Sellitemselect");
	const restockamountinput = document.getElementById("numberofcacheitemstoadd");
	    // Event listener for the "Generate Embed Code" button

    // Event listener for the change event on the dropdown
    itemSelect.addEventListener("change", function () {
        const selectedItem = itemSelect.value;
        console.log("Dropdown Change - Selected Item:", selectedItem);
        populateEditStashValuesForm(selectedItem);

    });
	restockitemSelect.addEventListener("change", function () {
        const selectedItem = restockitemSelect.value;
        console.log("Dropdown Change - Selected Item:", selectedItem);
        populateRestockValuesForm(selectedItem);

    });
	Sellitemselect.addEventListener("change", function () {
        const selectedItem = Sellitemselect.value;
        console.log("Dropdown Change - Selected Item:", selectedItem);
        populateSellValuesForm(selectedItem);

    });
	restockamountinput.addEventListener("change", function () {
        const selectedItem = restockitemSelect.value;
		const Restockamount = restockamountinput.value;
        console.log("itemcount changed- Selected Item:", selectedItem, Restockamount);
        populateRestockValuesForm(selectedItem);
    });


// Button Event listener - Editor Update stash Values
document.getElementById("EditorUpdatestashValues").addEventListener("click", function () {
    // Get the selected item from the dropdown
    const selectedItemObject = JSON.parse(document.getElementById("Weaponscacheitemselect").value);
    const selectedItem = selectedItemObject.name;

    // Get the changed values from the input fields
	const updatedValues = {
		selectedPlanet: document.getElementById("currentitemPlanet").value,
		storageContainer: document.getElementById("currentitemContainer").value,
		ttValue: document.getElementById("currentitemttvalue").value,
		maxMarkup: document.getElementById("currentitemmaxmarkup").value,
		amountStashed: document.getElementById("currentitemcount").value,
		stashedPed: parseFloat(parseFloat(document.getElementById("currentitemstashedped").value).toFixed(2))
	};

    // Prompt the user with confirmation and display the item and changed values
    const confirmationMessage = `Are you sure you want to update the values for "${selectedItem}" with the following changes?\n\n`;
    const changesMessage = Object.entries(updatedValues)
        .map(([key, value]) => `${key}: ${value}`)
        .join("\n");

    const userConfirmation = confirm(`${confirmationMessage}${changesMessage}`);

    // If the user confirms, update the values
    if (userConfirmation) {
        updateStashValues(selectedItem, updatedValues);
    }
});



document.getElementById("removestashedItem-button").addEventListener("click", function () {
    // Get the selected item
    const selectedItemObject = JSON.parse(itemSelect.value);
    const selectedItemIndex = selectedItemObject.index;

    // Prompt the user with confirmation
    const confirmationMessage = `Are you sure you want to remove the item "${selectedItemObject.name}" from the stash?`;
    const userConfirmation = confirm(confirmationMessage);

    // If the user confirms, remove the item
    if (userConfirmation) {
        removeStashedItem(selectedItemIndex);
    }
});

// Function to remove the selected item from stash
function removeStashedItem(selectedItemIndex) {
    if (selectedItemIndex >= 0 && selectedItemIndex < allData.length) {
        // Remove the item from the array
        allData.splice(selectedItemIndex, 1);

        // Save the updated data back to local storage
        localStorage.setItem("weaponsCacheData", JSON.stringify(allData));

        // Reload the data to reflect the changes in the UI
        loadCacheDataFromLocalStorage();


        console.log(`Item at index ${selectedItemIndex} removed from stash and dropdown successfully.`);
    } else {
        console.error(`Invalid index ${selectedItemIndex}. Item not removed from the data array.`);
    }
}
	
document.getElementById("RestockitemConfirm").addEventListener("click", function () {
    // Get the selected item
    const selectedItemObject = JSON.parse(document.getElementById("Restockitemselect").value);
    const selectedItemIndex = selectedItemObject.index;

    const selectedData = allData[selectedItemIndex];
    const amountRestocked = parseInt(document.getElementById("numberofcacheitemstoadd").value) || 0;
    const totalRestockCost = parseFloat(document.getElementById("totalrestockcost").innerText) || 0;

    // Confirmation prompt
    const confirmationMessage = `Are you sure you want to restock ${amountRestocked} units of ${selectedData.item}? This will cost ${totalRestockCost} PED.`;

    if (window.confirm(confirmationMessage)) {
        // Update the selectedData object
        if (selectedData) {
            // Update amountStashed and stashedPed
            selectedData.amountStashed = (parseInt(selectedData.amountStashed) || 0) + amountRestocked;
            selectedData.stashedPed = (parseFloat(selectedData.stashedPed) || 0) - totalRestockCost;

            // You may want to update other properties if needed

            // Log the updated selectedData
            console.log('Updated selectedData:', selectedData);

            // Save the updated data to local storage using the existing function
            savecacheDataToLocalStorage("weaponsCacheData", allData);
            loadCacheDataFromLocalStorage();
        } else {
            console.log('Error: Selected data not found.');
        }
    } else {
        console.log('Restock canceled by the user.');
    }
});
/*     console.log("DOMContentLoaded Event");
    loadCacheDataFromLocalStorage(); */
});


//------------------------------------------------------------------------

document.getElementById("SellItemButton").addEventListener("click", function () {
    // Get the selected item
    const selectedItemObject = JSON.parse(Sellitemselect.value);
    const selectedItemIndex = selectedItemObject.index;

    // Use the index to get the selectedData
    const selectedData = allData[selectedItemIndex];

    // Get the amount to sell and total sale price
    const amountToSell = parseInt(document.getElementById("numberofcacheitemstosell").value) || 0;
    const totalSalePrice = parseFloat(document.getElementById("totalsaleprice").innerText) || 0;

    // Confirmation prompt
    const confirmationMessage = `Are you sure you want to sell ${amountToSell} units of ${selectedData.item}? This will earn you ${totalSalePrice} PED.`;

    if (window.confirm(confirmationMessage)) {
        // Update the selectedData object
        if (selectedData) {
            // Update amountStashed and stashedPed for selling
            selectedData.amountStashed = (parseInt(selectedData.amountStashed) || 0) - amountToSell;
            selectedData.stashedPed = (parseFloat(selectedData.stashedPed) || 0) + totalSalePrice;

            // You may want to update other properties if needed

            // Log the updated selectedData
            console.log('Updated selectedData:', selectedData);

            // Save the updated data to local storage using the existing function
            savecacheDataToLocalStorage("weaponsCacheData", allData);

            // Now you can perform any other necessary actions
            loadCacheDataFromLocalStorage();
        } else {
            console.log('Error: Selected data not found.');
        }
    } else {
        console.log('Sale canceled by the user.');
    }
});
function populateRestockValuesForm(selectedItem) {
    console.log("Selected Item:", selectedItem);
    const selectedOption = JSON.parse(selectedItem);
    const itemIndex = selectedOption.index;

    // Choose the specific item based on its index in the original data
    const selectedData = allData[itemIndex];

    const restockamountinput = document.getElementById("numberofcacheitemstoadd");
    const restockmupercentinput = document.getElementById("restockitemmaxmarkup");

    // Check if the selected data is found
    if (selectedData) {
        const restocklimit = calculateTotalPurchasesRemaining(selectedData);
        const Restockamount = parseFloat(restockamountinput.value) || 0;
        const restockmupercent = parseFloat(restockmupercentinput.value) / 100 || 0;
        const Restockcost = selectedData.ttValue * restockmupercent;
        const Totalrestockcost = Restockcost * Restockamount;

        // Populate the input fields with the corresponding values
        document.getElementById("currentitemstock").innerText = selectedData.amountStashed || 'n/a';
        document.getElementById("allocatedstashped").innerText = selectedData.stashedPed || 'n/a';
        document.getElementById("restocklimit").innerText = restocklimit || 'n/a';
        restockmupercentinput.value = selectedData.maxMarkup || '0.00';

        document.getElementById("restockcostperitem").innerText = Restockcost.toFixed(2) || '0.00';
        document.getElementById("totalrestockcost").innerText = Totalrestockcost.toFixed(2) || '0.00';
        console.log("Restockamount:", Restockamount);
        console.log("restockmupercent:", restockmupercent);
        console.log("Restockcost:", Restockcost);
        console.log("total Restockcost:", Totalrestockcost);

    } else {
        // If data not found, clear the input fields
        document.getElementById("currentitemstock").innerText = 'n/a';
        document.getElementById("allocatedstashped").value = 'n/a';
        document.getElementById("restocklimit").value = 'n/a';
        restockamountinput.value = '0';
        restockmupercentinput.value = '0.00';

        document.getElementById("restockcostperitem").value = '0.00';
        document.getElementById("totalrestockcost").value = '0.00';
    }
}
function populateSellValuesForm(selectedItem) {
    console.log("Selected Item for Selling:", selectedItem);

    // Assuming you have input elements to display sell-related information
    const itemttvalue = document.getElementById("sellitemttvalue");
    const itemstock = document.getElementById("sellitemstock");
    const sellAmountInput = document.getElementById("numberofcacheitemstosell");
    const itemmarkup = document.getElementById("itemsalemarkup");
    const sellPricePerItem = document.getElementById("sellpriceperitem");
    const totalSalePrice = document.getElementById("totalsaleprice");

    // Parse the selected value back into an object
    const selectedOption = JSON.parse(selectedItem);
    const itemIndex = selectedOption.index;

    // Choose the specific item based on its index in the original data
    const selectedData = allData[itemIndex];

    if (selectedData) {
        // Populate the input fields with the corresponding values
        itemttvalue.innerText = selectedData.ttValue || '0.00';
        itemstock.innerText = selectedData.amountStashed || 'n/a';
        sellAmountInput.value = '0'; // Clear the input field
        itemmarkup.value = selectedData.maxMarkup || '0.00';
        sellPricePerItem.innerText = calculateSellPricePerItem(selectedData).toFixed(2);
        totalSalePrice.innerText = '0.00'; // Set initial total sale price

        // Add event listener to update total sale price when sell amount changes
        sellAmountInput.addEventListener("change", function () {
            const sellAmount = parseInt(sellAmountInput.value) || 0;
            totalSalePrice.innerText = calculateTotalSalePrice(selectedData, sellAmount).toFixed(2);
        });

    } else {
        // If data not found, clear the input fields
        sellAmountInput.value = '';
        sellPricePerItem.innerText = '0.00';
        totalSalePrice.innerText = '0.00';
    }
}
// Function to calculate sell price per item
function calculateItemPrice(itemData, markup) {
    // Implement your logic to calculate the sell price per item
    // For example, you might use a percentage of the TT value

    // Remove percentage sign if present and parse the value
    const markupValue = parseFloat(markup.replace('%', ''));
	itemttValue = parseFloat(itemData.innerText);
	console.log("markup returns:", markup);
	console.log("markupValue returns:", markupValue);
	console.log("itemData.value returns:", itemData.innerText);
	console.log("itemttValue returns:", itemttValue);
    // Check if the parsed value is a valid number
    if (!isNaN(markupValue)) {
        return itemttValue * (markupValue / 100);

    } else {
        console.error("Invalid sale markup percentage");
        console.log("markup returns:", markup);
        return 0; // or any default value you prefer
    }
}
// Add event listeners to all elements with class "pricelistmarkupInput"
document.querySelectorAll('.pricelistmarkupInput').forEach(function (markupInput) {
    markupInput.addEventListener('keyup', function (event) {
        // Log the changed markup value
        console.log("Markup value changed:", markupInput.value);

        // Check if the Enter key was pressed (keyCode 13) or use another condition as needed
        if (event.keyCode === 13) {
            // Find the associated row
            const row = markupInput.closest('tr');

            // Get the values from the relevant cells
            const ttValueCell = row.cells[1]; // Update with the correct index
            const markupCell = row.cells[2]; // Update with the correct index

            // Run your calculateItemPrice function with the cell values
            const pricePerItem = calculateItemPrice(ttValueCell.innerText, markupInput.value);
            console.log("Calculated Price Per Item:", pricePerItem.toFixed(4));

            // You can update other elements or perform additional actions as needed
        }
    });
});

// Function to update "Price Per Item" based on the current row's values
function updatePricePerItem(row) {
    const ttValue = parseFloat(row.cells[1].innerText);
    const markupInput = row.cells[2].getElementsByTagName("input")[0];
    const markupValue = parseFloat(markupInput.value.replace('%', ''));

    // Check if the parsed value is a valid number
    if (!isNaN(markupValue)) {
        const pricePerItem = ttValue * (markupValue / 100);
        row.cells[3].innerText = pricePerItem.toFixed(4);
    } else {
        console.error("Invalid sale markup percentage");
        row.cells[3].innerText = "0.00";
    }
}



function updateItemTotalPrice(row) {
    const peritem = parseFloat(row.cells[3].innerText);
    const amount = row.cells[5].getElementsByTagName("input")[0];
    // Check if the parsed value is a valid number
    if (!isNaN(peritem)) {
        const totalitemcost = peritem * amount.value;
        row.cells[6].innerText = totalitemcost.toFixed(2);
		updateTotalCostWTStable();
		updateTotalCostWTBtable();
    } else {
        console.error("Invalid sale markup percentage");
        row.cells[6].innerText = "0.00";
    }
}

function updateTotalCost(tableId) {
    const pricelistTable = document.getElementById(tableId);
    const totalCostElementId = "totalcost-" + tableId;
    const totalCostElement = document.getElementById(totalCostElementId);

    let totalSum = 0;

    // Iterate through all rows of the specified table
    for (let i = 1; i < pricelistTable.rows.length; i++) {
        // Get the value from cell 6 (index 5) in each row
        const totalCostCell = pricelistTable.rows[i].cells[6];
        const totalCostValue = parseFloat(totalCostCell.innerText);

        // Check if the value is a valid number
        if (!isNaN(totalCostValue)) {
            totalSum += totalCostValue;
        }
    }

    // Set the total sum as the inner text of the totalCostElement
    totalCostElement.innerText = totalSum.toFixed(2);
}

function updateTotalCostWTStable() {
    const pricelistTable = document.getElementById("WTStable");
    const totalCostElement = document.getElementById("totalcost-WTStable");

    let totalSum = 0;

    // Iterate through all rows of WTStable
    for (let i = 1; i < pricelistTable.rows.length; i++) {
        // Get the value from cell 6 (index 5) in each row
        const totalCostCell = pricelistTable.rows[i].cells[6];
        const totalCostValue = parseFloat(totalCostCell.innerText);

        // Check if the value is a valid number
        if (!isNaN(totalCostValue)) {
            totalSum += totalCostValue;
        }
    }

    // Set the total sum as the inner text of the totalCostElement
    totalCostElement.innerText = totalSum.toFixed(2);
}
function updateTotalCostWTBtable() {
    const pricelistTable = document.getElementById("WTBtable");
    const totalCostElement = document.getElementById("totalcost-WTBtable");

    let totalSum = 0;

    // Iterate through all rows of WTStable
    for (let i = 1; i < pricelistTable.rows.length; i++) {
        // Get the value from cell 6 (index 5) in each row
        const totalCostCell = pricelistTable.rows[i].cells[6];
        const totalCostValue = parseFloat(totalCostCell.innerText);

        // Check if the value is a valid number
        if (!isNaN(totalCostValue)) {
            totalSum += totalCostValue;
        }
    }

    // Set the total sum as the inner text of the totalCostElement
    totalCostElement.innerText = totalSum.toFixed(2);
}

/* function updateTotalCost(row, cost) {
    const pricePerItem = parseFloat(row.cells[3].innerText);
    const newInput = row.cells[5].getElementsByTagName("input")[0];
    const inputValue = parseFloat(newInput.value);

    if (!isNaN(inputValue)) {
        const calculatedValue = pricePerItem * inputValue;
        row.cells[6].innerText = calculatedValue.toFixed(2);
    } else {
        console.error("Invalid input value");
        row.cells[6].innerText = "0.00";
    }
} */
// Function to add or update item in the pricelist
function addToPriceList(itemData) {
    // Assuming you have a table with the id "WTStable"
    const pricelistTable = document.getElementById("WTStable");
    const tbody = pricelistTable.querySelector('tbody');

    // Check if the item is already in the pricelist
    const existingRow = Array.from(tbody.rows).find(row => row.cells[0].innerText === itemData.item);

    if (existingRow) {
        // Update existing row with new values
        existingRow.cells[1].innerText = parseFloat(itemData.ttValue).toFixed(4);

        // Update existing input value
        const markupInput = existingRow.cells[2].getElementsByTagName("input")[0];
        markupInput.value = itemData.maxMarkup;

        // Add event listener to update Price Per Item on input change
        markupInput.addEventListener('keyup', function (event) {
            updatePricePerItem(existingRow);
        });

        // Calculate and update "Price Per Item"
        updatePricePerItem(existingRow);

        existingRow.cells[4].innerText = itemData.amountStashed;

        // Update existing input value
        const newInput = existingRow.cells[5].getElementsByTagName("input")[0];
        newInput.value = "";
        const totalCostCell = existingRow.cells[6];
        totalCostCell.innerText = "0.00";
    } else {
        // Create a new row if the item is not in the pricelist
        const newRow = tbody.insertRow();

        // Populate the row with data
        const itemNameCell = newRow.insertCell();
        itemNameCell.innerText = itemData.item;
		itemNameCell.setAttribute("title", itemData.selectedPlanet);
        const ttValueCell = newRow.insertCell();
        ttValueCell.innerText = itemData.ttValue;

        const markupCell = newRow.insertCell();
        // Create input element
        const markupInput = document.createElement("input");
        markupInput.type = "text";
		markupInput.setAttribute("placeholder", itemData.maxMarkup);
        markupInput.value = itemData.maxMarkup;
        markupCell.appendChild(markupInput);

        // Add event listener to update Price Per Item on input change
        markupInput.addEventListener('keyup', function (event) {
            updatePricePerItem(newRow);
        });

        const pricePerItemCell = newRow.insertCell();
        // Calculate and display "Price Per Item"
        updatePricePerItem(newRow);

        const itemStockCell = newRow.insertCell();
        itemStockCell.innerText = itemData.amountStashed;

        const newInputCell = newRow.insertCell();
        // Create input element with empty value and placeholder "0"
        const newInput = document.createElement("input");
        newInput.type = "text";
        newInput.value = "";
        newInput.placeholder = "0";
        newInputCell.appendChild(newInput);
        const totalCostCell = newRow.insertCell();
        totalCostCell.innerText = "0.00";
        // Add event listener to update calculated values on input change
        newInput.addEventListener('keyup', function (event) {
            updateItemTotalPrice(newRow);
        });
    }
}

function addToPurchaseOffers(itemData) {
    // Assuming you have a table with the id "WTBtable"
    const purchaseOffersTable = document.getElementById("WTBtable");
    const tbody = purchaseOffersTable.querySelector('tbody');

    // Calculate total purchases remaining
    const totalPurchasesRemaining = calculateTotalPurchasesRemaining(itemData);

    // Check if totalPurchasesRemaining is greater than 0
    if (totalPurchasesRemaining > 0) {
        // Check if the item is already in the purchase offers table
        const existingRow = Array.from(tbody.rows).find(row => row.cells[0].innerText === itemData.item);

        if (existingRow) {
            // Update existing row with new values
            existingRow.cells[1].innerText = itemData.ttValue;

            // Update existing input value
            const markupInput = existingRow.cells[2].getElementsByTagName("input")[0];
            markupInput.value = itemData.maxMarkup;

            // Add event listener to update Price Per Item on input change
            markupInput.addEventListener('keyup', function (event) {
                updatePricePerItem(existingRow);
            });

            // Calculate and update "Price Per Item"
            updatePricePerItem(existingRow);

            existingRow.cells[4].innerText = totalPurchasesRemaining;

            // Update existing input value
            const newInput = existingRow.cells[5].getElementsByTagName("input")[0];
            newInput.value = "";
            // Update existing total cost value
            const totalCostCell = existingRow.cells[6];
            existingRow.cells[6].innerText = "0.00";
        } else {
            // Create a new row if the item is not in the purchase offers table
            const newRow = tbody.insertRow();

            // Populate the row with data
            const itemNameCell = newRow.insertCell();
            itemNameCell.innerText = itemData.item;
			itemNameCell.setAttribute("title", itemData.selectedPlanet);
            const ttValueCell = newRow.insertCell();
            ttValueCell.innerText = itemData.ttValue;

            const markupCell = newRow.insertCell();
            // Create input element
            const markupInput = document.createElement("input");
            markupInput.type = "text";
            markupInput.value = itemData.maxMarkup;
			markupInput.setAttribute("placeholder", itemData.maxMarkup);
            markupCell.appendChild(markupInput);

            // Add event listener to update Price Per Item on input change
            markupInput.addEventListener('keyup', function (event) {
                updatePricePerItem(newRow);
            });

            const pricePerItemCell = newRow.insertCell();
            // Calculate and display "Price Per Item"
            updatePricePerItem(newRow);

            const purchasesRemainingCell = newRow.insertCell();
            purchasesRemainingCell.innerText = totalPurchasesRemaining;

            const newInputCell = newRow.insertCell();
            // Create input element with empty value and placeholder "0"
            const newInput = document.createElement("input");
            newInput.type = "text";
            newInput.value = "";
            newInput.placeholder = "0";
            newInputCell.appendChild(newInput);

            const totalCostCell = newRow.insertCell();
            totalCostCell.innerText = "0.00";

            // Add event listener to update calculated values on input change
            newInput.addEventListener('keyup', function (event) {
                updateItemTotalPrice(newRow);
            });
        }
    }
}
// Function to calculate sell price per item
function calculateSellPricePerItem(selectedData) {
    // Implement your logic to calculate the sell price per item
    // For example, you might use a percentage of the TT value

    const saleMUpercentage = parseFloat(document.getElementById("itemsalemarkup").value);

    // Check if the parsed value is a valid number
    if (!isNaN(saleMUpercentage)) {
        return selectedData.ttValue * (saleMUpercentage / 100);
    } else {
        console.error("Invalid sale markup percentage");
        return 0; // or any default value you prefer
    }
}
// Function to calculate total sale price
function calculateTotalSalePrice(selectedData, sellAmount) {
    const sellPricePerItem = calculateSellPricePerItem(selectedData);
    return sellAmount * sellPricePerItem;
}
function populateEditStashValuesForm(selectedItem) {
    console.log("Selected Item:", selectedItem);

    // Parse the selected value back into an object
    const selectedOption = JSON.parse(selectedItem);

    // Get the item name and index from the object
    const itemName = selectedOption.name;
    const itemIndex = selectedOption.index;

    // Choose the specific item based on its index in the original data
    const selectedData = allData[itemIndex];

    // Populate the input fields with the corresponding values
    document.getElementById("currentitemPlanet").value = selectedData.selectedPlanet || '';
    document.getElementById("currentitemContainer").value = selectedData.storageContainer || '';
    document.getElementById("currentitemttvalue").value = selectedData.ttValue || '';
    document.getElementById("currentitemmaxmarkup").value = selectedData.maxMarkup || '';
    document.getElementById("currentitemcount").value = selectedData.amountStashed || '';
    document.getElementById("currentitemstashedped").value = selectedData.stashedPed || '';
}

// Function to clear input fields
function clearInputFields() {
    document.getElementById("currentitemPlanet").value = '';
    document.getElementById("currentitemContainer").value = '';
    document.getElementById("currentitemttvalue").value = '';
    document.getElementById("currentitemmaxmarkup").value = '';
    document.getElementById("currentitemcount").value = '';
    document.getElementById("currentitemstashedped").value = '';
}
// Function to update stash values
function updateStashValues(selectedItem, updatedValues) {
    // Find the index of the specific item in the data array
    const selectedItemIndex = allData.findIndex(data => data.item === selectedItem);

    if (selectedItemIndex !== -1) {
        // Update the values for the specific item
        Object.entries(updatedValues).forEach(([key, value]) => {
            allData[selectedItemIndex][key] = value;
        });

        // Save the updated data back to local storage
        localStorage.setItem("weaponsCacheData", JSON.stringify(allData));

        // Reload the data to reflect the changes in the UI
        loadCacheDataFromLocalStorage();

        console.log(`Values for "${selectedItem}" updated successfully.`);
    } else {
        console.error(`No matching item found for "${selectedItem}" in the data array.`);
    }
}


//load event
document.addEventListener("DOMContentLoaded", function () {
    console.log("DOMContentLoaded Event");
    loadCacheDataFromLocalStorage();
});















// Function to add new item data to default cache
function Additemtocache() {
    console.log("Saving Data");
    const container = document.getElementById("AddWeaponCachebox");

    // Retrieve existing data from local storage
    const storedData = localStorage.getItem("weaponsCacheData");
    let allData = storedData ? JSON.parse(storedData) : [];
    // Create a new data entry
    const newData = {
        item: getValueFromInput("itemname", container),
        ttValue: getValueFromInput("pedamount", container),
        maxMarkup: getValueFromInput("maxmarkup", container),
        amountStashed: getValueFromInput("amount", container),
        stashedPed: getValueFromInput("pedamount-stashed", container),
        selectedPlanet: getValueFromSelect("Weaponscache-selectplanet", container),
        storageContainer: getValueFromInput("storagecontainername", container)
    };
    allData.push(newData);    // Append the new entry to the existing data
    localStorage.setItem("weaponsCacheData", JSON.stringify(allData));    // Save the updated data back to local storage
    loadCacheDataFromLocalStorage();    // Call the function to load data after saving
}






//-----input appearance formatting----------------------------------
// Add event listener for formatting percentage
document.getElementById("maxmarkup").addEventListener("input", function (event) {
    formatPercentage(this, event);
});
document.getElementById("currentitemmaxmarkup").addEventListener("input", function (event) {
    formatPercentage(this, event);
});


function formatPercentage(input, event) {
    // Remove non-numeric characters
    let value = input.value.replace(/[^\d]+/g, '');
    if (event.inputType === 'deleteContentBackward') {
        if (value.length === 1) {// Check if the first digit is being deleted
            input.value = '0.00%';// Set the value to 0.00% if the first digit is deleted
            return;
        }
        
        value = value.slice(0, -1);// Delete the last digit
    }
    if (value === '') {
        input.value = '0.00%'; // Display 0.00% when the input is empty
        return;
    }
    value = value.replace(/^0+/, '');// Remove leading zeros
    const wholePart = value.slice(0, -2);
    const decimalPart = value.slice(-2);
    let formattedValue = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    formattedValue += `.${decimalPart}`;
    input.value = formattedValue + "%";
}
// Function to get value from input within a specific container
function getValueFromInput(id, container) {
    // Updated to match the correct id for the storage container
    const inputElement = container.querySelector(`#${id}`);
    return inputElement ? inputElement.value : '';
}

// Function to get value from select within a specific container
function getValueFromSelect(id, container) {
    const selectElement = container.querySelector(`#${id}`);
    return selectElement ? selectElement.value : '';
}


function loadCacheDataFromLocalStorage() {
    console.log("Loading weaponsCacheData");
    const stashTable = document.getElementById("stashTable");
    const tbody = stashTable.querySelector('tbody');

    // Remove all rows from tbody
    tbody.innerHTML = '';

    const selectElement = document.getElementById("Weaponscacheitemselect");
    const RestockselectElement = document.getElementById("Restockitemselect");
    const SellselectElement = document.getElementById("Sellitemselect");

    // Clear existing options in the select elements
    selectElement.innerHTML = "";
    RestockselectElement.innerHTML = "";
    SellselectElement.innerHTML = "";

    const storedData = localStorage.getItem("weaponsCacheData");

    if (storedData) {
        const allData = JSON.parse(storedData);
        console.log("Loaded weaponsCacheData:", allData);

        // Calculate totals using allData
        const { totalStashedPed, totalStashedItemValue } = calculateTotals(allData);

        // Update total stashed ped value
        document.getElementById("stashpedtotalValue").innerText = totalStashedPed.toFixed(2);

        // Update total stashed item value
        document.getElementById("stasheditemtotalValue").innerText = totalStashedItemValue.toFixed(2);

        // Loop through all entries in the array
        allData.forEach(function (data, index) {
            // Create a new table row in tbody
            const newRow = tbody.insertRow();

            // Insert cells in the new row
            newRow.insertCell().innerText = data.selectedPlanet || '';
            newRow.insertCell().innerText = data.storageContainer || '';
            newRow.insertCell().innerText = data.item || '';
            newRow.insertCell().innerText = data.ttValue || '';
            newRow.insertCell().innerText = data.maxMarkup || '';
            newRow.insertCell().innerText = data.amountStashed || '';
            newRow.insertCell().innerText = data.stashedPed || '';

            // Calculate total purchases remaining
            const totalPurchasesRemaining = calculateTotalPurchasesRemaining(data);

            // Calculate total value of the item
            const totalItemValue = parseFloat(data.ttValue) * (parseFloat(data.maxMarkup) / 100) * parseFloat(data.amountStashed) || 0;

            // Append total value to the title
            newRow.title = `Total Stored Item Value: ${totalItemValue.toFixed(2)} Ped\nCurrent PED Budget is enough for: ${totalPurchasesRemaining} more of this item.`;

            if (parseInt(data.amountStashed) > 0) {
                // Add the item to the pricelist for items for sale
                addToPriceList(data);
            }
            // Check total purchases remaining to add to purchase offers
            addToPurchaseOffers(data);

            // Create an object with both item name and index
            const optionValue = { name: data.item, index: index };

            // Create the option element
            const option = document.createElement("option");
            option.value = JSON.stringify(optionValue); // Convert the object to a string
            option.text = data.item;

            // Add the option to the select elements
            selectElement.add(option);
            RestockselectElement.add(option.cloneNode(true)); // Clone the option for RestockselectElement
            SellselectElement.add(option.cloneNode(true)); // Clone the option for SellselectElement
        });
    }
}
// default save function
function savecacheDataToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
// check local storage function
function getSavedKeys() {
    const savedKeys = Object.keys(localStorage).filter((key) => key.endsWith("_savedcache"));
    return savedKeys.map((key) => key.replace("_savedcache", ""));
}
//unique file save/overwrite
function saveWeaponsCache() {
  const savedcacheData = localStorage.getItem("weaponsCacheData");
  const savedKeys = getSavedKeys();
  console.log("if no button press its probably cuz theres no 'weaponCacheData' try tracking 1 new item entry first");
  if (savedcacheData) {
    const savingWeaponsCache = JSON.parse(savedcacheData);
    let userKey = prompt(`Choose a save file or create a new save file to save your data:\n\nCurrent File Saves:\n${savedKeys.join("\n")}`);
    if (userKey !== null && userKey !== "") {
      if (savedKeys.includes(userKey)) {
        // Key already exists, ask for confirmation
        const overwriteConfirm = confirm(`The key '${userKey}' already exists. Do you want to overwrite it?`);
        if (!overwriteConfirm) {
          console.log("Data not saved.");
          return;
        }
      }
      savecacheDataToLocalStorage(`${userKey}_savedcache`, savingWeaponsCache);
	  console.log("savecacheDataToLocalStorage ${userKey}_savedcache)",savingWeaponsCache);
      console.log(`Data saved successfully under the key: ${userKey}`);
      console.log("Saved data: ", savingWeaponsCache);
    } else {
      console.log("Invalid key. Data not saved.");
    }
  }
}
// button event listener - Save Unique cache
document.getElementById("SaveUniquecache").addEventListener("click", saveWeaponsCache);

// Function to calculate total purchases remaining
function calculateTotalPurchasesRemaining(data) {
    const ttValue = parseFloat(data.ttValue) || 0;
    const maxMarkup = parseFloat(data.maxMarkup) || 0;
    const stashedPed = parseFloat(data.stashedPed) || 0;

    if (ttValue > 0 && maxMarkup > 0) {
        const totalPurchasesRemaining = Math.floor(stashedPed / (ttValue * (maxMarkup / 100)));
        return totalPurchasesRemaining >= 0 ? totalPurchasesRemaining : 0;
    }

    return 0;
}
// Function to calculate total stashed ped and total stashed item value

// Function to calculate total stashed ped and total stashed item value
function calculateTotals(allData) {
    let totalStashedPed = 0;
    let totalStashedItemValue = 0;

    allData.forEach(function (data) {
        const ttValue = parseFloat(data.ttValue) || 0;
        const maxMarkup = parseFloat(data.maxMarkup) || 0;
        const amountStashed = parseFloat(data.amountStashed) || 0;
		const stashedPed = parseFloat(data.stashedPed) || 0;

        totalStashedPed += stashedPed; // Accumulate stashed PED for each item

        totalStashedItemValue += ttValue * (maxMarkup / 100) * amountStashed;
    });

    console.log('Individual Stashed PED values:', allData.map(data => parseFloat(data.stashedPed) || 0));
    console.log('Total Stashed PED after accumulation:', totalStashedPed);

    return { totalStashedPed, totalStashedItemValue };
}
let allData = []; // Declare allData globally

// Function to load data from local storage
function loadsavedCachedata() {
    console.log("Loading saved weaponsCacheData");
    const savedKeys = getSavedKeys();
    // Prompt the user to choose a save file
    let userKey = prompt(`Choose a save file to load data:\n\nCurrent File Saves:\n${savedKeys.join("\n")}`);
    if (userKey !== null && userKey !== "") {
        const storedData = localStorage.getItem(`${userKey}_savedcache`);
        if (storedData) {
            allData = JSON.parse(storedData); // Update the global variable
            console.log("Loaded weaponsCacheData:", allData);
            const stashTable = document.getElementById("stashTable");
			// Remove all rows except the first one (headers)
			while (stashTable.rows.length > 1) {
				stashTable.deleteRow(1);
			}
            // Calculate totals
            const { totalStashedPed, totalStashedItemValue } = calculateTotals(allData);
            // Update total stashed ped value
            document.getElementById("stashpedtotalValue").innerText = totalStashedPed.toFixed(2);
            // Update total stashed item value
            document.getElementById("stasheditemtotalValue").innerText = totalStashedItemValue.toFixed(2);
            // Get the select element
            const selectElement = document.getElementById("Weaponscacheitemselect");
			const RestockselectElement = document.getElementById("Restockitemselect");
			const SellselectElement = document.getElementById("Sellitemselect");
            // Clear existing options in the select element
            selectElement.innerHTML = "";
            // Clear existing options in the select element
            RestockselectElement.innerHTML = "";
			SellselectElement.innerHTML = "";
            // Loop through all entries in the array
            allData.forEach(function (data, index) {
				// Create an object with both item name and index
				const optionValue = { name: data.item, index: index };

				// Create the option element
				const option = document.createElement("option");
				option.value = JSON.stringify(optionValue); // Convert the object to a string
				option.text = data.item;

				// Add the option to the select elements
				selectElement.add(option);
				RestockselectElement.add(option.cloneNode(true)); // clone the option for RestockselectElement
				SellselectElement.add(option.cloneNode(true)); // clone the option for SellselectElement
				localStorage.setItem("weaponsCacheData", JSON.stringify(allData));
				loadCacheDataFromLocalStorage(); 
            });
            console.log("Data loaded successfully from the key: ", userKey);
			// make the buttons visible after loading the cache data
			stashloadedButtonsEditStash.classList.add("stash-button-visible");
			stashloadedButtonsPurchaseLog.classList.add("stash-button-visible");
			stashloadedButtonsSalesLog.classList.add("stash-button-visible");
			stashloadedButtonsPriceLists.classList.add("stash-button-visible");
			// Enable the buttons after loading the cache data
			stashloadedButtonsEditStash.disabled = false;
			stashloadedButtonsPurchaseLog.disabled = false;
			stashloadedButtonsSalesLog.disabled = false;
			stashloadedButtonsPriceLists.disabled = false;
			    
			console.log("Purchase Log, Sales log, and Pricelist buttons enabled");
        } else {
            console.log("Invalid key or no data found.");
        }
    } else {
        console.log("Invalid key. Data not loaded.");
    }
}
//------------------------
// button event listener - Load Unique cache
document.getElementById("LoadUniquecache").addEventListener("click", loadsavedCachedata);
// Getting references to the buttons
const stashloadedButtonsEditStash = document.getElementById("editcachemenu-Button");
const stashloadedButtonsPurchaseLog = document.getElementById("logweaponpurchase-Button");
const stashloadedButtonsSalesLog = document.getElementById("sellitemsmenu-Button");
const stashloadedButtonsPriceLists = document.getElementById("pricelistmenu-Button");
// Initially disable the buttons
stashloadedButtonsEditStash.disabled = true;
stashloadedButtonsPurchaseLog.disabled = true;
stashloadedButtonsSalesLog.disabled = true;
stashloadedButtonsPriceLists.disabled = true;
// Initially add the class to hide the buttons
stashloadedButtonsEditStash.classList.add("stash-button");
stashloadedButtonsPurchaseLog.classList.add("stash-button");
stashloadedButtonsSalesLog.classList.add("stash-button");
stashloadedButtonsPriceLists.classList.add("stash-button");
//----------------------------

// Function to delete saved data based on the user's input
function deleteSavedCacheData() {
    console.log("Deleting saved cache data");
    const savedKeys = getSavedKeys();
    // Prompt the user to choose a save file for deletion
    let userKey = prompt(`Choose a save file to delete data:\n\nCurrent File Saves:\n${savedKeys.join("\n")}`);
    if (userKey !== null && userKey !== "") {
        if (savedKeys.includes(userKey)) {
            const deleteConfirm = confirm(`Are you sure you want to delete the data under the key '${userKey}'?`);
            if (deleteConfirm) {
                // Remove data from local storage
                localStorage.removeItem(`${userKey}_savedcache`);
                console.log(`Data under the key '${userKey}' deleted successfully.`);
            } else {
                console.log("Deletion canceled.");
            }
        } else {
            console.log("Invalid key. No data found for deletion.");
        }
    } else {
        console.log("Invalid key. Deletion canceled.");
    }
}

// button event listener - delete saved cache data
document.getElementById("DeleteUniquecache").addEventListener("click", deleteSavedCacheData);
// Function to clear weapons cache data from local storage
function clearWeaponsCacheData() {
    localStorage.removeItem("weaponsCacheData");
    console.log("Weapons cache data cleared.");
    // You can also perform any additional actions after clearing the data if needed
}
// button event listener -clear default Cache
document.getElementById("clearweaponsCache").addEventListener("click", function () {
    // Ask for confirmation with data displayed
    var confirmed = confirm("Are you sure you want to delete weapons cache data?");

    if (confirmed) {
        // If confirmed, proceed with clearing the weapons cache data
        clearWeaponsCacheData();
        // You can also update the UI or perform other actions after clearing the data
        alert("Weapons cache data cleared successfully.");
    } else {
        // If canceled, display a message
        alert("Operation canceled.");
    }
	// Function to log userExpenses to the console
function dataLog() {
	console.log('planetBalances returns as:', planetBalances);
	console.log('userExpenses returns as:', userExpenses);
		
}	

	  $(document).ready(function() {
		$('#stashTable, #WTStable, #WTBtable').DataTable();
	});


});
