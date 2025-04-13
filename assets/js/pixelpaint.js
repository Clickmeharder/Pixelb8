
function initPixelPen() {
    const canvas = document.getElementById('pixelpaint');
    const ctx = canvas.getContext('2d');
    let painting = false;
    let color = '#000000';
    let lineWidth = 5;
    let isEraser = false;
    let isDrawing = true;
	let brushType = 'round';
    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        restoreDrawing();
    }

    function startPosition(e) {
        if (!isDrawing) return;
        painting = true;
        draw(e);
    }

    function endPosition() {
        painting = false;
        ctx.beginPath();
        saveDrawing();
    }

	function draw(e) {
		if (!painting || !isDrawing) return;

		ctx.lineWidth = lineWidth;
		ctx.lineCap = brushType === 'square' ? 'butt' : 'round';
		ctx.globalCompositeOperation = isEraser ? 'destination-out' : 'source-over';
		if (!isEraser) ctx.strokeStyle = color;

		if (brushType === 'spray') {
			const density = 10;
			for (let i = 0; i < density; i++) {
				const offsetX = Math.random() * lineWidth - lineWidth / 2;
				const offsetY = Math.random() * lineWidth - lineWidth / 2;
				ctx.beginPath();
				ctx.arc(e.clientX + offsetX, e.clientY + offsetY, 1, 0, 2 * Math.PI);
				ctx.fillStyle = isEraser ? 'rgba(0,0,0,1)' : color;
				ctx.fill();
			}
		} else {
			ctx.lineTo(e.clientX, e.clientY);
			ctx.stroke();
			ctx.beginPath();
			ctx.moveTo(e.clientX, e.clientY);
		}
	}

    canvas.addEventListener('mousedown', startPosition);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', endPosition);
    canvas.addEventListener('mouseout', endPosition);
    window.addEventListener('resize', () => {
        saveDrawing();
        setCanvasSize();
    });

    function saveDrawing() {
        try {
            localStorage.setItem('savedPixelPen', canvas.toDataURL());
        } catch (e) {
            console.warn('Could not save drawing:', e);
        }
    }

    function restoreDrawing() {
        const saved = localStorage.getItem('savedPixelPen');
        if (saved) {
            const img = new Image();
            img.onload = () => ctx.drawImage(img, 0, 0);
            img.src = saved;
        }
    }

    // ===== UI CONTROLS =====
    const controls = document.getElementById('main-settings-controls');
	controls.innerHTML = `
		<label>Brush Size:
			<input type="range" min="1" max="50" value="${lineWidth}" id="brushSize">
		</label><br>

		<label>Brush Type:
			<select id="brushType">
				<option value="round">🖊️ Round</option>
				<option value="square">▣ Square</option>
				<option value="spray">☁️ Spray</option>
			</select>
		</label><br>

		<label>Color:
			<input type="color" id="colorPicker" value="${color}">
		</label><br>

		<div id="quickPalette">
			<span class="color-swatch" style="background: red" data-color="#ff0000"></span>
			<span class="color-swatch" style="background: green" data-color="#00ff00"></span>
			<span class="color-swatch" style="background: blue" data-color="#0000ff"></span>
			<span class="color-swatch" style="background: yellow" data-color="#ffff00"></span>
			<span class="color-swatch" style="background: black" data-color="#000000"></span>
			<span class="color-swatch" style="background: white; border: 1px solid #ccc;" data-color="#ffffff"></span>
		</div><br>

		<button id="toggleDraw">🖊️ Toggle Draw</button>
		<button id="eraser">🧽 Eraser</button>
		<button id="fill">🪣 Fill</button>
		<button id="clearCanvas">🗑️ Clear All</button>
		<button id="toggleCanvas">🪟 Toggle Canvas</button>
	`;

    document.getElementById('brushSize').addEventListener('input', (e) => {
        lineWidth = parseInt(e.target.value);
    });

    document.getElementById('colorPicker').addEventListener('input', (e) => {
        color = e.target.value;
    });

    document.getElementById('toggleDraw').addEventListener('click', () => {
        isDrawing = !isDrawing;
    });

	const eraserBtn = document.getElementById('eraser');
	eraserBtn.addEventListener('click', () => {
		isEraser = !isEraser;
		eraserBtn.classList.toggle('active', isEraser); // Optional styling
	});
	document.getElementById('brushType').addEventListener('change', (e) => {
		brushType = e.target.value;
	});

	document.querySelectorAll('.color-swatch').forEach(swatch => {
		swatch.addEventListener('click', (e) => {
			color = swatch.getAttribute('data-color');
			document.getElementById('colorPicker').value = color;
		});
	});
    document.getElementById('fill').addEventListener('click', () => {
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = color;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveDrawing();
    });

    document.getElementById('clearCanvas').addEventListener('click', () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        localStorage.removeItem('savedPixelPen');
    });

    document.getElementById('toggleCanvas').addEventListener('click', () => {
        canvas.style.display = canvas.style.display === 'none' ? 'block' : 'none';
    });

    // Close (minimize) controller
    document.querySelector('.close-btn').addEventListener('click', () => {
        const panel = document.getElementById('pixelpen-controller');
        panel.style.display = 'none';

        const reopenBtn = document.createElement('button');
        reopenBtn.innerText = '🎨 Open PixelPen';
        reopenBtn.style.position = 'fixed';
        reopenBtn.style.bottom = '10px';
        reopenBtn.style.right = '10px';
        reopenBtn.style.zIndex = 9999;
        reopenBtn.onclick = () => {
            panel.style.display = 'block';
            reopenBtn.remove();
        };
        document.body.appendChild(reopenBtn);
    });

    // Initialize canvas
    setCanvasSize();
    restoreDrawing();
}

document.addEventListener('DOMContentLoaded', initPixelPen);