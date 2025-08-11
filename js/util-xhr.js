/*global util*/
util.getXML =
(function () {
"use strict";

var xhrQueue = [],
	xhrRunning = 0,
	maxXhrRunning = 3,
	simulationUrls = ['test/mozilla1.rss', 'test/mozilla2.rss'];

function workXhrQueue (xhr) {
	if (!xhr) {
		xhrRunning--;
	} else {
		xhrQueue.push(xhr);
	}
	while (xhrRunning < maxXhrRunning && xhrQueue.length) {
		xhr = xhrQueue.shift();
		xhr.send();
		xhrRunning++;
	}
}

function getXmlViaProxy (url, proxy, speed, callback) {
	var xhr;
	switch (speed) {
	case 0:
		maxXhrRunning = proxy === false ? 6 : 4;
		break;
	case 1:
		maxXhrRunning = proxy === false ? 4 : 3;
		break;
	case 2:
		maxXhrRunning = 1;
	}
	if (proxy === false) { //for a privileged app
		xhr = new XMLHttpRequest({mozAnon: true, mozSystem: true});
		proxy = '';
	} else {
		xhr = new XMLHttpRequest();
	}
	xhr.onload = function () {
		var xml = xhr.responseXML, text = xhr.responseText, domParser;
		if (!xml) {
			try {
				//the JSON proxy wrappes the XML into JSON
				try {
					text = JSON.parse(text).error;
				} catch (e) {
				}
				//try to parse as XML if it comes from JSON or was sent with a wrong MIME type
				domParser = new DOMParser();
				xml = domParser.parseFromString(text, 'application/xml');
				//parse as HTML if that fails (we only need it to discover a new feed via rel="alternate" links)
				if (xml.documentElement.tagName === 'parsererror') {
					xml = domParser.parseFromString(text, 'text/html');
				}
			} catch (e) {
			}
		}
		text = xhr.status + ' ' + xhr.statusText + '\n\n' + xhr.getAllResponseHeaders() + '\n\n' + text;
		workXhrQueue();
		callback(xml, text);
	};
	xhr.onerror = function () {
		var text = xhr.responseText || '';
		workXhrQueue();
		text = xhr.status + ' ' + xhr.statusText + '\n\n' + xhr.getAllResponseHeaders() + '\n\n' + text;
		callback(false, text);
	};
	if (proxy.slice(-1) === '%') {
		proxy = proxy.slice(0, -1);
	} else if (proxy.indexOf('?') > -1) {
		url = encodeURIComponent(url);
	}
	url = proxy + url;
	if (proxy) {
		if (url.indexOf('?') > -1) {
			url += '&';
		} else {
			url += '?';
		}
		url += '_=' + Date.now(); //break cache when using a proxy
	}
	xhr.open('GET', url);
	workXhrQueue(xhr);
}

function getXMLViaSimulation (url, speed, callback) {
	getXmlViaProxy(simulationUrls.shift() || 'http://foo.invalid/', '', speed, callback);
}

function getXML (url, proxy, speed, callback) {
	if (proxy !== '' && location.protocol === 'file:') { //allow testing without internet connection
		getXMLViaSimulation(url, speed, callback);
	} else {
		getXmlViaProxy(url, proxy, speed, callback);
	}
}

return getXML;

})();