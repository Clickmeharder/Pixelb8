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
let hideButtonBubble = "on";
let twitchChatOverlay = "on";
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

//Example add Question Command
//!entrivia-addcustomquestion round1 | What number is on the side of a Sleipnir mk1 (C,L)? | 88
//----------------------------
function fetchentriviaQuestions() {
    return new Promise((resolve, reject) => {
        const questionsUrl = '/assets/data/eu-data/questions2.csv';
        let defaultQuestions = { round1: {}, round2: {} };
        let customQuestions = JSON.parse(localStorage.getItem("customentriviaQuestions")) || { round1: {}, round2: {} };

        let fetchDefaultQuestions = usedefaultquestions
            ? fetch(questionsUrl)
                .then(response => response.ok ? response.text() : Promise.reject('Failed to load'))
                .then(csvData => {
                    const rows = csvData.trim().split("\n");
                    const headers = rows[0].split(",");

                    let parsedData = [];

                    rows.slice(1).forEach(row => {
                        const columns = row.split(",");
                        let questionObj = {};
                        headers.forEach((header, index) => {
                            questionObj[header.trim()] = columns[index] ? columns[index].trim() : "";
                        });
                        parsedData.push(questionObj);
                    });

                    parsedData.forEach(row => {
                        let round = row.round.toLowerCase();
                        let category = row.category.toLowerCase();
                        let question = row.question.replace(/\"/g, "").trim();
                        let answersRaw = (row.answers || row.answer || "").replace(/\"/g, "").trim();
                        let answers = answersRaw.split(/[;,]/).map(a => a.trim()).filter(Boolean);
                        let type = (row.type || "text").toLowerCase();
                        let options = row.options
                            ? row.options.replace(/\"/g, "").split(/[;,]/).map(opt => opt.trim()).filter(Boolean)
                            : [];

                        if (!defaultQuestions[round]) defaultQuestions[round] = {};
                        if (!defaultQuestions[round][category]) defaultQuestions[round][category] = [];

                        defaultQuestions[round][category].push({
                            question: question,
                            answers: answers,
                            type: type,
                            options: options,
                        });
                    });
                })
                .catch(error => console.error('Error fetching or parsing questions CSV:', error))
            : Promise.resolve();

        fetchDefaultQuestions.then(() => {
            let finalQuestions = { round1: {}, round2: {} };

            function mergeQuestions(target, source) {
                for (const category in source) {
                    let normalizedCategory = category.toLowerCase();

                    if (!target[normalizedCategory]) target[normalizedCategory] = [];

                    source[category].forEach(q => {
                        // 🔥 Normalize answers properly
                        if (Array.isArray(q.answers) && q.answers.length > 0) {
                            // Already good
                        } else if (typeof q.answer === "string") {
                            // Handle custom questions where 'answer' is used
                            q.answers = q.answer.split(/[;,]/).map(a => a.trim()).filter(Boolean);
                        } else if (Array.isArray(q.answer)) {
                            q.answers = q.answer.map(a => a.trim()).filter(Boolean);
                        } else if (typeof q.answers === "string") {
                            q.answers = q.answers.split(/[;,]/).map(a => a.trim()).filter(Boolean);
                        } else {
                            q.answers = [];
                        }

                        delete q.answer; // Clean up after normalization

                        target[normalizedCategory].push(q);
                    });
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


function addCustomentriviaQuestion(round, questionText, correctAnswer, category, type = 'singlechoice', options = []) {
    let customQuestions = JSON.parse(localStorage.getItem("customentriviaQuestions")) || { round1: {}, round2: {} };

    if (round !== "round1" && round !== "round2") {
        console.error("Invalid round. Use 'round1' or 'round2'.");
        return;
    }

    // Ensure category exists in the selected round
    if (!customQuestions[round][category]) {
        customQuestions[round][category] = [];
    }

    // Ensure the correctAnswer is always an array (even if a single answer is input)
    let formattedAnswer = Array.isArray(correctAnswer) ? correctAnswer : correctAnswer.split(',').map(opt => opt.trim()).filter(opt => opt);

    let newQuestion = {
        question: questionText,
        answer: formattedAnswer,  // Store the correct answer as an array
        category: category,
        type: type,  // 'singlechoice' or 'multiplechoice'
        options: options // optional, mostly for multiple choice
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

function submitQuestions() {
    const round = document.getElementById('round').value;
    const category = document.getElementById('entriviacategory').value;
    const questionText = document.getElementById('questionText').value;
    const correctAnswer = document.getElementById('correctAnswer').value;
    const type = document.getElementById('questionType').value; // New type input

    // Handle multiple choice options if selected
    let options = [];
    if (type === 'multiplechoice') {
        const optionsInput = document.getElementById('answerOptions').value;
        options = optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt); // Clean the options input
    }

    // Ensure the correct answer is always an array, even if it's a single answer
    let formattedCorrectAnswer = correctAnswer.split(',').map(opt => opt.trim()).filter(opt => opt);

    // Check if required fields are filled
    if (!questionText || formattedCorrectAnswer.length === 0) {
        displayConsoleMessage("id-10t err", "Please fill in both the question and at least one correct answer.", {}, {});
        return;
    }

    // Call function to add the custom trivia question
    addCustomentriviaQuestion(round, questionText, formattedCorrectAnswer, category, type, options);

    // Clear the form after submission
    document.getElementById('questionText').value = '';
    document.getElementById('correctAnswer').value = '';
    document.getElementById('answerOptions').value = ''; // Clear the options input
    // Optionally, hide the multiple choice options input after submission
    document.getElementById('multipleChoiceOptions').style.display = 'none';
}


let lastCustomCSV = "";
let lastEntriviaCSV = "";

function sanitizeAndJoin(value) {
    if (Array.isArray(value)) {
        return value.join(";");
    } else if (typeof value === "string") {
        return value.split(/[,;]/).map(s => s.trim()).join(";");
    } else {
        return "";
    }
}

function escapeCSV(value) {
    return `"${String(value).replace(/"/g, '""')}"`;
}

function downloadCustomQuestionsCSV(showOnly = false) {
    const customQuestions = JSON.parse(localStorage.getItem("customentriviaQuestions")) || { round1: {}, round2: {} };
    const headers = ["round", "category", "type", "question", "answers", "options"];
    let csvContent = headers.join(",") + "\n";

    function convertQuestionsToCSV(round, category, questions) {
        questions.forEach(q => {
            const type = q.type || "";
            const question = escapeCSV(q.question || "");
            const answers = escapeCSV(sanitizeAndJoin(q.answer));
            const options = escapeCSV(sanitizeAndJoin(q.options));
            const questionRow = [round, category, type, question, answers, options];
            csvContent += questionRow.join(",") + "\n";
        });
    }

    for (const round in customQuestions) {
        const roundData = customQuestions[round];
        for (const category in roundData) {
            convertQuestionsToCSV(round, category, roundData[category]);
        }
    }

    lastCustomCSV = csvContent;
    document.getElementById("csvOutputText").value = csvContent;

    if (!showOnly) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "custom_questions.csv";
        link.click();
    }
}

function downloadEntriviaQuestionsCSV(showOnly = false) {
    function convertQuestionsToCSV(round, category, questions, csvArray) {
        questions.forEach(q => {
            const type = q.type || "";
            const question = escapeCSV(q.question || "");
            const answers = escapeCSV(sanitizeAndJoin(q.answers));
            const options = escapeCSV(sanitizeAndJoin(q.options));
            const questionRow = [round, category, type, question, answers, options];
            csvArray.push(questionRow.join(","));
        });
    }

    function generateAndHandleCSV(questionsData) {
        const headers = ["round", "category", "type", "question", "answers", "options"];
        let csvRows = [headers.join(",")];

        ["round1", "round2"].forEach(round => {
            const roundData = questionsData[round];
            if (!roundData) return;

            const sortedCategories = Object.keys(roundData).sort((a, b) =>
                a.toLowerCase().localeCompare(b.toLowerCase())
            );

            sortedCategories.forEach(category => {
                const questions = roundData[category].slice().sort((a, b) => {
                    const typeA = a.type?.toLowerCase() || "";
                    const typeB = b.type?.toLowerCase() || "";
                    return typeA.localeCompare(typeB);
                });

                convertQuestionsToCSV(round, category, questions, csvRows);
            });
        });

        const csvContent = csvRows.join("\n");
        lastEntriviaCSV = csvContent;
        document.getElementById("csvOutputText").value = csvContent;

        if (!showOnly) {
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "all_entrivia_questions.csv";
            link.click();
        }
    }

    if (!entriviaQuestions || Object.keys(entriviaQuestions.round1 || {}).length === 0) {
        fetchentriviaQuestions()
            .then(data => {
                if (!data) return console.error("❌ Failed to load questions.");
                generateAndHandleCSV(data);
            })
            .catch(err => console.error("❌ Error fetching questions:", err));
    } else {
        generateAndHandleCSV(entriviaQuestions);
    }
}
function getCustomQuestionsCSV() {
    const customQuestions = JSON.parse(localStorage.getItem("customentriviaQuestions")) || { round1: {}, round2: {} };
    const headers = ["round", "category", "type", "question", "answers", "options"];
    let csvContent = headers.join(",") + "\n";

    function sanitizeAndJoin(value) {
        if (Array.isArray(value)) {
            return value.join(";");
        } else if (typeof value === "string") {
            return value.split(/[,;]/).map(s => s.trim()).join(";");
        } else {
            return "";
        }
    }

    function escapeCSV(value) {
        return `"${String(value).replace(/"/g, '""')}"`;
    }

    function convertQuestionsToCSV(round, category, questions) {
        questions.forEach(q => {
            const row = [
                round,
                category,
                q.type || "",
                escapeCSV(q.question || ""),
                escapeCSV(sanitizeAndJoin(q.answer)),
                escapeCSV(sanitizeAndJoin(q.options))
            ];
            csvContent += row.join(",") + "\n";
        });
    }

    for (const round in customQuestions) {
        for (const category in customQuestions[round]) {
            convertQuestionsToCSV(round, category, customQuestions[round][category]);
        }
    }

    return csvContent;
}

function getEntriviaQuestionsCSV() {
    const textarea = document.getElementById("csvOutputText");

    function sanitizeAndJoin(value) {
        if (Array.isArray(value)) {
            return value.join(";");
        } else if (typeof value === "string") {
            return value.split(/[,;]/).map(s => s.trim()).join(";");
        } else {
            return "";
        }
    }

    function escapeCSV(value) {
        return `"${String(value).replace(/"/g, '""')}"`;
    }

    function convertQuestionsToCSV(round, category, questions, csvRows) {
        questions.forEach(q => {
            const row = [
                round,
                category,
                q.type || "",
                escapeCSV(q.question || ""),
                escapeCSV(sanitizeAndJoin(q.answers)),
                escapeCSV(sanitizeAndJoin(q.options))
            ];
            csvRows.push(row.join(","));
        });
    }

    function generateAndSetCSV(data) {
        const headers = ["round", "category", "type", "question", "answers", "options"];
        const csvRows = [headers.join(",")];

        for (const round of ["round1", "round2"]) {
            const roundData = data[round];
            if (!roundData) continue;

            const sortedCategories = Object.keys(roundData).sort((a, b) => a.localeCompare(b));
            for (const category of sortedCategories) {
                const questions = roundData[category].slice().sort((a, b) =>
                    (a.type || "").localeCompare(b.type || "")
                );
                convertQuestionsToCSV(round, category, questions, csvRows);
            }
        }

        const csvContent = csvRows.join("\n");
        textarea.value = csvContent;
    }

    // Fetch only if data is missing
    if (!entriviaQuestions || Object.keys(entriviaQuestions.round1 || {}).length === 0) {
        fetchentriviaQuestions()
            .then(data => {
                if (!data) return console.error("❌ Failed to load questions.");
                entriviaQuestions = data;
                generateAndSetCSV(data);
            })
            .catch(err => console.error("❌ Error fetching questions:", err));
    } else {
        generateAndSetCSV(entriviaQuestions);
    }
}

function copyCustomCSVToClipboard() {
    const text = getCustomQuestionsCSV();
    navigator.clipboard.writeText(text).then(() => {
        alert("✅ Custom CSV copied to clipboard!");
    });
}

function copyFullCSVToClipboard() {
    const text = getEntriviaQuestionsCSV();
    navigator.clipboard.writeText(text).then(() => {
        alert("✅ Full Entrivia CSV copied to clipboard!");
    });
}
// Copy to Clipboard Functions
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => console.log("✅ Copied to clipboard!"))
        .catch(err => console.log("❌ Failed to copy: " + err));
}

document.getElementById("showCSVPanelButton").addEventListener("click", () => {
	const panel = document.getElementById("csvPanel");
	const textarea = document.getElementById("csvOutputText");

	if (panel.style.display === "none") {
		textarea.value = getEntriviaQuestionsCSV(); // Default to entrivia
		panel.style.display = "block";
	} else {
		panel.style.display = "none";
	}
});
let showingCustom = false;

document.getElementById("toggleCSVSourceButton").addEventListener("click", () => {
	const textarea = document.getElementById("csvOutputText");
	const button = document.getElementById("toggleCSVSourceButton");

	if (showingCustom) {
		getEntriviaQuestionsCSV(); // Don't assign return value
		button.textContent = "🧩 Show Your Questions";
	} else {
		textarea.value = getCustomQuestionsCSV(); // This one does return
		button.textContent = "📚 Show All Questions";
	}

	showingCustom = !showingCustom;
});
document.getElementById("downloadCSVButton").addEventListener("click", () => downloadCustomQuestionsCSV());
document.getElementById("downloadFullCSVButton").addEventListener("click", () => downloadEntriviaQuestionsCSV());
document.getElementById("copyQtoclip").addEventListener("click", function() {
    const text = document.getElementById("csvOutputText").textContent; // or .value if it's an input/textarea
    copyToClipboard(text);
});
document.getElementById("copyCustomCSVButton").addEventListener("click", copyCustomCSVToClipboard);
document.getElementById("copyFullCSVButton").addEventListener("click", copyFullCSVToClipboard);
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

        // Start constructing the answer display
        let answerHtml = `
            <strong>Question:</strong> ${question.question} <br>
            <strong>Answer:</strong> ${Array.isArray(question.answer) ? question.answer.join(', ') : question.answer} <br>
            <strong>Type:</strong> ${question.type} <br>
        `;

        // Only show options if the question type is 'multiplechoice'
        if (question.type === 'multiplechoice') {
            answerHtml += `<strong>Options:</strong> ${question.options.join(', ')} <br>`;
        }

        // Insert the answer HTML into the display
        answerDisplay.innerHTML = answerHtml;

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
        // Create the modal element
        const modal = document.createElement('div');
        modal.id = 'confirmationModal';
        modal.className = 'confirmation-modal';
        modal.style.display = 'flex';

        // Create the modal content
        const modalContent = document.createElement('div');
        modalContent.className = 'confirmation-modal-content';

        // Create the confirmation message
        const confirmationMessage = document.createElement('p');
        confirmationMessage.id = 'confirmationMessage';
        confirmationMessage.textContent = `Are you sure you want to delete the question: "${customQuestions[round][category][index].question}"?`;
        modalContent.appendChild(confirmationMessage);

        // Create the confirm button
        const confirmButton = document.createElement('button');
        confirmButton.id = 'confirmDeleteButton';
        confirmButton.textContent = 'Confirm';
        confirmButton.classList.add('a', 'smol');  // Add the classes .a and .smol
        modalContent.appendChild(confirmButton);

        // Create the cancel button
        const cancelButton = document.createElement('button');
        cancelButton.id = 'cancelDeleteButton';
        cancelButton.textContent = 'Cancel';
        cancelButton.classList.add('a', 'smol');  // Add the classes .a and .smol
        modalContent.appendChild(cancelButton);

        // Append the modal content to the modal
        modal.appendChild(modalContent);

        // Append the modal to the body
        document.body.appendChild(modal);

        // Confirm delete button action
        confirmButton.onclick = function() {
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

            // Remove the modal from the DOM
            document.body.removeChild(modal);
        };

        // Cancel delete button action
        cancelButton.onclick = function() {
            // Remove the modal from the DOM
            document.body.removeChild(modal);
        };
    } else {
        console.log("The selected question doesn't exist.");
    }
}

function clearAllCustomQuestions() {
    localStorage.removeItem("customentriviaQuestions");
    console.log("✅ All custom entrivia questions have been deleted.");
}

function addChatterSuggestedQuestion(user, round, questionText, correctAnswer, category, type = 'singlechoice', options = []) {
  let suggestedQuestions = JSON.parse(localStorage.getItem("chattersuggestedQuestions")) || {
    round1: { easy: {}, hard: {} },
    round2: { easy: {}, hard: {} }
  };

  // Validate round
  if (!["round1", "round2"].includes(round)) {
    console.error("❌ Invalid round. Use 'round1' or 'round2'.");
    return;
  }

  // Validate difficulty
  const difficulty = 'easy';  // You can change this logic based on your needs
  if (!["easy", "hard"].includes(difficulty)) {
    console.error("❌ Invalid difficulty. Use 'easy' or 'hard'.");
    return;
  }

  // Ensure category exists in the selected round and difficulty
  if (!suggestedQuestions[round][difficulty][category]) {
    suggestedQuestions[round][difficulty][category] = [];
  }

  // Ensure correctAnswer is always an array (even if a single answer is input)
  let formattedAnswer = Array.isArray(correctAnswer) ? correctAnswer : correctAnswer.split(/[,;]\s*/).map(opt => opt.trim()).filter(opt => opt);

  // Create the new suggested question
  let newSuggestedQuestion = {
    submittedBy: user,
    question: questionText,
    answer: formattedAnswer,
    category: category,
    type: type,  // 'singlechoice' or 'multiplechoice'
    options: options,  // options (for multiple choice questions)
    timestamp: new Date().toISOString()  // Save the timestamp for reference
  };

  // Add the question to the appropriate category and round
  suggestedQuestions[round][difficulty][category].push(newSuggestedQuestion);

  // Save to localStorage
  localStorage.setItem("chattersuggestedQuestions", JSON.stringify(suggestedQuestions));

  // Log success and display message
  console.log(`💡 ${user} suggested a [${difficulty}] question in ${round} [${category}]:`, newSuggestedQuestion);
}

function loadSuggestedQuestions() {
  console.log("🔄 Loading suggested questions...");

  const container = document.getElementById("suggestedQuestionsContainer");
  if (!container) {
    console.warn("⚠️ 'suggestedQuestionsContainer' element not found!");
    return;
  }
  container.innerHTML = '';

  const data = JSON.parse(localStorage.getItem("chattersuggestedQuestions")) || {};
  console.log("📦 Loaded data from localStorage:", data);

  for (let round in data) {
    console.log(`📂 Processing round: ${round}`);
    let roundSection = document.createElement("div");
    roundSection.className = "section";
    roundSection.innerHTML = `<h2>${round}</h2>`;

    for (let difficulty in data[round]) {
      console.log(`  🧩 Difficulty: ${difficulty}`);
      let diffSection = document.createElement("div");
      diffSection.className = "section";
      diffSection.innerHTML = `<h3>${difficulty}</h3>`;

      for (let category in data[round][difficulty]) {
        console.log(`    🗂️ Category: ${category}`);
        const questions = data[round][difficulty][category];
        console.log(`      📋 ${questions.length} question(s) found`);

        let catSection = document.createElement("div");
        catSection.className = "category";
        catSection.innerHTML = `<h4>${category}</h4>`;

        questions.forEach((q, index) => {
          console.log(`        🔎 Rendering question #${index + 1}:`, q);

          const card = document.createElement("div");
          card.className = "question-card";

          card.innerHTML = `
            <strong>Q:</strong> ${q.question}<br>
            <div class="answer"><strong>A:</strong> ${q.answer.join(", ")}</div>
            <div class="options"><strong>Type:</strong> ${q.type} ${q.options?.length ? `| <strong>Options:</strong> ${q.options.join(", ")}` : ""}</div>
            <small>Submitted by: ${q.submittedBy} | ${new Date(q.timestamp).toLocaleString()}</small><br><br>
            <button onclick="approveQuestion('${round}', '${difficulty}', '${category}', ${index})">✅ Approve</button>
            <button onclick="denyQuestion('${round}', '${difficulty}', '${category}', ${index})">❌ Deny</button>
          `;

          catSection.appendChild(card);
        });

        diffSection.appendChild(catSection);
      }

      roundSection.appendChild(diffSection);
    }

    container.appendChild(roundSection);
  }

  console.log("✅ Suggested questions rendered.");
}

function loadApprovedQuestions() {
  console.log("🔄 Loading approved questions...");

  const approved = JSON.parse(localStorage.getItem("approvedQuestions")) || {};
  console.log("📦 Loaded approvedQuestions from localStorage:", approved);

  const container = document.getElementById("approvedQuestionsContainer");
  if (!container) {
    console.warn("⚠️ 'approvedQuestionsContainer' element not found!");
    return;
  }

  container.innerHTML = ""; // Clear previous content

  for (const round in approved) {
    console.log(`📂 Round: ${round}`);

    for (const difficulty in approved[round]) {
      console.log(`  🧩 Difficulty: ${difficulty}`);

      for (const category in approved[round][difficulty]) {
        console.log(`    🗂️ Category: ${category}`);

        const questions = approved[round][difficulty][category];
        console.log(`      📋 ${questions.length} approved question(s)`);

        questions.forEach((question, index) => {
          console.log(`        🔎 Rendering approved question #${index + 1}:`, question);

          const questionCard = document.createElement("div");
          questionCard.className = "question-card";

          questionCard.innerHTML = `
            <strong>Round:</strong> ${round}<br>
            <strong>Difficulty:</strong> ${difficulty}<br>
            <strong>Category:</strong> ${category}<br>
            <strong>Submitted By:</strong> ${question.submittedBy}<br>
            <strong>Type:</strong> ${question.type}<br>
            <strong>Question:</strong> ${question.question}<br>
            <strong>Answer:</strong> ${Array.isArray(question.answer) ? question.answer.join(", ") : question.answer}<br>
            ${question.options && question.options.length > 0 ? `<strong>Options:</strong> ${question.options.join(", ")}` : ""}
            <br><button onclick="removeApprovedQuestion('${round}', '${difficulty}', '${category}', ${index})">🗑️ Delete</button>
            <hr>
          `;

          container.appendChild(questionCard);
        });
      }
    }
  }

  console.log("✅ Approved questions rendered.");
}

function approveQuestion(round, difficulty, category, index) {
  console.log(`🔄 Approving question at index ${index} in ${round} / ${difficulty} / ${category}`);

  const suggestions = JSON.parse(localStorage.getItem("chattersuggestedQuestions")) || {};
  const approved = JSON.parse(localStorage.getItem("approvedQuestions")) || {
    round1: { easy: {}, hard: {} },
    round2: { easy: {}, hard: {} }
  };

  const question = suggestions[round][difficulty][category][index];
  if (!question) {
    console.error(`❌ No question found at index ${index} in ${round} / ${difficulty} / ${category}`);
    return;
  }

  console.log("✅ Question found:", question);

  // ✅ Add to approvedQuestions
  if (!approved[round][difficulty][category]) {
    approved[round][difficulty][category] = [];
    console.log(`🗂️ Created new category ${category} in approvedQuestions.`);
  }

  approved[round][difficulty][category].push(question);
  console.log("✅ Question added to approvedQuestions:", question);

  // ❌ Remove from suggestedQuestions
  suggestions[round][difficulty][category].splice(index, 1);
  console.log(`❌ Removed question from suggestedQuestions at index ${index}.`);

  if (suggestions[round][difficulty][category].length === 0) {
    delete suggestions[round][difficulty][category];
    console.log(`❌ Category ${category} empty, removed from suggestedQuestions.`);
  }

  // 💾 Save both to localStorage
  localStorage.setItem("approvedQuestions", JSON.stringify(approved));
  localStorage.setItem("chattersuggestedQuestions", JSON.stringify(suggestions));

  console.log("💾 Saved updated approvedQuestions and suggestedQuestions to localStorage.");

  loadSuggestedQuestions();
  console.log("🔄 Suggested questions reloaded.");
}

	function removeApprovedQuestion(round, difficulty, category, index) {
	  const approved = JSON.parse(localStorage.getItem("approvedQuestions")) || {};

	  if (
		approved[round] &&
		approved[round][difficulty] &&
		approved[round][difficulty][category] &&
		approved[round][difficulty][category][index]
	  ) {
		approved[round][difficulty][category].splice(index, 1);
		if (approved[round][difficulty][category].length === 0) {
		  delete approved[round][difficulty][category];
		}

		localStorage.setItem("approvedQuestions", JSON.stringify(approved));
		loadApprovedQuestions();
		console.log("🗑️ Removed approved question.");
	  }
	}

    function denyQuestion(round, difficulty, category, index) {
      const suggestions = JSON.parse(localStorage.getItem("chattersuggestedQuestions")) || {};
      const question = suggestions[round][difficulty][category][index];

      console.log("❌ Denied:", question);

      suggestions[round][difficulty][category].splice(index, 1);
      if (suggestions[round][difficulty][category].length === 0) {
        delete suggestions[round][difficulty][category];
      }

      localStorage.setItem("chattersuggestedQuestions", JSON.stringify(suggestions));
      loadSuggestedQuestions();
    }
	function clearAllSuggestedQuestions() {
		localStorage.removeItem("chattersuggestedQuestions");
		console.log("✅ All Suggested entrivia questions have been deleted.");
	}
/* 
clearAllCustomQuestions();
clearAllSuggestedQuestions();
 */
// Clear existing questions
// uncomment these two commands to clear all custom questions:
//clearAllCustomQuestions();
// Now add a new entrivia question (example usage):
//addCustomentriviaQuestion("round1", "What is the smallest Skildek support weapon?", "lancehead;skildeck lancehead", "hunting");
//addCustomentriviaQuestion("round1", "True or False.  Is this a multiple choice question?", "True;Yes", "hunting", "True/yes;False/no");
//addChatterSuggestedQuestion("debugUser", "round1", "What is a dumb question that wont get approved?", "this;this one", "misc");
//addChatterSuggestedQuestion("debugUser", "round1", "True or False.  Is this a multiple choice question?", "True;Yes", "hunting", "multiplechoice", "True/yes;False/no");
//_____________________________________
//-------------------------------------
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

let usedQuestionIds = new Set();

function getRandomQuestion() {
    const currentRound =
        (round === 1 || round === "round1") ? "round1" :
        (round === 2 || round === "round2") ? "round2" :
        (round === null || round === undefined) ? "round1" : `round${round}`;

    if (!entriviaQuestions || !entriviaQuestions[currentRound]) {
        console.warn("No such round in questions:", currentRound);
        return null;
    }

    const availableCategories = Object.keys(entriviaQuestions[currentRound]);
    if (availableCategories.length === 0) {
        console.warn("No categories in round:", currentRound);
        return null;
    }

    const randomCategory = availableCategories[Math.floor(Math.random() * availableCategories.length)];
    const allQuestions = entriviaQuestions[currentRound][randomCategory];

    if (!allQuestions || allQuestions.length === 0) {
        console.warn("No questions found in category:", randomCategory);
        return null;
    }

    // Filter out used questions by stringified content or ID
    let availableQuestions = allQuestions.filter(q => !usedQuestionIds.has(q.question));

    if (availableQuestions.length === 0) {
        console.log("✅ All questions used. Resetting used questions.");
        usedQuestionIds.clear();
        availableQuestions = [...allQuestions];
    }

    if (availableQuestions.length === 0) {
        console.warn("⚠️ No available questions after reset.");
        return null;
    }

    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
    usedQuestionIds.add(question.question); // Track by question text (you can use question.id if available)

    return {
        question: question.question,
        answers: question.answers,
        type: question.type,
        options: question.options || [],
        round: currentRound,
        category: randomCategory
    };
}
function getFilteredRandomQuestion(round = null, category = null, type = null, hasReset = false) {
    const validRounds = ["round1", "round2"];
    const selectedRounds = (round === null || round === undefined)
        ? validRounds
        : [((round === 1 || round === "round1") ? "round1" :
           (round === 2 || round === "round2") ? "round2" : `round${round}`)];

    let filteredQuestions = [];

    for (const r of selectedRounds) {
        if (!entriviaQuestions[r]) continue;

        const roundCategories = Object.keys(entriviaQuestions[r]);
        const selectedCategories = (category === null || category === undefined)
            ? roundCategories
            : (roundCategories.includes(category) ? [category] : []);

        for (const cat of selectedCategories) {
            const questions = entriviaQuestions[r][cat];
            if (!questions || questions.length === 0) continue;

            for (const q of questions) {
                if (!usedQuestions.includes(q)) {
                    if (!type || q.type === type) {
                        filteredQuestions.push({
                            ...q,
                            round: r,
                            category: cat
                        });
                    }
                }
            }
        }
    }

    // If none available, reset usedQuestions once and retry
    if (filteredQuestions.length === 0) {
        if (!hasReset) {
            console.log("✅ All matching questions used or none matched. Resetting used questions.");
            usedQuestions = [];
            return getFilteredRandomQuestion(round, category, type, true); // retry once
        } else {
            console.warn("⚠️ No matching questions found even after reset.");
            return null;
        }
    }

    const chosen = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
    usedQuestions.push(chosen);

    return {
        question: chosen.question,
        answers: chosen.answers,
        type: chosen.type,
        options: chosen.options || [],
        round: chosen.round,
        category: chosen.category
    };
}

// usage examples:
// getRandomQuestion();
//getFilteredRandomQuestion(); // any round/category/type
//getFilteredRandomQuestion(1); // any category/type from round1
//getFilteredRandomQuestion(null, "mining"); // any round, only mining questions
//getFilteredRandomQuestion(1, null, "singlechoice"); // from round1, any category, only singlechoice type
//getFilteredRandomQuestion(); // any question, any round, any category
//getFilteredRandomQuestion(1); // any category from round1
//getFilteredRandomQuestion("2"); // any category from round2
//getFilteredRandomQuestion(null, "mining"); // any round, mining category
//getFilteredRandomQuestion("1", "hunting"); // round1, hunting category
//getFilteredRandomQuestion(null, null, "multiplechoice"); // any round/category, multiplechoice type
//getFilteredRandomQuestion(1, null, "singlechoice"); // round1, any category, singlechoice

function nextQuestion() {
    clearTimeout(questionTimer); // Clear previous timer if any
    clearTimeout(hideQuestionTimer); // Assuming hideQuestionTimer exists for hiding the question after time runs out
    answeredUsers.clear();
    firstAnswerUser = null;

    // Fetch a random question based on the round and category
    activeQuestion = getRandomQuestion();
	console.log("🔍 New question loaded:", activeQuestion);
    questionsAsked++;

    // Update the question counter (this function should be defined elsewhere)
    updateQuestionCounter(); 

    // Update the question text
    document.getElementById("question").textContent = activeQuestion.question;

    // Check if the question is multiple choice
    if (activeQuestion.type === "multiplechoice") {
        // Create a list of options for multiple-choice questions
        let optionsHTML = activeQuestion.options.map(option => {
            return `<div class="answeroption">${option}</div>`;
        }).join("");

        // Display the options
        document.getElementById("question").innerHTML += `<div class="answeroptions">${optionsHTML}</div>`;
    } else {
        // For single-choice questions, ensure no options are shown
        document.querySelector(".options")?.remove(); // Remove any previous options if they exist
    }

    // Make the question visible
    document.getElementById("questionWrapper").style.visibility = "visible";
    document.getElementById("timer").textContent = timetoAnswer;
    document.getElementById("timeuntil-nextQ").textContent = "";

    // Play random sound for the question (this function should be defined elsewhere)
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
    // If the question is multiple choice, display all correct answers
	if (activeQuestion.type === "singlechoice") {
		const answers = Array.isArray(activeQuestion.answers) ? activeQuestion.answers : [activeQuestion.answers];
		document.getElementById("question").textContent = "Time's up! Correct answers were: " + answers.join(", ");
	} else {
		document.getElementById("question").textContent = "Time's up! The correct answer was: " + (activeQuestion.answers ?? "???");
	}
    document.getElementById("timer").textContent = "";
    activeQuestion = null;
    // Play the "times up" sound
    playSound("entriviatimesup");
    // Hide the question and show the entrivia board after a delay
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
    console.log("activeQuestion returns as: " + activeQuestion);
	if (activeQuestion) {
		console.log("✅ activeQuestion:", activeQuestion);
	} else {
		console.warn("⚠️ activeQuestion is null or undefined");
		return;
	}
    if (answeredUsers.has(user)) return; // Ignore duplicate correct answers
    let correctAnswers;
    if (Array.isArray(activeQuestion.answers)) {
        correctAnswers = activeQuestion.answers.map(ans => ans.toLowerCase());
    } else {
        correctAnswers = [activeQuestion.answers?.toLowerCase() || ""];
    }
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
            // Check if the first answer is correct before accepting it
            if (correctAnswers.includes(userAnswer)) {
                firstAnswerUser = user;
                answeredUsers.add(user);
                entriviaSingleAskLastWinner = user;  // Store the last winner
                entriviaSingleAskWinners.push(user);  // Add to winners list
                userStats[user].correctAnswers++;  // Increment correct answers for the user

				let questionCounterElement = document.getElementById("question-counter");
				let winnerColor = userColors[entriviaSingleAskLastWinner] || "#FFFFFF"; // Default white if not found
				let answerText = Array.isArray(activeQuestion.answers) 
				  ? activeQuestion.answers.join(", ") // Join answers if it's an array
				  : activeQuestion.answers;
				playSound("entriviafirstcorrect");

                setTimeout(() => {
                    endAsk();  // Call endAsk after the delay
					questionCounterElement.innerHTML = `Winner: <span style="color: ${winnerColor};">${entriviaSingleAskLastWinner}</span>`;
					document.getElementById("question").textContent = ` Answer was: ${answerText}`;
					// Run endAsk() 1 seconds after returning true
					console.log("answered correctly and called endask 3 seconds after answer");
                }, 1000); // 1000 milliseconds = 1 seconds
				return true; // First correct answer counts
            } else {
                // If the answer is incorrect, play the wrong sound but don't mark as correct
                playSound("entriviawrong");
                return false;
            }
        }
        // If someone already answered correctly, ignore further answers
        playSound("entriviawrong"); // Incorrect answer sound, but no tracking
        return false;
    }

    // Normal entrivia logic (multiple correct answers allowed)
    if (correctAnswers.includes(userAnswer)) {
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
	activeQuestion = null;
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
let questionAlreadyEnded = false;
function askSplash() {
    return showAnnouncement("Asking Random Question in:", 10)
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
/* 	entriviaWrapper.style.visibility = "visible";
	entriviaWrapper.style.opacity = "1"; */
    questionWrapper.style.visibility = "visible";
    questionWrapper.style.opacity = "1";
    questionWrapper.style.animation = "fadeIn 0.8s ease-out forwards";
    timer.style.animation = "fadeIn 1s ease-in-out forwards";
    timeUntilNextQ.style.animation = "fadeIn 1s ease-in-out forwards";
}
function endAsk() {
	if (questionAlreadyEnded) return;
    questionAlreadyEnded = true;
    clearInterval(questionTimer);
	console.log("end ask ran");
	let answerText = Array.isArray(activeQuestion.answers) 
	  ? activeQuestion.answers.join(", ") // Join answers if it's an array
	  : activeQuestion.answers;
	// Display the correct answer(s) on the screen
	// If it's not an array, just use the single answer
	// Display the time's up message with the answer
	document.getElementById("question").textContent = `Time's up! Answer was: ${answerText}`;
	document.getElementById("timer").textContent = "";
    // Check if the answer is an array (for multiple answers)

    // Play sound for time up
    playSound("entriviatimesup");
    // Hide the question and show the entrivia board after a timeout
    hideQuestionTimer = setTimeout(() => {
        document.getElementById("questionWrapper").style.visibility = "hidden";
        document.querySelector(".options")?.remove();
    }, 13000); // Delay timeout of 13 seconds to wait before checking
	activeQuestion = null; // Clear the active question
    singleActiveAsk = null; // Reset the game state
}
function AskQuestion(round = null, category = null, type = null) {
	console.log(" ❌❌❌❌AskQuestion❌❌❌❌");
    clearTimeout(questionTimer); // Clear previous timer if any
    clearTimeout(hideQuestionTimer); // Assuming hideQuestionTimer exists for hiding the question after time runs out
    answeredUsers.clear();
    firstAnswerUser = null;

    // Use getFilteredRandomQuestion for all cases
    activeQuestion = getFilteredRandomQuestion(round, category, type);

    if (!activeQuestion) {
        console.error("❌ No question found for the specified round, category, or type.");
        return;
    }

    updateQuestionCounter(); // Update the display
    document.getElementById("question-counter").textContent = `First Correct Answer Wins`;
    document.getElementById("question").textContent = activeQuestion.question;

    // If it's a multiple-choice question, display options
	if (activeQuestion.type === "multiplechoice") {
		// Create a list of options for multiple-choice questions
		let optionsHTML = activeQuestion.options.map(option => {
			return `<div class="answeroption">${option}</div>`;
		}).join("");

		// Display the options
		document.getElementById("question").innerHTML += `<div class="answeroptions">${optionsHTML}</div>`;
	} else {
		document.querySelector(".options")?.remove(); // Cleanup if not multiplechoice
	}

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
function startentriviaAsk(round = null, category = null, type = null) {
    displayConsoleMessage("system", "startentrivia fn called");
    // Prevent starting the game if it's already running
    if (entriviaGameState === "started") {
        displayConsoleMessage("system", "entrivia is already running! Ignoring duplicate command.");
        console.log("entrivia is already running! Ignoring duplicate command.");
        return;
    }
    if (singleActiveAsk === "Active") {
        displayConsoleMessage("system", "entrivia is already Asking a question! Ignoring duplicate command.");
        console.log("entrivia is already running! Ignoring duplicate command.");
        return;
    }
	questionAlreadyEnded = false;
    displayConsoleMessage("system", "entrivia ask continues");
    console.log("entrivia should splash and fetch questions");
    askSplash() // Run splash first
        .then(() => fetchentriviaQuestions()) // Fetch questions after splash
        .then(questions => {
            singleActiveAsk = "Active"; // Mark entrivia as started
            window.entriviaQuestions = questions;
			console.log("parameters given =" + round + category + type);
            displayConsoleMessage("system", `singleActiveAsk = ${singleActiveAsk}`);
            // Use the passed round, category, and type, or choose random if none provided
            AskQuestion(round, category, type);  // Now directly call the new unified AskQuestion
        })
        .catch(error => {
            console.error("Error loading entrivia questions:", error);
            displayConsoleMessage("system", `Error loading entrivia questions: ${error}`);
            singleActiveAsk = null; // Reset state on failure
        });
}
//
// startentriviaAsk("1", "hunting", "multiplechoice");
// startentriviaAsk("1", "mining");
// startentriviaAsk(null, null, "singlechoice");
// startentriviaAsk();
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

function updateBubblewrapVisibility() {
	const bubblewrap = document.getElementById("bubblewrap");

	if (!bubblewrap) return;

	const hide = hideButtonBubble === true || hideButtonBubble === "on";

	bubblewrap.style.opacity = hide ? "0.00" : "1.00";
}
updateBubblewrapVisibility();
//toggles
		// Toggle the state
function toggleButtonBubble() {
	const currentState = String(hideButtonBubble).toLowerCase();
	hideButtonBubble = !hideButtonBubble;
    updateSingleSetting("hideButtonBubble: ", hideButtonBubble);
	updateSettings();
	console.log("toggled hideButtonBubble: ", hideButtonBubble);
	const bubbleWrap = document.getElementById("bubblewrap");
	bubbleWrap.style.opacity = hideButtonBubble ? "0.00" : "1.00";
	updateIndicatorLights();
}
function toggleentriviaconsolemessages() {
    consolemessages = !consolemessages;
    updateSingleSetting("consolemessages: ", consolemessages);
	updateSettings();
	console.log("toggled consolemessages: ", consolemessages);
    updateIndicatorLights();
}
function toggleusedefaultquestions() {
    usedefaultquestions = !usedefaultquestions;
    updateSingleSetting("usedefaultquestions: ", usedefaultquestions);
	updateSettings();
	console.log("toggled usedefaultquestions: ", usedefaultquestions);
    updateIndicatorLights();
}
function toggleusecustomquestions() {
    usecustomquestions = !usecustomquestions;
    updateSingleSetting("usecustomquestions", usecustomquestions);
	updateSettings();
	console.log("toggled customquestions", usecustomquestions);
	displayConsoleMessage("toggled customquestions", usecustomquestions);
    updateIndicatorLights();
}
function toggletwitchChatOverlay() {
	twitchChatOverlay = !twitchChatOverlay;
	updateSingleSetting("twitchChatOverlay: ", twitchChatOverlay);
	updateSettings();
	updateIndicatorLights();
	toggleElement("twitchChat");
	console.log(`entrivia Chat Overlay is now: ${twitchChatOverlay}`);
	displayConsoleMessage("system", `entrivia Chat Overlay is now: ${twitchChatOverlay}`);
}
function togglechatanswers() {
	chatanswers = !chatanswers;
	updateSingleSetting("chatanswers: ", chatanswers);
	updateSettings();
	updateIndicatorLights();
	console.log(` Can chat answer entrivia: ${twitchChatOverlay}`);
	displayConsoleMessage("system", `Can chat answer entrivia: ${twitchChatOverlay}`);
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
function updateentriviaSettingsUI() {
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
//change and reset settings buttons
document.getElementById("changeSettings").addEventListener("click", () => {
	console.log("Change settings button clicked");
	updateSettings();
});

document.getElementById("resetSettings").addEventListener("click", () => {
	console.log("Reset settings button clicked");
	resetSettings();
});
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
//-------------------------------------------------------
// BubbleButts
	if (command.toLowerCase() === "toggle-bubblebutt") {
		if (!isStreamerAndAuthorize(user, command)) return;
		// Optional feedback in console
		toggleButtonBubble();
		const stateMsg = hideButtonBubble ? "Hidden 🍑" : "Visible 🍑";
		displayConsoleMessage(user, `!${command} ✅ ${stateMsg}`);
		console.log(user, `!${command} ✅ ${stateMsg}`);
	}
//--------------------------------------------
	// PixelDisc/SpinWheel Commands	
    if (command.toLowerCase() === "pull-lever") {
        if (!isStreamerAndAuthorize(user, command)) return;
        displayConsoleMessage(user, `!${command} ✅`);
		showWheel();
        pullDiscRotationLever();
    }
    if (command.toLowerCase() === "toggle-wheel") {
        if (!isStreamerAndAuthorize(user, command)) return;
        displayConsoleMessage(user, `!${command} ✅`);
		showWheel();
    }
	// Load a specific wheel by name: !load-wheel WheelName
	// Load a specific wheel by name and spin it: !load-wheel WheelName
	if (command.toLowerCase() === "spin") {
		if (!isStreamerAndAuthorize(user, command)) return;

		const wheelName = message; // first parameter after command

		if (!wheelName) {
			displayConsoleMessage(user, `Please specify a wheel name to load. ❌`);
			return;
		}

		const wheels = getSavedWheels();
		if (wheels[wheelName]) {
			sections = wheels[wheelName].slice(); // Copy wheel data
			updateRemoveDropdown();

			displayConsoleMessage(user, `Wheel "${wheelName}" loaded and spinning ✅`);
			forceShowWheel();
			repaintWheel();
			pullDiscRotationLever();
		} else {
			displayConsoleMessage(user, `Wheel "${wheelName}" not found ❌`);
		}
	}
	if (command.toLowerCase() === "chatterwheel") {
		const action = message.toLowerCase();

		const wrapper = document.getElementById("wheel-wrapper"); // Adjust if your wrapper has a different ID
		const resultDisplay = document.getElementById("result-display"); // If applicable
		const isWheelVisible = wrapper && wrapper.offsetParent !== null && !wrapper.classList.contains("fade-out");

		if (action === "add" || action === "join") {
			// Anyone can add themselves to the wheel
			addUserWheelSection(user);
			sections = chatterWheelsections.slice();
			repaintWheel();
			displayConsoleMessage(user, `User added to chatter wheel.-> ${sections.length} entries ✅`);
			displayentriviaMessage(user, `User added to chatter wheel.-> ${sections.length} entries ✅`, flags, extra, true);
		}
		else if (action === "show") {
			if (!isStreamerAndAuthorize(user, command)) return;
			if (chatterWheelsections.length === 0) {
				displayConsoleMessage(user, `No one is on the Chatter Wheel yet ❌`);
				displayentriviaMessage(user, `No one is on the Chatter Wheel yet ❌`, flags, extra, true);
				console.log(user, `No one is on the Chatter Wheel yet ❌`);
				return;
			}
			sections = chatterWheelsections.slice();
			forceShowWheel();
			repaintWheel();
			displayConsoleMessage(user, `Chatter Wheel is now visible with ${sections.length} entries ✅`);
			displayentriviaMessage(user, `Chatter Wheel is now visible with ${sections.length} entries ✅`, flags, extra, true);
		}
		else if (action === "spin") {
			if (!isStreamerAndAuthorize(user, command)) return;
			if (chatterWheelsections.length === 0) {
				displayConsoleMessage(user, `No chatters to spin ❌`);
				displayentriviaMessage(user, `No chatters to spin ❌`, flags, extra, true);
				return;
			}
			sections = chatterWheelsections.slice();
			forceShowWheel();
			repaintWheel();
			pullDiscRotationLever();
			displayConsoleMessage(user, `🎡 Spinning the Chatter Wheel...`);
			displayentriviaMessage(user, `🎡 Spinning the Chatter Wheel...`, flags, extra, true);
		}
		else if (action === "clear") {
			if (!isStreamerAndAuthorize(user, command)) return;
			chatterWheelsections = [];
			displayConsoleMessage(user, `Chatter Wheel cleared 🧹`);
			displayentriviaMessage(user, `Chatter Wheel cleared 🧹`, flags, extra, true);
		}
		else {
			displayConsoleMessage(user, `Try: !chatterwheel add / show / spin / clear`);
			displayentriviaMessage(user, `Try: !chatterwheel add / show / spin / clear`, flags, extra, true);
		}
	}
//--------------------------------------------
	//pixelspace commands
    if (command.toLowerCase() === "launch") {
        if (!isStreamerAndAuthorize(user, command)) return;
        displayConsoleMessage(user, `!${command} ✅`);
        spawnColonistShip(user);
    }
    if (command.toLowerCase() === "launch-sat") {
        if (!isStreamerAndAuthorize(user, command)) return;
        displayConsoleMessage(user, `!${command} ✅`);
        spawnColonistShip(user);
    }
//--------------------------------------------
//    Entrivia Commands
	if (command === "a" || command === "answer") {
		if (!activeQuestion) {
			console.log("No active question. activeQuestion returns as:" + activeQuestion );
			return;  // Exit early if no active question
		}
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

		// Extract the parameters from the message
		let messageContent = message.trim();
		let parts = messageContent.split("|").map(p => p.trim());

		// Check if no parameters are provided (just !entrivia-ask)
		if (parts.length === 1 && parts[0] === "") {
			// Call the default startentriviaAsk function
			startentriviaAsk();
			return;
		}

		// If there are parameters, validate the format and pass them to the function
		if (parts.length < 1 || parts.length > 3) {
			displayentriviaMessage(user, `⚠️ Invalid format! Use: !entrivia-ask [difficulty] | [category] | [question type]`, flags, extra, true);
			return;
		}

		// Extract difficulty, category, and question type (if provided)
		let difficulty = parts[0].toLowerCase();
		let category = parts[1]?.toLowerCase(); // Category is optional
		let questionType = parts[2]?.toLowerCase(); // Question type is optional

		// Map difficulty to rounds
		let round;
		if (difficulty === "easy") {
			round = "round1";
		} else if (difficulty === "hard") {
			round = "round2";
		} else {
			displayentriviaMessage(user, `⚠️ Invalid difficulty! Use 'easy' or 'hard'.`, flags, extra, true);
			return;
		}

		// Ensure the category is valid (if provided)
		const validCategories = ["hunting", "mining", "crafting", "missions", "history", "beauty", "economy", "social", "misc"];
		if (category && !validCategories.includes(category)) {
			displayentriviaMessage(user, `⚠️ Invalid category! Use one of the following: ${validCategories.join(", ")}`, flags, extra, true);
			return;
		}

		// Ensure the question type is valid (if provided)
		const validQuestionTypes = ["singlechoice", "multiplechoice"];
		if (questionType && !validQuestionTypes.includes(questionType)) {
			displayentriviaMessage(user, `⚠️ Invalid question type! Use 'singlechoice' or 'multiplechoice'.`, flags, extra, true);
			return;
		}

		// Call the startentriviaAsk function with the parameters
		startentriviaAsk(round, category, questionType);
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
	if (command.toLowerCase() === "togglechat") {
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		toggleElement("twitchchatContainer", "fade");
	}
	if (command.toLowerCase() === "entrivia-disablechat") {
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
        displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);
		toggletwitchChatOverlay();
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
//-------------------------------------------------------
	//example cmd to add question:
	//!entrivia-addquestion easy | mining | What is the least valuable possible mining find? | nrf, no resources found
	//!entrivia-addquestion easy | mining | this is a multiplechoice question for testing purposes | myanswer | option 1, option 2, option 3, option 4
	if (command.toLowerCase() === "entrivia-addquestion") {  
		if (!isStreamerAndAuthorize(user, command)) return;
		displayConsoleMessage(user, `!${command} ✅`);
		displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);

		// Extract message text after the command
		let messageContent = message.trim();
		let parts = messageContent.split("|").map(p => p.trim());

		// Validate input format
		if (parts.length < 4) {  // Now expects 4 parts (difficulty, category, question, answer)
			displayConsoleMessage("⚠️ Invalid format!");
			displayentriviaMessage(user, `⚠️ Invalid format! Use: !entrivia-addquestion easy/hard | category | question | answer [options]`, flags, extra, true);
			return;
		}

		let difficulty = parts[0].toLowerCase();
		let category = parts[1].toLowerCase(); // Extract category
		let questionText = parts[2];
		let correctAnswer = parts[3];

		// Check if there's additional option input (for multiple choice)
		let options = [];
		if (parts.length > 4) {
			options = parts[4].split(",").map(option => option.trim());
		}

		// Map easy to round1 and hard to round2
		let round;
		if (difficulty === "easy") {
			round = "round1";
		} else if (difficulty === "hard") {
			round = "round2";
		} else {
			displayConsoleMessage(user, "⚠️ Invalid format!");
			displayentriviaMessage(user, `⚠️ Invalid difficulty! Use 'easy' or 'hard'.`, flags, extra, true);
			return;
		}

		// Ensure the category is valid
		const validCategories = ["mining", "hunting", "crafting", "history", "beauty", "economy", "social", "misc"];

		if (!validCategories.includes(category)) {
			displayConsoleMessage(user, "⚠️ Invalid Category!");
			displayentriviaMessage(user, `⚠️ Invalid category! Use one of the following: ${validCategories.join(", ")}`, flags, extra, true);
			return;
		}

		// Determine the question type based on the number of options (for multiple choice)
		let type = options.length > 0 ? 'multiplechoice' : 'singlechoice';

		// Add the custom entrivia question with the selected category and options
		addCustomentriviaQuestion(round, questionText, correctAnswer, category, type, options);
		// Confirm success
		displayConsoleMessage(user, "✅ success");
		displayentriviaMessage(user, `✅ Custom question added to ${round} (${category})!`, flags, extra, true);
	}

	//!entrivia-suggest easy | mining | What is the most common ore found on Planet Calypso? | lyst;lysterium;lysterium ore
	//!entrivia-suggest hard | hunting | What creature drops the EWE EP-41 Military? | atrox | atrox,ambu,bibo,caudatergus
	if (command.toLowerCase() === "entrivia-suggest") {
		// Format: !entrivia-suggest easy/hard | category | question | answer | [options]
		let parts = message.split("|").map(p => p.trim());

		if (parts.length < 4) {
			displayentriviaMessage(user, `⚠️ Invalid format! Use: !entrivia-suggest easy/hard | category | question | answer [options]`, flags, extra, true);
			return;
		}

		let difficulty = parts[0].toLowerCase();
		let category = parts[1].toLowerCase();
		let questionText = parts[2];
		let correctAnswers = parts[3].split(/[,;]\s*/).map(a => a.trim());

		let options = [];
		if (parts.length > 4) {
			options = parts[4].split(",").map(opt => opt.trim());
		}

		// Map difficulty to round
		let round;
		if (difficulty === "easy") {
			round = "round1";
		} else if (difficulty === "hard") {
			round = "round2";
		} else {
			displayentriviaMessage(user, `⚠️ Invalid difficulty! Use: easy or hard`, flags, extra, true);
			return;
		}

		const validCategories = ["mining", "hunting", "crafting", "history", "beauty", "economy", "social", "misc"];
		if (!validCategories.includes(category)) {
			displayentriviaMessage(user, `⚠️ Invalid category! Use: ${validCategories.join(", ")}`, flags, extra, true);
			return;
		}

		const type = options.length > 0 ? 'multiplechoice' : 'singlechoice';

		// Send the first valid answer (like the other command does)
		addChatterSuggestedQuestion(user, round, questionText, correctAnswers[0], category, type, options);

		displayentriviaMessage(user, `💡 Thanks for the suggestion! It has been saved for review.`, flags, extra, true);
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
	if (command.toLowerCase() === "entrivia-customquestions-clearall") {  
		if (!isStreamerAndAuthorize(user, command)) return;
		clearAllCustomQuestions(); // Uses function to update setting
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
// Mod commands:
    if (flags.mod) {
		if (command === "entriviamod-test") {
			if (!isStreamerAndAuthorize(user, command)) return;
			displayConsoleMessage(user, `!${command} ✅`);
			displayentriviaMessage(user, `!${command} ✅`, flags, extra, true);
			toggleElement("twitchchatContainer", "fade");
		}
	}
//-------------------------------------------------------
//    Commands for all Chatters:
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
];

const streamercommands = [
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

// Function to update the command list in the UI
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
// start game button
document.getElementById("startGame").addEventListener("click", function() {
    if (entriviaGameState === null) {
		toggleElement("entrivia-controller", "fade");
		startentrivia(); // Only start entrivia if it's not running 
    }
});
// CanceL/terminate and reset game
document.getElementById("cancelGame").addEventListener("click", function() {
    if (entriviaGameState === "started") {
        endentrivia(); // Only end entrivia if it's running
    }
});
//submit question event listener (adding custom questions)
document.getElementById('submitQuestionBtn').addEventListener('click', function () {
	submitQuestions();
});
// Show multiple choice options input when the user selects multiplechoice
document.getElementById('questionType').addEventListener('change', function() {
    const optionsInputDiv = document.getElementById('multipleChoiceOptions');
    optionsInputDiv.style.display = this.value === 'multiplechoice' ? 'flex' : 'none';
});

//toggle inclusion of either default or custom questions
document.getElementById("toggleusedefaultquestions").addEventListener("click", toggleusedefaultquestions);
document.getElementById("toggleusecustomquestions").addEventListener("click", toggleusecustomquestions);
//
document.getElementById('toggleconsolemessages').addEventListener('click', toggleentriviaconsolemessages);
document.getElementById('toggletwitchChatOverlay').addEventListener('click', toggletwitchChatOverlay);
document.getElementById('togglechatanswers').addEventListener('click', togglechatanswers);
document.getElementById('toggleusedefaultquestions').addEventListener('click', toggleusedefaultquestions);
document.getElementById('toggleusecustomquestions').addEventListener('click', toggleusecustomquestions);
document.getElementById('togglehideButtonBubble').addEventListener('click', toggleButtonBubble);
// Event listener for delete button
document.getElementById('deleteQuestionBtn').addEventListener('click', deleteCustomQuestion);

// Event listener for dropdown change to update the answer display
document.getElementById('questionList').addEventListener('change', updateAnswerDisplay);
// Auto-reconnect on page load

