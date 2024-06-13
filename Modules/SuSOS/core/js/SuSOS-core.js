document.addEventListener('DOMContentLoaded', () => {
    const powerCheckbox = document.getElementById('powercheckbox');
    const hudMonitorPower = document.querySelector('.hudMonitorPower');

    powerCheckbox.addEventListener('change', function() {
        hudMonitorPower.classList.toggle('visible', this.checked);
        hudMonitorPower.classList.toggle('hidden', !this.checked);
    });

    const windowIds = [
        'hud-Applets', 'hud-Example', 'hud-NewDigs', 'hud-Settings', 'hud-AudioSettings',
        'hud-EuTools', 'hud-EuItemSorter', 'hud-OrdinanceJuxtapositioner', 'hud-EuStashManager',
        'hud-EuCalender', 'hud-EuEventPlanner', 'hud-EuItemstash', 'hud-EuItemStashAdditions',
        'hud-EuEditStashMenu', 'hud-EuRestockItemStashMenu', 'hud-EuSellitemsMenu', 
        'hud-EuStashpriceListMenu', 'hud-Games', 'hud-sus-snake'
    ];

    const tabButtons = {};
    const windows = document.querySelectorAll('.window');
    const draggableHeaders = document.querySelectorAll('.draggable-header');
    const maxButtons = document.querySelectorAll('.maxbutt');
    const hudMenu = document.getElementById('hudstartmenu');

    const makeDraggable = (header, windowElement) => {
        // Draggable implementation here
    };

    draggableHeaders.forEach(header => {
        const windowElement = header.closest('[data-draggable="true"]');
        if (windowElement) makeDraggable(header, windowElement);
    });

    windows.forEach(window => {
        window.addEventListener('click', () => handleWindowClick(window));
    });

    const handleWindowClick = (clickedWindow) => {
        windows.forEach(window => window.classList.remove('current', 'currentwindow'));
        clickedWindow.classList.add('current', 'currentwindow');
    };

    const addTabButton = (windowId, windowName) => {
        // Add tab button implementation here
    };

    const closeWindowAndTab = (windowId) => {
        // Close window and remove tab button implementation here
    };

    const toggleWindowVisibility = (windowId) => {
        const windowElement = document.getElementById(windowId);
        if (windowElement) {
            if (windowElement.classList.contains('hidden')) {
                windowElement.classList.remove('hidden');
                addTabButton(windowId, windowId);
            }
        }
    };

    const closeAllWindows = () => {
        windowIds.forEach(windowId => {
            const windowElement = document.getElementById(windowId);
            if (windowElement) windowElement.classList.add('hidden');
        });
    };

    closeAllWindows();

    const maximizeWindow = (windowElement, maxButton) => {
        // Maximize window implementation here
    };

    const minimizeWindow = (windowElement, maxButton) => {
        // Minimize window implementation here
    };

    maxButtons.forEach(maxButton => {
        maxButton.addEventListener('click', function() {
            const windowElement = maxButton.closest('.window');
            if (windowElement.classList.contains('maxed')) {
                minimizeWindow(windowElement, maxButton);
            } else {
                maximizeWindow(windowElement, maxButton);
            }
        });
    });

    const buttonsConfig = [
        // Define buttons configuration here
    ];

    buttonsConfig.forEach(button => {
        const btnElement = document.createElement('button');
        btnElement.id = button.id;
        btnElement.className = button.type;
        btnElement.textContent = button.label;
        hudMenu.appendChild(btnElement);

        if (button.subButtons) {
            const subBox = document.createElement('div');
            subBox.className = 'collapsingbox column';
            button.subButtons.forEach(subButton => {
                const subBtnElement = document.createElement('button');
                subBtnElement.className = 'hudsubmenuButt';
                subBtnElement.dataset.windowId = subButton.id;
                subBtnElement.textContent = subButton.label;
                subBox.appendChild(subBtnElement);
            });
            hudMenu.appendChild(subBox);
        }
    });

    hudMenu.addEventListener('click', function(event) {
        const target = event.target;
        if (target.classList.contains('hudsubmenuButt')) {
            toggleWindowVisibility(target.dataset.windowId);
        }
    });
});
