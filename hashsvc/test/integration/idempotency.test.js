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
  assert.equal(json.routed, true);
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

test('Idempotency: same payload twice -> same txid, cached=true on second', async () => {
  await drainQueue(OUT_QUEUE);
  
  const input = {
    deviceId: `AKUA-IDEM-${Date.now()}`, // Unique per test run
    value: Math.random(),
    ts: new Date().toISOString()
  };

  // First publish
  await publishToQueue(IN_QUEUE, input);
  const receipt1 = await waitForReceipt(OUT_QUEUE);

  // Second publish (identical payload)
  await publishToQueue(IN_QUEUE, input);
  const receipt2 = await waitForReceipt(OUT_QUEUE);

  // Both receipts should have same sha256
  assert.equal(receipt1.sha256, receipt2.sha256, 'SHA-256 hashes should match');
  
  // Both receipts should have same txid (idempotency)
  assert.equal(receipt1.txid, receipt2.txid, 'TXIDs should match (idempotent)');
  
  // Second receipt should indicate cached (idempotent lookup)
  assert.ok(receipt2.publisher, 'Receipt missing publisher metadata');
  assert.equal(receipt2.publisher.cached, true, 'Second publish should be cached');
  
  // Original should be preserved in both
  assert.deepEqual(receipt1.original, input);
  assert.deepEqual(receipt2.original, input);
});

test('Idempotency: different key order -> same txid, cached=true on second', async () => {
  await drainQueue(OUT_QUEUE);
  
  const timestamp = Date.now();
  const input1 = {
    deviceId: `AKUA-KEY-ORDER-${timestamp}`,
    c: 3,
    a: 1,
    b: 2
  };
  const input2 = {
    a: 1,
    b: 2,
    c: 3,
    deviceId: `AKUA-KEY-ORDER-${timestamp}`
  };

  // Publish first version
  await publishToQueue(IN_QUEUE, input1);
  const receipt1 = await waitForReceipt(OUT_QUEUE);

  // Publish second version (different key order, same values)
  await publishToQueue(IN_QUEUE, input2);
  const receipt2 = await waitForReceipt(OUT_QUEUE);

  // Canonical form should be identical
  assert.equal(receipt1.canonical, receipt2.canonical, 'Canonical JSON should match');
  
  // SHA-256 hashes should match
  assert.equal(receipt1.sha256, receipt2.sha256, 'SHA-256 hashes should match');
  
  // TXIDs should match (idempotent blockchain publish)
  assert.equal(receipt1.txid, receipt2.txid, 'TXIDs should match');
  
  // Second receipt should indicate cached
  assert.equal(receipt2.publisher.cached, true, 'Second publish should be cached');
});

test('Idempotency: nested objects with different order -> same txid, cached=true', async () => {
  await drainQueue(OUT_QUEUE);
  
  const timestamp = Date.now();
  const input1 = {
    deviceId: `AKUA-NESTED-${timestamp}`,
    device: { id: 'D1', type: 'sensor' },
    data: { temp: 20, humidity: 60 }
  };
  
  const input2 = {
    data: { humidity: 60, temp: 20 },
    device: { type: 'sensor', id: 'D1' },
    deviceId: `AKUA-NESTED-${timestamp}`
  };

  await publishToQueue(IN_QUEUE, input1);
  const receipt1 = await waitForReceipt(OUT_QUEUE);

  await publishToQueue(IN_QUEUE, input2);
  const receipt2 = await waitForReceipt(OUT_QUEUE);

  assert.equal(receipt1.sha256, receipt2.sha256);
  assert.equal(receipt1.txid, receipt2.txid);
  assert.equal(receipt2.publisher.cached, true, 'Nested object idempotency should be cached');
});
