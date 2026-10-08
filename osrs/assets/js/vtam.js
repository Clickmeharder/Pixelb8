const VTAM = (() => {
  const BASE = document.documentElement.dataset.base || '../';
  const CHAR_CACHE_KEY = 'vtam_linked_characters';
  const ACTIVE_PROFILE_KEY = 'vtam_active_profile';
  const BRIDGE_BASE = 'http://127.0.0.1:18473';
  const CHAR_CHECK_KEY = 'vtam_characters_checked_at';
  const CHAR_CHECK_TTL = 30000;
  const MARKET_CACHE_KEY = 'vtam_market_cache_v3';
  const MARKET_CACHE_TTL = 5 * 60 * 1000;
  const TEST_PROFILE = {rsn:'testdude123',rank:'Owner',clan:'Test Local Clan',lastUsed:0,devFixture:true};
  const badgeForRank = rank => { const r=String(rank||'').toLowerCase(); return r==='owner'?'owner':r.includes('deputy')?'deputy':'member'; };
  const officeForRank = rank => { const r=String(rank||'').toLowerCase(); return r==='owner'?"Owner's Office":r.includes('deputy')?'Executive Suite':'Member Office'; };
  function readCachedProfiles(){
    try{
      const rows=JSON.parse(localStorage.getItem(CHAR_CACHE_KEY)||'[]');
      if(!Array.isArray(rows))return [];
      const normalized=rows.filter(x=>x&&x.rsn).map(x=>({rsn:String(x.rsn),rank:String(x.rank||'Member'),clan:String(x.clan||''),office:officeForRank(x.rank),badge:badgeForRank(x.rank),lastUsed:Number(x.lastUsed)||0,devFixture:!!x.devFixture}));
      if(!normalized.some(x=>x.rsn.toLowerCase()===TEST_PROFILE.rsn.toLowerCase())) normalized.push({...TEST_PROFILE,office:officeForRank(TEST_PROFILE.rank),badge:badgeForRank(TEST_PROFILE.rank)});
      return normalized;
    }catch(_){return []}
  }
  const profiles = readCachedProfiles();
  const appMode=()=>document.body?.dataset?.osrsApp==='1';
  const coreNav = [['OSRS','home'],['Dashboard','dashboard/character']];
  const slugifyClan = value => String(value||'').trim().toLowerCase().replace(/['’]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  const pageClanSlug = () => slugifyClan(document.documentElement.dataset.clan || new URLSearchParams(location.search).get('clan') || '');
  const profileClanSlug = profile => slugifyClan(profile?.clan || '');
  const profileBelongsToClan = (profile, slug=pageClanSlug()) => !!slug && profileClanSlug(profile) === slug;
  let marketCache = null;
  const fmt = n => Number(n || 0).toLocaleString('en-US');
  const money = n => `${fmt(Math.round(Number(n)||0))} GP`;
  const path = p => `${BASE}${p}`;
  const itemIconUrl = id => id ? `https://secure.runescape.com/m=itemdb_oldschool/obj_big.gif?id=${encodeURIComponent(id)}` : path('assets/img/item-placeholder.svg');
  const appHref = route => appMode() ? `#${route}` : path(`index.html#${route==='home'?'dashboard/character':route}`);
  function emptyProfile(){return {rsn:'No linked character',rank:'Local',office:'My Office',badge:'member',unavailable:true}}
  function currentProfile(){
    const saved = localStorage.getItem(ACTIVE_PROFILE_KEY) || '';
    return profiles.find(p => p.rsn === saved) || profiles[0] || emptyProfile();
  }
  function setProfile(rsn){
    const next=profiles.find(p=>p.rsn===rsn);
    if(!next)return;
    localStorage.setItem(ACTIVE_PROFILE_KEY,rsn);
    renderShell(window.OSRSApp ? (window.OSRSApp.route().startsWith('dashboard')?'dashboard':'osrs') : 'dashboard');
    renderTicker();
    window.dispatchEvent(new CustomEvent('vtam:profile-changed',{detail:{profile:next}}));
    if(appMode()) return;
    const here=location.pathname.replace(/\\/g,'/').toLowerCase();
    if(here.endsWith('/dashboard/index.html') || here.endsWith('/dashboard/')) return;
    location.reload();
  }
  async function loadCharacters(force=false){
    try{
      const lastCheck = Number(sessionStorage.getItem(CHAR_CHECK_KEY)) || 0;
      if(!force && profiles.length && Date.now() - lastCheck < CHAR_CHECK_TTL) return false;
      const res=await fetch(`${BRIDGE_BASE}/characters`,{cache:'no-store',targetAddressSpace:'loopback'});
      if(!res.ok)throw new Error(`Bridge ${res.status}`);
      const data=await res.json();
      const rows=Array.isArray(data.characters)?data.characters.filter(x=>x&&x.rsn):[];
      const normalized=rows.map(x=>({rsn:String(x.rsn),rank:String(x.rank||'Member'),clan:String(x.clan||''),office:officeForRank(x.rank),badge:badgeForRank(x.rank),lastUsed:Number(x.lastUsed)||0}));
      if(!normalized.some(x=>x.rsn.toLowerCase()===TEST_PROFILE.rsn.toLowerCase())) normalized.push({...TEST_PROFILE,office:officeForRank(TEST_PROFILE.rank),badge:badgeForRank(TEST_PROFILE.rank)});
      profiles.splice(0,profiles.length,...normalized);
      const before=localStorage.getItem(CHAR_CACHE_KEY)||'[]';
      const after=JSON.stringify(normalized);
      if(before!==after)localStorage.setItem(CHAR_CACHE_KEY,after);
      sessionStorage.setItem(CHAR_CHECK_KEY,String(Date.now()));
      const saved=localStorage.getItem(ACTIVE_PROFILE_KEY)||'';
      if(!normalized.some(x=>x.rsn===saved)){
        const preferred=normalized.find(x=>x.rsn===data.activeCharacter)||normalized[0];
        if(preferred)localStorage.setItem(ACTIVE_PROFILE_KEY,preferred.rsn);
        else localStorage.removeItem(ACTIVE_PROFILE_KEY);
      }
      return before!==after;
    }catch(_){return false}
  }
  function renderShell(active=''){
    const p=currentProfile();
    const host=document.getElementById('vtamTop'); if(!host)return;
    const clanSlug=pageClanSlug();
    const clan=(window.OSRSClans&&clanSlug)?window.OSRSClans.get(clanSlug):null;
    const brandTitle=clan?clan.displayName.toUpperCase():'PIXELB8 OSRS';
    const brandSub=clan?'Old School RuneScape Clan':'Old School RuneScape Dashboard';
    const brandHref='dashboard/character';
    let activeKey=String(active||'').toLowerCase();
    if(['builds','home','ranks','vault','office','dashboard'].includes(activeKey))activeKey='dashboard';
    const access=geAccess(),favOnly=localStorage.getItem('vtam_ticker_favorites_only')==='1';
    host.innerHTML=`<div class="ticker-row"><div class="ticker-controls"><select class="select ticker-access-select" id="tickerAccess" title="Global Grand Exchange access filter"><option value="all"${access==='all'?' selected':''}>All</option><option value="f2p"${access==='f2p'?' selected':''}>F2P</option><option value="p2p"${access==='p2p'?' selected':''}>Members</option></select><button class="btn ticker-fav${favOnly?' active':''}" id="tickerFavorites" type="button" aria-pressed="${favOnly}" title="Show favorites only in the ticker">★</button><button class="btn" id="tickerRefresh" title="Refresh prices">↻</button></div><div class="ticker-wrap"><div class="ticker" id="vtamTicker"><span class="ticker-item muted">Connecting to RuneScape Wiki market feed…</span></div></div>`;
    document.getElementById('tickerAccess')?.addEventListener('change',e=>{setGEAccess(e.target.value)});
    document.getElementById('tickerFavorites')?.addEventListener('click',()=>{const on=localStorage.getItem('vtam_ticker_favorites_only')==='1';localStorage.setItem('vtam_ticker_favorites_only',on?'0':'1');const b=document.getElementById('tickerFavorites');if(b){b.classList.toggle('active',!on);b.setAttribute('aria-pressed',String(!on))}renderTicker()});
    document.getElementById('tickerRefresh')?.addEventListener('click',()=>loadMarket(true));
  }
  async function loadMarket(force=false){
    if(marketCache&&!force){renderTicker();return marketCache}
    if(!force){
      try{
        const cached=JSON.parse(sessionStorage.getItem(MARKET_CACHE_KEY)||'null');
        if(cached && Array.isArray(cached.rows) && Date.now()-Number(cached.savedAt||0)<MARKET_CACHE_TTL){
          marketCache=cached.rows;
          window.dispatchEvent(new CustomEvent('vtam:market',{detail:marketCache}));
          renderTicker();
          return marketCache;
        }
      }catch(_){}
    }
    try{
      const [m,l,v]=await Promise.all([
        fetch('https://prices.runescape.wiki/api/v1/osrs/mapping'),
        fetch('https://prices.runescape.wiki/api/v1/osrs/latest'),
        fetch('https://prices.runescape.wiki/api/v1/osrs/24h').catch(()=>null)
      ]);
      if(!m.ok||!l.ok)throw new Error('Market API unavailable');
      const mapping=await m.json(), latest=(await l.json()).data||{};
      let volume={};
      if(v?.ok){try{volume=(await v.json()).data||{}}catch(_){}}
      marketCache=mapping.map(i=>{
        const vol=volume[i.id]||{};
        const highVol=Number(vol.highPriceVolume)||0,lowVol=Number(vol.lowPriceVolume)||0;
        return {id:i.id,name:i.name,icon:i.icon||'',members:!!i.members,limit:i.limit||0,highalch:i.highalch||0,lowalch:i.lowalch||0,price:i.value||0,value:i.value||0,low:latest[i.id]?.low??0,high:latest[i.id]?.high??0,highVolume24h:highVol,lowVolume24h:lowVol,volume24h:highVol+lowVol};
      });
      try{sessionStorage.setItem(MARKET_CACHE_KEY,JSON.stringify({savedAt:Date.now(),rows:marketCache}))}catch(_){}
      window.dispatchEvent(new CustomEvent('vtam:market',{detail:marketCache}));renderTicker();return marketCache;
    }catch(err){const t=document.getElementById('vtamTicker');if(t)t.innerHTML=`<span class="ticker-item bad">Market feed offline — local tools remain available.</span>`;throw err}
  }
  function geAccess(){
    const saved=localStorage.getItem('vtam_ge_access');
    if(['all','f2p','p2p'].includes(saved))return saved;
    const legacy=localStorage.getItem('vtam_ticker_filter');
    const next=['all','f2p','p2p'].includes(legacy)?legacy:'all';
    localStorage.setItem('vtam_ge_access',next);
    return next;
  }
  function setGEAccess(next){
    const value=['all','f2p','p2p'].includes(next)?next:'all';
    localStorage.setItem('vtam_ge_access',value);
    const sel=document.getElementById('tickerAccess');if(sel&&sel.value!==value)sel.value=value;
    renderTicker();
    window.dispatchEvent(new CustomEvent('vtam:ge-access-changed',{detail:value}));
  }
  function renderTicker(){
    const t=document.getElementById('vtamTicker');if(!t||!marketCache)return;
    const access=geAccess(),favOnly=localStorage.getItem('vtam_ticker_favorites_only')==='1'; const fav=JSON.parse(localStorage.getItem('vtam_favorites')||'[]');
    const nat=marketCache.find(i=>i.id===561)?.high||135;
    let rows=marketCache.filter(i=>i.highalch>0&&i.high>0).map(i=>({...i,profit:i.highalch-i.high-nat}));
    if(access==='f2p')rows=rows.filter(i=>!i.members);if(access==='p2p')rows=rows.filter(i=>i.members);if(favOnly)rows=rows.filter(i=>fav.includes(i.id));
    rows.sort((a,b)=>b.profit-a.profit);rows=rows.slice(0,18);if(!rows.length){t.innerHTML=`<span class="ticker-item muted">${favOnly?'No favorites match this access mode.':'No items match this access mode.'}</span>`;return}
    const html=rows.map(i=>`<span class="ticker-item"><strong>${fav.includes(i.id)?'★ ':''}${i.name}</strong><span class="muted">GE ${money(i.low)}</span><span class="${i.profit>=0?'good':'bad'}">${i.profit>=0?'▲':'▼'} ${money(i.profit)}/alch</span></span>`).join('');t.innerHTML=html+html;
  }
  function renderGESubnav(active){
    const el=document.getElementById('geSubnav');if(!el)return;
    const fileIcon=name=>`https://oldschool.runescape.wiki/w/Special:Redirect/file/${encodeURIComponent(String(name).replace(/ /g,'_'))}`;
    const marketIcon=name=>{
      const item=marketCache?.find(i=>i.name===name);
      return item?.icon?fileIcon(item.icon):null;
    };
    const items=[
      {label:'Overview',key:'',type:'text'},
      {label:'Analytics',key:'analytics',type:'text'},
      {label:'Flipping',key:'flipping',type:'text'},
      {label:'Item Sets',key:'item-sets',type:'icon',src:marketIcon('Partyhat set')||fileIcon('Partyhat set.png'),fallback:'Set'},
      {label:'Alch Terminal',key:'alch-terminal',type:'icon',src:fileIcon('High Level Alchemy.png'),fallback:'Alch'},
      {label:'Bone Magic',key:'bone-magic',type:'icon',src:fileIcon('Bones to Bananas.png'),fallback:'Bone'},
      {label:'Crafting',key:'crafting',type:'icon',src:fileIcon('Crafting icon.png'),fallback:'Craft'},
      {label:'Cooking',key:'cooking',type:'icon',src:fileIcon('Cooking icon.png'),fallback:'Cook'},
      {label:'Smithing',key:'smithing',type:'icon',src:fileIcon('Smithing icon.png'),fallback:'Smith'},
      {label:'Fletching',key:'fletching',type:'icon',src:fileIcon('Fletching icon.png'),fallback:'Fletch'},
      {label:'Gathering',key:'gathering',type:'text'}
    ];
    el.innerHTML=items.map(item=>{
      const route=item.key?`dashboard/tools/${item.key}`:'dashboard/tools';
      const href=appMode()?`#${route}`:path(`index.html#${route}`);
      const activeClass=active===item.key?'active':'';
      if(item.type==='icon'){
        return `<a class="ge-icon-tab ${activeClass}" href="${href}" title="${item.label}" aria-label="${item.label}"><img class="ge-tab-icon" src="${item.src}" alt="" loading="lazy" onerror="this.style.display='none';this.parentElement.classList.add('icon-fallback')"><span class="ge-tab-fallback">${item.fallback||item.label}</span></a>`;
      }
      return `<a class="${activeClass}" href="${href}">${item.label}</a>`;
    }).join('');
  }
  function renderDashboardSubnav(active){
    const el=document.getElementById('dashboardSubnav');if(!el)return;
    if(!active){
      const route=window.OSRSApp?.route?.() || String(location.hash||'').replace(/^#/,'');
      active=route.startsWith('dashboard/clan')?'clan':route.startsWith('dashboard/tools')?'tools':'character';
    }
    el.innerHTML=`<a class="${active==='character'?'active':''}" href="${appMode()?'#dashboard/character':path('index.html#dashboard/character')}">Character</a><a class="${active==='clan'?'active':''}" href="${appMode()?'#dashboard/clan/main':path('index.html#dashboard/clan/main')}">Clan</a><a class="${active==='tools'?'active':''}" href="${appMode()?'#dashboard/tools':path('index.html#dashboard/tools')}">Tools</a>`;
  }
  function renderClanSubnav(active='main'){
    const el=document.getElementById('clanSubnav');if(!el)return;
    const profile=currentProfile();
    const slug=profileClanSlug(profile);
    if(!slug){el.innerHTML='';return;}
    const items=[
      ['Main',appMode()?'#dashboard/clan/main':'#clan/main','main'],
      ['Ranks',appMode()?'#dashboard/clan/ranks':'#clan/ranks','ranks'],
      ['Vault',appMode()?'#dashboard/clan/vault':'#clan/vault','vault'],
      [officeForRank(profile.rank),appMode()?'#dashboard/clan/office':'#clan/office','office']
    ];
    el.innerHTML=items.map(([label,url,key])=>`<a class="${active===key?'active':''}" href="${url}">${label}</a>`).join('');
  }
  function init(active){
    renderShell(active);
    loadCharacters().then(changed=>{if(changed){renderShell(active);renderTicker();window.dispatchEvent(new CustomEvent('vtam:profiles-refreshed'));if(!appMode()){const here=location.pathname.replace(/\\/g,'/').toLowerCase();if(!here.endsWith('/dashboard/index.html')&&!here.endsWith('/dashboard/')) location.reload();}}}).catch(()=>{});
    loadMarket().catch(()=>{});
    document.querySelectorAll('[data-year]').forEach(x=>x.textContent=new Date().getFullYear());
    const startChat=()=>{ if(window.VTAMChat) window.VTAMChat.init(); };
    if(window.VTAMChat) startChat();
    else {
      const script=document.createElement('script');
      script.src=path('assets/js/chat-feed.js');
      script.onload=startChat;
      document.body.appendChild(script);
    }
  }
  return {init,renderShell,renderTicker,loadMarket,loadCharacters,renderGESubnav,renderDashboardSubnav,renderClanSubnav,currentProfile,setProfile,profiles,fmt,money,path,itemIconUrl,pageClanSlug,profileClanSlug,profileBelongsToClan,officeForRank,geAccess,setGEAccess};
})();
