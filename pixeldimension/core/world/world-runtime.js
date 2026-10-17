(()=>{'use strict';

const PD=window.PixelDimension=window.PixelDimension||{};

class WorldRuntime{
  constructor({player,ui,inventory,interaction}={}){
    this.player=player;
    this.ui=ui;
    this.inventory=inventory;
    this.interaction=interaction;
  }

  resolveCollisions(){
    const rig=this.player?.rig;
    if(!rig)return;

    const p=rig.object3D.position;
    const radius=this.player.radius;

    document.querySelectorAll('[data-pd-collider="box"]').forEach(el=>{
      const wp=new THREE.Vector3();
      el.object3D.getWorldPosition(wp);

      const hx=Number(el.dataset.halfx)||0;
      const hz=Number(el.dataset.halfz)||0;
      if(!hx||!hz)return;

      const dx=p.x-wp.x;
      const dz=p.z-wp.z;
      const px=hx+radius-Math.abs(dx);
      const pz=hz+radius-Math.abs(dz);

      if(px>0&&pz>0){
        if(px<pz)p.x=wp.x+(dx<0?-(hx+radius):(hx+radius));
        else p.z=wp.z+(dz<0?-(hz+radius):(hz+radius));
      }
    });
  }

  tick(time,delta){
    this.player?.tick(delta,{resolveCollisions:()=>this.resolveCollisions()});
    this.resolveCollisions();
    this.interaction?.update?.({runtime:this,player:this.player,inventory:this.inventory,ui:this.ui});
    this.ui?.tick?.();
  }
}

PD.WorldRuntime=WorldRuntime;

})();