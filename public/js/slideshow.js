
var slideshow = new Siema({startIndex: 1});

function next() {
	slideshow.next();
}
function previous() {
	slideshow.prev();
}

addEventListener('load', function(e) {
	var btn = document.createElement('button');
	document.getElementById('toolbar').appendChild(btn);
	btn.onclick = previous;
	btn.appendChild(document.createTextNode(' << '));
	btn = document.createElement('button');
	document.getElementById('toolbar').appendChild(btn);
	btn.onclick = next;
	btn.appendChild(document.createTextNode(' >> '));
}, false);
