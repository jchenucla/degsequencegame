document.getElementById("play-btn").addEventListener('click', function() {
  // Clear previous game data from localStorage
  localStorage.removeItem('timeout');
  localStorage.removeItem('points');
  
  // Set a 60-second countdown in localStorage
  localStorage.setItem('timer', 30); // Set the initial timer value (in seconds)
  window.location.href = 'index.html'; // Navigate to the game screen
});


// Modal
var modal = document.getElementById("instruction");
var btn = document.getElementById("how-to-play-btn");
var span = document.getElementsByClassName("close")[0];
btn.onclick = function() {
  modal.style.display = "block";
}
span.onclick = function() {
  modal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
}