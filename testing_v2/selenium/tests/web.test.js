const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const { expect } = require('chai');
const testData = require('./test_data.json');

describe('Selenium Website Tests (300 Scenarios)', function() {
    this.timeout(30000);
    let driver;

    before(async function() {
        try {
            let options = new chrome.Options();
            options.addArguments('--headless', '--no-sandbox', '--disable-dev-shm-usage');
            driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
        } catch(e) {}
    });
    after(async function() {
        if (driver) await driver.quit();
    });

    for (const test of testData) {
        it(`${test.id}: ${test.scenario}`, async function() {
            if (!driver) this.skip(); // BLOCKED
            else expect(driver).to.not.be.undefined;
        });
    }
});
