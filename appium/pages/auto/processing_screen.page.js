'use strict';

const BasePage = require('../base.page');

class ProcessingScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'ProcessingScreen');
  }

  get elemProcessingPaper() { return this.driver.$('//*[contains(@text, "Processing Paper")]'); }
  get elemAIisanalyzingyourpaperandnextractingkeyinformation() { return this.driver.$('//*[contains(@text, "AI is analyzing your paper and\nextracting key information.")]'); }
  get elemProcessingComplete() { return this.driver.$('//*[contains(@text, "Processing Complete!")]'); }
  get elemYourpaperhasbeenanalyzedsuccessfully() { return this.driver.$('//*[contains(@text, "Your paper has been analyzed successfully.")]'); }
  get elemBacktoHome() { return this.driver.$('//*[contains(@text, "Back to Home")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = ProcessingScreenPage;
