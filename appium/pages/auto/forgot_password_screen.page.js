'use strict';

const BasePage = require('../base.page');

class ForgotPasswordScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'ForgotPasswordScreen');
  }

  get elemForgotPassword() { return this.driver.$('//*[contains(@text, "Forgot Password")]'); }
  get elemResetyourpassword() { return this.driver.$('//*[contains(@text, "Reset your password")]'); }
  get elemEnteryouremailandanewpassword() { return this.driver.$('//*[contains(@text, "Enter your email and a new password.")]'); }
  get elemEmail() { return this.driver.$('//*[contains(@text, "Email")]'); }
  get elemNewpassword() { return this.driver.$('//*[contains(@text, "New password")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = ForgotPasswordScreenPage;
