'use strict';

const BasePage = require('../base.page');

class NotificationsScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'NotificationsScreen');
  }

  get elemNotifications() { return this.driver.$('//*[contains(@text, "Notifications")]'); }
  get elemMarkallasread() { return this.driver.$('//*[contains(@text, "Mark all as read")]'); }
  get elemClearall() { return this.driver.$('//*[contains(@text, "Clear all")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = NotificationsScreenPage;
