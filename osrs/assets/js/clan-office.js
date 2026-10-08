window.ClanOffice = (() => {
  function init(){
    "use strict";
    const TEMPLATE_REPO='https://github.com/Clickmeharder/pixelb8-clan-feed-cloudflare-template';
    const params=new URLSearchParams(location.search);
    const profile=VTAM.currentProfile();
    const clanId=String(VTAM.profileClanSlug(profile)||params.get('clan')||document.documentElement.dataset.clan||'').trim().toLowerCase();
    if(!clanId)return;

    const isMember=VTAM.profileBelongsToClan(profile,clanId);
    const isOwner=isMember&&String(profile.rank||'').trim().toLowerCase()==='owner';
    const memberPanel=document.getElementById('officeMemberPanel');
    const accessStatus=document.getElementById('officeAccessStatus');
    const officeTitle=document.getElementById('officeTitle');
    const officeIntro=document.getElementById('officeIntro');
    const feedManager=document.getElementById('officeClanFeedManager');
    const legacyUnlock=document.getElementById('officeUnlockPanel');
    const legacyManager=document.getElementById('officeKeyManager');
    const legacyStatus=document.getElementById('officeKeyStatus');
    [legacyUnlock,legacyManager,legacyStatus].forEach(x=>{if(x)x.remove()});

    const esc=v=>String(v??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
    if(!isMember){
      if(officeTitle)officeTitle.textContent='Clan Office';
      if(officeIntro)officeIntro.textContent='This office is available only to characters who belong to this clan.';
      if(accessStatus){accessStatus.hidden=false;accessStatus.className='registration-status error';accessStatus.textContent=`${profile.rsn} belongs to ${profile.clan||'another clan'}, not this clan.`}
      if(memberPanel)memberPanel.hidden=true;
      if(feedManager)feedManager.hidden=true;
      return;
    }

    if(officeTitle)officeTitle.textContent=`${profile.office} — ${profile.rsn}`;
    if(officeIntro)officeIntro.textContent=`${profile.rank} • ${profile.clan}`;
    if(memberPanel){
      memberPanel.hidden=false;
      memberPanel.innerHTML=`<div class="section-title"><h2>Member Office</h2><span class="badge ${esc(profile.badge||'member')}">${esc(profile.rank)}</span></div><p class="muted">Clan settings are browser-local. PixelB8 does not register this clan, store its keys, or maintain a hosted roster.</p>${isOwner?'<div class="callout" style="margin-top:12px">As Owner, you can configure the optional clan-owned Cloudflare feed below. Existing keys are kept locally and can be regenerated at any time.</div>':''}`;
    }
    if(!isOwner){if(feedManager)feedManager.hidden=true;return}
    if(!feedManager)return;
    feedManager.hidden=false;

    const CONFIG_KEY=`pixelb8_clan_feed_config:${clanId}`;
    const legacyViewerKey=`vtam_chat_viewer_code:${clanId}`;
    const legacyOwnerKey=`pixelb8_clan_owner_key:${clanId}`;

    function readConfig(){
      let saved={};
      try{saved=JSON.parse(localStorage.getItem(CONFIG_KEY)||'{}')||{}}catch(_){}
      const localFeed=window.OSRSClans?.getLocal?.(clanId)?.feed||{};
      const publisherKey=String(saved.publisherKey||localFeed.publisherKey||localStorage.getItem(legacyOwnerKey)||'').trim();
      const viewerCode=String(saved.viewerCode||localFeed.viewerCode||localStorage.getItem(legacyViewerKey)||'').trim();
      const workerUrl=String(saved.workerUrl||localFeed.workerUrl||'').trim();
      const viewerUrl=String(saved.viewerUrl||localFeed.viewerUrl||'').trim();
      const runeliteUrl=String(saved.runeliteUrl||localFeed.runeliteUrl||'').trim();
      return {publisherKey,viewerCode,workerUrl,viewerUrl,runeliteUrl};
    }
    function writeConfig(patch){
      const next={...readConfig(),...(patch||{})};
      localStorage.setItem(CONFIG_KEY,JSON.stringify(next));
      if(next.viewerCode)localStorage.setItem(legacyViewerKey,next.viewerCode);
      window.OSRSClans?.updateLocalClan?.(clanId,{feed:next});
      window.dispatchEvent(new CustomEvent('pixelb8-local-clan-feed-updated',{detail:{clanId}}));
      return next;
    }
    function secret(prefix,bytes=24){
      const data=new Uint8Array(bytes);crypto.getRandomValues(data);
      return `${prefix}_${Array.from(data,b=>b.toString(16).padStart(2,'0')).join('')}`;
    }
    function mask(v){if(!v)return'Not created';return v.length<=12?'•'.repeat(v.length):`${v.slice(0,6)}${'•'.repeat(20)}${v.slice(-6)}`}
    function normalizeWorker(value){
      const raw=String(value||'').trim();if(!raw)return{workerUrl:'',viewerUrl:'',runeliteUrl:''};
      let u;try{u=new URL(raw)}catch(_){throw new Error('Enter a valid Cloudflare Worker URL.')}
      if(!['https:','http:','wss:','ws:'].includes(u.protocol))throw new Error('Use an https:// or wss:// Worker URL.');
      const secure=u.protocol==='https:'||u.protocol==='wss:';
      return {workerUrl:`${secure?'https:':'http:'}//${u.host}`,viewerUrl:`${secure?'wss:':'ws:'}//${u.host}/viewer`,runeliteUrl:`${secure?'wss:':'ws:'}//${u.host}/runelite`};
    }
    function status(id,msg,kind='info'){const el=document.getElementById(id);if(!el)return;el.hidden=false;el.className=`registration-status ${kind}`;el.textContent=msg}

    const heading=feedManager.querySelector('h2');if(heading)heading.textContent='Clan-owned Feed';
    const intro=feedManager.querySelector('.section-title + p.muted');if(intro)intro.textContent='Optional realtime hosting runs in your own Cloudflare account. PixelB8 stores no server-side clan record, key, hash, roster, or feed credential.';
    const badge=document.getElementById('clanFeedHostingBadge');
    const feedUrl=document.getElementById('clanFeedWebSocketUrl');
    const deploy=document.getElementById('deployClanFeed');
    const hint=document.getElementById('deployClanFeedHint');
    if(hint)hint.textContent='Deploys the clan-feed template into your own Cloudflare account.';

    // Repurpose the viewer card and add a publisher card.
    const viewerCard=document.getElementById('clanFeedViewerAccess');
    if(viewerCard){
      const p=viewerCard.querySelector('p.muted');if(p)p.innerHTML='Stored only in this browser. Paste the same value into Cloudflare as <code>CLAN_VIEWER_KEY</code>.';
      const small=viewerCard.querySelector('small.muted');if(small)small.textContent='Share this code only with clan members who need hosted read-only feed access.';
      if(!document.getElementById('localFeedPublisherAccess')){
        const card=document.createElement('div');card.className='clan-key-card';card.id='localFeedPublisherAccess';card.style.marginTop='16px';
        card.innerHTML=`<div class="key-card-head"><div><div class="eyebrow">RuneLite Publisher</div><h3>Clan Feed Publisher Key</h3></div><span class="badge member" id="localPublisherBadge">Not created</span></div><p class="muted">Stored only in this browser. Use this same value in Cloudflare as <code>CLAN_FEED_KEY</code> and in VTAM Clan Hook.</p><div class="key-row"><input class="input verification-key" id="localPublisherKeyDisplay" readonly value="Not created"><button class="btn" id="toggleLocalPublisherKey" type="button" hidden>Show / Hide</button><button class="btn" id="copyLocalPublisherKey" type="button" hidden>Copy</button><button class="btn primary" id="generateLocalPublisherKey" type="button">Generate Key</button><button class="btn danger" id="regenerateLocalPublisherKey" type="button" hidden>Regenerate</button></div>`;
        viewerCard.parentNode.insertBefore(card,viewerCard);
      }
    }
    const field=feedUrl?.closest('.field');
    if(field){
      const label=field.querySelector('label');if(label)label.textContent='Cloudflare Worker URL';
      if(feedUrl)feedUrl.placeholder='https://your-clan-feed.workers.dev';
      const small=field.querySelector('small');if(small)small.innerHTML='Stored only in this browser. PixelB8 derives <code>/viewer</code> and <code>/runelite</code> URLs locally.';
      if(!document.getElementById('localRuneliteFeedUrl')){
        const row=document.createElement('div');row.className='field';row.style.marginTop='12px';row.innerHTML='<label>RuneLite Clan Feed WebSocket URL</label><div class="key-row"><input class="input" id="localRuneliteFeedUrl" readonly><button class="btn" id="copyLocalRuneliteFeedUrl" type="button">Copy</button></div>';
        field.insertAdjacentElement('afterend',row);
      }
    }

    // Cloudflare setup dialog remains, but is wholly user-owned.
    const dialog=document.getElementById('clanFeedSetupDialog');
    const deployUrl=`https://deploy.workers.cloudflare.com/?url=${encodeURIComponent(TEMPLATE_REPO)}`;
    const continueBtn=document.getElementById('continueClanFeedDeploy');
    const connectBtn=document.getElementById('connectGithubCloudflare');
    if(continueBtn)continueBtn.href=deployUrl;if(connectBtn)connectBtn.href=deployUrl;
    const repoPreview=document.getElementById('deployRepoNamePreview');
    if(repoPreview)repoPreview.textContent=`${clanId||'clan'}-feed-cloudflare-setup`.slice(0,100);
    deploy?.addEventListener('click',()=>dialog?.showModal?.());
    document.getElementById('closeClanFeedSetup')?.addEventListener('click',()=>dialog?.close());
    dialog?.addEventListener('click',e=>{if(e.target===dialog)dialog.close()});

    const publisherDisplay=document.getElementById('localPublisherKeyDisplay');
    const publisherBadge=document.getElementById('localPublisherBadge');
    const genPub=document.getElementById('generateLocalPublisherKey');
    const regenPub=document.getElementById('regenerateLocalPublisherKey');
    const copyPub=document.getElementById('copyLocalPublisherKey');
    const togglePub=document.getElementById('toggleLocalPublisherKey');
    const viewerDisplay=document.getElementById('viewerCodeDisplay');
    const viewerBadge=document.getElementById('viewerCodeBadge');
    const genViewer=document.getElementById('generateViewerCode');
    const regenViewer=document.getElementById('regenerateViewerCode');
    const copyViewer=document.getElementById('copyViewerCode');
    const toggleViewer=document.getElementById('toggleViewerCode');
    const runeliteDisplay=document.getElementById('localRuneliteFeedUrl');

    function render(){
      const c=readConfig();
      if(publisherDisplay){publisherDisplay.value=c.publisherKey?mask(c.publisherKey):'Not created';publisherDisplay.dataset.revealed='false'}
      if(publisherBadge){publisherBadge.textContent=c.publisherKey?'Ready':'Not created';publisherBadge.className=`badge ${c.publisherKey?'owner':'member'}`}
      if(genPub)genPub.hidden=!!c.publisherKey;if(regenPub)regenPub.hidden=!c.publisherKey;if(copyPub)copyPub.hidden=!c.publisherKey;if(togglePub)togglePub.hidden=!c.publisherKey;
      if(viewerDisplay){viewerDisplay.value=c.viewerCode?mask(c.viewerCode):'Not created';viewerDisplay.dataset.revealed='false'}
      if(viewerBadge){viewerBadge.textContent=c.viewerCode?'Ready':'Not created';viewerBadge.className=`badge ${c.viewerCode?'owner':'member'}`}
      if(genViewer)genViewer.hidden=!!c.viewerCode;if(regenViewer)regenViewer.hidden=!c.viewerCode;if(copyViewer)copyViewer.hidden=!c.viewerCode;if(toggleViewer)toggleViewer.hidden=!c.viewerCode;
      if(feedUrl)feedUrl.value=c.workerUrl||c.viewerUrl||'';
      if(runeliteDisplay)runeliteDisplay.value=c.runeliteUrl||'';
      if(badge){badge.textContent=c.viewerUrl?'Configured':'Not configured';badge.className=`badge ${c.viewerUrl?'owner':'member'}`}
      const clear=document.getElementById('clearClanFeedUrl');if(clear)clear.hidden=!c.viewerUrl;
    }

    genPub?.addEventListener('click',()=>{writeConfig({publisherKey:secret('feed',32)});render();status('clanFeedUrlStatus','Publisher key created locally. Update Cloudflare and RuneLite with this value.','success')});
    regenPub?.addEventListener('click',()=>{if(!confirm('Regenerate the Publisher Key? You must update Cloudflare and RuneLite afterward.'))return;writeConfig({publisherKey:secret('feed',32)});render();status('clanFeedUrlStatus','Publisher key regenerated locally.','success')});
    copyPub?.addEventListener('click',async()=>{const v=readConfig().publisherKey;if(v)await navigator.clipboard.writeText(v)});
    togglePub?.addEventListener('click',()=>{const v=readConfig().publisherKey;if(!v||!publisherDisplay)return;const shown=publisherDisplay.dataset.revealed==='true';publisherDisplay.value=shown?mask(v):v;publisherDisplay.dataset.revealed=shown?'false':'true'});

    genViewer?.addEventListener('click',()=>{const v=secret('viewer',24);writeConfig({viewerCode:v});render();status('viewerCodeStatus','Viewer Code created locally. Update CLAN_VIEWER_KEY in Cloudflare.','success')});
    regenViewer?.addEventListener('click',()=>{if(!confirm('Regenerate the Viewer Code? You must update Cloudflare and share the new code.'))return;const v=secret('viewer',24);writeConfig({viewerCode:v});render();status('viewerCodeStatus','Viewer Code regenerated locally.','success')});
    copyViewer?.addEventListener('click',async()=>{const v=readConfig().viewerCode;if(v)await navigator.clipboard.writeText(v)});
    toggleViewer?.addEventListener('click',()=>{const v=readConfig().viewerCode;if(!v||!viewerDisplay)return;const shown=viewerDisplay.dataset.revealed==='true';viewerDisplay.value=shown?mask(v):v;viewerDisplay.dataset.revealed=shown?'false':'true'});

    document.getElementById('saveClanFeedUrl')?.addEventListener('click',()=>{try{const urls=normalizeWorker(feedUrl?.value);if(!urls.viewerUrl)throw new Error('Enter the Cloudflare Worker URL first.');writeConfig(urls);render();status('clanFeedUrlStatus','Clan Feed URL saved locally.','success')}catch(e){status('clanFeedUrlStatus',e.message,'error')}});
    document.getElementById('clearClanFeedUrl')?.addEventListener('click',()=>{if(!confirm('Remove the saved Worker URL? Local keys will be kept.'))return;writeConfig({workerUrl:'',viewerUrl:'',runeliteUrl:''});render();status('clanFeedUrlStatus','Worker URL removed; local keys kept.','success')});
    document.getElementById('copyLocalRuneliteFeedUrl')?.addEventListener('click',async()=>{const v=readConfig().runeliteUrl;if(v)await navigator.clipboard.writeText(v)});

    // Persist any migrated legacy/local values immediately, without sending them anywhere.
    writeConfig(readConfig());
    render();
  }
  return {init};
})();
