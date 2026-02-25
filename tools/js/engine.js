/* =========================
   PIXELB8 OMEGA ENGINE JS
========================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       STATE
    ========================= */
    const PB8 = {
        meta: {
            neon: "#00ff41",
            bg: "#0d0d0d",
        },
        pages: {
            home: { id: "home", widgets: [] }
        },
        currentPage: "home",
    };

    let activeWidgetId = null;
    let drag = null;
    const livePreview = document.getElementById("live-preview");
    const codePane = document.getElementById("code-pane");

    /* =========================
       UTIL FUNCTIONS
    ========================= */
    const uid = () => crypto.randomUUID();

    const saveState = () => {
        localStorage.setItem("pb8_state", JSON.stringify(PB8));
    };

    const loadState = () => {
        const data = localStorage.getItem("pb8_state");
        if (data) Object.assign(PB8, JSON.parse(data));
        renderAll();
    };

    /* =========================
       PAGE SYSTEM
    ========================= */
    const renderPages = () => {
        const pageList = document.getElementById("pageList");
        if (!pageList) return;
        pageList.innerHTML = "";
        Object.keys(PB8.pages).forEach(p => {
            const btn = document.createElement("button");
            btn.textContent = p;
            btn.addEventListener("click", () => {
                PB8.currentPage = p;
                renderAll();
            });
            pageList.appendChild(btn);
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

    /* =========================
       WIDGET SYSTEM
    ========================= */
    const getDefaultContent = type => {
        switch (type) {
            case "header": return "New Header";
            case "text": return "Editable text block...";
            case "image": return "https://placehold.co/400x200";
            case "button": return "Click Me";
            case "gallery": return "https://placehold.co/400x200";
            case "video": return "";
            case "shape": return "";
            case "shop": return "";
            default: return "";
        }
    };

    const createWidget = type => {
        const w = {
            id: uid(),
            type,
            x: 50, y: 50, w: 300, h: null, z: 1,
            styles: {},
            content: getDefaultContent(type)
        };
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
        clone.x += 20; clone.y += 20;
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

    /* =========================
       RENDER
    ========================= */
    const renderAll = () => {
        renderPages();
        renderPreview();
        applyTheme();
    };

    const renderPreview = () => {
        const page = PB8.pages[PB8.currentPage];
        livePreview.innerHTML = "";
        page.widgets.forEach(w => {
            const el = document.createElement("div");
            el.className = "widget";
            if (w.id === activeWidgetId) el.classList.add("active");
            el.style.position = "absolute";
            el.style.left = w.x + "px";
            el.style.top = w.y + "px";
            el.style.width = w.w + "px";
            if (w.h) el.style.height = w.h + "px";
            Object.assign(el.style, w.styles);

            switch (w.type) {
                case "header": el.innerHTML = `<h1 contenteditable>${w.content}</h1>`; break;
                case "text": el.innerHTML = `<p contenteditable>${w.content}</p>`; break;
                case "image": el.innerHTML = `<img src="${w.content}" style="width:100%">`; break;
                case "button": el.innerHTML = `<button>${w.content}</button>`; break;
            }

            el.addEventListener("mousedown", e => startDrag(e, w.id));
            livePreview.appendChild(el);
        });
    };

    const applyTheme = () => {
        document.documentElement.style.setProperty("--neon", PB8.meta.neon);
        document.documentElement.style.setProperty("--bg", PB8.meta.bg);
        livePreview.style.background = PB8.meta.bg;
    };

    /* =========================
       DRAG SYSTEM
    ========================= */
    const startDrag = (e, id) => {
        activeWidgetId = id;
        drag = { id, startX: e.clientX, startY: e.clientY };
        renderAll();
    };

    document.addEventListener("mousemove", e => {
        if (!drag) return;
        const page = PB8.pages[PB8.currentPage];
        const w = page.widgets.find(x => x.id === drag.id);
        w.x += e.clientX - drag.startX;
        w.y += e.clientY - drag.startY;
        drag.startX = e.clientX;
        drag.startY = e.clientY;
        renderPreview();
    });

    document.addEventListener("mouseup", () => {
        if (drag) saveState();
        drag = null;
    });

    /* =========================
       THEME
    ========================= */
    document.getElementById("theme-neon").addEventListener("input", e => {
        PB8.meta.neon = e.target.value;
        applyTheme();
        saveState();
    });
    document.getElementById("theme-bg").addEventListener("input", e => {
        PB8.meta.bg = e.target.value;
        applyTheme();
        saveState();
    });

    /* =========================
       UI TOGGLE
    ========================= */
    const sidebar = document.getElementById("sidebar");
    document.getElementById("toggle-ui-btn").addEventListener("click", () => {
        if (sidebar.style.display === "none") sidebar.style.display = "block";
        else sidebar.style.display = "none";
    });

    document.getElementById("toggle-code-btn").addEventListener("click", () => {
        codePane.style.display = codePane.style.display === "flex" ? "none" : "flex";
    });

    /* =========================
       PAGE BUTTONS
    ========================= */
    document.getElementById("add-page-btn").addEventListener("click", addPage);

    /* =========================
       COMPONENT BUTTONS
    ========================= */
    document.querySelectorAll("#sidebar [data-widget]").forEach(btn => {
        btn.addEventListener("click", () => createWidget(btn.dataset.widget));
    });

    document.getElementById("duplicate-btn").addEventListener("click", duplicateActive);
    document.getElementById("wipe-btn").addEventListener("click", () => {
        if (confirm("Wipe current page?")) {
            PB8.pages[PB8.currentPage].widgets = [];
            activeWidgetId = null;
            saveState();
            renderAll();
        }
    });

    /* =========================
       CODE VIEW SYNC
    ========================= */
    const codeBox = document.getElementById("code-box");
    const syncCode = () => {
        const page = PB8.pages[PB8.currentPage];
        let html = "", css = "", js = "";
        page.widgets.forEach(w => {
            html += `<div>${w.content}</div>\n`;
        });
        codeBox.value = html + "\n" + css + "\n" + js;
    };
    codeBox.addEventListener("input", syncCode);

    /* =========================
       SAVE BUTTON
    ========================= */
    document.getElementById("save-btn").addEventListener("click", saveState);

    /* =========================
       INIT
    ========================= */
    loadState();

});