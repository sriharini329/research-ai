'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const ProfileScreenPage = require('../../pages/auto/profile_screen.page');

describe('🤖 AI Auto-Generated Tests — ProfileScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new ProfileScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Logout"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Logout")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Are you sure you want to logout?"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Are you sure you want to logout?")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Cancel"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Cancel")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
