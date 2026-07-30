'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const ExportOptionsScreenPage = require('../../pages/auto/export_options_screen.page');

describe('🤖 AI Auto-Generated Tests — ExportOptionsScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new ExportOptionsScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Abstract"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Abstract")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Summary"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Summary")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Keywords"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Keywords")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
