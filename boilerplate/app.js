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


function setWorkspaceTool(button){
  document.querySelectorAll('#workspaceInnerLeft [data-workspace-tool]').forEach(btn=>btn.classList.toggle('active',btn===button));
  const tool=button?.dataset?.workspaceTool||'Workspace';
  const title=document.getElementById('workspaceSurfaceTitle');
  const hint=document.getElementById('workspaceSurfaceHint');
  if(title)title.textContent=`${tool.toUpperCase()} WORKSPACE`;
  if(hint)hint.textContent=`${tool} selected. This is a functional boilerplate example; replace this surface with the real tool UI.`;
}

function setInspectorPanel(button){
  document.querySelectorAll('#workspaceInnerRight [data-inspector-panel]').forEach(btn=>btn.classList.toggle('active',btn===button));
  const panel=button?.dataset?.inspectorPanel||'transform';
  document.getElementById('transformInspector')?.classList.toggle('hidden',panel!=='transform');
  document.getElementById('displayInspector')?.classList.toggle('hidden',panel!=='display');
}

function updateDemoProperty(property,value){
  const output=document.getElementById(property==='scale'?'demoScaleValue':'demoOpacityValue');
  if(output)output.textContent=`${value}%`;
  const surface=document.querySelector('.workspace-surface');
  if(!surface)return;
  if(property==='opacity')surface.style.opacity=String(Math.max(.2,Number(value)/100));
  if(property==='scale')surface.style.setProperty('--demo-workspace-scale',String(Number(value)/100));
}

function getInnerPanel(side){
  return document.getElementById(side==='left'?'workspaceInnerLeft':'workspaceInnerRight');
}

function getInnerShell(){
  return document.getElementById('workspaceEditorShell');
}

function syncInnerPanelLayout(){
  const shell=getInnerShell();
  if(!shell)return;
  for(const side of ['left','right']){
    const panel=getInnerPanel(side);
    if(!panel)continue;
    const hidden=panel.classList.contains('hidden-by-setting');
    const collapsed=panel.classList.contains('collapsed');
    shell.classList.toggle(`hide-inner-${side}`,hidden);
    shell.classList.toggle(`inner-${side}-collapsed`,!hidden&&collapsed);
  }
}

function setInnerPanelVisible(side,visible,save=true){
  const panel=getInnerPanel(side);
  if(!panel)return;
  panel.classList.toggle('hidden-by-setting',!visible);
  const checkbox=document.getElementById(side==='left'?'showInnerLeftSetting':'showInnerRightSetting');
  if(checkbox)checkbox.checked=visible;
  if(save)localStorage.setItem(side==='left'?INNER_LEFT_VISIBLE_KEY:INNER_RIGHT_VISIBLE_KEY,visible?'1':'0');
  syncInnerPanelLayout();
  // Settings live on another view; when enabling a rail, show the workspace so the result is immediately visible.
  if(visible&&save)switchView('workspace');
}

function toggleInnerPanel(side){
  const panel=getInnerPanel(side);
  if(!panel||panel.classList.contains('hidden-by-setting'))return;
  const collapsed=panel.classList.toggle('collapsed');
  const button=panel.querySelector('.workspace-inner-collapse');
  if(button)button.textContent=side==='left'?(collapsed?'›':'‹'):(collapsed?'‹':'›');
  localStorage.setItem(side==='left'?INNER_LEFT_COLLAPSED_KEY:INNER_RIGHT_COLLAPSED_KEY,collapsed?'1':'0');
  syncInnerPanelLayout();
}

function restoreInnerPanels(){
  const leftVisible=localStorage.getItem(INNER_LEFT_VISIBLE_KEY)!=='0';
  const rightVisible=localStorage.getItem(INNER_RIGHT_VISIBLE_KEY)!=='0';
  for(const side of ['left','right']){
    const panel=getInnerPanel(side);
    if(!panel)continue;
    const visible=side==='left'?leftVisible:rightVisible;
    const collapseKey=side==='left'?INNER_LEFT_COLLAPSED_KEY:INNER_RIGHT_COLLAPSED_KEY;
    panel.classList.toggle('hidden-by-setting',!visible);
    panel.classList.toggle('collapsed',localStorage.getItem(collapseKey)==='1');
    const button=panel.querySelector('.workspace-inner-collapse');
    if(button){
      const collapsed=panel.classList.contains('collapsed');
      button.textContent=side==='left'?(collapsed?'›':'‹'):(collapsed?'‹':'›');
    }
    const checkbox=document.getElementById(side==='left'?'showInnerLeftSetting':'showInnerRightSetting');
    if(checkbox)checkbox.checked=visible;
  }
  syncInnerPanelLayout();
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
