//======================================================================
// ================= Cached Data =================
let cachedWeapons = [];
let cachedAmplifiers = [];
let cachedVisionAttachments = [];
let cachedScopes = [];
let cachedAbsorbers = [];

// Current selections
let currentWeapon = null;
let currentAmplifier = null;
let currentVision1 = null;
let currentVision2 = null;
let currentScope = null;
let currentAbsorber = null;



// ================= Utility: Populate Dropdown =================
function populateDropdown(inputElement, datalistId, items) {
  if (!inputElement) return;
  const datalist = document.getElementById(datalistId);
  if (!datalist) return;

  datalist.innerHTML = "";
  items.forEach(item => {
    const opt = document.createElement("option");
    opt.value = item.Name;
    datalist.appendChild(opt);
  });

  inputElement.value = "";
}

// ================= Populate Data =================
async function populateWeaponDropdown() {
  const input = document.querySelector(".weapon-select");
  try {
    const res = await fetch("https://api.entropianexus.com/weapons");
    const data = await res.json();
    cachedWeapons = Array.isArray(data) ? data : data.items || [];
    populateDropdown(input, "weapon-options", cachedWeapons);
  } catch (err) {
    console.error("Failed to fetch weapons:", err);
  }
}

async function populateAmplifierDropdown() {
  const input = document.querySelector(".amplifier-select");
  try {
    const res = await fetch("https://api.entropianexus.com/weaponamplifiers");
    const data = await res.json();
    cachedAmplifiers = Array.isArray(data) ? data : data.items || [];
    populateDropdown(input, "amplifier-options", cachedAmplifiers);
  } catch (err) {
    console.error("Failed to fetch amplifiers:", err);
  }
}

async function populateVisionDropdown() {
  const input1 = document.querySelector(".vision1-select");
  const input2 = document.querySelector(".vision2-select");
  try {
    const res = await fetch("https://api.entropianexus.com/weaponvisionattachments");
    const data = await res.json();
    cachedVisionAttachments = Array.isArray(data) ? data : data.items || [];
    populateDropdown(input1, "vision1-options", cachedVisionAttachments);
    populateDropdown(input2, "vision2-options", cachedVisionAttachments);
  } catch (err) {
    console.error("Failed to fetch vision attachments:", err);
  }
}

async function populateScopeDropdown() {
  const input = document.querySelector(".scope-select");
  try {
    const res = await fetch("https://api.entropianexus.com/weaponvisionattachments");
    const data = await res.json();
    cachedScopes = Array.isArray(data) ? data : data.items || [];
    populateDropdown(input, "scope-options", cachedScopes);
  } catch (err) {
    console.error("Failed to fetch scopes:", err);
  }
}

async function populateAbsorberDropdown() {
  const input = document.querySelector(".absorber-select");
  try {
    const res = await fetch("https://api.entropianexus.com/absorbers");
    const data = await res.json();
    cachedAbsorbers = Array.isArray(data) ? data : data.items || [];
    populateDropdown(input, "absorber-options", cachedAbsorbers);
  } catch (err) {
    console.error("Failed to fetch absorbers:", err);
  }
}

// ================= Select Functions =================
function selectWeapon(name) {
  currentWeapon = cachedWeapons.find(w => w.Name === name);
  console.log("Weapon Selected:", currentWeapon);
  updateMainStats();
}

function selectAmplifier(name) {
  currentAmplifier = cachedAmplifiers.find(a => a.Name === name);
  console.log("amp Selected:", currentAmplifier);
  updateMainStats();
}

function selectVision1(name) {
  currentVision1 = cachedVisionAttachments.find(v => v.Name === name);
  console.log("Sight 1 Selected:", currentVision1);
  updateMainStats();
}

function selectVision2(name) {
  currentVision2 = cachedVisionAttachments.find(v => v.Name === name);
  console.log("Sight 2 Selected:", currentVision2);
  updateMainStats();
}

function selectScope(name) {
  currentScope = cachedScopes.find(s => s.Name === name);
  console.log("Scope Selected:", selectScope);
  updateMainStats();
}

function selectAbsorber(name) {
  currentAbsorber = cachedAbsorbers.find(a => a.Name === name);
  console.log("Extender Selected:", currentAbsorber);
  updateMainStats();
}


function updateMainStats() {
  // Keep input values visible
  if (currentWeapon) document.querySelector(".weapon-select").value = currentWeapon.Name;
  if (currentAmplifier) document.querySelector(".amplifier-select").value = currentAmplifier?.Name || "";
  if (currentVision1) document.querySelector(".vision1-select").value = currentVision1?.Name || "";
  if (currentVision2) document.querySelector(".vision2-select").value = currentVision2?.Name || "";
  if (currentScope) document.querySelector(".scope-select").value = currentScope?.Name || "";
  if (currentAbsorber) document.querySelector(".absorber-select").value = currentAbsorber?.Name || "";

  // Determine what to display based on view mode
  const weaponContent = viewModes.weapon === "json" 
      ? JSON.stringify(currentWeapon, null, 2) 
      : formatWeaponStats(currentWeapon);

  const amplifierContent = viewModes.amplifier === "json"
      ? JSON.stringify(currentAmplifier, null, 2)
      : formatAttachmentStats(currentAmplifier);

  const vision1Content = viewModes.vision1 === "json"
      ? JSON.stringify(currentVision1, null, 2)
      : formatAttachmentStats(currentVision1);

  const vision2Content = viewModes.vision2 === "json"
      ? JSON.stringify(currentVision2, null, 2)
      : formatAttachmentStats(currentVision2);

  const scopeContent = viewModes.scope === "json"
      ? JSON.stringify(currentScope, null, 2)
      : formatAttachmentStats(currentScope);

  const absorberContent = viewModes.absorber === "json"
      ? JSON.stringify(currentAbsorber, null, 2)
      : formatAttachmentStats(currentAbsorber);

  document.getElementById("weapon-base-stats-content").textContent = weaponContent || "Select a weapon to view stats";
  document.getElementById("amplifier-base-stats-content").textContent = amplifierContent || "Select an amplifier to view stats";
  document.getElementById("vision1-base-stats-content").textContent = vision1Content || "Select a vision attachment to view stats";
  document.getElementById("vision2-base-stats-content").textContent = vision2Content || "Select a vision attachment to view stats";
  document.getElementById("scope-base-stats-content").textContent = scopeContent || "Select a scope to view stats";
  document.getElementById("absorber-base-stats-content").textContent = absorberContent || "Select an absorber to view stats";
}

function getCleanWeaponData(weapon) {
  if (!weapon) return null;

  return {
    Name: weapon.Name,
    Properties: weapon.Properties,
    Ammo: weapon.Ammo,
    ProfessionHit: weapon.ProfessionHit,
    ProfessionDmg: weapon.ProfessionDmg,
    EffectsOnEquip: weapon.EffectsOnEquip,
    EffectsOnUse: weapon.EffectsOnUse,
    Tiers: weapon.Tiers,
    Links: weapon.Links
  };
}



// ================= Entropia Nexus Formulas (Read-Only) =================
// 📖 Static reference formulas (uneditable, from Entropia Wiki)
const entropiaFormulas = {
  hitAbility: `(Non-SIB) HA = 4 + 0.06 * Hit Level
(SIB) HA = 6 + ((Hit Level - Recommended) / (Max - Recommended)) * 4`,

  critAbility: `(Non-SIB) CHA = √Hit Level
(SIB) CHA = √((Hit Level - Recommended) / (Max - Recommended)) * 10`,

  hitRate: `Hit Rate = (Hit Ability + 80) / 100`,

  dpp: `DPP = Effective Damage / (Ammo Cost + Decay Cost)`,

  minDamage: `(Non-SIB) MinDamage = 25% + (0.75 * (DMG Level / Max DMG Level))
(SIB) MinDamage = 50% + (0.50 * (DMG Level - Recommended) / (Max - Recommended))`,

  apm: `⚠Proper Formula Unknown⚠\nCurrent approximation:
APM = BaseAPM * (0.5 + 0.5 * (Hit Level - Start) / (Max - Start))
(Capped between MinAPM and BaseAPM)`,

  reloadTime: `⚠Proper Formula Unknown⚠\nCurrent approximation:
Reload Time = 60 / APM`
};


// 🛠️ Editable + usable versions (your logic, actual calculations)
const weaponFormulas = {
  // ✅ Capped at 10
hitAbility: (hitLvl, start, end, isSIB) => {
  if (start == null || end == null) {return 10;}
  if (hitLvl < start) return 0;
  if (hitLvl >= end) return 10;
  let result;
  if (isSIB) {
    const progress = (hitLvl - start) / (end - start);
    result = 6 +  progress * 4;  // SIB: 6 → 10
    console.log("hitAbility SIB | hitLvl:", hitLvl, "progress:", progress.toFixed(3), "result:", result.toFixed(3));
  } else {
    result = 4 + 0.06 * hitLvl; // Non-SIB linear
    console.log("hitAbility Non-SIB | hitLvl:", hitLvl, "result:", result.toFixed(3));
  }

  return result;
},

critAbility: (hitLvl, start, end, isSIB) => {
  if (hitLvl < start) return 0;
  if (hitLvl >= end) return 10;

  let result;
  if (isSIB) {
    const progress = (hitLvl - start) / (end - start);
    result = Math.sqrt(progress) * 10;  // SIB: sqrt scaling 0 → 10
    console.log("critAbility SIB | hitLvl:", hitLvl, "progress:", progress.toFixed(3), "result:", result.toFixed(3));
  } else {
    result = Math.sqrt(hitLvl);         // Non-SIB: sqrt(hitLvl)
    console.log("critAbility Non-SIB | hitLvl:", hitLvl, "result:", result.toFixed(3));
  }

  return result;
},

  hitRate: (HA) => (HA + 80) / 100,
  dpp: (effectiveDamage, costPerUsePEC) => costPerUsePEC > 0 ? effectiveDamage / costPerUsePEC : 0,
  // 🔥 Editable versions of APM + Reload
  apmFromHitLvl: (hitLvl, start, end, baseAPM, minAPM = 0) => {
    if (hitLvl <= start) return minAPM;
    if (hitLvl >= end) return baseAPM;
    const t = (hitLvl - start) / (end - start);
    return minAPM + (baseAPM - minAPM) * t;
  },
  critChance: (CA) => Math.min(0.02, (CA / 10) * 0.02),
  critDamage: () => 1.0,
  reloadTime: (apm) => 60 / apm,
  // ✅ Min Damage Percent (actual function)
  minDamagePercent: (dmgLvl, start, end) => {
    const baseMin = 0.25; // 25% minimum if skill < start
    const maxPercent = 0.5; // 50% max of weapon damage
    if (dmgLvl < start) return baseMin;
    const scale = Math.min(1, (dmgLvl - start) / (end - start));
    return baseMin + scale * (maxPercent - baseMin);
  },
  // ✅ Effective Damage (uses min dmg%, hitRate, crit chance)
effectiveDamage: (minDmgPercent, maxDamage, hitRate, critChance, critMultiplier = 2) => {
  const minDmg = maxDamage * minDmgPercent;
  const avgNormal = (minDmg + maxDamage) / 2;
  const avgCrit = avgNormal * critMultiplier;  // crits scale off avg, not max
  const expectedDamage = (1 - critChance) * avgNormal + critChance * avgCrit;
  return expectedDamage * hitRate;
}

};
// helper to format labels nicely
function formatKeyLabel(key) {
  if (key === "apmFromHitLvl") return "APM";
  if (key === "reloadTime") return "Reload Time";
  return key;
}
// ================= Display Formulas UI =================
/* function displayFormulas() {
  const formulaDiv = document.getElementById("LoadoutFormulas");
  if (!formulaDiv) return;

  formulaDiv.innerHTML = `
    <h4>Entropia Wiki Formulas (Read-Only)</h4>
    <ul>
      ${Object.keys(entropiaFormulas).map(key => `
        <li><strong>${key}:</strong><pre>${entropiaFormulas[key]}</pre></li>
      `).join('')}
    </ul>

    <h4>Editable Weapon Formulas</h4>
    <ul>
      ${Object.keys(weaponFormulas).map(key => `
        <li>
          <label>${key}:</label><br>
          <textarea id="formula_${key}" style="width:100%;height:60px;">${weaponFormulas[key].toString()}</textarea>
        </li>
      `).join('')}
    </ul>
    <button id="applyFormulas">Apply Formulas</button>
  `;

  document.getElementById("applyFormulas").addEventListener("click", () => {
    Object.keys(weaponFormulas).forEach(key => {
      try {
        weaponFormulas[key] = eval(document.getElementById(`formula_${key}`).value);
      } catch(e) {
        console.error(`Error applying formula ${key}:`, e);
        alert(`Error in formula ${key}. Check console for details.`);
      }
    });
    alert("Formulas updated!");
  });
} */
function displayFormulas() {
  const formulaDiv = document.getElementById("LoadoutFormulas");
  if (!formulaDiv) return;

  formulaDiv.innerHTML = `
    <h4>Entropia Wiki Formulas (Read-Only)</h4>
    <ul>
      ${Object.keys(entropiaFormulas).map(key => `
        <li><strong>${key}:</strong><pre>${entropiaFormulas[key]}</pre></li>
      `).join('')}
    </ul>
  `;
}
displayFormulas(); 
// ================= Main stats function =================
// ===== Core calculation function (reusable) =====
function formatWeaponStats(weapon) {
  if (!weapon) return { display: "Select a weapon to view stats", data: null };

  displayFormulas(); // show formulas

  const cleanData = getCleanWeaponData(weapon);
  const damage = weapon.Properties.Damage || {};
  const maxDamage = Object.values(damage).filter(v => v != null).reduce((sum, v) => sum + v, 0);
  const damageTypes = Object.entries(damage)
    .filter(([_, v]) => v != null && v !== 0)
    .map(([type, v]) => `${type}: ${v}`).join("\n  ");

  const hitSkillInput = Number(document.getElementById("hitSkill")?.value || 0);
  const dmgSkillInput = Number(document.getElementById("dmgSkill")?.value || 0);

  const hitSkillStart = weapon.Properties.Skill?.Hit?.LearningIntervalStart ?? 0;
  const hitSkillEnd = weapon.Properties.Skill?.Hit?.LearningIntervalEnd ?? 100;
  const dmgSkillStart = weapon.Properties.Skill?.Dmg?.LearningIntervalStart ?? 0;
  const dmgSkillEnd = weapon.Properties.Skill?.Dmg?.LearningIntervalEnd ?? 100;
  const isSIB = !!weapon.Properties.Skill?.IsSiB;

  // =============== Core Calculations =================
  const HA = weaponFormulas.hitAbility(hitSkillInput, hitSkillStart, hitSkillEnd, isSIB);
  const CA = weaponFormulas.critAbility(hitSkillInput, hitSkillStart, hitSkillEnd, isSIB);
  const hitRate = weaponFormulas.hitRate(HA);
  const minDamage = maxDamage * weaponFormulas.minDamagePercent(dmgSkillInput, dmgSkillStart, dmgSkillEnd);

  const baseAPM = weapon.Properties.UsesPerMinute;
  const minAPM = baseAPM * 0.45;
  const apm = weaponFormulas.apmFromHitLvl(hitSkillInput, hitSkillStart, hitSkillEnd, baseAPM, minAPM);
  const reloadTime = weaponFormulas.reloadTime(apm);

  const critChance = weaponFormulas.critChance(CA);
  const critDamage = weaponFormulas.critDamage();
  const effectiveDamage = ((minDamage + maxDamage) / 2) * (1 + critChance * critDamage) * hitRate;

  const dps = effectiveDamage / reloadTime;

  // ================= Economy =================
  const econ = weapon.Properties.Economy || {};
  const decayPEC = econ.Decay || 0;
  const ammoBurn = econ.AmmoBurn || 0;
  const weaponMU = Number(document.getElementById("weaponMU")?.value || 100) / 100;
  const ammoMU = Number(document.getElementById("ammoMU")?.value || 100) / 100;
  const ammoCostPEC = ammoBurn * 0.01;
  const costPerUsePEC = decayPEC * weaponMU + ammoCostPEC * ammoMU;
  const costPerUsePED = costPerUsePEC * 0.01;
  const maxTT = econ.MaxTT || 0;
  const minTT = econ.MinTT || 0;
  const totalUses = decayPEC > 0 ? ((maxTT - minTT) * 100) / decayPEC : 0;
  const totalCostPED = (costPerUsePED * totalUses) + minTT;
  const dpp = weaponFormulas.dpp(effectiveDamage, costPerUsePEC);

  // ================= Build Display String =================
  const stats = `
${cleanData.Name}
----------------------
${weapon.Properties.Type} ${weapon.Properties.Category}
Type: ${weapon.Properties.Class}
Weight: ${weapon.Properties.Weight} kg
Ammo Type: ${weapon.Properties.Ammo?.Name || "-"}
----------------------
SIB: ${isSIB}
${weapon.ProfessionHit?.Name || "-"}: ${hitSkillStart}/${hitSkillEnd}
${weapon.ProfessionDmg?.Name || "-"}: ${dmgSkillStart}/${dmgSkillEnd}
Hit Ability: ${HA.toFixed(1)}/10.0
Crit Ability: ${CA.toFixed(1)}/10.0
Hit Rate: ${(hitRate * 100).toFixed(1)}%
----------------------
Attacks/min: ${apm.toFixed(2)} (Reload: ${reloadTime.toFixed(2)}s)
DPS: ${dps.toFixed(2)}
----------------------
Economy:
Efficiency: ${econ.Efficiency ?? "-"}%
Max TT: ${maxTT} PED
Min TT: ${minTT} PED
Total Uses: ${Math.floor(totalUses)}
Cost per Use: ${costPerUsePEC.toFixed(4)} PEC
Total Cost: ${totalCostPED.toFixed(4)} PED
DPP: ${dpp.toFixed(4)}
----------------------
Effective Damage: ${effectiveDamage.toFixed(2)}
Damage min/max: ${minDamage.toFixed(2)}/${maxDamage}
  ${damageTypes}
Range: ${weapon.Properties.Range} m
Ammo Burn: ${ammoBurn} | Decay: ${decayPEC.toFixed(4)} PEC
Effects:
on Equip: ${weapon.EffectsOnEquip?.length ? weapon.EffectsOnEquip.join(", ") : "-"}
on Use: ${weapon.EffectsOnUse?.length ? weapon.EffectsOnUse.join(", ") : "-"}
`.trim();

  // ================= Structured Data for Other Scripts =================
  const data = {
    name: cleanData.Name,
    type: weapon.Properties.Type,
    class: weapon.Properties.Class,
    category: weapon.Properties.Category,
    HA, CA, hitRate,
    minDamage, maxDamage, effectiveDamage,
    apm, reloadTime, dps,
    critChance, critDamage,
    econ: {
      efficiency: econ.Efficiency,
      decayPEC, ammoBurn,
      costPerUsePEC, costPerUsePED,
      totalUses, totalCostPED, dpp
    }
  };

  return {
    display: viewModes.weapon === "json" ? JSON.stringify(cleanData, null, 2) : stats,
    data
  };
}



function updateRightPanelStats(weapon) {
  if (!weapon) return;

  const hitSkillInput = Number(document.getElementById("hitSkill")?.value || 0);
  const dmgSkillInput = Number(document.getElementById("dmgSkill")?.value || 0);

  const hitSkillStart = weapon.Properties.Skill?.Hit?.LearningIntervalStart ?? 0;
  const hitSkillEnd = weapon.Properties.Skill?.Hit?.LearningIntervalEnd ?? 100;
  const dmgSkillStart = weapon.Properties.Skill?.Dmg?.LearningIntervalStart ?? 0;
  const dmgSkillEnd = weapon.Properties.Skill?.Dmg?.LearningIntervalEnd ?? 100;
  const isSIB = !!weapon.Properties.Skill?.IsSiB;

  // Core Calculations
  const HA = weaponFormulas.hitAbility(hitSkillInput, hitSkillStart, hitSkillEnd, isSIB);
  const CA = weaponFormulas.critAbility(dmgSkillInput, dmgSkillStart, dmgSkillEnd, isSIB);
  const hitRate = weaponFormulas.hitRate(HA);
  const minDamage = weapon.Properties.Damage
    ? Object.values(weapon.Properties.Damage).reduce((sum, v) => sum + (v || 0), 0) *
      weaponFormulas.minDamagePercent(dmgSkillInput, dmgSkillStart, dmgSkillEnd)
    : 0;
  const maxDamage = Object.values(weapon.Properties.Damage || {}).reduce((sum, v) => sum + (v || 0), 0);

  const baseAPM = weapon.Properties.UsesPerMinute || 0;
  const minAPM = baseAPM * 0.45;
  const apm = weaponFormulas.apmFromHitLvl(hitSkillInput, hitSkillStart, hitSkillEnd, baseAPM, minAPM);
  const reloadTime = weaponFormulas.reloadTime(apm);

  const critChance = weaponFormulas.critChance(CA);
  const critDamage = weaponFormulas.critDamage();
  const effectiveDamage = weaponFormulas.effectiveDamage(
    weaponFormulas.minDamagePercent(dmgSkillInput, dmgSkillStart, dmgSkillEnd),
    maxDamage,
    hitRate,
    critChance,
    critDamage
  );

  const dps = effectiveDamage / reloadTime;

  // Economy
  const econ = weapon.Properties.Economy || {};
  const decayPEC = econ.Decay || 0;
  const ammoBurn = econ.AmmoBurn || 0;
  const weaponMU = Number(document.getElementById("weaponMU")?.value || 100) / 100;
  const ammoMU = Number(document.getElementById("ammoMU")?.value || 100) / 100;
  const ammoCostPEC = ammoBurn * 0.01;
  const costPerUsePEC = decayPEC * weaponMU + ammoCostPEC * ammoMU;
  const totalUses = decayPEC > 0 ? ((econ.MaxTT - econ.MinTT) * 100) / decayPEC : 0;
  const dpp = weaponFormulas.dpp(effectiveDamage, costPerUsePEC);

  // Update right panel inputs
  const rightPanelMap = {
    "Total Damage": maxDamage,
    "Range": weapon.Properties.Range || 0,
    "Critical Chance": (critChance * 100).toFixed(2),
    "Critical Damage": critDamage,
    "Effective Damage": effectiveDamage.toFixed(2),
    "Reload": reloadTime.toFixed(2),
    "Uses/min": apm.toFixed(2),
    "DPS": dps.toFixed(2),
    "Efficiency": econ.Efficiency || 0,
    "Decay": decayPEC.toFixed(4),
    "Ammo": ammoBurn,
    "Cost": (costPerUsePEC * 0.01).toFixed(4),
    "DPP": dpp.toFixed(4),
    "Total Uses": Math.floor(totalUses),
    "Hit Ability": HA.toFixed(2),
    "Crit Ability": CA.toFixed(2),
    "Skill Modification": 0, // placeholder if you want to compute
    "Skill Bonus": 0 // placeholder if you want to compute
  };

  document.querySelectorAll("#loadout-rightpanelB .stat-card").forEach(card => {
    const label = card.querySelector("h4")?.innerText;
    const input = card.querySelector("input");
    if (label && input && rightPanelMap[label] != null) {
      input.value = rightPanelMap[label];
    }
  });
}
function setupRightPanelReactivity(weapon) {
  if (!weapon) return;

  const panelInputs = document.querySelectorAll("#loadout-rightpanelB .stat-card input");

  function recalc() {
    // Get current user-modified inputs
    const hitSkillInput = Number(document.getElementById("hitSkill")?.value || 0);
    const dmgSkillInput = Number(document.getElementById("dmgSkill")?.value || 0);
    const weaponMU = Number(document.getElementById("weaponMU")?.value || 100) / 100;
    const ammoMU = Number(document.getElementById("ammoMU")?.value || 100) / 100;

    const hitSkillStart = weapon.Properties.Skill?.Hit?.LearningIntervalStart ?? 0;
    const hitSkillEnd = weapon.Properties.Skill?.Hit?.LearningIntervalEnd ?? 100;
    const dmgSkillStart = weapon.Properties.Skill?.Dmg?.LearningIntervalStart ?? 0;
    const dmgSkillEnd = weapon.Properties.Skill?.Dmg?.LearningIntervalEnd ?? 100;
    const isSIB = !!weapon.Properties.Skill?.IsSiB;

    // Core Calculations
    const HA = weaponFormulas.hitAbility(hitSkillInput, hitSkillStart, hitSkillEnd, isSIB);
    const CA = weaponFormulas.critAbility(dmgSkillInput, dmgSkillStart, dmgSkillEnd, isSIB);
    const hitRate = weaponFormulas.hitRate(HA);
    const maxDamage = Object.values(weapon.Properties.Damage || {}).reduce((sum, v) => sum + (v || 0), 0);
    const minDamagePercent = weaponFormulas.minDamagePercent(dmgSkillInput, dmgSkillStart, dmgSkillEnd);
    const minDamage = maxDamage * minDamagePercent;

    const baseAPM = weapon.Properties.UsesPerMinute || 0;
    const minAPM = baseAPM * 0.45;
    const apm = weaponFormulas.apmFromHitLvl(hitSkillInput, hitSkillStart, hitSkillEnd, baseAPM, minAPM);
    const reloadTime = weaponFormulas.reloadTime(apm);

    const critChance = weaponFormulas.critChance(CA);
    const critDamage = weaponFormulas.critDamage();
    const effectiveDamage = weaponFormulas.effectiveDamage(minDamagePercent, maxDamage, hitRate, critChance, critDamage);
    const dps = effectiveDamage / reloadTime;

    // Economy
    const econ = weapon.Properties.Economy || {};
    const decayPEC = econ.Decay || 0;
    const ammoBurn = econ.AmmoBurn || 0;
    const ammoCostPEC = ammoBurn * 0.01;
    const costPerUsePEC = decayPEC * weaponMU + ammoCostPEC * ammoMU;
    const totalUses = decayPEC > 0 ? ((econ.MaxTT - econ.MinTT) * 100) / decayPEC : 0;
    const dpp = weaponFormulas.dpp(effectiveDamage, costPerUsePEC);

    const rightPanelMap = {
      "Total Damage": maxDamage,
      "Range": weapon.Properties.Range || 0,
      "Critical Chance": (critChance * 100).toFixed(2),
      "Critical Damage": critDamage,
      "Effective Damage": effectiveDamage.toFixed(2),
      "Reload": reloadTime.toFixed(2),
      "Uses/min": apm.toFixed(2),
      "DPS": dps.toFixed(2),
      "Efficiency": econ.Efficiency || 0,
      "Decay": decayPEC.toFixed(4),
      "Ammo": ammoBurn,
      "Cost": (costPerUsePEC * 0.01).toFixed(4),
      "DPP": dpp.toFixed(4),
      "Total Uses": Math.floor(totalUses),
      "Hit Ability": HA.toFixed(2),
      "Crit Ability": CA.toFixed(2),
      "Skill Modification": 0,
      "Skill Bonus": 0
    };

    panelInputs.forEach(cardInput => {
      const label = cardInput.closest(".stat-card")?.querySelector("h4")?.innerText;
      if (label && rightPanelMap[label] != null) {
        cardInput.value = rightPanelMap[label];
      }
    });
  }

  panelInputs.forEach(input => {
    input.addEventListener("input", recalc);
  });

  // Initial population
  recalc();
}

// ================= Live update function =================
// 🟢 Update function
function updateWeaponStats(selectedWeapon) {
  const statsDiv = document.getElementById("weapon-base-stats-content");
  statsDiv.innerText = formatWeaponStats(selectedWeapon);
  updateRightPanelStats(selectedWeapon);
}

// Example event listeners
document.getElementById("hitSkill").addEventListener("input", () => updateWeaponStats(currentWeapon));
document.getElementById("dmgSkill").addEventListener("input", () => updateWeaponStats(currentWeapon));



function formatAttachmentStats(item, type = "attachment") {
  if (!item) return "Select an attachment to view stats";

  const cleanData = item;
  const props = cleanData.Properties || {};

  let stats = `${cleanData.Name}\n----------------------\nType: ${type}\n`;

  // Common
  if (props.Weight != null) stats += `Weight: ${props.Weight} kg\n`;

  // Amplifiers: show damage bonuses
  if (props.Damage) {
    const damageTypes = Object.entries(props.Damage)
      .filter(([_, v]) => v != null && v !== 0)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n  ");
    if (damageTypes) stats += `Damage Bonuses:\n  ${damageTypes}\n`;
  }

  // Vision attachments: show skill + zoom
  if (props.SkillModification != null) stats += `Skill Mod: ${props.SkillModification}\n`;
  if (props.SkillBonus != null) stats += `Skill Bonus: ${props.SkillBonus}\n`;
  if (props.Zoom != null) stats += `Zoom: ${props.Zoom}x\n`;

  // ================= Economy Calculations =================
  if (props.Economy) {
    const decay = props.Economy.Decay || 0;
    const ammoBurn = props.Economy.AmmoBurn || 0;
    const ammoCostPed = ammoBurn * 0.0001;

    const maxTT = props.Economy.MaxTT || 0;
    const minTT = props.Economy.MinTT || 0;

    const totalUses = decay > 0 ? ((maxTT - minTT) * 100) / decay : 0;
    const costPerUse = decay + ammoCostPed;
    const totalCost = totalUses * costPerUse;

    stats += `Economy:\n`;
    if (props.Efficiency != null) stats += `Efficiency: ${props.Efficiency}%\n`;
    if (maxTT) stats += `Max TT: ${maxTT} PED\n`;
    if (minTT) stats += `Min TT: ${minTT} PED\n`;
    stats += `Total Uses: ${Math.floor(totalUses)}\n`;
    stats += `Cost per Use: ${costPerUse.toFixed(4)} PED\n`;
    stats += `Total Cost: ${totalCost.toFixed(2)} PED\n`;
    if (props.Absorption != null) stats += `Absorption: ${(props.Absorption * 100).toFixed(2)}%\n`;
    if (ammoBurn) stats += `Ammo Burn: ${ammoBurn}\n`;
    if (decay) stats += `Decay: ${decay}\n`;
  }

  // Effects
  if (cleanData.EffectsOnEquip) stats += `Effects on Equip: ${cleanData.EffectsOnEquip.length ? cleanData.EffectsOnEquip.join(", ") : "-"}\n`;
  if (cleanData.EffectsOnUse) stats += `Effects on Use: ${cleanData.EffectsOnUse.length ? cleanData.EffectsOnUse.join(", ") : "-"}\n`;

  stats = stats.trim();

  // Toggle JSON view
  return viewModes[type] === "json" ? JSON.stringify(cleanData, null, 2) : stats;
}

// Default to 'formatted' view
let viewModes = {
  weapon: "formatted",
  amplifier: "formatted",
  vision1: "formatted",
  vision2: "formatted",
  scope: "formatted",
  absorber: "formatted"
};

function toggleView(type) {
  viewModes[type] = viewModes[type] === "json" ? "formatted" : "json";
  updateMainStats(); // re-render
}
//====================================================


// ================= Event Listeners =================
document.addEventListener("DOMContentLoaded", () => {
  populateWeaponDropdown();
  populateAmplifierDropdown();
  populateVisionDropdown();
  populateScopeDropdown();
  populateAbsorberDropdown();

  const weaponSelectElement = document.querySelector(".weapon-select");

  weaponSelectElement?.addEventListener("change", e => {
	const selectedId = e.target.value;
	// Update the current weapon
	selectWeapon(selectedId);

	// Refresh the stats display
	updateWeaponStats(currentWeapon);
  });
  document.querySelector(".amplifier-select")?.addEventListener("change", e => selectAmplifier(e.target.value));
  document.querySelector(".vision1-select")?.addEventListener("change", e => selectVision1(e.target.value));
  document.querySelector(".vision2-select")?.addEventListener("change", e => selectVision2(e.target.value));
  document.querySelector(".scope-select")?.addEventListener("change", e => selectScope(e.target.value));
  document.querySelector(".absorber-select")?.addEventListener("change", e => selectAbsorber(e.target.value));
});










//=====================================================================