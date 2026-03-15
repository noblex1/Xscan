# NetWard AI - System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│                    (React + TypeScript + Vite)                  │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │
│  │ URL Scanner  │  │ File Upload  │  │   Results    │        │
│  │   Component  │  │   Component  │  │   Display    │        │
│  └──────────────┘  └──────────────┘  └──────────────┘        │
│                                                                 │
│  Port: 8080 (Vite Dev Server)                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │ HTTP/REST
                         │ (Axios)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND API SERVER                         │
│                   (Node.js + Express + TypeScript)              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    API Routes                            │  │
│  │  POST /api/v1/threats/analyze-url                       │  │
│  │  POST /api/v1/threats/analyze-file                      │  │
│  │  GET  /api/v1/threats/history                           │  │
│  │  GET  /api/v1/threats/statistics                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                 Threat Analysis Service                  │  │
│  │  • Orchestrates all detection methods                   │  │
│  │  • Combines scores from multiple sources                │  │
│  │  • Generates final threat report                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Port: 3000                                                     │
└───┬─────────┬─────────┬─────────┬─────────┬────────────────────┘
    │         │         │         │         │
    │         │         │         │         │
    ▼         ▼         ▼         ▼         ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌──────────────────┐
│ Virus  │ │ Google │ │ Phish  │ │   ML   │ │    MongoDB       │
│ Total  │ │  Safe  │ │  Tank  │ │ Service│ │   (Database)     │
│  API   │ │Browsing│ │  API   │ │        │ │                  │
└────────┘ └────────┘ └────────┘ └────┬───┘ │ • Scan History   │
                                       │     │ • Statistics     │
                                       │     │ • User Data      │
                                       │     │                  │
                                       │     │ Port: 27017      │
                                       │     └──────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                      ML MICROSERVICE                            │
│                   (Python + FastAPI + scikit-learn)             │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                    ML API Routes                         │  │
│  │  POST /api/ml/analyze-url                                │  │
│  │  POST /api/ml/analyze-content                            │  │
│  │  GET  /api/ml/model-info                                 │  │
│  │  GET  /health                                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Feature Extractor                           │  │
│  │  • Extracts 19+ features from URLs                       │  │
│  │  • Content analysis (HTML, scripts, forms)               │  │
│  │  • Entropy calculation                                   │  │
│  │  • Pattern detection                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                   ML Engine                              │  │
│  │  • Random Forest Classifier (100 trees)                  │  │
│  │  • Prediction with confidence scoring                    │  │
│  │  • Fallback rule-based system                            │  │
│  │  • Model versioning                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Trained ML Model                            │  │
│  │  • phishing_detector.pkl (Random Forest)                 │  │
│  │  • 96% accuracy, 95% precision, 94% recall               │  │
│  │  • Trained on 10,000 samples                             │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
│  Port: 5000                                                     │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### URL Analysis Flow

```
1. User Input
   └─> User enters URL in frontend
       └─> "http://suspicious-site.tk/verify"

2. Frontend Processing
   └─> Validates input
   └─> Shows loading state
   └─> Sends POST to backend
       └─> POST /api/v1/threats/analyze-url

3. Backend Orchestration (Parallel Execution)
   ├─> VirusTotal API
   │   └─> Checks against 70+ antivirus engines
   │   └─> Returns: malicious=5, suspicious=2
   │
   ├─> Google Safe Browsing API
   │   └─> Checks threat database
   │   └─> Returns: MALWARE detected
   │
   ├─> PhishTank API
   │   └─> Checks phishing database
   │   └─> Returns: Not in database
   │
   ├─> ML Service
   │   └─> POST /api/ml/analyze-url
   │   └─> Extracts 19 features
   │   └─> Feeds to Random Forest
   │   └─> Returns: threat=true, confidence=0.94, score=94
   │
   └─> Heuristic Analysis
       └─> Pattern matching
       └─> SSL check
       └─> URL structure analysis

4. Score Calculation
   └─> ML: 94 * 0.94 = 88 points
   └─> VirusTotal: 5 * 10 = 50 points
   └─> Google: 60 points
   └─> PhishTank: 0 points
   └─> Heuristics: 25 points (no HTTPS)
   └─> Total: min(223, 100) = 100 points
   └─> Category: CRITICAL

5. Database Storage
   └─> Save to MongoDB
       └─> Collection: scan_history
       └─> Fields: url, score, category, timestamp, etc.

6. Response Generation
   └─> Combine all results
   └─> Generate AI analysis text
   └─> Format detection methods
   └─> List risk factors
   └─> Return JSON response

7. Frontend Display
   └─> Parse response
   └─> Show threat score with color
   └─> Display detection methods
   └─> Show risk factors
   └─> Enable PDF/JSON download
```

## 🧩 Component Breakdown

### Frontend Components

```
src/
├── App.tsx                      # Main app component
├── pages/
│   └── Index.tsx               # Main page (renders ThreatScanner)
├── components/
│   ├── ThreatScanner.tsx       # Main scanner interface
│   ├── ThreatAnalysisResult.tsx # Results display
│   ├── FileUploadZone.tsx      # File upload component
│   └── ThemeToggle.tsx         # Dark/light mode toggle
├── hooks/
│   └── useThreatDetection.ts   # API communication hook
├── api/
│   └── threatDetection.ts      # Axios API client
└── utils/
    └── pdfGenerator.ts         # PDF report generation
```

### Backend Services

```
backend/src/
├── server.ts                    # Express app setup
├── routes/
│   └── threatRoutes.ts         # API route definitions
├── controllers/
│   └── threatController.ts     # Request handlers
├── services/
│   ├── threatAnalysis.ts       # Main analysis orchestration
│   ├── threatIntelligence.ts   # External API integrations
│   └── mlService.ts            # ML service client
├── models/
│   └── ScanHistory.ts          # MongoDB schema
├── middleware/
│   ├── errorHandler.ts         # Error handling
│   └── rateLimiter.ts          # Rate limiting
└── config/
    ├── env.ts                  # Environment config
    ├── database.ts             # MongoDB connection
    └── swagger.ts              # API documentation
```

### ML Service Structure

```
ml-service/
├── app/
│   ├── main.py                 # FastAPI application
│   ├── ml_engine.py            # ML model wrapper
│   ├── feature_extractor.py    # Feature engineering
│   ├── train_model.py          # Training script
│   └── models/
│       ├── phishing_detector.pkl    # Trained model
│       └── model_metadata.json      # Model info
└── requirements.txt            # Python dependencies
```

## 📊 Data Flow

### Feature Extraction Pipeline

```
URL Input: "http://paypal-verify.suspicious-domain.tk/account/login"
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│              URL Parsing & Analysis                         │
├─────────────────────────────────────────────────────────────┤
│ • Parse with urlparse()                                     │
│ • Extract domain with tldextract                            │
│ • Calculate entropy                                         │
│ • Count special characters                                  │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│              Extracted Features                             │
├─────────────────────────────────────────────────────────────┤
│ url_length: 58                                              │
│ domain_length: 28                                           │
│ has_ip_address: False                                       │
│ has_at_symbol: False                                        │
│ has_double_slash: False                                     │
│ num_subdomains: 1                                           │
│ num_dots: 4                                                 │
│ num_hyphens: 2                                              │
│ num_underscores: 0                                          │
│ num_digits: 0                                               │
│ num_special_chars: 12                                       │
│ entropy: 4.2                                                │
│ suspicious_tld: True (.tk)                                  │
│ url_shortener: False                                        │
│ path_length: 14                                             │
│ num_path_segments: 2                                        │
│ has_query: False                                            │
│ num_query_params: 0                                         │
│ is_https: False                                             │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│           Feature Vector (NumPy Array)                      │
├─────────────────────────────────────────────────────────────┤
│ [58, 28, 0, 0, 0, 1, 4, 2, 0, 0, 12, 4.2, 1, 0, 14, 2, 0, 0, 0] │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│         Random Forest Classifier (100 trees)                │
├─────────────────────────────────────────────────────────────┤
│ Tree 1: Threat (0.95)                                       │
│ Tree 2: Threat (0.98)                                       │
│ Tree 3: Threat (0.92)                                       │
│ ...                                                         │
│ Tree 100: Threat (0.96)                                     │
│                                                             │
│ Average: 94 trees vote "Threat", 6 vote "Safe"             │
└─────────────────────────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                  ML Prediction                              │
├─────────────────────────────────────────────────────────────┤
│ is_threat: True                                             │
│ confidence: 0.94                                            │
│ threat_probability: 0.94                                    │
│ safe_probability: 0.06                                      │
│ ml_score: 94                                                │
└─────────────────────────────────────────────────────────────┘
```

## 🔐 Security Architecture

### Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Layer 1: Frontend                        │
├─────────────────────────────────────────────────────────────┤
│ • Input validation                                          │
│ • XSS protection (React escaping)                           │
│ • HTTPS enforcement                                         │
│ • Content Security Policy                                   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layer 2: Backend API                     │
├─────────────────────────────────────────────────────────────┤
│ • Rate limiting (100 req/15min)                             │
│ • CORS configuration                                        │
│ • Helmet security headers                                   │
│ • Request validation (Zod)                                  │
│ • Error sanitization                                        │
│ • MongoDB injection prevention                              │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layer 3: ML Service                      │
├─────────────────────────────────────────────────────────────┤
│ • Input sanitization                                        │
│ • Timeout configuration                                     │
│ • Model file permissions                                    │
│ • No sensitive data logging                                 │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Layer 4: Database                        │
├─────────────────────────────────────────────────────────────┤
│ • Authentication required                                   │
│ • Encrypted connections                                     │
│ • Parameterized queries                                     │
│ • Access control                                            │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Architecture

### Development Environment

```
Developer Machine
├── Frontend (localhost:8080)
├── Backend (localhost:3000)
├── ML Service (localhost:5000)
└── MongoDB (localhost:27017)
```

### Production Environment (Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│                      Load Balancer                          │
│                    (NGINX / CloudFlare)                     │
└────────────┬────────────────────────────────────────────────┘
             │
             ├─────────────────────────────────────────────────┐
             │                                                 │
             ▼                                                 ▼
┌──────────────────────┐                        ┌──────────────────────┐
│   Frontend (CDN)     │                        │   Backend API        │
│   Vercel / Netlify   │                        │   Render / Railway   │
│   Port: 443 (HTTPS)  │                        │   Port: 443 (HTTPS)  │
└──────────────────────┘                        └──────────┬───────────┘
                                                           │
                                    ┌──────────────────────┼──────────────────────┐
                                    │                      │                      │
                                    ▼                      ▼                      ▼
                          ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
                          │   ML Service     │  │   MongoDB Atlas  │  │  External APIs   │
                          │   Docker/AWS     │  │   (Managed DB)   │  │  VirusTotal, etc │
                          │   Port: 5000     │  │   Port: 27017    │  └──────────────────┘
                          └──────────────────┘  └──────────────────┘
```

## 📈 Scalability Architecture

### Horizontal Scaling

```
                    ┌─────────────────┐
                    │ Load Balancer   │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ Backend API  │    │ Backend API  │    │ Backend API  │
│  Instance 1  │    │  Instance 2  │    │  Instance 3  │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ ML Service   │    │ ML Service   │    │ ML Service   │
│  Instance 1  │    │  Instance 2  │    │  Instance 3  │
└──────────────┘    └──────────────┘    └──────────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  MongoDB Cluster │
                  │  (Replica Set)   │
                  └──────────────────┘
```

## 🔄 CI/CD Pipeline

```
Developer Push
    │
    ▼
┌─────────────────┐
│   GitHub Repo   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    GitHub Actions                           │
├─────────────────────────────────────────────────────────────┤
│ 1. Lint Code (ESLint, Pylint)                              │
│ 2. Run Tests (Jest, Pytest)                                │
│ 3. Build Frontend (Vite)                                    │
│ 4. Build Backend (TypeScript)                               │
│ 5. Train ML Model (if needed)                               │
│ 6. Build Docker Images                                      │
│ 7. Push to Registry                                         │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Deployment                               │
├─────────────────────────────────────────────────────────────┤
│ • Frontend → Vercel                                         │
│ • Backend → Render                                          │
│ • ML Service → AWS ECS / Docker                             │
│ • Database → MongoDB Atlas                                  │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Metrics                      │
├─────────────────────────────────────────────────────────────┤
│ • Request rate                                              │
│ • Response time                                             │
│ • Error rate                                                │
│ • ML prediction accuracy                                    │
│ • Database query performance                                │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Prometheus                               │
│                  (Metrics Collection)                       │
└────────┬────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Grafana                                  │
│                  (Visualization)                            │
├─────────────────────────────────────────────────────────────┤
│ Dashboard 1: API Performance                                │
│ Dashboard 2: ML Model Metrics                               │
│ Dashboard 3: Database Health                                │
│ Dashboard 4: Error Tracking                                 │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────┐
│                    Alerting                                 │
│              (PagerDuty / Slack)                            │
├─────────────────────────────────────────────────────────────┤
│ • High error rate → Alert                                   │
│ • Slow response time → Alert                                │
│ • ML service down → Alert                                   │
│ • Database connection issues → Alert                        │
└─────────────────────────────────────────────────────────────┘
```

---

**NetWard AI: Production-Ready Threat Detection Architecture** 🏗️

*Microservices | Scalable | Secure | Monitored*
