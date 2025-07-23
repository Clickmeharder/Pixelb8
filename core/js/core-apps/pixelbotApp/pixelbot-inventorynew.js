const baseDetectionRadius = 125;
const sneakDetectionRadius = 70;
let detectionRadius = baseDetectionRadius;
// Basic inventory and dropped items arrays
const moveThreshold = 10;
let targetPosition = null;
let heldItem = null;
let inventory = [];
let isInventoryOpen = false;
let droppedItemsByMap = {
  roomA: [],
  house: [],
  deepforest: [],
  lake: [],
  garden: [],
  forest: [],
  roomG: [],
  cave: [],
  town: []
};
const defaultMapStructure = { 
  roomA: [],
  house: [],
  deepforest: [],
  lake: [],
  garden: [],
  forest: [],
  roomG: [],
  cave: [],
  town: []
};


function logsavedStuff() {
  console.log("---- Logging All LocalStorage Keys ----");
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    const value = localStorage.getItem(key);

    console.log(`Key: ${key}`);
    try {
      console.log("Value:", JSON.parse(value));
    } catch (e) {
      console.log("Value (raw):", value);
    }
  }
  console.log("---- End of LocalStorage ----");
}
function logPixelbotSaveData() {
  console.log("---- Logging pixelb8_ LocalStorage Keys ----");

  const pixelb8Keys = Object.keys(localStorage).filter(key => key.startsWith('pixelb8_'));

  if (pixelb8Keys.length === 0) {
    console.log("⚠️ No keys found starting with 'pixelb8_'.");
  }

  pixelb8Keys.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`Key: ${key}`);
    try {
      console.log("Value:", JSON.parse(value));
    } catch (e) {
      console.log("Value (raw):", value);
    }
  });

  console.log(`---- End of pixelb8_ Log (${pixelb8Keys.length} keys) ----`);
}
function loadInventory() {
  const savedInventory = localStorage.getItem('pixelb8_inventory');
  const savedDropped = localStorage.getItem('pixelb8_droppedItemsByMap');
  const savedPlaced = localStorage.getItem('pixelb8_placedItemsByMap');

  inventory = savedInventory ? JSON.parse(savedInventory) : [];
  droppedItemsByMap = savedDropped ? JSON.parse(savedDropped) : defaultMapStructure;

  // Make sure all maps have dropped items array
  for (let map in maps) {
    if (!droppedItemsByMap[map]) droppedItemsByMap[map] = [];
  }

  // Load placedItems back into the maps object
  const placedItemsByMap = savedPlaced ? JSON.parse(savedPlaced) : defaultMapStructure;
  for (let map in maps) {
    maps[map].placedItems = placedItemsByMap[map] || [];
  }
}
// Save inventory and dropped items persistently
function saveInventory() {
  stackInventoryItems();
  localStorage.setItem('pixelb8_inventory', JSON.stringify(inventory));
  localStorage.setItem('pixelb8_droppedItemsByMap', JSON.stringify(droppedItemsByMap));

  // Collect placedItems per map into an object
  const placedItemsByMap = {};
  for (const mapName in maps) {
    placedItemsByMap[mapName] = maps[mapName].placedItems || [];
  }
  localStorage.setItem('pixelb8_placedItemsByMap', JSON.stringify(placedItemsByMap));
}

function resetDroppedItems() {
  if (confirm("Are you sure you want to reset all dropped items? This action cannot be undone.")) {
    for (const map in droppedItemsByMap) {
      droppedItemsByMap[map] = [];
    }
    localStorage.setItem('pixelb8_droppedItemsByMap', JSON.stringify(droppedItemsByMap));
    loadMap(currentMap); // Or your function to re-render the map
  }
}

function clearAllPixelbotSaveData() {
  if (confirm("Are you sure you want to clear all saved data for this game? This action cannot be undone.")) {
	const keysToDelete = Object.keys(localStorage).filter(key => key.startsWith('pixelb8_'));
	  
	keysToDelete.forEach(key => {
	localStorage.removeItem(key);
	console.log(`Removed: ${key}`);
    });

	console.log(`✅ Cleared ${keysToDelete.length} placedItems keys from localStorage.`);
  }
}
function resetPlacedItems() {
  if (confirm("Are you sure you want to reset all placed items? This action cannot be undone.")) {
	for (const map in maps) {
		maps[map].placedItems = [];
	}
	const emptyPlaced = {};
	for (const map in maps) {
		emptyPlaced[map] = [];
	}
	localStorage.setItem('pixelb8_placedItemsByMap', JSON.stringify(emptyPlaced));
	loadMap(currentMap);
  }
}
function resetInventory() {
  if (confirm("Are you sure you want to clear your inventory? This action cannot be undone.")) {
    inventory = [];
    localStorage.setItem('pixelb8_inventory', JSON.stringify(inventory));
    renderInventory(); // Your function to update inventory UI
  }
}
function resetEverything() {
  if (confirm("Are you sure you want to reset EVERYTHING? this includes all placed items, dropped items, entitys and saved data for this page! This action cannot be undone.")) {
    resetInventory();
    resetDroppedItems();
    resetPlacedItems();
    removeAllEntitiesEverywhere();
	clearAllPixelbotSaveData();
    loadMap(currentMap); // Optional if you want to refresh the scene
  }
}
function loadGameData() {
  const savedInventory = localStorage.getItem('pixelb8_inventory');
  const savedDropped = localStorage.getItem('pixelb8_droppedItemsByMap');
  const savedPlaced = localStorage.getItem('pixelb8_placedItemsByMap');
  const savedNPCs = localStorage.getItem('pixelb8_npcsByMap');
  const savedEnemies = localStorage.getItem('pixelb8_enemiesByMap');
  const savedPets = localStorage.getItem('pixelb8_petsByMap');


  inventory = savedInventory ? JSON.parse(savedInventory) : [];
  droppedItemsByMap = savedDropped ? JSON.parse(savedDropped) : { ...defaultMapStructure };
  npcsByMap = savedNPCs ? JSON.parse(savedNPCs) : { ...defaultMapStructure };
  enemiesByMap = savedEnemies ? JSON.parse(savedEnemies) : { ...defaultMapStructure };
  petsByMap = savedPets ? JSON.parse(savedPets) : { ...defaultMapStructure };

  for (let map in maps) {
    if (!droppedItemsByMap[map]) droppedItemsByMap[map] = [];
    if (!npcsByMap[map]) npcsByMap[map] = [];
    if (!enemiesByMap[map]) enemiesByMap[map] = [];
    if (!petsByMap[map]) petsByMap[map] = [];
    maps[map].placedItems = savedPlaced ? JSON.parse(savedPlaced)[map] || [] : [];
  }
}
function saveGameData() {
  stackInventoryItems();
  localStorage.setItem('pixelb8_inventory', JSON.stringify(inventory));
  localStorage.setItem('pixelb8_droppedItemsByMap', JSON.stringify(droppedItemsByMap));

  const placedItemsByMap = {};
  for (const mapName in maps) {
    placedItemsByMap[mapName] = maps[mapName].placedItems || [];
  }
  localStorage.setItem('pixelb8_placedItemsByMap', JSON.stringify(placedItemsByMap));
  localStorage.setItem('pixelb8_npcsByMap', JSON.stringify(npcsByMap));
  localStorage.setItem('pixelb8_enemiesByMap', JSON.stringify(enemiesByMap));
  localStorage.setItem('pixelb8_petsByMap', JSON.stringify(petsByMap));
}

function clearDroppedItems() {
  for (const map in droppedItemsByMap) {
    droppedItemsByMap[map] = [];
  }
}
function clearPlacedItems() {
  if (confirm("Are you sure you want to clear all placed items? This action cannot be undone.")) {
    for (const map in maps) {
      maps[map].placedItems = [];
    }
  }
}

//this clear all game data function isnt currently in use we are using reset everything
function clearAllGameData() {
  clearDroppedItems();
  clearPlacedItems();
  clearNPCs();
  clearEnemies();
  clearPets();
  inventory = [];
  saveGameData();
}

//add items
function addItem(item) {
  const existing = inventory.find(i => i.id === item.id);
  if (existing) {
    existing.quantity += item.quantity || 1;
  } else {
	inventory.push({
	  id: item.name,
	  name: item.name,
	  icon: item.icon || '?',
	  size: item.size || 'normal',
	  weight: item.weight || 1,
	  type: item.type || 'unknown',
	  quantity: item.quantity || 1
	  
	});
  }
  saveInventory();
  renderInventory();
}

// Remove item from inventory (by id and quantity)
function removeItem(itemId, quantity = 1) {
  const index = inventory.findIndex(i => i.id === itemId);
  if (index === -1) return false;

  if (inventory[index].quantity > quantity) {
    inventory[index].quantity -= quantity;
  } else {
    inventory.splice(index, 1);
  }
  saveInventory();
  renderInventory();
  return true;
}

// Drop item into the game world at player's current collision box position
function dropItem(itemId, quantity = 1) {
  const item = inventory.find(i => i.id === itemId);
  if (!item) return;

  if (item.quantity < quantity) quantity = item.quantity;

  const dropX = collisionBox.x + collisionBox.width / 2;
  const dropY = collisionBox.y + collisionBox.height / 2;
  const mergeThreshold = 50;

  const droppedItems = droppedItemsByMap[currentMap];

  for (let i = 0; i < quantity; i++) {
    removeItem(itemId, 1);

    const existingDropped = droppedItems.find(droppedItem => {
      const dx = droppedItem.x - dropX;
      const dy = droppedItem.y - dropY;
      return (
        Math.sqrt(dx * dx + dy * dy) <= mergeThreshold &&
        droppedItem.name === item.name
      );
    });

    if (existingDropped) {
      existingDropped.quantity += 1;
    } else {
      droppedItems.push({
        id: createUniqueItemId(item.name),
        name: item.name,
        icon: item.icon,
        size: item.size || 'normal',
        type: item.type || 'unknown',
        weight: item.weight || 1,
        quantity: 1,
        x: dropX,
        y: dropY
      });
    }
  }

  saveInventory();
  renderInventory();
  renderDroppedItems();
}
// Drop item into the game world based on name at given lovation
function dropItemByName(name, x, y, quantity = 1) {
  const itemTemplate = itemLibrary.find(i => i.name === name);
  if (!itemTemplate) return;

  const dropX = x;
  const dropY = y;
  const mergeThreshold = 50;

  const droppedItems = droppedItemsByMap[currentMap];

  const existingDropped = droppedItems.find(droppedItem => {
    const dx = droppedItem.x - dropX;
    const dy = droppedItem.y - dropY;
    return (
      Math.sqrt(dx * dx + dy * dy) <= mergeThreshold &&
      droppedItem.name === name
    );
  });

  if (existingDropped) {
    existingDropped.quantity += quantity;
  } else {
    droppedItems.push({
      ...structuredClone(itemTemplate),
      id: createUniqueItemId(name),
      quantity,
      x: dropX,
      y: dropY,
    });
  }

  renderDroppedItems();
}


// Drop specific amount of any item into the game world based on id at given lovation
function dropItemAtPosition(itemId, x, y, quantity = 1) {
  const item = inventory.find(i => i.id === itemId);
  if (!item) return alert("Item not found in inventory");

  if (item.quantity < quantity) return alert("Not enough quantity to split");

  // Remove quantity from inventory
  removeItem(itemId, quantity);

  // Add dropped item to the map
  const droppedItems = droppedItemsByMap[currentMap];
  droppedItems.push({
    id: createUniqueItemId(item.name),
    name: item.name,
    icon: item.icon,
    size: item.size,
    type: item.type,
    quantity,
    x,
    y
  });

  saveInventory();
  renderInventory();
  renderDroppedItems();
}



let itemToPickUpIndex = null;
let placedItemToPickUpId = null;
let isMovingToPickup = false;

function PickupPlacedItem(id) {
  const map = maps[currentMap];
  const index = map.placedItems.findIndex(item => item.id === id);
  if (index === -1) return;

  const item = map.placedItems[index];
  if (item.hasContents) {
    alert("You can't pick up a storage box with items inside it.");
    return;
  }
  addItem({
    id: item.name,
    name: item.name,
    icon: item.icon,
    size: item.size,
    type: item.type,
    quantity: 1
  });

  map.placedItems.splice(index, 1);
  renderPlacedItems(map.placedItems);
  saveInventory();
  renderInventory();
}


function moveToAndPickUpItem(x, y, itemId) {
  console.log("moveToAndPickUpItem called with:", { x, y, itemId });
  moveTo(x, y);
  pendingDroppedItemToPickUpId = itemId;
}

let pendingPlacedItemToInteractId = null;

function moveToAndInteractWithPlacedItem(x, y, itemId) {
  console.log("moveToAndInteractWithPlacedItem called with:", { x, y, itemId });
  moveTo(x, y);
  pendingPlacedItemToInteractId = itemId;
}

//pick up placed or dropped items
function pickUpItem(item) { 
  // Remove from droppedItems
  const droppedItems = droppedItemsByMap[currentMap];
  const droppedIndex = droppedItems.findIndex(d => d.id === item.id);

  if (droppedIndex !== -1) {
    droppedItems.splice(droppedIndex, 1);
    renderDroppedItems(droppedItems);
  }

  // Remove from placedItems
  const map = maps[currentMap];
  const placedIndex = map.placedItems.findIndex(p => p.id === item.id);
  if (item.hasContents) {
    alert("You can't pick up a storage box with items inside it.");
    return;
  }
  if (placedIndex !== -1) {
    map.placedItems.splice(placedIndex, 1);
    renderPlacedItems(map.placedItems);
  }
  // Add to inventory
  inventory.push(item);
  stackInventoryItems();
  renderInventory();
  saveInventory();
}


function removeItemFromWorld(item) {
  // Remove from droppedItems
  const droppedItems = droppedItemsByMap[currentMap];
  const droppedIndex = droppedItems.findIndex(d => d.id === item.id);
  if (droppedIndex !== -1) {
    droppedItems.splice(droppedIndex, 1);
    renderDroppedItems(droppedItems);
  }

  // Remove from placedItems
  const map = maps[currentMap];
  const placedIndex = map.placedItems.findIndex(p => p.id === item.id);
  if (item.hasContents) {
    alert("You can't pick up a storage box with items inside it.");
    return;
  }
  if (placedIndex !== -1) {
    map.placedItems.splice(placedIndex, 1);
    renderPlacedItems(map.placedItems);
  }
}

function placeObjectById(id) {
  const item = pendingPlacementItems.find(obj => obj.id === id); // or use your actual object source
  if (!item) {
    console.warn("No item found to place with id:", id);
    return;
  }

  const targetX = item.x - collisionBox.width;
  const targetY = item.y - collisionBox.height;

  moveTo(targetX, targetY);
  pendingObjectToPlace = item;
}
function placeObject(itemId) {
  const droppedItems = droppedItemsByMap[currentMap];
  const itemIndex = droppedItems.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return;

  const item = droppedItems[itemIndex];

  // Move to item location before placing it
  moveTo(item.x, item.y);

  // Set up for placement when player arrives
  pendingObjectToPlace = item;
}

function placeItem(item, x, y) {
  if (!item || !item.type) return;

  const map = maps[currentMap];
  const width = item.width || 32;
  const height = item.height || 32;
  const placedX = x;
  const placedY = y;

  const placed = {
    id: createUniqueItemId(item.name),
    name: item.name,
    icon: item.icon,
    type: item.type,
    size: item.size,
    weight: item.weight,
    width,
    height,
    quantity: item.quantity || 1,
    x: placedX,
    y: placedY,
    interactable: true,
    placedFromDrop: false
  };

  // ✅ If it's a box, initialize its inventory
  if (item.name.toLowerCase().includes("box")) {
    placed.storage = {
      contents: [],
      capacity: 8
    };
    placed.hasContents = false;
  }

  // ✅ SAFETY FALLBACK — just in case
  if (!placed.storage && placed.name.toLowerCase().includes("box")) {
    placed.storage = {
      contents: [],
      capacity: 8
    };
    placed.hasContents = false;
  }

  map.placedItems.push(placed);
  renderPlacedItems(map.placedItems);
}

function plantItem(itemId) {
  const droppedItems = droppedItemsByMap[currentMap];
  const itemIndex = droppedItems.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return;

  const item = droppedItems[itemIndex];

  // Move to the item before planting
  moveTo(item.x, item.y);

  // Setup for placement when player arrives
  pendingObjectToPlace = {
    ...item,
    isPlant: true  // Mark as plant if needed later
  };
}
function plantSapling(itemId) {
  const droppedItems = droppedItemsByMap[currentMap];
  const index = droppedItems.findIndex(item => item.id === itemId);
  if (index === -1) return;

  const sapling = droppedItems[index];
  const { x, y } = sapling;

  // Remove from dropped items
  droppedItems.splice(index, 1);

  // Build sapling item and place it using shared logic
  const saplingItem = {
    name: 'Sapling',
    icon: '🌱',
    type: 'object',
    size: 'small',
    weight: 1,         // ← Add sensible defaults
    width: 16,
    height: 16,
    quantity: 1,
    isGrowing: true
  };

  // Place using consistent item logic
  placeItem(saplingItem, x, y);

  console.log('You planted a sapling! 🌱 It will grow into a tree soon...');

  // After 30 seconds, grow into a tree
  setTimeout(() => {
    const map = maps[currentMap];
    const saplingIndex = map.placedItems.findIndex(i => i.name === 'Sapling' && i.x === x && i.y === y);
    if (saplingIndex === -1) return;

    const treeItem = {
      name: 'Tree',
      icon: '🌳',
      type: 'object',
      size: 'huge',
      weight: 50,
      width: 32,
      height: 48,
      quantity: 1
    };

    map.placedItems[saplingIndex] = {
      ...treeItem,
      id: createUniqueItemId('Tree'),
      x,
      y
    };

    renderPlacedItems(map.placedItems);
    saveInventory();
    console.log('🌳 Tree has grown!');
  }, 30000);

  renderDroppedItems(droppedItems);
  saveInventory();
  hideMenus();
}

function destroyPlacedItem(id) {
  const map = maps[currentMap];
  const index = map.placedItems.findIndex(item => item.id === id);
  if (index === -1) return;

  const item = map.placedItems[index];

  if (item.hasContents) {
    alert("You can't pick up a storage box with items inside it.");
    return;
  }

  const el = document.getElementById(id);
  if (!el) return;

  // Prepare explosion effect
  el.textContent = '💥';
  el.style.fontSize = '48px';
  el.style.transition = 'transform 0.6s ease, opacity 0.6s ease';
  el.style.transformOrigin = '50% 50%';
  el.style.opacity = '1';
  el.style.transform = 'scale(1)';

  // Trigger reflow to make sure the transition will run
  void el.offsetWidth;

  // Animate: scale up and fade out
  el.style.transform = 'scale(2)';
  el.style.opacity = '0';

  setTimeout(() => {
    // Remove item after animation
    map.placedItems.splice(index, 1);
    saveInventory();           // Save the updated placed items!
    renderPlacedItems(map.placedItems);
    hideMenus();
  }, 600);
}

function moveItemToInventory(id) {
  const map = maps[currentMap];
  const index = map.placedItems.findIndex(item => item.id === id);
  if (index === -1) return;

  const item = map.placedItems[index]; // get item before removing it
  if (item.hasContents) {
    alert("You can't pick up a storage box with items inside it.");
    return;
  }
  map.placedItems.splice(index, 1);    // remove from map

  addItem(item);                       // add to inventory
  renderPlacedItems(map.placedItems); // re-render placed items
  stackInventoryItems();

  hideMenus();
}
function moveItemToDroppedItems(id) {
  const map = maps[currentMap];
  const index = map.placedItems.findIndex(item => item.id === id);
  if (item.hasContents) {
    alert("You can't pick up a storage box with items inside it.");
    return;
  }
  if (index === -1) return;

  const item = map.placedItems[index];     // get item first
  map.placedItems.splice(index, 1);        // remove from placedItems

  droppedItems.push({
    ...item,
    x: item.x,
    y: item.y
  });

  renderPlacedItems(map.placedItems);      // refresh map
  renderDroppedItems(droppedItems);        // update dropped items
  saveInventory();
  hideMenus();
}

function rotatePlacedItem(id) {
  alert(`Rotate placed item ${id} (add real logic later)`);
  hideMenus();
}
function inspectPlacedItem(id) {
  const map = maps[currentMap];
  const item = map.placedItems.find(item => item.id === id);
  if (!item) return;

  // Convert full object to a nicely formatted string
  const itemData = JSON.stringify(item, null, 2);

  alert(`Inspecting Item Data:\n${itemData}`);
  hideMenus();
}


// 🧰 : interactWithPlacedItem()
function interactWithPlacedItem(id) {
  const map = maps[currentMap];
  const item = map.placedItems.find(item => item.id === id);
  if (!item) return;

  const name = item.name.toLowerCase();
  const type = item.type.toLowerCase();
  if (type === 'object') {
    if (name.includes('box')) {
      openStorageUI(item);
    } else if (name.includes('tree')) {
      interactWithTree(item);
	  console.log(`${item.name} interactWithTree called.`);
    } else if (name.includes('bed')) {
	  console.log(`${item.name} interactWithTree called.`);
      rest();
    } else {
      alert(`You interact with the ${item.name}, but nothing happens... yet.`);
    }
  } else {
    alert(`${item.name} is not something you can interact with.`);
  }

  hideMenus();
}

function interactWithNearestPlacedItem() {
  const pixelb8 = document.getElementById('pixelb8');
  const playerX = parseFloat(pixelb8.style.left);
  const playerY = parseFloat(pixelb8.style.top);

  const collisionBox = {
    x: playerX,
    y: playerY,
    width: 42, // Adjust to match your sprite
    height: 42
  };

  const placedItems = maps[currentMap]?.placedItems || [];
  let nearestItem = null;
  let nearestDistance = Infinity;
  const radius = 70;

  placedItems.forEach(item => {
    const box = item.collisionBox || item;
    const itemCenterX = box.x - (box.width || 44) / 2;
    const itemCenterY = box.y - (box.height || 24) / 2;

    const playerCenterX = collisionBox.x + collisionBox.width / 2;
    const playerCenterY = collisionBox.y + collisionBox.height / 2;

    const dx = itemCenterX - playerCenterX;
    const dy = itemCenterY - playerCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= radius && distance < nearestDistance) {
      nearestDistance = distance;
      nearestItem = item;
    }
  });

  if (nearestItem) {
    interactWithPlacedItem(nearestItem.id);
  } else {
    console.log('No nearby item to interact with.');
  }
}

// ✅ storage box functions
function storeItemInBox(itemId, box) {
  const itemIndex = inventory.findIndex(i => i.id === itemId);
  if (itemIndex === -1) return alert("Item not found in inventory");

  if (box.storage.contents.length >= box.storage.capacity) {
    return alert("Storage box is full!");
  }

  const [item] = inventory.splice(itemIndex, 1);
  box.storage.contents.push(item);
  box.hasContents = true;

  saveInventory();
  renderInventory();
  openStorageUI(box);
}

function initBoxStorage(box, capacity = 16) {
  if (!box.storage) {
    box.storage = {
      contents: new Array(capacity).fill(null),
      capacity: capacity,
    };
    box.hasContents = false;
  }
}

function openStorageUI(box) {
  if (!box.storage) {
    console.warn("Box missing storage property");
    return;
  }
  if (!Array.isArray(box.storage.contents)) {
    box.storage.contents = new Array(box.storage.capacity).fill(null);
  }

  let modal = document.getElementById('storage-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'storage-modal';
    modal.style.position = 'absolute';
    modal.style.top = '50px';
    modal.style.left = '50px';
    modal.style.width = '300px';
    modal.style.background = '#001020';
    modal.style.color = '#00e5ff';
    modal.style.border = '2px solid #00e5ff';
    modal.style.padding = '10px';
    modal.style.zIndex = '10000';
    modal.style.fontFamily = 'monospace';

    const closeBtn = document.createElement('button');
    closeBtn.innerText = "Close";
    closeBtn.onclick = () => modal.remove();
    modal.appendChild(closeBtn);
    // Add your header span here
    const headerSpan = document.createElement('span');
    headerSpan.textContent = `${box.name || 'container'} Contents`;
    headerSpan.style.display = 'block';
    headerSpan.style.textAlign = 'center';
    headerSpan.style.margin = '10px 0';
    headerSpan.style.fontWeight = 'bold';
    headerSpan.style.fontSize = '16px';
    modal.appendChild(headerSpan);
    const container = document.createElement('div');
    container.id = 'storage-contents';
    container.style.display = 'grid';
    container.style.gridTemplateColumns = 'repeat(4, 1fr)';
    container.style.marginTop = '10px';
    modal.appendChild(container);

    document.body.appendChild(modal);
  } else {
    modal.style.display = 'block';
  }
  // Also update the header text if modal is reused for another box
  const headerSpan = modal.querySelector('span');
  if (headerSpan) {
    headerSpan.textContent = `${box.name || 'container'} Contents`;
  }
  renderStorageContents(box);

}

function renderStorageContents(box) {
  const contents = box.storage.contents;
  const container = document.getElementById('storage-contents');
  if (!container) return;
  container.innerHTML = '';

  for (let i = 0; i < box.storage.capacity; i++) {
    const slot = document.createElement('div');
    slot.style.border = '1px solid #00e5ff';
    slot.style.height = '40px';
    slot.style.display = 'flex';
    slot.style.alignItems = 'center';
    slot.style.justifyContent = 'center';
    slot.style.fontSize = '20px';
    slot.style.userSelect = 'none';

    const item = contents[i];
    if (item) {
      slot.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 20px;">
          <span>${item.icon || '?'}</span>
          <span style="
            position: absolute;
            bottom: 2px;
            right: 4px;
            font-size: 12px;
            color: #00e5ff;
            font-weight: bold;
            user-select: none;
            pointer-events: none;
          ">x${item.quantity}</span>
        </div>
      `;
      slot.title = `${item.name} x${item.quantity}`;

      slot.onclick = () => {
        addItem({ ...item });
        contents[i] = null;
        box.hasContents = contents.some(Boolean);
        renderInventory();
        renderStorageContents(box);
      };
    } else {
      slot.textContent = '+';
      slot.title = 'Empty slot - drop item here';

      slot.onclick = () => {
        const itemToStore = inventory[0];
        if (!itemToStore) return alert("No items in inventory.");
        if (contents.filter(item => item !== null).length >= box.storage.capacity) {
          alert("Box is full!");
          return;
        }

        // ✅ Store half if sneaking
        const storeQuantity = isSneaking ? Math.max(1, Math.floor(itemToStore.quantity / 2)) : itemToStore.quantity;

        contents[i] = { ...itemToStore, quantity: storeQuantity };
        removeItem(itemToStore.id, storeQuantity);
        box.hasContents = true;
        renderInventory();
        renderStorageContents(box);
      };
    }

    // Drag and drop handlers
    slot.addEventListener('dragover', (e) => {
      e.preventDefault();
      slot.style.backgroundColor = '#003355';
      e.dataTransfer.dropEffect = 'move';
    });

    slot.addEventListener('dragleave', () => {
      slot.style.backgroundColor = '';
    });

    slot.addEventListener('drop', (e) => {
      e.preventDefault();
      slot.style.backgroundColor = '';

      const rawData = e.dataTransfer.getData('text/plain');
      if (!rawData) return;

      let dragged;
      try {
        dragged = JSON.parse(rawData);
      } catch (err) {
        alert("Invalid drag data");
        return;
      }

      const itemId = dragged.id;

      if (contents[i] !== null) {
        alert("Slot already occupied!");
        return;
      }

      const itemIndex = inventory.findIndex(invItem => invItem.id === itemId);
      if (itemIndex === -1) {
        alert("Item not found in inventory!");
        return;
      }

      const itemToStore = inventory[itemIndex];
      const actualQuantity = itemToStore.quantity;

      // ✅ Correctly calculate half or full
      const storeQuantity = isSneaking ? Math.max(1, Math.floor(actualQuantity / 2)) : actualQuantity;

      contents[i] = { ...itemToStore, quantity: storeQuantity };
      removeItem(itemId, storeQuantity);
      box.hasContents = contents.some(Boolean);
      renderInventory();
      renderStorageContents(box);
    });

    container.appendChild(slot);
  }
}

function nudgeNearbyItemsAway(dropX, dropY, dropItems, minDistance = 20, pushStrength = 30) {
  for (const item of dropItems) {
    const dx = item.x - dropX;
    const dy = item.y - dropY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < minDistance && distance > 1) {
      const angle = Math.atan2(dy, dx);
      item.x += Math.cos(angle) * pushStrength;
      item.y += Math.sin(angle) * pushStrength;
    }
  }
}


function interactWithTree(item) {
  const dropItems = droppedItemsByMap[currentMap];
  const numberOfDrops = Math.random() < 0.2 ? 2 : 1; // 20% chance of two drops

  for (let i = 0; i < numberOfDrops; i++) {
    // Use polar coordinates for controlled distance
    const minDistance = 60;
    const maxDistance = 120;
    const angle = Math.random() * 2 * Math.PI;
    const radius = minDistance + Math.random() * (maxDistance - minDistance);
    const dropX = item.x + Math.cos(angle) * radius;
    const dropY = item.y + Math.sin(angle) * radius;

    const mergeThreshold = 42;
    const isSapling = Math.random() < 0.05; // 5% chance to drop a sapling
    const dropName = isSapling ? 'Sapling' : 'Apple';
    const dropIcon = isSapling ? '🌱' : '🍎';

    const existingDropped = dropItems.find(droppedItem => {
      const dx = droppedItem.x - dropX;
      const dy = droppedItem.y - dropY;
      return (
        Math.sqrt(dx * dx + dy * dy) <= mergeThreshold &&
        droppedItem.name === dropName
      );
    });

    nudgeNearbyItemsAway(dropX, dropY, dropItems);

    if (existingDropped) {
      existingDropped.quantity += 1;
    } else {
      dropItems.push({
        id: createUniqueItemId(dropName),
        name: dropName,
        icon: dropIcon,
        size: 'small',
        weight: 1,
        type: isSapling ? 'plant' : 'food',
        quantity: 1,
        x: dropX,
        y: dropY,
        isNewDrop: true
      });
    }

    console.log(`${item.name} dropped a ${dropName}!`);
  }

  saveInventory();
  renderDroppedItems(dropItems);

  const domElement = document.getElementById(item.id);
  if (domElement) {
    domElement.classList.add('wobble');
    setTimeout(() => domElement.classList.remove('wobble'), 600);
  }
}


function cutDownTree(id) {
  const map = maps[currentMap];
  const item = map.placedItems.find(p => p.id === id);
  if (!item) return;

  // Find an axe in inventory
  const axeIndex = inventory.findIndex(i => i.name.toLowerCase().includes('axe'));
  if (axeIndex === -1) {
    alert("You need an axe to cut down this tree.");
    return;
  }

  const playerEl = document.getElementById('pixelb8');
  if (!playerEl) return;

  const playerRect = playerEl.getBoundingClientRect();
  const startX = playerRect.left + playerRect.width / 2;
  const startY = playerRect.top + playerRect.height / 2;

  const targetX = item.x + (item.collisionBox?.width || 44) / 2;
  const targetY = item.y + (item.collisionBox?.height || 24) / 2;

  const flyEl = document.createElement('div');
  flyEl.classList.add('flying-item');
  flyEl.textContent = '🪓';
  flyEl.style.position = 'fixed';
  flyEl.style.left = `${startX}px`;
  flyEl.style.top = `${startY}px`;
  flyEl.style.fontSize = '28px';
  flyEl.style.pointerEvents = 'none';
  flyEl.style.zIndex = 9999;
  document.body.appendChild(flyEl);

  const duration = 800;
  const arcHeight = -150;
  const deltaX = targetX - startX;
  const deltaY = targetY - startY;
  const startTime = performance.now();

  function animate(time) {
    const t = Math.min((time - startTime) / duration, 1);
    const currentX = startX + deltaX * t;
    const peakY = startY + arcHeight;
    const currentY = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * peakY + t * t * targetY;
    const rotation = 720 * t;

    flyEl.style.left = `${currentX}px`;
    flyEl.style.top = `${currentY}px`;
    flyEl.style.transform = `rotate(${rotation}deg)`;

    if (t < 1) {
      requestAnimationFrame(animate);
    } else {
      flyEl.style.opacity = '0';
      setTimeout(() => flyEl.remove(), 200);

      applyDamageRadius(1, targetX, targetY);

      // Drop wood
      droppedItemsByMap[currentMap].push({
        id: createUniqueItemId('Wood'),
        name: 'Wood',
        icon: '📏',
        size: 'normal',
        weight: 2,
        type: 'material',
        quantity: 1,
        x: item.x + 10,
        y: item.y + 10
      });

      // 5% chance the axe is lost
      const axeDrops = Math.random() > 0.05;

      if (axeDrops) {
        const axe = inventory[axeIndex];

        droppedItemsByMap[currentMap].push({
          id: createUniqueItemId(axe.name),
          name: axe.name,
          icon: axe.icon || '🪓',
          size: axe.size || 'large',
          weight: axe.weight || 1,
          type: axe.type || 'tool',
          quantity: 1,
          x: item.x + 5,
          y: item.y + 5
        });
      }

      // Remove 1 axe from inventory
      const axe = inventory[axeIndex];
      if (axe.quantity > 1) {
        axe.quantity -= 1;
      } else {
        inventory.splice(axeIndex, 1);
      }

      map.placedItems = map.placedItems.filter(p => p.id !== id);
      renderPlacedItems(map.placedItems);
      renderDroppedItems(droppedItemsByMap[currentMap]);
      saveInventory();
      renderInventory();
    }
  }

  requestAnimationFrame(animate);
}



function stackInventoryItems() {
  const merged = {};

  inventory.forEach(item => {
    // Normalize key for stacking (ignore case + space differences)
    const baseKey = item.name.toLowerCase().trim();

    if (merged[baseKey]) {
      merged[baseKey].quantity += item.quantity;
    } else {
      // Clone the item and reset the ID to the name without spaces
      const newItem = { ...item };
      newItem.id = newItem.name.trim().replace(/\s+/g, '');
      merged[baseKey] = newItem;
    }
  });

  inventory = Object.values(merged);
  renderInventory();
}


function renderInventory() {
  let invDiv = document.getElementById('inventory');
  if (!invDiv) {
    invDiv = document.createElement('div');
    invDiv.id = 'inventory';

    invDiv.innerHTML = `
      <div id="inventory-header">Prison Wallet</div>
	  <button id="close-inventory-btn" onclick="toggleInventory()"style="position: absolute; top: 5px; right: 5px; z-index: 999;">❌</button>
      <div id="inventory-equipment">
        <div id="held-item-slot" class="inventory-icon" title="Held Item (Click to unequip)">✋</div>
      </div>
      <div id="inventory-grid"></div>
      <div id="inventory-info"></div>
    `;
    document.body.appendChild(invDiv);
  }

  const grid = document.getElementById('inventory-grid');
  const infoBox = document.getElementById('inventory-info');
  const heldSlot = document.getElementById('held-item-slot');

  grid.innerHTML = '';
  infoBox.textContent = '';
  heldSlot.innerHTML = ''; // Clear it

  // Render held item if any
  if (heldItem) {
    heldSlot.innerHTML = `
      <div class="icon">${heldItem.icon || '❓'}</div>
      <div class="qty">x${heldItem.quantity}</div>
    `;
    heldSlot.onclick = () => {
      // Unequip and return to inventory
      const existing = inventory.find(i => i.id === heldItem.id);
      if (existing) {
        existing.quantity += heldItem.quantity;
      } else {
        inventory.push({ ...heldItem });
      }
      heldItem = null;
      renderInventory();
    };
  } else {
    heldSlot.innerHTML = `<div class="icon">✋</div>`;
    heldSlot.onclick = null;
  }

  // Show empty message if inventory is empty
  if (inventory.length === 0) {
    grid.innerHTML = '<div style="grid-column: span 4;"><b>Inventory is empty</b></div>';
    return;
  }

  // Render each inventory item
  inventory.forEach((item, index) => {
	  const slot = document.createElement('div');
	  slot.className = "inventory-icon";
	  slot.setAttribute('draggable', 'true');

	  // Add drag start
/* 	  slot.addEventListener('dragstart', (e) => {
		e.dataTransfer.setData('text/plain', JSON.stringify({
		  id: item.id,
		  quantity: item.quantity
		}));
		e.dataTransfer.effectAllowed = 'move';
	  }); */
	  slot.addEventListener('dragstart', (e) => {
		  const ghost = document.createElement('div');
		  ghost.className = 'drag-ghost';
		  ghost.innerText = `'📦⬅' ${item.icon || '?'} ${item.name} x${item.quantity} ${isSneaking ? '½' :'all'} `;
		  document.body.appendChild(ghost);
		  e.dataTransfer.setDragImage(ghost, 0, 0);

		  e.dataTransfer.setData('text/plain', JSON.stringify({
			id: item.id,
			quantity: item.quantity
		  }));
		  e.dataTransfer.effectAllowed = 'move';

		  setTimeout(() => document.body.removeChild(ghost), 0);
	  });

	  slot.addEventListener('mouseenter', () => {
		const details = Object.entries(item)
		  .map(([key, value]) => `${key}: ${value}`)
		  .join('\n');
		infoBox.textContent = details;
	  });

	  slot.addEventListener('mouseleave', () => {
		infoBox.textContent = '';
	  });

	  // Equip logic (same as before)
	  slot.addEventListener('click', () => {
		if (item.type === 'tool' || item.type === 'food') {
		  if (!heldItem) {
			heldItem = { ...item, quantity: 1 };
			item.quantity--;
			if (item.quantity <= 0) inventory.splice(index, 1);
		  } else if (heldItem.id === item.id) {
			if (item.quantity > 0) {
			  heldItem.quantity++;
			  item.quantity--;
			  if (item.quantity <= 0) inventory.splice(index, 1);
			}
		  } else {
			const existing = inventory.find(i => i.id === heldItem.id);
			if (existing) {
			  existing.quantity += heldItem.quantity;
			} else {
			  inventory.push({ ...heldItem });
			}
			heldItem = { ...item, quantity: 1 };
			item.quantity--;
			if (item.quantity <= 0) inventory.splice(index, 1);
		  }
		  renderInventory();
		}
	  });

	  slot.addEventListener('contextmenu', (e) => {
		e.preventDefault();
		if (item.type === 'tool' || item.type === 'food') {
		  if (!heldItem || heldItem.id !== item.id) {
			if (heldItem) {
			  const existing = inventory.find(i => i.id === heldItem.id);
			  if (existing) existing.quantity += heldItem.quantity;
			  else inventory.push({ ...heldItem });
			}
			heldItem = { ...item };
			inventory.splice(index, 1);
		  } else {
			heldItem.quantity += item.quantity;
			inventory.splice(index, 1);
		  }
		  renderInventory();
		}
	  });

	  slot.innerHTML = `
		<div class="icon">${item.icon || '❓'}</div>
		<div class="qty">x${item.quantity}</div>
		<button class="drop-btn">−</button>
	  `;

	  slot.querySelector('.drop-btn').onclick = (e) => {
		e.stopPropagation();
		dropItem(item.id, 1);
	  };

	  grid.appendChild(slot);
  });
}


let inventoryOpen = false;

function openInventory() {
  const inv = document.getElementById('inventory');
  if (!inv) return;

  inventoryOpen = !inventoryOpen;

  if (inventoryOpen) {
    inv.style.display = 'block';
    inv.style.opacity = '1';
  } else {
    inv.style.opacity = '0';
    setTimeout(() => inv.style.display = 'none', 300);
  }
  stackInventoryItems();
  // Update menu option label dynamically (optional enhancement)
  updateContextMenuOption('🎒', inventoryOpen ? 'Close Inventory' : 'Open Inventory');
}

function closeInventory() {
  const invDiv = document.getElementById('inventory');
  if (invDiv) invDiv.style.display = 'none';
  isInventoryOpen = false;
}
function toggleInventory() {
  if (isInventoryOpen) {
    closeInventory();
  } else {
    openInventory();
  }
}




//----------------
//menus and ui logic
const customMenu = document.getElementById('customMenu');
let rightClickPos = { x: 0, y: 0 };

function updateContextMenuOption(emoji, newLabel) {
  const allOptions = document.querySelectorAll('.menu-option');
  allOptions.forEach(opt => {
    if (opt.textContent.trim().startsWith(emoji)) {
      opt.textContent = `${emoji} ${newLabel}`;
      opt.setAttribute('onclick', 'openInventory()'); // ensure it's still clickable
    }
  });
}


function placeholderOption2() {
  alert('Option 2 clicked!');
  document.getElementById('customMenu').style.display = 'none';
}
function hideMenus() {
  document.querySelectorAll('.context-menu').forEach(m => m.style.display = 'none');
}

function createMenuOptions(target) {
  let options = '';

  // Common option: move to, or throw
  options += `<div class="menu-option" onclick="moveTo(${rightClickPos.x}, ${rightClickPos.y})">🧭 Move to Here</div>`;
  // Only show "Throw" if an item is held
  if (heldItem) {
    options += `<div class="menu-option" onclick="throwHeldItem(${rightClickPos.x}, ${rightClickPos.y})">🗑️ Throw ${heldItem.name}</div>`;
  }
  // Dropped items
  if (target.classList.contains('dropped-item')) {
    const id = target.dataset.id;
    const droppedItem = droppedItemsByMap[currentMap].find(item => item.id === id);

    options += `<div class="menu-option" onclick="moveToAndPickUpItem(${rightClickPos.x}, ${rightClickPos.y}, '${id}')">❌ 👜 Pick Up</div>`;

    if (droppedItem?.type === 'sapling') {
      options += `<div class="menu-option" onclick="plantSapling('${id}')">🌱 Plant</div>`;
    }
    if (droppedItem?.type === 'object') {
      options += `<div class="menu-option" onclick="placeObject('${id}')">🧱 Place</div>`;
    }
  }

  // Placed items
  if (target.classList.contains('placed-item')) {
    const id = target.id;
    const map = maps[currentMap];
    const placedItem = map.placedItems.find(item => item.id === id);

    if (!placedItem) return options;

    const name = placedItem.name.toLowerCase();
    const type = placedItem.type?.toLowerCase() || '';
    const canPickUp = !placedItem.hasContents;
//interact with placed item logic
    // 📦 Storage box support
    if (name.includes('box')) {
      options += `<div class="menu-option" onclick="interactWithPlacedItem('${id}')">📦 Open Storage</div>`;
    }

    // 🌳 Tree logic
    if (name.includes('tree')) {
      options += `<div class="menu-option" onclick="moveToAndInteractWithPlacedItem(${rightClickPos.x}, ${rightClickPos.y}, '${id}')">🌳 Go Shake</div>`;
      options += `<div class="menu-option" onclick="cutDownTree('${id}')">🪓 Cut Down</div>`;
	  options += `<div class="menu-option" onclick="destroyPlacedItem('${id}')">❌ Destroy</div>`;
    }

    options += `<div class="menu-option" onclick="inspectPlacedItem('${id}')">🔍 Inspect</div>`;
    options += `<div class="menu-option" onclick="rotatePlacedItem('${id}')">🔄 Rotate</div>`;
    if (canPickUp) {
      options += `<div class="menu-option" onclick="moveItemToInventory('${id}')">🎒 Store</div>`;
      options += `<div class="menu-option" onclick="moveItemToDroppedItems('${id}')">❌ Drop</div>`;
    } else {
      options += `<div class="menu-option" style="color: gray;" title="Box must be empty to pick up.">🚫 Cannot Pick Up (Has Items)</div>`;
    }

    options += `<div class="menu-option" onclick="destroyPlacedItem('${id}')">❌ Destroy</div>`;
  }

  // Player context
  if (target.classList.contains('player-character')) {
    options += `
      <div class="menu-option" onclick="toggleInventory()">
        ${isInventoryOpen ? '❌ Close Inventory' : '🎒 Open Inventory'}
      </div>
      <div class="menu-option" onclick="rest()">🛏️ Rest</div>
    `;
  }

  return options;
}
function showCustomMenu(x, y, contentHTML) {
  customMenu.innerHTML = contentHTML;
  customMenu.style.top = `${y}px`;
  customMenu.style.left = `${x}px`;
  customMenu.style.display = 'block';
}

// Main context menu logic
gameArea.addEventListener('contextmenu', (e) => {
  if (e.ctrlKey) return; // Allow browser menu with Ctrl
  e.preventDefault();
  hideMenus();

  const clicked = e.target.closest('.dropped-item, #pixelb8, #gameArea, .placed-item'); // extend this selector as needed

  const gameRect = gameArea.getBoundingClientRect();
  rightClickPos = {
    x: e.clientX - gameRect.left,
    y: e.clientY - gameRect.top
  };
  const options = createMenuOptions(clicked || gameArea);
  showCustomMenu(e.pageX, e.pageY, options);
});


gameArea.addEventListener('click', function(event) {
  const rect = gameArea.getBoundingClientRect();

  // Get raw click position within gameArea
  const rawX = event.clientX - rect.left;
  const rawY = event.clientY - rect.top;

  // Convert to virtual (unscaled) coordinates
  const scaledClickPos = {
    x: rawX / scale,
    y: rawY / scale
  };

  console.log("Scaled click position:", scaledClickPos);

  // Move the character to the scaled position
  moveTo(scaledClickPos.x, scaledClickPos.y);

  // Check if a placed item (like a tree or box) was clicked
  const placedItem = event.target.closest('.placed-item');
  if (placedItem) {
    const pixelb8 = document.getElementById('pixelb8');
    const playerX = parseFloat(pixelb8.style.left);
    const playerY = parseFloat(pixelb8.style.top);
    const itemX = parseFloat(placedItem.style.left);
    const itemY = parseFloat(placedItem.style.top);

    const dx = playerX - itemX;
    const dy = playerY - itemY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance <= 50) {
      interactWithPlacedItem(placedItem.dataset.id); // assuming item.id is stored in data-id
    }
  }
});

document.addEventListener('click', hideMenus);

// Optional: Show browser menu manually
function showDefaultMenu(e) {
  hideMenus();
  window.removeEventListener('contextmenu', preventDefaultContextMenu, true);
  document.elementFromPoint(e.clientX, e.clientY).dispatchEvent(
    new MouseEvent('contextmenu', {
      bubbles: true,
      cancelable: true,
      clientX: e.clientX,
      clientY: e.clientY
    })
  );
  window.addEventListener('contextmenu', preventDefaultContextMenu, true);
}

// Prevent default globally
function preventDefaultContextMenu(e) {
  if (!e.ctrlKey) e.preventDefault();
}
window.addEventListener('contextmenu', preventDefaultContextMenu, true);

document.addEventListener('keydown', (e) => {
  if (e.key === 'i' || e.key === 'I') {
    e.preventDefault(); // Prevent default browser actions (like opening dev tools on some setups)
    toggleInventory();
  }
});
document.addEventListener('keydown', function (event) {
  if (event.key === 'f' || event.key === 'F') {
    interactWithNearestPlacedItem();
  }
});


//onloadstuffs
// Load inventory and dropped items on game start
loadInventory();
renderDroppedItems();
saveInventory();
  
/* addItem({ id: 'apple', name: 'Apple', icon: "🍎", quantity: 3, size: 'small', type: 'food' });
addItem({ id: 'storagebox', name: 'StorageBox', icon: "📦", quantity: 1, size: 'large', type: 'object' });
addItem({ id: 'applesappling', name: 'Tree Sapling', icon: "🌱", quantity: 2, size: 'small', type: 'sapling' });
addItem({ id: 'underwearGnome', name: 'underwearGnome', icon: "🧚", quantity: 5, size: 'large', type: 'itemtype3' });
addItem({ id: 'wrench', name: 'Item Type 4', icon: "🔧", quantity: 1, size: 'normal', type: 'itemtype4' }); */

/* addItem({ id: 'Apple', name: 'Apple', icon: "🍎", quantity: 3, size: 'small', type: 'food' });
addItem({ id: 'Box', name: 'Box', icon: "📦", quantity: 1, size: 'large', type: 'object' });
addItem({ id: 'Sapling', name: 'Sapling', icon: "🌱", quantity: 1, size: 'tiny', type: 'sapling' });
addItem({ id: 'wrench', name: 'wrench', icon: "🔧", quantity: 10, size: 'normal', type: 'tool' });
addItem({ id: 'axe', name: 'axe', icon: "🪓", quantity: 10, size: 'large', type: 'tool' });
addItem({ id: 'pickle', name: 'Pickle', icon: "🥒", quantity: 1, size: 'normal', type: 'food' });
addItem({ id: 'tinyShovel', name: 'tinyShovel', icon: "🥄", quantity: 10, size: 'normal', type: 'tool' }); */

//spawning enemies 
//example usage    (block comment when finished testing)
/* spawnEnemy('sneakyGoblin', 150, 200, currentMap);
spawnEnemy('angryGoblin', 350, 200, currentMap);
spawnEnemy('sleepyGoblin', 100, 300, currentMap); */


//idk if these work anymore ------------------------------
//these spawn top left with no movement logic or something
//spawnEnemy() //→ spawns a random enemy at a random position.
//→ spawns that enemy at a random spot.
//spawnEnemy('sneakyGoblin') 
//========================================================


