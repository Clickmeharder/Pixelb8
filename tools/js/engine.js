/**
 * PIXELB8 Datasphere Creation Tool Engine V5
 * Fully Fixed – Core Logic + Project System
 */

/* ==============================
   GLOBAL STATE (MUST BE GLOBAL)
============================== */

let projects = [];
let currentProjectIndex = 0;
let selectedPageIndex = 0;
let selectedElement = null;
/* ==============================
   PROJECT PERSISTENCE
============================== */

function createNewProject(name = "New Project") {
    return {
        name,
        pages: [
            { name: "Home", content: "" }
        ],
        assets: [],
        settings: {
            neon: "#00ff41",
            bg: "#0d0d0d"
        },
        files: {
            "css/style.css": "/* Your CSS */",
            "js/script.js": "// Your JS"
        }
    };
}

function saveProjects() {
    localStorage.setItem("pixelb8-projects", JSON.stringify(projects));
}

function loadProjects() {
    const data = localStorage.getItem("pixelb8-projects");
    if (data) {
        projects = JSON.parse(data);
    } else {
        projects = [createNewProject("My First Site")];
        saveProjects();
    }
}

    const livePreview = document.getElementById('live-preview');
    const codeBox = document.getElementById('code-box');
    const inspector = document.getElementById('inspector');
    const gridSnap = document.getElementById('grid-snap');
    const sidebar = document.getElementById('sidebar');

    const projectList = document.getElementById("projects-list");
	const newProjectBtn = document.getElementById("new-project-btn");
	const deleteProjectBtn = document.getElementById("delete-project-btn");
    const pagesList = document.getElementById('pages-list');

    const addPageBtn = document.getElementById('add-page-btn');
    const deletePageBtn = document.getElementById('delete-page-btn');


    /* ==============================
       HELPERS
    ============================== */

    function getCurrentProject() {
        return projects[currentProjectIndex];
    }

    function getCurrentPage() {
        return getCurrentProject().pages[selectedPageIndex];
    }

    function saveCurrentPage() {
        getCurrentPage().content = livePreview.innerHTML;
        saveProjects();
    }

    function loadCurrentPage() {
        livePreview.innerHTML = getCurrentPage().content || "";

        // Rebind drag events
        const widgets = livePreview.querySelectorAll('.widget');
        widgets.forEach(w => makeElementInteractable(w));

        updateCodeView();
    }

    /* ==============================
       PROJECT UI
    ============================== */

	function renderProjects() {
		projectList.innerHTML = "";

		projects.forEach((proj, index) => {
			const li = document.createElement("li");
			li.textContent = proj.name;
			li.style.cursor = "pointer";
			li.style.padding = "5px";
			li.style.userSelect = "none";

			// Highlight the selected project
			if (index === currentProjectIndex) {
				li.style.background = "#222";
				li.style.color = "var(--neon)";
				li.style.borderLeft = "3px solid var(--neon)";
			}

			// Single click = select
			li.addEventListener("click", (e) => {
				e.stopPropagation();
				if (currentProjectIndex === index) return; // already selected

				saveCurrentPage();
				currentProjectIndex = index;
				selectedPageIndex = 0;

				renderPages();
				loadCurrentPage();

				// Update highlight on all items
				projectList.querySelectorAll("li").forEach((el, i) => {
					if (i === currentProjectIndex) {
						el.style.background = "#222";
						el.style.color = "var(--neon)";
						el.style.borderLeft = "3px solid var(--neon)";
					} else {
						el.style.background = "";
						el.style.color = "#fff";
						el.style.borderLeft = "none";
					}
				});
			});

			// Double click = rename
			li.addEventListener("dblclick", (e) => {
				e.stopPropagation();

				const input = document.createElement("input");
				input.type = "text";
				input.value = proj.name;
				input.style.width = "90%";
				input.style.fontSize = "0.9em";
				input.style.padding = "2px";

				li.innerHTML = "";
				li.appendChild(input);
				input.focus();

				function finishRename() {
					const newName = input.value.trim();
					if (newName) {
						proj.name = newName;
						saveProjects();
					}
					renderProjects();
				}

				input.addEventListener("blur", finishRename);
				input.addEventListener("keydown", (e) => {
					if (e.key === "Enter") finishRename();
					if (e.key === "Escape") renderProjects();
				});
			});

			projectList.appendChild(li);
		});
	}
	
    /* ==============================
       PAGE SYSTEM
    ============================== */

    function renderPages() {
        pagesList.innerHTML = "";
        const pages = getCurrentProject().pages;

        pages.forEach((page, index) => {
            const li = document.createElement('li');
            li.textContent = page.name;
            li.style.cursor = 'pointer';
            li.style.padding = '5px';
            li.style.borderBottom = '1px solid #222';

            if (index === selectedPageIndex) {
                li.style.background = '#222';
                li.style.color = 'var(--neon)';
                li.style.borderLeft = '3px solid var(--neon)';
            }

            li.onclick = () => {
                saveCurrentPage();
                selectedPageIndex = index;
                renderPages();
                loadCurrentPage();
            };

            pagesList.appendChild(li);
        });
    }
	
    /* ==============================
       WIDGET CREATION
    ============================== */
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
            case 'image': el.innerHTML = `<img src="https://picsum.photos/200" style="width:100%; pointer-events:none;">`; break;
            case 'button': el.innerHTML = `<button style="padding:10px 20px;">Click Me</button>`; break;
            case 'video': el.innerHTML = `<div style="background:#000; aspect-ratio:16/9; display:flex; align-items:center; justify-content:center; color:#fff;">Video Placeholder</div>`; break;
            case 'shape': 
                el.style.background = 'var(--neon)';
                el.style.height = '100px';
                el.style.width = '100px';
                break;
        }

        makeElementInteractable(el);
        livePreview.appendChild(el);
        selectElement(el);

        saveCurrentPage();
        updateCodeView();
    }

    /* ==============================
       DRAG + SELECT
    ============================== */

    function makeElementInteractable(el) {
        el.addEventListener('mousedown', e => {

            if (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') return;

            selectElement(el);

            const rect = el.getBoundingClientRect();
            const shiftX = e.clientX - rect.left;
            const shiftY = e.clientY - rect.top;
            const snap = parseInt(gridSnap?.value) || 1;

            function moveAt(pageX, pageY) {
                let x = pageX - shiftX - livePreview.getBoundingClientRect().left;
                let y = pageY - shiftY - livePreview.getBoundingClientRect().top;

                el.style.left = Math.round(x / snap) * snap + 'px';
                el.style.top = Math.round(y / snap) * snap + 'px';
            }

            function onMouseMove(e) { moveAt(e.pageX, e.pageY); }

            document.addEventListener('mousemove', onMouseMove);

            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', onMouseMove);
                saveCurrentPage();
                updateCodeView();
            }, { once: true });
        });
    }

    function selectElement(el) {
        if (selectedElement) selectedElement.style.outline = 'none';
        selectedElement = el;
        selectedElement.style.outline = '2px solid var(--neon)';
        if (inspector) inspector.style.display = 'block';
    }

    /* ==============================
       CODE VIEW
    ============================== */

    function updateCodeView() {
        const cleanHTML = livePreview.innerHTML
            .replace(/outline:.*?px solid.*?;/g, '')
            .replace(/cursor: move;/g, '');

        if (codeBox) {
            codeBox.value = `<div class="site-wrapper">\n${cleanHTML}\n</div>`;
        }
    }
/* ==============================
   MAIN ENGINE
============================== */

document.addEventListener('DOMContentLoaded', () => {

    loadProjects();



    newProjectBtn.addEventListener("click", () => {
        const name = prompt("Project name?");
        if (!name) return;

        projects.push(createNewProject(name));
        currentProjectIndex = projects.length - 1;
        selectedPageIndex = 0;

        saveProjects();
        renderProjects();
        renderPages();
        loadCurrentPage();
    });
	deleteProjectBtn?.addEventListener("click", () => {

		if (projects.length <= 1) {
			alert("You can't delete the last project!");
			return;
		}

		const currentProject = getCurrentProject();

		if (!confirm(`Delete project "${currentProject.name}"?`)) return;

		// Remove the project
		projects.splice(currentProjectIndex, 1);

		// Reset index safely
		currentProjectIndex = 0;
		selectedPageIndex = 0;

		saveProjects();
		renderProjects();
		renderPages();
		loadCurrentPage();
	});
    /* ==============================
       PAGE SYSTEM
    ============================== */



    addPageBtn.addEventListener('click', () => {
        const pageName = prompt('Enter new page name:');
        if (!pageName) return;

        saveCurrentPage();

        getCurrentProject().pages.push({
            name: pageName,
            content: ""
        });

        selectedPageIndex = getCurrentProject().pages.length - 1;

        saveProjects();
        renderPages();
        loadCurrentPage();
    });

    deletePageBtn.addEventListener('click', () => {
        const pages = getCurrentProject().pages;

        if (pages.length <= 1) {
            alert("Can't delete the last page!");
            return;
        }

        if (confirm(`Delete ${pages[selectedPageIndex].name}?`)) {
            pages.splice(selectedPageIndex, 1);
            selectedPageIndex = 0;

            saveProjects();
            renderPages();
            loadCurrentPage();
        }
    });

    /* ==============================
       WIDGET CREATION
    ============================== */

    document.querySelectorAll('[data-widget]').forEach(btn => {
        btn.addEventListener('click', () => {
            createWidget(btn.getAttribute('data-widget'));
        });
    });

    document.getElementById('toggle-ui-btn')?.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
    });

    document.getElementById('toggle-code-btn')?.addEventListener('click', () => {
        const pane = document.getElementById('code-pane');
        pane.style.display = pane.style.display === 'none' ? 'flex' : 'none';
    });

    document.getElementById('download-btn')?.addEventListener('click', () => {
        const blob = new Blob([codeBox.value], {type: "text/html"});
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "pixelb8_export.html";
        link.click();
    });

    /* ==============================
       INIT
    ============================== */

    renderProjects();
    renderPages();
    loadCurrentPage();
});