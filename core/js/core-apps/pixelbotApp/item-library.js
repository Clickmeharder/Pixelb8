//icons 🧱🔩⚙️🧪🟩💻🖥️💾🔦📡  🛰️🧲💡
//factory🏭
//tower🗼
//powercord🔌uknownitem📟scrapmetal🦾
//buildings
//🏠🛕🏰🏚️🏗️🏛️🏤🏬🏫🏢🏨🏦🏥⛪
//door? 🚪
//furniture
//🪑🛏️
//🚽 Toilet
//🕳️hole
//🌲 pine
//🗿 Moai 
//🚿 Shower – Refresh station or buff effect
//🛁 Bathtub – Healing or strange tech interface
//🧯 Fire Extinguisher – Emergency repair or tool
//items
//bottleicecube🧊

//🐣chick
//unalive
//swords
//knife
//treasure
const defaultCustomItemIconList = [
  ...'😀😃😄😁😆😅😂🤣😊😇🙂🙃😉😍🥰😘😋😜😎🤩🧐😤🤯😱🥶🤖🎮🏹🔥✨🎯🧠🧸🗑️❌🔪⚔️🧴🕷️🦴🧟💀👾🐉☣️👨‍🏫🕵️👩‍⚕️👨‍🚀🧙💬🌀🛑'
];
//mergeThreshold is for dropped item stacking
const mergeThreshold = 10;
const itemLibrary = [

// Buildings & Structures
  { id: 'house', name: 'House', icon: "🏠", size: 'huge', type: 'object' },
  { id: 'houseWithGarden', name: 'House with Garden', icon: '🏡', size: 'huge', type: 'object' },
  { id: 'smallVillage', name: 'Small Village', icon: '🏘️', size: 'huge', type: 'object' },
  { id: 'pagoda', name: 'Pagoda', icon: "🛕", size: 'huge', type: 'object' },
  { id: 'castle', name: 'Castle', icon: "🏰", size: 'huge', type: 'object' },
  { id: 'abandonedHouse', name: 'Abandoned House', icon: "🏚️", size: 'huge', type: 'object' },
  { id: 'constructionSite', name: 'Construction Site', icon: "🏗️", size: 'huge', type: 'object' },
  { id: 'classicalobject', name: 'Classical object', icon: "🏛️", size: 'huge', type: 'object' },
  { id: 'postOffice', name: 'Post Office', icon: "🏤", size: 'huge', type: 'object' },
  { id: 'departmentStore', name: 'Department Store', icon: "🏬", size: 'huge', type: 'object' },
  { id: 'school', name: 'School', icon: "🏫", size: 'huge', type: 'object' },
  { id: 'officeobject', name: 'Office object', icon: "🏢", size: 'huge', type: 'object' },
  { id: 'hotel', name: 'Hotel', icon: "🏨", size: 'huge', type: 'object' },
  { id: 'bank', name: 'Bank', icon: "🏦", size: 'huge', type: 'object' },
  { id: 'hospital', name: 'Hospital', icon: "🏥", size: 'huge', type: 'object' },
  { id: 'church', name: 'Church', icon: "⛪", size: 'huge', type: 'object' },
  { id: 'camping', name: 'Camping Site', icon: '🏕️', size: 'medium', type: 'object' },
  { id: 'tent', name: 'Tent', icon: '⛺', size: 'medium', type: 'object' },

//objects
  { id: 'Box', name: 'Box', icon: "📦", size: 'large', type: 'object' },
  // New object additions (use/interact need to be setup for these)
  { id: 'hole', name: 'Hole', icon: "🕳️", size: 'large', type: 'object' },
  { id: 'cabinet', name: 'Cabinet', icon: '🗄️', size: 'large', type: 'object' },
  { id: 'monitor', name: 'Monitor', icon: '🖥️', size: 'large', type: 'object' },
  { id: 'laptop', name: 'Laptop', icon: '💻', size: 'large', type: 'object' },
  { id: 'sattelite', name: 'Sattelite', icon: '📡', size: 'huge', type: 'object' },
  { id: 'factory', name: 'Factory', icon: '🏭', size: 'huge', type: 'object' },
  { id: 'teddyBear', name: 'Teddy Bear', icon: '🧸', size: 'normal', type: 'object' },
  { id: 'hatchingChick', name: 'Hatching Chick', icon: "🐣", size: 'tiny', type: 'object' },
//plants and trees
  { id: 'palmTreeIsland', name: 'Palm Tree Island', icon: '🌴', size: 'medium', type: 'object' },
  { id: 'palmTree', name: 'Palm Tree', icon: '🌴', size: 'medium', type: 'object' },
  { id: 'pine', name: 'Pine Tree', icon: '🌲', size: 'medium', type: 'object' },
  { id: 'tree', name: 'Tree', icon: '🌳', size: 'medium', type: 'object' },
  { id: 'cactus', name: 'Cactus', icon: '🌵', size: 'small', type: 'object' },
  { id: 'bamboo', name: 'Bamboo', icon: '🎍', size: 'medium', type: 'object' },
  { id: 'flower', name: 'Flower', icon: '🌸', size: 'small', type: 'object' },
//tools
  { id: 'wrench', name: 'wrench', icon: "🔧", size: 'normal', type: 'tool' },
  { id: 'Rusty Dagger', name: 'Rusty Dagger', icon: "🗡️", size: 'normal', type: 'tool' },
  { id: 'kitchenKnife', name: 'Kitchen Knife', icon: "🔪", size: 'normal', type: 'tool' },
  { id: 'axe', name: 'axe', icon: "🪓", size: 'large', type: 'tool' },
  { id: 'tinyShovel', name: 'Tiny Shovel', icon: "🥄", size: 'normal', type: 'tool' },
  { id: 'pickaxe', name: 'Pickaxe', icon: '⛏️', size: 'medium', type: 'tool' },
  { id: 'fire', name: 'fire', icon: '🔥', size: 'small', type: 'tool' },
  { id: 'hammer', name: 'Hammer', icon: '🔨', size: 'medium', type: 'tool' },
  { id: 'flashlight', name: 'Flashlight', icon: '🔦', size: 'medium', type: 'tool' },
  { id: 'Magnet', name: 'Magnet', icon: '🧲', size: 'small', type: 'tool' },
  { id: 'Sword', name: 'Sword', icon: "🗡️", quantity: 1, size: 'large', type: 'tool' },
  { id: 'waterBalloon', name: 'Water Balloon', icon: '💧', size: 'small', type: 'tool' },
  { id: 'bomb', name: 'Bomb', icon: '💣', size: 'small', type: 'tool' },
  { id: 'tnt', name: 'TNT', icon: '🧨', size: 'medium', type: 'tool' },
  { id: 'web', name: 'web', icon: '🕸️', size: 'medium', type: 'tool' },
  { id: 'fishingPole', name: 'Fishing Pole', icon: '🎣', size: 'medium', type: 'tool' },
//food
  { id: 'Apple', name: 'Apple', icon: "🍎", size: 'small', type: 'food' },
  { id: 'Pickle', name: 'Pickle', icon: "🥒", size: 'normal', type: 'food' },
  { id: 'rock', name: 'Rock', icon: '🟤', size: 'tiny', type: 'material' },
  { id: 'banana', name: 'Banana', icon: '🍌', size: 'small', type: 'food' },
  { id: 'carrot', name: 'Carrot', icon: '🥕', size: 'small', type: 'food' },
  { id: 'sandwich', name: 'Sandwich', icon: '🥪', size: 'normal', type: 'food' },
  { id: 'deadFish', name: 'Dead Fish', icon: '🐟', size: 'normal', type: 'food' },
  { id: 'energyBar', name: 'Energy Bar', icon: '🍫', size: 'small', type: 'food' },
//saplings
  { id: 'Sapling', name: 'Sapling', icon: "🌱", size: 'tiny', type: 'sapling' },
  { id: 'Acorn', name: 'Acorn', icon: "🌰", size: 'tiny', type: 'sapling' },
//unique
  { id: 'underwearGnome', name: 'underwearGnome', icon: "🧚", size: 'large', type: 'unique' },
  { id: 'Goblin Crown', name: 'Goblin Crown', icon: "👑", size: 'normal', type: 'unique' },
  { id: 'secretFile', name: 'Secret File', icon: "🗂️", size: 'normal', type: 'unique' },
//files
//junk
  { id: 'Goblin Tooth', name: 'Goblin Tooth', icon: "🦷", size: 'tiny', type: 'junk' },
  { id: 'Goblin Ear', name: 'Goblin Ear', icon: "👂", size: 'tiny', type: 'junk' },
  { id: 'shell', name: 'shell', icon: "🐚", size: 'tiny', type: 'junk' },
  { id: 'toiletPaper', name: 'Toilet Paper', icon: "🧻", size: 'tiny', type: 'junk' },
  { id: 'bone', name: 'Bone', icon: "🦴", size: 'tiny', type: 'junk' },
//currency
  { id: 'money', name: 'money', icon: "💵", size: 'tiny', type: 'currency' },
  { id: 'prettygem', name: 'Pretty Gem', icon: '💎', size: 'tiny', type: 'material' },

//materials
  { id: 'circuitBoard', name: 'Circuit Board', icon: '🧩', size: 'small', type: 'material' },
  { id: 'purplething', name: 'Purple Thing', icon: '🟣', size: 'tiny', type: 'material' },
  { id: 'wiringBundle', name: 'Wiring Bundle', icon: '🧵', size: 'small', type: 'material' },
  { id: 'battery', name: 'Battery', icon: '🔋', size: 'small', type: 'material' },
  { id: 'motherboard', name: 'Motherboard', icon: '🟩', size: 'medium', type: 'material' },
  { id: 'smarts', name: 'Smarts', icon: '🧠', size: 'tiny', type: 'material' },
  { id: 'logicBoard', name: 'Logic Board', icon: '🔲', size: 'small', type: 'material' },
  { id: 'cpu', name: 'CPU', icon: '🔳', size: 'small', type: 'material' },
  { id: 'hardDrive', name: 'Hard Drive', icon: '💽', size: 'small', type: 'material' },
  { id: 'powercord', name: 'Power Cord', icon: '🔌', size: 'small', type: 'material' },
  { id: 'floppyDisk', name: 'Floppy Disk', icon: '💾', size: 'small', type: 'material' },
  { id: 'bricks', name: 'Bricks', icon: '🧱', size: 'medium', type: 'material' },
  { id: 'scrapmetal-1', name: 'Scrap Metal', icon: '🔩', size: 'tiny', type: 'material' },
  { id: 'scrapmetal-2', name: 'Scrap Metal', icon: '⚙️', size: 'tiny', type: 'material' },
  { id: 'scrapmetal-3', name: 'Scrap Metal', icon: '🦾', size: 'tiny', type: 'material' },
  { id: 'testTube', name: 'Test Tube', icon: '🧪', size: 'small', type: 'material' },
  { id: 'lightbulb', name: 'Light Bulb', icon: '💡', size: 'small', type: 'material' },
  { id: 'oilBarrel', name: 'Oil Barrel', icon: '🛢️', size: 'large', type: 'material' },
  { id: 'wheat', name: 'Wheat', icon: '🌾', size: 'small', type: 'material' },
  { id: 'leaf', name: 'Leaf', icon: '🍃', size: 'small', type: 'material' },
  { id: 'herbs', name: 'Herbs', icon: '🌿', size: 'small', type: 'material' },
  { id: 'newitem', name: 'newitem', icon: '?', size: 'small', type: 'material' },
//other
	  { id: 'newitem', name: '', icon: '?', size: 'small', type: 'junk' },
	  { id: 'newitem', name: '', icon: '?', size: 'small', type: 'junk' },
	  { id: 'newitem', name: '', icon: '?', size: 'small', type: 'junk' },
	  { id: 'newitem', name: '', icon: '?', size: 'small', type: 'junk' }
];

// Load saved list or use default
let customItemIconList = JSON.parse(localStorage.getItem('pixelb8_customItemIconList')) || defaultCustomItemIconList;
const customItemLibrary = [];

// Get references to specific inputs
const customIconInput = document.getElementById('customIconInput');
function syncCustomIconsFromItemLibrary() {
  const defaultSet = new Set(defaultCustomItemIconList);
  let savedList = JSON.parse(localStorage.getItem('pixelb8_customItemIconList')) || [];

  const savedSet = new Set(savedList);
  let updated = false;

  // Add missing default icons
  defaultCustomItemIconList.forEach(icon => {
    if (!savedSet.has(icon)) {
      savedList.push(icon);
      savedSet.add(icon); // keep savedSet updated
      updated = true;
    }
  });

  // Add icons from itemLibrary that are not in either set
  itemLibrary.forEach(item => {
    const icon = item.icon;
    if (icon && !savedSet.has(icon)) {
      savedList.push(icon);
      savedSet.add(icon);
      updated = true;
    }
  });

  if (updated) {
    localStorage.setItem('pixelb8_customItemIconList', JSON.stringify(savedList));
    console.log("✅ pixelb8_customItemIconList updated with defaults and itemLibrary icons.");
  } else {
    console.log("ℹ️ pixelb8_customItemIconList already up to date.");
  }
}

function populateCustomIconSelect() {
  const customIconSelect = document.getElementById('CustomIconSelect');
  customIconSelect.innerHTML = '<option value="" disabled selected>🎨 Choose Icon</option>';
  const storedIcons = localStorage.getItem('pixelb8_customItemIconList');
  if (storedIcons) {
    const iconList = JSON.parse(storedIcons);
    iconList.forEach(icon => {
      const option = document.createElement('option');
      option.value = icon;
      option.textContent = icon;
      customIconSelect.appendChild(option);
    });
  }
}

// Populate the emoji select dropdown

function populateCustomItemIconSelect() {
  customItemIconSelect.innerHTML = '<option value="" disabled selected>🥒</option>';

  // Start with the default icons
  let combinedList = [...customItemIconList];

  // Try to get any saved icons from localStorage
  const saved = localStorage.getItem('pixelb8_customItemIconList');
  if (saved) {
    try {
      const savedIcons = JSON.parse(saved);
      combinedList = [...new Set([...combinedList, ...savedIcons])]; // merge & dedupe
    } catch (e) {
      console.error('Failed to parse custom item icon list:', e);
    }
  }

  // Populate the dropdown
  combinedList.forEach(emoji => {
    const option = document.createElement('option');
    option.value = emoji;
    option.textContent = emoji;
    customItemIconSelect.appendChild(option);
  });
}

function populateBothIconSelects() {
  populateCustomIconSelect(); // Refresh custom icon dropdown
  populateCustomItemIconSelect(); // refresh dropdown icons for custom items
}
function addCustomIconToLibrary() {
  const newIcon = customIconInput.value.trim();
  if (!newIcon || customItemLibrary.includes(newIcon)) return;
  customItemLibrary.push(newIcon);
  localStorage.setItem('pixelb8_customItemIconList', JSON.stringify(customItemLibrary));
  customIconInput.value = '';
  populateBothIconSelects();
}
function deleteCustomIcon() {
  const select = document.getElementById('CustomIconSelect');
  const selectedIcon = select.value;

  if (!selectedIcon) return;

  const index = customItemLibrary.indexOf(selectedIcon);
  if (index > -1) {
    customItemLibrary.splice(index, 1); // Remove from array
    localStorage.setItem('pixelb8_customItemIconList', JSON.stringify(customItemLibrary)); // Save
    populateCustomIconSelect(); // Refresh dropdown
	populateCustomItemIconSelect();
  }
}
function deleteAllCustomIcons() {
  if (confirm("Are you sure you want to delete all custom icons? This cannot be undone.")) {
    localStorage.removeItem('pixelb8_customItemIconList');
    populateCustomIconSelect();      // Refresh the UI after deletion
    populateCustomItemIconSelect();  // Also refresh the item icon dropdown if needed
  }
}

function createCustomItem() {
  const id = document.getElementById('customItemId').value.trim();
  const name = document.getElementById('customItemName').value.trim();
  const icon = document.getElementById('customItemIconSelect').value.trim() || '?';
  const type = document.getElementById('customItemType').value;
  const size = document.getElementById('customItemSize').value || 'normal'; // ← new line

  if (!id || !name) {
    alert('Please enter both ID and Name for the custom item.');
    return;
  }

  const existsInCustom = customItemLibrary.some(i => i.id === id);
  const existsInBuiltIn = itemLibrary.some(i => i.id === id);
  if (existsInCustom || existsInBuiltIn) {
    alert('An item with this ID already exists.');
    return;
  }

  const newItem = { id, name, icon, type, size }; // ← updated line
  customItemLibrary.push(newItem);
  alert(`Custom item "${name}" added!`);

  const select = document.getElementById('getCustomItem');
  const option = document.createElement('option');
  option.value = id;
  option.textContent = `${icon} ${name}`;
  select.appendChild(option);

  // Clear inputs
  document.getElementById('customItemId').value = '';
  document.getElementById('customItemName').value = '';
  document.getElementById('customItemIcon').value = '';
  document.getElementById('customItemSize').value = 'normal'; // ← clear select
}


function addCustomItemToInventory() {
  const select = document.getElementById('getCustomItem');
  const quantityInput = document.getElementById('customQuantity');
  const selectedId = select.value;
  const quantity = parseInt(quantityInput.value, 10);

  if (!selectedId) {
    alert('Please select a custom item!');
    return;
  }
  if (!quantity || quantity < 1) {
    alert('Please enter a valid quantity (1 or more)!');
    return;
  }

  const item = customItemLibrary.find(i => i.id === selectedId);
  if (item) {
    addItem({ ...item, quantity });
    alert(`Added ${quantity} x ${item.name} (custom) to inventory!`);
  } else {
    alert('Selected custom item not found!');
  }
}
function deleteCustomItem() {
  const select = document.getElementById('getCustomItem');
  const selectedId = select.value;

  if (!selectedId) {
    alert('Please select a custom item to delete.');
    return;
  }

  // Find index of the item in the custom library
  const index = customItemLibrary.findIndex(item => item.id === selectedId);
  if (index === -1) {
    alert('Custom item not found.');
    return;
  }

  // Confirm before deleting
  const confirmed = confirm(`Are you sure you want to delete "${customItemLibrary[index].name}"?`);
  if (!confirmed) return;

  // Remove from library
  customItemLibrary.splice(index, 1);

  // Remove from the dropdown
  select.removeChild(select.querySelector(`option[value="${selectedId}"]`));
  select.value = ""; // reset selection

  alert('Custom item deleted!');
}

// Populate the select dropdown
function populateItemSelect() {
  const select = document.getElementById('getItem');
  itemLibrary.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = `${item.icon} ${item.name}`;
    select.appendChild(option);
	console.log('attempting to populate');
  });
}

// Add the selected item to inventory
function getItem() {
  const select = document.getElementById('getItem');
  const quantityInput = document.getElementById('quantity');
  const selectedId = select.value;
  const quantity = parseInt(quantityInput.value, 10);

  if (!selectedId) {
    alert('Please select an item!');
    return;
  }
  if (!quantity || quantity < 1) {
    alert('Please enter a valid quantity (1 or more)!');
    return;
  }

  const item = itemLibrary.find(i => i.id === selectedId);
  if (item) {
    addItem({ ...item, quantity }); // Pass the quantity here
    alert(`Added ${quantity} x ${item.name} to inventory!`);
  } else {
    alert('Selected item not found!');
  }
}



window.addEventListener("DOMContentLoaded", () => {
  syncCustomIconsFromItemLibrary();
  // Call this once on page load or script load
  populateItemSelect();
// Initialize dropdown on page load
  populateBothIconSelects();
});