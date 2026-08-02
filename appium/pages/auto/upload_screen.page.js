'use strict';

const BasePage = require('../base.page');

class UploadScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'UploadScreen');
  }

  get elemUploadResearchPaper() { return this.driver.$('//*[contains(@text, "Upload Research Paper")]'); }
  get elemSupportsPDFWorddocxTXT() { return this.driver.$('//*[contains(@text, "Supports: PDF, Word (.docx), TXT")]'); }
  get elemortaptochooseafile() { return this.driver.$('//*[contains(@text, "or tap to choose a file")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = UploadScreenPage;
