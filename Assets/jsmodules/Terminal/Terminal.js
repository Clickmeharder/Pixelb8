
const terminalOutput = document.getElementById("output-container");
const commandInput = document.getElementById("commandInput");

// Function to log a message
function logMessage(message) {
    const logEntry = document.createElement("p");
	logEntry.className = "text-terminaloutput";
    logEntry.textContent = message;
    terminalOutput.appendChild(logEntry);
    console.log(message); // Log the message to the console
    // Scroll to the bottom of the log container
    terminalOutput.scrollTop = terminalOutput.scrollHeight;
}
logMessage("[SuS] Terminal Initializing");
logMessage("...");
logMessage("[SuS] Terminal Initialized<");
logMessage("------------------------");
logMessage("Welcome USER#2364");
logMessage("Please Budget Responsibly");
logMessage("...");

    // Add event listener for Enter key press
   commandInput.addEventListener("keyup", function (event) {
        if (event.key === "Enter") {
            const inputValue = commandInput.value.trim();
			commandInput.value = "";
            if (inputValue !== "") {
                terminalOutput.innerHTML += `<p class="text-terminaloutput">User: ${inputValue}</p>`;

                // Add a 3-second delay before sending the automated response
                setTimeout(function () {
                    const response = getAutomatedResponse(inputValue.toLowerCase());
                    if (response) {
                        terminalOutput.innerHTML += `<p class="text-terminaloutput">system: ${response}</p>`;
                    }

                    

                    // Check if there are more than three total messages in the output
                    const messages = terminalOutput.getElementsByTagName("p");
                    if (messages.length > 500) {
                        terminalOutput.removeChild(messages[0]); // Remove the oldest message
                    }
                }, 3000); // 3000 milliseconds (3 seconds)
            }
        }
    });

    function getAutomatedResponse(input) {
        const responses = {
            hello: "Hello! How can I assist you?",
            hi: "Hi there! What can I help you with?",
            hey: "Hey! How can I be of service?",
            whatsup: "Not much. What's up with you?",
            sup: "Sup! Need anything?",
            howdy: "Howdy partner! How can I assist you today?"
            // Add more responses as needed
        };

        return responses[input] || "";
    }
