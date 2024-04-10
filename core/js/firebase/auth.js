// firebase/auth.js

	//import scripts
  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
  import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-analytics.js";
  import { getAuth, signInWithPopup, GithubAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";
  import { getFirestore } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
  
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
	 
	 
	 //other firebase initiallization
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth();
  const provider = new GithubAuthProvider();
  //new database stuff
  const database  = getFirestore(app);
  
  db.settings({ timestampsInSnapshots: true });

	onAuthStateChanged(auth, (user) => {
	  if (user) {
		// User is signed in
		const uid = user.uid;
		console.log("User is signed in with UID:", uid);
		// You can perform actions for a signed-in user here, like redirecting to a dashboard
		// or loading user-specific data.
	  } else {
		// User is signed out
		console.log("User is signed out");
		// You can redirect to a sign-in page or perform other actions for a signed-out user.
	  }
	});
	
	function signInWithGitHub() {
	const auth = getAuth();
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
	const loginButton = document.getElementById('loginbutt');
	loginButton.addEventListener('click', signInWithGitHub);