// JavaScript for custom resizer
const resizable = document.querySelector('.resizable');
const resizer = document.querySelector('.resizer');

resizer.addEventListener('mousedown', function(e) {
  e.preventDefault();
  
  // Track initial mouse position and container height
  const initialY = e.clientY;
  const initialHeight = resizable.offsetHeight;
  
  function onMouseMove(e) {
    // Calculate the new height
    const newHeight = initialHeight + (e.clientY - initialY);
    resizable.style.height = `${newHeight}px`;  // Set the new height
  }

  function onMouseUp() {
    // Remove the event listeners when the mouse is released
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  }

  // Attach the event listeners to handle resizing
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('mouseup', onMouseUp);
});

// Support touch events for mobile devices
resizer.addEventListener('touchstart', function(e) {
  e.preventDefault();
  
  // Track initial touch position and container height
  const initialY = e.touches[0].clientY;
  const initialHeight = resizable.offsetHeight;
  
  function onTouchMove(e) {
    // Calculate the new height
    const newHeight = initialHeight + (e.touches[0].clientY - initialY);
    resizable.style.height = `${newHeight}px`;  // Set the new height
  }

  function onTouchEnd() {
    // Remove the event listeners when the touch is released
    window.removeEventListener('touchmove', onTouchMove);
    window.removeEventListener('touchend', onTouchEnd);
  }

  // Attach the event listeners to handle resizing
  window.addEventListener('touchmove', onTouchMove);
  window.addEventListener('touchend', onTouchEnd);
});
