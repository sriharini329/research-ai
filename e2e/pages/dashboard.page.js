'use strict';

const BasePage = require('./base.page');
const logger   = require('../utils/logger');

/**
 * DashboardPage — Page Object for Research AI Dashboard Screen.
 *
 * Screen elements (from dashboard_screen.dart):
 *  - Greeting text ('Good Morning/Afternoon/Evening, {name}!')
 *  - Action cards: Upload Paper, Ask Question, Find Papers, My Library
 *  - Notifications IconButton
 *  - Recent Papers list
 *  - Pull-to-refresh
 */
class DashboardPage extends BasePage {
  constructor(driver) {
    super(driver, 'DashboardPage');
  }

  get selectors() {
    return {
      greeting:           '//*[contains(@text, "Good Morning") or contains(@text, "Good Afternoon") or contains(@text, "Good Evening")]',
      subtitle:           '//*[@text="What would you like to do?"]',
      uploadCard:         '//*[@text="Upload Paper"]',
      askQuestionCard:    '//*[@text="Ask Question"]',
      findPapersCard:     '//*[@text="Find Papers"]',
      myLibraryCard:      '//*[@text="My Library"]',
      recentPapersTitle:  '//*[@text="Recent Papers"]',
      noPapersText:       '//*[@text="No papers yet"]',
      notificationBtn:    '//android.widget.ImageButton[contains(@content-desc, "notification") or @content-desc="Notifications"]',
      progressIndicator:  '//android.widget.ProgressBar',
    };
  }

  async waitForPage() {
    await this.waitForText('What would you like to do?', 30000);
    logger.info('[DashboardPage] Dashboard loaded');
  }

  async tapUploadPaper() {
    await this.tap(this.selectors.uploadCard);
    logger.logStep('DashboardPage', 'Tap Upload Paper', 'PASS');
    await this.pause(1000);
  }

  async tapAskQuestion() {
    await this.tap(this.selectors.askQuestionCard);
    logger.logStep('DashboardPage', 'Tap Ask Question', 'PASS');
    await this.pause(1000);
  }

  async tapFindPapers() {
    await this.tap(this.selectors.findPapersCard);
    logger.logStep('DashboardPage', 'Tap Find Papers', 'PASS');
    await this.pause(1000);
  }

  async tapMyLibrary() {
    await this.tap(this.selectors.myLibraryCard);
    logger.logStep('DashboardPage', 'Tap My Library', 'PASS');
    await this.pause(1000);
  }

  async tapNotifications() {
    await this.tap(this.selectors.notificationBtn);
    logger.logStep('DashboardPage', 'Tap Notifications', 'PASS');
    await this.pause(1000);
  }

  async pullToRefresh() {
    const { width, height } = await this.driver.getWindowSize();
    const x = Math.floor(width / 2);
    await this.gesture['_swipeCoords']?.(x, Math.floor(height * 0.3), x, Math.floor(height * 0.7), 600);
    await this.pause(2000);
    logger.logStep('DashboardPage', 'Pull to refresh', 'PASS');
  }

  async isNoPapersVisible() {
    return this.isDisplayed(this.selectors.noPapersText);
  }

  async isRecentPapersVisible() {
    return this.isDisplayed(this.selectors.recentPapersTitle);
  }

  async getGreetingText() {
    try {
      const el = await this.driver.$(this.selectors.greeting);
      return el.getText();
    } catch (_) { return null; }
  }

  async waitForDashboardCards() {
    await this.waitForElement(this.selectors.uploadCard);
    await this.waitForElement(this.selectors.askQuestionCard);
    await this.waitForElement(this.selectors.findPapersCard);
    await this.waitForElement(this.selectors.myLibraryCard);
    logger.logStep('DashboardPage', 'All 4 action cards visible', 'PASS');
  }
}

module.exports = DashboardPage;
