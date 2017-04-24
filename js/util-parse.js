/*global util*/
util.parseFeed =
(function () {
"use strict";

function getDataFromXmlElement (base, type, callback) {
	var i, content;
	if (Array.isArray(type)) {
		for (i = 0; i < type.length; i++) {
			content = getDataFromXmlElement(base, type[i], callback);
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
}

function parseDate (dateString) {
	var date = Date.parse(dateString);
	if (isNaN(date)) {
		date = Date.parse(dateString.slice(0, -1));
	}
	if (isNaN(date)) {
		date = Date.now();
	}
	return date;
}

function normalizeContent (content) {
	return content.replace(/data-rel="lightbox-gallery-[a-zA-Z0-9]*"/g,
		'data-rel="lightbox-gallery-ABC0"'); //WordPress lightbox, id changes every time
}

function buildMedia (url, type, attr) {
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
}

function parseEnclosure (enclosures) {
	var i, html = [];
	for (i = 0; i < enclosures.length; i++) {
		html.push(buildMedia(
			enclosures[i].getAttribute('url') || '',
			enclosures[i].getAttribute('type') || ''
		));
	}
	return html.join('');
}

function parseMedia (media) {
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
		html.push(buildMedia(
			media[i].getAttribute('url') || '',
			'image',
			attr
		));
	}
	return html.join('');
}

function parseRssItems (items, fallbackAuthor) {
	var i, result = [], item, title, author, url, content, date;
	for (i = 0; i < items.length; i++) {
		item = items[i];
		title = getDataFromXmlElement(item, 'title');
		author = getDataFromXmlElement(item, ['author', 'dc:creator']) || fallbackAuthor;
		url = getDataFromXmlElement(item, ['feedburner:origLink', 'link']);
		date = new Date(parseDate(getDataFromXmlElement(item, ['pubDate', 'dc:date'])));
		content =
			parseEnclosure(item.getElementsByTagName('enclosure')) +
			parseMedia(item.getElementsByTagName('media:thumbnail')) +
			getDataFromXmlElement(item, ['content:encoded', 'description']);
		content = normalizeContent(content);
		if (date < new Date()) {
			result.push({title: title, author: author, url: url, content: content, date: date});
		}
	}
	return result;
}

function parseAtomItems (items, fallbackAuthor) {
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
		title = getDataFromXmlElement(item, 'title');
		author = getDataFromXmlElement(item, ['name', 'author', 'dc:creator']) || fallbackAuthor;
		url = getDataFromXmlElement(item, 'link', getHrefAttr);
		date = new Date(parseDate(getDataFromXmlElement(item, ['updated', 'published'])));
		content = getDataFromXmlElement(item, ['content', 'summary'], maybeEscape);
		content = normalizeContent(content);
		if (date < new Date()) {
			result.push({title: title, author: author, url: url, content: content, date: date});
		}
	}
	return result;
}

function parseFeed (xml) {
	var items = xml.getElementsByTagName('item'), isRSS = !!items.length, author;
	if (!isRSS) {
		items = xml.getElementsByTagName('entry');
	}
	if (!items.length) {
		return false;
	}
	author = getDataFromXmlElement(xml, ['name', 'author', 'dc:creator']);
	return {
		title: getDataFromXmlElement(xml, 'title'),
		entries: isRSS ?
			parseRssItems(items, author) :
			parseAtomItems(items, author)
	};
}

return parseFeed;
})();
