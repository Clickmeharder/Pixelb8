(()=>{'use strict';
const manifest=window.PixelB8PoolCueRackManifest;
if(!manifest)return;

class PoolCueRackAsset{
  constructor(options={}){
    this.id=options.id||'pool-cue-rack';
    this.manifest=manifest;
    this.position=options.position||[0,0,0];
    this.rotation=options.rotation||[0,0,0];
    this.hostId=options.hostId||'assetHost';
    this.slots=Array(manifest.slotCount).fill(null);
    this.seeded=false;
    this.focusedSlot=-1;
    this.focusedAction=null;
  }

  seed(){
    if(this.seeded)return;
    const itemDef=window.PixelB8Spatial.items?.get('pixelb8.pool-cue');
    if(!itemDef)return;
    manifest.defaultContents.forEach((entry,index)=>{
      if(index<this.slots.length){
        this.slots[index]=itemDef.create({source:{assetInstanceId:this.id,slot:index}});
      }
    });
    this.seeded=true;
  }

  mount(context={}){
    this.context=context;
    this.seed();
    this.render();
    context.bus?.emit?.('cue-rack:mounted',{rack:this,slots:this.serializeSlots()});
    return this;
  }

  render(){
    const host=document.getElementById(this.hostId);
    if(!host)return;
    let root=document.getElementById(`asset-${this.id}`);
    if(!root){
      root=document.createElement('a-entity');
      root.id=`asset-${this.id}`;
      host.appendChild(root);
    }
    root.setAttribute('position',`${this.position[0]||0} ${this.position[1]||0} ${this.position[2]||0}`);
    root.setAttribute('rotation',`${this.rotation[0]||0} ${this.rotation[1]||0} ${this.rotation[2]||0}`);
    root.dataset.assetId=this.id;
    root.dataset.assetType=manifest.id;

    const slotX=[-.39,-.13,.13,.39];
    root.innerHTML=`
      <a-box position="0 1.55 0" width="1.25" height="1.82" depth=".09" color="#261a12"></a-box>
      <a-box position="0 2.33 .07" width="1.14" height=".14" depth=".12" color="#5a3920"></a-box>
      <a-box position="0 .82 .07" width="1.14" height=".14" depth=".12" color="#5a3920"></a-box>
      <a-text value="POOL CUES" position="0 2.53 .09" align="center" color="#d9bd8c" width="1.75"></a-text>
      ${slotX.map((x,i)=>{
        const item=this.slots[i];
        return `
          <a-entity id="${this.id}-slot-${i}" data-cue-rack-slot="${i}" position="${x} 0 0">
            <a-box position="0 2.28 .13" width=".09" height=".08" depth=".12" color="#17110c"></a-box>
            <a-box position="0 .88 .13" width=".09" height=".08" depth=".12" color="#17110c"></a-box>
            ${item?`
              <a-cylinder position="0 1.56 .15" radius=".017" height="1.64" color="#d7a86b"></a-cylinder>
              <a-cylinder position="0 .75 .15" radius=".024" height=".055" color="${i%2===0?'#1d71b8':'#8a2f2f'}"></a-cylinder>
            `:''}
            <a-text id="${this.id}-prompt-${i}" visible="false" value=""
              position="0 .68 .22" align="center" color="#9fe7ff" width=".72"
              material="shader:flat;depthTest:false"></a-text>
          </a-entity>`;
      }).join('')}
    `;
  }

  serializeSlots(){
    return this.slots.map((item,index)=>({slot:index,occupied:Boolean(item),item:item?{...item}:null}));
  }

  findCarriedCue(inventory){
    return inventory?.findByType?.('pixelb8.pool-cue')?.[0]||null;
  }

  clearFocus(){
    for(let i=0;i<this.slots.length;i++){
      document.getElementById(`${this.id}-prompt-${i}`)?.setAttribute('visible',false);
    }
    this.focusedSlot=-1;
    this.focusedAction=null;
  }

  updateFocus(cameraEl,inventory,{maxDistance=2.35,maxAngleDeg=11}={}){
    if(!cameraEl?.object3D){this.clearFocus();return null;}

    const camPos=new THREE.Vector3();
    const forward=new THREE.Vector3(0,0,-1);
    const q=new THREE.Quaternion();
    cameraEl.object3D.getWorldPosition(camPos);
    cameraEl.object3D.getWorldQuaternion(q);
    forward.applyQuaternion(q).normalize();

    let best=null;
    const minDot=Math.cos(THREE.MathUtils.degToRad(maxAngleDeg));
    const carried=this.findCarriedCue(inventory);

    for(let i=0;i<this.slots.length;i++){
      const slotEl=document.getElementById(`${this.id}-slot-${i}`);
      if(!slotEl)continue;
      const pos=new THREE.Vector3();
      slotEl.object3D.getWorldPosition(pos);
      pos.y+=.76;
      pos.z+=.16;

      const to=pos.clone().sub(camPos);
      const distance=to.length();
      if(distance>.0+maxDistance||distance<.15)continue;
      to.normalize();

      const dot=forward.dot(to);
      if(dot<minDot)continue;

      let action=null;
      if(this.slots[i])action='take';
      else if(carried)action='return';
      if(!action)continue;

      const score=dot-(distance/maxDistance)*.055;
      if(!best||score>best.score)best={slot:i,action,distance,score};
    }

    this.clearFocus();
    if(!best)return null;

    this.focusedSlot=best.slot;
    this.focusedAction=best.action;
    const prompt=document.getElementById(`${this.id}-prompt-${best.slot}`);
    if(prompt){
      prompt.setAttribute('value',best.action==='take'?'TAKE [ENTER]':'RETURN [ENTER]');
      prompt.setAttribute('visible',true);
    }
    return best;
  }

  take(slotIndex,inventory){
    const index=Number(slotIndex);
    if(!Number.isInteger(index)||index<0||index>=this.slots.length)return null;
    const item=this.slots[index];
    if(!item)return null;
    if(inventory?.has?.(item.uid))return null;
    if(inventory&&!inventory.add(item))return null;
    this.slots[index]=null;
    this.render();
    this.context?.bus?.emit?.('cue-rack:item-taken',{rackId:this.id,slot:index,item});
    return item;
  }

  returnItem(item,inventory,preferredSlot=null){
    if(!item||item.typeId!=='pixelb8.pool-cue')return false;
    if(this.slots.some(existing=>existing?.uid===item.uid))return false;

    let index=
      Number.isInteger(preferredSlot)&&preferredSlot>=0&&preferredSlot<this.slots.length&&!this.slots[preferredSlot]
        ?preferredSlot
        :this.slots.findIndex(slot=>!slot);
    if(index<0)return false;

    inventory?.remove?.(item.uid);
    this.slots[index]=item;
    this.render();
    this.context?.bus?.emit?.('cue-rack:item-returned',{rackId:this.id,slot:index,item});
    return true;
  }

  interactFocused(inventory){
    if(this.focusedSlot<0||!this.focusedAction)return null;
    const slot=this.focusedSlot;
    const action=this.focusedAction;

    if(action==='take'){
      const item=this.take(slot,inventory);
      return item?{action:'take',slot,item}:null;
    }

    if(action==='return'){
      const item=this.findCarriedCue(inventory);
      if(!item)return null;
      return this.returnItem(item,inventory,slot)?{action:'return',slot,item}:null;
    }
    return null;
  }

  serialize(){
    return {assetId:manifest.id,version:manifest.version,instanceId:this.id,
      position:this.position,rotation:this.rotation,slots:this.serializeSlots()};
  }

  destroy(){
    document.getElementById(`asset-${this.id}`)?.remove();
    this.context=null;
  }
}

const definition={manifest,Asset:PoolCueRackAsset,create(options){return new PoolCueRackAsset(options);}};
window.PixelB8PoolCueRackAsset=definition;
window.addEventListener('pixelb8-spatial-ready',e=>e.detail.runtime.registerAsset(manifest.id,definition));
})();