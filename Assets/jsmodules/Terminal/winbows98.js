document.addEventListener("DOMContentLoaded", function () {
    const commandInput = document.getElementById("commandInput");
    const outputElement = document.getElementById("output-container");
    const maximizeTerminalButton = document.getElementById("maximize-terminal");
    const minimizeTerminalButton = document.getElementById("minimize-terminal");
    const closeTerminalButton = document.getElementById("close-terminal");
    const toggleTerminalButton = document.getElementById("toggle-terminal");
    const terminalContainer = document.querySelector(".terminal-container");
    let isTerminalVisible = false;
    let isAnimating = false;

    // Hide the terminal container by default
    terminalContainer.style.bottom = "-207px"; // Off-screen position

    // Add event listener to toggle terminal visibility
    maximizeTerminalButton.addEventListener("click", function () {
        if (!isAnimating) {
            if (isTerminalVisible) {
                slideOut(terminalContainer);
            } else {
                slideIn(terminalContainer);
            }

            isTerminalVisible = !isTerminalVisible;
        }
    });

    function slideIn(element) {
        isAnimating = true;
        let position = 0;
        const animationInterval = setInterval(function () {
            if (position >= 500) {
                clearInterval(animationInterval);
                isAnimating = false;
            } else {
                position += 5;
                element.style.left = 0 + "px";
                element.style.bottom = 0 + "px";
                element.style.top = "";
                element.style.width = 100 + "%";
                element.style.height = 100 + "%";
            }
        }, 10);
    }

    function slideOut(element) {
        isAnimating = true;
        let position = 0;
        const animationInterval = setInterval(function () {
            if (position >= 500) {
                clearInterval(animationInterval);
                isAnimating = false;
            } else {
                position += 5;
                element.style.left = 0 + "px";
                element.style.bottom = -208 + "px";
                element.style.top = "";
                element.style.width = 200 + "px";
                element.style.height = 229 + "px";
            }
        }, 10);
    }

    // Add event listener to toggle terminal visibility
    minimizeTerminalButton.addEventListener("click", function () {
        if (!isAnimating) {
            if (terminalContainer.style.bottom >= "-209px") {
                minimize(terminalContainer);
            } else {
                maximize(terminalContainer);
            }
        }
    });

    function minimize(element) {
        isAnimating = true;
        let position = 0;
        const animationInterval = setInterval(function () {
            if (position >= 500) {
                clearInterval(animationInterval);
                isAnimating = false;
            } else {
                position += 5;
                element.style.left = 0 + "px";
                element.style.bottom = -208 + "px";
                element.style.top = "";
                element.style.width = 200 + "px";
                element.style.height = 229 + "px";
            }
        }, 10);
    }

    function maximize(element) {
        isAnimating = true;
        let position = 0;
        const animationInterval = setInterval(function () {
            if (position >= 500) {
                clearInterval(animationInterval);
                isAnimating = false;
            } else {
                position += 5;
                element.style.left = 0 + "px";
                element.style.bottom = 0 + "px";
                element.style.top = "";
                element.style.width = 100 + "%";
                element.style.height = 100 + "%";
            }
        }, 10);
    }

    toggleTerminalButton.addEventListener("click", function () {
        if (terminalContainer.style.display === "none") {
            terminalContainer.style.display = "flex";
        } else {
            terminalContainer.style.display = "none";
        }
    });

    closeTerminalButton.addEventListener("click", function () {
        terminalContainer.style.display = "none";
    });
});

	//----------------------------------------------------------------------

	// Get the container element
	const dragMe = document.getElementById("dragMe");
	const container = document.getElementById("draggable");
	let isDragging = false;
	let offsetX, offsetY;

	// Add mousedown event listener to start dragging
	dragMe.addEventListener("mousedown", (e) => {
	  isDragging = true;
	  offsetX = e.clientX - container.getBoundingClientRect().left;
	  offsetY = e.clientY - container.getBoundingClientRect().top;
	  dragMe.style.cursor = 'grabbing';
	  container.style.zIndex = 999; // Bring the container to the front
	  logMessage("hey put me down!");
	});

	// Add mouseup event listener to stop dragging
	document.addEventListener("mouseup", () => {
	  isDragging = false;
	  dragMe.style.cursor = 'grab';
	  container.style.zIndex = 0; // Restore the z-index
	});

	// Add mousemove event listener to move the container
	document.addEventListener("mousemove", (e) => {
	  if (isDragging) {
		const x = e.clientX - offsetX;
		const y = e.clientY - offsetY;
		container.style.left = x + "px";
		container.style.top = y + "px";
	  }
	});
