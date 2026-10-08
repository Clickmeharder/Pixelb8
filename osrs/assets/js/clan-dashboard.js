window.ClanDashboard = (() => {
  const formatTime = ms => {
    if(!ms) return 'Not synced';
    const d=new Date(Number(ms));
    return Number.isNaN(d.getTime()) ? 'Unknown' : d.toLocaleString();
  };
  async function renderActivity(slug){
    const host=document.getElementById('clanActivity');
    if(!host)return;
    host.innerHTML='<div class="chat-empty"><strong>Clan activity is local</strong><span>Use the right-side Clan Feed for RuneLite Local Bridge or your clan-owned Cloudflare feed. PixelB8 does not store clan activity.</span></div>';
  }

  function render(slug){
    const clan=window.OSRSClans?.get(slug);
    const host=document.getElementById('clanDashboard');
    if(!clan || !host){
      if(host) host.innerHTML='<div class="panel panel-pad"><h1>Clan not found</h1><p class="muted">This clan profile is unavailable.</p></div>';
      return;
    }
    const profile=VTAM.currentProfile();
    const isMember=VTAM.profileBelongsToClan(profile,slug);
    const extras=(clan.extras||[]).filter(x=>x.label!=='Office' || isMember).map(x=>`<a class="tool-card" href="${VTAM.path(x.url)}"><h3>${OSRSClans.escapeHtml(x.label==='Office'?profile.office:x.label)}</h3><p>${OSRSClans.escapeHtml(x.description||'Clan-specific area.')}</p></a>`).join('');
    const officeCard=isMember?`<a class="tool-card" href="#dashboard/clan/office"><h3>${OSRSClans.escapeHtml(profile.office)}</h3><p>Your member workspace for ${OSRSClans.escapeHtml(clan.displayName)}${String(profile.rank).toLowerCase()==='owner'?' and local clan-feed settings':''}.</p></a>`:'';
    host.innerHTML=`
      <div class="panel panel-pad page-head">
        <div><div class="eyebrow">Clan Dashboard • Main</div><h1>${OSRSClans.escapeHtml(clan.displayName)}</h1><p>${OSRSClans.escapeHtml(clan.description)}</p></div>
        <div class="actions"><a class="btn primary" href="#dashboard/clan/ranks">Roster & Ranks</a><a class="btn" href="${'#dashboard/tools'}">Shared GE Tools</a></div>
      </div>
      <div class="grid grid-4">
        <div class="metric"><div class="metric-label">Members</div><div class="metric-value" id="vtamRosterCount">${Number(clan.memberCount)||'—'}</div></div>
        <div class="metric"><div class="metric-label">Roster Source</div><div class="metric-value info" style="font-size:14px" id="vtamRosterStatus">Loading…</div></div>
        <div class="metric"><div class="metric-label">Last Sync</div><div class="metric-value" style="font-size:14px" id="vtamRosterSynced">${OSRSClans.escapeHtml(formatTime(clan.lastSync))}</div></div>
        <div class="metric"><div class="metric-label">Clan</div><div class="metric-value accent">${OSRSClans.escapeHtml(clan.name)}</div></div>
      </div>
      <div class="grid grid-2">
        <article class="panel panel-pad">
          <div class="section-title"><h2>Clan Roster</h2><a class="btn" href="#dashboard/clan/ranks">Full Roster</a></div>
          <div class="table-wrap" style="margin-top:12px"><table class="table"><thead><tr><th>Member</th><th>Rank</th><th>Joined</th><th>Updated</th></tr></thead><tbody id="vtamRosterBody"><tr><td colspan="4"><div class="chat-empty"><strong>Loading clan roster…</strong></div></td></tr></tbody></table></div>
        </article>
        <article class="panel panel-pad">
          <div class="section-title"><h2>Clan Areas</h2></div>
          <div class="tool-grid" style="grid-template-columns:1fr 1fr;margin-top:12px">
            <a class="tool-card" href="#dashboard/clan/ranks"><h3>Ranks</h3><p>Clan hierarchy, promotion structure and current personnel.</p></a>
            ${extras}
            ${officeCard}
            <a class="tool-card" href="#dashboard/clan/vault"><h3>Vault</h3><p>Clan treasury, coffer value and local budget reference.</p></a>
          </div>
        </article>
      </div>
      <div class="grid grid-2">
        <article class="panel panel-pad"><div class="section-title"><h2>Recent Clan Activity</h2></div><div id="clanActivity" class="list" style="margin-top:12px"><div class="chat-empty"><strong>Loading shared activity…</strong></div></div></article>
        <article class="panel panel-pad"><div class="section-title"><h2>Shared OSRS Tools</h2></div><p class="muted">Market and account tools are shared across PixelB8 OSRS rather than duplicated inside every clan.</p><div class="actions" style="margin-top:12px"><a class="btn" href="${'#dashboard/tools'}">Tools</a><a class="btn" href="${'#dashboard/clan/main'}">All Clans</a></div></article>
      </div>`;
    renderActivity(slug);
  }
  return {render,renderActivity};
})();
