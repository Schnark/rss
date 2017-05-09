/*global Collection: true, Feed, util*/
Collection =
(function () {
"use strict";

function Collection (data) {
	this.config = data.config;
	this.feeds = data.feeds.map(function (feed) {
		return new Feed(this, feed);
	}, this);
}

Collection.prototype.getConfig = function (key) {
	return this.config[key];
};

Collection.prototype.setConfig = function (key, val) {
	this.config[key] = val;
};

Collection.prototype.getJSON = function () {
	return {
		config: this.config,
		feeds: this.feeds.map(function (feed) {
			return feed.getJSON();
		})
	};
};

Collection.prototype.getOPML = function () {
	return '<?xml version="1.0"?>\n' +
		'<opml version="1.0">\n' +
		'\t<head>\n' +
		'\t\t<title>' + util.escape(util.translate('export-title')) + '</title>\n' +
		'\t</head>\n' +
		'\t<body>\n' +
		this.feeds.map(function (feed) {
			return '\t\t' + feed.getOPML();
		}).join('\n') + '\n' +
		'\t</body>\n' +
		'</opml>';
};

Collection.prototype.getTimeline = function () {
	return new Feed(this, {title: util.translate('timeline')});
};

Collection.prototype.getAllEntries = function () {
	var entries = [], i;
	for (i = 0; i < this.feeds.length; i++) {
		entries = entries.concat(this.feeds[i].getEntries());
	}
	return entries;
};

Collection.prototype.indexByUrl = function (url) {
	var i;
	for (i = 0; i < this.feeds.length; i++) {
		if (this.feeds[i].getUrl() === url) {
			return i;
		}
	}
	return -1;
};

Collection.prototype.getFeedByIndex = function (index) {
	return this.feeds[index];
};

Collection.prototype.sort = function () {
	this.feeds.sort(util.compare);
};

Collection.prototype.add = function (url, callback) {
	if (this.indexByUrl(url) !== -1) {
		setTimeout(function () {
			callback(util.errors.EXISTS);
		}, 0);
		return;
	}
	var title = util.titleFromUrl(url),
		feed = new Feed(this, {title: title, url: url, entries: []});
	feed.reload(function (result) {
		if (result !== util.errors.OK) {
			callback(result);
			return;
		}
		this.feeds.push(feed);
		this.sort();
		callback(util.errors.OK, feed);
	}.bind(this), true, true);
};

Collection.prototype.addFromOPML = function (xml) {
	var data = util.parseOpml(xml), i, added = 0;
	for (i = 0; i < data.length; i++) {
		if (this.indexByUrl(data[i].url) === -1) {
			this.feeds.push(new Feed(this, {title: data[i].title, url: data[i].url, entries: []}));
			added++;
		}
	}
	this.sort();
	return added;
};

Collection.prototype.remove = function (feed) {
	var index = this.feeds.indexOf(feed);
	if (index !== -1) {
		this.feeds.splice(index, 1);
	}
};

Collection.prototype.reload = function (callback) {
	var i, c = this.feeds.length;
	if (c === 0) {
		setTimeout(function () {
			callback(util.errors.NOFEED);
		}, 0);
		return;
	}
	for (i = 0; i < c; i++) {
		this.feeds[i].reload(callback);
	}
};

Collection.prototype.show = function (element) {
	var li, title, count, i;
	element.innerHTML = '';
	for (i = 0; i < this.feeds.length; i++) {
		li = document.createElement('li');
		title = document.createElement('span');
		count = document.createElement('span');
		title.className = 'title';
		count.className = 'count';
		li.appendChild(title);
		li.appendChild(count);
		this.feeds[i].showList(li);
		element.appendChild(li);
	}
};

Collection.prototype.markAsRead = function () {
	var i;
	for (i = 0; i < this.feeds.length; i++) {
		this.feeds[i].markAsRead();
	}
};

return Collection;

})();