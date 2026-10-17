(()=>{'use strict';

PixelDimension.bootstrapRoom({
  roomComponent:'pd-void-test',
  interactionProviders:[()=>PixelDimension.portalProvider()],
  build({player,ui,inventory,interaction,runtime}){
    const spatial=window.PixelB8Spatial.createRuntime({id:'pixeldimension-void-test'}).start();

    let pool=null;
    let rack=null;

    setTimeout(()=>{
      pool=spatial.assets.spawn('pixelb8.pool-set',{
        id:'pool-test',
        hostId:'poolHost',
        position:[0,0,0],
        rotation:[0,0,0]
      });

      rack=spatial.assets.spawn('pixelb8.pool-cue-rack',{
        id:'rack-test',
        hostId:'assetHost',
        position:[5.22,0,-.55],
        rotation:[0,-90,0]
      });

      const rackProvider={
        getInteraction(camera){
          const hit=rack.updateFocus?.(camera,{
            findByType(typeId){return inventory.findByType(typeId);}
          });
          if(!hit)return null;
          return {
            label:hit.action==='take'?'TAKE CUE [ENTER]':'RETURN CUE [ENTER]',
            score:1-hit.distance/2.35,
            hit
          };
        },
        interact(){
          const inventoryAdapter={
            has:uid=>inventory.has(uid),
            add:item=>inventory.add(item),
            remove:uid=>inventory.remove(uid),
            findByType:type=>inventory.findByType(type)
          };
          const result=rack.interactFocused?.(inventoryAdapter);
          if(!result)return false;
          ui.renderInventory();
          return true;
        }
      };

      interaction.register(rackProvider);

      const poolProvider={
        getInteraction(camera){
          const pos=new THREE.Vector3();
          camera.object3D.getWorldPosition(pos);
          const distance=Math.hypot(pos.x,pos.z);
          if(distance>3.4)return null;
          return {
            label:'PLAY POOL [ENTER]',
            score:.4-distance*.03
          };
        },
        interact(){
          const cue=inventory.findByType('pixelb8.pool-cue')[0];
          if(!cue)return false;

          // Mirror the real item into the transitional pool controller so it
          // recognizes possession, without giving movement ownership back to it.
          window.PixelB8LegacyPoolController?.addLegacyInventoryItem?.(cue);
          pool?.enter?.();
          return true;
        }
      };

      interaction.register(poolProvider);

      // Pool mouse input stays owned by the pool controller while active.
      window.addEventListener('mousemove',e=>window.PixelB8LegacyPoolController?.mouseMove?.(e),{passive:true});
      window.addEventListener('mousedown',e=>{
        if(e.button===2&&window.PixelB8LegacyPoolController?.beginReach?.(e))return;
        window.PixelB8LegacyPoolController?.beginGrip?.(e);
      },true);
      window.addEventListener('mouseup',e=>{
        if(e.button===2){window.PixelB8LegacyPoolController?.endReach?.(e);return;}
        window.PixelB8LegacyPoolController?.endGrip?.(e);
      },true);

      window.addEventListener('keydown',e=>{
        if(e.key==='Backspace'&&window.PixelB8LegacyPoolController?.isActive?.()){
          e.preventDefault();
          pool?.exit?.();
        }
      });

      window.PixelDimensionVoidTest={spatial,pool,rack};
    },0);

    // Home portal lives away from table/rack.
    const host=document.getElementById('roomHost');
    host.innerHTML=PixelDimension.BasicAssets.door({
      id:'homeDoor',x:-5,z:4,label:'HOME',target:'../../index.html'
    });

    // Keep pool physics ticking, but shared PixelDimension owns locomotion.
    const originalTick=runtime.tick.bind(runtime);
    runtime.tick=(time,delta)=>{
      originalTick(time,delta);
      pool?.tick?.(delta);
    };
  }
});

})();