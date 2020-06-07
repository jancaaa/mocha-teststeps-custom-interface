'use strict';
/**
 * @module TeststepsReporter
 */
/**
 * Module dependencies.
 */
var Base = require('mocha/lib/reporters/base');
var constants = require('mocha/lib/runner').constants;

const EVENT_RUN_BEGIN = constants.EVENT_RUN_BEGIN;
const EVENT_RUN_END = constants.EVENT_RUN_END;

const EVENT_SUITE_OR_TEST_BEGIN = constants.EVENT_SUITE_BEGIN;
const EVENT_SUITE_OR_TEST_END = constants.EVENT_SUITE_END;

const EVENT_TESTSTEP_PASS = constants.EVENT_TEST_PASS;
const EVENT_TESTSTEP_FAIL = constants.EVENT_TEST_FAIL;
const EVENT_TESTSTEP_SKIPPED = constants.EVENT_TEST_PENDING;

var inherits = require('mocha/lib/utils').inherits;

/**
 * Inherit from `Base.prototype`.
 */
inherits(TeststepsReporter, Base);

/**
 * Default color map.
 */
var colors = {
	white: 0,
	green: 32,
	red: 31,
	blue: 36,
	grey: 90
};

/**
 * Constructs a new reporter instance.
 *
 * @public
 * @class
 * @memberof Mocha.reporters
 * @extends Mocha.reporters.Base
 * @param {Runner} runner - Instance triggers reporter actions.
 * @param {Object} [options] - runner options
 */
function TeststepsReporter(runner, options) {
	Base.call(this, runner, options);
	var self = this;
	var indents = 0;
	var n = 0;

	var testStats = {
		passed: 0,
		failed: 0,
        skipped: 0,
        unknown: 0
	};

	var currentTestStats = {
		start: undefined,
		end: undefined,
		duration: undefined
	};

	function indent() {
		return Array(indents).join('  ');
	}

	/**
	 * Color `str` with the given `color`.
	 *
	 * @param {string} color
	 * @param {string} str
	 * @return {string}
	 */
	var setStringColor = function (color, str) {
		return '\u001b[' + colors[color] + 'm' + str + '\u001b[0m';
	};

	runner.on(EVENT_RUN_BEGIN, function () {
		Base.consoleLog();
	});

	runner.on(EVENT_SUITE_OR_TEST_BEGIN, function (suiteOrTest) {
		indents++;

		if (suiteOrTest.isTest) {
			//processing test
			Base.consoleLog(setStringColor('white', '%s%s'), indent(), suiteOrTest.title);

			currentTestStats = {};
			currentTestStats.start = new Date();
		} else {
			//processing suite
			Base.consoleLog(setStringColor('white', '%s%s'), indent(), suiteOrTest.title);
		}
	});

	runner.on(EVENT_SUITE_OR_TEST_END, function (suiteOrTest) {
		indents--;

		if (suiteOrTest.isTest) {
			//processing test
			var test = suiteOrTest;

			//current test duration
			currentTestStats.end = new Date();
			currentTestStats.duration = currentTestStats.end - currentTestStats.start;

			//mark test as passed if last step has passed
			var steps = test.tests;
			var testResult = test.state;
			var lastStepResult = steps[steps.length - 1].state;
			if (testResult === undefined && lastStepResult === 'passed') {
				testResult = 'passed';
				test.state = 'passed';
			}

			//add test result to stats
			switch (testResult) {
				case 'passed':
					testStats.passed++;
					var fmt = indent() + setStringColor('green', '  ' + Base.symbols.ok) + setStringColor('white', ' %s') + setStringColor('grey', ' (%dms)');
					Base.consoleLog(fmt, test.title, currentTestStats.duration);
					break;
				case 'skipped':
					testStats.skipped++;
					var fmt = indent() + setStringColor('blue', '  ' + '-') + setStringColor('white', ' %s') + setStringColor('grey', ' (%dms)');
					Base.consoleLog(fmt, test.title, currentTestStats.duration);
					break;
				case 'failed':
					testStats.failed++;
					var fmt = indent() + setStringColor('red', '  ' + Base.symbols.err) + setStringColor('red', ' %s') + setStringColor('grey', ' (%dms)');
					Base.consoleLog(fmt, test.title, currentTestStats.duration);
					break;
				default:
					testStats.unknown++;
					var fmt = indent() + setStringColor('white', '  ' + '?') + setStringColor('white', ' %s') + setStringColor('grey', ' (%dms)');
					Base.consoleLog(fmt, test.title, currentTestStats.duration);
			}
		}
		Base.consoleLog();
	});

	runner.on(EVENT_TESTSTEP_SKIPPED, function (step) {
		var fmt = indent() + setStringColor('blue', '  - %s');
		Base.consoleLog(fmt, step.title);
	});

	runner.on(EVENT_TESTSTEP_PASS, function (step) {
		var fmt = indent() + setStringColor('green', '  ' + Base.symbols.ok) + setStringColor('white', ' %s') + setStringColor('grey', ' (%dms)');
		Base.consoleLog(fmt, step.title, step.duration);
	});

	runner.on(EVENT_TESTSTEP_FAIL, function (step) {
		Base.consoleLog(indent() + setStringColor('red', '  %d) %s'), ++n, step.title);
	});

	runner.once(EVENT_RUN_END, function () {
		//print summary
		Base.consoleLog(setStringColor('white', 'SUMMARY:'));

		//list all tests with results
		var rootSuite = this.suite;
		for (var s of rootSuite.suites) {
			Base.consoleLog(setStringColor('white', ' %s'), s.title);

			for (var t of s.suites) {
				switch (t.state) {
					case 'passed':
						var fmt = '  ' + setStringColor('green', Base.symbols.ok) + setStringColor('white', ' %s');
						break;
					case 'skipped':
						var fmt = '  ' + setStringColor('blue', '-') + setStringColor('white', ' %s');
						break;
					case 'failed':
						var fmt = '  ' + setStringColor('red', Base.symbols.err) + setStringColor('white', ' %s');
						break;
					default:
						var fmt = '  ' + setStringColor('white', '?') + setStringColor('white', ' %s');
						break;
				}
				Base.consoleLog(fmt, t.title);
			}
		}

		//print counts
		Base.consoleLog();

		// passed
		Base.consoleLog(setStringColor('green', '  %d passed'), testStats.passed);

		// failed
		if (testStats.failed > 0) {
			Base.consoleLog(setStringColor('red', '  %d failed'), testStats.failed);
		}

		// skipped
		if (testStats.skipped > 0) {
			Base.consoleLog(setStringColor('blue', '  %d skipped'), testStats.skipped);
        }
        // unknown
        if (testStats.unknown > 0) {
			Base.consoleLog(setStringColor('white', '  %d unkown'), testStats.unknown);
		}

		//total time taken
		Base.consoleLog(setStringColor('grey', '  Total time taken:  %sms'), this.stats.duration);
	});

	runner.once(EVENT_RUN_END, listFailures.bind(self)); //list failures details

	function listFailures() {
		Base.list(this.failures);
	}
}
exports = module.exports = TeststepsReporter;
