'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const LoginPage     = require('../../pages/login.page');
const ScreenshotUtils = require('../../utils/screenshot');
const logger        = require('../../utils/logger');

// ─── Test Data ────────────────────────────────────────────────────────────────
const VALID_EMAIL    = process.env.TEST_EMAIL    || 'test@researchai.com';
const VALID_PASSWORD = process.env.TEST_PASSWORD || 'Test@1234';

describe('🔐 Authentication — Login Tests', function () {
  let driver;
  let loginPage;
  let screenshot;

  before(async function () {
    this.timeout(180000);
    driver     = await DriverFactory.create('flutter');
    loginPage  = new LoginPage(driver);
    screenshot = new ScreenshotUtils(driver);

    // Wait for app to load past splash/onboarding
    await driver.pause(5000);

    // Navigate to login if needed
    try {
      await loginPage.waitForPage();
    } catch (_) {
      // Try tapping Login link if on onboarding
      try {
        await driver.$('//*[@text="Login"]').click();
        await loginPage.waitForPage();
      } catch (__) { /* already on login */ }
    }
    logger.info('Login test suite ready');
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed') {
      await screenshot.captureFailure(this.currentTest.fullTitle(), this.currentTest.err);
      logger.logStep(this.currentTest.title, 'Capture failure screenshot', 'FAIL', this.currentTest.err?.message);
    }
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  // ─── TC001: Empty Fields ─────────────────────────────────────────────────
  it('TC001 — Empty email and password shows snackbar', async function () {
    this.timeout(30000);
    await loginPage.waitForPage();
    await loginPage.tapLogin();

    await driver.pause(1500);
    const snackbar = await loginPage.getSnackbarText();

    logger.logStep('TC001', 'Verify empty fields snackbar', snackbar ? 'PASS' : 'FAIL', snackbar);
    expect(snackbar).to.include('Please fill in all fields');
  });

  // ─── TC002: Invalid Email Only ───────────────────────────────────────────
  it('TC002 — Invalid email shows snackbar', async function () {
    this.timeout(30000);
    await loginPage.waitForPage();
    await loginPage.enterEmail('not-an-email');
    await loginPage.tapLogin();

    await driver.pause(1500);
    const snackbar = await loginPage.getSnackbarText();

    logger.logStep('TC002', 'Verify invalid email snackbar', snackbar ? 'PASS' : 'FAIL', snackbar);
    expect(snackbar).to.not.be.null;
  });

  // ─── TC003: Empty Password Only ──────────────────────────────────────────
  it('TC003 — Valid email but empty password shows snackbar', async function () {
    this.timeout(30000);
    await loginPage.waitForPage();
    await loginPage.enterEmail(VALID_EMAIL);
    await loginPage.tapLogin();

    await driver.pause(1500);
    const snackbar = await loginPage.getSnackbarText();

    logger.logStep('TC003', 'Verify empty password snackbar', snackbar ? 'PASS' : 'FAIL', snackbar);
    expect(snackbar).to.include('Please fill in all fields');
  });

  // ─── TC004: Wrong Credentials ────────────────────────────────────────────
  it('TC004 — Wrong credentials shows error', async function () {
    this.timeout(60000);
    const snackbar = await loginPage.loginExpectError('wrong@example.com', 'WrongPass123');

    logger.logStep('TC004', 'Verify wrong credentials error', 'INFO', snackbar);
    expect(snackbar).to.not.be.null;
  });

  // ─── TC005: Forgot Password Navigation ───────────────────────────────────
  it('TC005 — Tapping Forgot Password navigates to reset screen', async function () {
    this.timeout(30000);
    await loginPage.waitForPage();
    await loginPage.tapForgotPassword();

    await driver.pause(2000);
    const onForgotScreen = await driver.$('//*[contains(@text,"Forgot") or contains(@text,"Reset")]').isDisplayed().catch(() => false);

    logger.logStep('TC005', 'Forgot Password navigation', onForgotScreen ? 'PASS' : 'FAIL');
    expect(onForgotScreen).to.be.true;

    // Go back
    await driver.pressKeyCode(4);
    await driver.pause(1000);
  });

  // ─── TC006: Sign Up Link Navigation ──────────────────────────────────────
  it('TC006 — Tapping Sign Up link navigates to signup screen', async function () {
    this.timeout(30000);
    await loginPage.waitForPage();
    await loginPage.tapSignUp();

    await driver.pause(2000);
    const onSignupScreen = await driver.$('//*[@text="Create Account"]').isDisplayed().catch(() => false);

    logger.logStep('TC006', 'Sign Up navigation', onSignupScreen ? 'PASS' : 'FAIL');
    expect(onSignupScreen).to.be.true;

    // Go back to login
    await driver.pressKeyCode(4);
    await driver.pause(1000);
  });

  // ─── TC007: Valid Login (LAST — navigates away) ───────────────────────────
  it('TC007 — Valid credentials login navigates to Dashboard', async function () {
    this.timeout(90000);
    await loginPage.waitForPage();
    await loginPage.loginExpectSuccess(VALID_EMAIL, VALID_PASSWORD);

    const onDashboard = await driver.$('//*[@text="What would you like to do?"]').isDisplayed().catch(() => false);
    logger.logStep('TC007', 'Valid login → Dashboard', onDashboard ? 'PASS' : 'FAIL');
    expect(onDashboard).to.be.true;
  });
});
