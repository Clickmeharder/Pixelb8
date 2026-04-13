// firebase/auth.js
/* 
Availability	# in Stock	Item	Buy with Sweat	Buy with PED
Yes	30 ish	B101 Amp	110 bottles	0.18 PED (225%)
Yes	99+	Sollomate Rubio	123 bottles	0.20 PED (225%)
Yes	50 ish	EP-2 Proton	321 bottles	0.50 PED (250%)
Yes	99+	Sollomate Azuro	800 bottles	1.40 PED (200%)
Yes	99+	Skildek Lancehead	200 bottles	0.30 PED (170%)
Limited	20	Shotgun (SA)	1025 bottles	2.10 PED (+0.10) 
*/
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

    // Set up the onAuthStateChanged listener
   onAuthStateChanged(auth, async (user) => {
		const loggedInControls = document.getElementById('loggedInControls');
		const loginButton = document.getElementById('loginbutt');
		const logoutButton = document.getElementById('logoutbutt');
		const usernameElement = document.getElementById('username');
		const profilePhoto = document.getElementById('profilephoto');
		const userPixelCount = document.getElementById('Userpixelcount');

		if (user) {
			// === USER IS LOGGED IN ===
			console.log('User logged in:', user);

			// Show logged-in controls
			loggedInControls.style.display = 'block';
			loginButton.classList.add('hidden');
			logoutButton.classList.remove('hidden');

			// Update basic UI
			usernameElement.textContent = user.displayName || "Pixel Colonist";
			profilePhoto.src = user.photoURL || "assets/images/logo/pixelb8logo1.png";
			
			// Fetch pixel balance from Firestore
			try {
				const userDoc = await getDoc(doc(db, 'users', user.uid));
				if (userDoc.exists()) {
					const data = userDoc.data();
					userPixelCount.textContent = `Pixels: ${data.balancePixels || 0}`;
					userPixelCount.classList.remove('hidden');
				}
			} catch (e) {
				console.warn("Could not load pixel balance", e);
			}

		} else {
			// === USER IS LOGGED OUT ===
			loggedInControls.style.display = 'none';
			loginButton.classList.remove('hidden');
			logoutButton.classList.add('hidden');
			usernameElement.textContent = "StrangerDanger!";
			profilePhoto.src = "assets/images/logo/pixelb8logo1.png";
			userPixelCount.classList.add('hidden');
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
    // Add event listener to login button
	const loginButton = document.getElementById('loginbutt');
    loginButton.addEventListener('click', signInWithGitHub);

	// Select the logout button element by its ID
	const logoutButton = document.getElementById('logoutbutt');
	logoutButton.addEventListener('click', signOutFromFirebase);
	  /* $('#modal-editProfile').modal('show'); */
	});
	// Call on page load
// ====================== PROFILE FUNCTIONS ======================

// Open Edit Profile Modal
document.getElementById('editProfileBtn').addEventListener('click', () => {
    const user = auth.currentUser;
    if (!user) return;

    // Pre-fill the form
    document.getElementById('update-username').value = user.displayName || '';
    document.getElementById('update-photoURL').value = user.photoURL || '';

    // Show the modal
    const modal = document.getElementById('modal-editProfile');
    modal.style.display = 'block';
});

// Close Edit Profile Modal
document.querySelectorAll('.close-modal-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const modal = btn.closest('.modal');
        if (modal) modal.style.display = 'none';
    });
});

// Handle Edit Profile Form Submission
document.getElementById('update-profile-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const username = document.getElementById('update-username').value.trim();
    const photoURL = document.getElementById('update-photoURL').value.trim();

    const user = auth.currentUser;
    if (!user) return;

    try {
        await updateProfile(user, {
            displayName: username || user.displayName,
            photoURL: photoURL || user.photoURL
        });

        alert("✅ Profile updated successfully!");
        document.getElementById('modal-editProfile').style.display = 'none';

        // Refresh UI
        document.getElementById('username').textContent = username || user.displayName;
        document.getElementById('profilephoto').src = photoURL || user.photoURL;

    } catch (error) {
        console.error("Error updating profile:", error);
        alert("Failed to update profile: " + error.message);
    }
});

// ====================== VIEW ALL PROFILES ======================

document.getElementById('viewAllProfilesBtn').addEventListener('click', async () => {
    const profilesContainer = document.getElementById('allProfilesContainer') || 
        createProfilesModal();

    profilesContainer.innerHTML = '<p style="text-align:center; color:#888;">Loading profiles...</p>';

    try {
        const querySnapshot = await getDocs(collection(db, 'UserProfiles'));
        let html = '<h3 style="margin-bottom:15px; color:#0ff;">All User Profiles</h3>';

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const isCurrentUser = auth.currentUser && doc.id === auth.currentUser.uid;

            html += `
                <div style="background:#1a1a1a; padding:12px; margin:8px 0; border-radius:6px; border:1px solid ${isCurrentUser ? '#0ff' : '#333'};">
                    <strong style="color:#0ff;">${data.displayName || 'Anonymous'}</strong>
                    ${isCurrentUser ? ' <span style="color:#0f0;">(You)</span>' : ''}
                    <br>
                    <small style="color:#888;">${data.email || ''}</small>
                    ${data.bio ? `<p style="margin:5px 0; font-size:0.9em;">${data.bio}</p>` : ''}
                </div>`;
        });

        if (querySnapshot.empty) {
            html += '<p style="color:#666; text-align:center;">No profiles found yet.</p>';
        }

        profilesContainer.innerHTML = html;
        profilesContainer.style.display = 'block';

    } catch (error) {
        console.error("Error loading profiles:", error);
        profilesContainer.innerHTML = '<p style="color:#f66;">Failed to load profiles.</p>';
    }
});

// Helper to create modal container if it doesn't exist
function createProfilesModal() {
    const modal = document.createElement('div');
    modal.id = 'allProfilesContainer';
    modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: #111; border: 2px solid #0ff; padding: 20px; width: 90%; max-width: 600px;
        max-height: 80vh; overflow-y: auto; border-radius: 8px; z-index: 10000; display: none;
    `;
    document.body.appendChild(modal);
    return modal;
}
//hmmm
