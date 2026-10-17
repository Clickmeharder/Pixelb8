(()=>{'use strict';
window.addEventListener('pixelb8-spatial-ready',e=>{
  const runtime=e.detail.runtime;

  runtime.registerGame('pool',{
    id:'pool',
    version:'0.32-transition',
    mode:'asset-backed-legacy-adapter',
    assetId:'pixelb8.pool-set',

    createSession(id='pool-main-session'){
      return runtime.createSession({id,type:'pool',capacity:2});
    },

    note:'Pool gameplay still executes in xr/app.js during migration, but the world now references a portable pool-set asset instance plus a separate game session.'
  });
});
})();