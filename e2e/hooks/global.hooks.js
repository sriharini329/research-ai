'use strict';

const excelReporter    = require('../reporters/excel.reporter');
const logger           = require('../utils/logger');
const DeviceUtils      = require('../utils/device.utils');

/**
 * Global Mocha Hooks
 * Runs before/after the entire test suite.
 */

const suiteStartTime = Date.now();

exports.mochaHooks = {
  // ─── Root Level Before Hook ───────────────────────────────────────────────────
  beforeAll: async function () {
    this.timeout(300000);
    logger.info('═'.repeat(60));
    logger.info('🚀 Starting Research AI E2E Test Suite');
    logger.info('═'.repeat(60));

    // Log device info
    try {
      const device = await DeviceUtils.getConnectedDevice();
      if (device) {
        logger.info(`📱 Device: ${device.serial} | Android: ${device.version}`);
      }
    } catch (e) {
      logger.info('No connected device detected.');
    }
  },

  // ─── Root Level After Hook (Runs after ALL tests) ─────────────────────────────
  afterAll: async function () {
    this.timeout(120000);
    logger.info('═'.repeat(60));
    logger.info('✅ All tests completed.');

    const elapsed = ((Date.now() - suiteStartTime) / 1000).toFixed(1);
    logger.info(`⏱️  Total duration: ${elapsed}s`);
    logger.info('═'.repeat(60));
  },

  // ─── Per-Test After Each Hook (Failure Handling) ────────────────────────────
  afterEach: async function () {
    const test = this.currentTest;
    if (test.state === 'failed') {
      logger.error(`❌ TEST FAILED: ${test.title}`);
      try {
        const fs = require('fs-extra');
        const path = require('path');
        const failuresDir = path.join(__dirname, '..', 'reports', 'failures');
        fs.ensureDirSync(failuresDir);
        
        const safeName = test.title.replace(/[^a-zA-Z0-9]/g, '_');
        
        // 1. Screenshot
        if (this.driver) {
          const screenshotPath = path.join(failuresDir, `${safeName}.png`);
          await this.driver.saveScreenshot(screenshotPath).catch(() => logger.warn('Screenshot capture failed.'));
          
          // 2. Page Source (Flutter Widget Tree / XML)
          const sourcePath = path.join(failuresDir, `${safeName}_source.xml`);
          const source = await this.driver.getPageSource().catch(() => '');
          if (source) fs.writeFileSync(sourcePath, source);
        } else {
          logger.warn('this.driver is undefined, cannot capture screenshot.');
        }
        
        // 3. Stack Trace
        const stackPath = path.join(failuresDir, `${safeName}_stacktrace.txt`);
        fs.writeFileSync(stackPath, test.err ? test.err.stack : 'No stack trace');
        
        logger.info(`📸 Failure artifacts saved to reports/failures/${safeName}`);
      } catch (e) {
        logger.warn(`Could not capture failure artifacts: ${e.message}`);
      }
    }
  }
};
