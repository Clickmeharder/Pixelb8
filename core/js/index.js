//index.js
document.addEventListener('DOMContentLoaded', function() {
  // Function to open the modal
  function openModal(modalId) {
    var modal = document.getElementById(modalId);
    modal.style.display = 'block';
  }

  // Function to close all modals
  function closeModal() {
    var modals = document.querySelectorAll('.modal');
    modals.forEach(function(modal) {
      modal.style.display = 'none';
    });
  }

  // Get all modal triggers and add event listeners to open respective modals
  var modalTriggers = document.querySelectorAll('.modal-trigger');
  modalTriggers.forEach(function(trigger) {
    trigger.addEventListener('click', function() {
      var targetModalId = trigger.getAttribute('data-target');
      openModal(targetModalId);
    });
  });

  // Get all close buttons inside modals and add event listeners to close modals
  var closeButtons = document.querySelectorAll('.modal .close, .modal .close-modal');
  closeButtons.forEach(function(button) {
    button.addEventListener('click', function() {
      closeModal();
    });
  });

  // Close modals when clicking outside modal content
  window.addEventListener('click', function(event) {
    var modals = document.querySelectorAll('.modal');
    modals.forEach(function(modal) {
      if (event.target == modal) {
        modal.style.display = 'none';
      }
    });
  });

  // Firebase configuration
  const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID",
    measurementId: "YOUR_MEASUREMENT_ID"
  };

  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const auth = firebase.auth();
  const provider = new firebase.auth.GithubAuthProvider();
  
  auth.onAuthStateChanged((user) => {
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
    auth.signInWithPopup(provider)
      .then((result) => {
        const credential = firebase.auth.GithubAuthProvider.credentialFromResult(result);
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
});