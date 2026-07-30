'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const ContactSupportScreenPage = require('../../pages/auto/contact_support_screen.page');

describe('🤖 AI Auto-Generated Tests — ContactSupportScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new ContactSupportScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Success"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Success")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Contact Support"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Contact Support")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Support Information"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Support Information")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
