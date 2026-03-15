# Fix ML Service Deployment

## Issue Detected

Your ML service is running at `https://ml-service-yiwg.onrender.com` but the model is not loaded:

```json
{
  "status": "degraded",
  "model_loaded": false
}
```

This means the model wasn't trained during the build process.

---

## Quick Fix (5 minutes)

### Option 1: Redeploy with Correct Build Command

1. **Go to Render Dashboard**
2. **Open your ML service:** `ml-service-yiwg`
3. **Go to Settings**
4. **Find "Build Command"**
5. **Make sure it says:**
   ```bash
   pip install -r requirements.txt && python -m app.train_model
   ```
6. **Click "Save Changes"**
7. **Go to "Manual Deploy" → "Clear build cache & deploy"**

This will retrain the model during deployment.

---

### Option 2: Manual Deploy (If Option 1 Doesn't Work)

If the build command is correct but model still not loading:

1. **Check Build Logs:**
   - Go to your ML service in Render
   - Click on latest deploy
   - Look for errors in the build logs
   - Search for "Training complete" message

2. **Common Issues:**

   **Issue A: Python Version**
   - Go to Environment tab
   - Add variable: `PYTHON_VERSION` = `3.11`
   - Redeploy

   **Issue B: Memory Limit**
   - Free tier might run out of memory during training
   - Upgrade to Starter plan ($7/month)
   - Or reduce training samples in `train_model.py`

   **Issue C: Build Timeout**
   - Training takes too long on free tier
   - Upgrade to Starter plan
   - Or reduce model complexity

---

## Verify Fix

After redeploying, test the health endpoint:

```bash
curl https://ml-service-yiwg.onrender.com/health
```

**Should return:**
```json
{
  "status": "healthy",
  "model_loaded": true,
  "model_version": "1.0.0"
}
```

---

## Configure Backend (After ML Service is Fixed)

Once the ML service shows `"model_loaded": true`, configure your backend:

### If Backend is on Render:

1. **Go to your Backend Service in Render**
2. **Click "Environment" in sidebar**
3. **Add or update environment variable:**
   ```
   Key: ML_SERVICE_URL
   Value: https://ml-service-yiwg.onrender.com
   ```
4. **Click "Save Changes"**
5. **Backend will automatically redeploy**

### If Backend is Elsewhere:

Add this environment variable wherever your backend is deployed:
```
ML_SERVICE_URL=https://ml-service-yiwg.onrender.com
```

---

## Test Complete Integration

### 1. Test ML Service Directly:

```bash
curl -X POST https://ml-service-yiwg.onrender.com/api/ml/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com"}'
```

**Should return ML prediction with confidence scores**

### 2. Test Backend Integration:

```bash
curl -X POST https://your-backend-url.com/api/v1/threats/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com"}'
```

**Look for:** "Machine Learning Analysis" in `detectionMethods`

### 3. Test in Frontend:

1. Open your deployed frontend
2. Scan any URL (e.g., `https://google.com`)
3. Check results include:
   - "Machine Learning Analysis" in detection methods
   - ML confidence percentage in AI analysis

---

## Troubleshooting

### Model Still Not Loading After Redeploy

**Check Build Logs for Errors:**

1. Go to ML service in Render
2. Click on latest deploy
3. Look for Python errors
4. Common errors:

   **"No module named 'sklearn'"**
   - Requirements not installed properly
   - Check `requirements.txt` exists in `ml-service/` folder

   **"Memory error" or "Killed"**
   - Free tier ran out of memory
   - Solution: Upgrade to Starter plan or reduce training data

   **"Command not found: python"**
   - Wrong Python version
   - Add `PYTHON_VERSION=3.11` environment variable

### Backend Can't Connect to ML Service

**Error:** "ML Service unavailable"

**Check:**
1. ML service health shows `model_loaded: true`
2. `ML_SERVICE_URL` is set correctly in backend (no trailing slash)
3. URL uses HTTPS (not HTTP)
4. Backend has been redeployed after adding the variable

### Cold Start Issues

**Problem:** First request takes 30+ seconds

**This is normal on free tier:**
- Service sleeps after 15 min inactivity
- First request wakes it up (cold start)

**Solutions:**
1. Upgrade to Starter plan ($7/month) - no sleep
2. Use uptime monitoring to keep warm (UptimeRobot)
3. Add loading message in frontend

---

## Quick Checklist

- [ ] ML service build command includes `python -m app.train_model`
- [ ] ML service health shows `"model_loaded": true`
- [ ] Backend has `ML_SERVICE_URL=https://ml-service-yiwg.onrender.com`
- [ ] Backend has been redeployed after adding variable
- [ ] Test ML service directly (returns predictions)
- [ ] Test backend integration (includes ML analysis)
- [ ] Test in frontend (shows ML confidence)

---

## Current Status

✅ **ML Service URL:** `https://ml-service-yiwg.onrender.com`
✅ **Service Running:** Yes
⚠️ **Model Loaded:** No (needs fix)
⏳ **Backend Configured:** Pending (after model is loaded)

---

## Next Steps

1. **Fix ML service** (redeploy with correct build command)
2. **Verify model loads** (check health endpoint)
3. **Add URL to backend** (environment variable)
4. **Test integration** (scan URL in frontend)

**Estimated time:** 10-15 minutes

---

## Need Help?

If you're still having issues:

1. **Check Render build logs** for specific errors
2. **Verify Python version** is 3.11
3. **Check memory usage** during build
4. **Consider upgrading** to Starter plan if free tier has issues

The model training requires:
- ~500MB memory
- ~2-3 minutes build time
- Python 3.9+ with scikit-learn

Free tier should handle this, but Starter plan is more reliable.
