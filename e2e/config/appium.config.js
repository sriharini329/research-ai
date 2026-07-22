'use strict';

require('dotenv').config();

/**
 * Appium 2.x Capabilities & Server Configuration
 * Research AI Flutter Android App
 */

const DEFAULT_APK_PATH = process.env.APK_PATH || './app/app-release.apk';
const APP_PACKAGE    = process.env.APP_PACKAGE  || 'com.company.app';
const APP_ACTIVITY   = process.env.APP_ACTIVITY  || 'com.company.app.MainActivity';
const DEVICE_NAME    = process.env.DEVICE_NAME   || 'emulator-5554';
const PLATFORM_VER   = process.env.PLATFORM_VERSION || '13.0';
const APPIUM_HOST    = process.env.APPIUM_HOST   || '127.0.0.1';
const APPIUM_PORT    = parseInt(process.env.APPIUM_PORT || '4723', 10);

// ─── Flutter Driver Capabilities ─────────────────────────────────────────────
const flutterCapabilities = {
  platformName: 'Android',
  'appium:automationName': 'Flutter',
  'appium:deviceName': DEVICE_NAME,
  'appium:platformVersion': PLATFORM_VER,
  'appium:app': DEFAULT_APK_PATH,
  'appium:appPackage': APP_PACKAGE,
  'appium:appActivity': APP_ACTIVITY,
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:autoGrantPermissions': true,
  'appium:newCommandTimeout': 120,
  'appium:adbExecTimeout': 60000,
  'appium:androidInstallTimeout': 120000,
  'appium:skipUnlock': true,
  'appium:disableWindowAnimation': true,
  'flutter:waitForIdleTimeout': 20000,
};

// ─── UiAutomator2 Fallback Capabilities ──────────────────────────────────────
const uiAutomator2Capabilities = {
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': DEVICE_NAME,
  'appium:platformVersion': PLATFORM_VER,
  'appium:app': DEFAULT_APK_PATH,
  'appium:appPackage': APP_PACKAGE,
  'appium:appActivity': APP_ACTIVITY,
  'appium:noReset': false,
  'appium:fullReset': false,
  'appium:autoGrantPermissions': true,
  'appium:newCommandTimeout': 120,
  'appium:adbExecTimeout': 60000,
  'appium:androidInstallTimeout': 120000,
  'appium:skipUnlock': true,
  'appium:disableWindowAnimation': true,
  'appium:uiautomator2ServerInstallTimeout': 60000,
  'appium:ensureWebviewsHavePages': true,
};

// ─── Appium Server Config ─────────────────────────────────────────────────────
const appiumServerConfig = {
  hostname: APPIUM_HOST,
  port: APPIUM_PORT,
  path: '/wd/hub',
  connectionRetryTimeout: 180000,
  connectionRetryCount: 3,
  logLevel: process.env.APPIUM_LOG_LEVEL || 'info',
};

module.exports = {
  flutterCapabilities,
  uiAutomator2Capabilities,
  appiumServerConfig,
  APK_PATH: DEFAULT_APK_PATH,
  APP_PACKAGE,
  APP_ACTIVITY,
  DEVICE_NAME,
  PLATFORM_VER,
};
