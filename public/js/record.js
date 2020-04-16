// uses global variable slideshow from slideshow.js

var AudioContext = window.AudioContext || window.webkitAudioContext;
var recorder, input, theStream;

function start() {
	if (slideshow.currentSlide !== 0 && !recorder) {
		// let's make sure they start first recording looking at first picture..
		slideshow.goTo(0);
	}
	navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
		theStream = stream;
		var audioContext = new AudioContext();
		input = audioContext.createMediaStreamSource(stream);
		recorder = new WebAudioRecorder(input, {
			workerDir: '/js/web-audio-recorder/lib-minified/',
			encoding: 'mp3',
		});
		recorder.onComplete = function(recorder, blob) {
			var xhr = new XMLHttpRequest();
			xhr.open('post', '/api/submit', true);
			if (typeof pupilName !== 'undefined') {
				xhr.setRequestHeader('X-bildefortellinger-name', pupilName)
			}
			xhr.onload = function() { alert('Ferdig! Tusen takk :)'); }
			var fd = new FormData();
			fd.append('mp3', blob, 'opptak.mp3');
			xhr.send(fd);
		}

		recorder.setOptions({
		  timeLimit:360,
		  encodeAfterRecord:true,
	      mp3: {bitRate: 160}
	    });

		//start the recording process
		recorder.startRecording();
	});
}

function stop() {
	if (recorder) {
		theStream.getAudioTracks()[0].stop();
		recorder.finishRecording();
	}
}

function toggle(e) {
	if (recorder && recorder.isRecording()) {
		stop();
		e.target.textContent = ' 🔴 ';
	} else {
		start();
		e.target.textContent = ' ⏹️ ';
	}
}

addEventListener('DOMContentLoaded', function(){
	var btn = document.createElement('button');
	document.getElementById('toolbar').appendChild(btn);
	btn.onclick = toggle;
	btn.appendChild(document.createTextNode(' 🔴 '));
}, false);
