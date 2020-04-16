
var slideshow = new Siema();

function next() {
	slideshow.next();
}
function previous() {
	slideshow.prev();
}

addEventListener('DOMContentLoaded', function(e) {
	var btn = document.createElement('button');
	document.getElementById('toolbar').appendChild(btn);
	btn.onclick = previous;
	btn.appendChild(document.createTextNode(' << '));
	btn = document.createElement('button');
	document.getElementById('toolbar').appendChild(btn);
	btn.onclick = next;
	btn.appendChild(document.createTextNode(' >> '));
}, false);
