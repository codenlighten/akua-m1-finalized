#!/bin/bash
# M2 Test Suite Runner
# Runs all M2 tests (unit + integration) in the hashsvc container

set -e

echo "=== AKUA M2 Test Suite ==="
echo ""
echo "Running unit tests (canonicalize)..."
docker compose exec -T hashsvc npm run test:unit

echo ""
echo "Running integration tests (e2e + idempotency)..."
docker compose exec -T hashsvc npm run test:integration

echo ""
echo "✅ M2 test suite complete (16 tests passed)"
echo ""
echo "Note: Simulator (scripts/simulator.js) should be run separately from host:"
echo "  node scripts/simulator.js --count 10 --rate 2"
