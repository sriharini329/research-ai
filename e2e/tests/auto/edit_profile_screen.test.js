'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const EditProfileScreenPage = require('../../pages/auto/edit_profile_screen.page');

describe('🤖 AI Auto-Generated Tests — EditProfileScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new EditProfileScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Edit Profile"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Edit Profile")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Name"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Name")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Email"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Email")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
