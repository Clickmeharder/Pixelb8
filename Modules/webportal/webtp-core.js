
function Togglewebportal(clickedbutton) {
    var portalcontainer = document.getElementById("webtp");
    var portal = document.getElementById("thewebportal");
    var portalimg = document.getElementById("webportal-image");
	var activatebutton = document.getElementById("Openwebportal");

    // Toggle the display style of the portal container
    if (portalcontainer.style.width === "50px") {
        portalcontainer.style.width = "350px";
		portalcontainer.style.height = "95%";
		portalcontainer.style.opacity = "1.0";
		activatebutton.style.color = "green";
		activatebutton.style.borderStyle = "ridge";
		activatebutton.style.borderColor = "#2a7d19ed";
		
    } else {
        portalcontainer.style.width = "50px";
		portalcontainer.style.height = "5%";
		portalcontainer.style.opacity = "0.3";
		activatebutton.style.color = "inherit";
		activatebutton.style.borderStyle = "ridge";
		activatebutton.style.borderColor = "#111";
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

// Define CSV data as a string
const webportalcsvData = `Category,Option,Website Title,Image URL,Website URL
Official Filter,Mindark.com,Mindark,https://example.com/images/mindark.png,https://www.mindark.com/
Official Filter,Entropiauniverse.com,Entropia Universe,https://example.com/images/entropiauniverse.png,https://www.entropiauniverse.com/
Official Filter,PlanetCalypso.com,Planet Calypso,https://example.com/images/planetcalypso.png,https://www.planetcalypso.com/
Planetary Filter,PlanetCalypso.com,Planet Calypso,https://example.com/images/planetcalypso.png,https://www.planetcalypso.com/
Forum Filter,forumexampleurl.com,Forum Example,https://example.com/images/forumexample.png,https://www.forumexample.com/
Information andData,entropiawiki.com.com,Entropia Wiki,https://example.com/images/entropiawiki.png,https://www.entropiawiki.com/
Societies,secretuniversalservices.lol,Secret Universal Services,https://example.com/images/secretuniversalservices.png,https://www.secretuniversalservices.lol/
Misc 3rdparty,entropiapartners.com,Entropia Partners,https://example.com/images/entropiapartners.png,https://www.entropiapartners.com/
Colonist Services,PlanetCalypso.com,Planet Calypso,https://example.com/images/planetcalypso.png,https://www.planetcalypso.com/
Entropian Creators,PlanetCalypso.com,Planet Calypso,https://example.com/images/planetcalypso.png,https://www.planetcalypso.com/
My Favourites,Pixelb8.lol,Pixelb8,https://example.com/images/pixelb8.png,https://pixelb8.lol/
My Portals,mywebsite.lol,My Website,https://example.com/images/mywebsite.png,https://www.mywebsite.com/`;
// Function to update the options based on checkboxes and CSV data
function updateWebtpOptions() {
    var optionsSelect = document.getElementById('webtpoptions');
    var checkboxes = document.querySelectorAll('.webtpfilteroptions-container input[type="checkbox"]');
    
    // Clear existing options except for the default option
    while (optionsSelect.options.length > 1) {
        optionsSelect.remove(1);
    }

    // Parse CSV data
    const rows = webportalcsvData.split('\n').slice(1); // Skip header row
	rows.forEach(row => {
		const [category, option, title, imageUrl, websiteUrl] = row.split(',');
		checkboxes.forEach(checkbox => {
			if (checkbox.checked && checkbox.value === category) {
				const optionElement = new Option(title, websiteUrl);
				optionElement.setAttribute('data-image-url', imageUrl); // Store image URL as a data attribute
				optionsSelect.add(optionElement);
			}
		});
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

function Updatewebportal() {
    var selectedOption = document.getElementById('webtpoptions').options[document.getElementById('webtpoptions').selectedIndex];
    var portalLinktitle = document.getElementById('portalLinktitle');
    var webportalImage = document.getElementById('webportal-image');

    // Get the title, image URL, and website URL from the selected option's data attributes
    var title = selectedOption.innerText;
    var imageUrl = selectedOption.getAttribute('data-image-url');
    var websiteUrl = selectedOption.value; // Assuming the value of the option is the website URL

    // Update the title text and image based on the selected option
    portalLinktitle.innerText = title;
    webportalImage.style.backgroundImage = "url('" + imageUrl + "')";

    // Update the href link of the anchor element inside webportal-image
    var webportalLink = document.querySelector('#thewebportal a');
    if (webportalLink) {
        webportalLink.href = websiteUrl; // Update the href attribute of the anchor element
    } else {
        console.error('Anchor element inside webportal-image not found.');
    }
}

// Event listener for option select
document.getElementById('webtpoptions').addEventListener('change', Updatewebportal);
