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
	return new Date(date);
}

function unescapeTitle (title) {
	var span;
	if (title.indexOf('&') === -1) {
		//nothing to do
		return title;
	}
	if (title.indexOf('<') > -1 || title.indexOf('>') > -1 || title.indexOf('& ') > -1) {
		//already unescaped
		return title;
	}
	span = document.createElement('span');
	span.innerHTML = title;
	return span.textContent;
}

function normalizeContent (content) {
	return content
		//WordPress lightbox, id changes every time
		.replace(/data-rel="lightbox-gallery-[a-zA-Z0-9]*"/g, 'data-rel="lightbox-gallery-ABC0"')
		//Feedburner links, inconsistent and tracking, it's better to remove them
		.replace(
			new RegExp(
				'(?:\\s*<div class="feedflare">\\s*' +
				'(?:<a href="[^"]+"><img [^>]+>(?:<\\/img>)?<\\/a>\\s*)+' +
				'<\\/div>\\s*(?:<img [^>]+>(?:<\\/img>)?)?)+(<ul class="tag-list">|$)'
			),
			'$1'
		)
		//unescaped " in images
		.replace(/<img [^>\n]+>/g, function (img) {
			return img
				.split('=')
				.map(function (part) {
					var first, last, index;
					first = part.indexOf('"');
					if (first === -1) {
						return part;
					}
					last = part.lastIndexOf('"');
					if (first === last) {
						return part;
					}
					index = part.indexOf('"', first + 1);
					while (index !== last) {
						part = part.slice(0, index) + '&quot;' + part.slice(index + 1);
						last += 5;
						index = part.indexOf('"', first + 1);
					}
					return part;
				})
				.join('=');
		});
}

function buildMedia (content, url, type, attr, thumb) {
	var name, download;
	url = util.escape(url || '');
	type = util.escape(type || '');
	attr = attr ? ' ' + attr : '';
	if (
		!url ||
		content.indexOf('src="' + url + '"') > -1 || (thumb && content.indexOf('src=') > -1) //media seems already present
	) {
		return '';
	}
	name = url.replace(/.*\//, '');
	download = '<a href="' + url + '" download="' + name + '" data-translate-download="true">' + type + '</a>';
	switch (type.replace(/\/.*$/, '')) {
	case 'audio':
		return '<p><audio controls' + attr + '><source src="' + url + '" type="' + type + '"></audio><br>' + download + '</p>';
	case 'video':
		return '<p><video controls' + attr + '><source src="' + url + '" type="' + type + '"></video><br>' + download + '</p>';
	case 'image':
		return '<p><img alt="" src="' + url + '"' + attr + '>' + (type === 'image' ? '' : '<br>' + download) + '</p>';
	default:
		return '';
	}
}

function parseEnclosure (enclosures, content) {
	var i, html = [];
	for (i = 0; i < enclosures.length; i++) {
		html.push(buildMedia(
			content,
			enclosures[i].getAttribute('url'),
			enclosures[i].getAttribute('type')
		));
	}
	return html.join('');
}

function parseMedia (media, content, thumb) {
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
			content,
			media[i].getAttribute('url'),
			media[i].getAttribute('type') || 'image',
			attr,
			thumb
		));
	}
	return html.join('');
}

function parseTags (categories) {
	var tags = [], i, cat;
	for (i = 0; i < categories.length; i++) {
		cat = categories[i];
		tags.push(
			cat.textContent ||
			cat.getAttributeNS('http://www.w3.org/2005/Atom', 'label') ||
			cat.getAttribute('label') ||
			''
		);
	}
	tags = tags.filter(function (tag) {
		return tag;
	});
	if (tags.length === 1 && (/,\S/.test(tags[0]))) {
		tags = tags[0].split(/,(?!\s)/);
	}
	if (tags.length === 0) {
		return '';
	}
	return '<ul class="tag-list">' + tags.map(function (tag) {
		return '<li>' + util.escape(tag) + '</li>';
	}).join('') + '</ul>';
}

function parseRssItems (items, fallbackAuthor) {
	var i, result = [], item, title, author, url, content, date;
	for (i = 0; i < items.length; i++) {
		item = items[i];
		title = unescapeTitle(getDataFromXmlElement(item, 'title'));
		author = getDataFromXmlElement(item, ['author', 'dc:creator']) || fallbackAuthor;
		url = getDataFromXmlElement(item, ['feedburner:origLink', 'link']);
		date = parseDate(getDataFromXmlElement(item, ['pubDate', 'dc:date']));
		content = getDataFromXmlElement(item, ['content:encoded', 'description']);
		content =
			parseMedia(item.getElementsByTagName('media:thumbnail'), content, true) +
			content;
		content =
			parseMedia(item.getElementsByTagName('media:content'), content) +
			content;
		content =
			parseEnclosure(item.getElementsByTagName('enclosure'), content) +
			content;
		content += parseTags(item.getElementsByTagName('category'));
		content = normalizeContent(content);
		if (date <= new Date()) {
			result.push({title: title, author: author, url: url, content: content, date: date});
		}
	}
	return result;
}

function parseAtomItems (items, fallbackAuthor) {
	var i, result = [], item, title, author, url, content, date;

	function maybeEscape (el, content) {
		var type;
		type = el.getAttributeNS('http://www.w3.org/2005/Atom', 'type') ||
			el.getAttribute('type') ||
			'text';
		if (type === 'text') {
			content = util.escape(content);
		}
		return content;
	}

	function getHrefAttr (el) {
		return el.getAttributeNS('http://www.w3.org/2005/Atom', 'href') || el.getAttribute('href') || '';
	}

	for (i = 0; i < items.length; i++) {
		item = items[i];
		title = getDataFromXmlElement(item, 'title');
		author = getDataFromXmlElement(item, ['name', 'author', 'dc:creator']) || fallbackAuthor;
		url = getDataFromXmlElement(item, 'link', getHrefAttr);
		date = parseDate(getDataFromXmlElement(item, ['updated', 'published']));
		content = getDataFromXmlElement(item, ['content', 'summary'], maybeEscape);
		content += parseTags(item.getElementsByTagName('category'));
		content = normalizeContent(content);
		if (date <= new Date()) {
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
