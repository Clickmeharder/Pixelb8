// Basic inventory and dropped items arrays
let targetPosition = null;
let inventory = [];
let isInventoryOpen = false;
let droppedItemsByMap = {
  house: [],
  street: []
};
// Try to load from localStorage
/* function loadInventory() {
  const savedInventory = localStorage.getItem('pixelb8_inventory');
  const savedDropped = localStorage.getItem('pixelb8_droppedItems');
  inventory = savedInventory ? JSON.parse(savedInventory) : [];
  droppedItems = savedDropped ? JSON.parse(savedDropped) : [];
  stackInventoryItems();
} */
function loadInventory() {
  const savedInventory = localStorage.getItem('pixelb8_inventory');
  const savedDropped = localStorage.getItem('pixelb8_droppedItemsByMap');
  const savedPlaced = localStorage.getItem('pixelb8_placedItemsByMap');

  inventory = savedInventory ? JSON.parse(savedInventory) : [];

  const defaultMapStructure = { house: [], street: [] };
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

function createUniqueItemId(baseName) {
  return `${baseName}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
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


const moveThreshold = 2;
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

  alert(`Inspecting: ${item.name}\nType: ${item.type}\nQuantity: ${item.quantity || 1}`);
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
    } else if (name.includes('bed')) {
      rest();
    } else {
      alert(`You interact with the ${item.name}, but nothing happens... yet.`);
    }
  } else {
    alert(`${item.name} is not something you can interact with.`);
  }

  hideMenus();
}


// ✅ NEW interaction functions
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
        if (contents.length >= box.storage.capacity) {
          alert("Box is full!");
          return;
        }

        contents[i] = { ...itemToStore };
        removeItem(itemToStore.id, itemToStore.quantity);
        box.hasContents = true;
        renderInventory();
        renderStorageContents(box);
      };
    }

    // Drag and drop handlers for each slot
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
      const quantity = dragged.quantity || 1;

      if (contents[i]) {
        alert("Slot already occupied!");
        return;
      }

      const itemIndex = inventory.findIndex(invItem => invItem.id === itemId);
      if (itemIndex === -1) {
        alert("Item not found in inventory!");
        return;
      }

      const itemToStore = inventory[itemIndex];

      contents[i] = {
        ...itemToStore,
        quantity
      };

      removeItem(itemId, quantity);
      box.hasContents = contents.some(Boolean);

      renderInventory();
      renderStorageContents(box);
    });

    container.appendChild(slot);
  }
}

function interactWithTree(item) {
  const dropX = item.x + 20 + Math.random() * 30;
  const dropY = item.y + 10 + Math.random() * 20;

  const droppedItems = droppedItemsByMap[currentMap];

  droppedItems.push({
    id: createUniqueItemId('Apple'),
    name: 'Apple',
    icon: '🍎',
    size: 'small',
    weight: 1,
    type: 'food',
    quantity: 1,
    x: dropX,
    y: dropY
  });

  saveInventory();
  renderDroppedItems(droppedItems);

  alert(`${item.name} dropped an 🍎!`);
}

function cutDownTree(id) {
  const map = maps[currentMap];
  const item = map.placedItems.find(p => p.id === id);
  if (!item) return;

  const hasAxe = inventory.some(i => i.name.toLowerCase().includes('axe'));
  if (!hasAxe) {
    alert("You need an axe to cut down this tree.");
    return;
  }

  // Optional: drop wood item
  droppedItemsByMap[currentMap].push({
    id: createUniqueItemId('Wood'),
    name: 'Wood',
    icon: '🪵',
    size: 'normal',
    weight: 2,
    type: 'material',
    quantity: 1,
    x: item.x + 10,
    y: item.y + 10
  });

  // Remove tree
  map.placedItems = map.placedItems.filter(p => p.id !== id);
  renderPlacedItems(map.placedItems);
  renderDroppedItems(droppedItemsByMap[currentMap]);
  saveInventory();
}

//inventory functions 
function stackInventoryItems() {
  const merged = {};

  inventory.forEach(item => {
    const key = item.name; // or use item.id if stacking only exact IDs
    if (merged[key]) {
      merged[key].quantity += item.quantity;
    } else {
      // Clone the item to avoid modifying original references
      merged[key] = { ...item };
    }
  });

  // Replace inventory with merged results
  inventory = Object.values(merged);
  renderInventory();
}

// Render inventory UI
function renderInventory() {
  let invDiv = document.getElementById('inventory');
  if (!invDiv) {
    invDiv = document.createElement('div');
    invDiv.id = 'inventory';
    invDiv.style.position = 'absolute';
    invDiv.style.right = '10px';
    invDiv.style.top = '10px';
    invDiv.style.width = '240px';
    invDiv.style.maxHeight = '400px';
    invDiv.style.overflowY = 'auto';
    invDiv.style.background = 'rgba(0, 0, 40, 0.85)';
    invDiv.style.color = '#00e5ff';
    invDiv.style.padding = '12px';
    invDiv.style.border = '2px solid #00e5ff';
    invDiv.style.borderRadius = '8px';
    invDiv.style.fontFamily = '"Press Start 2P", monospace';
    invDiv.style.fontSize = '11px';
    invDiv.style.zIndex = '10000';
    invDiv.style.display = 'none';
    invDiv.style.boxShadow = '0 0 12px #00e5ff';
    invDiv.style.textShadow = '0 0 4px #00e5ff';
    invDiv.style.transition = 'opacity 0.3s ease';

    // Add inventory header
    const header = document.createElement('div');
    header.textContent = "Prison Wallet";
    header.style.textAlign = 'center';
    header.style.fontWeight = 'bold';
    header.style.fontSize = '16px';
    header.style.marginBottom = '8px';
    invDiv.appendChild(header);

    const gridContainer = document.createElement('div');
    gridContainer.id = 'inventory-grid';
    gridContainer.style.display = 'grid';
    gridContainer.style.gridTemplateColumns = 'repeat(4, 50px)';
    gridContainer.style.gridGap = '6px';
    gridContainer.style.marginTop = '8px';
    invDiv.appendChild(gridContainer);

    const infoBox = document.createElement('div');
    infoBox.id = 'inventory-info';
    infoBox.style.marginTop = '14px';
    infoBox.style.padding = '6px';
    infoBox.style.borderTop = '1px solid #00e5ff';
    infoBox.style.fontSize = '12px';
    infoBox.style.whiteSpace = 'pre-wrap';
    infoBox.style.minHeight = '40px';
    infoBox.style.color = '#00e5ff';
    invDiv.appendChild(infoBox);

    document.body.appendChild(invDiv);
  }

	const grid = document.getElementById('inventory-grid');
	const infoBox = document.getElementById('inventory-info');
	grid.innerHTML = '';
	infoBox.textContent = '';

	if (inventory.length === 0) {
		grid.innerHTML = '<div style="grid-column: span 4;"><b>Inventory is empty</b></div>';
		return;
	}

	inventory.forEach(item => {
		const slot = document.createElement('div');
		slot.classList.add("inventory-icon");

		slot.style.width = '48px';
		slot.style.height = '48px';
		slot.style.border = '1px solid #00e5ff';
		slot.style.borderRadius = '4px';
		slot.style.background = 'rgba(0, 15, 30, 0.9)';
		slot.style.display = 'flex';
		slot.style.alignItems = 'center';
		slot.style.justifyContent = 'center';
		slot.style.flexDirection = 'column';
		slot.style.position = 'relative';
		slot.style.boxShadow = 'inset 0 0 8px #00e5ff70';
		slot.style.cursor = 'pointer';

		slot.setAttribute('draggable', 'true');
		slot.addEventListener('dragstart', (e) => {
			const isShift = e.shiftKey;
			const qtyToDrag = isShift ? Math.floor(item.quantity / 2) : item.quantity;

			if (qtyToDrag <= 0) {
				e.preventDefault();
				return alert("Can't split 1 item");
			}

			e.dataTransfer.setData('text/plain', JSON.stringify({
				id: item.id,
				quantity: qtyToDrag,
				split: isShift
			}));
			e.dataTransfer.effectAllowed = 'move';
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

		const icon = document.createElement('div');
		icon.textContent = item.icon || '❓';
		icon.style.fontSize = '18px';

		const qty = document.createElement('div');
		qty.textContent = `x${item.quantity}`;
		qty.style.fontSize = '9px';
		qty.style.position = 'absolute';
		qty.style.bottom = '2px';
		qty.style.right = '4px';
		qty.style.color = '#00e5ff';

		const dropBtn = document.createElement('button');
		dropBtn.textContent = '−';
		dropBtn.style.position = 'absolute';
		dropBtn.style.top = '0px';
		dropBtn.style.right = '0px';
		dropBtn.style.background = 'transparent';
		dropBtn.style.color = '#00e5ff';
		dropBtn.style.border = 'none';
		dropBtn.style.cursor = 'pointer';
		dropBtn.style.fontSize = '10px';
		dropBtn.onclick = () => dropItem(item.id, 1);

		slot.appendChild(icon);
		slot.appendChild(qty);
		slot.appendChild(dropBtn);
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



function updateContextMenuOption(emoji, newLabel) {
  const allOptions = document.querySelectorAll('.menu-option');
  allOptions.forEach(opt => {
    if (opt.textContent.trim().startsWith(emoji)) {
      opt.textContent = `${emoji} ${newLabel}`;
      opt.setAttribute('onclick', 'openInventory()'); // ensure it's still clickable
    }
  });
}


//----------------
//menus and ui logic
const customMenu = document.getElementById('customMenu');
let rightClickPos = { x: 0, y: 0 };

function placeholderOption2() {
  alert('Option 2 clicked!');
  document.getElementById('customMenu').style.display = 'none';
}
function hideMenus() {
  document.querySelectorAll('.context-menu').forEach(m => m.style.display = 'none');
}

function createMenuOptions(target) {
  let options = '';

  // Common option: move to
  options += `<div class="menu-option" onclick="moveTo(${rightClickPos.x}, ${rightClickPos.y})">🧭 Move to Here</div>`;

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

    // 📦 Storage box support
    if (name.includes('box')) {
      options += `<div class="menu-option" onclick="interactWithPlacedItem('${id}')">📦 Open Storage</div>`;
    }

    // 🌳 Tree logic
    if (name.includes('tree')) {
      options += `<div class="menu-option" onclick="interactWithPlacedItem('${id}')">🌳 Shake Tree</div>`;
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


function deleteItemById(itemId) {
  const droppedIndex = droppedItems.findIndex(i => i.id === itemId);
  if (droppedIndex !== -1) {
    droppedItems.splice(droppedIndex, 1);
    renderDroppedItems();
    return;
  }

  const placedIndex = placedItems.findIndex(i => i.id === itemId);
  if (placedIndex !== -1) {
    placedItems.splice(placedIndex, 1);
    renderPlacedItems();
    return;
  }

  console.warn("Item not found in dropped or placed items:", itemId);
}

//onloadstuffs
// Load inventory and dropped items on game start
loadInventory();
renderDroppedItems();
renderInventory();
closeInventory();
/* addItem({ id: 'apple', name: 'Apple', icon: "🍎", quantity: 3, size: 'small', type: 'food' });
addItem({ id: 'storagebox', name: 'StorageBox', icon: "📦", quantity: 1, size: 'large', type: 'object' });
addItem({ id: 'applesappling', name: 'Tree Sapling', icon: "🌱", quantity: 2, size: 'small', type: 'sapling' });
addItem({ id: 'underwearGnome', name: 'underwearGnome', icon: "🧚", quantity: 5, size: 'large', type: 'itemtype3' });
addItem({ id: 'wrench', name: 'Item Type 4', icon: "🔧", quantity: 1, size: 'normal', type: 'itemtype4' }); */

addItem({ id: 'Apple', name: 'Apple', icon: "🍎", quantity: 3, size: 'small', type: 'food' });
addItem({ id: 'Box', name: 'Box', icon: "📦", quantity: 1, size: 'large', type: 'object' });
addItem({ id: 'Sapling', name: 'Sapling', icon: "🌱", quantity: 2, size: 'tiny', type: 'sapling' });
addItem({ id: 'underwearGnome', name: 'underwearGnome', icon: "🧚", quantity: 5, size: 'large', type: 'unique' });
addItem({ id: 'wrench', name: 'wrench', icon: "🔧", quantity: 1, size: 'small', type: 'tool' });
addItem({ id: 'axe', name: 'axe', icon: "🪓", quantity: 1, size: 'small', type: 'tool' });
addItem({ id: 'purplepickle', name: 'purplePickle', icon: "pp", quantity: 1, size: 'normal', type: 'unique' });