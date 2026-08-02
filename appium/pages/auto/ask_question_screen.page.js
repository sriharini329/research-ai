'use strict';

const BasePage = require('../base.page');

class AskQuestionScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'AskQuestionScreen');
  }

  get elemAskQuestion() { return this.driver.$('//*[contains(@text, "Ask Question")]'); }
  get elemNopapertoaskaboutyet() { return this.driver.$('//*[contains(@text, "No paper to ask about yet")]'); }
  get elemUploadapaperfirstthenaskanything() { return this.driver.$('//*[contains(@text, "Upload a paper first, then ask anything.")]'); }
  get elemChooseapapertoaskabout() { return this.driver.$('//*[contains(@text, "Choose a paper to ask about")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = AskQuestionScreenPage;
