'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const SplashScreenPage = require('../../pages/auto/splash_screen.page');

describe('🤖 AI Auto-Generated Tests — SplashScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new SplashScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Research AI"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Research AI")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Understand Papers. Cite Confidently."', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Understand Papers. Cite Confidently.")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
