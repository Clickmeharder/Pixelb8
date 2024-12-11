// firebase/auth.js

	//import scripts
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics.js";
  import { getFirestore, collection, getDocs, doc, getDoc, addDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
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
    // Show the select dropdown, hide the text input
    itemNameInput.style.display = 'block';
    itemNameTextInput.style.display = 'none';
    
    // Save the current ID of itemNameInput to the variable
    currentItemNameInputId = itemNameInput.id;

  } else if (action === 'edit') {
    // Hide the select dropdown, show the text input
    itemNameInput.style.display = 'none';
    itemNameTextInput.style.display = 'block';
    
    // Save the current ID of itemNameTextInput to the variable
    currentItemNameInputId = itemNameTextInput.id;

  } else {
    // Optionally, hide both or do something else when delete is selected
    itemNameInput.style.display = 'none';
    itemNameTextInput.style.display = 'none';
    
    // Reset to a default ID (or any other logic you want)
    currentItemNameInputId = '';
  }
}

// Call the function initially to set the correct state
toggleItemNameInput();

// Add an event listener to update the display whenever the action changes
document.getElementById('actionSelect').addEventListener('change', toggleItemNameInput);
// beginning sweatshop auth stuff
// Add a new item via the form
document.getElementById("addItemForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get the currently signed-in user UID
  const user = firebase.auth().currentUser;
  if (user && user.uid !== "7d7JYyj0kgUv0nXr3bDrO88R7jN2") {
    alert("You do not have permission to add items.");
    return;
  }

  // Get form values
  const planet = document.getElementById("planetSelect").value;
  const itemName = document.getElementById(currentItemNameInputId).value.trim(); // Changed here
  const amount = document.getElementById("amountInput").value;
  const sweatprice = document.getElementById("sweatpriceInput").value.trim();
  const pedprice = document.getElementById("pedpriceInput").value.trim();
  const tt = document.getElementById("ttInput").value.trim();
  const ttmax = document.getElementById("ttmaxInput").value.trim();

  // Validate inputs
  if (!itemName || !amount || !sweatprice || !pedprice || !tt || !ttmax) {
    alert("Please fill in all fields.");
    return;
  }

  // Create new item object
  const newItem = {
    amount: parseInt(amount),
    sweatprice,
    pedprice,
    tt,
    ttmax
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
                  <li>amount: ${itemData.amount}</li>
                  <li>tt: ${itemData.tt}</li>
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

// Handle planet change and update item list
document.getElementById('planetSelect').addEventListener('change', async function () {
    const planet = this.value;
    const itemNameSelect = document.getElementById(currentItemNameInputId); // Changed here
    
    // Clear the itemName dropdown and add the default option
    itemNameSelect.innerHTML = '';
    itemNameSelect.appendChild(new Option("Select Item", "Default", true, true));

    // Fetch items from Firestore for the selected planet
    try {
        const itemsCollection = collection(db, `sweatexchange/${planet}/items`);
        const itemsSnapshot = await getDocs(itemsCollection);

        // Populate the item select options
        itemsSnapshot.forEach((itemDoc) => {
            const itemName = itemDoc.id;
            itemNameSelect.appendChild(new Option(itemName, itemName));
        });
    } catch (error) {
        console.error("Error fetching items: ", error);
    }
});

// Event listener for itemName select change
document.getElementById(currentItemNameInputId).addEventListener('change', async function () { // Changed here
    const selectedItem = this.value;
    
    if (selectedItem === "Default") {
        // Clear input fields when "Select Item" is chosen
        document.getElementById(currentItemNameInputId).value = ''; // Changed here
        document.getElementById('amountInput').value = '';
        document.getElementById('sweatpriceInput').value = '';
        document.getElementById('pedpriceInput').value = '';
        document.getElementById('ttmaxInput').value = '';
        document.getElementById('ttInput').value = '';
        return;
    }
    
    // Populate the form with the existing item's details for editing
    const planet = document.getElementById('planetSelect').value;
    try {
        const itemDocRef = doc(db, `sweatexchange/${planet}/items`, selectedItem);
        const itemDoc = await getDoc(itemDocRef);

        if (itemDoc.exists()) {
            const itemData = itemDoc.data();
            document.getElementById(currentItemNameInputId).value = selectedItem; // Changed here
            document.getElementById('amountInput').value = itemData.amount || '';
            document.getElementById('sweatpriceInput').value = itemData.sweatprice || '';
            document.getElementById('pedpriceInput').value = itemData.pedprice || '';
            document.getElementById('ttmaxInput').value = itemData.ttmax || '';
            document.getElementById('ttInput').value = itemData.tt || '';
        } else {
            console.log("Item not found!");
        }
    } catch (error) {
        console.error("Error fetching item data: ", error);
    }
});

// Handle item addition or editing
document.getElementById('submit-sweatitemFB').addEventListener('click', async () => {
    const planet = document.getElementById('planetSelect').value;
    const itemName = document.getElementById(currentItemNameInputId).value.trim(); // Changed here
    const amount = document.getElementById('amountInput').value;
    const sweatprice = document.getElementById('sweatpriceInput').value.trim();
    const pedprice = document.getElementById('pedpriceInput').value.trim();
    const ttmax = document.getElementById('ttmaxInput').value.trim();
    const tt = document.getElementById('ttInput').value.trim();
    
    // Validate input fields
    if (!itemName || !amount || !sweatprice || !pedprice || !ttmax || !tt) {
        alert("Please fill in all fields.");
        return;
    }

    // Prepare the item data
    const newItem = {
        amount: parseInt(amount),
        sweatprice,
        pedprice,
        ttmax,
        tt,
    };

    try {
        // Check if it's a new item or an existing item
        const itemDocRef = doc(db, `sweatexchange/${planet}/items`, itemName);

        // If the item already exists, update it, otherwise add a new item
        const itemDoc = await getDoc(itemDocRef);
        if (itemDoc.exists()) {
            // Update existing item
            await updateDoc(itemDocRef, newItem);
            alert("Item updated successfully!");
        } else {
            // Add new item
            await setDoc(itemDocRef, newItem);
            alert("Item added successfully!");
        }

        // Refresh the item list after adding or editing
        populateSweatExchanges();
        
        // Clear input fields after submission
        document.getElementById(currentItemNameInputId).value = ''; // Changed here
        document.getElementById('amountInput').value = '';
        document.getElementById('sweatpriceInput').value = '';
        document.getElementById('pedpriceInput').value = '';
        document.getElementById('ttmaxInput').value = '';
        document.getElementById('ttInput').value = '';

    } catch (error) {
        console.error("Error adding/updating item: ", error);
        alert("Failed to add/update item. Please try again.");
    }
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
		  receptionTab.classList.add('hidden');
		  receptionBox.classList.add('hidden');
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
		receptionTab.classList.add('Active');
		receptionBox.classList.add('Avtive');
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
	// Call on page load
// Call the function to display the exchange data on page load
	getExchangeData();
	
//hmmm
