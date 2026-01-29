# AKUA Stack - Production Flip Procedure

This guide covers switching from test/stub mode to production blockchain publishing.

---

## Prerequisites

Before flipping to production:

1. ✅ All M2 tests passing (`bash scripts/run-m2.sh`)
2. ✅ Auth token configured (`PUBLISHER_AUTH_TOKEN`)
3. ✅ BSV address funded with adequate balance
4. ✅ Services healthy in stub mode

---

## Step 1: Verify Current Balance

SSH into droplet and check UTXO balance:

```bash
cd /opt/akua-stack

# Get BSV address from .env
grep BSV_ADDRESS .env

# Check balance via WhatsOnChain API
ADDRESS=$(grep "^BSV_ADDRESS=" .env | cut -d'=' -f2)
curl -s "https://api.whatsonchain.com/v1/bsv/main/address/$ADDRESS/balance" | jq .
```

**Expected output:**
```json
{
  "confirmed": 2824359,  # satoshis (0.02824359 BSV)
  "unconfirmed": 0
}
```

**Minimum recommended:** 0.01 BSV (1,000,000 sats) for initial testing

**Alert if balance < MIN_BALANCE_SATS (default: 1,000,000 sats)**

---

## Step 2: Update .env for Production Mode

```bash
cd /opt/akua-stack

# Backup current .env
cp .env .env.backup-$(date +%Y%m%d-%H%M%S)

# Update TEST_PUBLISHER_STUB to 0 (production mode)
sed -i 's/^TEST_PUBLISHER_STUB=1/TEST_PUBLISHER_STUB=0/' .env

# Verify change
grep TEST_PUBLISHER_STUB .env
```

**Expected:** `TEST_PUBLISHER_STUB=0`

---

## Step 3: Restart Publisher Service

```bash
cd /opt/akua-stack

# Restart only publisher (hashsvc doesn't need restart)
docker compose up -d --force-recreate publisher

# Wait for healthcheck
sleep 10

# Verify publisher is healthy
docker compose ps publisher
```

**Expected:** Status should show `healthy`

---

## Step 4: Check Startup Logs

Verify no stub mode warnings:

```bash
docker compose logs --tail 50 publisher | grep -i "stub\|production\|mode"
```

**Expected output:**
```
🚀 Production mode - broadcasting to BSV blockchain
```

**Should NOT see:**
```
⚠️  WARNING: TEST_PUBLISHER_STUB=1 with NETWORK=mainnet
```

---

## Step 5: Single Message Test

Publish **one** test message to verify real blockchain anchoring:

```bash
cd /opt/akua-stack

# Publish test payload via RabbitMQ management API
curl -s -u akua:akua_pass \
  -H "Content-Type: application/json" \
  -X POST http://localhost:15672/api/exchanges/%2F/amq.default/publish \
  -d '{
    "properties": {"delivery_mode": 2},
    "routing_key": "iot.payload.in",
    "payload": "{\"deviceId\":\"PROD-TEST-001\",\"ts\":\"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'\"}",
    "payload_encoding": "string"
  }' | jq .
```

**Expected:** `{"routed": true}`

---

## Step 6: Retrieve Receipt

Wait 2-5 seconds for processing, then fetch receipt:

```bash
curl -s -u akua:akua_pass \
  -H "Content-Type: application/json" \
  -X POST http://localhost:15672/api/queues/%2F/iot.payload.out/get \
  -d '{"count":1,"ackmode":"ack_requeue_false","encoding":"auto"}' \
  | jq '.[0].payload | fromjson'
```

**Verify:**
- `sha256` is 64 hex chars
- `txid` is 64 hex chars (NOT deterministic fake from stub mode)
- `publisher.cached` is `false` (first publish)
- `publisher.network` is `"mainnet"`
- `publisher.status` is `"broadcasted"`

**Example receipt:**
```json
{
  "version": "1",
  "original": {
    "deviceId": "PROD-TEST-001",
    "ts": "2026-01-29T04:15:00Z"
  },
  "canonical": "{\"deviceId\":\"PROD-TEST-001\",\"ts\":\"2026-01-29T04:15:00Z\"}",
  "sha256": "a1b2c3d4...",
  "txid": "e5f6g7h8...",
  "publisher": {
    "network": "mainnet",
    "status": "broadcasted",
    "cached": false
  },
  "meta": {
    "receivedAt": "2026-01-29T04:15:02.123Z"
  }
}
```

---

## Step 7: Verify Transaction on WhatsOnChain

```bash
# Extract txid from receipt
TXID="<txid from receipt>"

# Check transaction details
curl -s "https://api.whatsonchain.com/v1/bsv/main/tx/hash/$TXID" | jq .

# Verify OP_RETURN contains AKUA prefix + hash
curl -s "https://api.whatsonchain.com/v1/bsv/main/tx/hash/$TXID" \
  | jq '.vout[] | select(.scriptPubKey.type=="nulldata") | .scriptPubKey.hex'
```

**Expected OP_RETURN format:**
```
6a04414b5541<32_byte_hash>
```

- `6a` = OP_RETURN
- `04` = PUSHDATA 4 bytes
- `414b5541` = "AKUA" in hex
- `20` = PUSHDATA 32 bytes
- `<hash>` = 64 hex chars (SHA-256)

**View in browser:**
```
https://whatsonchain.com/tx/<txid>
```

---

## Step 8: Verify Idempotency (Cached Publish)

Publish the **exact same payload** again:

```bash
curl -s -u akua:akua_pass \
  -H "Content-Type: application/json" \
  -X POST http://localhost:15672/api/exchanges/%2F/amq.default/publish \
  -d '{
    "properties": {"delivery_mode": 2},
    "routing_key": "iot.payload.in",
    "payload": "{\"deviceId\":\"PROD-TEST-001\",\"ts\":\"2026-01-29T04:15:00Z\"}",
    "payload_encoding": "string"
  }' | jq .
```

**Retrieve second receipt:**
```bash
curl -s -u akua:akua_pass \
  -H "Content-Type: application/json" \
  -X POST http://localhost:15672/api/queues/%2F/iot.payload.out/get \
  -d '{"count":1,"ackmode":"ack_requeue_false","encoding":"auto"}' \
  | jq '.[0].payload | fromjson'
```

**Verify:**
- `txid` **matches first receipt** (idempotent)
- `publisher.cached` is `true` (retrieved from DB)
- `sha256` matches first receipt

**Critical:** If `cached: true`, no second blockchain transaction was broadcast (satoshis saved).

---

## Step 9: Monitor Logs for Errors

```bash
# Watch publisher logs in real-time
docker compose logs -f publisher

# Check for errors/warnings
docker compose logs --tail 100 publisher | grep -i "error\|warn\|balance"
```

**Watch for:**
- `Low balance warning` - Indicates UTXO balance below MIN_BALANCE_SATS
- `Transaction fee X sats exceeds maximum` - Fee cap exceeded
- `401` or `403` - Auth failures from hashsvc

---

## Step 10: Enable Monitoring (Optional)

Set up alerts for:

1. **Balance alerts** - Notify when balance < 0.005 BSV
2. **Rate limit hits** - Track 429 responses
3. **Failed publishes** - Monitor DLQ depth
4. **Health checks** - Alert if publisher becomes unhealthy

**Example: Check balance every hour via cron**
```bash
0 * * * * curl -s "https://api.whatsonchain.com/v1/bsv/main/address/<BSV_ADDRESS>/balance" | jq '.confirmed' | awk '{if($1<500000)print "ALERT: Balance low:",$1}' | mail -s "AKUA Balance Alert" admin@example.com
```

---

## Rollback Procedure (If Issues Arise)

If production mode has issues:

```bash
cd /opt/akua-stack

# Restore backup .env
cp .env.backup-<timestamp> .env

# Restart publisher in stub mode
docker compose up -d --force-recreate publisher

# Verify stub mode is active
docker compose logs --tail 20 publisher | grep "Stub mode ENABLED"
```

---

## Post-Production Checklist

After successful production flip:

- [ ] Confirmed single transaction on WhatsOnChain
- [ ] Verified idempotency (cached: true on second publish)
- [ ] No errors in publisher logs
- [ ] Balance sufficient for continued operation
- [ ] Monitoring/alerts configured
- [ ] Documented first production txid in STATUS.md
- [ ] Updated STATUS.md with "Production Mode Active" timestamp

---

## Troubleshooting

### Issue: "Insufficient funds" error

**Cause:** UTXO balance too low to cover tx fee  
**Fix:** Send more BSV to `BSV_ADDRESS`

### Issue: "Fee exceeds maximum" error

**Cause:** Tx fee > MAX_FEE_SATS  
**Fix:** Increase `MAX_FEE_SATS` in .env (or investigate why fees are high)

### Issue: 401/403 from hashsvc

**Cause:** Auth token mismatch between hashsvc and publisher  
**Fix:** Verify `PUBLISHER_AUTH_TOKEN` is identical in both services' env vars

### Issue: Duplicate transactions on chain

**Cause:** Idempotency not working (DB issue)  
**Fix:** Check PostgreSQL connection, verify `publish_records` table has unique constraint on `sha256`

---

## Production Mode Confirmed

Once all steps pass, update STATUS.md:

```markdown
## Production Status

- **Production Mode Active:** 2026-01-29 04:30 UTC
- **First Production TXID:** <txid from step 7>
- **Idempotency Verified:** ✅
- **Balance Monitoring:** Active
- **Stub Mode:** Disabled (TEST_PUBLISHER_STUB=0)
```

**Congratulations! AKUA stack is now live on BSV mainnet.** 🚀
