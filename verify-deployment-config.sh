#!/bin/bash
# Verify ML Service Deployment Configuration

echo "🔍 NetWard AI - Deployment Configuration Checker"
echo "================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ML service files exist
echo "1. Checking ML Service Files..."
if [ -f "ml-service/requirements.txt" ]; then
    echo -e "   ${GREEN}✓${NC} requirements.txt exists"
else
    echo -e "   ${RED}✗${NC} requirements.txt missing"
fi

if [ -f "ml-service/app/main.py" ]; then
    echo -e "   ${GREEN}✓${NC} main.py exists"
else
    echo -e "   ${RED}✗${NC} main.py missing"
fi

if [ -f "ml-service/app/train_model.py" ]; then
    echo -e "   ${GREEN}✓${NC} train_model.py exists"
else
    echo -e "   ${RED}✗${NC} train_model.py missing"
fi

if [ -f "ml-service/app/models/phishing_detector.pkl" ]; then
    echo -e "   ${GREEN}✓${NC} Model trained locally"
else
    echo -e "   ${YELLOW}⚠${NC} Model not trained locally (will train during deployment)"
fi

echo ""

# Check render.yaml
echo "2. Checking render.yaml Configuration..."
if [ -f "render.yaml" ]; then
    echo -e "   ${GREEN}✓${NC} render.yaml exists"
    
    if grep -q "netward-ai-ml" render.yaml; then
        echo -e "   ${GREEN}✓${NC} ML service configured in render.yaml"
    else
        echo -e "   ${RED}✗${NC} ML service NOT configured in render.yaml"
    fi
    
    if grep -q "ML_SERVICE_URL" render.yaml; then
        echo -e "   ${GREEN}✓${NC} ML_SERVICE_URL referenced in render.yaml"
    else
        echo -e "   ${YELLOW}⚠${NC} ML_SERVICE_URL not in render.yaml (add manually in Render dashboard)"
    fi
else
    echo -e "   ${YELLOW}⚠${NC} render.yaml not found (manual configuration needed)"
fi

echo ""

# Check backend configuration
echo "3. Checking Backend Configuration..."
if [ -f "backend/src/config/env.ts" ]; then
    if grep -q "ML_SERVICE_URL" backend/src/config/env.ts; then
        echo -e "   ${GREEN}✓${NC} Backend configured to use ML_SERVICE_URL"
    else
        echo -e "   ${RED}✗${NC} Backend not configured for ML service"
    fi
else
    echo -e "   ${RED}✗${NC} backend/src/config/env.ts not found"
fi

if [ -f "backend/src/services/mlService.ts" ]; then
    echo -e "   ${GREEN}✓${NC} ML service integration exists"
else
    echo -e "   ${RED}✗${NC} ML service integration missing"
fi

echo ""

# Check if services are running locally
echo "4. Checking Local Services (if running)..."

if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    ML_HEALTH=$(curl -s http://localhost:5000/health)
    echo -e "   ${GREEN}✓${NC} ML Service running locally"
    echo "     $ML_HEALTH"
else
    echo -e "   ${YELLOW}⚠${NC} ML Service not running locally (expected if not testing)"
fi

if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓${NC} Backend running locally"
else
    echo -e "   ${YELLOW}⚠${NC} Backend not running locally (expected if not testing)"
fi

echo ""
echo "================================================"
echo ""

# Summary and next steps
echo "📋 Deployment Checklist:"
echo ""
echo "Before deploying:"
echo "  [ ] All ML service files exist"
echo "  [ ] render.yaml includes ML service"
echo "  [ ] Backend is configured for ML integration"
echo ""
echo "To deploy on Render:"
echo "  1. Push code to GitHub"
echo "  2. Go to Render Dashboard"
echo "  3. Create new Web Service for ML"
echo "  4. Configure as per ML_DEPLOYMENT_CHECKLIST.md"
echo "  5. Add ML_SERVICE_URL to backend environment"
echo ""
echo "After deployment:"
echo "  [ ] Test ML service health endpoint"
echo "  [ ] Test backend integration"
echo "  [ ] Test in frontend"
echo ""
echo "📖 See ML_DEPLOYMENT_CHECKLIST.md for detailed steps"
echo ""
