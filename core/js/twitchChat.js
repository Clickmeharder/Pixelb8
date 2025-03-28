//--------	Chat ---|
//add this to html:
// 
/* 	<!-- Floating Button -->
	<button id="controls-toggle">⚙</button>
	<!-- Trivia Control Container -->
	<div id="comfycontrolContainer">
		<input type="text" name="yourTextName" placeholder="Enter Your Twitch Streamer Name">
		<button id="streamersButt">Connect</button>
		<button id="twitchdisconnectButt" onclick="disconnectBot()">Disconnect from Twitch</button>
		<div id="more-controls">
			<button id="unused">Start Game</button>
			<button id="unused">End Game</button>
		</div>
		<div id="comfy-settings">
			<span id="comfy-settingsheader">Settings</span>
			<label for="timeBetweenQuestions">Seconds Between Questions:</label>
			<input type="number" id="timeBetweenQuestions" value="5" min="1" step="1">
			<label for="timeToAnswer">Time to Answer (seconds):</label>
			<input type="number" id="timeToAnswer" value="10" min="1" step="1">
			<label for="questionsPerRound">Questions Per Round:</label>
			<input type="number" id="questionsPerRound" value="5" min="1" step="1">
			<label for="numberOfRounds">Number of Rounds:</label>
			<input type="number" id="numberOfRounds" value="3" min="1" step="1">
			<label><input type="checkbox" id="chatAnswersToggle" />Allow Chat Answers</label>
			<button id="saveSettings">Save Settings</button>
		</div>
	</div> */
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


function setStreamer(newStreamer) {
    const twitchdisconnectbutton = document.getElementById("twitchdisconnectButt");
    const button = document.getElementById("streamersButt"); 
    const input = document.querySelector("#comfycontrolContainer input[type='text']");

    if (newStreamer && newStreamer.trim() !== "") {
        streamername = newStreamer.trim();
        localStorage.setItem("lastStreamer", streamername); // Save to localStorage
        ComfyJS.Init(streamername);
        console.log(`Connected to Twitch chat for: ${streamername}`);

        // Update button styles
        button.style.display = "none";
        button.style.backgroundColor = "#28a745"; 
        button.style.color = "#0e5b75"; 
        button.style.border = "1px solid #28a745"; 

        twitchdisconnectbutton.style.display = "block"; 
        twitchdisconnectbutton.style.backgroundColor = "#dc3545"; 
        twitchdisconnectbutton.style.color = "#ffffff"; 
        twitchdisconnectbutton.style.border = "1px solid #dc3545"; 

        // Green outline for valid input
        input.style.outline = "3px outset #28a745"; 
    } else {
        console.log("Please enter a valid streamer name.");
        disconnectBot(); // Ensure disconnection
        localStorage.removeItem("lastStreamer"); // Remove stored streamer name

        // Update UI for disconnection
        twitchdisconnectbutton.style.display = "none"; 
        button.textContent = "id10t err: try diff name";
        button.style.backgroundColor = "#dc3545"; 
        button.style.color = "#ffffff"; 
        button.style.border = "1px solid #dc3545"; 

        // Red outline for invalid input
        input.style.outline = "3px outset #dc3545"; 
    }
}

// Auto-reconnect on page load
window.onload = function () {
    const savedStreamer = localStorage.getItem("lastStreamer");
    if (savedStreamer) {
        setStreamer(savedStreamer); // Auto-connect
    }
};

function disconnectBot() {
	const button = document.getElementById("streamersButt");
	button.style.display = "block";
    ComfyJS.Disconnect();
	
    console.log("Bot disconnected from Twitch.");

    // Remove stored streamer name from localStorage
    if (localStorage.getItem("lastStreamer")) {
        localStorage.removeItem("lastStreamer");
        console.log("Removed last connected streamer from storage.");
    }

    // Update UI after disconnecting
    const twitchdisconnectbutton = document.getElementById("twitchdisconnectButt");
    const input = document.querySelector("#comfycontrolContainer input[type='text']");

    twitchdisconnectbutton.style.display = "none"; 
    button.textContent = "Connect";
    button.style.backgroundColor = "#dc3545"; 
    button.style.color = "#ffffff"; 
    button.style.border = "1px solid #dc3545"; 
    input.style.outline = "3px outset #dc3545"; 
}


// Button event listener: first endTrivia, then setStreamer
document.getElementById("streamersButt").addEventListener("click", function() {
/*     if (triviaGameState === "started") {
		console.log("Ending Trivia.");
        endTrivia(); // Only end trivia if it's running
    } */
    let newStreamer = document.querySelector("input[name='yourTextName']").value;
	console.log("attempting to Connect to:" + newStreamer);
    setStreamer(newStreamer); // Then, set the new streamer
});
