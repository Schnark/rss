/*global QUnit, util*/
(function () {
"use strict";

QUnit.module('Diff');
var tests = [
	{
		o: 'foo',
		n: 'foo',
		d: 'foo'
	},
	{
		o: 'foo bar',
		n: 'foo bar baz',
		d: 'foo bar<ins> baz</ins>'
	},
	{
		o: 'foo baz bar',
		n: 'foo bar',
		d: 'foo <del>baz </del>bar'
	},
	{
		o: 'foo <a href="1">bar</a>',
		n: 'foo <a href="2">bar</a>',
		d: 'foo <del><a href="1">bar</a></del><ins><a href="2">bar</a></ins>'
	},
	{
		o: 'foo <i>bar</i>',
		n: 'foo <b>bar</b>',
		d: 'foo <del><i>bar</i></del><ins><b>bar</b></ins>'
	},
	{
		o: 'foo <i>bar</i>',
		n: 'foo <i>baz</i>',
		d: 'foo <i><del>bar</del><ins>baz</ins></i>'
	},
	{
		o: 'foo, bar',
		n: 'foo. bar',
		d: 'foo<del>,</del><ins>.</ins> bar'
	},
	{
		o: 'öabc def',
		n: 'öfoo def',
		d: '<del>öabc</del><ins>öfoo</ins> def'
	},
	{
		o: 'a b c',
		n: 'x y z',
		d: '<del>a b c</del><ins>x y z</ins>'
	}
];
QUnit.test('Diff', function (assert) {
	var i;

	function diffTest (oldContent, newContent, diff, name) {
		assert.equal(util.diff(oldContent, newContent), diff, name);
	}

	assert.expect(tests.length);
	for (i = 0; i < tests.length; i++) {
		diffTest(tests[i].o, tests[i].n, tests[i].d, 'test ' + i);
	}
});

})();