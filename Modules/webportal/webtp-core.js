/* function webtpfilterDropdown() {
    var input, filter, dropdown, options, option, i, txtValue;
    input = document.getElementById('filterInput');
    filter = input.value.toUpperCase();
    dropdown = document.getElementById('webtpoptions');
    options = dropdown.getElementsByTagName('option');

    for (i = 0; i < options.length; i++) {
        option = options[i];
        txtValue = option.textContent || option.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
            option.style.display = '';
        } else {
            option.style.display = 'none';
        }
    }
} */
/*------------------------------------------
regular select filter code - html and js  */

		/*regular select filter html
		-----------------------------*/
/*				<select class="webtp" id="eulinkfilter">
					<option value="option0" selected disabled>Select Filter</option>
					<option value="option1">Official M.A.</option>
					<option value="option2">Planetary</option>
					<option value="option3">Forums</option>
					<option value="option4">Information & data</option>
					<option value="option5">Societies</option>
					<option value="option6">Miscelaneous 3rd Party</option>
					<option value="option7">Colonist Services & Content</option>
					<option value="option8">Entropia Creators</option>
					<option value="option99">All</option>
				</select>
*/
/*--------------------------
regular select filter js
---------------------------*/
/*
document.getElementById('eulinkfilter').addEventListener('change', function() {
    var filterValue = this.value;
    var optionsSelect = document.getElementById('webtpoptions');

    // Clear existing options except for the default option
    while (optionsSelect.options.length > 1) {
        optionsSelect.remove(1);
    }

    // Add options based on the selected filter value
    switch (filterValue) {
        case 'option1': // Official M.A.
            optionsSelect.add(new Option('Mindark.com', 'option2'));
            optionsSelect.add(new Option('Entropiauniverse.com', 'option3'));
            optionsSelect.add(new Option('PlanetCalypso.com', 'option4'));
            break;
        case 'option2': // Planetary
            // Add options for Planetary filter
			optionsSelect.add(new Option('PlanetCalypso.com', 'option2'));
            break;
        case 'option3': // Forums
            // Add options for Forums filter
			optionsSelect.add(new Option('forumexampleurl.com', 'option2'));
            break;
        case 'option4': // Information & data
            // Add options for Information & data filter
			optionsSelect.add(new Option('entropiawiki.com.com', 'option2'));
            break;
        case 'option5': // Societies
            // Add options for Societies filter
			optionsSelect.add(new Option('secretuniversalservices.lol', 'option2'));
            break;
        case 'option6': // Miscellaneous 3rd Party
            // Add options for Miscellaneous 3rd Party filter
			optionsSelect.add(new Option('entropiapartners.com', 'option2'));
            break;
        case 'option7': // Colonist Services & Content
            // Add options for Colonist Services & Content filter
			optionsSelect.add(new Option('PlanetCalypso.com', 'option2'));
            break;
        case 'option8': // Entropia Creators
            // Add options for Entropia Creators filter
			optionsSelect.add(new Option('PlanetCalypso.com', 'option2'));
            break;
        case 'option99': // All
            // Add options for All filter
			optionsSelect.add(new Option('PlanetCalypso.com', 'option2'));
            break;
        default:
            // Add default behavior or error handling
            break;
    }
});*/
function Togglewebportal(clickedbutton) {
    var portalcontainer = document.getElementById("webtp");
    var portal = document.getElementById("thewebportal");
    var portalimg = document.getElementById("webportal-image");

    // Toggle the display style of the portal container
    if (portalcontainer.style.width === "50px") {
        portalcontainer.style.width = "350px";
		portalcontainer.style.height = "95%";
		portalcontainer.style.opacity = "1.0";
    } else {
        portalcontainer.style.width = "50px";
		portalcontainer.style.height = "5%";
		portalcontainer.style.opacity = "0.3";
    }

    // Toggle the visibility style of the portal
    if (portal.style.visibility === "hidden") {
        portal.style.visibility = "visible";
		
    } else {
        portal.style.visibility = "";
    }

    // Toggle the opacity style of the portal image
    if (portalimg.style.visibility === "hidden") {
        portalimg.style.visibility = "visible";
    } else {
        portalimg.style.visibility = "hidden";
    }
}
// Function to update the options in the select based on checked checkboxes
function updateWebtpOptions() {
    var optionsSelect = document.getElementById('webtpoptions');
    var checkboxes = document.querySelectorAll('.webtpfilteroptions-container input[type="checkbox"]');

    // Clear existing options except for the default option
    while (optionsSelect.options.length > 1) {
        optionsSelect.remove(1);
    }

    // Loop through checkboxes and add options based on checked checkboxes
    checkboxes.forEach(function(checkbox) {
        if (checkbox.checked) {
            switch (checkbox.value) {
                case 'Official Filter':
                    optionsSelect.add(new Option('Mindark.com', 'option2'));
                    optionsSelect.add(new Option('Entropiauniverse.com', 'option3'));
                    optionsSelect.add(new Option('PlanetCalypso.com', 'option4'));
                    break;
                case 'Planetary Filter':
                    optionsSelect.add(new Option('PlanetCalypso.com', 'option2'));
                    break;
                case 'Forum Filter':
                    optionsSelect.add(new Option('forumexampleurl.com', 'option2'));
                    break;
                case 'Information andData':
                    optionsSelect.add(new Option('entropiawiki.com.com', 'option2'));
                    break;
                case 'No Melee Weapons':
                    optionsSelect.add(new Option('secretuniversalservices.lol', 'option2'));
                    break;
                case 'Misc 3rdparty':
                    optionsSelect.add(new Option('entropiapartners.com', 'option2'));
                    break;
                case 'Colonist Services':
                    optionsSelect.add(new Option('PlanetCalypso.com', 'option2'));
                    break;
                case 'Entropian Creators':
                    optionsSelect.add(new Option('PlanetCalypso.com', 'option2'));
                    break;
                case 'My Favourites':
                    optionsSelect.add(new Option('Pixelb8.lol', 'option2'));
                    break;
                case 'My Portals':
                    optionsSelect.add(new Option('mywebsite.lol', 'option2'));
                    break;
                case 'All Options':
                    optionsSelect.add(new Option('PlanetCalypso.com', 'option2'));
                    break;
                default:
                    // Add default behavior or error handling
                    break;
            }
        }
    });
}






// custom select functionality

// Function to set default colors for all labels
function setDefaultWebtpLabelColors() {
    var filterlabels = document.querySelectorAll('.webtpfilters-option label');
    filterlabels.forEach(function (filterlabel) {
        filterlabel.style.color = '#15627bdb'; // Default text color
    });
}

// Function to set label color based on checkbox state and disabled status
function setWebtpLabelColor(filterlabel, isDisabled, isChecked) {
    if (filterlabel) {
        if (isDisabled) {
            filterlabel.style.color = '#492d2d'; // Red if disabled
			console.log('is disabled:', filterlabel);
        } else {
			console.log('is not disabled:', filterlabel);
            filterlabel.style.color = isChecked ? '#13ca25d4' : '#15627bdb'; // Green if checked, default color if not
			console.log('is checked:', filterlabel);
		}
    }
}

function togglewebtpfilterOptions() {
    var optionsContainer = document.querySelector('.webtpfilteroptions-container');
	var currentWidth = optionsContainer.style.width;
    /* optionsContainer.style.display = optionsContainer.style.display === 'block' ? 'none' : 'block'; */
	optionsContainer.style.width = currentWidth === '135px' ? '0px' : '135px';
	optionsContainer.style.padding === '4px' ? '0px' : '4px';
    // Set default colors when the dropdown is opened
    setDefaultWebtpLabelColors();

    // Get the selected win rule


    // Get all the checkboxes within the options container
    var checkboxes = Array.from(document.querySelectorAll('.webtpfilteroptions-container input[type="checkbox"]'));

    // Loop through checkboxes and disable/enable based on the selected win rule
    checkboxes.forEach(function (checkbox) {
        var filterId = checkbox.id;
        var labelForRule = document.querySelector('label[for="' + filterId + '"]');


        // Change text color of the associated label when checkbox is checked
        checkbox.addEventListener('change', function () {
            if (checkbox.checked && labelForRule) {
                console.log('Checkbox checked:', filterId);
                labelForRule.style.color = '#13ca25d4'; // Adjust color as needed
				console.log('label color affected:', labelForRule, 'current color:', labelForRule.style.color);
            } else if (labelForRule) {
                console.log('Checkbox unchecked:', filterId);
                setWebtpLabelColor(labelForRule, checkbox.disabled);
            }
			updateWebtpOptions();
        });
    });
}
const RoundButts = document.querySelectorAll('.single-round-button');

// Function to toggle single round button style

function togglesingleroundButtonStyle(button) {
    // Change button color and border color
	button.classList.toggle('active');
    button.style.borderColor = (button.style.borderColor === 'rgb(7, 186, 197)') ? '' : '#07bac5';
	button.style.backgroundColor = (button.style.backgroundColor === 'black') ? '#101128f2' : 'black';
}
// Add event listener to each button
RoundButts.forEach(function(button) {
    button.addEventListener('click', function() {
        // Call the togglesingleroundButtonStyle function when the button is clicked
        togglesingleroundButtonStyle(button);
    });
});

function webtpTogglebuttstyle(clickedButton) {

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
    console.log('webtp filter button clicked:', clickedButton);
}
