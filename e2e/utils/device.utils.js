'use strict';

const { execSync, exec } = require('child_process');
const path  = require('path');
const fs    = require('fs-extra');
const logger = require('./logger');

/**
 * Device Utilities — ADB helpers for Android device management.
 */
class DeviceUtils {
  // ─── List Connected Devices ────────────────────────────────────────────────
  static async listDevices() {
    try {
      const output = execSync('adb devices -l', { encoding: 'utf8' });
      const lines  = output.trim().split('\n').slice(1);
      const devices = lines
        .filter(l => l.trim() && !l.includes('offline'))
        .map(l => {
          const parts  = l.trim().split(/\s+/);
          const serial = parts[0];
          const model  = (l.match(/model:(\S+)/) || [])[1] || 'Unknown';
          return { serial, model };
        });
      logger.info(`Connected devices: ${JSON.stringify(devices)}`);
      return devices;
    } catch (err) {
      logger.warn(`Could not list ADB devices: ${err.message}`);
      return [];
    }
  }

  // ─── Get First Connected Device ────────────────────────────────────────────
  static async getConnectedDevice() {
    const devices = await DeviceUtils.listDevices();
    if (devices.length === 0) {
      logger.warn('No devices found. Using emulator-5554 default.');
      return null;
    }
    const device = devices[0];
    device.version = await DeviceUtils.getAndroidVersion(device.serial);
    return device;
  }

  // ─── Get Android Version ───────────────────────────────────────────────────
  static async getAndroidVersion(serial = 'emulator-5554') {
    try {
      const ver = execSync(
        `adb -s ${serial} shell getprop ro.build.version.release`,
        { encoding: 'utf8' }
      ).trim();
      return ver;
    } catch (_) {
      return 'Unknown';
    }
  }

  // ─── Get Device Name ───────────────────────────────────────────────────────
  static async getDeviceName(serial = 'emulator-5554') {
    try {
      const name = execSync(
        `adb -s ${serial} shell getprop ro.product.model`,
        { encoding: 'utf8' }
      ).trim();
      return name;
    } catch (_) {
      return serial;
    }
  }

  // ─── Install APK ──────────────────────────────────────────────────────────
  static async installApk(apkPath, serial = '') {
    const resolvedPath = path.resolve(apkPath);
    if (!fs.existsSync(resolvedPath)) {
      throw new Error(`APK not found: ${resolvedPath}`);
    }
    const deviceFlag = serial ? `-s ${serial}` : '';
    logger.info(`Installing APK: ${resolvedPath}`);
    try {
      execSync(`adb ${deviceFlag} install -r "${resolvedPath}"`, {
        encoding: 'utf8',
        stdio: 'pipe',
      });
      logger.info('✅ APK installed successfully');
    } catch (err) {
      logger.error(`APK installation failed: ${err.message}`);
      throw err;
    }
  }

  // ─── Check APK Installed ──────────────────────────────────────────────────
  static async isAppInstalled(packageName, serial = '') {
    const deviceFlag = serial ? `-s ${serial}` : '';
    try {
      const result = execSync(
        `adb ${deviceFlag} shell pm list packages ${packageName}`,
        { encoding: 'utf8' }
      );
      return result.includes(packageName);
    } catch (_) {
      return false;
    }
  }

  // ─── Clear App Data ───────────────────────────────────────────────────────
  static async clearAppData(packageName, serial = '') {
    const deviceFlag = serial ? `-s ${serial}` : '';
    try {
      execSync(`adb ${deviceFlag} shell pm clear ${packageName}`, { encoding: 'utf8' });
      logger.info(`App data cleared for: ${packageName}`);
    } catch (err) {
      logger.warn(`Could not clear app data: ${err.message}`);
    }
  }

  // ─── Get Logcat ───────────────────────────────────────────────────────────
  static async dumpLogcat(serial = '', outputPath) {
    const deviceFlag = serial ? `-s ${serial}` : '';
    try {
      const log = execSync(
        `adb ${deviceFlag} logcat -d -v threadtime`,
        { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 }
      );
      if (outputPath) {
        await fs.writeFile(outputPath, log, 'utf8');
      }
      return log;
    } catch (err) {
      logger.warn(`Logcat dump failed: ${err.message}`);
      return '';
    }
  }

  // ─── Take ADB Screenshot ──────────────────────────────────────────────────
  static async adbScreenshot(serial = '', outputPath) {
    const deviceFlag = serial ? `-s ${serial}` : '';
    try {
      execSync(
        `adb ${deviceFlag} exec-out screencap -p > "${outputPath}"`,
        { encoding: 'buffer' }
      );
      logger.info(`ADB screenshot saved: ${outputPath}`);
    } catch (err) {
      logger.warn(`ADB screenshot failed: ${err.message}`);
    }
  }

  // ─── Wait for Device Ready ─────────────────────────────────────────────────
  static async waitForDevice(serial = '', timeoutMs = 120000) {
    logger.info('Waiting for device to be ready...');
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      try {
        const result = execSync(
          `adb ${serial ? `-s ${serial}` : ''} shell getprop sys.boot_completed`,
          { encoding: 'utf8', stdio: 'pipe' }
        ).trim();
        if (result === '1') {
          logger.info('✅ Device is ready');
          return true;
        }
      } catch (_) { /* not ready yet */ }
      await new Promise(r => setTimeout(r, 3000));
    }
    throw new Error('Device did not become ready in time');
  }
}

module.exports = DeviceUtils;
