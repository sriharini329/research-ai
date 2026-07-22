'use strict';

const { remote } = require('webdriverio');
const { flutterCapabilities, uiAutomator2Capabilities, appiumServerConfig } = require('../config/appium.config');
const logger = require('../utils/logger');
const DeviceUtils = require('../utils/device.utils');

/**
 * DriverFactory — Creates and manages Appium WebDriver sessions.
 * Attempts Flutter driver first; falls back to UiAutomator2.
 */
class DriverFactory {
  constructor() {
    this.driver = null;
    this.driverType = null;
  }

  // ─── Create Driver Session ──────────────────────────────────────────────────
  async create(preferredDriver = 'flutter') {
    const connectedDevice = await DeviceUtils.getConnectedDevice();
    const caps = preferredDriver === 'flutter'
      ? { ...flutterCapabilities }
      : { ...uiAutomator2Capabilities };

    // Override device name with auto-detected device
    if (connectedDevice) {
      caps['appium:deviceName'] = connectedDevice.serial;
      caps['appium:platformVersion'] = connectedDevice.version || caps['appium:platformVersion'];
      logger.info(`Auto-detected device: ${connectedDevice.serial} (Android ${connectedDevice.version})`);
    }

    logger.info(`Creating Appium session with driver: ${preferredDriver.toUpperCase()}`);
    logger.info(`Capabilities: ${JSON.stringify(caps, null, 2)}`);

    try {
      this.driver = await remote({
        ...appiumServerConfig,
        capabilities: caps,
      });
      this.driverType = preferredDriver;
      logger.info(`✅ ${preferredDriver.toUpperCase()} driver session created successfully`);
      return this.driver;
    } catch (err) {
      if (preferredDriver === 'flutter') {
        logger.warn(`Flutter driver failed (${err.message}). Falling back to UiAutomator2...`);
        return this.create('uiautomator2');
      }
      logger.error(`Failed to create driver session: ${err.message}`);
      throw err;
    }
  }

  // ─── Get Current Driver ─────────────────────────────────────────────────────
  getDriver() {
    if (!this.driver) {
      throw new Error('Driver not initialized. Call create() first.');
    }
    return this.driver;
  }

  // ─── Get Driver Type ────────────────────────────────────────────────────────
  getDriverType() {
    return this.driverType;
  }

  // ─── Destroy Session ────────────────────────────────────────────────────────
  async destroy() {
    if (this.driver) {
      try {
        await this.driver.deleteSession();
        logger.info('✅ Appium session closed');
      } catch (err) {
        logger.warn(`Error closing session: ${err.message}`);
      } finally {
        this.driver = null;
        this.driverType = null;
      }
    }
  }

  // ─── Restart App ────────────────────────────────────────────────────────────
  async restartApp() {
    logger.info('Restarting app...');
    if (this.driver) {
      await this.driver.terminateApp(require('../config/appium.config').APP_PACKAGE);
      await this.driver.pause(1000);
      await this.driver.activateApp(require('../config/appium.config').APP_PACKAGE);
      await this.driver.pause(2000);
    }
  }

  // ─── Reset App ──────────────────────────────────────────────────────────────
  async resetApp() {
    logger.info('Resetting app state...');
    if (this.driver) {
      await DeviceUtils.clearAppData(require('../config/appium.config').APP_PACKAGE);
      await this.driver.pause(1000);
    }
  }
}

// Singleton instance shared across tests
const factory = new DriverFactory();
module.exports = factory;
