'use strict';

const BasePage = require('../base.page');

class EditProfileScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'EditProfileScreen');
  }

  get elemEditProfile() { return this.driver.$('//*[contains(@text, "Edit Profile")]'); }
  get elemName() { return this.driver.$('//*[contains(@text, "Name")]'); }
  get elemEmail() { return this.driver.$('//*[contains(@text, "Email")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = EditProfileScreenPage;
