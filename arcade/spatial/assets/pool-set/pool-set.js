(()=>{'use strict';

const manifest=window.PixelB8PoolSetManifest;
if(!manifest)return;

class PixelB8PoolSetAsset{
  constructor(options={}){
    this.id=options.id||'pool-main';
    this.assetId=manifest.id;
    this.manifest=manifest;
    this.position=options.position||manifest.defaultPlacement.position;
    this.rotation=options.rotation||manifest.defaultPlacement.rotation;
    this.sessionId=options.sessionId||`${this.id}:session`;
    this.hostId=options.hostId||'poolHost';
    this.mounted=false;
    this.legacyMounted=false;
  }

  mount(context={}){
    this.context=context;

    const controller=window.PixelB8LegacyPoolController;
    if(controller){
      controller.mount({
        hostId:this.hostId,
        centerX:Number(this.position?.[0])||0,
        centerZ:Number(this.position?.[2])||0,
        initializeUI:true
      });
      this.legacyMounted=true;
    }else{
      const host=document.getElementById(this.hostId);
      if(host){
        host.innerHTML=`
          <a-entity position="${this.position?.[0]||0} ${this.position?.[1]||0} ${this.position?.[2]||0}">
            <a-box position="0 .78 0" width="3.9" height=".45" depth="2.15" color="#3b2819"></a-box>
            <a-box position="0 1.02 0" width="3.55" height=".08" depth="1.82" color="#145b31"></a-box>
            <a-text value="POOL CONTROLLER NOT LOADED" position="0 1.6 0" rotation="-90 0 0"
              align="center" color="#ff8c8c" width="3"></a-text>
          </a-entity>`;
      }
    }

    this.mounted=true;

    context.bus?.emit?.('asset:mounted',{
      assetId:this.assetId,
      instanceId:this.id,
      position:this.position,
      rotation:this.rotation,
      legacyMounted:this.legacyMounted
    });

    return this;
  }

  enter(){window.PixelB8LegacyPoolController?.enter?.();}
  exit(){window.PixelB8LegacyPoolController?.exit?.();}
  tick(delta){window.PixelB8LegacyPoolController?.tick?.(delta);}

  serialize(){
    return {
      assetId:this.assetId,
      version:manifest.version,
      instanceId:this.id,
      position:this.position,
      rotation:this.rotation,
      sessionId:this.sessionId,
      mounted:this.mounted,
      legacyMounted:this.legacyMounted
    };
  }

  interact(player,target){
    this.context?.bus?.emit?.('asset:interact',{
      assetId:this.assetId,
      instanceId:this.id,
      player,
      target
    });
    this.enter();
  }

  destroy(){
    this.exit();
    const host=document.getElementById(this.hostId);
    if(host)host.innerHTML='';
    this.context?.bus?.emit?.('asset:destroyed',{
      assetId:this.assetId,
      instanceId:this.id
    });
    this.mounted=false;
    this.context=null;
  }
}

const definition={
  manifest,
  Asset:PixelB8PoolSetAsset,
  create(options){return new PixelB8PoolSetAsset(options);}
};

window.PixelB8PoolSetAsset=definition;

window.addEventListener('pixelb8-spatial-ready',e=>{
  e.detail.runtime.registerAsset(manifest.id,definition);
});

})();