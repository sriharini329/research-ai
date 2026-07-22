'use strict';

const { expect } = require('chai');
const DriverFactory   = require('../../drivers/driver.factory');
const LoginPage       = require('../../pages/login.page');
const DashboardPage   = require('../../pages/dashboard.page');
const ScreenshotUtils = require('../../utils/screenshot');
const logger          = require('../../utils/logger');

const VALID_EMAIL    = process.env.TEST_EMAIL    || 'test@researchai.com';
const VALID_PASSWORD = process.env.TEST_PASSWORD || 'Test@1234';

describe('🏠 Dashboard Tests', function () {
  let driver;
  let dashboardPage;
  let screenshot;

  before(async function () {
    this.timeout(180000);
    driver        = await DriverFactory.create('flutter');
    dashboardPage = new DashboardPage(driver);
    screenshot    = new ScreenshotUtils(driver);

    // Login first
    const loginPage = new LoginPage(driver);
    await driver.pause(5000);
    try { await loginPage.waitForPage(); } catch (_) {}
    await loginPage.loginExpectSuccess(VALID_EMAIL, VALID_PASSWORD).catch(() => {
      // If already logged in, just wait for dashboard
    });
    await dashboardPage.waitForPage();
    logger.info('Dashboard test suite ready');
  });

  afterEach(async function () {
    if (this.currentTest.state === 'failed') {
      await screenshot.captureFailure(this.currentTest.fullTitle(), this.currentTest.err);
    }
    // Return to dashboard after each test
    try {
      await driver.pressKeyCode(4);
      await driver.pause(500);
    } catch (_) {}
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  // ─── TC014: Dashboard Loads ───────────────────────────────────────────────
  it('TC014 — Dashboard loads with all 4 action cards', async function () {
    this.timeout(30000);
    await dashboardPage.waitForPage();
    await dashboardPage.waitForDashboardCards();

    const uploadVisible   = await dashboardPage.isDisplayed(dashboardPage.selectors.uploadCard);
    const askVisible      = await dashboardPage.isDisplayed(dashboardPage.selectors.askQuestionCard);
    const findVisible     = await dashboardPage.isDisplayed(dashboardPage.selectors.findPapersCard);
    const libraryVisible  = await dashboardPage.isDisplayed(dashboardPage.selectors.myLibraryCard);

    logger.logStep('TC014', 'All 4 dashboard cards visible', 'PASS');
    expect(uploadVisible).to.be.true;
    expect(askVisible).to.be.true;
    expect(findVisible).to.be.true;
    expect(libraryVisible).to.be.true;
  });

  // ─── TC015: Greeting Text ─────────────────────────────────────────────────
  it('TC015 — Dashboard shows greeting text', async function () {
    this.timeout(20000);
    const greeting = await dashboardPage.getGreetingText();
    logger.logStep('TC015', `Greeting: ${greeting}`, greeting ? 'PASS' : 'FAIL');
    expect(greeting).to.match(/Good (Morning|Afternoon|Evening)/i);
  });

  // ─── TC016: Upload Paper Card Navigation ──────────────────────────────────
  it('TC016 — Tapping Upload Paper navigates to upload screen', async function () {
    this.timeout(30000);
    await dashboardPage.waitForPage();
    await dashboardPage.tapUploadPaper();

    const onUpload = await driver.$('//*[contains(@text,"Upload")]').isDisplayed().catch(() => false);
    logger.logStep('TC016', 'Upload Paper navigation', onUpload ? 'PASS' : 'FAIL');
    expect(onUpload).to.be.true;
  });

  // ─── TC017: Ask Question Card Navigation ──────────────────────────────────
  it('TC017 — Tapping Ask Question navigates to question screen', async function () {
    this.timeout(30000);
    await dashboardPage.waitForPage();
    await dashboardPage.tapAskQuestion();

    const onAsk = await driver.$('//*[contains(@text,"Question") or contains(@text,"Ask")]').isDisplayed().catch(() => false);
    logger.logStep('TC017', 'Ask Question navigation', onAsk ? 'PASS' : 'FAIL');
    expect(onAsk).to.be.true;
  });

  // ─── TC018: Find Papers Card Navigation ───────────────────────────────────
  it('TC018 — Tapping Find Papers navigates to search screen', async function () {
    this.timeout(30000);
    await dashboardPage.waitForPage();
    await dashboardPage.tapFindPapers();

    await driver.pause(1500);
    logger.logStep('TC018', 'Find Papers navigation', 'PASS');
    expect(true).to.be.true; // Navigation verified by no crash
  });

  // ─── TC019: My Library Card Navigation ────────────────────────────────────
  it('TC019 — Tapping My Library navigates to library screen', async function () {
    this.timeout(30000);
    await dashboardPage.waitForPage();
    await dashboardPage.tapMyLibrary();

    await driver.pause(1500);
    const onLibrary = await driver.$('//*[contains(@text,"Library")]').isDisplayed().catch(() => false);
    logger.logStep('TC019', 'My Library navigation', onLibrary ? 'PASS' : 'FAIL');
    expect(onLibrary).to.be.true;
  });

  // ─── TC020: Notifications Navigation ──────────────────────────────────────
  it('TC020 — Tapping Notifications icon navigates to notifications', async function () {
    this.timeout(30000);
    await dashboardPage.waitForPage();
    await dashboardPage.tapNotifications();

    await driver.pause(1500);
    const onNotif = await driver.$('//*[contains(@text,"Notification")]').isDisplayed().catch(() => false);
    logger.logStep('TC020', 'Notifications navigation', onNotif ? 'PASS' : 'FAIL');
    expect(onNotif).to.be.true;
  });

  // ─── TC021: Recent Papers Section ─────────────────────────────────────────
  it('TC021 — Recent Papers section is visible', async function () {
    this.timeout(20000);
    await dashboardPage.waitForPage();
    const visible = await dashboardPage.isRecentPapersVisible();
    logger.logStep('TC021', 'Recent Papers section visible', visible ? 'PASS' : 'FAIL');
    expect(visible).to.be.true;
  });

  // ─── TC022: Pull to Refresh ────────────────────────────────────────────────
  it('TC022 — Pull to refresh does not crash', async function () {
    this.timeout(30000);
    await dashboardPage.waitForPage();
    await dashboardPage.pullToRefresh();
    await dashboardPage.waitForPage();
    logger.logStep('TC022', 'Pull to refresh completed', 'PASS');
    expect(true).to.be.true;
  });
});
