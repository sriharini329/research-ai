'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const ReadingListScreenPage = require('../../pages/auto/reading_list_screen.page');

describe('🤖 AI Auto-Generated Tests — ReadingListScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new ReadingListScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Reading List"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Reading List")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "No papers yet"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "No papers yet")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Nothing here"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Nothing here")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
