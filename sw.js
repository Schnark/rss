/*global caches, fetch, Promise */
(function (worker) {
"use strict";

var VERSION = 'v1.3',
	FILES = [
		'feed.css',
		'index.html',
		'icons/icon-512.png',
		'img/back.png',
		'img/config.png',
		'img/open.png',
		'img/reload.png',
		'img/source.txt',
		'js/app.js',
		'js/feed.js',
		'js/multi-entry.js',
		'js/single-entry.js',
		'js/collection.js',
		'js/presenter.js',
		'js/util.js',
		'js/lib/jsdiff.js',
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