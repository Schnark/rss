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
	search = search.toLowerCase();
	return this.title.toLowerCase().indexOf(search) > -1 ||
		this.author.toLowerCase().indexOf(search) > -1 ||
		this.url.toLowerCase().indexOf(search) > -1 ||
		this.content.toLowerCase().indexOf(util.escape(search)) > -1;
};

SingleEntry.prototype.show = function (element) {
	var link;
	element.getElementsByClassName('title')[0].textContent = this.title || util.translate('no-title');
	element.getElementsByClassName('author')[0].textContent = this.author;
	element.getElementsByClassName('date')[0].textContent = util.formatDate(this.date, true);
	link = element.getElementsByClassName('browse')[0];
	link.href = this.url;
	link.style.display = this.url ? '' : 'none';
	util.showHtml(element.getElementsByClassName('content')[0],
		this.content || util.translate('no-content'), this.url); //FIXME relative to feed URL ?
};

SingleEntry.prototype.showList = function (listItem) {
	listItem.getElementsByClassName('title')[0].textContent = this.title || util.translate('no-title');
	listItem.getElementsByClassName('date')[0].textContent = util.formatDate(this.date);
};

SingleEntry.prototype.markAsRead = function () {
	this.parent.markAsRead(this.getIndex());
};

return SingleEntry;

})();