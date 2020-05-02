var Mocha = require('mocha');
(Suite = require('mocha/lib/suite')), (Test = require('mocha/lib/test')), (escapeRe = require('escape-string-regexp'));

module.exports = Mocha.interfaces['teststeps-ui'] = function (suite) {
	var suites = [suite];

	suite.on('pre-require', function (context, file, mocha) {
		var common = require('mocha/lib/interfaces/common')(suites, context, mocha);

		context.run = mocha.options.delay && common.runWithSuite(suite);

		/**
		 * Run before each describe (which means suite() or test()).
		 * Currently, there is no check for correct nesting. See example to place it correctly.
		 */
		context.beforeEachSuite = context.beforeEachTest = function (fn) {
			common.before(function () {
				let suites = this.test.parent.suites || [];
				//console.log(this.test.parent.parent); //undefined - suite level; has parent - test level
				suites.forEach((s) => {
					s.beforeAll('beforeEachTest/beforeEachSuite', fn);
					let hook = s._beforeAll.pop();
					s._beforeAll.unshift(hook);
				});
			});
		};

		/**
		 * Run after each describe (which means suite() or test()).
		 * Currently, there is no check for correct nesting. See example to place it correctly.
		 */
		context.afterEachSuite = context.afterEachTest = function (fn) {
			common.before(function () {
				let suites = this.test.parent.suites || [];
				suites.forEach((s) => {
					s.afterAll('afterEachTest/afterEachSuite', fn);
					let hook = s._afterAll.shift();
					s._afterAll.push(hook);
				});
			});
		};

		/**
		 * Run before each test. In case of parametrized test, runs before each instance (each config).
		 */
		context.beforeTest = common.before;

		/**
		 * Run after each test. In case of parametrized test, runs after each instance (each config).
		 */
		context.afterTest = common.after;

		/**
		 * Test suite - just renamed describe.
		 */
		context.suite = function (title, fn) {
			return common.suite.create({
				title: title,
				file: file,
				fn: fn
			});
		};

		context.suite.only = function (title, fn) {
			return common.suite.only({
				title: title,
				file: file,
				fn: fn
			});
		};

		context.xsuite = context.suite.skip = function (title, fn) {
			return common.suite.skip({
				title: title,
				file: file,
				fn: fn
			});
		};

		/**
		 * Test - describe with added parameter (testCaseID).
		 */
		context.test = function (title, testCaseID, fn) {
			return common.suite.create({
				title: title,
				file: file,
				fn: fn,
				//save additional parameters
				name: title,
				testCaseID: testCaseID
			});
		};

		context.test.only = function (title, testCaseID, fn) {
			return common.suite.only({
				title: title,
				file: file,
				fn: fn,
				//save additional parameters
				testCaseID: testCaseID
			});
		};

		context.xtest = context.test.skip = function (title, testCaseID, fn) {
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
			configs.forEach((config) => {
				var fullTitle = title + ', CONF: ' + JSON.stringify(config);
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

				var test = common.suite.create({
					title: fullTitle,
					file: file,
					fn: fnu
				});
				//save additional parameters
				test.name = title; //test name - title without CONF
				test.testCaseID = testCaseID;
				test.config = config;
				return test;
			});
		};

		context.testParam.only = function (title, testCaseID, configs, fn) {
			configs.forEach((config) => {
				var fullTitle = title + ', CONF: ' + JSON.stringify(config);
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

				var test = common.suite.only({
					title: fullTitle,
					file: file,
					fn: fnu
				});
				//save additional parameters
				test.name = title; //test name - title without CONF
				test.testCaseID = testCaseID;
				test.config = config;
				return test;
			});
		};

		context.xtestParam = context.testParam.skip = function (title, testCaseID, configs, fn) {};

		/**
		 * Test step.
		 * In case of failure, subsequent steps of the test are skipped.
		 */
		context.step = function (description, expectedResult, fn, type) {
			var fnu;
			if (fn == null) {
				fnu = null;
			} else if (fn.length === 0) {
				fnu = sync;
			} else {
				fnu = async;
			}

			var suite = suites[0];
			if (suite.isPending()) {
				fnu = null;
			}
			var test = new Test(description + ' => ' + expectedResult, fnu);
			test.file = file;
			test.description = description;
			test.expectedResult = expectedResult;

			suite.addTest(test);
			return test;

			function handleStepFailure(currentStep) {
				if (currentStep._retries !== -1 && currentStep._currentRetry < currentStep._retries) {
					return;
				}

				var steps = currentStep.parent.tests;

				//mark current step as failed
				currentStep.state = 'failed';

				//mark next steps as skipped
				for (var i = steps.indexOf(currentStep) + 1; i < steps.length; i++) {
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

		/**
		 * Skip test step.
		 * In results, step reported as skipped. Does not skip subsequent steps!
		 */
		context.xstep = context.step.skip = function (description, expectedResult, fn) {
			return context.step(description, expectedResult);
		};
	});
};
