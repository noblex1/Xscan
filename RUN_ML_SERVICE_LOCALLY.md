# 🏃 Run ML Service Locally - Quick Setup

## Why Run Locally?

While you fix the Render deployment, you can run the ML service locally to:
- ✅ Test your application immediately
- ✅ Verify the ML service code works
- ✅ Debug any issues
- ✅ Develop without depending on Render

## Quick Start (5 minutes)

### Step 1: Set Up Python Environment

```bash
# Navigate to ML service directory
cd ml-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
venv\Scripts\Activate.ps1

# On Windows (CMD):
venv\Scripts\activate.bat

# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Step 2: Train the Model

```bash
# Still in ml-service directory
python -m app.train_model
```

**Expected output:**
```
Training phishing detection model...
✓ Model trained successfully
✓ Model saved to app/models/phishing_detector.pkl
```

### Step 3: Start the ML Service

```bash
# Start the service
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

**Expected output:**
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:5000
```

### Step 4: Test the Service

Open a new terminal and test:

```bash
# Test health endpoint
curl http://localhost:5000/health

# Expected response:
# {"status":"healthy","model_loaded":true,"model_version":"1.0.0"}

# Test URL analysis
curl -X POST http://localhost:5000/api/ml/analyze-url \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"https://google.com\"}"
```

### Step 5: Update Backend to Use Local ML Service

```bash
# Edit backend/.env
cd ../backend
```

Update `backend/.env`:
```env
# Change this line:
ML_SERVICE_URL=https://xscan-hx2f.onrender.com

# To this:
ML_SERVICE_URL=http://localhost:5000
```

### Step 6: Start Backend

```bash
# In backend directory
npm install
npm run dev
```

### Step 7: Test Full Stack

1. Open your frontend (usually http://localhost:8080)
2. Try scanning a URL
3. Should see "ML online" status
4. Scans should include ML confidence scores

## Troubleshooting

### Issue: Python not found

**Fix:**
```bash
# Install Python 3.11
# Windows: Download from python.org
# Mac: brew install python@3.11
# Linux: sudo apt install python3.11
```

### Issue: pip install fails

**Fix:**
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Try again
pip install -r requirements.txt
```

### Issue: Model training fails

**Fix:**
```bash
# Check if scikit-learn is installed
pip list | grep scikit-learn

# Reinstall if needed
pip install scikit-learn==1.4.0
```

### Issue: Port 5000 already in use

**Fix:**
```bash
# Use a different port
uvicorn app.main:app --host 0.0.0.0 --port 5001 --reload

# Update backend/.env:
ML_SERVICE_URL=http://localhost:5001
```

### Issue: Backend can't connect to ML service

**Check:**
1. ML service is running (check terminal)
2. No firewall blocking port 5000
3. `ML_SERVICE_URL` in backend/.env is correct
4. Both services are running

## Development Workflow

### Terminal 1: ML Service
```bash
cd ml-service
venv\Scripts\Activate.ps1  # Windows
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```

### Terminal 2: Backend
```bash
cd backend
npm run dev
```

### Terminal 3: Frontend (if needed)
```bash
cd client
npm run dev
```

## Testing the ML Service

### Test 1: Health Check
```bash
curl http://localhost:5000/health
```

### Test 2: Keep-Alive
```bash
curl http://localhost:5000/keep-alive
```

### Test 3: Analyze Safe URL
```bash
curl -X POST http://localhost:5000/api/ml/analyze-url \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"https://google.com\"}"
```

### Test 4: Analyze Suspicious URL
```bash
curl -X POST http://localhost:5000/api/ml/analyze-url \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"http://192.168.1.1@evil.com/login\"}"
```

### Test 5: Model Info
```bash
curl http://localhost:5000/api/ml/model-info
```

## Switching Back to Render

When Render is fixed, switch back:

```bash
# Edit backend/.env
# Change:
ML_SERVICE_URL=http://localhost:5000

# Back to:
ML_SERVICE_URL=https://xscan-hx2f.onrender.com

# Restart backend
npm run dev
```

## Performance Comparison

| Environment | Response Time | Reliability | Cost |
|-------------|---------------|-------------|------|
| **Local** | <100ms | 100% | $0 |
| **Render Free** | 50ms-60s | ~95% | $0 |
| **Render Starter** | <200ms | 99.9% | $7/mo |

## Benefits of Local Development

- ✅ Instant response times
- ✅ No cold starts
- ✅ Easy debugging
- ✅ No internet required
- ✅ Free
- ✅ Full control

## When to Use Local vs Render

### Use Local When:
- Developing new features
- Testing changes
- Debugging issues
- Render is down
- Need fast iteration

### Use Render When:
- Production deployment
- Sharing with others
- Testing real-world performance
- Need public access
- Final testing before release

## Production Checklist

Before deploying to production:

- [ ] Test locally first
- [ ] Verify model trains successfully
- [ ] Test all endpoints
- [ ] Check response times
- [ ] Verify error handling
- [ ] Test with various URLs
- [ ] Check logs for errors
- [ ] Deploy to Render
- [ ] Test production endpoint
- [ ] Set up monitoring

## Quick Commands Reference

```bash
# Start ML service
cd ml-service && venv\Scripts\Activate.ps1 && uvicorn app.main:app --reload

# Start backend
cd backend && npm run dev

# Test ML service
curl http://localhost:5000/health

# Train model
cd ml-service && python -m app.train_model

# Install dependencies
cd ml-service && pip install -r requirements.txt
```

## Next Steps

1. ✅ Get ML service running locally
2. ✅ Test your application
3. ⏳ Fix Render deployment
4. ⏳ Deploy fixes to Render
5. ⏳ Switch back to Render URL
6. ⏳ Set up monitoring

---

**You can have the ML service working locally in 5 minutes while you fix Render!**
