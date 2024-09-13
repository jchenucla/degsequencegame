document.getElementById("play-btn").addEventListener('click', function() {
    window.location.href = 'index.html';
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