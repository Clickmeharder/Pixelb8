/* ==========================================================
   PIXELB8 NEW PAGE BOILERPLATE
   This file handles only generic starter-page behavior.
   Replace demo actions with the new page's actual JavaScript.
   ========================================================== */

const Boilerplate=(()=>{
  /* Give each real page its own key if you want its left rail state separate. */
  const SIDEBAR_KEY='pixelb8_boilerplate_sidebar_collapsed_v1';

  function toggleSidebar(force){
    const shell=document.getElementById('appShell');
    const toggle=document.getElementById('sidebarToggle');
    if(!shell)return;

    const collapsed=typeof force==='boolean'
      ? force
      : !shell.classList.contains('sidebar-collapsed');

    shell.classList.toggle('sidebar-collapsed',collapsed);
    if(toggle){
      toggle.textContent=collapsed?'›':'‹';
      toggle.title=collapsed?'Expand left panel':'Collapse left panel';
    }
    localStorage.setItem(SIDEBAR_KEY,collapsed?'1':'0');
  }

  function showView(name){
    document.querySelectorAll('[data-view]').forEach(view=>{
      view.classList.toggle('active',view.dataset.view===name);
    });

    document.querySelectorAll('[data-view-button]').forEach(button=>{
      button.classList.toggle('active',button.dataset.viewButton===name);
    });
  }

  function go(path){
    location.href=path;
  }

  function demoAction(){
    console.log('PixelB8 boilerplate action. Replace Boilerplate.demoAction() with your page action.');
  }

  function demoPrimaryAction(){
    console.log('PixelB8 boilerplate primary action. Replace this with your page action.');
  }

  function init(){
    if(localStorage.getItem(SIDEBAR_KEY)==='1')toggleSidebar(true);

    /* Shared account HUD, profile modal, chat, and right-rail toggle. */
    PixelB8Shell.initRightRail();

    /* Shared draggable right-panel divider. Width is shared across PixelB8 pages. */
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
  }

  return {toggleSidebar,showView,go,demoAction,demoPrimaryAction,init};
})();

window.Boilerplate=Boilerplate;
document.addEventListener('DOMContentLoaded',Boilerplate.init);
