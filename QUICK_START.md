# Quick Start Guide - Advanced Intelligence Features

## 🚀 30-Minute Setup

### Step 1: Install Dependencies (2 min)
```bash
cd /path/to/NetWard.ai/backend
npm install whois-json axios
```

### Step 2: Update Environment (if needed)
No new environment variables required. System uses existing:
- `MONGODB_URI` - for ScanHistory logging
- `ML_SERVICE_URL` - for ML backend communication

### Step 3: Start Services (3 min)
```bash
# Terminal 1: Backend
cd backend && npm run start
# Should see: ✓ ML Service is available
#           ✅ MongoDB connected successfully

# Terminal 2: ML Service  
cd ml-service && python -m app.main
# Should see: Started server process [PID]

# Terminal 3: Frontend
cd . && npm run dev
# Should see: VITE v4.x.x ready in 1234 ms
```

### Step 4: Test Integration (5 min)
```bash
# Test URL with phishing indicators
curl -X POST http://localhost:3000/api/v1/threats/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url":"https://bit.ly/example"}'

# Check response includes:
# ✓ explainability.triggeredIndicators
# ✓ whois.domainAgeDays
# ✓ redirect.finalDomain
# ✓ Feature importance data
```

### Step 5: Verify Database (2 min)
```bash
# In MongoDB client
db.scanhistory.findOne()

# Should have new fields:
# { normalizedUrl, extractedFeatures, whois, redirect, ... }
```

---

## ✨ Key Features at a Glance

| Feature | Trigger | Example |
|---------|---------|---------|
| **Domain Age** | New domain (<30d) | Recent Bitcoin exchange phishing |
| **Redirect Chain** | Domain hopping | bit.ly → fake-bank.com → phishing.ru |
| **Feature Importance** | Model reasoning | "domain_age contributes 18.5% to threat" |
| **Learning Logs** | Every scan | Full feature vector saved for retraining |
| **Explainability** | In response | "Multiple risk factors: shortener + new domain" |

---

## 🔍 Testing URLs (Local Development)

```bash
# Shortener + redirect (high risk)
https://bit.ly/example

# New domain (medium risk)
https://newly-registered-site.tk

# HTTPS with good reputation (low risk)
https://github.com

# With WHOIS data
https://google.com  # Established, old domain (should be LOW)
```

---

## 📊 Expected Response Structure

```json
{
  "success": true,
  "data": {
    "threatScore": 65,
    "riskCategory": "HIGH",
    
    "explainability": {
      "numericRiskScore": 65,
      "triggeredIndicators": [
        "Uses URL shortening service",
        "Domain registered recently"
      ],
      "featureContributions": [
        { "feature": "domain_age_days", "importance": 0.185 },
        { "feature": "used_shortener", "importance": 0.142 }
      ]
    },
    
    "whois": {
      "domainAgeDays": 15,
      "recentlyRegistered": true,
      "registrar": "NameCheap"
    },
    
    "redirect": {
      "hops": 2,
      "usedShortener": true,
      "domainChanged": true,
      "finalDomain": "phishing-site.com"
    }
  }
}
```

---

## 🛠️ Troubleshooting

### WHOIS Lookup Fails
```
Log: "Non-fatal: WHOIS lookup failed"
→ Expected - some TLDs don't support WHOIS
→ Detection continues without domain age data
```

### ML service takes > 100ms
```
Check: ps aux | grep ml-service
Ensure: Python service is consuming CPU
Solution: Model may need optimization/pruning
```

### Database write failures
```
Log: "Failed to persist scan history (non-fatal)"
→ Expected for network blips
→ Does NOT impact user response
→ Check MongoDB connection
```

### Feature count shows 19 instead of 27
```
Issue: WHOIS/redirect data not passed to ML
Check: URL is being analyzed with engineered_features payload
Verify: ml-service logs show "features_analyzed: 27"
```

---

## 📈 Monitoring Checklist

Daily:
- [ ] Check error logs for WHOIS timeouts (should be rare)
- [ ] Monitor ML inference latency (should be <50ms)
- [ ] Verify ScanHistory growth (~100-1000 scans/hour expected)

Weekly:
- [ ] Analyze threat distribution (LOW/MEDIUM/HIGH/CRITICAL)
- [ ] Review feature importance trends
- [ ] Check model accuracy on recent scans

Monthly:
- [ ] Export ScanHistory for retraining analysis
- [ ] Retrain model if drift detected
- [ ] Update WHOIS cache hit rate metrics

---

## 🎯 Success Criteria

✅ **You'll know it's working when you see:**

1. **Response Time**: URL analysis completes in <1 second
2. **Explainability**: Risk score + feature importance in response
3. **Domain Intelligence**: WHOIS age, registrar, dates captured
4. **Redirect Detection**: Chain and shortener usage logged
5. **Database**: ScanHistory shows 27 features in extractedFeatures

---

## 📚 Additional Resources

- **Full Guide**: `ADVANCED_FEATURES_GUIDE.md`
- **API Examples**: `INTEGRATION_EXAMPLES.md`
- **Implementation Report**: `IMPLEMENTATION_REPORT.md`
- **Deployment Checklist**: `IMPLEMENTATION_CHECKLIST.md`

---

## 🆘 Need Help?

### Common Issues

**Q: Getting 502 Bad Gateway on URL analysis**
A: Ensure both backend and ML service are running
```bash
curl http://localhost:3000/api/v1/threats/statistics  # Backend health
curl http://localhost:5000/health  # ML service health
```

**Q: Response missing explainability field**
A: ML service may not have loaded model. Check logs:
```bash
# In ML service logs, look for:
"Model loaded successfully from app/models/phishing_detector.pkl"
```

**Q: WHOIS lookups taking too long**
A: First lookup is slow (1-5s). Subsequent are cached.
Check cache is being reused with same domain:
```typescript
// Cache should return instantly for same domain
await lookupWhois('google.com'); // ~2s first time
await lookupWhois('google.com'); // <1ms second time
```

**Q: Database getting too large**
A: Set retention policy:
```javascript
// Implement TTL or archive
db.scanhistory.createIndex({ createdAt: 1 }, { expireAfterSeconds: 7776000 })
// ^ Expires after 90 days
```

---

## 🎓 Learning Path

1. **Day 1**: Run quick-start, test with sample URLs
2. **Day 2**: Read `ADVANCED_FEATURES_GUIDE.md` for deep dive
3. **Day 3**: Review `INTEGRATION_EXAMPLES.md` for API patterns
4. **Day 4**: Deploy to staging environment
5. **Day 5**: Load test and monitor performance
6. **Day 6**: Train team on explainability UX
7. **Day 7**: Deploy to production

---

## 📞 Support

For detailed questions:
- Technical: See `ADVANCED_FEATURES_GUIDE.md`
- Integration: See `INTEGRATION_EXAMPLES.md`  
- Deployment: See `IMPLEMENTATION_CHECKLIST.md`
- Issues: Check `TROUBLESHOOTING.md`

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Status**: Production-Ready ✅
