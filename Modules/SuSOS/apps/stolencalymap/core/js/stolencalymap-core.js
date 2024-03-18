const AREA_STYLE_BASE = {
    color: "#f0da7b",
    fillColor: "#f0da7b",
    fillOpacity: 0,
    opacity: 0,
};

const AREA_STYLE_ON_HOVER = {
    // fillOpacity: 0.1,
    // opacity: 0.5,
};

const AREA_STYLE_SELECTED = {
    color: "red",
    fillColor: "#f03",
    fillOpacity: 0.5,
    opacity: 0.5,
}

const AREA_STYLE_PARTIAL = {
    color: "green",
    fillColor: "green",
    fillOpacity: 0.8,
    opacity: 0.5,
};
var selected_waypoint = null;
var waypoint_label_state = {};
const map_waypoint_marker_map = {};
const map_waypoint_label_map = {};

const waypoint_sections = {
    "arkadia": {
        label: "Arkadia",
        waypoints: [
            "arkadia_space_station",
            "arkadia_moon",
            "arkadia_skyflail_nesting_grounds",
            "arkadia_hermit_nesting_grounds",
            "arkadia_training_grounds",
        ]
    },
    "athena_space_station": {
        label: "Athena Space Station",
        waypoints: [
            "athena_space_station",
            "welmik_express",
            "new_berand",
        ]
    },
    "calypso": {
        label: "Calypso",
        waypoints: [
            "calypso_space_station",
            "crystal_palace_space_station",
            "asteroid_foma",
            "calypso_skyflail_nesting_grounds",
            "calypso_hermit_nesting_grounds",
            "calypso_training_grounds",
            "dropship",
        ]
    },
    "cyrene": {
        label: "Cyrene",
        waypoints: [
            "cyrene_space_station",
            "cyrene_hermit_nesting_grounds",
            "cyrene_training_grounds",
            "cyrene_skyflail_nesting_grounds",
        ]
    },
    "erebos_space_station": {
        label: "Erebos Space Station",
        waypoints: [
            "erebos_space_station",
            "graveyard_fields",
            "void_of_tears",
        ]
    },
    "hermes_space_station": {
        label: "Hermes Space Station",
        waypoints: [
            "hermes_space_station",
            "eschenbachs_gate",
            "dymlin_space",
        ]
    },
    "howling_mine": {
        label: "Howling Mine",
        waypoints: [
            "howling_mine",
            "rackhams_nest",
        ]
    },
    "monria": {
        label: "Monria",
        waypoints: [
            "monria_space_station",
            "monria_sky_nesting_grounds",
            "sayah_space",
            "monria_hermit_nesting_grounds",
        ]
    },
    "next_island": {
        label: "Next Island",
        waypoints: [
            "next_island_space_station",
            "next_island_training_grounds",
            "next_island_skyflail_nesting_grounds",
            "next_island_hermit_nesting_grounds",
        ]
    },
    "rocktropia": {
        label: "Rocktropia",
        waypoints: [
            "rocktropia_space_station",
            "rocktropia_skyflail_nesting_grounds",
            "rocktropia_hermit_nesting_grounds",
            "rocktropia_training_grounds",
        ]
    },
    "toulan": {
        label: "Toulan",
        waypoints: [
            "toulan_space_station",
            "bartons_corridor",
            "toulan_hermits_nesting_grounds",
            "toulan_skyflail_nesting_grounds",
        ]
    },
    "zeus_space_station": {
        label: "Zeus Space Station",
        waypoints: [
            "zeus_space_station",
            "gordons_belt",
        ]
    },
    "others": {
        label: "Others",
        waypoints: [
            "locusta",
        ]
    },
}

const waypoints = {
    // Arkadia
    "arkadia_space_station": {
        label: "Arkadia Space Station",
        loc: [-1714.22, 1526.89],
        radius: 25,
        code: "/wp [Space, 77728, 58544, -50, Arkadia Space Station]",
    },
    "arkadia_moon": {
        label: "Arkadia Moon",
        loc: [-1729.52, 1456.19],
        radius: 25,
        code: "/wp [Space, 76592, 58324, -50, Arkadia Moon]",
    },
    "arkadia_skyflail_nesting_grounds": {
        label: "Arkadia Skyflail Nesting Grounds",
        loc: [-1473.29, 1562.79],
        radius: 68,
        code: "/wp [Space, 78324, 62411, -277, Skyflail Nesting Grounds]",
        filter: "Skyflail",
    },
    "arkadia_hermit_nesting_grounds": {
        label: "Arkadia Hermit Nesting Grounds",
        loc: [-1647.74, 1668.83],
        radius: 68,
        code: "/wp [Space, 79967, 59627, -1926, Hermit Nesting Grounds]",
        filter: "hermit",
    },
    "arkadia_training_grounds": {
        label: "Arkadia Training Grounds",
        loc: [-1584.04, 1411.14],
        radius: 68,
        code: "/wp [Space, 76205, 60342, 1389, Arkadia Training Grounds]",
    },


    // Athena Space Station
    "athena_space_station": {
        label: "Athena Space Station",
        loc: [-1016.43, 1574.75],
        radius: 25,
        code: "/wp [Space, 78493, 69720, -2542, Athena Space Station]",
    },
    "welmik_express": {
        label: "Welmik Expanse",
        loc: [-935.85, 1546.99],
        rectangle: true,
        width: 100,
        height: 70,
        code: "/wp [Space, 78049, 71003, 1356, Welmik Expanse]",
        filter: "cosmic_horror",
    },
    "new_berand": {
        label: "New Berand",
        loc: [-1066.82, 1583.58],
        rectangle: true,
        width: 70,
        height: 70,
        code: "/wp [Space, 78667, 68875, -2417, New Berand]",
        filter: "cosmic_horror",
    },


    // Calypso
    "calypso_space_station": {
        label: "Calypso Space Station",
        loc: [-1020.61, 325.77],
        radius: 25,
        code: "/wp [Space, 58498, 69704, -81, Calypso Space Station]",
    },
    "crystal_palace_space_station": {
        label: "Crystal Palace Space Station",
        loc: [-1048.37, 345.29],
        radius: 25,
        code: "/wp [Space, 58810, 69254, -200, Crystal Palace Space Station]",
    },
    "asteroid_foma": {
        label: "Asteroid F.O.M.A",
        loc: [-991.63, 343.46],
        radius: 25,
        code: "/wp [Space, 58787, 70150, 0, Asteroid F.O.M.A]",
    },
    "calypso_skyflail_nesting_grounds": {
        label: "Calypso Skyflail Nesting Grounds",
        loc: [-937.03, 478.89],
        radius: 68,
        code: "/wp [Space, 60969, 71006, 555, Skyflail Nesting Grounds]",
        filter: "Skyflail",
    },
    "calypso_hermit_nesting_grounds": {
        label: "Calypso Hermit Nesting Grounds",
        loc: [-1155.12, 624.69],
        radius: 68,
        code: "/wp [Space, 63287, 67571, -1160, Hermit Nesting Grounds]",
        filter: "hermit",
    },
    "calypso_training_grounds": {
        label: "Calypso Training Grounds",
        loc: [-1155.12, 424.9],
        radius: 68,
        code: "/wp [Space, 60071, 67564, 1230, Calypso Training Grounds]",
    },


    // Cyrene
    "cyrene_space_station": {
        label: "Cyrene Space Station",
        loc: [-1715.39, 503.48],
        radius: 25,
        code: "/wp [Space, 61344, 58544, -77, Cyrene Space Station]",
    },
    "cyrene_hermit_nesting_grounds": {
        label: "Cyrene Hermit Nesting Grounds",
        loc: [-1440.25, 624.7],
        radius: 68,
        code: "/wp [Space, 63287, 62980, 50, Hermit Nesting Grounds]",
        filter: "hermit",
    },
    "cyrene_training_grounds": {
        label: "Cyrene Training Grounds",
        loc: [-1612.5, 555.18],
        radius: 68,
        code: "/wp [Space, 62153, 60189, -851, Cyrene Training Grounds]",
    },
    "cyrene_skyflail_nesting_grounds": {
        label: "Cyrene Skyflail Nesting Grounds",
        loc: [-1534.76, 414.64],
        radius: 68,
        code: "/wp [Space, 59935, 61464, 325, Skyflail Nesting Grounds]",
        filter: "Skyflail",
    },


    // Erebos Space Station
    "erebos_space_station": {
        label: "Erebos Space Station",
        loc: [-1018.97, 968.44],
        radius: 25,
        code: "/wp [Space, 68782, 69720, -480, Erebos Space Station]",
    },
    "graveyard_fields": {
        label: "Graveyeard Fields",
        loc: [-1034.56, 1027.99],
        rectangle: true,
        width: 70,
        height: 70,
        code: "/wp [Space, 69717, 69476, -590, Graveyeard Fields]",
        filter: "cosmic_horror",
    },
    "void_of_tears": {
        label: "Void of tears",
        loc: [-954.92, 1058.98],
        rectangle: true,
        width: 70,
        height: 70,
        code: "/wp [Space, 70242, 70726, 2099, Void of tears]",
        filter: "cosmic_horror",
    },

    
    // Hermes Space Station
    "hermes_space_station": {
        label: "Hermes Space Station",
        loc: [-1549.18, 2152.41],
        radius: 25,
        code: "/wp [Space, 87729, 61197, -500, Hermes Space Station]",
    },
    "eschenbachs_gate": {
        label: "Eschenbach's Gate",
        loc: [-1484.76, 2093.14],
        rectangle: true,
        width: 70,
        height: 70,
        code: "/wp [Space, 86786, 62219, -729, Eschenbach's Gate]",
        filter: "cosmic_horror",
    },
    "dymlin_space": {
        label: "Dymlin Space",
        loc: [-1662.04, 2092.37],
        rectangle: true,
        width: 70,
        height: 70,
        code: "/wp [Space, 86786, 59386, 1610, Dymlin Space]",
        filter: "cosmic_horror",
    },
    

    // Howling Mine
    "howling_mine": {
        label: "Howling Mine",
        loc: [-424.31, 1621.32],
        radius: 25,
        code: "/wp [Space, 79228, 79228, -710, Howling Mine]",
    },
    "rackhams_nest": {
        label: "Rackham's Nest",
        loc: [-418.25, 1547.44],
        rectangle: true,
        width: 70,
        height: 70,
        code: "/wp [Space, 78065, 79313, -1100, Rackham's Nest]",
        filter: "cosmic_horror",
    },


    // Dropships at Howling Mine
    // "White Star": {
    //     label: "White Star",
    //     x: 0,
    //     y: 0,
    //     code: "/wp [Space, 79372, 75744, 434, Waypoint]",
    // },
    // "Red Star": {
    //     label: "Red Star",
    //     x: 0,
    //     y: 0,
    //     code: "/wp [Space, 80124, 77632, 434, Waypoint]",
    // },


    // Monria
    "monria_space_station": {
        label: "Monria Space Station",
        loc: [-299.2, 298.73],
        radius: 20,
        region_url: "monria_space_station.png",
        region_loc: [-49, 118.5],
        code: "/wp [Space, 58054, 81246, -56, Monria Space Station]",
    },
    "monria_sky_nesting_grounds": {
        label: "Monria Skyflail Nesting Grounds",
        loc: [-336.37, 440.43],
        radius: 68,
        code: "/wp [Space, 59427, 80620, 153, Skyflail Nesting Grounds]",
        filter: "Skyflail",
    },
    "sayah_space": {
        label: "Sayah Space",
        loc: [-520.81, 558.67],
        radius: 68,
        code: "/wp [Space, 62215, 77709, -720, Sayah Space]",
    },
    "monria_hermit_nesting_grounds": {
        label: "Monria Hermit Nesting Grounds",
        loc: [-517.5, 323.14],
        radius: 68,
        code: "/wp [Space, 58464, 77735, -1250, Hermit Nesting Grounds]",
        filter: "hermit",
    },


    // Next Island
    "next_island_space_station": {
        label: "Next Island Space Station",
        loc: [-1027.25, 2214.64],
        radius: 25,
        code: "/wp [Space, 88729, 69536, -75, Next Island Space Station]",
    },
    "next_island_training_grounds": {
        label: "Next Island Training Grounds",
        loc: [-1024.68, 1928],
        radius: 68,
        code: "/wp [Space, 84166, 69634, 563, Next Island Training Grounds]",
    },
    "next_island_skyflail_nesting_grounds": {
        label: "Next Island Skyflail Nesting Grounds",
        loc: [-925.11, 2083.56],
        radius: 68,
        code: "/wp [Space, 86645, 71153, 98, Skyflail Nesting Grounds]",
        filter: "Skyflail",
    },
    "next_island_hermit_nesting_grounds": {
        label: "Next Island Hermit Nesting Grounds",
        loc: [-1128.77, 2085.44],
        radius: 68,
        code: "/wp [Space, 86663, 67933, -1040, Hermit Nesting Grounds]",
        filter: "hermit",
    },


    // Rocktropia
    "rocktropia_space_station": {
        label: "Rocktropia Space Station",
        loc: [-342.06, 1014.44],
        radius: 25,
        code: "/wp [Space, 69536, 80528, -25, Rocktropia Space Station]",
    },
    "rocktropia_skyflail_nesting_grounds": {
        label: "Rocktropia Skyflail Nesting Grounds",
        loc: [-467.76, 992.17],
        radius: 68,
        code: "/wp [Space, 69161, 78545, -50, Skyflail Nesting Grounds]",
        filter: "Skyflail",
    },
    "rocktropia_hermit_nesting_grounds": {
        label: "Rocktropia Hermit Nesting Grounds",
        loc: [-630.75, 899.49],
        radius: 68,
        code: "/wp [Space, 71479, 75925, -1100, Hermit Nesting Grounds]",
        filter: "hermit",
    },
    "rocktropia_training_grounds": {
        label: "Rocktropia Training Grounds",
        loc: [-631.54, 1136.34],
        radius: 68,
        code: "/wp [Space, 67682, 75926, 650, Rocktropia Training Grounds]",
    },



    // Toulan
    "toulan_space_station": {
        label: "Toulan Space Station",
        loc: [-309.56, 1998.74],
        radius: 25,
        code: "/wp [Space, 85276, 81077, -428, Toulan Space Station]",
    },
    "bartons_corridor": {
        label: "Barton's Corridor",
        loc: [-468, 2051.75],
        radius: 68,
        code: "/wp [Space, 86144, 78521, 400, Barton's Corridor]",
    },
    "toulan_hermits_nesting_grounds": {
        label: "Toulan Hermit Nesting Grounds",
        loc: [-609.71, 2172.61],
        radius: 68,
        code: "/wp [Space, 87064, 76298, 2137, Hermit Nesting Grounds]",
        filter: "hermit",
    },
    "toulan_skyflail_nesting_grounds": {
        label: "Toulan Skyflail Nesting Grounds",
        loc: [-613.24, 1942.91],
        radius: 68,
        code: "/wp [Space, 84324, 76057, -592, Skyflail Nesting Grounds]",
        filter: "Skyflail",
    },


    // Zeus Space Station
    "zeus_space_station": {
        label: "Zeus Space Station",
        loc: [-1403.45, 968.03],
        radius: 25,
        code: "/wp [Space, 68782, 63574, -480, Zeus Space Station]",
    },
    "gordons_belt": {
        label: "Gordon's Belt",
        loc: [-1399.81, 1087.9],
        radius: 70,
        rectangle: true,
        width: 100,
        height: 130,
        code: "/wp [Space, 70692, 63581, -1342, Gordon's Belt]",
        filter: "cosmic_horror",
    },


    // // Others
    // "Dymlek": {
    //     label: "Dymlek",
    //     x: 0,
    //     y: 0,
    //     code: "/wp [Space, 83300, 60600, 188, Dymlek]",
    // },
    "dropship": {
        label: "Dropship Boss Wave",
        loc: [-957.24, 608.51],
        radius: 50,
        filter: "dropship",
        code: "/wp [Space, 62807, 70919, 1753, Dropship Boss Wave]",
    },
    "locusta": {
        label: "Locusta",
        loc: [-1588.23, 932.79],
        code: "/wp [Space, 67991, 61082, 154, Waypoint] Locusta",
        filter: "locusta",
        radius: 50,
    },
};


const waypoint_label_positions = {
    "arkadia_hermit_nesting_grounds":{"x":1819,"y":292.5,"width":384,"height":119},
    "arkadia_moon":{"x":1280,"y":296,"width":354,"height":82},
    "arkadia_skyflail_nesting_grounds":{"x":1718.5,"y":689,"width":397,"height":166},
    "arkadia_space_station":{"x":1766.5,"y":215.5,"width":505,"height":239},
    "arkadia_training_grounds":{"x":1270.5,"y":511.5,"width":267,"height":111},
    "asteroid_foma":{"x":247.5,"y":1157,"width":271,"height":218},
    "athena_space_station":{"x":1334.5,"y":1030,"width":465,"height":86},
    "bartons_corridor":{"x":2208,"y":1621.5,"width":276,"height":111},
    "calypso_hermit_nesting_grounds":{"x":782.5,"y":778.5,"width":389,"height":137},
    "calypso_skyflail_nesting_grounds":{"x":576.5,"y":1230.5,"width":347,"height":163},
    "calypso_space_station":{"x":181,"y":884.5,"width":330,"height":321},
    "calypso_training_grounds":{"x":330,"y":729,"width":268,"height":230},
    "crystal_palace_space_station":{"x":535.5,"y":997,"width":381,"height":86},
    "cyrene_hermit_nesting_grounds":{"x":790,"y":424,"width":416,"height":278},
    "cyrene_skyflail_nesting_grounds":{"x":240.5,"y":386.5,"width":397,"height":165},
    "cyrene_space_station":{"x":296,"y":247.5,"width":444,"height":201},
    "cyrene_training_grounds":{"x":737,"y":275.5,"width":450,"height":211},
    "dropship": {"x":711.5,"y":1104,"width":323,"height":164},
    "dymlin_space":{"x":2273,"y":340,"width":340,"height":82},
    "erebos_space_station":{"x":813.5,"y":1044,"width":345,"height":94},
    "eschenbachs_gate":{"x":1902,"y":509,"width":356,"height":106},
    "gordons_belt":{"x":1244,"y":717.5,"width":262,"height":87},
    "graveyard_fields":{"x":889,"y":911,"width":280,"height":190},
    "hermes_space_station":{"x":2320.5,"y":511.5,"width":357,"height":87},
    "howling_mine":{"x":1772,"y":1603,"width":340,"height":82},
    "locusta":{"x":1040,"y":400,"width":272,"height":84},
    "monria_hermit_nesting_grounds":{"x":469.5,"y":1415.5,"width":389,"height":137},
    "monria_sky_nesting_grounds":{"x":599.5,"y":1836,"width":397,"height":166},
    "monria_space_station":{"x":198,"y":1829.5,"width":298,"height":189},
    "new_berand":{"x":1410.5,"y":935,"width":329,"height":82},
    "next_island_hermit_nesting_grounds":{"x":1875,"y":858.5,"width":380,"height":111},
    "next_island_skyflail_nesting_grounds":{"x":2319.5,"y":1190,"width":421,"height":146},
    "next_island_space_station":{"x":2313,"y":921,"width":290,"height":212},
    "next_island_training_grounds":{"x":1774,"y":1081.5,"width":282,"height":111},
    "rackhams_nest":{"x":1384.5,"y":1578.5,"width":317,"height":103},
    "rocktropia_hermit_nesting_grounds":{"x":985.5,"y":1301,"width":355,"height":160},
    "rocktropia_skyflail_nesting_grounds":{"x":1215.5,"y":1640.5,"width":421,"height":145},
    "rocktropia_space_station":{"x":829.5,"y":1719.5,"width":401,"height":87},
    "rocktropia_training_grounds":{"x":1413,"y":1326,"width":530,"height":188},
    "sayah_space":{"x":697.5,"y":1573,"width":229,"height":112},
    "toulan_hermits_nesting_grounds":{"x":2329,"y":1358,"width":384,"height":96},
    "toulan_skyflail_nesting_grounds":{"x":1719,"y":1384.5,"width":390,"height":111},
    "toulan_space_station":{"x":1850.5,"y":1753,"width":333,"height":86},
    "void_of_tears":{"x":1172.5,"y":1134.5,"width":227,"height":89},
    "welmik_express":{"x":1694.5,"y":1189,"width":267,"height":142},
    "zeus_space_station":{"x":876,"y":595,"width":296,"height":122},
}
const creatures = {
    "cosmic_horror": {
        label: "Cosmic Horror",
        img: "Modules/SuSOS/apps/stolencalymap/assets/img/creatures/Cosmic_Horror.png",
    },
    "dymlek": {
        label: "Dymlek",
        img: "Modules/SuSOS/apps/stolencalymap/assets/img/creatures/Dymlek.png",
    },
    "hermit": {
        label: "Hermit",
        img: "Modules/SuSOS/apps/stolencalymap/assets/img/creatures/Hermit.png",
    },
    "locusta": {
        label: "Locusta",
        img: "Modules/SuSOS/apps/stolencalymap/assets/img/creatures/Locusta.png",
    },
    "Skyflail": {
        label: "Skyflail",
        img: "Modules/SuSOS/apps/stolencalymap/assets/img/creatures/Skyflail.png",
    },
    "dropship": {
        label: "Dropship",
        img: "Modules/SuSOS/apps/stolencalymap/assets/img/creatures/Dropship.png",
    }
};
const planets = {
    "calypso": {
        label: "Calypso",
        loc: [-1034.13, 32.79],
        radius: 170,
    },
    "rocktropia": {
        label: "Rocktropia",
        loc: [-36.52, 1040.24],
        radius: 130,
    },
    "toulan": {
        label: "Toulan",
        loc: [-110.62, 2432.25],
        radius: 80,
    },
    "next_island": {
        label: "Next Island",
        loc: [-1012.42, 2490.25],
        radius: 120,
    },
    "arkadia": {
        label: "Arkadia",
        loc: [-1949.06, 1535.8],
        radius: 120,
    },
    "cyrene": {
        label: "Cyrene",
        loc: [-1986.26, 502.23],
        radius: 150,
    },
}

const planet_label_positions = {
    "rocktropia":{"x":1369,"y":1941,"width":478,"height":162},
	"arkadia":{"x":1820,"y":52.5,"width":406,"height":161},
	"next_island":{"x":2432,"y":788.5,"width":280,"height":255},
	"calypso":{"x":137.5,"y":1278,"width":317,"height":242},
	"cyrene":{"x":829,"y":83,"width":362,"height":166},
	"toulan":{"x":2202.5,"y":1893,"width":391,"height":162},
}
var map = L.map('map', {
    minZoom: -100,
    maxZoom: 4,
    zoomDelta: 0.25,
    zoomSnap: 0,
    center: [0, 0],
    zoom: 1,
    crs: L.CRS.Simple,
    wheelPxPerZoomLevel: 100,           // Higher - slower zoom
    maxBoundsViscosity: 1.0,            // Don't bounce the pan when limits are reached
    attributionControl: false,
    closePopupOnClick: false,
    zoomControl: false,
});

L.control.zoom({
    position:'bottomright'
}).addTo(map);

var w = 2554,
    h = 2042,
//original theft location urls
    url = 'https://space.calypsomap.com/img/map.jpg',
    // url = 'img/map_labelled.png',
    boarder_url = 'https://space.calypsomap.com/img/overlay_boarder.png',
    pvp_url = 'https://space.calypsomap.com/img/overlay_pvp.png',
  //my urls
 // url = 'Modules/SuSOS/apps/stolencalymap/assets/img/map.jpg',
 // url = 'Modules/SuSOS/apps/stolencalymap/assets/img/map_labelled.png',
 // boarder_url = 'Modules/SuSOS/apps/stolencalymap/assets/img/overlay_boarder.png',
 // pvp_url = 'Modules/SuSOS/apps/stolencalymap/assets/img/overlay_pvp.png',
    //
    //
    //
    buffer = 500;
// calculate the edges of the image, in coordinate space
var bounds = L.latLngBounds([[-2042,0], [0,2554]]);
// Allow a larger viewing area for the panning limits
var bounds_limits = L.latLngBounds([[-2542,-500], [500,3054]]);

// add the image overlay, 
var image_layer = L.imageOverlay(url, bounds, {className: "map_image"}).addTo(map);

image_layer.on('load', function (event) {
    var x = document.getElementById("loader");
    x.style.display = "none";

    var image_element = image_layer.getElement();
    unfade(image_element);
});

function unfade(element) {
    var op = 0.001;  // initial opacity
    element.style.display = 'block';
    var timer = setInterval(function () {
        if (op >= 1){
            clearInterval(timer);
        }
        element.style.opacity = op;
        element.style.filter = 'alpha(opacity=' + op * 100 + ")";
        op += op * 0.2;
    }, 5);
}


// tell leaflet that the map is exactly as big as the image
map.setMaxBounds(bounds_limits);

// Initially set the map to just cover the bounds
var wantedZoom = map.getBoundsZoom(bounds_limits, false);
var center = bounds_limits.getCenter();

map.setMinZoom(wantedZoom);

map.setView(center, wantedZoom);

// When screen size changes, update the minimum zoom to allow the user to zoom out to view the map
function updateMinZoom(m) {
    m.invalidateSize();
    m.setMinZoom(-1000);
    var w = m.getBoundsZoom(bounds_limits, false);
    m.setMinZoom(w);
}

map.on('resize', function () {updateMinZoom(map)});



// OVERLAY LAYERS

var boarder_layer = L.imageOverlay(boarder_url, bounds, {className: "overlay_boarder_image"});
var pvp_layer = L.imageOverlay(pvp_url, bounds, {className: "overlay_pvp_image"});

const boarder_checkbox = document.getElementById('boarder_checkbox')
boarder_checkbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        map.addLayer(boarder_layer);
    } else {
        map.removeLayer(boarder_layer);
    }
})

const pvp_checkbox = document.getElementById('pvp_checkbox')
pvp_checkbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        map.addLayer(pvp_layer);
    } else {
        map.removeLayer(pvp_layer);
    }
})

const names_checkbox = document.getElementById('names_checkbox')
names_checkbox.addEventListener('change', (event) => {
    if (event.currentTarget.checked) {
        Object.keys(map_waypoint_label_map).forEach((key) => {
            waypoint_show_label(key);
        });
        Object.keys(planet_label_map).forEach((key) => {
            planet_show_label(key);
        });
    } else {
        Object.keys(map_waypoint_label_map).forEach((key) => {
            if (!is_base_active(key)) {
                waypoint_hide_label(key);
            }
        });
        Object.keys(planet_label_map).forEach((key) => {
            if (key !== selected_planet) {
                planet_hide_label(key);
            }
        });
    }
})



// WAYPOINTS


const waypoint_select = document.getElementById('all_waypoint_select');
var default_waypoint_option = document.getElementById('default_waypoint_option');

const copy_button = document.getElementById('waypoint_copy_button');







// ON COPY CLICKED

copy_button.addEventListener('click', (event) => {
    if (waypoint_select.value === "-") {
        return;
    }

    copy_button.innerHTML = "Waypoint Copied!"
    copy_button.classList.add("selected");

    setTimeout(() => {
        copy_button.innerHTML = "Click Here to Copy TP Waypoint Link"
        copy_button.classList.remove("selected");
    }, 2000)


    var textArea = document.createElement("textarea");
  
    textArea.style.position = 'fixed';
    textArea.style.top = 0;
    textArea.style.left = 0;
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = 0;
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
  
    textArea.value = waypoints[waypoint_select.value].code;

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
  
    try {
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Copying text command was ' + msg);
    } catch (err) {
      console.log('Oops, unable to copy');
    }
  
    document.body.removeChild(textArea);
});

// WAYPOINTS




const is_base_active = function(key) {
    if (creature_select.value && (creature_select.value === waypoints[key].filter)) {
        return true;
    }
    if (names_checkbox.checked) {
        return true;
    }
    return selected_waypoint === key;
}

const on_clear_labels = function (filter) {
    Object.keys(waypoints).forEach((key) => {
        if (filter && waypoints[key].filter === filter) {
            waypoint_show_label(key);
        } else {
            if(key !== selected_waypoint) {
                if (waypoint_label_state[key]) {
                    waypoint_hide_label(key);
                }
            }
        }
    })
}


const populate_waypoint_options = function(_map) {
    Object.keys(waypoint_sections).forEach(function (group_key, group_index) {
        const waypoint_group = waypoint_sections[group_key];
        
        // Create optgroup HTML element
        var option_group = document.createElement("optgroup");
        option_group.label = waypoint_group.label;
        waypoint_select.appendChild(option_group);
        
        // Create sub-options
        waypoint_group.waypoints.forEach(function (waypoint_key, waypoint_index) {
            const waypoint = waypoints[waypoint_key];
            var waypoint_option = document.createElement("option");
            waypoint_option.value = waypoint_key;
            waypoint_option.innerHTML = waypoint.label;
            option_group.appendChild(waypoint_option);
            
            var waypoint_marker = null;

            if (waypoint.rectangle) {
                const rectangle_bounds = [[waypoint.loc[0] - waypoint.height / 2, waypoint.loc[1] - waypoint.width / 2], [waypoint.loc[0] + waypoint.height / 2, waypoint.loc[1] + waypoint.width / 2]]
                waypoint_marker = L.rectangle(rectangle_bounds, AREA_STYLE_BASE).addTo(_map);
            } else {
                waypoint_marker = L.circle(waypoint.loc, {
                    ...AREA_STYLE_BASE,
                    radius: waypoint.radius ? waypoint.radius : 50,
                }).addTo(_map);
            }
            const label_pos = waypoint_label_positions[waypoint_key];
            const top_left_coordinates = [-2042 + label_pos.y - (label_pos.height / 2), label_pos.x - (label_pos.width / 2)];
            const label_bounds = L.latLngBounds([[top_left_coordinates[0], top_left_coordinates[1]], [top_left_coordinates[0] + label_pos.height, top_left_coordinates[1] + label_pos.width]]);

            var label_img_overlay = L.imageOverlay(`https://space.calypsomap.com/img/labels/${waypoint_key}.png`, label_bounds, {className: "label_overlay", opacity: 0}).addTo(map);
            

            waypoint_marker.on('mouseover', (event) => {
                if(waypoint_key !== selected_waypoint) {
                    waypoint_show_label(waypoint_key);
                }
            });
            waypoint_marker.on('mouseout', function() {
                if(!is_base_active(waypoint_key)) {
                    waypoint_hide_label(waypoint_key);
                }
            });
            waypoint_marker.on('click', function() {
                waypoint_option.selected = true;
                onWaypointChange(waypoint_key);
            })

            waypoint_label_state[waypoint_key] = false;
            map_waypoint_marker_map[waypoint_key] = waypoint_marker;
            map_waypoint_label_map[waypoint_key] = label_img_overlay;
        });
    });
}

const waypoint_show_label = function (key) {
    map_waypoint_label_map[key].setOpacity(1);
    waypoint_label_state[key] = true;
}

const waypoint_hide_label = function (key) {
    map_waypoint_label_map[key].setOpacity(0);
    waypoint_label_state[key] = false;
}

const waypoint_do_select = function (key) {
    selected_waypoint = key;
    const waypoint = waypoints[key];
    const waypoint_marker = map_waypoint_marker_map[key];

    waypoint_marker.setStyle(AREA_STYLE_SELECTED);
    waypoint_show_label(key);
}

const waypoint_do_unselect = function (key) {
    const waypoint = waypoints[key];
    const waypoint_marker = map_waypoint_marker_map[key];

    waypoint_marker.setStyle(AREA_STYLE_BASE);
    if(!is_base_active(key)) {
        waypoint_hide_label(key);
    }
}


// ON "WAYPOINT" OPTION CHANGED

const onWaypointChange = function(value) {
    const old_selected = selected_waypoint;
    selected_waypoint = value;
    if (old_selected) {
        waypoint_do_unselect(old_selected);
    }
    if (waypoint_select.value === "-") {
        selected_waypoint = null;
        copy_button.classList.remove("visible");
		copy_button.classList.add("hidden");
        return;
    }
    if (creature_select.value !== "-") {
        default_creature_option.selected = true;
        on_creature_select_changed(null);
    }
    waypoint_do_select(value);
	copy_button.classList.remove("hidden");
    copy_button.classList.add("visible");
}

waypoint_select.addEventListener('change', (event) => {
    onWaypointChange(event.target.value);
})



// CREATURES

const creature_select = document.getElementById('creature_select');
const creature_image = document.getElementById('creature_image');
const creature_image_container = document.getElementById('creature_image_container');
var default_creature_option;

const populate_creature_options = function() {
    var i, L = creature_select.options.length - 1;
    for(i = L; i >= 0; i--) {
        creature_select.remove(i);
    }

    default_creature_option = document.createElement("option");
    default_creature_option.value = "-";
    default_creature_option.innerHTML = "Filter By Creature";
    creature_select.appendChild(default_creature_option);
    
    Object.keys(creatures).forEach(function(key) {
        var creature_option = document.createElement("option");
        creature_option.value = key;
        creature_option.innerHTML = creatures[key].label;
        creature_select.appendChild(creature_option); 
    });
}


const on_creature_select_changed = function (value) {
    const creature = creatures[value];
    if (creature_select.value === "-") {
        on_clear_labels(null);
        creature_image_container.classList.remove("visible");
    } else {
        default_waypoint_option.selected = true;
        onWaypointChange(null);
        
        on_clear_labels(value);
        creature_image_container.classList.add("visible");
        creature_image.src = creature.img;
    }
}


populate_waypoint_options(map);
populate_creature_options();




creature_select.addEventListener('change', (event) => {
    on_creature_select_changed(event.target.value);
})



// PLANETS

const planet_select = document.getElementById('planet_select');
var planet_label_map = {};
var selected_planet = null;
var default_planet_option;

function popuplate_planet_select() {
    default_planet_option = document.createElement("option");
    default_planet_option.value = "-";
    default_planet_option.innerHTML = "Select Planet";
    planet_select.appendChild(default_planet_option);
    
    Object.keys(planets).forEach(function(key) {
        const planet = planets[key];
        var planet_option = document.createElement("option");
        planet_option.value = key;
        planet_option.innerHTML = planets[key].label;
        planet_select.appendChild(planet_option);

        const label_pos = planet_label_positions[key];
        const top_left_coordinates = [-2042 + label_pos.y - (label_pos.height / 2), label_pos.x - (label_pos.width / 2)];
        const label_bounds = L.latLngBounds([[top_left_coordinates[0], top_left_coordinates[1]], [top_left_coordinates[0] + label_pos.height, top_left_coordinates[1] + label_pos.width]]);

        var label_img_overlay = L.imageOverlay(`https://space.calypsomap.com/img/labels/${key}.png`, label_bounds, {className: "label_overlay", opacity: 0}).addTo(map);
        planet_label_map[key] = label_img_overlay;

        var planet_marker = L.circle(planet.loc, {
                ...AREA_STYLE_BASE,
                radius: planet.radius ? planet.radius : 50,
            }).addTo(map);

        planet_marker.on('mouseover', (event) => {
            if(key !== selected_planet) {
                planet_show_label(key);
            }
        });
        planet_marker.on('mouseout', function() {
            if(key !== selected_planet && !names_checkbox.checked) {
                planet_hide_label(key);
            }
        });

    });
}

popuplate_planet_select();

const planet_show_label = function (key) {
    planet_label_map[key].setOpacity(1);
}

const planet_hide_label = function (key) {
    planet_label_map[key].setOpacity(0);
}

const planet_do_select = function (key) {
    selected_planet = key;
    planet_show_label(key);
}

const planet_do_unselect = function (key) {
    const waypoint = waypoints[key];
    planet_hide_label(key);
}

const onPlanetChange = function(value) {
    const old_selected = selected_planet;
    selected_planet = value;
    if (old_selected) {
        planet_do_unselect(old_selected);
    }
    if (planet_select.value === "-") {
        selected_planet = null;
        return;
    }
    if (planet_select.value !== "-") {
        default_creature_option.selected = true;
    }
    planet_do_select(value);
}



planet_select.addEventListener('change', (event) => {
    onPlanetChange(event.target.value);
})

map.on('click', function(e) {
    console.log(`loc: [${Math.round(e.latlng.lat * 100) / 100}, ${Math.round(e.latlng.lng * 100) / 100}],`)
});

// Get references to the button and the #HudMap element
const HudMapToggleBtn = document.getElementById('HudMapToggle');
const HudMapElement = document.getElementById('HudMap');

// Set initial visibility state when the script loads
HudMapElement.style.visibility = 'hidden'; // or 'visible' if you want it to be visible initially
HudMapElement.style.opacity = '0';
// Add event listener for the button click
HudMapToggleBtn.addEventListener('click', function() {
    // Toggle display property
    if (HudMapElement.style.visibility === 'hidden') {
		HudMapElement.style.visibility = 'visible';
        HudMapElement.style.opacity = '1'; // Ensure opacity is set to 1 when displaying
    } else {
        HudMapElement.style.visibility = 'hidden';
        HudMapElement.style.opacity = '0'; // Ensure opacity is set to 0 when hiding
    }
});
