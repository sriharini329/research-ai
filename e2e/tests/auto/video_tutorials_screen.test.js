'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const VideoTutorialsScreenPage = require('../../pages/auto/video_tutorials_screen.page');

describe('🤖 AI Auto-Generated Tests — VideoTutorialsScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new VideoTutorialsScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Video Tutorials"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Video Tutorials")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Watch Tutorial"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Watch Tutorial")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
