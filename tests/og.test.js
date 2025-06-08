const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');

test('OG edge function file uses .mjs extension for ESM', () => {
  const ogPath = path.join(__dirname, '../api/og.mjs');
  assert.ok(fs.existsSync(ogPath), 'api/og.mjs should exist');
});
