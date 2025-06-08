const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('OG edge function file exists as api/og.js', () => {
  const ogPath = path.join(__dirname, '../api/og.js');
  assert.ok(fs.existsSync(ogPath), 'api/og.js should exist');
});
