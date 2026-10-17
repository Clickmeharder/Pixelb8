(()=>{'use strict';

const PD=window.PixelDimension=window.PixelDimension||{};

class InventoryModel{
  constructor(capacity=24){
    this.capacity=capacity;
    this.items=new Map();
  }

  add(item){
    if(!item?.uid||this.items.has(item.uid)||this.items.size>=this.capacity)return false;
    this.items.set(item.uid,item);
    return true;
  }

  remove(uid){
    const item=this.items.get(uid)||null;
    if(item)this.items.delete(uid);
    return item;
  }

  has(uid){return this.items.has(uid);}
  get(uid){return this.items.get(uid)||null;}
  list(){return [...this.items.values()];}
  findByType(typeId){return this.list().filter(item=>item.typeId===typeId);}
}

class FoundationUI{
  constructor(player,inventory){
    this.player=player;
    this.inventory=inventory;
    this.inventoryPanel=document.getElementById('pdInventory');
    this.inventoryGrid=document.getElementById('pdInventoryGrid');
    this.runState=document.getElementById('pdRunState');
    this.hp=document.getElementById('pdHealth');
    this.sta=document.getElementById('pdStamina');
  }

  install(){
    window.addEventListener('pixeldimension:run-changed',e=>{
      this.renderRun(Boolean(e.detail?.running));
    });

    window.addEventListener('keydown',e=>{
      if(this.player.isEditable(e.target))return;
      if(e.key.toLowerCase()==='i'){
        e.preventDefault();
        this.setInventoryOpen(!this.player.inventoryOpen);
      }
      if(e.key==='Escape'&&this.player.inventoryOpen){
        e.preventDefault();
        this.setInventoryOpen(false);
      }
    });

    document.getElementById('pdInventoryClose')?.addEventListener('click',()=>this.setInventoryOpen(false));
    this.inventoryPanel?.addEventListener('click',e=>{
      if(e.target===this.inventoryPanel)this.setInventoryOpen(false);
    });

    this.renderRun(this.player.running);
    this.renderInventory();
    return this;
  }

  setInventoryOpen(open){
    this.player.inventoryOpen=Boolean(open);
    this.inventoryPanel?.classList.toggle('hidden',!open);
  }

  renderRun(running){
    if(!this.runState)return;
    this.runState.textContent=running?'RUN':'WALK';
    this.runState.classList.toggle('active',running);
  }

  renderInventory(){
    if(!this.inventoryGrid)return;
    const items=this.inventory.list();

    this.inventoryGrid.innerHTML=Array.from({length:this.inventory.capacity},(_,i)=>{
      const item=items[i];
      return `<div class="pd-inventory-slot${item?' has-item':''}">
        ${item
          ?`<span>${item.icon||'•'}</span><b>${item.label||item.typeId||'Item'}</b>`
          :`<small>${i+1}</small>`}
      </div>`;
    }).join('');
  }

  tick(){
    if(this.hp)this.hp.style.width=`${this.player.health}%`;
    if(this.sta)this.sta.style.width=`${this.player.stamina}%`;
  }
}

PD.InventoryModel=InventoryModel;
PD.FoundationUI=FoundationUI;

})();