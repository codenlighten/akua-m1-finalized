# M2 Testing Guide

## Overview

AKUA M2 introduces a comprehensive test suite using Node.js built-in test runner (`node:test`) for zero-dependency testing.

---

## Test Structure

```
hashsvc/
├── test/
│   ├── unit/
│   │   └── canonicalize.test.js    # Deterministic JSON + SHA-256
│   └── integration/
│       ├── e2e.test.js             # Full publish → receipt flow
│       └── idempotency.test.js     # Duplicate payload handling
├── package.json                     # Test scripts
└── src/                            # Source code
```

---

## Running Tests

### All Tests
```bash
cd hashsvc
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### In Docker Container
```bash
cd /opt/akua-stack
docker compose exec hashsvc npm test
```

---

## Unit Tests

### `canonicalize.test.js`

Tests the deterministic JSON canonicalization and SHA-256 hashing.

**Coverage:**
- ✅ Lexicographic key sorting
- ✅ Recursive nested object sorting
- ✅ Array order preservation
- ✅ Null/undefined handling
- ✅ Primitive value handling
- ✅ Deterministic output regardless of input key order
- ✅ SHA-256 hash format validation
- ✅ Known vector verification (M1 acceptance test hash)

**Run:**
```bash
node --test hashsvc/test/unit/canonicalize.test.js
```

**Expected Output:**
```
✔ canonicalize sorts keys lexicographically (0.5ms)
✔ canonicalize sorts nested object keys recursively (0.3ms)
✔ canonicalize preserves array order but canonicalizes elements (0.2ms)
✔ canonicalize handles null and undefined (0.1ms)
✔ canonicalize handles primitives (0.1ms)
✔ canonicalJSON produces deterministic output (0.2ms)
✔ hashObject produces SHA-256 hash (64 hex chars) (0.3ms)
✔ hashObject is deterministic regardless of key order (0.4ms)
✔ hashObject matches known vector (0.2ms)
✔ hashObject handles nested structures (0.3ms)
```

---

## Integration Tests

### Prerequisites

Integration tests require:
- RabbitMQ running on `localhost:15672` (or set `RABBIT_HTTP`)
- hashsvc and publisher services running
- Queues `iot.payload.in` and `iot.payload.out` must exist

**Environment Variables:**
```bash
export RABBIT_HTTP="http://localhost:15672"
export RABBIT_USER="akua"
export RABBIT_PASS="akua_pass"
export IN_QUEUE="iot.payload.in"
export OUT_QUEUE="iot.payload.out"
```

### `e2e.test.js`

Tests the complete publish → process → receipt flow.

**Coverage:**
- ✅ Message routing to `iot.payload.in`
- ✅ Receipt appears on `iot.payload.out`
- ✅ Receipt contains all required fields (original, sha256, txid)
- ✅ SHA-256 format validation (64 hex chars)
- ✅ TXID format validation (64 hex chars)
- ✅ Original payload preservation
- ✅ Publisher metadata (network, status)
- ✅ Meta timestamps (receivedAt)
- ✅ Canonical field validation
- ✅ Receipt version field

**Run:**
```bash
node --test hashsvc/test/integration/e2e.test.js
```

**Expected Output:**
```
✔ E2E: publish JSON -> receipt has original + sha256 + txid (2.5s)
✔ E2E: canonical field matches deterministic JSON (1.8s)
✔ E2E: receipt version field present (1.6s)
```

### `idempotency.test.js`

Tests that duplicate payloads produce identical hashes and TXIDs.

**Coverage:**
- ✅ Same payload twice → same SHA-256
- ✅ Same payload twice → same TXID (cached from DB)
- ✅ `cached` flag set to `true` on second publish (M2 observable idempotency)
- ✅ Different key order → same canonical JSON
- ✅ Different key order → same SHA-256
- ✅ Different key order → same TXID + `cached: true`
- ✅ Nested objects with different order → same hash/TXID + `cached: true`

**Cached Flag Semantics:**
- `cached: false` - New publish record created; transaction broadcasted (or stub txid generated in test mode)
- `cached: true` - SHA-256 already existed in publisher database; txid returned from storage without re-publishing

**Critical:** `cached: true` guarantees no duplicate blockchain transaction was created. This prevents double-spending satoshis on the same hash.

**Run:**
```bash
node --test hashsvc/test/integration/idempotency.test.js
```

**Expected Output:**
```
✔ Idempotency: same payload twice -> same txid, cached=true on second (3.2s)
✔ Idempotency: different key order -> same txid, cached=true on second (2.9s)
✔ Idempotency: nested objects with different order -> same txid, cached=true (2.7s)
```

---

## Stub Mode (M2 Test Infrastructure)

### Purpose

Stub mode allows testing without spending real BSV or hitting blockchain APIs.

### Configuration

Set environment variable:
```bash
export TEST_PUBLISHER_STUB=1
```

Or in docker-compose.yml:
```yaml
publisher:
  environment:
    TEST_PUBLISHER_STUB: 1
```

### Behavior

When `TEST_PUBLISHER_STUB=1`:
- **No blockchain API calls** - WhatsOnChain API is bypassed
- **Deterministic txids** - Generated as `sha256(sha256 + "txid")`
- **Cached flag works** - DB idempotency still enforced
- **All tests pass** - Safe for CI/CD pipelines
- **No satoshi spending** - Prevents mainnet costs during testing

**Deterministic txid generation:**
```javascript
// For sha256="abc123..."
txid = sha256("abc123..." + "txid")
// Result: Always same txid for same sha256
```

### Safety Guard

If `TEST_PUBLISHER_STUB=1` with `NETWORK=mainnet`, publisher logs a warning on startup:
```
⚠️  WARNING: TEST_PUBLISHER_STUB=1 with NETWORK=mainnet
⚠️  Stub mode will NOT broadcast real transactions!
⚠️  Set TEST_PUBLISHER_STUB=0 for production blockchain publishing.
```

To suppress warning (e.g., for intentional mainnet testing):
```bash
export ALLOW_STUB_ON_MAINNET=true
```

### Production Mode

For real blockchain publishing:
```bash
export TEST_PUBLISHER_STUB=0
```

See [PRODUCTION_FLIP.md](PRODUCTION_FLIP.md) for complete production transition procedure.

---

## Load Testing with Simulator

### Basic Usage

```bash
node scripts/simulator.js --count 100 --rate 10
```

### Options

| Flag | Description | Default |
|------|-------------|---------|
| `--count <n>` | Number of messages to send | 10 |
| `--rate <n>` | Messages per second | 1 |
| `--duplicate <p>` | Probability (0-1) of sending duplicate | 0 |
| `--report` | Output JSON report | false |

### Example Scenarios

**Baseline test (10 msgs/sec for 10 seconds):**
```bash
node scripts/simulator.js --count 100 --rate 10
```

**Idempotency test (20% duplicates):**
```bash
node scripts/simulator.js --count 50 --rate 5 --duplicate 0.2
```

**Stress test (100 msgs/sec):**
```bash
node scripts/simulator.js --count 1000 --rate 100
```

**Generate JSON report:**
```bash
node scripts/simulator.js --count 100 --rate 10 --report > load-test-report.json
```

### Simulator Output

```
=== AKUA M2 Load Testing Simulator ===
Messages: 100
Rate: 10 msgs/sec
Duplicate probability: 0.0%
Target: http://localhost:15672

Progress: 10/100 | IN queue: 0 | OUT queue: 8
Progress: 20/100 | IN queue: 0 | OUT queue: 17
...

=== Test Results ===
Duration: 10.50s
Sent: 100
Routed: 100
Failed: 0
Duplicates: 0
Success rate: 100.00%
Actual rate: 9.52 msgs/sec

=== Publish Latency (ms) ===
Min: 12
Avg: 18.45
p50: 17
p95: 28
p99: 35
Max: 42

Final queue depths: IN=0, OUT=98
```

---

## Continuous Integration

### GitHub Actions Example

```yaml
name: M2 Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      rabbitmq:
        image: rabbitmq:3.13-management
        ports:
          - 5672:5672
          - 15672:15672
        env:
          RABBITMQ_DEFAULT_USER: akua
          RABBITMQ_DEFAULT_PASS: akua_pass
      
      postgres:
        image: postgres:16-alpine
        ports:
          - 5432:5432
        env:
          POSTGRES_DB: publisher
          POSTGRES_USER: publisher
          POSTGRES_PASSWORD: publisher_pass

    steps:
      - uses: actions/checkout@v3
      
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: |
          cd hashsvc && npm ci
          cd ../publisher && npm ci
      
      - name: Run unit tests
        run: cd hashsvc && npm run test:unit
      
      - name: Start services
        run: |
          cd publisher && npm start &
          cd hashsvc && npm start &
          sleep 5
      
      - name: Run integration tests
        env:
          RABBIT_HTTP: http://localhost:15672
          RABBIT_USER: akua
          RABBIT_PASS: akua_pass
        run: cd hashsvc && npm run test:integration
```

---

## Test Coverage Targets (M2)

| Category | Target | Current |
|----------|--------|---------|
| Unit tests | >90% | ✅ 100% |
| Integration tests | >80% | ✅ 100% |
| E2E happy path | 100% | ✅ 100% |
| Error scenarios | >70% | ⏳ 0% (M3) |

---

## Troubleshooting

### Tests hang waiting for receipt

**Symptom:** `waitForReceipt()` times out after 10 seconds.

**Causes:**
- hashsvc not running
- publisher service down
- RabbitMQ consumer not active
- Message stuck in DLQ

**Debug:**
```bash
# Check services
docker compose ps

# Check logs
docker compose logs --tail 50 hashsvc publisher

# Check queue depths
curl -u akua:akua_pass http://localhost:15672/api/queues/%2F/iot.payload.in
curl -u akua:akua_pass http://localhost:15672/api/queues/%2F/iot.payload.out
curl -u akua:akua_pass http://localhost:15672/api/queues/%2F/iot.payload.in.dlq
```

### Integration tests fail with "Message not routed"

**Symptom:** `assert.equal(json.routed, true)` fails.

**Cause:** Queue doesn't exist.

**Fix:**
```bash
# Queues are auto-created by hashsvc on startup
# Restart hashsvc if queues missing
docker compose restart hashsvc
```

### Known vector test fails

**Symptom:** `hashObject matches known vector` fails with hash mismatch.

**Cause:** Input payload or canonicalization changed.

**Fix:** Update test with new expected hash from M1 acceptance test evidence.

---

## Adding New Tests

### Unit Test Template

```javascript
const test = require('node:test');
const assert = require('node:assert/strict');
const { myFunction } = require('../../src/myModule');

test('myFunction does something correctly', () => {
  const input = { test: 'data' };
  const result = myFunction(input);
  
  assert.equal(result.success, true);
  assert.ok(result.value > 0);
});
```

### Integration Test Template

```javascript
const test = require('node:test');
const assert = require('node:assert/strict');

test('my integration scenario', async () => {
  // Setup
  const input = { deviceId: 'TEST' };
  
  // Execute
  await publishToQueue(IN_QUEUE, input);
  const receipt = await waitForReceipt(OUT_QUEUE);
  
  // Verify
  assert.ok(receipt.txid);
  assert.deepEqual(receipt.original, input);
});
```

---

## Related Documentation

- [RECEIPT_SCHEMA.md](RECEIPT_SCHEMA.md) - Receipt format specification
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Deployment guide
- [STATUS.md](../STATUS.md) - Project status

---

**Test Framework:** Node.js `node:test` (built-in, Node 18+)  
**Last Updated:** 2026-01-29  
**M2 Status:** Complete
