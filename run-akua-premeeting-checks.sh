#!/usr/bin/env bash
set -euo pipefail

HOST="root@143.198.43.229"
ROOT="/opt/akua-stack"
TS="$(date -u +'%Y-%m-%dT%H:%M:%SZ')"

echo "=== AKUA PRE-MEETING VALIDATION ($TS UTC) ==="
echo "Host: $HOST"
echo "Root: $ROOT"
echo

# 1) Provenance
echo "--- PROVENANCE ---"
ssh "$HOST" "cd $ROOT && echo 'HEAD:' \$(git rev-parse --short HEAD) \
  && echo 'DESCRIBE:' \$(git describe --tags --always 2>/dev/null || true) \
  && echo 'REMOTE:' \$(git remote -v | head -1) \
  && echo 'LAST 3:' && git log --oneline -3"

echo
# 2) Services healthy
echo "--- DOCKER HEALTH ---"
ssh "$HOST" "cd $ROOT && docker compose ps"

echo
echo "--- PORT BINDINGS (docker ps) ---"
ssh "$HOST" "docker ps --format 'table {{.Names}}\t{{.Ports}}'"

echo
# 3) Network exposure & firewall
echo "--- LISTENING SOCKETS (8080/8081/15672/5672) ---"
ssh "$HOST" "ss -tulpn | grep -E ':8080|:8081|:15672|:5672' || true"

echo
echo "--- UFW ---"
ssh "$HOST" "ufw status verbose || true"

echo
# 4) Confirm localhost-only reachability from droplet + public blocked
echo "--- PUBLIC ACCESS TESTS (from your local machine) ---"
( curl -sS --max-time 3 "http://143.198.43.229:8081/healthz" 2>/dev/null && echo "UNEXPECTED: publisher reachable publicly" ) \
  || echo "OK: publisher not reachable publicly"
( curl -sS --max-time 3 "http://143.198.43.229:15672" 2>/dev/null && echo "UNEXPECTED: rabbitmq ui reachable publicly" ) \
  || echo "OK: rabbitmq ui not reachable publicly"

echo
# 5) Auth enforcement (/info, /publish)
echo "--- AUTH ENFORCEMENT ---"
ssh "$HOST" "cd $ROOT && \
  AUTH_TOKEN=\$(grep '^PUBLISHER_AUTH_TOKEN=' .env | cut -d'=' -f2 | tr -d '\r') && \
  echo 'Has token:' \$([ -n \"\$AUTH_TOKEN\" ] && echo yes || echo no) && \
  echo '' && \
  echo '[NO AUTH] /info (expect 401):' && \
  (curl -sS --max-time 2 -i http://127.0.0.1:8081/info 2>/dev/null | head -10 || echo 'timeout/error') && \
  echo '' && \
  echo '[WITH AUTH] /info (expect 200):' && \
  (curl -sS --max-time 2 -H \"Authorization: Bearer \$AUTH_TOKEN\" -i http://127.0.0.1:8081/info 2>/dev/null | head -10 || echo 'timeout/error')"

echo
# 6) Rate limit check (should eventually 429)
echo "--- RATE LIMIT SMOKE (expect at least one 429 if limiter active) ---"
ssh "$HOST" "cd $ROOT && \
  AUTH_TOKEN=\$(grep '^PUBLISHER_AUTH_TOKEN=' .env | cut -d'=' -f2 | tr -d '\r') && \
  ok=0; rl=0; for i in \$(seq 1 130); do \
       code=\$(curl -sS -o /dev/null -w '%{http_code}' --max-time 1 \
         -H \"Authorization: Bearer \$AUTH_TOKEN\" http://127.0.0.1:8081/info 2>/dev/null || echo 000); \
       if [ \"\$code\" = \"200\" ]; then ok=\$((ok+1)); fi; \
       if [ \"\$code\" = \"429\" ]; then rl=\$((rl+1)); fi; \
     done; \
     echo \"200_count=\$ok 429_count=\$rl\"; \
     if [ \$rl -ge 1 ]; then echo 'OK: rate limiting active'; else echo 'WARN: no 429 observed (check limiter config)'; fi"

echo
# 7) Secrets hygiene quick scan
echo "--- LOG HYGIENE SCAN (heuristic) ---"
ssh "$HOST" "cd $ROOT && \
  docker compose logs --tail 400 publisher hashsvc 2>/dev/null | grep -iE 'private_key|BEGIN.*PRIVATE|PUBLISHER_AUTH_TOKEN|Authorization: Bearer|BSV_PRIVATE_KEY' && echo 'UNEXPECTED: possible secret in logs' || echo 'OK: no obvious secrets found in last 400 lines'"

echo
# 8) Monitoring script + cron + last journal entry
echo "--- BALANCE MONITOR ---"
ssh "$HOST" "cd $ROOT && bash scripts/check-balance.sh; echo 'exit_code='$?"

echo
echo "--- THRESHOLDS ---"
ssh "$HOST" "cd /opt/akua-stack && grep -E '^(MIN_BALANCE_SATS|LOW_BALANCE_SATS|UTXO_WARN_COUNT|UTXO_CRIT_COUNT)=' .env"

echo
echo "--- CRON JOB ---"
ssh "$HOST" "crontab -l | grep check-balance || echo 'WARN: cron job not found'"

echo
echo "--- LAST JOURNAL ENTRY (akua-balance) ---"
ssh "$HOST" "journalctl -t akua-balance -n 1 --no-pager || echo 'no journal entries'"

echo
# 9) RabbitMQ user sanity
echo "--- RABBITMQ USERS (no guest) ---"
ssh "$HOST" "cd /opt/akua-stack && docker compose exec -T rabbitmq rabbitmqctl list_users"

echo
# 10) WhatsOnChain connectivity
echo "--- WOC CONNECTIVITY (publisher container) ---"
ssh "$HOST" "cd /opt/akua-stack && docker compose exec -T publisher sh -c 'curl -sS --max-time 5 https://api.whatsonchain.com/v1/bsv/main/woc 2>/dev/null | head -c 200; echo'"

echo
# 11) Stub mode status (flip readiness)
echo "--- FLIP READINESS (stub mode + network target) ---"
ssh "$HOST" "cd /opt/akua-stack && grep -E '^(TEST_PUBLISHER_STUB|BSV_NETWORK)=' .env"

echo
# 12) Database connectivity + publish_records exists
echo "--- DATABASE CHECK ---"
ssh "$HOST" "cd /opt/akua-stack && \
  docker compose exec -T postgres psql -U publisher -d publisher -c '\l' 2>/dev/null | grep publisher || echo 'WARN: could not verify database'" && \
  echo "Table structure (publish_records):" && \
  ssh "$HOST" "cd /opt/akua-stack && docker compose exec -T postgres psql -U publisher -d publisher -c '\d publish_records' 2>/dev/null || echo 'WARN: could not query table'"

echo
# 13) TL;DR status
echo "=== SUMMARY ==="
echo "All checks complete. Review output for WARN/UNEXPECTED lines."
echo "Timestamp: $TS UTC"
echo

