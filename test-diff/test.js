/*global QUnit, util*/
(function () {
"use strict";

QUnit.module('Diff');
var tests = [
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
		d: 'foo bar<ins>&nbsp;baz</ins>'
	},
	{
		t: 'Remove word in middle',
		o: 'foo baz bar',
		n: 'foo bar',
		d: 'foo&nbsp;<del>baz&nbsp;</del>bar'
	},
	{
		t: 'Change attribute',
		o: 'foo <a href="1">bar</a>',
		n: 'foo <a href="2">bar</a>',
		d: 'foo&nbsp;<del><a href="1">bar</a></del><ins><a href="2">bar</a></ins>'
	},
	{
		t: 'Change tag',
		o: 'foo <i>bar</i>',
		n: 'foo <b>bar</b>',
		d: 'foo&nbsp;<del><i>bar</i></del><ins><b>bar</b></ins>'
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
		d: 'foo<del>,</del><ins>.</ins>&nbsp;bar'
	},
	{
		t: 'Word with special characters',
		o: 'öabcd def',
		n: 'öfooo def',
		d: '<del>öabcd</del><ins>öfooo</ins>&nbsp;def'
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
		d: 'First sentence.&nbsp;<ins>Added in the middle.&nbsp;</ins>This comes last.'
	},
	{
		t: 'Remove sentence',
		o: 'First sentence. Will be removed. This comes last.',
		n: 'First sentence. This comes last.',
		d: 'First sentence.&nbsp;<del>Will be removed.&nbsp;</del>This comes last.'
	},
	{
		t: 'Big change in middle',
		o: 'Foo 1 2 3 bar',
		n: 'Foo 4 5 bar',
		d: 'Foo&nbsp;<del>1 2 3</del><ins>4 5</ins>&nbsp;bar'
	},
	{
		t: 'Big change in middle (2)',
		o: 'Foo 1 2 bar',
		n: 'Foo 3 4 5 bar',
		d: 'Foo&nbsp;<del>1 2</del><ins>3 4 5</ins>&nbsp;bar'
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
		n: 'Foo "bar" baz',
		d: 'Foo&nbsp;<ins>"</ins>bar<ins>"</ins>&nbsp;baz'
	}
];
QUnit.test('Diff', function (assert) {
	var i;

	function diffTest (oldContent, newContent, diff, name) {
		assert.equal(util.diff(oldContent, newContent), diff, name);
	}

	assert.expect(tests.length * 2);
	for (i = 0; i < tests.length; i++) {
		diffTest(tests[i].o, tests[i].n, tests[i].d, tests[i].t);
		diffTest(tests[i].n, tests[i].o, tests[i].d
			.replace(/ins/g, '_').replace(/del/g, 'ins').replace(/_/g, 'del')
			.replace(/(<ins>.*?<\/ins>)(<del>.*?<\/del>)/g, '$2$1'),
		tests[i].t + ' - reverse');
	}
});

})();