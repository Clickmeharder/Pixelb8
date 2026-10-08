window.VTAMChat = (() => {
  const WIDTH_KEY = 'vtam_chat_width';
  const COLLAPSED_KEY = 'vtam_chat_collapsed';
  const URL_KEY = 'vtam_chat_ws_url';
  const SELECTED_CLAN_KEY = 'vtam_chat_selected_clan';
  const SOURCE_KEY = 'vtam_chat_feed_source';
  const VIEWER_CODE_KEY = 'vtam_chat_viewer_code';
  const DEFAULT_WIDTH = 350;
  const MIN_WIDTH = 280;
  const MAX_WIDTH = 620;
  const COLLAPSED_WIDTH = 56;
  let socket = null;
  let reconnectTimer = null;
  let reconnectDelay = 1500;
  let manualDisconnect = false;
  let unread = 0;
  let personalPollTimer = null;
  let personalLastSignature = '';
  let personalEventsCache = [];
  let personalRetryCount = 0;
  let personalLoadInFlight = false;
  const PERSONAL_FILTER_KEY = 'vtam_personal_feed_filter';
  const PERSONAL_MAX_RETRIES_KEY = 'vtam_personal_feed_max_retries';
  const DEFAULT_PERSONAL_MAX_RETRIES = 3;
  const PERSONAL_POLL_INTERVAL = 4000;
  const PERSONAL_HISTORY_URL = 'http://127.0.0.1:18473/personal-history?limit=120';
  const LOCAL_CLAN_FEED_URL = 'http://127.0.0.1:18473/clan-feed?limit=120';
  let clanPollTimer = null;
  let clanLastSignature = '';
  let localClanEventsCache = [];
  let hostedClanFeeds = [];
  let activeFeedClanId = '';
  let connectAttempt = 0;

  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const getVTAM = () => (typeof VTAM !== 'undefined' ? VTAM : window.VTAM);

  function memberClanSlugs() {
    const seen = new Set();
    return (getVTAM()?.profiles || [])
      .map(profile => getVTAM()?.profileClanSlug?.(profile) || '')
      .filter(slug => slug && !seen.has(slug) && seen.add(slug));
  }

  function selectedFeed() {
    return hostedClanFeeds.find(feed => feed.slug === activeFeedClanId) || null;
  }

  function getClanHostedUrl() {
    return String(selectedFeed()?.url || '').trim();
  }

  function overrideStorageKey() {
    return activeFeedClanId ? `${URL_KEY}:${activeFeedClanId}` : '';
  }

  function getLocalOverrideUrl() {
    const key = overrideStorageKey();
    return key ? String(localStorage.getItem(key) || '').trim() : '';
  }

  function viewerCodeStorageKey() {
    return activeFeedClanId ? `${VIEWER_CODE_KEY}:${activeFeedClanId}` : '';
  }

  function getViewerCode() {
    const key = viewerCodeStorageKey();
    const saved = key ? String(localStorage.getItem(key) || '').trim() : '';
    if (saved) return saved;
    let configCode='';
    if(activeFeedClanId){
      try{configCode=String(JSON.parse(localStorage.getItem(`pixelb8_clan_feed_config:${activeFeedClanId}`)||'{}')?.viewerCode||'').trim()}catch(_){}
    }
    const localCode = activeFeedClanId
      ? String(window.OSRSClans?.getLocal?.(activeFeedClanId)?.feed?.viewerCode || '').trim()
      : '';
    return configCode || localCode;
  }

  function setViewerCode(value) {
    const key = viewerCodeStorageKey();
    if (!key) return;
    const code = String(value || '').trim();
    if (code) localStorage.setItem(key, code);
    else localStorage.removeItem(key);
  }

  function viewerTokenEndpoint(feedUrl) {
    const parsed = new URL(feedUrl);
    if (parsed.protocol === 'wss:') parsed.protocol = 'https:';
    else if (parsed.protocol === 'ws:') parsed.protocol = 'http:';
    else throw new Error('Clan Feed URL must use ws:// or wss://');
    parsed.pathname = '/viewer-token';
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  }

  async function authorizedViewerUrl(feedUrl, viewerCode) {
    const response = await fetch(viewerTokenEndpoint(feedUrl), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ viewerCode }),
      cache: 'no-store'
    });

    let payload = null;
    try { payload = await response.json(); } catch (_) {}

    if (!response.ok || !payload?.token) {
      const error = new Error(
        payload?.error === 'invalid_viewer_code'
          ? 'Invalid Viewer Code'
          : payload?.error === 'viewer_key_not_configured'
            ? 'Viewer access is not configured for this clan'
            : 'Unable to authorize Clan Feed viewer'
      );
      error.code = payload?.error || `http_${response.status}`;
      throw error;
    }

    const parsed = new URL(feedUrl);
    parsed.searchParams.set('token', String(payload.token));
    return parsed.toString();
  }

  function showViewerCodeRequired(message = 'Enter this clan\'s Viewer Code in Feed Settings to connect.') {
    const feed = document.getElementById('vtamChatFeed');
    if (!feed) return;
    const selected = selectedFeed();
    feed.innerHTML = `<div class="chat-empty" id="vtamChatEmpty"><strong>${escapeHtml(selected?.name || 'Clan')} Viewer Code Required</strong><span>${escapeHtml(message)}</span></div>`;
  }

  function sourceStorageKey() {
    return activeFeedClanId ? `${SOURCE_KEY}:${activeFeedClanId}` : '';
  }

  function getFeedSource() {
    const key = sourceStorageKey();
    const saved = key ? String(localStorage.getItem(key) || '').trim() : '';
    if (saved === 'override' || saved === 'local' || saved === 'shared') return saved;
    return getClanHostedUrl() ? 'shared' : 'local';
  }

  function setFeedSource(source) {
    const key = sourceStorageKey();
    if (key) localStorage.setItem(key, source);
  }

  function getConfiguredUrl() {
    const source = getFeedSource();
    if (source === 'override') return getLocalOverrideUrl();
    if (source === 'shared') return getClanHostedUrl();
    return '';
  }

  function normalizeClanIdentity(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  async function loadHostedClanFeeds() {
    const linkedProfiles=(getVTAM()?.profiles||[]).map(profile=>({
      slug:normalizeClanIdentity(profile?.clan||''),
      name:String(profile?.clan||'Clan').trim()
    })).filter(x=>x.slug);
    const bySlug=new Map();
    linkedProfiles.forEach(profile=>{
      let config={};
      try{config=JSON.parse(localStorage.getItem(`pixelb8_clan_feed_config:${profile.slug}`)||'{}')||{}}catch(_){}
      const localClan=window.OSRSClans?.getLocal?.(profile.slug)||window.OSRSClans?.get?.(profile.slug);
      const localFeed=localClan?.feed||{};
      const url=String(config.viewerUrl||localFeed.viewerUrl||'').trim();
      if(/^wss:\/\//i.test(url))bySlug.set(profile.slug,{slug:profile.slug,name:String(localClan?.displayName||profile.name||profile.slug),url,local:true});
    });
    hostedClanFeeds=[...bySlug.values()];
    const saved=String(localStorage.getItem(SELECTED_CLAN_KEY)||'').trim();
    activeFeedClanId=hostedClanFeeds.some(feed=>feed.slug===saved)?saved:(hostedClanFeeds[0]?.slug||linkedProfiles[0]?.slug||'');
    if(activeFeedClanId)localStorage.setItem(SELECTED_CLAN_KEY,activeFeedClanId);else localStorage.removeItem(SELECTED_CLAN_KEY);
    renderClanFeedSelector();resetClanFeedDisplay();connect(true);startLocalClanFeed();
  }

  function renderClanFeedSelector() {
    const select = document.getElementById('vtamClanFeedClan');
    if (!select) return;

    if (!hostedClanFeeds.length) {
      select.innerHTML = '<option value="">No local hosted feeds</option>';
      select.disabled = true;
      return;
    }

    select.disabled = false;
    select.innerHTML = hostedClanFeeds
      .map(feed => `<option value="${escapeHtml(feed.slug)}"${feed.slug === activeFeedClanId ? ' selected' : ''}>${escapeHtml(feed.name)}</option>`)
      .join('');
  }

  function resetClanFeedDisplay() {
    const feed = document.getElementById('vtamChatFeed');
    if (!feed) return;
    const selected = selectedFeed();
    feed.innerHTML = selected
      ? `<div class="chat-empty" id="vtamChatEmpty"><strong>${escapeHtml(selected.name)} Clan Feed</strong><span>Live clan chat and clan notifications for the selected clan will appear here.</span></div>`
      : '<div class="chat-empty" id="vtamChatEmpty"><strong>Clan Feed</strong><span>No browser-local hosted clan feed URL is configured. Local RuneLite activity can still appear here.</span></div>';
    unread = 0;
    updateUnread();
  }

  function switchClanFeed(slug) {
    if (!hostedClanFeeds.some(feed => feed.slug === slug) || slug === activeFeedClanId) return;
    activeFeedClanId = slug;
    localStorage.setItem(SELECTED_CLAN_KEY, slug);
    manualDisconnect = false;
    clearTimeout(reconnectTimer);
    if (socket) {
      try { socket.close(); } catch (_) {}
      socket = null;
    }
    clanLastSignature = '';
    resetClanFeedDisplay();
    renderClanFeedSelector();
    connect(true);
    startLocalClanFeed();
  }

  function render() {
    if (document.getElementById('vtamChatRail')) return;
    document.documentElement.classList.add('vtam-chat-ready');
    const profile = VTAM.currentProfile();
    const collapsed = localStorage.getItem(COLLAPSED_KEY) === '1';
    const width = clamp(Number(localStorage.getItem(WIDTH_KEY)) || DEFAULT_WIDTH, MIN_WIDTH, MAX_WIDTH);
    document.documentElement.style.setProperty('--vtam-chat-width', `${collapsed ? COLLAPSED_WIDTH : width}px`);
    document.documentElement.classList.toggle('vtam-chat-collapsed', collapsed);

    const host = document.createElement('aside');
    host.id = 'vtamChatRail';
    host.className = 'chat-rail';
    host.setAttribute('aria-label', 'VTAM clan feed');
    host.innerHTML = `
      <div class="chat-resize-handle" id="vtamChatResize" title="Drag to resize clan feed"></div>
      <button class="chat-edge-toggle" id="vtamChatEdgeToggle" type="button" title="${collapsed ? 'Expand' : 'Collapse'} OSRS sidebar" aria-label="${collapsed ? 'Expand' : 'Collapse'} OSRS sidebar">${collapsed ? '‹' : '›'}</button>
      <div class="chat-compact">
        <button class="chat-compact-avatar" id="vtamChatCompactAccount" title="${escapeHtml(profile.rsn || 'Character')}">${escapeHtml((profile.rsn || 'V').charAt(0).toUpperCase())}</button>
        <button class="chat-compact-feed" id="vtamPersonalCompactFeed" title="Personal Feed" aria-label="Personal Feed">◉</button>
        <button class="chat-compact-feed" id="vtamChatCompactFeed" title="Clan Feed" aria-label="Clan Feed">💬<span id="vtamChatUnread" hidden>0</span></button>
        <button class="chat-compact-feed" id="vtamChatCompactSettings" title="Feed Settings" aria-label="Feed Settings">⚙</button>
        <span class="chat-compact-status" id="vtamChatCompactStatus"></span>
      </div>
      <div class="chat-expanded">
        <section class="chat-account">
          <div class="chat-account-avatar" id="vtamChatAccountAvatar">${escapeHtml((profile.rsn || 'V').charAt(0).toUpperCase())}</div>
          <div class="chat-account-copy">
            <select id="vtamRailProfile" class="select chat-account-select" aria-label="My RuneScape character" ${getVTAM()?.profiles?.length?'':'disabled'}>${getVTAM()?.profiles?.length?getVTAM().profiles.map(x=>`<option value="${escapeHtml(x.rsn)}" ${x.rsn===profile.rsn?'selected':''}>${escapeHtml(x.rsn)}</option>`).join(''):'<option>No linked characters</option>'}</select>
            <span id="vtamRailRank">${escapeHtml(profile.rank)}</span>
          </div>
          <button class="chat-settings-btn" id="vtamChatSettings" title="Clan feed settings" aria-label="Clan feed settings">⚙</button>
        </section>
        <section class="personal-feed-section">
          <div class="chat-feed-head personal-feed-head">
            <div>
              <b>Personal Feed</b>
              <span id="vtamPersonalStatus">Local</span>
            </div>
            <button class="chat-clear-btn" id="vtamPersonalReconnect" title="Reconnect to the local RuneLite bridge">Reconnect</button>
          </div>
          <div class="personal-feed-toolbar">
            <label for="vtamPersonalFilter">Show</label>
            <select id="vtamPersonalFilter" aria-label="Filter personal feed">
              <option value="all">All activity</option>
              <option value="level">Levels</option>
              <option value="loot">Loot</option>
              <option value="kill_count">Boss / KC</option>
              <option value="quest">Quests</option>
              <option value="grand_exchange">Tools</option>
              <option value="trade">Trades</option>
            </select>
          </div>
          <div class="chat-feed personal-feed" id="vtamPersonalFeed" role="log" aria-live="polite">
            <div class="chat-empty" id="vtamPersonalEmpty">
              <strong>Local RuneLite Activity</strong>
              <span>Start RuneLite with VTAM Clan Hook to view private activity from this PC.</span>
            </div>
          </div>
        </section>
        <section class="clan-feed-section">
          <div class="chat-feed-head clan-feed-head">
            <div class="clan-feed-heading">
              <b>Clan Feed</b>
              <select id="vtamClanFeedClan" class="clan-feed-select" aria-label="Clan feed to view">
                <option value="">Loading clan feeds…</option>
              </select>
              <span id="vtamChatStatus">Offline</span>
            </div>
            <button class="chat-clear-btn" id="vtamChatClear" title="Clear clan feed display">Clear</button>
          </div>
          <div class="chat-feed" id="vtamChatFeed" role="log" aria-live="polite">
            <div class="chat-empty" id="vtamChatEmpty">
              <strong>Clan Feed</strong>
              <span>Live clan chat and clan notifications appear here from the clan's shared feed, or from your Local RuneLite Bridge when no hosted feed is configured.</span>
            </div>
          </div>
          <div class="chat-feed-foot">
            <span class="chat-live-dot" id="vtamChatDot"></span>
            <span id="vtamChatFootText">Local RuneLite feed not connected</span>
          </div>
        </section>
      </div>`;
    document.body.appendChild(host);
    renderSettings();
    bindControls();
    startPersonalFeed();
    loadHostedClanFeeds();
    window.addEventListener('pixelb8-local-clan-feed-updated', loadHostedClanFeeds);
  }

  function renderSettings() {
    if (document.getElementById('vtamChatSettingsModal')) return;
    const modal = document.createElement('div');
    modal.id = 'vtamChatSettingsModal';
    modal.className = 'chat-settings-backdrop';
    modal.hidden = true;
    modal.innerHTML = `
      <div class="panel chat-settings-panel" role="dialog" aria-modal="true" aria-labelledby="vtamChatSettingsTitle">
        <div class="chat-settings-head">
          <div><div class="eyebrow">RuneLite + Clan Connections</div><h2 id="vtamChatSettingsTitle">Feed Settings</h2></div>
          <button class="btn" id="vtamChatSettingsClose">×</button>
        </div>
        <div class="chat-settings-tabs" role="tablist" aria-label="Feed settings sections">
          <button class="chat-settings-tab active" id="vtamFeedTabPersonal" type="button" role="tab" aria-selected="true" aria-controls="vtamFeedPanelPersonal" data-feed-settings-tab="personal">Local / Personal</button>
          <button class="chat-settings-tab" id="vtamFeedTabClan" type="button" role="tab" aria-selected="false" aria-controls="vtamFeedPanelClan" data-feed-settings-tab="clan">Clan Feed</button>
        </div>
        <div class="chat-settings-tab-panel active" id="vtamFeedPanelPersonal" role="tabpanel" aria-labelledby="vtamFeedTabPersonal" data-feed-settings-panel="personal">
          <label class="chat-settings-field">
            <span>Max retries</span>
            <input class="input" id="vtamPersonalMaxRetries" type="number" min="1" max="20" step="1" inputmode="numeric">
            <small>How many times Personal Feed should try the Local RuneLite Bridge before stopping. Default: ${DEFAULT_PERSONAL_MAX_RETRIES}.</small>
          </label>
          <div class="chat-settings-actions">
            <button class="btn" id="vtamPersonalSettingsReconnect" type="button">Reconnect Personal Feed</button>
            <button class="btn primary" id="vtamPersonalSettingsSave" type="button">Save Personal Settings</button>
          </div>
        </div>
        <div class="chat-settings-tab-panel" id="vtamFeedPanelClan" role="tabpanel" aria-labelledby="vtamFeedTabClan" data-feed-settings-panel="clan" hidden>
          <label class="chat-settings-field">
            <span>Shared Clan Feed URL</span>
            <input class="input" id="vtamChatSharedUrl" type="text" readonly placeholder="No shared URL configured">
            <small id="vtamChatSharedHint">Saved by the clan Owner and shared with clan members.</small>
          </label>
          <div class="chat-settings-field">
            <span>Feed Source</span>
            <label><input type="radio" name="vtamChatSource" value="shared" id="vtamChatSourceShared"> Use Shared Clan URL</label>
            <label><input type="radio" name="vtamChatSource" value="override" id="vtamChatSourceOverride"> Use Browser Override</label>
            <label><input type="radio" name="vtamChatSource" value="local" id="vtamChatSourceLocal"> Use Local Bridge</label>
          </div>
          <label class="chat-settings-field">
            <span>Browser Feed URL Override</span>
            <input class="input" id="vtamChatUrl" type="text" spellcheck="false" placeholder="wss://feed.example.com/viewer">
            <small id="vtamChatUrlHint">Used only when Browser Override is selected. This override is saved only for this clan in this browser.</small>
          </label>
          <label class="chat-settings-field">
            <span>Clan Feed Viewer Code</span>
            <input class="input" id="vtamChatViewerCode" type="password" autocomplete="off" spellcheck="false" placeholder="Enter the code shared by your clan owner">
            <small id="vtamChatViewerHint">Saved only for this clan in this browser. The code is exchanged for a short-lived viewer token when connecting.</small>
          </label>
          <div class="chat-settings-actions chat-viewer-code-actions">
            <button class="btn" id="vtamChatViewerToggle" type="button">Show Code</button>
            <button class="btn" id="vtamChatViewerForget" type="button">Forget Viewer Code</button>
          </div>
          <div class="chat-settings-actions">
            <button class="btn" id="vtamChatDisconnect">Disconnect</button>
            <button class="btn primary" id="vtamChatSave">Save & Connect</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);

    const setSettingsTab = tab => {
      modal.querySelectorAll('[data-feed-settings-tab]').forEach(button => {
        const active = button.dataset.feedSettingsTab === tab;
        button.classList.toggle('active', active);
        button.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      modal.querySelectorAll('[data-feed-settings-panel]').forEach(panel => {
        const active = panel.dataset.feedSettingsPanel === tab;
        panel.classList.toggle('active', active);
        panel.hidden = !active;
      });
      localStorage.setItem('vtam_feed_settings_tab', tab);
    };

    modal.querySelectorAll('[data-feed-settings-tab]').forEach(button => {
      button.addEventListener('click', () => setSettingsTab(button.dataset.feedSettingsTab));
    });
    modal.addEventListener('click', e => { if (e.target === modal) closeSettings(); });
    document.getElementById('vtamChatSettingsClose').addEventListener('click', closeSettings);
    document.getElementById('vtamPersonalSettingsSave').addEventListener('click', () => {
      const input = document.getElementById('vtamPersonalMaxRetries');
      const value = clamp(Math.floor(Number(input.value) || DEFAULT_PERSONAL_MAX_RETRIES), 1, 20);
      localStorage.setItem(PERSONAL_MAX_RETRIES_KEY, String(value));
      input.value = String(value);
      if (personalRetryCount >= value) stopPersonalPolling(true);
      closeSettings();
    });
    document.getElementById('vtamPersonalSettingsReconnect').addEventListener('click', () => {
      const input = document.getElementById('vtamPersonalMaxRetries');
      const value = clamp(Math.floor(Number(input.value) || DEFAULT_PERSONAL_MAX_RETRIES), 1, 20);
      localStorage.setItem(PERSONAL_MAX_RETRIES_KEY, String(value));
      input.value = String(value);
      reconnectPersonalFeed();
      closeSettings();
    });
    document.getElementById('vtamChatViewerToggle').addEventListener('click', () => {
      const input = document.getElementById('vtamChatViewerCode');
      const button = document.getElementById('vtamChatViewerToggle');
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      button.textContent = showing ? 'Show Code' : 'Hide Code';
    });
    document.getElementById('vtamChatViewerForget').addEventListener('click', () => {
      setViewerCode('');
      const input = document.getElementById('vtamChatViewerCode');
      input.value = '';
      input.type = 'password';
      document.getElementById('vtamChatViewerToggle').textContent = 'Show Code';
      manualDisconnect = true;
      clearTimeout(reconnectTimer);
      if (socket) { try { socket.close(); } catch (_) {} socket = null; }
      setStatus('offline', 'Viewer Code required');
      showViewerCodeRequired();
    });
    document.getElementById('vtamChatSave').addEventListener('click', () => {
      const raw = document.getElementById('vtamChatUrl').value.trim();
      const key = overrideStorageKey();
      if (key) {
        if (raw) localStorage.setItem(key, raw); else localStorage.removeItem(key);
      }
      const viewerCode = document.getElementById('vtamChatViewerCode').value.trim();
      setViewerCode(viewerCode);
      const selectedSource = document.querySelector('input[name="vtamChatSource"]:checked')?.value || 'shared';
      setFeedSource(selectedSource);
      manualDisconnect = false;
      closeSettings();
      connect(true);
      startLocalClanFeed();
    });
    document.getElementById('vtamChatDisconnect').addEventListener('click', () => {
      manualDisconnect = true;
      clearTimeout(reconnectTimer);
      if (socket) socket.close();
      socket = null;
      setStatus('offline', 'Disconnected');
      closeSettings();
    });
  }

  function bindControls() {
    document.getElementById('vtamChatEdgeToggle').addEventListener('click', toggleCollapsed);
    document.getElementById('vtamChatCompactAccount').addEventListener('click', () => toggleCollapsed(false));
    document.getElementById('vtamPersonalCompactFeed').addEventListener('click', () => {
      if (document.documentElement.classList.contains('vtam-chat-collapsed')) toggleCollapsed(false);
      requestAnimationFrame(() => document.querySelector('.personal-feed-section')?.scrollIntoView({ block: 'start' }));
    });
    document.getElementById('vtamChatCompactFeed').addEventListener('click', () => {
      if (document.documentElement.classList.contains('vtam-chat-collapsed')) toggleCollapsed(false);
      unread = 0;
      updateUnread();
      requestAnimationFrame(() => document.querySelector('.clan-feed-section')?.scrollIntoView({ block: 'start' }));
    });
    document.getElementById('vtamChatCompactSettings').addEventListener('click', openSettings);
    document.getElementById('vtamChatSettings').addEventListener('click', openSettings);
    const profileSelect = document.getElementById('vtamRailProfile');
    profileSelect?.addEventListener('change', e => getVTAM()?.setProfile?.(e.target.value));
    document.getElementById('vtamChatClear').addEventListener('click', clearFeed);
    document.getElementById('vtamClanFeedClan').addEventListener('change', e => switchClanFeed(e.target.value));
    document.getElementById('vtamPersonalReconnect').addEventListener('click', reconnectPersonalFeed);
    const personalFilter = document.getElementById('vtamPersonalFilter');
    personalFilter.value = localStorage.getItem(PERSONAL_FILTER_KEY) || 'all';
    personalFilter.addEventListener('change', () => {
      localStorage.setItem(PERSONAL_FILTER_KEY, personalFilter.value);
      renderPersonalEvents(personalEventsCache, true);
    });

    const handle = document.getElementById('vtamChatResize');
    let resizing = false;
    const move = e => {
      if (!resizing || document.documentElement.classList.contains('vtam-chat-collapsed')) return;
      const width = clamp(window.innerWidth - e.clientX, MIN_WIDTH, Math.min(MAX_WIDTH, window.innerWidth - 180));
      document.documentElement.style.setProperty('--vtam-chat-width', `${width}px`);
      localStorage.setItem(WIDTH_KEY, String(width));
    };
    handle.addEventListener('pointerdown', e => {
      if (document.documentElement.classList.contains('vtam-chat-collapsed')) return;
      resizing = true;
      handle.setPointerCapture(e.pointerId);
      document.body.classList.add('vtam-chat-resizing');
      e.preventDefault();
    });
    handle.addEventListener('pointermove', move);
    handle.addEventListener('pointerup', e => {
      resizing = false;
      document.body.classList.remove('vtam-chat-resizing');
      try { handle.releasePointerCapture(e.pointerId); } catch (_) {}
    });
  }

  function toggleCollapsed(force) {
    const currently = document.documentElement.classList.contains('vtam-chat-collapsed');
    const collapse = typeof force === 'boolean' ? force : !currently;
    document.documentElement.classList.toggle('vtam-chat-collapsed', collapse);
    localStorage.setItem(COLLAPSED_KEY, collapse ? '1' : '0');
    const width = clamp(Number(localStorage.getItem(WIDTH_KEY)) || DEFAULT_WIDTH, MIN_WIDTH, MAX_WIDTH);
    document.documentElement.style.setProperty('--vtam-chat-width', `${collapse ? COLLAPSED_WIDTH : width}px`);
    const edgeButton = document.getElementById('vtamChatEdgeToggle');
    if (edgeButton) {
      edgeButton.textContent = collapse ? '‹' : '›';
      edgeButton.title = collapse ? 'Expand OSRS sidebar' : 'Collapse OSRS sidebar';
      edgeButton.setAttribute('aria-label', edgeButton.title);
    }
    if (!collapse) {
      unread = 0;
      updateUnread();
    }
  }

  function openSettings() {
    const modal = document.getElementById('vtamChatSettingsModal');
    const overrideUrl = getLocalOverrideUrl();
    const hostedUrl = getClanHostedUrl();
    const source = getFeedSource();
    const selected = selectedFeed();

    const personalRetriesInput = document.getElementById('vtamPersonalMaxRetries');
    if (personalRetriesInput) personalRetriesInput.value = String(getPersonalMaxRetries());

    document.getElementById('vtamChatSharedUrl').value = hostedUrl || '';
    document.getElementById('vtamChatUrl').value = overrideUrl;
    const viewerInput = document.getElementById('vtamChatViewerCode');
    viewerInput.value = getViewerCode();
    viewerInput.type = 'password';
    document.getElementById('vtamChatViewerToggle').textContent = 'Show Code';
    document.getElementById('vtamChatSourceShared').checked = source === 'shared';
    document.getElementById('vtamChatSourceOverride').checked = source === 'override';
    document.getElementById('vtamChatSourceLocal').checked = source === 'local';
    document.getElementById('vtamChatSourceShared').disabled = !hostedUrl;

    const sharedHint = document.getElementById('vtamChatSharedHint');
    if (sharedHint) sharedHint.textContent = hostedUrl
      ? `${selected?.name || 'This clan'} has a shared hosted feed configured.`
      : 'No shared hosted feed is configured for the selected feed.';

    const overrideInput = document.getElementById('vtamChatUrl');
    const syncOverrideState = () => {
      overrideInput.disabled = !document.getElementById('vtamChatSourceOverride').checked;
    };
    document.querySelectorAll('input[name="vtamChatSource"]').forEach(radio => {
      radio.onchange = syncOverrideState;
    });
    syncOverrideState();

    modal.hidden = false;
    const rememberedTab = localStorage.getItem('vtam_feed_settings_tab') === 'clan' ? 'clan' : 'personal';
    const tabButton = modal.querySelector(`[data-feed-settings-tab="${rememberedTab}"]`);
    tabButton?.click();
    if (rememberedTab === 'clan' && source === 'override') setTimeout(() => overrideInput.focus(), 0);
  }

  function closeSettings() { document.getElementById('vtamChatSettingsModal').hidden = true; }

  async function connect(force = false) {
    const attempt = ++connectAttempt;
    const url = getConfiguredUrl();
    const source = getFeedSource();
    clearTimeout(reconnectTimer);
    if (force && socket) { try { socket.close(); } catch (_) {} socket = null; }
    if (!url) {
      setStatus('offline', source === 'local' ? 'Local Bridge' : 'No feed URL');
      return;
    }
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) return;

    const viewerCode = getViewerCode();
    if (!viewerCode) {
      manualDisconnect = true;
      setStatus('offline', 'Viewer Code required');
      showViewerCodeRequired();
      return;
    }

    manualDisconnect = false;
    setStatus('connecting', 'Authorizing…');

    let authorizedUrl;
    try {
      authorizedUrl = await authorizedViewerUrl(url, viewerCode);
    } catch (err) {
      if (attempt !== connectAttempt) return;
      manualDisconnect = true;
      const label = err?.code === 'invalid_viewer_code' ? 'Invalid Viewer Code' : (err?.message || 'Viewer authorization failed');
      setStatus('offline', label);
      showViewerCodeRequired(
        err?.code === 'invalid_viewer_code'
          ? 'That Viewer Code was rejected. Open Feed Settings and enter the current code shared by your clan owner.'
          : 'Viewer authorization failed. Check the Viewer Code and this clan\'s hosted feed configuration.'
      );
      return;
    }

    if (attempt !== connectAttempt) return;
    setStatus('connecting', 'Connecting…');
    try {
      socket = new WebSocket(authorizedUrl);
    } catch (err) {
      setStatus('offline', 'Invalid feed URL');
      scheduleReconnect();
      return;
    }
    socket.addEventListener('open', () => {
      reconnectDelay = 1500;
      setStatus('online', 'Live');
    });
    socket.addEventListener('message', event => addMessage(event.data));
    socket.addEventListener('close', () => {
      socket = null;
      setStatus('offline', manualDisconnect ? 'Disconnected' : 'Reconnecting…');
      if (!manualDisconnect) scheduleReconnect();
    });
    socket.addEventListener('error', () => setStatus('offline', 'Connection error'));
  }

  function scheduleReconnect() {
    if (manualDisconnect || !getConfiguredUrl()) return;
    clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => connect(), reconnectDelay);
    reconnectDelay = Math.min(reconnectDelay * 1.7, 20000);
  }

  async function fetchLocalBridgeJson(url) {
    const options = { cache: 'no-store' };
    try { options.targetAddressSpace = 'loopback'; } catch (_) {}
    const response = await fetch(url, options);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  function startLocalClanFeed() {
    clearInterval(clanPollTimer);
    clanPollTimer = null;
    if (getFeedSource() !== 'local') return;
    loadLocalClanFeed();
    clanPollTimer = setInterval(loadLocalClanFeed, 3000);
  }

  async function loadLocalClanFeed() {
    if (getFeedSource() !== 'local') return;
    try {
      const payload = await fetchLocalBridgeJson(LOCAL_CLAN_FEED_URL);
      const events = Array.isArray(payload?.events) ? payload.events : [];
      const signature = events.map(e => `${e.timestamp || ''}:${e.type || ''}:${e.player || ''}:${e.message || e.displayMessage || ''}`).join('|');
      if (signature !== clanLastSignature) {
        clanLastSignature = signature;
        renderLocalClanEvents(events);
      }
      setStatus('online', payload?.clan ? `Local · ${payload.clan}` : 'Local');
      const foot = document.getElementById('vtamChatFootText');
      if (foot) foot.textContent = 'Reading clan events directly from RuneLite';
    } catch (_) {
      setStatus('offline', 'RuneLite unavailable');
      const foot = document.getElementById('vtamChatFootText');
      if (foot) foot.textContent = 'Local Bridge selected but unavailable';
    }
  }

  function renderLocalClanEvents(events) {
    const feed = document.getElementById('vtamChatFeed');
    if (!feed) return;
    feed.innerHTML = '';
    const filtered = events.filter(e => e && (e.type === 'clan_chat' || e.type === 'clan_system'));
    if (!filtered.length) {
      feed.innerHTML = '<div class="chat-empty" id="vtamChatEmpty"><strong>Clan Feed</strong><span>No clan activity has been received by this RuneLite session yet.</span></div>';
      return;
    }
    filtered.forEach(e => addMessage(JSON.stringify(e), { historical: true }));
  }

  const PERSONAL_TYPES = new Set([
    'level',
    'npc_loot',
    'player_loot',
    'clue_loot',
    'loot',
    'quest',
    'player_trade',
    'trade',
    'grand_exchange',
    'kill_count'
  ]);

  function personalLabel(type) {
    const labels = {
      level: 'Level Up',
      npc_loot: 'Loot',
      player_loot: 'PK Loot',
      clue_loot: 'Clue Loot',
      loot: 'Loot',
      quest: 'Quest',
      player_trade: 'Trade',
      trade: 'Trade',
      grand_exchange: 'Grand Exchange',
      kill_count: 'Boss / KC',
      test: 'Local Test'
    };
    return labels[type] || type.replace(/_/g, ' ');
  }

  function personalIcon(type) {
    return ({
      level: '★', npc_loot: '◆', loot: '◆', quest: '▤',
      player_trade: '⇄', trade: '⇄', grand_exchange: '◈',
      kill_count: '☠', test: '✓'
    })[type] || '•';
  }

  function formatNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n.toLocaleString() : String(value ?? '');
  }

  function formatGp(value) {
    const n = Number(value);
    return Number.isFinite(n) ? `${n.toLocaleString()} gp` : '';
  }

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function itemName(item) {
    return String(item?.name || item?.itemName || item?.item || `Item ${item?.id || item?.itemId || ''}`).trim();
  }

  function itemQty(item) {
    const q = Number(item?.quantity ?? item?.qty ?? 1);
    return Number.isFinite(q) ? q : 1;
  }

  function itemValue(item) {
    const v = Number(item?.value ?? item?.totalValue ?? item?.price ?? 0);
    return Number.isFinite(v) ? v : 0;
  }

  function itemsHtml(items, emptyLabel = 'None') {
    const list = safeArray(items);
    if (!list.length) return `<span class="personal-card-muted">${escapeHtml(emptyLabel)}</span>`;
    return `<div class="personal-item-list">${list.slice(0, 8).map(item => {
      const qty = itemQty(item);
      const value = itemValue(item);
      return `<div><span>${escapeHtml(itemName(item))}${qty !== 1 ? ` × ${escapeHtml(formatNumber(qty))}` : ''}</span>${value ? `<em>${escapeHtml(formatGp(value))}</em>` : ''}</div>`;
    }).join('')}${list.length > 8 ? `<div class="personal-card-muted">+${list.length - 8} more</div>` : ''}</div>`;
  }

  function personalCard(item) {
    const d = item.data || {};
    const fallback = item.displayMessage || item.message || 'RuneLite activity';
    let title = fallback;
    let summary = '';
    let detail = '';
    let stats = [];

    switch (item.type) {
      case 'level': {
        const skill = d.skill || 'Skill';
        const level = d.level ?? d.newLevel ?? '';
        title = `${skill}${level !== '' ? ` → ${level}` : ''}`;
        summary = d.virtual ? 'Virtual level' : 'Level gained';
        if (d.totalLevel) stats.push(['Total', formatNumber(d.totalLevel)]);
        if (d.xp) stats.push(['XP', formatNumber(d.xp)]);
        break;
      }
      case 'quest':
        title = d.questName || d.quest || fallback;
        summary = 'Quest completed';
        if (d.questPoints !== undefined) stats.push(['QP', formatNumber(d.questPoints)]);
        if (d.completedQuests !== undefined && d.totalQuests !== undefined) stats.push(['Quests', `${formatNumber(d.completedQuests)}/${formatNumber(d.totalQuests)}`]);
        break;
      case 'kill_count': {
        title = d.boss || 'Boss milestone';
        const kcType = String(d.type || '').toLowerCase();
        summary = kcType === 'lap' ? 'Lap milestone' : 'Kill-count milestone';
        if (d.count !== undefined) stats.push([kcType === 'lap' ? 'Laps' : 'KC', formatNumber(d.count)]);
        if (d.time) stats.push([d.isPersonalBest ? 'New PB' : 'Time', String(d.time)]);
        if (d.isPersonalBest) summary = 'New personal best';
        break;
      }
      case 'grand_exchange': {
        const state = String(d.state || 'GE').replace(/_/g, ' ');
        const action = String(d.action || '').toUpperCase();
        const qty = Number(d.quantity ?? 0);
        const item = d.itemName || d.item || 'Item';
        if (action === 'COLLECTED') {
          title = `${item} offer collected`;
          summary = 'GE slot emptied';
          if (d.previousState) stats.push(['Offer', String(d.previousState).replace(/_/g, ' ')]);
        } else {
          title = `${state}${qty ? ` ${formatNumber(qty)} ×` : ''} ${item}`.trim();
          summary = 'Grand Exchange transaction';
        }
        if (d.priceEach) stats.push(['Each', formatGp(d.priceEach)]);
        const total = Number(d.targetValue || d.spent || (qty && d.priceEach ? qty * Number(d.priceEach) : 0));
        if (total) stats.push(['Value', formatGp(total)]);
        if (d.quantityFilled !== undefined && qty) stats.push(['Filled', `${formatNumber(d.quantityFilled)}/${formatNumber(qty)}`]);
        break;
      }
      case 'player_trade':
      case 'trade':
        title = `Trade with ${d.counterparty || 'player'}`;
        summary = 'Player trade';
        detail = `<div class="personal-trade-grid"><div><b>Received</b>${itemsHtml(d.receivedItems)}</div><div><b>Given</b>${itemsHtml(d.givenItems)}</div></div>`;
        if (d.receiveValue) stats.push(['Received', formatGp(d.receiveValue)]);
        if (d.giveValue) stats.push(['Given', formatGp(d.giveValue)]);
        break;
      case 'npc_loot':
      case 'player_loot':
      case 'clue_loot':
      case 'loot':
        title = d.source || d.npc || d.name || 'Loot';
        summary = d.category ? `${String(d.category).replace(/_/g, ' ')} loot` : 'Loot received';
        detail = itemsHtml(d.items, 'No item details');
        if (d.totalValue) stats.push(['Total', formatGp(d.totalValue)]);
        if (d.combatLevel) stats.push(['Source Lv.', formatNumber(d.combatLevel)]);
        break;
      case 'test':
        title = 'Local history test';
        summary = d.message || fallback;
        break;
      default:
        title = fallback;
    }

    const statHtml = stats.length ? `<div class="personal-card-stats">${stats.map(([k,v]) => `<span><small>${escapeHtml(k)}</small><b>${escapeHtml(v)}</b></span>`).join('')}</div>` : '';
    return `<div class="personal-card-title"><span class="personal-card-icon">${escapeHtml(personalIcon(item.type))}</span><div><b>${escapeHtml(title)}</b>${summary ? `<small>${escapeHtml(summary)}</small>` : ''}</div></div>${statHtml}${detail ? `<div class="personal-card-detail">${detail}</div>` : ''}`;
  }

  function normalizePersonal(raw) {
    const item = normalize(raw);
    if (item.category !== 'personal') return null;
    if (!PERSONAL_TYPES.has(item.type) && item.type !== 'test') return null;
    return item;
  }

  function setPersonalStatus(state, label) {
    const el = document.getElementById('vtamPersonalStatus');
    if (!el) return;
    el.textContent = label;
    el.dataset.state = state;
  }

  function matchesPersonalFilter(item, filter) {
    if (!filter || filter === 'all') return true;
    if (filter === 'loot') return item.type === 'loot' || item.type === 'npc_loot' || item.type === 'player_loot' || item.type === 'clue_loot';
    if (filter === 'trade') return item.type === 'trade' || item.type === 'player_trade';
    return item.type === filter;
  }

  function renderPersonalEvents(events, force = false) {
    const feed = document.getElementById('vtamPersonalFeed');
    if (!feed) return;
    personalEventsCache = Array.isArray(events) ? events.slice() : [];
    const filter = document.getElementById('vtamPersonalFilter')?.value || localStorage.getItem(PERSONAL_FILTER_KEY) || 'all';
    const normalized = personalEventsCache.map(normalizePersonal).filter(Boolean).filter(item => matchesPersonalFilter(item, filter)).slice(-100);
    const signature = `${filter}\n${normalized.map(e => `${e.timestamp}|${e.type}|${e.displayMessage || e.message}|${JSON.stringify(e.data || {})}`).join('\n')}`;
    if (!force && signature === personalLastSignature) return;
    personalLastSignature = signature;
    feed.replaceChildren();
    if (!normalized.length) {
      const empty = document.createElement('div');
      empty.className = 'chat-empty';
      empty.id = 'vtamPersonalEmpty';
      empty.innerHTML = filter === 'all'
        ? '<strong>No personal activity yet</strong><span>Personal events saved by VTAM Clan Hook will appear here.</span>'
        : '<strong>No matching activity</strong><span>Try another Personal Feed filter.</span>';
      feed.appendChild(empty);
      return;
    }
    normalized.forEach(item => {
      const time = new Date(item.timestamp);
      const timeText = Number.isNaN(time.getTime()) ? '' : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const row = document.createElement('article');
      row.className = `chat-message personal-message personal-message-${item.type.replace(/[^a-z0-9_-]/g, '')}`;
      row.innerHTML = `<div class="chat-message-top"><strong>${escapeHtml(item.author)}</strong><span class="chat-event-tag">${escapeHtml(personalLabel(item.type))}</span><time>${escapeHtml(timeText)}</time></div><div class="personal-card-body">${personalCard(item)}</div>`;
      feed.appendChild(row);
    });
    feed.scrollTop = feed.scrollHeight;
  }

  function getPersonalMaxRetries() {
    const saved = Number(localStorage.getItem(PERSONAL_MAX_RETRIES_KEY));
    return Number.isFinite(saved) && saved >= 1 ? Math.floor(saved) : DEFAULT_PERSONAL_MAX_RETRIES;
  }

  function stopPersonalPolling() {
    clearInterval(personalPollTimer);
    personalPollTimer = null;
  }

  function ensurePersonalPolling() {
    if (personalPollTimer) return;
    personalPollTimer = setInterval(loadPersonalFeed, PERSONAL_POLL_INTERVAL);
  }

  async function loadPersonalFeed() {
    if (personalLoadInFlight) return;
    personalLoadInFlight = true;
    setPersonalStatus('connecting', personalRetryCount ? `Retry ${personalRetryCount + 1}/${getPersonalMaxRetries()}` : 'Reading…');
    try {
      const payload = await fetchLocalBridgeJson(PERSONAL_HISTORY_URL);
      if (!payload || payload.ok !== true) throw new Error('unavailable');
      personalRetryCount = 0;
      renderPersonalEvents(Array.isArray(payload.events) ? payload.events : []);
      setPersonalStatus('online', payload.player ? `Local · ${payload.player}` : 'Local');
      ensurePersonalPolling();
    } catch (_) {
      personalRetryCount += 1;
      const maxRetries = getPersonalMaxRetries();
      const exhausted = personalRetryCount >= maxRetries;
      if (exhausted) stopPersonalPolling();
      setPersonalStatus('offline', exhausted ? 'Offline' : `Retrying · ${personalRetryCount}/${maxRetries}`);
      const feed = document.getElementById('vtamPersonalFeed');
      if (feed && !feed.querySelector('.personal-message')) {
        feed.innerHTML = exhausted
          ? '<div class="chat-empty" id="vtamPersonalEmpty"><strong>RuneLite is offline</strong><span>Personal Feed stopped reconnecting after a few attempts. Start RuneLite with VTAM Clan Hook, then press Reconnect above.</span></div>'
          : '<div class="chat-empty" id="vtamPersonalEmpty"><strong>Looking for RuneLite…</strong><span>Personal Feed will retry a few times, then stop automatically if the Local Website Bridge is unavailable.</span></div>';
      }
    } finally {
      personalLoadInFlight = false;
    }
  }

  function reconnectPersonalFeed() {
    personalRetryCount = 0;
    stopPersonalPolling();
    loadPersonalFeed();
  }

  function startPersonalFeed() {
    personalRetryCount = 0;
    stopPersonalPolling();
    ensurePersonalPolling();
    loadPersonalFeed();
  }

  const PUBLIC_CLAN_TYPES = new Set([
    'clan_chat',
    'clan_system',
    'clan_message',
    'clan_event',
    'clan_join',
    'clan_leave',
    'clan_rank_change',
    'clan_announcement',
    'clan_coffer',
    'clan_market_listing'
  ]);

  function cleanType(value) {
    return String(value || 'unknown').trim().toLowerCase().replace(/[\s-]+/g, '_');
  }

  function isClanEvent(item) {
    return item && item.category === 'clan' && (PUBLIC_CLAN_TYPES.has(item.type) || item.type.startsWith('clan_'));
  }

  function normalize(raw) {
    let data = raw;
    if (typeof raw === 'string') {
      try { data = JSON.parse(raw); } catch (_) { data = { message: raw }; }
    }
    if (!data || typeof data !== 'object') data = { message: String(data ?? '') };
    const payload = data.payload && typeof data.payload === 'object' ? data.payload : data;
    const details = payload.data && typeof payload.data === 'object' ? payload.data : {};
    const type = cleanType(payload.type || payload.event || payload.kind || payload.notificationType || data.type);
    const category = String(payload.category || data.category || (type.startsWith('clan_') ? 'clan' : 'personal')).toLowerCase();
    const author = payload.player || payload.playerName || payload.sender || payload.username || payload.member || payload.name || data.player || data.sender || 'VTAM';
    const message = payload.message || details.message || payload.text || payload.content || payload.notification || payload.formattedMessage || payload.displayMessage || payload.description || data.message || '';
    const timestamp = Number(payload.timestamp || data.timestamp || Date.now());
    return {
      author: String(author || 'VTAM'),
      message: String(message || payload.displayMessage || ''),
      displayMessage: String(payload.displayMessage || data.displayMessage || ''),
      type,
      category,
      timestamp: Number.isFinite(timestamp) ? timestamp : Date.now(),
      data: details
    };
  }

  function eventLabel(type) {
    const labels = {
      clan_chat: 'Clan Chat',
      clan_system: 'Clan System',
      clan_message: 'Clan System',
      clan_event: 'Clan Event',
      clan_join: 'Joined',
      clan_leave: 'Left',
      clan_rank_change: 'Rank',
      clan_announcement: 'Announcement',
      clan_coffer: 'Coffer',
      clan_market_listing: 'Clan Market'
    };
    return labels[type] || type.replace(/^clan_/, '').replace(/_/g, ' ');
  }

  function renderClanBody(item) {
    if (item.type === 'clan_join') return item.message || item.displayMessage || `${item.author} joined the clan.`;
    if (item.type === 'clan_leave') return item.message || item.displayMessage || `${item.author} left the clan.`;
    return item.message || item.displayMessage || 'Clan activity';
  }

  function addMessage(raw, options = {}) {
    let parsed = raw;
    if (typeof raw === 'string') {
      try { parsed = JSON.parse(raw); } catch (_) {}
    }

    if (parsed && typeof parsed === 'object' && cleanType(parsed.type) === 'clan_feed_history' && Array.isArray(parsed.events)) {
      const events = parsed.events.slice(-150);
      if (events.length) {
        const empty = document.getElementById('vtamChatEmpty');
        if (empty) empty.remove();
      }
      events.forEach(event => addMessage(event, { historical: true }));
      const feed = document.getElementById('vtamChatFeed');
      if (feed) feed.scrollTop = feed.scrollHeight;
      return;
    }

    const item = normalize(raw);
    if (!isClanEvent(item)) return;

    const feed = document.getElementById('vtamChatFeed');
    const empty = document.getElementById('vtamChatEmpty');
    if (!feed) return;
    if (empty) empty.remove();

    const time = new Date(item.timestamp);
    const timeText = Number.isNaN(time.getTime()) ? '' : time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const row = document.createElement('article');
    row.className = `chat-message chat-message-${item.type.replace(/[^a-z0-9_-]/g, '')}`;
    row.dataset.eventType = item.type;
    row.innerHTML = `<div class="chat-message-top"><strong>${escapeHtml(item.author)}</strong><span class="chat-event-tag">${escapeHtml(eventLabel(item.type))}</span><time>${escapeHtml(timeText)}</time></div><div class="chat-message-body">${escapeHtml(renderClanBody(item))}</div>`;
    feed.appendChild(row);
    while (feed.children.length > 150) feed.removeChild(feed.firstElementChild);
    feed.scrollTop = feed.scrollHeight;

    if (!options.historical && document.documentElement.classList.contains('vtam-chat-collapsed')) {
      unread += 1;
      updateUnread();
    }
  }

  function clearFeed() {
    const feed = document.getElementById('vtamChatFeed');
    if (!feed) return;
    feed.innerHTML = '<div class="chat-empty" id="vtamChatEmpty"><strong>Feed cleared</strong><span>New clan notifications will appear here.</span></div>';
    unread = 0;
    updateUnread();
  }

  function updateUnread() {
    const badge = document.getElementById('vtamChatUnread');
    if (!badge) return;
    badge.textContent = unread > 99 ? '99+' : String(unread);
    badge.hidden = unread === 0;
  }

  function setStatus(state, label) {
    const status = document.getElementById('vtamChatStatus');
    const compact = document.getElementById('vtamChatCompactStatus');
    const dot = document.getElementById('vtamChatDot');
    const foot = document.getElementById('vtamChatFootText');
    if (status) { status.textContent = label; status.dataset.state = state; }
    if (compact) compact.dataset.state = state;
    if (dot) dot.dataset.state = state;
    if (foot && state !== 'online') foot.textContent = label;
  }

  function syncProfileUI() {
    const vtam = getVTAM();
    const profile = vtam?.currentProfile?.();
    if (!profile) return;
    const select = document.getElementById('vtamRailProfile');
    if (select) {
      const rows = vtam?.profiles || [];
      select.innerHTML = rows.length
        ? rows.map(x => `<option value="${escapeHtml(x.rsn)}" ${x.rsn===profile.rsn?'selected':''}>${escapeHtml(x.rsn)}</option>`).join('')
        : '<option>No linked characters</option>';
      select.disabled = !rows.length;
    }
    const avatar = String(profile.rsn || 'V').charAt(0).toUpperCase();
    const accountAvatar = document.getElementById('vtamChatAccountAvatar');
    const compactAvatar = document.getElementById('vtamChatCompactAccount');
    const rank = document.getElementById('vtamRailRank');
    if (accountAvatar) accountAvatar.textContent = avatar;
    if (compactAvatar) { compactAvatar.textContent = avatar; compactAvatar.title = profile.rsn || 'Character'; }
    if (rank) rank.textContent = profile.rank || 'Member';
  }

  function init() {
    render();
    window.addEventListener('vtam:profile-changed', syncProfileUI);
    window.addEventListener('vtam:profiles-refreshed', syncProfileUI);
  }
  return { init, connect, addMessage };
})();
