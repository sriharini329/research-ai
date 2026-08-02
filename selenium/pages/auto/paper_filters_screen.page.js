'use strict';

const BasePage = require('../base.page');

class PaperFiltersScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'PaperFiltersScreen');
  }

  get elemPaperFilters() { return this.driver.$('//*[contains(@text, "Paper Filters")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = PaperFiltersScreenPage;
