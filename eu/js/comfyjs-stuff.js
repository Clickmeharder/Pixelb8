ComfyJS.onCommand = (user, command, message, flags, extra) => {
    if (flags.broadcaster || flags.mod || flags.subscriber) { // You can adjust this based on who you want to respond to
        let responseMessage = "";

        switch (command) {
            case "test":
                console.log(`${user} typed !test in chat`);
                responseMessage = `${user} typed !test in chat`;
                break;
            case "test2":
                console.log(`${user} typed !test2 in chat`);
                responseMessage = `${user} typed !test2 in chat`;
                break;
            case "test3":
                console.log(`${user} typed !test3 in chat`);
                responseMessage = `${user} typed !test3 in chat`;
                break;
            case "test4":
                console.log(`${user} typed !test4 in chat`);
                responseMessage = `${user} typed !test4 in chat`;
                break;
            case "test5":
                console.log(`${user} typed !test5 in chat`);
                responseMessage = `${user} typed !test5 in chat`;
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
