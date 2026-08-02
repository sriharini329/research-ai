'use strict';

const BasePage = require('../base.page');

class HelpCenterScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'HelpCenterScreen');
  }

  get elemHelpCenter() { return this.driver.$('//*[contains(@text, "Help Center")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = HelpCenterScreenPage;
