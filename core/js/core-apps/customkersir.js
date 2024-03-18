		

function updateCursor() {
    
    console.log("Custom cursors are disabled.");
}

/*		document.addEventListener('DOMContentLoaded', function () {	
		  const interactiveElements = document.querySelectorAll('.cursorbutton, .input, .select');
		  const currentGifDiv = document.getElementById('currentgifdiv');
		  const currentCursorDiv = document.getElementById('currentgifcursordiv');

		  window.updateCursor = function (cursorClass) {
			const cursorImageUrl = getComputedStyle(document.documentElement).getPropertyValue(`--${cursorClass}-image`);
			currentCursorDiv.style.backgroundImage = cursorImageUrl;
			currentGifDiv.style.backgroundImage = cursorImageUrl;
			// Call the new function to update the image inside currentGifDiv
		  };

		  interactiveElements.forEach(element => {
			element.addEventListener('mouseover', function () {
			  const cursorClass = element.id; // Use element id as the cursor class
			  const cursorImageUrl = getComputedStyle(document.documentElement).getPropertyValue(`--${cursorClass}-image`);
			  currentGifDiv.style.backgroundColor = '#333131e8';
			  // Call the new function to update the image inside currentGifDiv
			});

			element.addEventListener('mouseout', function () {
			  currentGifDiv.style.backgroundImage = 'none'; // Hide the gif div when the mouse leaves the element
			  currentGifDiv.style.backgroundColor = 'black';
			  currentCursorDiv.style.backgroundImage = 'none'; // Also hide the cursor div immediately
			});
		  });

		  document.addEventListener('mousemove', function (e) {
			const x = e.clientX;
			const y = e.clientY;
			const offsetX = -8; // Adjust the left offset
			const offsetY = 8; // Adjust the top offset

			currentCursorDiv.style.left = x + offsetX + 'px';
			currentCursorDiv.style.top = y + offsetY + 'px';
		  });
		});*/
