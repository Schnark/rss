/*global util */
(function () {
"use strict";

function splitWords (text) {
	var ret = [];
	text.split(/(\b\S+\b)/).forEach(function (word) {
		if (word) {
			ret.push(word);
		}
	});
	return ret;
}

function splitHtml (html) {
	var div = document.createElement('div'), ret = [];
	div.innerHTML = html;
	[].map.call(div.childNodes, function (node) {
		return node.outerHTML || node.textContent;
	}).forEach(function (node) {
		if (node.charAt(0) === '<') {
			ret.push(node);
		} else {
			ret = ret.concat(splitWords(node));
		}
	});
	return ret;
}

function splitTags (s) {
	var pos1 = s.indexOf('>'), pos2 = s.lastIndexOf('<');
	if (pos1 === -1) {
		pos1 = s.length - 1;
	}
	if (pos2 <= pos1) {
		pos2 = s.length;
	}
	return [s.slice(0, pos1 + 1), s.slice(pos1 + 1, pos2), s.slice(pos2)];
}

function nextOtherChangeIndex (i, d) {
	var changeType, j;
	if (!d[i].added && !d[i].removed) {
		return -1;
	}
	changeType = d[i].added ? 'removed' : 'added';
	for (j = i + 1; j < d.length; j++) {
		if (d[j][changeType]) {
			return j;
		}
		if (!d[j].added && !d[j].removed && d[j].value !== '') {
			return -1;
		}
	}
	return -1;
}

function diff (o, n) {
	var d, i, j, tags1, tags2, out = [];
	o = splitHtml(o);
	n = splitHtml(n);
	d = util.diffArrays(o, n);
	for (i = 0; i < d.length; i++) {
		if (d[i].value.charAt(0) === '<') {
			j = nextOtherChangeIndex(i, d);
			if (j !== -1 && d[j].value.charAt(0) === '<') {
				tags1 = splitTags(d[i].value);
				tags2 = splitTags(d[j].value);
				if (tags1[0] === tags2[0] && tags1[2] === tags2[2]) {
					out.push(tags1[0]);
					out.push(diff(tags1[1], tags2[1]));
					out.push(tags1[2]);
					d[j] = {value: ''};
					continue;
				}
			}
		}
		if (d[i].added) {
			out.push('<ins>');
		} else if (d[i].removed) {
			out.push('<del>');
		}
		out.push(d[i].value);
		if (d[i].added) {
			out.push('</ins>');
		} else if (d[i].removed) {
			out.push('</del>');
		}
	}
	return out.join('').replace(/<\/(del|ins)><\1>/g, '');
}

util.diff = diff;

})();