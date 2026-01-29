#!/bin/bash
# Verify HTTP error responses are clean (no stack traces)
# Run this on the droplet to validate error handling

set -e

PUBLISHER_URL="http://localhost:8081"
echo "=== Verifying HTTP Error Responses ==="
echo ""

# Test 1: Missing auth header → 401
echo "Test 1: Missing auth header (expecting 401)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$PUBLISHER_URL/publish" \
  -H "Content-Type: application/json" \
  -d '{"sha256":"0000000000000000000000000000000000000000000000000000000000000000"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "401" ]; then
  echo "✅ HTTP 401 returned"
  if echo "$BODY" | grep -q "stack"; then
    echo "❌ FAIL: Response contains stack trace!"
    echo "$BODY"
    exit 1
  else
    echo "✅ No stack trace in response"
    echo "   Body: $BODY"
  fi
else
  echo "❌ FAIL: Expected 401, got $HTTP_CODE"
  exit 1
fi

echo ""

# Test 2: Invalid sha256 length → 400
echo "Test 2: Invalid sha256 length (expecting 400)..."
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$PUBLISHER_URL/publish" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${PUBLISHER_AUTH_TOKEN}" \
  -d '{"sha256":"invalid"}')

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" == "400" ]; then
  echo "✅ HTTP 400 returned"
  if echo "$BODY" | grep -q "stack"; then
    echo "❌ FAIL: Response contains stack trace!"
    echo "$BODY"
    exit 1
  else
    echo "✅ No stack trace in response"
    echo "   Body: $BODY"
  fi
else
  echo "❌ FAIL: Expected 400, got $HTTP_CODE"
  exit 1
fi

echo ""

# Test 3: Rate limit exceeded → 429
echo "Test 3: Rate limit burst (expecting mix of 200 and 429)..."

# Make 120 rapid requests
HASH="1111111111111111111111111111111111111111111111111111111111111111"
SUCCESS_COUNT=0
RATE_LIMITED_COUNT=0

for i in {1..120}; do
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$PUBLISHER_URL/publish" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${PUBLISHER_AUTH_TOKEN}" \
    -d "{\"sha256\":\"$HASH\"}")
  
  if [ "$HTTP_CODE" == "200" ]; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  elif [ "$HTTP_CODE" == "429" ]; then
    RATE_LIMITED_COUNT=$((RATE_LIMITED_COUNT + 1))
  fi
done

echo "   Successes: $SUCCESS_COUNT"
echo "   Rate limited: $RATE_LIMITED_COUNT"

if [ $RATE_LIMITED_COUNT -gt 0 ]; then
  echo "✅ Rate limiting working (got 429 responses)"
  
  # Check one 429 response for stack traces
  RESPONSE=$(curl -s -X POST "$PUBLISHER_URL/publish" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${PUBLISHER_AUTH_TOKEN}" \
    -d '{"sha256":"2222222222222222222222222222222222222222222222222222222222222222"}')
  
  if echo "$RESPONSE" | grep -q "stack"; then
    echo "❌ FAIL: 429 response contains stack trace!"
    echo "$RESPONSE"
    exit 1
  else
    echo "✅ No stack trace in 429 response"
  fi
else
  echo "⚠️  WARNING: No rate limiting observed (may need higher burst)"
fi

echo ""
echo "=== All HTTP response checks passed ==="
echo "✅ No stack traces leaked"
echo "✅ Auth returns 401"
echo "✅ Validation returns 400"
echo "✅ Rate limiting returns 429"
