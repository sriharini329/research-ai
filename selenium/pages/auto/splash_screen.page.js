'use strict';

const BasePage = require('../base.page');

class SplashScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'SplashScreen');
  }

  get elemResearchAI() { return this.driver.$('//*[contains(@text, "Research AI")]'); }
  get elemUnderstandPapersCiteConfidently() { return this.driver.$('//*[contains(@text, "Understand Papers. Cite Confidently.")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = SplashScreenPage;
