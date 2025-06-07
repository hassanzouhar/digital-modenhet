const assert = require('assert');

// Minimal DOM stubs so script.js can load in Node
function elementStub() {
  return {
    addEventListener: () => {},
    querySelector: () => elementStub(),
    appendChild: () => {},
    setAttribute: () => {},
    style: {},
    hidden: false,
    textContent: ''
  };
}

global.document = {
  getElementById: () => elementStub(),
  querySelector: () => elementStub(),
  addEventListener: () => {}
};

global.window = {}; // some scripts may check for window

const { evaluateMaturityProfileCondition } = require('../script.js');

const logic = { 'Datainnsamling_min_OR_Dataanalyse_min': 3.5 };

let scores = { Datainnsamling: 3.6, Dataanalyse: 2.0 };
assert.strictEqual(evaluateMaturityProfileCondition(logic, scores), true, 'Should match when first category qualifies');

scores = { Datainnsamling: 2.0, Dataanalyse: 3.6 };
assert.strictEqual(evaluateMaturityProfileCondition(logic, scores), true, 'Should match when second category qualifies');

scores = { Datainnsamling: 2.0, Dataanalyse: 3.0 };
assert.strictEqual(evaluateMaturityProfileCondition(logic, scores), false, 'Should fail when neither qualifies');

console.log('All OR logic tests passed');
