'use strict';

const ScreenshotUtils = require('../utils/screenshot');
const GestureUtils    = require('../utils/gestures');
const logger          = require('../utils/logger');

/**
 * BasePage — Parent class for all Page Objects.
 * Provides common element interactions with built-in retry, logging,
 * and failure capture.
 */
class BasePage {
  /**
   * @param {object} driver - WebdriverIO driver instance
   * @param {string} pageName - Name of this page (for logging)
   */
  constructor(driver, pageName = 'BasePage') {
    this.driver     = driver;
    this.pageName   = pageName;
    this.screenshot = new ScreenshotUtils(driver);
    this.gesture    = new GestureUtils(driver);
    this.timeout    = 30000;
  }

  // ─── Wait for Element ──────────────────────────────────────────────────────
  async waitForElement(selector, timeout = this.timeout) {
    try {
      const el = typeof selector === 'string'
        ? await this.driver.$(selector)
        : await this.driver.$(selector);
      await el.waitForDisplayed({ timeout });
      return el;
    } catch (err) {
      logger.error(`[${this.pageName}] waitForElement failed: ${JSON.stringify(selector)} — ${err.message}`);
      throw err;
    }
  }

  // ─── Wait for Element by Text ──────────────────────────────────────────────
  async waitForText(text, timeout = this.timeout) {
    const selector = `//*[@text="${text}" or @content-desc="${text}"]`;
    return this.waitForElement(selector, timeout);
  }

  // ─── Tap Element ──────────────────────────────────────────────────────────
  async tap(selector) {
    const el = await this.waitForElement(selector);
    await el.click();
    logger.info(`[${this.pageName}] Tapped: ${JSON.stringify(selector)}`);
    return el;
  }

  // ─── Type Into Field ──────────────────────────────────────────────────────
  async typeInto(selector, text, clearFirst = true) {
    const el = await this.waitForElement(selector);
    if (clearFirst) await el.clearValue();
    await el.setValue(text);
    await this.gesture.hideKeyboard();
    logger.info(`[${this.pageName}] Typed "${text}" into: ${JSON.stringify(selector)}`);
  }

  // ─── Get Text ─────────────────────────────────────────────────────────────
  async getText(selector) {
    const el = await this.waitForElement(selector);
    const text = await el.getText();
    logger.info(`[${this.pageName}] getText: "${text}"`);
    return text;
  }

  // ─── Is Displayed ─────────────────────────────────────────────────────────
  async isDisplayed(selector, timeout = 5000) {
    try {
      const el = await this.driver.$(selector);
      return await el.isDisplayed();
    } catch (_) {
      return false;
    }
  }

  // ─── Wait for Element to Disappear ────────────────────────────────────────
  async waitForGone(selector, timeout = this.timeout) {
    const el = await this.driver.$(selector);
    await el.waitForDisplayed({ timeout, reverse: true });
  }

  // ─── Verify Text Exists on Screen ─────────────────────────────────────────
  async assertTextVisible(text) {
    const selector = `//*[@text="${text}" or @content-desc="${text}"]`;
    const el = await this.driver.$(selector);
    const visible = await el.isDisplayed();
    if (!visible) throw new Error(`Expected text not visible: "${text}"`);
    logger.info(`[${this.pageName}] ✅ Text visible: "${text}"`);
    return true;
  }

  // ─── Wait for Loading to Finish ───────────────────────────────────────────
  async waitForLoadingDone(timeout = 30000) {
    try {
      // Wait for CircularProgressIndicator to disappear
      const spinner = await this.driver.$('//android.widget.ProgressBar');
      await spinner.waitForDisplayed({ timeout: 5000 });
      await spinner.waitForDisplayed({ timeout, reverse: true });
    } catch (_) { /* No spinner visible, that's fine */ }
  }

  // ─── Pause ────────────────────────────────────────────────────────────────
  async pause(ms = 1000) {
    await this.driver.pause(ms);
  }

  // ─── Capture Failure ──────────────────────────────────────────────────────
  async captureFailure(testName, error) {
    return this.screenshot.captureFailure(testName, error);
  }

  // ─── Swipe / Scroll Helpers ───────────────────────────────────────────────
  async scrollDown(n = 1) { await this.gesture.scrollDown(n); }
  async scrollUp(n = 1)   { await this.gesture.scrollUp(n); }
  async swipeLeft()        { await this.gesture.swipeLeft(); }
  async swipeRight()       { await this.gesture.swipeRight(); }
  async pressBack()        { await this.gesture.pressBack(); }
}

module.exports = BasePage;
