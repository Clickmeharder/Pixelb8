window.ClanRoster = (() => {
  const URL='http://127.0.0.1:18473/clan-roster';

  async function localFetch(url){
    const options={cache:'no-store'};
    try{options.targetAddressSpace='loopback'}catch(_){}
    return fetch(url,options);
  }
  function badgeClass(rank=''){
    const v=String(rank).toLowerCase();
    if(v==='owner')return'owner';
    if(v.includes('deputy')||v.includes('admin')||v.includes('executive'))return'registered';
    return'member';
  }
  function render(data,label='Local RuneLite roster'){
    const tbody=document.getElementById('vtamRosterBody');
    const status=document.getElementById('vtamRosterStatus');
    if(status)status.textContent=label;
    if(!tbody)return;
    const members=Array.isArray(data?.members)?data.members:[];
    tbody.innerHTML=members.length?members.map(m=>`<tr><td><strong>${String(m.rsn||m.name||'')}</strong></td><td><span class="badge ${badgeClass(m.rank)}">${String(m.rank||'Member')}</span></td><td>${String(m.world||'—')}</td><td>${String(m.status||'—')}</td></tr>`).join(''):'<tr><td colspan="4"><div class="chat-empty"><strong>No roster entries</strong><span>RuneLite Local Bridge returned an empty roster.</span></div></td></tr>';
  }
  async function load(slugOverride){
    const slug=String(slugOverride||document.documentElement.dataset.clan||'').toLowerCase();
    const clan=window.OSRSClans?.get(slug);
    if(!clan)return;
    const status=document.getElementById('vtamRosterStatus');
    if(status)status.textContent='Loading Local Bridge roster…';
    try{
      const response=await localFetch(URL);
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      const data=await response.json();
      const returned=String(data.clan||data.managedClan||'').trim().toLowerCase();
      const expected=[clan.name,clan.displayName,clan.slug].map(v=>String(v||'').trim().toLowerCase());
      if(returned&&!expected.includes(returned))throw new Error('Different managed clan');
      render(data,'Local RuneLite roster');
      return data;
    }catch(error){
      if(Array.isArray(clan.seededRoster)&&clan.seededRoster.length){
        render({members:clan.seededRoster},'Creation roster (local fallback)');
        return null;
      }
      const tbody=document.getElementById('vtamRosterBody');
      if(status)status.textContent='Local Bridge unavailable';
      if(tbody)tbody.innerHTML='<tr><td colspan="4"><div class="chat-empty"><strong>No local roster available</strong><span>Run RuneLite with VTAM Clan Hook and enable the Local Website Bridge to expose this clan roster.</span></div></td></tr>';
      return null;
    }
  }
  function init(slug){const refresh=document.getElementById('vtamRosterRefresh');if(refresh)refresh.onclick=()=>load(slug);load(slug)}
  return {init,load,render};
})();
