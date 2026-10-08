
const AUTO_ENTER_KEY='pixelb8_auto_enter_v1';
const HOME_PATH='home.html';
const INTRO_READY_MS=2700;
const AUTO_REDIRECT_DELAY_MS=900;

let autoEnterTimer=null;
let redirectTimer=null;

function enterPixelB8(){
  setTimeout(()=>location.href=HOME_PATH,120);
}

function loadAutoEnter(){
  const enabled=localStorage.getItem(AUTO_ENTER_KEY)==='1';
  const input=document.getElementById('autoEnterToggle');
  if(input)input.checked=enabled;
  return enabled;
}

function saveAutoEnter(){
  const input=document.getElementById('autoEnterToggle');
  localStorage.setItem(AUTO_ENTER_KEY,input?.checked?'1':'0');
  if(input?.checked){
    scheduleAutoEnter();
  }else{
    clearTimeout(autoEnterTimer);
    clearTimeout(redirectTimer);
    const status=document.getElementById('autoCountdown');
    if(status)status.textContent='';
  }
}

function scheduleAutoEnter(){
  clearTimeout(autoEnterTimer);
  clearTimeout(redirectTimer);
  const elapsed=performance.now();
  const wait=Math.max(0,INTRO_READY_MS-elapsed);

  autoEnterTimer=setTimeout(()=>{
    if(!document.getElementById('autoEnterToggle')?.checked)return;
    const status=document.getElementById('autoCountdown');
    if(status)status.textContent='AUTO ENTER ENABLED · CONTINUING…';

    redirectTimer=setTimeout(()=>{
      if(document.getElementById('autoEnterToggle')?.checked)enterPixelB8();
    },AUTO_REDIRECT_DELAY_MS);
  },wait);
}

document.addEventListener('DOMContentLoaded',()=>{
  if(loadAutoEnter())scheduleAutoEnter();
  document.getElementById('enterBtn')?.addEventListener('click',enterPixelB8);
  document.addEventListener('keydown',event=>{
    if(event.key==='Enter'&&!event.repeat)enterPixelB8();
  });
});
