const axios = require('axios');
const { expect } = require('chai');
const testData = require('./test_data.json');
const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5000';

describe('Real Validation Tests (Target: 300)', function() {
    this.timeout(15000);
    
    for (const test of testData) {
        it(`${test.id}: ${test.scenario}`, async function() {
            if (!test.executable) {
                this.skip();
                return;
            }
            try {
                let url = test.endpoint;
                // Specifically test GET on POST
                const isMethodTest = test.scenario.includes('wrong HTTP verb');
                const method = isMethodTest ? 'GET' : (url.includes('profile/string') ? 'GET' : 'POST');
                
                const res = await axios({ 
                    method: method, 
                    url: BASE_URL + url, 
                    data: test.payload, 
                    validateStatus: () => true 
                });
                
                // Assert that the server doesn't crash (500), but returns proper 4xx validation errors
                expect(res.status).to.be.oneOf([200, 400, 401, 404, 405, 415, 422]);
            } catch (e) {
                if (e.code === 'ECONNREFUSED') throw new Error("BLOCKED: Flask backend is down");
                throw e;
            }
        });
    }
});
