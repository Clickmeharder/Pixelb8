//sweatshop.js
// Add a new item via the form
document.getElementById("addItemForm").addEventListener("submit-sweatitemFB", async (e) => {
  e.preventDefault();

  // Get the currently signed-in user UID
  const user = firebase.auth().currentUser;
  if (user && user.uid !== "7d7JYyj0kgUv0nXr3bDrO88R7jN2") {
    alert("You do not have permission to add items.");
    return;
  }

  // Get form values
  const planet = document.getElementById("planetSelect").value;
  const itemName = document.getElementById("itemName").value.trim();
  const availability = document.getElementById("availability").value;
  const stock = document.getElementById("stock").value;
  const sweatCost = document.getElementById("sweatCost").value.trim();
  const pedCost = document.getElementById("pedCost").value.trim();

  // Validate inputs
  if (!itemName || !stock || !sweatCost || !pedCost) {
    alert("Please fill in all fields.");
    return;
  }

  // Create new item object
  const newItem = {
    availability,
    stock: parseInt(stock),
    sweatCost,
    pedCost,
  };

  try {
    // Add the new item to Firestore
    const itemsCollection = collection(db, `sweatexchange/${planet}/items`);
    await addDoc(itemsCollection, newItem);

    alert("Item added successfully!");
    populateSweatExchanges(); // Refresh the table after adding the item
    document.getElementById("addItemForm").reset(); // Clear the form
  } catch (error) {
    console.error("Error adding item:", error);
    alert("Failed to add item. Please try again.");
  }
});

// Fetch and display updated exchange data
function getExchangeData() {
  const sweatexchangeContainer = document.getElementById('sweatexchange-DB');
  getDocs(collection(db, 'sweatexchange'))
    .then((querySnapshot) => {
      sweatexchangeContainer.innerHTML = ''; // Clear previous content

      querySnapshot.forEach(async (doc) => {
        const data = doc.data();
        const exchangeDiv = document.createElement('div');
        exchangeDiv.classList.add('exchange-item');

        let docHTML = `<h3>Exchange Data for ${doc.id}</h3><pre>${JSON.stringify(data, null, 2)}</pre>`;
        
        const itemsCollection = collection(doc.ref, 'items');
        const itemsSnapshot = await getDocs(itemsCollection);

        if (!itemsSnapshot.empty) {
          docHTML += `<h4>Items:</h4><ul>`;

          itemsSnapshot.forEach((itemDoc) => {
            const itemData = itemDoc.data();
            docHTML += `
              <li>
                <strong>${itemDoc.id}</strong>:
                <ul>
                  <li>Stock: ${itemData.amount}</li>
                  <li>tt: ${itemData.tt}/${itemData.ttmax}</li>
                  <li>TT max: ${itemData.ttmax}</li>
                  <li>Sweat Cost: ${itemData.sweatprice}</li>
                  <li>PED Cost: ${itemData.pedprice}</li>
                </ul>
              </li>
            `;
          });

          docHTML += `</ul>`; // Close the items list
        }

        exchangeDiv.innerHTML = docHTML;
        sweatexchangeContainer.appendChild(exchangeDiv);
      });
    })
    .catch((error) => {
      console.log("Error getting documents: ", error);
    });
}

// Populate the itemName select dynamically based on the selected planet
document.getElementById('planetSelect').addEventListener('change', async function () {
  const planet = this.value;
  const itemNameSelect = document.getElementById('itemName');
  itemNameSelect.innerHTML = ''; // Clear the existing options

  // Fetch items from Firestore for the selected planet
  try {
    const itemsCollection = collection(db, `sweatexchange/${planet}/items`);
    const itemsSnapshot = await getDocs(itemsCollection);

    // Add a default option
    itemNameSelect.appendChild(new Option("Select Item", "Default"));

    // Populate the item select options
    itemsSnapshot.forEach((itemDoc) => {
      const itemName = itemDoc.id;
      itemNameSelect.appendChild(new Option(itemName, itemName));
    });
  } catch (error) {
    console.error("Error fetching items: ", error);
  }
});

// Populate other fields based on selected planet and item
document.getElementById('itemName').addEventListener('change', async function () {
  const planet = document.getElementById('planetSelect').value;
  const itemName = this.value;
  
  if (itemName === "Default") return; // No item selected

  try {
    const itemDocRef = doc(db, `sweatexchange/${planet}/items`, itemName);
    const itemDoc = await getDoc(itemDocRef);

    if (itemDoc.exists()) {
      const itemData = itemDoc.data();
      document.getElementById('amount').value = itemData.amount || '';
      document.getElementById('tt').value = itemData.tt || '';
      document.getElementById('ttmax').value = itemData.ttmax || '';
      document.getElementById('sweatprice').value = itemData.sweatprice || '';
      document.getElementById('pedprice').value = itemData.pedprice || '';
    } else {
      console.log("Item not found!");
    }
  } catch (error) {
    console.error("Error fetching item data: ", error);
  }
});