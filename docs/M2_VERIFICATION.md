# M2 Verification Commands

Quick reference for validating M2 deployment and functionality.

---

## Service Status

### Check all services
```bash
cd /opt/akua-stack
docker compose ps
```

**Expected:** All services show `healthy` status

### Check specific service
```bash
docker compose ps publisher
docker compose ps hashsvc
```

---

## Environment Verification

### Check service capabilities (M2)
```bash
AUTH_TOKEN=$(grep "^PUBLISHER_AUTH_TOKEN=" /opt/akua-stack/.env | cut -d'=' -f2)

curl -s -H "Authorization: Bearer $AUTH_TOKEN" http://localhost:8081/info | jq .
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

**Note:** `/info` endpoint requires auth token (like `/publish`) to prevent config disclosure if port exposed.

This is the fastest way to verify configuration without inspecting logs or env vars.

### Check stub mode and network configuration
```bash
cd /opt/akua-stack
docker compose exec -T publisher node -e "console.log('stub=', process.env.TEST_PUBLISHER_STUB, 'net=', process.env.NETWORK)"
```

**Expected for test mode:**
```
stub= 1 net= mainnet
```

**Expected for production mode:**
```
stub= 0 net= mainnet
```

### Check auth configuration
```bash
docker compose exec -T publisher node -e "console.log('auth=', process.env.PUBLISHER_AUTH_TOKEN ? 'enabled' : 'disabled')"
```

**Expected:** `auth= enabled` (if token is set)

### Verify environment variables loaded
```bash
docker compose exec -T publisher env | grep -E 'TEST_PUBLISHER_STUB|NETWORK|RATE_LIMIT|MAX_FEE|MIN_BALANCE'
```

---

## Auth Validation

### Test without token (should fail with 401)
```bash
curl -s -w "\nHTTP %{http_code}\n" \
  -X POST http://localhost:8081/publish \
  -H "Content-Type: application/json" \
  -d '{"sha256":"0000000000000000000000000000000000000000000000000000000000000999"}' \
  | jq -c .
```

**Expected:**
```json
{"error":"Unauthorized","message":"Missing or invalid authorization header"}
HTTP 401
```

### Test with valid token (should succeed)
```bash
AUTH_TOKEN=$(grep "^PUBLISHER_AUTH_TOKEN=" /opt/akua-stack/.env | cut -d'=' -f2)

curl -s -w "\nHTTP %{http_code}\n" \
  -X POST http://localhost:8081/publish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"sha256":"0000000000000000000000000000000000000000000000000000000000000888"}' \
  | jq .
```

**Expected:**
```json
{
  "sha256": "0000000000000000000000000000000000000000000000000000000000000888",
  "txid": "57aa199681196d8660554b23af980219cc0cfce551448c30df8d7d468313c2f2",
  "status": "broadcasted",
  "publishedAt": "2026-01-29T04:02:25.594Z",
  "network": "mainnet",
  "cached": false
}
HTTP 200
```

---

## Cached Flag Verification

### First publish (cached: false)
```bash
SHA="0000000000000000000000000000000000000000000000000000000000000777"
AUTH_TOKEN=$(grep "^PUBLISHER_AUTH_TOKEN=" /opt/akua-stack/.env | cut -d'=' -f2)

curl -s -X POST http://localhost:8081/publish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{\"sha256\":\"$SHA\"}" \
  | jq '{sha256, txid, cached: .cached}'
```

**Expected:**
```json
{
  "sha256": "0000000000000000000000000000000000000000000000000000000000000777",
  "txid": "...",
  "cached": false
}
```

### Second publish (cached: true)
```bash
# Same SHA as above
curl -s -X POST http://localhost:8081/publish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d "{\"sha256\":\"$SHA\"}" \
  | jq '{sha256, txid, cached: .cached}'
```

**Expected:**
```json
{
  "sha256": "0000000000000000000000000000000000000000000000000000000000000777",
  "txid": "...",
  "cached": true
}
```

**Critical:** TXID should match first publish. If `cached: true`, no duplicate blockchain transaction was created.

---

## Rate Limiting Validation

### Quick burst test (should see some 429s if > 100 req/min)
```bash
AUTH_TOKEN=$(grep "^PUBLISHER_AUTH_TOKEN=" /opt/akua-stack/.env | cut -d'=' -f2)

for i in $(seq 1 120); do
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST http://localhost:8081/publish \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $AUTH_TOKEN" \
    -d "{\"sha256\":\"$(printf "%064d" $i | tr " " "0")\"}"
done | sort | uniq -c
```

**Expected output (approximate):**
```
100 200
 20 429
```

**Note:** First ~100 requests succeed (200), then rate limiter kicks in (429).

---

## Test Suite Execution

### Run all M2 tests
```bash
cd /opt/akua-stack
bash scripts/run-m2.sh
```

**Expected:**
```
=== AKUA M2 Test Suite ===

Running unit tests (canonicalize)...
✔ tests 10/10 passed

Running integration tests (e2e + idempotency)...
✔ tests 6/6 passed

✅ M2 test suite complete (16 tests passed)
```

### Run only unit tests
```bash
docker compose exec -T hashsvc npm run test:unit
```

### Run only integration tests
```bash
docker compose exec -T hashsvc npm run test:integration
```

---

## Log Analysis

### Check publisher startup logs
```bash
docker compose logs --tail 50 publisher | head -30
```

**Look for:**
- `🚀 Production mode` or `🔧 Stub mode ENABLED`
- `Auth middleware status: { authEnabled: true }`
- No `ERROR` or `WARN` messages (except expected stub mode warning)

### Check for errors
```bash
docker compose logs --tail 100 publisher | grep -i "error\|warn"
```

**Expected:** No unexpected errors. Only stub mode warning if TEST_PUBLISHER_STUB=1.

### Check for low balance warnings
```bash
docker compose logs --tail 200 publisher | grep -i "balance"
```

**Expected:** `Low balance warning` if UTXO balance < MIN_BALANCE_SATS

### Monitor logs in real-time
```bash
docker compose logs -f publisher
docker compose logs -f hashsvc
```

Press Ctrl+C to stop.

---

## Blockchain Verification (Production Mode Only)

### Check BSV address balance
```bash
ADDRESS=$(grep "^BSV_ADDRESS=" /opt/akua-stack/.env | cut -d'=' -f2)
curl -s "https://api.whatsonchain.com/v1/bsv/main/address/$ADDRESS/balance" | jq .
```

**Expected:**
```json
{
  "confirmed": 2824359,
  "unconfirmed": 0
}
```

### Verify transaction on chain
```bash
TXID="<txid from receipt>"
curl -s "https://api.whatsonchain.com/v1/bsv/main/tx/hash/$TXID" | jq '.confirmations, .blockhash'
```

**Expected:** Confirmations >= 0, blockhash present if confirmed

### Check OP_RETURN format
```bash
curl -s "https://api.whatsonchain.com/v1/bsv/main/tx/hash/$TXID" \
  | jq '.vout[] | select(.scriptPubKey.type=="nulldata") | .scriptPubKey.hex'
```

**Expected format:**
```
"6a04414b5541200952cb262572882a17ab8010251ba9079749648d08ff75b2e9d8bb1339add8c5"
```

Breakdown:
- `6a` = OP_RETURN
- `04` = PUSHDATA 4 bytes
- `414b5541` = "AKUA" in hex
- `20` = PUSHDATA 32 bytes
- `0952cb...` = SHA-256 hash (64 hex chars)

---

## Health Checks

### Publisher health
```bash
curl -s http://localhost:8081/healthz | jq .
```

**Expected:**
```json
{
  "ok": true,
  "service": "publisher",
  "version": "1.0.0"
}
```

### Hashsvc health
```bash
curl -s http://localhost:8080/healthz | jq .
```

**Expected:**
```json
{
  "ok": true,
  "service": "hashsvc",
  "version": "1.0.0"
}
```

### RabbitMQ health
```bash
curl -s http://localhost:15672/api/health/checks/alarms -u akua:akua_pass | jq .
```

**Expected:**
```json
{
  "status": "ok"
}
```

---

## Queue Inspection

### Check queue depth
```bash
curl -s http://localhost:15672/api/queues/%2F/iot.payload.in -u akua:akua_pass \
  | jq '{name, messages, consumers}'
```

**Expected:**
```json
{
  "name": "iot.payload.in",
  "messages": 0,
  "consumers": 1
}
```

**Note:** `messages: 0` indicates no backlog (healthy). `consumers: 1` means hashsvc is consuming.

### Check DLQ depth
```bash
curl -s http://localhost:15672/api/queues/%2F/iot.payload.in.dlq -u akua:akua_pass \
  | jq '{name, messages}'
```

**Expected:**
```json
{
  "name": "iot.payload.in.dlq",
  "messages": 0
}
```

**Alert if messages > 0** - indicates failed message processing

---

## Database Verification

### Check publish_records table size
```bash
docker compose exec -T postgres psql -U publisher -d publisher \
  -c "SELECT COUNT(*) as total_publishes FROM publish_records;"
```

**Expected:**
```
 total_publishes
-----------------
             42
```

### Check recent publishes
```bash
docker compose exec -T postgres psql -U publisher -d publisher \
  -c "SELECT sha256, txid, status, created_at FROM publish_records ORDER BY created_at DESC LIMIT 5;"
```

**Expected:** List of recent SHA-256 hashes with corresponding TXIDs

---

## Performance Metrics

### Measure single publish latency
```bash
time curl -s -X POST http://localhost:8081/publish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{"sha256":"'$(openssl rand -hex 32)'"}' > /dev/null
```

**Expected (stub mode):** < 100ms  
**Expected (production, first publish):** 1-3 seconds  
**Expected (production, cached):** < 100ms

---

## Troubleshooting Commands

### Restart single service
```bash
docker compose restart publisher
docker compose restart hashsvc
```

### Rebuild and restart
```bash
docker compose up -d --build --force-recreate publisher
```

### Check disk space
```bash
df -h /var/lib/docker
```

### Check memory usage
```bash
docker stats --no-stream
```

### Export logs for analysis
```bash
docker compose logs --since 1h publisher > publisher-logs-$(date +%Y%m%d-%H%M%S).txt
```

---

## Quick Health Check Script

Save as `scripts/health-check.sh`:

```bash
#!/bin/bash
set -e

echo "=== AKUA Stack Health Check ==="
echo ""

# Services
echo "Services:"
docker compose ps | tail -n +2 | awk '{print $1, $NF}'

# Publisher health
echo ""
echo "Publisher:"
curl -s http://localhost:8081/healthz | jq -c '{ok, service}'

# Hashsvc health
echo ""
echo "Hashsvc:"
curl -s http://localhost:8080/healthz | jq -c '{ok, service}'

# Queue depth
echo ""
echo "Queue depth:"
curl -s http://localhost:15672/api/queues/%2F/iot.payload.in -u akua:akua_pass \
  | jq -c '{name, messages, consumers}'

# DLQ depth
echo ""
echo "DLQ depth:"
curl -s http://localhost:15672/api/queues/%2F/iot.payload.in.dlq -u akua:akua_pass \
  | jq -c '{name, messages}'

echo ""
echo "✅ Health check complete"
```

**Run:**
```bash
chmod +x scripts/health-check.sh
bash scripts/health-check.sh
```

---

**Last Updated:** 2026-01-29  
**M2 Status:** Complete  
**Related:** [PRODUCTION_FLIP.md](PRODUCTION_FLIP.md), [TESTING.md](TESTING.md)
