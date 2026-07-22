'use strict';

const DriverFactory    = require('../drivers/driver.factory');
const excelReporter    = require('../reporters/excel.reporter');
const ScreenshotUtils  = require('../utils/screenshot');
const logger           = require('../utils/logger');
const DeviceUtils      = require('../utils/device.utils');

/**
 * Global Mocha Hooks
 * Runs before/after the entire test suite.
 */

let driver;
let screenshotUtils;
const suiteStartTime = Date.now();

// ─── Root Level Before Hook ───────────────────────────────────────────────────
before(async function () {
  this.timeout(300000);
  logger.info('═'.repeat(60));
  logger.info('🚀 Starting Research AI E2E Test Suite');
  logger.info('═'.repeat(60));

  // Log device info
  const device = await DeviceUtils.getConnectedDevice();
  if (device) {
    logger.info(`📱 Device: ${device.serial} | Android: ${device.version}`);
  }
});

// ─── Root Level After Hook (Runs after ALL tests) ─────────────────────────────
after(async function () {
  this.timeout(120000);
  logger.info('═'.repeat(60));
  logger.info('✅ All tests completed. Generating reports...');

  // Collect Mocha results from global context if available
  // (ExcelReporter is populated by individual test hooks)

  try {
    const reportPath = await excelReporter.generateReport();
    logger.info(`📊 Excel Report: ${reportPath}`);
  } catch (err) {
    logger.error(`Excel report generation failed: ${err.message}`);
  }

  const elapsed = ((Date.now() - suiteStartTime) / 1000).toFixed(1);
  logger.info(`⏱️  Total duration: ${elapsed}s`);
  logger.info('═'.repeat(60));
});

// ─── Per-Test After Each Hook ─────────────────────────────────────────────────
afterEach(async function () {
  const test   = this.currentTest;
  const status = test.state === 'passed' ? 'PASS' : test.state === 'failed' ? 'FAIL' : 'SKIP';
  const duration = test.duration ? Math.round(test.duration / 1000) : 0;

  // Extract module from file path
  const filePath = test.file || '';
  const module   = filePath.includes('auth') ? 'Authentication'
    : filePath.includes('dashboard') ? 'Dashboard'
    : filePath.includes('upload')    ? 'Upload'
    : filePath.includes('navigation')? 'Navigation'
    : 'General';

  // Add to Excel reporter
  excelReporter.addResult({
    id:           test.title.match(/TC\d+/)?.[0] || '',
    module,
    scenario:     test.fullTitle(),
    status,
    device:       process.env.DEVICE_NAME || 'emulator-5554',
    duration,
    failureReason: test.err?.message || '',
    screenshotPath: '',
  });
});
