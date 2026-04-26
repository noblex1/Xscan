# Simple ML Service Status Check

Write-Host "Checking ML Service Status..." -ForegroundColor Cyan
Write-Host ""

$ML_URL = "https://xscan-hx2f.onrender.com"

# Test 1: Quick health check
Write-Host "Testing: $ML_URL/health" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$ML_URL/health" -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
    Write-Host "SUCCESS: ML Service is online" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED: ML Service is offline" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "Trying with longer timeout (60 seconds)..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-WebRequest -Uri "$ML_URL/health" -TimeoutSec 60 -UseBasicParsing -ErrorAction Stop
        Write-Host "SUCCESS: ML Service woke up (cold start)" -ForegroundColor Green
    } catch {
        Write-Host "FAILED: ML Service is completely down" -ForegroundColor Red
        Write-Host ""
        Write-Host "NEXT STEPS:" -ForegroundColor Yellow
        Write-Host "1. Go to: https://dashboard.render.com/" -ForegroundColor White
        Write-Host "2. Find your ML service" -ForegroundColor White
        Write-Host "3. Check status and logs" -ForegroundColor White
        Write-Host "4. Click 'Manual Deploy' to redeploy" -ForegroundColor White
        Write-Host ""
        Write-Host "OR run locally:" -ForegroundColor Yellow
        Write-Host "  cd ml-service" -ForegroundColor White
        Write-Host "  python -m venv venv" -ForegroundColor White
        Write-Host "  venv\Scripts\Activate.ps1" -ForegroundColor White
        Write-Host "  pip install -r requirements.txt" -ForegroundColor White
        Write-Host "  uvicorn app.main:app --reload" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "See IMMEDIATE_FIX_STEPS.md for detailed instructions" -ForegroundColor Cyan
