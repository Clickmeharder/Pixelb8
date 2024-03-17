
/* logMessage("Gridtest Script has loaded."); */

// Rest of your JavaScript code...



// create a simple version and an advanced version, 
// simple version would simply be the planets, the categories, and a custom input fied or maybe subcategories and a cusotm field



	//this would be the advanced advanced:
	document.addEventListener("DOMContentLoaded", function () {
		/* logMessage("Gridtest Script Initialized."); */
		const planetSelect = document.getElementById("planet");
		const categorySelect = document.getElementById("category");
		const subcategorySelect = document.getElementById("subcategory");
		const expenseSelect = document.getElementById("expense");
		const amountInput = document.getElementById("amount");
		const ExpenseConfirmButton = document.getElementById("ExpenseConfirm");
		const expenseList = document.getElementById("expenseList");
		const balanceDisplay = document.getElementById("planet-balance");
		const balanceInput = document.getElementById("planet-balance-input");
		const addBalanceButton = document.getElementById("addBalanceButton");
		const planets = ["Entropia Universe", "Space", "Crystal Palace", "Foma Fortuna", "Planet Calypso", "Monria Moon", "Planet Arkadia", "Arkadia Moon", "Rocktropia", "Cyrene", "The Hub", "Toulan", "Next Island"];
		const categories = ["Category", "Totals", "Hunting", "Mining", "Deforestation", "Crafting", "Trading", "Sweat Crisis", "Private Contracts", "Investments", "Event Hosting", "Society", "Other"];
		const subcategories = {
			"Category": ["Subcategory"],
			"Totals": ["Subcategory","Hunting", "Mining", "Deforestation", "Crafting", "Trading", "Sweat Crisis", "Private Contracts", "Investments", "Event Hosting", "Society", "Other"],
			"Hunting": ["Mobs", "Misc", "Ammunitions", "Weaponry", "Attachments", "Enhancers", "Repairs", "Decoys", "Healing"],
			"Mining": ["Probes", "Tools", "Attachments", "Repairs"],
			"Deforestation": ["Tools", "Repairs"],
			"Crafting": ["Refining", "Resources", "Textures", "Enhancers", "Blueprints"],
			"Trading": ["Space/Travel", "Repair Supplies", "Resources", "Weapons", "Tools", "Attachments", "Ammunition", "Furniture", "Pets"],
			"Sweat Crisis": ["Sweat Purchases", "Swunting", "Sweat Events"],
			"Private Contracts": ["Item Smuggling", "Manufacturing", "Hunting Loot", "Mining", "Beauty", "Taxi", "Healer", "Other"],
			"Investments": ["Deeds", "Real Estate", "Tokens", "Other"],
			
			
			"Event Hosting": ["Event Type", "Event Type", "Event Type", "Other"],
			
			
			"Society": ["Society Activities", "Rewards", "Weapons Cache", "Dues", "Other"],
			"Other": ["Transportation", "Ammunitions", "Weaponry", "Attachments", "Enhancers", "Healing", "Repairs", "Decoys", "Upgrades", "Other"],
			// Define subcategories for other categories here
		};
		
		// Get the "Planet" dropdown element
		// Iterate through the "planets" array and create options
		planets.forEach((planet) => {
			const option = document.createElement("option");
			option.value = planet;
			option.textContent = planet;
			planetSelect.appendChild(option);
		/* 	console.log(`Created planet options`); // Log the planet option creation */
		});

		// Iterate through the "categories" array and create options
		categories.forEach((category) => {
			const option = document.createElement("option");
			option.value = category;
			option.textContent = category;
			categorySelect.appendChild(option);
			/* console.log(`Created category options`); // Log the category option creation */
		});

		// Function to populate subcategory options based on category selection
		function populateSubcategoryOptions() {
			const category = categorySelect.value;
			const subcategoriesForCategory = subcategories[category] || [];

			// Clear previous options
			subcategorySelect.innerHTML = "";
		/* 	logMessage("Cleared previous subcategory options"); // Log clearing of previous options */

			// Create and add new options
			subcategoriesForCategory.forEach((subcategory) => {
				const option = document.createElement("option");
				option.value = subcategory;
				option.textContent = subcategory;
				subcategorySelect.appendChild(option);
			/* 	console.log(`Created subcategory option: ${subcategory}`); // Log the subcategory option creation */
			});
		}


		// Event listener to trigger subcategory population on category selection
		categorySelect.addEventListener("change", () => {
			/* logMessage(`Category selection changed to: ${categorySelect.value}`); */
			populateSubcategoryOptions();
		});

		// Create an object to store expenses
		const expenses = {
			"Category-Subcategory": ["Expense"],
			"Totals": ["Subcategory","Hunting", "Mining", "Deforestation", "Crafting", "Trading", "Sweat Crisis", "Private Contracts", "Investments", "Event Hosting", "Society", "Other"],
		   //-------------------------------------------------------------------------------------------------------------------
	//HUNTING FINISHED
			
			"Hunting-Mobs": ["puny", "low-mid level", "mid level", "mid-high level", "high level"],
			"Hunting-Misc": ["instances", "Dailies", "Mission Chains", "Dynamic events", "Mayhem"],
			"Hunting-Ammunitions": ["Universal Ammo", "Shrapnel", "Weapon Cells", "Blp Ammo", "Explosive Projectiles", "Low-grade Ammo", "High-grade Ammo", "Mind Essense", "Synthetic Mine Essense"],
			"Hunting-Weaponry": ["Limited Weapons", "Unlimited Weapons"],
			"Hunting-Attachments": ["Attachments List", "Attachments Expense2", "Attachments Expense3"],
			"Hunting-Enhancers": ["Enhancer list?", "Enhancer Expense2", "Enhancer Expense3"],
			"Hunting-Repairs": ["Repair Expense1", "Repair Expense2", "Repair Expense3"],
			"Hunting-Decoys": ["Tools", "Decoys"],
			"Hunting-Healing": ["Tools", "Mindforce"],

	//--------------------------------------------------------------------------------------------------------	
	//MINING 
	//FIN			"Mining": ["Probes", "Tools", "Attachments", "Repairs", "Refining"],

			"Mining-Probes": ["Weapon Expense1", "Weapon Expense2", "Weapon Expense3"],
			"Mining-Tools": ["Ammo Expense1", "Ammo Expense2", " Ammo Expense3"],	
			"Mining-Attachments": ["Attachments Expense1", "Attachments Expense2", "Attachments Expense3"],
			"Mining-Repairs": ["Enhancer Expense1", "Enhancer Expense2", "Enhancer Expense3"],
			"mining-refining": ["Enmatter", "Ores/Minerals", "Treasure", "Misc"],
	//--------------------------------------------------------------------------------------------------------
	//DEFORESTATION
	//		"Deforestation": ["Tools", "Repairs"],
	//Fin
			"Deforestation-Tools": ["Logging Tool List", "Refining"],
			"Deforestation-Repairs": ["Tool Repair"],
	//--------------------------------------------------------------------------------------------------------
	//CRAFTING fin
	//"Crafting": ["Refining, "Resources", "Textures", "Enhancers", "Blueprints"],

			"Crafting-Refining": ["Enmatter", "Ores/Stones", "Treasure", "Refined Goods list", "Misc"],
			"Crafting-Resources": ["Enmatter List", "Ore/mineral List", "Treasure List", "Componants list", "Nanucubes"],
			"Crafting-Textures": ["Hides", "Stones", "Textures"],
			"Crafting-Enhancers": ["Enhancer List"],
			"Crafting-Blueprints": ["Weapon Crafting", "Armour Crafting", "Tool Crafting", "Vehicle", "Tool", "Furniture"],
	//--------------------------------------------------------------------------------------------------------
	//TRADING fin
	//
			"Trading-Space/Travel": ["Fuel", "Repairs", "Warp fees", "Vehicles", "Vehicle Attachments"],
			"Trading-Repair Supplies": ["Welding Tool", "Welding wire", "Wire Materials"],
			"Trading-Resources": ["Enmatter List", "Ore/mineral List", "Treasure List", "Componants list", "Nanucubes"],
			"Trading-Weapons": ["Limited Weapons", "Unlimited Weapons", "Misc"],
			"Trading-Tools": ["Misc"],
			"Trading-Attachments": ["Scopes", "Amps", "Sights", "Enhancers", "armour things"],
			"Trading-Ammunition": ["Shrapnel", "Weapon Cells", "BLP Ammo", "Explosive Projectiles", "Low-Grade Ammo", "High Grade Ammo", "Mind essense", "Synthetic M.E"],
			"Trading-Furniture": ["Furniture", "Decor", "Storage"],
			"Trading-Pets": ["Pets", "Animal Essence", "Nutrio Supplies", "Nutrio", "Tools"],
	//--------------------------------------------------------------------------------------------------------
	//Sweating
	//"Sweat Crisis": ["Sweat Purchases", "Swunting", "Sweat Events"],	
			"Sweat Crisis-Sweat Purchases": ["1k", "2k", "5k", "10k", "20k"],
			"Sweat Crisis-Swunting": ["Ammo", "repairs"],
			"Sweat Crisis-Sweat Events": ["Event types1", "Event types2", "Event types3"],
	//--------------------------------------------------------------------------------------------------------
	//Private Contracts
	//"Private Contracts": ["Item Smuggling", "Manufacturing", "Hunting Loot", "Mining", "Beauty", "Taxi", "Healer", "Other"],

			"Private Contracts-Item Smuggling": ["Transport Expense1", "misc"],
			"Private Contracts-Manufacturing": ["Weapons", "Tools", "Ammo", "misc"],
			"Private Contracts-Hunting Loot": ["Misc"],
			"Private Contracts-Mining": ["Enmatter", "Ores/Minerals", "Treasure"],
			"Private Contracts-Beauty": ["Body", "Hair", "Makeup", "Clothing", "Coloring", "Texturizing"],
			"Private Contracts-Taxi": ["Planet Side", "Galactic Uber", "Repairs", "Thruster", "Fuel"],
			"Private Contracts-Healer": ["Decay", "Tips"],
			"Private Contracts-Other": ["Uncategorized"],
	//--------------------------------------------------------------------------------------------------------
	//Investments
	//"Investments": ["Deeds", "Real Estate", "Tokens", "Other"],

			"Investments-Deeds": ["CLD", "NTI", "CP", "Ancient Greece", "AUD", "Ark Moon"],
			"Investments-Real Estate": ["Real estate", "Shops", "Land", "MotherShip"],
			"Investments-Tokens": ["Token List"],
			"Investments-Other": ["Rares", "Collectible/Discontinued"],	
	//--------------------------------------------------------------------------------------------------------
	//EVENT HOSTING
	//"Event Hosting": ["Event Type", "Event Type", "Event Type", "Other"],

			"Event Hosting-Event Type": ["Fees", "Prizes", "Reserved Tickets"],
			"Event Hosting-Event Type": ["Fees", "Prizes", "Reserved Tickets"],
			"Event Hosting-Event Type": ["Fees", "Prizes", "Reserved Tickets"],
			"Event Hosting-Other": ["Fees", "Prizes", "Reserved Tickets"],
	//--------------------------------------------------------------------------------------------------------
	//SOCIETY
	//Society": ["Society Activities", "Rewards", "Weapons Cache", "Dues", "Other"],

			"Society-Society Activies": ["Team Hunt", "Event"],
			"Society-Rewards": ["Recruiting", "Awards"],
			"Society-Weapons Cache": ["(L) Weapons", "(UL) Weapons", "Ammunition"],
			"Society-Dues": ["Society Donation", "Society Fees", "Ped Pool"],
			"Society-Other": ["Misc"],
	//--------------------------------------------------------------------------------------------------------
	//OTHER
	//"Other": ["Transportation", "Ammunitions", "Weaponry", "Attachments", "Enhancers", "Healing", "Repairs", "Decoys", "Upgrades", "Other"],

			"Other-Transportation": ["Fuel", "Vehicles", "Chips", "Synthetic M.E."],
			"Other-Ammunitions": [" "],
			"Other-Weaponry": [" "],
			"Other-Attachments": [" "],
			"Other-Enhancers": [" "],
			"Other-Healing": [" "],
			"Other-Repairs": ["Vehicle", "Weapons", "Tools", "Armour", "Armour things", "Attachments", "MS Repair runs"],
			"Other-Upgrades": [" "],
			"Other-Other": [" "],
		  // Add more categories and subcategories as needed
		};

		// Function to populate expense options based on selected category and subcategory
		function populateExpenseOptions() {
			const category = categorySelect.value;
			const subcategory = subcategorySelect.value;
			const key = `${category}-${subcategory}`;
			const expenseOptions = expenses[key] || [];

			// Clear previous options
			expenseSelect.innerHTML = "";
			/* logMessage("Cleared previous expense options"); // Log clearing of previous options */

			// Populate expense options
			expenseOptions.forEach((expense) => {
				const option = document.createElement("option");
				option.value = expense;
				option.textContent = expense;
				expenseSelect.appendChild(option);
				console.log(`Created expense option: ${expense}`); // Log the expense option creation
			});

			// Add an "Other" option to the dropdown
			const otherOption = document.createElement("option");
			otherOption.value = "Other";
			otherOption.textContent = "Other";
			expenseSelect.appendChild(otherOption);
			/* logMessage("Added 'Other' option"); // Log adding the 'Other' option */
		}

		// Event listener to populate expenses when category or subcategory changes
		categorySelect.addEventListener("change", () => {
			console.log(`Category selection changed to: ${categorySelect.value}`);
			populateExpenseOptions();
		});
		subcategorySelect.addEventListener("change", () => {
			/* logMessage(`Subcategory selection changed to: ${subcategorySelect.value}`); */
			populateExpenseOptions();
		});

		// Event listener to show/hide custom expense input field
		expenseSelect.addEventListener("change", () => {
			const selectedOption = expenseSelect.value;
			const customExpenseInput = document.getElementById("customExpense");

			if (selectedOption === "Other") {
				customExpenseInput.style.background = "white"; // Reset background color
				customExpenseInput.style.color = "black"; // Set a grayed-out text color
				customExpenseInput.disabled = false; // Enable the input field
				console.log("Enabled custom expense input field"); // Log enabling the input field
			} else {
				customExpenseInput.style.background = "rgb(39 46 55)"; // Set a grayed-out background color
				customExpenseInput.style.color = "rgb(39 46 55)"; // Set a grayed-out text color
				customExpenseInput.disabled = true; // Disable the input field
				console.log("Disabled custom expense input field"); // Log disabling the input field
			}
		});
	});
