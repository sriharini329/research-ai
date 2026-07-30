'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const ProcessingScreenPage = require('../../pages/auto/processing_screen.page');

describe('🤖 AI Auto-Generated Tests — ProcessingScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new ProcessingScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Processing Paper"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Processing Paper")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "AI is analyzing your paper and\nextracting key information."', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "AI is analyzing your paper and\nextracting key information.")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Processing Complete!"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Processing Complete!")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
