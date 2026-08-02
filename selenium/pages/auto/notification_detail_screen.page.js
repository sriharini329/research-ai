'use strict';

const BasePage = require('../base.page');

class NotificationDetailScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'NotificationDetailScreen');
  }

  get elemNotification() { return this.driver.$('//*[contains(@text, "Notification")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = NotificationDetailScreenPage;
