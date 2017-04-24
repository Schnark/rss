/*global util*/
util.getXML =
(function () {
"use strict";

var xhrQueue = [],
	xhrRunning = 0,
	maxXhrRunning = 3,
	simulationUrls = ['testdata/mozilla1.rss', 'testdata/mozilla2.rss'];

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
		workXhrQueue();
		callback(xhr.responseXML);
	};
	xhr.onerror = function () {
		workXhrQueue();
		callback();
	};
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
	getXmlViaProxy(simulationUrls.shift() || 'http://foo.invalid/', '', callback); //FIXME
}

function getXML (url, proxy, callback) {
	if (location.protocol === 'file:') { //allow testing without internet connection
		getXMLViaSimulation(url, callback);
	} else {
		getXmlViaProxy(url, proxy, callback);
	}
}

return getXML;

})();