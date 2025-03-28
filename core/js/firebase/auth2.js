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
	


// Function to populate account details
function populateAccountDetails(user) {
  const accountDetailsElement = document.getElementById('accountdetails');
  accountDetailsElement.innerHTML = ''; // Clear previous content

  if (user !== null) {
    // User is signed in
    const userDetails = [
      { key: 'Status', value: 'Online' },
      { key: 'Username', value: user.displayName || 'No Name Set' },
      { key: 'Auth Alias', value: user.providerData[0]?.displayName || '-Email Account-' },
      { key: 'Profile Pic', value: user.photoURL || 'null' },
      { key: 'Pixel Count', value: user.pixelcount || 'null' },
      { key: 'Auth Provider', value: user.providerData[0]?.providerId || 'uknown' },
	  { key: 'User Email', value: user.email || 'null' }, // This can be populated if needed
	  { key: 'Auth Provider email', value: user.providerData[0]?.email || '-idk-' },
      { key: 'EmailVerified', value: user.emailVerified ? '► Verified' : '► Unverified' }, // This can be populated if needed
    ];

    userDetails.forEach((detail) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${detail.key}: ${detail.value}`;
      accountDetailsElement.appendChild(listItem);
    });
  } else {
    // User is signed out
    const offlineDetails = [
      { key: 'Status', value: 'Offline' },
      { key: 'Username', value: 'StrangerDanger!' },
      { key: 'ProfilePhoto', value: 'assets/images/logo/pixelb8logo1.png' }
    ];

    offlineDetails.forEach((detail) => {
      const listItem = document.createElement('li');
      listItem.textContent = `${detail.key}: ${detail.value}`;
      accountDetailsElement.appendChild(listItem);
    });
  }
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
// Function to check if user has a balance and set it if not


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
	  const innerContentloggedin = document.getElementById('innercontent-loggedin');
	  const innerContentloggedout = document.getElementById('innercontent-loggedout');
	  const iframeElement = document.getElementById("dynamicIframe");

	  const baseURL =
		  "https://offers.cpx-research.com/index.php?app_id=25257&ext_user_id={unique_user_id}&secure_hash={secure_hash}&username={user_name}&email={user_email}&subid_1=&subid_2";

      if (user !== null) {
        // User is signed in
		console.log('user logged in: ', user);
        user.providerData.forEach(async (profile) => {
          console.log("Sign-in provider: " + profile.providerId);
          console.log("Provider-specific UID: " + profile.uid);
		  console.log("users uid: " + user.uid);
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
		  userpixelcountElement.textContent = profile.pixelcount || "null";
		  userpixelcountElement.classList.remove('hidden');
          emailVerifiedElement.textContent = user.emailVerified ? "► Verified" : " ► Unverified";
          emailVerifiedElement.classList.remove('hidden');
          listedElementEmail.classList.remove('hidden');
          profileLinkElement.classList.remove('hidden');
          userauthproveriderElement.classList.remove('hidden');
          loginButton.classList.add('hidden');
          logoutButton.classList.remove('hidden');
			
		  innerContentloggedout.classList.add('hidden');
          innerContentloggedin.classList.remove('hidden');
		  const uniqueUserId = user.uid;
            const secureHash = "UfoP64jkzbo5A4wOd5814Qga2Pbn5g70";
            const userName = encodeURIComponent(user.displayName || "Guest");
            const userEmail = encodeURIComponent(user.email || "");

            const finalURL = baseURL
                .replace("{unique_user_id}", uniqueUserId)
                .replace("{secure_hash}", secureHash)
                .replace("{user_name}", userName)
                .replace("{user_email}", userEmail);

            console.log("Updated iframe src:", finalURL);
          // Set the color based on email verification status
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
		  populateAccountDetails(user);
		  		const script1 = {
					div_id: "fullscreen",
					theme_style: 1,
					order_by: 2,
					limit_surveys: 7,
				};

				const config = {
					general_config: {
						app_id: 25257,
						ext_user_id: user.uid,
						email: user.email,
						username: user.displayName,
						secure_hash: "UfoP64jkzbo5A4wOd5814Qga2Pbn5g70",
					},
					style_config: {
						text_color: "#2b2b2b",
						survey_box: {
							topbar_background_color: "#ffaf20",
							box_background_color: "white",
							rounded_borders: true,
							stars_filled: "black",
						},
					},
					script_config: [script1],
					debug: false,
					useIFrame: true,
					iFramePosition: 1,
					functions: {
						no_surveys_available: () => {
							console.log("no surveys available function here");
						},
						count_new_surveys: (countsurveys) => {
							console.log("count surveys function here, count:", countsurveys);
						},
						get_all_surveys: (surveys) => {
							console.log("get all surveys function here, surveys: ", surveys);
						},
						get_transaction: (transactions) => {
							console.log("transaction function here, transaction: ", transactions);
						}
					}
				};

				window.config = config; // Ensure that config is assigned to window before being used
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
		console.log("User is not signed in. Showing a default iframe or hiding it.");
        iframeElement.src = "about:blank";
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
