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
.rotateDock{position:absolute;top:5px;left:4%;right:4%;display:flex;justify-content:space-between;align-items:center;z-index:3;pointer-events:none}.rotateDock .btn{width:72px;height:34px;border-radius:13px;font-size:11px;background:linear-gradient(160deg,#19233f,#10172b);border-color:rgba(116,141,255,.42);pointer-events:auto}body.game-screen-on.mode-gamepad .rotateDock .btn{width:52px;height:28px;border-radius:10px;font-size:8px} .remoteFullscreen.mode-gamepad .rotateDock .btn{width:44px;height:22px;border-radius:8px;font-size:7px}
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
.settingsStack{display:grid;gap:10px}.settingsCard{background:#0a121c;border:1px solid #263b56;border-radius:10px;padding:8px}.settingsCard h3{margin:0 0 8px;font-size:12px;color:#d7e3f5}.profileRow{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px}.profileRow select{min-width:0;height:34px;background:#07101a;color:#fff;border:1px solid #385271;border-radius:8px;padding:4px 8px;font-size:11px}.profileSave{height:34px;padding:0 10px}.profileManage{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:6px}.profileManage .btn{height:30px;font-size:9px}.profileManage .danger{border-color:#653744;color:#ffabb7}.profileManage .btn:disabled{opacity:.35;cursor:default}.profileStatus{margin-top:7px;color:#93aac7;font-size:9px;line-height:1.35}.profileStatus b{color:#dff8ff}.bindGrid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.bindRow{background:#0c1521;border:1px solid #263b56;border-radius:8px;padding:6px}.bindRow label{display:block;color:#aabbd1;font-size:9px;margin-bottom:4px}.bindRow select,.bindRow input{width:100%;height:30px;background:#07101a;color:white;border:1px solid #385271;border-radius:6px;font-size:10px;padding:4px 6px}.optionRow{display:grid;grid-template-columns:1fr auto;gap:8px;align-items:center;margin-top:6px}.optionRow output{font-family:Consolas,monospace;font-size:11px;color:#dce9fa}.checkRow{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:11px;color:#dce9fa}
#moreOverlay{display:none!important}
@media (orientation:portrait){body:before{content:'Rotate phone sideways';position:fixed;z-index:99;inset:0;display:grid;place-items:center;background:#05080d;color:white;font-weight:900;font-size:20px}.gamepad{visibility:hidden}}
@media (max-height:380px){.gamepad{grid-template-rows:30px auto minmax(0,1fr) 40px}.moreBar.open{max-height:52px}.moreChip{height:38px}.hotbar .btn{font-size:10px}}

.modeBtn{font-size:13px}.modeBtn.active{border-color:rgba(103,236,173,.72);background:linear-gradient(150deg,#214b3c,#10281f);box-shadow:0 0 14px rgba(103,236,173,.12)}
.desktopStage{display:none;grid-row:3/5;min-height:0;grid-template-columns:minmax(230px,.82fr) minmax(0,1.7fr);gap:6px}
body.mode-desktop .stage,body.mode-desktop .hotbar{display:none}
body.mode-desktop .desktopStage{display:grid}
.desktopTouchCard,.desktopKeys{min-width:0;min-height:0;border:1px solid var(--line);border-radius:20px;background:linear-gradient(145deg,rgba(17,30,48,.92),rgba(7,13,22,.92));box-shadow:inset 0 1px rgba(255,255,255,.04),0 14px 34px rgba(0,0,0,.22);padding:7px}
.desktopTouchCard{display:grid;grid-template-rows:minmax(0,1fr) 48px;gap:6px;order:2}.desktopTouchpad{position:relative;min-height:0;border:1px solid rgba(102,225,255,.38);border-radius:17px;overflow:hidden;touch-action:none;background:radial-gradient(circle at 50% 35%,rgba(27,81,104,.22),transparent 42%),linear-gradient(145deg,#08131f,#07101a);box-shadow:inset 0 0 34px rgba(71,190,235,.05)}
.desktopTouchpad:after{content:'';position:absolute;inset:12px;border:1px dashed rgba(120,181,223,.12);border-radius:12px;pointer-events:none}.touchpadHint{position:absolute;inset:0;display:grid;place-content:center;text-align:center;color:#718aa8;pointer-events:none}.touchpadHint b{font-size:15px;letter-spacing:.15em;color:#a8c4df}.touchpadHint span{margin-top:6px;font-size:9px}
.desktopMirror{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#020407;pointer-events:none;display:none}.desktopTouchpad.mirroring .desktopMirror{display:block}.desktopTouchpad.mirroring .touchpadHint{opacity:0}.mirrorBar{position:absolute;z-index:4;left:7px;right:auto;top:7px;display:grid;grid-template-columns:auto minmax(70px,104px) auto 27px 27px;gap:4px;align-items:center;max-width:calc(100% - 14px);padding:4px 5px;border:1px solid rgba(111,200,238,.28);border-radius:9px;background:rgba(4,10,17,.72);backdrop-filter:blur(8px);pointer-events:auto}.mirrorBar label{font-size:7px;font-weight:900;letter-spacing:.10em;color:#92b6d4;white-space:nowrap}.mirrorBar select{height:25px;min-width:0;max-width:104px;background:#07101a;color:#eef8ff;border:1px solid #385271;border-radius:7px;font-size:8px;padding:1px 3px}.mirrorBar span{font-size:7px;color:#82a2bd;white-space:nowrap}.mirrorBar .mirrorFullscreen,.mirrorBar .mirrorAudio{width:27px!important;min-width:27px!important;height:25px!important;padding:0!important;font-size:12px!important}.mirrorAudio.active{border-color:rgba(103,236,173,.7)!important;background:linear-gradient(#245443,#102a21)!important}.desktopMouseButtons{display:grid;grid-template-columns:1fr .8fr 1fr;gap:6px}.desktopMouseButtons .btn{font-size:11px}.desktopKeys{display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;gap:6px;order:1}.desktopKeysToolbar{display:none;grid-template-columns:1fr 1fr;gap:3px}.desktopKeysToolbar .iconbtn{height:26px;min-width:0;padding:0;font-size:11px}.desktopUpperControls{display:grid;gap:6px}.desktopKeyGroup{display:grid;gap:6px}.desktopSystemKeys{grid-template-columns:1.4fr repeat(4,1fr)}.desktopModifiers{grid-template-columns:repeat(4,1fr)}.desktopKey{min-height:42px}.desktopKey.accent{border-color:rgba(103,236,173,.55);background:linear-gradient(150deg,#205246,#102920)}.desktopModifier.latched{border-color:#ffd879!important;background:linear-gradient(150deg,#7b6328,#3f3217)!important;color:#fff2b8!important}.desktopArrowPad{align-self:center;justify-self:center;width:min(190px,100%);display:grid;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(2,50px);gap:6px}.desktopArrowPad .btn{font-size:17px}.desktopAllUp{min-height:42px}
@media (max-width:650px),(max-height:340px){.desktopStage{grid-template-columns:minmax(178px,.9fr) minmax(0,1.6fr);gap:4px}.desktopTouchCard,.desktopKeys{padding:5px;border-radius:14px}.desktopTouchCard{grid-template-rows:minmax(0,1fr) 42px}.desktopSystemKeys{grid-template-columns:1.35fr repeat(4,1fr);gap:4px}.desktopModifiers{gap:4px}.desktopKey{min-height:34px;font-size:8px}.desktopArrowPad{grid-template-rows:repeat(2,38px);gap:4px}.desktopMouseButtons{gap:4px}.touchpadHint b{font-size:12px}.touchpadHint span{font-size:7px}}
/* Tiny landscape phones (including iPhone 4S): make Settings a true narrow-screen page. */
@media (max-width:600px), (max-height:340px){
  .overlay{padding:0;align-items:stretch;justify-content:stretch}
  .sheet{width:100vw;max-width:none;height:100vh;max-height:none;border-radius:0;border-left:0;border-right:0;padding:8px;overflow-x:hidden;overflow-y:auto}
  .sheetHead{top:-8px;margin:0 -1px;padding:6px 1px 8px}.sheetHead h2{font-size:14px}
  .settingsStack,.settingsCard,.bindRow,.optionRow,.profileRow,.profileManage{min-width:0;max-width:100%}
  .profileRow{grid-template-columns:minmax(0,1fr) auto}.profileRow select{font-size:11px}.profileSave{padding:0 8px;font-size:9px}
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
/* Remote-view / mobile-MMO presentation */
.gameMirrorLayer{display:none;position:fixed;z-index:0;inset:44px 5px 51px;border:1px solid rgba(102,225,255,.26);border-radius:20px;overflow:hidden;background:#020407;pointer-events:none}
.gameMirror{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#020407}
.gameMirrorTop{position:absolute;z-index:8;top:7px;right:7px;display:flex;align-items:center;gap:5px;padding:4px 5px;border:1px solid rgba(111,200,238,.28);border-radius:10px;background:rgba(4,10,17,.58);backdrop-filter:blur(8px);pointer-events:auto}
.gameMirrorLabel{font-size:8px;font-weight:900;letter-spacing:.12em;color:#b9eaff}
.gameScreenDock{display:none;min-width:0;min-height:0;align-items:center;justify-content:stretch;gap:4px;position:relative;z-index:9}.gameScreenDock select{width:100%;min-width:0;height:25px;padding:1px 3px;border:1px solid rgba(111,200,238,.40);border-radius:7px;background:rgba(7,16,26,.88);color:#fff;font-size:8px;font-weight:800}.gameScreenDock .iconbtn{height:25px;min-width:27px;padding:0}body.game-screen-on.mode-gamepad .gameScreenDock select{height:21px;font-size:7px;border-radius:6px}.game-screen-on.mode-gamepad .gameScreenDock .iconbtn,.remoteFullscreen.mode-gamepad .gameScreenDock .iconbtn{height:21px;min-width:24px;font-size:11px}.remoteFullscreen.mode-gamepad .gameScreenDock select{height:19px;font-size:6px;border-radius:5px}
body.game-screen-on.mode-gamepad .gameMirrorLayer{display:block;pointer-events:auto}
body.game-screen-on.mode-gamepad .stage{position:relative;z-index:3;grid-template-columns:minmax(124px,24%) minmax(88px,15%) minmax(124px,24%);justify-content:space-between;align-items:end;background:transparent;pointer-events:none}
body.game-screen-on.mode-gamepad .zone{pointer-events:auto;background:rgba(7,13,22,.34);backdrop-filter:blur(4px);border-color:rgba(126,188,231,.23);box-shadow:0 7px 18px rgba(0,0,0,.12);border-radius:15px}
body.game-screen-on.mode-gamepad .leftZone,body.game-screen-on.mode-gamepad .rightZone{height:min(58vh,186px);padding:4px;gap:3px}
body.game-screen-on.mode-gamepad .stickBase,body.game-screen-on.mode-gamepad .mouseBase{width:min(27vh,112px)!important;height:min(27vh,112px)!important;max-width:82%;max-height:82%;min-width:86px;min-height:86px}
body.game-screen-on.mode-gamepad .leftZone{grid-template-rows:minmax(0,1fr) 34px}
body.game-screen-on.mode-gamepad .leftQuick{gap:3px}.game-screen-on.mode-gamepad .leftQuick .btn{font-size:7px;border-radius:9px;padding:1px 2px}.game-screen-on.mode-gamepad .leftQuick .btn small{font-size:5px;margin-top:1px}
body.game-screen-on.mode-gamepad .leftZone>.miniHold{bottom:40px;height:18px;min-width:38px;font-size:5px;padding:0 4px}
body.game-screen-on.mode-gamepad .rightGrid{grid-template-columns:minmax(0,1fr) 58px;grid-template-rows:minmax(0,1fr) 40px;gap:3px}
body.game-screen-on.mode-gamepad .mouseRail{gap:3px}.game-screen-on.mode-gamepad .mouseRail .btn{font-size:7px;border-radius:9px;padding:1px 2px}.game-screen-on.mode-gamepad .mouseRail .btn small{font-size:5px;margin-top:1px}.game-screen-on.mode-gamepad .railHold{height:19px;font-size:5px;padding:0 4px}
body.game-screen-on.mode-gamepad .rightBottom{gap:3px}.game-screen-on.mode-gamepad .rightBottom .btn{font-size:7px;border-radius:9px;padding:1px 2px}.game-screen-on.mode-gamepad .rightBottom .btn small{font-size:5px;margin-top:1px}
body.game-screen-on.mode-gamepad .gameScreenDock{display:grid;grid-template-columns:minmax(0,1fr) 24px 24px;gap:2px}
body.game-screen-on.mode-gamepad .centerZone{align-self:end;height:auto;max-height:none;padding:3px;gap:2px;background:rgba(7,13,22,.24);grid-template-rows:auto auto;opacity:.9}
body.game-screen-on.mode-gamepad .centerMain{grid-template-columns:repeat(2,1fr);grid-template-rows:30px;gap:2px}
body.game-screen-on.mode-gamepad .centerFoot{height:27px;gap:2px}
body.game-screen-on.mode-gamepad .centerMain .btn,body.game-screen-on.mode-gamepad .centerFoot .btn{font-size:7px;border-radius:8px;padding:1px}.game-screen-on.mode-gamepad .centerMain .btn small{font-size:5px;margin-top:1px}
body.game-screen-on.mode-gamepad .centerMain [data-action="target"],body.game-screen-on.mode-gamepad .centerMain [data-action="sit"],body.game-screen-on.mode-gamepad .centerMain #enter{display:none}
body.game-screen-on.mode-gamepad .leftQuick #shift,body.game-screen-on.mode-gamepad .leftQuick #runHold{opacity:.72}
body.game-screen-on.mode-gamepad .hotbar{position:relative;z-index:4;background:rgba(5,8,13,.40);backdrop-filter:blur(4px);border-radius:10px}
body.game-screen-on.mode-gamepad .moreBar{position:relative;z-index:12;background:rgba(8,14,24,.66)}
.remoteFullscreen .gameMirrorLayer,.remoteFullscreen .desktopTouchpad{position:fixed!important;z-index:90!important;inset:0!important;width:100vw!important;height:100vh!important;border-radius:0!important;border:0!important;background:#000!important}
.remoteFullscreen .gameMirrorTop,.remoteFullscreen .mirrorBar{top:calc(env(safe-area-inset-top) + 8px);right:calc(env(safe-area-inset-right) + 8px);left:auto;width:auto;opacity:.72}
.remoteFullscreen.mode-gamepad .stage{position:fixed!important;z-index:95!important;inset:0!important;padding:calc(env(safe-area-inset-top) + 45px) 8px calc(env(safe-area-inset-bottom) + 8px)!important;grid-template-columns:minmax(112px,24%) minmax(80px,14%) minmax(112px,24%)!important;justify-content:space-between!important;align-items:end!important;pointer-events:none}
.remoteFullscreen.mode-gamepad .leftZone{grid-column:1!important;justify-self:start!important}
.remoteFullscreen.mode-gamepad .centerZone{display:grid!important;grid-column:2!important;justify-self:center!important;align-self:end!important;width:min(12vw,88px)!important;height:auto!important;padding:2px!important;gap:2px!important;background:rgba(5,10,17,.12)!important;border-color:rgba(137,212,244,.12)!important;opacity:.78}
.remoteFullscreen.mode-gamepad .rightZone{grid-column:3!important;justify-self:end!important}
.remoteFullscreen.mode-gamepad .leftZone,.remoteFullscreen.mode-gamepad .rightZone{align-self:end;height:min(34vh,142px);padding:3px!important;gap:2px!important;background:rgba(5,10,17,.12);border-color:rgba(137,212,244,.12);backdrop-filter:blur(3px);opacity:.76}
.remoteFullscreen.mode-gamepad .stickBase,.remoteFullscreen.mode-gamepad .mouseBase{width:min(21vh,92px)!important;height:min(21vh,92px)!important;min-width:72px;min-height:72px}
.remoteFullscreen.mode-gamepad .gameScreenDock{display:grid!important}
.remoteFullscreen.mode-gamepad .centerMain{grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:22px!important;gap:2px!important}
.remoteFullscreen.mode-gamepad .centerFoot{height:22px!important;gap:2px!important}
.remoteFullscreen.mode-gamepad .centerMain .btn,.remoteFullscreen.mode-gamepad .centerFoot .btn{font-size:5px!important;border-radius:6px!important;padding:1px!important;opacity:.84}.remoteFullscreen.mode-gamepad .centerMain .btn small{font-size:4px!important;margin-top:0}
.remoteFullscreen.mode-gamepad .hotbar,.remoteFullscreen.mode-gamepad .topbar{display:none!important}
.remoteFullscreen.mode-gamepad .moreBar{position:fixed!important;z-index:110!important;left:18%!important;right:18%!important;bottom:calc(env(safe-area-inset-bottom) + 8px)!important;margin:0!important;background:rgba(6,12,20,.82)!important;backdrop-filter:blur(12px)!important}
.remoteFullscreen.mode-gamepad .moreBar.open{max-height:64px!important}
.remoteFullscreen.mode-desktop .desktopStage{display:block!important;position:fixed!important;z-index:91!important;inset:0!important;pointer-events:none!important}
.remoteFullscreen.mode-desktop .desktopTouchCard{position:static!important;border:0!important;background:transparent!important;box-shadow:none!important;padding:0!important}
.remoteFullscreen.mode-desktop .desktopTouchpad{display:block!important;pointer-events:auto!important}
.remoteFullscreen.mode-desktop .desktopMirror{display:block!important}
.remoteFullscreen.mode-desktop .mirrorBar{z-index:99;opacity:.68;grid-template-columns:auto minmax(62px,88px) auto 25px 25px!important;padding:3px 4px!important;gap:3px!important}.remoteFullscreen.mode-desktop .mirrorBar select{max-width:88px;height:23px;font-size:7px}.remoteFullscreen.mode-desktop .mirrorBar .mirrorFullscreen,.remoteFullscreen.mode-desktop .mirrorBar .mirrorAudio{width:25px!important;min-width:25px!important;height:23px!important;padding:0!important}
.remoteFullscreen.mode-desktop .desktopTouchpad:after{display:none}
.remoteFullscreen.mode-desktop .desktopKeys{display:grid!important;position:fixed!important;z-index:98!important;left:calc(env(safe-area-inset-left) + 6px)!important;top:auto!important;bottom:calc(env(safe-area-inset-bottom) + 6px)!important;width:min(28vw,176px)!important;padding:4px!important;gap:3px!important;border-radius:12px!important;background:rgba(5,10,17,.25)!important;backdrop-filter:blur(4px)!important;border-color:rgba(137,212,244,.14)!important;pointer-events:auto!important;opacity:.86}
.remoteFullscreen.mode-desktop .desktopKeysToolbar{display:grid!important}
.remoteFullscreen.mode-desktop .desktopUpperControls{display:grid;gap:3px!important}
.remoteFullscreen.mode-desktop .desktopKeys.desktop-upper-collapsed .desktopUpperControls{display:none!important}
.remoteFullscreen.mode-desktop .desktopKeys.desktop-panel-collapsed{width:34px!important;padding:3px!important;background:rgba(5,10,17,.16)!important}
.remoteFullscreen.mode-desktop .desktopKeys.desktop-panel-collapsed .desktopUpperControls,.remoteFullscreen.mode-desktop .desktopKeys.desktop-panel-collapsed .desktopArrowPad,.remoteFullscreen.mode-desktop .desktopKeys.desktop-panel-collapsed .desktopAllUp{display:none!important}
.remoteFullscreen.mode-desktop .desktopKeys.desktop-panel-collapsed .desktopKeysToolbar{grid-template-columns:1fr!important}
.remoteFullscreen.mode-desktop .desktopKeys.desktop-panel-collapsed .desktopUpperToggle{display:none!important}
.remoteFullscreen.mode-desktop .desktopSystemKeys{grid-template-columns:1.35fr repeat(2,1fr)!important;gap:3px!important}
.remoteFullscreen.mode-desktop .desktopSystemKeys .desktopKey{min-height:26px!important;font-size:6px!important;border-radius:7px!important;padding:1px!important;opacity:.88}
.remoteFullscreen.mode-desktop .desktopSystemKeys .desktopKey small{font-size:4px!important}
.remoteFullscreen.mode-desktop .desktopModifiers{grid-template-columns:repeat(4,1fr)!important;gap:2px!important}
.remoteFullscreen.mode-desktop .desktopModifiers .desktopModifier{min-height:24px!important;font-size:6px!important;border-radius:7px!important;padding:1px!important;opacity:.88}
.remoteFullscreen.mode-desktop .desktopArrowPad{width:min(100px,100%)!important;grid-template-rows:repeat(2,28px)!important;gap:2px!important}
.remoteFullscreen.mode-desktop .desktopArrowPad .btn{font-size:11px!important;border-radius:7px!important;opacity:.88}
.remoteFullscreen.mode-desktop .desktopAllUp{min-height:26px!important;font-size:6px!important;border-radius:7px!important;padding:1px!important;opacity:.88}
.remoteFullscreen.mode-desktop .desktopMouseButtons{display:grid!important;position:fixed!important;z-index:98!important;right:calc(env(safe-area-inset-right) + 6px)!important;bottom:calc(env(safe-area-inset-bottom) + 6px)!important;width:min(25vw,170px)!important;grid-template-columns:1fr .8fr 1fr!important;gap:3px!important;padding:3px!important;border:1px solid rgba(137,212,244,.14)!important;border-radius:10px!important;background:rgba(5,10,17,.24)!important;backdrop-filter:blur(4px)!important;pointer-events:auto!important;opacity:.84}
.remoteFullscreen.mode-desktop .desktopMouseButtons .btn{min-height:27px!important;font-size:6px!important;border-radius:7px!important;padding:1px!important}
.remoteFullscreen.mode-desktop .desktopMouseButtons .btn small{font-size:5px!important}
@media(max-width:650px),(max-height:340px){body.game-screen-on.mode-gamepad .stage{grid-template-columns:minmax(112px,27%) minmax(80px,15%) minmax(112px,27%)}body.game-screen-on.mode-gamepad .leftZone,body.game-screen-on.mode-gamepad .rightZone{height:min(54vh,160px)}body.game-screen-on.mode-gamepad .stickBase,body.game-screen-on.mode-gamepad .mouseBase{width:min(24vh,98px)!important;height:min(24vh,98px)!important;min-width:78px;min-height:78px}body.game-screen-on.mode-gamepad .rightGrid{grid-template-columns:minmax(0,1fr) 54px;grid-template-rows:minmax(0,1fr) 38px;gap:3px}.gameMirrorLayer{inset:44px 5px 48px}.gameMirrorTop{top:5px;right:5px}.gameMirrorLabel{display:none}}

/* Touch Layout Studio */
body.touch-layout-custom .stage{position:relative;overflow:visible}
body.touch-layout-custom.mode-gamepad .zone{overflow:visible;background:transparent;border-color:transparent;box-shadow:none;backdrop-filter:none}
body.touch-layout-custom.mode-gamepad .zone:after{display:none}
body.touch-layout-custom.mode-gamepad .centerZone{background:transparent!important;border-color:transparent!important;box-shadow:none!important}
body.touch-layout-custom.mode-gamepad .leftQuick,body.touch-layout-custom.mode-gamepad .rightBottom,body.touch-layout-custom.mode-gamepad .mouseRail,body.touch-layout-custom.mode-gamepad .centerMain,body.touch-layout-custom.mode-gamepad .centerFoot{position:relative;z-index:4}
.touchLayoutCard .btn{width:100%;height:36px}
.touchLayoutEditor{position:fixed;inset:0;z-index:300;display:none;background:rgba(2,5,10,.28);touch-action:none}
.touchLayoutEditor.open{display:block}
.touchLayoutEditor .tleTop{position:absolute;left:7px;right:7px;top:calc(env(safe-area-inset-top) + 7px);display:flex;align-items:center;gap:5px;padding:5px;border:1px solid rgba(112,188,236,.35);border-radius:12px;background:rgba(6,13,23,.90);backdrop-filter:blur(14px);pointer-events:auto}
.touchLayoutEditor .tleTitle{font-size:9px;font-weight:950;letter-spacing:.08em;color:#dff8ff;white-space:nowrap}
.touchLayoutEditor .tleContext{display:flex;gap:3px;flex:1}.touchLayoutEditor .tleContext button{height:27px;min-width:0;flex:1;font-size:7px;border-radius:8px}
.touchLayoutEditor .tleDone{height:27px;min-width:45px}
.touchLayoutEditor .tlePanel{position:absolute;z-index:2;left:50%;bottom:calc(env(safe-area-inset-bottom) + 6px);transform:translateX(-50%);width:min(94vw,620px);padding:6px;border:1px solid rgba(112,188,236,.35);border-radius:13px;background:rgba(6,13,23,.91);backdrop-filter:blur(14px);pointer-events:auto;display:grid;gap:5px}
.touchLayoutEditor .tleRow{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:6px;align-items:center}.touchLayoutEditor .tleRow label{font-size:7px;color:#a9bdd5;white-space:nowrap}.touchLayoutEditor select{height:28px;min-width:0;border:1px solid #385271;border-radius:7px;background:#07101a;color:#fff;font-size:8px;padding:2px 5px}.touchLayoutEditor input[type=range]{width:100%;min-width:0}.touchLayoutEditor output{font:700 7px Consolas,monospace;color:#dff7ff;min-width:35px;text-align:right}.touchLayoutEditor .tleTools{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}.touchLayoutEditor .tleTools .btn{height:27px;font-size:7px;border-radius:8px}.touchLayoutEditor .tleColor{display:grid;grid-template-columns:repeat(4,1fr);gap:4px}.touchLayoutEditor .tleColor .tleMini{display:grid;grid-template-columns:auto 1fr;gap:3px;align-items:center}.touchLayoutEditor .tleMini span{font-size:6px;color:#9fb5cf}.touchLayoutEditor .tleHint{font-size:6px;color:#8198b4;text-align:center;line-height:1.3}.touchLayoutEditor .tleEnabled{display:flex;align-items:center;gap:4px;font-size:7px;color:#dce9fa}.touchLayoutEditor .tleContext .active{border-color:#75e4ff;background:linear-gradient(150deg,#244a60,#122b39)}
body.layout-editing .stage,body.layout-editing .hotbar{outline:1px dashed rgba(102,220,255,.18);outline-offset:-2px}
body.layout-editing [data-touch-control]{outline:1px dashed rgba(102,220,255,.28)!important;outline-offset:2px!important}
body.layout-editing [data-touch-selected=true]{outline:2px solid rgba(255,215,113,.88)!important;outline-offset:3px!important;filter:drop-shadow(0 0 7px rgba(255,215,113,.22))}
.customDpad{position:absolute;z-index:16;width:118px;height:118px;display:none;grid-template-columns:repeat(3,1fr);grid-template-rows:repeat(3,1fr);gap:3px;left:42%;bottom:14%;pointer-events:auto}.customDpad button{border-radius:10px;font-size:12px}.customDpad .up{grid-column:2}.customDpad .left{grid-column:1;grid-row:2}.customDpad .down{grid-column:2;grid-row:3}.customDpad .right{grid-column:3;grid-row:2}.customDpad .padCore{grid-column:2;grid-row:2;border-radius:50%;border:1px solid rgba(110,153,209,.24);background:rgba(8,16,27,.46);pointer-events:none}
body.touch-layout-custom .touchTint{background:rgba(var(--touch-r,18),var(--touch-g,38),var(--touch-b,58),var(--touch-a,.72))!important}
@media(max-height:360px){.touchLayoutEditor .tlePanel{width:min(96vw,690px);grid-template-columns:1.1fr 1fr;gap:4px}.touchLayoutEditor .tleTools{grid-column:1/-1}.touchLayoutEditor .tleHint{display:none}}

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
let controlMode=localStorage.getItem('pixelb8GamepadControlMode')==='desktop'?'desktop':'gamepad';
let mirrorMode=localStorage.getItem('pixelb8DesktopMirrorMode')||'off';
if(!['off','low','30','60','auto'].includes(mirrorMode))mirrorMode='off';
let mirrorAudioEnabled=localStorage.getItem('pixelb8ScreenAudio')!=='0';

const TOUCH_LAYOUT_KEY='pixelb8GamepadTouchLayoutsV1';
const TOUCH_CONTEXTS=['normal','screen','fullscreen'];
const TOUCH_CONTROLS={
  wasdStick:{label:'WASD joystick',selector:'#stickZone'},rotateLeft:{label:'Q / rotate left',selector:'#rotLeftDock'},rotateRight:{label:'E / rotate right',selector:'#rotRightDock'},
  lmb:{label:'LMB',selector:'#leftClickBtn'},shift:{label:'Shift',selector:'#shift'},run:{label:'Run / Walk',selector:'#runHold'},holdL:{label:'Hold L',selector:'#leftHoldBtn'},
  mouseStick:{label:'Mouse / camera joystick',selector:'#mouseZone'},jump:{label:'Jump',selector:'[data-action="jump"]'},rmb:{label:'RMB',selector:'#rightClickBtn'},holdR:{label:'Hold R',selector:'#rightHoldBtn'},tilt:{label:'Tilt',selector:'#tiltBtn'},center:{label:'Center / freelook',selector:'#cameraCenterBtn'},screenDock:{label:'Screen / FPS / audio',selector:'.gameScreenDock'},
  action:{label:'Action',selector:'[data-action="action"]'},use:{label:'Use',selector:'[data-action="interact"]'},allUp:{label:'All Up',selector:'#release'},more:{label:'More',selector:'#more'},hotbar:{label:'1–0 hotbar',selector:'#hotbar'},
  moveDpad:{label:'Movement D-pad',selector:'#customMoveDpad',optional:true},arrowPad:{label:'Arrow-key pad',selector:'#customArrowPad',optional:true}
};
function blankTouchControl(enabled=true){return{x:0,y:0,scale:1,opacity:1,enabled,r:18,g:38,b:58,a:0}}
function defaultTouchLayouts(){const out={};for(const ctx of TOUCH_CONTEXTS){out[ctx]={};for(const [id,def] of Object.entries(TOUCH_CONTROLS))out[ctx][id]=blankTouchControl(!def.optional)}return out}
function loadTouchLayouts(){try{const raw=JSON.parse(localStorage.getItem(TOUCH_LAYOUT_KEY)||'null'),base=defaultTouchLayouts();if(raw&&typeof raw==='object')for(const ctx of TOUCH_CONTEXTS)for(const id of Object.keys(TOUCH_CONTROLS))base[ctx][id]={...base[ctx][id],...(raw?.[ctx]?.[id]||{})};return base}catch{return defaultTouchLayouts()}}
let touchLayouts=loadTouchLayouts(),touchLayoutEditing=false,touchEditContext='normal',touchSelected='wasdStick';
function saveTouchLayouts(){localStorage.setItem(TOUCH_LAYOUT_KEY,JSON.stringify(touchLayouts));if(isCustomProfileId?.(activeProfile))saveActiveCustom?.()}
function currentTouchContext(){return document.body.classList.contains('remoteFullscreen')?'fullscreen':(document.body.classList.contains('game-screen-on')?'screen':'normal')}


const KEY_OPTIONS = [
  'NONE','0','1','2','3','4','5','6','7','8','9',
  'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z',
  'SPACE','ENTER','TAB','ESC','BACKSPACE','CAPSLOCK','SHIFT','CTRL','ALT','WIN',
  'UP','DOWN','LEFT','RIGHT','HOME','END','PAGEUP','PAGEDOWN','INSERT','DELETE',
  'F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12',
  'GRAVE','MINUS','EQUALS','LBRACKET','RBRACKET','BACKSLASH','SEMICOLON','APOSTROPHE','COMMA','PERIOD','SLASH',
  'NUM0','NUM1','NUM2','NUM3','NUM4','NUM5','NUM6','NUM7','NUM8','NUM9','NUMPLUS','NUMMINUS','NUMMULTIPLY','NUMDIVIDE','NUMDECIMAL','NUMENTER'
];
const KEY_DISPLAY = {
  NONE:'Off',SPACE:'Space',ENTER:'Enter',TAB:'Tab',ESC:'Esc',BACKSPACE:'Backspace',CAPSLOCK:'Caps Lock',SHIFT:'Shift',CTRL:'Ctrl',ALT:'Alt',WIN:'Win',
  UP:'↑ Up',DOWN:'↓ Down',LEFT:'← Left',RIGHT:'→ Right',HOME:'Home',END:'End',PAGEUP:'Page Up',PAGEDOWN:'Page Down',INSERT:'Insert',DELETE:'Delete',
  GRAVE:'` / ~',MINUS:'- / _',EQUALS:'= / +',LBRACKET:'[ / {',RBRACKET:'] / }',BACKSLASH:'\\ / |',SEMICOLON:'; / :',APOSTROPHE:"' / \"",COMMA:', / <',PERIOD:'. / >',SLASH:'/ / ?',
  NUM0:'Numpad 0',NUM1:'Numpad 1',NUM2:'Numpad 2',NUM3:'Numpad 3',NUM4:'Numpad 4',NUM5:'Numpad 5',NUM6:'Numpad 6',NUM7:'Numpad 7',NUM8:'Numpad 8',NUM9:'Numpad 9',NUMPLUS:'Numpad +',NUMMINUS:'Numpad -',NUMMULTIPLY:'Numpad *',NUMDIVIDE:'Numpad /',NUMDECIMAL:'Numpad .',NUMENTER:'Numpad Enter'
};
const DEFAULT_BINDINGS = {moveUp:'W',moveDown:'S',moveLeft:'A',moveRight:'D',jump:'SPACE',sit:'X',modifier:'SHIFT',enter:'ENTER',action:'F',interact:'3',target:'TAB',rotateLeft:'Q',rotateRight:'E',run:'BACKSLASH',inventory:'I',revive:'T',hotbar1:'1',hotbar2:'2',hotbar3:'3',hotbar4:'4',hotbar5:'5',hotbar6:'6',hotbar7:'7',hotbar8:'8',hotbar9:'9',hotbar0:'0'};
const LABELS = {moveUp:'Joystick Up',moveDown:'Joystick Down',moveLeft:'Joystick Left',moveRight:'Joystick Right',jump:'Jump',sit:'Sit',modifier:'Shift modifier',enter:'Chat / Enter',action:'Action',interact:'Interact / Use',target:'Target',rotateLeft:'Rotate left',rotateRight:'Rotate right',run:'Run / Walk toggle',inventory:'Inventory',revive:'Revive / Teleport',hotbar1:'Hotbar 1',hotbar2:'Hotbar 2',hotbar3:'Hotbar 3',hotbar4:'Hotbar 4',hotbar5:'Hotbar 5',hotbar6:'Hotbar 6',hotbar7:'Hotbar 7',hotbar8:'Hotbar 8',hotbar9:'Hotbar 9',hotbar0:'Hotbar 0'};
const TOP_MORE = [['inventory','INV'],['revive','REVIVE'],['run','RUN'],['interact','USE'],['target','TAB'],['action','ACT']];

const PROFILE_DEFS = {
  genericWASD:{name:'Generic WASD',description:'General WASD setup with Q/E utility buttons, Space jump, Shift sprint, F action, and Tab target.',layoutStyle:'classic',bindings:{...DEFAULT_BINDINGS,sit:'C',action:'F',interact:'R',target:'TAB',rotateLeft:'Q',rotateRight:'E',run:'SHIFT',inventory:'I',revive:'G'},captions:{sit:'CROUCH',action:'ACTION',interact:'UTILITY',target:'TARGET',run:'SPRINT',inventory:'INV',revive:'EXTRA'},bindingLabels:{rotateLeft:'Q utility',rotateRight:'E utility',run:'Sprint',revive:'Extra action'}},
  genericFPS:{name:'Generic FPS',description:'FPS setup with Q/E abilities, R reload, F use, C crouch, Shift sprint, G grenade, and 1–0 weapons.',layoutStyle:'twinstick',bindings:{...DEFAULT_BINDINGS,sit:'C',action:'R',interact:'F',target:'TAB',rotateLeft:'Q',rotateRight:'E',run:'SHIFT',inventory:'I',revive:'G'},captions:{sit:'CROUCH',action:'RELOAD',interact:'USE',target:'SCORE',run:'SPRINT',inventory:'INV',revive:'GRENADE'},bindingLabels:{action:'Reload',interact:'Use',target:'Scoreboard',rotateLeft:'Q ability',rotateRight:'E ability',run:'Sprint',revive:'Grenade / extra'}},
  entropia:{name:'Entropia Universe',description:'PixelB8 Entropia setup: Action F, Use 3, Q/E rotate, backslash Run/Walk, Tab target, and 1–0 hotbar.',layoutStyle:'classic',bindings:{...DEFAULT_BINDINGS},captions:{sit:'SIT',action:'ACTION',interact:'USE',target:'TARGET',run:'RUN/WALK',inventory:'INV',revive:'REVIVE'},bindingLabels:{rotateLeft:'Rotate left',rotateRight:'Rotate right',run:'Run / Walk toggle',revive:'Revive / Teleport'}},
  wow:{name:'World of Warcraft',description:'MMO setup with Q/E utility keys, Tab target, 1–0 action bar, Space jump, F interact, and B bags.',layoutStyle:'classic',bindings:{...DEFAULT_BINDINGS,sit:'X',action:'1',interact:'F',target:'TAB',rotateLeft:'Q',rotateRight:'E',run:'NONE',inventory:'B',revive:'NONE'},captions:{sit:'SIT',action:'ACTION 1',interact:'INTERACT',target:'TARGET',run:'AUTO RUN',inventory:'BAGS',revive:'EXTRA'},bindingLabels:{action:'Primary action',interact:'Interact',target:'Target nearest',rotateLeft:'Q utility',rotateRight:'E utility',run:'Auto run',inventory:'Bags',revive:'Extra action'}},
  minecraft:{name:'Minecraft',description:'Minecraft setup with Shift sneak, Ctrl sprint, Q drop, E inventory, F swap hand, F5 perspective, and 1–9 hotbar.',layoutStyle:'classic',bindings:{...DEFAULT_BINDINGS,sit:'SHIFT',modifier:'NONE',action:'Q',interact:'NONE',target:'NONE',rotateLeft:'F5',rotateRight:'F',run:'CTRL',inventory:'E',revive:'NONE'},captions:{sit:'SNEAK',action:'DROP',interact:'USE',target:'TARGET',run:'SPRINT',inventory:'INV',revive:'EXTRA'},bindingLabels:{sit:'Sneak',action:'Drop item',interact:'Use key',target:'Target key',rotateLeft:'Perspective',rotateRight:'Swap hand',run:'Sprint',inventory:'Inventory',revive:'Extra action'}},
  custom:{name:'Custom',description:'Your own saved layout, bindings, and mouse/camera settings.',layoutStyle:null,bindings:null,captions:null,bindingLabels:null}
};
const PROFILE_KEY='pixelb8GamepadProfile';
const CUSTOM_PROFILE_KEY='pixelb8GamepadCustomProfile';
const CUSTOM_PROFILES_KEY='pixelb8GamepadCustomProfiles';
let bindings = loadBindings(), mouseSettings = loadMouseSettings();
function sameBindings(a,b){return Object.keys(DEFAULT_BINDINGS).every(k=>(a?.[k]||'NONE')===(b?.[k]||'NONE'))}
function profileSnapshot(){return {bindings:{...bindings},layoutStyle,mouseSettings:{...mouseSettings},touchLayouts:JSON.parse(JSON.stringify(touchLayouts))}}
function loadCustomProfiles(){try{const value=JSON.parse(localStorage.getItem(CUSTOM_PROFILES_KEY)||'[]');return Array.isArray(value)?value.filter(p=>p&&typeof p.id==='string'&&typeof p.name==='string'&&p.snapshot):[]}catch{return []}}
function saveCustomProfiles(){localStorage.setItem(CUSTOM_PROFILES_KEY,JSON.stringify(customProfiles))}
function isCustomProfileId(id){return typeof id==='string'&&id.startsWith('custom:')}
function customProfile(id){return customProfiles.find(p=>p.id===id)||null}
function uniqueCustomName(base,excludeId=null){let name=(base||'Custom').trim().slice(0,32)||'Custom';const used=n=>customProfiles.some(p=>p.id!==excludeId&&p.name.toLowerCase()===n.toLowerCase());if(!used(name))return name;let n=2;while(used(`${name} ${n}`))n++;return `${name} ${n}`.slice(0,32)}
function createCustomProfile(name,snapshot=profileSnapshot(),baseProfileId=null){const inheritedBase=baseProfileId||(isCustomProfileId(activeProfile)?customProfile(activeProfile)?.baseProfileId:activeProfile);const item={id:`custom:${cryptoRandom(8)}`,name:uniqueCustomName(name),baseProfileId:PROFILE_DEFS[inheritedBase]&&inheritedBase!=='custom'?inheritedBase:null,snapshot:JSON.parse(JSON.stringify(snapshot))};customProfiles.push(item);saveCustomProfiles();return item}
let customProfiles=loadCustomProfiles();
if(!customProfiles.length){try{const legacy=JSON.parse(localStorage.getItem(CUSTOM_PROFILE_KEY)||'null');if(legacy?.bindings)customProfiles.push({id:`custom:${cryptoRandom(8)}`,name:'Custom',baseProfileId:null,snapshot:legacy})}catch{}if(customProfiles.length)saveCustomProfiles()}
let activeProfile=localStorage.getItem(PROFILE_KEY) || (sameBindings(bindings,DEFAULT_BINDINGS)?'entropia':'custom');
if(activeProfile==='custom'){
  let first=customProfiles[0];if(!first)first=createCustomProfile('Custom',profileSnapshot());activeProfile=first.id;
}
if(!PROFILE_DEFS[activeProfile]&&!customProfile(activeProfile))activeProfile=sameBindings(bindings,DEFAULT_BINDINGS)?'entropia':(customProfiles[0]?.id||createCustomProfile('Custom',profileSnapshot()).id);
localStorage.setItem(PROFILE_KEY,activeProfile);


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
function loadMouseSettings(){try{const s=JSON.parse(localStorage.getItem('pixelb8GamepadMouseSettings')||'{}');return {sensitivity:clamp(Number(s.sensitivity)||18,4,36),touchpadSensitivity:clamp(Number(s.touchpadSensitivity)||1.35,.5,3),tiltSensitivity:clamp(Number(s.tiltSensitivity)||12,2,30),horizontalOnly:!!s.horizontalOnly,invertX:!!s.invertX,invertY:!!s.invertY,tiltAutoEnable:!!s.tiltAutoEnable}}catch{return {sensitivity:18,touchpadSensitivity:1.35,tiltSensitivity:12,horizontalOnly:false,invertX:false,invertY:false,tiltAutoEnable:false}}}
function saveMouseSettings(){localStorage.setItem('pixelb8GamepadMouseSettings',JSON.stringify(mouseSettings))}
function currentProfile(){
  if(isCustomProfileId(activeProfile)){const c=customProfile(activeProfile),base=PROFILE_DEFS[c?.baseProfileId]||PROFILE_DEFS.custom;return {...base,name:c?.name||'Custom',description:c?.baseProfileId?`Custom copy of ${base.name}.`:'Saved custom controller profile.'}}
  return PROFILE_DEFS[activeProfile]||PROFILE_DEFS.custom
}
function captionFor(action,fallback){return currentProfile().captions?.[action]||fallback}
function bindingLabelFor(action){return currentProfile().bindingLabels?.[action]||LABELS[action]||action}
function setButtonCaption(el,text){if(!el)return;const node=[...el.childNodes].find(n=>n.nodeType===Node.TEXT_NODE);if(node)node.nodeValue=text;else el.prepend(document.createTextNode(text))}
function populateProfileSelect(){
  const select=$('profileSelect');if(!select)return;
  select.innerHTML='';
  const built=document.createElement('optgroup');built.label='Presets';
  for(const [id,p] of Object.entries(PROFILE_DEFS)){if(id==='custom')continue;const o=document.createElement('option');o.value=id;o.textContent=p.name;o.selected=id===activeProfile;built.appendChild(o)}
  select.appendChild(built);
  if(customProfiles.length){const custom=document.createElement('optgroup');custom.label='My profiles';for(const p of customProfiles){const o=document.createElement('option');o.value=p.id;o.textContent=p.name;o.selected=p.id===activeProfile;custom.appendChild(o)}select.appendChild(custom)}
  select.value=activeProfile;select.onchange=()=>applyProfile(select.value);
}
function updateProfileUi(){
  const select=$('profileSelect'),status=$('profileStatus');if(select)select.value=activeProfile;
  const p=currentProfile();if(status)status.innerHTML=`<b>${p.name}</b> · ${p.description}`;
  const custom=isCustomProfileId(activeProfile);const rename=$('renameProfile'),del=$('deleteProfile'),save=$('saveCustomProfile');if(rename)rename.disabled=!custom;if(del)del.disabled=!custom;if(save)save.textContent=custom?'SAVE CHANGES':'SAVE COPY';
}
function announceProfile(){try{rawPublish({type:'hello'})}catch{}}
function saveActiveCustom(){const p=customProfile(activeProfile);if(!p)return false;p.snapshot=profileSnapshot();saveCustomProfiles();return true}
function markCustomProfile(){
  if(!isCustomProfileId(activeProfile)){const baseName=`${currentProfile().name} Custom`;const item=createCustomProfile(baseName,profileSnapshot());activeProfile=item.id;localStorage.setItem(PROFILE_KEY,activeProfile);populateProfileSelect()}else saveActiveCustom();
  updateProfileUi();announceProfile();
}
function applyProfile(id){
  releaseAll();
  const custom=customProfile(id),p=PROFILE_DEFS[id];if(!custom&&!p)return;
  if(custom){const saved=custom.snapshot||{};if(saved.bindings)bindings={...DEFAULT_BINDINGS,...saved.bindings};if(saved.layoutStyle)applyLayoutStyle(saved.layoutStyle,true);if(saved.mouseSettings)mouseSettings={...loadMouseSettings(),...saved.mouseSettings};if(saved.touchLayouts){const base=defaultTouchLayouts();for(const ctx of TOUCH_CONTEXTS)for(const id of Object.keys(TOUCH_CONTROLS))base[ctx][id]={...base[ctx][id],...(saved.touchLayouts?.[ctx]?.[id]||{})};touchLayouts=base;saveTouchLayouts();applyTouchLayout()}}
  else{bindings={...DEFAULT_BINDINGS,...p.bindings};applyLayoutStyle(p.layoutStyle||'classic',true);mouseSettings={sensitivity:18,touchpadSensitivity:1.35,tiltSensitivity:12,horizontalOnly:false,invertX:false,invertY:false,tiltAutoEnable:false}}
  saveBindings();saveMouseSettings();activeProfile=id;localStorage.setItem(PROFILE_KEY,id);buildSettings();refreshLabels();announceProfile();showControlToast(`${currentProfile().name.toUpperCase()} PROFILE LOADED`);
}
function duplicateProfile(){const item=createCustomProfile(`${currentProfile().name} Copy`,profileSnapshot());activeProfile=item.id;localStorage.setItem(PROFILE_KEY,activeProfile);buildSettings();announceProfile();showControlToast('PROFILE DUPLICATED')}
function saveProfileFromUi(){if(isCustomProfileId(activeProfile)){saveActiveCustom();showControlToast('PROFILE SAVED')}else{const item=createCustomProfile(`${currentProfile().name} Custom`,profileSnapshot());activeProfile=item.id;localStorage.setItem(PROFILE_KEY,activeProfile);buildSettings();announceProfile();showControlToast('CUSTOM COPY SAVED')}}
function renameProfile(){const item=customProfile(activeProfile);if(!item)return;const next=prompt('Rename controller profile',item.name);if(next===null)return;const clean=next.trim().slice(0,32);if(!clean)return;item.name=uniqueCustomName(clean,item.id);saveCustomProfiles();populateProfileSelect();updateProfileUi();announceProfile();showControlToast('PROFILE RENAMED')}
function deleteProfile(){const item=customProfile(activeProfile);if(!item)return;if(!confirm(`Delete profile “${item.name}”?`))return;customProfiles=customProfiles.filter(p=>p.id!==item.id);saveCustomProfiles();applyProfile('entropia');showControlToast('PROFILE DELETED')}

function envelope(obj){const p=currentProfile();return {...obj,clientId,deviceName,profileId:activeProfile,profileName:p.name,secret,source:'phone-controller',ts:Date.now()}}
function rawPublish(obj){if(!room||!secret||kicked)return;const msg=JSON.stringify(envelope(obj));if(lanReady()){try{lanSocket.send(msg);return}catch{}}if(client?.connected)client.publish(`${base()}/control`,msg,{qos:0})}
function signalDesktop(obj){if(!room||!secret||kicked)return;const msg=JSON.stringify(envelope(obj));if(lanReady()){try{lanSocket.send(msg);return}catch{}}if(client?.connected)client.publish(`${base()}/signal/desktop`,msg,{qos:0})}
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
function releaseAll(localOnly=false){for(const k of [...heldKeys])upKey(k);heldKeys.clear();stickKeys.clear();leftMouseHeld=false;rightMouseHeld=false;middleMouseHeld=false;desktopDragHeld=false;desktopModifierHeld.clear();$('leftHoldBtn')?.classList.remove('latched');$('rightHoldBtn')?.classList.remove('latched');$('desktopDrag')?.classList.remove('latched');document.querySelectorAll('.desktopModifier').forEach(b=>b.classList.remove('latched'));if(!localOnly&&canControl())publish({type:'release-all'});resetStick();resetMouse();setShift(false)}

let desktopDragHeld=false;
const desktopModifierHeld=new Set();
function setControlMode(mode,save=true){
  controlMode=mode==='desktop'?'desktop':'gamepad';
  document.body.classList.toggle('mode-desktop',controlMode==='desktop');
  document.body.classList.toggle('mode-gamepad',controlMode!=='desktop');
  const b=$('modeBtn');if(b){b.textContent=controlMode==='desktop'?'🎮':'🖥';b.title=controlMode==='desktop'?'Switch to Gamepad mode':'Switch to Desktop mode';b.classList.toggle('active',controlMode==='desktop')}
  if(save)localStorage.setItem('pixelb8GamepadControlMode',controlMode);
  if(mirrorMode!=='off'&&signalingReady()&&!rtcReady())setTimeout(()=>startRtc(),120);
  updateRemoteViewUi();
  releaseDesktopModifiers();
  if(desktopDragHeld)setDesktopDrag(false);
  if(save)showControlToast(controlMode==='desktop'?'DESKTOP MODE':'GAMEPAD MODE');
}
function desktopTap(key){if(requireControl())tapKey(key)}
function desktopCombo(modifier,key){if(!requireControl())return;publish({type:'modified-tap',modifier,key,duration:55});vibe(12)}
function setDesktopModifier(key,on){if(!requireControl()&&on)return;if(on){if(desktopModifierHeld.has(key))return;desktopModifierHeld.add(key);downKey(key)}else{desktopModifierHeld.delete(key);upKey(key)}document.querySelectorAll(`[data-modifier="${key}"]`).forEach(b=>b.classList.toggle('latched',on))}
function releaseDesktopModifiers(){for(const key of [...desktopModifierHeld]){desktopModifierHeld.delete(key);upKey(key)}document.querySelectorAll('.desktopModifier').forEach(b=>b.classList.remove('latched'))}
function setDesktopDrag(on){if(desktopDragHeld===!!on)return;if(on&&!requireControl())return;desktopDragHeld=!!on;const b=$('desktopDrag');if(b)b.classList.toggle('latched',desktopDragHeld);if(canControl())publish({type:desktopDragHeld?'mouse-left-down':'mouse-left-up'})}
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
  if(gamepad && !$('customMoveDpad')){
    const stage=document.querySelector('.stage');
    const mk=(id,label,keys)=>{const d=document.createElement('div');d.id=id;d.className='customDpad';d.setAttribute('aria-label',label);d.innerHTML=`<button class="btn up" data-pad="${keys[0]}">▲</button><button class="btn left" data-pad="${keys[1]}">◀</button><span class="padCore"></span><button class="btn right" data-pad="${keys[2]}">▶</button><button class="btn down" data-pad="${keys[3]}">▼</button>`;stage.appendChild(d);return d};
    mk('customMoveDpad','Movement D-pad',['moveUp','moveLeft','moveRight','moveDown']);
    mk('customArrowPad','Arrow-key pad',['UP','LEFT','RIGHT','DOWN']);
  }
  if(!$('touchLayoutEditor')){
    const editor=document.createElement('div');editor.id='touchLayoutEditor';editor.className='touchLayoutEditor';editor.innerHTML=`<div class="tleTop"><span class="tleTitle">TOUCH LAYOUT</span><div class="tleContext"><button class="btn" data-tle-context="normal">GAMEPAD</button><button class="btn" data-tle-context="screen">LIVE</button><button class="btn" data-tle-context="fullscreen">FULL</button></div><button class="btn tleDone" id="tleDone">DONE</button></div><div class="tlePanel"><div class="tleRow"><label>Control</label><select id="tleControl"></select><label class="tleEnabled"><input id="tleEnabled" type="checkbox"> ON</label></div><div class="tleRow"><label>Size</label><input id="tleScale" type="range" min="0.35" max="2" step="0.05"><output id="tleScaleOut"></output></div><div class="tleRow"><label>Opacity</label><input id="tleOpacity" type="range" min="0.08" max="1" step="0.02"><output id="tleOpacityOut"></output></div><div class="tleColor"><div class="tleMini"><span>R</span><input id="tleR" type="range" min="0" max="255"></div><div class="tleMini"><span>G</span><input id="tleG" type="range" min="0" max="255"></div><div class="tleMini"><span>B</span><input id="tleB" type="range" min="0" max="255"></div><div class="tleMini"><span>A</span><input id="tleA" type="range" min="0" max="1" step="0.05"></div></div><div class="tleTools"><button class="btn" id="tleResetControl">RESET CONTROL</button><button class="btn" id="tleResetView">RESET VIEW</button><button class="btn" id="tleCopyScreen">COPY VIEW</button><button class="btn" id="tleCenter">CENTER</button></div><div class="tleHint">Drag any outlined control directly. Size, opacity and RGBA are saved separately for Gamepad, Live Screen and Fullscreen.</div></div>`;document.body.appendChild(editor);
    const settingsStack=document.querySelector('#settingsOverlay .settingsStack');if(settingsStack){const card=document.createElement('div');card.className='settingsCard touchLayoutCard';card.innerHTML='<h3>Touch layout studio</h3><button class="btn" id="editTouchLayout">EDIT TOUCH LAYOUT</button><div class="status" style="margin-top:7px">Move, resize, recolor, fade, hide or enable controls independently for Gamepad, Live Screen and Fullscreen. Includes optional movement D-pad and arrow-key pad.</div>';const layoutCard=[...settingsStack.children].find(x=>x.querySelector?.('#stylePicker'));layoutCard?.after(card)}
  }
}


function touchElement(id){const def=TOUCH_CONTROLS[id];return def?document.querySelector(def.selector):null}
function markTouchElements(){for(const [id] of Object.entries(TOUCH_CONTROLS)){const el=touchElement(id);if(el)el.dataset.touchControl=id}}
function touchCfg(ctx,id){return touchLayouts[ctx]?.[id]||(touchLayouts[ctx][id]=blankTouchControl(!TOUCH_CONTROLS[id]?.optional))}
function touchTintNodes(id,el){if(id==='wasdStick')return [$('stickBase')].filter(Boolean);if(id==='mouseStick')return [$('mouseBase')].filter(Boolean);if(id==='moveDpad'||id==='arrowPad')return [...el.querySelectorAll('button')];if(id==='screenDock'||id==='hotbar')return [...el.querySelectorAll('button,select')];return [el]}
function applyTouchControl(id,ctx=currentTouchContext()){const el=touchElement(id);if(!el)return;const c=touchCfg(ctx,id);el.style.transform=`translate(${Number(c.x||0)}vw,${Number(c.y||0)}vh) scale(${Number(c.scale||1)})`;el.style.transformOrigin='center';el.style.opacity=String(clamp(Number(c.opacity??1),.08,1));const optional=!!TOUCH_CONTROLS[id]?.optional;if(optional)el.style.display=c.enabled?'grid':'none';else el.style.visibility=c.enabled?'visible':'hidden';for(const n of touchTintNodes(id,el)){n.style.setProperty('--touch-r',Math.round(c.r));n.style.setProperty('--touch-g',Math.round(c.g));n.style.setProperty('--touch-b',Math.round(c.b));n.style.setProperty('--touch-a',Number(c.a||0));n.classList.toggle('touchTint',Number(c.a||0)>0.001)}}
function applyTouchLayout(){document.body.classList.add('touch-layout-custom');markTouchElements();const ctx=currentTouchContext();for(const id of Object.keys(TOUCH_CONTROLS))applyTouchControl(id,ctx);if(touchLayoutEditing)refreshTouchEditor()}
function setTouchSelected(id){if(!TOUCH_CONTROLS[id])return;touchSelected=id;document.querySelectorAll('[data-touch-selected]').forEach(el=>delete el.dataset.touchSelected);const el=touchElement(id);if(el)el.dataset.touchSelected='true';const s=$('tleControl');if(s)s.value=id;refreshTouchEditor()}
function refreshTouchEditor(){if(!$('touchLayoutEditor'))return;document.querySelectorAll('[data-tle-context]').forEach(b=>b.classList.toggle('active',b.dataset.tleContext===touchEditContext));const c=touchCfg(touchEditContext,touchSelected);if($('tleEnabled'))$('tleEnabled').checked=!!c.enabled;if($('tleScale'))$('tleScale').value=c.scale;if($('tleScaleOut'))$('tleScaleOut').textContent=`${Math.round(c.scale*100)}%`;if($('tleOpacity'))$('tleOpacity').value=c.opacity;if($('tleOpacityOut'))$('tleOpacityOut').textContent=`${Math.round(c.opacity*100)}%`;for(const k of ['R','G','B'])if($('tle'+k))$('tle'+k).value=c[k.toLowerCase()];if($('tleA'))$('tleA').value=c.a}
function openTouchEditor(){if(controlMode!=='gamepad')setControlMode('gamepad',true);$('settingsOverlay')?.classList.remove('open');touchEditContext=currentTouchContext();touchLayoutEditing=true;document.body.classList.add('layout-editing');$('touchLayoutEditor')?.classList.add('open');const select=$('tleControl');if(select&&!select.options.length){for(const [id,d] of Object.entries(TOUCH_CONTROLS)){const o=document.createElement('option');o.value=id;o.textContent=d.label;select.appendChild(o)}}setTouchSelected(touchSelected);applyTouchLayout()}
function closeTouchEditor(){touchLayoutEditing=false;document.body.classList.remove('layout-editing');$('touchLayoutEditor')?.classList.remove('open');document.querySelectorAll('[data-touch-selected]').forEach(el=>delete el.dataset.touchSelected);saveTouchLayouts();applyTouchLayout()}
function resetTouchView(ctx){touchLayouts[ctx]=defaultTouchLayouts()[ctx];saveTouchLayouts();applyTouchLayout();refreshTouchEditor()}
function bindTouchLayoutEditor(){const editor=$('touchLayoutEditor');if(!editor)return;$('tleDone').onclick=closeTouchEditor;$('tleControl').onchange=()=>setTouchSelected($('tleControl').value);document.querySelectorAll('[data-tle-context]').forEach(b=>b.onclick=()=>{touchEditContext=b.dataset.tleContext;for(const id of Object.keys(TOUCH_CONTROLS))applyTouchControl(id,touchEditContext);setTouchSelected(touchSelected);refreshTouchEditor()});$('tleEnabled').onchange=()=>{touchCfg(touchEditContext,touchSelected).enabled=$('tleEnabled').checked;saveTouchLayouts();applyTouchControl(touchSelected,touchEditContext)};$('tleScale').oninput=()=>{touchCfg(touchEditContext,touchSelected).scale=Number($('tleScale').value);$('tleScaleOut').textContent=`${Math.round(Number($('tleScale').value)*100)}%`;saveTouchLayouts();applyTouchControl(touchSelected,touchEditContext)};$('tleOpacity').oninput=()=>{touchCfg(touchEditContext,touchSelected).opacity=Number($('tleOpacity').value);$('tleOpacityOut').textContent=`${Math.round(Number($('tleOpacity').value)*100)}%`;saveTouchLayouts();applyTouchControl(touchSelected,touchEditContext)};for(const k of ['R','G','B'])$('tle'+k).oninput=()=>{const c=touchCfg(touchEditContext,touchSelected);c[k.toLowerCase()]=Number($('tle'+k).value);c.a=Math.max(Number(c.a||0),.08);$('tleA').value=c.a;saveTouchLayouts();applyTouchControl(touchSelected,touchEditContext)};$('tleA').oninput=()=>{touchCfg(touchEditContext,touchSelected).a=Number($('tleA').value);saveTouchLayouts();applyTouchControl(touchSelected,touchEditContext)};$('tleResetControl').onclick=()=>{touchLayouts[touchEditContext][touchSelected]=blankTouchControl(!TOUCH_CONTROLS[touchSelected]?.optional);saveTouchLayouts();applyTouchControl(touchSelected,touchEditContext);refreshTouchEditor()};$('tleResetView').onclick=()=>resetTouchView(touchEditContext);$('tleCenter').onclick=()=>{const c=touchCfg(touchEditContext,touchSelected);c.x=0;c.y=0;saveTouchLayouts();applyTouchControl(touchSelected,touchEditContext)};$('tleCopyScreen').onclick=()=>{const src=JSON.parse(JSON.stringify(touchLayouts[touchEditContext]));for(const ctx of TOUCH_CONTEXTS)if(ctx!==touchEditContext)touchLayouts[ctx]=JSON.parse(JSON.stringify(src));saveTouchLayouts();showControlToast('LAYOUT COPIED TO ALL VIEWS')};$('editTouchLayout')?.addEventListener('click',openTouchEditor);let drag=null;const resolve=e=>{let n=e.target;while(n&&n!==document.body){const id=n.dataset?.touchControl;if(id)return{id,el:n};n=n.parentElement}return null};document.addEventListener('pointerdown',e=>{if(!touchLayoutEditing||e.target.closest?.('.touchLayoutEditor .tleTop,.touchLayoutEditor .tlePanel'))return;const hit=resolve(e);if(!hit)return;e.preventDefault();e.stopImmediatePropagation();setTouchSelected(hit.id);const c=touchCfg(touchEditContext,hit.id);drag={id:hit.id,pointer:e.pointerId,startX:e.clientX,startY:e.clientY,x:Number(c.x||0),y:Number(c.y||0)}},{capture:true});document.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.pointer)return;e.preventDefault();e.stopImmediatePropagation();const c=touchCfg(touchEditContext,drag.id);c.x=clamp(drag.x+(e.clientX-drag.startX)/innerWidth*100,-80,80);c.y=clamp(drag.y+(e.clientY-drag.startY)/innerHeight*100,-80,80);applyTouchControl(drag.id,touchEditContext)},{capture:true});const end=e=>{if(!drag||e.pointerId!==drag.pointer)return;e.preventDefault();e.stopImmediatePropagation();drag=null;saveTouchLayouts()};document.addEventListener('pointerup',end,{capture:true});document.addEventListener('pointercancel',end,{capture:true})}
function bindOptionalPads(){document.querySelectorAll('#customMoveDpad [data-pad]').forEach(b=>bindHoldControl(b,b.dataset.pad));document.querySelectorAll('#customArrowPad [data-pad]').forEach(b=>{let active=false;const key=b.dataset.pad;b.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();if(!requireControl())return;active=true;b.setPointerCapture?.(e.pointerId);downKey(key);b.classList.add('active')});const end=e=>{e.preventDefault?.();e.stopPropagation?.();if(active){active=false;upKey(key);b.classList.remove('active')}};b.addEventListener('pointerup',end);b.addEventListener('pointercancel',end);b.addEventListener('lostpointercapture',end)})}


function updateTransportStatus(){
  if(lanReady())setStatus(desktopArmed?'PRIMARY · LOCAL':'LOCAL · desktop not armed',true);
  else if(rtcReady())setStatus(desktopArmed?'PRIMARY · DIRECT':'DIRECT · desktop not armed',true);
  else if(role==='controller')setStatus(desktopArmed?'PRIMARY · REMOTE':'REMOTE · desktop not armed',true);
}
function closeRtc(){
  clearTimeout(rtcRetryTimer);rtcRetryTimer=null;rtcIceQueue=[];
  try{rtcChannel?.close()}catch{}try{rtcPeer?.close()}catch{}
  rtcChannel=null;rtcPeer=null;for(const id of ['desktopMirror','gameMirror']){const v=$(id);if(v)v.srcObject=null}const ra=$('remoteAudio');if(ra)ra.srcObject=null;$('desktopTouchpad')?.classList.remove('mirroring');document.body.classList.remove('game-screen-on');
}
function scheduleRtcRetry(){clearTimeout(rtcRetryTimer);if(!signalingReady()||kicked)return;rtcRetryTimer=setTimeout(()=>startRtc(),2500)}
async function startRtc(){
  if(!signalingReady()||!room||!secret||kicked)return;
  closeRtc();
  try{
    const pc=new RTCPeerConnection(RTC_CONFIG);rtcPeer=pc;
    const channel=pc.createDataChannel('pixelb8-controls',{ordered:true});rtcChannel=channel;
    pc.addTransceiver('video',{direction:'recvonly'});
    pc.addTransceiver('audio',{direction:'recvonly'});
    pc.ontrack=e=>{
      if(e.track?.kind==='video'){
        const stream=new MediaStream([e.track]);
        for(const id of ['desktopMirror','gameMirror']){const v=$(id);if(v){v.srcObject=stream;v.play().catch(()=>{})}}
        $('desktopTouchpad')?.classList.add('mirroring');document.body.classList.toggle('game-screen-on',mirrorMode!=='off');const label=mirrorMode==='auto'?'auto':(mirrorMode==='low'?'8 fps':`${mirrorMode} fps`);const ms=$('mirrorStatus');if(ms)ms.textContent=label;updateRemoteViewUi();
      }else if(e.track?.kind==='audio'){
        const ra=$('remoteAudio');if(ra){ra.srcObject=new MediaStream([e.track]);ra.muted=!mirrorAudioEnabled;if(mirrorAudioEnabled)ra.play().catch(()=>showControlToast('TAP 🔊 TO START AUDIO'))}
      }
    };
    channel.onopen=()=>{updateTransportStatus();vibe(18)};
    channel.onclose=()=>{updateTransportStatus();scheduleRtcRetry()};
    channel.onerror=()=>updateTransportStatus();
    pc.onicecandidate=e=>{if(e.candidate)signalDesktop({type:'rtc-ice',candidate:e.candidate})};
    pc.onconnectionstatechange=()=>{if(['failed','closed'].includes(pc.connectionState))scheduleRtcRetry()};
    const offer=await pc.createOffer();await pc.setLocalDescription(offer);
    signalDesktop({type:'rtc-offer',sdp:pc.localDescription.sdp,mirrorMode,mirrorAudio:mirrorAudioEnabled});
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
    if((msg.type==='rtc-answer'||msg.type==='rtc-ice')){handleRtcSignal(msg);return}
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
    lanFailures=0;kicked=false;desktopOnline=true;rawPublish({type:'hello'});updateTransportStatus();if(mirrorMode!=='off')setTimeout(()=>startRtc(),120);
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
function refreshLabels(){ $('dirUp').textContent=displayForKey(keyFor('moveUp'));$('dirDown').textContent=displayForKey(keyFor('moveDown'));$('dirLeft').textContent=displayForKey(keyFor('moveLeft'));$('dirRight').textContent=displayForKey(keyFor('moveRight'));document.querySelectorAll('[data-label]').forEach(el=>el.textContent=displayForKey(keyFor(el.dataset.label)));document.querySelectorAll('[data-rlabel]').forEach(el=>el.textContent=displayForKey(keyFor(el.dataset.rlabel)));document.querySelectorAll('[data-main-key]').forEach(el=>el.textContent=displayForKey(keyFor(el.dataset.mainKey)));setButtonCaption(document.querySelector('[data-action="action"]'),captionFor('action','ACTION'));setButtonCaption(document.querySelector('[data-action="interact"]'),captionFor('interact','USE'));setButtonCaption(document.querySelector('[data-action="target"]'),captionFor('target','TARGET'));setButtonCaption(document.querySelector('[data-action="sit"]'),captionFor('sit','SIT'));setButtonCaption($('runHold'),captionFor('run','RUN'));renderHotbar();buildMoreBar() }
function setShift(on){shiftLatched=!!on;$('shift').classList.toggle('latched',shiftLatched);$('shift').classList.toggle('active',shiftLatched)}
$('shift').onclick=()=>{if(!requireControl())return;setShift(!shiftLatched);vibe(15)};
(function setupRunHold(){const b=$('runHold');let active=false;b.addEventListener('pointerdown',e=>{e.preventDefault();if(!requireControl())return;active=true;downKey(keyFor('run'));b.classList.add('active')});const end=()=>{if(active){active=false;upKey(keyFor('run'));b.classList.remove('active')}};b.addEventListener('pointerup',end);b.addEventListener('pointercancel',end);b.addEventListener('lostpointercapture',end)})();
document.querySelectorAll('[data-action]').forEach(el=>{el.addEventListener('pointerdown',e=>{e.preventDefault();if(!requireControl())return;tapAction(el.dataset.action);el.classList.add('active')});const end=()=>el.classList.remove('active');el.addEventListener('pointerup',end);el.addEventListener('pointercancel',end)});
$('release').onclick=()=>releaseAll();
function openChat(){if(chatOpen)return;if(!requireControl())return;chatOpen=true;if(controlMode!=='desktop')publish({type:'chat-open',key:keyFor('enter')});$('chatInput').placeholder=controlMode==='desktop'?'Type on desktop…':'Type game chat…';$('chatSend').textContent=controlMode==='desktop'?'TYPE':'SEND';$('chat').classList.add('open');setTimeout(()=>$('chatInput').focus(),50)}
function closeChat(send=true){if(!chatOpen)return;const text=$('chatInput').value.trim();if(canControl()){if(controlMode==='desktop'){if(send&&text)publish({type:'text-send',text})}else{if(send&&text)publish({type:'chat-send',text,enterKey:keyFor('enter')});else publish({type:'tap',key:keyFor('enter'),duration:55})}}$('chatInput').value='';$('chat').classList.remove('open');$('chatInput').blur();chatOpen=false}
function dismissPhoneChat(){if(!chatOpen)return;$('chatInput').value='';$('chat').classList.remove('open');$('chatInput').blur();chatOpen=false;showControlToast('PHONE CHAT CLOSED — no key sent')}
function pressEnter(){if(!requireControl())return;if(keyboardOnEnter)openChat();else publish({type:'tap',key:keyFor('enter'),duration:55})}
$('enter').onclick=()=>chatOpen?closeChat(true):pressEnter();$('keyboardBtn').onclick=()=>chatOpen?$('chatInput').focus():openChat();$('modeBtn').onclick=()=>setControlMode(controlMode==='desktop'?'gamepad':'desktop');$('chatSend').onclick=()=>closeChat(true);$('chatClose').onclick=dismissPhoneChat;$('chatInput').addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();closeChat(true)}else if(e.key==='Escape'){e.preventDefault();dismissPhoneChat()}});


function updateMirrorAudioUi(){
  for(const id of ['desktopMirrorAudio','gameMirrorAudio']){const b=$(id);if(!b)continue;b.textContent=mirrorAudioEnabled?'🔊':'🔇';b.classList.toggle('active',mirrorAudioEnabled);b.title=mirrorAudioEnabled?'Mute screen audio':'Enable screen audio'}
  const ra=$('remoteAudio');if(ra)ra.muted=!mirrorAudioEnabled;
}
function updateRemoteViewUi(){
  const on=mirrorMode!=='off';
  document.body.classList.toggle('game-screen-on',on);
  for(const id of ['mirrorFps','gameMirrorFps']){const sel=$(id);if(sel)sel.value=mirrorMode}
  const sb=$('screenBtn');if(sb){sb.classList.toggle('active',on);sb.textContent=on?'▣':'▢';sb.title=on?'Turn live screen off':'Turn live screen on'}
  updateMirrorAudioUi();
}
function setMirrorMode(mode,save=true){
  if(!['off','low','30','60','auto'].includes(mode))mode='off';
  mirrorMode=mode;if(save)localStorage.setItem('pixelb8DesktopMirrorMode',mode);
  const status=$('mirrorStatus');if(status)status.textContent=mode==='off'?'off':'connecting…';
  updateRemoteViewUi();
  if(mode==='off'){
    for(const id of ['desktopMirror','gameMirror']){const v=$(id);if(v)v.srcObject=null}$('desktopTouchpad')?.classList.remove('mirroring');
    document.body.classList.remove('remoteFullscreen');
    if(rtcReady()||rtcPeer){closeRtc();if(signalingReady())setTimeout(()=>startRtc(),120)}
  }else if(signalingReady()){
    closeRtc();setTimeout(()=>startRtc(),120);
  }
}
function toggleRemoteFullscreen(){if(mirrorMode==='off'){setMirrorMode('30');return}document.body.classList.toggle('remoteFullscreen');showControlToast(document.body.classList.contains('remoteFullscreen')?'FULLSCREEN REMOTE VIEW':'REMOTE VIEW RESTORED')}
function bindMirrorSelect(id){const sel=$(id);if(!sel)return;sel.value=mirrorMode;['pointerdown','pointerup','click'].forEach(type=>sel.addEventListener(type,e=>e.stopPropagation()));sel.onchange=()=>setMirrorMode(sel.value)}
bindMirrorSelect('mirrorFps');bindMirrorSelect('gameMirrorFps');
$('screenBtn')?.addEventListener('click',()=>setMirrorMode(mirrorMode==='off'?'30':'off'));
$('desktopMirrorFullscreen')?.addEventListener('click',e=>{e.stopPropagation();toggleRemoteFullscreen()});
$('gameMirrorFullscreen')?.addEventListener('click',e=>{e.stopPropagation();toggleRemoteFullscreen()});
function setMirrorAudioEnabled(on,save=true){
  mirrorAudioEnabled=!!on;if(save)localStorage.setItem('pixelb8ScreenAudio',mirrorAudioEnabled?'1':'0');updateMirrorAudioUi();
  const ra=$('remoteAudio');if(ra&&mirrorAudioEnabled)ra.play().catch(()=>{});
  if(mirrorMode!=='off'&&signalingReady()){closeRtc();setTimeout(()=>startRtc(),120)}
}
for(const id of ['desktopMirrorAudio','gameMirrorAudio']){$(id)?.addEventListener('click',e=>{e.stopPropagation();setMirrorAudioEnabled(!mirrorAudioEnabled)})}
updateMirrorAudioUi();
function setMoreBarOpen(open){moreBarOpen=!!open;$('moreBar')?.classList.toggle('open',moreBarOpen);const b=$('more');if(b){b.classList.toggle('latched',moreBarOpen);b.textContent=moreBarOpen?'✕ MORE':'☰ MORE'}const h=$('gameMirrorMore');if(h){h.classList.toggle('latched',moreBarOpen);h.textContent=moreBarOpen?'✕':'☰'}}
$('gameMirrorMore')?.addEventListener('click',e=>{e.stopPropagation();setMoreBarOpen(!moreBarOpen)});

let desktopUpperCollapsed=false,desktopPanelCollapsed=false;
function updateDesktopFullscreenControls(){const p=$('desktopKeysPanel');if(!p)return;p.classList.toggle('desktop-upper-collapsed',desktopUpperCollapsed);p.classList.toggle('desktop-panel-collapsed',desktopPanelCollapsed);const u=$('desktopUpperToggle'),a=$('desktopPanelToggle');if(u){u.textContent=desktopUpperCollapsed?'⌄':'⌃';u.title=desktopUpperCollapsed?'Expand shortcut buttons':'Collapse shortcut buttons'}if(a){a.textContent=desktopPanelCollapsed?'▶':'◀';a.title=desktopPanelCollapsed?'Expand desktop controls':'Collapse desktop controls'}}
$('desktopUpperToggle')?.addEventListener('click',e=>{e.stopPropagation();desktopUpperCollapsed=!desktopUpperCollapsed;updateDesktopFullscreenControls()});
$('desktopPanelToggle')?.addEventListener('click',e=>{e.stopPropagation();desktopPanelCollapsed=!desktopPanelCollapsed;updateDesktopFullscreenControls()});
updateDesktopFullscreenControls();

document.querySelectorAll('.desktopKey[data-key]').forEach(b=>b.onclick=()=>desktopTap(b.dataset.key));
document.querySelectorAll('.desktopKey[data-combo]').forEach(b=>b.onclick=()=>{const [m,k]=b.dataset.combo.split(',');desktopCombo(m,k)});
document.querySelectorAll('.desktopModifier').forEach(b=>b.onclick=()=>setDesktopModifier(b.dataset.modifier,!desktopModifierHeld.has(b.dataset.modifier)));
$('desktopLmb').onclick=()=>{if(requireControl())tapMouse('left')};$('desktopRmb').onclick=()=>{if(requireControl())tapMouse('right')};$('desktopDrag').onclick=()=>setDesktopDrag(!desktopDragHeld);$('desktopRelease').onclick=()=>{releaseDesktopModifiers();setDesktopDrag(false);releaseAll()};
function mirrorPoint(video,e){if(!video||!video.videoWidth||!video.videoHeight)return null;const r=video.getBoundingClientRect(),vr=video.videoWidth/video.videoHeight,rr=r.width/r.height;let w=r.width,h=r.height,left=r.left,top=r.top;if(rr>vr){w=r.height*vr;left=r.left+(r.width-w)/2}else{h=r.width/vr;top=r.top+(r.height-h)/2}const x=(e.clientX-left)/w,y=(e.clientY-top)/h;if(x<0||x>1||y<0||y>1)return null;return{x:Math.max(0,Math.min(1,x)),y:Math.max(0,Math.min(1,y))}}
function moveCursorToMirror(video,e){const p=mirrorPoint(video,e);if(p&&canControl())publish({type:'mouse-absolute',x:p.x,y:p.y})}
(function bindDesktopTouchpad(){
  const pad=$('desktopTouchpad');if(!pad)return;const pts=new Map();let gestureStart=0,maxPointers=0,maxTravel=0,lastCenter=null,primaryStart=null,dragging=false;
  let singleTapTimer=null,lastTapAt=0,lastTapPos=null;
  const TAP_SLOP=28,DRAG_START=10,TAP_MAX_MS=420,DOUBLE_MS=340;
  const center=()=>{const a=[...pts.values()];if(!a.length)return null;return{x:a.reduce((n,p)=>n+p.x,0)/a.length,y:a.reduce((n,p)=>n+p.y,0)/a.length}};
  const isInteractiveTarget=e=>!!e.target?.closest?.('select,button,input,label,.mirrorBar');
  const cancelSingleTap=()=>{if(singleTapTimer){clearTimeout(singleTapTimer);singleTapTimer=null}};
  const queueTap=(x,y)=>{const now=performance.now();const close=lastTapPos&&Math.hypot(x-lastTapPos.x,y-lastTapPos.y)<40;if(lastTapAt&&now-lastTapAt<DOUBLE_MS&&close){cancelSingleTap();lastTapAt=0;lastTapPos=null;tapMouse('right');return}lastTapAt=now;lastTapPos={x,y};cancelSingleTap();singleTapTimer=setTimeout(()=>{singleTapTimer=null;if(canControl())tapMouse('left');lastTapAt=0;lastTapPos=null},240)};
  pad.addEventListener('pointerdown',e=>{if(isInteractiveTarget(e))return;e.preventDefault();if(!requireControl())return;if(mirrorMode!=='off')moveCursorToMirror($('desktopMirror'),e);pad.setPointerCapture?.(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pts.size===1){gestureStart=performance.now();maxPointers=1;maxTravel=0;primaryStart={x:e.clientX,y:e.clientY};dragging=false}maxPointers=Math.max(maxPointers,pts.size);lastCenter=center();vibe(5)});
  pad.addEventListener('pointermove',e=>{if(!pts.has(e.pointerId))return;e.preventDefault();const prev=pts.get(e.pointerId);pts.set(e.pointerId,{x:e.clientX,y:e.clientY});if(primaryStart)maxTravel=Math.max(maxTravel,Math.hypot(e.clientX-primaryStart.x,e.clientY-primaryStart.y));const c=center();if(!c||!lastCenter){lastCenter=c;return}const dx=c.x-lastCenter.x,dy=c.y-lastCenter.y;lastCenter=c;if(pts.size>=2){dragging=true;if(Math.abs(dy)>=1)publish({type:'mouse-wheel',delta:Math.round(-dy*8)})}else{if(!dragging&&maxTravel<DRAG_START)return;dragging=true;const scale=Number(mouseSettings.touchpadSensitivity)||1.35;const mx=Math.round((e.clientX-prev.x)*scale),my=Math.round((e.clientY-prev.y)*scale);if(mx||my)publish({type:'mouse-move',dx:mx,dy:my})}});
  const end=e=>{if(!pts.has(e.pointerId))return;e.preventDefault();const finish=pts.get(e.pointerId);pts.delete(e.pointerId);const elapsed=performance.now()-gestureStart;if(pts.size===0){if(elapsed<TAP_MAX_MS&&maxTravel<TAP_SLOP){if(maxPointers>=2){cancelSingleTap();lastTapAt=0;lastTapPos=null;tapMouse('right')}else queueTap(finish?.x??e.clientX,finish?.y??e.clientY)}lastCenter=null;primaryStart=null;dragging=false}else lastCenter=center()};
  const cancel=e=>{if(!pts.has(e.pointerId))return;pts.delete(e.pointerId);if(!pts.size){lastCenter=null;primaryStart=null;dragging=false}};
  pad.addEventListener('pointerup',end);pad.addEventListener('pointercancel',cancel);pad.addEventListener('lostpointercapture',cancel);
})();

(function bindGameMirrorPointer(){const layer=$('gameMirrorLayer');if(!layer)return;layer.addEventListener('pointerdown',e=>{if(e.target?.closest?.('.gameMirrorTop'))return;if(controlMode!=='gamepad'||mirrorMode==='off'||!requireControl())return;moveCursorToMirror($('gameMirror'),e)});})();

function buildMoreBar(){const bar=$('moreBar');if(!bar)return;bar.innerHTML='';for(const [action,label] of TOP_MORE){const b=document.createElement('button');b.className='btn moreChip';b.innerHTML=`${captionFor(action,label)}<small>${displayForKey(keyFor(action))}</small>`;b.classList.toggle('disabled',!keyFor(action));b.onclick=()=>{if(keyFor(action)&&requireControl())tapAction(action)};bar.appendChild(b)}}
$('more').onclick=()=>setMoreBarOpen(!moreBarOpen);

function buildSettings(){
  $('deviceNameInput').value=deviceName;$('roomSetting').value=room;
  populateProfileSelect();
  $('saveCustomProfile').onclick=saveProfileFromUi;$('duplicateProfile').onclick=duplicateProfile;$('renameProfile').onclick=renameProfile;$('deleteProfile').onclick=deleteProfile;updateProfileUi();
  $('keyboardOnEnter').checked=keyboardOnEnter;$('keyboardOnEnter').onchange=e=>{keyboardOnEnter=!!e.target.checked;localStorage.setItem('pixelb8GamepadKeyboardOnEnter',keyboardOnEnter?'1':'0');showControlToast(keyboardOnEnter?'ENTER OPENS KEYBOARD':'ENTER SENDS ENTER ONLY')};
  document.querySelectorAll('.layoutChoice').forEach(b=>b.classList.toggle('selected',b.dataset.layout===layoutPreset));document.querySelectorAll('.styleChoice').forEach(b=>b.classList.toggle('selected',b.dataset.style===layoutStyle));
  const g=$('bindGrid');g.innerHTML='';for(const action of Object.keys(DEFAULT_BINDINGS)){const row=document.createElement('div');row.className='bindRow';const label=document.createElement('label');label.textContent=bindingLabelFor(action);const sel=document.createElement('select');for(const k of KEY_OPTIONS){const o=document.createElement('option');o.value=k;o.textContent=KEY_DISPLAY[k]||k;o.selected=bindings[action]===k;sel.appendChild(o)}sel.onchange=()=>{bindings[action]=sel.value;saveBindings();markCustomProfile();refreshLabels()};row.append(label,sel);g.appendChild(row)}
  $('mouseSensitivity').value=mouseSettings.sensitivity;$('mouseSensitivityOut').textContent=mouseSettings.sensitivity;$('touchpadSensitivity').value=mouseSettings.touchpadSensitivity;$('touchpadSensitivityOut').textContent=Number(mouseSettings.touchpadSensitivity).toFixed(2).replace(/0+$/,'').replace(/\.$/,'');$('tiltSensitivity').value=mouseSettings.tiltSensitivity;$('tiltSensitivityOut').textContent=mouseSettings.tiltSensitivity;$('mouseHorizontalOnly').checked=mouseSettings.horizontalOnly;$('mouseInvertX').checked=mouseSettings.invertX;$('mouseInvertY').checked=mouseSettings.invertY;$('tiltAutoEnable').checked=mouseSettings.tiltAutoEnable;updateTiltStatus()
}
$('deviceNameInput').addEventListener('change',()=>{deviceName=($('deviceNameInput').value.trim()||('Phone '+clientId.slice(-4).toUpperCase())).slice(0,48);localStorage.setItem('pixelb8GamepadDeviceName',deviceName);rawPublish({type:'hello'})});
$('roomSetting').addEventListener('change',()=>{const next=$('roomSetting').value.trim();if(next)room=next;$('roomSetting').value=room;showControlToast('ROOM SAVED — TAP ↻ TO RECONNECT')});
$('mouseSensitivity').addEventListener('input',()=>{mouseSettings.sensitivity=clamp(Number($('mouseSensitivity').value)||18,4,36);$('mouseSensitivityOut').textContent=mouseSettings.sensitivity;saveMouseSettings();markCustomProfile()});$('touchpadSensitivity').addEventListener('input',()=>{mouseSettings.touchpadSensitivity=clamp(Number($('touchpadSensitivity').value)||1.35,.5,3);$('touchpadSensitivityOut').textContent=Number(mouseSettings.touchpadSensitivity).toFixed(2).replace(/0+$/,'').replace(/\.$/,'');saveMouseSettings();markCustomProfile()});$('tiltSensitivity').addEventListener('input',()=>{mouseSettings.tiltSensitivity=clamp(Number($('tiltSensitivity').value)||12,2,30);$('tiltSensitivityOut').textContent=mouseSettings.tiltSensitivity;saveMouseSettings();markCustomProfile()});$('mouseHorizontalOnly').onchange=()=>{mouseSettings.horizontalOnly=$('mouseHorizontalOnly').checked;saveMouseSettings();markCustomProfile()};$('mouseInvertX').onchange=()=>{mouseSettings.invertX=$('mouseInvertX').checked;saveMouseSettings();markCustomProfile()};$('mouseInvertY').onchange=()=>{mouseSettings.invertY=$('mouseInvertY').checked;saveMouseSettings();markCustomProfile()};$('tiltAutoEnable').onchange=()=>{mouseSettings.tiltAutoEnable=$('tiltAutoEnable').checked;saveMouseSettings();markCustomProfile()};
document.querySelectorAll('.layoutChoice').forEach(b=>b.onclick=()=>applyLayout(b.dataset.layout));document.querySelectorAll('.styleChoice').forEach(b=>b.onclick=()=>{applyLayoutStyle(b.dataset.style);markCustomProfile()});$('settings').onclick=()=>{buildSettings();$('settingsOverlay').classList.add('open')};$('resetBindings').onclick=()=>{const p=PROFILE_DEFS[activeProfile];const c=customProfile(activeProfile);bindings={...DEFAULT_BINDINGS,...(p?.bindings||c?.snapshot?.bindings||{})};saveBindings();if(isCustomProfileId(activeProfile))saveActiveCustom();buildSettings();refreshLabels();showControlToast('BINDINGS RESET')};document.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>$((b.dataset.close)).classList.remove('open'));document.querySelectorAll('.overlay').forEach(o=>o.addEventListener('pointerdown',e=>{if(e.target===o)o.classList.remove('open')}));

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
setControlMode(controlMode,false);updateRemoteViewUi();
applyLayoutStyle(layoutStyle,false);
applyLayout(layoutPreset,false);
bindHoldControl($('rotLeftDock'),'rotateLeft');
bindHoldControl($('rotRightDock'),'rotateRight');
bindOptionalPads();bindTouchLayoutEditor();applyTouchLayout();
new MutationObserver(()=>applyTouchLayout()).observe(document.body,{attributes:true,attributeFilter:['class']});
refreshLabels();buildMoreBar();updateTiltStatus();updateFreelookButton();if(mouseSettings.tiltAutoEnable&&localStorage.getItem('pixelb8GamepadTiltEnabled')==='1')setTimeout(()=>enableTilt(),250);if(room&&secret)connect();else setStatus('scan a valid PixelB8 QR invite');
})();
