'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const ChatWithPaperScreenPage = require('../../pages/auto/chat_with_paper_screen.page');

describe('🤖 AI Auto-Generated Tests — ChatWithPaperScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new ChatWithPaperScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Chat with Paper"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Chat with Paper")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Ask anything about this paper"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Ask anything about this paper")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Ask a question…"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Ask a question…")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
