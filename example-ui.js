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
		var common = require('mocha/lib/interfaces/common')(suites, context, mocha);

		context.before = common.before;
		context.after = common.after;
		context.beforeEach = common.beforeEach;
		context.afterEach = common.afterEach;
		context.run = mocha.options.delay && common.runWithSuite(suite);

		/**
		 * Describe a "suite" with the given `title`
		 * and callback `fn` containing nested suites
		 * and/or tests.
		 */
		//context.describe = context.context =
		context.mysuite = function (title, fn) {
			return common.suite.create({
				title: title,
				file: file,
				fn: fn
			});
		};

		/**
		 * Pending suite.
		 */
		//context.xdescribe = context.xcontext = context.describe.skip =
		context.xmysuite = context.mysuite.skip = function (title, fn) {
			return common.suite.skip({
				title: title,
				file: file,
				fn: fn
			});
		};

		/**
		 * Exclusive suite.
		 */
		//context.describe.only =
		context.mysuite.only = function (title, fn) {
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

		/**
		 * Test - describe with added parameter (testCaseID).
		 */
		context.mytest = function (title, testCaseID, fn) {
			return common.suite.create({
				title: title,
				file: file,
				fn: fn,
				//save additional parameters
				testCaseID: testCaseID
			});
		};

		context.mytest.only = function (title, testCaseID, fn) {
			return common.suite.only({
				title: title,
				file: file,
				fn: fn,
				//save additional parameters
				testCaseID: testCaseID
			});
		};

		context.xmytest = context.mytest.skip = function (title, testCaseID, fn) {
			return common.suite.skip({
				title: title,
				file: file,
				fn: fn,
				//save additional parameters
				testCaseID: testCaseID
			});
		};

		/**
		 * Parametrized test. Creates test for each config from configs.
		 * Config is saved as test property, not passed as function parameter -- this is different from itParam!
		 * Do not pass anything as function (fn) parameters (except done callback).
		 */
		context.testParam = function (title, testCaseID, configs, fn) {
			configs.forEach(config => {
				var fullTitle = title + ', CONF: ' + JSON.stringify(config);
				console.log(fn.length);
				if (fn.length === 0) {
					//call sync
					var fnu = function () {
						return fn();
					};
				} else {
					//call async
					var fnu = function (done) {
						fn(done);
					};
				}
				//mytest(name, testCaseID, fnu);
				var test = common.suite.create({
					title: fullTitle,
					file: file,
					fn: fnu
				});
				//save additional parameters
				test.name = title; //title bez CONF
				test.testCaseID = testCaseID;
				test.config = config;
				return test;
			});
		};

		context.testParam.only = function (title, testCaseID, configs, fn) {};

		context.xtestParam = context.testParam.skip = function (title, testCaseID, configs, fn) {};

		/**
		 * Customized it - takes one extra parameter.
		 * Does not have any special behavior (e.g. does not skip other steps after failure)!
		 */
		context.stepit = function (description, expectedResult, fn) {
			var suite = suites[0];
			if (suite.isPending()) {
				fn = null;
			}
			var test = new Test(description + ' => ' + expectedResult, fn);
			test.file = file;
			test.description = description;
			test.expectedResult = expectedResult;
			suite.addTest(test);
			return test;
		};

		/**
		 * Skip test step.
		 * In results, step reported as skipped.
		 */
		context.xstep = context.step.skip = function (description, expectedResult, fn) {
			return context.stepit(description, expectedResult);
		};
	});
};

module.exports.step = global.step = function (description, expectedResult, fn) {
	if (fn == null) {
		return stepit(description, expectedResult);
	} else if (fn.length === 0) {
		return stepit(description, expectedResult, sync);
	} else {
		return stepit(description, expectedResult, async);
	}

	function handleStepFailure(currentStep) {
		if (currentStep._retries !== -1 && currentStep._currentRetry < currentStep._retries) {
			return;
		}

		var steps = currentStep.parent.tests;

		//mark current step as failed
		currentStep.state = 'failed';

		//mark next steps as skipped
		for (var i = steps.indexOf(currentStep) + 1; i < steps.length - 1; i++) {
			var test = steps[i];
			test.pending = true;
			test.state = 'skipped';
		}

		//mark test as failed
		currentStep.parent.state = 'failed';
	}

	function sync() {
		var context = this;
		console.log('Starting step: ' + context.test.title);

		try {
			var promise = fn.call(context);
			if (promise != null && promise.then != null && promise.catch != null) {
				return promise
					.catch(function (err) {
						handleStepFailure(context.test);
						console.log('Failed step: ' + context.test.title);
						throw err;
					})
					.then(function () {
						console.log('Passed step: ' + context.test.title);
					});
			} else {
				console.log('Passed step: ' + context.test.title);
				return promise;
			}
		} catch (ex) {
			handleStepFailure(context.test);
			console.log('Failed step: ' + context.test.title);
			throw ex;
		}
	}

	function async(done) {
		var context = this;
		var title = context.test.title;

		function onError() {
			handleStepFailure(context.test);
			process.removeListener('uncaughtException', onError);
			console.log('Failed step: ' + context.test.title);
		}

		process.addListener('uncaughtException', onError);

		console.log('Starting step: ' + context.test.title);

		try {
			fn.call(context, function (err) {
				if (err) {
					onError();
					done(err);
				} else {
					process.removeListener('uncaughtException', onError);
					console.log('Passed step: ' + context.test.title);
					done(null);
				}
			});
		} catch (ex) {
			onError();
			throw ex;
		}
	}
};

module.exports.beforeTest = global.beforeTest = function (fn) {
	step('Prepare test environment', 'Test enviroment ready', fn);
};

module.exports.afterTest = global.afterTest = function (fn) {
	step('After test step - close broswer, set test status', 'Browser closed, status reported', fn);
};

module.exports.beforeEachTest = global.beforeEachTest = function (fn) {
	before(function () {
		let suites = this.test.parent.suites || [];
		suites.forEach(s => {
			s.beforeAll(fn);
			let hook = s._beforeAll.pop();
			s._beforeAll.unshift(hook);
		});
	});
};

module.exports.afterEachTest = global.afterEachTest = function (fn) {
	before(function () {
		let suites = this.test.parent.suites || [];
		suites.forEach(s => {
			s.afterAll(fn);
			let hook = s._afterAll.pop();
			s._afterAll.unshift(hook);
		});
	});
};
