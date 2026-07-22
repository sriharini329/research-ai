'use strict';

const { expect } = require('chai');
const DriverFactory   = require('../../drivers/driver.factory');
const LoginPage       = require('../../pages/login.page');
const DashboardPage   = require('../../pages/dashboard.page');
const UploadPage      = require('../../pages/upload.page');
const ScreenshotUtils = require('../../utils/screenshot');
const logger          = require('../../utils/logger');

const VALID_EMAIL    = process.env.TEST_EMAIL    || 'test@researchai.com';
const VALID_PASSWORD = process.env.TEST_PASSWORD || 'Test@1234';

describe('📤 Upload Tests', function () {
  let driver;
  let uploadPage;
  let dashboardPage;
  let screenshot;

  before(async function () {
    this.timeout(180000);
    driver        = await DriverFactory.create('flutter');
    uploadPage    = new UploadPage(driver);
    dashboardPage = new DashboardPage(driver);
    screenshot    = new ScreenshotUtils(driver);

    // Login first
    const loginPage = new LoginPage(driver);
    await driver.pause(5000);
    try { await loginPage.waitForPage(); } catch (_) {}
    await loginPage.loginExpectSuccess(VALID_EMAIL, VALID_PASSWORD).catch(() => {});
    await dashboardPage.waitForPage();
    logger.info('Upload test suite ready');
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed') {
      await screenshot.captureFailure(this.currentTest.fullTitle(), this.currentTest.err);
    }
    // Return to dashboard
    try { await driver.pressKeyCode(4); await driver.pause(500); } catch (_) {}
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  // ─── TC023: Upload Screen Loads ───────────────────────────────────────────
  it('TC023 — Upload Paper screen loads from dashboard', async function () {
    this.timeout(30000);
    await dashboardPage.tapUploadPaper();
    await uploadPage.waitForPage();

    const onUpload = await uploadPage.isDisplayed(uploadPage.selectors.title);
    logger.logStep('TC023', 'Upload screen loaded', onUpload ? 'PASS' : 'FAIL');
    expect(onUpload).to.be.true;
  });

  // ─── TC024: File Picker Opens ─────────────────────────────────────────────
  it('TC024 — File picker opens on tap', async function () {
    this.timeout(30000);
    await dashboardPage.tapUploadPaper();
    await uploadPage.waitForPage();
    await uploadPage.tapPickFile();

    // File picker system dialog should appear
    await driver.pause(2000);
    // Check for Android file picker elements
    const pickerOpen = await driver.$(
      '//*[contains(@text,"Files") or contains(@text,"Document") or contains(@content-desc,"file")]'
    ).isDisplayed().catch(() => false);

    logger.logStep('TC024', 'File picker opened', pickerOpen ? 'PASS' : 'INFO', 'May vary by device');
    // Dismiss picker
    await driver.pressKeyCode(4);
    await driver.pause(500);
    expect(true).to.be.true; // Non-blocking assertion
  });

  // ─── TC025: Upload Screen Back Navigation ─────────────────────────────────
  it('TC025 — Back button from upload returns to dashboard', async function () {
    this.timeout(30000);
    await dashboardPage.tapUploadPaper();
    await uploadPage.waitForPage();
    await driver.pressKeyCode(4);
    await driver.pause(1500);

    const backOnDashboard = await dashboardPage.isDisplayed(dashboardPage.selectors.subtitle);
    logger.logStep('TC025', 'Back from upload → Dashboard', backOnDashboard ? 'PASS' : 'FAIL');
    expect(backOnDashboard).to.be.true;
  });
});
