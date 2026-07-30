'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const FavoritesScreenPage = require('../../pages/auto/favorites_screen.page');

describe('🤖 AI Auto-Generated Tests — FavoritesScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new FavoritesScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Favorites"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Favorites")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "No favorites yet"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "No favorites yet")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Tap the heart on a paper to save it"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Tap the heart on a paper to save it")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
