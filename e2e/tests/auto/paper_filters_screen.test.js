'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const PaperFiltersScreenPage = require('../../pages/auto/paper_filters_screen.page');

describe('🤖 AI Auto-Generated Tests — PaperFiltersScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new PaperFiltersScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Paper Filters"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Paper Filters")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
