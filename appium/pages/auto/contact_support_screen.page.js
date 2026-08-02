'use strict';

const BasePage = require('../base.page');

class ContactSupportScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'ContactSupportScreen');
  }

  get elemSuccess() { return this.driver.$('//*[contains(@text, "Success")]'); }
  get elemContactSupport() { return this.driver.$('//*[contains(@text, "Contact Support")]'); }
  get elemSupportInformation() { return this.driver.$('//*[contains(@text, "Support Information")]'); }
  get elemHowcanwehelpyou() { return this.driver.$('//*[contains(@text, "How can we help you?")]'); }
  get elemName() { return this.driver.$('//*[contains(@text, "Name")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = ContactSupportScreenPage;
