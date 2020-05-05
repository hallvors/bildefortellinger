
var slideshow = new Siema({
	/* onChange is only supported in the options object
	* I'd like it to work when assigned as a property on the
	* object. Why not?
	*/
	onChange: function() {
		if (slideshow.onChange) {
			slideshow.onChange.apply(this, arguments);
		}
	}
});

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
	btn.className = 'prev-btn';
	btn.appendChild(document.createTextNode(' << '));
	btn = document.createElement('button');
	document.getElementById('toolbar').appendChild(btn);
	btn.onclick = next;
	btn.className = 'next-btn';
	btn.appendChild(document.createTextNode(' >> '));
}, false);
