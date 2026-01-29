const test = require('node:test');
const assert = require('node:assert/strict');

const RABBIT_HTTP = process.env.RABBIT_HTTP || 'http://localhost:15672';
const RABBIT_USER = process.env.RABBIT_USER || 'akua';
const RABBIT_PASS = process.env.RABBIT_PASS || 'akua_pass';
const VHOST = encodeURIComponent(process.env.RABBIT_VHOST || '/');

const IN_QUEUE = process.env.IN_QUEUE || 'iot.payload.in';
const OUT_QUEUE = process.env.OUT_QUEUE || 'iot.payload.out';

function basicAuthHeader(user, pass) {
  return `Basic ${Buffer.from(`${user}:${pass}`).toString('base64')}`;
}

async function publishToQueue(queue, payloadObj) {
  const url = `${RABBIT_HTTP}/api/exchanges/${VHOST}/amq.default/publish`;
  const body = {
    properties: { delivery_mode: 2 },
    routing_key: queue,
    payload: JSON.stringify(payloadObj),
    payload_encoding: 'string'
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: basicAuthHeader(RABBIT_USER, RABBIT_PASS),
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  const json = await res.json();
  assert.equal(json.routed, true, 'Message not routed to queue');
  return json;
}

async function getFromQueue(queue, count = 1) {
  const url = `${RABBIT_HTTP}/api/queues/${VHOST}/${queue}/get`;
  const body = {
    count,
    ackmode: 'ack_requeue_false',
    encoding: 'auto',
    truncate: 50000
  };

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      authorization: basicAuthHeader(RABBIT_USER, RABBIT_PASS),
      'content-type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  return res.json();
}

async function waitForReceipt(queue, timeoutMs = 10000) {
  const startTime = Date.now();
  const pollInterval = 500;
  
  while (Date.now() - startTime < timeoutMs) {
    const msgs = await getFromQueue(queue, 1);
    if (msgs.length > 0) {
      return JSON.parse(msgs[0].payload);
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }
  
  throw new Error(`No receipt received from ${queue} within ${timeoutMs}ms`);
}

async function drainQueue(queue, maxMessages = 100) {
  let drained = 0;
  
  for (let i = 0; i < maxMessages; i++) {
    const msgs = await getFromQueue(queue, 1);
    
    if (!msgs || msgs.length === 0) {
      break;
    }
    
    drained++;
  }
  
  return drained;
}

test('E2E: publish JSON -> receipt has original + sha256 + txid', async () => {
  await drainQueue(OUT_QUEUE); // Clean slate before test
  
  const input = {
    deviceId: `AKUA-TEST-E2E-${Date.now()}`, // Unique per test run
    tempC: 21.5,
    ts: new Date().toISOString()
  };

  await publishToQueue(IN_QUEUE, input);
  const receipt = await waitForReceipt(OUT_QUEUE);

  // Verify receipt structure
  assert.ok(receipt.original, 'Receipt missing original field');
  assert.ok(receipt.sha256, 'Receipt missing sha256 field');
  assert.ok(receipt.txid, 'Receipt missing txid field');
  
  // Verify sha256 format (64 hex chars)
  assert.equal(receipt.sha256.length, 64, 'SHA-256 hash should be 64 chars');
  assert.match(receipt.sha256, /^[0-9a-f]{64}$/, 'SHA-256 should be lowercase hex');
  
  // Verify txid format (64 hex chars)
  assert.equal(receipt.txid.length, 64, 'TXID should be 64 chars');
  assert.match(receipt.txid, /^[0-9a-f]{64}$/, 'TXID should be lowercase hex');
  
  // Verify original payload preserved
  assert.deepEqual(receipt.original, input, 'Original payload not preserved');
  
  // Verify publisher metadata
  assert.ok(receipt.publisher, 'Receipt missing publisher metadata');
  assert.equal(receipt.publisher.network, 'mainnet', 'Network should be mainnet');
  assert.ok(['broadcasted', 'confirmed'].includes(receipt.publisher.status));
  
  // Verify meta fields
  assert.ok(receipt.meta, 'Receipt missing meta field');
  assert.ok(receipt.meta.receivedAt, 'Receipt missing receivedAt timestamp');
});

test('E2E: canonical field matches deterministic JSON', async () => {
  await drainQueue(OUT_QUEUE);
  
  const input = {
    deviceId: `AKUA-TEST-CANON-${Date.now()}`,
    z: 3,
    a: 1,
    m: 2
  };

  await publishToQueue(IN_QUEUE, input);
  const receipt = await waitForReceipt(OUT_QUEUE);

  assert.ok(receipt.canonical, 'Receipt missing canonical field');
  
  // Canonical should have sorted keys
  const canonicalObj = JSON.parse(receipt.canonical);
  const keys = Object.keys(canonicalObj);
  // First 3 keys after sorting all fields
  assert.ok(keys.includes('a'), 'Key "a" missing from canonical');
  assert.ok(keys.includes('m'), 'Key "m" missing from canonical');
  assert.ok(keys.includes('z'), 'Key "z" missing from canonical');
  assert.ok(keys.indexOf('a') < keys.indexOf('m'), 'Keys not sorted');
  assert.ok(keys.indexOf('m') < keys.indexOf('z'), 'Keys not sorted');
});

test('E2E: receipt version field present', async () => {
  await drainQueue(OUT_QUEUE);
  
  const input = {
    deviceId: `AKUA-TEST-VERSION-${Date.now()}`
  };

  await publishToQueue(IN_QUEUE, input);
  const receipt = await waitForReceipt(OUT_QUEUE);

  assert.ok(receipt.version, 'Receipt missing version field');
  assert.equal(receipt.version, '1', 'Receipt version should be "1"');
});
