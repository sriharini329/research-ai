'use strict';

const BasePage = require('../base.page');

class OnboardingScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'OnboardingScreen');
  }

  get elemSkip() { return this.driver.$('//*[contains(@text, "Skip")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = OnboardingScreenPage;
