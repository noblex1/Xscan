#!/bin/bash
# Test ML Service Keep-Alive and Cold Start Handling

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ML_SERVICE_URL="${ML_SERVICE_URL:-https://xscan-hx2f.onrender.com}"
BACKEND_URL="${BACKEND_URL:-http://localhost:3000}"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Catchers AI - ML Service Test Suite                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Test 1: Check ML Service Health
echo -e "${YELLOW}Test 1: ML Service Health Check${NC}"
echo "URL: $ML_SERVICE_URL/health"
echo ""

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$ML_SERVICE_URL/health" 2>&1)
HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ ML Service is responding${NC}"
    echo "Response: $HEALTH_BODY"
    
    # Check if model is loaded
    if echo "$HEALTH_BODY" | grep -q '"model_loaded":true'; then
        echo -e "${GREEN}✓ Model is loaded${NC}"
    else
        echo -e "${RED}✗ Model is NOT loaded${NC}"
    fi
else
    echo -e "${RED}✗ ML Service is not responding (HTTP $HTTP_CODE)${NC}"
    echo "This might be a cold start. Waiting 30 seconds..."
    sleep 30
    
    # Retry
    HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$ML_SERVICE_URL/health" 2>&1)
    HTTP_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ ML Service woke up successfully${NC}"
    else
        echo -e "${RED}✗ ML Service still not responding${NC}"
        exit 1
    fi
fi

echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Test 2: Test Keep-Alive Endpoint
echo -e "${YELLOW}Test 2: Keep-Alive Endpoint${NC}"
echo "URL: $ML_SERVICE_URL/keep-alive"
echo ""

KEEPALIVE_RESPONSE=$(curl -s -w "\n%{http_code}" "$ML_SERVICE_URL/keep-alive" 2>&1)
HTTP_CODE=$(echo "$KEEPALIVE_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Keep-alive endpoint is working${NC}"
    echo "Response: $(echo "$KEEPALIVE_RESPONSE" | head -n-1)"
else
    echo -e "${RED}✗ Keep-alive endpoint failed (HTTP $HTTP_CODE)${NC}"
fi

echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Test 3: Test URL Analysis
echo -e "${YELLOW}Test 3: URL Analysis${NC}"
echo "Testing with: https://google.com"
echo ""

ANALYSIS_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$ML_SERVICE_URL/api/ml/analyze-url" \
    -H "Content-Type: application/json" \
    -d '{"url":"https://google.com"}' 2>&1)
HTTP_CODE=$(echo "$ANALYSIS_RESPONSE" | tail -n1)
ANALYSIS_BODY=$(echo "$ANALYSIS_RESPONSE" | head -n-1)

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ URL analysis is working${NC}"
    
    # Check if it's a threat
    if echo "$ANALYSIS_BODY" | grep -q '"is_threat":false'; then
        echo -e "${GREEN}✓ Correctly identified as safe${NC}"
    elif echo "$ANALYSIS_BODY" | grep -q '"is_threat":true'; then
        echo -e "${YELLOW}⚠ Identified as threat (unexpected for google.com)${NC}"
    fi
    
    # Show confidence
    CONFIDENCE=$(echo "$ANALYSIS_BODY" | grep -o '"confidence":[0-9.]*' | cut -d':' -f2)
    if [ -n "$CONFIDENCE" ]; then
        echo "Confidence: $CONFIDENCE"
    fi
else
    echo -e "${RED}✗ URL analysis failed (HTTP $HTTP_CODE)${NC}"
    echo "Response: $ANALYSIS_BODY"
fi

echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Test 4: Response Time Test
echo -e "${YELLOW}Test 4: Response Time Test${NC}"
echo "Measuring response time for 3 consecutive requests..."
echo ""

for i in 1 2 3; do
    START_TIME=$(date +%s%N)
    curl -s "$ML_SERVICE_URL/health" > /dev/null
    END_TIME=$(date +%s%N)
    
    DURATION=$((($END_TIME - $START_TIME) / 1000000))
    echo "Request $i: ${DURATION}ms"
    
    if [ $DURATION -lt 1000 ]; then
        echo -e "${GREEN}✓ Fast response${NC}"
    elif [ $DURATION -lt 5000 ]; then
        echo -e "${YELLOW}⚠ Moderate response${NC}"
    else
        echo -e "${RED}✗ Slow response (possible cold start)${NC}"
    fi
    
    sleep 1
done

echo ""
echo "─────────────────────────────────────────────────────────"
echo ""

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Test Summary                                         ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo "ML Service URL: $ML_SERVICE_URL"
echo ""
echo "Next Steps:"
echo "1. Set up UptimeRobot to ping: $ML_SERVICE_URL/health"
echo "2. Monitor backend logs for keep-alive messages"
echo "3. Test after 20 minutes of inactivity"
echo ""
echo -e "${GREEN}✓ Testing complete${NC}"
