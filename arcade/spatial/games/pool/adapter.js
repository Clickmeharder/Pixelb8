(()=>{'use strict';
window.addEventListener('pixelb8-spatial-ready',e=>{
  const runtime=e.detail.runtime;
  runtime.registerGame('pool',{
    id:'pool',
    version:'0.17-transition',
    mode:'legacy-adapter',
    createSession(id='pool-main'){return runtime.createSession({id,type:'pool',capacity:2});},
    note:'Pool currently runs in xr/app.js; this adapter is the migration boundary for the new game-module contract.'
  });
});
})();