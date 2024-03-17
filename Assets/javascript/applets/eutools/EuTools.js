/* 
input list: 

#Input-eventduration
#Input-eventprizevalue
#Input-eventreservations

#Input-maxintendedeventprofit  
#Input-Intendedparticipantcount 

#Input-eventTicketssold

#Value-eventcostTotal -> formula =  5 + ( #Input-eventduration value * 5 ) + #Input-eventprizevalue value + #Input-eventreservations value
#Value-eventarearentfees -> formula =  (( value of #Input-eventduration * 5) + 5) / value of #Input-Intendedparticipantcount
#Value-fairprizetax -> formula =  value of #Input-eventprizevalue / value of #Input-Intendedparticipantcount
#Value-hostprofittax -> formula  = value of #Input-maxintendedeventprofit / value of #Input-Intendedparticipantcount
#Value-breakeveneventTicketprice -> formula  =  value of #Value-eventcostTotal / value of #Input-Intendedparticipantcount
#Value-profitableeventTicketprice -> formula  = Sum of #Value-eventarearentfees, #Value-fairprizetax and #Value-hostprofittax 
#Value-finaleventProfitloss -> formula = value of #Value-eventcostTotal +  ( value of #Input-eventTicketssold * value of #Value-profitableeventTicketprice) */

function waypointEventAreaMarker() {
    // Get the p element by its ID
    var eventAreaCoordsElement = document.getElementById('Value-eventAreamarkercoords');

    // Get the text content of the p element
    var coordsText = eventAreaCoordsElement.textContent;

    // Add "/wp " in front of the text
    var waypointText = '/wp ' + coordsText;

    // Create a temporary textarea element to copy the text to the clipboard
    var tempTextarea = document.createElement('textarea');
    tempTextarea.value = waypointText;

    // Append the textarea to the document
    document.body.appendChild(tempTextarea);

    // Select the text in the textarea
    tempTextarea.select();
    tempTextarea.setSelectionRange(0, 99999); /* For mobile devices */

    // Copy the selected text to the clipboard
    document.execCommand('copy');

    // Remove the temporary textarea from the document
    document.body.removeChild(tempTextarea);

    // Optionally, you can provide some visual feedback to the user
    alert('Event Area Marker Waypoint copied to clipboard: ' + waypointText);
}



function populateEventhostingPlanetOptions() {
    var planetSelect = document.getElementById("eventhosting-selectplanet");

    var planetOptions = [
        { value: "arkadia", text: "Planet Arkadia" },
        { value: "global_instances", text: "Global Instances", disabled: true },
        { value: "ancient_greece", text: "Ancient Greece" },
        { value: "arkadia_moon", text: "Arkadia Moon", disabled: true },
        { value: "arkadia_underground", text: "Arkadia Underground", disabled: true },
        { value: "asteroid", text: "Asteroid" },
        { value: "calypso", text: "Calypso" },
        { value: "crystal_palace", text: "Crystal Palace" },
        { value: "hell", text: "Hell" },
        { value: "hunt_the_thing", text: "Hunt The Thing" },
        { value: "monria", text: "Monria" },
        { value: "next_island", text: "Next Island" },
        { value: "planet_cyrene", text: "Planet Cyrene" },
        { value: "planet_toulan", text: "Planet Toulan" },
        { value: "rocktropia", text: "Rocktropia" },
        { value: "secret_island", text: "Secret Island" }
    ];

    // Add options to the select element
    planetOptions.forEach(function(option) {
        var optionElement = document.createElement("option");
        optionElement.value = option.value;
        optionElement.text = option.text;
        if (option.disabled) {
            optionElement.disabled = true;
        }
        planetSelect.appendChild(optionElement);
    });
}

// Call the function to populate eventhosting planet options
populateEventhostingPlanetOptions();


function populateEventAreas() {
    var planetSelect = document.getElementById("eventhosting-selectplanet");
    var eventAreaSelect = document.getElementById("eventhosting-selecteventarea");
    var selectedPlanet = planetSelect.options[planetSelect.selectedIndex].value;

    // Clear existing options
    eventAreaSelect.innerHTML = '';

    // Function to add options to the select element
    function addOptionsToSelect(optionsArray) {
        optionsArray.forEach(function(option) {
            var optionElement = document.createElement("option");
            optionElement.value = option;
            optionElement.text = option;
            eventAreaSelect.appendChild(optionElement);
        });
    }

    // Function to add a disabled option to the select element
    function addDisabledOption(text) {
        var disabledOption = document.createElement("option");
        disabledOption.value = "no_event_areas";
        disabledOption.text = text;
        disabledOption.disabled = true;

        // Check if the disabled option already exists before appending
        if (!eventAreaSelect.querySelector('option[value="no_event_areas"]')) {
            eventAreaSelect.add(disabledOption);
        }
    }

    // Populate event areas based on the selected planet
    switch (selectedPlanet) {
        case "arkadia":
            var arkadiaOptions = [
				"Select Event Area",
                "Mutation Station",
                "Aakas Island",
                "Arkadia Event Area 1",
                "Arkadia Event Area 2",
                "Arkadia Event Area 3",
                "Arkadia Event Area 4",
                "BIG Industries ALA#05",
                "Cyclone Point",
                "IFN Commando Training Grounds",
                "Khorum Coast",
                "Lighting CoastSanctuary Bay",
                "Sancutary Shores",
                "Sentosa's Reach",
                "Songkra Valley",
                "Storms Keep",
                "Thunder Hills",
                "Thunder Ridge"
            ];
            addOptionsToSelect(arkadiaOptions);
            break;

        case "arkadia_moon":
			addDisabledOption("Select Event Area");
            // Add disabled option for Arkadia Moon
            addDisabledOption("No Event Areas");
            break;

        case "arkadia_underground":
			addDisabledOption("Select Event Area");
            // Add disabled option for Arkadia Underground
            addDisabledOption("No Event Areas");
            break;

        case "asteroid":
            var asteroidOptions = [
				"Select Event Area",
                "Asteroid Shop Area",
                "FOMA Main Arena",
                "FOMA RaceTrack",
                "Biodome #1",
                "Biodome #2",
                "Biodome #3",
                "Biodome #4",
                "Biodome #5",
                "Biodome #6",
                "Biodome #7",
                "Biodome #8",
                "Biodome #9",
                "Biodome #10",
                "Biodome #11",
                "Biodome #12",
                "Biodome #13",
                "Biodome #14",
                "Biodome #15",
                "Biodome #16",
                "Biodome #17",
                "Biodome #18",
                "Biodome #19",
                "Biodome #20"
            ];
            addOptionsToSelect(asteroidOptions);
            break;

        case "calypso":
            var calypsoOptions = [
				"Select Event Area",
                "Apophis Island",
                "Ayida Island",
                "Akmuul SouthWest OLA39",
                "Bakunawa Island",
                "Deino Island",
                "Eldorado",
                "Emerald Lakes Mall Land",
                "Enyo Island",
                "Event Area",
                "Fortress Invincible",
                "ILLAWARRA 73 - OLA#29",
                "Medusa Bazaar",
                "Naga Island Ouroboros Island",
                "Port Atlantis MallThe Land of Oz",
                "Twin Peaks Mall",
                "That Freeking Cold Place",
                "Amethera LA1",
                "Amethera LA3",
                "Amethera LA5",
                "Amethera LA6",
                "Amethera LA7",
                "Amethera LA10",
                "Amethera LA11",
                "Amethera LA13",
                "Amethera LA17",
                "Amethera LA18",
                "Amethera LA19",
                "Amethera Outback Land #1",
                "Amethera Outback Land #2",
                "Amethera Outback Land #3",
                addDisabledOption("Amethera Outback Land #4"),
                "Amethera Outback Land #5",
                "Amethera Outback Land #6",
                "Amethera Outback Land #7",
                "Amethera Outback Land #8",
                "Amethera Outback Land #9",
                "Amethera Outback Land #10",
                "Amethera Outback Land #11",
                "Amethera Outback Land #12",
                "Amethera Outback Land #13",
                "Amethera Outback Land #14",
                "Amethera Outback Land #15",
                "Amethera Outback Land #16",
                "Amethera Outback Land #17",
                "Amethera Outback Land #18",
                addDisabledOption("Amethera Outback Land #19"),
                "Amethera Outback Land #20",
                "Amethera Outback Land #21",
                "Amethera Outback Land #22",
                "Amethera Outback Land #23",
                "Amethera Outback Land #24",
                "Amethera Outback Land #25",
                "Amethera Outback Land #26",
                "Amethera Outback Land #27",
                "Amethera Outback Land #28",
                addDisabledOption("Amethera Outback Land #29"),
                "Amethera Outback Land #30",
                "Amethera Outback Land #31",
                "Amethera Outback Land #31",
                "Amethera Outback Land #33",
                "Amethera Outback Land #34",
                "Amethera Outback Land #35",
                "Amethera Outback Land #36",
                "Amethera Outback Land #37",
                "Amethera Outback Land #38",
                addDisabledOption("Amethera Outback Land #39"),
                "Amethera Outback Land #40",
                "Amethera Outback Land #41 East",
                "Amethera Outback Land #41 North",
                "Amethera Outback Land #41 West",
                addDisabledOption("Amethera Outback Land #42"),
                "Amethera Outback Land #43",
                "Amethera Outback Land #44",
                addDisabledOption("Amethera Outback Land #45"),
                "Amethera Outback Land #46",
                "Amethera Outback Land #47",
                addDisabledOption("Amethera Outback Land #48"),
                addDisabledOption("Amethera Outback Land #49"),
                addDisabledOption("Amethera Outback Land #50"),
                "Amethera Outback Land #51",
                "Amethera Outback Land #52",
                "Amethera Outback Land #53",
                "Amethera Outback Land #54",
                "Amethera Outback Land #55",
                "Amethera Outback Land #56",
                "Amethera Outback Land #57",
                "Amethera Outback Land #58",
                "Amethera Outback Land #59",
                "Amethera Outback Land #60",
                "Amethera Outback Land #61",
                "Amethera Outback Land #62",
                "Amethera Outback Land #63",
                "Amethera Outback Land #64",
                "Amethera Outback Land #65",
                "Amethera Outback Land #66"
            ];
            addOptionsToSelect(calypsoOptions);
            break;

        case "crystal_palace":
            var crystalPalaceOptions = [
				"Select Event Area",
                "CP Shopping Booth Area",
                "Crystal Palace Dome 1",
                "Crystal Palace Dome 2",
                "Crystal Palace Dome 3",
                "Crystal Palace Dome 4"
            ];
            addOptionsToSelect(crystalPalaceOptions);
            break;

        case "planet_cyrene":
            var cyreneOptions = [
				"Select Event Area",
                "Event Area",
                "Event Area",
                "NGU Volcano Land Area"
            ];
            addOptionsToSelect(cyreneOptions);
            break;

        case "planet_toulan":
            var toulanOptions = [
				"Select Event Area",
                "Event Area"
            ];
            addOptionsToSelect(toulanOptions);
            break;

        case "monria":
            // Add options for Monria
            var monriaOptions = [
				"Select Event Area",
                "Event Area"
            ];
            addOptionsToSelect(monriaOptions);
            break;

        case "next_island":
            // Add options for Next Island
            var nextIslandOptions = [
				"Select Event Area",
                "The Pit (pvp)"
            ];
            addOptionsToSelect(nextIslandOptions);
            break;

        case "ancient_greece":
            // Add options for Ancient Greece
            var ancientGreeceOptions = [
				"Select Event Area",
                "Spartan Training Grounds"
            ];
            addOptionsToSelect(ancientGreeceOptions);
            break;

        case "rocktropia":
            // Add options for Rocktropia
            var rocktropiaOptions = [
				"Select Event Area",
                "Bonzos Chop Shop",
				"Bonzos Chop Shop2",
				"CND Lagoon",
				"CND Outdoor Pool",
				"Camp Crunk",
				"Docklands",
				"Dragon Kingdom",
				"Empire Z East",
				"Empire Z west",
				"Fort Harlem",
				"Gas & Go Docks",
				"High Hills Mansion",
				"Isle of Lost Avatars",
				"Land Area",
				"Lemmys Castle",
				"Litle Wing Park",
				"Lower High Hills Blvd",
				"Lower Low Hills Blvd",
				"Lower Mid Hills Blvd",
				"McGrunter Park",
				"New Harlem Docks",
				"No Way Out Maximum Security Prison",
				"Old Fashion District",
				"Playa Del Harlem",
				"Playa Del Harlem",
				"Takeover Outpost",
				"The Hills Entrance",
				"Upper High Hills Blvd",
				"Upper Low Hills Blvd",
				"Upper Mid Hills Blvd",
				"Zomhatten"
            ];
            addOptionsToSelect(rocktropiaOptions);
            break;

        case "hell":
            // Add options for Hell
            var hellOptions = [
				"Select Event Area",
                "Abraxas Mine",
				"Acid Mines",
				"Agena Mine",
				"AntiCMOS Mine",
				"Byte Bandit Mine",
				"Commwarrior Mine",
				"Creeper Mine",
				"Eliza Mine",
				"Elk Cloner Mine",
				"Graybird Mine",
				"Koko Mine",
				"Macmag Mine",
				"Natas Mine",
				"Outer Circle of Hell",
				"RavMonE Mine",
				"SCA Mine",
				"Scotts Valley",
				"Seven Dust Mine",
				"ZMist Mine",
				"nVIR Mine"
            ];
            addOptionsToSelect(hellOptions);
            break;

        case "hunt_the_thing":
            // Add options for Hunt The Thing
            var huntTheThingOptions = [
				"Select Event Area",
                "Arctic Wasteland",
				"Boron Badlands",
				"Carpenter Valley",
				"Corina Ridge",
				"Discovery Ridge",
				"Halvorson Plains",
				"Logan Peak",
				"Mocatek Valley",
				"Outer Coast",
				"Solaris ValleyUncharted Mountains",
				"Viperback Mountain"

            ];
            addOptionsToSelect(huntTheThingOptions);
            break;

        case "secret_island":
			// Add options
			var secretIslandOptions = [
				"BANK NEVERDIE",
				"CLUB NEVERDIE",
				"CND Back Patio",
				"Cheri Cove",
				"Club NEVERDIE",
				"Island Girl Spartan",
				"Mount Pele",
				"NEVERDIE Champians Park",
				"NEVERDIE Elite PVP Ring",
				"NEVERDIE HyperClub",
				"Sheba CoveTaliesin Ridge",
				"VS Nightclub",
				"Wizards Hideaway",
				"Zuri Beach"
            ];
            addOptionsToSelect(secretIslandOptions);
            break;



	}

}
// Function to set default colors for all labels
function setDefaultLabelColors() {
    var labels = document.querySelectorAll('.eventrules-option label');
    labels.forEach(function (label) {
        label.style.color = '#43494bcf'; // Default text color
    });
}

// Function to set label color based on checkbox state and disabled status
function setLabelColor(label, isDisabled) {
    if (label) {
        label.style.color = isDisabled ? '#492d2d' : '#43494bcf'; // Red if disabled, default color if not
    }
}

function toggleOptions() {
    var optionsContainer = document.querySelector('.options-container');
    optionsContainer.style.display = optionsContainer.style.display === 'block' ? 'none' : 'block';

    // Set default colors when the dropdown is opened
    setDefaultLabelColors();
	
    // Get the selected win rule
    var selectedWinRule = document.getElementById('eventhosting-selecteventwinrule').value;

    // Get all the checkboxes within the options container
    var checkboxes = Array.from(document.querySelectorAll('.options-container input[type="checkbox"]'));
	
    // Loop through checkboxes and disable/enable based on the selected win rule
    checkboxes.forEach(function (checkbox) {
        var ruleId = checkbox.id;
        var labelForRule = document.querySelector('label[for="' + ruleId + '"]');

        // Disable or enable based on the selected win rule
        switch (selectedWinRule) {
            case 'mostvotes':
                if (ruleId === 'rule2' || ruleId === 'rule3') {
                    checkbox.disabled = true;
                    setLabelColor(labelForRule, true);
                } else {
                    checkbox.disabled = false;
                    setLabelColor(labelForRule, false);
                }
                break;
            case 'mostpvppoints':
                if (ruleId === 'rule2') {
                    checkbox.disabled = true;
                    setLabelColor(labelForRule, true);
                } else {
                    checkbox.disabled = false;
                    setLabelColor(labelForRule, false);
                }
                break;
            case 'mostloot':
                if (ruleId === 'rule3') {
                    checkbox.disabled = true;
                    setLabelColor(labelForRule, true);
                } else {
                    checkbox.disabled = false;
                    setLabelColor(labelForRule, false);
                }
                break;
            case 'highestsingleloot':
                if (ruleId === 'rule3') {
                    checkbox.disabled = true;
                    setLabelColor(labelForRule, true);
                } else {
                    checkbox.disabled = false;
                    setLabelColor(labelForRule, false);
                }
                break;
            default:
                checkbox.disabled = false; // Enable all checkboxes by default
                setLabelColor(labelForRule, false);
                break;
        }

        // Change text color of the associated label when checkbox is checked
        checkbox.addEventListener('change', function () {
            if (checkbox.checked && labelForRule) {
                console.log('Checkbox checked:', ruleId);
                labelForRule.style.color = '#13ca25d4'; // Adjust color as needed
            } else if (labelForRule) {
                console.log('Checkbox unchecked:', ruleId);
                setLabelColor(labelForRule, checkbox.disabled);
            }
        });
    });

    // Additional modifications
    var setmaxvehiclesi = document.getElementById('setmaxvehiclesi');
    if (setmaxvehiclesi) {
        setmaxvehiclesi.disabled = !checkboxes.some(function (checkbox) {
            return checkbox.id === 'rule16' && checkbox.checked;
        });
    }

    var setparticipantmaxhealth = document.getElementById('setparticipantmaxhealth');
    if (setparticipantmaxhealth) {
        setparticipantmaxhealth.disabled = !checkboxes.some(function (checkbox) {
            return checkbox.id === 'rule7' && checkbox.checked;
        });
    }

}

// Utility function to check if a time is in a specified range
function isTimeInRange(time, startTime, endTime) {
    var eventDateTime = new Date('2000-01-01T' + time);
    var startDateTime = new Date('2000-01-01T' + startTime);
    var endDateTime = new Date('2000-01-01T' + endTime);

    return eventDateTime >= startDateTime && eventDateTime <= endDateTime;
}
// Attach event listeners to both the time and date inputs
document.getElementById('seteventtime').addEventListener('input', checkAvailability);
document.getElementById('seteventdate').addEventListener('input', checkAvailability);

function checkAvailability() {
    var eventTime = document.getElementById('seteventtime').value;
    var dateString = document.getElementById('seteventdate').value;

    // Ensure the date is in the correct format (YYYY-MM-DD)
    dateString = dateString.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$1-$2');

    var eventDate = new Date(dateString + 'T' + eventTime + ':00Z');

    console.log('Event Time:', eventTime);
    console.log('Event Date:', eventDate);
    console.log('Day of the week:', eventDate.getDay());
    // Check if the day is Tuesday or Wednesday and the time is between 8am and 11:59am
    if ((eventDate.getDay() === 2 || eventDate.getDay() === 3) && isTimeInRange(eventTime, '08:00', '11:59')) {
        console.log('Warning: This time is reserved for server maintenance. Please choose another time.');
        document.getElementById('warningMessage').innerText = "! Reserved by MindArk !\n Please select another time \n Affected Timeslots:\n Tuesdays & Wednesdays \n  8:00am - 11:59am";
    } else {
        document.getElementById('warningMessage').innerText = "";
    }
}








document.addEventListener('DOMContentLoaded', function () {
	function updateEventCostTotal() {
		var eventDuration = parseFloat(document.getElementById('Input-eventduration').value) || 0;
		var eventPrizeValue = parseFloat(document.getElementById('Input-eventprizevalue').value) || 0;
		var eventReservations = parseFloat(document.getElementById('Input-eventreservations').value) || 0;

		var eventCostTotal = 5 + (eventDuration * 5) + eventPrizeValue + eventReservations;
		document.getElementById('Value-eventcostTotal').textContent = eventCostTotal.toFixed(2);
	}

	function updateEventAreaRentFees() {
		var eventDuration = parseFloat(document.getElementById('Input-eventduration').value) || 0;
		var intendedParticipantCount = parseFloat(document.getElementById('Input-Intendedparticipantcount').value) || 1;

		var eventAreaRentFees = ((eventDuration * 5) + 5) / intendedParticipantCount;
		document.getElementById('Value-eventarearentfees').textContent = eventAreaRentFees.toFixed(2);
	}

	function updateFairPrizeTax() {
		var eventPrizeValue = parseFloat(document.getElementById('Input-eventprizevalue').value) || 0;
		var intendedParticipantCount = parseFloat(document.getElementById('Input-Intendedparticipantcount').value) || 1;

		var fairPrizeTax = eventPrizeValue / intendedParticipantCount;
		document.getElementById('Value-fairprizetax').textContent = fairPrizeTax.toFixed(2);
	}

	function updateHostProfitTax() {
		var maxIntendedEventProfit = parseFloat(document.getElementById('Input-maxintendedeventprofit').value) || 0;
		var intendedParticipantCount = parseFloat(document.getElementById('Input-Intendedparticipantcount').value) || 1;

		var hostProfitTax = maxIntendedEventProfit / intendedParticipantCount;
		document.getElementById('Value-hostprofittax').textContent = hostProfitTax.toFixed(2);
	}

	function updateBreakEvenEventTicketPrice() {
		var eventCostTotal = parseFloat(document.getElementById('Value-eventcostTotal').textContent) || 0;
		var intendedParticipantCount = parseFloat(document.getElementById('Input-Intendedparticipantcount').value) || 1;

		var breakEvenEventTicketPrice = eventCostTotal / intendedParticipantCount;
		document.getElementById('Value-breakeveneventTicketprice').textContent = breakEvenEventTicketPrice.toFixed(2);
	}

	function updateProfitableEventTicketPrice() {
		var eventAreaRentFees = parseFloat(document.getElementById('Value-eventarearentfees').textContent) || 0;
		var fairPrizeTax = parseFloat(document.getElementById('Value-fairprizetax').textContent) || 0;
		var hostProfitTax = parseFloat(document.getElementById('Value-hostprofittax').textContent) || 0;

		var profitableEventTicketPrice = eventAreaRentFees + fairPrizeTax + hostProfitTax;
		document.getElementById('Value-profitableeventTicketprice').textContent = profitableEventTicketPrice.toFixed(2);
	}

	function updateFinalEventProfitLoss() {
		var eventCostTotal = parseFloat(document.getElementById('Value-eventcostTotal').textContent) || 0;
		var eventTicketsSold = parseFloat(document.getElementById('Input-eventTicketssold').value) || 0;
		var profitableEventTicketPrice = parseFloat(document.getElementById('Value-profitableeventTicketprice').textContent) || 0;
		var finalEventProfitLoss = 0 - eventCostTotal + (eventTicketsSold * profitableEventTicketPrice);
		document.getElementById('Value-finaleventProfitloss').textContent = finalEventProfitLoss.toFixed(2);
	}
  // Function to calculate and update max potential profit
    function updateMaxPotentialProfit() {
  	// Get input values
		var totalTicketCount = parseFloat(document.getElementById('Input-eventtotalticketcount').value) || 0;
		var profitableTicketPrice = parseFloat(document.getElementById('Value-profitableeventTicketprice').innerText) || 0;
		var eventCostTotal = parseFloat(document.getElementById('Value-eventcostTotal').innerText) || 0;

		// Calculate max potential profit
		var maxPotentialProfit = totalTicketCount * profitableTicketPrice - eventCostTotal;

		// Update the content of the max potential profit element
		document.getElementById('Value-eventmaxpotentialprofit').innerText = maxPotentialProfit.toFixed(2);
	}


	document.getElementById('Input-eventduration').addEventListener('change', function () {
		updateEventCostTotal();
		updateEventAreaRentFees();
		updateBreakEvenEventTicketPrice();
		updateProfitableEventTicketPrice();
		updateFinalEventProfitLoss();
		updateMaxPotentialProfit();
	});

	document.getElementById('Input-eventprizevalue').addEventListener('change', function () {
		updateEventCostTotal();
		updateFairPrizeTax();
		updateProfitableEventTicketPrice();
		updateFinalEventProfitLoss();
		updateMaxPotentialProfit();
	});

	document.getElementById('Input-eventreservations').addEventListener('change', function () {
		updateEventCostTotal();
		updateBreakEvenEventTicketPrice();
		updateProfitableEventTicketPrice();
		updateFinalEventProfitLoss();
		updateMaxPotentialProfit();
	});

	document.getElementById('Input-maxintendedeventprofit').addEventListener('change', function () {
		updateHostProfitTax();
		updateProfitableEventTicketPrice();
		updateFinalEventProfitLoss();
		updateMaxPotentialProfit();
	});

	document.getElementById('Input-Intendedparticipantcount').addEventListener('change', function () {
		updateEventAreaRentFees();
		updateFairPrizeTax();
		updateHostProfitTax();
		updateBreakEvenEventTicketPrice();
		updateProfitableEventTicketPrice();
		updateFinalEventProfitLoss();
		updateMaxPotentialProfit();
	});

	document.getElementById('Input-eventTicketssold').addEventListener('change', function () {
		updateFinalEventProfitLoss();
		
	});

});

var eventAreaCoordsElement = document.getElementById('Value-eventAreamarkercoords');
var selectPlanet = document.getElementById('eventhosting-selectplanet');
var selectEventArea = document.getElementById('eventhosting-selecteventarea');

selectEventArea.onchange = function () {
	updateMarkerCoords();
    updateWildlife();
};

// Define the updateMarkerCoords function to call setEventAreaCoords
function updateMarkerCoords() {
    var selectedPlanet = selectPlanet.value;
    var selectedEventArea = selectEventArea.value;
    setEventAreaCoords(selectedEventArea, selectedPlanet);
}

// Define the updateWildlife function to call setEventAreaWildlife
function updateWildlife() {
    var selectedPlanet = selectPlanet.value;
    var selectedEventArea = selectEventArea.value;
    setEventAreaWildlife(selectedEventArea, selectedPlanet);
}



function setEventAreaCoords(selectedEventArea, selectedPlanet) {
    var eventAreaCoordsElement = document.getElementById('Value-eventAreamarkercoords');
    eventAreaCoordsElement.innerText = '';

    var genericCoords = 'planet name, 00000, 00000, 1000';
    // Define coordinates for each event area and planet
    var coordsOptions = {
        arkadia: {
            'Aakas Island': '[Planet Arkadia, 12345, 67890, 1500]',
            "Thunder Ridge": '[Planet Arkadia, 12345, 67890, 1500]',
            'Arkadia Event Area 1': '[Planet Arkadia, 12345, 67890, 1500]',
            'Arkadia Event Area 2':'[Planet Arkadia, 12345, 67890, 1500]',
			'Arkadia Event Area 3':'[Planet Arkadia, 12345, 67890, 1500]',
			'Arkadia Event Area 4': '[Planet Arkadia, 12345, 67890, 1500]',
			'BIG Industries ALA#05': '[Planet Arkadia, 12345, 67890, 1500]',
			"Mutation Station":'[Planet Arkadia, 12345, 67890, 1500]',
			"Cyclone Point":'[Planet Arkadia, 12345, 67890, 1500]',
			"IFN Commando Training Grounds":'[Planet Arkadia, 12345, 67890, 1500]',
			"Khorum Coast":'[Planet Arkadia, 12345, 67890, 1500]',
			"Lighting Coast":'[Planet Arkadia, 12345, 67890, 1500]',
			"Sanctuary Bay":'[Planet Arkadia, 12345, 67890, 1500]',
			"Sancutary Shores":'[Planet Arkadia, 12345, 67890, 1500]',
			"Sentosa's Reach":'[Planet Arkadia, 12345, 67890, 1500]',
			"Songkra Valley":'[Planet Arkadia, 12345, 67890, 1500]',
			"Storms Keep":'[Planet Arkadia, 12345, 67890, 1500]',
			"Thunder Hills":'[Planet Arkadia, 12345, 67890, 1500]',
			"Thunder Ridge":'[Planet Arkadia, 12345, 67890, 1500]'
        },
		ark_underground: {
            'no event areas':'[Arkadia Underground, 12345, 67890, 1500]'
        },
		ark_moon: {
            'no event areas':'[Arkadia Moon, 12345, 67890, 1500]'
        },
        calypso: {
            'Apophis Island':'[Planet Calypso, 12345, 67890, 1500]',
            'Ayida Island':'[Planet Calypso, 12345, 67890, 1500]',
            'Akmuul SouthWest OLA39':'[Planet Calypso, 12345, 67890, 1500]',
			"Bakunawa Island":'[Planet Calypso, 12345, 67890, 1500]',
			"Deino Island":'[Planet Calypso, 12345, 67890, 1500]',
			"Eldorado":'[Planet Calypso, 12345, 67890, 1500]',
			"Emerald Lakes Mall Land":'[Planet Calypso, 12345, 67890, 1500]',
			"Enyo Island":'[Planet Calypso, 12345, 67890, 1500]',
			"Event Area":'[Planet Calypso, 12345, 67890, 1500]',
			"Fortress Invincible":'[Planet Calypso, 12345, 67890, 1500]',
			"ILLAWARRA 73 - OLA#29":'[Planet Calypso, 12345, 67890, 1500]',
			"Medusa Bazaar":'[Planet Calypso, 12345, 67890, 1500]',
			"Naga Island Ouroboros Island":'[Planet Calypso, 12345, 67890, 1500]',
			"Port Atlantis MallThe Land of Oz":'[Planet Calypso, 12345, 67890, 1500]',
			"Twin Peaks Mall":'[Planet Calypso, 12345, 67890, 1500]',
			"That Freeking Cold Place":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera LA1":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera LA3":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera LA5":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera LA6":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera LA7":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera LA10":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera LA11":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera LA13":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera LA17":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera LA18":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera LA19":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #1":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #2":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #3":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #4":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #5":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #6":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #7":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #8":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #9":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #10":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #11":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #12":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #13":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #14":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #15":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #16":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #17":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #18":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #19":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #20":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #21":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #23":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #24":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #25":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #26":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #27":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #28":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #29":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #30":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #31":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #31":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #33":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #34":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #35":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #36":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #37":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #38":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #39":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #40":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #41 East":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #41 North":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #41 West":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #42":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #43":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #44":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #45":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #46":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #47":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #48":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #49":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #50":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #51":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #52":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #53":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #54":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #55":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #56":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #57":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #58":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #59":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #60":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #61":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #62":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #63": '[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #64":'[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #65": '[Planet Calypso, 12345, 67890, 1500]',
			"Amethera Outback Land #66":'[Planet Calypso, 12345, 67890, 1500]'
        },	
        crystal_palace: {
            'Apophis Island':'[Crystal Palace, 12345, 67890, 1500]',
			"CP Shopping Booth Area":'[Crystal Palace, 12345, 67890, 1500]',
			"Crystal Palace Dome 1":'[Crystal Palace, 12345, 67890, 1500]',
			"Crystal Palace Dome 2":'[Crystal Palace, 12345, 67890, 1500]',
			"Crystal Palace Dome 3":'[Crystal Palace, 12345, 67890, 1500]',
			"Crystal Palace Dome 4":'[Crystal Palace, 12345, 67890, 1500]'
		},
        planet_cyrene: {
			"Event Area":'[Planet Cyrene, 12345, 67890, 1500]',
            "Event Area":'[Planet Cyrene, 12345, 67890, 1500]',
            "NGU Volcano Land Area":'[Planet Cyrene, 12345, 67890, 1500]'
        },
        planet_toulan: {
            'Event Area':'[Planet Toulan, 12345, 67890, 1500]'
        },
        monria: {
            'Event Area':'[Monria, 12345, 67890, 1500]'
        },
		next_island: {
           'The Pit (pvp)':'[Next Island, 12345, 67890, 1500]'
        },
		ancient_greece: {
           'Spartan Training Grounds':'[Ancient Greece, 12345, 67890, 1500]'
        },
        rocktropia: {
            'Bonzos Chop Shop':'[Rocktropia, 12345, 67890, 1500]',
			"Bonzos Chop Shop2":'[Rocktropia, 12345, 67890, 1500]',
			"CND Lagoon":'[Rocktropia, 12345, 67890, 1500]',
			"CND Outdoor Pool":'[Rocktropia, 12345, 67890, 1500]',
			"Camp Crunk":'[Rocktropia, 12345, 67890, 1500]',
			"Docklands":'[Rocktropia, 12345, 67890, 1500]',
			"Dragon Kingdom":'[Rocktropia, 12345, 67890, 1500]',
			"Empire Z East":'[Rocktropia, 12345, 67890, 1500]',
			"Empire Z west":'[Rocktropia, 12345, 67890, 1500]',
			"Fort Harlem":'[Rocktropia, 12345, 67890, 1500]',
			"Gas & Go Docks":'[Rocktropia, 12345, 67890, 1500]',
			"High Hills Mansion":'[Rocktropia, 12345, 67890, 1500]',
			"Isle of Lost Avatars":'[Rocktropia, 12345, 67890, 1500]',
			"Land Area":'[Rocktropia, 12345, 67890, 1500]',
			"Lemmys Castle":'[Rocktropia, 12345, 67890, 1500]',
			"Litle Wing Park":'[Rocktropia, 12345, 67890, 1500]',
			"Lower High Hills Blvd":'[Rocktropia, 12345, 67890, 1500]',
			"Lower Low Hills Blvd":'[Rocktropia, 12345, 67890, 1500]',
			"Lower Mid Hills Blvd":'[Rocktropia, 12345, 67890, 1500]',
			"McGrunter Park":'[Rocktropia, 12345, 67890, 1500]',
			"New Harlem Docks":'[Rocktropia, 12345, 67890, 1500]',
			"No Way Out Maximum Security Prison":'[Rocktropia, 12345, 67890, 1500]',
			"Old Fashion District":'[Rocktropia, 12345, 67890, 1500]',
			"Playa Del Harlem":'[Rocktropia, 12345, 67890, 1500]',
			"Playa Del Harlem":'[Rocktropia, 12345, 67890, 1500]',
			"Takeover Outpost":'[Rocktropia, 12345, 67890, 1500]',
			"The Hills Entrance":'[Rocktropia, 12345, 67890, 1500]',
			"Upper High Hills Blvd":'[Rocktropia, 12345, 67890, 1500]',
			"Upper Low Hills Blvd":'[Rocktropia, 12345, 67890, 1500]',
			"Upper Mid Hills Blvd":'[Rocktropia, 12345, 67890, 1500]',
			"Zomhatten":'[Rocktropia, 12345, 67890, 1500]'
        },
		hell: {
           'The Pit (pvp)':'[Hell, 12345, 67890, 1500]',
			 "Abraxas Mine":'[Hell, 12345, 67890, 1500]',
			"Acid Mines":'[Hell, 12345, 67890, 1500]',
			"Agena Mine":'[Hell, 12345, 67890, 1500]',
			"AntiCMOS Mine":'[Hell, 12345, 67890, 1500]',
			"Byte Bandit Mine":'[Hell, 12345, 67890, 1500]',
			"Commwarrior Mine":'[Hell, 12345, 67890, 1500]',
			"Creeper Mine":'[Hell, 12345, 67890, 1500]',
			"Eliza Mine":'[Hell, 12345, 67890, 1500]',
			"Elk Cloner Mine":'[Hell, 12345, 67890, 1500]',
			"Graybird Mine":'[Hell, 12345, 67890, 1500]',
			"Koko Mine":'[Hell, 12345, 67890, 1500]',
			"Macmag Mine":'[Hell, 12345, 67890, 1500]',
			"Natas Mine":'[Hell, 12345, 67890, 1500]',
			"Outer Circle of Hell":'[Hell, 12345, 67890, 1500]',
			"RavMonE Mine":'[Hell, 12345, 67890, 1500]',
			"SCA Mine":'[Hell, 12345, 67890, 1500]',
			"Scotts Valley":'[Hell, 12345, 67890, 1500]',
			"Seven Dust Mine":'[Hell, 12345, 67890, 1500]',
			"ZMist Mine":'[Hell, 12345, 67890, 1500]',
			"nVIR Mine":'[Hell, 12345, 67890, 1500]'
        },
		hunt_the_thing: {
           'The Pit (pvp)':'[Hunt The Thing, 12345, 67890, 1500]',
			"Arctic Wasteland":'[Hunt The Thing, 12345, 67890, 1500]',
			"Boron Badlands":'[Hunt The Thing, 12345, 67890, 1500]',
			"Carpenter Valley":'[Hunt The Thing, 12345, 67890, 1500]',
			"Corina Ridge":'[Hunt The Thing, 12345, 67890, 1500]',
			"Discovery Ridge":'[Hunt The Thing, 12345, 67890, 1500]',
			"Halvorson Plains":'[Hunt The Thing, 12345, 67890, 1500]',
			"Logan Peak":'[Hunt The Thing, 12345, 67890, 1500]',
			"Mocatek Valley":'[Hunt The Thing, 12345, 67890, 1500]',
			"Outer Coast":'[Hunt The Thing, 12345, 67890, 1500]',
			"Solaris ValleyUncharted Mountains":'[Hunt The Thing, 12345, 67890, 1500]',
			"Viperback Mountain":'[Hunt The Thing, 12345, 67890, 1500]'
        },
		secret_island: {
			"BANK NEVERDIE":'[Hunt The Thing, 12345, 67890, 1500]',
			"CLUB NEVERDIE":'[Hunt The Thing, 12345, 67890, 1500]',
			"CND Back Patio":'[Hunt The Thing, 12345, 67890, 1500]',
			"Cheri Cove":'[Hunt The Thing, 12345, 67890, 1500]',
			"Club NEVERDIE":'[Hunt The Thing, 12345, 67890, 1500]',
			"Island Girl Spartan":'[Hunt The Thing, 12345, 67890, 1500]',
			"Mount Pele":'[Hunt The Thing, 12345, 67890, 1500]',
			"NEVERDIE Champians Park":'[Hunt The Thing, 12345, 67890, 1500]',
			"NEVERDIE Elite PVP Ring":'[Hunt The Thing, 12345, 67890, 1500]',
			"NEVERDIE HyperClub":'[Hunt The Thing, 12345, 67890, 1500]',
			"Sheba CoveTaliesin Ridge":'[Hunt The Thing, 12345, 67890, 1500]',
			"VS Nightclub":'[Hunt The Thing, 12345, 67890, 1500]',
			"Wizards Hideaway":'[Hunt The Thing, 12345, 67890, 1500]',
			"Zuri Beach":'[Hunt The Thing, 12345, 67890, 1500]'
        // Add coordinates for other planets
        // ...
		
		}
	};

    // Check if the selected planet and event area have corresponding coordinates
    if (coordsOptions[selectedPlanet] && coordsOptions[selectedPlanet][selectedEventArea]) {
        // Display the coordinates for the selected planet and event area
        eventAreaCoordsElement.innerText = coordsOptions[selectedPlanet][selectedEventArea];
        eventAreaCoordsElement.title = 'Click to Copy Marker Coordinates\n ' + coordsOptions[selectedPlanet][selectedEventArea];
    } else {
        // Display generic coordinates for unknown event areas
        eventAreaCoordsElement.innerText = genericCoords;
        eventAreaCoordsElement.title = 'Marker Coordinates\n Generic Coordinates';
    }
}
function setEventAreaWildlife(selectedEventArea, selectedPlanet) {
    // Get the wildlife P element
    var eventAreaWildlifeElement = document.getElementById('Value-eventAreawildlife');
    console.log('Selected Event Area:', selectedEventArea);
    console.log('Selected Planet:', selectedPlanet);

    // Clear existing content
    eventAreaWildlifeElement.innerText = '';

    // Define generic wildlife for unknown event areas
    var genericWildlife = ['Currently Unknown'];

    // Define wildlife options for each event area and planet
    var wildlifeOptions = {
        arkadia: {
            'Aakas Island': ['Cat3\nMagurg lvl 7-42 Title: Agents Will be deployed\n to obtain Intel ASAP'], /* hunting tax: 4.50%    mining tax:  3.50%  */
            'Arkadia Event Area 1': ['Cat3?\n Riptor stalker lvl 33-45 Title: Agents Will be deployed\n to obtain Intel ASAP'],  /* hunting tax: 0%     mining tax:  0%  */
            'Arkadia Event Area 2': ['Cat1\nMixed ark Punies\nArk Hornets, Monura M/F\n Gallard  Title: Agents Will be deployed\n to obtain Intel ASAP'], /* hunting tax: 0%     mining tax:  0%  */
			'Arkadia Event Area 3': ['Cat-3?\ntiarek lvl 7-30 Title: Agents Will be deployed\n to obtain Intel ASAP'], /* hunting tax: 0%     mining tax:  0%  */
			'Arkadia Event Area 4': [' Cat 2,3?\nNusul lvl 4-9\nBokul lvl 9-15 Title: Agents Will be deployed\n to obtain Intel ASAP'], /* hunting tax: 0%     mining tax:  0%   */
			'BIG Industries ALA#05': ['Cat3?\nMutated Riptor Young Lvl 23 Title: Agents Will be deployed\n to obtain Intel ASAP'],/* hunting tax: 3.99%     mining tax:  3.99%  */
			"Mutation Station": ['Cat1,2,3?\n Oro lvl 4-5\nBokol lvl 7-10\nKamal L36-51 Title: Agents Will be deployed\n to obtain Intel ASAP'],/* hunting tax: 0%     mining tax:  0%  */
			"Cyclone Point": ['kadra lvl 22-46\nJori lvl 6-7\ndensity: medium Title: Agents Will be deployed\n to obtain Intel ASAP'],/*hunting tax: 4.00%     mining tax:  4.00%   shopping tax 2.5%  dominant,old alpha,stalker \nprowler,stalker,old alpha */
			"IFN Commando Training Grounds": ['pvp event area\n no mobs Title: Agents Will be deployed\n to obtain Intel ASAP'],/* hunting tax: 0%     mining tax:  0%  */
			"Khorum Coast": ['Mutated Nusul lvl 6-13\nMutated Zadul lvl 7-9\nMutated Hadraada Lvl6-?\nMutated Kamaldon lvl36\n density: low Title: Agents Will be deployed\n to obtain Intel ASAP'],/* hunting tax: 0%     mining tax:  0%  young,dominant,alpha,old alpha,-young-mature-young-?-young-?*/
			"Lighting Coast": ['Huon lvl 38-64\nHunting tax: 4.00% Title: Agents Will be deployed\n to obtain Intel ASAP1'],/* hunting tax: 4.00% mining tax:  4.00% shopping tax: 2.50   alpha-stalker,prowler,old alpha*/
			"Sanctuary Bay": [' shopping area\n no mobs  Title: Agents Will be deployed\n to obtain Intel ASAP1'],/* hunting tax: 0%     mining tax:  0%  shopping tax: 2.5%*/
			"Sancutary Shores": ['Tiarek young  lvl 8-25 - Prowler,Alpha\ntax:4.00% Title: Agents Will be deployed\n to obtain Intel ASAP'],/* hunting tax: 4.00% mining tax: 4.00% shopping tax: 2.5% */
			"Sentosa's Reach": ['Mutated madana young lvl 13 \nHunting tax: 2.25% Title: Agents Will be deployed\n to obtain Intel ASAP'],/* hunting tax: 2.25%     mining tax:  2.75% shopping tax: 2.50% */
			"Songkra Valley": ['mutated beladoth young\n lvl 25 \nMutated Otorugi\nlvl 22-28 young&old Title: Agents Will be deployed\n to obtain Intel ASAP'],/* hunting tax: 4.00%     mining tax:  2.00%  shopping tax: 2.50% */
			"Storms Keep": ['huon\nlvl 23-52  Title: Agents Will be deployed\n to obtain Intel ASAP'],/* hunting tax: 4.00% mining tax: 4.00% shopping tax: 2.50%   young,provider,guardian,alpha, old alpha  */
			"Thunder Hills": ['Kadra\n lvl 22-30 Title: Agents Will be deployed\n to obtain Intel ASAP'],/* hunting tax: 4%     mining tax:  4%  shoptax: 2.5  Young-mature, old,provider*/
			"Thunder Ridge": ['Kadra lvl22-35\nHuon lvl 23-38\nHunting Tax:4.00% Mining Tax:4.00% Title: \n Kadra lvl22-35\nYoung,dominant\n density: low\nHuon lvl 23-38\nyoung-Guardian\n density: medium/high']/* */
        },
		ark_underground: {
            'no event areas': ['N/A Title: Agents Will be deployed\n to obtain Intel ASAP']
        },
		ark_moon: {
            'no event areas': ['N/A Title: Agents Will be deployed\n to obtain Intel ASAP']
        },
        calypso: {
            'Apophis Island': ['Cat5 - Mystical Beasts Title: Agents Will be deployed\n to obtain Intel ASAP'],
            'Ayida Island': ['Cat6 - Legendary Creatures Title: Agents Will be deployed\n to obtain Intel ASAP'],
            'Akmuul SouthWest OLA39': ['Cat7 - Mythical Monsters Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Bakunawa Island": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Deino Island": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Eldorado": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Emerald Lakes Mall Land": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Enyo Island": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Event Area": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Fortress Invincible": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"ILLAWARRA 73 - OLA#29": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Medusa Bazaar": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Naga Island Ouroboros Island": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Port Atlantis MallThe Land of Oz": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Twin Peaks Mall": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"That Freeking Cold Place": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera LA1": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera LA3": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera LA5": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera LA6": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera LA7": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera LA10": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera LA11": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera LA13": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera LA17": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera LA18": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera LA19": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #1": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #2": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #3": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #4": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #5": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #6": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #7": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #8": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #9": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #10": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #11": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #12": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #13": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #14": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #15": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #16": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #17": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #18": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #19": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #20": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #21": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #22": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #23": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #24": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #25": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #26": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #27": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #28": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #29": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #30": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #31": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #31": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #33": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #34": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #35": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #36": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #37": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #38": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #39": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #40": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #41 East": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #41 North": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #41 West": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #42": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #43": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #44": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #45": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #46": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #47": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #48": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #49": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #50": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #51": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #52": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #53": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #54": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #55": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #56": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #57": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #58": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #59": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #60": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #61": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #62": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #63": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #64": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #65": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Amethera Outback Land #66": ['Currently Unkown Title: Agents Will be deployed\n to obtain Intel ASAP']
        },	
        crystal_palace: {
            'Apophis Island': ['Cat5 - Mystical Beasts Title: Agents Will be deployed\n to obtain Intel ASAP'],		
			"CP Shopping Booth Area": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Crystal Palace Dome 1": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Crystal Palace Dome 2": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Crystal Palace Dome 3": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Crystal Palace Dome 4": [' Title: Agents Will be deployed\n to obtain Intel ASAP']
		},
        planet_cyrene: {
			"Event Area": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
            "Event Area": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
            "NGU Volcano Land Area": [' Title: Agents Will be deployed\n to obtain Intel ASAP']
        },
        planet_toulan: {
            'Event Area': ['Cat9 - Alien Lifeforms Title: Agents Will be deployed\n to obtain Intel ASAP'],
        },
        monria: {
            'Event Area': ['Cat10 - Otherworldly Beings Title: Agents Will be deployed\n to obtain Intel ASAP'],
        },
		next_island: {
           'The Pit (pvp)': ['Cat12 - Interdimensional Fighters Title: Agents Will be deployed\n to obtain Intel ASAP'],
        },
		ancient_greece: {
           'Spartan Training Grounds': ['cat54 - yourmom Title: Agents Will be deployed\n to obtain Intel ASAP'],
        },
        rocktropia: {
            'Bonzos Chop Shop': ['Cat11 - Space Invaders Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Bonzos Chop Shop2": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"CND Lagoon": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"CND Outdoor Pool": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Camp Crunk": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Docklands": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Dragon Kingdom": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Empire Z East": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Empire Z west": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Fort Harlem": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Gas & Go Docks": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"High Hills Mansion": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Isle of Lost Avatars": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Land Area": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Lemmys Castle": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Litle Wing Park": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Lower High Hills Blvd": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Lower Low Hills Blvd": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Lower Mid Hills Blvd": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"McGrunter Park": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"New Harlem Docks": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"No Way Out Maximum Security Prison": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Old Fashion District": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Playa Del Harlem": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Playa Del Harlem": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Takeover Outpost": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"The Hills Entrance": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Upper High Hills Blvd": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Upper Low Hills Blvd": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Upper Mid Hills Blvd": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Zomhatten": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP']
        },
		hell: {
           'The Pit (pvp)': ['Cat12 - Interdimensional Fighters Title: Agents Will be deployed\n to obtain Intel ASAP'],
			 "Abraxas Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Acid Mines": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Agena Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"AntiCMOS Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Byte Bandit Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Commwarrior Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Creeper Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Eliza Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Elk Cloner Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Graybird Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Koko Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Macmag Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Natas Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Outer Circle of Hell": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"RavMonE Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"SCA Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Scotts Valley": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Seven Dust Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"ZMist Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"nVIR Mine": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP']
        },
		hunt_the_thing: {
           'The Pit (pvp)': ['Cat12 - Interdimensional Fighters Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Arctic Wasteland": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Boron Badlands": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Carpenter Valley": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Corina Ridge": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Discovery Ridge": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Halvorson Plains": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Logan Peak": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Mocatek Valley": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Outer Coast": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Solaris ValleyUncharted Mountains": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Viperback Mountain": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP']
        },
		secret_island: {
			"BANK NEVERDIE": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"CLUB NEVERDIE": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"CND Back Patio": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Cheri Cove": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Club NEVERDIE": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Island Girl Spartan": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Mount Pele": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"NEVERDIE Champians Park": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"NEVERDIE Elite PVP Ring": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"NEVERDIE HyperClub": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Sheba CoveTaliesin Ridge": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"VS Nightclub": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Wizards Hideaway": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP'],
			"Zuri Beach": ['Currently Uknown Title: Agents Will be deployed\n to obtain Intel ASAP']
        }

        // Add options for other planets
/*		next_island: {
           'The Pit (pvp)': ['Cat12 - Interdimensional Fighters Title: Agents Will be deployed\n to obtain Intel ASAP'],
            /*Add more event areas for Next Island */
/*        },		*/
    };

    // Check if the selected planet and event area have corresponding wildlife options
    if (wildlifeOptions[selectedPlanet] && wildlifeOptions[selectedPlanet][selectedEventArea]) {
        // Display the wildlife for the selected planet and event area
        var wildlifeList = wildlifeOptions[selectedPlanet][selectedEventArea];

        // Process each line
        wildlifeList.forEach(function (wildlife) {
            // Split the line at "Title:"
            var splitWildlife = wildlife.split('Title');

            // Check if the split was successful
            if (splitWildlife.length === 2) {
                // Set inner text and title for the element
                eventAreaWildlifeElement.innerText += splitWildlife[0] + '\n';
                eventAreaWildlifeElement.title = 'Event Area Wildlife: ' + splitWildlife[1].trim();
            } else {
                // If split was not successful, just display the original line
                eventAreaWildlifeElement.innerText += wildlife + '\n';
            }
        });
    } else {
        // Display generic wildlife for unknown event areas
        eventAreaWildlifeElement.innerText = genericWildlife.join('\n');
        eventAreaWildlifeElement.title = 'Event Area Wildlife: Currently Unknown';
    }
}



// Function to add a new custom event to the list
function newcustomevent() {
    // Prompt the user for an event name
    var eventName = prompt("Enter the name for your custom event:");

    // Check if the user clicked Cancel
    if (eventName === null) {
        alert('Adding to custom events list canceled.');
        return;
    }


    // Get the necessary values from the event planner
    var selectedPlanet = document.getElementById('eventhosting-selectplanet').value;
    var selectedEventArea = document.getElementById('eventhosting-selecteventarea').value;
    var eventWinRule = document.getElementById('eventhosting-selecteventwinrule').value;
    var eventRules = getSelectedRules(); // Assuming you have a function to get selected rules
    var eventDuration = document.getElementById('Input-eventduration').value;
    var eventPrizeValue = document.getElementById('Input-eventprizevalue').value;
    var eventReservations = document.getElementById('Input-eventreservations').value;
    var eventTotalTicketCount = document.getElementById('Input-eventtotalticketcount').value;
    var eventCostTotal = document.getElementById('Value-eventcostTotal').textContent;

    // Create a new custom event object
    var customEvent = {
        eventName: eventName,  // Add the event name property
        planet: selectedPlanet,
        eventArea: selectedEventArea,
        winRule: eventWinRule,
        rules: eventRules,
        duration: eventDuration,
        prizeValue: eventPrizeValue,
        reservations: eventReservations,
        totalTicketCount: eventTotalTicketCount,
        costTotal: eventCostTotal,
        // Add other properties as needed
    };

    // Add the custom event to the list
    customEventsList.push(customEvent);

    // Save the updated custom events list to local storage
    saveCustomEventsList();

    // Provide feedback to the user
    alert('Event added to custom events list!');
}

// Modify the function to clear the custom events list
function clearCustomEvents() {
    // Confirm with the user before clearing the data
    var confirmClear = confirm("Are you sure you want to clear the custom events list?");

    if (confirmClear) {
        // Clear the custom events list from local storage
        localStorage.removeItem('customEventsList');
        alert("Custom events list has been cleared!");
    }
}
// Function to get selected rules from checkboxes
function getSelectedRules() {
    var selectedRules = [];
    var checkboxes = document.querySelectorAll('#eventhosting-selecteventrules input[type="checkbox"]:checked');
    checkboxes.forEach(function (checkbox) {
        selectedRules.push(checkbox.value);
    });
    return selectedRules;
}
// Modify the function to save the custom events list to local storage
function saveCustomEventsList() {
    // Convert the custom events list to a JSON string
    var customEventsListJson = JSON.stringify(customEventsList);

    // Save the JSON string to local storage
    localStorage.setItem('customEventsList', customEventsListJson);
}

// Modify the function to load the custom events list from local storage
function loadCustomEventsList() {
    // Retrieve the JSON string from local storage
    var customEventsListJson = localStorage.getItem('customEventsList');

    // Parse the JSON string to get the custom events list
    customEventsList = JSON.parse(customEventsListJson) || [];
}

// Call the function to load the custom events list when the page loads
loadCustomEventsList();

// Function to add a new event to the calendar
function addeventcallender() {
    // Prompt the user for an event name
    var eventName = prompt("Enter the name for your event:");

    // Check if the user clicked Cancel
    if (eventName === null) {
        alert('Adding to calendar canceled.');
        return;
    }

    // Get the necessary values from the event planner
    var eventDate = document.getElementById('seteventdate').value;
    var eventTime = document.getElementById('seteventtime').value;
    var eventMaxVehicleSI = document.getElementById('setmaxvehiclesi').value;
    var eventParticipantMaxHealth = document.getElementById('setparticipantmaxhealth').value;
    var eventMinReputation = document.getElementById('seteventminreputation').value;

    // Get additional details from the event planner
    var eventDuration = document.getElementById('Input-eventduration').value;
    var eventPrizeValue = document.getElementById('Input-eventprizevalue').value;
    var eventReservations = document.getElementById('Input-eventreservations').value;
    var eventTotalTicketCount = document.getElementById('Input-eventtotalticketcount').value;
    var eventCostTotal = document.getElementById('Value-eventcostTotal').textContent;

    // Get total ticket price from the element
    var totalTicketPrice = document.getElementById('Value-profitableeventTicketprice').textContent;

    // Get selected rules using the existing function
    var eventRules = getSelectedRules();

    // Create a formatted string with the event details
    var formattedDetails = `Event Name: ${eventName}\n` +
        `Date & Time: ${eventDate} ${eventTime}\n` +
        `Max Vehicle SI, Max Health, Min Reputation: ${eventMaxVehicleSI}, ${eventParticipantMaxHealth}, ${eventMinReputation}\n` +
        `Duration & Prize Value: ${eventDuration}, ${eventPrizeValue}\n` +
        `Reservations & # of Tickets: ${eventReservations}, ${eventTotalTicketCount}\n` +
        `Total Event Cost: ${eventCostTotal}\n` +
        `Total Ticket Price: ${totalTicketPrice}\n` +
        `Rules: ${eventRules.join(', ')}`;

    // Display the formatted event details and ask for confirmation
    var confirmDetails = confirm(`Please confirm the event details:\n\n${formattedDetails}\n\nClick OK to add to the calendar.`);

    // Check if the user clicked Cancel in the confirmation prompt
    if (!confirmDetails) {
        alert('Adding to calendar canceled.');
		console.log('Cancelling save function scheduledevents:', scheduledevents);
        return;
    }

    // Create a new event object with all details
    var scheduledEvent = {
        eventName: eventName,
        date: eventDate,
        time: eventTime,
        maxVehicleSI: eventMaxVehicleSI,
        participantMaxHealth: eventParticipantMaxHealth,
        minReputation: eventMinReputation,
        duration: eventDuration,
        prizeValue: eventPrizeValue,
        reservations: eventReservations,
        totalTicketCount: eventTotalTicketCount,
        costTotal: eventCostTotal,
        totalTicketPrice: totalTicketPrice, // Add the total ticket price
        // Add other properties as needed
    };

    // Add the event to the scheduled events list
    scheduledevents.push(scheduledEvent);

    // Save the updated scheduled events list to local storage
    saveScheduledEventsList();

    // Provide feedback to the user
    alert('Event added to calendar!');
	console.log('adding to save function-updated scheduledevents:', scheduledevents);
}
// Function to save the scheduled events list to local storage
function saveScheduledEventsList() {
    // Convert the scheduled events list to a JSON string
    var scheduledEventsListJson = JSON.stringify(scheduledevents);

    // Save the JSON string to local storage
    localStorage.setItem('scheduledEventsList', scheduledEventsListJson);
		// Re-render the calendar to display the new events
	calendar.render();
	console.log('calender rerendered');
}
// Function to delete all saved scheduled events
function deleteAllScheduledEvents() {
    // Clear the scheduled events array
    scheduledevents = [];

    // Save the updated scheduled events list to local storage
    saveScheduledEventsList();


    // Remove the scheduled events from local storage
    localStorage.removeItem('scheduledEventsList');
    // Provide feedback to the user
    alert('All scheduled events deleted!');
	console.log('delete all scheduled events function-updated scheduledevents:', scheduledevents);
	// Re-render the calendar to display the new events
	calendar.render();
	console.log('calender rerendered');
}
// Function to load the scheduled events list from local storage
function loadScheduledEventsList() {
	
    // Retrieve the JSON string from local storage
    var scheduledEventsListJson = localStorage.getItem('scheduledEventsList');
	
    // Parse the JSON string to get the scheduled events list
    scheduledevents = JSON.parse(scheduledEventsListJson) || [];
	console.log('current scheduledevents:', scheduledevents);
    // Delete all scheduled events from local storage on page load (comment out when not needed)
   /*  localStorage.removeItem('scheduledEventsList'); */

}

// Call the function to load the scheduled events list when the page loads
