'use strict';

const BasePage = require('../base.page');

class LoginScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'LoginScreen');
  }

  get elemWelcomeBack() { return this.driver.$('//*[contains(@text, "Welcome Back!")]'); }
  get elemLogintocontinue() { return this.driver.$('//*[contains(@text, "Login to continue")]'); }
  get elemForgotPassword() { return this.driver.$('//*[contains(@text, "Forgot Password?")]'); }
  get elemDon() { return this.driver.$('//*[contains(@text, "Don")]'); }
  get elemSignUp() { return this.driver.$('//*[contains(@text, "Sign Up")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = LoginScreenPage;
