/*global MultiEntry: true, SingleEntry, util*/
MultiEntry =
(function () {
"use strict";

function MultiEntry (parent, data) {
	this.parent = parent;
	this.entries = data.entries.map(function (entry) {
		return new SingleEntry(this, entry);
	}, this);
	this.read = data.read;
}

MultiEntry.prototype.getConfig = function (key) {
	return this.parent.getConfig(key);
};

MultiEntry.prototype.getJSON = function () {
	return {
		entries: this.entries.map(function (entry) {
			return entry.getJSON();
		}),
		read: this.read
	};
};

MultiEntry.prototype.sortKey = function (alt) {
	return this.entries[this.entries.length - 1].sortKey(alt);
};

MultiEntry.prototype.getIndex = function (entry) {
	return this.entries.indexOf(entry);
};

MultiEntry.prototype.search = function (search) {
	var i;
	for (i = this.entries.length - 1; i >= 0; i--) {
		if (this.entries[i].search(search)) {
			return i;
		}
	}
	return -1;
};

MultiEntry.prototype.getStatus = function () {
	if (this.read === 0) {
		return 'unread';
	} else if (this.read < this.entries.length) {
		return 'updated';
	} else {
		return 'read';
	}
};

MultiEntry.prototype.shouldAdd = function (data) {
	var i, compare, isSame = false;
	for (i = 0; i < this.entries.length; i++) {
		compare = this.entries[i].compareWith(data);
		if (compare === 1) {
			return -1;
		}
		if (compare > 0.5) {
			isSame = true;
		}
	}
	return isSame ? 1 : 0;
};

MultiEntry.prototype.add = function (data) {
	this.entries.push(new SingleEntry(this, data));
	while (this.entries.length > this.getConfig('max-entries-per-multi')) {
		this.entries.shift();
		if (this.read > 1) {
			//this will always mark the oldest entry as read when you read at least one entry
			//even if you haven't, but this shouldn't happen under normal circumstances anyway
			//and IMHO is better than marking such an entry as completely unread
			this.read--;
		}
	}
};

MultiEntry.prototype.show = function (element, index) {
	if (index === undefined) {
		index = this.entries.length - 1;
	}
	if (this.entries.length > 1) {
		element.getElementsByClassName('navigation')[0].hidden = false;
		element.getElementsByClassName('update')[0].textContent =
			util.translate('entry-a-of-b', {a: index + 1, b: this.entries.length});
		element.getElementsByClassName('prev')[0].className = 'prev' + (index === 0 ? ' disabled' : '');
		element.getElementsByClassName('next')[0].className = 'next' + (index === this.entries.length - 1 ? ' disabled' : '');
	} else {
		element.getElementsByClassName('navigation')[0].hidden = true;
	}
	element.getElementsByClassName('feed-title')[0].textContent = this.parent.getTitle();
	this.entries[index].show(element);
	return index;
};

MultiEntry.prototype.showDiff = function (element, i1, i2) {
	var oldEntry = this.entries[i1].getJSON(), newEntry = this.entries[i2].getJSON(),
		diff = {}, link;

	function makeLink (url) {
		return '<a href="' + util.escape(url) + '" target="_blank">' + util.escape(url) + '</a>';
	}

	if (oldEntry.title === newEntry.title) {
		diff.title = util.escape(oldEntry.title) || util.translate('no-title');
	} else {
		diff.title = util.diff(oldEntry.title, newEntry.title);
	}
	if (oldEntry.author === newEntry.author) {
		diff.author = oldEntry.author;
	} else {
		diff.author = util.translate('diff-author', {a: oldEntry.author, b: newEntry.author});
	}
	if (oldEntry.date === newEntry.date) {
		diff.date = util.formatDate(new Date(oldEntry.date), true);
	} else {
		diff.date = util.translate('diff-date', {
			a: util.formatDate(new Date(oldEntry.date), true),
			b: util.formatDate(new Date(newEntry.date), true)
		});
	}
	if (oldEntry.url === newEntry.url) {
		diff.url = false;
	} else {
		diff.url = util.translate('diff-url', {a: makeLink(oldEntry.url), b: makeLink(newEntry.url)});
	}
	if (oldEntry.content === newEntry.content) {
		diff.content = util.translate('no-diff-content');
	} else {
		diff.content = util.diff(oldEntry.content, newEntry.content);
	}

	element.getElementsByClassName('feed-title')[0].textContent = this.parent.getTitle();
	element.getElementsByClassName('navigation')[0].hidden = false;
	element.getElementsByClassName('update')[0].textContent = util.translate('diff-a-to-b', {a: i1 + 1, b: i2 + 1});
	element.getElementsByClassName('prev')[0].className = 'prev';
	element.getElementsByClassName('next')[0].className = 'next';
	element.getElementsByClassName('title')[0].innerHTML = diff.title;
	element.getElementsByClassName('author')[0].textContent = diff.author;
	element.getElementsByClassName('date')[0].textContent = diff.date;

	link = element.getElementsByClassName('browse')[0];
	if (diff.url) {
		link.href = '';
		link.style.display = 'none';
		diff.content = diff.url + '<br>' + diff.content;
	} else {
		link.href = oldEntry.url;
		link.style.display = oldEntry.url ? '' : 'none';
	}
	util.showHtml(element.getElementsByClassName('content')[0], diff.content, newEntry.url); //FIXME
};

MultiEntry.prototype.showList = function (listItem, includeFeedTitle, index) {
	listItem.className = this.getStatus();
	if (includeFeedTitle) {
		listItem.getElementsByClassName('feed')[0].textContent = this.parent.getTitle();
	}
	if (index === undefined) {
		index = this.entries.length - 1;
	}
	this.entries[index].showList(listItem);
};

MultiEntry.prototype.markAsRead = function (index) {
	if (index === undefined) {
		index = this.entries.length - 1;
	}
	index++;
	if (index !== 0) {
		index = Math.max(index, this.read);
	}
	this.read = index;
};

MultiEntry.prototype.toggleRead = function () {
	var isRead = (this.read === this.entries.length);
	if (isRead) {
		this.markAsRead(-1);
	} else {
		this.markAsRead();
	}
	return !isRead;
};

return MultiEntry;

})();