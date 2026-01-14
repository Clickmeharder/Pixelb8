let consoleMessages = false;  // Flag to control whether to show console messages
let chataudioSetting = "on"; // Change to "off" to mute all sounds
let userColors = {};


let chatanswers = false;

let usedefaultquestions = true;
let usecustomquestions = true;
let timetoAnswer = 30;
let timebetweenQuestions = 30;
let timebetweenRounds = 30;
let questionsAsked = 0;
let questionsPerRound = 1;

let audioSetting = "on";
let hideButtonBubble = "on";
let twitchChatOverlay = "on";
let consolemessages = false;

window.chatPlugins = [];




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


function displayConsoleMessage(user, message) {
    if (!consoleMessages) return;  // If consoleMessages is false, do nothing

    // Create a new console message element
    const consoleContainer = document.getElementById("consoleMessagebox");
    const consoleMessage = document.createElement("div");
    consoleMessage.classList.add("consoleMessage");

    // Create the user element
    const usernameSpan = document.createElement("span");
    usernameSpan.classList.add("consoleUser");
    usernameSpan.innerHTML = `${user}: `;  // Display user before message

    // Create the message element
    const messageSpan = document.createElement("span");
    messageSpan.classList.add("consoleMessageText");
    messageSpan.innerHTML = message;

    // Append the username and message to the console message div
    consoleMessage.appendChild(usernameSpan);
    consoleMessage.appendChild(messageSpan);

    // Append the console message to the console container
    consoleContainer.appendChild(consoleMessage);

    // Apply a fade effect after a delay
    setTimeout(() => {
        consoleMessage.style.opacity = '0'; // Fade out after 15 seconds
    }, 15000);

    setTimeout(() => {
        consoleMessage.remove();
    }, 15000); // Remove after 15 seconds

    // Limit messages to the last 5
    if (consoleContainer.children.length > 5) {
        consoleContainer.removeChild(consoleContainer.firstChild);
    }
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
/** * Create a floating Emotre animation for Twitch emotes */
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



//=================================
// - comfy Settings -
//=================================

//------------------------
//---generic ui logic----|
//-----------------------
function updateBubblewrapVisibility() {
	const bubblewrap = document.getElementById("bubblewrap");
	if (!bubblewrap) return;
	const hide = hideButtonBubble === true || hideButtonBubble === "on";
	bubblewrap.style.opacity = hide ? "0.00" : "1.00";
}
updateBubblewrapVisibility();
//document.getElementById('togglehideButtonBubble').addEventListener('click', toggleButtonBubble);

function toggleConsoleMessages() {
    consoleMessages = !consoleMessages;  // Toggle the boolean value
    console.log(`Console messages are now ${consoleMessages ? "enabled" : "disabled"}`);
}
//document.getElementById('toggleconsolemessages').addEventListener('click', toggleconsolemessages);

function toggletwitchChatOverlay() {
	twitchChatOverlay = !twitchChatOverlay;
	updateSingleSetting("twitchChatOverlay: ", twitchChatOverlay);
	updateSettings();
	updateIndicatorLights();
	toggleElement("twitchChat");
	console.log(` Chat Overlay is now: ${twitchChatOverlay}`);
	displayConsoleMessage("system", `entrivia Chat Overlay is now: ${twitchChatOverlay}`);
}
//document.getElementById('toggletwitchChatOverlay').addEventListener('click', toggletwitchChatOverlay);


//--------------------------------------------------
//---Persistent Settings Logic (Local Storage) -----|
//--------------------------------------------------
function updateSingleSetting(settingKey, newValue) {
    let savedSettings = JSON.parse(localStorage.getItem("entriviaClassicSettings")) || {};
    savedSettings[settingKey] = newValue;
    localStorage.setItem("entriviaClassicSettings", JSON.stringify(savedSettings));
}
function saveSettings() {
    let entriviaClassicSettings = {
        timetoAnswer,
        timebetweenQuestions,
        timebetweenRounds,
        questionsPerRound,
        usedefaultquestions,
        usecustomquestions,
		consolemessages,
		twitchChatOverlay,
		chatanswers,
		audioSetting,
		hideButtonBubble
    };
    localStorage.setItem("entriviaClassicSettings", JSON.stringify(entriviaClassicSettings));
	console.log("settings saved.");
}
function updateSettings() {
    timetoAnswer = parseInt(document.getElementById("timeToAnswer").value, 10);
    timebetweenQuestions = parseInt(document.getElementById("timeBetweenQuestions").value, 10);
    timebetweenRounds = parseInt(document.getElementById("timeBetweenRounds").value, 10);
    questionsPerRound = parseInt(document.getElementById("questionsPerRound").value, 10);
    // Get the toggle states
    saveSettings();
	console.log("📢 Entrivia Settings updated and saved.");
    displayConsoleMessage("📢", "Entrivia Settings updated and saved.", {}, {});
}

function resetSettings() {
    // Default settings
    timetoAnswer = 30;
    timebetweenQuestions = 30;
    timebetweenRounds = 30;
    questionsPerRound = 1;
    usedefaultquestions = true;
    usecustomquestions = true;
	consolemessages = false;
	twitchChatOverlay = false;
	chatanswers = false;
	audioSetting = true;
	hideButtonBubble = "off";
    // Clear saved settings
    localStorage.removeItem("entriviaClassicSettings");

    // Update input fields
    document.getElementById("timeToAnswer").value = timetoAnswer;
    document.getElementById("timeBetweenQuestions").value = timebetweenQuestions;
    document.getElementById("timeBetweenRounds").value = timebetweenRounds;
    document.getElementById("questionsPerRound").value = questionsPerRound;
	console.log("📢: Entrivia Settings Reset to default.");
    displayConsoleMessage("📢", "entrivia Settings Reset to default.", {}, {});
}

function updateSettingsDisplay() {
	console.log(`Updating display:
	Time to answer: ${timetoAnswer},
	Question delay: ${timebetweenQuestions},
	Round delay: ${timebetweenRounds},
	Questions per round: ${questionsPerRound}`);

	// Update input fields
	document.getElementById("timeToAnswer").value = timetoAnswer;
	document.getElementById("timeBetweenQuestions").value = timebetweenQuestions;
	document.getElementById("timeBetweenRounds").value = timebetweenRounds;
	document.getElementById("questionsPerRound").value = questionsPerRound;

	// Apply indicator lights and toggle-based UI

	applyUserDisplaySettings();
	updateIndicatorLights();
}
function applyUserDisplaySettings() {
	// twitchChatOverlay
	const chatBox = document.getElementById("twitchChat");
	if (chatBox) {
		if (twitchChatOverlay === "on" || twitchChatOverlay === true) {
			console.log("showing twitch chat ✅");
			chatBox.style.visibility = "visible";
			chatBox.classList.add("active");
			chatBox.style.animation = "fadeIn 0.8s ease-out forwards";
		} else {
			console.log("hiding twitch chat ❌");
			chatBox.style.animation = "fadeOut 0.5s ease-in forwards";
			setTimeout(() => {
				chatBox.classList.remove("active");
				chatBox.style.visibility = "hidden";
			}, 500);
		}
	}

	// hideButtonBubble
	const bubbleWrap = document.getElementById("bubblewrap");
	if (bubbleWrap) {
		if (hideButtonBubble === "on" || hideButtonBubble === true) {
			console.log("hiding bubble butt ✅");
			bubbleWrap.style.opacity = "0.00";
		} else {
			bubbleWrap.style.opacity = "1.00";
			console.log("showing bubblewrap ❌");
		}
	}

	// consolemessages just logs itself for now
	if (consolemessages === "on" || consolemessages === true) {
		console.log("Console messages are enabled ✅");
	} else {
		console.log("Console messages are disabled ❌");
	}
}
function loadSettings() {
	const stored = localStorage.getItem("entriviaClassicSettings");
	if (stored) {
		const settings = JSON.parse(stored);
		({ timetoAnswer, timebetweenQuestions, timebetweenRounds, questionsPerRound,
			usedefaultquestions, usecustomquestions, consolemessages, twitchChatOverlay,
			chatanswers, audioSetting, hideButtonBubble } = settings);
		
		// Add this line here 👇
		updateSettingsDisplay();
	}
}

// Function to dynamically add a button and a status light indicator
function updatePlugginSettingsUI() {
	let settings = { usedefaultquestions, usecustomquestions, consolemessages, twitchChatOverlay, chatanswers, audioSetting, hideButtonBubble };
    // Select all elements with the class 'optiontoggle-entrivia'
    const toggleElements = document.querySelectorAll('.optiontoggle-entrivia');

    // Loop through each element
    toggleElements.forEach(element => {
        const option = element.getAttribute('data-option'); // Get the data-option value
        if (!option) return; // Skip if no data-option is set
        // Create a formatted ID name from the data-option
        const formattedId = option.replace(/[^a-zA-Z0-9]/g, ""); // Remove special characters
        
        // Create the button
        const button = document.createElement('button');
        button.id = `toggle${formattedId}`;
        button.textContent = option.split(/(?=[A-Z])/).join(" "); // Format text by splitting camelCase
        button.classList.add('a');
        // Create the status indicator wrapper
        const statusWrapper = document.createElement('div');
        statusWrapper.classList.add('statusindicatorWrapper');

        // Create the status label
        const statusLabel = document.createElement('strong');
        statusLabel.textContent = 'Status';

        // Create the status indicator
        const statusIndicator = document.createElement('span');
        statusIndicator.id = `status${formattedId}`;
        statusIndicator.setAttribute('data-option', option);
        statusIndicator.classList.add('light-indicator');

        // Append elements to status wrapper
        statusWrapper.appendChild(statusLabel);
        statusWrapper.appendChild(statusIndicator);

        // Append button and status indicator to the parent div
        element.appendChild(button);
        element.appendChild(statusWrapper);
		updateIndicatorLights();
    });
}
updatePlugginSettingsUI();
//=================================
// - comfy Audio -
//=================================
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
function toggleAudioSetting() {
    audioSetting = audioSetting === "on" ? "off" : "on";
    console.log(`Audio setting is now: ${audioSetting}`);
	displayConsoleMessage("system", `Audio setting is now: ${audioSetting}`);
	updateSingleSetting("audioSetting", audioSetting);
	updateIndicatorLights();
}
//end of chat logic --------------------|

//=================================
// - comfy main -
//=================================
function registerChatPlugin(fn) {
    if (typeof fn === "function") {
        window.chatPlugins.push(fn);
    }
}

// ComfyJS onChat event handler
let streamername = "jaedraze"; // Default streamer name
function isStreamerAndAuthorize(user, command) {
    if (user.toLowerCase() !== streamername.toLowerCase()) {
        displayConsoleMessage(user, `❌ Unauthorized: Only ${streamername} can use !${command}`);
        return false;
    }
    return true;
}
ComfyJS.onChat = (user, message, command, color, flags, extra) => {
    if (!userColors[user]) {
        userColors[user] = extra.userColor || "orangered"; // Default to white if no color is provided
    }
    console.log("UserColor:", extra.userColor, "User:", user, "Message:", message);
    console.log("Emotes:", extra.messageEmotes); // Debugging: Check if emotes are detected
    // 2. Tell every registered plugin that a message arrived
    window.chatPlugins.forEach(plugin => {
        plugin(user, msg, flags, extra);
    });
	if (twitchChatOverlay === "off") return;
    displayChatMessage(user, message, flags, extra);  // Show message in chat box
};

const usercommands = [];
const streamercommands = [];

// Declare the arrays globally
/* const usercommands = [
	{ command: "!a / !answer", description: "Allows users to answer a entrivia question.", usage: "!a / !answer" },
	{
        command: "!entrivia-addquestion",
        description: "Allows the streamer to add a custom entrivia question.",
        usage: `\n
Format: !entrivia-suggest easy/hard | category | question | answer | [options]
option paramater is...optional
valid difficulties: easy, hard
valid categories: mining, hunting, crafting, history, beauty, economy, social, misc
!entrivia-suggest easy | mining | What is the most common ore found on Planet Calypso? | lyst;lysterium;lysterium ore
!entrivia-suggest hard | hunting | What creature drops the EWE EP-41 Military? | atrox`
    },
]; */

/* const streamercommands = [
	{ command: "!a / !answer", description: "Answer an Entrivia question.", usage: "!a / !answer" },
	{ command: "!entrivia-play", description: "Starts Entrivia Classic.", usage: "!entrivia-play" },
	{ command: "!entrivia-lastaskwinner", description: "Show the last single question's winner.", usage: "!entrivia-lastaskwinner" },
	{ command: "!entrivia-lastwinners", description: "Show Last Entrivia Classic winners.", usage: "!entrivia-lastwinners" },
	{ command: "!entrivia-history", description: "Displays Entrivia Classic game history.", usage: "!entrivia-history" },
	{ command: "!entrivia-chatanswers", description: "Toggles the chat answers on/off.", usage: "!entrivia-chatanswers" },
	{ command: "!entrivia-consolemessages", description: "Toggles the chat answers on/off.", usage: "!entrivia-consolemessages" },
	{ command: "!entrivia-disablechat", description: "Disables Entrivia chat overlay.", usage: "!entrivia-disablechat" },
	{ command: "!entrivia-audio", description: "Toggles entrivia audio settings.", usage: "!entrivia-audio" },
	{ command: "!toggleentriviaboard", description: "Toggles the entrivia board visibility.", usage: "!toggleentriviaboard" },
	{ command: "!togglequestions", description: "Toggles the visibility of the question wrapper.", usage: "!togglequestions" },
	{ command: "!toggleentrivia", description: "Toggles the visibility of the entrivia wrapper.", usage: "!toggleentrivia" },
	{ command: "!togglechat", description: "Toggles the visibility of the Twitch chat container.", usage: "!togglechat" },
    { 
        command: "!entrivia-ask", 
        description: "Asks an entrivia question from a specific round, category, and optional question type.", 
        usage: `\n
!entrivia-ask
!entrivia-ask easy
!entrivia-ask easy | mining
!entrivia-ask hard | hunting | multiplechoice
!entrivia-ask easy | history | singlechoice
category can be one of: mining, hunting, crafting, history, beauty, economy, social, misc.
The question type is optional and can be 'singlechoice' or 'multiplechoice'.`
    },
	{
        command: "!entrivia-addquestion",
        description: "Allows the streamer to add a custom entrivia question.",
        usage: `\n
!entrivia-addquestion easy | mining | this is a multiplechoice question for testing purposes | myanswer | option 1, option 2, option 3, option 4
!entrivia-addquestion easy | mining | What is a question with only one correct answer | my answer
!entrivia-addquestion easy | mining | What is a question with multiple possible answers? | nrf, no resources found
!entrivia-addquestion easy | mining | this is a multiplechoice question for testing purposes | myanswer | option 1, option 2, option 3, option 4`
    },
	{ command: "!entrivia-answertime", description: "Updates the answer time limit.", usage: "!entrivia-answertime [time]" },
	{ command: "!entrivia-questiondelay", description: "Updates the question delay between questions.", usage: "!entrivia-questiondelay [delay]" },
	{ command: "!entrivia-rounddelay", description: "Updates the delay between rounds.", usage: "!entrivia-rounddelay [delay]" },
	{ command: "!entrivia-questioncap", description: "Sets a cap for the number of questions per round.", usage: "!entrivia-questioncap [cap]" },
	{ command: "!entrivia-defaultquestions", description: "Toggles default entrivia questions.", usage: "!entrivia-defaultquestions" },
	{ command: "!entrivia-customquestions", description: "Toggles custom entrivia questions.", usage: "!entrivia-customquestions" }
];
 */

// Function to update the command list in the UI
function updateCommandlist() {
    const userCommandList = document.getElementById("usercommandList");
    const broadcasterCommandList = document.getElementById("broadcastercommandList");

    function createCommandList(commandArray, targetList) {
        commandArray.forEach(function (command) {
            const description = document.createElement("div");

            // Command title with ❓ tooltip
            const strong = document.createElement("strong");
            strong.textContent = command.command;

            const infoSpan = document.createElement("span");
            infoSpan.classList.add("command-info");
            infoSpan.setAttribute("title", "Usage: " + command.usage);
            infoSpan.textContent = "❓";
            infoSpan.style.cssFloat = "right";

            strong.appendChild(infoSpan);
            description.appendChild(strong);

            // Description
            const commandDescription = document.createElement("p");
            commandDescription.textContent = command.description;
            commandDescription.style.fontStyle = "italic";
            commandDescription.style.fontSize = "small";
            description.appendChild(commandDescription);

            // Divider after description
            const dividerAfterDescription = document.createElement("div");
            dividerAfterDescription.style.borderTop = "3px ridge var(--border-color)";
            dividerAfterDescription.style.margin = "4px 0";
            description.appendChild(dividerAfterDescription);

            // Usage label
            const usageLabel = document.createElement("p");
            usageLabel.textContent = "Usage:";
            usageLabel.style.fontSize = "smaller";
            description.appendChild(usageLabel);
			//usage label bottom divider
            const dividerAfterusageLabel = document.createElement("div");
            dividerAfterusageLabel.style.borderTop = "2px ridge var(--border-color)";
            dividerAfterusageLabel.style.margin = "4px 0";
            usageLabel.appendChild(dividerAfterusageLabel);
            // Split usage into lines
            const usageLines = command.usage.split('\n').map(line => line.trim()).filter(line => line !== "");

            // Separate usage examples from notes
            const usageExamples = [];
            const usageNotes = [];

            usageLines.forEach(line => {
                if (line.startsWith(command.command)) {
                    usageExamples.push(line);
                } else {
                    usageNotes.push(line);
                }
            });

            // Add usage examples with dividers
            usageExamples.forEach((usageExample, index) => {
                const p = document.createElement("p");
                p.textContent = usageExample;
                p.style.fontSize = "smaller";
                description.appendChild(p);

                if (index < usageExamples.length - 1) {
                    const usageDivider = document.createElement("div");
                    usageDivider.style.borderTop = "2px ridge var(--border-color)";
                    usageDivider.style.margin = "4px 0";
                    description.appendChild(usageDivider);
                }
            });

            // Add any notes after usage examples
            usageNotes.forEach(note => {
                const p = document.createElement("p");
                p.textContent = note;
                p.style.fontSize = "smaller";
                description.appendChild(p);
            });

            // Add everything to the list item
            const li = document.createElement("li");
            li.appendChild(description);
            targetList.appendChild(li);
        });
    }

    createCommandList(usercommands, userCommandList);
    createCommandList(streamercommands, broadcasterCommandList);
}

// Function to dynamically add command spans based on the `data-option`
function updateTwitchCommandInfo() {
    // Get all elements with the class 'twitchcmd-info'
    const commandInfoElements = document.querySelectorAll('.twitchcmd-info');
    // Loop through each element and find the corresponding command
    commandInfoElements.forEach(function(element) {
        const option = element.getAttribute('data-option');  // Get the value of data-option
        // Look for the corresponding command in usercommands and streamercommands
        let command = null;
        // Check in usercommands first
        command = usercommands.find(cmd => cmd.command === option);
        // If not found in usercommands, check in streamercommands
        if (!command) {
            command = streamercommands.find(cmd => cmd.command === option);
        }
        // If a command was found, add the spans inside the element
        if (command) {
            // Create the command-text span
            const commandTextSpan = document.createElement('span');
            commandTextSpan.classList.add('command-text');
            commandTextSpan.textContent = `Twitch Cmd = ${command.command}`;
            // Create the command-info span
            const commandInfoSpan = document.createElement('span');
            commandInfoSpan.classList.add('command-info');
            commandInfoSpan.setAttribute("title", "Usage: " + command.usage);
            commandInfoSpan.textContent = '❓';
            // Append the spans to the current element
            element.appendChild(commandTextSpan);
            element.appendChild(commandInfoSpan);
        }
    });
}

// Call the function to update the command info on page load
updateTwitchCommandInfo();
// You can now use `usercommands` and `streamercommands` elsewhere
function getUserCommands() {
    console.log(usercommands);  // Access the usercommands array
}

function getStreamerCommands() {
    console.log(streamercommands);  // Access the streamercommands array
}

//================================--
// - Comfy Connection -            |
//=================================-

function setStreamer(newStreamer) {
    const twitchdisconnectbutton = document.getElementById("twitchdisconnectButt");
    const button = document.getElementById("streamersButt"); 
    const input = document.querySelector("#comfychat-twitchname-input");

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
function connectStreamer() {
    const savedStreamer = localStorage.getItem("lastStreamer");
    if (savedStreamer) {
        setStreamer(savedStreamer); // Auto-connect
    }
}
function disconnectBot() {
	const button = document.getElementById("streamersButt");
	const input = document.querySelector("#comfycontrolBox input[type='text']");
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


/* document.getElementById("controls-toggle").addEventListener("click", function () {
	let container = document.getElementById("comfycontrolBox");
	container.classList.toggle("active");
});
 */
// Button event listener: first endTrivia, then setStreamer
document.getElementById("streamersButt").addEventListener("click", function() {
	if (
		typeof triviaGameState !== "undefined" &&
		triviaGameState === "started" &&
		typeof endTrivia === "function"
	) {
		endTrivia();
	}
    let newStreamer = document.querySelector("input[name='yourTextName']").value;
	console.log("attempting to Connect to:" + newStreamer);
    setStreamer(newStreamer); // Then, set the new streamer
});


document.getElementById("changeSettings").addEventListener("click", () => {
	console.log("Change settings button clicked");
	updateSettings();
});

document.getElementById("resetSettings").addEventListener("click", () => {
	console.log("Reset settings button clicked");
	resetSettings();
});
//=================================
// - must run onload -
//=================================
window.onload = function () {
 	//loadCustomQuestions();
	//updateSettingsDisplay();
	//updateCommandlist(); 
	//connectStreamer();
};

