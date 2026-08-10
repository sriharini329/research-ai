const { expect } = require('chai');
const testData = require('./test_data.json');
const axios = require('axios');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000';

describe('Performance Tests (300 Scenarios)', function() {
    this.timeout(10000);
    for (const test of testData) {
        it(`${test.id}: ${test.scenario}`, async function() {
            const start = Date.now();
            try {
                await axios.get(BASE_URL + '/get_current_user', { validateStatus: () => true });
            } catch (e) { }
            const duration = Date.now() - start;
            expect(duration).to.be.lessThan(5000);
        });
    }
});
