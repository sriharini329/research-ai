'use strict';

const BasePage = require('../base.page');

class FeedbackScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'FeedbackScreen');
  }

  get elemFeedback() { return this.driver.$('//*[contains(@text, "Feedback")]'); }
  get elemWriteyourfeedback() { return this.driver.$('//*[contains(@text, "Write your feedback…")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = FeedbackScreenPage;
