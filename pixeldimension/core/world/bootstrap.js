(()=>{'use strict';

const PD=window.PixelDimension=window.PixelDimension||{};

PD.bootstrapRoom=function({
  sceneId='pdScene',
  roomComponent,
  build,
  interactionProviders=[]
}={}){
  if(!roomComponent)throw new Error('roomComponent required');

  AFRAME.registerComponent(roomComponent,{
    init(){
      const inventory=new PD.InventoryModel(24);
      const player=new PD.PlayerController().install();
      const ui=new PD.FoundationUI(player,inventory).install();
      const interaction=new PD.InteractionSystem().install({player,inventory,ui});
      const runtime=new PD.WorldRuntime({player,ui,inventory,interaction});

      for(const provider of interactionProviders)interaction.register(provider({player,ui,inventory,runtime}));

      build?.({player,ui,inventory,interaction,runtime});
      this.runtime=runtime;

      window.PixelDimensionRoom={player,ui,inventory,interaction,runtime};
    },
    tick(time,delta){
      this.runtime?.tick(time,delta);
    }
  });

  const scene=document.getElementById(sceneId);
  const start=()=>scene.setAttribute(roomComponent,'');
  if(scene.hasLoaded)start();
  else scene.addEventListener('loaded',start,{once:true});
};

PD.portalProvider=function(){
  return {
    getInteraction(camera){
      if(!camera)return null;
      const camPos=new THREE.Vector3();
      const forward=new THREE.Vector3(0,0,-1);
      const q=new THREE.Quaternion();
      camera.object3D.getWorldPosition(camPos);
      camera.object3D.getWorldQuaternion(q);
      forward.applyQuaternion(q).normalize();

      let best=null;
      document.querySelectorAll('[data-pd-door]').forEach(el=>{
        const pos=new THREE.Vector3();
        el.object3D.getWorldPosition(pos);
        pos.y+=1.2;

        const to=pos.clone().sub(camPos);
        const distance=to.length();
        if(distance>2.5)return;
        to.normalize();

        const dot=forward.dot(to);
        if(dot<.965)return;

        const score=dot-distance*.03;
        if(!best||score>best.score){
          best={
            score,
            label:`ENTER ${el.querySelector('a-text')?.getAttribute('value')||'DOOR'} [ENTER]`,
            target:el.dataset.pdDoor
          };
        }
      });
      return best;
    },
    interact(focus){
      if(!focus?.target)return false;
      location.href=focus.target;
      return true;
    }
  };
};

})();