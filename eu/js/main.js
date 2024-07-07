document.getElementById('susIntel-fileInput').addEventListener('change', handleFileSelect, false);
document.getElementById('susIntel-searchButton').addEventListener('click', handleSearch, false);

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            console.log('File loaded successfully');
            document.fileContent = content; // Save the file content to use later
        };
        reader.onerror = function() {
            console.error('Error reading file');
        };
        reader.readAsText(file);
    } else {
        console.error('No file selected');
    }
}

function handleSearch() {
    console.log('Analyze button clicked');
    const keywords = document.getElementById('susIntel-keyword').value.split(',');
    const channels = Array.from(document.querySelectorAll('input[name="logType"]:checked')).map(input => input.value);
    let days = parseInt(document.getElementById('resultsolderthanXdays').value, 10);

    // Default to 7 if days is NaN or less than 1
    if (isNaN(days) || days < 1) {
        days = 7;
    }

    console.log('Keywords:', keywords);
    console.log('Channels:', channels);
    console.log('Days:', days);

    if (document.fileContent) {
        console.log('Sending data to worker');
        const worker = new Worker('js/worker.js');
        worker.postMessage({ content: document.fileContent, keywords, channels, days });
        worker.onmessage = function(event) {
            console.log('Received data from worker');
            displayResults(event.data);
        };
        worker.onerror = function(error) {
            console.error('Worker error:', error);
        };
    } else {
        console.error('No file content available');
        alert('Please select a file first.');
    }
}
function displayResults(results) {
    console.log('Displaying results');
    const resultContainer = document.getElementById('susIntel-results');
    resultContainer.innerHTML = results.join('<br>');
}


//draggable logic
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
    const windowBoundaries = document.querySelector('body');
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
       
            windowElement.style.left = newX + 'px';
            windowElement.style.top = newY + 'px';
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
