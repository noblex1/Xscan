#!/bin/bash

# NetWard AI - Start ML Service
# Quick start script for the ML service

set -e

echo "Starting NetWard AI ML Service..."
echo ""

cd ml-service

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run ./setup-ml.sh first"
    exit 1
fi

# Check if model exists
if [ ! -f "app/models/phishing_detector.pkl" ]; then
    echo "❌ ML model not found. Please run ./setup-ml.sh first"
    exit 1
fi

# Activate virtual environment
source venv/bin/activate

# Start service
echo "🚀 Starting ML service on http://localhost:5000"
echo "📊 API docs available at http://localhost:5000/docs"
echo ""
uvicorn app.main:app --reload --port 5000
