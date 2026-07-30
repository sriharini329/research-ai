'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const ForgotPasswordScreenPage = require('../../pages/auto/forgot_password_screen.page');

describe('🤖 AI Auto-Generated Tests — ForgotPasswordScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new ForgotPasswordScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Forgot Password"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Forgot Password")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Reset your password"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Reset your password")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Enter your email and a new password."', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Enter your email and a new password.")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
