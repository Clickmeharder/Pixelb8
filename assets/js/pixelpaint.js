document.addEventListener('DOMContentLoaded', () => {
    const canvasDiv = document.getElementById('pixelpaint');
    const ctx = canvasDiv.getContext('2d');
    let painting = false;
    let color = '#000000'; // Default color (black)
    let lineWidth = 5; // Default line width

    // Set up the canvas size
    function setCanvasSize() {
        canvasDiv.width = window.innerWidth;
        canvasDiv.height = window.innerHeight;
    }

    // Start painting when mouse is down
    function startPosition(e) {
        painting = true;
        draw(e);
    }

    // Stop painting when mouse is up or leaves the canvas
    function endPosition() {
        painting = false;
        ctx.beginPath(); // Reset the drawing path
    }

    // Draw on the canvas
    function draw(e) {
        if (!painting) return;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.strokeStyle = color;

        ctx.lineTo(e.clientX, e.clientY); // Draw to current mouse position
        ctx.stroke(); // Commit the drawing action
        ctx.beginPath();
        ctx.moveTo(e.clientX, e.clientY); // Move the start point to current mouse position
    }

    // Set up event listeners for mouse interaction
    canvasDiv.addEventListener('mousedown', startPosition);
    canvasDiv.addEventListener('mousemove', draw);
    canvasDiv.addEventListener('mouseup', endPosition);
    canvasDiv.addEventListener('mouseout', endPosition);

    // Adjust the canvas size when the window is resized
    window.addEventListener('resize', setCanvasSize);
    setCanvasSize(); // Set initial canvas size

    // Optional: Change color and line width
    function setColor(newColor) {
        color = newColor;
    }

    function setLineWidth(newWidth) {
        lineWidth = newWidth;
    }

    // Example of changing the color and line width dynamically:
    // setColor('#ff0000'); // Set to red
    // setLineWidth(10); // Set to thicker line
});