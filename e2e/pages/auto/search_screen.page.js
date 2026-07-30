'use strict';

const BasePage = require('../base.page');

class SearchScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'SearchScreen');
  }

  get elemFindPapers() { return this.driver.$('//*[contains(@text, "Find Papers")]'); }
  get elemSearchpapersauthorstopics() { return this.driver.$('//*[contains(@text, "Search papers, authors, topics…")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = SearchScreenPage;
