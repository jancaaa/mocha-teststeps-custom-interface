var { expect } = require('chai');

afterEachSuite(function () {
	console.log('Print results of the whole suite.');
	console.log('SUITE RESULTS:');

	var suite = this.test.parent;
	var tests = this.test.parent.suites;

	console.log(suite.title);

	for (var i = 0; i < tests.length; i++) {
		var steps = tests[i].tests;

		//getTestResult - in case of failure, test marked as failed, otherwise state is undefined
		var testResult = tests[i].state;
		var lastStepResult = steps[steps.length - 1].state;
		if (testResult === undefined && lastStepResult === 'passed') {
			testResult = 'passed';
		}

		console.log('  TEST: ' + tests[i].title + ' testCaseID: ' + tests[i].testCaseID + ' result: ' + testResult);

		for (var j = 0, limit = steps.length; j < limit; j++) {
			console.log('    STEP: ' + steps[j].title + ' result: ' + steps[j].expectedResult + ' status: ' + steps[j].state);
		}
	}
});

suite('SUITE1', function () {
	afterEachTest(function () {
		console.log('Print results of a test.');
		console.log('TEST RESULTS:');

		var suite = this.test.parent.parent;
		var test = this.test.parent;
		var steps = this.currentTest.parent.tests;

		//getTestResult - in case of failure, test marked as failed, otherwise state is undefined
		var testResult = test.state;
		var lastStepResult = steps[steps.length - 1].state;
		if (testResult === undefined && lastStepResult === 'passed') {
			testResult = 'passed';
		}

		console.log(suite.title);

		console.log('  TEST: ' + test.title + ' testCaseID: ' + test.testCaseID + ' result: ' + testResult);

		for (var i = 0; i < steps.length; i++) {
			console.log('    STEP: ' + steps[i].title + ' result: ' + steps[i].expectedResult + ' status: ' + steps[i].state);
		}
	});

	testParam('TEST1', 'ID1', ['configuration1', 'configuration2'], function () {
		step('Step11', 'Result11', function () {
			expect(true).to.be.true;
		});
		step('Step12', 'Result12', function () {
			expect(true).to.be.true;
		});
		step('Step13', 'Result13', function () {
			expect(true).to.be.true;
		});
	});

	testParam('TEST2', 'ID2', ['configuration1', 'configuration2'], function () {
		step('Step21', 'Result21', function () {
			expect(true).to.be.true;
		});
		step('Step22', 'Result22', function () {
			expect(true).to.be.false;
		});
		step('Step23', 'Result23', function () {
			expect(true).to.be.true;
		});
	});
});

suite('SUITE2', function () {
	testParam('TEST3', 'ID3', ['configuration1', 'configuration2'], function () {
		step('Step31', 'Result31', function () {
			expect(true).to.be.true;
		});
		step('Step32', 'Result32', function () {
			expect(true).to.be.true;
		});
		step('Step33', 'Result33', function () {
			expect(true).to.be.true;
		});
	});

	testParam('TEST4', 'ID4', ['configuration1', 'configuration2'], function () {
		step('Step41', 'Result41', function () {
			expect(true).to.be.true;
		});
		step('Step42', 'Result42', function () {
			expect(true).to.be.true;
		});
		step('Step43', 'Result43', function () {
			expect(true).to.be.true;
		});
	});
});
