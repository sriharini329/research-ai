'use strict';

const BasePage = require('../base.page');

class LibraryScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'LibraryScreen');
  }

  get elemMyLibrary() { return this.driver.$('//*[contains(@text, "My Library")]'); }
  get elemAllPapers() { return this.driver.$('//*[contains(@text, "All Papers")]'); }
  get elemYourlibraryisempty() { return this.driver.$('//*[contains(@text, "Your library is empty")]'); }
  get elemAnalyzedpaperswillappearhere() { return this.driver.$('//*[contains(@text, "Analyzed papers will appear here")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = LibraryScreenPage;
