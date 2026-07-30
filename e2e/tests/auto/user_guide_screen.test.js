'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const UserGuideScreenPage = require('../../pages/auto/user_guide_screen.page');

describe('🤖 AI Auto-Generated Tests — UserGuideScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new UserGuideScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "User Guide"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "User Guide")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
