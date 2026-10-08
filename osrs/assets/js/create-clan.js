window.ClanCreator = (() => {
  const RANKS = ['Owner','Deputy Owner','Deputy','Councillor','Executive','Superior','Supervisor','Leader','Coordinator','Administrator','Moderator','Collector','Legacy','Legend','Rank 105','Rank 104','Cutpurse','Bandit','Assassin','Brigand','Thief','Rogue','Smuggler','Burglar','Scout','Skiller','Crew','Goon','Guest','Member'];
  const esc = value => String(value ?? '').replace(/[&<>'"]/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
  function memberRow(value='', rank='Member'){
    return `<div class="local-member-row form-row" data-local-member-row><div class="field" style="flex:1;min-width:180px"><label>RuneScape Name</label><input class="input" data-member-rsn maxlength="12" value="${esc(value)}" placeholder="Member RSN"></div><div class="field" style="min-width:180px"><label>Rank</label><select class="select" data-member-rank>${RANKS.filter(r=>r!=='Owner').map(r=>`<option value="${esc(r)}" ${r===rank?'selected':''}>${esc(r)}</option>`).join('')}</select></div><button class="btn ghost" type="button" data-remove-member style="align-self:flex-end">Remove</button></div>`;
  }
  function init(){
    const form=document.getElementById('createClanForm');
    if(!form)return;
    const profile=window.VTAM?.currentProfile?.();
    const name=document.getElementById('createClanName');
    const owner=document.getElementById('createClanOwner');
    const description=document.getElementById('createClanDescription');
    const status=document.getElementById('createClanStatus');
    const members=document.getElementById('createClanMembers');
    const addMember=document.getElementById('addClanMember');
    if(name && !name.value && profile?.clan) name.value=profile.clan;
    if(owner && !owner.value && profile?.rsn && !profile.unavailable) owner.value=profile.rsn;
    const show=(message,kind='info')=>{if(!status)return;status.hidden=false;status.className=`registration-status ${kind}`;status.textContent=message;};
    const add=()=>{if(members)members.insertAdjacentHTML('beforeend',memberRow());};
    addMember?.addEventListener('click',add);
    members?.addEventListener('click',event=>{const btn=event.target.closest('[data-remove-member]');if(btn)btn.closest('[data-local-member-row]')?.remove();});
    form.onsubmit=(event)=>{
      event.preventDefault();
      try{
        const seededRoster=[...(members?.querySelectorAll('[data-local-member-row]')||[])].map(row=>({
          rsn:String(row.querySelector('[data-member-rsn]')?.value||'').trim(),
          rank:String(row.querySelector('[data-member-rank]')?.value||'Member').trim()
        })).filter(x=>x.rsn);
        const clan=OSRSClans.createLocalClan({
          displayName:name.value.trim(),
          name:name.value.trim(),
          createdBy:owner.value.trim(),
          description:description.value.trim() || 'Local clan profile stored only in this browser.',
          seededRoster
        });
        show(`${clan.displayName} was created locally with ${clan.memberCount||0} seeded member${Number(clan.memberCount)===1?'':'s'}. Nothing was registered or uploaded to PixelB8.`, 'success');
        setTimeout(()=>{location.hash=`#clans/${encodeURIComponent(clan.slug)}`;},50);
      }catch(error){show(error.message||'Unable to create local clan.','error');}
    };
  }
  return {init};
})();
