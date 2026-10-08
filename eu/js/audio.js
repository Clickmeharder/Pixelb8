(()=>{
  const script=document.currentScript;
  const scriptUrl=script?.src?new URL(script.src,location.href):new URL('js/audio.js',location.href);
  const siteRoot=new URL('../../',scriptUrl);
  const sharedSoundsRoot=new URL('sharedassets/sounds/',siteRoot);
  const PREF_KEY='pixelb8_eu_audio_settings_v1';
  const DB_NAME='pixelb8_eu_audio';
  const STORE='sounds';
  const EVENTS={
    'dung-sound':{label:'Dung Pickup',enabled:false,defaultFile:'dung-pickup.mp3',tone:[180,0.12]},
    'oil-sound':{label:'Item Pickup',enabled:false,defaultFile:'ka-ching.mp3',tone:[360,0.11]},
    'lahar-event':{label:'Lahar Event',enabled:false,defaultFile:'lahar-event.mp3',tone:[250,0.35]},
    'mission-done':{label:'Mission Cooldown Audio Alert',enabled:true,defaultFile:'cooldown-finished.mp3',tone:[740,0.16]},
    'chatlog-read-error':{label:'Chat Log Read Error',enabled:true,defaultFile:'log-read-error.mp3',tone:[165,0.48]},
    'chatlog-reconnected':{label:'Chat Log Reconnected',enabled:false,tone:[690,0.14]}
  };
  let dbPromise=null,pendingEvent='';
  const objectUrls=new Map();
  function prefs(){
    try{const raw=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');return raw&&typeof raw==='object'?raw:{};}catch{return {};}
  }
  function savePrefs(p){try{localStorage.setItem(PREF_KEY,JSON.stringify(p));}catch{}}
  function isMuted(){return !!prefs().muted;}
  function isEnabled(event){const p=prefs();return p.enabled?.[event] ?? EVENTS[event]?.enabled ?? true;}
  function setEnabled(event,value){const p=prefs();p.enabled={...(p.enabled||{}),[event]:!!value};savePrefs(p);syncUI();}
  function toggleMute(){const p=prefs();p.muted=!p.muted;savePrefs(p);syncUI();return p.muted;}
  function openDB(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise((resolve,reject)=>{
      if(!window.indexedDB){resolve(null);return;}
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'event'});};
      req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);
    }).catch(err=>{console.warn('Audio storage unavailable',err);return null;});
    return dbPromise;
  }
  async function getRecord(event){const db=await openDB();if(!db)return null;return new Promise(resolve=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get(event);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>resolve(null);});}
  async function putRecord(event,file){const db=await openDB();if(!db)return false;return new Promise(resolve=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({event,name:file.name,type:file.type,blob:file,lastModified:file.lastModified||0});tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false);});}
  async function clearRecords(){const db=await openDB();if(!db)return;await new Promise(resolve=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).clear();tx.oncomplete=resolve;tx.onerror=resolve;});for(const url of objectUrls.values())URL.revokeObjectURL(url);objectUrls.clear();}
  async function customUrl(event){
    if(objectUrls.has(event))return objectUrls.get(event);
    const rec=await getRecord(event);if(!rec?.blob)return '';
    const url=URL.createObjectURL(rec.blob);objectUrls.set(event,url);return url;
  }
  function playTone(event){
    const spec=EVENTS[event]?.tone||[440,.12];
    try{const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return;const ctx=new Ctx(),osc=ctx.createOscillator(),gain=ctx.createGain();const globalVolume=window.PixelB8GlobalAudio?.getVolume?.()??1;osc.type='sine';osc.frequency.value=spec[0];gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(Math.max(.0001,.18*globalVolume),ctx.currentTime+.008);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+spec[1]);osc.connect(gain).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+spec[1]+.02);osc.onended=()=>ctx.close?.();}catch(err){console.warn('Default sound failed',err);}
  }
  async function play(event,{force=false}={}){
    if(!EVENTS[event])return false;
    if(!force&&(isMuted()||!isEnabled(event)))return false;
    const custom=await customUrl(event);
    const defaultFile=EVENTS[event]?.defaultFile;
    const url=custom||(defaultFile?new URL(defaultFile,sharedSoundsRoot).href:'');
    if(url){try{const a=new Audio(url);a.volume=window.PixelB8GlobalAudio?.getVolume?.()??1;await a.play();return true;}catch(err){console.warn('Audio playback failed; using tone fallback',err);}}
    playTone(event);return true;
  }
  function preview(event){return play(event,{force:true});}
  function chooseSound(event){pendingEvent=event;const input=document.getElementById('audioFilePicker');if(!input)return;input.value='';input.click();}
  async function onFilePicked(e){
    const file=e.target.files?.[0];if(!file||!pendingEvent)return;
    const event=pendingEvent;pendingEvent='';
    if(!file.type.startsWith('audio/')){window.showAppToast?.('Please choose an audio file.','error');return;}
    if(file.size>12*1024*1024){window.showAppToast?.('Audio file is too large (12 MB max).','error');return;}
    if(objectUrls.has(event)){URL.revokeObjectURL(objectUrls.get(event));objectUrls.delete(event);}
    if(await putRecord(event,file)){syncUI();window.showAppToast?.(`${EVENTS[event].label} sound changed.`,'success');preview(event);}
    else window.showAppToast?.('Could not save custom audio in this browser.','error');
  }
  async function resetAllSounds(){
    if(!confirm('Reset all EU tracker sounds to their defaults?'))return;
    await clearRecords();localStorage.removeItem(PREF_KEY);syncUI();window.showAppToast?.('Audio settings reset to defaults.','success');
  }
  async function syncUI(){
    const p=prefs(),mute=document.getElementById('audioGlobalMuteBtn');if(mute){mute.textContent=p.muted?'Unmute Audio':'Global Mute';mute.classList.toggle('danger-btn',!!p.muted);}
    for(const event of Object.keys(EVENTS)){
      const row=document.querySelector(`[data-audio-event="${event}"]`);if(!row)continue;
      const cb=row.querySelector('input[type="checkbox"]');if(cb)cb.checked=isEnabled(event);
      const rec=await getRecord(event);const label=row.querySelector('.audio-file-name');if(label)label.textContent=rec?.name||(EVENTS[event]?.defaultFile?`Default · ${EVENTS[event].defaultFile}`:'Default');
    }
  }
  document.addEventListener('DOMContentLoaded',()=>{document.getElementById('audioFilePicker')?.addEventListener('change',onFilePicked);syncUI();window.PixelB8GlobalAudio?.syncUI?.();});
  window.PixelB8Audio={play,preview,chooseSound,setEnabled,toggleMute,isMuted,isEnabled,resetAllSounds,syncUI,events:EVENTS};
  window.playSound=window.playSound||((event)=>play(event));
})();
