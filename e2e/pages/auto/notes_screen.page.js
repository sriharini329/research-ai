'use strict';

const BasePage = require('../base.page');

class NotesScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'NotesScreen');
  }

  get elemNotesHighlights() { return this.driver.$('//*[contains(@text, "Notes & Highlights")]'); }
  get elemAddNote() { return this.driver.$('//*[contains(@text, "Add Note")]'); }
  get elemNonotesyet() { return this.driver.$('//*[contains(@text, "No notes yet")]'); }
  get elemTapAddNotetocaptureanidea() { return this.driver.$('//*[contains(@text, "Tap Add Note to capture an idea")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = NotesScreenPage;
