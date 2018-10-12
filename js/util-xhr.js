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

function getXmlViaProxy (url, proxy, callback) {
	var xhr;
	if (proxy === false) { //for a privileged app
		xhr = new XMLHttpRequest({mozAnon: true, mozSystem: true});
		proxy = '';
		maxXhrRunning = 6; //they all go to different hosts (probably)
	} else {
		xhr = new XMLHttpRequest();
	}
	xhr.onload = function () {
		var xml = xhr.responseXML, text = xhr.responseText;
		if (!xml) {
			try {
				//for pure JSON proxy
				text = JSON.parse(text).error;
				xml = (new DOMParser()).parseFromString(text, 'application/xml');
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
	if (proxy.indexOf('?') > -1) {
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

function getXMLViaSimulation (url, callback) {
	getXmlViaProxy(simulationUrls.shift() || 'http://foo.invalid/', '', callback);
}

function getXML (url, proxy, callback) {
	if (proxy !== '' && location.protocol === 'file:') { //allow testing without internet connection
		getXMLViaSimulation(url, callback);
	} else {
		getXmlViaProxy(url, proxy, callback);
	}
}

return getXML;

})();