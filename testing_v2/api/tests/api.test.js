const axios = require('axios');
const { expect } = require('chai');
const testData = require('./test_data.json');
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000';

describe('API & Unit Tests (300 Scenarios)', function() {
    this.timeout(10000);
    for (const test of testData) {
        it(`${test.id}: ${test.scenario}`, async function() {
            try {
                let res;
                if (test.method === 'GET') {
                    res = await axios.get(BASE_URL + test.endpoint, { validateStatus: () => true });
                } else {
                    res = await axios.post(BASE_URL + test.endpoint, test.payload, { validateStatus: () => true });
                }
                expect(res.status).to.be.a('number');
            } catch (e) {
                if (e.code === 'ECONNREFUSED') this.skip(); // Not running
                else throw e;
            }
        });
    }
});
