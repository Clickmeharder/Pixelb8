function displayLeaderboard() {
    // Get the leaderboard from localStorage
    let leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];

    // Get the leaderboard container (could be a div in your HTML)
    const leaderboardContainer = document.getElementById('leaderboard');

    // Clear any existing content
    leaderboardContainer.innerHTML = '';

    // Loop through the leaderboard and display the entries
    leaderboard.forEach((entry, index) => {
        const playerEntry = document.createElement('div');
        playerEntry.innerHTML = `${index + 1}. ${entry.name} - ${entry.score}`;
        leaderboardContainer.appendChild(playerEntry);
    });
}