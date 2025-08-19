const { ipcRenderer } = require('electron');
const fs = require('fs');
const path = require('path');
const os = require('os');

let watcher = null;
let logFilePath = null;

// Stats
let stats = {
  damageDealt: 0,
  damageTaken: 0,
  heals: 0,
  loot: 0,
  totalLoots: 0,
  deathCount: 0
  
};
let lastLootTimestamp = null;
      // track other healers {username: {amount, times}}
// Master chat list and filter state
let masterChats = ["System", "Trade", "Local", "Globals", "Rookie"];
let chatState = {};
masterChats.forEach(c => chatState[c] = true);

// Watchlist for highlighting
let watchlist = ["Hall of Fame", "Rare Item", "ATH"];

// Path to save last used log file
const settingsPath = path.join(os.homedir(), 'entropiaTrackerSettings.json');

// Load last used log path if available
if (fs.existsSync(settingsPath)) {
  const saved = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  if (saved.logFilePath && fs.existsSync(saved.logFilePath)) {
    logFilePath = saved.logFilePath;
    startWatching(logFilePath);
  }
}

// ===== Chat Filter UI =====
const chatListDiv = document.getElementById('chatList');
const newChatInput = document.getElementById('newChatName');
const addChatBtn = document.getElementById('addChat');

function renderChatList() {
  chatListDiv.innerHTML = '';
  masterChats.forEach(chat => {
    const id = `chat_${chat.replace(/\s/g,'_')}`;
    const label = document.createElement('label');
    label.style.marginRight = '10px';
    label.innerHTML = `<input type="checkbox" id="${id}" ${chatState[chat] ? 'checked' : ''}> ${chat}`;
    chatListDiv.appendChild(label);

    const checkbox = label.querySelector('input');
    checkbox.addEventListener('change', () => {
      chatState[chat] = checkbox.checked;
      console.log('Chat state updated:', chatState);
    });
  });
}

// Add new chat dynamically
addChatBtn.addEventListener('click', () => {
  const newChat = newChatInput.value.trim();
  if (newChat && !masterChats.includes(newChat)) {
    masterChats.push(newChat);
    chatState[newChat] = true;
    renderChatList();
    newChatInput.value = '';
  }
});

// Initial render
renderChatList();

// ===== Choose Chat Log =====
document.getElementById('chooseLog').addEventListener('click', async () => {
  const result = await ipcRenderer.invoke('choose-log');
  if (!result) return alert('No file selected!');

  logFilePath = result.filePath;
  fs.writeFileSync(settingsPath, JSON.stringify({ logFilePath }));
  startWatching(logFilePath);
});

// ===== Start Watching Log =====
function startWatching(filePath) {
  const output = document.getElementById('output');
  output.innerText = `...Initializing S.u.S Terminal\n`;
  const currentfilepath = document.getElementById('currentfilepath');
  currentfilepath.innerText = `Watching: ${filePath}`;
  if (watcher) watcher.close();

  let filePosition = fs.statSync(filePath).size;

  watcher = fs.watch(filePath, (eventType) => {
    if (eventType === 'change') {
      const statsFile = fs.statSync(filePath);
      if (statsFile.size > filePosition) {
        const stream = fs.createReadStream(filePath, {
          encoding: 'utf8',
          start: filePosition,
          end: statsFile.size,
        });

        stream.on('data', (chunk) => {
          const lines = chunk.split(/\r?\n/);
          for (const line of lines) if (line.trim() !== '') handleLogLine(line);
        });

        filePosition = statsFile.size;
      }
    }
  });
  output.innerText += `\nS.u.S Terminal Initialized \n\n`;
}

// ===== Handle Log Line =====
function handleLogLine(line) {
  const output = document.getElementById('output');

  // Filter using chatState
  if (!masterChats.some(chat => chatState[chat] && line.includes(`[${chat}]`))) return;

  // Watchlist highlighting
  if (watchlist.some(word => line.includes(word))) {
    output.innerText += `[WATCHED] ${line}\n`;
  } else {
    output.innerText += line + '\n';
  }
  output.scrollTop = output.scrollHeight;

  // --- Parse stats ---
  if (line.includes("inflicted")) {
    const dmg = parseFloat((line.match(/inflicted\s+([\d.]+)/) || [0,0])[1]);
    stats.damageDealt += dmg;
    combatStats.totalShots += 1;
  }
  else if (line.includes("took")) {
    const dmg = parseFloat((line.match(/took\s+([\d.]+)/) || [0,0])[1]);
    stats.damageTaken += dmg;
  }


  else if (line.includes("healed")) {
  // Match "You healed X points" or "You healed yourself X points"
    const match = line.match(/healed(?:\s+\w+)?\s+([\d.]+)/i);
    if (match) {
	  const healAmount = parseFloat(match[1]);
	  stats.heals += healAmount;

	// Track number of self heals
	  if (!stats.healTimes) stats.healTimes = 0;
	  stats.healTimes += 1;

	// Update Fap tab heal display
	  const fapPanel = document.querySelector('#fap');
	  if (fapPanel) {
		fapPanel.querySelector('p:nth-of-type(2)').innerHTML = `<strong>Total Heal amount:</strong> ${stats.heals.toFixed(1)}`;
		fapPanel.querySelector('p:nth-of-type(3)').innerHTML = `<strong>Total times healed:</strong> ${stats.healTimes}`;
	  }
	}
  }
  else if (line.includes("Value:") && line.includes("PED")) {
		const loot = extractLoot(line);
		stats.loot += loot; // always add PED value
		// Add to returns
		huntStats.totalReturns += loot;
		// Count loot events
		const tsMatch = line.match(/^(\d{2}:\d{2}:\d{2})/);
		const timestamp = tsMatch ? tsMatch[1] : Date.now(); // fallback to current time

		if (timestamp !== lastLootTimestamp) {
			huntStats.totalLoots += 1;
			stats.totalLoots += 1;          // increment stats too
			lastLootTimestamp = timestamp;
			debugLog("Loot event counted:", loot, "Total loot events:", huntStats.totalLoots, "Timestamp:", timestamp);
		}



		// Track globals / HOFs
		if (line.includes("[Globals]")) huntStats.globals += 1;
		if (line.includes("Hall of Fame")) huntStats.hofs += 1;
  }
  // --- Track deaths ---
  if (line.includes("You were killed by")) {
    stats.deathCount += 1;
  }
  else if (line.includes("experience in your")) {
    // Skill parsing
    const match = line.match(/You have gained\s+([\d.]+)\s+experience in your (.+) skill/i);
    if (match) {
      const [_, xp, skillName] = match;
      skillStats[skillName] = (skillStats[skillName] || 0) + parseFloat(xp);
      skillStats.total += parseFloat(xp);
    }
  }

  // Update all panels
  updateStats();
  updateHuntSummary();
  updateCombatSummary();
  updateSkillGains();
}

// ===== Track structured stats =====
const combatStats = { totalShots: 0, crits: 0, misses: 0, totalDamage: 0 };
const huntStats = { totalLoots: 0, totalReturns: 0, totalCost: 0, globals: 0, hofs: 0 };
const skillStats = { total: 0 }; // plus dynamic skill names

// ===== Update subtab panels =====
function updateStats() {
  const totalsPanel = document.getElementById('totalsPanel');
  if (!totalsPanel) return;

  totalsPanel.innerHTML = `
	<p><strong>Total Loots:</strong> ${stats.totalLoots.toFixed(4)}</p>
    <p><strong>Total Loot:</strong> ${stats.loot.toFixed(4)}</p>
    <p><strong>Total Damage Dealt:</strong> ${stats.damageDealt.toFixed(1)}</p>
    <p><strong>Total Damage Taken:</strong> ${stats.damageTaken.toFixed(1)}</p>
    <p><strong>Total Heals:</strong> ${stats.heals.toFixed(1)}</p>
  `;
}

function updateHuntSummary() {
  const panel = document.getElementById('HuntSummary');
  if (!panel) return;
  panel.innerHTML = `
    <p><strong>Total Loots:</strong> ${huntStats.totalLoots}</p>
    <p><strong>Total Cost:</strong> ${huntStats.totalCost}</p>
    <p><strong>Total Returns:</strong> ${huntStats.totalReturns.toFixed(4)}</p>
    <p><strong>% Return:</strong> ${huntStats.totalCost ? ((huntStats.totalReturns/huntStats.totalCost)*100).toFixed(1) : 0}%</p>
    <p><strong>Globals:</strong> ${huntStats.globals}</p>
    <p><strong>Hofs:</strong> ${huntStats.hofs}</p>
	<p><strong>Total Deaths:</strong> ${stats.deathCount}</p>
  `;
}

function updateCombatSummary() {
  const panel = document.getElementById('combatSummary');
  if (!panel) return;
  panel.innerHTML = `
    <p><strong>Total Shots:</strong> ${combatStats.totalShots}</p>
    <p><strong>Total Damage Dealt:</strong> ${stats.damageDealt.toFixed(1)}</p>
    <p><strong>Critical %:</strong> ${combatStats.crits ? ((combatStats.crits/combatStats.totalShots)*100).toFixed(1) : 0}%</p>
    <p><strong>Miss %:</strong> ${combatStats.misses ? ((combatStats.misses/combatStats.totalShots)*100).toFixed(1) : 0}%</p>
    <p><strong>Actual DPS:</strong> 0</p>
    <p><strong>DPP:</strong> 0</p>
    <p><strong>Total Damage Taken:</strong> ${stats.damageTaken.toFixed(1)}</p>
    <p><strong>Total Heal amount:</strong> ${stats.heals.toFixed(1)}</p>
	<p><strong>Total Deaths:</strong> ${stats.deathCount}</p>
    <p><strong>Placeholder for enhancers:</strong> 0</p>
  `;
}

function updateSkillGains() {
  const panel = document.getElementById('SkillGains');
  if (!panel) return;
  let skillHtml = `<p><strong>Total skill gain:</strong> ${skillStats.total.toFixed(4)}</p>`;
  for (const [skill, xp] of Object.entries(skillStats)) {
    if (skill !== "total") skillHtml += `<p><strong>${skill}:</strong> ${xp.toFixed(4)}</p>`;
  }
  panel.innerHTML = skillHtml;
}

// Extract damage/heal numbers after specific keywords
function extractNumber(line) {
  let match;

  if (line.includes("inflicted")) {
    match = line.match(/inflicted\s+([\d.]+)\s+points/);
  } else if (line.includes("took")) {
    match = line.match(/took\s+([\d.]+)\s+points/);
  } else if (line.includes("healed")) {
    match = line.match(/healed\s+([\d.]+)/);
  }

  return match ? parseFloat(match[1]) : 0;
}

function extractLoot(line) {
  const match = line.match(/([\d,.]+)\s*PED/);
  return match ? parseFloat(match[1].replace(/,/g,'')) : 0;
}


// ===== Username setting logic =====
const usernameInput = document.getElementById('entropiaUsername');
const usernameDatalist = document.getElementById('usernameOptions');
const saveUsernameBtn = document.getElementById('saveUsername');
const removeUsernameBtn = document.getElementById('removeUsername');

const usernamesPath = path.join(os.homedir(), 'entropiaUsernames.json');

// Load saved usernames
let savedUsernames = [];
let lastUsedUsername = '';

if (fs.existsSync(usernamesPath)) {
  const savedData = JSON.parse(fs.readFileSync(usernamesPath, 'utf8'));
  savedUsernames = savedData.usernames || [];
  lastUsedUsername = savedData.lastUsed || '';
}

// Render options in datalist
function renderUsernameOptions() {
  usernameDatalist.innerHTML = '';
  savedUsernames.forEach(name => {
    const option = document.createElement('option');
    option.value = name;
    usernameDatalist.appendChild(option);
  });

  // Autofill last used
  if (lastUsedUsername) {
    usernameInput.value = lastUsedUsername;
  }
}

// Save a new username
saveUsernameBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("Enter a username!");
  if (!savedUsernames.includes(name)) {
    savedUsernames.push(name);
  }
  lastUsedUsername = name;
  fs.writeFileSync(usernamesPath, JSON.stringify({ usernames: savedUsernames, lastUsed: lastUsedUsername }, null, 2));
  renderUsernameOptions();
});

// Remove username
removeUsernameBtn.addEventListener('click', () => {
  const name = usernameInput.value.trim();
  if (!name) return alert("Enter a username to remove!");
  savedUsernames = savedUsernames.filter(u => u !== name);

  if (lastUsedUsername === name) lastUsedUsername = '';
  
  fs.writeFileSync(usernamesPath, JSON.stringify({ usernames: savedUsernames, lastUsed: lastUsedUsername }, null, 2));
  renderUsernameOptions();
  usernameInput.value = '';
});

// Initial render
renderUsernameOptions();


// ===== Optional Voice Control (stub) =====
function initVoiceControl() {
  if (!('webkitSpeechRecognition' in window)) {
    console.log("Voice recognition not supported.");
    return;
  }
  const recognition = new webkitSpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim();
    console.log("Voice command detected:", transcript);
  };
  recognition.start();
}

initVoiceControl(); // Uncomment to enable early
