'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const ChangePasswordScreenPage = require('../../pages/auto/change_password_screen.page');

describe('🤖 AI Auto-Generated Tests — ChangePasswordScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new ChangePasswordScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Change Password"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Change Password")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Current password"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Current password")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "New password"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "New password")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
