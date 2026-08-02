'use strict';

const BasePage = require('../base.page');

class AboutScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'AboutScreen');
  }

  get elemAboutApp() { return this.driver.$('//*[contains(@text, "About App")]'); }
  get elemResearchAI() { return this.driver.$('//*[contains(@text, "Research AI")]'); }
  get elemVersion100() { return this.driver.$('//*[contains(@text, "Version 1.0.0")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = AboutScreenPage;
