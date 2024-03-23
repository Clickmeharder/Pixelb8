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
});







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
        });
    });
}

