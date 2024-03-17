
document.addEventListener("DOMContentLoaded", function () {
    const planetSelect = document.getElementById("planet");
    const categorySelect = document.getElementById("category");
    const subcategorySelect = document.getElementById("subcategory");
    const expenseSelect = document.getElementById("expense");
    const amountInput = document.getElementById("expenseamount");
    const ExpenseConfirmButton = document.getElementById("ExpenseConfirm");
    const expenseList = document.getElementById("expenseList");
    const balanceDisplay = document.getElementById("planet-balance");
    const balanceInput = document.getElementById("planet-balance-input");
    const addBalanceButton = document.getElementById("addBalanceButton");
    const ExpenseConfirm = document.getElementById("ExpenseConfirmed");
    const recentExpenses = document.getElementById("autoscroll-bottom");
    // Check if data has already been loaded

	// LOCALSTORAGE LOGIC
	let planetBalances = {
				"[SuS] Fund": 0,
				"Society": 0,
				"Sweat Crisis": 0,
				"Entropia Universe": 0,
				"Space": 0,
				"Crystal Palace": 0,
				"Foma Fortuna": 0,
				"Planet Calypso": 0,
				"Monria Moon": 0,
				"Planet Arkadia": 0,
				"Arkadia Moon": 0,
				"Rocktropia": 0,
				"The Hub": 0,
				"Toulan": 0,
				"Next Island": 0,
				"Cyrene": 0,
				// Add more planets as needed
	};

	let userExpenses = {}; // Initialize userExpenses with an empty object
	   console.log('planetBalances set to default values ', planetBalances);
	   console.log('userExpenses set to {}; ', userExpenses);




function refreshExpenseList() {
	console.log('Refreshing Expense List');
	expenseList.innerHTML = "";

	for (const planet in userExpenses) {
		for (const category in userExpenses[planet]) {
			for (const subcategory in userExpenses[planet][category]) {
				for (const expense in userExpenses[planet][category][subcategory]) {
					const amount = userExpenses[planet][category][subcategory][expense];

					const listItem = document.createElement("li");
					listItem.textContent = `${planet}- ${category}- ${subcategory}- ${expense}- ${amount} Ped`;
					expenseList.appendChild(listItem);
					recentExpenses.scrollTop = recentExpenses.scrollHeight;
				}
			}
		}
	}
}
    /* PED CURRENCY FORMATTING 
    ---------------------------*/
    // Add event listeners for formatting currency
    document.getElementById("pedamount").addEventListener("input", function () {
        formatCurrency(this);
    });
    document.getElementById("planet-balance-input").addEventListener("input", function () {
        formatCurrency(this);
    });
    document.getElementById("expenseamount").addEventListener("input", function () {
        formatCurrency(this);
    });

    function formatCurrency(input) {
        // Remove non-numeric characters
        let value = input.value.replace(/[^\d]+/g, '');

        // Check if backspace key is pressed
        if ((parseFloat(value) >= 0 || isNaN(parseFloat(value))) && event.inputType === 'deleteContentBackward') {

            input.value = ''; // Clear the input field
            event.preventDefault(); // Prevent default behavior
            return;
        }
        const wholePart = value.slice(0, -2);
        const decimalPart = value.slice(-2);

        let formattedValue = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        formattedValue += `.${decimalPart}`;

        formattedValue = formattedValue + " Ped";
        input.value = formattedValue;

        if (input.value === "") {

            input.style.color = "#757575";
        } else {
            input.style.color = "#14990d";
            input.style.fontWeight = "bold";
        }
    }

    function formatCurrencyForElement(element, value) {
        let cleanedValue = value.replace(/[^\d.-]+/g, '');
        const parts = cleanedValue.split('.');
        const wholePart = parts[0];
        const decimalPart = parts[1] || '';
        let formattedValue = wholePart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        if (decimalPart !== '') {
            formattedValue += `.${decimalPart}`;
        }
        element.textContent = formattedValue;
        if (cleanedValue === "" || cleanedValue === "-") {
            element.style.color = "#757575";
        } else if (parseFloat(cleanedValue) < 0) {
            element.style.color = "red";
            element.style.fontWeight = "bold";
        } else if (parseFloat(cleanedValue) === 0) {
            element.style.color = "#3f3e3e";
        } else {
            element.style.color = "#0dff00";
            element.style.fontWeight = "bold";
        }
    }

    function addHoverEffectToNumbers() {
        const numberElements = document.querySelectorAll('.numbers');

        numberElements.forEach((numberElement) => {
            numberElement.addEventListener('mouseenter', () => {
                const correspondingId = numberElement.id;
                const correspondingIdElement = document.getElementById(correspondingId);

                if (correspondingIdElement) {
                    correspondingIdElement.classList.add('hovered');
                }
            });

            numberElement.addEventListener('mouseleave', () => {
                const correspondingId = numberElement.id;
                const correspondingIdElement = document.getElementById(correspondingId);

                if (correspondingIdElement) {
                    correspondingIdElement.classList.remove('hovered');
                }
            });
        });
    }
    /* end of PED CURRENCY FORMATTING 
    ------------------------------------*/
	

    // Function to update styles based on the text content of #Value-Selected-Total
	function updateSelectedTotalStyles() {
		const selectedBudgetElement = document.getElementById('Value-Selected-Total');
		const selectedValue = parseFloat(selectedBudgetElement.textContent.trim()) || 0;

		// Reset styles before applying new ones
		selectedBudgetElement.style.color = "#757575";
		selectedBudgetElement.style.fontWeight = "normal";

		// Update styles based on the numerical value
		if (selectedValue === 0) {
			selectedBudgetElement.style.color = "#3f3e3e!important";
		} else if (selectedValue < 0) {
			selectedBudgetElement.style.color = "red";
			selectedBudgetElement.style.fontWeight = "bold";
		} else {
			selectedBudgetElement.style.color = "#0dff00";
			selectedBudgetElement.style.fontWeight = "bold";
		}
	}

    /* BALANCE UPDATING 
    ---------------------------*/
    function updateBalance(selectedPlanet) {
        if (planetBalances[selectedPlanet] !== undefined) {
            console.log(`Before Update - ${selectedPlanet}: ${planetBalances[selectedPlanet].toFixed(2)}`);
            balanceDisplay.textContent = `${planetBalances[selectedPlanet].toFixed(2)}`;
			
            console.log(`After Update - ${selectedPlanet}: ${planetBalances[selectedPlanet].toFixed(2)}`);
			// Set Label-Selectedtotal text content
			const labelSelectedTotal = document.getElementById('Label-Selectedtotal');
			labelSelectedTotal.textContent = selectedPlanet;

			// Set Value-Selected-Total text content
			const valueSelectedTotal = document.getElementById('Value-Selected-Total');
			valueSelectedTotal.textContent = `${planetBalances[selectedPlanet].toFixed(2)}`;
			console.log(`Label-Selectedtotal and Value-Selected-Total set to: ${selectedPlanet} ${planetBalances[selectedPlanet].toFixed(2)}`);
			const selectedValue = parseFloat(planetBalances[selectedPlanet]);
			if (selectedValue === 0) {
				valueSelectedTotal.style.color = "#3f3e3e";
			} else if (selectedValue < 0) {
				valueSelectedTotal.style.color = "red";
				valueSelectedTotal.style.fontWeight = "bold";
			} else {
				valueSelectedTotal.style.color = "#0dff00";
				valueSelectedTotal.style.fontWeight = "bold";
			}

        } else {
            console.error(`Selected planet (${selectedPlanet}) not found in planetBalances.`);
        }
    }

    function updatePlanetValues() {
        for (const planet in planetBalances) {
            const totalElement = document.getElementById(`${planet.replace(/\s+/g, '')}-Total`);
            if (totalElement) {
                formatCurrencyForElement(totalElement, planetBalances[planet].toFixed(2));
            }
        }
    }

    updatePlanetValues();

    planetSelect.addEventListener("change", function () {
        const selectedPlanet = planetSelect.value;
		
        updateBalance(selectedPlanet);
		
        // Update the text content of P with id #Label-Selectedtotal
       
    });

    updatePlanetValues();

    function updateUniversalTotal() {
        const sum = Object.values(planetBalances).reduce((total, balance) => total + balance, 0);
        const universalTotalElement = document.getElementById("UniversalTotal-total");
        formatCurrencyForElement(universalTotalElement, sum.toFixed(2));
    }

    updateUniversalTotal();

    /* BUTTONS 
    ---------------------------*/
	
	// Function to log userExpenses to the console
	function dataLog() {
		console.log('planetBalances returns as:', planetBalances);
		console.log('userExpenses returns as:', userExpenses);
		
	}
    // Button for logging data
    const dataLogButton = document.getElementById("datalog");
    dataLogButton.addEventListener("click", dataLog);
	
	

    function clearUserExpenses() {
        console.log('Removing from userExpenses:', userExpenses);
        localStorage.removeItem("userExpenses");
        userExpenses = {};
        console.log('userExpenses:', userExpenses());
        refreshExpenseList();
    }

    refreshExpenseList();
/*
--------------------------------------------------------
RESET BALANCES, CLEAR EXPENSE LIST & FACTORY RESET LOGIC
---------------------------------------------------------
*/
	// Button for resetting balances
	const resetBalancesButton = document.getElementById("resetbalances");

	resetBalancesButton.addEventListener("click", function () {
		resetPlanetBalances();
		updatePlanetValues();
		
		updateBalance();
		console.log(`ignore expected error above: selected planet not found`);
		updateUniversalTotal();
		console.log(` balances have been reset `);
	});

	// Function to reset all planet balances to 0 with confirmation
	function resetPlanetBalances() {
		// Ask for confirmation with data displayed
		var confirmed = confirm("Are you sure you want to reset all planet balances to 0?\n\nThis action cannot be undone.");

		if (confirmed) {
			// If confirmed, proceed with resetting the balances
			for (const planet in planetBalances) {
				planetBalances[planet] = 0;
			}
			updatePlanetValues();
			updateUniversalTotal();
			alert("Planet balances have been reset successfully.");
		} else {
			// If canceled, display a message
			alert("Operation canceled. Your planet balances remain unchanged.");
		}
	}

    const clearExpensesButton = document.getElementById("clearExpenses");
    clearExpensesButton.addEventListener("click", function () {
		console.log('current onclick:', userExpenses);
        // Ask for confirmation with data displayed
        var confirmed = confirm("Are you sure you want to clear the expenses?\n\nData to be cleared: All Expense data\n\n balances will remain as they are 🤓 ");

        if (confirmed) {
            // If confirmed, proceed with clearing the budget
			userExpenses = {};
			refreshExpenseList();
            alert("Expenses cleared successfully.");
			console.log(' after click:', userExpenses);
        } else {
            // If canceled, display a message
            alert("Operation canceled.  Have a nice day.");
        }
    });

    // Function to add balance
    function addBalance() {
        const selectedPlanet = planetSelect.value;
        const newBalanceInput = balanceInput.value.replace(/,/g, ''); // Remove commas
        const newBalance = parseFloat(newBalanceInput);

        if (!isNaN(newBalance)) {
            if (planetBalances[selectedPlanet] !== undefined) {
                console.log(`Before Addition - ${selectedPlanet}: ${planetBalances[selectedPlanet].toFixed(2)}`);
                planetBalances[selectedPlanet] += newBalance;
                balanceInput.value = ""; // Clear the input
                updateBalance(selectedPlanet);
                updatePlanetValues();
                updateUniversalTotal();
                console.log(`After Addition - ${selectedPlanet}: ${planetBalances[selectedPlanet].toFixed(2)}`);
            } else {
                console.error(`Selected planet (${selectedPlanet}) not found in planetBalances.`);
            }
        } else {
            console.error('Invalid newBalance:', newBalance);
        }
    }

    // Event listener for adding balance button
    addBalanceButton.addEventListener("click", function (event) {
        event.preventDefault(); // Prevent default button click behavior
        addBalance();
    });

    const yourForm = document.querySelector('#pedcardform'); // Replace 'yourForm' with the actual ID of your form
    // Event listener for form submission
    yourForm.addEventListener('submit', function (event) {
        event.preventDefault(); // Prevent default form submission behavior
        // Deselect or blur the input field
        document.activeElement.blur();
    });

ExpenseConfirm.addEventListener("click", function () {
    const planet = planetSelect.value;
    const category = categorySelect.value;
    const subcategory = subcategorySelect.value;
    const selectedOption = expenseSelect.value;
    const customExpenseInput = document.getElementById("customExpense");
    const expense = selectedOption === "Other" ? customExpenseInput.value : selectedOption;

    // Remove commas from the amountInput.value
    const amountInputValue = amountInput.value.replace(/,/g, '');
    const amount = parseFloat(amountInputValue);

    const selectedPlanet = planetSelect.value;
    const tamount = parseFloat(amountInputValue); // Use the corrected amountInputValue here

    if (selectedOption === "Other" && expense === "") {
        alert("Please enter a custom expense.");
        return;
    }

    event.preventDefault();

    if (!isNaN(tamount)) {
        planetBalances[selectedPlanet] -= tamount;
        amountInput.value = "";
        updateBalance(selectedPlanet);
        updatePlanetValues();
        updateUniversalTotal();
    }

    // Get the current date and format it as YYYY-MM-DD
    const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' });

    // Update userExpenses with the expense details
    userExpenses[planet] = userExpenses[planet] || {};
    userExpenses[planet][category] = userExpenses[planet][category] || {};
    userExpenses[planet][category][subcategory] = userExpenses[planet][category][subcategory] || {};
    userExpenses[planet][category][subcategory][expense] = {
        amount: amount.toFixed(2),
        date: currentDate,
    };

    const listItem = document.createElement("li");
    listItem.textContent = `[${currentDate}] [${planet}-${category}] ➤ [${subcategory}] ➜ [${expense}] - ${amount.toFixed(2)} PED`;
    expenseList.appendChild(listItem);
    /* updateUserBudget(planet, category, subcategory, expense, amount); */

    if (selectedOption === "Other") {
        customExpenseInput.value = "";
    }
});

    // Assuming there is a variable to track the visibility state
    let expenseListVisible = false;

    // Add an event listener for the "displayexpenselist" button
    const displayExpenseListButton = document.getElementById("displayexpenselist");
    displayExpenseListButton.addEventListener("click", function () {
        // Toggle visibility state
        expenseListVisible = !expenseListVisible;

        // Call the toggleExpenseList function
        toggleExpenseList();
    });

    function toggleExpenseList() {
        // Access the div element
		clickedButton = document.getElementById("displayexpenselist");
        const budgetDisplayDiv = document.getElementById("BudgetdisplayTest");
        const budgetAccordianPanel = document.getElementById("BudgetAccordianpanel");
        // Check if the expense list is visible
        if (expenseListVisible) {
            // Call the refreshExpenseList function to display expenses from userBudget
            refreshExpenseList();
            // Toggle the visibility of BudgetAccordianpanel
            budgetAccordianPanel.style.display = (expenseListVisible) ? 'block' : 'none';
            // Create an unordered list to represent the userBudget data for display
            const ulElement = document.createElement("ul");

            function formatAccordion(userExpenses, parentElement) {
                for (const key in userExpenses) {
                    const liElement = document.createElement("li");
                    liElement.textContent = key;
                    parentElement.appendChild(liElement);

                    if (typeof userExpenses[key] === 'object') {
                        const nestedUlElement = document.createElement("ul");
                        liElement.appendChild(nestedUlElement);
                        formatAccordion(userExpenses[key], nestedUlElement);
                    } else {
                        const valueLiElement = document.createElement("li");
                        valueLiElement.textContent = userExpenses[key];
                        liElement.appendChild(valueLiElement);
                    }
                }
            }

            formatAccordion(userExpenses, ulElement);

            // Clear existing content and append the new ulElement to the div
            budgetDisplayDiv.innerHTML = "";
            budgetDisplayDiv.appendChild(ulElement);

			togglesingleroundButtonStyle(clickedButton)
        } else {
            // If the expense list is not visible, hide it
            budgetAccordianPanel.style.display = (expenseListVisible) ? 'block' : 'none';
            budgetDisplayDiv.innerHTML = "";
			togglesingleroundButtonStyle(clickedButton)
        }
    }
	
	
	
	

	
	

	/* Assuming userExpenses is defined globally */
function getSavedKeys() {
    const savedKeys = Object.keys(localStorage).filter((key) => key.endsWith("_planetBalances"));
    return savedKeys.map((key) => key.replace("_planetBalances", ""));
}

// Function to load data from local storage based on the provided key
function loadDataFromLocalStorage(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
}
// Function to save data to local storage with a custom key
function saveDataToLocalStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Function to prompt the user for a key and save userExpenses and planetBalances
document.getElementById("Savebutton").addEventListener("click", function () {
	const savedKeys = getSavedKeys();
    // Prompt the user for a key
    const saveKey = prompt(`Choose a save file or create a new save file to save your data:\n\nCurrent File Saves:\n${savedKeys.join("\n")}`);

    if (saveKey) {
        // Save planetBalances and userExpenses with the specified key
        const saveplanetBalances = { ...planetBalances }; // Clone the object to avoid reference issues
        const saveuserExpenses = { ...userExpenses }; // Clone the object to avoid reference issue

        saveDataToLocalStorage(`${saveKey}_planetBalances`, saveplanetBalances);
        saveDataToLocalStorage(`${saveKey}_userExpenses`, saveuserExpenses);
        alert(`Data saved successfully under the key: ${saveKey}`);
    } else {
        // Inform the user if they canceled the prompt
        alert("Operation canceled.");
    }
});


// Function to load data based on the selected key from the dropdown menu
document.getElementById("Loadbutton").addEventListener("click", function () {
    // Get a list of saved keys
    const savedKeys = getSavedKeys();

    if (savedKeys.length === 0) {
        // Inform the user if there are no saved keys
        alert("No saved data found.");
        return;
    }

    // Prompt the user to choose a key from the list
	const loadKey = prompt(`Choose a save file to load your data:\n\n File Saves:\n ${savedKeys.join("\n ")}`, savedKeys[0]);

    if (loadKey && savedKeys.includes(loadKey)) {
        // Load the corresponding data based on the selected key
        const loadedPlanetBalances = loadDataFromLocalStorage(`${loadKey}_planetBalances`);
        const loadedUserExpenses = loadDataFromLocalStorage(`${loadKey}_userExpenses`);

        // Update the global variables with the loaded data
        planetBalances = loadedPlanetBalances || planetBalances;
        userExpenses = loadedUserExpenses || userExpenses;

        // Update UI elements
        updatePlanetValues();
        updateUniversalTotal();
        // Provide feedback to the user
        alert(`Data loaded successfully from the key: ${loadKey}`);
    } else {
        // Inform the user if they canceled the prompt or entered an invalid key
        alert("Operation canceled or invalid key entered.");
    }
});

// Assuming you have a function to get saved keys
function getSavedKeys() {
    const savedKeys = Object.keys(localStorage).filter((key) => key.endsWith("_planetBalances"));
    return savedKeys.map((key) => key.replace("_planetBalances", ""));
}

// Assuming you have a function to delete data from local storage based on the provided key
function deleteDataFromLocalStorage(key) {
    localStorage.removeItem(`${key}_planetBalances`);
    localStorage.removeItem(`${key}_userExpenses`);
}

// Assuming you have the delete button with id "deletefilebutton"
const deleteFileButton = document.getElementById("deletefilebutton");

// Add an event listener to handle the deletion of saved files
deleteFileButton.addEventListener("click", function () {
    // Get a list of saved keys
    const savedKeys = getSavedKeys();

    if (savedKeys.length === 0) {
        // Inform the user if there are no saved files to delete
        alert("No saved files found.");
        return;
    }

    // Prompt the user to choose a file to delete
    const fileToDelete = prompt(`Choose a file to delete:\n\nSaved Files:\n${savedKeys.join("\n")}`);

    if (fileToDelete && savedKeys.includes(fileToDelete)) {
        // Delete the corresponding data based on the selected file
        deleteDataFromLocalStorage(fileToDelete);

        // Provide feedback to the user
        alert(`File "${fileToDelete}" deleted successfully.`);
    } else {
        // Inform the user if they canceled the prompt or entered an invalid file name
        alert("Operation canceled or invalid file name entered.");
    }
});

});
