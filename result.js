// Retrieve the timeout status and points from localStorage
const timeout = localStorage.getItem('timeout');
const points = localStorage.getItem('points');

// Update the header message based on whether the user ran out of time
if (timeout === 'true') {
    document.querySelector('h1').textContent = "You ran out of time :(";
} else {
    document.querySelector('h1').textContent = "You got it!";
    // Display the points only if the user did not run out of time
    document.querySelector('h3:nth-of-type(1)').textContent = `Points: ${points}`;
}

// You can also add logic to track and update the streak if needed
const streak = localStorage.getItem('streak') || 1;  // Get current streak or default to 1
document.querySelector('h3:nth-of-type(2)').textContent = `Streak: ${streak}`;

// Back to Initial Screen Button
document.getElementById('back-btn').addEventListener('click', function() {
    window.location.href = 'initialscreen.html';  // Navigate back to initial screen
});