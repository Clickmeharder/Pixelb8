
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

//temporarily removed
/* 003-,Planetary Filter,PlanetCalypso.com,Planet Calypso,https://planetcalypso.com/images/planetcalypso.png,https://www.planetcalypso.com/,the official planet calypso website
003-,Planetary Filter,Calypsomap.com,Calypso Map,https://calypsomap.com/images/planetcalypsomap.png,https://www.calypsomap.com/, an interactive map of calypso
004-,Planetary Filter,PlanetArkadia.com,Planet Arkadia,http://planetarkadia.com/images/planetarkadia.png,http://planetarkadia.com/,the official planet arkadia website
004-,Planetary Filter,cyrenesecrets.com,Cyrene Secrets,https://cyrenesecrets.com/wp-content/uploads/2015/02/factions-150x150.jpg,https://cyrenesecrets.com/,Planet Cyrene Secrets of Entropia Universe MMORPG.
004-,Planetary Filter,rocktropia.com, Rocktropia,https://rocktropia.com/images/planetcalypso.png,https://rocktropia.com/,ROCKtropia is an MMORPG & Virtual World Hybrid that is shaping the future of Virtual Reality. The dawn of the Massively Multiplayer Online Game Era is upon us ...
004-,Planetary Filter,virtualsense.eu,Virtualsense,https://virtualsense.eu/images/virtualsense.png,https://virtualsense.eu/,Virtualsense is a company operating and marketing two destinations in Entropia Universe. Planet Toulan and Monria Moon
004-,Planetary Filter,NextIsland.com,Next Island,https://nextisland.com/images/nextisland.png,https://nextisland.com/,the official website for Next Island a lush tropical planet teeming with life
004-,Planetary Filter,foma-asteroid.com,F.O.M.A Asteroid,https://foma-asteroid.com/images/foma-asteroid.png,https://foma-asteroid.com, Discover FOMA - Asteroid from Entropia Universe. Hunt, mine in 20 biomes and visit more than 50+ player owned shops.

 */
const webportalcsvData = `Idnumber,Category,Option,Website Title,Image URL,Website URL, Description
001-,Official Filter,Mindark.com,Mindark,https://example.com/images/mindark.png,https://www.mindark.com/,Mindark develops, maintains and promotes the online game Entropia Universe - a unique Metaverse with a Real Cash Economy.
002-,Official Filter,Entropiauniverse.com,Entropia Universe,https://example.com/images/entropiauniverse.png,https://www.entropiauniverse.com/,The official Entropia Universe website owned and opterated by Mindark
003-,PP Filter,PlanetCalypso.com,Planet Calypso,https://example.com/images/planetcalypso.png,https://www.planetcalypso.com/,the official planet calypso website
003-,PP Filter,PlanetArkadia.com,Planet Arkadia,http://planetarkadia.com/images/planetarkadia.png,http://planetarkadia.com/,the official planet arkadia website
003-,PP Filter,cyrenesecrets.com,Cyrene Secrets,https://cyrenesecrets.com/wp-content/uploads/2015/02/factions-150x150.jpg,https://cyrenesecrets.com/,Planet Cyrene Secrets of Entropia Universe MMORPG.
003-,PP Filter,virtualsense.eu,Virtualsense,https://virtualsense.eu/images/virtualsense.png,https://virtualsense.eu/,Virtualsense is a company operating and marketing two destinations in Entropia Universe. Planet Toulan and Monria Moon
004-,PP Filter,rocktropia.com, Rocktropia,https://rocktropia.com/images/planetcalypso.png,https://rocktropia.com/,ROCKtropia is an MMORPG & Virtual World Hybrid that is shaping the future of Virtual Reality. The dawn of the Massively Multiplayer Online Game Era is upon us ...
004-,PP Filter,NextIsland.com,Next Island,https://nextisland.com/images/nextisland.png,https://nextisland.com/,the official website for Next Island a lush tropical planet teeming with life
004-,PP Filter,foma-asteroid.com,F.O.M.A Asteroid,https://foma-asteroid.com/images/foma-asteroid.png,https://foma-asteroid.com, Discover FOMA - Asteroid from Entropia Universe. Hunt, mine in 20 biomes and visit more than 50+ player owned shops.
003-,default Option,example.com,example site,https://imgurl.com/img/siteimg.png,https://www.site.com/,type description


005-,Forum Filter,planetcalypsoforum.com,Forum Example,https://www.planetcalypsoforum.com/images/forumexample.png,https://https://www.planetcalypsoforum.com/,PlanetCalypsoForum.com - Official forum for Planet Calypso, a real-cash MMORPG within Entropia Universe.
005-,Forum Filter,arkadiaforum.com,Ark Forum,http://arkadiaforum.com/images/forumexample.png,http://arkadiaforum.com/,Official Forum for Planet Arkadia : www.planetarkadia.com
005-,Forum Filter,cyreneforum.com,Cyrene Forum,http://cyreneforum.com/images/forumexample.png,http://cyreneforum.com/,this is the forum example description
005-,Forum Filter,forum.entropiapartners.com,Entropia Partners Forum,http://forum.entropiapartners.com/images/forumexample.png,http://forum.entropiapartners.com/,Earn Entropia Universe PED & Second Life Linden Dollars. Instant pay out. Free for all Entropia Universe colonists, 
005-,Forum Filter,forum.nextisland.com,N.I. Forum,https://forum.nextisland.com/images/forumexample.png,https://forum.nextisland.com/,See Next Island news, updates, release notes and more. All official announcements are here.

003-,Tools Filter,Calypsomap.com,Calypso Map,https://calypsomap.com/images/planetcalypsomap.png,https://www.calypsomap.com/, an interactive map of calypso

003-,Maps Filter,Calypsomap.com,Calypso Map,https://calypsomap.com/images/planetcalypsomap.png,https://www.calypsomap.com/, an interactive map of calypso
003-,Maps Filter,Space.Calypsomap.com,Space.CalypsoMap,https://space.calypsomap.com/images/spacemap.png,https://www.space.calypsomap.com/, an interactive space map of entropia universe
003-,Maps Filter,absoluteyanythingelse.com/index,AbsolutelyAnythignElse,https://absolutelyanythingelse.com/img/siteimg.png,https://absolutelyanythingelse.com/,Absolutelyanythingelse.com and Eu maps - © Anny Divine Thundergirl - with the collaboration of Monria CoMOONity - Oooeeeoooahah tingtang wallawalabingbang
003-,Maps Filter,absoluteyanythingelse.com/entropiaspacemap,AAE Eu Space Map,https://absolutelyanythingelse.com/entropiaspacemap/img/siteimg.png,https://absolutelyanythingelse.com/entropiaspacemap/, An Interactive space map By absolutelyanythingelse.com Most of the items in the map are interactive - In chrome press Ctrl f5 to clear cache for updates. 
003-,Maps Filter,absoluteyanythingelse.com/monria-map,AAE Monria Map,https://absolutelyanythingelse.com/monria-map/img/siteimg.png,https://absolutelyanythingelse.com/monria-map/, An Interactive space map By absolutelyanythingelse.com Most of the items in the map are interactive - In chrome press Ctrl f5 to clear cache for updates. 
003-,Maps Filter,absoluteyanythingelse.com/toulan-map,AAE Toulan Map,https://absolutelyanythingelse.com/toulan-map/img/siteimg.png,https://absolutelyanythingelse.com/toulan-map/, An Interactive space map By absolutelyanythingelse.com Most of the items in the map are interactive - In chrome press Ctrl f5 to clear cache for updates. 
003-,Maps Filter,bit.ly/arkspreadsheet,The Ark sheet,https://example.com/images/entropiawiki.png,https://bit.ly/arkspreadsheet, a must see for any colonist on arkadia full of great information and maps regarding missions, mob, mining and instances.
003-,Maps Filter,planetarkadia.com/ifn-map-oratan-prospector-map,Top Secret Ifn Map,http://planetarkadia.com/wp-content/uploads/2014/11/Oratan_Prospector.jpg,http://planetarkadia.com/ifn-map-oratan-prospector-map/, Join the Ifn.
003-,Maps Filter,cyrenesecrets.com/map,CyreneSecrets Map,https://cyrenesecrets.com/map/img/siteimg.png,https://cyrenesecrets.com/map/,Interactive map of Cyrene, Probably the most well put together interactive Entropia map by Thanatos with locations of shops, mobs, Teleports, Missions, and areas!



003-,Maps Filter,example.com,example site,https://imgurl.com/img/siteimg.png,https://www.site.com/,type description

006-,Information andData,entropiawiki.com,Entropia Wiki,https://example.com/images/entropiawiki.png,https://www.entropiawiki.com/,this is the entropia wiki... its poop.
007-,Information andData,nihelper.com, N.I. Helper,https://www.nihelper.com/images/nihelper.png,https://www.nihelper.com/, NI Helper is a site built solely to share information about Next Island, mob maps, missions and more in one handy site.
007-,Information andData,bit.ly/arkspreadsheet, The Ark sheet,https://example.com/images/entropiawiki.png,https://bit.ly/arkspreadsheet, a must see for any colonist on arkadia full of great information and maps regarding missions, mob, mining and instances.
007-,Information andData,Entropiahub.com,https://entropiahub.com/images/entropiaehub.png,https://entropiahub.com, Entropia Hub. Entropia Universe general information - filled with useful tools to help every entropian players
007-,Information andData,bit.ly/arkspreadsheet, The Ark sheet,https://example.com/images/entropiawiki.png,https://bit.ly/arkspreadsheet, a must see for any colonist on arkadia full of great information and maps regarding missions, mob, mining and instances.

008-,Societies,secretuniversalservices.lol,Secret Universal Services,https://example.com/images/secretuniversalservices.png,https://www.secretuniversalservices.lol/,The S.u.S Society website

009-,Misc 3rdparty,entropiapartners.com,Entropia Partners,https://example.com/images/entropiapartners.png,https://www.entropiapartners.com/,Earn Linden dollars & PED (Project Entropia Dollars). Fast pay outs. We are operating since 2012 and have distributed more than 1.5 million dollars worth ...
009-,Misc 3rdparty,entropialife.com,Entropia Life,http://www.entropialife.com/images/entropialife.png,http://www.entropialife.com/,EntropiaLife is an automated service that will provide you with valuable information about loot statistics inside the Entropia Universe.
009-,Misc 3rdparty,entropiaplanets.com,Entropia Planets,http://entropiaplanets.com/images/entropiaplanets.png,http://entropiaplanets.com/,Entropia Universe forum, news, wiki, media, tools
009-,Misc 3rdparty,earnped.com,EarnPed,https://earnped.com/images/earnped.png,https://earnped.com/, You can earn PED by watching videos or completing offers! Earn PED members also qualify for events and much more!
009-,Misc 3rdparty,https://pedflow.com,PEDflow,https://pedflow.com/images/pedflow.png,https://pedflow.com/,Earn PED with a fast growing free PED community, PEDflow! Get help with the game, earn and more!

010-,Colonist Services,,example.com,example site,https://imgurl.com/img/siteimg.png,https://www.site.com/,type description
010-,Colonist Services,example.com,example site,https://imgurl.com/img/siteimg.png,https://www.site.com/,type description
010-,Colonist Services,example.com,example site,https://imgurl.com/img/siteimg.png,https://www.site.com/,type description

011-,Entropian Creators,PlanetCalypso.com,Planet Calypso,https://example.com/images/planetcalypso.png,https://www.planetcalypso.com/,yet another example website description

012-,My Favourites,Pixelb8.lol,Pixelb8,https://example.com/images/pixelb8.png,https://pixelb8.lol/,your already on this page. but you can still go there from here isnt that fantastic?

013-,My Portals,mywebsite.lol,My Website,https://example.com/images/mywebsite.png,https://www.mywebsite.com/another example website description`;
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
		const [id, category, option, title, imageUrl, websiteUrl, description] = row.split(',');
		checkboxes.forEach(checkbox => {
			if (checkbox.checked && checkbox.value === category) {
				const optionElement = new Option(title, websiteUrl);
				optionElement.setAttribute('data-image-url', imageUrl);
				optionElement.setAttribute('data-description', description);
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
	var portaldetailswindow = document.getElementById('portaldestinationDetails');

    // Get the title, image URL, and website URL from the selected option's data attributes
    var title = selectedOption.innerText;
    var imageUrl = selectedOption.getAttribute('data-image-url');
	var portaldescription = selectedOption.getAttribute('data-description');
    var websiteUrl = selectedOption.value; // Assuming the value of the option is the website URL

    // Update the title text and image based on the selected option
    portalLinktitle.innerText = title;
    webportalImage.style.backgroundImage = "url('" + imageUrl + "')";
	portaldetailswindow.innerText = portaldescription;
	console.log('selected portal description:', portaldescription);
    // Update the href link of the anchor element inside webportal-image
    var webportalLink = document.querySelector('#thewebportal a');
    if (webportalLink) {
        webportalLink.href = websiteUrl; // Update the href attribute of the anchor element
    } else {
        console.error('Anchor element inside webportal-image not found.');
    }
}

// Function to toggle the styles of #portaldestinationDetails
function toggledestinationdetails(clickedbutton) {
    var portalDetails = document.getElementById('portaldestinationDetails');
	console.log('Button clicked', clickedbutton);
    // Check if the button is activated (has a specific class or attribute)
    if (clickedbutton.classList.contains('activated')) {
        // If activated, remove the activated class and reset styles
        console.log('webtpdetails butt smacked: Portal Details De-activated');
        clickedbutton.classList.remove('activated');
        portalDetails.style.maxWidth = '174px';
        portalDetails.style.marginLeft = '146px';
        // Reset button color and border
        clickedbutton.style.color = '#ffac00a1';
        clickedbutton.style.borderColor = '#ffac00a1';
    } else {
        // If not activated, add the activated class and apply styles
        console.log('webtpdetails butt smacked: Portal Details Activated');
        clickedbutton.classList.add('activated');
        portalDetails.style.maxWidth = '132px';
        portalDetails.style.marginLeft = '4px';
        // Change button color and border
        clickedbutton.style.color = '#444'; // Adjust color as needed
        clickedbutton.style.borderColor = '#333'; // Adjust border color as needed
    }
}
// Event listener for option select
document.getElementById('webtpoptions').addEventListener('change', Updatewebportal);