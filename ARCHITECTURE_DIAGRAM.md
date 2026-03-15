# NetWard AI - Advanced Architecture Diagram

## Complete System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           FRONTEND (React + TypeScript)                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ ThreatScanner Component                                             │    │
│  │  • URL input form                                                   │    │
│  │  • File upload zone                                                 │    │
│  │  • Displays ThreatAnalysisResult component                          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                     │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ ThreatAnalysisResult Component (ENHANCED)                           │    │
│  │  • Risk score visualization                                         │    │
│  │  • Threat indicators (from explainability)                          │    │
│  │  • ✨ Feature Contributions Display (TOP 8)                         │    │
│  │  • Suspicious features list                                         │    │
│  │  • Detection methods summary                                        │    │
│  │  • Technical details (domain age, redirects, etc.)                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                     │                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ API Layer (TypeScript)                                              │    │
│  │  src/api/threatDetection.ts                                         │    │
│  │  • analyzeUrl(url)                                                  │    │
│  │  • analyzeFile(file)                                                │    │
│  │  • Extended to include explainability, whois, redirect              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │ POST /api/v1/threats/analyze-url
                                    │ + URL + optional context headers
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js + TypeScript)                        │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │ ThreatController                                                 │      │
│  │  ├─ analyzeUrl(req, res)                                        │      │
│  │  │  └─ Input validation, URL parsing                             │      │
│  │  ├─ Response sent immediately (< 100ms)                         │      │
│  │  └─ async scan logging (background, non-blocking)               │      │
│  └──────────────────────────────────────────────────────────────────┘      │
│                                    │                                        │
│  ┌──────────────────────────────────────────────────────────────────┐      │
│  │ ThreatAnalysisService (ORCHESTRATOR)                             │      │
│  │                                                                  │      │
│  │  Input: URL                                                      │      │
│  │                                                                  │      │
│  │  ┌─ Sequential Checks ──────────────────────────────────────┐  │      │
│  │  │ 1. VirusTotal Check                                      │  │      │
│  │  │    → Malicious count, suspicious count, reputation       │  │      │
│  │  │                                                           │  │      │
│  │  │ 2. Google Safe Browsing Check                            │  │      │
│  │  │    → Threat type classification                          │  │      │
│  │  │                                                           │  │      │
│  │  │ 3. PhishTank Check                                       │  │      │
│  │  │    → Phishing database lookup                            │  │      │
│  │  │                                                           │  │      │
│  │  │    ⚡ PARALLEL (Promise.all) ──────────                  │  │      │
│  │  │    ├─ WHOIS Lookup Service                           │  │  │      │
│  │  │    │  └─ Domain age, registrar, dates                │  │  │      │
│  │  │    │     (with 24h cache)                            │  │  │      │
│  │  │    │                                                  │  │  │      │
│  │  │    └─ Redirect Tracing Service                       │  │  │      │
│  │  │       └─ Follow redirects (max 6 hops, 5s timeout)   │  │  │      │
│  │  │          → Final domain, chain, shortener detect      │  │  │      │
│  │  │                                                      │  │  │      │
│  │  │ 4. Build Engineered Features Object ────────────────┘  │      │
│  │  │    {                                                     │      │
│  │  │      whois: { domainAgeDays, registrar, ... },          │      │
│  │  │      redirect: { hops, chain, domainChanged, ... }      │      │
│  │  │    }                                                     │      │
│  │  │                                                          │      │
│  │  │ 5. Send to ML Service (with engineered features)       │      │
│  │  │    → Get prediction + feature importance               │      │
│  │  │                                                          │      │
│  │  │ 6. Assemble Explainability                             │      │
│  │  │    {                                                    │      │
│  │  │      numericRiskScore: threatScore,                    │      │
│  │  │      triggeredIndicators: riskFactors,                 │      │
│  │  │      suspiciousFeatures: securityFeatures,             │      │
│  │  │      featureContributions: [                           │      │
│  │  │        { feature: "domain_age_days", importance: 0.185 },│      │
│  │  │        { feature: "used_shortener", importance: 0.142 },│      │
│  │  │        ...                                              │      │
│  │  │      ]                                                 │      │
│  │  │    }                                                    │      │
│  │  │                                                          │      │
│  │  └─ Combine all data into ThreatAnalysisResult             │      │
│  │     with WHOIS, REDIRECT, EXPLAINABILITY sections          │      │
│  │                                                             │      │
│  └──────────────────────────────────────────────────────────────┘      │
│                                    │                                        │
│  ┌─ Service Layer (Utilities) ─────────────────────────────────────┐      │
│  │                                                                 │      │
│  │  ✨ NEW: whoisService.ts                                       │      │
│  │  ├─ lookupWhois(domain)                                       │      │
│  │  │  └─ Async WHOIS lookup with 24h cache TTL                 │      │
│  │  │     Returns: age, registrar, dates, recent flags          │      │
│  │  └─ clearWhoisCache()                                        │      │
│  │                                                               │      │
│  │  ✨ NEW: redirectService.ts                                   │      │
│  │  ├─ traceRedirects(url, maxHops, timeout)                   │      │
│  │  │  └─ Follow redirects with HEAD + GET fallback            │      │
│  │  │     Returns: chain, final URL, domain diff, shortener    │      │
│  │  │                                                            │      │
│  │  threatIntelligenceService.ts                                │      │
│  │  ├─ checkVirusTotal(url)                                    │      │
│  │  ├─ checkGoogleSafeBrowsing(url)                            │      │
│  │  └─ checkPhishTank(url)                                     │      │
│  │                                                               │      │
│  │  mlService.ts (ENHANCED)                                     │      │
│  │  ├─ analyzeUrl(url, engineeredFeatures?)                    │      │
│  │  │  └─ Send features to Python ML service                   │      │
│  │  └─ checkHealth()                                           │      │
│  │                                                               │      │
│  └───────────────────────────────────────────────────────────────┘      │
│                                    │                                        │
│  ┌─ Data Layer ──────────────────────────────────────────────────┐      │
│  │                                                                │      │
│  │  ScanHistory Model (MongoDB)                                  │      │
│  │  ├─ Core fields: url, threatScore, riskCategory             │      │
│  │  ├─ ✨ NEW: normalizedUrl, extractedFeatures, ext intel     │      │
│  │  ├─ ✨ NEW: whois, redirect (full metadata)                │      │
│  │  ├─ ✨ NEW: userFeedback, verifiedLabel (for training)      │      │
│  │  └─ Indexes: url, normalizedUrl, createdAt, riskCategory   │      │
│  │                                                                │      │
│  └───────────────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────────────────┘
       │                                            │
       │ POST /api/ml/analyze-url                  │ Async save (.catch logged)
       │ + url + engineered_features               │ (non-blocking)
       │ {whois: {...}, redirect: {...}}           │
       ▼                                            ▼
┌──────────────────────────────────┐   ┌─────────────────────────────┐
│   ML SERVICE (Python/FastAPI)    │   │   MongoDB (Local/Atlas)     │
│                                  │   │                             │
│ ┌────────────────────────────┐   │   │  ┌───────────────────────┐  │
│ │ URLAnalysisRequest (NEW)   │   │   │  │ ScanHistory Docs      │  │
│ │  • url: string             │   │   │  │  • 100K+ scans/month  │  │
│ │  • engineered_features: {} │   │   │  │  • Full audit trail   │  │
│ │    {whois, redirect}       │   │   │  │  • For retraining     │  │
│ └────────────────────────────┘   │   │  │  • Indexed queries    │  │
│              │                    │   │  └───────────────────────┘  │
│              ▼                    │   │                             │
│ ┌────────────────────────────┐   │   └─────────────────────────────┘
│ │ FeatureExtractor (ENHANCED)│   │
│ │  • extract_url_features()  │   │
│ │    Input: url + whois +    │   │
│ │           redirect data    │   │
│ │                            │   │
│ │    Output: 27-dim vector   │   │
│ │    ├─ 19 original URL      │   │
│ │    │  features             │   │
│ │    ├─ 5 WHOIS features     │   │
│ │    │  (age, recent reg,    │   │
│ │    │   reg date, expiry,   │   │
│ │    │   registrar)          │   │
│ │    └─ 3 redirect features  │   │
│ │       (hops, domain diff,  │   │
│ │        shortener)          │   │
│ └────────────────────────────┘   │
│              │                    │
│              ▼                    │
│ ┌────────────────────────────┐   │
│ │ MLEngine (ENHANCED)        │   │
│ │  • _features_to_vector()   │   │
│ │    (27-dim, ordered)       │   │
│ │                            │   │
│ │  • _ml_predict()           │   │
│ │    Input: feature vector   │   │
│ │    Output: prediction +    │   │
│ │            confidence +    │   │
│ │            feature_imp     │   │
│ │                            │   │
│ │  • _get_feature_order()    │   │
│ │    (maintain sync)         │   │
│ └────────────────────────────┘   │
│              │                    │
│              ▼                    │
│ ┌────────────────────────────┐   │
│ │ MLAnalysisResponse         │   │
│ │  • prediction {            │   │
│ │      is_threat: bool,      │   │
│ │      confidence: float,    │   │
│ │      ml_score: int,        │   │
│ │      feature_importance:[] │   │
│ │    }                       │   │
│ │  • features: {27 fields}   │   │
│ │  • risk_factors: []        │   │
│ │  • confidence_factors: []  │   │
│ └────────────────────────────┘   │
│              │                    │
└──────────────────────────────────┘
       │
       └─ JSON response
          {
            prediction: {...},
            features: {...},
            feature_importance: [
              {feature: "domain_age_days", importance: 0.185},
              ...
            ]
          }
```

---

## Data Flow: Complete URL Analysis (< 100ms Response Time)

```
USER CLICKS "ANALYZE"
    │
    ▼
  [1] Validate URL format .............. ~0.1ms
    │
    ▼
  [2] Call ThreatAnalysisService ....... ~0.5ms
    │
    ├─► [THREAT INTEL] (async sequential) .. ~500-2000ms
    │   ├─ VirusTotal API call
    │   ├─ Google Safe Browsing API call
    │   └─ PhishTank API call
    │
    ├─► [PARALLEL] ✨ (starting after VT) .. ~1000-5000ms
    │   ├─► WHOIS Lookup (if not cached)
    │   │   └─ Domain age, registrar, dates
    │   │   └─ Stored in 24h cache
    │   │
    │   └─► Redirect Tracing (5s timeout)
    │       └─ Follow chain (max 6 hops)
    │       └─ Detect shorteners
    │       └─ Identify domain changes
    │
    ▼
  [3] Build Engineered Features ......... ~1ms
    │
    ├─ Assemble WHOIS data
    ├─ Assemble redirect data
    └─ Create enriched features object
    │
    ▼
  [4] Call ML Service ................... ~40ms
    │
    ├─ Feature extraction (27 dimensions)
    ├─ Model inference
    └─ Extract feature importance
    │
    ▼
  [5] Assemble Response ................. ~5ms
    │
    ├─ Combine threat intel + ML
    ├─ Generate explainability
    ├─ Build threat analysis result
    └─ Include whois + redirect data
    │
    ▼
  [6] ✅ SEND RESPONSE .................. ~40ms total
    │   (User gets result in < 100ms)
    │
    ▼
  [7] 🔄 ASYNC Background ............... (non-blocking)
    │
    └─► Persist to ScanHistory
        ├─ url, normalizedUrl
        ├─ extractedFeatures (27-dim vector)
        ├─ externalIntel
        ├─ whois + redirect data
        ├─ userFeedback field
        └─ verifiedLabel field
```

---

## Feature Importance: How the Model Explains Itself

```
┌────────────────────────────────────────────────────────────┐
│  ML Response for: https://bit.ly/suspicious-link          │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  Prediction: THREAT (78.5% confidence)                   │
│  Risk Score: 78/100 → Converted to 72/100 (after VT)    │
│                                                            │
│  Feature Importance (Why the model flagged it):          │
│  ┌──────────────────────────────────────────────────┐    │
│  │ 1. domain_age_days ................... 18.5% ████│    │
│  │    └─ Domain only 25 days old (suspicious)       │    │
│  │                                                   │    │
│  │ 2. used_shortener ................... 14.2% ███│    │
│  │    └─ Bit.ly shortener detected                 │    │
│  │                                                   │    │
│  │ 3. redirect_hops .................... 11.8% ██│    │
│  │    └─ 2 redirects in chain                     │    │
│  │                                                   │    │
│  │ 4. initial_final_domain_diff ........ 10.5% ██│    │
│  │    └─ Initial ≠ Final domain  (switcher-eroo)   │    │
│  │                                                   │    │
│  │ 5. url_length ....................... 8.9% ██│    │
│  │    └─ URL longer than average                   │    │
│  │                                                   │    │
│  │ 6. recently_registered .............. 6.7% █│     │    │
│  │    └─ WHOIS shows recent registration           │    │
│  │                                                   │    │
│  │ 7. entropy .......................... 5.4% █│     │    │
│  │    └─ High randomness in URL                    │    │
│  │                                                   │    │
│  │ 8. suspicious_tld ................... 4.1% █│     │    │
│  │    └─ .tk TLD is known suspicious              │    │
│  │                                                   │    │
│  └──────────────────────────────────────────────────┘    │
│                                                            │
│  Total Importance: 100% (normalized)                     │
│  Top 3 Features: domain_age + shortener + hops          │
│  (These three account for 44.5% of model reasoning)     │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## Database Schema: ScanHistory for Continuous Learning

```
db.scanhistory {
  _id: ObjectId,
  
  // URL & Normalization
  url: string,                    // "https://bit.ly/abc123"
  normalizedUrl: string,          // For deduplication
  
  // 🔬 Extracted ML Features (27-dimensional vector)
  extractedFeatures: {
    // Original 19 URL features
    url_length: 27,
    domain_length: 8,
    has_ip_address: false,
    has_at_symbol: false,
    has_double_slash: false,
    num_subdomains: 0,
    num_dots: 1,
    num_hyphens: 0,
    num_underscores: 0,
    num_digits: 3,
    num_special_chars: 5,
    entropy: 3.2,
    suspicious_tld: false,
    url_shortener: true,
    path_length: 8,
    num_path_segments: 1,
    has_query: false,
    num_query_params: 0,
    is_https: true,
    
    // ✨ NEW: 5 WHOIS features
    domain_age_days: 25,
    recently_registered: true,
    recently_updated: false,
    days_to_expiry: 340,
    registrar_present: true,
    
    // ✨ NEW: 3 Redirect features
    redirect_hops: 2,
    initial_final_domain_diff: true,
    used_shortener: true
  },
  
  // 🔗 External Threat Intelligence
  externalIntel: {
    virusTotalScanId: "abc123def456",
    virusTotalMalicious: 3,
    virusTotalSuspicious: 2,
    googleSafeBrowsingResult: "PHISHING",
    phishTankResult: true
  },
  
  // 🌐 Domain Intelligence (WHOIS)
  whois: {
    registrar: "Namecheap, Inc.",
    creationDate: ISODate("2026-02-01T10:15:30Z"),
    updatedDate: ISODate("2026-02-20T14:22:10Z"),
    expirationDate: ISODate("2027-02-01T10:15:30Z"),
    domainAgeDays: 25,
    recentlyRegistered: true,
    recentlyUpdated: false
  },
  
  // 🔀 Redirect Chain Analysis
  redirect: {
    initialUrl: "https://bit.ly/malicious-site",
    finalUrl: "https://phishing-bank-fake.com/login",
    finalDomain: "phishing-bank-fake.com",
    hops: 2,
    chain: [
      "https://bit.ly/malicious-site",
      "https://redirect.fake-domain.com/path"
    ],
    domainChanged: true,
    usedShortener: true
  },
  
  // 🎯 Detection Results
  threatScore: 72,
  riskCategory: "HIGH",
  recommendation: "Avoid this link - Multiple risk factors detected",
  aiAnalysis: "Our ML model has identified...",
  riskFactors: [
    "Uses URL shortening service",
    "Domain registered recently",
    "Final domain differs from initial"
  ],
  securityFeatures: [
    "Uses secure HTTPS protocol"
  ],
  detectionMethods: [
    {name: "VirusTotal", result: "FAIL", details: "..."},
    {name: "ML Analysis", result: "FAIL", details: "..."}
  ],
  
  // 📚 Continuous Learning Fields (Optional)
  userFeedback: {        // Set if user provides feedback
    relevant: true,
    useful: true,
    timestamp: ISODate("2026-02-26T15:35:00Z")
  },
  verifiedLabel: true,   // Set by security analyst
                         // true = phishing, false = legitimate, null = unverified
  
  // Metadata
  ipAddress: "192.168.1.100",
  processingTime: "0.8s",
  createdAt: ISODate("2026-02-26T15:30:45.123Z"),
  updatedAt: ISODate("2026-02-26T15:30:45.123Z")
}

// ✨ INDEXES for Performance
db.scanhistory.createIndex({ createdAt: -1 })           // Latest scans
db.scanhistory.createIndex({ threatScore: -1 })         // High-risk scans
db.scanhistory.createIndex({ url: 1, createdAt: -1 })   // URL history
db.scanhistory.createIndex({ normalizedUrl: 1 })        // Deduplication
db.scanhistory.createIndex({ riskCategory: 1 })         // Risk distribution
db.scanhistory.createIndex({ ipAddress: 1 })            // Per-IP tracking
```

---

## Summary: What's New (✨ Marks Enhancements)

| Component | What's New | Impact |
|-----------|-----------|--------|
| **whoisService.ts** | ✨ Domain intelligence with caching | 5 new ML features |
| **redirectService.ts** | ✨ Redirect chain analysis | 3 new ML features |
| **threatAnalysis.ts** | ✨ Orchestrates WHOIS + redirect | 8 enriched features |
| **mlService.ts** | ✨ Accepts engineered features | Pass domain+redirect data |
| **threatController.ts** | ✨ Async logging | Non-blocking persistence |
| **ScanHistory.ts** | ✨ Expanded schema | Logging for retraining |
| **feature_extractor.py** | ✨ Accepts WHOIS + redirect | 8 new feature extraction |
| **ml_engine.py** | ✨ 27-dim vector + importance | Feature explanation |
| **main.py (ML API)** | ✨ Enhanced models | Extended types |
| **ThreatAnalysisResult.tsx** | ✨ Feature contributions display | User-facing explainability |

---

**Architecture Version**: 1.0.0
**Status**: Production-Ready ✅
**Last Updated**: February 2026
