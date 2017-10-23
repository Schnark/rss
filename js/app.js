/*global Presenter, util*/
(function () {
"use strict";

var app = new Presenter({
	'banner-timeout': 3500,
	'tap-time': 1000,
	'tap-move': 20,
	'search-delay': 1000
});

util.handleAlarm(app.handleAlarm.bind(app));

window.addEventListener('localized', function () {
	document.documentElement.lang = document.webL10n.getLanguage();
	document.documentElement.dir = document.webL10n.getDirection();
	app.run();
}, false);

})();