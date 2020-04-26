var { expect } = require('chai');

beforeEachSuite(function () {
	console.log('This function will run before each suite.');
});

afterEachSuite(function () {
	console.log('This function will run after each suite.');
});

suite('SUITE1', function () {
	beforeEachTest(function () {
		console.log('This function will run before each test in SUITE1. For correct behaviour beforeEachTest() must be inside suite().');
		console.log('You can access the test config (or other test parameters) from beforeEachTest()/beforeTest()/afterEachTest()/afterTest() hooks: ' + this.test.parent.config);
	});

	afterEachTest(function () {
		console.log('This function will run after each test in SUITE1. For correct behavior afterEachTest() must be inside suite().');
	});

	testParam('TEST1', 'ID1', ['configuration1', 'configuration2'], function () {
		beforeTest(function () {
			console.log('This function will run before each configuration of TEST1.');
		});

		step('Step11', 'Result11', function () {
			console.log('This step will pass.');
			expect(true).to.be.true;
		});
		step('Step12', 'Result12', function () {
			console.log('This step will pass.');
			expect(true).to.be.true;
		});
		step('Step13', 'Result13', function () {
			console.log('This step will pass.');
			expect(true).to.be.true;
		});
	});

	testParam('TEST2', 'ID2', ['configuration1', 'configuration2'], function () {
		step('Step21', 'Result21', function () {
			console.log('This step will pass.');
			expect(true).to.be.true;
		});
		step('Step22', 'Result22', function () {
			console.log('This step will fail, so the rest of the steps will be skipped.');
			expect(true).to.be.false;
		});
		step('Step23', 'Result23', function () {
			console.log('This step will be skipped. If you can see this in the console something went wrong.');
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
