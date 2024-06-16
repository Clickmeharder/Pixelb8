//rename this script to engineroom.js -
// it will contain all the common js functions as well as any required for static portion of the website
// (everything except the susos)//

//Function to get a random element from an array
function getRandomArrayobject(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}


	function accpanelTogglebutt(clickedButton) {
		// Set style of the clicked button
		clickedButton.style.borderStyle = (clickedButton.style.borderStyle === 'inset') ? '' : 'inset';
		clickedButton.style.borderColor = (clickedButton.style.borderColor === 'rgb(7, 186, 197)') ? '' : '#07bac5';
		clickedButton.style.backgroundColor = (clickedButton.style.backgroundColor === 'black') ? '#101128f2' : 'black';

		// Set filter for the image inside the button
		var image = clickedButton.querySelector('img');
		if (image) {
			var currentFilter = image.style.filter;
			var newFilter = (currentFilter === 'brightness(80%) hue-rotate(85deg)') ? 'brightness(70%) hue-rotate(45deg)' : 'brightness(80%) hue-rotate(85deg)';
			image.style.filter = newFilter;
		}

		// You can now reference the clicked button if needed
		console.log('toggle account panel button clicked:', clickedButton);

	  var mainContent = document.getElementById('main-content');
	  if (mainContent.style.width === '300px') {
		mainContent.style.width = '0px';
	  } else {
		mainContent.style.width = '300px';
	  }
	}

  document.addEventListener('DOMContentLoaded', function() {
    const createAccountButton = document.getElementById('createaccountbutt');
    const modal = document.getElementById('modal-usersignup');

    createAccountButton.addEventListener('click', function() {
      modal.classList.remove('hidden');
      modal.classList.add('show');
      modal.style.display = 'block';
    });
  });
  
   // Function to handle closing and canceling for all modals
  function closeModalAndCancel(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('hidden'); // Hide the modal
    modal.classList.remove('show');
    modal.style.display = 'none';
  }

  // Add event listeners to all close buttons with common class
  const closeButtons = document.querySelectorAll('.close-modal-btn');
  closeButtons.forEach(button => {
    button.addEventListener('click', () => {
      closeModalAndCancel(button.getAttribute('data-dismiss'));
    });
  });
  
  
  
//advertisement slideshow logic:
   const slideshowContainer = document.getElementById('ad-slide');
    let currentIndex = 0;
    // Array of image paths
    const images = [
      'assets/images/ads/ads1.png',
      'assets/images/ads/ads2.png',
      'assets/images/ads/ads3.png',
	  'assets/images/ads/ads4.png',
      'assets/images/ads/ads5.png',
      'assets/images/ads/ads6.png',
	  'assets/images/ads/ads7.png',
      'assets/images/ads/ads8.png',
      'assets/images/ads/ads9.png',
	  'assets/images/ads/ads10.png',
      'assets/images/ads/ads11.png',
      'assets/images/ads/ads12.png',
	  'assets/images/ads/ads13.png',
      'assets/images/ads/ads14.png',
      'assets/images/ads/ads15.png',
	  'assets/images/ads/ads16.png',
      'assets/images/ads/ads17.png',
      'assets/images/ads/ads19.png',
	  'assets/images/ads/ads20.png',
	  'assets/images/ads/ads21.png',
	  'assets/images/ads/ads22.png',
	  'assets/images/ads/ads23.png',
	  'assets/images/ads/ads24.png'
      // Add more images as needed
    ];

// Function to change the background image
    function changeImage() {
      slideshowContainer.style.backgroundImage = `url(${images[currentIndex]})`;
      slideshowContainer.classList.add('active');
      currentIndex = (currentIndex + 1) % images.length;
    }

    // Initialize the slideshow
    changeImage(); // Set the first image
    setInterval(changeImage, 30000); // Change image every 3 seconds