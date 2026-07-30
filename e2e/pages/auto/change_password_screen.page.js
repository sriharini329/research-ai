'use strict';

const BasePage = require('../base.page');

class ChangePasswordScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'ChangePasswordScreen');
  }

  get elemChangePassword() { return this.driver.$('//*[contains(@text, "Change Password")]'); }
  get elemCurrentpassword() { return this.driver.$('//*[contains(@text, "Current password")]'); }
  get elemNewpassword() { return this.driver.$('//*[contains(@text, "New password")]'); }
  get elemConfirmnewpassword() { return this.driver.$('//*[contains(@text, "Confirm new password")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = ChangePasswordScreenPage;
