// Get the URL parameters
const urlParams = new URLSearchParams(window.location.search);
const points = urlParams.get('points');  // Extract the points from the query parameter

// Update the points in the result screen
document.querySelector('h3:nth-of-type(1)').textContent = `Points: ${points}`;

// You can also add logic to track and update the streak if needed
// For now, let's assume a static streak update
const streak = localStorage.getItem('streak') || 1;  // Get current streak or default to 1
document.querySelector('h3:nth-of-type(2)').textContent = `Streak: ${streak}`;

// Back to Initial Screen Button
document.getElementById('back-btn').addEventListener('click', function() {
    window.location.href = 'initialscreen.html';  // Navigate back to initial screen
});