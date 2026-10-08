window.ClanPublic = (() => {
  const formatTime=ms=>{if(!ms)return 'Not synced';const d=new Date(Number(ms));return Number.isNaN(d.getTime())?'Unknown':d.toLocaleString();};
  function render(slug){
    const clan=OSRSClans.get(slug),host=document.getElementById('clanPublicProfile');
    if(!clan||!host)return;
    const sourceLabel=clan.local?'Local':'PixelB8 Registered';
    const sourceClass=clan.local?'local':'registered';
    const registerAction=clan.local?`<a class="btn primary" href="#clans/register/${encodeURIComponent(clan.slug)}">Register with PixelB8</a>`:'';
    const deleteAction=clan.local?`<button class="btn ghost" type="button" id="deleteLocalClan">Delete Local Clan</button>`:'';
    const localNote=clan.local?`<div class="callout">This clan exists only in this browser. Its roster can come from VTAM Clan Hook's Local Bridge. No clan roster is stored or synced to PixelB8 unless you choose to register it.</div>`:'';
    host.innerHTML=`
      <div class="panel panel-pad page-head"><div><div class="eyebrow">Clan Profile</div><h1>${OSRSClans.escapeHtml(clan.displayName)}</h1><p>${OSRSClans.escapeHtml(clan.description||clan.tagline||'PixelB8 OSRS clan profile.')}</p></div><div class="actions"><span class="badge ${sourceClass}">${sourceLabel}</span>${registerAction}${deleteAction}<a class="btn" href="${document.body?.dataset?.osrsApp==='1'?'#clans':VTAM.path('clans/index.html')}">Back to Clans</a></div></div>
      ${localNote}
      <div class="grid grid-3">
        <div class="metric"><div class="metric-label">Clan</div><div class="metric-value accent">${OSRSClans.escapeHtml(clan.name)}</div></div>
        <div class="metric"><div class="metric-label">Members</div><div class="metric-value">${Number(clan.memberCount)||'—'}</div></div>
        <div class="metric"><div class="metric-label">Roster Source</div><div class="metric-value" style="font-size:14px">${clan.local?'Local Bridge':OSRSClans.escapeHtml(formatTime(clan.lastSync))}</div></div>
      </div>
      <article class="panel panel-pad"><div class="section-title"><h2>About</h2><span class="badge ${sourceClass}">${sourceLabel}</span></div><p class="muted">${OSRSClans.escapeHtml(clan.tagline||clan.description||'')}</p><p>${OSRSClans.escapeHtml(clan.description||'')}</p></article>`;
    const deleteButton=document.getElementById('deleteLocalClan');
    if(deleteButton) deleteButton.onclick=()=>{
      if(!confirm(`Delete local clan ${clan.displayName}? This removes only the browser-local clan record.`)) return;
      OSRSClans.removeLocalClan(clan.slug);
      location.hash='#clans';
    };
    document.title=`${clan.displayName} — Clan Profile`;
  }
  return {render};
})();
