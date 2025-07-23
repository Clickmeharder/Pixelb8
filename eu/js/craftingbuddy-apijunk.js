 
let cachedBlueprints = [];

function fuzzyMatch(pattern, text) {
  pattern = pattern.toLowerCase();
  text = text.toLowerCase();

  let patternIdx = 0;
  let textIdx = 0;

  while (patternIdx < pattern.length && textIdx < text.length) {
    if (pattern[patternIdx] === text[textIdx]) {
      patternIdx++;
    }
    textIdx++;
  }

  return patternIdx === pattern.length;
}


function renderBlueprintList() {
  const saved = JSON.parse(localStorage.getItem('blueprints') || '[]');
  const filterContainer = document.getElementById('blueprintFilters');
  const listContainer = document.getElementById('blueprintList');
  const layoutToggle = document.getElementById('layoutToggle');

  if (!filterContainer || !listContainer || !layoutToggle) return;

  // Render filters once
  if (!document.getElementById('filterName')) {
    const uniqueBooks = [...new Set(saved.map(bp => bp.bpBook || '').filter(Boolean))];

    filterContainer.innerHTML = `
      <label id="filterlabel" style="width:95%;">🎛️ Filters
        <button onclick="clearBlueprintFilters()" id="clearBPfilterButt">❌ Clear</button>
      </label>
      <div id="filterOptionGroup">
        <label>
          <input type="text" id="filterName" placeholder="🔍 Name">
        </label>
        <label>
          <select id="filterBook">
            <option value="">📘 Book</option>
            ${uniqueBooks.map(book => `<option value="${book}">${book}</option>`).join('')}
          </select>
        </label>
        <label>
          <input type="text" id="filterMaterial" placeholder="🧪 Material">
        </label>
      </div>
    `;

    document.getElementById('filterName').addEventListener('input', renderBlueprintList);
    document.getElementById('filterBook').addEventListener('change', renderBlueprintList);
    document.getElementById('filterMaterial').addEventListener('input', renderBlueprintList);
  }

  const nameFilter = document.getElementById('filterName').value.toLowerCase();
  const bookFilter = document.getElementById('filterBook').value.toLowerCase();
  const matFilter = document.getElementById('filterMaterial').value.toLowerCase();

  const filtered = saved.filter(bp => {
    const nameMatch = fuzzyMatch(nameFilter, bp.itemName);
    const bookMatch = !bookFilter || (bp.bpBook && bp.bpBook.toLowerCase() === bookFilter);
    const matMatch = !matFilter || bp.materials.some(m => fuzzyMatch(matFilter, m.name));
    return nameMatch && bookMatch && matMatch;
  });

  if (filtered.length === 0) {
    listContainer.innerHTML = '<em>No matching blueprints.</em>';
    return;
  }

  const layout = document.querySelector('input[name="layout"]:checked').value;

  if (layout === 'cards') {
    listContainer.innerHTML = `
      <div class="blueprint-list cards-layout">
        ${filtered.map((bp, i) => `
          <div class="blueprint-item" title="Click to load blueprint">
            <div onclick="loadBlueprint(${i})" class="bp-clickable">
              <div class="bp-name">${bp.itemName}</div>
              <div class="bp-book">${bp.bpBook || ''}</div>
            </div>
            <button class="delete-bp" onclick="deleteBlueprint(${i}); event.stopPropagation();" title="Delete blueprint">🗑️</button>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    listContainer.innerHTML = `
      <ul class="blueprint-list list-layout">
        ${filtered.map((bp, i) => `
          <li class="blueprint-list-item" title="Click to load blueprint">
            <span onclick="loadBlueprint(${i})">
              <strong>${bp.itemName}</strong> ${bp.bpBook ? `- <em>${bp.bpBook}</em>` : ''}
            </span>
            <button class="delete-bp" onclick="deleteBlueprint(${i}); event.stopPropagation();" title="Delete blueprint">🗑️</button>
          </li>
        `).join('')}
      </ul>
    `;
  }
 renderFilteredBlueprints(filtered);
}

function renderAllBlueprintsList(filteredList) {
  const container = document.getElementById("allBlueprintsList");
/*   container.innerHTML = ""; */
  filteredList.forEach(bp => {
    const entry = document.createElement("div");
    entry.textContent = bp.Name;
    entry.addEventListener("click", async () => {
      /* document.getElementById("materialFilter").value = bp.Name; */
      /* container.classList.add("hidden"); */
      document.getElementById("showAllBlueprintsBtn").textContent = "nexus hacker";
      await loadBlueprintByName(bp.Name);
    });
    container.appendChild(entry);
  });
}


function loadBlueprint(index) {
  const saved = JSON.parse(localStorage.getItem('blueprints') || '[]');
  const bp = saved[index];
  if (!bp) return;

  document.getElementById('itemName').value = bp.itemName;
  document.getElementById('maxTT').value = bp.maxTT;
  document.getElementById('bpType').value = bp.bpType;
  document.getElementById('bpMu').value = bp.bpMu;
  document.getElementById('sellMu').value = bp.sellMu;
  document.getElementById('successRate').value = bp.successRate;
  document.getElementById('residuePerSuccess').value = bp.residuePerSuccess;
  document.getElementById('clicks').value = bp.clicks;
  document.getElementById('bpBook').value = bp.bpBook || '';

  document.getElementById('materials').innerHTML = '';
  materialIndex = 0;
  bp.materials.forEach(m => addMaterial(m.name, m.qty, m.tt, m.mu));
  toggleBpMuField();
}

function resetBlueprintFieldsNoBlanks() {
  document.querySelectorAll('.eu-blueprint input').forEach(input => {
    if (input.id === 'materialFilter') return; // ✅ Don't clear this input

    if (input.type === 'number') input.value = '';
    if (input.type === 'text') input.value = '';
  });

  document.querySelectorAll('.eu-blueprint select').forEach(select => {
    select.selectedIndex = 0;
  });

  document.getElementById('successRate').value = 38;
  document.getElementById('nearSuccessRate').value = 50;
  document.getElementById('failRate').value = 12;

  const qvscSlider = document.getElementById('qvsc');
  qvscSlider.value = 0;
  document.getElementById('qvscLabel').innerText = '0%';
  updateRatesFromSlider();

  const materialsContainer = document.getElementById('materials');
  materialsContainer.innerHTML = '';

  if (typeof materialIndex !== 'undefined') {
    materialIndex = 0;
  }
}


function multiFieldFilter(query, blueprints) {
  const lowerQuery = query.toLowerCase();

  // Handle level:x input for filtering by level
  if (lowerQuery.startsWith("level:")) {
    const level = parseInt(lowerQuery.split(":")[1]);
    if (!isNaN(level)) {
      return blueprints.filter(bp => bp.Properties?.Level === level);
    }
  }

  return blueprints.filter(bp => {
    return (
      bp.Name.toLowerCase().includes(lowerQuery) ||
      (bp.Product?.Name?.toLowerCase().includes(lowerQuery)) ||
      (bp.Properties?.Type?.toLowerCase().includes(lowerQuery)) ||
      (bp.Profession?.Name?.toLowerCase().includes(lowerQuery)) ||
      (bp.Book?.Name?.toLowerCase().includes(lowerQuery)) ||
      bp.Materials?.some(mat => mat.Item.Name.toLowerCase().includes(lowerQuery))
    );
  });
}

function renderFilteredBlueprints(filteredList) {
  const datalist = document.getElementById("bpList");
  datalist.innerHTML = "";
  filteredList.forEach(bp => {
    const option = document.createElement("option");
    option.value = bp.Name;
    datalist.appendChild(option);
  });
}

async function populateNexusDropdown() {
  try {
    const spinner = document.getElementById("bpLoadingSpinner");
    if (spinner) spinner.style.display = "block";

    const res = await fetch("https://api.entropianexus.com/blueprints");
    const blueprints = await res.json();
    cachedBlueprints = blueprints;

    renderFilteredBlueprints(blueprints);

    if (spinner) spinner.style.display = "none";
  } catch (err) {
    console.error("Failed to load blueprint list:", err);
  }
}

function showMarkupReminder() {
  const popup = document.getElementById("markupReminderPopup");
  if (popup) {
    popup.style.display = "block";
  }
}

async function loadBlueprintByName(name) {
  try {
    const res = await fetch("https://api.entropianexus.com/blueprints/" + encodeURIComponent(name));
    const bp = await res.json();

    resetBlueprintFieldsNoBlanks();
    document.getElementById("itemName").value = bp.Product?.Name || bp.Name || '';
    document.getElementById("bpBook").value = bp.Book?.Name || '';
    document.getElementById("bpLevel").value = bp.Properties?.Level || 0;
    document.getElementById("bpType").value = "Unlimited";
    document.getElementById("bpMu").value = 105;
    document.getElementById("qr").value = 1;
    document.getElementById("sellMu").value = 101;

    const totalTT = bp.Materials.reduce((sum, mat) => {
      const unitTT = mat.Item?.Properties?.Economy?.MaxTT || 0;
      return sum + mat.Amount * unitTT;
    }, 0);
    document.getElementById("maxTT").value = totalTT.toFixed(2);

    bp.Materials.forEach((mat) => {
      const name = mat.Item?.Name || "Unknown Material";
      const qty = mat.Amount || 1;
      const tt = mat.Item?.Properties?.Economy?.MaxTT || 0.01;
      const mu = 101;
      addMaterial(name, qty, tt, mu);
    });

    calculate();
    showMarkupReminder();
  } catch (err) {
    console.error("Failed to load blueprint data:", err);
    alert("Failed to load blueprint. Please try again.");
  }
}
// New & improved change listener
document.getElementById("materialFilter").addEventListener("change", async (e) => {
  const name = e.target.value;
  const match = cachedBlueprints.find(bp => bp.Name === name);
  if (!match) return;
  await loadBlueprintByName(name);
});
document.getElementById("materialFilter").addEventListener("change", async () => {
  const name = document.getElementById("materialFilter").value;
  const datalist = document.getElementById("bpList");

  const match = Array.from(datalist.options).some(opt => opt.value === name);
  if (!match) return;

  try {
    const res = await fetch("https://api.entropianexus.com/blueprints/" + encodeURIComponent(name));
    const bp = await res.json();

    resetBlueprintFieldsNoBlanks();
    document.getElementById("itemName").value = bp.Product?.Name || bp.Name || '';
    document.getElementById("bpBook").value = bp.Book?.Name || '';
    document.getElementById("bpLevel").value = bp.Properties?.Level || 0;
    document.getElementById("bpType").value = "Unlimited";
    document.getElementById("bpMu").value = 105;
    document.getElementById("qr").value = 1;
    document.getElementById("sellMu").value = 101;

    const totalTT = bp.Materials.reduce((sum, mat) => {
      const unitTT = mat.Item?.Properties?.Economy?.MaxTT || 0;
      return sum + mat.Amount * unitTT;
    }, 0);
    document.getElementById("maxTT").value = totalTT.toFixed(2);

    bp.Materials.forEach((mat) => {
      const name = mat.Item?.Name || "Unknown Material";
      const qty = mat.Amount || 1;
      const tt = mat.Item?.Properties?.Economy?.MaxTT || 0.01;
      const mu = 101;
      addMaterial(name, qty, tt, mu);
    });

    calculate();
    showMarkupReminder();

  } catch (err) {
    console.error("Failed to load blueprint data:", err);
    alert("Failed to load blueprint. Please try again.");
  }
});

document.getElementById("materialFilter").addEventListener("input", (e) => {
  const query = e.target.value.trim();
  const spinner = document.getElementById("bpLoadingSpinner");
  if (spinner) spinner.style.display = "block";

  const filtered = query
    ? multiFieldFilter(query, cachedBlueprints)
    : cachedBlueprints;

  renderFilteredBlueprints(filtered);
  renderAllBlueprintsList(filtered);

  if (spinner) spinner.style.display = "none";
});


document.getElementById("showAllBlueprintsBtn").addEventListener("click", () => {
  const list = document.getElementById("allBlueprintsList");
   list.classList.toggle("hidden"); 

  const label = list.classList.contains("hidden") ? "Turn On NexusHacker" : "Turn Off NexusHacker";
  document.getElementById("showAllBlueprintsBtn").textContent = label;

  // show full list by default
  renderAllBlueprintsList(cachedBlueprints);
});

document.addEventListener('DOMContentLoaded', () => {
  populateNexusDropdown();
  renderAllBlueprintsList(cachedBlueprints);
});