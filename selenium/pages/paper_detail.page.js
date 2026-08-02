'use strict';

const BasePage = require('./base.page');
const logger   = require('../utils/logger');

class PaperDetailPage extends BasePage {
  constructor(driver) { super(driver, 'PaperDetailPage'); }

  get selectors() {
    return {
      title:       '//*[@content-desc="paper_title" or contains(@resource-id, "title")]',
      chatBtn:     '//*[@text="Chat" or contains(@text,"Chat with Paper")]',
      citeBtn:     '//*[@text="Cite" or contains(@text,"Citation")]',
      exportBtn:   '//*[@text="Export" or contains(@text,"Export")]',
      favoriteBtn: '//*[contains(@content-desc,"favorite") or contains(@content-desc,"bookmark")]',
      backBtn:     '//android.widget.ImageButton[@content-desc="Navigate up"]',
    };
  }

  async waitForPage() {
    await this.waitForElement(this.selectors.title, 15000);
    logger.info('[PaperDetailPage] Paper detail page loaded');
  }

  async tapChat() {
    await this.tap(this.selectors.chatBtn);
    logger.logStep('PaperDetailPage', 'Tap Chat with Paper', 'PASS');
    await this.pause(1500);
  }

  async tapCite() {
    await this.tap(this.selectors.citeBtn);
    logger.logStep('PaperDetailPage', 'Tap Cite', 'PASS');
    await this.pause(1000);
  }

  async tapFavorite() {
    await this.tap(this.selectors.favoriteBtn);
    logger.logStep('PaperDetailPage', 'Tap Favorite', 'PASS');
    await this.pause(500);
  }

  async tapExport() {
    await this.tap(this.selectors.exportBtn);
    logger.logStep('PaperDetailPage', 'Tap Export', 'PASS');
    await this.pause(1000);
  }

  async goBack() {
    await this.pressBack();
    logger.logStep('PaperDetailPage', 'Go back', 'PASS');
    await this.pause(1000);
  }
}

module.exports = PaperDetailPage;
