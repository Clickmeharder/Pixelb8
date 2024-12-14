//sweatshop.js
// firebase/sweatshop-auth.js
/* 
#, Item, tt, ttmax, sweatprice, pedcost
30,	B101 Amp,0.00,0.00, 110,0.18
99+, Sollomate Rubio,0.00,0.00, 123, 0.20
50, EP-2 Proton,0.00,0.00, 321, 0.50
99, Sollomate Azuro,0.00,0.00, 800, 1.40
99, Skildek Lancehead, 0.00,0.00,200, 0.30
20, Shotgun (SA), 0.00,0.00, 1025, 2.10
*/
	//import scripts
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics.js";
  import { getFirestore, collection, getDocs, doc, getDoc, addDoc, setDoc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
  import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GithubAuthProvider, onAuthStateChanged, updateProfile  } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
  //initialize firebase config

  const firebaseConfig = {
    apiKey: "AIzaSyBiOOomMnXO0Ps7ak0kkPJwRCgV8ThWBb0",
    authDomain: "pixelb8lol.firebaseapp.com",
    projectId: "pixelb8lol",
    storageBucket: "pixelb8lol.appspot.com",
    messagingSenderId: "373700849652",
    appId: "1:373700849652:web:c3e59f1653dd224ba153a1",
    measurementId: "G-5EGV2VNMX3"
	 };

    const app = initializeApp(firebaseConfig);
    const analytics = getAnalytics(app);
    const auth = getAuth();
    const provider = new GithubAuthProvider();
	const db = getFirestore(app);
	
	// Role to icon mapping
	const roleToIcon = {
	  ceo: '👑',
	  admin: '⭐',
	  mod: '🛡️',
	  susrep: '💼',
	  vip: '🌟',
	  associate: '🤝',
	  verified: '✔️',
	  user: '🙂',
	  guest: '👤',
	  default: '👤'
	};

    async function getGitHubUserData(githubIdOrLogin) {
      return fetch(
        `https://api.github.com/user/${githubIdOrLogin}`,
        { headers: { 'Accept': 'application/json' } }
      )
      .then((response) => {
        if (!response.ok) {
          const err = new Error();
          err.response = response;
          // Handle different error cases as needed
          return Promise.reject(err);
        }

        return response.json();
      });
    }
	
// Fetch data from Firestore collection
getDocs(collection(db, 'UserProfiles'))
  .then((querySnapshot) => {
    querySnapshot.forEach((doc) => {
      console.log(doc.data());
    });
  })
  .catch((error) => {
    console.log("Error getting documents: ", error);
  });
// beginning sweatshop stuff
// Global variable to store the current ID of the element
let currentItemNameInputId = 'itemNameInput';

// Function to toggle between the select dropdown and text input
function toggleItemNameInput() {
  var action = document.getElementById('actionSelect').value;
  var itemNameInput = document.getElementById('itemNameInput');
  var itemNameTextInput = document.getElementById('itemNameTextInput');
  
  if (action === 'add') {
    itemNameInput.style.display = 'none';
    itemNameTextInput.style.display = 'block';
    currentItemNameInputId = itemNameTextInput.id;
  } else if (action === 'edit') {
    itemNameInput.style.display = 'block';
    itemNameTextInput.style.display = 'none';
    currentItemNameInputId = itemNameInput.id;
  } else {
    itemNameInput.style.display = 'block';
    itemNameTextInput.style.display = 'none';
    currentItemNameInputId = itemNameInput.id;
  }
}

// Call the function initially to set the correct state
toggleItemNameInput();

// Add an event listener to update the display whenever the action changes
document.getElementById('actionSelect').addEventListener('change', toggleItemNameInput);

// Function to add or delete item for regular users
const addItemForUser = async (planet, itemName, amount, sweatprice, pedprice, tt, ttmax, user, action) => {
  const targetCollectionPath = `sweatexchange/${planet}/useritems`;
  const targetCollection = collection(db, targetCollectionPath);

  // If the action is delete, check the ownerId and remove the item if it matches
  if (action === 'delete') {
    try {
      const docRef = doc(targetCollection, itemName);
      const docSnapshot = await getDoc(docRef);

      if (docSnapshot.exists()) {
        const itemData = docSnapshot.data();
        if (itemData.ownerId === user.uid) {
          await deleteDoc(docRef); // Delete the document

          alert("Item deleted successfully!");
          getExchangeData(); // Refresh data
        } else {
          alert("You can only delete your own exchange items.");
        }
      } else {
        alert("Item not found.");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
    return; // Exit the function early
  }

  // Fetch the user's Entropia name
  let entropiaName = "";
  try {
    const userDocRef = doc(db, `users/${user.uid}`);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      entropiaName = userDoc.data().entropianame || "Unknown"; // Default to "Unknown" if not found
    } else {
      alert("Failed to retrieve Entropia name. Adding item without name.");
    }
  } catch (error) {
    console.error("Error fetching Entropia name:", error);
    alert("Failed to retrieve Entropia name. Adding item without name.");
  }

  // If action is not delete, proceed to add item
  const newItem = {
    amount: parseInt(amount),
    sweatprice: parseFloat(sweatprice),
    pedprice: parseFloat(pedprice),
    tt: parseFloat(tt),
    ttmax: parseFloat(ttmax),
    ownerId: user.uid, // Add ownerId to match Firestore rules
    entropiaName: entropiaName, // Add Entropia name to item data
    uid: crypto.randomUUID() // Generate a unique identifier for the item
  };

  try {
    const docRef = doc(targetCollection, itemName);
    await setDoc(docRef, newItem);

    alert("Item added successfully to user items!");
    document.getElementById("addItemForm").reset();
    getExchangeData();
  } catch (error) {
    console.error("Error adding item:", error);
    alert("Failed to add item. Please try again.");
  }
};

const addItemForAdmin = async (planet, itemName, amount, sweatprice, pedprice, tt, ttmax, action, user) => {
  // If the action is delete, remove the item
  if (action === 'delete') {
    try {
      const itemDocRef = doc(db, `sweatexchange/${planet}/items`, itemName);
      await deleteDoc(itemDocRef); // Delete the document

      alert("Item deleted successfully!");
      getExchangeData(); // Refresh data
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Failed to delete item. Please try again.");
    }
    return; // Exit the function early
  }

  try {
    // Fetch the admin's entropianame
    const userDocRef = doc(db, `users/${user.uid}`);
    const userDoc = await getDoc(userDocRef);

    if (!userDoc.exists()) {
      alert("Admin user data not found. Cannot add item.");
      return;
    }

    const { entropianame } = userDoc.data();

    // Prepare the new item data
    const newItem = {
      amount: parseInt(amount),
      sweatprice: parseFloat(sweatprice),
      pedprice: parseFloat(pedprice),
      tt: parseFloat(tt),
      ttmax: parseFloat(ttmax),
      entropianame, // Add the entropianame to the item data
    };

    const itemDocRef = doc(db, `sweatexchange/${planet}/items`, itemName);
    const itemDoc = await getDoc(itemDocRef);

    if (itemDoc.exists()) {
      await updateDoc(itemDocRef, newItem);
      alert("Item updated successfully!");
    } else {
      await setDoc(itemDocRef, newItem);
      alert("Item added successfully!");
    }

    getExchangeData();

    // Clear input fields
    document.getElementById('itemNameInput').value = '';
    document.getElementById('amountInput').value = '';
    document.getElementById('sweatpriceInput').value = '';
    document.getElementById('pedpriceInput').value = '';
    document.getElementById('ttmaxInput').value = '';
    document.getElementById('ttInput').value = '';
  } catch (error) {
    console.error("Error adding/updating item:", error);
    alert("Failed to add/update item. Please try again.");
  }
};
// Form submission event listener
document.getElementById("addItemForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the currently signed-in user
  const user = auth.currentUser;

  if (!user) {
    alert("You must be signed in to add an item.");
    return;
  }

  // Get the user's role using the getUserRole function
  const userRole = await getUserRole();

  // Get form values
  const planet = document.getElementById("planetSelect").value;
  const itemName = document.getElementById(currentItemNameInputId).value.trim();
  const amount = document.getElementById("amountInput").value;
  const sweatprice = document.getElementById("sweatpriceInput").value.trim();
  const pedprice = document.getElementById("pedpriceInput").value.trim();
  const tt = document.getElementById("ttInput").value.trim();
  const ttmax = document.getElementById("ttmaxInput").value.trim();
  const action = document.getElementById("actionSelect").value; // Get the selected action

  // Validate inputs
  if (!itemName && action !== 'delete') { // Only validate itemName when action isn't 'delete'
    alert("Please fill in the item name.");
    return;
  }
  if (action !== 'delete' && (!amount || !sweatprice || !pedprice || !tt || !ttmax)) {
    alert("Please fill in all fields.");
    return;
  }

  // Call the appropriate function based on the user's role and action
  if (userRole === 'admin') {
    addItemForAdmin(planet, itemName, amount, sweatprice, pedprice, tt, ttmax, action);
  } else {
    addItemForUser(planet, itemName, amount, sweatprice, pedprice, tt, ttmax, user, action);
  }
});

// Function to add event listeners to all rows
function attachRowClickListeners() {
  const rows = document.querySelectorAll('tr[data-owner-id]');
  
  rows.forEach(row => {
    row.addEventListener('click', (event) => {
      const ownerId = row.getAttribute('data-owner-id');
      // Show the user details for the clicked row
      showUserDetails(ownerId);
    });
  });
}



// Function to fetch and display user details based on ownerId
async function showUserDetails(ownerId) {
  const userDetailsDiv = document.getElementById('user-details'); // The div where user details will be shown
  const userDetailsErrorDiv = document.getElementById('user-detailsboxError'); // Error message div
  const entropiaNameSpan = document.getElementById('entropia-name');
  const statusSpan = document.getElementById('status');
  const lastLoginSpan = document.getElementById('last-login');
  const userDetailsBoxDiv = document.getElementById('user-detailsbox'); // The main box containing both sections

  // Reset the content and hide the error message initially
  if (userDetailsErrorDiv) userDetailsErrorDiv.style.display = 'none';
  if (userDetailsDiv) userDetailsDiv.style.display = 'none';
  
  // Show loading indicators
  if (entropiaNameSpan) entropiaNameSpan.innerText = 'Loading...';
  if (statusSpan) statusSpan.innerText = 'Loading...';
  if (lastLoginSpan) lastLoginSpan.innerText = 'Loading...';

  try {
    // Fetch user data from the users collection
    const userDoc = await getDoc(doc(db, 'users', ownerId)); // Firestore collection name: 'users'
    if (userDoc.exists()) {
      const userData = userDoc.data();
      
      // Extract necessary data
      const now = new Date();
      const lastStatusChange = userData.lastStatusChange ? new Date(userData.lastStatusChange) : null;
      const isOnline = userData.isOnline || false;

      // Calculate days since last login
      const daysSinceLastLogin = lastStatusChange
        ? Math.floor((now - lastStatusChange) / (1000 * 60 * 60 * 24)) // Get the number of days
        : 'Unknown';

      // Display user details in the corresponding spans
      if (entropiaNameSpan) entropiaNameSpan.innerText = userData.entropianame || 'N/A';
      if (statusSpan) statusSpan.innerText = isOnline ? 'Online' : `Offline (${daysSinceLastLogin} days ago)`;
      if (lastLoginSpan) lastLoginSpan.innerText = lastStatusChange ? lastStatusChange.toLocaleString() : 'N/A';

      // Hide the error message and show the user details div
      if (userDetailsErrorDiv) userDetailsErrorDiv.style.display = 'none';
      if (userDetailsDiv) userDetailsDiv.style.display = 'block';
    } else {
      // If user data is not found, show an error message
      if (userDetailsErrorDiv) {
        userDetailsErrorDiv.style.display = 'block';
        userDetailsErrorDiv.innerText = 'User data not found.';
      }
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    // If there's an error fetching the data, show the error message
    if (userDetailsErrorDiv) {
      userDetailsErrorDiv.style.display = 'block';
      userDetailsErrorDiv.innerText = 'Error fetching user details. Please try again later.';
    }
  }
}




// Fetch and display updated exchange data
async function getExchangeData() {
  const sweatexchangeContainer = document.getElementById('sweatexchange-DB');
  const planets = ['calypso', 'arkadia', 'rocktropia', 'cyrene', 'nextisland', 'toulan', 'monria'];

  try {
    const querySnapshot = await getDocs(collection(db, 'sweatexchange'));
    sweatexchangeContainer.innerHTML = ''; // Clear previous content

    // Get the currently signed-in user
    const user = auth.currentUser;
    if (!user) {
      alert("You must be signed in to view exchange data.");
      return;
    }

    const userRole = await getUserRole(); // Check user role
    const userUid = user.uid; // Get the user's UID

    querySnapshot.forEach(async (doc) => {
      const data = doc.data();
      const exchangeDiv = document.createElement('div');
      exchangeDiv.classList.add('exchange-item');

      // Add summary data for sweatexchange-DB
      let docHTML = `
        <h3>Exchange Data for ${doc.id}</h3>
        <p><strong>Sweat Budget:</strong> ${data.budget || 'N/A'}</p>
        <p><strong>Total Sweat:</strong> ${data.sweat || 'N/A'}</p>
      `;

      // Fetch items based on user role for sweatexchange-DB
      const itemsCollection = userRole === 'admin' ? collection(doc.ref, 'items') : collection(doc.ref, 'useritems');
      const itemsSnapshot = await getDocs(itemsCollection);

      if (!itemsSnapshot.empty) {
        docHTML += `
          <table border="1" style="border-collapse: collapse; width: 100%;">
            <thead>
              <tr>
                <th>Type</th>
                <th>Item Name</th>
                <th>Amount</th>
                <th>TT Value</th>
                <th>Max TT</th>
                <th>Sweat Cost</th>
                <th>PED Cost</th>
              </tr>
            </thead>
            <tbody>
        `;

        itemsSnapshot.forEach((itemDoc) => {
          const itemData = itemDoc.data();
          if (userRole === 'admin' || itemData.ownerId === userUid) {
            const itemTypeIcon = itemsCollection === 'items' ? '⭐sus' : '👤Shady'; // Icons for public and private items
            docHTML += `
              <tr data-owner-id="${itemData.ownerId}" title="Posted by: ${itemData.entropiaName || 'Unknown'}">
                <td>${itemTypeIcon}</td>
                <td>${itemDoc.id}</td>
                <td>${itemData.amount || 'N/A'}</td>
                <td>${itemData.tt || 'N/A'}</td>
                <td>${itemData.ttmax || 'N/A'}</td>
                <td>${itemData.sweatprice || 'N/A'}</td>
                <td>${itemData.pedprice || 'N/A'}</td>
              </tr>
            `;
          }
        });

        docHTML += `</tbody></table>`; // Close the table
      } else {
        docHTML += `<p>No items available for this exchange.</p>`;
      }

      exchangeDiv.innerHTML = docHTML;
      sweatexchangeContainer.appendChild(exchangeDiv);
	  attachRowClickListeners();
      // Populate planet-specific exchange tables with items regardless of user role
      const planetId = doc.id.toLowerCase(); // Ensure case-insensitive matching
      if (planets.includes(planetId)) {
        const planetTable = document.getElementById(`${planetId}-table`);
        if (planetTable) {
          let planetTableHTML = '';

          // Fetch items from 'items' collection
          const planetItemsCollection = collection(doc.ref, 'items'); // Always use 'items' collection
          const planetItemsSnapshot = await getDocs(planetItemsCollection);

          if (!planetItemsSnapshot.empty) {
            planetItemsSnapshot.forEach((itemDoc) => {
              const itemData = itemDoc.data();
              const itemTypeIcon = '⭐sus'; // Icon for public items
              planetTableHTML += `
                <tr data-owner-id="${itemData.ownerId}" title="Posted by: ${itemData.entropiaName || 'Unknown'}">
                  <td>${itemTypeIcon}</td>
                  <td>${itemDoc.id}</td>
                  <td>${itemData.amount || 'N/A'}</td>
                  <td>${itemData.tt || 'N/A'}</td>
                  <td>${itemData.ttmax || 'N/A'}</td>
                  <td>${itemData.sweatprice || 'N/A'}</td>
                  <td>${itemData.pedprice || 'N/A'}</td>
                </tr>
              `;
            });
          }

          // Fetch items from 'useritems' collection
          const planetUserItemsCollection = collection(doc.ref, 'useritems'); // Always use 'useritems' collection
          const planetUserItemsSnapshot = await getDocs(planetUserItemsCollection);

          if (!planetUserItemsSnapshot.empty) {
            planetUserItemsSnapshot.forEach((itemDoc) => {
              const itemData = itemDoc.data();
              const itemTypeIcon = '👤user'; // Icon for private items
              planetTableHTML += `
                <tr data-owner-id="${itemData.ownerId}" title="Posted by: ${itemData.entropiaName || 'Unknown'}">
                  <td>${itemTypeIcon}</td>
                  <td>${itemDoc.id}</td>
                  <td>${itemData.amount || 'N/A'}</td>
                  <td>${itemData.tt || 'N/A'}</td>
                  <td>${itemData.ttmax || 'N/A'}</td>
                  <td>${itemData.sweatprice || 'N/A'}</td>
                  <td>${itemData.pedprice || 'N/A'}</td>
                </tr>
              `;
            });
          }

          planetTable.innerHTML = planetTableHTML; // Update the planet table
		  // Call this function after generating the table rows
		  attachRowClickListeners();
        }
      }
    });
  } catch (error) {
    console.log("Error getting documents: ", error);
  }
}

// Handle planet change and update item list
document.getElementById('planetSelect').addEventListener('change', async function () {
    const planet = this.value;
    const itemNameSelect = document.getElementById('itemNameInput'); // Corrected ID

    // Get the currently signed-in user
    const user = auth.currentUser;

    if (!user) {
        alert("You must be signed in to view items.");
        return;
    }

    const userRole = await getUserRole(); // Check user role
    const userUid = user.uid; // Get the user's UID

    // Clear the itemName dropdown and add the default option
    itemNameSelect.innerHTML = '';
    itemNameSelect.appendChild(new Option("Select Item", "Default", true, true));

    // Determine which collection to fetch from
    const itemsCollectionPath = userRole === 'admin' ? `sweatexchange/${planet}/items` : `sweatexchange/${planet}/useritems`;

    try {
        const itemsCollection = collection(db, itemsCollectionPath);
        const itemsSnapshot = await getDocs(itemsCollection);

        // Populate the item select options
        itemsSnapshot.forEach((itemDoc) => {
            const itemData = itemDoc.data();
            if (userRole === 'admin' || itemData.ownerId === userUid) {
                const itemName = itemDoc.id;
                itemNameSelect.appendChild(new Option(itemName, itemName));
            }
        });
    } catch (error) {
        console.error("Error fetching items: ", error);
    }
});

// Event listener for itemName select change
document.getElementById('itemNameInput').addEventListener('change', async function () {
    const selectedItem = this.value;

    // Get the currently signed-in user
    const user = auth.currentUser;

    if (!user) {
        alert("You must be signed in to edit items.");
        return;
    }

    const userRole = await getUserRole(); // Check user role
    const userUid = user.uid; // Get the user's UID

    if (selectedItem === "Default") {
        // Clear input fields when "Select Item" is chosen
        document.getElementById('amountInput').value = '';
        document.getElementById('sweatpriceInput').value = '';
        document.getElementById('pedpriceInput').value = '';
        document.getElementById('ttmaxInput').value = '';
        document.getElementById('ttInput').value = '';
        return;
    }

    // Populate the form with the existing item's details for editing
    const planet = document.getElementById('planetSelect').value;
    const itemsCollectionPath = userRole === 'admin' ? `sweatexchange/${planet}/items` : `sweatexchange/${planet}/useritems`;

    try {
        const itemDocRef = doc(db, itemsCollectionPath, selectedItem);
        const itemDoc = await getDoc(itemDocRef);

        if (itemDoc.exists()) {
            const itemData = itemDoc.data();
            if (userRole === 'admin' || itemData.ownerId === userUid) {
                document.getElementById('amountInput').value = itemData.amount || '';
                document.getElementById('sweatpriceInput').value = itemData.sweatprice || '';
                document.getElementById('pedpriceInput').value = itemData.pedprice || '';
                document.getElementById('ttmaxInput').value = itemData.ttmax || '';
                document.getElementById('ttInput').value = itemData.tt || '';
            } else {
                alert("You can only edit your own items.");
            }
        } else {
            console.log("Item not found!");
        }
    } catch (error) {
        console.error("Error fetching item data: ", error);
    }
});

// Check user role (assuming you have a function that checks this)
async function getUserRole() {
  const user = auth.currentUser;
  if (user) {
    const userRef = doc(db, 'users', user.uid); // Reference to the user document
    const userDoc = await getDoc(userRef); // Get the document

    if (userDoc.exists()) {
      return userDoc.data().role || 'user'; // Default to 'user' if no role is set
    }
  }
  return 'guest'; // Default to 'guest' if no user found or role not set
}

// Function to update the user's status in Firebase
async function updateStatusInFirebase(status) {
  const user = auth.currentUser;
  if (!user) {
    alert("You must be signed in to update your status.");
    return;
  }

  try {
    // Update the user's online status in the 'users' collection
    const userDocRef = doc(db, 'users', user.uid);
    await updateDoc(userDocRef, {
      isOnline: status,
      lastStatusChange: new Date() // Optionally track the last time the status was updated
    });
    console.log(`Status updated to: ${status}`);
  } catch (error) {
    console.error('Error updating status:', error);
  }
}

// Event listener to handle status change when the user selects an option
document.getElementById('save-status').addEventListener('click', async () => {
  const status = document.getElementById('status-toggle').value;
  await updateStatusInFirebase(status);
});

    // Set up the onAuthStateChanged listener
    onAuthStateChanged(auth, async (user) => {
      const statusElement = document.getElementById('loginStatus');
      const userauthproveriderElement = document.getElementById('userauthProvider');
      const usernameElement = document.getElementById('username');
	  const profileusernameElement = document.getElementById('profileusername');
      const emailElement = document.getElementById('email');
      const listedElementEmail = document.getElementById('userinfolist-email');
      const photoElement = document.getElementById('profilephoto');
      const emailVerifiedElement = document.getElementById('emailVerified');
      const profileLinkElement = document.getElementById('profileLink');
      const loginButton = document.getElementById('loginbutt');
      const logoutButton = document.getElementById('logoutbutt');
	  const userpixelcountElement = document.getElementById('Userpixelcount');
	  /* const innerContentloggedin = document.getElementById('innercontent-loggedin'); */
	  const innerContentloggedout = document.getElementById('innercontent-loggedout');
	  const userprofileTab = document.getElementById('user-profile-tab');
	  const userprofileBox = document.getElementById('user-profile-box');
	  const receptionTab = document.getElementById('reception-tab');
	  const receptionBox = document.getElementById('reception');

	  if (user !== null) {
		// User is signed in
		const uniqueUserId = user.uid;
		  // Fetch data from the 'users' collection
		  getDocs(collection(db, 'users'))
		    .then((querySnapshot) => {
			  querySnapshot.forEach((doc) => {
			  // Check if the document's ID matches the logged-in user's UID
			    if (doc.id === uniqueUserId) {
				// Log the user's pixelBalance field
			      const userData = doc.data();
				    console.log("Logged-in user's pixelBalance:", userData.balancePixels);
					userpixelcountElement.textContent = "Pixels: " + userData.balancePixels || "null";
			    }
			  });
		    })
		    .catch((error) => {
			  console.log(uniqueUserId,"Error getting users documents: ", error);
		    });
		console.log('user logged in: ', user);
        user.providerData.forEach(async (profile) => {
		  console.log("user displayname: " + user.displayName);
          console.log("profile.displayname: " + profile.displayName);
          console.log("profile Email: " + profile.email);
		  console.log("user Email: " + user.email);
          console.log("Photo URL: " + profile.photoURL);
		  console.log("users pixels: " + user.pixelcount);
          statusElement.textContent = "Status: Online";
          userauthproveriderElement.textContent = profile.providerId;
		  usernameElement.textContent = user.displayName || "Nameless";
          profileusernameElement.textContent = profile.displayName || "-idk-";
          emailElement.textContent = profile.email || "Unknown";
          photoElement.src = user.photoURL || "default.jpg";

		  userpixelcountElement.classList.remove('hidden');
          emailVerifiedElement.textContent = user.emailVerified ? "► Verified" : " ► Unverified";
          emailVerifiedElement.classList.remove('hidden');
          listedElementEmail.classList.remove('hidden');
          profileLinkElement.classList.remove('hidden');
          userauthproveriderElement.classList.remove('hidden');
          loginButton.classList.add('hidden');
          logoutButton.classList.remove('hidden');

		  innerContentloggedout.classList.add('hidden');
          /* innerContentloggedin.classList.remove('hidden'); */
		  userprofileTab.classList.remove('hidden');
		  userprofileTab.classList.add('Active');
		  userprofileBox.classList.remove('hidden');
		  userprofileBox.classList.add('Active');
/* 		  receptionTab.classList.add('hidden');
		  receptionBox.classList.add('hidden'); */
          const userName = encodeURIComponent(user.displayName || "Guest");
          const userEmail = encodeURIComponent(user.email || "");

          if (user.emailVerified) {
            emailVerifiedElement.style.color = "#24b500b5"; // Green color for verified email
          } else {
            emailVerifiedElement.style.color = "#dd230e66"; // Red color for unverified email
          }
          // Check if provider is GitHub and display name is null
          if (profile.providerId === 'github.com' && !user.displayName) {
            try {
              const githubUserData = await getGitHubUserData(profile.uid);
              if (githubUserData.login) {
                usernameElement.textContent = githubUserData.login;
              }
            } catch (error) {
              console.error("Error fetching GitHub user data:", error);
            }
          }
		  
        });
      } else {
        // User is signed out
		console.log('user logged out');
        statusElement.textContent = "Status: offline";
        usernameElement.textContent = "StrangerDanger!";
		profileusernameElement.textContent = "-";
        emailElement.textContent = "";
        photoElement.src = "assets/images/logo/pixelb8logo1.png"; // Set a default image
		userpixelcountElement.classList.add('hidden');
        emailVerifiedElement.textContent = "";
        emailVerifiedElement.classList.add('hidden');
        listedElementEmail.classList.add('hidden');
        profileLinkElement.classList.add('hidden');
        userauthproveriderElement.classList.add('hidden');
        loginButton.classList.remove('hidden');
        logoutButton.classList.add('hidden');
		innerContentloggedin.classList.add('hidden');
        innerContentloggedout.classList.remove('hidden');
		populateAccountDetails(user);
		userprofileTab.classList.remove('Active');
		userprofileTab.classList.add('hidden');
		userprofileBox.classList.remove('Active');
		userprofileBox.classList.add('hidden');
/* 		receptionTab.classList.add('Active');
		receptionBox.classList.add('Avtive'); */
		console.log("User is not signed in.");
      }

    });
// Signup form submission event listener
	const signUpForm = document.querySelector('#signup-form');

	signUpForm.addEventListener('submit', (e) => {
	  e.preventDefault(); // Prevent the default form submission

	  const email = document.getElementById('signup-email').value;
	  const password = document.getElementById('signup-password').value;

	  // Create a new user with email and password using Firebase's createUserWithEmailAndPassword method
	  createUserWithEmailAndPassword(auth, email, password)
		.then((userCredential) => {
		  // Handle successful signup
		  const user = userCredential.user;
		  console.log('User signed up:', user);
		  // Close the signup modal
		  const modal = document.getElementById('modal-usersignup');
		  const bootstrapModal = new bootstrap.Modal(modal);
		  bootstrapModal.hide();
		  // You can redirect the user to a new page or perform other actions here
		})
		.catch((error) => {
		  // Handle signup errors
		  const errorCode = error.code;
		  const errorMessage = error.message;
		  console.error('Signup error:', errorCode, errorMessage);
		  // Display the error to the user if needed
		});
	});
//end of signupform
//------------------------------------------------

    // Define the signInWithGitHub function
    function signInWithGitHub() {
      signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GithubAuthProvider.credentialFromResult(result);
        const token = credential.accessToken;
        const user = result.user;
        console.log("GitHub Access Token:", token);
        console.log("Signed-in user:", user);
        // Redirect or perform other actions after successful login
        window.location.href = "https://pixelb8.lol/home.html"; // Redirect to dashboard or any other page
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        console.error(errorCode, errorMessage);
      });
    }
	// Define the signOutFromFirebase function
	function signOutFromFirebase() {
	  auth.signOut()
		.then(() => {
		  console.log('User signed out successfully');
		  // Redirect or perform other actions after sign out
		  window.location.href = 'https://pixelb8.lol'; // Redirect to home or any other page
		})
		.catch((error) => {
		  console.error('Sign out error:', error);
		});
	}
	
// Function to update profile
	function updateProfileData(username, photoURL) {
	  const user = auth.currentUser;

	  updateProfile(user, {
		displayName: username,
		photoURL: photoURL
	  }).then(() => {
		console.log('Profile updated successfully');
		// Close the modal after updating the profile
		$('#modal-editProfile').modal('hide');
	  }).catch((error) => {
		console.error('Error updating profile:', error);
		// Handle error if profile update fails
	  });
	}

	// Handle form submission for updating profile
	const updateProfileForm = document.getElementById('update-profile-form');

	updateProfileForm.addEventListener('submit', (e) => {
	  e.preventDefault(); // Prevent default form submission

	  const username = document.getElementById('update-username').value;
	  const photoURL = document.getElementById('update-photoURL').value;

	  updateProfileData(username, photoURL);
	});
    // Add event listener to login button
	const loginButton = document.getElementById('loginbutt');
    loginButton.addEventListener('click', signInWithGitHub);

	// Select the logout button element by its ID
	const logoutButton = document.getElementById('logoutbutt');
	logoutButton.addEventListener('click', signOutFromFirebase);
	
	const editProfileButton = document.getElementById('editprofilebutt');
	editProfileButton.addEventListener('click', () => {
		console.log('edit profile button clicked');
	  /* $('#modal-editProfile').modal('show'); */
	});

// Select the close button by ID and attach the event listener directly
document.getElementById('userdetails-close-button').addEventListener('click', closeUserDetails);

// Function to close the user details div
function closeUserDetails() {
  document.getElementById('user-details').style.display = 'none';
}

//------------------------------------------
// mail
//------------------------------------------

// Function to send a message
async function sendMessage(senderId, recipientId, subject, messageContent) {
  const now = new Date();
  
  await ensureMailFoldersExist(senderId);
  await ensureMailFoldersExist(recipientId);

  const outboxMessage = {
    time: now,
    message: messageContent,
    sendto: recipientId
  };

  const inboxMessage = {
    time: now,
    message: messageContent,
    sentby: senderId
  };

  const senderOutboxRef = doc(collection(db, 'users', senderId, 'outbox'), subject);
  const recipientInboxRef = doc(collection(db, 'users', recipientId, 'inbox'), subject);
  
  await setDoc(senderOutboxRef, outboxMessage);
  await setDoc(recipientInboxRef, inboxMessage);
}

// Fetch inbox messages
async function fetchInboxMessages(userId) {
  const userInboxRef = collection(db, 'users', userId, 'inbox');
  const inboxSnapshot = await getDocs(query(userInboxRef, orderBy("time", "desc")));
  
  const inboxMessages = inboxSnapshot.docs.map(doc => ({
    subject: doc.id,
    ...doc.data()
  }));
  
  return inboxMessages;
}

// Fetch outbox messages
async function fetchOutboxMessages(userId) {
  const userOutboxRef = collection(db, 'users', userId, 'outbox');
  const outboxSnapshot = await getDocs(query(userOutboxRef, orderBy("time", "desc")));
  
  const outboxMessages = outboxSnapshot.docs.map(doc => ({
    subject: doc.id,
    ...doc.data()
  }));

  return outboxMessages;
}

// Delete a message
async function deleteMessage(userId, messageSubject, isInbox) {
  const collectionRef = isInbox
    ? collection(db, 'users', userId, 'inbox')
    : collection(db, 'users', userId, 'outbox');

  await deleteDoc(doc(collectionRef, messageSubject));
}

export { sendMessage, fetchInboxMessages, fetchOutboxMessages, deleteMessage };

//endmail stuff 

//beggining new messaging stuff
//import { sendMessage, fetchInboxMessages, fetchOutboxMessages } from './mail.js';
document.getElementById('sendmessage-to-user').addEventListener('click', () => {
    document.getElementById('send-message-modal').style.display = 'block';
});

document.getElementById('close-send-modal').addEventListener('click', () => {
    document.getElementById('send-message-modal').style.display = 'none';
});

document.getElementById('send-message-button').addEventListener('click', async () => {
    const recipientId = document.getElementById('recipient-id').value;
    const subject = document.getElementById('message-subject').value;
    const messageContent = document.getElementById('message-content').value;

    if (!recipientId || !subject || !messageContent) {
        alert('Please fill in all fields!');
        return;
    }

    const senderId = auth.currentUser.uid;

    try {
        await sendMessage(senderId, recipientId, subject, messageContent);
        alert('Message sent successfully!');
        document.getElementById('send-message-modal').style.display = 'none';
    } catch (error) {
        console.error('Error sending message:', error);
        alert('Failed to send message. Try again later.');
    }
});

document.getElementById('view-mail').addEventListener('click', async () => {
    document.getElementById('view-mail-modal').style.display = 'block';

    // Default to showing inbox
    showInbox();
});

document.getElementById('close-mail-modal').addEventListener('click', () => {
    document.getElementById('view-mail-modal').style.display = 'none';
});

document.getElementById('show-inbox').addEventListener('click', async () => {
    showInbox();
});

document.getElementById('show-outbox').addEventListener('click', async () => {
    showOutbox();
});

// Fetch and display inbox messages
async function showInbox() {
    const userId = auth.currentUser.uid;
    const mailList = document.getElementById('mail-list');
    mailList.innerHTML = 'Loading inbox...';

    try {
        const messages = await fetchInboxMessages(userId);
        mailList.innerHTML = messages.length
            ? messages.map(msg => `<div><strong>${msg.subject}</strong>: ${msg.message} (from: ${msg.sentby})</div>`).join('')
            : 'Inbox is empty.';
    } catch (error) {
        console.error('Error fetching inbox:', error);
        mailList.innerHTML = 'Failed to load inbox.';
    }
}

// Fetch and display outbox messages
async function showOutbox() {
    const userId = auth.currentUser.uid;
    const mailList = document.getElementById('mail-list');
    mailList.innerHTML = 'Loading outbox...';

    try {
        const messages = await fetchOutboxMessages(userId);
        mailList.innerHTML = messages.length
            ? messages.map(msg => `<div><strong>${msg.subject}</strong>: ${msg.message} (to: ${msg.sendto})</div>`).join('')
            : 'Outbox is empty.';
    } catch (error) {
        console.error('Error fetching outbox:', error);
        mailList.innerHTML = 'Failed to load outbox.';
    }
}






// Call the function to display the exchange data on page load
	getExchangeData();
	
//hmmm




