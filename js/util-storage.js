/*global util*/
/*global indexedDB*/
util.storage =
(function () {
"use strict";
var cachedDB,
	empty = {config: {}, feeds: []},
	defaultConfig = {
		'max-entries-per-multi': 10,
		'max-entries-per-feed': 100,
		'cors-proxy': 'https://crossorigin.me/',
/* Alternatives (though not all for permanent public use):
https://cors-anywhere.herokuapp.com/
http://jsonp.afeld.me/?url=
http://cors-proxy.htmldriven.com/?url=
*/
		'auto-update': 0 //-1: no auto update, 0: update on start, > 0: update every n minutes
	};

function openDB (callback) {
	if (cachedDB !== undefined) {
		callback(cachedDB);
		return;
	}
	if (!window.indexedDB) {
		cachedDB = null;
		callback(null);
		return;
	}
	//'store' is a stupid generic name. While this is okay in the packaged app, it is a real mess
	//in the online app, where it shares the global namespace with all my other apps. But for
	//backwards compatibility it ca'n't be changed easily.
	var request = indexedDB.open('store', 1);
	request.onupgradeneeded = function (e) {
		var db = e.target.result;
		db.createObjectStore('store').transaction.oncomplete = function () {
			db.transaction(['store'], 'readwrite').objectStore('store').add(empty, 'store');
		};
	};
	request.onsuccess = function (e) {
		cachedDB = e.target.result;
		callback(cachedDB);
	};
	request.onerror = function () {
		cachedDB = null;
		callback(null);
	};
}

function read (callback) {
	openDB(function (db) {
		if (!db) {
			callback(empty);
			return;
		}
		var request = db.transaction(['store']).objectStore('store').get('store');
		request.onsuccess = function () {
			callback(request.result);
		};
		request.onerror = function () {
			callback(empty);
		};
	});
}

function get (callback) {
	read(function (data) {
		var key, config = {};
		for (key in defaultConfig) {
			if (key in data.config) {
				config[key] = data.config[key];
			} else {
				config[key] = defaultConfig[key];
			}
		}
		data.config = config;
		callback(data);
	});
}

function set (json) {
	openDB(function (db) {
		if (!db) {
			return;
		}
		db.transaction(['store'], 'readwrite').objectStore('store').put(json, 'store');
	});
}

return {
	get: get,
	set: set
};

})();
