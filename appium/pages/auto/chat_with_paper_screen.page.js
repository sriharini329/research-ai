'use strict';

const BasePage = require('../base.page');

class ChatWithPaperScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'ChatWithPaperScreen');
  }

  get elemChatwithPaper() { return this.driver.$('//*[contains(@text, "Chat with Paper")]'); }
  get elemAskanythingaboutthispaper() { return this.driver.$('//*[contains(@text, "Ask anything about this paper")]'); }
  get elemAskaquestion() { return this.driver.$('//*[contains(@text, "Ask a question…")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = ChatWithPaperScreenPage;
