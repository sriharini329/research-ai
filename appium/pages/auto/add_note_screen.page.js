'use strict';

const BasePage = require('../base.page');

class AddNoteScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'AddNoteScreen');
  }

  get elemAddNote() { return this.driver.$('//*[contains(@text, "Add Note")]'); }
  get elemHighlightcolor() { return this.driver.$('//*[contains(@text, "Highlight color")]'); }
  get elemAddyournotehere() { return this.driver.$('//*[contains(@text, "Add your note here…")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = AddNoteScreenPage;
