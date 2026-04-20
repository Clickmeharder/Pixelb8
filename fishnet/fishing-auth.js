

// --- 1. INITIALIZE FIREBASE ---
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";

import { 
    getFirestore, collection, getDocs, doc, getDoc, updateDoc, 
    setDoc, deleteDoc, addDoc, serverTimestamp, 
    collectionGroup, query, limit,
    Timestamp, increment, orderBy // <--- ADDED orderBy
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import { 
    getAuth, 
    signInWithCredential, 
    signInWithCustomToken,
	signInAnonymously,
    GithubAuthProvider, 
    onAuthStateChanged, 
    updateProfile, 
    signOut,
    createUserWithEmailAndPassword, // <--- ADD THIS
    signInWithEmailAndPassword    // <--- ADD THIS
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

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
const auth = getAuth(app);
const db = getFirestore(app);

// Global State for Batching

let globalUserData = null;
const logWindow = document.getElementById('log-window');
const startBtn = document.getElementById('start-btn');
const browseBtn = document.getElementById('browse-btn');
const pathInput = document.getElementById('path-input');
const loggedInControls = document.getElementById('loggedInControls');
const updateIsOnlineInp = document.getElementById('update-isOnline');
const statusDot = document.getElementById('topbar-status-dot');
const loginButton = document.getElementById('loginbutt');
const logoutButton = document.getElementById('logoutbutt');
const userPixelCount = document.getElementById('Userpixelcount');

// 🟢 Global UI Selectors (Classes)
const usernameElements = document.querySelectorAll('.loggedinUsername');
const profilePhotoElements = document.querySelectorAll('.userProfileImg');
const entropiaNameElements = document.querySelectorAll('.entropiaName');

// UI Elements
const statusDisplay = document.getElementById('userStatusDisplay');
const loginStatus = document.getElementById('loginStatus');

// Inline Input Fields for Editing
const updateUsernameInp = document.getElementById('update-username');
const updatePhotoInp = document.getElementById('update-photoURL');
const updateEntropiaInp = document.getElementById('update-entropia');
const updateStatusInp = document.getElementById('update-status');

// Split Role Selectors
const userRoleIcons = document.querySelectorAll('.userRoleIcon');
const userRoleLabels = document.querySelectorAll('.userRoleLabel');

const settingsUsername = document.getElementById('settings-username-display');
const settingsPhoto = document.getElementById('settingsprofilephoto');

const saveProfileBtn = document.getElementById('saveProfileBtn');
const defaultAvatar = "assets/images/logo/pixelb8-guest.png";
    const roleToIcon = {
        ceo: '👑',
        admin: '⭐',
        mod: '🛡️',
        susrep: '💼',
		contestHost: '',
        vip: '🌟',
        associate: '🤝',
        verified: '✔️',
        user: '🙂',
        guest: '👤',
        default: '👤'
    };
if (saveProfileBtn) {
    saveProfileBtn.onclick = async () => {
        const user = auth.currentUser;
        if (!user) return alert("You must be logged in to sync to cloud.");

        try {
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                displayname: updateUsernameInp.value,
                entropianame: updateEntropiaInp.value,
                photoURL: updatePhotoInp.value,
                lastUpdated: serverTimestamp()
            });
            
            // Also update the local Firebase Auth profile
            await updateProfile(user, {
                displayName: updateUsernameInp.value,
                photoURL: updatePhotoInp.value
            });

            alert("✅ Cloud Profile Synchronized.");
            addLog("📡 Cloud Profile Updated.");
        } catch (err) {
            console.error("Sync Error:", err);
            alert("❌ Sync Failed: " + err.message);
        }
    };
}
// --- 2. PROTECTED DATA LOADER ---
async function loadAuthenticatedData(user) {
    try {
        console.log("🔓 Permissions granted. Fetching user data...");
        const userPixelCount = document.getElementById('Userpixelcount');
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
            const data = userDoc.data();
            if (userPixelCount) {
                userPixelCount.textContent = `Pixels: ${data.balancePixels || 0}`;
                userPixelCount.classList.remove('hidden');
            }
        }

        if (typeof loadCommunityMarket === "function") {
            loadCommunityMarket();
        }
    } catch (e) {
        console.warn("⚠️ Data sync partially failed:", e);
    }
}

// --- 3. THE  BRIDGE (RECEIVER) ---
console.log("🕵️ AUTH MODULE: Awake and listening for the bridge...");
async function anonymousIdentity(euName, displayInput) {
    if (!euName || euName.length < 3) {
        addLog("❌ IDENTITY_ERR: Valid Entropia Name required.", true);
        return;
    }

    try {
        // 1. Create the real Firebase Anonymous Session
        const credential = await signInAnonymously(auth);
        const user = credential.user;

        // 2. Set the Auth Profile Display Name
        await updateProfile(user, { displayName: displayInput || euName });

        // 3. Initialize Firestore with the FULL Schema
        const userDocRef = doc(db, 'users', user.uid);
        
        const ghostData = {
            // Financials
            balancePixels: 0,
            balanceUsd: 0.00,
            
            // Identity
            displayname: displayInput || euName,
            entropianame: euName,
            photoURL: defaultAvatar, // Use your defined fallback constant
            
            // Status & Permissions
            role: 'user', 
            isOnline: 'online',
            status: "In Cognito...",
            
            // Verification Flags
            euNameVerified: false, 
            verified: false,
            isAnonymous: true, // Flag to identify ghost accounts in Admin Hub
            
            // Technical / Affiliates
            subId1: "{ghost_session}",
            subId2: "{unlinked}",
            
            // Timing
            lastStatusChange: serverTimestamp(),
            lastUpdated: serverTimestamp(),
            createdAt: serverTimestamp()
        };

        await setDoc(userDocRef, ghostData);

        // Update local global variable so the UI updates immediately
        globalUserData = ghostData;

        addLog(`👻 GHOST_LINK_COMPLETE: ${euName.toUpperCase()}`);
        
        // Refresh UI elements (similar to onAuthStateChanged logic)
        usernameElements.forEach(el => el.textContent = ghostData.displayname);
        entropiaNameElements.forEach(el => el.textContent = ghostData.entropianame);
        
    } catch (error) {
        console.error("Ghost Link Error:", error);
        addLog(`❌ LINK_FAILED: ${error.code}`, true);
    }
}
// --- GHOST IDENTITY EVENT DELEGATION ---
document.addEventListener('click', async (e) => {
    // 1. Handle the "START_FISHING" button in the anon-auth-container
    if (e.target && e.target.id === 'btn-anon-auth') {
        const anonDisp = document.getElementById('anon-displayname')?.value.trim();
        const anonEU = document.getElementById('anon-euname')?.value.trim();

        if (!anonEU || anonEU.length < 3) {
            return addLog("❌ IDENTITY_ERR: Valid Entropia Name required.", true);
        }

        try {
            addLog("👻 INITIALIZING_GHOST_LINK...");
            
            // Step A: Create real Firebase Anonymous Session to satisfy Security Rules
            const credential = await signInAnonymously(auth);
            const user = credential.user;

            // Step B: Set local persistence so the app remembers who you are
            localStorage.setItem('guest_uid', user.uid);
            localStorage.setItem('guest_ename', anonEU);
            localStorage.setItem('guest_dname', anonDisp || anonEU);

            // Step C: Initialize the user document in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            await setDoc(userDocRef, {
                displayname: anonDisp || anonEU,
                entropianame: anonEU,
                role: 'user',
                euNameVerified: false,
                isAnonymous: true,
                createdAt: serverTimestamp()
            });

            addLog(`✅ GHOST_LINK_ACTIVE: ${anonEU.toUpperCase()}`);

            // Step D: If there is an active contest selected, join it immediately
            // Note: This assumes you've stored the target contest info somewhere
            // or the user clicks "Join" on a specific card.
            if (window.pendingContestJoin) {
                const { planet, contestId } = window.pendingContestJoin;
                joinContest(planet, contestId);
            } else {
                addLog("📡 IDENTITY_SYNCED: Now select a contest to join.");
            }

        } catch (error) {
            console.error(error);
            addLog(`❌ LINK_FAILED: ${error.code}`, true);
        }
    }

});


if (window.electronAPI && window.electronAPI.onAuthSuccess) {
    console.log("🔗 Bridge connection established.");
    
    window.electronAPI.onAuthSuccess((token) => {
        console.log("🎉 SUCCESS: Bridge token received! Length:", token.length);
        
        setTimeout(() => {
            console.log("🚀 Attempting Firebase Sign-In...");

            try {
                // FIX: Pass the token as the ONLY argument. 
                // Firebase uses this to reconstruct the session.
                const credential = GithubAuthProvider.credential(token); 

                signInWithCredential(auth, credential)
                    .then((result) => {
                        console.log("✅ Firebase Auth Success! User:", result.user.displayName);
                    })
                    .catch((error) => {
                        console.error("🔥 Firebase Auth Failed:", error.code, error.message);
                        
                        // Fallback: If Credential fails, try Custom Token login
                        if (error.code === 'auth/argument-error') {
                            console.log("🔄 Attempting Custom Token Fallback...");
                            return signInWithCustomToken(auth, token);
                        }
                    });
            } catch (e) {
                console.error("❌ Sign-in initialization error:", e);
            }
        }, 500); 
    });
} else {
    console.error("❌ CRITICAL: Electron Bridge NOT detected!");
}

async function updateEntropiaProfile(newName) {
    const user = auth.currentUser;
    if (!user) return;

    try {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            entropianame: newName,
            lastUpdated: serverTimestamp() // Better practice for sync
        }, { merge: true });
        
        alert("eu profile updated");
        
        // Manual UI sync since profile changes don't trigger onAuthStateChanged
        entropiaNameElements.forEach(el => el.textContent = newName);
    } catch (e) {
        console.error("Update failed:", e);
    }
}
onAuthStateChanged(auth, async (user) => {
    const body = document.body;
    const hostSection = document.getElementById('host-tools');
    const adminTabBtn = document.querySelector('.tab-btn[data-target="admin-terminal"]');
    const anonAuthContainer = document.getElementById('anon-auth-container');

    if (user) {
        console.log('✅ User Session Active:', user.uid);
        body.classList.add('auth-logged-in');
        body.classList.remove('auth-logged-out');

        // --- HIDE ANON AUTH IF LOGGED IN ---
        if (anonAuthContainer) anonAuthContainer.style.display = 'none';

        const displayName = user.displayName || "Pixel Colonist";
        const photoURL = user.photoURL || defaultAvatar;

        usernameElements.forEach(el => el.textContent = displayName);
        profilePhotoElements.forEach(img => img.src = photoURL);

        if (updateUsernameInp) updateUsernameInp.value = displayName;
        if (updatePhotoInp) updatePhotoInp.value = photoURL;

        try {
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (!userDoc.exists()) {
                console.log("🆕 New User: Initializing Firestore identity...");
                const newUserData = {
                    displayname: displayName,
                    entropianame: "Unlinked Avatar",
                    status: "Scanning horizon...",
                    role: 'user',
                    verified: false, 
                    isOnline: 'online',
                    balancePixels: 0,
                    euNameVerified: false,
                    lastUpdated: serverTimestamp(),
                    createdAt: serverTimestamp()
                };
                await setDoc(userDocRef, newUserData);
                globalUserData = newUserData;
            } else {
                globalUserData = userDoc.data();
                
                if (!globalUserData.displayname && user.displayName) {
                    await updateDoc(userDocRef, { displayname: user.displayName });
                    globalUserData.displayname = user.displayName;
                }
            }

            // --- PERMISSIONS & TAB VISIBILITY ---
            const userRole = (globalUserData.role || 'user').toLowerCase();
            const staffRoles = ['ceo', 'admin', 'mod', 'susrep', 'contesthost'];
            const adminRoles = ['ceo', 'admin', 'mod'];

            // 1. Toggle Host Creation Tools (Contest Terminal)
            if (hostSection) {
                hostSection.style.display = staffRoles.includes(userRole) ? 'block' : 'none';
            }

            // 2. Toggle Admin Hub Tab Button
            if (adminTabBtn) {
                adminTabBtn.style.display = adminRoles.includes(userRole) ? 'block' : 'none';
            }

            // --- UI UPDATE FROM GLOBAL DATA ---
            const onlineStatus = globalUserData.isOnline || "online";
            if (statusDot) statusDot.setAttribute('data-status', onlineStatus);
            if (updateIsOnlineInp) updateIsOnlineInp.value = onlineStatus;
            if (loginStatus) loginStatus.textContent = `Status: ${onlineStatus.toUpperCase()}`;

            const eName = globalUserData.entropianame || "Unlinked Avatar";
            const isVerified = globalUserData.euNameVerified === true;
            
            entropiaNameElements.forEach(el => {
                el.textContent = eName + (isVerified ? ' ☑' : '');
            });
            if (updateEntropiaInp) updateEntropiaInp.value = eName;

            const uStatus = globalUserData.status || "Scanning horizon...";
            if (statusDisplay) statusDisplay.textContent = `"${uStatus}"`;
            if (updateStatusInp) updateStatusInp.value = uStatus;

            const role = globalUserData.role || 'user';
            const icon = roleToIcon[role] || roleToIcon['default'];
            userRoleIcons.forEach(el => el.textContent = icon);
            userRoleLabels.forEach(el => el.textContent = role.toUpperCase());

            if (userPixelCount) {
                userPixelCount.textContent = (globalUserData.balancePixels || "0") + "px";
            }

            // --- TRIGGER CONTEST LIST SCAN ---
            if (typeof refreshContestList === "function") {
                refreshContestList();
            }

            // --- RECONNECT ACTIVE CONTEST HUD ---
            // Small delay to ensure globalUserData is fully mapped before scanning rosters
            setTimeout(() => {
                if (typeof restoreActiveContest === 'function') {
                    restoreActiveContest();
                }
            }, 1500);

        } catch (error) {
            console.error("❌ Error fetching account data:", error);
        }
        
        loadAuthenticatedData(user);

    } else {
        console.log('❌ No active session.');
        globalUserData = null; 
        body.classList.add('auth-logged-out');
        body.classList.remove('auth-logged-in');

        // --- SHOW ANON AUTH IF LOGGED OUT ---
        if (anonAuthContainer) anonAuthContainer.style.display = 'block';

        // Reset UI Elements
        if (hostSection) hostSection.style.display = 'none';
        if (adminTabBtn) adminTabBtn.style.display = 'none';

        // Auto-switch away from Admin Tab if user logs out while viewing it
        if (document.getElementById('admin-terminal')?.style.display === 'block') {
            document.querySelector('[data-target="scout-pane"]')?.click();
        }

        if (statusDot) statusDot.setAttribute('data-status', 'offline');
        usernameElements.forEach(el => el.textContent = "StrangerDanger!");
        profilePhotoElements.forEach(img => img.src = defaultAvatar);
        entropiaNameElements.forEach(el => el.textContent = "-");
        
        // Hide HUD on logout
        const hud = document.getElementById('contest-hud');
        if (hud) hud.style.display = 'none';
        if (hudInterval) clearInterval(hudInterval);
        activeContestRef = null;

        [updateUsernameInp, updatePhotoInp, updateEntropiaInp, updateStatusInp].forEach(inp => {
            if (inp) inp.value = "";
        });
    }
});
// --- 5. SIGN OUT ---
function signOutFromFirebase() {
    signOut(auth)
        .then(() => {
            console.log('Logged out successfully.');
            window.location.reload(); 
        })
        .catch((error) => console.error('Logout error:', error));
}

// --- 6. PROFILE MODAL FUNCTIONS ---
document.getElementById('saveProfileBtn')?.addEventListener('click', async () => {
    const user = auth.currentUser;
    if (!user) return;

    const newDisplayName = document.getElementById('update-username').value.trim();
    const newPhotoURL = document.getElementById('update-photoURL').value.trim();
    const newEntropia = document.getElementById('update-entropia').value.trim();
    const newStatus = document.getElementById('update-status').value.trim();

    const saveBtn = document.getElementById('saveProfileBtn');
    saveBtn.textContent = "⏳ SAVING...";

    try {
        // 1. Update Firebase Auth (for current session)
        await updateProfile(user, { 
            displayName: newDisplayName, 
            photoURL: newPhotoURL 
        });

        // 2. Update Firestore Database (for showUserDetails and other users)
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            displayname: newDisplayName, // CRITICAL: This fixes showUserDetails
            entropianame: newEntropia,
            status: newStatus,
            lastUpdated: new Date() 
        }, { merge: true });

        // 3. Update UI Text Elements immediately
        usernameElements.forEach(el => el.textContent = newDisplayName);
        profilePhotoElements.forEach(img => img.src = newPhotoURL || defaultAvatar);
        
        const statusDisp = document.getElementById('userStatusDisplay');
        if (statusDisp) statusDisp.textContent = `"${newStatus}"`;
        
        entropiaNameElements.forEach(el => {
            // Re-apply the checkmark if verified logic exists globally, 
            // otherwise just update the name string.
            el.textContent = newEntropia; 
        });

        // 4. Success State
        saveBtn.textContent = "✅ UPDATED";
        setTimeout(() => { 
            saveBtn.textContent = "💾 Save Changes"; 
        }, 2000);

    } catch (error) {
        console.error("Profile Save Error:", error);
        saveBtn.textContent = "❌ ERROR";
        setTimeout(() => { 
            saveBtn.textContent = "💾 Save Changes"; 
        }, 2000);
    }
});
// Toggle Popover
const topBarTrigger = document.getElementById('topBarUserTrigger');
const statusPopover = document.getElementById('statusPopover');

topBarTrigger?.addEventListener('click', (e) => {
    // Prevent menu from closing instantly if clicking inside it
    if (e.target.closest('#statusPopover')) return;
    
    statusPopover.classList.toggle('hidden');
});

// Close popover if clicking anywhere else on the screen
document.addEventListener('click', (e) => {
    if (!topBarTrigger.contains(e.target)) {
        statusPopover.classList.add('hidden');
    }
});

// AUTO-SAVE STATUS MESSAGE (New)
// Since we removed the "Save" button from this menu, 
// let's save the status message when the user hits 'Enter'
document.getElementById('update-status')?.addEventListener('keypress', async (e) => {
    if (e.key === 'Enter') {
        const user = auth.currentUser;
        if (!user) return;
        
        const newStatus = e.target.value.trim();
        const userDocRef = doc(db, 'users', user.uid);
        
        await setDoc(userDocRef, { status: newStatus }, { merge: true });
        
        // Update UI
        const statusDisplay = document.getElementById('userStatusDisplay');
        if (statusDisplay) statusDisplay.textContent = `"${newStatus}"`;
        
        // Visual feedback
        e.target.style.borderColor = '#0f0';
        setTimeout(() => e.target.style.borderColor = '#333', 1000);
    }
});

// --- AUTO-SAVE AVAILABILITY ---
updateIsOnlineInp?.addEventListener('change', async (e) => {
    const user = auth.currentUser;
    if (!user) return;

    const newIsOnline = e.target.value;
    
    // 1. Immediate UI Feedback (Client-side)
    if (statusDot) statusDot.setAttribute('data-status', newIsOnline);
    if (loginStatus) loginStatus.textContent = `Status: ${newIsOnline.toUpperCase()}`;

    try {
        // 2. Silent Firestore Sync
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            isOnline: newIsOnline,
            lastStatusChange: new Date()
        }, { merge: true });

        console.log(`📡 Presence updated to: ${newIsOnline}`);
    } catch (error) {
        console.error("Presence Sync Failed:", error);
        // Fallback: reset UI if save fails
        alert("Tactical Link Failed: Could not sync status.");
    }
});

// ==================== ADMIN TERMINAL: USER MANAGEMENT ====================
// ==========================================
// ADMIN TERMINAL: HIERARCHY REGISTRY + FILTERING
// ==========================================
const initAdminUserRegistry = () => {
    const fetchBtn = document.getElementById('btn-fetch-users');
    const container = document.getElementById('admin-user-list');
    const searchInput = document.getElementById('admin-user-search'); // Add this to HTML
    const filterSelect = document.getElementById('admin-user-filter'); // Add this to HTML

    let allUsers = []; // Local cache for filtering
    const roleRank = {
        ceo: 10, admin: 9, mod: 8, susrep: 7, contesthost: 6,
        vip: 5, associate: 4, verified: 3, user: 2, guest: 1
    };

    if (!fetchBtn || !container) return;

    // --- RENDER ENGINE ---
    const renderFilteredUsers = () => {
        const searchTerm = searchInput?.value.toLowerCase() || "";
        const filterMode = filterSelect?.value || "all";
        
        container.innerHTML = '';
        
        let filtered = allUsers.filter(u => {
            const nameMatch = (u.displayname || "").toLowerCase().includes(searchTerm) || 
                              (u.entropianame || "").toLowerCase().includes(searchTerm);
            
            const isVerified = u.verified === true || u.euNameVerified === true;
            let statusMatch = true;
            if (filterMode === "verified") statusMatch = isVerified;
            if (filterMode === "pending") statusMatch = !isVerified;
            
            return nameMatch && statusMatch;
        });

        // Stats Header
        const stats = {
            total: allUsers.length,
            verified: allUsers.filter(u => u.verified || u.euNameVerified).length,
            pending: allUsers.filter(u => !(u.verified || u.euNameVerified)).length
        };

        const statsHeader = document.createElement('div');
        statsHeader.style = "background:#050505; border:1px solid #1a1a1a; padding:8px; margin-bottom:15px; display:grid; grid-template-columns: repeat(3, 1fr); text-align:center; font-family:monospace;";
        statsHeader.innerHTML = `
            <div><div style="color:#444; font-size:8px;">TOTAL</div><div style="color:#fff; font-size:14px;">${stats.total}</div></div>
            <div><div style="color:#444; font-size:8px;">VERIFIED</div><div style="color:#0f0; font-size:14px;">${stats.verified}</div></div>
            <div><div style="color:#444; font-size:8px;">PENDING</div><div style="color:#f66; font-size:14px;">${stats.pending}</div></div>
        `;
        container.appendChild(statsHeader);

        const myRole = (globalUserData?.role || 'user').toLowerCase();
        const myRank = roleRank[myRole] || 0;

        filtered.forEach((data) => {
            const uid = data.id;
            const currentRole = (data.role || 'user').toLowerCase();
            const targetRank = roleRank[currentRole] || 0;
            const canEdit = myRank > targetRank;
            const isVerified = data.verified === true || data.euNameVerified === true;

            const roleOptions = Object.keys(roleRank)
                .filter(r => (myRole === 'ceo' ? r !== 'ceo' : roleRank[r] < myRank))
                .map(r => `<option value="${r}" ${currentRole === r ? 'selected' : ''}>${r.toUpperCase()}</option>`)
                .join('');

            const row = document.createElement('div');
            row.className = "admin-user-row";
            row.style = `border-bottom:1px solid #111; padding:12px 0; opacity:${canEdit ? '1' : '0.5'}`;
            row.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div style="color:${isVerified ? '#0f0' : '#aaa'}; font-size:11px;">
                        ${roleToIcon[currentRole] || '👤'} ${data.displayname || 'Unknown'} 
                    </div>
                    <div style="display:flex; gap:5px;">
                        ${canEdit ? `
                            <button class="admin-sync-btn" data-uid="${uid}" style="background:#111; border:1px solid #555; color:#aaa; font-size:9px; cursor:pointer; padding:4px 8px;">SYNC</button>
                            <button class="admin-verify-toggle" data-uid="${uid}" data-status="${isVerified}" style="background:none; border:1px solid ${isVerified ? '#f66' : '#0f0'}; color:${isVerified ? '#f66' : '#0f0'}; font-size:9px; cursor:pointer; padding:4px 8px;">
                                ${isVerified ? 'REVOKE' : 'VERIFY'}
                            </button>
                        ` : `<span style="font-size:8px; color:#444;">[HIGHER CLEARANCE]</span>`}
                    </div>
                </div>
                ${canEdit ? `
                <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px; margin-top:8px;">
                    <input type="text" class="admin-edit-avatar" value="${data.entropianame || ""}" style="background:#000; border:1px solid #222; color:#0f0; font-size:10px;">
                    <select class="admin-edit-role" style="background:#000; border:1px solid #222; color:#ffaa00; font-size:10px;">
                        ${roleOptions}
                    </select>
                </div>` : ''}
            `;
            container.appendChild(row);
        });
    };

    // --- EVENT LISTENERS ---
    fetchBtn.onclick = async () => {
        fetchBtn.textContent = "📡 SCANNING...";
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            allUsers = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            renderFilteredUsers();
            fetchBtn.textContent = "REFRESH_DATABASE";
        } catch (err) {
            container.innerHTML = `<p style="color:#f66;">ACCESS_DENIED: ${err.code}</p>`;
        }
    };

    // Live search and filter toggles
    searchInput?.addEventListener('input', renderFilteredUsers);
    filterSelect?.addEventListener('change', renderFilteredUsers);

    // Click handler for buttons remains the same...
    // 2. UNIFIED UPDATE HANDLER
    container.onclick = async (e) => {
        const isSync = e.target.classList.contains('admin-sync-btn');
        const isToggle = e.target.classList.contains('admin-verify-toggle');

        if (isSync || isToggle) {
            const btn = e.target;
            const uid = btn.dataset.uid;
            const row = btn.closest('.admin-user-row');
            
            const avatarInput = row.querySelector('.admin-edit-avatar');
            const roleSelect = row.querySelector('.admin-edit-role');
            const verifyBtn = row.querySelector('.admin-verify-toggle');
            
            let newStatus;
            if (isToggle) {
                // If clicking verify/revoke, flip current status
                const wasVerified = btn.dataset.status === 'true';
                newStatus = !wasVerified;
            } else {
                // If just syncing, keep the status that's already on the verify button
                newStatus = (verifyBtn.dataset.status === 'true');
            }
            
            btn.disabled = true;
            const originalText = btn.textContent;
            btn.textContent = "WRITING...";

            try {
                const userRef = doc(db, 'users', uid);
                await updateDoc(userRef, {
                    verified: newStatus,
                    euNameVerified: newStatus,
                    entropianame: avatarInput.value.trim(),
                    role: roleSelect.value.toLowerCase()
                });
                
                if (typeof addLog === "function") {
                    addLog(`🔐 ADMIN_SYNC: [${uid}] metadata committed.`);
                }
                
                fetchBtn.click(); // Auto-refresh UI
            } catch (err) {
                console.error("Update Fail:", err);
                alert("ERR: Permissions blocked by security hierarchy.");
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }
    };

};

/*---------------------------------------------------------
  SECTION: SECURE MAIL RELAY SYSTEM
---------------------------------------------------------*/
// --- 1. TAB SWITCHING LOGIC ---
const setupMailTabs = () => {
    const tabBtns = document.querySelectorAll('.mail-tab-btn');
    const inbox = document.getElementById('inbox-messages');
    const outbox = document.getElementById('outbox-messages');

    tabBtns.forEach((btn, index) => {
        btn.addEventListener('click', () => {
            // Remove active status from all buttons
            tabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (index === 0) { // Inbox
                inbox.style.display = 'flex';
                outbox.style.display = 'none';
            } else { // Outbox
                inbox.style.display = 'none';
                outbox.style.display = 'flex';
            }
        });
    });
};

// --- 2. MESSAGE ELEMENT GENERATOR ---
// This handles creating the buttons and attaching listeners directly to them
/*---------------------------------------------------------
  UPDATED COMPONENT: Message Element Generator
---------------------------------------------------------*/
function createMessageMarkup(msgId, data, contact, folderType) {
const div = document.createElement('div');
    div.className = 'message-item';
	const role = contact.role;
    // 1. Resolve Role Icon
    const roleIcon = roleToIcon[contact.role] || roleToIcon['default'];
    
    // 2. Verification Logic
    const verifiedBadge = contact.isVerified 
        ? `<span class="verified-badge" title="VERIFIED AVATAR" style="color: #00f2ff; text-shadow: 0 0 5px #00f2ff; margin-left: 5px; cursor: help;">☑ Verified ${role}</span>` 
        : `<span class="unverified-badge" title="UNVERIFIED AVATAR" style="color: #555; margin-left: 5px; font-size: 0.9em; opacity: 0.7;">☒ Unverified ${role}</span>`;

    const timestamp = data.timestamp?.toDate ? data.timestamp.toDate() : new Date();
    const label = folderType === 'inbox' ? `FROM` : `TO`;
    const contactId = folderType === 'inbox' ? data.senderId : data.receiverId;

    const rawStatus = (contact.isOnline || 'offline').toLowerCase();
    const statusClass = `userstatus-${rawStatus}`;

    div.innerHTML = `
        <div class="meta">${timestamp.toLocaleString()}</div>
        <h3>
            ${label}:${roleIcon}
            <span style="color: #aaa; font-size: 0.9em; margin-right: 4px;">${verifiedBadge}</span>
        </h3>
        <h3>
            <span class="userstatus-indicator ${statusClass}" title="${rawStatus.toUpperCase()}"></span>
            <span class="contact-link" data-uid="${contactId}" style="cursor: pointer; text-decoration: underline;">${contact.entropiaName}</span>
        </h3>
        <p>${data.content}</p>
        
        <div class="message-actions"></div>
        <div class="reply-tray" style="display:none; margin-top:10px; border-top:1px ridge #333; padding-top:8px;">
            <textarea class="reply-input" placeholder="Enter secure response..." 
                style="width:100%; background:#111; border:1px solid #444; color:#0f0; font-family:monospace; font-size:10px; min-height:40px; resize:none;"></textarea>
            <div style="display:flex; gap:5px; margin-top:5px;">
                <button class="send-reply-btn" style="background:#0a2a0a; color:#0f0; border:1px solid #0f0; font-size:9px; cursor:pointer; padding:2px 8px;">SEND_RELAY</button>
                <button class="cancel-reply-btn" style="background:none; color:#555; border:1px solid #333; font-size:9px; cursor:pointer; padding:2px 8px;">CANCEL</button>
            </div>
        </div>
    `;

    // --- Listeners: Contact Intel ---
    div.querySelector('.contact-link').addEventListener('click', () => {
        if (typeof showUserDetails === 'function') {
            showUserDetails(contactId);
        } else {
            const detailsModal = document.getElementById('user-details');
            if (detailsModal) detailsModal.style.display = 'block';
        }
    });

    const actionsContainer = div.querySelector('.message-actions');
    const tray = div.querySelector('.reply-tray');

    // --- Listeners: Reply Logic ---
    if (folderType === 'inbox') {
        const replyBtn = document.createElement('button');
        replyBtn.textContent = 'REPLY';
        replyBtn.addEventListener('click', () => {
            tray.style.display = tray.style.display === 'none' ? 'block' : 'none';
        });
        actionsContainer.appendChild(replyBtn);

        // Send Reply logic
        div.querySelector('.send-reply-btn').addEventListener('click', () => {
            const content = div.querySelector('.reply-input').value;
            if (content.trim()) {
                sendTransmission(data.senderId, content);
                tray.style.display = 'none';
            }
        });

        // Cancel Reply
        div.querySelector('.cancel-reply-btn').addEventListener('click', () => {
            tray.style.display = 'none';
        });
    }

    // --- Listeners: Delete ---
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'DELETE';
    deleteBtn.style.color = '#f66';
    deleteBtn.addEventListener('click', () => deleteMessage(auth.currentUser.uid, folderType, msgId));
    actionsContainer.appendChild(deleteBtn);

    return div;
}
// Add 'query' and 'orderBy' to your getMessages function
async function getMessages() {
    const inboxContainer = document.getElementById('inbox-messages');
    const outboxContainer = document.getElementById('outbox-messages');
    const user = auth.currentUser;

    if (!user) return;

    inboxContainer.innerHTML = '<p style="color:#0f0; font-size:10px;">DECRYPTING_INBOX...</p>';
    outboxContainer.innerHTML = '<p style="color:#0f0; font-size:10px;">DECRYPTING_OUTBOX...</p>';

    try {
        // Fetch data without the Firestore 'orderBy' (no index needed!)
        const [inSnap, outSnap] = await Promise.all([
            getDocs(collection(db, `users/${user.uid}/inbox`)),
            getDocs(collection(db, `users/${user.uid}/outbox`))
        ]);

        // Convert Snapshots to Arrays and Sort in JS (Newest First)
        const sortedInbox = [...inSnap.docs].sort((a, b) => {
            const timeA = a.data().timestamp?.toMillis() || 0;
            const timeB = b.data().timestamp?.toMillis() || 0;
            return timeB - timeA; 
        });

        const sortedOutbox = [...outSnap.docs].sort((a, b) => {
            const timeA = a.data().timestamp?.toMillis() || 0;
            const timeB = b.data().timestamp?.toMillis() || 0;
            return timeB - timeA;
        });

        // Pass the sorted arrays to your rendering function
        renderGroupedMessages(sortedInbox, inboxContainer, 'inbox');
        renderGroupedMessages(sortedOutbox, outboxContainer, 'outbox');

    } catch (e) {
        console.error("Mail Relay Error:", e);
        inboxContainer.innerHTML = '<p style="color:red; font-size:10px;">RELAY_FAILED</p>';
    }
}
async function renderGroupedMessages(docs, container, folderType) {
    container.innerHTML = docs.length === 0 ? `<p style="color:#444; font-size:10px; margin:auto;">${folderType.toUpperCase()}_EMPTY</p>` : '';
    
    let lastDateLabel = "";

    for (const d of docs) {
        const data = d.data();
        const timestamp = data.timestamp?.toDate() || new Date();
        
        // Determine the Date Label (Today, Yesterday, or Date string)
        const dateLabel = getDateLabel(timestamp);

        // If the date label changed, inject a header
        if (dateLabel !== lastDateLabel) {
            const header = document.createElement('div');
            header.className = 'date-group-header';
            header.innerHTML = `<span>// ${dateLabel}</span>`;
            container.appendChild(header);
            lastDateLabel = dateLabel;
        }

        const contact = await getUserDetails(folderType === 'inbox' ? data.senderId : data.receiverId);
        container.appendChild(createMessageMarkup(d.id, data, contact, folderType));
    }
}

// Helper to calculate Date Labels
function getDateLabel(date) {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    // Format the actual date part (e.g., "15 APR 2026")
    const dateString = date.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
    }).toUpperCase();

    // Check for Today
    if (date.toDateString() === today.toDateString()) {
        return `TODAY - ${dateString}`;
    }
    
    // Check for Yesterday
    if (date.toDateString() === yesterday.toDateString()) {
        return `YESTERDAY - ${dateString}`;
    }
    
    // For anything older
    return dateString;
}
// --- 4. ACTIONS: SEND/DELETE/REPLY ---
async function deleteMessage(userUid, folder, messageId) {
    if (!confirm("PURGE TRANSMISSION?")) return;
    try {
        await deleteDoc(doc(db, `users/${userUid}/${folder}/${messageId}`));
        getMessages(); 
    } catch (e) { console.error(e); }
}

function openReplyInput(receiverId) {
    const content = prompt("ENTER SECURE TRANSMISSION:");
    if (content?.trim()) sendTransmission(receiverId, content);
}

async function sendTransmission(receiverId, content) {
    const user = auth.currentUser;
    if (!user) return;

    const messageData = {
        senderId: user.uid,
        receiverId: receiverId,
        content: content,
        timestamp: serverTimestamp()
    };

    try {
        await addDoc(collection(db, `users/${receiverId}/inbox`), messageData);
        await addDoc(collection(db, `users/${user.uid}/outbox`), messageData);
        alert("TRANSMISSION_SENT");
        getMessages();
    } catch (e) { console.error(e); }
}

// --- 5. INTEL: USER DETAILS ---
async function getUserDetails(userId) {
    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
            const data = userDoc.data();
            return { 
                entropiaName: data.entropianame || 'Unknown',
                isOnline: data.isOnline || 'offline',
                isVerified: data.euNameVerified === true || data.euNameVerified === "true",
                // ADD THIS LINE:
                role: data.role || 'default'
            };
        }
    } catch (e) { console.error(e); }
    return { entropiaName: 'Unknown', isOnline: 'offline', isVerified: false, role: 'default' };
}
// --- INTEL: POPULATE USER DETAILS MODAL ---
 async function showUserDetails(userId) {
    const detailsBox = document.getElementById('user-detailsbox');
    const detailsModal = document.getElementById('user-details');
    const errorBox = document.getElementById('user-detailsboxError');
    const sendBtn = document.getElementById('sendmessage-to-user');
    const intelInput = document.getElementById('intel-reply-input');

    if (!detailsBox || !detailsModal) return;

    // Reset input and state
    if (intelInput) intelInput.value = "";
    detailsModal.style.display = 'block';
    errorBox.style.display = 'none';
    detailsBox.innerHTML = '<p style="color:#0f0; font-size:10px;">[ ACCESSING_DATABASE... ]</p>';

    try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        
        if (userDoc.exists()) {
            const data = userDoc.data();
            const displayName = data.displayname || "Pixel Colonist";
            // RE-CHECK: Force verify check here
            const isVerified = data.euNameVerified === true || data.euNameVerified === "true";
            
            const verifiedBadge = isVerified 
                ? `<span class="verified-badge" title="VERIFIED AVATAR" style="color: #00f2ff; text-shadow: 0 0 5px #00f2ff; margin-left: 5px; cursor: help;">[☑ Verified]</span>` 
                : `<span class="unverified-badge" title="UNVERIFIED AVATAR" style="color: #555; margin-left: 5px; font-size: 0.9em; opacity: 0.7;">[☒ Unverified]</span>`;

            const role = data.role;
            const roleIcon = roleToIcon[data.role] || roleToIcon['default'];
            
            
            // Availability Mapping for Color
            const statusMap = {
                'online': '#0f0',
                'idle': '#ffaa00',
                'away': '#ffaa00',
                'busy': '#f00',
                'dnd': '#f00',
                'offline': '#888'
            };
            const currentStatus = (data.isOnline || 'offline').toLowerCase();
            const statusColor = statusMap[currentStatus] || '#888';
            

            detailsBox.innerHTML = `
				<div style="margin-bottom: 12px; display: flex; flex-direction: row; gap:4px;">
                    <span style="color: #a7a1a1; font-size: 14px; display: block;">
                        Account ID
                    </span> 
                    <span style="color: #0f0; font-size: 15px; letter-spacing: 1px; font-family: monospace;">
                        @${displayName}
                    </span>
                </div>
                <div style="margin-bottom: 12px;display: flex; flex-direction: row; gap:4px;">
                    <span style="color: #a7a1a1; font-size: 14px; display: block;">
                        User Role
                    </span> 
                    <span style="color: #fff; font-size: 15px; letter-spacing: 1px;">
                        ${roleIcon}${role}
                    </span>
                </div>
                <div style="margin-bottom: 12px;">
                    <span style="color: #a7a1a1; font-size: 14px; display: block;">
                        Entropia Identity
                    </span> 
                    <span style="color: #fff; font-size: 15px; letter-spacing: 1px;">
                        ${data.entropianame || 'UNLINKED_AVATAR'} 
                    </span>
					<span style="font-size: 14px; display: block;">
                        ${verifiedBadge}
                    </span> 
                </div>
                <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 8px;">
                    <div style="display:flex;flex: 1;flex-direction:row;">
                        <span style="color: #a7a1a1; font-size: 14px; display: block;">STATUS  </span>
                        <span style="margin-left:4px;color: ${statusColor}; text-shadow: 0 0 5px ${statusColor};">
                            ${currentStatus.toUpperCase()}
                        </span>
                    </div>
                    <div style="display:flex;flex: 1;flex-direction:row;">
                        <span style="color: #a7a1a1; font-size: 12px; display: block;">LAST_SYNC - </span>
                        <span style="color: #888; font-size: 12px;">
                            ${data.lastUpdated ? data.lastUpdated.toDate().toLocaleDateString() : 'NEVER'}
                        </span>
                    </div>
                </div>

                <div style="margin-bottom: 5px; border-left: 2px solid #333; padding-left: 10px;">
                    <span style="color: #a7a1a1; font-size: 13px; display: block;">status_note:</span>
                    <span style="color: #aaa; font-style: italic; font-size: 14px;">"${data.status || 'No bio on file.'}"</span>
                </div>
            `;

            if (sendBtn) {
                sendBtn.onclick = async () => {
                    const content = intelInput.value.trim();
                    if (!content) return;

                    sendBtn.textContent = "⏳ RELAYING...";
                    sendBtn.disabled = true;

                    try {
                        await sendTransmission(userId, content);
                        detailsModal.style.display = 'none';
                        intelInput.value = "";
                    } catch (err) {
                        console.error("Relay failed:", err);
                        errorBox.textContent = "[!] TRANSMISSION_FAILED";
                        errorBox.style.display = 'block';
                    } finally {
                        sendBtn.textContent = "📡 SEND TRANSMISSION";
                        sendBtn.disabled = false;
                    }
                };
            }

        } else {
            throw new Error("AVATAR_NOT_FOUND");
        }
    } catch (e) {
        errorBox.textContent = `[!] ERROR: ${e.message}`;
        errorBox.style.display = 'block';
        detailsBox.innerHTML = '';
    }
}



// Keep track of the last element we boosted
let lastActiveElement = null;

function bringToFront(element) {
    // 1. If there was a previous active element, drop its z-index back down
    if (lastActiveElement && lastActiveElement !== element) {
        lastActiveElement.style.zIndex = "10001"; // Your base z-index
    }

    // 2. Boost the current element
    element.style.zIndex = "10101"; // Base + 100
    
    // 3. Update the tracker
    lastActiveElement = element;
}
function makeDraggable(modalId, handleSelector) {
    const modal = document.getElementById(modalId);
    const handle = document.getElementById(handleSelector) || modal.querySelector(handleSelector);
    
    if (!modal || !handle) return;

    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    // Initial state
    handle.style.cursor = 'grab';

    handle.onmousedown = (e) => {
        e.preventDefault();
        bringToFront(modal);
        handle.style.cursor = 'grabbing';
        
        // Prepare modal for movement
        modal.style.position = 'fixed';
        modal.style.transform = 'none';
        modal.style.margin = '0';

        pos3 = e.clientX;
        pos4 = e.clientY;
        
        document.onmouseup = () => {
            handle.style.cursor = 'grab';
            document.onmouseup = null;
            document.onmousemove = null;
        };
        
        document.onmousemove = (e) => {
            e.preventDefault();
            pos1 = pos3 - e.clientX;
            pos2 = pos4 - e.clientY;
            pos3 = e.clientX;
            pos4 = e.clientY;

            // Calculate new position
            let newTop = modal.offsetTop - pos2;
            let newLeft = modal.offsetLeft - pos1;

            // --- BOUNDARY LIMITS ---
            const maxX = window.innerWidth - modal.offsetWidth;
            const maxY = window.innerHeight - modal.offsetHeight;

            // Constrain X (Left/Right)
            if (newLeft < 0) newLeft = 0;
            if (newLeft > maxX) newLeft = maxX;

            // Constrain Y (Top/Bottom)
            if (newTop < 0) newTop = 0;
            if (newTop > maxY) newTop = maxY;

            modal.style.top = newTop + "px";
            modal.style.left = newLeft + "px";
        };
    };
}

// --- 6. FISHING LOGIC ---
 // Add this to your global variables
let hudInterval = null;
// Initialize empty - will be populated by JSON
let sessionStats = { "Baitfish": 0, "Fish Scrap": 0 };
let sessionValues = { "Baitfish": 0, "Fish Scrap": 0 };


// Global state to hold user details from onAuthStateChanged
let currentUserData = null;
let activeContestRef = null; 
let currentEditingContestId = null;
async function initializeFishData() {
    try {
        const response = await fetch('assets/data/fishes.json');
        const data = await response.json();
        
        const grid = document.getElementById('manifest-grid');
        const targetSelect = document.getElementById('contest-target-fish');
        
        // 1. Clear Manifest Grid (keep standard categories)
        grid.innerHTML = `
            <div id="row-Baitfish" style="display:none; color:#aaa; font-size:11px;">BAITFISH: <span id="session-Baitfish" style="color:#0f0">0</span> <span id="val-Baitfish" style="color:#00ffff; font-size:9px;">(0.0000)</span></div>
            <div id="row-Fish-Scrap" style="display:none; color:#aaa; font-size:11px;">FISH SCRAP: <span id="session-Fish-Scrap" style="color:#0f0">0</span> <span id="val-Fish-Scrap" style="color:#00ffff; font-size:9px;">(0.0000)</span></div>
        `;

        // 2. Reset Dropdown with default "Baitfish" option
        if (targetSelect) {
            targetSelect.innerHTML = `<option value="Baitfish">Baitfish</option>`;
        }

        // 3. Loop through JSON to build UI and Dropdown
        data.forEach(fish => {
            fish.Sizes.forEach(size => {
                const fishName = size.Name; // e.g. "Young Calypso Salmon"
                const safeId = fishName.replace(/\s+/g, '-');

                // Register in tracking objects
                sessionStats[fishName] = 0;
                sessionValues[fishName] = 0;

                // Create UI Row for Manifest
                const div = document.createElement('div');
                div.id = `row-${safeId}`;
                div.style = "display:none; color:#aaa; font-size:11px;";
                div.innerHTML = `${fishName.toUpperCase()}: <span id="session-${safeId}" style="color:#0f0">0</span> <span id="val-${safeId}" style="color:#00ffff; font-size:9px;">(0.0000)</span>`;
                grid.appendChild(div);

                // Create Option for Contest Dropdown
                if (targetSelect) {
                    const opt = document.createElement('option');
                    opt.value = fishName;
                    opt.textContent = fishName;
                    targetSelect.appendChild(opt);
                }
            });
        });

        addLog("📋 MANIFEST: ASSET_REGISTRY_LOADED & DROPDOWN_SYNCED");
    } catch (err) {
        console.error("Failed to load fishes.json:", err);
        addLog("ERR: FISH_DATA_LOAD_FAILED", true);
    }
}
// Call this when the app starts or when "Initialize Scout" is clicked
initializeFishData();

function canCreateContest() {
    if (!globalUserData) return false;
    const staffRoles = ['ceo', 'admin', 'mod', 'susrep', 'contesthost'];
    return staffRoles.includes(globalUserData.role?.toLowerCase());
}

const btnCreateContest = document.getElementById('btn-create-contest');
btnCreateContest?.addEventListener('click', async () => {
    // 1. CLEARANCE CHECK
    if (!canCreateContest()) {
        return alert("RESTRICTED: Higher clearance required.");
    }

    // 2. DATA EXTRACTION
    const planet = document.getElementById('contest-planet').value;
    const name = document.getElementById('contest-name-input').value.trim();
    const targetFish = document.getElementById('contest-target-fish').value;
    const startTimeStr = document.getElementById('contest-start-time').value;
    const duration = parseInt(document.getElementById('contest-duration').value);
    const allowGuests = document.getElementById('contest-allow-guests')?.checked || false;

    // 3. PRIZE PARSING
    const prizeElements = document.querySelectorAll('.prize-item');
    const prizes = Array.from(prizeElements)
        .map(el => el.value.trim())
        .filter(val => val !== "");

    // 4. VALIDATION
    if (!name || !startTimeStr) return alert("❌ Error: Missing Name or Start Time.");
    if (prizes.length === 0) return alert("❌ Error: At least one prize must be defined.");

    try {
        // 5. CONSTRUCT FLAT PATH
        const contestId = name.replace(/\s+/g, '_');
        const contestRef = doc(db, 'fishingContests', contestId);
        
        const existingSnap = await getDoc(contestRef);
        const exists = existingSnap.exists();
        
        let participantCount = 0;
        let originalCreatedAt = serverTimestamp();

        // Preserve state if overwriting/editing
        if (exists) {
            const existingData = existingSnap.data().settings;
            participantCount = existingData.participantCount || 0;
            originalCreatedAt = existingData.createdAt || serverTimestamp();
        }

        const scheduledDate = new Date(startTimeStr);
        if (isNaN(scheduledDate.getTime())) return alert("❌ Error: Invalid Date.");

        // 6. DATABASE COMMIT
        await setDoc(contestRef, {
            settings: {
                planet: planet, 
                name: name,
                targetFish: targetFish,
                startTime: Timestamp.fromDate(scheduledDate), 
                duration: duration,
                allowGuests: allowGuests,
                hostUID: auth.currentUser.uid,
                hostName: globalUserData?.entropianame || "Unknown Host",
                prizes: prizes,
                status: 'pending',
                participantCount: participantCount,
                createdAt: originalCreatedAt
            }
        }, { merge: true });

        // 7. UI RESET & LOGGING
        currentEditingContestId = null; 
        btnCreateContest.textContent = "BROADCAST_CONTEST_TO_NETWORK";
        
        addLog(`🚀 CONTEST_CREATED: ${name} @ ${planet.toUpperCase()}`);
        alert("Broadcast Synchronized.");
        
        if (typeof refreshContestList === 'function') refreshContestList();

    } catch (err) {
        console.error("Broadcast Error:", err);
        addLog(`❌ CRT_ERR: ${err.code || 'PERMISSION_DENIED'}`, true);
    }
});

/**
 * PRIZE_FIELD_MANAGEMENT
 */
document.getElementById('btn-add-prize-field')?.addEventListener('click', () => {
    const container = document.getElementById('prize-list-inputs');
    const count = container.querySelectorAll('.prize-input-group').length + 1;
    
    const newField = document.createElement('div');
    newField.className = "prize-input-group";
    newField.style = "display: flex; gap: 5px; margin-bottom: 5px;";
    
    const label = count === 2 ? '2nd' : count === 3 ? '3rd' : `${count}th`;
    
    newField.innerHTML = `
        <input type="text" class="prize-item" placeholder="${label} Place Prize" style="flex: 3;">
        <button class="remove-prize-btn" style="width: 25px; background: #300; color: #f66; border: 1px solid #f66; cursor: pointer; font-size: 10px; font-weight: bold;">X</button>
    `;
    container.appendChild(newField);
});

document.getElementById('prize-list-inputs')?.addEventListener('click', (e) => {
    if (e.target.classList.contains('remove-prize-btn')) {
        const row = e.target.closest('.prize-input-group');
        row.remove();
        
        document.querySelectorAll('.prize-item').forEach((input, index) => {
            if (index === 0) return; 
            const i = index + 1;
            const label = i === 2 ? '2nd' : i === 3 ? '3rd' : `${i}th`;
            input.placeholder = `${label} Place Prize`;
        });
    }
});


/**
 * Cleaned joinContest: FLAT PATH ARCHITECTURE
 * Target: fishingContests / {contestId} / participants / {eName}
 */
async function joinContest(contestId) {
    if (!contestId || typeof contestId !== 'string') {
        console.error("🚫 ABORT: joinContest received an invalid ID:", contestId);
        return; 
    }

    const eName = globalUserData?.entropianame || localStorage.getItem('guest_ename');
    const dName = globalUserData?.displayname || localStorage.getItem('guest_dname') || eName;

    if (!eName || eName === "Unlinked Avatar") {
        return addLog("❌ ERROR: Link your Entropia identity first.", true);
    }

    const contestRef = doc(db, 'fishingContests', contestId);
    const participantRef = doc(db, 'fishingContests', contestId, 'participants', eName);
    
    try {
        const participantSnap = await getDoc(participantRef);

        if (participantSnap.exists()) {
            // --- UNREGISTER ---
            await deleteDoc(participantRef);
            await updateDoc(contestRef, { "settings.participantCount": increment(-1) });
            addLog(`📡 UNREGISTERED: ${eName.toUpperCase()}`);
            
            if (activeContestRef && activeContestRef.path === participantRef.path) {
                if (typeof hudInterval !== 'undefined') clearInterval(hudInterval);
                activeContestRef = null;
            }
        } else {
            // --- REGISTER ---
            const contestSnap = await getDoc(contestRef);
            if (!contestSnap.exists()) return alert("Contest signal lost.");
            
            const contestData = contestSnap.data().settings;

            // GATEKEEPER: Block registration if the Janitor has closed the contest
            if (contestData.status === 'concluded') {
                return addLog("🚫 REGISTRATION_CLOSED: This contest has finalized.", true);
            }

            const user = auth.currentUser;
            await setDoc(participantRef, {
                uid: user?.uid || localStorage.getItem('guest_uid'),
                displayName: dName,
                isGuest: !user || user.isAnonymous,
                joinedAt: serverTimestamp(),
                score: 0,
                totals: { 
                    "Baitfish": 0, 
                    "Atlantian Sturgeon": 0, 
                    "Blue Snapper": 0, 
                    "Corinthian Lynxfish": 0 
                }
            });

            await updateDoc(contestRef, { "settings.participantCount": increment(1) });
            addLog(`🎣 REGISTERED: ${eName.toUpperCase()}`);

            activeContestRef = participantRef; 
            window.currentContestSettings = contestData;

            if (typeof hudInterval !== 'undefined') clearInterval(hudInterval);
            hudInterval = setInterval(updateContestHUD, 30000); 
            updateContestHUD();
        }

        setTimeout(() => refreshContestList(), 500);

    } catch (err) {
        console.error("Join/Leave Error:", err);
        addLog(`🚫 ACCESS_DENIED: ${err.code}`, true);
    }
}

/**
 * FETCH_CONTEST_ROSTER: SYNCED_MANIFEST_VIEWER
 * Refactored for Flat Pathing
 */
/**
 * FETCH_CONTEST_ROSTER: SYNCED_MANIFEST_VIEWER
 * Fetches the 'participants' sub-collection for a specific contest.
 */
/**
 * FETCH_CONTEST_ROSTER
 * Displays the participant list within a contest card, 
 * applying Podium styling if the contest is finalized.
 */
async function fetchContestRoster(contestId, rosterContainer, isConcluded = false) {
    if (!contestId) return;
    
    rosterContainer.innerHTML = `<span style="color: #444; font-family: monospace; font-size: 9px;">📡 SYNCING_MANIFEST...</span>`;
    
    try {
        const rosterRef = collection(db, 'fishingContests', contestId, 'participants');
        const q = query(rosterRef, orderBy("score", "desc"), limit(10));
        const snap = await getDocs(q);
        
        if (snap.empty) {
            rosterContainer.innerHTML = `<span style="color: #444; font-size: 9px;">NO_ACTIVE_SIGNALS_FOUND</span>`;
            return;
        }

        rosterContainer.innerHTML = isConcluded ? 
            `<div style="color: #ffaa00; font-size: 10px; font-weight: bold; margin-bottom: 5px; width: 100%; border-bottom: 1px solid #222; padding-bottom: 2px;">🏆 FINAL_STANDINGS</div>` : ''; 
        
        let rank = 1;
        snap.forEach(doc => {
            const pData = doc.data();
            const eName = doc.id; 
            const dName = pData.displayName || eName;
            const isGuest = pData.isGuest === true;

            let rankColor = isGuest ? '#666' : '#0f0';
            let rankLabel = `#${rank}`;

            if (isConcluded) {
                if (rank === 1) { rankColor = '#ffd700'; rankLabel = '🥇'; }
                else if (rank === 2) { rankColor = '#c0c0c0'; rankLabel = '🥈'; }
                else if (rank === 3) { rankColor = '#cd7f32'; rankLabel = '🥉'; }
                else { rankColor = '#444'; }
            }

            const totals = pData.totals || {};
            const cargoHtml = Object.entries(totals)
                .filter(([_, qty]) => qty > 0)
                .map(([name, qty]) => `<span class="cargo-item">${qty}x ${name.toUpperCase()}</span>`)
                .join('') || '<span class="cargo-item">ZERO_BYCATCH</span>';

            const statusIcon = isGuest ? '👤' : '🛡️';
            const displayLabel = dName === eName ? dName : `${dName}`;
            
            const row = document.createElement('div');
            row.className = 'roster-row';
            row.style.borderLeft = `2px solid ${rankColor}`;
            
            row.innerHTML = `
                <div class="roster-info-main" style="color: ${rankColor}; font-size: 10px; display: flex; justify-content: space-between; pointer-events: none;">
					<div style="display: flex;flex-direction: column;">
						<span>${rankLabel} ${statusIcon} ${displayLabel.toUpperCase()}</span>
						<span style="font-weight: bold;font-size: 11px;color: #ababab;">[${eName}]</span>
					</div>
                    <span style="color: #ffaa00;">${pData.score || 0} PTS</span>
                </div>
                <div class="roster-cargo-list">
                    <div style="margin-bottom: 2px; color: #444;">[ CARGO_MANIFEST ]</div>
                    ${cargoHtml}
                </div>
            `;
            
            rosterContainer.appendChild(row);
            rank++;
        });

    } catch (err) {
        console.error("MANIFEST_SYNC_FAILURE:", err);
        rosterContainer.innerHTML = `<span style="color: #f66; font-size: 9px;">ERR: ${err.code}</span>`;
    }
}

/**
 * REFRESH_CONTEST_LIST
 * Scans for active/concluded contests and builds the Browser UI.
 */
async function refreshContestList() {
    const container = document.getElementById('contest-list-container');
    if (!container) return;

    container.innerHTML = `<p style="color: #444; text-align: center; margin-top: 50px;">📡 SCANNING_FREQUENCIES...</p>`;

    try {
        const q = query(
            collection(db, 'fishingContests'), 
            orderBy("settings.status", "asc"), 
            orderBy("settings.startTime", "desc"), 
            limit(20)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            container.innerHTML = `<p style="color: #444; text-align: center; margin-top: 50px;">NO_ACTIVE_SIGNALS_DETECTED</p>`;
            return;
        }

        container.innerHTML = ''; 
        const eName = globalUserData?.entropianame || localStorage.getItem('guest_ename');

        for (const contestDoc of querySnapshot.docs) {
            const contestData = contestDoc.data();
            const data = contestData.settings;
            if (!data) continue; 

            const contestId = contestDoc.id;
            const planet = data.planet || "Unknown";
            const isConcluded = data.status === 'concluded';
            
            let isRegistered = false;
            if (eName && eName !== "Unlinked Avatar") {
                const pRef = doc(db, 'fishingContests', contestId, 'participants', eName);
                const pSnap = await getDoc(pRef);
                isRegistered = pSnap.exists();
            }

            const actualCount = data.participantCount || 0;
            const isOwner = auth.currentUser && auth.currentUser.uid === data.hostUID;
            const startTimestamp = data.startTime?.toDate().getTime() || 0;
            
            const prizesHtml = (data.prizes || []).map((p, i) => {
                const label = i === 0 ? '1st' : i === 1 ? '2nd' : i === 2 ? '3rd' : `${i+1}th`;
                return `<div style="color: #0f0; font-size: 11px;"><span style="color: #ffaa00;">${label}:</span> ${p}</div>`;
            }).join('');

            const statusColor = isConcluded ? '#444' : '#0f0';
            const statusLabel = isConcluded ? '[FINALIZED]' : `[${planet.toUpperCase()}]`;
            const btnText = isConcluded ? "CONTEST_LOCKED" : (isRegistered ? "ABORT_REGISTRATION" : "INITIATE_REGISTRATION");
            const btnColor = isConcluded ? '#444' : (isRegistered ? '#f66' : '#0f0');
            const btnBg = isConcluded ? '#111' : (isRegistered ? '#2a0a0a' : '#0a2a0a');

            const card = document.createElement('div');
            card.className = 'contest-card';
            card.setAttribute('data-contest-id', contestId); 
            card.setAttribute('data-concluded', isConcluded); // Critical for the event listener
            card.style = `background: #0a0a0a; border: 1px solid #222; border-left: 3px solid ${statusColor}; padding: 10px; margin-bottom: 8px; cursor: pointer; transition: border 0.2s;`;
            
            card.innerHTML = `
                <div class="contest-main-info" style="display: flex; justify-content: space-between; pointer-events: none;">
                    <div>
                        <div style="font-size: 13px; color: ${isConcluded ? '#666' : '#0f0'}; font-weight: bold;">
                            ${data.name} <span style="font-size: 9px; background: #222; padding: 1px 4px; color: #ffaa00; border: 1px solid #444;">${statusLabel}</span>
                        </div>
                        <div style="font-size: 10px; color: #00bcff; font-family: monospace;">TARGET: ${data.targetFish?.toUpperCase()}</div>
                        <div class="countdown-timer" data-start="${startTimestamp}" data-duration="${data.duration}" style="font-size: 11px; color: #ffaa00; font-family: monospace;">T-MINUS: CALC...</div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 10px; color: #555;">Entries</div>
                        <div style="font-size: 14px; color: ${statusColor}; font-family: monospace;">${actualCount}</div>
                    </div>
                </div>

                <div class="contest-details" style="display: none; margin-top: 10px; border-top: 1px solid #222; padding-top: 10px;">
                    ${isOwner ? `<button class="delete-contest-btn" data-id="${contestId}" style="background:#422; color:#f66; border:1px solid #f66; font-size:9px; margin-bottom:10px; cursor:pointer;">TERMINATE_CONTEST</button>` : ''}
                    <div style="font-size: 10px; color: #555; font-weight: bold;">[ PRIZE_POOL ]</div>
                    <div style="background: #050505; border: 1px solid #1a1a1a; padding: 8px; margin-bottom: 12px; border-left: 2px solid #ffaa00;">
                        ${prizesHtml || 'NO_PRIZES_BROADCAST'}
                    </div>
                    <button class="join-contest-btn" data-id="${contestId}" ${isConcluded ? 'disabled' : ''} style="width: 100%; background:${btnBg}; color:${btnColor}; border: 1px solid ${btnColor}; padding:8px; font-family: monospace; cursor:pointer; opacity: ${isConcluded ? '0.5' : '1'};">
                        ${btnText}
                    </button>
                    <div class="roster-container" style="margin-top:10px; display: flex; flex-wrap: wrap; gap: 4px;"></div>
                </div>
            `;

            container.appendChild(card);
        }
    } catch (err) {
        console.error("Scan Error:", err);
    }
}
document.getElementById('btn-refresh-contests')?.addEventListener('click', refreshContestList);

/**
 * chat parsing
 * 
 * 
 */

function updateSessionUI() {
    let grandTotal = 0;

    Object.keys(sessionStats).forEach(key => {
        const count = sessionStats[key] || 0;
        const totalValue = sessionValues[key] || 0;
        grandTotal += totalValue;

        const safeKey = key.replace(/\s+/g, '-');
        
        // Show the row if we've caught at least one
        const rowEl = document.getElementById(`row-${safeKey}`);
        if (count > 0 && rowEl) {
            rowEl.style.display = "block";
        }

        const countEl = document.getElementById(`session-${safeKey}`);
        if (countEl) countEl.textContent = count;

        const valEl = document.getElementById(`val-${safeKey}`);
        if (valEl) valEl.textContent = `(${totalValue.toFixed(4)})`;
    });

    const totalEl = document.getElementById('session-grand-total');
    if (totalEl) totalEl.textContent = grandTotal.toFixed(4);
}
/**
 * UPDATE_CONTEST_HUD
 * Real-time overlay update for the active contest, 
 * highlighting top Entries with podium colors.
 */
async function updateContestHUD() {
    if (!activeContestRef) {
        document.getElementById('contest-hud').style.display = 'none';
        return;
    }

    try {
        const hud = document.getElementById('contest-hud');
        hud.style.display = 'block';

        const participantsRef = collection(db, activeContestRef.parent.path);
        const q = query(participantsRef, orderBy("score", "desc"), limit(10));
        const snap = await getDocs(q);

        const listContainer = document.getElementById('hud-leaderboard-list');
        
        // Preserve expansion states before clearing
        const expandedIds = Array.from(listContainer.querySelectorAll('.expanded'))
                                 .map(el => el.getAttribute('data-player-id'));

        listContainer.innerHTML = ''; 

        let currentRank = 1;
        const myId = activeContestRef.id;

        snap.forEach((doc) => {
            const pData = doc.data();
            const isMe = (doc.id === myId);
            const playerId = doc.id;
            
            let rankClass = '';
            let rankPrefix = `#${currentRank}`;
            if (currentRank === 1) { rankClass = 'rank-gold'; rankPrefix = '👑'; }
            else if (currentRank === 2) { rankClass = 'rank-silver'; }
            else if (currentRank === 3) { rankClass = 'rank-bronze'; }

            const totals = pData.totals || {};
            const cargoItems = Object.entries(totals)
                .filter(([_, qty]) => qty > 0)
                .map(([name, qty]) => `<div>${qty}x ${name.toUpperCase()}</div>`)
                .join('') || "<div>NO_CARGO_DETECTED</div>";

            if (isMe) {
                document.getElementById('hud-score').textContent = pData.score || 0;
                document.getElementById('hud-rank').textContent = `#${currentRank}`;
            }

            const row = document.createElement('div');
            row.className = `hud-leaderboard-row ${rankClass} ${isMe ? 'hud-is-me' : ''}`;
            if (expandedIds.includes(playerId)) row.classList.add('expanded');
            row.setAttribute('data-player-id', playerId);

            row.innerHTML = `
                <div class="hud-row-main">
                    <span>${rankPrefix} ${playerId.toUpperCase()}</span>
                    <span class="pts-highlight">${pData.score || 0} PTS</span>
                </div>
                <div class="hud-row-cargo">
                    ${cargoItems}
                </div>
            `;

            listContainer.appendChild(row);
            currentRank++;
        });

        document.getElementById('hud-contest-name').textContent = window.currentContestSettings?.name?.toUpperCase() || "LIVE_FEED";

        const syncEl = document.getElementById('hud-last-sync');
        if (syncEl) {
            syncEl.textContent = `SYNC: ${new Date().toLocaleTimeString([], { hour12: false })}`;
        }

    } catch (err) {
        console.error("HUD Update Error:", err);
    }
}
// Toggle Leaderboard Cargo Details
document.getElementById('hud-leaderboard-list')?.addEventListener('click', (e) => {
    const row = e.target.closest('.hud-leaderboard-row');
    if (row) {
        row.classList.toggle('expanded');
    }
});
function addLog(message, isError = false) {
    const div = document.createElement('div');
    const syncedDate = new Date(Date.now() + (window.serverOffset || 0));
    const timestamp = syncedDate.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

    div.style = `padding: 2px 0; border-bottom: 1px solid #111; font-size: 11px; font-family: monospace; color: ${isError ? '#ff4444' : '#00ff00'};`;
    const prefix = isError ? "[!] ERR_" : "[>] LOG_";
    div.textContent = `[${timestamp}] ${prefix}${message.toUpperCase()}`;

    if (logWindow.childNodes.length > 50) logWindow.removeChild(logWindow.lastChild);
    logWindow.prepend(div);
}


// --- BATCHING & BUFFERING CONFIG ---
let syncTimer = null;
const SYNC_INTERVAL_MS = 300000; // 5 Minutes (300,000ms)
// --- UPDATED BATCHING CONFIG ---
let pendingCatchBuffer = {
    score: 0,
    totals: {} // Will be populated dynamically: { "Young Calypso Salmon": 5, ... }
};

window.electronAPI.onChatLine(async (line) => {
    // Standard Entropia Fish Regex
    const fishRegex = /\[System\]\s+\[\]\s+You received\s+\[?(.*?)\]?\s+x\s+\((\d+)\)\s+Value:\s+([\d.]+)\s+PED/;
    const match = line.match(fishRegex);

    if (match) {
        const fishType = match[1].trim(); 
        const amount = parseInt(match[2]);
        const value = parseFloat(match[3]);

        if (!isNaN(value)) {
            // 1. DYNAMIC REGISTRATION (Local Session Stats)
            // Always track locally regardless of contest status
            if (!(fishType in sessionStats)) {
                sessionStats[fishType] = 0;
                sessionValues[fishType] = 0;
                if (typeof createDynamicRow === 'function') {
                    createDynamicRow(fishType);
                }
            }

            sessionStats[fishType] += amount;
            sessionValues[fishType] += value;

            // 2. CLOUD SYNC LOGIC (Contest Tracking)
            if (activeContestRef) {
                const settings = window.currentContestSettings;
                
                const isConcluded = settings?.status === 'concluded';
                const startTime = settings?.startTime?.toMillis() || 0;
                const durationMs = (settings?.duration || 60) * 60000;
                const endTime = startTime + durationMs;
                const now = Date.now() + (window.serverOffset || 0);

                // --- PHASE CHECK: PRE-START GATE ---
                if (now < startTime) {
                    addLog(`⏳ PRE_START: Catch ignored by cloud (Starts in ${formatTime(startTime - now)})`, true);
                } 
                // --- PHASE CHECK: POST-END GATE ---
                else if (isConcluded || now > endTime) {
                    addLog(`🚫 SESSION_FINALIZED: Catch not synced to cloud.`, true);
                    
                    if (isConcluded) {
                        activeContestRef = null; 
                        setTimeout(() => {
                            const hud = document.getElementById('contest-hud');
                            if (hud) hud.style.display = 'none';
                        }, 5000);
                    }
                } 
                // --- PHASE CHECK: ACTIVE (LIVE) ---
                else {
                    // TARGET CHECK (Case-insensitive)
                    const target = settings?.targetFish?.toLowerCase();
                    const currentCatch = fishType.toLowerCase();

                    if (target && currentCatch === target) {
                        pendingCatchBuffer.score += amount;
                        addLog(`🎯 TARGET_HIT: +${amount} PTS [${fishType.toUpperCase()}]`);
                    }

                    // Add to the totals buffer
                    if (!pendingCatchBuffer.totals[fishType]) {
                        pendingCatchBuffer.totals[fishType] = 0;
                    }
                    pendingCatchBuffer.totals[fishType] += amount;

                    // Trigger sync timer
                    if (!syncTimer) {
                        syncTimer = setTimeout(pushBufferToCloud, SYNC_INTERVAL_MS);
                        const minutes = Math.floor(SYNC_INTERVAL_MS / 60000);
                        addLog(`⏳ SYNC_QUEUED: Uplink in ~${minutes}m.`);
                    }
                }
            }

            // 3. UI UPDATE (Always update local display)
            updateSessionUI();
            addLog(`🎣 CAUGHT: ${amount}x ${fishType}`);
        }
    }
});
function createDynamicRow(name) {
    const safeId = name.replace(/\s+/g, '-');
    if (document.getElementById(`row-${safeId}`)) return;
    
    const grid = document.getElementById('manifest-grid');
    const div = document.createElement('div');
    div.id = `row-${safeId}`;
    div.style = "color:#aaa; font-size:11px;";
    div.innerHTML = `${name.toUpperCase()}: <span id="session-${safeId}" style="color:#0f0">0</span> <span id="val-${safeId}" style="color:#00ffff; font-size:9px;">(0.0000)</span>`;
    grid.appendChild(div);
}

/**
 * pushBufferToCloud: BATCH_WRITE_PROTOCOL
 * Consolidates all buffered catches into a single Firestore write.
 */
async function pushBufferToCloud() {
    if (!activeContestRef || (pendingCatchBuffer.score === 0 && Object.keys(pendingCatchBuffer.totals).length === 0)) {
        syncTimer = null;
        return;
    }

    try {
        const updateData = {
            lastUpdate: serverTimestamp()
        };

        // 1. Sync Score (Target Fish Count)
        if (pendingCatchBuffer.score > 0) {
            updateData.score = increment(pendingCatchBuffer.score);
        }

        // 2. Sync All Totals
        // Use the dot notation correctly for nested objects
        for (const [fishName, qty] of Object.entries(pendingCatchBuffer.totals)) {
            // Firestore requires backticks or quoted strings for dynamic keys with dots
            updateData[`totals.${fishName}`] = increment(qty);
        }

        await updateDoc(activeContestRef, updateData);
        
        // Clear buffer AFTER successful write
        pendingCatchBuffer = { score: 0, totals: {} };
        syncTimer = null;
        
        addLog("☁️ SYNC_COMPLETE: Cloud Manifest Updated.");
        
        // Force a HUD refresh to show the new numbers immediately
        setTimeout(updateContestHUD, 1000);

    } catch (err) {
        console.error("Pulse Sync Error:", err);
        addLog("⚠️ SYNC_FAILED: Retrying in 30s...", true);
        syncTimer = setTimeout(pushBufferToCloud, 30000);
    }
}
startBtn.onclick = async () => {
    const path = pathInput?.value?.trim();

    // FAIL-SAFE: If no path, open the dialog instead of just showing an error
    if (!path) {
        addLog("📂 ACTION_REQUIRED: SELECT_LOG_PATH", true);
        window.electronAPI.openFileDialog(); 
        return; 
    }

    // Determine current identity
    const eName = globalUserData?.entropianame || localStorage.getItem('guest_ename') || "ANONYMOUS_SCOUT";
    const isVerified = globalUserData?.euNameVerified === true;
    
    window.electronAPI.send('start-watch', path);
    
    startBtn.disabled = true;
    startBtn.style.opacity = "0.3";
    startBtn.textContent = "Activated";

    addLog(`✅ WATCHER_ENGAGED: TRACKING [${eName}]`);
    
    if (!auth.currentUser && !localStorage.getItem('guest_uid')) {
        addLog("⚠️ GUEST_MODE: Local tracking only. Join a contest to sync.", true);
    } else if (auth.currentUser && !isVerified) {
         addLog("📡 SYNC_ENABLED: (Unverified Account)");
    } else {
         addLog("📡 SYNC_ENABLED: Connection Secure.");
    }
};

window.electronAPI.on('selected-path', (path) => {
    pathInput.value = path;
    localStorage.setItem('fishScout_path', path);
    addLog(`📂 Path Linked: ...\\${path.split('\\').pop()}`);
});
browseBtn.onclick = () => {
    window.electronAPI.openFileDialog();
};
// On Startup: Auto-fill path from localStorage
window.addEventListener('DOMContentLoaded', () => {
    const savedPath = localStorage.getItem('fishScout_path');
    if (savedPath && pathInput) {
        pathInput.value = savedPath;
        addLog(`📂 PATH_RESTORED: ${savedPath.split('\\').pop()}`);
    }
});
// Initialization
/**
 * RESTORE_ACTIVE_CONTEST
 * Runs on startup to find if the user is already in a contest.
 */
function activateContestLocally() {
    if (!window.currentContestSettings) return;

    // 1. Update the local settings object
    window.currentContestSettings.status = 'active';

    // 2. Refresh the HUD UI
    const hudName = document.getElementById('hud-contest-name');
    if (hudName) {
        hudName.textContent = window.currentContestSettings.name.toUpperCase();
    }

    // 3. Log the event
    addLog("🚀 CONTEST_START: Uplink active. Syncing catches now!");
    
    // 4. Play a sound or flash the screen (Optional flair)
    // new Audio('assets/start_siren.mp3').play();
}
let myRegisteredContests = []; // Global array to track all joined events

async function restoreActiveContest() {
    const eName = globalUserData?.entropianame || localStorage.getItem('guest_ename');
    if (!eName || eName === "Unlinked Avatar") return;

    try {
        // 1. Get recent contests
        const q = query(collection(db, 'fishingContests'), orderBy("settings.startTime", "asc"), limit(20));
        const snap = await getDocs(q);
        myRegisteredContests = []; 

        for (const contestDoc of snap.docs) {
            const pRef = doc(db, 'fishingContests', contestDoc.id, 'participants', eName);
            const pSnap = await getDoc(pRef);

            if (pSnap.exists()) {
                const cData = contestDoc.data();
                if (cData.settings.status === 'concluded') continue;

                myRegisteredContests.push({
                    id: contestDoc.id,
                    ref: pRef,
                    settings: cData.settings
                });
            }
        }

        // 2. Selection Logic:
        // Priority 1: Any contest that is already 'active'
        // Priority 2: The 'pending' contest starting SOONEST
        const live = myRegisteredContests.find(c => c.settings.status === 'active');
        const soonest = myRegisteredContests.filter(c => c.settings.status === 'pending')[0];

        const primaryContest = live || soonest;

        if (primaryContest) {
            activeContestRef = primaryContest.ref;
            window.currentContestSettings = primaryContest.settings;
            renderSmartHUD(); // New function for the dynamic UI
        }

    } catch (err) { console.error("Restore Error:", err); }
}
function renderSmartHUD() {
    const hud = document.getElementById('contest-hud');
    const settings = window.currentContestSettings;
    if (!settings) return;

    const now = Date.now() + (window.serverOffset || 0);
    const startTime = settings.startTime.toMillis();
    const msUntilStart = startTime - now;
    const twoHours = 2 * 60 * 60 * 1000;

    hud.style.display = 'block';

    const leaderboardSection = document.getElementById('hud-leaderboard-list');
    const rankDisplay = document.querySelector('.hud-rank-container');

    if (now >= startTime || msUntilStart < twoHours) {
		const previewArea = document.getElementById('hud-preview-area');
		if (previewArea) previewArea.style.display = 'none'; // Hide the preview card
		
		leaderboardSection.style.display = 'block';
		if (rankDisplay) rankDisplay.style.display = 'flex';
		updateContestHUD(); 
	} else {
		// STATE: DISTANT FUTURE (Show "Preview Card" only)
		leaderboardSection.style.display = 'none';
		if (rankDisplay) rankDisplay.style.display = 'none';
		
		const settings = window.currentContestSettings;
		const prizes = settings.prizes || "No prizes listed";
		const host = settings.hostName || "Unknown Host";
		const entryCount = settings.participantCount || 0;

		// We use the leaderboardSection's parent or a dedicated container to show the preview
		// For this example, let's inject it into a 'hud-preview-area'
		let previewArea = document.getElementById('hud-preview-area');
		if (!previewArea) {
			previewArea = document.createElement('div');
			previewArea.id = 'hud-preview-area';
			leaderboardSection.parentNode.insertBefore(previewArea, leaderboardSection);
		}

		previewArea.style.display = 'block';
		previewArea.innerHTML = `
			<div style="border: 1px solid #333; padding: 10px; background: rgba(0,0,0,0.5); font-family: monospace;">
				<div style="color: #ffaa00; font-size: 14px; border-bottom: 1px solid #444; margin-bottom: 8px; padding-bottom: 4px;">
					${settings.name.toUpperCase()}
				</div>
				<div style="font-size: 11px; line-height: 1.6;">
					<span style="color: #777;">HOST:</span> <span style="color: #fff;">${host.toUpperCase()}</span><br>
					<span style="color: #777;">ENTRIES:</span> <span style="color: #0f0;">${entryCount} PARTICIPANTS</span><br>
					<span style="color: #777;">PRIZES:</span> <span style="color: #00ffff;">${prizes}</span>
				</div>
				<div style="margin-top: 10px; font-size: 10px; color: #ffaa00; text-align: center; border: 1px dashed #555; padding: 5px;">
					LEADERBOARD UNLOCKS IN <span class="countdown-timer" data-start="${settings.startTime.toMillis()}" data-duration="${settings.duration}">--:--:--</span>
				</div>
			</div>
		`;
		
		document.getElementById('hud-contest-name').textContent = "EVENT_PENDING";
	}

    // --- CALL IT HERE ---
    updateScheduleFooter();
}
function updateScheduleFooter() {
    const hud = document.getElementById('contest-hud');
    if (!hud) return;

    const footer = document.getElementById('hud-schedule-footer') || createFooter();
    
    // Only show if there are other contests
    const others = myRegisteredContests.filter(c => c.settings.name !== window.currentContestSettings?.name);

    if (others.length === 0) {
        footer.style.display = 'none';
        return;
    }

    footer.style.display = 'block';
    const items = others.map(c => {
        const start = c.settings.startTime.toMillis();
        const diff = start - (Date.now() + serverOffset);
        return `<li>${c.settings.name.toUpperCase()} <span style="color:#777">(${formatRelativeTime(diff)})</span></li>`;
    }).join('');

    footer.innerHTML = `
        <div style="font-size:9px; border-top:1px solid #222; margin-top:8px; padding-top:4px;">
            <span style="color:#ffaa00; font-weight:bold; letter-spacing:1px;">Entered Events:</span>
            <ul style="margin:4px 0; padding-left:12px; list-style:square; color:#aaa;">${items}</ul>
        </div>`;
}

// Helper to make the footer look pro
function formatRelativeTime(ms) {
    const days = Math.floor(ms / 86400000);
    if (days > 0) return `in ${days}d`;
    const hrs = Math.floor(ms / 3600000);
    if (hrs > 0) return `in ${hrs}h`;
    return "starting soon";
}

function createFooter() {
    const f = document.createElement('div');
    f.id = 'hud-schedule-footer';
    document.getElementById('contest-hud').appendChild(f);
    return f;
}
// ==========================================
// CONTEST INTERACTIVITY ENGINE
// ==========================================

// 1. TIMER ENGINE: Ticks every second to update all visible countdowns
let serverOffset = 0; // Difference between local and server time

// Run this once at app startup
async function syncServerTime() {
    // We send a request to get the server time
    // A simple way is to write a timestamp to a special 'ping' doc
    // or use a known server-synced value.
    const now = Date.now();
    // For most cases, Firebase's internal clock is reliable enough if we 
    // use serverTimestamp() for writes
    //	but for local UI we will leave this here, just in case we want to offest it later:
    serverOffset = 0; // Start with 0, adjust if you notice drift
}

setInterval(() => {
    const now = Date.now() + serverOffset;

    document.querySelectorAll('.countdown-timer').forEach(el => {
        const startTime = parseInt(el.getAttribute('data-start'));
        const durationMins = parseInt(el.getAttribute('data-duration')) || 60;
        if (!startTime) return;

        const endTime = startTime + (durationMins * 60000);
        
        if (now < startTime) {
            // PHASE 1: PRE-START
            const diff = startTime - now;
            el.textContent = `T-MINUS: ${formatTime(diff)}`;
            el.style.color = "#ffaa00";
        } else if (now >= startTime && now < endTime) {
            // PHASE 2: ACTIVE (LIVE)
            const remaining = endTime - now;
            el.textContent = `LIVE: ${formatTime(remaining)} REMAINING`;
            el.style.color = "#0f0";
            el.classList.add('pulse-text'); 
        } else {
            // PHASE 3: ENDED
            el.textContent = "CONTEST_CONCLUDED";
            el.style.color = "#444";
            el.classList.remove('pulse-text');
            
            // OPTIONAL: If this is the active HUD contest, kill the sync
            if (activeContestRef && el.closest('#contest-hud')) {
                 addLog("🏁 TIME_EXPIRED: Contest session finalized.");
                 // We don't null activeContestRef yet to allow one final sync
            }
        }
		if (now % 30000 < 1000) { 
			renderSmartHUD(); 
		}
    });
}, 1000);

function formatTime(ms) {
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h}h ${m}m ${s}s`;
}

function startContestClock() {
    const localEl = document.getElementById('clock-local');
    const utcEl = document.getElementById('clock-utc');

    setInterval(() => {
        const now = new Date();

        // 1. Local Time (User's machine)
        localEl.textContent = now.toLocaleTimeString([], { hour12: false });

        // 2. UTC Time (Entropia Game Time)
        // We use 'en-GB' because it defaults to 24h format naturally
        utcEl.textContent = now.toLocaleTimeString('en-GB', { 
            timeZone: 'UTC', 
            hour12: false 
        }) + " UTC";
        
    }, 1000);
}

// Call this at the end of your script or in initializeFishData
startContestClock();
document.getElementById('btn-set-now')?.addEventListener('click', () => {
    const now = new Date();
    
    // Adjust for the datetime-local input format (YYYY-MM-DDTHH:mm)
    const offset = now.getTimezoneOffset() * 60000;
    const localISOTime = new Date(now - offset).toISOString().slice(0, 16);
    
    document.getElementById('contest-start-time').value = localISOTime;
});
/**
 * CONTEST_LIST_DELEGATOR
 * Handles all clicks within the browser list (expand, join, delete).
 */
document.getElementById('contest-list-container')?.addEventListener('click', (e) => {
    // 1. Handle ROSTER_ROW expansion (Player Cargo Manifest)
    const rosterRow = e.target.closest('.roster-row');
    if (rosterRow) {
        e.stopPropagation(); // Prevents the main contest card from toggling
        rosterRow.classList.toggle('expanded');
        return;
    }

    // 2. Find the main card container
    const card = e.target.closest('.contest-card');
    if (!card) return;

    // 3. Identify specific action buttons
    const joinBtn = e.target.closest('.join-contest-btn');
    const deleteBtn = e.target.closest('.delete-contest-btn');

    // 4. Handle JOIN/LEAVE
    if (joinBtn) {
        e.stopPropagation();
        const contestId = joinBtn.getAttribute('data-id'); 
        if (contestId) joinContest(contestId);
        return; 
    }

    // 5. Handle DELETE (Host Only)
    if (deleteBtn) {
        e.stopPropagation();
        const id = deleteBtn.getAttribute('data-id');
        if (id && confirm("⚠️ PERMANENT_ERASURE: This will wipe all participant data for this contest. Proceed?")) {
            deleteDoc(doc(db, 'fishingContests', id)).then(() => {
                addLog(`🗑️ PURGED: [${id}]`);
                refreshContestList();
            });
        }
        return;
    }

    // 6. Handle MAIN_CARD EXPAND/COLLAPSE
    const details = card.querySelector('.contest-details');
    if (details) {
        const isCurrentlyVisible = details.style.display === 'block';
        
        // Single-pane view logic: close other open detail sections to save space
        document.querySelectorAll('.contest-details').forEach(d => {
            if (d !== details) d.style.display = 'none';
        });
        
        if (!isCurrentlyVisible) {
            // OPENING: Set display and fetch fresh roster data
            details.style.display = 'block';
            const rosterCont = card.querySelector('.roster-container');
            const cId = card.getAttribute('data-contest-id');
            const isConcluded = card.getAttribute('data-concluded') === 'true';
            
            if (rosterCont && cId) {
                fetchContestRoster(cId, rosterCont, isConcluded);
            }
        } else {
            // CLOSING
            details.style.display = 'none';
        }
    }
});
// --- 6. INITIALIZATION & LISTENERS ---
document.addEventListener('DOMContentLoaded', () => {
    // Tab Listeners
    setupMailTabs();
	initAdminUserRegistry();
    // Modal Trigger
    document.getElementById('show-mailbox-modal')?.addEventListener('click', () => {
        document.getElementById('view-mail-modal').style.display = 'block';
        getMessages();
    });

    // Refresh Button
    document.getElementById('btn-refresh-mail')?.addEventListener('click', getMessages);

    // Modal Close
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal') || document.getElementById('view-mail-modal');
            modal.style.display = 'none';
        });
    });
    const savedPath = localStorage.getItem('fishScout_path');
    if (savedPath) pathInput.value = savedPath;
    // User Details Close
    document.getElementById('userdetails-close-button')?.addEventListener('click', () => {
        document.getElementById('user-details').style.display = 'none';
    });
	// Change these lines in your DOMContentLoaded:
	makeDraggable('view-mail-modal', '.grabbableHeader');
	makeDraggable('user-details', '.grabbableHeader');
	
});


document.addEventListener('click', (e) => {
    // Sovereign Bridge Trigger
    if (e.target.id === 'loginbutt') {
        console.log("🖱️ Login Button Clicked.");
        if (window.electronAPI?.openExternal) {
            window.electronAPI.openExternal('https://pixelb8.lol/auth.html');
        } else {
            console.warn("Electron Bridge Unavailable. Attempting web fallback...");
            window.open('https://pixelb8.lol/auth.html', '_blank');
        }
    }
    
    if (e.target.id === 'logoutbutt') signOutFromFirebase();
});
// --- TAB CONTROLLER ---
const tabButtons = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-content');

tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');

        // 1. Reset all buttons to inactive state
        tabButtons.forEach(b => {
            b.classList.remove('active');
        });

        // 2. Hide all panes
        tabPanes.forEach(pane => {
            pane.style.display = 'none';
        });

        // 3. Activate clicked tab
        btn.classList.add('active');

        // 4. Show target pane with conditional layout
        const targetPane = document.getElementById(targetId);
        if (targetPane) {
            if (targetId === 'scout-pane') {
                targetPane.style.display = 'flex';
            } else {
                targetPane.style.display = 'block';
            }
        }
        
        console.log(`📑 Switched to: ${targetId}`);
    });
});
// Toggle Host Tools Expansion
document.getElementById('host-tools-trigger')?.addEventListener('click', () => {
    const container = document.getElementById('host-tools');
    const icon = container.querySelector('.collapse-icon');
    
    const isCollapsed = container.classList.toggle('collapsed');
    
    if (icon) {
        icon.textContent = isCollapsed ? '+' : '×';
        icon.style.color = isCollapsed ? '#ffaa00' : '#f66';
    }
});

document.getElementById('close-btn').addEventListener('click', () => {
    // You already have 'close-app' in your main.js ipcMain listeners!
    window.electronAPI.send('close-app'); 
});
document.getElementById('reload-btn')?.addEventListener('click', () => {
    // 1. Log the intent
    if (typeof addLog === 'function') {
        addLog("♻️ SYSTEM_REBOOT: Refreshing UI...");
    }

    // 2. Brief delay to allow the user to see the log (optional)
    setTimeout(() => {
        window.location.reload();
    }, 100);
});
const ontTopCheckbox = document.getElementById('always-on-top-check');

ontTopCheckbox.addEventListener('change', (e) => {
    const isChecked = e.target.checked;
    window.electronAPI.setAlwaysOnTop(isChecked);
});