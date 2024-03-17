const radioButtons = document.querySelectorAll('input[name="ST-styleRadio"]');
const currentColorSpan = document.querySelector('#ST-CurrentColor span');
const colorPicker = document.getElementById('ST-colorPicker');
const opacitySlider = document.getElementById('opacity-slider');

// Store the original color when a radio button is checked
let originalColor = '';
radioButtons.forEach(radioButton => {
    radioButton.addEventListener('change', () => {
        const selectedVar = getSelectedVariable(radioButton.value);
        const sliderInput = document.querySelector('.slider-input');

        // Check if the selected radio button is for transparency
        if (radioButton.value === 'staticpage-transparency' || radioButton.value === 'hudoverlay-transparency') {
            // If it's for transparency, set the slider to its maximum value and update its value
            sliderInput.value = sliderInput.max;
            const opacityValue = getOpacityValue(selectedVar);
            opacitySlider.value = opacityValue;
        } else {
            // For other radio buttons, reset the slider to its maximum value and update color-related settings
            sliderInput.value = sliderInput.max;
            originalColor = getComputedStyle(document.documentElement).getPropertyValue(selectedVar).trim();
            colorPicker.value = originalColor;
            document.documentElement.style.setProperty('--current-color', originalColor);
        }
    });
});
// Additional event listener for the color picker
colorPicker.addEventListener('input', (event) => {
    const selectedVar = getSelectedVariable(getCheckedRadioButtonValue());
    document.documentElement.style.setProperty(selectedVar, event.target.value);
    
    // Set the --current-color variable
    document.documentElement.style.setProperty('--current-color', event.target.value);

    currentColorSpan.textContent = event.target.value;
    originalColor = event.target.value
});

function getCheckedRadioButtonValue() {
    return document.querySelector('input[name="ST-styleRadio"]:checked').value;
}

function getSelectedVariable(style) {
    switch (style) {
      case 'mainbody-text-color':
        return '--mainbody-text-color';
      case 'mainbody-bg-color':
        return '--mainbody-bg-color';
      case 'mainbody-transparency':
        return '--mainbody-opacity'; 
//scrollbar style root vars
      case 'scrollbar-bg-color':
        return '--scrollbar-bg-color';
      case 'scrollbar-border-color':
        return '--scrollbar-border-color';
      case 'scrollbar-thumb-border-color':
        return '--scrollbar-thumb-border-color';
//static page main style root vars??
      case 'staticpage-text-color':
        return '--staticpage-text-color';
      case 'staticpage-bg-color':
        return '--staticpage-bg-color';
      case 'staticpage-transparency':
        return '--staticpage-opacity';
      case 'staticpage-border-color':
        return '--staticpage-border-color';
/*staticpage border*//*
      case 'staticpage-border-width':
        return '--staticpage-border-width';
      case 'staticpage-border-style':
        return '--staticpage-border-style';
      case 'staticpage-border-radius':
        return '--staticpage-border-radius';
*/
        

//static page panel style root vars
      case 'staticpage-panels-border-color':
        return '--staticpage-panels-border-color';
/*staticpage panels border stuff*//*
      case 'staticpage-panels-border-width':
        return '--staticpage-panels-border-width';
      case 'staticpage-panels-border-style':
        return '--staticpage-panels-border-style';
      case 'staticpage-panels-border-radius':
        return '--staticpage-panels-border-radius';
*/
      case 'staticpage-panels-text-color':
        return '--staticpage-panels-text-color';
      case 'staticpage-panels-headertext-color':
        return '--staticpage-panels-headertext-color';
      case 'staticpage-panels-bg-color':
        return '--staticpage-panels-bg-color';
      case 'staticpage-panels-transparency':
        return '--staticpage-panels-opacity';
//static page Header/Footer panel style root vars
      case 'staticpage-HFpanels-border-color':
        return '--staticpage-HFpanels-border-color';
/*hfpanels border stuff*//*
      case 'staticpage-HFpanels-border-width':
        return '--staticpage-HFpanels-border-width';
      case 'staticpage-HFpanels-border-style':
        return '--staticpage-HFpanels-border-style';
      case 'staticpage-HFpanels-border-radius':
        return '--staticpage-HFpanels-border-radius';
*/
      case 'staticpage-HFpanels-text-color':
        return '--staticpage-HFpanels-text-color';
      case 'staticpage-HFpanels-bg-color':
        return '--staticpage-HFpanels-bg-color';
      case 'staticpage-HFpanels-transparency':
        return '--staticpage-HFpanels-opacity';
        

//static page side panels style root vars
      case 'staticpage-sidepanels-border-color':
        return '--staticpage-sidepanels-border-color';
/*staticpage side panels border stuff*//*
      case 'staticpage-sidepanels-border-width':
        return '--staticpage-sidepanels-border-width';
      case 'staticpage-sidepanels-border-style':
        return '--staticpage-sidepanels-border-style';
      case 'staticpage-sidepanels-border-radius':
        return '--staticpage-sidepanels-border-radius';
*/
      case 'staticpage-sidepanels-text-color':
        return '--staticpage-sidepanels-text-color';
      case 'staticpage-sidepanels-bg-color':
        return '--staticpage-sidepanels-bg-color';
      case 'staticpage-sidepanels-transparency':
        return '--staticpage-sidepanels-opacity';

//static page maincontent style root vars
      case 'staticpage-maincontent-border-color':
        return '--staticpage-maincontent-border-color';

/*staticpage maincontent border stuff*//*
      case 'staticpage-maincontent-border-width':
        return '--staticpage-maincontent-border-width';
      case 'staticpage-maincontent-border-style':
        return '--staticpage-maincontent-border-style';
      case 'staticpage-sidepanels-border-radius':
        return '--staticpage-maincontent-border-radius';
*/
      case 'staticpage-maincontent-text-color':
        return '--staticpage-maincontent-text-color';
      case 'staticpage-maincontent-bg-color':
        return '--staticpage-maincontent-bg-color';
      case 'staticpage-inner-bg-color':
        return '--staticpage-inner-bg-color';
      case 'staticpage-inner-transparency':
        return '--staticpage-inner-opacity';

//hudoverlay main style root vars
      case 'HUD-applet-border-color':
        return '--HUD-applet-border-color';
      case 'hudoverlay-border-color':
        return '--hudoverlay-border-color';
/*
      case 'hudoverlay-border-width':
        return '--hudoverlay-border-width';
      case 'hudoverlay-border-style':
        return '--hudoverlay-border-style';
      case 'hudoverlay-border-radius':
        return '--hudoverlay-border-radius';
*/
      case 'HUD-bg-color':
        return '--HUD-bg-color';
      case 'HUD-text-color':
        return '--HUD-text-color';
      case 'HUD-border-color':
        return '--HUD-border-color';
        
      case 'hudoverlay-bg-color':
        return '--hudoverlay-bg-color';
      case 'hudoverlay-transparency':
        return '--hudoverlay-opacity';
      case 'HUD-windows-bg-color':
        return '--HUD-windows-bg-color';
      case 'HUD-active-border-color':
        return '--HUD-active-border-color';
        
//unused example new root vars
/*
      case 'newradiobutton6':
        return '--newradiobutton6';
      case 'newradiobutton7':
        return '--newradiobutton7';
      case 'newradiobutton5':
        return '--newradiobutton5';
      case 'newradiobutton6':
        return '--newradiobutton6';
      case 'newradiobutton7':
        return '--newradiobutton7';
        // Add more cases if needed
*/
      default:
        return '';
    }
}

// Function to get the opacity value from the root variable
function getOpacityValue(selectedVar) {
    // Get the opacity value from the root variable
    const opacityString = getComputedStyle(document.documentElement).getPropertyValue(selectedVar).trim();
    // Convert the opacity string to a number
    return parseFloat(opacityString);
}


function setColorOpacity() {
  // set color to either rainbow or normal paint color 
	let newColor
  if (ifRainbowColor) {
    const hue = (frameCount * 2) % 360	
    newColor = color(`hsba(${hue}, 100%, 100%, 0.6)`)
  } else {
		newColor = paintColor
  }

  // set the color and opacity of the stroke and fill
  newColor.setAlpha(opacity)
  setrootvar(newColor)
}

opacitySlider.addEventListener('input', () => {
    const checkedRadioButtonValue = getCheckedRadioButtonValue();
    const selectedVar = getSelectedVariable(checkedRadioButtonValue);
    const opacity = opacitySlider.value;
    
    // Check if the selected radio button is for transparency
    if (checkedRadioButtonValue === 'staticpage-transparency' || 
        checkedRadioButtonValue === 'hudoverlay-transparency' ||
        checkedRadioButtonValue === 'mainbody-transparency') {
        // Set the opacity root variable directly
        document.documentElement.style.setProperty(selectedVar, opacity);
        console.log('checked button:', checkedRadioButtonValue);
        console.log('Selected var:', selectedVar);
        console.log('Slider value:', opacity);
        return; // Exit early since we've handled the transparency case
    }
    
    // For other cases (non-transparency), update color-related settings
    const rgbaColor = convertHexToRGBA(originalColor, opacity);
    document.documentElement.style.setProperty(selectedVar, rgbaColor);
    document.documentElement.style.setProperty('--current-color', rgbaColor);
    currentColorSpan.textContent = rgbaColor;
    console.log('checked button:', checkedRadioButtonValue);
    console.log('Selected var:', selectedVar);
    console.log('Slider value:', opacity);
});

// Helper function to convert hex color to RGBA with opacity
function convertHexToRGBA(hex, opacity) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r},${g},${b},${opacity})`;
}

//==========================
// END OF STYLE TUNER CODE
//===================================================================

//==========================
// Main Hud Power and Power Button CODE
//===================================================================

const powerCheckbox = document.getElementById('powercheckbox');
const hudMonitorPower = document.querySelector('.hudMonitorPower');

// Might as well 1Set transition properties directly in JavaScript 
hudMonitorPower.style.transition = 'visibility 2.0s,height 1.6s, opacity 1.9s linear';
powerCheckbox.addEventListener('change', function() {
  if (this.checked) { // Turn Main Hud Power ON
    hudMonitorPower.style.height = '100Vh';
    hudMonitorPower.style.opacity = '1.0';
    hudMonitorPower.style.visibility = 'visible';
  } else { // Turn Main Hud Power OFF
    hudMonitorPower.style.visibility = 'hidden';
    hudMonitorPower.style.height = '0';
    hudMonitorPower.style.opacity = '0.1';
  }
});

//==========================
// START OF HUD CODE
//===================================================================
// windows
const windowIds = [];

// Push window IDs into the array
windowIds.push('hud-Applets');
windowIds.push('hud-Example');
windowIds.push('hud-NewDigs');


// Push EuApplet window IDs into the array
windowIds.push('hud-EuTools');
windowIds.push('hud-EuItemSorter');
windowIds.push('hud-OrdinanceJuxtapositioner');
windowIds.push('hud-EuStashManager');
windowIds.push('hud-EuCalender');
windowIds.push('hud-EuEventPlanner');
// Push EuApplet EuStash submenu window IDs into the array
windowIds.push('hud-EuItemstash');
windowIds.push('hud-EuItemStashAdditions');
windowIds.push('hud-EuEditStashMenu');
windowIds.push('hud-EuRestockItemStashMenu');
windowIds.push('hud-EuSellitemsMenu');
windowIds.push('hud-EuStashpriceListMenu');

// Push Games Applet window IDs into the array
windowIds.push('hud-Games');
// Push sus-snake Game Applet window ID into the array
windowIds.push('hud-sus-snake');
//MAKING HUD WINDOWS DRAGGABLE
const makeDraggable = (header, windowElement) => {
    let isDragging = false;
    let mouseX;
    let mouseY;
    let offsetX;
    let offsetY;
    let lastElement;
    let currentElement;
    let lastElemendid;
    let lastElementzIndex;
    let currentzIndex;
    let newzIndex;
    const windowBoundaries = document.querySelector('.layerheight');
    const  handleMouseDown = (e) => {
        isDragging = true;
        mouseX = e.clientX;
        mouseY = e.clientY;
        offsetX = windowElement.offsetLeft;
        offsetY = windowElement.offsetTop;
        if (lastElement) { //Check if lastelement exists
            lastElement.classList.remove('currentwindow'); 
        } else {
          lastElement = windowElement;
          lastElemendid = windowElement.id;// Update lastelement
        }
        header.classList.add('dragging-header');
        windowElement.classList.remove('lastwindow');
        windowElement.classList.add('currentwindow');
    };

    const handleMouseMove = (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - mouseX;
        const deltaY = e.clientY - mouseY;

        // Calculate the new position
        const newX = offsetX + deltaX;
        const newY = offsetY + deltaY;

        // Check if the new position is within the boundaries of the horizontalScroll div
        const maxX = windowBoundaries.offsetWidth - windowElement.offsetWidth;
        const maxY = windowBoundaries.offsetHeight - windowElement.offsetHeight;

        // Update the position only if it's within the boundaries
        if (newX >= 0 && newX <= maxX) {
            windowElement.style.left = newX + 'px';
        }
        if (newY >= 0 && newY <= maxY) {
            windowElement.style.top = newY + 'px';
        }
    };

    const handleMouseUp = () => {
        isDragging = false;
        // Remove 'dragging-header' class on mouseup
        header.classList.remove('dragging-header');
        // Remove 'active' class from the window
        windowElement.classList.remove('active');
    };

    header.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
};

// Apply draggable functionality to all elements with the class "draggable-header"
const draggableHeaders = document.querySelectorAll('.draggable-header');
draggableHeaders.forEach((header) => {
    const windowElement = header.closest('[data-draggable="true"]');
    if (windowElement) {
        makeDraggable(header, windowElement);
    }
});
// Select all elements with the class "window"
const windows = document.querySelectorAll('.window');
// Select all elements with the class "draggable-header"
// Add click event listeners to each draggable header for setting border-color
draggableHeaders.forEach(header => {
  header.addEventListener('mousedown', (e) => {
    // Remove the 'current' class from all windows
    windows.forEach(win => {
      win.classList.remove('current');
    });

    // Add the 'active' and 'current' classes to the window containing the clicked header
    const windowElement = header.closest('.window');
    if (windowElement) {
      windowElement.classList.add('active', 'current');
    }

    // Prevent default behavior to avoid interference with dragging functionality
    e.preventDefault();
  });
});
// Function to remove classes .current and .currentwindow from all windows
const removeCurrentClasses = () => {
    windows.forEach(window => {
        window.classList.remove('current', 'currentwindow');
    });
};
// Function to handle window click event
const handleWindowClick = (event) => {
    const clickedWindow = event.currentTarget;
    removeCurrentClasses();
    clickedWindow.classList.add('current', 'currentwindow');
};
// Remove the previous click event listeners from the windows
windows.forEach(window => {
  window.addEventListener('click', handleWindowClick);
  window.removeEventListener('mousedown', () => {});
});

//wINDOW MENU BAR TAB BUTTONS
// Function to add a tab button to the tabcontainer
const addTabButton = (windowId, windowName) => {
    // Create a new button element for the tab
    const tabButton = document.createElement('button');
    tabButton.className = 'tabButt';
    tabButton.id = windowId + 'tab'; // Use the windowId to ensure unique IDs
    tabButton.textContent = windowName; // Set the text content to the windowName

    // Create a close button inside the tab button
    const closeButton = document.createElement('span');
    closeButton.className = 'closeTabButton';
    closeButton.textContent = ' [x]';
    closeButton.addEventListener('click', (event) => {
        event.stopPropagation(); // Prevent the tab button click event from firing
        // Close the associated window and remove the tab button
        closeWindowAndTab(windowId);
    });

    // Append the close button to the tab button
    tabButton.appendChild(closeButton);

    // Add a click event listener to the tab button to maximize the associated window
    tabButton.addEventListener('click', () => {
        // Maximize the window
        const windowElement = document.getElementById(windowId);
        const maxButton = windowElement.querySelector('.maxbutt');
        if (windowElement && maxButton) {
            maximizeWindow(windowElement, maxButton);
            // Remove 'currentwindow' class from other windows
            const otherWindows = document.querySelectorAll('.window');
            otherWindows.forEach(win => {
                if (win.id !== windowId) {
                    win.classList.remove('currentwindow', 'current');
                }
                // Add 'currentwindow' class to the associated window
                windowElement.classList.add('currentwindow', 'current');
                windowElement.classList.remove('unfocused');
            });
        }
    });

    // Append the tab button to the tabcontainer
    const tabContainer = document.getElementById('HUD-openwindowtabs');
    if (tabContainer) {
        tabContainer.appendChild(tabButton);
        // Store the tab button element in the tabButtons object
        tabButtons[windowId] = tabButton;
    }
};
// Function to close the associated window and remove the tab button
const closeWindowAndTab = (windowId) => {
    // Close the window
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
        windowElement.classList.add('hidden');
        windowElement.classList.remove('maxed', 'unfocused', 'current', 'currentwindow');
        console.log(windowId + ' closed');
    }

    // Remove the associated tab button
    const tabButton = tabButtons[windowId];
    if (tabButton) {
        tabButton.remove();
        delete tabButtons[windowId];
    }
};

// Define an object to store tab button elements
const tabButtons = {};
// Function to toggle the visibility of a window based on its ID
const toggleWindowVisibility = (windowId) => {
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
        if (windowElement.classList.contains('hidden')) {
            windowElement.classList.remove('hidden');
            console.log(windowId + ' opened');
            // Add the tab button when the window is opened
            addTabButton(windowId, windowId);
        } else {
            console.log(windowId + ' is already open');
        }
    } else {
        console.log(windowId + ' does not exist');
    }
};
// Function to close all windows
const closeAllWindows = () => {
    windowIds.forEach(windowId => {
        const windowElement = document.getElementById(windowId);
        if (windowElement && !windowElement.classList.contains('hidden')) {
            windowElement.classList.add('hidden');
            console.log(windowId + ' closed');
            // Remove the tab button when the window is closed
            const tabButton = tabButtons[windowId];
            if (tabButton) {
                tabButton.remove();
                delete tabButtons[windowId];
            }
        }
    });
};

// Example usage:
// Toggle visibility of a specific window
// toggleWindowVisibility('hud-Applets');

// Close all windows when script loads
closeAllWindows();
//------------END OF WINDOW main code------------------------


// Add event listeners to the menu buttons
const menuButtons = document.querySelectorAll('.menubutt');
// event listener function for menu buttons
menuButtons.forEach(button => {
  button.addEventListener('click', function() {
    // Get the data-window-id attribute value of the clicked button
    const windowId = button.getAttribute('data-window-id');
    // Toggle the visibility of the corresponding window
    toggleWindowVisibility(windowId);
  });
});
// get the submenu buttons in side the hudmenu
const submenuButtons = document.querySelectorAll('.hudsubmenuButt');
// event listener function for menu buttons
submenuButtons.forEach(button => {
  button.addEventListener('click', function() {
    // Get the data-window-id attribute value of the clicked button
    const windowId = button.getAttribute('data-window-id');
    // Toggle the visibility of the corresponding window
    toggleWindowVisibility(windowId);
  });
});


//APPLET WINDOW - ( LIST OF ITEMS SIMILAR TO FILE FOLDER PERHAPS RENAME THIGNS TO INSINUATE THIS FOR INTUITIVENESS)
// Get all the buttons inside the .applet-list
const appletButtons = document.querySelectorAll('.applet-list .applet');
// Function to open the corresponding window when an applet button is clicked
const openAppletWindow = (appName) => {
    // Remove the '.exe' suffix from the applet name
    appName = appName.replace('.exe', '');
    
    const windowId = 'hud-' + appName; // Assuming the window IDs are prefixed with 'hud-'
    const windowElement = document.getElementById(windowId);
    if (windowElement) {
        // Toggle the visibility of the window
        toggleWindowVisibility(windowId);
    } else {
        console.log('Window for ' + appName + ' does not exist.');
    }
};
// Add click event listeners to each applet button
appletButtons.forEach(button => {
    button.addEventListener('click', () => {
        const appName = button.textContent.trim(); // Get the text content of the button
        openAppletWindow(appName);
    });
});

const lockedElements = document.querySelectorAll("#lockedinput");
lockedElements.forEach(button => {
    button.addEventListener("click", function () {
        const targetElement = this.parentElement.querySelector("input, select");
        targetElement.disabled = !targetElement.disabled;

        // Change the image source based on the disabled state
        const img = this.querySelector("img");
        img.src = targetElement.disabled ? "../../Assets/images/mouse_padlock.png" : "../../Assets/images/tools_gear-0.png";
    });
});

// Function to toggle the Sell Item Stash Menu
function toggleSellItemStashMenu(clickedButton) {
    openAppletWindow('EuSellitemsMenu');
}

// Function to toggle the Edit Cache Menu
function toggleEditCacheMenu(clickedButton) {
    openAppletWindow('EuEditStashMenu');
}

// Function to toggle the Restock Item Stash Menu
function toggleRestockItemStashMenu(clickedButton) {
    openAppletWindow('EuRestockItemStashMenu');
}

// Function to toggle the Weapon Cache Menu
function toggleWeaponcacheMenu(clickedButton) {
    openAppletWindow('EuItemStashAdditions');
}

// Function to toggle the Cached Display Button
function cachedisplaybuttonClick(clickedButton) {
    openAppletWindow('stashmaindisplay');
}

// Function to toggle the Weapon Cache Additions Menu
function cachemenubuttonClick2(clickedButton) {
    openAppletWindow('EuItemStashAdditions');
}

// Function to toggle the Weapon Cache Stash Menu
function cachemenubuttonClick3(clickedButton) {
    openAppletWindow('EuItemstash');
}

// Function to toggle the Item Price List Menu
function toggleitempriceList(clickedButton) {
    openAppletWindow('EuStashpriceListMenu');
}
function toggleCacheMenu() {
	var showButton = document.getElementById('showaddcacheitem-Button');
	cachemenubuttonClick2();
	 //
/* 	showButton.classList.toggle('buttonactive', weaponCacheAdditions.style.display !== 'none') */;
	
  // Add your toggle functionality here (e.g., cachemenubuttonClick2())
}

// WINDOW TOOL BAR BUTTONS
//get all buttons with class .maxbutt
const maxButtons = document.querySelectorAll('.maxbutt');

// Function to toggle the 'active' class on a button
const toggleActiveClass = (button) => {
  button.classList.toggle('active');
};

// Function to toggle the visibility of the toolbar
const toggleToolBarVisibility = (button) => {
  // Find the closest .toolBar element relative to the clicked button
  const toolBar = button.closest('.window').querySelector('.toolBar'); // Assuming .toolBar is a child of .window

  // Add some debugging statements
  console.log('Button:', button);
  console.log('ToolBar:', toolBar);

  // Check if the toolBar element exists
  if (toolBar) {
    // If the button is active, show the toolBar by removing the 'hidden' class
    if (button.classList.contains('active')) {
      toolBar.classList.remove('collapsed');
    } else {
      // If the button is not active, hide the toolBar by adding the 'hidden' class
      toolBar.classList.add('collapsed');
    }
  } else {
    console.log('ToolBar not found');
  }
};

// Function to maximize the window
const maximizeWindow = (windowElement, maxButton) => {
  // Get the closest .draggable-menu's width
  const windowsize = maxButton.closest('.verticalscroll');
  const computedStyle = getComputedStyle(windowsize);
  const windowWidth = parseFloat(computedStyle.width); // Convert the width to a numerical value
  // Set the new width to be 2% less than the current width
  const newWidth = windowWidth * 0.98; // Subtract 2% from the windowWidth
  // Set the width and height of the window
  windowElement.style.width = newWidth + 'px';
  windowElement.style.height = '100%';
  // Set the top and left
  windowElement.style.top = '0';
  windowElement.style.left = '0';
  windowElement.classList.add('maxed');
  // Add 'active' class to maxButton
  maxButton.classList.add('active');
  windowElement.classList.remove('unfocused');
  // Show toolbar
  console.log('Maximizing', windowElement.id);
};

// Function to minimize the window
const minimizeWindow = (windowElement, maxButton) => {
  // If window is maximized, minimize it
  windowElement.style.width = '400px';
  windowElement.style.height = '300px';
  windowElement.classList.remove('maxed','unfocused');
  // Remove 'active' class from maxButton
  maxButton.classList.remove('active');
  // Hide toolbar
  console.log('Minimizing', windowElement.id);
};
// Add a click event listener to each .maxbutt button
maxButtons.forEach(maxButton => {
  maxButton.addEventListener('click', function() {
    // Get the closest .window element to the clicked maxButton
    const windowElement = maxButton.closest('.window');
    // Toggle maximize/minimize state of the window
    if (windowElement.classList.contains('maxed')) {
      minimizeWindow(windowElement, maxButton);
    } else {
      maximizeWindow(windowElement, maxButton);
    }
  });
});

// Event listener for button clicks
document.addEventListener('click', (event) => {
  const clickedButton = event.target;
  // Toggle 'active' class on the clicked button
  
 // Check the class of the clicked button and perform appropriate action
    if (clickedButton.classList.contains('toggle-toolbar')) {
        // If the clicked button has class .toggle-toolbar, toggle toolbar visibility
        toggleActiveClass(clickedButton);
        toggleToolBarVisibility(clickedButton);
      // XBUTT CLOSE BUTTON
        } else if (clickedButton.classList.contains('xbutt')) {
        // If the clicked button has class .xbutt, perform close functionality
        console.log('Close button clicked');
        const closestWindow = clickedButton.closest('.window');
        if (closestWindow) {
            closestWindow.classList.add('hidden');
            console.log(closestWindow.id + ' closed');
            // Remove the associated tab button
            const windowId = closestWindow.id;
            const tabButton = tabButtons[windowId];
            if (tabButton) {
                tabButton.remove();
                delete tabButtons[windowId];
            }
        }
    } else if (clickedButton.classList.contains('minbutt')) {
      // If the clicked button has class .minbutt, send a console message
      console.log('Minimize button clicked');
      const closestWindow = clickedButton.closest('.window');
      if (closestWindow) {
          console.log('Minimize button for ' + closestWindow.id + ' clicked');
          // Set styles for minimizing
          closestWindow.style.height = '75px';
          closestWindow.style.width = '250px';
          closestWindow.style.top = '97%';
          closestWindow.style.left = '6px';
          // Remove classes and add .unfocused
          closestWindow.classList.remove('current', 'currentwindow', 'maxed');
          closestWindow.classList.add('unfocused');
      }
    }
  });

