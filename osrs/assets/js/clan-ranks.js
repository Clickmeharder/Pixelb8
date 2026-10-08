window.ClanRanks = (() => {
  const esc = v => window.OSRSClans.escapeHtml(v);
  function render(slug){
    const clan=window.OSRSClans?.get(slug);
    const host=document.getElementById('clanRanks');
    if(!clan || !host) return;
    const stages=(clan.membershipStages||[]).map((s,i)=>`<div class="rank-stage"><span class="rank-num">${String(i+1).padStart(2,'0')}</span><div><b>${esc(s.name)}</b><p>${esc(s.description)}</p></div></div>`).join('');
    const promo=(clan.promotionLine||[]).map((name,i)=>`${i?'<div class="promotion-arrow">↑</div>':''}<div class="promotion-step"><span class="rank-icon mask green">●</span><div><b>${esc(name)}</b></div></div>`).join('');
    const ranks=(clan.rankOrder||[]).map((name,i)=>`<div class="rank-card ${i===0?'ownership':'standard'}"><span class="rank-order">${i===0?'Owner':String(i).padStart(2,'0')}</span><b>${esc(name)}</b></div>`).join('');
    const responsibilities=(clan.responsibilities||[]).map(r=>`<div class="list-row"><span><b>${esc(r.name)}</b><br><small class="muted">${esc(r.description)}</small></span><span class="badge member">${esc(r.tag||'Role')}</span></div>`).join('');
    host.innerHTML=`
      <div class="panel panel-pad page-head"><div><div class="eyebrow">Clan Structure</div><h1>${esc(clan.displayName)} Ranks</h1><p>Rank structure and current personnel for ${esc(clan.displayName)}. The layout is shared across clans; the rank data comes from the clan record.</p></div></div>
      <div class="grid grid-2">
        <article class="panel panel-pad"><div class="section-title"><h2>Main Promotion Line</h2><span class="badge member">${(clan.promotionLine||[]).length} ranks</span></div><div class="promotion-track" style="margin-top:12px">${promo||'<p class="muted">No promotion line configured.</p>'}</div></article>
        <article class="panel panel-pad"><div class="section-title"><h2>Membership Stages</h2></div><div class="rank-stage-list">${stages||'<p class="muted">No membership stages configured.</p>'}</div></article>
      </div>
      <article class="panel panel-pad"><div class="section-title"><h2>Complete Rank Order</h2><span class="muted">Highest → Lowest</span></div><div class="rank-grid" style="margin-top:12px">${ranks}</div></article>
      <div class="grid grid-2"><article class="panel panel-pad"><div class="section-title"><h2>Role Notes</h2></div><div class="list" style="margin-top:12px">${responsibilities||'<p class="muted">No role notes configured.</p>'}</div></article><article class="panel panel-pad"><div class="section-title"><h2>Clan Information</h2></div><p class="muted">${esc(clan.description)}</p></article></div>
      <article class="panel panel-pad"><div class="section-title"><h2>Current Personnel</h2><button class="btn" id="vtamRosterRefresh">Refresh</button></div><div class="grid grid-3" style="margin-top:12px"><div class="metric"><div class="metric-label">Members</div><div class="metric-value" id="vtamRosterCount">—</div></div><div class="metric"><div class="metric-label">Last Roster Sync</div><div class="metric-value" style="font-size:14px" id="vtamRosterSynced">Not synced</div></div><div class="metric"><div class="metric-label">Source</div><div class="metric-value info" style="font-size:14px" id="vtamRosterStatus">Loading…</div></div></div><div class="table-wrap" style="margin-top:12px"><table class="table"><thead><tr><th>Member</th><th>Rank</th><th>Joined</th><th>Roster Updated</th></tr></thead><tbody id="vtamRosterBody"><tr><td colspan="4"><div class="chat-empty"><strong>Loading roster…</strong></div></td></tr></tbody></table></div></article>`;
    document.title=`${clan.displayName} — Ranks`;
  }
  return {render};
})();
