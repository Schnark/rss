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
	this.entries.sort(util.compare);
	while (this.entries.length > this.getConfig('max-entries-per-multi')) {
		this.entries.shift();
	}
};

MultiEntry.prototype.show = function (element, index) {
	if (index === undefined) {
		index = this.entries.length - 1;
	}
	if (this.entries.length > 1) {
		element.getElementsByClassName('navigation')[0].hidden = false;
		element.getElementsByClassName('update')[0].textContent = (index + 1) + '/' + this.entries.length;
		element.getElementsByClassName('prev')[0].className = 'prev' + (index === 0 ? ' disabled' : '');
		element.getElementsByClassName('next')[0].className = 'next' + (index === this.entries.length - 1 ? ' disabled' : '');
	} else {
		element.getElementsByClassName('navigation')[0].hidden = true;
	}
	element.getElementsByClassName('feed-title')[0].textContent = this.parent.getTitle();
	this.entries[index].show(element);
	return index;
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