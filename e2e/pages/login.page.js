'use strict';

const BasePage = require('./base.page');
const logger   = require('../utils/logger');

/**
 * LoginPage — Page Object for Research AI Login Screen.
 *
 * Screen elements (from login_screen.dart):
 *  - Email TextField (hint: 'Email')
 *  - Password TextField (hint: 'Password')
 *  - 'Login' ElevatedButton
 *  - 'Forgot Password?' TextButton
 *  - 'Sign Up' GestureDetector text
 */
class LoginPage extends BasePage {
  constructor(driver) {
    super(driver, 'LoginPage');
  }

  // ─── Selectors ─────────────────────────────────────────────────────────────
  get selectors() {
    return {
      emailField:     '//android.widget.EditText[@hint="Email" or @text="Email"]',
      passwordField:  '//android.widget.EditText[@hint="Password" or @text="Password"]',
      loginButton:    '//*[@text="Login"]',
      forgotPassword: '//*[@text="Forgot Password?"]',
      signUpLink:     '//*[@text="Sign Up"]',
      welcomeTitle:   '//*[@text="Welcome Back!"]',
      snackbar:       '//android.widget.FrameLayout/android.widget.TextView',
    };
  }

  // ─── Wait for Page Load ────────────────────────────────────────────────────
  async waitForPage() {
    await this.waitForText('Welcome Back!');
    logger.info('[LoginPage] Page loaded');
  }

  // ─── Enter Email ───────────────────────────────────────────────────────────
  async enterEmail(email) {
    await this.typeInto(this.selectors.emailField, email);
    logger.logStep('LoginPage', `Enter email: ${email}`, 'PASS');
  }

  // ─── Enter Password ────────────────────────────────────────────────────────
  async enterPassword(password) {
    await this.typeInto(this.selectors.passwordField, password);
    logger.logStep('LoginPage', 'Enter password', 'PASS');
  }

  // ─── Tap Login Button ──────────────────────────────────────────────────────
  async tapLogin() {
    await this.tap(this.selectors.loginButton);
    logger.logStep('LoginPage', 'Tap Login button', 'PASS');
    await this.pause(2000);
  }

  // ─── Full Login Action ─────────────────────────────────────────────────────
  async login(email, password) {
    await this.waitForPage();
    await this.enterEmail(email);
    await this.enterPassword(password);
    await this.tapLogin();
  }

  // ─── Login and Expect Success (Dashboard) ─────────────────────────────────
  async loginExpectSuccess(email, password) {
    await this.login(email, password);
    await this.waitForLoadingDone();
    // Wait for Dashboard to appear
    await this.waitForText('What would you like to do?', 20000);
    logger.logStep('LoginPage', 'Login success → Dashboard visible', 'PASS');
  }

  // ─── Login and Expect Error ────────────────────────────────────────────────
  async loginExpectError(email, password) {
    await this.login(email, password);
    await this.pause(2000);
    // Snackbar should be visible
    const snackbar = await this.getSnackbarText();
    logger.logStep('LoginPage', `Login error snackbar: "${snackbar}"`, 'INFO');
    return snackbar;
  }

  // ─── Tap Forgot Password ───────────────────────────────────────────────────
  async tapForgotPassword() {
    await this.tap(this.selectors.forgotPassword);
    logger.logStep('LoginPage', 'Tap Forgot Password', 'PASS');
    await this.pause(1000);
  }

  // ─── Tap Sign Up ──────────────────────────────────────────────────────────
  async tapSignUp() {
    await this.tap(this.selectors.signUpLink);
    logger.logStep('LoginPage', 'Tap Sign Up link', 'PASS');
    await this.pause(1000);
  }

  // ─── Get Snackbar Text ────────────────────────────────────────────────────
  async getSnackbarText(timeout = 5000) {
    try {
      const el = await this.driver.$(this.selectors.snackbar);
      await el.waitForDisplayed({ timeout });
      return el.getText();
    } catch (_) {
      return null;
    }
  }

  // ─── Is On Login Page ────────────────────────────────────────────────────
  async isOnLoginPage() {
    return this.isDisplayed(this.selectors.welcomeTitle);
  }
}

module.exports = LoginPage;
