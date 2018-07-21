/*global Presenter: true, Collection, util*/
/*global URL, Blob, Event*/
Presenter =
(function () {
"use strict";

function Presenter (config) {
	var passiveSupported = false;
	this.config = config;

	this.resetReloadData();

	this.useTouch = 'ontouchstart' in document.documentElement;

	try {
		window.addEventListener('test', null, Object.defineProperty({}, 'passive', {
			get: function () {
				passiveSupported = true;
			}
		}));
	} catch (e) {
	}
	this.noPassive = passiveSupported ? {passive: false} : false;

	this.boundGlobalPreventHandler = this.globalPreventHandler.bind(this);

	this.pageCollection = document.getElementById('page-collection');
	this.pageFeed = document.getElementById('page-feed');
	this.pageEntry = document.getElementById('page-entry');
	this.pageFeedConfig = document.getElementById('page-feed-config');
	this.pageConfig = document.getElementById('page-config');
	this.infoBanner = document.getElementById('info-banner');

	this.bindTransitionEnd([this.pageCollection, this.pageFeed, this.pageEntry, this.pageFeedConfig, this.pageConfig]);

	this.bindClickHold('collection-list', this.onFeedClick, this.onFeedHold);
	this.bindClickHold('feed-list', this.onEntryClick, this.onEntryHold);

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
	this.bindClickHold('open-share', null, function () {
		var el = document.getElementById('open-share');
		this.ignoreClick();
		util.share(el.dataset.title, el.href);
	});
	this.bindMulti('reload', this.onReloadClick, function (index) {
		return index === 0;
	});
	this.bindMulti('go-back', this.onBackClick, function (index) {
		return index !== 1;
	});
	document.getElementById('page-config-add').addEventListener('click', function () {
		var url = this.pageConfig.getElementsByClassName('url')[0];
		if (url.checkValidity()) {
			url = url.value;
		} else {
			url = '';
		}
		this.addFeedFromUrl(url);
	}.bind(this));
	this.bindSimpleClick({
		'show-timeline': this.onTimelineClick,
		'show-all': this.onShowAllClick,
		'page-feed-config-save': this.onFeedConfigSaveClick,
		'page-feed-config-read': this.onFeedReadAllClick,
		'page-feed-config-remove': this.onFeedRemoveClick,
		'page-feed-config-raw': this.onFeedRawClick,
		'button-config': this.onConfigClick,
		'page-config-read': this.onReadAllClick,
		'page-config-save': this.onConfigSaveClick,
		'page-config-import': this.onConfigImportClick,
		'import-default': this.onDefaultImportClick
	});
	this.searchInput = document.getElementById('search-input');
	this.searchInput.addEventListener('keyup', function () {
		if (this.searchTimeout) {
			clearTimeout(this.searchTimeout);
		}
		this.searchTimeout = setTimeout(function () {
			this.onSearchUpdate(this.searchInput.value);
			this.searchTimeout = false;
		}.bind(this), this.config['search-delay']);
	}.bind(this));
	this.bindEnableSave('page-feed-config-save');
	this.bindEnableSave('page-config-add');
	this.bindEnableSave('page-config-save');

	document.addEventListener('visibilitychange', this.onVisibilityChange.bind(this));

	this.initSuggestor(document.getElementById('pause-input'), document.getElementById('pause-suggest'));
	this.initSuggestor(document.getElementById('max-multi-input'), document.getElementById('max-multi-suggest'));
	this.initSuggestor(document.getElementById('max-feed-input'), document.getElementById('max-feed-suggest'));
	this.initSuggestor(document.getElementById('cors-proxy-input'), document.getElementById('cors-proxy-suggest'));

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
		this.updateThemes();
		document.getElementById('page-loading').hidden = true;
		this.showPageCollection();
		if (this.startWithAlaram) {
			this.onAlarm();
		} else if (this.getConfig('auto-update') === 0) {
			this.doReload(this.collection);
		}
		if (this.startWithActivity) {
			this.onActivity(this.startWithActivity);
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

Presenter.prototype.handleActivity = function (data) {
	if (this.isReady) {
		this.onActivity(data);
	} else {
		this.startWithActivity = data;
	}
};

Presenter.prototype.saveData = function () {
	util.storage.set(this.collection.getJSON());
};

Presenter.prototype.resetReloadData = function () {
	this.reloadData = {
		counts: [0, 0],
		skipped: 0,
		done: 0,
		length: 0,
		timeout: false
	};
};

Presenter.prototype.doReload = function (list, notification) {
	if (this.reloadData.timeout) {
		clearTimeout(this.reloadData.timeout);
	}
	this.reloadData.length += list.getLength();
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
			this.reloadData.counts[0] += newCount;
			this.reloadData.counts[1] += updateCount;
			this.showInfo('reload-success', this.reloadData.counts);
			if (notification && this.reloadData.counts[0]) {
				util.showNotification();
				notification = false;
			}
		} else if (result === util.errors.SKIP) {
			this.reloadData.skipped++;
			if (this.reloadData.skipped === this.reloadData.length) {
				this.showInfo('reload-error', util.errors.SKIP);
			}
		} else {
			this.showInfo('reload-error', result);
		}
		this.reloadData.done++;
		if (this.reloadData.done === this.reloadData.length) {
			this.reloadData.timeout = setTimeout(this.resetReloadData.bind(this), this.config['banner-timeout']);
		}
	}.bind(this), list !== this.collection);
	this.updatePageCollection();
	this.updatePageFeed();
	this.showInfo('reload-start', list === this.collection);
};

Presenter.prototype.globalPreventHandler = function (e) {
	e.preventDefault();
	e.stopPropagation();
	if (e.type === 'click') {
		document.body.removeEventListener('click', this.boundGlobalPreventHandler, true);
		document.body.removeEventListener('touchstart', this.boundGlobalPreventHandler, this.noPassive);
		document.body.removeEventListener('touchend', this.boundGlobalPreventHandler, true);
	}
};

Presenter.prototype.ignoreClick = function () {
	//it's not really clear why all these and only these are needed, but this seems to work
	document.body.addEventListener('click', this.boundGlobalPreventHandler, true);
	document.body.addEventListener('touchstart', this.boundGlobalPreventHandler, this.noPassive);
	document.body.addEventListener('touchend', this.boundGlobalPreventHandler, true);
	setTimeout(function () {
		document.body.removeEventListener('click', this.boundGlobalPreventHandler, true);
		document.body.removeEventListener('touchstart', this.boundGlobalPreventHandler, this.noPassive);
		document.body.removeEventListener('touchend', this.boundGlobalPreventHandler, true);
	}.bind(this), 700); //animation takes 500ms
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
			that.ignoreClick();
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
			if (!click) {
				return;
			}
			e.preventDefault();
			if (!status.timeout) {
				return;
			}
			end();
		});
		list.addEventListener('contextmenu', function (e) {
			e.preventDefault();
			e.stopPropagation();
		});
	} else {
		list.addEventListener('mousedown', function (e) {
			if (e.button || this.className.indexOf('disabled') > -1) {
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
			if (!click) {
				return;
			}
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

Presenter.prototype.initSuggestor = function (input, select) {
	var ignoreBlur = false;
	select.addEventListener('change', function () {
		if (select.value) {
			input.value = select.value;
			input.dispatchEvent(new Event('input'));
			input.style.display = 'none';
		} else {
			input.style.display = '';
			ignoreBlur = true;
			input.focus();
			input.select();
			setTimeout(function () {
				ignoreBlur = false;
			}, 0);
		}
	});
	input.addEventListener('blur', function () {
		if (ignoreBlur) {
			//strange bug, where blur events are fired on number inputs for no apparent reason
			ignoreBlur = false;
			return;
		}
		select.value = input.value;
		if (input.value && (select.value === input.value)) {
			input.style.display = 'none';
		} else {
			select.value = '';
			input.style.display = '';
		}
	});
	input.value = select.value;
	input.style.display = 'none';
};

Presenter.prototype.updateAlarm = function () {
	util.setAlarm(this.getConfig('auto-update') * 60000);
};

Presenter.prototype.updateThemes = function () {
	document.body.className = this.getConfig('themes').map(function (theme) {
		return 'theme-' + theme;
	}).join(' ');
};

Presenter.prototype.scrollTop = function (page) {
	setTimeout(function () { //wait until visible
		page.getElementsByClassName('wrapper')[0].scrollTop = 0;
	}, 0);
};

Presenter.prototype.updatePageCollection = function () {
	this.collection.show(this.pageCollection.getElementsByTagName('ul')[0]);
};

Presenter.prototype.updatePageFeed = function (feed) {
	if (feed) {
		this.currentFeed = feed;
		this.scrollTop(this.pageFeed);
	}
	if (this.currentFeed) {
		this.currentFeed.show(this.pageFeed, this.showAllEntries ? Infinity : this.getConfig('max-entries-per-feed'));
	}
};

Presenter.prototype.updatePageEntry = function (entry, diffToNext, search) {
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
		this.currentEntryIndex = this.currentEntry.show(this.pageEntry, index, search);
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
	var input, themes, feedExport;

	this.pageConfig.getElementsByClassName('url')[0].value = 'https://';
	document.getElementById('page-config-add').disabled = true;
	input = this.pageConfig.getElementsByClassName('config-max-multi')[0];
	input.value = this.getConfig('max-entries-per-multi');
	input.dispatchEvent(new Event('blur'));
	input = this.pageConfig.getElementsByClassName('config-max-feed')[0];
	input.value = this.getConfig('max-entries-per-feed');
	input.dispatchEvent(new Event('blur'));
	this.pageConfig.getElementsByClassName('config-show-updates')[0].value = this.getConfig('show-updates');
	input = this.pageConfig.getElementsByClassName('config-cors-proxy')[0];
	input.value = this.getConfig('cors-proxy');
	input.dispatchEvent(new Event('blur'));
	this.pageConfig.getElementsByClassName('config-auto-update')[0].value = this.getConfig('auto-update');
	themes = this.getConfig('themes');
	this.pageConfig.getElementsByClassName('config-theme-dark')[0].checked = (themes.indexOf('dark') > -1);
	this.pageConfig.getElementsByClassName('config-theme-large')[0].checked = (themes.indexOf('large') > -1);
	this.pageConfig.getElementsByClassName('config-theme-expandurl')[0].checked = (themes.indexOf('expandurl') > -1);
	document.getElementById('page-config-save').disabled = true;
	feedExport = this.pageConfig.getElementsByClassName('feed-export')[0];
	if (feedExport.href) {
		URL.revokeObjectURL(feedExport.href);
	}
	feedExport.href = this.getOpmlDownload();
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
	this.updatePageEntry(this.currentFeed.getEntryByIndex(index), undefined, this.currentFeed.search);
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
	this.showAllEntries = true;
	this.updatePageFeed();
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

Presenter.prototype.addFeedFromUrl = function (url) {
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

Presenter.prototype.onFeedRawClick = function () {
	var pre = document.createElement('pre');
	pre.textContent = this.currentFeed.getRaw();
	document.getElementById('page-feed-config-raw-container').appendChild(pre);
	document.getElementById('page-feed-config-raw').disabled = true;
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
	var input, themes = [];
	input = this.pageConfig.getElementsByClassName('config-max-multi')[0];
	if (input.checkValidity()) {
		this.collection.setConfig('max-entries-per-multi', Number(input.value));
	}
	input = this.pageConfig.getElementsByClassName('config-max-feed')[0];
	if (input.checkValidity()) {
		this.collection.setConfig('max-entries-per-feed', Number(input.value));
	}
	input = this.pageConfig.getElementsByClassName('config-show-updates')[0];
	this.collection.setConfig('show-updates', Number(input.value));
	input = this.pageConfig.getElementsByClassName('config-cors-proxy')[0];
	if (input.checkValidity()) {
		this.collection.setConfig('cors-proxy', input.value);
	}
	input = this.pageConfig.getElementsByClassName('config-auto-update')[0];
	this.collection.setConfig('auto-update', Number(input.value));
	input = this.pageConfig.getElementsByClassName('config-theme-dark')[0];
	if (input.checked) {
		themes.push('dark');
	}
	input = this.pageConfig.getElementsByClassName('config-theme-large')[0];
	if (input.checked) {
		themes.push('large');
	}
	input = this.pageConfig.getElementsByClassName('config-theme-expandurl')[0];
	if (input.checked) {
		themes.push('expandurl');
	}
	this.collection.setConfig('themes', themes);
	this.saveData();
	this.updateAlarm();
	this.updateThemes();
	this.showPageCollection();
};

Presenter.prototype.importOpml = function (xml) {
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
};

Presenter.prototype.onConfigImportClick = function () {
	util.openOpml(this.importOpml.bind(this));
};

Presenter.prototype.onDefaultImportClick = function () {
	util.getXML('opml/' + util.translate('default-opml'), '', this.importOpml.bind(this));
};

Presenter.prototype.onAlarm = function () {
	this.doReload(this.collection, true);
	this.updateAlarm();
};

Presenter.prototype.onActivity = function (data) {
	switch (data.name) {
	case 'share':
		this.addFeedFromUrl(data.data.url);
		break;
	case 'open':
		util.readFile(data.data.blob, this.importOpml.bind(this));
	}
};

Presenter.prototype.onVisibilityChange = function () {
	if (!document.hidden) {
		this.showInfo();
	}
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
	this.showAllEntries = false; //reset "show all"
	this.showPage('pageCollection', true);
};

Presenter.prototype.showPageFeed = function () {
	this.showPage('pageFeed', this.currentPage === this.pageEntry);
};

Presenter.prototype.showPageEntry = function () {
	this.showPage('pageEntry');
};

Presenter.prototype.showPageFeedConfig = function () {
	document.getElementById('page-feed-config-raw-container').innerHTML = '';
	document.getElementById('page-feed-config-raw').disabled = !this.currentFeed.getRaw();
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
		case util.errors.SKIP: return util.translate('reload-error-skip');
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
	if (type) {
		this.infoBanner.innerHTML = this.getInfo(type, details);
		this.infoBanner.className = 'visible';
	}
	this.showInfoTimeout = setTimeout(function () {
		this.showInfoTimeout = false;
		if (document.hidden) {
			return;
		}
		this.infoBanner.className = '';
	}.bind(this), this.config['banner-timeout']);
};

return Presenter;

})();