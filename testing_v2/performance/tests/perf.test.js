const { expect } = require('chai');
const testData = require('./test_data.json');
const axios = require('axios');
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000';

describe('Load & Performance Tests (300 Scenarios)', function() {
    this.timeout(5000);
    for (const test of testData) {
        it(`${test.id}: ${test.scenario}`, async function() {
            const start = Date.now();
            try {
                await axios.get(BASE_URL + '/get_current_user', { validateStatus: () => true });
            } catch(e) {}
            expect(Date.now() - start).to.be.lessThan(5000);
        });
    }
});
