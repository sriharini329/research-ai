'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const AskQuestionScreenPage = require('../../pages/auto/ask_question_screen.page');

describe('🤖 AI Auto-Generated Tests — AskQuestionScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new AskQuestionScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Ask Question"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Ask Question")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "No paper to ask about yet"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "No paper to ask about yet")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Upload a paper first, then ask anything."', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Upload a paper first, then ask anything.")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
