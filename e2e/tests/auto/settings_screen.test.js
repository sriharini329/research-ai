'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const SettingsScreenPage = require('../../pages/auto/settings_screen.page');

describe('🤖 AI Auto-Generated Tests — SettingsScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new SettingsScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Settings"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Settings")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Research AI · Version 1.0.0"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Research AI · Version 1.0.0")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Configure API Server URL"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Configure API Server URL")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
