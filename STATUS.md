# AKUA Blockchain Integration - Deployment Status

**Last Updated:** January 29, 2026 (17:20 UTC)  
**Current Milestone:** M2 - Test Suite & Production Hardening ✅ **COMPLETE - Operationally Hardened**  
**Deployment Status:** 🔒 **Secured & Validated** | ⏸️ **Stub Mode Active** | 🚀 **Ready to Flip** | ✅ **Monitoring Active**

---

## Droplet Information
- **Droplet IP:** 143.198.43.229
- **Hostname:** harvest-db
- **OS:** Ubuntu 24.04.3 LTS (GNU/Linux 6.8.0-71-generic x86_64)
- **Region:** [TBD - check DO console]
- **SSH user:** root
- **Date started:** January 28, 2026

---

## Infrastructure Setup

### System Requirements
- [x] Docker installed and running (v29.2.0)
- [x] Docker Compose available (v5.0.2)
- [x] Firewall configured
  - [x] Port 22 (SSH) - open to public
  - [x] UFW enabled with default-deny incoming
  - [x] All service ports (8080, 8081, 5672, 15672) bound to 127.0.0.1 only
  - [x] Services accessible only via SSH tunnel or localhost
- [ ] DNS configured (if using domains) - not required for M1
- [ ] System restart applied (pending kernel upgrade 6.8.0-71→6.8.0-90) - non-blocking

### Directory Structure
- [x] `/opt/akua-stack/` created
- [x] `/opt/akua-stack/docker-compose.yml` deployed
- [x] `/opt/akua-stack/hashsvc/` created with source files
- [x] `/opt/akua-stack/publisher/` created with source files
- [x] `/opt/akua-stack/scripts/` created with operational tools
- [x] `/opt/akua-stack/docs/` created with procedures
- [x] Git provenance restored (tag: v2.0.0-m2-deployed)
- [x] `.env` secured (600 permissions, not tracked in git)

### Operational Tools
- [x] **Balance monitoring:** `scripts/check-balance.sh` (cron: every 4 hours)
  - [x] Hardened config validation (fail-fast on missing/invalid .env)
  - [x] Two-threshold alerting: `LOW_BALANCE_SATS=2000000` (warning), `MIN_BALANCE_SATS=1000000` (critical)
  - [x] JSON parsing strictness: validates WOC response before extraction
  - [x] jq-based parsing (robust, portable)
  - [x] Syslog integration: `journalctl -t akua-balance` (exit codes: 0=OK, 1=WARNING, 2=CRITICAL)
  - [x] UTXO fragmentation monitoring: warns at 50+ outputs, critical at 200+
  - [x] Cron-safe execution: absolute paths, explicit PATH, fail-fast design
  - [x] **Current status:** Balance 2,824,359 sats (1 UTXO, healthy)
- [x] **Production flip checklist:** `docs/PRODUCTION_FLIP_CHECKLIST.md`
  - [x] 15-step operator procedure with validation
  - [x] OP_RETURN format verification (AKUA prefix + hash)
  - [x] Balance delta checks
  - [x] Rollback procedures
  - [x] Sign-off section for audit trail
- [x] **Operations reference:** `docs/PRODUCTION_OPS_REFERENCE.md`
  - [x] Common operational tasks (balance check, UTXO monitoring, service health)
  - [x] Emergency procedures (service restart, database issues, balance critical)
  - [x] Testing & verification commands
  - [x] SSH tunnel access for web UIs

---

## Services Status

### RabbitMQ (3.13-management)
- [x] Container running (healthy)
- [x] Management UI bound to 127.0.0.1:15672 (SSH tunnel required)
- [x] Custom credentials (user: akua)
- [x] Default guest user removed (security hardening)
- [x] Queues created (auto-declared by hashsvc):
  - [x] `iot.payload.in` (durable, 1 consumer)
  - [x] `iot.payload.out` (durable)
  - [x] `iot.payload.in.dlq` (durable, dead letter queue)
- [x] Volume mounted (`rabbitmq_data`)

### PostgreSQL (publisher audit log)
- [x] Container running (healthy, ready for connections)
- [x] Database `publisher` created and initialized
- [x] Publisher service connected successfully
- [x] Volume mounted (`pg_data`)

### Hash+Envelope Service (M1 Core)
- [x] Container built successfully (@smartledger/bsv 3.4.0)
- [x] Container running (healthy, port 8080)
- [x] Health check: `http://localhost:8080/healthz` returns OK
- [x] Environment variables configured:
  - [x] RABBIT_URL (amqp://akua:akua_pass@rabbitmq:5672)
  - [x] IN_QUEUE (iot.payload.in)
  - [x] OUT_QUEUE (iot.payload.out)
  - [x] PUBLISHER_URL (http://publisher:8080/publish)
  - [x] MAX_ATTEMPTS=5
- [x] Consumes from `iot.payload.in` successfully
- [x] Produces receipts to `iot.payload.out` with all required fields
- [x] Logs clean and structured (pino logging)

### Publisher Service
- [x] Container built successfully (@smartledger/bsv 3.4.0)
- [x] Container running (healthy, port 8081)
- [x] Health check: `http://localhost:8081/healthz` returns OK
- [x] POST `/publish` endpoint functional
- [x] Returns valid txid for hash submissions
- [x] Idempotency working (same sha256 → cached txid from DB)
- [x] Connected to BSV mainnet via WhatsOnChain API
- [x] Database connection established (PostgreSQL publish_records table)

---

## M1 Acceptance Tests ✅ **PASSED**

### Core Functionality
- [x] **Test 1:** Send JSON to `iot.payload.in` ✅ PASSED
  - [x] Receipt appears on `iot.payload.out`
  - [x] Receipt contains `original` payload
  - [x] Receipt contains valid `sha256` hash (0952cb262572882a17ab8010251ba9079749648d08ff75b2e9d8bb1339add8c5)
  - [x] Receipt contains blockchain `txid` (8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a)
  - [x] TXID verified on BSV mainnet via WhatsOnChain
  - [x] OP_RETURN contains "AKUA" prefix + hash (69 bytes total)
  
- [x] **Test 2:** Canonicalization verification ✅ PASSED
  - [x] Input: `{"deviceId":"AKUA-TEST-001","tempC":22.4,"ts":"2026-01-28T00:00:00Z"}`
  - [x] Canonical output preserves key order deterministically
  - [x] SHA-256 hash is reproducible
  
- [x] **Test 3:** Idempotency ✅ PASSED
  - [x] Same message published twice
  - [x] Second publish returned cached txid (45ms vs 1339ms)
  - [x] No duplicate blockchain transactions
  - [x] Log shows: "Hash already published (idempotent)"

### Blockchain Verification
- [x] Transaction 8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a **CONFIRMED** on BSV mainnet
- [x] Confirmations: 1
- [x] Block: 933958 (hash: 000000000000000021fc88bb9989190ad028e41f73502364e8bedf6af4954c19)
- [x] Output[0]: OP_RETURN (nulldata, 0 sats)
  - Hex: `6a04414b5541200952cb262572882a17ab8010251ba9079749648d08ff75b2e9d8bb1339add8c5`
  - ASM: `OP_RETURN 1096108865 0952cb262572882a17ab8010251ba9079749648d08ff75b2e9d8bb1339add8c5`
  - Format: OP_RETURN (0x6a) + PUSHDATA 4 bytes (0x04) + "AKUA" (0x414b5541) + PUSHDATA 32 bytes (0x20) + SHA-256 hash
- [x] Output[1]: Change to 1JugrKhJgZ4yVyNnqPCxajbj9xYCHS1LNg (0.02824359 BSV)
- [x] Transaction size: 240 bytes
- [x] View on WhatsOnChain: https://whatsonchain.com/tx/8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a

### Performance Metrics
- First publish: 1339ms (fetch UTXO + build tx + broadcast + DB insert)
- Idempotent publish: 45ms (DB lookup only)
- RabbitMQ consumer: Active, no backlog
- All health checks: Passing

- [ ] **Test 4:** Invalid message handling
  - [ ] Invalid JSON → DLQ immediately
  - [ ] Non-object payload → DLQ immediately

### Performance Baseline (M2 prep)
- [ ] Single message latency measured (ms)
- [ ] Throughput baseline established (msgs/sec)
- [ ] Resource usage monitored (CPU/memory)

---

## M1 Acceptance Evidence

**Test Execution Date:** 2026-01-29 03:27:04 UTC  
**Test Environment:** 143.198.43.229 (harvest-db droplet)  
**Test Operator:** Automated via RabbitMQ Management API

### Input Message
```json
{
  "deviceId": "AKUA-TEST-001",
  "tempC": 22.4,
  "ts": "2026-01-28T00:00:00Z"
}
```

### Output Receipt (from iot.payload.out)
```json
{
  "version": "1",
  "original": {
    "deviceId": "AKUA-TEST-001",
    "tempC": 22.4,
    "ts": "2026-01-28T00:00:00Z"
  },
  "canonical": "{\"deviceId\":\"AKUA-TEST-001\",\"tempC\":22.4,\"ts\":\"2026-01-28T00:00:00Z\"}",
  "sha256": "0952cb262572882a17ab8010251ba9079749648d08ff75b2e9d8bb1339add8c5",
  "txid": "8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a",
  "publisher": {
    "network": "mainnet",
    "status": "broadcasted"
  },
  "meta": {
    "sourceId": null,
    "receivedAt": "2026-01-29T03:27:04.714Z",
    "correlationId": null,
    "messageId": null,
    "schema": null
  }
}
```

### Blockchain Verification
- **TXID:** 8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a
- **Block:** 933958 (1 confirmation)
- **Blockhash:** 000000000000000021fc88bb9989190ad028e41f73502364e8bedf6af4954c19
- **OP_RETURN Payload:** `6a04414b5541200952cb262572882a17ab8010251ba9079749648d08ff75b2e9d8bb1339add8c5`
- **WhatsOnChain Link:** https://whatsonchain.com/tx/8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a

### Verification Commands
```bash
# Check transaction confirmation
curl -s "https://api.whatsonchain.com/v1/bsv/main/tx/hash/8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a" | jq '{confirmations, blockhash, blockheight}'

# Verify OP_RETURN format
curl -s "https://api.whatsonchain.com/v1/bsv/main/tx/hash/8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a" | jq '.vout[] | select(.scriptPubKey.type=="nulldata") | .scriptPubKey.hex'
```

### Test Procedure Reference
See [DEPLOYMENT.md](DEPLOYMENT.md) Step 9: M1 Acceptance Testing

---

## M1 Deliverables Checklist

- [x] Docker container for Hash+Envelope service built
- [x] Service listens to RabbitMQ for JSON payloads ✓ (per spec)
- [x] Service hashes JSON using SHA-256 ✓ (per spec)
- [x] Service publishes hash to blockchain API ✓ (per spec)
- [x] Service returns {original, sha256, txid} ✓ (per spec)
- [x] Service publishes result to RabbitMQ ✓ (per spec)
- [x] Basic error handling implemented (retry logic, DLQ)
- [x] Container deployed to test environment (harvest-db)
- [x] End-to-end test passed

---

## Production Hardening Recommendations (Pre-M2)

### Security
- [x] `.env` file secured (chmod 600, not in images, .gitignore)
- [x] Private keys redacted in logs
- [ ] **Add auth on publisher endpoint** - Internal bearer token for hashsvc→publisher
- [ ] **Add IP whitelist** - Only allow hashsvc container to hit publisher

### Operational Safety
- [ ] **Publisher rate limiting** - Token bucket (e.g., max 100 publishes/min) to prevent UTXO drain
- [ ] **Fee validation** - Reject if estimated fee > max threshold (e.g., 10000 sats)
- [ ] **UTXO floor monitoring** - Alert/stop if balance < threshold (e.g., 0.01 BSV)
- [ ] **Transaction size limits** - Reject OP_RETURN payload > 100KB (WhatsOnChain relay limit)

### Observability
- [ ] **Prometheus metrics** - Expose publish latency, error rate, queue depth
- [ ] **Alerting** - PagerDuty/Slack on DLQ growth or publisher failures
- [ ] **Log aggregation** - Consider ELK stack or Grafana Loki for structured logs

### Backup & Recovery
- [ ] **Postgres backups** - Daily snapshots of publish_records table
- [ ] **UTXO cache backup** - Periodic export of scripts/utxos.json
- [ ] **Configuration backup** - Version-controlled .env template (without secrets)

---

## M2 Test Suite & Hardening 🚧 **IN PROGRESS**

**Test Framework:** Node.js built-in test runner (`node:test`) - zero external dependencies

### Test Suite Status

- [x] **Unit Tests** (`hashsvc/test/unit/`)
  - [x] canonicalize.test.js - 10 tests for deterministic hashing
  
- [x] **Integration Tests** (`hashsvc/test/integration/`)
  - [x] e2e.test.js - 3 tests for end-to-end publish → receipt flow
  - [x] idempotency.test.js - 3 tests for duplicate handling + cached flag
  
- [x] **Simulator CLI** (`scripts/simulator.js`)
  - [x] Load testing with --count, --rate, --duplicate flags
  - [x] Latency histogram and duplicate detection
  
- [x] **Documentation**
  - [x] docs/RECEIPT_SCHEMA.md - Complete receipt format specification
  - [x] docs/TESTING.md - Test execution guide

### Test Infrastructure Features

- [x] **TEST_PUBLISHER_STUB=1 mode**
  - Generates deterministic fake txids: sha256(sha256 + "txid")
  - Returns cached: false for new publishes
  - Returns cached: true for idempotent lookups
  - Prevents spending real BSV during tests
  
- [x] **Queue Management**
  - drainQueue() helper before each test
  - Unique deviceId per test run (timestamp-based)
  - Prevents test interference and collisions
  
- [x] **Observable Idempotency**
  - receipt.publisher.cached flag for assertions
  - No timing-based checks (flaky-free)
  - Validates DB cache lookup vs blockchain publish
  
- [x] **Single Command Runner**
  - scripts/run-m2.sh - Runs all tests + simulator
  - Suitable for CI/CD pipelines

### Production Hardening Status

- [x] **Authentication** (publisher/src/index.js)
  - [x] PUBLISHER_AUTH_TOKEN env var (optional)
  - [x] Bearer token validation middleware
  - [x] 401 Unauthorized / 403 Forbidden responses
  
- [x] **Rate Limiting** (publisher/src/index.js)
  - [x] In-memory token bucket implementation
  - [x] RATE_LIMIT_PER_MIN env var (default: 100)
  - [x] 429 Too Many Requests response
  - [x] Rate limit by IP or sha256 prefix
  - [x] **Scaling Note:** Current implementation is per-container instance. If publisher is scaled to N replicas, effective rate limit becomes N × RATE_LIMIT_PER_MIN. For distributed rate limiting across replicas, migrate limiter state to Redis.
  
- [x] **Fee Controls** (publisher/src/blockchain.js)
  - [x] MAX_FEE_SATS env var (default: 10000)
  - [x] Fee validation before broadcast
  - [x] Rejects transactions exceeding fee cap
  
- [x] **UTXO Floor Monitoring** (publisher/src/blockchain.js)
  - [x] MIN_BALANCE_SATS env var (default: 1000000 = 0.01 BSV)
  - [x] Console warnings when balance low
  - [x] Prevents operational surprise

### M2 Phase 1 Deliverables ✅ **COMPLETE (Code)**

- [x] Test suite with 16 automated tests (10 unit + 6 integration)
- [x] Stub mode for mainnet-safe testing
- [x] Queue draining and unique test IDs
- [x] Cached flag assertions (timing-independent)
- [x] Auth middleware with Bearer token
- [x] Rate limiting with configurable threshold
- [x] Fee caps and balance warnings
- [x] Single-command test runner (run-m2.sh)

### M2 Phase 2 Pending

- [x] **Deploy to harvest-db droplet** ✅ COMPLETE
  - [x] SCP updated files (blockchain.js, index.js, rabbitmq.js, test files)
  - [x] Set TEST_PUBLISHER_STUB=1 in .env
  - [x] Fixed .dockerignore to include test/ directory
  - [x] Rebuilt services with --no-cache
  
- [x] **Validation Testing** ✅ COMPLETE
  - [x] All 16 tests pass (10 unit + 6 integration)
  - [x] Auth middleware blocks requests without token (401)
  - [x] Auth middleware accepts valid token (200 + txid)
  - [x] Stub mode generates deterministic txids
  - [x] Cached flag correctly set (false for new, true for idempotent)
  
- [ ] **Documentation Updates**
  - [x] Updated RECEIPT_SCHEMA.md with cached field semantics
  - [x] Updated TESTING.md with stub mode and cached flag coverage
  - [x] Created PRODUCTION_FLIP.md (478-line production transition guide)
  - [x] Created M2_VERIFICATION.md (489-line verification command reference)
  - [x] Created CHANGELOG.md (v2.0.0-m2 release notes)
  - [x] Added /info endpoint for configuration visibility
  - [x] Added stub mode safety guard with startup warnings
  - [x] Verified no sensitive data leaks in logs or API responses
  - [x] Added NODE_ENV=production to prevent stack trace leaks
  - [x] Made cached field a strict boolean
  - [x] Added config summary logging with redaction
  
- [ ] **GitHub Push**
  - [ ] Commit all M2 changes
  - [ ] Push to repository
  - [ ] Tag release: v2.0.0-m2

---

## M2 Phase 2 Evidence ✅ **VALIDATED**

**Validation Date:** 2026-01-29 04:02 UTC  
**Validation Environment:** 143.198.43.229 (harvest-db droplet)  
**Validation Operator:** Automated M2 test suite + manual auth validation

### Service Status
```
NAME                     IMAGE                      STATUS
akua-stack-hashsvc-1     akua-stack-hashsvc         healthy
akua-stack-postgres-1    postgres:16-alpine         healthy
akua-stack-publisher-1   akua-stack-publisher       healthy
akua-stack-rabbitmq-1    rabbitmq:3.13-management   healthy
```

### Test Suite Results

**Unit Tests (hashsvc/test/unit/canonicalize.test.js):**
```
✓ canonicalize sorts keys lexicographically
✓ canonicalize sorts nested object keys recursively
✓ canonicalize preserves array order but canonicalizes elements
✓ canonicalize handles null and undefined
✓ canonicalize handles primitives
✓ canonicalJSON produces deterministic output
✓ hashObject produces SHA-256 hash (64 hex chars)
✓ hashObject is deterministic regardless of key order
✓ hashObject matches known SHA-256 vector
✓ hashObject handles nested structures

10/10 tests passed (duration: 422ms)
```

**Integration Tests (hashsvc/test/integration/*.test.js):**
```
✓ E2E: publish JSON -> receipt has original + sha256 + txid
✓ E2E: canonical field matches deterministic JSON
✓ E2E: receipt version field present
✓ Idempotency: same payload twice -> same txid, cached=true on second
✓ Idempotency: different key order -> same txid, cached=true on second
✓ Idempotency: nested objects with different order -> same txid, cached=true

6/6 tests passed (duration: 5179ms)
```

**Total: 16/16 tests passed** ✅

### Auth Middleware Validation

**Test 1: No token (should fail)**
```bash
curl -X POST http://localhost:8081/publish \
  -H "Content-Type: application/json" \
  -d '{"sha256":"0000...0999"}'

Response: HTTP 401
{
  "error": "Unauthorized",
  "message": "Missing or invalid authorization header"
}
```
✅ Auth protection working

**Test 2: Valid token (should succeed)**
```bash
curl -X POST http://localhost:8081/publish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN_HERE" \
  -d '{"sha256":"0000...0888"}'

Response: HTTP 200
{
  "sha256": "0000000000000000000000000000000000000000000000000000000000000888",
  "txid": "57aa199681196d8660554b23af980219cc0cfce551448c30df8d7d468313c2f2",
  "status": "broadcasted",
  "publishedAt": "2026-01-29T04:02:25.594Z",
  "network": "mainnet",
  "cached": false
}
```
✅ Auth with token working  
✅ Cached flag present in response  
✅ Stub mode generating deterministic txid

### Environment Configuration

```bash
# BSV Blockchain
BSV_ADDRESS=1JugrKhJgZ4yVyNnqPCxajbj9xYCHS1LNg
BSV_PRIVATE_KEY=[redacted]
BSV_NETWORK=mainnet

# M2 Security
PUBLISHER_AUTH_TOKEN=YOUR_SECRET_TOKEN_CHANGE_ME
RATE_LIMIT_PER_MIN=100
MAX_FEE_SATS=10000
MIN_BALANCE_SATS=1000000

# M2 Test Mode
TEST_PUBLISHER_STUB=1

# RabbitMQ Management API
RABBIT_HTTP=http://rabbitmq:15672
RABBIT_USER=akua
RABBIT_PASS=akua_pass
RABBIT_VHOST=/
```

### Build Information

- **Rebuild**: Full --no-cache rebuild to ensure no stale layers
- **Docker Compose Version**: 5.0.2
- **Node Version**: 18.20.8 (in containers)
- **Test Framework**: Node.js built-in `node:test` (zero external dependencies)

### Key Fixes Applied

1. **Fixed .dockerignore** - Removed `test/` exclusion to allow tests in image
2. **Added cached flag to receipt** - Modified `hashsvc/src/rabbitmq.js` to include `publisher.cached`
3. **Auth header forwarding** - Modified `hashsvc/src/publisher-client.js` to send Authorization header
4. **Environment variable wiring** - Added all M2 vars to `docker-compose.yml`

### Validation Procedure

1. ✅ Stopped all services (`docker compose down`)
2. ✅ Rebuilt with `--no-cache` flag (publisher + hashsvc)
3. ✅ Started services and waited for healthy status
4. ✅ Ran `bash scripts/run-m2.sh` - all 16 tests passed
5. ✅ Manually tested auth without token - received 401
6. ✅ Manually tested auth with token - received 200 + deterministic txid
7. ✅ Verified `cached: false` in response (stub mode, new publish)

---

## M2 Preparation (Simulation & Testing) ✅ **COMPLETE**

**Test Framework:** Node.js built-in test runner (`node:test`) - zero external dependencies

### Delivered Artifacts
- [x] **Simulator CLI** (`scripts/simulator.js`)
  - Publishes N synthetic messages with varied payloads
  - Tests idempotency (duplicate payloads)
  - Generates latency histograms and error reports
  
- [x] **Unit Tests** (`hashsvc/test/unit/`)
  - Canonicalization determinism (`canonicalize.test.js`)
  - SHA-256 golden vectors (embedded in tests)
  - Key sorting and nested object handling
  
- [ ] **Integration Tests** (`test/integration/`)
  - End-to-end: publish → receipt with txid (`e2e.test.js`)
  - Idempotency: duplicate payload → same txid (`idempotency.test.js`)
  - Retry logic: transient failures → eventual success (`retry.test.js`)
  - DLQ routing: max retries exceeded → DLQ (`dlq.test.js`)

- [ ] **Performance Baselines**
  - Average publish latency (target: <2s)
  - p95 publish latency (target: <5s)
  - Error rate (target: <0.1%)
  - Queue depth under load (target: <100 messages)

---

## Final Pre-Tag Checklist (v2.0.0-m2)

**Completed:** January 29, 2026 04:30 UTC

### Code Quality
- [x] Stub mode safety guard prevents accidental mainnet stub usage
- [x] Config summary logged on startup with redaction (no DB URL, no token)
- [x] `cached` field is strict boolean (Boolean() coercion)
- [x] NODE_ENV=production set in compose (prevents stack trace leaks)
- [x] /info endpoint provides configuration visibility
- [x] No sensitive data in logs or API responses (verified)
- [x] Auth forwarding verified in all code paths

### HTTP Error Responses
- [x] 401 Unauthorized - no stack trace (auth missing)
- [x] 400 Bad Request - no stack trace (validation error)
- [x] 429 Too Many Requests - no stack trace (rate limit)
- [x] Verification script created (scripts/verify-http-responses.sh)

### Environment Consistency
- [x] Both services use PUBLISHER_AUTH_TOKEN
- [x] Verification script created (scripts/verify-env-consistency.sh)
- [x] Compose env vars documented in docker-compose.yml

### Test Suite
- [x] Tests run inside container (run-m2.sh)
- [x] Simulator runs from host (documented in TESTING.md)
- [x] All 16 tests passing on droplet

### Documentation
- [x] Safety notes in CHANGELOG.md
- [x] Ops runbooks complete (M2_VERIFICATION.md, PRODUCTION_FLIP.md)
- [x] Cached semantics explicit in 2 docs
- [x] Rate limiter scaling note in STATUS.md

### Release Readiness
- [x] Version bumped to 2.0.0-m2
- [x] CHANGELOG.md complete with safety/ops highlights
- [x] All M2 code deployed and validated on droplet
- [ ] Git commit pending
- [ ] GitHub push pending
- [ ] Tag v2.0.0-m2 pending

---

## Known Issues / Blockers

**None currently identified for M1**

**M2 Considerations:**
- Need to define geotag JSON schema for multi-device support
- AkuaGeoBox integration requires library implementation (referenced in scripts but not yet built)

---

## Next Actions

### Immediate (M1 Complete)
1. [x] Run system audit on harvest-db droplet
2. [x] Install Docker + Docker Compose
3. [x] Deploy docker-compose.yml stack
4. [x] Verify all containers running healthy
5. [x] Execute M1 acceptance tests
6. [x] Verify blockchain transaction confirmed

### Short-term (M2 Entry)
1. [ ] Push codebase to GitHub repository
2. [ ] Implement production hardening (auth, rate limits, fee guards)
3. [ ] Write simulator CLI for load testing
4. [ ] Write unit + integration test suite (node:test)
5. [ ] Document API endpoints for client integration
6. [ ] Establish performance baselines

### Medium-term (M3 Planning)
1. [ ] Design multi-device geotag schema
2. [ ] Implement AkuaGeoBox library
3. [ ] Scale testing (1000+ messages/min)
4. [ ] Consider CapRover for production deployment

---

## Notes

- [x] System restart recommended (kernel upgrade 6.8.0-71→6.8.0-90) - **non-blocking for M1**
- [x] RabbitMQ management UI accessible at http://143.198.43.229:15672 - **restrict to VPN in production**
- Transaction 8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a is first production publish to BSV mainnet
- All M1 SOW requirements satisfied per acceptance test evidence above
