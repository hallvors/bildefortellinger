var currentMeta;
var currentAudio;
var adminImages = [];

function play(link) {
	if (currentAudio) {
		stop();
		return false;
	}
	var file = link.href;
	for(var elms = document.getElementsByTagName('audio'), i = 0, el; el = elms[i]; i++) {
		if (el.src === link.href) {
			currentAudio = el;
			currentMeta = JSON.parse(el.getAttribute('data-meta'));
			var times = currentMeta.map(function(meta) {return meta.timestamp;});
			var images = currentMeta.map(function(meta) {return meta.image;});
			currentMeta = {times: times, images: images};
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
	currentAudio.pause();
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
	if (!(currentMeta && currentMeta.times.length)) {
		return;
	}

	if (!adminImages.length) {
		return;
	}

	var currentTs = parseInt(event.target.currentTime * 1000);
	var curImg = document.getElementsByClassName('highlight-image')[0];
	var chosenIndex = 0;

	for(var i = currentMeta.times.length - 1; i > -1; i--) {
		if (currentTs > currentMeta.times[i]) {
			chosenIndex = i;
			break;
		}
	}

	var imgIdx = currentMeta.images[chosenIndex];
	// maybe admin images have changed since the recording..
	if (!adminImages[imgIdx]) {
		imgIdx = adminImages.length - 1;
	}
	if (adminImages[imgIdx] !== curImg) {
		if (curImg) {
			curImg.className = '';
		}
		adminImages[imgIdx].className = 'highlight-image';
	}
}
