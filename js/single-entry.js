/*global SingleEntry: true, util*/
SingleEntry =
(function () {
"use strict";

function SingleEntry (parent, data) {
	this.parent = parent;
	this.title = data.title;
	this.author = data.author;
	this.date = new Date(data.date);
	this.url = data.url;
	this.content = data.content;
}

SingleEntry.prototype.getConfig = function (key) {
	return this.parent.getConfig(key);
};

SingleEntry.prototype.getJSON = function () {
	return {
		title: this.title,
		author: this.author,
		date: Number(this.date),
		url: this.url,
		content: this.content
	};
};

SingleEntry.prototype.sortKey = function (alt) {
	return alt ? this.title : Number(this.date);
};

SingleEntry.prototype.compareWith = function (other) {
	return ((this.title === other.title ? 1 : 0) +
		(this.author === other.author ? 1 : 0) +
		(Number(this.date) === Number(other.date) ? 1 : 0) +
		(this.url === other.url ? 1 : 0) +
		(this.content === other.content ? 1 : 0)) / 5;
};

SingleEntry.prototype.getIndex = function () {
	return this.parent.getIndex(this);
};

SingleEntry.prototype.search = function (search) {
	return util.search(search, util.escape(this.title), true).length ||
		util.search(search, util.escape(this.author), true).length ||
		util.search(search, util.escape(this.url), true).length ||
		util.search(search, this.content, true).length;
};

SingleEntry.prototype.show = function (element, search) {
	var link, content;
	link = element.getElementsByClassName('browse')[0];
	link.href = this.url;
	link.style.display = this.url ? '' : 'none';
	element.getElementsByClassName('date')[0].textContent = util.formatDate(this.date, true);
	content = this.content;
	if (search) {
		element.getElementsByClassName('title')[0].innerHTML =
			util.highlight(search, util.escape(this.title)) || util.translate('no-title');
		element.getElementsByClassName('author')[0].innerHTML = util.highlight(search, util.escape(this.author));
		content = util.highlight(search, content);
	} else {
		element.getElementsByClassName('title')[0].textContent = this.title || util.translate('no-title');
		element.getElementsByClassName('author')[0].textContent = this.author;
	}
	util.showHtml(
		element.getElementsByClassName('content')[0],
		content || util.translate('no-content'),
		this.url, //FIXME relative to feed URL ?
		this.getConfig('cors-proxy') //use proxy for http if necessary
	);
};

SingleEntry.prototype.showList = function (listItem, search) {
	if (search) {
		listItem.getElementsByClassName('title')[0].innerHTML =
			util.highlight(search, util.escape(this.title)) || util.translate('no-title');
	} else {
		listItem.getElementsByClassName('title')[0].textContent = this.title || util.translate('no-title');
	}
	listItem.getElementsByClassName('date')[0].textContent = util.formatDate(this.date);
};

SingleEntry.prototype.markAsRead = function () {
	this.parent.markAsRead(this.getIndex());
};

return SingleEntry;

})();