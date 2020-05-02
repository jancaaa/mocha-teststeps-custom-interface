Custom Mocha interface to improve the readability and maintainability of tests.

Read the story or [go to the facts](#teststeps-custom-interface).

## The problem

When I joined my new team, the tests were looking like this:

```javascript
describe('Login flows tests', () => {
  itParam('Login - logout, CONF: ${JSON.stringify(value)}', configs, async (config) => {
    var testCaseID = 'TC01';

    logger.debug('setting config build and name for logging');
    config.build = BUILDNAME;
    config.name = 'Login - logout';

    var testResult = 'failed';
    var driver = buildDriver(config);

    var testSteps = new Steps([
      {
        description: 'Open login page',
        expected_result: 'Login page opened',
        order: 1,
        status: 'SKIP'
      },
      {
        description: 'Log in',
        expected_result: 'Login successful, navigated to Home page',
        order: 2,
        status: 'SKIP'
      },
      {
        description: 'Logout',
        expected_result: 'Logout successful',
        order: 3,
        status: 'SKIP'
      }
    ]);

    try {
      testSteps.startStep(1);

      var loginPage = new LoginPage(driver, loginURL);
      logger.info('Opening login page');
      await loginPage.open();
      await loginPage.waitForRequiredElements();

      testSteps.passStep(1);
      testSteps.startStep(2);

      logger.info('Log in');
      await loginPage.login('myusername', 'mypassword');
      var homePage = new HomePage(driver);
      await homePage.waitForRequiredElements();
      var loggedUser = await homepage.getLoggedUser();
      expect(loggedUser).to.equal('myusername');

      testSteps.passStep(2);
      testSteps.startStep(3);

      logger.info('Logout');
      await homePage.logout();
      await loginPage.waitForRequiredElements();
      var loggedOutMessageShown = await loginPage.isLogoutMessageShown();
      exapect(loggedOutMessageShown).to.true;

      testSteps.passStep(3);
      testResult = 'passed';
    } finally {
      await driver.quit();
      await client.report(testCaseID, testResult, testSteps);
    }
  });
});
```

Actually, I did not like it at all. And my first task was to add `testSteps` in some other test suites. So I copy-pasted the array from one test, pasted the steps (descriptions and expected results) one by one from the test management system and then pasted `testSteps.passStep(x);` and `testSteps.startStep(x+1);` in the code. Yes, I made some errors (and I also saw and fixed some errors made by my colleagues). The solution was not robust at all - no check if the order in testStep array is correct, no check if I am setting status to the correct step (the methods called on testSteps are really simple - just set the status of step x).

Also, I cannot imagine the maintenance of this - for example adding a step in the middle.

You may be wondering what's the purpose of testSteps. TestSteps are used for syncing the test results into the test management system. Description, expected result and status (passed, failed, skipped) must be saved for all steps of the test (including the steps not reached after failure). That’s why the array is created at the beginning of the test and the status is changed during the run.

There were also other problems with the current solution, not only maintainability and robustness. `itParam()` does not have `itParam.skip()` and `itParam.only()` features so it is necessary to put the `itParam()` block into `describe()` block to use these features.

There is also a lot of code duplicity - mostly the beginning and the end is the same for every single test. It would be nice to have some before and after hooks.

## Some basics how Mocha works

Mocha (BDD interface) offers two building blocks: `describe (title, fn)` and `it (title, fn)`

`describe()` represents test suite, `it()` represents a test. These blocks can be nested.

Internally, Mocha creates structure from objects of type `Suite` (for each `describe()`) and `Test` (for each `it()`). See [BDD interface](https://github.com/mochajs/mocha/blob/master/lib/interfaces/bdd.js) as example.

Curious how the structure looks like for your test suite? Just print `this` inside one of your tests ;)

## My idea

I wanted to have each step as `it()` block. But there was no `describeParam()` block (or I have not found it as an npm module). Also, basic `it()` does not skip the rest of the tests (other subsequent `it()` blocks) after failure - but there was [mocha-steps](https://www.npmjs.com/package/mocha-steps) module which does it. So I decided to create a custom interface which will support parametrized tests and will threat failure of a step in the same way as mocha-steps.

## TestSteps custom interface

Test step interface offers the following blocks:

- **suite (title, fn)** to represent a suite (no difference from normal `describe()` block)

- **test (title, testCaseID, fn)** to represent a test (it is just updated `describe()` block with one extra parameter, behaviour is the same)

- **testParam (title, testCaseID, configs, fn)** to represent parametrized test (creates an instance of test (in the same way as `test()`) for each config from configs)

- **step (description, expectedResult, fn)** to represent each step of a test (from Mocha perspective it is `it()` block with one extra parameter and with behaviour as mocha-steps has (skips all subsequent steps after a step fails, sets the test as failed as well))

There are also following hooks:

- **beforeTest()** and **afterTest()**

- **beforeEachSuite()** and **afterEachSuite()**

- **beforeEachTest()** and **afterEachTest()**

See examples for correct placement of the hooks.

### Example

```javascript
suite('SUITE1', function () {
  test('TEST1', 'ID1', function () {
    step('Step1', 'Step passed', function () {
      expect(true).to.be.true;
    });
    step('Step2', 'Step failed', function () {
      expect(true).to.be.false;
    });
    step('Step3', 'Step was skipped because previous step failed', function () {
      expect(true).to.be.true;
    });
  });
});
```

The results look like this:

```
√ Step1 => Step passed
1) Step2 => Step failed
- Step3 => Step was skipped after failure of the previous step

1 passing
1 pending
1 failing
```

See and run examples (`example-nonparam.js`for non-parametrized tests, `example-param.js` for parameterized tests) for more details.

### Running custom interface

From CLI:

```
mocha --require ./teststeps-ui.js --ui teststeps-ui
```

Programmatically:

```javascript
var mocha = new Mocha({
  require: './teststeps-ui.js',
  ui: 'teststeps-ui'
});
```

Together with [mocha-parallel](https://www.npmjs.com/package/mocha-parallel-tests):

Currently (version 2.3), mocha-parallel support only BDD interface. The --ui option is not supported. It will be added in [the next release](https://github.com/mocha-parallel/mocha-parallel-tests/blob/master/CHANGELOG.md). But it is already implemented and available as [mocha-parallel-tests-ui-option](https://www.npmjs.com/package/mocha-parallel-tests-ui-option).

### Drawbacks of using Suite for suites and tests

Both suites and tests are internally represented as Mocha Suite. **Currently, there is no check if the nesting is correct or not. Just do what we said and nobody gets hurt ;)**

### Accessing to passed parameters and results

All passed parameters and more information that Mocha creates and keeps during the run can be accessed via `this` from any `step()` or hook.
The result of each step, test or suite is saved in property `state`. You can find an example of how to get the result of a test or suite using `afterEachTest()` and `afterEachSuite()` hooks in `example-printresults.js`.

One of these ways can be used for fulfilling the requirement of creating testSteps array with the results. The array can be created just before reporting them in one of the after hooks.

### Additional parameters saved for each step, test and suite

Besides default Mocha properties, there are some extra ones. Here is the list of added properties and the most interesting default ones:

- suite
  - title
  - state
- test
  - title (for parametrized tests config detail is appended to the test title)
  - name (test title without the config data)
  - testCaseID
  - config (only for parametrized test)
  - state
- step
  - title (in format description => expectedResult)
  - description
  - expectedResult
  - state

As [default Mocha reporter](https://mochajs.org/#reporters) is used, titles are updated to provide the best report as possible and original input is backed up in another property. It is possible to [customize the report](https://github.com/mochajs/mocha/wiki/Third-party-reporters) to contain the desired information.

### Sources of inspiration

I used several npm modules and other articles as a source of inspiration. Here are the main ones:

[Mocha Wiki about creating a custom interface](https://github.com/mochajs/mocha/wiki/Third-party-UIs)

[Mocha BDD interface](https://github.com/mochajs/mocha/blob/master/lib/interfaces/bdd.js) - to get know how does it work

[mocha-param](https://www.npmjs.com/package/mocha-param) (itParam) - to get know how parameterized tests work

[mocha-steps](https://www.npmjs.com/package/mocha-steps) - to skip remaining steps after failure


