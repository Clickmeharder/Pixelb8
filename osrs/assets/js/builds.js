window.BuildsDashboard = (() => {
  let timerInterval = null;
  function init(){

  const SKILLS = [
    ['attack','Attack'], ['hitpoints','Hitpoints'], ['mining','Mining'],
    ['strength','Strength'], ['agility','Agility'], ['smithing','Smithing'],
    ['defence','Defence'], ['herblore','Herblore'], ['fishing','Fishing'],
    ['ranged','Ranged'], ['thieving','Thieving'], ['cooking','Cooking'],
    ['prayer','Prayer'], ['crafting','Crafting'], ['firemaking','Firemaking'],
    ['magic','Magic'], ['fletching','Fletching'], ['woodcutting','Woodcutting'],
    ['runecrafting','Runecraft'], ['slayer','Slayer'], ['farming','Farming'],
    ['construction','Construction'], ['hunter','Hunter'], ['sailing','Sailing']
  ];

  const EQUIPMENT = [
    {key:'head',label:'Head',area:'head'},
    {key:'cape',label:'Cape',area:'cape'},
    {key:'neck',label:'Neck',area:'neck'},
    {key:'ammo',label:'Ammo',area:'ammo'},
    {key:'weapon',label:'Weapon',area:'weapon'},
    {key:'body',label:'Body',area:'body'},
    {key:'shield',label:'Shield',area:'shield'},
    {key:'legs',label:'Legs',area:'legs'},
    {key:'gloves',label:'Gloves',area:'gloves'},
    {key:'boots',label:'Boots',area:'boots'},
    {key:'ring',label:'Ring',area:'ring'}
  ];

  const gk='vtam_build_goals', qk='vtam_quest_goals', tk='vtam_ge_timers';
  const eqKey = () => 'vtam_equipment_' + (document.getElementById('rsn').value.trim().toLowerCase().replace(/\s+/g,'_') || 'default');
  const read=k=>{try{return JSON.parse(localStorage.getItem(k)||'[]')}catch{return []}};
  const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
  const readObj=k=>{try{return JSON.parse(localStorage.getItem(k)||'{}')}catch{return {}}};
  const fileIcon = name => `https://oldschool.runescape.wiki/w/Special:Redirect/file/${encodeURIComponent(String(name).replace(/ /g,'_'))}`;
  const skillIcon = name => fileIcon(`${name} icon.png`);
  let activeSlot = null;
  let market = [];

  function renderSkills(skills={}) {
    const host = document.getElementById('skillPanel');
    let total = 0;
    let counted = 0;
    host.innerHTML = SKILLS.map(([key,label]) => {
      const entry = skills[key] || {};
      const level = Number(entry.level ?? entry.virtualLevel ?? 0) || 0;
      if(level>0){total+=level;counted++;}
      return `<div class="osrs-skill-tile" title="${label}">
        <img src="${skillIcon(label)}" alt="" loading="lazy" onerror="this.style.visibility='hidden'">
        <span class="skill-name">${label}</span>
        <span class="skill-level">${level || '—'}</span>
      </div>`;
    }).join('');
    document.getElementById('totalLevel').textContent = counted ? total.toLocaleString() : '—';
  }

  function renderEquipment(){
    const data = readObj(eqKey());
    document.getElementById('equipmentGrid').innerHTML = EQUIPMENT.map(slot => {
      const item = data[slot.key];
      const icon = item?.icon ? `<img src="${fileIcon(item.icon)}" alt="${escapeHtml(item.name)}" loading="lazy">` : '';
      return `<button class="equipment-slot ${item?'equipped':''}" data-slot="${slot.key}" style="grid-area:${slot.area}" title="${item?escapeHtml(item.name):slot.label}">
        ${icon}<span class="equipment-slot-label">${item?escapeHtml(item.name):slot.label}</span>
      </button>`;
    }).join('');
    document.querySelectorAll('[data-slot]').forEach(btn=>btn.onclick=()=>openItemPicker(btn.dataset.slot));
  }

  function escapeHtml(v=''){return String(v).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}

  async function ensureMarket(){
    if(market.length)return market;
    try{ market = await VTAM.loadMarket(); }catch{ market=[]; }
    return market;
  }

  async function openItemPicker(slot){
    activeSlot=slot;
    const meta=EQUIPMENT.find(x=>x.key===slot);
    document.getElementById('itemPickerTitle').textContent=`Choose ${meta?.label||'Item'}`;
    document.getElementById('itemPickerBackdrop').hidden=false;
    const input=document.getElementById('itemSearch');input.value='';input.focus();
    document.getElementById('itemSearchResults').innerHTML='<div class="muted">Loading OSRS item database…</div>';
    await ensureMarket();
    renderItemResults('');
  }

  function closeItemPicker(){document.getElementById('itemPickerBackdrop').hidden=true;activeSlot=null;}

  function renderItemResults(query){
    const host=document.getElementById('itemSearchResults');
    if(!market.length){host.innerHTML='<div class="muted">The OSRS item feed is currently unavailable.</div>';return;}
    const q=query.trim().toLowerCase();
    const rows=market.filter(x=>x.icon && (!q || x.name.toLowerCase().includes(q))).slice(0,80);
    host.innerHTML=rows.length?rows.map(item=>`<button class="item-result" data-item-id="${item.id}">
      <span class="item-result-icon"><img src="${fileIcon(item.icon)}" alt="" loading="lazy"></span>
      <span><b>${escapeHtml(item.name)}</b><small>${item.members?'Members':'Free-to-play'}${item.limit?` • GE limit ${Number(item.limit).toLocaleString()}`:''}</small></span>
    </button>`).join(''):'<div class="muted">No matching items.</div>';
    host.querySelectorAll('[data-item-id]').forEach(btn=>btn.onclick=()=>equipItem(Number(btn.dataset.itemId)));
  }

  function equipItem(id){
    if(!activeSlot)return;
    const item=market.find(x=>x.id===id);if(!item)return;
    const data=readObj(eqKey());
    data[activeSlot]={id:item.id,name:item.name,icon:item.icon};
    localStorage.setItem(eqKey(),JSON.stringify(data));
    renderEquipment();closeItemPicker();
  }

  function unequip(){
    if(!activeSlot)return;
    const data=readObj(eqKey());delete data[activeSlot];localStorage.setItem(eqKey(),JSON.stringify(data));
    renderEquipment();closeItemPicker();
  }

  function drawList(k,id,empty){const a=read(k),el=document.getElementById(id);el.innerHTML=a.length?a.map((x,i)=>`<div class="list-row"><span>${escapeHtml(x)}</span><button class="btn danger" data-del="${i}" data-key="${k}" data-id="${id}">Remove</button></div>`).join(''):`<div class="muted">${empty}</div>`;el.querySelectorAll('[data-del]').forEach(b=>b.onclick=()=>{const a=read(b.dataset.key);a.splice(+b.dataset.del,1);save(b.dataset.key,a);drawAll()})}
  function drawTimers(){const a=read(tk),el=document.getElementById('timerList');el.innerHTML=a.length?a.map((x,i)=>`<div class="list-row"><span><b>${escapeHtml(x.item)}</b><br><small class="muted">${new Date(x.until).toLocaleString()}</small></span><span><span class="mono" data-until="${x.until}">—</span> <button class="btn danger" data-timer-del="${i}">×</button></span></div>`).join(''):'<div class="muted">No active buy-limit timers.</div>';el.querySelectorAll('[data-timer-del]').forEach(b=>b.onclick=()=>{const a=read(tk);a.splice(+b.dataset.timerDel,1);save(tk,a);drawAll()});tick()}
  function tick(){document.querySelectorAll('[data-until]').forEach(e=>{const d=new Date(e.dataset.until)-Date.now();if(d<=0)e.textContent='Ready';else{const h=Math.floor(d/36e5),m=Math.floor((d%36e5)/6e4),s=Math.floor((d%6e4)/1000);e.textContent=`${h}h ${m}m ${s}s`}})}
  function drawAll(){drawList(gk,'goalList','No stat goals yet.');drawList(qk,'questList','No quest goals yet.');drawTimers()}

  document.getElementById('addGoal').onclick=()=>{const v=prompt('Stat goal (example: Magic 75):');if(v){const a=read(gk);a.push(v);save(gk,a);drawAll()}};
  document.getElementById('addQuest').onclick=()=>{const v=prompt('Quest goal:');if(v){const a=read(qk);a.push(v);save(qk,a);drawAll()}};
  document.getElementById('addTimer').onclick=()=>{const item=prompt('Item / GE slot label:');if(!item)return;const mins=Number(prompt('Minutes until buy limit resets:','240'));if(!Number.isFinite(mins)||mins<=0)return;const a=read(tk);a.push({item,until:new Date(Date.now()+mins*60000).toISOString()});save(tk,a);drawAll()};

  document.getElementById('lookup').onclick=async()=>{
    const rsn=document.getElementById('rsn').value.trim();if(!rsn)return;
    const st=document.getElementById('lookupStatus');st.textContent='Refreshing '+rsn+'…';
    document.getElementById('skillsTitle').textContent=rsn;renderEquipment();
    try{
      let r=await fetch('https://api.wiseoldman.net/v2/players/'+encodeURIComponent(rsn),{method:'POST',headers:{'Content-Type':'application/json'}});
      if(!r.ok)r=await fetch('https://api.wiseoldman.net/v2/players/'+encodeURIComponent(rsn));
      if(!r.ok)throw new Error('Player not found or API unavailable');
      const j=await r.json();
      const s=j.latestSnapshot?.data?.skills||j.latestSnapshot?.data?.skill||{};
      renderSkills(s);
      st.textContent='Public skill levels refreshed for '+rsn+'.';
    }catch(e){
      renderSkills({});
      st.textContent='Live hiscore lookup could not complete. Equipment, goals and timers remain usable locally.';
    }
  };

  document.getElementById('itemSearch').addEventListener('input',e=>renderItemResults(e.target.value));
  document.getElementById('closeItemPicker').onclick=closeItemPicker;
  document.getElementById('unequipItem').onclick=unequip;
  document.getElementById('itemPickerBackdrop').addEventListener('click',e=>{if(e.target.id==='itemPickerBackdrop')closeItemPicker()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape')closeItemPicker()});
  document.getElementById('clearEquipment').onclick=()=>{if(confirm('Clear this character\'s saved equipment loadout?')){localStorage.removeItem(eqKey());renderEquipment();}};
  document.getElementById('rsn').addEventListener('change',()=>{document.getElementById('skillsTitle').textContent=document.getElementById('rsn').value.trim()||'Character';renderEquipment()});

  renderSkills({});renderEquipment();drawAll();if(!timerInterval)timerInterval=setInterval(tick,1000);

  }
  return {init};
})();
