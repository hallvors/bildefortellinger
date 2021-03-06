// uses global variable slideshow from slideshow.js

var AudioContext = window.AudioContext || window.webkitAudioContext;
var recorder, input, theStream;
var pupilName, project;
var meta = [];
var startTime;

slideshow.onChange = function() {
	if (startTime) {
		var elapsed = (new Date).getTime() - startTime.getTime();
		meta.push({
			timestamp: elapsed,
			image: slideshow.currentSlide,
			_key: parseInt(Math.random() * 1000000),
		});
	}
}

function start() {
	if (slideshow.currentSlide !== 0 && !recorder) {
		// let's make sure they start first recording looking at first picture..
		slideshow.goTo(0);
	}
	meta.push({timestamp:0, image: slideshow.currentSlide});
	navigator.mediaDevices.getUserMedia({audio: true}).then(function(stream) {
		theStream = stream;
		var audioContext = new AudioContext();
		input = audioContext.createMediaStreamSource(stream);
		recorder = new WebAudioRecorder(input, {
			workerDir: '/js/web-audio-recorder/lib-minified/',
			encoding: 'mp3',
		});
		recorder.onComplete = function(recorder, blob) {
			var pupilName = document.getElementById('name').value;
			var project = document.getElementById('project').value;

			var xhr = new XMLHttpRequest();
			xhr.open('post', '/api/submit', true);
			if (pupilName) {
				xhr.setRequestHeader('X-bildefortellinger-name', pupilName)
			}
			if (project) {
				xhr.setRequestHeader('X-bildefortellinger-project', project)
			}
			xhr.onload = function() {
				document.body.className = '';
				document.getElementById('state-indicator').src = '/images/rec.png';
				alert('Ferdig! Opptaket er sendt til lærer. Tusen takk :)');
			}
			var fd = new FormData();
			fd.append('mp3', blob, 'opptak.mp3');
			fd.append('meta', JSON.stringify(meta));
			meta = [];
			startTime = null;
			xhr.send(fd);
		}

		recorder.setOptions({
		  timeLimit:360,
		  encodeAfterRecord:true,
	      mp3: {bitRate: 160}
	    });

		startTime = new Date();
		//start the recording process
		recorder.startRecording();
	});
}

function cancel() {
	if (recorder) {
		recorder.cancelRecording();
		document.body.className = '';
		meta = [];
	}
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
		document.body.className = 'sending';
	} else {
		start();
		document.body.className = 'recording';
	}
}

addEventListener('DOMContentLoaded', function(){
	var btn = document.createElement('button');
	document.getElementById('toolbar').appendChild(btn);
	btn.className = 'rec-btn';
	btn.onclick = toggle;
	btn.appendChild(document.createTextNode('  '));
	document.getElementById('waste-btn').onclick = cancel;
	document.getElementById('send-btn').onclick = toggle;
}, false);
