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
	getParentNode: function (node, type) {
		while (node && node.tagName && node.tagName.toLowerCase() !== type) {
			node = node.parentNode;
		}
		return node && node.tagName ? node : null;
	},
	showHtml: function (el, html, base) {
		var links, i;

		function makeAbsolute (el, attr, base) {
			var url = el.getAttribute(attr) || '';
			if (url.charAt(0) === '.' || url.charAt(0) === '/') {
				try {
					url = new URL(url, base);
					el.setAttribute(attr, url.toString());
				} catch (e) {
				}
			}
		}

		el.innerHTML = html; //FIXME use sandboxed iframe instead
		links = el.getElementsByTagName('a');
		for (i = 0; i < links.length; i++) {
			links[i].target = '_blank';
			makeAbsolute(links[i], 'href', base);
		}
		links = el.getElementsByTagName('img');
		for (i = 0; i < links.length; i++) {
			makeAbsolute(links[i], 'src', base);
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