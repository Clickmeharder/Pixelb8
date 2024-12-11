//sweatshop.js
// Global variable to store the current ID of the element
let currentItemNameInputId = 'itemNameInput';

// Function to toggle between the select dropdown and text input
function toggleItemNameInput() {
  var action = document.getElementById('actionSelect').value;
  var itemNameInput = document.getElementById('itemNameInput');
  var itemNameTextInput = document.getElementById('itemNameTextInput');
  
  if (action === 'add') {
    // Show the select dropdown, hide the text input
    itemNameInput.style.display = 'block';
    itemNameTextInput.style.display = 'none';
    
    // Save the current ID of itemNameInput to the variable
    currentItemNameInputId = itemNameInput.id;

  } else if (action === 'edit') {
    // Hide the select dropdown, show the text input
    itemNameInput.style.display = 'none';
    itemNameTextInput.style.display = 'block';
    
    // Save the current ID of itemNameTextInput to the variable
    currentItemNameInputId = itemNameTextInput.id;

  } else {
    // Optionally, hide both or do something else when delete is selected
    itemNameInput.style.display = 'none';
    itemNameTextInput.style.display = 'none';
    
    // Reset to a default ID (or any other logic you want)
    currentItemNameInputId = '';
  }
}

// Call the function initially to set the correct state
toggleItemNameInput();

// Add an event listener to update the display whenever the action changes
document.getElementById('actionSelect').addEventListener('change', toggleItemNameInput);