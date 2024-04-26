// Get the image element
const mapImage = document.getElementById("mapimage");

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

// Initialize current map index
let currentMapIndex = 0;

// Function to cycle through planet maps
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




//map dragging logic 

// Select the draggable map element
const draggableMap = document.querySelector('.draggable-map');

// Initialize variables
let isDraggingMap = false;
let startX;
let startY;
let mapOffsetX;
let mapOffsetY;

// Event handlers for mouse down, move, and up
const handleMapMouseDown = (e) => {
    isDraggingMap = true;

    // Calculate the offset between the mouse click position and the map's top-left corner
    const rect = draggableMap.getBoundingClientRect();
    startX = e.clientX - rect.left;
    startY = e.clientY - rect.top;

    mapOffsetX = draggableMap.offsetLeft;
    mapOffsetY = draggableMap.offsetTop;

    // Add grabbing cursor style
    draggableMap.style.cursor = 'grabbing';
};

const handleMapMouseMove = (e) => {
    if (!isDraggingMap) return;

    e.preventDefault(); // Prevent text selection while dragging

    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Calculate the new position
    const newLeft = mapOffsetX + deltaX;
    const newTop = mapOffsetY + deltaY;

    // Update the position
    draggableMap.style.left = newLeft + 'px';
    draggableMap.style.top = newTop + 'px';

    // Add grabbing cursor style
    draggableMap.style.cursor = 'grabbing';
};

const handleMapMouseUp = () => {
    isDraggingMap = false;
    draggableMap.style.cursor = 'grab'; // Reset cursor to grab
};

// Attach event listeners to the map
draggableMap.addEventListener('mousedown', handleMapMouseDown);
document.addEventListener('mousemove', handleMapMouseMove);
document.addEventListener('mouseup', handleMapMouseUp);