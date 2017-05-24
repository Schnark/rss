/*global util: true*/
/*global URL*/
util =
(function () {
"use strict";
var util;

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
	escape: function (text) {
		return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
	},
	titleFromUrl: function (url) {
		return url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
	},
	//needle is text, haystack HTML
	search: function (needle, haystack, onlyFirst) {

		//whether a position in haystack is inside an entity
		function isInsideEntity (position) {
			var ampPos, semiPos;
			if (position === 0) {
				return false;
			}
			ampPos = haystack.lastIndexOf('&', position - 1);
			if (ampPos === -1) {
				return false;
			}
			semiPos = haystack.indexOf(';', position);
			if (semiPos === -1) {
				return false;
			}
			return (/^&(?:#\d+|#[xX][a-fA-F0-9]+|\w+);$/).test(haystack.slice(ampPos, semiPos + 1));
		}

		var matches = [], index;
		needle = util.escape(needle).toLowerCase();
		haystack = haystack.toLowerCase();
		index = haystack.indexOf(needle);
		while (index !== -1) {
			if (!isInsideEntity(index) && !isInsideEntity(index + needle.length)) {
				matches.push([index, index + needle.length]);
				index = onlyFirst ? -1 : haystack.indexOf(needle, index + needle.length);
			} else { //not a real match
				index = haystack.indexOf(needle, index + 1);
			}
		}
		return matches;
	},
	getParentNode: function (node, type) {
		while (node && node.tagName && node.tagName.toLowerCase() !== type) {
			node = node.parentNode;
		}
		return node && node.tagName ? node : null;
	},
	showHtml: function (el, html, base, proxy) {
		var links, i;

		function makeAbsolute (el, attr, base, proxy) {
			var url = el.getAttribute(attr) || '';
			try {
				url = new URL(url, base);
				if (proxy && location.protocol === 'https:' && url.indexOf('http:') === 0) {
					url = proxy + url;
				}
				el.setAttribute(attr, url.toString());
			} catch (e) {
			}
		}

		el.innerHTML = html; //FIXME use sandboxed iframe instead
		links = el.getElementsByTagName('a');
		for (i = 0; i < links.length; i++) {
			if ((links[i].getAttribute('href') || '').charAt(0) === '#') {
				continue;
			}
			links[i].target = '_blank';
			if (links[i].relList) {
				links[i].relList.add('noopener');
			}
			makeAbsolute(links[i], 'href', base);
		}
		links = el.getElementsByTagName('img');
		for (i = 0; i < links.length; i++) {
			makeAbsolute(links[i], 'src', base, proxy);
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
	translate: function (key, args) {
		if (typeof args === 'number') {
			args = {n: args};
		}
		return document.webL10n.get(key, args, '(' + key + ')');
	}
};

return util;

})();