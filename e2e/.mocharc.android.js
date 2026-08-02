'use strict';

module.exports = {
  // Test file pattern
  spec: 'tests/validation/massive-android.test.js',

  // Timeout per test (2 minutes for Flutter)
  timeout: 120000,

  // Retry failed tests once
  retries: 1,

  // Reporter configuration
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'mochawesome-report',
    reportFilename: 'mochawesome-android',
    overwrite: true,
    html: true,
    json: true,
    charts: true,
    code: true,
    autoOpen: false,
    reportTitle: 'Research AI - Flutter E2E Test Report',
    reportPageTitle: 'Research AI - Appium Test Results'
  },

  // Global hooks file
  require: ['./hooks/global.hooks.js'],

  // Exit after tests complete
  exit: true,

  // Color output
  color: true,
};
