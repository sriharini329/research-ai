'use strict';

const BasePage = require('../base.page');

class FavoritesScreenPage extends BasePage {
  constructor(driver) {
    super(driver, 'FavoritesScreen');
  }

  get elemFavorites() { return this.driver.$('//*[contains(@text, "Favorites")]'); }
  get elemNofavoritesyet() { return this.driver.$('//*[contains(@text, "No favorites yet")]'); }
  get elemTaptheheartonapapertosaveit() { return this.driver.$('//*[contains(@text, "Tap the heart on a paper to save it")]'); }

  async waitForPage() {
    await this.driver.pause(1000); // Give time for screen transition
    return true;
  }
}

module.exports = FavoritesScreenPage;
