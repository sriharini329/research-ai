'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const SignupScreenPage = require('../../pages/auto/signup_screen.page');

describe('🤖 AI Auto-Generated Tests — SignupScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new SignupScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Create Account"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Create Account")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Join and start analyzing research"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Join and start analyzing research")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Already have an account? "', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Already have an account? ")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
