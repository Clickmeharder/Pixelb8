/**
 * PIXELB8 OMEGA ENGINE V5 - Core Logic
 * Pro-Sovereign CMS & Website Builder
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- State & Constants ---
    let selectedElement = null;
    const livePreview = document.getElementById('live-preview');
    const codeBox = document.getElementById('code-box');
    const inspector = document.getElementById('inspector');
    const gridSnap = document.getElementById('grid-snap');
    const sidebar = document.getElementById('sidebar');

    // --- Initialization ---
    // Fixed: Calling the correct setup functions
    updateCodeView();

    // --- 1. Widget Creation ---
    document.querySelectorAll('[data-widget]').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-widget');
            createWidget(type);
        });
    });

    function createWidget(type) {
        const el = document.createElement('div');
        el.classList.add('widget', `widget-${type}`);
        el.style.position = 'absolute';
        el.style.top = '50px';
        el.style.left = '50px';
        el.setAttribute('data-type', type);

        // Default Content based on Type
        switch (type) {
            case 'header': el.innerHTML = '<h1 style="margin:0;">New Heading</h1>'; break;
            case 'text': el.innerHTML = '<p style="margin:0;">Click to edit text...</p>'; break;
            case 'image': el.innerHTML = `<img src="https://via.placeholder.com/150" style="width:100%; display:block; pointer-events:none;">`; break;
            case 'button': el.innerHTML = `<a href="#" class="pb8-btn">ACTION</a>`; break;
            case 'video': el.innerHTML = `<div style="background:#111; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; color:var(--neon); border:1px solid var(--accent);">VIDEO SOURCE</div>`; break;
            case 'shape': el.style.background = 'var(--neon)'; el.style.height = '100px'; el.style.width = '100px'; break;
            default: el.innerHTML = 'New Component';
        }

        makeElementInteractable(el);
        livePreview.appendChild(el);
        selectElement(el);
        updateCodeView();
    }

    // --- 2. Interaction Logic (Move/Select) ---
    function makeElementInteractable(el) {
        el.addEventListener('mousedown', (e) => {
            // Don't drag if clicking an input inside a widget
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
            
            selectElement(el);
            
            let rect = el.getBoundingClientRect();
            let shiftX = e.clientX - rect.left;
            let shiftY = e.clientY - rect.top;
            const snap = parseInt(gridSnap.value) || 1;

            function moveAt(pageX, pageY) {
                let canvasRect = livePreview.getBoundingClientRect();
                let x = pageX - shiftX - canvasRect.left;
                let y = pageY - shiftY - canvasRect.top;
                
                // Grid Snapping Math
                el.style.left = Math.round(x / snap) * snap + 'px';
                el.style.top = Math.round(y / snap) * snap + 'px';
            }

            function onMouseMove(e) { moveAt(e.pageX, e.pageY); }

            document.addEventListener('mousemove', onMouseMove);
            
            document.onmouseup = () => {
                document.removeEventListener('mousemove', onMouseMove);
                document.onmouseup = null;
                updateCodeView();
            };
        });
    }

    function selectElement(el) {
        // Clear previous selection
        document.querySelectorAll('.widget').forEach(w => w.classList.remove('active'));
        
        selectedElement = el;
        el.classList.add('active');
        
        // Show Inspector and sync values
        inspector.style.display = 'block';
        loadInspectorValues(el);
    }

    // --- 3. Inspector Syncing ---
    function loadInspectorValues(el) {
        const type = el.getAttribute('data-type');
        
        // UI logic for different components
        document.getElementById('ins-media').style.display = (type === 'image' || type === 'video') ? 'block' : 'none';
        
        // Sync values from element to sidebar
        document.getElementById('prop-text').value = el.innerText;
        document.getElementById('prop-size').value = parseInt(window.getComputedStyle(el).fontSize) || 16;
        document.getElementById('prop-opacity').value = window.getComputedStyle(el).opacity;
    }

    // Apply Styles from Inspector
    const propInputs = ['prop-text', 'prop-color', 'prop-size', 'prop-font', 'prop-weight', 'prop-bg', 'prop-radius', 'prop-opacity', 'prop-rotate'];
    propInputs.forEach(id => {
        document.getElementById(id).addEventListener('input', (e) => {
            if (!selectedElement) return;
            const val = e.target.value;

            switch (id) {
                case 'prop-text': selectedElement.innerText = val; break;
                case 'prop-color': selectedElement.style.color = val; break;
                case 'prop-size': selectedElement.style.fontSize = val + 'px'; break;
                case 'prop-font': selectedElement.style.fontFamily = val; break;
                case 'prop-weight': selectedElement.style.fontWeight = val; break;
                case 'prop-bg': selectedElement.style.backgroundColor = val; break;
                case 'prop-radius': selectedElement.style.borderRadius = val + 'px'; break;
                case 'prop-opacity': selectedElement.style.opacity = val; break;
                case 'prop-rotate': selectedElement.style.transform = `rotate(${val}deg)`; break;
            }
            updateCodeView();
        });
    });

    // --- 4. Sidebar & Global Toolbar Toggles ---

    // Toggle Sidebar (Fixed to work with your CSS class)
    document.getElementById('toggle-ui-btn').addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
    });

    // Toggle Mobile View
    document.getElementById('toggle-mobile-btn').addEventListener('click', () => {
        document.body.classList.toggle('mobile-mode');
    });

    // Toggle Code Pane
    document.getElementById('toggle-code-btn').addEventListener('click', () => {
        const pane = document.getElementById('code-pane');
        pane.style.display = (pane.style.display === 'flex') ? 'none' : 'flex';
    });

    // Wipe Canvas
    document.getElementById('wipe-btn').addEventListener('click', () => {
        if(confirm("Wipe entire canvas? This cannot be undone.")) {
            livePreview.innerHTML = "";
            updateCodeView();
            inspector.style.display = 'none';
        }
    });

    // --- 5. Assets & Themes ---
    document.getElementById('theme-neon').addEventListener('input', (e) => {
        document.documentElement.style.setProperty('--neon', e.target.value);
    });

    document.getElementById('theme-bg').addEventListener('input', (e) => {
        document.getElementById('site-frame').style.backgroundColor = e.target.value;
    });

    document.getElementById('add-asset-btn').addEventListener('click', () => {
        const url = prompt("Enter Asset URL (Image/Icon):");
        if (url) {
            const item = document.createElement('div');
            item.className = 'asset-item';
            item.innerHTML = `<span>${url.split('/').pop()}</span>`;
            item.onclick = () => {
                navigator.clipboard.writeText(url);
                alert("URL copied to clipboard!");
            };
            document.getElementById('asset-list').appendChild(item);
        }
    });

    // --- 6. Code Production ---
    function updateCodeView() {
        // We clone the preview to clean it up before showing the code
        const temp = livePreview.cloneNode(true);
        temp.querySelectorAll('.widget').forEach(w => {
            w.classList.remove('active');
            w.style.outline = 'none'; // Ensure no editor artifacts remain
        });

        codeBox.value = `<style>
    .site-wrapper { position: relative; width: 100%; min-height: 100vh; overflow: hidden; }
    .widget { position: absolute; }
    .pb8-btn { background: var(--neon, #00ff41); color: #000; padding: 10px 20px; text-decoration: none; font-weight: bold; }
</style>

<div class="site-wrapper">
    ${temp.innerHTML.trim()}
</div>`;
    }

    // --- 7. Export ---
    document.getElementById('download-btn').addEventListener('click', () => {
        const content = `<!DOCTYPE html><html><head><title>Exported Site</title></head><body>${codeBox.value}</body></html>`;
        const blob = new Blob([content], {type: "text/html"});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "pixelb8_omega_export.html";
        link.click();
    });
});