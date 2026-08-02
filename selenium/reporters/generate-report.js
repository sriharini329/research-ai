'use strict';

/**
 * Standalone Excel Report Generator Script
 * Called by: npm run report:excel
 * Safe to run even if no test results exist.
 */

const path = require('path');
const fs   = require('fs');

// Verify exceljs is available before requiring reporter
const excelJsPath = path.join(__dirname, '..', 'node_modules', 'exceljs');
if (!fs.existsSync(excelJsPath)) {
  console.error('❌ exceljs not found. Run: npm install');
  console.error('   Expected at:', excelJsPath);
  process.exit(1);
}

const reporter = require('./excel.reporter');

reporter.generateReport()
  .then(outputPath => {
    console.log('');
    console.log('✅ Excel report generated successfully!');
    console.log('📊 Path:', outputPath);
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Excel report generation failed:', err.message);
    console.error(err.stack);
    process.exit(1);
  });
