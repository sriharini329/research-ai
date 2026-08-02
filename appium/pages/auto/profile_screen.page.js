'use strict';

const BasePage = require('../base.page');

class ProfileScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'ProfileScreen');
  }

  get elemLogout() { return this.driver.$('//*[contains(@text, "Logout")]'); }
  get elemAreyousureyouwanttologout() { return this.driver.$('//*[contains(@text, "Are you sure you want to logout?")]'); }
  get elemCancel() { return this.driver.$('//*[contains(@text, "Cancel")]'); }
  get elemProfile() { return this.driver.$('//*[contains(@text, "Profile")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = ProfileScreenPage;
