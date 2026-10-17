(()=>{'use strict';
const Spatial=window.PixelB8Spatial=window.PixelB8Spatial||{};
class ItemRegistry{
  constructor(){this.definitions=new Map();this.counter=0;}
  register(definition){if(!definition?.id)throw new Error('Item definition requires id');this.definitions.set(definition.id,definition);return definition;}
  get(id){return this.definitions.get(id);}
  create(typeId,overrides={}){
    const def=this.get(typeId);if(!def)throw new Error(`Unknown item type: ${typeId}`);
    this.counter++;
    const uid=overrides.uid||`${typeId}:${Date.now().toString(36)}:${this.counter.toString(36)}`;
    return {uid,typeId,label:def.label||typeId,icon:def.icon||'•',stackable:Boolean(def.stackable),unique:def.unique!==false,capabilities:[...(def.capabilities||[])],properties:{...(def.properties||{}),...(overrides.properties||{})},source:overrides.source||null,owner:overrides.owner||null};
  }
}
class InventoryModel{
  constructor(){this.items=new Map();}
  add(item){if(!item?.uid||this.items.has(item.uid))return false;this.items.set(item.uid,item);return true;}
  remove(uid){const item=this.items.get(uid)||null;if(item)this.items.delete(uid);return item;}
  has(uid){return this.items.has(uid);} get(uid){return this.items.get(uid)||null;} list(){return [...this.items.values()];}
  findByType(typeId){return this.list().filter(item=>item.typeId===typeId);} serialize(){return this.list().map(item=>({...item}));}
}
Spatial.ItemRegistry=ItemRegistry;Spatial.InventoryModel=InventoryModel;Spatial.items=Spatial.items||new ItemRegistry();
})();
