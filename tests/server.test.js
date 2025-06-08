const { before, after, test } = require('node:test');
const assert = require('node:assert');
const { once } = require('node:events');

let server;
let port;

before(async () => {
  process.env.PORT = 0;
  server = require('../server');
  await once(server, 'listening');
  port = server.address().port;
});

after(async () => {
  server.close();
});

async function fetchJSON(endpoint) {
  const res = await fetch(`http://localhost:${port}${endpoint}`);
  assert.strictEqual(res.status, 200);
  const data = await res.json();
  assert.ok(data);
}

test('GET /api/config returns JSON', async () => {
  await fetchJSON('/api/config');
});

test('GET /api/questions returns JSON', async () => {
  await fetchJSON('/api/questions');
});

test('GET /api/levels returns JSON', async () => {
  await fetchJSON('/api/levels');
});

test('GET /api/og returns an image', async () => {
  const res = await fetch(`http://localhost:${port}/api/og?title=test`);
  assert.strictEqual(res.status, 200);
  assert.strictEqual(res.headers.get('content-type'), 'image/png');
  const buf = await res.arrayBuffer();
  assert.ok(buf.byteLength > 0);
});
