# 🚨 IMMEDIATE FIX - ML Service Offline

## Current Status
✅ ML service code is correct locally
✅ Model file exists
❌ **ML service on Render is completely down (not just sleeping)**

## Immediate Actions Required

### Step 1: Check Render Dashboard (2 minutes)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Find your ML service: `catchers-ai-ml` or `xscan-hx2f`
3. Check the status:
   - **If "Suspended"**: Service was suspended (free tier limit reached)
   - **If "Failed"**: Service crashed during deployment
   - **If "Running"**: Service thinks it's running but isn't responding

### Step 2: Check Render Logs (1 minute)

1. Click on the ML service in Render dashboard
2. Go to "Logs" tab
3. Look for errors:
   - Memory errors (OOM killed)
   - Python errors
   - Model loading errors
   - Port binding errors

### Step 3: Immediate Fix Options

#### Option A: Manual Redeploy (Fastest - 2 minutes)

1. In Render dashboard, select ML service
2. Click "Manual Deploy" → "Clear build cache & deploy"
3. Wait 3-5 minutes for deployment
4. Check logs for successful startup
5. Test: Visit `https://xscan-hx2f.onrender.com/health`

#### Option B: Deploy with Fixes (Recommended - 5 minutes)

```bash
# 1. Commit all the fixes we made
git add .
git commit -m "Fix: ML service cold start handling and keep-alive"
git push origin main

# 2. Render will auto-deploy (or trigger manually)
# 3. Wait 3-5 minutes
# 4. Test the service
```

#### Option C: Restart Service (If running but not responding)

1. In Render dashboard, select ML service
2. Click "Manual Deploy" → "Deploy latest commit"
3. Or use the "Restart" button if available

## Common Issues & Fixes

### Issue 1: Service Suspended (Free Tier Limit)

**Symptoms:**
- Status shows "Suspended"
- Can't access the service

**Fix:**
- Upgrade to Starter plan ($7/month)
- Or wait until next month (free tier resets)
- Or deploy to a different platform (Railway, Fly.io)

### Issue 2: Build Failed

**Symptoms:**
- Status shows "Build failed" or "Deploy failed"
- Logs show Python errors

**Fix:**
```bash
# Check if requirements.txt is correct
cd ml-service
cat requirements.txt

# Test locally first
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.train_model
uvicorn app.main:app --reload
```

### Issue 3: Model Training Failed

**Symptoms:**
- Build succeeds but service crashes on startup
- Logs show "Model file not found"

**Fix:**
1. Check if `train_model.py` runs successfully
2. Verify model file is created during build
3. Check Render build logs for training errors

### Issue 4: Memory Limit (OOM Killed)

**Symptoms:**
- Logs show "Killed" or "Out of memory"
- Service crashes randomly

**Fix:**
- Reduce training data size
- Upgrade to Starter plan (more memory)
- Optimize model complexity

### Issue 5: Port Binding Error

**Symptoms:**
- Logs show "Address already in use"
- Service fails to start

**Fix:**
- Ensure `startCommand` uses `$PORT` variable
- Check render.yaml: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

## Quick Test After Fix

```bash
# Test 1: Health check
curl https://xscan-hx2f.onrender.com/health

# Expected response:
# {"status":"healthy","model_loaded":true,"model_version":"1.0.0"}

# Test 2: Keep-alive endpoint
curl https://xscan-hx2f.onrender.com/keep-alive

# Expected response:
# {"status":"alive","timestamp":"2026-04-26T..."}

# Test 3: URL analysis
curl -X POST https://xscan-hx2f.onrender.com/api/ml/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com"}'

# Expected: JSON response with threat analysis
```

## Alternative: Deploy to Different Platform

If Render continues to have issues, consider these alternatives:

### Railway (Recommended)
- $5 credit/month free
- No sleep/spin-down
- Better reliability
- Easy migration

### Fly.io
- 3 VMs free
- No sleep
- Good for Python
- Global deployment

### Heroku
- Free tier available
- Similar to Render
- Well-documented

## Temporary Workaround

While fixing the ML service, your app will still work using **rule-based detection** (fallback mode). The backend automatically falls back when ML service is unavailable.

**What still works:**
- ✅ URL scanning
- ✅ Threat detection (rule-based)
- ✅ VirusTotal integration
- ✅ Google Safe Browsing
- ✅ WHOIS analysis
- ✅ Redirect detection

**What's missing:**
- ❌ ML confidence scores
- ❌ Feature importance analysis
- ❌ Advanced ML predictions

## Step-by-Step Recovery Plan

### Phase 1: Immediate (Now)
1. ⏳ Check Render dashboard status
2. ⏳ Review Render logs for errors
3. ⏳ Trigger manual redeploy
4. ⏳ Wait 3-5 minutes
5. ⏳ Test health endpoint

### Phase 2: Deploy Fixes (After service is up)
1. ⏳ Commit and push all changes
2. ⏳ Deploy to Render
3. ⏳ Verify keep-alive is working
4. ⏳ Monitor for 24 hours

### Phase 3: Long-term (Optional)
1. ⏳ Set up UptimeRobot monitoring
2. ⏳ Consider upgrading to Starter plan
3. ⏳ Or migrate to Railway/Fly.io

## What to Check in Render Dashboard

### Service Status
- [ ] Service is "Running" (not Suspended/Failed)
- [ ] Last deployment was successful
- [ ] No error messages in status

### Logs
- [ ] "Application startup complete" message
- [ ] "Model loaded successfully" message
- [ ] No Python errors or tracebacks
- [ ] No memory errors (OOM)

### Environment Variables
- [ ] PORT is set (usually auto-set by Render)
- [ ] PYTHON_VERSION is 3.11
- [ ] No missing required variables

### Build Logs
- [ ] Dependencies installed successfully
- [ ] Model training completed
- [ ] No build errors

## Contact Render Support

If the service is suspended or you can't fix it:

1. Go to Render dashboard
2. Click "Help" or "Support"
3. Explain the issue:
   - "ML service is not responding"
   - "Service appears down despite showing as running"
   - "Need help debugging deployment"

## Next Steps After Service is Up

1. ✅ Verify service is responding
2. ✅ Deploy the keep-alive fixes
3. ✅ Set up monitoring (UptimeRobot)
4. ✅ Monitor logs for 24 hours
5. ✅ Consider upgrade if issues persist

## Emergency: Deploy Locally

If you need the ML service working immediately:

```bash
# Run ML service locally
cd ml-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m app.train_model
uvicorn app.main:app --host 0.0.0.0 --port 5000

# Update backend .env to use local ML service
# backend/.env:
ML_SERVICE_URL=http://localhost:5000

# Run backend
cd backend
npm install
npm run dev
```

## Summary

**Immediate Action:** Go to Render dashboard and manually redeploy the ML service.

**After it's up:** Deploy all the fixes we made to prevent future issues.

**Long-term:** Set up monitoring and consider upgrading or migrating.

---

**The service is likely just crashed/suspended, not a code issue. A manual redeploy should fix it immediately.**
