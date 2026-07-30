'use strict';

const BasePage = require('../base.page');

class ReadingListScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'ReadingListScreen');
  }

  get elemReadingList() { return this.driver.$('//*[contains(@text, "Reading List")]'); }
  get elemNopapersyet() { return this.driver.$('//*[contains(@text, "No papers yet")]'); }
  get elemNothinghere() { return this.driver.$('//*[contains(@text, "Nothing here")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = ReadingListScreenPage;
