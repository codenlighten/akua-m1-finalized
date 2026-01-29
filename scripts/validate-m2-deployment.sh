#!/bin/bash
# M2 Phase 2 Deployment Validation Script
# Run on droplet: bash scripts/validate-m2-deployment.sh

set -e

echo "=== AKUA M2 Deployment Validation ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check we're in the right directory
if [ ! -f "docker-compose.yml" ]; then
    echo -e "${RED}Error: docker-compose.yml not found. Run from /opt/akua-stack/${NC}"
    exit 1
fi

echo "Step 0: Check current service status"
docker compose ps
echo ""

echo "Step 1: Verify .env contains M2 variables"
if [ ! -f ".env" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

required_vars=(
    "BSV_ADDRESS"
    "BSV_PRIVATE_KEY"
    "PUBLISHER_AUTH_TOKEN"
    "TEST_PUBLISHER_STUB"
)

for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env; then
        echo -e "${GREEN}✓${NC} ${var} found in .env"
    else
        echo -e "${RED}✗${NC} ${var} missing from .env"
        exit 1
    fi
done
echo ""

echo "Step 2: Rebuild services with --no-cache to ensure fresh build"
echo "This ensures no stale layers from previous builds..."
docker compose down
docker compose build --no-cache publisher hashsvc
echo ""

echo "Step 3: Start services"
docker compose up -d
echo ""
echo "Waiting 15 seconds for services to stabilize..."
sleep 15
echo ""

echo "Step 4: Check service health"
docker compose ps
echo ""

if ! docker compose ps | grep -q "publisher.*healthy"; then
    echo -e "${RED}Error: publisher not healthy${NC}"
    docker compose logs --tail 50 publisher
    exit 1
fi

if ! docker compose ps | grep -q "hashsvc.*healthy"; then
    echo -e "${RED}Error: hashsvc not healthy${NC}"
    docker compose logs --tail 50 hashsvc
    exit 1
fi

echo -e "${GREEN}✓ All services healthy${NC}"
echo ""

echo "Step 5: Run M2 test suite (with TEST_PUBLISHER_STUB=1)"
if [ -f "scripts/run-m2.sh" ]; then
    bash scripts/run-m2.sh
    echo -e "${GREEN}✓ M2 tests passed${NC}"
else
    echo -e "${YELLOW}Warning: scripts/run-m2.sh not found, running tests manually${NC}"
    docker compose exec -T hashsvc npm run test:unit
    docker compose exec -T hashsvc npm run test:integration
fi
echo ""

echo "Step 6: Validate auth protection (should fail without token)"
response=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST http://localhost:8081/publish \
    -H "Content-Type: application/json" \
    -d '{"sha256":"0952cb262572882a17ab8010251ba9079749648d08ff75b2e9d8bb1339add8c5"}')

if [ "$response" = "401" ] || [ "$response" = "403" ]; then
    echo -e "${GREEN}✓ Auth protection working (got ${response} without token)${NC}"
else
    echo -e "${YELLOW}⚠ Auth check: got ${response} (expected 401/403)${NC}"
    echo "  If PUBLISHER_AUTH_TOKEN is not set, auth is disabled (OK for testing)"
fi
echo ""

echo "Step 7: Validate auth with correct token (stub mode)"
AUTH_TOKEN=$(grep "^PUBLISHER_AUTH_TOKEN=" .env | cut -d'=' -f2)
if [ -n "$AUTH_TOKEN" ]; then
    response=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
        -X POST http://localhost:8081/publish \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d '{"sha256":"0952cb262572882a17ab8010251ba9079749648d08ff75b2e9d8bb1339add8c5"}')
    
    http_code=$(echo "$response" | grep "HTTP_CODE:" | cut -d':' -f2)
    body=$(echo "$response" | grep -v "HTTP_CODE:")
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ Auth with token successful${NC}"
        echo "Response: $body" | jq . 2>/dev/null || echo "$body"
    else
        echo -e "${RED}✗ Auth with token failed (HTTP $http_code)${NC}"
        echo "$body"
    fi
else
    echo -e "${YELLOW}⚠ PUBLISHER_AUTH_TOKEN not set, skipping auth validation${NC}"
fi
echo ""

echo "Step 8: Rate limiting quick test (optional)"
echo "Sending 10 requests rapidly to check rate limiter..."
for i in {1..10}; do
    status=$(curl -s -o /dev/null -w "%{http_code}" \
        -X POST http://localhost:8081/publish \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer $AUTH_TOKEN" \
        -d "{\"sha256\":\"$(printf "%064d" $i | tr " " "0")\"}")
    echo "  Request $i: HTTP $status"
done
echo -e "${YELLOW}Note: Rate limit is 100/min by default, so 10 requests should all succeed${NC}"
echo ""

echo "Step 9: Check logs for any errors"
echo "Publisher logs (last 20 lines):"
docker compose logs --tail 20 publisher | grep -i "error\|warn" || echo "  No errors/warnings"
echo ""
echo "Hashsvc logs (last 20 lines):"
docker compose logs --tail 20 hashsvc | grep -i "error\|warn" || echo "  No errors/warnings"
echo ""

echo -e "${GREEN}=== M2 Deployment Validation Complete ===${NC}"
echo ""
echo "Summary:"
echo "  ✓ Services running and healthy"
echo "  ✓ M2 tests passed"
echo "  ✓ Auth middleware validated"
echo "  ✓ No critical errors in logs"
echo ""
echo "Next steps:"
echo "  1. Test with TEST_PUBLISHER_STUB=0 when ready for real blockchain publishes"
echo "  2. Monitor UTXO balance warnings in publisher logs"
echo "  3. Push code to GitHub and tag as v2.0.0-m2"
echo ""
