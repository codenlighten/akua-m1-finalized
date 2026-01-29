const test = require('node:test');
const assert = require('node:assert/strict');
const { canonicalize, canonicalJSON, hashObject } = require('../../src/canonicalize');

test('canonicalize sorts keys lexicographically', () => {
  const input = { b: 2, a: 1, c: 3 };
  const result = canonicalize(input);
  
  const keys = Object.keys(result);
  assert.deepEqual(keys, ['a', 'b', 'c']);
  assert.equal(result.a, 1);
  assert.equal(result.b, 2);
  assert.equal(result.c, 3);
});

test('canonicalize sorts nested object keys recursively', () => {
  const input = {
    b: 2,
    a: 1,
    nested: { z: 3, y: 2, x: 1 }
  };
  
  const result = canonicalize(input);
  assert.deepEqual(Object.keys(result), ['a', 'b', 'nested']);
  assert.deepEqual(Object.keys(result.nested), ['x', 'y', 'z']);
});

test('canonicalize preserves array order but canonicalizes elements', () => {
  const input = {
    arr: [{ b: 2, a: 1 }, { d: 4, c: 3 }, 5]
  };
  
  const result = canonicalize(input);
  assert.deepEqual(Object.keys(result.arr[0]), ['a', 'b']);
  assert.deepEqual(Object.keys(result.arr[1]), ['c', 'd']);
  assert.equal(result.arr[2], 5);
});

test('canonicalize handles null and undefined', () => {
  assert.equal(canonicalize(null), null);
  assert.equal(canonicalize(undefined), undefined);
  
  const input = { a: null, b: undefined, c: 1 };
  const result = canonicalize(input);
  assert.equal(result.a, null);
  assert.equal(result.b, undefined);
});

test('canonicalize handles primitives', () => {
  assert.equal(canonicalize(42), 42);
  assert.equal(canonicalize('string'), 'string');
  assert.equal(canonicalize(true), true);
  assert.equal(canonicalize(false), false);
});

test('canonicalJSON produces deterministic output', () => {
  const input1 = { b: 2, a: 1 };
  const input2 = { a: 1, b: 2 };
  
  const json1 = canonicalJSON(input1);
  const json2 = canonicalJSON(input2);
  
  assert.equal(json1, json2);
  assert.equal(json1, '{"a":1,"b":2}');
});

test('hashObject produces SHA-256 hash (64 hex chars)', () => {
  const input = { deviceId: 'TEST', value: 123 };
  const hash = hashObject(input);
  
  assert.equal(typeof hash, 'string');
  assert.equal(hash.length, 64);
  assert.match(hash, /^[0-9a-f]{64}$/);
});

test('hashObject is deterministic regardless of key order', () => {
  const input1 = { b: 2, a: 1, c: 3 };
  const input2 = { c: 3, a: 1, b: 2 };
  const input3 = { a: 1, b: 2, c: 3 };
  
  const hash1 = hashObject(input1);
  const hash2 = hashObject(input2);
  const hash3 = hashObject(input3);
  
  assert.equal(hash1, hash2);
  assert.equal(hash2, hash3);
});

test('hashObject matches known SHA-256 vector', () => {
  // For the canonical JSON: {"deviceId":"AKUA-TEST-001","tempC":22.4,"ts":"2026-01-28T00:00:00Z"}
  // Expected hash from our M1 acceptance test
  const input = {
    deviceId: 'AKUA-TEST-001',
    tempC: 22.4,
    ts: '2026-01-28T00:00:00Z'
  };
  
  const hash = hashObject(input);
  assert.equal(hash, '0952cb262572882a17ab8010251ba9079749648d08ff75b2e9d8bb1339add8c5');
});

test('hashObject handles nested structures', () => {
  const input1 = {
    device: { id: 'D1', type: 'sensor' },
    data: { temp: 20, humidity: 60 }
  };
  
  const input2 = {
    data: { humidity: 60, temp: 20 },
    device: { type: 'sensor', id: 'D1' }
  };
  
  const hash1 = hashObject(input1);
  const hash2 = hashObject(input2);
  
  assert.equal(hash1, hash2);
});
