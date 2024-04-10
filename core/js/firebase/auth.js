// firebase/auth.js

	//import scripts
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
  import { getAuth, signInWithPopup, GithubAuthProvider, onAuthStateChanged, updateProfile  } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
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

    // Set up the onAuthStateChanged listener
    onAuthStateChanged(auth, async (user) => {
      const statusElement = document.getElementById('loginStatus');
      const userauthproveriderElement = document.getElementById('userauthProvider');
      const usernameElement = document.getElementById('username');
      const emailElement = document.getElementById('email');
      const listedElementEmail = document.getElementById('userinfolist-email');
      const photoElement = document.getElementById('profilephoto');
      const emailVerifiedElement = document.getElementById('emailVerified');
      const profileLinkElement = document.getElementById('profileLink');
      const loginButton = document.getElementById('loginbutt');
      const logoutButton = document.getElementById('logoutbutt');
	  const userpixelcountElement = document.getElementById('Userpixelcount');

      if (user !== null) {
        // User is signed in
        user.providerData.forEach(async (profile) => {
          console.log("Sign-in provider: " + profile.providerId);
          console.log("Provider-specific UID: " + profile.uid);
          console.log("UserName: " + profile.displayName);
          console.log("Email: " + profile.email);
          console.log("Photo URL: " + profile.photoURL);
        
          statusElement.textContent = "Status: Online";
          userauthproveriderElement.textContent = profile.providerId;
          usernameElement.textContent = user.displayName || "Nameless";
          emailElement.textContent = user.email || "Unknown";
          photoElement.src = user.photoURL || "default.jpg";
		  userpixelcountElement.classList.remove('hidden');
          emailVerifiedElement.textContent = user.emailVerified ? "► Verified" : " ► Unverified";
          emailVerifiedElement.classList.remove('hidden');
          listedElementEmail.classList.remove('hidden');
          profileLinkElement.classList.remove('hidden');
          userauthproveriderElement.classList.remove('hidden');
          loginButton.classList.add('hidden');
          logoutButton.classList.remove('hidden');

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
        });
      } else {
        // User is signed out
        statusElement.textContent = "Status: offline";
        usernameElement.textContent = "StrangerDanger!";
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
      }
    });

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
	
    // Add event listener to login button
	const loginButton = document.getElementById('loginbutt');
    loginButton.addEventListener('click', signInWithGitHub);
	
	// Select the button element by its ID
	const enterButton = document.getElementById('enterButt');

	// Add a click event listener to the button
	enterButton.addEventListener('click', () => {
		// Redirect to the desired URL
		console.log('Enter Butt Sequence Initiated');
		window.location.href = 'https://pixelb8.lol/home';
	});
//hmmm