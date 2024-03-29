/*global Feed: true, MultiEntry, util*/
/*global Event*/
Feed =
(function () {
"use strict";

function Feed (parent, data) {
	this.parent = parent;
	this.title = data.title;
	this.url = data.url;
	this.date = data.date ? new Date(data.date) : false;
	this.pause = data.pause || 0;
	this.noProxy = data.noProxy || false;
	this.filter = data.filter || false;
	if (!this.isTimeline()) {
		this.entries = data.entries.map(function (entry) {
			return new MultiEntry(this, entry);
		}, this);
	} else {
		this.updateTimeline();
	}
	this.search = '';
}

Feed.prototype.updateTimeline = function () {
	this.entries = this.parent.getAllEntries();
	this.sort();
};

Feed.prototype.getConfig = function (key) {
	return this.parent.getConfig(key);
};

Feed.prototype.getJSON = function () {
	return {
		title: this.title,
		url: this.url,
		date: this.date ? Number(this.date) : false,
		pause: this.pause,
		noProxy: this.noProxy,
		filter: this.filter,
		entries: this.entries.map(function (entry) {
			return entry.getJSON();
		})
	};
};

Feed.prototype.getLength = function () {
	if (this.isTimeline()) {
		return this.parent.getLength();
	} else {
		return 1;
	}
};

Feed.prototype.getOPML = function () {
	return '<outline type="rss" xmlUrl="' + util.escape(this.url) + '" ' +
		'title="' + util.escape(this.title) + '" ' +
		'text="' + util.escape(this.title) + '" />';
};

Feed.prototype.getUrl = function () {
	return this.url;
};

Feed.prototype.getTitle = function () {
	return this.title;
};

Feed.prototype.getEntries = function () {
	return this.entries;
};

Feed.prototype.isTimeline = function () {
	return !this.url;
};

Feed.prototype.sortKey = function (alt) {
	return alt ? this.url : this.title.toLowerCase();
};

Feed.prototype.getRaw = function () {
	return this.rawData;
};

Feed.prototype.getEntryByIndex = function (index, onlyEntry) {
	var entry, i;
	if (this.search) {
		for (i = this.entries.length - 1; i >= 0; i--) {
			if (this.entries[i].search(this.search) === -1) {
				continue;
			}
			if (index === 0) {
				entry = this.entries[i];
				break;
			}
			index--;
		}
	} else {
		entry = this.entries[this.entries.length - 1 - index];
	}
	return !onlyEntry && this.search ? [entry, entry.search(this.search)] : entry;
};

Feed.prototype.updateSettings = function (element) {
	var title, url, pause, filter, i;
	title = element.getElementsByClassName('title')[0];
	url = element.getElementsByClassName('url')[0];
	pause = element.getElementsByClassName('pause')[0];
	if (!title.checkValidity() || !url.checkValidity() || !pause.checkValidity()) {
		return false;
	}
	if (url.value !== this.url && this.parent.indexByUrl(url.value) !== -1) {
		return false;
	}
	this.title = title.value;
	this.url = url.value;
	this.pause = pause.value;
	this.noProxy = element.getElementsByClassName('no-proxy')[0].checked;
	filter = element.getElementsByClassName('filter-mode')[0].value;
	if (filter === 'none') {
		this.filter = false;
	} else {
		this.filter = {
			include: filter === 'include',
			rules: []
		};
		filter = element.getElementsByClassName('filter-rule');
		for (i = 0; i < filter.length; i += 3) {
			if (filter[i].value) {
				this.filter.rules.push([filter[i].value, filter[i + 1].value, filter[i + 2].value]);
			}
		}
		if (this.filter.rules.length === 0) {
			this.filter = false;
		}
	}
	this.parent.sort();
	return true;
};

Feed.prototype.updateSearch = function (search) {
	if (this.search !== search) {
		this.search = search;
		return true;
	}
	return false;
};

Feed.prototype.sort = function () {
	this.entries.sort(util.compare);
};

Feed.prototype.checkFilter = function (data) {
	var i;
	function testRule (rule) {
		var not = false, field = rule[0], mode = rule[1], val = rule[2], result;
		if (mode.slice(-4) === '-not') {
			mode = mode.slice(0, -4);
			not = true;
		}
		switch (mode) {
		case 'is':
			result = data[field] === val;
			break;
		case 'contains':
			result = data[field].indexOf(val) > -1;
			break;
		default:
			result = false; //should not happen;
		}
		return not ? !result : result;
	}

	if (!this.filter) {
		return true;
	}
	for (i = 0; i < this.filter.rules.length; i++) {
		if (testRule(this.filter.rules[i])) {
			return this.filter.include;
		}
	}
	return !this.filter.include;
};

Feed.prototype.add = function (data) {
	var i, shouldAdd;
	if (!this.checkFilter(data)) {
		return;
	}
	for (i = 0; i < this.entries.length; i++) {
		shouldAdd = this.entries[i].shouldAdd(data);
		if (shouldAdd === -1) {
			return;
		}
		if (shouldAdd === 1) {
			this.entries[i].add(data);
			return;
		}
	}
	this.entries.push(new MultiEntry(this, {read: 0, entries: [data]}));
	return;
};

Feed.prototype.reload = function (callback, force, updateTitle) {
	var oldCounts, newCounts;
	if (this.isTimeline()) {
		this.parent.reload(callback);
		return;
	}
	if (
		this.isUpdating ||
		(!force && Number(new Date()) - Number(this.date) < (this.pause * 1000 * 60 * 60 || 5))
	) {
		setTimeout(function () {
			callback(util.errors.SKIP, this, 0, 0);
		}.bind(this), 0);
		return;
	}
	this.isUpdating = true;
	oldCounts = this.getCounts(true);
	util.getXML(this.url, this.noProxy ? '' : this.getConfig('cors-proxy'), function (xml, raw) {
		var data;
		this.isUpdating = false;
		if (raw) {
			this.rawData = raw;
		}
		if (!xml) {
			this.loadingFailed = true;
			callback(util.errors.HTTP, this, 0, 0);
			return;
		}
		data = util.parseFeed(xml);
		if (!data) {
			this.loadingFailed = true;
			callback(util.errors.XML, this, 0, 0);
			return;
		}
		this.loadingFailed = false;
		this.date = new Date();
		if (updateTitle && data.title) {
			this.title = data.title;
		}
		data.entries.forEach(function (entry) {
			this.add(entry);
		}, this);
		this.sort();
		while (this.entries.length > this.getConfig('max-entries-per-feed')) {
			this.entries.shift();
		}
		newCounts = this.getCounts(true);
		callback(util.errors.OK, this,
			Math.max(0, newCounts.unread - oldCounts.unread),
			Math.max(0, newCounts.updated - oldCounts.updated)
		);
	}.bind(this));
};

Feed.prototype.getCounts = function (ignoreSearch) {
	var i, unread = 0, updated = 0, total = 0;
	for (i = 0; i < this.entries.length; i++) {
		if (!ignoreSearch && this.search && this.entries[i].search(this.search) === -1) {
			continue;
		}
		switch (this.entries[i].getStatus()) {
		case 'unread': unread++; break;
		case 'updated': updated++;
		}
		total++;
	}
	return {unread: unread, updated: updated, total: total};
};

Feed.prototype.getCountsHtml = function () {
	var counts = this.getCounts(), total = counts.total;
	if (counts.unread && counts.updated) {
		counts = '<span class="unread">' + counts.unread + '</span>' +
			'+' +
			'<span class="updated">' + counts.updated + '</span>';
	} else if (counts.unread) {
		counts = '<span class="unread">' + counts.unread + '</span>';
	} else if (counts.updated) {
		counts = '<span class="updated">' + counts.updated + '</span>';
	} else {
		counts = '0';
	}
	return counts + '/' + total;
};

Feed.prototype.show = function (element, max) {
	var update, list, li, title, feed, date, i, index, c = 0;
	max = max || Infinity;
	element.getElementsByClassName('feed-title')[0].textContent = this.title;
	element.getElementsByClassName('counts')[0].innerHTML = this.getCountsHtml();
	if (this.isUpdating) {
		update = util.translate('is-updating');
	} else if (this.date) {
		update = util.translate('last-update', {date: util.formatRelativeDate(this.date)});
	} else {
		update = '';
	}
	element.getElementsByClassName('last-update')[0].textContent = update;
	element.getElementsByClassName('search')[0].hidden = !this.isTimeline();
	list = element.getElementsByTagName('ul')[0];
	list.innerHTML = '';
	for (i = this.entries.length - 1; i >= 0; i--) {
		if (this.search) {
			index = this.entries[i].search(this.search);
			if (index === -1) {
				continue;
			}
		}
		c++;
		if (c <= max) {
			li = document.createElement('li');
			title = document.createElement('span');
			feed = document.createElement('span');
			date = document.createElement('span');
			title.className = 'title';
			feed.className = 'feed';
			date.className = 'date';
			li.appendChild(title);
			li.appendChild(feed);
			li.appendChild(date);
			this.entries[i].showList(li, this.isTimeline(), index, this.search);
			list.appendChild(li);
		}
	}
	if (c > max) {
		element.getElementsByClassName('show-all')[0].style.display = '';
	} else {
		element.getElementsByClassName('show-all')[0].style.display = 'none';
	}
};

Feed.prototype.showList = function (listItem) {
	var count, status;
	if (this.isUpdating) {
		status = 'updating';
		count = '';
	} else {
		count = this.getCounts(true);
		if (count.unread) {
			status = 'unread';
			count = String(count.unread);
		} else if (count.updated) {
			status = 'updated';
			count = String(count.updated);
		} else {
			status = 'read';
			count = '';
		}
	}
	if (this.loadingFailed && !this.isUpdating) {
		count += ' !';
	}
	listItem.className = status;
	listItem.getElementsByClassName('title')[0].textContent = this.title;
	listItem.getElementsByClassName('count')[0].textContent = count;
};

Feed.prototype.showConfig = function (element) {
	var input, i, filter;
	element.getElementsByClassName('feed-title')[0].textContent = this.title;
	element.getElementsByClassName('title')[0].value = this.title;
	element.getElementsByClassName('url')[0].value = this.url;
	input = element.getElementsByClassName('pause')[0];
	input.value = this.pause;
	input.dispatchEvent(new Event('blur'));
	element.getElementsByClassName('no-proxy')[0].checked = this.noProxy;
	element.getElementsByClassName('filter-mode')[0].value =
		this.filter ? (this.filter.include ? 'include' : 'exclude') : 'none';
	input = element.getElementsByClassName('filter-rule');
	for (i = 0; i < input.length; i++) {
		filter = this.filter && this.filter.rules[Math.floor(i / 3)];
		if (filter) {
			filter = filter[i % 3];
		} else {
			filter = i % 3 === 1 ? 'is' : '';
		}
		input[i].value = filter;
	}
	element.getElementsByClassName('filter-rule-table')[0].hidden = !this.filter;
};

Feed.prototype.hasUnread = function () {
	var counts = this.getCounts(true);
	return counts.unread > 0 || counts.updated > 0 || this.loadingFailed;
};

Feed.prototype.markAsRead = function () {
	var i;
	for (i = 0; i < this.entries.length; i++) {
		this.entries[i].markAsRead();
	}
	this.loadingFailed = false;
};

return Feed;

})();