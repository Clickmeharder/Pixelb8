//rename this script to engineroom.js -
// it will contain all the common js functions as well as any required for static portion of the website
// (everything except the susos)

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

    // Array of image paths
    const images = [
      'assets/images/ads/ad1.png',
      'assets/images/ads/ad2.png',
      'assets/images/ads/ad3.png',
	  'assets/images/ads/ad4.png',
      'assets/images/ads/ad5.png',
      'assets/images/ads/ad6.png',
	  'assets/images/ads/ad7.png',
      'assets/images/ads/ad8.png',
      'assets/images/ads/ad9.png',
	  'assets/images/ads/ad10.png',
      'assets/images/ads/ad11.png',
      'assets/images/ads/ad12.png',
	  'assets/images/ads/ad13.png',
      'assets/images/ads/ad14.png',
      'assets/images/ads/ad15.png',
	  'assets/images/ads/ad16.png',
      'assets/images/ads/ad17.png',
      'assets/images/ads/ad18.png'
      // Add more images as needed
    ];

    let currentIndex = 0;
    const slideshowContainer = document.getElementById('ad-slide');

    // Function to create img elements
    function createSlideshow() {
      images.forEach((imageSrc, index) => {
        const img = document.createElement('img');
        img.src = imageSrc;
        if (index === 0) {
          img.classList.add('active');
        }
        slideshowContainer.appendChild(img);
      });
    }

    // Function to change the active image
    function changeImage() {
      const imgs = slideshowContainer.getElementsByTagName('img');
      imgs[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % images.length;
      imgs[currentIndex].classList.add('active');
	  console.log('current image:' currentIndex);
    }

    // Initialize the slideshow
    createSlideshow();
    setInterval(changeImage, 18000); // Change image every 3 seconds
  