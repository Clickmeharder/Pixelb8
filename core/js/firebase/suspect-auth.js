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
    console.log("Error getting documents: ", error);8
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

/* document.getElementById('viewAllProfilesBtn').addEventListener('click', async () => {
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
 */
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
// ====================== SAVE / LOAD BUYING & SELLING LISTS ======================

// ====================== SAVE BUYING & SELLING LISTS ======================

// Save current Buying List to Firebase
async function saveMyBuyingList() {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to save your buying list.");
        return;
    }

    try {
        await setDoc(doc(db, "UserBuyingLists", user.uid), {
            userId: user.uid,
            displayName: user.displayName || "Anonymous",
            buyingList: inventoryState.buyingList || [],
            updatedAt: new Date().toISOString(),
            itemCount: (inventoryState.buyingList || []).length
        });

        alert(`✅ Your Buying List has been saved publicly (${(inventoryState.buyingList || []).length} items).`);
        console.log("✅ Buying list saved successfully");
    } catch (error) {
        console.error("Error saving buying list:", error);
        alert("Failed to save buying list. See console for details.");
    }
}

// Save current Selling List (items marked SELL_MU)
// Save Selling List - FIXED & SMART VERSION
async function saveMySellingList() {
    const user = auth.currentUser;
    if (!user) {
        alert("You must be logged in to save your selling list.");
        return;
    }

    console.log("🔍 Starting saveMySellingList...");

    const decisions = inventoryState.decisions || {};
    const items = inventoryState.items || {};
    let sellingItems = [];

    // 1. Primary method: From decisions
    Object.entries(decisions).forEach(([key, dec]) => {
        if (dec.type === 'SELL_MU' || dec.action === 'sell_mu') {
            const itemData = items[dec.itemId] || items[key] || {};

            const entry = {
                itemId: dec.itemId || key,
                name: itemData.name || dec.name || "Unknown Item",
                quantity: itemData.quantity || dec.quantity || 0,
                mu: dec.meta?.mu || dec.mu || 100,
                totalValue: itemData.totalValue || 0,
                ttValue: itemData.value || 0,
                location: itemData.location || dec.location || "Unknown"
            };

            if (entry.name !== "Unknown Item" || entry.quantity > 0) {
                sellingItems.push(entry);
                console.log("✅ Added from decisions:", entry.name);
            }
        }
    });

    // 2. Fallback: Scrape directly from the visible "For Sale [Wts]" table
    if (sellingItems.length === 0) {
        console.log("⚠️ No items found in decisions. Scraping from sell-mu table...");
        
        const rows = document.querySelectorAll('#sell-mu-tbody tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length < 2) return;

            const name = cells[1] ? cells[1].textContent.trim() : "Unknown";
            const qtyText = cells[2] ? cells[2].textContent.trim() : "1";
            const muText = cells[5] ? cells[5].textContent.trim() : "100";

            if (name && name !== "") {
                sellingItems.push({
                    name: name,
                    quantity: parseInt(qtyText) || 1,
                    mu: parseFloat(muText) || 100,
                    totalValue: 0,
                    location: "From Table"
                });
                console.log("✅ Scraped from table:", name);
            }
        });
    }

    console.log(`Final sellingItems count: ${sellingItems.length}`, sellingItems);

    if (sellingItems.length === 0) {
        alert("No selling items detected. Make sure the item is in the 'For Sale [Wts]' section.");
        return;
    }

    try {
        await setDoc(doc(db, "UserSellingLists", user.uid), {
            userId: user.uid,
            displayName: user.displayName || "Anonymous",
            sellingList: sellingItems,
            updatedAt: new Date().toISOString(),
            itemCount: sellingItems.length
        });

        alert(`✅ Your Selling List has been saved publicly (${sellingItems.length} items).`);
        console.log("✅ Selling list saved successfully!");
    } catch (error) {
        console.error("Error saving selling list:", error);
        alert("Failed to save selling list. Check console.");
    }
}
// ====================== COMMUNITY MARKET ======================

let currentMarketFilter = 'both'; // 'wtb', 'wts', or 'both'

async function loadCommunityMarket() {
    const container = document.getElementById('market-container');
    container.innerHTML = `<p style="text-align:center; color:#888; padding:80px;">Loading community market...</p>`;

    try {
        const [buyingSnap, sellingSnap] = await Promise.all([
            getDocs(collection(db, "UserBuyingLists")),
            getDocs(collection(db, "UserSellingLists"))
        ]);

        let items = [];

        // Process Buying Lists (Wtb)
        if (currentMarketFilter === 'wtb' || currentMarketFilter === 'both') {
            buyingSnap.forEach(doc => {
                const data = doc.data();
                if (data.buyingList) {
                    data.buyingList.forEach(item => {
                        items.push({
                            ...item,
                            type: 'wtb',
                            userId: doc.id,
                            displayName: data.displayName || 'Anonymous',
                            updatedAt: data.updatedAt
                        });
                    });
                }
            });
        }

        // Process Selling Lists (Wts)
        if (currentMarketFilter === 'wts' || currentMarketFilter === 'both') {
            sellingSnap.forEach(doc => {
                const data = doc.data();
                if (data.sellingList) {
                    data.sellingList.forEach(item => {
                        items.push({
                            ...item,
                            type: 'wts',
                            userId: doc.id,
                            displayName: data.displayName || 'Anonymous',
                            updatedAt: data.updatedAt
                        });
                    });
                }
            });
        }

        // Simple search filter
        const searchTerm = document.getElementById('market-search').value.toLowerCase().trim();
        if (searchTerm) {
            items = items.filter(item => 
                (item.name && item.name.toLowerCase().includes(searchTerm)) ||
                (item.displayName && item.displayName.toLowerCase().includes(searchTerm))
            );
        }

        if (items.length === 0) {
            container.innerHTML = `<p style="color:#888; text-align:center; padding:80px;">No matching items found.</p>`;
            return;
        }

        const viewMode = document.getElementById('market-view-mode').value;

        if (viewMode === 'cards') {
            let html = '<div style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:15px;">';
            items.forEach(item => {
                const isWtb = item.type === 'wtb';
                html += `
                    <div class="community-list-card" data-user-id="${item.userId}">
                        <div style="display:flex; justify-content:space-between; align-items:start;">
                            <strong style="color:${isWtb ? '#0a3' : '#f93'};">${item.name}</strong>
                            <span style="font-size:0.85em; color:#666;">${item.displayName}</span>
                        </div>
                        <div style="margin:8px 0; font-size:1.1em;">
                            ${isWtb ? 'Wanted:' : 'For Sale:'} 
                            <strong>${item.quantity || item.targetQty || 1}</strong> 
                            @ ${item.mu || item.targetMu || 100}%
                        </div>
                        <small style="color:#666;">${new Date(item.updatedAt).toLocaleDateString()}</small>
                    </div>`;
            });
            html += '</div>';
            container.innerHTML = html;
        } else {
            // Table view
            let html = `<table class="tableTheme" style="width:100%;">
                <thead><tr>
                    <th>Type</th><th>Item</th><th>Qty</th><th>MU%</th><th>User</th><th>Last Updated</th>
                </tr></thead><tbody>`;
            
            items.forEach(item => {
                const isWtb = item.type === 'wtb';
                html += `<tr data-user-id="${item.userId}">
                    <td style="color:${isWtb ? '#0a3' : '#f93'};">${isWtb ? 'Wtb' : 'Wts'}</td>
                    <td><strong>${item.name}</strong></td>
                    <td>${item.quantity || item.targetQty || 1}</td>
                    <td>${item.mu || item.targetMu || 100}%</td>
                    <td>${item.displayName}</td>
                    <td>${new Date(item.updatedAt).toLocaleDateString()}</td>
                </tr>`;
            });
            html += `</tbody></table>`;
            container.innerHTML = html;
        }

    } catch (err) {
        console.error(err);
        container.innerHTML = `<p style="color:#f66; padding:40px;">Failed to load market data.</p>`;
    }
}

// ====================== COMMUNITY TAB EVENT LISTENERS ======================
// ====================== GLOBAL EVENT LISTENERS ======================
document.addEventListener('click', (e) => {

    // ==================== SAVE BUTTONS (in InventoryTabC) ====================
    if (e.target.id === 'saveMyBuyingListBtn') {
        saveMyBuyingList();
    }
    if (e.target.id === 'saveMySellingListBtn') {
        saveMySellingList();
    }

    // ==================== COMMUNITY MARKET TAB ====================

    // Subtab switching inside Community tab
    if (e.target.id === 'communityBuyingTabBtn') {
        switchCommunitySubtab('buying');
    }
    if (e.target.id === 'communitySellingTabBtn') {
        switchCommunitySubtab('selling');
    }

    // Browse / Refresh buttons
    if (e.target.id === 'browseCommunityBuyingBtn') {
        loadCommunityBuyingLists();
    }
    if (e.target.id === 'browseCommunitySellingBtn') {
        loadCommunitySellingLists();
    }
    if (e.target.id === 'btn-refresh-market') {
        loadCommunityMarket();        // for the unified version
    }

    // Filter buttons in unified market
    if (e.target.id === 'btn-show-wtb') {
        currentMarketFilter = 'wtb';
        document.querySelectorAll('#InventoryTabD .stat-tab-btn').forEach(btn => btn.classList.remove('active-filter'));
        e.target.classList.add('active-filter');
        loadCommunityMarket();
    }
    if (e.target.id === 'btn-show-wts') {
        currentMarketFilter = 'wts';
        document.querySelectorAll('#InventoryTabD .stat-tab-btn').forEach(btn => btn.classList.remove('active-filter'));
        e.target.classList.add('active-filter');
        loadCommunityMarket();
    }
    if (e.target.id === 'btn-show-both') {
        currentMarketFilter = 'both';
        document.querySelectorAll('#InventoryTabD .stat-tab-btn').forEach(btn => btn.classList.remove('active-filter'));
        e.target.classList.add('active-filter');
        loadCommunityMarket();
    }

    // View mode change
    if (e.target.id === 'market-view-mode') {
        loadCommunityMarket();
    }

    // Click on community list card
    const card = e.target.closest('.community-list-card');
    if (card) {
        const userId = card.dataset.userId;
        const type = card.dataset.type;
        if (userId) {
            if (type === 'buying') viewUserBuyingList(userId);
            // Add viewUserSellingList(userId) later if needed
        }
    }

    // Close modal
    if (e.target.id === 'closeViewModalBtn') {
        const modal = document.getElementById('viewListModal');
        if (modal) modal.remove();
    }
});