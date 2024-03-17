






// Define core script URLs
const coreScriptUrls = [
	'../../Assets/javascript/core/popdropdown.js',
	'../../Assets/javascript/core/divcontrol.js'
	// Add more core script URLs as needed
];

//----------------------------------
// Define groups or arrays of scripts, images, cursors, backgrounds, sounds, etc.
const appletScriptUrls = [
    '../../Assets/javascript/Applets/popdropdown.js',
    '../../Assets/javascript/Applets/divcontrol.js'
    // Add more applet script URLs as needed
];

const imageUrls = [
    '../../Assets/images/image1.jpg',
    '../../Assets/images/image2.jpg',
    // Add more image URLs as needed
];

const cursorUrls = [
    '../../Assets/cursors/cursor1.png',
    '../../Assets/cursors/cursor2.png',
    // Add more cursor URLs as needed
];

const backgroundUrls = [
    '../../Assets/backgrounds/background1.jpg',
    '../../Assets/backgrounds/background2.jpg',
    // Add more background URLs as needed
];

const soundUrls = [
    '../../Assets/sounds/sound1.mp3',
    '../../Assets/sounds/sound2.mp3',
    // Add more sound URLs as needed
];


// Function for loading multiple scripts at once
function lazyLoadBundleScripts(scriptUrls, target = 'head') {
    scriptUrls.forEach(url => {
        appendScript(url, target);
    });
}

//loadinganimation functions
// Function for showing loading animation
function showLoadingAnimation() {
    // Show loading animation here
}

// Function for hiding loading animation
function hideLoadingAnimation() {
    // Hide loading animation here
}

// Function for lazy loading assets after page load
function lazyLoading() {
    // Show loading animation while assets are loading
    showLoadingAnimation();

    // Load images after a short delay (for demonstration purposes)
    setTimeout(function() {
		lazyLoadBundleScripts(appletScriptUrls);
        lazyLoadImages([imageUrls]);
        
        // After images are loaded, hide loading animation
        hideLoadingAnimation();
    }, 1000); // Example delay, adjust as needed
}

// Main function to handle initial page load
function initializePage() {
    // Load core scripts on page load
    lazyLoadBundleScripts(coreScriptUrls);

    // After core scripts have loaded, lazy load assets after page load
    window.addEventListener('load', function() {
        lazyLoading();
		//after lazyloading i wanna do:
		
    });
}

// Call the main function to initialize the page
initializePage();

// Load Additional Resources
lazyLoadBundleScripts([
    'additionalScript1.js',
    'additionalScript2.js'
]);

// Function for lazy loading images
function lazyLoadImages(imageUrls) {
    imageUrls.forEach(url => {
        let img = new Image();
        img.src = url;
    });
}
