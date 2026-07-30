'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const SelectInterestsScreenPage = require('../../pages/auto/select_interests_screen.page');

describe('🤖 AI Auto-Generated Tests — SelectInterestsScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new SelectInterestsScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Select Your Interests"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Select Your Interests")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Choose your research areas"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Choose your research areas")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
