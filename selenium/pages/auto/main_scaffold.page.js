'use strict';

const BasePage = require('../base.page');

class MainScaffoldPage extends BasePage {
  constructor(driver) {
    super(driver, 'MainScaffold');
  }


  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = MainScaffoldPage;
