# Production Flip Day Checklist

**Date:** _____________  
**Operator:** _____________  
**Version:** v2.0.0-m2

---

## Pre-Flip Verification

### 1. Fund Address to Target Runway ✅
```bash
# Check current balance
BSV_ADDR=$(grep '^BSV_ADDRESS=' /opt/akua-stack/.env | cut -d'=' -f2)
curl -sS "https://api.whatsonchain.com/v1/bsv/main/address/$BSV_ADDR/balance"

# Target: 0.1+ BSV (10,000,000 sats) recommended
# Send funds to address if needed
# Wait for confirmation (check on WhatsOnChain)
```

**Balance after funding:** _____________ sats  
**Confirmed:** ☐ Yes ☐ No

### 2. Verify Configuration
```bash
cd /opt/akua-stack
grep -E '^(TEST_PUBLISHER_STUB|BSV_NETWORK|MIN_BALANCE_SATS|MAX_FEE_SATS)=' .env
```

**Expected:**
- `TEST_PUBLISHER_STUB=1` (will flip to 0)
- `BSV_NETWORK=mainnet`
- `MIN_BALANCE_SATS=1000000`
- `MAX_FEE_SATS=10000`

**Verified:** ☐ Yes ☐ No

### 3. Services Health Check
```bash
docker compose ps
```

**All services healthy:** ☐ Yes ☐ No

---

## Flip to Production

### 4. Backup Current State
```bash
cd /opt/akua-stack
cp .env .env.backup.$(date +%Y%m%d-%H%M%S)
git stash  # if any uncommitted changes
```

**Backup created:** ☐ Yes ☐ No

### 5. Flip Stub Mode to Production
```bash
cd /opt/akua-stack

# Confirm current mode
grep '^TEST_PUBLISHER_STUB=' .env

# Flip to production
sed -i 's/^TEST_PUBLISHER_STUB=1/TEST_PUBLISHER_STUB=0/' .env

# Verify change
grep '^TEST_PUBLISHER_STUB=' .env
```

**Expected:** `TEST_PUBLISHER_STUB=0`  
**Verified:** ☐ Yes ☐ No

### 6. Restart Publisher Service
```bash
docker compose restart publisher

# Wait for healthy status
sleep 5
docker compose ps publisher
```

**Publisher healthy:** ☐ Yes ☐ No

### 7. Verify Production Mode in Logs
```bash
docker compose logs --tail 80 publisher | grep -E "Production mode|Stub mode|WARNING"
```

**Expected:** `🚀 Production mode - broadcasting to BSV blockchain`  
**Verified:** ☐ Yes ☐ No

---

## Post-Flip Validation

### 8. Test 1: First Publish (New Hash) - Should Broadcast

**Generate test payload:**
```bash
# Option A: Via simulator (from local machine)
node scripts/simulator.js --count 1

# Option B: Via curl to hashsvc
AUTH_TOKEN=$(grep '^PUBLISHER_AUTH_TOKEN=' .env | cut -d'=' -f2)
TEST_PAYLOAD='{"deviceId":"flip-test-001","timestamp":"2026-01-29T00:00:00Z","temp":99}'

ssh root@143.198.43.229 "
cd /opt/akua-stack &&
echo '$TEST_PAYLOAD' | docker compose exec -T hashsvc sh -c '
  curl -sS -X POST http://localhost:8080/process \
    -H \"Content-Type: application/json\" \
    -d @- '
"
```

**Retrieve receipt from RabbitMQ OUT queue** (see M2_VERIFICATION.md for commands)

**Verify receipt fields:**
- `publisher.status`: `"broadcasted"` ☐ Yes ☐ No
- `publisher.cached`: `false` ☐ Yes ☐ No
- `txid`: 64 hex characters ☐ Yes ☐ No

**TXID:** _____________________________________________________________

### 9. Verify Transaction on WhatsOnChain
```bash
TXID=<paste-from-receipt>
curl -sS "https://api.whatsonchain.com/v1/bsv/main/tx/hash/$TXID"
```

**Transaction found:** ☐ Yes ☐ No  
**Confirmations:** _____________

### 10. Verify OP_RETURN Format
```bash
TXID=<paste-from-receipt>
curl -sS "https://api.whatsonchain.com/v1/bsv/main/tx/hash/$TXID" \
| jq -r '.vout[] | select(.scriptPubKey.type=="nulldata") | .scriptPubKey.asm'
```

**Expected format:** `OP_RETURN 414b5541 <64-hex-chars>`  
**414b5541 = "AKUA" in hex**

**Verified:** ☐ Yes ☐ No  
**Hash matches receipt sha256:** ☐ Yes ☐ No

### 11. Test 2: Idempotent Republish - Should Use Cache

**Send SAME payload again** (use same TEST_PAYLOAD from step 8)

**Verify receipt fields:**
- `publisher.cached`: `true` ☐ Yes ☐ No
- `txid`: SAME as Test 1 ☐ Yes ☐ No

**No new blockchain transaction:** ☐ Verified

### 12. Check Balance Delta Aligns with Fee Expectations
```bash
# Check balance after first publish
BSV_ADDR=$(grep '^BSV_ADDRESS=' /opt/akua-stack/.env | cut -d'=' -f2)
curl -sS "https://api.whatsonchain.com/v1/bsv/main/address/$BSV_ADDR/balance"
```

**Balance after first publish:** _____________ sats  
**Expected fee:** ~500-1000 sats  
**Delta matches:** ☐ Yes ☐ No ☐ Needs investigation

---

## Post-Validation Monitoring

### 13. Monitor Logs for First Hour
```bash
# In separate terminal, tail logs
docker compose logs -f publisher | grep -E "broadcasted|ERROR|WARN|balance"
```

**Any unexpected errors:** ☐ No ☐ Yes (document below)

### 14. Check Fee Patterns
```bash
# Check first 10 transactions for fee escalation
docker compose logs publisher | grep -E "fee|sats" | head -20
```

**Fees within expected range:** ☐ Yes ☐ No

### 15. Verify No UTXO Fragmentation Issues
```bash
# Check UTXO count
curl -sS "https://api.whatsonchain.com/v1/bsv/main/address/$BSV_ADDR/unspent" | jq 'length'
```

**UTXO count:** _____________  
**Reasonable (<100):** ☐ Yes ☐ No

---

## Rollback Procedure (If Needed)

If issues arise, rollback to stub mode:

```bash
cd /opt/akua-stack

# Restore stub mode
sed -i 's/^TEST_PUBLISHER_STUB=0/TEST_PUBLISHER_STUB=1/' .env

# Restart publisher
docker compose restart publisher

# Verify stub mode
docker compose logs --tail 30 publisher | grep "Stub mode"
```

---

## Sign-Off

**Production flip completed successfully:** ☐ Yes ☐ No  
**All validation checks passed:** ☐ Yes ☐ No  
**Ready for production traffic:** ☐ Yes ☐ No

**Operator signature:** _____________  
**Date/Time:** _____________

---

## Issues Encountered (if any)

_Document any issues, warnings, or unexpected behavior:_

---

## Next Steps

- [ ] Set up balance monitoring cron (`scripts/check-balance.sh`)
- [ ] Configure alerting webhook/email in balance script
- [ ] Add LOW_BALANCE_SATS=2000000 to .env for early warning
- [ ] Document first 24h traffic patterns
- [ ] Review rate limiting if traffic exceeds 50 req/min sustained
- [ ] Plan UTXO consolidation if fragmentation exceeds 50 UTXOs
