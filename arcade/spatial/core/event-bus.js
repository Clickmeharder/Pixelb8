(()=>{'use strict';
class EventBus{
  constructor(){this.listeners=new Map();}
  on(type,fn){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn);return()=>this.off(type,fn);}
  off(type,fn){this.listeners.get(type)?.delete(fn);}
  emit(type,detail){for(const fn of this.listeners.get(type)||[]){try{fn(detail);}catch(err){console.error('[PixelB8 Spatial event]',type,err);}}}
}
window.PixelB8SpatialCore=window.PixelB8SpatialCore||{};
window.PixelB8SpatialCore.EventBus=EventBus;
})();