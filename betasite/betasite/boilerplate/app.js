const SIDEBAR_KEY='pixelb8_boilerplate_sidebar_v1';

function toggleSidebar(){
  const shell=document.getElementById('appShell');
  const collapsed=shell.classList.toggle('sidebar-collapsed');
  const btn=document.getElementById('sidebarToggleBtn');
  if(btn)btn.textContent=collapsed?'›':'‹';
  localStorage.setItem(SIDEBAR_KEY,collapsed?'1':'0');
}

function setMode(mode){
  document.querySelectorAll('[data-mode]').forEach(btn=>btn.classList.toggle('active',btn.dataset.mode===mode));
  const status=document.getElementById('appStatus');
  if(status)status.textContent=mode==='preview'?'Previewing':'Ready';
}

function switchView(view){
  document.querySelectorAll('.view').forEach(el=>el.classList.toggle('active',el.id===`${view}View`));
  document.querySelectorAll('[data-view]').forEach(btn=>btn.classList.toggle('active',btn.dataset.view===view));
  const label={overview:'Overview',workspace:'Workspace',favorites:'Favorites',recent:'Recents'}[view]||view;
  document.getElementById('pageTitle').textContent=label;
  document.getElementById('workspaceStatus').textContent=label;
}

document.addEventListener('DOMContentLoaded',()=>{
  const shell=document.getElementById('appShell');
  if(localStorage.getItem(SIDEBAR_KEY)==='1'){
    shell.classList.add('sidebar-collapsed');
    document.getElementById('sidebarToggleBtn').textContent='›';
  }
  PixelB8Shell.initMore(document);
  PixelB8Shell.initRightRail();
  PixelB8Shell.bindVerticalResizer({
    element:'[data-pixelb8-right-resizer]',
    cssVariable:'--pixelb8-right-expanded',
    storageKey:'pixelb8_shared_right_width_v1',
    defaultWidth:248,minWidth:210,maxWidth:460,invert:true,
    enabled:()=>shell.classList.contains('social-expanded')
  });
});
