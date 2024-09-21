function saveHighScore(playerName, playerScore) {
    // Get current leaderboard from localStorage or initialize an empty array
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // Add the new player score to the leaderboard
    leaderboard.push({ name: playerName, score: playerScore });

    // Sort the leaderboard by score in descending order
    leaderboard.sort((a, b) => b.score - a.score);

    // Limit the leaderboard to top 10 entries (optional)
    leaderboard = leaderboard.slice(0, 10);

    // Save the updated leaderboard back to localStorage
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
}
function toggleHeader() {
    const headerRow = document.getElementById('header-row');
    const toggleButton = document.getElementById('toggleHeaderButton');
    
    if (headerRow.style.display === 'none') {
        headerRow.style.display = 'flex'; // Show the header
        toggleButton.innerText = '-'; // Change button text
    } else {
        headerRow.style.display = 'none'; // Hide the header
        toggleButton.innerText = '+'; // Change button text
    }
}
