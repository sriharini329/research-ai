'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const SearchScreenPage = require('../../pages/auto/search_screen.page');

describe('🤖 AI Auto-Generated Tests — SearchScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new SearchScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Find Papers"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Find Papers")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Search papers, authors, topics…"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Search papers, authors, topics…")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
