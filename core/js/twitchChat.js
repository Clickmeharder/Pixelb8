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
// Chat message display function
// Chat message display function
function displayChatMessage(user, message, flags = {}, extra = {}, isCorrect = false) {
    const chatContainer = document.getElementById("twitchMessagebox");

    // Create a new chat message element
    const chatMessage = document.createElement("div");
    chatMessage.classList.add("chatMessage");

    const usernameSpan = document.createElement("span");
    usernameSpan.classList.add("username");
    usernameSpan.innerHTML = user + ": ";

    const userColor = extra.userColor || "#FFFFFF"; // Default to white if no color is set
    usernameSpan.style.color = userColor; // Apply user color dynamically

    // Process the message and get emotes
    const processedMessage = processMessageWithEmotes(message, extra.messageEmotes);

    // Create the message element
    const messageSpan = document.createElement("span");
    messageSpan.classList.add("twitchmessage");
    messageSpan.innerHTML = processedMessage.message; 

    // Append elements to the chat message div
    chatMessage.appendChild(usernameSpan);
    chatMessage.appendChild(messageSpan);
    
    // Add the chat message to the container
    chatContainer.appendChild(chatMessage);
    
    // Trigger emote animation effect
    processedMessage.emoteList.forEach(emoteURL => animateFloatingEmote(emoteURL));

    // Apply a fade effect after a delay
    setTimeout(() => {
        chatMessage.style.opacity = '0'; // Fade out after 9 seconds
    }, 15000);
	// Remove after 15 seconds
    // setTimeout(() => {
        // chatMessage.remove();
    // }, 15000);

    // Limit messages to the last 5
    if (chatContainer.children.length > 5) {
        chatContainer.removeChild(chatContainer.firstChild);
    }
}
let consoleMessages = true;  // Flag to control whether to show console messages

function displayConsoleMessage(message) {
    if (!consoleMessages) return;  // If consoleMessages is false, do nothing
    // Create a new console message element
    const consoleContainer = document.getElementById("consoleMessagebox");
    const consoleMessage = document.createElement("div");
    consoleMessage.classList.add("consoleMessage");
    // Create the message element
    const messageSpan = document.createElement("span");
    messageSpan.classList.add("consolemessage");
    messageSpan.innerHTML = message;
    // Append the message to the console container
    consoleContainer.appendChild(consoleMessage);
    // Apply a fade effect after a delay
    setTimeout(() => {
        consoleMessage.style.opacity = '0'; // Fade out after 9 seconds
    }, 15000);
    setTimeout(() => {
        consoleMessage.remove();
    }, 15000); // Remove after 15 seconds
    // Limit messages to the last 5
    if (consoleContainer.children.length > 5) {
        consoleContainer.removeChild(consoleContainer.firstChild);
    }
}
function toggleConsoleMessages() {
    consoleMessages = !consoleMessages;  // Toggle the boolean value
    console.log(`Console messages are now ${consoleMessages ? "enabled" : "disabled"}`);
}
/**
 * Process a message and replace Twitch emotes with images.
 * Returns: { message: formattedMessage, emoteList: [emoteURLs] }
 */
function processMessageWithEmotes(message, messageEmotes) {
    if (!messageEmotes) return { message, emoteList: [] }; // No emotes, return original

    let messageArray = message.split('');
    let emoteList = [];

    Object.keys(messageEmotes).forEach(emoteID => {
        messageEmotes[emoteID].forEach(range => {
            let [start, end] = range.split('-').map(Number);
            let emoteURL = `https://static-cdn.jtvnw.net/emoticons/v2/${emoteID}/default/dark/3.0`;
            emoteList.push(emoteURL); // Store for floating effect

            // Insert emote image and clear old characters
            messageArray[start] = `<img src="${emoteURL}" class="twitchEmote">`;
            for (let i = start + 1; i <= end; i++) {
                messageArray[i] = ''; 
            }
        });
    });

    return { message: messageArray.join(''), emoteList };
}
/**
 * Create a floating animation for Twitch emotes
 */
function animateFloatingEmote(emoteURL) {
    const emote = document.createElement("img");
    emote.src = emoteURL;
    emote.classList.add("floatingEmote");

    let size = Math.random() * 16 + 64; // Random size between 64px - 80px
    emote.style.width = `${size}px`;
    emote.style.height = `${size}px`;

    // Start from a random position (anywhere on screen)
    emote.style.left = Math.random() * 100 + "vw";
    emote.style.top = Math.random() * 100 + "vh";
    emote.style.opacity = "1";
    emote.style.transform = `scale(${Math.random() * 0.2 + 0.9})`;

    document.body.appendChild(emote);

    // Random movement directions with increased range for faster movement
    let randomX = (Math.random() - 0.5) * 600; // Moves left or right, increased distance
    let randomY = (Math.random() - 0.5) * 600; // Moves up or down, increased distance

    setTimeout(() => {
        emote.style.transition = "transform 5s linear, opacity 8s ease-out"; // **Floats faster**
        emote.style.transform = `translate(${randomX}px, ${randomY}px) scale(${Math.random() * 0.8 + 0.8})`; 
        emote.style.opacity = "0.7";
    }, 100);

    setTimeout(() => emote.remove(), 7000); // **Lasts 5 seconds before removal**
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

let chataudioSetting = "on"; // Change to "off" to mute all sounds

const chatsounds = {
    messageSound: new Audio("/assets/sounds/snakedie_sound1.mp3"),
	commandSound: new Audio("/assets/sounds/snakedie_sound1.mp3"),
    //gameshowintro: new Audio("/assets/sounds/gameshow_intro.mp3"),
    // Add more sounds here
};
function playChatSound(name) {
    if (chataudioSetting === "off") return; // Stop if audio is disabled

    if (chatsounds[name]) {
        chatsounds[name].muted = false; // Unmute the sound
        chatsounds[name].currentTime = 0; // Reset sound to start
        chatsounds[name].play().catch(error => {
            console.error(`Error playing ${name}:`, error);
        });
    } else {
        console.error(`Sound '${name}' not found.`);
    }
}
// Function to toggle audio on/off
function toggleChatAudioSetting() {
    chataudioSetting = chataudioSetting === "on" ? "off" : "on";
    console.log(`chat Audio setting is now: ${chataudioSetting}`);
}



//end of chat logic --------------------|
// ComfyJS onChat event handler
let streamername = "jaedraze"; // Default streamer name
ComfyJS.onChat = (user, message, color, flags, extra) => {
    console.log("UserColor:", extra.userColor, "User:", user, "Message:", message);
    console.log("Emotes:", extra.messageEmotes); // Debugging: Check if emotes are detected
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
    }
};


//!!!!!!!!!!!!!!!!!!!!!!!
// Our Comfy Connection
//!!!!!!!!!!!!!!!!!!!!!!!

function setStreamer(newStreamer) {
    const twitchdisconnectbutton = document.getElementById("twitchdisconnectButt");
    const button = document.getElementById("streamersButt"); 
    const input = document.querySelector("#comfycontrolContainer input[type='text']");

    if (newStreamer && newStreamer.trim() !== "") {
        streamername = newStreamer.trim();
		 // Save to localStorage
        localStorage.setItem("lastStreamer", streamername);
        ComfyJS.Init(streamername);
        console.log(`Connected to Twitch chat for: ${streamername}`);
        // Update button styles
		//hide connect button and streamer input
        button.style.display = "none";
		input.style.display = "none";
		// Green outline for valid input --remove if display none/block works right
        input.style.outline = "3px outset #28a745";
		//show disconnect button and style it
        twitchdisconnectbutton.style.display = "block"; 
        twitchdisconnectbutton.style.backgroundColor = "#b71a29eb"; 
        twitchdisconnectbutton.style.color = "#ffffff"; 
        twitchdisconnectbutton.style.border = "1px solid #dc3545";  
    } else {
        console.log("Please enter a valid streamer name.");
        disconnectBot(); // Ensure disconnection
        localStorage.removeItem("lastStreamer"); // Remove stored streamer name
        // Show input with Red outline
		input.style.display = "block";
		input.style.outline = "3px outset #dc3545"; 
        // Update UI for disconnection
        twitchdisconnectbutton.style.display = "none"; 
        button.textContent = "id10t err: try diff name";
        button.style.backgroundColor = "#b71a29eb"; 
        button.style.color = "#ffffff"; 
        button.style.border = "1px solid #dc3545"; 
    }
}
function disconnectBot() {
	const button = document.getElementById("streamersButt");
	const input = document.querySelector("#comfycontrolContainer input[type='text']");
	button.style.display = "block";
	input.style.display = "block";
    ComfyJS.Disconnect();
    console.log("Bot disconnected from Twitch.");
    // Remove stored streamer name from localStorage
    if (localStorage.getItem("lastStreamer")) {
        localStorage.removeItem("lastStreamer");
        console.log("Removed last connected streamer from storage.");
    }
    // Update UI after disconnecting
    const twitchdisconnectbutton = document.getElementById("twitchdisconnectButt");
    
    twitchdisconnectbutton.style.display = "none";
    button.textContent = "Connect";
    button.style.backgroundColor = "#28a745"; 
    button.style.color = "#0e5b75"; 
    button.style.border = "1px solid #28a745";  
    input.style.outline = "3px outset #dc3545"; 
}
// Auto-reconnect on page load
window.onload = function () {
    const savedStreamer = localStorage.getItem("lastStreamer");
    if (savedStreamer) {
        setStreamer(savedStreamer); // Auto-connect
    }
};

document.getElementById("controls-toggle").addEventListener("click", function () {
	let container = document.getElementById("comfycontrolContainer");
	container.classList.toggle("active");
});
// Button event listener: first endTrivia, then setStreamer
document.getElementById("streamersButt").addEventListener("click", function() {
    if (triviaGameState === "started") {
		console.log("Ending Trivia.");
        endTrivia(); // Only end trivia if it's running
    }
    let newStreamer = document.querySelector("input[name='yourTextName']").value;
	console.log("attempting to Connect to:" + newStreamer);
    setStreamer(newStreamer); // Then, set the new streamer
});
