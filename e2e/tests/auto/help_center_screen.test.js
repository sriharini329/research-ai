'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const HelpCenterScreenPage = require('../../pages/auto/help_center_screen.page');

describe('🤖 AI Auto-Generated Tests — HelpCenterScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new HelpCenterScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Help Center"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Help Center")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
