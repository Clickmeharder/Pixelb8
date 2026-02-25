// ==========================
// PIXELB8 OMEGA ENGINE JS
// ==========================

document.addEventListener("DOMContentLoaded", () => {

  // ==========================
  // STATE ENGINE
  // ==========================
  const PB8 = {
    meta: {
      neon: "#00ff41",
      bg: "#0d0d0d"
    },
    pages: {
      home: { id: "home", widgets: [] }
    },
    currentPage: "home",
  };

  let activeWidgetId = null;

  // ==========================
  // UTIL
  // ==========================
  const uid = () => crypto.randomUUID();

  const saveState = () => {
    localStorage.setItem("pb8_engine_v5", JSON.stringify(PB8));
    alert("State Saved!");
  };

  const loadState = () => {
    const data = localStorage.getItem("pb8_engine_v5");
    if (data) Object.assign(PB8, JSON.parse(data));
    renderAll();
  };

  // ==========================
  // PAGES
  // ==========================
  const renderPages = () => {
    const list = document.getElementById("pageList");
    list.innerHTML = "";
    Object.keys(PB8.pages).forEach(p => {
      const btn = document.createElement("button");
      btn.innerText = p;
      btn.addEventListener("click", () => {
        PB8.currentPage = p;
        renderAll();
      });
      list.appendChild(btn);
    });
  };

  const addPage = () => {
    const name = prompt("Page name?");
    if (!name) return;
    PB8.pages[name] = { id: name, widgets: [] };
    PB8.currentPage = name;
    saveState();
    renderAll();
  };

  // ==========================
  // WIDGETS
  // ==========================
  const getDefaultContent = type => {
    switch (type) {
      case "header": return "New Header";
      case "text": return "Editable text block...";
      case "image": return "https://placehold.co/600x400";
      case "button": return "Click Me";
      case "gallery": return "https://placehold.co/400x200";
      case "video": return "";
      case "shape": return "";
      case "shop": return "";
      default: return "";
    }
  };

  const newWidget = type => ({
    id: uid(),
    type,
    x: 50,
    y: 50,
    w: 300,
    h: null,
    z: 1,
    styles: {},
    content: getDefaultContent(type)
  });

  const createWidget = type => {
    const w = newWidget(type);
    PB8.pages[PB8.currentPage].widgets.push(w);
    activeWidgetId = w.id;
    saveState();
    renderAll();
  };

  const duplicateActive = () => {
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
    saveState();
    renderAll();
  };

  const deleteActive = () => {
    if (!activeWidgetId) return;
    const page = PB8.pages[PB8.currentPage];
    page.widgets = page.widgets.filter(w => w.id !== activeWidgetId);
    activeWidgetId = null;
    saveState();
    renderAll();
  };

  // ==========================
  // RENDER ENGINE
  // ==========================
  const render = () => {
    const frame = document.getElementById("live-preview");
    frame.innerHTML = "";
    frame.style.background = PB8.meta.bg;
    document.documentElement.style.setProperty("--neon", PB8.meta.neon);
    document.documentElement.style.setProperty("--bg", PB8.meta.bg);

    const page = PB8.pages[PB8.currentPage];
    page.widgets.forEach(w => {
      const el = document.createElement("div");
      el.className = "widget";
      if (w.id === activeWidgetId) el.classList.add("active");

      el.style.position = "absolute";
      el.style.left = w.x + "px";
      el.style.top = w.y + "px";
      el.style.width = w.w + "px";
      el.style.zIndex = w.z;
      if (w.h) el.style.height = w.h + "px";
      Object.assign(el.style, w.styles);

      // Content
      switch (w.type) {
        case "header": el.innerHTML = `<h1 contenteditable>${w.content}</h1>`; break;
        case "text": el.innerHTML = `<p contenteditable>${w.content}</p>`; break;
        case "image": el.innerHTML = `<img src="${w.content}" style="width:100%">`; break;
        case "button": el.innerHTML = `<a href="#" class="pb8-btn" contenteditable>${w.content}</a>`; break;
        default: el.innerText = w.content;
      }

      // Drag
      el.addEventListener("mousedown", e => startDrag(e, w.id));

      frame.appendChild(el);
    });

    syncCode();
  };

  const renderAll = () => {
    renderPages();
    render();
  };

  // ==========================
  // DRAG & DROP
  // ==========================
  let drag = null;

  const startDrag = (e, id) => {
    activeWidgetId = id;
    drag = { id, startX: e.clientX, startY: e.clientY };
    render();
  };

  document.addEventListener("mousemove", e => {
    if (!drag) return;
    const page = PB8.pages[PB8.currentPage];
    const w = page.widgets.find(x => x.id === drag.id);
    w.x += e.clientX - drag.startX;
    w.y += e.clientY - drag.startY;
    drag.startX = e.clientX;
    drag.startY = e.clientY;
    render();
  });

  document.addEventListener("mouseup", () => {
    if (drag) saveState();
    drag = null;
  });

  // ==========================
  // PROPS / INSPECTOR
  // ==========================
  const getActiveWidget = () => {
    const page = PB8.pages[PB8.currentPage];
    return page.widgets.find(w => w.id === activeWidgetId);
  };

  const updateProp = (prop, value) => {
    const w = getActiveWidget();
    if (!w) return;
    if (prop === "innerText") w.content = value;
    if (prop === "href") w.href = value;
    render();
  };

  const updatePropStyle = (prop, value) => {
    const w = getActiveWidget();
    if (!w) return;
    w.styles[prop] = value;
    render();
  };

  const updateMediaSrc = src => {
    const w = getActiveWidget();
    if (!w) return;
    w.content = src;
    render();
  };

  // ==========================
  // ASSET CLIPBOARD
  // ==========================
  const addAsset = () => {
    const url = prompt("Enter asset URL:");
    if (!url) return;
    const list = document.getElementById("asset-list");
    const el = document.createElement("div");
    el.innerText = url;
    list.appendChild(el);
  };

  // ==========================
  // TABLE CONTROLS
  // ==========================
  const modifyTable = action => {
    const w = getActiveWidget();
    if (!w || !w.content) return;
    alert(`Table action: ${action}`);
    // Implement table manipulation logic here
  };

  // ==========================
  // THEME
  // ==========================
  const updateTheme = (prop, val) => {
    PB8.meta[prop.replace("--", "")] = val;
    render();
  };

  // ==========================
  // CODE VIEW & LIVE SYNC
  // ==========================
  const codeBox = document.getElementById("code-box");

  const syncCode = () => {
    const frame = document.getElementById("live-preview");
    codeBox.value = frame.innerHTML;
  };

  codeBox.addEventListener("input", () => {
    const frame = document.getElementById("live-preview");
    frame.innerHTML = codeBox.value;
  });

  const toggleCode = () => {
    const pane = document.getElementById("code-pane");
    pane.style.display = pane.style.display === "flex" ? "none" : "flex";
  };

  // ==========================
  // DEPLOY / DOWNLOAD
  // ==========================
  const deploy = () => alert("Deploying to GitHub...");
  const exportCleanHTML = () => {
    const content = document.getElementById("live-preview").innerHTML;
    const blob = new Blob([`<div>${content}</div>`], { type: "text/html" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "pixelb8-page.html";
    a.click();
  };

  // ==========================
  // TOOLBAR CONTROLS
  // ==========================
  const toggleUI = () => {
    const sidebar = document.getElementById("sidebar");
    sidebar.style.display = sidebar.style.display === "none" ? "block" : "none";
  };

  const toggleMobile = () => alert("Mobile view toggle");
  const clearAll = () => {
    if (!confirm("Wipe all widgets?")) return;
    PB8.pages[PB8.currentPage].widgets = [];
    activeWidgetId = null;
    renderAll();
  };

  // ==========================
  // INITIALIZATION
  // ==========================
  loadState();

  // ==========================
  // EVENT LISTENERS
  // ==========================
  document.getElementById("site-favicon-input").addEventListener("change", e => updateFavicon(e.target.value));
  document.getElementById("site-bg-img").addEventListener("change", updateSiteBG);
  document.getElementById("site-bg-mode").addEventListener("change", updateSiteBG);
  document.getElementById("grid-snap").addEventListener("change", e => console.log("Grid snap:", e.target.value));
  document.getElementById("duplicate-btn").addEventListener("click", duplicateActive);
  document.getElementById("csv-btn").addEventListener("click", processCSV);
  document.getElementById("add-asset-btn").addEventListener("click", addAsset);
  document.getElementById("deploy-btn").addEventListener("click", deploy);
  document.getElementById("download-btn").addEventListener("click", exportCleanHTML);
  document.getElementById("toggle-ui-btn").addEventListener("click", toggleUI);
  document.getElementById("toggle-mobile-btn").addEventListener("click", toggleMobile);
  document.getElementById("toggle-code-btn").addEventListener("click", toggleCode);
  document.getElementById("save-btn").addEventListener("click", saveState);
  document.getElementById("wipe-btn").addEventListener("click", clearAll);

  // Placeholder functions
  function updateFavicon(url) { document.querySelector("link[rel='icon']").href = url; }
  function updateSiteBG() { console.log("Update site BG"); }
  function processCSV() { alert("CSV Processing..."); }

});