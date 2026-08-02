'use strict';

const path   = require('path');
const fs     = require('fs-extra');
const moment = require('moment');
const logger = require('./logger');

const FAILURE_DIR   = path.join(__dirname, '..', 'reports', 'failures');
const SCREENSHOT_DIR = path.join(__dirname, '..', 'reports', 'screenshots');

fs.ensureDirSync(FAILURE_DIR);
fs.ensureDirSync(SCREENSHOT_DIR);

// Captures taken this session (for Excel report reference)
const captureRegistry = [];

class ScreenshotUtils {
  constructor(driver) {
    this.driver = driver;
  }

  // ─── Capture on Failure ────────────────────────────────────────────────────
  async captureFailure(testName, error) {
    const ts       = moment().format('YYYYMMDD_HHmmss');
    const safeName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `FAIL_${safeName}_${ts}`;

    // Screenshot
    const screenshotPath = path.join(FAILURE_DIR, `${fileName}.png`);
    try {
      const base64 = await this.driver.takeScreenshot();
      await fs.writeFile(screenshotPath, base64, 'base64');
      logger.error(`📸 Failure screenshot saved: ${screenshotPath}`);
    } catch (ssErr) {
      logger.warn(`Could not capture screenshot: ${ssErr.message}`);
    }

    // ADB Logcat dump
    const logPath = path.join(FAILURE_DIR, `${fileName}.log`);
    try {
      const log = await this.driver.getLogs('logcat');
      const logText = log.map(l => `${l.timestamp} ${l.level} ${l.message}`).join('\n');
      await fs.writeFile(logPath, logText, 'utf8');
      logger.info(`📋 Logcat saved: ${logPath}`);
    } catch (logErr) {
      logger.warn(`Could not capture logcat: ${logErr.message}`);
    }

    // Flutter widget tree (if available)
    const treePath = path.join(FAILURE_DIR, `${fileName}_tree.txt`);
    try {
      const tree = await this.driver.execute('flutter:getWidgetTree', {});
      await fs.writeFile(treePath, JSON.stringify(tree, null, 2), 'utf8');
      logger.info(`🌲 Widget tree saved: ${treePath}`);
    } catch (_) { /* Not available on UiAutomator2 */ }

    // Register for reporting
    const entry = {
      testName,
      failureReason: error?.message || 'Unknown error',
      screenshotPath,
      timestamp: new Date().toISOString(),
    };
    captureRegistry.push(entry);

    return screenshotPath;
  }

  // ─── Capture Step Screenshot ───────────────────────────────────────────────
  async captureStep(testName, stepName) {
    const ts       = moment().format('YYYYMMDD_HHmmss');
    const safeName = testName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeStep = stepName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const filePath = path.join(SCREENSHOT_DIR, `${safeName}_${safeStep}_${ts}.png`);

    try {
      const base64 = await this.driver.takeScreenshot();
      await fs.writeFile(filePath, base64, 'base64');
      logger.debug(`📸 Step screenshot: ${filePath}`);
    } catch (err) {
      logger.warn(`Step screenshot failed: ${err.message}`);
    }
    return filePath;
  }

  // ─── Get All Failure Captures ──────────────────────────────────────────────
  getCaptureRegistry() {
    return captureRegistry;
  }

  // ─── Clear Registry ────────────────────────────────────────────────────────
  clearRegistry() {
    captureRegistry.splice(0, captureRegistry.length);
  }
}

module.exports = ScreenshotUtils;
