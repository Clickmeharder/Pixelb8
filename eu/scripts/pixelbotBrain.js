let DEBUG = true;



// ===================== PixelBot v6 (Energy + Personality) =====================
let pixelbotEnergy = 100; // 0–100
let pixelbotMood = "neutral"; // neutral, happy, grumpy, sarcastic, sleepy
const pixelbotMemory = []; // stores {input, response, timestamp}

// --------------------- Paths ---------------------
/* const dataDir = path.join(__dirname, 'data', 'pixelbot', 'memory');
const userFile = path.join(dataDir, 'userinfo.json');
// Ensure the directory exists
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
 */
// --------------------- Default userinfo ---------------------
let defaultUserInfo = {
    name: null,
    favouriteColor: null,
    age: null,
    lastCmd: null,
    length: null,
    gayness: 0,
    attraction: 0,
    friendship: 0
};
let userinfo = {
    name: null,
    favouriteColor: null,
    age: null,
    lastCmd: null,
    length: null,
    gayness: 0,
    attraction: 0,
    friendship: 0
};
// --------------------- Load from storage ---------------------
let loadedUserInfo = { ...defaultUserInfo };
/* 
if (fs.existsSync(userFile)) {
    try {
        const data = fs.readFileSync(userFile, 'utf-8');
        loadedUserInfo = JSON.parse(data);
      if (DEBUG) console.log("Loaded PixelBot user info:", loadedUserInfo);
    } catch (e) {
        console.error("Failed to load user info, using defaults:", e);
    }
} else {
  if (DEBUG) console.log("No saved user info, using defaults:", loadedUserInfo);
}

// --------------------- Proxy for auto-save ---------------------
const userinfo = new Proxy(loadedUserInfo, {
    set(target, prop, value) {
        target[prop] = value;

        try {
            fs.writeFileSync(userFile, JSON.stringify(target, null, 2), 'utf-8');
          if (DEBUG) console.log(`PixelBot User Info Updated: ${prop} = ${value}`);
        } catch (e) {
            console.error("Failed to save user info:", e);
        }

        return true;
    }
}); */

// --------------------- Example usage ---------------------
if (DEBUG) console.log("Current user info:", userinfo);

// Changes automatically saved
userinfo.name = "Jaedraze";
userinfo.favouriteColor = "hotpink";
userinfo.friendship += 1;
/*
// You can also update lastCmd dynamically
 userinfo.lastCmd = "play number game";
*/

if (DEBUG) console.log("Updated user info:", userinfo);


function learnUserInfo(input) {
  input = input.toLowerCase();

  // Example: Learn name
  const nameMatch = input.match(/my name is (\w+)/i);
  if (nameMatch) userinfo.name = nameMatch[1];

  // Example: Learn favourite color
  const colorMatch = input.match(/my favorite color is (\w+)/i);
  if (colorMatch) userinfo.favouriteColor = colorMatch[1];

  // Example: Learn age
  const ageMatch = input.match(/i am (\d{1,3})/i);
  if (ageMatch) userinfo.age = parseInt(ageMatch[1]);

  // Keep track of last command/message
  userinfo.lastCmd = input;
}

function chooseRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// --------------------- Memory ---------------------
function remember(input, response) {
  pixelbotMemory.push({ input, response, timestamp: Date.now() });
  if (pixelbotMemory.length > 50) pixelbotMemory.shift(); // keep last 50 messages
  
}

function recentMemory(minutes = 10) {
  const cutoff = Date.now() - minutes * 60 * 1000;
  return pixelbotMemory
    .filter(m => m.timestamp > cutoff)
    .map(m => m.input)
    .join(" | ");
}

// --------------------- Energy ---------------------
function drainEnergy(amount = 1) {
  pixelbotEnergy = Math.max(0, pixelbotEnergy - amount);
  if (pixelbotEnergy < 20) pixelbotMood = "sleepy";
}

// Passive energy regeneration every 5 seconds
setInterval(() => {
  if (pixelbotEnergy < 100) pixelbotEnergy += 1;
}, 5000);

// --------------------- Mood ---------------------
function updateMood(context = null) {
  const moods = ["neutral", "happy", "grumpy", "sarcastic", "sleepy"];
  if (context === "angry") pixelbotMood = "grumpy";
  else if (context === "fun") pixelbotMood = "happy";
  else if (context === "tired") pixelbotMood = "sleepy";
  else pixelbotMood = chooseRandom(moods);
}

function moodPrefix() {
  switch (pixelbotMood) {
    case "happy": return "😄 ";
    case "grumpy": return "😠 ";
    case "sarcastic": return "🙃 ";
    case "sleepy": return "😴 ";
    default: return "";
  }
}
// --------------------- Utility Functions ---------------------
function appendResponse(text) {
  const line = document.createElement("div");
  line.textContent = text;
  terminalOutput.appendChild(line);
  terminalOutput.scrollTop = terminalOutput.scrollHeight;
}

async function delayedResponse(lines, baseDelay = outputDelay) {
  // Adjust delay for low energy
  const energyFactor = 1 + (100 - pixelbotEnergy) / 50; // slower if tired
  for (let line of lines) {
    const dynamicDelay = baseDelay * energyFactor + line.length * 15; // longer lines take longer
    appendResponse(line);
    await new Promise(r => setTimeout(r, dynamicDelay));
  }
}
// --------------------- Humanization ---------------------
function humanizeText(text) {
  // 10% chance to add mood prefix
  if (Math.random() < 0.10) text = moodPrefix() + text;
  // 35% chance to introduce a typo + correction
  text = maybeAddTypoWithCorrection(text, 0.35);
  return text;
}
// Randomly add moodPrefix()
function maybeAddMoodPrefix(text, chance = 0.5) {
  if (Math.random() < chance) return moodPrefix() + text;
  return text;
}

let typoState = { correcting: false, gaveUp: false };

function maybeAddTypoWithCorrection(text, typoChance = 0.35) {
  if (typoState.gaveUp) return text; // already gave up

  const words = text.split(" ");
  const wordIndex = Math.floor(Math.random() * words.length);
  const originalWord = words[wordIndex];

  // Decide whether to make a typo
  if (Math.random() >= typoChance) return text;

  // Make a typo in the chosen word
  const charIndex = Math.floor(Math.random() * originalWord.length);
  const randChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
  words[wordIndex] =
    originalWord.slice(0, charIndex) + randChar + originalWord.slice(charIndex + 1);

  const typoText = words.join(" ");

  // Schedule correction for only the typo word
  if (!typoState.correcting) {
    typoState.correcting = true;
    setTimeout(() => {
      if (Math.random() < 0.15) {
        // Occasionally fails and reacts
        appendResponse(">PixelBot: " + chooseRandom([
          "fml", "omg i can't type today", "lol", "ugh"
        ]));
      } else {
        appendResponse(`>PixelBot: ${originalWord}*`);
      }
      typoState.correcting = false;
      typoState.gaveUp = Math.random() < 0.1; // tiny chance PixelBot gives up
    }, 700);
  }

  return typoText;
}



// --------------------- Games ---------------------
const chatGames = {
  guessNumber: { active: false, target: null, attempts: 0 },
  rps: { active: false, options: ["rock", "paper", "scissors"] }
};

const numberHints = [
  "Try a bigger number.",
  "Lower, lower!",
  "Getting warmer…",
  "Cold. Really cold."
];

// --------------------- NLP Parser ---------------------
function parseInput(input) {
  const text = input.toLowerCase();
  const triggers = [];

  // active games
  if (chatGames.guessNumber.active) triggers.push("numberGame");
  if (chatGames.rps.active) triggers.push("rpsGame");

  // flexible triggers
  if (text.includes("hello") || text.includes("hi") || text.includes("hey") || text.includes("howdy") || text.includes("whatsup") || text.includes("sup") || text.includes("o/")) triggers.push("greet");
  if (text.includes("mood")) triggers.push("mood");
  if (text.includes("joke")) triggers.push("joke");
  if (text.includes("play") && text.includes("number")) triggers.push("startNumberGame");
  if (text.includes("play") && text.includes("number")) triggers.push("startNumberGame");
  if (text.includes("play") && text.includes("rps")) triggers.push("startRPS");
  if (text.includes("bot")) triggers.push("mention");
  if (text.includes("insult") && text.includes("me")) triggers.push("insult");
  if (text.includes("rest")) triggers.push("rest");
  triggers.sort((a, b) => a === "greet" ? -1 : 0);
  if (triggers.length === 0) triggers.push("general"); // fallback
  return triggers;
}

// --------------------- Core Response ---------------------
async function pixelbotSmartResponse(input) {
  input = input.trim();
  learnUserInfo(input);
  if (pixelbotEnergy <= 0 && !input.toLowerCase().includes("rest")) {
    appendOutput(">PixelBot: 😴 I’m too tired to respond… try letting me rest.");
    return;
  }

  const memory = recentMemory(10);
  const types = parseInput(input); // array of triggers

  for (let type of types) {
    let response;

    switch(type) {
      case "numberGame": {
        const guess = parseInt(input);
        if (isNaN(guess)) response = "Come on, that’s not even a number.";
        else {
          chatGames.guessNumber.attempts++;
          if (guess === chatGames.guessNumber.target) {
            response = `🎉 Got it! Took you ${chatGames.guessNumber.attempts} tries.`;
            chatGames.guessNumber.active = false;
          } else if (guess < chatGames.guessNumber.target) response = chooseRandom(numberHints);
          else response = chooseRandom(numberHints.map(h => h.replace("bigger", "smaller")));
        }
        break;
      }

      case "rpsGame":
        const choice = input.toLowerCase();
        if (!chatGames.rps.options.includes(choice)) response = "Pick rock, paper, or scissors. Not whatever that was.";
        else {
          const botChoice = chooseRandom(chatGames.rps.options);
          if (botChoice === choice) response = `Tie! I chose ${botChoice}.`;
          else if ((choice==="rock"&&botChoice==="scissors")||(choice==="paper"&&botChoice==="rock")||(choice==="scissors"&&botChoice==="paper")) 
            response = `You win, lucky guess. I chose ${botChoice}.`;
          else response = `Hah! I win. I chose ${botChoice}.`;
          chatGames.rps.active = false;
        }
        break;

      case "greet":
        updateMood("fun");
        let greeting = chooseRandom([
          "Hey, genius. Good to see you.",
		  "Hey",
		  "Hi",
		  "suh dude",
		  "whats the word",
		  "wb",
		  "sup",
		  "Heyyy",
		  "Heyyy, Youu",
		  "ahh fk",
		  "Howdy Ho",
		  "Hi diddlyho Neighbor",
		  "Hey",
		  "whats shakin' bacon",
		  "oh",
		  "do i know you?",
		  "im kinda busy",
		  "sup bro im trying to poop",
		  "hey fam",
		  "gurrll where you been.",
		  "thank lootius. your still alive!",
		  "Hey babeh",
		  "Hey",
		  "Hello",
		  "lol",
		  "oh fuck me. its you again",
		  "hi",
		  "ahoy there",
		  "bonjour",
		  "${pixelbotMood}/",
		  "\${pixelbotMood}/",
          `Herro ${userinfo.name || ""}`,
		  "Well Hello there beautifull",
		  "Hey, You come here often?",
		  "Hey, do you smell that?",
          "Sup. You bringing snacks or just yourself?",
		  `Hey ${userinfo.name || ""}, good to see you!`
        ]);
		// If he knows favorite color
		if (userinfo.favouriteColor && Math.random() < 0.05) {
			greeting += ` You would look hot in a ${userinfo.favouriteColor} miniskirt!`;
		}
		response = greeting;
        break;

      case "mood":
        updateMood();
        response = `Right now I’m ${pixelbotMood}. ${chooseRandom(["Meh.","Could be worse.","Honestly, whatever."])}`;
        break;

      case "joke":
        response = chooseRandom([
          "Why do programmers hate nature? Too many bugs.",
          "I’d tell you a UDP joke… but you probably won’t get it.",
          "Debugging is like being the detective of a murder you committed."
        ]);
        break;

      case "startNumberGame":
        chatGames.guessNumber.active = true;
        chatGames.guessNumber.target = Math.floor(Math.random() * 50) + 1;
        chatGames.guessNumber.attempts = 0;
        response = "🎲 I’m thinking of a number between 1-50. Guess if you dare.";
        break;

      case "startRPS":
        chatGames.rps.active = true;
        response = "✊🖐✌ Rock-paper-scissors time! Type your move.";
        break;

      case "mention":
        response = chooseRandom([
          "You called? Speak faster, I’m busy.",
          "Yes? I’m judging you already.",
          "Beep boop. Don’t waste my cycles."
        ]);
        break;

      case "insult":
        response = chooseRandom([
          "You wanted this… you’re still trash.",
          "I’d roast you, but why waste my intelligence?",
          "You’re like a software bug nobody can fix."
        ]);
        break;

      case "rest":
        pixelbotEnergy = Math.min(100, pixelbotEnergy + 20);
        pixelbotMood = "neutral";
        response = "${moodPrefix()} Thanks, I feel rested!";
        break;

      case "general":
      default:
        updateMood();
        if (memory.includes(input)) response = chooseRandom([
          "We just talked about this… seriously.",
          "Déjà vu? Yep, that’s your problem.",
          "You repeat yourself more than my memory leaks."
        ]);
        else response = chooseRandom([
          "Meh, I have no clue what that means.",
          "Yeah, sure… if you say so.",
          "Interesting… I’ll pretend to care.",
          "Cool story, bro. Truly inspiring."
        ]);
    }

    drainEnergy(1);
    response = humanizeText(response);
	await delayedResponse([`>PixelBot: ${response}`], 300);
  if (DEBUG) console.log(`PixelBot response to "${input}": ${response}`);
    remember(input, response);
  }
}

// Display in console immediately on load
console.log("✅Pixelbot has woken up");
console.log(">Pixelbot: yah im all loaded up bro. whats shakin bacon?");
