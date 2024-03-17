//Pshoeder.js
    const pageContainer = document.getElementById('pageContainer');

    // Function to load content into the div
    function loadPage(url) {
        fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.text();
            })
            .then(html => {
                pageContainer.innerHTML = html;
            })
            .catch(error => {
                console.error('There was a problem fetching the content:', error);
            });
    }