#!/bin/bash

# NetWard AI - ML Service Setup Script
# This script sets up and starts the ML service

set -e

echo "================================================"
echo "NetWard AI - ML Service Setup"
echo "================================================"
echo ""

# Check Python version
echo "[1/5] Checking Python version..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.9 or higher."
    exit 1
fi

PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1,2)
echo "✓ Found Python $PYTHON_VERSION"
echo ""

# Navigate to ML service directory
cd ml-service

# Create virtual environment
echo "[2/5] Creating virtual environment..."
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi
echo ""

# Activate virtual environment
echo "[3/5] Activating virtual environment..."
source venv/bin/activate
echo "✓ Virtual environment activated"
echo ""

# Install dependencies
echo "[4/5] Installing dependencies..."
pip install --upgrade pip > /dev/null 2>&1
pip install -r requirements.txt
echo "✓ Dependencies installed"
echo ""

# Train model
echo "[5/5] Training ML model..."
if [ ! -f "app/models/phishing_detector.pkl" ]; then
    echo "Training model (this may take a minute)..."
    python -m app.train_model
else
    echo "✓ Model already exists"
    read -p "Do you want to retrain the model? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        python -m app.train_model
    fi
fi
echo ""

echo "================================================"
echo "✓ ML Service Setup Complete!"
echo "================================================"
echo ""
echo "To start the ML service, run:"
echo "  cd ml-service"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload --port 5000"
echo ""
echo "Or use the start script:"
echo "  ./start-ml.sh"
echo ""
