(function () {
	let audio = document.createElement('audio');
	audio.src = '/sound/help.wav';
	addEventListener('load', function(e) {
		var btn = document.createElement('button');
		document.getElementById('toolbar').appendChild(btn);
		btn.onclick = function() {audio.play();};
		btn.appendChild(document.createTextNode(' ℹ️ '));
	}, false);
})();
