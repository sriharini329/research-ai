'use strict';

const BasePage = require('../base.page');

class DashboardScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'DashboardScreen');
  }

  get elemWhatwouldyouliketodo() { return this.driver.$('//*[contains(@text, "What would you like to do?")]'); }
  get elemRecentPapers() { return this.driver.$('//*[contains(@text, "Recent Papers")]'); }
  get elemNopapersyet() { return this.driver.$('//*[contains(@text, "No papers yet")]'); }
  get elemUploadyourfirstresearchpaper() { return this.driver.$('//*[contains(@text, "Upload your first research paper")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = DashboardScreenPage;
