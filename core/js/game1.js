// Main tab switching logic
document.querySelectorAll('.Character-menutabs .tab').forEach(tab => {
    tab.addEventListener('click', () => {
        // Remove active class from all tabs and content
        document.querySelectorAll('.Character-menutabs .tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('#character-menu > div:not(.Character-menutabs)').forEach(c => c.classList.remove('active'));

        // Add active class to the clicked tab and its associated content
        tab.classList.add('active');
        const targetId = tab.getAttribute('data-tab').replace('char-', 'character-'); // Map data-tab to content IDs
        document.getElementById(targetId).classList.add('active');
    });
});

// Subtab switching logic
document.querySelectorAll('#character-crafting .subtab').forEach(subtab => {
    subtab.addEventListener('click', () => {
        // Remove active class from all subtabs and content
        document.querySelectorAll('#character-crafting .subtab').forEach(st => st.classList.remove('active'));
        document.querySelectorAll('#character-crafting .subtab-content').forEach(sc => sc.classList.remove('active'));

        // Add active class to the clicked subtab and its associated content
        subtab.classList.add('active');
        const targetId = subtab.getAttribute('data-subtab');
        document.getElementById(targetId).classList.add('active');
    });
});
