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

  inventory = savedInventory ? JSON.parse(savedInventory) : [];

  const defaultMapStructure = { house: [], street: [] };
  droppedItemsByMap = savedDropped ? JSON.parse(savedDropped) : defaultMapStructure;

  // Ensure all maps exist
  for (let map in maps) {
    if (!droppedItemsByMap[map]) droppedItemsByMap[map] = [];
  }
}
// Save inventory and dropped items persistently
function saveInventory() {
  stackInventoryItems();
  localStorage.setItem('pixelb8_inventory', JSON.stringify(inventory));
  localStorage.setItem('pixelb8_droppedItemsByMap', JSON.stringify(droppedItemsByMap));
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

const moveThreshold = 2;
let itemToPickUpIndex = null;
let placedItemToPickUpId = null;
let isMovingToPickup = false;

function PickupPlacedItem(id) {
  const map = maps[currentMap];
  const index = map.placedItems.findIndex(item => item.id === id);
  if (index === -1) return;

  const item = map.placedItems[index];

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
  if (!item || !item.type) {
    console.warn("Invalid item to place");
    return;
  }

  const map = maps[currentMap];

  const width = item.width || 32;
  const height = item.height || 32;

  const isBottomAnchored = item.type === 'object'; // customize as needed

  const placedX = x;
  const placedY = y;

  map.placedItems.push({
    id: createUniqueItemId(item.name), // ✅ use unique ID here
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
    placedFromDrop: false // this is a placed item, not from a drop
  });

  renderPlacedItems(map.placedItems);
}


function destroyPlacedItem(id) {
  const map = maps[currentMap];
  const index = map.placedItems.findIndex(item => item.id === id);
  if (index === -1) return;

  map.placedItems.splice(index, 1);
  renderPlacedItems(map.placedItems);
  hideMenus();
}
function moveItemToInventory(id) {
  const map = maps[currentMap];
  const index = map.placedItems.findIndex(item => item.id === id);
  if (index === -1) return;

  const item = map.placedItems[index]; // get item before removing it
  map.placedItems.splice(index, 1);    // remove from map

  addItem(item);                       // add to inventory
  renderPlacedItems(map.placedItems); // re-render placed items
  stackInventoryItems();

  hideMenus();
}
function moveItemToDroppedItems(id) {
  const map = maps[currentMap];
  const index = map.placedItems.findIndex(item => item.id === id);
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
function interactWithPlacedItem(id) {
  const map = maps[currentMap];
  const item = map.placedItems.find(item => item.id === id);
  if (!item) return;

  // Placeholder - expand based on type
  alert(`Interacting with ${item.name}`);
  hideMenus();
}





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

		const gridContainer = document.createElement('div');
		gridContainer.id = 'inventory-grid';
		gridContainer.style.display = 'grid';
		gridContainer.style.gridTemplateColumns = 'repeat(4, 50px)';
		gridContainer.style.gridGap = '6px';
		gridContainer.style.marginTop = '8px';
		invDiv.appendChild(gridContainer);

		// Info box at bottom
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
	grid.innerHTML = ''; // Clear old items
	infoBox.textContent = ''; // Clear info box

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

		// Handle hover to update info box
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

    if (droppedItem && droppedItem.type === 'sapling') {
      options += `<div class="menu-option" onclick="plantSapling('${id}')">🌱 Plant</div>`;
    }
    if (droppedItem && droppedItem.type === 'object') {
      options += `<div class="menu-option" onclick="placeObject('${id}')">🧱 Place</div>`;
    }
  }

  // Placed items
  if (target.classList.contains('placed-item')) {
    const id = target.id;
    const map = maps[currentMap];
	const placedItem = map.placedItems.find(item => item.id === id);

	options += `<div class="menu-option" onclick="destroyPlacedItem('${id}')">❌ Destroy</div>`;
	options += `<div class="menu-option" onclick="moveItemToInventory('${id}')">🎒 Store</div>`;
	options += `<div class="menu-option" onclick="moveItemToDroppedItems('${id}')">❌ drop</div>`;
	
    if (placedItem && placedItem.isInteractable) {
      options += `<div class="menu-option" onclick="interactWithPlacedItem('${id}')">🤖 Interact</div>`;
    }

    // Optional: rotate or inspect
    options += `<div class="menu-option" onclick="rotatePlacedItem('${id}')">🔄 Rotate</div>`;
    options += `<div class="menu-option" onclick="inspectPlacedItem('${id}')">🔍 Inspect</div>`;
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
function plantSapling(itemId) {
  alert(`Planting sapling with id: ${itemId}`);
  hideMenus();
  // Later, add your planting logic here
}

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
addItem({ id: 'Sapling', name: 'Sapling', icon: "🌱", quantity: 2, size: 'small', type: 'sapling' });
addItem({ id: 'underwearGnome', name: 'underwearGnome', icon: "🧚", quantity: 5, size: 'large', type: 'unique' });
addItem({ id: 'wrench', name: 'wrench', icon: "🔧", quantity: 1, size: 'normal', type: 'tool' });
addItem({ id: 'purplepickle', name: 'purplePickle', icon: "pp", quantity: 1, size: 'normal', type: 'unique' });