const trackerOptionsStorageKey='entropia_tracker_options_v1';
const defaultTrackerOptions={
  mode:'auto',
  eventName:'Upcoming Legends',
  eventStartUtc:'2026-08-15T00:00',
  eventEndUtc:'2026-08-17T00:00',
  sessionHours:6,
  targets:['armax bull','atrax','caperon','neconu','hispidus','estophyl'],
  analysisLookback:'30',
  customLookbackDays:30,
  analysisStartUtc:'',
  analysisEndUtc:''
};
let trackerOptions={...defaultTrackerOptions,targets:[...defaultTrackerOptions.targets]};
let trackerEffectiveMode='event';
let targetMobs=['armax bull','atrax','caperon','neconu','hispidus','estophyl'];

const mobWaypoints={
  neconu:[
    "/wp [Calypso, 59206, 79652, 122, Neconu Young - Provider]",
    "/wp [Calypso, 59049, 79531, 106, Neconu - Guardian - Stalker]"
  ],
  hispidus:[
    "/wp [Calypso, 60532, 79305, 112, Hispidus- Alpha to Stalker]",
    "/wp [Calypso, 60403, 79273, 103, Hispidus- Mature to Alpha]"
  ],
  estophyl:[
    "/wp [Calypso, 60262, 79286, 104, Estophyl - Young to Guardian]",
    "/wp [Calypso, 60170, 79415, 120, Estopyhl - Guardian to Stalker]"
  ],
  'armax bull':[
    "/wp [Calypso, 60293, 79529, 120, Armax Bull - Young to Dominant]",
    "/wp [Calypso, 60423, 79656, 160, Armax Bull - Alpha to Stalker]"
  ],
  caperon:[
    "/wp [Calypso, 60291, 79706, 138, Caperon - Young to Provider]",
    "/wp [Calypso, 60166, 79753, 141, Caperon - Provider to Stalker]"
  ],
  atrax:[
    "/wp [Calypso, 58967, 79704, 111, Atrax Young - Provider]",
    "/wp [Calypso, 58982, 79905, 126, Atrax - Guardian - Stalker]"
  ]
};

let globalParsedData=null;
let allMobHourlyStats=new Array(24).fill(0);
let fileHandle=null;
let liveInterval=null;
let userAvatarName="";
window.userAvatarName=userAvatarName;
let firstUserGlobalTime=null;
let timerInterval=null;
let db=null;
let voiceAnnouncerEnabled=false;
let latestSyncedGameTime=null;
let lastTimeSyncTimestamp=0;

let liveSessionGlobals=0;
let liveSessionHofs=0;
let liveLargestLoot=0;
let liveLatestMob="—";
let liveAllMobGlobals=0;
let liveAllMobHofs=0;
let liveTargetFeedPed=0;
let liveAllMobFeedPed=0;

let userEventGlobalPed=0;
let userEventHofPed=0;
let userEventTotalLoot=0;
let cachedFileSize=0;
let cachedFileLastModified=0;
let cachedAnalysisSignature='';
let eventCountdownInterval=null;
let streamerModeEnabled=false;
let streamerHudInterval=null;
let streamerContextTargetPanel=null;
let streamerSlimHeadersEnabled=false;
let streamerDragState=null;
let streamerFloatingDragState=null;
const streamerLayoutStorageKey='entropia_streamer_layout_v1';
const streamerVisibilityStorageKey='entropia_streamer_visibility_v1';
const streamerMetricStorageKey='entropia_streamer_metrics_v1';
const streamerPresentationStorageKey='entropia_streamer_presentation_v1';
const streamerSlimHeadersStorageKey='entropia_streamer_slim_headers_v1';
const streamerThemeStorageKey='entropia_streamer_theme_v1';
const streamerFloatingPanelsStorageKey='entropia_streamer_floating_panels_v1';
const streamerNameStorageKey='entropia_streamer_display_name_v1';

const streamerPresentationDefaults={
  eventClock:{textScale:1,slimHeader:false},
  pilotStats:{textScale:1,slimHeader:false},
  globalTelemetry:{textScale:1,slimHeader:false},
  combatTelemetry:{textScale:1,slimHeader:false},
  recommendedHunt:{textScale:1,slimHeader:false},
  loadoutPanel:{textScale:1,slimHeader:false}
};

const streamerMetricDefaults={
  eventClock:{},
  recommendedHunt:{},
  globalTelemetry:{
    targetGlobals:true,
    targetHofs:true,
    targetValue:true,
    allGlobals:true,
    allHofs:true,
    allValue:true,
    personalGlobals:true,
    personalHofs:true,
    personalValue:true
  },
  combatTelemetry:{
    dps:true,
    damage:true,
    cost:true,
    profit:true,
    efficiency:true
  },
  pilotStats:{
    globals:true,
    hofs:true,
    loot:true
  },
  loadoutPanel:{
    name:true,
    weapon:true,
    efficiency:true,
    dpp:true,
    dps:true,
    cost:true,
    damage:true,
    apm:true,
    range:true,
    maxDamage:false
  }
};

let eventStart=new Date(Date.UTC(2026,7,15,0,0,0));
// Event runs through Aug 16 and ends at the following midnight.
let eventDeadline=new Date(Date.UTC(2026,7,17,0,0,0));
let eventEnd=new Date(eventDeadline.getTime()-1);
let latestSafeSixHourStart=new Date(eventDeadline.getTime()-(6*60*60*1000));

function initDB(){
  return new Promise((resolve,reject)=>{
    const request=indexedDB.open('EntropiaLogDB',5);
    request.onerror=()=>reject(request.error);
    request.onsuccess=()=>{db=request.result;resolve(db)};
    request.onupgradeneeded=e=>{
      const database=e.target.result;
      if(!database.objectStoreNames.contains('logs')){
        database.createObjectStore('logs',{keyPath:'id'});
      }
    };
  });
}

function saveFileHandleToIDB(handle){
  if(!db)return;
  const tx=db.transaction(['logs'],'readwrite');
  tx.objectStore('logs').put({id:'fileHandle',data:handle});
}

async function loadFileHandleFromIDB(){
  if(!db)await initDB();
  return new Promise(resolve=>{
    const tx=db.transaction(['logs'],'readonly');
    const req=tx.objectStore('logs').get('fileHandle');
    req.onsuccess=()=>resolve(req.result?req.result.data:null);
    req.onerror=()=>resolve(null);
  });
}

window.addEventListener('DOMContentLoaded',async()=>{
  const savedName=localStorage.getItem('entropia_avatar_name');
  if(savedName){
    userAvatarName=savedName.toLowerCase();
    window.userAvatarName=userAvatarName;
    document.getElementById('avatarNameInput').value=savedName;
  }
  const savedVoice=localStorage.getItem('entropia_voice_enabled');
  if(savedVoice==='true'){
    voiceAnnouncerEnabled=true;
    document.getElementById('voiceToggle').checked=true;
  }

  await initDB();
  const savedHandle=await loadFileHandleFromIDB();
  if(savedHandle)document.getElementById('resumeBtn').classList.remove('hidden');

  const cached=await loadParsedDataFromIDB();
  if(cached?.meta){
    cachedFileSize=cached.meta.size||0;
    cachedFileLastModified=cached.meta.lastModified||0;
    cachedAnalysisSignature=cached.meta.analysisSignature||'';
  }

  if(cached?.records?.length){
    globalParsedData=cached.records;
    if(cached.allStats)allMobHourlyStats=cached.allStats;
    setConnectionStatus(`Cached ${cached.records.length} records`,false);
    document.getElementById('fileStatus').textContent=
      `Restored ${cached.records.length} cached target-mob records instantly. ${cachedFileSize?`Last analyzed byte: ${cachedFileSize.toLocaleString()}.`:''}`;
    const latestRec=cached.records[cached.records.length-1];
    if(latestRec?.date){
      latestSyncedGameTime=latestRec.date;
      document.getElementById('syncGameTimeDisplay').textContent=formatDateTimeUTCish(latestRec.date);
    }
    updateAnalyticsDisplay();
    updateScheduleDisplay();
    evaluateUserGlobals();
  }else{
    renderAnalyticsCards({});
    updateScheduleDisplay();
  }

  loadTrackerOptions();
  startEventCountdowns();

  const streamerParam=new URLSearchParams(location.search).get('streamer');
  const savedStreamer=localStorage.getItem('entropia_streamer_mode');
  if(streamerParam==='1'||streamerParam==='true'||savedStreamer==='true'){
    setStreamerMode(true);
  }else{
    syncStreamerHud();
  }

  // If a persisted file handle exists and permission is already available,
  // only ingest bytes appended since the cached file position.
  if(savedHandle){
    try{
      const permission=await savedHandle.queryPermission({mode:'read'});
      if(permission==='granted'){
        fileHandle=savedHandle;
        await processFileHandleIncremental(fileHandle);
      }
    }catch(err){
      console.log('Automatic incremental resume unavailable:',err);
    }
  }
});


function getConfiguredLookbackDays(){
  const raw=trackerOptions?.analysisLookback??'30';
  if(raw==='all')return null;
  if(raw==='custom'){
    return Math.max(1,Math.min(3650,Number(trackerOptions?.customLookbackDays)||30));
  }
  const days=Number(raw);
  return Number.isFinite(days)&&days>0?days:30;
}

function getAnalysisReadCutoff(referenceDate=new Date()){
  const days=getConfiguredLookbackDays();
  if(days===null)return null;

  const cutoff=new Date(referenceDate.getTime()-(days*24*60*60*1000));
  const explicitStart=trackerOptions?.analysisStartUtc
    ?utcInputToDate(trackerOptions.analysisStartUtc)
    :null;

  // An explicit From date may narrow the loaded range, but never expands
  // beyond the user's Analyze Back limit.
  if(explicitStart && explicitStart>cutoff)return explicitStart;
  return cutoff;
}

function getAnalysisCacheSignature(){
  const targets=(trackerOptions?.targets||[])
    .map(v=>String(v||'').trim().toLowerCase())
    .filter(Boolean)
    .slice(0,6)
    .sort();

  return JSON.stringify({
    lookback:trackerOptions?.analysisLookback??'30',
    customDays:Number(trackerOptions?.customLookbackDays)||30,
    analysisStartUtc:trackerOptions?.analysisStartUtc||'',
    targets
  });
}

function describeAnalysisLookback(){
  const days=getConfiguredLookbackDays();
  if(days===null)return 'all history';
  if(days===1)return 'last 24 hours';
  return `last ${days} days`;
}

function utcInputToDate(value){
  if(!value)return null;
  return new Date(`${value}:00Z`);
}

function dateToUtcInput(date){
  if(!(date instanceof Date)||Number.isNaN(date.getTime()))return '';
  return date.toISOString().slice(0,16);
}

function loadTrackerOptions(){
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(trackerOptionsStorageKey)||'{}')}catch{}
  trackerOptions={
    ...defaultTrackerOptions,
    ...saved,
    targets:Array.isArray(saved.targets)&&saved.targets.length
      ?saved.targets.slice(0,6)
      :[...defaultTrackerOptions.targets]
  };
  applyTrackerOptions();
}

function resolveTrackerEffectiveMode(now=new Date()){
  if(trackerOptions.mode==='event')return 'event';
  if(trackerOptions.mode==='casual')return 'casual';

  const start=utcInputToDate(trackerOptions.eventStartUtc);
  const end=utcInputToDate(trackerOptions.eventEndUtc);

  // Auto enters Event Mode during the configured window.
  // Before or after it, the tracker is a normal casual tracker.
  if(start&&end&&now>=start&&now<end)return 'event';
  return 'casual';
}

function applyTrackerOptions(){
  const start=utcInputToDate(trackerOptions.eventStartUtc)||new Date(Date.UTC(2026,7,15,0,0,0));
  const end=utcInputToDate(trackerOptions.eventEndUtc)||new Date(Date.UTC(2026,7,17,0,0,0));
  const sessionHours=Math.max(.25,Number(trackerOptions.sessionHours)||6);

  eventStart=start;
  eventDeadline=end;
  eventEnd=new Date(end.getTime()-1);
  latestSafeSixHourStart=new Date(end.getTime()-(sessionHours*60*60*1000));

  targetMobs=(trackerOptions.targets||[])
    .map(v=>String(v||'').trim().toLowerCase())
    .filter(Boolean)
    .slice(0,6);

  if(!targetMobs.length)targetMobs=[...defaultTrackerOptions.targets];

  trackerEffectiveMode=resolveTrackerEffectiveMode();

  document.body.classList.toggle('casual-mode',trackerEffectiveMode==='casual');
  document.body.classList.toggle('event-mode',trackerEffectiveMode==='event');

  const modeBtn=document.getElementById('trackerModeBtn');
  if(modeBtn){
    const label=modeBtn.querySelector('.sidebar-item-text');
    if(label){
      label.textContent=trackerEffectiveMode==='event'
        ?(trackerOptions.eventName||'Event')
        :'Casual Mode';
    }
    modeBtn.title=`Tracker configuration · ${trackerEffectiveMode==='event'?(trackerOptions.eventName||'Event'):'Casual Mode'} · ${describeAnalysisLookback()}`;
  }

  const subtitle=document.getElementById('appModeSubtitle');
  if(subtitle){
    subtitle.textContent=trackerEffectiveMode==='event'
      ?`${trackerOptions.eventName||'Event'} · live telemetry · event analytics · streamer HUD`
      :'Casual hunting · live telemetry · custom target analytics · streamer HUD';
  }

  const scheduleTitle=document.getElementById('eventScheduleTitleText');
  if(scheduleTitle){
    scheduleTitle.textContent=trackerEffectiveMode==='event'
      ?`${trackerOptions.eventName||'Event'} · Event Schedule`
      :'Custom Target Analytics';
  }

  const sessionLabel=document.getElementById('sessionWindowLabel');
  if(sessionLabel)sessionLabel.textContent=`${Number.isInteger(sessionHours)?sessionHours:sessionHours}h Window`;

  const latestLabel=document.getElementById('latestStartLabel');
  if(latestLabel)latestLabel.textContent=`Latest ${Number.isInteger(sessionHours)?sessionHours:sessionHours}h Start In`;

  startEventCountdowns?.();
  updateScheduleDisplay?.();
  evaluateUserGlobals?.();
}

function openTrackerOptions(){
  const backdrop=document.getElementById('trackerOptionsBackdrop');
  if(!backdrop)return;

  document.getElementById('trackerModeSelect').value=trackerOptions.mode;
  document.getElementById('eventNameInput').value=trackerOptions.eventName||'Upcoming Legends';
  document.getElementById('eventStartInput').value=trackerOptions.eventStartUtc||'';
  document.getElementById('eventEndInput').value=trackerOptions.eventEndUtc||'';
  document.getElementById('sessionHoursInput').value=trackerOptions.sessionHours||6;
  document.getElementById('analysisLookbackSelect').value=trackerOptions.analysisLookback||'30';
  document.getElementById('customLookbackDaysInput').value=trackerOptions.customLookbackDays||30;
  toggleCustomLookback();
  document.getElementById('analysisStartInput').value=trackerOptions.analysisStartUtc||'';
  document.getElementById('analysisEndInput').value=trackerOptions.analysisEndUtc||'';

  const targetInputs=[...document.querySelectorAll('.target-mob-input')];
  targetInputs.forEach((el,i)=>el.value=trackerOptions.targets?.[i]||'');

  previewTrackerModeOptions();
  backdrop.classList.remove('hidden');
}

function closeTrackerOptions(event){
  if(event&&event.target!==document.getElementById('trackerOptionsBackdrop'))return;
  document.getElementById('trackerOptionsBackdrop')?.classList.add('hidden');
}

function toggleCustomLookback(){
  const select=document.getElementById('analysisLookbackSelect');
  const custom=document.getElementById('customLookbackField');
  if(custom)custom.classList.toggle('hidden',select?.value!=='custom');
}

function previewTrackerModeOptions(){
  const mode=document.getElementById('trackerModeSelect')?.value||'auto';
  const start=utcInputToDate(document.getElementById('eventStartInput')?.value);
  const end=utcInputToDate(document.getElementById('eventEndInput')?.value);
  let effective=mode;

  if(mode==='auto'){
    const now=new Date();
    effective=(start&&end&&now>=start&&now<end)?'event':'casual';
  }

  const preview=document.getElementById('effectiveModePreview');
  if(preview)preview.textContent=effective.toUpperCase();

  const reason=document.getElementById('modePreviewReason');
  if(reason){
    reason.textContent=mode==='auto'
      ?'Auto uses Event Mode only while the configured event window is active; otherwise the tracker stays fully usable in Casual Mode.'
      :mode==='event'
        ?'Event Mode forces event timers, session rules and event-window totals on.'
        :'Casual Mode keeps live tracking active and lets you analyze any selected 1–6 mobs.';
  }

  const eventSection=document.getElementById('eventOptionsSection');
  if(eventSection)eventSection.style.opacity=mode==='casual'?'.72':'1';
}

function saveTrackerOptions(runAnalysis=false){
  const targets=[...document.querySelectorAll('.target-mob-input')]
    .map(el=>el.value.trim())
    .filter(Boolean)
    .slice(0,6);

  if(!targets.length){
    showToast?.('Choose at least one target mob.');
    return;
  }

  trackerOptions={
    mode:document.getElementById('trackerModeSelect')?.value||'auto',
    eventName:(document.getElementById('eventNameInput')?.value||'Upcoming Legends').trim(),
    eventStartUtc:document.getElementById('eventStartInput')?.value||'',
    eventEndUtc:document.getElementById('eventEndInput')?.value||'',
    sessionHours:Math.max(.25,Number(document.getElementById('sessionHoursInput')?.value)||6),
    targets:targets.map(v=>v.toLowerCase()),
    analysisLookback:document.getElementById('analysisLookbackSelect')?.value||'30',
    customLookbackDays:Math.max(1,Math.min(3650,Number(document.getElementById('customLookbackDaysInput')?.value)||30)),
    analysisStartUtc:document.getElementById('analysisStartInput')?.value||'',
    analysisEndUtc:document.getElementById('analysisEndInput')?.value||''
  };

  localStorage.setItem(trackerOptionsStorageKey,JSON.stringify(trackerOptions));
  applyTrackerOptions();
  closeTrackerOptions();

  if(runAnalysis){
    if(fileHandle){
      processFileHandle(fileHandle);
      showToast?.(`Rebuilding ${describeAnalysisLookback()} for ${targetMobs.length} target${targetMobs.length===1?'':'s'}…`);
    }else{
      updateScheduleDisplay?.();
      updateAnalyticsDisplay?.();
      showToast?.(`Settings saved. Connect chat.log to analyze ${describeAnalysisLookback()}.`);
    }
  }
}

function resetTrackerOptions(){
  trackerOptions={...defaultTrackerOptions,targets:[...defaultTrackerOptions.targets]};
  localStorage.setItem(trackerOptionsStorageKey,JSON.stringify(trackerOptions));
  openTrackerOptions();
}

function syncObsModeButtonLabel(){
  const btn=document.getElementById('streamerModeBtn');
  if(!btn)return;

  const expanded=btn.querySelector('.obs-mode-expanded-label');
  const rail=btn.querySelector('.obs-mode-rail-label');

  if(expanded)expanded.textContent='OBS Mode';
  if(rail)rail.textContent='OBS';

  btn.title='OBS/browser-source HUD. Esc exits.';
}

function toggleStreamerMode(){
  setStreamerMode(!streamerModeEnabled);
  syncObsModeButtonLabel();
}

function setStreamerMode(enabled){
  streamerModeEnabled=!!enabled;
  document.body.classList.toggle('streamer-mode',streamerModeEnabled);
  document.documentElement.classList.toggle('streamer-mode',streamerModeEnabled);

  const btn=document.getElementById('streamerModeBtn');
  if(btn){
    btn.classList.toggle('active',streamerModeEnabled);
    syncObsModeButtonLabel();
  }

  const hud=document.getElementById('streamerHud');
  if(hud)hud.setAttribute('aria-hidden',streamerModeEnabled?'false':'true');

  localStorage.setItem('entropia_streamer_mode',streamerModeEnabled?'true':'false');

  if(streamerHudInterval)clearInterval(streamerHudInterval);
  if(streamerModeEnabled){
    initializeStreamerWorkspace();
    restoreStreamerLayout();
    restoreStreamerVisibility();
    buildStreamerPanelManager();
    applyStreamerMetricConfig();
    applyStreamerPresentationConfig();
    restoreStreamerSlimHeadersState();
    applyStreamerTheme();
    initializeStreamerFloatingWindows();
    bindStreamerSourcePanel();
    syncStreamerHud();
    streamerHudInterval=setInterval(syncStreamerHud,500);
  }else{
    closeStreamerContextMenu();
    closeStreamerPanelManager();
    closeStreamerAdvancedPanel();
    closeStreamerAppearancePanel();
    document.body.classList.remove('streamer-slim-headers');
  }
  syncObsModeButtonLabel();
}

function getStreamerPanels(){
  return [...document.querySelectorAll('#streamerHud .hud-panel[data-panel-id]')];
}

function initializeStreamerWorkspace(){
  const hud=document.getElementById('streamerHud');
  if(!hud)return;

  getStreamerPanels().forEach(panel=>{
    if(!panel.querySelector('.streamer-resize-hint')){
      const hint=document.createElement('div');
      hint.className='streamer-resize-hint';
      hint.textContent='↘';
      panel.appendChild(hint);
    }

    const title=panel.querySelector('.hud-title');
    if(title && !title.dataset.dragBound){
      title.dataset.dragBound='1';
      title.addEventListener('pointerdown',e=>beginStreamerPanelDrag(e,panel));
    }

    if(!panel.dataset.resizeBound){
      panel.dataset.resizeBound='1';
      const observer=new ResizeObserver(()=>saveStreamerLayout());
      observer.observe(panel);
    }
  });
}

function beginStreamerPanelDrag(e,panel){
  if(e.button!==0)return;
  if(!streamerModeEnabled)return;

  e.preventDefault();

  const shell=document.querySelector('.streamer-hud-shell');
  if(!shell)return;

  const panelRect=panel.getBoundingClientRect();
  const shellRect=shell.getBoundingClientRect();

  // Convert any right/bottom/transform based defaults to explicit left/top
  // the first time a panel is dragged.
  const left=panelRect.left-shellRect.left;
  const top=panelRect.top-shellRect.top;

  panel.style.left=`${left}px`;
  panel.style.top=`${top}px`;
  panel.style.right='auto';
  panel.style.bottom='auto';
  panel.style.transform='none';

  streamerDragState={
    panel,
    shell,
    shellRect,
    offsetX:e.clientX-panelRect.left,
    offsetY:e.clientY-panelRect.top
  };

  panel.classList.add('dragging');
  panel.setPointerCapture?.(e.pointerId);

  window.addEventListener('pointermove',moveStreamerPanel);
  window.addEventListener('pointerup',endStreamerPanelDrag,{once:true});
}

function moveStreamerPanel(e){
  if(!streamerDragState)return;

  const {panel,shellRect,offsetX,offsetY}=streamerDragState;
  const rect=panel.getBoundingClientRect();

  let left=e.clientX-shellRect.left-offsetX;
  let top=e.clientY-shellRect.top-offsetY;

  const maxLeft=Math.max(0,shellRect.width-rect.width);
  const maxTop=Math.max(0,shellRect.height-rect.height);

  left=Math.max(0,Math.min(maxLeft,left));
  top=Math.max(0,Math.min(maxTop,top));

  panel.style.left=`${left}px`;
  panel.style.top=`${top}px`;
}

function endStreamerPanelDrag(){
  if(!streamerDragState)return;
  streamerDragState.panel.classList.remove('dragging');
  streamerDragState=null;
  window.removeEventListener('pointermove',moveStreamerPanel);
  saveStreamerLayout();
}

function saveStreamerLayout(){
  if(!streamerModeEnabled)return;

  const shell=document.querySelector('.streamer-hud-shell');
  if(!shell)return;
  const shellRect=shell.getBoundingClientRect();

  const layout={};
  getStreamerPanels().forEach(panel=>{
    const rect=panel.getBoundingClientRect();
    layout[panel.dataset.panelId]={
      left:rect.left-shellRect.left,
      top:rect.top-shellRect.top,
      width:rect.width,
      height:rect.height
    };
  });

  localStorage.setItem(streamerLayoutStorageKey,JSON.stringify(layout));
}

function restoreStreamerLayout(){
  const raw=localStorage.getItem(streamerLayoutStorageKey);
  if(!raw)return;

  let layout;
  try{layout=JSON.parse(raw)}catch{return}

  const shell=document.querySelector('.streamer-hud-shell');
  if(!shell)return;

  const shellRect=shell.getBoundingClientRect();

  getStreamerPanels().forEach(panel=>{
    const saved=layout[panel.dataset.panelId];
    if(!saved)return;

    const width=Math.max(220,Math.min(saved.width||panel.offsetWidth,shellRect.width));
    const height=Math.max(110,Math.min(saved.height||panel.offsetHeight,shellRect.height));
    const left=Math.max(0,Math.min(saved.left||0,shellRect.width-width));
    const top=Math.max(0,Math.min(saved.top||0,shellRect.height-height));

    panel.style.left=`${left}px`;
    panel.style.top=`${top}px`;
    panel.style.width=`${width}px`;
    panel.style.height=`${height}px`;
    panel.style.right='auto';
    panel.style.bottom='auto';
    panel.style.transform='none';
  });
}

function resetStreamerLayout(){
  localStorage.removeItem(streamerLayoutStorageKey);

  getStreamerPanels().forEach(panel=>{
    panel.style.left='';
    panel.style.top='';
    panel.style.right='';
    panel.style.bottom='';
    panel.style.width='';
    panel.style.height='';
    panel.style.transform='';
  });

  closeStreamerContextMenu();
}

function getStreamerVisibility(){
  try{
    return JSON.parse(localStorage.getItem(streamerVisibilityStorageKey)||'{}');
  }catch{
    return {};
  }
}

function saveStreamerVisibility(){
  const visibility={};
  getStreamerPanels().forEach(panel=>{
    visibility[panel.dataset.panelId]=!panel.classList.contains('hidden-by-user');
  });
  localStorage.setItem(streamerVisibilityStorageKey,JSON.stringify(visibility));
}

function restoreStreamerVisibility(){
  const visibility=getStreamerVisibility();
  getStreamerPanels().forEach(panel=>{
    const panelId=panel.dataset.panelId;
    const hasSavedPreference=Object.prototype.hasOwnProperty.call(visibility,panelId);
    const visible=hasSavedPreference
      ?visibility[panelId]!==false
      :!['parsingSource','teamControl','teamTotals','teamMembers','loadoutPanel'].includes(panelId);
    panel.classList.toggle('hidden-by-user',!visible);
  });
}

function setStreamerPanelVisible(panelId,visible){
  const panel=document.querySelector(`#streamerHud .hud-panel[data-panel-id="${panelId}"]`);
  if(!panel)return;
  panel.classList.toggle('hidden-by-user',!visible);
  saveStreamerVisibility();
  buildStreamerPanelManager();
}

function hideStreamerPanel(panel){
  if(!panel)return;
  setStreamerPanelVisible(panel.dataset.panelId,false);
  closeStreamerContextMenu();
}

function showAllStreamerPanels(){
  getStreamerPanels().forEach(panel=>panel.classList.remove('hidden-by-user'));
  saveStreamerVisibility();
  buildStreamerPanelManager();
}

function buildStreamerPanelManager(){
  const list=document.getElementById('streamerPanelList');
  if(!list)return;

  list.innerHTML='';
  getStreamerPanels().forEach(panel=>{
    const row=document.createElement('div');
    row.className='streamer-panel-row';

    const label=document.createElement('label');
    const checkbox=document.createElement('input');
    checkbox.type='checkbox';
    checkbox.checked=!panel.classList.contains('hidden-by-user');
    checkbox.addEventListener('change',()=>setStreamerPanelVisible(panel.dataset.panelId,checkbox.checked));

    const text=document.createElement('span');
    text.textContent=panel.dataset.panelName||panel.dataset.panelId;

    label.append(checkbox,text);

    const main=document.createElement('div');
    main.className='streamer-panel-row-main';
    main.appendChild(label);

    if(streamerMetricDefaults[panel.dataset.panelId]){
      const advanced=document.createElement('button');
      advanced.className='streamer-panel-config-btn';
      advanced.textContent='⚙';
      advanced.title='Advanced panel options';
      advanced.addEventListener('click',()=>{
        openStreamerAdvancedPanel(panel.dataset.panelId);
      });
      main.appendChild(advanced);
    }

    row.appendChild(main);
    list.appendChild(row);
  });
}

function hexToRgbTuple(hex){
  const value=(hex||'').replace('#','');
  const full=value.length===3?value.split('').map(c=>c+c).join(''):value;
  if(!/^[0-9a-f]{6}$/i.test(full))return [5,16,27];
  return [
    parseInt(full.slice(0,2),16),
    parseInt(full.slice(2,4),16),
    parseInt(full.slice(4,6),16)
  ];
}

function lightenHex(hex,amount=.25){
  const [r,g,b]=hexToRgbTuple(hex);
  const mix=v=>Math.round(v+(255-v)*amount);
  return '#'+[mix(r),mix(g),mix(b)].map(v=>v.toString(16).padStart(2,'0')).join('');
}

function getStreamerTheme(){
  try{
    return {
      accent:'#35c2ff',
      bg:'#05101b',
      opacity:.80,
      scanline:true,
      ...JSON.parse(localStorage.getItem(streamerThemeStorageKey)||'{}')
    };
  }catch{
    return {accent:'#35c2ff',bg:'#05101b',opacity:.80,scanline:true};
  }
}

function applyStreamerTheme(theme=getStreamerTheme()){
  const hud=document.getElementById('streamerHud');
  if(!hud)return;
  const [r,g,b]=hexToRgbTuple(theme.bg);
  hud.style.setProperty('--stream-accent',theme.accent);
  hud.style.setProperty('--stream-accent2',lightenHex(theme.accent,.36));
  hud.style.setProperty('--stream-panel-bg',`${r},${g},${b}`);
  hud.style.setProperty('--stream-panel-opacity',String(theme.opacity));
  hud.classList.toggle('scanline-disabled',theme.scanline===false);

  const accent=document.getElementById('streamAccentColor');
  const bg=document.getElementById('streamBgColor');
  const opacity=document.getElementById('streamBgOpacity');
  const opacityValue=document.getElementById('streamBgOpacityValue');
  const scanline=document.getElementById('streamScanlineToggle');
  if(accent)accent.value=theme.accent;
  if(bg)bg.value=theme.bg;
  if(opacity)opacity.value=String(Math.round(theme.opacity*100));
  if(opacityValue)opacityValue.textContent=`${Math.round(theme.opacity*100)}%`;
  if(scanline)scanline.checked=theme.scanline!==false;
}

function updateStreamerThemeFromControls(){
  const accent=document.getElementById('streamAccentColor')?.value||'#35c2ff';
  const bg=document.getElementById('streamBgColor')?.value||'#05101b';
  const opacity=Math.max(.1,Math.min(1,(Number(document.getElementById('streamBgOpacity')?.value)||80)/100));
  const scanline=document.getElementById('streamScanlineToggle')?.checked!==false;
  const theme={accent,bg,opacity,scanline};
  localStorage.setItem(streamerThemeStorageKey,JSON.stringify(theme));
  applyStreamerTheme(theme);
}

function resetStreamerTheme(){
  localStorage.removeItem(streamerThemeStorageKey);
  applyStreamerTheme({accent:'#35c2ff',bg:'#05101b',opacity:.80,scanline:true});
}

function openStreamerAppearancePanel(){
  applyStreamerTheme();
  document.getElementById('streamerAppearancePanel')?.classList.add('show');
  closeStreamerContextMenu();
}

function closeStreamerAppearancePanel(){
  document.getElementById('streamerAppearancePanel')?.classList.remove('show');
}

function initializeStreamerFloatingWindows(){
  const map={
    panelManager:'streamerPanelManager',
    advanced:'streamerAdvancedPanel',
    appearance:'streamerAppearancePanel'
  };

  document.querySelectorAll('[data-floating-drag-handle]').forEach(handle=>{
    if(handle.dataset.dragReady)return;
    handle.dataset.dragReady='1';
    handle.addEventListener('pointerdown',e=>{
      if(e.button!==0 || e.target.closest('button,input,label'))return;
      const key=handle.dataset.floatingDragHandle;
      const el=document.getElementById(map[key]);
      if(!el)return;
      const rect=el.getBoundingClientRect();
      el.style.left=`${rect.left}px`;
      el.style.top=`${rect.top}px`;
      el.style.right='auto';
      streamerFloatingDragState={
        key,el,
        offsetX:e.clientX-rect.left,
        offsetY:e.clientY-rect.top
      };
      handle.setPointerCapture?.(e.pointerId);
      window.addEventListener('pointermove',moveStreamerFloatingWindow);
      window.addEventListener('pointerup',endStreamerFloatingWindow,{once:true});
      e.preventDefault();
    });
  });

  restoreStreamerFloatingWindows();
}

function moveStreamerFloatingWindow(e){
  if(!streamerFloatingDragState)return;
  const {el,offsetX,offsetY}=streamerFloatingDragState;
  const rect=el.getBoundingClientRect();
  const left=Math.max(6,Math.min(window.innerWidth-rect.width-6,e.clientX-offsetX));
  const top=Math.max(6,Math.min(window.innerHeight-rect.height-6,e.clientY-offsetY));
  el.style.left=`${left}px`;
  el.style.top=`${top}px`;
}

function endStreamerFloatingWindow(){
  if(!streamerFloatingDragState)return;
  streamerFloatingDragState=null;
  window.removeEventListener('pointermove',moveStreamerFloatingWindow);
  saveStreamerFloatingWindows();
}

function saveStreamerFloatingWindows(){
  const ids={
    panelManager:'streamerPanelManager',
    advanced:'streamerAdvancedPanel',
    appearance:'streamerAppearancePanel'
  };
  const out={};
  Object.entries(ids).forEach(([key,id])=>{
    const el=document.getElementById(id);
    if(!el)return;
    const rect=el.getBoundingClientRect();
    out[key]={left:rect.left,top:rect.top};
  });
  localStorage.setItem(streamerFloatingPanelsStorageKey,JSON.stringify(out));
}

function restoreStreamerFloatingWindows(){
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(streamerFloatingPanelsStorageKey)||'{}')}catch{}
  const ids={
    panelManager:'streamerPanelManager',
    advanced:'streamerAdvancedPanel',
    appearance:'streamerAppearancePanel'
  };
  Object.entries(saved).forEach(([key,pos])=>{
    const el=document.getElementById(ids[key]);
    if(!el||!pos)return;
    el.style.left=`${Math.max(6,Math.min(window.innerWidth-80,pos.left||0))}px`;
    el.style.top=`${Math.max(6,Math.min(window.innerHeight-40,pos.top||0))}px`;
    el.style.right='auto';
  });
}

function getStreamerPresentationConfig(){
  let stored={};
  try{
    stored=JSON.parse(localStorage.getItem(streamerPresentationStorageKey)||'{}');
  }catch{
    stored={};
  }

  const merged={};
  Object.entries(streamerPresentationDefaults).forEach(([panelId,defaults])=>{
    merged[panelId]={...defaults,...(stored[panelId]||{})};
  });
  return merged;
}

function saveStreamerPresentationConfig(config){
  localStorage.setItem(streamerPresentationStorageKey,JSON.stringify(config));
  applyStreamerPresentationConfig();
}

function setStreamerPanelTextScale(panelId,value){
  const config=getStreamerPresentationConfig();
  if(!config[panelId])config[panelId]={};
  config[panelId].textScale=Math.max(.65,Math.min(1.6,Number(value)||1));
  saveStreamerPresentationConfig(config);
}

function applyStreamerPresentationConfig(){
  const config=getStreamerPresentationConfig();
  getStreamerPanels().forEach(panel=>{
    const panelConfig=config[panel.dataset.panelId]||{};
    const scale=panelConfig.textScale ?? 1;
    panel.style.setProperty('--panel-text-scale',scale);
    panel.classList.toggle('slim-header-enabled',panelConfig.slimHeader===true);
  });
}

function setStreamerPanelSlimHeader(panelId,enabled){
  const config=getStreamerPresentationConfig();
  if(!config[panelId])config[panelId]={};
  config[panelId].slimHeader=!!enabled;
  saveStreamerPresentationConfig(config);
}

function setStreamerSlimHeadersEnabled(enabled){
  streamerSlimHeadersEnabled=!!enabled;
  document.body.classList.toggle('streamer-slim-headers',streamerSlimHeadersEnabled);
  localStorage.setItem(streamerSlimHeadersStorageKey,streamerSlimHeadersEnabled?'true':'false');

  const item=document.getElementById('streamerSlimHeadersItem');
  if(item){
    item.textContent=streamerSlimHeadersEnabled
      ?'▱ Disable Slim Headers'
      :'▰ Enable Slim Headers';
  }
}

function restoreStreamerSlimHeadersState(){
  const saved=localStorage.getItem(streamerSlimHeadersStorageKey);
  setStreamerSlimHeadersEnabled(saved==='true');
}

function getStreamerMetricConfig(){
  let stored={};
  try{
    stored=JSON.parse(localStorage.getItem(streamerMetricStorageKey)||'{}');
  }catch{
    stored={};
  }

  const merged={};
  Object.entries(streamerMetricDefaults).forEach(([panelId,defaults])=>{
    merged[panelId]={...defaults,...(stored[panelId]||{})};
  });
  return merged;
}

function saveStreamerMetricConfig(config){
  localStorage.setItem(streamerMetricStorageKey,JSON.stringify(config));
  applyStreamerMetricConfig();
}

function applyStreamerMetricConfig(){
  const config=getStreamerMetricConfig();

  Object.entries(config).forEach(([panelId,metrics])=>{
    const panel=document.querySelector(`#streamerHud .hud-panel[data-panel-id="${panelId}"]`);
    if(!panel)return;

    if(panelId==='pilotStats'){
      const gaugeMap={
        globals:'streamGlobalGauge',
        hofs:'streamHofGauge',
        loot:'streamLootGauge'
      };
      Object.entries(gaugeMap).forEach(([metric,id])=>{
        const el=document.getElementById(id);
        if(el)el.classList.toggle('hud-metric-hidden',metrics[metric]===false);
      });
      return;
    }

    Object.entries(metrics).forEach(([metric,visible])=>{
      const el=panel.querySelector(`[data-metric="${metric}"]`);
      if(el)el.classList.toggle('hud-metric-hidden',visible===false);
    });
  });
}

function setStreamerMetric(panelId,metric,visible){
  const config=getStreamerMetricConfig();
  if(!config[panelId])config[panelId]={};
  config[panelId][metric]=visible;
  saveStreamerMetricConfig(config);
}

function advancedPanelDefinition(panelId){
  if(panelId==='eventClock'){
    return {
      title:'Event Clock Options',
      sections:[]
    };
  }

  if(panelId==='recommendedHunt'){
    return {
      title:'Recommended Hunt Options',
      sections:[]
    };
  }

  if(panelId==='globalTelemetry'){
    return {
      title:'Global Telemetry Options',
      sections:[
        {
          title:'Target Mobs',
          items:[
            ['targetGlobals','Globals'],
            ['targetHofs','HOFs'],
            ['targetValue','Total PED']
          ]
        },
        {
          title:'All Mobs',
          items:[
            ['allGlobals','Globals'],
            ['allHofs','HOFs'],
            ['allValue','Total PED']
          ]
        },
        {
          title:'Personal',
          items:[
            ['personalGlobals','My Globals'],
            ['personalHofs','My HOFs'],
            ['personalValue','My Loot']
          ],
          note:'The telemetry metrics automatically flex and wrap with the panel size. Make the panel wide for a single row, narrow for a single column, or resize it into layouts such as 3×3.'
        }
      ]
    };
  }

  if(panelId==='combatTelemetry'){
    return {
      title:'Combat Telemetry Options',
      sections:[
        {
          title:'Visible Metrics',
          items:[
            ['dps','DPS'],
            ['damage','Damage'],
            ['cost','Cost'],
            ['profit','Profit / Loss'],
            ['efficiency','Efficiency']
          ],
          note:'These are display slots for now. We can wire real combat values into them later.'
        }
      ]
    };
  }

  if(panelId==='pilotStats'){
    return {
      title:'Pilot Event Stats Options',
      sections:[
        {
          title:'Heads-Up Gauges',
          items:[
            ['globals','Globals Gauge'],
            ['hofs','HOF Gauge'],
            ['loot','Loot Gauge']
          ],
          note:'This is the first pass. We can expand the big HUD with more selectable gauge types later.'
        }
      ]
    };
  }

  if(panelId==='loadoutPanel'){
    return {
      title:'Equipped Loadout Options',
      sections:[
        {
          title:'Identity',
          items:[
            ['name','Loadout Name'],
            ['weapon','Weapon']
          ]
        },
        {
          title:'Economy & Performance',
          items:[
            ['efficiency','Efficiency'],
            ['dpp','DPP'],
            ['dps','DPS'],
            ['cost','Cost / Shot']
          ]
        },
        {
          title:'Weapon Details',
          items:[
            ['damage','Effective Damage'],
            ['apm','APM'],
            ['range','Range'],
            ['maxDamage','Max Damage']
          ],
          note:'Toggle only the loadout information you want visible on stream. These settings are saved with the rest of the OBS panel configuration.'
        }
      ]
    };
  }

  return null;
}

function getStreamerMetricLabel(panelId,key){
  const labels={
    loadoutPanel:{
      name:'Loadout Name',
      weapon:'Weapon',
      efficiency:'Efficiency',
      dpp:'DPP',
      dps:'DPS',
      cost:'Cost / Shot',
      damage:'Effective Damage',
      apm:'APM',
      range:'Range',
      maxDamage:'Max Damage'
    }
  };
  return labels[panelId]?.[key]||key.replace(/([A-Z])/g,' $1').replace(/^./,c=>c.toUpperCase());
}

function openStreamerAdvancedPanel(panelId){
  const def=advancedPanelDefinition(panelId);
  if(!def)return;

  const panel=document.getElementById('streamerAdvancedPanel');
  const title=document.getElementById('streamerAdvancedTitle');
  const body=document.getElementById('streamerAdvancedBody');
  if(!panel||!title||!body)return;

  title.textContent=def.title;
  body.innerHTML='';

  const config=getStreamerMetricConfig();
  const panelConfig=config[panelId]||{};
  const presentationConfig=getStreamerPresentationConfig();
  const panelPresentation=presentationConfig[panelId]||{textScale:1};

  // Presentation controls apply to every configurable streamer panel.
  const presentationSection=document.createElement('div');
  presentationSection.className='streamer-option-section';

  const presentationHeading=document.createElement('div');
  presentationHeading.className='streamer-option-title';
  presentationHeading.textContent='Panel Appearance';
  presentationSection.appendChild(presentationHeading);

  const slimLabel=document.createElement('label');
  slimLabel.className='streamer-option-toggle';
  slimLabel.style.marginBottom='7px';

  const slimCb=document.createElement('input');
  slimCb.type='checkbox';
  slimCb.checked=panelPresentation.slimHeader===true;
  slimCb.addEventListener('change',()=>setStreamerPanelSlimHeader(panelId,slimCb.checked));

  const slimText=document.createElement('span');
  slimText.textContent='Use Slim Header';

  slimLabel.append(slimCb,slimText);
  presentationSection.appendChild(slimLabel);

  const rangeRow=document.createElement('div');
  rangeRow.className='streamer-range-row';

  const rangeLabel=document.createElement('label');
  rangeLabel.textContent='Text Size';

  const range=document.createElement('input');
  range.type='range';
  range.min='65';
  range.max='160';
  range.step='5';
  range.value=String(Math.round((panelPresentation.textScale||1)*100));

  const rangeValue=document.createElement('div');
  rangeValue.className='streamer-range-value';
  rangeValue.textContent=`${range.value}%`;

  range.addEventListener('input',()=>{
    rangeValue.textContent=`${range.value}%`;
    setStreamerPanelTextScale(panelId,Number(range.value)/100);
  });

  rangeRow.append(rangeLabel,range,rangeValue);
  presentationSection.appendChild(rangeRow);

  const presentationNote=document.createElement('div');
  presentationNote.className='streamer-option-note';
  presentationNote.textContent='Saved per panel. When global Slim Headers mode is enabled, only panels with this option checked collapse their header text.';
  presentationSection.appendChild(presentationNote);

  body.appendChild(presentationSection);

  def.sections.forEach(section=>{
    const sec=document.createElement('div');
    sec.className='streamer-option-section';

    const heading=document.createElement('div');
    heading.className='streamer-option-title';
    heading.textContent=section.title;
    sec.appendChild(heading);

    const grid=document.createElement('div');
    grid.className='streamer-option-grid';

    section.items.forEach(([metric,labelText])=>{
      const label=document.createElement('label');
      label.className='streamer-option-toggle';

      const cb=document.createElement('input');
      cb.type='checkbox';
      cb.checked=panelConfig[metric]!==false;
      cb.addEventListener('change',()=>setStreamerMetric(panelId,metric,cb.checked));

      const text=document.createElement('span');
      text.textContent=labelText;

      label.append(cb,text);
      grid.appendChild(label);
    });

    sec.appendChild(grid);

    if(section.note){
      const note=document.createElement('div');
      note.className='streamer-option-note';
      note.textContent=section.note;
      sec.appendChild(note);
    }

    body.appendChild(sec);
  });

  panel.classList.add('show');
  closeStreamerContextMenu();
}

function closeStreamerAdvancedPanel(){
  document.getElementById('streamerAdvancedPanel')?.classList.remove('show');
}

function openStreamerPanelManager(){
  buildStreamerPanelManager();
  document.getElementById('streamerPanelManager')?.classList.add('show');
  closeStreamerContextMenu();
}

function closeStreamerPanelManager(){
  document.getElementById('streamerPanelManager')?.classList.remove('show');
}

function openStreamerContextMenu(x,y,targetPanel=null){
  const menu=document.getElementById('streamerContextMenu');
  if(!menu)return;

  streamerContextTargetPanel=targetPanel;

  const hideItem=document.getElementById('streamerHidePanelItem');
  if(hideItem)hideItem.classList.toggle('hidden',!targetPanel);

  const advancedItem=document.getElementById('streamerAdvancedItem');
  const hasAdvanced=!!(targetPanel&&streamerMetricDefaults[targetPanel.dataset.panelId]);
  if(advancedItem)advancedItem.classList.toggle('hidden',!hasAdvanced);

  const slimItem=document.getElementById('streamerSlimHeadersItem');
  if(slimItem){
    slimItem.textContent=streamerSlimHeadersEnabled
      ?'▱ Disable Slim Headers'
      :'▰ Enable Slim Headers';
  }

  menu.classList.add('show');

  const rect=menu.getBoundingClientRect();
  const left=Math.min(x,window.innerWidth-rect.width-8);
  const top=Math.min(y,window.innerHeight-rect.height-8);
  menu.style.left=`${Math.max(8,left)}px`;
  menu.style.top=`${Math.max(8,top)}px`;
}

function closeStreamerContextMenu(){
  const menu=document.getElementById('streamerContextMenu');
  if(menu)menu.classList.remove('show');
  streamerContextTargetPanel=null;
}

document.addEventListener('contextmenu',e=>{
  if(!streamerModeEnabled)return;

  e.preventDefault();

  const panel=e.target.closest?.('#streamerHud .hud-panel[data-panel-id]');
  openStreamerContextMenu(e.clientX,e.clientY,panel||null);
});

document.addEventListener('pointerdown',e=>{
  if(!streamerModeEnabled)return;

  const menu=document.getElementById('streamerContextMenu');
  const manager=document.getElementById('streamerPanelManager');
  const advanced=document.getElementById('streamerAdvancedPanel');
  const appearance=document.getElementById('streamerAppearancePanel');

  if(menu?.classList.contains('show')&&!menu.contains(e.target)){
    closeStreamerContextMenu();
  }

  if(manager?.classList.contains('show') &&
     !manager.contains(e.target) &&
     !e.target.closest?.('#streamerContextMenu')){
    closeStreamerPanelManager();
  }

  if(advanced?.classList.contains('show') &&
     !advanced.contains(e.target) &&
     !e.target.closest?.('#streamerContextMenu') &&
     !e.target.closest?.('.streamer-panel-config-btn')){
    closeStreamerAdvancedPanel();
  }

  if(appearance?.classList.contains('show') &&
     !appearance.contains(e.target) &&
     !e.target.closest?.('#streamerContextMenu')){
    closeStreamerAppearancePanel();
  }
});

document.getElementById('streamerContextMenu')?.addEventListener('click',e=>{
  const item=e.target.closest('[data-action]');
  if(!item)return;

  const action=item.dataset.action;

  if(action==='panels'){
    openStreamerPanelManager();
  }else if(action==='appearance'){
    openStreamerAppearancePanel();
  }else if(action==='toggle-slim-headers'){
    setStreamerSlimHeadersEnabled(!streamerSlimHeadersEnabled);
    closeStreamerContextMenu();
  }else if(action==='advanced-panel'){
    if(streamerContextTargetPanel){
      openStreamerAdvancedPanel(streamerContextTargetPanel.dataset.panelId);
    }
  }else if(action==='hide-panel'){
    hideStreamerPanel(streamerContextTargetPanel);
  }else if(action==='reset-layout'){
    resetStreamerLayout();
  }else if(action==='exit-streamer'){
    setStreamerMode(false);
  }
});

window.addEventListener('resize',()=>{
  if(streamerModeEnabled){
    restoreStreamerLayout();
  }
});

function getStreamerDisplayName(){
  return localStorage.getItem(streamerNameStorageKey)||'';
}

function setStreamerDisplayName(value){
  const name=String(value||'').trim().slice(0,64);
  localStorage.setItem(streamerNameStorageKey,name);
  const preview=document.getElementById('streamerNamePreview');
  if(preview)preview.textContent=name||'—';
}

function syncStreamerSourceControls(){
  const avatarMain=document.getElementById('avatarNameInput');
  const avatarStream=document.getElementById('streamAvatarNameInput');
  const streamerName=document.getElementById('streamerNameInput');

  if(avatarStream&&document.activeElement!==avatarStream){
    avatarStream.value=avatarMain?.value||localStorage.getItem('entropia_avatar_name')||'';
  }
  if(streamerName&&document.activeElement!==streamerName){
    streamerName.value=getStreamerDisplayName();
  }

  const preview=document.getElementById('streamerNamePreview');
  if(preview)preview.textContent=getStreamerDisplayName()||'—';

  const connection=document.getElementById('connectionStatusText')?.textContent?.trim()||'Offline';
  const parserState=document.getElementById('streamParserState');
  if(parserState)parserState.textContent=connection.toUpperCase();

  const sourceDot=document.getElementById('liveIndicator');
  const parserDot=document.getElementById('streamParserDot');
  if(parserDot)parserDot.classList.toggle('active',!!sourceDot?.classList.contains('active'));

  const source=document.getElementById('streamParserSource');
  if(source){
    const status=document.getElementById('fileStatus')?.textContent?.trim();
    source.textContent=status||connection||'No chat.log connected';
  }

  const resume=document.getElementById('streamParserResumeBtn');
  if(resume)resume.textContent='↻ Reconnect';
}

function bindStreamerSourcePanel(){
  const avatarStream=document.getElementById('streamAvatarNameInput');
  const streamerName=document.getElementById('streamerNameInput');

  if(avatarStream&&!avatarStream.dataset.bound){
    avatarStream.dataset.bound='1';
    avatarStream.addEventListener('input',()=>{
      const main=document.getElementById('avatarNameInput');
      if(main)main.value=avatarStream.value;
      updateAvatarName();
    });
  }

  if(streamerName&&!streamerName.dataset.bound){
    streamerName.dataset.bound='1';
    streamerName.addEventListener('input',()=>setStreamerDisplayName(streamerName.value));
  }

  syncStreamerSourceControls();
}

function getStreamerMetricSettings(panelId){
  try{
    const saved=JSON.parse(localStorage.getItem(streamerMetricStorageKey)||'{}');
    return {...(streamerMetricDefaults[panelId]||{}),...(saved?.[panelId]||{})};
  }catch{
    return {...(streamerMetricDefaults[panelId]||{})};
  }
}

function syncStreamerLoadoutPanel(){
  const active=window.activeLoadout;
  const setText=(id,value)=>{
    const el=document.getElementById(id);
    if(el)el.textContent=value;
  };

  setText('streamLoadoutState',active?'EQUIPPED':'NONE');
  setText('streamLoadoutName',active?.name||'No loadout equipped');
  setText('streamLoadoutWeapon',active?.weaponName||'—');
  setText('streamLoadoutEfficiency',`${Number(active?.efficiency||0).toFixed(1)}%`);
  setText('streamLoadoutDpp',Number(active?.dpp||0).toFixed(2));
  setText('streamLoadoutDps',Number(active?.dps||0).toFixed(1));
  setText('streamLoadoutCost',`${Number(active?.costPerShot||0).toFixed(4)} PED`);
  setText('streamLoadoutDamage',Number(active?.effectiveDamage||0).toFixed(1));
  setText('streamLoadoutApm',Number(active?.apm||0).toFixed(1));
  setText('streamLoadoutRange',`${Number(active?.range||0).toFixed(1)} m`);
  setText('streamLoadoutMaxDamage',Number(active?.maxDamage||0).toFixed(1));


}

function syncStreamerHud(){
  syncStreamerSourceControls();
  syncStreamerLoadoutPanel();
  window.EntropiaTeamTracker?.render?.();
  const setText=(id,value)=>{
    const el=document.getElementById(id);
    if(el)el.textContent=value;
  };

  const getText=(id,fallback='—')=>{
    const el=document.getElementById(id);
    return el?.textContent?.trim()||fallback;
  };

  // Connection
  const sourceDot=document.getElementById('liveIndicator');
  const streamDot=document.getElementById('streamHudLiveDot');
  if(streamDot)streamDot.classList.toggle('active',!!sourceDot?.classList.contains('active'));
  setText('streamHudLiveText',getText('connectionStatusText','OFFLINE').toUpperCase());

  // Clocks
  setText('streamEventCountdown',getText('eventEndCountdown','--d --:--:--'));
  setText('streamSafeStartCountdown',getText('latestStartCountdown','--d --:--:--'));
  setText('streamGameTime',getText('syncGameTimeDisplay','NOT SYNCED'));
  setText('streamSessionTimer',getText('timerDisplay','WAITING'));
  setText('streamActiveHour',getText('currentTimeDisplay','--:00'));

  // Personal event totals
  const myGlobals=parseInt(getText('liveMyGlobalCount','0'),10)||0;
  const myHofs=parseInt(getText('liveMyHofCount','0'),10)||0;
  const lootText=getText('liveMyTotalLoot','0.00 PED');
  const myLoot=parseFloat(lootText.replace(/[^0-9.-]/g,''))||0;

  setText('streamMyGlobals',myGlobals);
  setText('streamMyHofs',myHofs);
  setText('streamMyLoot',myLoot.toFixed(0));

  // Gauges are deliberately relative, so they remain visually useful
  // even before we know the event's formal scoring targets.
  const globalPct=Math.min(100,myGlobals*5);
  const hofPct=Math.min(100,myHofs*20);
  const lootPct=Math.min(100,myLoot/10);

  const g1=document.getElementById('streamGlobalGauge');
  const g2=document.getElementById('streamHofGauge');
  const g3=document.getElementById('streamLootGauge');
  if(g1)g1.style.setProperty('--gauge-pct',globalPct);
  if(g2)g2.style.setProperty('--gauge-pct',hofPct);
  if(g3)g3.style.setProperty('--gauge-pct',lootPct);

  // Live feed totals
  setText('streamTargetGlobals',getText('targetLiveGlobalCount','0'));
  setText('streamTargetHofs',getText('targetLiveHofCount','0'));
  setText('streamTargetValue',getText('targetLiveFeedValue','0.00 PED'));
  setText('streamAllGlobals',getText('allMobLiveGlobalCount','0'));
  setText('streamAllHofs',getText('allMobLiveHofCount','0'));
  setText('streamAllMobValue',getText('allMobLiveFeedValue','0.00 PED'));

  // Personal event metrics are also available inside Global Telemetry.
  setText('streamPersonalGlobals',myGlobals);
  setText('streamPersonalHofs',myHofs);
  setText('streamPersonalValue',lootText);

  // Recommendation
  let recommended=getText('recommendedMobBox','WAITING FOR DATA');
  recommended=recommended.replace(/^🎯\s*/,'').replace(/\s+·.*$/,'').trim();
  setText('streamRecommendedMob',recommended||'WAITING FOR DATA');
}

document.addEventListener('keydown',e=>{
  if(e.key!=='Escape'||!streamerModeEnabled)return;

  const menu=document.getElementById('streamerContextMenu');
  const manager=document.getElementById('streamerPanelManager');
  const advanced=document.getElementById('streamerAdvancedPanel');
  const appearance=document.getElementById('streamerAppearancePanel');

  if(menu?.classList.contains('show')){
    closeStreamerContextMenu();
    return;
  }
  if(advanced?.classList.contains('show')){
    closeStreamerAdvancedPanel();
    return;
  }
  if(appearance?.classList.contains('show')){
    closeStreamerAppearancePanel();
    return;
  }
  if(manager?.classList.contains('show')){
    closeStreamerPanelManager();
    return;
  }

  setStreamerMode(false);
});

function setConnectionStatus(text,isLive){
  document.getElementById('connectionStatusText').textContent=text;
  document.getElementById('liveIndicator').classList.toggle('active',!!isLive);
}

function switchTab(tabName){
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tabName));

  document.getElementById('globalTab')?.classList.toggle('hidden',tabName!=='global');
  document.getElementById('liveTab')?.classList.toggle('hidden',tabName!=='live');
  document.getElementById('huntTab')?.classList.toggle('hidden',tabName!=='hunt');

  if(tabName==='global'){
    const active=document.querySelector('.global-subtab-btn.active')?.id==='globalAnalyticsBtn'
      ?'analytics'
      :'schedule';
    switchGlobalAnalyticsTab(active);
  }

  if(tabName==='hunt'){
    const active=document.getElementById('huntLiveBtn')?.classList.contains('active')
      ?'livehunt'
      :'loadouts';
    switchHuntTrackerTab(active);
    window.EntropiaLoadouts?.refresh?.();
  }
}

function switchHuntTrackerTab(tabName){
  const active=tabName==='team'?'team':(tabName==='livehunt'?'livehunt':'loadouts');

  document.getElementById('huntLoadoutsTab')?.classList.toggle('hidden',active!=='loadouts');
  document.getElementById('huntLiveTab')?.classList.toggle('hidden',active!=='livehunt');
  document.getElementById('huntTeamTab')?.classList.toggle('hidden',active!=='team');

  document.getElementById('huntLoadoutsBtn')?.classList.toggle('active',active==='loadouts');
  document.getElementById('huntLiveBtn')?.classList.toggle('active',active==='livehunt');
  document.getElementById('huntTeamBtn')?.classList.toggle('active',active==='team');

  if(active==='loadouts')window.EntropiaLoadouts?.refresh?.();
  if(active==='livehunt')window.EntropiaLoadouts?.syncEquippedLabels?.();
  if(active==='team')window.EntropiaTeamTracker?.render?.();
}

function switchGlobalAnalyticsTab(tabName){
  const scheduleActive=tabName==='schedule';
  document.getElementById('scheduleTab')?.classList.toggle('hidden',!scheduleActive);
  document.getElementById('analyticsTab')?.classList.toggle('hidden',scheduleActive);

  document.getElementById('globalScheduleBtn')?.classList.toggle('active',scheduleActive);
  document.getElementById('globalAnalyticsBtn')?.classList.toggle('active',!scheduleActive);

  if(scheduleActive)updateScheduleDisplay();
  else updateAnalyticsDisplay();
}

function updateAvatarName(){
  const val=document.getElementById('avatarNameInput')?.value.trim()||'';
  userAvatarName=val.toLowerCase();
  localStorage.setItem('entropia_avatar_name',val);
  const streamInput=document.getElementById('streamAvatarNameInput');
  if(streamInput&&document.activeElement!==streamInput)streamInput.value=val;
  evaluateUserGlobals();
  window.EntropiaTeamTracker?.updateIdentity?.();
}

function toggleVoiceAnnouncer(){
  voiceAnnouncerEnabled=document.getElementById('voiceToggle').checked;
  localStorage.setItem('entropia_voice_enabled',voiceAnnouncerEnabled);
  if(voiceAnnouncerEnabled&&'speechSynthesis'in window)speakText("Voice announcer enabled.");
}

function speakText(text){
  if(!voiceAnnouncerEnabled||!('speechSynthesis'in window))return;
  const u=new SpeechSynthesisUtterance(text);
  u.rate=1;u.pitch=1;
  speechSynthesis.speak(u);
}

async function processSelectedChatLogFile(file,{obs=false}={}){
  if(!file)return;

  if(liveInterval){
    clearInterval(liveInterval);
    liveInterval=null;
  }
  fileHandle=null;

  const desiredSignature=getAnalysisCacheSignature();
  document.getElementById('fileStatus').textContent=
    `Reading ${file.name} · ${(file.size/(1024*1024)).toFixed(2)} MB`;
  setConnectionStatus(obs?'OBS file access':'Analyzing',false);

  const recent=await readLogForConfiguredLookback(file);
  parseChatLog(recent.text);

  cachedFileSize=file.size;
  cachedFileLastModified=file.lastModified||0;
  cachedAnalysisSignature=desiredSignature;
  saveParsedDataToIDB(globalParsedData,allMobHourlyStats,file);

  const readMb=(recent.bytesRead/(1024*1024)).toFixed(2);
  const totalMb=(file.size/(1024*1024)).toFixed(2);

  document.getElementById('fileStatus').textContent=obs
    ?`OBS access granted · ${file.name} · read ${readMb} MB of ${totalMb} MB.`
    :(recent.cutoff
      ?`Analyzed ${describeAnalysisLookback()} · read ${readMb} MB of ${totalMb} MB · ${globalParsedData.length.toLocaleString()} target records`
      :`Analyzed all history · ${totalMb} MB · ${globalParsedData.length.toLocaleString()} target records`);

  document.getElementById('fileConnectionCard')?.classList.add('hidden');

  // A standard File object is a user-granted snapshot, not a persistent
  // FileSystemFileHandle. Do not claim live tailing. OBS users can click
  // Select chat.log again from Interact to refresh safely.
  setConnectionStatus(obs?'OBS snapshot':'File loaded',false);

  if(obs){
    window.showAppToast?.(
      'chat.log loaded in OBS. Reconnect will reuse this source for the current OBS session.',
      'success',
      4800
    );
  }
}

async function processFileHandle(handle){
  // Manual file selection: cache is only reusable when both the file
  // and the analytics scope (targets/lookback) match.
  const file=await handle.getFile();
  const desiredSignature=getAnalysisCacheSignature();

  const canContinueFromCache=
    Array.isArray(globalParsedData) &&
    cachedFileSize>0 &&
    file.size>=cachedFileSize &&
    (!cachedFileLastModified || file.lastModified>=cachedFileLastModified) &&
    cachedAnalysisSignature===desiredSignature;

  if(canContinueFromCache){
    await processFileHandleIncremental(handle);
    return;
  }

  document.getElementById('fileStatus').textContent=
    `Building ${describeAnalysisLookback()} cache from ${file.name} · ${(file.size/(1024*1024)).toFixed(2)} MB total`;
  setConnectionStatus('Analyzing',false);

  const recent=await readLogForConfiguredLookback(file);
  parseChatLog(recent.text);

  cachedFileSize=file.size;
  cachedFileLastModified=file.lastModified||0;
  cachedAnalysisSignature=desiredSignature;

  saveParsedDataToIDB(globalParsedData,allMobHourlyStats,file);

  const readMb=(recent.bytesRead/(1024*1024)).toFixed(2);
  const totalMb=(file.size/(1024*1024)).toFixed(2);
  document.getElementById('fileStatus').textContent=
    recent.cutoff
      ?`Analyzed ${describeAnalysisLookback()} · read ${readMb} MB of ${totalMb} MB · ${globalParsedData.length.toLocaleString()} target records`
      :`Analyzed all history · ${totalMb} MB · ${globalParsedData.length.toLocaleString()} target records`;

  document.getElementById('fileConnectionCard').classList.add('hidden');
  startLivePolling(handle,file.size);
}

function updateLiveSummary(){
  document.getElementById('liveLatestMob').textContent=liveLatestMob.toUpperCase();

  // Feed header summaries: normal Globals, HOFs, and combined PED.
  document.getElementById('targetLiveGlobalCount').textContent=Math.max(0,liveSessionGlobals-liveSessionHofs);
  document.getElementById('targetLiveHofCount').textContent=liveSessionHofs;
  document.getElementById('targetLiveFeedValue').textContent=`${liveTargetFeedPed.toFixed(2)} PED`;

  document.getElementById('allMobLiveGlobalCount').textContent=Math.max(0,liveAllMobGlobals-liveAllMobHofs);
  document.getElementById('allMobLiveHofCount').textContent=liveAllMobHofs;
  document.getElementById('allMobLiveFeedValue').textContent=`${liveAllMobFeedPed.toFixed(2)} PED`;

  // Counts/PED in the KPI row are event totals for the configured avatar,
  // not merely totals since this browser tab was opened.
  evaluateUserGlobals();
  syncStreamerHud();
}


function updateUserEventLiveSummary(globalCount,hofCount){
  const globalCountEl=document.getElementById('liveMyGlobalCount');
  const globalPedEl=document.getElementById('liveMyGlobalPed');
  const hofCountEl=document.getElementById('liveMyHofCount');
  const hofPedEl=document.getElementById('liveMyHofPed');
  const totalEl=document.getElementById('liveMyTotalLoot');

  if(globalCountEl)globalCountEl.textContent=globalCount;
  if(globalPedEl)globalPedEl.textContent=`${userEventGlobalPed.toFixed(2)} PED total`;
  if(hofCountEl)hofCountEl.textContent=hofCount;
  if(hofPedEl)hofPedEl.textContent=`${userEventHofPed.toFixed(2)} PED total`;
  if(totalEl)totalEl.textContent=`${userEventTotalLoot.toFixed(2)} PED`;
}

function startTimerCountdown(){
  if(timerInterval)clearInterval(timerInterval);
  const expiry=new Date(firstUserGlobalTime.getTime()+6*60*60*1000);

  function tick(){
    const now=latestSyncedGameTime||new Date();
    const diff=expiry-now;
    const display=document.getElementById('timerDisplay');
    const details=document.getElementById('timerDetails');
    if(diff<=0){
      display.textContent='00:00:00';
      display.classList.remove('warning');
      display.style.color='var(--danger)';
      details.textContent=`Window closed · started ${formatClock(firstUserGlobalTime)} · ended ${formatClock(expiry)}`;
      clearInterval(timerInterval);
      return;
    }
    const h=Math.floor(diff/3600000);
    const m=Math.floor((diff%3600000)/60000);
    const s=Math.floor((diff%60000)/1000);
    display.textContent=`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    display.style.color='var(--success)';
    details.textContent=`Started ${formatClock(firstUserGlobalTime)} · ends ${formatClock(expiry)}`;
  }
  tick();
  timerInterval=setInterval(tick,1000);
}

function resetTimerDisplay(){
  if(timerInterval)clearInterval(timerInterval);
  const display=document.getElementById('timerDisplay');
  display.textContent='Waiting…';
  display.style.color='var(--warning)';
  document.getElementById('timerDetails').textContent='First event global starts your 6-hour scoring window.';
}

function toggleTimeMode(){
  const mode=document.getElementById('timeModeSelect').value;
  document.getElementById('customTimeGroup').classList.toggle('hidden',mode!=='custom');
  updateScheduleDisplay();
}

function getActiveTargetHour(){
  if(document.getElementById('timeModeSelect').value==='custom'){
    return Math.max(0,Math.min(23,parseInt(document.getElementById('simHourInput').value,10)||0));
  }
  return latestSyncedGameTime?latestSyncedGameTime.getHours():new Date().getUTCHours();
}


function emptyHourlyStats(){
  const stats={};
  for(let h=0;h<24;h++){
    stats[h]={total:0,ped:0,hofs:0};
    targetMobs.forEach(m=>stats[h][m]=0);
  }
  return stats;
}


function makeHeatCell(hour,count,max,mode,isCurrent){
  const ratio=count/max;
  const cell=document.createElement('div');
  cell.className='heatmap-cell';
  let bg='#0a1726',color='#e8f1fb';
  if(ratio>.75){
    bg=mode==='all'?'#a62563':'#a92f38';color='#fff';
  }else if(ratio>.4){
    bg='#8e5b19';color='#fff';
  }else if(ratio>.1){
    bg='#14547a';color='#fff';
  }
  cell.style.background=bg;
  if(isCurrent){
    cell.style.outline='2px solid var(--accent)';
    cell.style.outlineOffset='1px';
  }
  cell.style.color=color;
  cell.innerHTML=`<strong>${count}</strong><span class="heatmap-hour">${String(hour).padStart(2,'0')}h</span>`;
  cell.title=`${String(hour).padStart(2,'0')}:00 · ${count} ${mode==='all'?'all-mob':'target'} globals`;
  return cell;
}


function updateAnalyticsDisplay(){
  const timeframe=document.getElementById('timeframeSelect').value;
  const now=latestSyncedGameTime||new Date();
  let cutoff=new Date(0);

  if(timeframe==='last3'){cutoff=new Date(now);cutoff.setMonth(now.getMonth()-3)}
  else if(timeframe==='last6'){cutoff=new Date(now);cutoff.setMonth(now.getMonth()-6)}
  else if(timeframe==='last12'){cutoff=new Date(now);cutoff.setFullYear(now.getFullYear()-1)}

  const stats={};
  targetMobs.forEach(m=>{
    stats[m]={count:0,maxPed:0,totalPed:0,hours:new Array(24).fill(0),hofs:0,lastSeen:null};
  });

  let recordCount=0,totalPed=0,largest=0;

  if(globalParsedData){
    for(const rec of globalParsedData){
      if(rec.date&&!isNaN(rec.date)&&rec.date<cutoff)continue;
      const s=stats[rec.mob];
      if(!s)continue;
      s.count++;
      s.totalPed+=rec.ped||0;
      s.maxPed=Math.max(s.maxPed,rec.ped||0);
      s.hours[rec.hour]++;
      if(rec.isHof)s.hofs++;
      if(rec.date&&(!s.lastSeen||rec.date>s.lastSeen))s.lastSeen=rec.date;
      recordCount++;
      totalPed+=rec.ped||0;
      largest=Math.max(largest,rec.ped||0);
    }
  }

  document.getElementById('analyticsRecordCount').textContent=recordCount.toLocaleString();
  document.getElementById('analyticsTotalPed').textContent=totalPed.toFixed(2);
  document.getElementById('analyticsLargestPed').textContent=largest.toFixed(2);
  renderAnalyticsCards(stats);
}

function renderAnalyticsCards(stats){
  const container=document.getElementById('resultsContainer');
  container.innerHTML='';

  const sorted=targetMobs.map(mob=>{
    const data=stats?.[mob]||{count:0,maxPed:0,totalPed:0,hours:new Array(24).fill(0),hofs:0,lastSeen:null};
    return {mob,data};
  }).sort((a,b)=>b.data.count-a.data.count);

  for(const {mob,data} of sorted){
    const avg=data.count?data.totalPed/data.count:0;
    let peakH=0,maxH=-1;
    data.hours.forEach((v,h)=>{if(v>maxH){maxH=v;peakH=h}});
    const peak=maxH>0?`${String(peakH).padStart(2,'0')}:00–${String((peakH+1)%24).padStart(2,'0')}:00`:'No data';
    const hofRate=data.count?data.hofs/data.count*100:0;
    const lastSeen=data.lastSeen?formatDateTimeUTCish(data.lastSeen):'—';

    const wpHtml=(mobWaypoints[mob]||[]).map(wp=>{
      const escaped=wp.replace(/\\/g,'\\\\').replace(/'/g,"\\'");
      return `<div class="wp-item" onclick="copyWaypoint('${escaped}')" title="${escapeHtml(wp)}">
        <span class="wp-text">${escapeHtml(wp)}</span>
        <span class="copy-hint">COPY</span>
      </div>`;
    }).join('');

    const card=document.createElement('div');
    card.className='mob-card';
    card.innerHTML=`
      <div class="mob-card-head">
        <strong>${escapeHtml(mob)}</strong>
        <span class="badge">${data.count} globals</span>
      </div>
      <div class="stat-grid">
        <div class="stat"><div class="label">Largest</div><div class="value success">${data.maxPed.toFixed(2)} PED</div></div>
        <div class="stat"><div class="label">Average</div><div class="value">${avg.toFixed(2)} PED</div></div>
        <div class="stat"><div class="label">Total PED</div><div class="value">${data.totalPed.toFixed(2)} PED</div></div>
        <div class="stat"><div class="label">HOFs</div><div class="value hof">${data.hofs} · ${hofRate.toFixed(1)}%</div></div>
        <div class="stat"><div class="label">Peak Hour</div><div class="value warning">${peak}</div></div>
        <div class="stat"><div class="label">Last Seen</div><div class="value">${lastSeen}</div></div>
      </div>
      <div class="section-label">Waypoints · click to copy</div>
      ${wpHtml}`;
    container.appendChild(card);
  }
}

function copyWaypoint(wpText){
  navigator.clipboard.writeText(wpText).then(showToast).catch(err=>console.error('Copy failed',err));
}
function showToast(){
  const toast=document.getElementById('toast');
  toast.className='show';
  setTimeout(()=>toast.className='',1800);
}

function startEventCountdowns(){
  if(eventCountdownInterval)clearInterval(eventCountdownInterval);

  function tickEventCountdowns(){
    // Real UTC clock is the authoritative event clock.
    const now=new Date();

    const eventMs=eventDeadline-now;
    const latestStartMs=latestSafeSixHourStart-now;

    const eventEl=document.getElementById('eventEndCountdown');
    const eventSub=document.getElementById('eventEndCountdownSub');
    const startEl=document.getElementById('latestStartCountdown');
    const startSub=document.getElementById('latestStartCountdownSub');

    if(eventMs<=0){
      eventEl.textContent='EVENT ENDED';
      eventEl.style.color='var(--danger)';
      eventSub.textContent='Ended Aug 17 · 00:00 UTC';
    }else{
      eventEl.textContent=formatDuration(eventMs);
      eventEl.style.color=eventMs<=6*60*60*1000?'var(--danger)':'var(--warning)';
      eventSub.textContent='Ends Aug 17 · 00:00 UTC';
    }

    if(latestStartMs<=0){
      startEl.textContent=eventMs>0?'START NOW':'CLOSED';
      startEl.style.color='var(--danger)';
      startSub.textContent=eventMs>0
        ?'Less than 6 hours remain in the event'
        :'Event has ended';
    }else{
      startEl.textContent=formatDuration(latestStartMs);
      startEl.style.color=latestStartMs<=2*60*60*1000?'var(--warning)':'var(--success)';
      startSub.textContent='Latest full 6h start: Aug 16 · 18:00 UTC';
    }

    if(streamerModeEnabled)syncStreamerHud();
  }

  tickEventCountdowns();
  eventCountdownInterval=setInterval(tickEventCountdowns,1000);
}

function formatDuration(ms){
  ms=Math.max(0,ms);
  const totalSeconds=Math.floor(ms/1000);
  const days=Math.floor(totalSeconds/86400);
  const hours=Math.floor((totalSeconds%86400)/3600);
  const minutes=Math.floor((totalSeconds%3600)/60);
  const seconds=totalSeconds%60;
  return `${days}d ${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

function formatClock(d){
  return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit',second:'2-digit'});
}
function formatDateTimeUTCish(d){
  if(!(d instanceof Date)||isNaN(d))return'—';
  return d.toISOString().replace('T',' ').slice(0,19);
}
function escapeHtml(value){
  return String(value??'').replace(/[&<>"']/g,ch=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
  }[ch]));
}

/* ---------------------------------------------------------
   In-app notifications
   --------------------------------------------------------- */
window.showAppToast=function(message,type='info',duration=2800){
  const host=document.getElementById('appToastHost');
  if(!host)return;
  const toast=document.createElement('div');
  toast.className=`app-toast ${type||'info'}`;
  toast.setAttribute('role','status');
  toast.innerHTML=`<span class="app-toast-dot"></span><span class="app-toast-message"></span>`;
  toast.querySelector('.app-toast-message').textContent=String(message||'');
  host.appendChild(toast);
  requestAnimationFrame(()=>toast.classList.add('show'));
  const remove=()=>{
    toast.classList.remove('show');
    setTimeout(()=>toast.remove(),180);
  };
  toast.addEventListener('click',remove,{once:true});
  setTimeout(remove,Math.max(1200,Number(duration)||2800));
};


window.appConfirm=function(message,{title='Confirm',confirmText='Confirm'}={}){
  return new Promise(resolve=>{
    const backdrop=document.getElementById('appConfirmBackdrop');
    const titleEl=document.getElementById('appConfirmTitle');
    const messageEl=document.getElementById('appConfirmMessage');
    const cancel=document.getElementById('appConfirmCancel');
    const accept=document.getElementById('appConfirmAccept');
    if(!backdrop||!cancel||!accept){resolve(false);return;}
    if(titleEl)titleEl.textContent=title;
    if(messageEl)messageEl.textContent=message;
    accept.textContent=confirmText;

    const done=value=>{
      backdrop.classList.add('hidden');
      cancel.onclick=null;accept.onclick=null;backdrop.onclick=null;
      resolve(value);
    };
    cancel.onclick=()=>done(false);
    accept.onclick=()=>done(true);
    backdrop.onclick=e=>{if(e.target===backdrop)done(false)};
    backdrop.classList.remove('hidden');
    accept.focus();
  });
};


/* =========================================================
   APPLICATION SIDEBAR
   ========================================================= */
const APP_SIDEBAR_KEY='entropia_app_sidebar_collapsed_v1';

function setAppSidebarCollapsed(collapsed){
  const shell=document.getElementById('appShell');
  const sidebar=document.getElementById('appSidebar');
  const button=document.getElementById('sidebarToggleBtn');
  if(!shell||!sidebar)return;

  shell.classList.toggle('sidebar-collapsed',!!collapsed);
  sidebar.classList.toggle('collapsed',!!collapsed);

  if(button){
    button.textContent=collapsed?'›':'‹';
    button.title=collapsed?'Expand sidebar':'Collapse sidebar';
    button.setAttribute('aria-label',collapsed?'Expand sidebar':'Collapse sidebar');
    button.setAttribute('aria-expanded',String(!collapsed));
  }
  localStorage.setItem(APP_SIDEBAR_KEY,collapsed?'1':'0');

  syncObsModeButtonLabel();
}

function toggleAppSidebar(){
  const shell=document.getElementById('appShell');
  setAppSidebarCollapsed(!shell?.classList.contains('sidebar-collapsed'));
}

function restoreAppSidebar(){
  setAppSidebarCollapsed(localStorage.getItem(APP_SIDEBAR_KEY)==='1');
  syncObsModeButtonLabel();
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',restoreAppSidebar);
}else{
  restoreAppSidebar();
}


function togglePixelb8More(){
  PixelB8Shell.toggleMore('#pixelb8MoreSection');
}

function initializePixelb8More(){
  PixelB8Shell.initMore(document);
}

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',initializePixelb8More);
}else{
  initializePixelb8More();
}


window.addEventListener('loadout-equipped-changed',()=>{
  syncStreamerLoadoutPanel();
  applyStreamerMetricConfig();
});

document.addEventListener('DOMContentLoaded',()=>{
  PixelB8Shell.initRightRail();
  PixelB8Shell.bindVerticalResizer({
    element:'[data-pixelb8-right-resizer]',
    cssVariable:'--pixelb8-right-expanded',
    storageKey:'pixelb8_shared_right_width_v1',
    defaultWidth:248,
    minWidth:210,
    maxWidth:460,
    invert:true,
    enabled:()=>document.querySelector('[data-pixelb8-shell]')?.classList.contains('social-expanded')
  });
});
