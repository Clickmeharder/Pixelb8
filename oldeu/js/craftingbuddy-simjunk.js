
  const modal = document.getElementById('historyModal');
  const openBtn = document.getElementById('openHistoryModal');
  const closeBtn = document.querySelector('.modal .close');

  openBtn.onclick = () => {
    modal.style.display = 'block';
  };

  closeBtn.onclick = () => {
    modal.style.display = 'none';
  };

  window.onclick = (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  };

function saveCraftingSession(session) {
  const history = JSON.parse(localStorage.getItem('craftingHistory')) || [];
  history.push(session);
  localStorage.setItem('craftingHistory', JSON.stringify(history));
}

function loadCraftingHistory() {
  return JSON.parse(localStorage.getItem('craftingHistory')) || [];
}

function populateDropdown() {
  const history = loadCraftingHistory();
  const selector = document.getElementById('loadBlueprintSelect');
  selector.innerHTML = '<option value="">-- Select Blueprint History --</option>';

  const seen = new Set();
  history.forEach((session, index) => {
    if (!seen.has(session.blueprintName)) {
      seen.add(session.blueprintName);
      const option = document.createElement('option');
      option.value = index;
      option.textContent = session.blueprintName;
      selector.appendChild(option);
    }
  });
}

function saveSessionFromForm() {
  const session = {
	blueprintName: document.getElementById('blueprintName').value,
	planet: document.getElementById('planet').value,
	date: document.getElementById('date').value,
	time: document.getElementById('time').value,
	playerSkillBefore: parseFloat(document.getElementById('playerSkillBefore').value),
	playerSkillAfter: parseFloat(document.getElementById('playerSkillAfter').value),
	qrBefore: parseFloat(document.getElementById('qrBefore').value),
	qrAfter: parseFloat(document.getElementById('qrAfter').value),
	isQrFull: false,
	clickCount: parseInt(document.getElementById('clickCount').value),
	successRate: parseFloat(document.getElementById('successRate').value),
	residueReturned: parseFloat(document.getElementById('residueReturned').value),
	totalReturnTT: parseFloat(document.getElementById('totalReturnTT').value),
	itemReturns: [],
	materialsUsed: [],
	lootedBlueprints: [],
	bigHits: []
  };
  saveCraftingSession(session);
  populateDropdown();
}

function loadSessionFromDropdown() {
  const index = document.getElementById('loadBlueprintSelect').value;
  if (index === "") return;

  const session = loadCraftingHistory()[index];
  if (!session) return;

  document.getElementById('blueprintName').value = session.blueprintName;
  document.getElementById('planet').value = session.planet;
  document.getElementById('date').value = session.date;
  document.getElementById('time').value = session.time;
  document.getElementById('playerSkillBefore').value = session.playerSkillBefore;
  document.getElementById('playerSkillAfter').value = session.playerSkillAfter;
  document.getElementById('qrBefore').value = session.qrBefore;
  document.getElementById('qrAfter').value = session.qrAfter;
  document.getElementById('clickCount').value = session.clickCount;
  document.getElementById('successRate').value = session.successRate;
  document.getElementById('residueReturned').value = session.residueReturned;
  document.getElementById('totalReturnTT').value = session.totalReturnTT;
}

window.addEventListener('DOMContentLoaded', () => {
  populateDropdown();
  document.getElementById('loadBlueprintSelect').addEventListener('change', loadSessionFromDropdown);
});



// sim junk

const simModal = document.getElementById('simulationModal');
const closeSimBtn = document.getElementById('closeSimulationModal');

function openSimulationModal() {
  simModal.style.display = 'block';
}

closeSimBtn.onclick = () => {
  simModal.style.display = 'none';
  document.getElementById('simLog').innerHTML = '<p class="sim-message">Click "Start Simulation" to begin...</p>';
  document.getElementById('simProgressBar').style.width = '0%';
}

window.onclick = (event) => {
  if (event.target === simModal) {
    simModal.style.display = 'none';
  }
}

function openSimulationModal() {
  const simModal = document.getElementById('simulationModal');
  if (simModal) {
    simModal.style.display = 'block';
    document.getElementById('simLog').innerHTML = '';
    document.getElementById('simProgressBar').style.width = '0%';
  }
}

function closeSimulationModal() {
  const simModal = document.getElementById('simulationModal');
  if (simModal) {
    simModal.style.display = 'none';
  }
}

function delay(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function simulateRunFromUI(clicks, isComponent, useResidue) {
  try {
    openSimulationModal();

    const logBox = document.getElementById('simLog');
    const progressBar = document.getElementById('simProgressBar');
    if (!logBox || !progressBar) {
      throw new Error("Simulation elements missing from the DOM.");
    }

    // Get blueprint values from UI
    const maxTT = parseFloat(document.getElementById('maxTT')?.value || '1');
    const qr = parseFloat(document.getElementById('qr')?.value || '0');
    const bpLevel = parseInt(document.getElementById('bpLevel')?.value || '1');
    const playerLevel = parseInt(document.getElementById('playerLevel')?.value || bpLevel);
    const slider = parseInt(document.getElementById('qvsc')?.value || '0');

    const multiplierChance = parseFloat(document.getElementById('multiplierChance')?.value || '0.015');
    const multiplierMin = parseFloat(document.getElementById('multiplierMin')?.value || '2');
    const multiplierMax = parseFloat(document.getElementById('multiplierMax')?.value || '17');

    const totalCost = parseFloat(document.getElementById('result-cost')?.textContent || '0');
    const costPerClick = totalCost / (clicks || 1);
    const skillFactor = Math.min(playerLevel / (bpLevel + 5), 1);

    const getRates = () => {
      const baseSuccess = 0.20 + (qr * 0.75) + (skillFactor * 0.05);
      const clampedSuccess = Math.min(baseSuccess, 0.95);
      const clampedNear = Math.max(Math.min(0.75 - (qr * 0.5), 0.85), 0.05);
      const conditionMod = slider / 100;
      return {
        success: clampedSuccess - conditionMod * (clampedSuccess - 0.05),
        nearSuccess: clampedNear - conditionMod * (clampedNear - 0.10)
      };
    };

    // Stats
    let successCount = 0, nearSuccessCount = 0, failCount = 0;
    let residueUsed = 0, totalReturnTT = 0, stackReturn = 0, matReturn = 0;
    let bpDrops = 0, gemDrops = 0, costTT = 0;

    for (let i = 0; i < clicks; i++) {
      const { success, nearSuccess } = getRates();
      const roll = Math.random();
      const multRoll = Math.random();

      let outcome = 'Fail';
      let clickTT = 0;
      let extraInfo = '';
      costTT += costPerClick;

      if (roll < success) {
        outcome = 'Success';
        successCount++;

        const multiplier = multRoll < multiplierChance
          ? (Math.random() * (multiplierMax - multiplierMin)) + multiplierMin
          : 1;

        clickTT = Math.min(maxTT * multiplier, 1000);

        if (isComponent) {
          const stackQty = Math.ceil(clickTT / maxTT);
          stackReturn += stackQty;
          extraInfo += ` 🧱 x${stackQty}`;
        } else {
          const itemTT = Math.min(clickTT, maxTT);
          totalReturnTT += itemTT;

          if (useResidue && itemTT < maxTT) {
            const residueFill = maxTT - itemTT;
            residueUsed += residueFill;
            totalReturnTT += residueFill;
            extraInfo += ` 🧪 +${residueFill.toFixed(2)} PED`;
          }

          const overflow = clickTT > maxTT ? clickTT - maxTT : 0;
          if (overflow > 0) {
            matReturn += overflow;
            extraInfo += ` 💥 +${overflow.toFixed(2)} PED`;
          }
        }

        if (Math.random() < 0.01) {
          bpDrops++;
          const isLimited = Math.random() < 0.8;
          const bpQty = isLimited ? (Math.random() * 0.99 + 0.01).toFixed(2) : '1.00';
          extraInfo += ` 📜 ${isLimited ? `${bpQty}x (L)` : '1x UL'}`;
        }

        if (Math.random() < 0.0015) {
          gemDrops++;
          extraInfo += ' 💎 Rare Gem';
        }

      } else if (roll < success + nearSuccess) {
        outcome = 'Near Success';
        nearSuccessCount++;

        const returnTT = Math.random() * (maxTT * 0.9);
        matReturn += returnTT;
        extraInfo += ` 💰 ${returnTT.toFixed(2)} PED`;

        if (multRoll < 0.005) {
          const bonusTT = Math.random() * 25 + 5;
          matReturn += bonusTT;
          extraInfo += ` ⚡ +${bonusTT.toFixed(2)} PED`;
        }

      } else {
        failCount++;
      }

      logBox.innerHTML += `<p>🛠️ Click ${i + 1}: <strong>${outcome}</strong>${extraInfo ? ' → ' + extraInfo : ''}</p>`;
      logBox.scrollTop = logBox.scrollHeight;
      progressBar.style.width = `${((i + 1) / clicks) * 100}%`;

      await delay(200); // Slow down to make it readable
    }

    // Summary
    let summary = `
      <hr>
      <p><strong>✅ Simulation Complete</strong></p>
      <p>🎯 Success: ${successCount}</p>
      <p>🤏 Near Success: ${nearSuccessCount}</p>
      <p>❌ Fail: ${failCount}</p>`;
    if (stackReturn) summary += `<p>🧱 Stack Items: ${stackReturn}</p>`;
    if (totalReturnTT) summary += `<p>💵 Item TT: ${totalReturnTT.toFixed(2)} PED</p>`;
    if (residueUsed) summary += `<p>🧪 Residue Used: ${residueUsed.toFixed(2)} PED</p>`;
    if (matReturn) summary += `<p>🔄 Materials Returned: ${matReturn.toFixed(2)} PED</p>`;
    if (bpDrops) summary += `<p>📜 BPs: ${bpDrops}</p>`;
    if (gemDrops) summary += `<p>💎 Gems: ${gemDrops}</p>`;
    summary += `<p>💸 Total Cost: ${costTT.toFixed(2)} PED</p>`;

    logBox.innerHTML += summary;

  } catch (err) {
    console.error("Simulation failed:", err);
    alert("Simulation failed. Check console for details.");
    closeSimulationModal();
  }
}

function startLiveSimulation() {
  const clickCount = prompt("How many clicks would you like to simulate?");
  const clicks = parseInt(clickCount);
  if (!clicks || clicks <= 0) {
    alert("Invalid click count.");
    return;
  }

  const isComponent = confirm("Is this a component blueprint?");
  let useResidue = false;

  if (!isComponent) {
    const canUse = confirm("Can this blueprint use residue?");
    if (canUse) {
      useResidue = confirm("Do you want to use residue?");
    }
  }

  simulateRunFromUI(clicks, isComponent, useResidue);
}