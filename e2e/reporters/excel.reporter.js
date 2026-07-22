'use strict';

const ExcelJS  = require('exceljs');
const path     = require('path');
const fs       = require('fs-extra');
const moment   = require('moment');
const logger   = require('../utils/logger');
const DeviceUtils = require('../utils/device.utils');
const ScreenshotUtils = require('../utils/screenshot');

const REPORTS_DIR = path.join(__dirname, '..', 'reports');
fs.ensureDirSync(REPORTS_DIR);

/**
 * Excel Report Generator
 * Generates Flutter_E2E_Report.xlsx with 4 sheets.
 * Call generateReport(results) after all tests finish.
 */
class ExcelReporter {
  constructor() {
    this.workbook    = new ExcelJS.Workbook();
    this.testResults = [];
    this.startTime   = new Date();
  }

  // ─── Register a Test Result ────────────────────────────────────────────────
  addResult({ id, module, scenario, status, device, duration, failureReason, screenshotPath }) {
    this.testResults.push({
      id,
      module,
      scenario,
      status,
      device,
      duration,
      failureReason: failureReason || '',
      screenshotPath: screenshotPath || '',
      timestamp: new Date().toISOString(),
    });
  }

  // ─── Style Helpers ─────────────────────────────────────────────────────────
  _headerStyle(color = 'FF4B5563') {
    return {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: color },
    };
  }

  _applyHeaderRow(worksheet, headers, widths) {
    worksheet.columns = headers.map((h, i) => ({
      header: h,
      key: h.toLowerCase().replace(/\s+/g, '_'),
      width: widths[i] || 20,
    }));

    const headerRow = worksheet.getRow(1);
    headerRow.eachCell(cell => {
      cell.fill = this._headerStyle('FF1E3A5F');
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        bottom: { style: 'medium', color: { argb: 'FF4B9CD3' } },
      };
    });
    headerRow.height = 28;
  }

  _statusColor(status) {
    switch ((status || '').toUpperCase()) {
      case 'PASS':   return 'FFD4EDDA';
      case 'FAIL':   return 'FFF8D7DA';
      case 'SKIP':   return 'FFFFF3CD';
      default:       return 'FFFFFFFF';
    }
  }

  // ─── Sheet 1: Summary ─────────────────────────────────────────────────────
  async _addSummarySheet(deviceName, androidVersion) {
    const ws = this.workbook.addWorksheet('📊 Summary', {
      pageSetup: { fitToPage: true },
      properties: { tabColor: { argb: 'FF1E3A5F' } },
    });

    const total   = this.testResults.length;
    const passed  = this.testResults.filter(r => r.status === 'PASS').length;
    const failed  = this.testResults.filter(r => r.status === 'FAIL').length;
    const skipped = total - passed - failed;
    const passPct = total > 0 ? ((passed / total) * 100).toFixed(1) : '0.0';
    const duration = moment().diff(moment(this.startTime), 'seconds');

    const data = [
      ['Metric', 'Value'],
      ['📅 Execution Date', moment().format('YYYY-MM-DD HH:mm:ss')],
      ['📱 Device Name', deviceName],
      ['🤖 Android Version', androidVersion],
      ['🧪 Total Tests', total],
      ['✅ Passed', passed],
      ['❌ Failed', failed],
      ['⏭️  Skipped', skipped],
      ['📈 Pass Percentage', `${passPct}%`],
      ['⏱️  Duration (seconds)', duration],
    ];

    ws.columns = [{ width: 28 }, { width: 36 }];
    data.forEach((row, idx) => {
      const wsRow = ws.addRow(row);
      if (idx === 0) {
        wsRow.eachCell(c => {
          c.fill = this._headerStyle('FF1E3A5F');
          c.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 12 };
          c.alignment = { horizontal: 'center', vertical: 'middle' };
        });
        wsRow.height = 28;
      } else {
        wsRow.getCell(1).font = { bold: true, color: { argb: 'FF374151' } };
        wsRow.getCell(2).alignment = { horizontal: 'left' };
        // Color pass/fail rows
        if (row[0].includes('Passed'))  wsRow.getCell(2).font = { color: { argb: 'FF166534' }, bold: true };
        if (row[0].includes('Failed'))  wsRow.getCell(2).font = { color: { argb: 'FF991B1B' }, bold: true };
        if (row[0].includes('Pass Percentage')) {
          wsRow.getCell(2).font = { bold: true, color: { argb: parseFloat(passPct) >= 80 ? 'FF166534' : 'FF991B1B' } };
        }
      }
      wsRow.eachCell(c => {
        c.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
      });
    });

    logger.info('Excel: Summary sheet added');
  }

  // ─── Sheet 2: Test Cases ──────────────────────────────────────────────────
  async _addTestCasesSheet() {
    const ws = this.workbook.addWorksheet('🧪 Test Cases', {
      properties: { tabColor: { argb: 'FF059669' } },
    });

    this._applyHeaderRow(ws,
      ['Test ID', 'Module', 'Scenario', 'Status', 'Device', 'Duration (s)'],
      [12, 20, 50, 12, 24, 14]
    );

    this.testResults.forEach((r, i) => {
      const row = ws.addRow([
        r.id || `TC${String(i + 1).padStart(3, '0')}`,
        r.module,
        r.scenario,
        r.status,
        r.device,
        r.duration || 0,
      ]);
      const statusCell = row.getCell(4);
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this._statusColor(r.status).replace('FF', 'FF') } };
      statusCell.font = { bold: true };
      statusCell.alignment = { horizontal: 'center' };
      row.eachCell(c => {
        c.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
        c.alignment = { vertical: 'middle', ...c.alignment };
      });
      // Alternate row background
      if (i % 2 === 0) {
        row.eachCell(c => {
          if (!c.fill?.fgColor?.argb?.startsWith('FFD4') && !c.fill?.fgColor?.argb?.startsWith('FFF8')) {
            c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };
          }
        });
      }
    });

    ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: 6 } };
    logger.info('Excel: Test Cases sheet added');
  }

  // ─── Sheet 3: Failed Tests ────────────────────────────────────────────────
  async _addFailedTestsSheet(androidVersion, deviceName) {
    const ws = this.workbook.addWorksheet('❌ Failed Tests', {
      properties: { tabColor: { argb: 'FFDC2626' } },
    });

    this._applyHeaderRow(ws,
      ['Test Name', 'Failure Reason', 'Screenshot Path', 'Device', 'Android Version'],
      [36, 60, 60, 24, 18]
    );

    const failed = this.testResults.filter(r => r.status === 'FAIL');
    if (failed.length === 0) {
      const row = ws.addRow(['🎉 No failures!', '', '', '', '']);
      row.getCell(1).font = { color: { argb: 'FF166534' }, bold: true };
    } else {
      failed.forEach(r => {
        const row = ws.addRow([
          r.scenario,
          r.failureReason,
          r.screenshotPath,
          deviceName,
          androidVersion,
        ]);
        row.getCell(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF1F2' } };
        row.eachCell(c => {
          c.border = { bottom: { style: 'thin', color: { argb: 'FFFECACA' } } };
          c.alignment = { vertical: 'top', wrapText: true };
        });
        row.height = 36;
      });
    }

    logger.info('Excel: Failed Tests sheet added');
  }

  // ─── Sheet 4: Execution Logs ──────────────────────────────────────────────
  async _addExecutionLogsSheet() {
    const ws = this.workbook.addWorksheet('📋 Execution Logs', {
      properties: { tabColor: { argb: 'FF7C3AED' } },
    });

    this._applyHeaderRow(ws,
      ['Timestamp', 'Test Name', 'Step', 'Result', 'Remarks'],
      [24, 36, 50, 12, 40]
    );

    const logs = logger.getExecutionLogs();
    if (logs.length === 0) {
      ws.addRow(['No logs recorded', '', '', '', '']);
    } else {
      logs.forEach(log => {
        const row = ws.addRow([
          moment(log.timestamp).format('HH:mm:ss.SSS'),
          log.testName,
          log.step,
          log.result,
          log.remarks,
        ]);
        const resultCell = row.getCell(4);
        resultCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: this._statusColor(log.result) } };
        resultCell.font = { bold: true };
        resultCell.alignment = { horizontal: 'center' };
        row.eachCell(c => {
          c.border = { bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
        });
      });
    }

    logger.info('Excel: Execution Logs sheet added');
  }

  // ─── Generate Full Report ─────────────────────────────────────────────────
  async generateReport() {
    const deviceName     = await DeviceUtils.getDeviceName().catch(() => 'Unknown Device');
    const androidVersion = await DeviceUtils.getAndroidVersion().catch(() => 'Unknown');
    const outputPath     = path.join(REPORTS_DIR, 'Flutter_E2E_Report.xlsx');

    this.workbook.creator  = 'Research AI QA Team';
    this.workbook.lastModifiedBy = 'Appium Automation';
    this.workbook.created  = new Date();
    this.workbook.modified = new Date();

    await this._addSummarySheet(deviceName, androidVersion);
    await this._addTestCasesSheet();
    await this._addFailedTestsSheet(androidVersion, deviceName);
    await this._addExecutionLogsSheet();

    await this.workbook.xlsx.writeFile(outputPath);
    logger.info(`✅ Excel report saved: ${outputPath}`);
    return outputPath;
  }
}

// Singleton
const excelReporter = new ExcelReporter();
module.exports = excelReporter;
