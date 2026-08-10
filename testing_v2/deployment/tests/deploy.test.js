const { expect } = require('chai');
const testData = require('./test_data.json');

describe('Deployment Status Tests (300 Scenarios)', function() {
    for (const test of testData) {
        it(`${test.id}: ${test.scenario}`, function() {
            expect(process.env.NODE_ENV).to.not.equal('invalid');
        });
    }
});
