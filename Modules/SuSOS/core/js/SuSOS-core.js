//==========================
// youtube player code
//===================================================================
var total = "";
var currentVolume = 45;
var title = "nAn"
var playlist = [];
/*initialize*/
var tag = document.createElement("script");
tag.id = "iframe-demo";
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName("script")[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
/*player creation*/
var player;

function onYouTubeIframeAPIReady() {
  player = new YT.Player("video1", {
    events: {
      onReady: onPlayerReady /*Callbacks*/,
      onStateChange: onPlayerStateChange
    }
  });
}
function progress(percent, $element) {
  var progressBarWidth = (percent * $element.width()) / 100;
  // $element.find('div').animate({ width: progressBarWidth }, 500).html(percent + "%&nbsp;");
  //$element.find("div").animate({ width: progressBarWidth });
}

/*Loading a video player*/
/* function onPlayerReady(event) {
  $("#play-button").click(function () {
    player.playVideo();
    total = player.getDuration();
    time = player.getCurrentTime();
    $(".currentprogress").text(Math.round(time));
  });

  $("#pause-button").click(function () {
    player.pauseVideo();
    total = player.getDuration();
    time = player.getCurrentTime();
    playerTimeDifference = (time / total) * 100;
    progress(playerTimeDifference, $("#progressBar"));
  });
} */

function onPlayerStateChange(event) {
  if (event.data == 1) {
    // playing
	playlist = player.getPlaylist();
    $("#progressBar").show();
    total = player.getDuration();
    myTimer = setInterval(function () {
      time = player.getCurrentTime();
      playerTimeDifference = (time / total) * 100;
      $(".currentprogress").text(Math.round(time));
    }, 1000); // 100 means repeat in 100 ms
  } else {
    // not playing
    $("#progressBar").hide();
  }
  $(".duration").text(Math.floor(total));
}
function shufflePlaylist() {
  if (playlist.length > 0) {
    var randomIndex = Math.floor(Math.random() * playlist.length);
    player.playVideoAt(randomIndex);
  } else if (playlist.length > 0 && playlist.length < 301) {
    var randomNumber = Math.floor(Math.random() * 300) + 1;
    console.log("RobBot: I think i will play track number " + randomNumber);
    // Additional logic can be added here if needed
  }
}

const volumeWrapper = document.getElementById('mastervolumewrapper');
const masterVolume = document.getElementById('masterVolume');
/*Loading a video player*/
function onPlayerReady(event) {
  $("#previous-button").click(function () {
	player.previousVideo();
	total = player.getDuration();
    time = player.getCurrentTime();
    $(".currentprogress").text(Math.round(time));
  });
  $("#play-button").click(function () {
    player.playVideo();
    total = player.getDuration();
    time = player.getCurrentTime();
    $(".currentprogress").text(Math.round(time));
  });
  $("#pause-button").click(function () {
    player.pauseVideo();
    total = player.getDuration();
    time = player.getCurrentTime();
    playerTimeDifference = (time / total) * 100;
    progress(playerTimeDifference, $("#progressBar"));
  });
  $("#next-button").click(function () {
    player.nextVideo();
	total = player.getDuration();
    time = player.getCurrentTime();
    $(".currentprogress").text(Math.round(time));
  });

   $("#shuffle-button").click(function () {
	shufflePlaylist();
	total = player.getDuration();
    time = player.getCurrentTime();
    $(".currentprogress").text(Math.round(time));
  });


  $("#audiosettings-play-button").click(function () {
    player.playVideo();
    total = player.getDuration();
    time = player.getCurrentTime();
    $(".currentprogress").text(Math.round(time));
  });

  $("#audiosettings-pause-button").click(function () {
    player.pauseVideo();
    total = player.getDuration();
    time = player.getCurrentTime();
    playerTimeDifference = (time / total) * 100;
    progress(playerTimeDifference, $("#progressBar"));
  });
/* 
  $("#audiosettings-previous-button").click(function () {
	player.previousVideo();
	total = player.getDuration();
    time = player.getCurrentTime();
    $(".currentprogress").text(Math.round(time));
  });
  $("#audiosettings-next-button").click(function () {
    player.nextVideo();
	total = player.getDuration();
    time = player.getCurrentTime();
    $(".currentprogress").text(Math.round(time));
  });
   $("#audiosettings-shuffle-button").click(function () {
	shufflePlaylist();
	total = player.getDuration();
    time = player.getCurrentTime();
    $(".currentprogress").text(Math.round(time));
  }); */

  $("#mainAudioDial").on("input", function () {
	currentVolume = $(this).val(); // Update currentVolume
	$(".vol").text(currentVolume);
	player.setVolume(currentVolume);
	masterVolume.textContent = currentVolume;
    // Show the volume wrapper
    volumeWrapper.style.display = "initial";
    // Add a delay before hiding the volume wrapper
    setTimeout(function() {
      volumeWrapper.style.display = "none";
    }, 2000); // Delay of 2000 milliseconds (2 seconds)
  });
}
function announceVolume(volume) {
  var msg = new SpeechSynthesisUtterance("Robbot: My volume level is set to" + volume + '.');
  speechSynthesis.speak(msg);
}

/*
Some Commonly used Methods:

player.getDuration(); - Returns Time in Numbers
-------------------
player.playVideo();
 --------------------	
player.pauseVideo();
------------------
player.getVideoUrl():String
------------------
player.getVideoEmbedCode():String
------------------
player.destroy():Void
------------------
player.getPlayerState():

    -1 – unstarted
    0 – ended
    1 – playing
    2 – paused
    3 – buffering
    5 – video cued
-------------------
player.getCurrentTime() - Returns Time in Numbers
-----------------
player.getPlaybackQuality():String

highres, hd1080, hd720, large, medium and small 
-----------------
player.setPlaybackQuality(suggestedQuality:String) - Return type Void

*/
 


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
windowIds.push('hud-Settings');

windowIds.push('hud-AudioSettings');


// Push EuApplet window IDs into the array
windowIds.push('hud-EuTools');
windowIds.push('hud-EuItemSorter');
windowIds.push('hud-OrdinanceJuxtapositioner');
windowIds.push('hud-EuStashManager');
windowIds.push('hud-EuCalender');
windowIds.push('hud-EuEventPlanner');
windowIds.push('hud-susIntel');
// Push EuApplet EuStash submenu window IDs into the array
windowIds.push('hud-EuItemstash');
windowIds.push('hud-EuItemStashAdditions');
windowIds.push('hud-EuEditStashMenu');
windowIds.push('hud-EuRestockItemStashMenu');
windowIds.push('hud-EuSellitemsMenu');
windowIds.push('hud-EuStashpriceListMenu');
windowIds.push('hud-EucreatePLMenu');
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
	const windowtabName = windowName.replace(/^hud-/, '');
    const tabButton = document.createElement('button');
    tabButton.className = 'tabButt';
    tabButton.id = windowId + 'tab'; // Use the windowId to ensure unique IDs
    tabButton.textContent = windowtabName; // Set the text content to the windowName

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
            console.log('Closed all open windows');
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
        img.src = targetElement.disabled ? "../../assets/images/icons/mouse_padlock.png" : "../../assets/images/icons/tools_gear-0.png";
    });
});

// Function to toggle the Sell Item Stash Menu
function toggleSellItemStashMenu(clickedButton) {
    openAppletWindow('EuSellitemsMenu');
}
// Function to toggle the Sell Item Stash Menu
function toggleCreatePLMenu(clickedButton) {
    openAppletWindow('EucreatePLMenu');
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

console.log('this dev sux.');