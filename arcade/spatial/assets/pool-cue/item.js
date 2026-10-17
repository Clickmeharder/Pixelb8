(()=>{'use strict';
const manifest=window.PixelB8PoolCueManifest;if(!manifest)return;
const definition={id:manifest.id,label:'Pool Cue',icon:'🎱',stackable:false,unique:true,capabilities:[...manifest.capabilities],properties:{...manifest.properties},create(overrides={}){return window.PixelB8Spatial.items.create(manifest.id,overrides);}};
window.addEventListener('pixelb8-spatial-ready',()=>window.PixelB8Spatial.items.register(definition));
window.PixelB8PoolCueItem=definition;
})();
