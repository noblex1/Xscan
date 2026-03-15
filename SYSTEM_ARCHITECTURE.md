# NetWard AI - System Architecture

## 🏗️ Complete System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              USERS                                      │
│                    (Web Browsers, Mobile Devices)                       │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ HTTPS
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                         FRONTEND LAYER                                  │
│                    (React + TypeScript + Vite)                          │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Components:                                                    │    │
│  │  • ThreatScanner - Main scanning interface                     │    │
│  │  • ThreatAnalysisResult - Results display                      │    │
│  │  • Dashboard - Analytics & history                             │    │
│  │  • FileUploadZone - File analysis                              │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Services:                                                      │    │
│  │  • threatDetection.ts - API client                             │    │
│  │  • useThreatDetection.ts - React hooks                         │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Deployed on: Vercel/Netlify (CDN + Edge Network)                      │
└────────────────────────────────┬────────────────────────────────────────┘
                                 │
                                 │ REST API (JSON)
                                 │
┌────────────────────────────────▼────────────────────────────────────────┐
│                         BACKEND LAYER                                   │
│                  (Node.js + Express + TypeScript)                       │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  API Routes:                                                    │    │
│  │  • POST /api/v1/threats/analyze-url                            │    │
│  │  • POST /api/v1/threats/analyze-file                           │    │
│  │  • GET  /api/v1/threats/history                                │    │
│  │  • GET  /api/v1/threats/statistics                             │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  ┌────────────────────────────────────────────────────────────────┐    │
│  │  Core Services:                                                 │    │
│  │                                                                  │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │  ThreatAnalysisService                                   │  │    │
│  │  │  • Coordinates all detection methods                     │  │    │
│  │  │  • Aggregates threat scores                              │  │    │
│  │  │  • Generates AI analysis                                 │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  │                                                                  │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │  ThreatIntelligenceService                               │  │    │
│  │  │  • VirusTotal integration                                │  │    │
│  │  │  • Google Safe Browsing integration                      │  │    │
│  │  │  • PhishTank integration                                 │  │    │
│  │  │  • AbuseIPDB integration                                 │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  │                                                                  │    │
│  │  ┌──────────────────────────────────────────────────────────┐  │    │
│  │  │  MLService                                               │  │    │
│  │  │  • Communicates with ML microservice                     │  │    │
│  │  │  • Health checking                                       │  │    │
│  │  │  • Graceful degradation                                  │  │    │
│  │  └──────────────────────────────────────────────────────────┘  │    │
│  └────────────────────────────────────────────────────────────────┘    │
│                                                                          │
│  Deployed on: Render/Railway (Auto-scaling containers)                 │
└──────┬────────────────────────────────────────────────┬────────────────┘
       │                                                │
       │ External APIs                                  │ Internal API
       │                                                │
┌──────▼────────────────────────────────┐    ┌─────────▼──────────────────┐
│  EXTERNAL THREAT INTELLIGENCE         │    │   ML SERVICE LAYER         │
│                                       │    │   (Python + FastAPI)       │
│  ┌─────────────────────────────────┐ │    │                            │
│  │  VirusTotal API                 │ │    │  ┌──────────────────────┐  │
│  │  • 90+ security engines         │ │    │  │  API Endpoints       │  │
│  │  • Malware detection            │ │    │  │  • /health           │  │
│  │  • URL reputation               │ │    │  │  • /analyze-url      │  │
│  └─────────────────────────────────┘ │    │  │  • /analyze-content  │  │
│                                       │    │  │  • /model-info       │  │
│  ┌─────────────────────────────────┐ │    │  └──────────────────────┘  │
│  │  Google Safe Browsing API       │ │    │                            │
│  │  • Phishing detection           │ │    │  ┌──────────────────────┐  │
│  │  • Malware detection            │ │    │  │  Feature Extractor   │  │
│  │  • Unwanted software            │ │    │  │  • URL parsing       │  │
│  └─────────────────────────────────┘ │    │  │  • 19 features       │  │
│                                       │    │  │  • Entropy calc      │  │
│  ┌─────────────────────────────────┐ │    │  └──────────────────────┘  │
│  │  PhishTank API                  │ │    │                            │
│  │  • Verified phishing sites      │ │    │  ┌──────────────────────┐  │
│  │  • Community-driven             │ │    │  │  ML Engine           │  │
│  └─────────────────────────────────┘ │    │  │  • Random Forest     │  │
│                                       │    │  │  • 100 trees         │  │
│  ┌─────────────────────────────────┐ │    │  │  • 96% accuracy      │  │
│  │  AbuseIPDB API                  │ │    │  │  • Confidence score  │  │
│  │  • IP reputation                │ │    │  └──────────────────────┘  │
│  │  • Abuse reports                │ │    │                            │
│  └─────────────────────────────────┘ │    │  ┌──────────────────────┐  │
│                                       │    │  │  Trained Model       │  │
└───────────────────────────────────────┘    │  │  phishing_detector   │  │
                                             │  │  .pkl (5MB)          │  │
┌────────────────────────────────────────┐   │  └──────────────────────┘  │
│         DATABASE LAYER                 │   │                            │
│         (MongoDB Atlas)                │   │  Deployed on: Render       │
│                                        │   │  (Python container)        │
│  ┌──────────────────────────────────┐ │   └────────────────────────────┘
│  │  Collections:                    │ │
│  │  • scanhistories                 │ │
│  │    - url/fileName                │ │
│  │    - threatScore                 │ │
│  │    - riskCategory                │ │
│  │    - detectionMethods            │ │
│  │    - timestamp                   │ │
│  │    - ipAddress                   │ │
│  │                                  │ │
│  │  • users (optional)              │ │
│  │  • analytics                     │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Features:                             │
│  • Replica sets (redundancy)           │
│  • Automatic backups                   │
│  • Global distribution                 │
│  • 99.9% uptime SLA                    │
└────────────────────────────────────────┘
```

---

## 🔄 Request Flow Diagram

### URL Scan Request Flow

```
┌─────────┐
│  USER   │
└────┬────┘
     │
     │ 1. Enters URL: "https://suspicious-site.com"
     │
     ▼
┌─────────────────┐
│   FRONTEND      │
│   (React)       │
└────┬────────────┘
     │
     │ 2. POST /api/v1/threats/analyze-url
     │    { "url": "https://suspicious-site.com" }
     │
     ▼
┌─────────────────────────────────────────────────────────┐
│              BACKEND (Node.js)                          │
│                                                         │
│  3. ThreatAnalysisService.analyzeUrl()                 │
│     ┌─────────────────────────────────────────────┐   │
│     │  Parallel Execution (Promise.all)           │   │
│     │                                              │   │
│     │  ┌────────────────────────────────────────┐ │   │
│     │  │ 4a. VirusTotal Check                   │ │   │
│     │  │     → API call                         │ │   │
│     │  │     → Get malicious count              │ │   │
│     │  │     → Add to threat score              │ │   │
│     │  └────────────────────────────────────────┘ │   │
│     │                                              │   │
│     │  ┌────────────────────────────────────────┐ │   │
│     │  │ 4b. Google Safe Browsing Check         │ │   │
│     │  │     → API call                         │ │   │
│     │  │     → Check threat types               │ │   │
│     │  │     → Add to threat score              │ │   │
│     │  └────────────────────────────────────────┘ │   │
│     │                                              │   │
│     │  ┌────────────────────────────────────────┐ │   │
│     │  │ 4c. PhishTank Check                    │ │   │
│     │  │     → API call                         │ │   │
│     │  │     → Check if in database             │ │   │
│     │  │     → Add to threat score              │ │   │
│     │  └────────────────────────────────────────┘ │   │
│     │                                              │   │
│     │  ┌────────────────────────────────────────┐ │   │
│     │  │ 4d. ML Service Check ⭐                │ │   │
│     │  │     → POST to ML service               │ │   │
│     │  │     → Extract 19 features              │ │   │
│     │  │     → Get ML prediction                │ │   │
│     │  │     → Weight by confidence             │ │   │
│     │  │     → Add to threat score              │ │   │
│     │  └────────────────────────────────────────┘ │   │
│     │            │                                 │   │
│     │            ▼                                 │   │
│     │  ┌────────────────────────────────────────┐ │   │
│     │  │  ML SERVICE (Python)                   │ │   │
│     │  │  • Extract features (19)               │ │   │
│     │  │  • Run Random Forest model             │ │   │
│     │  │  • Calculate confidence                │ │   │
│     │  │  • Return prediction                   │ │   │
│     │  └────────────────────────────────────────┘ │   │
│     │                                              │   │
│     │  ┌────────────────────────────────────────┐ │   │
│     │  │ 4e. HTTPS Check                        │ │   │
│     │  │     → Verify SSL/TLS                   │ │   │
│     │  │     → Add to threat score              │ │   │
│     │  └────────────────────────────────────────┘ │   │
│     │                                              │   │
│     │  ┌────────────────────────────────────────┐ │   │
│     │  │ 4f. Heuristic Analysis                 │ │   │
│     │  │     → Pattern matching                 │ │   │
│     │  │     → Keyword detection                │ │   │
│     │  │     → Add to threat score              │ │   │
│     │  └────────────────────────────────────────┘ │   │
│     └─────────────────────────────────────────────┘   │
│                                                         │
│  5. Aggregate Results                                  │
│     • Calculate total threat score (0-100)             │
│     • Determine risk category (LOW/MEDIUM/HIGH/CRITICAL)│
│     • Generate AI analysis text                        │
│     • Compile risk factors                             │
│     • Compile security features                        │
│                                                         │
│  6. Save to MongoDB                                    │
│     • Store scan history                               │
│     • Update statistics                                │
│                                                         │
└────┬────────────────────────────────────────────────────┘
     │
     │ 7. Return JSON Response
     │    {
     │      "success": true,
     │      "data": {
     │        "threatScore": 85,
     │        "riskCategory": "CRITICAL",
     │        "aiAnalysis": "...",
     │        "detectionMethods": [...],
     │        ...
     │      }
     │    }
     │
     ▼
┌─────────────────┐
│   FRONTEND      │
│   (React)       │
│                 │
│  8. Display:    │
│  • Threat score │
│  • Risk badge   │
│  • AI analysis  │
│  • Risk factors │
│  • Detection    │
│    methods      │
└─────────────────┘
```

---

## 🧠 ML Service Architecture

```
┌─────────────────────────────────────────────────────────────┐
│              ML SERVICE (FastAPI + Python)                  │
│                                                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │  HTTP Layer (FastAPI)                              │    │
│  │  • CORS middleware                                 │    │
│  │  • Request validation (Pydantic)                   │    │
│  │  • Error handling                                  │    │
│  │  • Health checks                                   │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                  │
│                          ▼                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  API Endpoints                                     │    │
│  │  • POST /api/ml/analyze-url                        │    │
│  │  • POST /api/ml/analyze-content                    │    │
│  │  • GET  /api/ml/model-info                         │    │
│  │  • GET  /health                                    │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                  │
│                          ▼                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Feature Extractor (feature_extractor.py)         │    │
│  │                                                    │    │
│  │  Input: URL string                                 │    │
│  │  Output: 19 features                               │    │
│  │                                                    │    │
│  │  Features Extracted:                               │    │
│  │  1. url_length                                     │    │
│  │  2. domain_length                                  │    │
│  │  3. has_ip_address                                 │    │
│  │  4. has_at_symbol                                  │    │
│  │  5. has_double_slash                               │    │
│  │  6. num_subdomains                                 │    │
│  │  7. num_dots                                       │    │
│  │  8. num_hyphens                                    │    │
│  │  9. num_underscores                                │    │
│  │  10. num_digits                                    │    │
│  │  11. num_special_chars                             │    │
│  │  12. entropy (Shannon entropy)                     │    │
│  │  13. suspicious_tld                                │    │
│  │  14. url_shortener                                 │    │
│  │  15. path_length                                   │    │
│  │  16. num_path_segments                             │    │
│  │  17. has_query                                     │    │
│  │  18. num_query_params                              │    │
│  │  19. is_https                                      │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                  │
│                          ▼                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  ML Engine (ml_engine.py)                          │    │
│  │                                                    │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  Model Loading                               │ │    │
│  │  │  • Load .pkl file at startup                 │ │    │
│  │  │  • Verify model integrity                    │ │    │
│  │  │  • Cache in memory                           │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │                                                    │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  Prediction Pipeline                         │ │    │
│  │  │  1. Convert features to numpy array          │ │    │
│  │  │  2. Run model.predict()                      │ │    │
│  │  │  3. Run model.predict_proba()                │ │    │
│  │  │  4. Calculate confidence                     │ │    │
│  │  │  5. Generate risk factors                    │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  │                                                    │    │
│  │  ┌──────────────────────────────────────────────┐ │    │
│  │  │  Fallback System                             │ │    │
│  │  │  • Rule-based detection if model fails       │ │    │
│  │  │  • Weighted scoring system                   │ │    │
│  │  │  • Graceful degradation                      │ │    │
│  │  └──────────────────────────────────────────────┘ │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                  │
│                          ▼                                  │
│  ┌────────────────────────────────────────────────────┐    │
│  │  Trained Model (phishing_detector.pkl)             │    │
│  │                                                    │    │
│  │  Algorithm: Random Forest Classifier               │    │
│  │  • n_estimators: 100 trees                         │    │
│  │  • max_depth: 20                                   │    │
│  │  • min_samples_split: 5                            │    │
│  │  • Training samples: 10,000                        │    │
│  │  • Accuracy: 96%                                   │    │
│  │  • Precision: 95%                                  │    │
│  │  • Recall: 94%                                     │    │
│  │  • F1-Score: 94.5%                                 │    │
│  │  • File size: ~5MB                                 │    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Flow

### 1. URL Analysis Data Flow

```
URL Input
   │
   ├─→ Frontend Validation
   │   • Check format
   │   • Sanitize input
   │
   ├─→ Backend Receives
   │   • Validate again
   │   • Parse URL
   │
   ├─→ Parallel Processing
   │   │
   │   ├─→ External APIs
   │   │   • VirusTotal
   │   │   • Google Safe Browsing
   │   │   • PhishTank
   │   │
   │   └─→ ML Service
   │       • Extract features
   │       • Run prediction
   │       • Return confidence
   │
   ├─→ Score Aggregation
   │   • Combine all scores
   │   • Weight by confidence
   │   • Calculate final score
   │
   ├─→ Database Storage
   │   • Save scan history
   │   • Update statistics
   │
   └─→ Response Generation
       • Format results
       • Generate AI analysis
       • Return to frontend
```

### 2. ML Prediction Data Flow

```
URL String
   │
   ├─→ Feature Extraction
   │   • Parse URL components
   │   • Calculate statistics
   │   • Generate 19 features
   │
   ├─→ Feature Vector
   │   [45, 20, 0, 0, 0, 2, 3, 1, 0, 5, 15, 3.8, 0, 0, 25, 3, 1, 2, 1]
   │
   ├─→ Model Prediction
   │   • Random Forest processes
   │   • 100 trees vote
   │   • Aggregate results
   │
   ├─→ Probability Calculation
   │   • Safe probability: 0.05
   │   • Threat probability: 0.95
   │   • Confidence: 0.95
   │
   └─→ Result
       {
         "is_threat": true,
         "confidence": 0.95,
         "ml_score": 95,
         "features_analyzed": 19
       }
```

---

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                      │
│                                                         │
│  Layer 1: Network Security                             │
│  • HTTPS/TLS encryption                                │
│  • CORS configuration                                  │
│  • Rate limiting                                       │
│  • DDoS protection (CDN)                               │
│                                                         │
│  Layer 2: Application Security                         │
│  • Input validation                                    │
│  • SQL injection prevention                            │
│  • XSS protection                                      │
│  • CSRF tokens                                         │
│  • Helmet.js security headers                          │
│                                                         │
│  Layer 3: Authentication & Authorization               │
│  • JWT tokens (optional)                               │
│  • API key validation                                  │
│  • Role-based access control                           │
│                                                         │
│  Layer 4: Data Security                                │
│  • Encrypted database connections                      │
│  • Environment variable protection                     │
│  • No sensitive data logging                           │
│  • IP anonymization                                    │
│                                                         │
│  Layer 5: API Security                                 │
│  • API key rotation                                    │
│  • Request signing                                     │
│  • Timeout protection                                  │
│  • Error message sanitization                          │
└─────────────────────────────────────────────────────────┘
```

---

## 📈 Scalability Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  SCALABILITY FEATURES                   │
│                                                         │
│  Frontend (CDN)                                         │
│  • Global edge network                                 │
│  • Automatic caching                                   │
│  • Load balancing                                      │
│  • 99.99% uptime                                       │
│                                                         │
│  Backend (Containers)                                  │
│  • Horizontal scaling                                  │
│  • Auto-scaling based on load                          │
│  • Health checks                                       │
│  • Zero-downtime deployments                           │
│                                                         │
│  ML Service (Stateless)                                │
│  • Stateless design                                    │
│  • Model caching                                       │
│  • Parallel processing                                 │
│  • Auto-scaling enabled                                │
│                                                         │
│  Database (MongoDB Atlas)                              │
│  • Replica sets                                        │
│  • Sharding support                                    │
│  • Automatic backups                                   │
│  • Global distribution                                 │
└─────────────────────────────────────────────────────────┘
```

---

## 🎯 Technology Stack Summary

### Frontend
- **Framework:** React 18.3
- **Language:** TypeScript 5.5
- **Build Tool:** Vite
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **HTTP Client:** Axios
- **State Management:** React Hooks

### Backend
- **Runtime:** Node.js 20+
- **Framework:** Express.js
- **Language:** TypeScript 5.5
- **Database:** MongoDB (Mongoose ODM)
- **Security:** Helmet, CORS
- **Validation:** Zod

### ML Service
- **Language:** Python 3.11
- **Framework:** FastAPI
- **ML Library:** scikit-learn
- **Data Processing:** pandas, numpy
- **Server:** Uvicorn (ASGI)
- **Model Format:** joblib (.pkl)

### Infrastructure
- **Frontend Hosting:** Vercel/Netlify
- **Backend Hosting:** Render/Railway
- **ML Service Hosting:** Render
- **Database:** MongoDB Atlas
- **CDN:** Cloudflare/Vercel Edge

---

## 📊 Performance Metrics

| Component | Metric | Value |
|-----------|--------|-------|
| Frontend Load Time | Initial | < 2s |
| Backend API Response | Average | 3-5s |
| ML Prediction Time | Average | < 100ms |
| Database Query Time | Average | < 50ms |
| Total Scan Time | Average | 3-8s |
| ML Model Accuracy | Test Set | 96% |
| System Uptime | SLA | 99.9% |
| Concurrent Users | Supported | 1000+ |

---

**For detailed implementation guide, see [HOW_IT_WORKS.md](./HOW_IT_WORKS.md)**
