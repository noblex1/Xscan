#!/bin/bash
# Start the ML service for NetWard AI

echo "🚀 Starting NetWard AI ML Service..."
echo ""

# Activate virtual environment
source venv/bin/activate

# Start the service
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
