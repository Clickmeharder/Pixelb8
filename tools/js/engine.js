/* =========================
   PIXELB8 ENGINE JS
========================= */

/* -------------------------
   STATE ENGINE
------------------------- */
const PB8 = {
  meta: { neon:"#00ff41", bg:"#0d0d0d" },
  pages: { home: { id:"home", widgets:[] } },
  currentPage: "home"
};

let activeWidgetId = null;

/* -------------------------
   UTILS
------------------------- */
function uid() { return crypto.randomUUID(); }

function save() {
  localStorage.setItem("pb8_engine_v6", JSON.stringify(PB8));
}

function load() {
  const data = localStorage.getItem("pb8_engine_v6");
  if (data) Object.assign(PB8, JSON.parse(data));
  renderAll();
}

/* -------------------------
   PAGE SYSTEM
------------------------- */
const Pages = {
  add: function() {
    const name = prompt("Page name?");
    if (!name) return;
    PB8.pages[name] = { id:name, widgets:[] };
    PB8.currentPage = name;
    save();
    renderAll();
  },
  switch: function(name) {
    PB8.currentPage = name;
    renderAll();
  },
  wipe: function() {
    if (confirm("Wipe page?")) {
      PB8.pages[PB8.currentPage].widgets = [];
      activeWidgetId = null;
      save();
      render();
    }
  }
};

function renderPages() {
  const list = document.getElementById("pageList");
  list.innerHTML = "";
  Object.keys(PB8.pages).forEach(p => {
    const btn = document.createElement("button");
    btn.textContent = p;
    btn.addEventListener("click", () => Pages.switch(p));
    list.appendChild(btn);
  });
}

/* -------------------------
   WIDGET SYSTEM
------------------------- */
const Widgets = {
  add: function(type) {
    const w = { id: uid(), type, x:50, y:50, w:300, h:null, z:1, styles:{}, content: getDefaultContent(type) };
    PB8.pages[PB8.currentPage].widgets.push(w);
    activeWidgetId = w.id;
    save();
    render();
  },
  duplicate: function() {
    if (!activeWidgetId) return;
    const page = PB8.pages[PB8.currentPage];
    const orig = page.widgets.find(w => w.id === activeWidgetId);
    if (!orig) return;
    const clone = JSON.parse(JSON.stringify(orig));
    clone.id = uid();
    clone.x += 20;
    clone.y += 20;
    page.widgets.push(clone);
    activeWidgetId = clone.id;
    save();
    render();
  },
  remove: function() {
    if (!activeWidgetId) return;
    const page = PB8.pages[PB8.currentPage];
    page.widgets = page.widgets.filter(w => w.id !== activeWidgetId);
    activeWidgetId = null;
    save();
    render();
  }
};

function getDefaultContent(type) {
  switch(type) {
    case "header": return "New Header";
    case "text": return "Editable text block...";
    case "image": return "https://placehold.co/600x400";
    case "button": return "Click Me";
    default: return "";
  }
}

/* -------------------------
   THEME
------------------------- */
const Theme = {
  update: function(prop, val) {
    PB8.meta[prop.replace("--","")] = val;
    save();
    render();
  }
};

/* -------------------------
   RENDER ENGINE
------------------------- */
function render() {
  const frame = document.getElementById("frame");
  frame.innerHTML = "";
  frame.style.background = PB8.meta.bg;
  document.documentElement.style.setProperty("--neon", PB8.meta.neon);
  document.documentElement.style.setProperty("--bg", PB8.meta.bg);

  const page = PB8.pages[PB8.currentPage];
  page.widgets.forEach(w => {
    const el = document.createElement("div");
    el.className = "widget";
    if (w.id === activeWidgetId) el.classList.add("active");

    el.style.left = w.x + "px";
    el.style.top = w.y + "px";
    el.style.width = w.w + "px";
    if (w.h) el.style.height = w.h + "px";
    el.style.zIndex = w.z;
    Object.assign(el.style, w.styles);

    el.addEventListener("mousedown", e => startDrag(e, w.id));

    switch(w.type) {
      case "header": el.innerHTML = `<h1 contenteditable>${w.content}</h1>`; break;
      case "text": el.innerHTML = `<p contenteditable>${w.content}</p>`; break;
      case "image": el.innerHTML = `<img src='${w.content}' style='width:100%'>`; break;
      case "button": el.innerHTML = `<a href='#' class='pb8-btn' contenteditable>${w.content}</a>`; break;
    }

    frame.appendChild(el);
  });
}

function renderAll() {
  renderPages();
  render();
}

/* -------------------------
   DRAG SYSTEM
------------------------- */
let drag = null;
function startDrag(e,id) {
  activeWidgetId = id;
  drag = { id, startX:e.clientX, startY:e.clientY };
  render();
}

document.addEventListener("mousemove", e => {
  if(!drag) return;
  const w = PB8.pages[PB8.currentPage].widgets.find(x => x.id === drag.id);
  w.x += e.clientX - drag.startX;
  w.y += e.clientY - drag.startY;
  drag.startX = e.clientX;
  drag.startY = e.clientY;
  render();
});

document.addEventListener("mouseup", () => {
  if(drag) save();
  drag = null;
});

/* -------------------------
   EXPORT
------------------------- */
function exportHTML() {
  const page = PB8.pages[PB8.currentPage];
  let body = "";
  page.widgets.forEach(w => {
    body += `<div style="position:absolute;left:${w.x}px;top:${w.y}px;width:${w.w}px;">`;
    switch(w.type) {
      case "header": body += `<h1>${w.content}</h1>`; break;
      case "text": body += `<p>${w.content}</p>`; break;
      case "image": body += `<img src="${w.content}" style="width:100%">`; break;
      case "button": body += `<a href="#" style="background:${PB8.meta.neon};color:#000;padding:10px 20px;text-decoration:none;font-weight:bold;">${w.content}</a>`; break;
    }
    body += "</div>";
  });
  const final = `<!DOCTYPE html>
<html>
<head>
<style>
body{background:#000;margin:0;font-family:sans-serif;}
#site{width:1000px;min-height:1000px;margin:50px auto;position:relative;background:${PB8.meta.bg};}
</style>
</head>
<body>
<div id="site">${body}</div>
</body>
</html>`;
  const blob = new Blob([final], {type:"text/html"});
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pixelb8-page.html";
  a.click();
}

/* -------------------------
   INIT EVENT LISTENERS
------------------------- */
window.addEventListener("DOMContentLoaded", () => {
  // Pages buttons
  document.querySelectorAll("#pageList + button").forEach(btn => btn.addEventListener("click", Pages.add));

  // Component buttons
  document.querySelectorAll("#sidebar h3:nth-of-type(2) + button, #sidebar h3:nth-of-type(2) + button ~ button")
    .forEach((btn,i) => {
      const types = ["header","text","image","button"];
      btn.addEventListener("click", () => Widgets.add(types[i]));
    });

  // Theme inputs
  const themeInputs = document.querySelectorAll("#sidebar h3:nth-of-type(3) + input, #sidebar h3:nth-of-type(3) + input ~ input");
  themeInputs[0].addEventListener("change", e => Theme.update('--neon', e.target.value));
  themeInputs[1].addEventListener("change", e => Theme.update('--bg', e.target.value));

  // Action buttons
  const actionBtns = document.querySelectorAll("#sidebar h3:nth-of-type(4) + button, #sidebar h3:nth-of-type(4) + button ~ button, #sidebar h3:nth-of-type(4) + button ~ button ~ button, #sidebar h3:nth-of-type(4) + button ~ button ~ button ~ button");
  actionBtns[0].addEventListener("click", Widgets.duplicate);
  actionBtns[1].addEventListener("click", Widgets.remove);
  actionBtns[2].addEventListener("click", exportHTML);
  actionBtns[3].addEventListener("click", Pages.wipe);

  load();
});