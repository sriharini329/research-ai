'use strict';

const BasePage = require('./base.page');
const logger   = require('../utils/logger');

class ProfilePage extends BasePage {
  constructor(driver) { super(driver, 'ProfilePage'); }

  get selectors() {
    return {
      title:         '//*[@text="Profile"]',
      userName:      '//*[@resource-id="user_name" or @content-desc="user_name"]',
      editProfileBtn:'//*[@text="Edit Profile"]',
      changePassBtn: '//*[@text="Change Password"]',
      logoutBtn:     '//*[@text="Logout" or @text="Sign Out"]',
      settingsBtn:   '//*[@text="Settings"]',
    };
  }

  async waitForPage() {
    await this.waitForText('Profile', 15000);
    logger.info('[ProfilePage] Profile page loaded');
  }

  async tapEditProfile() {
    await this.tap(this.selectors.editProfileBtn);
    logger.logStep('ProfilePage', 'Tap Edit Profile', 'PASS');
    await this.pause(1000);
  }

  async tapLogout() {
    await this.tap(this.selectors.logoutBtn);
    logger.logStep('ProfilePage', 'Tap Logout', 'PASS');
    await this.pause(2000);
  }

  async tapChangePassword() {
    await this.tap(this.selectors.changePassBtn);
    logger.logStep('ProfilePage', 'Tap Change Password', 'PASS');
    await this.pause(1000);
  }

  async tapSettings() {
    await this.tap(this.selectors.settingsBtn);
    logger.logStep('ProfilePage', 'Tap Settings', 'PASS');
    await this.pause(1000);
  }
}

module.exports = ProfilePage;
