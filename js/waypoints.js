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