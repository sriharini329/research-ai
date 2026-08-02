'use strict';

const BasePage = require('../base.page');

class UserGuideScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'UserGuideScreen');
  }

  get elemUserGuide() { return this.driver.$('//*[contains(@text, "User Guide")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = UserGuideScreenPage;
