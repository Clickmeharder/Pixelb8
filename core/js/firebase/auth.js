// firebase/auth.js

	//import scripts
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics.js";
  import { getFirestore, collection, getDocs, doc, getDoc, addDoc } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
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
	  const userprofileBox = document.getElementById('user-profile-box');

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
		  userprofileBox.classList.remove('hidden');
		  userprofileBox.classList.add('Active');
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
		userprofileBox.classList.remove('Active');
		userprofileBox.classList.add('hidden');
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
	  // Show the modal for editing profile
	  $('#modal-editProfile').modal('show');
	});
//hmmm
