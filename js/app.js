/*global Presenter*/
(function () {
"use strict";

var app = new Presenter({
	'banner-timeout': 5000,
	'tap-time': 1000,
	'tap-move': 20,
	'search-delay': 1000
});

if (navigator.mozSetMessageHandler) {
	navigator.mozSetMessageHandler('alarm', function () {
		app.handleAlarm();
	});
}

window.addEventListener('localized', function () {
	document.documentElement.lang = document.webL10n.getLanguage();
	document.documentElement.dir = document.webL10n.getDirection();
	app.run();
}, false);

})();