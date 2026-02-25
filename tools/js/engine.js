/* =========================
   CORE STATE
========================= */

const PB8 = {
meta:{
neon:"#00ff41",
bg:"#0d0d0d"
},
pages:{
home:{id:"home",widgets:[]}
},
currentPage:"home"
};

let activeWidgetId=null;
let drag=null;
let codeView=false;

/* =========================
   STORAGE
========================= */

const Storage = {
save(){ localStorage.setItem("pb8_engine_v6",JSON.stringify(PB8)); },
load(){ const data=localStorage.getItem("pb8_engine_v6"); if(data) Object.assign(PB8,JSON.parse(data)); Renderer.all(); }
};

/* =========================
   PAGES
========================= */

const Pages = {
render(){
const list=document.getElementById("pageList");
list.innerHTML="";
Object.keys(PB8.pages).forEach(p=>{
const btn=document.createElement("button");
btn.innerText=p;
btn.onclick=()=>{PB8.currentPage=p;Renderer.all();};
list.appendChild(btn);
});
},
add(){
const name=prompt("Page name?");
if(!name)return;
PB8.pages[name]={id:name,widgets:[]};
PB8.currentPage=name;
Storage.save();
Renderer.all();
},
wipe(){
if(confirm("Wipe page?")){
PB8.pages[PB8.currentPage].widgets=[];
Storage.save();
Renderer.render();
}
}
};

/* =========================
   WIDGETS
========================= */

const Widgets = {
new(type){ return {id:crypto.randomUUID(),type,x:50,y:50,w:300,z:1,content:this.default(type)}; },
default(type){
switch(type){case"header":return"New Header";case"text":return"Editable text block...";case"image":return"https://placehold.co/600x400";case"button":return"Click Me";default:return"";}
},
add(type){ const w=this.new(type); PB8.pages[PB8.currentPage].widgets.push(w); activeWidgetId=w.id; Storage.save(); Renderer.render(); },
duplicate(){ if(!activeWidgetId)return; const page=PB8.pages[PB8.currentPage]; const original=page.widgets.find(w=>w.id===activeWidgetId); if(!original)return; const clone=JSON.parse(JSON.stringify(original)); clone.id=crypto.randomUUID(); clone.x+=20; clone.y+=20; page.widgets.push(clone); activeWidgetId=clone.id; Storage.save(); Renderer.render(); },
remove(){ if(!activeWidgetId)return; const page=PB8.pages[PB8.currentPage]; page.widgets=page.widgets.filter(w=>w.id!==activeWidgetId); activeWidgetId=null; Storage.save(); Renderer.render(); }
};

/* =========================
   RENDERER
========================= */

const Renderer = {
render(){ 
if(codeView)return;
const frame=document.getElementById("frame"); frame.innerHTML=""; frame.style.background=PB8.meta.bg;
document.documentElement.style.setProperty("--neon",PB8.meta.neon);
document.documentElement.style.setProperty("--bg",PB8.meta.bg);
const page=PB8.pages[PB8.currentPage];
page.widgets.forEach(w=>{
const el=document.createElement("div");
el.className="widget"; if(w.id===activeWidgetId)el.classList.add("active");
el.style.left=w.x+"px"; el.style.top=w.y+"px"; el.style.width=w.w+"px"; el.style.zIndex=w.z;
el.onmousedown=(e)=>UI.startDrag(e,w.id);
switch(w.type){
case"header": el.innerHTML="<h1 contenteditable>"+w.content+"</h1>"; break;
case"text": el.innerHTML="<p contenteditable>"+w.content+"</p>"; break;
case"image": el.innerHTML="<img src='"+w.content+"' style='width:100%'>"; break;
case"button": el.innerHTML="<a href='#' class='pb8-btn' contenteditable>"+w.content+"</a>"; break;
} frame.appendChild(el);
});
},
all(){ Pages.render(); this.render(); }
};

/* =========================
   UI
========================= */

const UI = {
startDrag(e,id){ activeWidgetId=id; drag={id,startX:e.clientX,startY:e.clientY}; Renderer.render(); },
toggleSidebar(){ const sb=document.getElementById("sidebar"); sb.style.display = sb.style.display==="none" ? "block" : "none"; },
toggleCode(){ 
codeView=!codeView; 
document.getElementById("codePanel").style.display=codeView?"block":"none"; 
if(codeView) CodeView.load(); 
else Renderer.render();
}
};

document.addEventListener("mousemove",e=>{
if(!drag)return;
const page=PB8.pages[PB8.currentPage];
const w=page.widgets.find(x=>x.id===drag.id);
w.x+=e.clientX-drag.startX; w.y+=e.clientY-drag.startY;
drag.startX=e.clientX; drag.startY=e.clientY;
Renderer.render();
});

document.addEventListener("mouseup",()=>{ if(drag) Storage.save(); drag=null; });

/* =========================
   THEME
========================= */

const Theme = {
update(prop,val){ PB8.meta[prop.replace("--","")]=val; Storage.save(); Renderer.render(); }
};

/* =========================
   CODE VIEW
========================= */

const CodeView = {
	tab:"html", load(){
	const area=document.getElementById("codeArea");
	const page=PB8.pages[PB8.currentPage];
	if(this.tab==="html"){
	let body="";
	page.widgets.forEach(w=>{
	body+=`<div style="position:absolute;left:${w.x}px;top:${w.y}px;width:${w.w}px;">`;
	switch(w.type){ case"header":body+=`<h1>${w.content}</h1>`; break; case"text":body+=`<p>${w.content}</p>`; break; case"image":body+=`<img src="${w.content}" style="width:100%">`; break; case"button":body+=`<a href="#">${w.content}</a>`; break; } body+="</div>";
	});
	area.value=body;
	}else if(this.tab==="css"){ area.value=`/* Page CSS */\nbody{background:${PB8.meta.bg};color:${PB8.meta.neon};}`; }
	else{ area.value=`// JS placeholder`; }
	},
	switchTab(t){ this.tab=t; this.load(); }
};

/* =========================
   INIT
========================= */

Storage.load();