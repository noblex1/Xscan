#!/bin/bash

# NetWard AI - Test ML Integration
# Quick test script to verify ML service is working

set -e

echo "================================================"
echo "NetWard AI - ML Integration Test"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: ML Service Health
echo "[1/4] Testing ML Service Health..."
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    HEALTH=$(curl -s http://localhost:5000/health)
    if echo "$HEALTH" | grep -q '"status":"healthy"'; then
        echo -e "${GREEN}✓ ML Service is healthy${NC}"
    else
        echo -e "${YELLOW}⚠ ML Service is running but degraded${NC}"
        echo "$HEALTH"
    fi
else
    echo -e "${RED}✗ ML Service is not running${NC}"
    echo "Please start ML service with: ./start-ml.sh"
    exit 1
fi
echo ""

# Test 2: ML Model Info
echo "[2/4] Testing ML Model Info..."
MODEL_INFO=$(curl -s http://localhost:5000/api/ml/model-info)
if echo "$MODEL_INFO" | grep -q '"model_loaded":true'; then
    echo -e "${GREEN}✓ ML Model is loaded${NC}"
    echo "$MODEL_INFO" | grep -o '"model_version":"[^"]*"' | cut -d'"' -f4 | xargs -I {} echo "  Model Version: {}"
    echo "$MODEL_INFO" | grep -o '"accuracy":[0-9.]*' | cut -d':' -f2 | xargs -I {} echo "  Accuracy: {}%"
else
    echo -e "${RED}✗ ML Model is not loaded${NC}"
    exit 1
fi
echo ""

# Test 3: Analyze Safe URL
echo "[3/4] Testing Safe URL Analysis..."
SAFE_RESULT=$(curl -s -X POST http://localhost:5000/api/ml/analyze-url \
    -H "Content-Type: application/json" \
    -d '{"url":"https://google.com"}')

if echo "$SAFE_RESULT" | grep -q '"success":true'; then
    IS_THREAT=$(echo "$SAFE_RESULT" | grep -o '"is_threat":[^,]*' | cut -d':' -f2)
    CONFIDENCE=$(echo "$SAFE_RESULT" | grep -o '"confidence":[0-9.]*' | cut -d':' -f2)
    
    if [ "$IS_THREAT" = "false" ]; then
        echo -e "${GREEN}✓ Correctly identified as safe${NC}"
        echo "  Confidence: $CONFIDENCE"
    else
        echo -e "${YELLOW}⚠ Incorrectly flagged as threat${NC}"
    fi
else
    echo -e "${RED}✗ Analysis failed${NC}"
    exit 1
fi
echo ""

# Test 4: Analyze Suspicious URL
echo "[4/4] Testing Suspicious URL Analysis..."
THREAT_RESULT=$(curl -s -X POST http://localhost:5000/api/ml/analyze-url \
    -H "Content-Type: application/json" \
    -d '{"url":"http://suspicious-phishing-site.tk/verify-account-urgent"}')

if echo "$THREAT_RESULT" | grep -q '"success":true'; then
    IS_THREAT=$(echo "$THREAT_RESULT" | grep -o '"is_threat":[^,]*' | cut -d':' -f2)
    ML_SCORE=$(echo "$THREAT_RESULT" | grep -o '"ml_score":[0-9]*' | cut -d':' -f2)
    
    if [ "$IS_THREAT" = "true" ]; then
        echo -e "${GREEN}✓ Correctly identified as threat${NC}"
        echo "  ML Score: $ML_SCORE/100"
    else
        echo -e "${YELLOW}⚠ Did not flag as threat (ML Score: $ML_SCORE)${NC}"
    fi
else
    echo -e "${RED}✗ Analysis failed${NC}"
    exit 1
fi
echo ""

# Test 5: Backend Integration (if backend is running)
echo "[5/5] Testing Backend Integration..."
if curl -s http://localhost:3000/health > /dev/null 2>&1; then
    BACKEND_RESULT=$(curl -s -X POST http://localhost:3000/api/v1/threats/analyze-url \
        -H "Content-Type: application/json" \
        -d '{"url":"https://google.com"}')
    
    if echo "$BACKEND_RESULT" | grep -q '"success":true'; then
        echo -e "${GREEN}✓ Backend integration working${NC}"
        
        # Check if ML analysis is included
        if echo "$BACKEND_RESULT" | grep -q "Machine Learning Analysis"; then
            echo -e "${GREEN}✓ ML analysis included in backend response${NC}"
        else
            echo -e "${YELLOW}⚠ ML analysis not found in backend response${NC}"
        fi
    else
        echo -e "${RED}✗ Backend analysis failed${NC}"
    fi
else
    echo -e "${YELLOW}⚠ Backend is not running (skipping integration test)${NC}"
    echo "  Start backend with: cd backend && npm run dev"
fi
echo ""

echo "================================================"
echo -e "${GREEN}✓ ML Integration Tests Complete!${NC}"
echo "================================================"
echo ""
echo "Next steps:"
echo "  1. Start backend: cd backend && npm run dev"
echo "  2. Start frontend: npm run dev"
echo "  3. Test in browser: http://localhost:8080"
echo ""
