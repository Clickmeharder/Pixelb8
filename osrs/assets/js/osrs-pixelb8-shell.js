(() => {
  const script = document.currentScript;
  if (!script) return;

  const scriptUrl = new URL(script.src, location.href);
  const osrsRoot = new URL('../../', scriptUrl);
  const siteRoot = new URL('../', osrsRoot);

  const ensureLayoutCss = () => {
    if (document.getElementById('pixelb8OsrsShellCss')) return;
    const link = document.createElement('link');
    link.id = 'pixelb8OsrsShellCss';
    link.rel = 'stylesheet';
    link.href = new URL('assets/css/pixelb8-osrs-shell.css', osrsRoot).href;
    document.head.appendChild(link);
  };
  ensureLayoutCss();

  const storeKey = 'pixelb8_osrs_left_collapsed';
  const isCollapsed = () => localStorage.getItem(storeKey) === '1';
  const href = rel => new URL(rel, osrsRoot).href;
  const siteHref = rel => new URL(rel, siteRoot).href;
  const path = location.pathname.replace(/\\/g, '/').toLowerCase();
  const appMode = document.body?.dataset?.osrsApp === '1';
  const activeKey = () => { const hash=(location.hash||'#home').replace(/^#/,''); if(appMode) return hash.startsWith('ge')?'ge':hash.startsWith('dashboard')?'dashboard':hash.startsWith('clans')?'clans':'osrs'; return path.includes('/grand-exchange/')?'ge':path.includes('/dashboard/')||path.includes('/builds/')?'dashboard':path.includes('/clans/')?'clans':'osrs'; };
  const active = activeKey();

  const railCss = `
    :host{
      all:initial;
      display:block;
      width:100%;
      height:100%;
      color:#e9edf2;
      font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif;
    }
    *,*::before,*::after{box-sizing:border-box}
    a,button{font:inherit}
    button{cursor:pointer}
    .rail{
      width:100%;height:100%;min-height:0;
      display:grid;grid-template-rows:auto minmax(0,1fr) auto auto;
      overflow:hidden;background:#101318;border-right:1px solid #2a313a;
      box-shadow:6px 0 24px rgba(0,0,0,.16);
    }
    .brand-row{
      min-height:72px;display:grid;grid-template-columns:38px minmax(0,1fr) 30px;
      align-items:center;gap:8px;padding:11px 9px 11px 12px;border-bottom:1px solid #2a313a;
    }
    .brand-mark{
      width:34px;height:34px;display:grid;place-items:center;overflow:hidden;
      border:1px solid #39434e;border-radius:8px;background:#1b222a;color:#8edcff;
      font-weight:950;font-size:.78rem;
    }
    .brand-rail{display:none;font-size:.48rem}
    .brand-copy{min-width:0}
    .brand-copy h1{margin:0;color:#f4f7fa;font-size:.96rem;line-height:1.1;font-weight:850;white-space:nowrap}
    .brand-copy p{margin:4px 0 0;color:#a1a9b3;font-size:.66rem;white-space:nowrap}
    .collapse-btn{
      width:28px;height:30px;display:grid;place-items:center;border:1px solid #343d48;
      border-radius:6px;background:#171c22;color:#dce5ee;font-size:1.15rem;
    }
    .collapse-btn:hover{border-color:#4fc3f7;color:#8edcff}
    .scroll{min-height:0;overflow:auto;padding:8px;scrollbar-width:thin;scrollbar-color:#46515c #101318}
    .section{padding:8px 4px 10px;border-bottom:1px solid #20262d}
    .section-label{margin:0 6px 7px;color:#707b87;font-size:.61rem;font-weight:800;letter-spacing:.09em;text-transform:uppercase}
    .nav{
      width:100%;min-height:40px;display:flex;align-items:center;gap:9px;padding:7px 9px;margin:0 0 4px;
      border:1px solid transparent;border-radius:7px;background:transparent;color:#c7d0d9;
      text-align:left;text-decoration:none;font-size:.82rem;font-weight:800;line-height:1.15;
    }
    .nav:hover{background:#171c22;color:#ffffff}.nav.active{background:#202730;color:#f2f7fb;border-color:#34414d;box-shadow:inset 3px 0 0 #4fc3f7}
    
    .icon{
      width:23px;min-width:23px;height:23px;display:grid;place-items:center;border-radius:5px;
      background:#20262d;color:#aeb9c4;font-size:.67rem;font-weight:900;
    }
    .nav.active .icon{background:#253746;color:#8edcff}
    .text{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    .more{flex:0 0 auto;padding:6px 8px 8px;border-top:1px solid #20262d;background:#101318}
    .more-toggle,.more-link{
      width:100%;min-height:40px;display:flex;align-items:center;gap:8px;padding:7px 9px;
      border:1px solid transparent;border-radius:7px;background:transparent;color:#c5ced8;
      text-align:left;text-decoration:none;font-size:.82rem;font-weight:800;line-height:1.15;
    }
    .more-toggle:hover{background:#171c22;color:#fff}
    .more-link{
      min-height:38px;
      margin:0 0 5px;
      border-color:#262f38;
      background:#14191f;
      color:#cbd4dd;
    }
    .more-link:last-child{margin-bottom:0}
    .more-link:hover{background:#1c232b;border-color:#39434e;color:#fff}
    .chevron{margin-left:auto;color:#77828d;font-size:1rem;transition:transform .16s ease}
    .more:not(.collapsed) .chevron{transform:rotate(90deg)}
    .more.collapsed .more-body{display:none}
    .more-body{display:flex;flex-direction:column;gap:4px;padding-top:5px}
    .footer{
      min-height:35px;display:flex;align-items:center;justify-content:center;border-top:1px solid #2a313a;
      color:#697480;font-size:.59rem;font-weight:750;
    }
    .footer-rail{display:none}
    :host([collapsed]) .brand-row{min-height:64px;grid-template-columns:1fr;justify-items:center;padding:8px 5px;position:relative}
    :host([collapsed]) .brand-copy,:host([collapsed]) .section-label,:host([collapsed]) .text,:host([collapsed]) .chevron{display:none!important}
    :host([collapsed]) .brand-mark{width:48px;height:30px;border-radius:6px}
    :host([collapsed]) .brand-full{display:none}
    :host([collapsed]) .brand-rail{display:block}
    :host([collapsed]) .collapse-btn{position:absolute;top:48px;right:5px;width:24px;height:24px;border-radius:50%;z-index:3}
    :host([collapsed]) .nav,:host([collapsed]) .more-toggle,:host([collapsed]) .more-link{justify-content:center;padding-left:4px;padding-right:4px}
    :host([collapsed]) .more{padding:6px 8px 8px}
    :host([collapsed]) .more-toggle,:host([collapsed]) .more-link{width:48px;min-height:40px;margin-left:auto;margin-right:auto}
    :host([collapsed]) .footer-full{display:none}
    :host([collapsed]) .footer-rail{display:inline}
  `;

  function inject() {
    if (document.getElementById('pixelb8OsrsSidebarHost')) return;

    const host = document.createElement('div');
    host.id = 'pixelb8OsrsSidebarHost';
    host.setAttribute('aria-label', 'PixelB8 OSRS navigation');
    document.body.prepend(host);

    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = railCss;
    shadow.appendChild(style);

    const rail = document.createElement('aside');
    rail.className = 'rail';
    rail.innerHTML = `
      <div class="brand-row">
        <div class="brand-mark" title="PixelB8 OSRS"><span class="brand-full">P8</span><span class="brand-rail">OSRS</span></div>
        <div class="brand-copy"><h1>PixelB8 OSRS</h1><p>Old School RuneScape tools</p></div>
        <button id="toggle" class="collapse-btn" type="button" title="Collapse PixelB8 navigation" aria-label="Collapse PixelB8 navigation">‹</button>
      </div>
      <div class="scroll">
        <nav class="section" aria-label="OSRS navigation">
          <div class="section-label">OSRS</div>
          <a class="nav" data-route="home" href="${appMode?'#dashboard/character':href('index.html#dashboard/character')}"><span class="icon">O</span><span class="text">OSRS Home</span></a>
          <a class="nav" data-route="clan" href="${appMode?'#dashboard/clan/main':href('index.html#dashboard/clan/main')}"><span class="icon">C</span><span class="text">Clan</span></a>
          <a class="nav" data-route="dashboard" href="${appMode?'#dashboard/character':href('index.html#dashboard/character')}"><span class="icon">D</span><span class="text">Dashboard</span></a>
          <a class="nav" data-route="tools" href="${appMode?'#dashboard/tools':href('index.html#dashboard/tools')}"><span class="icon">GE</span><span class="text">Tools</span></a>
        </nav>
        <div class="section">
          <div class="section-label">Settings</div>
          <button class="nav" id="settings" type="button"><span class="icon">⚙</span><span class="text">Settings</span></button>
        </div>
      </div>
      <section class="more collapsed" id="more">
        <button class="more-toggle" type="button" aria-expanded="false" title="More from PixelB8">
          <span class="icon">◆</span><span class="text">More from PixelB8</span><span class="chevron">›</span>
        </button>
        <div class="more-body">
          <a class="more-link" href="${siteHref('home.html')}"><span class="icon">⌂</span><span class="text">PixelB8 Home</span></a>
          <a class="more-link" href="${siteHref('arcade/index.html')}"><span class="icon">🕹</span><span class="text">Arcade</span></a>
          <a class="more-link" href="${siteHref('eu/index.html')}"><span class="icon">EU</span><span class="text">EU Tracker</span></a>
        </div>
      </section>
      <div class="footer"><span class="footer-full">PixelB8 · OSRS</span><span class="footer-rail">PXLB8</span></div>`;
    shadow.appendChild(rail);

    const toggle = shadow.getElementById('toggle');
    const more = shadow.getElementById('more');
    const settings = shadow.getElementById('settings');
    settings?.addEventListener('click',()=>window.PixelB8GlobalAudio?.openSettings?.('OSRS Settings'));

    const applyCollapsed = collapsed => {
      document.body.classList.toggle('pixelb8-osrs-left-collapsed', collapsed);
      host.toggleAttribute('collapsed', collapsed);
      toggle.textContent = collapsed ? '›' : '‹';
      toggle.title = collapsed ? 'Expand PixelB8 navigation' : 'Collapse PixelB8 navigation';
      toggle.setAttribute('aria-label', toggle.title);
    };

    toggle.addEventListener('click', () => {
      const next = !host.hasAttribute('collapsed');
      localStorage.setItem(storeKey, next ? '1' : '0');
      applyCollapsed(next);
    });

    more.querySelector('.more-toggle').addEventListener('click', () => {
      const collapsed = more.classList.toggle('collapsed');
      more.querySelector('.more-toggle').setAttribute('aria-expanded', String(!collapsed));
    });

    const updateActive = () => {
      const hash=String(location.hash||'').replace(/^#/,'');
      let key='dashboard';
      if(hash.startsWith('dashboard/clan')) key='clan';
      else if(hash.startsWith('dashboard/tools')) key='tools';
      else if(hash.startsWith('dashboard/character')) key='dashboard';
      shadow.querySelectorAll('.nav').forEach(a=>a.classList.toggle('active',a.dataset.route===key));
    };
    updateActive();
    if(appMode) window.addEventListener('hashchange', updateActive);
    applyCollapsed(isCollapsed());
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inject, { once: true });
  else inject();
})();
