# v2.0.0-m2 Release Checklist

**Release Date:** January 29, 2026  
**Tag:** v2.0.0-m2  
**Commit:** b46fc60

---

## ✅ Pre-Push Security Audit

### Secret Scanning
- [x] `.env` not tracked (only `.env.example`)
- [x] No private key material in repo
- [x] No WIF patterns in tracked files (except variable names)
- [x] Example secrets sanitized to obviously fake placeholders
  - `DEPLOYMENT.md`: `YOUR_PRIVATE_KEY_WIF_HERE`
  - `STATUS.md`: `YOUR_SECRET_TOKEN_CHANGE_ME`
- [x] No untracked sensitive files (`git status --porcelain` = clean)

### Auth Implementation Security
- [x] Timing-safe token comparison (prevents timing attacks)
- [x] All error paths return early (no bypass)
- [x] `/info` endpoint protected with auth
- [x] No token values in logs (only boolean flags)

### Code Quality
- [x] Config logging safe (explicit fields only)
- [x] `cached` field strict boolean
- [x] NODE_ENV=production (prevents stack traces)
- [x] Stub mode safety guard
- [x] All 16 tests passing

---

## 🚀 Push to GitHub

```bash
cd d:/Dev/Projects_Organize/dev/_organized/akua-finalized-m1

# Add remote (replace with your org/repo)
git remote add origin https://github.com/YOUR_ORG/akua-finalized-m1.git

# Push with tags
git push -u origin main --tags
```

---

## ✅ Post-Push Droplet Validation

### 1. Deploy Final Code
```bash
ssh root@143.198.43.229

cd /opt/akua-stack

# Option A: SCP from local
# scp akua-m2-final.tar.gz root@143.198.43.229:/opt/akua-stack/

# Option B: Git pull (if pushed to GitHub)
# git pull origin main
# git checkout v2.0.0-m2

# Rebuild services
docker compose up -d --build
```

### 2. Verify Version
```bash
curl -s -H "Authorization: Bearer $PUBLISHER_AUTH_TOKEN" \
  http://localhost:8081/info | jq .
```

**Expected output:**
```json
{
  "version": "2.0.0-m2",
  "network": "mainnet",
  "stubMode": true,
  "authEnabled": true,
  "rateLimitPerMin": 100,
  "maxFeeSats": 10000
}
```

### 3. Run Test Suite
```bash
bash scripts/run-m2.sh
```

**Expected output:**
```
✅ M2 test suite complete (16 tests passed)
```

### 4. Verify Startup Logs
```bash
docker compose logs publisher | grep -E "(config summary|WARNING|Stub mode|Production mode)"
```

**Expected log lines:**
- `Publisher config summary` with all config values
- `🔧 Stub mode ENABLED` (if TEST_PUBLISHER_STUB=1)
- `⚠️ WARNING` if stub mode on mainnet

### 5. Optional: HTTP Error Response Check
```bash
bash scripts/verify-http-responses.sh
```

**Expected:**
- ✅ HTTP 401 (no auth token)
- ✅ HTTP 400 (invalid sha256)
- ✅ HTTP 429 (rate limit)
- ✅ No stack traces in any error response

---

## 🎯 Production Flip (When Ready)

When AKUA greenlights production blockchain publishing:

```bash
cd /opt/akua-stack

# Follow the complete guide
cat docs/PRODUCTION_FLIP.md

# Quick version:
# 1. Check BSV balance (must have > 0.01 BSV)
# 2. Set TEST_PUBLISHER_STUB=0 in .env
# 3. Restart: docker compose restart publisher
# 4. Test with small publish
# 5. Verify txid on WhatsOnChain
```

---

## 📊 M2 Deliverables Summary

### Security
- Bearer token auth (PUBLISHER_AUTH_TOKEN)
- Timing-safe token comparison
- Rate limiting (100 req/min, configurable)
- NODE_ENV=production (no stack trace leaks)

### Cost Controls
- Fee caps (MAX_FEE_SATS=10000)
- UTXO floor warnings (MIN_BALANCE_SATS=1000000)

### Testing
- 16 automated tests (10 unit + 6 integration)
- Stub mode for mainnet-safe testing
- Stub mode safety guard

### Observability
- `/info` endpoint for config visibility
- `cached` flag for idempotency transparency
- Config summary logging (no secrets)

### Documentation
- CHANGELOG.md (release notes)
- PRODUCTION_FLIP.md (478-line transition guide)
- M2_VERIFICATION.md (489-line command reference)
- RECEIPT_SCHEMA.md (cached field semantics)
- TESTING.md (stub mode + test execution)

### Verification Scripts
- `scripts/run-m2.sh` - Full test suite runner
- `scripts/verify-http-responses.sh` - Error response checker
- `scripts/verify-env-consistency.sh` - Config validator

---

## 🔮 Future (M3 Suggestions)

1. **Redis-backed rate limiter** - Distributed rate limiting across replicas
2. **Low-funds alert** - Email/webhook when balance < threshold
3. **Prometheus metrics** - Publisher latency, error rate, queue depth
4. **Log aggregation** - ELK/Loki for centralized logging
5. **Postgres backups** - Automated daily snapshots

---

## 📝 Release Notes (for GitHub)

**Title:** Release v2.0.0-m2 - Production-Ready with Security & Testing

**Description:**

M2 brings production hardening with comprehensive security, cost controls, and operational tooling.

### Highlights
- **Safety:** Stub mode guard prevents accidental non-broadcast on mainnet
- **Ops:** Verification checklist (M2_VERIFICATION.md) + production flip runbook (PRODUCTION_FLIP.md)
- **Security:** Bearer auth with timing-safe comparison + rate limiting
- **Testing:** 16 automated tests with deterministic stub mode
- **Observability:** Cached flag for idempotency + /info endpoint

### Breaking Changes
None - backward compatible with M1

### Deployment
See `docs/PRODUCTION_FLIP.md` for step-by-step production transition guide.

### Testing
```bash
# In container (CI/CD path)
bash scripts/run-m2.sh

# Expected: ✅ 16 tests passed
```

### Configuration
All production hardening controlled via environment variables. See `docker-compose.yml` for full reference.

---

**Ready to push and validate.** 🚀
