# Zampify AI — Startup Script
# Run this in PowerShell to start all services

Write-Host '==================================' -ForegroundColor Cyan
Write-Host '  Zampify AI — Starting up...' -ForegroundColor Cyan
Write-Host '==================================' -ForegroundColor Cyan

# Step 1: Start infrastructure
Write-Host ''
Write-Host '[1/4] Stopping existing conflicting containers...' -ForegroundColor Yellow
docker compose down -v
Write-Host '[1/4] Starting Docker services (Redis + PostgreSQL)...' -ForegroundColor Yellow
docker compose up -d redis postgres
Start-Sleep -Seconds 8


# Step 2: Seed the database
Write-Host ''
Write-Host '[2/4] Seeding database with sample data...' -ForegroundColor Yellow
Set-Location backend
.\venv\Scripts\Activate.ps1
python seed.py
Set-Location ..

# Step 3: Start backend
Write-Host ''
Write-Host '[3/4] Starting FastAPI backend (port 8000)...' -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList '-NoExit', '-Command', 'cd backend; .\venv\Scripts\Activate.ps1; uvicorn app.main:app --reload --port 8000' -WindowStyle Normal

# Step 4: Start ARQ worker
Write-Host ''
Write-Host '[4/4] Starting ARQ worker...' -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList '-NoExit', '-Command', 'cd backend; .\venv\Scripts\Activate.ps1; arq app.workers.settings.WorkerSettings' -WindowStyle Normal

# Step 5: Start frontend
Write-Host ''
Write-Host '[5/5] Starting Next.js frontend (port 3000)...' -ForegroundColor Yellow
Start-Process PowerShell -ArgumentList '-NoExit', '-Command', 'cd frontend; npm run dev' -WindowStyle Normal

Write-Host ''
Write-Host 'All services started!' -ForegroundColor Green
Write-Host 'Dashboard: http://localhost:3000' -ForegroundColor White
Write-Host 'API docs: http://localhost:8000/docs' -ForegroundColor White
Write-Host 'Login: sarah@zampify.ai / demo123' -ForegroundColor White
