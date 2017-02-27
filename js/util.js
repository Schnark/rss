/*global util: true*/
/*global MozActivity, Notification, indexedDB, URL*/
util =
(function () {
"use strict";
var util, icon =
//jscs:disable maximumLineLength
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACXlBMVEX////udzPodjLmeDLndzLoezLfcDDndjDmdjDmdzHoezLoezPnfTPvgDDVgCvkdC/mdjDpfTTpfTPndy/ldTDqfjPnfTXldi7ldTDqgDXrgDTldTDqgDXrgDjrgjbtgjXrgzf/gCvthDjshDfvgEDuhDfthjjthjnuiDPtiTvvhznuiDnviznvijrvijvujDzvizvvj0DvjTrwjDrwjDvtjjvwjDvvjTvmdzHneDHneTLnejLoejLmdjDoezLoezPofDPpfDPpfTTpfjTqfjTqfzXqgDXrgTbrk1vys4vvpnbtmGHofjjrgjbyuJP////++fb41r/xroHpgjzrgzfsgzf1xaf98+3ytInpgDjshDfyto/64dH87uX//fz87uTvnGPshTjpg0Dwqnr30rn//Pv//PrysYTthTjsj1D30rj//v71xKHthjjskVXzu5Xvom3riEXwpG/+9/Pzs4XthjnthznytY387+bxqnntk1P87eLwoGXuhzn30Lb41r7sikbulFT++PPshjvuiDnzupP64tL++vj99e/wo2zxpnD///70uIvuiTrpgDbvm2L75tftjUf41Ln99O3uikHqgTj0u5P5177vlVL//fv0tYTvijr0vJTyrXv51bv52cHvoGn3zbHxq3rqgTfrhDn75tj98OfzsH3++vbviz/tk1XyrHvwn2TukErujkTypGfvizvztYv3zrHshDn++/jyqHH98Ob0sXzsjEj+/Pnwomr75NL2wJj75NP1vZHtjUnzt4vullb1vpb507j1vJDwmlr2vpP4zav2wZfyomKasvhJAAAAOHRSTlMADzhRazgQarr6+rpqEAZy7e1yK9raK07y8k79/U7yK9oGcu0Qarr6DzhRa1H6umrtEHLa8iv9TufretAAAAABYktHRACIBR1IAAAACXBIWXMAAAdiAAAHYgE4epnbAAAAB3RJTUUH4AsOCDYVp03TJgAAAhVJREFUOMtt009LFVEYx/Hv73hnnplFY6DjXUkkSkmpkaSBIUWL0E2LIFq0LaJ30E4wegH2FgIx6I8EEmGbNlKKmoYaRtcwhFyU6KLgatNi5t47XT2r4Xyec+Y5zzmPyA1JInH7SX6u+uVL6hGS5iXt1QdEUlcZIclJWtT+7n8BTeok50JL2s4FFNVR59InbVUDioW2Q45WtAk4oElHOWd0It0h8jspH5eknbzLZ1klHKiTMr7vFQpxc3Pe7YLA4YsyCoDk70GhWKy5PLXjSM/vHYsagT+//daaMygcKiO0sfGt0By3wI7fVnUzIQU9tfxPSd+hdb3i3hvJ9QlJ5yV9ROrWF+j4nHmgVy5N24Ubpa99/dKynYXdnoqbXLa/AasrAwOa83v5sdmducll/7f+i8BicFVzwSV2wsxDXJLm93baLl+BmWSYDwbWm7mcq9R/asq7VmTGN/nDTPupRwduf75a/8mXffB6yHvngZf6WFJIMr8t6Ulw8ykhFkLYux4SoTWX3o3uvnj+LPAnDCZumDUy7odExMKhRSQZYJjdgcCbuQUBEfGIw7EnSdh9CEzjBhbIwCJi3AKCyM4hHkiP5XFP0qQNSVqKGf1ZQkBLQ1ft/rLzR8Q81Gz6Jre1cpQ/apjNHi1bWj1q/XsqAWxqud5HU6+23klpMOcj7lepvnnbJV1P6yu5hcPdDZyWhA6StdzcPwrNefPwJSIKAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE2LTExLTE0VDA4OjU0OjIxKzAxOjAwl8uNbAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNi0xMS0xNFQwODo1NDoyMSswMTowMOaWNdAAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAV3pUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAHic4/IMCHFWKCjKT8vMSeVSAAMjCy5jCxMjE0uTFAMTIESANMNkAyOzVCDL2NTIxMzEHMQHy4BIoEouAOoXEXTyQjWVAAAAAElFTkSuQmCC';
//jscs:enable maximumLineLength

util = {
	compare: function (a, b) {
		var aKey, bKey;
		aKey = a.sortKey();
		bKey = b.sortKey();
		if (aKey === bKey) {
			aKey = a.sortKey(true);
			bKey = b.sortKey(true);
		}
		if (aKey < bKey) {
			return -1;
		}
		if (aKey > bKey) {
			return 1;
		}
		return 0;
	},
	pad: function (n) {
		return n < 10 ? '0' + String(n) : String(n);
	},
	escape: function (text) {
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	},
	titleFromUrl: function (url) {
		return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
	},
	parseDate: function (dateString) {
		var date = Date.parse(dateString);
		if (isNaN(date)) {
			date = Date.parse(dateString.slice(0, -1));
		}
		if (isNaN(date)) {
			date = Date.now();
		}
		return date;
	},
	formatDayMonth: function (date) {
		return util.translate('date-format', {day: date.getDate(), month: util.translate('month-' + date.getMonth())});
	},
	formatHourMinute: function (date) {
		var h = date.getHours(), m = date.getMinutes();
		return util.translate('time-format', {h: h, hh: util.pad(h), m: m, mm: util.pad(m)});
	},
	formatRelativeDate: function (date) {
		var diff = Number(new Date()) - Number(date);
		diff = Math.round(diff / 1000);
		if (diff < 41) { //seconds
			return util.translate('just-now');
		}
		diff = Math.round(diff / 60);
		if (diff < 56) { //minutes
			return util.translate('minutes-ago', diff);
		}
		diff = Math.round(diff / 60);
		if (diff < 23) { //hours
			return util.translate('hours-ago', diff);
		}
		diff = Math.round(diff / 24);
		if (diff < 28) { //days
			return util.translate('days-ago', diff);
		}
		diff = Math.round(diff / 30.4375);
		if (diff < 12) { //months
			return util.translate('months-ago', diff);
		}
		diff = Math.round(diff / 12);
		return util.translate('years-ago', diff);
	},
	formatDate: function (date, long) {
		return util.translate(long ? 'date-time-long' : 'date-time-short', {
			date: util.formatDayMonth(date),
			time: util.formatHourMinute(date),
			relative: util.formatRelativeDate(date)
		});
	},
	getFile: function (callback) {
		var pick;
		if (window.MozActivity) {
			pick = new MozActivity({
				name: 'pick'
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
	},
	getOpmlFile: function (callback) {
		util.getFile(function (file) {
			if (!file) {
				callback(false);
			}
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
		});
	},
	parseOpml: function (xml) {
		var feeds = [], outlines = xml.getElementsByTagName('outline'), outline, type, url, title, i;
		for (i = 0; i < outlines.length; i++) {
			outline = outlines[i];
			type = outline.getAttribute('type');
			url = outline.getAttribute('xmlUrl');
			title = outline.getAttribute('text') || outline.getAttribute('title');
			if (type === 'rss' && url) {
				feeds.push({title: title || util.titleFromUrl(url), url: url});
			}
		}
		return feeds;
	},
	getParentNode: function (node, type) {
		while (node && node.tagName && node.tagName.toLowerCase() !== type) {
			node = node.parentNode;
		}
		return node && node.tagName ? node : null;
	},
	xhrQueue: [],
	xhrRunning: 0,
	maxXhrRunning: 3,
	workXhrQueue: function (xhr) {
		if (!xhr) {
			util.xhrRunning--;
		} else {
			util.xhrQueue.push(xhr);
		}
		while (util.xhrRunning < util.maxXhrRunning && util.xhrQueue.length) {
			xhr = util.xhrQueue.shift();
			xhr.send();
			util.xhrRunning++;
		}
	},
	getXmlViaProxy: function (url, proxy, callback) {
		var xhr;
		if (proxy === false) { //for a privileged app
			xhr = new XMLHttpRequest({mozAnon: true, mozSystem: true});
			proxy = '';
			util.maxXhrRunning = 6; //they all go to different hosts (probably)
		} else {
			xhr = new XMLHttpRequest();
		}
		xhr.onload = function () {
			util.workXhrQueue();
			callback(xhr.responseXML);
		};
		xhr.onerror = function () {
			util.workXhrQueue();
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
		util.workXhrQueue(xhr);
	},
	simulationUrls: ['testdata/mozilla1.rss', 'testdata/mozilla2.rss'],
	getXMLViaSimulation: function (url, callback) {
		util.getXmlViaProxy(util.simulationUrls.shift() || 'http://foo.invalid/', '', callback); //FIXME
	},
	getXML: function (url, proxy, callback) {
		if (location.protocol === 'file:') { //allow testing without internet connection
			util.getXMLViaSimulation(url, callback);
		} else {
			util.getXmlViaProxy(url, proxy, callback);
		}
	},
	getDataFromXmlElement: function (base, type, callback) {
		var i, content;
		if (Array.isArray(type)) {
			for (i = 0; i < type.length; i++) {
				content = util.getDataFromXmlElement(base, type[i], callback);
				if (content) {
					return content;
				}
			}
			return '';
		}
		base = base && base.getElementsByTagName(type)[0];
		if (base) {
			content = base.textContent.trim();
			if (callback) {
				content = callback(base, content);
			}
		} else {
			content = '';
		}
		return content;
	},
	parseFeed: function (xml) {
		var items = xml.getElementsByTagName('item'), isRSS = !!items.length, author;
		if (!isRSS) {
			items = xml.getElementsByTagName('entry');
		}
		if (!items.length) {
			return false;
		}
		author = util.getDataFromXmlElement(xml, ['name', 'author', 'dc:creator']);
		return {
			title: util.getDataFromXmlElement(xml, 'title'),
			entries: isRSS ?
				util.parseRssItems(items, author) :
				util.parseAtomItems(items, author)
		};
	},
	buildMedia: function (url, type, attr) {
		url = util.escape(url);
		type = util.escape(type);
		attr = attr ? ' ' + attr : '';
		switch (type.replace(/\/.*$/, '')) {
		case 'audio':
			return '<p><audio controls' + attr + '><source src="' + url + '" type="' + type + '"></audio></p>';
		case 'video':
			return '<p><video controls' + attr + '><source src="' + url + '" type="' + type + '"></video></p>';
		case 'image':
			return '<p><img alt="" src="' + url + '"' + attr + '></p>';
		default:
			return '';
		}
	},
	parseEnclosure: function (enclosures) {
		var i, html = [];
		for (i = 0; i < enclosures.length; i++) {
			html.push(util.buildMedia(
				enclosures[i].getAttribute('url') || '',
				enclosures[i].getAttribute('type') || ''
			));
		}
		return html.join('');
	},
	parseMedia: function (media) {
		var i, html = [], attr;
		for (i = 0; i < media.length; i++) {
			attr = {
				height: media[i].getAttribute('height'),
				width: media[i].getAttribute('width')
			};
			if (attr.height && attr.width) {
				attr = 'height="' + util.escape(attr.height) + '" width="' + util.escape(attr.width) + '"';
			} else {
				attr = '';
			}
			html.push(util.buildMedia(
				media[i].getAttribute('url') || '',
				'image',
				attr
			));
		}
		return html.join('');
	},
	parseRssItems: function (items, fallbackAuthor) {
		var i, result = [], item, title, author, url, content, date;
		for (i = 0; i < items.length; i++) {
			item = items[i];
			title = util.getDataFromXmlElement(item, 'title');
			author = util.getDataFromXmlElement(item, ['author', 'dc:creator']) || fallbackAuthor;
			url = util.getDataFromXmlElement(item, ['feedburner:origLink', 'link']);
			date = new Date(util.parseDate(util.getDataFromXmlElement(item, ['pubDate', 'dc:date'])));
			content =
				util.parseEnclosure(item.getElementsByTagName('enclosure')) +
				util.parseMedia(item.getElementsByTagName('media:thumbnail')) +
				util.getDataFromXmlElement(item, ['content:encoded', 'description']);
			content = util.normalizeContent(content);
			if (date < new Date()) {
				result.push({title: title, author: author, url: url, content: content, date: date});
			}
		}
		return result;
	},
	parseAtomItems: function (items, fallbackAuthor) {
		var i, result = [], item, title, author, url, content, date;

		function maybeEscape (el, content) {
			var type = el.getAttribute('type') || 'text';
			if (type === 'text') {
				content = util.escape(content);
			}
			return content;
		}

		function getHrefAttr (el) {
			return el.getAttribute('href') || '';
		}

		for (i = 0; i < items.length; i++) {
			item = items[i];
			title = util.getDataFromXmlElement(item, 'title');
			author = util.getDataFromXmlElement(item, ['name', 'author', 'dc:creator']) || fallbackAuthor;
			url = util.getDataFromXmlElement(item, 'link', getHrefAttr);
			date = new Date(util.parseDate(util.getDataFromXmlElement(item, ['updated', 'published'])));
			content = util.getDataFromXmlElement(item, ['content', 'summary'], maybeEscape);
			content = util.normalizeContent(content);
			if (date < new Date()) {
				result.push({title: title, author: author, url: url, content: content, date: date});
			}
		}
		return result;
	},
	normalizeContent: function (content) {
		return content.replace(/data-rel="lightbox-gallery-[a-zA-Z0-9]*"/g,
			'data-rel="lightbox-gallery-ABC0"'); //WordPress lightbox, id changes every time
	},
	makeAbsolute: function (el, attr, base) {
		var url = el.getAttribute(attr) || '';
		if (url.charAt(0) === '.' || url.charAt(0) === '/') {
			try {
				url = new URL(url, base);
				el.setAttribute(attr, url.toString());
			} catch (e) {
			}
		}
	},
	showHtml: function (el, html, base) {
		var links, i;
		el.innerHTML = html; //FIXME use sandboxed iframe instead
		links = el.getElementsByTagName('a');
		for (i = 0; i < links.length; i++) {
			links[i].target = '_blank';
			util.makeAbsolute(links[i], 'href', base);
		}
		links = el.getElementsByTagName('img');
		for (i = 0; i < links.length; i++) {
			util.makeAbsolute(links[i], 'src', base);
		}
	},
	showNotification: function () {
		if (!document.hidden || !window.Notification || !navigator.mozApps || !navigator.mozApps.getSelf) {
			return;
		}
		var notification = new Notification(util.translate('title'), {
			icon: icon,
			body: util.translate('notification'),
			tag: 'Firri'
		});
		notification.addEventListener('click', function () {
			notification.close();
			navigator.mozApps.getSelf().onsuccess = function () {
				if (this.result) {
					this.result.launch();
				}
			};
		});
	},
	alarmViaTimeout: {
	},
	removeAlarms: function (callback) {
		if (!navigator.mozAlarms) {
			if (util.alarmViaTimeout.id) {
				clearTimeout(util.alarmViaTimeout.id);
				util.alarmViaTimeout.id = false;
			}
			callback(true);
			return;
		}
		navigator.mozAlarms.getAll().onsuccess = function () {
			this.result.forEach(function (alarm) {
				if (alarm.data.type === 'auto-update') {
					navigator.mozAlarms.remove(alarm.id);
				}
			});
			callback();
		};
	},
	setAlarm: function (time) {
		util.removeAlarms(function (timeout) {
			if (time > 0) {
				if (timeout) {
					util.alarmViaTimeout.id = setTimeout(function () {
						if (util.alarmViaTimeout.callback) {
							util.alarmViaTimeout.callback();
						}
					}, time);
				} else {
					navigator.mozAlarms.add(new Date(Date.now() + time), 'ignoreTimezone', {type: 'auto-update'});
				}
			}
		});
	},
	handleAlarm: function (handler) {
		if (navigator.mozSetMessageHandler) {
			navigator.mozSetMessageHandler('alarm', handler);
		} else {
			util.alarmViaTimeout.callback = handler;
		}
	},
	errors: {
		OK: 0,
		HTTP: 1,
		XML: 2,
		EXISTS: 3,
		NOFEED: 4,
		SKIP: 5
	},
	storage: {
		openDB: function (callback) {
			if ('db' in util.storage) {
				callback(util.storage.db);
				return;
			}
			if (!window.indexedDB) {
				util.storage.db = null;
				callback(null);
				return;
			}
			var request = indexedDB.open('store', 1);
			request.onupgradeneeded = function (e) {
				var db = e.target.result;
				db.createObjectStore('store').transaction.oncomplete = function () {
					db.transaction(['store'], 'readwrite').objectStore('store').add(util.storage.empty, 'store');
				};
			};
			request.onsuccess = function (e) {
				util.storage.db = e.target.result;
				callback(util.storage.db);
			};
			request.onerror = function () {
				util.storage.db = null;
				callback(null);
			};
		},
		read: function (callback) {
			util.storage.openDB(function (db) {
				if (!db) {
					callback(util.storage.empty);
					return;
				}
				var request = db.transaction(['store']).objectStore('store').get('store');
				request.onsuccess = function () {
					callback(request.result);
				};
				request.onerror = function () {
					callback(util.storage.empty);
				};
			});
		},
		get: function (callback) {
			util.storage.read(function (data) {
				var key, config = {};
				for (key in util.storage.defaultConfig) {
					if (key in data.config) {
						config[key] = data.config[key];
					} else {
						config[key] = util.storage.defaultConfig[key];
					}
				}
				data.config = config;
				callback(data);
			});
		},
		set: function (json) {
			util.storage.openDB(function (db) {
				if (!db) {
					return;
				}
				db.transaction(['store'], 'readwrite').objectStore('store').put(json, 'store');
			});
		},
		empty: {config: {}, feeds: []},
		defaultConfig: {
			'max-entries-per-multi': 10,
			'max-entries-per-feed': 100,
			'cors-proxy': 'https://crossorigin.me/',
/* Alternatives (though not all for permanent public use):
	https://cors-anywhere.herokuapp.com/
	http://jsonp.afeld.me/?url=
	http://cors-proxy.htmldriven.com/?url=
*/
			'auto-update': 0 //-1: no auto update, 0: update on start, > 0: update every n minutes
		}
	},
	translate: function (key, args) {
		if (typeof args === 'number') {
			args = {n: args};
		}
		return document.webL10n.get(key, args, '(' + key + ')');
	}
};

return util;

})();