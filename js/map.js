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
    url = 'img/map.jpg',
    // url = 'img/map_labelled.png',
    boarder_url = 'img/overlay_boarder.png',
    pvp_url = 'img/overlay_pvp.png',
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