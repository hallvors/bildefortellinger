(function () {
	let audio = document.getElementById('help-audio');
	addEventListener('DOMContentLoaded', function(e) {
		if (!audio) {
			return;
		}
		var btn = document.createElement('button');
		document.getElementById('toolbar').appendChild(btn);
		btn.onclick = function() {audio.play();};
		btn.appendChild(document.createTextNode(' ℹ️ '));
	}, false);
})();
