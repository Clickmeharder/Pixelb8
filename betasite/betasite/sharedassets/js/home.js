
const PIXELB8_HOME_SIDEBAR_KEY='pixelb8_home_sidebar_collapsed_v1';

function portalToggleSidebar(){
  const shell=document.getElementById('appShell');
  if(!shell)return;
  const collapsed=shell.classList.toggle('sidebar-collapsed');
  const btn=document.getElementById('portalSidebarToggle');
  if(btn)btn.textContent=collapsed?'›':'‹';
  localStorage.setItem(PIXELB8_HOME_SIDEBAR_KEY,collapsed?'1':'0');
}

function go(path){
  location.href=path;
}

document.addEventListener('DOMContentLoaded',()=>{
  const shell=document.getElementById('appShell');
  const toggle=document.getElementById('portalSidebarToggle');

  if(localStorage.getItem(PIXELB8_HOME_SIDEBAR_KEY)==='1'){
    shell?.classList.add('sidebar-collapsed');
    if(toggle)toggle.textContent='›';
  }

  PixelB8Shell.initRightRail();
  PixelB8Shell.bindVerticalResizer({
    element:'[data-pixelb8-right-resizer]',
    cssVariable:'--pixelb8-right-expanded',
    storageKey:'pixelb8_shared_right_width_v1',
    defaultWidth:248,
    minWidth:210,
    maxWidth:460,
    invert:true,
    enabled:()=>document.querySelector('[data-pixelb8-shell]')?.classList.contains('social-expanded')
  });
});
