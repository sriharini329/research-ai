'use strict';

const BasePage = require('../base.page');

class ExportOptionsScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'ExportOptionsScreen');
  }

  get elemAbstract() { return this.driver.$('//*[contains(@text, "Abstract")]'); }
  get elemSummary() { return this.driver.$('//*[contains(@text, "Summary")]'); }
  get elemKeywords() { return this.driver.$('//*[contains(@text, "Keywords")]'); }
  get elemReferences() { return this.driver.$('//*[contains(@text, "References")]'); }
  get elemExportOptions() { return this.driver.$('//*[contains(@text, "Export Options")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = ExportOptionsScreenPage;
