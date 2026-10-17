(()=>{'use strict';

const PD=window.PixelDimension=window.PixelDimension||{};

class PlayerController{
  constructor({
    rigId='playerRig',
    postureId='postureRig',
    cameraId='playerCamera',
    moveSpeed=2.7,
    runSpeed=4.6,
    crouchSpeed=1.25,
    jumpSpeed=4.25,
    radius=.28
  }={}){
    this.rigId=rigId;
    this.postureId=postureId;
    this.cameraId=cameraId;

    this.moveSpeed=moveSpeed;
    this.runSpeed=runSpeed;
    this.crouchSpeed=crouchSpeed;
    this.jumpSpeed=jumpSpeed;
    this.radius=radius;

    this.keys=new Set();
    this.running=false;
    this.crouchAmount=0;
    this.sitting=false;
    this.inventoryOpen=false;

    this.floorY=0;
    this.onGround=true;
    this.velocityY=0;
    this.health=100;
    this.stamina=100;

    this.enabled=true;
    this._installed=false;
    this._listeners=[];
  }

  get rig(){return document.getElementById(this.rigId);}
  get posture(){return document.getElementById(this.postureId);}
  get camera(){return document.getElementById(this.cameraId);}

  isEditable(target){
    if(!target)return false;
    if(target instanceof HTMLTextAreaElement)return true;
    if(target instanceof HTMLSelectElement)return true;
    if(target.isContentEditable)return true;
    if(target instanceof HTMLInputElement){
      return !['button','checkbox','radio','range','color'].includes((target.type||'text').toLowerCase());
    }
    return false;
  }

  install(){
    if(this._installed)return this;
    this._installed=true;

    // PixelDimension moves the player rig. Camera-local WASD is disabled so
    // collision correction never fights a second locomotion system.
    this.camera?.setAttribute('wasd-controls','enabled',false);

    const keydown=e=>{
      if(this.isEditable(e.target))return;

      this.keys.add(e.code);

      if(e.key.toLowerCase()==='r'){
        e.preventDefault();
        this.setRunning(!this.running);
      }

      if(e.code==='Space'){
        e.preventDefault();
        this.jump();
      }
    };

    const keyup=e=>this.keys.delete(e.code);

    window.addEventListener('keydown',keydown);
    window.addEventListener('keyup',keyup);

    this._listeners.push(['keydown',keydown],['keyup',keyup]);
    return this;
  }

  destroy(){
    for(const [type,fn] of this._listeners)window.removeEventListener(type,fn);
    this._listeners.length=0;
    this._installed=false;
  }

  setRunning(value){
    this.running=Boolean(value);
    window.dispatchEvent(new CustomEvent('pixeldimension:run-changed',{detail:{running:this.running}}));
  }

  setCrouch(value){
    this.crouchAmount=THREE.MathUtils.clamp(Number(value)||0,0,1);
    const posture=this.posture;
    if(posture){
      posture.object3D.position.y=THREE.MathUtils.lerp(0,-.58,this.crouchAmount);
    }
  }

  jump(){
    if(!this.enabled||this.sitting||this.inventoryOpen||!this.onGround)return false;
    this.velocityY=this.jumpSpeed;
    this.onGround=false;
    return true;
  }

  horizontalInput(){
    let x=0,z=0;
    if(this.keys.has('KeyA')||this.keys.has('ArrowLeft'))x-=1;
    if(this.keys.has('KeyD')||this.keys.has('ArrowRight'))x+=1;
    if(this.keys.has('KeyW')||this.keys.has('ArrowUp'))z-=1;
    if(this.keys.has('KeyS')||this.keys.has('ArrowDown'))z+=1;

    const v=new THREE.Vector2(x,z);
    if(v.lengthSq()>1)v.normalize();
    return v;
  }

  tick(deltaMs,{resolveCollisions=null}={}){
    const rig=this.rig;
    const camera=this.camera;
    if(!this.enabled||!rig||!camera)return;

    const dt=Math.min(.05,Math.max(0,(deltaMs||0)/1000));

    if(!this.onGround){
      this.velocityY-=9.8*dt;
      rig.object3D.position.y+=this.velocityY*dt;

      if(rig.object3D.position.y<=this.floorY){
        rig.object3D.position.y=this.floorY;
        this.velocityY=0;
        this.onGround=true;
      }
    }

    const input=this.horizontalInput();
    const moving=input.lengthSq()>0&&!this.sitting&&!this.inventoryOpen;

    if(moving){
      const q=new THREE.Quaternion();
      camera.object3D.getWorldQuaternion(q);

      const forward=new THREE.Vector3(0,0,-1).applyQuaternion(q);
      forward.y=0;
      if(forward.lengthSq()<1e-6)forward.set(0,0,-1);
      forward.normalize();

      const right=new THREE.Vector3(-forward.z,0,forward.x);

      const move=new THREE.Vector3()
        .addScaledVector(right,input.x)
        .addScaledVector(forward,-input.y);

      if(move.lengthSq()>1)move.normalize();

      const speed=this.crouchAmount>.08
        ?this.crouchSpeed
        :(this.running&&this.stamina>0?this.runSpeed:this.moveSpeed);

      rig.object3D.position.addScaledVector(move,speed*dt);
      resolveCollisions?.();

      const drain=this.running?5.4:(this.crouchAmount>.08?.9:1.7);
      this.stamina=Math.max(0,this.stamina-drain*dt);
    }else if(this.onGround){
      this.stamina=Math.min(100,this.stamina+7.2*dt);
    }
  }
}

PD.PlayerController=PlayerController;

})();