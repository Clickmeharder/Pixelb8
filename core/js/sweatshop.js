//sweatshop.js
// Function to toggle between the select dropdown and text input
function toggleItemNameInput() {
  var action = document.getElementById('actionSelect').value;
  var itemNameInput = document.getElementById('itemNameInput');
  var itemNameTextInput = document.getElementById('itemNameTextInput');
  
  if (action === 'add') {
    // Hide the select dropdown, show the text input
    itemNameInput.style.display = 'none';
    itemNameTextInput.style.display = 'block';
  } else if (action === 'edit') {
    // Show the select dropdown, hide the text input
    itemNameInput.style.display = 'block';
    itemNameTextInput.style.display = 'none';

  } else {
    // Show the select dropdown, hide the text input
    itemNameInput.style.display = 'block';
    itemNameTextInput.style.display = 'none';
  }
}

// Call the function initially to set the correct state
toggleItemNameInput();

// Add an event listener to update the display whenever the action changes
document.getElementById('actionSelect').addEventListener('change', toggleItemNameInput);