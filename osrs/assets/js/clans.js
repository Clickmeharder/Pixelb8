window.OSRSClans = (() => {
  const LOCAL_KEY = 'pixelb8_local_clans_v1';
  const TEST_FIXTURE_KEY = 'pixelb8_local_test_fixture_seeded_v1';
  const TEST_CLAN = {
    slug: 'test-local-clan',
    name: 'Test Local Clan',
    displayName: 'Test Local Clan',
    createdBy: 'testdude123',
    description: 'Development-only local clan for testing the browser-local clan workflow.',
    seededRoster: [{rsn:'testdude123', rank:'Owner'}],
    createdAt: Date.now(),
    devFixture: true
  };
  const CLANS = {
    vtam: {
      slug: 'vtam',
      name: 'VTAM',
      displayName: 'VTAM Corporation',
      tagline: 'Old School RuneScape clan operations, progression and market tools.',
      description: 'Varrock Muggers and Thieves Corporate Front',
      visibility: 'listed',
      status: 'Active',
      statusClass: 'owner',
      source: 'builtin',
      registered: true,
      local: false,
      accent: 'Corporate',
      home: 'clans/clan/index.html?clan=vtam',
      ranks: 'clans/clan/ranks/index.html?clan=vtam',
      rosterSource: 'local-bridge',
      extras: [],
      vault: {
        platinumTokens: 15000,
        allocations: [
          {name:'CEO Business Trip Allocation', description:'14-day P2P trip: procurement, new briefcase and dry cleaning.', amount:5000000}
        ]
      },
      membershipStages: [
        {name:'Guest', description:'Guest-level rank.'},
        {name:'Goon', description:'First rank received when someone is invited into VTAM.'},
        {name:'Crew', description:'New initiate member rank.'},
        {name:'Full Members', description:'Ranks above Crew represent full-fledged clan members.'}
      ],
      promotionLine: ['Scout','Burglar','Smuggler','Rogue','Thief','Brigand','Assassin','Bandit','Cutpurse'],
      rankOrder: ['Owner','Deputy','Deputy Owner','Councillor','Legacy','Executive','Superior','Rank 105','Rank 104','Supervisor','Leader','Coordinator','Administrator','Moderator','Collector','Legend','Cutpurse','Bandit','Assassin','Brigand','Thief','Rogue','Smuggler','Burglar','Scout','Skiller','Crew','Goon','Guest'],
      responsibilities: [
        {name:'Moderator', description:'Moderates clan chat.', tag:'Chat'},
        {name:'Administrator & above', description:'VTAM management roles.', tag:'Management'},
        {name:'Collector', description:'Reports through the Coordinator / Leader command chain.', tag:'Operations'}
      ]
    }
  };

  const escapeHtml = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  const slugify = value => String(value||'').trim().toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,64);

  function readLocalClans(){
    try{
      const rows=JSON.parse(localStorage.getItem(LOCAL_KEY)||'[]');
      return Array.isArray(rows)?rows.filter(x=>x&&x.slug&&x.displayName):[];
    }catch(_){return []}
  }
  function writeLocalClans(rows){
    localStorage.setItem(LOCAL_KEY,JSON.stringify(rows));
    return rows;
  }
  function normalizeLocalClan(raw){
    const slug=slugify(raw?.slug||raw?.displayName||raw?.name);
    const displayName=String(raw?.displayName||raw?.name||slug).trim();
    return {
      slug,
      name:String(raw?.name||displayName).trim(),
      displayName,
      tagline:String(raw?.tagline||'Local RuneLite clan workspace.').trim(),
      description:String(raw?.description||'Local clan profile stored only in this browser.').trim(),
      visibility:'listed',
      status:'Local',
      statusClass:'local',
      source:'local',
      local:true,
      registered:false,
      accent:'Local',
      rosterSource:'local-bridge',
      seededRoster:Array.isArray(raw?.seededRoster)?raw.seededRoster.filter(x=>x&&String(x.rsn||'').trim()).map(x=>({rsn:String(x.rsn).trim(),rank:String(x.rank||'Member').trim()||'Member'})):[],
      memberCount:Number.isFinite(Number(raw?.memberCount))?Number(raw.memberCount):(Array.isArray(raw?.seededRoster)?raw.seededRoster.filter(x=>x&&String(x.rsn||'').trim()).length:null),
      lastSync:Number(raw?.lastSync)||0,
      createdAt:Number(raw?.createdAt)||Date.now(),
      createdBy:String(raw?.createdBy||'').trim(),
      devFixture:!!raw?.devFixture,
      feed: raw?.feed && typeof raw.feed === 'object' ? {
        publisherKey: String(raw.feed.publisherKey || '').trim(),
        viewerCode: String(raw.feed.viewerCode || '').trim(),
        viewerUrl: String(raw.feed.viewerUrl || '').trim(),
        runeliteUrl: String(raw.feed.runeliteUrl || '').trim(),
        workerUrl: String(raw.feed.workerUrl || '').trim()
      } : {publisherKey:'',viewerCode:'',viewerUrl:'',runeliteUrl:'',workerUrl:''},
      extras:Array.isArray(raw?.extras)?raw.extras:[],
      vault:raw?.vault&&typeof raw.vault==='object'?raw.vault:{platinumTokens:0,allocations:[]},
      membershipStages:Array.isArray(raw?.membershipStages)?raw.membershipStages:[],
      promotionLine:Array.isArray(raw?.promotionLine)?raw.promotionLine:[],
      rankOrder:Array.isArray(raw?.rankOrder)?raw.rankOrder:[],
      responsibilities:Array.isArray(raw?.responsibilities)?raw.responsibilities:[],
      home:`clans/clan/index.html?clan=${encodeURIComponent(slug)}`,
      ranks:`clans/clan/ranks/index.html?clan=${encodeURIComponent(slug)}`
    };
  }
  function seedTestFixture(){
    try{
      if(localStorage.getItem(TEST_FIXTURE_KEY)==='1') return;
      const rows=readLocalClans();
      if(!rows.some(x=>slugify(x.slug)==='test-local-clan')) rows.push(TEST_CLAN);
      writeLocalClans(rows);
      localStorage.setItem(TEST_FIXTURE_KEY,'1');
    }catch(_){}
  }
  seedTestFixture();

  function hydrateLocalClans(){
    readLocalClans().map(normalizeLocalClan).filter(x=>x.slug).forEach(clan=>{
      if(!CLANS[clan.slug] || CLANS[clan.slug].source==='local') CLANS[clan.slug]=clan;
    });
  }
  function getLocal(slug){
    const key=slugify(slug);
    const raw=readLocalClans().find(x=>slugify(x.slug)===key);
    return raw?normalizeLocalClan(raw):null;
  }
  function createLocalClan(input){
    const source={...(input||{})};
    const owner=String(source.createdBy||'').trim();
    const seeded=Array.isArray(source.seededRoster)?source.seededRoster.filter(x=>x&&String(x.rsn||'').trim()).map(x=>({rsn:String(x.rsn).trim(),rank:String(x.rank||'Member').trim()||'Member'})):[];
    if(owner){
      const existing=seeded.find(x=>x.rsn.toLowerCase()===owner.toLowerCase());
      if(existing) existing.rank='Owner'; else seeded.unshift({rsn:owner,rank:'Owner'});
    }
    const seen=new Set();
    source.seededRoster=seeded.filter(x=>{const key=x.rsn.toLowerCase();if(seen.has(key))return false;seen.add(key);return true;});
    source.memberCount=source.seededRoster.length||null;
    const clan=normalizeLocalClan(source);
    if(!clan.slug) throw new Error('Enter a clan name.');
    const rows=readLocalClans();
    const index=rows.findIndex(x=>slugify(x.slug)===clan.slug);
    if(index>=0) rows[index]={...rows[index],...clan}; else rows.push(clan);
    writeLocalClans(rows);
    CLANS[clan.slug]=clan;
    return clan;
  }
  function updateLocalClan(slug, patch){
    const key=slugify(slug);
    const rows=readLocalClans();
    const index=rows.findIndex(x=>slugify(x.slug)===key);
    if(index<0) return null;
    const current=rows[index] || {};
    const nextPatch=patch && typeof patch==='object' ? patch : {};
    const next={
      ...current,
      ...nextPatch,
      feed: nextPatch.feed && typeof nextPatch.feed==='object'
        ? {...(current.feed||{}),...nextPatch.feed}
        : (current.feed||{})
    };
    rows[index]=next;
    writeLocalClans(rows);
    const normalized=normalizeLocalClan(next);
    CLANS[key]=normalized;
    return normalized;
  }
  function removeLocalClan(slug){
    const key=slugify(slug);
    writeLocalClans(readLocalClans().filter(x=>slugify(x.slug)!==key));
    if(CLANS[key]?.source==='local') delete CLANS[key];
  }
  hydrateLocalClans();

  const get = slug => {
    const key=slugify(slug);
    return getLocal(key) || CLANS[key] || null;
  };

  async function load(slug){ return get(slug); }

  async function list(){
    hydrateLocalClans();
    const bySlug=new Map();
    Object.values(CLANS).filter(c=>c && c.visibility!=='hidden').forEach(c=>bySlug.set(c.slug,c));
    readLocalClans().map(normalizeLocalClan).filter(c=>c?.slug).forEach(c=>bySlug.set(c.slug,c));
    return [...bySlug.values()].sort((a,b)=>String(a.displayName||a.name).localeCompare(String(b.displayName||b.name)));
  }

  async function renderDirectory(){
    const host=document.getElementById('clanDirectory'); if(!host)return;
    const rows=await list();
    host.innerHTML=rows.map(c=>{
      const isBuiltin=c.source==='builtin';
      const sourceLabel=isBuiltin?'Built-in':'Local';
      const sourceClass=isBuiltin?'owner':'local';
      const count=Number.isFinite(Number(c.memberCount))&&Number(c.memberCount)>0?`${Number(c.memberCount)} members`:'Local roster';
      return `<a class="tool-card clan-card" href="${document.body?.dataset?.osrsApp==='1' ? `#dashboard/clan/${encodeURIComponent(c.slug)}` : VTAM.path(c.home)}"><div class="section-title"><h3>${escapeHtml(c.displayName)}</h3><span class="badge ${sourceClass}">${sourceLabel}</span></div><p>${escapeHtml(c.description||'Local OSRS clan workspace.')}</p><div class="clan-card-meta"><span>${escapeHtml(c.name)}</span><span>${escapeHtml(count)} · Open clan page →</span></div></a>`;
    }).join('') || '<div class="chat-empty"><strong>No local clans yet</strong><span>Create a local clan to get started.</span></div>';
    const count=document.getElementById('clanDirectoryCount'); if(count)count.textContent=String(rows.length);
  }

  function hydrateClanPage(slug){
    const clan=get(slug); if(!clan)return;
    document.title=`${clan.displayName} — Clan Dashboard`;
    document.querySelectorAll('[data-clan-name]').forEach(el=>el.textContent=clan.name);
    document.querySelectorAll('[data-clan-display]').forEach(el=>el.textContent=clan.displayName);
    document.querySelectorAll('[data-clan-tagline]').forEach(el=>el.textContent=clan.tagline||'');
    document.querySelectorAll('[data-clan-description]').forEach(el=>el.textContent=clan.description||'');
  }

  return {list,get,load,renderDirectory,hydrateClanPage,escapeHtml,slugify,getLocal,createLocalClan,updateLocalClan,removeLocalClan,readLocalClans};
})();
