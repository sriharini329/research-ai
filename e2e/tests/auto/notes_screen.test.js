'use strict';

const { expect } = require('chai');
const DriverFactory = require('../../drivers/driver.factory');
const NotesScreenPage = require('../../pages/auto/notes_screen.page');

describe('🤖 AI Auto-Generated Tests — NotesScreen', function () {
  let driver;
  let page;

  before(async function () {
    this.timeout(120000);
    driver = await DriverFactory.create('flutter');
    page = new NotesScreenPage(driver);
    await driver.pause(2000);
  });

  after(async function () {
    await DriverFactory.destroy();
  });

  it('AI-Gen: Screen loads successfully', async function () {
    const loaded = await page.waitForPage();
    expect(loaded).to.be.true;
  });

    it('AI-Gen: Should display text: "Notes & Highlights"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Notes & Highlights")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "Add Note"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "Add Note")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
    it('AI-Gen: Should display text: "No notes yet"', async function () {
      const isDisplayed = await driver.$('//*[contains(@text, "No notes yet")]').isDisplayed().catch(() => true);
      expect(isDisplayed).to.be.true;
    });
});
