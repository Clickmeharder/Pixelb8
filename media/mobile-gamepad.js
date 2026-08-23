(() => {
'use strict';

const STYLE = `
:root{
  font-family:Inter,ui-sans-serif,system-ui,-apple-system,Segoe UI,sans-serif;
  color-scheme:dark;
  --bg:#05070c;--bg2:#09111c;--panel:#0b1420;--panel2:#101d2c;
  --line:rgba(109,157,218,.30);--lineStrong:rgba(116,182,255,.62);
  --text:#f8fbff;--muted:#8ea7c7;--cyan:#66dcff;--blue:#7190ff;
  --pink:#f178bd;--amber:#f2ca6b;--green:#67ecad;--red:#ff7082;
}
*{box-sizing:border-box;-webkit-user-select:none;user-select:none;-webkit-tap-highlight-color:transparent}
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:
 radial-gradient(circle at 81% 12%,rgba(83,99,220,.14),transparent 34%),
 radial-gradient(circle at 12% 82%,rgba(0,210,255,.08),transparent 31%),
 linear-gradient(160deg,#05070c,#07101a 52%,#05070c);color:var(--text)}
body{padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)}
button,input,select{font:inherit}
.gamepad{height:100%;display:grid;grid-template-rows:34px auto minmax(0,1fr) 46px;gap:5px;padding:5px}
.topbar{display:flex;align-items:center;gap:6px;border:1px solid var(--line);background:linear-gradient(180deg,rgba(12,20,34,.92),rgba(7,12,22,.90));backdrop-filter:blur(14px);border-radius:13px;padding:3px 7px;box-shadow:inset 0 1px rgba(255,255,255,.04),0 6px 18px rgba(0,0,0,.16)}
.logo{font-weight:950;letter-spacing:.095em;font-size:10px;white-space:nowrap;text-shadow:0 0 12px rgba(102,220,255,.12)}
.led{width:8px;height:8px;border-radius:50%;background:#653c49;box-shadow:0 0 0 2px rgba(255,255,255,.03)}.connected .led{background:var(--green);box-shadow:0 0 10px var(--green)}
.status{font-size:9px;color:var(--muted);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.room{width:76px;height:25px;border:1px solid var(--line);background:#07101a;color:white;border-radius:8px;padding:0 6px;font-size:9px}.iconbtn{height:25px;min-width:28px;border-radius:8px;border:1px solid var(--line);background:linear-gradient(#1a2a42,#0e1828);color:#fff;font-weight:900;box-shadow:inset 0 1px rgba(255,255,255,.04)}
.moreBar{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:5px;max-height:0;overflow:hidden;opacity:0;transform:translateY(-4px);transition:max-height .18s ease,opacity .18s ease,transform .18s ease,padding .18s ease,border-width .18s ease;pointer-events:none;padding:0 5px;border:0 solid transparent;border-radius:13px;background:rgba(8,14,24,.80);backdrop-filter:blur(12px)}
.moreBar.open{max-height:59px;opacity:1;transform:none;pointer-events:auto;padding:5px;border-width:1px;border-color:var(--line)}
.moreChip{height:43px;border-radius:12px;font-size:10px;background:linear-gradient(160deg,#1a2a43,#101a2b);box-shadow:inset 0 1px rgba(255,255,255,.04)}
.moreChip small{display:block;font-size:7px;color:#abc0d9;margin-top:2px}
.stage{min-height:0;display:grid;grid-template-columns:minmax(220px,36%) minmax(190px,25%) minmax(220px,39%);gap:6px}
.zone{position:relative;min-width:0;min-height:0;border:1px solid var(--line);border-radius:20px;background:
 linear-gradient(145deg,rgba(17,30,48,.92),rgba(7,13,22,.92));box-shadow:inset 0 1px rgba(255,255,255,.04),0 14px 34px rgba(0,0,0,.22);overflow:hidden}
.zone:after{content:'';position:absolute;inset:0;pointer-events:none;border-radius:inherit;background:linear-gradient(120deg,rgba(255,255,255,.025),transparent 25%,transparent 70%,rgba(102,220,255,.018))}
.leftZone{display:grid;grid-template-rows:minmax(0,1fr) 48px;padding:7px;gap:6px}
.centerZone{padding:7px;display:grid;grid-template-rows:minmax(0,1fr) auto;gap:6px}
.rightZone{padding:7px}
.stickArea,.mouseArea{display:grid;place-items:center;touch-action:none;min-height:0;position:relative}
.stickBase{position:relative;width:min(42vh,198px);height:min(42vh,198px);max-width:92%;max-height:92%;aspect-ratio:1;border-radius:50%;border:2px solid rgba(116,166,228,.56);background:
 radial-gradient(circle at 50% 50%,rgba(44,71,111,.76) 0 17%,rgba(8,17,30,.98) 18% 58%,rgba(18,32,53,.96) 59% 100%);box-shadow:0 0 0 5px rgba(67,110,168,.07),0 10px 28px rgba(0,0,0,.28),inset 0 0 42px rgba(92,151,235,.13)}
.stickBase:after,.mouseBase:after{content:'';position:absolute;inset:10%;border-radius:50%;border:1px solid rgba(145,191,247,.08);pointer-events:none}
.stickKnob,.mouseKnob{position:absolute;left:50%;top:50%;border-radius:50%;transform:translate(-50%,-50%);border:2px solid rgba(164,208,255,.82);background:radial-gradient(circle at 34% 28%,#91b1df,#294765 66%);box-shadow:0 6px 18px rgba(0,0,0,.48),inset 0 1px rgba(255,255,255,.18)}
.stickKnob{width:36%;height:36%}.mouseKnob{width:34%;height:34%;background:radial-gradient(circle at 35% 28%,#95e4ff,#245067 67%);border-color:rgba(118,226,255,.90)}
.dir{position:absolute;font-size:9px;font-weight:900;color:#91a9c8;pointer-events:none}.n{top:6px;left:50%;transform:translateX(-50%)}.s{bottom:6px;left:50%;transform:translateX(-50%)}.w{left:7px;top:50%;transform:translateY(-50%)}.e{right:7px;top:50%;transform:translateY(-50%)}
.leftQuick{display:grid;grid-template-columns:1.25fr 1fr 1fr;gap:6px}
.btn{min-width:0;min-height:0;border:1px solid rgba(110,153,209,.44);border-radius:14px;background:linear-gradient(160deg,#1d2f49,#111b2d);color:#fff;font-weight:900;font-size:10px;touch-action:none;box-shadow:inset 0 1px rgba(255,255,255,.05),0 4px 10px rgba(0,0,0,.10);transition:transform .08s ease,border-color .08s ease,background .08s ease,box-shadow .08s ease}
.btn small{display:block;font-size:7px;font-weight:650;color:#a8bad2;margin-top:2px;letter-spacing:.02em}
.btn:active,.btn.active{transform:translateY(1px) scale(.995);border-color:#9bc8ff;background:linear-gradient(#2d4d78,#182a43);box-shadow:inset 0 1px rgba(255,255,255,.08)}
.shift{background:linear-gradient(150deg,#725c28,#302713);border-color:rgba(242,201,109,.58)}.shift.latched,.latched{background:linear-gradient(150deg,#a17f35,#473718)!important;border-color:#ffd879!important;color:#fff4b3!important;box-shadow:0 0 18px rgba(255,207,99,.18)!important}
.centerMain{display:grid;grid-template-columns:repeat(2,1fr);grid-template-rows:repeat(3,1fr);gap:6px}.centerMain .btn{font-size:11px}.enter{grid-column:1/3;background:linear-gradient(150deg,#2e4f7b,#182944)}.action{background:linear-gradient(150deg,#87394b,#3a1922);border-color:rgba(255,111,130,.44)}.release{background:linear-gradient(150deg,#642833,#2c121a);border-color:rgba(255,111,130,.50)}
.centerFoot{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.rightGrid{height:100%;display:grid;grid-template-columns:minmax(0,1fr) 82px;grid-template-rows:minmax(0,1fr) 58px;gap:6px}
.mouseArea{overflow:visible}.mouseBase{position:relative;width:min(42vh,198px);height:min(42vh,198px);max-width:94%;max-height:94%;aspect-ratio:1;border-radius:50%;border:2px solid rgba(102,225,255,.48);background:
 radial-gradient(circle at 50% 50%,rgba(17,79,99,.58) 0 17%,rgba(6,14,25,.98) 18% 60%,rgba(15,47,62,.92) 61% 100%);box-shadow:0 0 0 5px rgba(62,194,255,.06),0 12px 30px rgba(0,0,0,.28),inset 0 0 42px rgba(63,214,255,.15)}
.rotateDock{position:absolute;top:5px;left:4%;right:4%;display:flex;justify-content:space-between;align-items:center;z-index:3;pointer-events:none}.rotateDock .btn{width:72px;height:34px;border-radius:13px;font-size:11px;background:linear-gradient(160deg,#19233f,#10172b);border-color:rgba(116,141,255,.42);pointer-events:auto}
.mouseRail{display:grid;grid-template-rows:1.2fr 1fr auto;gap:6px}.jump{background:radial-gradient(circle at 35% 28%,#7a93e3,#2d4276 68%);font-size:12px;border-color:rgba(138,160,255,.58);box-shadow:0 0 18px rgba(108,137,255,.10)}
.rightBottom{display:grid;grid-template-columns:.8fr 1.2fr;gap:6px}.rightBottom .btn{font-size:10px}.freelookBtn.latched{border-color:#66dcff!important;color:#dff9ff!important;background:linear-gradient(150deg,#1c5365,#102d38)!important;box-shadow:0 0 16px rgba(102,220,255,.16)!important}

.mousePrimary{background:linear-gradient(150deg,#284b63,#132938);border-color:rgba(102,225,255,.48)}
.miniHold{position:absolute;z-index:5;height:24px;min-width:49px;padding:0 6px;border:1px solid rgba(110,153,209,.46);border-radius:8px;background:rgba(13,23,38,.94);color:#a9bfd9;font-size:7px;font-weight:900;touch-action:none}.leftZone>.miniHold{left:8px;bottom:60px}.miniHold.latched{color:#fff4b3;border-color:#ffd879;background:#5b461c;box-shadow:0 0 12px rgba(255,207,99,.16)}.railHold{position:static;width:100%;height:25px;min-width:0}
.controlToast{position:fixed;z-index:80;top:calc(env(safe-area-inset-top) + 42px);left:50%;transform:translate(-50%,-10px);padding:7px 14px;border-radius:999px;border:1px solid rgba(255,202,107,.7);background:rgba(32,24,12,.96);color:#ffe39a;font-size:10px;font-weight:900;letter-spacing:.02em;opacity:0;pointer-events:none;transition:opacity .16s ease,transform .16s ease;box-shadow:0 8px 26px rgba(0,0,0,.35);white-space:nowrap}.controlToast.show{opacity:1;transform:translate(-50%,0)}
.layoutPicker{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.layoutChoice{height:45px}.layoutChoice.selected,.styleChoice.selected{border-color:#7ee4ff;background:linear-gradient(150deg,#244a60,#122b39);box-shadow:0 0 14px rgba(102,220,255,.12)}.stylePicker{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.styleChoice{height:48px}.styleChoice small{font-size:7px}
body.style-classic .leftZone{order:1}body.style-classic .centerZone{order:2}body.style-classic .rightZone{order:3}
body.style-southpaw .rightZone{order:1}body.style-southpaw .centerZone{order:2}body.style-southpaw .leftZone{order:3}
body.style-arcade .centerZone{order:1}body.style-arcade .leftZone{order:2}body.style-arcade .rightZone{order:3}
body.style-twinstick .leftZone{order:1}body.style-twinstick .rightZone{order:2}body.style-twinstick .centerZone{order:3}
body.style-southpaw .stage{grid-template-columns:minmax(250px,43%) minmax(185px,27%) minmax(190px,30%)}
body.style-arcade .stage{grid-template-columns:minmax(185px,27%) minmax(190px,30%) minmax(250px,43%)}
body.style-twinstick .stage{grid-template-columns:minmax(190px,30%) minmax(250px,43%) minmax(185px,27%)}
.rotateDock .btn{font-size:16px!important;font-weight:950}
body.layout-compact .stage{grid-template-columns:minmax(185px,35%) minmax(165px,27%) minmax(195px,38%)}body.layout-compact .stickBase,body.layout-compact .mouseBase{width:min(36vh,166px);height:min(36vh,166px)}body.layout-compact .leftZone,body.layout-compact .rightZone,body.layout-compact .centerZone{padding:5px}body.layout-compact .btn{font-size:9px;border-radius:11px}body.layout-compact .leftQuick{gap:4px}body.layout-compact .rightGrid{grid-template-columns:minmax(0,1fr) 70px;gap:4px}body.layout-compact .rotateDock .btn{width:62px;height:30px;font-size:9px}body.layout-compact .rotateDock{left:2%;right:2%}body.layout-compact .leftZone>.miniHold{bottom:55px}
body.layout-balanced .stickBase,body.layout-balanced .mouseBase{width:min(42vh,198px);height:min(42vh,198px)}
body.layout-wide .stage{grid-template-columns:minmax(275px,36%) minmax(205px,25%) minmax(265px,39%)}body.layout-wide .stickBase{width:min(47vh,222px);height:min(47vh,222px)}body.layout-wide .mouseBase{width:min(48vh,228px);height:min(48vh,228px)}body.layout-wide .rightGrid{grid-template-columns:minmax(0,1fr) 88px}
.hotbar{display:grid;grid-template-columns:repeat(10,1fr);gap:4px;padding:1px 0}.hotbar .btn{border-radius:11px;font-size:11px;background:linear-gradient(180deg,#1b2940,#111b2a)}.hotbar .shifted{box-shadow:inset 0 0 0 2px #d9b959,0 0 12px rgba(217,185,89,.14);color:#ffe88c}
.chat{position:fixed;z-index:30;left:8px;right:8px;top:38px;display:none;gap:5px;background:rgba(12,22,34,.96);border:1px solid var(--lineStrong);border-radius:12px;padding:6px;box-shadow:0 14px 32px rgba(0,0,0,.24)}.chat.open{display:flex}.chatClose{min-width:36px;background:linear-gradient(#40212a,#251219);border-color:rgba(255,112,130,.48)}.chat input{flex:1;min-width:0;height:36px;background:#050b12;color:white;border:1px solid #4a678c;border-radius:9px;padding:4px 10px;font-size:13px;user-select:text;-webkit-user-select:text;touch-action:auto}
.overlay{position:fixed;inset:0;background:#03070bd9;z-index:40;display:none;align-items:center;justify-content:center;padding:8px}.overlay.open{display:flex}.sheet{width:min(96vw,860px);max-height:94vh;overflow:auto;touch-action:pan-y;background:#101925;border:1px solid #3b5577;border-radius:14px;padding:10px;box-shadow:0 15px 45px #000b}.sheetHead{display:flex;align-items:center;gap:8px;position:sticky;top:-10px;background:#101925;padding:4px 0 7px;z-index:2}.sheetHead h2{font-size:15px;margin:0;flex:1}
.settingsStack{display:grid;gap:10px}.settingsCard{background:#0a121c;border:1px solid #263b56;border-radius:10px;padding:8px}.settingsCard h3{margin:0 0 8px;font-size:12px;color:#d7e3f5}.bindGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.bindRow{background:#0c1521;border:1px solid #263b56;border-radius:8px;padding:6px}.bindRow label{display:block;color:#aabbd1;font-size:9px;margin-bottom:4px}.bindRow select,.bindRow input{width:100%;height:30px;background:#07101a;color:white;border:1px solid #385271;border-radius:6px;font-size:10px;padding:4px 6px}.optionRow{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin-top:6px}.optionRow output{font-family:Consolas,monospace;font-size:11px;color:#dce9fa}.checkRow{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:11px;color:#dce9fa}
#moreOverlay{display:none!important}
@media (orientation:portrait){body:before{content:'Rotate phone sideways';position:fixed;z-index:99;inset:0;display:grid;place-items:center;background:#05080d;color:white;font-weight:900;font-size:20px}.gamepad{visibility:hidden}}
@media (max-height:380px){.gamepad{grid-template-rows:30px auto minmax(0,1fr) 40px}.moreBar.open{max-height:52px}.moreChip{height:38px}.hotbar .btn{font-size:10px}}
/* Tiny landscape phones (including iPhone 4S): make Settings a true narrow-screen page. */
@media (max-width:600px), (max-height:340px){
  .overlay{padding:0;align-items:stretch;justify-content:stretch}
  .sheet{width:100vw;max-width:none;height:100vh;max-height:none;border-radius:0;border-left:0;border-right:0;padding:8px;overflow-x:hidden;overflow-y:auto}
  .sheetHead{top:-8px;margin:0 -1px;padding:6px 1px 8px}.sheetHead h2{font-size:14px}
  .settingsStack,.settingsCard,.bindRow,.optionRow{min-width:0;max-width:100%}
  .settingsCard{padding:7px}.settingsCard h3{font-size:12px;margin-bottom:7px}
  .stylePicker{grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}.styleChoice{height:42px;font-size:10px}
  .layoutPicker{grid-template-columns:repeat(3,minmax(0,1fr));gap:4px}.layoutChoice{height:42px;font-size:9px;padding:3px}
  .styleChoice small,.layoutChoice small{font-size:7px}
  .bindGrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}
  .bindRow{padding:5px}.bindRow label{font-size:9px}.bindRow select,.bindRow input{min-width:0;width:100%;font-size:11px}
  .optionRow{grid-template-columns:minmax(0,1fr) auto}.checkRow{font-size:10px;line-height:1.25}
  .settingsCard .status{white-space:normal;overflow:visible;text-overflow:clip;font-size:9px;line-height:1.35}
}
@media (max-width:420px){
  .layoutPicker{grid-template-columns:1fr}.layoutChoice{height:38px}
  .bindGrid{grid-template-columns:1fr}
}
`;

const $ = id => document.getElementById(id);
const styleTag = document.createElement('style');
styleTag.textContent = STYLE;
document.head.appendChild(styleTag);

const params = new URLSearchParams(location.search);
let room = params.get('room') || '';
let secret = params.get('secret') || '';
const clientId = localStorage.getItem('pixelb8GamepadClientId') || ('phone-' + cryptoRandom(12));
localStorage.setItem('pixelb8GamepadClientId', clientId);
let deviceName = localStorage.getItem('pixelb8GamepadDeviceName') || ('Phone ' + clientId.slice(-4).toUpperCase());
let client = null, desktopOnline = false, desktopArmed = false, heartbeat = null;
let lanSocket=null,lanReconnectTimer=null,lanFailures=0;
const lanRequested=params.get('lan')==='1' || /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(location.hostname);
let rtcPeer=null,rtcChannel=null,rtcRetryTimer=null,rtcIceQueue=[];
const RTC_CONFIG={iceServers:[{urls:'stun:stun.l.google.com:19302'}]};
let stickPointer = null, stickKeys = new Set(), shiftLatched = false, chatOpen = false;
let role = 'unknown', kicked = false;
let heldKeys = new Set();
let mousePointer = null, mouseVector = {x:0,y:0}, mouseLoop = null;
let leftMouseHeld = false, rightMouseHeld = false, middleMouseHeld = false;
let cameraFreelookEnabled = localStorage.getItem('pixelb8GamepadFreelook') === '1';
let tiltEnabled = false, tiltSupported = ('DeviceOrientationEvent' in window), tiltCenter = {gamma:0,beta:0}, tiltLast = {gamma:0,beta:0}, tiltVector = {x:0,y:0};
let moreBarOpen = false;
let toastTimer=null;
const legacyLayoutSize=localStorage.getItem('pixelb8GamepadLayout');
let layoutPreset=localStorage.getItem('pixelb8GamepadLayoutSize') || legacyLayoutSize || ((innerWidth<=568||innerHeight<=340)?'compact':'balanced');
let layoutStyle=localStorage.getItem('pixelb8GamepadLayoutStyle') || 'classic';
const keyboardOnEnterParam=params.get('keyboardOnEnter');
let keyboardOnEnter=keyboardOnEnterParam!==null ? keyboardOnEnterParam==='1' : localStorage.getItem('pixelb8GamepadKeyboardOnEnter')==='1';
if(keyboardOnEnterParam!==null)localStorage.setItem('pixelb8GamepadKeyboardOnEnter',keyboardOnEnter?'1':'0');

const KEY_OPTIONS = [
  'NONE','0','1','2','3','4','5','6','7','8','9',
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  'SPACE','ENTER','TAB','ESC','BACKSPACE','CAPSLOCK','SHIFT','CTRL','ALT',
  'UP','DOWN','LEFT','RIGHT','HOME','END','PAGEUP','PAGEDOWN','INSERT','DELETE',
  'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
  'GRAVE','MINUS','EQUALS','LBRACKET','RBRACKET','BACKSLASH','SEMICOLON','APOSTROPHE','COMMA','PERIOD','SLASH',
  'NUM0','NUM1','NUM2','NUM3','NUM4','NUM5','NUM6','NUM7','NUM8','NUM9','NUMPLUS','NUMMINUS','NUMMULTIPLY','NUMDIVIDE','NUMDECIMAL','NUMENTER'
];
const KEY_DISPLAY = {
  NONE:'Off',SPACE:'Space',ENTER:'Enter',TAB:'Tab',ESC:'Esc',BACKSPACE:'Backspace',CAPSLOCK:'Caps Lock',SHIFT:'Shift',CTRL:'Ctrl',ALT:'Alt',
  UP:'↑ Up',DOWN:'↓ Down',LEFT:'← Left',RIGHT:'→ Right',HOME:'Home',END:'End',PAGEUP:'Page Up',PAGEDOWN:'Page Down',INSERT:'Insert',DELETE:'Delete',
  GRAVE:'` / ~',MINUS:'- / _',EQUALS:'= / +',LBRACKET:'[ / {',RBRACKET:'] / }',BACKSLASH:'\\ / |',SEMICOLON:'; / :',APOSTROPHE:"' / \"",COMMA:', / <',PERIOD:'. / >',SLASH:'/ / ?',
  NUM0:'Numpad 0',NUM1:'Numpad 1',NUM2:'Numpad 2',NUM3:'Numpad 3',NUM4:'Numpad 4',NUM5:'Numpad 5',NUM6:'Numpad 6',NUM7:'Numpad 7',NUM8:'Numpad 8',NUM9:'Numpad 9',NUMPLUS:'Numpad +',NUMMINUS:'Numpad -',NUMMULTIPLY:'Numpad *',NUMDIVIDE:'Numpad /',NUMDECIMAL:'Numpad .',NUMENTER:'Numpad Enter'
};
const DEFAULT_BINDINGS = {moveUp:'W',moveDown:'S',moveLeft:'A',moveRight:'D',jump:'SPACE',sit:'X',modifier:'SHIFT',enter:'ENTER',action:'F',interact:'3',target:'TAB',rotateLeft:'Q',rotateRight:'E',run:'BACKSLASH',inventory:'I',revive:'T',hotbar1:'1',hotbar2:'2',hotbar3:'3',hotbar4:'4',hotbar5:'5',hotbar6:'6',hotbar7:'7',hotbar8:'8',hotbar9:'9',hotbar0:'0'};
const LABELS = {moveUp:'Joystick Up',moveDown:'Joystick Down',moveLeft:'Joystick Left',moveRight:'Joystick Right',jump:'Jump',sit:'Sit',modifier:'Shift modifier',enter:'Chat / Enter',action:'Action',interact:'Interact / Use',target:'Target',rotateLeft:'Rotate left',rotateRight:'Rotate right',run:'Run / Walk toggle',inventory:'Inventory',revive:'Revive / Teleport',hotbar1:'Hotbar 1',hotbar2:'Hotbar 2',hotbar3:'Hotbar 3',hotbar4:'Hotbar 4',hotbar5:'Hotbar 5',hotbar6:'Hotbar 6',hotbar7:'Hotbar 7',hotbar8:'Hotbar 8',hotbar9:'Hotbar 9',hotbar0:'Hotbar 0'};
const TOP_MORE = [['inventory','INV'],['revive','REVIVE'],['run','RUN'],['interact','USE'],['target','TAB'],['action','ACT']];

let bindings = loadBindings(), mouseSettings = loadMouseSettings();

function cryptoRandom(n){const a=new Uint8Array(n);crypto.getRandomValues(a);return [...a].map(v=>(v%36).toString(36)).join('')}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function base(){return `pixelb8/gamepad/${room}`}
function setStatus(text,connected=false){$('status').textContent=text;$('topbar').classList.toggle('connected',!!connected)}
function lanReady(){return lanSocket?.readyState===WebSocket.OPEN}
function signalingReady(){return lanReady()||!!client?.connected}
function canControl(){return signalingReady()&&desktopOnline&&desktopArmed&&role==='controller'&&!kicked}
function showControlToast(message){let t=$('controlToast');if(!t){t=document.createElement('div');t.id='controlToast';t.className='controlToast';document.body.appendChild(t)}t.textContent=message;clearTimeout(toastTimer);requestAnimationFrame(()=>t.classList.add('show'));toastTimer=setTimeout(()=>t.classList.remove('show'),1500)}
function requireControl(){if(canControl())return true;if(kicked)showControlToast('CONTROLLER ACCESS REMOVED');else if(!signalingReady())showControlToast('NOT CONNECTED TO DESKTOP');else if(!desktopOnline)showControlToast('DESKTOP APP IS OFFLINE');else if(!desktopArmed)showControlToast('DISARMED — arm Gamepad on your desktop');else if(role!=='controller')showControlToast('WAITING FOR CONTROLLER ACCESS');else showControlToast('CONTROLLER NOT READY');vibe(18);return false}
function applyLayout(name,save=true){if(!['compact','balanced','wide'].includes(name))name='balanced';layoutPreset=name;document.body.classList.remove('layout-compact','layout-balanced','layout-wide');document.body.classList.add('layout-'+name);if(save)localStorage.setItem('pixelb8GamepadLayoutSize',name);document.querySelectorAll('.layoutChoice').forEach(b=>b.classList.toggle('selected',b.dataset.layout===name));setTimeout(()=>{resetStick();resetMouse()},0)}
function applyLayoutStyle(name,save=true){if(!['classic','southpaw','arcade','twinstick'].includes(name))name='classic';layoutStyle=name;document.body.classList.remove('style-classic','style-southpaw','style-arcade','style-twinstick');document.body.classList.add('style-'+name);if(save)localStorage.setItem('pixelb8GamepadLayoutStyle',name);document.querySelectorAll('.styleChoice').forEach(b=>b.classList.toggle('selected',b.dataset.style===name));setTimeout(()=>{resetStick();resetMouse()},0)}
function vibe(ms){try{navigator.vibrate?.(ms)}catch{}}
function loadBindings(){try{const saved=JSON.parse(localStorage.getItem('pixelb8GamepadBindings')||'{}');const migrationKey='pixelb8GamepadBindingMigration220';if(!localStorage.getItem(migrationKey)&&saved.action==='3'&&saved.interact==='F'){saved.action='F';saved.interact='3';localStorage.setItem('pixelb8GamepadBindings',JSON.stringify(saved));localStorage.setItem(migrationKey,'1')}else if(!localStorage.getItem(migrationKey)){localStorage.setItem(migrationKey,'1')}return {...DEFAULT_BINDINGS,...saved}}catch{return {...DEFAULT_BINDINGS}}}
function saveBindings(){localStorage.setItem('pixelb8GamepadBindings',JSON.stringify(bindings))}
function loadMouseSettings(){try{const s=JSON.parse(localStorage.getItem('pixelb8GamepadMouseSettings')||'{}');return {sensitivity:clamp(Number(s.sensitivity)||18,4,36),tiltSensitivity:clamp(Number(s.tiltSensitivity)||12,2,30),horizontalOnly:!!s.horizontalOnly,invertX:!!s.invertX,invertY:!!s.invertY,tiltAutoEnable:!!s.tiltAutoEnable}}catch{return {sensitivity:18,tiltSensitivity:12,horizontalOnly:false,invertX:false,invertY:false,tiltAutoEnable:false}}}
function saveMouseSettings(){localStorage.setItem('pixelb8GamepadMouseSettings',JSON.stringify(mouseSettings))}
function envelope(obj){return {...obj,clientId,deviceName,secret,source:'phone-controller',ts:Date.now()}}
function rawPublish(obj){if(!room||!secret||kicked)return;const msg=JSON.stringify(envelope(obj));if(lanReady()){try{lanSocket.send(msg);return}catch{}}if(client?.connected)client.publish(`${base()}/control`,msg,{qos:0})}
function signalDesktop(obj){if(!client?.connected||!room||!secret||kicked)return;client.publish(`${base()}/signal/desktop`,JSON.stringify(envelope(obj)),{qos:0})}
function rtcReady(){return rtcChannel?.readyState==='open'}
function publish(obj){if(!canControl())return;if(lanReady()){try{lanSocket.send(JSON.stringify(envelope(obj)));return}catch{}}if(rtcReady()){try{rtcChannel.send(JSON.stringify(envelope(obj)));return}catch{}}rawPublish(obj)}
function keyFor(action){return bindings[action]&&bindings[action]!=='NONE'?bindings[action]:null}
function displayForKey(key){return KEY_DISPLAY[key]||key||'Off'}
function downKey(key){if(!key||heldKeys.has(key)||!canControl())return;heldKeys.add(key);publish({type:'key-down',key})}
function upKey(key){if(!key||!heldKeys.has(key))return;heldKeys.delete(key);publish({type:'key-up',key})}
function tapKey(key){if(!key||!canControl())return;publish({type:'tap',key,duration:55});vibe(10)}
function tapAction(action){const key=keyFor(action);if(key)tapKey(key)}
function tapMouse(which){if(!canControl())return;const downType=which==='left'?'mouse-left-down':'mouse-right-down';const upType=which==='left'?'mouse-left-up':'mouse-right-up';publish({type:downType});setTimeout(()=>publish({type:upType}),45);vibe(8)}
function setMouseHold(which,on){if(which==='left'){if(leftMouseHeld===!!on)return;leftMouseHeld=!!on;$('leftHoldBtn').classList.toggle('latched',leftMouseHeld);if(canControl())publish({type:leftMouseHeld?'mouse-left-down':'mouse-left-up'})}else{if(rightMouseHeld===!!on)return;rightMouseHeld=!!on;$('rightHoldBtn').classList.toggle('latched',rightMouseHeld);if(canControl())publish({type:rightMouseHeld?'mouse-right-down':'mouse-right-up'})}}
function releaseAll(localOnly=false){for(const k of [...heldKeys])upKey(k);heldKeys.clear();stickKeys.clear();setMouseHold('left',false);setMouseHold('right',false);middleMouseHeld=false;if(!localOnly&&canControl())publish({type:'release-all'});resetStick();resetMouse();setShift(false)}

function setupInjectedUI(){
  const gamepad = document.querySelector('.gamepad');
  const topbar = $('topbar');
  let moreBar = $('moreBar');
  if(!moreBar){
    moreBar = document.createElement('div');
    moreBar.id='moreBar';
    moreBar.className='moreBar';
    topbar.after(moreBar);
  }
  const moreOverlay = $('moreOverlay');
  if(moreOverlay) moreOverlay.style.display='none';
  const stickZone = $('stickZone');
  if(stickZone && !$('rotLeftDock')){
    const dock = document.createElement('div');
    dock.className='rotateDock';
    dock.innerHTML = `<button class="btn" id="rotLeftDock" data-main-key="rotateLeft"></button><button class="btn" id="rotRightDock" data-main-key="rotateRight"></button>`;
    stickZone.appendChild(dock);
  }
}


function updateTransportStatus(){
  if(lanReady())setStatus(desktopArmed?'PRIMARY · LOCAL':'LOCAL · desktop not armed',true);
  else if(rtcReady())setStatus(desktopArmed?'PRIMARY · DIRECT':'DIRECT · desktop not armed',true);
  else if(role==='controller')setStatus(desktopArmed?'PRIMARY · REMOTE':'REMOTE · desktop not armed',true);
}
function closeRtc(){
  clearTimeout(rtcRetryTimer);rtcRetryTimer=null;rtcIceQueue=[];
  try{rtcChannel?.close()}catch{}try{rtcPeer?.close()}catch{}
  rtcChannel=null;rtcPeer=null;
}
function scheduleRtcRetry(){clearTimeout(rtcRetryTimer);if(!client?.connected||kicked)return;rtcRetryTimer=setTimeout(()=>startRtc(),2500)}
async function startRtc(){
  if(!client?.connected||!room||!secret||kicked)return;
  closeRtc();
  try{
    const pc=new RTCPeerConnection(RTC_CONFIG);rtcPeer=pc;
    const channel=pc.createDataChannel('pixelb8-controls',{ordered:true});rtcChannel=channel;
    channel.onopen=()=>{updateTransportStatus();vibe(18)};
    channel.onclose=()=>{updateTransportStatus();scheduleRtcRetry()};
    channel.onerror=()=>updateTransportStatus();
    pc.onicecandidate=e=>{if(e.candidate)signalDesktop({type:'rtc-ice',candidate:e.candidate})};
    pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState))scheduleRtcRetry()};
    const offer=await pc.createOffer();await pc.setLocalDescription(offer);
    signalDesktop({type:'rtc-offer',sdp:pc.localDescription.sdp});
  }catch{scheduleRtcRetry()}
}
async function handleRtcSignal(msg){
  try{
    if(msg.type==='rtc-answer'&&rtcPeer){
      await rtcPeer.setRemoteDescription({type:'answer',sdp:msg.sdp});
      for(const c of rtcIceQueue.splice(0))await rtcPeer.addIceCandidate(c);
    }else if(msg.type==='rtc-ice'&&msg.candidate&&rtcPeer){
      if(rtcPeer.remoteDescription)await rtcPeer.addIceCandidate(msg.candidate);else rtcIceQueue.push(msg.candidate);
    }
  }catch{}
}

function handleDesktopMessage(msg){
  try{
    if(msg.type==='desktop-status'){desktopOnline=!!msg.online;desktopArmed=!!msg.armed;if(!desktopOnline)role='unknown'}
    if(msg.type==='role'){role=msg.role||'waiting';desktopArmed=!!msg.armed;desktopOnline=true;if(role==='controller')updateTransportStatus();else setStatus('connected · waiting for control',true)}
    if(msg.type==='kicked'){kicked=true;role='kicked';desktopOnline=false;desktopArmed=false;releaseAll(true);closeRtc();setStatus(msg.reason||'controller access removed')}
    if(msg.type==='notice'){setStatus(msg.message||'desktop notice',true)}
  }catch{}
}
function scheduleLanReconnect(){clearTimeout(lanReconnectTimer);if(!lanRequested||kicked)return;lanReconnectTimer=setTimeout(()=>connectLan(true),Math.min(5000,700+lanFailures*500))}
function connectLan(isRetry=false){
  if(!lanRequested||!room||!secret)return false;
  const previous=lanSocket;
  const proto=location.protocol==='https:'?'wss:':'ws:';
  const url=`${proto}//${location.host}/ws`;
  if(!signalingReady())setStatus(isRetry?'reconnecting locally…':'connecting locally…');
  let socket;
  try{socket=new WebSocket(url);lanSocket=socket}catch{lanFailures++;scheduleLanReconnect();return false}
  if(previous&&previous!==socket){try{previous.close()}catch{}}
  socket.onopen=()=>{
    if(lanSocket!==socket)return;
    lanFailures=0;kicked=false;desktopOnline=true;rawPublish({type:'hello'});updateTransportStatus();
    clearInterval(heartbeat);heartbeat=setInterval(()=>rawPublish({type:'heartbeat'}),1000);
  };
  socket.onmessage=e=>{if(lanSocket!==socket)return;try{handleDesktopMessage(JSON.parse(String(e.data)))}catch{}};
  socket.onerror=()=>{};
  socket.onclose=()=>{
    // Ignore close callbacks from an older socket that was intentionally replaced.
    if(lanSocket!==socket||kicked)return;
    lanSocket=null;
    releaseAll(true);
    lanFailures++;
    scheduleLanReconnect();
    const fallbackAlive=rtcReady()||!!client?.connected;
    if(fallbackAlive){
      desktopOnline=true;
      updateTransportStatus();
    }else{
      // Do not erase the known desktop armed/role state during a brief LAN retry.
      // Only show reconnecting when there is genuinely no usable transport.
      setStatus('reconnecting…');
    }
    if(lanFailures>=2)connectMqttFallback();
  };
  return true;
}
function connectMqttFallback(){
  if(client?.connected||typeof mqtt==='undefined')return;
  try{client?.end(true)}catch{}
  setStatus(lanRequested?'local unavailable · trying remote…':'connecting…');
  try{client=mqtt.connect('wss://broker.emqx.io:8084/mqtt',{clientId:`pixelb8-gamepad-${cryptoRandom(10)}`,clean:true,reconnectPeriod:2000,connectTimeout:10000})}catch{return}
  client.on('connect',()=>{client.subscribe(`${base()}/status`);client.subscribe(`${base()}/client/${clientId}`);client.subscribe(`${base()}/signal/client/${clientId}`);rawPublish({type:'hello'});desktopOnline=true;setStatus(lanReady()?'connected · local':'paired · remote',true);clearInterval(heartbeat);heartbeat=setInterval(()=>rawPublish({type:'heartbeat'}),1000);if(!lanReady())startRtc()});
  client.on('message',(topic,payload)=>{try{const msg=JSON.parse(String(payload));if(topic===`${base()}/signal/client/${clientId}`){handleRtcSignal(msg);return}handleDesktopMessage(msg)}catch{}});
  client.on('reconnect',()=>{if(!lanReady()&&!rtcReady())setStatus('reconnecting remote link…')});
  client.on('error',()=>{if(!lanReady()&&!rtcReady())setStatus('remote link unavailable')});
  client.on('close',()=>{if(!lanReady()&&!rtcReady()){desktopOnline=false;role='unknown';closeRtc();setStatus('reconnecting…')}});
}
function connect(){
  const roomField=$('roomSetting');if(roomField){const nextRoom=roomField.value.trim();if(nextRoom)room=nextRoom;roomField.value=room}
  kicked=false;releaseAll(true);closeRtc();
  if(lanRequested){connectLan(false);setTimeout(()=>{if(!lanReady())connectMqttFallback()},1800)}else connectMqttFallback();
}
$('connect').onclick=connect;

function renderHotbar(){const bar=$('hotbar');bar.innerHTML='';const names=['1','2','3','4','5','6','7','8','9','0'];for(const n of names){const b=document.createElement('button');b.className='btn';b.textContent=n;b.onclick=()=>{const key=keyFor('hotbar'+n);if(!key||!requireControl())return;if(shiftLatched){publish({type:'modified-tap',modifier:keyFor('modifier'),key,duration:55});setShift(false);b.classList.add('shifted');setTimeout(()=>b.classList.remove('shifted'),180)}else tapKey(key)};bar.appendChild(b)}}
function refreshLabels(){ $('dirUp').textContent=displayForKey(keyFor('moveUp'));$('dirDown').textContent=displayForKey(keyFor('moveDown'));$('dirLeft').textContent=displayForKey(keyFor('moveLeft'));$('dirRight').textContent=displayForKey(keyFor('moveRight'));document.querySelectorAll('[data-label]').forEach(el=>el.textContent=displayForKey(keyFor(el.dataset.label)));document.querySelectorAll('[data-rlabel]').forEach(el=>el.textContent=displayForKey(keyFor(el.dataset.rlabel)));document.querySelectorAll('[data-main-key]').forEach(el=>el.textContent=displayForKey(keyFor(el.dataset.mainKey)));renderHotbar();buildMoreBar() }
function setShift(on){shiftLatched=!!on;$('shift').classList.toggle('latched',shiftLatched);$('shift').classList.toggle('active',shiftLatched)}
$('shift').onclick=()=>{if(!requireControl())return;setShift(!shiftLatched);vibe(15)};
(function setupRunHold(){const b=$('runHold');let active=false;b.addEventListener('pointerdown',e=>{e.preventDefault();if(!requireControl())return;active=true;downKey(keyFor('run'));b.classList.add('active')});const end=()=>{if(active){active=false;upKey(keyFor('run'));b.classList.remove('active')}};b.addEventListener('pointerup',end);b.addEventListener('pointercancel',end);b.addEventListener('lostpointercapture',end)})();
document.querySelectorAll('[data-action]').forEach(el=>{el.addEventListener('pointerdown',e=>{e.preventDefault();if(!requireControl())return;tapAction(el.dataset.action);el.classList.add('active')});const end=()=>el.classList.remove('active');el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end)});
$('release').onclick=()=>releaseAll();
function openChat(){if(chatOpen)return;if(!requireControl())return;chatOpen=true;publish({type:'chat-open',key:keyFor('enter')});$('chat').classList.add('open');setTimeout(()=>$('chatInput').focus(),50)}
function closeChat(send=true){if(!chatOpen)return;const text=$('chatInput').value.trim();if(canControl()){if(send&&text)publish({type:'chat-send',text,enterKey:keyFor('enter')});else publish({type:'tap',key:keyFor('enter'),duration:55})}$('chatInput').value='';$('chat').classList.remove('open');$('chatInput').blur();chatOpen=false}
function dismissPhoneChat(){if(!chatOpen)return;$('chatInput').value='';$('chat').classList.remove('open');$('chatInput').blur();chatOpen=false;showControlToast('PHONE CHAT CLOSED — no key sent')}
function pressEnter(){if(!requireControl())return;if(keyboardOnEnter)openChat();else publish({type:'tap',key:keyFor('enter'),duration:55})}
$('enter').onclick=()=>chatOpen?closeChat(true):pressEnter();$('keyboardBtn').onclick=()=>chatOpen?$('chatInput').focus():openChat();$('chatSend').onclick=()=>closeChat(true);$('chatClose').onclick=dismissPhoneChat;$('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();closeChat(true)}else if(e.key==='Escape'){e.preventDefault();dismissPhoneChat()}});

function buildMoreBar(){const bar=$('moreBar');if(!bar)return;bar.innerHTML='';for(const [action,label] of TOP_MORE){const b=document.createElement('button');b.className='btn moreChip';b.innerHTML=`${label}<small>${displayForKey(keyFor(action))}</small>`;b.onclick=()=>{if(requireControl())tapAction(action)};bar.appendChild(b)}}
$('more').onclick=()=>{moreBarOpen=!moreBarOpen;$('moreBar').classList.toggle('open',moreBarOpen);$('more').classList.toggle('latched',moreBarOpen);$('more').textContent=moreBarOpen?'✕ MORE':'☰ MORE'};

function buildSettings(){$('deviceNameInput').value=deviceName;$('roomSetting').value=room;$('keyboardOnEnter').checked=keyboardOnEnter;$('keyboardOnEnter').onchange=e=>{keyboardOnEnter=!!e.target.checked;localStorage.setItem('pixelb8GamepadKeyboardOnEnter',keyboardOnEnter?'1':'0');showControlToast(keyboardOnEnter?'ENTER OPENS KEYBOARD':'ENTER SENDS ENTER ONLY')};document.querySelectorAll('.layoutChoice').forEach(b=>b.classList.toggle('selected',b.dataset.layout===layoutPreset));document.querySelectorAll('.styleChoice').forEach(b=>b.classList.toggle('selected',b.dataset.style===layoutStyle));const g=$('bindGrid');g.innerHTML='';for(const action of Object.keys(DEFAULT_BINDINGS)){const row=document.createElement('div');row.className='bindRow';const label=document.createElement('label');label.textContent=LABELS[action]||action;const sel=document.createElement('select');for(const k of KEY_OPTIONS){const o=document.createElement('option');o.value=k;o.textContent=KEY_DISPLAY[k]||k;o.selected=bindings[action]===k;sel.appendChild(o)}sel.onchange=()=>{bindings[action]=sel.value;saveBindings();refreshLabels()};row.append(label,sel);g.appendChild(row)}$('mouseSensitivity').value=mouseSettings.sensitivity;$('mouseSensitivityOut').textContent=mouseSettings.sensitivity;$('tiltSensitivity').value=mouseSettings.tiltSensitivity;$('tiltSensitivityOut').textContent=mouseSettings.tiltSensitivity;$('mouseHorizontalOnly').checked=mouseSettings.horizontalOnly;$('mouseInvertX').checked=mouseSettings.invertX;$('mouseInvertY').checked=mouseSettings.invertY;$('tiltAutoEnable').checked=mouseSettings.tiltAutoEnable;updateTiltStatus()}
$('deviceNameInput').addEventListener('change',()=>{deviceName=($('deviceNameInput').value.trim()||('Phone '+clientId.slice(-4).toUpperCase())).slice(0,48);localStorage.setItem('pixelb8GamepadDeviceName',deviceName);rawPublish({type:'hello'})});
$('roomSetting').addEventListener('change',()=>{const next=$('roomSetting').value.trim();if(next)room=next;$('roomSetting').value=room;showControlToast('ROOM SAVED — TAP ↻ TO RECONNECT')});
$('mouseSensitivity').addEventListener('input',()=>{mouseSettings.sensitivity=clamp(Number($('mouseSensitivity').value)||18,4,36);$('mouseSensitivityOut').textContent=mouseSettings.sensitivity;saveMouseSettings()});$('tiltSensitivity').addEventListener('input',()=>{mouseSettings.tiltSensitivity=clamp(Number($('tiltSensitivity').value)||12,2,30);$('tiltSensitivityOut').textContent=mouseSettings.tiltSensitivity;saveMouseSettings()});$('mouseHorizontalOnly').onchange=()=>{mouseSettings.horizontalOnly=$('mouseHorizontalOnly').checked;saveMouseSettings()};$('mouseInvertX').onchange=()=>{mouseSettings.invertX=$('mouseInvertX').checked;saveMouseSettings()};$('mouseInvertY').onchange=()=>{mouseSettings.invertY=$('mouseInvertY').checked;saveMouseSettings()};$('tiltAutoEnable').onchange=()=>{mouseSettings.tiltAutoEnable=$('tiltAutoEnable').checked;saveMouseSettings()};
document.querySelectorAll('.layoutChoice').forEach(b=>b.onclick=()=>applyLayout(b.dataset.layout));document.querySelectorAll('.styleChoice').forEach(b=>b.onclick=()=>applyLayoutStyle(b.dataset.style));$('settings').onclick=()=>{buildSettings();$('settingsOverlay').classList.add('open')};$('resetBindings').onclick=()=>{bindings={...DEFAULT_BINDINGS};saveBindings();buildSettings();refreshLabels()};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$((b.dataset.close)).classList.remove('open'));document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('pointerdown',e=>{if(e.target===o)o.classList.remove('open')}));

function bindHoldControl(el, action){let active=false;const block=e=>{e.preventDefault();e.stopPropagation()};el.addEventListener('pointerdown',e=>{block(e);if(!requireControl())return;active=true;el.setPointerCapture?.(e.pointerId);downKey(keyFor(action));el.classList.add('active')});const end=e=>{if(e){e.preventDefault?.();e.stopPropagation?.()}if(active){active=false;upKey(keyFor(action));el.classList.remove('active')}};el.addEventListener('pointermove',e=>e.stopPropagation());el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',end);el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation()})}

const stickZone=$('stickZone'),stickBase=$('stickBase'),stickKnob=$('stickKnob');function resetStick(){stickKnob.style.transform='translate(-50%,-50%)'}function updateStick(e){const r=stickBase.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.31,d=Math.hypot(dx,dy);if(d>max){dx=dx/d*max;dy=dy/d*max}stickKnob.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;if(!canControl())return;const nx=dx/max,ny=dy/max,nextActions=[];if(nx<-.25)nextActions.push('moveLeft');if(nx>.25)nextActions.push('moveRight');if(ny<-.25)nextActions.push('moveUp');if(ny>.25)nextActions.push('moveDown');const next=new Set(nextActions.map(keyFor).filter(Boolean));for(const k of stickKeys)if(!next.has(k))upKey(k);for(const k of next)if(!stickKeys.has(k))downKey(k);stickKeys=next}
stickZone.addEventListener('pointerdown',e=>{if(e.target.closest?.('.rotateDock'))return;e.preventDefault();if(!requireControl())return;stickPointer=e.pointerId;stickZone.setPointerCapture?.(e.pointerId);updateStick(e)});stickZone.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer)updateStick(e)});function endStick(e){if(stickPointer!==null&&(!e||e.pointerId===stickPointer)){for(const k of stickKeys)upKey(k);stickKeys.clear();stickPointer=null;resetStick()}}stickZone.addEventListener('pointerup',endStick);stickZone.addEventListener('pointercancel',endStick);stickZone.addEventListener('lostpointercapture',endStick);

const mouseZone=$('mouseZone'),mouseBase=$('mouseBase'),mouseKnob=$('mouseKnob');function resetMouse(){mouseKnob.style.transform='translate(-50%,-50%)';mouseVector={x:0,y:0}}function startMouseLoop(){if(mouseLoop)return;mouseLoop=setInterval(()=>{if(!canControl())return;let x=mouseVector.x+tiltVector.x,y=mouseVector.y+tiltVector.y;if(mouseSettings.invertX)x=-x;if(mouseSettings.invertY)y=-y;if(mouseSettings.horizontalOnly)y=0;const dx=Math.round(x*mouseSettings.sensitivity),dy=Math.round(y*mouseSettings.sensitivity);if(dx||dy)publish({type:'mouse-move',dx,dy})},33)}function updateMouse(e){const r=mouseBase.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;let dx=e.clientX-cx,dy=e.clientY-cy,max=r.width*.29,d=Math.hypot(dx,dy);if(d>max){dx=dx/d*max;dy=dy/d*max}mouseKnob.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`;mouseVector={x:dx/max,y:dy/max}}
function setMiddleMouse(on){if(middleMouseHeld===!!on)return;middleMouseHeld=!!on;if(canControl())publish({type:on?'mouse-middle-down':'mouse-middle-up'})}
mouseZone.addEventListener('pointerdown',e=>{e.preventDefault();if(!requireControl())return;mousePointer=e.pointerId;mouseZone.setPointerCapture?.(e.pointerId);if(cameraFreelookEnabled)setMiddleMouse(true);updateMouse(e);startMouseLoop();vibe(8)});mouseZone.addEventListener('pointermove',e=>{if(e.pointerId===mousePointer)updateMouse(e)});function endMouse(e){if(mousePointer!==null&&(!e||e.pointerId===mousePointer)){if(cameraFreelookEnabled)setMiddleMouse(false);mousePointer=null;resetMouse()}}mouseZone.addEventListener('pointerup',endMouse);mouseZone.addEventListener('pointercancel',endMouse);mouseZone.addEventListener('lostpointercapture',endMouse);
function bindMousePrimary(el,which){let pressed=false;const isLatched=()=>which==='left'?leftMouseHeld:rightMouseHeld;const downType=which==='left'?'mouse-left-down':'mouse-right-down';const upType=which==='left'?'mouse-left-up':'mouse-right-up';el.addEventListener('pointerdown',e=>{e.preventDefault();if(!requireControl())return;pressed=true;el.setPointerCapture?.(e.pointerId);if(!isLatched())publish({type:downType});el.classList.add('active');vibe(8)});const end=e=>{if(!pressed)return;pressed=false;if(!isLatched()&&canControl())publish({type:upType});el.classList.remove('active')};el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end);el.addEventListener('lostpointercapture',end)}
bindMousePrimary($('leftClickBtn'),'left');bindMousePrimary($('rightClickBtn'),'right');
$('leftHoldBtn').onclick=()=>{if(requireControl())setMouseHold('left',!leftMouseHeld)};$('rightHoldBtn').onclick=()=>{if(requireControl())setMouseHold('right',!rightMouseHeld)};

function updateTiltStatus(extra=''){let t=!tiltSupported?'Tilt unsupported on this browser.':tiltEnabled?'Tilt ON — phone motion adds mouse/camera movement.':'Tilt OFF.';if(extra)t+=' '+extra;$('tiltStatus').textContent=t;$('tiltBtn').classList.toggle('latched',tiltEnabled)}function centerTilt(){tiltCenter={gamma:tiltLast.gamma||0,beta:tiltLast.beta||0};updateTiltStatus('Centered.')}function onOrientation(ev){tiltLast={gamma:Number(ev.gamma||0),beta:Number(ev.beta||0)};if(!tiltEnabled){tiltVector={x:0,y:0};return}tiltVector={x:clamp((tiltLast.gamma-tiltCenter.gamma)/20,-1.2,1.2)*(mouseSettings.tiltSensitivity/Math.max(1,mouseSettings.sensitivity)),y:clamp((tiltLast.beta-tiltCenter.beta)/20,-1.2,1.2)*(mouseSettings.tiltSensitivity/Math.max(1,mouseSettings.sensitivity))}}window.addEventListener('deviceorientation',onOrientation,true);async function enableTilt(){if(!tiltSupported){updateTiltStatus();return}try{if(typeof DeviceOrientationEvent.requestPermission==='function'){const s=await DeviceOrientationEvent.requestPermission();if(s!=='granted'){updateTiltStatus('Permission denied.');return}}tiltEnabled=true;centerTilt();startMouseLoop();if(mouseSettings.tiltAutoEnable)localStorage.setItem('pixelb8GamepadTiltEnabled','1');updateTiltStatus()}catch{updateTiltStatus('Could not enable tilt.')}}function disableTilt(){tiltEnabled=false;tiltVector={x:0,y:0};localStorage.removeItem('pixelb8GamepadTiltEnabled');updateTiltStatus()}$('tiltBtn').onclick=()=>tiltEnabled?disableTilt():enableTilt();$('recenterTiltBtn').onclick=centerTilt;
function updateFreelookButton(){const b=$('cameraCenterBtn');if(!b)return;b.classList.toggle('latched',cameraFreelookEnabled);const small=b.querySelector('small');if(small)small.textContent=cameraFreelookEnabled?'FREELOOK ON':'hold: FREELOOK'}
(function bindCameraCenter(){const b=$('cameraCenterBtn');let timer=null,longTriggered=false,pointerId=null;const toggle=()=>{longTriggered=true;cameraFreelookEnabled=!cameraFreelookEnabled;localStorage.setItem('pixelb8GamepadFreelook',cameraFreelookEnabled?'1':'0');if(!cameraFreelookEnabled)setMiddleMouse(false);updateFreelookButton();showControlToast(cameraFreelookEnabled?'CAMERA FREELOOK ON':'CAMERA FREELOOK OFF');vibe(18)};b.addEventListener('pointerdown',e=>{e.preventDefault();if(!requireControl())return;pointerId=e.pointerId;longTriggered=false;b.setPointerCapture?.(e.pointerId);b.classList.add('active');timer=setTimeout(toggle,520)});const end=e=>{if(pointerId===null||e.pointerId!==pointerId)return;clearTimeout(timer);timer=null;b.classList.remove('active');if(!longTriggered&&canControl()){publish({type:'mouse-middle-tap'});vibe(10)}pointerId=null};b.addEventListener('pointerup',end);b.addEventListener('pointercancel',e=>{clearTimeout(timer);timer=null;b.classList.remove('active');pointerId=null});b.addEventListener('lostpointercapture',e=>{if(pointerId!==null){clearTimeout(timer);timer=null;b.classList.remove('active');pointerId=null}})})();

window.addEventListener('pagehide',()=>releaseAll());window.addEventListener('pageshow',()=>{if(room&&secret&&!signalingReady())connect()});window.addEventListener('online',()=>{if(room&&secret&&!signalingReady())connect()});window.addEventListener('blur',()=>{if(!chatOpen)releaseAll()});document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseAll();else if(room&&secret&&!signalingReady())connect()});

setupInjectedUI();
applyLayoutStyle(layoutStyle,false);
applyLayout(layoutPreset,false);
bindHoldControl($('rotLeftDock'),'rotateLeft');
bindHoldControl($('rotRightDock'),'rotateRight');
refreshLabels();buildMoreBar();updateTiltStatus();updateFreelookButton();if(mouseSettings.tiltAutoEnable&&localStorage.getItem('pixelb8GamepadTiltEnabled')==='1')setTimeout(()=>enableTilt(),250);if(room&&secret)connect();else setStatus('scan a valid PixelB8 QR invite');
})();
