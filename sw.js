/*global caches, fetch, Promise */
(function (worker) {
"use strict";

var VERSION = 'v1.11',
	FILES = [
		'feed.css',
		'index.html',
		'icons/icon-512.png',
		'img/back.png',
		'img/config.png',
		'img/history.png',
		'img/open.png',
		'img/reload.png',
		'img/search.png',
		'js/app.js',
		'js/collection.js',
		'js/feed.js',
		'js/multi-entry.js',
		'js/presenter.js',
		'js/single-entry.js',
		'js/util.js',
		'js/util-alarm.js',
		'js/util-date.js',
		'js/util-diff.js',
		'js/util-opml.js',
		'js/util-parse.js',
		'js/util-storage.js',
		'js/util-xhr.js',
		'js/lib/arraydiff.js',
		'js/lib/l10n.js',
		'l10n/de.properties',
		'l10n/en.properties',
		'l10n/locales.ini'
	];

worker.addEventListener('install', function (e) {
	e.waitUntil(
		caches.open(VERSION).then(function (cache) {
			return cache.addAll(FILES);
		})
	);
});

worker.addEventListener('activate', function (e) {
	e.waitUntil(
		caches.keys().then(function (keys) {
			return Promise.all(keys.map(function (key) {
				if (key !== VERSION) {
					return caches.delete(key);
				}
			}));
		})
	);
});

worker.addEventListener('fetch', function (e) {
	e.respondWith(caches.match(e.request, {ignoreSearch: true})
		.then(function (response) {
			return response || fetch(e.request);
		})
	);
});

})(this);