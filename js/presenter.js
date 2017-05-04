/*global Presenter: true, Collection, util*/
/*global URL, Blob*/
Presenter =
(function () {
"use strict";

function Presenter (config) {
	var that = this;
	this.config = config;

	this.useTouch = 'ontouchstart' in document.documentElement;

	this.pageCollection = document.getElementById('page-collection');
	this.pageFeed = document.getElementById('page-feed');
	this.pageEntry = document.getElementById('page-entry');
	this.pageFeedConfig = document.getElementById('page-feed-config');
	this.pageConfig = document.getElementById('page-config');
	this.infoBanner = document.getElementById('info-banner');

	this.bindTransitionEnd([this.pageCollection, this.pageFeed, this.pageEntry, this.pageFeedConfig, this.pageConfig]);

	this.bindClickHold('collection-list', this.onFeedClick, this.onFeedHold);
	this.bindClickHold('feed-list', this.onEntryClick, this.onEntryHold);

	this.bindShield(this.pageFeedConfig);

	this.bindClickHold('navigate-prev', function () {
		this.onPrevNextClick(-1);
	}, function () {
		this.onPrevNextHold(-1);
	});
	this.bindClickHold('navigate-next', function () {
		this.onPrevNextClick(1);
	}, function () {
		this.onPrevNextHold(1);
	});
	this.bindMulti('reload', this.onReloadClick, function (index) {
		return index === 0;
	});
	this.bindMulti('go-back', this.onBackClick, function (index) {
		return index !== 1;
	});
	document.getElementById('page-config-add').addEventListener('click', function () {
		var url = that.pageConfig.getElementsByClassName('url')[0];
		if (url.checkValidity()) {
			url = url.value;
		} else {
			url = '';
		}
		that.onAddClick(url);
	});
	this.bindSimpleClick({
		'show-timeline': this.onTimelineClick,
		'show-all': this.onShowAllClick,
		'page-feed-config-save': this.onFeedConfigSaveClick,
		'page-feed-config-read': this.onFeedReadAllClick,
		'page-feed-config-remove': this.onFeedRemoveClick,
		'button-config': this.onConfigClick,
		'page-config-read': this.onReadAllClick,
		'page-config-save': this.onConfigSaveClick,
		'page-config-import': this.onConfigImportClick
	});
	this.searchInput = document.getElementById('search-input');
	this.searchInput.addEventListener('keyup', function () {
		if (that.searchTimeout) {
			clearTimeout(that.searchTimeout);
		}
		that.searchTimeout = setTimeout(function () {
			that.onSearchUpdate(that.searchInput.value);
			that.searchTimeout = false;
		}, that.config['search-delay']);
	});
	this.bindEnableSave('page-feed-config-save');
	this.bindEnableSave('page-config-add');
	this.bindEnableSave('page-config-save');

	util.storage.get(this.init.bind(this));
}

Presenter.prototype.getConfig = function (key) {
	return this.collection.getConfig(key);
};

Presenter.prototype.init = function (data) {
	this.collection = new Collection(data);
	this.run();
};

Presenter.prototype.run = function () {
	if (this.canRun) {
		this.updatePageCollection();
		document.getElementById('page-loading').hidden = true;
		this.showPageCollection();
		if (this.startWithAlaram) {
			this.onAlarm();
		} else if (this.getConfig('auto-update') === 0) {
			this.doReload(this.collection);
		}
		this.isReady = true;
	} else {
		this.canRun = true;
	}
};

Presenter.prototype.handleAlarm = function () {
	if (this.isReady) {
		this.onAlarm();
	} else {
		this.startWithAlaram = true;
	}
};

Presenter.prototype.saveData = function () {
	util.storage.set(this.collection.getJSON());
};

Presenter.prototype.doReload = function (list, notification) {
	var counts = [0, 0];
	list.reload(function (result, feed, newCount, updateCount) {
		if (result === util.errors.NOFEED) {
			this.showInfo('reload-nofeed');
			return;
		}
		this.updatePageCollection();
		if ((newCount + updateCount) && this.currentFeed && this.currentFeed.isTimeline()) {
			this.currentFeed.updateTimeline();
		}
		if (feed === this.currentFeed || (this.currentFeed && this.currentFeed.isTimeline())) {
			this.updatePageFeed();
		}
		if (result === util.errors.OK) {
			this.saveData();
			counts[0] += newCount;
			counts[1] += updateCount;
			this.showInfo('reload-success', counts);
			if (notification && counts[0]) {
				util.showNotification();
				notification = false;
			}
		} else if (result !== util.errors.SKIP) {
			this.showInfo('reload-error', result);
		}
	}.bind(this), list !== this.collection);
	this.updatePageCollection();
	this.updatePageFeed();
	this.showInfo('reload-start', list === this.collection);
};

Presenter.prototype.bindClickHold = function (id, click, hold) {
	var that = this, list = document.getElementById(id), status = {},
		isList = list.tagName.toLowerCase() === 'ul',
		tapTime = this.config['tap-time'],
		tapMove = this.config['tap-move'];

	function start (data) {
		if (status.timeout) {
			clearTimeout(status.timeout);
			status.timeout = false;
		}
		if (data.index === -1) {
			return;
		}
		status.x = data.x;
		status.y = data.y;
		status.index = data.index;
		status.timeout = setTimeout(function () {
			status.timeout = false;
			that.ignoreTouchstart = true;
			setTimeout(function () {
				that.ignoreTouchstart = false;
			}, 500);
			hold.call(that, status.index);
		}, tapTime);
	}

	function move (data) {
		var dx = status.x - data.x, dy = status.y - data.y;
		if (
			status.index !== data.index ||
			dx * dx + dy * dy > tapMove * tapMove
		) {
			clearTimeout(status.timeout);
			status.timeout = false;
		}
	}

	function end () {
		clearTimeout(status.timeout);
		status.timeout = false;
		setTimeout(function () {
			click.call(that, status.index);
		}, 0);
	}

	if (this.useTouch) {
		list.addEventListener('touchstart', function (e) {
			if (this.className.indexOf('disabled') > -1) {
				return;
			}
			var touch = e.changedTouches[0];
			start({
				x: touch.screenX, y: touch.screenY,
				index: isList ? Array.prototype.indexOf.call(list.childNodes, util.getParentNode(e.target, 'li')) : 0
			});
		});
		list.addEventListener('touchmove', function (e) {
			var touch = e.changedTouches[0];
			if (!status.timeout) {
				return;
			}
			move({
				x: touch.screenX, y: touch.screenY,
				index: isList ? Array.prototype.indexOf.call(list.childNodes, util.getParentNode(e.target, 'li')) : 0
			});
		});
		list.addEventListener('touchend', function (e) {
			e.preventDefault();
			if (!status.timeout) {
				return;
			}
			end();
		});
	} else {
		list.addEventListener('mousedown', function (e) {
			if (this.className.indexOf('disabled') > -1) {
				return;
			}
			start({
				x: e.screenX, y: e.screenY,
				index: isList ? Array.prototype.indexOf.call(list.childNodes, util.getParentNode(e.target, 'li')) : 0
			});
		});
		list.addEventListener('mousemove', function (e) {
			if (!status.timeout) {
				return;
			}
			move({
				x: e.screenX, y: e.screenY,
				index: isList ? Array.prototype.indexOf.call(list.childNodes, util.getParentNode(e.target, 'li')) : 0
			});
		});
		list.addEventListener('mouseup', function (e) {
			e.preventDefault();
			if (!status.timeout) {
				return;
			}
			end();
		});
	}
};

Presenter.prototype.bindMulti = function (cls, click, indexToArg) {
	var that = this, i, els;
	function getHandler (index) {
		var arg = indexToArg(index);
		return function () {
			click.call(that, arg);
		};
	}
	els = document.getElementsByClassName(cls);
	for (i = 0; i < els.length; i++) {
		els[i].addEventListener('click', getHandler(i));
	}
};

Presenter.prototype.bindSimpleClick = function (map) {
	var that = this, id;

	function getHandler (id) {
		return function () {
			map[id].call(that);
		};
	}

	for (id in map) {
		if (map.hasOwnProperty(id)) {
			document.getElementById(id).addEventListener('click', getHandler(id));
		}
	}
};

Presenter.prototype.bindShield = function (element) {
	var acceptEnd = false;
	if (this.useTouch) {
		element.addEventListener('touchstart', function () {
			if (this.ignoreTouchstart) {
				this.ignoreTouchstart = false;
			} else {
				acceptEnd = true;
			}
		});
		element.addEventListener('touchend', function (e) {
			if (!acceptEnd) {
				e.preventDefault();
			}
			acceptEnd = false;
		});
	} else {
		element.addEventListener('mousedown', function () {
			if (this.ignoreTouchstart) {
				this.ignoreTouchstart = false;
			} else {
				acceptEnd = true;
			}
		});
		element.addEventListener('mouseup', function (e) {
			if (!acceptEnd) {
				e.preventDefault();
			}
			acceptEnd = false;
		});
	}
};

Presenter.prototype.bindTransitionEnd = function (pages) {
	var i;

	function handler () {
		/*jshint validthis: true*/
		if (this.className.indexOf('hide-to-') === 0) {
			this.hidden = true;
			this.className = '';
		}
	}

	for (i = 0; i < pages.length; i++) {
		pages[i].hidden = true;
		pages[i].addEventListener('transitionend', handler);
	}
};

Presenter.prototype.bindEnableSave = function (id) {
	var i,
		button = document.getElementById(id),
		inputs = document.getElementsByClassName(id);

	function handler () {
		button.disabled = false;
	}

	for (i = 0; i < inputs.length; i++) {
		inputs[i].addEventListener('input', handler);
		inputs[i].addEventListener('change', handler);
	}
};

Presenter.prototype.updateAlarm = function () {
	util.setAlarm(this.getConfig('auto-update') * 60000);
};

Presenter.prototype.scrollTop = function (page) {
	setTimeout(function () { //wait until visible
		page.getElementsByClassName('wrapper')[0].scrollTop = 0;
	}, 0);
};

Presenter.prototype.updatePageCollection = function () {
	this.collection.show(this.pageCollection.getElementsByTagName('ul')[0]);
};

Presenter.prototype.updatePageFeed = function (feed, all) {
	if (feed) {
		this.currentFeed = feed;
		this.scrollTop(this.pageFeed);
	}
	if (this.currentFeed) {
		this.currentFeed.show(this.pageFeed, all ? Infinity : this.getConfig('max-entries-per-feed'));
	}
};

Presenter.prototype.updatePageEntry = function (entry, diffToNext) {
	var index;
	if (diffToNext) {
		this.currentEntry.showDiff(this.pageEntry, entry, entry + 1);
		this.currentEntryIndex = entry;
	} else {
		if (Array.isArray(entry)) {
			this.currentEntry = entry[0];
			index = entry[1];
		} else if (typeof entry === 'number') {
			index = entry;
		} else if (entry) {
			this.currentEntry = entry;
		}
		this.currentEntryIndex = this.currentEntry.show(this.pageEntry, index);
	}
	this.currentEntryDiff = diffToNext;
	this.scrollTop(this.pageEntry);
};

Presenter.prototype.updatePageFeedConfig = function () {
	this.currentFeed.showConfig(this.pageFeedConfig);
	document.getElementById('page-feed-config-save').disabled = true;
	this.scrollTop(this.pageFeedConfig);
};

Presenter.prototype.updatePageConfig = function () {

	function setSelectedIndex (select, val) {
		var options = select.getElementsByTagName('option'), i;
		for (i = 0; i < options.length; i++) {
			if (Number(options[i].value) === val) {
				select.selectedIndex = i;
				return;
			}
		}
	}

	this.pageConfig.getElementsByClassName('url')[0].value = 'http://';
	document.getElementById('page-config-add').disabled = true;
	this.pageConfig.getElementsByClassName('config-max-multi')[0].value = this.getConfig('max-entries-per-multi');
	this.pageConfig.getElementsByClassName('config-max-feed')[0].value = this.getConfig('max-entries-per-feed');
	this.pageConfig.getElementsByClassName('config-cors-proxy')[0].value = this.getConfig('cors-proxy');
	setSelectedIndex(this.pageConfig.getElementsByClassName('config-auto-update')[0], this.getConfig('auto-update'));
	document.getElementById('page-config-save').disabled = true;
	this.pageConfig.getElementsByClassName('feed-export')[0].href = this.getOpmlDownload();
	this.scrollTop(this.pageConfig);
};

Presenter.prototype.onFeedClick = function (index) {
	this.updatePageFeed(this.collection.getFeedByIndex(index));
	this.showPageFeed();
};

Presenter.prototype.onFeedHold = function (index) {
	this.currentFeed = this.collection.getFeedByIndex(index);
	this.updatePageFeedConfig();
	this.showPageFeedConfig();
};

Presenter.prototype.onEntryClick = function (index) {
	this.searchInput.blur();
	this.updatePageEntry(this.currentFeed.getEntryByIndex(index));
	this.currentEntry.markAsRead();
	this.showPageEntry();
	this.updatePageCollection();
	this.updatePageFeed();
	this.saveData();
};

Presenter.prototype.onEntryHold = function (index) {
	this.searchInput.blur();
	this.currentFeed.getEntryByIndex(index, true).toggleRead();
	this.updatePageFeed();
	this.updatePageCollection();
	this.saveData();
};

Presenter.prototype.onPrevNextClick = function (dir) {
	var nextId;
	if (this.currentEntryDiff) {
		nextId = dir === -1 ? this.currentEntryIndex : this.currentEntryIndex + 1;
	} else {
		nextId = this.currentEntryIndex + dir;
	}
	this.updatePageEntry(nextId);
};

Presenter.prototype.onPrevNextHold = function (dir) {
	var nextId;
	if (this.currentEntryDiff) {
		nextId = this.currentEntryIndex + dir;
	} else {
		nextId = dir === -1 ? this.currentEntryIndex - 1 : this.currentEntryIndex;
	}
	if (nextId === -1) {
		return;
	}
	this.updatePageEntry(nextId, true);
};

Presenter.prototype.onTimelineClick = function () {
	this.updatePageFeed(this.collection.getTimeline());
	this.searchInput.value = '';
	this.showPageFeed();
};

Presenter.prototype.onShowAllClick = function () {
	this.updatePageFeed(null, true);
};

Presenter.prototype.onSearchUpdate = function (search) {
	if (this.currentFeed.updateSearch(search)) {
		this.updatePageFeed();
	}
};

Presenter.prototype.onReloadClick = function (all) {
	this.doReload(all ? this.collection : this.currentFeed);
};

Presenter.prototype.onBackClick = function (toCollection) {
	if (toCollection) {
		this.showPageCollection();
	} else {
		this.showPageFeed();
	}
};

Presenter.prototype.onAddClick = function (url) {
	if (!url) {
		this.showInfo('feed-add-error');
		return;
	}
	this.collection.add(url, function (result, feed) {
		if (result === util.errors.OK) {
			this.updatePageFeed(feed);
			this.showPageFeed();
			this.showInfo('feed-add-success');
			this.updatePageCollection();
			this.saveData();
		} else {
			this.showInfo('feed-add-error', result);
		}
	}.bind(this));
	this.showInfo('feed-add-start');
};

Presenter.prototype.onFeedConfigSaveClick = function () {
	if (this.currentFeed.updateSettings(this.pageFeedConfig)) {
		this.updatePageCollection();
		this.updatePageFeed();
		this.onBackClick(true);
		this.saveData();
		this.showInfo('feed-config-done');
	} else {
		this.showInfo('feed-config-error');
	}
};

Presenter.prototype.onFeedReadAllClick = function () {
	this.currentFeed.markAsRead();
	this.updatePageCollection();
	this.updatePageFeed();
	this.onBackClick(true);
	this.saveData();
};

Presenter.prototype.onFeedRemoveClick = function () {
	if (window.confirm(util.translate('confirm-remove'))) {
		this.collection.remove(this.currentFeed);
		this.updatePageCollection();
		this.onBackClick(true);
		this.saveData();
		this.showInfo('feed-config-removed');
	}
};

Presenter.prototype.onConfigClick = function () {
	this.updatePageConfig();
	this.showPageConfig();
};

Presenter.prototype.onReadAllClick = function () {
	this.collection.markAsRead();
	this.updatePageCollection();
	this.updatePageFeed();
	this.onBackClick(true);
	this.saveData();
};

Presenter.prototype.onConfigSaveClick = function () {
	var input;
	input = this.pageConfig.getElementsByClassName('config-max-multi')[0];
	if (input.checkValidity()) {
		this.collection.setConfig('max-entries-per-multi', Number(input.value));
	}
	input = this.pageConfig.getElementsByClassName('config-max-feed')[0];
	if (input.checkValidity()) {
		this.collection.setConfig('max-entries-per-feed', Number(input.value));
	}
	input = this.pageConfig.getElementsByClassName('config-cors-proxy')[0];
	if (input.checkValidity()) {
		this.collection.setConfig('cors-proxy', input.value);
	}
	input = this.pageConfig.getElementsByClassName('config-auto-update')[0];
	this.collection.setConfig('auto-update', Number(input.options[input.selectedIndex].value));
	this.saveData();
	this.updateAlarm();
	this.showPageCollection();
};

Presenter.prototype.onConfigImportClick = function () {
	util.getOpmlFile(function (xml) {
		var added;
		if (!xml) {
			this.showInfo('no-opml');
			return;
		}
		added = this.collection.addFromOPML(xml);
		if (added) {
			this.updatePageCollection();
			this.saveData();
		}
		this.showInfo('opml-imported', added);
	}.bind(this));
};

Presenter.prototype.onAlarm = function () {
	this.doReload(this.collection, true);
	this.updateAlarm();
};

Presenter.prototype.showPage = function (id, hideToRight) {
	if (this.currentPage) {
		this.currentPage.className = hideToRight ? 'hide-to-right' : 'hide-to-left';
	}
	this.currentPage = this[id];
	this.currentPage.className = ''; //just in case it is still animating
	this.currentPage.hidden = false;
};

Presenter.prototype.showPageCollection = function () {
	this.showPage('pageCollection', true);
};

Presenter.prototype.showPageFeed = function () {
	this.showPage('pageFeed', this.currentPage === this.pageEntry);
};

Presenter.prototype.showPageEntry = function () {
	this.showPage('pageEntry');
};

Presenter.prototype.showPageFeedConfig = function () {
	this.showPage('pageFeedConfig');
};

Presenter.prototype.showPageConfig = function () {
	this.showPage('pageConfig');
};

Presenter.prototype.getOpmlDownload = function () {
	return URL.createObjectURL(new Blob([this.collection.getOPML()],
		{type: 'image/png'})); //this is ridiculous, but download for unknown (= most other) MIME types fails
};

Presenter.prototype.getInfo = function (type, details) {
	switch (type) {
	case 'reload-start':
		return details ? util.translate('reload-all-feeds') : util.translate('reload-feed');
	case 'reload-success':
		if (details[0] === 0 && details[1] === 0) {
			return util.translate('reload-no-updates');
		}
		if (details[0] === 0) {
			return util.translate('reload-only-updates', details[1]);
		}
		return util.translate('reload-new', details[0]);
	case 'reload-error':
		switch (details) {
		case util.errors.SKIP: return util.translate('reload-error-skip'); //currently not needed
		case util.errors.HTTP: return util.translate('reload-error-http');
		case util.errors.XML: return util.translate('reload-error-xml');
		}
		return util.translate('reload-error'); //shouldn't happen
	case 'feed-add-error':
		switch (details) {
		case util.errors.HTTP: return util.translate('add-error-http');
		case util.errors.XML: return util.translate('add-error-xml');
		case util.errors.EXISTS: return util.translate('add-error-exists');
		}
		return util.translate('add-error-url');
	case 'debug':
		return 'Debug: ' + details; //shouldn't happen in production
	default: return util.translate(type, details);
	}
};

Presenter.prototype.showInfo = function (type, details) {
	if (this.showInfoTimeout) {
		clearTimeout(this.showInfoTimeout);
	}
	this.infoBanner.innerHTML = this.getInfo(type, details);
	this.infoBanner.className = 'visible';
	this.showInfoTimeout = setTimeout(function () {
		this.showInfoTimeout = false;
		this.infoBanner.className = '';
	}.bind(this), this.config['banner-timeout']);
};

return Presenter;

})();