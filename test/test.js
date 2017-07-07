/*global QUnit, util*/
(function () {
"use strict";

QUnit.module('RSS');
var diffs = [
	{
		t: 'Equal',
		o: 'foo',
		n: 'foo',
		d: 'foo'
	},
	{
		t: 'Add word at end',
		o: 'foo bar',
		n: 'foo bar baz',
		d: 'foo bar<ins> baz</ins>'
	},
	{
		t: 'Remove word in middle',
		o: 'foo baz bar',
		n: 'foo bar',
		d: 'foo <del>baz </del>bar'
	},
	{
		t: 'Change attribute',
		o: 'foo <a href="1">bar</a>',
		n: 'foo <a href="2">bar</a>',
		d: 'foo <del><a href="1">bar</a></del><ins><a href="2">bar</a></ins>'
	},
	{
		t: 'Change tag',
		o: 'foo <i>bar</i>',
		n: 'foo <b>bar</b>',
		d: 'foo <del><i>bar</i></del><ins><b>bar</b></ins>'
	},
	{
		t: 'Change content of tag',
		o: 'foo <i>bar</i>',
		n: 'foo <i>baz</i>',
		d: 'foo <i><del>bar</del><ins>baz</ins></i>'
	},
	{
		t: 'Change punctuation',
		o: 'foo, bar',
		n: 'foo. bar',
		d: 'foo<del>,</del><ins>.</ins> bar'
	},
	{
		t: 'Word with special characters',
		o: 'öabcd def',
		n: 'öfooo def',
		d: '<del>öabcd</del><ins>öfooo</ins> def'
	},
	{
		t: 'Change everything except spaces',
		o: 'a b c',
		n: 'x y z',
		d: '<del>a b c</del><ins>x y z</ins>'
	},
	{
		t: 'Add sentence',
		o: 'First sentence. This comes last.',
		n: 'First sentence. Added in the middle. This comes last.',
		d: 'First sentence. <ins>Added in the middle. </ins>This comes last.'
	},
	{
		t: 'Remove sentence',
		o: 'First sentence. Will be removed. This comes last.',
		n: 'First sentence. This comes last.',
		d: 'First sentence. <del>Will be removed. </del>This comes last.'
	},
	{
		t: 'Big change in middle',
		o: 'Foo 1 2 3 bar',
		n: 'Foo 4 5 bar',
		d: 'Foo <del>1 2 3</del><ins>4 5</ins> bar'
	},
	{
		t: 'Big change in middle (2)',
		o: 'Foo 1 2 bar',
		n: 'Foo 3 4 5 bar',
		d: 'Foo <del>1 2</del><ins>3 4 5</ins> bar'
	},
	{
		t: 'Changes inside word',
		o: 'Wrong spling corrected',
		n: 'Wrong spelling corrected',
		d: 'Wrong sp<ins>el</ins>ling corrected'
	},
	{
		t: 'Changes outside word',
		o: 'Foo bar baz',
		n: 'Foo \'bar\' baz',
		d: 'Foo <ins>\'</ins>bar<ins>\'</ins> baz'
	},
	{
		t: 'Inserting space',
		o: 'Foo barbaz',
		n: 'Foo bar baz',
		d: 'Foo bar<ins> </ins>baz'
	},
	{
		t: 'Special characters',
		o: 'Foo &lt; baz',
		n: 'Foo &gt; baz',
		d: 'Foo <del>&lt;</del><wbr><ins>&gt;</ins> baz'
	}
],
highlights = [
	{
		t: 'No match',
		n: 'foo',
		h: 'Bar baz',
		r: 'Bar baz'
	},
	{
		t: 'One match',
		n: 'foo',
		h: 'Bar foo baz',
		r: 'Bar <mark>foo</mark> baz'
	},
	{
		t: 'Two matches',
		n: 'foo',
		h: 'Foo bar foo',
		r: '<mark>Foo</mark> bar <mark>foo</mark>'
	},
	{
		t: 'Adjacent matches',
		n: 'foo',
		h: 'Foofoo barfoobaz',
		r: '<mark>Foo</mark><mark>foo</mark> bar<mark>foo</mark>baz'
	},
	{
		t: 'Match inside tag content',
		n: 'foo',
		h: 'Bar <a>foo baz</a>',
		r: 'Bar <a><mark>foo</mark> baz</a>'
	},
	{
		t: 'Match inside tag attributes',
		n: 'foo',
		h: 'Bar <a href="foo">baz</a>',
		r: 'Bar <mark><a href="foo">baz</a></mark>'
	},
	{
		t: 'Match inside tag name',
		n: 'foo',
		h: 'Bar <foo>baz</foo>',
		r: 'Bar <mark><foo>baz</foo></mark>'
	},
	{
		t: 'Match inside tag and its content',
		n: 'foo',
		h: 'Bar <a href="foo">foo baz</a>',
		r: 'Bar <mark><a href="foo">foo baz</a></mark>'
	},
	{
		t: 'Special character',
		n: '<',
		h: 'B&lt;r <a>foo</a>',
		r: 'B<mark>&lt;</mark>r <a>foo</a>'
	},
	{
		t: 'Entity',
		n: 'lt',
		h: 'B&lt;r <a>foolt</a>',
		r: 'B&lt;r <a>foo<mark>lt</mark></a>'
	},
	{
		t: 'Entity 2',
		n: 'lt;',
		h: '&lt;lt;<hr>',
		r: '&lt;<mark>lt;</mark><hr>'
	},
	{
		t: 'Overlapping matches',
		n: '00',
		h: '0-00-000-0000-00000',
		r: '0-<mark>00</mark>-<mark>00</mark>0-<mark>00</mark><mark>00</mark>-<mark>00</mark><mark>00</mark>0'
	}
];

QUnit.test('Diff', function (assert) {
	var i;

	function diffTest (oldContent, newContent, diff, name) {
		assert.equal(util.diff(oldContent, newContent), diff, name);
	}

	assert.expect(diffs.length * 2);
	for (i = 0; i < diffs.length; i++) {
		diffTest(diffs[i].o, diffs[i].n, diffs[i].d, diffs[i].t);
		diffTest(diffs[i].n, diffs[i].o, diffs[i].d
			.replace(/ins/g, '_').replace(/del/g, 'ins').replace(/_/g, 'del')
			.replace(/(<ins>.*?<\/ins>)(<wbr>)?(<del>.*?<\/del>)/g, '$3$2$1'),
		diffs[i].t + ' - reverse');
	}
});

QUnit.test('Highlight', function (assert) {
	var i;

	function highlightTest (needle, haystack, result, name) {
		assert.equal(util.highlight(needle, haystack), result, name);
	}

	assert.expect(highlights.length);
	for (i = 0; i < highlights.length; i++) {
		highlightTest(highlights[i].n, highlights[i].h, highlights[i].r, highlights[i].t);
	}
});

})();