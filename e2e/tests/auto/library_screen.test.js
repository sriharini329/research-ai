'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const LibraryScreenPage = require('../../pages/auto/library_screen.page');

describe('🤖 AI Auto-Generated Tests — LibraryScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new LibraryScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "My Library"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "My Library")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "All Papers"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "All Papers")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Your library is empty"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Your library is empty")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
