'use strict';

/**
 * Reusable W3C Actions for Mobile Automation
 */
class Gestures {
  constructor(driver) {
    this.driver = driver;
  }

  async tap(element) {
    await element.click();
  }

  async doubleTap(element) {
    const loc = await element.getLocation();
    const size = await element.getSize();
    const x = loc.x + (size.width / 2);
    const y = loc.y + (size.height / 2);

    await this.driver.action('pointer')
      .move({ duration: 0, x, y })
      .down({ button: 0 })
      .up({ button: 0 })
      .pause(100)
      .down({ button: 0 })
      .up({ button: 0 })
      .perform();
  }

  async longPress(element, durationMs = 1500) {
    const loc = await element.getLocation();
    const size = await element.getSize();
    const x = loc.x + (size.width / 2);
    const y = loc.y + (size.height / 2);

    await this.driver.action('pointer')
      .move({ duration: 0, x, y })
      .down({ button: 0 })
      .pause(durationMs)
      .up({ button: 0 })
      .perform();
  }

  async swipe(fromX, fromY, toX, toY, durationMs = 1000) {
    await this.driver.action('pointer')
      .move({ duration: 0, x: fromX, y: fromY })
      .down({ button: 0 })
      .pause(100)
      .move({ duration: durationMs, x: toX, y: toY })
      .up({ button: 0 })
      .perform();
  }

  async scroll(direction = 'down', distance = 500) {
    const { width, height } = await this.driver.getWindowSize();
    const centerX = width / 2;
    const startY = height / 2;

    if (direction === 'down') {
      await this.swipe(centerX, startY, centerX, startY - distance);
    } else if (direction === 'up') {
      await this.swipe(centerX, startY, centerX, startY + distance);
    } else if (direction === 'left') {
      await this.swipe(centerX, startY, centerX - distance, startY);
    } else if (direction === 'right') {
      await this.swipe(centerX, startY, centerX + distance, startY);
    }
  }

  async dragAndDrop(sourceElement, targetElement) {
    const sourceLoc = await sourceElement.getLocation();
    const targetLoc = await targetElement.getLocation();

    await this.driver.action('pointer')
      .move({ duration: 0, x: sourceLoc.x, y: sourceLoc.y })
      .down({ button: 0 })
      .pause(500)
      .move({ duration: 1500, x: targetLoc.x, y: targetLoc.y })
      .up({ button: 0 })
      .perform();
  }

  async pinch(element, scale = 0.5) {
    // Advanced Appium 2 pinch gesture mapping for Flutter/UIA2
    await this.driver.execute('mobile: pinchOpenGesture', {
      elementId: element.elementId,
      percent: scale
    });
  }

  async zoom(element, scale = 2.0) {
    await this.driver.execute('mobile: pinchCloseGesture', {
      elementId: element.elementId,
      percent: scale
    });
  }
}

module.exports = Gestures;
