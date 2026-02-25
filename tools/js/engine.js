/**
 * PIXELB8 OMEGA ENGINE V5 - Core Logic (Fixed)
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
    updateCodeView(); // no more undefined initDragAndDrop

    // --- 1. Widget Creation ---
    document.querySelectorAll('[data-widget]').forEach(btn => {
        btn.addEventListener('click', () => createWidget(btn.getAttribute('data-widget')));
    });

    function createWidget(type) {
        const el = document.createElement('div');
        el.classList.add('widget', `widget-${type}`);
        el.style.position = 'absolute';
        el.style.top = '50px';
        el.style.left = '50px';
        el.style.padding = '10px';
        el.style.minWidth = '100px';
        el.style.cursor = 'move';
        el.setAttribute('data-type', type);

        switch (type) {
            case 'header': el.innerHTML = '<h1>New Heading</h1>'; break;
            case 'text': el.innerHTML = '<p>Click to edit text...</p>'; break;
            case 'image': el.innerHTML = `<img src="https://via.placeholder.com/150" style="width:100%; pointer-events:none;">`; break;
            case 'button': el.innerHTML = `<button style="padding:10px 20px;">Click Me</button>`; break;
            case 'video': el.innerHTML = `<div style="background:#000; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; color:#fff;">Video Placeholder</div>`; break;
            case 'shape': el.style.background = 'var(--neon)'; el.style.height = '100px'; el.style.width = '100px'; break;
        }

        makeElementInteractable(el);
        livePreview.appendChild(el);
        selectElement(el);
        updateCodeView();
    }

    // --- 2. Interaction Logic (Move/Select) ---
    function makeElementInteractable(el) {
        el.addEventListener('mousedown', e => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;

            selectElement(el);

            const rect = el.getBoundingClientRect();
            const shiftX = e.clientX - rect.left;
            const shiftY = e.clientY - rect.top;
            const snap = parseInt(gridSnap.value) || 1;

            function moveAt(pageX, pageY) {
                let x = pageX - shiftX - livePreview.getBoundingClientRect().left;
                let y = pageY - shiftY - livePreview.getBoundingClientRect().top;

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
        if (selectedElement) selectedElement.style.outline = 'none';
        selectedElement = el;
        selectedElement.style.outline = '2px solid var(--neon)';
        inspector.style.display = 'block';
        loadInspectorValues(el);
    }

    function loadInspectorValues(el) {
        const type = el.getAttribute('data-type');
        document.getElementById('ins-media').style.display = (type === 'image' || type === 'video') ? 'block' : 'none';
        document.getElementById('prop-text').value = el.innerText || '';
        document.getElementById('prop-size').value = parseInt(window.getComputedStyle(el).fontSize) || 14;
        document.getElementById('prop-rotate').value = getRotationDegrees(el);
        document.getElementById('prop-opacity').value = window.getComputedStyle(el).opacity;
    }

    const inputs = ['prop-text','prop-color','prop-size','prop-font','prop-weight','prop-bg','prop-radius','prop-opacity','prop-rotate'];
    inputs.forEach(id => {
        document.getElementById(id).addEventListener('input', e => {
            if (!selectedElement) return;
            const val = e.target.value;
            switch(id) {
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

    // --- 3. Global Settings ---
    document.getElementById('theme-neon').addEventListener('input', e => document.documentElement.style.setProperty('--neon', e.target.value));
    document.getElementById('theme-bg').addEventListener('input', e => livePreview.style.backgroundColor = e.target.value);

    // --- 4. Sidebar / Code Toggle ---
    document.getElementById('toggle-ui-btn').addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
    });

    document.getElementById('toggle-code-btn').addEventListener('click', () => {
        document.getElementById('code-pane').style.display =
            document.getElementById('code-pane').style.display === 'none' ? 'flex' : 'none';
    });

    document.getElementById('toggle-mobile-btn').addEventListener('click', () => {
        const frame = document.getElementById('site-frame');
        frame.style.width = frame.style.width === '375px' ? '100%' : '375px';
        frame.style.margin = frame.style.width === '375px' ? '0 auto' : '0';
    });

    document.getElementById('wipe-btn').addEventListener('click', () => {
        if(confirm("Wipe entire canvas?")) {
            livePreview.innerHTML = "";
            updateCodeView();
        }
    });

    // --- 5. Assets ---
    document.getElementById('add-asset-btn').addEventListener('click', () => {
        const url = prompt("Enter Asset URL:");
        if (url) {
            const div = document.createElement('div');
            div.className = 'asset-item';
            div.innerHTML = `<span style="font-size:10px; overflow:hidden;">${url.substring(0,20)}...</span>`;
            div.onclick = () => {
                navigator.clipboard.writeText(url);
                alert("URL copied to clipboard!");
            };
            document.getElementById('asset-list').appendChild(div);
        }
    });

    // --- 6. Code Production ---
    function updateCodeView() {
        const cleanHTML = livePreview.innerHTML
            .replace(/outline:.*?px solid.*?;/g, '')
            .replace(/cursor: move;/g, '');
        codeBox.value = `<div class="site-wrapper">\n${cleanHTML}\n</div>`;
    }

    function getRotationDegrees(obj) {
        const matrix = window.getComputedStyle(obj).getPropertyValue("transform");
        if(matrix !== 'none') {
            const values = matrix.split('(')[1].split(')')[0].split(',');
            return Math.round(Math.atan2(values[1], values[0]) * (180/Math.PI));
        }
        return 0;
    }

    // --- 7. Export ---
    document.getElementById('download-btn').addEventListener('click', () => {
        const blob = new Blob([codeBox.value], {type: "text/html"});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "pixelb8_export.html";
        link.click();
    });
});