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
    "../../Modules/globemaps/arkadia/newnormalmap.png",
	"../../Modules/globemaps/arkadia/newspecularmap.png"
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

/* MAP WAYPOINTS*/
const arkadiawaypointsArray = [
/*ml*/	{ id: '8 Coins HQ', info: '/wp [Planet Arkadia, 12074, 20716, 100, 8 Coins HQ]', top: '900px', left: '250px' },
/*ml*/	{ id: '8 Coins Town', info: '/wp [Planet Arkadia, 15360, 23100, 100, 8 Coins Town]', top: '900px', left: '250px' },
/*ml*/	{ id: '8 Coins Windy Isles', info: '/wp [Planet Arkadia, 9280, 22340, 100, 8 Coins Windy Isles]', top: '900px', left: '250px' },
/*mt*/	{ id: 'Aakas', info: '/wp [Planet Arkadia, 11180, 9775, 100, Aakas]', top: '999px', left: '50px' },
/*bm*/	{ id: 'BIG Industries ALA#05', info: '/wp [Planet Arkadia, 19020, 9046, 100, BIG Ind. LA#05]', top: '53px', left: '8px' },
/*br*/	{ id: 'Celeste Harbour', info: '/wp [Planet Arkadia, 29852, 10176, 100, Celeste Harbour]', top: '53px', left: '8px' },
/*br*/	{ id: 'Celeste Harbour Military HQ', info: '/wp [Planet Arkadia, 30120, 10015, 100, Celeste Harbour Military HQ]', top: '53px', left: '8px' },
/*br*/	{ id: 'Celeste Harbour North', info: '/wp [Planet Arkadia, 30025, 10336, 100, Celeste Harbour N.]', top: '53px', left: '8px' },
/*br*/	{ id: 'Celeste Harbour South', info: '/wp [Planet Arkadia, 29779, 9873, 100, Celeste Harbour S.]', top: '53px', left: '8px' },
/*br*/	{ id: 'Celeste Outpost', info: '/wp [Planet Arkadia, 27258, 10952, Celeste Outpost]', top: '53px', left: '8px' },
/*br*/	{ id: 'Celeste Quarry', info: '/wp [Planet Arkadia, 31186, 9540, 100, Celeste Quarry]', top: '53px', left: '8px' },
/*tl*/	{ id: 'Cheetah Digsite', info: '/wp [Planet Arkadia, 10952, 26068, 100, Cheetah Digsite]', top: '53px', left: '8px' },
/*tl*/	{ id: 'Courageous Firebase', info: '/wp [Planet Arkadia, 15169, 25742, 100, Courageous Firebase]', top: '53px', left: '8px' },
/*tl*/	{ id: 'Courageous Firebase Acadamy', info: '/wp [Planet Arkadia, 15652, 25651, 100, Courageous Firebase Academy]', top: '53px', left: '8px' },
/*tm*/	{ id: 'Cyclone Point', info: '/wp [Planet Arkadia, 18559, 31468, 100, Cyclone Point]', top: '53px', left: '8px' },
/*mm*/	{ id: 'Dauntless Firebase', info: '/wp [Planet Arkadia, 20268, 17436, 100, Dauntless Firebase]', top: '53px', left: '8px' },
/*mm*/	{ id: 'Dauntless Firebase Acadamy', info: '/wp [Planet Arkadia, 21270, 17310, 100, Dauntless Firebase Academy]', top: '53px', left: '8px' },
/*mm*/	{ id: 'Dependable Firebase', info: '/wp [Planet Arkadia, 27411, 25171, 100, Dependable Firebase]', top: '53px', left: '8px' },
/*mm*/	{ id: 'Dependable Firebase Academy', info: '/wp [Planet Arkadia, 27055, 25346, 100, Dependable Firebase Academy]', top: '53px', left: '8px' },
/*ml*/	{ id: 'Falcon Digsite', info: '/wp [Planet Arkadia, 12249, 13988, 100, Falcon Digsite]', top: '53px', left: '8px' },
/*mm*/	{ id: 'Fearless Firebase', info: '/wp [Planet Arkadia, 25571, 15163, 100, Fearless Firebase]', top: '53px', left: '8px' },
/*mm*/	{ id: 'Fearless Firebase Academy', info: '/wp [Planet Arkadia, 25324, 15537, 100, Fearless Firebase Academy]', top: '53px', left: '8px' },
/*mt*/	{ id: 'Formidable Firebase', info: '/wp [Planet Arkadia, 21948, 25341, 100, Formidable Firebase]', top: '53px', left: '8px' },
/*mt*/	{ id: 'Formidable Firebase Academy', info: '/wp [Planet Arkadia, 21347, 25275, 100, Formidable Firebase Academy]', top: '53px', left: '8px' },
/*mr*/	{ id: 'Fuel Depot', info: '/wp [Planet Arkadia, 32198, 13303, 100, Fuel Depot]', top: '53px', left: '8px' },
/*bm*/	{ id: 'Harrier Site', info: '/wp [Planet Arkadia, 15435, 10143, 100, Harrier Site]', top: '53px', left: '8px' },
/*bl*/	{ id: 'Hawk Digsite', info: '/wp [Planet Arkadia, 10068, 13960, 100, Hawk Digsite]', top: '53px', left: '8px' },
/*mr*/	{ id: 'IFN Supply Depot', info: '/wp [Planet Arkadia, 29984, 17847, 100, IFN Supply Depot]', top: '53px', left: '8px' },
/*mm*/	{ id: 'Implacable Firebase', info: '/wp [Planet Arkadia, 28168, 21960, 100, Implacable Firebase]', top: '53px', left: '8px' },
/*tl*/	{ id: 'Indomitable Firebase East', info: '/wp [Planet Arkadia, 10636, 30162, 100, Indomitable FB-East]', top: '182px', left: '141px' },
/*tl*/	{ id: 'Indomitable Firebase West', info: '/wp [Planet Arkadia, 10409, 30116, 100, Indomitable FB-West]', top: '53px', left: '8px' },
/*bl*/	{ id: 'Kestral Digsite', info: '/wp [Planet Arkadia, 14469, 12603, 100, Kestral Digsite]', top: '53px', left: '8px' },
/*tl*/	{ id: 'Khorum Coast', info: '/wp [Planet Arkadia, 9100, 27404, 100, Khorum Coast]', top: '53px', left: '8px' },
/*mm*/	{ id: 'Machinery Plant', info: '/wp [Planet Arkadia, 20546, 21850, 100, Machinery Plant]', top: '53px', left: '8px' },
/*tr*/	{ id: 'Mamba Digsite', info: '/wp [Planet Arkadia, 26448, 28365, 100, Mamba Digsite]', top: '53px', left: '8px' },
/*tm*/	{ id: 'Miltons Crest', info: '/wp [Planet Arkadia, 20208, 28304, 100, Milton`s Crest]', top: '53px', left: '8px' },
/*tm*/	{ id: 'Moshanes Legacy', info: '/wp [Planet Arkadia, 23822, 27840, 100, Machone`s Legacy]', top: '53px', left: '8px' },
/*bl*/	{ id: 'Mutation Station', info: '/wp [Planet Arkadia, 9728,9781, 100, Mutation Station]', top: '53px', left: '8px' },
/*mr*/	{ id: 'New Arrivals Hangar', info: '/wp [Planet Arkadia, 30315, 17968, 100, New Arrivals Hangar]', top: '53px', left: '8px' },
/*tr*/	{ id: 'Nursery', info: '/wp [Planet Arkadia, 28872, 24347, 100, Nursery]', top: '53px', left: '8px' },
/*tr*/	{ id: 'Ocean Lookout', info: '/wp [Planet Arkadia, 31869, 20021, 100, Ocean Lookout]', top: '53px', left: '8px' },
/*mm*/	{ id: 'Redoubtable Firebase', info: '/wp [Planet Arkadia, 23232, 21798, 100, Redoubtable Firebase]', top: '53px', left: '8px' },
/*mm*/	{ id: 'Refinery', info: '/wp [Planet Arkadia, 25584, 18613, 100, Refinery]', top: '53px', left: '8px' },
/*bm*/	{ id: 'Relentless Firebase', info: '/wp [Planet Arkadia, 23892, 9325, 100, Relentless Firebase]', top: '53px', left: '8px' },
	
	
/*bm*/	{ id: 'Relentless Firebase Academy', info: '/wp [Planet Arkadia, 23620, 9725, 100, Relentless Firebase Academy]', top: '53px', left: '8px' },
/*bl*/	{ id: 'Repulse Firebase', info: '/wp [Planet Arkadia, 14987, 15117, 100, Repulse Firebase]', top: '53px', left: '8px' },
/*bl*/	{ id: 'Repulse Firebase Academy', info: '/wp [Planet Arkadia, 14787, 15650, 100, Repulse Firebase Academy]', top: '53px', left: '8px' },
/*mr*/	{ id: 'Resolute Firebase', info: '/wp [Planet Arkadia, 30044, 17486, 100, Resolute Firebase]', top: '53px', left: '8px' },
/*mbbl*/	{ id: 'Robot Factory', info: '/wp [Planet Arkadia, 21654, 13796, 100, Robot Factory]', top: '53px', left: '8px' },
/*tm*/	{ id: 'Sanctuary Cove', info: '/wp [Planet Arkadia, 20409, 29956, 100, Sanctuary Cove]', top: '53px', left: '8px' },
/*bl*/	{ id: 'Scrap Yard', info: '/wp [Planet Arkadia, 10882, 10712, 100, Scrap Yard]', top: '53px', left: '8px' },
/*Tl*/	{ id: 'Sentosas Reach LA#4', info: '/wp [Planet Arkadia, 14824, 32282, 100, Sentosa`s Reach]', top: '54px', left: '389px' },
/*tr*/	{ id: 'Songkra Valley', info: '/wp [Planet Arkadia, 32488, 26165, 100, Songkra Valley]', top: '53px', left: '8px' },
/*tm*/	{ id: 'Storms Keep', info: '/wp [Planet Arkadia, 23207, 31416, 100, Storm`s Keep]', top: '53px', left: '8px' },
/*tr*/	{ id: 'Taipan Digsite', info: '/wp [Planet Arkadia, 30821, 27080, 100, Taipan Digsite]', top: '53px', left: '8px' },
/*br*/	{ id: 'Timber Mill', info: '/wp [Planet Arkadia, 28204, 13549, 100, Timber Mill]', top: '53px', left: '8px' },
/*mlm*/	{ id: 'Valiant Firebase', info: '/wp [Planet Arkadia, 17212, 23092, 100, Valiant Firebase]', top: '53px', left: '8px' },
/*blm*/	{ id: 'Victorious Firebase', info: '/wp [Planet Arkadia, 18528, 10362, 100, Victorious Firebase]', top: '53px', left: '8px' }
	
//AREAS

/* 	{ id: 'Aakas Island', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
	{ id: 'Arkadia Event Area 1', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
	{ id: 'Arkadia Event Area 2', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
    { id: 'Arkadia Event Area 3', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
    { id: 'Arkadia Event Area 4', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
	{ id: 'Big Industries ALA#05', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
	{ id: 'Cyclone Point', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
	{ id: 'Drillrig', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
    { id: 'IFN Commando Training', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
    { id: 'IFN Commando Training', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
	{ id: 'Khorum Coast', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
	{ id: 'Lightning Coast', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
	{ id: 'Lootable PvP', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
    { id: 'Mutation Station', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
    { id: 'Sanctuary Bay', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
	{ id: 'Sanctuary Shores', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
	{ id: 'Sentosas Reach', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
	{ id: 'Songkra Valley', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
    { id: 'Storms Keep', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
    { id: 'Thunder Hills', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' },
	{ id: 'Thunder Ridge', info: '/wp [Planet Arkadia, , 100, Tanner Tp]', top: '53px', left: '8px' } */
    
   //CITIES

/* 	{ id: 'Carabok and Gallard Wave', info: '/wp [Planet Arkadia, 28228, 13748, 100, Carabak & Gallard Spawn]', top: '53px', left: '8px' },
	{ id: 'Celeste Outpost Stable', info: '/wp [Planet Arkadia, 27275, 11030, 100, Celeste Outpost Stable]', top: '53px', left: '8px' },
	{ id: 'Miltons Crest', info: '/wp [Planet Arkadia, 20240, 28302, 100, Miltons Crest]', top: '53px', left: '8px' },
    { id: 'New Player Arrival', info: '/wp [Planet Arkadia, 30321, 17652, 100, New Player Arrival]', top: '53px', left: '8px' },
    { id: 'Nusul Wave Spawn', info: '/wp [Planet Arkadia, 27693, 11322, 100, Nusul Wave Spawn]', top: '53px', left: '8px' },
	
	{ id: 'Oratan Camp', info: '/wp [Planet Arkadia, 17897, 23303, 100, Oratan Camp]', top: '53px', left: '8px' },
    { id: 'Oratan Camp', info: '/wp [Planet Arkadia, 26830, 22436, 100, Oratan Camp]', top: '53px', left: '8px' },
    { id: 'Oratan Prospector Wave Spawn', info: '/wp [Planet Arkadia, 32395, 8668, 100, Oratan Prospector Wave Spawn]', top: '53px', left: '8px' },
	{ id: 'Redoubtable Stable', info: '/wp [Planet Arkadia, 23140, 21680, 100, Redoubtable Stable]', top: '53px', left: '8px' },
    { id: 'Resolute Stable', info: '/wp [Planet Arkadia, 29995, 17576, 100, Resolute Stable]', top: '53px', left: '8px' }
	
*/
    // Add more waypoints as needed
];

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
    if (currentModeIndex >= arkadiaMaps.length) {
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

    // Add Arkadia waypointsArray waypoints
    arkadiawaypointsArray.forEach((waypoint, index) => {
        const id = 'arkadiawaypoint' + index;
        const info = waypoint.info;
        const arkadiaWaypoint = createWaypoint(id, info);
        arkadiaWaypoint.style.top = waypoint.top;
        arkadiaWaypoint.style.left = waypoint.left;
        mapWrapper.appendChild(arkadiaWaypoint);
    });

    // Add each waypoint to the map
    for (let i = 1; i <= 50; i++) { // Changed from 68 to 50 for the cluster
        const id = 'waypoint' + i;
        const info = 'Info ' + i;
        const waypoint = createWaypoint(id, info);
        // Adjust positioning for the cluster as needed
        waypoint.style.top = '100px';
        waypoint.style.left = '150px';
        mapWrapper.appendChild(waypoint);
    }
}
// Call the function to add waypoint cluster
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