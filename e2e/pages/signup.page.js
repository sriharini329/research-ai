'use strict';

const BasePage = require('./base.page');
const logger   = require('../utils/logger');

/**
 * SignupPage — Page Object for Research AI Signup Screen.
 *
 * Screen elements (from signup_screen.dart):
 *  - Full Name TextField (hint: 'Full Name')
 *  - Email TextField (hint: 'Email')
 *  - Password TextField (hint: 'Password')
 *  - Confirm Password TextField (hint: 'Confirm Password')
 *  - 'Sign Up' ElevatedButton
 *  - 'Login' GestureDetector text
 */
class SignupPage extends BasePage {
  constructor(driver) {
    super(driver, 'SignupPage');
  }

  get selectors() {
    return {
      fullNameField:    '//android.widget.EditText[@hint="Full Name"]',
      emailField:       '//android.widget.EditText[@hint="Email"]',
      passwordField:    '//android.widget.EditText[@hint="Password"]',
      confirmPassField: '//android.widget.EditText[@hint="Confirm Password"]',
      signUpButton:     '//*[@text="Sign Up"]',
      loginLink:        '//*[@text="Login"]',
      createAccount:    '//*[@text="Create Account"]',
      snackbar:         '//android.widget.FrameLayout/android.widget.TextView',
    };
  }

  async waitForPage() {
    await this.waitForText('Create Account');
    logger.info('[SignupPage] Page loaded');
  }

  async enterFullName(name) {
    await this.typeInto(this.selectors.fullNameField, name);
    logger.logStep('SignupPage', `Enter name: ${name}`, 'PASS');
  }

  async enterEmail(email) {
    await this.typeInto(this.selectors.emailField, email);
    logger.logStep('SignupPage', `Enter email: ${email}`, 'PASS');
  }

  async enterPassword(password) {
    await this.typeInto(this.selectors.passwordField, password);
    logger.logStep('SignupPage', 'Enter password', 'PASS');
  }

  async enterConfirmPassword(password) {
    await this.typeInto(this.selectors.confirmPassField, password);
    logger.logStep('SignupPage', 'Enter confirm password', 'PASS');
  }

  async tapSignUp() {
    await this.tap(this.selectors.signUpButton);
    logger.logStep('SignupPage', 'Tap Sign Up button', 'PASS');
    await this.pause(2000);
  }

  async tapLoginLink() {
    await this.tap(this.selectors.loginLink);
    await this.pause(1000);
  }

  // Full signup flow
  async signup(name, email, password, confirmPassword = password) {
    await this.waitForPage();
    await this.enterFullName(name);
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.enterConfirmPassword(confirmPassword);
    await this.tapSignUp();
  }

  async signupExpectSuccess(name, email, password) {
    await this.signup(name, email, password);
    await this.waitForLoadingDone();
    // After success → should navigate to /interests
    await this.waitForText('Select Interests', 15000);
    logger.logStep('SignupPage', 'Signup success → Interests visible', 'PASS');
  }

  async getSnackbarText(timeout = 5000) {
    try {
      const el = await this.driver.$(this.selectors.snackbar);
      await el.waitForDisplayed({ timeout });
      return el.getText();
    } catch (_) {
      return null;
    }
  }

  async isOnSignupPage() {
    return this.isDisplayed(this.selectors.createAccount);
  }
}

module.exports = SignupPage;
