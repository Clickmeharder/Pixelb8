let materialIndex = 0;
let blueprintsVisible = false;



function addMaterial(name = '', qty = '', tt = 0, mu = 100) {
  const container = document.getElementById('materials');
  const div = document.createElement('div');
  div.className = 'material';
  div.id = `material_${materialIndex}`;
  div.innerHTML = `
    <strong>${materialIndex + 1}</strong><br>
    <div id="materialInputs">
	  <div class="materialCardInputRow">
		<label for="name_${materialIndex}"> item: <input type="text" value="${name}" placeholder="item name" id="name_${materialIndex}"></label>
		<label for="mu_${materialIndex}">MU%: <input type="number" value="${mu}" id="mu_${materialIndex}" style="width:60px"></label>
	  </div>
	  <div class="materialCardInputRow">
		<label for="qty_${materialIndex}"> Qty:  <input type="number" value="${qty}" placeholder="amount" id="qty_${materialIndex}" style=""></label>
		<label for="tt_${materialIndex}"> TT/Unit:  <input type="number" value="${tt}" id="tt_${materialIndex}" style="width:80px"></label>
	  </div>
    </div>
    <button type="button" class="remove-mat-btn" data-index="${materialIndex}">X</button>
  `;
  container.appendChild(div);
  materialIndex++;
}

function removeMaterial(index) {
  const element = document.getElementById(`material_${index}`);
  if (element) element.remove();
}

function toggleBpMuField() {
  const bpType = document.getElementById('bpType').value;
  document.getElementById('bpMuLabel').style.display = bpType === 'Limited' ? 'inline-block' : 'none';
}

// Core formula abstraction
function getFormula(qr, playerLevel, bpLevel) {
  const baseSuccessAtMax = 0.95;  // max overall success rate (95%)
  const fullSkillNeeded = (bpLevel - 1) * 2.5 + 5; // SIB estimate
  const skillRatio = Math.min(playerLevel / fullSkillNeeded, 1);

  // Calculate overall success rate (success + near success)
  // QR + skill contribute to overall success rate
  const overallSuccessRate = Math.min(baseSuccessAtMax, baseSuccessAtMax * skillRatio + (qr * (baseSuccessAtMax - 0.814)));

  // Baseline fixed values at max success rate (0.95)
  const baselineTotalCraft = 0.88;  // 38% + 50%
  const baselineSuccess = 0.38;
  const baselineNearSuccess = 0.50;

  // Calculate scaling ratio of current total craft vs baseline total craft
  const scaleRatio = overallSuccessRate / baselineTotalCraft;

  // Scale success and near success proportionally
  const baseSuccess = baselineSuccess * scaleRatio;
  const baseNearSuccess = baselineNearSuccess * scaleRatio;

  // Fail rate is the remainder
  const baseFail = 1 - (baseSuccess + baseNearSuccess);

  return {
    baseSuccess,
    baseNearSuccess,
    baseFail
  };
}


function getBaseRates() {
  const qr = parseFloat(document.getElementById('qr').value) || 1.0;
  const playerLevel = parseFloat(document.getElementById('playerLevel').value) || 0;
  const bpLevel = parseFloat(document.getElementById('bpLevel').value) || 1;

  return getFormula(qr, playerLevel, bpLevel);
}

function updateRatesFromSlider() {
  const slider = parseInt(document.getElementById('qvsc').value);
  const qr = parseFloat(document.getElementById('qr').value) || 1.0;
  const bpLevel = parseInt(document.getElementById('bpLevel').value) || 1;
  const playerLevel = parseInt(document.getElementById('playerLevel').value) || 0;

  const baseRates = getFormula(qr, playerLevel, bpLevel);

  const baseSuccessPercent = baseRates.baseSuccess * 100;
  const baseNearSuccessPercent = baseRates.baseNearSuccess * 100;

  const conditionMod = slider / 100;

  // Interpolate towards minimal realistic values when slider is at max
  const adjustedSuccess = baseSuccessPercent - conditionMod * (baseSuccessPercent - 5);
  const adjustedNear = baseNearSuccessPercent - conditionMod * (baseNearSuccessPercent - 10);
  const adjustedFail = 100 - adjustedSuccess - adjustedNear;

  document.getElementById('successRate').value = adjustedSuccess.toFixed(1);
  document.getElementById('nearSuccessRate').value = adjustedNear.toFixed(1);
  document.getElementById('failRate').value = adjustedFail.toFixed(1);

  document.getElementById('visibleSuccess').innerText = `${adjustedSuccess.toFixed(1)}%`;
  document.getElementById('visibleNearSuccess').innerText = `${adjustedNear.toFixed(1)}%`;
  document.getElementById('visibleFail').innerText = `${adjustedFail.toFixed(1)}%`;

  calculate();
}


function calculate() {
  let totalTT = 0;
  let totalMarkup = 0;
  const clicks = parseInt(document.getElementById('clicks').value) || 1;
  const sellMu = parseFloat(document.getElementById('sellMu').value) / 100;
  const successRate = parseFloat(document.getElementById('successRate').value) / 100;
  const nearSuccessRate = parseFloat(document.getElementById('nearSuccessRate').value) / 100;
  const residuePerSuccess = parseFloat(document.getElementById('residuePerSuccess').value);
  const bpType = document.getElementById('bpType').value;
  const bpMu = parseFloat(document.getElementById('bpMu').value) / 100;
  const bpName = document.getElementById('blueprintNameField').value;
  const maxTT = parseFloat(document.getElementById('maxTT').value);
  const qvscSlider = parseInt(document.getElementById('qvsc').value);

  let materialBreakdownHtml = `
    <details class="material-breakdown" open>
      <summary><strong>📦 Material Breakdown</strong> (click to expand)</summary>
      <table class="material-table sortable">
        <thead>
          <tr>
            <th>Name</th>
            <th>Qty</th>
            <th>TT/Unit</th>
            <th>Total TT</th>
            <th>MU %</th>
            <th>Total MU</th>
            <th>Total Cost</th>
          </tr>
        </thead>
        <tbody>
  `;

  for (let i = 0; i < materialIndex; i++) {
    const nameInput = document.getElementById(`name_${i}`);
    if (!nameInput) continue;

    const name = nameInput.value || `Material ${i + 1}`;
    const qty = parseFloat(document.getElementById(`qty_${i}`).value);
    const tt = parseFloat(document.getElementById(`tt_${i}`).value);
    const mu = parseFloat(document.getElementById(`mu_${i}`).value) / 100;

    const totalMatQty = qty * clicks;
    const totalMatTT = totalMatQty * tt;
    const totalMatMU = totalMatTT * (mu - 1);
    const totalMatCost = totalMatTT + totalMatMU;

    totalTT += totalMatTT;
    totalMarkup += totalMatMU;

    const muPercent = mu * 100;
    const costClass =
      muPercent >= 150 ? 'high-cost' :
      muPercent >= 110 ? 'med-cost' :
      'low-cost';

    materialBreakdownHtml += `
      <tr class="${costClass}">
        <td>${name}</td>
        <td>${totalMatQty.toFixed(2)}</td>
        <td>${tt.toFixed(4)}</td>
        <td>${totalMatTT.toFixed(2)}</td>
        <td>${muPercent.toFixed(1)}%</td>
        <td>${totalMatMU.toFixed(2)}</td>
        <td>${totalMatCost.toFixed(2)}</td>
      </tr>
    `;
  }

  materialBreakdownHtml += `
        </tbody>
      </table>
    </details>
  `;

  if (bpType === 'Limited') {
    const bpTTPerClick = 0.01;
    const bpTotalTT = bpTTPerClick * clicks;
    const bpTotalMarkup = bpTotalTT * (bpMu - 1);
    totalTT += bpTotalTT;
    totalMarkup += bpTotalMarkup;
  }

  const totalCost = totalTT + totalMarkup;
  const successfulCrafts = clicks * successRate;
  const nearSuccessClicks = clicks * nearSuccessRate;
  const sellValue = successfulCrafts * maxTT * sellMu;
  const nearSuccessReturn = nearSuccessClicks * (0.55 * totalCost / clicks);
  const residueUsed = successfulCrafts * residuePerSuccess;
  const totalReturn = sellValue + nearSuccessReturn;
  const profit = totalReturn - totalCost;
  const markupPerClick = totalMarkup / clicks;
  const roiPercent = ((totalReturn / totalCost) - 1) * 100;

  const multiplierChancePercent = 0.1 + (qvscSlider / 100) * 1.7;
  const multiplierChance = multiplierChancePercent / 100;
  const expectedMultipliers = clicks * multiplierChance;
  const expectedClicksBeforeHit = multiplierChance > 0 ? (1 / multiplierChance).toFixed(0) : '∞';

  const scaleFactor = 0.5 + (qvscSlider / 100);
  const minPayout = (totalCost / clicks) * 7 * scaleFactor;
  const maxPayout = (totalCost / clicks) * 875 * scaleFactor;
  const totalReturnMin = expectedMultipliers * minPayout;
  const totalReturnMax = expectedMultipliers * maxPayout;

  const avgReturnMin = totalReturn + totalReturnMin;
  const avgReturnMax = totalReturn + totalReturnMax;
  const profitRangeMin = avgReturnMin - totalCost;
  const profitRangeMax = avgReturnMax - totalCost;

  const getReturnColor = (value) => {
    const ratio = value / totalCost;
    if (ratio >= 1.1) return 'profit-strong';
    if (ratio >= 1.01) return 'profit-positive';
    if (ratio >= 0.95) return 'profit-warn';
    return 'profit-negative';
  };

  const multiplierHtml = `
    <br>
    <details class="multiplier-odds-details" closed>
      <summary><strong>🎰 Multiplier Odds</strong> (click to toggle)</summary>
      <em class="multiplier-note">Note: Multipliers are rare and payouts vary widely.</em><br>
      <em class="toolDisclaimer-note">disclaimer: These are very rough estimates.</em><br>
      <em class="toolDisclaimer-note">I'm terrible at math. We hope to improve our estimates</em><br>
      <em class="toolDisclaimer-note">over time. *for entertainment only*</em><br><br>

      <strong>📌 Cost Summary:</strong><br>
      • Cost per Click: ${ (totalTT / clicks).toFixed(2) } (TT) + ${ (totalMarkup / clicks).toFixed(2) } (MU) = ${(totalCost / clicks).toFixed(2)} PED<br>
      • Number of Clicks: ${clicks}<br>
      • Total Cost: ${totalTT.toFixed(2)} (TT) + ${totalMarkup.toFixed(2)} (MU) = ${totalCost.toFixed(2)} PED<br><br>

      <strong>🎲 Multiplier Mechanics:</strong><br>
      • Chance per Click: 📊 ${multiplierChancePercent.toFixed(2)}%<br>
      • Expected Multiplier Hits: 🎯 ${expectedMultipliers.toFixed(4)}<br>
      • Avg Clicks Between Hits: 📈 ~${expectedClicksBeforeHit} clicks<br>
      • Payout per Hit: 💰 ${minPayout.toFixed(2)} – ${maxPayout.toFixed(2)} PED<br><br>

      <strong>💵 Estimated Multiplier Returns:</strong><br>
      • Return from Multipliers: <span class="${getReturnColor(totalReturnMin)}">${totalReturnMin.toFixed(2)}</span> – 
        <span class="${getReturnColor(totalReturnMax)}">${totalReturnMax.toFixed(2)} PED</span><br>
      • Total Cost: ${totalCost.toFixed(2)} PED<br>
      • Profit/Loss from Multipliers: <span class="${getReturnColor(totalReturnMin)}">${(totalReturnMin - totalCost).toFixed(2)}</span> – 
        <span class="${getReturnColor(totalReturnMax)}">${(totalReturnMax - totalCost).toFixed(2)} PED</span><br><br>

      <strong>📈 Avg Return (Base + Multipliers):</strong><br>
      • Return Range: <span class="${getReturnColor(avgReturnMin)}">${avgReturnMin.toFixed(2)}</span> – 
        <span class="${getReturnColor(avgReturnMax)}">${avgReturnMax.toFixed(2)} PED</span><br>
      • Total Cost: ${totalCost.toFixed(2)} PED<br>
      • Total Profit/Loss: <span class="${getReturnColor(profitRangeMin)}">${profitRangeMin.toFixed(2)}</span> – 
        <span class="${getReturnColor(profitRangeMax)}">${profitRangeMax.toFixed(2)} PED</span>
    </details>
  `;

  document.getElementById('results').innerHTML = `
    <h3>📊<em>${bpName}</em></h3>
    <div class="result-grid">
      <div class="result-row"><span class="label">🔖 Blueprint Type:</span> <span>${bpType}</span></div>
      <div class="result-row"><span class="label">💸 Total TT Cost:</span> <span>${totalTT.toFixed(2)} PED</span></div>
      <div class="result-row"><span class="label">📈 Total Markup:</span> <span>${totalMarkup.toFixed(2)} PED</span></div>
      <div class="result-row total"><span class="label">🧾 Total Cost (TT + MU):</span> <span>${totalCost.toFixed(2)} PED</span></div>
    </div>

    ${materialBreakdownHtml}

    <details class="estimation-breakdown" closed>
      <summary><strong>📉 Estimation Breakdown</strong> (click to expand)</summary>
      <div class="result-grid" style="margin-top: 10px">
        <div class="result-row"><span class="label">🎯 Markup per Click:</span> <span>${markupPerClick.toFixed(4)} PED</span></div>
        <div class="result-row"><span class="label">✅ Expected Successful Crafts:</span> <span>${successfulCrafts.toFixed(1)}</span></div>
        <div class="result-row"><span class="label">🤏 Near-Successes:</span> <span>${nearSuccessClicks.toFixed(1)}</span></div>
        <div class="result-row"><span class="label">💰 Return from Success:</span> <span>${sellValue.toFixed(2)} PED</span></div>
        <div class="result-row"><span class="label">💵 Return from Near-Success:</span> <span>${nearSuccessReturn.toFixed(2)} PED</span></div>
        <div class="result-row"><span class="label">💱 Total Return:</span> <span>${totalReturn.toFixed(2)} PED</span></div>
        <div class="result-row"><span class="label">🧪 Residue Needed:</span> <span>${residueUsed.toFixed(2)} PED</span></div>
        <div class="result-row"><span class="label">📊 ROI:</span> <span>${roiPercent.toFixed(2)}%</span></div>
        <div class="result-row profit ${profit >= 0 ? 'profit-positive' : 'profit-negative'}">
          <span class="label">💹 Estimated Profit/Loss:</span>
          <span>${profit.toFixed(2)} PED</span>
        </div>
      </div>
      ${multiplierHtml}
    </details>

    <span class="label">Features coming soon (not finished):</span><br>
    <button id="openHistoryModal">🕮 Crafting History</button>
    <button onclick="startLiveSimulation()" style="display:none;">Default Simulation</button>
    <button onclick="runSimulation('historic')" style="display:none;">Simulate Based on History</button>
  `;
  // 1. Keep the name updated
  window.currentBlueprintName = document.getElementById('blueprintNameField')?.value || "Unknown BP";

  // 2. KEEP the cost calculation (don't remove this!)
  //window.currentCraftingClickCost = calculateCraftingClickCost(); 
  window.currentClickCost = calculateCraftingClickCost();
  // 3. Trigger the HUD update
  // Since scheduleUIUpdate is local to chatsnooper, we use the global window.sendOverlayAll
  if (typeof window.sendOverlayAll === 'function') {
    window.sendOverlayAll();
  }
  
}


// Automatically recalculate when QR is changed
const qrInput = document.getElementById('qr');
if (qrInput) {
  qrInput.addEventListener('input', () => {
    const qvscSlider = document.getElementById('qvsc');
    qvscSlider.value = 0;
    document.getElementById('qvscLabel').innerText = '0%';
    updateRatesFromSlider(); // <-- this is the key addition
  });
}
['playerLevel', 'bpLevel'].forEach(id => {
  const input = document.getElementById(id);
  if (input) {
    input.addEventListener('input', () => {
      updateRatesFromSlider();
    });
  }
});

function saveBlueprint() {
  const blueprint = {
    bpName: document.getElementById('itemName').value,
    maxTT: document.getElementById('maxTT').value,
    bpType: document.getElementById('bpType').value,
    bpMu: document.getElementById('bpMu').value,
    sellMu: document.getElementById('sellMu').value,
    successRate: document.getElementById('successRate').value,
    residuePerSuccess: document.getElementById('residuePerSuccess').value,
    clicks: document.getElementById('clicks').value,
    bpBook: document.getElementById('bpBook').value.trim(),
    materials: []
  };

  for (let i = 0; i < materialIndex; i++) {
    const nameInput = document.getElementById(`name_${i}`);
    if (!nameInput) continue;
    blueprint.materials.push({
      name: nameInput.value,
      qty: document.getElementById(`qty_${i}`).value,
      tt: document.getElementById(`tt_${i}`).value,
      mu: document.getElementById(`mu_${i}`).value
    });
  }

  let saved = JSON.parse(localStorage.getItem('blueprints') || '[]');
  saved.push(blueprint);
  localStorage.setItem('blueprints', JSON.stringify(saved));
  alert("Blueprint saved!");

  if (blueprintsVisible) {
    renderBlueprintList();
  }
}

function deleteBlueprint(index) {
  const confirmed = confirm("Are you sure you want to delete this blueprint?");
  if (!confirmed) return;

  let saved = JSON.parse(localStorage.getItem('blueprints') || '[]');
  saved.splice(index, 1);
  localStorage.setItem('blueprints', JSON.stringify(saved));
  renderBlueprintList(); // refresh the UI
}


function toggleBlueprints() {
  blueprintsVisible = !blueprintsVisible;
  const button = document.getElementById('loadBlueprintsButt');
  const container = document.getElementById('savedList');

  if (blueprintsVisible) {
    container.style.display = 'block';
    renderBlueprintList();
    button.innerText = 'X Collapse';
  } else {
    container.style.display = 'none';
    button.innerText = '📂 Expand';
  }
}

function clearBlueprintFilters() {
  document.getElementById('filterName').value = '';
  document.getElementById('filterBook').value = '';
  document.getElementById('filterMaterial').value = '';
  renderBlueprintList();
}


document.getElementById('resetBlueprintBtn').addEventListener('click', () => {
  // Clear inputs inside .eu-blueprint
  document.querySelectorAll('.eu-blueprint input').forEach(input => {
	if (input.id === 'materialFilter') return; 
    if (input.type === 'number') input.value = '';
    if (input.type === 'text') input.value = '';
  });

  // Reset select dropdowns
  document.querySelectorAll('.eu-blueprint select').forEach(select => {
    select.selectedIndex = 0;
  });

  // Reset hidden inputs to original values (if you want them to reset)
  document.getElementById('successRate').value = 38;
  document.getElementById('nearSuccessRate').value = 50;
  document.getElementById('failRate').value = 12;

  // Reset the slider (optional)
  const qvscSlider = document.getElementById('qvsc');
  qvscSlider.value = 0;
  document.getElementById('qvscLabel').innerText = '0%';
  updateRatesFromSlider();

  // Clear materials
  const materialsContainer = document.getElementById('materials');
  materialsContainer.innerHTML = ''; // wipe it all

  // Reset materialIndex (make sure this is a global or window var)
  if (typeof materialIndex !== 'undefined') {
    materialIndex = 0;
  }
  
  


  // Add two blank material cards
  addMaterial();
  addMaterial();
});



function toggleExpand(id, btn) {
  const content = document.getElementById(id);
  const isExpanded = content.classList.toggle('expanded');
  btn.textContent = `${id} ${isExpanded ? '▲' : '▼'}`;
}

document.addEventListener('DOMContentLoaded', () => {
  toggleBpMuField();
});


const bpDetailsBtn = document.querySelector('button.ExpandableY-button');
if (bpDetailsBtn) {
    bpDetailsBtn.addEventListener('click', function() {
        // Calls your toggle function for the 'bpDetails' div
        // 'this' refers to the button so the arrows can change
        toggleExpand('bpDetails', this);

        if (DEBUG) console.log("[UI] Toggled Blueprint Details");
    });
}
// Reference the buttons
const reminderOkBtn = document.getElementById('reminderOkBtn');
const reminderDisableBtn = document.getElementById('reminderDisableBtn');

// OK Button
if (reminderOkBtn) {
    reminderOkBtn.addEventListener('click', () => {
        closeReminderPopup();
        if (DEBUG) console.log("[UI] Reminder Popup closed via OK");
    });
}
// Reference the Blueprint buttons
const addMattBtn = document.getElementById('addMattButt');
const saveBlueprintBtn = document.getElementById('saveBlueprintButt');



// Save Blueprint Button
if (saveBlueprintBtn) {
    saveBlueprintBtn.addEventListener('click', () => {
        saveBlueprint();
        if (DEBUG) console.log("[Blueprint] Blueprint saved to storage");
    });
}
// Don't show again Button
if (reminderDisableBtn) {
    reminderDisableBtn.addEventListener('click', () => {
        disableReminderPopup();
        if (DEBUG) console.log("[UI] Reminder Popup permanently disabled");
    });
}


// 1. Calculate Estimates Button
const calcBtn = document.getElementById('calcEstimatesButt');
if (calcBtn) {
    calcBtn.addEventListener('click', () => {
        calculate(); // Calls the core calculation engine
        if (DEBUG) console.log("[Action] Calculations triggered");
    });
}

// 2. Materials Toggle (Expand/Collapse)
const toggleMatsBtn = document.getElementById('toggleMaterialsButt');
if (toggleMatsBtn) {
    toggleMatsBtn.addEventListener('click', function() {
        // Must use 'function()' and 'this' for toggleExpand to work!
        toggleExpand('materials', this); 
    });
}

// 3. Dynamic "X" Remove Buttons (Event Delegation)
// Since buttons are added dynamically in addMaterial(), we listen on the parent
// Dynamic "X" Remove Buttons (Event Delegation)
const materialsContainer = document.getElementById('materials');

if (materialsContainer) {
    materialsContainer.addEventListener('click', (e) => {
        // Check if the clicked element has the class we assigned
        if (e.target.classList.contains('remove-mat-btn')) {
            // Get the index from the data-index attribute
            const index = e.target.getAttribute('data-index');
            
            if (index !== null) {
                // Call your existing function with the correct number
                removeMaterial(parseInt(index));
                if (window.DEBUG) console.log(`[Blueprint] Removed material at index: ${index}`);
            }
        }
    });
}

// 4. Your List / Load Blueprints Expand Button
const loadBPBtn = document.getElementById('loadBlueprintsButt');
if (loadBPBtn) {
    loadBPBtn.addEventListener('click', () => {
        toggleBlueprints(); // Toggles the blueprint library view
    });
}


//===========================================
//---------NEW CRAFTING TRACKING STUFF
//------------------------------------------

function calculateCraftingClickCost() {
    let total = 0;
    const includeMU = window.includeMUInCraftingCost !== false;
    
    // 1. Calculate cost of all materials in the list
    const materials = document.querySelectorAll('.material');
    materials.forEach((div) => {
        const id = div.id.replace('material_', '');
        const qty = parseFloat(document.getElementById(`qty_${id}`)?.value) || 0;
        const tt = parseFloat(document.getElementById(`tt_${id}`)?.value) || 0;
        
        if (includeMU) {
            const muInput = document.getElementById(`mu_${id}`)?.value || "100";
            const mu = parseFloat(muInput) / 100;
            total += (qty * tt * mu);
        } else {
            total += (qty * tt);
        }
    });

    // 2. 🟢 Limited BP Fee Check (Strict Type Check)
    // Only adds 0.01 if the Blueprint itself is marked as Limited in the dropdown
    const bpType = document.getElementById('bpType')?.value;
    if (bpType === 'Limited') {
        total += 0.01;
    }

    return total;
}
//===========================================
//___________________________________________




['blueprintNameField', 'maxTT', 'bpType', 'bpMu', 'sellMu', 'clicks', 'residuePerSuccess'].forEach(id => {
  const input = document.getElementById(id);
  if (input) {
    // 'change' or 'input' - 'input' is real-time as they type
    input.addEventListener('input', () => {
      if (id === 'bpType') toggleBpMuField(); // Keep the MU field sync in check
      calculate(); 
    });
  }
});


// Listen for changes on the layout radio group
document.querySelectorAll('input[name="layout"]').forEach(radio => {
    radio.addEventListener('change', () => {
        // This will trigger your existing render function
        renderBlueprintList();
        
        if (window.DEBUG) {
            const selected = document.querySelector('input[name="layout"]:checked').value;
          if (DEBUG) console.log(`[UI] Layout switched to: ${selected}`);
        }
    });
});

/* 
function processImportedCraftingCSV(csvText, costPerClick) {
    const lines = csvText.trim().split('\n');
    const lootHistory = {};
    // Extract data lines, skip header, remove "TOTAL" row, and reverse for chronological order
    const dataLines = lines.slice(1)
        .filter(l => l.includes('\t') && !l.startsWith('TOTAL'))
        .reverse();
    
    let totalReturns = 0;
    let successes = 0;
    let nearSuccesses = 0;
    let fails = 0;
    let timeline = [];
    let runningReturns = 0;

    dataLines.forEach((line, index) => {
        const cols = line.split('\t');
        const bpName = cols[0];
        const result = cols[2];
        const value = parseFloat(cols[3]) || 0;
        
        totalReturns += value;
        runningReturns += value;

        if (result.includes("Success") && !result.includes("Near")) successes++;
        else if (result.includes("Near")) nearSuccesses++;
        else fails++;

        // Parse items from cols 4-7 (Items, Materials, Residues, Blueprints)
        [cols[4], cols[5], cols[6], cols[7]].forEach(detail => {
            if (!detail || detail.trim() === "") return;
            // Regex handles "208x Explosive Projectiles (0.02 PED)" or "1x Nanocube (0.01 PED)"
            const match = detail.match(/(?:([\d]+)x\s)?(.+?)\s\(([\d.]+)\sPED\)/);
            if (match) {
                const qty = parseInt(match[1]) || 1;
                const name = match[2].trim();
                const val = parseFloat(match[3]);

                if (!lootHistory[name]) lootHistory[name] = { quantity: 0, totalValue: 0 };
                lootHistory[name].quantity += qty;
                lootHistory[name].totalValue += val;
            }
        });

        // Push to timeline for graph rendering
        timeline.push({
            timestamp: new Date().toISOString(),
            returnValue: value,
            totalCost: (index + 1) * costPerClick,
            totalReturns: runningReturns,
            returnPct: (index + 1) * costPerClick > 0 ? (runningReturns / ((index + 1) * costPerClick)) * 100 : 0
        });
    });

    const session = {
        huntName: `Imported: ${dataLines[0].split('\t')[0]}`,
        timestampStart: new Date().getTime(),
        timestampEnd: new Date().getTime(),
        totalCost: dataLines.length * costPerClick,
        totalReturns: totalReturns,
        lootHistory: lootHistory,
        timeline: timeline,
        craftingStats: {
            clicks: dataLines.length,
            successes,
            nearSuccesses,
            fails,
            loot: totalReturns,
            totalCost: dataLines.length * costPerClick,
            returnPct: (dataLines.length * costPerClick > 0) ? (totalReturns / (dataLines.length * costPerClick)) * 100 : 0
        },
        isImported: true
    };

    // Save to your backend/local storage via Electron IPC
    window.electronAPI.saveCraftingSession(session).then(res => {
        if (res.success) {
            notify('Session imported and saved to history!', 'success');
            if (typeof showCraftingHistory === 'function') showCraftingHistory();
        }
    });
} */
function processImportedCraftingCSV(csvText, costPerClick) {
    const lines = csvText.trim().split('\n');
    const lootHistory = {};
    const dataLines = lines.slice(1)
        .filter(l => l.includes('\t') && !l.startsWith('TOTAL'))
        .reverse();
    
    let successes = 0, nearSuccesses = 0, fails = 0;
    let timeline = [];
    let runningReturns = 0;
    const startTime = Date.now(); // Use numeric start time

    dataLines.forEach((line, index) => {
        const cols = line.split('\t');
        const bpName = cols[0].trim(); // Trim name
        const result = cols[2];
        const value = parseFloat(cols[3]) || 0;
        
        runningReturns += value;

        if (result.includes("Success") && !result.includes("Near")) successes++;
        else if (result.includes("Near")) nearSuccesses++;
        else fails++;

        // Loot parsing logic (cols 4-7) - Keep your existing regex logic here
        [cols[4], cols[5], cols[6], cols[7]].forEach(detail => {
            if (!detail || detail.trim() === "") return;
            const match = detail.match(/(?:([\d]+)x\s)?(.+?)\s\(([\d.]+)\sPED\)/);
            if (match) {
                const qty = parseInt(match[1]) || 1;
                const name = match[2].trim();
                const val = parseFloat(match[3]);
                if (!lootHistory[name]) lootHistory[name] = { quantity: 0, totalValue: 0 };
                lootHistory[name].quantity += qty;
                lootHistory[name].totalValue += val;
            }
        });

        timeline.push({
            timestamp: startTime + (index * 1000), // Incremental time
            returnValue: value,
            totalCost: (index + 1) * costPerClick,
            totalReturns: runningReturns,
            bpName: bpName, // Ensure BP name is in timeline
            returnPct: (index + 1) * costPerClick > 0 ? (runningReturns / ((index + 1) * costPerClick)) * 100 : 0
        });
    });

    const session = {
        huntName: `Imported: ${dataLines[0].split('\t')[0]}`,
        timestampStart: startTime,
        timestampEnd: Date.now(),
        totalCost: dataLines.length * costPerClick,
        totalReturns: runningReturns,
        lootHistory: lootHistory,
        timeline: timeline,
        craftingStats: {
            clicks: dataLines.length,
            successes,
            nearSuccesses,
            fails,
            loot: runningReturns,
            totalCost: dataLines.length * costPerClick,
            returnPct: (dataLines.length * costPerClick > 0) ? (runningReturns / (dataLines.length * costPerClick)) * 100 : 0
        },
        isImported: true
    };

    window.electronAPI.saveCraftingSession(session).then(res => {
        if (res.success) {
            notify('Session imported!', 'success');
            if (typeof showCraftingHistory === 'function') showCraftingHistory();
        }
    });
}



let isGroupedByDate = false;

async function toggleGrouping() {
    isGroupedByDate = !isGroupedByDate;
    
    // Visual update for all group buttons
    document.querySelectorAll('.toggleGroups').forEach(btn => btn.classList.toggle('active', isGroupedByDate));
    
    // Trigger the full UI refresh
    refreshHistoryUI(); 
}



/**
 * Generic render function for both Hunting and Crafting
 * @param {Array} items - The raw array from Electron
 * @param {HTMLElement} container - The target div
 * @param {String} mode - 'hunting' or 'crafting'
 */
function renderHistoryToContainer(items, container, mode) {
    // DIRECT MAPPING: Determine which specific IDs to read based on mode
    const searchId = (mode === 'hunting') ? 'searchHuntHistory' : 'searchCraftHistory';
    const sortId   = (mode === 'hunting') ? 'sortHuntHistory'   : 'sortCraftHistory';

    const searchTerm = document.getElementById(searchId)?.value.toLowerCase() || "";
    const sortVal = document.getElementById(sortId)?.value || "newest";

    // Helper for precise PED rendering (2-4 decimals)
    const formatSmartPED = (val) => {
        return Number(Math.round(val + 'e4') + 'e-4').toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 4
        });
    };

    // 1. Filter & Track Original Index
    let processed = items.map((data, originalIndex) => ({ data, originalIndex }));

    if (searchTerm) {
        processed = processed.filter(item => {
            const name = item.data.huntName?.toLowerCase() || "";
            const notes = item.data.notes?.toLowerCase() || "";
            return name.includes(searchTerm) || notes.includes(searchTerm);
        });
    }

    // 2. Sort Logic
    processed.sort((a, b) => {
        const costA = a.data.totalCost || 0;
        const costB = b.data.totalCost || 0;
        const retA = a.data.totalReturns || 0;
        const retB = b.data.totalReturns || 0;
        const roiA = costA > 0 ? retA / costA : 0;
        const roiB = costB > 0 ? retB / costB : 0;

        if (sortVal === "newest") return b.data.timestampStart - a.data.timestampStart;
        if (sortVal === "oldest") return a.data.timestampStart - b.data.timestampStart;
        if (sortVal === "roi") return roiB - roiA;
        if (sortVal === "cost") return costB - costA;
        return 0;
    });

    // 3. Render HTML
    container.innerHTML = '';
    if (processed.length === 0) {
        container.innerHTML = `<div class="no-hunts">No matches found.</div>`;
        return;
    }

    let lastDateLabel = "";

    processed.forEach((item) => {
        const session = item.data;
        const originalIndex = item.originalIndex;
        const dateLabel = new Date(session.timestampStart).toLocaleDateString();

        // Optional Grouping Header (isGroupedByDate must be globally accessible)
        if (window.isGroupedByDate && dateLabel !== lastDateLabel) {
            const groupHead = document.createElement('div');
            groupHead.className = 'history-group-header';
            groupHead.textContent = dateLabel;
            container.appendChild(groupHead);
            lastDateLabel = dateLabel;
        }

        const cost = session.totalCost || 0;
        const returns = session.totalReturns || 0;
        const pct = cost > 0 ? (returns / cost) * 100 : 0;
        const profitColor = pct >= 100 ? 'lime' : '#ff5f5f';

        const div = document.createElement('div');
        div.className = `hunt-entry ${mode === 'crafting' ? 'crafting-entry' : ''}`;
        
        div.innerHTML = `
            <div class="entry-main-info">
                <div class="name-date-stack hunt-layout">
                    <span class="hunt-name-text" title="${session.huntName || ''}">
                        ${session.huntName || (mode === 'hunting' ? 'Hunt' : 'Craft')}
                    </span>
                    <span class="hunt-date-subtext">${dateLabel}</span>
                </div>

                <div class="note-mid-preview" title="${session.notes || ''}">
                    ${session.notes ? `<span>${session.notes}</span>` : ''}
                </div>

                <div class="financial-stack">
                    <div class="info-inline-row">
                        <div class="info-inline">
                            <span class="stat-label">Cost:</span>
                            <span class="ped-value" style="color: #ff5f5f;">${formatSmartPED(cost)}</span>
                        </div>
                        <div class="info-inline">
                            <span class="stat-label">Ret:</span>
                            <span class="ped-value" style="color: #0af;">${formatSmartPED(returns)}</span>
                        </div>
                    </div>
                    <div class="roi-line">
                        <span class="stat-label">ROI:</span>
                        <span style="color: ${profitColor}; font-weight: bold;">${pct.toFixed(2)}%</span>
                    </div>
                </div>
            </div>

            <div class="hunt-actions">
                <button class="edit-btn" title="Edit">📝</button>
                <button class="delete-btn" title="Delete">❌</button>
            </div>
        `;

        // Click to Draw Graph
        div.addEventListener('click', (e) => {
            if (!e.target.closest('button')) {
                drawHuntGraph(originalIndex, mode);
            }
        });

        // Edit Button
        div.querySelector('.edit-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            openEditModal(session, originalIndex, mode);
        });

        // Delete Button
        div.querySelector('.delete-btn').addEventListener('click', async (e) => {
            e.stopPropagation();
            const title = session.huntName || "this session";
            if (!await customConfirm(`Delete ${title}?`)) return;
            
            if (mode === 'crafting') {
                await window.electronAPI.deleteCraftingSession(originalIndex);
            } else {
                await window.electronAPI.deleteHunt(originalIndex);
            }
            refreshHistoryUI();
        });

        container.appendChild(div);
    });
}

// ==========================================
// GLOBAL STATE & STORAGE
// ==========================================
let craftingPlans = []; 
let modalBpCache = [];

const THEME = {
    accent: '#ffb000', // Classic Amber
    success: '#4ade80', // Phosphor Green
    warning: '#fb923c', // Safety Orange
    border: '#333',
    bg: '#111'
};
const PLAN_LIST_CONTAINER = document.getElementById('activePlansList');
const PLAN_CREATE_BTN = document.getElementById('createNewPlanBtn');
const PLAN_MODAL = document.getElementById('planInputModal');
const PLAN_SEARCH_INPUT = document.getElementById('modalBpSearch');
const PLAN_CONFIRM_BTN = document.getElementById('modalConfirm');
const PLAN_CANCEL_BTN = document.getElementById('modalCancel');
const PLAN_PLANET_SELECT = document.getElementById('modalPlanPlanet');
const PLAN_TITLE_CONTAINER = document.getElementById('planTitle');
const PLAN_PLACEHOLDER = document.getElementById('planDetailPlaceholder');
const PLAN_MODAL_SELECT = document.getElementById('modalBpSelect');
const PLAN_MODAL_QTY = document.getElementById('modalBpQty');
const treeRoot = document.getElementById('productionTree');
const CRAFT_UI = {
    // Inputs in the main calculator
    inputs: {
        name: document.getElementById('itemName'),
        clicks: document.getElementById('clicks'),
        matContainer: document.getElementById('materials')
    },
    // Plan Detail View elements
    details: {
        view: document.getElementById('planDetailView'),
        placeholder: document.getElementById('planDetailPlaceholder'),
        title: document.getElementById('planTitle'),
        stats: document.getElementById('planStats'),
        tree: document.getElementById('productionTree'),
        revertBtn: document.getElementById('btnRevertDecisions')
    }
};
const PLAN_LIST_TEMPLATES = {
    empty: () => `
        <div style="color:#444; padding:10px; font-size:12px; text-align:center;">
            No active plans.
        </div>`,
        
    planCard: (plan) => `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; padding-right: 50px;">
            <div style="color: ${THEME.accent}; font-weight: bold; font-size: 13px; margin-bottom: 2px;">
                ${plan.name}
            </div>
        </div>
        <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px;">
            <span style="color: #666; font-size: 10px; background: #222; padding: 1px 5px; border-radius: 3px; text-transform: uppercase;">
                ${plan.planet || 'ALL'}
            </span>
            <div style="color: #888; font-size: 11px;">Target: ${plan.targetQty.toLocaleString()}</div>
        </div>`,

    // Predefined CSS strings to keep the JS clean
    styles: {
        card: `padding: 12px; background: ${THEME.bg}; border: 1px solid ${THEME.border}; margin-bottom: 8px; cursor: pointer; border-radius: 4px; position: relative; transition: all 0.2s; overflow: hidden;`,
        btnGroup: `position: absolute; top: 8px; right: 8px; display: flex; gap: 8px; align-items: center;`,
        syncBtn: `background: none; border: none; color: #444; cursor: pointer; font-size: 12px; padding: 4px; transition: color 0.2s;`,
        delBtn: `background: none; border: none; color: #444; cursor: pointer; font-size: 18px; line-height: 1; padding: 2px;`
    }
};
const TREE_TEMPLATES = {
    header: (step, states) => {
        const { isFullyStocked, hasChildren, isGlobal, hasShortfall, icon } = states;
        const caret = hasChildren ? 
            `<span class="tree-caret" style="margin-right: 8px; transition: transform 0.2s; display: inline-block; transform: rotate(-90deg);">▼</span>` : '';

        const statusDetail = isGlobal ? 
            `<div class="loc-toggle" style="color: ${THEME.accent}; cursor: pointer; text-decoration: underline; font-size: 9px;">Found Globally: ${step.totalEverywhere}</div>` : 
            `<div style="color: ${hasShortfall ? THEME.warning : '#777'}">Need: ${Math.ceil(step.shortfall).toLocaleString()}</div>`;

        return `
            <div style="display: flex; align-items: center; gap: 10px; flex: 1;">
                <span style="${TREE_STYLES.iconBox}">${icon}</span>
                <span style="font-family: monospace; color: #aaa;">${Math.ceil(step.required).toLocaleString()}x</span>
                <span style="font-weight: bold; color: ${isFullyStocked ? THEME.success : '#fff'}; font-size: 13px;">${caret}${step.name}</span>
            </div>
            <div style="font-size: 11px; color: #777; text-align: right; font-family: monospace; min-width: 120px;">
                <div style="color: #bbb;">Inv (${step.planet}): ${step.owned.toLocaleString()}</div>
                ${statusDetail}
            </div>`;
    },

    // NEW: Predefined logic for the Global Distribution rows
    locationRows: (locations) => {
        let html = `<strong style="color:${THEME.accent}; display:block; margin-bottom:8px; font-size: 10px; text-transform: uppercase;">Global Distribution:</strong>`;
        
        locations.forEach(l => {
            const parts = l.loc.split(',').map(p => p.trim()).reverse();
            html += `<div style="margin-bottom: 10px; border-bottom: 1px solid #1a1a1a; padding-bottom: 5px;">`;
            parts.forEach((part, index) => {
                const indent = index * 12;
                const isLast = index === parts.length - 1;
                html += `
                    <div style="margin-left: ${indent}px; display: flex; align-items: center; gap: 5px; line-height: 1.4;">
                        <span style="color: #444;">${index > 0 ? '└' : '🌐'}</span>
                        <span style="color: ${isLast ? '#eee' : '#777'}; font-weight: ${isLast ? 'bold' : 'normal'}">${part}</span>
                        ${isLast ? `<span style="color: ${THEME.accent}; margin-left: auto; font-family: monospace;">${l.qty.toLocaleString()}x</span>` : ''}
                    </div>`;
            });
            html += `</div>`;
        });
        return html;
    }
};
const TREE_STYLES = {
    node: "margin-left: 20px; border-left: 1px solid #333; padding-left: 15px; margin-top: 10px; position: relative;",
    headerBase: "display: flex; justify-content: space-between; align-items: center; background: #161616; padding: 8px 12px; border-radius: 6px; user-select: none;",
    locPanel: "display: none; background: #0a0a0a; border: 1px dashed #444; margin-top: 5px; padding: 10px; font-size: 11px; color: #aaa; border-radius: 4px;",
    iconBox: "font-size: 16px; width: 20px; text-align: center;"
};

const TREE_ICONS = {
    SUCCESS: `<span style="color: ${THEME.success};">✓</span>`,
    CRAFT: `<span style="color: #facc15;">⚙</span>`,
    SHOP: `<span style="color: #f87171;">🛒</span>`
};
const DETAILS_TEMPLATES = {
    title: (plan) => `
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="background: #333; color: ${THEME.accent}; font-size: 10px; padding: 2px 8px; margin-right: 12px; border-radius: 10px; border: 1px solid #555; text-transform: uppercase;">${plan.planet || "ALL"}</span>
                <span style="font-weight: bold;">${plan.name}</span>
            </div>
            <div style="display: flex; gap: 8px;">
                <button id="btnRevertDecisions" data-bp="${plan.name}" title="Move items back to Undecided" 
                    style="background: rgba(248, 113, 113, 0.1); border: 1px solid #451a1a; color: ${THEME.warning}; font-size: 10px; padding: 4px 8px; cursor: pointer; border-radius: 3px; display: flex; align-items: center; gap: 4px;">
                    <i class="fas fa-undo"></i> Revert Decisions
                </button>
                <button id="btnExpandAll" style="background: #222; border: 1px solid #444; color: #ccc; font-size: 10px; padding: 4px 8px; cursor: pointer; border-radius: 3px;">Expand All</button>
                <button id="btnCollapseAll" style="background: #222; border: 1px solid #444; color: #ccc; font-size: 10px; padding: 4px 8px; cursor: pointer; border-radius: 3px;">Collapse All</button>
            </div>
        </div>`,

    stockBox: (productName, totalQty, totalTT, items) => `
        <div id="stockBoxContainer" data-action="toggle-stock" style="background: #0a0a0a; padding: 12px; border: 1px solid #333; margin-bottom: 4px; border-radius: 6px; grid-column: 1 / -1; cursor: pointer; transition: background 0.2s;">
            <div style="display: flex; justify-content: space-between; align-items: center; pointer-events: none;">
                <p style="margin: 0; color: #ff8400ed; font-style: italic; text-decoration: underline; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                    Product in Stock: ${productName}
                </p>
                <span id="stockToggleIcon" style="color: #666; font-size: 10px;">
                    <i class="fas fa-chevron-down"></i> Click to View Locations
                </span>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                <span style="font-size: 18px; color: #fff; font-weight: bold;">
                    ${totalQty.toLocaleString()} <span style="font-size: 12px; color: #666; font-weight: normal;">Units Total</span>
                </span>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="color: #00ffff; font-family: 'Courier New', monospace; font-size: 14px; margin-right: 4px;">
                        ${totalTT} PED TT
                    </span>
                    <button class="btn-sell-all-tt" data-action="sell-all-tt" data-product="${productName}" 
                        style="background: #222; border: 1px solid #451a1a; color: #f87171; font-size: 9px; padding: 2px 6px; cursor: pointer; border-radius: 3px; text-transform: uppercase; font-weight: bold;">
                        TT ALL
                    </button>
                    <button class="btn-sell-all" data-action="sell-all-mu" data-product="${productName}"
                        style="background: #3b0764; border: 1px solid #a855f7; color: #e9d5ff; font-size: 9px; padding: 2px 6px; cursor: pointer; border-radius: 3px; text-transform: uppercase; font-weight: bold;">
                        Sell All MU
                    </button>
                </div>
            </div>

            <div id="stockLocationTree" style="display: none; border-top: 1px solid #222; margin-top: 12px; padding-top: 8px;">
                <div style="display: flex;justify-content: space-between;flex-direction: row;"><p style="font-size: 9px; color: #555; text-transform: uppercase; display: block; margin-bottom: 8px;">Inventory Locations</p><div style="float:right;font-size: 9px; color: #555; text-transform: uppercase; display: flex; margin-bottom: 8px;flex-direction:row;flex-wrap:nowrap;justify-content:space-evenly;width:320px;"><p class="stocklabel" id="stocklabel1">[qty]</p><p class="stocklabel" id="stocklabel2">[ttvalue]</p><p class="stocklabel" id="stocklabel3">[markup%]</p><p class="stocklabel" id="stocklabel4"style="margin-left:15px;">[reset]</p><p class="stocklabel" id="stocklabel5">[sellTT]</p><p id="stocklabel6">[sellmu]</p>
                    </div>
                </div>
                ${items.map(item => {
                    const currentMU = item.mu || 100;
                    const decision = inventoryState.decisions[String(item.id)];
                    let decisionBadge = decision ? `<span class="badge-decision" style="color: #a855f7; font-size: 9px; border: 1px solid #3b0764; background: rgba(168, 85, 247, 0.1); padding: 0px 4px; border-radius: 3px; margin-left: 5px;">${decision.type}</span>` : '';

                    return `
                    <div class="stock-item-row" style="display: flex; align-items: center; gap: 6px; margin-bottom: 6px; font-size: 11px;">
                        <span style="color: #444;">∟</span>
                        <div style="flex-grow: 1; overflow: hidden; display: flex; align-items: center;">
                             <span style="color: #aaa; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 150px;">
                                ${item.path}
                            </span>
                            ${decisionBadge}
                        </div>
                        <div style="display: flex; align-items: center; gap: 6px; font-family: 'Courier New', monospace; min-width: 310px; justify-content: flex-end;">
                            <span style="color: #0f0;">[${item.qty.toLocaleString()}]</span>
                            <span style="color: #00ffff;">${item.tt} PED</span>
                            <input type="number" class="mu-input-dynamic mu-input-${item.id}" data-id="${item.id}" value="${currentMU}" step="0.1" 
                                style="width: 45px; background: #111; border: 1px solid #444; color: #a855f7; font-size: 10px; padding: 1px 3px; text-align: center; border-radius: 3px;">
                            
                            <button class="btn-reset-single" data-id="${item.id}" title="Reset to Undecided"
                                style="background: #111; border: 1px solid #3d2b1f; color: #fb923c; padding: 2px 5px; cursor: pointer; border-radius: 3px; font-size: 10px;">
                                <i class="fas fa-undo" style="pointer-events:none;"></i>
                            </button>
                            <button class="btn-sell-single-tt" data-id="${item.id}" title="Sell stack to TT"
                                style="background: #111; border: 1px solid #451a1a; color: #f87171; padding: 2px 5px; cursor: pointer; border-radius: 3px; font-size: 10px;">
                                <i class="fas fa-trash-alt" style="pointer-events:none;"></i>
                            </button>
                            <button class="btn-sell-single" data-id="${item.id}" title="Sell stack with Markup"
                                style="background: #111; border: 1px solid #444; color: #a855f7; padding: 2px 5px; cursor: pointer; border-radius: 3px; font-size: 10px;">
                                <i class="fas fa-tag" style="pointer-events:none;"></i>
                            </button>
                        </div>
                    </div>`;
                }).join('')}
            </div>
        </div>`,

    bpMaterialOrderList: (buyItems) => `
        <div style="background: rgba(248, 113, 113, 0.05); padding: 12px; border-radius: 4px; border: 1px solid #451a1a; margin-bottom: 15px;">
            <strong style="color: #f87171; font-size: 10px; text-transform: uppercase; display: block; margin-bottom: 8px; letter-spacing: 1px;">🛒 Active Material Orders</strong>
            <div style="display: flex; flex-direction: column; gap: 4px;">
                ${buyItems.map(item => `
                    <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; padding: 4px 8px; background: rgba(0,0,0,0.3); border-radius: 3px; border-left: 2px solid #f87171;">
                        <span style="color: #eee;">${item.name}</span>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <span style="color: #f87171; font-family: monospace; font-weight: bold;">${Math.ceil(item.targetQty).toLocaleString()}x @ ${item.targetMu}%</span>
                            <button data-action="remove-buy" data-id="${item.id}" style="background: none; border: none; color: #666; cursor: pointer; font-size: 10px;">
                                <i class="fas fa-times" style="pointer-events:none;"></i>
                            </button>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>`,

    shortfallBox: (items) => `
        <div class="shortfall-box" style="height:min-content;background: rgba(248, 113, 113, 0.05); padding: 12px; border-radius: 4px; border: 1px solid #451a1a; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid rgba(248, 113, 113, 0.2); padding-bottom: 6px;">
                <strong style="color: #f87171; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">🛒 Universe Shortfall</strong>
            
                <button class="toggle-shortfall-btn" style="background: none; border: none; color: #f87171; cursor: pointer; font-size: 10px; padding: 2px 6px;">
                    <span class="toggle-icon">▼</span> Compact
                </button>
            </div>
        
            <div class="shortfall-content">
                ${items.map(([name, data]) => `
                    <div style="font-size: 12px; display: flex; justify-content: space-between; margin-bottom: 4px;">
                        <span style="color: #eee;">${data.type === 'Blueprint' ? '📋 ' : ''}${name}</span>
                        <b style="color: #f87171; font-family: monospace;">${data.type === 'Blueprint' ? 'MISSING BP' : Math.ceil(data.qty).toLocaleString() + 'x'}</b>
                    </div>
                `).join('')}
            </div>
        
            <button id="btnBuyAllShortfall" style="background: #f87171; color: #000; border: none; padding: 3px 10px; border-radius: 3px; font-size: 9px; cursor: pointer; font-weight: bold; text-transform: uppercase; margin-top: 8px; width: 100%;">
                Buy All Missing
            </button>
        </div>`,

    elsewhereBox: (items) => `
        <div class="elsewhere-box" style="background: rgba(168, 85, 247, 0.05); padding: 12px; border-radius: 4px; border: 1px solid #3b0764; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid rgba(168, 85, 247, 0.2); padding-bottom: 6px;">
                <strong style="color: #a855f7; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px;">🚀 Found Elsewhere</strong>
            
                <button class="toggle-elsewhere-btn" style="background: none; border: none; color: #a855f7; cursor: pointer; font-size: 10px; padding: 2px 6px;">
                    <span class="toggle-icon">▼</span> Compact
                </button>
            </div>
        
            <div class="elsewhere-content">
                ${items.map(([name, data]) => {
                    const isBP = data.type === 'Blueprint';
                    const qtyDisp = isBP ? 'BP Owned' : `${Math.ceil(data.qty).toLocaleString()}x`;
                    return `
                        <div style="font-size: 12px; display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <span style="color: #ccc;">${isBP ? '📋 ' : ''}${name}</span>
                            <div style="text-align: right;">
                                <span style="color: #a855f7; font-weight: bold;">${qtyDisp}</span>
                                <div style="font-size: 9px; color: #888;">Total: ${data.everywhere.toLocaleString()}</div>
                            </div>
                        </div>`;
                }).join('')}
            </div>
        </div>`,

    successBox: () => `
        <div style="background: rgba(74, 222, 128, 0.1); padding: 12px; border-radius: 4px; border: 1px solid #14532d; margin-bottom: 15px; color: ${THEME.success}; font-size: 12px; font-weight: bold; border-left: 4px solid #4ade80;">
            ✅ Ready to craft! All items & BPs available locally.
        </div>`
};
function savePlans() {
    // Convert to string and store in localStorage
    localStorage.setItem('craftingPlans', JSON.stringify(craftingPlans));
    console.log("Plans saved to localStorage:", craftingPlans.length);
}

function loadStoredPlans() {
    const saved = localStorage.getItem('craftingPlans');
    if (saved) {
        try {
            craftingPlans = JSON.parse(saved);
            renderPlansList();
        } catch (e) { console.error("Failed to load plans", e); }
    }
}

// ==========================================
// FUZZY SEARCH MODAL LOGIC
// ==========================================
function updateModalList(filterText = "") {
    // 1. Safety check using the global reference
    if (!PLAN_MODAL_SELECT) return;

    // 2. Clear the existing list
    PLAN_MODAL_SELECT.innerHTML = '';

    // 3. Filter based on fuzzy match
    const filtered = modalBpCache.filter(bp => {
        if (!filterText) return true;
        return typeof fuzzyMatch === 'function' 
            ? fuzzyMatch(filterText, bp.name) 
            : bp.name.toLowerCase().includes(filterText.toLowerCase());
    });

    // 4. Handle empty states
    if (filtered.length === 0) {
        const nullOpt = document.createElement('option');
        nullOpt.value = "";
        nullOpt.textContent = "-- No matches found --";
        nullOpt.style.color = "#666"; // Dim it out
        PLAN_MODAL_SELECT.appendChild(nullOpt);
        return;
    }

    // 5. Populate the dropdown
    filtered.forEach(bp => {
        const newOption = document.createElement('option');
        newOption.value = bp.name;
        
        // Context-aware labels for Entropia mechanics
        const unitLabel = bp.isLimited ? 'clicks left' : 'in inventory';
        newOption.textContent = `${bp.name} [${bp.totalQty.toLocaleString()} ${unitLabel}]`;
        
        PLAN_MODAL_SELECT.appendChild(newOption);
    });

    // 6. Auto-select the top match during search
    if (filterText && PLAN_MODAL_SELECT.options.length > 0) {
        PLAN_MODAL_SELECT.selectedIndex = 0;
    }
}
// ==========================================
// RECURSIVE RESOLUTION ENGINE
// ==========================================
// Updated to accept an optional 'isRoot' flag to preserve original naming
// Updated to handle Planet-specific inventory checks
const getCraftInputs = () => ({
    name: document.getElementById('itemName'),
    clicks: document.getElementById('clicks'),
    matContainer: document.getElementById('materials')
});

// Updated: Use the plan's planet when adding from tree
function addToBuyingListFromTree(name, qty, mu = 100) {

    const plan = craftingPlans.find(p => p.id === currentActivePlanId);
	if (!currentActivePlanId) {
		console.warn("[Crafting Buddy] No active plan — using ALL planets");
	}
    const targetPlanet = plan && plan.planet ? plan.planet : 'ALL';

    const ttValue = getItemTTValueByName(name);

    const newItem = {
        name: name,
        targetQty: qty,
        targetMu: mu,
        ttValue: parseFloat(ttValue.toFixed(4)),
        planet: targetPlanet,                    // ← Use plan planet
        id: `buy-${Date.now()}`,
        meta: { bp: currentActivePlanId }
    };

    inventoryState.buyingList.push(newItem);
    saveDecisions();

    if (typeof renderBuyingList === 'function') renderBuyingList();
    if (currentActivePlanId) displayPlanDetails(currentActivePlanId);
}

// Updated: Use the plan's planet for bulk shortfall
function bulkAddShortfallToBuyingList(shortfall) {
    const plan = craftingPlans.find(p => p.id === currentActivePlanId);
	if (!currentActivePlanId) {
		console.warn("[Crafting Buddy] No active plan — using ALL planets");
	}
    const targetPlanet = plan && plan.planet ? plan.planet : 'ALL';

    const itemsToAdd = Object.entries(shortfall).filter(([name, data]) => data.type !== 'Blueprint');

    itemsToAdd.forEach(([name, data]) => {
        const exists = inventoryState.buyingList.some(buy =>
            buy.name === name && buy.meta?.bp === currentActivePlanId
        );

        if (!exists) {
            // Find real TT value from current inventory
            let ttValue = 0;
            const matchingItem = Object.values(inventoryState.items || {}).find(item =>
                (item.name || '').toLowerCase() === name.toLowerCase()
            );

            if (matchingItem) {
                if (matchingItem.value && matchingItem.value > 0) {
                    ttValue = matchingItem.value;
                } else if (matchingItem.totalValue && matchingItem.quantity) {
                    ttValue = matchingItem.totalValue / matchingItem.quantity;
                }
            }

            inventoryState.buyingList.push({
                name: name,
                targetQty: Math.ceil(data.qty),
                targetMu: 100,
                ttValue: parseFloat(ttValue.toFixed(4)),
                planet: targetPlanet,               // ← Use plan planet
                id: `buy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                meta: { bp: currentActivePlanId }
            });
        }
    });

    saveDecisions();
    if (typeof renderBuyingList === 'function') renderBuyingList();
    if (currentActivePlanId) displayPlanDetails(currentActivePlanId);
}
async function syncInventoryToPlans() {
    if (craftingPlans.length === 0) return;

    let changesMade = false;
    const requiredMaterialsMap = new Map();
    
    // 1. Map out what we need across ALL plans
    craftingPlans.forEach(plan => {
        const gather = (node) => {
            requiredMaterialsMap.set(node.name, { 
                bp: plan.name, 
                planet: plan.planet || "ALL" 
            });
            if (node.subMaterials) node.subMaterials.forEach(gather);
        };
        gather(plan.tree);
    });

    // 2. Scan current Inventory and Update Decisions
    Object.entries(inventoryState.items).forEach(([id, item]) => {
        const strId = String(id);
        const match = requiredMaterialsMap.get(item.name);

        if (match) {
            const itemLoc = (item.location || "").toUpperCase();
            const targetPlanet = match.planet.toUpperCase();

            if (targetPlanet === "ALL" || itemLoc.includes(targetPlanet) || itemLoc === "CARRIED") {
                const current = inventoryState.decisions[strId];
                
                if (!current || current.type !== 'CRAFT' || (current.meta && current.meta.bp !== match.bp)) {
                    inventoryState.decisions[strId] = {
                        type: 'CRAFT',
                        timestamp: Date.now(),
                        meta: { bp: match.bp, autoSynced: true }
                    };

                    inventoryState.undecidedQueue = inventoryState.undecidedQueue.filter(qid => String(qid) !== strId);
                    changesMade = true;
                }
            }
        }
    });

    // 3. Persist and Refresh
    if (changesMade) {
        await saveDecisions();
        
        // Refresh the Inventory Manager views (CRAFT/SAVE/SELL tables)
        if (typeof renderInventory === 'function') {
            renderInventory(['SAVE', 'SELL_MU', 'SELL_TT', 'CRAFT']);
        }
        
        // Refresh the Undecided Queue UI
        if (typeof refreshUndecidedUI === "function") refreshUndecidedUI();
        
        // Refresh the active plan tree to update shortfall badges
        if (currentActivePlanId) displayPlanDetails(currentActivePlanId);
        
        // Global table refresh if applicable
        if (typeof refreshAllInventoryTables === 'function') refreshAllInventoryTables();
    }
}
async function resolveProductionStep(itemName, requiredQty, isRoot = false, targetPlanet = "ALL") {
    const cleanItemName = sanitizebpItemName(itemName);
    const targetUpper = targetPlanet.toUpperCase();

    // 1. Get all instances of this item across the entire universe
    const allMatchingItems = Object.values(inventoryState.items || {})
        .filter(i => sanitizebpItemName(i.name) === cleanItemName);

    /**
     * LOCAL OWNERSHIP CALCULATION
     * An item is "owned" for this plan if:
     * - Planet is set to 'ALL' (Global View)
     * - Item is physically 'CARRIED' by the player
     * - Item is in the 'HUB'
     * - Item location string contains the target planet (e.g., "Storage (Toulan)")
     */
    const ownedOnPlanet = allMatchingItems.reduce((sum, i) => {
        const itemLoc = (i.location || "").toUpperCase();
        
        const isCarriedOrHub = (itemLoc === "CARRIED" || itemLoc === "HUB");
        const isTargetStorage = itemLoc.includes(`STORAGE (${targetUpper})`);
        const isExactMatch = (itemLoc === targetUpper);

        if (targetUpper === "ALL" || isCarriedOrHub || isTargetStorage || isExactMatch) {
            return sum + (Number(i.quantity) || 0);
        }
        return sum;
    }, 0);

    // Total regardless of location for "Global Stock" hints
    const totalOwnedEverywhere = allMatchingItems.reduce((sum, i) => sum + (Number(i.quantity) || 0), 0);

    // 2. Map Locations - Providing full context for the UI "Elsewhere" panels
    const itemLocations = allMatchingItems.map(item => {
        let displayPath = "N/A";
        if (typeof getItemContainerPath === 'function') {
            displayPath = getItemContainerPath(item, inventoryState.items);
        } else {
            displayPath = item.location || "N/A";
        }

        return {
            loc: displayPath.toUpperCase(),
            qty: Number(item.quantity) || 0
        };
    });

    // Find the Blueprint data
    let bpData = cachedBlueprints.find(bp => {
        const product = sanitizebpItemName(bp.Product?.Name || "");
        const bpName = sanitizebpItemName(bp.Name || "");
        return product === cleanItemName || bpName === cleanItemName;
    });

    // SHORTFALL CALCULATION: Strictly Local
    // If you need 100 and have 0 on Toulan (but 500 on Calypso), shortfall is 100.
    const shortfall = Math.max(0, requiredQty - ownedOnPlanet);

    const step = {
        name: itemName,
        required: requiredQty,
        owned: ownedOnPlanet,
        totalEverywhere: totalOwnedEverywhere,
        locations: itemLocations,
        shortfall: shortfall,
        planet: targetPlanet, 
        isCraftable: !!bpData,
        subMaterials: [] 
    };

    // 3. Recursive resolution for Sub-Materials
    if (step.isCraftable && bpData.Materials) {
        // Use Product Name if this is a sub-component to keep tree clean
        if (!isRoot && bpData.Product?.Name) step.name = bpData.Product.Name;

        for (const mat of bpData.Materials) {
            const totalSubNeeded = (mat.Amount || 1) * requiredQty; 
            
            // Pass the SAME targetPlanet down the tree to ensure planetary consistency
            const subStep = await resolveProductionStep(
                mat.Item.Name, 
                totalSubNeeded, 
                false, 
                targetPlanet
            );
            step.subMaterials.push(subStep);
        }
    }
    
    return step;
}
/**
 * Standardized sanitization for Crafting Plans.
 * Does NOT strip dashes or special characters to prevent name collisions.
 */
function sanitizebpItemName(name) {
    if (!name) return "";
    return name.toString().toLowerCase().trim();
}
// ==========================================
// UI RENDERING
// ==========================================
let currentActivePlanId = null; 

function renderPlansList() {
    if (!PLAN_LIST_CONTAINER) return;
    PLAN_LIST_CONTAINER.innerHTML = ''; 

    if (craftingPlans.length === 0) {
        PLAN_LIST_CONTAINER.innerHTML = PLAN_LIST_TEMPLATES.empty();
        return;
    }

    const sorted = [...craftingPlans].sort((a, b) => b.id - a.id);

    sorted.forEach(plan => {
        const planEl = document.createElement('div');
        planEl.className = 'plan-sidebar-item';
        planEl.id = `plan-item-${plan.id}`;
        
        // --- HIGHLIGHT LOGIC ---
        const isActive = plan.id === currentActivePlanId;
        let baseStyle = PLAN_LIST_TEMPLATES.styles.card;
        
        // Inject active styling if matches
        if (isActive) {
            baseStyle += `border-left: 4px solid ${THEME.accent}; background: #2a2a2a;`;
        }
        
        planEl.style.cssText = baseStyle;

        planEl.innerHTML = PLAN_LIST_TEMPLATES.planCard(plan);

        // --- Buttons ---
        const btnGroup = document.createElement('div');
        btnGroup.style.cssText = PLAN_LIST_TEMPLATES.styles.btnGroup;

        // Sync Button
        const syncBtn = document.createElement('button');
        syncBtn.innerHTML = '<i class="fas fa-sync-alt"></i>';
        syncBtn.style.cssText = PLAN_LIST_TEMPLATES.styles.syncBtn;
        syncBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const icon = syncBtn.querySelector('i');
            if (icon) icon.classList.add('fa-spin');
            if (typeof syncInventoryToPlans === 'function') await syncInventoryToPlans();
            displayPlanDetails(plan.id);
            if (icon) setTimeout(() => icon.classList.remove('fa-spin'), 600);
        });

        // Delete Button
        const delBtn = document.createElement('button');
        delBtn.innerHTML = '&times;';
        delBtn.style.cssText = PLAN_LIST_TEMPLATES.styles.delBtn;
        delBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (typeof deletePlan === 'function') deletePlan(plan.id);
        });

        // Sidebar click handler
        planEl.addEventListener('click', () => {
            displayPlanDetails(plan.id);
        });

        btnGroup.appendChild(syncBtn);
        btnGroup.appendChild(delBtn);
        planEl.appendChild(btnGroup);
        PLAN_LIST_CONTAINER.appendChild(planEl);
    });
}

async function allocateInventoryToCrafting(tree, bpName, planet, mode) {
    if (mode === 'NONE') return;

    const idsToProcess = [];
    const flattenedMaterials = [];

    // 1. Recursive helper to get all required materials from the tree
    const gatherMaterials = (node) => {
        flattenedMaterials.push({
            name: node.name,
            required: node.required
        });
        if (node.subMaterials) node.subMaterials.forEach(gatherMaterials);
    };
    gatherMaterials(tree);

    // 2. Match with actual Inventory items
    Object.entries(inventoryState.items).forEach(([id, item]) => {
        // Only look at items on the target planet (or check global if desired)
        const itemPlanet = item.location?.toUpperCase() || "";
        if (!itemPlanet.includes(planet.toUpperCase()) && planet !== "ALL") return;

        // Check if this item is in our required materials list
        const match = flattenedMaterials.find(m => m.name === item.name);
        
        if (match) {
            // mode "ALL" takes the whole stack. 
            // mode "REQUIRED" logic usually requires a partial stack split, 
            // but since Entropia items are unique IDs, we mark the whole ID 
            // if it contributes to the goal.
            idsToProcess.push(id);
        }
    });

    // 3. Apply the decisions using your existing Inventory Manager logic
    idsToProcess.forEach(itemId => {
        const strId = String(itemId);
        
        // Update the state just like handleDecisionConfirm does
        inventoryState.decisions[strId] = {
            type: 'CRAFT',
            timestamp: Date.now(),
            meta: { 
                bp: bpName, 
                autoAllocated: true,
                mode: mode 
            }
        };

        // Remove from the undecided queue so it disappears from the list
        inventoryState.undecidedQueue = inventoryState.undecidedQueue.filter(id => String(id) !== strId);
    });

    // 4. Persist and Refresh
    await saveDecisions();
    
    // Trigger your existing refresh logic from inventorymanager.js
    if (typeof refreshUndecidedUI === "function") {
        refreshUndecidedUI();
    }
}
function renderLocationPanel(step, header, parentDiv) {
    const locPanel = document.createElement('div');
    locPanel.style.cssText = TREE_STYLES.locPanel;
    
    // Use the predefined template instead of building strings here
    locPanel.innerHTML = TREE_TEMPLATES.locationRows(step.locations);
    
    parentDiv.appendChild(locPanel);

    const toggle = header.querySelector('.loc-toggle');
    if (toggle) {
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isHidden = locPanel.style.display === "none";
            locPanel.style.display = isHidden ? "block" : "none";
        });
    }
}
function renderChildContainer(step, header, parentDiv) {
    const childContainer = document.createElement('div');
    childContainer.className = "tree-child-container";
    childContainer.style.display = "none";
    
    if (Array.isArray(step.subMaterials)) {
        step.subMaterials.forEach(sub => renderPlanTreeUI(sub, childContainer));
    }
    
    parentDiv.appendChild(childContainer);

    header.addEventListener('click', () => {
        const isHidden = childContainer.style.display === "none";
        childContainer.style.display = isHidden ? "block" : "none";
        const caretSpan = header.querySelector('.tree-caret');
        if (caretSpan) {
            caretSpan.style.transform = isHidden ? "rotate(0deg)" : "rotate(-90deg)";
        }
    });
}

// --- The Main Recursive Function ---

function renderPlanTreeUI(step, container) {
    const div = document.createElement('div');
    div.style.cssText = TREE_STYLES.node;
    
    const isFullyStocked = step.owned >= step.required;
    const states = {
        isFullyStocked,
        hasShortfall: step.shortfall > 0,
        hasChildren: !!(step.subMaterials && step.subMaterials.length > 0),
        isGlobal: !isFullyStocked && step.totalEverywhere > step.owned,
        icon: isFullyStocked ? TREE_ICONS.SUCCESS : (step.isCraftable ? TREE_ICONS.CRAFT : TREE_ICONS.SHOP)
    };

    const header = document.createElement('div');
    header.style.cssText = `
        ${TREE_STYLES.headerBase}
        border: 1px solid ${states.isFullyStocked ? '#14532d' : '#333'}; 
        opacity: ${states.isFullyStocked ? '0.8' : '1'};
        cursor: ${states.hasChildren ? 'pointer' : 'default'};
        position: relative;
    `;

    const inv = getProductInventoryDetails(step.name);
    header.title = `Current Stock: ${inv.totalQty}\nValue: ${inv.totalTT} PED\nLocations: ${inv.pathList}`;

    header.innerHTML = TREE_TEMPLATES.header(step, states);

    // Add badge if inventory exists
    if (inv.totalQty > 0) {
        const badge = document.createElement('div');
        badge.style.cssText = "position:absolute; top:-5px; right:5px; background:#28a745; color:white; font-size:9px; padding:1px 4px; border-radius:3px; font-weight:bold; box-shadow:0 2px 4px rgba(0,0,0,0.5); pointer-events:none;";
        badge.textContent = `INV: ${inv.totalQty.toLocaleString()}`;
        header.appendChild(badge);
    }

    // --- SHOP ICON LOGIC ---
    const iconSpan = header.querySelector('span[style*="color:"]');
    if (iconSpan && states.icon === TREE_ICONS.SHOP) {
        iconSpan.style.cursor = 'pointer';
        iconSpan.title = "Click to add to Buying List";
        
        iconSpan.onclick = (e) => {
            e.stopPropagation(); // Don't expand/collapse node
            
            // Check if form already exists to toggle it
            const existingForm = div.querySelector('.shop-form');
            if (existingForm) {
                existingForm.remove();
                return;
            }

            const shopForm = document.createElement('div');
            shopForm.className = 'shop-form';
            shopForm.style.cssText = `
                display: flex; gap: 8px; align-items: center; background: #1a1a1a; 
                padding: 6px; border: 1px solid #451a1a; border-radius: 4px; margin: 5px 10px;
            `;
            
            shopForm.innerHTML = `
                <span style="font-size: 10px; color: #f87171; font-weight: bold;">SHOP:</span>
                <input type="number" class="shop-qty" value="${Math.ceil(step.shortfall)}" style="width: 60px; background:#000; color:#fff; border:1px solid #444; font-size:10px; padding: 2px;">
                <span style="font-size: 9px; color: #666;">QTY</span>
                <input type="number" class="shop-mu" value="100" step="0.1" style="width: 50px; background:#000; color:#a855f7; border:1px solid #444; font-size:10px; padding: 2px;">
                <span style="font-size: 9px; color: #666;">MU%</span>
                <button class="btn-confirm-shop" style="background:#451a1a; color:#f87171; border:none; padding: 2px 8px; cursor:pointer; font-size:10px; border-radius:3px; font-weight:bold;">ADD</button>
            `;

            shopForm.querySelector('.btn-confirm-shop').onclick = () => {
                const q = parseFloat(shopForm.querySelector('.shop-qty').value);
                const m = parseFloat(shopForm.querySelector('.shop-mu').value);
                
                if (q > 0 && m > 0) {
                    // --- DUPLICATE CHECK ---
                    // Only add if this exact item name isn't already on the buying list for THIS specific plan
                    const alreadyExists = inventoryState.buyingList.some(item => 
                        item.name === step.name && item.meta?.bp === currentActivePlanId
                    );

                    if (!alreadyExists) {
                        const newItem = {
                            name: step.name,
                            targetQty: q,
                            targetMu: m,
                            id: `buy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            meta: { bp: currentActivePlanId }
                        };

                        inventoryState.buyingList.push(newItem);
                        saveDecisions();
                        
                        if (typeof renderBuyingList === 'function') renderBuyingList();
                        // Refresh plan details to update the Active Material Orders list
                        displayPlanDetails(currentActivePlanId); 
                    } else {
                        console.warn(`[Shop] ${step.name} is already in the buying list for this plan.`);
                        // Optional: Highlight existing form or provide feedback
                        shopForm.style.borderColor = "#facc15"; 
                    }
                }
            };

            // Prevent form clicks from expanding/collapsing the node
            shopForm.onclick = (e) => e.stopPropagation();
            
            div.insertBefore(shopForm, header.nextSibling);
        };
    }

    div.appendChild(header);

    if (states.isGlobal && Array.isArray(step.locations)) {
        renderLocationPanel(step, header, div);
    }

    if (states.hasChildren) {
        renderChildContainer(step, header, div);
    }

    container.appendChild(div);
}
async function displayPlanDetails(planId) {
    currentActivePlanId = Number(planId);
    const plan = craftingPlans.find(p => p.id === currentActivePlanId);
    if (!plan) return;

    // 1. Refresh tree & Sync BP Data
    plan.tree = await resolveProductionStep(plan.name, plan.targetQty, true, plan.planet);
    savePlans(); 

    const cleanPlanName = sanitizebpItemName(plan.name);
    const savedBps = JSON.parse(localStorage.getItem('blueprints') || '[]');
    const savedIndex = savedBps.findIndex(b => sanitizebpItemName(b.bpName) === cleanPlanName);

    if (savedIndex !== -1) loadBlueprint(savedIndex); 
    else await loadBlueprintByName(plan.name, true); 

    // Sync Calculator
    const clicksInput = document.getElementById('clicks');
    if (clicksInput) {
        clicksInput.value = plan.targetQty || 1;
        clicksInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    if (typeof window.calculate === 'function') window.calculate(); 

    // 2. Render UI Templates
    document.getElementById('planDetailPlaceholder').style.display = 'none';
    const detailView = document.getElementById('planDetailView');
    detailView.style.display = 'block';

    const planTitleEl = document.getElementById('planTitle');
    if (planTitleEl) planTitleEl.innerHTML = DETAILS_TEMPLATES.title(plan);

    const statsContainer = document.getElementById('planStats');
    if (statsContainer) {
        const inv = getProductInventoryDetails(plan.name);
        const summary = getPlanSummary(plan.tree);
        let statsHtml = '';

        // Material Orders
        const planSpecificBuys = (inventoryState.buyingList || []).filter(item => 
            item.meta && item.meta.bp === currentActivePlanId
        );
        if (planSpecificBuys.length > 0) statsHtml += DETAILS_TEMPLATES.bpMaterialOrderList(planSpecificBuys);

        // Standard Boxes
        statsHtml += DETAILS_TEMPLATES.stockBox(inv.productName, inv.totalQty, inv.totalTT, inv.items);
        
        const shortfallItems = Object.entries(summary.shortfall);
        const elsewhereItems = Object.entries(summary.elsewhere);

        if (shortfallItems.length > 0) statsHtml += DETAILS_TEMPLATES.shortfallBox(shortfallItems);
        if (elsewhereItems.length > 0) statsHtml += DETAILS_TEMPLATES.elsewhereBox(elsewhereItems);
        if (shortfallItems.length === 0 && elsewhereItems.length === 0) statsHtml += DETAILS_TEMPLATES.successBox();
        
        statsContainer.innerHTML = statsHtml;
    }

    // 3. Render Tree Visual
    const treeRoot = document.getElementById('productionTree');
    if (treeRoot && typeof renderPlanTreeUI === 'function') {
        treeRoot.innerHTML = ''; 
        renderPlanTreeUI(plan.tree, treeRoot);
    }
}
// Predefined Helper for Stats HTML
function renderStatsHtml(summary) {
    const shortfallItems = Object.entries(summary.shortfall);
    const elsewhereItems = Object.entries(summary.elsewhere);
    
    let html = '';
    if (shortfallItems.length > 0) html += DETAILS_TEMPLATES.shortfallBox(shortfallItems);
    if (elsewhereItems.length > 0) html += DETAILS_TEMPLATES.elsewhereBox(elsewhereItems);
    
    return (html === '') ? DETAILS_TEMPLATES.successBox() : html;
}

/**
 * Helper to get inventory details for a product node.
 */
function getProductInventoryDetails(planName) {
    if (!inventoryState || !inventoryState.items) return { productName: planName, totalQty: 0, totalTT: "0.00", items: [] };
    
    const bp = cachedBlueprints.find(b => b.Name === planName || b.Product?.Name === planName);
    const productName = bp?.Product?.Name || planName;
    
    const matchingItems = Object.values(inventoryState.items).filter(item => {
        const itemName = (item.name || '');
        return itemName === productName && !itemName.toLowerCase().includes('blueprint');
    });

    const totalQty = matchingItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const totalTT = matchingItems.reduce((sum, item) => sum + (item.totalValue || 0), 0);
    
    const itemData = matchingItems.map(item => ({
        id: item.id, // CRITICAL: Pass the ID for the button action
        path: typeof getItemContainerPath === 'function' ? getItemContainerPath(item, inventoryState.items) : (item.location || 'N/A'),
        qty: item.quantity || 0,
        tt: (item.totalValue || 0).toFixed(2)
    }));

    return {
        productName: productName,
        totalQty: totalQty,
        totalTT: totalTT.toFixed(2),
        items: itemData
    };
}


/**
 * Recursively analyzes the production tree.
 * Now continues to list sub-materials even if the Blueprint is missing locally.
 */
function getPlanSummary(step, list = { shortfall: {}, elsewhere: {}, total: {} }) {
    const name = step.name;
    const isBP = step.isCraftable;
    
    if (!list.total[name]) list.total[name] = 0;
    list.total[name] += step.required;

    // --- BLUEPRINT LOGIC ---
    if (isBP && step.owned <= 0) {
        // If missing BP on planet, it's a shortfall
        if (!list.shortfall[name]) {
            list.shortfall[name] = { type: 'Blueprint', everywhere: step.totalEverywhere, qty: 1 };
        }
        // If it exists elsewhere, also note it in elsewhere for the UI hint
        if (step.totalEverywhere > 0 && !list.elsewhere[name]) {
            list.elsewhere[name] = { type: 'Blueprint', everywhere: step.totalEverywhere };
        }
    } 
    // --- MATERIAL LOGIC ---
    else if (!isBP && step.shortfall > 0) {
        // ALWAYS add to shortfall if the current planet is missing items
        if (!list.shortfall[name]) {
            list.shortfall[name] = { qty: 0, everywhere: step.totalEverywhere, type: 'Material' };
        }
        list.shortfall[name] = {
            qty: step.shortfall, // The amount missing ON PLANET
            everywhere: step.totalEverywhere,
            type: 'Material'
        };

        // If we have stock elsewhere, add a mirror entry to 'elsewhere' 
        // This keeps the "Items available on other planets" box populated for info
        if (step.totalEverywhere > step.owned) {
            list.elsewhere[name] = { 
                qty: step.totalEverywhere - step.owned, 
                everywhere: step.totalEverywhere, 
                type: 'Material' 
            };
        }
    }

    if (Array.isArray(step.subMaterials) && step.subMaterials.length > 0) {
        step.subMaterials.forEach(sub => getPlanSummary(sub, list));
    }
    
    return list;
}
async function revertPlanDecisions(bpName) {
    if (!bpName) return;
    
    let revertCount = 0;

    // 1. Scan decisions for matching Blueprint metadata
    Object.entries(inventoryState.decisions).forEach(([itemId, decision]) => {
        if (decision.type === 'CRAFT' && decision.meta && decision.meta.bp === bpName) {
            
            // Delete the decision
            delete inventoryState.decisions[itemId];
            
            // Return to Undecided Queue
            const idNum = isNaN(itemId) ? itemId : Number(itemId);
            if (!inventoryState.undecidedQueue.includes(idNum)) {
                inventoryState.undecidedQueue.unshift(idNum);
            }
            revertCount++;
        }
    });

    if (revertCount > 0) {
        await saveDecisions();

        // Refresh Inventory tables to remove items from the CRAFT list
        if (typeof renderInventory === 'function') {
            renderInventory(['SAVE', 'SELL_MU', 'SELL_TT', 'CRAFT']);
        }

        // Put them back in the Undecided UI
        if (typeof refreshUndecidedUI === "function") refreshUndecidedUI();
        
        // Update the current plan view to show items as "Missing" again
        if (currentActivePlanId !== null) {
            displayPlanDetails(currentActivePlanId);
        }
        
        // Final sync for any other global inventory tables
        if (typeof refreshAllInventoryTables === 'function') refreshAllInventoryTables();
        
        console.log(`Successfully reverted ${revertCount} CRAFT decisions for ${bpName}.`);
    }
    
    return revertCount;
}
async function deletePlan(planId) {
    const plan = craftingPlans.find(p => p.id === planId);
    if (!plan) return;

    if (!confirm(`Delete plan for ${plan.name}? This will revert all linked inventory items.`)) return;

    // 1. Use the logic from your revert button to clean up inventory
    await revertPlanDecisions(plan.name);

    // 2. Remove from state
    craftingPlans = craftingPlans.filter(p => p.id !== planId);
    savePlans();

    // 3. UI Update
    renderPlansList();
    document.getElementById('planDetailView').style.display = 'none';
    document.getElementById('planDetailPlaceholder').style.display = 'block';
}
function toggleAllNodes(expand) {
    const displayValue = expand ? 'block' : 'none';
    const rotationValue = expand ? 'rotate(0deg)' : 'rotate(-90deg)';

    const containers = document.querySelectorAll('.tree-child-container');
    containers.forEach(container => {
        container.style.display = displayValue;
    });

    const carets = document.querySelectorAll('.tree-caret');
    carets.forEach(caret => {
        caret.style.transform = rotationValue;
    });
}

window.quickSellSingle = function(itemId, ttValue) {
    const mu = prompt(`Enter MU% for this ${ttValue} PED stack:`, "105");
    if (mu === null || mu === "" || isNaN(mu)) return;

    // Use your existing logic: update state and mark for MU
    if (typeof updateDecision === 'function') {
        // We set currentActionType so your inventory logic knows it's an MU sell
        inventoryState.currentActionType = 'sell_mu'; 
        // Here you would call your update function. 
        // Note: You might need to tweak updateDecision to accept the MU value
        updateDecision(itemId, 'SELL_MU', parseFloat(mu));
        
        // Refresh UI
        if (typeof displayPlanDetails === 'function' && currentPlanId) {
            displayPlanDetails(currentPlanId);
        }
    }
    console.log(`Selling stack ${itemId} at ${mu}%`);
};

window.quickSellGroup = function(productName) {
    const mu = prompt(`Bulk Sell: Enter MU% for all ${productName} in stock:`, "105");
    if (mu === null || mu === "" || isNaN(mu)) return;

    const inv = getProductInventoryDetails(productName);
    inv.items.forEach(item => {
        if (typeof updateDecision === 'function') {
            updateDecision(item.id, 'SELL_MU', parseFloat(mu));
        }
    });
    
    alert(`Marked ${inv.items.length} stacks for sale at ${mu}%`);
    if (currentPlanId) displayPlanDetails(currentPlanId);
};
// ==========================================
// INITIALIZATION
// ==========================================
function populatePlanPlanetDropdown() {
    const planetSelect = document.getElementById('modalPlanPlanet');
    if (!planetSelect) return;

    // 1. Reset
    planetSelect.innerHTML = '<option value="ALL">All Locations (Global)</option>';

    // 2. Extract Names (Matches your InventoryManager logic)
    const planetNames = new Set();
    Object.values(inventoryState.items || {}).forEach(item => {
        if (item.location) {
            const loc = item.location.toUpperCase();
            
            if (loc === "CARRIED" || loc === "HUB") {
                planetNames.add(loc);
                return;
            }

            const match = loc.match(/STORAGE\s*\(([^)]+)\)/i);
            if (match && match[1]) {
                planetNames.add(match[1].trim().toUpperCase());
            }
        }
    });

    // 3. Sort and Append
    const sorted = Array.from(planetNames).sort((a, b) => {
        if (a === "CARRIED") return -1;
        if (b === "CARRIED") return 1;
        return a.localeCompare(b);
    });

    sorted.forEach(val => {
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = val;
        planetSelect.appendChild(opt);
    });
}
// Global DOM References for Crafting Plans

async function initCraftingPlansTab() {
    if (!PLAN_CREATE_BTN || !PLAN_MODAL) return;

    // --- 1. THE MASTER EVENT DELEGATOR (Electron/CSP Safe) ---
    const detailView = document.getElementById('planDetailView');
    if (detailView) {
        detailView.addEventListener('click', async (e) => {
            const target = e.target;

            // A. Revert All Decisions for this BP
            if (target.closest('#btnRevertDecisions')) {
                const bpName = target.closest('#btnRevertDecisions').dataset.bp;
                console.log(`Reverting Crafting Decisions for: ${bpName}`);
                await revertPlanDecisions(bpName);
                return;
            }

            // B. Expand/Collapse Tree
            if (target.id === 'btnExpandAll') return toggleAllNodes(true);
            if (target.id === 'btnCollapseAll') return toggleAllNodes(false);

            // C. Bulk Buy Shortfall
            if (target.id === 'btnBuyAllShortfall') {
                e.stopPropagation();
                const plan = craftingPlans.find(p => p.id === currentActivePlanId);
                if (plan) {
                    const summary = getPlanSummary(plan.tree);
                    bulkAddShortfallToBuyingList(summary.shortfall);
                }
                return;
            }

            // D. Stock Box Toggle
            const stockBox = target.closest('#stockBoxContainer');
            if (stockBox && !target.closest('button') && !target.closest('input')) {
                const tree = document.getElementById('stockLocationTree');
                const icon = document.getElementById('stockToggleIcon');
                if (tree) {
                    const isHidden = tree.style.display === 'none';
                    tree.style.display = isHidden ? 'block' : 'none';
                    if (icon) {
                        icon.innerHTML = isHidden ?
                            '<i class="fas fa-chevron-up"></i> Hide Locations' :
                            '<i class="fas fa-chevron-down"></i> Click to View Locations';
                    }
                }
                return;
            }

            // E. Toggle Shortfall Box
            if (target.closest('.toggle-shortfall-btn')) {
                const box = target.closest('.shortfall-box');
                const content = box?.querySelector('.shortfall-content');
                const icon = box?.querySelector('.toggle-icon');
                if (content && icon) {
                    const isHidden = content.style.display === 'none';
                    content.style.display = isHidden ? 'block' : 'none';
                    icon.textContent = isHidden ? '▼' : '▶';
                }
                return;
            }

            // F. Toggle Elsewhere Box
            if (target.closest('.toggle-elsewhere-btn')) {
                const box = target.closest('.elsewhere-box');
                const content = box?.querySelector('.elsewhere-content');
                const icon = box?.querySelector('.toggle-icon');
                if (content && icon) {
                    const isHidden = content.style.display === 'none';
                    content.style.display = isHidden ? 'block' : 'none';
                    icon.textContent = isHidden ? '▼' : '▶';
                }
                return;
            }

            // G. Individual Item Actions (Reset, Sell TT, Sell MU)
            const actionBtn = target.closest('[data-id]');
            if (actionBtn && (actionBtn.classList.contains('btn-reset-single') ||
                              actionBtn.classList.contains('btn-sell-single-tt') ||
                              actionBtn.classList.contains('btn-sell-single'))) {
                
                e.stopPropagation();
                const itemId = actionBtn.dataset.id;
                const plan = craftingPlans.find(p => p.id === currentActivePlanId);
                const meta = { bp: plan ? plan.name : 'Unknown' };

                if (actionBtn.classList.contains('btn-reset-single')) {
                    updateDecision(itemId, 'UNDECIDED');
                } else if (actionBtn.classList.contains('btn-sell-single-tt')) {
                    updateDecision(itemId, 'SELL_TT', meta);
                } else if (actionBtn.classList.contains('btn-sell-single')) {
                    const muInput = document.querySelector(`.mu-input-${itemId}`);
                    const muVal = muInput ? parseFloat(muInput.value) : 100;
                    updateDecision(itemId, 'SELL_MU', { mu: muVal, ...meta });
                }

                if (typeof renderInventoryTables === "function") renderInventoryTables();
                if (currentActivePlanId) displayPlanDetails(currentActivePlanId);
            }
        });
    }

    // --- 2. EXISTING MODAL & SEARCH LOGIC ---
    const closeModal = () => {
        PLAN_MODAL.classList.add('hidden');
        PLAN_MODAL.style.display = 'none';
    };

    const populateModalPlanPlanets = () => {
        if (!PLAN_PLANET_SELECT) return;
        PLAN_PLANET_SELECT.innerHTML = '<option value="ALL">All Locations (Global)</option>';
        const planetNames = new Set();
        Object.values(inventoryState.items || {}).forEach(item => {
            if (item.location) {
                const loc = item.location.toUpperCase();
                if (loc === "CARRIED" || loc === "HUB") { planetNames.add(loc); return; }
                const match = loc.match(/STORAGE\s*\(([^)]+)\)/i);
                if (match && match[1]) planetNames.add(match[1].trim().toUpperCase());
            }
        });
        Array.from(planetNames).sort().forEach(val => {
            const opt = document.createElement('option');
            opt.value = val; 
            opt.textContent = val;
            PLAN_PLANET_SELECT.appendChild(opt);
        });
    };

    PLAN_CREATE_BTN.addEventListener('click', () => {
        const groups = Object.values(inventoryState.items).reduce((acc, item) => {
            if (getItemType(item).toLowerCase().includes('blueprint')) {
                const name = item.name;
                if (!acc[name]) acc[name] = { name, totalQty: 0 };
                acc[name].totalQty += (item.quantity || 1);
            }
            return acc;
        }, {});
        modalBpCache = Object.values(groups).sort((a, b) => a.name.localeCompare(b.name));
        populateModalPlanPlanets();
        PLAN_MODAL.classList.remove('hidden');
        PLAN_MODAL.style.display = 'flex';
        PLAN_SEARCH_INPUT.focus();
    });

    PLAN_CANCEL_BTN.addEventListener('click', closeModal);
    PLAN_SEARCH_INPUT.addEventListener('input', (e) => updateModalList(e.target.value));

    PLAN_CONFIRM_BTN.addEventListener('click', async () => {
        const selectedBp = PLAN_MODAL_SELECT?.value;
        const qty = parseInt(PLAN_MODAL_QTY?.value) || 1;
        const selectedPlanet = PLAN_PLANET_SELECT?.value || "ALL";
        const allocSelect = document.getElementById('modalPlanAllocation');
        const allocationMode = allocSelect?.value || 'NONE';

        if (!selectedBp) return;
        closeModal();

        const fullTree = await resolveProductionStep(selectedBp, qty, true, selectedPlanet);
        if (allocationMode !== 'NONE') {
            await allocateInventoryToCrafting(fullTree, selectedBp, selectedPlanet, allocationMode);
        }

        const newPlan = { 
            id: Date.now(), 
            name: selectedBp, 
            targetQty: qty, 
            planet: selectedPlanet, 
            tree: fullTree, 
            timestamp: new Date().toLocaleString() 
        };

        craftingPlans.push(newPlan);
        savePlans();
        renderPlansList();
        displayPlanDetails(newPlan.id);
    });

    loadStoredPlans();
}

document.addEventListener('DOMContentLoaded', () => {
    // Hunting Toolbar -> Hunt Container
    const huntControls = ['searchHuntHistory', 'sortHuntHistory', 'toggleGroupsHuntHistory'];
    huntControls.forEach(id => {
        document.getElementById(id)?.addEventListener(id.includes('sort') ? 'change' : 'input', async () => {
            const hunts = await window.electronAPI.loadHuntHistory();
            renderHistoryToContainer(hunts, document.getElementById('huntHistoryContainer'), 'hunting');
        });
    });

    // Crafting Toolbar -> Crafting Container
    const craftControls = ['searchCraftHistory', 'sortCraftHistory', 'toggleGroupsCraftHistory'];
    craftControls.forEach(id => {
        document.getElementById(id)?.addEventListener(id.includes('sort') ? 'change' : 'input', async () => {
            const crafts = await window.electronAPI.loadCraftingHistory();
            renderHistoryToContainer(crafts, document.getElementById('craftingHistoryContainer'), 'crafting');
        });
    });

    // Handle Toggle specifically to sync the UI
    document.querySelectorAll('.toggleGroups').forEach(btn => {
        btn.addEventListener('click', toggleGrouping);
    });
	// 1. Initialize the Plans Tab Logic
    initCraftingPlansTab();
});