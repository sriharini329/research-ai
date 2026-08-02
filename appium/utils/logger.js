'use strict';

const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');
const fs = require('fs-extra');

// Ensure logs directory exists
const LOG_DIR = path.join(__dirname, '..', 'reports', 'logs');
fs.ensureDirSync(LOG_DIR);

// ─── Custom Log Format ────────────────────────────────────────────────────────
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    const base = `[${timestamp}] [${level.toUpperCase().padStart(5)}] ${message}`;
    return stack ? `${base}\n${stack}` : base;
  })
);

const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// ─── Transports ───────────────────────────────────────────────────────────────
const transports = [
  // Console output
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      logFormat
    ),
    level: process.env.LOG_LEVEL || 'info',
  }),

  // Daily rotated file (human-readable)
  new DailyRotateFile({
    dirname: LOG_DIR,
    filename: 'test-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: logFormat,
    level: 'debug',
  }),

  // JSON log file for Excel/HTML report ingestion
  new DailyRotateFile({
    dirname: LOG_DIR,
    filename: 'test-%DATE%.json',
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    format: jsonFormat,
    level: 'debug',
  }),
];

// ─── Logger Instance ──────────────────────────────────────────────────────────
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  transports,
  exitOnError: false,
});

// ─── Execution Log Buffer (for Excel Sheet 4) ─────────────────────────────────
const executionLogs = [];

/**
 * Log a test step result to the execution log buffer.
 * @param {string} testName
 * @param {string} step
 * @param {string} result  - 'PASS' | 'FAIL' | 'SKIP' | 'INFO'
 * @param {string} remarks
 */
logger.logStep = (testName, step, result, remarks = '') => {
  const entry = {
    timestamp: new Date().toISOString(),
    testName,
    step,
    result,
    remarks,
  };
  executionLogs.push(entry);
  const lvl = result === 'FAIL' ? 'error' : result === 'SKIP' ? 'warn' : 'info';
  logger[lvl](`[${testName}] ${step} → ${result}${remarks ? ' | ' + remarks : ''}`);
};

/**
 * Returns all buffered execution log entries.
 */
logger.getExecutionLogs = () => executionLogs;

/**
 * Clears execution log buffer.
 */
logger.clearExecutionLogs = () => executionLogs.splice(0, executionLogs.length);

module.exports = logger;
