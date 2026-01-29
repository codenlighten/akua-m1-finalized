# AKUA M2 Stack - Operationally Hardened

**Status:** ✅ Production Ready (Stub Mode) | 🔒 All Security Layers Verified | 📊 Monitoring Active

---

## Quick Start

### Deploy to Droplet (from local machine)
```bash
ssh root@143.198.43.229
cd /opt/akua-stack
git pull --ff-only origin main
chmod +x scripts/check-balance.sh
docker compose up -d
bash scripts/run-m2.sh  # Verify tests pass
```

### Check Production Status
```bash
# Balance and UTXO health
bash scripts/check-balance.sh

# Service health
docker compose ps

# Recent operations log
journalctl -t akua-balance -n 20 --no-pager

# M2 test suite
bash scripts/run-m2.sh
```

### Flip to Production (when AKUA approves)
```bash
# Read the procedure first
less docs/PRODUCTION_FLIP_CHECKLIST.md

# Then follow all 15 steps in order
# Key: TEST_PUBLISHER_STUB=1 → TEST_PUBLISHER_STUB=0
```

---

## Key Documentation

| Document | Purpose |
|----------|---------|
| **[DEPLOYMENT_COMPLETE.md](DEPLOYMENT_COMPLETE.md)** | Executive summary of full deployment |
| **[docs/PRODUCTION_FLIP_CHECKLIST.md](docs/PRODUCTION_FLIP_CHECKLIST.md)** | 15-step operator procedure (required reading) |
| **[docs/PRODUCTION_OPS_REFERENCE.md](docs/PRODUCTION_OPS_REFERENCE.md)** | Quick reference for common tasks |
| **[docs/HARDENING_VALIDATION.md](docs/HARDENING_VALIDATION.md)** | Technical details of all hardening applied |
| **[STATUS.md](STATUS.md)** | Current deployment status (always updated) |

---

## Hardening Applied

✅ **Network:** All ports bound to 127.0.0.1 only (no public exposure)  
✅ **Firewall:** UFW enabled (default-deny, SSH-only exception)  
✅ **Auth:** Bearer token with timing-safe comparison  
✅ **Secrets:** .env (600 permissions, not tracked in git)  
✅ **Monitoring:** Balance check every 4 hours with alerts  
✅ **UTXO Tracking:** Fragmentation warnings at 50+, critical at 200+  
✅ **Configuration:** Validated on startup (fail-fast if missing/invalid)  
✅ **JSON Parsing:** Strict validation prevents data corruption  
✅ **Error Handling:** Exit codes (0=OK, 1=WARNING, 2=CRITICAL)  
✅ **Rollback:** Git tags enable instant recovery  

---

## Current State

- **Balance:** 2,824,359 sats (0.02824359 BSV)
- **Floor (Critical):** 1,000,000 sats
- **Warning:** 2,000,000 sats
- **Spendable:** 1,824,359 sats
- **Runway:** ~3,600 tx at 500 sats/fee
- **UTXOs:** 1 (excellent consolidation)
- **Services:** All healthy and running
- **Tests:** 16/16 passing
- **Mode:** Stub (TEST_PUBLISHER_STUB=1)
- **Ready:** Yes, waiting for business flip approval

---

## Monitoring

### View Balance History
```bash
journalctl -t akua-balance -n 50 --no-pager
```

### Check UTXO Count
```bash
ADDRESS=$(grep "^BSV_ADDRESS=" .env | cut -d'=' -f2)
curl -sS "https://api.whatsonchain.com/v1/bsv/main/address/$ADDRESS/unspent" | jq 'length'
```

### Run Tests
```bash
bash scripts/run-m2.sh
```

### Health Check
```bash
docker compose logs -f publisher | head -20
```

---

## Emergency Procedures

### Balance Critical (< 1M sats)
```bash
# Check what happened
journalctl -t akua-balance | tail -20

# If in production, flip back to stub mode immediately
sed -i 's/^TEST_PUBLISHER_STUB=0/TEST_PUBLISHER_STUB=1/' .env
docker compose restart publisher
```

### Service Not Responding
```bash
docker compose ps
docker compose logs publisher
docker compose restart publisher
```

### Database Issues
```bash
docker compose logs postgres
docker compose restart postgres
# Services reconnect automatically
```

---

## Configuration

All settings in `.env`:
```
BSV_ADDRESS=1JugrKhJgZ4yVyNnqPCxajbj9xYCHS1LNg
MIN_BALANCE_SATS=1000000          # Critical floor
LOW_BALANCE_SATS=2000000          # Warning threshold
UTXO_WARN_COUNT=50                # Fragmentation warning
UTXO_CRIT_COUNT=200               # Fragmentation critical
TEST_PUBLISHER_STUB=1             # 0=production, 1=stub
```

---

## Production Flip Readiness

✅ All M2 tests passing  
✅ Balance funded  
✅ Monitoring active  
✅ Services healthy  
✅ Security hardened  
✅ Procedures documented  
✅ Rollback capable  

**Not yet flipped because:** TEST_PUBLISHER_STUB still set to 1 (awaiting business go-signal)

---

## Support

1. Read [PRODUCTION_OPS_REFERENCE.md](docs/PRODUCTION_OPS_REFERENCE.md) for common tasks
2. Check service logs: `docker compose logs`
3. Run tests: `bash scripts/run-m2.sh`
4. Review procedures: `docs/PRODUCTION_FLIP_CHECKLIST.md`
5. Check git history: `git log --oneline -10`

---

**Repository:** https://github.com/codenlighten/akua-m1-finalized  
**Deployment:** 143.198.43.229  
**Last Updated:** January 29, 2026
