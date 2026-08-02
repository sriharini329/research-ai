'use strict';

const BasePage = require('../base.page');

class CitePaperScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'CitePaperScreen');
  }

  get elemCitePaper() { return this.driver.$('//*[contains(@text, "Cite Paper")]'); }
  get elemSelectacitationstyle() { return this.driver.$('//*[contains(@text, "Select a citation style")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = CitePaperScreenPage;
