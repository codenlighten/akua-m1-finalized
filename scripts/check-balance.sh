#!/bin/bash
# Balance monitoring script for AKUA publisher
# Checks BSV address balance and alerts if below thresholds
# Run via cron: 0 */4 * * * /opt/akua-stack/scripts/check-balance.sh

set -euo pipefail
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

ENV=/opt/akua-stack/.env

# Helper: read KEY=VALUE from .env, strip quotes/CRLF/whitespace
get_env() {
  local key="$1"
  local val
  val="$(grep -E "^${key}=" "$ENV" | tail -n1 | cut -d'=' -f2- | tr -d '\r' | sed 's/^"//;s/"$//' | xargs || true)"
  printf '%s' "$val"
}

is_uint() { [[ "${1:-}" =~ ^[0-9]+$ ]]; }

BSV_ADDR="$(get_env BSV_ADDRESS)"
MIN_BALANCE="$(get_env MIN_BALANCE_SATS)"
LOW_BALANCE="$(get_env LOW_BALANCE_SATS)"
LOW_BALANCE="${LOW_BALANCE:-2000000}"  # Default 0.02 BSV if not set

# Optional UTXO thresholds (defaults if not in .env)
UTXO_WARN_COUNT="$(get_env UTXO_WARN_COUNT)"
UTXO_WARN_COUNT="${UTXO_WARN_COUNT:-50}"
UTXO_CRIT_COUNT="$(get_env UTXO_CRIT_COUNT)"
UTXO_CRIT_COUNT="${UTXO_CRIT_COUNT:-200}"

# Validate config
if [ -z "$BSV_ADDR" ]; then
  logger -t akua-balance -p user.crit "CRITICAL: BSV_ADDRESS missing in $ENV"
  echo "CRITICAL: BSV_ADDRESS missing in $ENV" >&2
  exit 2
fi
if ! is_uint "$MIN_BALANCE"; then
  logger -t akua-balance -p user.crit "CRITICAL: MIN_BALANCE_SATS invalid or missing in $ENV (value='$MIN_BALANCE')"
  echo "CRITICAL: MIN_BALANCE_SATS invalid or missing in $ENV (value='$MIN_BALANCE')" >&2
  exit 2
fi
if ! is_uint "$LOW_BALANCE"; then
  logger -t akua-balance -p user.crit "CRITICAL: LOW_BALANCE_SATS invalid in $ENV (value='$LOW_BALANCE')"
  echo "CRITICAL: LOW_BALANCE_SATS invalid in $ENV (value='$LOW_BALANCE')" >&2
  exit 2
fi
if [ "$LOW_BALANCE" -lt "$MIN_BALANCE" ]; then
  logger -t akua-balance -p user.crit "CRITICAL: LOW_BALANCE_SATS < MIN_BALANCE_SATS (low=$LOW_BALANCE min=$MIN_BALANCE)"
  echo "CRITICAL: LOW_BALANCE_SATS < MIN_BALANCE_SATS (low=$LOW_BALANCE min=$MIN_BALANCE)" >&2
  exit 2
fi
if ! is_uint "$UTXO_WARN_COUNT" || ! is_uint "$UTXO_CRIT_COUNT"; then
  logger -t akua-balance -p user.crit "CRITICAL: UTXO thresholds invalid (warn=$UTXO_WARN_COUNT crit=$UTXO_CRIT_COUNT)"
  echo "CRITICAL: UTXO thresholds invalid (warn=$UTXO_WARN_COUNT crit=$UTXO_CRIT_COUNT)" >&2
  exit 2
fi

# Fetch balance from WhatsOnChain
JSON="$(curl -fsS --max-time 8 "https://api.whatsonchain.com/v1/bsv/main/address/${BSV_ADDR}/balance")"

# Ensure it is valid JSON
printf '%s' "$JSON" | jq -e . >/dev/null

CONFIRMED="$(printf '%s' "$JSON" | jq -r '.confirmed // 0')"
UNCONFIRMED="$(printf '%s' "$JSON" | jq -r '.unconfirmed // 0')"

# Fetch UTXO count for fragmentation monitoring
UTXO_JSON="$(curl -fsS --max-time 8 "https://api.whatsonchain.com/v1/bsv/main/address/${BSV_ADDR}/unspent" || echo '[]')"
UTXO_COUNT="$(printf '%s' "$UTXO_JSON" | jq -e 'length' || echo '0')"

# Determine worst status across all checks
WORST_STATUS=0  # 0=OK, 1=WARNING, 2=CRITICAL

# Check balance thresholds
if [ "$CONFIRMED" -lt "$MIN_BALANCE" ]; then
  logger -t akua-balance -p user.crit "CRITICAL: confirmed=${CONFIRMED} sats (< ${MIN_BALANCE} floor); unconfirmed=${UNCONFIRMED}"
  echo "CRITICAL: Balance at ${CONFIRMED} sats below minimum floor ${MIN_BALANCE}" >&2
  WORST_STATUS=2
elif [ "$CONFIRMED" -lt "$LOW_BALANCE" ]; then
  logger -t akua-balance -p user.warning "WARNING: confirmed=${CONFIRMED} sats (< ${LOW_BALANCE} warning); unconfirmed=${UNCONFIRMED}"
  echo "WARNING: Balance at ${CONFIRMED} sats below warning threshold ${LOW_BALANCE}" >&2
  WORST_STATUS=1
fi

# Check UTXO fragmentation
if [ "$UTXO_COUNT" -ge "$UTXO_CRIT_COUNT" ]; then
  logger -t akua-balance -p user.crit "CRITICAL: UTXO fragmentation at ${UTXO_COUNT} outputs (>= ${UTXO_CRIT_COUNT} critical threshold)"
  echo "CRITICAL: UTXO fragmentation at ${UTXO_COUNT} outputs (consolidation required)" >&2
  WORST_STATUS=2
elif [ "$UTXO_COUNT" -ge "$UTXO_WARN_COUNT" ]; then
  logger -t akua-balance -p user.warning "WARNING: UTXO fragmentation at ${UTXO_COUNT} outputs (>= ${UTXO_WARN_COUNT} warning threshold)"
  echo "WARNING: UTXO fragmentation at ${UTXO_COUNT} outputs (plan consolidation)" >&2
  [ "$WORST_STATUS" -lt 1 ] && WORST_STATUS=1
fi

# Log OK status if no issues
if [ "$WORST_STATUS" -eq 0 ]; then
  logger -t akua-balance "OK: confirmed=${CONFIRMED} sats; unconfirmed=${UNCONFIRMED}; utxos=${UTXO_COUNT}; low=${LOW_BALANCE}; floor=${MIN_BALANCE}"
  echo "OK: Balance ${CONFIRMED} sats (unconfirmed: ${UNCONFIRMED}; UTXOs: ${UTXO_COUNT})"
fi

exit "$WORST_STATUS"
