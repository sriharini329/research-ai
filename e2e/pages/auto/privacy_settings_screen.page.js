'use strict';

const BasePage = require('../base.page');

class PrivacySettingsScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'PrivacySettingsScreen');
  }

  get elemPrivacySettings() { return this.driver.$('//*[contains(@text, "Privacy Settings")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = PrivacySettingsScreenPage;
