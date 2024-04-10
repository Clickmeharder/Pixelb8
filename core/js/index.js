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