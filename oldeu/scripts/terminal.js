let DEBUG = true;
  // -------------------- ELEMENTS --------------------
  const commandInput = document.getElementById('commandInput');
  const executeBtn = document.getElementById('executeCommand');
  const terminalOutput = document.getElementById('terminalOutput');

  // -------------------- CONFIG --------------------

  let initialized = true;
  let allowVoiceCommands = false; // Vosk placeholder
  const outputDelay = 1000; // ms between lines
  const MAX_TERMINAL_LINES = 5000;
  const MAX_LINE_AGE_MS = 6 * 60 * 60 * 1000; // 6 hours
document.addEventListener('DOMContentLoaded', () => {

	// registry for help/list purposes
	const helpCommandRegistry = {
	  initializeterminal: "Initialize the terminal interface",
	  hackterminal: "Simulate a hack sequence and reset terminal",
	  printData: "Print collapsible JSON data",
	  fetchAndPrint: "Fetch data from API and print in terminal",
	  run: "Run a function dynamically via /run"+"\n usage:"+ "/run downloadData DesiredFileName argument"+"\n Examples:"+"\n  /run downloadData teleporters teleporters"+"\n  /run downloadMultiple weapons teleporters amplifiers"+"\n  /run downloadAllZip weapons teleporters amplifiers",
	  help: "Show this help message",
	  list: "List available commands"
	};
  // -------------------- UTILITY --------------------
	function appendOutput(text) {
	  const line = document.createElement("div");
	  line.textContent = text;
	  line.dataset.timestamp = Date.now(); // store timestamp
	  terminalOutput.appendChild(line);

	  // prune lines older than 6 hours
	  const now = Date.now();
	  Array.from(terminalOutput.children).forEach(child => {
		if (now - Number(child.dataset.timestamp) > MAX_LINE_AGE_MS) {
		  terminalOutput.removeChild(child);
		}
	  });

	  // enforce max line cap
	  while (terminalOutput.children.length > MAX_TERMINAL_LINES) {
		terminalOutput.removeChild(terminalOutput.firstChild);
	  }

	  terminalOutput.scrollTop = terminalOutput.scrollHeight;
	}

  async function delayedOutput(lines, delay = outputDelay) {
    for (let line of lines) {
      appendOutput(line);
      await new Promise(r => setTimeout(r, delay));
    }
  }

  function appendCollapsibleJSON(obj, label = "Fetched Data", container = terminalOutput) {
    function createNode(value, keyName = null, isArrayItem = false) {
      if (value === null || typeof value !== "object") return createPrimitiveNode(value, keyName);
      const isArray = Array.isArray(value);
      const details = document.createElement("details");
      details.open = false;
      const summary = document.createElement("summary");
      summary.style.cursor = "pointer";

      if (isArray) {
        const previewItems = value.slice(0, 3).map(v => summarize(v));
        summary.textContent = `${keyName !== null ? keyName + ": " : ""}(${value.length}) [${previewItems.join(", ")}${value.length > 3 ? ", …" : ""}]`;
      } else {
        const keys = Object.keys(value).slice(0, 3);
        const keyVals = keys.map(k => `${k}:${summarizeValue(value[k])}`);
        summary.textContent = `${keyName !== null ? keyName + ": " : ""}{${keyVals.join(", ")}${Object.keys(value).length > 3 ? ", …" : ""}}`;
      }

      details.appendChild(summary);

      const contentWrapper = document.createElement("div");
      contentWrapper.style.marginLeft = "14px";

      if (isArray) {
        value.forEach((v, i) => contentWrapper.appendChild(createNode(v, i, true)));
      } else {
        for (const k in value) {
          if (!Object.hasOwnProperty.call(value, k)) continue;
          contentWrapper.appendChild(createNode(value[k], k));
        }
      }

      details.appendChild(contentWrapper);
      return details;
    }

    function createPrimitiveNode(val, keyName = null) {
      const line = document.createElement("div");
      if (keyName !== null) {
        const keySpan = document.createElement("span");
        keySpan.style.fontWeight = "bold";
        keySpan.style.color = "#d16d9e";
        keySpan.textContent = (typeof keyName === "number" ? keyName : keyName) + ": ";
        line.appendChild(keySpan);
      }
      const valSpan = document.createElement("span");
      if (typeof val === "string") valSpan.style.color = "#a31515";
      else if (typeof val === "number") valSpan.style.color = "#098658";
      else if (typeof val === "boolean") valSpan.style.color = "#0000ff";
      valSpan.textContent = val === null ? "null" : val;
      line.appendChild(valSpan);
      return line;
    }

    function summarizeValue(val) {
      if (val === null) return "null";
      if (typeof val === "object") return Array.isArray(val) ? `[${val.length}]` : "{…}";
      return val;
    }

    function summarize(val) {
      if (val === null) return "null";
      if (typeof val !== "object") return val;
      if (Array.isArray(val)) return `[${val.length}]`;
      const keys = Object.keys(val).slice(0, 3);
      const keyVals = keys.map(k => `${k}:${summarizeValue(val[k])}`);
      return `{${keyVals.join(", ")}${Object.keys(val).length > 3 ? ", …" : ""}}`;
    }

    const wrapper = document.createElement("div");
    const labelLine = document.createElement("div");
    labelLine.textContent = `${label}:`;
    wrapper.appendChild(labelLine);
    wrapper.appendChild(createNode(obj));
    container.appendChild(wrapper);
    container.appendChild(document.createElement("br"));
    container.scrollTop = container.scrollHeight;
  }

  function printData(data, label = "Fetched Data") {
    if (!data) {
    if (DEBUG) console.log(`No data to display for ${label}`);
      appendOutput(`>❌ Pixelbot: There aint No data to display for ${label}`);
      return;
    }
    appendCollapsibleJSON(data, label);
  if (DEBUG) console.log(data);
  }

  function initializeterminal(codename = null) {
    document.getElementById('tabs').style.display = 'block';
    initialized = true;
    if (codename) {
    if (DEBUG) console.log(`> Pixelbot: Terminal Initialized... welcome agent '${codename}'`);
      appendOutput(`> Pixelbot: Terminal Initialized... welcome agent '${codename}'`);
    } else {
    if (DEBUG) console.log(`> Pixelbot: Terminal Initialized... welcome Colonist`);
      appendOutput(`> Pixelbot: Terminal Initialized... welcome Colonist`);
    }
  }

  initializeterminal();

  // -------------------- TERMINAL --------------------
  const { runCommand, commands } = createTerminal(appendOutput, delayedOutput, appendCollapsibleJSON, printData, initializeterminal);

  // Expose to window (optional)
  window.SuSTerminalCommands = commands;

  // -------------------- VOSK PLACEHOLDER --------------------
  if (allowVoiceCommands) {
    const mockVosk = (voiceText) => {
      appendOutput(`🎤 Heard: "${voiceText}"`);
      runCommand(voiceText);
    };
    setInterval(() => {
      // mockVosk("hackterminal");
    }, 10000);
  }
	// override /help and /list to use registry
	commands.help = async () => {
	  appendOutput("Available commands:");
	  for (const [cmd, desc] of Object.entries(helpCommandRegistry)) {
		appendOutput(`/${cmd}: ${desc}`);
	  }
	};

	commands.list = async () => {
	  appendOutput("Command names:");
	  appendOutput(Object.keys(helpCommandRegistry).map(c => '/' + c).join(", "));
	};
  // -------------------- INPUT HANDLERS --------------------
  executeBtn.addEventListener('click', () => {
    const cmd = commandInput.value.trim();
    if (cmd) runCommand(cmd);
    commandInput.value = '';
  });

  commandInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const cmd = commandInput.value.trim();
      if (cmd) runCommand(cmd);
      commandInput.value = '';
    }
  });
  
  

});

// terminal.js
function createTerminal(appendOutput, delayedOutput, appendCollapsibleJSON, printData, initializeterminal) {
  if (typeof appendOutput !== "function") throw new Error("appendOutput must be provided");

  const commands = {
    initializeterminal: async () => {
      const start = performance.now();
      await delayedOutput(["Initializing terminal..."]);
      initializeterminal();
      const end = performance.now();
      appendOutput(`✅ Pixelbot: I got this b*tch Initialized in ${(end - start).toFixed(2)}ms`);
    },
    hackterminal: async () => {
      const start = performance.now();
      const glitchLines = [
        "⚠ Bypassing security protocols...",
        "⚠ Injecting exploit...",
        "⚠ Overriding safeguards...",
        "⚠ Root access granted"
      ];
      await delayedOutput(glitchLines);
      appendOutput(">>> TERMINAL COMPROMISED <<<");
      await new Promise(r => setTimeout(r, 500));
      initializeterminal("Pixelbot: oh shit hey hacker. You got me good. Just you wait bro.");
      const end = performance.now();
      appendOutput(`✅ Pixelbot: I got that sh*t Done in ${(end - start).toFixed(2)}ms`);
    },
    printData: printData,
    appendCollapsibleJSON: appendCollapsibleJSON,
    help: async () => {
      appendOutput("> Pixelbot: These are some of your Available commands: /help, /list, /hackterminal, /initializeterminal, /run");
    },
    list: async () => {
      appendOutput(">Pixelbot: Listing terminal commands:");
	  await new Promise(r => setTimeout(r, outputDelay));
      appendOutput(Object.keys(commands).map(c => '/' + c).join(", "));
    },
    run: async (...args) => {
      const start = performance.now();
      if (!args[0]) {
        appendOutput("❌ Pixelbot: No function specified.");
        return;
      }
      const funcName = args[0];
      const funcArgs = args.slice(1);
      try {
        const parts = funcName.split('.');
        let context = window;
        for (let i = 0; i < parts.length; i++) {
          if (i === parts.length - 1) {
            const fn = context[parts[i]];
            if (typeof fn === "function") {
              appendOutput(`Running ${funcName}...`);
			  await new Promise(r => setTimeout(r, outputDelay));
              await fn(...funcArgs);
              appendOutput(`✅ Pixelbot: ${funcName} executed.`);
            } else {
              appendOutput(`❌ Pixelbot: ${funcName} is not a function bro.`);
            }
          } else {
            context = context[parts[i]];
            if (!context) {
              appendOutput(`❌ Cannot find ${parts.slice(0, i + 1).join('.')}`);
              return;
            }
          }
        }
      } catch (err) {
        appendOutput(`❌ Error running ${funcName}: ${err.message}`);
      }
      const end = performance.now();
      appendOutput(`>⏱ Command finished`);
	  await new Promise(r => setTimeout(r, outputDelay));
	  appendOutput(`>Took ${(end - start).toFixed(2)}ms`);
    },
	fetch: async (endpoint, specific) => {
	  appendOutput(`Fetching data from ${endpoint}...`);
	  await fetchAndPrint(endpoint, specific);
	},
	filter: async (endpoint, key, value) => {
	  appendOutput(`Filtering ${endpoint} where ${key}=${value}...`);
	  await fetchFilterAndPrint(endpoint, key, value);
	}
  };

  async function runCommand(cmd) {
    if (!cmd) return;
	appendOutput(`  > user: ${cmd}`);  
	// **DELAY BEFORE RESPONSE**
    await new Promise(r => setTimeout(r, outputDelay));

	// **Terminal RESPONSE**
    if (!cmd.startsWith("/")) {
      pixelbotSmartResponse(cmd);
      return;
    }
    const [baseCmd, ...args] = cmd.slice(1).trim().split(' ');
    if (commands[baseCmd]) {
	  // **i want to call smartresponce here instead of appendOutput
	  appendOutput(`> Pixelbot: Request Permitted. Running: ${cmd}`);
	  await new Promise(r => setTimeout(r, outputDelay));
      await commands[baseCmd](...args);
    } else {
      appendOutput(`>❌ Pixelbot: Unknown command: /${baseCmd}`);
    }
  }

  return { runCommand, commands };
}

if (DEBUG) console.log('terminal.js ran from scripts folder');