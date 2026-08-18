const SIDEBAR_KEY='pixelb8_boilerplate_sidebar_v1';
const INNER_LEFT_VISIBLE_KEY='pixelb8_boilerplate_inner_left_visible_v1';
const INNER_RIGHT_VISIBLE_KEY='pixelb8_boilerplate_inner_right_visible_v1';
const INNER_LEFT_COLLAPSED_KEY='pixelb8_boilerplate_inner_left_collapsed_v1';
const INNER_RIGHT_COLLAPSED_KEY='pixelb8_boilerplate_inner_right_collapsed_v1';

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
  const label={overview:'Overview',workspace:'Workspace',settings:'Page Settings',favorites:'Favorites',recent:'Recents'}[view]||view;
  document.getElementById('pageTitle').textContent=label;
  document.getElementById('workspaceStatus').textContent=label;
}


function getInnerPanel(side){
  return document.getElementById(side==='left'?'workspaceInnerLeft':'workspaceInnerRight');
}

function setInnerPanelVisible(side,visible,save=true){
  const shell=document.getElementById('workspaceEditorShell');
  const panel=getInnerPanel(side);
  if(!shell||!panel)return;
  panel.classList.toggle('hidden-by-setting',!visible);
  shell.classList.toggle(side==='left'?'hide-inner-left':'hide-inner-right',!visible);
  const checkbox=document.getElementById(side==='left'?'showInnerLeftSetting':'showInnerRightSetting');
  if(checkbox)checkbox.checked=visible;
  if(save)localStorage.setItem(side==='left'?INNER_LEFT_VISIBLE_KEY:INNER_RIGHT_VISIBLE_KEY,visible?'1':'0');
}

function toggleInnerPanel(side){
  const panel=getInnerPanel(side);
  if(!panel)return;
  const collapsed=panel.classList.toggle('collapsed');
  const button=panel.querySelector('.workspace-inner-collapse');
  if(button)button.textContent=side==='left'?(collapsed?'›':'‹'):(collapsed?'‹':'›');
  localStorage.setItem(side==='left'?INNER_LEFT_COLLAPSED_KEY:INNER_RIGHT_COLLAPSED_KEY,collapsed?'1':'0');
}

function restoreInnerPanels(){
  const leftVisible=localStorage.getItem(INNER_LEFT_VISIBLE_KEY)!=='0';
  const rightVisible=localStorage.getItem(INNER_RIGHT_VISIBLE_KEY)!=='0';
  setInnerPanelVisible('left',leftVisible,false);
  setInnerPanelVisible('right',rightVisible,false);
  for(const side of ['left','right']){
    const key=side==='left'?INNER_LEFT_COLLAPSED_KEY:INNER_RIGHT_COLLAPSED_KEY;
    const panel=getInnerPanel(side);
    if(panel&&localStorage.getItem(key)==='1'){
      panel.classList.add('collapsed');
      const button=panel.querySelector('.workspace-inner-collapse');
      if(button)button.textContent=side==='left'?'›':'‹';
    }
  }
}

document.addEventListener('DOMContentLoaded',()=>{
  const shell=document.getElementById('appShell');
  if(localStorage.getItem(SIDEBAR_KEY)==='1'){
    shell.classList.add('sidebar-collapsed');
    document.getElementById('sidebarToggleBtn').textContent='›';
  }
  restoreInnerPanels();
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
