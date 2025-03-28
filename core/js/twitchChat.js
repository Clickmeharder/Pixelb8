//--------	Chat ---|
//add this to html:
// <img id="streamerPFP" src="" alt="Streamer Profile Picture" />
//	<div id="twitchchatContainer">
//		<div id="twitchMessagebox">
//		</div>
//	</div>
// and this script:
//<script src="https://cdn.jsdelivr.net/npm/comfy.js@latest/dist/comfy.js"></script>

// Chat message display function
function displayChatMessage(user, message, flags, extra) {
    const chatContainer = document.getElementById("twitchMessagebox");
    // Create a new chat message element
    const chatMessage = document.createElement("div");
    chatMessage.classList.add("chatMessage");

    const usernameSpan = document.createElement("span");
    usernameSpan.classList.add("username");
    usernameSpan.innerHTML = user + ": ";

    const userColor = extra.userColor || "#FFFFFF"; // Default to white if no color is set
    usernameSpan.style.color = userColor; // Apply user color dynamically

    // Create the message element and set its innerHTML
    const messageSpan = document.createElement("span");
    messageSpan.classList.add("twitchmessage");
    messageSpan.innerHTML = message;
	
    // Append the username and message spans to the chat message div
    chatMessage.appendChild(usernameSpan);
    chatMessage.appendChild(messageSpan);
	
    // Add the chat message to the container
    chatContainer.appendChild(chatMessage);
    // Apply a fade effect to the chat message after a delay
    setTimeout(() => {
        chatMessage.style.opacity = '0'; // Fade out after 9 seconds
    }, 15000);
    setTimeout(() => {
        chatMessage.remove();
    }, 15000); // Remove after 4 seconds (1 second for fading)

    // Limit the number of messages displayed in the chat container
    if (chatContainer.children.length > 5) {
        chatContainer.removeChild(chatContainer.firstChild);
    }
}

function togglechatElement(elementId, animationType = "fade") {
    const element = document.getElementById(elementId);

    if (!element) return;

    if (element.style.visibility === "hidden" || element.style.visibility === "") {
        // Show element with animation
        element.style.visibility = "visible";
        element.style.opacity = "1";
        element.style.animation = animationType === "slide" ? "slideIn 0.8s ease-out forwards" : "fadeIn 0.8s ease-out forwards";
    } else {
        // Hide element with animation
        element.style.animation = animationType === "slide" ? "slideOut 0.5s ease-in forwards" : "fadeOut 0.5s ease-in forwards";

        setTimeout(() => {
            element.style.visibility = "hidden";
            element.style.opacity = "0";
        }, 500); // Matches animation duration
    }
}

// Generic function to play any sound
function playchatSound(name) {
    if (sounds[name]) {
        sounds[name].muted = false; // Unmute the sound
        sounds[name].currentTime = 0; // Reset sound to start
        sounds[name].play().catch(error => {
            console.error(`Error playing ${name}:`, error);
        });
    } else {
        console.error(`Sound '${name}' not found.`);
    }
}

//end of chat logic --------------------|
// ComfyJS onChat event handler
ComfyJS.onChat = (user, message, color, flags, extra) => {
    console.log( "UserColor:", extra.userColor, "User:", user, "Message:", message);
    // Call the displayChatMessage function and pass flags and extra for userColor and badges
    displayChatMessage(user, message, flags, extra);  // Show message in chat box
};

ComfyJS.onCommand = (user, command, message, flags, extra) => {
    // Only allow streamer (jaedraze) or mods to trigger these commands
    if (user.toLowerCase() === "jaedraze" || flags.mod) {
		console.log( "User:", user, "command:", command);
		if (command.toLowerCase() === "testsound-1") {
				playSound(); // Play the sound when !playsound is typed in chat
			}
		if (command === "togglechat") {
			togglechatElement("twitchchatContainer", "fade");
		}
		if (command === "chatoption1") {
			togglechatElement("questionWrapper", "fade");
		}
    } else {
        // Example commands that any user can trigger
        if (command.toLowerCase() === "hellochat") {
            // Custom logic to send "Hello, world!" to your overlay chat
            const message = "Hello, world!";
            displayChatMessage("System", message, {}, {}); // Call the function to display the message in the chat overlay
            console.log(`Sent message to overlay: ${message}`); // Log to the console
        }

        if (command.toLowerCase() === "chatjoke") {
            const jokes = [
                "Why don't skeletons fight each other? They don't have the guts!",
                "Why did the scarecrow win an award? Because he was outstanding in his field!",
                "I told my computer I needed a break, and now it won’t stop sending me Kit-Kats!"
            ];
            const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
            displayChatMessage("System", randomJoke, {}, {}); // Sends a random joke to the overlay chat
            console.log(`Sent joke to overlay: ${randomJoke}`); // Log the joke sent to the console
        }
    }
};

let streamername = "jaedraze"; // Default streamer name
ComfyJS.Init(streamername);

function setStreamer(newStreamer) {
    const button = document.getElementById("streamersButt"); // Get the button element
    const input = document.querySelector("#triviacontrolContainer input[type='text']"); // Get the input element
    
    if (newStreamer && newStreamer.trim() !== "") {
        streamername = newStreamer.trim();
        ComfyJS.Init(streamername);
        console.log(`Connected to Twitch chat for: ${streamername}`);

        // Change button text to include the connected streamer
        button.textContent = `Connected to: ${streamername}`; // Set button text with the connected streamer name
        button.style.backgroundColor = "#28a745"; // Green background
        button.style.color = "#0e5b75"; // White text color
        button.style.border = "1px solid #28a745"; // Green border

        // Set the outline to green when valid input
        input.style.outline = "3px outset #28a745"; // Green outline for valid input
    } else {
        console.log("Please enter a valid streamer name.");

        // Change button to red theme for invalid input
        button.textContent = "not connected!"; // Update button text for error
        button.style.backgroundColor = "#dc3545"; // Red background
        button.style.color = "#ffffff"; // White text color
        button.style.border = "1px solid #dc3545"; // Red border

        // Set the outline to red when invalid input
        input.style.outline = "3px outset #dc3545"; // Red outline for invalid input
    }
}

// Button event listener: first endTrivia, then setStreamer
document.getElementById("streamersButt").addEventListener("click", function() {
    if (triviaGameState === "started") {
        endTrivia(); // Only end trivia if it's running
    }

    let newStreamer = document.querySelector("input[name='yourTextName']").value;
    setStreamer(newStreamer); // Then, set the new streamer
});