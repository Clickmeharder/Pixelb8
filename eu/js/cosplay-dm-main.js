// JavaScript for custom file butt
document.getElementById('customFileButton').addEventListener('click', function() {
    document.getElementById('fileInput').click(); // Simulate click on hidden file input
});

document.getElementById('fileInput').addEventListener('change', function() {
    const fileName = this.files[0] ? this.files[0].name : 'No file chosen';
    document.getElementById('fileName').textContent = fileName; // Display the file name
});
