# Integration Examples - Advanced Intelligence Features

## 1. Complete URL Analysis Flow

### Example Request
```bash
curl -X POST http://localhost:3000/api/v1/threats/analyze-url \
  -H "Content-Type: application/json" \
  -d '{"url": "https://bit.ly/malicious-site"}'
```

### Example Response
```json
{
  "success": true,
  "data": {
    "url": "https://bit.ly/malicious-site",
    "threatScore": 72,
    "riskCategory": "HIGH",
    "recommendation": "Avoid this link - Multiple risk factors and security threats identified",
    "scanDate": "2026-02-26T15:30:45.123Z",
    "processingTime": "0.8s",
    "aiAnalysis": "Our machine learning model has identified this URL as a threat with 78.5% confidence. Multiple red flags detected...",
    
    "explainability": {
      "numericRiskScore": 72,
      "triggeredIndicators": [
        "Uses URL shortening service (hides true destination)",
        "Final domain differs from initial (potential redirect attack)"
      ],
      "suspiciousFeatures": [
        "Uses secure HTTPS protocol with SSL/TLS encryption"
      ],
      "featureContributions": [
        { "feature": "domain_age_days", "importance": 0.185 },
        { "feature": "used_shortener", "importance": 0.142 },
        { "feature": "redirect_hops", "importance": 0.118 },
        { "feature": "initial_final_domain_diff", "importance": 0.105 },
        { "feature": "url_length", "importance": 0.089 },
        { "feature": "recently_registered", "importance": 0.067 },
        { "feature": "entropy", "importance": 0.054 },
        { "feature": "suspicious_tld", "importance": 0.041 }
      ]
    },

    "whois": {
      "registrar": "Namecheap, Inc.",
      "creationDate": "2026-02-01T10:15:30Z",
      "updatedDate": "2026-02-20T14:22:10Z",
      "expirationDate": "2027-02-01T10:15:30Z",
      "domainAgeDays": 25,
      "recentlyRegistered": true,
      "recentlyUpdated": false
    },

    "redirect": {
      "initialUrl": "https://bit.ly/malicious-site",
      "finalUrl": "https://phishing-bank-fake.com/login",
      "finalDomain": "phishing-bank-fake.com",
      "hops": 2,
      "chain": [
        "https://bit.ly/malicious-site",
        "https://redirect.fake-domain.com/path",
        "https://phishing-bank-fake.com/login"
      ],
      "domainChanged": true,
      "usedShortener": true
    },

    "riskFactors": [
      "Uses URL shortening service (hides true destination)",
      "Final domain differs from initial (potential redirect attack)",
      "Domain registered recently (25 days ago)",
      "Recently updated WHOIS information"
    ],

    "securityFeatures": [
      "Uses secure HTTPS protocol with SSL/TLS encryption"
    ],

    "detectionMethods": [
      {
        "name": "VirusTotal Analysis",
        "result": "FAIL",
        "source": "VirusTotal",
        "details": "3 malicious, 2 suspicious engines flagged"
      },
      {
        "name": "Google Safe Browsing",
        "result": "FAIL",
        "source": "Google",
        "details": "PHISHING"
      },
      {
        "name": "Machine Learning Analysis",
        "result": "FAIL",
        "source": "ML Model v1.0.0",
        "details": "Confidence: 78.5%, Features: 27"
      }
    ],

    "technicalDetails": {
      "domainAge": "25",
      "sslStatus": "Valid",
      "reputation": "Poor",
      "redirects": "2"
    }
  }
}
```

---

## 2. ML Service Integration Example

### Backend calls ML Service with Engineered Features

```typescript
// In threatAnalysis.ts
const engineeredFeatures = {
  whois: {
    registrar: "Namecheap, Inc.",
    domainAgeDays: 25,
    recentlyRegistered: true,
    recentlyUpdated: false,
    creationDate: "2026-02-01T10:15:30Z",
    expirationDate: "2027-02-01T10:15:30Z",
    daysToExpiry: 340
  },
  redirect: {
    initialUrl: "https://bit.ly/malicious-site",
    finalUrl: "https://phishing-bank-fake.com/login",
    hops: 2,
    chain: ["https://bit.ly/malicious-site", "https://phishing-bank-fake.com/login"],
    domainChanged: true,
    usedShortener: true
  }
};

const mlResult = await mlService.analyzeUrl(url, engineeredFeatures);
```

### ML Service Processes Enriched Features

```python
# In ml-service/app/main.py
request = URLAnalysisRequest(
    url="https://bit.ly/malicious-site",
    engineered_features={
        "whois": {...},
        "redirect": {...}
    }
)

# Feature extractor receives all data
features = feature_extractor.extract_url_features(
    request.url,
    whois_data=request.engineered_features["whois"],
    redirect_data=request.engineered_features["redirect"]
)

# Result includes 27 features now:
# Original 19 URL features + 8 new WHOIS/redirect features
features = {
    "url_length": 27,
    "domain_length": 8,
    # ... existing 17 features ...
    "domain_age_days": 25,
    "recently_registered": True,
    "recently_updated": False,
    "days_to_expiry": 340,
    "registrar_present": True,
    "redirect_hops": 2,
    "initial_final_domain_diff": True,
    "used_shortener": True
}

# ML inference with feature importance
prediction = ml_engine.predict_url(url, features)
# Returns:
# {
#   "is_threat": True,
#   "confidence": 0.785,
#   "ml_score": 78,
#   "features_analyzed": 27,
#   "feature_importance": [
#     {"feature": "domain_age_days", "importance": 0.185},
#     {"feature": "used_shortener", "importance": 0.142},
#     ...
#   ]
# }
```

---

## 3. Scan History Logging Example

### What Gets Persisted to MongoDB

```javascript
db.scanhistory.insertOne({
  // Metadata
  _id: ObjectId("..."),
  createdAt: ISODate("2026-02-26T15:30:45.123Z"),
  updatedAt: ISODate("2026-02-26T15:30:45.123Z"),
  
  // Original input
  url: "https://bit.ly/malicious-site",
  normalizedUrl: "https://bit.ly/malicious-site",  // For dedup
  ipAddress: "192.168.1.100",
  
  // Extracted features for retraining
  extractedFeatures: {
    url_length: 27,
    domain_length: 8,
    has_ip_address: false,
    // ... all 27 features ...
    domain_age_days: 25,
    recently_registered: true,
    redirect_hops: 2,
    used_shortener: true
  },
  
  // External threat intelligence
  externalIntel: {
    virusTotalScanId: "abc123def456",
    virusTotalResults: {
      malicious: 3,
      suspicious: 2,
      harmless: 10
    }
  },
  
  // Domain intelligence
  whois: {
    registrar: "Namecheap, Inc.",
    creationDate: ISODate("2026-02-01T10:15:30Z"),
    updatedDate: ISODate("2026-02-20T14:22:10Z"),
    expirationDate: ISODate("2027-02-01T10:15:30Z"),
    domainAgeDays: 25,
    recentlyRegistered: true,
    recentlyUpdated: false
  },
  
  // Redirect chain
  redirect: {
    initialUrl: "https://bit.ly/malicious-site",
    finalUrl: "https://phishing-bank-fake.com/login",
    finalDomain: "phishing-bank-fake.com",
    hops: 2,
    chain: [...],
    domainChanged: true,
    usedShortener: true
  },
  
  // Detection results
  threatScore: 72,
  riskCategory: "HIGH",
  recommendation: "Avoid this link...",
  aiAnalysis: "Our ML model...",
  riskFactors: ["Uses URL shortening service", ...],
  securityFeatures: ["Uses secure HTTPS", ...],
  
  // Optional fields for future labeling
  userFeedback: null,  // Set if user provides feedback
  verifiedLabel: null  // Set by security analyst (true/false/null)
});
```

### Query Examples for Retraining

```javascript
// Find all high-risk scans from last week
db.scanhistory.find({
  riskCategory: "HIGH",
  createdAt: { $gte: ISODate("2026-02-19") },
  verifiedLabel: { $ne: null }  // Only verified samples
}).limit(10000);

// Get feature distribution for a specific domain
db.scanhistory.find({
  normalizedUrl: "https://phishing-bank-fake.com/login"
}).project({ extractedFeatures: 1, verifiedLabel: 1 });

// Recent scans by risk category
db.scanhistory.aggregate([
  { $match: { createdAt: { $gte: ISODate("2026-02-19") } } },
  { $group: {
      _id: "$riskCategory",
      count: { $sum: 1 },
      avgThreatScore: { $avg: "$threatScore" }
    }
  }
]);
```

---

## 4. Frontend Explainability Display

### Component Receives Data

```typescript
const result: ThreatAnalysisResult = {
  threatScore: 72,
  riskCategory: "HIGH",
  explainability: {
    numericRiskScore: 72,
    triggeredIndicators: [
      "Uses URL shortening service (hides true destination)",
      "Domain registered recently (25 days ago)"
    ],
    suspiciousFeatures: ["Uses secure HTTPS encryption"],
    featureContributions: [
      { feature: "domain_age_days", importance: 0.185 },
      { feature: "used_shortener", importance: 0.142 },
      // ... top 8 features ...
    ]
  },
  whois: { /* domain data */ },
  redirect: { /* redirect data */ }
};
```

### Rendered Output

```
┌──────────────────────────────────────────────────────┐
│ Threat Analysis Results                        [HIGH] │
└──────────────────────────────────────────────────────┘

┌─ Threat Score: 72/100 ──────────────────────────────┐
│ ████████████████████░ HIGH RISK                       │
│                                                      │
│ ✗ DO NOT VISIT - Multiple risk factors detected    │
└──────────────────────────────────────────────────────┘

┌─ AI Security Analysis ──────────────────────────────┐
│ Our machine learning model (trained on thousands  │
│ of phishing patterns) has identified this URL as  │
│ a threat with 78.5% confidence...                 │
│                                                   │
│ Feature Contributions:                            │
│ • domain_age_days ...................... 18.5%   │
│ • used_shortener ....................... 14.2%   │
│ • redirect_hops ........................ 11.8%   │
│ • initial_final_domain_diff ............ 10.5%   │
│ • url_length ........................... 8.9%   │
│ • recently_registered .................. 6.7%   │
│ • entropy .............................. 5.4%   │
│ • suspicious_tld ....................... 4.1%   │
└──────────────────────────────────────────────────────┘

┌─ Threat Indicators ─────────────────────────────────┐
│ ✗ Risk Factors Found              ✓ Security Features │
│ • Uses URL shortening service    • Uses HTTPS        │
│ • Domain registered recently       encryption        │
│ • Final domain differs from                          │
│   initial (redirect attack)                          │
└──────────────────────────────────────────────────────┘
```

---

## 5. Error Handling Examples

### WHOIS Lookup Fails (Graceful Degradation)

```typescript
// In threatAnalysis.ts
try {
  const whoisInfo = await lookupWhois(domain);
} catch (err) {
  console.warn('Non-fatal: WHOIS lookup failed', err);
  // Continue with empty whois object - detection proceeds
  whoisInfo = {};
}
```

### Redirect Tracing Timeout

```typescript
// In redirectService.ts
const client = axios.create({
  timeout: 5000  // 5 second timeout
});

// If service is slow, stops early and returns partial chain
// Does not crash or block response
```

### ML Service Unavailable

```typescript
// In threatAnalysis.ts
const mlResult = await mlService.analyzeUrl(url, engineeredFeatures);
if (mlResult) {
  // Use ML result if available
} else {
  // Fallback to rule-based detection (still works)
  // Return non-critical warning in detectionMethods
}
```

### Database Persistence Fails

```typescript
// In threatController.ts - URL scan endpoint
res.json({ success: true, data: analysisResult });  // Sent immediately

// Then async...
scanHistory.save().catch((err) => {
  console.warn('Failed to persist scan history (non-fatal):', err);
  // Never blocks user response
});
```

---

## 6. Performance Monitoring

### Metrics to Track

```typescript
// Log to your monitoring system
const metrics = {
  whois_lookup_time_ms: 342,
  redirect_tracing_time_ms: 1256,
  ml_inference_time_ms: 42,
  threat_intel_time_ms: 890,
  total_analysis_time_ms: 850,  // Parallel execution, not sum
  response_sent_ms: 42,  // With async logging
  db_persistence_time_ms: 120  // After response sent
};

// Example with StatsD or similar
statsd.timing('threat_analysis.whois_lookup', 342);
statsd.timing('threat_analysis.ml_inference', 42);
statsd.gauge('threat_current_risk_score', 72);
```

### Health Check Endpoint

```bash
curl http://localhost:3000/api/v1/threats/statistics

{
  "totalScans": 15243,
  "recentScans": 287,           // Last 24 hours
  "avgThreatScore": 32.5,
  "threatDistribution": {
    "LOW": 10245,
    "MEDIUM": 3210,
    "HIGH": 1498,
    "CRITICAL": 290
  }
}
```

---

## 7. Testing Workflow

### Unit Test: WHOIS Cache

```typescript
describe('WhoisService', () => {
  it('returns cached result on second lookup', async () => {
    const domain = 'example.com';
    
    const result1 = await lookupWhois(domain);
    const result2 = await lookupWhois(domain);
    
    expect(result1).toEqual(result2);
    expect(result2.cachedAt).toBeLessThan(result1.cachedAt);
  });
  
  it('expires cache after 24 hours', async () => {
    // Mock time
    jest.setSystemTime(new Date('2026-02-26T12:00:00'));
    await lookupWhois('example.com');
    
    // Advance 25 hours
    jest.setSystemTime(new Date('2026-02-27T13:00:00'));
    // Next lookup should hit WHOIS service again
  });
});
```

### Integration Test: Complete Flow

```typescript
describe('Threat Analysis with Intelligence', () => {
  it('returns explainability with feature importance', async () => {
    const result = await analyzeUrl('https://suspicious.test');
    
    expect(result.explainability).toBeDefined();
    expect(result.explainability.featureContributions).toHaveLength(8);
    expect(result.explainability.numericRiskScore).toBe(result.threatScore);
  });
  
  it('logs scan asynchronously without blocking response', async () => {
    const startTime = Date.now();
    const result = await analyzeUrl('https://test.url');
    const responseTime = Date.now() - startTime;
    
    // Response should be fast (< 100ms)
    expect(responseTime).toBeLessThan(100);
    
    // But database should eventually record it
    await new Promise(resolve => setTimeout(resolve, 500));
    const scanHistory = await ScanHistory.findOne({ url: 'https://test.url' });
    expect(scanHistory).toBeDefined();
  });
});
```

---

## 8. Production Deployment Checklist

- [ ] Install `whois-json` package in backend
- [ ] MongoDB collections created with proper indexes
- [ ] ML service updated and tested (feature count = 27)
- [ ] Monitoring/alerting configured for WHOIS timeouts
- [ ] Rate limiting set for redirect tracing (per-IP quota)
- [ ] Backup strategy for ScanHistory logs
- [ ] Log retention policy established
- [ ] Test with production-like data volume
- [ ] Security audit of WHOIS/redirect lookups
- [ ] Load test with concurrent requests

---

**Version**: 1.0.0
**Status**: Ready for Implementation
**Last Updated**: February 2026
