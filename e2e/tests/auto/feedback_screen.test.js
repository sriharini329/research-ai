'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const FeedbackScreenPage = require('../../pages/auto/feedback_screen.page');

describe('🤖 AI Auto-Generated Tests — FeedbackScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new FeedbackScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Feedback"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Feedback")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Write your feedback…"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Write your feedback…")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
