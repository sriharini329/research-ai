'use strict';

const BasePage = require('../base.page');

class VideoTutorialsScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'VideoTutorialsScreen');
  }

  get elemVideoTutorials() { return this.driver.$('//*[contains(@text, "Video Tutorials")]'); }
  get elemWatchTutorial() { return this.driver.$('//*[contains(@text, "Watch Tutorial")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = VideoTutorialsScreenPage;
