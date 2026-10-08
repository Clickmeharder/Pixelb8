function setOptionalText(id,value){const el=document.getElementById(id);if(el)el.textContent=value;}
function parseLogTimestampFromLine(line){
  const tm=line.match(/^(\d{4}[-./]\d{1,2}[-./]\d{1,2})\s+(\d{2}:\d{2}:\d{2})/);
  if(!tm)return null;
  const d=new Date(tm[1].replace(/[\./]/g,'-')+'T'+tm[2]+'Z');
  return Number.isNaN(d.getTime())?null:d;
}

function trimLogTextToCutoff(text,cutoff,startedMidFile){
  let lines=text.split(/\r?\n/);

  // The first chunk may begin in the middle of a line.
  if(startedMidFile && lines.length)lines.shift();

  if(!cutoff)return lines.join('\n');

  let firstRelevant=0;
  for(let i=0;i<lines.length;i++){
    const d=parseLogTimestampFromLine(lines[i]);
    if(d && d>=cutoff){
      firstRelevant=i;
      break;
    }
  }

  return lines.slice(firstRelevant).join('\n');
}

async function readLogForConfiguredLookback(file){
  // Analyze Back is relative to actual now. A months-old chat.log must not make
  // its own last-modified date become "today".
  const cutoff=getAnalysisReadCutoff(new Date());

  if(!cutoff){
    const text=await file.text();
    return {text,bytesRead:file.size,cutoff:null,startByte:0};
  }

  const chunkSize=1024*1024;
  let start=file.size;
  let text='';
  let foundBoundary=false;

  while(start>0){
    const nextStart=Math.max(0,start-chunkSize);
    const chunk=await file.slice(nextStart,start).text();
    text=chunk+text;
    start=nextStart;

    // Check the earliest timestamp currently loaded. Once it is at or before
    // the cutoff, we have enough history and can stop reading older bytes.
    const lines=chunk.split(/\r?\n/);
    for(const line of lines){
      const d=parseLogTimestampFromLine(line);
      if(d){
        if(d<=cutoff)foundBoundary=true;
        break;
      }
    }

    if(foundBoundary)break;
  }

  return {
    text:trimLogTextToCutoff(text,cutoff,start>0),
    bytesRead:file.size-start,
    cutoff,
    startByte:start
  };
}

let lastFallbackChatLogFile=null;
let obsPickerAttemptToken=0;
let obsPickerWatchdog=null;

let chatLogReadFaultActive=false;
let chatLogReadFaultNotified=false;
let legacyLiveReadErrorCount=0;
const LEGACY_LIVE_MAX_ERRORS=3;

function beginChatLogReadFault(err,{source='Live chat.log'}={}){
  const first=!chatLogReadFaultActive;
  chatLogReadFaultActive=true;
  setConnectionStatus('Chat Log Read Error',false);
  if(first){
    console.error(`${source} read error:`,err);
    window.PixelB8Audio?.play?.('chatlog-read-error');
  }
  if(!chatLogReadFaultNotified){
    chatLogReadFaultNotified=true;
    window.showAppToast?.('chat.log could not be read. Live tracking may be interrupted; PixelB8 will retry briefly.','error',5200);
  }
}

function recoverChatLogReadFault(){
  if(!chatLogReadFaultActive)return false;
  chatLogReadFaultActive=false;
  chatLogReadFaultNotified=false;
  legacyLiveReadErrorCount=0;
  window.PixelB8Audio?.play?.('chatlog-reconnected');
  window.showAppToast?.('chat.log reading recovered. Live tracking resumed.','success',2600);
  return true;
}

function stopBrokenLivePolling(err){
  if(liveInterval){clearInterval(liveInterval);liveInterval=null;}
  liveHandlePollBusy=false;
  setConnectionStatus('Chat Log Read Error',false);
  updateChatLogActionButton?.();
  showObsSourceDiagnostic?.({
    title:'chat.log read connection lost',
    message:'PixelB8 stopped live polling after repeated read failures. Use Resume Log to reconnect the saved chat.log handle.',
    details:`${err?.name||'Error'}: ${err?.message||String(err)}\n\n${liveFileHandleEnvironmentSummary()}`,
    level:'error',
    nativePicker:false
  });
  window.showAppToast?.('Live chat.log polling stopped after repeated read errors. Use Resume Log to reconnect.','error',6500);
}

function isObsBrowserSource(){
  return !!window.obsstudio || /\bOBS\b/i.test(navigator.userAgent||'');
}

function obsEnvironmentSummary(){
  const input=document.getElementById('obsChatLogInput');
  return [
    `OBS detected: ${isObsBrowserSource()?'yes':'no'}`,
    `window.obsstudio: ${window.obsstudio?'available':'not exposed'}`,
    `userAgent: ${navigator.userAgent||'unknown'}`,
    `input.showPicker: ${typeof input?.showPicker==='function'?'available':'unavailable'}`,
    `File API: ${typeof File!=='undefined'?'available':'unavailable'}`,
    `protocol: ${location.protocol}`,
    `page: ${location.href}`
  ].join('\n');
}

function showObsSourceDiagnostic({
  title='chat.log connection',
  message='',
  details='',
  level='warning',
  nativePicker=false
}={}){
  const panel=document.getElementById('obsSourceDiagnostic');
  if(!panel)return;
  panel.classList.remove('hidden','success','warning','error');
  panel.classList.add(level);
  const titleEl=document.getElementById('obsDiagnosticTitle');
  const messageEl=document.getElementById('obsDiagnosticMessage');
  const detailsEl=document.getElementById('obsDiagnosticDetails');
  if(titleEl)titleEl.textContent=title;
  if(messageEl)messageEl.textContent=message;
  if(detailsEl)detailsEl.textContent=details||obsEnvironmentSummary();
  toggleObsNativePicker(nativePicker);
}

function closeObsSourceDiagnostic(){
  document.getElementById('obsSourceDiagnostic')?.classList.add('hidden');
}

function toggleObsNativePicker(show){
  document.getElementById('obsDiagnosticNativePicker')?.classList.toggle('hidden',!show);
}

function clearObsPickerWatchdog(){
  if(obsPickerWatchdog){
    clearTimeout(obsPickerWatchdog);
    obsPickerWatchdog=null;
  }
}

function armObsPickerWatchdog(token){
  clearObsPickerWatchdog();
  obsPickerWatchdog=setTimeout(()=>{
    if(token!==obsPickerAttemptToken)return;
    showObsSourceDiagnostic({
      title:'OBS file picker did not respond',
      message:'OBS/CEF did not report a selected file. If no Windows file chooser appeared, use the Native File Control below from OBS → Interact.',
      details:obsEnvironmentSummary(),
      level:'warning',
      nativePicker:true
    });
  },2600);
}

async function openFallbackChatLogPicker(){
  const input=document.getElementById('obsChatLogInput');
  if(!input){
    showObsSourceDiagnostic({
      title:'File selector unavailable',
      message:'The fallback chat.log input could not be found in this page.',
      details:obsEnvironmentSummary(),
      level:'error',
      nativePicker:true
    });
    window.showAppToast?.('File selector is unavailable in this view.','error');
    return false;
  }

  input.value='';
  obsPickerAttemptToken++;
  const token=obsPickerAttemptToken;

  if(isObsBrowserSource()){
    showObsSourceDiagnostic({
      title:'Opening chat.log picker',
      message:'OBS Browser Source detected. Waiting for the native file chooser…',
      details:obsEnvironmentSummary(),
      level:'warning',
      nativePicker:false
    });
  }

  try{
    // showPicker() preserves the user activation path more explicitly than
    // click() in newer Chromium/CEF builds.
    if(typeof input.showPicker==='function'){
      input.showPicker();
    }else{
      input.click();
    }
    if(isObsBrowserSource())armObsPickerWatchdog(token);
    return true;
  }catch(err){
    console.error('Native file picker failed:',err);
    clearObsPickerWatchdog();
    showObsSourceDiagnostic({
      title:'OBS blocked the native file picker',
      message:'The scripted picker was rejected. Use the visible Native File Control below from OBS → Interact.',
      details:`${err?.name||'Error'}: ${err?.message||String(err)}\n\n${obsEnvironmentSummary()}`,
      level:'error',
      nativePicker:true
    });
    return false;
  }
}

function handleFallbackChatLogCancel(){
  clearObsPickerWatchdog();
  obsPickerAttemptToken++;
  if(isObsBrowserSource()){
    showObsSourceDiagnostic({
      title:'chat.log selection cancelled',
      message:'No file was selected. You can retry, or use the visible Native File Control.',
      details:obsEnvironmentSummary(),
      level:'warning',
      nativePicker:true
    });
  }
}

async function validateSelectedChatLogFile(file){
  if(!file)throw new Error('No file object was returned by the browser.');
  if(!file.size)throw new Error(`${file.name||'Selected file'} is empty.`);
  const lower=String(file.name||'').toLowerCase();
  if(lower && !lower.endsWith('.log')){
    throw new Error(`Expected chat.log or another .log file, but selected "${file.name}".`);
  }
  // A tiny probe makes CEF permission/read failures visible before the full parse.
  await file.slice(0,Math.min(file.size,4096)).text();
  return true;
}

async function consumeFallbackChatLogFile(file,{direct=false}={}){
  clearObsPickerWatchdog();
  obsPickerAttemptToken++;
  if(!file){
    handleFallbackChatLogCancel();
    return;
  }

  lastFallbackChatLogFile=file;
  showObsSourceDiagnostic({
    title:'Reading chat.log',
    message:`Access granted to ${file.name}. Verifying and parsing the file…`,
    details:`name: ${file.name}\nsize: ${(file.size/(1024*1024)).toFixed(2)} MB\nlast modified: ${new Date(file.lastModified||Date.now()).toLocaleString()}\nsource: ${direct?'native visible input':'fallback picker'}`,
    level:'warning',
    nativePicker:false
  });

  try{
    await validateSelectedChatLogFile(file);
    await processSelectedChatLogFile(file,{obs:isObsBrowserSource()});

    showObsSourceDiagnostic({
      title:'chat.log loaded',
      message:'OBS can read the selected chat.log snapshot. The parser completed successfully.',
      details:`${file.name}\n${(file.size/(1024*1024)).toFixed(2)} MB\n\nImportant: OBS receives a File snapshot here, not a persistent live FileSystem handle. Re-select chat.log to refresh after the game writes new data.`,
      level:'success',
      nativePicker:false
    });
  }catch(err){
    beginChatLogReadFault(err,{source:'Fallback chat.log'});
    showObsSourceDiagnostic({
      title:'Could not read chat.log',
      message:'OBS returned a file, but reading or parsing it failed.',
      details:`${err?.name||'Error'}: ${err?.message||String(err)}\n\n${obsEnvironmentSummary()}`,
      level:'error',
      nativePicker:true
    });
    window.showAppToast?.(`Could not read chat.log: ${err?.message||'unknown error'}`,'error',5200);
  }
}

async function handleFallbackChatLogInput(event){
  await consumeFallbackChatLogFile(event?.target?.files?.[0],{direct:false});
}

async function handleObsDirectChatLogInput(event){
  await consumeFallbackChatLogFile(event?.target?.files?.[0],{direct:true});
}

async function retryObsChatLogPicker(){
  await openFallbackChatLogPicker();
}


function isBrowserChatLogConnected(){
  return !!fileHandle && !!liveInterval && !companionBridgeBase;
}
async function hasSavedChatLogHandle(){
  try{return !!(fileHandle||await loadFileHandleFromIDB());}catch{return !!fileHandle;}
}
async function updateChatLogActionButton(){
  const btn=document.getElementById('chatLogActionBtn');
  const text=document.getElementById('chatLogActionText');
  const icon=document.getElementById('chatLogActionIcon');
  const settingsStatus=document.getElementById('settingsChatLogStatus');
  const settingsConnect=document.getElementById('settingsConnectBtn');
  if(!btn&&!settingsStatus&&!settingsConnect)return;

  const connected=!!liveInterval || !!companionBridgeBase;
  const saved=await hasSavedChatLogHandle();

  let label='Select chat.log',glyph='📁',kind='select';
  if(connected){label='Disconnect';glyph='⏹';kind='disconnect';}
  else if(saved){label='Resume Log';glyph='↻';kind='resume';}

  if(btn){
    btn.dataset.chatAction=kind;
    btn.classList.toggle('primary',kind==='select');
    btn.classList.toggle('success',kind==='resume');
    btn.classList.toggle('danger-btn',kind==='disconnect');
    btn.title=label;
  }
  if(text)text.textContent=label;
  if(icon)icon.textContent=glyph;
  if(settingsConnect){
    settingsConnect.textContent=connected?'Disconnect':(saved?'Resume Log':'Select chat.log');
  }
  if(settingsStatus){
    const fileName=fileHandle?.name||'chat.log';
    settingsStatus.textContent=connected?`${fileName} · connected`:saved?`${fileName} · saved, not connected`:'No saved chat.log';
  }
}
async function handleChatLogAction(){
  const btn=document.getElementById('chatLogActionBtn');
  const action=btn?.dataset.chatAction||((await hasSavedChatLogHandle())?'resume':'select');
  if(action==='disconnect')return disconnectChatLog();
  if(action==='resume')return resumeSavedChatLog();
  return pickChatLogFile();
}
function disconnectChatLog(){
  stopLiveHandlePolling();
  stopCompanionBridgePolling({keepReconnect:false});
  setLiveSourceDetails('cached','Disconnected · saved chat.log retained');
  updateChatLogActionButton();
  window.showAppToast?.('chat.log disconnected. Your saved file can be resumed anytime.','info',2600);
  return true;
}
async function forgetSavedChatLog(){
  disconnectChatLog();
  fileHandle=null;
  try{
    if(!db)await initDB();
    const tx=db.transaction(['logs'],'readwrite');
    tx.objectStore('logs').delete('fileHandle');
  }catch(err){console.warn('Could not forget saved chat.log handle:',err);}
  updateChatLogActionButton();
  window.showAppToast?.('Saved chat.log handle forgotten.','info',2400);
}
async function changeChatLogSource(){
  disconnectChatLog();
  return pickChatLogFile();
}
function openEuSettings(){
  document.getElementById('euSettingsBackdrop')?.classList.remove('hidden');
  updateChatLogActionButton();
  window.PixelB8Audio?.syncUI?.();
}
function closeEuSettings(event){
  const backdrop=document.getElementById('euSettingsBackdrop');
  if(event&&event.target!==backdrop)return;
  backdrop?.classList.add('hidden');
}
window.handleChatLogAction=handleChatLogAction;
window.updateChatLogActionButton=updateChatLogActionButton;
window.disconnectChatLog=disconnectChatLog;
window.forgetSavedChatLog=forgetSavedChatLog;
window.changeChatLogSource=changeChatLogSource;
window.openEuSettings=openEuSettings;
window.closeEuSettings=closeEuSettings;

async function pickChatLogFile(){
  // Prefer a persistent FileSystemFileHandle in BOTH normal browsers and OBS.
  // This is what allows getFile() to return a fresh snapshot every poll.
  if(supportsLiveFileHandle()){
    return pickLiveChatLogHandle();
  }

  // Only fall back to input[type=file] when the real File System Access API
  // truly does not exist. This fallback is snapshot-only.
  showObsSourceDiagnostic({
    title:'Live polling unavailable in this browser',
    message:'showOpenFilePicker() is not exposed. A normal file input can only provide a one-time snapshot.',
    details:liveFileHandleEnvironmentSummary(),
    level:'warning',
    nativePicker:true
  });
  toggleObsNativePicker(true);
  return false;
}

async function resumeSavedChatLog(){
  if(isObsBrowserSource()||supportsLiveFileHandle()){
    return reconnectLiveChatLogHandle();
  }

  const handle=await loadFileHandleFromIDB();
  if(!handle){
    window.showAppToast?.('No saved chat.log handle is available. Select chat.log first.','warning',3600);
    return false;
  }

  try{
    fileHandle=handle;
    return await reconnectLiveChatLogHandle();
  }catch(err){
    console.warn('Reconnect failed:',err);
    window.showAppToast?.('Reconnect failed. Select chat.log again.','warning',3600);
    return false;
  }
}





/* =========================================================
   PIXELB8 COMPANION EU BRIDGE
   Auto-detects Companion on localhost before falling back to
   browser FileSystemFileHandle polling. The existing parser stays unchanged.
   ========================================================= */
const COMPANION_BRIDGE_PORTS=Array.from({length:12},(_,i)=>8787+i);
const COMPANION_BRIDGE_POLL_MS=1000;
let companionBridgeBase='';
let companionBridgeOffset=null;
let companionBridgeBusy=false;
let companionBridgeFailures=0;
let companionBridgeSeq=Number(localStorage.getItem('pixelb8_companion_eu_seq')||0)||0;
let companionBridgeLastSeen=0;
let companionReconnectTimer=null;
let companionReconnectBusy=false;
const COMPANION_RECONNECT_MS=3000;


async function companionBridgeFetch(url,timeout=900){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),timeout);
  try{return await fetch(url,{cache:'no-store',mode:'cors',signal:controller.signal,headers:{Accept:'application/json'}})}finally{clearTimeout(timer)}
}
async function findPixelB8CompanionBridge(){
  for(const port of COMPANION_BRIDGE_PORTS){
    const base=`http://127.0.0.1:${port}/api/eu`;
    try{
      const r=await companionBridgeFetch(`${base}/status`,port===8787?650:350);
      if(!r.ok)continue;
      const data=await r.json();
      if(data?.service==='pixelb8-companion-eu-bridge')return {base,status:data};
    }catch{}
  }
  return null;
}
function stopCompanionBridgePolling({keepReconnect=false}={}){
  if(liveInterval){clearInterval(liveInterval);liveInterval=null;}
  companionBridgeBusy=false;
  companionBridgeFailures=0;
  companionBridgeBase='';
  companionBridgeOffset=null;
  if(!keepReconnect&&companionReconnectTimer){clearInterval(companionReconnectTimer);companionReconnectTimer=null;}
}
function scheduleCompanionReconnect(){
  if(companionReconnectTimer)return;
  companionReconnectTimer=setInterval(async()=>{
    if(companionReconnectBusy||companionBridgeBase)return;
    companionReconnectBusy=true;
    try{
      if(await startPixelB8CompanionBridge()){
        clearInterval(companionReconnectTimer);
        companionReconnectTimer=null;
        window.showAppToast?.('PixelB8 Companion reconnected automatically.','success',2800);
      }
    }catch{}
    finally{companionReconnectBusy=false;}
  },COMPANION_RECONNECT_MS);
}
function setLiveSourceDetails(kind,detail=''){
  const status=document.getElementById('fileStatus');
  const source=document.getElementById('streamParserFile');
  const bridge=document.getElementById('streamObsBridgeStatus');
  if(kind==='companion'){
    if(status)status.textContent=`Companion Live · ${detail}`;
    if(source)source.textContent=`Source: PixelB8 Companion · ${detail}`;
    if(bridge)bridge.textContent=`Companion: connected · ${detail}`;
    setConnectionStatus('Companion Live',true);
  }else if(kind==='browser'){
    if(status)status.textContent=`Browser Fallback Live · ${detail}`;
    if(source)source.textContent=`Source: browser file handle · ${detail}`;
    if(bridge)bridge.textContent='Companion: not connected · browser fallback active';
    setConnectionStatus('Browser Live',true);
  }else if(kind==='cached'){
    if(status)status.textContent=detail||'Cached analytics only · no live source connected';
    if(source)source.textContent='Source: cached data';
    if(bridge)bridge.textContent='Companion: not connected';
    setConnectionStatus('Cached / Offline',false);
  }else{
    if(status)status.textContent=detail||'No live chat.log source connected';
    if(source)source.textContent='Source: none';
    if(bridge)bridge.textContent='Companion: not connected';
    setConnectionStatus('No Source',false);
  }
  try{ updateCapturedFreshnessUI?.(); updateLiveMonitorStatus?.(); }catch{}
}
async function pollCompanionBridgeOnce(){
  if(!companionBridgeBase||companionBridgeBusy)return;
  companionBridgeBusy=true;
  try{
    const r=await companionBridgeFetch(`${companionBridgeBase}/changes?since=${encodeURIComponent(companionBridgeSeq)}`,3500);
    const data=await r.json().catch(()=>({}));
    if(!r.ok||data?.ok===false)throw new Error(data?.error||`Companion bridge returned ${r.status}`);
    companionBridgeFailures=0;companionBridgeLastSeen=Date.now();

    if(data.gap===true){
      // Companion's in-memory backlog rolled past this browser's last sequence.
      // Fall back to the durable byte cursor in chat.log so no lines are lost.
      const q=cachedFileSize>0?`?offset=${encodeURIComponent(cachedFileSize)}`:'';
      const tr=await companionBridgeFetch(`${companionBridgeBase}/tail${q}`,3500);
      const tail=await tr.json().catch(()=>({}));
      if(!tr.ok||tail?.ok===false)throw new Error(tail?.error||`Companion tail returned ${tr.status}`);
      if(typeof tail.text==='string'&&tail.text.length)processNewLiveLines(tail.text);
      cachedFileSize=Number(tail.nextOffset)||cachedFileSize;
      cachedFileLastModified=Number(tail.lastModified)||cachedFileLastModified;
    }else if(typeof data.text==='string'&&data.text.length){
      processNewLiveLines(data.text);
      cachedFileSize=Number(data.fileSize)||cachedFileSize;
      cachedFileLastModified=Number(data.lastModified)||cachedFileLastModified;
    }

    companionBridgeSeq=Number(data.nextSeq)||companionBridgeSeq;
    localStorage.setItem('pixelb8_companion_eu_seq',String(companionBridgeSeq));
    if(data.text)saveParsedDataToIDB(globalParsedData,allMobHourlyStats,{name:data.fileName||'chat.log',size:cachedFileSize,lastModified:cachedFileLastModified});
    const activityAge=data.lastActivityAt?Math.max(0,Math.round((Date.now()-Number(data.lastActivityAt))/1000)):null;
    setLiveSourceDetails('companion',`${data.fileName||'chat.log'} · ${activityAge==null?'watching for game activity':activityAge<3?'game activity now':`last game activity ${activityAge}s ago`}`);
  }catch(err){
    companionBridgeFailures++;
    if(companionBridgeFailures>=6){
      console.warn('PixelB8 Companion bridge temporarily unavailable:',err);
      if(liveInterval){clearInterval(liveInterval);liveInterval=null;}
      companionBridgeBase='';
      companionBridgeBusy=false;
      setLiveSourceDetails(fileHandle?'browser':'cached',fileHandle?'Companion reconnecting · browser chat.log fallback available':'Companion reconnecting · cached analytics retained');
      if(fileHandle){
        try{startLiveHandlePolling();}catch{}
      }
      scheduleCompanionReconnect();
    }
  }finally{companionBridgeBusy=false;}
}
async function startPixelB8CompanionBridge(){
  if(!fileHandle)setConnectionStatus('Connecting…',false);
  const found=await findPixelB8CompanionBridge();
  if(!found||found.status?.enabled!==true||found.status?.available!==true)return false;
  stopLiveHandlePolling();
  companionBridgeBase=found.base;
  companionBridgeFailures=0;
  if(companionReconnectTimer){clearInterval(companionReconnectTimer);companionReconnectTimer=null;}

  // Sequence is persistent across page sleeps/reloads. If this is a first-time
  // browser, start at Companion's current sequence instead of replaying old live chunks.
  const stateSeq=Number(found.status?.ingest?.seq)||0;
  const bufferStart=Number(found.status?.ingest?.bufferStartSeq)||stateSeq;
  if(!companionBridgeSeq || companionBridgeSeq>stateSeq || companionBridgeSeq<Math.max(0,bufferStart-1)) companionBridgeSeq=stateSeq;
  localStorage.setItem('pixelb8_companion_eu_seq',String(companionBridgeSeq));
  const currentSize=Number(found.status.size)||0;
  const previousSize=Math.min(Number(cachedFileSize)||0,currentSize);
  // Durable catch-up across Companion restarts: if the browser remembers a
  // byte cursor and chat.log grew while Companion/page was unavailable, ingest
  // those bytes once before switching to the sequence backlog.
  if(previousSize>0 && previousSize<currentSize){
    try{
      const tr=await companionBridgeFetch(`${companionBridgeBase}/tail?offset=${encodeURIComponent(previousSize)}`,4000);
      const tail=await tr.json().catch(()=>({}));
      if(tr.ok&&tail?.ok!==false){
        if(typeof tail.text==='string'&&tail.text.length)processNewLiveLines(tail.text);
        cachedFileSize=Number(tail.nextOffset)||currentSize;
        cachedFileLastModified=Number(tail.lastModified)||cachedFileLastModified;
      }else cachedFileSize=currentSize;
    }catch{cachedFileSize=currentSize;}
  }else cachedFileSize=previousSize||currentSize;
  cachedFileLastModified=Number(found.status.lastModified)||cachedFileLastModified;
  setLiveSourceDetails('companion',`${found.status.fileName||'chat.log'} · watcher active in Companion`);
  updateChatLogActionButton();
  if(liveInterval)clearInterval(liveInterval);
  liveInterval=setInterval(pollCompanionBridgeOnce,COMPANION_BRIDGE_POLL_MS);
  try{
    await pollCompanionBridgeOnce();
  }catch(err){
    console.warn('Initial Companion poll failed; reconnect loop will continue:',err);
    scheduleCompanionReconnect();
  }
  updateChatLogActionButton();
  return true;
}


/* =========================================================
   OBS / BROWSER LIVE FILESYSTEM HANDLE POLLING
   Uses showOpenFilePicker() -> FileSystemFileHandle -> getFile()
   repeatedly, matching the architecture of the earlier working tracker.
   ========================================================= */
const LIVE_HANDLE_POLL_MS=1000;
let liveHandlePollBusy=false;
let liveHandleErrorCount=0;
const LIVE_HANDLE_MAX_ERRORS=8;
let liveHandleDiagnosticShown=false;


function supportsLiveFileHandle(){
  return typeof window.showOpenFilePicker==='function';
}

function liveFileHandleEnvironmentSummary(){
  return [
    `OBS detected: ${isObsBrowserSource()?'yes':'no'}`,
    `window.obsstudio: ${window.obsstudio?'available':'not exposed'}`,
    `showOpenFilePicker: ${supportsLiveFileHandle()?'available':'unavailable'}`,
    `isSecureContext: ${window.isSecureContext?'yes':'no'}`,
    `protocol: ${location.protocol}`,
    `userAgent: ${navigator.userAgent||'unknown'}`,
    `page: ${location.href}`
  ].join('\n');
}

async function ensureLiveHandlePermission(handle,{request=false}={}){
  if(!handle)return false;
  try{
    if(typeof handle.queryPermission==='function'){
      const current=await handle.queryPermission({mode:'read'});
      if(current==='granted')return true;
      if(!request)return false;
    }
    if(request&&typeof handle.requestPermission==='function'){
      return (await handle.requestPermission({mode:'read'}))==='granted';
    }
    // Some CEF versions expose a usable handle without permission methods.
    const probe=await handle.getFile();
    return !!probe;
  }catch{
    return false;
  }
}

async function pollLiveFileHandleOnce(){
  if(!fileHandle||liveHandlePollBusy)return;
  liveHandlePollBusy=true;

  try{
    // IMPORTANT: getFile() is called each poll. This creates a fresh File
    // snapshot from the persistent handle and sees newly appended bytes.
    const file=await fileHandle.getFile();

    if(file.size>lastReadOffset){
      const blob=file.slice(lastReadOffset,file.size);
      const text=await blob.text();

      if(text){
        processNewLiveLines(text);
      }

      lastReadOffset=file.size;
      cachedFileSize=file.size;
      latestKnownFileSize=file.size;

      const status=document.getElementById('fileStatus');
      if(status){
        status.textContent=`Live chat.log · ${(file.size/(1024*1024)).toFixed(2)} MB · polling every ${LIVE_HANDLE_POLL_MS/1000}s`;
      }
      const source=document.getElementById('streamParserFile');
      if(source)source.textContent=`Source: ${file.name} · live handle`;

      setConnectionStatus('Live chat.log',true);
      liveHandleErrorCount=0;
      recoverChatLogReadFault();
      if(liveHandleDiagnosticShown){
        liveHandleDiagnosticShown=false;
        closeObsSourceDiagnostic?.();
      }
      if(typeof syncStreamerHud==='function')syncStreamerHud();
    }else if(file.size<lastReadOffset){
      // Log rotated/truncated.
      lastReadOffset=file.size;
      cachedFileSize=file.size;
      latestKnownFileSize=file.size;
      liveHandleErrorCount=0;
      liveHandleDiagnosticShown=false;
      window.showAppToast?.('chat.log rotation/truncation detected. Live polling resynchronized.','warning',3200);
    }else{
      liveHandleErrorCount=0;
      recoverChatLogReadFault();
      if(liveHandleDiagnosticShown){liveHandleDiagnosticShown=false;closeObsSourceDiagnostic?.();}
    }
  }catch(err){
    liveHandleErrorCount++;
    beginChatLogReadFault(err,{source:'Live FileSystem handle'});
    if(liveHandleErrorCount>=LIVE_HANDLE_MAX_ERRORS){
      liveHandleDiagnosticShown=true;
      stopBrokenLivePolling(err);
    }
  }finally{
    liveHandlePollBusy=false;
  }
}

function startLiveHandlePolling(){
  if(liveInterval){
    clearInterval(liveInterval);
    liveInterval=null;
  }
  liveHandleErrorCount=0;
  liveHandleDiagnosticShown=false;
  liveHandlePollBusy=false;
  legacyLiveReadErrorCount=0;
  liveInterval=setInterval(pollLiveFileHandleOnce,LIVE_HANDLE_POLL_MS);
}

function stopLiveHandlePolling(){
  if(liveInterval){
    clearInterval(liveInterval);
    liveInterval=null;
  }
  liveHandlePollBusy=false;
}

async function initializeLiveFileHandle(handle,{requestPermission=false,startAtEnd=true}={}){
  if(!handle)throw new Error('No FileSystem file handle was returned.');

  const permitted=await ensureLiveHandlePermission(handle,{request:requestPermission});
  if(!permitted){
    throw new DOMException('Read permission was not granted for chat.log.','NotAllowedError');
  }

  const file=await handle.getFile();
  fileHandle=handle;

  if(startAtEnd){
    lastReadOffset=file.size;
  }else if(lastReadOffset>file.size){
    lastReadOffset=0;
  }

  cachedFileSize=file.size;
  latestKnownFileSize=file.size;

  try{
    await saveFileHandleToIDB(handle);
  }catch(err){
    console.warn('Could not persist chat.log handle:',err);
  }

  const source=document.getElementById('streamParserFile');
  if(source)source.textContent=`Source: ${file.name} · live handle`;

  const status=document.getElementById('fileStatus');
  if(status)status.textContent=`Live handle ready · ${(file.size/(1024*1024)).toFixed(2)} MB`;

  setConnectionStatus('Live chat.log',true);
  recoverChatLogReadFault();
  const liveStatus=document.getElementById('streamObsBridgeStatus');
  if(liveStatus)liveStatus.textContent=`Live Polling: ${file.name} · every 1s`;
  startLiveHandlePolling();
  updateChatLogActionButton();

  return file;
}

async function pickLiveChatLogHandle(){
  if(!supportsLiveFileHandle()){
    showObsSourceDiagnostic({
      title:'Live FileSystem picker unavailable',
      message:'This OBS/Chromium build does not expose showOpenFilePicker(). The file-input fallback cannot provide live polling.',
      details:liveFileHandleEnvironmentSummary(),
      level:'error',
      nativePicker:true
    });
    return false;
  }

  try{
    const [handle]=await window.showOpenFilePicker({
      types:[{
        description:'Entropia chat.log (*.log)',
        accept:{'application/octet-stream':['.log']}
      }],
      multiple:false
    });

    await initializeLiveFileHandle(handle,{
      requestPermission:true,
      startAtEnd:true
    });

    window.showAppToast?.('Live chat.log connected. Polling every second.','success',3200);
    return true;
  }catch(err){
    if(err?.name==='AbortError')return false;

    showObsSourceDiagnostic({
      title:'Could not establish live chat.log handle',
      message:'OBS exposed the live file picker, but the FileSystem handle could not be opened or authorized.',
      details:`${err?.name||'Error'}: ${err?.message||String(err)}\n\n${liveFileHandleEnvironmentSummary()}`,
      level:'error',
      nativePicker:true
    });
    return false;
  }
}

async function reconnectLiveChatLogHandle(){
  if(!fileHandle){
    // Try the persisted browser handle first.
    try{
      const saved=await loadFileHandleFromIDB();
      if(saved)fileHandle=saved;
    }catch{}
  }

  if(!fileHandle){
    return pickLiveChatLogHandle();
  }

  try{
    const permitted=await ensureLiveHandlePermission(fileHandle,{request:true});
    if(!permitted)throw new DOMException('Read permission denied.','NotAllowedError');

    // Keep current offset if possible; this reconnect is meant to continue,
    // not intentionally skip new lines.
    await initializeLiveFileHandle(fileHandle,{
      requestPermission:false,
      startAtEnd:false
    });

    window.showAppToast?.('Live chat.log reconnected.','success',2600);
    return true;
  }catch(err){
    showObsSourceDiagnostic({
      title:'Stored chat.log handle needs reauthorization',
      message:'The saved FileSystem handle is stale or OBS revoked its permission. Select chat.log again once to replace it.',
      details:`${err?.name||'Error'}: ${err?.message||String(err)}\n\n${liveFileHandleEnvironmentSummary()}`,
      level:'warning',
      nativePicker:false
    });
    return false;
  }
}

async function processFileHandleIncremental(handle){
  const file=await handle.getFile();
  setConnectionStatus('Syncing cache',false);

  // If the file shrank, was replaced, or no usable cache exists, rebuild it.
  if(!Array.isArray(globalParsedData) || cachedFileSize<0 || file.size<cachedFileSize){
    cachedFileSize=0;
    cachedFileLastModified=0;
    const recent=await readLogForConfiguredLookback(file);
    parseChatLog(recent.text);
    cachedFileSize=file.size;
    cachedFileLastModified=file.lastModified||0;
    cachedAnalysisSignature=getAnalysisCacheSignature();
    saveParsedDataToIDB(globalParsedData,allMobHourlyStats,file);
    setOptionalText('fileStatus',`Cache rebuilt: ${globalParsedData.length.toLocaleString()} creature globals · ${(file.size/(1024*1024)).toFixed(2)} MB`);
  }else if(file.size>cachedFileSize){
    const oldSize=cachedFileSize;
    const appendedBlob=file.slice(cachedFileSize,file.size);
    const appendedText=await appendedBlob.text();

    // Reuse the live-line parser so only newly appended content is processed.
    processNewLiveLines(appendedText);

    cachedFileSize=file.size;
    cachedFileLastModified=file.lastModified||0;
    saveParsedDataToIDB(globalParsedData,allMobHourlyStats,file);

    setOptionalText('fileStatus',`Cache caught up: read only ${(file.size-oldSize).toLocaleString()} new bytes · total ${(file.size/(1024*1024)).toFixed(2)} MB`);
  }else{
    cachedFileLastModified=file.lastModified||cachedFileLastModified;
    setOptionalText('fileStatus',`Cache already current · ${globalParsedData?.length?.toLocaleString()||0} creature globals · ${(file.size/(1024*1024)).toFixed(2)} MB`);
  }

  document.getElementById('fileConnectionCard')?.classList.add('hidden');
  setLiveSourceDetails('browser',`${file.name||'chat.log'} · direct browser file access`);
  startLivePolling(handle,file.size);
}

function startLivePolling(handle,initialSize){
  setLiveSourceDetails('browser',`${handle?.name||'chat.log'} · direct browser file access`);
  const allMobTbody=document.getElementById('allMobLiveTableBody');
  if(allMobTbody)allMobTbody.innerHTML='<tr><td colspan="6" class="empty success">Globals monitoring active. Waiting for creature globals…</td></tr>';

  let lastSize=initialSize;
  legacyLiveReadErrorCount=0;
  if(liveInterval)clearInterval(liveInterval);

  liveInterval=setInterval(async()=>{
    try{
      const currentFile=await handle.getFile();
      if(currentFile.size<lastSize){
        // Log was rotated/truncated.
        lastSize=0;
      }
      if(currentFile.size>lastSize){
        const blob=currentFile.slice(lastSize,currentFile.size);
        const text=await blob.text();
        lastSize=currentFile.size;
        processNewLiveLines(text);

        cachedFileSize=currentFile.size;
        cachedFileLastModified=currentFile.lastModified||cachedFileLastModified;
        saveParsedDataToIDB(globalParsedData,allMobHourlyStats,currentFile);
      }
      if(legacyLiveReadErrorCount>0||chatLogReadFaultActive){
        legacyLiveReadErrorCount=0;
        setConnectionStatus('Live chat.log',true);
        recoverChatLogReadFault();
        closeObsSourceDiagnostic?.();
      }
    }catch(err){
      legacyLiveReadErrorCount++;
      beginChatLogReadFault(err,{source:'Live chat.log'});
      if(legacyLiveReadErrorCount>=LEGACY_LIVE_MAX_ERRORS){
        stopBrokenLivePolling(err);
      }
    }
  },1000);
}

function processNewLiveLines(text){
  const lines=text.split(/\r?\n/);
  const tbody=document.getElementById('liveTableBody');
  const allMobTbody=document.getElementById('allMobLiveTableBody');
  const pedRegex=/([\d,]+\.?\d*)\s*PED/i;
  const timestampRegex=/^(\d{4}[-./]\d{1,2}[-./]\d{1,2})\s+(\d{2}:\d{2}:\d{2})/;
  const nowMs=Date.now();

  for(const line of lines){
    if(!line.trim())continue;
    const lower=line.toLowerCase();
    const tm=line.match(timestampRegex);
    const logDate=tm?new Date(tm[1].replace(/[\./]/g,'-')+'T'+tm[2]+'Z'):new Date();
    const timeStr=tm?`${tm[1]} ${tm[2]}`:logDate.toLocaleTimeString();

    if(lower.includes('entropia universe time:')||(tm&&(nowMs-lastTimeSyncTimestamp>300000))){
      if(lower.includes('entropia universe time:')){
        const idx=lower.indexOf('entropia universe time:');
        const clean=line.slice(idx+'entropia universe time:'.length).trim();
        const normalized=clean.replace(/[\./]/g,'-').replace(' ','T');
        const parsed=new Date(/Z$|[+-]\d\d:?\d\d$/.test(normalized)?normalized:normalized+'Z');
        if(!isNaN(parsed)){
          latestSyncedGameTime=parsed;
          {const el=document.getElementById('syncGameTimeDisplay');if(el)el.textContent=clean;}
          lastTimeSyncTimestamp=nowMs;
        }
      }else if(tm&&!isNaN(logDate)){
        latestSyncedGameTime=logDate;
        {const el=document.getElementById('syncGameTimeDisplay');if(el)el.textContent=timeStr;}
        lastTimeSyncTimestamp=nowMs;
      }
    }

    // Live Hunt consumes all new log lines, not only globals.
    // It is session-gated internally, so analytics catch-up/reload does not spend cost.
    window.EntropiaFishingTracker?.processLine?.(line,logDate||new Date());
    window.EntropiaMiningTracker?.processLine?.(line,logDate||new Date());
    window.EntropiaSessionTracker?.processLine?.(line,logDate||new Date());
    window.EntropiaHuntTracker?.processLine?.(line,logDate);
    window.EntropiaWaypoints?.parseLine?.(line,logDate||new Date());
    window.EntropiaTeamTracker?.processLine?.(line,logDate);

    const isGlobalLine=lower.includes('[globals]')||lower.includes('global')||lower.includes('hall of fame');
    if(!isGlobalLine)continue;

    // Existing overall/global hourly statistic remains unchanged.
    if(logDate&&!isNaN(logDate))allMobHourlyStats[logDate.getHours()]++;

    const pedMatch=line.match(pedRegex);
    const pedNum=pedMatch?parseFloat(pedMatch[1].replace(/,/g,'')):0;
    const pedVal=pedMatch?pedMatch[1]+' PED':'Unknown';
    const isHof=lower.includes('hall of fame')||lower.includes('hof');

    // ---------- ALL CREATURE / MOB GLOBALS ----------
    const detectedMob=parseGlobalMobName(line);
    if(detectedMob){
      const allPlayer=parsePlayerName(line,detectedMob);

      liveAllMobGlobals++;
      liveAllMobFeedPed+=pedNum||0;
      if(isHof)liveAllMobHofs++;

      if(allMobTbody?.querySelector('.empty'))allMobTbody.innerHTML='';

      const allRow=document.createElement('tr');
      allRow.dataset.player=String(allPlayer||'').trim().toLowerCase();
      allRow.innerHTML=`
        <td>${escapeHtml(timeStr)}</td>
        <td class="${isHof?'hof':'success'}" style="font-weight:900">${isHof?'HOF':'Global'}</td>
        <td class="all-mob-name">${escapeHtml(detectedMob)}</td>
        <td>${escapeHtml(allPlayer)}</td>
        <td class="${isHof?'hof':'success'}" style="font-weight:800">${escapeHtml(pedVal)}</td>
        <td title="${escapeHtml(line)}">${escapeHtml(line)}</td>`;
      allMobTbody?.prepend(allRow);
    }

    // ---------- WATCHLIST SUBSET ----------
    // All detected creature globals are analytics records. The watchlist only
    // controls the focused feed/recommendations; it never gates ingestion.
    if(detectedMob){
      const allPlayer=parsePlayerName(line,detectedMob);
      if(!globalParsedData)globalParsedData=[];
      globalParsedData.push({mob:detectedMob,date:logDate,ped:pedNum,isHof,hour:logDate.getHours(),player:allPlayer,raw:line});
    }

    const targetMob=targetMobs.find(mob=>lower.includes(mob));
    if(!targetMob)continue;

    const player=parsePlayerName(line,targetMob);

    if(userAvatarName&&player.toLowerCase()===userAvatarName){
      if(!firstUserGlobalTime&&logDate>=eventStart&&logDate<=eventEnd){
        firstUserGlobalTime=logDate;
        startTimerCountdown();
      }
    }

    if(voiceAnnouncerEnabled){
      speakText(`${player} scored a ${isHof?'Hall of Fame':'Global'} of ${pedVal} on ${targetMob}.`);
    }

    liveSessionGlobals++;
    liveTargetFeedPed+=pedNum||0;
    if(isHof)liveSessionHofs++;
    liveLargestLoot=Math.max(liveLargestLoot,pedNum||0);
    liveLatestMob=targetMob;

    if(tbody?.querySelector('.empty'))tbody.innerHTML='';

    const row=document.createElement('tr');
    row.innerHTML=`
      <td>${escapeHtml(timeStr)}</td>
      <td class="${isHof?'hof':'success'}" style="font-weight:900">${isHof?'HOF':'Global'}</td>
      <td class="mob-name">${escapeHtml(targetMob)}</td>
      <td>${escapeHtml(player)}</td>
      <td class="${isHof?'hof':'success'}" style="font-weight:800">${escapeHtml(pedVal)}</td>
      <td title="${escapeHtml(line)}">${escapeHtml(line)}</td>`;
    tbody?.prepend(row);
  }

  // Keep both live tables bounded so an all-day session stays responsive.
  if(tbody)while(tbody.rows.length>300)tbody.deleteRow(tbody.rows.length-1);
  if(allMobTbody)while(allMobTbody.rows.length>300)allMobTbody.deleteRow(allMobTbody.rows.length-1);

  updateLiveSummary();
  updateLiveMonitorStatus?.();
  updateAnalyticsDisplay();
  try{ renderCapturedHistory?.(); }catch{}
}

function saveParsedDataToIDB(records,allMobStats,fileMeta=null){
  if(!db)return;
  const tx=db.transaction(['logs'],'readwrite');
  const store=tx.objectStore('logs');
  store.put({id:'parsedRecords',data:records});
  store.put({id:'allMobStats',data:allMobStats});
  if(fileMeta){
    store.put({
      id:'fileMeta',
      data:{
        size:fileMeta.size||0,
        lastModified:fileMeta.lastModified||0,
        name:fileMeta.name||'',
        analysisSignature:getAnalysisCacheSignature()
      }
    });
  }
}

async function loadParsedDataFromIDB(){
  if(!db)await initDB();
  return new Promise(resolve=>{
    const tx=db.transaction(['logs'],'readonly');
    const store=tx.objectStore('logs');
    const reqRecords=store.get('parsedRecords');
    const reqAllStats=store.get('allMobStats');
    const reqMeta=store.get('fileMeta');
    let resRecords=null,resAllStats=null,resMeta=null;
    reqRecords.onsuccess=()=>{
      if(reqRecords.result?.data){
        resRecords=reqRecords.result.data.map(r=>({...r,date:r.date?new Date(r.date):null}));
      }
      done();
    };
    reqAllStats.onsuccess=()=>{
      if(reqAllStats.result?.data)resAllStats=reqAllStats.result.data;
      done();
    };
    reqMeta.onsuccess=()=>{
      if(reqMeta.result?.data)resMeta=reqMeta.result.data;
      done();
    };
    function done(){
      if(reqRecords.readyState==='done'&&reqAllStats.readyState==='done'&&reqMeta.readyState==='done'){
        resolve({records:resRecords,allStats:resAllStats,meta:resMeta});
      }
    }
  });
}

function clearLiveFeed(){
  const all=document.getElementById('allMobLiveTableBody');
  if(all)all.innerHTML='<tr><td colspan="6" class="empty">Live feed cleared. Monitoring continues…</td></tr>';
  liveSessionGlobals=0;liveSessionHofs=0;liveLargestLoot=0;liveLatestMob='—';liveTargetFeedPed=0;
  liveAllMobGlobals=0;liveAllMobHofs=0;liveAllMobFeedPed=0;
  updateLiveSummary();
}


/*
 * Cache migration note:
 * v1 of Casual Mode still uses the existing parsed-record cache.
 * The next combat/loadout pass should promote this to an all-creature record cache
 * so arbitrary target changes never require reparsing chat.log.
 */





document.addEventListener('DOMContentLoaded',()=>{
  updateChatLogActionButton();
  setTimeout(async()=>{
    // Browser FileSystem polling is the core live source and must never wait on
    // Companion discovery. Restore it immediately when we have permission.
    if(supportsLiveFileHandle()){
      try{
        const saved=await loadFileHandleFromIDB();
        if(saved){
          fileHandle=saved;
          const permitted=await ensureLiveHandlePermission(saved,{request:false});
          if(permitted){
            const file=await initializeLiveFileHandle(saved,{requestPermission:false,startAtEnd:true});
            setLiveSourceDetails('browser',`${file.name} · restored browser file handle`);
          }else{
            const el=document.getElementById('streamObsBridgeStatus');
            if(el)el.textContent='Browser live polling: saved chat.log needs permission';
          }
        }
      }catch(err){
        console.warn('Automatic browser chat.log restore unavailable:',err);
      }
    }

    // Companion is optional. Discover it in the background and let it take over
    // only if its bridge is actually reachable and configured.
    startPixelB8CompanionBridge().catch(err=>{
      console.warn('PixelB8 Companion bridge unavailable; browser polling remains active:',err);
      scheduleCompanionReconnect();
    });
  },250);
});
