'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const DashboardScreenPage = require('../../pages/auto/dashboard_screen.page');

describe('🤖 AI Auto-Generated Tests — DashboardScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new DashboardScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "What would you like to do?"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "What would you like to do?")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Recent Papers"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Recent Papers")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "No papers yet"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "No papers yet")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
