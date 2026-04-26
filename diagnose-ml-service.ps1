# ML Service Diagnostic Script
# Run this to diagnose why the ML service is offline

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Catchers AI - ML Service Diagnostic Tool            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$ML_SERVICE_URL = "https://xscan-hx2f.onrender.com"
$BACKEND_URL = "http://localhost:3000"

# Test 1: Check if ML service is reachable
Write-Host "Test 1: Checking ML Service Connectivity" -ForegroundColor Yellow
Write-Host "URL: $ML_SERVICE_URL/health" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$ML_SERVICE_URL/health" -TimeoutSec 60 -UseBasicParsing -ErrorAction Stop
    Write-Host "✓ ML Service is responding" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    
    # Check if model is loaded
    $content = $response.Content | ConvertFrom-Json
    if ($content.model_loaded -eq $true) {
        Write-Host "✓ Model is loaded" -ForegroundColor Green
    } else {
        Write-Host "✗ Model is NOT loaded" -ForegroundColor Red
    }
} catch {
    Write-Host "✗ ML Service is NOT responding" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Message -like "*Unable to connect*") {
        Write-Host ""
        Write-Host "Possible causes:" -ForegroundColor Yellow
        Write-Host "  1. Service is completely down (crashed)" -ForegroundColor Gray
        Write-Host "  2. Service is suspended (free tier limit)" -ForegroundColor Gray
        Write-Host "  3. Service is in cold start (wait 60 seconds)" -ForegroundColor Gray
        Write-Host "  4. Render platform issue" -ForegroundColor Gray
        Write-Host ""
        Write-Host "Waiting 30 seconds and retrying..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        try {
            $response = Invoke-WebRequest -Uri "$ML_SERVICE_URL/health" -TimeoutSec 60 -UseBasicParsing -ErrorAction Stop
            Write-Host "✓ ML Service woke up after cold start" -ForegroundColor Green
        } catch {
            Write-Host "✗ ML Service still not responding after 30 seconds" -ForegroundColor Red
            Write-Host ""
            Write-Host "IMMEDIATE ACTION REQUIRED:" -ForegroundColor Red
            Write-Host "1. Go to Render Dashboard: https://dashboard.render.com/" -ForegroundColor Yellow
            Write-Host "2. Find your ML service (catchers-ai-ml or xscan-hx2f)" -ForegroundColor Yellow
            Write-Host "3. Check the status and logs" -ForegroundColor Yellow
            Write-Host "4. Click 'Manual Deploy' to redeploy" -ForegroundColor Yellow
            Write-Host ""
        }
    }
}

Write-Host ""
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 2: Check local ML service files
Write-Host "Test 2: Checking Local ML Service Files" -ForegroundColor Yellow
Write-Host ""

$files = @(
    "ml-service/app/main.py",
    "ml-service/app/ml_engine.py",
    "ml-service/app/feature_extractor.py",
    "ml-service/app/train_model.py",
    "ml-service/app/models/phishing_detector.pkl",
    "ml-service/requirements.txt",
    "ml-service/.env"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✓ $file exists" -ForegroundColor Green
    } else {
        Write-Host "✗ $file missing" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 3: Check if Python is available
Write-Host "Test 3: Checking Python Installation" -ForegroundColor Yellow
Write-Host ""

try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python is installed: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python is not installed or not in PATH" -ForegroundColor Red
    Write-Host "  Install Python 3.11 from python.org" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 4: Check backend configuration
Write-Host "Test 4: Checking Backend Configuration" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "backend/.env") {
    Write-Host "✓ backend/.env exists" -ForegroundColor Green
    
    $envContent = Get-Content "backend/.env" -Raw
    if ($envContent -match "ML_SERVICE_URL=(.+)") {
        $mlUrl = $matches[1].Trim()
        Write-Host "ML_SERVICE_URL: $mlUrl" -ForegroundColor Gray
        
        if ($mlUrl -eq "https://xscan-hx2f.onrender.com") {
            Write-Host "✓ Using production ML service" -ForegroundColor Green
        } elseif ($mlUrl -like "http://localhost:*") {
            Write-Host "⚠ Using local ML service" -ForegroundColor Yellow
        } else {
            Write-Host "⚠ Using custom ML service URL" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✗ backend/.env not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Test 5: Check render.yaml configuration
Write-Host "Test 5: Checking Deployment Configuration" -ForegroundColor Yellow
Write-Host ""

if (Test-Path "render.yaml") {
    Write-Host "✓ render.yaml exists" -ForegroundColor Green
    
    $renderContent = Get-Content "render.yaml" -Raw
    if ($renderContent -match "catchers-ai-ml") {
        Write-Host "✓ ML service configured in render.yaml" -ForegroundColor Green
    } else {
        Write-Host "✗ ML service NOT found in render.yaml" -ForegroundColor Red
    }
} else {
    Write-Host "✗ render.yaml not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "─────────────────────────────────────────────────────────" -ForegroundColor Gray
Write-Host ""

# Summary and Recommendations
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║   Diagnostic Summary                                   ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "Recommended Actions:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. IMMEDIATE: Check Render Dashboard" -ForegroundColor White
Write-Host "   → https://dashboard.render.com/" -ForegroundColor Gray
Write-Host "   → Check service status and logs" -ForegroundColor Gray
Write-Host "   → Manually redeploy if needed" -ForegroundColor Gray
Write-Host ""

Write-Host "2. TEMPORARY: Run ML service locally" -ForegroundColor White
Write-Host "   → See: RUN_ML_SERVICE_LOCALLY.md" -ForegroundColor Gray
Write-Host "   → Quick command:" -ForegroundColor Gray
Write-Host "     cd ml-service" -ForegroundColor Gray
Write-Host "     python -m venv venv" -ForegroundColor Gray
Write-Host "     venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "     pip install -r requirements.txt" -ForegroundColor Gray
Write-Host "     uvicorn app.main:app --reload" -ForegroundColor Gray
Write-Host ""

Write-Host "3. LONG-TERM: Deploy fixes" -ForegroundColor White
Write-Host "   → Commit and push all changes" -ForegroundColor Gray
Write-Host "   → Deploy to Render" -ForegroundColor Gray
Write-Host "   → Set up monitoring (UptimeRobot)" -ForegroundColor Gray
Write-Host ""

Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  • IMMEDIATE_FIX_STEPS.md - Step-by-step recovery" -ForegroundColor Gray
Write-Host "  • RUN_ML_SERVICE_LOCALLY.md - Local development setup" -ForegroundColor Gray
Write-Host "  • ML_SERVICE_COLD_START_FIX.md - Complete solution guide" -ForegroundColor Gray
Write-Host ""

Write-Host "✓ Diagnostic complete" -ForegroundColor Green
