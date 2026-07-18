Here are the direct commands you can run in separate PowerShell windows to start each service manually:

**1. Start Database & Redis (Docker)**
Run this in the project root (`Zampify-AI`):
```powershell
docker compose up -d redis postgres
```
*(Wait a few seconds for them to boot, then optionally run `cd backend; .\venv\Scripts\Activate.ps1; python seed.py` to seed the database).*

**2. Start FastAPI Backend**
Open a new terminal in the project root:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --port 8000 --reload
```

**3. Start ARQ Background Worker**
Open a new terminal in the project root:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
arq app.workers.settings.WorkerSettings --watch app
```

**4. Start Email Ingestion Poller (To fetch emails)**
Open a new terminal in the project root:
```powershell
cd backend
.\venv\Scripts\Activate.ps1
python -m app.services.email_ingestion
```

**5. Start Next.js Frontend**
Open a new terminal in the project root:
```powershell
cd frontend
npm run dev
```