var currentMeta;
var currentAudio;
var adminImages = [];

function play(link) {
	if (currentAudio) {
		stop();
		return false;
	}
	console.log(link);
	var file = link.href;
	for(var elms = document.getElementsByTagName('audio'), i = 0, el; el = elms[i]; i++) {
		if (el.src === link.href) {
			currentAudio = el;
			currentMeta = JSON.parse(el.getAttribute('data-meta'));
			break;
		}
	}

	if (currentAudio) {
		adminImages = document.getElementsByClassName('admin-images')[0]
			.getElementsByTagName('img');
		if (adminImages.length && (currentMeta && currentMeta.length)) {
			adminImages[0].className = 'highlight-image';
		}
		currentAudio.addEventListener('timeupdate', highlightImage, false);
		currentAudio.play();
		currentAudio.addEventListener('ended', stop, false);
		link.firstChild.textContent = '⏹️';
		return false;
	}
}

function stop() {
	for(var elms = document.getElementsByTagName('a'), i = 0, el; el = elms[i]; i++) {
		if (currentAudio.src === el.href) {
			el.firstChild.textContent = '▶️';
		}
	}
	currentAudio.removeEventListener('timeupdate', highlightImage, false);
	currentAudio.removeEventListener('ended', stop, false);

	currentAudio = null;
	currentMeta = null;
	var img = document.getElementsByClassName('highlight-image')[0];
	if (img) {
		img.className = '';
	}
}

function highlightImage(event) {
	if (!(currentMeta && currentMeta.length)) {
		return;
	}
	var current = event.target.currentTime;

	if (!adminImages.length) {
		return;
	}

	var curImg = document.getElementsByClassName('highlight-image')[0];
	var items = currentMeta.filter(function(meta){
		return meta.timestamp <= (current * 1000)
	});
	console.log( (current * 1000) + ': highlight image ' + items.length, currentMeta)
	if (!items.length) {
		return;
	}
	if (curImg !== adminImages[items.length]) {
		curImg.className = '';
		adminImages[items.length].className = 'highlight-image';
	}
}
