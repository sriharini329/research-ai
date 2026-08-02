'use strict';

const logger = require('./logger');

/**
 * AI-Assisted Testing Module
 *
 * Analyzes screens, discovers widgets, generates test scenarios dynamically,
 * validates required fields, and maps navigation paths.
 */
class AiExplorer {
  constructor(driver) {
    this.driver    = driver;
    this.widgetMap = {};
    this.navPaths  = [];
  }

  // ─── Discover All Visible Widgets on Current Screen ────────────────────────
  async discoverWidgets() {
    logger.info('🤖 AI Explorer: Discovering widgets on current screen...');
    const widgets = {};

    try {
      // Attempt Flutter widget tree
      const tree = await this.driver.execute('flutter:getWidgetTree', {});
      widgets.flutterTree = tree;
      logger.info('Flutter widget tree retrieved');
    } catch (_) {
      // Fallback to UiAutomator2 hierarchy
      logger.info('Using UiAutomator2 source (Flutter tree unavailable)');
    }

    // Get all clickable elements
    try {
      const clickables = await this.driver.$$('[clickable="true"]');
      widgets.clickable = await Promise.all(
        clickables.map(async el => ({
          text:   await el.getText().catch(() => ''),
          desc:   await el.getAttribute('content-desc').catch(() => ''),
          class:  await el.getAttribute('class').catch(() => ''),
          id:     await el.getAttribute('resource-id').catch(() => ''),
        }))
      );
      logger.info(`Found ${widgets.clickable.length} clickable elements`);
    } catch (err) {
      logger.warn(`Widget discovery (clickable): ${err.message}`);
    }

    // Get all text fields
    try {
      const textFields = await this.driver.$$('android.widget.EditText');
      widgets.textFields = await Promise.all(
        textFields.map(async el => ({
          hint:  await el.getAttribute('hint').catch(() => ''),
          text:  await el.getText().catch(() => ''),
          id:    await el.getAttribute('resource-id').catch(() => ''),
        }))
      );
      logger.info(`Found ${widgets.textFields.length} text fields`);
    } catch (err) {
      logger.warn(`Widget discovery (textFields): ${err.message}`);
    }

    // Get all buttons
    try {
      const buttons = await this.driver.$$('android.widget.Button');
      widgets.buttons = await Promise.all(
        buttons.map(async el => ({
          text: await el.getText().catch(() => ''),
          id:   await el.getAttribute('resource-id').catch(() => ''),
        }))
      );
      logger.info(`Found ${widgets.buttons.length} buttons`);
    } catch (err) {
      logger.warn(`Widget discovery (buttons): ${err.message}`);
    }

    this.widgetMap = widgets;
    logger.info('🤖 Widget discovery complete');
    return widgets;
  }

  // ─── Generate Test Scenarios From Discovered Widgets ──────────────────────
  generateTestScenarios(widgetMap = this.widgetMap) {
    const scenarios = [];

    // Text field scenarios
    if (widgetMap.textFields?.length) {
      scenarios.push({
        name: 'Empty Form Submission',
        description: `Submit form without filling ${widgetMap.textFields.length} text fields`,
        type: 'validation',
        fields: widgetMap.textFields.map(f => f.hint || f.id),
      });

      const emailFields = widgetMap.textFields.filter(f =>
        /email/i.test(f.hint) || /email/i.test(f.id)
      );
      if (emailFields.length) {
        scenarios.push({
          name: 'Invalid Email Format',
          description: 'Enter invalid email and verify error',
          type: 'validation',
          fields: emailFields.map(f => f.hint),
        });
      }

      const passFields = widgetMap.textFields.filter(f =>
        /pass/i.test(f.hint) || /pass/i.test(f.id)
      );
      if (passFields.length) {
        scenarios.push({
          name: 'Password Validation',
          description: 'Validate password length and complexity requirements',
          type: 'validation',
        });
      }
    }

    // Button scenarios
    if (widgetMap.buttons?.length || widgetMap.clickable?.length) {
      const allButtons = [
        ...(widgetMap.buttons || []),
        ...(widgetMap.clickable || []).filter(c => c.class?.includes('Button')),
      ];
      allButtons.forEach(btn => {
        if (btn.text) {
          scenarios.push({
            name: `Tap "${btn.text}" Button`,
            description: `Verify ${btn.text} button action`,
            type: 'action',
            element: btn.text,
          });
        }
      });
    }

    logger.info(`🤖 Generated ${scenarios.length} test scenarios from widget discovery`);
    return scenarios;
  }

  // ─── Detect Required Fields ───────────────────────────────────────────────
  async detectRequiredFields() {
    const widgets = await this.discoverWidgets();
    const required = [];

    if (widgets.textFields) {
      widgets.textFields.forEach(f => {
        const hint = (f.hint || '').toLowerCase();
        if (
          hint.includes('required') ||
          hint.includes('name') ||
          hint.includes('email') ||
          hint.includes('password') ||
          hint.includes('phone')
        ) {
          required.push({ hint: f.hint, id: f.id });
        }
      });
    }

    logger.info(`🤖 Detected ${required.length} likely required fields`);
    return required;
  }

  // ─── Discover Navigation Paths ────────────────────────────────────────────
  async discoverNavigationPaths() {
    logger.info('🤖 Discovering navigation paths...');
    const paths = [];

    try {
      const tabs = await this.driver.$$('[role="tab"]');
      for (const tab of tabs) {
        const label = await tab.getAttribute('content-desc').catch(() => '');
        if (label) paths.push({ type: 'tab', label });
      }
    } catch (_) {}

    try {
      const navItems = await this.driver.$$('android.widget.FrameLayout[clickable="true"]');
      for (const item of navItems) {
        const desc = await item.getAttribute('content-desc').catch(() => '');
        if (desc) paths.push({ type: 'nav', label: desc });
      }
    } catch (_) {}

    this.navPaths = paths;
    logger.info(`🤖 Discovered ${paths.length} navigation paths: ${paths.map(p => p.label).join(', ')}`);
    return paths;
  }

  // ─── Auto-Validate Form Fields ────────────────────────────────────────────
  async autoValidateForm() {
    const fields = await this.detectRequiredFields();
    const results = [];

    for (const field of fields) {
      try {
        const el = await this.driver.$(`//*[@hint="${field.hint}"]`);
        if (await el.isDisplayed()) {
          await el.clearValue();
          results.push({ field: field.hint, status: 'ready_for_validation' });
        }
      } catch (err) {
        results.push({ field: field.hint, status: 'not_found', error: err.message });
      }
    }

    logger.info(`🤖 Auto-validation setup: ${results.length} fields processed`);
    return results;
  }

  // ─── Get Summary Report ───────────────────────────────────────────────────
  getSummary() {
    const widgetCounts = {
      clickable:  this.widgetMap.clickable?.length || 0,
      textFields: this.widgetMap.textFields?.length || 0,
      buttons:    this.widgetMap.buttons?.length || 0,
    };
    return {
      widgetCounts,
      navPaths: this.navPaths,
      scenarios: this.generateTestScenarios(),
    };
  }
}

module.exports = AiExplorer;
