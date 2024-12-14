//global js file

// Main tab switching logic
//-------------------------------------------------------------------------
//tab switching logic is currently only being used in sheatshop but i like it 
//- might redo main page layout
//
// Main tab switching logic
document.querySelectorAll('.tab').forEach(tab => {
	tab.addEventListener('click', () => {
		document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
		document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
		tab.classList.add('active');
		document.getElementById(tab.getAttribute('data-tab')).classList.add('active');
	});
});

// Subtab switching logic
document.querySelectorAll('.subtab').forEach(subtab => {
	subtab.addEventListener('click', () => {
		document.querySelectorAll('.subtab').forEach(st => st.classList.remove('active'));
		document.querySelectorAll('.subtab-content').forEach(sc => sc.classList.remove('active'));
		subtab.classList.add('active');
		document.getElementById(subtab.getAttribute('data-subtab')).classList.add('active');
	});
});
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', (e) => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
    document.querySelectorAll('.messages-container').forEach((c) => c.classList.remove('active'));

    btn.classList.add('active');
    const targetId = btn.getAttribute('data-target');
    document.getElementById(targetId).classList.add('active');
  });
});
//-------------------------------------------------------------------------
