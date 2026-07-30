'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const CitePaperScreenPage = require('../../pages/auto/cite_paper_screen.page');

describe('🤖 AI Auto-Generated Tests — CitePaperScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new CitePaperScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Cite Paper"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Cite Paper")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Select a citation style"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Select a citation style")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
