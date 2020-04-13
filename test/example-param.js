var { expect } = require('chai');

beforeEachSuite(function () {
	console.log('This function will run before each suite.');
});

afterEachSuite(function () {
	console.log('This function will run after each suite.');
});

mysuite('SUITE1', function () {
	beforeEachTest(function () {
		console.log('This function will run before each test in the suite. For correct behavior it must be defined in fn of mysuite()');
	});

	afterEachTest(function () {
		console.log('This function will run after each test in the suite. For correct behavior it must be defined in fn of mysuite()');
	});

	testParam('TEST1', 'ID1', [1, 2], function () {
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

	testParam('TEST2', 'ID2', [1, 2], function () {
		step('Step21', 'Result21', function () {
			expect(true).to.be.true;
		});
		step('Step22', 'Result22', function () {
			expect(true).to.be.true;
		});
		step('Step23', 'Result23', function () {
			expect(true).to.be.true;
		});
	});
});

mysuite('SUITE2', function () {
	testParam('TEST3', 'ID3', [1, 2], function () {
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

	testParam('TEST4', 'ID4', [1, 2], function () {
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
