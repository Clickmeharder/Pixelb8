// Get the image element
const mapImage = document.getElementById("mapimgwrapper");

// Get the scale factor for zooming
let scaleFactor = 1;

// Function to handle zooming in
document.getElementById("maps-scale-up-btn").addEventListener("click", function() {
    scaleFactor += 0.1;
    mapImage.style.transform = `scale(${scaleFactor})`;
});

// Function to handle zooming out
document.getElementById("maps-scale-down-btn").addEventListener("click", function() {
    scaleFactor -= 0.1;
    mapImage.style.transform = `scale(${scaleFactor})`;
});
/* planets we dont have maps for yet:*/
	/*     "../../Modules/globemaps/space/spacemap.png",
    "../../Modules/globemaps/thule/thulemap.png", */
/*     "../../Modules/globemaps/monria/monriamap.png",
    "../../Modules/globemaps/dsec_mom/dsec_mommap.png", */
// Array containing URLs of map images for each planet
const planetMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
	"../../Modules/globemaps/rocktropia/PlanetRocktropiamap.jpg",
    "../../Modules/globemaps/cyrene/PlanetCyrenemap.jpg",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
];
const arkadiaMaps = [
    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
	"../../Modules/globemaps/arkadia/arkadialabelledmap.png",
	"../../Modules/globemaps/arkadia/arkmobmapbase.png",
    "../../Modules/globemaps/arkadia/planetarkadiaglobe/newnormalmap.png",
	"../../Modules/globemaps/arkadia/planetarkadiaglobe/newspecularmap.png",
	"../../Modules/globemaps/arkadia/planetarkadiaglobe/occlusionmap.png"
];
/* const arkmoonMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
];

const arkugMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
];
const calypsoMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
];
const monriaMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
];
const dsecmomMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
];
const cyreneMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
];
const toulanMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
];
const rocktropianMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
];
const hellMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
];
const huntthethingMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
];
const secretislandMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
];
const nextislandMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
];
const ancientgreeceMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/PlanetCalypsomap.jpg"
]; */



// Initialize current map index
let currentMapIndex = 0;
let currentModeIndex = 0;
//Planet Cycle Function 
function cyclemapPlanet() {
    // Increment current map index
    currentMapIndex++;
    // Check if current map index exceeds the length of the array
    if (currentMapIndex >= planetMaps.length) {
        currentMapIndex = 0; // Reset to the first map if exceeds length
    }
    // Update the src attribute of the map image with the new map URL
    document.getElementById("mapimage").src = planetMaps[currentMapIndex];
}
function cyclemapMode() {
    // Increment current map index
    currentModeIndex++;
    // Check if current map index exceeds the length of the array
    if (currentModeIndex >= planetMaps.length) {
        currentModeIndex = 0; // Reset to the first map if exceeds length
		console.log('currentMapIndex/currentModeIndex:'+ currentMapIndex + "/" + currentModeIndex );
    }
    // Update the src attribute of the map image with the new map URL
	console.log('cycle button clicked');
    document.getElementById("mapimage").src = arkadiaMaps[currentModeIndex];
}
//Map Toggle Functions

function toggleTPmap() {
    // Get the map overlay image element
    const mapOverlay = document.getElementById("tpmap-overlay");

    // Toggle the visibility of the map overlay
    if (mapOverlay.style.display === "none") {
        mapOverlay.style.display = "block";
    } else {
        mapOverlay.style.display = "none";
    }
}

function toggleMobmap() {
    // Get the mob overlay image element
    const mobOverlay = document.getElementById("mob-overlay");

    // Toggle the visibility of the mob overlay
    if (mobOverlay.style.display === "none" || mobOverlay.style.display === "") {
        mobOverlay.style.display = "block";
    } else {
        mobOverlay.style.display = "none";
    }
}

function togglelandareas() {
    // Get the land areas overlay element
    const landAreasOverlay = document.getElementById("landareas-overlay");

    // Toggle the visibility of the land areas overlay
    if (landAreasOverlay.style.display === "none" || landAreasOverlay.style.display === "") {
        landAreasOverlay.style.display = "block";
    } else {
        landAreasOverlay.style.display = "none";
    }
}

function togglePvPzones() {
    // Get the PvP zones overlay element
    const pvpZonesOverlay = document.getElementById("pvpzones-overlay");

    // Toggle the visibility of the PvP zones overlay
    if (pvpZonesOverlay.style.display === "none" || pvpZonesOverlay.style.display === "") {
        pvpZonesOverlay.style.display = "block";
    } else {
        pvpZonesOverlay.style.display = "none";
    }
}


//MAP DRAGGING EVENTLISTENER FUNCTIONS

var mapImgWrapper = document.getElementById('mapimgwrapper');
var isDragging = false;
var startX, startY;
var offsetX = 0, offsetY = 0;

mapImgWrapper.addEventListener('mousedown', function(e) {
    e.preventDefault(); // Prevent default behavior
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    mapImgWrapper.style.cursor = 'grabbing';
});

document.addEventListener('mousemove', function(e) {
    if (isDragging) {
        var deltaX = e.clientX - startX;
        var deltaY = e.clientY - startY;
        startX = e.clientX;
        startY = e.clientY;

        offsetX += deltaX;
        offsetY += deltaY;

        mapImgWrapper.style.left = offsetX + 'px';
        mapImgWrapper.style.top = offsetY + 'px';
    }
});

document.addEventListener('mouseup', function() {
    isDragging = false;
    mapImgWrapper.style.cursor = 'grab';
});


//way point logic
// Function to create a waypoint element with specified ID and info
function createWaypoint(id, info) {
    const waypoint = document.createElement('div');
    waypoint.classList.add('waypoint');
    waypoint.id = id;
    waypoint.setAttribute('data-info', info);
    waypoint.style.top = '50px'; // Adjust as needed for cluster positioning
    waypoint.style.left = '100px'; // Adjust as needed for cluster positioning
    return waypoint;
}

// Function to add waypoints to the map
function addWaypoints() {
    const mapWrapper = document.getElementById('mapimgwrapper');

    // Add each waypoint to the map
    for (let i = 1; i <= 68; i++) {
        const id = 'waypoint' + i;
        const info = 'Info ' + i;
        const waypoint = createWaypoint(id, info);
        mapWrapper.appendChild(waypoint);
    }
}

// Call the function to add waypoints
addWaypoints();

// Get all waypoint elements
const waypoints = document.querySelectorAll('.waypoint');

// Add event listeners for hover and click
waypoints.forEach(waypoint => {
    waypoint.addEventListener('mouseover', function() {
        // Show info on hover
        showInfo(waypoint);
    });

    waypoint.addEventListener('mouseout', function() {
        // Hide info on hover out
        hideInfo(waypoint);
    });

    waypoint.addEventListener('click', function() {
        // Show detailed info on click
        showDetailedInfo(waypoint);
    });
});

// Function to show info on hover
function showInfo(waypoint) {
    const info = waypoint.getAttribute('data-info');
    // Show info tooltip or effect
    console.log(info); // Example: Output info to console
}

// Function to hide info on hover out
function hideInfo(waypoint) {
    // Hide info tooltip or effect
    console.log('Hide info'); // Example: Output info to console
}

// Function to show detailed info on click
function showDetailedInfo(waypoint) {
    const info = waypoint.getAttribute('data-info');
    // Show detailed info modal or popup
    alert(info); // Example: Show info in alert box
}