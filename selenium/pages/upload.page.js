'use strict';

const BasePage = require('./base.page');
const logger   = require('../utils/logger');

class UploadPage extends BasePage {
  constructor(driver) { super(driver, 'UploadPage'); }

  get selectors() {
    return {
      title:          '//*[@text="Upload Paper" or @text="Upload"]',
      pickFileBtn:    '//*[contains(@text, "Pick") or contains(@text, "Browse") or contains(@text, "Select")]',
      uploadBtn:      '//*[@text="Upload" or contains(@text,"Upload Paper")]',
      processingText: '//*[contains(@text,"Processing") or contains(@text,"Analyzing")]',
      successText:    '//*[contains(@text,"Success") or contains(@text,"Uploaded")]',
    };
  }

  async waitForPage() {
    await this.waitForText('Upload Paper', 15000);
    logger.info('[UploadPage] Upload page loaded');
  }

  async tapPickFile() {
    await this.tap(this.selectors.pickFileBtn);
    logger.logStep('UploadPage', 'Tap Pick File', 'PASS');
    await this.pause(2000);
  }

  async tapUpload() {
    await this.tap(this.selectors.uploadBtn);
    logger.logStep('UploadPage', 'Tap Upload', 'PASS');
    await this.pause(1000);
  }

  async waitForProcessing() {
    await this.waitForElement(this.selectors.processingText, 10000);
    logger.logStep('UploadPage', 'Processing started', 'INFO');
  }

  async waitForUploadSuccess() {
    await this.waitForElement(this.selectors.successText, 60000);
    logger.logStep('UploadPage', 'Upload success confirmed', 'PASS');
  }
}

module.exports = UploadPage;
