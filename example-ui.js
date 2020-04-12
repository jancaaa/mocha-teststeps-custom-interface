var Mocha = require('mocha');
(Suite = require('mocha/lib/suite')), (Test = require('mocha/lib/test')), (escapeRe = require('escape-string-regexp'));

/**
 * This example is identical to the TDD interface, but with the addition of a
 * "comment" function:
 * https://github.com/mochajs/mocha/blob/master/lib/interfaces/bdd.js
 */
module.exports = Mocha.interfaces['example-ui'] = function (suite) {
	var suites = [suite];

	suite.on('pre-require', function (context, file, mocha) {
		var common = require('mocha/lib/interfaces/common')(suites, context);

		context.before = common.before;
		context.after = common.after;
		context.beforeEach = common.beforeEach;
		context.afterEach = common.afterEach;
		context.run = mocha.options.delay && common.runWithSuite(suite);

		/**
		 * Our addition. A comment function that creates a pending test and
		 * adds an isComment attribute to the test for identification by a
		 * third party, custom reporter. The comment will be printed just like
		 * a pending test. But any custom reporter could check for the isComment
		 * attribute on a test to modify its presentation.
		 */
		context.comment = function (title) {
			var suite, comment;

			suite = suites[0];
			comment = new Test(title, null);

			comment.pending = true;
			comment.isComment = true;
			comment.file = file;
			suite.addTest(comment);

			return comment;
		};

		// Remaining logic is from the bdd interface, but is necessary for a complete example
		// https://github.com/mochajs/mocha/blob/master/lib/interfaces/bdd.js

		/**
		 * Describe a "suite" with the given `title`
		 * and callback `fn` containing nested suites
		 * and/or tests.
		 */

		context.describe = context.context = function (title, fn) {
			return common.suite.create({
				title: title,
				file: file,
				fn: fn
			});
		};

		/**
		 * Pending describe.
		 */

		context.xdescribe = context.xcontext = context.describe.skip = function (title, fn) {
			return common.suite.skip({
				title: title,
				file: file,
				fn: fn
			});
		};

		/**
		 * Exclusive suite.
		 */

		context.describe.only = function (title, fn) {
			return common.suite.only({
				title: title,
				file: file,
				fn: fn
			});
		};

		/**
		 * Describe a specification or test-case
		 * with the given `title` and callback `fn`
		 * acting as a thunk.
		 */

		context.it = context.specify = function (title, fn) {
			var suite = suites[0];
			if (suite.isPending()) {
				fn = null;
			}
			var test = new Test(title, fn);
			test.file = file;
			suite.addTest(test);
			return test;
		};

		/**
		 * Exclusive test-case.
		 */

		context.it.only = function (title, fn) {
			return common.test.only(mocha, context.it(title, fn));
		};

		/**
		 * Pending test case.
		 */

		context.xit = context.xspecify = context.it.skip = function (title) {
			return context.it(title);
		};

		/**
		 * Number of attempts to retry.
		 */
		context.it.retries = function (n) {
			context.retries(n);
		};
	});
};
