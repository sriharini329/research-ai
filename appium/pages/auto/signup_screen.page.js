'use strict';

const BasePage = require('../base.page');

class SignupScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'SignupScreen');
  }

  get elemCreateAccount() { return this.driver.$('//*[contains(@text, "Create Account")]'); }
  get elemJoinandstartanalyzingresearch() { return this.driver.$('//*[contains(@text, "Join and start analyzing research")]'); }
  get elemAlreadyhaveanaccount() { return this.driver.$('//*[contains(@text, "Already have an account? ")]'); }
  get elemLogin() { return this.driver.$('//*[contains(@text, "Login")]'); }
  get elemFullName() { return this.driver.$('//*[contains(@text, "Full Name")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = SignupScreenPage;
