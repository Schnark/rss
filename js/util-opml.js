/*global util*/
/*global MozActivity*/
(function () {
"use strict";

function getOpmlFile (callback) {
	var pick;
	if (window.MozActivity) {
		pick = new MozActivity({
			name: 'pick',
			data: {
				type: [
					'application/xml',
					'text/xml',
					'text/x-opml',
					//no Firefox OS app explicitely allows picking the above types
					//but actually exactly those that allow PDF are good
					'application/pdf'
				]
			}
		});

		pick.onsuccess = function () {
			try {
				callback(this.result.blob);
			} catch (e) {
				callback();
			}
		};

		pick.onerror = function () {
			callback();
		};
	} else {
		pick = document.createElement('input');
		pick.type = 'file';
		pick.style.display = 'none';
		document.getElementsByTagName('body')[0].appendChild(pick);
		pick.addEventListener('change', function () {
			var file = pick.files[0];
			if (file) {
				callback(file);
			} else {
				callback();
			}
			document.getElementsByTagName('body')[0].removeChild(pick);
		}, false);
		pick.click();
	}
}

function readFile (file, callback) {
	var reader = new FileReader();
	reader.onload = function (e) {
		var doc = new DOMParser().parseFromString(e.target.result, 'application/xml');
		if (doc.getElementsByTagName('parsererror').length) {
			callback(false);
		}
		callback(doc);
	};
	reader.onerror = function () {
		callback(false);
	};
	reader.readAsText(file);
}

function parseOpml (xml) {
	var feeds = [], outlines = xml.getElementsByTagName('outline'), outline, type, url, title, pause, noProxy, filter, i;
	for (i = 0; i < outlines.length; i++) {
		outline = outlines[i];
		type = outline.getAttribute('type');
		if (type !== 'rss') {
			continue;
		}
		url = outline.getAttribute('xmlUrl');
		if (!url) {
			continue;
		}
		title = outline.getAttribute('title') || outline.getAttribute('text') || util.titleFromUrl(url);
		pause = Number(outline.getAttributeNS('https://schnark.github.io/rss', 'pause'));
		if (isNaN(pause) || pause < 0) {
			pause = 0;
		}
		noProxy = outline.hasAttributeNS('https://schnark.github.io/rss', 'no-proxy');
		filter = outline.getAttributeNS('https://schnark.github.io/rss', 'filter');
		try {
			filter = JSON.parse(filter);
			if (!filter.rules.length) {
				filter = false;
			}
		} catch (e) {
			filter = false;
		}
		feeds.push({title: title, url: url, pause: pause, noProxy: noProxy, filter: filter});
	}
	return feeds;
}

function openOpml (callback) {
	getOpmlFile(function (file) {
		readFile(file, callback);
	});
}

util.openOpml = openOpml;
util.readFile = readFile;
util.parseOpml = parseOpml;

})();