var currentMeta;
var currentAudio;
var adminImages = [];

function play(link) {
	if (currentAudio) {
		stop();
		return false;
	}
	var file = link.href;
	for (
		var elms = document.getElementsByTagName('audio'), i = 0, el;
		(el = elms[i]);
		i++
	) {
		if (el.src === link.href) {
			currentAudio = el;
			currentMeta = JSON.parse(el.getAttribute('data-meta'));
			var times = currentMeta.map(function(meta) {
				return meta.timestamp;
			});
			var images = currentMeta.map(function(meta) {
				return meta.image;
			});
			currentMeta = { times: times, images: images };
			break;
		}
	}

	if (currentAudio) {
		adminImages = document
			.getElementsByClassName('admin-images')[0]
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
	for (
		var elms = document.getElementsByTagName('a'), i = 0, el;
		(el = elms[i]);
		i++
	) {
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

	for (var i = currentMeta.times.length - 1; i > -1; i--) {
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

window.addEventListener(
	'load',
	function() {
		var forms = document.getElementsByTagName('form'),
			theForm;
		for (var i = 0; i < forms.length; i++) {
			theForm = forms[i];
			console.log(
				theForm,
				theForm.elements.length,
				theForm.hasAttribute('data-jsform'),
				theForm.hasAttribute('data-danger')
			);
			if (theForm.hasAttribute('data-jsform')) {
				theForm.addEventListener(
					'submit',
					function(event) {
						if (event.target.hasAttribute('data-danger')) {
							if (confirm('Er du helt sikker?')) {
								jsSubmit(event, form);
							} else {
								event.preventDefault();
							}
						} else if (
							event.target.hasAttribute('data-triggeredit')
						) {
							event.preventDefault();
							event.target.removeAttribute('data-triggeredit');
							event.target.setAttribute('data-edited', true);
							var elements = event.target
								.getAttribute('data-elements')
								.split(/,\s*/g)
								.map(function(id) {
									return document.getElementById(id);
								});
							for (var j = 0; j < elements.length; j++) {
								if (elements[j].disabled) {
									elements[j].disabled = false;
									elements[j].setAttribute(
										'data-defaultdisabled',
										true
									);
								}
							}
							var btn = event.target.getElementsByTagName(
								'button'
							)[0];
							if (btn) {
								btn.setAttribute(
									'data-defaulttext',
									btn.textContent
								);
								btn.textContent = '💾';
							}
						} else if (event.target.hasAttribute('data-edited')) {
							jsSubmit(event, event.target);
							event.target.removeAttribute('data-edited');
							event.target.setAttribute('data-triggeredit', true);
						}
					},
					false
				);
			}
		}
	},
	false
);

function jsSubmit(event, form) {
	var xhr = new XMLHttpRequest();
	form.className = classListAdd(form.className, 'loading');
	xhr.open(form.method, form.action, true);
	xhr.setRequestHeader('Content-type', form.enctype);
	xhr.onreadystatechange = function() {
		if (this.readyState !== 4) {
			return;
		}
		form.className = classListRemove(form.className, 'loading');
		for (var i = 0; i < form.elements.length; i++) {
			form.elements[i].disabled =
				form.elements[i].getAttribute('data-defaultdisabled') ===
				'true';
		}
		var elements = form
			.getAttribute('data-elements')
			.split(/,\s*/g)
			.map(function(id) {
				return document.getElementById(id);
			});
		for (var i = 0; i < elements.length; i++) {
			elements[i].disabled =
				elements[i].getAttribute('data-defaultdisabled') === 'true';
		}
		var btn = form.getElementsByTagName('button')[0];
		if (btn && btn.hasAttribute('data-defaulttext')) {
			btn.textContent = btn.getAttribute('data-defaulttext');
		}
	};
	xhr.send(formDataToPayload(form));
	event.preventDefault();
}

function formDataToPayload(form) {
	var payload = [];
	for (var i = 0; i < form.elements.length; i++) {
		if (form.elements[i].name && !form.elements[i].disabled) {
			payload.push(
				encodeURIComponent(form.elements[i].name) +
					'=' +
					encodeURIComponent(form.elements[i].value)
			);
		}
	}
	var elements = event.target
		.getAttribute('data-elements')
		.split(/,\s*/g)
		.map(function(id) {
			return document.getElementById(id);
		});
	for (var i = 0; i < elements.length; i++) {
		if (elements[i].name && !elements[i].disabled) {
			payload.push(
				encodeURIComponent(elements[i].name) +
					'=' +
					encodeURIComponent(elements[i].value)
			);
		}
	}

	return payload.join('&');
}

function classListAdd(strCln, newCls) {
	var list = strCln.split(/\s+/g);
	list.push(newCls);
	return list.join(' ');
}
function classListRemove(strCln, oldCls) {
	var list = strCln.split(/\s+/g);
	list.splice(list.indexOf(oldCls, 1));
	return list.join(' ');
}
