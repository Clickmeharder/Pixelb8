// Create a custom DivOverlay class that extends L.DivOverlay
var CustomDivOverlay = L.DivOverlay.extend({
    options: {
        className: 'custom-div-overlay', // Define the CSS class for styling
        offset: [0, 0], // Adjust the offset if needed
    },

    // Implement the createContent method to create the content of the DivOverlay
    createContent: function () {
        // Create the content of the DivOverlay
        var div = L.DomUtil.create('div', 'custom-div-content');
        div.innerHTML = 'This is a custom DivOverlay';

        return div;
    },
});

// Create an instance of the CustomDivOverlay
var customDivOverlay = new CustomDivOverlay();

// Add the CustomDivOverlay to the map
map.addLayer(customDivOverlay);

// Show or hide the CustomDivOverlay based on user interaction or events
function toggleCustomDivOverlay() {
    if (map.hasLayer(customDivOverlay)) {
        map.removeLayer(customDivOverlay);
    } else {
        map.addLayer(customDivOverlay);
    }
}
