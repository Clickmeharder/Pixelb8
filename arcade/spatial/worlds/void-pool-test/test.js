(()=>{'use strict';
let runtime=null,pool=null,rack=null,inventory=null,started=false;

function cameraEl(){return document.getElementById('playerCamera');}
function cameraWorldPosition(){
  const p=new THREE.Vector3();
  cameraEl()?.object3D?.getWorldPosition(p);
  return p;
}
function distanceToPool(){
  const p=cameraWorldPosition();
  return Math.hypot(p.x,p.z);
}
function syncTake(item){if(item)window.PixelB8LegacyPoolController?.addLegacyInventoryItem(item);}
function syncReturn(item){if(item)window.PixelB8LegacyPoolController?.removeLegacyInventoryItem(item.uid);}
function interactRack(){
  const result=rack?.interactFocused?.(inventory);
  if(!result)return false;
  if(result.action==='take')syncTake(result.item);
  else if(result.action==='return')syncReturn(result.item);
  return true;
}

function installInput(){
  window.addEventListener('mousemove',e=>window.PixelB8LegacyPoolController?.mouseMove?.(e),{passive:true});

  window.addEventListener('mousedown',e=>{
    if(e.button===1){e.preventDefault();window.standStraight?.();return;}
    if(e.button===2&&window.PixelB8LegacyPoolController?.beginReach?.(e))return;
    window.PixelB8LegacyPoolController?.beginGrip?.(e);
  },true);

  window.addEventListener('mouseup',e=>{
    if(e.button===2){window.PixelB8LegacyPoolController?.endReach?.(e);return;}
    window.PixelB8LegacyPoolController?.endGrip?.(e);
  },true);

  window.addEventListener('contextmenu',e=>{
    if(window.PixelB8LegacyPoolController?.isActive?.())e.preventDefault();
  },true);

  window.addEventListener('wheel',e=>{
    if(e.shiftKey){
      e.preventDefault();
      const s=window.PixelB8LegacyPoolController?.getState?.();
      if(!s)return;
      window.setCrouchAmount?.(THREE.MathUtils.clamp(
        (s.player.crouchAmount||0)+Math.sign(e.deltaY)*.10,0,1
      ));
      return;
    }
    const s=window.PixelB8LegacyPoolController?.getState?.();
    if(s?.pool?.active&&s.pool.tool==='cue'){
      e.preventDefault();
      s.pool.cueElevation=THREE.MathUtils.clamp(
        (s.pool.cueElevation||0)+(e.deltaY<0?.025:-.025),-.04,.48
      );
      window.updateHeldPoolCue?.();
      window.updatePoolAimGuide?.();
    }
  },{passive:false,capture:true});

  window.addEventListener('keydown',e=>{
    if(e.target instanceof HTMLInputElement||e.target instanceof HTMLTextAreaElement)return;
    const s=window.PixelB8LegacyPoolController?.getState?.();
    if(!s?.player?.sitting)s?.player?.keys?.add?.(e.code);

    if(e.key.toLowerCase()==='i'){e.preventDefault();window.PixelB8LegacyPoolController?.toggleInventory?.();return;}
    if(e.key==='Enter'&&interactRack()){e.preventDefault();return;}
    if(e.key==='Enter'&&!window.PixelB8LegacyPoolController?.isActive?.()&&distanceToPool()<3.6){
      e.preventDefault();pool?.enter?.();return;
    }
    if(e.key==='Backspace'&&window.PixelB8LegacyPoolController?.isActive?.()){
      e.preventDefault();pool?.exit?.();return;
    }
    if(e.key.toLowerCase()==='r'){e.preventDefault();window.setRunning?.(!s.player.running);return;}
    if(e.key.toLowerCase()==='l'){e.preventDefault();window.toggleLean?.();return;}
    if(e.key.toLowerCase()==='x'){e.preventDefault();window.toggleSit?.();return;}
    if(e.code==='Space'){e.preventDefault();window.jumpPlayer?.();return;}
    if(/^[0-9]$/.test(e.key))window.PixelB8LegacyPoolController?.selectHotbar?.(Number(e.key),true);
  });

  window.addEventListener('keyup',e=>{
    window.PixelB8LegacyPoolController?.getState?.()?.player?.keys?.delete?.(e.code);
  });
}

function updateStatus(text){
  const status=document.getElementById('status');
  if(status)status.innerHTML=`<b>PLAYABLE VOID ASSET TEST</b><br>${text}`;
}

function mountAssetsAfterSceneLoaded(){
  if(started)return;
  started=true;
  const scene=document.getElementById('xrScene');
  if(!scene?.hasLoaded){started=false;return;}

  runtime=window.PixelB8Spatial.createRuntime(window.PixelB8VoidPoolManifest).start();
  window.PixelB8VoidRuntime=runtime;
  inventory=new window.PixelB8Spatial.InventoryModel();

  setTimeout(()=>{
    try{
      pool=runtime.assets.spawn('pixelb8.pool-set',{
        id:'pool-test',hostId:'poolHost',position:[0,0,0],rotation:[0,0,0]
      });
      rack=runtime.assets.spawn('pixelb8.pool-cue-rack',{
        id:'rack-test',
        hostId:'assetHost',
        position:[5.22,0,-.55],
        rotation:[0,-90,0]
      });

      installInput();
      scene.setAttribute('void-pool-driver','');
      window.PixelB8VoidTest={runtime,pool,rack,inventory};

      updateStatus(
        'Pool Table + Cue Rack mounted.<br>'+
        '<b>Enter</b> near table = play · <b>I</b> inventory · '+
        'look at a cue/empty rack slot and press <b>Enter</b> to take/return.'
      );
    }catch(err){
      console.error('[Void Pool Test] mount failed:',err);
      updateStatus(`Asset mount failed: ${err?.message||err}`);
    }
  },0);
}

AFRAME.registerComponent('void-pool-driver',{
  tick(time,delta){
    window.PixelB8LegacyPoolController?.tickPlayer?.(time,delta);
    pool?.tick?.(delta);
    rack?.updateFocus?.(cameraEl(),inventory);

    const prompt=document.getElementById('voidPrompt');
    const near=distanceToPool()<3.6;
    const active=window.PixelB8LegacyPoolController?.isActive?.();
    prompt?.classList.toggle('hidden',!near||active);
  }
});

function boot(){
  const scene=document.getElementById('xrScene');
  if(!scene)return;
  updateStatus('Waiting for A-Frame scene to finish loading…');
  if(scene.hasLoaded)mountAssetsAfterSceneLoaded();
  else scene.addEventListener('loaded',mountAssetsAfterSceneLoaded,{once:true});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();