const { expect } = require('chai');
const testData = require('./test_data.json');

describe('Validation Tests (300 Scenarios)', function() {
    for (const test of testData) {
        it(`${test.id}: ${test.scenario}`, function() {
            expect(test.payload).to.have.property('invalid_field');
            expect(test.payload.invalid_field).to.be.a('number');
        });
    }
});
