
console.log('eumaps-core.js ver 8');
console.log('JS Update eumaps-core.js 5 - 24/5/13 12:01pm- added waypoint and waypoint label titles');
console.log('JS Update eumaps-core.js 6 - 24/5/13 3:24am- fixed planet cycle button');
console.log('last JS Update eumaps-core.js 7 - 24/5/13 5:14am- making adjustments to map positioning');
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
    "../../Modules/globemaps/arkadia/newnormalmap.png",
	"../../Modules/globemaps/arkadia/newspecularmap.png"
];

const Depthmaps = [
    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/arkugbasemap.png",
	"../../Modules/globemaps/calypso/arkmoonbasemap.png"
];
const arkugMaps = [

    "../../Modules/globemaps/arkadia/arkadiaglobemap.png",
    "../../Modules/globemaps/calypso/arkugbasemap.png",
	"../../Modules/globemaps/calypso/arkmoonbasemap.png"
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
	{ id: '8 Coins HQ', tpname: '8 Coins HQ', info: '/wp [Arkadia, 12074, 20716, 100, 8 Coins HQ]', top: '775px', left: '220px' },
	{ id: '8 Coins Town', tpname: '8 Coins Town', info: '/wp [Arkadia, 15360, 23100, 100, 8 Coins Town]', top: '626px', left: '426px' },
	{ id: '8 Coins Windy Isles', tpname: '8 Coins Windy Isles', info: '/wp [Arkadia, 9280, 22340, 100, 8 Coins Windy Isles]', top: '673px', left: '46px' },
	{ id: '8 Coins Teladon Camp', tpname: '8 Coins Teladon Camp', info: '/wp [Arkadia, 13293, 17483, 100, 8 Coins Teladon Camp]', top: '976px', left: '294px' },
	{ id: 'Aakas', tpname: 'Aakas', info: '/wp [Arkadia, 11180, 9775, 100, Aakas]', top: '1456px', left: '165px' },
	{ id: 'Aakas Island', tpname: 'Aakas Island', info: '/wp [Arkadia, 18584, 13748, 100, Aakas Island]', top: '1500px', left: '654px' },
	{ id: 'BIG Industries ALA#05', tpname: 'BIG Industries ALA#05', info: '/wp [Arkadia, 19020, 9046, 100, BIG Ind. LA#05]', top: '59px', left: '1089px' },
	{ id: 'Celeste Harbour North', tpname: 'Celeste Harbour North', info: '/wp [Arkadia, 30025, 10336, 100, Celeste Harbour N.]', top: '1418px', left: '1342px' },
	{ id: 'Celeste Harbour', tpname: 'Celeste Harbour', info: '/wp [Arkadia, 29852, 10176, 100, Celeste Harbour]', top: '1431px', left: '1329px' },
	{ id: 'Celeste Harbour South', tpname: 'Celeste Harbour South', info: '/wp [Arkadia, 29779, 9873, 100, Celeste Harbour S.]', top: '1450px', left: '1325px' },
	{ id: 'Celeste Harbour Military HQ', tpname: 'Celeste Harbour Military HQ', info: '/wp [Arkadia, 30120, 10015, 100, Celeste Harbour Military HQ]', top: '1451px', left: '1355px' },
	{ id: 'Celeste Outpost', tpname: 'Celeste Outpost', info: '/wp [Arkadia, 27258, 10952, Celeste Outpost]', top: '1383px', left: '1166px' },
	{ id: 'Celeste Quarry', tpname: 'Celeste Quarry', info: '/wp [Arkadia, 31186, 9540, 100, Celeste Quarry]', top: '1470px', left: '1412px' },
	{ id: 'Cobra Digsite', tpname: 'Cobra Digsite', info: '/wp [Arkadia, 27700, 26852, 100, Cobra Digsite]', top: '390px', left: '1192px' },
	{ id: 'Cheetah Digsite', tpname: 'Cheetah Digsite', info: '/wp [Arkadia, 10952, 26068, 100, Cheetah Digsite]', top: '441px', left: '150px' },
	{ id: 'Chemical Factory', tpname: 'Chemical Factory', info: '/wp [Arkadia, 24809, 10378, 100, Chemical Factory]', top: '1418px', left: '1013px' },
	{ id: 'Courageous Firebase', tpname: 'Courageous Firebase', info: '/wp [Arkadia, 15169, 25742, 100, Courageous Firebase]', top: '460px', left: '411px' },
	{ id: 'Courageous Firebase Acadamy', tpname: 'Courageous Firebase Acadamy', info: '/wp [Arkadia, 15652, 25651, 100, Courageous Firebase Academy]', top: '470px', left: '443px' },
	{ id: 'Cyclone Point', tpname: 'Cyclone Point', info: '/wp [Arkadia, 18559, 31468, 100, Cyclone Point]', top: '103px', left: '623px' },
	{ id: 'Dauntless Firebase', tpname: 'Dauntless Firebase', info: '/wp [Arkadia, 20268, 17436, 100, Dauntless Firebase]', top: '980px', left: '730px' },
	{ id: 'Dauntless Firebase Acadamy', tpname: 'Dauntless Firebase Acadamy', info: '/wp [Arkadia, 21270, 17310, 100, Dauntless Firebase Academy]', top: '986px', left: '792px' },
	{ id: 'Defiant Firebase', tpname: 'Defiant Firebase', info: '/wp [Arkadia, 14792, 19984, 100, Defiant Firebase]', top: '819px', left: '388px' },
	{ id: 'Dependable Firebase', tpname: 'Dependable Firebase', info: '/wp [Arkadia, 27411, 25171, 100, Dependable Firebase]', top: '495px', left: '1176px' },
	{ id: 'Dependable Firebase Academy', tpname: 'Dependable Firebase Academy', info: '/wp [Arkadia, 27055, 25346, 100, Dependable Firebase Academy]', top: '485px', left: '1153px' },
	{ id: 'Falcon Digsite', tpname: 'Falcon Digsite', info: '/wp [Arkadia, 12249, 13988, 100, Falcon Digsite]', top: '1194px', left: '231px' },
	{ id: 'Fearless Firebase', tpname: 'Fearless Firebase', info: '/wp [Arkadia, 25571, 15163, 100, Fearless Firebase]', top: '1121px', left: '1060px' },
	{ id: 'Fearless Firebase Academy', tpname: 'Fearless Firebase Academy', info: '/wp [Arkadia, 25324, 15537, 100, Fearless Firebase Academy]', top: '1096px', left: '1043px' },
	{ id: 'Formidable Firebase', tpname: 'Formidable Firebase', info: '/wp [Arkadia, 21948, 25341, 100, Formidable Firebase]', top: '484px', left: '835px' },
	{ id: 'Formidable Firebase Academy', tpname: 'Formidable Firebase Academy', info: '/wp [Arkadia, 21347, 25275, 100, Formidable Firebase Academy]', top: '490px', left: '800px' },
	{ id: 'Fuel Depot', tpname: 'Fuel Depot', info: '/wp [Arkadia, 32198, 13303, 100, Fuel Depot]', top: '1235px', left: '1475px' },
	{ id: 'Harrier Site', tpname: 'Harrier Site', info: '/wp [Arkadia, 15435, 10143, 100, Harrier Site]', top: '1432px', left: '429px' },
	{ id: 'Hawk Digsite', tpname: 'Hawk Digsite', info: '/wp [Arkadia, 10068, 13960, 100, Hawk Digsite]', top: '1194px', left: '94px' },
	{ id: 'IFN Supply Depot', tpname: 'IFN Supply Depot', info: '/wp [Arkadia, 29984, 17847, 100, IFN Supply Depot]', top: '1217px', left: '1383px' },
	{ id: 'Implacable Firebase', tpname: 'Implacable Firebase', info: '/wp [Arkadia, 28168, 21960, 100, Implacable Firebase]', top: '698px', left: '1223px' },
	{ id: 'Indomitable Firebase East', tpname: 'Indomitable Firebase East', info: '/wp [Arkadia, 10636, 30162, 100, Indomitable FB-East]', top: '186px', left: '133px' },
	{ id: 'Indomitable Firebase West', tpname: 'Indomitable Firebase West', info: '/wp [Arkadia, 10409, 30116, 100, Indomitable FB-West]', top: '189px', left: '116px' },
	{ id: 'Jaguar Digsite resetwp', tpname: 'Jaguar Digsite resetwp', info: '/wp [Arkadia, 13209, 16166, 100, Jaguar Digsite]', top: '434px', left: '290px' },
	{ id: 'Leapord Digsite resetwp', tpname: 'Leapord Digsite resetwp', info: '/wp [Arkadia, 15706, 28653, 100, Leapord Digsite]', top: '280px', left: '444px' },
	{ id: 'Panther Digsite resetwp', tpname: 'Panther Digsite resetwp', info: '/wp [Arkadia, 14314, 27170, 100, Panther Digsite]', top: '369px', left: '359px' },
	{ id: 'Python Digsite resetwp', tpname: 'Python Digsite resetwp', info: '/wp [Arkadia, 25725, 30128, 100, Python Digsite]', top: '187px', left: '1070px' },
	{ id: 'Kestral Digsite', tpname: 'Kestral Digsite', info: '/wp [Arkadia, 14469, 12603, 100, Kestral Digsite]', top: '1279px', left: '370px' },
	{ id: 'Khorum Coast', tpname: 'Khorum Coast', info: '/wp [Arkadia, 9100, 27404, 100, Khorum Coast]', top: '357px', left: '35px' },
	{ id: 'Machinery Plant', tpname: 'Machinery Plant', info: '/wp [Arkadia, 20546, 21850, 100, Machinery Plant]', top: '702px', left: '748px' },
	{ id: 'Mamba Digsite', tpname: 'Mamba Digsite', info: '/wp [Arkadia, 26448, 28365, 100, Mamba Digsite]', top: '297px', left: '1116px' },
	{ id: 'Miltons Crest', tpname: 'Miltons Crest', info: '/wp [Arkadia, 20208, 28304, 100, Milton`s Crest]', top: '299px', left: '722px' },
	{ id: 'Moshanes Legacy', tpname: 'Moshanes Legacy', info: '/wp [Arkadia, 23822, 27840, 100, Machone`s Legacy]', top: '328px', left: '952px' },
	{ id: 'Mutation Station', tpname: 'Mutation Station', info: '/wp [Arkadia, 9728,9781, 100, Mutation Station]', top: '1455px', left: '73px' },
	{ id: 'New Arrivals Hangar', tpname: 'New Arrivals Hangar', info: '/wp [Arkadia, 30315, 17968, 100, New Arrivals Hangar]', top: '945px', left: '1359px' },
	{ id: 'Nursery', tpname: 'Nursery', info: '/wp [Arkadia, 28872, 24347, 100, Nursery]', top: '548px', left: '1269px' },
	{ id: 'Ocean Lookout', tpname: 'Ocean Lookout', info: '/wp [Arkadia, 31869, 20021, 100, Ocean Lookout]', top: '818px', left: '1454px' },
	{ id: 'Redoubtable Firebase', tpname: 'Redoubtable Firebase', info: '/wp [Arkadia, 23232, 21798, 100, Redoubtable Firebase]', top: '707px', left: '916px' },
	{ id: 'Refinery', tpname: 'Refinery', info: '/wp [Arkadia, 25584, 18613, 100, Refinery]', top: '906px', left: '1061px' },
	{ id: 'Relentless Firebase', tpname: 'Relentless Firebase', info: '/wp [Arkadia, 23892, 9325, 100, Relentless Firebase]', top: '1482px', left: '956px' },
	{ id: 'Relentless Firebase Academy', tpname: 'Relentless Firebase Academy', info: '/wp [Arkadia, 23620, 9725, 100, Relentless Firebase Academy]', top: '1460px', left: '940px' },
	{ id: 'Repulse Firebase', tpname: 'Repulse Firebase', info: '/wp [Arkadia, 14987, 15117, 100, Repulse Firebase]', top: '1125px', left: '403px' },
	{ id: 'Repulse Firebase Academy', tpname: 'Repulse Firebase Academy', info: '/wp [Arkadia, 14787, 15650, 100, Repulse Firebase Academy]', top: '1092px', left: '387px' },
	{ id: 'Resolute Firebase', tpname: 'Resolute Firebase', info: '/wp [Arkadia, 30044, 17486, 100, Resolute Firebase]', top: '983px', left: '1374px' },
	{ id: 'Robot Factory', tpname: 'Robot Factory', info: '/wp [Arkadia, 21654, 13796, 100, Robot Factory]', top: '1206px', left: '817px' },
	{ id: 'Rocky Ridge', tpname: 'Rocky Ridge', info: '/wp [Arkadia, 17156, 17975, 100, Rocky Ridge]', top: '944px', left: '536px' },
	{ id: 'Sanctuary Cove', tpname: 'Sanctuary Cove', info: '/wp [Arkadia, 20409, 29956, 100, Sanctuary Cove]', top: '195px', left: '740px' },
	{ id: 'Scoria Camp', tpname: 'Scoria Camp', info: '/wp [Arkadia, 12291, 23382, 100, Scoria Camp]', top: '609px', left: '232px' },
	{ id: 'Scrap Yard', tpname: 'Scrap Yard', info: '/wp [Arkadia, 10882, 10712, 100, Scrap Yard]', top: '1399px', left: '144px' },
	{ id: 'Sentosas Reach LA#4', tpname: 'Sentosas Reach LA#4', info: '/wp [Arkadia, 14824, 32282, 100, Sentosa`s Reach]', top: '54px', left: '389px' },
	{ id: 'Songkra Valley', tpname: 'Songkra Valley', info: '/wp [Arkadia, 32488, 26165, 100, Songkra Valley]', top: '434px', left: '1493px' },
	{ id: 'Steadfast Firebase', tpname: 'Steadfast Firebase', info: '/wp [Arkadia, 18583, 13747, 182, Steadfast Firebase]', top: '1208px', left: '626px' },
	{ id: 'Storms Keep', tpname: 'Storms Keep', info: '/wp [Arkadia, 23207, 31416, 100, Storm`s Keep]', top: '105px', left: '913px' },
	{ id: 'Taipan Digsite', tpname: 'Taipan Digsite', info: '/wp [Arkadia, 30821, 27080, 100, Taipan Digsite]', top: '377px', left: '1388px' },
	{ id: 'Tannery', tpname: 'Tannery', info: '/wp [Arkadia, 8710, 32286, 200, Tannery] nusuls punies', top: '52px', left: '8px' },
	{ id: 'Timber Mill', tpname: 'Timber Mill', info: '/wp [Arkadia, 28204, 13549, 100, Timber Mill]', top: '1218px', left: '1226px' },
	{ id: 'Valiant Firebase', tpname: 'Valiant Firebase', info: '/wp [Arkadia, 17212, 23092, 100, Valiant Firebase]', top: '626px', left: '541px' },
	{ id: 'Victorious Firebase', tpname: 'Victorious Firebase', info: '/wp [Arkadia, 18528, 10362, 100, Victorious Firebase]', top: '1418px', left: '621px' }
	
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
let currentMapdepthIndex = 0;
let currentModeIndex = 0;
let currententropiaPlanet = "Arkadia";

var mapImgWrapper = document.getElementById('mapimgwrapper');
var isDragging = false;
var startX, startY;
var offsetX = 0, offsetY = 0;

// Function to update the text content of the h2 element based on currentModeIndex
function updatemapLabelbyDepth() {
    const h2Element = document.getElementById("currenteumaplabel");
    switch (currentMapdepthIndex) {
        case 0:
            h2Element.textContent = "Current Map: Planet Arkadia Surface";
            break;
        case 1:
            h2Element.textContent = "Current Map: Ark Underground";
            break;
        case 2:
            h2Element.textContent = "Current Map: Arkadia Moon";
            break;
        default:
            h2Element.textContent = "Current Map: Unknown Map";
            break;
    }
}
// Function to update the text content of the h2 element based on currentModeIndex


//calypso map position
//	left: -1059px;
//    top: -619px;
//waypoint.style.top = '-100px'; // Adjust as needed for cluster positioning
//    waypoint.style.left = '-100px'; // Adjust as needed for cluster positioning
function updatemapLabelbyPlanet() {
    const h2Element = document.getElementById("currenteumaplabel");
	const mapWrapper = document.getElementById('mapimgwrapper');
    switch (currentMapIndex) {
        case 0:
            h2Element.textContent = "Current Map: Planet Arkadia - Pixelb8.lol";
			currententropiaPlanet = "Arkadia";
			mapWrapper.style.top = '-285px';
			mapWrapper.style.left = '-550px';
            break;
        case 1:
            h2Element.textContent = "Current Map: Rocktropia - entropiawiki.com";
			currententropiaPlanet = "Rocktropia";
			mapWrapper.style.top = '-7px';
			mapWrapper.style.left = '-42px';
            break;
        case 2:
            h2Element.textContent = "Current Map: Cyrene - Visit Cyrenedreams.com";
			currententropiaPlanet = "Cyrene";
			mapWrapper.style.top = '-285px';
			mapWrapper.style.left = '-550px';
            break;
        case 3:
            h2Element.textContent = "Current Map: Calypso - visit Calypsomap.com";
			currententropiaPlanet = "Calypso";
			mapWrapper.style.top = '-619px';
			mapWrapper.style.left = '-1059px';
            break;
        default:
            h2Element.textContent = "Current Map: Unknown Map";
            break;
    }
}

function updatemapLabelbyMode() {
    const h2Element = document.getElementById("currenteumaplabel");
    switch (currentModeIndex) {
        case 0:
            h2Element.textContent = "Current Map: Planet Arkadia - Pixelb8.lol";
            break;
        case 1:
            h2Element.textContent = "Current Map: Arkadia Tp Map - Arkadiaforum.com";
            break;
        case 2:
            h2Element.textContent = "Current Map: Arkadia bumpmap - Pixelb8.lol";
            break;
        case 3:
            h2Element.textContent = "Current Map: Arkadia Specular - Pixelb8";
            break;
        default:
            h2Element.textContent = "Current Map: Unknown Map";
            break;
    }
}


//toggle underground mode Function 
function toggleUGmode() {
	console.log('"toggle underground mode" button clicked');
    // Increment current map index
    currentMapdepthIndex++;
    // Check if current map index exceeds the length of the array
    if (currentMapdepthIndex >= arkugMaps.length) {
        currentMapdepthIndex = 0; // Reset to the first map if exceeds length
		console.log('currentMapIndex/currentModeIndex/currentMapdepthIndex:'+ currentMapIndex + "/" + currentModeIndex + "/" + currentMapdepthIndex );
    }
    // Update the src attribute of the map image with the new map URL
	hideOverlays();
    document.getElementById("mapimage").src = arkugMaps[currentMapdepthIndex];
	// Call the functions to update the map label
    updatemapLabelbyDepth();
}

//Planet Cycle Function 
function cyclemapPlanet() {
	console.log('"cycle map mode" button clicked');
    // Increment current map index
    currentMapIndex++;
    // Check if current map index exceeds the length of the array
    if (currentMapIndex >= planetMaps.length) {
        currentMapIndex = 0; // Reset to the first map if exceeds length
		console.log('currentMapIndex/currentModeIndex:'+ currentMapIndex + "/" + currentModeIndex );
    }
    // Update the src attribute of the map image with the new map URL
	hideOverlays();
    document.getElementById("mapimage").src = planetMaps[currentMapIndex];
	// Call the functions to update the map label
    updatemapLabelbyPlanet();
}






// Function to cycle through map modes
function cyclemapMode() {
    // Increment current map index
    currentModeIndex++;
	console.log('"cycle map mode" button clicked');
    // Check if current map index exceeds the length of the array
    if (currentModeIndex >= arkadiaMaps.length) {
        currentModeIndex = 0; // Reset to the first map if exceeds length
		console.log('currentMapIndex/currentModeIndex:'+ currentMapIndex + "/" + currentModeIndex );
    }
    // Update the src attribute of the map image with the new map URL
    document.getElementById("mapimage").src = arkadiaMaps[currentModeIndex];

    // Call the functions to update the map label
	updatemapLabelbyMode();

    
}

//MAP DRAGGING EVENTLISTENER FUNCTIONS

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

//8====D
//way point logic
// Function to create a waypoint element with specified ID, info, and label
function createWaypoint(id, info, label) {
    const waypoint = document.createElement('div');
    waypoint.classList.add('waypoint');
    waypoint.id = id;
    waypoint.setAttribute('data-info', info);
    waypoint.style.top = '-100px'; // Adjust as needed for cluster positioning
    waypoint.style.left = '-100px'; // Adjust as needed for cluster positioning

    // Create and append the label element
    const labelElement = document.createElement('div');
    labelElement.classList.add('waypoint-label');
    labelElement.textContent = label;
    waypoint.appendChild(labelElement);

    return waypoint;
}

// Function to add waypoints to the map
function addWaypoints() {
    const mapWrapper = document.getElementById('mapimgwrapper');

    // Add Arkadia waypointsArray waypoints
    arkadiawaypointsArray.forEach((waypoint, index) => {
        const id = 'arkadiawaypoint' + index;
        const info = waypoint.info;
        const wpname = waypoint.tpname;
        const arkadiaWaypoint = createWaypoint(id, info, wpname);
		arkadiaWaypoint.title = wpname + ' - ' + waypoint.info;
        arkadiaWaypoint.style.top = waypoint.top;
        arkadiaWaypoint.style.left = waypoint.left;
        mapWrapper.appendChild(arkadiaWaypoint);
    });

    // Add each waypoint to the map
    for (let i = 1; i <= 50; i++) { // Changed from 68 to 50 for the cluster
        const id = 'waypoint' + i;
        const info = 'Info ' + i;
        const waypoint = createWaypoint(id, info, ''); // Empty label for non-Arkadia waypoints
        waypoint.style.top = '-100px';
        waypoint.style.left = '-100px';
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


//Map Toggle Functions
function toggleTPmap() {
    // Get the map overlay image element
    const mapOverlay = document.getElementById("tpmap-overlay");

    // Toggle the visibility of the map overlay
    if (mapOverlay.style.display === "none") {
        mapOverlay.style.display = "block";
        // Show all waypoints when the map overlay is displayed
        showAllWaypoints();
    } else {
        mapOverlay.style.display = "none";
        // Hide all waypoints when the map overlay is hidden
        hideAllWaypoints();
    }
}

// Function to show all waypoints
function showAllWaypoints() {
    const waypoints = document.querySelectorAll('.waypoint');
    waypoints.forEach(waypoint => {
        waypoint.style.display = "block";
    });
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
// Function to hide all waypoints
function hideAllWaypoints() {
    const waypoints = document.querySelectorAll('.waypoint');
    waypoints.forEach(waypoint => {
        waypoint.style.display = "none";
		console.log('Waypoints have been hidden');
    });
}

//hide overlays Function
function hideOverlays() {
    // Get the map overlay image element
    const tpmapOverlay = document.getElementById("tpmap-overlay");
	const mobOverlay = document.getElementById("mob-overlay");
	const landAreasOverlay = document.getElementById("landareas-overlay");
	const pvpZonesOverlay = document.getElementById("pvpzones-overlay");
        tpmapOverlay.style.display = "none";
		mobOverlay.style.display = "none";
		landAreasOverlay.style.display = "none";
		pvpZonesOverlay.style.display = "none";
		console.log('Overlays hidden (tpmapOverlay, mobOverlay, landAreasOverlay, pvpZonesOverlay');
        // Hide all waypoints when the map overlay is hidden
        hideAllWaypoints();
}