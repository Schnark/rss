/*global util */
(function () {
"use strict";

function splitWords (text) {
	var ret = [];
	text.split(/(&(?:#?[a-zA-Z0-9]+);|[^\s&]+\b|.)/).forEach(function (word) {
		if (word) {
			ret.push(word);
		}
	});
	return ret;
}

function splitHtml (html, noWordSplit, parent) {
	if (!html) {
		return [];
	}
	var div = document.createElement(parent || 'div'), ret = [];
	div.innerHTML = html;
	[].map.call(div.childNodes, function (node) {
		return node.outerHTML || util.escape(node.textContent);
	}).forEach(function (node) {
		if (noWordSplit || node.charAt(0) === '<') {
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

function tagName (tag) {
	return tag.replace(/<([a-z\-]+)[\s\S]*/, '$1');
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

function simplifyDiff (d) {
	//merge adjacent tags
	var d2 = d.replace(/<\/(del|ins)><\1>/g, '');
	//merge changes separated only by punctuation/white space
	do {
		d = d2;
		d2 = d.replace(/<del>([^<]+)<\/del><ins>([^<]+)<\/ins>(.\s?)<del>([^<]+)<\/del><ins>([^<]+)<\/ins>/,
			'<del>$1$3$4</del><ins>$2$3$5</ins>');
	} while (d2 !== d);
	do {
		d = d2;
		d2 = d.replace(/<del>([^<]+)<\/del><ins>([^<]+)<\/ins>(.\s?)<del>([^<]+)\3<\/del>/,
			'<del>$1$3$4</del><ins>$2</ins>$3');
	} while (d2 !== d);
	do {
		d = d2;
		d2 = d.replace(/<ins>([^<]+)<\/ins>(.\s?)<ins>([^<]+)\2<\/ins>/,
			'<ins>$1$2$3</ins>$2');
	} while (d2 !== d);
	do {
		d = d2;
		d2 = d.replace(/<del>([^<]+)<\/del>(.\s?)<del>([^<]+)\2<\/del>/,
			'<del>$1$2$3</del>$2');
	} while (d2 !== d);
	do {
		d = d2;
		d2 = d.replace(/<del>([^<]+)<\/del>(.\s?)<del>([^<]+)<\/del><ins>([^<]+)<\/ins>/,
			'<del>$1$2$3</del><ins>$2$4</ins>');
	} while (d2 !== d);
	do {
		d = d2;
		d2 = d.replace(/<ins>([^<]+)<\/ins>(.\s?)<del>([^<]+)<\/del><ins>([^<]+)<\/ins>/,
			'<del>$2$3</del><ins>$1$2$4</ins>');
	} while (d2 !== d);
	//word diff
	d = d.replace(/<del>([^<& ]{3,})([^<&]{0,3}?)([^<& ]*)<\/del><ins>\1([^<&]{0,3})\3<\/ins>/g,
		'$1<del>$2</del><ins>$4</ins>$3');
	d = d.replace(/<del>([^<& ]*)([^<&]{0,3}?)([^<& ]{3,})<\/del><ins>\1([^<&]{0,3})\3<\/ins>/g,
		'$1<del>$2</del><ins>$4</ins>$3');
	d = d.replace(/<del>([^<& ]{0,3}?)([^<& ]{3,})([^<& ]{0,3}?)<\/del><ins>([^<& ]{0,3})\2([^<& ]{0,3})<\/ins>/g,
		'<del>$1</del><ins>$4</ins>$2<del>$3</del><ins>$5</ins>');
	d = d.replace(/<del>([^<& ]{5,})([^<& ]*)<\/del><ins>\1([^<& ]*)<\/ins>/g,
		'$1<del>$2</del><ins>$3</ins>');
	d = d.replace(/<del>([^<& ]*?)([^<& ]{5,})<\/del><ins>([^<& ]*)\2<\/ins>/g,
		'<del>$1</del><ins>$3</ins>$2');
	//remove empty tags
	d = d.replace(/<(ins|del)><\/\1>/g, '');
	//merge tags
	d = d.replace(/<\/(ins|del)><\1>/g, '');
	//allow breaks
	d = d.replace(/((?:^|\W)<del>[^ ]+<\/del>)(<ins>[^ ]+<\/ins>(?:\W|$))/g, '$1<wbr>$2');
	return d;
}

function diff (o, n, parent) {
	var d, i, j, tags1, tags2, out = [];
	o = splitHtml(o, false, parent);
	n = splitHtml(n, false, parent);
	d = util.diffArrays(o, n);
	for (i = 0; i < d.length; i++) {
		if (d[i].value.charAt(0) === '<') {
			j = nextOtherChangeIndex(i, d);
			if (j !== -1 && d[j].value.charAt(0) === '<') {
				tags1 = splitTags(d[i].value);
				tags2 = splitTags(d[j].value);
				if (tags1[0] === tags2[0] && tags1[2] === tags2[2]) {
					out.push(tags1[0]);
					out.push(diff(tags1[1], tags2[1], tagName(tags1[0])));
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

	return simplifyDiff(out.join(''));
}

function tagHighlight (needle, haystack) {
	var tags = splitTags(haystack);
	if (util.search(needle, tags[0], true).length || util.search(needle, tags[2], true).length) {
		return '<mark>' + haystack + '</mark>';
	}
	return tags[0] + recursiveHighlight(needle, tags[1], tagName(tags[0])) + tags[2];
}

function textHighlight (needle, haystack) {
	var result = '', cur = 0;
	util.search(needle, haystack).forEach(function (pos) {
		result += haystack.slice(cur, pos[0]);
		result += '<mark>';
		result += haystack.slice(pos[0], pos[1]);
		result += '</mark>';
		cur = pos[1];
	});
	return result + haystack.slice(cur);
}

function recursiveHighlight (needle, haystack, parent) {
	return splitHtml(haystack, true, parent).map(function (part) {
		if (part.charAt(0) === '<') {
			return tagHighlight(needle, part);
		} else {
			return textHighlight(needle, part);
		}
	}).join('');
}

function highlight (needle, haystack) {
	return recursiveHighlight(needle, haystack);
}

util.diff = diff;
util.highlight = highlight;
})();