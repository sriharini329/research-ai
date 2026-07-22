'use strict';

const logger = require('./logger');

/**
 * Gesture Utilities
 * Reusable gesture helpers wrapping WebdriverIO's action API.
 * Compatible with Appium 2.x on Android.
 */
class GestureUtils {
  constructor(driver) {
    this.driver = driver;
  }

  // ─── Tap ──────────────────────────────────────────────────────────────────
  async tap(element) {
    try {
      await element.click();
      logger.info('Gesture: tap executed');
    } catch (err) {
      logger.error(`Tap failed: ${err.message}`);
      throw err;
    }
  }

  // ─── Double Tap ───────────────────────────────────────────────────────────
  async doubleTap(element) {
    try {
      const { x, y } = await this._getCenter(element);
      await this.driver.action('pointer', {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' }
      })
        .move({ x, y })
        .down()
        .up()
        .pause(100)
        .down()
        .up()
        .perform();
      logger.info('Gesture: doubleTap executed');
    } catch (err) {
      logger.error(`Double tap failed: ${err.message}`);
      throw err;
    }
  }

  // ─── Long Press ───────────────────────────────────────────────────────────
  async longPress(element, durationMs = 1500) {
    try {
      const { x, y } = await this._getCenter(element);
      await this.driver.action('pointer', {
        type: 'pointer',
        id: 'finger1',
        parameters: { pointerType: 'touch' }
      })
        .move({ x, y })
        .down()
        .pause(durationMs)
        .up()
        .perform();
      logger.info(`Gesture: longPress executed (${durationMs}ms)`);
    } catch (err) {
      logger.error(`Long press failed: ${err.message}`);
      throw err;
    }
  }

  // ─── Scroll Down ──────────────────────────────────────────────────────────
  async scrollDown(scrollCount = 3) {
    const { width, height } = await this.driver.getWindowSize();
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height * 0.8);
    const endY   = Math.floor(height * 0.2);

    for (let i = 0; i < scrollCount; i++) {
      await this._swipeCoords(startX, startY, startX, endY, 800);
      await this.driver.pause(500);
    }
    logger.info(`Gesture: scrollDown (${scrollCount}x)`);
  }

  // ─── Scroll Up ────────────────────────────────────────────────────────────
  async scrollUp(scrollCount = 3) {
    const { width, height } = await this.driver.getWindowSize();
    const startX = Math.floor(width / 2);
    const startY = Math.floor(height * 0.2);
    const endY   = Math.floor(height * 0.8);

    for (let i = 0; i < scrollCount; i++) {
      await this._swipeCoords(startX, startY, startX, endY, 800);
      await this.driver.pause(500);
    }
    logger.info(`Gesture: scrollUp (${scrollCount}x)`);
  }

  // ─── Swipe Left ───────────────────────────────────────────────────────────
  async swipeLeft() {
    const { width, height } = await this.driver.getWindowSize();
    await this._swipeCoords(
      Math.floor(width * 0.8), Math.floor(height * 0.5),
      Math.floor(width * 0.2), Math.floor(height * 0.5),
      600
    );
    logger.info('Gesture: swipeLeft');
  }

  // ─── Swipe Right ──────────────────────────────────────────────────────────
  async swipeRight() {
    const { width, height } = await this.driver.getWindowSize();
    await this._swipeCoords(
      Math.floor(width * 0.2), Math.floor(height * 0.5),
      Math.floor(width * 0.8), Math.floor(height * 0.5),
      600
    );
    logger.info('Gesture: swipeRight');
  }

  // ─── Scroll to Element ────────────────────────────────────────────────────
  async scrollToElement(element, maxScrolls = 10) {
    let found = false;
    for (let i = 0; i < maxScrolls; i++) {
      try {
        const displayed = await element.isDisplayed();
        if (displayed) { found = true; break; }
      } catch (_) { /* not visible yet */ }
      await this.scrollDown(1);
    }
    if (!found) throw new Error(`Element not found after ${maxScrolls} scrolls`);
    logger.info('Gesture: scrollToElement succeeded');
  }

  // ─── Drag and Drop ────────────────────────────────────────────────────────
  async dragAndDrop(sourceEl, targetEl) {
    const src = await this._getCenter(sourceEl);
    const tgt = await this._getCenter(targetEl);
    await this._swipeCoords(src.x, src.y, tgt.x, tgt.y, 1200);
    logger.info('Gesture: dragAndDrop executed');
  }

  // ─── Pinch (zoom out) ────────────────────────────────────────────────────
  async pinch() {
    const { width, height } = await this.driver.getWindowSize();
    const cx = Math.floor(width / 2);
    const cy = Math.floor(height / 2);

    await this.driver.action('pointer', { type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' } })
      .move({ x: cx - 100, y: cy }).down().pause(100)
      .move({ x: cx - 20, y: cy }).up().perform();

    await this.driver.action('pointer', { type: 'pointer', id: 'finger2', parameters: { pointerType: 'touch' } })
      .move({ x: cx + 100, y: cy }).down().pause(100)
      .move({ x: cx + 20, y: cy }).up().perform();

    logger.info('Gesture: pinch executed');
  }

  // ─── Zoom (spread) ────────────────────────────────────────────────────────
  async zoom() {
    const { width, height } = await this.driver.getWindowSize();
    const cx = Math.floor(width / 2);
    const cy = Math.floor(height / 2);

    await this.driver.action('pointer', { type: 'pointer', id: 'finger1', parameters: { pointerType: 'touch' } })
      .move({ x: cx - 20, y: cy }).down().pause(100)
      .move({ x: cx - 150, y: cy }).up().perform();

    await this.driver.action('pointer', { type: 'pointer', id: 'finger2', parameters: { pointerType: 'touch' } })
      .move({ x: cx + 20, y: cy }).down().pause(100)
      .move({ x: cx + 150, y: cy }).up().perform();

    logger.info('Gesture: zoom executed');
  }

  // ─── Press Android Back Button ────────────────────────────────────────────
  async pressBack() {
    await this.driver.pressKeyCode(4); // KEYCODE_BACK
    await this.driver.pause(500);
    logger.info('Gesture: pressBack');
  }

  // ─── Hide Keyboard ────────────────────────────────────────────────────────
  async hideKeyboard() {
    try {
      await this.driver.hideKeyboard();
    } catch (_) { /* keyboard may already be hidden */ }
  }

  // ─── Public swipeCoords (usable from page objects) ────────────────────────
  async swipeCoords(startX, startY, endX, endY, durationMs = 800) {
    return this._swipeCoords(startX, startY, endX, endY, durationMs);
  }

  // ─── Private Helpers ──────────────────────────────────────────────────────
  async _getCenter(element) {
    const loc  = await element.getLocation();
    const size = await element.getSize();
    return {
      x: Math.floor(loc.x + size.width / 2),
      y: Math.floor(loc.y + size.height / 2),
    };
  }

  async _swipeCoords(startX, startY, endX, endY, durationMs = 800) {
    await this.driver.action('pointer', {
      type: 'pointer',
      id: 'finger1',
      parameters: { pointerType: 'touch' }
    })
      .move({ x: startX, y: startY })
      .down()
      .pause(100)
      .move({ duration: durationMs, x: endX, y: endY })
      .up()
      .perform();
  }
}

module.exports = GestureUtils;
