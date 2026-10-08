window.OSRSClanCloud = (() => {
  const firebaseConfig = {
    apiKey: "AIzaSyDwSM_N3qCm-J7-5e8YwdtD6bknnk2UGl8",
    authDomain: "pixelb8-osrs-clans.firebaseapp.com",
    projectId: "pixelb8-osrs-clans",
    storageBucket: "pixelb8-osrs-clans.firebasestorage.app",
    messagingSenderId: "694476204864",
    appId: "1:694476204864:web:498af1dd65c5e0724de8a5"
  };

  let db = null;
  let initError = null;

  const CACHE_PREFIX = 'pixelb8_osrs_clan_cache_v2:';
  // Keep Firestore reads stable while browsing between pages. These are intentionally
  // much longer than the old 30-60s values; callers can still pass force=true.
  const TTL = {
    publicClans: 10 * 60 * 1000,
    clan: 10 * 60 * 1000,
    roster: 2 * 60 * 1000,
    activity: 2 * 60 * 1000
  };
  const WINDOW_CACHE_KEY = '__PIXELB8_OSRS_CLAN_CACHE_V2__';

  function readWindowCache(){
    try {
      const raw = String(window.name || '');
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && parsed[WINDOW_CACHE_KEY] && typeof parsed[WINDOW_CACHE_KEY] === 'object'
        ? parsed[WINDOW_CACHE_KEY]
        : {};
    } catch (_) {
      return {};
    }
  }

  function writeWindowCache(cache){
    try {
      let root = {};
      try { root = window.name ? JSON.parse(window.name) : {}; } catch (_) { root = {}; }
      if (!root || typeof root !== 'object' || Array.isArray(root)) root = {};
      root[WINDOW_CACHE_KEY] = cache;
      window.name = JSON.stringify(root);
    } catch (_) {}
  }

  function readCache(key, maxAge){
    const fullKey = CACHE_PREFIX + key;

    // window.name survives normal same-tab page navigation, including local file://
    // pages where Web Storage can be isolated per file URL.
    try {
      const cache = readWindowCache();
      const entry = cache[fullKey];
      if (entry && Number.isFinite(entry.savedAt)) {
        if (Date.now() - entry.savedAt <= maxAge) return entry.value;
        delete cache[fullKey];
        writeWindowCache(cache);
      }
    } catch (_) {}

    // Secondary cache for normal hosted browsing.
    try {
      const raw = sessionStorage.getItem(fullKey);
      if (!raw) return null;
      const entry = JSON.parse(raw);
      if (!entry || !Number.isFinite(entry.savedAt) || Date.now() - entry.savedAt > maxAge) {
        sessionStorage.removeItem(fullKey);
        return null;
      }
      return entry.value;
    } catch (_) {
      return null;
    }
  }

  function writeCache(key, value){
    const fullKey = CACHE_PREFIX + key;
    const entry = { savedAt: Date.now(), value };
    try {
      const cache = readWindowCache();
      cache[fullKey] = entry;
      writeWindowCache(cache);
    } catch (_) {}
    try {
      sessionStorage.setItem(fullKey, JSON.stringify(entry));
    } catch (_) {}
    return value;
  }

  function clearCache(prefix=''){
    const needle = CACHE_PREFIX + String(prefix || '');
    try {
      const cache = readWindowCache();
      Object.keys(cache).forEach(key => { if (key.startsWith(needle)) delete cache[key]; });
      writeWindowCache(cache);
    } catch (_) {}
    try {
      for (let i = sessionStorage.length - 1; i >= 0; i -= 1) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith(needle)) sessionStorage.removeItem(key);
      }
    } catch (_) {}
  }

  function init(){
    if (db || initError) return db;
    try {
      if (!window.firebase) throw new Error('Firebase SDK unavailable');
      const app = firebase.apps && firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
      db = app.firestore();
      return db;
    } catch (error) {
      initError = error;
      console.warn('PixelB8 OSRS clans Firebase unavailable:', error);
      return null;
    }
  }

  function toMillis(value){
    if (!value) return null;
    if (typeof value.toMillis === 'function') return value.toMillis();
    if (typeof value === 'number') return value;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : null;
  }

  function normalizeProfile(id, data = {}){
    const slug = String(data.slug || id || '').toLowerCase();
    return {
      slug,
      name: data.shortName || data.name || slug.toUpperCase(),
      displayName: data.name || data.displayName || slug.toUpperCase(),
      description: data.description || '',
      public: data.public === true,
      memberCount: Number.isFinite(Number(data.memberCount)) ? Number(data.memberCount) : 0,
      lastSync: toMillis(data.lastSync),
      clanFeedWebSocketUrl: String(data.clanFeedWebSocketUrl || '').trim(),
      source: 'firestore'
    };
  }

  function normalizeRoster(data = {}){
    const members = Array.isArray(data.members) ? data.members : [];
    const lastSync = toMillis(data.lastSync || data.syncedAt);
    return {
      members,
      memberCount: Number.isFinite(Number(data.memberCount)) ? Number(data.memberCount) : members.length,
      syncedAt: lastSync,
      lastSync,
      source: 'firestore'
    };
  }

  function normalizeActivity(data = {}){
    const entries = Array.isArray(data.entries) ? data.entries : [];
    return {
      entries,
      lastUpdated: toMillis(data.lastUpdated),
      source: 'firestore'
    };
  }

  async function listPublicClans(force=false){
    if (!force) {
      const cached = readCache('public-clans', TTL.publicClans);
      if (Array.isArray(cached)) return cached;
    }
    const firestore = init();
    if (!firestore) throw initError || new Error('Firestore unavailable');
    const snap = await firestore.collection('clans').where('public', '==', true).get();
    const rows = snap.docs.map(doc => normalizeProfile(doc.id, doc.data()));
    writeCache('public-clans', rows);
    rows.forEach(row => row?.slug && writeCache(`clan:${row.slug}`, row));
    return rows;
  }

  async function getClanRecord(slug, force=false){
    const key = String(slug || '').toLowerCase();
    if (!force) {
      const cached = readCache(`clan:${key}`, TTL.clan);
      if (cached) return cached;
    }
    const firestore = init();
    if (!firestore) throw initError || new Error('Firestore unavailable');
    const doc = await firestore.collection('clans').doc(key).get();
    if (!doc.exists) return null;
    return writeCache(`clan:${key}`, normalizeProfile(doc.id, doc.data()));
  }

  async function getClan(slug, force=false){
    const profile = await getClanRecord(slug, force);
    return profile?.public ? profile : null;
  }

  async function getRoster(slug, force=false){
    const key = String(slug || '').toLowerCase();
    if (!force) {
      const cached = readCache(`roster:${key}`, TTL.roster);
      if (cached) return cached;
    }
    const firestore = init();
    if (!firestore) throw initError || new Error('Firestore unavailable');
    const doc = await firestore.collection('clans').doc(key).collection('data').doc('roster').get();
    return writeCache(`roster:${key}`, doc.exists ? normalizeRoster(doc.data()) : normalizeRoster());
  }

  async function getActivity(slug, force=false){
    const key = String(slug || '').toLowerCase();
    if (!force) {
      const cached = readCache(`activity:${key}`, TTL.activity);
      if (cached) return cached;
    }
    const firestore = init();
    if (!firestore) throw initError || new Error('Firestore unavailable');
    const doc = await firestore.collection('clans').doc(key).collection('data').doc('activity').get();
    return writeCache(`activity:${key}`, doc.exists ? normalizeActivity(doc.data()) : normalizeActivity());
  }

  return {init, listPublicClans, getClan, getClanRecord, getRoster, getActivity, clearCache, toMillis};
})();
