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
    <button onclick="removeMaterial(${materialIndex})" >X</button>
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
  const clicks = parseInt(document.getElementById('clicks').value);
  const sellMu = parseFloat(document.getElementById('sellMu').value) / 100;
  const successRate = parseFloat(document.getElementById('successRate').value) / 100;
  const nearSuccessRate = parseFloat(document.getElementById('nearSuccessRate').value) / 100;
  const residuePerSuccess = parseFloat(document.getElementById('residuePerSuccess').value);
  const bpType = document.getElementById('bpType').value;
  const bpMu = parseFloat(document.getElementById('bpMu').value) / 100;
  const itemName = document.getElementById('itemName').value;
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
    <h3>📊 Results for: <em>${itemName}</em></h3>
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
    itemName: document.getElementById('itemName').value,
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
addMaterial('Nanocube', 2, 0.01, 101);


function toggleExpand(id, btn) {
  const content = document.getElementById(id);
  const isExpanded = content.classList.toggle('expanded');
  btn.textContent = `${id} ${isExpanded ? '▲' : '▼'}`;
}

document.addEventListener('DOMContentLoaded', () => {
  toggleBpMuField();
});
