'use strict';

const BasePage = require('../base.page');

class SelectInterestsScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'SelectInterestsScreen');
  }

  get elemSelectYourInterests() { return this.driver.$('//*[contains(@text, "Select Your Interests")]'); }
  get elemChooseyourresearchareas() { return this.driver.$('//*[contains(@text, "Choose your research areas")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = SelectInterestsScreenPage;
