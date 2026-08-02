'use strict';

const BasePage = require('./base.page');
const logger   = require('../utils/logger');

class LibraryPage extends BasePage {
  constructor(driver) { super(driver, 'LibraryPage'); }

  get selectors() {
    return {
      title:      '//*[@text="My Library" or @text="Library"]',
      searchField:'//android.widget.EditText',
      paperCard:  '//android.widget.ScrollView//android.view.View',
      emptyState: '//*[contains(@text,"No papers") or contains(@text,"empty")]',
      filterBtn:  '//*[contains(@content-desc,"filter") or contains(@text,"Filter")]',
      sortBtn:    '//*[contains(@content-desc,"sort") or contains(@text,"Sort")]',
    };
  }

  async waitForPage() {
    await this.waitForText('Library', 15000);
    logger.info('[LibraryPage] Library page loaded');
  }

  async searchPaper(query) {
    await this.typeInto(this.selectors.searchField, query);
    logger.logStep('LibraryPage', `Search: ${query}`, 'PASS');
    await this.pause(1500);
  }

  async tapFirstPaper() {
    const cards = await this.driver.$$(this.selectors.paperCard);
    if (cards.length > 0) {
      await cards[0].click();
      logger.logStep('LibraryPage', 'Tap first paper', 'PASS');
      await this.pause(1500);
    } else {
      throw new Error('No papers found in library');
    }
  }

  async getPaperCount() {
    const cards = await this.driver.$$(this.selectors.paperCard);
    return cards.length;
  }

  async isEmptyStateVisible() {
    return this.isDisplayed(this.selectors.emptyState);
  }
}

module.exports = LibraryPage;
