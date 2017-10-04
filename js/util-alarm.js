/*global util*/
/*global Notification*/
(function () {
"use strict";

var alarmViaTimeout = {}, icon =
//jscs:disable maximumLineLength
	'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAACXlBMVEX////udzPodjLmeDLndzLoezLfcDDndjDmdjDmdzHoezLoezPnfTPvgDDVgCvkdC/mdjDpfTTpfTPndy/ldTDqfjPnfTXldi7ldTDqgDXrgDTldTDqgDXrgDjrgjbtgjXrgzf/gCvthDjshDfvgEDuhDfthjjthjnuiDPtiTvvhznuiDnviznvijrvijvujDzvizvvj0DvjTrwjDrwjDvtjjvwjDvvjTvmdzHneDHneTLnejLoejLmdjDoezLoezPofDPpfDPpfTTpfjTqfjTqfzXqgDXrgTbrk1vys4vvpnbtmGHofjjrgjbyuJP////++fb41r/xroHpgjzrgzfsgzf1xaf98+3ytInpgDjshDfyto/64dH87uX//fz87uTvnGPshTjpg0Dwqnr30rn//Pv//PrysYTthTjsj1D30rj//v71xKHthjjskVXzu5Xvom3riEXwpG/+9/Pzs4XthjnthznytY387+bxqnntk1P87eLwoGXuhzn30Lb41r7sikbulFT++PPshjvuiDnzupP64tL++vj99e/wo2zxpnD///70uIvuiTrpgDbvm2L75tftjUf41Ln99O3uikHqgTj0u5P5177vlVL//fv0tYTvijr0vJTyrXv51bv52cHvoGn3zbHxq3rqgTfrhDn75tj98OfzsH3++vbviz/tk1XyrHvwn2TukErujkTypGfvizvztYv3zrHshDn++/jyqHH98Ob0sXzsjEj+/Pnwomr75NL2wJj75NP1vZHtjUnzt4vullb1vpb507j1vJDwmlr2vpP4zav2wZfyomKasvhJAAAAOHRSTlMADzhRazgQarr6+rpqEAZy7e1yK9raK07y8k79/U7yK9oGcu0Qarr6DzhRa1H6umrtEHLa8iv9TufretAAAAABYktHRACIBR1IAAAACXBIWXMAAAdiAAAHYgE4epnbAAAAB3RJTUUH4AsOCDYVp03TJgAAAhVJREFUOMtt009LFVEYx/Hv73hnnplFY6DjXUkkSkmpkaSBIUWL0E2LIFq0LaJ30E4wegH2FgIx6I8EEmGbNlKKmoYaRtcwhFyU6KLgatNi5t47XT2r4Xyec+Y5zzmPyA1JInH7SX6u+uVL6hGS5iXt1QdEUlcZIclJWtT+7n8BTeok50JL2s4FFNVR59InbVUDioW2Q45WtAk4oElHOWd0It0h8jspH5eknbzLZ1klHKiTMr7vFQpxc3Pe7YLA4YsyCoDk70GhWKy5PLXjSM/vHYsagT+//daaMygcKiO0sfGt0By3wI7fVnUzIQU9tfxPSd+hdb3i3hvJ9QlJ5yV9ROrWF+j4nHmgVy5N24Ubpa99/dKynYXdnoqbXLa/AasrAwOa83v5sdmducll/7f+i8BicFVzwSV2wsxDXJLm93baLl+BmWSYDwbWm7mcq9R/asq7VmTGN/nDTPupRwduf75a/8mXffB6yHvngZf6WFJIMr8t6Ulw8ykhFkLYux4SoTWX3o3uvnj+LPAnDCZumDUy7odExMKhRSQZYJjdgcCbuQUBEfGIw7EnSdh9CEzjBhbIwCJi3AKCyM4hHkiP5XFP0qQNSVqKGf1ZQkBLQ1ft/rLzR8Q81Gz6Jre1cpQ/apjNHi1bWj1q/XsqAWxqud5HU6+23klpMOcj7lepvnnbJV1P6yu5hcPdDZyWhA6StdzcPwrNefPwJSIKAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE2LTExLTE0VDA4OjU0OjIxKzAxOjAwl8uNbAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNi0xMS0xNFQwODo1NDoyMSswMTowMOaWNdAAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAV3pUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAHic4/IMCHFWKCjKT8vMSeVSAAMjCy5jCxMjE0uTFAMTIESANMNkAyOzVCDL2NTIxMzEHMQHy4BIoEouAOoXEXTyQjWVAAAAAElFTkSuQmCC';
//jscs:enable maximumLineLength

function requestPermission () {
	if (!window.Notification || Notification.permission !== 'default') {
		return;
	}
	Notification.requestPermission();
}

function showNotification () {
	if (!document.hidden || !window.Notification || Notification.permission !== 'granted') {
		return;
	}
	var notification = new Notification(util.translate('title'), {
		icon: icon,
		body: util.translate('notification'),
		tag: 'Firri'
	});
	if (!navigator.mozApps || !navigator.mozApps.getSelf) {
		return;
	}
	notification.addEventListener('click', function () {
		notification.close();
		navigator.mozApps.getSelf().onsuccess = function () {
			if (this.result) {
				this.result.launch();
			}
		};
	});
}

function removeAlarms (callback) {
	if (!navigator.mozAlarms) {
		if (alarmViaTimeout.id) {
			clearTimeout(alarmViaTimeout.id);
			alarmViaTimeout.id = false;
		}
		callback(true);
		return;
	}
	navigator.mozAlarms.getAll().onsuccess = function () {
		this.result.forEach(function (alarm) {
			if (alarm.data.type === 'auto-update') {
				navigator.mozAlarms.remove(alarm.id);
			}
		});
		callback();
	};
}

function setAlarm (time) {
	removeAlarms(function (timeout) {
		if (time > 0) {
			requestPermission();
			if (timeout) {
				alarmViaTimeout.id = setTimeout(function () {
					if (alarmViaTimeout.callback) {
						alarmViaTimeout.callback();
					}
				}, time);
			} else {
				navigator.mozAlarms.add(new Date(Date.now() + time), 'ignoreTimezone', {type: 'auto-update'});
			}
		}
	});
}

function handleAlarm (handler) {
	if (navigator.mozSetMessageHandler) {
		navigator.mozSetMessageHandler('alarm', handler);
	} else {
		alarmViaTimeout.callback = handler;
	}
}

util.showNotification = showNotification;
util.setAlarm = setAlarm;
util.handleAlarm = handleAlarm;

})();