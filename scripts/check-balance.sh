#!/bin/bash
# Balance monitoring script for AKUA publisher
# Checks BSV address balance and alerts if below thresholds
# Run via cron: 0 */4 * * * /opt/akua-stack/scripts/check-balance.sh

set -euo pipefail

ENV=/opt/akua-stack/.env
BSV_ADDR=$(grep '^BSV_ADDRESS=' "$ENV" | cut -d'=' -f2)
MIN_BALANCE=$(grep '^MIN_BALANCE_SATS=' "$ENV" | cut -d'=' -f2)
LOW_BALANCE=${LOW_BALANCE_SATS:-2000000}  # Default 0.02 BSV if not set

# Fetch balance from WhatsOnChain
JSON=$(curl -fsS --max-time 8 "https://api.whatsonchain.com/v1/bsv/main/address/${BSV_ADDR}/balance")
CONFIRMED=$(echo "$JSON" | jq -r '.confirmed // 0')
UNCONFIRMED=$(echo "$JSON" | jq -r '.unconfirmed // 0')

# Check thresholds
if [ "$CONFIRMED" -lt "$MIN_BALANCE" ]; then
  logger -t akua-balance -p user.crit "CRITICAL: confirmed=${CONFIRMED} sats (< ${MIN_BALANCE} floor); unconfirmed=${UNCONFIRMED}"
  echo "CRITICAL: Balance at ${CONFIRMED} sats below minimum floor ${MIN_BALANCE}" >&2
  # Add webhook/email notification here
  exit 2
elif [ "$CONFIRMED" -lt "$LOW_BALANCE" ]; then
  logger -t akua-balance -p user.warning "WARNING: confirmed=${CONFIRMED} sats (< ${LOW_BALANCE} warning); unconfirmed=${UNCONFIRMED}"
  echo "WARNING: Balance at ${CONFIRMED} sats below warning threshold ${LOW_BALANCE}" >&2
  # Add webhook/email notification here
  exit 1
fi

logger -t akua-balance "OK: confirmed=${CONFIRMED} sats; unconfirmed=${UNCONFIRMED}; low=${LOW_BALANCE}; floor=${MIN_BALANCE}"
echo "OK: Balance ${CONFIRMED} sats (unconfirmed: ${UNCONFIRMED})"
exit 0
