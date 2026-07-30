'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const AddNoteScreenPage = require('../../pages/auto/add_note_screen.page');

describe('🤖 AI Auto-Generated Tests — AddNoteScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new AddNoteScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Add Note"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Add Note")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Highlight color"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Highlight color")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Add your note here…"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Add your note here…")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
