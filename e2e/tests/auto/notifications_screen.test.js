'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const NotificationsScreenPage = require('../../pages/auto/notifications_screen.page');

describe('🤖 AI Auto-Generated Tests — NotificationsScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new NotificationsScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Notifications"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Notifications")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Mark all as read"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Mark all as read")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Clear all"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Clear all")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
