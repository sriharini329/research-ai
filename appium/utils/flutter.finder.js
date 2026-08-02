'use strict';

const logger = require('./logger');

// Try to use the official appium-flutter-finder package if available
let nativeFinder = null;
try {
  nativeFinder = require('appium-flutter-finder');
} catch (_) {
  // Package not installed — use built-in implementations below
}

/**
 * Flutter Finder Utilities
 *
 * Provides all Flutter-specific locator strategies for Appium Flutter Driver.
 * Uses appium-flutter-finder package when available, falls back to
 * raw selector strings for UiAutomator2 mode.
 *
 * Usage:
 *   const { find } = require('../utils/flutter.finder');
 *   await driver.$(find.byValueKey('login_button'));
 */

class FlutterFinder {
  constructor() {
    this.driverType = 'uiautomator2'; // default safe fallback
  }

  setDriverType(type) {
    this.driverType = type;
    logger.info(`FlutterFinder: driver type set to ${type}`);
  }

  // ─── Flutter Native Finders ────────────────────────────────────────────────

  /**
   * Locate widget by ValueKey
   * @param {string} key - The ValueKey string
   */
  byValueKey(key) {
    if (this.driverType === 'flutter' && nativeFinder) {
      return nativeFinder.find.byValueKey(key);
    }
    if (this.driverType === 'flutter') {
      return { using: 'key', value: key };
    }
    // UiAutomator2 fallback: accessibility id
    return `~${key}`;
  }

  /**
   * Locate widget by displayed text
   * @param {string} text
   */
  byText(text) {
    if (this.driverType === 'flutter' && nativeFinder) {
      return nativeFinder.find.byText(text);
    }
    if (this.driverType === 'flutter') {
      return { using: 'text', value: text };
    }
    return `//*[@text="${text}" or @content-desc="${text}"]`;
  }

  /**
   * Locate widget by Semantics label (accessibility label)
   * @param {string} label
   */
  bySemanticsLabel(label) {
    if (this.driverType === 'flutter' && nativeFinder) {
      return nativeFinder.find.bySemanticsLabel(label);
    }
    if (this.driverType === 'flutter') {
      return { using: 'semantics label', value: label };
    }
    return `~${label}`;
  }

  /**
   * Locate widget by Flutter widget type
   * @param {string} widgetType - e.g. 'ElevatedButton', 'TextField'
   */
  byType(widgetType) {
    if (this.driverType === 'flutter' && nativeFinder) {
      return nativeFinder.find.byType(widgetType);
    }
    if (this.driverType === 'flutter') {
      return { using: 'type', value: widgetType };
    }
    return `//*[contains(@class, "${widgetType}")]`;
  }

  /**
   * Locate widget by tooltip text
   * @param {string} tooltip
   */
  byTooltip(tooltip) {
    if (this.driverType === 'flutter' && nativeFinder) {
      return nativeFinder.find.byTooltip(tooltip);
    }
    if (this.driverType === 'flutter') {
      return { using: 'tooltip', value: tooltip };
    }
    return `//*[@content-desc="${tooltip}"]`;
  }

  /**
   * Locate by ancestor widget type
   * @param {string} type
   */
  byAncestor(type) {
    if (this.driverType === 'flutter') {
      return { using: 'ancestor', value: type };
    }
    return `//*[ancestor::${type}]`;
  }

  /**
   * Locate by descendant widget type
   * @param {string} type
   */
  byDescendant(type) {
    if (this.driverType === 'flutter') {
      return { using: 'descendant', value: type };
    }
    return `//*[descendant::${type}]`;
  }

  // ─── UiAutomator2 / XPath Fallbacks ───────────────────────────────────────

  /** Standard accessibility ID */
  byAccessibilityId(id) {
    return `~${id}`;
  }

  /** Android resource ID */
  byResourceId(id) {
    return `id:${id}`;
  }

  /** XPath selector */
  byXPath(xpath) {
    return xpath;
  }

  /** Android UI Automator selector */
  byUiAutomator(selector) {
    return `android=${selector}`;
  }

  // ─── Research AI App Specific Locators ────────────────────────────────────

  get LOGIN() {
    return {
      emailField:     this.byText('Email'),
      passwordField:  this.byText('Password'),
      loginButton:    this.byText('Login'),
      forgotPassword: this.byText('Forgot Password?'),
      signUpLink:     this.byText('Sign Up'),
      welcomeText:    this.byText('Welcome Back!'),
      loginSubText:   this.byText('Login to continue'),
    };
  }

  get SIGNUP() {
    return {
      fullNameField:    this.byText('Full Name'),
      emailField:       this.byText('Email'),
      passwordField:    this.byText('Password'),
      confirmPassField: this.byText('Confirm Password'),
      signUpButton:     this.byText('Sign Up'),
      loginLink:        this.byText('Login'),
      createAccountText:this.byText('Create Account'),
    };
  }

  get DASHBOARD() {
    return {
      uploadCard:       this.byText('Upload Paper'),
      askQuestionCard:  this.byText('Ask Question'),
      findPapersCard:   this.byText('Find Papers'),
      myLibraryCard:    this.byText('My Library'),
      recentPapersText: this.byText('Recent Papers'),
      notificationsBtn: this.byType('IconButton'),
    };
  }

  get SNACKBAR() {
    return {
      fillAllFields:   this.byText('Please fill in all fields'),
      validEmail:      this.byText('Enter a valid email'),
      passwordLength:  this.byText('Password must be 6+ characters'),
      passwordMismatch:this.byText('Passwords do not match'),
    };
  }

  get NAV() {
    return {
      homeTab:    this.byText('Home'),
      libraryTab: this.byText('Library'),
      searchTab:  this.byText('Search'),
      profileTab: this.byText('Profile'),
    };
  }
}

const find = new FlutterFinder();
module.exports = { find, FlutterFinder };
