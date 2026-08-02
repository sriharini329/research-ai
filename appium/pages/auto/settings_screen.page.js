'use strict';

const BasePage = require('../base.page');

class SettingsScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'SettingsScreen');
  }

  get elemSettings() { return this.driver.$('//*[contains(@text, "Settings")]'); }
  get elemResearchAIVersion100() { return this.driver.$('//*[contains(@text, "Research AI · Version 1.0.0")]'); }
  get elemConfigureAPIServerURL() { return this.driver.$('//*[contains(@text, "Configure API Server URL")]'); }
  get elemCancel() { return this.driver.$('//*[contains(@text, "Cancel")]'); }
  get elemAPIBaseURLupdated() { return this.driver.$('//*[contains(@text, "API Base URL updated!")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = SettingsScreenPage;
