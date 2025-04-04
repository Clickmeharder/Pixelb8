//!!!!!!!!!!!!!!!!!!!!!!!!!
// entrivia Initialization  
//!!!!!!!!!!!!!!!!!!!!!!!!
let entriviaSingleAskLastWinner = null;  // Store the last winner's username
let entriviaSingleAskWinners = [];  // Store the list of winners
let lastentriviaClassicWinners = [];
let entriviaClassicHistory = [];
let userColors = {}; // Store user colors
let entriviaGameState = null;
let userStats = {}; // This will store the count of correct answers and first answers
let userOverallStats = {}; // This will store the users lifetime stats ie: number of games played. number of games won. total correct answers total first correct answers
let userScores = {};
let usedQuestions = [];
let activeQuestion = null;
let singleActiveAsk = null;
let answeredUsers = new Set();
let firstAnswerUser = null;
let hideQuestionTimer;
let questionTimer, countdownTimer;
let totalRounds = 2;
let round = 1;
let entriviaQuestions = { round1: [], round2: [] };
//_______________________________________________
// entrivia OPTIONS
//game options
let audioSetting = "on";
let entriviachatOverlay = "off";
let consolemessages = false;
let chatanswers = false;

let usedefaultquestions = true;
let usecustomquestions = true;
let timetoAnswer = 30;
let timebetweenQuestions = 30;
let timebetweenRounds = 30;
let questionsAsked = 0;
let questionsPerRound = 1;
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

//_________________________________
//--------	Chat ------------------\
// Chat message display functions  |

/* function displayChatMessage(user, message, flags = {}, extra = {}, isCorrect = false) {
	if (entriviachatOverlay === "off") return;
    const chatContainer = document.getElementById("twitchMessagebox");
    // Create a new chat message element
    const chatMessage = document.createElement("div");
    chatMessage.classList.add("chatMessage");
    const usernameSpan = document.createElement("span");
    usernameSpan.classList.add("username");
    usernameSpan.innerHTML = user + ": ";
    const userColor = extra.userColor || "#FFFFFF"; // Default to white if no color is set
    usernameSpan.style.color = userColor; // Apply user color dynamically
    // Create the message element
    const messageSpan = document.createElement("span");
    messageSpan.classList.add("twitchmessage");
    messageSpan.innerHTML = message;
    // Append elements to the chat message div
    chatMessage.appendChild(usernameSpan);
    chatMessage.appendChild(messageSpan);
    // Add the chat message to the container
    chatContainer.appendChild(chatMessage);
    // Apply a fade effect after a delay
    setTimeout(() => {
        chatMessage.style.opacity = '0'; // Fade out after 9 seconds
    }, 15000);
    setTimeout(() => {
        chatMessage.remove();
    }, 15000); // Remove after 15 seconds
    // Limit messages to the last 5
    if (chatContainer.children.length > 5) {
        chatContainer.removeChild(chatContainer.firstChild);
    }
} */
function displayentriviaMessage(user, message, flags = {}, extra = {}, isCorrect = false) {
    const chatContainer = document.getElementById("entriviaMessagebox");
    // Create a new chat message element
    const entriviaMessage = document.createElement("div");
    entriviaMessage.classList.add("chatMessage");
    const usernameSpan = document.createElement("span");
    usernameSpan.classList.add("username");
    usernameSpan.innerHTML = user + ": ";
    const userColor = extra.userColor || "#FFFFFF"; // Default to white if no color is set
    usernameSpan.style.color = userColor; // Apply user color dynamically
    // Create the message element
    const messageSpan = document.createElement("span");
    messageSpan.classList.add("twitchmessage");
    messageSpan.innerHTML = message;
    // Append elements to the chat message div
    entriviaMessage.appendChild(usernameSpan);
    entriviaMessage.appendChild(messageSpan);
    // Add the chat message to the container
    chatContainer.appendChild(entriviaMessage);
    // Apply a fade effect after a delay
    setTimeout(() => {
        entriviaMessage.style.opacity = '0'; // Fade out after 9 seconds
    }, 15000);
    setTimeout(() => {
        entriviaMessage.remove();
    }, 15000); // Remove after 15 seconds
    // Limit messages to the last 5
    if (chatContainer.children.length > 5) {
        chatContainer.removeChild(chatContainer.firstChild);
    }
}


function displayConsoleMessage(user, message) {
    if (!consolemessages) return;  // If consolemessages is false, do nothing
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
function toggleconsolemessages() {
    consolemessages = !consolemessages;  // Toggle the boolean value
    console.log(`Console messages are now ${consolemessages ? "enabled" : "disabled"}`);
}
//- end of chat logic -------------|
//________________________________/

//-----------------------------
//--------- entrivia -----------|
//entrivia game code starts here

//option to allow users to do /entrivia me
//(ask the user a random question)

//Example Questions
/* <!-- const entriviaQuestions = [ -->
<!-- { question: "Converting 100 shrapnel results in how much universal ammo?", answer: "101" }, -->
<!-- { question: "What number is on the side of a Sleipnir mk1 (C,L)?", answer: "88" }, -->
<!-- { question: "What is 5 + 3?", answer: "8" }, -->
<!-- { question: "Who painted the Mona Lisa?", answer: "da vinci" }, -->
<!-- { question: "What is the smallest Skildek support weapon?", answer: "lancehead" }, -->
<!-- { question: "What amp drops from bots found at Orthos Oilfield?", answer: "b101" }, -->
<!-- { question: "What does CDF stand for?", answer: "calypso defense force" }, -->
<!-- { question: "What does IFN stand for?", answer: "imperial federal navy" }, -->
<!-- { question: "What is Jaedraze's avatar's first name?", answer: "Jimmy" }, -->
<!-- { question: "What is Jaedraze's avatar's middle name?", answer: "Jimbobbityboo" }, -->
<!-- { question: "What year is it?", answer: "2025" }, -->
<!-- { question: "What items are used to craft explosive projectiles?", answer: "nanocubes" }, -->
<!-- { question: "What is the name of the starting zone on Calypso?", answer: "thule" }, -->
<!-- { question: "How many paint cans or textures for max success?", answer: "323" }, -->
<!-- { question: "How many PED is 100 PEC worth?", answer: "1" }, -->
<!-- { question: "How many PEC is 1 PED worth?", answer: "100" }, -->
<!-- { question: "How many PEC is 10 PED worth?", answer: "1000" } -->
        <!-- ]; --> */

//Example add Question Command
//!entrivia-addcustomquestion round1 | What number is on the side of a Sleipnir mk1 (C,L)? | 88
//----------------------------

function fetchentriviaQuestions() {
    return new Promise((resolve, reject) => {
        const questionsUrl = 'questions.json';
        let defaultQuestions = { round1: {}, round2: {} };
        let customQuestions = JSON.parse(localStorage.getItem("customentriviaQuestions")) || { round1: {}, round2: {} };

        let fetchDefaultQuestions = usedefaultquestions
            ? fetch(questionsUrl)
                .then(response => response.ok ? response.json() : Promise.reject('Failed to load'))
                .then(data => {
                    if (!data.round1 || !data.round2) throw new Error('Invalid entrivia data');
                    defaultQuestions = data;
                })
                .catch(error => console.error('Error fetching questions:', error))
            : Promise.resolve();

        fetchDefaultQuestions.then(() => {
            let finalQuestions = { round1: {}, round2: {} };

            function mergeQuestions(target, source) {
                for (const category in source) {
                    if (!target[category]) target[category] = [];
                    target[category] = target[category].concat(source[category] || []);
                }
            }

            if (usedefaultquestions) {
                mergeQuestions(finalQuestions.round1, defaultQuestions.round1);
                mergeQuestions(finalQuestions.round2, defaultQuestions.round2);
            }

            if (usecustomquestions) {
                mergeQuestions(finalQuestions.round1, customQuestions.round1);
                mergeQuestions(finalQuestions.round2, customQuestions.round2);
            }

            entriviaQuestions = finalQuestions;

            console.log("📜 entrivia questions loaded:", entriviaQuestions);
            resolve(entriviaQuestions);
        });
    });
}

function addCustomentriviaQuestion(round, questionText, correctAnswer, category) { 
    let customQuestions = JSON.parse(localStorage.getItem("customentriviaQuestions")) || { round1: {}, round2: {} };
    if (round !== "round1" && round !== "round2") {
        console.error("Invalid round. Use 'round1' or 'round2'.");
        return;
    }
    // Ensure category exists in the selected round
    if (!customQuestions[round][category]) {
        customQuestions[round][category] = [];
    }
    let newQuestion = {
        question: questionText,
        answer: correctAnswer,
        category: category
    };
    customQuestions[round][category].push(newQuestion);
    localStorage.setItem("customentriviaQuestions", JSON.stringify(customQuestions));
    loadCustomQuestions();
    updateAnswerDisplay();
    console.log(`✅ Added new question to ${round} [${category}]:`, newQuestion);
}
function loadCustomQuestions() {
    const customQuestions = JSON.parse(localStorage.getItem("customentriviaQuestions")) || { round1: {}, round2: {} };
    const dropdown = document.getElementById('questionList');

    // Log the data for debugging
    console.log("Loaded custom questions:", customQuestions);

    // Clear the dropdown first
    dropdown.innerHTML = '';

    let defaultOption = document.createElement('option');
    defaultOption.text = "Select a question to delete";
    defaultOption.value = '';  // Default value
    dropdown.appendChild(defaultOption);

    // Iterate over rounds and categories to populate the dropdown
    function addQuestionsToDropdown(round, questions) {
        if (!questions) return;  // Skip if no questions exist in this round
        // Iterate over each category in the round
        for (const category in questions) {
            const categoryQuestions = questions[category];

            // Ensure categoryQuestions is an array before proceeding
            if (!Array.isArray(categoryQuestions)) {
                console.warn(`Skipping category "${category}" because it's not an array.`, categoryQuestions);
                continue;  // Skip this category if it's not an array
            }

            if (categoryQuestions.length === 0) continue;  // Skip empty categories

            // Add each question in the category to the dropdown
            categoryQuestions.forEach((q, index) => {
                let option = document.createElement('option');
                option.value = `${round}-${category}-${index}`;  // Format: round-category-index
                option.text = `[${category}] ${q.question}`;  // Show category and question
                dropdown.appendChild(option);
            });
        }
    }

    // Add questions from both rounds
    addQuestionsToDropdown("round1", customQuestions.round1);
    addQuestionsToDropdown("round2", customQuestions.round2);
}

// Function to update the answer display based on the selected question
function updateAnswerDisplay() {
    const dropdown = document.getElementById('questionList');
    const selectedOption = dropdown.value;

    // Check if the default option (first option) is selected
    if (!selectedOption) {
        const answerDisplay = document.getElementById('answerDisplay');
        answerDisplay.textContent = "Question details will be displayed here once a question is selected from the dropdown menu";  // Set answer display text
        return;  // No question selected
    }

    // Split the option value to get round, category, and index
    const [round, category, index] = selectedOption.split('-');

    let customQuestions = JSON.parse(localStorage.getItem("customentriviaQuestions")) || { round1: {}, round2: {} };

    if (customQuestions[round] && customQuestions[round][category]) {
        const question = customQuestions[round][category][index];
        const answerDisplay = document.getElementById('answerDisplay');
        answerDisplay.textContent = `Answer: ${question.answer}`;
    }
}

// Function to delete the selected question
function deleteCustomQuestion() {
    const dropdown = document.getElementById('questionList');
    const selectedValue = dropdown.value;

    if (!selectedValue) {
        console.log("Please select a question to delete.");
        return;
    }

    const [round, category, index] = selectedValue.split("-");

    let customQuestions = JSON.parse(localStorage.getItem("customentriviaQuestions")) || { round1: {}, round2: {} };

    // Ensure the category exists in the selected round
    if (customQuestions[round] && customQuestions[round][category] && customQuestions[round][category][index]) {
        const confirmDelete = confirm(`Are you sure you want to delete the question: "${customQuestions[round][category][index].question}"?`);
        if (confirmDelete) {
            // Remove the question from the category's array
            customQuestions[round][category].splice(index, 1);

            // If category is empty, delete it
            if (customQuestions[round][category].length === 0) {
                delete customQuestions[round][category];
            }
            // Save the updated custom questions to localStorage
            localStorage.setItem("customentriviaQuestions", JSON.stringify(customQuestions));

            console.log('Question deleted successfully!');
            loadCustomQuestions();  // Reload the dropdown
            updateAnswerDisplay();  // Clear answer display
        }
    } else {
        console.log("The selected question doesn't exist.");
    }
}

function clearAllCustomQuestions() {
    localStorage.removeItem("customentriviaQuestions");
    console.log("✅ All custom entrivia questions have been deleted.");
}
// Clear existing questions
// uncomment these two commands to clear all custom questions:
//clearAllCustomQuestions();
// Now add a new entrivia question (example usage):
//addCustomentriviaQuestion("round1", "What is the smallest Skildek support weapon?", "lancehead", "hunting");
//_____________________________________
//-------------------------------------

//
//-----------------------------
//      game history
// load last entrivia classic winners and entrivia classic game history
function loadentriviaHistory() {
    const savedHistory = localStorage.getItem("entriviaClassicHistory");
    const savedLastWinners = localStorage.getItem("lastentriviaClassicWinners");

    console.log("Loaded entriviaClassicHistory from localStorage:", savedHistory);
    console.log("Loaded lastentriviaClassicWinners from localStorage:", savedLastWinners);

    if (savedHistory) {
        entriviaClassicHistory = JSON.parse(savedHistory);
        console.log("Parsed entriviaClassicHistory:", entriviaClassicHistory);
    }

    if (savedLastWinners) {
        lastentriviaClassicWinners = JSON.parse(savedLastWinners);
        console.log("Parsed lastentriviaClassicWinners:", lastentriviaClassicWinners);
    }
}
// update last entrivia classic winners and entrivia classic game history
function updateLastentriviaClassicWinners() {
    lastentriviaClassicWinners = [];
    const sortedUsers = Object.entries(userScores).sort((a, b) => b[1] - a[1]);
    for (let i = 0; i < 3; i++) {
        const [user, score] = sortedUsers[i] || [];
        if (user) {
            lastentriviaClassicWinners.push({
                username: user,
                score: score,
                firstAnswers: userStats[user]?.firstAnswers || 0,
                correctAnswers: userStats[user]?.correctAnswers || 0,
                incorrectAnswers: userStats[user]?.incorrectAnswers || 0,
                timestamp: new Date().toLocaleString(), // Add date and time
            });
        }
    }
    // Store in entriviaClassicHistory
    entriviaClassicHistory.push([...lastentriviaClassicWinners]); 
    // Save to local storage
    localStorage.setItem("lastentriviaClassicWinners", JSON.stringify(lastentriviaClassicWinners));
    localStorage.setItem("entriviaClassicHistory", JSON.stringify(entriviaClassicHistory));

    console.log("Updated Last entrivia Classic Winners:", lastentriviaClassicWinners);
}
//___________________________________________________
//-------------------------------
//
//------------------------------------------------------------
//------------------------------------------------------------
//show announcements with optional timer
function showAnnouncement(message, entriviaAnnouncementTime) {
    return new Promise((resolve) => {
        const announcementWrapper = document.getElementById("entriviaAnnouncementWrapper");
        const entriviaAnnouncement = document.getElementById("entriviaAnnouncement");
        const roundStartTimer = document.getElementById("roundstarttimer");

        // Set the announcement message
        entriviaAnnouncement.innerText = message;

        // If a entriviaAnnouncementTime is provided, start the countdown
        if (entriviaAnnouncementTime !== undefined) {
            roundStartTimer.style.display = "block"; // Show timer

            const countdownInterval = setInterval(() => {
                roundStartTimer.innerText = `${entriviaAnnouncementTime} seconds`;

                // Decrease entriviaAnnouncementTime
                entriviaAnnouncementTime--;

                if (entriviaAnnouncementTime < 0) {
                    clearInterval(countdownInterval);  // Stop the timer
                    roundStartTimer.style.display = "none"; // Hide timer
                    resolve(); // Resolve promise when countdown ends
                }
            }, 1000); // Update every second
        } else {
            // No countdown, resolve after 10 seconds
            setTimeout(() => {
                resolve(); // Resolve promise after 10 seconds
            }, 10000); // Show for 10 seconds
        }

        // Show the announcement wrapper
        announcementWrapper.style.display = "flex";
        announcementWrapper.style.opacity = "1";

        // Fade out announcement after a set time (if no countdown) or after entriviaAnnouncementTime
        setTimeout(() => {
            announcementWrapper.style.transition = "opacity 2s ease-in-out";
            announcementWrapper.style.opacity = "0";
        }, entriviaAnnouncementTime !== undefined ? entriviaAnnouncementTime * 1000 : 10000); // Wait for entriviaAnnouncementTime or 10 seconds
    });
}

function splashAnimation() {
    return new Promise((resolve) => {
        const splash = document.getElementById("entriviaSplash");
        const logo = document.getElementById("logoContainer");
        const splashText = document.getElementById("splashText");

        // Play the sound
        playSound("openingtheme1");

        // Make splash visible
        splash.style.display = "flex";  // Use flexbox for centering
        splash.style.visibility = "visible";
        splash.style.opacity = "1";  // Fade in

        // Start animations after 1 second (this can be adjusted)
        setTimeout(() => {
            logo.classList.add("animate");  // Apply animation class to logo
            splashText.classList.add("animate");  // Apply animation class to text
        }, 1000); // Delay start of animation (to sync with sound)

        // Fade out splash after a set amount of time (e.g., 13 seconds)
        setTimeout(() => {
            splash.style.transition = "opacity 3s ease-in-out";  // Smooth fade-out transition
            splash.style.opacity = "0";  // Fade out effect

            // After fade-out, hide the splash
            setTimeout(() => {
                splash.style.visibility = "hidden";  // Hide splash
                splash.style.display = "none";  // Ensure it's completely hidden
                resolve();  // Resolve the promise after hiding the splash
            }, 3000);  // Wait for the fade-out duration (3 seconds)
        }, 3000); // Keep splash visible for 3 seconds (adjust as needed)
    });
}
function entriviaSplash() {
    return new Promise((resolve) => {
        splashAnimation()  // Show the splash animation
            .then(() => {
                return showAnnouncement("Round starts in:", 30);  // Show announcement with a 30-second countdown
            })
            .then(() => {
                showentrivia();  // Show entrivia after the countdown ends
                resolve();  // Resolve the promise after entrivia starts
            });
    });
}
function entriviaNosplash() {
    return new Promise((resolve) => {
        showAnnouncement("Round starts in:", 30)  // Show announcement with a 30-second countdown
            .then(() => {
                showentrivia();  // Show entrivia after the countdown ends
                resolve();  // Resolve the promise after entrivia starts
            });
    });
}
function getRandomQuestion() {
    let currentRound = round === 1 ? "round1" : "round2";

    // Ensure entriviaQuestions[currentRound] exists and is an object
    if (!entriviaQuestions[currentRound] || typeof entriviaQuestions[currentRound] !== "object") {
        console.error(`❌ No questions found for ${currentRound}`);
        return null;
    }

    // Flatten all category questions into a single array
    let availableQuestions = Object.values(entriviaQuestions[currentRound])
        .flat()
        .filter(q => !usedQuestions.includes(q)); // Filter out used questions

    if (availableQuestions.length === 0) {
        usedQuestions = []; // Reset when all questions are used
        availableQuestions = Object.values(entriviaQuestions[currentRound]).flat(); // Reload all questions
    }

    if (availableQuestions.length === 0) {
        console.warn("⚠ No available questions after reset.");
        return null;
    }

    // Pick a random question
    let question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    usedQuestions.push(question);
    return question;
}
function getRandomQuestionFromCategory(round, category) {
    // Ensure round is valid
    let currentRound = (round === 1) ? "round1" : (round === 2) ? "round2" : null;
    if (!currentRound) {
        console.error("❌ Invalid round. Please specify either round 1 or round 2.");
        return null;
    }

    // Ensure category exists in entriviaQuestions[currentRound]
    if (!entriviaQuestions[currentRound] || !entriviaQuestions[currentRound][category]) {
        console.error(`❌ No questions found for ${category} in ${currentRound}.`);
        return null;
    }

    // Ensure entriviaQuestions[currentRound][category] is an array
    if (!Array.isArray(entriviaQuestions[currentRound][category])) {
        console.error(`❌ The category ${category} in ${currentRound} does not contain an array of questions.`);
        return null;
    }

    // Filter out used questions
    let availableQuestions = entriviaQuestions[currentRound][category].filter(q => !usedQuestions.includes(q));

    if (availableQuestions.length === 0) {
        // Reset if all questions have been used
        usedQuestions = [];
        availableQuestions = entriviaQuestions[currentRound][category];
    }

    if (availableQuestions.length === 0) {
        console.warn("⚠️ No available questions after reset.");
        return null;
    }

    // Pick a random question
    let question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    usedQuestions.push(question);
    return question;
}

function nextQuestion() {
    clearTimeout(questionTimer); // Clear previous timer if any
    clearTimeout(hideQuestionTimer); // Assuming hideQuestionTimer exists for hiding the question after time runs out
    answeredUsers.clear();
    firstAnswerUser = null;
    activeQuestion = getRandomQuestion();
    questionsAsked++;
    updateQuestionCounter(); // Update the display
    document.getElementById("question").textContent = activeQuestion.question;
    document.getElementById("questionWrapper").style.visibility = "visible";
    document.getElementById("timer").textContent = timetoAnswer;
    document.getElementById("timeuntil-nextQ").textContent = "";
	playRandomQuestionSound();
    let secondsLeft = timetoAnswer;
    questionTimer = setInterval(() => {
        secondsLeft--;
        document.getElementById("timer").textContent = `Time left: ${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, '0')}`;
        if (secondsLeft <= 0) {
            endQuestion(); // Call your function to end the question once time runs out
        }
    }, 1000);
}
//!!!!! fn currently not used:startentriviaRound()
function startentriviaRound() {
    console.log('Round:', round);
    console.log('Total Rounds:', totalRounds);

    document.getElementById("question").textContent = `Round ${round}`;
    document.getElementById("timer").textContent = "Starting...";
    document.getElementById("timeuntil-nextQ").textContent = "";

    toggleElement("questionWrapper", "fade");

    // Set a delay before calling nextQuestion (e.g., 3 seconds)
    setTimeout(nextQuestion, 1000);
}
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
function handlephaseentrivia() {
    <!-- if (questionsAsked === 0) {  -->
        <!-- startentriviaRound(); -->
        <!-- return; -->
    <!-- } -->
    if (questionsAsked >= questionsPerRound) {
        if (round >= totalRounds) {
            entriviaGameFinished(); // If all rounds are completed, finish the game
            return;
        } else {
            endentriviaRound(); // If the round is completed but not the game, end the round
            return;
        }
    }

    nextQuestion(); // Otherwise, just move to the next question
}
function endentriviaRound() {
	console.log('Round:', round);
	console.log('Total Rounds:', totalRounds);
    document.getElementById("question").textContent = `Round ${round} Over!`;
    clearInterval(questionTimer);
    toggleElement("questionWrapper", "fade");
    document.getElementById("timer").textContent = "";
    document.getElementById("timeuntil-nextQ").textContent = "";
	playSound("entriviaroundover");
    // Store round stats in overall stats
    updateUserOverallStats();
    // Prepare for the next round
    round++;
	questionsAsked = 0;
	setTimeout(nextQuestion, timebetweenRounds * 1000);
}
//function to update the time remaining before the next question
function startCountdown() {
	let countdown = timebetweenQuestions;
	nextquestionTimer(countdown);
	countdownTimer = setInterval(() => {
		countdown--;
		nextquestionTimer(countdown);
		if (countdown <= 0) {
			clearInterval(countdownTimer);
			handlephaseentrivia();
		}
	}, 1000);
}
function endQuestion() {
    clearInterval(questionTimer);
    document.getElementById("question").textContent = "Time's up! Answer was: " + activeQuestion.answer;
	document.getElementById("timer").textContent = "";
	activeQuestion = null;
	playSound("entriviatimesup");
    hideQuestionTimer = setTimeout(() => {
        document.getElementById("questionWrapper").style.visibility = "hidden";
        document.getElementById("entriviaboard").style.visibility = "visible";
        // Check if we've asked the maximum number of questions for the round
        if (questionsAsked >= questionsPerRound) {
            // End the entrivia round if we've reached the limit
            handlephaseentrivia();
            return;
        } else {
            // Otherwise, start the countdown for the next question
            startCountdown();
        }
    }, 13000); // Delay timeout of 13 seconds to wait before checking
}
//update the countdown timer until next question
function nextquestionTimer(seconds) {
	const minutes = Math.floor(seconds / 60);
	const remainingSeconds = seconds % 60;
	document.getElementById("timeuntil-nextQ").textContent = `Next question in: ${minutes}m ${remainingSeconds}s`;
}
function checkAnswer(user, message) {
    if (!activeQuestion) return; // No active question, ignore answer
    if (answeredUsers.has(user)) return; // Ignore duplicate correct answers

    let correctAnswer = activeQuestion.answer.toLowerCase();
    let userAnswer = message.trim().toLowerCase();

    // Initialize userStats[user] to prevent undefined issues
    if (!userStats[user]) {
        userStats[user] = {
            correctAnswers: 0,
            incorrectAnswers: 0,
            firstAnswers: 0,
        };
    }

    // If `singleActiveAsk` is active, only allow the first correct answer
    if (singleActiveAsk !== null) {
        if (!firstAnswerUser) {
            firstAnswerUser = user;
            entriviaSingleAskLastWinner = user;  // Store the last winner
            entriviaSingleAskWinners.push(user);  // Add to winners list
            playSound("entriviafirstcorrect");
            return true; // First correct answer counts
        }
        playSound("entriviawrong"); // Incorrect answer sound, but no tracking
        return false;
    }

    // Normal entrivia logic (multiple correct answers allowed)
    if (userAnswer === correctAnswer) {
        userStats[user].correctAnswers++;
        answeredUsers.add(user);

        if (!firstAnswerUser) {
            firstAnswerUser = user;
            userStats[user].firstAnswers++;
            userScores[user] = (userScores[user] || 0) + 3;  // First answer gets 3 points
            playSound("entriviafirstcorrect");
        } else {
            userScores[user] = (userScores[user] || 0) + 1;  // Others get 1 point
            playSound("entriviacorrect");
        }

        updateentriviaboard();
        return true;
    } else {
		// Normal incorrect answer logic
		userStats[user].incorrectAnswers++;  
		userScores[user] = (userScores[user] || 0) - 1;
		playSound("entriviawrong");

		return false;
	}
}


//update the guestion counter
function updateQuestionCounter() {
	document.getElementById("question-counter").textContent = `Question: ${questionsAsked} / ${questionsPerRound}`;
}
function updateentriviaboard() {
    const entriviaboardElement = document.getElementById("entriviaboard");
    entriviaboardElement.innerHTML = "<p>entrivia</p>";

    Object.entries(userScores)
        .sort((a, b) => b[1] - a[1]) // Sort by score
        .forEach(([user, score]) => {
            const li = document.createElement("li");
            const correctAnswers = userStats[user] ? userStats[user].correctAnswers : 0;
			const incorrectAnswers = userStats[user] ? userStats[user].incorrectAnswers : 0;
            const firstAnswers = userStats[user] ? userStats[user].firstAnswers : 0;
            li.textContent = `${user}: ${score} pts |🎯 ${firstAnswers} |✅ ${correctAnswers} |❌ ${incorrectAnswers}`;
            entriviaboardElement.appendChild(li);
        });
}
function updateUserOverallStats() {
    const sortedUsers = Object.entries(userScores).sort((a, b) => b[1] - a[1]);

    sortedUsers.forEach(([user, score]) => {
        if (!userOverallStats[user]) {
            userOverallStats[user] = {
                correctAnswers: 0,
                firstAnswers: 0,
				incorrectAnswers: 0,
                round1wins: 0,
                round2wins: 0,
                round3wins: 0,
                // Add more rounds as needed
            };
        }

        // Accumulate stats
        userOverallStats[user].correctAnswers += userStats[user]?.correctAnswers || 0;
        userOverallStats[user].firstAnswers += userStats[user]?.firstAnswers || 0;
		userOverallStats[user].incorrectAnswers += userStats[user]?.incorrectAnswers || 0;
    });

    // Award round win to the top scorer
    if (sortedUsers.length > 0) {
        let topUser = sortedUsers[0][0]; // Get username of the top scorer
        let roundKey = `round${round}wins`;

        if (!userOverallStats[topUser][roundKey]) {
            userOverallStats[topUser][roundKey] = 0;
        }
        userOverallStats[topUser][roundKey]++; // Increment their round wins
    }

    console.log("Updated Overall Stats:", userOverallStats); // Debug log
}
//function to display the winners from the last game
function updatePodium() {
    // Get top 5 sorted users
    const sortedUsers = Object.entries(userScores).sort((a, b) => b[1] - a[1]);
    console.log("Updating Podium");
    console.log("Sorted users:", sortedUsers);
    console.log("Current userStats:", userStats); // Debugging log

    for (let i = 0; i < 3; i++) {
        const [user, score] = sortedUsers[i] || [];
        if (user) {
            console.log(`Winner ${i + 1}: ${user} - Score: ${score}`);
            displayChatMessage("Console:", `Winner ${i + 1}: ${user} - Score: ${score}`, {}, {});

            let nameElement = document.getElementById(`winner${i + 1}Name`);
            let scoreElement = document.getElementById(`winner${i + 1}Score`);

            nameElement.textContent = user;
            scoreElement.textContent = `Score: ${score}`;

            // Apply user color
            let userColor = userColors[user] || "#FFFFFF"; // Default white
            nameElement.style.color = userColor;

            // Parent container
            const winnerContainer = document.getElementById(`winner${i + 1}`).parentElement;

            // Remove any existing extra stats div to prevent duplicates
            let oldExtraStats = winnerContainer.querySelector(".extraStats");
            if (oldExtraStats) oldExtraStats.remove();

            // Create extra stats div
            let extraStatsDiv = document.createElement("div");
            extraStatsDiv.className = "extraStats";

            // Debugging logs
            console.log(`Checking stats for ${user}:`, userStats[user]);

            // Ensure userStats[user] exists before accessing properties
            let firstAnswers = userStats[user]?.firstAnswers ?? 0;
            let correctAnswers = userStats[user]?.correctAnswers ?? 0;
            let incorrectAnswers = userStats[user]?.incorrectAnswers ?? 0;

            let firstAnswersElement = document.createElement("p");
            let correctAnswersElement = document.createElement("p");
            let incorrectAnswersElement = document.createElement("p");

            firstAnswersElement.textContent = `🎯 First: ${firstAnswers}`;
            correctAnswersElement.textContent = `✅ ${correctAnswers}`;
            incorrectAnswersElement.textContent = `❌ ${incorrectAnswers}`;

            extraStatsDiv.appendChild(incorrectAnswersElement);
            extraStatsDiv.appendChild(correctAnswersElement);
            extraStatsDiv.appendChild(firstAnswersElement);

            // Append the extraStatsDiv next to the winner container
            winnerContainer.appendChild(extraStatsDiv);
        }
    }

    // Update 4th and 5th place winners
    for (let i = 3; i < 5; i++) {
        const [user, score] = sortedUsers[i] || [];
        if (user) {
            console.log(`Winner ${i + 1} (4th/5th place): ${user} - Score: ${score}`);
            let nameElement = document.getElementById(`winner${i + 1}Name`);
            let scoreElement = document.getElementById(`winner${i + 1}Score`);
            nameElement.textContent = user;
            scoreElement.textContent = `Score: ${score}`;
            let userColor = userColors[user] || "orangered"; // Default color
            nameElement.style.color = userColor;
        }
    }

    updateLastentriviaClassicWinners();
	userStats = {}; // Reset stats for the new round
}
//function to show the entrivia overlay/ui display
function showentrivia() {
	const entriviaWrapper = document.getElementById("entriviaWrapper");
    const questionWrapper = document.getElementById("questionWrapper");
    const board = document.getElementById("entriviaboard");
    const timer = document.getElementById("timer");
    const timeUntilNextQ = document.getElementById("timeuntil-nextQ");

    // Show elements with animations
	entriviaWrapper.style.visibility = "visible";
	entriviaWrapper.style.opacity = "1";
    questionWrapper.style.visibility = "visible";
    questionWrapper.style.opacity = "1";
    questionWrapper.style.animation = "fadeIn 0.8s ease-out forwards";

    board.style.animation = "slideIn 0.8s ease-out forwards";
    timer.style.animation = "fadeIn 1s ease-in-out forwards";
    timeUntilNextQ.style.animation = "fadeIn 1s ease-in-out forwards";
}

function hideentrivia() {
	const entriviaWrapper = document.getElementById("entriviaWrapper");
	const entriviaPodium = document.getElementById("entriviaPodium");
    const questionWrapper = document.getElementById("questionWrapper");
    const board = document.getElementById("entriviaboard");
    const timer = document.getElementById("timer");
    const timeUntilNextQ = document.getElementById("timeuntil-nextQ");

    // Hide elements with animations
    questionWrapper.style.animation = "fadeOut 0.5s ease-in forwards";
	entriviaPodium.style.animation = "fadeOut 0.5s ease-in forwards";
    board.style.animation = "slideOut 0.5s ease-in forwards";
    timer.style.animation = "fadeOut 0.5s ease-in forwards";
    timeUntilNextQ.style.animation = "fadeOut 0.5s ease-in forwards";

    setTimeout(() => {
        questionWrapper.style.visibility = "hidden";
        questionWrapper.style.opacity = "0";
		entriviaWrapper.style.visibility = "hidden";
		entriviaWrapper.style.opacity = "0";
    }, 500); // Matches the fade-out animation duration
}
//function to show/hide the entrivia podium overlay/ui display
function showPodium() {
	const entriviaPodium = document.getElementById("entriviaPodium");
	const entriviaWrapper = document.getElementById("entriviaWrapper");
	const board = document.getElementById("entriviaboard");
    if (entriviaPodium) {
		// Show elements with animations
		// ensure wrapper is visible
		entriviaPodium.style.display = "flex";
		entriviaWrapper.style.visibility = "visible";
		entriviaWrapper.style.opacity = "1";
		// Show podium and entriviaboard with animations
		entriviaPodium.style.visibility = "visible";
		entriviaPodium.style.opacity = "1";
		board.style.visibility = "visible";
		board.style.opacity = "1";
		entriviaPodium.style.animation = "fadeIn 0.8s ease-out forwards";
		board.style.animation = "slideIn 0.8s ease-out forwards";
		//log in console & display console message on screen
        console.log("Displaying entriviaPodium...");
        displayConsoleMessage("Console:", "Displaying entriviaPodium...", {}, {});
    } else {
		//log in console & display console message on screen
        console.log("Error: entriviaPodium element not found!");
        displayConsoleMessage("Console:", "Error: entriviaPodium element not found!", {}, {});
    }
}
function hidePodium() {
	const entriviaPodium = document.getElementById("entriviaPodium");
    const board = document.getElementById("entriviaboard");
    const timer = document.getElementById("timer");
    const timeUntilNextQ = document.getElementById("timeuntil-nextQ");
	console.log("Hiding entriviaPodium...");
    // Hide elements with animations
	entriviaPodium.style.animation = "fadeOut 0.5s ease-in forwards";
    board.style.animation = "slideOut 0.5s ease-in forwards";
    timer.style.animation = "fadeOut 0.5s ease-in forwards";
    timeUntilNextQ.style.animation = "fadeOut 0.5s ease-in forwards";
    setTimeout(() => {
        entriviaPodium.style.visibility = "hidden";
        entriviaPodium.style.opacity = "0";
		console.log("entriviaPodium hidden!...");
    }, 500); // Matches the fade-out animation duration
}
function toggleentrivia() {
    const wrapper = document.getElementById("questionWrapper");
    const board = document.getElementById("entriviaboard");
    const timer = document.getElementById("timer");
    const timeUntilNextQ = document.getElementById("timeuntil-nextQ");

    if (wrapper.style.visibility === "hidden" || wrapper.style.visibility === "") {
        // Show elements with animations
        wrapper.style.visibility = "visible";
        wrapper.style.opacity = "1";
        wrapper.style.animation = "fadeIn 0.8s ease-out forwards";

        board.style.animation = "slideIn 0.8s ease-out forwards";
        timer.style.animation = "fadeIn 1s ease-in-out forwards";
        timeUntilNextQ.style.animation = "fadeIn 1s ease-in-out forwards";
    } else {
        // Hide elements with animations
        wrapper.style.animation = "fadeOut 0.5s ease-in forwards";
        board.style.animation = "slideOut 0.5s ease-in forwards";
        timer.style.animation = "fadeOut 0.5s ease-in forwards";
        timeUntilNextQ.style.animation = "fadeOut 0.5s ease-in forwards";

        setTimeout(() => {
            wrapper.style.visibility = "hidden";
            wrapper.style.opacity = "0";
        }, 500); // Matches the fade-out animation duration
    }
}

function startentrivia() {
	displayConsoleMessage("system", "startentrivia fn called");
    if (entriviaGameState === "started") {
		displayConsoleMessage("system", "entrivia is already running! Ignoring duplicate command.");
        console.log("entrivia is already running! Ignoring duplicate command.");
        return; // Stop if entrivia is already running
    }
	displayConsoleMessage("system", "entrivia Should splash and fetch.");
    console.log("entrivia should splash and fetch questions");

    entriviaSplash() // Run splash first
        .then(() => fetchentriviaQuestions()) // Fetch questions after splash
        .then(questions => {
		    entriviaGameState = "started"; // Mark entrivia as started
            window.entriviaQuestions = questions;
			console.log("entriviaGameState = " + entriviaGameState);
            console.log("entrivia Questions Loaded:", questions);
			displayConsoleMessage("system", `entriviaGameState = ${entriviaGameState}`);
			handlephaseentrivia();
			
        })
        .catch(error => {
            console.error("Error loading entrivia questions:", error);
			displayConsoleMessage("system", `Error loading entrivia questions: ${error}`);
            entriviaGameState = null; // Reset state on failure
        });

}
function resetentrivia() {
	console.log('Game Ended on Round:', round,'||Total Rounds:', totalRounds);
	// Prepare for the next Game
    clearInterval(questionTimer);
    clearInterval(countdownTimer);
    clearTimeout(hideQuestionTimer);
    entriviaGameState = null;
    questionsAsked = 0;
    round = 1;
    usedQuestions = [];
	userStats = {};
    userScores = {};
    answeredUsers.clear();
    firstAnswerUser = null;
    // Hide UI elements or reset text
	//document.getElementById("question").textContent = `Round ${round}`;
	document.getElementById("question").textContent = "Type !entrivia to play";
    document.getElementById("timeuntil-nextQ").textContent = "";
    document.getElementById("timer").textContent = "";
    document.getElementById("timeuntil-nextQ").textContent = "";
    toggleElement("questionWrapper", "fade");
	console.log('entrivia Reset - current round:', round,'||Total Rounds:', totalRounds);
}


function entriviaGameFinished() {
	console.log('Round:', round);
	console.log('Total Rounds:', totalRounds);
    document.getElementById("question").textContent = `Round ${round}`;
    document.getElementById("timer").textContent = "Game Over";
    document.getElementById("timeuntil-nextQ").textContent = "";
    toggleElement("questionWrapper", "fade");
    // play gameover sound
	playRandomWinSound();
	// Store Game stats in overall stats
    updateUserOverallStats();
    updatePodium();
	showPodium();
	// Prepare for the next Game
	resetentrivia();
	// Hide podium after 5 minutes
    setTimeout(hidePodium, 120000);
}

function endentrivia() {
    clearInterval(questionTimer);
    clearInterval(countdownTimer);
    clearTimeout(hideQuestionTimer);
    entriviaGameState = null;
    questionsAsked = 0;
    round = 1;
    usedQuestions = [];
    userScores = {};
    answeredUsers.clear();
    firstAnswerUser = null;
    // Hide UI elements or reset text
    document.getElementById("timeuntil-nextQ").textContent = "";
    hideentrivia(); // Hide the entrivia UI
}
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//    Game finished
//____________________________|

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//- ASK SINGLE RANDOM QUESTION
function askSplash() {
    return showAnnouncement("Asking Random Question in:", 30)
        .then(() => {
            showentriviaAsk();  // Show entrivia after the countdown
        })
        .catch(error => {
            console.error("Error in askSplash:", error);
        });
}
function showentriviaAsk() {
	const entriviaWrapper = document.getElementById("entriviaWrapper");
    const questionWrapper = document.getElementById("questionWrapper");
    const timer = document.getElementById("timer");
    const timeUntilNextQ = document.getElementById("timeuntil-nextQ");
	displayConsoleMessage("system", "showentriviaAsk() called");
    // Show elements with animations
	entriviaWrapper.style.visibility = "visible";
	entriviaWrapper.style.opacity = "1";
    questionWrapper.style.visibility = "visible";
    questionWrapper.style.opacity = "1";
    questionWrapper.style.animation = "fadeIn 0.8s ease-out forwards";
    timer.style.animation = "fadeIn 1s ease-in-out forwards";
    timeUntilNextQ.style.animation = "fadeIn 1s ease-in-out forwards";
}
function getRandomAsk() {
	let currentRound = round === 1 ? "round1" : "round2";
	let availableQuestions = entriviaQuestions[currentRound].filter(q => !usedQuestions.includes(q));
	if (availableQuestions.length === 0) {
		usedQuestions = []; // Reset when all questions are used
		availableQuestions = [...entriviaQuestions[currentRound]];
	}
	let question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
	usedQuestions.push(question);
	return question;
}
function endAsk() {
    clearInterval(questionTimer);
    document.getElementById("question").textContent = "Time's up! Answer was: " + activeQuestion.answer;
	document.getElementById("timer").textContent = "";
	activeQuestion = null;
	singleActiveAsk = null;
	playSound("entriviatimesup");
    hideQuestionTimer = setTimeout(() => {
        document.getElementById("questionWrapper").style.visibility = "hidden";
        document.getElementById("entriviaboard").style.visibility = "visible";
    }, 13000); // Delay timeout of 13 seconds to wait before checking
}
function AskQuestion() {
    clearTimeout(questionTimer); // Clear previous timer if any
    clearTimeout(hideQuestionTimer); // Assuming hideQuestionTimer exists for hiding the question after time runs out
    answeredUsers.clear();
    firstAnswerUser = null;
    activeQuestion = getRandomQuestion();
    updateQuestionCounter(); // Update the display
	document.getElementById("question-counter").textContent = `First Correct Answer Wins`;
    document.getElementById("question").textContent = activeQuestion.question;
    document.getElementById("questionWrapper").style.visibility = "visible";
    document.getElementById("timer").textContent = timetoAnswer;
    document.getElementById("timeuntil-nextQ").textContent = "";
	playRandomQuestionSound();
    let secondsLeft = timetoAnswer;
    questionTimer = setInterval(() => {
        secondsLeft--;
        document.getElementById("timer").textContent = `Time left: ${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, '0')}`;
        if (secondsLeft <= 0) {
            endAsk(); // Call your function to end the question once time runs out
        }
    }, 1000);
}
function AskfromCat(round, category) {
    clearTimeout(questionTimer); // Clear previous timer if any
    clearTimeout(hideQuestionTimer); // Assuming hideQuestionTimer exists for hiding the question after time runs out
    answeredUsers.clear();
    firstAnswerUser = null;
    // Use the passed round and category to get the random question
    activeQuestion = getRandomQuestionFromCategory(round, category);
    if (!activeQuestion) {
        console.error("❌ No question found for the specified round and category.");
        return;
    }
    updateQuestionCounter(); // Update the display
    document.getElementById("question-counter").textContent = `First Correct Answer Wins`;
    document.getElementById("question").textContent = activeQuestion.question;
    document.getElementById("questionWrapper").style.visibility = "visible";
    document.getElementById("timer").textContent = timetoAnswer;
    document.getElementById("timeuntil-nextQ").textContent = "";
    playRandomQuestionSound();
    let secondsLeft = timetoAnswer;
    questionTimer = setInterval(() => {
        secondsLeft--;
        document.getElementById("timer").textContent = `Time left: ${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, '0')}`;
        if (secondsLeft <= 0) {
            endAsk(); // Call your function to end the question once time runs out
        }
    }, 1000);
}
function startentriviaAskfromCat(round, category) {
    displayConsoleMessage("system", "startentriviaAskfromCat fn called");
    if (entriviaGameState === "started") {
        displayConsoleMessage("system", "entrivia is already running! Ignoring duplicate command.");
        console.log("entrivia is already running! Ignoring duplicate command.");
        return; // Stop if entrivia is already running
    }
    if (singleActiveAsk === "Active") {
        displayConsoleMessage("system", "entrivia is already Asking a question! Ignoring duplicate command.");
        console.log("entrivia is already running! Ignoring duplicate command.");
        return; // Stop if entrivia is already running
    }
    displayConsoleMessage("system", "entrivia ask continues");
    console.log("entrivia should splash and fetch a question from a specific category.");

    askSplash() // Run splash first
        .then(() => fetchentriviaQuestions()) // Fetch questions after splash
        .then(questions => {
            singleActiveAsk = "Active"; // Mark entrivia as started
            window.entriviaQuestions = questions;
            console.log("singleActiveAsk = " + singleActiveAsk);
            console.log("entrivia Questions Loaded:", questions);
            displayConsoleMessage("system", `singleActiveAsk = ${singleActiveAsk}`);
            // Pass the round and category to AskfromCat
            AskfromCat(round, category);
        })
        .catch(error => {
            console.error("Error loading entrivia questions:", error);
            displayConsoleMessage("system", `Error loading entrivia questions: ${error}`);
            singleActiveAsk = null; // Reset state on failure
        });
}
function startentriviaAsk() {
	displayConsoleMessage("system", "startentrivia fn called");
    if (entriviaGameState === "started") {
		displayConsoleMessage("system", "entrivia is already running! Ignoring duplicate command.");
        console.log("entrivia is already running! Ignoring duplicate command.");
        return; // Stop if entrivia is already running
    }
    if (singleActiveAsk === "Active") {
		displayConsoleMessage("system", "entrivia is already Asking a question! Ignoring duplicate command.");
        console.log("entrivia is already running! Ignoring duplicate command.");
        return; // Stop if entrivia is already running
    }
	displayConsoleMessage("system", "entrivia ask continues");
    console.log("entrivia should splash and fetch questions");

    askSplash() // Run splash first
        .then(() => fetchentriviaQuestions()) // Fetch questions after splash
        .then(questions => {
		    singleActiveAsk = "Active"; // Mark entrivia as started
            window.entriviaQuestions = questions;
			console.log("singleActiveAsk = " + singleActiveAsk);
            console.log("entrivia Questions Loaded:", questions);
			displayConsoleMessage("system", `singleActiveAsk = ${singleActiveAsk}`);
			AskQuestion();
        })
        .catch(error => {
            console.error("Error loading entrivia questions:", error);
			displayConsoleMessage("system", `Error loading entrivia questions: ${error}`);
            singleActiveAsk = null; // Reset state on failure
        });

}

function displayLastWinner() {
    if (entriviaSingleAskLastWinner) {
        const message = `🎉 Congratulations to ${entriviaSingleAskLastWinner} for answering first correctly! 🎉`;
        displayentriviaMessage("📢", message);
    } else {
        const message = "No winner yet.";
        displayentriviaMessage("📢", message);
    }
}
// Function to display last game's winners
function displayLastentriviaWinners() {
    if (!lastentriviaClassicWinners || lastentriviaClassicWinners.length === 0) {
        displayentriviaMessage("📢", "No winners from the last entrivia game.", {}, {});
        return;
    }

    displayentriviaMessage("📢", "Last entrivia Winners:", {}, {});

    lastentriviaClassicWinners.forEach((winner, index) => {
        let message = `🏆 ${index + 1} - ${winner.username}: ${winner.score} points | 🎯 First: ${winner.firstAnswers} | ✅ ${winner.correctAnswers} | ❌ ${winner.incorrectAnswers}`;
        displayentriviaMessage("📢", message, {}, {});
    });
}

// Function to display all past entrivia games from history
function displayentriviaHistory() {
	loadentriviaHistory();
    if (!entriviaClassicHistory || entriviaClassicHistory.length === 0) {
        displayentriviaMessage("📢", "No past entrivia games recorded.", {}, {});
        return;
    }

    displayentriviaMessage("📜", "entrivia History:", {}, {});

    entriviaClassicHistory.forEach((game, index) => {
        if (Array.isArray(game)) {  // Ensure game structure matches new updates
            let timestamp = game[0]?.timestamp || `Game #${index + 1}`;
            displayentriviaMessage("📆", `${timestamp}`, {}, {});

            game.forEach((winner, idx) => {
                let message = `🏆 ${idx + 1} - ${winner.username}: ${winner.score} points | 🎯 First: ${winner.firstAnswers} | ✅ ${winner.correctAnswers} | ❌ ${winner.incorrectAnswers}`;
                displayentriviaMessage("📢", message, {}, {});
            });
        }
    });
}

//displayLastWinner();
//displayLastentriviaWinners();
//displayentriviaHistory();

//------------------------
//---generic ui logic----|
//-----------------------
//function to toggle element visibility
function toggleElement(elementId, animationType = "fade") {
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


//toggles
function toggleentriviaconsolemessages() {
    consolemessages = !consolemessages;
    updateSingleSetting("consolemessages", consolemessages);
	console.log("toggled consolemessages", consolemessages);
    updateIndicatorLights();
}
function toggleusedefaultquestions() {
    usedefaultquestions = !usedefaultquestions;
    updateSingleSetting("usedefaultquestions", usedefaultquestions);
	console.log("toggled usedefaultquestions", usedefaultquestions);
    updateIndicatorLights();
}
function toggleusecustomquestions() {
    usecustomquestions = !usecustomquestions;
    updateSingleSetting("usecustomquestions", usecustomquestions);
	console.log("toggled customquestions", usecustomquestions);
	displayConsoleMessage("toggled customquestions", usecustomquestions);
    updateIndicatorLights();
}
function toggleentriviachatOverlay() {
	entriviachatOverlay = !entriviachatOverlay;
	updateSingleSetting("entriviachatOverlay", entriviachatOverlay);
	updateIndicatorLights();
	console.log(`entrivia Chat Overlay is now: ${entriviachatOverlay}`);
	displayConsoleMessage("system", `entrivia Chat Overlay is now: ${entriviachatOverlay}`);
}
function togglechatanswers() {
	chatanswers = !chatanswers;
	updateSingleSetting("chatanswers", chatanswers);
	updateIndicatorLights();
	console.log(` Can chat answer entrivia: ${entriviachatOverlay}`);
	displayConsoleMessage("system", `Can chat answer entrivia: ${entriviachatOverlay}`);
}
//-----------------------------------
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
		entriviachatOverlay,
		chatanswers,
		audioSetting
    };
    localStorage.setItem("entriviaClassicSettings", JSON.stringify(entriviaClassicSettings));
}
function updateSettings() {
    timetoAnswer = parseInt(document.getElementById("timeToAnswer").value, 10);
    timebetweenQuestions = parseInt(document.getElementById("timeBetweenQuestions").value, 10);
    timebetweenRounds = parseInt(document.getElementById("timeBetweenRounds").value, 10);
    questionsPerRound = parseInt(document.getElementById("questionsPerRound").value, 10);
    // Get the toggle states
    saveSettings();
    displayentriviaMessage("!!", "entrivia Settings updated and saved.", {}, {});
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
	entriviachatOverlay = false;
	chatanswers = false;
	audioSetting = true;
    // Clear saved settings
    localStorage.removeItem("entriviaClassicSettings");

    // Update input fields
    document.getElementById("timeToAnswer").value = timetoAnswer;
    document.getElementById("timeBetweenQuestions").value = timebetweenQuestions;
    document.getElementById("timeBetweenRounds").value = timebetweenRounds;
    document.getElementById("questionsPerRound").value = questionsPerRound;

    displayentriviaMessage("!!", "entrivia Settings Reset to default.", {}, {});
}
function updateSettingsDisplay() {
    let savedSettings = localStorage.getItem("entriviaClassicSettings");
    if (savedSettings) {
        let settings = JSON.parse(savedSettings);
        timetoAnswer = settings.timetoAnswer;
        timebetweenQuestions = settings.timebetweenQuestions;
        timebetweenRounds = settings.timebetweenRounds;
        questionsPerRound = settings.questionsPerRound;
		//toggles
        usedefaultquestions = settings.usedefaultquestions ?? true; // Default to true if missing
        usecustomquestions = settings.usecustomquestions ?? true; // Default to true if missing

        // Update UI elements
        document.getElementById("timeToAnswer").value = timetoAnswer;
        document.getElementById("timeBetweenQuestions").value = timebetweenQuestions;
        document.getElementById("timeBetweenRounds").value = timebetweenRounds;
        document.getElementById("questionsPerRound").value = questionsPerRound;
		updateIndicatorLights();
    }
}

let settings = { usedefaultquestions, usecustomquestions, consolemessages, entriviachatOverlay, chatanswers, audioSetting };
function updateIndicatorLights() { 
	let settings = { usedefaultquestions, usecustomquestions, consolemessages, entriviachatOverlay, chatanswers, audioSetting };
    document.querySelectorAll(".light-indicator").forEach(indicator => {
        const optionName = indicator.getAttribute("data-option");
        const optionValue = settings[optionName]; // Get the value safely
        console.log(`Checking ${optionName}:`, optionValue); // Debug log
        
        // Set light color based on value
        const lightColor = (optionValue === true || optionValue === "on") 
            ? "green" 
            : (optionValue === false || optionValue === "off") 
                ? "red" 
                : "gray"; // Fallback color
        indicator.style.backgroundColor = lightColor;

        // Find the nearest <strong> element and change text color
        const statusText = indicator.closest('.statusindicatorWrapper').querySelector('strong');
        if (statusText) {
            statusText.style.color = lightColor;  // Set the text color to green/red
            statusText.textContent = (optionValue === true || optionValue === "on") ? "Enabled" : "Disabled";
        }
    });
}

// Function to dynamically add a button and a status light indicator
function updateentriviaSettingsUI() {
	let settings = { usedefaultquestions, usecustomquestions, consolemessages, entriviachatOverlay, chatanswers, audioSetting };
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

// Run the function to update the UI
updateentriviaSettingsUI();
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// COMFY JS specific logic/functions
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

/* ComfyJS.onChat = (user, message, color, flags, extra) => {
    // If chat answers are enabled, check the message for answers
    if (chatanswers) {
        console.log("UserColor:", extra.userColor, "User:", user, "Message:", message);
        // Check if the message is correct
        let isCorrect = checkAnswer(user, message);
        // Display the message with whether it's correct or not
        displayChatMessage(user, message, flags, extra, isCorrect);
    } else {
        // Otherwise, just display the message without checking
        displayChatMessage(user, message, flags, extra, false);
    }
}; */
ComfyJS.onCommand = (user, command, message, flags, extra) => {
	console.log( "User:", user, "command:", command,);
	displayConsoleMessage(user, `!${command}`);
    // Store user color from extra	
    if (!userColors[user]) {
        userColors[user] = extra.userColor || "orangered"; // Default to white if no color is provided
    }
	if (command === "a" || command === "answer") {
		let answer = message.trim();  // Extract the answer
		let isCorrect = checkAnswer(user, answer);  // Check if the answer is correct
		// Display the answer in chat regardless of whether it's correct or incorrect
		if (isCorrect) {
			// displayentriviaMessage
			// If the answer is correct, display the answer with a ✅ checkmark
			displayConsoleMessage(user, `!${command} ${answer} ✅`);
			displayentriviaMessage(user, `!${command} ${answer} ✅`, flags, extra, true);
		} else if (!answeredUsers.has(user)) {
			// If the user hasn't answered correctly yet, display the answer with an ❌ X mark
			displayConsoleMessage(user, `!${command} ${answer} ❌`);
			displayentriviaMessage(user, `!${command} ${answer} ❌`, flags, extra, false);
		} else {
			// If the user has already answered correctly, do nothing (ignore their further answers)
			console.log(`${user} has already answered correctly. Ignoring further answers.`);
		}
	}
	// Only allow streamer to trigger these commands:
//-------------------------------------------------------
	if (command.toLowerCase() === "entriviatest-auth") {
        if (!isStreamerAndAuthorize(user, command)) return;
        displayConsoleMessage(user, `!${command} ✅`);
        displayChatMessage(user, `!${command} ✅`, flags, extra, true);
    }
	if (command.toLowerCase() === "entriviatest-sounds") {
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		playQuestionSound(randomSound); // Play the sound when !playsound is typed in chat
	}
	if (command.toLowerCase() === "entrivia-nextround") {
		if (!isStreamerAndAuthorize(user, command)) return;
		console.log("Current Round:", round);
		questionsAsked = 0; // Reset for the new round
		document.getElementById("question").textContent = "entrivia Round:"+ round;
		setTimeout(handlephaseentrivia, 10000);
	}
    if (command.toLowerCase() === "entrivia-play") {
        if (!isStreamerAndAuthorize(user, command)) return;
        displayConsoleMessage(user, `!${command} ✅`);
        displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);
		startentrivia();
    }

    if (command.toLowerCase() === "entrivia-askrandom") {
        if (!isStreamerAndAuthorize(user, command)) return;
        displayConsoleMessage(user, `!${command} ✅`);
        displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);
        startentriviaAsk();
    }
	//example of command to ask a question from a specific round and category:
	//!entrivia-ask easy/hard | mining
	if (command.toLowerCase() === "entrivia-ask") {
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);
		
		// Extract the difficulty and category from the message
		let messageContent = message.trim();
		let parts = messageContent.split("|").map(p => p.trim());
		
		// Validate input format
		if (parts.length < 2) {
			displayentriviaMessage(user, `⚠️ Invalid format! Use: !entrivia-ask easy/hard | category`, flags, extra, true);
			return;
		}
		
		let difficulty = parts[0].toLowerCase();
		let category = parts[1].toLowerCase();
		
		// Map easy to round1 and hard to round2
		let round;
		if (difficulty === "easy") {
			round = "round1";
		} else if (difficulty === "hard") {
			round = "round2";
		} else {
			displayentriviaMessage(user, `⚠️ Invalid difficulty! Use 'easy' or 'hard'.`, flags, extra, true);
			return;
		}
		
		// Ensure the category is valid
		const validCategories = ["mining", "hunting", "crafting", "history", "beauty", "economy", "social", "misc"];
		
		if (!validCategories.includes(category)) {
			displayentriviaMessage(user, `⚠️ Invalid category! Use one of the following: ${validCategories.join(", ")}`, flags, extra, true);
			return;
		}
		
		// Call startentriviaAskfromCat with the round and category
		startentriviaAskfromCat(round, category);
	}
	if (command.toLowerCase() === "entrivia-lastaskwinner") {
        if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
        displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);
		displayLastWinner();
    }
	if (command.toLowerCase() === "entrivia-lastwinners") {
        if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
        displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);
		displayLastentriviaWinners();
    }
	if (command.toLowerCase() === "entrivia-history") {
        if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
        displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);
		displayentriviaHistory();
    }
	if (command.toLowerCase() === "entrivia-chatanswers") {
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);
		togglechatanswers();
	}
	if (command.toLowerCase() === "entrivia-disablechat") {
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
        displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);
		toggleentriviachatOverlay();
	}
	if (command.toLowerCase() === "entrivia-audio") {
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
        displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);
		toggleAudioSetting();
	}
	if (command.toLowerCase() === "toggleentriviaboard") {
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		toggleElement("entriviaboard", "slide");
	}
	if (command.toLowerCase() === "togglequestions") {
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		toggleElement("questionWrapper", "fade");
	}
	if (command.toLowerCase() === "toggleentrivia") {
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		toggleentrivia();
		toggleElement("entriviaWrapper", "fade");
	}
	if (command.toLowerCase() === "togglechat") {
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		toggleElement("twitchchatContainer", "fade");
	}
//-------------------------------------------------------
	// Command-based settings updates
	//example cmd to add question:
	//!entrivia-addquestion easy/hard | economy | what does ped stand for | project entropia dollar
	if (command.toLowerCase() === "entrivia-addquestion") {  
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);
		
		// Extract message text after the command
		let messageContent = message.trim();
		let parts = messageContent.split("|").map(p => p.trim());
		
		// Validate input format
		if (parts.length < 4) {  // Now expects 4 parts (difficulty, category, question, answer)
			displayentriviaMessage(user, `⚠️ Invalid format! Use: !entrivia-addquestion easy/hard | category | question | answer`, flags, extra, true);
			return;
		}
		
		let difficulty = parts[0].toLowerCase();
		let category = parts[1].toLowerCase(); // Extract category
		let questionText = parts[2];
		let correctAnswer = parts[3];
		
		// Map easy to round1 and hard to round2
		let round;
		if (difficulty === "easy") {
			round = "round1";
		} else if (difficulty === "hard") {
			round = "round2";
		} else {
			displayentriviaMessage(user, `⚠️ Invalid difficulty! Use 'easy' or 'hard'.`, flags, extra, true);
			return;
		}
		
		// Ensure the category is valid
		const validCategories = ["mining", "hunting", "crafting", "history", "beauty", "economy", "social", "misc"];

		if (!validCategories.includes(category)) {
			displayentriviaMessage(user, `⚠️ Invalid category! Use one of the following: ${validCategories.join(", ")}`, flags, extra, true);
			return;
		}

		// Add the custom entrivia question with the selected category
		addCustomentriviaQuestion(round, questionText, correctAnswer, category);
		
		// Confirm success
		displayentriviaMessage(user, `✅ Custom question added to ${round} (${category})!`, flags, extra, true);
	}
	if (command.toLowerCase() === "entrivia-answertime") { 
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);

		timetoAnswer = parseInt(message, 10);
		updateSingleSetting("timetoAnswer", timetoAnswer);
	}
	if (command.toLowerCase() === "entrivia-questiondelay") { 
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);

		timebetweenQuestions = parseInt(message, 10);
		updateSingleSetting("timebetweenQuestions", timebetweenQuestions);
	}
	if (command.toLowerCase() === "entrivia-rounddelay") { 
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);

		timebetweenRounds = parseInt(message, 10);
		updateSingleSetting("timebetweenRounds", timebetweenRounds);
	}
	if (command.toLowerCase() === "entrivia-questioncap") { 
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);

		questionsPerRound = parseInt(message, 10);
		updateSingleSetting("questionsPerRound", questionsPerRound);
	}
	// Toggle default questions
	if (command.toLowerCase() === "entrivia-consolemessages") {  
		if (!isStreamerAndAuthorize(user, command)) return;

		toggleentriviaconsolemessages(); // Uses function to update setting
		displayConsoleMessage(user, `!${command} ${consolemessages ? "Enabled ✅" : "Disabled ❌"}`);
		displayentriviaMessage(user, `!${command} ${consolemessages ? "Enabled ✅" : "Disabled ❌"}`, flags, extra, true);
	}
	if (command.toLowerCase() === "entrivia-defaultquestions") {  
		if (!isStreamerAndAuthorize(user, command)) return;

		toggleusedefaultquestions(); // Uses function to update setting
		displayConsoleMessage(user, `!${command} ${usedefaultquestions ? "Enabled ✅" : "Disabled ❌"}`);
		displayentriviaMessage(user, `!${command} ${usedefaultquestions ? "Enabled ✅" : "Disabled ❌"}`, flags, extra, true);
	}
	// Toggle custom questions
	if (command.toLowerCase() === "entrivia-customquestions") {  
		if (!isStreamerAndAuthorize(user, command)) return;

		toggleusecustomquestions(); // Uses function to update setting
		displayConsoleMessage(user, `!${command} ${usecustomquestions ? "Enabled ✅" : "Disabled ❌"}`);
		displayentriviaMessage(user, `!${command} ${usecustomquestions ? "Enabled ✅" : "Disabled ❌"}`, flags, extra, true);
	}
//-------------------------------------------------------
    // Only allow mods to trigger these commands:
    if (flags.mod) {
		if (command === "entriviamod-test") {
			if (!isStreamerAndAuthorize(user, command)) return;
			displayConsoleMessage(user, `!${command} ✅`);
			displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);
			toggleElement("twitchchatContainer", "fade");
		}
	}
	if (command.toLowerCase() === "helloworld") {
		// Custom logic to send "Hello, world!" to your overlay chat
		const message = "Hello, world!";
		displayConsoleMessage(user, `!${command} ✅`);
		displayChatMessage("System", message, {}, {}); // Call the function to display the message in the chat overlay
		console.log(`Sent message to overlay: ${message}`); // Log to the console
	}
};

// Declare the arrays globally
const usercommands = [
	{ command: "!a / !answer", description: "Allows users to answer a entrivia question.", usage: "!a / !answer" },
];

const streamercommands = [
	{ command: "!a / !answer", description: "Allows users to answer a entrivia question.", usage: "!a / !answer" },
	{ command: "!entrivia-play", description: "Starts the entrivia game.", usage: "!entrivia-play" },
	{ command: "!entrivia-askrandom", description: "Asks a random entrivia question.", usage: "!entrivia-askrandom" },
	{ command: "!entrivia-ask", description: "Asks a entrivia question from a specific round and category.", usage: "!entrivia-ask [round] | [category]" },
	{ command: "!entrivia-lastaskwinner", description: "Displays the last entrivia question's winner.", usage: "!entrivia-lastaskwinner" },
	{ command: "!entrivia-lastwinners", description: "Displays the list of last entrivia winners.", usage: "!entrivia-lastwinners" },
	{ command: "!entrivia-history", description: "Displays entrivia history.", usage: "!entrivia-history" },
	{ command: "!entrivia-chatanswers", description: "Toggles the chat answers on/off.", usage: "!entrivia-chatanswers" },
	{ command: "!entrivia-consolemessages", description: "Toggles the chat answers on/off.", usage: "!entrivia-consolemessages" },
	{ command: "!entrivia-disablechat", description: "Disables entrivia chat overlay.", usage: "!entrivia-disablechat" },
	{ command: "!entrivia-audio", description: "Toggles entrivia audio settings.", usage: "!entrivia-audio" },
	{ command: "!toggleentriviaboard", description: "Toggles the entrivia board visibility.", usage: "!toggleentriviaboard" },
	{ command: "!togglequestions", description: "Toggles the visibility of the question wrapper.", usage: "!togglequestions" },
	{ command: "!toggleentrivia", description: "Toggles the visibility of the entrivia wrapper.", usage: "!toggleentrivia" },
	{ command: "!togglechat", description: "Toggles the visibility of the Twitch chat container.", usage: "!togglechat" },
	{ command: "!entrivia-addquestion", description: "Allows the streamer to add a custom entrivia question.", usage: "!entrivia-addquestion easy/hard | economy | what does ped stand for | project entropia dollar" },
	{ command: "!entrivia-answertime", description: "Updates the answer time limit.", usage: "!entrivia-answertime [time]" },
	{ command: "!entrivia-questiondelay", description: "Updates the question delay between questions.", usage: "!entrivia-questiondelay [delay]" },
	{ command: "!entrivia-rounddelay", description: "Updates the delay between rounds.", usage: "!entrivia-rounddelay [delay]" },
	{ command: "!entrivia-questioncap", description: "Sets a cap for the number of questions per round.", usage: "!entrivia-questioncap [cap]" },
	{ command: "!entrivia-defaultquestions", description: "Toggles default entrivia questions.", usage: "!entrivia-defaultquestions" },
	{ command: "!entrivia-customquestions", description: "Toggles custom entrivia questions.", usage: "!entrivia-customquestions" }
];

// Function to update the command list in the UI
function updateCommandlist() { 
	// Get the respective <ul> elements
	const userCommandList = document.getElementById("usercommandList");
	const broadcasterCommandList = document.getElementById("broadcastercommandList");

	// Add user commands to the user command list
	usercommands.forEach(function(command) {
		const li = document.createElement("li");

		// Create the usage span
		const usageSpan = document.createElement("span");
		usageSpan.classList.add("command-info");
		usageSpan.setAttribute("title", command.usage);
		usageSpan.textContent = "❓";

		// Set command and description
		li.innerHTML = "<strong>" + command.command + "</strong>: " + command.description;

		// Append the usage span to the li
		li.appendChild(usageSpan);

		// Append to the user command list
		userCommandList.appendChild(li);
	});

	// Add broadcaster commands to the broadcaster command list
	streamercommands.forEach(function(command) {
		const li = document.createElement("li");

		// Create the usage span
		const usageSpan = document.createElement("span");
		const usageText = "Usage: " + command.usage;
		usageSpan.classList.add("command-info");
		usageSpan.setAttribute("title", usageText);
		usageSpan.textContent = "❓";

		// Set command and description
		li.innerHTML = "<strong>" + command.command + "</strong>: " + command.description;

		// Append the usage span to the li
		li.appendChild(usageSpan);

		// Append to the broadcaster command list
		broadcasterCommandList.appendChild(li);
	});
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
            commandInfoSpan.setAttribute('title', command.usage);
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


//------------------------
//---Audio logic----|
//-----------------------
// Preload sounds and store them in an object
        // Play the sound
//       playSound("entriviatimesup");

 // Change to "off" to mute all sounds
//-------------------------------------
const sounds = {
    snakedie: new Audio("/assets/sounds/snakedie_sound1.mp3"),
    //gameshowintro: new Audio("/assets/sounds/gameshow_intro.mp3"),
    // Add more sounds here
};
const entriviasounds = {
    openingtheme: new Audio("/assets/sounds/entrivia/openingtheme-entriviauniverse.mp3"),
    openingtheme2: new Audio("/assets/sounds/entrivia/openingtheme2-entriviauniverse.mp3"),
	openingtheme0: new Audio("/assets/sounds/entrivia/openingtheme1-entriviauniverse.mp3"),
	openingtheme1: new Audio("/assets/sounds/entrivia/short-logo.mp3"),
	entriviafirstcorrect: new Audio("/assets/sounds/entrivia/entrivia-firstcorrect.mp3"),
	entriviacorrect: new Audio("/assets/sounds/entrivia/entrivia-correct.mp3"),
	entriviawrong: new Audio("/assets/sounds/entrivia/entrivia-wrong.mp3"),
	entriviaroundover: new Audio("/assets/sounds/entrivia/entrivia-roundover.mp3"),
	entriviatimesup: new Audio("/assets/sounds/entrivia/entrivia-timesup1.mp3"),	
	winsequence1: new Audio("/assets/sounds/entrivia/winsequence-1.mp3"),
	winsequence2: new Audio("/assets/sounds/entrivia/winsequence-2.mp3"),
	winsequence3: new Audio("/assets/sounds/entrivia/winsequence-3.mp3"),
    // Add more sounds here
};
const entriviaQuestionsounds = {
	entriviabloop1: new Audio("/assets/sounds/entrivia/entrivia-bloop1.mp3"),
	entriviabloop2: new Audio("/assets/sounds/entrivia/entrivia-bloop2.mp3"),
}
const entriviaWinsounds = {
	winsequence1: new Audio("/assets/sounds/entrivia/winsequence-1.mp3"),
	winsequence2: new Audio("/assets/sounds/entrivia/winsequence-2.mp3"),
	winsequence3: new Audio("/assets/sounds/entrivia/winsequence-3.mp3"),
	closingtheme: new Audio("/assets/sounds/entrivia/closingtheme-entriviauniverse.mp3"),
    // Add more sounds here
};
//-------------------------------------
function playSound(name) {
    if (audioSetting === "off") return; // Stop if audio is disabled

    if (entriviasounds[name]) {
        entriviasounds[name].muted = false; // Unmute the sound
        entriviasounds[name].currentTime = 0; // Reset sound to start
        entriviasounds[name].play().catch(error => {
            console.error(`Error playing ${name}:`, error);
        });
    } else {
        console.error(`Sound '${name}' not found.`);
    }
}
function playQuestionSound(name) {
    if (audioSetting === "off") return; // Stop if audio is disabled

    if (entriviaQuestionsounds[name]) {
        entriviaQuestionsounds[name].muted = false; // Unmute the sound
        entriviaQuestionsounds[name].currentTime = 0; // Reset sound to start
        entriviaQuestionsounds[name].play().catch(error => {
            console.error(`Error playing ${name}:`, error);
        });
    } else {
        console.error(`Sound '${name}' not found.`);
    }
}
function playentriviaWinSound(name) {
    if (audioSetting === "off") return; // Stop if audio is disabled

    if (entriviaWinsounds[name]) {
        entriviaWinsounds[name].muted = false; // Unmute the sound
        entriviaWinsounds[name].currentTime = 0; // Reset sound to start
        entriviaWinsounds[name].play().catch(error => {
            console.error(`Error playing ${name}:`, error);
        });
    } else {
        console.error(`Sound '${name}' not found.`);
    }
}
// Function to get a random key from entriviaWinsounds
function getRandomQuestionSound() {
    const keys = Object.keys(entriviaQuestionsounds);
    return keys[Math.floor(Math.random() * keys.length)];
}
// Function to get a random key from entriviaWinsounds
function getRandomWinSound() {
    const keys = Object.keys(entriviaWinsounds);
    return keys[Math.floor(Math.random() * keys.length)];
}
// Functions for random sounds
function playRandomQuestionSound() {
    if (audioSetting === "off") return; // Stop if audio is disabled

    const randomSound = getRandomQuestionSound();
    playQuestionSound(randomSound);
}
function playRandomWinSound() {
    if (audioSetting === "off") return; // Stop if audio is disabled

    const randomSound = getRandomWinSound();
    playentriviaWinSound(randomSound);
}
function playRandomQuestionSound() {
    const randomSound = getRandomQuestionSound();
    playQuestionSound(randomSound);
}
//---------------------------------------------------
// Functions to toggle options
function toggleAudioSetting() {
    audioSetting = audioSetting === "on" ? "off" : "on";
    console.log(`Audio setting is now: ${audioSetting}`);
	displayConsoleMessage("system", `Audio setting is now: ${audioSetting}`);
	updateSingleSetting("audioSetting", audioSetting);
	updateIndicatorLights();
}
//---------------------------------------------------

//______________________________________________
// Attach event listeners
//enentrivia-toggle button
document.getElementById("entrivia-toggle").addEventListener("click", function () {
	let container = document.getElementById("entriviacontrolBox");
	container.classList.toggle("active");
});
// start game button
document.getElementById("startGame").addEventListener("click", function() {
    if (entriviaGameState === null) {
		startentrivia(); // Only start entrivia if it's not running 
    }
});
// CanceL/terminate and reset game
document.getElementById("cancelGame").addEventListener("click", function() {
    if (entriviaGameState === "started") {
        endentrivia(); // Only end entrivia if it's running
    }
});
document.getElementById('submitQuestionBtn').addEventListener('click', function() {
    // Get the values from the form inputs
    const round = document.getElementById('round').value;
    const category = document.getElementById('entriviacategory').value; // Get category
    const questionText = document.getElementById('questionText').value;
    const correctAnswer = document.getElementById('correctAnswer').value;

    // Validate inputs
    if (!questionText || !correctAnswer) {
        displayentriviaMessage("error!", "Please fill in both the question and the answer.", {}, {});
        return;
    }

//change and reset settings buttons
document.getElementById("changeSettings").addEventListener("click", updateSettings);
document.getElementById("resetSettings").addEventListener("click", resetSettings);
//toggle inclusion of either default or custom questions
document.getElementById("toggleusedefaultquestions").addEventListener("click", toggleusedefaultquestions);
document.getElementById("toggleusecustomquestions").addEventListener("click", toggleusecustomquestions);
// Add event listener to the button to add custom questions

    // Call the function to add the question
    addCustomentriviaQuestion(round, questionText, correctAnswer, category);

    // Clear the form fields
    document.getElementById('questionText').value = '';
    document.getElementById('correctAnswer').value = '';
});

//
document.getElementById('toggleconsolemessages').addEventListener('click', toggleentriviaconsolemessages);
document.getElementById('toggleentriviachatOverlay').addEventListener('click', toggleentriviachatOverlay);
document.getElementById('togglechatanswers').addEventListener('click', togglechatanswers);
document.getElementById('toggleusedefaultquestions').addEventListener('click', toggleusedefaultquestions);
document.getElementById('toggleusecustomquestions').addEventListener('click', toggleusecustomquestions);

// Event listener for delete button
document.getElementById('deleteQuestionBtn').addEventListener('click', deleteCustomQuestion);

// Event listener for dropdown change to update the answer display
document.getElementById('questionList').addEventListener('change', updateAnswerDisplay);
// Auto-reconnect on page load
