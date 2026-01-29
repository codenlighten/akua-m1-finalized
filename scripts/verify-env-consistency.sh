#!/bin/bash
# Verify auth token environment variable consistency between services
# Run this on the droplet

set -e

echo "=== Verifying Service Environment Variables ==="
echo ""

cd /opt/akua-stack

echo "Checking hashsvc PUBLISHER_AUTH_TOKEN..."
HASHSVC_TOKEN=$(docker compose exec -T hashsvc node -e "console.log(!!process.env.PUBLISHER_AUTH_TOKEN)")
echo "  hashsvc has auth token: $HASHSVC_TOKEN"

echo ""
echo "Checking publisher PUBLISHER_AUTH_TOKEN..."
PUBLISHER_TOKEN=$(docker compose exec -T publisher node -e "console.log(!!process.env.PUBLISHER_AUTH_TOKEN)")
echo "  publisher has auth token: $PUBLISHER_TOKEN"

echo ""

if [ "$HASHSVC_TOKEN" == "$PUBLISHER_TOKEN" ]; then
  echo "✅ Both services have consistent auth configuration"
  
  if [ "$HASHSVC_TOKEN" == "true" ]; then
    echo "✅ Auth is ENABLED on both services"
  else
    echo "⚠️  Auth is DISABLED on both services (acceptable for local dev)"
  fi
else
  echo "❌ FAIL: Auth configuration mismatch!"
  echo "   hashsvc: $HASHSVC_TOKEN"
  echo "   publisher: $PUBLISHER_TOKEN"
  exit 1
fi

echo ""
echo "Checking network configuration..."
PUBLISHER_NETWORK=$(docker compose exec -T publisher node -e "console.log(process.env.NETWORK)")
echo "  publisher network: $PUBLISHER_NETWORK"

PUBLISHER_BSV_NETWORK=$(docker compose exec -T publisher node -e "console.log(process.env.BSV_NETWORK)")
echo "  publisher BSV_NETWORK: $PUBLISHER_BSV_NETWORK"

if [ "$PUBLISHER_NETWORK" == "$PUBLISHER_BSV_NETWORK" ]; then
  echo "✅ Network configuration consistent"
else
  echo "⚠️  WARNING: NETWORK != BSV_NETWORK (may be intentional)"
fi

echo ""
echo "Checking stub mode..."
STUB_MODE=$(docker compose exec -T publisher node -e "console.log(process.env.TEST_PUBLISHER_STUB)")
echo "  TEST_PUBLISHER_STUB: $STUB_MODE"

if [ "$STUB_MODE" == "1" ] && [ "$PUBLISHER_NETWORK" == "mainnet" ]; then
  echo "⚠️  WARNING: Stub mode active on mainnet (no real transactions!)"
  echo "    This is OK for testing, but set TEST_PUBLISHER_STUB=0 for production"
elif [ "$STUB_MODE" == "0" ]; then
  echo "✅ Production mode - broadcasting to blockchain"
else
  echo "⚠️  Stub mode: $STUB_MODE"
fi

echo ""
echo "=== Environment verification complete ==="
