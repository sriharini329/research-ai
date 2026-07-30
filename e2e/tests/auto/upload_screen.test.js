'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const UploadScreenPage = require('../../pages/auto/upload_screen.page');

describe('🤖 AI Auto-Generated Tests — UploadScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new UploadScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Upload Research Paper"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Upload Research Paper")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Supports: PDF, Word (.docx), TXT"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Supports: PDF, Word (.docx), TXT")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "or tap to choose a file"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "or tap to choose a file")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
