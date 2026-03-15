#!/bin/bash
# Check status of all NetWard AI services

echo "🔍 NetWard AI - Service Status Check"
echo "===================================="
echo ""

# Check ML Service
echo "1. ML Service (Port 5000):"
if curl -s http://localhost:5000/health > /dev/null 2>&1; then
    ML_STATUS=$(curl -s http://localhost:5000/health)
    echo "   ✅ Running"
    echo "   Status: $ML_STATUS"
else
    echo "   ❌ Not running"
    echo "   Start with: cd ml-service && ./start.sh"
fi
echo ""

# Check Backend
echo "2. Backend API (Port 3000):"
if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "   ✅ Running"
else
    echo "   ❌ Not running"
    echo "   Start with: cd backend && npm run dev"
fi
echo ""

# Check Frontend
echo "3. Frontend (Port 8080):"
if curl -s http://localhost:8080 > /dev/null 2>&1; then
    echo "   ✅ Running"
else
    echo "   ❌ Not running"
    echo "   Start with: npm run dev"
fi
echo ""

echo "===================================="
echo "💡 To start all services:"
echo "   1. Terminal 1: cd ml-service && ./start.sh"
echo "   2. Terminal 2: cd backend && npm run dev"
echo "   3. Terminal 3: npm run dev"
echo ""
echo "   Then visit: http://localhost:8080"
