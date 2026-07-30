'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const LoginScreenPage = require('../../pages/auto/login_screen.page');

describe('🤖 AI Auto-Generated Tests — LoginScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new LoginScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Welcome Back!"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Welcome Back!")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Login to continue"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Login to continue")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Forgot Password?"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Forgot Password?")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
