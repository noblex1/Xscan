#!/bin/bash
# Test Deployed ML Service

ML_URL="https://ml-service-yiwg.onrender.com"

echo "🧪 Testing Deployed ML Service"
echo "================================"
echo ""
echo "ML Service URL: $ML_URL"
echo ""

# Test 1: Health Check
echo "1️⃣ Testing Health Endpoint..."
HEALTH=$(curl -s "$ML_URL/health")
echo "Response: $HEALTH"
echo ""

# Check if model is loaded
if echo "$HEALTH" | grep -q '"model_loaded":true'; then
    echo "✅ Model is loaded and ready!"
else
    echo "❌ Model is NOT loaded"
    echo ""
    echo "🔧 Fix Required:"
    echo "   1. Go to Render Dashboard"
    echo "   2. Open your ML service"
    echo "   3. Go to Settings → Build Command"
    echo "   4. Ensure it says: pip install -r requirements.txt && python -m app.train_model"
    echo "   5. Manual Deploy → Clear build cache & deploy"
    echo ""
    echo "📖 See FIX_ML_SERVICE.md for detailed instructions"
    exit 1
fi

echo ""

# Test 2: Analyze URL
echo "2️⃣ Testing URL Analysis..."
RESULT=$(curl -s -X POST "$ML_URL/api/ml/analyze-url" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com"}')

if echo "$RESULT" | grep -q '"success":true'; then
    echo "✅ URL analysis working!"
    echo ""
    echo "Sample response:"
    echo "$RESULT" | python3 -m json.tool 2>/dev/null || echo "$RESULT"
else
    echo "❌ URL analysis failed"
    echo "Response: $RESULT"
fi

echo ""
echo "================================"
echo ""

# Summary
if echo "$HEALTH" | grep -q '"model_loaded":true'; then
    echo "✅ ML Service is fully operational!"
    echo ""
    echo "📋 Next Steps:"
    echo "   1. Add ML_SERVICE_URL to your backend environment:"
    echo "      ML_SERVICE_URL=$ML_URL"
    echo ""
    echo "   2. Redeploy your backend"
    echo ""
    echo "   3. Test in your frontend by scanning a URL"
    echo ""
else
    echo "⚠️  ML Service needs attention"
    echo ""
    echo "📖 See FIX_ML_SERVICE.md for instructions"
    echo ""
fi
