function parseLogTimestampFromLine(line){
  const tm=line.match(/^(\d{4}[-./]\d{1,2}[-./]\d{1,2})\s+(\d{2}:\d{2}:\d{2})/);
  if(!tm)return null;
  const d=new Date(tm[1].replace(/[\./]/g,'-')+'T'+tm[2]);
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
  const referenceMs=(file.lastModified&&file.lastModified<Date.now()+86400000)
    ?Math.max(file.lastModified,Date.now()-3650*86400000)
    :Date.now();
  const cutoff=getAnalysisReadCutoff(new Date(referenceMs));

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
    console.error('Fallback chat.log read failed:',err);
    setConnectionStatus('Read error',false);
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
   OBS / BROWSER LIVE FILESYSTEM HANDLE POLLING
   Uses showOpenFilePicker() -> FileSystemFileHandle -> getFile()
   repeatedly, matching the architecture of the earlier working tracker.
   ========================================================= */
const LIVE_HANDLE_POLL_MS=1000;
let liveHandlePollBusy=false;
let liveHandleErrorCount=0;
const LIVE_HANDLE_MAX_ERRORS=5;

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
      if(typeof syncStreamerHud==='function')syncStreamerHud();
    }else if(file.size<lastReadOffset){
      // Log rotated/truncated.
      lastReadOffset=file.size;
      cachedFileSize=file.size;
      latestKnownFileSize=file.size;
      liveHandleErrorCount=0;
      window.showAppToast?.('chat.log rotation/truncation detected. Live polling resynchronized.','warning',3200);
    }else{
      liveHandleErrorCount=0;
    }
  }catch(err){
    liveHandleErrorCount++;
    console.error('Live FileSystem handle poll failed:',err);

    if(liveHandleErrorCount>=LIVE_HANDLE_MAX_ERRORS){
      stopLiveHandlePolling();
      setConnectionStatus('Live file access lost',false);
      showObsSourceDiagnostic({
        title:'Live chat.log polling lost access',
        message:'The FileSystem handle stopped returning fresh chat.log data.',
        details:`${err?.name||'Error'}: ${err?.message||String(err)}\n\n${liveFileHandleEnvironmentSummary()}`,
        level:'error',
        nativePicker:!supportsLiveFileHandle()
      });
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
  liveHandlePollBusy=false;
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
  const liveStatus=document.getElementById('streamObsBridgeStatus');
  if(liveStatus)liveStatus.textContent=`Live Polling: ${file.name} · every 1s`;
  startLiveHandlePolling();


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
    document.getElementById('fileStatus').textContent=
      `Cache rebuilt: ${globalParsedData.length.toLocaleString()} target records · ${(file.size/(1024*1024)).toFixed(2)} MB`;
  }else if(file.size>cachedFileSize){
    const oldSize=cachedFileSize;
    const appendedBlob=file.slice(cachedFileSize,file.size);
    const appendedText=await appendedBlob.text();

    // Reuse the live-line parser so only newly appended content is processed.
    processNewLiveLines(appendedText);

    cachedFileSize=file.size;
    cachedFileLastModified=file.lastModified||0;
    saveParsedDataToIDB(globalParsedData,allMobHourlyStats,file);

    document.getElementById('fileStatus').textContent=
      `Cache caught up: read only ${(file.size-oldSize).toLocaleString()} new bytes · total ${(file.size/(1024*1024)).toFixed(2)} MB`;
  }else{
    cachedFileLastModified=file.lastModified||cachedFileLastModified;
    document.getElementById('fileStatus').textContent=
      `Cache already current · ${globalParsedData?.length?.toLocaleString()||0} target records · ${(file.size/(1024*1024)).toFixed(2)} MB`;
  }

  document.getElementById('fileConnectionCard').classList.add('hidden');
  setConnectionStatus('Live',true);
  startLivePolling(handle,file.size);
}

function startLivePolling(handle,initialSize){
  setConnectionStatus('Live',true);
  const tbody=document.getElementById('liveTableBody');
  const allMobTbody=document.getElementById('allMobLiveTableBody');
  tbody.innerHTML='<tr><td colspan="6" class="empty success">Live monitoring active. Waiting for target-mob globals…</td></tr>';
  allMobTbody.innerHTML='<tr><td colspan="6" class="empty success">Live monitoring active. Waiting for creature globals…</td></tr>';

  let lastSize=initialSize;
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
    }catch(err){
      console.error("Live read error:",err);
      setConnectionStatus('Read error',false);
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
    const logDate=tm?new Date(tm[1].replace(/[\./]/g,'-')+'T'+tm[2]):new Date();
    const timeStr=tm?`${tm[1]} ${tm[2]}`:logDate.toLocaleTimeString();

    if(lower.includes('entropia universe time:')||(tm&&(nowMs-lastTimeSyncTimestamp>300000))){
      if(lower.includes('entropia universe time:')){
        const idx=lower.indexOf('entropia universe time:');
        const clean=line.slice(idx+'entropia universe time:'.length).trim();
        const parsed=new Date(clean.replace(/[\./]/g,'-'));
        if(!isNaN(parsed)){
          latestSyncedGameTime=parsed;
          document.getElementById('syncGameTimeDisplay').textContent=clean;
          lastTimeSyncTimestamp=nowMs;
        }
      }else if(tm&&!isNaN(logDate)){
        latestSyncedGameTime=logDate;
        document.getElementById('syncGameTimeDisplay').textContent=timeStr;
        lastTimeSyncTimestamp=nowMs;
      }
    }

    // Live Hunt consumes all new log lines, not only globals.
    // It is session-gated internally, so analytics catch-up/reload does not spend cost.
    window.EntropiaHuntTracker?.processLine?.(line,logDate);
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

      if(allMobTbody.querySelector('.empty'))allMobTbody.innerHTML='';

      const allRow=document.createElement('tr');
      allRow.innerHTML=`
        <td>${escapeHtml(timeStr)}</td>
        <td class="${isHof?'hof':'success'}" style="font-weight:900">${isHof?'HOF':'Global'}</td>
        <td class="all-mob-name">${escapeHtml(detectedMob)}</td>
        <td>${escapeHtml(allPlayer)}</td>
        <td class="${isHof?'hof':'success'}" style="font-weight:800">${escapeHtml(pedVal)}</td>
        <td title="${escapeHtml(line)}">${escapeHtml(line)}</td>`;
      allMobTbody.prepend(allRow);
    }

    // ---------- TARGET SIX SUBSET ----------
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

    // Keep target-only live data reflected in target analytics/schedule.
    if(!globalParsedData)globalParsedData=[];
    globalParsedData.push({
      mob:targetMob,date:logDate,ped:pedNum,isHof,
      hour:logDate.getHours(),player,raw:line
    });

    if(tbody.querySelector('.empty'))tbody.innerHTML='';

    const row=document.createElement('tr');
    row.innerHTML=`
      <td>${escapeHtml(timeStr)}</td>
      <td class="${isHof?'hof':'success'}" style="font-weight:900">${isHof?'HOF':'Global'}</td>
      <td class="mob-name">${escapeHtml(targetMob)}</td>
      <td>${escapeHtml(player)}</td>
      <td class="${isHof?'hof':'success'}" style="font-weight:800">${escapeHtml(pedVal)}</td>
      <td title="${escapeHtml(line)}">${escapeHtml(line)}</td>`;
    tbody.prepend(row);
  }

  // Keep both live tables bounded so an all-day session stays responsive.
  while(tbody.rows.length>300)tbody.deleteRow(tbody.rows.length-1);
  while(allMobTbody.rows.length>300)allMobTbody.deleteRow(allMobTbody.rows.length-1);

  updateLiveSummary();
  updateScheduleDisplay();
  updateAnalyticsDisplay();
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
  document.getElementById('liveTableBody').innerHTML=
    '<tr><td colspan="6" class="empty">Target feed cleared. Live monitoring continues…</td></tr>';
  document.getElementById('allMobLiveTableBody').innerHTML=
    '<tr><td colspan="6" class="empty">All-mob feed cleared. Live monitoring continues…</td></tr>';

  liveSessionGlobals=0;
  liveSessionHofs=0;
  liveLargestLoot=0;
  liveLatestMob='—';
  liveAllMobGlobals=0;
  liveAllMobHofs=0;
  liveTargetFeedPed=0;
  liveAllMobFeedPed=0;
  updateLiveSummary();
}


/*
 * Cache migration note:
 * v1 of Casual Mode still uses the existing parsed-record cache.
 * The next combat/loadout pass should promote this to an all-creature record cache
 * so arbitrary target changes never require reparsing chat.log.
 */





document.addEventListener('DOMContentLoaded',()=>{
  setTimeout(async()=>{
    if(!supportsLiveFileHandle())return;

    try{
      const saved=await loadFileHandleFromIDB();
      if(!saved)return;

      fileHandle=saved;
      const permitted=await ensureLiveHandlePermission(saved,{request:false});
      if(!permitted){
        const el=document.getElementById('streamObsBridgeStatus');
        if(el)el.textContent='Live Polling: saved handle needs permission';
        return;
      }

      const file=await initializeLiveFileHandle(saved,{
        requestPermission:false,
        startAtEnd:true
      });

      const el=document.getElementById('streamObsBridgeStatus');
      if(el)el.textContent=`Live Polling: ${file.name} · 1s`;
    }catch(err){
      console.warn('Automatic live handle restore unavailable:',err);
    }
  },700);
});
