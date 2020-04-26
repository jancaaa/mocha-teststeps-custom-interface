var { expect } = require('chai');

beforeEachSuite(function () {
	console.log('This function will run before each suite.');
});

beforeEachSuite(function () {
	console.log('You can have more hooks of the same type. They will run in order of creation.');
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

	test('TEST1', 'ID1', function () {
		beforeTest(function () {
			console.log('This function will run once - before first step of the test');
		});

		afterTest(function () {
			console.log('This function will run once - after last step of the test. It runs also in case of failure of a step.');
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

	test('TEST2', 'ID2', function () {
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
	test('TEST3', 'ID3', function () {
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

	test('TEST4', 'ID4', function () {
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
