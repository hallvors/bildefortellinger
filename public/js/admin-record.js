// uses global variable slideshow from slideshow.js

var AudioContext = window.AudioContext || window.webkitAudioContext;
var recorder, input, theStream;
var project;

function start() {
	navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
		theStream = stream;
		var audioContext = new AudioContext();
		input = audioContext.createMediaStreamSource(stream);
		recorder = new WebAudioRecorder(input, {
			workerDir: '/js/web-audio-recorder/lib-minified/',
			encoding: 'wav',
		});
		recorder.onComplete = function(recorder, blob) {
			var project = document.getElementById('project').value;

			var xhr = new XMLHttpRequest();
			xhr.open('post', '/admin/helprecording', true);
			xhr.onload = function() { location.reload(); }
			var fd = new FormData();
			fd.append('helprecording', blob, 'opptak.wav');
			fd.append('project', project);
			xhr.send(fd);
		}

		recorder.setOptions({
		  timeLimit:360,
		  encodeAfterRecord:true,
	    });

		//start the recording process
		recorder.startRecording();
	});
}

function stop() {
	document.getElementById('helprecordbtn').className = 'loading';
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
	var btn = document.getElementById('helprecordbtn');
	btn.onclick = toggle;
	btn.appendChild(document.createTextNode(' 🔴 '));
}, false);
