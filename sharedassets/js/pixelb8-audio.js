(()=>{
  const script=document.currentScript;
  const scriptUrl=script?.src?new URL(script.src,location.href):new URL('sharedassets/js/pixelb8-audio.js',location.href);
  const soundsRoot=new URL('../sounds/',scriptUrl);
  const PREF_KEY='pixelb8_global_audio_settings_v1';
  const DB_NAME='pixelb8_global_audio';
  const STORE='sounds';
  const EVENTS={
    'ui-click':{label:'UI Click',enabled:false,defaultFile:'ui-click.mp3',tone:[520,0.035]}
  };
  let dbPromise=null,pendingEvent='';
  const objectUrls=new Map();

  function prefs(){
    try{const raw=JSON.parse(localStorage.getItem(PREF_KEY)||'{}');return raw&&typeof raw==='object'?raw:{};}catch{return {};}
  }
  function savePrefs(p){try{localStorage.setItem(PREF_KEY,JSON.stringify(p));}catch{}}
  function isMuted(){return !!prefs().muted}
  function getVolume(){
    const value=Number(prefs().volume);
    return Number.isFinite(value)?Math.min(1,Math.max(0,value)):1;
  }
  function setVolume(value){
    const p=prefs();
    p.volume=Math.min(1,Math.max(0,Number(value)||0));
    savePrefs(p);
    syncUI();
    return p.volume;
  }
  function isEnabled(event){const p=prefs();return p.enabled?.[event] ?? EVENTS[event]?.enabled ?? true}
  function setEnabled(event,value){const p=prefs();p.enabled={...(p.enabled||{}),[event]:!!value};savePrefs(p);syncUI()}
  function toggleMute(){const p=prefs();p.muted=!p.muted;savePrefs(p);syncUI();return p.muted}

  function openDB(){
    if(dbPromise)return dbPromise;
    dbPromise=new Promise(resolve=>{
      if(!window.indexedDB){resolve(null);return}
      const req=indexedDB.open(DB_NAME,1);
      req.onupgradeneeded=()=>{const db=req.result;if(!db.objectStoreNames.contains(STORE))db.createObjectStore(STORE,{keyPath:'event'})};
      req.onsuccess=()=>resolve(req.result);
      req.onerror=()=>resolve(null);
    });
    return dbPromise;
  }
  async function getRecord(event){
    const db=await openDB();if(!db)return null;
    return new Promise(resolve=>{const tx=db.transaction(STORE,'readonly');const r=tx.objectStore(STORE).get(event);r.onsuccess=()=>resolve(r.result||null);r.onerror=()=>resolve(null)});
  }
  async function putRecord(event,file){
    const db=await openDB();if(!db)return false;
    return new Promise(resolve=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).put({event,name:file.name,type:file.type,blob:file,lastModified:file.lastModified||0});tx.oncomplete=()=>resolve(true);tx.onerror=()=>resolve(false)});
  }
  async function clearRecord(event){
    const db=await openDB();
    if(db)await new Promise(resolve=>{const tx=db.transaction(STORE,'readwrite');tx.objectStore(STORE).delete(event);tx.oncomplete=resolve;tx.onerror=resolve});
    if(objectUrls.has(event)){URL.revokeObjectURL(objectUrls.get(event));objectUrls.delete(event)}
  }
  async function customUrl(event){
    if(objectUrls.has(event))return objectUrls.get(event);
    const rec=await getRecord(event);if(!rec?.blob)return '';
    const url=URL.createObjectURL(rec.blob);objectUrls.set(event,url);return url;
  }
  function defaultUrl(event){const file=EVENTS[event]?.defaultFile;return file?new URL(file,soundsRoot).href:''}
  function playTone(event){
    const spec=EVENTS[event]?.tone||[440,.12];
    try{
      const Ctx=window.AudioContext||window.webkitAudioContext;if(!Ctx)return false;
      const ctx=new Ctx(),osc=ctx.createOscillator(),gain=ctx.createGain();
      const volume=getVolume();
      osc.frequency.value=spec[0];
      gain.gain.setValueAtTime(.0001,ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(Math.max(.0001,.18*volume),ctx.currentTime+.008);
      gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+spec[1]);
      osc.connect(gain).connect(ctx.destination);osc.start();osc.stop(ctx.currentTime+spec[1]+.02);osc.onended=()=>ctx.close?.();return true;
    }catch{return false}
  }
  async function play(event,{force=false}={}){
    if(!EVENTS[event])return false;
    if(!force&&(isMuted()||!isEnabled(event)))return false;
    const url=await customUrl(event)||defaultUrl(event);
    if(url){
      try{
        const a=new Audio(url);
        a.volume=getVolume();
        await a.play();
        return true;
      }
      catch(err){console.warn(`PixelB8 ${event} audio playback failed; using tone fallback.`,err)}
    }
    return playTone(event);
  }
  function preview(event){return play(event,{force:true})}
  function chooseSound(event){
    if(!EVENTS[event])return;
    pendingEvent=event;ensureSettingsUI();
    const input=document.getElementById('pixelb8GlobalAudioFilePicker');if(!input)return;
    input.value='';input.click();
  }
  async function onFilePicked(e){
    const file=e.target.files?.[0],event=pendingEvent;pendingEvent='';
    if(!file||!event)return;
    if(!file.type.startsWith('audio/')){window.showAppToast?.('Please choose an audio file.','error');return}
    if(file.size>12*1024*1024){window.showAppToast?.('Audio file is too large (12 MB max).','error');return}
    if(objectUrls.has(event)){URL.revokeObjectURL(objectUrls.get(event));objectUrls.delete(event)}
    if(await putRecord(event,file)){await syncUI();window.showAppToast?.(`${EVENTS[event].label} sound changed globally.`,'success');preview(event)}
    else window.showAppToast?.('Could not save custom audio in this browser.','error');
  }
  async function resetSound(event){
    await clearRecord(event);
    const p=prefs();if(p.enabled)delete p.enabled[event];savePrefs(p);
    await syncUI();window.showAppToast?.(`${EVENTS[event].label} restored to its PixelB8 default.`,'success');
  }

  function ensureStyles(){
    if(document.getElementById('pixelb8GlobalSettingsStyles'))return;
    const style=document.createElement('style');style.id='pixelb8GlobalSettingsStyles';
    style.textContent=`
      .pixelb8-global-settings-backdrop{position:fixed;inset:0;z-index:12000;display:grid;place-items:center;padding:18px;background:rgba(3,7,11,.76);backdrop-filter:blur(5px)}
      .pixelb8-global-settings-backdrop.hidden{display:none!important}
      .pixelb8-global-settings-card{width:min(620px,calc(100vw - 28px));max-height:min(720px,calc(100vh - 36px));overflow:auto;border:1px solid rgba(95,172,214,.28);border-radius:10px;background:linear-gradient(180deg,#151b22,#0e1319);color:#e7edf3;box-shadow:0 24px 70px rgba(0,0,0,.58);font-family:Inter,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif}
      .pixelb8-global-settings-head{position:sticky;top:0;z-index:2;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;border-bottom:1px solid #29333e;background:rgba(18,24,31,.97)}
      .pixelb8-global-settings-kicker{display:block;margin-bottom:3px;color:#7d8b98;font-size:.61rem;font-weight:850;letter-spacing:.1em;text-transform:uppercase}
      .pixelb8-global-settings-head h3{margin:0;font-size:1rem;color:#f4f8fb}
      .pixelb8-global-settings-close,.pixelb8-global-audio-btn{border:1px solid #34414d;border-radius:6px;background:#171e25;color:#d9e4ec;min-height:32px;padding:6px 10px;font:inherit;font-size:.73rem;font-weight:750;cursor:pointer}
      .pixelb8-global-settings-close{width:34px;padding:0;font-size:1.15rem}
      .pixelb8-global-audio-btn:hover,.pixelb8-global-settings-close:hover{border-color:#55c9ff;color:#8edcff}
      .pixelb8-global-audio-btn.danger{border-color:rgba(255,107,107,.28);color:#ffaaaa}
      .pixelb8-global-settings-body{padding:15px 16px 18px;display:grid;gap:14px}
      .pixelb8-global-settings-note{color:#91a0ad;font-size:.7rem;line-height:1.5}
      .pixelb8-global-audio-section{border:1px solid #29333e;border-radius:8px;background:#10161c;overflow:hidden}
      .pixelb8-global-audio-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px;border-bottom:1px solid #26303a;background:#141b22}
      .pixelb8-global-audio-head strong{display:block;font-size:.78rem}.pixelb8-global-audio-head span{display:block;margin-top:2px;color:#8795a2;font-size:.64rem}
      .pixelb8-global-audio-row{display:grid;grid-template-columns:minmax(0,1fr) auto auto auto;gap:8px;align-items:center;padding:10px 12px}
      .pixelb8-global-audio-row label{display:flex;align-items:center;gap:8px;font-size:.75rem;font-weight:750}.pixelb8-global-audio-file{color:#83919e;font-size:.64rem;white-space:nowrap}
      .pixelb8-global-volume-row{display:grid;grid-template-columns:auto minmax(120px,1fr) 46px;gap:10px;align-items:center;padding:10px 12px;border-bottom:1px solid #26303a}
      .pixelb8-global-volume-row label{font-size:.75rem;font-weight:800;color:#dce5ee}
      .pixelb8-global-volume-row input[type="range"]{width:100%;accent-color:#4fc3f7}
      .pixelb8-global-volume-value{text-align:right;color:#8edcff;font-size:.7rem;font-weight:850;font-variant-numeric:tabular-nums}
      @media(max-width:600px){.pixelb8-global-audio-row{grid-template-columns:1fr auto;align-items:start}.pixelb8-global-audio-file{grid-column:1/-1}.pixelb8-global-volume-row{grid-template-columns:1fr 42px}.pixelb8-global-volume-row label{grid-column:1/-1}}
    `;
    document.head.appendChild(style);
  }
  function ensureSettingsUI(){
    ensureStyles();
    if(document.getElementById('pixelb8GlobalSettingsBackdrop'))return;
    const wrap=document.createElement('div');wrap.id='pixelb8GlobalSettingsBackdrop';wrap.className='pixelb8-global-settings-backdrop hidden';
    wrap.innerHTML=`
      <section class="pixelb8-global-settings-card" role="dialog" aria-modal="true" aria-labelledby="pixelb8GlobalSettingsTitle" onclick="event.stopPropagation()">
        <div class="pixelb8-global-settings-head">
          <div><span class="pixelb8-global-settings-kicker">PIXELB8 SETTINGS</span><h3 id="pixelb8GlobalSettingsTitle">Settings</h3></div>
          <button class="pixelb8-global-settings-close" type="button" data-pixelb8-global-close data-no-ui-click>×</button>
        </div>
        <div class="pixelb8-global-settings-body">
          <div class="pixelb8-global-settings-note">Global settings are shared by PixelB8 Home, Arcade, EU, OSRS, and future PixelB8 pages in this browser.</div>
          <section class="pixelb8-global-audio-section">
            <div class="pixelb8-global-audio-head">
              <div><strong>Global Audio</strong><span>Sounds used across PixelB8 pages.</span></div>
              <button class="pixelb8-global-audio-btn" id="pixelb8GlobalAudioMute" type="button">Mute Global Audio</button>
            </div>
            <div class="pixelb8-global-volume-row">
              <label for="pixelb8GlobalAudioVolume">Global Volume</label>
              <input id="pixelb8GlobalAudioVolume" type="range" min="0" max="100" step="1" value="100">
              <span class="pixelb8-global-volume-value" id="pixelb8GlobalAudioVolumeValue">100%</span>
            </div>
            <div class="pixelb8-global-audio-row" data-global-audio-event="ui-click">
              <label><input type="checkbox" data-global-audio-toggle="ui-click"><span>UI Click</span></label>
              <span class="pixelb8-global-audio-file" data-global-audio-file="ui-click">Default · ui-click.mp3</span>
              <button class="pixelb8-global-audio-btn" type="button" data-global-audio-change="ui-click">Change</button>
              <button class="pixelb8-global-audio-btn" type="button" data-global-audio-preview="ui-click" data-no-ui-click title="Preview">▶</button>
            </div>
            <div style="padding:0 12px 11px;text-align:right"><button class="pixelb8-global-audio-btn danger" type="button" data-global-audio-reset="ui-click">Reset UI Click</button></div>
          </section>
        </div>
      </section>
      <input id="pixelb8GlobalAudioFilePicker" type="file" accept="audio/*" hidden>
    `;
    wrap.addEventListener('click',e=>{if(e.target===wrap)closeSettings()});
    document.body.appendChild(wrap);
    wrap.querySelector('[data-pixelb8-global-close]')?.addEventListener('click',closeSettings);
    wrap.querySelector('#pixelb8GlobalAudioMute')?.addEventListener('click',toggleMute);
    wrap.querySelector('#pixelb8GlobalAudioVolume')?.addEventListener('input',e=>{
      const volume=Math.min(100,Math.max(0,Number(e.target.value)||0));
      setVolume(volume/100);
    });
    wrap.querySelector('#pixelb8GlobalAudioVolume')?.addEventListener('change',()=>preview('ui-click'));
    wrap.querySelector('[data-global-audio-toggle="ui-click"]')?.addEventListener('change',e=>setEnabled('ui-click',e.target.checked));
    wrap.querySelector('[data-global-audio-change="ui-click"]')?.addEventListener('click',()=>chooseSound('ui-click'));
    wrap.querySelector('[data-global-audio-preview="ui-click"]')?.addEventListener('click',()=>preview('ui-click'));
    wrap.querySelector('[data-global-audio-reset="ui-click"]')?.addEventListener('click',()=>resetSound('ui-click'));
    wrap.querySelector('#pixelb8GlobalAudioFilePicker')?.addEventListener('change',onFilePicked);
  }
  async function syncUI(){
    ensureSettingsUI();
    const p=prefs(),mute=document.getElementById('pixelb8GlobalAudioMute');
    if(mute)mute.textContent=p.muted?'Unmute Global Audio':'Mute Global Audio';
    const volume=Math.round(getVolume()*100);
    const volumeInputs=[
      ...document.querySelectorAll('[data-global-audio-volume]'),
      ...document.querySelectorAll('#pixelb8GlobalAudioVolume')
    ];
    const volumeValues=[
      ...document.querySelectorAll('[data-global-audio-volume-value]'),
      ...document.querySelectorAll('#pixelb8GlobalAudioVolumeValue')
    ];
    volumeInputs.forEach(input=>{if(Number(input.value)!==volume)input.value=String(volume);});
    volumeValues.forEach(valueNode=>{valueNode.textContent=`${volume}%`;});
    for(const event of Object.keys(EVENTS)){
      document.querySelectorAll(`[data-global-audio-event="${event}"]`).forEach(row=>{const cb=row.querySelector('input[type="checkbox"]');if(cb)cb.checked=isEnabled(event)});
      document.querySelectorAll(`[data-global-audio-toggle="${event}"]`).forEach(cb=>cb.checked=isEnabled(event));
      const rec=await getRecord(event),label=rec?.name||`Default · ${EVENTS[event].defaultFile}`;
      document.querySelectorAll(`[data-global-audio-file="${event}"],[data-global-audio-event="${event}"] .audio-file-name`).forEach(el=>el.textContent=label);
    }
  }
  function openSettings(title='PixelB8 Settings'){
    ensureSettingsUI();
    const heading=document.getElementById('pixelb8GlobalSettingsTitle');if(heading)heading.textContent=title;
    document.getElementById('pixelb8GlobalSettingsBackdrop')?.classList.remove('hidden');syncUI();
  }
  function closeSettings(){document.getElementById('pixelb8GlobalSettingsBackdrop')?.classList.add('hidden')}
  function clickedControl(e){
    const path=e.composedPath?.()||[];
    if(path.some(node=>node instanceof Element&&node.matches?.('[data-no-ui-click],.audio-preview-btn,[data-global-audio-preview]')))return false;
    return path.some(node=>node instanceof Element&&node.matches?.('button,a,[role="button"],.btn,.tab-btn,.subtab-btn,.global-subtab-btn,.portal-card'));
  }
  document.addEventListener('DOMContentLoaded',()=>{
    ensureSettingsUI();syncUI();
    document.addEventListener('click',e=>{if(clickedControl(e))play('ui-click')},true);
  });
  window.PixelB8GlobalAudio={play,preview,chooseSound,setEnabled,toggleMute,isMuted,isEnabled,getVolume,setVolume,resetSound,syncUI,openSettings,closeSettings,events:EVENTS};
})();
