# AKUA Stack - Production Operations Reference

Quick reference for common operational tasks on production droplet.

---

## SSH Access

```bash
ssh root@143.198.43.229
cd /opt/akua-stack
```

---

## Balance Monitoring

### Check Current Balance
```bash
bash scripts/check-balance.sh
echo "exit=$?"
```

Exit codes:
- `0` = OK (balance above warning threshold)
- `1` = WARNING (below LOW_BALANCE_SATS=2M)
- `2` = CRITICAL (below MIN_BALANCE_SATS=1M)

### View Balance Logs
```bash
journalctl -t akua-balance -n 50 --no-pager
# or
tail -n 100 /var/log/syslog | grep akua-balance
```

### Check Cron Status
```bash
crontab -l  # View current cron jobs
grep check-balance /var/log/syslog | tail -5  # Recent executions
```

---

## UTXO Monitoring

### Check UTXO Count
```bash
ADDRESS=$(grep "^BSV_ADDRESS=" .env | cut -d'=' -f2)
curl -sS "https://api.whatsonchain.com/v1/bsv/main/address/$ADDRESS/unspent" | jq 'length'
```

**Warning thresholds:**
- \> 50 UTXOs: Plan consolidation
- \> 200 UTXOs: Consolidation required (fee escalation risk)

### Check UTXO Distribution
```bash
ADDRESS=$(grep "^BSV_ADDRESS=" .env | cut -d'=' -f2)
curl -sS "https://api.whatsonchain.com/v1/bsv/main/address/$ADDRESS/unspent" | jq '.[] | .value'
```

Look for many small UTXOs (dust) that increase tx size.

---

## Service Health

### Quick Health Check
```bash
docker compose ps  # All services should be "running (healthy)"
```

### Service Logs
```bash
docker compose logs -f publisher  # Real-time publisher logs
docker compose logs -f hashsvc    # Real-time hashsvc logs
docker compose logs --tail=100    # Last 100 lines all services
```

### Restart Services
```bash
docker compose restart publisher
docker compose restart hashsvc
# or restart all
docker compose restart
```

---

## Production Flip

### Before Flip
1. Review checklist: `docs/PRODUCTION_FLIP_CHECKLIST.md`
2. Verify balance > LOW_BALANCE_SATS (2M sats)
3. Check all services healthy
4. Backup .env: `cp .env .env.backup.$(date +%Y%m%d-%H%M%S)`

### Execute Flip
Follow **[PRODUCTION_FLIP_CHECKLIST.md](PRODUCTION_FLIP_CHECKLIST.md)** step-by-step (15 steps with validation).

### Quick Flip (for reference only - use checklist)
```bash
# Flip to production
sed -i 's/^TEST_PUBLISHER_STUB=1/TEST_PUBLISHER_STUB=0/' .env
docker compose restart publisher

# Verify
docker compose logs publisher | grep "TEST_PUBLISHER_STUB"
```

### Rollback
```bash
# Revert to stub mode
sed -i 's/^TEST_PUBLISHER_STUB=0/TEST_PUBLISHER_STUB=1/' .env
docker compose restart publisher
```

---

## Testing & Verification

### Run Full Test Suite
```bash
bash scripts/run-m2.sh
```

Expected: 16/16 tests passing (10 unit + 6 integration)

### Send Test Payload
```bash
TOKEN=$(grep "^PUBLISHER_AUTH_TOKEN=" .env | cut -d'=' -f2)
HASH=$(echo -n '{"test":"data"}' | sha256sum | awk '{print $1}')

curl -X POST http://localhost:8081/publish \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d "{\"sha256\":\"$HASH\"}"
```

### Verify Transaction on Chain
```bash
TXID="<txid-from-response>"
curl -sS "https://api.whatsonchain.com/v1/bsv/main/tx/hash/$TXID" | jq -r '.vout[] | select(.scriptPubKey.type=="nulldata") | .scriptPubKey.asm'
```

Expected format: `OP_RETURN 414b5541 <64-hex-chars>`
- `414b5541` = "AKUA" in hex (prefix)
- 64 chars = SHA-256 hash

---

## Configuration

### View Current Config (safe)
```bash
grep -E '^(TEST_PUBLISHER_STUB|MIN_BALANCE_SATS|LOW_BALANCE_SATS|BSV_ADDRESS)=' .env
```

### Update Balance Thresholds
```bash
# Edit .env
vi .env
# Change LOW_BALANCE_SATS or MIN_BALANCE_SATS
# No restart required for monitoring script
```

---

## Git Operations

### Check Current Version
```bash
git log --oneline -5
git describe --tags --always
```

### Pull Latest Updates
```bash
git fetch origin main
git pull --ff-only origin main  # Safe: only fast-forward
```

### View Changes
```bash
git status
git diff
```

---

## Emergency Procedures

### Service Not Responding
```bash
docker compose ps               # Check status
docker compose logs publisher   # Check errors
docker compose restart publisher
```

### Balance Critical
```bash
# Check current balance
bash scripts/check-balance.sh

# Review recent transactions
ADDRESS=$(grep "^BSV_ADDRESS=" .env | cut -d'=' -f2)
curl -sS "https://api.whatsonchain.com/v1/bsv/main/address/$ADDRESS/history" | jq '.[0:10]'

# If needed: flip to stub mode (stops spending)
sed -i 's/^TEST_PUBLISHER_STUB=0/TEST_PUBLISHER_STUB=1/' .env
docker compose restart publisher
```

### Database Issues
```bash
docker compose logs postgres
docker compose restart postgres
# Publisher will reconnect automatically
```

### RabbitMQ Issues
```bash
docker compose logs rabbitmq
# Check management UI via SSH tunnel (port 15672)
docker compose restart rabbitmq
# Services will reconnect automatically
```

---

## Monitoring URLs (via SSH Tunnel)

All services bound to localhost only. Access via SSH tunnel:

```bash
# Local machine:
ssh -L 8081:127.0.0.1:8081 -L 15672:127.0.0.1:15672 root@143.198.43.229

# Then access in browser:
# http://localhost:8081/healthz  - Publisher health
# http://localhost:15672         - RabbitMQ management (user: akua)
```

---

## Key Files

- `.env` - Configuration (600 permissions, not in git)
- `docker-compose.yml` - Service definitions
- `scripts/check-balance.sh` - Balance monitoring
- `docs/PRODUCTION_FLIP_CHECKLIST.md` - Comprehensive flip procedure
- `docs/M2_VERIFICATION.md` - Test suite documentation

---

## Security Notes

- All ports bound to `127.0.0.1` only (no public access)
- UFW firewall enabled (default-deny, SSH-only)
- `.env` never tracked in git (600 permissions)
- Bearer auth required for publisher `/publish` endpoint
- Timing-safe token comparison prevents timing attacks
- No sensitive data in logs (tokens redacted)

---

## Support & Troubleshooting

1. Check service logs: `docker compose logs`
2. Run health checks: `bash scripts/run-m2.sh`
3. Verify balance: `bash scripts/check-balance.sh`
4. Review checklist: `docs/PRODUCTION_FLIP_CHECKLIST.md`
5. Check git history: `git log --oneline -10`

For blockchain issues:
- WhatsOnChain API status: https://api.whatsonchain.com/v1/bsv/main/chain/info
- BSV network status: https://whatsonchain.com/
