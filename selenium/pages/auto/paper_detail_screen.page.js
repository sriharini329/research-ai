'use strict';

const BasePage = require('../base.page');

class PaperDetailScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'PaperDetailScreen');
  }

  get elemPaperDetail() { return this.driver.$('//*[contains(@text, "Paper Detail")]'); }
  get elemNoreferencesfoundinthispaper() { return this.driver.$('//*[contains(@text, "No references found in this paper.")]'); }
  get elemCite() { return this.driver.$('//*[contains(@text, "Cite")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = PaperDetailScreenPage;
