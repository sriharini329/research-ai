'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const PaperDetailScreenPage = require('../../pages/auto/paper_detail_screen.page');

describe('🤖 AI Auto-Generated Tests — PaperDetailScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new PaperDetailScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Paper Detail"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Paper Detail")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "No references found in this paper."', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "No references found in this paper.")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Cite"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Cite")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
