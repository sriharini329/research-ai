'use strict';

const BasePage = require('../base.page');

class TermsScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'TermsScreen');
  }

  get elemTermsConditions() { return this.driver.$('//*[contains(@text, "Terms & Conditions")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = TermsScreenPage;
