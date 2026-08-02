'use strict';

const BasePage = require('./base.page');
const logger   = require('../utils/logger');

class SearchPage extends BasePage {
  constructor(driver) { super(driver, 'SearchPage'); }

  get selectors() {
    return {
      searchField:  '//android.widget.EditText',
      searchResult: '//*[contains(@text,"Result") or contains(@resource-id,"result")]',
      noResults:    '//*[contains(@text,"No results") or contains(@text,"not found")]',
      clearBtn:     '//*[contains(@content-desc,"clear") or contains(@content-desc,"Close")]',
    };
  }

  async waitForPage() {
    await this.waitForElement(this.selectors.searchField, 15000);
    logger.info('[SearchPage] Search page loaded');
  }

  async search(query) {
    await this.typeInto(this.selectors.searchField, query);
    await this.driver.pressKeyCode(66); // ENTER
    logger.logStep('SearchPage', `Search: "${query}"`, 'PASS');
    await this.pause(2000);
  }

  async clearSearch() {
    await this.tap(this.selectors.clearBtn);
    await this.pause(500);
  }

  async getResultCount() {
    try {
      const results = await this.driver.$$(this.selectors.searchResult);
      return results.length;
    } catch (_) { return 0; }
  }

  async isNoResultsVisible() {
    return this.isDisplayed(this.selectors.noResults);
  }
}

module.exports = SearchPage;
