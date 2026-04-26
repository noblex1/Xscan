# ML Service Fix - Deployment Checklist

## Pre-Deployment Checklist

- [ ] Read `QUICK_FIX_SUMMARY.md` to understand the changes
- [ ] Backup current `.env` files (backend and ml-service)
- [ ] Verify you have access to Render dashboard
- [ ] Note current ML service URL: `https://xscan-hx2f.onrender.com`

## Deployment Steps

### Step 1: Commit Changes

```bash
# Check what files changed
git status

# Review changes
git diff backend/src/services/mlService.ts
git diff ml-service/app/main.py
git diff render.yaml

# Stage all changes
git add backend/src/services/mlService.ts
git add ml-service/app/main.py
git add render.yaml
git add ML_SERVICE_COLD_START_FIX.md
git add QUICK_FIX_SUMMARY.md
git add DEPLOYMENT_CHECKLIST.md
git add test-ml-service.sh

# Commit
git commit -m "Fix: ML service cold start handling and keep-alive mechanism

- Add automatic keep-alive pings every 10 minutes
- Add cold start detection and retry logic
- Add extended timeouts for cold start scenarios
- Add /keep-alive endpoint to ML service
- Improve health check with timestamps
- Update render.yaml with optimized uvicorn settings
- Add comprehensive documentation and testing scripts"

# Push to repository
git push origin main
```

### Step 2: Deploy to Render

**Option A: Automatic Deployment (if enabled)**
- Render will automatically deploy when you push to main
- Monitor the deployment in Render dashboard

**Option B: Manual Deployment**
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Select `catchers-ai-backend` service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Wait for deployment to complete
5. Select `catchers-ai-ml` service
6. Click "Manual Deploy" → "Deploy latest commit"
7. Wait for deployment to complete

### Step 3: Verify Backend Deployment

```bash
# Check backend health
curl https://your-backend-url.onrender.com/health

# Check backend logs in Render dashboard
# Look for:
# - "✓ ML Service keep-alive started (ping every 10 minutes)"
# - No errors during startup
```

### Step 4: Verify ML Service Deployment

```bash
# Check ML service health
curl https://xscan-hx2f.onrender.com/health

# Check new keep-alive endpoint
curl https://xscan-hx2f.onrender.com/keep-alive

# Check ML service logs in Render dashboard
# Look for:
# - "Model loaded successfully"
# - "Application startup complete"
```

### Step 5: Test End-to-End

```bash
# Run the test script
bash test-ml-service.sh

# Or test manually:
# 1. Go to your frontend
# 2. Scan a URL (e.g., https://google.com)
# 3. Verify it completes successfully
# 4. Check response time
```

### Step 6: Monitor Keep-Alive (Wait 10 minutes)

```bash
# After 10 minutes, check backend logs
# Should see:
# "💓 Keep-alive ping sent to ML service"

# Check ML service logs
# Should see:
# "GET /health" requests every 10 minutes
```

## Post-Deployment Verification

### Immediate Checks (0-5 minutes)

- [ ] Backend deployed successfully
- [ ] ML service deployed successfully
- [ ] Backend can reach ML service
- [ ] Health endpoints responding
- [ ] Test scan completes successfully
- [ ] No errors in logs

### Short-term Checks (10-30 minutes)

- [ ] Keep-alive pings appearing in logs (every 10 minutes)
- [ ] ML service receiving health checks
- [ ] Multiple scans work correctly
- [ ] Response times are reasonable (<5 seconds)

### Long-term Checks (1-24 hours)

- [ ] Service stays online after 15+ minutes
- [ ] No cold start errors
- [ ] Keep-alive running continuously
- [ ] No memory or performance issues

## Optional: Set Up UptimeRobot

### Step 1: Create Account
1. Go to [UptimeRobot.com](https://uptimerobot.com/)
2. Sign up for free account
3. Verify email

### Step 2: Add Monitor
1. Click "Add New Monitor"
2. Configure:
   - **Monitor Type:** HTTP(s)
   - **Friendly Name:** Catchers AI ML Service
   - **URL:** `https://xscan-hx2f.onrender.com/health`
   - **Monitoring Interval:** 5 minutes
   - **Monitor Timeout:** 30 seconds
   - **Alert Contacts:** Your email
3. Click "Create Monitor"

### Step 3: Verify Monitor
- [ ] Monitor shows "Up" status
- [ ] Response time is reasonable (<5 seconds)
- [ ] No alerts triggered

## Troubleshooting

### Issue: Backend deployment failed

**Check:**
- Build logs in Render dashboard
- TypeScript compilation errors
- Missing dependencies

**Fix:**
```bash
# Test locally first
cd backend
npm install
npm run build
npm start
```

### Issue: ML service deployment failed

**Check:**
- Build logs in Render dashboard
- Python version (should be 3.11)
- Model training errors

**Fix:**
```bash
# Test locally first
cd ml-service
pip install -r requirements.txt
python -m app.train_model
uvicorn app.main:app --reload
```

### Issue: Keep-alive not appearing in logs

**Check:**
1. Backend logs for startup message
2. `NODE_ENV` is set to `production`
3. `ML_SERVICE_URL` is correct

**Fix:**
```bash
# Check environment variables in Render dashboard
# Backend service → Environment → Environment Variables
# Verify:
# - NODE_ENV=production
# - ML_SERVICE_URL=https://xscan-hx2f.onrender.com
```

### Issue: ML service still going offline

**Possible causes:**
1. Keep-alive not running (check logs)
2. ML service crashing (check logs for errors)
3. Memory issues on free tier

**Solutions:**
1. Verify keep-alive is running
2. Check ML service logs for crashes
3. Set up UptimeRobot for redundancy
4. Consider upgrading to Starter plan

### Issue: Cold start still taking too long

**This is normal for free tier:**
- First request after sleep: 30-60 seconds
- Subsequent requests: <2 seconds

**Solutions:**
1. Keep-alive should prevent most cold starts
2. UptimeRobot adds redundancy
3. Upgrade to Starter plan for instant response

## Success Criteria

✅ **Deployment Successful If:**
- Backend and ML service both deployed
- Health endpoints responding
- Test scans complete successfully
- Keep-alive pings appearing in logs
- No errors in logs
- Service stays online after 15+ minutes

✅ **Keep-Alive Working If:**
- Backend logs show: `💓 Keep-alive ping sent to ML service` every 10 minutes
- ML service logs show: `GET /health` requests every 10 minutes
- Service doesn't go offline after 15 minutes

✅ **Cold Start Handling Working If:**
- First request after inactivity succeeds (may be slow)
- Logs show: `⏳ Attempting to wake up ML service`
- Request completes within 60 seconds
- Subsequent requests are fast

## Rollback Plan

If something goes wrong:

### Option 1: Revert Git Commit
```bash
git revert HEAD
git push origin main
```

### Option 2: Redeploy Previous Version
1. Go to Render dashboard
2. Select service
3. Go to "Events" tab
4. Find previous successful deployment
5. Click "Redeploy"

### Option 3: Manual Fix
1. Check logs for specific error
2. Fix the issue
3. Commit and push fix
4. Redeploy

## Monitoring Plan

### Daily (First Week)
- [ ] Check backend logs for keep-alive messages
- [ ] Check ML service logs for health checks
- [ ] Verify no errors or crashes
- [ ] Test a few scans manually

### Weekly (Ongoing)
- [ ] Review UptimeRobot statistics
- [ ] Check for any downtime incidents
- [ ] Monitor response times
- [ ] Review error logs

### Monthly
- [ ] Evaluate if free tier is sufficient
- [ ] Consider upgrading to Starter plan
- [ ] Review overall system performance
- [ ] Plan any optimizations

## Next Steps After Deployment

1. ✅ Monitor for 24 hours
2. ⏳ Set up UptimeRobot (if not done)
3. ⏳ Document any issues encountered
4. ⏳ Evaluate need for Starter plan upgrade
5. ⏳ Share success with team

## Support Resources

- **Documentation:** `ML_SERVICE_COLD_START_FIX.md`
- **Quick Summary:** `QUICK_FIX_SUMMARY.md`
- **Test Script:** `test-ml-service.sh`
- **Render Docs:** https://render.com/docs
- **UptimeRobot Docs:** https://uptimerobot.com/help/

## Questions?

If you encounter issues:
1. Check the troubleshooting section above
2. Review logs in Render dashboard
3. Run `test-ml-service.sh` for diagnostics
4. Check `ML_SERVICE_COLD_START_FIX.md` for detailed solutions

---

**Deployment Date:** _________________

**Deployed By:** _________________

**Status:** ⬜ Success  ⬜ Issues  ⬜ Rolled Back

**Notes:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
