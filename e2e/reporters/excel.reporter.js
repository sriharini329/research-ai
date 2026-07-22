'use strict';

const ExcelJS  = require('exceljs');
const path     = require('path');
const fs       = require('fs-extra');
const moment   = require('moment');
const glob     = require('glob');

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
const LOGS_DIR    = path.join(REPORTS_DIR, 'logs');
fs.ensureDirSync(REPORTS_DIR);

class ExcelReporter {
  constructor() {
    this.workbook    = new ExcelJS.Workbook();
    this.testResults = [];
    this.executionLogs = [];
    this.startTime   = new Date();
  }

  // ─── Auto-Load Data from Mochawesome and Winston ───────────────────────────
  _loadResultsFromMochawesome() {
    console.log('🔍 Scanning for Mochawesome JSON reports...');
    const files = glob.sync(`${REPORTS_DIR}/*.json`).filter(f => !f.includes('package.json'));
    if (files.length === 0) {
      console.log('⚠️ No Mochawesome JSON reports found.');
      return;
    }
    
    // Get the most recently modified JSON report
    files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    const latestReport = files[0];
    console.log(`✅ Parsing report: ${path.basename(latestReport)}`);

    try {
      const data = fs.readJsonSync(latestReport);
      const suites = data.results || [];
      
      const processSuite = (suite) => {
        if (suite.tests && suite.tests.length > 0) {
          suite.tests.forEach((test, i) => {
            const status = test.state === 'passed' ? 'PASS' : test.state === 'failed' ? 'FAIL' : 'SKIPPED';
            const durationSec = test.duration ? (test.duration / 1000).toFixed(2) : 0;
            
            // Extract module from file path if possible, fallback to suite title
            let module = suite.title;
            if (test.file) {
              if (test.file.includes('auth')) module = 'Authentication';
              else if (test.file.includes('dashboard')) module = 'Dashboard';
              else if (test.file.includes('upload')) module = 'Upload';
              else if (test.file.includes('navigation')) module = 'Navigation';
            }

            this.testResults.push({
              id: test.title.match(/TC\d+/) ? test.title.match(/TC\d+/)[0] : `TC-${String(this.testResults.length + 1).padStart(3, '0')}`,
              module: module,
              scenario: test.title,
              status: status,
              device: process.env.DEVICE_NAME || 'Android Emulator',
              duration: durationSec,
              failureReason: test.err ? test.err.message : '',
              stackTrace: test.err ? test.err.estack : '',
              screenshotPath: status === 'FAIL' ? `failures/${test.title.replace(/[^a-zA-Z0-9]/g, '_')}.png` : '',
              timestamp: new Date().toISOString()
            });
          });
        }
        if (suite.suites && suite.suites.length > 0) {
          suite.suites.forEach(processSuite);
        }
      };

      suites.forEach(processSuite);
    } catch (err) {
      console.error(`❌ Failed to parse Mochawesome JSON: ${err.message}`);
    }
  }

  _loadLogsFromWinston() {
    console.log('🔍 Scanning for Winston JSON logs...');
    const files = glob.sync(`${LOGS_DIR}/*.json`);
    if (files.length === 0) return;

    files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
    const latestLog = files[0];

    try {
      const content = fs.readFileSync(latestLog, 'utf8');
      const lines = content.split('\n').filter(l => l.trim() !== '');
      lines.forEach(line => {
        try {
          const logEntry = JSON.parse(line);
          // Look for structured step logs
          if (logEntry.message && logEntry.message.includes('→')) {
            const match = logEntry.message.match(/\[(.*?)\] (.*?) → (.*?)(?: \| (.*))?$/);
            if (match) {
              this.executionLogs.push({
                timestamp: logEntry.timestamp || new Date().toISOString(),
                testId: match[1],
                step: match[2],
                result: match[3],
                message: match[4] || logEntry.message
              });
            } else {
              // Generic log
              this.executionLogs.push({
                timestamp: logEntry.timestamp || new Date().toISOString(),
                testId: 'SYSTEM',
                step: 'Log Output',
                result: logEntry.level.toUpperCase(),
                message: logEntry.message
              });
            }
          }
        } catch (e) {
          // ignore parsing error for single line
        }
      });
    } catch (err) {
      console.error(`❌ Failed to parse Winston logs: ${err.message}`);
    }
  }

  // ─── Style Helpers ─────────────────────────────────────────────────────────
  _headerStyle(color = 'FF1F4E78') {
    return {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: color },
    };
  }

  _applyHeaderRow(worksheet, headers, widths, color = 'FF1F4E78') {
    worksheet.columns = headers.map((h, i) => ({
      header: h,
      key: h.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      width: widths[i] || 20,
    }));

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.fill = this._headerStyle(color);
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'medium' },
        right: { style: 'thin' }
      };
    });
    headerRow.height = 25;
  }

  _applyBordersAndColors(row, rowIndex, statusColIdx = -1) {
    row.eachCell((cell, colNumber) => {
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        left: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        bottom: { style: 'thin', color: { argb: 'FFD9D9D9' } },
        right: { style: 'thin', color: { argb: 'FFD9D9D9' } }
      };
      cell.alignment = { vertical: 'middle', wrapText: true };
      
      if (rowIndex % 2 === 0) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
      }
    });

    if (statusColIdx > 0) {
      const statusCell = row.getCell(statusColIdx);
      const val = (statusCell.value || '').toUpperCase();
      if (val === 'PASS' || val.includes('PASS')) {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
        statusCell.font = { color: { argb: 'FF006100' }, bold: true };
      } else if (val === 'FAIL' || val.includes('FAIL') || val === 'ERROR') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFC7CE' } };
        statusCell.font = { color: { argb: 'FF9C0006' }, bold: true };
      } else if (val === 'SKIPPED' || val === 'SKIP' || val === 'WARN') {
        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFEB9C' } };
        statusCell.font = { color: { argb: 'FF9C6500' }, bold: true };
      }
      statusCell.alignment = { vertical: 'middle', horizontal: 'center' };
    }
  }

  // ─── Sheet: Summary ────────────────────────────────────────────────────────
  async _addSummarySheet() {
    const ws = this.workbook.addWorksheet('Summary', { properties: { tabColor: { argb: 'FF4F81BD' } } });

    const total   = this.testResults.length;
    const passed  = this.testResults.filter(r => r.status === 'PASS').length;
    const failed  = this.testResults.filter(r => r.status === 'FAIL').length;
    const skipped = total - passed - failed; // Derived to ensure Total = P + F + S
    const passPct = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
    
    // Calculate total duration from tests
    const durationSec = this.testResults.reduce((acc, curr) => acc + parseFloat(curr.duration || 0), 0).toFixed(2);

    ws.columns = [{ width: 25 }, { width: 35 }];
    
    const data = [
      ['Metric', 'Value'],
      ['Execution Date', moment().format('YYYY-MM-DD HH:mm:ss')],
      ['Device Name', process.env.DEVICE_NAME || 'Android Emulator'],
      ['Android Version', process.env.PLATFORM_VERSION || 'Unknown'],
      ['Total Tests', total],
      ['Passed', passed],
      ['Failed', failed],
      ['Skipped', skipped],
      ['Pass Percentage', `${passPct}%`],
      ['Duration (seconds)', durationSec],
    ];

    data.forEach((row, idx) => {
      const wsRow = ws.addRow(row);
      if (idx === 0) {
        wsRow.eachCell(c => {
          c.fill = this._headerStyle();
          c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
          c.alignment = { horizontal: 'center', vertical: 'middle' };
        });
      } else {
        wsRow.getCell(1).font = { bold: true };
        wsRow.getCell(2).alignment = { horizontal: 'left' };
        this._applyBordersAndColors(wsRow, idx + 1);
        
        // Color specific summary rows
        if (row[0] === 'Passed') wsRow.getCell(2).font = { color: { argb: 'FF006100' }, bold: true };
        if (row[0] === 'Failed') wsRow.getCell(2).font = { color: { argb: 'FF9C0006' }, bold: true };
        if (row[0] === 'Pass Percentage') wsRow.getCell(2).font = { bold: true, color: { argb: parseFloat(passPct) >= 80 ? 'FF006100' : 'FF9C0006' } };
      }
    });
  }

  // ─── Sheet: Test Cases ─────────────────────────────────────────────────────
  async _addTestCasesSheet() {
    const ws = this.workbook.addWorksheet('Test Cases', { properties: { tabColor: { argb: 'FF92D050' } } });
    this._applyHeaderRow(ws,
      ['Test ID', 'Module', 'Scenario', 'Status', 'Device', 'Duration (seconds)'],
      [15, 20, 50, 15, 25, 20]
    );

    this.testResults.forEach((r, i) => {
      const row = ws.addRow([r.id, r.module, r.scenario, r.status, r.device, r.duration]);
      this._applyBordersAndColors(row, i, 4);
    });
    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 6 } };
  }

  // ─── Sheet: Passed Tests ───────────────────────────────────────────────────
  async _addPassedTestsSheet() {
    const ws = this.workbook.addWorksheet('Passed Tests', { properties: { tabColor: { argb: 'FF00B050' } } });
    this._applyHeaderRow(ws,
      ['Test ID', 'Module', 'Scenario', 'Execution Time', 'Duration', 'Device'],
      [15, 20, 50, 25, 15, 25],
      'FF339933'
    );

    const passed = this.testResults.filter(r => r.status === 'PASS');
    passed.forEach((r, i) => {
      const row = ws.addRow([r.id, r.module, r.scenario, r.timestamp, r.duration, r.device]);
      this._applyBordersAndColors(row, i);
    });
  }

  // ─── Sheet: Failed Tests ───────────────────────────────────────────────────
  async _addFailedTestsSheet() {
    const ws = this.workbook.addWorksheet('Failed Tests', { properties: { tabColor: { argb: 'FFC00000' } } });
    this._applyHeaderRow(ws,
      ['Test ID', 'Module', 'Scenario', 'Failure Reason', 'Screenshot Path', 'Stack Trace', 'Duration'],
      [15, 20, 40, 50, 40, 60, 15],
      'FF990000'
    );

    const failed = this.testResults.filter(r => r.status === 'FAIL');
    failed.forEach((r, i) => {
      const row = ws.addRow([r.id, r.module, r.scenario, r.failureReason, r.screenshotPath, r.stackTrace, r.duration]);
      this._applyBordersAndColors(row, i);
      row.getCell(4).font = { color: { argb: 'FF9C0006' } };
    });
  }

  // ─── Sheet: Execution Logs ─────────────────────────────────────────────────
  async _addExecutionLogsSheet() {
    const ws = this.workbook.addWorksheet('Execution Logs', { properties: { tabColor: { argb: 'FF7030A0' } } });
    this._applyHeaderRow(ws,
      ['Timestamp', 'Test ID', 'Step Description', 'Result', 'Log Message'],
      [25, 15, 40, 15, 60],
      'FF5C246E'
    );

    this.executionLogs.forEach((log, i) => {
      const row = ws.addRow([
        moment(log.timestamp).format('YYYY-MM-DD HH:mm:ss.SSS'),
        log.testId,
        log.step,
        log.result,
        log.message
      ]);
      this._applyBordersAndColors(row, i, 4);
    });
  }

  // ─── Generate Full Report ─────────────────────────────────────────────────
  async generateReport() {
    // If run as standalone script, load data from disk
    if (this.testResults.length === 0) {
      this._loadResultsFromMochawesome();
    }
    if (this.executionLogs.length === 0) {
      this._loadLogsFromWinston();
    }

    const outputPath = path.join(REPORTS_DIR, 'Flutter_E2E_Report.xlsx');
    this.workbook.creator  = 'Automation Framework';
    this.workbook.created  = new Date();

    await this._addSummarySheet();
    await this._addTestCasesSheet();
    await this._addPassedTestsSheet();
    await this._addFailedTestsSheet();
    await this._addExecutionLogsSheet();

    await this.workbook.xlsx.writeFile(outputPath);
    console.log(`✅ Excel report strictly generated according to requirements at: ${outputPath}`);
    return outputPath;
  }
}

module.exports = new ExcelReporter();
