(() => {
  "use strict";

  const views = {
    character: document.getElementById('dashboardViewCharacter'),
    main: document.getElementById('dashboardViewClanMain'),
    ranks: document.getElementById('dashboardViewClanRanks'),
    vault: document.getElementById('dashboardViewClanVault'),
    office: document.getElementById('dashboardViewClanOffice'),
  };
  const clanSubnav = document.getElementById('clanSubnav');
  const status = document.getElementById('dashboardStatus');
  const initialized = { character:false, vault:false, officeSlug:null };
  let activeSlug = null;

  const esc = value => OSRSClans.escapeHtml(value);

  function parseRoute(){
    let raw=(location.hash||'#dashboard/character').replace(/^#/,'').replace(/^\/+|\/+$/g,'');
    if(raw.startsWith('dashboard/')) raw=raw.slice('dashboard/'.length);
    if(!raw || raw==='character' || raw==='character/builds' || raw==='personal' || raw==='personal/builds') return {mode:'character',view:'character'};
    const parts=raw.split('/');
    if(parts[0]!=='clan') return {mode:'character',view:'character'};
    const view=['main','ranks','vault','office'].includes(parts[1])?parts[1]:'main';
    return {mode:'clan',view};
  }

  function setVisible(key){
    Object.entries(views).forEach(([name,node])=>{ if(node) node.hidden=name!==key; });
  }

  function showStatus(message,kind='info'){
    status.hidden=false;
    status.className=`registration-status ${kind}`;
    status.textContent=message;
  }
  function clearStatus(){ status.hidden=true; status.textContent=''; }

  function mountTemplate(templateId,host){
    const template=document.getElementById(templateId);
    host.replaceChildren(template.content.cloneNode(true));
  }

  function ensureCharacter(){
    if(initialized.character) return;
    mountTemplate('personalBuildsTemplate',views.character);
    const rsn=document.getElementById('rsn');
    const profile=VTAM.currentProfile();
    if(rsn && profile?.rsn && !profile.unavailable) rsn.value=profile.rsn;
    BuildsDashboard.init();
    initialized.character=true;
  }

  async function loadClan(){
    const profile=VTAM.currentProfile();
    const slug=VTAM.profileClanSlug(profile);
    if(!slug) return {profile,slug:null,clan:null};
    let clan=await OSRSClans.load(slug);
    if(!clan && profile?.clan){
      clan=OSRSClans.createLocalClan({
        slug,
        name:String(profile.clan),
        displayName:String(profile.clan),
        createdBy:String(profile.rank||'').toLowerCase()==='owner'?String(profile.rsn||''):'',
        description:'Local clan workspace discovered from RuneLite Local Bridge.',
        seededRoster:[]
      });
    }
    activeSlug=slug;
    return {profile,slug,clan};
  }

  function initVault(slug,clan){
    mountTemplate('clanVaultTemplate',views.vault);
    const cofferKey=`pixelb8_clan_vault_coffer:${slug}`;
    const tokensKey=`pixelb8_clan_vault_tokens:${slug}`;
    if(slug==='vtam' && localStorage.getItem(cofferKey)===null && localStorage.getItem('vtam_coffer_gp')!==null){
      localStorage.setItem(cofferKey, localStorage.getItem('vtam_coffer_gp'));
    }
    if(localStorage.getItem(tokensKey)===null && Number(clan.vault?.platinumTokens||0)>0){
      localStorage.setItem(tokensKey,String(Number(clan.vault.platinumTokens)||0));
    }
    function draw(){
      const tokens=Math.max(0,Number(localStorage.getItem(tokensKey))||0);
      const coffer=Math.max(0,Number(localStorage.getItem(cofferKey))||0);
      const tokenGp=tokens*1000;
      document.getElementById('tokens').textContent=tokens.toLocaleString();
      document.getElementById('tokensGp').textContent=VTAM.money(tokenGp);
      document.getElementById('coffer').textContent=VTAM.money(coffer);
      document.getElementById('net').textContent=VTAM.money(tokenGp+coffer);
      const allocations=Array.isArray(clan.vault?.allocations)?clan.vault.allocations:[];
      document.getElementById('vaultAllocations').innerHTML=allocations.length
        ? allocations.map(x=>`<div class="list-row"><span><b>${esc(x.name||'Allocation')}</b><br><small class="muted">${esc(x.description||'')}</small></span><span class="good mono">${VTAM.money(Number(x.amount)||0)}</span></div>`).join('')
        : '<div class="chat-empty"><strong>No allocations recorded</strong><span>This clan has no preset local allocations.</span></div>';
    }
    draw();
    document.getElementById('editVault').onclick=()=>{
      const tokenValue=prompt('Platinum token count:',localStorage.getItem(tokensKey)||'0');
      if(tokenValue===null)return;
      const cofferValue=prompt('Clan coffer value in GP:',localStorage.getItem(cofferKey)||'0');
      if(cofferValue===null)return;
      if(!isNaN(Number(tokenValue)))localStorage.setItem(tokensKey,String(Math.max(0,Number(tokenValue))));
      if(!isNaN(Number(cofferValue)))localStorage.setItem(cofferKey,String(Math.max(0,Number(cofferValue))));
      draw();
    };
    initialized.vault=slug;
  }

  function initOffice(slug){
    mountTemplate('clanOfficeTemplate',views.office);
    ClanOffice.init();
    initialized.officeSlug=slug;
  }

  async function renderRoute(){
    const route=parseRoute();
    clearStatus();
    VTAM.renderDashboardSubnav(route.mode==='clan'?'clan':'character');

    if(route.mode==='character'){
      clanSubnav.hidden=true;
      ensureCharacter();
      setVisible('character');
      document.title='Character Dashboard — PixelB8 OSRS';
      return;
    }

    const {profile,slug,clan}=await loadClan();
    if(!slug){
      clanSubnav.hidden=true;
      setVisible('main');
      document.getElementById('clanDashboard').innerHTML=`
        <div class="panel panel-pad page-head"><div><div class="eyebrow">My OSRS Workspace</div><h1>Clan Dashboard</h1><p>Your selected character determines which clan workspace opens here.</p></div></div>
        <article class="panel panel-pad"><div class="section-title"><div><div class="eyebrow">Selected Character</div><h2>No Clan Linked</h2></div><span class="badge member">${esc(profile.rsn)}</span></div><p class="muted">When RuneLite Local Bridge reports a clan for this character, the Clan workspace and roster will appear here automatically.</p></article>`;
      document.title='Clan Dashboard — PixelB8 OSRS';
      return;
    }
    if(!clan){
      clanSubnav.hidden=true;
      setVisible('main');
      document.getElementById('clanDashboard').innerHTML=`<div class="panel panel-pad"><h1>Clan not found</h1><p class="muted">The selected character\'s clan workspace could not be created locally.</p></div>`;
      return;
    }

    clanSubnav.hidden=false;
    VTAM.renderClanSubnav(route.view);
    document.title=`${clan.displayName} — ${route.view==='main'?'Clan Dashboard':route.view[0].toUpperCase()+route.view.slice(1)}`;

    if(route.view==='main'){
      setVisible('main');
      ClanDashboard.render(slug);
      VTAMRoster.init(slug);
      return;
    }
    if(route.view==='ranks'){
      setVisible('ranks');
      ClanRanks.render(slug);
      VTAMRoster.init(slug);
      return;
    }
    if(route.view==='vault'){
      setVisible('vault');
      if(initialized.vault!==slug) initVault(slug,clan);
      return;
    }
    if(route.view==='office'){
      setVisible('office');
      if(initialized.officeSlug!==slug) initOffice(slug);
    }
  }

  function rerenderForProfile(){
    const rsn=document.getElementById('rsn');
    const current=VTAM.currentProfile();
    if(rsn && current?.rsn && !current.unavailable){rsn.value=current.rsn;rsn.dispatchEvent(new Event('change'));}
    activeSlug=null;
    initialized.vault=false;
    initialized.officeSlug=null;
    views.main.innerHTML='<div id="clanDashboard"></div>';
    views.ranks.innerHTML='<div id="clanRanks"></div>';
    renderRoute();
  }

  window.addEventListener('hashchange',()=>{if((location.hash||'').startsWith('#dashboard'))renderRoute();});
  window.addEventListener('osrs:dashboard-route',renderRoute);
  window.addEventListener('vtam:profile-changed',rerenderForProfile);
  window.addEventListener('vtam:profiles-refreshed',rerenderForProfile);

})();
