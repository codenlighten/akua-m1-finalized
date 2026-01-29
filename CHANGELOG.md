# Changelog

All notable changes to the AKUA Blockchain Integration project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [2.0.0-m2] - 2026-01-29

### Added - Security

- **Publisher bearer auth** - Optional `PUBLISHER_AUTH_TOKEN` env var for internal API protection
  - Auth middleware validates `Authorization: Bearer <token>` header
  - Returns 401/403 for unauthorized requests
  - Hashsvc automatically forwards token when configured
  - Auth status logged on startup (never logs actual token value)

### Added - Reliability

- **Rate limiting** - In-memory token bucket implementation
  - `RATE_LIMIT_PER_MIN` env var (default: 100 requests/min)
  - Returns 429 Too Many Requests when limit exceeded
  - Rate limits by IP or sha256 prefix for uniqueness
  - Note: Per-container instance; scales linearly with replica count

### Added - Cost Controls

- **Fee caps** - Transaction fee validation before broadcast
  - `MAX_FEE_SATS` env var (default: 10000 sats)
  - Rejects publishes if estimated fee exceeds cap
  - Prevents runaway costs from fee market spikes

- **UTXO floor warnings** - Balance monitoring
  - `MIN_BALANCE_SATS` env var (default: 1000000 = 0.01 BSV)
  - Console warnings when balance drops below threshold
  - Prevents operational surprise from fund exhaustion

### Added - Testing Infrastructure

- **Stub mode** - Deterministic test mode for safe CI/CD
  - `TEST_PUBLISHER_STUB=1` generates fake txids without blockchain API calls
  - Deterministic txid generation: `sha256(sha256 + "txid")`
  - Prevents spending real BSV during test runs
  - **Safety**: Stub mode guard prevents accidental non-broadcast on mainnet
  - Startup warning if stub mode active on mainnet (unless `ALLOW_STUB_ON_MAINNET=true`)

- **Test suite** - Comprehensive test coverage with node:test (zero external dependencies)
  - 10 unit tests (canonicalize.test.js) - deterministic hashing validation
  - 6 integration tests (e2e.test.js, idempotency.test.js) - full publish flow
  - Queue draining helpers prevent test interference
  - Unique deviceId per test run prevents collisions
  - All tests pass in <6 seconds

- **Simulator CLI** - Load testing tool (scripts/simulator.js)
  - `--count`, `--rate`, `--duplicate` flags for flexible testing
  - Latency histogram reporting
  - Duplicate detection testing
  
- **Ops**: Verification checklist included (docs/M2_VERIFICATION.md) + production flip runbook (docs/PRODUCTION_FLIP.md)

### Added - Observability

- **Cached flag in receipts** - Observable idempotency indicator
  - `publisher.cached: false` - New publish record created; transaction broadcasted
  - `publisher.cached: true` - SHA-256 already in DB; txid returned from cache
  - Eliminates timing-based idempotency assertions (flaky-free tests)
  - Guarantees no duplicate blockchain transactions

### Added - Documentation

- **Receipt schema specification** (docs/RECEIPT_SCHEMA.md)
  - Complete field definitions and semantics
  - Cached flag documentation
  - Verification workflow with code examples
  - 359 lines of comprehensive documentation

- **Testing guide** (docs/TESTING.md)
  - Unit and integration test execution
  - Stub mode usage
  - CI/CD integration examples
  - Troubleshooting guide

- **Production flip procedure** (docs/PRODUCTION_FLIP.md)
  - Step-by-step guide for switching from stub to production mode
  - Balance verification and monitoring
  - Rollback procedures
  - Troubleshooting common issues

- **M2 validation script** (scripts/validate-m2-deployment.sh)
  - Automated deployment validation
  - Auth and rate limit testing
  - Service health verification
  - Log analysis

- **.env.example** - Template with all M2 environment variables documented

### Changed

- **Dockerfile** - Removed `test/` from .dockerignore to include tests in image
- **docker-compose.yml** - Added M2 environment variable wiring for publisher and hashsvc
- **hashsvc/src/rabbitmq.js** - Receipt builder now includes `publisher.cached` field
- **hashsvc/src/publisher-client.js** - Automatically forwards `Authorization` header when `PUBLISHER_AUTH_TOKEN` set

### Fixed

- **Test flakiness** - Replaced timing-based assertions with cached flag checks
- **Test isolation** - Added queue draining before each integration test
- **Test collisions** - Unique deviceId with timestamp prevents parallel test interference

### Validation

- **All 16 tests passing** on droplet 143.198.43.229
- **Auth middleware validated** - 401 without token, 200 with token
- **Cached flag verified** - false on first publish, true on idempotent republish
- **Stub mode confirmed** - deterministic txids generated without WhatsOnChain API calls

### Performance

- **Unit tests:** 10/10 passed in 422ms
- **Integration tests:** 6/6 passed in 5179ms
- **Total test suite:** 16 tests in <6 seconds

### Breaking Changes

None. M2 is fully backward compatible with M1 receipts. The `cached` field is additive.

---

## [1.0.0-m1] - 2026-01-29

### Added - Core Functionality

- **Hash+Envelope Service** (hashsvc)
  - Consumes JSON payloads from RabbitMQ `iot.payload.in` queue
  - Canonical JSON transformation (deterministic key sorting)
  - SHA-256 hashing of canonical representation
  - Publishes hash to blockchain via publisher service
  - Generates receipt with original payload + hash + txid
  - Publishes receipt to `iot.payload.out` queue

- **Publisher Service**
  - POST `/publish` endpoint for hash submissions
  - Idempotent publishing (same hash → same txid from DB)
  - BSV mainnet integration via WhatsOnChain API
  - OP_RETURN format: `AKUA` prefix + SHA-256 hash
  - PostgreSQL audit log (publish_records table)
  - UTXO management and transaction building

### Added - Infrastructure

- **Docker Compose stack**
  - RabbitMQ 3.13-management (AMQP + management UI)
  - PostgreSQL 16-alpine (publisher audit log)
  - hashsvc container (Node 18)
  - publisher container (Node 18)
  - Health checks for all services
  - Persistent volumes for data

### Added - Canonicalization

- **Deterministic JSON transformation** (hashsvc/src/canonicalize.js)
  - Lexicographic key sorting (recursive)
  - Array order preservation
  - Null/undefined handling
  - No whitespace in output
  - UTF-8 encoding

### Validation

- **M1 Acceptance Tests** - All passing
  - Test 1: JSON → receipt with original + sha256 + txid ✅
  - Test 2: Canonical form verification ✅
  - Test 3: Idempotency (same payload → same txid) ✅

### Blockchain Evidence

- **First production transaction:** `8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a`
- **Block:** 933958 (confirmed, 1+ confirmations)
- **OP_RETURN verified:** `6a04414b5541` + hash (AKUA prefix present)
- **Network:** BSV mainnet
- **WhatsOnChain link:** https://whatsonchain.com/tx/8ae3c7cc76bf6d34d83337d9f56b6be85e2ed85ebd9d12667625eeaf5893415a

### Performance Metrics (M1)

- **First publish:** 1339ms (fetch UTXO + build tx + broadcast + DB insert)
- **Idempotent publish:** 45ms (DB lookup only)
- **RabbitMQ consumer:** Active, no backlog

### Deployment

- **Droplet:** 143.198.43.229 (harvest-db, Ubuntu 24.04.3 LTS)
- **Docker:** v29.2.0
- **Docker Compose:** v5.0.2
- **Deployment path:** `/opt/akua-stack/`

---

## [Unreleased]

### Planned for M3

- **Multi-device geotag schema**
- **AkuaGeoBox library implementation**
- **Scale testing** (1000+ messages/min)
- **CapRover deployment** (production PaaS)
- **Confirmation enrichment** (block height + hash in receipt)
- **Distributed rate limiting** (Redis-backed)

---

## Notes

- **M1 milestone:** Proven blockchain anchoring on BSV mainnet
- **M2 milestone:** Production-ready with security, reliability, and comprehensive testing
- **M3 milestone:** Multi-device support and production scale

**Contributors:** AI-assisted development with human oversight  
**License:** [Specify license]  
**Repository:** [GitHub URL to be added]
