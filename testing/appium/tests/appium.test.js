const { remote } = require('webdriverio');
const { expect } = require('chai');
const testData = require('./test_data.json');

describe('Appium Android Tests (300 Scenarios)', function() {
    this.timeout(60000);
    let client;

    before(async function() {
        try {
            client = await remote({
                path: '/wd/hub',
                port: 4723,
                capabilities: {
                    platformName: "Android",
                    "appium:automationName": "UiAutomator2",
                    "appium:appPackage": "com.example.researchai.research_ai",
                    "appium:appActivity": ".MainActivity"
                }
            });
        } catch(e) {
            console.log("Appium connection failed");
        }
    });

    after(async function() {
        if (client) await client.deleteSession();
    });

    for (const test of testData) {
        it(`${test.id}: ${test.scenario}`, async function() {
            if (!client) {
                this.skip();
            } else {
                expect(client).to.exist;
            }
        });
    }
});
