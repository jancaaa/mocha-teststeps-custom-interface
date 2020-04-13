var { expect } = require('chai');

mysuite('SUITE1', function () {
	mytest('TEST1', 'ID1', function () {
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

	mytest('TEST2', 'ID2', function () {
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
	mytest('TEST3', 'ID3', function () {
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

	mytest('TEST4', 'ID4', function () {
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
