//
//------------------
// Global script for Comfy/obs
//
//
//
//<!-- simulate background script -->
const backgroundImageURL = "https://pixelb8.lol./assets/images/ads/ads19.jpeg"; // Replace with your image

function setBackgroundImage(url) {
	document.body.style.backgroundImage = `url('${url}')`;
}

function removeBackgroundImage() {
	document.body.style.backgroundImage = "none";
}

document.getElementById("simulatebackground").addEventListener("change", function() {
	if (this.checked) {
		setBackgroundImage(backgroundImageURL);
	} else {
		removeBackgroundImage();
	}
});