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
// Get the form and the container
const form = document.getElementById('addItemForm');
const sweatexchangeContainer = document.getElementById('sweatexchange-DB');

// Handle form submission to add or edit an item
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent default form submission

  // Get form values
  const planet = document.getElementById('planetSelect').value;
  const itemName = document.getElementById('itemName').value.trim();
  const amount = parseInt(document.getElementById('amount').value);
  const tt = parseFloat(document.getElementById('tt').value);
  const ttmax = parseFloat(document.getElementById('ttmax').value);
  const sweatprice = parseFloat(document.getElementById('sweatprice').value);
  const pedprice = parseFloat(document.getElementById('pedprice').value);

  // Check if form is in edit mode
  const isEdit = form.hasAttribute('data-doc-id') && form.hasAttribute('data-item-id');
  const docId = form.getAttribute('data-doc-id');
  const itemId = form.getAttribute('data-item-id');

  try {
    // Get reference to the 'sweatexchange' document and 'items' subcollection
    const docRef = doc(db, 'sweatexchange', planet);
    const itemRef = doc(collection(docRef, 'items'), isEdit ? itemId : itemName);

    // Create or update item
    await setDoc(itemRef, {
      amount: amount,
      tt: tt,
      ttmax: ttmax,
      sweatprice: sweatprice,
      pedprice: pedprice,
    });

    // Provide feedback
    console.log(isEdit ? 'Item updated successfully' : 'Item added successfully');

    // Reset form and attributes
    form.reset();
    form.removeAttribute('data-doc-id');
    form.removeAttribute('data-item-id');

    // Optionally: Refresh the displayed data
    // getExchangeData();

  } catch (error) {
    console.error(isEdit ? 'Error updating item: ' : 'Error adding item: ', error);
  }
});

// Fetch and display updated exchange data
function getExchangeData() {
  getDocs(collection(db, 'sweatexchange'))
    .then(async (querySnapshot) => {
      sweatexchangeContainer.innerHTML = ''; // Clear previous content

      for (const doc of querySnapshot.docs) {
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
            const li = document.createElement('li');
            li.innerHTML = `
              <strong>${itemDoc.id}</strong>:
              <ul>
                <li>Stock: ${itemData.amount}</li>
                <li>TT: ${itemData.tt}/${itemData.ttmax}</li>
                <li>TT Max: ${itemData.ttmax}</li>
                <li>Sweat Cost: ${itemData.sweatprice}</li>
                <li>PED Cost: ${itemData.pedprice}</li>
              </ul>
            `;

            const editButton = document.createElement('button');
            editButton.textContent = 'Edit';
            editButton.addEventListener('click', () => editItem(doc.id, itemDoc.id));

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => removeItem(doc.id, itemDoc.id));

            li.appendChild(editButton);
            li.appendChild(removeButton);
            exchangeDiv.appendChild(li); // Append the completed item to the exchangeDiv
          });
          docHTML += `</ul>`;
        }

        exchangeDiv.innerHTML = docHTML; // Add the built HTML to the div
        sweatexchangeContainer.appendChild(exchangeDiv); // Add the div to the container
      }
    })
    .catch((error) => {
      console.error('Error fetching exchange data:', error);
    });
}
function editItem(docId, itemId) {
  const docRef = doc(db, 'sweatexchange', docId, 'items', itemId);
  getDoc(docRef).then((itemDoc) => {
    if (itemDoc.exists()) {
      const itemData = itemDoc.data();

      // Populate form fields
      document.getElementById('planetSelect').value = docId;
      document.getElementById('itemName').value = itemId;
      document.getElementById('amount').value = itemData.amount;
      document.getElementById('tt').value = itemData.tt;
      document.getElementById('ttmax').value = itemData.ttmax;
      document.getElementById('sweatprice').value = itemData.sweatprice;
      document.getElementById('pedprice').value = itemData.pedprice;

      // Save docId and itemId to update later
      document.getElementById('addItemForm').setAttribute('data-doc-id', docId);
      document.getElementById('addItemForm').setAttribute('data-item-id', itemId);
    }
  });
}

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
