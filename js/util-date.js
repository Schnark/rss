/*global util*/
(function () {
"use strict";

function isToday (date) {
	var now = new Date();
	return now.getFullYear() === date.getFullYear() &&
		now.getMonth() === date.getMonth() &&
		now.getDate() === date.getDate();
}

function pad (n) {
	return n < 10 ? '0' + String(n) : String(n);
}

function formatDayMonth (date) {
	return util.translate('date-format', {day: date.getDate(), month: util.translate('month-' + date.getMonth())});
}

function formatHourMinute (date) {
	var h = date.getHours(), m = date.getMinutes();
	return util.translate('time-format', {h: h, hh: pad(h), m: m, mm: pad(m)});
}

function formatRelativeDate (date) {
	var diff = Number(new Date()) - Number(date);
	diff = Math.round(diff / 1000);
	if (diff < 41) { //seconds
		return util.translate('just-now');
	}
	diff = Math.round(diff / 60);
	if (diff < 56) { //minutes
		return util.translate('minutes-ago', diff);
	}
	diff = Math.round(diff / 60);
	if (diff < 23) { //hours
		return util.translate('hours-ago', diff);
	}
	diff = Math.round(diff / 24);
	if (diff < 28) { //days
		return util.translate('days-ago', diff);
	}
	diff = Math.round(diff / 30.4375);
	if (diff < 12) { //months
		return util.translate('months-ago', diff);
	}
	diff = Math.round(diff / 12);
	return util.translate('years-ago', diff);
}

function formatDate (date, long) {
	var msg = 'date-time-long';
	if (!long) {
		msg = isToday(date) ? 'date-time-today' : 'date-time-short';
	}
	return util.translate(msg, {
		date: formatDayMonth(date),
		time: formatHourMinute(date),
		relative: formatRelativeDate(date)
	});
}

function tz (diff) {
	var sign = diff <= 0 ? '+' : '-',
		h, m;
	diff = Math.abs(diff);
	m = diff % 60;
	h = (diff - m) / 60;
	return sign + pad(h) + pad(m);
}

function formatOpmlDate (date) {
	return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()] + ', ' +
		date.getDate() + ' ' +
		['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()] + ' ' +
		date.getFullYear() + ' ' +
		pad(date.getHours()) + ':' +
		pad(date.getMinutes()) + ':' +
		pad(date.getSeconds()) + ' ' +
		tz(date.getTimezoneOffset());
}

util.formatRelativeDate = formatRelativeDate;
util.formatDate = formatDate;
util.formatOpmlDate = formatOpmlDate;

})();