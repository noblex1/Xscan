# ML Service Cold Start Fix

## Problem
Your ML service is deployed on **Render's free tier**, which automatically spins down (sleeps) after **15 minutes of inactivity**. This causes:
- Service appears "offline" after periods of inactivity
- First request takes 30-60 seconds to wake up (cold start)
- Works fine immediately after redeploy, then goes offline again

## Solutions Implemented

### 1. ✅ Keep-Alive Mechanism (Automatic)
The backend now automatically pings the ML service every 10 minutes to prevent it from sleeping.

**How it works:**
- Sends a health check request every 10 minutes
- Only runs in production mode
- Prevents the 15-minute inactivity timeout
- Logs keep-alive pings for monitoring

**No configuration needed** - this runs automatically when you deploy.

### 2. ✅ Cold Start Detection & Retry
The backend now intelligently handles cold starts:

**Features:**
- Detects when service might be sleeping
- Automatically retries with extended timeout (60 seconds)
- Logs warming-up status for debugging
- Falls back to rule-based detection if ML service unavailable

### 3. ✅ Extended Timeouts
- Normal requests: 30 seconds timeout
- Cold start requests: 60 seconds timeout
- Health checks: 5 seconds (quick), 60 seconds (cold start)

## Additional Solutions (Optional)

### Option A: Use UptimeRobot (Free, Recommended)

UptimeRobot is a free monitoring service that can ping your ML service every 5 minutes.

**Setup Steps:**

1. Go to [UptimeRobot.com](https://uptimerobot.com/) and create a free account

2. Click "Add New Monitor"

3. Configure the monitor:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Catchers AI ML Service
   - **URL:** `https://xscan-hx2f.onrender.com/health`
   - **Monitoring Interval:** 5 minutes (free tier)
   - **Monitor Timeout:** 30 seconds

4. Click "Create Monitor"

**Benefits:**
- Keeps service warm 24/7
- Email alerts if service goes down
- Free forever
- Works alongside the built-in keep-alive

### Option B: Upgrade to Render Starter Plan ($7/month)

**Benefits:**
- No sleep/spin-down
- Instant response times
- More memory and CPU
- Better for production use

**How to upgrade:**
1. Go to your Render dashboard
2. Select the ML service
3. Click "Upgrade to Starter"
4. Confirm payment

### Option C: Deploy to Always-On Platform

Consider these alternatives to Render free tier:

| Platform | Free Tier | Always-On | Notes |
|----------|-----------|-----------|-------|
| **Railway** | $5 credit/month | ✅ Yes | No sleep, pay-as-you-go |
| **Fly.io** | 3 VMs free | ✅ Yes | No sleep, good for Python |
| **AWS ECS** | 12 months free | ✅ Yes | More complex setup |
| **Google Cloud Run** | 2M requests/month | ⚠️ Scales to zero | Similar to Render |

## Testing the Fix

### Test 1: Verify Keep-Alive is Running

1. Deploy the updated backend
2. Check backend logs after 10 minutes
3. Look for: `💓 Keep-alive ping sent to ML service`

### Test 2: Test Cold Start Handling

1. Wait 20 minutes (let service sleep)
2. Make a scan request
3. Should see: `⏳ Attempting to wake up ML service (this may take 30-60 seconds)...`
4. Request should succeed (may take 30-60 seconds)

### Test 3: Verify Normal Operation

1. Make a scan request
2. Make another request within 1 minute
3. Second request should be fast (<2 seconds)

## Monitoring

### Backend Logs to Watch

```bash
# Service is healthy
✓ ML Service is available

# Keep-alive working
💓 Keep-alive ping sent to ML service

# Cold start detected
⏳ ML Service may be sleeping (cold start), will retry with extended timeout...
⏳ Attempting to wake up ML service (this may take 30-60 seconds)...

# Service unavailable (fallback mode)
⚠ ML Service is unavailable, using fallback detection
```

### ML Service Logs to Watch

```bash
# Service is running
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.

# Health check received
INFO:     GET /health
INFO:     Response: 200 OK

# Analysis request received
INFO:     Analyzing URL: https://example.com
```

## Troubleshooting

### Issue: Keep-alive not working

**Check:**
```bash
# In backend logs, should see every 10 minutes:
💓 Keep-alive ping sent to ML service
```

**If not appearing:**
- Verify `NODE_ENV=production` in backend environment
- Check `ML_SERVICE_URL` is correct
- Restart backend service

### Issue: Still getting cold starts

**Possible causes:**
1. Keep-alive interval too long (increase frequency)
2. ML service restarting due to errors
3. Render platform issues

**Solutions:**
- Add UptimeRobot (5-minute pings)
- Check ML service logs for crashes
- Consider upgrading to Starter plan

### Issue: Requests timing out

**Check:**
- ML service is actually running (check Render dashboard)
- Model file exists (`app/models/phishing_detector.pkl`)
- No memory errors in ML service logs

**Fix:**
```bash
# Rebuild ML service to regenerate model
cd ml-service
python -m app.train_model
```

## Cost Comparison

| Solution | Cost | Reliability | Setup Time |
|----------|------|-------------|------------|
| **Keep-Alive (Built-in)** | Free | Good | 0 min (automatic) |
| **UptimeRobot** | Free | Excellent | 5 min |
| **Render Starter** | $7/month | Excellent | 2 min |
| **Railway** | ~$5/month | Excellent | 30 min |

## Recommended Setup

For best results, use **both**:
1. ✅ Built-in keep-alive (automatic)
2. ✅ UptimeRobot (5 minutes to set up)

This gives you:
- Redundant keep-alive pings
- Monitoring and alerts
- 99%+ uptime
- $0 cost

## Next Steps

1. ✅ Deploy the updated backend (keep-alive is now automatic)
2. ⏳ Set up UptimeRobot (5 minutes, free)
3. ⏳ Monitor logs for 24 hours
4. ⏳ Consider upgrading to Starter plan if needed

## Questions?

- Check backend logs for keep-alive messages
- Check ML service logs for health check requests
- Verify `ML_SERVICE_URL` is correct in backend `.env`
- Test with a scan after 20 minutes of inactivity
