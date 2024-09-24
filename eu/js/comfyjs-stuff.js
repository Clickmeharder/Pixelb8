ComfyJS.onCommand = (user, command, message, flags, extra) => {
    if (flags.broadcaster) {
        let responseMessage = "";

        switch (command) {
            case "test":
                console.log("!test was typed in chat");
                responseMessage = "!test was typed in chat";
                break;
            case "test2":
                console.log("!test2 was typed in chat");
                responseMessage = "!test2 was typed in chat";
                break;
            case "test3":
                console.log("!test3 was typed in chat");
                responseMessage = "!test3 was typed in chat";
                break;
            case "test4":
                console.log("!test4 was typed in chat");
                responseMessage = "!test4 was typed in chat";
                break;
            case "test5":
                console.log("!test5 was typed in chat");
                responseMessage = "!test5 was typed in chat";
                break;
        }

        // Append the response message to the #twitch-chat div if there's a message
        if (responseMessage) {
            const messageDiv = document.createElement("div");
            messageDiv.textContent = responseMessage;
            document.getElementById("twitch-chat").appendChild(messageDiv);
        }
    }
};

ComfyJS.Init("jaedraze");
